import { saveBackofficeCollection } from "./backoffice-admin.mjs";

const PAYMENT_LINK = "https://www.paypal.com/ncp/payment/HSHM25X6JZFZ4";
const DEFAULT_TEST_EMAIL = "communityversegames@gmail.com";
const INVOICE_SENDER = {
  business: "CommunityVerse Games",
  street: "3155 Waterplace Cove",
  cityStateZip: "Villa Rica, GA 30180",
  phone: "404-428-6302",
};

function safeString(value) {
  return String(value || "").trim();
}

function moneyValue(value) {
  const trimmed = safeString(value);
  if (!trimmed) return "";
  const amount = Number(trimmed.replace(/[$,]/g, ""));
  if (!Number.isFinite(amount)) return trimmed;
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount % 1 ? 2 : 0,
  });
}

function shortDate(value) {
  const match = safeString(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[2]}-${match[3]}-${match[1].slice(2)}` : safeString(value);
}

function invoiceMonth(value) {
  const match = safeString(value).match(/^(\d{4})-(\d{2})-\d{2}$/);
  if (!match) return "this month";
  const date = new Date(`${match[1]}-${match[2]}-01T00:00:00`);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function contactName(restaurant = {}) {
  return [restaurant.contactFirstName, restaurant.contactLastName].filter(Boolean).join(" ");
}

function contactGreeting(restaurant = {}, customerName = "there") {
  return safeString(restaurant.contactFirstName) || contactName(restaurant) || customerName;
}

function addressLines(restaurant = {}) {
  const cityStateZip = [
    restaurant.city,
    [restaurant.state, restaurant.zip].filter(Boolean).join(" "),
  ].filter(Boolean).join(", ");
  return [restaurant.street, cityStateZip].filter(Boolean);
}

function fileSafeName(value) {
  return safeString(value)
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function pdfText(value) {
  return safeString(value)
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function htmlEscape(value) {
  return safeString(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(value, maxLength = 78) {
  const words = safeString(value).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const nextLine = line ? `${line} ${word}` : word;
    if (nextLine.length > maxLength && line) {
      lines.push(line);
      line = word;
    } else {
      line = nextLine;
    }
  });
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function gameName(collection = {}, restaurant = {}, customerName = "Restaurant") {
  const savedName = safeString(restaurant.gameName);
  if (savedName) return savedName;
  const description = safeString(collection.notes);
  const match = description.match(/^(.+?)\s+(?:Partial Month|Monthly) Subscription/i);
  return match ? match[1].trim() : `${customerName} Game`;
}

function invoiceDetails(collection = {}, restaurant = {}) {
  const customerName = collection.restaurantName || restaurant.name || "Restaurant";
  return {
    customerName,
    contact: contactName(restaurant),
    greetingName: contactGreeting(restaurant, customerName),
    gameName: gameName(collection, restaurant, customerName),
    invoiceMonth: invoiceMonth(collection.dueDate),
    addressLines: addressLines(restaurant),
    description: collection.notes || "Restaurant Challenge monthly subscription.",
    amount: moneyValue(collection.amount),
    dueDate: shortDate(collection.dueDate) || "Not set",
    status: collection.status || "not-sent",
  };
}

function buildInvoicePdf(collection = {}, restaurant = {}) {
  const details = invoiceDetails(collection, restaurant);
  const lines = [];
  const addText = (text, x, y, size = 11, bold = false) => {
    lines.push(`BT /${bold ? "F2" : "F1"} ${size} Tf ${x} ${y} Td (${pdfText(text)}) Tj ET`);
  };

  addText("COMMUNITYVERSE GAMES", 48, 742, 11, true);
  addText("Invoice", 48, 710, 28, true);
  addText(collection.invoiceNumber || "Invoice", 510, 742, 12, true);
  addText(`Due ${details.dueDate}`, 470, 720, 11);

  addText("Bill To", 48, 672, 12, true);
  addText(details.customerName, 48, 652, 11, true);
  let billY = 636;
  [details.contact, ...details.addressLines].filter(Boolean).forEach((line) => {
    addText(line, 48, billY, 10);
    billY -= 14;
  });

  addText("From", 330, 672, 12, true);
  addText(INVOICE_SENDER.business, 330, 652, 10, true);
  addText(INVOICE_SENDER.street, 330, 638, 10);
  addText(INVOICE_SENDER.cityStateZip, 330, 624, 10);
  addText(INVOICE_SENDER.phone, 330, 610, 10);

  addText("Description", 48, 548, 11, true);
  addText("Amount", 500, 548, 11, true);
  lines.push("0.8 w 48 534 m 564 534 l S");
  let descriptionY = 512;
  wrapText(details.description, 76).forEach((line) => {
    addText(line, 48, descriptionY, 10);
    descriptionY -= 14;
  });
  addText(details.amount, 500, 512, 10);
  lines.push(`0.8 w 48 ${descriptionY - 6} m 564 ${descriptionY - 6} l S`);
  addText("Total Due", 48, descriptionY - 28, 12, true);
  addText(details.amount, 500, descriptionY - 28, 12, true);

  const payY = descriptionY - 76;
  addText("Pay online", 48, payY, 11, true);
  addText(PAYMENT_LINK, 48, payY - 16, 10);
  addText(`Status: ${details.status}`, 48, payY - 54, 11, true);

  const stream = lines.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Annots [7 0 R] /Contents 6 0 R >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    `<< /Type /Annot /Subtype /Link /Rect [48 ${payY - 21} 330 ${payY - 9}] /Border [0 0 0] /A << /S /URI /URI (${pdfText(PAYMENT_LINK)}) >> >>`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, "utf8").toString("base64");
}

function getResendConfig() {
  return {
    apiKey: safeString(process.env.RESEND_API_KEY),
    fromEmail: safeString(process.env.RESEND_FROM_EMAIL || "CommunityVerse Games <onboarding@resend.dev>"),
    testEmail: safeString(process.env.INVOICE_TEST_EMAIL || process.env.CONTACT_TO_EMAIL || DEFAULT_TEST_EMAIL),
    replyTo: safeString(process.env.INVOICE_REPLY_TO || process.env.CONTACT_TO_EMAIL || DEFAULT_TEST_EMAIL),
  };
}

function invoiceSubject(collection = {}, isTest = false) {
  const prefix = isTest ? "TEST - " : "";
  return `${prefix}Invoice ${collection.invoiceNumber || ""} from CommunityVerse Games`.trim();
}

function invoiceHtml(collection = {}, restaurant = {}, isTest = false) {
  const details = invoiceDetails(collection, restaurant);
  const testNote = isTest ? `<p style="margin:0 0 18px;color:#a15c00;font-weight:700;">Test send only. This was not sent to the customer.</p>` : "";
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f5f1e8;font-family:Arial,sans-serif;color:#1f2924;">
    <div style="max-width:680px;margin:0 auto;padding:28px 18px;">
      <p style="margin:0 0 12px;text-align:center;color:#637069;font-size:13px;letter-spacing:.08em;text-transform:uppercase;">Invoice ${htmlEscape(collection.invoiceNumber)} Details</p>
      <h1 style="margin:0 0 22px;text-align:center;font-size:28px;">CommunityVerse Games</h1>
      <div style="background:#dcebec;padding:26px 18px;text-align:center;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-weight:700;">DUE ${htmlEscape(details.dueDate)}</p>
        <div style="font-size:44px;font-weight:800;margin-bottom:16px;">${htmlEscape(details.amount)}</div>
        <a href="${PAYMENT_LINK}" style="display:inline-block;background:#1f6b4a;color:#fff;text-decoration:none;padding:12px 34px;border-radius:6px;font-weight:800;">Pay Now</a>
      </div>
      ${testNote}
      <p>Hi ${htmlEscape(details.greetingName)},</p>
      <p>Here is your invoice for ${htmlEscape(details.invoiceMonth)} for ${htmlEscape(details.gameName)}. Thank you for allowing us to promote your restaurant through your trivia game.</p>
      <p>You can mail a check or pay online with a credit card through PayPal, using the button above.</p>
      <p>A PDF of this invoice is attached for your records.</p>
      <hr style="border:0;border-top:1px solid #d8d0bf;margin:26px 0;" />
      <p style="margin:0;">Best Wishes,<br /><strong>Tim Collins - Game Developer</strong><br />${INVOICE_SENDER.business}</p>
    </div>
  </body>
</html>`;
}

