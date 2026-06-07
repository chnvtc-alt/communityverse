const API_URL = "/api/admin/questions";
const GENERATOR_API_URL = "/api/admin/question-generator";
const CUSTOMER_API_URL = "/api/admin/customers";
const CUSTOMER_PHOTO_API_URL = "/api/admin/customer-photo";
const QUESTION_IMAGE_API_URL = "/api/admin/questions";
const KEY_STORAGE = "communityverseQuestionsAdminKey";

const elements = {
  tabs: [...document.querySelectorAll(".workshop-tab")],
  connectionStatus: document.querySelector("#connection-status"),
  lockButton: document.querySelector("#lock-button"),
  newButton: document.querySelector("#new-question-button"),
  refreshButton: document.querySelector("#refresh-button"),
  clearFiltersButton: document.querySelector("#clear-filters-button"),
  count: document.querySelector("#question-count"),
  list: document.querySelector("#question-list"),
  message: document.querySelector("#message"),
  editor: document.querySelector("#editor-dialog"),
  editorTitle: document.querySelector("#editor-title"),
  closeEditorButton: document.querySelector("#close-editor-button"),
  cancelButton: document.querySelector("#cancel-button"),
  deleteButton: document.querySelector("#delete-button"),
  form: document.querySelector("#question-form"),
  formErrors: document.querySelector("#form-errors"),
  customersPanel: document.querySelector("#customers-panel"),
  questionsPanel: document.querySelector("#questions-panel"),
  newCustomerButton: document.querySelector("#new-customer-button"),
  refreshCustomersButton: document.querySelector("#refresh-customers-button"),
  clearCustomerFiltersButton: document.querySelector("#clear-customer-filters-button"),
  customerCount: document.querySelector("#customer-count"),
  customerList: document.querySelector("#customer-list"),
  customerMessage: document.querySelector("#customer-message"),
  customerDialog: document.querySelector("#customer-dialog"),
  customerEditorTitle: document.querySelector("#customer-editor-title"),
  closeCustomerEditorButton: document.querySelector("#close-customer-editor-button"),
  cancelCustomerButton: document.querySelector("#cancel-customer-button"),
  deleteCustomerButton: document.querySelector("#delete-customer-button"),
  customerForm: document.querySelector("#customer-form"),
  customerFormErrors: document.querySelector("#customer-form-errors"),
  customerId: document.querySelector("#customer-id"),
  customerName: document.querySelector("#customer-name"),
  customerGroup: document.querySelector("#customer-group"),
  customerRarity: document.querySelector("#customer-rarity"),
  customerRegularValue: document.querySelector("#customer-regular-value"),
  customerOccasionalValue: document.querySelector("#customer-occasional-value"),
  customerFocusTag: document.querySelector("#customer-focus-tag"),
  customerSortOrder: document.querySelector("#customer-sort-order"),
  customerActive: document.querySelector("#customer-active"),
  customerBio: document.querySelector("#customer-bio"),
  customerQuestionPlace: document.querySelector("#customer-question-place"),
  customerQuestionFact: document.querySelector("#customer-question-fact"),
  customerImage: document.querySelector("#customer-image"),
  customerPhotoFile: document.querySelector("#customer-photo-file"),
  customerPhotoPreview: document.querySelector("#customer-photo-preview"),
  login: document.querySelector("#login-dialog"),
  loginForm: document.querySelector("#login-form"),
  loginError: document.querySelector("#login-error"),
  adminKey: document.querySelector("#admin-key"),
  scope: document.querySelector("#question-scope"),
  restaurantField: document.querySelector("#restaurant-field"),
  areaField: document.querySelector("#area-field"),
  aiSource: document.querySelector("#ai-source"),
  aiQuestionCount: document.querySelector("#ai-question-count"),
  aiStatus: document.querySelector("#ai-status"),
  aiResults: document.querySelector("#ai-results"),
  generateQuestionsButton: document.querySelector("#generate-questions-button"),
  suggestWrongAnswersButton: document.querySelector("#suggest-wrong-answers-button"),
  questionImageFile: document.querySelector("#question-image-file"),
  questionImagePreview: document.querySelector("#question-image-preview"),
  customerFilterQuery: document.querySelector("#customer-filter-query"),
  customerFilterStatus: document.querySelector("#customer-filter-status"),
  customerFilterGroup: document.querySelector("#customer-filter-group"),
  customerFilterFocusTag: document.querySelector("#customer-filter-focus-tag"),
  customerFilterRarity: document.querySelector("#customer-filter-rarity"),
};

const filterIds = [
  "filter-query",
  "filter-status",
  "filter-scope",
  "filter-difficulty",
  "filter-restaurant",
  "filter-area",
  "filter-customer",
  "filter-tag",
];

