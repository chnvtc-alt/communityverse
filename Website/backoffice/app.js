(() => {
  const STORAGE_KEY = "communityverseBackofficeRestaurants";
  const COLLECTIONS_KEY = "communityverseBackofficeCollections";
  const EXPENSES_KEY = "communityverseBackofficeExpenses";
  const KEY_STORAGE = "communityverseBackofficeAdminKey";
  const SECTION_STORAGE = "communityverseBackofficeSection";
  const SALES_EMAIL_1_STORAGE = "communityverseBackofficeSalesEmail1Template";
  const API_URL = "/api/backoffice";
  const DEFAULT_OWNER = "Tim";
  const SALES_REPS = ["Tim", "Doyce"];
  const DEFAULT_DOYCE_EMAIL_TEMPLATE = {
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
  const INVOICE_SENDER = {
    business: "CommunityVerse Games",
    street: "3155 Waterplace Cove",
    cityStateZip: "Villa Rica, GA 30180",
    phone: "404-428-6302",
  };
  const PAYMENT_LINK = "https://www.paypal.com/ncp/payment/HSHM25X6JZFZ4";
  const SUBSCRIPTION_LINK = "https://communityversegames.com/subscribe/";
  const LOGO_PATH = "/assets/communityverse-games-logo-transparent-cropped.png";
  const PDF_LOGO_PATH = "/assets/communityverse-games-logo-pdf.jpg";
  const PDF_LOGO_WIDTH = 230;
  const PDF_LOGO_HEIGHT = 71;
  const MAILTO_FULL_DRAFT_LIMIT = 1800;
  const DEFAULT_SALES_EMAIL_1 = {
    subject: "A quick trivia promotion idea for {restaurant}",
    body: [
      "Hi {contact},",
      "",
      "I wanted to reach out because I am building Restaurant Challenge Trivia, a 3-minute browser trivia game that can be branded for local restaurants.",
      "",
      "It works on phones, tablets, laptops, and desktops, so guests can play while they are waiting, at home, or with friends in a live room.",
      "",
      "I thought {restaurant} might be a good fit for a simple promotion that gives guests a fun reason to visit again.",
      "",
      "Would you be open to a quick conversation?",
      "",
      "Best Wishes,",
      "Tim Collins",
      "CommunityVerse Games",
    ].join("\n"),
  };
  const SECTION_LABELS = {
    dashboard: "Dashboard",
    restaurants: "Restaurant List",
    prospects: "Prospects",
    "lead-builder": "Lead Builder",
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
    "permanently-closed": "Permanently Closed",
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
    "subscription-sent": "Subscription Sent",
    "subscription-active": "Subscription Active",
    canceled: "Canceled",
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
    LNN: "Left Name & Number",
    FB: "Facebook",
    W: "Website",
  };

  const collectionStatusLabels = {
    "not-sent": "Not Sent",
    sent: "Sent",
    paid: "Paid",
    "past-due": "Past Due",
  };

  const collectionPaymentTypeLabels = {
    recurring: "Recurring Monthly",
    manual: "Manual Invoice",
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
    importProspectsButton: document.querySelector("#import-prospects-button"),
    importButton: document.querySelector("#import-button"),
    exportButton: document.querySelector("#export-button"),
    importFile: document.querySelector("#import-file"),
    prospectImportFile: document.querySelector("#prospect-import-file"),
    prospectImportDialog: document.querySelector("#prospect-import-dialog"),
    prospectImportSummary: document.querySelector("#prospect-import-summary"),
    prospectImportList: document.querySelector("#prospect-import-list"),
    closeProspectImportButton: document.querySelector("#close-prospect-import-button"),
    cancelProspectImportButton: document.querySelector("#cancel-prospect-import-button"),
    applyProspectImportButton: document.querySelector("#apply-prospect-import-button"),
    search: document.querySelector("#restaurant-search"),
    statusFilter: document.querySelector("#restaurant-status-filter"),
    restaurantCount: document.querySelector("#restaurant-count"),
    restaurantTableBody: document.querySelector("#restaurant-table-body"),
    monthlySalesList: document.querySelector("#monthly-sales-list"),
    topProspectList: document.querySelector("#top-prospect-list"),
    prospectList: document.querySelector("#prospect-list"),
    prospectSearch: document.querySelector("#prospect-search"),
    prospectScoreMin: document.querySelector("#prospect-score-min"),
    prospectScoreMax: document.querySelector("#prospect-score-max"),
    prospectSort: document.querySelector("#prospect-sort"),
    salesEmailTemplateForm: document.querySelector("#sales-email-template-form"),
    salesEmail1Subject: document.querySelector("#sales-email-1-subject"),
    salesEmail1Body: document.querySelector("#sales-email-1-body"),
    resetSalesEmail1Button: document.querySelector("#reset-sales-email-1-button"),
    salesEmailTemplateStatus: document.querySelector("#sales-email-template-status"),
    doyceEmailTemplateForm: document.querySelector("#doyce-email-template-form"),
    doyceEmailSubject: document.querySelector("#doyce-email-subject"),
    doyceEmailBody: document.querySelector("#doyce-email-body"),
    resetDoyceEmailButton: document.querySelector("#reset-doyce-email-button"),
    doyceEmailTemplateStatus: document.querySelector("#doyce-email-template-status"),
    leadBuilderForm: document.querySelector("#lead-builder-form"),
    leadBuilderState: document.querySelector("#lead-builder-state"),
    leadBuilderCounty: document.querySelector("#lead-builder-county"),
    leadBuilderMaxResults: document.querySelector("#lead-builder-max-results"),
    leadBuilderMiles: document.querySelector("#lead-builder-miles"),
    leadBuilderCity: document.querySelector("#lead-builder-city"),
    leadBuilderSummary: document.querySelector("#lead-builder-summary"),
    leadBuilderProgress: document.querySelector("#lead-builder-progress"),
    leadBuilderProgressBar: document.querySelector("#lead-builder-progress-bar"),
    leadBuilderSearches: document.querySelector("#lead-builder-searches"),
    findLeadsButton: document.querySelector("#find-leads-button"),
    copyLeadSearchesButton: document.querySelector("#copy-lead-searches-button"),
    leadBuilderCopyStatus: document.querySelector("#lead-builder-copy-status"),
    manualLeadForm: document.querySelector("#manual-lead-form"),
    manualLeadName: document.querySelector("#manual-lead-name"),
    manualLeadCity: document.querySelector("#manual-lead-city"),
    manualLeadStreet: document.querySelector("#manual-lead-street"),
    manualLeadState: document.querySelector("#manual-lead-state"),
    manualLeadPhone: document.querySelector("#manual-lead-phone"),
    manualLeadTrivia: document.querySelector("#manual-lead-trivia"),
    manualLeadWebsite: document.querySelector("#manual-lead-website"),
    manualLeadFacebook: document.querySelector("#manual-lead-facebook"),
    manualLeadEmail: document.querySelector("#manual-lead-email"),
    manualLeadNotes: document.querySelector("#manual-lead-notes"),
    clearManualLeadButton: document.querySelector("#clear-manual-lead-button"),
    pasteLeadsForm: document.querySelector("#paste-leads-form"),
    pasteLeadsText: document.querySelector("#paste-leads-text"),
    pasteLeadsStatus: document.querySelector("#paste-leads-status"),
    clearPastedLeadsButton: document.querySelector("#clear-pasted-leads-button"),
    salesList: document.querySelector("#sales-list"),
    collectionForm: document.querySelector("#collection-form"),
    collectionRestaurant: document.querySelector("#collection-restaurant"),
    collectionInvoice: document.querySelector("#collection-invoice"),
    collectionPaymentType: document.querySelector("#collection-payment-type"),
    collectionDueDate: document.querySelector("#collection-due-date"),
    collectionAmount: document.querySelector("#collection-amount"),
    collectionStatus: document.querySelector("#collection-status"),
    collectionPaidDate: document.querySelector("#collection-paid-date"),
    collectionNotes: document.querySelector("#collection-notes"),
    collectionsList: document.querySelector("#collections-list"),
    paypalPasteForm: document.querySelector("#paypal-paste-form"),
    paypalPasteText: document.querySelector("#paypal-paste-text"),
    paypalPaymentPreview: document.querySelector("#paypal-payment-preview"),
    clearPaypalPasteButton: document.querySelector("#clear-paypal-paste-button"),
    commissionsList: document.querySelector("#commissions-list"),
    commissionsSummary: document.querySelector("#commissions-summary"),
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
    currentlyDoesTrivia: document.querySelector("#currently-does-trivia"),
    website: document.querySelector("#restaurant-website"),
    facebookPage: document.querySelector("#facebook-page"),
    contactFirstName: document.querySelector("#contact-first-name"),
    contactLastName: document.querySelector("#contact-last-name"),
    contactEmail: document.querySelector("#contact-email"),
    contactCell: document.querySelector("#contact-cell"),
    addSecondContactButton: document.querySelector("#add-second-contact-button"),
    secondContactSection: document.querySelector("#second-contact-section"),
    secondContactFirstName: document.querySelector("#second-contact-first-name"),
    secondContactLastName: document.querySelector("#second-contact-last-name"),
    secondContactEmail: document.querySelector("#second-contact-email"),
    secondContactCell: document.querySelector("#second-contact-cell"),
    secondContactRole: document.querySelector("#second-contact-role"),
    dateAdded: document.querySelector("#date-added"),
    lastContacted: document.querySelector("#last-contacted"),
    nextFollowUp: document.querySelector("#next-follow-up"),
    clearNextFollowUp: document.querySelector("#clear-next-follow-up"),
    notes: document.querySelector("#restaurant-notes"),
    prospectStage: document.querySelector("#prospect-stage"),
    prospectScore: document.querySelector("#prospect-score"),
    leadSource: document.querySelector("#lead-source"),
    assignedTo: document.querySelector("#assigned-to"),
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
    gameName: document.querySelector("#game-name"),
    monthlyAmount: document.querySelector("#monthly-amount"),
    setupFee: document.querySelector("#setup-fee"),
    paymentStatus: document.querySelector("#payment-status"),
    firstInvoiceDate: document.querySelector("#first-invoice-date"),
    paypalSubscriptionId: document.querySelector("#paypal-subscription-id"),
    setupStatus: document.querySelector("#setup-status"),
    salesNotes: document.querySelector("#sales-notes"),
    quickContactDialog: document.querySelector("#quick-contact-dialog"),
    quickContactForm: document.querySelector("#quick-contact-form"),
    quickContactTitle: document.querySelector("#quick-contact-title"),
    quickContactDetails: document.querySelector("#quick-contact-details"),
    quickContactLinks: document.querySelector("#quick-contact-links"),
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
    salesEmailDialog: document.querySelector("#sales-email-dialog"),
    salesEmailForm: document.querySelector("#sales-email-form"),
    salesEmailTitle: document.querySelector("#sales-email-title"),
    salesEmailHelper: document.querySelector("#sales-email-helper"),
    salesEmailRestaurantId: document.querySelector("#sales-email-restaurant-id"),
    salesEmailTo: document.querySelector("#sales-email-to"),
    salesEmailSubject: document.querySelector("#sales-email-subject"),
    salesEmailBody: document.querySelector("#sales-email-body"),
    copySalesEmailBodyButton: document.querySelector("#copy-sales-email-body-button"),
    openSalesEmailDraftLink: document.querySelector("#open-sales-email-draft-link"),
    closeSalesEmailButton: document.querySelector("#close-sales-email-button"),
    cancelSalesEmailButton: document.querySelector("#cancel-sales-email-button"),
    researchNotesDialog: document.querySelector("#research-notes-dialog"),
    researchNotesForm: document.querySelector("#research-notes-form"),
    researchNotesTitle: document.querySelector("#research-notes-title"),
    researchNotesHelper: document.querySelector("#research-notes-helper"),
    researchNotesText: document.querySelector("#research-notes-text"),
    openResearchSearchesButton: document.querySelector("#open-research-searches-button"),
    closeResearchNotesButton: document.querySelector("#close-research-notes-button"),
    cancelResearchNotesButton: document.querySelector("#cancel-research-notes-button"),
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
    pendingPaypalPayment: null,
    pendingProspectImport: [],
    researchTarget: null,
    salesEmailTargetId: "",
    doyceEmailTemplate: { ...DEFAULT_DOYCE_EMAIL_TEMPLATE },
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

  function dateInputValue(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function today() {
    return dateInputValue();
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
      start: dateInputValue(start),
      end: dateInputValue(end),
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

  function invoiceMonthFromDate(dateText) {
    const match = String(dateText || "").match(/^(\d{4})-(\d{2})-\d{2}$/);
    if (!match) {
      return "";
    }
    const date = new Date(`${match[1]}-${match[2]}-01T00:00:00`);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }

  function invoiceGameName(record = {}, restaurant = {}, customerName = "Restaurant") {
    if (restaurant?.gameName) {
      return restaurant.gameName;
    }
    const match = String(record.notes || "").match(/^(.+?)\s+(?:Partial Month|Monthly) Subscription/i);
    return match ? match[1].trim() : `${customerName} Game`;
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

  function externalUrl(value = "") {
    const url = String(value || "").trim();
    if (!url) {
      return "";
    }
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
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
      currentlyDoesTrivia: ["yes", "no", "possible"].includes(record.currentlyDoesTrivia) ? record.currentlyDoesTrivia : "",
      website: String(record.website || "").trim(),
      facebookPage: String(record.facebookPage || "").trim(),
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
      gameName: String(record.gameName || "").trim(),
      monthlyAmount: String(record.monthlyAmount || "").trim(),
      setupFee: String(record.setupFee || "").trim(),
      paymentStatus: paymentStatusLabels[record.paymentStatus] ? record.paymentStatus : "",
      firstInvoiceDate: String(record.firstInvoiceDate || "").trim(),
      paypalSubscriptionId: String(record.paypalSubscriptionId || "").trim(),
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

  function paymentTypeFromNotes(notes = "") {
    const match = String(notes || "").match(/\bPayment type:\s*(Recurring monthly subscription|Manual one-time invoice)\./i);
    if (!match) {
      return "manual";
    }
    return /manual/i.test(match[1]) ? "manual" : "recurring";
  }

  function paymentTypeLabel(paymentType = "recurring") {
    return labelFor(collectionPaymentTypeLabels, paymentType, collectionPaymentTypeLabels.recurring);
  }

  function stripPaymentTypeNote(notes = "") {
    return String(notes || "")
      .replace(/\bPayment type:\s*(?:Recurring monthly subscription|Manual one-time invoice)\.\s*/i, "")
      .trim();
  }

  function collectionNotesWithPaymentType(notes = "", paymentType = "recurring") {
    const label = paymentType === "manual" ? "Manual one-time invoice" : "Recurring monthly subscription";
    const cleanNotes = stripPaymentTypeNote(notes);
    return [`Payment type: ${label}.`, cleanNotes].filter(Boolean).join(" ");
  }

  function normalizeCollection(record = {}) {
    const notes = String(record.notes || "").trim();
    const paymentType = collectionPaymentTypeLabels[record.paymentType]
      ? record.paymentType
      : paymentTypeFromNotes(notes);
    return {
      id: String(record.id || "").trim() || makeCollectionId(),
      restaurantId: String(record.restaurantId || "").trim(),
      restaurantName: String(record.restaurantName || "").trim(),
      invoiceNumber: String(record.invoiceNumber || "").trim(),
      paymentType,
      dueDate: String(record.dueDate || "").trim(),
      amount: String(record.amount || "").trim(),
      status: collectionStatusLabels[record.status] ? record.status : "not-sent",
      paidDate: String(record.paidDate || "").trim(),
      notes,
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

  function loadSalesEmail1Template() {
    try {
      const parsed = JSON.parse(localStorage.getItem(SALES_EMAIL_1_STORAGE) || "{}");
      return {
        subject: String(parsed.subject || DEFAULT_SALES_EMAIL_1.subject),
        body: String(parsed.body || DEFAULT_SALES_EMAIL_1.body),
      };
    } catch {
      return { ...DEFAULT_SALES_EMAIL_1 };
    }
  }

  function saveSalesEmail1Template(template) {
    localStorage.setItem(SALES_EMAIL_1_STORAGE, JSON.stringify(template, null, 2));
  }

  function fillSalesEmailTemplateForm(template = loadSalesEmail1Template()) {
    if (elements.salesEmail1Subject) {
      elements.salesEmail1Subject.value = template.subject;
    }
    if (elements.salesEmail1Body) {
      elements.salesEmail1Body.value = template.body;
    }
  }

  function normalizeEmailTemplate(template = {}, fallback = DEFAULT_DOYCE_EMAIL_TEMPLATE) {
    return {
      subject: String(template.subject || fallback.subject),
      body: String(template.body || fallback.body),
    };
  }

  function fillDoyceEmailTemplateForm(template = state.doyceEmailTemplate) {
    const normalized = normalizeEmailTemplate(template, DEFAULT_DOYCE_EMAIL_TEMPLATE);
    state.doyceEmailTemplate = normalized;
    if (elements.doyceEmailSubject) {
      elements.doyceEmailSubject.value = normalized.subject;
    }
    if (elements.doyceEmailBody) {
      elements.doyceEmailBody.value = normalized.body;
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
      elements.importProspectsButton,
      elements.importButton,
      elements.exportButton,
      elements.deleteRestaurantButton,
      elements.addContactHistoryButton,
      elements.quickContactFullCardButton,
      elements.applyProspectImportButton,
      elements.findLeadsButton,
      elements.copyLeadSearchesButton,
      elements.clearManualLeadButton,
      elements.clearPastedLeadsButton,
      elements.openResearchSearchesButton,
      elements.resetSalesEmail1Button,
      elements.resetDoyceEmailButton,
      elements.clearPaypalPasteButton,
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
    state.doyceEmailTemplate = normalizeEmailTemplate(data.doyceEmailTemplate, DEFAULT_DOYCE_EMAIL_TEMPLATE);
    cacheBackofficeData();
    render();
    fillDoyceEmailTemplateForm();
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

  function restaurantMatchesSearch(restaurant, query = "") {
    const needle = String(query || "").trim().toLowerCase();
    if (!needle) {
      return true;
    }
    return [
      restaurant.name,
      restaurant.street,
      restaurant.city,
      restaurant.state,
      restaurant.zip,
      formattedAddress(restaurant),
      restaurant.phone,
      restaurant.currentlyDoesTrivia,
      restaurant.website,
      restaurant.facebookPage,
      contactName(restaurant),
      secondContactSummary(restaurant),
      restaurant.contactEmail,
      restaurant.contactCell,
      latestContactSummary(restaurant),
      labelFor(prospectStageLabels, restaurant.prospectStage, restaurant.prospectStage),
      restaurant.prospectScore,
      restaurant.assignedTo,
      restaurant.salesperson,
      restaurant.leadSource,
      restaurant.prospectNotes,
      restaurant.saleDate,
      restaurant.packageName,
      restaurant.monthlyAmount,
      restaurant.setupFee,
      restaurant.paymentStatus,
      restaurant.firstInvoiceDate,
      restaurant.paypalSubscriptionId,
      restaurant.setupStatus,
      restaurant.salesNotes,
      restaurant.notes,
    ].some((value) => String(value || "").toLowerCase().includes(needle));
  }

  function getFilteredRestaurants({ forceStatus = "", query = null } = {}) {
    const searchQuery = query === null ? String(elements.search?.value || "") : String(query || "");
    const statusFilter = forceStatus || String(elements.statusFilter?.value || "all");
    return state.restaurants
      .filter((restaurant) => statusFilter === "all" || restaurant.status === statusFilter)
      .filter((restaurant) => restaurantMatchesSearch(restaurant, searchQuery))
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

  const SECOND_CONTACT_START = "[Second Contact]";
  const SECOND_CONTACT_END = "[/Second Contact]";

  function parseSecondContact(prospectNotes = "") {
    const match = String(prospectNotes || "").match(/\[Second Contact\]([\s\S]*?)\[\/Second Contact\]/i);
    const contact = { firstName: "", lastName: "", email: "", cell: "", role: "" };
    if (!match) {
      return contact;
    }
    match[1].split(/\n+/).forEach((line) => {
      const [rawLabel, ...valueParts] = line.split(":");
      const value = valueParts.join(":").trim();
      const label = String(rawLabel || "").trim().toLowerCase();
      if (label === "first name") contact.firstName = value;
      if (label === "last name") contact.lastName = value;
      if (label === "email") contact.email = value;
      if (label === "cell") contact.cell = value;
      if (label === "role") contact.role = value;
    });
    return contact;
  }

  function stripSecondContact(prospectNotes = "") {
    return String(prospectNotes || "")
      .replace(/\n?\[Second Contact\][\s\S]*?\[\/Second Contact\]\n?/i, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function secondContactHasValue(contact = {}) {
    return Boolean(contact.firstName || contact.lastName || contact.email || contact.cell || contact.role);
  }

  function secondContactFromForm() {
    return {
      firstName: elements.secondContactFirstName.value.trim(),
      lastName: elements.secondContactLastName.value.trim(),
      email: elements.secondContactEmail.value.trim(),
      cell: elements.secondContactCell.value.trim(),
      role: elements.secondContactRole.value.trim(),
    };
  }

  function prospectNotesWithSecondContact(notes = "", contact = {}) {
    const cleanNotes = stripSecondContact(notes);
    if (!secondContactHasValue(contact)) {
      return cleanNotes;
    }
    const lines = [
      SECOND_CONTACT_START,
      contact.firstName ? `First Name: ${contact.firstName}` : "",
      contact.lastName ? `Last Name: ${contact.lastName}` : "",
      contact.email ? `Email: ${contact.email}` : "",
      contact.cell ? `Cell: ${contact.cell}` : "",
      contact.role ? `Role: ${contact.role}` : "",
      SECOND_CONTACT_END,
    ].filter(Boolean);
    return [cleanNotes, lines.join("\n")].filter(Boolean).join("\n\n");
  }

  function secondContactSummary(restaurant = {}) {
    const contact = parseSecondContact(restaurant.prospectNotes);
    if (!secondContactHasValue(contact)) {
      return "";
    }
    const name = [contact.firstName, contact.lastName].filter(Boolean).join(" ");
    return [name ? `Second: ${name}` : "Second contact", contact.email, contact.cell, contact.role]
      .filter(Boolean)
      .join(" / ");
  }

  function cleanSalesRep(value = "") {
    const rep = String(value || "").trim();
    return rep || DEFAULT_OWNER;
  }

  function salesRepOptions(selectedValue = DEFAULT_OWNER) {
    const selected = cleanSalesRep(selectedValue);
    const reps = SALES_REPS.includes(selected) ? SALES_REPS : [selected, ...SALES_REPS];
    return reps.map((rep) => `
      <option value="${escapeHtml(rep)}"${rep === selected ? " selected" : ""}>${escapeHtml(rep)}</option>
    `).join("");
  }

  function repHelper(restaurant = {}) {
    const rep = cleanSalesRep(restaurant.assignedTo || restaurant.salesperson || DEFAULT_OWNER);
    return rep && rep !== DEFAULT_OWNER ? `Rep: ${rep}` : "";
  }

  function repInitials(restaurant = {}) {
    const rep = cleanSalesRep(restaurant.assignedTo || restaurant.salesperson || DEFAULT_OWNER);
    if (!rep || rep === DEFAULT_OWNER) {
      return "";
    }
    if (rep === "Doyce") {
      return "DP";
    }
    return rep
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();
  }

  function repBadge(restaurant = {}) {
    const initials = repInitials(restaurant);
    const label = repHelper(restaurant);
    return initials ? `<span class="rep-badge" title="${escapeHtml(label)}">${escapeHtml(initials)}</span>` : "";
  }

  function isDefaultOwner(restaurant = {}) {
    return cleanSalesRep(restaurant.assignedTo || restaurant.salesperson || DEFAULT_OWNER) === DEFAULT_OWNER;
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
    const thisMonthSales = sumSaleAmounts(customers.filter((restaurant) => saleMonth(restaurant) === currentMonth()));
    const recurringMonthly = sumMonthlyEquivalent(customers.filter(isRecurringSale));
    const yearSales = sumSaleAmounts(customers.filter((restaurant) => saleYear(restaurant) === currentYear()));
    const topProspects = state.restaurants.filter(isTopProspect).length;
    elements.metricTotal.textContent = moneyMetric(thisMonthSales);
    elements.metricCustomers.textContent = moneyMetric(recurringMonthly);
    elements.metricProspects.textContent = moneyMetric(yearSales);
    elements.metricFollowups.textContent = topProspects;
  }

  function isVisibleProspect(restaurant) {
    return restaurant.status === "prospect" && restaurant.prospectScore !== "1" && isDefaultOwner(restaurant);
  }

  function prospectScoreNumber(restaurant) {
    const score = Number(restaurant.prospectScore || 0);
    return Number.isFinite(score) ? score : 0;
  }

  function prospectScoreOptions(selectedScore = "") {
    return Object.keys(prospectScoreLabels)
      .map((score) => `<option value="${escapeHtml(score)}"${String(selectedScore) === score ? " selected" : ""}>${escapeHtml(score)}</option>`)
      .join("");
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

  function saleDateFor(restaurant) {
    return restaurant.saleDate || restaurant.serviceStartDate || "";
  }

  function saleMonth(restaurant) {
    return saleDateFor(restaurant).slice(0, 7);
  }

  function saleYear(restaurant) {
    return saleDateFor(restaurant).slice(0, 4);
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

  function saleAmount(restaurant = {}) {
    return numberFromMoney(restaurant.monthlyAmount, 0);
  }

  function monthlyEquivalentAmount(restaurant = {}) {
    const amount = saleAmount(restaurant);
    const billingMonths = billingMonthsForSale(restaurant);
    return billingMonths > 1 ? Math.round((amount / billingMonths) * 100) / 100 : amount;
  }

  function sumSaleAmounts(restaurants) {
    return restaurants.reduce((total, restaurant) => total + saleAmount(restaurant), 0);
  }

  function sumMonthlyEquivalent(restaurants) {
    return restaurants.reduce((total, restaurant) => total + monthlyEquivalentAmount(restaurant), 0);
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
        record.amount += monthlyEquivalentAmount(restaurant);
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
              <button class="link-button strong-link" type="button" data-edit-id="${escapeHtml(restaurant.id)}">${escapeHtml(restaurant.name)}</button>
              ${repBadge(restaurant)}
              <div class="helper">${escapeHtml(formattedAddress(restaurant) || "No address yet")}</div>
              ${repHelper(restaurant) ? `<div class="helper">${escapeHtml(repHelper(restaurant))}</div>` : ""}
            </td>
            <td>${statusPill(restaurant.status)}</td>
            <td>${escapeHtml(contactName(restaurant) || "No contact yet")}</td>
            <td>${restaurant.contactEmail ? `<a href="mailto:${escapeHtml(restaurant.contactEmail)}">${escapeHtml(restaurant.contactEmail)}</a>` : ""}</td>
            <td>${escapeHtml(restaurant.phone || restaurant.contactCell || "")}</td>
            <td>${escapeHtml(restaurant.nextFollowUp || "")}</td>
            <td><button class="text-button" type="button" data-research-restaurant-id="${escapeHtml(restaurant.id)}">Research</button></td>
          </tr>
        `).join("")
      : '<tr><td colspan="7"><div class="empty-state">No restaurants match this view.</div></td></tr>';
  }

  function renderProspects() {
    const scoreMin = Number(elements.prospectScoreMin?.value || 1);
    const scoreMax = Number(elements.prospectScoreMax?.value || 10);
    const min = Math.min(scoreMin, scoreMax);
    const max = Math.max(scoreMin, scoreMax);
    const searchQuery = String(elements.prospectSearch?.value || "");
    const prospects = getFilteredRestaurants({ forceStatus: "prospect", query: searchQuery })
      .filter(isVisibleProspect)
      .filter((restaurant) => {
        const score = prospectScoreNumber(restaurant);
        return score >= min && score <= max;
      })
      .sort(compareProspects);
    elements.prospectList.innerHTML = prospects.length
      ? prospects.map((restaurant) => `
          <tr>
            <td>
              <button class="link-button" type="button" data-contact-id="${escapeHtml(restaurant.id)}">${escapeHtml(restaurant.name)}</button>
              <div class="helper">${escapeHtml(formattedAddress(restaurant) || "No address yet")}</div>
              ${repHelper(restaurant) ? `<div class="helper">${escapeHtml(repHelper(restaurant))}</div>` : ""}
            </td>
            <td>${escapeHtml(contactName(restaurant) || "")}</td>
            <td>${restaurant.contactEmail ? `<a href="mailto:${escapeHtml(restaurant.contactEmail)}">${escapeHtml(restaurant.contactEmail)}</a>` : ""}</td>
            <td>${escapeHtml(restaurant.contactCell || restaurant.phone || "")}</td>
            <td>${escapeHtml(labelFor(prospectStageLabels, restaurant.prospectStage, "Not set"))}</td>
            <td>
              <select
                class="inline-score-select"
                data-prospect-score-id="${escapeHtml(restaurant.id)}"
                aria-label="Score for ${escapeHtml(restaurant.name)}"
              >
                ${prospectScoreOptions(restaurant.prospectScore || "5")}
              </select>
            </td>
            <td>${escapeHtml(latestContactSummary(restaurant))}</td>
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
            <td><button class="text-button" type="button" data-research-restaurant-id="${escapeHtml(restaurant.id)}">Research</button></td>
            <td>${
              restaurant.contactEmail
                ? `<a class="text-button" href="${escapeHtml(salesEmailDraftUrlForRestaurant(restaurant))}" data-log-sales-email-id="${escapeHtml(restaurant.id)}">Send Email 1</a>`
                : '<span class="helper">No email</span>'
            }</td>
          </tr>
        `).join("")
      : '<tr><td colspan="10"><div class="empty-state">No prospects match this search and score range.</div></td></tr>';
  }

  function leadBuilderCategories() {
    const checked = [...document.querySelectorAll('[name="lead-builder-category"]:checked')]
      .map((input) => input.value)
      .filter(Boolean);
    return checked.length ? checked : ["restaurants with trivia"];
  }

  const US_STATE_LIST = [
    ["Alabama", "AL"],
    ["Alaska", "AK"],
    ["Arizona", "AZ"],
    ["Arkansas", "AR"],
    ["California", "CA"],
    ["Colorado", "CO"],
    ["Connecticut", "CT"],
    ["Delaware", "DE"],
    ["District of Columbia", "DC"],
    ["Florida", "FL"],
    ["Georgia", "GA"],
    ["Hawaii", "HI"],
    ["Idaho", "ID"],
    ["Illinois", "IL"],
    ["Indiana", "IN"],
    ["Iowa", "IA"],
    ["Kansas", "KS"],
    ["Kentucky", "KY"],
    ["Louisiana", "LA"],
    ["Maine", "ME"],
    ["Maryland", "MD"],
    ["Massachusetts", "MA"],
    ["Michigan", "MI"],
    ["Minnesota", "MN"],
    ["Mississippi", "MS"],
    ["Missouri", "MO"],
    ["Montana", "MT"],
    ["Nebraska", "NE"],
    ["Nevada", "NV"],
    ["New Hampshire", "NH"],
    ["New Jersey", "NJ"],
    ["New Mexico", "NM"],
    ["New York", "NY"],
    ["North Carolina", "NC"],
    ["North Dakota", "ND"],
    ["Ohio", "OH"],
    ["Oklahoma", "OK"],
    ["Oregon", "OR"],
    ["Pennsylvania", "PA"],
    ["Rhode Island", "RI"],
    ["South Carolina", "SC"],
    ["South Dakota", "SD"],
    ["Tennessee", "TN"],
    ["Texas", "TX"],
    ["Utah", "UT"],
    ["Vermont", "VT"],
    ["Virginia", "VA"],
    ["Washington", "WA"],
    ["West Virginia", "WV"],
    ["Wisconsin", "WI"],
    ["Wyoming", "WY"],
  ];
  const US_STATE_CODES = Object.fromEntries(
    US_STATE_LIST.map(([name, code]) => [name.toLowerCase().replace(/[^a-z]/g, ""), code])
  );
  const US_STATE_CODE_PATTERN = US_STATE_LIST.map(([, code]) => code).join("|");
  const US_STATE_NAME_PATTERN = US_STATE_LIST.map(([name]) => name.replace(/\s+/g, "\\s+")).join("|");
  const US_STATE_PATTERN = `(?:${US_STATE_CODE_PATTERN}|${US_STATE_NAME_PATTERN})`;

  function stateCodeFromText(value = "", fallback = "") {
    const cleaned = String(value || "").trim();
    const key = cleaned.toLowerCase().replace(/[^a-z]/g, "");
    if (new RegExp(`^(?:${US_STATE_CODE_PATTERN})$`, "i").test(cleaned)) {
      return cleaned.toUpperCase();
    }
    return US_STATE_CODES[key] || fallback;
  }

  function cleanCityName(value = "") {
    const city = String(value || "").trim();
    if (!city) {
      return "";
    }
    if (/[A-Z]/.test(city)) {
      return city;
    }
    return city.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
  }

  function splitCityState(value = "", fallbackState = "") {
    const text = String(value || "").trim();
    const commaMatch = text.match(/^(.+?),\s*([A-Za-z ]{2,})$/);
    if (commaMatch) {
      return {
        city: cleanCityName(commaMatch[1]),
        state: stateCodeFromText(commaMatch[2], fallbackState),
      };
    }
    const trailingStateMatch = text.match(new RegExp(`^(.+?)\\s+(${US_STATE_PATTERN})$`, "i"));
    if (trailingStateMatch) {
      return {
        city: cleanCityName(trailingStateMatch[1]),
        state: stateCodeFromText(trailingStateMatch[2], fallbackState),
      };
    }
    return { city: cleanCityName(text), state: fallbackState };
  }

  function leadBuilderMarket() {
    const selectedState = elements.leadBuilderState?.value || "GA";
    const county = String(elements.leadBuilderCounty?.value || "").trim() || "Paulding";
    const cityState = splitCityState(String(elements.leadBuilderCity?.value || "").trim() || "Villa Rica", selectedState);
    const stateText = cityState.state || selectedState;
    const city = cityState.city || "Villa Rica";
    const miles = String(elements.leadBuilderMiles?.value || "").trim() || "30";
    const radiusMode = document.querySelector('[name="lead-builder-radius"]:checked')?.value || "miles";
    const maxResults = Math.max(1, Math.min(200, Number(elements.leadBuilderMaxResults?.value || 50) || 50));
    return { stateText, county, city, miles, radiusMode, maxResults };
  }

  function buildLeadSearches() {
    const market = leadBuilderMarket();
    const location = market.radiusMode === "county"
      ? `${market.county} County ${market.stateText}`
      : `${market.city} ${market.stateText}`;
    const countyLocation = `${market.county} County ${market.stateText}`;
    const categories = leadBuilderCategories();
    const searches = categories.flatMap((category) => [
      `${category} ${location}`,
      `${category} near ${countyLocation}`,
      `${category} Facebook events ${location}`,
    ]);
    if (categories.includes("restaurants with trivia")) {
      searches.push(`trivia night restaurant ${location}`);
      searches.push(`weekly trivia ${countyLocation}`);
      searches.push(`bar trivia ${market.city} ${market.stateText}`);
    }
    return [...new Set(searches)].slice(0, 12);
  }

  function renderLeadBuilderSearches(searches = []) {
    elements.leadBuilderSearches.innerHTML = searches.length
      ? searches.map((search) => `
          <div class="lead-search-row">
            <span>${escapeHtml(search)}</span>
            <a class="text-button" href="https://www.google.com/search?q=${encodeURIComponent(search).replace(/%20/g, "+")}" target="_blank" rel="noopener">Open</a>
          </div>
        `).join("")
      : '<div class="empty-state">No search phrases yet.</div>';
  }

  async function runLeadBuilder(event) {
    event.preventDefault();
    const market = leadBuilderMarket();
    const searches = buildLeadSearches();
    elements.leadBuilderProgress.hidden = false;
    elements.leadBuilderProgressBar.style.width = "32%";
    elements.leadBuilderSummary.textContent = "Building search phrases...";
    setSyncStatus("Preparing Lead Builder");

    await new Promise((resolve) => window.setTimeout(resolve, 250));
    elements.leadBuilderProgressBar.style.width = "70%";
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    elements.leadBuilderProgressBar.style.width = "100%";

    renderLeadBuilderSearches(searches);
    elements.leadBuilderSummary.textContent = `${searches.length} starter searches for ${market.county} County, ${market.stateText}. Target maximum: ${market.maxResults} prospects.`;
    setSyncStatus("Lead Builder search plan ready");
  }

  async function copyLeadSearches() {
    const searches = buildLeadSearches();
    const text = searches.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      elements.leadBuilderCopyStatus.textContent = `Copied ${searches.length} searches`;
      setSyncStatus("Lead Builder searches copied");
    } catch {
      window.prompt("Copy these searches:", text);
      elements.leadBuilderCopyStatus.textContent = `${searches.length} searches ready to copy`;
    }
  }

  function clearManualLeadForm() {
    elements.manualLeadForm.reset();
    elements.manualLeadState.value = leadBuilderMarket().stateText;
    elements.manualLeadTrivia.value = "possible";
  }

  function manualLeadFromForm() {
    const market = leadBuilderMarket();
    const name = elements.manualLeadName.value.trim();
    if (!name) {
      return null;
    }
    const notes = [
      elements.manualLeadNotes.value.trim(),
      `Added from Lead Builder search for ${market.county} County, ${market.stateText}.`,
    ].filter(Boolean).join("\n\n");
    return normalizeRestaurant({
      name,
      status: "prospect",
      street: elements.manualLeadStreet.value,
      city: elements.manualLeadCity.value.trim() || market.city,
      state: elements.manualLeadState.value.trim() || market.stateText,
      phone: elements.manualLeadPhone.value,
      currentlyDoesTrivia: elements.manualLeadTrivia.value,
      website: elements.manualLeadWebsite.value,
      facebookPage: elements.manualLeadFacebook.value,
      contactEmail: elements.manualLeadEmail.value,
      notes,
      prospectNotes: notes,
      prospectStage: "new-lead",
      prospectScore: elements.manualLeadTrivia.value === "yes" ? "7" : "5",
      leadSource: "Lead Builder",
      assignedTo: DEFAULT_OWNER,
    });
  }

  function prospectImportPreviewItem(imported) {
    const match = matchingRestaurant(imported);
    const existing = match?.restaurant || null;
    if (existing?.status === "permanently-closed") {
      return {
        imported,
        existing,
        matchReasons: match?.reasons || [],
        record: existing,
        changes: ["Permanently closed - do not add"],
        action: "Skip",
        selected: false,
      };
    }
    const merged = mergeImportedRestaurant(existing, imported);
    return {
      imported,
      existing,
      matchReasons: match?.reasons || [],
      record: merged.record,
      changes: merged.changes,
      action: existing ? (merged.changes.length ? "Update" : "Skip") : "New",
      selected: !existing || merged.changes.length > 0,
    };
  }

  function previewImportedProspects(importedRows = [], readyMessage = "Prospect preview ready") {
    state.pendingProspectImport = importedRows.filter(Boolean).map(prospectImportPreviewItem);
    renderProspectImportPreview();
    elements.prospectImportDialog.showModal();
    setSyncStatus(readyMessage);
  }

  function previewManualLead(event) {
    event.preventDefault();
    const imported = manualLeadFromForm();
    if (!imported) {
      window.alert("Add a restaurant name before previewing this prospect.");
      return;
    }
    previewImportedProspects([imported], "Lead Builder prospect preview ready");
  }

  function pastedLeadChunks(text = "") {
    const prepared = String(text || "")
      .replace(/^\s*Here are[^:]{0,160}:/i, "")
      .replace(/^\s*[\s\S]{0,700}?\bTop [^:]{0,180}:/i, "")
      .replace(/(?:^|[\n.!?]\s*)[^.\n]{0,220}\byour best bet is\s+(.{3,90}?)(?:\s+\([^)]*\))?\.?\s*Where:/i, "$1\nWhere:")
      .replace(/([a-z0-9.])(?=Nearby Options\s*\()/g, "$1\n\n")
      .replace(/:\s*(?=[A-Z][A-Za-z0-9 '&.]{2,80}:\s)/g, ":\n\n")
      .replace(new RegExp(`([a-z0-9.])(?=[A-Z][A-Za-z0-9 '&.]{2,80}\\s+\\([A-Z][A-Za-z ]+,\\s*${US_STATE_PATTERN}\\))`, "g"), "$1\n\n")
      .replace(new RegExp(`\\b(${US_STATE_CODE_PATTERN})(?=When:)`, "g"), "$1\n")
      .replace(/([a-z0-9.])(?=[A-Z][A-Za-z0-9 '&]{2,80}When:)/g, "$1\n\n")
      .replace(/([A-Z][A-Za-z0-9 '&]{2,80})When:/g, "$1\nWhen:")
      .replace(/([a-z0-9.])Trivia Night:/g, "$1\nTrivia Night:")
      .replace(/([a-z0-9.])Details:/g, "$1\nDetails:")
      .replace(/\bDetails:/g, "\nDetails:")
      .replace(/([a-z0-9.])(?=(?!(?:When|Details|Location|Phone|Website|Facebook):)[A-Z][A-Za-z0-9 '&.]{2,80}:\s)/g, "$1\n\n");
    return prepared
      .split(/\n{2,}|(?=\n(?:\d+\.|\*|-)\s+)/)
      .map((chunk) => chunk.replace(/^\s*(?:\d+\.|\*|-)\s*/, "").trim())
      .filter(Boolean);
  }

  function cleanPastedLeadName(line = "") {
    return String(line || "")
      .replace(/^https?:\/\/\S+/i, "")
      .replace(/Trivia Night\s*$/i, "")
      .replace(/:\s+.*$/, "")
      .replace(new RegExp(`\\s+\\([A-Z][A-Za-z ]+,\\s*${US_STATE_PATTERN}\\)\\s*$`, "i"), "")
      .replace(/\s*[-|•].*$/, "")
      .replace(/\s+\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}.*$/, "")
      .replace(/\s*(?:facebook|website|menu|reviews?|directions|open now).*$/i, "")
      .trim();
  }

  function isPastedLeadNameCandidate(name = "") {
    const cleaned = String(name || "").trim();
    const key = normalizedImportKey(cleaned);
    if (!cleaned || cleaned.length < 3 || cleaned.length > 90) {
      return false;
    }
    if (/^(when|details|location|phone|website|facebook|menu|reviews?|directions|open now|here are|known for|offers|nearby options|every|daily|weekly)\b/.test(key)) {
      return false;
    }
    if (/^[a-z]+\.?$/i.test(cleaned) && !/\b(bar|pub|grill|tavern|restaurant|cafe|pizza|brewery|bistro|diner)\b/.test(key)) {
      return false;
    }
    return true;
  }

  function pastedTriviaValue(text = "") {
    const key = normalizedImportKey(text);
    if (/\b(no trivia|does not have trivia|without trivia)\b/.test(key)) {
      return "no";
    }
    if (/\b(trivia|trivia night|trivia nights|quizzo|team trivia|bar trivia)\b/.test(key)) {
      return "yes";
    }
    return "possible";
  }

  function researchTriviaValue(text = "") {
    const key = normalizedImportKey(text);
    if (/\b(no trivia|does not have trivia|without trivia)\b/.test(key)) {
      return "no";
    }
    if (/\b(trivia|trivia night|trivia nights|quizzo|team trivia|bar trivia)\b/.test(key)) {
      return "yes";
    }
    return "";
  }

  function firstMatch(text = "", pattern) {
    const match = String(text || "").match(pattern);
    return match ? match[0].trim() : "";
  }

  function firstUrl(text = "", source = "") {
    const urls = String(text || "").match(/https?:\/\/[^\s)]+/gi) || [];
    if (!source) {
      return urls[0] || "";
    }
    return urls.find((url) => normalizedImportKey(url).includes(source)) || "";
  }

  function firstWebsiteUrl(text = "") {
    const urls = String(text || "").match(/https?:\/\/[^\s)]+/gi) || [];
    const url = urls.find((candidate) => !normalizedImportKey(candidate).includes("facebook"));
    if (url) {
      return url;
    }
    const menuDomain = String(text || "").match(/\b(?:Menu|Website|Site):\s*([A-Z0-9.-]+\.[A-Z]{2,})(?:\/[^\s)]*)?/i);
    return menuDomain ? `https://${menuDomain[1].trim()}` : "";
  }

  function cityFromPastedLead(text = "", market = leadBuilderMarket()) {
    const nearMatch = String(text || "").match(new RegExp(`\\b(?:near|in|for)\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+){0,2})\\s*,?\\s+(${US_STATE_PATTERN})\\b`, "i"));
    if (nearMatch) {
      return { city: cleanCityName(nearMatch[1]), state: stateCodeFromText(nearMatch[2], market.stateText) };
    }
    const cityPattern = new RegExp(`\\b([A-Z][a-z]+(?:\\s+[A-Z][a-z]+){0,2})\\s*,\\s*(${US_STATE_PATTERN})\\b`, "i");
    const match = String(text || "").match(cityPattern);
    if (match) {
      return { city: cleanCityName(match[1]), state: stateCodeFromText(match[2], market.stateText) };
    }
    return { city: market.city, state: market.stateText };
  }

  function streetFromPastedLead(text = "") {
    return firstMatch(
      text,
      /\b\d{1,6}\s+(?:[NSEW]\s+)?[A-Z][A-Za-z0-9'.-]*(?:\s+[A-Z][A-Za-z0-9'.-]*){0,5}\s+(?:St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Blvd|Boulevard|Ln|Lane|Pkwy|Parkway|Hwy|Highway|Cir|Circle|Ct|Court|Way|Pl|Place|Ter|Terrace)(?:\s+(?:N|S|E|W|NE|NW|SE|SW))?\b/i
    );
  }

  function triviaSiteAddressParts(line = "") {
    const parts = String(line || "").split(",").map((part) => part.trim()).filter(Boolean);
    if (parts.length < 3) {
      return null;
    }
    const state = stateCodeFromText(parts[parts.length - 1], "");
    if (!state) {
      return null;
    }
    const city = cleanCityName(parts[parts.length - 2]);
    let streetParts = parts.slice(0, -2);
    if (streetParts.length > 1 && normalizedImportKey(streetParts[streetParts.length - 1]) === normalizedImportKey(city)) {
      streetParts = streetParts.slice(0, -1);
    }
    const street = streetParts.join(", ").trim();
    if (!street || !city || !/^\d|^P\.?\s*O\.?\s*Box\b/i.test(street)) {
      return null;
    }
    return { street, city, state };
  }

  function zipFromPastedLead(text = "") {
    return firstMatch(text, /\b\d{5}(?:-\d{4})?\b/);
  }

  function triviaResearchNote(text = "") {
    const match = String(text || "").match(/(?:^|[.!?\n])([^.!?\n]{0,140}\btrivia\b[^.!?\n]{0,180})/i);
    return match ? `Research trivia note: ${match[1].trim()}` : "";
  }

  function googleDescriptionResearchNote(text = "") {
    const lines = String(text || "").split(/\n+/).map((line) => line.trim()).filter(Boolean);
    const labelPattern = /^(address|categories|hours|menu|phone|price per person|reported by|service options|suggest an edit|website)\b/i;
    const description = lines.find((line) => {
      const cleaned = line.replace(/\s+/g, " ").trim();
      if (!cleaned || cleaned.length < 24 || cleaned.length > 220) {
        return false;
      }
      if (labelPattern.test(cleaned) || /^https?:\/\//i.test(cleaned)) {
        return false;
      }
      if (streetFromPastedLead(cleaned) || /\(?\b\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/.test(cleaned)) {
        return false;
      }
      return /[a-z]/i.test(cleaned) && /[.!]$/.test(cleaned);
    });
    return description ? `Google description: ${description.replace(/\s+/g, " ").trim()}` : "";
  }

  function contactFirstNameFromEmail(email = "") {
    const prefix = String(email || "").split("@")[0] || "";
    if (!/[._-]/.test(prefix)) {
      return "";
    }
    const cleaned = prefix
      .replace(/[._-]+/g, " ")
      .replace(/\d+/g, " ")
      .trim();
    const words = cleaned.split(/\s+/).filter(Boolean);
    const firstWord = words[0] || "";
    if (words.length < 2 || !firstWord || firstWord.length < 2) {
      return "";
    }
    const genericNames = new Set([
      "admin",
      "booking",
      "contact",
      "events",
      "hello",
      "info",
      "manager",
      "marketing",
      "office",
      "owner",
      "reservations",
      "sales",
      "support",
      "team",
    ]);
    const key = firstWord.toLowerCase();
    if (genericNames.has(key) || !/^[a-z]+$/i.test(firstWord)) {
      return "";
    }
    return cleanCityName(key);
  }

  function researchNotesFromText(baseRecord = {}, text = "") {
    const researchText = String(text || "").trim();
    const triviaValue = researchTriviaValue(researchText);
    const note = triviaResearchNote(researchText);
    const descriptionNote = googleDescriptionResearchNote(researchText);
    const combinedNote = [descriptionNote, note].filter(Boolean).join("\n");
    const contactEmail = firstMatch(researchText, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || baseRecord.contactEmail;
    const cityState = cityFromPastedLead(researchText, {
      city: baseRecord.city || "",
      stateText: baseRecord.state || leadBuilderMarket().stateText,
    });
    return normalizeRestaurant({
      ...baseRecord,
      status: baseRecord.status || "prospect",
      street: streetFromPastedLead(researchText) || baseRecord.street,
      city: cityState.city || baseRecord.city,
      state: cityState.state || baseRecord.state,
      zip: zipFromPastedLead(researchText) || baseRecord.zip,
      phone: firstMatch(researchText, /\(?\b\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/) || baseRecord.phone,
      currentlyDoesTrivia: triviaValue || baseRecord.currentlyDoesTrivia,
      website: firstWebsiteUrl(researchText) || baseRecord.website,
      facebookPage: firstUrl(researchText, "facebook") || baseRecord.facebookPage,
      contactFirstName: baseRecord.contactFirstName || contactFirstNameFromEmail(contactEmail),
      contactEmail,
      notes: combinedNote ? appendUniqueNote(baseRecord.notes, combinedNote) : baseRecord.notes,
      prospectNotes: combinedNote ? appendUniqueNote(baseRecord.prospectNotes, combinedNote) : baseRecord.prospectNotes,
      prospectStage: baseRecord.prospectStage || "new-lead",
      prospectScore: baseRecord.prospectScore || (triviaValue === "yes" ? "7" : "5"),
      leadSource: baseRecord.leadSource || "Lead Builder research",
      assignedTo: baseRecord.assignedTo || DEFAULT_OWNER,
    });
  }

  function pastedLeadFromChunk(chunk = "") {
    const lines = String(chunk || "").split(/\n+/).map((line) => line.trim()).filter(Boolean);
    const nameLine = lines.find((line) => {
      const cleaned = cleanPastedLeadName(line);
      return isPastedLeadNameCandidate(cleaned) && !/^https?:\/\//i.test(line);
    }) || "";
    const name = cleanPastedLeadName(nameLine);
    if (!isPastedLeadNameCandidate(name)) {
      return null;
    }
    const cityState = cityFromPastedLead(chunk, { city: "", stateText: "" });
    const website = firstUrl(chunk);
    const facebookPage = firstUrl(chunk, "facebook");
    const phone = firstMatch(chunk, /\(?\b\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/);
    const email = firstMatch(chunk, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    return normalizeRestaurant({
      name,
      status: "prospect",
      street: streetFromPastedLead(chunk),
      city: cityState.city,
      state: cityState.state,
      phone,
      currentlyDoesTrivia: pastedTriviaValue(chunk),
      website,
      facebookPage,
      contactFirstName: contactFirstNameFromEmail(email),
      contactEmail: email,
      prospectStage: "new-lead",
      prospectScore: pastedTriviaValue(chunk) === "yes" ? "7" : "5",
      leadSource: "Lead Builder paste",
      assignedTo: DEFAULT_OWNER,
    });
  }

  function isTriviaSiteEventLabel(line = "") {
    const key = normalizedImportKey(line);
    return [
      "live trivia",
      "singo",
      "xtreme bar bingo",
    ].includes(key);
  }

  function isTriviaSiteNoiseLine(line = "") {
    const key = normalizedImportKey(line);
    return !key ||
      isTriviaSiteEventLabel(line) ||
      key === "venues" ||
      key === "trivia jockeys" ||
      key === "players" ||
      key === "venue owners" ||
      key === "learn more" ||
      key === "trivia hints" ||
      key === "facebook" ||
      key === "instagram" ||
      key === "cancelled this week" ||
      key === "interested in bringing challenge entertainment to your location find out how to turn your slowest night into your busiest" ||
      key === "ready to run the show our trivia jockeys and hosts are some of the best players we know find out how to become part of our team" ||
      /^copyright\b/.test(key) ||
      /^find a local game\b/.test(key) ||
      /^explore games\b/.test(key) ||
      /^get league scores\b/.test(key) ||
      /^bring game night\b/.test(key) ||
      /^join our team\b/.test(key) ||
      /^1888987triv$/.test(key) ||
      /^https?:\/\//i.test(String(line || "")) ||
      /^[›>]+$/.test(String(line || "").trim()) ||
      /^(today|tonight|tomorrow|mon|tue|wed|thu|fri|sat|sun|mondays|tuesdays|wednesdays|thursdays|fridays|saturdays|sundays)\b/i.test(String(line || "").trim());
  }

  function triviaSiteEventType(lines = [], addressIndex = 0) {
    for (let index = addressIndex - 1; index >= 0 && index >= addressIndex - 5; index -= 1) {
      if (isTriviaSiteEventLabel(lines[index])) {
        return lines[index];
      }
    }
    return "Live Trivia";
  }

  function triviaSiteScheduleLines(lines = [], startIndex = 0) {
    const schedule = [];
    for (let index = startIndex; index < lines.length; index += 1) {
      const line = lines[index];
      const cleaned = line.replace(/^[^\w]+/, "").trim();
      if (triviaSiteAddressParts(line)) {
        break;
      }
      if (/^[›>]+$/.test(line) || isTriviaSiteEventLabel(line)) {
        break;
      }
      if (/^(today|tonight|tomorrow|mon|tue|wed|thu|fri|sat|sun|mondays|tuesdays|wednesdays|thursdays|fridays|saturdays|sundays|cancelled this week)\b/i.test(cleaned)) {
        schedule.push(cleaned);
      }
    }
    return schedule.filter(Boolean);
  }

  function triviaSiteLeadsFromText(text = "") {
    const lines = String(text || "").split(/\n+/).map((line) => line.trim()).filter(Boolean);
    const records = [];
    lines.forEach((line, index) => {
      const address = triviaSiteAddressParts(line);
      if (!address || index < 1) {
        return;
      }
      const name = cleanPastedLeadName(lines[index - 1]);
      if (!isPastedLeadNameCandidate(name) || isTriviaSiteNoiseLine(name)) {
        return;
      }
      const eventType = triviaSiteEventType(lines, index);
      const schedule = triviaSiteScheduleLines(lines, index + 1);
      const notes = [
        "Trivia site result:",
        eventType ? `Event: ${eventType}` : "",
        schedule.length ? `Schedule: ${schedule.join(" / ")}` : "",
      ].filter(Boolean).join("\n");
      records.push(normalizeRestaurant({
        name,
        status: "prospect",
        street: address.street,
        city: address.city,
        state: address.state,
        currentlyDoesTrivia: /trivia/i.test(eventType) ? "yes" : "possible",
        notes,
        prospectNotes: notes,
        prospectStage: "new-lead",
        prospectScore: /trivia/i.test(eventType) ? "7" : "5",
        leadSource: "Lead Builder trivia site paste",
        assignedTo: DEFAULT_OWNER,
      }));
    });
    return records;
  }

  function isYelpPaste(text = "") {
    const key = normalizedImportKey(text);
    return key.includes("sort recommended") && (key.includes("reviews") || key.includes("start order"));
  }

  function isYelpNoiseLine(line = "") {
    const key = normalizedImportKey(line);
    const categoryKeys = new Set([
      "american",
      "bars",
      "beer bar",
      "beer gardens",
      "beer wine and spirits",
      "breweries",
      "burgers",
      "desserts",
      "gastropubs",
      "karaoke",
      "order food",
      "pizza",
      "sandwiches",
      "sports bars",
      "start order",
      "tapas small plates",
      "venues and event spaces",
      "wine bars",
    ]);
    if (!key || categoryKeys.has(key)) {
      return true;
    }
    if (/^\d+(?:\.\d+)?\s*\(\d+\s+reviews?\)$/i.test(String(line || "").trim())) {
      return true;
    }
    return /^(best trivia night near|sort recommended|on their website|more|order food|start order)\b/.test(key);
  }

  function isYelpBusinessNameCandidate(line = "") {
    const cleaned = String(line || "").trim();
    if (!cleaned || cleaned.length < 3 || cleaned.length > 90) {
      return false;
    }
    if (isYelpNoiseLine(cleaned) || streetFromPastedLead(cleaned)) {
      return false;
    }
    return !/^["']/.test(cleaned);
  }

  function nextYelpBusinessStart(lines = [], startIndex = 0) {
    for (let index = startIndex; index < lines.length - 1; index += 1) {
      const current = lines[index];
      if (current === lines[index + 1] && isYelpBusinessNameCandidate(current)) {
        return index;
      }
    }
    return lines.length;
  }

  function yelpRatingLine(lines = []) {
    return lines.find((line) => /^\d+(?:\.\d+)?\s*\(\d+\s+reviews?\)$/i.test(line)) || "";
  }

  function yelpCategoryLines(lines = []) {
    const ratingIndex = lines.findIndex((line) => line === yelpRatingLine(lines));
    if (ratingIndex < 0) {
      return [];
    }
    const categories = [];
    for (let index = ratingIndex + 1; index < lines.length; index += 1) {
      const line = lines[index];
      const key = normalizedImportKey(line);
      if (streetFromPastedLead(line) || /^["']/.test(line) || /^(start order|order food|on their website)\b/.test(key)) {
        break;
      }
      categories.push(line);
    }
    return categories;
  }

  function yelpTriviaQuote(lines = []) {
    const quoteLine = lines.find((line) => /^["']/.test(line) && /\btrivia\b/i.test(line));
    return String(quoteLine || "")
      .replace(/^["']\s*/, "")
      .replace(/["']?\s*more\s*$/i, "")
      .trim();
  }

  function yelpLeadNote(lines = []) {
    const rating = yelpRatingLine(lines);
    const categories = yelpCategoryLines(lines);
    const quote = yelpTriviaQuote(lines);
    return [
      "Yelp result:",
      rating ? `Rating: ${rating}` : "",
      categories.length ? `Categories: ${categories.join(", ")}` : "",
      quote ? `Trivia mention: "${quote}"` : "",
    ].filter(Boolean).join("\n");
  }

  function yelpLeadsFromText(text = "") {
    if (!isYelpPaste(text)) {
      return [];
    }
    const market = leadBuilderMarket();
    const lines = String(text || "").split(/\n+/).map((line) => line.trim()).filter(Boolean);
    const records = [];
    for (let index = 0; index < lines.length - 1; index += 1) {
      const name = lines[index];
      if (name !== lines[index + 1] || !isYelpBusinessNameCandidate(name)) {
        continue;
      }
      const nextStart = nextYelpBusinessStart(lines, index + 2);
      const resultLines = lines.slice(index + 2, nextStart);
      const resultText = resultLines.join("\n");
      const cityState = cityFromPastedLead(resultText, { city: "", stateText: market.stateText });
      const notes = yelpLeadNote(resultLines);
      records.push(normalizeRestaurant({
        name,
        status: "prospect",
        street: streetFromPastedLead(resultText),
        city: cityState.city,
        state: cityState.state,
        currentlyDoesTrivia: pastedTriviaValue(resultText),
        notes,
        prospectNotes: notes,
        prospectStage: "new-lead",
        prospectScore: pastedTriviaValue(resultText) === "yes" ? "7" : "5",
        leadSource: "Lead Builder Yelp paste",
        assignedTo: DEFAULT_OWNER,
      }));
      index = nextStart - 1;
    }
    return records;
  }

  function nearbyRadarLeadsFromText(text = "") {
    const match = String(text || "").match(/\binclude\s+(.+)$/i);
    if (!match) {
      return [];
    }
    const market = leadBuilderMarket();
    const radarText = match[1].replace(/\.$/, "");
    const records = [];
    const groupPattern = /([A-Z][A-Za-z0-9 '&.]+(?:\s+and\s+[A-Z][A-Za-z0-9 '&.]+)*)\s+in\s+([A-Z][A-Za-z ]+?)(?=,\s+as well as|,\s+and|,|$)/g;
    let group;
    while ((group = groupPattern.exec(radarText))) {
      const city = group[2].trim();
      const names = group[1].split(/\s+and\s+/).map((name) => cleanPastedLeadName(name)).filter(isPastedLeadNameCandidate);
      names.forEach((name) => {
        const notes = `Nearby radar lead from Lead Builder: ${name} was mentioned as just over the line in ${city}.`;
        records.push(normalizeRestaurant({
          name,
          status: "prospect",
          city,
          state: market.stateText,
          currentlyDoesTrivia: "possible",
          notes,
          prospectNotes: notes,
          prospectStage: "new-lead",
          prospectScore: "4",
          leadSource: "Lead Builder nearby mention",
          assignedTo: DEFAULT_OWNER,
        }));
      });
    }
    return records;
  }

  function pastedLeadsFromText(text = "") {
    const yelpRecords = yelpLeadsFromText(text);
    if (yelpRecords.length) {
      return uniquePastedLeads(yelpRecords);
    }
    const triviaSiteRecords = triviaSiteLeadsFromText(text);
    if (triviaSiteRecords.length) {
      return uniquePastedLeads(triviaSiteRecords);
    }
    const chunks = pastedLeadChunks(text);
    const records = [
      ...chunks.map(pastedLeadFromChunk).filter(Boolean),
      ...nearbyRadarLeadsFromText(text),
    ];
    return uniquePastedLeads(records);
  }

  function uniquePastedLeads(records = []) {
    const seen = new Set();
    return records.filter((record) => {
      const key = [normalizedImportKey(record.name), normalizedImportKey(record.city), normalizedPhone(record.phone)].join("|");
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  function previewPastedLeads(event) {
    event.preventDefault();
    const importedRows = pastedLeadsFromText(elements.pasteLeadsText.value);
    elements.pasteLeadsStatus.textContent = importedRows.length
      ? `Found ${importedRows.length} possible ${importedRows.length === 1 ? "lead" : "leads"}`
      : "No clear restaurant leads found";
    if (!importedRows.length) {
      window.alert("I could not find clear restaurant leads in that pasted text. Try pasting one restaurant per paragraph, with the restaurant name near the top.");
      return;
    }
    previewImportedProspects(importedRows, "Pasted lead preview ready");
  }

  function clearPastedLeads() {
    elements.pasteLeadsText.value = "";
    elements.pasteLeadsStatus.textContent = "";
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
    const paymentType = elements.collectionPaymentType.value || "recurring";
    const nextAmount = paymentType === "recurring"
      ? monthlyAmount
      : billingType === "half"
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

  function gameNameForInvoice(restaurant, fallbackName = "Restaurant Challenge") {
    return String(restaurant?.gameName || "").trim() || `${fallbackName} Game`;
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

  function renewalDayLabel(dateText = "") {
    const day = Number(String(dateText || "").slice(8, 10));
    if (!day) {
      return "the signup day";
    }
    const suffix = day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";
    return `the ${day}${suffix}`;
  }

  function fillMonthlyInvoiceTemplate() {
    const restaurant = state.restaurants.find((record) => record.id === elements.collectionRestaurant.value);
    const monthValue = elements.invoiceTemplateMonth.value || currentMonth();
    const restaurantName = restaurant?.name || "Restaurant Challenge";
    const gameName = gameNameForInvoice(restaurant, restaurantName);
    const billingType = elements.invoiceTemplateType.value;
    const paymentType = elements.collectionPaymentType.value || "recurring";
    const monthlyAmount = numberFromMoney(restaurant?.monthlyAmount, 19);
    const calculatedAmount = paymentType === "recurring"
      ? monthlyAmount
      : billingType === "half"
      ? monthlyAmount / 2
      : billingType === "auto"
        ? proratedAmount(monthlyAmount, restaurant?.serviceStartDate, monthValue)
        : monthlyAmount;
    const isProrated = calculatedAmount !== monthlyAmount;
    const defaultDescription = paymentType === "recurring"
      ? `${gameName} Monthly Subscription Setup`
      : billingType === "half" || isProrated
      ? `${gameName} Partial Month Subscription`
      : `${gameName} Monthly Subscription`;
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
    const paymentNote = paymentType === "recurring"
      ? `Subscription starts when the customer signs up and renews monthly on ${renewalDayLabel(restaurant?.serviceStartDate || restaurant?.saleDate)}.`
      : `${period.prefix}: ${period.label}.`;
    elements.collectionNotes.value = collectionNotesWithPaymentType(`${description}. ${paymentNote}`, paymentType);
  }

  function firstPaymentMatch(text = "", patterns = []) {
    const source = String(text || "");
    for (const pattern of patterns) {
      const match = source.match(pattern);
      if (match?.[1]) {
        return match[1].trim();
      }
    }
    return "";
  }

  function paymentDateFromPaypalText(text = "") {
    const match = String(text || "").match(/\b([A-Z][a-z]{2}\s+\d{1,2},\s+\d{4})\b/);
    if (!match) {
      return today();
    }
    const date = new Date(`${match[1]}T00:00:00`);
    return Number.isNaN(date.getTime()) ? today() : dateInputValue(date);
  }

  function parseMoneyText(value = "") {
    const amount = Number(String(value || "").replace(/[^0-9.]/g, ""));
    return Number.isFinite(amount) ? amount : 0;
  }

  function parsePaypalPaymentText(text = "") {
    const source = String(text || "");
    const profileId = firstPaymentMatch(source, [
      /\bProfile ID\s+([A-Z0-9-]+)/i,
      /\bRecurring Payment ID\s+([A-Z0-9-]+)/i,
      /\bSubscription ID\s+([A-Z0-9-]+)/i,
      /\b(I-[A-Z0-9]+)\b/i,
    ]);
    const transactionId = firstPaymentMatch(source, [
      /\bTransaction ID:\s*\[?([A-Z0-9]+)/i,
      /\bTransaction ID\s+([A-Z0-9]+)/i,
    ]);
    const customerName = firstPaymentMatch(source, [
      /\bCustomer name\s+([^\n]+)/i,
      /\bPaid by\s+([^\n]+)/i,
      /\bpayment from\s+(.+?)\s+for\s+/i,
    ]);
    const customerEmail = firstPaymentMatch(source, [
      /\bCustomer email\s+([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i,
      /\b([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})\b/i,
    ]).toLowerCase();
    const grossText = firstPaymentMatch(source, [
      /\bAmount received\s+\$?\s*([0-9,]+(?:\.[0-9]{2})?)/i,
      /\bGross Amount\s+\$?\s*([0-9,]+(?:\.[0-9]{2})?)/i,
      /\bGross amount\s+\$?\s*([0-9,]+(?:\.[0-9]{2})?)/i,
    ]);
    const feeText = firstPaymentMatch(source, [
      /\bTransaction fee\s+-?\$?\s*([0-9,]+(?:\.[0-9]{2})?)/i,
    ]);
    const netText = firstPaymentMatch(source, [
      /\bNet Amount\s+\$?\s*([0-9,]+(?:\.[0-9]{2})?)/i,
      /\bNet amount\s+\$?\s*([0-9,]+(?:\.[0-9]{2})?)/i,
    ]);
    const grossAmount = parseMoneyText(grossText);
    const feeAmount = parseMoneyText(feeText);
    const netAmount = parseMoneyText(netText);
    return {
      profileId,
      transactionId,
      customerName,
      customerEmail,
      grossAmount,
      feeAmount,
      netAmount,
      paidDate: paymentDateFromPaypalText(source),
      rawText: source,
    };
  }

  function paypalPaymentNote(payment = {}) {
    return [
      "PayPal payment received.",
      payment.transactionId ? `Transaction ID: ${payment.transactionId}` : "",
      payment.profileId ? `Profile ID: ${payment.profileId}` : "",
      payment.grossAmount ? `Gross amount: ${moneyValue(payment.grossAmount)}` : "",
      payment.feeAmount ? `PayPal fee: ${moneyValue(payment.feeAmount)}` : "",
      payment.netAmount ? `Net amount after PayPal fee: ${moneyValue(payment.netAmount)}` : "",
    ].filter(Boolean).join(" / ");
  }

  function paypalNetAmountFromNotes(notes = "") {
    const match = String(notes || "").match(/Net amount after PayPal fee:\s*\$?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    return match ? parseMoneyText(match[1]) : 0;
  }

  function findPaypalPaymentRestaurant(payment = {}) {
    const profileKey = String(payment.profileId || "").trim().toLowerCase();
    if (profileKey) {
      const restaurant = state.restaurants.find((record) =>
        String(record.paypalSubscriptionId || "").trim().toLowerCase() === profileKey
      );
      if (restaurant) {
        return { restaurant, reason: "PayPal Profile ID" };
      }
    }
    const emailKey = String(payment.customerEmail || "").trim().toLowerCase();
    if (emailKey) {
      const matches = state.restaurants.filter((record) =>
        String(record.contactEmail || "").trim().toLowerCase() === emailKey ||
        String(record.secondContactEmail || "").trim().toLowerCase() === emailKey
      );
      if (matches.length === 1) {
        return { restaurant: matches[0], reason: "customer email" };
      }
    }
    return { restaurant: null, reason: "" };
  }

  function openCollectionsForRestaurant(restaurant = {}) {
    const records = collectionsForRestaurant(restaurant)
      .filter((collection) => collection.status !== "paid")
      .sort((left, right) => String(left.dueDate || "9999-12-31").localeCompare(String(right.dueDate || "9999-12-31")));
    return records[0] || null;
  }

  function renderPaypalPaymentPreview() {
    const pending = state.pendingPaypalPayment;
    if (!pending) {
      elements.paypalPaymentPreview.hidden = true;
      elements.paypalPaymentPreview.innerHTML = "";
      return;
    }
    const { payment, restaurant, reason, collection } = pending;
    const hasMatch = Boolean(restaurant);
    elements.paypalPaymentPreview.hidden = false;
    elements.paypalPaymentPreview.innerHTML = `
      <div class="paypal-payment-preview-card ${hasMatch ? "" : "is-warning"}">
        <h4>${hasMatch ? "PayPal match found" : "No safe match found"}</h4>
        <p class="helper">${hasMatch ? `Matched ${escapeHtml(restaurant.name)} by ${escapeHtml(reason)}.` : "I could not safely match this PayPal payment to a restaurant. Add the PayPal Profile ID to the restaurant card, then preview again."}</p>
        <dl>
          <div><dt>Restaurant</dt><dd>${hasMatch ? escapeHtml(restaurant.name) : "No match"}</dd></div>
          <div><dt>Profile ID</dt><dd>${escapeHtml(payment.profileId || "Not found")}</dd></div>
          <div><dt>Transaction</dt><dd>${escapeHtml(payment.transactionId || "Not found")}</dd></div>
          <div><dt>Customer</dt><dd>${escapeHtml([payment.customerName, payment.customerEmail].filter(Boolean).join(" / ") || "Not found")}</dd></div>
          <div><dt>Paid Date</dt><dd>${escapeHtml(shortDate(payment.paidDate) || payment.paidDate)}</dd></div>
          <div><dt>Gross Amount</dt><dd>${escapeHtml(payment.grossAmount ? moneyValue(payment.grossAmount) : "Not found")}</dd></div>
          <div><dt>Net Amount</dt><dd>${escapeHtml(payment.netAmount ? moneyValue(payment.netAmount) : "Not shown in this paste")}</dd></div>
          <div><dt>Invoice</dt><dd>${collection ? `Will mark invoice ${escapeHtml(collection.invoiceNumber || collection.id)} paid` : hasMatch ? "Will create a PayPal payment record" : "No change will be made"}</dd></div>
        </dl>
        ${hasMatch ? '<button class="button button-primary" type="button" data-apply-paypal-payment>Apply Payment</button>' : ""}
      </div>
    `;
  }

  function previewPaypalPayment(event) {
    event.preventDefault();
    const payment = parsePaypalPaymentText(elements.paypalPasteText.value);
    if (!payment.profileId && !payment.customerEmail && !payment.transactionId && !payment.grossAmount) {
      window.alert("I could not find PayPal payment details in that paste. Try copying the PayPal email text again.");
      return;
    }
    const match = findPaypalPaymentRestaurant(payment);
    state.pendingPaypalPayment = {
      payment,
      restaurant: match.restaurant,
      reason: match.reason,
      collection: match.restaurant ? openCollectionsForRestaurant(match.restaurant) : null,
    };
    renderPaypalPaymentPreview();
  }

  function clearPaypalPaymentPaste() {
    elements.paypalPasteText.value = "";
    state.pendingPaypalPayment = null;
    renderPaypalPaymentPreview();
  }

  async function applyPaypalPayment() {
    const pending = state.pendingPaypalPayment;
    if (!pending?.restaurant) {
      return;
    }
    const payment = pending.payment;
    const restaurant = pending.restaurant;
    const note = paypalPaymentNote(payment);
    const collection = normalizeCollection({
      ...(pending.collection || {}),
      id: pending.collection?.id || makeCollectionId(),
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      invoiceNumber: pending.collection?.invoiceNumber || (payment.transactionId ? `PP-${payment.transactionId.slice(-6)}` : "PayPal"),
      dueDate: pending.collection?.dueDate || payment.paidDate || today(),
      amount: payment.grossAmount ? String(payment.grossAmount.toFixed(2)) : pending.collection?.amount,
      status: "paid",
      paidDate: payment.paidDate || today(),
      notes: appendUniqueNote(pending.collection?.notes || "", note),
    });
    const collectionData = await saveAction("saveCollection", { collection }, "Applied PayPal payment");
    if (!collectionData?.collection) {
      return;
    }
    const savedCollection = normalizeCollection(collectionData.collection);
    const existingCollectionIndex = state.collections.findIndex((record) => record.id === savedCollection.id);
    if (existingCollectionIndex >= 0) {
      state.collections[existingCollectionIndex] = savedCollection;
    } else {
      state.collections.unshift(savedCollection);
    }
    const nextPaymentStatus = payment.profileId ? "subscription-active" : "paid";
    const shouldUpdateRestaurant = restaurant.paymentStatus !== nextPaymentStatus ||
      (payment.profileId && String(restaurant.paypalSubscriptionId || "").trim() !== payment.profileId);
    if (shouldUpdateRestaurant) {
      const updatedRestaurant = normalizeRestaurant({
        ...restaurant,
        paypalSubscriptionId: payment.profileId || restaurant.paypalSubscriptionId,
        paymentStatus: nextPaymentStatus,
        salesNotes: payment.profileId
          ? appendUniqueNote(restaurant.salesNotes, `PayPal Profile ID: ${payment.profileId}`)
          : restaurant.salesNotes,
        updatedAt: new Date().toISOString(),
      });
      const restaurantData = await saveAction("saveRestaurant", { restaurant: updatedRestaurant }, "Saved PayPal Profile ID");
      if (restaurantData?.restaurant) {
        const savedRestaurant = normalizeRestaurant(restaurantData.restaurant);
        const existingRestaurantIndex = state.restaurants.findIndex((record) => record.id === savedRestaurant.id);
        if (existingRestaurantIndex >= 0) {
          state.restaurants[existingRestaurantIndex] = savedRestaurant;
        }
      }
    }
    cacheBackofficeData();
    clearPaypalPaymentPaste();
    render();
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
      : '<tr><td colspan="9"><div class="empty-state">No collection records yet.</div></td></tr>';
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
    return state.collections
      .filter((collection) =>
        (restaurant.id && collection.restaurantId === restaurant.id) ||
        (nameKey && String(collection.restaurantName || "").trim().toLowerCase() === nameKey)
      );
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
        const collected = paypalNetAmountFromNotes(collection.notes) || numberFromMoney(collection.amount, 0);
        const rate = commissionRateFor(restaurant, collection);
        totals.collected += collected;
        totals.commission += Math.round(collected * rate * 100) / 100;
        return totals;
      }, { collected: 0, commission: 0 });
  }

  function commissionRows() {
    return state.restaurants
      .filter((restaurant) => restaurant.status === "customer" && cleanSalesRep(restaurant.assignedTo || restaurant.salesperson || DEFAULT_OWNER) === "Doyce")
      .map((restaurant) => {
        const paid = paidCommissionForRestaurant(restaurant);
        return {
          restaurant,
          rep: cleanSalesRep(restaurant.assignedTo || restaurant.salesperson || DEFAULT_OWNER),
          expectedMonthly: expectedMonthlyCommission(restaurant),
          expectedAnnual: expectedAnnualCommission(restaurant),
          collected: paid.collected,
          due: Math.round(paid.commission * 100) / 100,
        };
      })
      .sort((left, right) =>
        String(right.restaurant.saleDate || right.restaurant.serviceStartDate || "").localeCompare(String(left.restaurant.saleDate || left.restaurant.serviceStartDate || "")) ||
        left.rep.localeCompare(right.rep) ||
        String(left.restaurant.name || "").localeCompare(String(right.restaurant.name || ""))
      );
  }

  function renderCommissions() {
    const rows = commissionRows();
    const totalCollected = rows.reduce((total, row) => total + row.collected, 0);
    const totalExpectedMonthly = rows.reduce((total, row) => total + row.expectedMonthly, 0);
    const totalExpectedAnnual = rows.reduce((total, row) => total + row.expectedAnnual, 0);
    const totalDue = rows.reduce((total, row) => total + row.due, 0);
    elements.commissionsSummary.textContent = rows.length
      ? `${rows.length} Doyce ${rows.length === 1 ? "sale" : "sales"} / ${moneyValue(totalExpectedMonthly)} expected monthly / ${moneyValue(totalExpectedAnnual)} expected annual / ${moneyValue(totalDue)} due`
      : "No Doyce customer sales yet.";
    elements.commissionsList.innerHTML = rows.length
      ? rows.map((row) => `
          <tr>
            <td>
              <strong>${escapeHtml(row.restaurant.name || "Unknown restaurant")}</strong>
            </td>
            <td>${escapeHtml(row.rep)}</td>
            <td>${escapeHtml(shortDate(row.restaurant.saleDate || row.restaurant.serviceStartDate))}</td>
            <td>${escapeHtml(moneyValue(row.restaurant.monthlyAmount))}</td>
            <td>${escapeHtml(moneyValue(row.expectedMonthly))}</td>
            <td>${escapeHtml(moneyValue(row.expectedAnnual))}</td>
            <td>${row.collected ? escapeHtml(moneyValue(row.collected)) : '<span class="helper">Not paid yet</span>'}</td>
            <td>${row.due ? `<strong>${escapeHtml(moneyValue(row.due))}</strong>` : '<span class="helper">Not due yet</span>'}</td>
            <td>${escapeHtml(row.restaurant.salesNotes || row.restaurant.packageName || "")}</td>
          </tr>
        `).join("")
      : '<tr><td colspan="9"><div class="empty-state">No Doyce customer sales yet. Leave Sales Rep as Doyce when marking one of his prospects as Customer.</div></td></tr>';
  }

  function collectionStatusOptions(selectedStatus = "") {
    return Object.entries(collectionStatusLabels).map(([value, label]) => `
      <option value="${escapeHtml(value)}"${value === selectedStatus ? " selected" : ""}>${escapeHtml(label)}</option>
    `).join("");
  }

  function collectionPaymentTypeOptions(selectedType = "recurring") {
    return Object.entries(collectionPaymentTypeLabels).map(([value, label]) => `
      <option value="${escapeHtml(value)}"${value === selectedType ? " selected" : ""}>${escapeHtml(label)}</option>
    `).join("");
  }

  function noteMatch(notes = "", pattern) {
    const match = String(notes || "").match(pattern);
    return match?.[1] ? match[1].trim() : "";
  }

  function invoiceTableNote(record = {}) {
    const text = stripPaymentTypeNote(record.notes);
    if (/PayPal payment/i.test(text)) {
      const transaction = noteMatch(text, /Transaction ID:\s*([^/\n]+)/i);
      const gross = noteMatch(text, /Gross amount:\s*([^/\n]+)/i);
      const net = noteMatch(text, /Net amount after PayPal fee:\s*([^/\n]+)/i);
      return [
        "PayPal payment recorded",
        gross ? `Gross ${gross}` : "",
        net ? `Net ${net}` : "",
        transaction ? `Transaction ${transaction}` : "",
      ].filter(Boolean).join(". ");
    }
    const periodMatch = text.match(/(?:Partial service period|Service period):\s*(.+?)(?:\.|$)/i);
    return periodMatch ? periodMatch[1].trim() : text;
  }

  function collectionRow(record) {
    if (state.editingCollectionId === record.id) {
      return `
        <tr data-collection-editor-id="${escapeHtml(record.id)}">
          <td><strong>${escapeHtml(record.restaurantName || "No restaurant")}</strong></td>
          <td><input data-edit-collection-invoice value="${escapeHtml(record.invoiceNumber)}" /></td>
          <td>
            <select data-edit-collection-payment-type>
              ${collectionPaymentTypeOptions(record.paymentType)}
            </select>
          </td>
          <td><input data-edit-collection-due-date type="date" value="${escapeHtml(record.dueDate)}" /></td>
          <td><input data-edit-collection-amount inputmode="decimal" value="${escapeHtml(record.amount)}" /></td>
          <td>
            <select data-edit-collection-status>
              ${collectionStatusOptions(record.status)}
            </select>
          </td>
          <td><input data-edit-collection-paid-date type="date" value="${escapeHtml(record.paidDate)}" /></td>
          <td><input data-edit-collection-notes value="${escapeHtml(stripPaymentTypeNote(record.notes))}" /></td>
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
        <td>${escapeHtml(paymentTypeLabel(record.paymentType))}</td>
        <td>${escapeHtml(shortDate(record.dueDate))}</td>
        <td>${escapeHtml(moneyValue(record.amount))}</td>
        <td>${escapeHtml(labelFor(collectionStatusLabels, record.status, "Not Sent"))}</td>
        <td>${escapeHtml(shortDate(record.paidDate))}</td>
        <td>${escapeHtml(invoiceTableNote(record))}</td>
        <td class="table-actions">
          <button class="text-button" type="button" data-edit-collection-id="${escapeHtml(record.id)}">Edit</button>
          <button class="text-button" type="button" data-email-collection-id="${escapeHtml(record.id)}">Draft Email</button>
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
    renderCommissions();
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
    elements.currentlyDoesTrivia.value = restaurant ? record.currentlyDoesTrivia : "";
    elements.website.value = restaurant ? record.website : "";
    elements.facebookPage.value = restaurant ? record.facebookPage : "";
    elements.contactFirstName.value = restaurant ? record.contactFirstName : "";
    elements.contactLastName.value = restaurant ? record.contactLastName : "";
    elements.contactEmail.value = restaurant ? record.contactEmail : "";
    elements.contactCell.value = restaurant ? record.contactCell : "";
    const secondContact = parseSecondContact(record.prospectNotes);
    elements.secondContactFirstName.value = restaurant ? secondContact.firstName : "";
    elements.secondContactLastName.value = restaurant ? secondContact.lastName : "";
    elements.secondContactEmail.value = restaurant ? secondContact.email : "";
    elements.secondContactCell.value = restaurant ? secondContact.cell : "";
    elements.secondContactRole.value = restaurant ? secondContact.role : "";
    elements.secondContactSection.hidden = !secondContactHasValue(secondContact);
    elements.addSecondContactButton.textContent = elements.secondContactSection.hidden ? "Add second contact" : "Hide second contact";
    elements.dateAdded.value = record.dateAdded || today();
    elements.lastContacted.value = restaurant ? record.lastContacted : "";
    elements.nextFollowUp.value = restaurant ? record.nextFollowUp : "";
    elements.notes.value = restaurant ? record.notes : "";
    elements.prospectStage.value = restaurant ? record.prospectStage : "";
    elements.prospectScore.value = record.prospectScore || "";
    elements.assignedTo.innerHTML = salesRepOptions(record.assignedTo || record.salesperson || DEFAULT_OWNER);
    elements.assignedTo.value = cleanSalesRep(record.assignedTo || record.salesperson || DEFAULT_OWNER);
    elements.leadSource.value = restaurant ? record.leadSource : "";
    elements.prospectNotes.value = restaurant ? stripSecondContact(record.prospectNotes) : "";
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
    elements.gameName.value = restaurant ? record.gameName : "";
    elements.monthlyAmount.value = restaurant ? record.monthlyAmount : "";
    elements.setupFee.value = restaurant ? record.setupFee : "";
    elements.paymentStatus.value = restaurant ? record.paymentStatus : "";
    elements.firstInvoiceDate.value = restaurant ? record.firstInvoiceDate : "";
    elements.paypalSubscriptionId.value = restaurant ? record.paypalSubscriptionId : "";
    elements.setupStatus.value = restaurant ? record.setupStatus : "";
    elements.salesNotes.value = restaurant ? record.salesNotes : "";
    updateSaleDetailsVisibility();
    elements.deleteRestaurantButton.hidden = !restaurant;
    elements.editorTitle.textContent = restaurant ? "Edit Restaurant" : "New Restaurant";
  }

  function updateSaleDetailsVisibility() {
    elements.saleDetailsSection.hidden = elements.status.value !== "customer";
  }

  function toggleSecondContactSection() {
    elements.secondContactSection.hidden = !elements.secondContactSection.hidden;
    elements.addSecondContactButton.textContent = elements.secondContactSection.hidden ? "Add second contact" : "Hide second contact";
    if (!elements.secondContactSection.hidden) {
      elements.secondContactFirstName.focus();
    }
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
      currentlyDoesTrivia: elements.currentlyDoesTrivia.value,
      website: elements.website.value,
      facebookPage: elements.facebookPage.value,
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
      assignedTo: cleanSalesRep(elements.assignedTo.value),
      prospectNotes: prospectNotesWithSecondContact(elements.prospectNotes.value, secondContactFromForm()),
      contactHistory: state.editingContactHistory,
      saleDate: elements.saleDate.value,
      serviceStartDate: elements.serviceStartDate.value,
      serviceEndDate: elements.serviceEndDate.value,
      packageName: elements.packageName.value,
      gameName: elements.gameName.value,
      monthlyAmount: elements.monthlyAmount.value,
      setupFee: elements.setupFee.value,
      paymentStatus: elements.paymentStatus.value,
      firstInvoiceDate: elements.firstInvoiceDate.value,
      paypalSubscriptionId: elements.paypalSubscriptionId.value,
      salesperson: cleanSalesRep(elements.assignedTo.value),
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
      secondContactSummary(restaurant),
    ].filter(Boolean).join(" / ") || "No contact details yet";
    const quickLinks = [
      restaurant.website
        ? `<a href="${escapeHtml(externalUrl(restaurant.website))}" target="_blank" rel="noopener" data-quick-contact-external-link>Website</a>`
        : "",
      restaurant.facebookPage
        ? `<a href="${escapeHtml(externalUrl(restaurant.facebookPage))}" target="_blank" rel="noopener" data-quick-contact-external-link>Facebook</a>`
        : "",
    ].filter(Boolean);
    elements.quickContactLinks.innerHTML = quickLinks.length ? quickLinks.join("") : "";
    elements.quickContactType.value = "C";
    elements.quickContactDate.value = today();
    elements.quickContactResponse.checked = false;
    elements.quickContactNextFollowUp.value = "";
    elements.quickContactScore.value = restaurant.prospectScore || "5";
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

  function clearRestaurantFollowUp() {
    elements.nextFollowUp.value = "";
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

  async function saveProspectFollowUp(id = "", nextFollowUp = "") {
    const restaurant = state.restaurants.find((record) => record.id === id);
    if (!restaurant) {
      return;
    }
    const updatedRestaurant = normalizeRestaurant({
      ...restaurant,
      nextFollowUp,
      updatedAt: new Date().toISOString(),
    });
    const data = await saveAction("saveRestaurant", { restaurant: updatedRestaurant }, "Updated follow-up");
    if (!data?.restaurant) {
      renderProspects();
      return;
    }
    const savedRecord = normalizeRestaurant(data.restaurant);
    const existingIndex = state.restaurants.findIndex((record) => record.id === savedRecord.id);
    if (existingIndex >= 0) {
      state.restaurants[existingIndex] = savedRecord;
    }
    cacheBackofficeData();
    render();
  }

  async function saveProspectScore(id = "", prospectScore = "") {
    const restaurant = state.restaurants.find((record) => record.id === id);
    if (!restaurant || !prospectScoreLabels[prospectScore]) {
      renderProspects();
      return;
    }
    const updatedRestaurant = normalizeRestaurant({
      ...restaurant,
      prospectScore,
      updatedAt: new Date().toISOString(),
    });
    const data = await saveAction("saveRestaurant", { restaurant: updatedRestaurant }, "Updated score");
    if (!data?.restaurant) {
      renderProspects();
      return;
    }
    const savedRecord = normalizeRestaurant(data.restaurant);
    const existingIndex = state.restaurants.findIndex((record) => record.id === savedRecord.id);
    if (existingIndex >= 0) {
      state.restaurants[existingIndex] = savedRecord;
    }
    cacheBackofficeData();
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
      paymentType: elements.collectionPaymentType.value,
      dueDate: elements.collectionDueDate.value,
      amount: elements.collectionAmount.value,
      status: elements.collectionStatus.value,
      paidDate: elements.collectionPaidDate.value,
      notes: collectionNotesWithPaymentType(elements.collectionNotes.value, elements.collectionPaymentType.value),
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
    elements.collectionPaymentType.value = "recurring";
    elements.collectionStatus.value = "not-sent";
    render();
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
      paymentType: editor.querySelector("[data-edit-collection-payment-type]")?.value,
      dueDate: editor.querySelector("[data-edit-collection-due-date]")?.value,
      amount: editor.querySelector("[data-edit-collection-amount]")?.value,
      status: editor.querySelector("[data-edit-collection-status]")?.value,
      paidDate: editor.querySelector("[data-edit-collection-paid-date]")?.value,
      notes: collectionNotesWithPaymentType(
        editor.querySelector("[data-edit-collection-notes]")?.value,
        editor.querySelector("[data-edit-collection-payment-type]")?.value
      ),
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
    render();
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
    render();
  }

  async function sendInvoiceEmail(id, { test = false } = {}) {
    const record = state.collections.find((collection) => collection.id === id);
    if (!record) {
      return;
    }
    if (!test) {
      const label = record.paymentType === "manual" ? `invoice ${record.invoiceNumber || ""}` : "subscription setup link";
      const confirmed = window.confirm(`Send ${label} to ${record.restaurantName || "this customer"} now?`);
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
    if (!test && record.paymentType !== "manual") {
      const restaurant = state.restaurants.find((item) => item.id === record.restaurantId);
      if (restaurant && !["subscription-active", "paid"].includes(restaurant.paymentStatus)) {
        const updatedRestaurant = normalizeRestaurant({
          ...restaurant,
          paymentStatus: "subscription-sent",
          firstInvoiceDate: restaurant.firstInvoiceDate || record.dueDate || today(),
          updatedAt: new Date().toISOString(),
        });
        const restaurantData = await saveAction("saveRestaurant", { restaurant: updatedRestaurant }, "Marked subscription sent");
        if (restaurantData?.restaurant) {
          const savedRestaurant = normalizeRestaurant(restaurantData.restaurant);
          state.restaurants = state.restaurants.map((item) =>
            item.id === savedRestaurant.id ? savedRestaurant : item
          );
          cacheBackofficeData();
          render();
        }
      }
    }
    const sentLabel = record.paymentType === "manual" ? "invoice" : "subscription setup";
    window.alert(test ? `Test ${sentLabel} sent to ${data.sentTo || "the test email"}.` : `${sentLabel[0].toUpperCase()}${sentLabel.slice(1)} sent to ${data.sentTo || "the customer"}.`);
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
    const paymentType = record.paymentType || paymentTypeFromNotes(record.notes);
    const isRecurring = paymentType !== "manual";
    return {
      restaurant,
      paymentType,
      isRecurring,
      paymentTypeLabel: paymentTypeLabel(paymentType),
      customerName: record.restaurantName || restaurant?.name || "Restaurant",
      contact: restaurant ? contactName(restaurant) : "",
      addressLines: invoiceCustomerAddressLines(restaurant),
      description: stripPaymentTypeNote(record.notes) || "Restaurant Challenge monthly subscription.",
      amount: moneyValue(record.amount),
      dueDate: shortDate(record.dueDate) || "Not set",
      status: labelFor(collectionStatusLabels, record.status, "Not Sent"),
    };
  }

  function recurringPaymentLink(record, restaurant = null) {
    const params = new URLSearchParams();
    const invoiceNumber = String(record?.invoiceNumber || "").trim();
    const restaurantName = String(record?.restaurantName || restaurant?.name || "").trim();
    if (invoiceNumber) {
      params.set("invoice", invoiceNumber);
    }
    if (restaurantName) {
      params.set("restaurant", restaurantName);
    }
    const query = params.toString();
    return query ? `${SUBSCRIPTION_LINK}?${query}` : SUBSCRIPTION_LINK;
  }

  function pdfText(value) {
    return String(value || "")
      .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");
  }

  function textBytes(text) {
    return new TextEncoder().encode(text);
  }

  function concatBytes(chunks) {
    const length = chunks.reduce((total, chunk) => total + chunk.length, 0);
    const bytes = new Uint8Array(length);
    let offset = 0;
    chunks.forEach((chunk) => {
      bytes.set(chunk, offset);
      offset += chunk.length;
    });
    return bytes;
  }

  async function loadPdfLogoBytes() {
    try {
      const response = await fetch(PDF_LOGO_PATH, { cache: "force-cache" });
      if (!response.ok) {
        return null;
      }
      return new Uint8Array(await response.arrayBuffer());
    } catch {
      return null;
    }
  }

  function buildPdfBytes({ stream, payY, linkUrl = PAYMENT_LINK, logoBytes = null } = {}) {
    const streamBytes = textBytes(stream);
    const resources = logoBytes
      ? "/Resources << /Font << /F1 4 0 R /F2 5 0 R >> /XObject << /Logo 8 0 R >> >>"
      : "/Resources << /Font << /F1 4 0 R /F2 5 0 R >> >>";
    const objects = [
      textBytes("<< /Type /Catalog /Pages 2 0 R >>"),
      textBytes("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"),
      textBytes(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] ${resources} /Annots [7 0 R] /Contents 6 0 R >>`),
      textBytes("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"),
      textBytes("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"),
      concatBytes([
        textBytes(`<< /Length ${streamBytes.length} >>\nstream\n`),
        streamBytes,
        textBytes("\nendstream"),
      ]),
      textBytes(`<< /Type /Annot /Subtype /Link /Rect [48 ${payY - 21} 390 ${payY - 9}] /Border [0 0 0] /A << /S /URI /URI (${pdfText(linkUrl)}) >> >>`),
    ];
    if (logoBytes) {
      objects.push(concatBytes([
        textBytes(`<< /Type /XObject /Subtype /Image /Width 1410 /Height 434 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logoBytes.length} >>\nstream\n`),
        logoBytes,
        textBytes("\nendstream"),
      ]));
    }

    const chunks = [textBytes("%PDF-1.4\n")];
    const offsets = [0];
    let byteLength = chunks[0].length;
    objects.forEach((object, index) => {
      offsets.push(byteLength);
      const chunk = concatBytes([
        textBytes(`${index + 1} 0 obj\n`),
        object,
        textBytes("\nendobj\n"),
      ]);
      chunks.push(chunk);
      byteLength += chunk.length;
    });
    const xrefOffset = byteLength;
    chunks.push(textBytes(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`));
    offsets.slice(1).forEach((offset) => {
      chunks.push(textBytes(`${String(offset).padStart(10, "0")} 00000 n \n`));
    });
    chunks.push(textBytes(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`));
    return concatBytes(chunks);
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

  async function buildInvoicePdf(record) {
    const details = invoiceDetails(record);
    const subscriptionLink = recurringPaymentLink(record, details.restaurant);
    const primaryLink = details.isRecurring ? subscriptionLink : PAYMENT_LINK;
    const lines = [];
    const addText = (text, x, y, size = 11, bold = false) => {
      lines.push(`BT /${bold ? "F2" : "F1"} ${size} Tf ${x} ${y} Td (${pdfText(text)}) Tj ET`);
    };
    const logoBytes = await loadPdfLogoBytes();
    if (logoBytes) {
      lines.push(`q ${PDF_LOGO_WIDTH} 0 0 ${PDF_LOGO_HEIGHT} 48 706 cm /Logo Do Q`);
    } else {
      addText("COMMUNITYVERSE GAMES", 48, 742, 11, true);
    }

    addText("Invoice", 48, 664, 28, true);
    addText(record.invoiceNumber || "Invoice", 510, 742, 12, true);
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
    addText("Total Due", 48, descriptionY - 28, 12, true);
    addText(details.amount, 500, descriptionY - 28, 12, true);

    const payY = descriptionY - 76;
    addText(details.isRecurring ? "Set up recurring monthly payment" : "Pay online", 48, payY, 11, true);
    addText(primaryLink, 48, payY - 16, 10);
    const statusY = payY - 54;
    addText(`Payment type: ${details.paymentTypeLabel}`, 48, statusY, 11, true);
    addText(`Status: ${details.status}`, 48, statusY - 18, 11, true);

    const stream = lines.join("\n");
    return {
      blob: new Blob([buildPdfBytes({ stream, payY, linkUrl: primaryLink, logoBytes })], { type: "application/pdf" }),
      filename: `${invoicePrintTitle(record, details.customerName)}.pdf`,
    };
  }

  function openInvoicePreview(id) {
    const record = state.collections.find((collection) => collection.id === id);
    if (!record) {
      return;
    }
    const details = invoiceDetails(record);
    const subscriptionLink = recurringPaymentLink(record, details.restaurant);
    const primaryLink = details.isRecurring ? subscriptionLink : PAYMENT_LINK;
    const primaryText = details.isRecurring ? "Set Up Monthly Subscription" : "Pay this invoice with PayPal";
    state.invoicePreviewId = id;
    elements.invoicePreviewContent.innerHTML = `
      <article class="invoice-document">
        <header class="invoice-header">
          <div>
            <img class="invoice-logo" src="${LOGO_PATH}" alt="CommunityVerse Games" />
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
            <strong>${escapeHtml(INVOICE_SENDER.business)}</strong>
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
          <p class="invoice-label">${details.isRecurring ? "Monthly Subscription" : "Pay Online"}</p>
          <a href="${escapeHtml(primaryLink)}" target="_blank" rel="noopener">${escapeHtml(primaryText)}</a>
          ${details.isRecurring
            ? '<span>Renews automatically each month from the signup date unless canceled.</span>'
            : `<a href="${escapeHtml(subscriptionLink)}" target="_blank" rel="noopener">Set up recurring monthly payment instead</a>`}
        </section>
        <p class="invoice-status">Payment type: ${escapeHtml(details.paymentTypeLabel)}</p>
        <p class="invoice-status">Status: ${escapeHtml(details.status)}</p>
      </article>
    `;
    elements.invoicePreviewDialog.showModal();
  }

  function closeInvoicePreview() {
    state.invoicePreviewId = "";
    elements.invoicePreviewDialog.close();
  }

  async function saveInvoicePdf() {
    const record = state.collections.find((collection) => collection.id === state.invoicePreviewId);
    if (!record) {
      return;
    }
    const pdf = await buildInvoicePdf(record);
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
    const greetingName = restaurant?.contactFirstName || contactName(restaurant) || customerName;
    const invoiceNumber = record.invoiceNumber || "your invoice";
    const subscriptionLink = recurringPaymentLink(record, restaurant);
    const details = invoiceDetails(record);
    const gameName = invoiceGameName(record, restaurant, customerName);
    const month = invoiceMonthFromDate(record.dueDate) || "this month";
    const subject = details.isRecurring
      ? `Set up your Restaurant Challenge monthly subscription`
      : `Invoice ${invoiceNumber} from CommunityVerse Games`;
    const body = details.isRecurring
      ? [
          `Hi ${greetingName},`,
          "",
          `Here is the setup link for your ${gameName} monthly subscription. Thank you for allowing us to promote your restaurant through your trivia game.`,
          "",
          `The monthly amount is ${details.amount}. Your subscription starts when you sign up and renews automatically each month on that same day unless canceled.`,
          "",
          "Please use this PayPal subscription link:",
          subscriptionLink,
          "",
          "A PDF is attached for your records.",
          "",
          "Best Wishes,",
          "Tim Collins - Game Developer",
          INVOICE_SENDER.business,
        ].join("\n")
      : [
          `Hi ${greetingName},`,
          "",
          `Here is your invoice for ${month} for ${gameName}. Thank you for allowing us to promote your restaurant through your trivia game.`,
          "",
          "You can mail a check or pay online with a credit card through PayPal, using this PayPal link:",
          PAYMENT_LINK,
          "",
          "If you would rather set up automatic monthly payments, use this subscription link:",
          subscriptionLink,
          "",
          "A PDF of this invoice is attached for your records.",
          "",
          "Best Wishes,",
          "Tim Collins - Game Developer",
          INVOICE_SENDER.business,
        ].join("\n");
    const draftUrl = mailtoUrl(email, subject, body);
    if (draftUrl.length > MAILTO_FULL_DRAFT_LIMIT) {
      copyTextToClipboard(body);
      window.location.href = mailtoUrl(email, subject);
      window.setTimeout(() => {
        window.alert("The email message was long, so Back Office copied it. If your email opens without the message body, paste it into the email before sending.");
      }, 800);
      return;
    }
    window.location.href = draftUrl;
  }

  function salesEmailValue(value = "", restaurant = {}) {
    const contact = restaurant.contactFirstName || contactName(restaurant) || "there";
    const replacements = {
      restaurant: restaurant.name || "your restaurant",
      contact,
      city: restaurant.city || "",
      website: restaurant.website || "",
    };
    return String(value || "").replace(/\{(restaurant|contact|city|website)\}/gi, (_, key) => replacements[key.toLowerCase()] || "");
  }

  function mailtoUrl(email = "", subject = "", body = "") {
    const cleanEmail = String(email || "").trim().replace(/\s+/g, "");
    const bodyPart = body ? `&body=${encodeURIComponent(body)}` : "";
    return `mailto:${cleanEmail}?subject=${encodeURIComponent(subject)}${bodyPart}`;
  }

  function salesEmailDraftForRestaurant(restaurant = {}) {
    const template = loadSalesEmail1Template();
    return {
      email: restaurant.contactEmail || "",
      subject: salesEmailValue(template.subject, restaurant),
      body: salesEmailValue(template.body, restaurant),
    };
  }

  function salesEmailDraftUrlForRestaurant(restaurant = {}) {
    const draft = salesEmailDraftForRestaurant(restaurant);
    return mailtoUrl(draft.email, draft.subject, draft.body);
  }

  function copyTextToClipboard(text = "") {
    if (!navigator.clipboard || !text) {
      return false;
    }
    navigator.clipboard.writeText(text).catch(() => {});
    return true;
  }

  function copyEmailBody() {
    const body = elements.salesEmailBody.value.trim();
    if (!body) {
      window.alert("There is no email message to copy yet.");
      return;
    }
    if (copyTextToClipboard(body)) {
      window.alert("Copied the email message. You can paste it into Mail if needed.");
      return;
    }
    elements.salesEmailBody.focus();
    elements.salesEmailBody.select();
    window.alert("The message is selected. Press Command-C to copy it.");
  }

  function salesEmailDraftUrl() {
    const email = elements.salesEmailTo.value.trim();
    const subject = elements.salesEmailSubject.value.trim();
    const body = elements.salesEmailBody.value.trim();
    if (!email || !subject || !body) {
      return "";
    }
    const fullDraftUrl = mailtoUrl(email, subject, body);
    if (fullDraftUrl.length > MAILTO_FULL_DRAFT_LIMIT) {
      return mailtoUrl(email, subject);
    }
    return fullDraftUrl;
  }

  function updateSalesEmailDraftLink() {
    const draftUrl = salesEmailDraftUrl();
    elements.openSalesEmailDraftLink.href = draftUrl || "mailto:";
    elements.openSalesEmailDraftLink.setAttribute("aria-disabled", draftUrl ? "false" : "true");
  }

  function openSalesEmailDraft(event) {
    const email = elements.salesEmailTo.value.trim();
    const subject = elements.salesEmailSubject.value.trim();
    const body = elements.salesEmailBody.value.trim();
    updateSalesEmailDraftLink();
    if (!email || !subject || !body) {
      event.preventDefault();
      window.alert("Add an email address, subject, and message before opening the email.");
      return;
    }
    const fullDraftUrl = mailtoUrl(email, subject, body);
    if (fullDraftUrl.length > MAILTO_FULL_DRAFT_LIMIT) {
      copyTextToClipboard(body);
      window.setTimeout(() => {
        window.alert("That email was long, so Back Office copied the message text. If the email opens without the message, paste it into the email body.");
      }, 800);
    }
  }

  async function logDirectSalesEmailOne(id = "") {
    const restaurant = state.restaurants.find((record) => record.id === id);
    if (!restaurant) {
      return;
    }
    const contact = normalizeContactHistory([{
      id: makeContactId(),
      type: "E",
      date: today(),
      response: false,
      note: "Email 1",
    }])[0];
    const updatedRestaurant = normalizeRestaurant({
      ...restaurant,
      contactHistory: contact ? [contact, ...(restaurant.contactHistory || [])] : restaurant.contactHistory,
      lastContacted: today(),
      prospectStage: ["", "new-lead"].includes(restaurant.prospectStage) ? "contacted" : restaurant.prospectStage,
      updatedAt: new Date().toISOString(),
    });
    const data = await saveAction("saveRestaurant", { restaurant: updatedRestaurant }, "Logged Email 1");
    if (!data?.restaurant) {
      return;
    }
    const savedRecord = normalizeRestaurant(data.restaurant);
    const existingIndex = state.restaurants.findIndex((record) => record.id === savedRecord.id);
    if (existingIndex >= 0) {
      state.restaurants[existingIndex] = savedRecord;
    }
    cacheBackofficeData();
    render();
  }

  function openSalesEmailDialog(id) {
    const restaurant = state.restaurants.find((record) => record.id === id);
    if (!restaurant) {
      return;
    }
    if (!restaurant.contactEmail) {
      window.alert("This prospect does not have an email address saved yet.");
      return;
    }
    const template = loadSalesEmail1Template();
    state.salesEmailTargetId = restaurant.id;
    elements.salesEmailRestaurantId.value = restaurant.id;
    elements.salesEmailTitle.textContent = `Send Email 1 to ${restaurant.name}`;
    elements.salesEmailHelper.textContent = "Edit this draft if needed. Open the email first, then press Log Email 1 after the draft opens.";
    elements.salesEmailTo.value = restaurant.contactEmail;
    elements.salesEmailSubject.value = salesEmailValue(template.subject, restaurant);
    elements.salesEmailBody.value = salesEmailValue(template.body, restaurant);
    updateSalesEmailDraftLink();
    elements.salesEmailDialog.showModal();
    elements.salesEmailBody.focus();
  }

  function closeSalesEmailDialog() {
    state.salesEmailTargetId = "";
    elements.salesEmailDialog.close();
  }

  async function logSalesEmailOne(event) {
    event.preventDefault();
    const id = elements.salesEmailRestaurantId.value || state.salesEmailTargetId;
    const restaurant = state.restaurants.find((record) => record.id === id);
    if (!restaurant) {
      closeSalesEmailDialog();
      return;
    }
    const email = elements.salesEmailTo.value.trim();
    const subject = elements.salesEmailSubject.value.trim();
    const body = elements.salesEmailBody.value.trim();
    if (!email || !subject || !body) {
      window.alert("Add an email address, subject, and message before sending.");
      return;
    }
    const contact = normalizeContactHistory([{
      id: makeContactId(),
      type: "E",
      date: today(),
      response: false,
      note: "Email 1",
    }])[0];
    const updatedRestaurant = normalizeRestaurant({
      ...restaurant,
      contactEmail: email,
      contactHistory: contact ? [contact, ...(restaurant.contactHistory || [])] : restaurant.contactHistory,
      lastContacted: today(),
      prospectStage: ["", "new-lead"].includes(restaurant.prospectStage) ? "contacted" : restaurant.prospectStage,
      updatedAt: new Date().toISOString(),
    });
    const data = await saveAction("saveRestaurant", { restaurant: updatedRestaurant }, "Logged Sales Email 1");
    if (!data?.restaurant) {
      return;
    }
    const savedRecord = normalizeRestaurant(data.restaurant);
    const existingIndex = state.restaurants.findIndex((record) => record.id === savedRecord.id);
    if (existingIndex >= 0) {
      state.restaurants[existingIndex] = savedRecord;
    }
    cacheBackofficeData();
    render();
    closeSalesEmailDialog();
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

  function normalizedImportKey(value = "") {
    return String(value || "")
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function compactImportName(value = "") {
    return normalizedImportKey(value).replace(/\b(the|restaurant|bar|grill|and)\b/g, "").replace(/\s+/g, " ").trim();
  }

  function compactNameMatches(left = "", right = "") {
    const leftCompact = compactImportName(left);
    const rightCompact = compactImportName(right);
    if (!leftCompact || !rightCompact) {
      return false;
    }
    if (leftCompact === rightCompact) {
      return true;
    }
    const shorter = leftCompact.length <= rightCompact.length ? leftCompact : rightCompact;
    const longer = leftCompact.length > rightCompact.length ? leftCompact : rightCompact;
    return shorter.length >= 8 && longer.startsWith(`${shorter} `);
  }

  function normalizedPhone(value = "") {
    return String(value || "").replace(/\D/g, "");
  }

  function normalizedUrl(value = "") {
    return String(value || "")
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/+$/, "")
      .trim();
  }

  function nameMatchReasons(left = "", right = "", city = "") {
    const leftKey = normalizedImportKey(left);
    const rightKey = normalizedImportKey(right);
    if (!leftKey || !rightKey) {
      return [];
    }
    if (leftKey === rightKey) {
      return ["Restaurant name"];
    }
    const cityKey = normalizedImportKey(city);
    if (cityKey) {
      if (rightKey === `${leftKey} ${cityKey}` || leftKey === `${rightKey} ${cityKey}`) {
        return ["Restaurant name", "City"];
      }
      if ((rightKey.startsWith(`${leftKey} `) || leftKey.startsWith(`${rightKey} `)) && rightKey.includes(cityKey)) {
        return ["Restaurant name", "City"];
      }
    }
    return compactNameMatches(leftKey, rightKey) ? ["Similar restaurant name"] : [];
  }

  function matchReasons(imported, restaurant) {
    const importedCityKey = normalizedImportKey(imported.city);
    const existingCityKey = normalizedImportKey(restaurant.city);
    const citiesConflict = importedCityKey && existingCityKey && importedCityKey !== existingCityKey;
    let reasons = nameMatchReasons(imported.name, restaurant.name, imported.city);
    if (citiesConflict) {
      reasons = reasons.filter((reason) => !["Restaurant name", "Similar restaurant name", "City"].includes(reason));
    }
    const importedPhone = normalizedPhone(imported.phone || imported.contactCell);
    const existingPhone = normalizedPhone(restaurant.phone || restaurant.contactCell);
    if (importedPhone && existingPhone && importedPhone === existingPhone) {
      reasons.push("Phone number");
    }
    if (imported.contactEmail && restaurant.contactEmail && imported.contactEmail.toLowerCase() === restaurant.contactEmail.toLowerCase()) {
      reasons.push("Email");
    }
    if (normalizedUrl(imported.website) && normalizedUrl(imported.website) === normalizedUrl(restaurant.website)) {
      reasons.push("Website");
    }
    if (normalizedUrl(imported.facebookPage) && normalizedUrl(imported.facebookPage) === normalizedUrl(restaurant.facebookPage)) {
      reasons.push("Facebook page");
    }
    if (reasons.length && importedCityKey && importedCityKey === existingCityKey) {
      if (!reasons.includes("City")) {
        reasons.push("City");
      }
    }
    return [...new Set(reasons)];
  }

  function fieldIsBlank(value = "") {
    return !String(value || "").trim();
  }

  function columnKey(value = "") {
    return normalizedImportKey(value).replace(/\s+/g, "");
  }

  function columnValue(row = {}, labels = []) {
    for (const label of labels) {
      const value = row[label];
      if (value != null && String(value).trim()) {
        return String(value).trim();
      }
    }
    return "";
  }

  function importTriviaValue(value = "") {
    const text = normalizedImportKey(value);
    if (["yes", "y", "true", "currently yes"].includes(text)) return "yes";
    if (["no", "n", "false", "none"].includes(text)) return "no";
    if (["possible", "maybe", "unknown maybe"].includes(text)) return "possible";
    return "";
  }

  function appendUniqueNote(existing = "", addition = "") {
    const current = String(existing || "").trim();
    const next = String(addition || "").trim();
    if (!next || current.toLowerCase().includes(next.toLowerCase())) {
      return current;
    }
    return [current, next].filter(Boolean).join("\n\n");
  }

  function rowsToObjects(rows = []) {
    const headerRow = rows.find((row) => row.some((value) => String(value || "").trim())) || [];
    const headers = headerRow.map(columnKey);
    return rows.slice(rows.indexOf(headerRow) + 1).map((row) => {
      const record = {};
      headers.forEach((header, index) => {
        if (header) {
          record[header] = String(row[index] || "").trim();
        }
      });
      return record;
    });
  }

  function importedRestaurantFromRow(row = {}, fileName = "") {
    const name = columnValue(row, ["restaurant", "restaurantname", "business", "businessname", "name"]);
    if (!name) {
      return null;
    }
    const triviaText = columnValue(row, ["trivia", "trivia?", "currentlydoestrivia", "doestrivia"]);
    const notes = [
      columnValue(row, ["notes", "note", "details"]),
    ].filter(Boolean).join("\n");

    return normalizeRestaurant({
      name,
      status: "prospect",
      street: columnValue(row, ["street", "streetaddress", "address"]),
      city: columnValue(row, ["city"]),
      state: columnValue(row, ["state"]),
      zip: columnValue(row, ["zip", "zipcode", "postalcode"]),
      phone: columnValue(row, ["phone", "restaurantphone", "contactphone"]),
      contactFirstName: columnValue(row, ["contactfirstname", "firstname"]),
      contactLastName: columnValue(row, ["contactlastname", "lastname"]),
      contactEmail: columnValue(row, ["email", "emailaddress", "contactemail"]),
      contactCell: columnValue(row, ["cell", "contactcell", "mobile"]),
      currentlyDoesTrivia: importTriviaValue(triviaText),
      website: columnValue(row, ["website", "web", "url"]),
      facebookPage: columnValue(row, ["facebook", "facebookpage", "fb", "fbpage"]),
      notes,
      prospectStage: "new-lead",
      prospectScore: "4",
      leadSource: "Prospect import",
      assignedTo: DEFAULT_OWNER,
    });
  }

  function matchingRestaurant(imported) {
    const cityKey = normalizedImportKey(imported.city);
    const matches = state.restaurants
      .map((restaurant) => ({ restaurant, reasons: matchReasons(imported, restaurant) }))
      .filter((match) => match.reasons.length);
    if (matches.length <= 1 || !cityKey) {
      return matches[0] || null;
    }
    return matches.find((match) => normalizedImportKey(match.restaurant.city) === cityKey) || matches[0] || null;
  }

  function mergeImportedRestaurant(existing, imported) {
    if (!existing) {
      return { record: imported, changes: ["Add new prospect"] };
    }
    const updates = { ...existing };
    const changes = [];
    [
      ["street", "street address"],
      ["city", "city"],
      ["state", "state"],
      ["zip", "ZIP"],
      ["phone", "restaurant phone"],
      ["contactFirstName", "contact first name"],
      ["contactLastName", "contact last name"],
      ["contactEmail", "contact email"],
      ["contactCell", "contact cell"],
      ["currentlyDoesTrivia", "trivia"],
      ["website", "website"],
      ["facebookPage", "Facebook page"],
      ["leadSource", "lead source"],
    ].forEach(([key, label]) => {
      if (fieldIsBlank(updates[key]) && !fieldIsBlank(imported[key])) {
        updates[key] = imported[key];
        changes.push(`Fill ${label}`);
      }
    });
    const mergedNotes = appendUniqueNote(updates.notes, imported.notes);
    if (mergedNotes !== updates.notes) {
      updates.notes = mergedNotes;
      changes.push("Add notes");
    }
    const mergedProspectNotes = appendUniqueNote(updates.prospectNotes, imported.prospectNotes || imported.notes);
    if (mergedProspectNotes !== updates.prospectNotes) {
      updates.prospectNotes = mergedProspectNotes;
      changes.push("Add prospect notes");
    }
    return { record: normalizeRestaurant(updates), changes };
  }

  function mergeResearchRestaurant(existing, imported) {
    if (!existing) {
      return { record: imported, changes: ["Add new prospect"] };
    }
    const updates = { ...existing };
    const changes = [];
    [
      ["street", "street address"],
      ["city", "city"],
      ["state", "state"],
      ["zip", "ZIP"],
      ["phone", "restaurant phone"],
      ["contactFirstName", "contact first name"],
      ["currentlyDoesTrivia", "trivia"],
      ["website", "website"],
      ["facebookPage", "Facebook page"],
      ["contactEmail", "contact email"],
    ].forEach(([key, label]) => {
      const incoming = String(imported[key] || "").trim();
      const current = String(updates[key] || "").trim();
      if (incoming && incoming !== current) {
        updates[key] = incoming;
        changes.push(`${current ? "Update" : "Fill"} ${label}`);
      }
    });
    const mergedNotes = appendUniqueNote(updates.notes, imported.notes);
    if (mergedNotes !== updates.notes) {
      updates.notes = mergedNotes;
      changes.push("Add notes");
    }
    const mergedProspectNotes = appendUniqueNote(updates.prospectNotes, imported.prospectNotes || imported.notes);
    if (mergedProspectNotes !== updates.prospectNotes) {
      updates.prospectNotes = mergedProspectNotes;
      changes.push("Add prospect notes");
    }
    return { record: normalizeRestaurant(updates), changes };
  }

  function prospectResearchPreviewItem(imported, preferredExisting = null, matchReasons = ["Research"]) {
    const match = preferredExisting ? { restaurant: preferredExisting, reasons: matchReasons } : matchingRestaurant(imported);
    const existing = match?.restaurant || null;
    if (existing?.status === "permanently-closed") {
      return {
        imported,
        existing,
        matchReasons: match?.reasons || [],
        record: existing,
        changes: ["Permanently closed - do not add"],
        action: "Skip",
        selected: false,
      };
    }
    const merged = mergeResearchRestaurant(existing, imported);
    return {
      imported,
      existing,
      matchReasons: match?.reasons || [],
      record: merged.record,
      changes: merged.changes,
      action: existing ? (merged.changes.length ? "Update" : "Skip") : "New",
      selected: !existing || merged.changes.length > 0,
    };
  }

  function restaurantResearchQueries(record = {}) {
    const name = String(record.name || "").trim();
    const location = [record.street, record.city, record.state].filter(Boolean).join(" ");
    const base = [name, location].filter(Boolean).join(" ");
    return [
      ["Google", `${base} official website phone address trivia night`],
    ].filter(([, query]) => query.trim());
  }

  function googleSearchUrl(query = "") {
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }

  function openRestaurantResearch(index) {
    const item = state.pendingProspectImport[index];
    if (!item) {
      return;
    }
    openResearchNotesDialog({ type: "import", index, record: item.imported });
    openResearchQueries(item.imported);
  }

  function openSavedRestaurantResearch(id = "") {
    const restaurant = state.restaurants.find((record) => record.id === id);
    if (!restaurant) {
      return;
    }
    openResearchNotesDialog({ type: "saved", id, record: restaurant });
    openResearchQueries(restaurant);
  }

  function openResearchNotesDialog(target) {
    state.researchTarget = target;
    elements.researchNotesTitle.textContent = `Research ${target.record.name || "restaurant"}`;
    elements.researchNotesHelper.textContent = "Paste useful details you found. Back Office will preview field updates before anything is saved.";
    elements.researchNotesText.value = "";
    elements.researchNotesDialog.showModal();
  }

  function closeResearchNotesDialog() {
    state.researchTarget = null;
    elements.researchNotesDialog.close();
  }

  function openResearchQueries(record = {}) {
    const queries = restaurantResearchQueries(record);
    let openedCount = 0;
    queries.forEach(([, query]) => {
      const opened = window.open(googleSearchUrl(query), "_blank");
      if (opened) {
        opened.opener = null;
        openedCount += 1;
      }
    });
    setSyncStatus(openedCount ? `Opened Google search for ${record.name}` : "Research search was blocked by the browser");
    if (!openedCount) {
      window.alert("The browser blocked the research search. Allow popups for this site, then click Research again.");
    }
  }

  function previewResearchNotes(event) {
    event.preventDefault();
    const target = state.researchTarget;
    const text = elements.researchNotesText.value.trim();
    if (!target || !text) {
      window.alert("Paste the useful research text before previewing.");
      return;
    }
    const updated = researchNotesFromText(target.record, text);
    closeResearchNotesDialog();
    if (target.type === "import") {
      const currentItem = state.pendingProspectImport[target.index] || null;
      state.pendingProspectImport[target.index] = prospectResearchPreviewItem(
        updated,
        currentItem?.existing || null,
        currentItem?.matchReasons?.length ? currentItem.matchReasons : ["Research"]
      );
      renderProspectImportPreview();
      if (!elements.prospectImportDialog.open) {
        elements.prospectImportDialog.showModal();
      }
      setSyncStatus(`Research preview updated for ${updated.name}`);
      return;
    }
    state.pendingProspectImport = [prospectResearchPreviewItem(updated, target.record)];
    renderProspectImportPreview();
    elements.prospectImportDialog.showModal();
    setSyncStatus("Research update preview ready");
  }

  function prospectImportRow(item) {
    const actionClass = item.action === "New" ? "new" : item.action === "Skip" ? "skip" : "update";
    const disabled = item.action === "Skip" ? " disabled" : "";
    const checked = item.selected && item.action !== "Skip" ? " checked" : "";
    const importIndex = state.pendingProspectImport.indexOf(item);
    const matchReasonsHtml = item.existing
      ? `
        <div class="match-reasons">
          <strong>Matched by:</strong>
          ${item.matchReasons.map((reason) => `<span>✓ ${escapeHtml(reason)}</span>`).join("")}
          <em>${escapeHtml(item.existing.name)}</em>
        </div>
      `
      : "";
    return `
      <tr>
        <td>
          <input class="import-row-check" type="checkbox" data-import-index="${importIndex}"${checked}${disabled} />
        </td>
        <td><span class="import-tag import-tag-${actionClass}">${escapeHtml(item.action)}</span></td>
        <td><strong>${escapeHtml(item.imported.name)}</strong>${matchReasonsHtml}</td>
        <td>${escapeHtml(item.imported.city)}</td>
        <td>${escapeHtml(labelFor({ yes: "Yes", no: "No", possible: "Possible" }, item.imported.currentlyDoesTrivia, "Unknown"))}</td>
        <td>${escapeHtml(item.imported.notes)}</td>
        <td><button class="text-button" type="button" data-research-import-index="${importIndex}">Research</button></td>
        <td>${escapeHtml(item.changes.join(", ") || "No new information")}</td>
      </tr>
    `;
  }

  function renderProspectImportPreview() {
    const records = state.pendingProspectImport;
    const newCount = records.filter((record) => record.action === "New").length;
    const updateCount = records.filter((record) => record.action === "Update").length;
    const skipCount = records.filter((record) => record.action === "Skip").length;
    const selectedCount = records.filter((record) => record.selected && record.action !== "Skip").length;
    elements.prospectImportSummary.textContent = `${newCount} new, ${updateCount} update existing, ${skipCount} no-change duplicates. ${selectedCount} selected to import.`;
    elements.prospectImportList.innerHTML = records.length
      ? records.map(prospectImportRow).join("")
      : '<tr><td colspan="8"><div class="empty-state">No importable restaurants were found.</div></td></tr>';
    elements.applyProspectImportButton.disabled = !records.some((record) => record.selected && record.action !== "Skip");
  }

  function toggleImportRow(index, selected) {
    const item = state.pendingProspectImport[index];
    if (!item || item.action === "Skip") {
      return;
    }
    item.selected = selected;
    renderProspectImportPreview();
  }

  function closeProspectImport() {
    elements.prospectImportDialog.close();
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const result = String(reader.result || "");
        resolve(result.includes(",") ? result.split(",").pop() : result);
      });
      reader.addEventListener("error", () => reject(new Error("That file could not be read.")));
      reader.readAsDataURL(file);
    });
  }

  async function importProspectFile(file) {
    if (!file) {
      return;
    }
    setLoading(true);
    setSyncStatus("Reading prospect file...");
    try {
      const contentBase64 = await fileToBase64(file);
      const data = await apiRequest("parseProspectFile", {
        file: { fileName: file.name, contentBase64 },
      });
      const importedRows = rowsToObjects(data.rows || [])
        .map((row) => importedRestaurantFromRow(row, file.name))
        .filter(Boolean);
      previewImportedProspects(importedRows, "Prospect file preview ready");
    } catch (error) {
      setSyncStatus("Import preview failed");
      window.alert(error instanceof Error ? error.message : "That prospect file could not be previewed.");
    } finally {
      setLoading(false);
    }
  }

  async function applyProspectImport() {
    const records = state.pendingProspectImport.filter((record) => record.selected && record.action !== "Skip");
    if (!records.length) {
      closeProspectImport();
      return;
    }
    setLoading(true);
    setSyncStatus("Importing prospects...");
    try {
      for (const item of records) {
        const data = await apiRequest("saveRestaurant", { restaurant: item.record });
        const savedRecord = normalizeRestaurant(data.restaurant || item.record);
        const existingIndex = state.restaurants.findIndex((restaurant) => restaurant.id === savedRecord.id);
        if (existingIndex >= 0) {
          state.restaurants[existingIndex] = savedRecord;
        } else {
          state.restaurants.push(savedRecord);
        }
      }
      cacheBackofficeData();
      render();
      closeProspectImport();
      setSyncStatus("Imported prospects to Supabase");
      window.alert(`Imported ${records.length} prospect ${records.length === 1 ? "record" : "records"}.`);
    } catch (error) {
      setSyncStatus("Import failed");
      window.alert(error instanceof Error ? error.message : "Those prospects could not be imported.");
    } finally {
      setLoading(false);
    }
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
  elements.importProspectsButton.addEventListener("click", () => elements.prospectImportFile.click());
  elements.closeEditorButton.addEventListener("click", closeRestaurantEditor);
  elements.cancelEditorButton.addEventListener("click", closeRestaurantEditor);
  elements.closeProspectImportButton.addEventListener("click", closeProspectImport);
  elements.cancelProspectImportButton.addEventListener("click", closeProspectImport);
  elements.applyProspectImportButton.addEventListener("click", applyProspectImport);
  elements.closeQuickContactButton.addEventListener("click", closeQuickContact);
  elements.cancelQuickContactButton.addEventListener("click", closeQuickContact);
  elements.closeResearchNotesButton.addEventListener("click", closeResearchNotesDialog);
  elements.cancelResearchNotesButton.addEventListener("click", closeResearchNotesDialog);
  elements.closeSalesEmailButton.addEventListener("click", closeSalesEmailDialog);
  elements.cancelSalesEmailButton.addEventListener("click", closeSalesEmailDialog);
  elements.openResearchSearchesButton.addEventListener("click", () => {
    if (state.researchTarget?.record) {
      openResearchQueries(state.researchTarget.record);
    }
  });
  elements.quickContactClearFollowUp.addEventListener("click", clearQuickContactFollowUp);
  elements.clearNextFollowUp.addEventListener("click", clearRestaurantFollowUp);
  elements.quickContactFullCardButton.addEventListener("click", openFullCardFromQuickContact);
  elements.deleteRestaurantButton.addEventListener("click", deleteCurrentRestaurant);
  elements.addContactHistoryButton.addEventListener("click", addContactHistory);
  elements.addSecondContactButton.addEventListener("click", toggleSecondContactSection);
  elements.form.addEventListener("submit", saveRestaurant);
  elements.researchNotesForm.addEventListener("submit", previewResearchNotes);
  elements.copySalesEmailBodyButton.addEventListener("click", copyEmailBody);
  elements.openSalesEmailDraftLink.addEventListener("click", openSalesEmailDraft);
  elements.salesEmailTo.addEventListener("input", updateSalesEmailDraftLink);
  elements.salesEmailSubject.addEventListener("input", updateSalesEmailDraftLink);
  elements.salesEmailBody.addEventListener("input", updateSalesEmailDraftLink);
  elements.salesEmailForm.addEventListener("submit", logSalesEmailOne);
  elements.salesEmailTemplateForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveSalesEmail1Template({
      subject: elements.salesEmail1Subject.value.trim() || DEFAULT_SALES_EMAIL_1.subject,
      body: elements.salesEmail1Body.value.trim() || DEFAULT_SALES_EMAIL_1.body,
    });
    renderProspects();
    elements.salesEmailTemplateStatus.textContent = "Saved";
    window.setTimeout(() => {
      elements.salesEmailTemplateStatus.textContent = "";
    }, 1800);
  });
  elements.resetSalesEmail1Button.addEventListener("click", () => {
    fillSalesEmailTemplateForm(DEFAULT_SALES_EMAIL_1);
    saveSalesEmail1Template(DEFAULT_SALES_EMAIL_1);
    renderProspects();
    elements.salesEmailTemplateStatus.textContent = "Reset";
    window.setTimeout(() => {
      elements.salesEmailTemplateStatus.textContent = "";
    }, 1800);
  });
  elements.doyceEmailTemplateForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const template = normalizeEmailTemplate({
      subject: elements.doyceEmailSubject.value.trim(),
      body: elements.doyceEmailBody.value.trim(),
    }, DEFAULT_DOYCE_EMAIL_TEMPLATE);
    try {
      const data = await saveAction("saveDoyceEmailTemplate", { template }, "Saved Doyce email template");
      state.doyceEmailTemplate = normalizeEmailTemplate(data?.doyceEmailTemplate, template);
      fillDoyceEmailTemplateForm();
      elements.doyceEmailTemplateStatus.textContent = "Saved";
    } catch (error) {
      elements.doyceEmailTemplateStatus.textContent = error instanceof Error ? error.message : "Could not save";
    }
    window.setTimeout(() => {
      elements.doyceEmailTemplateStatus.textContent = "";
    }, 2200);
  });
  elements.resetDoyceEmailButton.addEventListener("click", async () => {
    fillDoyceEmailTemplateForm(DEFAULT_DOYCE_EMAIL_TEMPLATE);
    try {
      const data = await saveAction("saveDoyceEmailTemplate", { template: DEFAULT_DOYCE_EMAIL_TEMPLATE }, "Reset Doyce email template");
      state.doyceEmailTemplate = normalizeEmailTemplate(data?.doyceEmailTemplate, DEFAULT_DOYCE_EMAIL_TEMPLATE);
      fillDoyceEmailTemplateForm();
      elements.doyceEmailTemplateStatus.textContent = "Reset";
    } catch (error) {
      elements.doyceEmailTemplateStatus.textContent = error instanceof Error ? error.message : "Could not reset";
    }
    window.setTimeout(() => {
      elements.doyceEmailTemplateStatus.textContent = "";
    }, 2200);
  });
  elements.status.addEventListener("change", updateSaleDetailsVisibility);
  elements.quickContactForm.addEventListener("submit", saveQuickContact);
  elements.collectionForm.addEventListener("submit", addCollection);
  elements.collectionRestaurant.addEventListener("change", fillNextInvoiceNumber);
  elements.collectionRestaurant.addEventListener("change", updateInvoiceTemplateAmount);
  elements.collectionPaymentType.addEventListener("change", updateInvoiceTemplateAmount);
  elements.invoiceTemplateMonth.addEventListener("change", updateInvoiceTemplateAmount);
  elements.invoiceTemplateType.addEventListener("change", updateInvoiceTemplateAmount);
  elements.fillMonthlyInvoiceButton.addEventListener("click", fillMonthlyInvoiceTemplate);
  elements.paypalPasteForm.addEventListener("submit", previewPaypalPayment);
  elements.clearPaypalPasteButton.addEventListener("click", clearPaypalPaymentPaste);
  elements.closeInvoicePreviewButton.addEventListener("click", closeInvoicePreview);
  elements.printInvoiceButton.addEventListener("click", saveInvoicePdf);
  elements.expenseForm.addEventListener("submit", addExpense);
  elements.search.addEventListener("input", renderRestaurantTable);
  elements.statusFilter.addEventListener("change", renderRestaurantTable);
  elements.prospectSearch.addEventListener("input", renderProspects);
  elements.prospectScoreMin.addEventListener("change", renderProspects);
  elements.prospectScoreMax.addEventListener("change", renderProspects);
  elements.prospectSort.addEventListener("change", renderProspects);
  elements.leadBuilderForm.addEventListener("submit", runLeadBuilder);
  elements.copyLeadSearchesButton.addEventListener("click", copyLeadSearches);
  elements.manualLeadForm.addEventListener("submit", previewManualLead);
  elements.clearManualLeadButton.addEventListener("click", clearManualLeadForm);
  elements.pasteLeadsForm.addEventListener("submit", previewPastedLeads);
  elements.clearPastedLeadsButton.addEventListener("click", clearPastedLeads);
  elements.exportButton.addEventListener("click", exportBackup);
  elements.importButton.addEventListener("click", () => elements.importFile.click());
  elements.importFile.addEventListener("change", (event) => {
    importBackupFile(event.target.files?.[0]);
    event.target.value = "";
  });
  elements.prospectImportFile.addEventListener("change", (event) => {
    importProspectFile(event.target.files?.[0]);
    event.target.value = "";
  });
  elements.prospectImportList.addEventListener("change", (event) => {
    const checkbox = event.target.closest("[data-import-index]");
    if (checkbox) {
      toggleImportRow(Number(checkbox.dataset.importIndex), checkbox.checked);
    }
  });
  elements.prospectList.addEventListener("change", (event) => {
    const scoreInput = event.target.closest("[data-prospect-score-id]");
    if (scoreInput) {
      saveProspectScore(scoreInput.dataset.prospectScoreId, scoreInput.value);
      return;
    }
    const followUpInput = event.target.closest("[data-prospect-follow-up-id]");
    if (followUpInput) {
      saveProspectFollowUp(followUpInput.dataset.prospectFollowUpId, followUpInput.value);
    }
  });
  elements.prospectList.addEventListener("click", (event) => {
    const clearFollowUpButton = event.target.closest("[data-clear-prospect-follow-up-id]");
    if (clearFollowUpButton) {
      saveProspectFollowUp(clearFollowUpButton.dataset.clearProspectFollowUpId, "");
    }
  });
  elements.prospectImportList.addEventListener("click", (event) => {
    const researchButton = event.target.closest("[data-research-import-index]");
    if (researchButton) {
      openRestaurantResearch(Number(researchButton.dataset.researchImportIndex));
    }
  });
  elements.quickContactLinks.addEventListener("click", (event) => {
    const link = event.target.closest("[data-quick-contact-external-link]");
    if (!link) {
      return;
    }
    const opened = window.open(link.href, "_blank", "noopener,noreferrer");
    if (opened) {
      event.preventDefault();
      opened.opener = null;
    }
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
    const researchRestaurantButton = event.target.closest("[data-research-restaurant-id]");
    if (researchRestaurantButton) {
      openSavedRestaurantResearch(researchRestaurantButton.dataset.researchRestaurantId);
    }
    const salesEmailButton = event.target.closest("[data-sales-email-id]");
    if (salesEmailButton) {
      openSalesEmailDialog(salesEmailButton.dataset.salesEmailId);
    }
    const logSalesEmailLink = event.target.closest("[data-log-sales-email-id]");
    if (logSalesEmailLink) {
      logDirectSalesEmailOne(logSalesEmailLink.dataset.logSalesEmailId);
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
    const applyPaypalPaymentButton = event.target.closest("[data-apply-paypal-payment]");
    if (applyPaypalPaymentButton) {
      applyPaypalPayment();
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
  fillSalesEmailTemplateForm();
  updateInvoiceTemplateAmount();
  if (adminKey) {
    loadBackofficeData();
  } else {
    showLogin();
  }
})();
