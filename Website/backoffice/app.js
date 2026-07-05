(() => {
  const STORAGE_KEY = "communityverseBackofficeRestaurants";
  const COLLECTIONS_KEY = "communityverseBackofficeCollections";
  const EXPENSES_KEY = "communityverseBackofficeExpenses";
  const KEY_STORAGE = "communityverseBackofficeAdminKey";
  const SECTION_STORAGE = "communityverseBackofficeSection";
  const API_URL = "/api/backoffice";
  const DEFAULT_OWNER = "Tim";
  const INVOICE_SENDER = {
    name: "Tim Collins",
    business: "CommunityVerse Games",
    street: "3155 Waterplace Cove",
    cityStateZip: "Villa Rica, GA 30180",
    phone: "404-428-6302",
  };
  const PAYMENT_LINK = "https://www.paypal.com/ncp/payment/HSHM25X6JZFZ4";
  const SECTION_LABELS = {
    dashboard: "Dashboard",
    restaurants: "Restaurant List",
    prospects: "Prospects",
    sales: "Sales",
    collections: "Invoices",
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
    "restaurant-materials": "Restaurant Materials",
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
    restaurantSortButtons: [...document.querySelectorAll("[data-restaurant-sort]")],
    salesSortButtons: [...document.querySelectorAll("[data-sales-sort]")],
    newRestaurantButton: document.querySelector("#new-restaurant-button"),
    importButton: document.querySelector("#import-button"),
    exportButton: document.querySelector("#export-button"),
    importFile: document.querySelector("#import-file"),
    search: document.querySelector("#restaurant-search"),
    statusFilter: document.querySelector("#restaurant-status-filter"),
    restaurantCount: document.querySelector("#restaurant-count"),
    restaurantTableBody: document.querySelector("#restaurant-table-body"),
    monthlySalesList: document.querySelector("#monthly-sales-list"),
    topProspectList: document.querySelector("#top-prospect-list"),
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
    invoiceTemplateMonth: document.querySelector("#invoice-template-month"),
    invoiceTemplateType: document.querySelector("#invoice-template-type"),
    invoiceTemplateDescription: document.querySelector("#invoice-template-description"),
    invoiceTemplateAmount: document.querySelector("#invoice-template-amount"),
    fillMonthlyInvoiceButton: document.querySelector("#fill-monthly-invoice-button"),
    invoicePreviewDialog: document.querySelector("#invoice-preview-dialog"),
    invoicePreviewContent: document.querySelector("#invoice-preview-content"),
    closeInvoicePreviewButton: document.querySelector("#close-invoice-preview-button"),
    printInvoiceButton: document.querySelector("#print-invoice-button"),
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
    saleDetailsSection: document.querySelector("#sale-details-section"),
    serviceStartDate: document.querySelector("#service-start-date"),
    serviceEndDate: document.querySelector("#service-end-date"),
    packageName: document.querySelector("#package-name"),
    monthlyAmount: document.querySelector("#monthly-amount"),
    setupFee: document.querySelector("#setup-fee"),
    paymentStatus: document.querySelector("#payment-status"),
    firstInvoiceDate: document.querySelector("#first-invoice-date"),
    setupStatus: document.querySelector("#setup-status"),
    salesNotes: document.querySelector("#sales-notes"),
    quickContactDialog: document.querySelector("#quick-contact-dialog"),
    quickContactForm: document.querySelector("#quick-contact-form"),
    quickContactTitle: document.querySelector("#quick-contact-title"),
    quickContactDetails: document.querySelector("#quick-contact-details"),
    quickContactId: document.querySelector("#quick-contact-id"),
    quickContactType: document.querySelector("#quick-contact-type"),
    quickContactDate: document.querySelector("#quick-contact-date"),
    quickContactResponse: document.querySelector("#quick-contact-response"),
    quickContactNextFollowUp: document.querySelector("#quick-contact-next-follow-up"),
    quickContactClearFollowUp: document.querySelector("#quick-contact-clear-follow-up"),
    quickContactScore: document.querySelector("#quick-contact-score"),
    quickContactNote: document.querySelector("#quick-contact-note"),
    quickContactHistoryList: document.querySelector("#quick-contact-history-list"),
    quickContactFullCardButton: document.querySelector("#quick-contact-full-card-button"),
    closeQuickContactButton: document.querySelector("#close-quick-contact-button"),
    cancelQuickContactButton: document.querySelector("#cancel-quick-contact-button"),
  };

  const state = {
    section: savedSection(),
    restaurants: [],
    collections: [],
    expenses: [],
    editingContactHistory: [],
    editingContactId: "",
    editingCollectionId: "",
    editingExpenseId: "",
    invoicePreviewId: "",
    loading: false,
    restaurantSortKey: "followup",
    restaurantSortDirection: "asc",
    salesSortKey: "saleDate",
    salesSortDirection: "desc",
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

  function currentMonth() {
    return today().slice(0, 7);
  }

  function currentYear() {
    return today().slice(0, 4);
  }

  function savedSection() {
    try {
      const section = localStorage.getItem(SECTION_STORAGE);
      return SECTION_LABELS[section] ? section : "prospects";
    } catch {
      return "prospects";
    }
  }

  function monthDateRange(monthValue = currentMonth()) {
    const [yearText, monthText] = String(monthValue || currentMonth()).split("-");
    const year = Number(yearText);
    const monthIndex = Number(monthText) - 1;
    if (!year || monthIndex < 0) {
      return monthDateRange(currentMonth());
    }
    const start = new Date(year, monthIndex, 1);
    const end = new Date(year, monthIndex + 1, 0);
    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      label: `${start.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })} - ${end.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}`,
      invoiceMonth: `${yearText}${monthText}`,
    };
  }

  function longDate(dateText) {
    if (!dateText) {
      return "";
    }
    const date = new Date(`${dateText}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    return date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
  }

  function monthLabel(monthValue) {
    const [yearText, monthText] = String(monthValue || "").split("-");
    const year = Number(yearText);
    const monthIndex = Number(monthText) - 1;
    if (!year || monthIndex < 0) {
      return monthValue || "";
    }
    return new Date(year, monthIndex, 1).toLocaleDateString(undefined, { month: "short", year: "numeric" });
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
      serviceStartDate: String(record.serviceStartDate || record.saleDate || "").trim(),
      serviceEndDate: String(record.serviceEndDate || "").trim(),
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
      elements.quickContactFullCardButton,
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
    fillNextInvoiceNumber();
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
    try {
      localStorage.setItem(SECTION_STORAGE, state.section);
    } catch {
      // The Back Office can still work if this browser refuses saved page state.
    }
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
      .sort(compareRestaurants);
  }

  function restaurantSortValue(restaurant, key) {
    if (key === "status") return labelFor(statusLabels, restaurant.status, restaurant.status);
    if (key === "contact") return contactName(restaurant);
    if (key === "email") return restaurant.contactEmail;
    if (key === "phone") return restaurant.phone || restaurant.contactCell;
    if (key === "followup") return restaurant.nextFollowUp || "9999-12-31";
    return restaurant.name;
  }

  function compareRestaurants(left, right) {
    const direction = state.restaurantSortDirection === "desc" ? -1 : 1;
    const key = state.restaurantSortKey;
    const leftValue = restaurantSortValue(left, key);
    const rightValue = restaurantSortValue(right, key);
    const compared = String(leftValue || "").localeCompare(String(rightValue || ""), undefined, {
      numeric: true,
      sensitivity: "base",
    });
    if (compared !== 0) {
      return compared * direction;
    }
    return left.name.localeCompare(right.name, undefined, { sensitivity: "base" });
  }

  function updateRestaurantSortButtons() {
    elements.restaurantSortButtons.forEach((button) => {
      const active = button.dataset.restaurantSort === state.restaurantSortKey;
      button.classList.toggle("is-active", active);
      button.dataset.direction = active ? state.restaurantSortDirection : "";
      button.setAttribute("aria-sort", active ? (state.restaurantSortDirection === "asc" ? "ascending" : "descending") : "none");
    });
  }

  function setRestaurantSort(key) {
    if (state.restaurantSortKey === key) {
      state.restaurantSortDirection = state.restaurantSortDirection === "asc" ? "desc" : "asc";
    } else {
      state.restaurantSortKey = key;
      state.restaurantSortDirection = "asc";
    }
    renderRestaurantTable();
  }

  function salesSortValue(restaurant, key) {
    if (key === "saleDate") return restaurant.saleDate || "0000-00-00";
    if (key === "package") return restaurant.packageName;
    if (key === "monthly") return Number(restaurant.monthlyAmount || 0);
    if (key === "payment") return labelFor(paymentStatusLabels, restaurant.paymentStatus, "Not set");
    if (key === "setup") return labelFor(setupStatusLabels, restaurant.setupStatus, "Not set");
    return restaurant.name;
  }

  function compareSales(left, right) {
    const direction = state.salesSortDirection === "desc" ? -1 : 1;
    const key = state.salesSortKey;
    const leftValue = salesSortValue(left, key);
    const rightValue = salesSortValue(right, key);
    const compared = String(leftValue || "").localeCompare(String(rightValue || ""), undefined, {
      numeric: true,
      sensitivity: "base",
    });
    if (compared !== 0) {
      return compared * direction;
    }
    return left.name.localeCompare(right.name, undefined, { sensitivity: "base" });
  }

  function updateSalesSortButtons() {
    elements.salesSortButtons.forEach((button) => {
      const active = button.dataset.salesSort === state.salesSortKey;
      button.classList.toggle("is-active", active);
      button.dataset.direction = active ? state.salesSortDirection : "";
      button.setAttribute("aria-sort", active ? (state.salesSortDirection === "asc" ? "ascending" : "descending") : "none");
    });
  }

  function setSalesSort(key) {
    if (state.salesSortKey === key) {
      state.salesSortDirection = state.salesSortDirection === "asc" ? "desc" : "asc";
    } else {
      state.salesSortKey = key;
      state.salesSortDirection = key === "saleDate" ? "desc" : "asc";
    }
    renderSales();
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
    const customers = state.restaurants.filter((restaurant) => restaurant.status === "customer");
    const thisMonthSales = sumMonthlySales(customers.filter((restaurant) => saleMonth(restaurant) === currentMonth()));
    const recurringMonthly = sumMonthlySales(customers.filter(isRecurringSale));
    const yearSales = sumMonthlySales(customers.filter((restaurant) => saleYear(restaurant) === currentYear()));
    const topProspects = state.restaurants.filter(isTopProspect).length;
    elements.metricTotal.textContent = moneyMetric(thisMonthSales);
    elements.metricCustomers.textContent = moneyMetric(recurringMonthly);
    elements.metricProspects.textContent = moneyMetric(yearSales);
    elements.metricFollowups.textContent = topProspects;
  }

  function isVisibleProspect(restaurant) {
    return restaurant.status === "prospect" && restaurant.prospectScore !== "1";
  }

  function prospectScoreNumber(restaurant) {
    const score = Number(restaurant.prospectScore || 0);
    return Number.isFinite(score) ? score : 0;
  }

  function saleDateFor(restaurant) {
    return restaurant.saleDate || restaurant.serviceStartDate || "";
  }

  function saleMonth(restaurant) {
    return saleDateFor(restaurant).slice(0, 7);
  }

  function saleYear(restaurant) {
    return saleDateFor(restaurant).slice(0, 4);
  }

  function sumMonthlySales(restaurants) {
    return restaurants.reduce((total, restaurant) => total + numberFromMoney(restaurant.monthlyAmount, 0), 0);
  }

  function moneyMetric(value) {
    return moneyValue(String(value));
  }

  function isRecurringSale(restaurant) {
    return restaurant.status === "customer" && (!restaurant.serviceEndDate || restaurant.serviceEndDate >= today());
  }

  function isTopProspect(restaurant) {
    return isVisibleProspect(restaurant) && prospectScoreNumber(restaurant) >= 7;
  }

  function monthlySalesRows() {
    const months = state.restaurants
      .filter((restaurant) => restaurant.status === "customer" && saleMonth(restaurant))
      .reduce((records, restaurant) => {
        const month = saleMonth(restaurant);
        if (!records.has(month)) {
          records.set(month, { month, count: 0, amount: 0 });
        }
        const record = records.get(month);
        record.count += 1;
        record.amount += numberFromMoney(restaurant.monthlyAmount, 0);
        return records;
      }, new Map());
    return [...months.values()].sort((left, right) => right.month.localeCompare(left.month));
  }

  function topProspectRow(restaurant) {
    return `
      <tr>
        <td>
          <button class="link-button strong-link" type="button" data-contact-id="${escapeHtml(restaurant.id)}">${escapeHtml(restaurant.name)}</button>
        </td>
        <td>${escapeHtml(String(prospectScoreNumber(restaurant)))}</td>
        <td>${escapeHtml(compactContact(restaurant))}</td>
        <td>${escapeHtml(shortDate(restaurant.nextFollowUp) || "No follow-up")}</td>
      </tr>
    `;
  }

  function renderDashboardLists() {
    const monthlyRows = monthlySalesRows();
    elements.monthlySalesList.innerHTML = monthlyRows.length
      ? monthlyRows.map((record) => `
          <tr>
            <td><strong>${escapeHtml(monthLabel(record.month))}</strong></td>
            <td>${record.count}</td>
            <td>${escapeHtml(moneyMetric(record.amount))}</td>
          </tr>
        `).join("")
      : '<tr><td colspan="3"><div class="empty-state">No sales yet.</div></td></tr>';

    const topProspects = state.restaurants
      .filter(isTopProspect)
      .sort((left, right) =>
        prospectScoreNumber(right) - prospectScoreNumber(left) ||
        String(left.nextFollowUp || "9999-12-31").localeCompare(String(right.nextFollowUp || "9999-12-31")) ||
        left.name.localeCompare(right.name)
      )
      .slice(0, 8);
    elements.topProspectList.innerHTML = topProspects.length
      ? topProspects.map(topProspectRow).join("")
      : '<tr><td colspan="4"><div class="empty-state">No prospects at 7 or higher yet.</div></td></tr>';
  }

  function renderRestaurantTable() {
    const restaurants = getFilteredRestaurants();
    updateRestaurantSortButtons();
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
              <button class="link-button" type="button" data-contact-id="${escapeHtml(restaurant.id)}">${escapeHtml(restaurant.name)}</button>
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
    updateSalesSortButtons();
    const customers = getFilteredRestaurants({ forceStatus: "customer" }).sort(compareSales);
    elements.salesList.innerHTML = customers.length
      ? customers.map((restaurant) => `
          <tr>
            <td>
              <button class="link-button strong-link" type="button" data-edit-id="${escapeHtml(restaurant.id)}">${escapeHtml(restaurant.name)}</button>
            </td>
            <td>${escapeHtml(restaurant.saleDate || "")}</td>
            <td>${escapeHtml(shortDate(restaurant.serviceStartDate))}</td>
            <td>${escapeHtml(shortDate(restaurant.serviceEndDate) || "Open")}</td>
            <td>${escapeHtml(restaurant.packageName || "")}</td>
            <td>${escapeHtml(moneyValue(restaurant.monthlyAmount))}</td>
            <td>${escapeHtml(labelFor(paymentStatusLabels, restaurant.paymentStatus, "Not set"))}</td>
            <td>${escapeHtml(labelFor(setupStatusLabels, restaurant.setupStatus, "Not set"))}</td>
          </tr>
        `).join("")
      : '<tr><td colspan="8"><div class="empty-state">No sales yet. Change a restaurant status to Customer or use New Sale.</div></td></tr>';
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

  function nextInvoiceNumber() {
    const largestNumber = state.collections.reduce((largest, record) => {
      const match = String(record.invoiceNumber || "").match(/\d+/);
      const invoiceNumber = match ? Number(match[0]) : 0;
      return Math.max(largest, invoiceNumber);
    }, 0);
    return String(largestNumber + 1).padStart(3, "0");
  }

  function fillNextInvoiceNumber() {
    if (!elements.collectionInvoice.value.trim()) {
      elements.collectionInvoice.value = nextInvoiceNumber();
    }
  }

  function updateInvoiceTemplateAmount() {
    const amount = elements.invoiceTemplateAmount.value.trim();
    if (amount && amount !== "19" && amount !== "9.50") {
      return;
    }
    const restaurant = state.restaurants.find((record) => record.id === elements.collectionRestaurant.value);
    const monthValue = elements.invoiceTemplateMonth.value || currentMonth();
    const monthlyAmount = numberFromMoney(restaurant?.monthlyAmount, 19);
    const billingType = elements.invoiceTemplateType.value;
    const nextAmount = billingType === "half"
      ? monthlyAmount / 2
      : billingType === "auto"
        ? proratedAmount(monthlyAmount, restaurant?.serviceStartDate, monthValue)
        : monthlyAmount;
    elements.invoiceTemplateAmount.value = String(nextAmount.toFixed(2)).replace(/\.00$/, "");
  }

  function numberFromMoney(value, fallback = 19) {
    const rawValue = String(value || "");
    const amount = Number(rawValue.replace(/[^0-9.]/g, ""));
    return /\d/.test(rawValue) && Number.isFinite(amount) && amount >= 0 ? amount : fallback;
  }

  function proratedAmount(monthlyAmount, startDate, monthValue) {
    const range = monthDateRange(monthValue);
    if (!startDate || !startDate.startsWith(monthValue)) {
      return monthlyAmount;
    }
    const startDay = Number(startDate.slice(8, 10));
    const totalDays = Number(range.end.slice(8, 10));
    if (!startDay || startDay <= 1 || !totalDays) {
      return monthlyAmount;
    }
    const billableDays = totalDays - startDay + 1;
    return Math.round((monthlyAmount * billableDays / totalDays) * 100) / 100;
  }

  function invoiceDueDateFor(restaurant, monthValue, billingType, isProrated) {
    if (billingType === "half" || isProrated) {
      return restaurant?.saleDate || restaurant?.serviceStartDate || today();
    }
    return `${monthValue}-01`;
  }

  function invoiceServicePeriod(restaurant, monthValue, billingType, isProrated) {
    const range = monthDateRange(monthValue);
    if (!(billingType === "half" || isProrated)) {
      return { label: range.label, prefix: "Service period" };
    }
    const startDate = restaurant?.serviceStartDate || restaurant?.saleDate || range.start;
    const periodStart = startDate.startsWith(monthValue) ? startDate : range.start;
    return {
      label: `${longDate(periodStart) || longDate(range.start)} - ${longDate(range.end)}`,
      prefix: "Partial service period",
    };
  }

  function fillMonthlyInvoiceTemplate() {
    const restaurant = state.restaurants.find((record) => record.id === elements.collectionRestaurant.value);
    const monthValue = elements.invoiceTemplateMonth.value || currentMonth();
    const restaurantName = restaurant?.name || "Restaurant Challenge";
    const billingType = elements.invoiceTemplateType.value;
    const monthlyAmount = numberFromMoney(restaurant?.monthlyAmount, 19);
    const calculatedAmount = billingType === "half"
      ? monthlyAmount / 2
      : billingType === "auto"
        ? proratedAmount(monthlyAmount, restaurant?.serviceStartDate, monthValue)
        : monthlyAmount;
    const isProrated = calculatedAmount !== monthlyAmount;
    const defaultDescription = billingType === "half" || isProrated
      ? `${restaurantName} Game Partial Month Subscription`
      : `${restaurantName} Game Monthly Subscription`;
    const description = elements.invoiceTemplateDescription.value.trim() || defaultDescription;
    const enteredAmount = elements.invoiceTemplateAmount.value.trim();
    const defaultAmountText = String(calculatedAmount.toFixed(2)).replace(/\.00$/, "");
    const amount = enteredAmount && !["19", "9.50"].includes(enteredAmount) ? enteredAmount : defaultAmountText;
    elements.invoiceTemplateMonth.value = monthValue;
    elements.collectionInvoice.value = nextInvoiceNumber();
    elements.collectionDueDate.value = invoiceDueDateFor(restaurant, monthValue, billingType, isProrated);
    elements.collectionAmount.value = amount;
    elements.collectionStatus.value = "not-sent";
    const period = invoiceServicePeriod(restaurant, monthValue, billingType, isProrated);
    elements.collectionNotes.value = `${description}. ${period.prefix}: ${period.label}.`;
  }

  function renderCollections() {
    renderCollectionRestaurantOptions();
    const records = [...state.collections].sort((left, right) => {
      const leftDate = left.dueDate || "9999-12-31";
      const rightDate = right.dueDate || "9999-12-31";
      return leftDate.localeCompare(rightDate);
    });
    elements.collectionsList.innerHTML = records.length
      ? records.map(collectionRow).join("")
      : '<tr><td colspan="8"><div class="empty-state">No collection records yet.</div></td></tr>';
  }

  function collectionStatusOptions(selectedStatus = "") {
    return Object.entries(collectionStatusLabels).map(([value, label]) => `
      <option value="${escapeHtml(value)}"${value === selectedStatus ? " selected" : ""}>${escapeHtml(label)}</option>
    `).join("");
  }

  function invoiceTableNote(notes = "") {
    const text = String(notes || "").trim();
    const periodMatch = text.match(/(?:Partial service period|Service period):\s*(.+?)(?:\.\s*$|$)/i);
    return periodMatch ? periodMatch[1].trim() : text;
  }

  function collectionRow(record) {
    if (state.editingCollectionId === record.id) {
      return `
        <tr data-collection-editor-id="${escapeHtml(record.id)}">
          <td><strong>${escapeHtml(record.restaurantName || "No restaurant")}</strong></td>
          <td><input data-edit-collection-invoice value="${escapeHtml(record.invoiceNumber)}" /></td>
          <td><input data-edit-collection-due-date type="date" value="${escapeHtml(record.dueDate)}" /></td>
          <td><input data-edit-collection-amount inputmode="decimal" value="${escapeHtml(record.amount)}" /></td>
          <td>
            <select data-edit-collection-status>
              ${collectionStatusOptions(record.status)}
            </select>
          </td>
          <td><input data-edit-collection-paid-date type="date" value="${escapeHtml(record.paidDate)}" /></td>
          <td><input data-edit-collection-notes value="${escapeHtml(record.notes)}" /></td>
          <td class="table-actions">
            <button class="text-button" type="button" data-save-collection-id="${escapeHtml(record.id)}">Save</button>
            <button class="text-button" type="button" data-cancel-collection-edit>Cancel</button>
          </td>
        </tr>
      `;
    }
    return `
      <tr>
        <td><strong>${escapeHtml(record.restaurantName || "No restaurant")}</strong></td>
        <td>${escapeHtml(record.invoiceNumber)}</td>
        <td>${escapeHtml(shortDate(record.dueDate))}</td>
        <td>${escapeHtml(moneyValue(record.amount))}</td>
        <td>${escapeHtml(labelFor(collectionStatusLabels, record.status, "Not Sent"))}</td>
        <td>${escapeHtml(shortDate(record.paidDate))}</td>
        <td>${escapeHtml(invoiceTableNote(record.notes))}</td>
        <td class="table-actions">
          <button class="text-button" type="button" data-edit-collection-id="${escapeHtml(record.id)}">Edit</button>
          <button class="text-button" type="button" data-test-email-collection-id="${escapeHtml(record.id)}">Send Test</button>
          <button class="text-button" type="button" data-send-collection-id="${escapeHtml(record.id)}">Send Invoice</button>
          <button class="text-button" type="button" data-email-collection-id="${escapeHtml(record.id)}">Email Invoice</button>
          <button class="text-button" type="button" data-print-collection-id="${escapeHtml(record.id)}">View / Save PDF</button>
          <button class="text-button" type="button" data-delete-collection-id="${escapeHtml(record.id)}">Remove</button>
        </td>
      </tr>
    `;
  }

  function expenseCategoryOptions(selectedCategory = "") {
    return Object.entries(expenseCategoryLabels).map(([value, label]) => `
      <option value="${escapeHtml(value)}"${value === selectedCategory ? " selected" : ""}>${escapeHtml(label)}</option>
    `).join("");
  }

  function expenseRow(record) {
    if (state.editingExpenseId === record.id) {
      return `
        <tr data-expense-editor-id="${escapeHtml(record.id)}">
          <td><input data-edit-expense-date type="date" value="${escapeHtml(record.date)}" /></td>
          <td><input data-edit-expense-vendor value="${escapeHtml(record.vendor)}" /></td>
          <td>
            <select data-edit-expense-category>
              ${expenseCategoryOptions(record.category)}
            </select>
          </td>
          <td><input data-edit-expense-amount inputmode="decimal" value="${escapeHtml(record.amount)}" /></td>
          <td><input data-edit-expense-payment value="${escapeHtml(record.paymentMethod)}" /></td>
          <td><input data-edit-expense-notes value="${escapeHtml(record.notes)}" /></td>
          <td class="table-actions">
            <button class="text-button" type="button" data-save-expense-id="${escapeHtml(record.id)}">Save</button>
            <button class="text-button" type="button" data-cancel-expense-edit>Cancel</button>
          </td>
        </tr>
      `;
    }
    return `
      <tr>
        <td>${escapeHtml(shortDate(record.date))}</td>
        <td><strong>${escapeHtml(record.vendor || "No vendor")}</strong></td>
        <td>${escapeHtml(labelFor(expenseCategoryLabels, record.category, "Other"))}</td>
        <td>${escapeHtml(moneyValue(record.amount))}</td>
        <td>${escapeHtml(record.paymentMethod)}</td>
        <td>${escapeHtml(record.notes)}</td>
        <td class="table-actions">
          <button class="text-button" type="button" data-edit-expense-id="${escapeHtml(record.id)}">Edit</button>
          <button class="text-button" type="button" data-delete-expense-id="${escapeHtml(record.id)}">Remove</button>
        </td>
      </tr>
    `;
  }

  function renderExpenses() {
    const records = [...state.expenses].sort((left, right) => String(right.date || "").localeCompare(String(left.date || "")));
    elements.expensesList.innerHTML = records.length
      ? records.map(expenseRow).join("")
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
    state.editingContactId = "";
    elements.contactHistoryType.value = "E";
    elements.contactHistoryDate.value = today();
    elements.contactHistoryResponse.checked = false;
    elements.contactHistoryNote.value = "";
    renderContactHistoryEditor();
    elements.saleDate.value = restaurant ? record.saleDate : "";
    elements.serviceStartDate.value = restaurant ? record.serviceStartDate : "";
    elements.serviceEndDate.value = restaurant ? record.serviceEndDate : "";
    elements.packageName.value = restaurant ? record.packageName : "";
    elements.monthlyAmount.value = restaurant ? record.monthlyAmount : "";
    elements.setupFee.value = restaurant ? record.setupFee : "";
    elements.paymentStatus.value = restaurant ? record.paymentStatus : "";
    elements.firstInvoiceDate.value = restaurant ? record.firstInvoiceDate : "";
    elements.setupStatus.value = restaurant ? record.setupStatus : "";
    elements.salesNotes.value = restaurant ? record.salesNotes : "";
    updateSaleDetailsVisibility();
    elements.deleteRestaurantButton.hidden = !restaurant;
    elements.editorTitle.textContent = restaurant ? "Edit Restaurant" : "New Restaurant";
  }

  function updateSaleDetailsVisibility() {
    elements.saleDetailsSection.hidden = elements.status.value !== "customer";
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
      serviceStartDate: elements.serviceStartDate.value,
      serviceEndDate: elements.serviceEndDate.value,
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

  function openQuickContact(id = "") {
    const restaurant = state.restaurants.find((record) => record.id === id);
    if (!restaurant) {
      return;
    }
    elements.quickContactId.value = restaurant.id;
    elements.quickContactTitle.textContent = restaurant.name;
    elements.quickContactDetails.textContent = [
      contactName(restaurant),
      restaurant.contactEmail,
      restaurant.contactCell || restaurant.phone,
    ].filter(Boolean).join(" / ") || "No contact details yet";
    elements.quickContactType.value = "C";
    elements.quickContactDate.value = today();
    elements.quickContactResponse.checked = false;
    elements.quickContactNextFollowUp.value = "";
    elements.quickContactScore.value = restaurant.prospectScore || defaultProspectScore;
    elements.quickContactNote.value = "";
    renderQuickContactHistory(restaurant);
    elements.quickContactDialog.showModal();
  }

  function closeQuickContact() {
    elements.quickContactDialog.close();
  }

  function clearQuickContactFollowUp() {
    elements.quickContactNextFollowUp.value = "";
  }

  function renderQuickContactHistory(restaurant) {
    const records = [...(restaurant.contactHistory || [])]
      .sort((left, right) => String(right.date || "").localeCompare(String(left.date || "")))
      .slice(0, 5);
    elements.quickContactHistoryList.innerHTML = records.length
      ? records.map((record) => `
          <div class="contact-history-item quick-history-item">
            <strong>${escapeHtml(record.type)} ${escapeHtml(shortDate(record.date))}</strong>
            <span>${escapeHtml(record.response ? "Response" : "No response")}</span>
            ${record.note ? `<p>${escapeHtml(record.note)}</p>` : ""}
          </div>
        `).join("")
      : '<div class="empty-state">No contacts logged yet.</div>';
  }

  function openFullCardFromQuickContact() {
    const id = elements.quickContactId.value;
    closeQuickContact();
    openRestaurantEditor(id);
  }

  function contactHistoryItem(record) {
    if (state.editingContactId === record.id) {
      return `
        <div class="contact-history-item contact-history-edit-item" data-contact-editor-id="${escapeHtml(record.id)}">
          <label>
            Type
            <select data-edit-contact-type>
              ${Object.entries(contactTypeLabels).map(([value, label]) => `
                <option value="${escapeHtml(value)}"${record.type === value ? " selected" : ""}>${escapeHtml(value)} - ${escapeHtml(label)}</option>
              `).join("")}
            </select>
          </label>
          <label>
            Date
            <input data-edit-contact-date type="date" value="${escapeHtml(record.date)}" />
          </label>
          <label class="checkbox-label">
            Response
            <input data-edit-contact-response type="checkbox"${record.response ? " checked" : ""} />
          </label>
          <label>
            Notes
            <input data-edit-contact-note value="${escapeHtml(record.note)}" />
          </label>
          <div class="contact-history-actions">
            <button class="text-button" type="button" data-save-contact-id="${escapeHtml(record.id)}">Save</button>
            <button class="text-button" type="button" data-cancel-contact-edit>Cancel</button>
          </div>
        </div>
      `;
    }
    const response = record.response ? "Response" : "No response";
    return `
      <div class="contact-history-item">
        <strong>${escapeHtml(record.type)} ${escapeHtml(shortDate(record.date))}</strong>
        <span>${escapeHtml(response)}</span>
        ${record.note ? `<p>${escapeHtml(record.note)}</p>` : ""}
        <div class="contact-history-actions">
          <button class="text-button" type="button" data-edit-contact-id="${escapeHtml(record.id)}">Edit</button>
          <button class="text-button" type="button" data-remove-contact-id="${escapeHtml(record.id)}">Remove</button>
        </div>
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
    state.editingContactId = "";
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
    if (state.editingContactId === id) {
      state.editingContactId = "";
    }
    renderContactHistoryEditor();
  }

  function editContactHistory(id) {
    state.editingContactId = id;
    renderContactHistoryEditor();
  }

  function cancelContactHistoryEdit() {
    state.editingContactId = "";
    renderContactHistoryEditor();
  }

  function saveContactHistoryEdit(id) {
    const editor = elements.contactHistoryList.querySelector(`[data-contact-editor-id="${id}"]`);
    const type = editor?.querySelector("[data-edit-contact-type]")?.value || "E";
    const date = editor?.querySelector("[data-edit-contact-date]")?.value || "";
    const response = editor?.querySelector("[data-edit-contact-response]")?.checked === true;
    const note = editor?.querySelector("[data-edit-contact-note]")?.value || "";
    const updated = normalizeContactHistory([{ id, type, date, response, note }])[0];
    if (!updated) {
      removeContactHistory(id);
      return;
    }
    state.editingContactHistory = state.editingContactHistory.map((record) =>
      record.id === id ? updated : record
    );
    state.editingContactId = "";
    renderContactHistoryEditor();
  }

  async function saveQuickContact(event) {
    event.preventDefault();
    const id = elements.quickContactId.value;
    const restaurant = state.restaurants.find((record) => record.id === id);
    if (!restaurant) {
      return;
    }
    const newContact = normalizeContactHistory([{
      id: makeContactId(),
      type: elements.quickContactType.value,
      date: elements.quickContactDate.value || today(),
      response: elements.quickContactResponse.checked,
      note: elements.quickContactNote.value,
    }])[0];
    const updatedRestaurant = normalizeRestaurant({
      ...restaurant,
      contactHistory: newContact
        ? [newContact, ...(restaurant.contactHistory || [])]
        : restaurant.contactHistory,
      lastContacted:
        newContact?.date && (!restaurant.lastContacted || newContact.date > restaurant.lastContacted)
          ? newContact.date
          : restaurant.lastContacted,
      nextFollowUp: elements.quickContactNextFollowUp.value,
      prospectScore: elements.quickContactScore.value,
      prospectStage: ["", "new-lead"].includes(restaurant.prospectStage) ? "contacted" : restaurant.prospectStage,
      updatedAt: new Date().toISOString(),
    });
    const data = await saveAction("saveRestaurant", { restaurant: updatedRestaurant });
    if (!data?.restaurant) {
      return;
    }
    const savedRecord = normalizeRestaurant(data.restaurant);
    const existingIndex = state.restaurants.findIndex((record) => record.id === savedRecord.id);
    if (existingIndex >= 0) {
      state.restaurants[existingIndex] = savedRecord;
    }
    cacheBackofficeData();
    closeQuickContact();
    render();
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
    elements.collectionInvoice.value = nextInvoiceNumber();
    elements.collectionStatus.value = "not-sent";
    renderCollections();
  }

  function editCollection(id) {
    state.editingCollectionId = id;
    renderCollections();
  }

  function cancelCollectionEdit() {
    state.editingCollectionId = "";
    renderCollections();
  }

  async function saveCollectionEdit(id) {
    const editor = elements.collectionsList.querySelector(`[data-collection-editor-id="${id}"]`);
    const existing = state.collections.find((record) => record.id === id);
    if (!editor || !existing) {
      return;
    }
    const record = normalizeCollection({
      ...existing,
      invoiceNumber: editor.querySelector("[data-edit-collection-invoice]")?.value,
      dueDate: editor.querySelector("[data-edit-collection-due-date]")?.value,
      amount: editor.querySelector("[data-edit-collection-amount]")?.value,
      status: editor.querySelector("[data-edit-collection-status]")?.value,
      paidDate: editor.querySelector("[data-edit-collection-paid-date]")?.value,
      notes: editor.querySelector("[data-edit-collection-notes]")?.value,
    });
    const data = await saveAction("saveCollection", { collection: record });
    if (!data?.collection) {
      return;
    }
    const savedRecord = normalizeCollection(data.collection);
    state.collections = state.collections.map((collection) =>
      collection.id === savedRecord.id ? savedRecord : collection
    );
    state.editingCollectionId = "";
    cacheBackofficeData();
    renderCollections();
  }

  async function deleteCollection(id) {
    const data = await saveAction("deleteCollection", { id }, "Removed from Supabase");
    if (!data) {
      return;
    }
    state.collections = state.collections.filter((record) => record.id !== id);
    if (state.editingCollectionId === id) {
      state.editingCollectionId = "";
    }
    cacheBackofficeData();
    renderCollections();
  }

  async function sendInvoiceEmail(id, { test = false } = {}) {
    const record = state.collections.find((collection) => collection.id === id);
    if (!record) {
      return;
    }
    if (!test) {
      const confirmed = window.confirm(`Send invoice ${record.invoiceNumber || ""} to ${record.restaurantName || "this customer"} now?`);
      if (!confirmed) {
        return;
      }
    }
    const data = await saveAction("sendInvoice", { id, test }, test ? "Sent test invoice email" : "Sent invoice email");
    if (!data) {
      return;
    }
    if (data.collection) {
      const savedRecord = normalizeCollection(data.collection);
      state.collections = state.collections.map((collection) =>
        collection.id === savedRecord.id ? savedRecord : collection
      );
      cacheBackofficeData();
      renderCollections();
    }
    window.alert(test ? `Test invoice sent to ${data.sentTo || "the test email"}.` : `Invoice sent to ${data.sentTo || "the customer"}.`);
  }

  function invoiceCustomerAddressLines(restaurant) {
    if (!restaurant) {
      return [];
    }
    const cityStateZip = [
      restaurant.city,
      [restaurant.state, restaurant.zip].filter(Boolean).join(" "),
    ].filter(Boolean).join(", ");
    return [restaurant.street, cityStateZip].filter(Boolean);
  }

  function fileSafeName(value) {
    return String(value || "")
      .replace(/[\\/:*?"<>|]+/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function invoicePrintTitle(record, customerName) {
    return fileSafeName(`${customerName} Invoice ${record.invoiceNumber || ""}`) || "CommunityVerse Invoice";
  }

  function invoiceDetails(record) {
    const restaurant = state.restaurants.find((item) => item.id === record.restaurantId);
    return {
      restaurant,
      customerName: record.restaurantName || restaurant?.name || "Restaurant",
      contact: restaurant ? contactName(restaurant) : "",
      addressLines: invoiceCustomerAddressLines(restaurant),
      description: record.notes || "Restaurant Challenge monthly subscription.",
      amount: moneyValue(record.amount),
      dueDate: shortDate(record.dueDate) || "Not set",
      status: labelFor(collectionStatusLabels, record.status, "Not Sent"),
    };
  }

  function pdfText(value) {
    return String(value || "")
      .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");
  }

  function wrapText(value, maxLength = 78) {
    const words = String(value || "").split(/\s+/).filter(Boolean);
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
    if (line) {
      lines.push(line);
    }
    return lines.length ? lines : [""];
  }

  function buildInvoicePdf(record) {
    const details = invoiceDetails(record);
    const lines = [];
    const addText = (text, x, y, size = 11, bold = false) => {
      lines.push(`BT /${bold ? "F2" : "F1"} ${size} Tf ${x} ${y} Td (${pdfText(text)}) Tj ET`);
    };

    addText("COMMUNITYVERSE GAMES", 48, 742, 11, true);
    addText("Invoice", 48, 710, 28, true);
    addText(record.invoiceNumber || "Invoice", 510, 742, 12, true);
    addText(`Due ${details.dueDate}`, 470, 720, 11);

    addText("Bill To", 48, 672, 12, true);
    addText(details.customerName, 48, 652, 11, true);
    let billY = 636;
    [details.contact, ...details.addressLines].filter(Boolean).forEach((line) => {
      addText(line, 48, billY, 10);
      billY -= 14;
    });

    addText("From", 330, 672, 12, true);
    addText(`${INVOICE_SENDER.name} / ${INVOICE_SENDER.business}`, 330, 652, 10, true);
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
    return {
      blob: new Blob([pdf], { type: "application/pdf" }),
      filename: `${invoicePrintTitle(record, details.customerName)}.pdf`,
    };
  }

  function openInvoicePreview(id) {
    const record = state.collections.find((collection) => collection.id === id);
    if (!record) {
      return;
    }
    const details = invoiceDetails(record);
    state.invoicePreviewId = id;
    elements.invoicePreviewContent.innerHTML = `
      <article class="invoice-document">
        <header class="invoice-header">
          <div>
            <p class="eyebrow">CommunityVerse Games</p>
            <h2>Invoice</h2>
          </div>
          <div class="invoice-meta">
            <strong>${escapeHtml(record.invoiceNumber || "Invoice")}</strong>
            <span>Due ${escapeHtml(shortDate(record.dueDate) || "Not set")}</span>
          </div>
        </header>
        <section class="invoice-parties">
          <div>
            <p class="invoice-label">Bill To</p>
            <strong>${escapeHtml(details.customerName)}</strong>
            ${details.contact ? `<span>${escapeHtml(details.contact)}</span>` : ""}
            ${details.addressLines.map((line) => `<span>${escapeHtml(line)}</span>`).join("")}
          </div>
          <div>
            <p class="invoice-label">From</p>
            <strong>${escapeHtml(INVOICE_SENDER.name)} / ${escapeHtml(INVOICE_SENDER.business)}</strong>
            <span>${escapeHtml(INVOICE_SENDER.street)}</span>
            <span>${escapeHtml(INVOICE_SENDER.cityStateZip)}</span>
            <span>${escapeHtml(INVOICE_SENDER.phone)}</span>
          </div>
        </section>
        <table class="invoice-lines">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${escapeHtml(details.description)}</td>
              <td>${escapeHtml(details.amount)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th>Total Due</th>
              <th>${escapeHtml(details.amount)}</th>
            </tr>
          </tfoot>
        </table>
        <section class="invoice-payment">
          <p class="invoice-label">Pay Online</p>
          <a href="${escapeHtml(PAYMENT_LINK)}" target="_blank" rel="noopener">Pay this invoice with PayPal</a>
        </section>
        <p class="invoice-status">Status: ${escapeHtml(details.status)}</p>
      </article>
    `;
    elements.invoicePreviewDialog.showModal();
  }

  function closeInvoicePreview() {
    state.invoicePreviewId = "";
    elements.invoicePreviewDialog.close();
  }

  function saveInvoicePdf() {
    const record = state.collections.find((collection) => collection.id === state.invoicePreviewId);
    if (!record) {
      return;
    }
    const pdf = buildInvoicePdf(record);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(pdf.blob);
    link.download = pdf.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  function openInvoiceEmail(id) {
    const record = state.collections.find((collection) => collection.id === id);
    if (!record) {
      return;
    }
    const restaurant = state.restaurants.find((item) => item.id === record.restaurantId);
    const email = restaurant?.contactEmail || "";
    if (!email) {
      window.alert("This customer does not have an email address saved yet.");
      return;
    }
    const customerName = record.restaurantName || restaurant?.name || "there";
    const invoiceNumber = record.invoiceNumber || "your invoice";
    const amount = moneyValue(record.amount);
    const dueDate = shortDate(record.dueDate) || "the due date shown on the invoice";
    const description = record.notes || "Restaurant Challenge monthly subscription.";
    const subject = `Invoice ${invoiceNumber} from CommunityVerse Games`;
    const body = [
      `Hi ${customerName},`,
      "",
      `Here is invoice ${invoiceNumber} for ${amount}.`,
      "",
      description,
      "",
      `Due Date: ${dueDate}`,
      "",
      "You can pay online here:",
      PAYMENT_LINK,
      "",
      "I am also attaching the PDF invoice for your records.",
      "",
      "Thank you,",
      `${INVOICE_SENDER.name}`,
      INVOICE_SENDER.business,
      INVOICE_SENDER.phone,
    ].join("\n");
    window.location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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

  function editExpense(id) {
    state.editingExpenseId = id;
    renderExpenses();
  }

  function cancelExpenseEdit() {
    state.editingExpenseId = "";
    renderExpenses();
  }

  async function saveExpenseEdit(id) {
    const editor = elements.expensesList.querySelector(`[data-expense-editor-id="${id}"]`);
    const existing = state.expenses.find((record) => record.id === id);
    if (!editor || !existing) {
      return;
    }
    const record = normalizeExpense({
      ...existing,
      date: editor.querySelector("[data-edit-expense-date]")?.value,
      vendor: editor.querySelector("[data-edit-expense-vendor]")?.value,
      category: editor.querySelector("[data-edit-expense-category]")?.value,
      amount: editor.querySelector("[data-edit-expense-amount]")?.value,
      paymentMethod: editor.querySelector("[data-edit-expense-payment]")?.value,
      notes: editor.querySelector("[data-edit-expense-notes]")?.value,
    });
    const data = await saveAction("saveExpense", { expense: record });
    if (!data?.expense) {
      return;
    }
    const savedRecord = normalizeExpense(data.expense);
    state.expenses = state.expenses.map((expense) => expense.id === savedRecord.id ? savedRecord : expense);
    state.editingExpenseId = "";
    cacheBackofficeData();
    renderExpenses();
  }

  async function deleteExpense(id) {
    const data = await saveAction("deleteExpense", { id }, "Removed from Supabase");
    if (!data) {
      return;
    }
    state.expenses = state.expenses.filter((record) => record.id !== id);
    if (state.editingExpenseId === id) {
      state.editingExpenseId = "";
    }
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

  elements.restaurantSortButtons.forEach((button) => {
    button.addEventListener("click", () => setRestaurantSort(button.dataset.restaurantSort));
  });
  elements.salesSortButtons.forEach((button) => {
    button.addEventListener("click", () => setSalesSort(button.dataset.salesSort));
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
  elements.closeQuickContactButton.addEventListener("click", closeQuickContact);
  elements.cancelQuickContactButton.addEventListener("click", closeQuickContact);
  elements.quickContactClearFollowUp.addEventListener("click", clearQuickContactFollowUp);
  elements.quickContactFullCardButton.addEventListener("click", openFullCardFromQuickContact);
  elements.deleteRestaurantButton.addEventListener("click", deleteCurrentRestaurant);
  elements.addContactHistoryButton.addEventListener("click", addContactHistory);
  elements.form.addEventListener("submit", saveRestaurant);
  elements.status.addEventListener("change", updateSaleDetailsVisibility);
  elements.quickContactForm.addEventListener("submit", saveQuickContact);
  elements.collectionForm.addEventListener("submit", addCollection);
  elements.collectionRestaurant.addEventListener("change", fillNextInvoiceNumber);
  elements.collectionRestaurant.addEventListener("change", updateInvoiceTemplateAmount);
  elements.invoiceTemplateMonth.addEventListener("change", updateInvoiceTemplateAmount);
  elements.invoiceTemplateType.addEventListener("change", updateInvoiceTemplateAmount);
  elements.fillMonthlyInvoiceButton.addEventListener("click", fillMonthlyInvoiceTemplate);
  elements.closeInvoicePreviewButton.addEventListener("click", closeInvoicePreview);
  elements.printInvoiceButton.addEventListener("click", saveInvoicePdf);
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
    const contactButton = event.target.closest("[data-contact-id]");
    if (contactButton) {
      openQuickContact(contactButton.dataset.contactId);
    }
    const removeContactButton = event.target.closest("[data-remove-contact-id]");
    if (removeContactButton) {
      removeContactHistory(removeContactButton.dataset.removeContactId);
    }
    const editContactButton = event.target.closest("[data-edit-contact-id]");
    if (editContactButton) {
      editContactHistory(editContactButton.dataset.editContactId);
    }
    const saveContactButton = event.target.closest("[data-save-contact-id]");
    if (saveContactButton) {
      saveContactHistoryEdit(saveContactButton.dataset.saveContactId);
    }
    const cancelContactEditButton = event.target.closest("[data-cancel-contact-edit]");
    if (cancelContactEditButton) {
      cancelContactHistoryEdit();
    }
    const deleteCollectionButton = event.target.closest("[data-delete-collection-id]");
    if (deleteCollectionButton) {
      deleteCollection(deleteCollectionButton.dataset.deleteCollectionId);
    }
    const editCollectionButton = event.target.closest("[data-edit-collection-id]");
    if (editCollectionButton) {
      editCollection(editCollectionButton.dataset.editCollectionId);
    }
    const saveCollectionButton = event.target.closest("[data-save-collection-id]");
    if (saveCollectionButton) {
      saveCollectionEdit(saveCollectionButton.dataset.saveCollectionId);
    }
    const cancelCollectionEditButton = event.target.closest("[data-cancel-collection-edit]");
    if (cancelCollectionEditButton) {
      cancelCollectionEdit();
    }
    const printCollectionButton = event.target.closest("[data-print-collection-id]");
    if (printCollectionButton) {
      openInvoicePreview(printCollectionButton.dataset.printCollectionId);
    }
    const emailCollectionButton = event.target.closest("[data-email-collection-id]");
    if (emailCollectionButton) {
      openInvoiceEmail(emailCollectionButton.dataset.emailCollectionId);
    }
    const testEmailCollectionButton = event.target.closest("[data-test-email-collection-id]");
    if (testEmailCollectionButton) {
      sendInvoiceEmail(testEmailCollectionButton.dataset.testEmailCollectionId, { test: true });
    }
    const sendCollectionButton = event.target.closest("[data-send-collection-id]");
    if (sendCollectionButton) {
      sendInvoiceEmail(sendCollectionButton.dataset.sendCollectionId);
    }
    const deleteExpenseButton = event.target.closest("[data-delete-expense-id]");
    if (deleteExpenseButton) {
      deleteExpense(deleteExpenseButton.dataset.deleteExpenseId);
    }
    const editExpenseButton = event.target.closest("[data-edit-expense-id]");
    if (editExpenseButton) {
      editExpense(editExpenseButton.dataset.editExpenseId);
    }
    const saveExpenseButton = event.target.closest("[data-save-expense-id]");
    if (saveExpenseButton) {
      saveExpenseEdit(saveExpenseButton.dataset.saveExpenseId);
    }
    const cancelExpenseEditButton = event.target.closest("[data-cancel-expense-edit]");
    if (cancelExpenseEditButton) {
      cancelExpenseEdit();
    }
  });

  elements.expenseDate.value = today();
  elements.invoiceTemplateMonth.value = currentMonth();
  updateInvoiceTemplateAmount();
  if (adminKey) {
    loadBackofficeData();
  } else {
    showLogin();
  }
})();