let adminKey = sessionStorage.getItem(KEY_STORAGE) || "";
let questions = [];
let customers = [];
let filterTimer = 0;
let customerFilterTimer = 0;
let aiDrafts = [];
let selectedAiDraftIndex = -1;
let selectedQuestionImageFile = null;
let selectedQuestionImagePreviewUrl = "";
let selectedCustomerPhotoFile = null;
let selectedCustomerPhotoPreviewUrl = "";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showMessage(text, isError = false) {
  elements.message.textContent = text;
  elements.message.classList.toggle("message-error", isError);
  elements.message.hidden = !text;
}

function showFormErrors(errors) {
  const messages = Array.isArray(errors) ? errors : [errors];
  elements.formErrors.innerHTML = messages.map((message) => `<div>${escapeHtml(message)}</div>`).join("");
  elements.formErrors.hidden = !messages.filter(Boolean).length;
}

async function apiRequest(path = "", options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${adminKey}`,
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || data.errors?.join(" ") || `Request failed (${response.status}).`);
    error.status = response.status;
    error.details = data.errors;
    throw error;
  }

  return data;
}

async function generatorRequest(body) {
  const response = await fetch(GENERATOR_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminKey}`,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || `AI request failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }

  return data.questions || [];
}

async function customerApiRequest(path = "", options = {}) {
  const response = await fetch(`${CUSTOMER_API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${adminKey}`,
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || data.errors?.join(" ") || `Request failed (${response.status}).`);
    error.status = response.status;
    error.details = data.errors;
    throw error;
  }

  return data;
}

async function uploadQuestionImage(questionId, file) {
  const formData = new FormData();
  formData.set("id", questionId);
  formData.set("image", file);

  const response = await fetch(`${QUESTION_IMAGE_API_URL}/${encodeURIComponent(questionId)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${adminKey}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `Image upload failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }

  return data;
}

async function uploadCustomerPhoto(customerId, file) {
  const formData = new FormData();
  formData.set("id", customerId);
  formData.set("photo", file);

  const response = await fetch(CUSTOMER_PHOTO_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${adminKey}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `Photo upload failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }

  return data;
}

function filterParams() {
  const mapping = {
    "filter-query": "q",
    "filter-status": "status",
    "filter-scope": "scope",
    "filter-difficulty": "difficulty",
    "filter-restaurant": "restaurantSlug",
    "filter-area": "areaSlug",
    "filter-customer": "customerId",
    "filter-tag": "tag",
  };
  const params = new URLSearchParams();

  Object.entries(mapping).forEach(([id, parameter]) => {
    const value = document.querySelector(`#${id}`).value.trim();
    if (value) params.set(parameter, value);
  });

  return params;
}

function setConnected(connected) {
  elements.connectionStatus.textContent = connected ? "Connected to Supabase" : "Not connected";
  elements.connectionStatus.classList.toggle("connected", connected);
}

function setActiveTab(tabName) {
  elements.tabs.forEach((button) => {
    const isActive = button.dataset.tab === tabName;
    button.classList.toggle("is-active", isActive);
  });
  elements.questionsPanel.hidden = tabName !== "questions";
  elements.customersPanel.hidden = tabName !== "customers";
}

function populateDatalist(id, values) {
  document.querySelector(`#${id}`).innerHTML = [...new Set(values.filter(Boolean))]
    .sort()
    .map((value) => `<option value="${escapeHtml(value)}"></option>`)
    .join("");
}

function displayImageUrl(image) {
  const source = String(image || "").trim();
  if (!source) {
    return "/assets/restaurant-challenge/customers/customer-placeholder.svg";
  }

  if (/^https?:\/\//i.test(source) || source.startsWith("/")) {
    return source;
  }

  if (source.startsWith("../assets/")) {
    return `/${source.replace(/^\.\.\/assets\//, "assets/")}`;
  }

  return source;
}

function normalizeRestaurant(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw || raw === "shared") {
    return "shared";
  }

  if (raw === "americana" || raw === "americana-diner" || raw === "americana diner") {
    return "americana";
  }

  if (["communityverse", "historical", "storybook", "cryptid", "exclusive"].includes(raw)) {
    return "shared";
  }

  return raw.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "shared";
}

