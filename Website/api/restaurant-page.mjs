import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { fetchRestaurantsFromSupabase, slugifyRestaurant } from "./_lib/restaurant-admin.mjs";
import { hasSupabaseConfig } from "./_lib/supabase.mjs";

const defaultRestaurants = [
  {
    slug: "americana",
    name: "Americana Diner",
    publicGameName: "The Americana Diner Game",
    heroImage: "/assets/restaurant-challenge/restaurants/americana/americana-diner-hero.jpg",
  },
  {
    slug: "wafflemaster",
    name: "Waffle Master",
    publicGameName: "The Waffle Master Game",
    heroImage: "/assets/restaurant-challenge/restaurants/wafflemaster/wafflemaster-hero.jpg",
  },
];

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function absoluteUrl(origin, path) {
  const value = String(path || "").trim();
  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${origin.replace(/\/+$/, "")}/${value.replace(/^\/+/, "")}`;
}

function replaceMeta(html, name, content) {
  const escapedContent = escapeHtml(content);
  const namedPattern = new RegExp(`<meta\\s+name="${name}"\\s+content="[^"]*"\\s*/?>`, "i");
  const propertyPattern = new RegExp(`<meta\\s+property="${name}"\\s+content="[^"]*"\\s*/?>`, "i");
  const replacement = name.startsWith("og:")
    ? `<meta property="${name}" content="${escapedContent}" />`
    : `<meta name="${name}" content="${escapedContent}" />`;

  if (namedPattern.test(html)) {
    return html.replace(namedPattern, replacement);
  }

  if (propertyPattern.test(html)) {
    return html.replace(propertyPattern, replacement);
  }

  return html.replace("</head>", `    ${replacement}\n  </head>`);
}

async function getRestaurant(slug) {
  const normalizedSlug = slugifyRestaurant(slug);
  if (!normalizedSlug) {
    return defaultRestaurants[0];
  }

  if (hasSupabaseConfig()) {
    try {
      const restaurants = await fetchRestaurantsFromSupabase();
      const restaurant = restaurants.find((entry) => entry.slug === normalizedSlug);
      if (restaurant) {
        return restaurant;
      }
    } catch {
      // Fall back to local defaults so link previews still have useful text.
    }
  }

  return defaultRestaurants.find((entry) => entry.slug === normalizedSlug) || null;
}

async function loadTemplate(page) {
  const templateUrl =
    page === "play"
      ? new URL("../americana/play/index.html", import.meta.url)
      : new URL("../americana/index.html", import.meta.url);
  return readFile(fileURLToPath(templateUrl), "utf8");
}

export async function GET(request) {
  const url = new URL(request.url);
  const slug = slugifyRestaurant(url.searchParams.get("restaurantSlug") || "americana");
  const page = url.searchParams.get("page") === "play" ? "play" : "start";
  const restaurant = await getRestaurant(slug);

  if (!restaurant) {
    return new Response("Restaurant not found", { status: 404 });
  }

  const origin = `${url.protocol}//${url.host}`;
  const path = page === "play" ? `/${restaurant.slug}/play` : `/${restaurant.slug}`;
  const canonicalUrl = absoluteUrl(origin, path);
  const title = restaurant.publicGameName || `${restaurant.name} Game`;
  const description =
    page === "play"
      ? `Play ${title}, answer 10 questions, win a customer, and progress on the leaderboard.`
      : `Start ${title}, answer 10 questions, win a customer, and progress on the leaderboard.`;
  const imageUrl = absoluteUrl(origin, restaurant.heroImage || restaurant.logoSquare || "");

  let html = await loadTemplate(page);
  html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)} | CommunityVerse Games</title>`);
  html = html.replace(/<link rel="canonical" href="[^"]*" \/>/i, `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`);
  html = replaceMeta(html, "description", description);
  html = replaceMeta(html, "og:title", `${title} | CommunityVerse Games`);
  html = replaceMeta(html, "og:description", description);
  html = replaceMeta(html, "og:url", canonicalUrl);
  html = replaceMeta(html, "twitter:title", `${title} | CommunityVerse Games`);
  html = replaceMeta(html, "twitter:description", description);

  if (imageUrl) {
    html = replaceMeta(html, "og:image", imageUrl);
    html = replaceMeta(html, "twitter:image", imageUrl);
  }

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
    },
  });
}
