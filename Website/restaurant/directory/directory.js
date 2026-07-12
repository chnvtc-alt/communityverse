(() => {
  const elements = {
    grid: document.querySelector("#directory-grid"),
    count: document.querySelector("#directory-count"),
    search: document.querySelector("#directory-search"),
  };

  let restaurants = [];

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeUrl(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    return `https://${raw}`;
  }

  function restaurantAddress(restaurant) {
    const direct = String(restaurant.address || restaurant.streetAddress || restaurant.street || "").trim();
    const city = String(restaurant.city || "").trim();
    const stateZip = [restaurant.state, restaurant.zip]
      .map((part) => String(part || "").trim())
      .filter(Boolean)
      .join(" ");
    const cityStateZip = [city, stateZip].filter(Boolean).join(", ");
    return [direct, cityStateZip].filter(Boolean).join(", ");
  }

  function restaurantLocation(restaurant) {
    return restaurantAddress(restaurant) || String(restaurant.location || "").trim();
  }

  function visibleRestaurants(list) {
    return (Array.isArray(list) ? list : [])
      .filter((restaurant) =>
        restaurant &&
        restaurant.active !== false &&
        restaurant.playable !== false &&
        restaurant.visibleInList !== false &&
        restaurant.slug &&
        restaurant.name
      )
      .sort((left, right) =>
        (Number(left.sortOrder) || 0) - (Number(right.sortOrder) || 0) ||
        String(left.name || "").localeCompare(String(right.name || ""))
      );
  }

  function fallbackRestaurants() {
    return [
      {
        slug: "americana",
        name: "Americana Diner",
        description: "Classic comfort food in Pepperville. Answer 10 questions and unlock a collectible character.",
        logoSquare: "/assets/restaurant-challenge/restaurants/americana/americana-diner-logo.jpg",
        location: "Pepperville",
        active: true,
        playable: true,
        visibleInList: true,
      },
    ];
  }

  async function loadRestaurants() {
    try {
      const response = await fetch("/api/restaurants", { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`Restaurant list returned ${response.status}`);
      const data = await response.json();
      restaurants = visibleRestaurants(data);
    } catch (error) {
      restaurants = fallbackRestaurants();
    }

    if (!restaurants.length) {
      restaurants = fallbackRestaurants();
    }

    renderDirectory();
  }

  function matchesSearch(restaurant, query) {
    if (!query) return true;
    const haystack = [
      restaurant.name,
      restaurant.publicGameName,
      restaurant.description,
      restaurant.location,
      restaurantAddress(restaurant),
      restaurant.city,
      restaurant.state,
      restaurant.phone,
      restaurant.website,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  }

  function renderCard(restaurant) {
    const logo = restaurant.logoSquare || restaurant.squareImage || restaurant.logoHorizontal || restaurant.heroImage || "";
    const location = restaurantLocation(restaurant);
    const description = String(
      restaurant.description || restaurant.openingCopy || "Play a quick 10-question trivia game for this restaurant."
    ).trim();
    const website = normalizeUrl(restaurant.website || restaurant.url);
    const phone = String(restaurant.phone || restaurant.telephone || "").trim();
    const gameHref = `/${encodeURIComponent(restaurant.slug)}/`;
    const details = [
      location ? `<p class="directory-card-detail">${escapeHtml(location)}</p>` : "",
      phone ? `<p class="directory-card-detail"><a href="tel:${escapeHtml(phone.replace(/[^\d+]/g, ""))}">${escapeHtml(phone)}</a></p>` : "",
      website ? `<p class="directory-card-detail"><a href="${escapeHtml(website)}" target="_blank" rel="noopener">Website</a></p>` : "",
    ].filter(Boolean).join("");

    return `
      <article class="directory-card">
        <div class="directory-card-logo-wrap">
          ${
            logo
              ? `<img class="directory-card-logo" src="${escapeHtml(logo)}" alt="${escapeHtml(`${restaurant.name} logo`)}" loading="lazy" />`
              : `<span class="directory-card-logo directory-card-logo-fallback" aria-hidden="true">${escapeHtml(String(restaurant.name).charAt(0) || "R")}</span>`
          }
        </div>
        <div class="directory-card-body">
          <h2>${escapeHtml(restaurant.name)}</h2>
          <p class="directory-card-copy">${escapeHtml(description)}</p>
          ${details ? `<div class="directory-card-details">${details}</div>` : ""}
          <div class="directory-card-actions">
            <a class="button button-primary button-sm" href="${escapeHtml(gameHref)}">Play Game</a>
            ${website ? `<a class="button button-muted button-sm" href="${escapeHtml(website)}" target="_blank" rel="noopener">Website</a>` : ""}
          </div>
        </div>
      </article>
    `;
  }

  function renderDirectory() {
    const query = String(elements.search?.value || "").trim().toLowerCase();
    const filtered = restaurants.filter((restaurant) => matchesSearch(restaurant, query));
    elements.count.textContent = `${filtered.length} active game${filtered.length === 1 ? "" : "s"}`;

    if (!filtered.length) {
      elements.grid.innerHTML = `<p class="empty-state">No restaurant games match that search.</p>`;
      return;
    }

    elements.grid.innerHTML = filtered.map(renderCard).join("");
    elements.grid.querySelectorAll(".directory-card-logo").forEach((image) => {
      image.addEventListener("error", () => {
        const fallback = document.createElement("span");
        fallback.className = "directory-card-logo directory-card-logo-fallback";
        fallback.setAttribute("aria-hidden", "true");
        fallback.textContent = image.getAttribute("alt")?.trim().charAt(0) || "R";
        image.replaceWith(fallback);
      }, { once: true });
    });
  }

  elements.search?.addEventListener("input", renderDirectory);
  loadRestaurants();
})();
