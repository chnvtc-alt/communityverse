(() => {
  const core = window.RestaurantChallengeCore;
  const query = new URLSearchParams(window.location.search);
  const editMode = query.has("edit");
  const hubMode = query.get("hub") === "1" || query.get("view") === "hub";

  const metricOptions = [
    { value: "estimatedSales", label: "Sales" },
    { value: "regularCustomers", label: "Regular Customers" },
    { value: "collected", label: "Collected" },
    { value: "gamesPlayed", label: "Games" },
    { value: "rating", label: "Rating" },
  ];

  const state = {
    metric: "estimatedSales",
    leaderboardScope: "overall",
    leaderboardRestaurantSlug: "americana",
    selectedDirectorySlug: "",
    collectionFilter: "all",
    inviteBackCustomerId: "",
    selectedCustomerId: "",
    selectedCustomerBioExpanded: false,
    activeMobileTab: "overview",
  };

  const mobileHubQuery = "(max-width: 960px)";
  const placeholderRestaurants = [
    {
      slug: "placeholder-1",
      name: "Placeholder 1",
      image: "../assets/restaurant-challenge/restaurants/americana/americana-diner-logo.jpg",
      href: "",
      available: false,
    },
    {
      slug: "placeholder-2",
      name: "Placeholder 2",
      image: "../assets/restaurant-challenge/restaurants/americana/americana-diner-logo.jpg",
      href: "",
      available: false,
    },
  ];

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
    hero: document.getElementById("hero-panel"),
    collection: document.getElementById("collection-panel"),
    leaderboard: document.getElementById("leaderboard-panel"),
    sections: document.querySelector(".grid-two"),
  };

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
      <button class="button ${state.activeMobileTab === "collection" ? "button-primary" : "button-muted"}" data-hub-tab="collection" type="button">Collection</button>
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
    elements.splashPlayButton.textContent = selectedRestaurant?.available ? "Play Selected Restaurant" : "Coming Soon";
    if (elements.splashMyRestaurantButton) {
      elements.splashMyRestaurantButton.href = "./?hub=1#hero-panel";
    }
    if (elements.splashLeaderboardButton) {
      elements.splashLeaderboardButton.href = "./?hub=1#leaderboard-panel";
    }
    elements.splashRestaurantSelect.onchange = (event) => {
      state.selectedDirectorySlug = event.currentTarget.value;
      renderSplashChooser();
    };
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

    if (metric === "regularCustomers") {
      return stats.regularCustomers;
    }

    if (metric === "collected") {
      return stats.regularCustomers + stats.occasionalCustomers;
    }

    return stats.estimatedSales;
  }

  function formatMetricValue(value, metric) {
    if (metric === "estimatedSales") {
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

  function getPlayableRestaurants() {
    return core.restaurants.filter((restaurant) => restaurant.active !== false);
  }

  function getSelectedLeaderboardRestaurant() {
    return (
      core.getRestaurantBySlug(state.leaderboardRestaurantSlug) ||
      getPlayableRestaurants()[0] ||
      core.restaurants[0] ||
      null
    );
  }

  function getDirectoryRestaurants() {
    const playableRestaurants = getPlayableRestaurants();
    if (playableRestaurants.length) {
      return [
        ...playableRestaurants.map((restaurant) => ({
          slug: restaurant.slug,
          name: restaurant.name,
          image: restaurant.logoSquare || restaurant.squareImage || restaurant.logoHorizontal || restaurant.heroImage,
          href: `../${restaurant.slug}/?home=1`,
          available: true,
        })),
        ...placeholderRestaurants,
      ];
    }

    return [
      {
        slug: "americana",
        name: "Americana Diner",
        image: "../assets/restaurant-challenge/restaurants/americana/americana-diner-logo.jpg",
        href: "../americana/?home=1",
        available: true,
      },
      ...placeholderRestaurants,
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
        href: `../${recentSlug}/?home=1`,
      };
    }

    const fallbackRestaurant = core.getRestaurantBySlug("americana") || core.restaurants[0] || null;
    return {
      slug: fallbackRestaurant?.slug || "americana",
      name: fallbackRestaurant?.name || "Americana Diner",
      href: fallbackRestaurant?.slug ? `../${fallbackRestaurant.slug}/?home=1` : "../americana/?home=1",
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

  function renderHero() {
    const compactMobile = isMobileHub();
    const profile = core.getActiveProfile();
    const profileState = getProfileState(profile);
    const summary = profileState === "registered" ? core.getProfileSummary(profile, "americana") : null;
    const overallRank = profile ? core.getPlayerRank(profile.id, "estimatedSales") : null;
    const selectedDirectoryRestaurant = getSelectedDirectoryRestaurant(profile);
    const lastPlayedSlug = getDefaultDirectorySlug(profile);
    const playAgainTarget = getPlayAgainTarget(profile);
    const latestCustomerEntry = profile && Array.isArray(profile.customerCollection)
      ? profile.customerCollection.find((entry) => entry && entry.status !== "lost")
      : null;
    const latestCustomerName = latestCustomerEntry ? latestCustomerEntry.customerName || "Customer" : "";

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
                          <span class="rating-display" aria-label="Guest rating ${(summary.rating || 0).toFixed(1)} out of 5">
                            <span class="rating-stars" aria-hidden="true">${"★".repeat(Math.max(0, Math.min(5, Math.round(summary.rating || 0)))) + "☆".repeat(5 - Math.max(0, Math.min(5, Math.round(summary.rating || 0))))}</span>
                            <span class="rating-number">${(summary.rating || 0).toFixed(1)}</span>
                          </span>
                          <span class="hero-profile-subline-sep">·</span>
                          <span>${summary.stats.gamesPlayed} plays</span>
                        </p>
                        ${
                          latestCustomerName
                            ? `<p class="hero-profile-detailline hero-profile-detailline-compact">Latest customer: <strong>${escapeHtml(latestCustomerName)}</strong></p>`
                            : ""
                        }
                      </div>
                        <div class="hero-profile-actions hero-profile-actions-top">
                          <a class="button button-muted button-sm" href="${withHubMode("./?edit=1")}">Edit My Profile</a>
                        </div>
                    </div>
                    <div class="hero-profile-meta hero-profile-meta-compact">
                      <span class="chip hero-stat-chip">${overallRank ? `Overall #${overallRank}` : "No overall rank"}</span>
                      <span class="chip hero-stat-chip">Sales ${core.formatCurrency(summary.stats.estimatedSales)}</span>
                      <span class="chip hero-stat-chip hero-stat-chip-compact">Regular Customers ${summary.stats.regularCustomers}</span>
                      <span class="chip hero-stat-chip hero-stat-chip-compact">Occasional Customers ${summary.stats.occasionalCustomers}</span>
                    </div>
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
                `
                : `
                <div class="hero-profile-strip">
                  <div class="hero-profile-head">
                    <div>
                      <p class="kicker" style="margin: 0 0 4px;">Your Restaurant</p>
                      <h2 class="hero-profile-name">${escapeHtml(profile.restaurantName)}</h2>
                      <p class="hero-profile-subline">
                        <span class="rating-display" aria-label="Guest rating ${(summary.rating || 0).toFixed(1)} out of 5">
                          <span class="rating-stars" aria-hidden="true">${"★".repeat(Math.max(0, Math.min(5, Math.round(summary.rating || 0)))) + "☆".repeat(5 - Math.max(0, Math.min(5, Math.round(summary.rating || 0))))}</span>
                          <span class="rating-number">${(summary.rating || 0).toFixed(1)}</span>
                        </span>
                        <span class="hero-profile-subline-sep">·</span>
                        <span>${summary.stats.gamesPlayed} plays</span>
                      </p>
                      ${
                        latestCustomerName && !compactMobile
                          ? `<p class="hero-profile-detailline">Latest customer: <strong>${escapeHtml(latestCustomerName)}</strong></p>`
                          : ""
                      }
                    </div>
                    <div class="hero-profile-actions hero-profile-actions-top">
                      <a class="button button-muted button-sm" href="${withHubMode("./?edit=1")}">Edit My Profile</a>
                    </div>
                  </div>
                  <div class="hero-profile-meta">
                    <span class="chip hero-stat-chip">${overallRank ? `Overall #${overallRank}` : "No overall rank"}</span>
                    <span class="chip hero-stat-chip">Sales ${core.formatCurrency(summary.stats.estimatedSales)}</span>
                    <span class="chip hero-stat-chip hero-stat-chip-compact">Regular Customers ${summary.stats.regularCustomers}</span>
                    <span class="chip hero-stat-chip hero-stat-chip-compact">Occasional Customers ${summary.stats.occasionalCustomers}</span>
                  </div>
                </div>
                `
                : profileState === "guest"
                  ? `
                    <div class="hero-profile-strip hero-profile-strip-guest">
                      <div>
                        <p class="kicker" style="margin: 0 0 4px;">Guest Progress</p>
                        <h2 class="hero-profile-name">Play first, then register to save your restaurant.</h2>
                        <p class="copy compact-copy" style="margin: 4px 0 0;">You can keep playing as a guest, but registering after your next game keeps your customers and leaderboard progress with you.</p>
                      </div>
                      <a class="button button-primary button-sm" href="${playAgainTarget.href}">Play ${escapeHtml(playAgainTarget.name)}</a>
                    </div>
                  `
                  : `
                    <div class="hero-profile-strip hero-profile-strip-guest">
                      <div>
                        <p class="kicker" style="margin: 0 0 4px;">Welcome</p>
                        <h2 class="hero-profile-name">Choose a restaurant, play your first game, then register after you win a customer.</h2>
                        <p class="copy compact-copy" style="margin: 4px 0 0;">New players should pick a restaurant from the host list below. After the first game, we’ll ask you to save your restaurant name so progress can follow you.</p>
                      </div>
                      <a class="button button-primary button-sm" href="#directory-card">Choose A Restaurant</a>
                    </div>
                  `
          }
          </div>
          <div class="hero-content-panel hero-content-panel-side">
            <div class="hero-side">
              <div class="hero-card hero-card-strong hero-directory-showcase hero-directory-showcase-compact" id="directory-card">
                <div class="hero-directory-picker">
                  <p class="kicker" style="margin: 0;">Choose A Trivia Host To Play</p>
                  <label class="field" style="gap: 6px;">
                    <select class="select hero-directory-select" id="directory-select" aria-label="Choose a trivia host to play">
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
        window.location.href = "./";
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
  }

  function renderLeaderboard() {
    const profile = core.getActiveProfile();
    const restaurant = getSelectedLeaderboardRestaurant();
    const rows =
      state.leaderboardScope === "overall"
        ? core.getLeaderboard(state.metric)
        : core.getLeaderboard(state.metric, restaurant?.slug || "americana");
    const scopeLabel = state.leaderboardScope === "overall" ? "Overall" : restaurant?.name || "Restaurant";

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
        <div>
          <h2 class="section-title">Leaderboards</h2>
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
                    ${getPlayableRestaurants()
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

      <h3 class="kicker" style="margin-top: 0;">${scopeLabel}</h3>
      ${
        state.metric === "rating"
          ? `<p class="helper" style="margin: -6px 0 10px;">Customer rating is your answer accuracy scaled to a 5-star score.</p>`
          : ""
      }
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
      return;
    }

    const availableHeight = Math.max(
      560,
      Math.floor(window.innerHeight - elements.sections.offsetTop - 8)
    );

    elements.sections.style.height = `${availableHeight}px`;
    elements.sections.style.minHeight = `${availableHeight}px`;
    elements.collection.style.height = "";
    elements.leaderboard.style.height = "";
    requestAnimationFrame(() => {
      const collectionHeight = Math.ceil(elements.collection.getBoundingClientRect().height);
      if (collectionHeight > 0) {
        elements.leaderboard.style.height = `${collectionHeight}px`;
      }
      elements.sections.style.height = `${availableHeight}px`;
      elements.sections.style.minHeight = `${availableHeight}px`;
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
        <p class="copy">Play your first game to start collecting customers. After that, we’ll ask you to register your restaurant so your progress can follow you to the next device.</p>
      `;
      return;
    }

    const collection = [...profile.customerCollection].sort((left, right) =>
      String(right.dateWon).localeCompare(String(left.dateWon))
    );
    const filteredCollection =
      state.collectionFilter === "regular"
        ? collection.filter((entry) => entry.status === "regular")
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
              <div class="collection-selected-card collection-selected-card-mobile">
                <div class="collection-selected-copy collection-selected-copy-mobile">
                  <p class="kicker" style="margin: 0 0 4px;">Selected Customer</p>
                  <h3 class="section-title" style="margin: 0; font-size: 1.45rem;">${escapeHtml(selectedCustomer.customerName)}</h3>
                  <p class="customer-meta" style="margin-top: 4px;">${escapeHtml(selectedCustomer.status === "regular" ? "Regular Customer" : "Occasional Customer")}</p>
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
                    <span class="collection-selected-value">${core.formatCurrency(selectedCustomer.status === "regular" ? selectedCustomer.regularValue : selectedCustomer.occasionalValue)}</span>
                    <span class="chip collection-selected-rarity-chip">${selectedCustomer.rarity}</span>
                    <a class="button button-primary" id="selected-invite-back-button" href="../americana/?home=1&customerId=${encodeURIComponent(selectedCustomer.customerId)}">Invite Back</a>
                  </div>
                </div>
              </div>
            `
            : `
              <div class="collection-selected-card">
                <div class="collection-selected-top">
                  <img class="customer-avatar collection-selected-avatar" src="${resolveCustomerImage(selectedCustomer)}" alt="${escapeHtml(selectedCustomer.customerName)}" onerror="this.onerror=null;this.src='../assets/restaurant-challenge/customers/customer-placeholder.svg';" />
                  <div class="collection-selected-copy">
                    <p class="kicker" style="margin: 0 0 4px;">Selected Customer</p>
                    <h3 class="section-title" style="margin: 0; font-size: 1.45rem;">${escapeHtml(selectedCustomer.customerName)}</h3>
                    <p class="customer-meta" style="margin-top: 4px;">${escapeHtml(selectedCustomer.status === "regular" ? "Regular Customer" : "Occasional Customer")}</p>
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
                  <span class="chip">${core.formatCurrency(selectedCustomer.status === "regular" ? selectedCustomer.regularValue : selectedCustomer.occasionalValue)}</span>
                </div>
                <div class="button-row" style="margin-top: 10px;">
                  <a class="button button-primary" id="selected-invite-back-button" href="../americana/?home=1&customerId=${encodeURIComponent(selectedCustomer.customerId)}">Invite Back</a>
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
                    return `
                    <button class="customer-mini-card ${entry.status === "regular" ? "customer-mini-card-regular" : "customer-mini-card-occasional"} ${selectedCustomer && selectedCustomer.customerId === entry.customerId ? "customer-mini-card-selected" : ""}" type="button" data-customer-id="${escapeHtml(entry.customerId)}">
                      <div class="customer-mini-summary">
                        <img class="customer-avatar customer-avatar-compact" src="${image}" alt="${escapeHtml(entry.customerName)}" onerror="this.onerror=null;this.src='../assets/restaurant-challenge/customers/customer-placeholder.svg';" />
                        <div class="customer-mini-copy">
                          <p class="customer-name">${escapeHtml(entry.customerName)}</p>
                          <p class="customer-meta">${escapeHtml(entry.status === "regular" ? "Regular Customer" : "Occasional Customer")}</p>
                        </div>
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

  renderAll();
  if (core.whenReady) {
    core.whenReady().then(() => {
      renderAll();
    });
  }
  window.addEventListener("resize", () => {
    requestAnimationFrame(syncDesktopPanelHeights);
  });
})();
