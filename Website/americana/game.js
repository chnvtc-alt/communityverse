(() => {
  const core = window.RestaurantChallengeCore;
  function getRestaurantSlugFromPath() {
    const parts = window.location.pathname.split("/").map((part) => part.trim()).filter(Boolean);
    return parts[0] || "americana";
  }

  let restaurantSlug = getRestaurantSlugFromPath();
  let restaurant = core.getRestaurantBySlug(restaurantSlug) || core.getRestaurantBySlug("americana");
  const query = new URLSearchParams(window.location.search);
  const demoMode = query.has("demo");
  const freshMode = query.has("fresh");
  const playMode = window.location.pathname.includes("/play");
  const autoPlayMode = query.get("play") === "1";
  const replayCustomerId = String(query.get("customerId") || "").trim();
  let replayCustomer = null;
  const RESULT_VISIBLE_SESSION_KEY = `${restaurantSlug}_result_visible_session_v1`;
  const resultVisibleSessionState = {
    sessionId: "",
  };
  let howToPlayReturnFocus = null;
  let howToPlayKeydownBound = false;

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
    registrationMessage: "",
    emailInfoExpanded: false,
    resultBioExpanded: false,
    showFeedbackRewardForm: false,
    feedbackRewardMessage: "",
    feedbackRewardError: "",
    feedbackSurveyAnswers: [],
    showGame: false,
  };

  const mobileGuestQuery = "(max-width: 960px)";
  const mobileVisibleGuestCount = 2;
  const desktopVisibleGuestCount = 3;
  const answerFeedbackDelayMs = 1500;
  const fallbackOpeningGuestIds = ["curtis-coolwater", "pastor-caleb-brooks", "ming-wu"];

  const openingMenuItems = [
    {
      name: "Route 66 Burger",
      image: "/assets/restaurant-challenge/restaurants/americana/route-66-burger.jpg",
    },
    {
      name: "All-Day Breakfast Platter",
      image: "/assets/restaurant-challenge/restaurants/americana/all-day-breakfast-platter.jpg",
    },
    {
      name: "Americana Mile-High Cherry Pie",
      image: "/assets/restaurant-challenge/restaurants/americana/americana-mile-high-cherry-pie.jpg",
    },
  ];

  function restaurantBasePath() {
    return `/${restaurantSlug}/`;
  }

  function restaurantPlayPath() {
    return `/${restaurantSlug}/play/`;
  }

  function getGameTitle() {
    return restaurant?.publicGameName || `${restaurant?.name || "Restaurant"} Game`;
  }

  function getOpenerCopy() {
    if (isSalesDemoMode()) {
      return "Discover how a custom 3-minute trivia game can promote your menu, engage guests, and encourage repeat visits.";
    }
    return restaurant?.openingCopy || "Play a quick game of trivia, win a customer, and progress on the leaderboard!";
  }

  function getHeroImage() {
    return restaurant?.heroImage || restaurant?.logoSquare || "/assets/restaurant-challenge/restaurants/americana/americana-diner-hero.jpg";
  }

  function getHeroAlt() {
    return `${restaurant?.name || "Restaurant"} hero artwork`;
  }

  function isRestaurantPlayable() {
    return Boolean(restaurant && restaurant.active !== false && restaurant.playable !== false);
  }

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

  function isSalesDemoMode() {
    return restaurant?.salesDemoMode === true;
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

  function openingCustomerCopyClass(customer) {
    return isSalesDemoMode() && salesDemoCustomerCaption(customer)
      ? "opening-guest-copy opening-guest-copy-demo"
      : "opening-guest-copy";
  }

  function getOwnedCustomerIds(profile, targetRestaurantSlug) {
    const collection = Array.isArray(profile?.customerCollection) ? profile.customerCollection : [];
    return new Set(
      collection
        .filter((entry) => {
          if (!targetRestaurantSlug) {
            return true;
          }

          const credits = entry?.restaurantCredits;
          if (credits && typeof credits === "object" && credits[targetRestaurantSlug]) {
            return true;
          }

          return !credits && (!entry.restaurantSlug || entry.restaurantSlug === targetRestaurantSlug);
        })
        .map((entry) => String(entry.customerId || ""))
        .filter(Boolean)
    );
  }

  function isPhotoReadyCustomer(customer) {
    return Boolean(customer?.image && !customer.image.includes("customer-placeholder"));
  }

  function dailyRotationOffset(targetRestaurantSlug, count) {
    if (!count) {
      return 0;
    }

    const todayKey = new Date().toISOString().slice(0, 10);
    const seed = `${targetRestaurantSlug || "restaurant"}-${todayKey}`;
    let hash = 0;
    for (let index = 0; index < seed.length; index += 1) {
      hash = (hash * 31 + seed.charCodeAt(index)) % 100000;
    }
    return hash % count;
  }

  function rotateCustomers(customers, targetRestaurantSlug, count) {
    if (!customers.length) {
      return [];
    }

    const offset = dailyRotationOffset(targetRestaurantSlug, customers.length);
    const rotated = customers.slice(offset).concat(customers.slice(0, offset));
    return rotated.slice(0, count);
  }

  function getRestaurantAreaSlugs(targetRestaurant) {
    const areaAliases = {
      douglasville: "douglas-county",
      "douglas-county": "douglasville",
      ga: "georgia",
      georgia: "georgia",
    };
    const sourceValues = [
      targetRestaurant?.areaSlug,
      targetRestaurant?.location,
      targetRestaurant?.description,
      targetRestaurant?.name,
      targetRestaurant?.publicGameName,
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
            Restaurant Challenge is a quick 10-question trivia game. Play in about 3 minutes, earn collectible customers, improve your trivia score, and compete on the leaderboards.
          </p>
          <div class="how-to-play-topics">
            <section class="how-to-play-topic how-to-play-topic-wide">
              <h3>THE QUICK VERSION</h3>
              <ul>
                <li>Answer 10 trivia questions.</li>
                <li>Earn a customer for your collection.</li>
                <li>Save your progress to keep customers and track your scores.</li>
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
              <h3>STEP 2: EARN CUSTOMERS</h3>
              <p>Before each game begins, you will see the customer you are playing for.</p>
              <p>The better your score, the more likely that customer is to join your collection.</p>
              <p>Some customers are more valuable than others.</p>
              <p>Customers increase your collection, sales, and future restaurant value.</p>
            </section>
            <section class="how-to-play-topic">
              <h3>STEP 3: SAVE YOUR COLLECTION</h3>
              <p>When you earn customers, you can save your collection and continue building it over time.</p>
              <p>Saving your progress allows you to:</p>
              <ul>
                <li>Keep customers you earn</li>
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
              <p>Many players enjoy collecting customers and competing on the trivia leaderboard.</p>
              <p>Others choose to build a virtual restaurant.</p>
              <p>Customers increase your restaurant's value and generate sales.</p>
              <p>You can expand from a Food Truck into a Local Landmark by earning customers, saving cash, and purchasing upgrades.</p>
            </section>
            <section class="how-to-play-topic">
              <h3>VIRTUAL GAME VALUES</h3>
              <p>All cash, sales, customer values, and net worth figures are virtual game values used for gameplay and leaderboards.</p>
              <p>They have no real cash value.</p>
            </section>
            <section class="how-to-play-topic">
              <h3>DO I WIN REAL PRIZES?</h3>
              <p>Restaurant Challenge is primarily a trivia and customer collection game.</p>
              <p>Most restaurants do not currently offer prizes.</p>
              <p>Some restaurants may choose to offer promotions, discounts, contests, or giveaways in the future.</p>
            </section>
            <section class="how-to-play-topic how-to-play-topic-wide">
              <h3>PLAY YOUR WAY</h3>
              <p>Some players enjoy Restaurant Challenge simply as a quick trivia game.</p>
              <p>Others enjoy collecting customers, competing on the trivia leaderboard, and building a virtual restaurant.</p>
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
    document.querySelectorAll("[data-how-to-play-button]").forEach((button) => {
      button.addEventListener("click", openHowToPlay);
    });

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

  function removeHowToPlayModals() {
    document.querySelectorAll("#how-to-play-modal").forEach((modal) => {
      modal.remove();
    });
    document.body.classList.remove("how-to-play-open");
    howToPlayReturnFocus = null;
  }

  function getProfile() {
    return core.getActiveProfile();
  }

  function getOpeningCustomers() {
    const count = getVisibleOpeningGuestCount();
    const profile = getProfile();
    const selectedCustomers = [];
    const selectedIds = new Set();
    const ownedCustomerIds = getOwnedCustomerIds(profile, restaurantSlug);
    const allCustomers = Array.isArray(core.customers) ? core.customers : [];
    const areaSlugs = getRestaurantAreaSlugs(restaurant);
    const configuredGuestIds = Array.isArray(restaurant?.openingCustomerIds)
      ? restaurant.openingCustomerIds
      : [];

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
      configuredGuestIds
        .map((customerId) => core.getCustomerById(customerId))
        .filter(Boolean),
      { skipOwned: false }
    );

    if (selectedCustomers.length < count) {
      addCustomers(rotateCustomers(
        allCustomers.filter((customer) => customer.restaurant === restaurantSlug),
        restaurantSlug,
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
        restaurantSlug,
        allCustomers.length
      ));
    }

    if (selectedCustomers.length < count && profile) {
      addCustomers(core.getFeaturedGuestLineup(profile, restaurantSlug, count));
    }

    if (selectedCustomers.length < count && restaurantSlug === "americana") {
      addCustomers(
        fallbackOpeningGuestIds
          .map((customerId) => core.getCustomerById(customerId))
          .filter(Boolean),
        { skipOwned: false }
      );
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
        restaurantSlug,
        allCustomers.length
      ));
    }

    return selectedCustomers.slice(0, count);
  }

  function getVisibleOpeningGuestCount() {
    return isMobileOpeningLayout()
      ? mobileVisibleGuestCount
      : desktopVisibleGuestCount;
  }

  function getDisplayedOpeningCustomers() {
    const featuredGuests = getOpeningCustomers();
    if (featuredGuests.length) {
      return featuredGuests;
    }
    return [];
  }

  function getSession() {
    const session = core.getActiveSession();
    if (!session || session.restaurantSlug !== restaurantSlug) {
      return null;
    }
    return session;
  }

  function shouldResumeQuestions(session) {
    return Boolean(session && !session.completed && (session.hasStarted || session.currentIndex > 0));
  }

  function getSessionStorage() {
    try {
      return window.sessionStorage || null;
    } catch (error) {
      return null;
    }
  }

  function getResultVisibleSessionId() {
    try {
      return resultVisibleSessionState.sessionId || getSessionStorage()?.getItem(RESULT_VISIBLE_SESSION_KEY) || "";
    } catch (error) {
      return resultVisibleSessionState.sessionId || "";
    }
  }

  function setResultVisibleSessionId(sessionId) {
    resultVisibleSessionState.sessionId = String(sessionId || "");
    try {
      getSessionStorage()?.setItem(RESULT_VISIBLE_SESSION_KEY, resultVisibleSessionState.sessionId);
    } catch (error) {
      // Keep the value in memory if persistent storage is blocked.
    }
  }

  function clearResultVisibleSessionId() {
    resultVisibleSessionState.sessionId = "";
    try {
      getSessionStorage()?.removeItem(RESULT_VISIBLE_SESSION_KEY);
    } catch (error) {
      // Keep going even if session storage is blocked.
    }
  }

  function getCollectionEntryForSession(session) {
    const profile = getProfile();
    const collection = Array.isArray(profile?.customerCollection) ? profile.customerCollection : [];
    return collection.find(
      (entry) => entry.customerId === session?.customer?.id
    ) || null;
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
          restaurantNameUpdatedAt: new Date().toISOString(),
        });
        if (updatedProfile) {
          core.setActiveProfileId(updatedProfile.id);
          return updatedProfile;
        }
      }

      return existingProfile;
    }

    return core.createGuestProfile({ entryPoint: query.get("entry") });
  }

  async function initializeRestaurantPage() {
    await core.whenReady();
    restaurantSlug = getRestaurantSlugFromPath();
    restaurant = core.getRestaurantBySlug(restaurantSlug);
    replayCustomer = replayCustomerId ? core.getCustomerById(replayCustomerId) : null;

    if (!isRestaurantPlayable()) {
      renderUnavailableRestaurant();
      return;
    }

    core.applyRestaurantTheme?.(restaurant);

    const existingSession = getSession();
    const freshInviteCustomerChanged = Boolean(
      freshMode &&
        replayCustomerId &&
        existingSession &&
        !existingSession.completed &&
        existingSession.customer?.id !== replayCustomerId
    );
    if ((freshMode && !shouldResumeQuestions(existingSession)) || freshInviteCustomerChanged) {
      core.clearActiveSession();
      clearResultVisibleSessionId();
    } else {
      const visibleSessionId = getResultVisibleSessionId();
      if (existingSession && existingSession.completed && visibleSessionId !== existingSession.id) {
        core.clearActiveSession();
      }
    }

    if (!getProfile()) {
      ensurePlayableProfile();
    }

    if (playMode || autoPlayMode) {
      const existingSession = getSession();
      if (existingSession && !existingSession.completed) {
        state.showGame = shouldResumeQuestions(existingSession);
        renderAll();
      } else {
        void startGame();
      }
    } else {
      renderAll();
    }
  }

  function renderUnavailableRestaurant() {
    renderHero(false);
    elements.start.classList.remove("hidden");
    elements.game.classList.add("hidden");
    elements.result.classList.add("hidden");
    elements.start.innerHTML = `
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
        src="${getHeroImage()}"
        alt="${escapeHtml(getHeroAlt())}"
      />
    `;
  }

  function renderFeedbackRewardCard() {
    const profile = getProfile();
    const reward = core.getFeedbackRewardConfig?.(profile, restaurantSlug);
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
    const surveyQuestions = (restaurant?.feedbackSurveyQuestions || []).filter((question) => question.active !== false);
    const feedbackSurveyIntro = "The survey below shows the four types of questions your restaurant can ask: Yes/No, scale of 1-5, multiple choice, and custom answers. These answers are stored for your use in our database and can be accessed by you at any time with your own custom URL.";
    const feedbackSubmitText = isSalesDemoMode() ? "Send Feedback & Claim Character" : "Send Feedback & Claim Customer";

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

    return `
      <div class="hero-card feedback-reward-card">
        <div class="feedback-reward-copy">
          <p class="kicker">${escapeHtml(isSalesDemoMode() ? "Feedback Demo" : "Optional Feedback Reward")}</p>
          <h3 class="section-title">${escapeHtml(isSalesDemoMode() ? reward.prompt : `Share quick feedback for ${restaurant?.name || "this restaurant"}.`)}</h3>
          <p class="copy">${escapeHtml(isSalesDemoMode() ? "Players earn a collectible character and a leaderboard bonus after completing your survey, giving guests a clear reason to share feedback." : reward.prompt)}</p>
        </div>
        <div class="feedback-reward-customer">
          <img class="feedback-reward-photo" src="${reward.customer.image}" alt="${escapeHtml(reward.customer.name)}" />
          <div>
            <p class="customer-reveal-rarity">${escapeHtml(reward.customer.rarity || "Special")} ${escapeHtml(isSalesDemoMode() ? "character" : "customer")}</p>
            <strong>${escapeHtml(reward.customer.name)}</strong>
          </div>
        </div>
        ${
          state.showFeedbackRewardForm || state.feedbackRewardError
            ? `
              <form class="feedback-reward-form" id="feedback-reward-form">
                ${isSalesDemoMode() ? `<p class="feedback-survey-demo-intro">${escapeHtml(feedbackSurveyIntro)}</p>` : ""}
                ${renderFeedbackSurveyFields(surveyQuestions, { showRequiredText: !isSalesDemoMode() })}
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
                <button class="button button-muted" id="feedback-reward-open" type="button">${escapeHtml(isSalesDemoMode() ? "Try Feedback Demo" : "Give Feedback")}</button>
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
      const fieldId = `feedback-question-${question.id}`;
      const currentValue = getFeedbackSurveyAnswerValue(question.id);
      const label = `<label class="field-label" for="${escapeHtml(fieldId)}">${escapeHtml(question.prompt)}${requiredText}</label>`;
      if (question.type === "rating") {
        return `
          <div class="feedback-survey-question" data-question-id="${escapeHtml(question.id)}" data-question-type="rating" data-question-text="${escapeHtml(question.prompt)}">
            ${label}
            <select class="input feedback-survey-answer" id="${escapeHtml(fieldId)}">
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
            <select class="input feedback-survey-answer" id="${escapeHtml(fieldId)}">
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
            <select class="input feedback-survey-answer" id="${escapeHtml(fieldId)}">
              <option value="">Choose one</option>
              ${(question.choices || []).map((choice) => `<option value="${escapeHtml(choice)}" ${currentValue === String(choice) ? "selected" : ""}>${escapeHtml(choice)}</option>`).join("")}
            </select>
          </div>
        `;
      }
      return `
        <div class="feedback-survey-question" data-question-id="${escapeHtml(question.id)}" data-question-type="text" data-question-text="${escapeHtml(question.prompt)}">
          ${label}
          <textarea class="input feedback-reward-textarea feedback-survey-answer" id="${escapeHtml(fieldId)}" maxlength="1000" rows="4" placeholder="Write your answer">${escapeHtml(currentValue)}</textarea>
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

  function bindFeedbackRewardCard() {
    const openButton = document.getElementById("feedback-reward-open");
    if (openButton) {
      openButton.addEventListener("click", () => {
        state.showFeedbackRewardForm = true;
        state.feedbackRewardError = "";
        state.feedbackRewardMessage = "";
        state.feedbackSurveyAnswers = [];
        renderAll();
      });
    }

    const cancelButton = document.getElementById("feedback-reward-cancel");
    if (cancelButton) {
      cancelButton.addEventListener("click", () => {
        state.showFeedbackRewardForm = false;
        state.feedbackRewardError = "";
        state.feedbackSurveyAnswers = [];
        renderAll();
      });
    }

    const form = document.getElementById("feedback-reward-form");
    if (!form) {
      return;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitButton = document.getElementById("feedback-reward-submit");
      const answers = collectFeedbackSurveyAnswers();
      state.feedbackSurveyAnswers = answers;
      if (!answers.some((answer) => answer.value)) {
        state.feedbackRewardError = "Please answer the survey before claiming this reward.";
        renderAll();
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      try {
        await core.submitFeedbackSurveyResponse?.(restaurantSlug, answers);
      } catch (submitError) {
        state.feedbackRewardError = submitError instanceof Error ? submitError.message : "Unable to save that survey right now.";
        renderAll();
        return;
      }

      const outcome = core.awardFeedbackReward?.(restaurantSlug, {
        message: answers.map((answer) => `${answer.questionText}: ${answer.value}`).join("\n"),
      });
      if (!outcome?.ok) {
        state.feedbackRewardError = outcome?.message || "Unable to claim this reward right now.";
        renderAll();
        return;
      }

      try {
        await core.syncActiveProfile?.();
      } catch {
        // The profile is still saved locally; the normal sync path will retry on later changes.
      }

      state.showFeedbackRewardForm = false;
      state.feedbackRewardError = "";
      state.feedbackSurveyAnswers = [];
      state.feedbackRewardMessage = outcome.message || `${outcome.customer?.name || "This customer"} has joined your collection.`;
      renderAll();
    });
  }

  function renderSetup() {
    const profile = getProfile();
    const session = getSession();
    const openingCustomers = getDisplayedOpeningCustomers();
    const safeOpeningCustomers = Array.isArray(openingCustomers) ? openingCustomers : [];
    const startHref = replayCustomer
      ? `${restaurantBasePath()}?play=1&customerId=${encodeURIComponent(replayCustomer.id)}`
      : `${restaurantBasePath()}?play=1`;
    const introCopy = replayCustomer
      ? `This is an invite-back visit for ${replayCustomer.name}. If you do better, they move up. If you do worse, the newer result replaces the old one.`
      : getOpenerCopy();
    const introCopyMarkup = introCopy
      ? `<p class="copy opening-title-copy">${escapeHtml(introCopy)}</p>`
      : "";
    const openingQuestion = isSalesDemoMode()
      ? ""
      : "Can You Add A New Customer To Your Collection?";
    const demoExpectationLine = "In this demo you'll see: menu photo questions, restaurant trivia, collectible characters, and feedback surveys.";
    const startButtonText = replayCustomer
      ? "INVITE BACK"
      : isSalesDemoMode()
        ? "PLAY THE THREE MINUTE DEMO"
        : "START THE GAME";
    elements.start.innerHTML = `
      <div class="opening-start-shell">
        <div class="opening-start-heading">
          <h2 class="opening-title">${escapeHtml(getGameTitle())}</h2>
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
              src="${getHeroImage()}"
              alt="${escapeHtml(getHeroAlt())}"
            />
          </div>

          <div class="opening-start-side opening-start-side-wide">
            <div class="opening-guest-stack">
              ${isSalesDemoMode() ? `<p class="opening-guest-section-title">Collectible Characters</p>` : ""}
              <div class="opening-guest-grid">
                ${safeOpeningCustomers
                  .map(
                    (customer) => `
                      <article class="opening-guest-card ${isSalesDemoMode() ? "opening-guest-card-demo" : ""}">
                        <img class="opening-guest-photo" src="${customer.image}" alt="${escapeHtml(customer.name)}" />
                        <div class="${openingCustomerCopyClass(customer)}">
                          <p class="opening-guest-name">${formatGuestDisplayName(isSalesDemoMode() ? salesDemoCharacterName(customer) : customer.name)}</p>
                          ${
                            isSalesDemoMode() && salesDemoCustomerCaption(customer)
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
          <a class="button button-hot" id="start-game-button" href="${startHref}">${escapeHtml(startButtonText)}</a>
          ${
            replayCustomer
              ? `
                <a class="button button-muted" href="${restaurantBasePath()}?home=1">Cancel Invite Back</a>
                <a class="button button-muted" href="/restaurant/?hub=1">View My Virtual Restaurant</a>
              `
              : profile && !isSalesDemoMode()
                ? `
                  <a class="button button-muted" href="/restaurant/?hub=1">View My Virtual Restaurant</a>
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
        ${isSalesDemoMode() ? `<p class="sales-demo-expectation">${escapeHtml(demoExpectationLine)}</p>` : ""}
        ${renderFeedbackRewardCard()}
      </div>`;
    bindFeedbackRewardCard();

    const resumeButton = document.getElementById("resume-game-button");
    if (resumeButton) {
      resumeButton.addEventListener("click", () => {
        state.showGame = true;
        renderAll();
      });
    }
  }

  function renderSetupFallback() {
    const profile = getProfile();
    const startHref = replayCustomer
      ? `${restaurantBasePath()}?play=1&customerId=${encodeURIComponent(replayCustomer.id)}`
      : `${restaurantBasePath()}?play=1`;
    const openingQuestion = isSalesDemoMode()
      ? ""
      : "Can You Add A New Customer To Your Collection?";
    const demoExpectationLine = "In this demo you'll see: menu photo questions, restaurant trivia, collectible characters, and feedback surveys.";
    const startButtonText = isSalesDemoMode() ? "PLAY THE THREE MINUTE DEMO" : "START THE GAME";
    elements.start.innerHTML = `
      <div class="opening-start-shell">
        <div class="opening-start-heading">
          <h2 class="opening-title">${escapeHtml(getGameTitle())}</h2>
          <p class="copy opening-title-copy">
            ${escapeHtml(getOpenerCopy())}
          </p>
        </div>

        <div class="opening-start-grid">
          <div class="opening-start-hero">
            <img
              class="hero-banner-image hero-banner-image-start"
              src="${getHeroImage()}"
              alt="${escapeHtml(getHeroAlt())}"
            />
          </div>

          <div class="opening-start-side opening-start-side-wide">
            <div class="opening-guest-stack">
              ${isSalesDemoMode() ? `<p class="opening-guest-section-title">Collectible Characters</p>` : ""}
              <div class="opening-guest-grid">
                ${getDisplayedOpeningCustomers()
                  .map(
                    (customer) => `
                      <article class="opening-guest-card ${isSalesDemoMode() ? "opening-guest-card-demo" : ""}">
                        <img class="opening-guest-photo" src="${customer.image}" alt="${escapeHtml(customer.name)}" />
                        <div class="${openingCustomerCopyClass(customer)}">
                          <p class="opening-guest-name">${formatGuestDisplayName(isSalesDemoMode() ? salesDemoCharacterName(customer) : customer.name)}</p>
                          ${
                            isSalesDemoMode() && salesDemoCustomerCaption(customer)
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
          <a class="button button-hot" id="start-game-button" href="${startHref}">${escapeHtml(startButtonText)}</a>
          ${
            profile && !isSalesDemoMode()
              ? `<a class="button button-muted" href="/restaurant/?hub=1">View My Virtual Restaurant</a>`
              : ""
          }
        </div>
        ${isSalesDemoMode() ? `<p class="sales-demo-expectation">${escapeHtml(demoExpectationLine)}</p>` : ""}
        ${renderFeedbackRewardCard()}
      </div>`;
    bindFeedbackRewardCard();

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

    if (session && !session.completed && !state.showGame) {
      elements.start.classList.remove("hidden");
      elements.game.classList.add("hidden");
      elements.result.classList.add("hidden");
      renderCustomerRevealPanel(session);
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

  function renderCustomerRevealPanel(session) {
    removeHowToPlayModals();
    const customer = session.customer;
    const customerBio = core.getCustomerBio(customer);
    const thresholds = core.getCustomerWinThresholds(customer);
    const rarity = customer.rarity || "Rare";
    const salesDemoMode = isSalesDemoMode();
    const revealKicker = salesDemoMode ? "Collectible Character Demo" : "Play Trivia To Earn This Customer";
    const revealBioMarkup = salesDemoMode
      ? `${escapeHtml(customer.name)} is an exclusive collectible character available only in your restaurant's game.<br />Players will come back to build their collection and unlock new characters.`
      : escapeHtml(customerBio);
    const revealType = salesDemoMode ? "collectible character" : "customer";
    const regularValueLabel = salesDemoMode ? "Regular Value" : "Regular Customer Value";
    const occasionalValueLabel = salesDemoMode ? "Occasional Value" : "Occasional Customer Value";
    const howToPlayText = salesDemoMode ? "See the Benefits" : "How to Play";
    const collectionEntry = getCollectionEntryForSession(session);
    const favoriteGoal = core.getFavoriteVisitGoal();
    const favoriteVisits = Math.max(0, Math.min(favoriteGoal, Number(collectionEntry?.favoriteVisits) || 0));
    const isRegularReplay =
      collectionEntry?.status === "regular" || collectionEntry?.status === "favorite";
    const favoriteBonusMarkup =
      isRegularReplay && collectionEntry.status !== "favorite"
        ? `
          <div class="favorite-progress-note">
            <p class="kicker">Regular Customer Bonus</p>
            <p class="copy">Score <strong>${thresholds.regular}/10 or better</strong> with this customer to build Favorite progress. After <strong>${favoriteGoal} successful visits</strong>, they become a Favorite Customer and their value increases from <strong>${core.formatCurrency(customer.regularValue)}</strong> to <strong>${core.formatCurrency(core.getFavoriteCustomerValue(customer))}</strong>.</p>
            <p class="helper">Current Favorite progress: ${favoriteVisits}/${favoriteGoal}</p>
          </div>
        `
        : collectionEntry?.status === "favorite"
          ? `
            <div class="favorite-progress-note favorite-progress-note-complete">
              <p class="kicker">Favorite Customer</p>
              <p class="copy">${escapeHtml(customer.name)} is already a Favorite Customer. Their value is <strong>${core.formatCurrency(core.getFavoriteCustomerValue(customer))}</strong>.</p>
            </div>
          `
          : "";

    elements.start.innerHTML = `
      <div class="customer-reveal-shell ${salesDemoMode ? "customer-reveal-shell-demo" : ""}">
        <div class="customer-reveal-copy">
          <p class="kicker">${escapeHtml(revealKicker)}</p>
          <h2 class="opening-title">You're playing for ${escapeHtml(customer.name)}</h2>
          <p class="copy opening-title-copy">${revealBioMarkup}</p>
        </div>

        <div class="customer-reveal-card ${salesDemoMode ? "customer-reveal-card-demo" : ""}">
          <img class="customer-reveal-photo" src="${customer.image}" alt="${escapeHtml(customer.name)}" />
          <div class="customer-reveal-details">
            <div>
              <p class="customer-reveal-rarity">${escapeHtml(rarity)} ${escapeHtml(revealType)}</p>
              <h3 class="customer-reveal-name">${escapeHtml(customer.name)}</h3>
            </div>
            ${
              salesDemoMode
                ? ""
                : `
                  <div class="customer-reveal-goals">
                    <div class="customer-reveal-goal">
                      <span class="customer-reveal-label">Regular Customer</span>
                      <strong>Need ${thresholds.regular}/10 Correct</strong>
                    </div>
                    <div class="customer-reveal-goal">
                      <span class="customer-reveal-label">Occasional Customer</span>
                      <strong>Need ${thresholds.occasional}/10 Correct</strong>
                    </div>
                  </div>
                `
            }
            <div class="customer-reveal-values">
              <div class="customer-reveal-value">
                <span class="customer-reveal-label">${escapeHtml(regularValueLabel)}</span>
                <strong>${core.formatCurrency(customer.regularValue)}</strong>
              </div>
              <div class="customer-reveal-value">
                <span class="customer-reveal-label">${escapeHtml(occasionalValueLabel)}</span>
                <strong>${core.formatCurrency(customer.occasionalValue)}</strong>
              </div>
            </div>
            <div class="customer-reveal-mobile-summary">
              <div class="customer-reveal-combo">
                <span class="customer-reveal-label">${escapeHtml(salesDemoMode ? "Regular Value" : "Regular Customer")}</span>
                <strong>${escapeHtml(salesDemoMode ? core.formatCurrency(customer.regularValue) : `Need ${thresholds.regular}/10 Correct - Value ${core.formatCurrency(customer.regularValue)}`)}</strong>
              </div>
              <div class="customer-reveal-combo">
                <span class="customer-reveal-label">${escapeHtml(salesDemoMode ? "Occasional Value" : "Occasional Customer")}</span>
                <strong>${escapeHtml(salesDemoMode ? core.formatCurrency(customer.occasionalValue) : `Need ${thresholds.occasional}/10 Correct - Value ${core.formatCurrency(customer.occasionalValue)}`)}</strong>
              </div>
            </div>
            ${favoriteBonusMarkup}
            <div class="button-row customer-reveal-actions">
              <button class="button button-hot" id="begin-questions-button" type="button">Begin Questions</button>
              ${salesDemoMode ? "" : `<a class="button button-muted" href="/restaurant/?hub=1">View My Collection / Leaderboard</a>`}
              <button class="button button-muted" id="reveal-how-to-play-button" type="button" data-how-to-play-button>${escapeHtml(howToPlayText)}</button>
            </div>
          </div>
        </div>
      </div>
      ${howToPlayModalHtml(isSalesDemoMode())}
    `;
    bindHowToPlay();

    document.getElementById("begin-questions-button")?.addEventListener("click", () => {
      core.markActiveSessionStarted?.();
      state.showGame = true;
      renderAll();
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          const gameTop = Math.max(0, elements.game.getBoundingClientRect().top + window.scrollY - 12);
          window.scrollTo({ top: gameTop, behavior: "smooth" });
        });
      });
    });
  }

  async function startGame() {
    const profile = ensurePlayableProfile();
    if (profile) {
      core.setActiveProfileId(profile.id);
    }

    const options = replayCustomer ? { customerId: replayCustomer.id } : {};
    const session = core.startNewSession(restaurantSlug, options);
    if (!session) {
      window.alert(`No available guests are ready for ${restaurant?.name || "this restaurant"} right now. Please try again.`);
      return;
    }
    clearResultVisibleSessionId();
    state.feedback = null;
    state.isLocked = false;
    state.resultBioExpanded = false;
    state.showGame = false;
    renderAll();
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const revealTop = Math.max(0, elements.start.getBoundingClientRect().top + window.scrollY - 12);
        window.scrollTo({ top: revealTop, behavior: "smooth" });
      });
    });
  }

  function renderGamePanel() {
    const session = getSession();
    if (!session) {
      elements.game.classList.add("hidden");
      return;
    }

    if (session.completed && !state.feedback) {
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
    const customerThresholds = core.getCustomerWinThresholds(session.customer);

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
            <span class="chip">Need ${customerThresholds.regular}</span>
          </div>
        </div>

        <div class="hero-card question-customer-card" style="margin-top: 0;">
          <div class="customer-card-top question-customer-top">
            <img class="customer-avatar question-customer-avatar" src="${session.customer.image}" alt="${escapeHtml(session.customer.name)}" />
            <div>
              <p class="customer-name">${escapeHtml(session.customer.name)}</p>
              <p class="customer-bio">${escapeHtml(customerBio)}</p>
              <div class="chip-row" style="margin-top: 10px;">
                <span class="chip">${escapeHtml(session.customer.rarity || "Rare")} customer</span>
                <span class="chip">Regular needs ${customerThresholds.regular}/10</span>
                <span class="chip">Occasional needs ${customerThresholds.occasional}/10</span>
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
        ? "Correct!"
        : `Incorrect. The correct answer was "${outcome.correctAnswer}".`,
    };

    renderGamePanel();

    if (outcome.completed && outcome.session && outcome.session.id) {
      setResultVisibleSessionId(outcome.session.id);
    }

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
    }, answerFeedbackDelayMs);
  }

  function resultMessage(session) {
    const favoriteProgress = session.favoriteProgress;

    if (favoriteProgress?.becameFavorite) {
      return `${session.customer.name} is now a Favorite Customer. Their value increased from ${core.formatCurrency(favoriteProgress.regularValue)} to ${core.formatCurrency(favoriteProgress.favoriteValue)}.`;
    }

    if (favoriteProgress?.wasEligible && favoriteProgress.successful) {
      return `${session.customer.name} is now ${favoriteProgress.visits}/${favoriteProgress.goal} successful visits toward becoming a Favorite Customer.`;
    }

    if (favoriteProgress?.wasEligible && !favoriteProgress.successful) {
      return `Score ${favoriteProgress.threshold}/10 or better with ${session.customer.name} to build Favorite progress.`;
    }

    if (session.result === "favorite") {
      return `${session.customer.name} is already a Favorite Customer.`;
    }

    if (session.result === "regular") {
      return `${session.customer.name} has joined your customer collection.`;
    }

    if (session.result === "occasional") {
      return `${session.customer.name} has joined your customer collection.`;
    }

    return `${session.customer.name} was not impressed and will not be coming back.`;
  }

  function renderResultNetWorthPrompt(profile, stats = null) {
    if (!profile || profile.isGuest || !core.getRestaurantExpansionPreview) {
      return "";
    }

    const gamesPlayed = Math.max(0, Number((stats || profile.stats)?.gamesPlayed) || 0);
    if (gamesPlayed < 3) {
      return "";
    }

    const preview = core.getRestaurantExpansionPreview(profile);
    if (!preview?.next) {
      return "";
    }

    const currentId = String(preview.current?.id || "");
    if (!["food-truck", "counter-service", "small-diner"].includes(currentId)) {
      return "";
    }

    const cashOnHand = core.getRestaurantCashOnHand
      ? core.getRestaurantCashOnHand(profile, stats || profile.stats)
      : Math.max(0, Number((stats || profile.stats)?.estimatedSales) || 0);
    const nextCost = Math.max(0, Number(preview.next.cost) || 0);
    const shortfall = Math.max(0, nextCost - cashOnHand);
    const closeEnough = nextCost > 0 && cashOnHand >= nextCost * 0.6;
    const upgrades = core.getRestaurantUpgradePreview ? core.getRestaurantUpgradePreview(profile, 3) : [];
    const affordableUpgrade = upgrades.find((upgrade) => {
      return currentId !== "food-truck" && cashOnHand >= Math.max(0, Number(upgrade.cost) || 0);
    });

    if (!affordableUpgrade && !closeEnough && cashOnHand < nextCost) {
      return "";
    }

    const message = cashOnHand >= nextCost
      ? `You can expand to ${preview.next.label} now and add ${core.formatCurrency(preview.valueAdded)} to your restaurant value.`
      : affordableUpgrade
        ? `${affordableUpgrade.label} is available now. Upgrades add value and can boost future sales.`
        : `You are ${core.formatCurrency(shortfall)} away from ${preview.next.label}. A few more customers could help you expand.`;

    return `
      <div class="hero-card result-followup-card result-net-worth-prompt">
        <p class="kicker">Grow Your Net Worth</p>
        <h3 class="section-title">Your restaurant can grow from here.</h3>
        <p class="copy">${escapeHtml(message)} Visit My Virtual Restaurant to expand or buy upgrades.</p>
        <div class="button-row">
          <a class="button button-hot" href="/restaurant/?hub=1#hero-panel">View My Virtual Restaurant</a>
        </div>
      </div>
    `;
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
    removeHowToPlayModals();
    const profile = getProfile();
    const summary = profile ? core.getProfileSummary(profile, restaurantSlug) : null;
    const overallSummary = profile ? core.getProfileSummary(profile) : null;
    const overallSalesStats =
      profile && typeof core.getPublicLeaderboardStats === "function"
        ? core.getPublicLeaderboardStats(profile)
        : overallSummary?.stats;
    const isGuest = Boolean(profile && profile.isGuest);
    const isFourthGame = Number(overallSummary?.stats?.gamesPlayed) === 4;
    const resultLayoutMode = isGuest
      ? (state.showProfileForm ? "register-form" : "guest-prompt")
      : "return-actions";
    const label =
      session.result === "favorite"
        ? "Favorite Customer"
        : session.result === "regular"
        ? "Regular Customer"
        : session.result === "occasional"
        ? "Occasional Customer"
          : "Lost Customer";
    const resultSummaryLabel =
      session.result === "favorite"
        ? "Favorite"
        : session.result === "regular"
        ? "Regular"
        : session.result === "occasional"
          ? "Occasional"
          : "Lost";
    const customerBio = core.getCustomerBio(session.customer);
    const customerBioPreview = getBioPreview(customerBio);
    const showFullBio = state.resultBioExpanded || !customerBioPreview.isTruncated;
    const favoriteProgress = session.favoriteProgress;
    const resultHeadline =
      favoriteProgress?.becameFavorite
        ? "Favorite earned"
        : favoriteProgress?.wasEligible && favoriteProgress.successful
          ? "Bonus progress"
          : session.result === "regular"
        ? "Congratulations"
        : session.result === "occasional"
          ? "Nice work"
          : "Better luck next time";
    const resultSubheadline =
      favoriteProgress?.becameFavorite
        ? "New Favorite Customer"
        : favoriteProgress?.wasEligible && favoriteProgress.successful
          ? "Favorite Progress +1"
          : favoriteProgress?.wasEligible
            ? "Favorite Progress Missed"
            : session.result === "regular"
        ? "New Regular Customer"
        : session.result === "occasional"
          ? "New Occasional Customer"
          : "Customer Not Kept";
    const customerValue =
      session.result === "favorite"
        ? core.getFavoriteCustomerValue(session.customer)
        : session.result === "regular"
          ? session.customer.regularValue
          : session.result === "occasional"
            ? session.customer.occasionalValue
            : 0;
    const salesBoostPercent = Math.max(0, Number(session.salesBoostPercent) || 0);
    const baseCustomerValue =
      session.result === "favorite"
        ? Number(session.customerBaseValues?.favoriteValue) || 0
        : session.result === "regular"
          ? Number(session.customerBaseValues?.regularValue) || 0
          : session.result === "occasional"
            ? Number(session.customerBaseValues?.occasionalValue) || 0
            : 0;
    const salesBoostMarkup =
      salesBoostPercent > 0 && customerValue > 0 && baseCustomerValue > 0
        ? `
          <div class="result-metric-row result-sales-boost-row">
            <div class="result-metric-card result-metric-card-wide">
              <span class="result-metric-label">Upgrade bonus:</span>
              <span class="result-metric-value">${core.formatCurrency(baseCustomerValue)} +${salesBoostPercent.toFixed(0)}% = ${core.formatCurrency(customerValue)}</span>
            </div>
          </div>
        `
        : "";
    const triviaLeaderboardMilestoneMarkup =
      isFourthGame && !isGuest
        ? `
          <div class="hero-card result-followup-card" style="margin-top: 0; padding: 16px;">
            <p class="kicker" style="margin: 0 0 6px;">Trivia % Leaderboard</p>
            <h3 class="section-title" style="font-size: 1.2rem; margin-bottom: 8px;">Congratulations! You completed your 4th game.</h3>
            <p class="copy" style="margin: 0 0 12px;">You are now eligible for the Trivia % Leaderboard.</p>
            <div class="button-row">
              <a class="button button-hot" href="/restaurant/?hub=1&metric=rating#leaderboard-panel">View Trivia % Leaderboard</a>
            </div>
          </div>
        `
        : "";
    const netWorthPromptMarkup = renderResultNetWorthPrompt(profile, overallSummary?.stats || profile?.stats);
    const feedbackRewardMarkup = renderFeedbackRewardCard();

    elements.result.innerHTML = `
      <div class="result-screen result-screen-${resultLayoutMode}">
        <div class="result-top-layout">
          <div class="result-hero-panel">
            <img class="result-hero-image" src="${getHeroImage()}" alt="${escapeHtml(getHeroAlt())}" />
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
                  <span class="result-metric-value">${core.formatCurrency(customerValue)}</span>
                </div>
                <div class="result-metric-card">
                  <span class="result-metric-label">Player sales:</span>
                  <span class="result-metric-value">${overallSalesStats ? core.formatCurrency(overallSalesStats.estimatedSales) : core.formatCurrency(0)}</span>
                </div>
              </div>
              ${salesBoostMarkup}
            </div>
          </div>
        </div>

        <div class="divider"></div>
        ${triviaLeaderboardMilestoneMarkup}
        ${!isGuest && !state.showProfileForm ? netWorthPromptMarkup : ""}
        ${
          isGuest && !state.showProfileForm
            ? `
              <div class="hero-card result-followup-card result-followup-card-guest" style="margin-top: 0; padding: 16px;">
                <p class="kicker" style="margin: 0 0 6px;">${isFourthGame ? "Trivia % Leaderboard" : "Save Your Customer Collection"}</p>
                <h3 class="section-title" style="font-size: 1.2rem; margin-bottom: 8px;">${isFourthGame ? "Congratulations! You completed your 4th game." : `You just earned ${escapeHtml(session.customer.name)}.`}</h3>
                <p class="copy" style="margin: 0 0 12px;">${isFourthGame ? "Save your restaurant to keep your Trivia % leaderboard progress. No email required." : "Save your collection to keep customers, track your trivia progress, and compete on the leaderboards."}</p>
                <div class="button-row">
                  <button class="button button-hot result-save-progress-button" id="register-now-button" type="button">
                    <span>${isFourthGame ? "Save My Restaurant" : "Save My Customer Collection"}</span>
                    <small>No email required</small>
                  </button>
                  <button class="button button-muted" id="guest-continue-button" type="button">Keep Playing as Guest</button>
                </div>
              </div>
              `
            : state.showProfileForm
              ? `
                <div class="hero-card result-followup-card result-followup-card-form" style="margin-top: 0; padding: 16px;">
                  <p class="kicker" style="margin: 0 0 6px;">Save Collection</p>
                  <h3 class="section-title" style="font-size: 1.2rem; margin-bottom: 8px;">${escapeHtml(session.customer.name)} Has Joined Your Collection!</h3>
                  <p class="copy result-save-mobile-note" style="margin: 0 0 14px;">Save now to keep your customers, trivia record, and leaderboard progress.</p>
                  <p class="copy" style="margin: 0 0 8px;">Save your collection to:</p>
                  <ul class="copy" style="margin: 0 0 16px; padding-left: 20px; line-height: 1.45;">
                    <li>Keep all customers you earn</li>
                    <li>Track your trivia record</li>
                    <li>Appear on the leaderboards</li>
                    <li>Grow a virtual restaurant if you want</li>
                  </ul>
                  <form class="input-grid" id="profile-form" style="margin-top: 8px;">
                    <div class="field">
                      <label class="field-label save-restaurant-label" for="restaurant-name">Name Your Virtual Restaurant</label>
                      <p class="helper save-restaurant-helper">This is how you will appear on the leaderboards. Make it yours by replacing "${escapeHtml(profile ? profile.restaurantName : "our suggestion")}", or keep that as your restaurant name.</p>
                      <input class="input save-restaurant-input" id="restaurant-name" name="restaurantName" type="text" maxlength="32" placeholder="Tim's Roadhouse" value="${escapeHtml(profile ? profile.restaurantName : "")}" data-suggested-name="${escapeHtml(profile ? profile.restaurantName : "")}" />
                    </div>
                    <div class="field">
                      <label class="field-label" for="player-name">Player name</label>
                      <input class="input" id="player-name" name="playerName" type="text" placeholder="Tim" value="${escapeHtml(profile ? profile.playerName : "")}" />
                    </div>
                    <div class="field">
                      <label class="field-label" for="profile-email">Email address <span style="font-weight: 500;">(optional)</span></label>
                      <input class="input" id="profile-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" />
                    </div>
                    <p class="helper" style="margin: 0;">Your player name and email are private. Other players only see your virtual restaurant name on leaderboards.</p>
                    <button class="text-button" id="email-info-toggle" type="button">${state.emailInfoExpanded ? "Hide email note" : "Why save with email?"}</button>
                    <p class="helper ${state.emailInfoExpanded ? "" : "hidden"}" style="margin: 0;">Email is only used to send a secure recovery link. Without it, your virtual restaurant is saved in this browser, but it cannot be restored after clearing cache or changing devices.</p>
                    <label class="checkbox-row profile-age-confirm" for="profile-age-confirm">
                      <input id="profile-age-confirm" name="ageConfirm" type="checkbox" />
                      <span>I am 13 or older.</span>
                    </label>
                    <p class="helper" style="margin: 0;">To save progress, you must be 13 or older. If you are under 13, please keep playing as a guest and do not enter personal information.</p>
                    <p class="helper legal-form-note" style="margin: 0;">By saving, you agree to the <a href="/terms/" target="_blank" rel="noopener">Terms of Use</a> and acknowledge the <a href="/privacy/" target="_blank" rel="noopener">Privacy Policy</a>.</p>
                    <p class="error hidden" id="profile-error" aria-live="polite"></p>
                    <p class="helper ${state.registrationMessage ? "" : "hidden"}" id="profile-success" aria-live="polite">${escapeHtml(state.registrationMessage)}</p>
                    <div class="form-actions">
                      <button class="button button-hot" id="profile-submit-button" type="submit">Save My Collection</button>
                      <button class="button button-muted" id="cancel-register-button" type="button">Maybe Later</button>
                    </div>
                  </form>
                </div>
              `
              : `
                <div class="button-row result-followup-actions">
                  <button class="button button-hot" id="play-again-button" type="button">Play Again</button>
                  <a class="button button-muted" href="/restaurant/?hub=1">View My Virtual Restaurant</a>
                  <button class="button button-muted" id="result-how-to-play-button" type="button" data-how-to-play-button>How to Play</button>
                </div>
              `
        }
        ${!state.showProfileForm ? feedbackRewardMarkup : ""}
        ${howToPlayModalHtml(isSalesDemoMode())}
      </div>
    `;
    bindHowToPlay();
    bindFeedbackRewardCard();

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
        state.registrationMessage = "";
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
      const emailInfoToggle = document.getElementById("email-info-toggle");
      const restaurantInput = document.getElementById("restaurant-name");

      cancel.addEventListener("click", () => {
        state.showProfileForm = false;
        renderAll();
      });

      restaurantInput.addEventListener("focus", () => {
        if (restaurantInput.value === restaurantInput.dataset.suggestedName) {
          restaurantInput.select();
        }
      });

      emailInfoToggle.addEventListener("click", () => {
        state.emailInfoExpanded = !state.emailInfoExpanded;
        renderAll();
      });

      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const playerName = document.getElementById("player-name").value.trim();
        const restaurantName = document.getElementById("restaurant-name").value.trim();
        const email = document.getElementById("profile-email").value.trim();
        const ageConfirmed = document.getElementById("profile-age-confirm").checked;
        const submitButton = document.getElementById("profile-submit-button");
        const validation = core.validateProfileInput(playerName, restaurantName);

        if (!validation.ok) {
          error.textContent = validation.message;
          error.classList.remove("hidden");
          return;
        }

        if (!ageConfirmed) {
          error.textContent = "To save progress, you must be 13 or older. If you are under 13, keep playing as a guest and do not enter personal information.";
          error.classList.remove("hidden");
          return;
        }

        if (email && !email.includes("@")) {
          error.textContent = "Enter a valid email address, or leave email blank for now.";
          error.classList.remove("hidden");
          return;
        }

        error.classList.add("hidden");
        submitButton.disabled = true;
        submitButton.textContent = email ? "Sending..." : "Saving...";
        const activeProfile = getProfile();
        if (activeProfile) {
          const previousProfile = activeProfile;
          if (email) {
            try {
              await core.checkEmailCanConnectProfile?.(email, activeProfile.id);
            } catch (checkError) {
              error.textContent = checkError instanceof Error ? checkError.message : "That email could not be connected.";
              error.classList.remove("hidden");
              submitButton.disabled = false;
              submitButton.textContent = "Save My Collection";
              return;
            }
          }
          core.updateProfile({
            ...activeProfile,
            playerName,
            restaurantName,
            restaurantSlug: core.slugify(restaurantName),
            restaurantNameUpdatedAt: new Date().toISOString(),
            isGuest: false,
          });
          core.setActiveProfileId(activeProfile.id);
          try {
            await core.syncActiveProfile?.();
          } catch (syncError) {
            core.updateProfile(previousProfile);
            core.setActiveProfileId(previousProfile.id);
            error.textContent = syncError instanceof Error ? syncError.message : "Unable to save that restaurant name.";
            error.classList.remove("hidden");
            submitButton.disabled = false;
            submitButton.textContent = "Save My Collection";
            return;
          }
        } else {
          error.textContent = "Your guest restaurant could not be found. Please play again.";
          error.classList.remove("hidden");
          submitButton.disabled = false;
          submitButton.textContent = "Save My Collection";
          return;
        }

        if (!email) {
          state.showProfileForm = false;
          state.registrationMessage = "";
          renderAll();
          return;
        }

        try {
          await core.sendEmailSignInLink(email, { profileId: activeProfile.id });
          state.registrationMessage = "Check your email and tap the secure link to finish saving your virtual restaurant.";
          renderAll();
        } catch (sendError) {
          error.textContent = sendError instanceof Error ? sendError.message : "Unable to send the email link.";
          error.classList.remove("hidden");
          submitButton.disabled = false;
          submitButton.textContent = "Save My Collection";
        }
      });
    } else {
      document.getElementById("play-again-button").addEventListener("click", () => {
        core.clearActiveSession();
        clearResultVisibleSessionId();
        state.feedback = null;
        state.isLocked = false;
        state.showProfileForm = false;
        state.resultBioExpanded = false;
        void startGame();
      });
    }
  }

  function renderAll() {
    try {
      renderHero(false);
      if (playMode) {
        const session = getSession();
        if (session && session.completed) {
          state.showGame = false;
          elements.start.classList.add("hidden");
          elements.game.classList.add("hidden");
          elements.result.classList.remove("hidden");
          renderResultPanel(session);
          return;
        }

        if (session && (state.showGame || shouldResumeQuestions(session))) {
          state.showGame = true;
          elements.start.classList.add("hidden");
          elements.game.classList.remove("hidden");
          elements.result.classList.add("hidden");
          renderGamePanel();
          return;
        }

        if (session && !state.showGame) {
          elements.start.classList.remove("hidden");
          elements.game.classList.add("hidden");
          elements.result.classList.add("hidden");
          renderCustomerRevealPanel(session);
          return;
        }

        elements.start.classList.remove("hidden");
        elements.game.classList.add("hidden");
        elements.result.classList.add("hidden");
        state.showGame = false;
        return;
      }
      renderSetup();
      renderStartPanel();
    } catch (error) {
      console.error("Restaurant Challenge render failed, falling back to a simplified start screen.", error);
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

  void initializeRestaurantPage();
})();
