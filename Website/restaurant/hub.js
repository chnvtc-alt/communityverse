(() => {
  const core = window.RestaurantChallengeCore;
  const query = new URLSearchParams(window.location.search);
  const editMode = query.has("edit");
  const hubMode = query.get("hub") === "1" || query.get("view") === "hub";
  const authCallbackMode = query.get("auth") === "callback";

  const metricOptions = [
    {
      value: "estimatedSales",
      label: "Sales",
      description: "Total sales from the customers each restaurant has earned.",
    },
    {
      value: "restaurantValue",
      label: "Value",
      description: "Combines size, upgrades, loyalty, recent sales, and rating.",
    },
    {
      value: "collected",
      label: "Customers",
      description: "Total customers collected, including regular and occasional customers.",
    },
    {
      value: "regularCustomers",
      label: "Regulars",
      description: "Regular customers only. These are the strongest customer wins.",
    },
    {
      value: "favoriteCustomers",
      label: "Favorites",
      description: "Favorite customers earned after repeated successful visits with a regular customer.",
    },
    {
      value: "gamesPlayed",
      label: "Games",
      description: "Total completed games played by each restaurant.",
    },
    {
      value: "rating",
      label: "Rating",
      description: "Answer accuracy shown as a 5-star customer rating.",
    },
  ];

  const state = {
    metric: "estimatedSales",
    leaderboardScope: "overall",
    leaderboardRestaurantSlug: "americana",
    selectedDirectorySlug: "",
    splashStatsScope: "overall",
    collectionFilter: "all",
    inviteBackCustomerId: "",
    selectedCustomerId: "",
    selectedCustomerBioExpanded: false,
    activeMobileTab: "overview",
    showSignIn: query.get("signin") === "1" || authCallbackMode,
    showConnectEmail: query.get("connect") === "1",
    connectInfoExpanded: false,
    authMessage: authCallbackMode ? "Verifying your secure sign-in link..." : "",
    authError: "",
    connectMessage: "",
    connectError: "",
    expansionMessage: "",
    expansionError: "",
  };

  const mobileHubQuery = "(max-width: 960px)";

  function withHubMode(url) {
    if (!hubMode) {
      return url;
    }

    const stringUrl = String(url || "");
    if (stringUrl.includes("hub=1")) {
      return stringUrl;
    }

    const [path, hash = ""] = stringUrl.split("#");
    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}hub=1${hash ? `#${hash}` : ""}`;
  }

  const elements = {
    tabs: null,
    mobileHeader: null,
    splashRestaurantSelect: document.getElementById("splash-restaurant-select"),
    splashPlayButton: document.getElementById("splash-play-button"),
    splashMyRestaurantButton: document.getElementById("splash-my-restaurant-button"),
    splashLeaderboardButton: document.getElementById("splash-leaderboard-button"),
    splashHowToPlayButton: document.getElementById("splash-how-to-play-button"),
    howToPlayModal: document.getElementById("how-to-play-modal"),
    splashPlayerRestaurantName: document.getElementById("splash-player-restaurant-name"),
    splashStatsScope: document.getElementById("splash-stats-scope"),
    splashRatingBadge: document.getElementById("splash-rating-badge"),
    splashCustomersBadge: document.getElementById("splash-customers-badge"),
    splashRankBadge: document.getElementById("splash-rank-badge"),
    hero: document.getElementById("hero-panel"),
    collection: document.getElementById("collection-panel"),
    leaderboard: document.getElementById("leaderboard-panel"),
    sections: document.querySelector(".grid-two"),
  };

  let howToPlayReturnFocus = null;

  function isMobileHub() {
    return window.matchMedia(mobileHubQuery).matches;
  }

  function ensureMobileHeader() {
    if (elements.mobileHeader) {
      return elements.mobileHeader;
    }

    const header = document.createElement("div");
    header.className = "mobile-hub-header";
    const topbar = document.querySelector(".topbar");
    if (topbar && topbar.parentNode) {
      topbar.insertAdjacentElement("afterend", header);
    }
    elements.mobileHeader = header;
    return header;
  }

  function ensureMobileTabs() {
    if (elements.tabs) {
      return elements.tabs;
    }

    const tabs = document.createElement("nav");
    tabs.className = "mobile-hub-tabs";
    tabs.setAttribute("aria-label", "Restaurant Challenge sections");
    elements.tabs = tabs;
    return tabs;
  }

  function renderMobileHeader() {
    if (!isMobileHub()) {
      if (elements.mobileHeader) {
        elements.mobileHeader.classList.add("hidden");
      }
      return;
    }

    const header = ensureMobileHeader();
    const tabs = ensureMobileTabs();
    header.classList.remove("hidden");
    header.innerHTML = `
      <div class="mobile-hub-title-panel hero-title-panel">
        <h1 class="page-title">Restaurant Challenge</h1>
      </div>
    `;
    header.appendChild(tabs);
  }

  function renderMobileTabs() {
    const tabs = ensureMobileTabs();
    tabs.innerHTML = `
      <button class="button ${state.activeMobileTab === "overview" ? "button-primary" : "button-muted"}" data-hub-tab="overview" type="button">Overview</button>
      <button class="button ${state.activeMobileTab === "collection" ? "button-primary" : "button-muted"}" data-hub-tab="collection" type="button">Customers</button>
      <button class="button ${state.activeMobileTab === "leaderboard" ? "button-primary" : "button-muted"}" data-hub-tab="leaderboard" type="button">Leaderboards</button>
    `;

    tabs.querySelectorAll("[data-hub-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        state.activeMobileTab = button.dataset.hubTab;
        renderAll();
        if (!isMobileHub()) {
          return;
        }

        requestAnimationFrame(() => {
          if (button.dataset.hubTab === "collection") {
            scrollMobileSection(elements.collection);
          } else if (button.dataset.hubTab === "leaderboard") {
            scrollMobileSection(elements.leaderboard, 18);
          } else {
            scrollMobileSection(elements.hero);
          }
        });
      });
    });
  }

  function renderSplashChooser() {
    if (hubMode || !elements.splashRestaurantSelect || !elements.splashPlayButton) {
      return;
    }

    const profile = core.getActiveProfile();
    const directoryRestaurants = getDirectoryRestaurants();
    const selectedSlug = state.selectedDirectorySlug || directoryRestaurants[0]?.slug || "americana";
    const selectedRestaurant =
      directoryRestaurants.find((restaurant) => restaurant.slug === selectedSlug) ||
      directoryRestaurants[0] ||
      null;

    elements.splashRestaurantSelect.innerHTML = directoryRestaurants
      .map(
        (restaurantOption) => `
          <option value="${restaurantOption.slug}" ${restaurantOption.slug === selectedRestaurant?.slug ? "selected" : ""}>
            ${escapeHtml(restaurantOption.name)}
          </option>
        `
      )
      .join("");

    elements.splashPlayButton.setAttribute("aria-disabled", selectedRestaurant?.available ? "false" : "true");
    elements.splashPlayButton.classList.toggle("is-disabled", !selectedRestaurant?.available);
    elements.splashPlayButton.href = selectedRestaurant?.available && selectedRestaurant.href ? selectedRestaurant.href : "#splash-chooser";
    elements.splashPlayButton.textContent = selectedRestaurant?.available ? "Start Playing" : "Coming Soon";
    if (elements.splashMyRestaurantButton) {
      elements.splashMyRestaurantButton.href = "/restaurant/?hub=1#hero-panel";
    }
    if (elements.splashLeaderboardButton) {
      elements.splashLeaderboardButton.href = "/restaurant/?hub=1#leaderboard-panel";
    }
    renderSplashProgress(profile, selectedRestaurant?.slug || "");
    if (elements.splashStatsScope) {
      elements.splashStatsScope.onchange = (event) => {
        state.splashStatsScope = event.currentTarget.value;
        renderSplashProgress(core.getActiveProfile(), selectedRestaurant?.slug || "");
      };
    }
    elements.splashRestaurantSelect.onchange = (event) => {
      state.selectedDirectorySlug = event.currentTarget.value;
      renderSplashChooser();
    };
  }

  function openHowToPlay() {
    if (!elements.howToPlayModal) {
      return;
    }

    howToPlayReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : elements.splashHowToPlayButton;
    elements.howToPlayModal.classList.remove("hidden");
    elements.howToPlayModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("how-to-play-open");

    requestAnimationFrame(() => {
      const closeButton = elements.howToPlayModal.querySelector("[data-how-to-play-close]");
      if (closeButton instanceof HTMLElement) {
        closeButton.focus();
      }
    });
  }

  function closeHowToPlay() {
    if (!elements.howToPlayModal) {
      return;
    }

    elements.howToPlayModal.classList.add("hidden");
    elements.howToPlayModal.setAttribute("aria-hidden", "true");
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

    if (elements.howToPlayModal) {
      elements.howToPlayModal.querySelectorAll("[data-how-to-play-close]").forEach((button) => {
        button.addEventListener("click", closeHowToPlay);
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && elements.howToPlayModal && !elements.howToPlayModal.classList.contains("hidden")) {
        closeHowToPlay();
      }
    });
  }

  function getSplashStatsOptions(profile, selectedRestaurantSlug) {
    const options = [{ value: "overall", label: "Overall" }];
    const slugs = new Set();
    if (selectedRestaurantSlug) {
      slugs.add(selectedRestaurantSlug);
    }

    if (profile?.restaurantStats && typeof profile.restaurantStats === "object") {
      Object.entries(profile.restaurantStats).forEach(([slug, stats]) => {
        if (stats && (stats.gamesPlayed || stats.regularCustomers || stats.occasionalCustomers || stats.estimatedSales)) {
          slugs.add(slug);
        }
      });
    }

    slugs.forEach((slug) => {
      const restaurant = core.getRestaurantBySlug(slug);
      options.push({
        value: slug,
        label: restaurant?.name || slug,
      });
    });

    return options;
  }

  function renderSplashProgress(profile, selectedRestaurantSlug) {
    if (!elements.splashRatingBadge || !elements.splashCustomersBadge || !elements.splashRankBadge) {
      return;
    }

    if (elements.splashPlayerRestaurantName) {
      elements.splashPlayerRestaurantName.textContent = profile?.restaurantName || "Guest Restaurant";
    }

    const statsOptions = getSplashStatsOptions(profile, selectedRestaurantSlug);
    if (!statsOptions.some((option) => option.value === state.splashStatsScope)) {
      state.splashStatsScope = "overall";
    }
    if (elements.splashStatsScope) {
      elements.splashStatsScope.innerHTML = statsOptions
        .map(
          (option) => `
            <option value="${escapeHtml(option.value)}" ${option.value === state.splashStatsScope ? "selected" : ""}>
              ${escapeHtml(option.label)}
            </option>
          `
        )
        .join("");
      elements.splashStatsScope.value = state.splashStatsScope;
    }

    const restaurantSlug = state.splashStatsScope === "overall" ? "" : state.splashStatsScope;
    const summary = profile ? core.getProfileSummary(profile, restaurantSlug) : null;
    const stats = summary?.stats || null;
    const collected = stats ? stats.regularCustomers + stats.occasionalCustomers : 0;
    const hasGames = Boolean(stats?.gamesPlayed);
    const rank = profile
      ? core.getPlayerRank(profile.id, "estimatedSales", restaurantSlug)
      : null;

    elements.splashRatingBadge.textContent = hasGames
      ? `⭐ Rating: ${core.formatRating(summary.rating)}`
      : "⭐ Rating: New";
    elements.splashCustomersBadge.textContent = `👥 Customers: ${collected}`;
    elements.splashRankBadge.textContent = rank
      ? `🏆 Rank: #${rank}`
      : "🏆 Rank: Not Ranked";
  }

  function scrollMobileSection(section, extraOffset = 0) {
    if (!section || !isMobileHub()) {
      return;
    }

    const headerHeight = elements.mobileHeader ? elements.mobileHeader.getBoundingClientRect().height : 0;
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const targetTop = Math.max(0, sectionTop - headerHeight - 12 - extraOffset);

    window.scrollTo({ top: targetTop, behavior: "smooth" });
  }

  function applyMobileTabVisibility() {
    if (!elements.tabs || !elements.sections) {
      return;
    }

    if (!isMobileHub()) {
      if (elements.mobileHeader) {
        elements.mobileHeader.classList.add("hidden");
      }
      document.body.classList.remove("mobile-hub-overview-only");
      elements.tabs.classList.remove("mobile-hub-tabs-active");
      elements.hero.classList.remove("hidden");
      elements.sections.classList.remove("hidden");
      elements.collection.classList.remove("hidden");
      elements.leaderboard.classList.remove("hidden");
      if (elements.footer) {
        elements.footer.classList.remove("hidden");
      }
      return;
    }

    if (elements.mobileHeader) {
      elements.mobileHeader.classList.remove("hidden");
    }
    const showOverview = state.activeMobileTab === "overview";
    const showCollection = state.activeMobileTab === "collection";
    const showLeaderboard = state.activeMobileTab === "leaderboard";

    document.body.classList.toggle("mobile-hub-overview-only", showOverview);
    elements.tabs.classList.add("mobile-hub-tabs-active");

    elements.hero.classList.toggle("hidden", !showOverview);
    elements.collection.classList.toggle("hidden", !showCollection);
    elements.leaderboard.classList.toggle("hidden", !showLeaderboard);

    if (elements.footer) {
      elements.footer.classList.toggle("hidden", !showOverview);
    }

    if (elements.sections) {
      elements.sections.classList.toggle("hidden", showOverview);
    }
  }

  function valueForMetric(stats, metric) {
    if (metric === "rating") {
      const accuracy = stats.gamesPlayed ? (stats.totalCorrectAnswers / (stats.gamesPlayed * 10)) * 100 : 0;
      return accuracy / 20;
    }

    if (metric === "gamesPlayed") {
      return stats.gamesPlayed;
    }

    if (metric === "restaurantValue") {
      return stats.restaurantValue || 0;
    }

    if (metric === "regularCustomers") {
      return stats.regularCustomers;
    }

    if (metric === "favoriteCustomers") {
      return stats.favoriteCustomers || 0;
    }

    if (metric === "collected") {
      return stats.regularCustomers + stats.occasionalCustomers;
    }

    return stats.estimatedSales;
  }

  function formatMetricValue(value, metric) {
    if (metric === "estimatedSales" || metric === "restaurantValue") {
      return core.formatCurrency(value);
    }

    if (metric === "rating") {
      const rounded = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
      const stars = "★".repeat(rounded) + "☆".repeat(5 - rounded);
      return `
        <span class="rating-display" aria-label="Customer rating ${(Number(value) || 0).toFixed(1)} out of 5">
          <span class="rating-stars" aria-hidden="true">${stars}</span>
          <span class="rating-number">${(Number(value) || 0).toFixed(1)}</span>
        </span>
      `;
    }

    return String(Math.round(value || 0));
  }

  function getPlayableRestaurants({ publicOnly = false } = {}) {
    return core.restaurants.filter(
      (restaurant) =>
        restaurant.active !== false &&
        restaurant.playable !== false &&
        (!publicOnly || restaurant.visibleInList !== false)
    );
  }

  function getSelectedLeaderboardRestaurant() {
    return (
      getPlayableRestaurants({ publicOnly: true }).find(
        (restaurant) => restaurant.slug === state.leaderboardRestaurantSlug
      ) ||
      getPlayableRestaurants({ publicOnly: true })[0] ||
      core.restaurants[0] ||
      null
    );
  }

  function getDirectoryRestaurants() {
    const playableRestaurants = getPlayableRestaurants({ publicOnly: true });
    if (playableRestaurants.length) {
      return playableRestaurants.map((restaurant) => ({
          slug: restaurant.slug,
          name: restaurant.name,
          image: restaurant.logoSquare || restaurant.squareImage || restaurant.logoHorizontal || restaurant.heroImage,
          href: `/${restaurant.slug}/`,
          available: true,
      }));
    }

    return [
      {
        slug: "americana",
        name: "Americana Diner",
        image: "../assets/restaurant-challenge/restaurants/americana/americana-diner-logo.jpg",
        href: "/americana/",
        available: true,
      },
    ];
  }

  function getDefaultDirectorySlug(profile) {
    const recentRestaurantSlug = String(profile?.recentSessions?.[0]?.restaurantSlug || "").trim();
    const directoryRestaurants = getDirectoryRestaurants();
    if (recentRestaurantSlug && directoryRestaurants.some((restaurant) => restaurant.slug === recentRestaurantSlug)) {
      return recentRestaurantSlug;
    }
    return directoryRestaurants[0]?.slug || "americana";
  }

  function getSelectedDirectoryRestaurant(profile) {
    const directoryRestaurants = getDirectoryRestaurants();
    const defaultSlug = getDefaultDirectorySlug(profile);
    const selectedSlug = state.selectedDirectorySlug || defaultSlug;
    return (
      directoryRestaurants.find((restaurant) => restaurant.slug === selectedSlug) ||
      directoryRestaurants[0] ||
      null
    );
  }

  function getPlayAgainTarget(profile) {
    const recentSession = profile && Array.isArray(profile.recentSessions) ? profile.recentSessions[0] : null;
    const recentSlug = String(recentSession?.restaurantSlug || "").trim();
    const restaurantName = String(recentSession?.restaurantName || "").trim();

    if (recentSlug && restaurantName) {
      return {
        slug: recentSlug,
        name: restaurantName,
        href: `/${recentSlug}/`,
      };
    }

    const fallbackRestaurant = core.getRestaurantBySlug("americana") || core.restaurants[0] || null;
    return {
      slug: fallbackRestaurant?.slug || "americana",
      name: fallbackRestaurant?.name || "Americana Diner",
      href: fallbackRestaurant?.slug ? `/${fallbackRestaurant.slug}/` : "/americana/",
    };
  }

  function resolveCustomerImage(record) {
    if (!record) {
      return "../assets/restaurant-challenge/customers/customer-placeholder.svg";
    }

    const liveCustomer = core.getCustomerById(record.customerId);
    return (
      (liveCustomer && liveCustomer.image) ||
      record.customerImage ||
      record.image ||
      "../assets/restaurant-challenge/customers/customer-placeholder.svg"
    );
  }

  function getBioPreview(text, maxLength = 170) {
    const value = String(text || "").trim();
    if (value.length <= maxLength) {
      return { text: value, isTruncated: false };
    }

    const searchStart = Math.max(0, maxLength - 28);
    const cutPoint = value.lastIndexOf(" ", maxLength);
    const fallbackCutPoint = value.lastIndexOf(" ", searchStart);
    const slicePoint = cutPoint > 0 ? cutPoint : fallbackCutPoint > 0 ? fallbackCutPoint : maxLength;

    return {
      text: `${value.slice(0, slicePoint).replace(/[.,;:!?-]+$/, "")}…`,
      isTruncated: true,
    };
  }

  function getProfileState(profile) {
    if (!profile) {
      return "new";
    }

    return profile.isGuest ? "guest" : "registered";
  }

  function renderSignInMarkup() {
    if (!state.showSignIn) {
      return `
        <button class="text-button hub-sign-in-toggle" type="button" data-show-sign-in>
          Already registered? Sign in
        </button>
      `;
    }

    return `
      <form class="hub-sign-in-form" id="hub-sign-in-form">
        <div class="field">
          <label class="field-label" for="hub-sign-in-email">Email address</label>
          <div class="hero-profile-edit-row">
            <input class="input hero-profile-input" id="hub-sign-in-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required />
            <button class="button button-primary button-sm" id="hub-sign-in-submit" type="submit">Email Sign-In Link</button>
          </div>
        </div>
        <p class="helper ${state.authMessage ? "" : "hidden"}" id="hub-auth-message" aria-live="polite">${escapeHtml(state.authMessage)}</p>
        <p class="error ${state.authError ? "" : "hidden"}" id="hub-auth-error" aria-live="polite">${escapeHtml(state.authError)}</p>
      </form>
    `;
  }

  function renderConnectEmailMarkup(profile) {
    if (!profile || !state.showConnectEmail) {
      return "";
    }

    return `
      <form class="hub-sign-in-form" id="hub-connect-email-form">
        <div class="field">
          <label class="field-label" for="hub-connect-email">Email address</label>
          <div class="hero-profile-edit-row">
            <input class="input hero-profile-input" id="hub-connect-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required />
            <button class="button button-primary button-sm" id="hub-connect-email-submit" type="submit">Email Save Link</button>
            <button class="button button-muted button-sm" id="hub-connect-email-cancel" type="button">Cancel</button>
          </div>
        </div>
        <p class="helper" style="margin: 0;">This sends a secure link that connects ${escapeHtml(profile.restaurantName)} to your email.</p>
        <p class="helper ${state.connectMessage ? "" : "hidden"}" id="hub-connect-message" aria-live="polite">${escapeHtml(state.connectMessage)}</p>
        <p class="error ${state.connectError ? "" : "hidden"}" id="hub-connect-error" aria-live="polite">${escapeHtml(state.connectError)}</p>
      </form>
    `;
  }

  function renderConnectInfoMarkup(profile) {
    if (!profile) {
      return "";
    }

    return `
      <div class="hub-email-info">
        <button class="text-button" type="button" data-toggle-connect-info>
          ${state.connectInfoExpanded ? "Hide email note" : "Why save with email?"}
        </button>
        <p class="helper ${state.connectInfoExpanded ? "" : "hidden"}" style="margin: 4px 0 0;">
          Email lets you restore ${escapeHtml(profile.restaurantName)} after clearing cache or switching devices. You can keep playing without it.
        </p>
      </div>
    `;
  }

  function renderOverviewPreviewMarkup(profile) {
    if (!profile || !isMobileHub()) {
      return "";
    }

    const customers = Array.isArray(profile.customerCollection)
      ? profile.customerCollection.filter((entry) => entry && entry.status !== "lost").slice(0, 3)
      : [];
    const leaderboardRows = core.getLeaderboard("estimatedSales").slice(0, 4);

    if (!customers.length && !leaderboardRows.length) {
      return "";
    }

    const customerMarkup = customers.length
      ? customers
          .map((entry) => `
            <button class="hub-overview-mini-row" type="button" data-overview-customer="${escapeHtml(entry.customerId)}">
              <img class="hub-overview-avatar" src="${resolveCustomerImage(entry)}" alt="${escapeHtml(entry.customerName)}" onerror="this.onerror=null;this.src='../assets/restaurant-challenge/customers/customer-placeholder.svg';" />
              <span>${escapeHtml(entry.customerName)}</span>
            </button>
          `)
          .join("")
      : `<p class="helper" style="margin: 0;">Play a game to collect customers.</p>`;

    const leaderboardMarkup = leaderboardRows.length
      ? leaderboardRows
          .map((row) => `
            <button class="hub-overview-mini-row hub-overview-leader-row ${row.profileId === profile.id ? "hub-overview-current" : ""}" type="button" data-overview-tab="leaderboard">
              <span class="hub-overview-rank">${row.rank}</span>
              <span>${escapeHtml(row.restaurantName)}</span>
              <strong>${core.formatCurrency(row.value)}</strong>
            </button>
          `)
          .join("")
      : `<p class="helper" style="margin: 0;">No leaderboard entries yet.</p>`;

    return `
      <div class="hub-overview-preview">
        <section class="hub-overview-panel">
          <button class="hub-overview-heading" type="button" data-overview-tab="collection">
            <span>Recent Customers</span>
            <span>View all</span>
          </button>
          <div class="hub-overview-list">
            ${customerMarkup}
          </div>
        </section>
        <section class="hub-overview-panel">
          <button class="hub-overview-heading" type="button" data-overview-tab="leaderboard">
            <span>Overall Leaders</span>
            <span>View all</span>
          </button>
          <div class="hub-overview-list">
            ${leaderboardMarkup}
          </div>
        </section>
      </div>
    `;
  }

  function renderRestaurantValueBreakdownMarkup(profile, summary) {
    if (!profile || !summary?.stats || !core.getRestaurantValueBreakdown) {
      return "";
    }

    const breakdown = core.getRestaurantValueBreakdown(profile, summary.stats);
    const cashOnHand = core.getRestaurantCashOnHand
      ? core.getRestaurantCashOnHand(profile, summary.stats)
      : Math.max(0, Number(summary.stats.estimatedSales) || 0);
    const netWorth = Math.max(0, Number(breakdown.total) || 0) + cashOnHand;
    const rows = [
      [`${breakdown.expansionLabel || "Food Truck"} base`, breakdown.expansionValue],
      ["Customer loyalty", breakdown.loyaltyValue],
      [`Recent sales ${Math.round((Number(breakdown.recentPerformanceRate) || 0) * 100)}%`, breakdown.recentPerformanceValue],
      ["Rating bonus", breakdown.ratingValue],
      ["Upgrades", breakdown.upgradeValue],
    ];

    return `
      <div class="restaurant-value-breakdown" aria-label="Restaurant Value breakdown">
        <div class="restaurant-value-breakdown-head">
          <span>Restaurant Value</span>
          <strong>${core.formatCurrency(breakdown.total)}</strong>
        </div>
        <div class="restaurant-value-breakdown-grid">
          ${rows
            .map(
              ([label, value]) => `
                <div class="restaurant-value-breakdown-row">
                  <span>${escapeHtml(label)}</span>
                  <strong>${core.formatCurrency(value)}</strong>
                </div>
              `
            )
            .join("")}
        </div>
        <div class="restaurant-net-worth-row">
          <span>Total Net Worth</span>
          <strong>${core.formatCurrency(netWorth)}</strong>
        </div>
      </div>
    `;
  }

  function renderExpansionPreviewMarkup(profile) {
    if (!profile || !core.getRestaurantExpansionPreview) {
      return "";
    }

    const preview = core.getRestaurantExpansionPreview(profile);
    if (!preview?.current) {
      return "";
    }
    const cashOnHand = core.getRestaurantCashOnHand
      ? core.getRestaurantCashOnHand(profile, profile.stats)
      : Math.max(0, Number(profile.stats?.estimatedSales) || 0);
    const nextCost = Math.max(0, Number(preview.next?.cost) || 0);
    const canBuyNext = Boolean(preview.next && core.buyNextRestaurantExpansion && cashOnHand >= nextCost);
    const shortfall = preview.next ? Math.max(0, nextCost - cashOnHand) : 0;

    return `
      <div class="restaurant-expansion-preview" aria-label="Restaurant expansion preview">
        <div>
          <span class="restaurant-expansion-label">Current size</span>
          <strong>${escapeHtml(preview.current.label || "Food Truck")}</strong>
        </div>
        ${
          preview.next
            ? `
              <div>
                <span class="restaurant-expansion-label">Next expansion</span>
                <strong>${escapeHtml(preview.next.label)}</strong>
              </div>
              <div>
                <span class="restaurant-expansion-label">Cost</span>
                <strong>${core.formatCurrency(preview.next.cost)}</strong>
              </div>
              <div>
                <span class="restaurant-expansion-label">Adds value</span>
                <strong>${core.formatCurrency(preview.valueAdded)}</strong>
              </div>
              <div class="restaurant-expansion-action">
                <button class="button ${canBuyNext ? "button-primary" : "button-muted"} button-sm restaurant-expansion-button" type="button" data-buy-expansion ${canBuyNext ? "" : "disabled"}>
                  ${canBuyNext ? "Buy Expansion" : `Need ${core.formatCurrency(shortfall)} more`}
                </button>
              </div>
            `
            : `
              <div>
                <span class="restaurant-expansion-label">Next expansion</span>
                <strong>Fully expanded</strong>
              </div>
            `
        }
      </div>
      ${
        state.expansionMessage || state.expansionError
          ? `<p class="restaurant-expansion-status ${state.expansionError ? "restaurant-expansion-status-error" : ""}">${escapeHtml(state.expansionError || state.expansionMessage)}</p>`
          : ""
      }
    `;
  }

  function renderUpgradePreviewMarkup(profile) {
    if (!profile || !core.getRestaurantUpgradePreview) {
      return "";
    }

    const upgrades = core.getRestaurantUpgradePreview(profile, 3);
    if (!upgrades.length) {
      return "";
    }
    const expansionPreview = core.getRestaurantExpansionPreview
      ? core.getRestaurantExpansionPreview(profile)
      : null;
    const upgradesLocked = expansionPreview?.current?.id === "food-truck";

    return `
      <div class="restaurant-upgrade-preview ${upgradesLocked ? "restaurant-upgrade-preview-locked" : ""}" aria-label="Next restaurant upgrades">
        <div class="restaurant-upgrade-preview-head">
          <span>${upgradesLocked ? "Upgrades" : "Next Upgrades"}</span>
          ${upgradesLocked ? `<span>Available after expansion to Counter Service.</span>` : ""}
        </div>
        <div class="restaurant-upgrade-preview-grid">
          ${upgrades
            .map(
              (upgrade) => `
                <div class="restaurant-upgrade-preview-card">
                  <strong>${escapeHtml(upgrade.label)}</strong>
                  <span>Cost ${core.formatCurrency(upgrade.cost)}</span>
                  <span>Adds value ${core.formatCurrency(upgrade.value)}</span>
                  <span>Future sales +${Number(upgrade.salesBoostPercent) || 0}%</span>
                </div>
              `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  function renderHero() {
    const compactMobile = isMobileHub();
    const profile = core.getActiveProfile();
    const profileState = getProfileState(profile);
    const summary = profile ? core.getProfileSummary(profile) : null;
    const safeSummary =
      summary && summary.stats
        ? summary
        : {
            rating: 0,
            stats: {
              gamesPlayed: 0,
              estimatedSales: 0,
              restaurantValue: 0,
              regularCustomers: 0,
              favoriteCustomers: 0,
              occasionalCustomers: 0,
            },
          };
    const overallRank = profile ? core.getPlayerRank(profile.id, "estimatedSales") : null;
    const collectedCustomers =
      (safeSummary.stats.regularCustomers || 0) + (safeSummary.stats.occasionalCustomers || 0);
    const favoriteCustomers = safeSummary.stats.favoriteCustomers || 0;
    const cashOnHand = core.getRestaurantCashOnHand
      ? core.getRestaurantCashOnHand(profile, safeSummary.stats)
      : safeSummary.stats.estimatedSales || 0;
    const bestRankLabel = overallRank ? `🏆 Best Rank #${overallRank}` : "🏆 Best Rank --";
    const selectedDirectoryRestaurant = getSelectedDirectoryRestaurant(profile);
    const lastPlayedSlug = getDefaultDirectorySlug(profile);
    const playAgainTarget = getPlayAgainTarget(profile);
    const latestCustomerEntry = profile && Array.isArray(profile.customerCollection)
      ? profile.customerCollection.find((entry) => entry && entry.status !== "lost")
      : null;
    const latestCustomerName = latestCustomerEntry ? latestCustomerEntry.customerName || "Customer" : "";
    const emailConnected = Boolean(profile && profile.emailConnected);
    const hasSavedProgress = Boolean(
      profile && (safeSummary.stats.gamesPlayed || collectedCustomers || safeSummary.stats.estimatedSales)
    );
    const guestProgressMarkup =
      profile && hasSavedProgress
        ? `
          <div class="hero-profile-meta ${compactMobile ? "hero-profile-meta-compact" : ""}">
            <span class="chip hero-stat-chip">⭐ Rating ${core.formatRating(safeSummary.rating || 0)}</span>
            <span class="chip hero-stat-chip">🏦 Value ${core.formatCurrency(safeSummary.stats.restaurantValue || 0)}</span>
            <span class="chip hero-stat-chip">💵 Cash ${core.formatCurrency(cashOnHand)}</span>
            <span class="chip hero-stat-chip">👥 Customers ${collectedCustomers}</span>
            <span class="chip hero-stat-chip">💰 Sales ${core.formatCurrency(safeSummary.stats.estimatedSales)}</span>
            <span class="chip hero-stat-chip">⭐ Favorites ${favoriteCustomers}</span>
            <span class="chip hero-stat-chip">${bestRankLabel}</span>
          </div>
          ${renderRestaurantValueBreakdownMarkup(profile, safeSummary)}
          ${renderExpansionPreviewMarkup(profile)}
          ${renderUpgradePreviewMarkup(profile)}
        `
        : "";

    elements.hero.innerHTML = `
      <div class="hero-stack">
        ${
          compactMobile
            ? ""
            : `
              <div class="hero-title-panel">
                <h1 class="page-title">Restaurant Challenge</h1>
              </div>
            `
        }
        <div class="hero-grid">
          <div class="hero-content-panel hero-content-panel-main">
          ${
            profileState === "registered"
              ? compactMobile
                ? `
                  <div class="hero-profile-strip hero-profile-strip-compact">
                    <div class="hero-profile-head hero-profile-head-compact">
                      <div>
                        <p class="kicker" style="margin: 0 0 4px;">Your Restaurant</p>
                        <h2 class="hero-profile-name">${escapeHtml(profile.restaurantName)}</h2>
                        <p class="hero-profile-subline hero-profile-subline-compact">
                          <span class="rating-display" aria-label="Guest rating ${(safeSummary.rating || 0).toFixed(1)} out of 5">
                            <span class="rating-stars" aria-hidden="true">${"★".repeat(Math.max(0, Math.min(5, Math.round(safeSummary.rating || 0)))) + "☆".repeat(5 - Math.max(0, Math.min(5, Math.round(safeSummary.rating || 0))))}</span>
                            <span class="rating-number">${(safeSummary.rating || 0).toFixed(1)}</span>
                          </span>
                          <span class="hero-profile-subline-sep">·</span>
                          <span>${safeSummary.stats.gamesPlayed} plays</span>
                        </p>
                        ${
                          latestCustomerName
                            ? `<p class="hero-profile-detailline hero-profile-detailline-compact">Latest customer: <strong>${escapeHtml(latestCustomerName)}</strong></p>`
                            : ""
                        }
                      </div>
                        <div class="hero-profile-actions hero-profile-actions-top">
                          ${!emailConnected ? `<button class="button button-primary button-sm" type="button" data-show-connect-email>Save With Email</button>` : ""}
                          <a class="button button-muted button-sm" href="${withHubMode("./?edit=1")}">Edit My Profile</a>
                        </div>
                    </div>
                    ${!editMode && !emailConnected ? renderConnectInfoMarkup(profile) : ``}
                    <div class="hero-profile-meta hero-profile-meta-compact">
                      <span class="chip hero-stat-chip">⭐ Rating ${core.formatRating(safeSummary.rating || 0)}</span>
                      <span class="chip hero-stat-chip">🏦 Value ${core.formatCurrency(safeSummary.stats.restaurantValue || 0)}</span>
                      <span class="chip hero-stat-chip">💵 Cash ${core.formatCurrency(cashOnHand)}</span>
                      <span class="chip hero-stat-chip">👥 Customers ${collectedCustomers}</span>
                      <span class="chip hero-stat-chip">💰 Sales ${core.formatCurrency(safeSummary.stats.estimatedSales)}</span>
                      <span class="chip hero-stat-chip">⭐ Favorites ${favoriteCustomers}</span>
                      <span class="chip hero-stat-chip">${bestRankLabel}</span>
                    </div>
                    ${renderRestaurantValueBreakdownMarkup(profile, safeSummary)}
                    ${renderExpansionPreviewMarkup(profile)}
                    ${renderUpgradePreviewMarkup(profile)}
                    ${
                      !editMode && !emailConnected ? renderConnectEmailMarkup(profile) : ``
                    }
                    ${
                      editMode
                        ? `
                          <form class="hero-profile-edit-form hero-profile-edit-form-compact" id="hero-profile-edit-form">
                            <div class="field" style="gap: 6px;">
                              <label class="field-label" for="hero-restaurant-name">Restaurant name</label>
                              <div class="hero-profile-edit-row">
                                <input class="input hero-profile-input" id="hero-restaurant-name" name="restaurantName" type="text" value="${escapeHtml(profile.restaurantName)}" />
                                <button class="button button-primary button-sm" type="submit">Save Changes</button>
                                <a class="button button-muted button-sm" href="${withHubMode("./")}">Cancel</a>
                              </div>
                            </div>
                            <p class="helper" style="margin: 8px 0 0;">Your player name stays the same. Only the restaurant name changes here.</p>
                            <p class="error hidden" id="hero-profile-error" aria-live="polite" style="margin-top: 8px;"></p>
                          </form>
                        `
                        : ``
                    }
                  </div>
                  ${renderOverviewPreviewMarkup(profile)}
                `
                : `
                <div class="hero-profile-strip">
                  <div class="hero-profile-head">
                    <div>
                      <p class="kicker" style="margin: 0 0 4px;">Your Restaurant</p>
                      <h2 class="hero-profile-name">${escapeHtml(profile.restaurantName)}</h2>
                      <p class="hero-profile-subline">
                        <span class="rating-display" aria-label="Guest rating ${(safeSummary.rating || 0).toFixed(1)} out of 5">
                          <span class="rating-stars" aria-hidden="true">${"★".repeat(Math.max(0, Math.min(5, Math.round(safeSummary.rating || 0)))) + "☆".repeat(5 - Math.max(0, Math.min(5, Math.round(safeSummary.rating || 0))))}</span>
                          <span class="rating-number">${(safeSummary.rating || 0).toFixed(1)}</span>
                        </span>
                        <span class="hero-profile-subline-sep">·</span>
                        <span>${safeSummary.stats.gamesPlayed} plays</span>
                      </p>
                      ${
                        latestCustomerName && !compactMobile
                          ? `<p class="hero-profile-detailline">Latest customer: <strong>${escapeHtml(latestCustomerName)}</strong></p>`
                          : ""
                      }
                    </div>
                    <div class="hero-profile-actions hero-profile-actions-top">
                      ${!emailConnected ? `<button class="button button-primary button-sm" type="button" data-show-connect-email>Save With Email</button>` : ""}
                      <a class="button button-muted button-sm" href="${withHubMode("./?edit=1")}">Edit My Profile</a>
                    </div>
                  </div>
                  ${!editMode && !emailConnected ? renderConnectInfoMarkup(profile) : ``}
                  <div class="hero-profile-meta">
                    <span class="chip hero-stat-chip">⭐ Rating ${core.formatRating(safeSummary.rating || 0)}</span>
                    <span class="chip hero-stat-chip">🏦 Value ${core.formatCurrency(safeSummary.stats.restaurantValue || 0)}</span>
                    <span class="chip hero-stat-chip">💵 Cash ${core.formatCurrency(cashOnHand)}</span>
                    <span class="chip hero-stat-chip">👥 Customers ${collectedCustomers}</span>
                    <span class="chip hero-stat-chip">💰 Sales ${core.formatCurrency(safeSummary.stats.estimatedSales)}</span>
                    <span class="chip hero-stat-chip">⭐ Favorites ${favoriteCustomers}</span>
                    <span class="chip hero-stat-chip">${bestRankLabel}</span>
                  </div>
                  ${renderRestaurantValueBreakdownMarkup(profile, safeSummary)}
                  ${renderExpansionPreviewMarkup(profile)}
                  ${renderUpgradePreviewMarkup(profile)}
                  ${
                    !editMode && !emailConnected ? renderConnectEmailMarkup(profile) : ``
                  }
                  ${
                    editMode
                      ? `
                        <form class="hero-profile-edit-form" id="hero-profile-edit-form">
                          <div class="field" style="gap: 6px;">
                            <label class="field-label" for="hero-restaurant-name">Restaurant name</label>
                            <div class="hero-profile-edit-row">
                              <input class="input hero-profile-input" id="hero-restaurant-name" name="restaurantName" type="text" value="${escapeHtml(profile.restaurantName)}" />
                              <button class="button button-primary button-sm" type="submit">Save Changes</button>
                              <a class="button button-muted button-sm" href="${withHubMode("./")}">Cancel</a>
                            </div>
                          </div>
                          <p class="helper" style="margin: 8px 0 0;">Your player name stays the same. Only the restaurant name changes here.</p>
                          <p class="error hidden" id="hero-profile-error" aria-live="polite" style="margin-top: 8px;"></p>
                        </form>
                      `
                      : ``
                  }
                </div>
                ${renderOverviewPreviewMarkup(profile)}
                `
                : profileState === "guest"
                  ? `
                    <div class="hero-profile-strip hero-profile-strip-guest">
                      <div>
                        <p class="kicker" style="margin: 0 0 4px;">Guest Progress</p>
                        <h2 class="hero-profile-name">${hasSavedProgress ? escapeHtml(profile.restaurantName) : "Play first, then register to save your restaurant."}</h2>
                        <p class="copy compact-copy" style="margin: 4px 0 0;">${
                          hasSavedProgress
                            ? "This restaurant is saved on this device. Add email recovery when you are ready."
                            : "You can keep playing as a guest, but registering after your next game keeps your customers and leaderboard progress with you."
                        }</p>
                        ${renderSignInMarkup()}
                      </div>
                      <a class="button button-primary button-sm" href="${playAgainTarget.href}">Play ${escapeHtml(playAgainTarget.name)}</a>
                      ${guestProgressMarkup}
                    </div>
                  `
                  : `
                    <div class="hero-profile-strip hero-profile-strip-guest">
                      <div>
                        <p class="kicker" style="margin: 0 0 4px;">Welcome</p>
                        <h2 class="hero-profile-name">Play your first game, then save your restaurant.</h2>
                        <p class="copy compact-copy" style="margin: 4px 0 0;">Start with a quick trivia round. After you win your first customer, visit My Restaurant to name and save your restaurant so progress can follow you.</p>
                        ${renderSignInMarkup()}
                      </div>
                      <a class="button button-primary button-sm" href="${playAgainTarget.href}">Play First Game</a>
                    </div>
                  `
          }
          </div>
          <div class="hero-content-panel hero-content-panel-side">
            <div class="hero-side">
              <div class="hero-card hero-card-strong hero-directory-showcase hero-directory-showcase-compact" id="directory-card">
                <div class="hero-directory-picker">
                  <p class="kicker" style="margin: 0;">Choose A Restaurant Challenge Trivia Game</p>
                  <label class="field" style="gap: 6px;">
                    <select class="select hero-directory-select" id="directory-select" aria-label="Choose a Restaurant Challenge Trivia game">
                      ${getDirectoryRestaurants()
                        .map(
                          (restaurantOption) => `
                            <option value="${restaurantOption.slug}" ${selectedDirectoryRestaurant && restaurantOption.slug === selectedDirectoryRestaurant.slug ? "selected" : ""}>
                              ${escapeHtml(restaurantOption.name)}${restaurantOption.slug === lastPlayedSlug ? " (Last Played)" : ""}
                            </option>
                          `
                        )
                        .join("")}
                    </select>
                  </label>
                </div>
                ${
                  selectedDirectoryRestaurant
                    ? `
                  <article class="hero-directory-item hero-directory-item-compact ${selectedDirectoryRestaurant.available ? "" : "hero-directory-item-muted"}">
                        <img class="hero-directory-image" src="${selectedDirectoryRestaurant.image}" alt="${escapeHtml(selectedDirectoryRestaurant.name)} logo" />
                        <div>
                          <h2 class="section-title" style="margin-bottom: 4px; color: inherit; font-size: 1.2rem;">${escapeHtml(selectedDirectoryRestaurant.name)}</h2>
                          ${
                            selectedDirectoryRestaurant.slug === lastPlayedSlug && !compactMobile
                              ? `<p class="hero-directory-note" style="margin: 0 0 8px;">Last played</p>`
                              : ""
                          }
                          ${
                            selectedDirectoryRestaurant.available
                              ? `<a class="button button-primary button-sm hero-directory-button" href="${selectedDirectoryRestaurant.href}">Play Now</a>`
                              : `<button class="button button-primary button-sm hero-directory-button" type="button" disabled>Coming Soon</button>`
                          }
                        </div>
                      </article>
                    `
                    : ""
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    if (editMode && profile && !profile.isGuest) {
      const form = document.getElementById("hero-profile-edit-form");
      const error = document.getElementById("hero-profile-error");

      if (!form || !error) {
        return;
      }

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const restaurantName = document.getElementById("hero-restaurant-name").value.trim();
        const validation = core.validateProfileInput(profile.playerName, restaurantName);

        if (!validation.ok) {
          error.textContent = validation.message;
          error.classList.remove("hidden");
          return;
        }

        core.updateProfile({
          ...profile,
          restaurantName,
          restaurantSlug: core.slugify(restaurantName),
        });
        window.location.href = withHubMode("./");
      });
    }

    elements.hero.querySelectorAll("[data-show-sign-in]").forEach((button) => {
      button.addEventListener("click", () => {
        state.showSignIn = true;
        state.authMessage = "";
        state.authError = "";
        renderHero();
      });
    });

    elements.hero.querySelectorAll("[data-show-connect-email]").forEach((button) => {
      button.addEventListener("click", () => {
        state.showConnectEmail = true;
        state.connectMessage = "";
        state.connectError = "";
        renderHero();
      });
    });

    elements.hero.querySelectorAll("[data-toggle-connect-info]").forEach((button) => {
      button.addEventListener("click", () => {
        state.connectInfoExpanded = !state.connectInfoExpanded;
        renderHero();
      });
    });

    const connectEmailCancel = document.getElementById("hub-connect-email-cancel");
    if (connectEmailCancel) {
      connectEmailCancel.addEventListener("click", () => {
        state.showConnectEmail = false;
        state.connectMessage = "";
        state.connectError = "";
        renderHero();
      });
    }

    const connectEmailForm = document.getElementById("hub-connect-email-form");
    if (connectEmailForm && profile) {
      connectEmailForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const email = document.getElementById("hub-connect-email").value.trim();
        const submitButton = document.getElementById("hub-connect-email-submit");
        state.connectError = "";
        state.connectMessage = "";
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
        try {
          await core.sendEmailSignInLink(email, { profileId: profile.id });
          state.connectMessage = "Check your email and tap the secure link to connect this restaurant.";
          renderHero();
        } catch (error) {
          state.connectError = error instanceof Error ? error.message : "Unable to send the email link.";
          submitButton.disabled = false;
          submitButton.textContent = "Email Save Link";
          renderHero();
        }
      });
    }

    const signInForm = document.getElementById("hub-sign-in-form");
    if (signInForm) {
      signInForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const email = document.getElementById("hub-sign-in-email").value.trim();
        const submitButton = document.getElementById("hub-sign-in-submit");
        state.authError = "";
        state.authMessage = "";
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
        try {
          await core.sendEmailSignInLink(email);
          state.authMessage = "Check your email and tap the secure link to restore your restaurant.";
          renderHero();
        } catch (error) {
          state.authError = error instanceof Error ? error.message : "Unable to send the email link.";
          submitButton.disabled = false;
          submitButton.textContent = "Email Sign-In Link";
          renderHero();
        }
      });
    }

    const directorySelect = document.getElementById("directory-select");
    if (directorySelect) {
      directorySelect.addEventListener("change", (event) => {
        state.selectedDirectorySlug = event.currentTarget.value;
        renderHero();
        applyMobileTabVisibility();
      });
    }

    elements.hero.querySelectorAll("[data-buy-expansion]").forEach((button) => {
      button.addEventListener("click", () => {
        if (!profile || !core.buyNextRestaurantExpansion) {
          return;
        }

        const result = core.buyNextRestaurantExpansion(profile.id);
        state.expansionMessage = result?.ok
          ? `${result.expansion?.label || "Expansion"} bought. Cash spent: ${core.formatCurrency(result.cost || 0)}.`
          : "";
        state.expansionError = result?.ok ? "" : result?.message || "Unable to buy this expansion yet.";
        renderAll();
      });
    });

    elements.hero.querySelectorAll("[data-overview-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        state.activeMobileTab = button.dataset.overviewTab;
        renderAll();
        applyMobileTabVisibility();
      });
    });

    elements.hero.querySelectorAll("[data-overview-customer]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedCustomerId = button.dataset.overviewCustomer;
        state.activeMobileTab = "collection";
        renderAll();
        applyMobileTabVisibility();
      });
    });
  }

  function renderLeaderboard() {
    const profile = core.getActiveProfile();
    const restaurant = getSelectedLeaderboardRestaurant();
    const rows =
      state.leaderboardScope === "overall"
        ? core.getLeaderboard(state.metric)
        : core.getLeaderboard(state.metric, restaurant?.slug || "americana");
    const scopeLabel = state.leaderboardScope === "overall" ? "Overall" : restaurant?.name || "Restaurant";
    const selectedMetric = metricOptions.find((option) => option.value === state.metric) || metricOptions[0];

    function renderRows(list, emptyMessage) {
      if (!list.length) {
        return `<p class="empty-state">${emptyMessage}</p>`;
      }

      return list
        .map((row) => {
          const value = formatMetricValue(row.value, state.metric);
          const isCurrent = profile && row.profileId === profile.id;

          return `
              <div class="leaderboard-row ${isCurrent ? "leaderboard-row-current" : ""}">
              <div class="leaderboard-rank">${row.rank}</div>
              <div class="leaderboard-main">
                <p class="leaderboard-name">${escapeHtml(row.restaurantName)}</p>
              </div>
              <p class="leaderboard-value">${value}</p>
            </div>
          `;
        })
        .join("");
    }

    elements.leaderboard.innerHTML = `
      <div class="leaderboard-head">
        <div class="leaderboard-title-stack">
          <h2 class="section-title">Leaderboards</h2>
          <button class="button button-muted button-sm leaderboard-help-button" type="button" data-how-to-play-button>How to Play</button>
        </div>
        <div class="leaderboard-controls">
          <label class="field" style="gap: 6px;">
            <span class="field-label">Scope</span>
            <select class="select leaderboard-select" data-control="scope" aria-label="Leaderboard scope">
              <option value="overall" ${state.leaderboardScope === "overall" ? "selected" : ""}>Overall</option>
              <option value="restaurant" ${state.leaderboardScope === "restaurant" ? "selected" : ""}>Restaurant</option>
            </select>
          </label>
          ${
            state.leaderboardScope === "restaurant"
              ? `
                <label class="field" style="gap: 6px;">
                  <span class="field-label">Restaurant</span>
                  <select class="select leaderboard-select" data-control="restaurant" aria-label="Restaurant leaderboard">
                    ${getPlayableRestaurants({ publicOnly: true })
                      .map(
                        (restaurantOption) => `
                          <option value="${restaurantOption.slug}" ${restaurantOption.slug === (restaurant?.slug || "americana") ? "selected" : ""}>
                            ${escapeHtml(restaurantOption.name)}
                          </option>
                        `
                      )
                      .join("")}
                  </select>
                </label>
              `
              : ""
          }
        </div>
      </div>

      <div class="leaderboard-actions">
        <a class="button button-primary button-sm" href="${getPlayAgainTarget(profile).href}">Play ${escapeHtml(getPlayAgainTarget(profile).name)}</a>
      </div>

      <div class="leaderboard-tabs" role="tablist" aria-label="Leaderboard metric">
        ${metricOptions
          .map(
            (option) => `
              <button class="button ${option.value === state.metric ? "button-primary" : "button-muted"} metric-button" data-metric="${option.value}" type="button">
                ${option.label}
              </button>
            `
          )
          .join("")}
      </div>

      <div class="leaderboard-explainer">
        <h3 class="kicker">${scopeLabel}</h3>
        <p class="helper">${escapeHtml(selectedMetric.description)}</p>
      </div>
      <div class="leaderboard-scroll">
        ${renderRows(rows, state.leaderboardScope === "overall" ? "No leaderboard entries yet." : `No ${scopeLabel} scores yet.`)}
      </div>
    `;

    elements.leaderboard.querySelectorAll(".metric-button").forEach((button) => {
      button.addEventListener("click", () => {
        state.metric = button.dataset.metric;
        renderAll();
      });
    });

    elements.leaderboard.querySelectorAll("[data-control]").forEach((control) => {
      control.addEventListener("change", (event) => {
        const { control: type } = event.currentTarget.dataset;
        if (type === "scope") {
          state.leaderboardScope = event.currentTarget.value;
        } else if (type === "restaurant") {
          state.leaderboardRestaurantSlug = event.currentTarget.value;
        }
        renderAll();
      });
    });

    elements.leaderboard.querySelectorAll("[data-how-to-play-button]").forEach((button) => {
      button.addEventListener("click", openHowToPlay);
    });
  }

  function syncDesktopPanelHeights() {
    if (!elements.collection || !elements.leaderboard || !elements.sections) {
      return;
    }

    if (isMobileHub()) {
      elements.sections.style.height = "";
      elements.sections.style.minHeight = "";
      elements.collection.style.height = "";
      elements.leaderboard.style.height = "";
      const leaderboardStack = elements.leaderboard.closest(".grid-stack");
      if (leaderboardStack) {
        leaderboardStack.style.marginTop = "";
        leaderboardStack.style.height = "";
      }
      return;
    }

    const availableHeight = Math.max(
      560,
      Math.floor(window.innerHeight - elements.sections.offsetTop - 8)
    );

    elements.sections.style.height = `${availableHeight}px`;
    elements.sections.style.minHeight = `${availableHeight}px`;
    elements.collection.style.height = "";
    elements.leaderboard.style.height = `${availableHeight}px`;
    requestAnimationFrame(() => {
      const collectionHeight = Math.ceil(elements.collection.getBoundingClientRect().height);
      const leaderboardStack = elements.leaderboard.closest(".grid-stack");
      const directoryCard = document.getElementById("directory-card");
      const sectionsTop = elements.sections.getBoundingClientRect().top;
      const directoryBottom = directoryCard ? directoryCard.getBoundingClientRect().bottom : sectionsTop;
      const pullUp = Math.max(0, Math.ceil(sectionsTop - directoryBottom - 30));
      const leaderboardHeight = Math.max(collectionHeight, availableHeight) + pullUp;
      elements.sections.style.height = `${availableHeight}px`;
      elements.sections.style.minHeight = `${availableHeight}px`;
      if (leaderboardStack) {
        leaderboardStack.style.marginTop = pullUp ? `-${pullUp}px` : "";
        leaderboardStack.style.height = `${leaderboardHeight}px`;
      }
      elements.leaderboard.style.height = `${leaderboardHeight}px`;
    });
  }

  function getCustomerBio(record) {
    if (!record) {
      return "";
    }

    if (record.bio) {
      return record.bio;
    }

    return core.getCustomerBio(core.getCustomerById(record.customerId) || {
      id: record.customerId,
      name: record.customerName,
    });
  }

  function renderCollection() {
    const compactMobile = isMobileHub();
    const profile = core.getActiveProfile();

    if (!profile) {
      elements.collection.innerHTML = `
        <h2 class="section-title">Customer Collection</h2>
        <p class="copy">Play your first game to start collecting customers. After that, visit My Restaurant to name your restaurant and add email recovery when you are ready.</p>
      `;
      return;
    }

    const collectionSource = Array.isArray(profile.customerCollection) ? profile.customerCollection : [];
    const collection = [...collectionSource].sort((left, right) =>
      String(right.dateWon).localeCompare(String(left.dateWon))
    );
    const filteredCollection =
      state.collectionFilter === "regular"
        ? collection.filter((entry) => entry.status === "regular" || entry.status === "favorite")
        : state.collectionFilter === "occasional"
          ? collection.filter((entry) => entry.status === "occasional")
          : collection;
    const selectedCustomer =
      filteredCollection.find((entry) => entry.customerId === state.selectedCustomerId) ||
      filteredCollection[0] ||
      collection[0] ||
      null;
    const selectedCustomerBio = selectedCustomer ? getCustomerBio(selectedCustomer) : "";
    const selectedCustomerBioPreview = getBioPreview(selectedCustomerBio);
    const showFullBio = state.selectedCustomerBioExpanded || !selectedCustomerBioPreview.isTruncated;
    const favoriteGoal = core.getFavoriteVisitGoal ? core.getFavoriteVisitGoal() : 10;
    const selectedStatusLabel = selectedCustomer
      ? selectedCustomer.status === "favorite"
        ? "⭐ Favorite Customer"
        : core.getCustomerStatusLabel
          ? core.getCustomerStatusLabel(selectedCustomer.status)
          : selectedCustomer.status === "regular"
            ? "Regular Customer"
            : "Occasional Customer"
      : "";
    const selectedValue = selectedCustomer
      ? core.getCollectionEntryValue
        ? core.getCollectionEntryValue(selectedCustomer)
        : selectedCustomer.status === "regular"
          ? selectedCustomer.regularValue
          : selectedCustomer.occasionalValue
      : 0;
    const selectedFavoriteVisits = selectedCustomer
      ? Math.max(0, Math.min(favoriteGoal, Number(selectedCustomer.favoriteVisits) || 0))
      : 0;
    const selectedFavoriteProgress =
      selectedCustomer?.status === "favorite"
        ? `<p class="customer-favorite-progress">Favorite Customer. Value: ${core.formatCurrency(selectedValue)}</p>`
        : selectedCustomer?.status === "regular"
          ? `<p class="customer-favorite-progress">Favorite Progress: ${selectedFavoriteVisits} / ${favoriteGoal} successful visits</p>`
          : "";
      elements.collection.innerHTML = `
      <h2 class="section-title">Customer Collection</h2>
      <p class="copy">Your collected customers are stored here. Tap a card to view it or bring that customer back.</p>
      <div class="leaderboard-tabs collection-tabs" role="tablist" aria-label="Customer collection filter">
        <button class="button ${state.collectionFilter === "all" ? "button-primary" : "button-muted"} metric-button" data-collection-filter="all" type="button">All Customers</button>
        <button class="button ${state.collectionFilter === "regular" ? "button-primary" : "button-muted"} metric-button" data-collection-filter="regular" type="button">Regular Customers</button>
        <button class="button ${state.collectionFilter === "occasional" ? "button-primary" : "button-muted"} metric-button" data-collection-filter="occasional" type="button">Occasional Customers</button>
      </div>

      ${
        selectedCustomer
          ? compactMobile
            ? `
              <div class="collection-selected-card collection-selected-card-mobile ${selectedCustomer.status === "favorite" ? "collection-selected-card-favorite" : ""}">
                <div class="collection-selected-copy collection-selected-copy-mobile">
                  <p class="kicker" style="margin: 0 0 4px;">Selected Customer</p>
                  <h3 class="section-title" style="margin: 0; font-size: 1.45rem;">${escapeHtml(selectedCustomer.customerName)}</h3>
                  <p class="customer-meta" style="margin-top: 4px;">${escapeHtml(selectedStatusLabel)}</p>
                  ${selectedFavoriteProgress}
                  <p class="collection-selected-bio">${escapeHtml(showFullBio ? selectedCustomerBio : selectedCustomerBioPreview.text)}</p>
                  ${
                    selectedCustomerBioPreview.isTruncated
                      ? `
                        <button class="text-button collection-selected-toggle" type="button" id="toggle-selected-bio">${showFullBio ? "Read Less" : "Read More"}</button>
                      `
                      : ""
                  }
                </div>
                <div class="collection-selected-mobile-row">
                  <img class="customer-avatar collection-selected-avatar" src="${resolveCustomerImage(selectedCustomer)}" alt="${escapeHtml(selectedCustomer.customerName)}" onerror="this.onerror=null;this.src='../assets/restaurant-challenge/customers/customer-placeholder.svg';" />
                  <div class="collection-selected-mobile-actions">
                    <span class="collection-selected-value">${core.formatCurrency(selectedValue)}</span>
                    <span class="chip collection-selected-rarity-chip">${selectedCustomer.rarity}</span>
                    <a class="button button-primary" id="selected-invite-back-button" href="/americana/?customerId=${encodeURIComponent(selectedCustomer.customerId)}">Invite Back</a>
                  </div>
                </div>
              </div>
            `
            : `
              <div class="collection-selected-card ${selectedCustomer.status === "favorite" ? "collection-selected-card-favorite" : ""}">
                <div class="collection-selected-top">
                  <img class="customer-avatar collection-selected-avatar" src="${resolveCustomerImage(selectedCustomer)}" alt="${escapeHtml(selectedCustomer.customerName)}" onerror="this.onerror=null;this.src='../assets/restaurant-challenge/customers/customer-placeholder.svg';" />
                  <div class="collection-selected-copy">
                    <p class="kicker" style="margin: 0 0 4px;">Selected Customer</p>
                    <h3 class="section-title" style="margin: 0; font-size: 1.45rem;">${escapeHtml(selectedCustomer.customerName)}</h3>
                    <p class="customer-meta" style="margin-top: 4px;">${escapeHtml(selectedStatusLabel)}</p>
                    ${selectedFavoriteProgress}
                    <p class="collection-selected-bio">${escapeHtml(showFullBio ? selectedCustomerBio : selectedCustomerBioPreview.text)}</p>
                    ${
                      selectedCustomerBioPreview.isTruncated
                        ? `
                          <button class="text-button collection-selected-toggle" type="button" id="toggle-selected-bio">${showFullBio ? "Read Less" : "Read More"}</button>
                        `
                        : ""
                    }
                  </div>
                </div>
                <div class="chip-row" style="margin-top: 10px;">
                  <span class="chip">${selectedCustomer.rarity}</span>
                  <span class="chip">${core.formatCurrency(selectedValue)}</span>
                </div>
                <div class="button-row" style="margin-top: 10px;">
                  <a class="button button-primary" id="selected-invite-back-button" href="/americana/?customerId=${encodeURIComponent(selectedCustomer.customerId)}">Invite Back</a>
                </div>
              </div>
            `
          : ""
      }

      <div class="collection-grid collection-grid-compact" style="margin-top: 16px;">
        ${
          filteredCollection.length
            ? filteredCollection
                .map(
                  (entry) => {
                    const image = resolveCustomerImage(entry);
                    const entryValue = core.getCollectionEntryValue
                      ? core.getCollectionEntryValue(entry)
                      : entry.status === "regular"
                        ? entry.regularValue
                        : entry.occasionalValue;
                    const entryStatusLabel =
                      entry.status === "favorite"
                        ? "⭐ Favorite Customer"
                        : core.getCustomerStatusLabel
                          ? core.getCustomerStatusLabel(entry.status)
                          : entry.status === "regular"
                            ? "Regular Customer"
                            : "Occasional Customer";
                    const entryFavoriteVisits = Math.max(0, Math.min(favoriteGoal, Number(entry.favoriteVisits) || 0));
                    const entryProgress =
                      entry.status === "favorite"
                        ? `Value: ${core.formatCurrency(entryValue)}`
                        : entry.status === "regular"
                          ? `Favorite Progress: ${entryFavoriteVisits}/${favoriteGoal}`
                          : "";
                    const statusClass =
                      entry.status === "favorite"
                        ? "customer-mini-card-favorite"
                        : entry.status === "regular"
                          ? "customer-mini-card-regular"
                          : "customer-mini-card-occasional";
                    return `
                    <button class="customer-mini-card ${statusClass} ${selectedCustomer && selectedCustomer.customerId === entry.customerId ? "customer-mini-card-selected" : ""}" type="button" data-customer-id="${escapeHtml(entry.customerId)}">
                      <div class="customer-mini-summary">
                        <img class="customer-avatar customer-avatar-compact" src="${image}" alt="${escapeHtml(entry.customerName)}" onerror="this.onerror=null;this.src='../assets/restaurant-challenge/customers/customer-placeholder.svg';" />
                        <div class="customer-mini-copy">
                          <p class="customer-name">${escapeHtml(entry.customerName)}</p>
                          <p class="customer-meta">${escapeHtml(entryStatusLabel)}</p>
                        </div>
                        ${entryProgress ? `<p class="customer-favorite-progress customer-favorite-progress-mini">${escapeHtml(entryProgress)}</p>` : ""}
                      </div>
                    </button>
                  `;
                  }
                )
                .join("")
            : `<p class="empty-state">No customers yet. Play a few rounds to build your roster.</p>`
        }
      </div>

      <div class="divider"></div>
    `;

    elements.collection.querySelectorAll("[data-collection-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        state.collectionFilter = button.dataset.collectionFilter;
        renderAll();
      });
    });

    const toggleSelectedBioButton = document.getElementById("toggle-selected-bio");
    if (toggleSelectedBioButton) {
      toggleSelectedBioButton.addEventListener("click", () => {
        state.selectedCustomerBioExpanded = !state.selectedCustomerBioExpanded;
        renderAll();
      });
    }

    elements.collection.querySelectorAll("[data-customer-id]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedCustomerId = button.dataset.customerId;
        state.selectedCustomerBioExpanded = false;
        renderAll();
      });
    });
  }

  function renderAll() {
    try {
      renderSplashChooser();
      renderMobileHeader();
      renderMobileTabs();
      renderHero();
      renderLeaderboard();
      renderCollection();
      applyMobileTabVisibility();
      requestAnimationFrame(syncDesktopPanelHeights);
    } catch (error) {
      console.error("Restaurant hub render failed:", error);
      if (elements.hero) {
        elements.hero.innerHTML = `
          <div class="hero-stack">
            <div class="hero-content-panel">
              <h1 class="page-title">Restaurant Challenge</h1>
              <p class="copy">The hub hit an error while loading. Refresh the page or open Americana directly for now.</p>
            </div>
          </div>
        `;
      }
      if (elements.collection) {
        elements.collection.innerHTML = `<h2 class="section-title">Customer Collection</h2><p class="copy">Unable to load this section right now.</p>`;
      }
      if (elements.leaderboard) {
        elements.leaderboard.innerHTML = `<h2 class="section-title">Leaderboards</h2><p class="copy">Unable to load this section right now.</p>`;
      }
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  bindHowToPlay();
  renderAll();
  if (core.whenReady) {
    core.whenReady().then(async () => {
      if (authCallbackMode) {
        try {
          const recoveredProfile = await core.completeEmailSignInFromUrl();
          state.authMessage = recoveredProfile
            ? `Welcome back to ${recoveredProfile.restaurantName}.`
            : "";
          state.authError = "";
          state.showSignIn = false;
        } catch (error) {
          state.authMessage = "";
          state.authError = error instanceof Error ? error.message : "Unable to complete sign-in.";
          state.showSignIn = true;
        }
      }
      renderAll();
    });
  }
  window.addEventListener("resize", () => {
    requestAnimationFrame(syncDesktopPanelHeights);
  });
})();
