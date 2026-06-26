(() => {
  const core = window.RestaurantChallengeCore;
  const query = new URLSearchParams(window.location.search);
  const customerId = String(query.get("customerId") || "").trim();
  let howToPlayReturnFocus = null;
  let howToPlayKeydownBound = false;
  const state = {
    showFeedbackRewardForm: false,
    feedbackRewardMessage: "",
    feedbackRewardError: "",
    feedbackSurveyAnswers: [],
  };

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function isSalesDemoRestaurant(restaurant) {
    return restaurant?.salesDemoMode === true || query.has("demo");
  }

  function markSalesDemoVisit() {
    try {
      window.sessionStorage?.setItem("restaurantSalesDemoCta", "1");
    } catch {
      // Session storage is optional; the topbar CTA still works on the current page.
    }
  }

  function updateSalesDemoCta(show, message = "Like the idea?") {
    document.querySelectorAll("[data-sales-demo-cta]").forEach((link) => {
      link.classList.toggle("hidden", !show);
    });
    document.querySelectorAll("[data-sales-demo-cta-note]").forEach((note) => {
      note.textContent = show ? message : "";
      note.classList.toggle("hidden", !show || !message);
    });
  }

  function updateSalesDemoBrand(show) {
    document.querySelectorAll(".brand").forEach((brand) => {
      if (!brand.dataset.defaultText) {
        brand.dataset.defaultText = brand.textContent;
      }
      brand.textContent = show ? "Restaurant Demo Game" : brand.dataset.defaultText;
    });
  }

  function getOpeningGameTitle(restaurant) {
    if (isSalesDemoRestaurant(restaurant)) {
      return "(YOUR RESTAURANT NAME HERE) Game";
    }
    return restaurant.publicGameName || `${restaurant.name} Game`;
  }

  function salesDemoCustomerCaption(customer) {
    const name = String(customer?.name || "").toLowerCase();
    if (name.includes("staff")) return "Build personal connections.";
    if (name.includes("owner") || name.includes("management")) return "Introduce Your People.";
    if (name.includes("superfan")) return "Encourage repeat visits.";
    if (name.includes("weekend") || name.includes("regular")) return "Reward loyal regulars.";
    return "";
  }

  function salesDemoCharacterName(customer) {
    const name = String(customer?.name || "");
    const lowerName = name.toLowerCase();
    if (lowerName.includes("owner") || lowerName.includes("management")) {
      return "Owners";
    }
    return name;
  }

  function openingCustomerCopyClass(customer, restaurant) {
    return isSalesDemoRestaurant(restaurant) && salesDemoCustomerCaption(customer)
      ? "opening-guest-copy opening-guest-copy-demo"
      : "opening-guest-copy";
  }

  function restaurantSlugFromPath() {
    const parts = window.location.pathname.split("/").map((part) => part.trim()).filter(Boolean);
    return parts[0] || "americana";
  }

  function isRestaurantPlayable(restaurant) {
    return Boolean(restaurant && restaurant.active !== false && restaurant.playable !== false);
  }

  function restaurantStartPath(restaurant) {
    return `/${restaurant.slug}/`;
  }

  function restaurantPlayPath(restaurant) {
    return `/${restaurant.slug}/play/`;
  }

  function dailyRotationOffset(restaurantSlug, count) {
    if (!count) {
      return 0;
    }

    const todayKey = new Date().toISOString().slice(0, 10);
    const seed = `${restaurantSlug || "restaurant"}-${todayKey}`;
    let hash = 0;
    for (let index = 0; index < seed.length; index += 1) {
      hash = (hash * 31 + seed.charCodeAt(index)) % 100000;
    }
    return hash % count;
  }

  function rotateCustomers(customers, restaurantSlug, count) {
    if (!customers.length) {
      return [];
    }

    const offset = dailyRotationOffset(restaurantSlug, customers.length);
    const rotated = customers.slice(offset).concat(customers.slice(0, offset));
    return rotated.slice(0, count);
  }

  function getOwnedCustomerIds(profile, restaurantSlug) {
    const collection = Array.isArray(profile?.customerCollection) ? profile.customerCollection : [];
    return new Set(
      collection
        .filter((entry) => !restaurantSlug || !entry.restaurantSlug || entry.restaurantSlug === restaurantSlug)
        .map((entry) => String(entry.customerId || ""))
        .filter(Boolean)
    );
  }

  function isPhotoReadyCustomer(customer) {
    return Boolean(customer?.image && !customer.image.includes("customer-placeholder"));
  }

  function getRestaurantAreaSlugs(restaurant) {
    const areaAliases = {
      douglasville: "douglas-county",
      "douglas-county": "douglasville",
      ga: "georgia",
      georgia: "georgia",
    };
    const sourceValues = [
      restaurant.areaSlug,
      restaurant.location,
      restaurant.description,
      restaurant.name,
      restaurant.publicGameName,
    ].filter(Boolean);
    const areaSlugs = new Set();

    sourceValues.forEach((value) => {
      const text = String(value || "");
      const parts = [text, ...text.split(/[,/|]+|\s+-\s+|\s+and\s+/i)];

      parts.forEach((part) => {
        const slug = core.slugify(part);
        if (slug) {
          areaSlugs.add(slug);
          slug.split("-").forEach((piece) => {
            if (piece.length >= 4) {
              areaSlugs.add(piece);
            }
          });
        }
        if (areaAliases[slug]) {
          areaSlugs.add(areaAliases[slug]);
        }
      });
    });

    return areaSlugs;
  }

  function customerMatchesArea(customer, areaSlugs) {
    if (!areaSlugs.size) {
      return false;
    }

    if (Array.isArray(customer.areaSlugs) && customer.areaSlugs.length) {
      return customer.areaSlugs
        .map((areaSlug) => core.slugify(areaSlug))
        .filter(Boolean)
        .some((customerAreaSlug) => {
          if (areaSlugs.has(customerAreaSlug)) {
            return true;
          }
          const customerPieces = customerAreaSlug.split("-");
          return [...areaSlugs].some(
            (areaSlug) =>
              areaSlug.length >= 4 &&
              (customerPieces.includes(areaSlug) ||
                areaSlug.split("-").some((piece) => piece.length >= 4 && customerPieces.includes(piece)))
          );
        });
    }

    const customerValues = [
      customer.areaSlug,
      customer.location,
      customer.questionPlace,
      customer.questionFact,
      customer.bio,
      customer.name,
      ...(Array.isArray(customer.tags) ? customer.tags : []),
    ].filter(Boolean);

    return customerValues.some((value) => {
      const text = String(value || "");
      const parts = [text, ...text.split(/[,/|]+|\s+-\s+|\s+and\s+/i)];
      return parts.some((part) => {
        const slug = core.slugify(part);
        if (!slug) {
          return false;
        }
        if (areaSlugs.has(slug)) {
          return true;
        }
        const slugPieces = slug.split("-");
        return [...areaSlugs].some(
          (areaSlug) =>
            areaSlug.length >= 4 &&
            (slugPieces.includes(areaSlug) || areaSlug.split("-").some((piece) => piece.length >= 4 && slugPieces.includes(piece)))
        );
      });
    });
  }

  function howToPlayModalHtml(salesDemoMode = false) {
    if (salesDemoMode) {
      return `
        <section class="how-to-play-modal hidden" id="how-to-play-modal" aria-hidden="true">
          <div class="how-to-play-backdrop" data-how-to-play-close></div>
          <div
            class="how-to-play-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="how-to-play-title"
            aria-describedby="how-to-play-summary"
          >
            <button class="how-to-play-close" type="button" data-how-to-play-close aria-label="Close benefits">Close</button>
            <p class="kicker">Restaurant Challenge</p>
            <h2 class="section-title" id="how-to-play-title">SEE THE BENEFITS</h2>
            <p class="copy" id="how-to-play-summary">
              In about 3 minutes, this demo shows how a custom trivia game can promote your menu, spotlight your team, encourage repeat visits, and collect feedback.
            </p>
            <div class="how-to-play-topics">
              <section class="how-to-play-topic how-to-play-topic-wide">
                <h3>WHAT YOU WILL SEE</h3>
                <ul>
                  <li>Menu photo questions that make featured items memorable.</li>
                  <li>Restaurant trivia that teaches people about your story, specials, and events.</li>
                  <li>Over 1,200 built-in trivia questions, plus custom questions about your restaurant.</li>
                  <li>Keeps guests engaged while they wait for their food.</li>
                  <li>Your own custom URL and branded game page.</li>
                  <li>Collectible characters that encourage guests to play again.</li>
                  <li>Feedback rewards that give people a reason to complete your survey.</li>
                </ul>
              </section>
              <section class="how-to-play-topic how-to-play-topic-wide sales-demo-audience-topic">
                <h3>GROW YOUR AUDIENCE</h3>
                <p>Players may discover your restaurant through online searches and, as CommunityVerse Games grows, while exploring other local restaurant games.</p>
              </section>
            </div>
          </div>
        </section>
      `;
    }

    return `
      <section class="how-to-play-modal hidden" id="how-to-play-modal" aria-hidden="true">
        <div class="how-to-play-backdrop" data-how-to-play-close></div>
        <div
          class="how-to-play-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="how-to-play-title"
          aria-describedby="how-to-play-summary"
        >
          <button class="how-to-play-close" type="button" data-how-to-play-close aria-label="Close How to Play">Close</button>
          <p class="kicker">Restaurant Challenge</p>
          <h2 class="section-title" id="how-to-play-title">HOW TO PLAY</h2>
          <p class="copy" id="how-to-play-summary">
            Restaurant Challenge is a quick 10-question trivia game. Play in about 3 minutes, unlock collectible characters, improve your trivia score, and compete on the leaderboards.
          </p>
          <div class="how-to-play-topics">
            <section class="how-to-play-topic how-to-play-topic-wide">
              <h3>THE QUICK VERSION</h3>
              <ul>
                <li>Answer 10 trivia questions.</li>
                <li>Unlock a character for your collection.</li>
                <li>Save your progress to keep characters and track your scores.</li>
                <li>Climb the trivia and net worth leaderboards.</li>
                <li>Optionally, build and grow a virtual restaurant.</li>
              </ul>
              <p>You can enjoy Restaurant Challenge simply as a trivia game, or you can explore the restaurant-building features later.</p>
            </section>
            <section class="how-to-play-topic">
              <h3>STEP 1: PLAY TRIVIA</h3>
              <p>Choose a restaurant game and answer 10 trivia questions.</p>
              <p>Questions may include:</p>
              <ul>
                <li>General trivia</li>
                <li>Questions about the restaurant</li>
                <li>Local community trivia</li>
                <li>State and national trivia</li>
              </ul>
              <p>Most games take about 3 minutes to complete.</p>
            </section>
            <section class="how-to-play-topic">
              <h3>STEP 2: UNLOCK CHARACTERS</h3>
              <p>Before each game begins, you will see the character you are playing for.</p>
              <p>The better your score, the more likely that character is to join your collection.</p>
              <p>Some characters are more valuable than others.</p>
              <p>Characters increase your collection, sales, and future restaurant value.</p>
            </section>
            <section class="how-to-play-topic">
              <h3>STEP 3: SAVE YOUR COLLECTION</h3>
              <p>When you unlock characters, you can save your collection and continue building it over time.</p>
              <p>Saving your progress allows you to:</p>
              <ul>
                <li>Keep characters you unlock</li>
                <li>Track your trivia scores</li>
                <li>Appear on the leaderboards</li>
                <li>Continue your collection on future visits</li>
              </ul>
              <p>An email address is optional.</p>
            </section>
            <section class="how-to-play-topic">
              <h3>STEP 4: IMPROVE YOUR TRIVIA RANKING</h3>
              <p>Your Trivia Percentage is based on your average trivia score across multiple games.</p>
              <p>The Trivia Leaderboard shows the highest average scores.</p>
              <p>Examples:</p>
              <ul>
                <li>10 correct answers = 100%</li>
                <li>8 correct answers = 80%</li>
                <li>6 correct answers = 60%</li>
              </ul>
              <p>A minimum of 4 games played is required before appearing on the Trivia % leaderboard.</p>
            </section>
            <section class="how-to-play-topic">
              <h3>STEP 5: BUILD A VIRTUAL RESTAURANT (OPTIONAL)</h3>
              <p>Many players enjoy collecting characters and competing on the trivia leaderboard.</p>
              <p>Others choose to build a virtual restaurant.</p>
              <p>Characters increase your restaurant's value and generate sales.</p>
              <p>You can expand from a Food Truck into a Local Landmark by unlocking characters, saving cash, and purchasing upgrades.</p>
            </section>
            <section class="how-to-play-topic">
              <h3>VIRTUAL GAME VALUES</h3>
              <p>All cash, sales, character values, and net worth figures are virtual game values used for gameplay and leaderboards.</p>
              <p>They have no real cash value.</p>
            </section>
            <section class="how-to-play-topic">
              <h3>DO I WIN REAL PRIZES?</h3>
              <p>Restaurant Challenge is primarily a trivia and character collection game.</p>
              <p>Most restaurants do not currently offer prizes.</p>
              <p>Some restaurants may choose to offer promotions, discounts, contests, or giveaways in the future.</p>
            </section>
            <section class="how-to-play-topic how-to-play-topic-wide">
              <h3>PLAY YOUR WAY</h3>
              <p>Some players enjoy Restaurant Challenge simply as a quick trivia game.</p>
              <p>Others enjoy collecting characters, competing on the trivia leaderboard, and building a virtual restaurant.</p>
              <p>Both ways are correct.</p>
            </section>
          </div>
          <button class="button button-primary how-to-play-return" type="button" data-how-to-play-close>Back to Restaurant Challenge</button>
        </div>
      </section>
    `;
  }

  function openHowToPlay() {
    const modal = document.getElementById("how-to-play-modal");
    if (!modal) {
      return;
    }

    howToPlayReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("how-to-play-open");

    requestAnimationFrame(() => {
      const closeButton = modal.querySelector("[data-how-to-play-close]");
      if (closeButton instanceof HTMLElement) {
        closeButton.focus();
      }
    });
  }

  function closeHowToPlay() {
    const modal = document.getElementById("how-to-play-modal");
    if (!modal) {
      return;
    }

    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("how-to-play-open");

    if (howToPlayReturnFocus instanceof HTMLElement) {
      howToPlayReturnFocus.focus();
    }
    howToPlayReturnFocus = null;
  }

  function bindHowToPlay() {
    const button = document.getElementById("start-how-to-play-button");
    if (button) {
      button.addEventListener("click", openHowToPlay);
    }

    const modal = document.getElementById("how-to-play-modal");
    if (modal) {
      modal.querySelectorAll("[data-how-to-play-close]").forEach((closeButton) => {
        closeButton.addEventListener("click", closeHowToPlay);
      });
    }

    if (!howToPlayKeydownBound) {
      howToPlayKeydownBound = true;
      document.addEventListener("keydown", (event) => {
        const activeModal = document.getElementById("how-to-play-modal");
        if (event.key === "Escape" && activeModal && !activeModal.classList.contains("hidden")) {
          closeHowToPlay();
        }
      });
    }
  }

  function getOpeningCustomers(restaurant) {
    const activeProfile = core.getActiveProfile?.() || null;
    const count = 4;
    const selectedCustomers = [];
    const selectedIds = new Set();
    const ownedCustomerIds = getOwnedCustomerIds(activeProfile, restaurant.slug);
    const allCustomers = Array.isArray(core.customers) ? core.customers : [];
    const areaSlugs = getRestaurantAreaSlugs(restaurant);
    const featuredIds = Array.isArray(restaurant.openingCustomerIds) ? restaurant.openingCustomerIds : [];

    function addCustomers(customers, options = {}) {
      const skipOwned = options.skipOwned !== false;
      customers.forEach((customer) => {
        if (selectedCustomers.length >= count || !isPhotoReadyCustomer(customer) || selectedIds.has(customer.id)) {
          return;
        }
        if (customer.feedbackRewardOnly) {
          return;
        }
        if (skipOwned && ownedCustomerIds.has(customer.id)) {
          return;
        }
        selectedCustomers.push(customer);
        selectedIds.add(customer.id);
      });
    }

    addCustomers(
      featuredIds
        .map((id) => core.getCustomerById(id))
        .filter(Boolean),
      { skipOwned: false }
    );

    if (selectedCustomers.length < count) {
      addCustomers(rotateCustomers(
        allCustomers.filter((customer) => customer.restaurant === restaurant.slug),
        restaurant.slug,
        allCustomers.length
      ));
    }

    if (selectedCustomers.length < count) {
      addCustomers(rotateCustomers(
        allCustomers.filter(
          (customer) =>
            customer.restaurant === "shared" &&
            customerMatchesArea(customer, areaSlugs)
        ),
        restaurant.slug,
        allCustomers.length
      ));
    }

    if (selectedCustomers.length < count && activeProfile) {
      addCustomers(core.getFeaturedGuestLineup(activeProfile, restaurant.slug, count));
    }

    if (selectedCustomers.length < count) {
      addCustomers(rotateCustomers(
        allCustomers.filter(
          (customer) =>
            customer.restaurant === "shared" &&
            (!Array.isArray(customer.areaSlugs) ||
              !customer.areaSlugs.length ||
              customerMatchesArea(customer, areaSlugs))
        ),
        restaurant.slug,
        allCustomers.length
      ));
    }

    return selectedCustomers.slice(0, count);
  }

  function renderFeedbackRewardCard(restaurant) {
    const profile = core.getActiveProfile?.() || null;
    const reward = core.getFeedbackRewardConfig?.(profile, restaurant.slug);
    if (!reward?.enabled || !reward.customer) {
      return "";
    }

    const statusMarkup = state.feedbackRewardMessage
      ? `<p class="helper feedback-reward-status" aria-live="polite">${escapeHtml(state.feedbackRewardMessage)}</p>`
      : reward.alreadyAwarded
        ? `<p class="helper feedback-reward-status">${escapeHtml(reward.customer.name)} is already in your collection.</p>`
        : "";
    const errorMarkup = state.feedbackRewardError
      ? `<p class="error feedback-reward-error" aria-live="polite">${escapeHtml(state.feedbackRewardError)}</p>`
      : "";

    if (reward.alreadyAwarded && !state.feedbackRewardMessage) {
      return `
        <div class="hero-card feedback-reward-card">
          <div class="feedback-reward-copy">
            <p class="kicker">Feedback Reward</p>
            <h3 class="section-title">${escapeHtml(reward.customer.name)} is in your collection.</h3>
            ${statusMarkup}
          </div>
        </div>
      `;
    }

    const surveyQuestions = (restaurant.feedbackSurveyQuestions || []).filter((question) => question.active !== false);
    const salesDemoMode = isSalesDemoRestaurant(restaurant);
    const feedbackKicker = salesDemoMode ? "Feedback Demo" : "Optional Feedback Reward";
    const feedbackTitle = salesDemoMode
      ? reward.prompt
      : `Share quick feedback for ${restaurant.name}.`;
    const feedbackBody = salesDemoMode
      ? "Players unlock a collectible character and a leaderboard bonus after completing your survey, giving guests a clear reason to share feedback."
      : reward.prompt;
    const feedbackButtonText = salesDemoMode ? "Try Feedback Demo" : "Give Feedback";
    const feedbackSubmitText = salesDemoMode ? "Send Feedback & Claim Character" : "Send Feedback & Claim Customer";
    const feedbackRewardKind = salesDemoMode ? "character" : "customer";
    const feedbackSurveyIntro = "Create your own survey questions using ratings, Yes/No, multiple choice, 1-5 scale, or written responses. View your survey results anytime in your private dashboard.";

    return `
      <div class="hero-card feedback-reward-card">
        <div class="feedback-reward-copy">
          <p class="kicker">${escapeHtml(feedbackKicker)}</p>
          <h3 class="section-title">${escapeHtml(feedbackTitle)}</h3>
          <p class="copy">${escapeHtml(feedbackBody)}</p>
        </div>
        <div class="feedback-reward-customer">
          <img class="feedback-reward-photo" src="${escapeHtml(reward.customer.image)}" alt="${escapeHtml(reward.customer.name)}" />
          <div>
            <p class="customer-reveal-rarity">${escapeHtml(reward.customer.rarity || "Special")} ${escapeHtml(feedbackRewardKind)}</p>
            <strong>${escapeHtml(reward.customer.name)}</strong>
          </div>
        </div>
        ${
          state.showFeedbackRewardForm || state.feedbackRewardError
            ? `
              <form class="feedback-reward-form" id="feedback-reward-form">
                ${salesDemoMode ? `<p class="feedback-survey-demo-intro">${escapeHtml(feedbackSurveyIntro)}</p>` : ""}
                ${salesDemoMode ? `<p class="feedback-survey-demo-example">Examples of questions your restaurant could ask:</p>` : ""}
                ${renderFeedbackSurveyFields(surveyQuestions, { showRequiredText: !salesDemoMode })}
                ${errorMarkup}
                ${statusMarkup}
                <div class="button-row">
                  <button class="button button-hot" id="feedback-reward-submit" type="submit">${escapeHtml(feedbackSubmitText)}</button>
                  <button class="button button-muted" id="feedback-reward-cancel" type="button">Maybe Later</button>
                </div>
              </form>
            `
            : `
              ${statusMarkup}
              <div class="button-row">
                <button class="button button-muted" id="feedback-reward-open" type="button">${escapeHtml(feedbackButtonText)}</button>
              </div>
            `
        }
      </div>
    `;
  }

  function renderFeedbackSurveyFields(questions, options = {}) {
    const showRequiredText = options.showRequiredText !== false;
    const surveyQuestions = Array.isArray(questions) && questions.length
      ? questions
      : [{
          id: "quick-feedback",
          type: "text",
          prompt: "What should the restaurant know?",
          required: true,
          choices: [],
        }];

    return surveyQuestions.map((question) => {
      const requiredText = showRequiredText && question.required !== false ? " required" : "";
      const currentValue = getFeedbackSurveyAnswerValue(question.id);
      const label = `<label class="field-label" for="feedback-question-${escapeHtml(question.id)}">${escapeHtml(question.prompt)}${requiredText}</label>`;
      if (question.type === "rating") {
        return `
          <div class="feedback-survey-question" data-question-id="${escapeHtml(question.id)}" data-question-type="rating" data-question-text="${escapeHtml(question.prompt)}">
            ${label}
            <select class="input feedback-survey-answer" id="feedback-question-${escapeHtml(question.id)}">
              <option value="">Choose a rating</option>
              <option value="5" ${currentValue === "5" ? "selected" : ""}>5 - Great</option>
              <option value="4" ${currentValue === "4" ? "selected" : ""}>4 - Good</option>
              <option value="3" ${currentValue === "3" ? "selected" : ""}>3 - Okay</option>
              <option value="2" ${currentValue === "2" ? "selected" : ""}>2 - Not great</option>
              <option value="1" ${currentValue === "1" ? "selected" : ""}>1 - Poor</option>
            </select>
          </div>
        `;
      }
      if (question.type === "yesno") {
        return `
          <div class="feedback-survey-question" data-question-id="${escapeHtml(question.id)}" data-question-type="yesno" data-question-text="${escapeHtml(question.prompt)}">
            ${label}
            <select class="input feedback-survey-answer" id="feedback-question-${escapeHtml(question.id)}">
              <option value="">Choose one</option>
              <option value="Yes" ${currentValue === "Yes" ? "selected" : ""}>Yes</option>
              <option value="No" ${currentValue === "No" ? "selected" : ""}>No</option>
            </select>
          </div>
        `;
      }
      if (question.type === "choice") {
        return `
          <div class="feedback-survey-question" data-question-id="${escapeHtml(question.id)}" data-question-type="choice" data-question-text="${escapeHtml(question.prompt)}">
            ${label}
            <select class="input feedback-survey-answer" id="feedback-question-${escapeHtml(question.id)}">
              <option value="">Choose one</option>
              ${(question.choices || []).map((choice) => `<option value="${escapeHtml(choice)}" ${currentValue === String(choice) ? "selected" : ""}>${escapeHtml(choice)}</option>`).join("")}
            </select>
          </div>
        `;
      }
      return `
        <div class="feedback-survey-question" data-question-id="${escapeHtml(question.id)}" data-question-type="text" data-question-text="${escapeHtml(question.prompt)}">
          ${label}
          <textarea class="input feedback-reward-textarea feedback-survey-answer" id="feedback-question-${escapeHtml(question.id)}" maxlength="1000" rows="4" placeholder="Write your answer">${escapeHtml(currentValue)}</textarea>
        </div>
      `;
    }).join("");
  }

  function getFeedbackSurveyAnswerValue(questionId) {
    const answer = state.feedbackSurveyAnswers.find(
      (item) => String(item.questionId || "") === String(questionId || "")
    );
    return String(answer?.value || "");
  }

  function collectFeedbackSurveyAnswers() {
    return [...document.querySelectorAll(".feedback-survey-question")].map((row) => ({
      questionId: row.dataset.questionId || "",
      questionText: row.dataset.questionText || "",
      type: row.dataset.questionType || "text",
      value: row.querySelector(".feedback-survey-answer")?.value.trim() || "",
    }));
  }

  function ensureFeedbackProfile() {
    const activeProfile = core.getActiveProfile?.();
    if (activeProfile) {
      core.setActiveProfileId?.(activeProfile.id);
      return activeProfile;
    }
    return core.createGuestProfile?.({ entryPoint: query.get("entry") }) || null;
  }

  function bindFeedbackRewardCard(restaurant) {
    const openButton = document.getElementById("feedback-reward-open");
    if (openButton) {
      openButton.addEventListener("click", () => {
        state.showFeedbackRewardForm = true;
        state.feedbackRewardError = "";
        state.feedbackRewardMessage = "";
        state.feedbackSurveyAnswers = [];
        renderRestaurantStart(restaurant);
      });
    }

    const cancelButton = document.getElementById("feedback-reward-cancel");
    if (cancelButton) {
      cancelButton.addEventListener("click", () => {
        state.showFeedbackRewardForm = false;
        state.feedbackRewardError = "";
        state.feedbackSurveyAnswers = [];
        renderRestaurantStart(restaurant);
      });
    }

    const form = document.getElementById("feedback-reward-form");
    if (!form) {
      return;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitButton = document.getElementById("feedback-reward-submit");
      const originalSubmitText = submitButton?.textContent || "Send Feedback & Claim Customer";
      let didRedraw = false;
      const answers = collectFeedbackSurveyAnswers();
      state.feedbackSurveyAnswers = answers;
      if (!answers.some((answer) => answer.value)) {
        state.feedbackRewardError = "Please answer the survey before claiming this reward.";
        renderRestaurantStart(restaurant);
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      try {
        ensureFeedbackProfile();
        void Promise.resolve(core.submitFeedbackSurveyResponse?.(restaurant.slug, answers)).catch((submitError) => {
          console.warn("Feedback survey submission will retry through normal profile sync if needed.", submitError);
        });

        const outcome = core.awardFeedbackReward?.(restaurant.slug, {
          message: answers.map((answer) => `${answer.questionText}: ${answer.value}`).join("\n"),
        });
        if (!outcome?.ok) {
          state.feedbackRewardError = outcome?.message || "Unable to claim this reward right now.";
          renderRestaurantStart(restaurant);
          didRedraw = true;
          return;
        }

        void Promise.resolve(core.syncActiveProfile?.()).catch(() => {
          // The normal profile sync path will try again later.
        });

        state.showFeedbackRewardForm = false;
        state.feedbackRewardError = "";
        state.feedbackSurveyAnswers = [];
        state.feedbackRewardMessage = salesDemoMode
          ? `${outcome.customer?.name || "This character"} has joined your character collection.`
          : outcome.message || `${outcome.customer?.name || "This customer"} has joined your collection.`;
        renderRestaurantStart(restaurant);
        didRedraw = true;
      } catch (error) {
        console.error("Feedback reward display failed.", error);
        state.feedbackRewardError = error instanceof Error ? error.message : "Unable to claim this reward right now.";
        try {
          renderRestaurantStart(restaurant);
          didRedraw = true;
        } catch (renderError) {
          console.error("Feedback reward error display failed.", renderError);
        }
      } finally {
        if (!didRedraw && submitButton?.isConnected) {
          submitButton.disabled = false;
          submitButton.textContent = originalSubmitText;
        }
      }
    });
  }

  function renderUnavailable(slug) {
    const panel = document.querySelector(".opening-start-panel");
    if (!panel) {
      return;
    }

    panel.innerHTML = `
      <div class="opening-start-shell">
        <div class="opening-start-heading">
          <p class="kicker" style="margin: 0 0 4px;">Restaurant Challenge Trivia</p>
          <h2 class="opening-title">Restaurant unavailable</h2>
          <p class="copy opening-title-copy">This restaurant is not available to play right now.</p>
        </div>
        <div class="button-row opening-start-actions opening-start-actions-bottom">
          <a class="button button-muted" href="/restaurant/">Choose Another Restaurant</a>
        </div>
      </div>
    `;
    panel.classList.remove("hidden");
    document.title = "Restaurant Unavailable | CommunityVerse Games";
    console.warn(`Restaurant Challenge restaurant is unavailable: ${slug}`);
  }

  function renderRestaurantStart(restaurant) {
    const panel = document.querySelector(".opening-start-panel");
    if (!panel) {
      return;
    }

    const activeProfile = core.getActiveProfile?.() || null;
    const openingCustomers = getOpeningCustomers(restaurant);
    const playHref = customerId
      ? `${restaurantPlayPath(restaurant)}?fresh=1&customerId=${encodeURIComponent(customerId)}`
      : `${restaurantPlayPath(restaurant)}?fresh=1`;
    const salesDemoMode = isSalesDemoRestaurant(restaurant);
    const showMyRestaurantButton = !salesDemoMode && Boolean(activeProfile || customerId);
    const openerCopy = salesDemoMode
      ? "Discover how a custom 3-minute trivia game can promote your menu, engage guests, and encourage repeat visits."
      : restaurant.openingCopy ||
        "Play a quick game of trivia, unlock a character, and progress on the leaderboard!";
    const demoExpectationLine = "In this demo you'll see: menu photo questions, restaurant trivia, collectible characters, and feedback surveys.";
    const openingQuestion = salesDemoMode
      ? ""
      : "Can You Unlock A New Character For Your Collection?";
    const startButtonText = customerId
      ? "INVITE BACK"
      : salesDemoMode
        ? "PLAY THE THREE MINUTE DEMO"
        : "START THE GAME";
    const howToPlayText = salesDemoMode ? "See the Benefits" : "How to Play";
    const gameTitle = getOpeningGameTitle(restaurant);

    document.title = `${gameTitle} | CommunityVerse Games`;
    updateSalesDemoBrand(salesDemoMode);

    panel.innerHTML = `
      <div class="opening-start-shell">
        <div class="opening-start-heading">
          <p class="kicker" style="margin: 0 0 4px;">Restaurant Challenge Trivia</p>
          <h2 class="opening-title">${escapeHtml(gameTitle)}</h2>
          <p class="copy opening-title-copy">${escapeHtml(openerCopy)}</p>
          ${
            customerId
              ? `
                <p class="helper opening-start-helper opening-title-helper" id="invite-copy">
                  You invited a character back. Complete the round to try to upgrade them.
                </p>
              `
              : ""
          }
        </div>

        <div class="opening-start-grid">
          <div class="opening-start-hero">
            <img
              class="hero-banner-image hero-banner-image-start"
              src="${escapeHtml(restaurant.heroImage || restaurant.logoSquare || "/assets/restaurant-challenge/restaurants/americana/americana-diner-hero.jpg")}"
              alt="${escapeHtml(restaurant.name)} hero artwork"
            />
          </div>

          <div class="opening-start-side opening-start-side-wide">
            <div class="opening-guest-stack">
              ${salesDemoMode ? `<p class="opening-guest-section-title">Collectible Characters</p>` : ""}
              <div class="opening-guest-grid">
                ${openingCustomers
                  .map(
                    (customer) => `
                      <article class="opening-guest-card ${salesDemoMode ? "opening-guest-card-demo" : ""}">
                        <img class="opening-guest-photo" src="${escapeHtml(customer.image)}" alt="${escapeHtml(customer.name)}" />
                        <div class="${openingCustomerCopyClass(customer, restaurant)}">
                          <p class="opening-guest-name">${escapeHtml(salesDemoMode ? salesDemoCharacterName(customer) : customer.name)}</p>
                          ${
                            salesDemoMode && salesDemoCustomerCaption(customer)
                              ? `<p class="opening-guest-caption">${escapeHtml(salesDemoCustomerCaption(customer))}</p>`
                              : ""
                          }
                        </div>
                      </article>
                    `
                  )
                  .join("")}
              </div>
            </div>
          </div>
        </div>

        ${openingQuestion ? `<p class="opening-title-small opening-title-small-bottom">${escapeHtml(openingQuestion)}</p>` : ""}

        <div class="button-row opening-start-actions opening-start-actions-bottom">
          <a class="button button-hot" id="start-game-button" href="${escapeHtml(playHref)}">${escapeHtml(startButtonText)}</a>
          ${
            showMyRestaurantButton
              ? `<a class="button button-muted" href="/restaurant/?hub=1">View My Restaurant</a>`
              : ""
          }
          <button class="button button-muted" id="start-how-to-play-button" type="button">${escapeHtml(howToPlayText)}</button>
        </div>
        ${salesDemoMode ? `<p class="sales-demo-expectation">${escapeHtml(demoExpectationLine)}</p>` : ""}
        ${renderFeedbackRewardCard(restaurant)}
      </div>
      ${howToPlayModalHtml(salesDemoMode)}
    `;
    panel.classList.remove("hidden");
    bindHowToPlay();
    bindFeedbackRewardCard(restaurant);
    if (salesDemoMode) {
      markSalesDemoVisit();
      updateSalesDemoCta(true, "See your own restaurant brought to life.");
    } else {
      updateSalesDemoCta(false);
    }

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.href = `https://communityversegames.com${restaurantStartPath(restaurant)}`;
    }
  }

  async function initializeRestaurantStart() {
    await core.whenReady();
    const slug = restaurantSlugFromPath();
    const restaurant = core.getRestaurantBySlug(slug);
    if (!isRestaurantPlayable(restaurant)) {
      renderUnavailable(slug);
      return;
    }

    core.applyRestaurantTheme?.(restaurant);
    renderRestaurantStart(restaurant);
  }

  void initializeRestaurantStart();
})();