function normalizeCharacterType(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function formatRestaurantLabel(value) {
  const restaurant = String(value || "").trim().toLowerCase();
  if (!restaurant || restaurant === "shared") {
    return "Shared";
  }

  if (restaurant === "americana") {
    return "Americana Diner";
  }

  return restaurant
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCharacterTypeLabel(value) {
  const type = String(value || "").trim().toLowerCase();
  if (!type) {
    return "";
  }

  const labels = {
    communityverse: "CommunityVerse regular",
    historical: "Historical person",
    storybook: "Storybook character",
    cryptid: "Cryptid",
    exclusive: "Exclusive",
  };

  return labels[type] || type.split("-").filter(Boolean).map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
}

function showCustomerMessage(text, isError = false) {
  elements.customerMessage.textContent = text;
  elements.customerMessage.classList.toggle("message-error", isError);
  elements.customerMessage.hidden = !text;
}

function showCustomerFormErrors(errors) {
  const messages = Array.isArray(errors) ? errors : [errors];
  elements.customerFormErrors.innerHTML = messages.map((message) => `<div>${escapeHtml(message)}</div>`).join("");
  elements.customerFormErrors.hidden = !messages.filter(Boolean).length;
}

function createCustomerId(name) {
  const slug = String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${slug || "customer"}-${Math.random().toString(36).slice(2, 10)}`;
}

function createQuestionId(prompt) {
  const slug = String(prompt || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${slug || "question"}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeCustomer(customer) {
  const safeCustomer = typeof customer === "object" && customer ? structuredClone(customer) : {};
  safeCustomer.id = String(safeCustomer.id || "").trim();
  safeCustomer.name = String(safeCustomer.name || "").trim();
  safeCustomer.characterType = normalizeCharacterType(
    safeCustomer.characterType || safeCustomer.group || safeCustomer.groupName || ""
  );
  safeCustomer.group = safeCustomer.characterType;
  safeCustomer.groupName = safeCustomer.characterType;
  safeCustomer.rarity = String(safeCustomer.rarity || "").trim();
  safeCustomer.regularValue = Number(safeCustomer.regularValue) || 0;
  safeCustomer.occasionalValue = Number(safeCustomer.occasionalValue) || 0;
  safeCustomer.restaurant = normalizeRestaurant(
    safeCustomer.restaurant || safeCustomer.focusTag || safeCustomer.focus_tag || ""
  );
  safeCustomer.focusTag = safeCustomer.restaurant;
  safeCustomer.image = String(safeCustomer.image || "").trim();
  safeCustomer.bio = String(safeCustomer.bio || "").trim();
  safeCustomer.questionPlace = String(safeCustomer.questionPlace || "").trim();
  safeCustomer.questionFact = String(safeCustomer.questionFact || "").trim();
  safeCustomer.active = safeCustomer.active !== false;
  safeCustomer.sortOrder = Number(safeCustomer.sortOrder) || 0;
  return safeCustomer;
}

function populateCustomerSuggestions() {
  populateDatalist("customer-group-options", customers.map((customer) => customer.characterType));
  populateDatalist("customer-focus-options", customers.map((customer) => customer.restaurant));
  populateDatalist("customer-rarity-options", customers.map((customer) => customer.rarity));
}

function updateSuggestions() {
  populateDatalist("restaurant-options", questions.map((question) => question.restaurantSlug));
  populateDatalist("area-options", questions.map((question) => question.areaSlug));
  populateDatalist("customer-options", questions.flatMap((question) => question.customerIds || []));
  populateDatalist("tag-options", questions.flatMap((question) => question.tags || []));
}

function renderQuestions() {
  elements.count.textContent = `${questions.length} question${questions.length === 1 ? "" : "s"}`;
  updateSuggestions();

  if (!questions.length) {
    elements.list.innerHTML = '<div class="empty-state">No questions match these filters.</div>';
    return;
  }

  elements.list.innerHTML = questions
    .map((question) => {
      const target = question.restaurantSlug || question.areaSlug || question.customerIds?.join(", ");
      const chips = [
        target,
        ...(question.tags || []).slice(0, 4).map((tag) => `#${tag}`),
        question.active ? "" : "inactive",
      ].filter(Boolean);

      return `
        <article class="question-card ${question.active ? "" : "inactive"}" data-id="${escapeHtml(question.id)}">
          <div>
            <p class="question-prompt">${escapeHtml(question.prompt)}</p>
            <p class="question-answer">Answer: ${escapeHtml(question.correctAnswer)}</p>
            <div class="question-meta">
              <span class="scope-badge">${escapeHtml(question.scope)}</span>
              <span class="difficulty-badge">${escapeHtml(question.difficulty)}</span>
              ${chips.map((chip) => `<span class="meta-chip">${escapeHtml(chip)}</span>`).join("")}
            </div>
          </div>
          <div class="card-actions">
            <button class="button button-secondary edit-button" type="button">Edit</button>
            <button class="button button-quiet toggle-button" type="button">
              ${question.active ? "Deactivate" : "Activate"}
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

async function loadQuestions({ quiet = false } = {}) {
  if (!adminKey) {
    if (!elements.login.open) {
      elements.login.showModal();
    }
    return;
  }

  if (!quiet) showMessage("Loading questions...");

  try {
    const data = await apiRequest(`?${filterParams().toString()}`);
    questions = data.questions || [];
    renderQuestions();
    setConnected(true);
    showMessage("");
    if (elements.login.open) elements.login.close();
  } catch (error) {
    setConnected(false);
    if (error.status === 401) {
      adminKey = "";
      sessionStorage.removeItem(KEY_STORAGE);
      elements.loginError.textContent = "That admin key was not accepted.";
      elements.loginError.hidden = false;
      if (!elements.login.open) elements.login.showModal();
      return;
    }
    showMessage(error.message, true);
  }
}

function customerFilterParams() {
  const mapping = {
    "customer-filter-query": "q",
    "customer-filter-status": "status",
    "customer-filter-group": "characterType",
    "customer-filter-focus-tag": "restaurant",
    "customer-filter-rarity": "rarity",
  };
  const params = new URLSearchParams();

  Object.entries(mapping).forEach(([id, parameter]) => {
    const value = document.querySelector(`#${id}`).value.trim();
    if (value) params.set(parameter, value);
  });

  return params;
}

