(() => {
  const STORAGE_KEY = "communityverseBackofficeRestaurants";
  const COLLECTIONS_KEY = "communityverseBackofficeCollections";
  const EXPENSES_KEY = "communityverseBackofficeExpenses";
  const KEY_STORAGE = "communityverseBackofficeAdminKey";
  const API_URL = "/api/backoffice";
  const DEFAULT_OWNER = "Tim";
  const SECTION_LABELS = {
    dashboard: "Dashboard",
    restaurants: "Restaurant List",
    prospects: "Prospects",
    sales: "Sales",
    collections: "Collections",
    expenses: "Expenses",
    commissions: "Commissions",
  };

  const statusLabels = {
    prospect: "Prospect",
    customer: "Customer",
    paused: "Paused",
    former: "Former",
  };

  const prospectStageLabels = {
    "new-lead": "New Lead",
    contacted: "Contacted",
    "demo-needed": "Demo Needed",
    "proposal-sent": "Proposal",
    "follow-up": "Follow-Up",
    "not-interested": "Not Interested",
  };

  const prospectScoreLabels = {
    1: "1",
    2: "2",
    3: "3",
    4: "4",
    5: "5",
    6: "6",
    7: "7",
    8: "8",
    9: "9",
    10: "10",
  };

  const paymentStatusLabels = {
    "not-invoiced": "Not Invoiced",
    "invoice-sent": "Invoice Sent",
    paid: "Paid",
    "past-due": "Past Due",
  };

  const setupStatusLabels = {
    "not-started": "Not Started",
    "info-needed": "Info Needed",
    "in-progress": "In Progress",
    live: "Live",
  };

  const contactTypeLabels = {
    E: "Email",
    T: "Text",
    C: "Call",
    LM: "Left Message",
    FB: "Facebook",
    W: "Website",
  };

  const collectionStatusLabels = {
    "not-sent": "Not Sent",
    sent: "Sent",
    paid: "Paid",
    "past-due": "Past Due",
  };

  const expenseCategoryLabels = {
    software: "Software",
    marketing: "Marketing",
    meals: "Meals",
    travel: "Travel",
    printing: "Printing",
    other: "Other",
  };

  const elements = {
    appShell: document.querySelector("#app-shell"),
    loginPanel: document.querySelector("#login-panel"),
    loginForm: document.querySelector("#login-form"),
    adminKey: document.querySelector("#admin-key"),
    loginError: document.querySelector("#login-error"),
    syncStatus: document.querySelector("#sync-status"),
    sectionTitle: document.querySelector("#section-title"),
    navItems: [...document.querySelectorAll(".nav-item")],
    sections: [...document.querySelectorAll(".section-view")],
    newRestaurantButton: document.querySelector("#new-restaurant-button"),
    importButton: document.querySelector("#import-button"),
    exportButton: document.querySelector("#export-button"),
    importFile: document.querySelector("#import-file"),
    search: document.querySelector("#restaurant-search"),
    statusFilter: document.querySelector("#restaurant-status-filter"),
    restaurantCount: document.querySelector("#restaurant-count"),
    restaurantTableBody: document.querySelector("#restaurant-table-body"),
    recentRestaurants: document.querySelector("#recent-restaurants"),
    followupList: document.querySelector("#followup-list"),
    prospectList: document.querySelector("#prospect-list"),
    prospectScoreMin: document.querySelector("#prospect-score-min"),
    prospectScoreMax: document.querySelector("#prospect-score-max"),
    salesList: document.querySelector("#sales-list"),
    collectionForm: document.querySelector("#collection-form"),
    collectionRestaurant: document.querySelector("#collection-restaurant"),
    collectionInvoice: document.querySelector("#collection-invoice"),
    collectionDueDate: document.querySelector("#collection-due-date"),
    collectionAmount: document.querySelector("#collection-amount"),
    collectionStatus: document.querySelector("#collection-status"),
    collectionPaidDate: document.querySelector("#collection-paid-date"),
    collectionNotes: document.querySelector("#collection-notes"),
    collectionsList: document.querySelector("#collections-list"),
    expenseForm: document.querySelector("#expense-form"),
    expenseDate: document.querySelector("#expense-date"),
    expenseVendor: document.querySelector("#expense-vendor"),
    expenseCategory: document.querySelector("#expense-category"),
    expenseAmount: document.querySelector("#expense-amount"),
    expensePaymentMethod: document.querySelector("#expense-payment-method"),
    expenseNotes: document.querySelector("#expense-notes"),
    expensesList: document.querySelector("#expenses-list"),
    metricTotal: document.querySelector("#metric-total"),
    metricCustomers: document.querySelector("#metric-customers"),
    metricProspects: document.querySelector("#metric-prospects"),
    metricFollowups: document.querySelector("#metric-followups"),
    dialog: document.querySelector("#restaurant-dialog"),
    form: document.querySelector("#restaurant-form"),
    editorTitle: document.querySelector("#restaurant-editor-title"),
    closeEditorButton: document.querySelector("#close-editor-button"),
    cancelEditorButton: document.querySelector("#cancel-editor-button"),
    deleteRestaurantButton: document.querySelector("#delete-restaurant-button"),
    id: document.querySelector("#restaurant-id"),
    name: document.querySelector("#restaurant-name"),
    status: document.querySelector("#restaurant-status"),
    street: document.querySelector("#restaurant-street"),
    city: document.querySelector("#restaurant-city"),
    state: document.querySelector("#restaurant-state"),
    zip: document.querySelector("#restaurant-zip"),
    phone: document.querySelector("#restaurant-phone"),
    contactFirstName: document.querySelector("#contact-first-name"),
    contactLastName: document.querySelector("#contact-last-name"),
    contactEmail: document.querySelector("#contact-email"),
    contactCell: document.querySelector("#contact-cell"),
    dateAdded: document.querySelector("#date-added"),
    lastContacted: document.querySelector("#last-contacted"),
    nextFollowUp: document.querySelector("#next-follow-up"),
    notes: document.querySelector("#restaurant-notes"),
    prospectStage: document.querySelector("#prospect-stage"),
    prospectScore: document.querySelector("#prospect-score"),
    leadSource: document.querySelector("#lead-source"),
    prospectNotes: document.querySelector("#prospect-notes"),
    contactHistoryType: document.querySelector("#contact-history-type"),
    contactHistoryDate: document.querySelector("#contact-history-date"),
    contactHistoryResponse: document.querySelector("#contact-history-response"),
    contactHistoryNote: document.querySelector("#contact-history-note"),
    addContactHistoryButton: document.querySelector("#add-contact-history-button"),
    contactHistoryList: document.querySelector("#contact-history-list"),
    saleDate: document.querySelector("#sale-date"),
    packageName: document.querySelector("#package-name"),
    monthlyAmount: document.querySelector("#monthly-amount"),
    setupFee: document.querySelector("#setup-fee"),
    paymentStatus: document.querySelector("#payment-status"),
    firstInvoiceDate: document.querySelector("#first-invoice-date"),
    setupStatus: document.querySelector("#setup-status"),
    salesNotes: document.querySelector("#sales-notes"),
  };

  const state = {
    section: "dashboard",
    restaurants: [],
    collections: [],
    expenses: [],
    editingContactHistory: [],
    loading: false,
  };

  let adminKey = sessionStorage.getItem(KEY_STORAGE) || "";
  const localBackupAtStart = {
    restaurants: loadRestaurants(),
    collections: loadRecords(COLLECTIONS_KEY, normalizeCollection),
    expenses: loadRecords(EXPENSES_KEY, normalizeExpense),
  };

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function makeId() {
    return `restaurant-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function makeCollectionId() {
    return `collection-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function makeExpenseId() {
    return `expense-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeRestaurant(record = {}) {
    const legacyNameParts = String(record.contactPerson || "").trim().split(/\s+/).filter(Boolean);
    const legacyScore = {
      hot: "10",
      warm: "7",
      cold: "3",
    }[record.interestLevel];
    const defaultProspectScore = record.status === "prospect" ? "5" : "";
    const score = String(record.prospectScore || legacyScore || defaultProspectScore).trim();
    return {
      id: String(record.id || "").trim() || makeId(),
      name: String(record.name || "").trim(),
      status: statusLabels[record.status] ? record.status : "prospect",
      street: String(record.street || record.address || "").trim(),
      city: String(record.city || "").trim(),
      state: String(record.state || "").trim(),
      zip: String(record.zip || "").trim(),
      phone: String(record.phone || "").trim(),
      contactFirstName: String(record.contactFirstName || legacyNameParts[0] || "").trim(),
      contactLastName: String(record.contactLastName || legacyNameParts.slice(1).join(" ") || "").trim(),
      contactEmail: String(record.contactEmail || "").trim(),
      contactCell: String(record.contactCell || "").trim(),
      dateAdded: String(record.dateAdded || today()).trim(),
      lastContacted: String(record.lastContacted || "").trim(),
      nextFollowUp: String(record.nextFollowUp || "").trim(),
      notes: String(record.notes || "").trim(),
      prospectStage: prospectStageLabels[record.prospectStage] ? record.prospectStage : "",
      prospectScore: prospectScoreLabels[score] ? score : "",
      leadSource: String(record.leadSource || "").trim(),
      assignedTo: String(record.assignedTo || record.salesperson || DEFAULT_OWNER).trim(),
      prospectNotes: String(record.prospectNotes || "").trim(),
      contactHistory: normalizeContactHistory(record.contactHistory),
      saleDate: String(record.saleDate || "").trim(),
      packageName: String(record.packageName || "").trim(),
      monthlyAmount: String(record.monthlyAmount || "").trim(),
      setupFee: String(record.setupFee || "").trim(),
      paymentStatus: paymentStatusLabels[record.paymentStatus] ? record.paymentStatus : "",
      firstInvoiceDate: String(record.firstInvoiceDate || "").trim(),
      salesperson: String(record.salesperson || record.assignedTo || DEFAULT_OWNER).trim(),
      setupStatus: setupStatusLabels[record.setupStatus] ? record.setupStatus : "",
      salesNotes: String(record.salesNotes || "").trim(),
      updatedAt: String(record.updatedAt || new Date().toISOString()).trim(),
    };
  }

  function normalizeContactHistory(records = []) {
    return Array.isArray(records)
      ? records.map((record = {}) => ({
          id: String(record.id || "").trim() || makeContactId(),
          type: contactTypeLabels[record.type] ? record.type : "E",
          date: String(record.date || "").trim(),
          response: Boolean(record.response),
          note: String(record.note || "").trim(),
        })).filter((record) => record.date || record.note)
      : [];
  }

  function makeContactId() {
    return `contact-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function normalizeCollection(record = {}) {
    return {
      id: String(record.id || "").trim() || makeCollectionId(),
      restaurantId: String(record.restaurantId || "").trim(),
      restaurantName: String(record.restaurantName || "").trim(),
      invoiceNumber: String(record.invoiceNumber || "").trim(),
      dueDate: String(record.dueDate || "").trim(),
      amount: String(record.amount || "").trim(),
      status: collectionStatusLabels[record.status] ? record.status : "not-sent",
      paidDate: String(record.paidDate || "").trim(),
      notes: String(record.notes || "").trim(),
      createdAt: String(record.createdAt || new Date().toISOString()).trim(),
    };
  }

  function normalizeExpense(record = {}) {
    return {
      id: String(record.id || "").trim() || makeExpenseId(),
      date: String(record.date || today()).trim(),
      vendor: String(record.vendor || "").trim(),
      category: expenseCategoryLabels[record.category] ? record.category : "other",
      amount: String(record.amount || "").trim(),
      paymentMethod: String(record.paymentMethod || "").trim(),
      notes: String(record.notes || "").trim(),
      createdAt: String(record.createdAt || new Date().toISOString()).trim(),
    };
  }

  function loadRecords(key, normalize) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(parsed) ? parsed.map(normalize) : [];
    } catch {
      return [];
    }
  }

  function loadRestaurants() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed.map(normalizeRestaurant).filter((record) => record.name) : [];
    } catch {
      return [];
    }
  }

  function saveRestaurants() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.restaurants, null, 2));
  }

  function saveCollections() {
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(state.collections, null, 2));
  }

  function saveExpenses() {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(state.expenses, null, 2));
  }

  function cacheBackofficeData() {
    saveRestaurants();
    saveCollections();
    saveExpenses();
  }

  function setSyncStatus(message) {
    elements.syncStatus.textContent = message;
  }

  function setLoading(loading) {
    state.loading = loading;
    [
      elements.newRestaurantButton,
      elements.importButton,
      elements.exportButton,
      elements.deleteRestaurantButton,
      elements.addContactHistoryButton,
    ].forEach((element) => {
      if (element) element.disabled = loading;
    });
  }

  async function apiRequest(action = "", payload = {}) {
    const options = {
      headers: {
        Authorization: `Bearer ${adminKey}`,
      },
    };

    if (action) {
      options.method = "POST";
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify({ action, ...payload });
    }

    const response = await fetch(API_URL, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) {
      const error = new Error(data.error || "Back Office database request failed.");
      error.status = response.status;
      throw error;
    }
    return data;
  }

  function showLogin(message = "") {
    elements.appShell.hidden = true;
    elements.loginPanel.hidden = false;
    elements.loginError.textContent = message;
    elements.adminKey.value = "";
    elements.adminKey.focus();
  }

  function showApp() {
    elements.loginPanel.hidden = true;
    elements.appShell.hidden = false;
  }

  function applyBackofficeData(data = {}) {
    state.restaurants = Array.isArray(data.restaurants)
      ? data.restaurants.map(normalizeRestaurant).filter((record) => record.name)
      : [];
    state.collections = Array.isArray(data.collections) ? data.collections.map(normalizeCollection) : [];
    state.expenses = Array.isArray(data.expenses) ? data.expenses.map(normalizeExpense) : [];
    cacheBackofficeData();
    render();
  }

  function hasLocalBackupData() {
    return Boolean(
      localBackupAtStart.restaurants.length ||
      localBackupAtStart.collections.length ||
      localBackupAtStart.expenses.length
    );
  }

  async function loadBackofficeData({ importLocalIfEmpty = true } = {}) {
    setLoading(true);
    setSyncStatus("Loading...");
    try {
      const data = await apiRequest();
      applyBackofficeData(data);
      showApp();
      setSection(state.section);
      setSyncStatus("Saved to Supabase");

      const databaseIsEmpty = !state.restaurants.length && !state.collections.length && !state.expenses.length;
      if (importLocalIfEmpty && databaseIsEmpty && hasLocalBackupData()) {
        const confirmed = window.confirm("I found Back Office records saved in this browser. Import them into Supabase now?");
        if (confirmed) {
          await importBackupData(localBackupAtStart);
        }
      }
    } catch (error) {
      if (error.status === 401) {
        adminKey = "";
        sessionStorage.removeItem(KEY_STORAGE);
        showLogin("That admin key was not accepted.");
      } else {
        showLogin(error instanceof Error ? error.message : "Back Office could not load.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function saveAction(action, payload, successMessage = "Saved to Supabase") {
    setLoading(true);
    setSyncStatus("Saving...");
    try {
      const data = await apiRequest(action, payload);
      setSyncStatus(successMessage);
      return data;
    } catch (error) {
      setSyncStatus("Save failed");
      window.alert(error instanceof Error ? error.message : "That record could not be saved.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  function setSection(section) {
    state.section = SECTION_LABELS[section] ? section : "dashboard";
    elements.sectionTitle.textContent = SECTION_LABELS[state.section];
    elements.navItems.forEach((item) => {
      item.classList.toggle("is-active", item.dataset.section === state.section);
    });
    elements.sections.forEach((sectionElement) => {
      sectionElement.hidden = sectionElement.id !== `${state.section}-section`;
    });
    render();
  }

  function getFilteredRestaurants({ forceStatus = "" } = {}) {
    const query = String(elements.search?.value || "").trim().toLowerCase();
    const statusFilter = forceStatus || String(elements.statusFilter?.value || "all");
    return state.restaurants
      .filter((restaurant) => statusFilter === "all" || restaurant.status === statusFilter)
      .filter((restaurant) => {
        if (!query) {
          return true;
        }
        return [
          restaurant.name,
          restaurant.street,
          restaurant.city,
          restaurant.state,
          restaurant.zip,
          restaurant.phone,
          contactName(restaurant),
          restaurant.contactEmail,
          restaurant.contactCell,
          latestContactSummary(restaurant),
          restaurant.prospectStage,
          restaurant.prospectScore,
          restaurant.leadSource,
          restaurant.prospectNotes,
          restaurant.saleDate,
          restaurant.packageName,
          restaurant.monthlyAmount,
          restaurant.setupFee,
          restaurant.paymentStatus,
          restaurant.firstInvoiceDate,
          restaurant.setupStatus,
          restaurant.salesNotes,
          restaurant.notes,
        ].some((value) => String(value || "").toLowerCase().includes(query));
      })
      .sort((left, right) => {
        const leftDate = left.nextFollowUp || "9999-12-31";
        const rightDate = right.nextFollowUp || "9999-12-31";
        if (leftDate !== rightDate) {
          return leftDate.localeCompare(rightDate);
        }
        return left.name.localeCompare(right.name);
      });
  }

  function isFollowUpDue(restaurant) {
    return Boolean(restaurant.nextFollowUp && restaurant.nextFollowUp <= today());
  }

  function statusPill(status) {
    return `<span class="status-pill status-${escapeHtml(status)}">${escapeHtml(statusLabels[status] || status)}</span>`;
  }

  function labelFor(labels, value, fallback = "") {
    return labels[value] || fallback;
  }

  function moneyValue(value) {
    const trimmed = String(value || "").trim();
    if (!trimmed) {
      return "";
    }
    const amount = Number(trimmed.replace(/[$,]/g, ""));
    if (!Number.isFinite(amount)) {
      return trimmed;
    }
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: amount % 1 ? 2 : 0,
    });
  }

  function shortDate(value) {
    const match = String(value || "").match(/^(\d{2})(\d{2})-(\d{2})-(\d{2})$/);
    return match ? `${match[3]}-${match[4]}-${match[2]}` : String(value || "");
  }

  function latestContact(restaurant) {
    return [...(restaurant.contactHistory || [])]
      .filter((record) => record.date || record.note)
      .sort((left, right) => String(right.date || "").localeCompare(String(left.date || "")))[0] || null;
  }

  function latestContactSummary(restaurant) {
    const record = latestContact(restaurant);
    if (!record) {
      return restaurant.lastContacted ? shortDate(restaurant.lastContacted) : "";
    }
    const date = record.date ? shortDate(record.date) : "";
    const response = record.response ? " R" : "";
    return [record.type, date].filter(Boolean).join(" ") + response;
  }

  function contactName(restaurant) {
    return [restaurant.contactFirstName, restaurant.contactLastName].filter(Boolean).join(" ");
  }

  function restaurantOwner(id = "") {
    const existing = state.restaurants.find((restaurant) => restaurant.id === id);
    return existing?.salesperson || existing?.assignedTo || DEFAULT_OWNER;
  }

  function formattedAddress(restaurant) {
    const cityStateZip = [
      restaurant.city,
      [restaurant.state, restaurant.zip].filter(Boolean).join(" "),
    ].filter(Boolean).join(", ");
    return [restaurant.street, cityStateZip].filter(Boolean).join(", ");
  }

  function compactContact(restaurant) {
    const parts = [contactName(restaurant), restaurant.contactCell].filter(Boolean);
    return parts.length ? parts.join(" / ") : "No contact yet";
  }

  function renderMetrics() {
    const total = state.restaurants.length;
    const customers = state.restaurants.filter((restaurant) => restaurant.status === "customer").length;
    const prospects = state.restaurants.filter(isVisibleProspect).length;
    const due = state.restaurants.filter(isFollowUpDue).length;
    elements.metricTotal.textContent = total;
    elements.metricCustomers.textContent = customers;
    elements.metricProspects.textContent = prospects;
    elements.metricFollowups.textContent = due;
  }

  function isVisibleProspect(restaurant) {
    return restaurant.status === "prospect" && restaurant.prospectScore !== "1";
  }

  function prospectScoreNumber(restaurant) {
    const score = Number(restaurant.prospectScore || 0);
    return Number.isFinite(score) ? score : 0;
  }

  function dashboardRow(restaurant, dateLabel = "No follow-up") {
    return `
      <tr>
        <td><strong>${escapeHtml(restaurant.name)}</strong></td>
        <td>${statusPill(restaurant.status)}</td>
        <td>${escapeHtml(compactContact(restaurant))}</td>
        <td>${escapeHtml(dateLabel)}</td>
        <td><button class="text-button" type="button" data-edit-id="${escapeHtml(restaurant.id)}">Edit</button></td>
      </tr>
    `;
  }

  function renderDashboardLists() {
    const recent = [...state.restaurants]
      .sort((left, right) => String(right.updatedAt || "").localeCompare(String(left.updatedAt || "")))
      .slice(0, 6);
    elements.recentRestaurants.innerHTML = recent.length
      ? recent.map((restaurant) => dashboardRow(
          restaurant,
          restaurant.nextFollowUp || "No follow-up"
        )).join("")
      : '<tr><td colspan="5"><div class="empty-state">No restaurant records yet.</div></td></tr>';

    const followups = state.restaurants
      .filter((restaurant) => restaurant.nextFollowUp)
      .sort((left, right) => left.nextFollowUp.localeCompare(right.nextFollowUp))
      .slice(0, 8);
    elements.followupList.innerHTML = followups.length
      ? followups.map((restaurant) => dashboardRow(restaurant, restaurant.nextFollowUp)).join("")
      : '<tr><td colspan="5"><div class="empty-state">No follow-up dates yet.</div></td></tr>';
  }

  function renderRestaurantTable() {
    const restaurants = getFilteredRestaurants();
    elements.restaurantCount.textContent = `${restaurants.length} ${restaurants.length === 1 ? "record" : "records"}`;
    elements.restaurantTableBody.innerHTML = restaurants.length
      ? restaurants.map((restaurant) => `
          <tr>
            <td>
              <strong>${escapeHtml(restaurant.name)}</strong>
              <div class="helper">${escapeHtml(formattedAddress(restaurant) || "No address yet")}</div>
            </td>
            <td>${statusPill(restaurant.status)}</td>
            <td>${escapeHtml(contactName(restaurant) || "No contact yet")}</td>
            <td>${restaurant.contactEmail ? `<a href="mailto:${escapeHtml(restaurant.contactEmail)}">${escapeHtml(restaurant.contactEmail)}</a>` : ""}</td>
            <td>${escapeHtml(restaurant.phone || restaurant.contactCell || "")}</td>
            <td>${escapeHtml(restaurant.nextFollowUp || "")}</td>
            <td><button class="text-button" type="button" data-edit-id="${escapeHtml(restaurant.id)}">Edit</button></td>
          </tr>
        `).join("")
      : '<tr><td colspan="7"><div class="empty-state">No restaurants match this view.</div></td></tr>';
  }

  function renderProspects() {
    const scoreMin = Number(elements.prospectScoreMin?.value || 1);
    const scoreMax = Number(elements.prospectScoreMax?.value || 10);
    const min = Math.min(scoreMin, scoreMax);
    const max = Math.max(scoreMin, scoreMax);
    const prospects = getFilteredRestaurants({ forceStatus: "prospect" })
      .filter(isVisibleProspect)
      .filter((restaurant) => {
        const score = prospectScoreNumber(restaurant);
        return score >= min && score <= max;
      });
    elements.prospectList.innerHTML = prospects.length
      ? prospects.map((restaurant) => `
          <tr>
            <td>
              <button class="link-button" type="button" data-edit-id="${escapeHtml(restaurant.id)}">${escapeHtml(restaurant.name)}</button>
            </td>
            <td>${escapeHtml(contactName(restaurant) || "")}</td>
            <td>${restaurant.contactEmail ? `<a href="mailto:${escapeHtml(restaurant.contactEmail)}">${escapeHtml(restaurant.contactEmail)}</a>` : ""}</td>
            <td>${escapeHtml(restaurant.contactCell || restaurant.phone || "")}</td>
            <td>${escapeHtml(labelFor(prospectStageLabels, restaurant.prospectStage, "Not set"))}</td>
            <td>${escapeHtml(labelFor(prospectScoreLabels, restaurant.prospectScore, "Not set"))}</td>
            <td>${escapeHtml(latestContactSummary(restaurant))}</td>
            <td>${escapeHtml(shortDate(restaurant.nextFollowUp))}</td>
          </tr>
        `).join("")
      : '<tr><td colspan="8"><div class="empty-state">No prospects match this score range.</div></td></tr>';
  }

  function renderSales() {
    const customers = getFilteredRestaurants({ forceStatus: "customer" });
    elements.salesList.innerHTML = customers.length
      ? customers.map((restaurant) => `
          <tr>
            <td>
              <strong>${escapeHtml(restaurant.name)}</strong>
            </td>
            <td>${escapeHtml(restaurant.saleDate || "")}</td>
            <td>${escapeHtml(restaurant.packageName || "")}</td>
            <td>${escapeHtml(moneyValue(restaurant.monthlyAmount))}</td>
            <td>${escapeHtml(labelFor(paymentStatusLabels, restaurant.paymentStatus, "Not set"))}</td>
            <td>${escapeHtml(labelFor(setupStatusLabels, restaurant.setupStatus, "Not set"))}</td>
            <td><button class="text-button" type="button" data-edit-id="${escapeHtml(restaurant.id)}">Edit</button></td>
          </tr>
        `).join("")
      : '<tr><td colspan="7"><div class="empty-state">No sales yet. Change a restaurant status to Customer or use New Sale.</div></td></tr>';
  }

  function renderCollectionRestaurantOptions() {
    const customers = state.restaurants
      .filter((restaurant) => restaurant.status === "customer")
      .sort((left, right) => left.name.localeCompare(right.name));
    elements.collectionRestaurant.innerHTML = [
      '<option value="">Choose restaurant</option>',
      ...customers.map((restaurant) => `<option value="${escapeHtml(restaurant.id)}">${escapeHtml(restaurant.name)}</option>`),
    ].join("");
  }

  function renderCollections() {
    renderCollectionRestaurantOptions();
    const records = [...state.collections].sort((left, right) => {
      const leftDate = left.dueDate || "9999-12-31";
      const rightDate = right.dueDate || "9999-12-31";
      return leftDate.localeCompare(rightDate);
    });
    elements.collectionsList.innerHTML = records.length
      ? records.map((record) => `
          <tr>
            <td><strong>${escapeHtml(record.restaurantName || "No restaurant")}</strong></td>
            <td>${escapeHtml(record.invoiceNumber)}</td>
            <td>${escapeHtml(shortDate(record.dueDate))}</td>
            <td>${escapeHtml(moneyValue(record.amount))}</td>
            <td>${escapeHtml(labelFor(collectionStatusLabels, record.status, "Not Sent"))}</td>
            <td>${escapeHtml(shortDate(record.paidDate))}</td>
            <td>${escapeHtml(record.notes)}</td>
            <td><button class="text-button" type="button" data-delete-collection-id="${escapeHtml(record.id)}">Remove</button></td>
          </tr>
        `).join("")
      : '<tr><td colspan="8"><div class="empty-state">No collection records yet.</div></td></tr>';
  }

  function renderExpenses() {
    const records = [...state.expenses].sort((left, right) => String(right.date || "").localeCompare(String(left.date || "")));
    elements.expensesList.innerHTML = records.length
      ? records.map((record) => `
          <tr>
            <td>${escapeHtml(shortDate(record.date))}</td>
            <td><strong>${escapeHtml(record.vendor || "No vendor")}</strong></td>
            <td>${escapeHtml(labelFor(expenseCategoryLabels, record.category, "Other"))}</td>
            <td>${escapeHtml(moneyValue(record.amount))}</td>
            <td>${escapeHtml(record.paymentMethod)}</td>
            <td>${escapeHtml(record.notes)}</td>
            <td><button class="text-button" type="button" data-delete-expense-id="${escapeHtml(record.id)}">Remove</button></td>
          </tr>
        `).join("")
      : '<tr><td colspan="7"><div class="empty-state">No expense records yet.</div></td></tr>';
  }

  function render() {
    renderMetrics();
    renderDashboardLists();
    renderRestaurantTable();
    renderProspects();
    renderSales();
    renderCollections();
    renderExpenses();
  }

  function fillRestaurantForm(restaurant = null, defaultStatus = "prospect") {
    const record = restaurant || normalizeRestaurant({ status: defaultStatus, dateAdded: today() });
    elements.id.value = restaurant ? record.id : "";
    elements.name.value = restaurant ? record.name : "";
    elements.status.value = record.status;
    elements.street.value = restaurant ? record.street : "";
    elements.city.value = restaurant ? record.city : "";
    elements.state.value = restaurant ? record.state : "";
    elements.zip.value = restaurant ? record.zip : "";
    elements.phone.value = restaurant ? record.phone : "";
    elements.contactFirstName.value = restaurant ? record.contactFirstName : "";
    elements.contactLastName.value = restaurant ? record.contactLastName : "";
    elements.contactEmail.value = restaurant ? record.contactEmail : "";
    elements.contactCell.value = restaurant ? record.contactCell : "";
    elements.dateAdded.value = record.dateAdded || today();
    elements.lastContacted.value = restaurant ? record.lastContacted : "";
    elements.nextFollowUp.value = restaurant ? record.nextFollowUp : "";
    elements.notes.value = restaurant ? record.notes : "";
    elements.prospectStage.value = restaurant ? record.prospectStage : "";
    elements.prospectScore.value = record.prospectScore || "";
    elements.leadSource.value = restaurant ? record.leadSource : "";
    elements.prospectNotes.value = restaurant ? record.prospectNotes : "";
    state.editingContactHistory = restaurant ? [...record.contactHistory] : [];
    elements.contactHistoryType.value = "E";
    elements.contactHistoryDate.value = today();
    elements.contactHistoryResponse.checked = false;
    elements.contactHistoryNote.value = "";
    renderContactHistoryEditor();
    elements.saleDate.value = restaurant ? record.saleDate : "";
    elements.packageName.value = restaurant ? record.packageName : "";
    elements.monthlyAmount.value = restaurant ? record.monthlyAmount : "";
    elements.setupFee.value = restaurant ? record.setupFee : "";
    elements.paymentStatus.value = restaurant ? record.paymentStatus : "";
    elements.firstInvoiceDate.value = restaurant ? record.firstInvoiceDate : "";
    elements.setupStatus.value = restaurant ? record.setupStatus : "";
    elements.salesNotes.value = restaurant ? record.salesNotes : "";
    elements.deleteRestaurantButton.hidden = !restaurant;
    elements.editorTitle.textContent = restaurant ? "Edit Restaurant" : "New Restaurant";
  }

  function restaurantFromForm() {
    return normalizeRestaurant({
      id: elements.id.value || makeId(),
      name: elements.name.value,
      status: elements.status.value,
      street: elements.street.value,
      city: elements.city.value,
      state: elements.state.value,
      zip: elements.zip.value,
      phone: elements.phone.value,
      contactFirstName: elements.contactFirstName.value,
      contactLastName: elements.contactLastName.value,
      contactEmail: elements.contactEmail.value,
      contactCell: elements.contactCell.value,
      dateAdded: elements.dateAdded.value,
      lastContacted: elements.lastContacted.value,
      nextFollowUp: elements.nextFollowUp.value,
      notes: elements.notes.value,
      prospectStage: elements.prospectStage.value,
      prospectScore: elements.prospectScore.value,
      leadSource: elements.leadSource.value,
      assignedTo: restaurantOwner(elements.id.value),
      prospectNotes: elements.prospectNotes.value,
      contactHistory: state.editingContactHistory,
      saleDate: elements.saleDate.value,
      packageName: elements.packageName.value,
      monthlyAmount: elements.monthlyAmount.value,
      setupFee: elements.setupFee.value,
      paymentStatus: elements.paymentStatus.value,
      firstInvoiceDate: elements.firstInvoiceDate.value,
      salesperson: restaurantOwner(elements.id.value),
      setupStatus: elements.setupStatus.value,
      salesNotes: elements.salesNotes.value,
      updatedAt: new Date().toISOString(),
    });
  }

  function openRestaurantEditor(id = "", defaultStatus = "prospect") {
    const restaurant = id ? state.restaurants.find((record) => record.id === id) : null;
    fillRestaurantForm(restaurant, defaultStatus);
    elements.dialog.showModal();
  }

  function closeRestaurantEditor() {
    elements.dialog.close();
  }

  function contactHistoryItem(record) {
    const response = record.response ? "Response" : "No response";
    return `
      <div class="contact-history-item">
        <strong>${escapeHtml(record.type)} ${escapeHtml(shortDate(record.date))}</strong>
        <span>${escapeHtml(response)}</span>
        ${record.note ? `<p>${escapeHtml(record.note)}</p>` : ""}
        <button class="text-button" type="button" data-remove-contact-id="${escapeHtml(record.id)}">Remove</button>
      </div>
    `;
  }

  function renderContactHistoryEditor() {
    const records = [...state.editingContactHistory]
      .sort((left, right) => String(right.date || "").localeCompare(String(left.date || "")));
    elements.contactHistoryList.innerHTML = records.length
      ? records.map(contactHistoryItem).join("")
      : '<div class="empty-state">No contacts logged yet.</div>';
  }

  function addContactHistory() {
    const record = normalizeContactHistory([{
      id: makeContactId(),
      type: elements.contactHistoryType.value,
      date: elements.contactHistoryDate.value || today(),
      response: elements.contactHistoryResponse.checked,
      note: elements.contactHistoryNote.value,
    }])[0];
    if (!record) {
      return;
    }
    state.editingContactHistory.unshift(record);
    if (!elements.lastContacted.value || record.date > elements.lastContacted.value) {
      elements.lastContacted.value = record.date;
    }
    elements.contactHistoryDate.value = today();
    elements.contactHistoryResponse.checked = false;
    elements.contactHistoryNote.value = "";
    renderContactHistoryEditor();
  }

  function removeContactHistory(id) {
    state.editingContactHistory = state.editingContactHistory.filter((record) => record.id !== id);
    renderContactHistoryEditor();
  }

  async function addCollection(event) {
    event.preventDefault();
    const restaurant = state.restaurants.find((record) => record.id === elements.collectionRestaurant.value);
    const record = normalizeCollection({
      id: makeCollectionId(),
      restaurantId: restaurant?.id || "",
      restaurantName: restaurant?.name || "",
      invoiceNumber: elements.collectionInvoice.value,
      dueDate: elements.collectionDueDate.value,
      amount: elements.collectionAmount.value,
      status: elements.collectionStatus.value,
      paidDate: elements.collectionPaidDate.value,
      notes: elements.collectionNotes.value,
    });
    if (!record.restaurantName && !record.invoiceNumber && !record.amount) {
      return;
    }
    const data = await saveAction("saveCollection", { collection: record });
    if (!data?.collection) {
      return;
    }
    state.collections.unshift(normalizeCollection(data.collection));
    cacheBackofficeData();
    elements.collectionForm.reset();
    elements.collectionStatus.value = "not-sent";
    renderCollections();
  }

  async function deleteCollection(id) {
    const data = await saveAction("deleteCollection", { id }, "Removed from Supabase");
    if (!data) {
      return;
    }
    state.collections = state.collections.filter((record) => record.id !== id);
    cacheBackofficeData();
    renderCollections();
  }

  async function addExpense(event) {
    event.preventDefault();
    const record = normalizeExpense({
      id: makeExpenseId(),
      date: elements.expenseDate.value || today(),
      vendor: elements.expenseVendor.value,
      category: elements.expenseCategory.value,
      amount: elements.expenseAmount.value,
      paymentMethod: elements.expensePaymentMethod.value,
      notes: elements.expenseNotes.value,
    });
    if (!record.vendor && !record.amount && !record.notes) {
      return;
    }
    const data = await saveAction("saveExpense", { expense: record });
    if (!data?.expense) {
      return;
    }
    state.expenses.unshift(normalizeExpense(data.expense));
    cacheBackofficeData();
    elements.expenseForm.reset();
    elements.expenseDate.value = today();
    elements.expenseCategory.value = "software";
    renderExpenses();
  }

  async function deleteExpense(id) {
    const data = await saveAction("deleteExpense", { id }, "Removed from Supabase");
    if (!data) {
      return;
    }
    state.expenses = state.expenses.filter((record) => record.id !== id);
    cacheBackofficeData();
    renderExpenses();
  }

  async function saveRestaurant(event) {
    event.preventDefault();
    const record = restaurantFromForm();
    const data = await saveAction("saveRestaurant", { restaurant: record });
    if (!data?.restaurant) {
      return;
    }
    const savedRecord = normalizeRestaurant(data.restaurant);
    const existingIndex = state.restaurants.findIndex((restaurant) => restaurant.id === record.id);
    if (existingIndex >= 0) {
      state.restaurants[existingIndex] = savedRecord;
    } else {
      state.restaurants.unshift(savedRecord);
    }
    cacheBackofficeData();
    closeRestaurantEditor();
    render();
  }

  async function deleteCurrentRestaurant() {
    const id = elements.id.value;
    if (!id) {
      return;
    }
    const restaurant = state.restaurants.find((record) => record.id === id);
    const confirmed = window.confirm(`Delete ${restaurant?.name || "this restaurant"} from this browser's Back Office list?`);
    if (!confirmed) {
      return;
    }
    const data = await saveAction("deleteRestaurant", { id }, "Removed from Supabase");
    if (!data) {
      return;
    }
    state.restaurants = state.restaurants.filter((record) => record.id !== id);
    state.collections = state.collections.map((record) =>
      record.restaurantId === id ? { ...record, restaurantId: "" } : record
    );
    cacheBackofficeData();
    closeRestaurantEditor();
    render();
  }

  function exportBackup() {
    const backup = {
      exportedAt: new Date().toISOString(),
      restaurants: state.restaurants,
      collections: state.collections,
      expenses: state.expenses,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `communityverse-backoffice-${today()}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function importBackupData(backup) {
    const data = await saveAction("importBackup", { backup }, "Imported to Supabase");
    if (!data) {
      return;
    }
    applyBackofficeData(data);
    window.alert(`Imported ${state.restaurants.length} restaurants, ${state.collections.length} collections, and ${state.expenses.length} expenses.`);
  }

  function importBackupFile(file) {
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", async () => {
      try {
        const parsed = JSON.parse(String(reader.result || "{}"));
        const records = Array.isArray(parsed.restaurants) ? parsed.restaurants : Array.isArray(parsed) ? parsed : [];
        await importBackupData({
          restaurants: records,
          collections: Array.isArray(parsed.collections) ? parsed.collections : [],
          expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
        });
      } catch {
        window.alert("That backup file could not be imported.");
      }
    });
    reader.readAsText(file);
  }

  elements.navItems.forEach((item) => {
    item.addEventListener("click", () => setSection(item.dataset.section));
  });

  elements.loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    adminKey = elements.adminKey.value.trim();
    sessionStorage.setItem(KEY_STORAGE, adminKey);
    elements.loginError.textContent = "";
    loadBackofficeData();
  });

  document.querySelectorAll("[data-jump-section]").forEach((button) => {
    button.addEventListener("click", () => setSection(button.dataset.jumpSection));
  });

  document.querySelectorAll("[data-new-status]").forEach((button) => {
    button.addEventListener("click", () => openRestaurantEditor("", button.dataset.newStatus));
  });

  elements.newRestaurantButton.addEventListener("click", () => openRestaurantEditor());
  elements.closeEditorButton.addEventListener("click", closeRestaurantEditor);
  elements.cancelEditorButton.addEventListener("click", closeRestaurantEditor);
  elements.deleteRestaurantButton.addEventListener("click", deleteCurrentRestaurant);
  elements.addContactHistoryButton.addEventListener("click", addContactHistory);
  elements.form.addEventListener("submit", saveRestaurant);
  elements.collectionForm.addEventListener("submit", addCollection);
  elements.expenseForm.addEventListener("submit", addExpense);
  elements.search.addEventListener("input", renderRestaurantTable);
  elements.statusFilter.addEventListener("change", renderRestaurantTable);
  elements.prospectScoreMin.addEventListener("change", renderProspects);
  elements.prospectScoreMax.addEventListener("change", renderProspects);
  elements.exportButton.addEventListener("click", exportBackup);
  elements.importButton.addEventListener("click", () => elements.importFile.click());
  elements.importFile.addEventListener("change", (event) => {
    importBackupFile(event.target.files?.[0]);
    event.target.value = "";
  });

  document.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-id]");
    if (editButton) {
      openRestaurantEditor(editButton.dataset.editId);
    }
    const removeContactButton = event.target.closest("[data-remove-contact-id]");
    if (removeContactButton) {
      removeContactHistory(removeContactButton.dataset.removeContactId);
    }
    const deleteCollectionButton = event.target.closest("[data-delete-collection-id]");
    if (deleteCollectionButton) {
      deleteCollection(deleteCollectionButton.dataset.deleteCollectionId);
    }
    const deleteExpenseButton = event.target.closest("[data-delete-expense-id]");
    if (deleteExpenseButton) {
      deleteExpense(deleteExpenseButton.dataset.deleteExpenseId);
    }
  });

  elements.expenseDate.value = today();
  if (adminKey) {
    loadBackofficeData();
  } else {
    showLogin();
  }
})();
