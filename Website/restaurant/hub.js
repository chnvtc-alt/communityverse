(() => {
  const core = window.RestaurantChallengeCore;
  const query = new URLSearchParams(window.location.search);
  const editMode = query.has("edit");
  const hubMode = query.get("hub") === "1" || query.get("view") === "hub";
  const authCallbackMode = query.get("auth") === "callback";
  const salesDemoHubMode = query.get("demo") === "1" || (() => {
    try {
      return window.sessionStorage?.getItem("restaurantSalesDemoCta") === "1";
    } catch {
      return false;
    }
  })();

  const metricOptions = [
    {
      value: "netWorth",
      label: "Total Score",
      rankLabel: "Total Score",
      description: "Total of your score breakdown.",
    },
    {
      value: "rating",
      label: "Trivia %",
      rankLabel: "Trivia %",
      description: "Average trivia score after at least 4 games.",
    },
    {
      value: "collected",
      label: "Characters",
      rankLabel: "Characters",
      description: "Total collectible characters unlocked.",
    },
    {
      value: "gamesPlayed",
      label: "Games",
      rankLabel: "Games",
      description: "Total completed games played by each restaurant.",
    },
  ];

  function getInitialMobileTab() {
    if (window.location.hash === "#collection-panel") {
      return "collection";
    }

    if (window.location.hash === "#leaderboard-panel") {
      return "leaderboard";
    }

    return "overview";
  }

  const state = {
    metric: metricOptions.some((option) => option.value === query.get("metric")) ? query.get("metric") : "netWorth",
    leaderboardScope: query.get("scope") === "restaurant" ? "restaurant" : "overall",
    leaderboardRestaurantSlug: core.slugify(query.get("restaurant") || "") || "americana",
    selectedDirectorySlug: "",
    selectedGameMode: query.get("mode") === "friends" ? "friends" : "solo",
    splashStatsScope: "overall",
    collectionFilter: "all",
    inviteBackCustomerId: "",
    selectedCustomerId: "",
    selectedCustomerBioExpanded: false,
    activeMobileTab: getInitialMobileTab(),
    showSignIn: query.get("signin") === "1" || authCallbackMode,
    showConnectEmail: query.get("connect") === "1",
    showGuestSaveForm: query.get("save") === "1",
    connectInfoExpanded: false,
    authMessage: authCallbackMode ? "Verifying your secure sign-in link..." : "",
    authError: "",
    connectMessage: "",
    connectError: "",
    guestSaveMessage: "",
    guestSaveError: "",
    profileEditMode: editMode,
    expansionMessage: "",
    expansionError: "",
    upgradeMessage: "",
    upgradeError: "",
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

  function withEntryPoint(url) {
    const stringUrl = String(url || "");
    if (!stringUrl || stringUrl === "#" || stringUrl.includes("entry=")) {
      return stringUrl;
    }

    const [pathAndQuery, hash = ""] = stringUrl.split("#");
    const separator = pathAndQuery.includes("?") ? "&" : "?";
    const entryPoint = window.location.pathname || "/restaurant/";
    return `${pathAndQuery}${separator}entry=${encodeURIComponent(entryPoint)}${hash ? `#${hash}` : ""}`;
  }

  function updateSalesDemoCta() {
    document.querySelectorAll("[data-sales-demo-cta]").forEach((link) => {
      link.classList.toggle("hidden", !salesDemoHubMode);
    });
    document.querySelectorAll("[data-sales-demo-cta-note]").forEach((note) => {
      note.textContent = salesDemoHubMode ? "Ready for your own version?" : "";
      note.classList.toggle("hidden", !salesDemoHubMode);
    });
  }

  const elements = {
    tabs: null,
    mobileHeader: null,
    splashRestaurantSelect: document.getElementById("splash-restaurant-select"),
    splashPlayButton: document.getElementById("splash-play-button"),
    splashStartPlayingButton: document.getElementById("splash-start-playing-button"),
    splashCreateRoomButton: document.getElementById("splash-create-room-button"),
    splashMyRestaurantButton: document.getElementById("splash-my-restaurant-button"),
    splashLeaderboardButton: document.getElementById("splash-leaderboard-button"),
    splashHowToPlayButton: document.getElementById("splash-how-to-play-button"),
    restaurantDirectory: document.getElementById("challenge-restaurant-directory"),
    challengeModeInputs: Array.from(document.querySelectorAll("input[name='challengeMode']")),
    challengeSoloPanel: document.getElementById("challenge-solo-panel"),
    challengeFriendsPanel: document.getElementById("challenge-friends-panel"),
    howToPlayModal: document.getElementById("how-to-play-modal"),
    contactModal: document.getElementById("contact-modal"),
    contactForm: document.getElementById("contact-form"),
    contactStatus: document.getElementById("contact-message-status"),
    contactSubmit: document.getElementById("contact-submit"),
    splashPlayerRestaurantName: document.getElementById("splash-player-restaurant-name"),
    splashStatsScope: document.getElementById("splash-stats-scope"),
    splashRatingBadge: document.getElementById("splash-rating-badge"),
    splashCustomersBadge: document.getElementById("splash-customers-badge"),
    splashRankBadge: document.getElementById("splash-rank-badge"),
    hero: document.getElementById("hero-panel"),
    collection: document.getElementById("collection-panel"),
    leaderboard: document.getElementById("leaderboard-panel"),
    sections: document.querySelector(".grid-two"),
    footer: document.getElementById("site-footer"),
  };

  let howToPlayReturnFocus = null;
  let contactReturnFocus = null;

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
      <button class="button ${state.activeMobileTab === "collection" ? "button-primary" : "button-muted"}" data-hub-tab="collection" type="button">Characters</button>
      <button class="button ${state.activeMobileTab === "leaderboard" ? "button-primary" : "button-muted"}" data-hub-tab="leaderboard" type="button">Leaderboards</button>
    `;

    tabs.querySelectorAll("[data-hub-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        if (!hubMode) {
          const destination =
            button.dataset.hubTab === "collection"
              ? "/restaurant/?hub=1#collection-panel"
              : button.dataset.hubTab === "leaderboard"
                ? "/restaurant/?hub=1#leaderboard-panel"
                : "/restaurant/?hub=1#hero-panel";
          window.location.href = destination;
          return;
        }

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
    const directoryRestaurants = getDirectoryRestaurants(profile);
    const selectedSlug = state.selectedDirectorySlug || getDefaultDirectorySlug(profile);
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

    const soloHref = selectedRestaurant?.available && selectedRestaurant.href
      ? withEntryPoint(selectedRestaurant.href)
      : "#splash-chooser";
    const createRoomHref = selectedRestaurant?.available
      ? withEntryPoint(`/${selectedRestaurant.slug}/play/?multiplayer=1`)
      : "#splash-chooser";
    const primaryHref = state.selectedGameMode === "friends" ? createRoomHref : soloHref;
    const primaryLabel = state.selectedGameMode === "friends"
      ? "Create a friends room"
      : "Start Restaurant Challenge Trivia";

    elements.splashPlayButton.setAttribute("aria-disabled", selectedRestaurant?.available ? "false" : "true");
    elements.splashPlayButton.classList.toggle("is-disabled", !selectedRestaurant?.available);
    elements.splashPlayButton.href = primaryHref;
    elements.splashPlayButton.setAttribute("aria-label", primaryLabel);
    if (elements.splashStartPlayingButton) {
      elements.splashStartPlayingButton.setAttribute("aria-disabled", selectedRestaurant?.available ? "false" : "true");
      elements.splashStartPlayingButton.classList.toggle("is-disabled", !selectedRestaurant?.available);
      elements.splashStartPlayingButton.href = soloHref;
      elements.splashStartPlayingButton.textContent = selectedRestaurant?.available ? "Start Game" : "Coming Soon";
    }
    if (elements.splashCreateRoomButton) {
      elements.splashCreateRoomButton.setAttribute("aria-disabled", selectedRestaurant?.available ? "false" : "true");
      elements.splashCreateRoomButton.classList.toggle("is-disabled", !selectedRestaurant?.available);
      elements.splashCreateRoomButton.href = createRoomHref;
    }
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
    elements.challengeModeInputs.forEach((input) => {
      input.checked = input.value === state.selectedGameMode;
      input.onchange = (event) => {
        state.selectedGameMode = event.currentTarget.value === "friends" ? "friends" : "solo";
        renderSplashChooser();
      };
    });
    if (elements.challengeSoloPanel) {
      elements.challengeSoloPanel.classList.toggle("hidden", state.selectedGameMode !== "solo");
    }
    if (elements.challengeFriendsPanel) {
      elements.challengeFriendsPanel.classList.toggle("hidden", state.selectedGameMode !== "friends");
    }
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

  function openContact() {
    if (!elements.contactModal) {
      return;
    }

    contactReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : elements.splashContactButton;
    elements.contactModal.classList.remove("hidden");
    elements.contactModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("contact-open");

    requestAnimationFrame(() => {
      const firstField = document.getElementById("contact-name");
      if (firstField instanceof HTMLElement) {
        firstField.focus();
      }
    });
  }

  function closeContact() {
    if (!elements.contactModal) {
      return;
    }

    elements.contactModal.classList.add("hidden");
    elements.contactModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("contact-open");

    if (contactReturnFocus instanceof HTMLElement) {
      contactReturnFocus.focus();
    }
    contactReturnFocus = null;
  }

  function setContactStatus(message, isError = false) {
    if (!elements.contactStatus) {
      return;
    }
    elements.contactStatus.textContent = message;
    elements.contactStatus.classList.toggle("hidden", !message);
    elements.contactStatus.classList.toggle("form-message-error", isError);
    elements.contactStatus.classList.toggle("form-message-success", Boolean(message) && !isError);
  }

  function bindContact() {
    document.addEventListener("click", (event) => {
      const button = event.target instanceof Element ? event.target.closest("[data-contact-button]") : null;
      if (!button) {
        return;
      }
      event.preventDefault();
      openContact();
    });

    if (elements.contactModal) {
      elements.contactModal.querySelectorAll("[data-contact-close]").forEach((button) => {
        button.addEventListener("click", closeContact);
      });
    }

    if (elements.contactForm) {
      elements.contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const payload = {
          name: String(formData.get("name") || "").trim(),
          email: String(formData.get("email") || "").trim(),
          message: String(formData.get("message") || "").trim(),
          company: String(formData.get("company") || "").trim(),
          page: window.location.href,
        };

        setContactStatus("");
        if (elements.contactSubmit) {
          elements.contactSubmit.disabled = true;
          elements.contactSubmit.textContent = "Sending...";
        }

        try {
          const response = await fetch("/api/contact", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          const result = await response.json().catch(() => ({
            error: "Contact email is not configured yet.",
          }));
          if (!response.ok || result?.ok === false) {
            throw new Error(result?.error || "The message could not be sent.");
          }

          form.reset();
          setContactStatus("Thanks. Your message was sent.");
        } catch (error) {
          setContactStatus(error instanceof Error ? error.message : "The message could not be sent.", true);
        } finally {
          if (elements.contactSubmit) {
            elements.contactSubmit.disabled = false;
            elements.contactSubmit.textContent = "Send Message";
          }
        }
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && elements.contactModal && !elements.contactModal.classList.contains("hidden")) {
        closeContact();
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
    elements.splashCustomersBadge.textContent = `👥 Characters: ${collected}`;
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
      return accuracy;
    }

    if (metric === "gamesPlayed") {
      return stats.gamesPlayed;
    }

    if (metric === "restaurantValue") {
      return stats.restaurantValue || 0;
    }

    if (metric === "netWorth") {
      return stats.netWorth || stats.restaurantValue || 0;
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
    if (metric === "estimatedSales" || metric === "restaurantValue" || metric === "netWorth") {
      return core.formatCurrency(value);
    }

    if (metric === "rating") {
      const percent = Math.max(0, Math.min(100, Number(value) || 0));
      const rounded = Math.round(percent * 10) / 10;
      return `${rounded}%`;
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
    const selectedRestaurant = getPlayableRestaurants().find(
      (restaurant) => restaurant.slug === state.leaderboardRestaurantSlug
    );
    if (selectedRestaurant) {
      return selectedRestaurant;
    }

    return (
      getPlayableRestaurants({ publicOnly: true }).find(
        (restaurant) => restaurant.slug === state.leaderboardRestaurantSlug
      ) ||
      getPlayableRestaurants({ publicOnly: true })[0] ||
      core.restaurants[0] ||
      null
    );
  }

  function directoryEntryFromRestaurant(restaurant) {
    return {
      slug: restaurant.slug,
      name: restaurant.name,
      description: restaurant.description || restaurant.openingCopy || "",
      location: restaurant.location || "",
      image: restaurant.logoSquare || restaurant.squareImage || restaurant.logoHorizontal || restaurant.heroImage,
      href: `/${restaurant.slug}/`,
      available: true,
    };
  }

  function getDirectoryRestaurants(profile = null) {
    const playableRestaurants = getPlayableRestaurants({ publicOnly: true });
    const privateSlugs = [
      String(profile?.baseRestaurantSlug || "").trim(),
      String(profile?.recentSessions?.[0]?.restaurantSlug || "").trim(),
    ].filter(Boolean);
    const privateRestaurants = privateSlugs
      .map((slug) => core.getRestaurantBySlug(slug))
      .filter(
        (restaurant, index, list) =>
          restaurant &&
          restaurant.active !== false &&
          restaurant.playable !== false &&
          restaurant.visibleInList === false &&
          list.findIndex((item) => item?.slug === restaurant.slug) === index
      );

    if (playableRestaurants.length) {
      return [...playableRestaurants, ...privateRestaurants].map(directoryEntryFromRestaurant);
    }

    if (privateRestaurants.length) {
      return privateRestaurants.map(directoryEntryFromRestaurant);
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

  function getFeaturedDirectorySlug(directoryRestaurants) {
    return (
      directoryRestaurants.find((restaurant) => /hudson/i.test(restaurant.name))?.slug ||
      directoryRestaurants.find((restaurant) => restaurant.slug === "hudsons-hickory-house")?.slug ||
      directoryRestaurants.find((restaurant) => restaurant.slug === "hudson-s-hickory-house")?.slug ||
      directoryRestaurants[0]?.slug ||
      "americana"
    );
  }

  function getDefaultDirectorySlug(profile) {
    const baseRestaurantSlug = String(profile?.baseRestaurantSlug || "").trim();
    const recentRestaurantSlug = String(profile?.recentSessions?.[0]?.restaurantSlug || "").trim();
    const directoryRestaurants = getDirectoryRestaurants(profile);
    if (baseRestaurantSlug && directoryRestaurants.some((restaurant) => restaurant.slug === baseRestaurantSlug)) {
      return baseRestaurantSlug;
    }
    if (recentRestaurantSlug && directoryRestaurants.some((restaurant) => restaurant.slug === recentRestaurantSlug)) {
      return recentRestaurantSlug;
    }
    return getFeaturedDirectorySlug(directoryRestaurants);
  }

  function getSelectedDirectoryRestaurant(profile) {
    const directoryRestaurants = getDirectoryRestaurants(profile);
    const defaultSlug = getDefaultDirectorySlug(profile);
    const selectedSlug = state.selectedDirectorySlug || defaultSlug;
    return (
      directoryRestaurants.find((restaurant) => restaurant.slug === selectedSlug) ||
      directoryRestaurants[0] ||
      null
    );
  }

  function renderRestaurantDirectory() {
    if (!elements.restaurantDirectory || hubMode) {
      return;
    }

    const profile = core.getActiveProfile();
    const directoryRestaurants = getDirectoryRestaurants(profile);
    elements.restaurantDirectory.innerHTML = directoryRestaurants
      .map((restaurant) => {
        const description = restaurant.description || restaurant.location || "Play a quick 10-question trivia game for this restaurant.";
        const location = restaurant.location ? `<p class="challenge-directory-location">${escapeHtml(restaurant.location)}</p>` : "";
        const image = restaurant.image
          ? `<img class="challenge-directory-logo" src="${escapeHtml(restaurant.image)}" alt="${escapeHtml(`${restaurant.name} logo`)}" loading="lazy" />`
          : `<span class="challenge-directory-logo challenge-directory-logo-fallback" aria-hidden="true">${escapeHtml(restaurant.name.charAt(0) || "R")}</span>`;

        return `
          <article class="challenge-directory-card">
            <a class="challenge-directory-link" href="${escapeHtml(restaurant.href)}">
              ${image}
              <span class="challenge-directory-content">
                <strong>${escapeHtml(restaurant.name)}</strong>
                ${location}
                <span>${escapeHtml(description)}</span>
              </span>
            </a>
          </article>
        `;
      })
      .join("");

    elements.restaurantDirectory.querySelectorAll(".challenge-directory-logo").forEach((image) => {
      image.addEventListener("error", () => {
        const fallback = document.createElement("span");
        fallback.className = "challenge-directory-logo challenge-directory-logo-fallback";
        fallback.setAttribute("aria-hidden", "true");
        fallback.textContent = image.getAttribute("alt")?.trim().charAt(0) || "R";
        image.replaceWith(fallback);
      }, { once: true });
    });
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

  function getCustomerDisplayName(record) {
    if (!record) {
      return "Character";
    }

    return core.getCustomerById(record.customerId)?.name || record.customerName || record.name || "Character";
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

  function renderGuestSaveMarkup(profile) {
    if (!profile) {
      return "";
    }

    if (!state.showGuestSaveForm) {
      return `
        <div class="hub-email-info">
          <p class="helper" style="margin: 0 0 10px;">Save your restaurant to keep your characters, trivia record, and leaderboard progress. No email required.</p>
          <button class="button button-primary button-sm" type="button" data-show-guest-save>
            Name &amp; Save My Restaurant
          </button>
        </div>
      `;
    }

    return `
      <form class="hub-sign-in-form" id="hub-guest-save-form">
        <div class="field">
          <label class="field-label" for="hub-guest-restaurant-name">Restaurant name</label>
          <input class="input hero-profile-input" id="hub-guest-restaurant-name" name="restaurantName" type="text" maxlength="32" value="${escapeHtml(profile.restaurantName)}" />
        </div>
        <div class="field">
          <label class="field-label" for="hub-guest-player-name">Player name</label>
          <input class="input hero-profile-input" id="hub-guest-player-name" name="playerName" type="text" value="${escapeHtml(profile.playerName || "Guest Player")}" />
        </div>
        <div class="field">
          <label class="field-label" for="hub-guest-email">Email address <span style="font-weight: 500;">(optional)</span></label>
          <input class="input hero-profile-input" id="hub-guest-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" />
        </div>
        <p class="helper" style="margin: 0;">Other players only see your restaurant name. Email is optional and only helps you recover progress later.</p>
        <label class="checkbox-row profile-age-confirm" for="hub-guest-age-confirm">
          <input id="hub-guest-age-confirm" name="ageConfirm" type="checkbox" />
          <span>I am 13 or older.</span>
        </label>
        <p class="helper legal-form-note" style="margin: 0;">By saving, you agree to the <a href="/terms/" target="_blank" rel="noopener">Terms of Use</a> and acknowledge the <a href="/privacy/" target="_blank" rel="noopener">Privacy Policy</a>.</p>
        <p class="helper ${state.guestSaveMessage ? "" : "hidden"}" id="hub-guest-save-message" aria-live="polite">${escapeHtml(state.guestSaveMessage)}</p>
        <p class="error ${state.guestSaveError ? "" : "hidden"}" id="hub-guest-save-error" aria-live="polite">${escapeHtml(state.guestSaveError)}</p>
        <div class="hero-profile-edit-row">
          <button class="button button-primary button-sm" id="hub-guest-save-submit" type="submit">Name &amp; Save My Restaurant</button>
          <button class="button button-muted button-sm" id="hub-guest-save-cancel" type="button">Cancel</button>
        </div>
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
              <img class="hub-overview-avatar" src="${resolveCustomerImage(entry)}" alt="${escapeHtml(getCustomerDisplayName(entry))}" onerror="this.onerror=null;this.src='../assets/restaurant-challenge/customers/customer-placeholder.svg';" />
              <span>${escapeHtml(getCustomerDisplayName(entry))}</span>
            </button>
          `)
          .join("")
      : `<p class="helper" style="margin: 0;">Play a game to unlock characters.</p>`;

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
            <span>Recent Characters</span>
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
    const unlockedCharacters =
      (Number(summary.stats.regularCustomers) || 0) + (Number(summary.stats.occasionalCustomers) || 0);
    const characterDetail =
      Number(breakdown.loyaltyValue) === unlockedCharacters * 100
        ? `${unlockedCharacters} x 100 pts`
        : `${unlockedCharacters} characters`;
    const rows = [
      { label: "Restaurant Type", detail: breakdown.expansionLabel || "Food Truck", value: breakdown.expansionValue },
      { label: "Upgrades", value: breakdown.upgradeValue },
      { label: "Characters", detail: characterDetail, value: breakdown.loyaltyValue },
      { label: "Spendable Points *", value: cashOnHand },
      { label: "Trivia Accuracy **", value: breakdown.ratingValue },
    ];

    return `
      <div class="restaurant-value-breakdown" aria-label="Total Score breakdown">
        <div class="restaurant-value-breakdown-head">
          <span>Total Score = Sum of the score cards below</span>
          <strong>${core.formatCurrency(netWorth)}</strong>
        </div>
        <div class="restaurant-value-breakdown-grid">
          ${rows
            .map(
              ({ label, detail = "", value }) => `
                <div class="restaurant-value-breakdown-row">
                  <span>
                    ${escapeHtml(label)}
                    ${detail ? `<small>${escapeHtml(detail)}</small>` : ""}
                  </span>
                  <strong>${core.formatCurrency(value)}</strong>
                </div>
              `
            )
            .join("")}
        </div>
        <p class="restaurant-value-breakdown-note">
          * Spendable Points = Trivia Rewards from earning characters minus points spent on restaurant expansions and upgrades.<br />
          ** Trivia Accuracy = bonus based on your correct-answer rate. 100% accuracy adds 2.5% to Restaurant Type + Characters + Upgrades, not Spendable Points.
        </p>
      </div>
    `;
  }

  function getCompactRestaurantName(name, maxLength = 22) {
    const value = String(name || "Your Restaurant").trim() || "Your Restaurant";
    if (value.length <= maxLength) {
      return value;
    }

    const cutPoint = value.lastIndexOf(" ", maxLength - 3);
    const slicePoint = cutPoint > 8 ? cutPoint : maxLength - 3;
    const compact = value
      .slice(0, slicePoint)
      .replace(/\s+(and|of|the|a|an|at|in|on|by|for)$/i, "")
      .replace(/[.,;:!?-]+$/, "")
      .trim();
    return compact ? `${compact}...` : `${value.slice(0, maxLength - 3)}...`;
  }

  const expansionImageMap = {
    "food-truck": {
      label: "Food Truck",
      image: "food-truck.png",
      className: "restaurant-expansion-art-food-truck",
    },
    "counter-service": {
      label: "Counter Service",
      image: "counter-service.png",
      className: "restaurant-expansion-art-counter-service",
    },
    "small-diner": {
      label: "Small Diner",
      image: "small-diner.png",
      className: "restaurant-expansion-art-small-diner",
    },
    "family-restaurant": {
      label: "Family Restaurant",
      image: "family-restaurant.png",
      className: "restaurant-expansion-art-family-restaurant",
    },
    "regional-favorite": {
      label: "Regional Favorite",
      image: "regional-favorite.png",
      className: "restaurant-expansion-art-regional-favorite",
    },
    "local-landmark": {
      label: "Local Landmark",
      image: "local-landmark.png",
      className: "restaurant-expansion-art-local-landmark",
    },
  };

  function renderExpansionImageMarkup(profile) {
    if (!profile || !core.getRestaurantExpansionPreview) {
      return "";
    }

    const preview = core.getRestaurantExpansionPreview(profile);
    const imageConfig = expansionImageMap[preview?.current?.id || ""];
    if (!imageConfig) {
      return "";
    }

    const restaurantName = profile.restaurantName || "Your Restaurant";
    const displayName = getCompactRestaurantName(restaurantName);

    return `
      <div class="restaurant-expansion-image-card">
        <div class="restaurant-expansion-image-copy">
          <span>Restaurant Type</span>
          <strong>${escapeHtml(imageConfig.label)}</strong>
        </div>
        <div class="restaurant-expansion-art ${imageConfig.className}" role="img" aria-label="${escapeHtml(`${imageConfig.label} for ${restaurantName}`)}">
          <img src="../assets/restaurant-challenge/expansions/${escapeHtml(imageConfig.image)}" alt="" aria-hidden="true" />
          <div class="restaurant-expansion-image-name"><span>${escapeHtml(displayName)}</span></div>
        </div>
      </div>
    `;
  }

  function getRestaurantCreditForEntry(entry, restaurantSlug) {
    if (!entry || !restaurantSlug) {
      return null;
    }

    const credits =
      entry.restaurantCredits && typeof entry.restaurantCredits === "object" && !Array.isArray(entry.restaurantCredits)
        ? entry.restaurantCredits
        : {};

    if (credits[restaurantSlug]) {
      return credits[restaurantSlug];
    }

    if (entry.restaurantSlug === restaurantSlug && entry.status && entry.status !== "lost") {
      return entry;
    }

    return null;
  }

  function getCustomerInviteBackHref(entry, fallbackRestaurant = null) {
    const credits =
      entry?.restaurantCredits && typeof entry.restaurantCredits === "object" && !Array.isArray(entry.restaurantCredits)
        ? entry.restaurantCredits
        : {};
    const creditSlugs = Object.keys(credits).filter(Boolean);
    const fallbackSlug = String(fallbackRestaurant?.slug || "").trim();
    const restaurantSlug =
      (fallbackSlug && creditSlugs.includes(fallbackSlug) ? fallbackSlug : "") ||
      String(entry?.restaurantSlug || "").trim() ||
      creditSlugs[0] ||
      fallbackSlug ||
      "americana";

    return `/${encodeURIComponent(restaurantSlug)}/?customerId=${encodeURIComponent(entry?.customerId || "")}`;
  }

  function isFeedbackRewardCustomerEntry(entry) {
    if (!entry) {
      return false;
    }

    const liveCustomer = core.getCustomerById(entry.customerId);
    return entry.source === "feedback" || liveCustomer?.feedbackRewardOnly === true;
  }

  function renderCustomerCollectionCompleteMarkup(profile, restaurant) {
    if (!profile || !restaurant?.slug || !core.getCustomersForRestaurant) {
      return "";
    }

    const availableCustomers = core.getCustomersForRestaurant(restaurant.slug);
    if (!availableCustomers.length) {
      return "";
    }

    const collection = Array.isArray(profile.customerCollection) ? profile.customerCollection : [];
    const collectedIds = new Set(
      collection
        .filter((entry) => getRestaurantCreditForEntry(entry, restaurant.slug))
        .map((entry) => entry.customerId)
        .filter(Boolean)
    );

    if (collectedIds.size < availableCustomers.length) {
      return "";
    }

    return `
      <div class="restaurant-complete-note">
        <strong>You unlocked every character currently available in ${escapeHtml(restaurant.name)}.</strong>
        <span>Keep playing here to improve trivia, build Favorites, earn points, and grow your virtual restaurant. You can also try another Restaurant Challenge when you're ready.</span>
      </div>
    `;
  }

  function renderExpansionPreviewMarkup(profile, stats = null) {
    if (!profile || !core.getRestaurantExpansionPreview) {
      return "";
    }

    const preview = core.getRestaurantExpansionPreview(profile);
    if (!preview?.current) {
      return "";
    }
    const cashOnHand = core.getRestaurantCashOnHand
      ? core.getRestaurantCashOnHand(profile, stats || profile.stats)
      : Math.max(0, Number((stats || profile.stats)?.estimatedSales) || 0);
    const nextCost = Math.max(0, Number(preview.next?.cost) || 0);
    const canBuyNext = Boolean(preview.next && core.buyNextRestaurantExpansion && cashOnHand >= nextCost);
    const shortfall = preview.next ? Math.max(0, nextCost - cashOnHand) : 0;
    const expansionPreview = core.getRestaurantExpansionPreview
      ? core.getRestaurantExpansionPreview(profile)
      : null;
    const upgradesLocked = expansionPreview?.current?.id === "food-truck";
    const upgrades = core.getRestaurantUpgradePreview && !upgradesLocked
      ? core.getRestaurantUpgradePreview(profile, 3)
      : [];
    const affordableUpgrade = upgrades.find((upgrade) => {
      return cashOnHand >= Math.max(0, Number(upgrade.cost) || 0);
    });
    const nextUpgradeCost = upgrades.reduce((lowest, upgrade) => {
      const cost = Math.max(0, Number(upgrade.cost) || 0);
      return lowest === null || cost < lowest ? cost : lowest;
    }, null);
    const nextUpgradeShortfall = nextUpgradeCost === null ? 0 : Math.max(0, nextUpgradeCost - cashOnHand);
    const valueAdded = Math.max(0, Number(preview.valueAdded) || 0);
    const totalScoreIncrease = Math.max(0, valueAdded - nextCost);
    const expansionNote = (() => {
      if (!preview.next) {
        return `You have ${core.formatCurrency(cashOnHand)} in Spendable Points. Your restaurant is fully expanded.`;
      }
      if (cashOnHand <= 0) {
        return `Spendable Points: ${core.formatCurrency(0)}. Unlock more characters to open expansions.`;
      }
      if (canBuyNext) {
        return `You have ${core.formatCurrency(cashOnHand)} in Spendable Points. You can expand from ${preview.current.label} to ${preview.next.label} now. Expanding costs ${core.formatCurrency(nextCost)} but adds ${core.formatCurrency(valueAdded)} to your Restaurant Type, so your Total Score will increase by ${core.formatCurrency(totalScoreIncrease)}.`;
      }
      if (affordableUpgrade) {
        return preview.next
          ? `You have ${core.formatCurrency(cashOnHand)} in Spendable Points. Save ${core.formatCurrency(shortfall)} more to expand from ${preview.current.label} to ${preview.next.label}.`
          : `You have ${core.formatCurrency(cashOnHand)} in Spendable Points. Your restaurant is fully expanded.`;
      }
      const upgradeText = nextUpgradeShortfall > 0
        ? ` or ${core.formatCurrency(nextUpgradeShortfall)} more for your next upgrade`
        : "";
      return `You have ${core.formatCurrency(cashOnHand)} in Spendable Points. Save ${core.formatCurrency(shortfall)} more to expand from ${preview.current.label} to ${preview.next.label}${upgradeText}.`;
    })();

    return `
      <div class="restaurant-expansion-preview" aria-label="Restaurant expansion preview">
        <div class="restaurant-expansion-preview-head">
          <span>Expansions</span>
          <span>${escapeHtml(expansionNote)}</span>
        </div>
        <div class="restaurant-expansion-preview-grid">
          <div class="restaurant-expansion-preview-card">
            <span class="restaurant-expansion-label">Current size</span>
            <strong>${escapeHtml(preview.current.label || "Food Truck")}</strong>
          </div>
        ${
          preview.next
            ? `
              <div class="restaurant-expansion-preview-card">
                <span class="restaurant-expansion-label">Next expansion</span>
                <strong>${escapeHtml(preview.next.label)}</strong>
              </div>
              <div class="restaurant-expansion-preview-card">
                <span class="restaurant-expansion-label">Cost</span>
                <strong>${core.formatCurrency(preview.next.cost)}</strong>
              </div>
              <div class="restaurant-expansion-preview-card">
                <span class="restaurant-expansion-label">Adds to type</span>
                <strong>${core.formatCurrency(preview.valueAdded)}</strong>
              </div>
              <div class="restaurant-expansion-preview-card restaurant-expansion-action">
                <button class="button ${canBuyNext ? "button-primary" : "button-muted"} button-sm restaurant-expansion-button" type="button" data-buy-expansion ${canBuyNext ? "" : "disabled"}>
                  ${canBuyNext ? "Add Expansion" : `Need ${core.formatCurrency(shortfall)} more`}
                </button>
              </div>
            `
            : `
              <div class="restaurant-expansion-preview-card">
                <span class="restaurant-expansion-label">Next expansion</span>
                <strong>Fully expanded</strong>
              </div>
            `
        }
        </div>
      </div>
      ${
        state.expansionMessage || state.expansionError
          ? `<p class="restaurant-expansion-status ${state.expansionError ? "restaurant-expansion-status-error" : ""}">${escapeHtml(state.expansionError || state.expansionMessage)}</p>`
          : ""
      }
    `;
  }

  function renderUpgradePreviewMarkup(profile, stats = null) {
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
    const cashOnHand = core.getRestaurantCashOnHand
      ? core.getRestaurantCashOnHand(profile, stats || profile.stats)
      : Number((stats || profile.stats)?.estimatedSales) || 0;
    const ownedBoostPercent = core.getRestaurantSalesBoostPercent
      ? core.getRestaurantSalesBoostPercent(profile)
      : 0;

    return `
      <div class="restaurant-upgrade-preview ${upgradesLocked ? "restaurant-upgrade-preview-locked" : ""}" aria-label="Next restaurant upgrades">
        <div class="restaurant-upgrade-preview-head">
          <span>${upgradesLocked ? "Upgrades" : "Next Upgrades"}</span>
          ${
            upgradesLocked
              ? `<span>Available after expansion to Counter Service.</span>`
              : ownedBoostPercent > 0
                ? `<span>Owned upgrades make future Trivia Rewards ${Number(ownedBoostPercent).toFixed(0)}% higher.</span>`
                : `<span>Upgrades add Score and make future Trivia Rewards higher.</span>`
          }
        </div>
        <div class="restaurant-upgrade-preview-grid">
          ${upgrades
            .map(
              (upgrade) => {
                const cost = Math.max(0, Number(upgrade.cost) || 0);
                const canBuyUpgrade = !upgradesLocked && core.buyRestaurantUpgrade && cashOnHand >= cost;
                return `
                <div class="restaurant-upgrade-preview-card">
                  <strong>${escapeHtml(upgrade.label)}</strong>
                  <span>Cost ${core.formatCurrency(upgrade.cost)}</span>
                  <span>Adds ${core.formatCurrency(upgrade.value)} to Score</span>
                  <span>Future Trivia Rewards +${Number(upgrade.salesBoostPercent) || 0}%</span>
                  ${
                    upgradesLocked
                      ? ""
                      : `<button class="button ${canBuyUpgrade ? "button-primary" : "button-muted"} button-sm restaurant-upgrade-button" type="button" data-buy-upgrade="${escapeHtml(upgrade.id)}" ${canBuyUpgrade ? "" : "disabled"}>${canBuyUpgrade ? "Add Upgrade" : `Need ${core.formatCurrency(cost - cashOnHand)}`}</button>`
                  }
                </div>
              `;
              }
            )
            .join("")}
        </div>
        ${
          state.upgradeMessage || state.upgradeError
            ? `<p class="restaurant-expansion-status ${state.upgradeError ? "restaurant-expansion-status-error" : ""}">${escapeHtml(state.upgradeError || state.upgradeMessage)}</p>`
            : ""
        }
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
    const collectedCustomers =
      (safeSummary.stats.regularCustomers || 0) + (safeSummary.stats.occasionalCustomers || 0);
    const cashOnHand = core.getRestaurantCashOnHand
      ? core.getRestaurantCashOnHand(profile, safeSummary.stats)
      : safeSummary.stats.estimatedSales || 0;
    const totalScore = Math.max(0, Number(safeSummary.stats.restaurantValue) || 0) + cashOnHand;
    const selectedDirectoryRestaurant = getSelectedDirectoryRestaurant(profile);
    const customerCompleteMarkup = renderCustomerCollectionCompleteMarkup(profile, selectedDirectoryRestaurant);
    const baseRestaurantSlug = String(profile?.baseRestaurantSlug || "").trim();
    const recentRestaurantSlug = String(profile?.recentSessions?.[0]?.restaurantSlug || "").trim();
    const playAgainTarget = getPlayAgainTarget(profile);
    const emailConnected = Boolean(profile && profile.emailConnected);
    const hasSavedProgress = Boolean(
      profile && (safeSummary.stats.gamesPlayed || collectedCustomers || safeSummary.stats.estimatedSales)
    );
    const guestProgressMarkup =
      profile && hasSavedProgress
        ? `
          <div class="hero-profile-meta ${compactMobile ? "hero-profile-meta-compact" : ""}">
            <span class="chip hero-stat-chip">🏦 Total Score ${core.formatCurrency(totalScore)}</span>
            <span class="chip hero-stat-chip">💵 Spendable ${core.formatCurrency(cashOnHand)}</span>
            <span class="chip hero-stat-chip">👥 Characters ${collectedCustomers}</span>
          </div>
          ${renderExpansionImageMarkup(profile)}
          ${renderRestaurantValueBreakdownMarkup(profile, safeSummary)}
          ${renderExpansionPreviewMarkup(profile, safeSummary.stats)}
          ${renderUpgradePreviewMarkup(profile, safeSummary.stats)}
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
                        <p class="kicker" style="margin: 0 0 4px;">Your Virtual Restaurant</p>
                        <h2 class="hero-profile-name">${escapeHtml(profile.restaurantName)}</h2>
                        <p class="hero-profile-subline hero-profile-subline-compact">
                          <span class="rating-display" aria-label="Guest rating ${(safeSummary.rating || 0).toFixed(1)} out of 5">
                            <span class="rating-stars" aria-hidden="true">${"★".repeat(Math.max(0, Math.min(5, Math.round(safeSummary.rating || 0)))) + "☆".repeat(5 - Math.max(0, Math.min(5, Math.round(safeSummary.rating || 0))))}</span>
                            <span class="rating-number">${(safeSummary.rating || 0).toFixed(1)}</span>
                          </span>
                          <span class="hero-profile-subline-sep">·</span>
                          <span>${safeSummary.stats.gamesPlayed} plays</span>
                        </p>
                        <p class="hero-profile-rating-note">Restaurant rating is solely based on your trivia accuracy.</p>
                      </div>
                        <div class="hero-profile-actions hero-profile-actions-top">
                          ${!emailConnected ? `<button class="button button-primary button-sm" type="button" data-show-connect-email>Save With Email</button>` : ""}
                          <button class="button button-muted button-sm" type="button" data-edit-profile>Change Restaurant Name</button>
                        </div>
                    </div>
                    ${!state.profileEditMode && !emailConnected ? renderConnectInfoMarkup(profile) : ``}
                    ${renderExpansionImageMarkup(profile)}
                    <div class="hero-profile-meta hero-profile-meta-compact">
                      <span class="chip hero-stat-chip">🏦 Total Score ${core.formatCurrency(totalScore)}</span>
                      <span class="chip hero-stat-chip">💵 Spendable ${core.formatCurrency(cashOnHand)}</span>
                      <span class="chip hero-stat-chip">👥 Characters ${collectedCustomers}</span>
                    </div>
                    ${customerCompleteMarkup}
                    ${renderRestaurantValueBreakdownMarkup(profile, safeSummary)}
                    ${renderExpansionPreviewMarkup(profile, safeSummary.stats)}
                    ${renderUpgradePreviewMarkup(profile, safeSummary.stats)}
                    ${
                      !state.profileEditMode && !emailConnected ? renderConnectEmailMarkup(profile) : ``
                    }
                    ${
                      state.profileEditMode
                        ? `
                          <form class="hero-profile-edit-form hero-profile-edit-form-compact" id="hero-profile-edit-form">
                            <div class="field" style="gap: 6px;">
                              <label class="field-label" for="hero-restaurant-name">Restaurant name</label>
                              <div class="hero-profile-edit-row">
                                <input class="input hero-profile-input" id="hero-restaurant-name" name="restaurantName" type="text" maxlength="32" value="${escapeHtml(profile.restaurantName)}" />
                                <button class="button button-primary button-sm" type="submit">Save Changes</button>
                                <button class="button button-muted button-sm" type="button" data-cancel-profile-edit>Cancel</button>
                              </div>
                            </div>
                            <p class="helper" style="margin: 8px 0 0;">Your player name stays the same. Only the virtual restaurant name changes here.</p>
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
                      <p class="kicker" style="margin: 0 0 4px;">Your Virtual Restaurant</p>
                      <h2 class="hero-profile-name">${escapeHtml(profile.restaurantName)}</h2>
                      <p class="hero-profile-subline">
                        <span class="rating-display" aria-label="Guest rating ${(safeSummary.rating || 0).toFixed(1)} out of 5">
                          <span class="rating-stars" aria-hidden="true">${"★".repeat(Math.max(0, Math.min(5, Math.round(safeSummary.rating || 0)))) + "☆".repeat(5 - Math.max(0, Math.min(5, Math.round(safeSummary.rating || 0))))}</span>
                          <span class="rating-number">${(safeSummary.rating || 0).toFixed(1)}</span>
                        </span>
                        <span class="hero-profile-subline-sep">·</span>
                        <span>${safeSummary.stats.gamesPlayed} plays</span>
                      </p>
                      <p class="hero-profile-rating-note">Restaurant rating is solely based on your trivia accuracy.</p>
                    </div>
                    <div class="hero-profile-actions hero-profile-actions-top">
                      ${!emailConnected ? `<button class="button button-primary button-sm" type="button" data-show-connect-email>Save With Email</button>` : ""}
                      <button class="button button-muted button-sm" type="button" data-edit-profile>Change Restaurant Name</button>
                    </div>
                  </div>
                  ${!state.profileEditMode && !emailConnected ? renderConnectInfoMarkup(profile) : ``}
                  ${renderExpansionImageMarkup(profile)}
                  <div class="hero-profile-meta">
                    <span class="chip hero-stat-chip">🏦 Total Score ${core.formatCurrency(totalScore)}</span>
                    <span class="chip hero-stat-chip">💵 Spendable ${core.formatCurrency(cashOnHand)}</span>
                    <span class="chip hero-stat-chip">👥 Characters ${collectedCustomers}</span>
                  </div>
                  ${customerCompleteMarkup}
                  ${renderRestaurantValueBreakdownMarkup(profile, safeSummary)}
                  ${renderExpansionPreviewMarkup(profile, safeSummary.stats)}
                  ${renderUpgradePreviewMarkup(profile, safeSummary.stats)}
                  ${
                    !state.profileEditMode && !emailConnected ? renderConnectEmailMarkup(profile) : ``
                  }
                  ${
                    state.profileEditMode
                      ? `
                        <form class="hero-profile-edit-form" id="hero-profile-edit-form">
                          <div class="field" style="gap: 6px;">
                            <label class="field-label" for="hero-restaurant-name">Restaurant name</label>
                            <div class="hero-profile-edit-row">
                              <input class="input hero-profile-input" id="hero-restaurant-name" name="restaurantName" type="text" maxlength="32" value="${escapeHtml(profile.restaurantName)}" />
                              <button class="button button-primary button-sm" type="submit">Save Changes</button>
                              <button class="button button-muted button-sm" type="button" data-cancel-profile-edit>Cancel</button>
                            </div>
                          </div>
                          <p class="helper" style="margin: 8px 0 0;">Your player name stays the same. Only the virtual restaurant name changes here.</p>
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
                        <h2 class="hero-profile-name">${hasSavedProgress ? escapeHtml(profile.restaurantName) : "Play first, then register to save your virtual restaurant."}</h2>
                        <p class="copy compact-copy" style="margin: 4px 0 0;">${
                          hasSavedProgress
                            ? "This virtual restaurant is saved on this device. Save your restaurant to keep your leaderboard progress."
                            : "You can keep playing as a guest, but registering after your next game keeps your characters and leaderboard progress with you."
                        }</p>
                        ${renderSignInMarkup()}
                        ${hasSavedProgress ? renderGuestSaveMarkup(profile) : ""}
                      </div>
                      <a class="button button-primary button-sm" href="${playAgainTarget.href}">Play ${escapeHtml(playAgainTarget.name)}</a>
                      ${guestProgressMarkup}
                    </div>
                  `
                  : `
                    <div class="hero-profile-strip hero-profile-strip-guest">
                      <div>
                        <p class="kicker" style="margin: 0 0 4px;">Welcome</p>
                        <h2 class="hero-profile-name">Play your first game, then save your virtual restaurant.</h2>
                        <p class="copy compact-copy" style="margin: 4px 0 0;">Start with a quick trivia round. After you unlock your first character, visit My Virtual Restaurant to name and save your virtual restaurant so progress can follow you.</p>
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
                  <p class="kicker" style="margin: 0;">Choose A Restaurant Challenge Game</p>
                  <label class="field" style="gap: 6px;">
                    <select class="select hero-directory-select" id="directory-select" aria-label="Choose a Restaurant Challenge game">
                      ${getDirectoryRestaurants(profile)
                        .map(
                          (restaurantOption) => `
                            <option value="${restaurantOption.slug}" ${selectedDirectoryRestaurant && restaurantOption.slug === selectedDirectoryRestaurant.slug ? "selected" : ""}>
                              ${escapeHtml(restaurantOption.name)}${restaurantOption.slug === baseRestaurantSlug ? " (Base)" : restaurantOption.slug === recentRestaurantSlug ? " (Last Played)" : ""}
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
                            selectedDirectoryRestaurant.slug === baseRestaurantSlug && !compactMobile
                              ? `<p class="hero-directory-note" style="margin: 0 0 8px;">Base restaurant</p>`
                              : selectedDirectoryRestaurant.slug === recentRestaurantSlug && !compactMobile
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

    elements.hero.querySelectorAll("[data-edit-profile]").forEach((button) => {
      button.addEventListener("click", () => {
        state.profileEditMode = true;
        renderHero();
        requestAnimationFrame(() => {
          const input = document.getElementById("hero-restaurant-name");
          if (input instanceof HTMLInputElement) {
            input.focus();
            input.select();
          }
        });
      });
    });

    elements.hero.querySelectorAll("[data-cancel-profile-edit]").forEach((button) => {
      button.addEventListener("click", () => {
        state.profileEditMode = false;
        renderHero();
      });
    });

    if (state.profileEditMode && profile && !profile.isGuest) {
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
          restaurantNameUpdatedAt: new Date().toISOString(),
        });
        void core.syncActiveProfile?.();
        state.profileEditMode = false;
        renderHero();
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

    elements.hero.querySelectorAll("[data-show-guest-save]").forEach((button) => {
      button.addEventListener("click", () => {
        state.showGuestSaveForm = true;
        state.guestSaveMessage = "";
        state.guestSaveError = "";
        renderHero();
      });
    });

    const guestSaveCancel = document.getElementById("hub-guest-save-cancel");
    if (guestSaveCancel) {
      guestSaveCancel.addEventListener("click", () => {
        state.showGuestSaveForm = false;
        state.guestSaveMessage = "";
        state.guestSaveError = "";
        renderHero();
      });
    }

    const guestSaveForm = document.getElementById("hub-guest-save-form");
    if (guestSaveForm && profile?.isGuest) {
      guestSaveForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const restaurantName = document.getElementById("hub-guest-restaurant-name").value.trim();
        const playerName = document.getElementById("hub-guest-player-name").value.trim();
        const email = document.getElementById("hub-guest-email").value.trim();
        const ageConfirmed = document.getElementById("hub-guest-age-confirm").checked;
        const submitButton = document.getElementById("hub-guest-save-submit");
        const validation = core.validateProfileInput(playerName, restaurantName);

        state.guestSaveMessage = "";
        state.guestSaveError = "";

        if (!validation.ok) {
          state.guestSaveError = validation.message;
          renderHero();
          return;
        }

        if (!ageConfirmed) {
          state.guestSaveError = "To save progress, you must be 13 or older. If you are under 13, keep playing as a guest and do not enter personal information.";
          renderHero();
          return;
        }

        if (email && !email.includes("@")) {
          state.guestSaveError = "Enter a valid email address, or leave email blank for now.";
          renderHero();
          return;
        }

        submitButton.disabled = true;
        submitButton.textContent = email ? "Sending..." : "Saving...";
        const previousProfile = profile;

        if (email) {
          try {
            await core.checkEmailCanConnectProfile?.(email, profile.id);
          } catch (error) {
            state.guestSaveError = error instanceof Error ? error.message : "That email could not be connected.";
            submitButton.disabled = false;
            submitButton.textContent = "Name & Save My Restaurant";
            renderHero();
            return;
          }
        }

        core.updateProfile({
          ...profile,
          playerName,
          restaurantName,
          restaurantSlug: core.slugify(restaurantName),
          restaurantNameUpdatedAt: new Date().toISOString(),
          isGuest: false,
        });
        core.setActiveProfileId(profile.id);

        try {
          await core.syncActiveProfile?.();
        } catch (error) {
          core.updateProfile(previousProfile);
          core.setActiveProfileId(previousProfile.id);
          state.guestSaveError = error instanceof Error ? error.message : "Unable to save that restaurant name.";
          submitButton.disabled = false;
          submitButton.textContent = "Name & Save My Restaurant";
          renderHero();
          return;
        }

        if (!email) {
          state.showGuestSaveForm = false;
          state.guestSaveMessage = "";
          renderAll();
          return;
        }

        try {
          await core.sendEmailSignInLink(email, { profileId: profile.id });
          state.showGuestSaveForm = false;
          state.connectMessage = "Check your email and tap the secure link to connect this virtual restaurant.";
          renderAll();
        } catch (error) {
          state.guestSaveError = error instanceof Error ? error.message : "Unable to send the email link.";
          submitButton.disabled = false;
          submitButton.textContent = "Name & Save My Restaurant";
          renderHero();
        }
      });
    }

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
          state.connectMessage = "Check your email and tap the secure link to connect this virtual restaurant.";
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
          state.authMessage = "Check your email and tap the secure link to restore your virtual restaurant.";
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
          ? `${result.expansion?.label || "Expansion"} added. Points used: ${core.formatCurrency(result.cost || 0)}.`
          : "";
        state.expansionError = result?.ok ? "" : result?.message || "Unable to add this expansion yet.";
        state.upgradeMessage = "";
        state.upgradeError = "";
        renderAll();
      });
    });

    elements.hero.querySelectorAll("[data-buy-upgrade]").forEach((button) => {
      button.addEventListener("click", () => {
        if (!profile || !core.buyRestaurantUpgrade) {
          return;
        }

        const result = core.buyRestaurantUpgrade(profile.id, button.dataset.buyUpgrade);
        state.upgradeMessage = result?.ok
          ? `${result.upgrade?.label || "Upgrade"} added. Points used: ${core.formatCurrency(result.cost || 0)}.`
          : "";
        state.upgradeError = result?.ok ? "" : result?.message || "Unable to add this upgrade yet.";
        state.expansionMessage = "";
        state.expansionError = "";
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
    const currentRow = profile ? rows.find((row) => row.profileId === profile.id) : null;
    const currentRankMarkup =
      currentRow
        ? `
          <div class="leaderboard-current-rank-card">
            <p class="kicker">Your ${escapeHtml(selectedMetric.rankLabel || selectedMetric.label)} Rank</p>
            <div class="leaderboard-current-rank-main">
              <div class="leaderboard-current-rank-number">#${currentRow.rank}</div>
              <div>
                <p class="leaderboard-current-rank-name">${escapeHtml(currentRow.restaurantName)}</p>
                <p class="leaderboard-current-rank-label">Your current position</p>
              </div>
              <p class="leaderboard-current-rank-value">${formatMetricValue(currentRow.value, state.metric)}</p>
            </div>
          </div>
        `
        : "";

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
                    ${[
                      ...getPlayableRestaurants({ publicOnly: true }),
                      ...(restaurant && restaurant.visibleInList === false ? [restaurant] : []),
                    ]
                      .filter((restaurantOption, index, list) =>
                        list.findIndex((item) => item.slug === restaurantOption.slug) === index
                      )
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
      ${currentRankMarkup}
      <div class="leaderboard-scroll">
        ${renderRows(
          rows,
          state.metric === "rating"
            ? "No Trivia % entries yet. Play 4 games to qualify."
            : state.leaderboardScope === "overall"
              ? "No leaderboard entries yet."
              : `No ${scopeLabel} scores yet.`
        )}
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

    const liveCustomer = core.getCustomerById(record.customerId);
    if (liveCustomer) {
      return core.getCustomerBio(liveCustomer);
    }

    if (record.bio) {
      return record.bio;
    }

    return core.getCustomerBio({
      id: record.customerId,
      name: getCustomerDisplayName(record),
    });
  }

  function getCharacterStatusLabel(status) {
    if (status === "favorite") {
      return "⭐ Favorite Character";
    }

    return "Collectible Character";
  }

  function canBuildFavoriteProgress(entry) {
    return ["regular", "occasional"].includes(entry?.status);
  }

  function renderCollection() {
    const compactMobile = isMobileHub();
    const profile = core.getActiveProfile();

    if (!profile) {
      elements.collection.innerHTML = `
        <h2 class="section-title">Character Collection</h2>
        <p class="copy">Play your first game to start unlocking characters. After that, visit My Virtual Restaurant to name your virtual restaurant and add email recovery when you are ready.</p>
      `;
      return;
    }

    const collectionSource = Array.isArray(profile.customerCollection) ? profile.customerCollection : [];
    const collection = [...collectionSource].sort((left, right) =>
      String(right.dateWon).localeCompare(String(left.dateWon))
    );
    const filteredCollection =
      state.collectionFilter === "favorite"
        ? collection.filter((entry) => entry.status === "favorite")
        : collection;
    const selectedCustomer =
      filteredCollection.find((entry) => entry.customerId === state.selectedCustomerId) ||
      filteredCollection[0] ||
      null;
    const emptyCollectionMessage = state.collectionFilter === "favorite"
      ? `
        <div class="empty-state">
          <strong>No Favorite Characters yet.</strong>
          <span>Play again for characters already in your collection. Score high enough on repeat visits to build Favorite progress. Favorite Characters become more valuable and can help your restaurant climb the leaderboards.</span>
        </div>
      `
      : `<p class="empty-state">No characters yet. Play a few rounds to build your roster.</p>`;
    const selectedCustomerBio = selectedCustomer ? getCustomerBio(selectedCustomer) : "";
    const selectedCustomerBioPreview = getBioPreview(selectedCustomerBio);
    const showFullBio = state.selectedCustomerBioExpanded || !selectedCustomerBioPreview.isTruncated;
    const favoriteGoal = core.getFavoriteVisitGoal ? core.getFavoriteVisitGoal() : 10;
    const selectedStatusLabel = selectedCustomer ? getCharacterStatusLabel(selectedCustomer.status) : "";
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
    const selectedIsFeedbackReward = isFeedbackRewardCustomerEntry(selectedCustomer);
    const selectedFavoriteProgress =
      selectedIsFeedbackReward
        ? `<p class="customer-favorite-progress">Special feedback reward. Cannot be invited back.</p>`
        : selectedCustomer?.status === "favorite"
        ? `<p class="customer-favorite-progress">Favorite Character. Reward: ${core.formatCurrency(selectedValue)}</p>`
        : canBuildFavoriteProgress(selectedCustomer)
          ? `<p class="customer-favorite-progress">Favorite Progress: ${selectedFavoriteVisits} / ${favoriteGoal} successful visits</p>`
          : "";
    const selectedDirectoryRestaurant = getSelectedDirectoryRestaurant(profile);
    const selectedInviteBackHref = selectedCustomer && !selectedIsFeedbackReward
      ? getCustomerInviteBackHref(selectedCustomer, selectedDirectoryRestaurant)
      : "";
    const selectedCustomerName = getCustomerDisplayName(selectedCustomer);
      elements.collection.innerHTML = `
      <h2 class="section-title">Character Collection</h2>
      <p class="copy">Your unlocked characters are stored here. Tap a card to view it or play for that character again.</p>
      <div class="leaderboard-tabs collection-tabs" role="tablist" aria-label="Character collection filter">
        <button class="button ${state.collectionFilter === "all" ? "button-primary" : "button-muted"} metric-button" data-collection-filter="all" type="button">All Characters</button>
        <button class="button ${state.collectionFilter === "favorite" ? "button-primary" : "button-muted"} metric-button" data-collection-filter="favorite" type="button">Favorite Characters</button>
      </div>

      ${
        selectedCustomer
          ? compactMobile
            ? `
              <div class="collection-selected-card collection-selected-card-mobile ${selectedCustomer.status === "favorite" ? "collection-selected-card-favorite" : ""}">
                <div class="collection-selected-copy collection-selected-copy-mobile">
                  <p class="kicker" style="margin: 0 0 4px;">Selected Character</p>
                  <h3 class="section-title" style="margin: 0; font-size: 1.45rem;">${escapeHtml(selectedCustomerName)}</h3>
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
                  <img class="customer-avatar collection-selected-avatar" src="${resolveCustomerImage(selectedCustomer)}" alt="${escapeHtml(selectedCustomerName)}" onerror="this.onerror=null;this.src='../assets/restaurant-challenge/customers/customer-placeholder.svg';" />
                  <div class="collection-selected-mobile-actions">
                    <span class="collection-selected-value">Reward ${core.formatCurrency(selectedValue)}</span>
                    <span class="chip collection-selected-rarity-chip">${selectedCustomer.rarity}</span>
                    ${selectedInviteBackHref ? `<a class="button button-primary" id="selected-invite-back-button" href="${selectedInviteBackHref}">Play Again</a>` : ""}
                  </div>
                </div>
              </div>
            `
            : `
              <div class="collection-selected-card ${selectedCustomer.status === "favorite" ? "collection-selected-card-favorite" : ""}">
                <div class="collection-selected-top">
                  <img class="customer-avatar collection-selected-avatar" src="${resolveCustomerImage(selectedCustomer)}" alt="${escapeHtml(selectedCustomerName)}" onerror="this.onerror=null;this.src='../assets/restaurant-challenge/customers/customer-placeholder.svg';" />
                  <div class="collection-selected-copy">
                    <p class="kicker" style="margin: 0 0 4px;">Selected Character</p>
                    <h3 class="section-title" style="margin: 0; font-size: 1.45rem;">${escapeHtml(selectedCustomerName)}</h3>
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
                  <span class="chip">Reward ${core.formatCurrency(selectedValue)}</span>
                </div>
                <div class="button-row" style="margin-top: 10px;">
                  ${selectedInviteBackHref ? `<a class="button button-primary" id="selected-invite-back-button" href="${selectedInviteBackHref}">Play Again</a>` : ""}
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
                    const entryName = getCustomerDisplayName(entry);
                    const entryValue = core.getCollectionEntryValue
                      ? core.getCollectionEntryValue(entry)
                      : entry.status === "regular"
                        ? entry.regularValue
                        : entry.occasionalValue;
                    const entryStatusLabel = getCharacterStatusLabel(entry.status);
                    const entryFavoriteVisits = Math.max(0, Math.min(favoriteGoal, Number(entry.favoriteVisits) || 0));
                    const entryIsFeedbackReward = isFeedbackRewardCustomerEntry(entry);
                    const entryProgress =
                      entryIsFeedbackReward
                        ? "Special feedback reward"
                        : entry.status === "favorite"
                        ? `Reward: ${core.formatCurrency(entryValue)}`
                        : canBuildFavoriteProgress(entry)
                          ? `Favorite Progress: ${entryFavoriteVisits}/${favoriteGoal}`
                          : "";
                    const statusClass =
                      entry.status === "favorite"
                        ? "customer-mini-card-favorite"
                        : entry.status === "regular"
                          ? "customer-mini-card-regular"
                          : "customer-mini-card-occasional";
                    const isSelected = Boolean(selectedCustomer && selectedCustomer.customerId === entry.customerId);
                    return `
                    <button class="customer-mini-card ${statusClass} ${isSelected ? "customer-mini-card-selected" : ""}" type="button" data-customer-id="${escapeHtml(entry.customerId)}" aria-pressed="${isSelected ? "true" : "false"}">
                      <div class="customer-mini-summary">
                        <img class="customer-avatar customer-avatar-compact" src="${image}" alt="${escapeHtml(entryName)}" onerror="this.onerror=null;this.src='../assets/restaurant-challenge/customers/customer-placeholder.svg';" />
                        <div class="customer-mini-copy">
                          <p class="customer-name">${escapeHtml(entryName)}</p>
                          <p class="customer-meta">${escapeHtml(entryStatusLabel)}</p>
                        </div>
                        ${isSelected ? `<span class="customer-mini-selected-label">Selected</span>` : ""}
                        ${entryProgress ? `<p class="customer-favorite-progress customer-favorite-progress-mini">${escapeHtml(entryProgress)}</p>` : ""}
                      </div>
                    </button>
                  `;
                  }
                )
                .join("")
            : emptyCollectionMessage
        }
      </div>

      <div class="divider"></div>
    `;

    elements.collection.querySelectorAll("[data-collection-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        state.collectionFilter = button.dataset.collectionFilter;
        state.selectedCustomerBioExpanded = false;
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
      renderRestaurantDirectory();
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
        elements.collection.innerHTML = `<h2 class="section-title">Character Collection</h2><p class="copy">Unable to load this section right now.</p>`;
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

  function bindJoinRoomForm() {
    const form = document.getElementById("hub-join-room-form");
    if (!form) {
      return;
    }
    const input = document.getElementById("hub-join-room-code");
    const message = document.getElementById("hub-join-room-message");
    const error = document.getElementById("hub-join-room-error");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const roomCode = roomCodeFromInput(input?.value || "");
      if (message) {
        message.textContent = "";
      }
      if (error) {
        error.textContent = "";
        error.classList.add("hidden");
      }
      if (!roomCode) {
        if (error) {
          error.textContent = "Enter the room code your friend shared.";
          error.classList.remove("hidden");
        }
        return;
      }
      const submitButton = form.querySelector("button[type='submit']");
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Joining...";
      }
      try {
        const response = await fetch(`/api/multiplayer/rooms/${encodeURIComponent(roomCode)}`);
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(data?.error || "Room not found.");
        }
        const restaurantSlug = String(data?.room?.restaurantSlug || "").trim();
        if (!restaurantSlug) {
          throw new Error("That room is missing its restaurant.");
        }
        if (message) {
          message.textContent = "Opening the right restaurant game...";
        }
        const nextUrl = new URL(`/${restaurantSlug}/play/`, window.location.origin);
        nextUrl.searchParams.set("room", roomCode);
        window.location.href = nextUrl.toString();
      } catch (joinError) {
        if (error) {
          error.textContent = joinError instanceof Error ? joinError.message : "Unable to join that room.";
          error.classList.remove("hidden");
        }
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Join Room";
        }
      }
    });
  }

  bindHowToPlay();
  bindContact();
  bindJoinRoomForm();
  updateSalesDemoCta();
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
