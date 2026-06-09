(() => {
  const core = window.RestaurantChallengeCore;
  const query = new URLSearchParams(window.location.search);
  const customerId = String(query.get("customerId") || "").trim();

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
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

  function getOpeningCustomers(restaurant) {
    const featuredIds = Array.isArray(restaurant.openingCustomerIds) ? restaurant.openingCustomerIds : [];
    const featuredCustomers = featuredIds
      .map((id) => core.getCustomerById(id))
      .filter((customer) => customer && customer.image);

    if (featuredCustomers.length) {
      return featuredCustomers.slice(0, 3);
    }

    return core
      .getCustomersForRestaurant(restaurant.slug)
      .filter((customer) => customer.image && !customer.image.includes("customer-placeholder"))
      .slice(0, 3);
  }

  function renderUnavailable(slug) {
    const panel = document.querySelector(".opening-start-panel");
    if (!panel) {
      return;
    }

    panel.innerHTML = `
      <div class="opening-start-shell">
        <div class="opening-start-heading">
          <p class="kicker" style="margin: 0 0 4px;">Restaurant Challenge</p>
          <h2 class="opening-title">Restaurant unavailable</h2>
          <p class="copy opening-title-copy">This restaurant is not available to play right now.</p>
        </div>
        <div class="button-row opening-start-actions opening-start-actions-bottom">
          <a class="button button-muted" href="/restaurant/">Choose Another Restaurant</a>
        </div>
      </div>
    `;
    document.title = "Restaurant Unavailable | CommunityVerse Games";
    console.warn(`Restaurant Challenge restaurant is unavailable: ${slug}`);
  }

  function renderRestaurantStart(restaurant) {
    const panel = document.querySelector(".opening-start-panel");
    if (!panel) {
      return;
    }

    const openingCustomers = getOpeningCustomers(restaurant);
    const playHref = customerId
      ? `${restaurantPlayPath(restaurant)}?fresh=1&customerId=${encodeURIComponent(customerId)}`
      : `${restaurantPlayPath(restaurant)}?fresh=1`;
    const openerCopy =
      restaurant.openingCopy ||
      "Play a quick game of trivia, win a customer, and progress on the leaderboard!";

    document.title = `${restaurant.publicGameName || `${restaurant.name} Game`} | CommunityVerse Games`;

    panel.innerHTML = `
      <div class="opening-start-shell">
        <div class="opening-start-heading">
          <p class="kicker" style="margin: 0 0 4px;">Restaurant Challenge</p>
          <h2 class="opening-title">${escapeHtml(restaurant.publicGameName || `${restaurant.name} Game`)}</h2>
          <p class="copy opening-title-copy">${escapeHtml(openerCopy)}</p>
          ${
            customerId
              ? `
                <p class="helper opening-start-helper opening-title-helper" id="invite-copy">
                  You invited a customer back. Win the round to try to upgrade them.
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
              <div class="opening-guest-grid">
                ${openingCustomers
                  .map(
                    (customer) => `
                      <article class="opening-guest-card">
                        <img class="opening-guest-photo" src="${escapeHtml(customer.image)}" alt="${escapeHtml(customer.name)}" />
                        <div class="opening-guest-copy">
                          <p class="opening-guest-name">${escapeHtml(customer.name)}</p>
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
          <a class="button button-hot" id="start-game-button" href="${escapeHtml(playHref)}">${customerId ? "INVITE BACK" : "START THE GAME"}</a>
          <a class="button button-muted" href="/restaurant/?hub=1">View My Restaurant</a>
        </div>
      </div>
    `;

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
