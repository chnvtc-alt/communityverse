import { randomUUID } from "node:crypto";
import { supabaseRequest } from "./supabase.mjs";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function safeString(value) {
  return String(value || "").trim();
}

function safeDate(value) {
  const trimmed = safeString(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
}

function safeNumber(value) {
  const trimmed = safeString(value).replace(/[$,]/g, "");
  if (!trimmed) return null;
  const number = Number(trimmed);
  return Number.isFinite(number) ? number : null;
}

function safeInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) ? number : null;
}

function safeTriviaBoolean(value) {
  const text = safeString(value).toLowerCase();
  if (text === "yes" || text === "true" || text === "1") return true;
  if (text === "no" || text === "false" || text === "0") return false;
  return null;
}

function triviaValueFromRecord(value) {
  if (value === true) return "yes";
  if (value === false) return "no";
  return "";
}

function safeUuid(value) {
  const trimmed = safeString(value);
  return UUID_PATTERN.test(trimmed) ? trimmed : randomUUID();
}

function existingUuid(value) {
  const trimmed = safeString(value);
  return UUID_PATTERN.test(trimmed) ? trimmed : "";
}

function contactNameFromLegacy(record = {}) {
  return safeString(record.contactPerson).split(/\s+/).filter(Boolean);
}

export function restaurantFromRecord(record = {}, contactHistory = []) {
  return {
    id: safeString(record.id),
    name: safeString(record.name),
    status: safeString(record.status) || "prospect",
    street: safeString(record.street),
    city: safeString(record.city),
    state: safeString(record.state),
    zip: safeString(record.zip),
    phone: safeString(record.phone),
    currentlyDoesTrivia: triviaValueFromRecord(record.currently_does_trivia),
    website: safeString(record.website),
    facebookPage: safeString(record.facebook_page),
    contactFirstName: safeString(record.contact_first_name),
    contactLastName: safeString(record.contact_last_name),
    contactEmail: safeString(record.contact_email),
    contactCell: safeString(record.contact_cell),
    dateAdded: safeString(record.date_added),
    lastContacted: safeString(record.last_contacted),
    nextFollowUp: safeString(record.next_follow_up),
    notes: safeString(record.notes),
    prospectStage: safeString(record.prospect_stage),
    prospectScore: record.prospect_score == null ? "" : String(record.prospect_score),
    leadSource: safeString(record.lead_source),
    assignedTo: safeString(record.assigned_to || record.salesperson || "Tim"),
    prospectNotes: safeString(record.prospect_notes),
    contactHistory,
    saleDate: safeString(record.sale_date),
    packageName: safeString(record.package_name),
    gameName: safeString(record.game_name),
    monthlyAmount: record.monthly_amount == null ? "" : String(record.monthly_amount),
    setupFee: record.setup_fee == null ? "" : String(record.setup_fee),
    paymentStatus: safeString(record.payment_status),
    firstInvoiceDate: safeString(record.first_invoice_date),
    salesperson: safeString(record.salesperson || record.assigned_to || "Tim"),
    setupStatus: safeString(record.setup_status),
    salesNotes: safeString(record.sales_notes),
    updatedAt: safeString(record.updated_at || record.created_at),
  };
}

export function contactFromRecord(record = {}) {
  return {
    id: safeString(record.id),
    type: safeString(record.contact_type) || "E",
    date: safeString(record.contact_date),
    response: record.had_response === true,
    note: safeString(record.note),
  };
}

export function collectionFromRecord(record = {}) {
  return {
    id: safeString(record.id),
    restaurantId: safeString(record.restaurant_id),
    restaurantName: safeString(record.restaurant_name),
    invoiceNumber: safeString(record.invoice_number),
    dueDate: safeString(record.due_date),
    amount: record.amount == null ? "" : String(record.amount),
    status: safeString(record.status) || "not-sent",
    paidDate: safeString(record.paid_date),
    notes: safeString(record.notes),
    createdAt: safeString(record.created_at),
  };
}

export function expenseFromRecord(record = {}) {
  return {
    id: safeString(record.id),
    date: safeString(record.expense_date),
    vendor: safeString(record.vendor),
    category: safeString(record.category) || "other",
    amount: record.amount == null ? "" : String(record.amount),
    paymentMethod: safeString(record.payment_method),
    notes: safeString(record.notes),
    createdAt: safeString(record.created_at),
  };
}