function renderCustomers() {
  elements.customerCount.textContent = `${customers.length} customer${customers.length === 1 ? "" : "s"}`;
  populateCustomerSuggestions();

  if (!customers.length) {
    elements.customerList.innerHTML = '<div class="empty-state">No customers match these filters.</div>';
    return;
  }

  elements.customerList.innerHTML = customers
    .map((customer) => {
      const chips = [
        formatRestaurantLabel(customer.restaurant),
        formatCharacterTypeLabel(customer.characterType),
        customer.rarity,
        customer.active ? "" : "inactive",
      ].filter(Boolean);

      return `
        <article class="question-card ${customer.active ? "" : "inactive"}" data-id="${escapeHtml(customer.id)}">
          <div class="customer-card-layout">
              <img class="customer-card-photo" src="${escapeHtml(displayImageUrl(customer.image))}" alt="${escapeHtml(customer.name)}" />
            <div>
              <p class="question-prompt">${escapeHtml(customer.name)}</p>
              <p class="question-answer">Regular ${escapeHtml(customer.regularValue)} | Occasional ${escapeHtml(customer.occasionalValue)}</p>
              <p class="subtle" style="margin-top: 6px;">${escapeHtml(customer.bio || customer.questionFact || customer.questionPlace || "")}</p>
              <div class="question-meta">
                ${chips.map((chip) => `<span class="meta-chip">${escapeHtml(chip)}</span>`).join("")}
              </div>
            </div>
          </div>
          <div class="card-actions">
            <button class="button button-secondary edit-customer-button" type="button">Edit</button>
            <button class="button button-quiet toggle-customer-button" type="button">
              ${customer.active ? "Deactivate" : "Activate"}
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

async function loadCustomers({ quiet = false } = {}) {
  if (!adminKey) {
    if (!elements.login.open) {
      elements.login.showModal();
    }
    return;
  }

  if (!quiet) showCustomerMessage("Loading customers...");

  try {
    const data = await customerApiRequest(`?${customerFilterParams().toString()}`);
    customers = (data.customers || []).map(normalizeCustomer);
    renderCustomers();
    showCustomerMessage("");
    if (elements.login.open) elements.login.close();
  } catch (error) {
    if (error.status === 401) {
      adminKey = "";
      sessionStorage.removeItem(KEY_STORAGE);
      elements.loginError.textContent = "That admin key was not accepted.";
      elements.loginError.hidden = false;
      if (!elements.login.open) elements.login.showModal();
      return;
    }
    showCustomerMessage(error.message, true);
  }
}

function updateCustomerPhotoPreview(source) {
  const raw = String(source || "").trim();
  if (!raw) {
    elements.customerPhotoPreview.removeAttribute("src");
    elements.customerPhotoPreview.alt = "";
    elements.customerPhotoPreview.hidden = true;
    return;
  }

  const image = displayImageUrl(raw);
  if (image) {
    elements.customerPhotoPreview.src = image;
    elements.customerPhotoPreview.alt = "";
    elements.customerPhotoPreview.hidden = false;
    return;
  }
}

function resetCustomerEditor(customer = null) {
  elements.customerForm.reset();
  showCustomerFormErrors([]);
  if (selectedCustomerPhotoPreviewUrl) {
    URL.revokeObjectURL(selectedCustomerPhotoPreviewUrl);
    selectedCustomerPhotoPreviewUrl = "";
  }
  selectedCustomerPhotoFile = null;
  elements.customerPhotoFile.value = "";
  elements.customerId.value = customer?.id || "";
  elements.customerName.value = customer?.name || "";
  elements.customerGroup.value = customer?.characterType || customer?.group || "";
  elements.customerRarity.value = customer?.rarity || "";
  elements.customerRegularValue.value = customer?.regularValue || 0;
  elements.customerOccasionalValue.value = customer?.occasionalValue || 0;
  elements.customerFocusTag.value = customer?.restaurant || customer?.focusTag || "";
  elements.customerSortOrder.value = customer?.sortOrder || 0;
  elements.customerActive.checked = customer?.active !== false;
  elements.customerBio.value = customer?.bio || "";
  elements.customerQuestionPlace.value = customer?.questionPlace || "";
  elements.customerQuestionFact.value = customer?.questionFact || "";
  elements.customerImage.value = customer?.image || "";
  updateCustomerPhotoPreview(customer?.image || "");
  elements.customerEditorTitle.textContent = customer ? "Edit customer" : "New customer";
  elements.deleteCustomerButton.hidden = !customer;
}

function customerFromForm() {
  return {
    id: elements.customerId.value.trim(),
    name: elements.customerName.value.trim(),
    characterType: elements.customerGroup.value.trim(),
    group: elements.customerGroup.value.trim(),
    rarity: elements.customerRarity.value.trim(),
    regularValue: Number(elements.customerRegularValue.value) || 0,
    occasionalValue: Number(elements.customerOccasionalValue.value) || 0,
    restaurant: elements.customerFocusTag.value.trim(),
    focusTag: elements.customerFocusTag.value.trim(),
    sortOrder: Number(elements.customerSortOrder.value) || 0,
    active: elements.customerActive.checked,
    bio: elements.customerBio.value.trim(),
    questionPlace: elements.customerQuestionPlace.value.trim(),
    questionFact: elements.customerQuestionFact.value.trim(),
    image: elements.customerImage.value.trim(),
  };
}

async function validatePhotoDimensions(file) {
  const imageUrl = URL.createObjectURL(file);
  try {
    const dimensions = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error("That photo could not be read."));
      img.src = imageUrl;
    });

    if (dimensions.width !== 512 || dimensions.height !== 512) {
      throw new Error("Please use a 512 x 512 photo.");
    }

    return true;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

async function saveCustomerEditor(event) {
  event.preventDefault();
  showCustomerFormErrors([]);

  let customer = customerFromForm();
  if (!customer.id) {
    customer.id = createCustomerId(customer.name);
    elements.customerId.value = customer.id;
  }

  if (!customer.name) {
    showCustomerFormErrors("Customer name is required.");
    return;
  }

  try {
    if (selectedCustomerPhotoFile) {
      await validatePhotoDimensions(selectedCustomerPhotoFile);
      const upload = await uploadCustomerPhoto(customer.id, selectedCustomerPhotoFile);
      customer.image = upload.image;
      elements.customerImage.value = upload.image;
    }

    const isEditing = Boolean(customer.id && customers.some((entry) => entry.id === customer.id));
    await customerApiRequest(isEditing ? `/${encodeURIComponent(customer.id)}` : "", {
      method: isEditing ? "PUT" : "POST",
      body: JSON.stringify(customer),
    });

    elements.customerDialog.close();
    showCustomerMessage(isEditing ? "Customer updated." : "Customer added.");
    await loadCustomers({ quiet: true });
  } catch (error) {
    showCustomerFormErrors(error.details || error.message);
  }
}

async function toggleCustomer(customer) {
  try {
    await customerApiRequest(`/${encodeURIComponent(customer.id)}`, {
      method: "PUT",
      body: JSON.stringify({ ...customer, active: !customer.active }),
    });
    await loadCustomers({ quiet: true });
  } catch (error) {
    showCustomerMessage(error.message, true);
  }
}

async function deleteCurrentCustomer() {
  const id = elements.customerId.value;
  if (!id || !window.confirm("Permanently delete this customer? Deactivating is usually safer.")) return;

  try {
    await customerApiRequest(`/${encodeURIComponent(id)}`, { method: "DELETE" });
    elements.customerDialog.close();
    showCustomerMessage("Customer deleted.");
    await loadCustomers({ quiet: true });
  } catch (error) {
    showCustomerFormErrors(error.message);
  }
}

function splitCommaList(value) {
  return [...new Set(String(value || "").split(",").map((item) => item.trim()).filter(Boolean))];
}

function updateScopeFields() {
  const scope = elements.scope.value;
  elements.restaurantField.hidden = scope !== "restaurant";
  elements.areaField.hidden = scope !== "area";
}

function showAiStatus(text, isError = false) {
  elements.aiStatus.textContent = text;
  elements.aiStatus.classList.toggle("error", isError);
  elements.aiStatus.hidden = !text;
}

function setGeneratorBusy(button, busy, busyText) {
  if (!button.dataset.label) button.dataset.label = button.textContent.trim();
  button.disabled = busy;
  button.textContent = busy ? busyText : button.dataset.label;
}

function fillQuestionDraft(question, index) {
  selectedAiDraftIndex = index;
  document.querySelector("#question-prompt").value = question.prompt || "";
  document.querySelector("#correct-answer").value = question.correctAnswer || "";
  document.querySelectorAll(".wrong-answer").forEach((input, index) => {
    input.value = question.wrongAnswers?.[index] || "";
  });
  document.querySelector("#question-difficulty").value = question.difficulty || "medium";
  document.querySelector("#question-tags").value = (question.tags || []).join(", ");
  showAiStatus("Draft placed in the form. Review it, then save when you are happy.");
}

function renderAiResults(drafts) {
  aiDrafts = drafts;
  elements.aiResults.innerHTML = drafts
    .map(
      (draft, index) => `
        <article class="ai-result">
          <div>
            <strong>${escapeHtml(draft.prompt)}</strong>
            <span>Answer: ${escapeHtml(draft.correctAnswer)}</span>
          </div>
          <button class="button button-secondary use-ai-draft" type="button" data-index="${index}">
            Review and edit
          </button>
        </article>
      `
    )
    .join("");
  elements.aiResults.hidden = !drafts.length;
}

function clearQuestionFields() {
  document.querySelector("#question-id").value = "";
  document.querySelector("#question-prompt").value = "";
  document.querySelector("#correct-answer").value = "";
  document.querySelectorAll(".wrong-answer").forEach((input) => {
    input.value = "";
  });
  document.querySelector("#question-tags").value = "";
  document.querySelector("#sort-order").value = 0;
  document.querySelector("#question-active").checked = true;
  document.querySelector("#question-image").value = "";
  document.querySelector("#question-image-alt").value = "";
  elements.questionImageFile.value = "";
  selectedQuestionImageFile = null;
  if (selectedQuestionImagePreviewUrl) {
    URL.revokeObjectURL(selectedQuestionImagePreviewUrl);
    selectedQuestionImagePreviewUrl = "";
  }
  elements.questionImagePreview.removeAttribute("src");
  elements.questionImagePreview.alt = "";
  elements.questionImagePreview.hidden = true;
  selectedAiDraftIndex = -1;
}

function resetEditor(question = null) {
  elements.form.reset();
  showFormErrors([]);
  showAiStatus("");
  elements.aiResults.hidden = true;
  elements.aiResults.innerHTML = "";
  aiDrafts = [];
  selectedAiDraftIndex = -1;
  elements.questionImageFile.value = "";
  selectedQuestionImageFile = null;
  if (selectedQuestionImagePreviewUrl) {
    URL.revokeObjectURL(selectedQuestionImagePreviewUrl);
    selectedQuestionImagePreviewUrl = "";
  }
  document.querySelector("#question-id").value = question?.id || "";
  document.querySelector("#question-prompt").value = question?.prompt || "";
  document.querySelector("#correct-answer").value = question?.correctAnswer || "";

  const wrongAnswers = question?.wrongAnswers || [];
  document.querySelectorAll(".wrong-answer").forEach((input, index) => {
    input.value = wrongAnswers[index] || "";
  });

  elements.scope.value = question?.scope || "global";
  document.querySelector("#question-difficulty").value = question?.difficulty || "medium";
  document.querySelector("#restaurant-slug").value = question?.restaurantSlug || "";
  document.querySelector("#area-slug").value = question?.areaSlug || "";
  document.querySelector("#customer-ids").value = (question?.customerIds || []).join(", ");
  document.querySelector("#question-tags").value = (question?.tags || []).join(", ");
  document.querySelector("#sort-order").value = question?.sortOrder || 0;
  document.querySelector("#question-active").checked = question?.active !== false;
  document.querySelector("#question-image").value = question?.image || "";
  document.querySelector("#question-image-alt").value = question?.imageAlt || "";
  updateQuestionImagePreview(question?.image || "");

  elements.editorTitle.textContent = question ? "Edit question" : "New question";
  elements.deleteButton.hidden = !question;
  updateScopeFields();
}

function updateQuestionImagePreview(source) {
  const raw = String(source || "").trim();
  if (!raw) {
    elements.questionImagePreview.removeAttribute("src");
    elements.questionImagePreview.alt = "";
    elements.questionImagePreview.hidden = true;
    return;
  }

  const image = displayImageUrl(raw);
  if (image) {
    elements.questionImagePreview.src = image;
    elements.questionImagePreview.alt = "";
    elements.questionImagePreview.hidden = false;
  }
}

async function generateQuestionDrafts() {
  const source = elements.aiSource.value.trim();
  if (!source) {
    showAiStatus("Enter a topic or some information first.", true);
    return;
  }

  setGeneratorBusy(elements.generateQuestionsButton, true, "Creating drafts...");
  showAiStatus("Creating draft questions. This may take a few seconds.");
  elements.aiResults.hidden = true;

  try {
    const drafts = await generatorRequest({
      mode: "questions",
      source,
      count: Number(elements.aiQuestionCount.value) || 3,
      difficulty: document.querySelector("#question-difficulty").value,
    });
    renderAiResults(drafts);
    showAiStatus("Choose Review and edit to inspect all four answers. Nothing saves until you click Save question.");
  } catch (error) {
    showAiStatus(error.message, true);
  } finally {
    setGeneratorBusy(elements.generateQuestionsButton, false);
  }
}

async function suggestWrongAnswers() {
  const prompt = document.querySelector("#question-prompt").value.trim();
  const correctAnswer = document.querySelector("#correct-answer").value.trim();
  if (!prompt || !correctAnswer) {
    showFormErrors("Enter the question and correct answer first.");
    return;
  }

  showFormErrors([]);
  setGeneratorBusy(elements.suggestWrongAnswersButton, true, "Thinking...");

  try {
    const drafts = await generatorRequest({
      mode: "wrongAnswers",
      prompt,
      correctAnswer,
      difficulty: document.querySelector("#question-difficulty").value,
    });
    const wrongAnswers = drafts[0]?.wrongAnswers || [];
    document.querySelectorAll(".wrong-answer").forEach((input, index) => {
      input.value = wrongAnswers[index] || "";
    });
    showAiStatus("Three wrong answers were added. Review them before saving.");
  } catch (error) {
    showFormErrors(error.message);
  } finally {
    setGeneratorBusy(elements.suggestWrongAnswersButton, false);
  }
}

function questionFromForm() {
  return {
    id: document.querySelector("#question-id").value.trim(),
    prompt: document.querySelector("#question-prompt").value.trim(),
    correctAnswer: document.querySelector("#correct-answer").value.trim(),
    wrongAnswers: [...document.querySelectorAll(".wrong-answer")].map((input) => input.value.trim()).filter(Boolean),
    scope: elements.scope.value,
    difficulty: document.querySelector("#question-difficulty").value,
    restaurantSlug: document.querySelector("#restaurant-slug").value.trim(),
    areaSlug: document.querySelector("#area-slug").value.trim(),
    customerIds: splitCommaList(document.querySelector("#customer-ids").value),
    tags: splitCommaList(document.querySelector("#question-tags").value),
    sortOrder: Number(document.querySelector("#sort-order").value) || 0,
    active: document.querySelector("#question-active").checked,
    image: document.querySelector("#question-image").value.trim(),
    imageAlt: document.querySelector("#question-image-alt").value.trim(),
  };
}

async function saveEditor(event) {
  event.preventDefault();
  showFormErrors([]);
  const question = questionFromForm();
  const isEditing = Boolean(question.id);
  if (!question.id) {
    question.id = createQuestionId(question.prompt);
    document.querySelector("#question-id").value = question.id;
  }

  try {
    if (selectedQuestionImageFile) {
      const upload = await uploadQuestionImage(question.id, selectedQuestionImageFile);
      question.image = upload.image;
      document.querySelector("#question-image").value = upload.image;
      updateQuestionImagePreview(upload.image);
    }

    await apiRequest(isEditing ? `/${encodeURIComponent(question.id)}` : "", {
      method: isEditing ? "PUT" : "POST",
      body: JSON.stringify(question),
    });

    const savedAiDraft = !isEditing && selectedAiDraftIndex >= 0;
    if (savedAiDraft) {
      aiDrafts.splice(selectedAiDraftIndex, 1);
      clearQuestionFields();
      renderAiResults(aiDrafts);

      if (aiDrafts.length) {
        showAiStatus(
          `Question saved. ${aiDrafts.length} draft${aiDrafts.length === 1 ? "" : "s"} remaining.`
        );
      } else {
        elements.editor.close();
      }
    } else {
      elements.editor.close();
    }

    showMessage(isEditing ? "Question updated." : "Question added.");
    await loadQuestions({ quiet: true });
  } catch (error) {
    showFormErrors(error.details || error.message);
  }
}

async function toggleQuestion(question) {
  try {
    await apiRequest(`/${encodeURIComponent(question.id)}`, {
      method: "PUT",
      body: JSON.stringify({ ...question, active: !question.active }),
    });
    await loadQuestions({ quiet: true });
  } catch (error) {
    showMessage(error.message, true);
  }
}

async function deleteCurrentQuestion() {
  const id = document.querySelector("#question-id").value;
  if (!id || !window.confirm("Permanently delete this question? Deactivating is usually safer.")) return;

  try {
    await apiRequest(`/${encodeURIComponent(id)}`, { method: "DELETE" });
    elements.editor.close();
    showMessage("Question deleted.");
    await loadQuestions({ quiet: true });
  } catch (error) {
    showFormErrors(error.message);
  }
}

elements.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  adminKey = elements.adminKey.value.trim();
  sessionStorage.setItem(KEY_STORAGE, adminKey);
  elements.loginError.hidden = true;
  await loadQuestions();
  await loadCustomers();
});

elements.lockButton.addEventListener("click", () => {
  adminKey = "";
  sessionStorage.removeItem(KEY_STORAGE);
  questions = [];
  renderQuestions();
  setConnected(false);
  elements.adminKey.value = "";
  elements.login.showModal();
});

elements.newButton.addEventListener("click", () => {
  resetEditor();
  elements.editor.showModal();
});

elements.newCustomerButton.addEventListener("click", () => {
  resetCustomerEditor();
  elements.customerDialog.showModal();
});

elements.refreshButton.addEventListener("click", () => loadQuestions());
elements.refreshCustomersButton.addEventListener("click", () => loadCustomers());
elements.clearFiltersButton.addEventListener("click", () => {
  filterIds.forEach((id) => {
    const input = document.querySelector(`#${id}`);
    input.value = id === "filter-status" ? "all" : "";
  });
  loadQuestions();
});

