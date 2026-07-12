(() => {
  const API_URL = "/api/backoffice/rep";
  const KEY_STORAGE = "communityverseBackofficeRepDoyceKey";
  const REP_NAME = "Doyce";
  const DEFAULT_EMAIL_TEMPLATE = {
    subject: "A quick trivia promotion idea for {restaurant}",
    body: [
      "Hi {contact},",
      "",
      "I wanted to reach out because CommunityVerse Games builds short Restaurant Challenge Trivia games for local restaurants.",
      "",
      "It gives guests a fun reason to play, share, and come back.",
      "",
      "Would you be open to a quick conversation?",
      "",
      "Best Wishes,",
      "Doyce",
      "CommunityVerse Games",
    ].join("\n"),
  };

  const stageLabels = {
    "new-lead": "New Lead",
    contacted: "Contacted",
    "demo-needed": "Demo Needed",
    "proposal-sent": "Proposal",
    "follow-up": "Follow-Up",
    "not-interested": "Not Interested",
  };

  const contactTypeLabels = {
    E: "Email",
    T: "Text",
    C: "Call",
    LM: "Left Message",
    FB: "Facebook",
    W: "Website",
  };

  const elements = {
    loginPanel: document.querySelector("#login-panel"),
    loginForm: document.querySelector("#login-form"),
    repKey: document.querySelector("#rep-key"),
    loginError: document.querySelector("#login-error"),
    app: document.querySelector("#rep-app"),
    syncStatus: document.querySelector("#sync-status"),
    refreshButton: document.querySelector("#refresh-button"),
    newProspectButton: document.querySelector("#new-prospect-button"),
    lockButton: document.querySelector("#lock-button"),
    prospectCount: document.querySelector("#prospect-count"),
    prospectSearch: document.querySelector("#prospect-search"),
    prospectScoreMin: document.querySelector("#prospect-score-min"),
    prospectScoreMax: document.querySelector("#prospect-score-max"),
    prospectSort: document.querySelector("#prospect-sort"),
    prospectList: document.querySelector("#prospect-list"),
    dialog: document.querySelector("#prospect-dialog"),
    form: document.querySelector("#prospect-form"),
    dialogTitle: document.querySelector("#dialog-title"),
    dialogCardLinks: document.querySelector("#dialog-card-links"),
    closeDialogButton: document.querySelector("#close-dialog-button"),
    cancelDialogButton: document.querySelector("#cancel-dialog-button"),
    formError: document.querySelector("#form-error"),
    id: document.querySelector("#restaurant-id"),
    name: document.querySelector("#restaurant-name"),
    street: document.querySelector("#restaurant-street"),
    city: document.querySelector("#restaurant-city"),
    state: document.querySelector("#restaurant-state"),
    zip: document.querySelector("#restaurant-zip"),
    phone: document.querySelector("#restaurant-phone"),
    currentlyDoesTrivia: document.querySelector("#currently-does-trivia"),
    website: document.querySelector("#restaurant-website"),
    facebookPage: document.querySelector("#facebook-page"),
    contactFirstName: document.querySelector("#contact-first-name"),
    contactLastName: document.querySelector("#contact-last-name"),
    contactEmail: document.querySelector("#contact-email"),
    contactCell: document.querySelector("#contact-cell"),
    prospectStage: document.querySelector("#prospect-stage"),
    prospectScore: document.querySelector("#prospect-score"),
    nextFollowUp: document.querySelector("#next-follow-up"),
    prospectNotes: document.querySelector("#prospect-notes"),
    contactHistoryType: document.querySelector("#contact-history-type"),
    contactHistoryDate: document.querySelector("#contact-history-date"),
    contactHistoryNote: document.querySelector("#contact-history-note"),
    contactHistoryList: document.querySelector("#contact-history-list"),
    commissionCount: document.querySelector("#commission-count"),
    commissionList: document.querySelector("#commission-list"),
  };

  const state = {
    key: localStorage.getItem(KEY_STORAGE) || "",
    restaurants: [],
    sales: [],
    collections: [],
    emailTemplate: { ...DEFAULT_EMAIL_TEMPLATE },
    editingContactHistory: [],
  };

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function escapeHtml(value = "") {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function labelFor(labels, value, fallback = "") {
    return labels[value] || fallback || value || "";
  }

  function externalUrl(value = "") {
    const url = String(value || "").trim();
    if (!url) return "";
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  }

  function formattedAddress(restaurant = {}) {
    const cityStateZip = [
      restaurant.city,
      [restaurant.state, restaurant.zip].filter(Boolean).join(" "),
    ].filter(Boolean).join(", ");
    return [restaurant.street, cityStateZip].filter(Boolean).join(", ");
  }

  function contactName(restaurant = {}) {
    return [restaurant.contactFirstName, restaurant.contactLastName].filter(Boolean).join(" ");
  }

  function latestContactSummary(restaurant = {}) {
    const latest = Array.isArray(restaurant.contactHistory) ? restaurant.contactHistory[0] : null;
    if (!latest) return "No contact yet";
    const type = labelFor(contactTypeLabels, latest.type, latest.type);
    return [type, latest.date, latest.note].filter(Boolean).join(" - ");
  }

  function moneyValue(value) {
    const trimmed = String(value || "").trim();
    if (!trimmed) return "";
    const amount = Number(trimmed.replace(/[$,]/g, ""));
    if (!Number.isFinite(amount)) return trimmed;
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: amount % 1 ? 2 : 0,
    });
  }

  function numberFromMoney(value, fallback = 0) {
    const rawValue = String(value || "");
    const amount = Number(rawValue.replace(/[^0-9.]/g, ""));
    return /\d/.test(rawValue) && Number.isFinite(amount) && amount >= 0 ? amount : fallback;
  }

  function shortDate(value = "") {
    const parts = String(value || "").split("-");
    if (parts.length !== 3) return value;
    return `${parts[1]}-${parts[2]}-${parts[0].slice(-2)}`;
  }

  function latestContactShort(restaurant = {}) {
    const latest = Array.isArray(restaurant.contactHistory) ? restaurant.contactHistory[0] : null;
    if (!latest) return "";
    return [latest.type, shortDate(latest.date)].filter(Boolean).join(" ");
  }

  function prospectScoreNumber(restaurant = {}) {
    const score = Number(restaurant.prospectScore);
    return Number.isFinite(score) ? Math.min(10, Math.max(1, score)) : 5;
  }

  function prospectScoreOptions(selectedValue = "5") {
    const selected = String(selectedValue || "5");
    return Array.from({ length: 10 }, (_, index) => {
      const value = String(index + 1);
      return `<option value="${value}"${value === selected ? " selected" : ""}>${value}</option>`;
    }).join("");
  }

  function stateCode(value = "") {
    const stateNames = {
      alabama: "AL",
      alaska: "AK",
      arizona: "AZ",
      arkansas: "AR",
      california: "CA",
      colorado: "CO",
      connecticut: "CT",
      delaware: "DE",
      florida: "FL",
      georgia: "GA",
      hawaii: "HI",
      idaho: "ID",
      illinois: "IL",
      indiana: "IN",
      iowa: "IA",
      kansas: "KS",
      kentucky: "KY",
      louisiana: "LA",
      maine: "ME",
      maryland: "MD",
      massachusetts: "MA",
      michigan: "MI",
      minnesota: "MN",
      mississippi: "MS",
      missouri: "MO",
      montana: "MT",
      nebraska: "NE",
      nevada: "NV",
      "new hampshire": "NH",
      "new jersey": "NJ",
      "new mexico": "NM",
      "new york": "NY",
      "north carolina": "NC",
      "north dakota": "ND",
      ohio: "OH",
      oklahoma: "OK",
      oregon: "OR",
      pennsylvania: "PA",
      "rhode island": "RI",
      "south carolina": "SC",
      "south dakota": "SD",
      tennessee: "TN",
      texas: "TX",
      utah: "UT",
      vermont: "VT",
      virginia: "VA",
      washington: "WA",
      "west virginia": "WV",
      wisconsin: "WI",
      wyoming: "WY",
    };
    const raw = String(value || "").trim();
    if (raw.length === 2) return raw.toUpperCase();
    return stateNames[raw.toLowerCase()] || raw.toUpperCase();
  }

  function stateTimeZoneRank(value = "") {
    const zones = {
      ET: ["CT", "DE", "FL", "GA", "IN", "KY", "MA", "MD", "ME", "MI", "NC", "NH", "NJ", "NY", "OH", "PA", "RI", "SC", "TN", "VA", "VT", "WV"],
      CT: ["AL", "AR", "IA", "IL", "KS", "LA", "MN", "MO", "MS", "ND", "NE", "OK", "SD", "TX", "WI"],
      MT: ["AZ", "CO", "ID", "MT", "NM", "UT", "WY"],
      PT: ["CA", "NV", "OR", "WA"],
      AK: ["AK"],
      HI: ["HI"],
    };
    const code = stateCode(value);
    const zoneOrder = ["ET", "CT", "MT", "PT", "AK", "HI"];
    const index = zoneOrder.findIndex((zone) => zones[zone].includes(code));
    return index >= 0 ? index : 99;
  }

  function compareProspects(left, right) {
    const sort = elements.prospectSort?.value || "follow-up";
    if (sort === "state") {
      const stateCompare = stateCode(left.state).localeCompare(stateCode(right.state));
      if (stateCompare) return stateCompare;
    }
    if (sort === "time-zone") {
      const zoneCompare = stateTimeZoneRank(left.state) - stateTimeZoneRank(right.state);
      if (zoneCompare) return zoneCompare;
      const stateCompare = stateCode(left.state).localeCompare(stateCode(right.state));
      if (stateCompare) return stateCompare;
    }
    const followUpCompare = String(left.nextFollowUp || "9999-12-31").localeCompare(String(right.nextFollowUp || "9999-12-31"));
    if (followUpCompare) return followUpCompare;
    return String(left.name || "").localeCompare(String(right.name || ""));
  }

  function normalizeRestaurant(record = {}) {
    return {
      id: String(record.id || "").trim(),
      name: String(record.name || "").trim(),
      status: "prospect",
      street: String(record.street || "").trim(),
      city: String(record.city || "").trim(),
      state: String(record.state || "").trim(),
      zip: String(record.zip || "").trim(),
      phone: String(record.phone || "").trim(),
      currentlyDoesTrivia: ["yes", "no", "possible"].includes(record.currentlyDoesTrivia) ? record.currentlyDoesTrivia : "",
      website: String(record.website || "").trim(),
      facebookPage: String(record.facebookPage || "").trim(),
      contactFirstName: String(record.contactFirstName || "").trim(),
      contactLastName: String(record.contactLastName || "").trim(),
      contactEmail: String(record.contactEmail || "").trim(),
      contactCell: String(record.contactCell || "").trim(),
      dateAdded: String(record.dateAdded || today()).trim(),
      lastContacted: String(record.lastContacted || "").trim(),
      nextFollowUp: String(record.nextFollowUp || "").trim(),
      prospectStage: stageLabels[record.prospectStage] ? record.prospectStage : "new-lead",
      prospectScore: String(record.prospectScore || "5").trim(),
      leadSource: String(record.leadSource || `Added by ${REP_NAME}`).trim(),
      assignedTo: REP_NAME,
      prospectNotes: String(record.prospectNotes || "").trim(),
      contactHistory: Array.isArray(record.contactHistory) ? record.contactHistory : [],
      saleDate: String(record.saleDate || "").trim(),
      packageName: String(record.packageName || "").trim(),
      gameName: String(record.gameName || "").trim(),
      serviceStartDate: String(record.serviceStartDate || record.saleDate || "").trim(),
      serviceEndDate: String(record.serviceEndDate || "").trim(),
      monthlyAmount: String(record.monthlyAmount || "").trim(),
      setupFee: String(record.setupFee || "").trim(),
      paymentStatus: String(record.paymentStatus || "").trim(),
      firstInvoiceDate: String(record.firstInvoiceDate || "").trim(),
      setupStatus: String(record.setupStatus || "").trim(),
      salesNotes: String(record.salesNotes || "").trim(),
    };
  }

  function normalizeCollection(record = {}) {
    return {
      id: String(record.id || "").trim(),
      restaurantId: String(record.restaurantId || "").trim(),
      restaurantName: String(record.restaurantName || "").trim(),
      invoiceNumber: String(record.invoiceNumber || "").trim(),
      dueDate: String(record.dueDate || "").trim(),
      amount: String(record.amount || "").trim(),
      status: String(record.status || "not-sent").trim(),
      paidDate: String(record.paidDate || "").trim(),
      notes: String(record.notes || "").trim(),
    };
  }

  async function apiRequest(method = "GET", body = null) {
    const response = await fetch(API_URL, {
      method,
      headers: {
        Authorization: `Bearer ${state.key}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : null,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || data?.ok === false) {
      throw new Error(data?.error || "Unable to reach the sales list.");
    }
    return data;
  }

  function setLoggedIn(loggedIn) {
    elements.loginPanel.hidden = loggedIn;
    elements.app.hidden = !loggedIn;
  }

  function setStatus(text = "") {
    elements.syncStatus.textContent = text;
  }

  async function loadRepData() {
    setStatus("Loading...");
    const data = await apiRequest("GET");
    state.restaurants = Array.isArray(data.restaurants)
      ? data.restaurants.map(normalizeRestaurant).filter((restaurant) => restaurant.name)
      : [];
    state.sales = Array.isArray(data.sales)
      ? data.sales.map(normalizeRestaurant).filter((restaurant) => restaurant.name)
      : [];
    state.collections = Array.isArray(data.collections) ? data.collections.map(normalizeCollection) : [];
    state.emailTemplate = normalizeEmailTemplate(data.emailTemplate);
    setStatus("List updated");
    renderList();
    renderCommissions();
  }

  function filteredRestaurants() {
    const query = String(elements.prospectSearch.value || "").toLowerCase().trim();
    const scoreMin = Number(elements.prospectScoreMin?.value || 1);
    const scoreMax = Number(elements.prospectScoreMax?.value || 10);
    const min = Math.min(scoreMin, scoreMax);
    const max = Math.max(scoreMin, scoreMax);
    return state.restaurants
      .filter((restaurant) => {
        if (!query) return true;
        return [
          restaurant.name,
          formattedAddress(restaurant),
          contactName(restaurant),
          restaurant.contactEmail,
          restaurant.contactCell,
          restaurant.phone,
          labelFor(stageLabels, restaurant.prospectStage),
          restaurant.prospectNotes,
        ].some((value) => String(value || "").toLowerCase().includes(query));
      })
      .filter((restaurant) => {
        const score = prospectScoreNumber(restaurant);
        return score >= min && score <= max;
      })
      .sort(compareProspects);
  }

  function normalizeEmailTemplate(template = {}) {
    return {
      subject: String(template.subject || DEFAULT_EMAIL_TEMPLATE.subject),
      body: String(template.body || DEFAULT_EMAIL_TEMPLATE.body),
    };
  }

  function emailTemplateValue(value = "", restaurant = {}) {
    const contact = contactName(restaurant) || "there";
    const replacements = {
      restaurant: restaurant.name || "your restaurant",
      contact,
      city: restaurant.city || "",
      website: restaurant.website || "",
    };
    return String(value || "").replace(/\{(restaurant|contact|city|website)\}/gi, (_, key) => replacements[key.toLowerCase()] || "");
  }

  function emailDraftUrl(restaurant = {}) {
    const to = String(restaurant.contactEmail || "").trim();
    const template = normalizeEmailTemplate(state.emailTemplate);
    const subject = emailTemplateValue(template.subject, restaurant);
    const body = emailTemplateValue(template.body, restaurant);
    return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function researchUrl(restaurant = {}) {
    const query = [
      restaurant.name,
      restaurant.city,
      restaurant.state,
      "official website phone address",
    ].filter(Boolean).join(" ");
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }

  function renderList() {
    const restaurants = filteredRestaurants();
    elements.prospectCount.textContent = `${restaurants.length} ${restaurants.length === 1 ? "record" : "records"}`;
    elements.prospectList.innerHTML = restaurants.length
      ? restaurants.map((restaurant) => `
            <tr>
              <td>
                <button class="link-button strong-link" type="button" data-edit-id="${escapeHtml(restaurant.id)}">${escapeHtml(restaurant.name)}</button>
                <div class="helper">${escapeHtml(formattedAddress(restaurant) || "No address yet")}</div>
              </td>
              <td>
                ${escapeHtml(contactName(restaurant) || "")}
              </td>
              <td>${restaurant.contactEmail ? `<a href="mailto:${escapeHtml(restaurant.contactEmail)}">${escapeHtml(restaurant.contactEmail)}</a>` : ""}</td>
              <td>${escapeHtml(restaurant.contactCell || restaurant.phone || "")}</td>
              <td>${escapeHtml(labelFor(stageLabels, restaurant.prospectStage, "New Lead"))}</td>
              <td>
                <select
                  class="inline-score-select"
                  data-prospect-score-id="${escapeHtml(restaurant.id)}"
                  aria-label="Score for ${escapeHtml(restaurant.name)}"
                >
                  ${prospectScoreOptions(restaurant.prospectScore || "5")}
                </select>
              </td>
              <td>${escapeHtml(latestContactShort(restaurant))}</td>
              <td>
                <div class="inline-follow-up">
                  <input
                    class="inline-date-input"
                    data-prospect-follow-up-id="${escapeHtml(restaurant.id)}"
                    type="date"
                    value="${escapeHtml(restaurant.nextFollowUp)}"
                    aria-label="Follow-up date for ${escapeHtml(restaurant.name)}"
                  />
                  ${
                    restaurant.nextFollowUp
                      ? `<button class="text-button small-text-button" type="button" data-clear-prospect-follow-up-id="${escapeHtml(restaurant.id)}">Clear</button>`
                      : ""
                  }
                </div>
              </td>
              <td>
                <a class="text-button" href="${escapeHtml(researchUrl(restaurant))}" target="_blank" rel="noopener">Research</a>
              </td>
              <td>
                ${restaurant.contactEmail ? `<a class="text-button" href="${escapeHtml(emailDraftUrl(restaurant))}">Doyce Email</a>` : '<span class="helper">No email</span>'}
              </td>
            </tr>
          `).join("")
      : '<tr><td colspan="10"><div class="empty-state">No Doyce prospects match this search and score range.</div></td></tr>';
  }

  function addMonths(dateValue = "", months = 0) {
    const date = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(date.getTime())) return "";
    date.setMonth(date.getMonth() + months);
    return date.toISOString().slice(0, 10);
  }

  function commissionRateFor(restaurant = {}, collection = {}) {
    const startDate = restaurant.serviceStartDate || restaurant.saleDate || collection.dueDate || collection.paidDate || "";
    const collectedDate = collection.paidDate || collection.dueDate || startDate;
    const secondYearStart = addMonths(startDate, 12);
    return secondYearStart && collectedDate >= secondYearStart ? 0.25 : 0.5;
  }

  function collectionsForRestaurant(restaurant = {}) {
    const nameKey = String(restaurant.name || "").trim().toLowerCase();
    return state.collections.filter((collection) =>
      (restaurant.id && collection.restaurantId === restaurant.id) ||
      (nameKey && String(collection.restaurantName || "").trim().toLowerCase() === nameKey)
    );
  }

  function billingMonthsForSale(restaurant = {}) {
    const plan = String(restaurant.packageName || "").toLowerCase();
    const monthMatch = plan.match(/(\d+)\s*(?:month|months|mo|mos)\b/);
    if (monthMatch) {
      return Math.max(1, Number(monthMatch[1]) || 1);
    }
    if (/\b(?:annual|yearly|1\s*year|12\s*month|12\s*mo)\b/.test(plan)) {
      return 12;
    }
    return 1;
  }

  function monthlyEquivalentAmount(restaurant = {}) {
    const amount = numberFromMoney(restaurant.monthlyAmount, 0);
    const billingMonths = billingMonthsForSale(restaurant);
    return billingMonths > 1 ? Math.round((amount / billingMonths) * 100) / 100 : amount;
  }

  function expectedMonthlyCommission(restaurant = {}) {
    return Math.round(monthlyEquivalentAmount(restaurant) * 0.5 * 100) / 100;
  }

  function expectedAnnualCommission(restaurant = {}) {
    const setupFee = numberFromMoney(restaurant.setupFee, 0);
    return Math.round((setupFee * 0.5 + expectedMonthlyCommission(restaurant) * 12) * 100) / 100;
  }

  function paidCommissionForRestaurant(restaurant = {}) {
    return collectionsForRestaurant(restaurant)
      .filter((collection) => collection.status === "paid")
      .reduce((totals, collection) => {
        const collected = numberFromMoney(collection.amount, 0);
        const rate = commissionRateFor(restaurant, collection);
        totals.collected += collected;
        totals.commission += Math.round(collected * rate * 100) / 100;
        return totals;
      }, { collected: 0, commission: 0 });
  }

  function commissionRows() {
    return state.sales
      .map((restaurant) => {
        const paid = paidCommissionForRestaurant(restaurant);
        return {
          restaurant,
          expectedMonthly: expectedMonthlyCommission(restaurant),
          expectedAnnual: expectedAnnualCommission(restaurant),
          collected: paid.collected,
          due: Math.round(paid.commission * 100) / 100,
        };
      })
      .sort((left, right) =>
        String(right.restaurant.saleDate || right.restaurant.serviceStartDate || "").localeCompare(String(left.restaurant.saleDate || left.restaurant.serviceStartDate || "")) ||
        String(left.restaurant.name || "").localeCompare(String(right.restaurant.name || ""))
      );
  }

  function renderCommissions() {
    const rows = commissionRows();
    const totalExpectedMonthly = rows.reduce((total, row) => total + row.expectedMonthly, 0);
    const totalExpectedAnnual = rows.reduce((total, row) => total + row.expectedAnnual, 0);
    const totalCollected = rows.reduce((total, row) => total + row.collected, 0);
    const totalDue = rows.reduce((total, row) => total + row.due, 0);
    elements.commissionCount.textContent = rows.length
      ? `${rows.length} ${rows.length === 1 ? "sale" : "sales"} / ${moneyValue(totalExpectedMonthly)} expected monthly / ${moneyValue(totalExpectedAnnual)} expected annual / ${moneyValue(totalDue)} due`
      : "No sales yet.";
    elements.commissionList.innerHTML = rows.length
      ? rows.map((row) => `
          <tr>
            <td><strong>${escapeHtml(row.restaurant.name)}</strong></td>
            <td>${escapeHtml(shortDate(row.restaurant.saleDate || row.restaurant.serviceStartDate))}</td>
            <td>${escapeHtml(moneyValue(row.restaurant.monthlyAmount))}</td>
            <td>${escapeHtml(moneyValue(row.expectedMonthly))}</td>
            <td>${escapeHtml(moneyValue(row.expectedAnnual))}</td>
            <td>${row.collected ? escapeHtml(moneyValue(row.collected)) : '<span class="helper">Not paid yet</span>'}</td>
            <td>${row.due ? `<strong>${escapeHtml(moneyValue(row.due))}</strong>` : '<span class="helper">Not due yet</span>'}</td>
            <td>${escapeHtml(row.restaurant.packageName || row.restaurant.paymentStatus || "")}</td>
          </tr>
        `).join("")
      : '<tr><td colspan="8"><div class="empty-state">Sales will appear here after Tim marks one of your prospects as a customer.</div></td></tr>';
  }

  function renderDialogLinks(restaurant = null) {
    if (!restaurant) {
      elements.dialogCardLinks.innerHTML = "";
      return;
    }
    const website = externalUrl(restaurant.website);
    const facebook = externalUrl(restaurant.facebookPage);
    elements.dialogCardLinks.innerHTML = [
      website ? `<a href="${escapeHtml(website)}" target="_blank" rel="noopener">Website</a>` : "",
      facebook ? `<a href="${escapeHtml(facebook)}" target="_blank" rel="noopener">Facebook</a>` : "",
    ].filter(Boolean).join(" ");
  }

  function renderContactHistory() {
    elements.contactHistoryList.innerHTML = state.editingContactHistory.length
      ? state.editingContactHistory.map((contact) => `
          <div class="contact-history-item">
            <strong>${escapeHtml(labelFor(contactTypeLabels, contact.type, contact.type))} ${escapeHtml(contact.date || "")}</strong>
            <span>${contact.response ? "Response" : "No response"}</span>
            <p>${escapeHtml(contact.note || "")}</p>
          </div>
        `).join("")
      : '<div class="empty-state">No contact history yet.</div>';
  }

  function fillForm(restaurant = null) {
    const record = normalizeRestaurant(restaurant || {});
    elements.dialogTitle.textContent = restaurant ? "Edit Prospect" : "Add Prospect";
    renderDialogLinks(restaurant ? record : null);
    elements.id.value = restaurant ? record.id : "";
    elements.name.value = restaurant ? record.name : "";
    elements.street.value = restaurant ? record.street : "";
    elements.city.value = restaurant ? record.city : "";
    elements.state.value = restaurant ? record.state : "";
    elements.zip.value = restaurant ? record.zip : "";
    elements.phone.value = restaurant ? record.phone : "";
    elements.currentlyDoesTrivia.value = restaurant ? record.currentlyDoesTrivia : "";
    elements.website.value = restaurant ? record.website : "";
    elements.facebookPage.value = restaurant ? record.facebookPage : "";
    elements.contactFirstName.value = restaurant ? record.contactFirstName : "";
    elements.contactLastName.value = restaurant ? record.contactLastName : "";
    elements.contactEmail.value = restaurant ? record.contactEmail : "";
    elements.contactCell.value = restaurant ? record.contactCell : "";
    elements.prospectStage.value = restaurant ? record.prospectStage : "new-lead";
    elements.prospectScore.value = restaurant ? record.prospectScore || "5" : "5";
    elements.nextFollowUp.value = restaurant ? record.nextFollowUp : "";
    elements.prospectNotes.value = restaurant ? record.prospectNotes : "";
    elements.contactHistoryType.value = "";
    elements.contactHistoryDate.value = today();
    elements.contactHistoryNote.value = "";
    elements.formError.textContent = "";
    state.editingContactHistory = restaurant ? [...record.contactHistory] : [];
    renderContactHistory();
  }

  function openDialog(id = "") {
    const restaurant = id ? state.restaurants.find((record) => record.id === id) : null;
    fillForm(restaurant);
    elements.dialog.showModal();
  }

  function closeDialog() {
    elements.dialog.close();
  }

  function updateRestaurantInState(saved) {
    const record = normalizeRestaurant(saved);
    const existingIndex = state.restaurants.findIndex((restaurant) => restaurant.id === record.id);
    if (existingIndex >= 0) {
      state.restaurants[existingIndex] = record;
    } else {
      state.restaurants.unshift(record);
    }
    return record;
  }

  async function saveRestaurantUpdate(restaurant, updates = {}) {
    const data = await apiRequest("POST", {
      action: "saveRestaurant",
      restaurant: normalizeRestaurant({ ...restaurant, ...updates }),
    });
    return updateRestaurantInState(data.restaurant);
  }

  function formRestaurant() {
    const existing = state.restaurants.find((restaurant) => restaurant.id === elements.id.value);
    const contactType = elements.contactHistoryType.value;
    const contactNote = elements.contactHistoryNote.value.trim();
    const contactDate = elements.contactHistoryDate.value || today();
    const contactHistory = [...state.editingContactHistory];
    if (contactType) {
      contactHistory.unshift({
        id: `rep-contact-${Date.now().toString(36)}`,
        type: contactType,
        date: contactDate,
        response: false,
        note: contactNote,
      });
    }
    return normalizeRestaurant({
      id: elements.id.value,
      name: elements.name.value,
      street: elements.street.value,
      city: elements.city.value,
      state: elements.state.value,
      zip: elements.zip.value,
      phone: elements.phone.value,
      currentlyDoesTrivia: elements.currentlyDoesTrivia.value,
      website: elements.website.value,
      facebookPage: elements.facebookPage.value,
      contactFirstName: elements.contactFirstName.value,
      contactLastName: elements.contactLastName.value,
      contactEmail: elements.contactEmail.value,
      contactCell: elements.contactCell.value,
      dateAdded: existing?.dateAdded || today(),
      lastContacted: contactType ? contactDate : existing?.lastContacted || "",
      prospectStage: elements.prospectStage.value,
      prospectScore: elements.prospectScore.value,
      nextFollowUp: elements.nextFollowUp.value,
      leadSource: existing?.leadSource || `Added by ${REP_NAME}`,
      prospectNotes: elements.prospectNotes.value,
      contactHistory,
    });
  }

  async function saveProspect(event) {
    event.preventDefault();
    elements.formError.textContent = "";
    setStatus("Saving...");
    try {
      const data = await apiRequest("POST", {
        action: "saveRestaurant",
        restaurant: formRestaurant(),
      });
      updateRestaurantInState(data.restaurant);
      closeDialog();
      renderList();
      setStatus("Saved");
    } catch (error) {
      elements.formError.textContent = error instanceof Error ? error.message : "Unable to save this prospect.";
      setStatus("Save failed");
    }
  }

  async function login(event) {
    event.preventDefault();
    state.key = elements.repKey.value.trim();
    elements.loginError.textContent = "";
    try {
      await loadRepData();
      localStorage.setItem(KEY_STORAGE, state.key);
      setLoggedIn(true);
    } catch (error) {
      elements.loginError.textContent = error instanceof Error ? error.message : "Access denied.";
      localStorage.removeItem(KEY_STORAGE);
    }
  }

  function lock() {
    localStorage.removeItem(KEY_STORAGE);
    state.key = "";
    state.restaurants = [];
    state.sales = [];
    state.collections = [];
    elements.repKey.value = "";
    setLoggedIn(false);
  }

  elements.loginForm.addEventListener("submit", login);
  elements.refreshButton.addEventListener("click", () => loadRepData().catch((error) => setStatus(error.message)));
  elements.newProspectButton.addEventListener("click", () => openDialog());
  elements.lockButton.addEventListener("click", lock);
  elements.prospectSearch.addEventListener("input", renderList);
  elements.prospectScoreMin.addEventListener("change", renderList);
  elements.prospectScoreMax.addEventListener("change", renderList);
  elements.prospectSort.addEventListener("change", renderList);
  elements.prospectList.addEventListener("change", (event) => {
    const scoreSelect = event.target.closest("[data-prospect-score-id]");
    if (!scoreSelect) return;
    const restaurant = state.restaurants.find((record) => record.id === scoreSelect.dataset.prospectScoreId);
    if (!restaurant) return;
    saveRestaurantUpdate(restaurant, { prospectScore: scoreSelect.value }).then(() => {
      renderList();
      setStatus("Score saved");
    }).catch((error) => {
      setStatus(error instanceof Error ? error.message : "Score was not saved");
      renderList();
    });
  });
  elements.prospectList.addEventListener("click", (event) => {
    const clearFollowUpButton = event.target.closest("[data-clear-prospect-follow-up-id]");
    if (clearFollowUpButton) {
      const restaurant = state.restaurants.find((record) => record.id === clearFollowUpButton.dataset.clearProspectFollowUpId);
      if (!restaurant) return;
      saveRestaurantUpdate(restaurant, { nextFollowUp: "" }).then(() => {
        renderList();
        setStatus("Follow-up cleared");
      }).catch((error) => {
        setStatus(error instanceof Error ? error.message : "Follow-up was not cleared");
      });
      return;
    }
    const editButton = event.target.closest("[data-edit-id]");
    if (editButton) {
      openDialog(editButton.dataset.editId);
    }
  });
  elements.prospectList.addEventListener("change", (event) => {
    const followUpInput = event.target.closest("[data-prospect-follow-up-id]");
    if (!followUpInput) return;
    const restaurant = state.restaurants.find((record) => record.id === followUpInput.dataset.prospectFollowUpId);
    if (!restaurant) return;
    saveRestaurantUpdate(restaurant, { nextFollowUp: followUpInput.value }).then(() => {
      renderList();
      setStatus("Follow-up saved");
    }).catch((error) => {
      setStatus(error instanceof Error ? error.message : "Follow-up was not saved");
      renderList();
    });
  });
  elements.closeDialogButton.addEventListener("click", closeDialog);
  elements.cancelDialogButton.addEventListener("click", closeDialog);
  elements.form.addEventListener("submit", saveProspect);

  if (state.key) {
    elements.repKey.value = state.key;
    loadRepData()
      .then(() => setLoggedIn(true))
      .catch(() => lock());
  } else {
    setLoggedIn(false);
  }
})();