export function restaurantToRecord(restaurant = {}, idMap = new Map(), options = {}) {
  const includeGameName = options.includeGameName !== false;
  const includeResearchFields = options.includeResearchFields !== false;
  const legacyNameParts = contactNameFromLegacy(restaurant);
  const incomingId = safeString(restaurant.id);
  const id = existingUuid(incomingId) || idMap.get(incomingId) || randomUUID();
  if (incomingId) idMap.set(incomingId, id);

  return {
    id,
    name: safeString(restaurant.name),
    status: safeString(restaurant.status) || "prospect",
    street: safeString(restaurant.street || restaurant.address),
    city: safeString(restaurant.city),
    state: safeString(restaurant.state),
    zip: safeString(restaurant.zip),
    phone: safeString(restaurant.phone),
    ...(includeResearchFields
      ? {
          currently_does_trivia: safeTriviaBoolean(restaurant.currentlyDoesTrivia),
          website: safeString(restaurant.website),
          facebook_page: safeString(restaurant.facebookPage),
        }
      : {}),
    contact_first_name: safeString(restaurant.contactFirstName || legacyNameParts[0]),
    contact_last_name: safeString(restaurant.contactLastName || legacyNameParts.slice(1).join(" ")),
    contact_email: safeString(restaurant.contactEmail),
    contact_cell: safeString(restaurant.contactCell),
    date_added: safeDate(restaurant.dateAdded),
    last_contacted: safeDate(restaurant.lastContacted),
    next_follow_up: safeDate(restaurant.nextFollowUp),
    notes: safeString(restaurant.notes),
    prospect_stage: safeString(restaurant.prospectStage),
    prospect_score: safeInteger(restaurant.prospectScore),
    lead_source: safeString(restaurant.leadSource),
    assigned_to: safeString(restaurant.assignedTo || restaurant.salesperson || "Tim"),
    prospect_notes: safeString(restaurant.prospectNotes),
    sale_date: safeDate(restaurant.saleDate),
    package_name: safeString(restaurant.packageName),
    ...(includeGameName ? { game_name: safeString(restaurant.gameName) } : {}),
    monthly_amount: safeNumber(restaurant.monthlyAmount),
    setup_fee: safeNumber(restaurant.setupFee),
    payment_status: safeString(restaurant.paymentStatus),
    first_invoice_date: safeDate(restaurant.firstInvoiceDate),
    salesperson: safeString(restaurant.salesperson || restaurant.assignedTo || "Tim"),
    setup_status: safeString(restaurant.setupStatus),
    sales_notes: safeString(restaurant.salesNotes),
    updated_at: new Date().toISOString(),
  };
}

export function contactToRecord(contact = {}, restaurantId = "") {
  return {
    id: safeUuid(contact.id),
    restaurant_id: restaurantId,
    contact_type: safeString(contact.type) || "E",
    contact_date: safeDate(contact.date),
    had_response: contact.response === true,
    note: safeString(contact.note),
  };
}

export function collectionToRecord(collection = {}, idMap = new Map()) {
  const restaurantId = existingUuid(collection.restaurantId) || idMap.get(safeString(collection.restaurantId)) || null;
  return {
    id: safeUuid(collection.id),
    restaurant_id: restaurantId,
    restaurant_name: safeString(collection.restaurantName),
    invoice_number: safeString(collection.invoiceNumber),
    due_date: safeDate(collection.dueDate),
    amount: safeNumber(collection.amount),
    status: safeString(collection.status) || "not-sent",
    paid_date: safeDate(collection.paidDate),
    notes: safeString(collection.notes),
    updated_at: new Date().toISOString(),
  };
}

export function expenseToRecord(expense = {}) {
  return {
    id: safeUuid(expense.id),
    expense_date: safeDate(expense.date),
    vendor: safeString(expense.vendor),
    category: safeString(expense.category) || "other",
    amount: safeNumber(expense.amount),
    payment_method: safeString(expense.paymentMethod),
    notes: safeString(expense.notes),
    updated_at: new Date().toISOString(),
  };
}

