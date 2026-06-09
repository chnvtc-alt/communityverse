import { createHmac, timingSafeEqual } from "node:crypto";
import { requireQuestionsAdmin } from "../_lib/admin-auth.mjs";
import {
  getSupabaseConfig,
  hasSupabaseConfig,
  jsonResponse,
  supabaseRequest,
} from "../_lib/supabase.mjs";

const STORAGE_BUCKETS = ["restaurant-images", "customer-photos", "question-images"];
const DOWNLOAD_TOKEN_TTL_MS = 2 * 60 * 1000;

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  return {
    dosTime:
      (date.getHours() << 11) |
      (date.getMinutes() << 5) |
      Math.floor(date.getSeconds() / 2),
    dosDate:
      ((year - 1980) << 9) |
      ((date.getMonth() + 1) << 5) |
      date.getDate(),
  };
}

function makeZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  entries.forEach((entry) => {
    const name = Buffer.from(entry.name.replace(/^\/+/, ""), "utf8");
    const data = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data);
    const checksum = crc32(data);
    const { dosDate, dosTime } = dosDateTime(entry.date || new Date());
    const localHeader = Buffer.alloc(30);

    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(data.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(name.length, 26);
    localHeader.writeUInt16LE(0, 28);
    localParts.push(localHeader, name, data);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(dosTime, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(data.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralParts.push(centralHeader, name);

    offset += localHeader.length + name.length + data.length;
  });

  const centralOffset = offset;
  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(centralOffset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirectory, end]);
}

function backupTimestamp(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, "-");
}

function base64Url(buffer) {
  return Buffer.from(buffer)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

function getBackupTokenSecret() {
  return String(process.env.QUESTIONS_ADMIN_KEY || "").trim();
}

function signBackupDownloadExpiry(expiresAt) {
  return base64Url(
    createHmac("sha256", getBackupTokenSecret())
      .update(String(expiresAt))
      .digest()
  );
}

function createBackupDownloadToken(date = new Date()) {
  const expiresAt = date.getTime() + DOWNLOAD_TOKEN_TTL_MS;
  return `${expiresAt}.${signBackupDownloadExpiry(expiresAt)}`;
}

function isValidBackupDownloadToken(token) {
  const [expiresAtRaw, signature = ""] = String(token || "").split(".");
  const expiresAt = Number(expiresAtRaw);

  if (!expiresAt || expiresAt < Date.now() || !signature || !getBackupTokenSecret()) {
    return false;
  }

  const expected = signBackupDownloadExpiry(expiresAt);
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(signature);
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

async function fetchTableRows(table) {
  const rows = [];
  const batchSize = 1000;

  for (let offset = 0; ; offset += batchSize) {
    const batch = await supabaseRequest(`${table}?select=*`, {
      headers: {
        Range: `${offset}-${offset + batchSize - 1}`,
        "Range-Unit": "items",
      },
    });
    const safeBatch = Array.isArray(batch) ? batch : [];
    rows.push(...safeBatch);
    if (safeBatch.length < batchSize) {
      break;
    }
  }

  return rows;
}

async function storageFetch(path, options = {}) {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const headers = new Headers(options.headers || {});
  headers.set("apikey", serviceRoleKey);
  headers.set("Authorization", `Bearer ${serviceRoleKey}`);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${url}/storage/v1/${path.replace(/^\/+/, "")}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || response.statusText);
  }

  return response;
}

async function listStorageObjects(bucket, prefix = "") {
  const objects = [];
  const limit = 1000;

  for (let offset = 0; ; offset += limit) {
    let rows;
    try {
      const response = await storageFetch(`object/list/${bucket}`, {
        method: "POST",
        body: JSON.stringify({
          prefix,
          limit,
          offset,
          sortBy: { column: "name", order: "asc" },
        }),
      });
      rows = await response.json();
    } catch {
      return objects;
    }

    const safeRows = Array.isArray(rows) ? rows : [];
    for (const row of safeRows) {
      const name = String(row?.name || "").trim();
      if (!name || name === ".emptyFolderPlaceholder") {
        continue;
      }

      const objectPath = prefix ? `${prefix}/${name}` : name;
      const isFolder = !row.id && !row.metadata;
      if (isFolder) {
        objects.push(...(await listStorageObjects(bucket, objectPath)));
      } else {
        objects.push({
          bucket,
          path: objectPath,
          updatedAt: row.updated_at || row.created_at || "",
        });
      }
    }

    if (safeRows.length < limit) {
      break;
    }
  }

  return objects;
}

async function downloadStorageObject(bucket, objectPath) {
  const response = await storageFetch(`object/${bucket}/${objectPath}`, { method: "GET" });
  return Buffer.from(await response.arrayBuffer());
}

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const action = requestUrl.searchParams.get("action") || "";
  const downloadToken = requestUrl.searchParams.get("downloadToken") || "";

  if (action === "download-link") {
    const denied = requireQuestionsAdmin(request);
    if (denied) return denied;

    const token = createBackupDownloadToken();
    return jsonResponse({
      ok: true,
      downloadUrl: `/api/admin/backup?downloadToken=${encodeURIComponent(token)}`,
      expiresInSeconds: DOWNLOAD_TOKEN_TTL_MS / 1000,
    });
  }

  if (!isValidBackupDownloadToken(downloadToken)) {
    const denied = requireQuestionsAdmin(request);
    if (denied) return denied;
  }

  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase is not configured." }, 503);
  }

  try {
    const createdAt = new Date();
    const tables = {
      restaurants: await fetchTableRows("restaurants"),
      customers: await fetchTableRows("customers"),
      questions: await fetchTableRows("questions"),
      profiles: await fetchTableRows("profiles"),
      sessions: await fetchTableRows("sessions"),
    };
    const storageObjects = (
      await Promise.all(STORAGE_BUCKETS.map((bucket) => listStorageObjects(bucket)))
    ).flat();
    const entries = [
      {
        name: "README.txt",
        data: Buffer.from(
          [
            "CommunityVerse Restaurant Challenge backup",
            "",
            "Keep this ZIP private and safe.",
            "",
            "data.json contains Supabase database rows for restaurants, customers, questions, profiles, and sessions.",
            "images/ contains uploaded files from Supabase Storage buckets.",
            "Website code is backed up separately in GitHub.",
            "",
            `Created at: ${createdAt.toISOString()}`,
            "",
          ].join("\n")
        ),
        date: createdAt,
      },
      {
        name: "data.json",
        data: Buffer.from(
          JSON.stringify(
            {
              backupVersion: 1,
              createdAt: createdAt.toISOString(),
              note: "Private admin backup. Keep this ZIP somewhere safe.",
              counts: Object.fromEntries(
                Object.entries(tables).map(([table, rows]) => [table, rows.length])
              ),
              storage: {
                buckets: STORAGE_BUCKETS,
                objectCount: storageObjects.length,
                objects: storageObjects,
              },
              tables,
            },
            null,
            2
          )
        ),
        date: createdAt,
      },
    ];

    for (const object of storageObjects) {
      try {
        entries.push({
          name: `images/${object.bucket}/${object.path}`,
          data: await downloadStorageObject(object.bucket, object.path),
          date: object.updatedAt ? new Date(object.updatedAt) : createdAt,
        });
      } catch {
        entries.push({
          name: `images/${object.bucket}/${object.path}.backup-missing.txt`,
          data: Buffer.from(`Could not download ${object.bucket}/${object.path} during backup.`),
          date: createdAt,
        });
      }
    }

    const zip = makeZip(entries);
    const filename = `communityverse-backup-${backupTimestamp(createdAt)}.zip`;

    return new Response(zip, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(zip.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
}