function invoiceText(collection = {}, restaurant = {}, isTest = false) {
  const details = invoiceDetails(collection, restaurant);
  return [
    isTest ? "TEST SEND ONLY - This was not sent to the customer." : "",
    `Hi ${details.greetingName},`,
    "",
    `Here is your invoice for ${details.invoiceMonth} for ${details.gameName}. Thank you for allowing us to promote your restaurant through your trivia game.`,
    "",
    "You can mail a check or pay online with a credit card through PayPal, using this PayPal link:",
    PAYMENT_LINK,
    "",
    "A PDF of this invoice is attached for your records.",
    "",
    "Best Wishes,",
    "Tim Collins - Game Developer",
    INVOICE_SENDER.business,
  ].filter(Boolean).join("\n");
}

export async function sendBackofficeInvoiceEmail({ collection, restaurant, test = false } = {}) {
  if (!collection?.id) {
    throw new Error("Invoice was not found.");
  }
  const { apiKey, fromEmail, testEmail, replyTo } = getResendConfig();
  if (!apiKey) {
    throw new Error("Resend is not configured yet.");
  }

  const customerEmail = safeString(restaurant?.contactEmail).toLowerCase();
  const toEmail = test ? testEmail : customerEmail;
  if (!toEmail || !toEmail.includes("@")) {
    throw new Error(test ? "Test email is not configured." : "This customer does not have an email address saved yet.");
  }

  const details = invoiceDetails(collection, restaurant);
  const filename = `${fileSafeName(`${details.customerName} Invoice ${collection.invoiceNumber || ""}`) || "CommunityVerse Invoice"}.pdf`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: replyTo || undefined,
      subject: invoiceSubject(collection, test),
      html: invoiceHtml(collection, restaurant, test),
      text: invoiceText(collection, restaurant, test),
      attachments: [
        {
          filename,
          content: buildInvoicePdf(collection, restaurant),
        },
      ],
    }),
  });

  const resultText = await response.text();
  let result = null;
  try {
    result = resultText ? JSON.parse(resultText) : null;
  } catch {
    result = resultText;
  }

  if (!response.ok) {
    const errorMessage =
      result && typeof result === "object"
        ? result.message || result.error || "The invoice could not be sent."
        : "The invoice could not be sent.";
    throw new Error(errorMessage);
  }

  if (!test) {
    return {
      sentTo: toEmail,
      collection: await saveBackofficeCollection({ ...collection, status: "sent" }),
    };
  }

  return { sentTo: toEmail, collection };
}
