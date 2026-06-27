import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { fetchRestaurantBySlugFromSupabase, slugifyRestaurant } from "./_lib/restaurant-admin.mjs";
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
  {
    slug: "sam-and-roscos",
    name: "Sam & Rosco's",
    publicGameName: "The Sam & Rosco's Game",
    description: "Play the Sam & Rosco's Restaurant Challenge trivia game.",
  },
  {
    slug: "hudsons",
    name: "Hudson's Hickory House",
    publicGameName: "The Hudson's Hickory House Game",
    description: "Play the Hudson's Hickory House Restaurant Challenge trivia game.",
  },
  {
    slug: "marcossp",
    name: "Marco's Pizza - South Paulding",
    publicGameName: "Marco's Pizza - South Paulding Game",
    description: "Play the Marco's Pizza - South Paulding Restaurant Challenge trivia game.",
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

function cleanSentence(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\.+$/g, "");
}

function buildPageDescription(restaurant, title, page) {
  const restaurantName = cleanSentence(restaurant.name);
  const location = cleanSentence(restaurant.location);
  const restaurantDescription = cleanSentence(restaurant.description);
  const locationText = location ? ` in ${location}` : "";
  const action = page === "play" ? "Play" : "Start";
  const baseDescription = restaurantDescription || `${action} ${title}${locationText}`;
  const gameDetails = "Answer 10 quick trivia questions, unlock collectible characters, and compete on the leaderboard.";
  return `${baseDescription}. ${gameDetails}`.slice(0, 300);
}

function buildStructuredData({ restaurant, title, description, canonicalUrl, imageUrl, origin }) {
  const restaurantName = cleanSentence(restaurant.name);
  const location = cleanSentence(restaurant.location);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${title} | CommunityVerse Games`,
    description,
    url: canonicalUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "CommunityVerse Games",
      url: origin,
    },
    about: {
      "@type": "Restaurant",
      name: restaurantName || title,
    },
  };

  if (imageUrl) {
    structuredData.image = imageUrl;
  }

  if (location) {
    structuredData.about.address = location;
  }

  return JSON.stringify(structuredData).replace(/</g, "\\u003c");
}

function replaceStructuredData(html, structuredData) {
  const script = `<script type="application/ld+json">${structuredData}</script>`;
  const pattern = /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i;
  if (pattern.test(html)) {
    return html.replace(pattern, script);
  }

  return html.replace("</head>", `    ${script}\n  </head>`);
}

async function getRestaurant(slug) {
  const normalizedSlug = slugifyRestaurant(slug);
  if (!normalizedSlug) {
    return defaultRestaurants[0];
  }

  if (hasSupabaseConfig()) {
    try {
      const restaurant = await fetchRestaurantBySlugFromSupabase(normalizedSlug);
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
  const description = buildPageDescription(restaurant, title, page);
  const imageUrl = absoluteUrl(origin, restaurant.heroImage || restaurant.logoSquare || "");
  const structuredData = buildStructuredData({
    restaurant,
    title,
    description,
    canonicalUrl,
    imageUrl,
    origin,
  });

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
  html = replaceStructuredData(html, structuredData);

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
    },
  });
}
