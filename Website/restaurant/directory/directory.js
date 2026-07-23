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
    const hiddenDirectorySlugs = new Set(["americana", "americana-grill", "wafflemaster", "waffle-master"]);
    return (Array.isArray(list) ? list : [])
      .filter((restaurant) => {
        const slug = String(restaurant?.slug || "").toLowerCase();
        const name = String(restaurant?.name || "").toLowerCase();
        const isDemo = hiddenDirectorySlugs.has(slug) || /^americana\b/.test(name) || name === "waffle master";
        return (
          restaurant &&
          restaurant.active !== false &&
          restaurant.playable !== false &&
          restaurant.visibleInList !== false &&
          !isDemo &&
          restaurant.slug &&
          restaurant.name
        );
      })
      .sort((left, right) => String(left.name || "").localeCompare(String(right.name || "")));
  }

  function fallbackRestaurants() {
    return [
      { slug: "hudsons", name: "Hudson's Hickory House", publicGameName: "The Hudson's Hickory House Game" },
      { slug: "cinema-tavern", name: "Cinema Tavern", publicGameName: "The Cinema Tavern Game" },
      { slug: "sam-and-roscos", name: "Sam & Rosco's", publicGameName: "The Sam & Rosco's Game" },
      { slug: "marcossp", name: "Marco's Pizza - South Paulding", publicGameName: "Marco's Pizza - South Paulding Game" },
      { slug: "fabianos", name: "Fabiano's", publicGameName: "The Fabiano's Game" },
      { slug: "gabes", name: "Gabe's Downtown", publicGameName: "The Gabe's Downtown Game" },
      { slug: "rustybike", name: "The Rusty Bike Cafe", publicGameName: "The Rusty Bike Cafe Game" },
      { slug: "nkscafe", name: "N.K.'s Cafe", publicGameName: "The N.K.'s Cafe Game" },
    ];
  }

  async function loadRestaurants() {
    try {
      const response = await fetch("/api/restaurants", { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`Restaurant list returned ${response.status}`);
      const data = await response.json();
      restaurants = visibleRestaurants(data);
    } catch (error) {
      restaurants = [];
    }

    if (!restaurants.length) {
      restaurants = visibleRestaurants(fallbackRestaurants());
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
        <div class="directory-card-main">
          <div class="directory-card-logo-wrap">
            ${
              logo
                ? `<img class="directory-card-logo" src="${escapeHtml(logo)}" alt="${escapeHtml(`${restaurant.name} logo`)}" loading="lazy" />`
                : `<span class="directory-card-logo directory-card-logo-fallback" aria-hidden="true">${escapeHtml(String(restaurant.name).charAt(0) || "R")}</span>`
            }
          </div>
          <div class="directory-card-info">
            <h2>${escapeHtml(restaurant.name)}</h2>
            ${details ? `<div class="directory-card-details">${details}</div>` : ""}
          </div>
        </div>
        <p class="directory-card-copy">${escapeHtml(description)}</p>
        <div class="directory-card-actions">
          <a class="button button-primary button-sm" href="${escapeHtml(gameHref)}">Play Game</a>
        </div>
      </article>
    `;
  }

  function renderDirectory() {
    const query = String(elements.search?.value || "").trim().toLowerCase();
    const filtered = restaurants.filter((restaurant) => matchesSearch(restaurant, query));
    elements.count.textContent = `${filtered.length} active game${filtered.length === 1 ? "" : "s"}`;

    if (!filtered.length) {
      elements.grid.innerHTML = `<p class="empty-state">${query ? "No restaurant games match that search." : "No public restaurant games are listed yet."}</p>`;
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