export async function fetchBackofficeData() {
  const [restaurantRows, contactRows, collectionRows, expenseRows] = await Promise.all([
    supabaseRequest("backoffice_restaurants?select=*&order=updated_at.desc"),
    supabaseRequest("backoffice_contact_history?select=*&order=contact_date.desc,created_at.desc"),
    supabaseRequest("backoffice_collections?select=*&order=due_date.asc,created_at.desc"),
    supabaseRequest("backoffice_expenses?select=*&order=expense_date.desc,created_at.desc"),
  ]);

  const contactsByRestaurant = new Map();
  (Array.isArray(contactRows) ? contactRows : []).forEach((row) => {
    const restaurantId = safeString(row.restaurant_id);
    if (!contactsByRestaurant.has(restaurantId)) {
      contactsByRestaurant.set(restaurantId, []);
    }
    contactsByRestaurant.get(restaurantId).push(contactFromRecord(row));
  });

  return {
    restaurants: (Array.isArray(restaurantRows) ? restaurantRows : [])
      .map((row) => restaurantFromRecord(row, contactsByRestaurant.get(safeString(row.id)) || []))
      .filter((restaurant) => restaurant.name),
    collections: (Array.isArray(collectionRows) ? collectionRows : []).map(collectionFromRecord),
    expenses: (Array.isArray(expenseRows) ? expenseRows : []).map(expenseFromRecord),
  };
}

export async function saveBackofficeRestaurant(restaurant = {}) {
  const idMap = new Map();
  const record = restaurantToRecord(restaurant, idMap);
  let rows;
  let savedRecord = record;
  try {
    rows = await supabaseRequest("backoffice_restaurants?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify([record]),
    });
  } catch (error) {
    const message = String(error?.message || "");
    const missingGameName = message.includes("game_name");
    const missingResearchFields = ["currently_does_trivia", "website", "facebook_page"].some((column) =>
      message.includes(column)
    );
    if (!missingGameName && !missingResearchFields) {
      throw error;
    }
    savedRecord = restaurantToRecord(restaurant, idMap, {
      includeGameName: !missingGameName,
      includeResearchFields: !missingResearchFields,
    });
    rows = await supabaseRequest("backoffice_restaurants?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify([savedRecord]),
    });
  }

  await supabaseRequest(`backoffice_contact_history?restaurant_id=eq.${encodeURIComponent(record.id)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });

  const contactRecords = Array.isArray(restaurant.contactHistory)
    ? restaurant.contactHistory.map((contact) => contactToRecord(contact, record.id))
    : [];
  if (contactRecords.length) {
    await supabaseRequest("backoffice_contact_history", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(contactRecords),
    });
  }

  const saved = Array.isArray(rows) && rows.length ? rows[0] : savedRecord;
  return restaurantFromRecord(saved, contactRecords.map(contactFromRecord));
}

export async function deleteBackofficeRestaurant(id = "") {
  const safeId = existingUuid(id);
  if (!safeId) return;
  await supabaseRequest(`backoffice_restaurants?id=eq.${encodeURIComponent(safeId)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
}

export async function saveBackofficeCollection(collection = {}) {
  const record = collectionToRecord(collection);
  const rows = await supabaseRequest("backoffice_collections?on_conflict=id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify([record]),
  });
  return collectionFromRecord(Array.isArray(rows) && rows.length ? rows[0] : record);
}

export async function deleteBackofficeCollection(id = "") {
  const safeId = existingUuid(id);
  if (!safeId) return;
  await supabaseRequest(`backoffice_collections?id=eq.${encodeURIComponent(safeId)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
}

export async function saveBackofficeExpense(expense = {}) {
  const record = expenseToRecord(expense);
  const rows = await supabaseRequest("backoffice_expenses?on_conflict=id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify([record]),
  });
  return expenseFromRecord(Array.isArray(rows) && rows.length ? rows[0] : record);
}

export async function deleteBackofficeExpense(id = "") {
  const safeId = existingUuid(id);
  if (!safeId) return;
  await supabaseRequest(`backoffice_expenses?id=eq.${encodeURIComponent(safeId)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
}

export async function importBackofficeBackup(backup = {}) {
  const idMap = new Map();
  const restaurants = Array.isArray(backup.restaurants) ? backup.restaurants : [];
  const collections = Array.isArray(backup.collections) ? backup.collections : [];
  const expenses = Array.isArray(backup.expenses) ? backup.expenses : [];

  for (const restaurant of restaurants) {
    const record = restaurantToRecord(restaurant, idMap);
    await saveBackofficeRestaurant({
      ...restaurant,
      id: record.id,
      contactHistory: Array.isArray(restaurant.contactHistory) ? restaurant.contactHistory : [],
    });
  }

  for (const collection of collections) {
    await saveBackofficeCollection(collectionFromRecord(collectionToRecord(collection, idMap)));
  }

  for (const expense of expenses) {
    await saveBackofficeExpense(expenseFromRecord(expenseToRecord(expense)));
  }

  return fetchBackofficeData();
}
