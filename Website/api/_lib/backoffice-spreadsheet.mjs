import { inflateRawSync } from "node:zlib";

const TEXT_DECODER = new TextDecoder("utf-8");

function decodeXml(value = "") {
  return String(value || "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function columnNumber(cellRef = "") {
  const letters = String(cellRef || "").match(/[A-Z]+/i)?.[0] || "";
  return [...letters.toUpperCase()].reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0);
}

function readUInt16(buffer, offset) {
  return buffer.readUInt16LE(offset);
}

function readUInt32(buffer, offset) {
  return buffer.readUInt32LE(offset);
}

function readZipEntries(buffer) {
  const entries = new Map();
  const endSignature = 0x06054b50;
  let endOffset = -1;
  for (let offset = buffer.length - 22; offset >= 0; offset -= 1) {
    if (readUInt32(buffer, offset) === endSignature) {
      endOffset = offset;
      break;
    }
  }
  if (endOffset < 0) {
    throw new Error("That Excel file could not be read.");
  }

  const centralDirectorySize = readUInt32(buffer, endOffset + 12);
  const centralDirectoryOffset = readUInt32(buffer, endOffset + 16);
  const centralDirectoryEnd = centralDirectoryOffset + centralDirectorySize;
  let offset = centralDirectoryOffset;

  while (offset < centralDirectoryEnd && readUInt32(buffer, offset) === 0x02014b50) {
    const method = readUInt16(buffer, offset + 10);
    const compressedSize = readUInt32(buffer, offset + 20);
    const uncompressedSize = readUInt32(buffer, offset + 24);
    const fileNameLength = readUInt16(buffer, offset + 28);
    const extraLength = readUInt16(buffer, offset + 30);
    const commentLength = readUInt16(buffer, offset + 32);
    const localHeaderOffset = readUInt32(buffer, offset + 42);
    const name = buffer.subarray(offset + 46, offset + 46 + fileNameLength).toString("utf8");

    const localNameLength = readUInt16(buffer, localHeaderOffset + 26);
    const localExtraLength = readUInt16(buffer, localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
    const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
    let data;
    if (method === 0) {
      data = compressed;
    } else if (method === 8) {
      data = inflateRawSync(compressed);
    } else {
      throw new Error("That Excel file uses a compression type this importer cannot read.");
    }
    if (uncompressedSize && data.length !== uncompressedSize) {
      data = data.subarray(0, uncompressedSize);
    }
    entries.set(name, data);
    offset += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

function readSharedStrings(entries) {
  const xml = entries.get("xl/sharedStrings.xml");
  if (!xml) {
    return [];
  }
  const text = TEXT_DECODER.decode(xml);
  return [...text.matchAll(/<si\b[\s\S]*?<\/si>/g)].map((match) => {
    const fragments = [...match[0].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((item) => decodeXml(item[1]));
    return fragments.join("");
  });
}

function sheetPath(entries) {
  if (entries.has("xl/worksheets/sheet1.xml")) {
    return "xl/worksheets/sheet1.xml";
  }
  return [...entries.keys()].find((name) => /^xl\/worksheets\/sheet\d+\.xml$/i.test(name)) || "";
}

function cellValue(cellXml, sharedStrings) {
  const type = cellXml.match(/\bt="([^"]+)"/)?.[1] || "";
  if (type === "inlineStr") {
    return decodeXml([...cellXml.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((match) => match[1]).join(""));
  }
  const raw = cellXml.match(/<v>([\s\S]*?)<\/v>/)?.[1] || "";
  if (type === "s") {
    return sharedStrings[Number(raw)] || "";
  }
  return decodeXml(raw);
}

function parseXlsx(buffer) {
  const entries = readZipEntries(buffer);
  const path = sheetPath(entries);
  if (!path) {
    throw new Error("That Excel file did not include a readable first sheet.");
  }
  const sharedStrings = readSharedStrings(entries);
  const sheetXml = TEXT_DECODER.decode(entries.get(path));
  return [...sheetXml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)]
    .map((rowMatch) => {
      const row = [];
      [...rowMatch[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)].forEach((cellMatch) => {
        const ref = cellMatch[1].match(/\br="([^"]+)"/)?.[1] || "";
        const index = Math.max(columnNumber(ref) - 1, row.length);
        row[index] = cellValue(cellMatch[0], sharedStrings).trim();
      });
      return row.map((value) => value || "");
    })
    .filter((row) => row.some((value) => String(value || "").trim()));
}

function parseCsv(text = "") {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (character === "\"" && next === "\"") {
        cell += "\"";
        index += 1;
      } else if (character === "\"") {
        quoted = false;
      } else {
        cell += character;
      }
    } else if (character === "\"") {
      quoted = true;
    } else if (character === ",") {
      row.push(cell.trim());
      cell = "";
    } else if (character === "\n") {
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = "";
    } else if (character !== "\r") {
      cell += character;
    }
  }
  row.push(cell.trim());
  rows.push(row);
  return rows.filter((record) => record.some((value) => String(value || "").trim()));
}

export function parseBackofficeProspectFile({ fileName = "", contentBase64 = "" } = {}) {
  const name = String(fileName || "").toLowerCase();
  const buffer = Buffer.from(String(contentBase64 || ""), "base64");
  const rows = name.endsWith(".csv")
    ? parseCsv(buffer.toString("utf8"))
    : parseXlsx(buffer);
  return rows.slice(0, 1000);
}
