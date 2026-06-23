const elements = {
  title: document.querySelector("#feedback-results-title"),
  summary: document.querySelector("#feedback-results-summary"),
  message: document.querySelector("#feedback-results-message"),
  list: document.querySelector("#feedback-results-list"),
};

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
  elements.message.classList.toggle("is-error", isError);
  elements.message.hidden = !text;
}

function formatSubmittedAt(value) {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function renderResponses(responses) {
  if (!responses.length) {
    elements.list.innerHTML = '<div class="panel panel-pad empty-state">No feedback has been submitted yet.</div>';
    return;
  }

  elements.list.innerHTML = responses
    .map((response) => {
      const answers = Array.isArray(response.answers) ? response.answers : [];
      const reward = response.rewardCustomerName || response.rewardCustomerId || "No reward customer saved";
      return `
        <article class="panel panel-pad feedback-result-card">
          <div class="feedback-result-heading">
            <div>
              <p class="kicker">Submitted ${escapeHtml(formatSubmittedAt(response.submittedAt))}</p>
              <h2>${escapeHtml(response.restaurantName || "Restaurant feedback")}</h2>
            </div>
            <p class="feedback-result-reward">Reward: ${escapeHtml(reward)}</p>
          </div>
          <div class="feedback-result-answers">
            ${
              answers.length
                ? answers
                  .map(
                    (answer) => `
                      <div class="feedback-result-answer">
                        <strong>${escapeHtml(answer.questionText)}</strong>
                        <span>${escapeHtml(answer.value || "No answer")}</span>
                      </div>
                    `
                  )
                  .join("")
                : '<p class="note">No answers were saved with this response.</p>'
            }
          </div>
        </article>
      `;
    })
    .join("");
}

async function loadFeedbackResults() {
  const url = new URL(window.location.href);
  const restaurantSlug = String(
    url.searchParams.get("restaurant") || url.searchParams.get("restaurantSlug") || ""
  ).trim();
  const accessCode = String(url.searchParams.get("code") || url.searchParams.get("accessCode") || "").trim();

  if (!restaurantSlug || !accessCode) {
    elements.summary.textContent = "This feedback link is missing the restaurant or access code.";
    showMessage("Please use the full feedback results link from CommunityVerse.", true);
    return;
  }

  try {
    const params = new URLSearchParams({ restaurantSlug, accessCode });
    const response = await fetch(`/api/feedback-responses?${params.toString()}`);
    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.ok === false) {
      throw new Error(data.error || "This feedback results link is not valid.");
    }

    const restaurantName = data.restaurant?.name || restaurantSlug;
    const responses = data.responses || [];
    elements.title.textContent = `${restaurantName} Feedback`;
    elements.summary.textContent = `${responses.length} response${responses.length === 1 ? "" : "s"} saved. Newest responses appear first.`;
    showMessage("");
    renderResponses(responses);
  } catch (error) {
    elements.summary.textContent = "Feedback results could not be loaded.";
    showMessage(error instanceof Error ? error.message : String(error), true);
    elements.list.innerHTML = "";
  }
}

loadFeedbackResults();
