(() => {
  const core = window.RestaurantChallengeCore;
  const restaurant = core.getRestaurantBySlug("americana");
  const query = new URLSearchParams(window.location.search);
  const demoMode = query.has("demo");
  const replayCustomerId = String(query.get("customerId") || "").trim();
  const replayCustomer = replayCustomerId ? core.getCustomerById(replayCustomerId) : null;

  const elements = {
    hero: document.getElementById("hero-panel"),
    start: document.getElementById("start-panel"),
    game: document.getElementById("game-panel"),
    result: document.getElementById("result-panel"),
  };

  const state = {
    feedback: null,
    isLocked: false,
    answerTimer: null,
    showProfileForm: false,
    resultBioExpanded: false,
    showGame: false,
  };

  const mobileGuestQuery = "(max-width: 960px)";
  const mobileVisibleGuestCount = 2;
  const desktopVisibleGuestCount = 3;
  const openingGuestIds = ["curtis-coolwater", "pastor-caleb-brooks", "ming-wu"];

  const openingMenuItems = [
    {
      name: "Route 66 Burger",
      image: "../assets/restaurant-challenge/restaurants/americana/route-66-burger.jpg",
    },
    {
      name: "All-Day Breakfast Platter",
      image: "../assets/restaurant-challenge/restaurants/americana/all-day-breakfast-platter.jpg",
    },
    {
      name: "Americana Mile-High Cherry Pie",
      image: "../assets/restaurant-challenge/restaurants/americana/americana-mile-high-cherry-pie.jpg",
    },
  ];

  const openerCopy =
    "Play a quick game of trivia, win a customer, and progress on the leaderboard!";

  function isMobileOpeningLayout() {
    return window.matchMedia(mobileGuestQuery).matches;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatGuestDisplayName(name) {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (parts.length < 2) {
      return escapeHtml(name);
    }

    return `${escapeHtml(parts.slice(0, -1).join(" "))}<br />${escapeHtml(parts[parts.length - 1])}`;
  }

  function getProfile() {
    return core.getActiveProfile();
  }

  function getOpeningCustomers() {
    return openingGuestIds
      .map((customerId) => core.getCustomerById(customerId))
      .filter((customer) => Boolean(customer && customer.image));
  }

  function getVisibleOpeningGuestCount() {
    return isMobileOpeningLayout()
      ? mobileVisibleGuestCount
      : desktopVisibleGuestCount;
  }

  function getDisplayedOpeningCustomers() {
    const featuredGuests = getOpeningCustomers();
    if (featuredGuests.length) {
      return featuredGuests.slice(0, getVisibleOpeningGuestCount());
    }
    return core
      .getCustomersForRestaurant("americana")
      .filter((customer) => customer.image && !customer.image.includes("customer-placeholder"))
      .slice(0, getVisibleOpeningGuestCount());
  }

  function getSession() {
    const session = core.getActiveSession();
    if (!session || session.restaurantSlug !== "americana") {
      return null;
    }
    return session;
  }

  function ensurePlayableProfile() {
    const existingProfile = getProfile();
    if (existingProfile) {
      if (
        existingProfile.isGuest &&
        (!String(existingProfile.restaurantName || "").trim() ||
          existingProfile.restaurantSlug === "guest-restaurant" ||
          String(existingProfile.restaurantName || "").trim() === "Guest Restaurant")
      ) {
        const restaurantName = core.generateGuestRestaurantName();
        const updatedProfile = core.updateProfile({
          ...existingProfile,
          restaurantName,
          restaurantSlug: core.slugify(restaurantName),
        });
        if (updatedProfile) {
          core.setActiveProfileId(updatedProfile.id);
          return updatedProfile;
        }
      }

      return existingProfile;
    }

    return core.createGuestProfile();
  }

  async function initializeAmericanaPage() {
    await core.whenReady();

    if (!getProfile()) {
      ensurePlayableProfile();
    }

    renderAll();
  }

  function renderHero(visible) {
    if (!visible) {
      elements.hero.classList.add("hidden");
      elements.hero.innerHTML = "";
      return;
    }

    elements.hero.classList.remove("hidden");
    elements.hero.innerHTML = `
      <img
        class="hero-banner-image"
        src="${restaurant.heroImage}"
        alt="Americana Diner hero artwork"
      />
    `;
  }

  function renderSetup() {
    const profile = getProfile();
    const session = getSession();
    const openingCustomers = getDisplayedOpeningCustomers();
    const safeOpeningCustomers = Array.isArray(openingCustomers) ? openingCustomers : [];
    const introCopy = replayCustomer
      ? `This is an invite-back visit for ${replayCustomer.name}. If you do better, they move up. If you do worse, the newer result replaces the old one.`
      : openerCopy;
    const introCopyMarkup = introCopy
      ? `<p class="copy opening-title-copy">${escapeHtml(introCopy)}</p>`
      : "";
    elements.start.innerHTML = `
      <div class="opening-start-shell">
        <div class="opening-start-heading">
          <h2 class="opening-title">The Americana Diner Game</h2>
          ${introCopyMarkup}
          ${
            replayCustomer
              ? `
                <p class="helper opening-start-helper opening-title-helper">
                  You invited <strong>${escapeHtml(replayCustomer.name)}</strong> back. Playing again can upgrade the customer, but a lower score will replace the earlier result.
                </p>
              `
              : ""
          }
        </div>

        <div class="opening-start-grid">
          <div class="opening-start-hero">
            <img
              class="hero-banner-image hero-banner-image-start"
              src="${restaurant.heroImage}"
              alt="Americana Diner hero artwork"
            />
          </div>

          <div class="opening-start-side opening-start-side-wide">
            <div class="opening-guest-stack">
              <div class="opening-guest-grid">
                ${safeOpeningCustomers
                  .map(
                    (customer) => `
                      <article class="opening-guest-card">
                        <img class="opening-guest-photo" src="${customer.image}" alt="${escapeHtml(customer.name)}" />
                        <div class="opening-guest-copy">
                          <p class="opening-guest-name">${formatGuestDisplayName(customer.name)}</p>
                        </div>
                      </article>
                    `
                  )
                  .join("")}
              </div>
            </div>
          </div>
        </div>

        <p class="opening-title-small opening-title-small-bottom">Can You Earn A New Regular Customer?</p>

        <div class="button-row opening-start-actions opening-start-actions-bottom">
          <button class="button button-hot" id="start-game-button" type="button">${replayCustomer ? "INVITE BACK" : "START THE GAME"}</button>
          ${
            replayCustomer
              ? `
                <a class="button button-muted" href="./?home=1">Cancel Invite Back</a>
                <a class="button button-muted" href="../restaurant/?hub=1">Back to Hub</a>
              `
              : profile && !profile.isGuest
                ? `
                  <a class="button button-muted" href="../restaurant/?hub=1">View My Restaurant</a>
                `
              : ""
          }
          ${
            session && !session.completed && !state.showGame
              ? `
                <button class="button button-muted" id="resume-game-button" type="button">Continue Current Game</button>
              `
              : ""
          }
        </div>
      </div>`;

    document.getElementById("start-game-button").addEventListener("click", () => {
      void startGame();
    });

    const resumeButton = document.getElementById("resume-game-button");
    if (resumeButton) {
      resumeButton.addEventListener("click", () => {
        state.showGame = true;
        renderAll();
      });
    }
  }

  function renderSetupFallback() {
    elements.start.innerHTML = `
      <div class="opening-start-shell">
        <div class="opening-start-heading">
          <h2 class="opening-title">The Americana Diner Game</h2>
          <p class="copy opening-title-copy">
            ${openerCopy}
          </p>
        </div>

        <div class="opening-start-grid">
          <div class="opening-start-hero">
            <img
              class="hero-banner-image hero-banner-image-start"
              src="${restaurant.heroImage}"
              alt="Americana Diner hero artwork"
            />
          </div>

          <div class="opening-start-side opening-start-side-wide">
            <div class="opening-guest-stack">
              <div class="opening-guest-grid">
                ${getDisplayedOpeningCustomers()
                  .map(
                    (customer) => `
                      <article class="opening-guest-card">
                        <img class="opening-guest-photo" src="${customer.image}" alt="${escapeHtml(customer.name)}" />
                        <div class="opening-guest-copy">
                          <p class="opening-guest-name">${formatGuestDisplayName(customer.name)}</p>
                        </div>
                      </article>
                    `
                  )
                  .join("")}
              </div>
            </div>
          </div>
        </div>

        <p class="opening-title-small opening-title-small-bottom">Can You Earn A New Regular Customer?</p>

        <div class="button-row opening-start-actions opening-start-actions-bottom">
          <button class="button button-hot" id="start-game-button" type="button">START THE GAME</button>
          <a class="button button-muted" href="../restaurant/?hub=1">Back to Hub</a>
        </div>
      </div>`;

    const startButton = document.getElementById("start-game-button");
    if (startButton) {
      startButton.addEventListener("click", () => {
        if (!getProfile()) {
          core.createGuestProfile();
        }

        startGame();
      });
    }

  }

  function renderStartPanel() {
    const session = getSession();
    if (session && session.completed) {
      state.showGame = false;
      elements.start.classList.add("hidden");
      elements.game.classList.add("hidden");
      elements.result.classList.remove("hidden");
      renderResultPanel(session);
      return;
    }

    if (session && !session.completed && state.showGame) {
      elements.start.classList.add("hidden");
      elements.game.classList.remove("hidden");
      elements.result.classList.add("hidden");
      renderGamePanel();
      return;
    }

    elements.start.classList.remove("hidden");
    elements.game.classList.add("hidden");
    elements.result.classList.add("hidden");
    state.showGame = false;
  }

  async function startGame() {
    await core.whenReady();

    const profile = ensurePlayableProfile();
    if (profile) {
      core.setActiveProfileId(profile.id);
    }

    const options = replayCustomer ? { customerId: replayCustomer.id } : {};
    const session = core.startNewSession("americana", options);
    if (!session) {
      window.alert("No available guests are ready for Americana right now. Please try again.");
      return;
    }
    state.feedback = null;
    state.isLocked = false;
    state.resultBioExpanded = false;
    state.showGame = true;
    renderAll();
    renderGamePanel();
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const gameTop = Math.max(0, elements.game.getBoundingClientRect().top + window.scrollY - 12);
        window.scrollTo({ top: gameTop, behavior: "smooth" });
      });
    });
  }

  function renderGamePanel() {
    const session = getSession();
    if (!session) {
      elements.game.classList.add("hidden");
      return;
    }

    if (session.completed) {
      elements.game.classList.add("hidden");
      renderResultPanel(session);
      return;
    }

    const displayQuestion = state.feedback ? state.feedback.question : session.questions[session.currentIndex];
    const displayNumber = state.feedback ? session.currentIndex : session.currentIndex + 1;
    const hasQuestionImage = Boolean(displayQuestion.image);
    const progressPercent = state.feedback
      ? ((session.currentIndex - 1) / session.questions.length) * 100
      : (session.currentIndex / session.questions.length) * 100;
    const customerBio = core.getCustomerBio(session.customer);

    elements.game.classList.remove("hidden");
    elements.start.classList.add("hidden");
    elements.result.classList.add("hidden");

    elements.game.innerHTML = `
      <div class="question-shell">
        <div class="section-actions" style="justify-content: space-between; align-items: center;">
          <div>
            <h2 class="section-title">Question ${displayNumber} of ${session.questions.length}</h2>
          </div>
          <div class="chip-row">
            <span class="chip gold">Score ${session.score}</span>
          </div>
        </div>

        <div class="hero-card question-customer-card" style="margin-top: 0;">
          <div class="customer-card-top question-customer-top">
            <img class="customer-avatar question-customer-avatar" src="${session.customer.image}" alt="${escapeHtml(session.customer.name)}" />
            <div>
              <p class="customer-name">${escapeHtml(session.customer.name)}</p>
              <p class="customer-bio">${escapeHtml(customerBio)}</p>
              <div class="chip-row" style="margin-top: 10px;">
                <span class="chip">Regular value ${core.formatCurrency(session.customer.regularValue)}</span>
                <span class="chip">Occasional value ${core.formatCurrency(session.customer.occasionalValue)}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="progress-track" aria-hidden="true">
          <div class="progress-bar" style="width: ${progressPercent}%"></div>
        </div>

        <div class="question-main-layout ${hasQuestionImage ? "" : "question-main-layout-no-image"}">
          ${
            hasQuestionImage
              ? `
                <div class="question-media-panel">
                  <img
                    class="question-photo question-photo-question"
                    src="${displayQuestion.image}"
                    alt="${escapeHtml(displayQuestion.imageAlt || displayQuestion.prompt)}"
                  />
                </div>
              `
              : ""
          }

          <div class="question-content-panel">
            <div class="question-card">
              <p class="question-text">${escapeHtml(displayQuestion.prompt)}</p>
            </div>

            <div class="answer-grid" id="answer-grid">
              ${displayQuestion.options
                .map(
                  (option, index) => `
                    <button class="button answer-button ${state.feedback ? (index === displayQuestion.correctIndex ? "correct" : state.feedback.selectedIndex === index && !state.feedback.isCorrect ? "wrong" : "") : ""}" data-answer="${index}" type="button" ${state.isLocked ? "disabled" : ""}>
                      ${escapeHtml(option)}
                    </button>
                  `
                )
                .join("")}
            </div>

            <p class="answer-feedback" id="answer-feedback">${state.feedback ? state.feedback.message : "Pick one answer to continue."}</p>
          </div>
        </div>
      </div>
    `;

    elements.game.querySelectorAll("[data-answer]").forEach((button) => {
      button.addEventListener("click", () => {
        if (state.isLocked) {
          return;
        }
        handleAnswer(Number(button.dataset.answer));
      });
    });
  }

  function handleAnswer(selectedIndex) {
    state.isLocked = true;
    const activeSession = getSession();
    const currentQuestion = activeSession ? activeSession.questions[activeSession.currentIndex] : null;
    const outcome = core.answerActiveSession(selectedIndex);

    state.feedback = {
      isCorrect: outcome.isCorrect,
      selectedIndex,
      question: currentQuestion || outcome.question,
      message: outcome.isCorrect
        ? "Nice choice. That answer helped the customer stay happy."
        : `Close, but not quite. The right answer was "${outcome.correctAnswer}".`,
    };

    renderGamePanel();

    state.answerTimer = window.setTimeout(() => {
      state.feedback = null;
      state.isLocked = false;
      state.answerTimer = null;

      const session = getSession();
      if (session && session.completed) {
        renderAll();
        return;
      }

      renderGamePanel();
    }, 750);
  }

  function resultMessage(session) {
    if (session.result === "regular") {
      return `${session.customer.name} is now a regular customer at your restaurant.`;
    }

    if (session.result === "occasional") {
      return `${session.customer.name} enjoyed the visit and may stop by occasionally.`;
    }

    return `${session.customer.name} was not impressed and will not be coming back.`;
  }

  function getBioPreview(bio, maxLength = 170) {
    const text = String(bio || "").trim();
    if (text.length <= maxLength) {
      return { text, isTruncated: false };
    }

    const searchStart = Math.max(0, maxLength - 28);
    const cutPoint = text.lastIndexOf(" ", maxLength);
    const fallbackCutPoint = text.lastIndexOf(" ", searchStart);
    const slicePoint = cutPoint > 0 ? cutPoint : fallbackCutPoint > 0 ? fallbackCutPoint : maxLength;

    return {
      text: `${text.slice(0, slicePoint).replace(/[.,;:!?-]+$/, "")}…`,
      isTruncated: true,
    };
  }

  function renderResultPanel(session) {
    const profile = getProfile();
    const summary = profile ? core.getProfileSummary(profile, "americana") : null;
    const isGuest = Boolean(profile && profile.isGuest);
    const resultLayoutMode = isGuest
      ? (state.showProfileForm ? "register-form" : "guest-prompt")
      : "return-actions";
    const label =
      session.result === "regular"
        ? "Regular Customer"
        : session.result === "occasional"
        ? "Occasional Customer"
          : "Lost Customer";
    const resultSummaryLabel =
      session.result === "regular"
        ? "Regular"
        : session.result === "occasional"
          ? "Occasional"
          : "Lost";
    const customerBio = core.getCustomerBio(session.customer);
    const customerBioPreview = getBioPreview(customerBio);
    const showFullBio = state.resultBioExpanded || !customerBioPreview.isTruncated;
    const resultHeadline =
      session.result === "regular"
        ? "Congratulations"
        : session.result === "occasional"
          ? "Nice work"
          : "Better luck next time";
    const resultSubheadline =
      session.result === "regular"
        ? "New Regular Customer"
        : session.result === "occasional"
          ? "New Occasional Customer"
          : "Customer Not Kept";

    elements.result.innerHTML = `
      <div class="result-screen result-screen-${resultLayoutMode}">
        <div class="result-top-layout">
          <div class="result-hero-panel">
            <img class="result-hero-image" src="${restaurant.heroImage}" alt="Americana Diner hero artwork" />
          </div>

          <div class="result-banner">
            <div class="result-celebration">
              <p class="result-celebration-kicker">${escapeHtml(resultHeadline)}</p>
              <h2 class="result-celebration-title">${escapeHtml(resultSubheadline)}</h2>
            </div>
            <div class="result-customer-spotlight">
              <img class="result-customer-image" src="${session.customer.image}" alt="${escapeHtml(session.customer.name)}" />
              <div class="result-customer-copy">
                <h2>${escapeHtml(session.customer.name)}</h2>
                <p class="customer-bio ${showFullBio ? "customer-bio-expanded" : ""}">${escapeHtml(showFullBio ? customerBio : customerBioPreview.text)}</p>
                ${
                  customerBioPreview.isTruncated
                    ? `<button class="text-button result-bio-toggle" id="toggle-bio-button" type="button">${showFullBio ? "Read Less" : "Read More"}</button>`
                    : ""
                }
                <p class="copy">${escapeHtml(resultMessage(session))}</p>
              </div>
            </div>
            <div class="result-metrics">
              <div class="result-metric-row">
                <div class="result-metric-card">
                  <span class="result-metric-label">Final score:</span>
                  <span class="result-metric-value">${session.score}/${session.questions.length}</span>
                </div>
                <div class="result-metric-card">
                  <span class="result-metric-label">Result:</span>
                  <span class="result-metric-value">${escapeHtml(resultSummaryLabel)}</span>
                </div>
              </div>
              <div class="result-metric-row">
                <div class="result-metric-card">
                  <span class="result-metric-label">Customer value:</span>
                  <span class="result-metric-value">${core.formatCurrency(session.result === "regular" ? session.customer.regularValue : session.result === "occasional" ? session.customer.occasionalValue : 0)}</span>
                </div>
                <div class="result-metric-card">
                  <span class="result-metric-label">Player sales:</span>
                  <span class="result-metric-value">${summary ? core.formatCurrency(summary.stats.estimatedSales) : core.formatCurrency(0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="divider"></div>
        ${
          isGuest && !state.showProfileForm
            ? `
              <div class="hero-card result-followup-card result-followup-card-guest" style="margin-top: 0; padding: 16px;">
                <p class="kicker" style="margin: 0 0 6px;">Save progress</p>
                <h3 class="section-title" style="font-size: 1.2rem; margin-bottom: 8px;">Do you want to register to save your progress before you try for another customer?</h3>
                <p class="copy" style="margin: 0 0 12px;">Registering keeps your stats, customers, and leaderboard spot on this device.</p>
                <div class="button-row">
                  <button class="button button-hot" id="register-now-button" type="button">Register Now</button>
                  <button class="button button-muted" id="guest-continue-button" type="button">Keep Playing as Guest</button>
                </div>
              </div>
              `
            : state.showProfileForm
              ? `
                <div class="hero-card result-followup-card result-followup-card-form" style="margin-top: 0; padding: 16px;">
                  <p class="kicker" style="margin: 0 0 6px;">Register</p>
                  <h3 class="section-title" style="font-size: 1.2rem; margin-bottom: 8px;">Save your progress</h3>
                  <form class="input-grid" id="profile-form" style="margin-top: 8px;">
                    <div class="field">
                      <label class="field-label" for="player-name">Player name</label>
                      <input class="input" id="player-name" name="playerName" type="text" placeholder="Tim" value="${escapeHtml(profile ? profile.playerName : "")}" />
                    </div>
                    <div class="field">
                      <label class="field-label" for="restaurant-name">Fictional restaurant name</label>
                      <input class="input" id="restaurant-name" name="restaurantName" type="text" placeholder="Tim's Roadhouse" value="${escapeHtml(profile ? profile.restaurantName : "")}" />
                    </div>
                    <p class="error hidden" id="profile-error" aria-live="polite"></p>
                    <div class="form-actions">
                      <button class="button button-hot" type="submit">Save And Continue</button>
                      <button class="button button-muted" id="cancel-register-button" type="button">Maybe Later</button>
                    </div>
                  </form>
                </div>
              `
              : `
                <div class="button-row result-followup-actions">
                  <button class="button button-hot" id="play-again-button" type="button">Play Again</button>
                  <a class="button button-muted" href="../restaurant/?hub=1">View My Restaurant</a>
                </div>
              `
        }
      </div>
    `;

    const toggleBioButton = document.getElementById("toggle-bio-button");
    if (toggleBioButton) {
      toggleBioButton.addEventListener("click", () => {
        state.resultBioExpanded = !state.resultBioExpanded;
        renderAll();
      });
    }

    if (isGuest && !state.showProfileForm) {
      document.getElementById("register-now-button").addEventListener("click", () => {
        state.showProfileForm = true;
        renderAll();
      });

      document.getElementById("guest-continue-button").addEventListener("click", () => {
        core.clearActiveSession();
        state.feedback = null;
        state.isLocked = false;
        renderAll();
        startGame();
      });
    } else if (state.showProfileForm) {
      const form = document.getElementById("profile-form");
      const error = document.getElementById("profile-error");
      const cancel = document.getElementById("cancel-register-button");

      cancel.addEventListener("click", () => {
        state.showProfileForm = false;
        renderAll();
      });

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const playerName = document.getElementById("player-name").value.trim();
        const restaurantName = document.getElementById("restaurant-name").value.trim();
        const validation = core.validateProfileInput(playerName, restaurantName);

        if (!validation.ok) {
          error.textContent = validation.message;
          error.classList.remove("hidden");
          return;
        }

        const activeProfile = getProfile();
        if (activeProfile) {
          core.updateProfile({
            ...activeProfile,
            playerName,
            restaurantName,
            restaurantSlug: core.slugify(restaurantName),
            isGuest: false,
          });
          core.setActiveProfileId(activeProfile.id);
        } else {
          core.createProfile(playerName, restaurantName);
        }

        state.showProfileForm = false;
        renderAll();
      });
    } else {
      document.getElementById("play-again-button").addEventListener("click", () => {
        core.clearActiveSession();
        state.feedback = null;
        state.isLocked = false;
        state.showProfileForm = false;
        state.resultBioExpanded = false;
        renderAll();
      });
    }
  }

  function renderAll() {
    try {
      renderHero(false);
      renderSetup();
      renderStartPanel();
    } catch (error) {
      console.error("Americana render failed, falling back to a simplified start screen.", error);
      renderHero(false);
      renderSetupFallback();
      elements.game.classList.add("hidden");
      elements.result.classList.add("hidden");
      elements.start.classList.remove("hidden");
    }
  }

  if (demoMode) {
    core.clearActiveSession();
    if (!getProfile()) {
      core.createProfile("Demo Player", "Tim's Roadhouse");
    }
  }

  renderAll();
  void initializeAmericanaPage();
})();
