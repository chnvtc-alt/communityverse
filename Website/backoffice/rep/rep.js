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
    prospectList: document.querySelector("#prospect-list"),
    dialog: document.querySelector("#prospect-dialog"),
    form: document.querySelector("#prospect-form"),
    dialogTitle: document.querySelector("#dialog-title"),
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
  };

  const state = {
    key: localStorage.getItem(KEY_STORAGE) || "",
    restaurants: [],
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
    state.emailTemplate = normalizeEmailTemplate(data.emailTemplate);
    setStatus("List updated");
    renderList();
  }

  function filteredRestaurants() {
    const query = String(elements.prospectSearch.value || "").toLowerCase().trim();
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
      .sort((left, right) => String(left.nextFollowUp || "9999-12-31").localeCompare(String(right.nextFollowUp || "9999-12-31")));
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
      ? restaurants.map((restaurant) => {
          const website = externalUrl(restaurant.website);
          const facebook = externalUrl(restaurant.facebookPage);
          return `
            <tr>
              <td>
                <button class="link-button strong-link" type="button" data-edit-id="${escapeHtml(restaurant.id)}">${escapeHtml(restaurant.name)}</button>
                <div class="helper">${escapeHtml(formattedAddress(restaurant) || "No address yet")}</div>
                <div class="helper">${escapeHtml(latestContactSummary(restaurant))}</div>
              </td>
              <td>
                <strong>${escapeHtml(contactName(restaurant) || "No contact yet")}</strong>
                <div class="helper">${restaurant.contactEmail ? `<a href="mailto:${escapeHtml(restaurant.contactEmail)}">${escapeHtml(restaurant.contactEmail)}</a>` : "No email"}</div>
                <div class="helper">${escapeHtml(restaurant.contactCell || restaurant.phone || "")}</div>
              </td>
              <td>${escapeHtml(labelFor(stageLabels, restaurant.prospectStage, "New Lead"))}<div class="helper">Score ${escapeHtml(restaurant.prospectScore || "5")}</div></td>
              <td>${escapeHtml(restaurant.nextFollowUp || "")}</td>
              <td>
                ${website ? `<a class="text-button" href="${escapeHtml(website)}" target="_blank" rel="noopener">Website</a>` : ""}
                ${facebook ? `<a class="text-button" href="${escapeHtml(facebook)}" target="_blank" rel="noopener">Facebook</a>` : ""}
              </td>
              <td>
                <a class="text-button" href="${escapeHtml(researchUrl(restaurant))}" target="_blank" rel="noopener">Google</a>
              </td>
              <td>
                ${restaurant.contactEmail ? `<a class="text-button" href="${escapeHtml(emailDraftUrl(restaurant))}">Doyce Email</a>` : '<span class="helper">No email</span>'}
              </td>
            </tr>
          `;
        }).join("")
      : '<tr><td colspan="7"><div class="empty-state">No Doyce prospects match this search.</div></td></tr>';
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
      const saved = normalizeRestaurant(data.restaurant);
      const existingIndex = state.restaurants.findIndex((restaurant) => restaurant.id === saved.id);
      if (existingIndex >= 0) {
        state.restaurants[existingIndex] = saved;
      } else {
        state.restaurants.unshift(saved);
      }
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
    elements.repKey.value = "";
    setLoggedIn(false);
  }

  elements.loginForm.addEventListener("submit", login);
  elements.refreshButton.addEventListener("click", () => loadRepData().catch((error) => setStatus(error.message)));
  elements.newProspectButton.addEventListener("click", () => openDialog());
  elements.lockButton.addEventListener("click", lock);
  elements.prospectSearch.addEventListener("input", renderList);
  elements.prospectList.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-id]");
    if (editButton) {
      openDialog(editButton.dataset.editId);
    }
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
