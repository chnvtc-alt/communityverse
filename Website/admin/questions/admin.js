const API_URL = "/api/admin/questions";
const GENERATOR_API_URL = "/api/admin/question-generator";
const KEY_STORAGE = "communityverseQuestionsAdminKey";

const elements = {
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
let filterTimer = 0;
let aiDrafts = [];
let selectedAiDraftIndex = -1;

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

function populateDatalist(id, values) {
  document.querySelector(`#${id}`).innerHTML = [...new Set(values.filter(Boolean))]
    .sort()
    .map((value) => `<option value="${escapeHtml(value)}"></option>`)
    .join("");
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
    elements.login.showModal();
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

  elements.editorTitle.textContent = question ? "Edit question" : "New question";
  elements.deleteButton.hidden = !question;
  updateScopeFields();
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

  try {
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

elements.refreshButton.addEventListener("click", () => loadQuestions());
elements.clearFiltersButton.addEventListener("click", () => {
  filterIds.forEach((id) => {
    const input = document.querySelector(`#${id}`);
    input.value = id === "filter-status" ? "all" : "";
  });
  loadQuestions();
});

filterIds.forEach((id) => {
  document.querySelector(`#${id}`).addEventListener("input", () => {
    window.clearTimeout(filterTimer);
    filterTimer = window.setTimeout(() => loadQuestions({ quiet: true }), 250);
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

renderQuestions();
loadQuestions();
