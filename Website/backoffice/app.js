(() => {
  const STORAGE_KEY = "communityverseBackofficeRestaurants";
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
    "proposal-sent": "Proposal Sent",
    "follow-up": "Follow-Up",
    "not-interested": "Not Interested",
  };

  const interestLabels = {
    hot: "Hot",
    warm: "Warm",
    cold: "Cold",
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

  const elements = {
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
    salesList: document.querySelector("#sales-list"),
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
    interestLevel: document.querySelector("#interest-level"),
    leadSource: document.querySelector("#lead-source"),
    assignedTo: document.querySelector("#assigned-to"),
    prospectNotes: document.querySelector("#prospect-notes"),
    saleDate: document.querySelector("#sale-date"),
    packageName: document.querySelector("#package-name"),
    monthlyAmount: document.querySelector("#monthly-amount"),
    setupFee: document.querySelector("#setup-fee"),
    paymentStatus: document.querySelector("#payment-status"),
    firstInvoiceDate: document.querySelector("#first-invoice-date"),
    salesperson: document.querySelector("#salesperson"),
    setupStatus: document.querySelector("#setup-status"),
    salesNotes: document.querySelector("#sales-notes"),
  };

  const state = {
    section: "dashboard",
    restaurants: loadRestaurants(),
  };

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function makeId() {
    return `restaurant-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
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
      interestLevel: interestLabels[record.interestLevel] ? record.interestLevel : "",
      leadSource: String(record.leadSource || "").trim(),
      assignedTo: String(record.assignedTo || "").trim(),
      prospectNotes: String(record.prospectNotes || "").trim(),
      saleDate: String(record.saleDate || "").trim(),
      packageName: String(record.packageName || "").trim(),
      monthlyAmount: String(record.monthlyAmount || "").trim(),
      setupFee: String(record.setupFee || "").trim(),
      paymentStatus: paymentStatusLabels[record.paymentStatus] ? record.paymentStatus : "",
      firstInvoiceDate: String(record.firstInvoiceDate || "").trim(),
      salesperson: String(record.salesperson || "").trim(),
      setupStatus: setupStatusLabels[record.setupStatus] ? record.setupStatus : "",
      salesNotes: String(record.salesNotes || "").trim(),
      updatedAt: String(record.updatedAt || new Date().toISOString()).trim(),
    };
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
          restaurant.prospectStage,
          restaurant.interestLevel,
          restaurant.leadSource,
          restaurant.assignedTo,
          restaurant.prospectNotes,
          restaurant.saleDate,
          restaurant.packageName,
          restaurant.monthlyAmount,
          restaurant.setupFee,
          restaurant.paymentStatus,
          restaurant.firstInvoiceDate,
          restaurant.salesperson,
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

  function contactName(restaurant) {
    return [restaurant.contactFirstName, restaurant.contactLastName].filter(Boolean).join(" ");
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
    const prospects = state.restaurants.filter((restaurant) => restaurant.status === "prospect").length;
    const due = state.restaurants.filter(isFollowUpDue).length;
    elements.metricTotal.textContent = total;
    elements.metricCustomers.textContent = customers;
    elements.metricProspects.textContent = prospects;
    elements.metricFollowups.textContent = due;
  }

  function recordItem(restaurant) {
    const contact = compactContact(restaurant);
    const followUp = restaurant.nextFollowUp ? `Next follow-up: ${restaurant.nextFollowUp}` : "No follow-up date";
    return `
      <button class="record-item" type="button" data-edit-id="${escapeHtml(restaurant.id)}">
        <strong>${escapeHtml(restaurant.name)}</strong>
        <span>${statusLabels[restaurant.status] || restaurant.status} - ${escapeHtml(contact)}</span>
        <span>${escapeHtml(followUp)}</span>
      </button>
    `;
  }

  function renderDashboardLists() {
    const recent = [...state.restaurants]
      .sort((left, right) => String(right.updatedAt || "").localeCompare(String(left.updatedAt || "")))
      .slice(0, 6);
    elements.recentRestaurants.innerHTML = recent.length
      ? recent.map(recordItem).join("")
      : '<div class="empty-state">No restaurant records yet.</div>';

    const followups = state.restaurants
      .filter((restaurant) => restaurant.nextFollowUp)
      .sort((left, right) => left.nextFollowUp.localeCompare(right.nextFollowUp))
      .slice(0, 8);
    elements.followupList.innerHTML = followups.length
      ? followups.map(recordItem).join("")
      : '<div class="empty-state">No follow-up dates yet.</div>';
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
    const prospects = getFilteredRestaurants({ forceStatus: "prospect" });
    elements.prospectList.innerHTML = prospects.length
      ? prospects.map((restaurant) => `
          <tr>
            <td>
              <strong>${escapeHtml(restaurant.name)}</strong>
              <div class="helper">${escapeHtml(restaurant.leadSource || "No lead source yet")}</div>
            </td>
            <td>${escapeHtml(labelFor(prospectStageLabels, restaurant.prospectStage, "Not set"))}</td>
            <td>${escapeHtml(labelFor(interestLabels, restaurant.interestLevel, "Not set"))}</td>
            <td>${escapeHtml(restaurant.lastContacted || "")}</td>
            <td>${escapeHtml(restaurant.nextFollowUp || "")}</td>
            <td>${escapeHtml(compactContact(restaurant))}</td>
            <td><button class="text-button" type="button" data-edit-id="${escapeHtml(restaurant.id)}">Edit</button></td>
          </tr>
        `).join("")
      : '<tr><td colspan="7"><div class="empty-state">No prospects yet. Add one from New Restaurant or New Prospect.</div></td></tr>';
  }

  function renderSales() {
    const customers = getFilteredRestaurants({ forceStatus: "customer" });
    elements.salesList.innerHTML = customers.length
      ? customers.map((restaurant) => `
          <tr>
            <td>
              <strong>${escapeHtml(restaurant.name)}</strong>
              <div class="helper">${escapeHtml(contactName(restaurant) || "No contact yet")}</div>
            </td>
            <td>${escapeHtml(restaurant.saleDate || "")}</td>
            <td>${escapeHtml(restaurant.packageName || "")}</td>
            <td>${escapeHtml(moneyValue(restaurant.monthlyAmount))}</td>
            <td>${escapeHtml(labelFor(paymentStatusLabels, restaurant.paymentStatus, "Not set"))}</td>
            <td>${escapeHtml(labelFor(setupStatusLabels, restaurant.setupStatus, "Not set"))}</td>
            <td>${escapeHtml(restaurant.salesperson || restaurant.assignedTo || "")}</td>
            <td><button class="text-button" type="button" data-edit-id="${escapeHtml(restaurant.id)}">Edit</button></td>
          </tr>
        `).join("")
      : '<tr><td colspan="8"><div class="empty-state">No sales yet. Change a restaurant status to Customer or use New Sale.</div></td></tr>';
  }

  function render() {
    renderMetrics();
    renderDashboardLists();
    renderRestaurantTable();
    renderProspects();
    renderSales();
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
    elements.interestLevel.value = restaurant ? record.interestLevel : "";
    elements.leadSource.value = restaurant ? record.leadSource : "";
    elements.assignedTo.value = restaurant ? record.assignedTo : "";
    elements.prospectNotes.value = restaurant ? record.prospectNotes : "";
    elements.saleDate.value = restaurant ? record.saleDate : "";
    elements.packageName.value = restaurant ? record.packageName : "";
    elements.monthlyAmount.value = restaurant ? record.monthlyAmount : "";
    elements.setupFee.value = restaurant ? record.setupFee : "";
    elements.paymentStatus.value = restaurant ? record.paymentStatus : "";
    elements.firstInvoiceDate.value = restaurant ? record.firstInvoiceDate : "";
    elements.salesperson.value = restaurant ? record.salesperson : "";
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
      interestLevel: elements.interestLevel.value,
      leadSource: elements.leadSource.value,
      assignedTo: elements.assignedTo.value,
      prospectNotes: elements.prospectNotes.value,
      saleDate: elements.saleDate.value,
      packageName: elements.packageName.value,
      monthlyAmount: elements.monthlyAmount.value,
      setupFee: elements.setupFee.value,
      paymentStatus: elements.paymentStatus.value,
      firstInvoiceDate: elements.firstInvoiceDate.value,
      salesperson: elements.salesperson.value,
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

  function saveRestaurant(event) {
    event.preventDefault();
    const record = restaurantFromForm();
    const existingIndex = state.restaurants.findIndex((restaurant) => restaurant.id === record.id);
    if (existingIndex >= 0) {
      state.restaurants[existingIndex] = record;
    } else {
      state.restaurants.unshift(record);
    }
    saveRestaurants();
    closeRestaurantEditor();
    render();
  }

  function deleteCurrentRestaurant() {
    const id = elements.id.value;
    if (!id) {
      return;
    }
    const restaurant = state.restaurants.find((record) => record.id === id);
    const confirmed = window.confirm(`Delete ${restaurant?.name || "this restaurant"} from this browser's Back Office list?`);
    if (!confirmed) {
      return;
    }
    state.restaurants = state.restaurants.filter((record) => record.id !== id);
    saveRestaurants();
    closeRestaurantEditor();
    render();
  }

  function exportBackup() {
    const backup = {
      exportedAt: new Date().toISOString(),
      restaurants: state.restaurants,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `communityverse-backoffice-${today()}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function importBackupFile(file) {
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      try {
        const parsed = JSON.parse(String(reader.result || "{}"));
        const records = Array.isArray(parsed.restaurants) ? parsed.restaurants : Array.isArray(parsed) ? parsed : [];
        state.restaurants = records.map(normalizeRestaurant).filter((record) => record.name);
        saveRestaurants();
        render();
        window.alert(`Imported ${state.restaurants.length} restaurant records.`);
      } catch {
        window.alert("That backup file could not be imported.");
      }
    });
    reader.readAsText(file);
  }

  elements.navItems.forEach((item) => {
    item.addEventListener("click", () => setSection(item.dataset.section));
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
  elements.form.addEventListener("submit", saveRestaurant);
  elements.search.addEventListener("input", renderRestaurantTable);
  elements.statusFilter.addEventListener("change", renderRestaurantTable);
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
  });

  setSection("dashboard");
})();
