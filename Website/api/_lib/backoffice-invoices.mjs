import { readFileSync } from "node:fs";
import { saveBackofficeCollection } from "./backoffice-admin.mjs";

const PAYMENT_LINK = "https://www.paypal.com/ncp/payment/HSHM25X6JZFZ4";
const SUBSCRIPTION_LINK = "https://communityversegames.com/subscribe/";
const LOGO_URL = "https://communityversegames.com/assets/communityverse-games-logo-transparent-cropped.png";
const PDF_LOGO_URL = new URL("../../assets/communityverse-games-logo-pdf.jpg", import.meta.url);
const PDF_LOGO_WIDTH = 230;
const PDF_LOGO_HEIGHT = 71;
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

function pdfLogoBytes() {
  try {
    return readFileSync(PDF_LOGO_URL);
  } catch {
    return null;
  }
}

function buildPdfDocument({ stream, payY, linkUrl = PAYMENT_LINK, logoBytes = null } = {}) {
  const streamBytes = Buffer.from(stream, "utf8");
  const resources = logoBytes
    ? "/Resources << /Font << /F1 4 0 R /F2 5 0 R >> /XObject << /Logo 8 0 R >> >>"
    : "/Resources << /Font << /F1 4 0 R /F2 5 0 R >> >>";
  const objects = [
    Buffer.from("<< /Type /Catalog /Pages 2 0 R >>", "utf8"),
    Buffer.from("<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "utf8"),
    Buffer.from(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] ${resources} /Annots [7 0 R] /Contents 6 0 R >>`, "utf8"),
    Buffer.from("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>", "utf8"),
    Buffer.from("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>", "utf8"),
    Buffer.concat([
      Buffer.from(`<< /Length ${streamBytes.length} >>\nstream\n`, "utf8"),
      streamBytes,
      Buffer.from("\nendstream", "utf8"),
    ]),
    Buffer.from(`<< /Type /Annot /Subtype /Link /Rect [48 ${payY - 21} 390 ${payY - 9}] /Border [0 0 0] /A << /S /URI /URI (${pdfText(linkUrl)}) >> >>`, "utf8"),
  ];
  if (logoBytes) {
    objects.push(Buffer.concat([
      Buffer.from(`<< /Type /XObject /Subtype /Image /Width 1410 /Height 434 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logoBytes.length} >>\nstream\n`, "utf8"),
      logoBytes,
      Buffer.from("\nendstream", "utf8"),
    ]));
  }

  const chunks = [Buffer.from("%PDF-1.4\n", "utf8")];
  const offsets = [0];
  let byteLength = chunks[0].length;
  objects.forEach((object, index) => {
    offsets.push(byteLength);
    const chunk = Buffer.concat([
      Buffer.from(`${index + 1} 0 obj\n`, "utf8"),
      object,
      Buffer.from("\nendobj\n", "utf8"),
    ]);
    chunks.push(chunk);
    byteLength += chunk.length;
  });
  const xrefOffset = byteLength;
  chunks.push(Buffer.from(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`, "utf8"));
  offsets.slice(1).forEach((offset) => {
    chunks.push(Buffer.from(`${String(offset).padStart(10, "0")} 00000 n \n`, "utf8"));
  });
  chunks.push(Buffer.from(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`, "utf8"));
  return Buffer.concat(chunks);
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
  const paymentType = paymentTypeFromNotes(collection.notes);
  const isRecurring = paymentType !== "manual";
  return {
    customerName,
    paymentType,
    isRecurring,
    paymentTypeLabel: isRecurring ? "Recurring Monthly" : "Manual Invoice",
    contact: contactName(restaurant),
    greetingName: contactGreeting(restaurant, customerName),
    gameName: gameName(collection, restaurant, customerName),
    invoiceMonth: invoiceMonth(collection.dueDate),
    addressLines: addressLines(restaurant),
    description: stripPaymentTypeNote(collection.notes) || "Restaurant Challenge monthly subscription.",
    amount: moneyValue(collection.amount),
    dueDate: shortDate(collection.dueDate) || "Not set",
    status: collection.status || "not-sent",
  };
}

function paymentTypeFromNotes(notes = "") {
  const match = safeString(notes).match(/\bPayment type:\s*(Recurring monthly subscription|Manual one-time invoice)\./i);
  if (!match) {
    return "manual";
  }
  return /manual/i.test(match[1]) ? "manual" : "recurring";
}

function stripPaymentTypeNote(notes = "") {
  return safeString(notes)
    .replace(/\bPayment type:\s*(?:Recurring monthly subscription|Manual one-time invoice)\.\s*/i, "")
    .trim();
}

function recurringPaymentLink(collection = {}, restaurant = {}) {
  const params = new URLSearchParams();
  const invoiceNumber = safeString(collection.invoiceNumber);
  if (invoiceNumber) {
    params.set("invoice", invoiceNumber);
  }
  const query = params.toString();
  return query ? `${SUBSCRIPTION_LINK}?${query}` : SUBSCRIPTION_LINK;
}

function recurringPaymentDisplayLink() {
  return "communityversegames.com/subscribe/";
}

function buildInvoicePdf(collection = {}, restaurant = {}) {
  const details = invoiceDetails(collection, restaurant);
  const subscriptionLink = recurringPaymentLink(collection, restaurant);
  const primaryLink = details.isRecurring ? subscriptionLink : PAYMENT_LINK;
  const lines = [];
  const addText = (text, x, y, size = 11, bold = false) => {
    lines.push(`BT /${bold ? "F2" : "F1"} ${size} Tf ${x} ${y} Td (${pdfText(text)}) Tj ET`);
  };
  const addPanel = (x, y, width, height, fill = "0.86 0.92 0.92", stroke = "0.73 0.70 0.64") => {
    lines.push(`q ${fill} rg ${x} ${y} ${width} ${height} re f Q`);
    lines.push(`q ${stroke} RG 0.8 w ${x} ${y} ${width} ${height} re S Q`);
  };
  const logoBytes = pdfLogoBytes();
  if (logoBytes) {
    lines.push(`q ${PDF_LOGO_WIDTH} 0 0 ${PDF_LOGO_HEIGHT} 48 706 cm /Logo Do Q`);
  } else {
    addText("COMMUNITYVERSE GAMES", 48, 742, 11, true);
  }

  addText("Invoice", 48, 664, 28, true);
  addText(collection.invoiceNumber || "Invoice", 510, 742, 12, true);
  addText(`Due ${details.dueDate}`, 470, 720, 11);

  addText("Bill To", 48, 622, 12, true);
  addText(details.customerName, 48, 602, 11, true);
  let billY = 586;
  [details.contact, ...details.addressLines].filter(Boolean).forEach((line) => {
    addText(line, 48, billY, 10);
    billY -= 14;
  });

  addText("From", 330, 622, 12, true);
  addText(INVOICE_SENDER.business, 330, 602, 10, true);
  addText(INVOICE_SENDER.street, 330, 588, 10);
  addText(INVOICE_SENDER.cityStateZip, 330, 574, 10);
  addText(INVOICE_SENDER.phone, 330, 560, 10);

  addText("Description", 48, 500, 11, true);
  addText("Amount", 500, 500, 11, true);
  lines.push("0.8 w 48 486 m 564 486 l S");
  let descriptionY = 464;
  wrapText(details.description, 76).forEach((line) => {
    addText(line, 48, descriptionY, 10);
    descriptionY -= 14;
  });
  addText(details.amount, 500, 512, 10);
  lines.push(`0.8 w 48 ${descriptionY - 6} m 564 ${descriptionY - 6} l S`);
  addPanel(48, descriptionY - 46, 516, 34, "0.98 0.96 0.91", "0.78 0.73 0.64");
  addText("Total Due", 48, descriptionY - 28, 12, true);
  addText(details.amount, 500, descriptionY - 28, 12, true);

  const payY = descriptionY - 82;
  addPanel(48, payY - 46, 516, 66, details.isRecurring ? "0.86 0.92 0.92" : "0.94 0.97 0.94", "0.73 0.70 0.64");
  addText(details.isRecurring ? "Set up recurring monthly payment" : "Pay online", 48, payY, 11, true);
  if (details.isRecurring) {
    addText(`Go to ${recurringPaymentDisplayLink()}`, 48, payY - 16, 10);
    addText(`Invoice: ${collection.invoiceNumber || "shown above"}`, 48, payY - 30, 10);
  } else {
    addText(PAYMENT_LINK, 48, payY - 16, 10);
  }
  const statusY = payY - 72;
  addText(`Payment type: ${details.paymentTypeLabel}`, 48, statusY, 10, true);
  addText(`Status: ${details.status}`, 48, statusY - 16, 10, true);

  const stream = lines.join("\n");
  return buildPdfDocument({ stream, payY, linkUrl: primaryLink, logoBytes }).toString("base64");
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
  if (paymentTypeFromNotes(collection.notes) !== "manual") {
    return `${prefix}Set up your Restaurant Challenge monthly subscription`;
  }
  return `${prefix}Invoice ${collection.invoiceNumber || ""} from CommunityVerse Games`.trim();
}

function invoiceHtml(collection = {}, restaurant = {}, isTest = false) {
  const details = invoiceDetails(collection, restaurant);
  const subscriptionLink = recurringPaymentLink(collection, restaurant);
  const primaryLink = details.isRecurring ? subscriptionLink : PAYMENT_LINK;
  const primaryButton = details.isRecurring ? "Set Up Monthly Subscription" : "Pay Now";
  const primaryIntro = details.isRecurring
    ? `Use this CommunityVerse subscription page to set up the ${htmlEscape(details.amount)} monthly Restaurant Challenge subscription. It starts when you sign up and renews automatically each month on that same day unless canceled.`
    : "You can mail a check or pay this invoice one time with the green Pay Now button.";
  const secondaryBox = "";
  const testNote = isTest ? `<p style="margin:0 0 18px;color:#a15c00;font-weight:700;">Test send only. This was not sent to the customer.</p>` : "";
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f5f1e8;font-family:Arial,sans-serif;color:#1f2924;">
    <div style="max-width:680px;margin:0 auto;padding:28px 18px;">
      <p style="margin:0 0 12px;text-align:center;color:#637069;font-size:13px;letter-spacing:.08em;text-transform:uppercase;">Invoice ${htmlEscape(collection.invoiceNumber)} Details</p>
      <div style="text-align:center;margin:0 0 22px;">
        <img src="${LOGO_URL}" alt="CommunityVerse Games" width="320" style="display:block;width:100%;max-width:320px;height:auto;margin:0 auto;" />
      </div>
      <div style="background:#dcebec;padding:26px 18px;text-align:center;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-weight:700;">DUE ${htmlEscape(details.dueDate)}</p>
        <div style="font-size:44px;font-weight:800;margin-bottom:16px;">${htmlEscape(details.amount)}</div>
        <a href="${htmlEscape(primaryLink)}" style="display:inline-block;background:#1f6b4a;color:#fff;text-decoration:none;padding:12px 34px;border-radius:6px;font-weight:800;">${primaryButton}</a>
      </div>
      ${secondaryBox}
      ${testNote}
      <p>Hi ${htmlEscape(details.greetingName)},</p>
      <p>${details.isRecurring
        ? `Here is the setup link for your ${htmlEscape(details.gameName)} monthly subscription. Thank you for allowing us to promote your restaurant through your trivia game.`
        : `Here is your invoice for ${htmlEscape(details.invoiceMonth)} for ${htmlEscape(details.gameName)}. Thank you for allowing us to promote your restaurant through your trivia game.`}</p>
      <p>${primaryIntro}</p>
      <p>A PDF of this invoice is attached for your records.</p>
      <hr style="border:0;border-top:1px solid #d8d0bf;margin:26px 0;" />
      <p style="margin:0;">Best Wishes,<br /><strong>Tim Collins - Game Developer</strong><br />${INVOICE_SENDER.business}</p>
    </div>
  </body>
</html>`;
}

function invoiceText(collection = {}, restaurant = {}, isTest = false) {
  const details = invoiceDetails(collection, restaurant);
  const subscriptionLink = recurringPaymentLink(collection, restaurant);
  const lines = details.isRecurring
    ? [
        isTest ? "TEST SEND ONLY - This was not sent to the customer." : "",
        `Hi ${details.greetingName},`,
        "",
        `Here is the setup link for your ${details.gameName} monthly subscription. Thank you for allowing us to promote your restaurant through your trivia game.`,
        "",
        `The monthly amount is ${details.amount}. Your subscription starts when you sign up and renews automatically each month on that same day unless canceled.`,
        "",
        "Please use this CommunityVerse subscription page:",
        subscriptionLink,
        "",
        "A PDF is attached for your records.",
      ]
    : [
        isTest ? "TEST SEND ONLY - This was not sent to the customer." : "",
        `Hi ${details.greetingName},`,
        "",
        `Here is your invoice for ${details.invoiceMonth} for ${details.gameName}. Thank you for allowing us to promote your restaurant through your trivia game.`,
        "",
        "You can mail a check or pay online with a credit card through PayPal, using this PayPal link:",
        PAYMENT_LINK,
        "",
        "A PDF of this invoice is attached for your records.",
      ];
  return [
    ...lines,
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