elements.clearCustomerFiltersButton.addEventListener("click", () => {
  [
    elements.customerFilterQuery,
    elements.customerFilterGroup,
    elements.customerFilterFocusTag,
    elements.customerFilterRarity,
  ].forEach((input) => {
    input.value = "";
  });
  elements.customerFilterStatus.value = "all";
  loadCustomers();
});

filterIds.forEach((id) => {
  const input = document.querySelector(`#${id}`);
  ["input", "change"].forEach((eventName) => {
    input.addEventListener(eventName, () => {
      window.clearTimeout(filterTimer);
      filterTimer = window.setTimeout(() => loadQuestions({ quiet: true }), 250);
    });
  });
});

[
  elements.customerFilterQuery,
  elements.customerFilterGroup,
  elements.customerFilterFocusTag,
  elements.customerFilterRarity,
  elements.customerFilterStatus,
].forEach((input) => {
  ["input", "change"].forEach((eventName) => {
    input.addEventListener(eventName, () => {
      window.clearTimeout(customerFilterTimer);
      customerFilterTimer = window.setTimeout(() => loadCustomers({ quiet: true }), 250);
    });
  });
});

elements.list.addEventListener("click", (event) => {
  const card = event.target.closest(".question-card");
  if (!card) return;
  const question = questions.find((item) => item.id === card.dataset.id);
  if (!question) return;

  if (event.target.closest(".edit-button")) {
    resetEditor(question);
    elements.editor.showModal();
  }
  if (event.target.closest(".toggle-button")) toggleQuestion(question);
});

