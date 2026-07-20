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
  const multiplayerRoomCodeParam = String(query.get("room") || "").trim().toUpperCase();
  const multiplayerJoinMode = query.get("join") === "1";
  const multiplayerStorageKey = `${restaurantSlug}_multiplayer_room_v1`;
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
    showFeedbackRewardForm: false,
    feedbackRewardMessage: "",
    feedbackRewardError: "",
    feedbackSurveyAnswers: [],
    showGame: false,
    multiplayerRoom: null,
    multiplayerPlayer: null,
    multiplayerPlayers: [],
    multiplayerError: "",
    multiplayerMessage: "",
    multiplayerName: String(query.get("name") || "").trim().slice(0, 40),
    multiplayerJoinCode: "",
    multiplayerLoading: false,
    liveAdvanceInFlight: false,
    resultLeaderboardSessionId: "",
    resultLeaderboardMarkup: "",
    resultLeaderboardLoading: false,
  };

  const mobileGuestQuery = "(max-width: 960px)";
  const mobileVisibleGuestCount = 2;
  const desktopVisibleGuestCount = 4;
  const answerFeedbackDelayMs = 1500;
  const multiplayerRefreshDelayMs = 5000;
  const liveRoundRefreshDelayMs = 1000;
  const fallbackOpeningGuestIds = ["curtis-coolwater", "pastor-caleb-brooks", "ming-wu"];
  let multiplayerRefreshTimer = null;

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

  function goToFreshMultiplayerSetup() {
    const nextUrl = new URL(restaurantPlayPath(), window.location.origin);
    nextUrl.searchParams.set("multiplayer", "1");
    window.location.href = nextUrl.toString();
  }

  function getGameTitle() {
    if (isSalesDemoMode()) {
      return "The (YOUR RESTAURANT NAME HERE) Game";
    }
    return restaurant?.publicGameName || `${restaurant?.name || "Restaurant"} Game`;
  }

  function getOpenerCopy() {
    if (isSalesDemoMode()) {
      return "Discover how a custom 3-minute trivia game can promote your menu, engage guests, and encourage repeat visits.";
    }
    return restaurant?.openingCopy || "Play a quick game of trivia, unlock a character, and progress on the leaderboard!";
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
    return restaurant?.salesDemoMode === true || demoMode;
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

  function salesDemoCustomerCaption(customer) {
    const name = String(customer?.name || "").toLowerCase();
    if (name.includes("staff")) return "Build personal connections.";
    if (name.includes("owner") || name.includes("management")) return "Introduce Your People.";
    if (name.includes("superfan")) return "Encourage repeat visits.";
    if (name.includes("weekend") || name.includes("regular")) return "Reward loyal regulars.";
    return "";
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

  const AREA_MATCH_STOP_WORDS = new Set(["area", "city", "town", "county", "state", "georgia", "game"]);
  const US_STATE_AREA_ALIASES = {
    al: "alabama",
    ak: "alaska",
    az: "arizona",
    ar: "arkansas",
    ca: "california",
    co: "colorado",
    ct: "connecticut",
    de: "delaware",
    fl: "florida",
    ga: "georgia",
    hi: "hawaii",
    id: "idaho",
    il: "illinois",
    in: "indiana",
    ia: "iowa",
    ks: "kansas",
    ky: "kentucky",
    la: "louisiana",
    me: "maine",
    md: "maryland",
    ma: "massachusetts",
    mi: "michigan",
    mn: "minnesota",
    ms: "mississippi",
    mo: "missouri",
    mt: "montana",
    ne: "nebraska",
    nv: "nevada",
    nh: "new-hampshire",
    nj: "new-jersey",
    nm: "new-mexico",
    ny: "new-york",
    nc: "north-carolina",
    nd: "north-dakota",
    oh: "ohio",
    ok: "oklahoma",
    or: "oregon",
    pa: "pennsylvania",
    ri: "rhode-island",
    sc: "south-carolina",
    sd: "south-dakota",
    tn: "tennessee",
    tx: "texas",
    ut: "utah",
    vt: "vermont",
    va: "virginia",
    wa: "washington",
    wv: "west-virginia",
    wi: "wisconsin",
    wy: "wyoming",
  };

  function isSpecificAreaPiece(piece) {
    const slug = core.slugify(piece);
    return slug.length >= 4 && !AREA_MATCH_STOP_WORDS.has(slug);
  }

  function getSpecificAreaPieces(areaSlug) {
    return String(areaSlug || "")
      .split("-")
      .map((piece) => core.slugify(piece))
      .filter(isSpecificAreaPiece);
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

  function randomCustomers(customers, count) {
    const shuffled = customers.slice();
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled.slice(0, count);
  }

  function getRestaurantAreaSlugs(targetRestaurant) {
    const areaAliases = {
      ...US_STATE_AREA_ALIASES,
      douglasville: "douglas-county",
      "douglas-county": "douglasville",
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
            if (isSpecificAreaPiece(piece)) {
              areaSlugs.add(piece);
            }
            if (areaAliases[piece]) {
              areaSlugs.add(areaAliases[piece]);
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
          const customerPieces = getSpecificAreaPieces(customerAreaSlug);
          return [...areaSlugs].some(
            (areaSlug) =>
              isSpecificAreaPiece(areaSlug) &&
              (customerPieces.includes(areaSlug) ||
                getSpecificAreaPieces(areaSlug).some((piece) => customerPieces.includes(piece)))
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
        const slugPieces = getSpecificAreaPieces(slug);
        return [...areaSlugs].some(
          (areaSlug) =>
            isSpecificAreaPiece(areaSlug) &&
            (slugPieces.includes(areaSlug) || getSpecificAreaPieces(areaSlug).some((piece) => slugPieces.includes(piece)))
        );
      });
    });
  }

  function customerSortPriority(customer) {
    const sortOrder = Number(customer?.sortOrder) || 0;
    return sortOrder > 0 ? sortOrder : Number.POSITIVE_INFINITY;
  }

  function sortFeaturedCustomers(customers = []) {
    return [...customers].sort((left, right) => {
      const priorityDelta = customerSortPriority(left) - customerSortPriority(right);
      if (priorityDelta) {
        return priorityDelta;
      }
      return String(left?.name || "").localeCompare(String(right?.name || ""));
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
                  <li>Thousands of built-in trivia questions, plus custom questions about your restaurant.</li>
                  <li>Live multiplayer mode gives the whole table something fun to play together.</li>
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
                <li>Climb the trivia and Total Score leaderboards.</li>
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
              <p>Reach the unlock score to add that character to your collection.</p>
              <p>Every extra correct answer after that increases the character points.</p>
              <p>Characters increase your collection, points, and future restaurant score.</p>
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
              <p>Characters increase your restaurant score and generate points.</p>
              <p>You can expand from a Food Truck into a Local Landmark by unlocking characters, saving points, and adding upgrades.</p>
            </section>
            <section class="how-to-play-topic">
              <h3>VIRTUAL GAME POINTS</h3>
              <p>All points, character rewards, restaurant scores, and Total Score figures are virtual game values used for gameplay and leaderboards.</p>
              <p>They have no real money value.</p>
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
      addCustomers(randomCustomers(sortFeaturedCustomers(
        allCustomers.filter(
          (customer) =>
            customer.restaurant === "shared" &&
            customerMatchesArea(customer, areaSlugs)
        )
      ), allCustomers.length));
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
      addCustomers(randomCustomers(
        allCustomers.filter(
          (customer) =>
            customer.restaurant === "shared" &&
            (!Array.isArray(customer.areaSlugs) ||
              !customer.areaSlugs.length ||
              customerMatchesArea(customer, areaSlugs))
        ),
        allCustomers.length
      ));
    }

    if (selectedCustomers.length < count) {
      addCustomers(randomCustomers(
        allCustomers.filter((customer) => customer.restaurant === "shared"),
        allCustomers.length
      ));
    }

    if (selectedCustomers.length < count) {
      addCustomers(rotateCustomers(
        allCustomers.filter((customer) => customer.restaurant === restaurantSlug),
        restaurantSlug,
        allCustomers.length
      ), { skipOwned: false });
    }

    if (selectedCustomers.length < count) {
      addCustomers(randomCustomers(
        allCustomers.filter(
          (customer) =>
            customer.restaurant === "shared" &&
            (customerMatchesArea(customer, areaSlugs) ||
              !Array.isArray(customer.areaSlugs) ||
              !customer.areaSlugs.length)
        ),
        allCustomers.length
      ), { skipOwned: false });
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

  async function requestApiJson(path, options = {}) {
    const response = await window.fetch(`/api${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.error || `Request failed with status ${response.status}`);
    }
    return data;
  }

  function normalizeRoomCodeForUrl(value) {
    return String(value || "")
      .trim()
      .toUpperCase()
      .replace(/[\s_]+/g, "-")
      .replace(/[^A-Z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function roomCodeFromInput(value) {
    const raw = String(value || "").trim();
    if (!raw) {
      return "";
    }
    try {
      const parsedUrl = new URL(raw, window.location.origin);
      const roomParam = parsedUrl.searchParams.get("room");
      if (roomParam) {
        return normalizeRoomCodeForUrl(roomParam);
      }
    } catch (error) {
      // Treat plain text as a room code below.
    }
    return normalizeRoomCodeForUrl(raw);
  }

  function getStoredMultiplayerPlayerId(roomCode) {
    try {
      const stored = JSON.parse(window.localStorage?.getItem(multiplayerStorageKey) || "{}");
      return String(stored?.[String(roomCode || "").toUpperCase()] || "");
    } catch (error) {
      return "";
    }
  }

  function storeMultiplayerPlayer(roomCode, playerId) {
    const safeRoomCode = String(roomCode || "").toUpperCase();
    const safePlayerId = String(playerId || "");
    if (!safeRoomCode || !safePlayerId) {
      return;
    }
    try {
      const stored = JSON.parse(window.localStorage?.getItem(multiplayerStorageKey) || "{}");
      window.localStorage?.setItem(multiplayerStorageKey, JSON.stringify({
        ...(stored && typeof stored === "object" ? stored : {}),
        [safeRoomCode]: safePlayerId,
      }));
    } catch (error) {
      // The room still works in this tab even if local storage is blocked.
    }
  }

  function defaultMultiplayerName() {
    const profile = getProfile();
    return String(profile?.restaurantName || profile?.playerName || "").trim().slice(0, 40);
  }

  function multiplayerShareUrl(roomCode) {
    const url = new URL(restaurantPlayPath(), window.location.origin);
    url.searchParams.set("room", String(roomCode || "").toUpperCase());
    return url.toString();
  }

  function multiplayerShareText(roomCode) {
    const safeRoomCode = String(roomCode || "").toUpperCase();
    if (isSeriesRoom()) {
      return `You have been invited to play a 3-game Restaurant Challenge trivia series.\nRoom code: ${safeRoomCode}\nPress the link above to join.`;
    }
    return `You have been invited to play a multiplayer Restaurant Challenge trivia game.\nRoom code: ${safeRoomCode}\nPress the link above to join.`;
  }

  function multiplayerShareMessage(roomCode, shareUrl) {
    return `${shareUrl}\n\n${multiplayerShareText(roomCode)}`;
  }

  async function loadMultiplayerRoom(roomCode) {
    const safeRoomCode = String(roomCode || "").trim().toUpperCase();
    if (!safeRoomCode) {
      return null;
    }
    const data = await requestApiJson(`/multiplayer/rooms/${encodeURIComponent(safeRoomCode)}`, { method: "GET" });
    state.multiplayerRoom = data.room || null;
    state.multiplayerPlayers = Array.isArray(data.players) ? data.players : [];
    const storedPlayerId = getStoredMultiplayerPlayerId(safeRoomCode);
    state.multiplayerPlayer = state.multiplayerPlayers.find((player) => player.id === storedPlayerId) || state.multiplayerPlayer;
    if (state.multiplayerPlayer) {
      startMultiplayerRefresh();
      ensureCurrentRoomSession();
      syncLiveRoomToSession();
    }
    return data;
  }

  async function refreshMultiplayerRoom({ redraw = false } = {}) {
    const roomCode = String(state.multiplayerRoom?.roomCode || multiplayerRoomCodeParam || "").toUpperCase();
    if (!roomCode) {
      return;
    }
    const activeElement = document.activeElement;
    const userIsTypingInJoinForm = Boolean(
      activeElement &&
        activeElement.closest?.("#multiplayer-join-form") &&
        (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA" || activeElement.tagName === "SELECT")
    );
    const previousLiveStatus = String(state.multiplayerRoom?.liveStatus || "");
    try {
      await loadMultiplayerRoom(roomCode);
      state.multiplayerError = "";
      if (userIsTypingInJoinForm && !state.multiplayerPlayer) {
        return;
      }
      const liveStatusChanged = previousLiveStatus && previousLiveStatus !== String(state.multiplayerRoom?.liveStatus || "");
      if (redraw && liveStatusChanged) {
        renderAll();
      } else {
        refreshMultiplayerCardSlot();
      }
    } catch (error) {
      state.multiplayerError = "Room updates are paused. Refresh the page to try again.";
      if (redraw) {
        renderAll();
      } else {
        refreshMultiplayerCardSlot();
      }
    }
  }

  function startMultiplayerRefresh() {
    if (multiplayerRefreshTimer || !(state.multiplayerRoom?.roomCode || multiplayerRoomCodeParam)) {
      return;
    }
    multiplayerRefreshTimer = window.setInterval(() => {
      if (!state.multiplayerRoom?.roomCode && !multiplayerRoomCodeParam) {
        stopMultiplayerRefresh();
        return;
      }
      void refreshMultiplayerRoom({ redraw: shouldRedrawMultiplayerRefresh() });
    }, isLiveRoundRoom() ? liveRoundRefreshDelayMs : multiplayerRefreshDelayMs);
  }

  function stopMultiplayerRefresh() {
    if (multiplayerRefreshTimer) {
      window.clearInterval(multiplayerRefreshTimer);
      multiplayerRefreshTimer = null;
    }
  }

  function clearMultiplayerStateForFreshGame() {
    stopMultiplayerRefresh();
    state.multiplayerRoom = null;
    state.multiplayerPlayer = null;
    state.multiplayerPlayers = [];
    state.multiplayerError = "";
    state.multiplayerMessage = "";
    state.multiplayerLoading = false;
    state.liveAdvanceInFlight = false;
    if (window.history?.replaceState && (query.has("room") || query.has("multiplayer"))) {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.delete("room");
      nextUrl.searchParams.delete("multiplayer");
      nextUrl.searchParams.set("play", "1");
      window.history.replaceState({}, "", nextUrl.toString());
    }
  }

  function isLiveRoundRoom() {
    return state.multiplayerRoom?.mode === "live";
  }

  function isSeriesRoom() {
    return state.multiplayerRoom?.seriesMode === "three-game";
  }

  function currentSeriesGame() {
    return Math.max(1, Number(state.multiplayerRoom?.currentSeriesGame) || 1);
  }

  function seriesTotalGames() {
    return Math.max(1, Number(state.multiplayerRoom?.seriesTotalGames) || (isSeriesRoom() ? 3 : 1));
  }

  function sessionMatchesCurrentRoom(session = getSession()) {
    if (!session || !state.multiplayerRoom) {
      return false;
    }
    return (
      String(session.multiplayerRoomCode || "").toUpperCase() === String(state.multiplayerRoom.roomCode || "").toUpperCase() &&
      String(session.multiplayerPlayerId || "") === String(state.multiplayerPlayer?.id || "") &&
      Math.max(1, Number(session.multiplayerSeriesGame) || 1) === currentSeriesGame()
    );
  }

  function isMultiplayerSetupMode() {
    return !replayCustomer && (query.get("multiplayer") === "1" || multiplayerRoomCodeParam || multiplayerJoinMode);
  }

  function shouldShowMultiplayerSetupBeforeReveal(session) {
    if (!session || session.completed || state.showGame || !isMultiplayerSetupMode()) {
      return false;
    }
    if (!state.multiplayerRoom) {
      return true;
    }
    return state.multiplayerRoom.liveStatus !== "active" && state.multiplayerRoom.liveStatus !== "review";
  }

  function shouldRedrawMultiplayerRefresh() {
    const session = getSession();
    if (session?.completed || state.multiplayerRoom?.liveStatus === "completed") {
      return false;
    }
    return !state.showGame || isLiveRoundRoom();
  }

  function liveRoomTimeLeftSeconds() {
    const endsAt = Date.parse(state.multiplayerRoom?.questionEndsAt || "");
    if (!endsAt) {
      return 0;
    }
    return Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
  }

  function liveRoomQuestionExpired() {
    const endsAt = Date.parse(state.multiplayerRoom?.questionEndsAt || "");
    return Boolean(endsAt && endsAt <= Date.now());
  }

  function liveRoomReviewTimeLeftSeconds() {
    const endsAt = Date.parse(state.multiplayerRoom?.reviewEndsAt || "");
    if (!endsAt) {
      return 0;
    }
    return Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
  }

  function liveRoomPlayersAnsweredCurrentQuestion() {
    if (!isLiveRoundRoom() || state.multiplayerRoom?.liveStatus !== "active") {
      return false;
    }
    const players = Array.isArray(state.multiplayerPlayers) ? state.multiplayerPlayers : [];
    const activePlayers = players.filter((player) => player.status !== "did_not_finish");
    if (!activePlayers.length) {
      return false;
    }
    const currentIndex = Math.max(0, Number(state.multiplayerRoom.currentQuestionIndex) || 0);
    return activePlayers.every((player) =>
      player.status === "completed" || Number(player.answeredQuestionIndex ?? -1) >= currentIndex
    );
  }

  function roomPlayersCompletedCurrentGame() {
    const players = Array.isArray(state.multiplayerPlayers) ? state.multiplayerPlayers : [];
    const activePlayers = players.filter((player) => player.status !== "did_not_finish");
    if (!activePlayers.length) {
      return false;
    }
    return activePlayers.every((player) => player.status === "completed");
  }

  async function startLiveRound() {
    const roomCode = String(state.multiplayerRoom?.roomCode || "").toUpperCase();
    if (!roomCode) return;
    state.multiplayerLoading = true;
    state.multiplayerMessage = "Starting live round...";
    renderAll();
    try {
      const data = await requestApiJson(`/multiplayer/rooms/${encodeURIComponent(roomCode)}`, {
        method: "POST",
        body: JSON.stringify({ action: "start-live" }),
      });
      state.multiplayerRoom = data.room || state.multiplayerRoom;
      state.multiplayerPlayers = Array.isArray(data.players) ? data.players : state.multiplayerPlayers;
      state.multiplayerLoading = false;
      state.multiplayerMessage = "Live round started.";
      state.showGame = true;
      syncLiveRoomToSession();
      renderAll();
    } catch (error) {
      state.multiplayerLoading = false;
      state.multiplayerError = error instanceof Error ? error.message : "Unable to start the live round.";
      renderAll();
    }
  }

  async function prepareNextSeriesGame() {
    const roomCode = String(state.multiplayerRoom?.roomCode || "").toUpperCase();
    if (!roomCode || !isSeriesRoom()) return;
    state.multiplayerLoading = true;
    state.multiplayerMessage = `Preparing Game ${Math.min(currentSeriesGame() + 1, seriesTotalGames())}...`;
    renderAll();
    try {
      const session = core.startNewSession(restaurantSlug, {
        multiplayerRoomCode: roomCode,
        multiplayerPlayerId: state.multiplayerPlayer?.id || "",
        multiplayerSeriesGame: Math.min(currentSeriesGame() + 1, seriesTotalGames()),
      });
      if (!session) {
        throw new Error(`No available characters are ready for ${restaurant?.name || "this restaurant"} right now.`);
      }
      const data = await requestApiJson(`/multiplayer/rooms/${encodeURIComponent(roomCode)}`, {
        method: "POST",
        body: JSON.stringify({
          action: "prepare-series-game",
          customerId: session.customer?.id || "",
          questionIds: (session.questions || []).map((question) => question.id).filter(Boolean),
        }),
      });
      state.multiplayerRoom = data.room || state.multiplayerRoom;
      state.multiplayerPlayers = Array.isArray(data.players) ? data.players : state.multiplayerPlayers;
      startCurrentRoomSession();
      state.multiplayerLoading = false;
      state.multiplayerMessage = `Game ${currentSeriesGame()} is ready. Start when everyone is ready.`;
      state.showGame = false;
      renderAll();
    } catch (error) {
      state.multiplayerLoading = false;
      state.multiplayerError = error instanceof Error ? error.message : "Unable to prepare the next series game.";
      renderAll();
    }
  }

  async function advanceLiveRound() {
    const roomCode = String(state.multiplayerRoom?.roomCode || multiplayerRoomCodeParam || "").toUpperCase();
    if (!roomCode || state.liveAdvanceInFlight) return;
    state.liveAdvanceInFlight = true;
    try {
      const data = await requestApiJson(`/multiplayer/rooms/${encodeURIComponent(roomCode)}`, {
        method: "POST",
        body: JSON.stringify({
          action: "advance-live",
          expectedLiveStatus: state.multiplayerRoom?.liveStatus || "",
          expectedQuestionIndex: Number(state.multiplayerRoom?.currentQuestionIndex) || 0,
        }),
      });
      state.multiplayerRoom = data.room || state.multiplayerRoom;
      state.multiplayerPlayers = Array.isArray(data.players) ? data.players : state.multiplayerPlayers;
      syncLiveRoomToSession();
      renderAll();
    } catch (error) {
      state.multiplayerError = "Live round updates are paused. Refresh the page to try again.";
    } finally {
      state.liveAdvanceInFlight = false;
    }
  }

  function syncLiveRoomToSession() {
    if (!isLiveRoundRoom()) {
      return;
    }
    const room = state.multiplayerRoom;
    const session = getSession();
    if (!session || session.completed) {
      return;
    }
    const targetIndex = Math.max(0, Number(room.currentQuestionIndex) || 0);
    const totalQuestions = session.questions.length;
    let advancedForMissedAnswers = false;

    while (!getSession()?.completed && getSession()?.currentIndex < Math.min(targetIndex, totalQuestions)) {
      core.answerActiveSession(-1);
      advancedForMissedAnswers = true;
    }
    if (advancedForMissedAnswers) {
      const progressedSession = getSession();
      if (progressedSession) {
        void syncMultiplayerProgress(progressedSession);
      }
    }

    if (room.liveStatus === "completed" || targetIndex >= totalQuestions) {
      while (!getSession()?.completed) {
        core.answerActiveSession(-1);
      }
      const completedSession = getSession();
      if (completedSession?.completed) {
        setResultVisibleSessionId(completedSession.id);
        void syncMultiplayerFinish(completedSession);
      }
      return;
    }

    if (room.liveStatus === "review") {
      state.showGame = true;
      if (liveRoomReviewTimeLeftSeconds() <= 0) {
        void advanceLiveRound();
      }
      return;
    }

    if (room.liveStatus === "active") {
      state.showGame = true;
      if (liveRoomQuestionExpired()) {
        if (getSession()?.currentIndex <= Math.min(targetIndex, totalQuestions - 1)) {
          core.answerActiveSession(-1);
          const missedSession = getSession();
          if (missedSession) {
            void syncMultiplayerProgress(missedSession);
          }
        }
        void advanceLiveRound();
      } else if (liveRoomPlayersAnsweredCurrentQuestion()) {
        void advanceLiveRound();
      }
    }
  }

  function startCurrentRoomSession() {
    if (!state.multiplayerRoom || !state.multiplayerPlayer) {
      return null;
    }
    const session = core.startNewSession(restaurantSlug, {
      customerId: state.multiplayerRoom.customerId,
      questionIds: state.multiplayerRoom.questionIds,
      multiplayerRoomCode: state.multiplayerRoom.roomCode,
      multiplayerPlayerId: state.multiplayerPlayer.id || "",
      multiplayerSeriesGame: currentSeriesGame(),
    });
    if (session) {
      clearResultVisibleSessionId();
      state.feedback = null;
      state.isLocked = false;
      state.showGame = false;
    }
    return session;
  }

  function ensureCurrentRoomSession() {
    if (!state.multiplayerRoom || !state.multiplayerPlayer) {
      return null;
    }
    const session = getSession();
    if (sessionMatchesCurrentRoom(session)) {
      return session;
    }
    return startCurrentRoomSession();
  }

  function getSortedRoomPlayers() {
    const players = Array.isArray(state.multiplayerPlayers) ? state.multiplayerPlayers : [];
    if (isSeriesRoom()) {
      return players.slice().sort((left, right) => {
        const totalDelta = (Number(right.seriesTotalScore) || 0) - (Number(left.seriesTotalScore) || 0);
        if (totalDelta) return totalDelta;
        const scoreDelta = (Number(right.score) || 0) - (Number(left.score) || 0);
        if (scoreDelta) return scoreDelta;
        return String(left.displayName || "").localeCompare(String(right.displayName || ""));
      });
    }
    return players.slice().sort((left, right) => {
      const leftCompleted = left.status === "completed";
      const rightCompleted = right.status === "completed";
      if (leftCompleted !== rightCompleted) {
        return rightCompleted ? 1 : -1;
      }
      if ((right.score || 0) !== (left.score || 0)) {
        return (right.score || 0) - (left.score || 0);
      }
      return String(left.displayName || "").localeCompare(String(right.displayName || ""));
    });
  }

  function roomWinnerMarkup(showGroupResults = false) {
    const players = getSortedRoomPlayers();
    const completedPlayers = players.filter((player) => player.status === "completed");
    if (isSeriesRoom()) {
      const seriesPlayers = players.filter((player) => player.status !== "did_not_finish" || Number(player.seriesTotalScore) > 0);
      const hasSeriesScore = seriesPlayers.some((player) =>
        (Number(player.seriesCompletedGames) || 0) > 0 || (Number(player.seriesTotalScore) || 0) > 0
      );
      if (!seriesPlayers.length || !hasSeriesScore) {
        return showGroupResults
          ? `<p class="copy multiplayer-results-note">No series scores yet. This will update after Game 1.</p>`
          : "";
      }
      const finalSeries = currentSeriesGame() >= seriesTotalGames()
        && (state.multiplayerRoom?.liveStatus === "completed" || roomPlayersCompletedCurrentGame());
      const topTotal = Math.max(...seriesPlayers.map((player) => Number(player.seriesTotalScore) || 0));
      const leaders = seriesPlayers.filter((player) => (Number(player.seriesTotalScore) || 0) === topTotal);
      const leaderNames = leaders.map((player) => player.displayName || "Player").join(", ");
      const resultHeading = finalSeries
        ? leaders.length > 1 ? "Series Tie" : "Series Winner"
        : leaders.length > 1 ? "Series Leaders" : "Series Leader";
      const totalLabel = finalSeries && leaders.length > 1 ? "Tie total" : "Top total";
      return `
        <div class="multiplayer-winner-panel">
          <p class="kicker">${finalSeries ? "Final Series Results" : `Series Standings After Game ${Math.max(1, currentSeriesGame() - (state.multiplayerRoom?.liveStatus === "waiting" ? 1 : 0))}`}</p>
          <h3 class="section-title">${resultHeading}: ${escapeHtml(leaderNames)}</h3>
          <p class="copy">${totalLabel}: ${topTotal}/${seriesTotalGames() * 10} correct</p>
        </div>
      `;
    }
    if (!completedPlayers.length) {
      return showGroupResults
        ? `<p class="copy multiplayer-results-note">No one has finished yet. This will update as players complete their games.</p>`
        : "";
    }
    const topScore = Number(completedPlayers[0].score) || 0;
    const winners = completedPlayers.filter((player) => Number(player.score) === topScore);
    const winnerNames = winners.map((player) => player.displayName || "Player").join(", ");
    const waitingForPlayers = showGroupResults && players.some((player) => player.status !== "completed" && player.status !== "did_not_finish");
    if (waitingForPlayers) {
      return `
        <div class="multiplayer-winner-panel">
          <p class="kicker">Group Results</p>
          <h3 class="section-title">Results still coming in</h3>
          <p class="copy">Current top score: ${topScore}/${Number(completedPlayers[0].totalQuestions) || 10}</p>
        </div>
      `;
    }
    return `
      <div class="multiplayer-winner-panel">
        <p class="kicker">${showGroupResults ? "Group Results" : "Current Leader"}</p>
        <h3 class="section-title">${
          showGroupResults
            ? winners.length > 1 ? "Winners" : "Winner"
            : winners.length > 1 ? "Leaders" : "Leader"
        }: ${escapeHtml(winnerNames)}</h3>
        <p class="copy">Top score: ${topScore}/${Number(completedPlayers[0].totalQuestions) || 10}</p>
      </div>
    `;
  }

  function roomLeaderboardMarkup(showGroupResults = false, options = {}) {
    const players = getSortedRoomPlayers();
    if (!players.length) {
      return `<p class="copy">No room scores yet.</p>`;
    }
    const includeWinner = options.includeWinner !== false;
    return `
      ${includeWinner ? roomWinnerMarkup(showGroupResults) : ""}
      <div class="multiplayer-leaderboard-list">
        ${players
          .map((player, index) => {
            const scoreText = `${Number(player.score) || 0}/${Number(player.totalQuestions) || 10}`;
            const seriesText = isSeriesRoom()
              ? `Series ${Number(player.seriesTotalScore) || 0}/${seriesTotalGames() * 10}`
              : "";
            const status = player.status === "completed"
              ? (seriesText ? `${scoreText} · ${seriesText}` : scoreText)
              : isLiveRoundRoom() && player.status !== "did_not_finish"
                ? `${scoreText} · ${seriesText ? `${seriesText} · ` : ""}In Progress`
                : player.status === "did_not_finish"
                  ? "Did Not Finish"
                  : "In Progress";
            return `
              <article class="multiplayer-leaderboard-row">
                <strong class="multiplayer-rank">#${index + 1}</strong>
                <div class="multiplayer-player-name">${escapeHtml(player.displayName || "Player")}</div>
                <div class="multiplayer-player-status">
                  <span>${escapeHtml(status)}</span>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function isMultiplayerRoomClosed() {
    const room = state.multiplayerRoom;
    if (!room) {
      return false;
    }
    const expiresAt = Date.parse(room.expiresAt || "");
    return room.status === "closed" || Boolean(expiresAt && expiresAt <= Date.now());
  }

  function getCollectionEntryForSession(session) {
    const profile = getProfile();
    const collection = Array.isArray(profile?.customerCollection) ? profile.customerCollection : [];
    return collection.find(
      (entry) => entry.customerId === session?.customer?.id
    ) || null;
  }

  function getBestScoreForCustomer(customerId, collectionEntry = null) {
    const storedBest = Math.max(0, Number(collectionEntry?.bestScore) || 0);
    if (storedBest) {
      return storedBest;
    }

    const profile = getProfile();
    const sessions = Array.isArray(profile?.recentSessions) ? profile.recentSessions : [];
    return sessions.reduce((bestScore, session) => {
      if (session?.customerId !== customerId) {
        return bestScore;
      }

      return Math.max(bestScore, Number(session.score) || 0);
    }, 0);
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

    let existingSession = getSession();
    if (query.get("multiplayer") === "1" && existingSession) {
      core.clearActiveSession();
      clearResultVisibleSessionId();
      existingSession = null;
    }
    const requestedReplayCustomerChanged = Boolean(
      replayCustomerId &&
        existingSession &&
        !existingSession.completed &&
        existingSession.customer?.id !== replayCustomerId
    );
    if ((freshMode && !shouldResumeQuestions(existingSession)) || requestedReplayCustomerChanged) {
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

    if (multiplayerRoomCodeParam) {
      try {
        await loadMultiplayerRoom(multiplayerRoomCodeParam);
      } catch (error) {
        state.multiplayerError = error instanceof Error ? error.message : "Unable to load this room.";
      }
    }

    if ((playMode || autoPlayMode) && !multiplayerRoomCodeParam && query.get("multiplayer") !== "1") {
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

    if (reward.alreadyAwarded) {
      return "";
    }

    const statusMarkup = state.feedbackRewardMessage
      ? `<p class="helper feedback-reward-status" aria-live="polite">${escapeHtml(state.feedbackRewardMessage)}</p>`
      : "";
    const errorMarkup = state.feedbackRewardError
      ? `<p class="error feedback-reward-error" aria-live="polite">${escapeHtml(state.feedbackRewardError)}</p>`
      : "";
    const surveyQuestions = (restaurant?.feedbackSurveyQuestions || []).filter((question) => question.active !== false);
    const feedbackSurveyIntro = "Create your own survey questions using ratings, Yes/No, multiple choice, 1-5 scale, or written responses. View your survey results anytime in your private dashboard.";
    const feedbackSubmitText = "Send Feedback & Claim Character";

    return `
      <div class="hero-card feedback-reward-card">
        <div class="feedback-reward-copy">
          <p class="feedback-reward-bonus-title">⭐ Bonus Character Available</p>
        </div>
        <div class="feedback-reward-customer">
          <img class="feedback-reward-photo" src="${reward.customer.image}" alt="${escapeHtml(reward.customer.name)}" />
          <div>
            <h3 class="section-title">${escapeHtml(reward.customer.name)}</h3>
            <p class="copy">This rare character is only available by answering a 60-second survey.</p>
            <div class="button-row">
              <button class="button button-hot feedback-reward-unlock" id="feedback-reward-open" type="button">Unlock ${escapeHtml(reward.customer.name)}</button>
            </div>
          </div>
        </div>
        ${
          state.showFeedbackRewardForm || state.feedbackRewardError
            ? `
              <form class="feedback-reward-form" id="feedback-reward-form">
                ${isSalesDemoMode() ? `<p class="feedback-survey-demo-intro">${escapeHtml(feedbackSurveyIntro)}</p>` : ""}
                ${isSalesDemoMode() ? `<p class="feedback-survey-demo-example">Examples of questions your restaurant could ask:</p>` : ""}
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
      const originalSubmitText = submitButton?.textContent || "Send Feedback & Claim Character";
      let didRedraw = false;
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
        void Promise.resolve(core.submitFeedbackSurveyResponse?.(restaurantSlug, answers)).catch((submitError) => {
          console.warn("Feedback survey submission will retry through normal profile sync if needed.", submitError);
        });

        const outcome = core.awardFeedbackReward?.(restaurantSlug, {
          message: answers.map((answer) => `${answer.questionText}: ${answer.value}`).join("\n"),
        });
        if (!outcome?.ok) {
          state.feedbackRewardError = outcome?.message || "Unable to claim this reward right now.";
          renderAll();
          didRedraw = true;
          return;
        }

        void Promise.resolve(core.syncActiveProfile?.()).catch(() => {
          // The profile is still saved locally; the normal sync path will retry on later changes.
        });

        state.showFeedbackRewardForm = false;
        state.feedbackRewardError = "";
        state.feedbackSurveyAnswers = [];
        state.feedbackRewardMessage = isSalesDemoMode()
          ? `${outcome.customer?.name || "This character"} is now in your character collection.`
          : outcome.message || `${outcome.customer?.name || "This character"} is now in your collection.`;
        renderAll();
        didRedraw = true;
      } catch (error) {
        console.error("Feedback reward display failed.", error);
        state.feedbackRewardError = error instanceof Error ? error.message : "Unable to claim this reward right now.";
        try {
          renderAll();
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

  function renderMultiplayerCard() {
    if (replayCustomer) {
      return "";
    }
    const room = state.multiplayerRoom;
    const roomCode = String(room?.roomCode || multiplayerRoomCodeParam || "").toUpperCase();
    const shareUrl = roomCode ? multiplayerShareUrl(roomCode) : "";
    const roomStatus = room?.status === "closed" ? "Room closed" : "Room open for about 15 minutes";
    const activeSession = getSession();
    const showGroupResults = Boolean(activeSession?.completed || room?.status === "closed");
    const isLiveRoom = room?.mode === "live";
    const isHost = Boolean(state.multiplayerPlayer?.host);
    const liveWaiting = isLiveRoom && room?.liveStatus === "waiting";
    const liveActive = isLiveRoom && room?.liveStatus === "active";
    const seriesRoom = isSeriesRoom();
    const finalSeriesGame = seriesRoom && currentSeriesGame() >= seriesTotalGames();
    const finalSeriesComplete = finalSeriesGame && roomPlayersCompletedCurrentGame();
    const includeWinnerInRoomCard = !(showGroupResults && activeSession?.completed);
    const liveStatusMarkup = isLiveRoom
      ? finalSeriesComplete
        ? `<p class="helper" style="margin: 0 0 12px;">Final series results are ready.</p>`
        : liveWaiting
        ? `<p class="helper" style="margin: 0 0 12px;">Live Round is waiting for the host to start. Everyone will get each question together.</p>`
        : liveActive
          ? `<p class="helper" style="margin: 0 0 12px;">Live question ${Math.min((Number(room.currentQuestionIndex) || 0) + 1, (room.questionIds || []).length || 10)} is running. About ${liveRoomTimeLeftSeconds()} seconds left.</p>`
          : room?.liveStatus === "review"
            ? `<p class="helper" style="margin: 0 0 12px;">Showing answers. Next question starts in about ${liveRoomReviewTimeLeftSeconds()} seconds.</p>`
            : `<p class="helper" style="margin: 0 0 12px;">Live Round results are ready.</p>`
      : "";
    const errorMarkup = state.multiplayerError ? `<p class="error" aria-live="polite">${escapeHtml(state.multiplayerError)}</p>` : "";
    const messageMarkup = state.multiplayerMessage ? `<p class="helper" aria-live="polite">${escapeHtml(state.multiplayerMessage)}</p>` : "";

    if ((roomCode || multiplayerJoinMode) && !state.multiplayerPlayer) {
      const targetRoomCode = roomCode || "";
      const knownRoom = Boolean(targetRoomCode);
      return `
        <div class="hero-card result-followup-card" style="margin-top: 16px; padding: 16px;">
          <p class="kicker">Play With Friends</p>
          <h3 class="section-title" style="font-size: 1.2rem; margin-bottom: 8px;">${knownRoom ? `Confirm your name for room ${escapeHtml(targetRoomCode)}` : "Join friends' game"}</h3>
          <p class="copy" style="margin: 0 0 12px;">${knownRoom ? "Choose the name everyone will see, then enter the room." : "Everyone gets the same questions at the same time."}</p>
          ${knownRoom ? "" : `<p class="helper" style="margin: 0 0 12px;">Room codes are not case-sensitive. A space works instead of the dash.</p>`}
          <form class="input-grid" id="multiplayer-join-form">
            ${
              knownRoom
                ? ""
                : `
                  <div class="field">
                    <label class="field-label" for="multiplayer-room-code">Room code</label>
                    <input class="input" id="multiplayer-room-code" name="roomCode" maxlength="240" value="${escapeHtml(state.multiplayerJoinCode)}" placeholder="Pepper Meadow or invite link" autocomplete="off" />
                  </div>
                `
            }
            <div class="field">
              <label class="field-label" for="multiplayer-name">Name shown in this room</label>
              <input class="input" id="multiplayer-name" name="displayName" maxlength="40" value="${escapeHtml(state.multiplayerName || defaultMultiplayerName())}" placeholder="Your name" />
              <p class="helper" style="margin: 8px 0 0;">Guests start with their generated restaurant name. Changing this only changes the name shown in this room.</p>
            </div>
            ${errorMarkup}
            ${messageMarkup}
            <div class="button-row">
              <button class="button button-hot" type="submit" ${state.multiplayerLoading ? "disabled" : ""}>${knownRoom ? "Enter Room" : "Join Room"}</button>
              <a class="button button-muted" href="${restaurantBasePath()}">Play Solo Instead</a>
            </div>
          </form>
        </div>
      `;
    }

    if (room && state.multiplayerPlayer) {
      const roomFinished = showGroupResults;
      const seriesGameCompleted = seriesRoom && room?.liveStatus === "completed";
      const canPrepareNextSeriesGame = seriesRoom && (seriesGameCompleted || roomPlayersCompletedCurrentGame()) && !finalSeriesGame && isHost;
      const liveWaitingHostInstructions = liveWaiting && isHost
        ? `
          <div class="multiplayer-host-steps" aria-label="How to start the live round">
            <div class="multiplayer-host-step">
              <strong>1. Share the invite</strong>
              <span>Send the link, or tell friends to press Join Friends' Game and enter room code ${escapeHtml(roomCode)}.</span>
            </div>
            <div class="multiplayer-host-step">
              <strong>2. Wait for everyone to join</strong>
              <span>Players will show in the list below. You can start with any number of players.</span>
            </div>
            <div class="multiplayer-host-step">
              <strong>3. Start ${seriesRoom ? `Game ${currentSeriesGame()}` : "the live round"}</strong>
              <span>Press Start ${seriesRoom ? `Game ${currentSeriesGame()}` : "Live Round"} when your group is ready. Everyone will get the same questions at the same time.</span>
            </div>
          </div>
        `
        : "";
      const multiplayerActionsMarkup = canPrepareNextSeriesGame
        ? `
          <p class="helper" style="margin: 0 0 12px;">Game ${currentSeriesGame()} is complete. Prepare Game ${currentSeriesGame() + 1} with a new character and new questions.</p>
          <div class="button-row">
            <button class="button button-hot" id="prepare-next-series-game-button" type="button" ${state.multiplayerLoading ? "disabled" : ""}>Prepare Game ${currentSeriesGame() + 1}</button>
            <a class="button button-muted" href="${restaurantBasePath()}">Back to Game</a>
          </div>
        `
        : roomFinished
        ? `
          <p class="helper" style="margin: 0 0 12px;">${seriesRoom && finalSeriesGame ? "This 3-game series is complete." : "This room is finished. You can go back to the game screen or start a fresh multiplayer room."}</p>
          <div class="button-row">
            <a class="button button-muted" href="${restaurantBasePath()}">Back to Game</a>
            <a class="button button-hot" href="${restaurantPlayPath()}?multiplayer=1">${seriesRoom ? "Create New Series" : "Create New Multiplayer Game"}</a>
          </div>
        `
        : `
          <div class="input-grid">
            <div class="field">
              <label class="field-label" for="multiplayer-share-link">Share link</label>
              <input class="input" id="multiplayer-share-link" readonly value="${escapeHtml(shareUrl)}" />
            </div>
          </div>
          <div class="button-row">
            <button class="button button-hot" id="share-multiplayer-room-button" type="button">Share Invite</button>
            <button class="button button-muted" id="copy-multiplayer-room-button" type="button">Copy Invite</button>
            ${liveWaiting && isHost ? `<button class="button button-hot" id="start-live-round-button" type="button" ${state.multiplayerLoading ? "disabled" : ""}>Start ${seriesRoom ? `Game ${currentSeriesGame()}` : "Live Round"}</button>` : ""}
          </div>
        `;
      return `
        <div class="hero-card result-followup-card multiplayer-room-card" style="margin-top: 16px; padding: 16px;">
          <div class="multiplayer-room-heading">
            <div>
              <p class="kicker">Play With Friends</p>
              <h3 class="section-title" style="font-size: 1.2rem; margin-bottom: 8px;">${seriesRoom ? `3 Game Series - Game ${currentSeriesGame()} of ${seriesTotalGames()}` : liveWaiting && isHost ? "Your live room is ready." : `Room ${escapeHtml(roomCode)}`}</h3>
              <p class="copy" style="margin: 0 0 12px;">${roomFinished ? (seriesRoom ? "Series standings are ready." : "Group results are ready.") : `${escapeHtml(roomStatus)}. Share this room with friends, then start when everyone is ready.`}</p>
            </div>
            <div class="multiplayer-room-code-box" aria-label="Room code">
              <span>Room Code</span>
              <strong>${escapeHtml(roomCode)}</strong>
            </div>
          </div>
          <p class="helper" style="margin: 0 0 12px;">Room codes are not case-sensitive. Friends can type a space instead of the dash.</p>
          ${liveStatusMarkup}
          ${liveWaitingHostInstructions}
          ${multiplayerActionsMarkup}
          ${messageMarkup}
          <div id="multiplayer-leaderboard-slot">
            ${roomLeaderboardMarkup(showGroupResults, { includeWinner: includeWinnerInRoomCard })}
          </div>
        </div>
      `;
    }

    return `
      <div class="hero-card result-followup-card" style="margin-top: 16px; padding: 16px;">
        <p class="kicker">Play With Friends</p>
        <h3 class="section-title" style="font-size: 1.2rem; margin-bottom: 8px;">Create or join a Live Round.</h3>
        <p class="copy" style="margin: 0 0 12px;">Friends join by code or link, then everyone gets the same questions at the same time.</p>
        ${errorMarkup}
        ${messageMarkup}
        <div class="button-row">
          <button class="button button-hot" id="create-live-room-button" type="button" ${state.multiplayerLoading ? "disabled" : ""}>Create Live Round</button>
          <button class="button button-muted" id="create-series-room-button" type="button" ${state.multiplayerLoading ? "disabled" : ""}>Create 3 Game Series</button>
          <a class="button button-muted" href="${restaurantPlayPath()}?multiplayer=1&join=1">Join Friends' Game</a>
        </div>
      </div>
    `;
  }

  function bindMultiplayerCard() {
    const createLiveButton = document.getElementById("create-live-room-button");
    if (createLiveButton) {
      createLiveButton.addEventListener("click", () => {
        void createMultiplayerRoom("live");
      });
    }

    const createSeriesButton = document.getElementById("create-series-room-button");
    if (createSeriesButton) {
      createSeriesButton.addEventListener("click", () => {
        void createMultiplayerRoom("live", { seriesMode: "three-game" });
      });
    }

    const joinForm = document.getElementById("multiplayer-join-form");
    if (joinForm) {
      joinForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(joinForm);
        state.multiplayerName = String(formData.get("displayName") || "").trim();
        state.multiplayerJoinCode = roomCodeFromInput(formData.get("roomCode") || multiplayerRoomCodeParam || "");
        if (!state.multiplayerJoinCode) {
          state.multiplayerError = "Enter the room code your friend shared.";
          renderAll();
          return;
        }
        void joinMultiplayerRoom(state.multiplayerJoinCode);
      });
    }

    const shareButton = document.getElementById("share-multiplayer-room-button");
    if (shareButton) {
      shareButton.addEventListener("click", () => {
        void shareMultiplayerRoom();
      });
    }

    const copyButton = document.getElementById("copy-multiplayer-room-button");
    if (copyButton) {
      copyButton.addEventListener("click", () => {
        void copyMultiplayerRoomLink();
      });
    }

    const startLiveButton = document.getElementById("start-live-round-button");
    if (startLiveButton) {
      startLiveButton.addEventListener("click", () => {
        void startLiveRound();
      });
    }

    const prepareNextSeriesGameButton = document.getElementById("prepare-next-series-game-button");
    if (prepareNextSeriesGameButton) {
      prepareNextSeriesGameButton.addEventListener("click", () => {
        void prepareNextSeriesGame();
      });
    }
  }

  function refreshMultiplayerCardSlot() {
    const slot = document.getElementById("multiplayer-card-slot");
    const winnerSlot = document.getElementById("multiplayer-winner-slot");
    if (winnerSlot && state.multiplayerRoom) {
      winnerSlot.innerHTML = roomWinnerMarkup(true);
    }
    const leaderboardSlot = document.getElementById("multiplayer-leaderboard-slot");
    if (leaderboardSlot && state.multiplayerRoom.liveStatus === "waiting") {
      const session = getSession();
      const showGroupResults = Boolean(session?.completed || state.multiplayerRoom.status === "closed");
      const includeWinner = !(showGroupResults && session?.completed);
      leaderboardSlot.innerHTML = roomLeaderboardMarkup(showGroupResults, { includeWinner });
      return;
    }
    if (!slot || !state.multiplayerRoom) {
      return;
    }
    slot.innerHTML = renderMultiplayerCard();
    bindMultiplayerCard();
  }

  async function copyMultiplayerRoomLink() {
    const roomCode = String(state.multiplayerRoom?.roomCode || multiplayerRoomCodeParam || "").toUpperCase();
    const shareUrl = roomCode ? multiplayerShareUrl(roomCode) : "";
    if (!shareUrl) {
      return;
    }
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard is unavailable.");
      }
      await navigator.clipboard.writeText(multiplayerShareMessage(roomCode, shareUrl));
      state.multiplayerMessage = "Invite message copied.";
    } catch (error) {
      state.multiplayerMessage = "Copy the invite link from the box above.";
    }
    renderAll();
  }

  async function shareMultiplayerRoom() {
    const roomCode = String(state.multiplayerRoom?.roomCode || multiplayerRoomCodeParam || "").toUpperCase();
    const shareUrl = roomCode ? multiplayerShareUrl(roomCode) : "";
    if (!shareUrl) {
      return;
    }
    const shareData = {
      title: "Restaurant Challenge room",
      text: multiplayerShareMessage(roomCode, shareUrl),
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        state.multiplayerMessage = "Invite ready to send.";
        renderAll();
        return;
      } catch (error) {
        if (String(error?.name || "") === "AbortError") {
          return;
        }
      }
    }
    await copyMultiplayerRoomLink();
  }

  async function requireSaveReadyBeforePlay() {
    const issue = core.getActiveProfileSaveIssue?.();
    if (!issue) {
      try {
        await Promise.race([
          Promise.resolve(core.syncActiveProfile?.()),
          new Promise((resolve) => window.setTimeout(resolve, 2500)),
        ]);
      } catch (error) {
        console.warn("Profile sync before play failed; continuing with local progress.", error);
      }
      return true;
    }

    console.warn("Profile needs sign-in for server sync; continuing with local progress.", issue);
    return true;
  }

  function renderSetup() {
    const profile = getProfile();
    const session = getSession();
    const multiplayerFocusMode = isMultiplayerSetupMode();
    const openingCustomers = getDisplayedOpeningCustomers();
    const safeOpeningCustomers = Array.isArray(openingCustomers) ? openingCustomers : [];
    const requestedReplayCustomerId = replayCustomer?.id || replayCustomerId;
    const startHref = requestedReplayCustomerId
      ? `${restaurantBasePath()}?play=1&fresh=1&customerId=${encodeURIComponent(requestedReplayCustomerId)}`
      : `${restaurantBasePath()}?play=1`;
    const introCopy = replayCustomer
      ? `This is a replay for ${replayCustomer.name}. If you score higher, you can increase this character's points. A lower score will not replace your best points.`
      : requestedReplayCustomerId
        ? "This is a replay for the character you selected. If you score higher, you can increase this character's points. A lower score will not replace your best points."
      : getOpenerCopy();
    const introCopyMarkup = introCopy
      ? `<p class="copy opening-title-copy">${escapeHtml(introCopy)}</p>`
      : "";
    const openingQuestion = isSalesDemoMode()
      ? ""
      : requestedReplayCustomerId
        ? "Can You Improve This Character?"
        : "Can You Unlock A New Character For Your Collection?";
    const demoExpectationLine = "In this demo you'll see: menu photo questions, restaurant trivia, collectible characters, and feedback surveys.";
    const startButtonText = requestedReplayCustomerId
      ? "PLAY AGAIN"
      : isSalesDemoMode()
        ? "PLAY THE THREE MINUTE DEMO"
        : "START THE GAME";
    if (multiplayerFocusMode && !requestedReplayCustomerId) {
      elements.start.innerHTML = `
        <div class="opening-start-shell">
          <div class="opening-start-heading">
            <p class="kicker" style="margin: 0 0 4px;">Play With Friends</p>
            <h2 class="opening-title">${escapeHtml(getGameTitle())}</h2>
            <p class="copy opening-title-copy">Create or join a room, then everyone gets the same questions at the same time.</p>
          </div>
          ${renderMultiplayerCard()}
          <div class="button-row opening-start-actions opening-start-actions-bottom">
            <a class="button button-muted" href="${restaurantBasePath()}">Back To Game</a>
          </div>
        </div>`;
      bindMultiplayerCard();
      return;
    }
    elements.start.innerHTML = `
      <div class="opening-start-shell">
        <div class="opening-start-heading">
          <h2 class="opening-title">${escapeHtml(getGameTitle())}</h2>
          ${introCopyMarkup}
          ${
            requestedReplayCustomerId
              ? `
                <p class="helper opening-start-helper opening-title-helper">
                  You are playing again for <strong>${escapeHtml(replayCustomer?.name || "the selected character")}</strong>. Your best points are protected.
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
              <p class="opening-guest-section-title">Collectible Characters</p>
              <div class="opening-guest-grid">
                ${safeOpeningCustomers
                  .map(
                    (customer) => `
                      <article class="opening-guest-card ${isSalesDemoMode() ? "opening-guest-card-demo" : ""}">
                        <img class="opening-guest-photo" src="${customer.image}" alt="${escapeHtml(customer.name)}" />
                        <div class="${openingCustomerCopyClass(customer)}">
                          <p class="opening-guest-name">${formatGuestDisplayName(customer.name)}</p>
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
            requestedReplayCustomerId
              ? `
                <a class="button button-muted" href="${restaurantBasePath()}?home=1">Cancel Replay</a>
                <a class="button button-muted" href="/restaurant/?hub=1#leaderboard-panel">View Leaderboard</a>
              `
              : profile && !isSalesDemoMode()
                ? `
                  <a class="button button-muted" href="/restaurant/?hub=1#leaderboard-panel">View Leaderboard</a>
                `
              : ""
          }
          ${!requestedReplayCustomerId ? `<a class="button button-muted" href="${restaurantPlayPath()}?multiplayer=1">Play With Friends</a>` : ""}
          ${
            session && !session.completed && !state.showGame
              ? `
                <button class="button button-muted" id="resume-game-button" type="button">Continue Current Game</button>
              `
              : ""
          }
        </div>
        ${isSalesDemoMode() ? `<p class="sales-demo-expectation">${escapeHtml(demoExpectationLine)}</p>` : ""}
      </div>`;

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
    const requestedReplayCustomerId = replayCustomer?.id || replayCustomerId;
    const startHref = requestedReplayCustomerId
      ? `${restaurantBasePath()}?play=1&fresh=1&customerId=${encodeURIComponent(requestedReplayCustomerId)}`
      : `${restaurantBasePath()}?play=1`;
    const openingQuestion = isSalesDemoMode()
      ? ""
      : requestedReplayCustomerId
        ? "Can You Improve This Character?"
        : "Can You Unlock A New Character For Your Collection?";
    const demoExpectationLine = "In this demo you'll see: menu photo questions, restaurant trivia, collectible characters, and feedback surveys.";
    const startButtonText = requestedReplayCustomerId
      ? "PLAY AGAIN"
      : isSalesDemoMode()
        ? "PLAY THE THREE MINUTE DEMO"
        : "START THE GAME";
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
              <p class="opening-guest-section-title">Collectible Characters</p>
              <div class="opening-guest-grid">
                ${getDisplayedOpeningCustomers()
                  .map(
                    (customer) => `
                      <article class="opening-guest-card ${isSalesDemoMode() ? "opening-guest-card-demo" : ""}">
                        <img class="opening-guest-photo" src="${customer.image}" alt="${escapeHtml(customer.name)}" />
                        <div class="${openingCustomerCopyClass(customer)}">
                          <p class="opening-guest-name">${formatGuestDisplayName(customer.name)}</p>
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
              ? `<a class="button button-muted" href="/restaurant/?hub=1#leaderboard-panel">View Leaderboard</a>`
              : ""
          }
          ${!isSalesDemoMode() ? "" : `<a class="button button-muted" href="${restaurantPlayPath()}?multiplayer=1">Play With Friends</a>`}
        </div>
        ${isSalesDemoMode() ? `<p class="sales-demo-expectation">${escapeHtml(demoExpectationLine)}</p>` : ""}
        ${renderMultiplayerCard()}
      </div>`;
    bindMultiplayerCard();

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
    const collectionEntry = getCollectionEntryForSession(session);
    const isFavoriteProgressReplay =
      ["regular", "occasional", "favorite"].includes(collectionEntry?.status);
    const revealKicker = salesDemoMode
      ? "Collectible Character Demo"
      : isFavoriteProgressReplay
        ? "Play Trivia To Improve This Character"
        : "Play Trivia To Unlock This Character";
    const revealBioMarkup = salesDemoMode
      ? `${escapeHtml(customer.name)} is an exclusive collectible character available only in your restaurant's game.<br />Players will come back to build their collection and unlock new characters.`
      : escapeHtml(customerBio);
    const revealType = "character";
    const unlockScore = core.getCustomerUnlockScore
      ? core.getCustomerUnlockScore(customer)
      : thresholds.occasional;
    const unlockValue = core.getCharacterScoreValue
      ? core.getCharacterScoreValue(customer, unlockScore)
      : customer.occasionalValue;
    const valuePerExtraCorrect = core.getCharacterValuePerExtraCorrect
      ? core.getCharacterValuePerExtraCorrect(customer)
      : Math.max(0, (Number(customer.regularValue) || 0) - (Number(customer.occasionalValue) || 0));
    const howToPlayText = salesDemoMode ? "See the Benefits" : "How to Play";
    const favoriteGoal = core.getFavoriteVisitGoal();
    const favoriteProgressMinScore = core.getFavoriteProgressMinScore
      ? core.getFavoriteProgressMinScore()
      : 7;
    const favoriteVisits = Math.max(0, Math.min(favoriteGoal, Number(collectionEntry?.favoriteVisits) || 0));
    const bestScore = collectionEntry ? getBestScoreForCustomer(customer.id, collectionEntry) : 0;
    const bestValue = Math.max(0, Number(collectionEntry?.customerValue) || 0);
    const nextValueScore = Math.min(10, Math.max(unlockScore, bestScore + 1));
    const revealEarningsMarkup = isFavoriteProgressReplay
      ? `
        <div class="customer-reveal-earnings">
          <p><strong>${escapeHtml(customer.name)}</strong> is already unlocked in your collection.</p>
          <p>Replay this character to improve your points with a better score and build Favorite progress.</p>
        </div>
      `
      : `
        <div class="customer-reveal-earnings">
          <p>Need <strong>${unlockScore} correct answers</strong> to unlock this character.</p>
          <p>Earn <strong>${core.formatCurrency(unlockValue)}</strong> for unlocking, plus <strong>${core.formatCurrency(valuePerExtraCorrect)}</strong> for each additional correct answer.</p>
        </div>
      `;
    const replayValueMarkup =
      collectionEntry && bestValue > 0
        ? `
          <div class="favorite-progress-note">
            <p class="kicker">Current Best</p>
            <p class="copy">${bestScore ? `Best score: <strong>${bestScore}/10</strong>. ` : ""}Best points: <strong>${core.formatCurrency(bestValue)}</strong>.</p>
            ${
              bestScore > 0 && bestScore < 10
                ? `<p class="helper">Each correct answer above ${bestScore}/10 can add ${core.formatCurrency(valuePerExtraCorrect)}. Score ${nextValueScore}/10 or better to increase these points.</p>`
                : bestScore === 0
                  ? `<p class="helper">Score higher than your previous best to increase these points.</p>`
                : `<p class="helper">You have already reached the top score for this character.</p>`
            }
          </div>
        `
        : "";
    const liveWaiting = isLiveRoundRoom() && state.multiplayerRoom?.liveStatus === "waiting";
    const liveActive = isLiveRoundRoom() && state.multiplayerRoom?.liveStatus === "active";
    if (salesDemoMode) {
      elements.start.innerHTML = `
        <div class="customer-reveal-shell customer-reveal-shell-demo">
          <div class="customer-reveal-copy">
            <p class="kicker">Restaurant Demo Game</p>
            <h2 class="opening-title">Ready to play the demo?</h2>
            <p class="copy opening-title-copy">Answer 10 quick trivia questions and see how a restaurant-branded game can work for guests.</p>
            <div class="button-row customer-reveal-actions">
              ${
                isLiveRoundRoom()
                  ? `<button class="button button-hot" id="begin-questions-button" type="button" ${liveWaiting ? "disabled" : ""}>${liveWaiting ? "Waiting For Host" : liveActive ? "Join Live Question" : "View Live Results"}</button>`
                  : `<button class="button button-hot" id="begin-questions-button" type="button">Begin Questions</button>`
              }
              <button class="button button-muted" id="reveal-how-to-play-button" type="button" data-how-to-play-button>${escapeHtml(howToPlayText)}</button>
            </div>
          </div>
        </div>
        ${state.multiplayerRoom ? renderMultiplayerCard() : ""}
        ${howToPlayModalHtml(true)}
      `;
      bindHowToPlay();
      bindMultiplayerCard();
      const beginButton = document.getElementById("begin-questions-button");
      if (beginButton) {
        beginButton.addEventListener("click", async () => {
          if (!(await requireSaveReadyBeforePlay())) {
            return;
          }
          if (isLiveRoundRoom() && state.multiplayerRoom?.liveStatus === "review") {
            renderLiveReviewPanel(session);
            return;
          }
          state.showGame = true;
          renderAll();
        });
      }
      return;
    }
    const favoriteBonusMarkup =
      isFavoriteProgressReplay && collectionEntry.status !== "favorite"
        ? `
          <div class="favorite-progress-note">
            <p class="kicker">Favorite Progress</p>
            <p class="copy">Score <strong>${favoriteProgressMinScore}/10 or better</strong> with this character to build Favorite progress. After <strong>${favoriteGoal} successful visits</strong>, they become a Favorite Character and their best points double.</p>
            <p class="helper">Current Favorite progress: ${favoriteVisits}/${favoriteGoal}</p>
          </div>
        `
        : collectionEntry?.status === "favorite"
          ? `
            <div class="favorite-progress-note favorite-progress-note-complete">
              <p class="kicker">Favorite Character</p>
              <p class="copy">${escapeHtml(customer.name)} is already a Favorite Character. Their best points count double.</p>
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
            ${revealEarningsMarkup}
            ${replayValueMarkup}
            ${favoriteBonusMarkup}
            <div class="button-row customer-reveal-actions">
              ${
                isLiveRoundRoom()
                  ? `<button class="button button-hot" id="begin-questions-button" type="button" ${liveWaiting ? "disabled" : ""}>${liveWaiting ? "Waiting For Host" : liveActive ? "Join Live Question" : "View Live Results"}</button>`
                  : `<button class="button button-hot" id="begin-questions-button" type="button">Begin Questions</button>`
              }
              ${salesDemoMode ? "" : `<a class="button button-muted" href="/restaurant/?hub=1#leaderboard-panel">View Leaderboard</a>`}
              <button class="button button-muted" id="reveal-how-to-play-button" type="button" data-how-to-play-button>${escapeHtml(howToPlayText)}</button>
            </div>
          </div>
        </div>
      </div>
      ${state.multiplayerRoom ? renderMultiplayerCard() : ""}
      ${howToPlayModalHtml(isSalesDemoMode())}
    `;
    bindHowToPlay();
    bindMultiplayerCard();

    document.getElementById("begin-questions-button")?.addEventListener("click", async () => {
      if (!(await requireSaveReadyBeforePlay())) {
        return;
      }
      if (liveWaiting) {
        return;
      }
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
    if (!(await requireSaveReadyBeforePlay())) {
      return;
    }

    await core.waitForRestaurantSpecificCustomers?.(restaurantSlug);
    const requestedReplayCustomerId = replayCustomer?.id || replayCustomerId;
    const options = requestedReplayCustomerId ? { customerId: requestedReplayCustomerId } : {};
    const session = core.startNewSession(restaurantSlug, options);
    if (!session) {
      window.alert(`No available guests are ready for ${restaurant?.name || "this restaurant"} right now. Please try again.`);
      return;
    }
    clearResultVisibleSessionId();
    state.feedback = null;
    state.isLocked = false;
    state.showGame = false;
    renderAll();
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const revealTop = Math.max(0, elements.start.getBoundingClientRect().top + window.scrollY - 12);
        window.scrollTo({ top: revealTop, behavior: "smooth" });
      });
    });
  }

  async function createMultiplayerRoom(mode = "casual", options = {}) {
    state.multiplayerLoading = true;
    state.multiplayerError = "";
    state.multiplayerMessage = "Creating room...";
    renderAll();

    try {
      const profile = ensurePlayableProfile();
      if (profile) {
        core.setActiveProfileId(profile.id);
      }
      if (!(await requireSaveReadyBeforePlay())) {
        state.multiplayerLoading = false;
        state.multiplayerMessage = "";
        renderAll();
        return;
      }
      const session = core.startNewSession(restaurantSlug, {});
      if (!session) {
        throw new Error(`No available characters are ready for ${restaurant?.name || "this restaurant"} right now.`);
      }

      const data = await requestApiJson("/multiplayer/rooms", {
        method: "POST",
        body: JSON.stringify({
          restaurantSlug,
          customerId: session.customer?.id || "",
          questionIds: (session.questions || []).map((question) => question.id).filter(Boolean),
          hostName: defaultMultiplayerName() || "Host",
          profileId: session.profileId || "",
          sessionId: session.id || "",
          mode,
          seriesMode: options.seriesMode || "",
        }),
      });

      state.multiplayerRoom = data.room || null;
      state.multiplayerPlayer = data.player || null;
      state.multiplayerPlayers = Array.isArray(data.players) ? data.players : [];
      if (state.multiplayerRoom?.roomCode && state.multiplayerPlayer?.id) {
        storeMultiplayerPlayer(state.multiplayerRoom.roomCode, state.multiplayerPlayer.id);
      }
      startCurrentRoomSession();
      startMultiplayerRefresh();
      state.multiplayerMessage = state.multiplayerRoom?.seriesMode === "three-game"
        ? `3 Game Series ${state.multiplayerRoom?.roomCode || ""} is ready. Share the link, then start Game 1 when everyone has joined.`
        : mode === "live"
        ? `Live Round ${state.multiplayerRoom?.roomCode || ""} is ready. Share the link, then start when everyone has joined.`
        : `Room ${state.multiplayerRoom?.roomCode || ""} is ready. Share the link with friends.`;
      state.multiplayerLoading = false;
      clearResultVisibleSessionId();
      state.feedback = null;
      state.isLocked = false;
      state.showGame = false;
      renderAll();
    } catch (error) {
      core.clearActiveSession();
      state.multiplayerLoading = false;
      state.multiplayerMessage = "";
      state.multiplayerError = error instanceof Error ? error.message : "Unable to create a room right now.";
      renderAll();
    }
  }

  async function joinMultiplayerRoom(roomCode) {
    const safeRoomCode = String(roomCode || "").trim().toUpperCase();
    if (!safeRoomCode) {
      return;
    }
    state.multiplayerLoading = true;
    state.multiplayerError = "";
    state.multiplayerMessage = "Joining room...";
    renderAll();

    try {
      const roomState = await loadMultiplayerRoom(safeRoomCode);
      const room = roomState?.room;
      if (!room || room.status === "closed") {
        throw new Error("This room is closed.");
      }
      const roomRestaurantSlug = String(room.restaurantSlug || "").trim();
      if (roomRestaurantSlug && roomRestaurantSlug !== restaurantSlug) {
        const redirectUrl = new URL(`/${roomRestaurantSlug}/play/`, window.location.origin);
        redirectUrl.searchParams.set("room", normalizeRoomCodeForUrl(safeRoomCode));
        if (state.multiplayerName) {
          redirectUrl.searchParams.set("name", state.multiplayerName);
        }
        window.location.href = redirectUrl.toString();
        return;
      }

      let profile = ensurePlayableProfile();
      if (profile) {
        const displayName = state.multiplayerName || defaultMultiplayerName();
        if (displayName && displayName !== profile.playerName) {
          profile = core.updateProfile({
            ...profile,
            playerName: displayName,
          }) || profile;
        }
        core.setActiveProfileId(profile.id);
      }

      const joinData = await requestApiJson(`/multiplayer/rooms/${encodeURIComponent(safeRoomCode)}`, {
        method: "POST",
        body: JSON.stringify({
          action: "join",
          displayName: state.multiplayerName || defaultMultiplayerName() || "Player",
          profileId: profile?.id || "",
        }),
      });

      state.multiplayerRoom = joinData.room || room;
      state.multiplayerPlayer = joinData.player || null;
      state.multiplayerPlayers = Array.isArray(joinData.players) ? joinData.players : [];
      if (state.multiplayerRoom?.roomCode && state.multiplayerPlayer?.id) {
        storeMultiplayerPlayer(state.multiplayerRoom.roomCode, state.multiplayerPlayer.id);
      }
      startMultiplayerRefresh();

      const session = startCurrentRoomSession();
      if (!session) {
        throw new Error("Unable to start this room game on this device.");
      }

      state.multiplayerLoading = false;
      state.multiplayerMessage = `Joined room ${state.multiplayerRoom.roomCode}.`;
      clearResultVisibleSessionId();
      state.feedback = null;
      state.isLocked = false;
      state.showGame = false;
      renderAll();
    } catch (error) {
      core.clearActiveSession();
      state.multiplayerLoading = false;
      state.multiplayerMessage = "";
      state.multiplayerError = error instanceof Error ? error.message : "Unable to join this room right now.";
      renderAll();
    }
  }

  async function syncMultiplayerFinish(session) {
    const roomCode = String(state.multiplayerRoom?.roomCode || session?.multiplayerRoomCode || multiplayerRoomCodeParam || "").toUpperCase();
    const playerId = String(state.multiplayerPlayer?.id || session?.multiplayerPlayerId || getStoredMultiplayerPlayerId(roomCode) || "");
    if (!roomCode || !playerId || !session?.completed) {
      return;
    }
    try {
      const latestAnswer = Array.isArray(session.answers) && session.answers.length
        ? session.answers[session.answers.length - 1]
        : null;
      const data = await requestApiJson(`/multiplayer/rooms/${encodeURIComponent(roomCode)}`, {
        method: "POST",
        body: JSON.stringify({
          action: "finish",
          playerId,
          profileId: session.profileId || "",
          sessionId: session.id || "",
          score: session.score,
          totalQuestions: session.questions?.length || 10,
          result: session.result || "",
          completedAt: session.completedAt || new Date().toISOString(),
          answeredQuestionIndex: latestAnswer ? Math.max(0, session.currentIndex - 1) : -1,
          lastAnswerCorrect: Boolean(latestAnswer?.isCorrect),
          lastSelectedIndex: Number.isFinite(Number(latestAnswer?.selectedIndex)) ? Number(latestAnswer.selectedIndex) : -1,
        }),
      });
      state.multiplayerRoom = data.room || state.multiplayerRoom;
      state.multiplayerPlayer = data.player || state.multiplayerPlayer;
      state.multiplayerPlayers = Array.isArray(data.players) ? data.players : state.multiplayerPlayers;
      state.multiplayerMessage = "Room leaderboard updated.";
    } catch (error) {
      state.multiplayerError = "Your normal game was saved, but the room leaderboard did not update.";
    }
  }

  async function syncMultiplayerProgress(session) {
    const roomCode = String(state.multiplayerRoom?.roomCode || session?.multiplayerRoomCode || multiplayerRoomCodeParam || "").toUpperCase();
    const playerId = String(state.multiplayerPlayer?.id || session?.multiplayerPlayerId || getStoredMultiplayerPlayerId(roomCode) || "");
    if (!roomCode || !playerId || !session) {
      return;
    }
    try {
      const latestAnswer = Array.isArray(session.answers) && session.answers.length
        ? session.answers[session.answers.length - 1]
        : null;
      const data = await requestApiJson(`/multiplayer/rooms/${encodeURIComponent(roomCode)}`, {
        method: "POST",
        body: JSON.stringify({
          action: "progress",
          playerId,
          profileId: session.profileId || "",
          sessionId: session.id || "",
          score: session.score,
          totalQuestions: session.questions?.length || 10,
          result: session.result || "",
          status: session.completed ? "completed" : "in_progress",
          completedAt: session.completedAt || "",
          answeredQuestionIndex: latestAnswer ? Math.max(0, session.currentIndex - 1) : -1,
          lastAnswerCorrect: Boolean(latestAnswer?.isCorrect),
          lastSelectedIndex: Number.isFinite(Number(latestAnswer?.selectedIndex)) ? Number(latestAnswer.selectedIndex) : -1,
        }),
      });
      state.multiplayerRoom = data.room || state.multiplayerRoom;
      state.multiplayerPlayer = data.player || state.multiplayerPlayer;
      state.multiplayerPlayers = Array.isArray(data.players) ? data.players : state.multiplayerPlayers;
      if (liveRoomPlayersAnsweredCurrentQuestion()) {
        void advanceLiveRound();
      }
    } catch {
      // Normal profile/session saving still happens; room progress will retry on the next answer or finish.
    }
  }

  function renderLiveReviewPanel(session) {
    const currentIndex = Math.max(0, Number(state.multiplayerRoom?.currentQuestionIndex) || 0);
    const question = session.questions[currentIndex] || session.questions[session.currentIndex - 1];
    const correctAnswer = question?.options?.[question.correctIndex] || "";
    const players = getSortedRoomPlayers();
    const answeredPlayers = players.filter((player) => Number(player.answeredQuestionIndex ?? -1) >= currentIndex);
    const answerStatusLabel = (player) => {
      if (Number(player.lastSelectedIndex ?? -1) < 0) {
        return "Did not answer";
      }
      return player.lastAnswerCorrect ? "Correct" : "Incorrect";
    };
    elements.game.classList.remove("hidden");
    elements.start.classList.add("hidden");
    elements.result.classList.add("hidden");
    elements.game.innerHTML = `
      <div class="question-shell">
        <div class="hero-card" style="margin-top: 0;">
          <p class="kicker">Live Round</p>
          <h2 class="section-title">Correct answer: ${escapeHtml(correctAnswer || "Shown after this question")}</h2>
          <p class="copy">Next question starts in about ${liveRoomReviewTimeLeftSeconds()} seconds.</p>
          <div class="multiplayer-leaderboard-list" style="margin-top: 16px;">
            ${
              answeredPlayers.length
                ? answeredPlayers
                    .map((player, index) => `
                      <article class="multiplayer-leaderboard-row">
                        <strong class="multiplayer-rank">#${index + 1}</strong>
                        <div class="multiplayer-player-name">${escapeHtml(player.displayName || "Player")}</div>
                        <div class="multiplayer-player-status">
                          <span>${escapeHtml(answerStatusLabel(player))} · ${Number(player.score) || 0}/${Number(player.totalQuestions) || 10}</span>
                        </div>
                      </article>
                    `)
                    .join("")
                : `<p class="copy">Waiting for room answers...</p>`
            }
          </div>
        </div>
      </div>
    `;
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

    if (
      isLiveRoundRoom() &&
      state.multiplayerRoom?.liveStatus === "active" &&
      !state.feedback &&
      session.currentIndex > Math.max(0, Number(state.multiplayerRoom.currentQuestionIndex) || 0)
    ) {
      elements.game.classList.remove("hidden");
      elements.start.classList.add("hidden");
      elements.result.classList.add("hidden");
      elements.game.innerHTML = `
        <div class="question-shell">
          <div class="hero-card" style="margin-top: 0;">
            <p class="kicker">Live Round</p>
            <h2 class="section-title">Answer locked in.</h2>
            <p class="copy">Waiting for the next question. About ${Math.max(0, liveRoomTimeLeftSeconds())} seconds left.</p>
            ${roomLeaderboardMarkup(false)}
          </div>
        </div>
      `;
      return;
    }

    if (isLiveRoundRoom() && state.multiplayerRoom?.liveStatus === "review" && !state.feedback) {
      renderLiveReviewPanel(session);
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
    const customerUnlockScore = core.getCustomerUnlockScore
      ? core.getCustomerUnlockScore(session.customer)
      : customerThresholds.occasional;
    const customerUnlockValue = core.getCharacterScoreValue
      ? core.getCharacterScoreValue(session.customer, customerUnlockScore)
      : session.customer.occasionalValue;
    const customerValuePerExtraCorrect = core.getCharacterValuePerExtraCorrect
      ? core.getCharacterValuePerExtraCorrect(session.customer)
      : Math.max(0, (Number(session.customer.regularValue) || 0) - (Number(session.customer.occasionalValue) || 0));
    const isCharacterUnlocked = session.score >= customerUnlockScore;
    const liveRoundMarkup = isLiveRoundRoom()
      ? state.multiplayerRoom?.liveStatus === "review"
        ? `<span class="chip gold">Review ${Math.max(0, liveRoomReviewTimeLeftSeconds())}s</span>`
        : `<span class="chip gold">Live ${Math.max(0, liveRoomTimeLeftSeconds())}s</span>`
      : "";
    const currentCharacterValue = core.getCharacterScoreValue
      ? core.getCharacterScoreValue(session.customer, session.score)
      : isCharacterUnlocked
        ? customerUnlockValue
        : 0;
    const unlockStatusChip = isSalesDemoMode()
      ? ""
      : isCharacterUnlocked
        ? `<span class="chip">Unlocked</span>`
        : `<span class="chip">Need ${Math.max(0, customerUnlockScore - session.score)} more</span>`;
    const currentValueChip = isSalesDemoMode()
      ? ""
      : isCharacterUnlocked
        ? `<span class="chip">Current points ${core.formatCurrency(currentCharacterValue)}</span>`
        : "";
    const customerInfoCardMarkup = isSalesDemoMode()
      ? ""
      : `
        <div class="hero-card question-customer-card" style="margin-top: 0;">
          <div class="customer-card-top question-customer-top">
            <img class="customer-avatar question-customer-avatar" src="${session.customer.image}" alt="${escapeHtml(session.customer.name)}" />
            <div>
              <p class="customer-name">${escapeHtml(session.customer.name)}</p>
              <p class="customer-bio">${escapeHtml(customerBio)}</p>
              <div class="chip-row" style="margin-top: 10px;">
                <span class="chip">${escapeHtml(session.customer.rarity || "Rare")} character</span>
                <span class="chip">Unlock at ${customerUnlockScore}/10</span>
                <span class="chip">Unlock points ${core.formatCurrency(customerUnlockValue)}</span>
                <span class="chip">+${core.formatCurrency(customerValuePerExtraCorrect)} per extra correct</span>
              </div>
            </div>
          </div>
        </div>
      `;

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
            ${liveRoundMarkup}
            ${unlockStatusChip}
            ${currentValueChip}
          </div>
        </div>

        ${customerInfoCardMarkup}

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
    if (isMultiplayerRoomClosed()) {
      state.multiplayerError = "This room is closed, so no new answers can be accepted.";
      renderAll();
      return;
    }
    if (isLiveRoundRoom() && state.multiplayerRoom?.liveStatus !== "active") {
      state.multiplayerError = "The live round is not accepting answers right now.";
      renderAll();
      return;
    }
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
      void syncMultiplayerFinish(outcome.session).then(() => {
        const session = getSession();
        if (session && session.completed) {
          renderResultPanel(session);
        }
      });
    } else if (isLiveRoundRoom() && outcome.session) {
      void syncMultiplayerProgress(outcome.session);
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
      ? `You can expand to ${preview.next.label} now and add ${core.formatCurrency(preview.valueAdded)} to your restaurant score.`
      : affordableUpgrade
        ? `${affordableUpgrade.label} is available now. Upgrades add score and can boost future points.`
        : `You are ${core.formatCurrency(shortfall)} away from ${preview.next.label}. A few more unlocked characters could help you expand.`;

    return `
      <details class="result-restaurant-growth" id="result-restaurant-growth">
        <summary class="button button-muted result-restaurant-growth-button">Grow Your Restaurant</summary>
        <div class="hero-card result-followup-card result-net-worth-prompt">
          <h3 class="section-title">Your restaurant can grow from here.</h3>
          <p class="copy">${escapeHtml(message)}</p>
          <div class="button-row">
            <a class="button button-hot" href="/restaurant/?hub=1#hero-panel">Open My Virtual Restaurant</a>
          </div>
        </div>
      </details>
    `;
  }

  function restaurantLeaderboardHref(metric = "characterPoints") {
    const params = new URLSearchParams({
      hub: "1",
      scope: "restaurant",
      restaurant: restaurantSlug,
      metric,
    });
    return `/restaurant/?${params.toString()}#leaderboard-panel`;
  }

  function resultLeaderboardPromptSlot(session) {
    if (state.resultLeaderboardSessionId === session.id && state.resultLeaderboardMarkup) {
      return state.resultLeaderboardMarkup;
    }
    return `<div id="result-leaderboard-rank-slot"></div>`;
  }

  function formatRankNumber(rank) {
    const safeRank = Math.max(1, Math.round(Number(rank) || 0));
    return `#${safeRank}`;
  }

  function resultLeaderboardPromptMarkup(row, nextRow) {
    const rank = Math.max(1, Math.round(Number(row?.rank) || 0));
    const value = Math.max(0, Math.round(Number(row?.value) || 0));
    const pointsNeeded = nextRow
      ? Math.max(1, Math.round(Number(nextRow.value) || 0) - value + 1)
      : 0;
    const leaderboardHref = restaurantLeaderboardHref("characterPoints");
    const moveUpText = nextRow
      ? `You need ${core.formatCurrency(pointsNeeded)} more to pass ${nextRow.restaurantName || "the restaurant above you"}.`
      : "You are in first place. Play again to make it harder for anyone to catch you.";

    return `
      <div class="hero-card result-followup-card result-leaderboard-rank-card" id="result-leaderboard-rank-slot">
        <div class="result-leaderboard-rank-copy">
          <p class="kicker">${escapeHtml(restaurant.name)} Leaderboard</p>
          <h3 class="section-title">You are now ranked ${formatRankNumber(rank)} in character points.</h3>
          <p class="copy">You have ${core.formatCurrency(value)} on the ${escapeHtml(restaurant.name)} leaderboard. ${escapeHtml(moveUpText)}</p>
        </div>
        <div class="button-row result-leaderboard-rank-actions">
          <a class="button button-hot" href="${leaderboardHref}">See the ${escapeHtml(restaurant.name)} Leaderboard</a>
        </div>
      </div>
    `;
  }

  function getCurrentCharacterPoints(profile) {
    if (!profile || !core.getProfileSummary) {
      return 0;
    }
    const summary = core.getProfileSummary(profile, restaurantSlug);
    return Math.max(0, Math.round(Number(summary?.stats?.estimatedSales) || 0));
  }

  function rankCurrentProfileWithLeaderboard(rows, profile) {
    const leaderboardRows = Array.isArray(rows) ? rows : [];
    const profileId = String(profile?.id || "").trim();
    if (!profileId) {
      return null;
    }

    const currentValue = getCurrentCharacterPoints(profile);
    const existingRows = leaderboardRows.filter((entry) => entry && entry.profileId !== profileId);
    const existingRow = leaderboardRows.find((entry) => entry?.profileId === profileId) || null;
    const currentRow = {
      ...(existingRow || {}),
      profileId,
      playerName: profile.playerName || existingRow?.playerName || "Guest Player",
      restaurantName: profile.restaurantName || existingRow?.restaurantName || "Guest Restaurant",
      value: Math.max(currentValue, Math.round(Number(existingRow?.value) || 0)),
    };

    const rankedRows = [...existingRows, currentRow]
      .sort((left, right) => {
        const valueDifference = (Number(right.value) || 0) - (Number(left.value) || 0);
        if (valueDifference) {
          return valueDifference;
        }
        return String(left.restaurantName || "").localeCompare(String(right.restaurantName || ""));
      })
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
    const rowIndex = rankedRows.findIndex((entry) => entry.profileId === profileId);
    if (rowIndex < 0) {
      return null;
    }

    return {
      row: rankedRows[rowIndex],
      nextRow: rowIndex > 0 ? rankedRows[rowIndex - 1] : null,
    };
  }

  async function loadResultLeaderboardPrompt(session, attempt = 1) {
    const profile = getProfile();
    if (
      isSalesDemoMode() ||
      !session?.id ||
      !profile?.id ||
      state.resultLeaderboardLoading ||
      (state.resultLeaderboardSessionId === session.id && state.resultLeaderboardMarkup)
    ) {
      return;
    }

    state.resultLeaderboardLoading = true;
    try {
      if (attempt === 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 900));
      }
      const params = new URLSearchParams({
        metric: "characterPoints",
        restaurantSlug,
      });
      const response = await fetch(`/api/leaderboard?${params.toString()}`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Leaderboard unavailable.");
      }
      const rows = await response.json();
      const rankedProfile = rankCurrentProfileWithLeaderboard(rows, profile);
      if (!rankedProfile) {
        if (attempt < 3) {
          state.resultLeaderboardLoading = false;
          window.setTimeout(() => loadResultLeaderboardPrompt(session, attempt + 1), 1400);
        }
        return;
      }

      state.resultLeaderboardSessionId = session.id;
      state.resultLeaderboardMarkup = resultLeaderboardPromptMarkup(rankedProfile.row, rankedProfile.nextRow);
      const slot = document.getElementById("result-leaderboard-rank-slot");
      if (slot) {
        slot.outerHTML = state.resultLeaderboardMarkup;
      }
    } catch {
      // This is a bonus prompt; the result screen should never depend on the leaderboard API.
    } finally {
      state.resultLeaderboardLoading = false;
    }
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
    const isGuest = Boolean(profile && profile.isGuest);
    const salesDemoMode = isSalesDemoMode();
    const demoCharacterUnlocked = salesDemoMode && ["favorite", "regular", "occasional"].includes(session.result);
    const unlockedThisRound = ["favorite", "regular", "occasional"].includes(session.result);
    const hadUnlockedBefore = ["favorite", "regular", "occasional"].includes(session.previousCustomerStatus);
    const isFourthGame = Number(overallSummary?.stats?.gamesPlayed) === 4;
    const resultLayoutMode = isGuest
      ? (state.showProfileForm ? "register-form" : "guest-prompt")
      : "return-actions";
    const label =
      session.result === "favorite"
        ? "Favorite Character"
        : session.result === "regular" || session.result === "occasional"
          ? "Character Unlocked"
          : "Character Not Unlocked";
    const customerBio = core.getCustomerBio(session.customer);
    const customerBioPreview = getBioPreview(customerBio);
    const favoriteProgress = session.favoriteProgress;
    const resultHeadline =
      salesDemoMode && session.result === "lost"
        ? "Almost there"
        : favoriteProgress?.becameFavorite
        ? "Favorite earned"
        : favoriteProgress?.wasEligible && favoriteProgress.successful
          ? "Bonus progress"
        : favoriteProgress?.wasEligible || (hadUnlockedBefore && session.result === "lost")
          ? "Still in your collection"
          : session.result === "regular" || session.result === "occasional"
        ? "Congratulations"
          : "Better luck next time";
    const resultSubheadline =
      demoCharacterUnlocked
        ? "You've Unlocked"
        : salesDemoMode
          ? "Character Not Unlocked"
        : favoriteProgress?.becameFavorite
        ? "New Favorite Character"
        : favoriteProgress?.wasEligible && favoriteProgress.successful
          ? "Favorite Progress +1"
        : favoriteProgress?.wasEligible
          ? "Favorite Progress Missed"
        : hadUnlockedBefore && session.result === "lost"
          ? "Already Collected"
            : session.result === "regular" || session.result === "occasional"
              ? "Character Unlocked"
              : "Character Not Unlocked";
    const customerValue = Math.max(0, Number(session.customerValue) || 0);
    const resultCollectionButtonText = "View Leaderboard";
    const resultAwardSummary = customerValue > 0
      ? `Score ${session.score}/${session.questions.length} • Points ${core.formatCurrency(customerValue)}`
      : `Score ${session.score}/${session.questions.length}`;
    const resultAwardMarkup = salesDemoMode
      ? `
          <div class="result-banner result-award-card result-banner-demo">
            <div class="result-celebration">
              <p class="result-celebration-kicker">Restaurant Demo Game</p>
              <h2 class="result-celebration-title">Demo Complete</h2>
            </div>
            <div class="result-customer-copy" style="justify-items: center; text-align: center;">
              <p class="customer-bio">This is how a fast, restaurant-branded trivia game can work for guests.</p>
              <a class="button button-muted result-collection-button" href="/get-your-own-game/">Get Your Own Game</a>
            </div>
            <p class="result-award-summary">Score ${session.score}/${session.questions.length}</p>
          </div>
        `
      : `
          <a class="result-banner result-award-card" href="/restaurant/?hub=1#leaderboard-panel" aria-label="View leaderboard">
            <div class="result-celebration">
              <p class="result-celebration-kicker">${escapeHtml(resultHeadline)} - ${escapeHtml(resultSubheadline)}</p>
              <h2 class="result-celebration-title">${escapeHtml(session.customer.name)}</h2>
            </div>
            <div class="result-customer-spotlight">
              <img class="result-customer-image" src="${session.customer.image}" alt="${escapeHtml(session.customer.name)}" />
              <div class="result-customer-copy">
                <p class="customer-bio">${escapeHtml(customerBioPreview.text)}</p>
                <span class="button button-muted result-collection-button">${escapeHtml(resultCollectionButtonText)}</span>
              </div>
            </div>
            <p class="result-award-summary">${escapeHtml(resultAwardSummary)}</p>
          </a>
        `;
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
    const leaderboardPromptMarkup = resultLeaderboardPromptSlot(session);
    const feedbackRewardMarkup = renderFeedbackRewardCard();
    const multiplayerWinnerMarkup = state.multiplayerRoom ? `<div id="multiplayer-winner-slot">${roomWinnerMarkup(true)}</div>` : "";
    const multiplayerMarkup = state.multiplayerRoom ? `<div id="multiplayer-card-slot">${renderMultiplayerCard()}</div>` : "";
    const showGuestSavePrompt =
      isGuest &&
      !state.showProfileForm &&
      (isFourthGame || salesDemoMode || !hadUnlockedBefore);

    elements.result.innerHTML = `
      <div class="result-screen result-screen-${resultLayoutMode}">
        <div class="result-top-layout">
          <div class="result-hero-panel">
            <img class="result-hero-image" src="${getHeroImage()}" alt="${escapeHtml(getHeroAlt())}" />
          </div>

          ${resultAwardMarkup}
        </div>

        ${multiplayerWinnerMarkup}
        <div class="divider"></div>
        ${multiplayerMarkup}
        ${!state.showProfileForm ? leaderboardPromptMarkup : ""}
        ${triviaLeaderboardMilestoneMarkup}
        ${
          showGuestSavePrompt
            ? `
              <div class="hero-card result-followup-card result-followup-card-guest" style="margin-top: 0; padding: 16px;">
                <p class="kicker" style="margin: 0 0 6px;">${isFourthGame ? "Trivia % Leaderboard" : salesDemoMode ? "Save Demo Progress" : "Save Your Character Collection"}</p>
                <h3 class="section-title" style="font-size: 1.2rem; margin-bottom: 8px;">${isFourthGame ? "Congratulations! You completed your 4th game." : salesDemoMode ? "Keep your demo score." : unlockedThisRound && !hadUnlockedBefore ? `You just unlocked ${escapeHtml(session.customer.name)}.` : `You did not unlock ${escapeHtml(session.customer.name)} this time.`}</h3>
                <p class="copy" style="margin: 0 0 12px;">${isFourthGame ? "Save your restaurant to view and keep your Trivia % leaderboard progress so far. No email required." : salesDemoMode ? "Save your demo progress if you want to see how profiles and leaderboards can work." : "Save your collection to keep and view your existing characters, track your trivia progress, and compete on the leaderboards. No email address is required."}</p>
                <div class="button-row">
                  <button class="button button-hot result-save-progress-button" id="register-now-button" type="button">
                    <span>${isFourthGame ? "Save My Restaurant" : salesDemoMode ? "Save Demo Progress" : "Save My Character Collection"}</span>
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
                  <h3 class="section-title" style="font-size: 1.2rem; margin-bottom: 8px;">${salesDemoMode ? "Save your demo progress." : `${escapeHtml(session.customer.name)} Is In Your Collection!`}</h3>
                  <p class="copy result-save-mobile-note" style="margin: 0 0 14px;">${salesDemoMode ? "Save now to keep your demo score and leaderboard progress." : "Save now to keep your characters, trivia record, and leaderboard progress."}</p>
                  <p class="copy" style="margin: 0 0 8px;">${salesDemoMode ? "Save your progress to:" : "Save your collection to:"}</p>
                  <ul class="copy" style="margin: 0 0 16px; padding-left: 20px; line-height: 1.45;">
                    <li>${salesDemoMode ? "Track your demo score" : "Keep all characters you unlock"}</li>
                    <li>Track your trivia record</li>
                    <li>Appear on the leaderboards</li>
                    <li>Grow a virtual restaurant if you want</li>
                  </ul>
                  <form class="input-grid" id="profile-form" style="margin-top: 8px;">
                    <div class="field">
                      <label class="field-label save-restaurant-label" for="restaurant-name">${salesDemoMode ? "Restaurant Name for the Leaderboards" : "Name Your Virtual Restaurant"}</label>
                      <p class="helper save-restaurant-helper">${salesDemoMode ? `This is the restaurant name other players will see on the leaderboards. You can keep the generated name or create your own.` : `This is how you will appear on the leaderboards. Make it yours by replacing "${escapeHtml(profile ? profile.restaurantName : "our suggestion")}", or keep that as your restaurant name.`}</p>
                      <input class="input save-restaurant-input" id="restaurant-name" name="restaurantName" type="text" maxlength="32" placeholder="Tim's Roadhouse" value="${escapeHtml(profile ? profile.restaurantName : "")}" data-suggested-name="${escapeHtml(profile ? profile.restaurantName : "")}" />
                    </div>
                    <p class="helper" style="margin: 0;">Your player name and email are private. Other players only see your virtual restaurant name on leaderboards.</p>
                    <div class="field">
                      <label class="field-label" for="player-name">Player name</label>
                      <input class="input" id="player-name" name="playerName" type="text" placeholder="Tim" value="${escapeHtml(profile ? profile.playerName : "")}" />
                    </div>
                    <div class="field">
                      <label class="field-label" for="profile-email">${salesDemoMode ? `Email <span style="font-weight: 500;">(optional - helps recover your collection)</span>` : `Email address <span style="font-weight: 500;">(optional)</span>`}</label>
                      <input class="input" id="profile-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" />
                    </div>
                    <button class="text-button" id="email-info-toggle" type="button">${state.emailInfoExpanded ? "Hide email note" : salesDemoMode ? "How email helps" : "Why save with email?"}</button>
                    <p class="helper ${state.emailInfoExpanded ? "" : "hidden"}" style="margin: 0;">${salesDemoMode ? "Email lets you recover your collection if you get a new phone, play on multiple devices, and avoid losing unlocked characters." : "Email is only used to send a secure recovery link. Without it, your virtual restaurant is saved in this browser, but it cannot be restored after clearing cache or changing devices."}</p>
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
                  <a class="button button-muted" href="${salesDemoMode ? "/get-your-own-game/" : "/restaurant/?hub=1#leaderboard-panel"}">${salesDemoMode ? "Get Your Own Game" : "View Leaderboard"}</a>
                  <button class="button button-muted" id="result-how-to-play-button" type="button" data-how-to-play-button>${salesDemoMode ? "See the Benefits" : "How to Play"}</button>
                  ${!salesDemoMode ? netWorthPromptMarkup : ""}
                </div>
              `
        }
        ${!state.showProfileForm ? feedbackRewardMarkup : ""}
        ${howToPlayModalHtml(isSalesDemoMode())}
      </div>
    `;
    bindHowToPlay();
    bindFeedbackRewardCard();
    bindMultiplayerCard();
    void loadResultLeaderboardPrompt(session);

    if (isGuest && !state.showProfileForm) {
      document.getElementById("register-now-button").addEventListener("click", () => {
        state.showProfileForm = true;
        state.registrationMessage = "";
        renderAll();
      });

      document.getElementById("guest-continue-button").addEventListener("click", () => {
        const replayingMultiplayer = Boolean(state.multiplayerRoom || multiplayerRoomCodeParam || multiplayerJoinMode || query.get("multiplayer") === "1");
        clearMultiplayerStateForFreshGame();
        core.clearActiveSession();
        clearResultVisibleSessionId();
        state.feedback = null;
        state.isLocked = false;
        if (replayingMultiplayer) {
          goToFreshMultiplayerSetup();
          return;
        }
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
        const replayingMultiplayer = Boolean(state.multiplayerRoom || multiplayerRoomCodeParam || multiplayerJoinMode || query.get("multiplayer") === "1");
        clearMultiplayerStateForFreshGame();
        core.clearActiveSession();
        clearResultVisibleSessionId();
        state.feedback = null;
        state.isLocked = false;
        state.showProfileForm = false;
        if (replayingMultiplayer) {
          goToFreshMultiplayerSetup();
          return;
        }
        void startGame();
      });
    }
  }

  function renderAll() {
    try {
      const salesDemoMode = isSalesDemoMode();
      updateSalesDemoBrand(salesDemoMode);
      document.title = `${getGameTitle()} | CommunityVerse Games`;
      if (salesDemoMode) {
        markSalesDemoVisit();
      }
      renderHero(false);
      if (playMode) {
        const session = getSession();
        if (session && session.completed) {
          updateSalesDemoCta(salesDemoMode, "Enjoying the demo?");
          state.showGame = false;
          elements.start.classList.add("hidden");
          elements.game.classList.add("hidden");
          elements.result.classList.remove("hidden");
          renderResultPanel(session);
          return;
        }

        if (shouldShowMultiplayerSetupBeforeReveal(session)) {
          updateSalesDemoCta(salesDemoMode, "See your own restaurant brought to life.");
          elements.start.classList.remove("hidden");
          elements.game.classList.add("hidden");
          elements.result.classList.add("hidden");
          state.showGame = false;
          renderSetup();
          return;
        }

        if (session && (state.showGame || shouldResumeQuestions(session))) {
          updateSalesDemoCta(salesDemoMode, "Imagine this with your menu and staff.");
          state.showGame = true;
          elements.start.classList.add("hidden");
          elements.game.classList.remove("hidden");
          elements.result.classList.add("hidden");
          renderGamePanel();
          return;
        }

        if (session && !state.showGame) {
          updateSalesDemoCta(salesDemoMode, "Imagine this game featuring your restaurant.");
          elements.start.classList.remove("hidden");
          elements.game.classList.add("hidden");
          elements.result.classList.add("hidden");
          renderCustomerRevealPanel(session);
          return;
        }

        updateSalesDemoCta(salesDemoMode, "See your own restaurant brought to life.");
        elements.start.classList.remove("hidden");
        elements.game.classList.add("hidden");
        elements.result.classList.add("hidden");
        state.showGame = false;
        if (query.get("multiplayer") === "1" || multiplayerRoomCodeParam || multiplayerJoinMode) {
          renderSetup();
        }
        return;
      }
      updateSalesDemoCta(salesDemoMode, "See your own restaurant brought to life.");
      if (query.get("multiplayer") === "1" || multiplayerRoomCodeParam || multiplayerJoinMode) {
        elements.start.classList.remove("hidden");
        elements.game.classList.add("hidden");
        elements.result.classList.add("hidden");
        state.showGame = false;
        renderSetup();
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
