(() => {
  const core = window.RestaurantChallengeCore;
  const query = new URLSearchParams(window.location.search);
  const customerId = String(query.get("customerId") || "").trim();
  let howToPlayReturnFocus = null;
  let howToPlayKeydownBound = false;

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

  function howToPlayModalHtml() {
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
          <h2 class="section-title" id="how-to-play-title">How to Play</h2>
          <p class="copy" id="how-to-play-summary">
            Restaurant Challenge is a quick 10-question trivia game. Answer questions, earn customers for your restaurant, improve your rating, and compete on the leaderboard.
          </p>
          <div class="how-to-play-topics">
            <section class="how-to-play-topic how-to-play-topic-wide">
              <h3>The Quick Version</h3>
              <p>
                Choose a restaurant, answer 10 trivia questions, see how well you scored, and try to earn a customer for your own restaurant.
              </p>
              <p>
                You can enjoy the game just for the trivia, or you can build your restaurant and compete against other players.
              </p>
            </section>
            <section class="how-to-play-topic">
              <h3>Step 1: Choose a Restaurant</h3>
              <p>Before each game, choose a restaurant to play. Each game has 10 questions.</p>
              <p>Questions may include general trivia, questions about the restaurant, and questions about the local area.</p>
            </section>
            <section class="how-to-play-topic">
              <h3>Step 2: Earn Customers</h3>
              <p>Before the quiz begins, you will meet the customer you are playing for.</p>
              <p>
                If you meet the higher target, they become a Regular Customer. If you meet the lower target, they become an Occasional Customer. If your score is too low, they do not visit your restaurant.
              </p>
            </section>
            <section class="how-to-play-topic">
              <h3>Step 3: Build Your Restaurant</h3>
              <p>Every customer you earn helps your restaurant grow. Some customers are worth more than others.</p>
              <p>You can invite Occasional Customers back and try to turn them into Regular Customers.</p>
              <p>After 10 successful visits, a Regular Customer becomes a Favorite Customer and becomes even more valuable.</p>
            </section>
            <section class="how-to-play-topic">
              <h3>Step 4: Improve Your Rating</h3>
              <p>Your restaurant has a rating from 0 to 5 stars. The rating is based on your average trivia score.</p>
              <p>For example, averaging 10 correct answers is 5.0 stars. Averaging 8 correct answers is 4.0 stars. Averaging 6 correct answers is 3.0 stars.</p>
            </section>
            <section class="how-to-play-topic">
              <h3>Step 5: Climb the Leaderboard</h3>
              <p>The leaderboard compares your restaurant to other players by rating, customers, sales, games played, and other progress.</p>
              <p>Sales are the combined value of all customers you have earned.</p>
            </section>
            <section class="how-to-play-topic how-to-play-topic-wide">
              <h3>Play Your Way</h3>
              <p>
                Some players enjoy Restaurant Challenge simply as a quick trivia game. Others enjoy building their restaurant, collecting customers, improving their rating, and competing on the leaderboard.
              </p>
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
    const count = 3;
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
        allCustomers.filter((customer) => customer.restaurant === "shared"),
        restaurant.slug,
        allCustomers.length
      ));
    }

    return selectedCustomers.slice(0, count);
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
          <p class="kicker" style="margin: 0 0 4px;">Restaurant Challenge Trivia</p>
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
          <button class="button button-muted" id="start-how-to-play-button" type="button">How to Play</button>
        </div>
      </div>
      ${howToPlayModalHtml()}
    `;
    panel.classList.remove("hidden");
    bindHowToPlay();

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