elements.customerList.addEventListener("click", (event) => {
  const card = event.target.closest(".question-card");
  if (!card) return;
  const customer = customers.find((item) => item.id === card.dataset.id);
  if (!customer) return;

  if (event.target.closest(".edit-customer-button")) {
    resetCustomerEditor(customer);
    elements.customerDialog.showModal();
  }
  if (event.target.closest(".toggle-customer-button")) toggleCustomer(customer);
});

elements.scope.addEventListener("change", updateScopeFields);
elements.generateQuestionsButton.addEventListener("click", generateQuestionDrafts);
elements.suggestWrongAnswersButton.addEventListener("click", suggestWrongAnswers);
elements.aiResults.addEventListener("click", (event) => {
  const button = event.target.closest(".use-ai-draft");
  if (!button) return;
  const index = Number(button.dataset.index);
  if (!aiDrafts[index]) return;
  fillQuestionDraft(aiDrafts[index], index);
});
elements.form.addEventListener("submit", saveEditor);
elements.deleteButton.addEventListener("click", deleteCurrentQuestion);
elements.closeEditorButton.addEventListener("click", () => elements.editor.close());
elements.cancelButton.addEventListener("click", () => elements.editor.close());
elements.customerForm.addEventListener("submit", saveCustomerEditor);
elements.deleteCustomerButton.addEventListener("click", deleteCurrentCustomer);
elements.closeCustomerEditorButton.addEventListener("click", () => elements.customerDialog.close());
elements.cancelCustomerButton.addEventListener("click", () => elements.customerDialog.close());
elements.customerPhotoFile.addEventListener("change", async () => {
  const file = elements.customerPhotoFile.files && elements.customerPhotoFile.files[0];
  selectedCustomerPhotoFile = file || null;
  if (selectedCustomerPhotoPreviewUrl) {
    URL.revokeObjectURL(selectedCustomerPhotoPreviewUrl);
    selectedCustomerPhotoPreviewUrl = "";
  }
  if (!file) {
    updateCustomerPhotoPreview(elements.customerImage.value);
    return;
  }

  selectedCustomerPhotoPreviewUrl = URL.createObjectURL(file);
  updateCustomerPhotoPreview(selectedCustomerPhotoPreviewUrl);
});
elements.customerImage.addEventListener("input", () => {
  if (!selectedCustomerPhotoFile) {
    updateCustomerPhotoPreview(elements.customerImage.value);
  }
});
elements.questionImageFile.addEventListener("change", async () => {
  const file = elements.questionImageFile.files && elements.questionImageFile.files[0];
  selectedQuestionImageFile = file || null;
  if (selectedQuestionImagePreviewUrl) {
    URL.revokeObjectURL(selectedQuestionImagePreviewUrl);
    selectedQuestionImagePreviewUrl = "";
  }
  if (!file) {
    updateQuestionImagePreview(document.querySelector("#question-image").value);
    return;
  }

  selectedQuestionImagePreviewUrl = URL.createObjectURL(file);
  updateQuestionImagePreview(selectedQuestionImagePreviewUrl);
});
document.querySelector("#question-image").addEventListener("input", () => {
  if (!selectedQuestionImageFile) {
    updateQuestionImagePreview(document.querySelector("#question-image").value);
    return;
  }

  selectedQuestionImageFile = null;
  elements.questionImageFile.value = "";
  if (selectedQuestionImagePreviewUrl) {
    URL.revokeObjectURL(selectedQuestionImagePreviewUrl);
    selectedQuestionImagePreviewUrl = "";
  }
  updateQuestionImagePreview(document.querySelector("#question-image").value);
});

elements.tabs.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveTab(button.dataset.tab);
    if (button.dataset.tab === "customers") {
      loadCustomers({ quiet: true });
    }
  });
});

renderQuestions();
renderCustomers();
setActiveTab("questions");
loadQuestions();
loadCustomers();
