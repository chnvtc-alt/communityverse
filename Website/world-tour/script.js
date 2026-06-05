const STARTING_CASH = 150;
const PREVIEW_ROUNDS = 5;
const STARTING_BANDS = 2;
const STARTING_CARDS = 5;
const AUCTION_BANDS_PER_ROUND = 4;
const VICTORY_TARGET = 50;
const MAX_DEMANDS_PER_GAME = 4;
const VENUE_TYPE_SWAP = { A: "C", B: "B", C: "A" };
const ROUND_VENUE_ORDER = ["C", "B", "A"];
const HEADLINER_SLOT = "headliner";
const OPENER_SLOT = "opener";
const SPECIAL_GUEST_SLOT = "special_guest";
const ADVERTISING_VALUES = [1, 2, 3, 4, 5, 6, 7, 8];
const ADVERTISING_COST_PER_POINT = 2;
const ADVERTISING_PLACEMENTS_PER_ROUND = 1;
const ADVERTISING_PLACEMENTS_WITH_AGENCY = 2;
const MAX_ADVERTISING_PER_VENUE = 2;
const STANDARD_VENUE_BAND_SLOTS = [
  { key: HEADLINER_SLOT, label: "Headliner", shortLabel: "H", multiplier: 1 },
  { key: OPENER_SLOT, label: "Opener", shortLabel: "O", multiplier: 0.6 },
];
const STANDARD_VENUE_CAPACITY = STANDARD_VENUE_BAND_SLOTS.length;
const WEEKLY_STANDOUT_LIMIT = 5;
const VENUE_BAND_SLOTS = [
  ...STANDARD_VENUE_BAND_SLOTS,
  { key: SPECIAL_GUEST_SLOT, label: "Special Guest", shortLabel: "SG", multiplier: 1 },
];
const VENUE_SLOT_LOOKUP = Object.fromEntries(VENUE_BAND_SLOTS.map((slot) => [slot.key, slot]));

const venues = [
  { name: "Waffle Master", venuePoints: 1, cost: 0, revenueFactor: 1, country: 3, emo: 1, goth: 0, metal: 0, pop: 2, punk: 0, rnb: -1, rap: -1, rock: 3, other: 0, type: "A" },
  { name: "Stinkers", venuePoints: 1, cost: 0, revenueFactor: 1, country: 0, emo: 2, goth: 1, metal: 1, pop: -2, punk: 2, rnb: -1, rap: 0, rock: -1, other: 2, type: "A" },
  { name: "Thinkers Cafe", venuePoints: 1, cost: 0, revenueFactor: 1, country: -3, emo: 0, goth: -2, metal: -2, pop: 2, punk: -2, rnb: 4, rap: 5, rock: -1, other: 0, type: "A" },
  { name: "Fred's Old Fashioned Lounge", venuePoints: 1, cost: 0, revenueFactor: 1, country: 5, emo: -3, goth: -1, metal: -2, pop: 1, punk: -2, rnb: 2, rap: -2, rock: -3, other: 0, type: "A" },
  { name: "Firehouse Cafe", venuePoints: 1, cost: 0, revenueFactor: 1, country: 2, emo: -1, goth: -1, metal: 0, pop: 1, punk: -1, rnb: -1, rap: -1, rock: 0, other: 0, type: "A" },
  { name: "Soul Food Kitchen", venuePoints: 1, cost: 0, revenueFactor: 1, country: -3, emo: -1, goth: -3, metal: -2, pop: 0, punk: -2, rnb: 4, rap: 3, rock: -1, other: 0, type: "A" },
  { name: "Feline & Friends", venuePoints: 2, cost: 0, revenueFactor: 1, country: -2, emo: 2, goth: 3, metal: 2, pop: -4, punk: 3, rnb: -2, rap: -1, rock: 1, other: 1, type: "A" },
  { name: "The Melting Pot", venuePoints: 2, cost: 0, revenueFactor: 1, country: -5, emo: 2, goth: 5, metal: 3, pop: -4, punk: 4, rnb: -3, rap: -3, rock: -3, other: -3, type: "A" },
  { name: "Sockhops", venuePoints: 2, cost: 0, revenueFactor: 1, country: 0, emo: 0, goth: -2, metal: -1, pop: 2, punk: -2, rnb: 2, rap: 0, rock: 2, other: -2, type: "A" },
  { name: "Cyber Space", venuePoints: 2, cost: 0, revenueFactor: 1, country: 1, emo: 3, goth: 1, metal: 0, pop: 0, punk: -2, rnb: 0, rap: 0, rock: 2, other: 0, type: "A" },
  { name: "The Bungalow", venuePoints: 2, cost: 0, revenueFactor: 1, country: 0, emo: 0, goth: 3, metal: 2, pop: -3, punk: 4, rnb: -3, rap: 2, rock: -2, other: 0, type: "A" },
  { name: "Duke's Hideaway", venuePoints: 2, cost: 0, revenueFactor: 1, country: 0, emo: 0, goth: 0, metal: 2, pop: 1, punk: 3, rnb: 2, rap: 2, rock: 1, other: 0, type: "A" },
  { name: "Americana Diner", venuePoints: 2, cost: 0, revenueFactor: 1, country: 3, emo: -1, goth: -2, metal: -1, pop: 2, punk: -3, rnb: 0, rap: -1, rock: 0, other: -1, type: "A" },
  { name: "Chang's Grill", venuePoints: 2, cost: 0, revenueFactor: 1, country: -1, emo: 0, goth: -2, metal: -2, pop: 2, punk: -2, rnb: -3, rap: -3, rock: 2, other: 3, type: "A" },
  { name: "The Coffee Bean", venuePoints: 3, cost: 4, revenueFactor: 1, country: 2, emo: 1, goth: -3, metal: -1, pop: 2, punk: -3, rnb: 1, rap: -1, rock: -1, other: 2, type: "B" },
  { name: "Carl's Truckstop", venuePoints: 4, cost: 6, revenueFactor: 1, country: 4, emo: -2, goth: -3, metal: 1, pop: 1, punk: -2, rnb: 1, rap: -1, rock: 1, other: -2, type: "B" },
  { name: "Hard Hat Larry's", venuePoints: 4, cost: 2, revenueFactor: 1, country: 5, emo: -1, goth: -4, metal: -4, pop: 2, punk: -4, rnb: -1, rap: -4, rock: 2, other: 0, type: "B" },
  { name: "Ye Olde Pub & Brewery", venuePoints: 4, cost: 3, revenueFactor: 1, country: 1, emo: 0, goth: 1, metal: 1, pop: 1, punk: 2, rnb: 1, rap: -1, rock: 1, other: 0, type: "B" },
  { name: "Neon Rodeo", venuePoints: 8, cost: 12, revenueFactor: 1, country: 6, emo: -1, goth: -3, metal: -1, pop: 2, punk: -2, rnb: -2, rap: -2, rock: 3, other: 0, type: "B" },
  { name: "Spikes & Studs", venuePoints: 5, cost: 7, revenueFactor: 1, country: -4, emo: 0, goth: 6, metal: 4, pop: -4, punk: 6, rnb: -3, rap: 0, rock: -2, other: 0, type: "B" },
  { name: "The Happy Bandit", venuePoints: 5, cost: 6, revenueFactor: 1, country: 3, emo: 1, goth: -3, metal: 1, pop: 1, punk: -1, rnb: 0, rap: -2, rock: 3, other: -1, type: "B" },
  { name: "Cheers!", venuePoints: 5, cost: 5, revenueFactor: 1, country: 1, emo: -1, goth: -1, metal: 0, pop: 3, punk: 0, rnb: 0, rap: -2, rock: 2, other: 0, type: "B" },
  { name: "The Proving Grounds", venuePoints: 6, cost: 10, revenueFactor: 1, country: -3, emo: -1, goth: -1, metal: -2, pop: 2, punk: -1, rnb: 4, rap: 5, rock: 0, other: 0, type: "B" },
  { name: "Links", venuePoints: 6, cost: 9, revenueFactor: 1, country: -3, emo: 1, goth: -2, metal: -1, pop: 3, punk: -2, rnb: -1, rap: -1, rock: 1, other: 0, type: "B" },
  { name: "Grim's Place", venuePoints: 6, cost: 8, revenueFactor: 1, country: -4, emo: 2, goth: 5, metal: 3, pop: -4, punk: 4, rnb: -3, rap: -2, rock: -1, other: -3, type: "B" },
  { name: "The Black Widow", venuePoints: 7, cost: 10, revenueFactor: 1, country: -4, emo: 0, goth: 5, metal: 3, pop: -5, punk: 4, rnb: -4, rap: 0, rock: -2, other: 2, type: "B" },
  { name: "Tameka's Place", venuePoints: 8, cost: 10, revenueFactor: 1, country: -2, emo: -1, goth: -3, metal: -1, pop: 0, punk: -3, rnb: 5, rap: 5, rock: -1, other: 0, type: "B" },
  { name: "Goth City", venuePoints: 8, cost: 13, revenueFactor: 1, country: -3, emo: 0, goth: 4, metal: 1, pop: -1, punk: 3, rnb: -3, rap: -1, rock: -2, other: 0, type: "B" },
  { name: "Topsy Turvy's", venuePoints: 9, cost: 15, revenueFactor: 1, country: 0, emo: 0, goth: 0, metal: 0, pop: 0, punk: 0, rnb: 0, rap: 0, rock: 0, other: 0, type: "B" },
  { name: "Crusty's Place", venuePoints: 6, cost: 10, revenueFactor: 2, country: 2, emo: 1, goth: -1, metal: -1, pop: 1, punk: -1, rnb: -1, rap: -1, rock: 1, other: 1, type: "C" },
  { name: "Out West", venuePoints: 6, cost: 11, revenueFactor: 2, country: 4, emo: 2, goth: -2, metal: -1, pop: 2, punk: -2, rnb: -1, rap: -1, rock: 0, other: 2, type: "C" },
  { name: "Little Paris Club", venuePoints: 7, cost: 13, revenueFactor: 2, country: -2, emo: 2, goth: 5, metal: 4, pop: -2, punk: 3, rnb: -2, rap: -3, rock: 1, other: -2, type: "C" },
  { name: "Conquistadors", venuePoints: 8, cost: 15, revenueFactor: 2, country: 0, emo: 0, goth: 0, metal: 0, pop: 0, punk: 0, rnb: 0, rap: 0, rock: 0, other: 0, type: "C" },
  { name: "Nostalgia", venuePoints: 8, cost: 15, revenueFactor: 2, country: 1, emo: -2, goth: -3, metal: -3, pop: 1, punk: -3, rnb: 1, rap: -2, rock: 2, other: 0, type: "C" },
  { name: "The Dark Ages", venuePoints: 9, cost: 20, revenueFactor: 2, country: 0, emo: 0, goth: 3, metal: 0, pop: -2, punk: 5, rnb: 0, rap: 0, rock: -1, other: 0, type: "C" },
  { name: "Bozo & Bonzo's", venuePoints: 9, cost: 20, revenueFactor: 2, country: 0, emo: 0, goth: 0, metal: 0, pop: 0, punk: 0, rnb: 0, rap: 0, rock: 0, other: 0, type: "C" },
  { name: "Grrrrowlers", venuePoints: 9, cost: 20, revenueFactor: 3, country: 0, emo: 0, goth: 0, metal: 0, pop: 0, punk: 0, rnb: 0, rap: 0, rock: 0, other: 0, type: "C" },
  { name: "The Hood", venuePoints: 10, cost: 20, revenueFactor: 2, country: -5, emo: -3, goth: -3, metal: -2, pop: 0, punk: -2, rnb: 3, rap: 5, rock: -3, other: -1, type: "C" },
  { name: "The Tipsy Frog", venuePoints: 10, cost: 25, revenueFactor: 3, country: 0, emo: 0, goth: 2, metal: 2, pop: 0, punk: 2, rnb: -2, rap: -2, rock: 1, other: 0, type: "C" },
  { name: "The End Zone", venuePoints: 11, cost: 20, revenueFactor: 2, country: 0, emo: 0, goth: 0, metal: 0, pop: 0, punk: 0, rnb: 0, rap: 0, rock: 0, other: 0, type: "C" },
  { name: "The Observatory", venuePoints: 11, cost: 17, revenueFactor: 2, country: 0, emo: 0, goth: 0, metal: 0, pop: 0, punk: 0, rnb: 0, rap: 0, rock: 0, other: 0, type: "C" },
  { name: "The Mic", venuePoints: 12, cost: 30, revenueFactor: 3, country: 0, emo: 1, goth: 0, metal: 1, pop: 0, punk: -1, rnb: 2, rap: 4, rock: 0, other: 0, type: "C" },
  { name: "The Fields", venuePoints: 15, cost: 45, revenueFactor: 3, country: 0, emo: 0, goth: 0, metal: 0, pop: 0, punk: 0, rnb: 0, rap: 0, rock: 0, other: 0, type: "C" },
  { name: "The Coliseum", venuePoints: 18, cost: 60, revenueFactor: 4, country: 0, emo: 0, goth: 0, metal: 0, pop: 0, punk: 0, rnb: 0, rap: 0, rock: 0, other: 0, type: "C" },
];

const VENUE_DETAILS = {
  "Waffle Master": { capacity: 80, description: "Cozy late-night diner stage with a surprisingly loyal roots-rock and country crowd." },
  "Stinkers": { capacity: 90, description: "Scrappy punk-friendly bar where rough edges help more than polish." },
  "Thinkers Cafe": { capacity: 110, description: "Artsy coffeehouse room with strong spoken-word, rap, and thoughtful pop energy." },
  "Fred's Old Fashioned Lounge": { capacity: 120, description: "Old-school cocktail lounge that rewards traditional country and crooner-style sets." },
  "Firehouse Cafe": { capacity: 100, description: "Community cafe room with a modest stage and a mixed neighborhood audience." },
  "Soul Food Kitchen": { capacity: 130, description: "Warm restaurant venue where R&B and rap feel especially at home." },
  "Feline & Friends": { capacity: 140, description: "Quirky bohemian room that embraces emo, goth, and offbeat acts." },
  "The Melting Pot": { capacity: 150, description: "Eclectic underground spot where darker and heavier scenes can thrive." },
  "Sockhops": { capacity: 160, description: "Retro dance room with a crowd that loves pop hooks and upbeat nostalgia." },
  "Cyber Space": { capacity: 180, description: "Futuristic club-cafe where alternative, synthy, and genre-bending acts play well." },
  "The Bungalow": { capacity: 170, description: "Stylish indie room that leans toward goth, punk, and moody underground acts." },
  "Duke's Hideaway": { capacity: 160, description: "Small but lively hideout where energetic mixed-genre bills can work." },
  "Americana Diner": { capacity: 140, description: "Roadside diner stage with a soft spot for country and accessible pop-rock." },
  "Chang's Grill": { capacity: 150, description: "Neighborhood restaurant venue where varied lineups can work if they connect quickly." },
  "The Coffee Bean": { capacity: 220, description: "Busy cafe venue with a young crowd and a little more room for singer-songwriters and pop acts." },
  "Carl's Truckstop": { capacity: 260, description: "Blue-collar roadside room where country and classic-rock energy land well." },
  "Hard Hat Larry's": { capacity: 300, description: "Working-class bar venue with a strong country crowd and a rough-around-the-edges feel." },
  "Ye Olde Pub & Brewery": { capacity: 280, description: "A mid-size pub stage built for crowd-pleasing bar bands and steady live acts." },
  "Neon Rodeo": { capacity: 520, description: "Country at its core, with enough neon nightlife energy to give rock and pop acts some crossover appeal." },
  "Spikes & Studs": { capacity: 320, description: "Leather-and-studs club built for goth, punk, and heavy alternative nights." },
  "The Happy Bandit": { capacity: 300, description: "Rowdy mixed-room tavern where approachable rock and country can do well." },
  "Cheers!": { capacity: 260, description: "Friendly singalong pub with a broad mainstream crowd and reliable pop appeal." },
  "The Proving Grounds": { capacity: 420, description: "Competitive urban showcase room where strong rap and R&B can break out." },
  "Links": { capacity: 380, description: "A good-size lounge club set on a golf course, where polished pop and crossover acts play especially well." },
  "Grim's Place": { capacity: 340, description: "Dark underground room with a dedicated goth and metal-adjacent audience." },
  "The Black Widow": { capacity: 360, description: "Moody club venue with a dramatic stage and a crowd for dark, stylish acts." },
  "Tameka's Place": { capacity: 450, description: "Popular city room with a powerful audience for R&B and rap." },
  "Goth City": { capacity: 500, description: "One of the larger dark-scene clubs, ideal for goth-forward and punk-adjacent shows." },
  "Topsy Turvy's": { capacity: 550, description: "High-energy novelty club where almost anything can work if the act is strong enough." },
  "Crusty's Place": { capacity: 900, description: "A major club room with strong turnout and enough scale to matter financially." },
  "Out West": { capacity: 1100, description: "Regional hall with broad appeal, especially for country and crossover acts." },
  "Little Paris Club": { capacity: 1200, description: "Stylish metropolitan club with a fashionable audience and strong taste for moody sophistication." },
  "Conquistadors": { capacity: 1300, description: "A versatile mid-large hall that does not favor any one genre, just good turnout." },
  "Nostalgia": { capacity: 1400, description: "Throwback theater-club that rewards familiar hooks and audience comfort." },
  "The Dark Ages": { capacity: 1500, description: "Big dark-scene destination venue for goth, punk, and dramatic underground acts." },
  "Bozo & Bonzo's": { capacity: 1800, description: "Large novelty entertainment hall where broad crowd appeal matters more than genre purity." },
  "Grrrrowlers": { capacity: 2200, description: "Big rock-club room with enough scale to create real buzz and revenue swings." },
  "The Hood": { capacity: 2500, description: "Important urban venue with a strong rap and R&B audience and real competitive weight." },
  "The Tipsy Frog": { capacity: 3000, description: "Premium high-payout club where the right band can make serious money." },
  "The End Zone": { capacity: 4500, description: "Sports-bar arena hybrid that can host large mainstream live events." },
  "The Observatory": { capacity: 5500, description: "Large seated venue with a polished production feel and broad crossover potential." },
  "The Mic": { capacity: 7500, description: "Major live-performance hall where rap, R&B, and high-energy acts can break huge." },
  "The Fields": { capacity: 25000, description: "Outdoor festival-scale grounds built for giant crowds and big-event headline shows." },
  "The Coliseum": { capacity: 30000, description: "The biggest venue in the game, a full arena-level destination for superstar acts." },
};

venues.forEach((venue) => {
  Object.assign(venue, VENUE_DETAILS[venue.name] || {});
  venue.type = VENUE_TYPE_SWAP[venue.type] || venue.type;
});

const bands = [
  { name: "Runaway Train", genre: "Country/Rock", popularity: "1D+5", scandal: "1D+3", retention: 12 },
  { name: "Shades of Pastel", genre: "Emo", popularity: "1D+5", scandal: "2D", retention: 13 },
  { name: "Johnny Pepper", genre: "Emo", popularity: "1D+2", scandal: "1D", retention: 9 },
  { name: "Sunshine Summers", genre: "Emo", popularity: "1D+2", scandal: "1D-2", retention: 12 },
  { name: "Tiffany Ringwald", genre: "Pop", popularity: "2D+3", scandal: "1D+1", retention: 18 },
  { name: "B7", genre: "Rock", popularity: "2D+2", scandal: "1D-2", retention: 16 },
  { name: "Colter Hayes", genre: "Country/Rock", popularity: "2D+2", scandal: "1D+2", retention: 15 },
  { name: "Milana", genre: "Pop", popularity: "3D+2", scandal: "1D", retention: 30 },
  { name: "Inner City Schnizzle", genre: "Rap", popularity: "1D", scandal: "1D", retention: 5 },
  { name: "Mutant Museum", genre: "Goth", popularity: "2D+4", scandal: "1D+4", retention: 10 },
  { name: "Miss Pearl", genre: "R&B", popularity: "3D-3", scandal: "1D", retention: 15 },
  { name: "Supersize", genre: "R&B/Pop", popularity: "1D-2", scandal: "1D-3", retention: 5 },
  { name: "Red Eye Gravy", genre: "Country", popularity: "1D-1", scandal: "1D-2", retention: 4 },
  { name: "A-Mac", genre: "Country", popularity: "1D+4", scandal: "1D", retention: 13 },
  { name: "Declined", genre: "Goth", popularity: "1D+2", scandal: "1D-2", retention: 9 },
  { name: "Malice In Wonderland", genre: "Goth/Rock", popularity: "2D+5", scandal: "2D-2", retention: 13 },
  { name: "Smiley Boy", genre: "Pop", popularity: "1D+3", scandal: "1D-2", retention: 4 },
  { name: "Bleach Blonde", genre: "Rap", popularity: "2D+5", scandal: "2D-2", retention: 20 },
  { name: "Greek Salad", genre: "Rock/Other", popularity: "1D+3", scandal: "1D+4", retention: 11 },
  { name: "Viper Grrl", genre: "Metal", popularity: "2D", scandal: "3D", retention: 7 },
  { name: "The Unknown", genre: "Metal/Punk", popularity: "1D+4", scandal: "1D+2", retention: 10 },
  { name: "The Muses", genre: "Goth", popularity: "1D-1", scandal: "1D-2", retention: 6 },
  { name: "Boy Wonder", genre: "Rap", popularity: "1D-4", scandal: "1D-4", retention: 1 },
  { name: "Twisted Lare", genre: "Rap/Other", popularity: "2D+4", scandal: "2D-2", retention: 14 },
  { name: "The Prissies", genre: "Emo", popularity: "1D", scandal: "1D-3", retention: 8 },
  { name: "Rusty Rebellion", genre: "Punk", popularity: "1D+7", scandal: "2D+1", retention: 15 },
  { name: "LaDiva", genre: "Pop", popularity: "2D+4", scandal: "2D", retention: 17 },
  { name: "The Fraulines", genre: "Metal", popularity: "1D+1", scandal: "1D-3", retention: 9 },
  { name: "Bambee Reese", genre: "Country", popularity: "3D+2", scandal: "1D+4", retention: 25 },
  { name: "Pierre Crache", genre: "Metal", popularity: "2D-1", scandal: "1D+2", retention: 13 },
  { name: "Loving Larry Flirt", genre: "R&B", popularity: "1D", scandal: "1D", retention: 6 },
  { name: "Stonehenge Blues Co.", genre: "R&B", popularity: "1D+4", scandal: "1D", retention: 13 },
  { name: "Enrique Santos", genre: "R&B", popularity: "1D+2", scandal: "1D-2", retention: 8 },
  { name: "Jimmy Pepper", genre: "Emo", popularity: "1D-2", scandal: "1D-2", retention: 6 },
  { name: "Ahmed Ali", genre: "Other", popularity: "1D-3", scandal: "1D", retention: 2 },
  { name: "Unchained Chaos", genre: "Emo", popularity: "1D+3", scandal: "1D+2", retention: 12 },
  { name: "Don Wild Man Long", genre: "Metal", popularity: "1D-3", scandal: "1D+4", retention: 2 },
  { name: "Mick McCartney", genre: "Pop/Rock", popularity: "2D-2", scandal: "1D+3", retention: 12 },
  { name: "White Cherry", genre: "Rap", popularity: "1D+4", scandal: "2D", retention: 15 },
  { name: "Wilfred Pepper", genre: "Country", popularity: "1D-2", scandal: "1D", retention: 1 },
  { name: "Shock Therapy", genre: "Metal", popularity: "1D+3", scandal: "1D+2", retention: 10 },
  { name: "Crazy Clown Crew", genre: "Goth/Metal", popularity: "3D+2", scandal: "1D+3", retention: 25 },
  { name: "Miss Whizzlekins", genre: "Country/Rock", popularity: "1D", scandal: "2D", retention: 4 },
  { name: "Flash Bandicott", genre: "Metal/Rock", popularity: "1D+1", scandal: "1D-2", retention: 7 },
  { name: "Elvis Alfonzo", genre: "Other", popularity: "2D", scandal: "1D+3", retention: 14 },
  { name: "Skel-O-Dude", genre: "Goth/R&B", popularity: "1D+5", scandal: "1D-2", retention: 11 },
  { name: "Angel Sweet", genre: "Emo/Other", popularity: "2D-1", scandal: "1D-5", retention: 17 },
  { name: "Curtis Coolwater", genre: "R&B", popularity: "1D+10", scandal: "3D", retention: 20 },
  { name: "Captain Zoogle & Friends", genre: "Punk/Other", popularity: "1D+1", scandal: "1D", retention: 8 },
  { name: "Glacier", genre: "Pop", popularity: "1D+2", scandal: "1D", retention: 10 },
  { name: "DJ Lite 2.0", genre: "Other", popularity: "1D+1", scandal: "1D", retention: 8 },
  { name: "The Lover Boys", genre: "Pop", popularity: "2D+4", scandal: "1D", retention: 17 },
  { name: "Dead Ballet Society", genre: "Goth", popularity: "1D+1", scandal: "2D-2", retention: 7 },
  { name: "DonkeyFoot", genre: "Punk", popularity: "2D+1", scandal: "2D", retention: 13 },
  { name: "Wicked Jim DeVito", genre: "Rap/Other", popularity: "1D+2", scandal: "3D", retention: 4 },
  { name: "Jensing!", genre: "Country", popularity: "2D+2", scandal: "1D", retention: 15 },
  { name: "Miles From Home", genre: "Other", popularity: "2D", scandal: "1D-1", retention: 14 },
];

const CARD_TEMPLATES = [
  { name: "Smash Hit", type: "smash", effect: "persistent_smash", modifier: 2, subtitle: "Marry Merry Mary", allowedGenres: ["emo"], description: "Marry Merry Mary is made into a romance novel by the same name. Add +2 if played on an Emo act. Stays for the rest of the game." },
  { name: "Smash Hit", type: "smash", effect: "persistent_smash", modifier: 1, subtitle: "Leave Us, You Old Farts", allowedGenres: ["goth"], description: "Add +1 if played on a Goth band. Stays for the rest of the game." },
  { name: "Smash Hit", type: "smash", effect: "persistent_smash", modifier: 4, subtitle: "Tattoo Heartbreak", allowedGenres: ["punk"], description: "Tattoo Heartbreak is a Punk Superhit. Popularity +4 if played on a Punk performer. Stays for the rest of the game." },
  { name: "Smash Hit", type: "smash", effect: "persistent_smash", modifier: 3, subtitle: "You Done Lost Your Mind", allowedGenres: ["rnb"], description: "Add +3 if played on an R&B artist. Stays for the rest of the game." },
  { name: "Smash Hit", type: "smash", effect: "persistent_smash", modifier: 2, subtitle: "Roll Them Bones", allowedGenres: ["goth", "rnb"], description: "Add +2 if played on a Goth or R&B band. Stays for the rest of the game." },
  { name: "Smash Hit", type: "smash", effect: "persistent_smash", modifier: 3, subtitle: "Military Madman", allowedGenres: ["rap", "other"], description: "Add +3 if played on a Rap or Other band. Stays for the rest of the game." },
  { name: "Smash Hit", type: "smash", effect: "persistent_smash", modifier: 1, subtitle: "Southern Fried Paycheck", allowedGenres: ["rock", "country"], description: "Add +1 if played on a Rock or Country band. Stays for the rest of the game." },
  { name: "Smash Hit", type: "smash", effect: "persistent_smash", modifier: 4, subtitle: "Pull", description: "A huge hit. Add +4 for the rest of the game." },
  { name: "Smash Hit", type: "smash", effect: "persistent_smash", modifier: 4, subtitle: "New Line Dance Craze", description: "Your new song Pipeline of Love, a tribute to oil and gas workers, becomes a Line Dance Craze. Add +4 for the rest of the game." },
  { name: "Smash Hit", type: "smash", effect: "persistent_smash", modifier: 3, subtitle: "The Empty Bench", description: "Your new song The Empty Bench is used in a soap opera. Add +3 for the rest of the game." },
  { name: "Smash Hit", type: "smash", effect: "persistent_smash", modifier: 2, subtitle: "Camel Chameleon", description: "Camel Chameleon gains a small following. Add +2 for the rest of the game." },
  { name: "Smash Hit", type: "smash", effect: "persistent_smash", modifier: 2, subtitle: "Don't Take My Hat or my Socks", description: "Add +2 for the rest of the game." },
  { name: "Smash Hit", type: "smash", effect: "persistent_scandal_adjustment", scandalModifier: -5, subtitle: "Counseling", description: "Anger management counseling is paying big dividends. Subtract -5 from your Scandal Factor." },
  { name: "Smash Hit", type: "smash", effect: "flat_bonus", modifier: 2, subtitle: "Pyrotechnics", description: "Add +2 to your band's Popularity." },
  { name: "Smash Hit", type: "smash", effect: "flat_bonus", modifier: 3, subtitle: "Broadway!", description: "You have been asked to create the music for a Broadway Show. +3 to Popularity." },
  { name: "Smash Hit", type: "smash", effect: "persistent_smash", modifier: 2, subtitle: "Backup Dancers", description: "+2 to Popularity for the rest of the game." },
  { name: "Smash Hit", type: "smash", effect: "persistent_smash", modifier: 2, subtitle: "Honey Bear", description: "Soothes the Vocal Chords. +2 to Popularity each week." },
  { name: "Smash Hit", type: "smash", effect: "flat_bonus", modifier: 2, subtitle: "Patriotism", description: "You write a song that becomes popular with the military and patriotic Americans. +2 to Popularity." },
  { name: "Smash Hit", type: "smash", effect: "flat_bonus", modifier: 4, subtitle: "Battle Of The Bands", description: "Your band wins Battle of the Bands. +4 to Popularity." },
  { name: "Smash Hit", type: "smash", effect: "persistent_smash", modifier: 3, subtitle: "Political Career", description: "Fans gather enough signatures on a petition for a run for State Senator. The ensuing news coverage and background stories add +3 to your popularity." },
  { name: "Smash Hit", type: "smash", effect: "persistent_smash", modifier: 3, subtitle: "Video Star", description: "A video game is made featuring your band. Add +3 to popularity each week." },
  { name: "Bad Song", type: "bad_song", effect: "bad_song_persistent", flatPenalty: 4, subtitle: "Photo Without Makeup", description: "The Public just doesn't see you the same. -4 to your Popularity for the rest of the game." },
  { name: "Endorsement", type: "smash", effect: "persistent_smash", popularityDice: 1, subtitle: "Snarfy's Steak House", description: "Snarfy's Steak House gives you their limousine for your personal use. Since they were voted best steak house, this increases your popularity. Roll an extra 1D Popularity each turn." },
  { name: "Endorsement", type: "smash", effect: "persistent_smash", popularityDice: 1, subtitle: "Elite Salon", description: "An elite salon pays for you to endorse a new style. Roll an extra 1D Popularity each turn." },
  { name: "Halftime Show", type: "smash", effect: "persistent_smash", popularityDice: 1, description: "Your band is selected to perform at the annual Snarfy's Steak House Peanut Bowl game. Roll an extra 1D Popularity each turn." },
  { name: "Merchandise", type: "smash", effect: "persistent_smash", popularityDice: 1, description: "Your band starts selling merchandise. Roll an extra 1D Popularity each turn." },
  { name: "This Is The Bee's Knees!", type: "smash", effect: "persistent_smash", modifier: 2, requiresSmashHit: true, description: "Choose a band with a Smash Hit. That song has become a hit with the older folks as well. Add +2 Popularity for the rest of the game." },
  { name: "Advertising Agency", type: "smash", effect: "persistent_ad_agency", targetSelf: true, description: "You have hired an ad agency to help you. You may now advertise in two venues each turn, or twice in the same venue each turn." },
  { name: "Snow Tires", type: "smash", effect: "venue_snow_tires", targetSelf: true, description: "This card enables all of your bands to reach the venue in case of a snowstorm." },
  { name: "Duet", type: "smash", effect: "duet_persistent", modifier: 2, targetSelf: true, description: "Two of your artists that are at the same venue perform a song together, creating a viral video. Add +2 to each artist's popularity for the remainder of the game." },
  { name: "Duet", type: "smash", effect: "duet_persistent", modifier: 2, targetSelf: true, description: "Two of your artists that are at the same venue perform a song together, creating a viral video. Add +2 to each artist's popularity for the remainder of the game." },
  { name: "Duet", type: "smash", effect: "duet_persistent", modifier: 2, targetSelf: true, description: "Two of your artists that are at the same venue perform a song together, creating a viral video. Add +2 to each artist's popularity for the remainder of the game." },
  { name: "Reality Show", type: "smash", effect: "sit_out_boost_persistent", modifier: 5, targetSelf: true, description: "One of your acts takes off this week to participate in an outdoor survival reality show. They miss this week, but when they return they gain +5 Popularity for the rest of the game." },
  { name: "Lights, Camera, Day Off", type: "smash", effect: "sit_out_boost_persistent", modifier: 4, targetSelf: true, description: "One of your artists is cast as the villain in Wild Cherry's new movie Cherry Gangsta. They miss this week, but when they return they gain +4 Popularity for the rest of the game." },
  { name: "Bigger Audience", type: "smash", effect: "sit_out_boost_persistent", modifier: 3, targetSelf: true, description: "One of your bands appears as the guest musical act on Captain Zoogle & Friends. They miss this week, but when they return they gain +3 Popularity for the rest of the game." },
  { name: "Probation", type: "smash", effect: "persistent_scandal_adjustment", scandalDiceModifier: -1, description: "Your band has to behave itself because it was placed on probation. Subtract 1D from your scandal factor." },
  { name: "Smash Hit", type: "smash", effect: "persistent_smash", modifier: 3, subtitle: "Bobblehead Dolls", description: "You know you've made it when a Bobble Head Doll of your band becomes a must have item. +3 to Popularity." },
  { name: "Smash Hit", type: "smash", effect: "flat_bonus", modifier: 1, subtitle: "Good Review", description: "A music critic loves one of your acts. +1 to Popularity." },
  { name: "Music Trend", type: "trend", effect: "music_trend", modifier: 4, subtitle: "Punk / Metal", trendGenres: ["punk", "metal"], description: "Punk and Metal music is soaring in popularity. All Punk and Metal bands gain +4 Popularity this week." },
  { name: "Music Trend", type: "trend", effect: "music_trend", modifier: 4, subtitle: "Rap / R&B", trendGenres: ["rap", "rnb"], description: "Rap and R&B music is surging right now. All Rap and R&B bands gain +4 Popularity this week." },
  { name: "Music Trend", type: "trend", effect: "music_trend", modifier: 4, subtitle: "Pop / Emo", trendGenres: ["pop", "emo"], description: "Pop and Emo music is climbing fast in popularity. All Pop and Emo bands gain +4 Popularity this week." },
  { name: "Music Trend", type: "trend", effect: "music_trend", modifier: 4, subtitle: "Goth / Other", trendGenres: ["goth", "other"], description: "Goth and Other music is suddenly catching on. All Goth and Other bands gain +4 Popularity this week." },
  { name: "Music Trend", type: "trend", effect: "music_trend", modifier: 4, subtitle: "Rock / Country", trendGenres: ["rock", "country"], description: "Rock and Country music is booming in popularity. All Rock and Country bands gain +4 Popularity this week." },
  { name: "Ammunition", type: "trend", effect: "draw_cards", cardsToDraw: 3, description: "Draw three new World Tour Cards." },
  { name: "Thief In The Night", type: "trend", effect: "steal_cards", cardsToSteal: 1, description: "Take one World Tour Card from each player, sight unseen." },
  { name: "Shady Manager", type: "trend", effect: "cash_attack", description: "Play on an opponent. Someone is taking your money. Lose half of your money or $30, whichever is less." },
  { name: "Charity Case", type: "trend", effect: "charity_case", description: "The player leading in Victory Points must give you one band of their choice. The band may be sitting out this week. If it is booked at a venue, it joins your lineup there as a Special Guest." },
  { name: "Signing Bonus", type: "trend", effect: "signing_bonus", cashBonus: 50, description: "A Japanese businessman is putting together a huge concert. He pays $50 to each promoter to help him find bands for the concert." },
  { name: "Communism", type: "trend", effect: "communism", description: "All players put their money together and then it is divided evenly among all players." },
  { name: "Special Guest", type: "trend", effect: "special_guest_draw", description: "Draw the top band from the deck and add it to one venue where you already have at least one band booked this week. That band performs this show for free and may exceed the normal venue band limit." },
  { name: "Mega Concert", type: "trend", effect: "mega_concert", description: "All promoters draw one extra band and add it as a Special Guest to one unresolved venue they already have booked this week." },
  { name: "We Want You", type: "trend", effect: "refund_booking_fee", description: "Your bands are so popular that you get a refund of the Booking Fee at one venue for this week." },
  { name: "Tax Time", type: "trend", effect: "tax_time", description: "It's time to pay taxes on all of the equipment for your bands. You must pay double the Retention Cost for each band you wish to keep after this week's performance." },
  { name: "Music Fever", type: "trend", effect: "music_fever", description: "It's concert season. All revenues are doubled this week for all bands at all venues. At the end of each round, roll 2D. If 7 or higher is rolled, Music Fever continues next week." },
  { name: "Recession", type: "trend", effect: "recession", description: "All revenues are cut in half this week for all bands at all venues. At the end of each round, roll 2D. If 7 or higher is rolled, Recession continues next week." },
  { name: "Televised Concert", type: "trend", effect: "televised_concert", description: "The Captain Zoogle & Friends TV program broadcasts the video from one venue. The pre-publicity causes a surge in attendance. Revenues for all bands at that venue are doubled this week." },
  { name: "Bad Song", type: "bad_song", effect: "bad_song_persistent", flatPenalty: 2, subtitle: "Double Shot of Insomnia", description: "This song is a total flop. Popularity goes down by 2 and stays with them for the rest of the game." },
  { name: "Biography", type: "bad_song", effect: "biography", targetSelf: true, description: "A book has been written about your band. Roll one die. On 1-3 it is -4 to your popularity. On 4-6 it is +2. The card stays in effect for the rest of the game." },
  { name: "Contract Negotiations", type: "bad_song", effect: "contract_negotiations", description: "The headline artist demands an additional payment equal to two times their retention cost or they will not play this week. To avoid problems with the venue and the fans you must pay them if you can. If you cannot, they do not perform." },
  { name: "Technical Difficulties", type: "bad_song", effect: "technical_difficulties", description: "Due to faulty equipment, your band only does half of a show. Divide your popularity rolls for this week in half." },
  { name: "Parking Lot Concert", type: "bad_song", effect: "parking_lot_concert", description: "You set up and play a show in a parking lot across the street from the venue where your opponent is playing. They receive only half of the popularity and revenue this week." },
  { name: "Hearing Aid IV Benefit Concert", type: "bad_song", effect: "benefit_concert", modifier: 10, description: "You agree to play for free at Hearing Aid IV. You are donating the proceeds this week at this venue to research concerning hearing loss and music. You receive +10 Popularity this week, but no revenues." },
  { name: "Bad Promotion Idea", type: "bad_song", effect: "bad_promotion_idea", targetSelf: true, description: "Your cookie guitar promotion turns sour when the FDA seizes your shipment before your concert, citing contamination. This causes a riot among hungry concert goers, which cancels the performance of your headlining band." },
  { name: "Bad Sushi", type: "bad_song", effect: "bad_sushi", targetSelf: true, description: "One of your bands ate bad sushi. They are busy throwing up, and cannot make the show this week. It is too late to replace them." },
  { name: "Argument", type: "bad_song", effect: "argument_duo", flatPenalty: 2, description: "Your acts are arguing over who is opening for who. -2 to each of the acts this week only." },
  { name: "Feud", type: "bad_song", effect: "feud", description: "Play on two acts competing in the same venue as one of your acts. The bands get into a feud over radio airplay. Each targeted act rolls 1D. On 5-6, that act gets +2 Popularity this week. On 1-4, that act gets -2 Popularity this week." },
  { name: "Dance Off", type: "bad_song", effect: "dance_off", description: "One of your artists meets one of your opponent's artists in a club the night before the show. There is only one way to settle the argument that ensues: a Dance Off. Each of you roll 2D. The highest roller gets +5 Popularity this week only." },
  { name: "Party Too Hard", type: "bad_song", effect: "miss_this_week", description: "The opponent's act of your choice was out too late last night partying. They can't make this week's show due to a nasty hangover." },
  { name: "Stalker", type: "bad_song", effect: "miss_this_week", description: "Your artist must go into hiding this week due to a stalker." },
  { name: "Demands", type: "bad_song", effect: "bad_song_persistent", flatPenalty: 5, subtitle: "Solid Gold Limousine", description: "Your band demands a solid gold limousine. Your fans think it is tacky, plus the expense forces you to live in it, which hurts your appearance. -5 to popularity every turn." },
  { name: "Demands", type: "bad_song", effect: "bad_song_persistent", flatPenalty: 3, subtitle: "Fresh Baked Goods", description: "Your band demands large quantities of fresh baked goods before each show. It's starting to take a toll on your weight and your budget. -3 to popularity every turn." },
  { name: "Demands", type: "bad_song", effect: "bad_song_persistent", flatPenalty: 5, subtitle: "Herd Of Cattle", description: "No longer satisfied with Snarfy's Steak House, your band demands a small herd of cattle be transported on all road trips. -5 to popularity every turn." },
  { name: "Demands", type: "bad_song", effect: "bad_song_persistent", flatPenalty: 4, subtitle: "Climate-Controlled Bubble", description: "They demand a perfectly controlled performance climate at all times. They wind up performing inside a giant clear bubble, and fans think they have lost touch. -4 to popularity every turn." },
  { name: "Demands", type: "bad_song", effect: "bad_song_persistent", flatPenalty: 3, subtitle: "Taste-Test Every Bite", description: "They refuse to eat anything unless their personal chef tastes every bite first. Shows start late, fans get annoyed, and the band seems paranoid and high-maintenance. -3 to popularity every turn." },
  { name: "Demands", type: "bad_song", effect: "bad_song_persistent", flatPenalty: 4, subtitle: "Applause On Cue", description: "They demand the crowd reach a certain decibel level of applause before they will continue each song. Concerts become awkward and forced, and fans lose interest. -4 to popularity every turn." },
  { name: "Demands", type: "bad_song", effect: "bad_song_persistent", flatPenalty: 4, subtitle: "Face Due East", description: "They insist the stage must face a certain direction for energy alignment. Venues get rearranged awkwardly, the sound suffers, and fans think they have gone weird. -4 to popularity every turn." },
  { name: "Demands", type: "bad_song", effect: "bad_song_persistent", flatPenalty: 5, subtitle: "Exotic Animal Companions", description: "They insist on traveling with exotic animals for inspiration. It becomes a distraction, expensive, and people think they care more about image than music. -5 to popularity every turn." },
  { name: "Demands", type: "bad_song", effect: "bad_song_persistent", flatPenalty: 3, subtitle: "Mirror Room Backstage", description: "They demand an entire backstage room covered in mirrors so they can stay in the zone. Crew thinks they are narcissistic and stories leak. -3 to popularity every turn." },
  { name: "Demands", type: "bad_song", effect: "bad_song_persistent", flatPenalty: 4, subtitle: "Only Vintage Everything", description: "They refuse to use any modern equipment, only vintage amps, mics, and buses. Constant breakdowns and poor sound quality frustrate fans. -4 to popularity every turn." },
  { name: "Demands", type: "bad_song", effect: "bad_song_persistent", flatPenalty: 5, subtitle: "No Eye Contact Rule", description: "They demand that no staff, crew, or even front-row fans make direct eye contact. Fans feel insulted and the band seems arrogant. -5 to popularity every turn." },
  { name: "Demands", type: "bad_song", effect: "bad_song_persistent", flatPenalty: 3, subtitle: "Lyrics Confetti", description: "They demand custom confetti made from printed copies of their own lyrics for every show. It comes off as self-obsessed and wasteful. -3 to popularity every turn." },
  { name: "Demands", type: "bad_song", effect: "bad_song_persistent", flatPenalty: 4, subtitle: "Standing Ovation Encore", description: "They refuse to return for an encore unless the crowd gives a full standing ovation for at least two minutes. It feels forced and fake, and fans resent it. -4 to popularity every turn." },
  { name: "Demands", type: "bad_song", effect: "bad_song_persistent", flatPenalty: 5, subtitle: "Perfume The Venue", description: "They insist the entire venue be sprayed with their custom fragrance before the show. The smell is overpowering and the band gets a ridiculous reputation. -5 to popularity every turn." },
  { name: "Demands", type: "bad_song", effect: "bad_song_persistent", flatPenalty: 5, subtitle: "Gold-Plated Instruments", description: "They demand gold-plated instruments for the aesthetic. It looks flashy, sounds worse, and fans think they have sold out. -5 to popularity every turn." },
  { name: "Demands", type: "bad_song", effect: "bad_song_persistent", flatPenalty: 5, subtitle: "Personal Red Carpet", description: "They require a red carpet rolled out wherever they walk, even backstage and in parking lots. Staff resentment grows and the public sees ego overload. -5 to popularity every turn." },
  { name: "Demands", type: "bad_song", effect: "bad_song_persistent", flatPenalty: 3, subtitle: "Custom Crowd Chants", description: "They require the audience to learn and perform specific chants during songs. It feels scripted and kills the natural vibe. -3 to popularity every turn." },
  { name: "Demands", type: "bad_song", effect: "bad_song_persistent", flatPenalty: 4, subtitle: "Midnight-Only Performances", description: "They refuse to perform before midnight, no matter the event. Fans get exhausted and attendance drops. -4 to popularity every turn." },
  { name: "Overplay", type: "bad_song", effect: "remove_smash_hits", description: "Your songs are played so much on the radio that people are tired of hearing them. They are no longer Smash Hits and must be returned to the discard pile." },
  { name: "Bad Song", type: "bad_song", effect: "bad_song_flat", flatPenalty: 2, subtitle: "Snakeskin Boots", description: "Your new song Snakeskin Boots has offended the animal rights crowd. They are sneaking into your concerts and releasing snakes into the audience. Popularity goes down by 2." },
  { name: "Bad Song", type: "bad_song", effect: "bad_song_persistent", flatPenalty: 4, subtitle: "Bats are Afraid of the Dark", description: "Bats are Afraid of the Dark is chosen for a toddler cartoon theme song. Adults find it annoying but it becomes your most recognized song, tarnishing your reputation with your fans. Popularity goes down by 4 and stays with them for the rest of the game." },
  { name: "Bad Song", type: "bad_song", effect: "bad_song_persistent", flatPenalty: 4, subtitle: "Paper Chase", description: "The video for Paper Chase, which shows a man chasing a roll of toilet paper, grosses out many of your fans. Subtract 4 from their popularity for the rest of the game." },
  { name: "Bad Song", type: "bad_song", effect: "bad_song_persistent", flatPenalty: 4, subtitle: "Religion and Politics", description: "Religion and Politics is a big flop. Apparently the old adage about not discussing these topics applies to not singing about them too. It stays with them for the rest of the game. -4 to popularity." },
  { name: "Fake Merchandise", type: "bad_song", effect: "bad_song_persistent", popularityDice: -1, subtitle: "Fake Merchandise", description: "Someone has produced large quantities of fake merchandise. This hurts your band's popularity. Subtract 1D Popularity each week." },
  { name: "Backlash", type: "bad_song", effect: "bad_song_persistent_discard_smash", flatPenalty: 3, subtitle: "Crazy Clowns in your Room", description: "Crazy Clowns in your Room is chosen for a horror movie soundtrack, scaring a large percentage of your fans. -3 to popularity, discard any smash hit the target has, and the song stays with them for the rest of the game." },
  { name: "Bad Move", type: "bad_song", effect: "bad_song_persistent", flatPenalty: 2, subtitle: "Growing Up In The Hood", description: "One of your rival's acts starts talking about growing up in the hood. A tabloid exposes the obvious lie. -2 to popularity for the rest of the game." },
  { name: "Bad Move", type: "bad_song", effect: "bad_song_persistent", flatPenalty: 2, subtitle: "Birds At The Concert", description: "A rival act releases birds at a concert, and they are drawn into the pyrotechnics display. -2 to popularity for the rest of the game because of the bad publicity." },
  { name: "Snowstorm", type: "bad_song", effect: "venue_snowstorm", description: "A snowstorm makes it impossible for all bands to reach the venue this week, canceling the show. Your booking cost is returned. This affects all bands." },
  { name: "Bad Song", type: "bad_song", effect: "bad_song_until_week_off", flatPenalty: 2, subtitle: "Bad Hair Cut", description: "The public is not sure about your new hair style. -2 to popularity until your band does not perform in a given week to see a professional for hair implants. After a week off performing, the Bad Hair Cut penalty goes away." },
  { name: "Image Problem", type: "bad_song", effect: "bad_song_until_week_off", flatPenalty: 5, subtitle: "Weight Gain", description: "One of your artists is gaining weight. -5 to popularity until your band does not perform in a given week to figure out a new fitness plan. After a week off performing, the Weight Gain penalty goes away." },
  { name: "Good PR", type: "defense", effect: "cancel_scandal", subtitle: "Good PR", description: "Cancels a Rumor or Scandal played on you." },
  { name: "Good PR", type: "defense", effect: "cancel_scandal", subtitle: "Good PR", description: "Cancels a Rumor or Scandal played on you." },
  { name: "Good PR", type: "defense", effect: "cancel_scandal", subtitle: "Good PR", description: "Cancels a Rumor or Scandal played on you." },
  { name: "Good PR", type: "defense", effect: "cancel_scandal", subtitle: "Good PR", description: "Cancels a Rumor or Scandal played on you." },
  { name: "Common Sense", type: "defense", effect: "cancel_demands", subtitle: "Common Sense", description: "Cancels a Demands card played on you." },
  { name: "Common Sense", type: "defense", effect: "cancel_demands", subtitle: "Common Sense", description: "Cancels a Demands card played on you." },
  { name: "Swiss Bank Account", type: "defense", effect: "swiss_bank_account", subtitle: "Swiss Bank Account", description: "If Communism is played, you keep all of your money and everyone else's money is still split four ways." },
  { name: "Super Lawyer", type: "defense", effect: "super_lawyer", subtitle: "Super Lawyer", description: "Clears one active Rumor or Scandal from that band immediately and then blocks future Rumor or Scandal attacks on that band." },
  { name: "Super Lawyer", type: "defense", effect: "super_lawyer", subtitle: "Super Lawyer", description: "Clears one active Rumor or Scandal from that band immediately and then blocks future Rumor or Scandal attacks on that band." },
  { name: "Scandal", type: "scandal", effect: "scandal_roll", subtitle: "Hot Mic", description: "A hot mic catches the band backstage arguing about how much they hate playing this city right before they walk out and shout that they love the crowd. Roll scandal factor and subtract it from an opponent's act this week." },
  { name: "Scandal", type: "scandal", effect: "scandal_roll_double_if_second", subtitle: "Huge Story Brewing", description: "Tabloids are saying that in the next issue they will uncover a shocking story about you. Roll scandal factor. If another scandal hits that act too, both scandal effects are doubled." },
  { name: "Scandal", type: "scandal", effect: "scandal_roll", subtitle: "Dumb Apology", description: "You release a heartfelt apology for recent events, but no one knows what you mean until fans start digging and create a scandal that did not exist before. Roll scandal factor and subtract it from an opponent's act this week." },
  { name: "Scandal", type: "scandal", effect: "persistent_scandal_double", subtitle: "Distant Relative On TV", description: "This one is serious. Roll scandal factor, then double it. The scandal keeps haunting that act in future rounds." },
  { name: "Scandal", type: "scandal", effect: "scandal_roll", subtitle: "Sketchy Charity", description: "Your band launches a charity single, but fans can only find a vague website with a stock photo and no contact information. Roll scandal factor and subtract it from an opponent's act this week." },
  { name: "Scandal", type: "scandal", effect: "flat_penalty", flatPenalty: 2, subtitle: "Wooden Leg", description: "There is a rumor that your artist has a wooden leg." },
  { name: "Scandal", type: "scandal", effect: "scandal_roll", subtitle: "Where Am I?", description: "During a major concert, you keep thanking the crowd in the wrong city name. Roll scandal factor and subtract it from an opponent's act this week." },
  { name: "Scandal", type: "scandal", effect: "persistent_scandal", subtitle: "Plastic Surgery Rumor", description: "This rumor sticks. Roll scandal factor against that act each future round." },
  { name: "Legal Problems", type: "scandal", effect: "persistent_bust", subtitle: "Counterfeit Bills", description: "Law Enforcement raids your hotel room and seizes a suitcase full of $1 Bills. You are released on bail, but miss your show this week. You also must roll the Scandal Dice every week for the rest of the game." },
  { name: "Scandal", type: "scandal", effect: "persistent_scandal", subtitle: "Radio Interview Meltdown", description: "A disastrous interview lingers. Roll scandal factor against that act each future round." },
  { name: "Rumor", type: "rumor", effect: "persistent_scandal", subtitle: "Ran Over Ex-Girlfriend's Dog", description: "There is a rumor that you ran over your ex-girlfriend's dog. Roll the scandal dice every turn." },
  { name: "Rumor", type: "rumor", effect: "persistent_scandal", subtitle: "Fake Hair", description: "People are saying that your hair is fake. Roll the scandal dice every turn." },
  { name: "Rumor", type: "rumor", effect: "persistent_scandal", subtitle: "Lip Sync", description: "There is a rumor that you lip sync. Roll your scandal dice each week." },
];

const GENRE_KEYS = ["country", "emo", "goth", "metal", "pop", "punk", "rnb", "rap", "rock", "other"];

const state = {
  round: 0,
  schedule: [],
  bandDeck: [],
  cardDeck: [],
  marketBands: [],
  managers: [],
  log: [],
  phase: "pregame",
  roundCardPlays: [],
  roundResults: [],
  showcase: null,
  pendingDefenseChoice: null,
  pendingCharityCaseChoice: null,
  persistentScandals: [],
  persistentBadSongs: [],
  persistentSmashHits: [],
  persistentScandalAdjustments: [],
  persistentLawyers: [],
  persistentPromoterEffects: [],
  cardTurnOrder: [],
  cardPassedManagers: [],
  activeCardManagerId: "",
  lastCardActionText: "",
  pendingRetentions: {},
  advertisingPlacements: [],
  lastWeekBandSnapshot: {},
  bandCareerLedger: {},
  selectedAdvertisingValue: 0,
  selectedAdvertisingTarget: "",
  reviewingAssignments: false,
  currentVenueCardIndex: 0,
  activeWorkspace: "auction",
  activeSidebarView: "this_week",
  selectedPromoterId: "player",
  selectedPreviewRound: 0,
  introSlides: [],
  introIndex: 0,
  nextCardId: 1,
  pendingWeekOffChoices: {},
  currentRoundWeekOffBands: {},
  pendingCardDiscards: {},
  cardDeckTemplates: [],
  globalRevenueClimate: null,
  revenueClimateAlert: null,
  bandRevealAlert: null,
  pendingMegaConcert: null,
};

const els = {
  startButton: document.querySelector("#start-button"),
  viewRosterButton: document.querySelector("#view-roster-button"),
  viewVenueRosterButton: document.querySelector("#view-venue-roster-button"),
  playerName: document.querySelector("#player-name"),
  playerIcon: document.querySelector("#player-icon"),
  hero: document.querySelector(".hero"),
  rosterScreen: document.querySelector("#roster-screen"),
  venueRosterScreen: document.querySelector("#venue-roster-screen"),
  rosterBackButton: document.querySelector("#roster-back-button"),
  venueRosterBackButton: document.querySelector("#venue-roster-back-button"),
  openingBandRoster: document.querySelector("#opening-band-roster"),
  openingVenueRoster: document.querySelector("#opening-venue-roster"),
  introScreen: document.querySelector("#intro-screen"),
  introTitle: document.querySelector("#intro-title"),
  introBody: document.querySelector("#intro-body"),
  introNextButton: document.querySelector("#intro-next-button"),
  gameScreen: document.querySelector("#game-screen"),
  phaseActionsPanel: document.querySelector(".phase-actions-panel"),
  mainGrid: document.querySelector(".main-grid"),
  sideColumn: document.querySelector(".side-column"),
  phaseActionExtra: document.querySelector("#phase-action-extra"),
  phaseActionStatus: document.querySelector("#phase-action-status"),
  venueName: document.querySelector("#venue-name"),
  venueMeta: document.querySelector("#venue-meta"),
  venueCards: document.querySelector("#venue-cards"),
  schedulePreview: document.querySelector("#schedule-preview"),
  assignmentGrid: document.querySelector("#assignment-grid"),
  cardsPanel: document.querySelector("#cards-panel"),
  auctionGrid: document.querySelector("#auction-grid"),
  standoutsPanel: document.querySelector("#standouts-panel"),
  advertisingPanel: document.querySelector("#advertising-panel"),
  topEarnersPanel: document.querySelector("#top-earners-panel"),
  resultsPanel: document.querySelector("#results-panel"),
  standings: document.querySelector("#standings"),
  workspaceNav: document.querySelector("#workspace-nav"),
  workspacePanels: Array.from(document.querySelectorAll(".workspace-panel")),
  cardsWorkspacePanel: document.querySelector('.workspace-panel[data-workspace="cards"]'),
  playerRoster: document.querySelector("#player-roster"),
  bandRosterGrid: document.querySelector("#band-roster-grid"),
  venueRosterGrid: document.querySelector("#venue-roster-grid"),
  bandsPanelEyebrow: document.querySelector("#bands-panel-eyebrow"),
  bandsPanelTitle: document.querySelector("#bands-panel-title"),
  photoModal: document.querySelector("#photo-modal"),
  photoModalClose: document.querySelector("#photo-modal-close"),
  photoModalImage: document.querySelector("#photo-modal-image"),
  photoModalFallback: document.querySelector("#photo-modal-fallback"),
  photoModalCaption: document.querySelector("#photo-modal-caption"),
  climateModal: document.querySelector("#climate-modal"),
  climateModalTitle: document.querySelector("#climate-modal-title"),
  climateModalDetail: document.querySelector("#climate-modal-detail"),
  climateModalBody: document.querySelector("#climate-modal-body"),
  climateModalClose: document.querySelector("#climate-modal-close"),
  bandRevealModal: document.querySelector("#band-reveal-modal"),
  bandRevealTitle: document.querySelector("#band-reveal-title"),
  bandRevealDetail: document.querySelector("#band-reveal-detail"),
  bandRevealBody: document.querySelector("#band-reveal-body"),
  bandRevealCard: document.querySelector("#band-reveal-card"),
  bandRevealClose: document.querySelector("#band-reveal-close"),
  runShowButton: document.querySelector("#run-show-button"),
  skipCardsButton: document.querySelector("#skip-cards-button"),
  nextRoundButton: document.querySelector("#next-round-button"),
};

function shuffled(list) {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function normalizeNotation(notation) {
  return notation.replace(/!/g, "1").replace(/\s+/g, "");
}

function parseDiceNotation(notation) {
  const normalized = normalizeNotation(notation);
  const match = normalized.match(/^(\d+)D([+-]\d+)?$/i);
  if (!match) {
    return null;
  }
  return {
    diceCount: Number(match[1]),
    modifier: Number(match[2] || 0),
    normalized,
  };
}

function parseDiceAverage(notation) {
  const parsed = parseDiceNotation(notation);
  if (!parsed) {
    return 0;
  }
  return Math.max(0, parsed.diceCount * 3.5 + parsed.modifier);
}

function parseDiceAverageSigned(notation) {
  const parsed = parseDiceNotation(notation);
  if (!parsed) {
    return 0;
  }
  return parsed.diceCount * 3.5 + parsed.modifier;
}

function parseDiceAverageSignedWithModifier(notation, modifierDelta = 0, diceDelta = 0) {
  const parsed = parseDiceNotation(notation);
  if (!parsed) {
    return 0;
  }

  const adjustedDiceCount = Math.max(0, parsed.diceCount + diceDelta);
  return adjustedDiceCount * 3.5 + parsed.modifier + modifierDelta;
}

function parseDiceMinSignedWithModifier(notation, modifierDelta = 0, diceDelta = 0) {
  const parsed = parseDiceNotation(notation);
  if (!parsed) {
    return 0;
  }

  const adjustedDiceCount = Math.max(0, parsed.diceCount + diceDelta);
  return adjustedDiceCount + parsed.modifier + modifierDelta;
}

function parseDiceMaxSignedWithModifier(notation, modifierDelta = 0, diceDelta = 0) {
  const parsed = parseDiceNotation(notation);
  if (!parsed) {
    return 0;
  }

  const adjustedDiceCount = Math.max(0, parsed.diceCount + diceDelta);
  return adjustedDiceCount * 6 + parsed.modifier + modifierDelta;
}

function formatAdjustedNotation(notation, modifierDelta = 0, diceDelta = 0) {
  const parsed = parseDiceNotation(notation);
  if (!parsed) {
    return normalizeNotation(notation);
  }

  const finalDiceCount = Math.max(0, parsed.diceCount + diceDelta);
  const finalModifier = parsed.modifier + modifierDelta;
  if (finalDiceCount === 0) {
    return finalModifier === 0 ? "0" : `${finalModifier}`;
  }
  if (finalModifier === 0) {
    return `${finalDiceCount}D`;
  }
  return `${finalDiceCount}D${finalModifier > 0 ? `+${finalModifier}` : finalModifier}`;
}

function rollNotation(notation) {
  const normalized = normalizeNotation(notation);
  const match = normalized.match(/^(\d+)D([+-]\d+)?$/i);
  if (!match) {
    return { total: 0, detail: normalized || "0" };
  }

  const diceCount = Number(match[1]);
  const modifier = Number(match[2] || 0);
  const rolls = Array.from({ length: diceCount }, () => 1 + Math.floor(Math.random() * 6));
  const signedTotal = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;
  const total = Math.max(0, signedTotal);
  const modifierText = modifier > 0 ? `+${modifier}` : modifier < 0 ? `${modifier}` : "";
  return { total, detail: `${rolls.join("+")}${modifierText}`, rolls, modifier, signedTotal };
}

function rollNotationSigned(notation) {
  const normalized = normalizeNotation(notation);
  const match = normalized.match(/^(\d+)D([+-]\d+)?$/i);
  if (!match) {
    return { total: 0, detail: normalized || "0" };
  }

  const diceCount = Number(match[1]);
  const modifier = Number(match[2] || 0);
  const rolls = Array.from({ length: diceCount }, () => 1 + Math.floor(Math.random() * 6));
  const total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;
  const modifierText = modifier > 0 ? `+${modifier}` : modifier < 0 ? `${modifier}` : "";
  return { total, detail: `${rolls.join("+")}${modifierText}`, rolls, modifier, signedTotal: total };
}

function rollNotationSignedWithModifier(notation, modifierDelta = 0, diceDelta = 0) {
  const parsed = parseDiceNotation(notation);
  if (!parsed) {
    return { total: 0, detail: normalizeNotation(notation) || "0" };
  }

  const diceCount = Math.max(0, parsed.diceCount + diceDelta);
  const modifier = parsed.modifier + modifierDelta;
  const rolls = Array.from({ length: diceCount }, () => 1 + Math.floor(Math.random() * 6));
  const total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;
  const modifierText = modifier > 0 ? `+${modifier}` : modifier < 0 ? `${modifier}` : "";
  const detail = rolls.length ? `${rolls.join("+")}${modifierText}` : `${modifier}`;
  return { total, detail, rolls, modifier, signedTotal: total };
}

function formatCash(value) {
  return `$${Math.round(value)}`;
}

function formatVictoryPoints(value) {
  return Number.isInteger(value) ? `${value}` : `${value.toFixed(1)}`;
}

function advertisingCost(value) {
  return value * ADVERTISING_COST_PER_POINT;
}

function createAdvertisingInventory() {
  return [...ADVERTISING_VALUES];
}

function genreParts(genreLabel) {
  return genreLabel
    .split("/")
    .map((part) => part.trim().toLowerCase().replace("&", "").replace(/\s+/g, ""))
    .map((part) => (part === "rb" ? "rnb" : part));
}

function genreFitScore(band, venue) {
  return genreParts(band.genre).reduce((total, key) => total + (venue[key] || 0), 0);
}

function formatGenreLabel(key) {
  return key === "rnb" ? "R&B" : key[0].toUpperCase() + key.slice(1);
}

function renderVenueFitGrid(venue, extraClass = "") {
  const classes = ["genre-grid", "genre-fit-list", extraClass].filter(Boolean).join(" ");
  return `
    <div class="${classes}">
      ${GENRE_KEYS.map((key) => {
        const fit = venue[key] || 0;
        const fitClass = fit > 0 ? "positive" : fit < 0 ? "negative" : "neutral";
        const value = `${fit >= 0 ? "+" : ""}${fit}`;
        return `<div class="genre-cell ${fitClass}"><span>${formatGenreLabel(key)}</span><strong>${value}</strong></div>`;
      }).join("")}
    </div>
  `;
}

function cloneBand(band) {
  return {
    name: band.name,
    genre: band.genre,
    popularity: band.popularity,
    scandal: band.scandal,
    retention: band.retention,
  };
}

function contractLoad(manager) {
  return manager.roster.reduce((total, band) => total + band.retention, 0);
}

function promoterLabel(name) {
  return name;
}

function slugifyAssetName(name) {
  return (name || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[.]/g, " ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function slugifyBandName(name) {
  return slugifyAssetName(name);
}

function bandPhotoPath(bandName) {
  return `/assets/world-tour/bands/${slugifyBandName(bandName)}.jpg`;
}

function promoterPhotoPath(manager) {
  const slug = manager?.photoSlug || slugifyAssetName(manager?.name || "guest-promoter");
  return `/assets/world-tour/promoters/${slug}.jpg`;
}

function promoterChoicePhotoPath(slug) {
  return `/assets/world-tour/promoters/${slug}.jpg`;
}

function venuePhotoPath(venueName) {
  return `/assets/world-tour/venues/${slugifyAssetName(venueName)}.jpg`;
}

function bandInitials(name) {
  const parts = (name || "")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .slice(0, 2);
  return parts.length ? parts.map((part) => part[0].toUpperCase()).join("") : "?";
}

function renderBandPhoto(bandName, className = "") {
  const photoPath = bandPhotoPath(bandName);
  const classes = ["band-photo", className].filter(Boolean).join(" ");
  return `
    <div class="${classes}" aria-label="${bandName}">
      <img src="${photoPath}" alt="${bandName}" loading="lazy" onerror="this.parentElement.classList.add('missing'); this.remove();">
      <div class="band-photo-fallback">
        <span>${bandInitials(bandName)}</span>
      </div>
    </div>
  `;
}

function renderVenuePhoto(venueName, className = "") {
  const photoPath = venuePhotoPath(venueName);
  const classes = ["venue-photo", className].filter(Boolean).join(" ");
  return `
    <div class="${classes}" aria-label="${venueName}">
      <img src="${photoPath}" alt="${venueName}" loading="lazy" onerror="this.parentElement.classList.add('missing'); this.remove();">
      <div class="venue-photo-fallback">
        <span>${bandInitials(venueName)}</span>
      </div>
    </div>
  `;
}

function renderBandRosterPhotoButton(bandName) {
  return `
    <button
      class="band-roster-photo-button"
      type="button"
      data-photo-open="${bandName}"
      data-photo-src="${bandPhotoPath(bandName)}"
      aria-label="View larger photo of ${bandName}"
    >
      ${renderBandPhoto(bandName, "band-roster-photo")}
    </button>
  `;
}

function renderPromoterPhoto(manager, className = "") {
  const photoPath = promoterPhotoPath(manager);
  const classes = ["promoter-photo", className].filter(Boolean).join(" ");
  return `
    <div class="${classes}" aria-label="${manager.name}">
      <img src="${photoPath}" alt="${manager.name}" loading="lazy" onerror="this.parentElement.classList.add('missing'); this.remove();">
      <div class="promoter-photo-fallback">
        <span>${bandInitials(manager.name)}</span>
      </div>
    </div>
  `;
}

function updatePlayerIconPicker() {
  const selected = els.playerIcon?.value || "gp";
  document.querySelectorAll("[data-player-icon-choice]").forEach((button) => {
    const choice = button.dataset.playerIconChoice;
    button.classList.toggle("selected", choice === selected);
    if (button.dataset.iconHydrated === "true") {
      return;
    }
    button.dataset.iconHydrated = "true";
    const src = promoterChoicePhotoPath(choice);
    button.innerHTML = `
      <span class="icon-picker-thumb">
        <img src="${src}" alt="${choice.toUpperCase()}" loading="lazy" onerror="this.parentElement.classList.add('missing'); this.remove();">
        <span class="icon-picker-fallback">${choice.toUpperCase()}</span>
      </span>
    `;
  });
}

function renderVenueRosterPhotoButton(venueName) {
  return `
    <button
      class="venue-roster-photo-button"
      type="button"
      data-photo-open="${venueName}"
      data-photo-src="${venuePhotoPath(venueName)}"
      aria-label="View larger photo of ${venueName}"
    >
      ${renderVenuePhoto(venueName, "venue-roster-photo")}
    </button>
  `;
}

function workspaceForPhase(phase) {
  if (phase === "card_cleanup") {
    return "cards";
  }
  if (phase === "week_off") {
    return "bands";
  }
  if (phase === "cards" || phase === "ready") {
    return "cards";
  }
  if (phase === "booking_fees") {
    return "results";
  }
  if (phase === "results") {
    return "results";
  }
  if (phase === "retention") {
    return "bands";
  }
  if (phase === "advertising") {
    return "results";
  }
  if (phase === "complete") {
    return "results";
  }
  if (phase === "auction") {
    return "auction";
  }
  return "this_week";
}

function phaseLabelFor(phase) {
  if (phase === "card_cleanup") {
    return "Card Cleanup";
  }
  if (phase === "week_off") {
    return "Week Off";
  }
  if (phase === "results" && state.showcase) {
    return "Showtime";
  }
  if (phase === "booking_fees") {
    return "Booking Fees";
  }
  if (phase === "cards") {
    return "Card Phase";
  }
  if (phase === "ready") {
    return "Show Ready";
  }
  if (phase === "results") {
    return "Round Results";
  }
  if (phase === "retention") {
    return "Retention";
  }
  if (phase === "advertising") {
    return "Advertising";
  }
  if (phase === "complete") {
    return "Tour Complete";
  }
  return "Auction Market";
}

function cardAudienceText(card) {
  if (card.type === "trend") {
    if (card.effect === "refund_booking_fee") {
      return "Play during any venue card window on one of your booked venues";
    }
    if (card.effect === "televised_concert") {
      return "Play during any venue card window on the current venue";
    }
    if (card.effect === "signing_bonus" || card.effect === "communism" || card.effect === "draw_cards" || card.effect === "steal_cards" || card.effect === "cash_attack" || card.effect === "special_guest_draw" || card.effect === "mega_concert" || card.effect === "tax_time" || card.effect === "music_fever" || card.effect === "recession" || card.effect === "charity_case" || card.effect === "music_trend") {
      return "Play during any venue card window";
    }
    return "Play during any venue card window";
  }
  if (card.type === "smash") {
    if (card.effect === "persistent_ad_agency") {
      return "Play on yourself to unlock a second advertising buy each round";
    }
    if (card.effect === "duet_persistent") {
      return "Play on your own venue lineup with both bands booked";
    }
    if (card.effect === "sit_out_boost_persistent") {
      return "Play on one of your own booked or already resting bands";
    }
    if (card.requiresSmashHit) {
      return "Play on one of your own bands that already has a Smash Hit";
    }
    return card.allowedGenres?.length
      ? `Play on your own ${card.allowedGenres.map((genre) => (genre === "rnb" ? "R&B" : genre.charAt(0).toUpperCase() + genre.slice(1))).join(" / ")} band`
      : "Play on your own band";
  }
  if (card.type === "bad_song") {
    if (card.effect === "feud") {
      return "Play on two acts in the same venue as one of your own booked acts";
    }
    if (card.effect === "dance_off") {
      return "Play on one of your booked acts and one opponent act in the same venue";
    }
    if (card.effect === "technical_difficulties") {
      return "Play on another promoter's booked band";
    }
    if (card.effect === "parking_lot_concert") {
      return "Play on another promoter's booked band";
    }
    if (card.effect === "benefit_concert") {
      return "Play on any booked band at the current venue";
    }
    return card.targetSelf ? "Play on one of your own booked bands" : "Play on another promoter's band";
  }
  if (card.type === "defense") {
    if (card.effect === "cancel_demands") {
      return "Use against Demands, or play later on one of your own bands that already has Demands";
    }
    return "";
  }
  return "Play on another promoter's band";
}

function isRoundLockedSelfBadSong(card) {
  return false;
}

function isRoundLockedGlobalTrend(card) {
  return false;
}

function isImmediatePlayAnytimeCard(card) {
  return false;
}

function immediateOpeningPriority(card) {
  switch (card?.effect) {
    case "music_fever":
      return 60;
    case "recession":
      return 50;
    case "mega_concert":
      return 40;
    case "biography":
      return 30;
    case "bad_promotion_idea":
      return 20;
    case "bad_sushi":
      return 10;
    default:
      return 0;
  }
}

function isImmediateOpeningSelfBadLuckCard(card) {
  return ["music_fever", "recession", "biography", "bad_promotion_idea", "bad_sushi"].includes(card?.effect);
}

function managerOpeningCardOpportunityUntouched(manager, roundData = currentRoundData()) {
  if (!manager || !roundData || activeVenueCardIndex() !== 0) {
    return false;
  }

  return !state.roundCardPlays.some((entry) => entry.managerId === manager.id && entry.cardName !== "Pass");
}

function immediatePlayPriorityForRound(manager, card, roundData = currentRoundData()) {
  return 0;
}

function requiredImmediateCard(manager, roundData = currentRoundData()) {
  return null;
}

function requiredImmediateOpeningBadLuckCard(manager, roundData = currentRoundData()) {
  const immediateCard = requiredImmediateCard(manager, roundData);
  if (!immediateCard || !isImmediateOpeningSelfBadLuckCard(immediateCard)) {
    return null;
  }
  return immediateCard;
}

function compactCardDescription(card) {
  if (card.type === "trend") {
    if (card.effect === "draw_cards") {
      return `Draw ${card.cardsToDraw || 3} new World Tour cards immediately.`;
    }
    if (card.effect === "music_fever") {
      return "All revenues are doubled this week. At round end, roll 2D. On 7+, it continues next week.";
    }
    if (card.effect === "recession") {
      return "All revenues are halved this week. At round end, roll 2D. On 7+, it continues next week.";
    }
    if (card.effect === "televised_concert") {
      return "Double the final payouts for every lineup at the current venue this week.";
    }
    if (card.effect === "refund_booking_fee") {
      return "Refund this week's booking fee at one of your booked venues.";
    }
    if (card.effect === "tax_time") {
      return "Everyone pays double retention after this week's performances.";
    }
    if (card.effect === "cash_attack") {
      return "Target opponent loses half their money or $30, whichever is less.";
    }
    if (card.effect === "steal_cards") {
      return "Take one random World Tour Card from each other promoter.";
    }
    if (card.effect === "signing_bonus") {
      return `All promoters gain ${formatCash(card.cashBonus || 50)}.`;
    }
    if (card.effect === "communism") {
      return "All cash is pooled and redistributed evenly.";
    }
    if (card.effect === "special_guest_draw") {
      return "Draw the top band and add it to one of your already-booked venues this week as a Special Guest.";
    }
    if (card.effect === "mega_concert") {
      return "Every promoter draws one band and adds it as a Special Guest to one unresolved venue they already have booked.";
    }
    return `${card.subtitle} bands gain +${card.modifier || 0} Popularity this week.`;
  }
  if (card.type === "smash") {
    if (card.effect === "persistent_ad_agency") {
      return "You may advertise twice each advertising phase, even twice in the same venue.";
    }
    if (card.effect === "duet_persistent") {
      return `Both artists in that venue lineup gain +${card.modifier || 0} Popularity for the rest of the game.`;
    }
    if (card.effect === "sit_out_boost_persistent") {
      return `Target band misses this week, then gains +${card.modifier || 0} Popularity for the rest of the game.`;
    }
    if (card.requiresSmashHit) {
      return `Choose one of your bands with a Smash Hit. It gains +${card.modifier || 0} Popularity for the rest of the game.`;
    }
    return card.effect === "persistent_scandal_adjustment"
      ? `Adjusts scandal factor by ${formatScandalAdjustmentDelta(card.scandalModifier || 0, card.scandalDiceModifier || 0)}.`
      : `Popularity ${formatCardEffectDelta(card.modifier || 0, card.popularityDice || 0)}${card.allowedGenres?.length ? ` for ${card.allowedGenres.map((genre) => (genre === "rnb" ? "R&B" : genre.charAt(0).toUpperCase() + genre.slice(1))).join(" / ")}` : ""}${card.effect === "persistent_smash" ? " each turn" : ""}.`;
  }
  if (card.type === "bad_song") {
    if (card.effect === "remove_smash_hits") {
      return "Removes all Smash Hits from the target band.";
    }
    if (card.effect === "biography") {
      return "Must be played immediately on one of your booked bands. Roll 1D: 1-3 gives -4 Popularity, 4-6 gives +2 for the rest of the game.";
    }
    if (card.effect === "feud") {
      return "Choose two acts in the same venue as one of your own acts. Each rolls 1D: 5-6 gives +2 this week, 1-4 gives -2 this week.";
    }
    if (card.effect === "dance_off") {
      return "Choose one of your booked acts and one opponent act in the same venue. Each rolls 2D. The higher total gets +5 this week only. A tie changes nothing.";
    }
    if (card.effect === "argument_duo") {
      return "Target venue lineup with two bands. Both acts take -2 this week.";
    }
    if (card.effect === "bad_promotion_idea") {
      return "Must be played immediately on your strongest booked headliner this round. That act scores 0 this week.";
    }
    if (card.effect === "bad_sushi") {
      return "Must be played immediately on one of your booked bands this round. That act scores 0 this week.";
    }
    if (card.effect === "contract_negotiations") {
      return "Target headliner pays 2x retention or misses this week's show.";
    }
    if (card.effect === "technical_difficulties") {
      return "Target band's popularity roll is cut in half this week.";
    }
    if (card.effect === "parking_lot_concert") {
      return "Target band's full popularity contribution is cut in half this week.";
    }
    if (card.effect === "benefit_concert") {
      return "Target band gets +10 Popularity this week, but earns no revenue.";
    }
    if (card.effect === "miss_this_week") {
      return "Target act stays booked but scores 0 this week.";
    }
    return `${card.targetSelf ? "Hurts one of your booked bands." : "Hurts an opponent's booked band."} Popularity ${formatCardEffectDelta(-(card.flatPenalty || 0), card.popularityDice || 0)}${card.effect === "bad_song_persistent" || card.effect === "bad_song_persistent_discard_smash" || card.effect === "bad_song_until_week_off" ? " each turn" : ""}.`.trim();
  }
  if (card.type === "defense") {
    if (card.effect === "super_lawyer") {
      return "Clears one active rumor or scandal and blocks future rumor or scandal attacks.";
    }
    if (card.effect === "cancel_demands") {
      return "Cancels a Demands card, or clears one existing Demands effect from your own band.";
    }
    return "Cancels a rumor or scandal.";
  }
  if (card.type === "scandal" || card.type === "rumor") {
    if (card.effect === "flat_penalty") {
      return `Flat -${card.flatPenalty || 2} penalty this venue.`;
    }
    if (card.effect === "persistent_scandal" || card.effect === "persistent_scandal_double" || card.effect === "persistent_bust") {
      return "This scandal can carry into future rounds.";
    }
    return "Roll scandal factor against the target.";
  }
  return card.description;
}

const STANDALONE_BOOST_TITLES = new Set([
  "Counseling",
  "New Line Dance Craze",
  "Pyrotechnics",
  "Broadway!",
  "Backup Dancers",
  "Honey Bear",
  "Patriotism",
  "Battle Of The Bands",
  "Political Career",
  "Video Star",
  "Bobblehead Dolls",
  "Good Review",
]);

function cardDisplayHeading(card) {
  if (card.name === "Smash Hit" && STANDALONE_BOOST_TITLES.has(card.subtitle || "")) {
    return {
      heading: card.subtitle || card.name,
      subtitle: "",
    };
  }

  return {
    heading: card.name,
    subtitle: card.subtitle || "",
  };
}

function renderFullCard(card, options = {}) {
  const {
    targets = [],
    playable = false,
    showControls = true,
    footer = "",
    descriptionOverride = "",
    hideAudience = false,
    extraClass = "",
    fullText = false,
  } = options;
  const autoSelectSingleTarget = targets.length === 1;
  const descriptionText = descriptionOverride || card.description;
  const display = cardDisplayHeading(card);
  const audienceText = hideAudience ? "" : cardAudienceText(card);

  return `
    <div class="tour-card ${extraClass} ${fullText ? "full-text-card" : ""}">
      <strong>${display.heading}</strong>
      ${display.subtitle ? `<p class="card-subtitle">${display.subtitle}</p>` : ""}
      ${isRoundLockedSelfBadSong(card) ? `<p class="card-flash-note">Use This Round</p>` : ""}
      <p>${descriptionText}</p>
      ${audienceText ? `<p class="card-meta">${audienceText}</p>` : ""}
      ${showControls ? `<select class="assignment-select ${autoSelectSingleTarget ? "hidden" : ""}" data-card-target="${card.id}" ${!playable ? "disabled" : ""}>
        <option value="" ${autoSelectSingleTarget ? "" : "selected"}>Choose target</option>
        ${targets.join("")}
      </select>` : ""}
      ${showControls ? `<button type="button" class="secondary-button play-card-button" data-play-card="${card.id}" ${!playable ? "disabled" : ""}>Play Card</button>` : ""}
      ${footer ? `<div class="card-footer">${footer}</div>` : ""}
    </div>
  `;
}

function cardTitleText(card) {
  const display = cardDisplayHeading(card);
  return `${display.heading}${display.subtitle ? `, ${display.subtitle}` : ""}`;
}

function describeCardPlay(manager, card, targetManager, venueType, targetBandName, extraTargetBandName = "") {
  if (card.type === "trend") {
    if (card.effect === "draw_cards") {
      return `${manager.name} played ${cardTitleText(card)} and drew ${card.cardsToDraw || 3} new World Tour cards.`;
    }
    if (card.effect === "music_fever") {
      return `${manager.name} played ${cardTitleText(card)}. All payouts are doubled this week across the whole tour.`;
    }
    if (card.effect === "recession") {
      return `${manager.name} played ${cardTitleText(card)}. All payouts are cut in half this week across the whole tour.`;
    }
    if (card.effect === "televised_concert") {
      return `${manager.name} played ${cardTitleText(card)} on ${venueType}. Final payouts at that venue are doubled this week.`;
    }
    if (card.effect === "refund_booking_fee") {
      return `${manager.name} played ${cardTitleText(card)} on ${venueType}. That venue's booking fee is refunded this week.`;
    }
    if (card.effect === "tax_time") {
      return `${manager.name} played ${cardTitleText(card)}. All promoters must pay double retention after this week's performances.`;
    }
    if (card.effect === "cash_attack") {
      return `${manager.name} played ${cardTitleText(card)} on ${targetManager.name}. They lost half their money or ${formatCash(30)}, whichever was less.`;
    }
    if (card.effect === "charity_case") {
      return `${manager.name} played ${cardTitleText(card)} on ${targetManager.name}. The standings leader must hand over one band of their choice.`;
    }
    if (card.effect === "steal_cards") {
      return `${manager.name} played ${cardTitleText(card)} and stole one World Tour Card from each other promoter.`;
    }
    if (card.effect === "signing_bonus") {
      return `${manager.name} played ${cardTitleText(card)}. All promoters gain ${formatCash(card.cashBonus || 50)}.`;
    }
    if (card.effect === "communism") {
      return `${manager.name} played ${cardTitleText(card)}. All promoters pooled their cash and redistributed it evenly.`;
    }
    if (card.effect === "special_guest_draw") {
      return `${manager.name} played ${cardTitleText(card)} on ${venueType}. A new band was drawn from the deck and added there as a Special Guest for a free first show.`;
    }
    if (card.effect === "mega_concert") {
      return `${manager.name} played ${cardTitleText(card)}. Every promoter draws a band and places it as a Special Guest in standings order.`;
    }
    const genreNames = (card.trendGenres || [])
      .map((genre) => (genre === "rnb" ? "R&B" : genre.charAt(0).toUpperCase() + genre.slice(1)))
      .join(" and ");
    return `${manager.name} played ${cardTitleText(card)}. ${genreNames} bands gain +${card.modifier || 0} Popularity this week.`;
  }
  const bandLabel = extraTargetBandName
    ? `${targetBandName} and ${extraTargetBandName}`
    : targetBandName || "that band";

  if (card.effect === "venue_snowstorm") {
    return `${manager.name} played ${cardTitleText(card)} on ${venueType}. The venue is snowed in this week unless a promoter has Snow Tires.`;
  }
  if (card.effect === "venue_snow_tires") {
    return `${manager.name} played ${cardTitleText(card)} for ${venueType}. Their lineup can still reach the venue if a snowstorm hits.`;
  }

  if (card.type === "smash") {
    if (card.effect === "persistent_ad_agency") {
      return `${manager.name} played ${cardTitleText(card)}. They can now advertise twice each advertising phase.`;
    }
    if (card.effect === "duet_persistent") {
      return `${manager.name} played ${cardTitleText(card)} on ${targetManager.name}'s ${bandLabel}. Popularity +${card.modifier || 0} to both acts for the rest of the game.`;
    }
    if (card.effect === "sit_out_boost_persistent") {
      return `${manager.name} played ${cardTitleText(card)} on ${targetManager.name}'s ${bandLabel}. That band misses this week and returns at +${card.modifier || 0} Popularity for the rest of the game.`;
    }
    if (card.effect === "persistent_scandal_adjustment") {
      return `${manager.name} played ${cardTitleText(card)} on ${targetManager.name}'s ${bandLabel}. Scandal factor ${formatScandalAdjustmentDelta(card.scandalModifier || 0, card.scandalDiceModifier || 0)}.`;
    }
    return `${manager.name} played ${cardTitleText(card)} on ${targetManager.name}'s ${bandLabel}. Popularity ${formatCardEffectDelta(card.modifier || 0, card.popularityDice || 0)}${card.effect === "persistent_smash" ? " each turn" : ""}.`;
  }
  if (card.type === "bad_song") {
    if (card.effect === "remove_smash_hits") {
      return `${manager.name} played ${cardTitleText(card)} on ${targetManager.name}'s ${bandLabel}. All Smash Hits on that band were discarded.`;
    }
    if (card.effect === "biography") {
      return `${manager.name} played ${cardTitleText(card)} on ${targetManager.name}'s ${bandLabel}. The biography result will stay with that band for the rest of the game.`;
    }
    if (card.effect === "feud") {
      return `${manager.name} played ${cardTitleText(card)} on ${targetManager.name}'s ${bandLabel}. Each targeted act rolls 1D for a +2 or -2 swing this week.`;
    }
    if (card.effect === "dance_off") {
      return `${manager.name} played ${cardTitleText(card)} on ${targetManager.name}'s ${bandLabel}. Each act rolls 2D, and the higher total gets +5 this week.`;
    }
    if (card.effect === "argument_duo") {
      return `${manager.name} played ${cardTitleText(card)} on ${targetManager.name}'s ${bandLabel}. Both acts take -2 this week.`;
    }
    if (card.effect === "bad_promotion_idea") {
      return `${manager.name} played ${cardTitleText(card)} on ${targetManager.name}'s ${bandLabel}. That headliner misses this week's show.`;
    }
    if (card.effect === "bad_sushi") {
      return `${manager.name} played ${cardTitleText(card)} on ${targetManager.name}'s ${bandLabel}. That act misses this week's show.`;
    }
    if (card.effect === "contract_negotiations") {
      return `${manager.name} played ${cardTitleText(card)} on ${targetManager.name}'s ${bandLabel}. That headliner must pay double retention or miss this week's show.`;
    }
    if (card.effect === "technical_difficulties") {
      return `${manager.name} played ${cardTitleText(card)} on ${targetManager.name}'s ${bandLabel}. That band's popularity roll is cut in half this week.`;
    }
    if (card.effect === "parking_lot_concert") {
      return `${manager.name} played ${cardTitleText(card)} on ${targetManager.name}'s ${bandLabel}. That band's full popularity contribution is cut in half this week.`;
    }
    if (card.effect === "benefit_concert") {
      return `${manager.name} played ${cardTitleText(card)} on ${targetManager.name}'s ${bandLabel}. That band gets +10 Popularity this week but earns no revenue.`;
    }
    if (card.effect === "miss_this_week") {
      return `${manager.name} played ${cardTitleText(card)} on ${targetManager.name}'s ${bandLabel}. That act misses this week's show.`;
    }
    return `${manager.name} played ${cardTitleText(card)} on ${targetManager.name}'s ${bandLabel}. Popularity ${formatCardEffectDelta(-(card.flatPenalty || 0), card.popularityDice || 0)}${card.effect === "bad_song_persistent" || card.effect === "bad_song_persistent_discard_smash" || card.effect === "bad_song_until_week_off" ? " each turn" : ""}.`;
  }
  if (card.type === "scandal" || card.type === "rumor") {
    const scandalText =
      card.effect === "persistent_scandal" || card.effect === "persistent_bust"
        ? "A scandal effect will keep carrying over."
        : "A scandal effect will hit during the show.";
    return `${manager.name} played ${cardTitleText(card)} on ${targetManager.name}'s ${bandLabel}. ${scandalText}`;
  }
  return `${manager.name} played ${cardTitleText(card)} on ${targetManager.name}'s ${bandLabel}.`;
}

function findCardTemplateByName(cardName, cardSubtitle = "") {
  return CARD_TEMPLATES.find(
    (template) => template.name === cardName && (template.subtitle || "") === (cardSubtitle || "")
  ) || null;
}

function cardRecordDisplay(play) {
  const template = findCardTemplateByName(play.cardName, play.cardSubtitle || "");
  return {
    id: `play-${play.managerId || "system"}-${play.cardName}-${play.cardSubtitle || "base"}-${play.venueType || "all"}-${play.bandName || "none"}`,
    name: play.cardName,
    subtitle: play.cardSubtitle || "",
    type: play.cardType || template?.type || "system",
    effect: play.effect || template?.effect || "system",
    modifier: play.modifier ?? template?.modifier ?? 0,
    cardsToDraw: play.cardsToDraw ?? template?.cardsToDraw ?? 0,
    cardsToSteal: play.cardsToSteal ?? template?.cardsToSteal ?? 0,
    cashBonus: play.cashBonus ?? template?.cashBonus ?? 0,
    popularityDice: play.popularityDice ?? template?.popularityDice ?? 0,
    flatPenalty: play.flatPenalty ?? template?.flatPenalty ?? 0,
    scandalModifier: play.scandalModifier ?? template?.scandalModifier ?? 0,
    scandalDiceModifier: play.scandalDiceModifier ?? template?.scandalDiceModifier ?? 0,
    description: play.cardDescription || template?.description || "This card was played earlier this round.",
  };
}

function storedCardLabel(entry, fallback = "Card") {
  return entry.subtitle || entry.cardSubtitle || entry.cardName || fallback;
}

function playTargetsBand(play, manager, band, venue) {
  if (!band || !venue) {
    return false;
  }

  if (play.venueType === venue.type && (play.bandName === band.name || play.pairedBandName === band.name)) {
    if (play.targetManagerId) {
      return play.targetManagerId === manager.id;
    }
    if (play.targetManagerName) {
      return play.targetManagerName === manager.name;
    }
  }

  if (play.effect === "music_trend" && play.venueType === "all") {
    const template = findCardTemplateByName(play.cardName, play.cardSubtitle || "");
    return Boolean(
      template?.trendGenres?.some((genre) => genreParts(band.genre).includes(genre))
    );
  }

  return false;
}

function venueCardSwingForBand(managerId, venueType, band) {
  if (!band) {
    return { flat: 0, dice: 0, label: "0" };
  }

  const roundBonus = cardModifierFor(managerId, venueType, band);
  const persistentSmash = persistentSmashSummary(managerId, band);
  const roundBadSong = roundBadSongSummary(managerId, venueType, band);
  const persistentBadSong = persistentBadSongSummary(managerId, band);
  const flat = roundBonus + persistentSmash.bonus - roundBadSong.penalty - persistentBadSong.penalty;
  const dice = (persistentSmash.diceBonus || 0) + (roundBadSong.diceModifier || 0) + (persistentBadSong.diceModifier || 0);

  return {
    flat,
    dice,
    label: formatCardEffectDelta(flat, dice),
  };
}

function summarizeBandAction(play) {
  const displayCard = cardRecordDisplay(play);
  const title = cardTitleText(displayCard);

  if (displayCard.name === "Pass") {
    return null;
  }

  if (displayCard.effect === "display_only") {
    return {
      line: `${title} by ${play.managerName}: ${play.statusText || "Stopped before it landed."}`,
      kind: "system",
    };
  }

  if (displayCard.effect === "music_trend") {
    return {
      line: `${title} by ${play.managerName}: ${signedNumberLabel(displayCard.modifier || 0)}`,
      kind: (displayCard.modifier || 0) >= 0 ? "bonus" : "penalty",
    };
  }
  if (displayCard.effect === "music_fever") {
    return {
      line: play.statusText
        ? `${title} by ${play.managerName}: ${play.statusText}`
        : `${title} by ${play.managerName}: all payouts doubled`,
      kind: play.statusText ? "system" : "bonus",
    };
  }
  if (displayCard.effect === "recession") {
    return {
      line: play.statusText
        ? `${title} by ${play.managerName}: ${play.statusText}`
        : `${title} by ${play.managerName}: all payouts halved`,
      kind: play.statusText ? "system" : "penalty",
    };
  }
  if (displayCard.effect === "televised_concert") {
    return {
      line: `${title} by ${play.managerName}: payouts doubled at ${play.bandName || play.venueType}`,
      kind: "bonus",
    };
  }
  if (displayCard.effect === "draw_cards") {
    return {
      line: `${title} by ${play.managerName}: drew ${displayCard.cardsToDraw || 3} cards`,
      kind: "support",
    };
  }
  if (displayCard.effect === "cash_attack") {
    return {
      line: `${title} by ${play.managerName}: ${play.targetManagerName} lost cash`,
      kind: "penalty",
    };
  }
  if (displayCard.effect === "contract_negotiations") {
    return {
      line: `${title} by ${play.managerName}: target headliner pays double retention or misses the show`,
      kind: "penalty",
    };
  }
  if (displayCard.effect === "steal_cards") {
    return {
      line: `${title} by ${play.managerName}: stole 1 card from each other promoter`,
      kind: "support",
    };
  }
  if (displayCard.effect === "signing_bonus") {
    return {
      line: `${title} by ${play.managerName}: everyone gains ${formatCash(displayCard.cashBonus || 50)}`,
      kind: "support",
    };
  }
  if (displayCard.effect === "communism") {
    return {
      line: `${title} by ${play.managerName}: all cash redistributed evenly`,
      kind: "support",
    };
  }
  if (displayCard.effect === "persistent_ad_agency") {
    return {
      line: `${title} by ${play.managerName}: ${play.targetManagerName} can advertise twice each turn`,
      kind: "support",
    };
  }
  if (displayCard.effect === "swiss_bank_account") {
    return {
      line: `${title} by ${play.managerName}: kept personal cash during Communism`,
      kind: "support",
    };
  }

  if (displayCard.type === "smash") {
    if (displayCard.effect === "persistent_scandal_adjustment") {
      return {
        line: `${title} by ${play.managerName}: scandal ${signedNumberLabel(displayCard.scandalModifier || 0)}`,
        kind: "support",
      };
    }
    return {
      line: `${title} by ${play.managerName}: ${formatCardEffectDelta(displayCard.modifier || 0, displayCard.popularityDice || 0)} popularity`,
      kind: (displayCard.modifier || 0) >= 0 || (displayCard.popularityDice || 0) > 0 ? "bonus" : "penalty",
    };
  }

  if (displayCard.type === "bad_song") {
    if (displayCard.effect === "remove_smash_hits") {
      return {
        line: `${title} by ${play.managerName}: Smash Hits discarded`,
        kind: "penalty",
      };
    }
    return {
      line: `${title} by ${play.managerName}: ${formatCardEffectDelta(-(displayCard.flatPenalty || 0), displayCard.popularityDice || 0)} popularity`,
      kind: "penalty",
    };
  }

  if (displayCard.type === "scandal" || displayCard.type === "rumor") {
    if (displayCard.effect === "flat_penalty") {
      return {
        line: `${title} by ${play.managerName}: scandal flat -${displayCard.flatPenalty || 2}`,
        kind: "scandal",
      };
    }
    if (displayCard.effect === "persistent_scandal" || displayCard.effect === "persistent_bust" || displayCard.effect === "persistent_scandal_double") {
      return {
        line: `${title} by ${play.managerName}: scandal carries over`,
        kind: "scandal",
      };
    }
    if (displayCard.effect === "scandal_roll_double_if_second") {
      return {
        line: `${title} by ${play.managerName}: doubles if another scandal lands`,
        kind: "scandal",
      };
    }
    return {
      line: `${title} by ${play.managerName}: scandal roll`,
      kind: "scandal",
    };
  }

  return {
    line: `${title} by ${play.managerName}`,
    kind: "system",
  };
}

function buildVenueActionEntries(roundData, venue, plays) {
  const queueEntries = state.managers
    .flatMap((manager, originalManagerIndex) =>
      getAssignedBandEntries(manager, venue.type).map((bookingEntry, bookingIndex) => {
        const band = getBandByName(manager, bookingEntry.bandName);
        const actions = plays
          .map((play, playIndex) => {
            if (!playTargetsBand(play, manager, band, venue)) {
              return null;
            }
            const summary = summarizeBandAction(play);
            if (!summary) {
              return null;
            }
            return {
              ...summary,
              playIndex,
            };
          })
          .filter(Boolean)
          .sort((a, b) => b.playIndex - a.playIndex);
        const lastActionIndex = actions[0]?.playIndex ?? -1;
        const ongoing = band ? ongoingEffectsSummary(manager.id, band.name) : "";
        return {
          manager,
          band,
          slotKey: bookingEntry.key,
          slotLabel: bookingEntry.label,
          actions,
          lastActionIndex,
          originalIndex: originalManagerIndex * 10 + bookingIndex,
          cardSwing: band ? venueCardSwingForBand(manager.id, venue.type, band) : { flat: 0, dice: 0, label: "0" },
          activeScandals: band ? activeScandalCountForBand(manager.id, venue.type, band) : 0,
          ongoing,
        };
      })
    )
    .sort((a, b) => b.lastActionIndex - a.lastActionIndex || a.originalIndex - b.originalIndex);

  const topActionIndex = Math.max(...queueEntries.map((entry) => entry.lastActionIndex), -1);
  return queueEntries.map((entry) => ({
    ...entry,
    isLatest: topActionIndex >= 0 && entry.lastActionIndex === topActionIndex,
  }));
}

function renderJustPlayedSpotlight(play, emptyMessage) {
  if (!play) {
    return `<div class="cards-queue-empty">${emptyMessage}</div>`;
  }

  if (play.cardName === "Pass") {
    return `<div class="cards-queue-empty">${play.footerText || `${play.managerName} passed.`}</div>`;
  }

  const displayCard = cardRecordDisplay(play);
  return `
    <div class="cards-spotlight-card">
      <div class="cards-queue-heading-row">
        <strong>Just Played</strong>
        <span>The full card shows once, then drops into the band log.</span>
      </div>
      ${renderFullCard(displayCard, {
        showControls: false,
        hideAudience: true,
        descriptionOverride: displayCard.description,
        extraClass: "queue-card spotlight-card",
        footer: play.statusText || play.footerText || "This card just resolved.",
      })}
    </div>
  `;
}

function renderVenueActionBoard(roundData, venue, plays, options = {}) {
  const { emptyMessage = "No actions on this venue yet.", title = "Band Action Queue", subtitle = "Latest affected band moves to the top." } = options;
  const entries = buildVenueActionEntries(roundData, venue, plays);
  const hasAnyActions = entries.some((entry) => entry.actions.length);

  return `
    <div class="band-action-board">
      <div class="cards-queue-heading-row">
        <strong>${title}</strong>
        <span>${subtitle}</span>
      </div>
      ${
        !hasAnyActions
          ? `<div class="cards-queue-empty">${emptyMessage}</div>`
          : `<div class="band-action-grid">
              ${entries
                .map((entry) => `
                  <article class="band-action-card ${entry.isLatest ? "active" : ""}">
                    <div class="band-action-top">
                      <div class="band-action-copy">
                        <strong>${entry.band ? entry.band.name : "No band booked"}</strong>
                        <p>${entry.manager.name}${entry.slotKey !== HEADLINER_SLOT ? ` • ${entry.slotLabel}` : ""}</p>
                      </div>
                      <div class="band-action-chips">
                        <span class="chip">Cards ${entry.cardSwing.label}</span>
                        ${entry.activeScandals ? `<span class="chip">Scandals ${entry.activeScandals}</span>` : ""}
                      </div>
                    </div>
                    ${
                      entry.actions.length
                        ? `<div class="band-action-list">
                            ${entry.actions.map((action) => `<div class="band-action-line ${action.kind}">${action.line}</div>`).join("")}
                          </div>`
                        : `<div class="band-action-empty">No actions on this band yet.</div>`
                    }
                    ${entry.ongoing ? `<div class="band-action-ongoing">Ongoing: ${entry.ongoing}</div>` : ""}
                  </article>
                `)
                .join("")}
            </div>`
      }
    </div>
  `;
}

function bandVoiceProfile(band) {
  const lowerName = band.name.toLowerCase();
  const bandSignals = ["the ", "&", "boys", "friends", "crew", "society", "co.", "band", "rebellion", "muses", "prissies", "fraulines"];
  const bandOverrides = ["runaway train", "miles from home", "greek salad", "declined", "malice in wonderland", "shock therapy", "shades of pastel"];
  const personLike = !bandSignals.some((signal) => lowerName.includes(signal)) && !bandOverrides.some((signal) => lowerName.includes(signal));
  const maleOverrides = ["bambee reese"];
  const femaleOverrides = ["a-mac", "ladiva", "milana", "angel sweet", "glacier", "viper grrl", "sunshine summers"];

  if (!personLike) {
    return {
      subject: "they",
      subjectCap: "They",
      object: "them",
      possessive: "their",
      noun: "this band",
      be: "are",
    };
  }

  if (maleOverrides.some((signal) => lowerName.includes(signal))) {
    return {
      subject: "he",
      subjectCap: "He",
      object: "him",
      possessive: "his",
      noun: "this artist",
      be: "is",
    };
  }

  const likelyFemale = lowerName.includes("miss ") || femaleOverrides.some((signal) => lowerName.includes(signal));
  return likelyFemale
    ? {
        subject: "she",
        subjectCap: "She",
        object: "her",
        possessive: "her",
        noun: "this artist",
        be: "is",
      }
    : {
        subject: "he",
        subjectCap: "He",
        object: "him",
        possessive: "his",
        noun: "this artist",
        be: "is",
      };
}

function bandProfileSummary(band) {
  const voice = bandVoiceProfile(band);
  const scandalAverage = parseDiceAverageSigned(band.scandal);
  const popularityAverage = parseDiceAverage(band.popularity);
  const multiGenre = genreParts(band.genre).length > 1;
  const scandalRead =
    scandalAverage >= 7
      ? [
          `${voice.subjectCap} ${voice.be} exactly the kind of act tabloids would love to sink their teeth into. With a scandal rating of ${band.scandal}, one bad week could get ugly fast.`,
          `The scandal side of ${voice.object} ${voice.be} volatile. At ${band.scandal}, a rumor or scandal card could hit ${voice.object} hard if the press gets a clean shot.`,
          `A lot of danger is baked into a scandal rating of ${band.scandal}. If trouble lands on ${voice.object}, the fallout could be brutal.`,
        ][Math.abs(slugifyBandName(band.name).length) % 3]
      : scandalAverage >= 4
        ? [
            `${voice.subjectCap} ${voice.be} not scandal-proof by any means. A rating of ${band.scandal} means the press can still rough ${voice.object} up if ${voice.subject} slips.`,
            `With a scandal rating of ${band.scandal}, ${voice.subject} ${voice.be} vulnerable enough that a well-timed rumor could still do real damage.`,
            `${voice.subjectCap} lives in that middle ground where scandal cards matter. ${band.scandal} is enough to make trouble worth respecting.`,
          ][(slugifyBandName(band.name).charCodeAt(0) || 0) % 3]
        : [
            `${voice.subjectCap} ${voice.be} relatively steady on the scandal side. At ${band.scandal}, scandal cards are less scary here than they are against a truly volatile act.`,
            `The good news is that ${voice.subject} ${voice.be} fairly resistant to tabloid nonsense. ${band.scandal} keeps the damage in check more often than not.`,
            `Scandal pressure is lighter here. A rating of ${band.scandal} makes ${voice.object} a safer hold than many flashier acts.`,
          ][(slugifyBandName(band.name).charCodeAt(slugifyBandName(band.name).length - 1) || 0) % 3];

  const valueRead =
    popularityAverage <= 2 && band.retention <= 5 && scandalAverage >= 5
      ? [
          `${voice.subjectCap} starts from a weak popularity base, but the contract is cheap enough that ${voice.subject} could become a real bargain if ${voice.subject} lands a smash hit or two. The danger is that ${voice.possessive} scandal rating makes ${voice.object} a risky long-term hold.`,
          `${voice.subjectCap} looks like a low-floor, high-chaos pickup: cheap to keep, easy to improve, but dangerous enough that one scandal could wipe out the bargain value.`,
          `There is upside here because the retention cost is tiny, but ${voice.subject} ${voice.be} balancing that against a scandal profile risky enough to blow up the investment.`,
        ][band.retention % 3]
      : popularityAverage <= 2 && band.retention <= 5
        ? [
            `${voice.subjectCap} will not scare anyone on day one, but ${voice.subject} could turn into a strong bargain piece if ${voice.subject} catches the right smash hit.`,
            `${voice.subjectCap} ${voice.be} the kind of cheap act who can quietly become useful if the right card support shows up.`,
            `On raw numbers ${voice.subject} looks modest, but the low retention bill gives ${voice.object} real bargain potential if ${voice.subject} starts to build momentum.`,
          ][band.retention % 3]
        : scandalAverage >= 5 && band.retention <= 5
          ? [
              `${voice.subjectCap} ${voice.be} risky because of the scandal profile, but the low retention cost means ${voice.subject} ${voice.be} still easy to justify if ${voice.subject} stays out of trouble.`,
              `Cheap contracts forgive a lot, and that is what keeps ${voice.object} interesting despite the danger hanging over ${voice.possessive} scandal rating.`,
              `${voice.subjectCap} ${voice.be} a gamble: inexpensive to keep, but volatile enough that ${voice.subject} can swing from value play to liability in a hurry.`,
            ][scandalAverage % 3]
          : popularityAverage >= 12 && band.retention >= 20
            ? [
                `${voice.subjectCap} comes in as one of the heavy hitters in the whole game. In x2 and especially x3 venues, ${voice.subject} can generate huge money, but the contract is expensive enough that ${voice.subject} needs big nights to justify it.`,
                `${voice.subjectCap} already has star-level numbers, and that gives ${voice.object} enormous earning power in the right venue. The flip side is that ${voice.possessive} retention bill demands results.`,
                `This ${voice.noun} brings serious ceiling. Put ${voice.object} in high-payout rooms and ${voice.subject} can change the board, but that price tag means every quiet week hurts more.`,
              ][band.retention % 3]
            : band.retention >= 18
              ? [
                  `${voice.subjectCap} already carries a premium contract, so ${voice.subject} needs to feel like a featured act instead of a bench piece.`,
                  `At this retention cost, ${voice.subject} needs regular use and strong venues to earn ${voice.possessive} keep.`,
                  `${voice.subjectCap} expects real money every round, so the promoter who signs ${voice.object} needs a plan for putting ${voice.object} to work.`,
                ][band.retention % 3]
              : band.retention <= 5
                ? [
                    `${voice.subjectCap} ${voice.be} inexpensive to keep around, which makes ${voice.object} easier to develop patiently.`,
                    `The cheap contract is a real selling point here. ${voice.subjectCap} can sit on a roster without putting much pressure on your cash.`,
                    `${voice.subjectCap} ${voice.be} easy on the wallet, and that alone can make ${voice.object} a useful depth piece while you wait for the right week.`,
                  ][band.retention % 3]
                : popularityAverage >= 8
                  ? [
                      `${voice.subjectCap} already has enough raw popularity to matter right away if the venues line up.`,
                      `There is real immediate value here. ${voice.subjectCap} can start making noise without needing too much help.`,
                      `${voice.subjectCap} ${voice.be} already strong enough to become relevant quickly if ${voice.subject} catches the right room.`,
                    ][Math.floor(popularityAverage) % 3]
                  : [
                      `${voice.subjectCap} feels more like a steady builder than an instant star, but there is enough here to grow into a dependable act.`,
                      `This looks like the sort of ${voice.noun} that rewards patience, planning, and a little luck.`,
                      `${voice.subjectCap} may not jump off the page at first, but ${voice.subject} could become a dependable workhorse with the right support.`,
                    ][Math.floor(popularityAverage + band.retention) % 3];

  const versatilityRead = multiGenre
    ? [
        `${voice.subjectCap} works across more than one genre, which gives ${voice.object} extra flexibility and makes ${voice.object} easier to slot into different venue types.`,
        `Because ${voice.subject} crosses genres, ${voice.subject} ${voice.be} less dependent on one exact kind of room than a narrower act would be.`,
        `Multi-genre versatility makes booking decisions a lot easier over a long stretch of rounds.`,
      ][genreParts(band.genre).length % 3]
    : [
        `${voice.subjectCap} ${voice.be} more specialized, so venue fit will matter a lot when you decide where to book ${voice.object}.`,
        `${voice.subjectCap} leans into one lane, which means the right venue matters a lot more for ${voice.object}.`,
        `Because ${voice.subject} ${voice.be} genre-specific, ${voice.subject} needs the right room more than a broader act would.`,
      ][Math.floor(popularityAverage + scandalAverage) % 3];

  const strategicRead = [
    `${versatilityRead} ${scandalRead}`,
    `${scandalRead} ${versatilityRead}`,
    `${versatilityRead} That means the promoter who signs ${voice.object} will want to think carefully about matchups and timing.`,
    `${scandalRead} Booking strategy matters here, because the right room can change how useful ${voice.subject} feels in a hurry.`,
  ][(slugifyBandName(band.name).length + Math.floor(popularityAverage)) % 4];

  const infoRead = [
    "This roster card is ready for added lore, special notes, and deeper strategy details as you build them out.",
    "There is room here for more backstory, house rules, and extra notes once you start fleshing the act out.",
    "This slot can grow into a deeper scouting note with lore, signature songs, and matchup notes later on.",
    "As the roster develops, this section can hold custom lore, special abilities, and any table notes you want to track.",
  ][(slugifyBandName(band.name).charCodeAt(0) || 0) % 4];

  return {
    voice,
    scandalAverage,
    popularityAverage,
    multiGenre,
    scandalRead,
    valueRead,
    versatilityRead,
    strategicRead,
    infoRead,
  };
}

function isFemaleAct(band) {
  const lowerName = band.name.toLowerCase();
  const maleOverrides = ["bambee reese"];
  const femaleSignals = [
    "miss ",
    "a-mac",
    "dead ballet society",
    "declined",
    "jensing",
    "ladiva",
    "milana",
    "rusty rebellion",
    "shades of pastel",
    "shock therapy",
    "stonehenge blues co.",
    "tiffany ringwald",
    "angel sweet",
    "glacier",
    "viper grrl",
    "sunshine summers",
    "the fraulines",
    "the prissies",
    "the muses",
  ];

  if (maleOverrides.some((signal) => lowerName.includes(signal))) {
    return false;
  }

  return femaleSignals.some((signal) => lowerName.includes(signal));
}

function aiBandBidMultiplier(manager, band) {
  if (manager?.name === "Romeo Tiramisu") {
    return isFemaleAct(band) ? 1.2 : 0.96;
  }
  return 1;
}

function promoterBandBias(manager, band) {
  if (manager.name === "Romeo Tiramisu") {
    return isFemaleAct(band) ? 10 : -3;
  }
  return 0;
}

function aiPromoterProfile(manager) {
  const strategy = manager?.strategy || "";
  if (strategy === "showman") {
    return {
      auctionValueScale: 1.06,
      earlyAuctionScale: state.round <= 2 ? 0.92 : 1,
      reserveMultiplier: 0.88,
      expensiveBandTaxMultiplier: 0.82,
      cheapContestFloorScale: 1.1,
      raiseWindowModifier: 1,
      pressureBias: 1.04,
      cashWeight: 1.05,
      oneVenuePenaltyScale: 1.1,
      noPaidVenuePenaltyScale: 1,
      focusedVenueLimit: 2,
      expansionThreshold: 6,
      stackOpenerBonus: 3,
    };
  }

  if (strategy === "selective") {
    return {
      auctionValueScale: 0.94,
      earlyAuctionScale: state.round <= 2 ? 0.74 : 0.96,
      reserveMultiplier: 1.14,
      expensiveBandTaxMultiplier: 1.1,
      cheapContestFloorScale: 0.9,
      raiseWindowModifier: -1,
      pressureBias: 0.93,
      cashWeight: 1.28,
      oneVenuePenaltyScale: state.round <= 2 ? 0.65 : 0.9,
      noPaidVenuePenaltyScale: state.round <= 2 ? 0.45 : 0.8,
      focusedVenueLimit: state.round <= 1 ? 1 : 2,
      expansionThreshold: 9,
      stackOpenerBonus: 7,
    };
  }

  if (strategy === "focused") {
    return {
      auctionValueScale: 0.84,
      earlyAuctionScale: state.round <= 1 ? 0.6 : state.round === 2 ? 0.68 : 0.92,
      reserveMultiplier: 1.38,
      expensiveBandTaxMultiplier: 1.35,
      cheapContestFloorScale: 0.72,
      raiseWindowModifier: -2,
      pressureBias: 0.86,
      cashWeight: 1.45,
      oneVenuePenaltyScale: state.round <= 2 ? 0.25 : 0.75,
      noPaidVenuePenaltyScale: state.round <= 2 ? 0.15 : 0.65,
      focusedVenueLimit: state.round <= 2 ? 1 : 2,
      expansionThreshold: 11,
      stackOpenerBonus: 10,
    };
  }

  return {
    auctionValueScale: 1,
    earlyAuctionScale: 1,
    reserveMultiplier: 1,
    expensiveBandTaxMultiplier: 1,
    cheapContestFloorScale: 1,
    raiseWindowModifier: 0,
    pressureBias: 1,
    cashWeight: 1.2,
    oneVenuePenaltyScale: 1,
    noPaidVenuePenaltyScale: 1,
    focusedVenueLimit: 3,
    expansionThreshold: 7,
    stackOpenerBonus: 0,
  };
}

function preferredEarlyVenueCommitment(manager, roster = [], venuesForRound = []) {
  const profile = aiPromoterProfile(manager);
  if (manager?.isPlayer || state.round > 2) {
    return venuesForRound.length || 0;
  }

  const baseLimit = Math.min(profile.focusedVenueLimit, venuesForRound.length || profile.focusedVenueLimit);
  if (roster.length >= 5 && profile.focusedVenueLimit < 2) {
    return Math.min(2, venuesForRound.length || 2);
  }
  if (roster.length >= 4 && profile.focusedVenueLimit < 2 && state.round === 2) {
    return Math.min(2, venuesForRound.length || 2);
  }
  return Math.max(1, baseLimit);
}

function currentRoundData() {
  return state.schedule[state.round - 1] || null;
}

function selectedRoundData() {
  const roundNumber = state.selectedPreviewRound || state.round;
  return state.schedule.find((round) => round.roundNumber === roundNumber) || currentRoundData();
}

function upcomingRounds() {
  return state.schedule.slice(Math.max(0, state.round - 1), Math.max(0, state.round - 1) + PREVIEW_ROUNDS);
}

function visibleFutureRounds() {
  return state.schedule.slice(state.round, state.round + PREVIEW_ROUNDS);
}

function advertisingTargetKey(roundNumber, venueType) {
  return `${roundNumber}|${venueType}`;
}

function decodeAdvertisingTarget(targetKey) {
  const [roundNumberText, venueType] = String(targetKey || "").split("|");
  const roundNumber = Number(roundNumberText);
  if (!roundNumber || !venueType) {
    return null;
  }
  return { roundNumber, venueType };
}

function isAdvertisingRevealed(placement) {
  return (placement?.targetRoundNumber || 0) <= state.round;
}

function advertisingPlacementsForVenue(roundNumber, venueType) {
  return state.advertisingPlacements.filter(
    (placement) => placement.targetRoundNumber === roundNumber && placement.venueType === venueType
  );
}

function managerAdvertisingPlacementsForVenue(managerId, roundNumber, venueType) {
  return advertisingPlacementsForVenue(roundNumber, venueType).filter((placement) => placement.managerId === managerId);
}

function advertisingBonusForVenue(managerId, roundNumber, venueType) {
  return managerAdvertisingPlacementsForVenue(managerId, roundNumber, venueType).reduce((sum, placement) => sum + placement.value, 0);
}

function visibleAdvertisingBonusForVenue(managerId, roundNumber, venueType, viewerManagerId = "") {
  return managerAdvertisingPlacementsForVenue(managerId, roundNumber, venueType).reduce((sum, placement) => {
    return sum + (isAdvertisingRevealed(placement) || placement.managerId === viewerManagerId ? placement.value : 0);
  }, 0);
}

function advertisingPlacementsThisRound(managerId, roundNumber = state.round) {
  return state.advertisingPlacements.filter(
    (placement) => placement.managerId === managerId && placement.placedRoundNumber === roundNumber
  );
}

function managerHasAdvertisingAgency(managerId) {
  return state.persistentPromoterEffects.some(
    (entry) => entry.targetManagerId === managerId && entry.effect === "persistent_ad_agency"
  );
}

function advertisingPlacementLimit(managerOrId) {
  const managerId = typeof managerOrId === "string" ? managerOrId : managerOrId?.id;
  if (!managerId) {
    return ADVERTISING_PLACEMENTS_PER_ROUND;
  }
  return managerHasAdvertisingAgency(managerId)
    ? ADVERTISING_PLACEMENTS_WITH_AGENCY
    : ADVERTISING_PLACEMENTS_PER_ROUND;
}

function advertisingTilesForManager(manager) {
  return [...(manager?.advertisingInventory || [])].sort((left, right) => left - right);
}

function futureAdvertisingVenueOptions(manager) {
  return visibleFutureRounds().flatMap((round) =>
    round.venues
      .filter(
        (venue) =>
          managerAdvertisingPlacementsForVenue(manager.id, round.roundNumber, venue.type).length < MAX_ADVERTISING_PER_VENUE
      )
      .map((venue) => ({
        key: advertisingTargetKey(round.roundNumber, venue.type),
        roundNumber: round.roundNumber,
        venue,
      }))
  );
}

function canManagerPlaceAdvertising(manager, value, targetKey) {
  const target = decodeAdvertisingTarget(targetKey);
  if (!manager || !target || state.phase !== "advertising") {
    return false;
  }
  if (advertisingPlacementsThisRound(manager.id).length >= advertisingPlacementLimit(manager)) {
    return false;
  }
  if (!manager.advertisingInventory?.includes(value) || manager.cash < advertisingCost(value)) {
    return false;
  }
  const options = futureAdvertisingVenueOptions(manager);
  return options.some((option) => option.key === targetKey);
}

function advertisingMarkersForVenue(roundNumber, venueType, viewerManagerId = "player") {
  return state.managers
    .map((manager) => {
      const placements = managerAdvertisingPlacementsForVenue(manager.id, roundNumber, venueType);
      if (!placements.length) {
        return "";
      }
      const visibleToViewer = placements.every((placement) => isAdvertisingRevealed(placement) || placement.managerId === viewerManagerId);
      const label = visibleToViewer
        ? placements.map((placement) => `+${placement.value}`).join(" ")
        : `${placements.length} hidden`;
      return `${manager.name}: ${label}`;
    })
    .filter(Boolean);
}

function activeVenueCardIndex() {
  return Math.max(0, Math.min(state.currentVenueCardIndex || 0, ROUND_VENUE_ORDER.length - 1));
}

function activeVenueForCards(roundData = currentRoundData()) {
  if (!roundData) {
    return null;
  }
  return roundData.venues[activeVenueCardIndex()] || null;
}

function activeVenueTypeForCards(roundData = currentRoundData()) {
  return activeVenueForCards(roundData)?.type || "";
}

function totalFitAcrossRound(band, venuesForRound) {
  return venuesForRound.reduce((sum, venue) => sum + genreFitScore(band, venue), 0);
}

function averageFutureFit(band, rounds) {
  if (!rounds.length) {
    return 0;
  }
  return rounds.reduce((sum, round) => sum + totalFitAcrossRound(band, round.venues), 0) / rounds.length;
}

function bestFutureRoundForBand(band, rounds) {
  if (!rounds.length) {
    return null;
  }

  return rounds
    .map((round) => ({
      roundNumber: round.roundNumber,
      totalFit: totalFitAcrossRound(band, round.venues),
      strongestVenue: round.venues
        .map((venue) => ({ venue, fit: genreFitScore(band, venue) }))
        .sort((a, b) => b.fit - a.fit)[0],
    }))
    .sort((a, b) => b.totalFit - a.totalFit)[0];
}

function getBandByName(manager, bandName) {
  return manager.roster.find((band) => band.name === bandName) || null;
}

function bandsSittingOutThisRound(managerId) {
  return state.currentRoundWeekOffBands?.[managerId] || [];
}

function bandIsSittingOutThisRound(managerId, bandName) {
  return bandsSittingOutThisRound(managerId).includes(bandName);
}

function availableRosterForRound(manager, options = {}) {
  const excludedNames = new Set(options.excludeBandNames || []);
  bandsSittingOutThisRound(manager?.id).forEach((bandName) => excludedNames.add(bandName));
  return (manager?.roster || []).filter((band) => !excludedNames.has(band.name));
}

function weekOffEffectsForBand(managerId, bandName) {
  return state.persistentBadSongs.filter(
    (entry) =>
      entry.targetManagerId === managerId &&
      entry.bandName === bandName &&
      entry.effect === "bad_song_until_week_off"
  );
}

function weekOffPromptBandsForManager(manager) {
  if (!manager) {
    return [];
  }

  return availableRosterForRound(manager)
    .filter((band) => weekOffEffectsForBand(manager.id, band.name).length > 0)
    .map((band) => ({
      band,
      effects: weekOffEffectsForBand(manager.id, band.name),
    }));
}

function missThisWeekTargetsForManager(manager, roundData = currentRoundData()) {
  if (!manager || !roundData) {
    return [];
  }

  const targets = [];
  const added = new Set();
  manager.roster.forEach((band) => {
    const assignment = findBandAssignment(manager, band.name, roundData);
    const sittingOut = bandIsSittingOutThisRound(manager.id, band.name);
    const benched = !assignment && !sittingOut;

    const key = `${manager.id}|${band.name}`;
    if (added.has(key)) {
      return;
    }
    added.add(key);
    targets.push({
      managerId: manager.id,
      managerName: manager.name,
      venueType: assignment?.venueType || (sittingOut ? "week_off" : "bench"),
      slotKey: assignment?.slotKey || "",
      slotLabel: assignment?.slotLabel || (sittingOut ? "Sitting Out" : "On Bench"),
      multiplier: assignment?.multiplier || 0,
      bandName: band.name,
      isSittingOut: sittingOut,
      isBenched: benched,
    });
  });

  return targets;
}

function removeBandFromRoundAssignments(manager, bandName, roundData = currentRoundData()) {
  if (!manager || !bandName || !roundData) {
    return null;
  }

  const assignment = findBandAssignment(manager, bandName, roundData);
  if (!assignment) {
    return null;
  }

  setManagerAssignment(manager, assignment.venueType, assignment.slotKey, "", roundData);
  return assignment;
}

function markBandSittingOutThisRound(managerId, bandName) {
  if (!managerId || !bandName) {
    return;
  }

  const current = new Set(state.currentRoundWeekOffBands?.[managerId] || []);
  current.add(bandName);
  state.currentRoundWeekOffBands = {
    ...(state.currentRoundWeekOffBands || {}),
    [managerId]: [...current],
  };
}

function clearWeekOffEffectsForBand(manager, bandName) {
  const removed = [];
  state.persistentBadSongs = state.persistentBadSongs.filter((entry) => {
    const matches =
      entry.targetManagerId === manager.id &&
      entry.bandName === bandName &&
      entry.effect === "bad_song_until_week_off";
    if (matches) {
      removed.push(entry);
      return false;
    }
    return true;
  });
  return removed;
}

function chooseAiWeekOffBands(manager, roundData) {
  if (!manager || !roundData) {
    return [];
  }

  return weekOffPromptBandsForManager(manager)
    .filter(({ band, effects }) => {
      const penalty = effects.reduce((sum, entry) => sum + (entry.flatPenalty || 0), 0);
      const bestActiveValue = roundData.venues.reduce((best, venue) => {
        const projected = projectedSlotRevenue(band, venue, HEADLINER_SLOT);
        return Math.max(best, projected);
      }, 0);
      const restedRoster = availableRosterForRound(manager, { excludeBandNames: [band.name] });
      const restedCoverage = restedRoster.length >= ROUND_VENUE_ORDER.length;
      return (penalty >= 5 && restedCoverage) || (penalty >= 3 && restedCoverage && bestActiveValue <= 6);
    })
    .map(({ band }) => band.name);
}

function initializeWeekOffChoices(roundData) {
  state.pendingWeekOffChoices = Object.fromEntries(
    state.managers.map((manager) => [
      manager.id,
      manager.isPlayer ? [] : chooseAiWeekOffBands(manager, roundData),
    ])
  );
}

function startRoundAuctionFlow() {
  const roundData = currentRoundData();
  if (!roundData) {
    return;
  }

  state.phase = "auction";
  state.activeWorkspace = "this_week";
  state.activeSidebarView = "this_week";
  initializeAssignments(roundData);
  state.managers.forEach((manager) => {
    chooseBestAssignments(manager, roundData.venues);
  });
  logEvent(`Round ${state.round} revealed: ${roundData.venues.map((venue) => `${venue.type}:${venue.name}`).join(" • ")}.`);
  logCurrentRoundAdvertisingReveal();
  logEvent("Take a look at this week's schedule and current band values before the one-at-a-time auction reveal starts.");
  logNextAuctionReveal();
  render();
}

function finalizeWeekOffChoices() {
  state.currentRoundWeekOffBands = Object.fromEntries(
    state.managers.map((manager) => [manager.id, [...new Set(state.pendingWeekOffChoices[manager.id] || [])]])
  );

  state.managers.forEach((manager) => {
    const sittingOutBands = state.currentRoundWeekOffBands[manager.id] || [];
    sittingOutBands.forEach((bandName) => {
      const removedEffects = clearWeekOffEffectsForBand(manager, bandName);
      if (removedEffects.length) {
        logEvent(
          `${manager.name} gave ${bandName} the week off. ${removedEffects.map((entry) => entry.subtitle).join(", ")} cleared.`
        );
      }
    });
  });

  state.pendingWeekOffChoices = {};
  startRoundAuctionFlow();
}

function beginWeekOffChoicePhase(roundData) {
  initializeWeekOffChoices(roundData);
  const player = state.managers[0];
  if (weekOffPromptBandsForManager(player).length) {
    state.phase = "week_off";
    state.activeWorkspace = "bands";
    state.activeSidebarView = "your_bands";
    state.selectedPromoterId = "player";
    render();
    return;
  }

  finalizeWeekOffChoices();
}

function togglePlayerWeekOffChoice(bandName, shouldSitOut) {
  if (state.phase !== "week_off") {
    return;
  }

  const current = new Set(state.pendingWeekOffChoices.player || []);
  if (shouldSitOut) {
    current.add(bandName);
  } else {
    current.delete(bandName);
  }
  state.pendingWeekOffChoices.player = [...current];
  render();
}

function emptyVenueBooking(headliner = "", opener = "", specialGuest = "") {
  const normalizedSpecialGuest = specialGuest || "";
  const booking = {
    headliner: headliner || "",
    opener: opener || "",
    specialGuest: normalizedSpecialGuest,
    [SPECIAL_GUEST_SLOT]: normalizedSpecialGuest,
  };
  if (!booking.headliner && booking.opener) {
    booking.headliner = booking.opener;
    booking.opener = "";
  }
  return booking;
}

function bookingBandNameForSlot(booking, slotKey) {
  if (!booking) {
    return "";
  }
  if (slotKey === SPECIAL_GUEST_SLOT) {
    return booking.specialGuest || booking[SPECIAL_GUEST_SLOT] || "";
  }
  return booking[slotKey] || "";
}

function setBookingBandNameForSlot(booking, slotKey, bandName) {
  if (!booking) {
    return;
  }
  const normalizedBandName = bandName || "";
  if (slotKey === SPECIAL_GUEST_SLOT) {
    booking.specialGuest = normalizedBandName;
    booking[SPECIAL_GUEST_SLOT] = normalizedBandName;
    return;
  }
  booking[slotKey] = normalizedBandName;
}

function normalizeVenueBooking(booking) {
  if (!booking) {
    return emptyVenueBooking();
  }
  if (typeof booking === "string") {
    return emptyVenueBooking(booking);
  }
  return emptyVenueBooking(
    booking.headliner,
    booking.opener,
    booking.specialGuest || booking[SPECIAL_GUEST_SLOT]
  );
}

function getVenueBooking(manager, venueType) {
  return normalizeVenueBooking(manager?.assignments?.[venueType]);
}

function ensureVenueBooking(manager, venueType) {
  manager.assignments[venueType] = normalizeVenueBooking(manager.assignments[venueType]);
  return manager.assignments[venueType];
}

function normalizeManagerAssignments(manager, roundData = currentRoundData()) {
  const venueTypes = roundData?.venues?.map((venue) => venue.type) || Object.keys(manager.assignments || {});
  venueTypes.forEach((venueType) => {
    manager.assignments[venueType] = normalizeVenueBooking(manager.assignments[venueType]);
  });
}

function getAssignedBandName(manager, venueType, slotKey = HEADLINER_SLOT) {
  return bookingBandNameForSlot(getVenueBooking(manager, venueType), slotKey);
}

function getAssignedBandEntries(manager, venueType) {
  const booking = getVenueBooking(manager, venueType);
  return VENUE_BAND_SLOTS
    .map((slot) => ({
      ...slot,
      bandName: bookingBandNameForSlot(booking, slot.key),
    }))
    .filter((entry) => entry.bandName);
}

function getAllAssignedBandNames(manager, roundData = currentRoundData()) {
  const venueTypes = roundData?.venues?.map((venue) => venue.type) || Object.keys(manager?.assignments || {});
  return venueTypes.flatMap((venueType) => getAssignedBandEntries(manager, venueType).map((entry) => entry.bandName));
}

function venueHasBooking(manager, venueType) {
  return getAssignedBandEntries(manager, venueType).length > 0;
}

function venueBookingCount(manager, venueType) {
  return getAssignedBandEntries(manager, venueType).length;
}

function clearVenueBooking(manager, venueType) {
  manager.assignments[venueType] = emptyVenueBooking();
}

function findBandAssignment(manager, bandName, roundData = currentRoundData()) {
  if (!manager || !bandName) {
    return null;
  }

  const venueTypes = roundData?.venues?.map((venue) => venue.type) || Object.keys(manager.assignments || {});
  for (const venueType of venueTypes) {
    const booking = getVenueBooking(manager, venueType);
    for (const slot of VENUE_BAND_SLOTS) {
      if (bookingBandNameForSlot(booking, slot.key) === bandName) {
        return {
          venueType,
          slotKey: slot.key,
          slotLabel: slot.label,
          multiplier: slot.multiplier,
          bandName,
        };
      }
    }
  }

  return null;
}

function setManagerAssignment(manager, venueType, slotKey, bandName, roundData = currentRoundData()) {
  normalizeManagerAssignments(manager, roundData);
  const venueTypes = roundData?.venues?.map((venue) => venue.type) || Object.keys(manager.assignments || {});

  if (bandName) {
    venueTypes.forEach((type) => {
      const booking = ensureVenueBooking(manager, type);
      VENUE_BAND_SLOTS.forEach((slot) => {
        if (bookingBandNameForSlot(booking, slot.key) === bandName) {
          setBookingBandNameForSlot(booking, slot.key, "");
        }
      });
      if (!booking.headliner && booking.opener) {
        booking.headliner = booking.opener;
        booking.opener = "";
      }
    });
  }

  const booking = ensureVenueBooking(manager, venueType);
  const targetSlotKey = slotKey === OPENER_SLOT && !booking.headliner && bandName
    ? HEADLINER_SLOT
    : slotKey;
  setBookingBandNameForSlot(booking, targetSlotKey, bandName || "");

  if (!booking.headliner && booking.opener) {
    booking.headliner = booking.opener;
    booking.opener = "";
  }
}

function addOverflowVenueBand(manager, venueType, bandName, options = {}, roundData = currentRoundData()) {
  if (!manager || !venueType || !bandName) {
    return null;
  }

  normalizeManagerAssignments(manager, roundData);
  const venueTypes = roundData?.venues?.map((venue) => venue.type) || Object.keys(manager.assignments || {});
  venueTypes.forEach((type) => {
    const booking = ensureVenueBooking(manager, type);
    VENUE_BAND_SLOTS.forEach((slot) => {
      if (bookingBandNameForSlot(booking, slot.key) === bandName) {
        setBookingBandNameForSlot(booking, slot.key, "");
      }
    });
    if (!booking.headliner && booking.opener) {
      booking.headliner = booking.opener;
      booking.opener = "";
    }
  });

  const booking = ensureVenueBooking(manager, venueType);
  setBookingBandNameForSlot(booking, SPECIAL_GUEST_SLOT, bandName);
  return {
    slotKey: SPECIAL_GUEST_SLOT,
    slotLabel: slotDisplayLabel(SPECIAL_GUEST_SLOT),
    multiplier: VENUE_SLOT_LOOKUP[SPECIAL_GUEST_SLOT]?.multiplier || 1,
    venueType,
    venueName: options.venueName || "",
    bandName,
  };
}

function setBandWeekOffStatus(managerId, bandName, shouldSitOut) {
  if (!managerId || !bandName) {
    return;
  }

  const current = new Set(state.currentRoundWeekOffBands?.[managerId] || []);
  if (shouldSitOut) {
    current.add(bandName);
  } else {
    current.delete(bandName);
  }
  state.currentRoundWeekOffBands = {
    ...(state.currentRoundWeekOffBands || {}),
    [managerId]: [...current],
  };
}

function standingsOrderedManagers(managers = state.managers) {
  return [...managers].sort((left, right) =>
    right.victoryPoints - left.victoryPoints ||
    right.cash - left.cash ||
    left.name.localeCompare(right.name)
  );
}

function unresolvedVenueTypes(roundData = currentRoundData()) {
  const startIndex = Math.max(0, activeVenueCardIndex());
  return ROUND_VENUE_ORDER.slice(startIndex).filter((venueType) =>
    roundData?.venues?.some((venue) => venue.type === venueType)
  );
}

function specialGuestVenueTargetsForManager(manager, roundData = currentRoundData(), options = {}) {
  if (!manager || !roundData?.venues?.length) {
    return [];
  }

  const unresolvedTypes = new Set(unresolvedVenueTypes(roundData));
  return roundData.venues
    .filter((venue) =>
      unresolvedTypes.has(venue.type) &&
      venueHasBooking(manager, venue.type) &&
      !getAssignedBandName(manager, venue.type, SPECIAL_GUEST_SLOT)
    )
    .map((venue) => ({
      managerId: manager.id,
      managerName: manager.name,
      venueType: venue.type,
      slotKey: SPECIAL_GUEST_SLOT,
      slotLabel: "Venue",
      bandName: options.useVenueNameAsBandName === false ? "" : venue.name,
      venueName: venue.name,
    }));
}

function charityCaseBandChoices(leader, recipient, roundData = currentRoundData()) {
  if (!leader || !recipient || leader.id === recipient.id) {
    return [];
  }

  const unresolvedTypes = new Set(unresolvedVenueTypes(roundData));
  return leader.roster
    .map((band) => {
      const assignment = findBandAssignment(leader, band.name, roundData);
      const venue = assignment ? roundData?.venues?.find((entry) => entry.type === assignment.venueType) : null;
      const isSittingOut = (state.currentRoundWeekOffBands?.[leader.id] || []).includes(band.name);
      const isBookedAtUnresolvedVenue = Boolean(assignment && unresolvedTypes.has(assignment.venueType));
      const bookedAndTransferable = Boolean(
        isBookedAtUnresolvedVenue &&
        !getAssignedBandName(recipient, assignment.venueType, SPECIAL_GUEST_SLOT)
      );

      if (isBookedAtUnresolvedVenue && !bookedAndTransferable) {
        return null;
      }

      return {
        managerId: leader.id,
        managerName: leader.name,
        venueType: bookedAndTransferable ? assignment.venueType : (isSittingOut ? "week_off" : assignment ? "roster" : "bench"),
        slotKey: assignment?.slotKey || "",
        slotLabel: bookedAndTransferable
          ? assignment?.slotLabel || "Lineup"
          : isSittingOut
            ? "Sitting Out"
            : assignment
              ? "Already Performed"
              : "On Bench",
        bandName: band.name,
        venueName: venue?.name || "",
        isSittingOut,
        isBenched: !assignment && !isSittingOut,
        becomesSpecialGuest: bookedAndTransferable,
      };
    })
    .filter(Boolean);
}

function charityCaseLeaderForManager(manager, roundData = currentRoundData()) {
  const leader = standingsOrderedManagers()[0] || null;
  if (!leader || leader.id === manager.id) {
    return null;
  }
  return charityCaseBandChoices(leader, manager, roundData).length ? leader : null;
}

function chooseCharityCaseBandForManager(leader, recipient, roundData = currentRoundData()) {
  const futureRounds = visibleFutureRounds();
  const choices = charityCaseBandChoices(leader, recipient, roundData);
  if (!choices.length) {
    return null;
  }

  return choices
    .map((choice) => {
      const band = getBandByName(leader, choice.bandName);
      const venue = choice.becomesSpecialGuest
        ? roundData?.venues?.find((entry) => entry.type === choice.venueType)
        : null;
      const leaderLoss = venue && band
        ? Math.max(0, buildEstimatedVenuePerformance(leader, venue, band, choice.slotKey)?.weightedRevenue || 0)
        : 0;
      const rivalGift = venue && band
        ? Math.max(0, buildEstimatedVenuePerformance(recipient, venue, band, SPECIAL_GUEST_SLOT)?.weightedRevenue || 0)
        : 0;
      const futureValue = band ? Math.max(0, projectedBandValueAcrossPreview(band, futureRounds)) * 0.06 : 0;
      const sittingOutDiscount = choice.isSittingOut ? 20 : choice.isBenched ? 12 : 0;
      const score =
        leaderLoss * 1.2 +
        rivalGift * 1.45 +
        futureValue +
        (venue?.venuePoints || 0) * 2.2 -
        sittingOutDiscount -
        Math.max(0, 10 - (band?.retention || 0)) * 0.4;
      return { choice, score };
    })
    .sort((left, right) => left.score - right.score || left.choice.bandName.localeCompare(right.choice.bandName))[0]
    ?.choice || null;
}

function finalizeCharityCaseTransfer(manager, leader, card, bandName, roundData = currentRoundData()) {
  const choice = charityCaseBandChoices(leader, manager, roundData).find((entry) => entry.bandName === bandName);
  const band = getBandByName(leader, bandName);
  if (!choice || !band) {
    return false;
  }

  removeBandFromRoundAssignments(leader, bandName, roundData);
  setBandWeekOffStatus(leader.id, bandName, false);
  leader.roster = leader.roster.filter((entry) => entry.name !== bandName);
  manager.roster.push(band);

  if (choice.isSittingOut && !choice.becomesSpecialGuest) {
    markBandSittingOutThisRound(manager.id, bandName);
  }
  if (choice.becomesSpecialGuest) {
    addOverflowVenueBand(manager, choice.venueType, bandName, {
      venueName: choice.venueName || "",
    }, roundData);
  }

  const footerText = choice.becomesSpecialGuest
    ? `${manager.name} played ${cardTitleText(card)} on ${leader.name}. ${leader.name} surrendered ${bandName}, and it joined ${manager.name} at ${choice.venueType}: ${choice.venueName || "this venue"} as a Special Guest.`
    : `${manager.name} played ${cardTitleText(card)} on ${leader.name}. ${leader.name} surrendered ${bandName}, and it joined ${manager.name}'s roster.`;

  state.roundCardPlays.push({
    managerId: manager.id,
    managerName: manager.name,
    cardName: card.name,
    cardSubtitle: card.subtitle || "",
    cardType: card.type,
    cardDescription: card.description,
    effect: card.effect,
    modifier: 0,
    popularityDice: 0,
    flatPenalty: 0,
    targetManagerId: leader.id,
    targetManagerName: leader.name,
    venueType: choice.venueType,
    targetSlotKey: choice.slotKey,
    bandName,
    footerText,
    statusText: choice.becomesSpecialGuest ? `${bandName} moved as a Special Guest.` : `${bandName} changed promoters.`,
  });
  state.lastCardActionText = footerText;
  logEvent(footerText);

  if (choice.becomesSpecialGuest) {
    openBandRevealAlert(
      `${manager.name} Acquires SPECIAL GUEST ${bandName}`,
      `${leader.name} gave up ${bandName}, and the act now joins ${manager.name} at ${choice.venueType}: ${choice.venueName || "this venue"} as a Special Guest this week.`,
      band,
      "Transferred by Charity Case as a full-strength Special Guest",
      choice.venueName || ""
    );
  }

  return true;
}

function bestSpecialGuestVenueTarget(manager, band, roundData = currentRoundData()) {
  const targets = specialGuestVenueTargetsForManager(manager, roundData);
  if (!targets.length || !band) {
    return null;
  }

  return targets
    .map((target) => {
      const venue = roundData.venues.find((entry) => entry.type === target.venueType);
      const ownEstimate = venue ? estimatedVenueStrength(manager, venue, roundData) : { popularity: 0, revenue: 0 };
      const leaderScore = venue
        ? Math.max(...state.managers.map((candidate) => estimatedVenueStrength(candidate, venue, roundData).popularity || 0))
        : 0;
      const gapToLead = Math.max(0, leaderScore - (ownEstimate.popularity || 0));
      const closenessBonus = gapToLead <= 8 ? (9 - gapToLead) * 3.2 : 0;
      const fitBonus = venue ? Math.max(0, genreFitScore(band, venue)) * 4 : 0;
      const revenueBonus = venue ? Math.max(0, projectedSlotRevenue(band, venue, SPECIAL_GUEST_SLOT)) * 1.5 : 0;
      const premiumVenueBonus = venue ? venue.revenueFactor * 8 + venue.venuePoints * 2.5 : 0;
      const score = closenessBonus + fitBonus + revenueBonus + premiumVenueBonus;
      return { ...target, score };
    })
    .sort((left, right) => right.score - left.score)[0] || null;
}

function currentMegaConcertEntry() {
  const pending = state.pendingMegaConcert;
  if (!pending?.entries?.length) {
    return null;
  }
  return pending.entries[pending.index] || null;
}

function finishMegaConcertPlacements() {
  const pending = state.pendingMegaConcert;
  state.pendingMegaConcert = null;
  if (!pending) {
    return;
  }

  state.lastCardActionText = "Mega Concert placements are complete. Card play continues.";
  state.activeCardManagerId = pending.resumeCardManagerId || "";
  if (!state.activeCardManagerId) {
    completeCardPhase();
    return;
  }
  if (state.phase === "cards" && state.activeCardManagerId !== "player") {
    advanceCardTurns();
    return;
  }
  render();
}

function advanceMegaConcertPlacements() {
  const pending = state.pendingMegaConcert;
  const roundData = currentRoundData();
  if (!pending || !roundData || state.bandRevealAlert) {
    return;
  }

  const currentEntry = currentMegaConcertEntry();
  if (!currentEntry) {
    finishMegaConcertPlacements();
    return;
  }

  const manager = state.managers.find((candidate) => candidate.id === currentEntry.managerId);
  if (!manager) {
    pending.index += 1;
    advanceMegaConcertPlacements();
    return;
  }

  const band = currentEntry.band;
  if (!band) {
    pending.index += 1;
    advanceMegaConcertPlacements();
    return;
  }

  const targets = specialGuestVenueTargetsForManager(manager, roundData);
  if (!targets.length) {
    pending.index += 1;
    openBandRevealAlert(
      `${manager.name} Could Not Place ${band.name}`,
      `${band.name} signs with ${manager.name}, but there was no unresolved booked venue available for a Special Guest appearance this week.`,
      band,
      "No eligible venue was available, so this band joins the roster for future rounds.",
      ""
    );
    render();
    return;
  }

  if (manager.isPlayer) {
    state.lastCardActionText = `${manager.name} must place Mega Concert signing ${band.name} before card play continues.`;
    render();
    return;
  }

  const choice = bestSpecialGuestVenueTarget(manager, band, roundData) || targets[0];
  pending.index += 1;
  addOverflowVenueBand(manager, choice.venueType, band.name, {
    venueName: choice.venueName || choice.bandName || "",
  }, roundData);
  openBandRevealAlert(
    `${manager.name} Introduces SPECIAL GUEST ${band.name}`,
    `${band.name} joins ${choice.venueType}: ${choice.venueName || choice.bandName || "this venue"} as part of the Mega Concert.`,
    band,
    `Mega Concert placement at ${choice.venueType} as a full-strength Special Guest`,
    choice.venueName || choice.bandName || ""
  );
  render();
}

function resolvePlayerMegaConcertPlacement(encodedTarget) {
  const pending = state.pendingMegaConcert;
  const roundData = currentRoundData();
  const currentEntry = currentMegaConcertEntry();
  if (!pending || !roundData || !currentEntry || currentEntry.managerId !== "player") {
    return;
  }

  const target = decodeCardTarget(encodedTarget || "");
  const availableTargets = specialGuestVenueTargetsForManager(state.managers[0], roundData);
  const chosenTarget = availableTargets.find((candidate) => candidate.venueType === target.venueType) || availableTargets[0];
  if (!chosenTarget) {
    pending.index += 1;
    openBandRevealAlert(
      `${state.managers[0].name} Could Not Place ${currentEntry.band.name}`,
      `${currentEntry.band.name} signs with ${state.managers[0].name}, but there was no unresolved booked venue available for a Special Guest appearance this week.`,
      currentEntry.band,
      "No eligible venue was available, so this band joins the roster for future rounds.",
      ""
    );
    render();
    return;
  }

  pending.index += 1;
  addOverflowVenueBand(state.managers[0], chosenTarget.venueType, currentEntry.band.name, {
    venueName: chosenTarget.venueName || chosenTarget.bandName || "",
  }, roundData);
  openBandRevealAlert(
    `${state.managers[0].name} Introduces SPECIAL GUEST ${currentEntry.band.name}`,
    `${currentEntry.band.name} joins ${chosenTarget.venueType}: ${chosenTarget.venueName || chosenTarget.bandName || "this venue"} as part of the Mega Concert.`,
    currentEntry.band,
    `Mega Concert placement at ${chosenTarget.venueType} as a full-strength Special Guest`,
    chosenTarget.venueName || chosenTarget.bandName || ""
  );
  render();
}

function startMegaConcertPlacements(manager) {
  const order = standingsOrderedManagers().map((entry) => entry.id);
  const entries = order.map((managerId) => {
    const targetManager = state.managers.find((candidate) => candidate.id === managerId);
    const drawnBandTemplate = state.bandDeck.shift();
    if (!targetManager || !drawnBandTemplate) {
      return { managerId, band: null };
    }
    const drawnBand = cloneBand(drawnBandTemplate);
    targetManager.roster.push(drawnBand);
    return { managerId, band: drawnBand };
  });

  state.pendingMegaConcert = {
    sourceManagerId: manager.id,
    resumeCardManagerId: nextCardManagerId(manager.id),
    entries,
    index: 0,
  };
  advanceMegaConcertPlacements();
}

function getBookedTargetsForVenue(manager, venueType) {
  return getAssignedBandEntries(manager, venueType).map((entry) => ({
    managerId: manager.id,
    managerName: manager.name,
    venueType,
    slotKey: entry.key,
    slotLabel: entry.label,
    multiplier: entry.multiplier,
    bandName: entry.bandName,
  }));
}

function getDuetTargetForVenue(manager, venueType) {
  const bookedEntries = getAssignedBandEntries(manager, venueType);
  const headliner = bookedEntries.find((entry) => entry.key === HEADLINER_SLOT);
  const opener = bookedEntries.find((entry) => entry.key === OPENER_SLOT);
  if (!headliner || !opener) {
    return null;
  }

  return {
    managerId: manager.id,
    managerName: manager.name,
    venueType,
    slotKey: headliner.key,
    slotLabel: "Lineup",
    multiplier: headliner.multiplier,
    bandName: headliner.bandName,
    pairedBandName: opener.bandName,
    pairedSlotKey: opener.key,
  };
}

function getFeudTargetsForVenue(manager, venueType) {
  if (!venueType || !venueHasBooking(manager, venueType)) {
    return [];
  }

  const bookedActs = state.managers.flatMap((candidate) =>
    getBookedTargetsForVenue(candidate, venueType).map((target) => ({
      managerId: candidate.id,
      managerName: candidate.name,
      venueType: target.venueType,
      slotKey: target.slotKey,
      slotLabel: target.slotLabel,
      bandName: target.bandName,
    }))
  ).filter((target) => target.bandName);

  const pairs = [];
  for (let index = 0; index < bookedActs.length; index += 1) {
    for (let inner = index + 1; inner < bookedActs.length; inner += 1) {
      const first = bookedActs[index];
      const second = bookedActs[inner];
      pairs.push({
        managerId: first.managerId,
        managerName: first.managerName,
        venueType,
        slotKey: first.slotKey,
        slotLabel: first.slotLabel,
        bandName: first.bandName,
        pairedManagerId: second.managerId,
        pairedManagerName: second.managerName,
        pairedSlotKey: second.slotKey,
        pairedSlotLabel: second.slotLabel,
        pairedBandName: second.bandName,
      });
    }
  }

  return pairs;
}

function getDanceOffTargetsForVenue(manager, venueType) {
  if (!venueType || !venueHasBooking(manager, venueType)) {
    return [];
  }

  const ownActs = getBookedTargetsForVenue(manager, venueType)
    .filter((target) => target.bandName)
    .map((target) => ({
      managerId: manager.id,
      managerName: manager.name,
      venueType: target.venueType,
      slotKey: target.slotKey,
      slotLabel: target.slotLabel,
      bandName: target.bandName,
    }));

  const opponentActs = state.managers
    .filter((candidate) => candidate.id !== manager.id)
    .flatMap((candidate) =>
      getBookedTargetsForVenue(candidate, venueType).map((target) => ({
        managerId: candidate.id,
        managerName: candidate.name,
        venueType: target.venueType,
        slotKey: target.slotKey,
        slotLabel: target.slotLabel,
        bandName: target.bandName,
      }))
    )
    .filter((target) => target.bandName);

  return ownActs.flatMap((ownAct) =>
    opponentActs.map((opponentAct) => ({
      managerId: ownAct.managerId,
      managerName: ownAct.managerName,
      venueType,
      slotKey: ownAct.slotKey,
      slotLabel: ownAct.slotLabel,
      bandName: ownAct.bandName,
      pairedManagerId: opponentAct.managerId,
      pairedManagerName: opponentAct.managerName,
      pairedSlotKey: opponentAct.slotKey,
      pairedSlotLabel: opponentAct.slotLabel,
      pairedBandName: opponentAct.bandName,
    }))
  );
}

function cloneAssignments(assignments = {}, roundData = currentRoundData()) {
  const cloned = {};
  const venueTypes = roundData?.venues?.map((venue) => venue.type) || Object.keys(assignments);
  venueTypes.forEach((venueType) => {
    cloned[venueType] = normalizeVenueBooking(assignments[venueType]);
  });
  return cloned;
}

function cloneManagerWithAssignments(manager, roundData = currentRoundData()) {
  return {
    ...manager,
    assignments: cloneAssignments(manager.assignments, roundData),
  };
}

function encodeCardTarget(target) {
  return [
    target.managerId || "",
    target.venueType || "",
    target.slotKey || "",
    encodeURIComponent(target.bandName || ""),
    target.pairedManagerId || "",
    target.pairedSlotKey || "",
    encodeURIComponent(target.pairedBandName || ""),
  ].join("|");
}

function decodeCardTarget(encodedTarget = "") {
  const [
    managerId = "",
    venueType = "",
    slotKey = "",
    bandNameEncoded = "",
    pairedManagerId = "",
    pairedSlotKey = "",
    pairedBandNameEncoded = "",
  ] = encodedTarget.split("|");
  return {
    managerId,
    venueType,
    slotKey,
    bandName: decodeURIComponent(bandNameEncoded || ""),
    pairedManagerId,
    pairedSlotKey,
    pairedBandName: decodeURIComponent(pairedBandNameEncoded || ""),
  };
}

function slotDisplayLabel(slotKey, options = {}) {
  const { includeMultiplier = false } = options;
  const slot = VENUE_SLOT_LOOKUP[slotKey] || VENUE_SLOT_LOOKUP[HEADLINER_SLOT];
  return includeMultiplier && slot.multiplier !== 1 ? `${slot.label} x${slot.multiplier}` : slot.label;
}

function bookingBandLabel(bandName, slotKey, options = {}) {
  if (!bandName) {
    return "";
  }
  const { includeHeadlinerLabel = false, includeMultiplier = false } = options;
  const slot = VENUE_SLOT_LOOKUP[slotKey] || VENUE_SLOT_LOOKUP[HEADLINER_SLOT];
  if (slot.key === HEADLINER_SLOT && !includeHeadlinerLabel) {
    return bandName;
  }
  const suffix = slotDisplayLabel(slot.key, { includeMultiplier });
  return `${bandName} (${suffix})`;
}

function bookingEntriesLabel(entries, options = {}) {
  return entries
    .map((entry) => bookingBandLabel(entry.bandName, entry.key, options))
    .filter(Boolean)
    .join(" • ");
}

function venueBookingLabel(manager, venueType, options = {}) {
  return bookingEntriesLabel(getAssignedBandEntries(manager, venueType), options);
}

function renderCellStack(lines, className = "cell-stack") {
  const filtered = lines.filter(Boolean);
  if (!filtered.length) {
    return "—";
  }
  return `<div class="${className}">${filtered.map((line) => `<div>${line}</div>`).join("")}</div>`;
}

function createManagers(playerName, playerPhotoSlug) {
  return [
    { id: "player", name: playerName || "Guest Promoter", photoSlug: playerPhotoSlug || "gp", strategy: "player", cash: STARTING_CASH, roster: [], hand: [], totalProfit: 0, victoryPoints: 0, isPlayer: true, assignments: {}, advertisingInventory: createAdvertisingInventory() },
    { id: "ai-1", name: "Romeo Tiramisu", photoSlug: "romeo-tiramisu", strategy: "showman", cash: STARTING_CASH, roster: [], hand: [], totalProfit: 0, victoryPoints: 0, isPlayer: false, assignments: {}, advertisingInventory: createAdvertisingInventory() },
    { id: "ai-2", name: "Buzz Smiley", photoSlug: "buzz-smiley", strategy: "selective", cash: STARTING_CASH, roster: [], hand: [], totalProfit: 0, victoryPoints: 0, isPlayer: false, assignments: {}, advertisingInventory: createAdvertisingInventory() },
    { id: "ai-3", name: "Dylan Collins", photoSlug: "dylan-collins", strategy: "focused", cash: STARTING_CASH, roster: [], hand: [], totalProfit: 0, victoryPoints: 0, isPlayer: false, assignments: {}, advertisingInventory: createAdvertisingInventory() },
  ];
}

function buildCardDeckTemplates() {
  const demandsTemplates = shuffled(CARD_TEMPLATES.filter((template) => template.name === "Demands"))
    .slice(0, MAX_DEMANDS_PER_GAME);
  const nonDemandTemplates = CARD_TEMPLATES.filter((template) => template.name !== "Demands");
  return [...nonDemandTemplates, ...demandsTemplates];
}

function materializeCardDeck(deckTemplates = state.cardDeckTemplates) {
  return shuffled(
    deckTemplates.map((template) => ({
      id: `card-${state.nextCardId++}`,
      name: template.name,
      type: template.type,
      modifier: template.modifier,
      popularityDice: template.popularityDice || 0,
      effect: template.effect || "flat_bonus",
      flatPenalty: template.flatPenalty || 0,
      subtitle: template.subtitle || "",
      allowedGenres: template.allowedGenres || null,
      trendGenres: template.trendGenres || null,
      targetSelf: Boolean(template.targetSelf),
      scandalModifier: template.scandalModifier || 0,
      scandalDiceModifier: template.scandalDiceModifier || 0,
      description: template.description,
    }))
  );
}

function buildCardDeck() {
  state.cardDeckTemplates = buildCardDeckTemplates();
  return materializeCardDeck(state.cardDeckTemplates);
}

function drawNextCard() {
  if (!state.cardDeck.length) {
    state.cardDeck = materializeCardDeck(state.cardDeckTemplates);
    logEvent("The World Tour deck ran out, so it was reshuffled into a new order.");
  }
  return state.cardDeck.shift() || null;
}

function dealCards() {
  for (let pick = 0; pick < STARTING_CARDS; pick += 1) {
    state.managers.forEach((manager) => {
      const card = drawNextCard();
      if (card) {
        manager.hand.push(card);
      }
    });
  }
}

function drawToHandSize(manager, targetSize = STARTING_CARDS) {
  let drawn = 0;
  while (manager.hand.length < targetSize) {
    const card = drawNextCard();
    if (!card) {
      break;
    }
    manager.hand.push(card);
    drawn += 1;
  }
  return drawn;
}

function drawCardsToManager(manager, count = 1) {
  let drawn = 0;
  while (drawn < count) {
    const card = drawNextCard();
    if (!card) {
      break;
    }
    manager.hand.push(card);
    drawn += 1;
  }
  return drawn;
}

function randomCardFromHand(manager) {
  if (!manager?.hand?.length) {
    return null;
  }
  const index = Math.floor(Math.random() * manager.hand.length);
  return manager.hand[index] || null;
}

function stealRandomCardsFromOpponents(manager, countPerOpponent = 1) {
  let stolenCount = 0;
  const details = [];

  state.managers
    .filter((candidate) => candidate.id !== manager.id)
    .forEach((candidate) => {
      let stolenFromThisOpponent = 0;
      while (stolenFromThisOpponent < countPerOpponent) {
        const stolenCard = randomCardFromHand(candidate);
        if (!stolenCard) {
          break;
        }
        candidate.hand = candidate.hand.filter((card) => card.id !== stolenCard.id);
        manager.hand.push(stolenCard);
        stolenFromThisOpponent += 1;
        stolenCount += 1;
      }
      details.push(`${candidate.name} lost ${stolenFromThisOpponent} card${stolenFromThisOpponent === 1 ? "" : "s"}`);
    });

  return {
    stolenCount,
    summary: details.join(" • "),
  };
}

function cleanupDiscardChoicesForManager(manager) {
  return state.pendingCardDiscards?.[manager.id] || [];
}

function initializeCardCleanupChoices() {
  state.pendingCardDiscards = Object.fromEntries(
    state.managers.map((manager) => [manager.id, manager.isPlayer ? [] : chooseAiCleanupDiscards(manager)])
  );
}

function chooseAiCleanupDiscards(manager) {
  if (!manager?.hand?.length) {
    return [];
  }

  const futureRounds = visibleFutureRounds();
  const averageCash = state.managers.reduce((sum, candidate) => sum + candidate.cash, 0) / Math.max(1, state.managers.length);
  const futureWeight = futureRounds.reduce(
    (sum, round) => sum + round.venues.reduce((venueSum, venue) => venueSum + venueStrategicWeight(venue), 0),
    0
  );
  const rosterGenres = manager.roster.flatMap((band) => genreParts(band.genre));

  return manager.hand
    .filter((card) => {
      if (card.type === "defense") {
        if (card.effect === "swiss_bank_account") {
          return manager.cash < averageCash - 15;
        }
        return false;
      }
      if (card.type === "smash" && card.allowedGenres?.length) {
        const hasMatchingBand = rosterGenres.some((genre) => card.allowedGenres.includes(genre));
        if (!hasMatchingBand) {
          return true;
        }
      }
      if (card.type === "trend") {
        return futureRounds.length >= 2;
      }
      if (card.effect === "sit_out_boost_persistent") {
        return false;
      }
      if (card.type === "bad_song" && card.targetSelf) {
        return true;
      }
      if (card.type === "smash") {
        return futureWeight < 60 && (card.modifier || 0) <= 2 && !card.popularityDice;
      }
      return futureWeight < 80;
    })
    .map((card) => card.id);
}

function beginCardCleanupPhase() {
  initializeCardCleanupChoices();
  state.phase = "card_cleanup";
  state.activeWorkspace = "cards";
  state.activeSidebarView = "your_cards";
  state.activeCardManagerId = "";
  state.lastCardActionText = "The final card window is over. Discard any leftover World Tour cards you do not want to carry into next round.";
  render();
}

function finishCardCleanup({ keepAll = false } = {}) {
  state.managers.forEach((manager) => {
    const discardIds = keepAll && manager.isPlayer ? [] : cleanupDiscardChoicesForManager(manager);
    if (!discardIds.length) {
      return;
    }

    const discardSet = new Set(discardIds);
    const discarded = manager.hand.filter((card) => discardSet.has(card.id));
    manager.hand = manager.hand.filter((card) => !discardSet.has(card.id));
    if (discarded.length) {
      logEvent(
        `${manager.name} discarded ${discarded.map((card) => `${card.name}${card.subtitle ? `: ${card.subtitle}` : ""}`).join(", ")} before the next redraw.`
      );
    }
  });

  state.pendingCardDiscards = {};
  beginShowcaseForCurrentVenue();
}

function togglePlayerCleanupDiscard(cardId, shouldDiscard) {
  if (state.phase !== "card_cleanup") {
    return;
  }

  const current = new Set(state.pendingCardDiscards.player || []);
  if (shouldDiscard) {
    current.add(cardId);
  } else {
    current.delete(cardId);
  }
  state.pendingCardDiscards.player = [...current];
  render();
}

function assignStartingBands() {
  const draws = [];
  for (let pick = 0; pick < STARTING_BANDS; pick += 1) {
    state.managers.forEach((manager) => {
      const band = state.bandDeck.shift();
      if (band) {
        const startingBand = cloneBand(band);
        manager.roster.push(startingBand);
        draws.push({ manager, band: startingBand, pick: pick + 1 });
      }
    });
  }
  return draws;
}

function buildIntroSlides(startingDraws) {
  const playerName = state.managers[0]?.name || "You";
  const player = state.managers[0];
  const slides = [
    {
      title: "Welcome to World Tour",
      body: [
        `Welcome to World Tour. As a promoter, your job is to put together the best group of bands and artists and turn them into the hottest performers on the circuit.`,
        `Each time your musician is the most popular act at a venue, you win Victory Points. The winner is the first promoter to reach ${VICTORY_TARGET} Victory Points.`,
        `Each promoter starts by signing two bands at random. Here are the first two artists for each promoter.`,
      ],
      button: "Show First Signing",
    },
  ];

  startingDraws.forEach(({ manager, band, pick }) => {
    const summary = bandProfileSummary(band);
    const { voice, scandalRead, valueRead, versatilityRead, popularityAverage, scandalAverage } = summary;
    slides.push({
      title: `${promoterLabel(manager.name)} Signs ${band.name}`,
      mediaHtml: `
        <div class="intro-band-feature">
          ${renderBandPhoto(band.name, "intro-band-photo")}
          <div class="intro-band-meta-list">
            <p><strong>Genre</strong><span>${band.genre}</span></p>
            <p><strong>Popularity</strong><span>${band.popularity}</span></p>
            <p><strong>Scandal</strong><span>${band.scandal}</span></p>
            <p><strong>Retention</strong><span>${formatCash(band.retention)}</span></p>
            <p><strong>Average Popularity</strong><span>${popularityAverage.toFixed(1).replace(/\.0$/, "")}</span></p>
            <p><strong>Average Scandal</strong><span>${scandalAverage.toFixed(1).replace(/\.0$/, "")}</span></p>
          </div>
        </div>
      `,
      collapsibleBody: [
        `${promoterLabel(manager.name)} starts off by signing ${band.name}. ${voice.noun.charAt(0).toUpperCase() + voice.noun.slice(1)} specializes in ${band.genre}, and comes in with a popularity rating of ${band.popularity}.`,
        versatilityRead,
        scandalRead,
        `If ${promoterLabel(manager.name)} wants to keep this act after the first round, the retention bill will be ${formatCash(band.retention)}.`,
        valueRead,
      ],
      collapsibleLabel: "Show scouting notes for new players",
      button: pick === STARTING_BANDS && manager.id === state.managers[state.managers.length - 1].id ? "See The Full Tour Setup" : "Next Signing",
    });
  });

  slides.push({
    title: "Your First World Tour Cards",
    body: [
      `The opening signings are complete. Each promoter now draws 5 World Tour Cards.`,
      `These cards can help your own bands or cause trouble for other promoters' artists. Here are your first five World Tour Cards.`,
    ],
    html: `
      <div class="tour-cards-grid">
        ${player.hand
          .map((card) => renderFullCard(card, { showControls: false }))
          .join("")}
      </div>
    `,
    button: "Go To Round 1",
  });

  slides.push({
    title: "The Tour Begins",
    body: [
      `${playerName}, the opening signings are complete and every promoter now has a starter roster and a hand of World Tour Cards.`,
      `Next up you will see the full Round 1 planning screen, including the next five rounds of venues so you can start plotting your long game.`,
    ],
    button: "Open Round 1",
  });

  return slides;
}

function renderIntro() {
  const slide = state.introSlides[state.introIndex];
  if (!slide) {
    return;
  }

  els.introTitle.textContent = slide.title;
  const bodyMarkup = (slide.body || [])
    .map((line, index) => `<p class="${index === 0 ? "intro-highlight" : ""}">${line}</p>`)
    .join("");
  const collapsibleMarkup = slide.collapsibleBody?.length
    ? `
      <details class="intro-notes-panel">
        <summary>${slide.collapsibleLabel || "Show notes"}</summary>
        <div class="intro-notes-body">
          ${slide.collapsibleBody
            .map((line, index) => `<p class="${index === 0 ? "intro-highlight" : ""}">${line}</p>`)
            .join("")}
        </div>
      </details>
    `
    : "";
  els.introBody.innerHTML = `${slide.mediaHtml || ""}${bodyMarkup}${collapsibleMarkup}${slide.html || ""}`;
  els.introNextButton.textContent = slide.button || "Next";
}

function advanceIntro() {
  if (state.introIndex < state.introSlides.length - 1) {
    state.introIndex += 1;
    renderIntro();
    return;
  }

  els.introScreen.classList.add("hidden");
  els.gameScreen.classList.remove("hidden");
  state.managers.forEach((manager) => {
    logEvent(`${manager.name} opens with ${manager.roster.map((band) => band.name).join(", ")} and ${STARTING_CARDS} World Tour cards.`);
  });
  dealRound();
}

function buildSchedule() {
  const grouped = {
    A: shuffled(venues.filter((venue) => venue.type === "A")),
    B: shuffled(venues.filter((venue) => venue.type === "B")),
    C: shuffled(venues.filter((venue) => venue.type === "C")),
  };

  const canOpenRoundOne = (venue) =>
    venue.venuePoints <= 10 &&
    venue.revenueFactor <= 2 &&
    venue.cost <= 20;

  const openingShowcaseIndex = grouped.C.findIndex((venue, index) => index > 0 && canOpenRoundOne(venue));
  if (grouped.C[0] && !canOpenRoundOne(grouped.C[0]) && openingShowcaseIndex > 0) {
    [grouped.C[0], grouped.C[openingShowcaseIndex]] = [grouped.C[openingShowcaseIndex], grouped.C[0]];
  }

  const roundCount = Math.min(grouped.A.length, grouped.B.length, grouped.C.length, Math.floor((bands.length - STARTING_BANDS * 4) / AUCTION_BANDS_PER_ROUND));
  return Array.from({ length: roundCount }, (_, index) => ({
    roundNumber: index + 1,
    venues: ROUND_VENUE_ORDER.map((type) => grouped[type][index]),
  }));
}

function initializeAssignments(roundData) {
  state.roundCardPlays = [];
  state.roundResults = [];
  state.showcase = null;
  state.pendingDefenseChoice = null;
  state.pendingCharityCaseChoice = null;
  state.pendingMegaConcert = null;
  state.cardTurnOrder = [];
  state.cardPassedManagers = [];
  state.activeCardManagerId = "";
  state.lastCardActionText = "";
  state.currentVenueCardIndex = 0;
  state.managers.forEach((manager) => {
    manager.assignments = {};
    roundData.venues.forEach((venue, index) => {
      manager.assignments[venue.type] = emptyVenueBooking(manager.roster[index]?.name || "");
    });
  });
}

function startGame() {
  state.round = 0;
  state.schedule = buildSchedule();
  state.bandDeck = shuffled(bands);
  state.cardDeck = buildCardDeck();
  state.marketBands = [];
  state.managers = createManagers(els.playerName.value.trim(), els.playerIcon?.value || "guest-promoter");
  state.log = [];
  state.phase = "auction";
  state.roundCardPlays = [];
  state.roundResults = [];
  state.showcase = null;
  state.pendingDefenseChoice = null;
  state.pendingCharityCaseChoice = null;
  state.pendingMegaConcert = null;
  state.persistentScandals = [];
  state.persistentBadSongs = [];
  state.persistentSmashHits = [];
  state.persistentScandalAdjustments = [];
  state.persistentLawyers = [];
  state.persistentPromoterEffects = [];
  state.cardTurnOrder = [];
  state.cardPassedManagers = [];
  state.activeCardManagerId = "";
  state.currentVenueCardIndex = 0;
  state.pendingRetentions = {};
  state.advertisingPlacements = [];
  state.lastWeekBandSnapshot = {};
  state.bandCareerLedger = {};
  state.selectedAdvertisingValue = 0;
  state.selectedAdvertisingTarget = "";
  state.reviewingAssignments = false;
  state.globalRevenueClimate = null;
  state.activeWorkspace = "auction";
  state.activeSidebarView = "this_week";
  state.selectedPromoterId = "player";
  state.selectedPreviewRound = 0;
  state.introSlides = [];
  state.introIndex = 0;
  const startingDraws = assignStartingBands();
  dealCards();

  els.hero.classList.add("hidden");
  els.rosterScreen.classList.add("hidden");
  els.introScreen.classList.remove("hidden");
  els.gameScreen.classList.add("hidden");
  state.introSlides = buildIntroSlides(startingDraws);
  renderIntro();
}

function openRosterScreen() {
  els.hero.classList.add("hidden");
  els.introScreen.classList.add("hidden");
  els.venueRosterScreen.classList.add("hidden");
  els.gameScreen.classList.add("hidden");
  els.rosterScreen.classList.remove("hidden");
}

function closeRosterScreen() {
  els.rosterScreen.classList.add("hidden");
  els.venueRosterScreen.classList.add("hidden");
  els.hero.classList.remove("hidden");
}

function openVenueRosterScreen() {
  els.hero.classList.add("hidden");
  els.introScreen.classList.add("hidden");
  els.rosterScreen.classList.add("hidden");
  els.gameScreen.classList.add("hidden");
  els.venueRosterScreen.classList.remove("hidden");
}

function closeVenueRosterScreen() {
  els.venueRosterScreen.classList.add("hidden");
  els.rosterScreen.classList.add("hidden");
  els.hero.classList.remove("hidden");
}

function openPhotoModal(bandName, src) {
  const isVenueImage = (src || "").includes("/venues/");
  els.photoModal.classList.remove("hidden");
  els.photoModal.classList.toggle("venue-image-view", isVenueImage);
  els.photoModal.setAttribute("aria-hidden", "false");
  els.photoModalCaption.textContent = bandName;
  els.photoModalFallback.textContent = bandInitials(bandName);
  els.photoModalFallback.classList.add("hidden");
  els.photoModalImage.classList.remove("hidden");
  els.photoModalImage.src = src || bandPhotoPath(bandName);
  els.photoModalImage.alt = bandName;
}

function openRevenueClimateAlert(title, body, detail = "") {
  state.revenueClimateAlert = { title, body, detail };
}

function closeRevenueClimateAlert() {
  state.revenueClimateAlert = null;
  render();
}

function openBandRevealAlert(title, body, band, detail = "", venueName = "") {
  state.bandRevealAlert = { title, body, band, detail, venueName };
}

function closeBandRevealAlert() {
  state.bandRevealAlert = null;
  render();
  if (state.pendingMegaConcert) {
    advanceMegaConcertPlacements();
    return;
  }
  if (state.phase === "cards" && state.activeCardManagerId && state.activeCardManagerId !== "player") {
    advanceCardTurns();
    if (state.phase === "cards") {
      render();
    }
  }
}

function closePhotoModal() {
  els.photoModal.classList.add("hidden");
  els.photoModal.classList.remove("venue-image-view");
  els.photoModal.setAttribute("aria-hidden", "true");
  els.photoModalImage.src = "";
  els.photoModalImage.alt = "";
}

function logEvent(message) {
  state.log.unshift(message);
  state.log = state.log.slice(0, 18);
}

function dealRound() {
  if (state.round >= state.schedule.length || state.bandDeck.length < AUCTION_BANDS_PER_ROUND) {
    state.phase = "complete";
    state.activeWorkspace = "results";
    render();
    return;
  }

  state.round += 1;
  state.phase = "week_off";
  state.pendingRetentions = {};
  state.pendingWeekOffChoices = {};
  state.currentRoundWeekOffBands = {};
  state.reviewingAssignments = false;
  state.showcase = null;
  state.pendingDefenseChoice = null;
  state.pendingCharityCaseChoice = null;
  state.pendingMegaConcert = null;
  state.activeWorkspace = "this_week";
  state.activeSidebarView = "this_week";
  state.selectedPreviewRound = state.round;
  state.selectedAdvertisingValue = 0;
  state.selectedAdvertisingTarget = "";
  state.marketBands = state.bandDeck.splice(0, AUCTION_BANDS_PER_ROUND).map((band) => ({
    ...band,
    resolved: false,
    resultText: "",
    playerBid: 1,
    currentBid: -1,
    currentLeaderId: "",
    currentLeaderName: "None",
    playerPassed: false,
    aiPassed: {},
  }));

  if (state.globalRevenueClimate?.effect === "music_fever") {
    logEvent(`Round ${state.round} begins under Music Fever. All revenues are doubled this round unless Recession cancels it.`);
    openRevenueClimateAlert(
      "Music Fever Active",
      `Round ${state.round} starts under Music Fever. All payouts are doubled at every venue this round unless Recession cancels it.`,
      "Live now: all venue payouts are doubled this round."
    );
  } else if (state.globalRevenueClimate?.effect === "recession") {
    logEvent(`Round ${state.round} begins under Recession. All revenues are halved this round unless Music Fever cancels it.`);
    openRevenueClimateAlert(
      "Recession Active",
      `Round ${state.round} starts under Recession. All payouts are cut in half at every venue this round unless Music Fever cancels it.`,
      "Live now: all venue payouts are cut in half this round."
    );
  }

  beginWeekOffChoicePhase(currentRoundData());
}

function assignmentIsComplete(manager, roundData) {
  const assignedBands = getAllAssignedBandNames(manager, roundData);

  if (new Set(assignedBands).size !== assignedBands.length) {
    return false;
  }

  return assignedBands.every((bandName) => Boolean(getBandByName(manager, bandName)));
}

function hasUnusedBandsAndEmptyVenues(manager, roundData) {
  if (!roundData) {
    return false;
  }

  const assignedBands = getAllAssignedBandNames(manager, roundData);
  const emptyVenueCount = roundData.venues.filter((venue) => venueBookingCount(manager, venue.type) < STANDARD_VENUE_CAPACITY).length;
  const unusedBandCount = manager.roster.filter((band) => !assignedBands.includes(band.name)).length;

  return emptyVenueCount > 0 && unusedBandCount > 0;
}

function autofillAssignments(manager, roundData) {
  if (!roundData) {
    return;
  }

  normalizeManagerAssignments(manager, roundData);
  const usedBands = new Set(getAllAssignedBandNames(manager, roundData));
  roundData.venues.forEach((venue) => {
    STANDARD_VENUE_BAND_SLOTS.forEach((slot) => {
      if (getAssignedBandName(manager, venue.type, slot.key)) {
        return;
      }

      const nextBand = manager.roster.find((band) => !usedBands.has(band.name));
      if (nextBand) {
        setManagerAssignment(manager, venue.type, slot.key, nextBand.name, roundData);
        usedBands.add(nextBand.name);
      }
    });
  });
}

function projectedVenueRevenue(band, venue) {
  return (parseDiceAverage(band.popularity) + genreFitScore(band, venue)) * venue.revenueFactor - venue.cost;
}

function projectedVenueGross(band, venue) {
  return (parseDiceAverage(band.popularity) + genreFitScore(band, venue)) * venue.revenueFactor;
}

function projectedVenueRevenueWithPopularityDelta(band, venue, popularityDelta = 0, popularityDiceDelta = 0) {
  const adjustedPopularity = Math.max(0, parseDiceAverageSignedWithModifier(band.popularity, popularityDelta, popularityDiceDelta));
  return (adjustedPopularity + genreFitScore(band, venue)) * venue.revenueFactor - venue.cost;
}

function projectedVenueGrossWithPopularityDelta(band, venue, popularityDelta = 0, popularityDiceDelta = 0) {
  const adjustedPopularity = Math.max(0, parseDiceAverageSignedWithModifier(band.popularity, popularityDelta, popularityDiceDelta));
  return (adjustedPopularity + genreFitScore(band, venue)) * venue.revenueFactor;
}

function projectedSlotRevenueWithPopularityDelta(band, venue, slotKey = HEADLINER_SLOT, popularityDelta = 0, popularityDiceDelta = 0) {
  const slot = VENUE_SLOT_LOOKUP[slotKey] || VENUE_SLOT_LOOKUP[HEADLINER_SLOT];
  const gross = projectedVenueGrossWithPopularityDelta(band, venue, popularityDelta, popularityDiceDelta);
  return gross * slot.multiplier - (slot.key === HEADLINER_SLOT ? venue.cost : 0);
}

function projectedSlotRevenue(band, venue, slotKey = HEADLINER_SLOT) {
  return projectedSlotRevenueWithPopularityDelta(band, venue, slotKey, 0, 0);
}

function bestProjectedRoundRevenueWithPopularityDelta(band, round, popularityDelta = 0, popularityDiceDelta = 0) {
  if (!round?.venues?.length) {
    return 0;
  }

  return round.venues.reduce(
    (best, venue) => Math.max(best, projectedVenueRevenueWithPopularityDelta(band, venue, popularityDelta, popularityDiceDelta)),
    -Infinity
  );
}

function projectedBandValueAcrossRoundsWithPopularityDelta(band, rounds, popularityDelta = 0, popularityDiceDelta = 0) {
  if (!rounds.length) {
    return 0;
  }

  return rounds.reduce(
    (sum, round) => sum + bestProjectedRoundRevenueWithPopularityDelta(band, round, popularityDelta, popularityDiceDelta),
    0
  );
}

function auctionStrategicSummary(manager, band, currentRound, futureRounds = [], options = {}) {
  const { includePrivateHand = true } = options;
  const genres = genreParts(band.genre);
  const previewRounds = [currentRound, ...futureRounds].filter(Boolean);
  const basePreviewValue = previewRounds.length
    ? projectedBandValueAcrossRoundsWithPopularityDelta(band, previewRounds, 0)
    : 0;
  const bandReasons = [];
  const handReasons = [];
  let bandBonus = 0;
  let handBonus = 0;

  if (genres.length > 1) {
    const flexibilityBonus =
      2 +
      Math.max(0, totalFitAcrossRound(band, currentRound?.venues || [])) * 0.08 +
      Math.max(0, averageFutureFit(band, futureRounds)) * 0.06;
    bandBonus += flexibilityBonus;
    bandReasons.push(`Dual-genre flex (${band.genre})`);
  }

  const scandalAverage = parseDiceAverageSigned(band.scandal);
  if (scandalAverage <= 0) {
    bandBonus += 4 + Math.abs(scandalAverage) * 1.2;
    bandReasons.unshift(`Scandal edge (${band.scandal})`);
  } else if (scandalAverage <= 2) {
    bandBonus += 1.5 + (2 - scandalAverage) * 0.75;
    bandReasons.push(`Scandal shield (${band.scandal})`);
  }

  if (includePrivateHand) {
    const matchingTrends = manager.hand.filter(
      (card) => card.type === "trend" && genres.some((genre) => (card.trendGenres || []).includes(genre))
    );
    if (currentRound && matchingTrends.length) {
      const trendGain = matchingTrends.reduce((sum, card) => {
        const bestGain = Math.max(
          ...currentRound.venues.map(
            (venue) =>
              projectedVenueRevenueWithPopularityDelta(band, venue, card.modifier || 0) -
              projectedVenueRevenueWithPopularityDelta(band, venue, 0)
          ),
          0
        );
        return sum + Math.max(0, bestGain);
      }, 0);
      handBonus += trendGain * 0.9 + matchingTrends.length * 1.5;
      handReasons.push(
        matchingTrends.length === 1
          ? `Trend in hand (${matchingTrends[0].subtitle || matchingTrends[0].name})`
          : `${matchingTrends.length} matching trends in hand`
      );
    }

    const matchingSmashes = manager.hand.filter((card) =>
      card.type === "smash" &&
      card.effect === "persistent_smash" &&
      (!card.allowedGenres?.length || genres.some((genre) => card.allowedGenres.includes(genre)))
    );
    if (matchingSmashes.length && previewRounds.length) {
      const smashGain = matchingSmashes.reduce((sum, card) => {
        const upgradedValue = projectedBandValueAcrossRoundsWithPopularityDelta(
          band,
          previewRounds,
          card.modifier || 0,
          card.popularityDice || 0
        );
        return sum + Math.max(0, upgradedValue - basePreviewValue);
      }, 0);
      handBonus += smashGain * 0.18 + matchingSmashes.length * 1.5;
      handReasons.push(
        matchingSmashes.length === 1
          ? `Boost in hand (${matchingSmashes[0].subtitle || matchingSmashes[0].name})`
          : `${matchingSmashes.length} matching boost cards`
      );
    }

    const counselingCards = manager.hand.filter(
      (card) => card.type === "smash" && card.effect === "persistent_scandal_adjustment"
    );
    if (counselingCards.length) {
      const totalAdjustment = counselingCards.reduce((sum, card) => sum + (card.scandalModifier || 0), 0);
      const totalDiceAdjustment = counselingCards.reduce((sum, card) => sum + (card.scandalDiceModifier || 0), 0);
      const improvedScandalAverage = parseDiceAverageSignedWithModifier(band.scandal, totalAdjustment, totalDiceAdjustment);
      if (improvedScandalAverage < scandalAverage) {
        handBonus += Math.max(0, scandalAverage - improvedScandalAverage) * 0.45;
        handReasons.push(`Scandal shield in hand (${formatAdjustedNotation(band.scandal, totalAdjustment, totalDiceAdjustment)})`);
      }
    }
  }

  return {
    bidBonus: bandBonus + handBonus,
    bandBonus,
    handBonus,
    bandReasons: bandReasons.slice(0, 2),
    handReasons: handReasons.slice(0, 2),
  };
}

function optimisticVenueRevenue(band, venue) {
  const parsed = parseDiceNotation(band.popularity);
  if (!parsed) {
    return projectedVenueRevenue(band, venue);
  }
  const maxRoll = parsed.diceCount * 6 + parsed.modifier;
  return (maxRoll + genreFitScore(band, venue)) * venue.revenueFactor - venue.cost;
}

function auctionUpgradeSummary(manager, band, venuesForRound) {
  const currentPlan = bestAssignmentPlan(manager, venuesForRound, {
    roster: manager.roster,
    cashBudget: manager.cash,
  });
  const candidatePlan = bestAssignmentPlan(manager, venuesForRound, {
    roster: [...manager.roster, band],
    cashBudget: manager.cash,
  });
  const options = venuesForRound
    .map((venue) => {
      const currentBooking = normalizeVenueBooking(currentPlan.assignments[venue.type]);
      const candidateBooking = normalizeVenueBooking(candidatePlan.assignments[venue.type]);
      const candidateSlot = VENUE_BAND_SLOTS.find((slot) => candidateBooking[slot.key] === band.name);
      if (!candidateSlot) {
        return null;
      }

      const currentBandName = currentBooking[candidateSlot.key] || "";
      const currentBand = currentBandName ? getBandByName(manager, currentBandName) : null;
      const currentValue = currentBand ? projectedSlotRevenue(currentBand, venue, candidateSlot.key) : 0;
      const candidateValue = projectedSlotRevenue(band, venue, candidateSlot.key);
      return {
        venue,
        slot: candidateSlot,
        currentBandName,
        candidateValue,
        gain: candidateValue - currentValue,
      };
    })
    .filter((entry) => entry && entry.gain > 0)
    .sort((a, b) => b.gain - a.gain);

  if (!options.length) {
    return "";
  }

  return options
    .slice(0, 2)
    .map((entry) => (
      entry.currentBandName
        ? `Upgrades ${entry.slot.label} at ${entry.venue.type}: ${entry.venue.name} from ${entry.currentBandName} by ${formatCash(entry.gain)}.`
        : `Could add ${entry.slot.label.toLowerCase()} at ${entry.venue.type}: ${entry.venue.name} for ${formatCash(entry.candidateValue)}.`
    ))
    .join(" ");
}

function bestCurrentSlotUpgradeForBand(manager, band, currentRound) {
  if (!currentRound?.venues?.length) {
    return 0;
  }

  return currentRound.venues.reduce((bestUpgrade, venue) => {
    const booking = getVenueBooking(manager, venue.type);
    const headlinerName = booking.headliner;
    const openerName = booking.opener;
    const headlinerBand = headlinerName ? getBandByName(manager, headlinerName) : null;
    const openerBand = openerName ? getBandByName(manager, openerName) : null;
    const headlinerUpgrade = !headlinerBand
      ? projectedSlotRevenue(band, venue, HEADLINER_SLOT) + 2
      : projectedSlotRevenue(band, venue, HEADLINER_SLOT) - projectedSlotRevenue(headlinerBand, venue, HEADLINER_SLOT);
    const openerUpgrade = !openerBand
      ? projectedSlotRevenue(band, venue, OPENER_SLOT) + (headlinerBand ? 1 : 0)
      : projectedSlotRevenue(band, venue, OPENER_SLOT) - projectedSlotRevenue(openerBand, venue, OPENER_SLOT);
    return Math.max(bestUpgrade, headlinerUpgrade, openerUpgrade);
  }, -Infinity);
}

function managerAuctionNeedProfile(manager, currentRound) {
  if (!currentRound?.venues?.length) {
    return {
      rosterShortage: 0,
      emptyVenueCount: 0,
      weakVenueCount: 0,
    };
  }

  const venueValues = currentRound.venues.map((venue) => {
    const bookedBands = getAssignedBandEntries(manager, venue.type);
    const projectedValue = bookedBands.reduce((sum, entry) => {
      const currentBand = getBandByName(manager, entry.bandName);
      return sum + (currentBand ? projectedSlotRevenue(currentBand, venue, entry.key) : 0);
    }, 0);
    return { bookingCount: bookedBands.length, projectedValue };
  });

  return {
    rosterShortage: Math.max(0, currentRound.venues.length * STANDARD_VENUE_CAPACITY - manager.roster.length),
    emptyVenueCount: venueValues.filter((entry) => entry.bookingCount === 0).length,
    weakVenueCount: venueValues.filter((entry) => entry.bookingCount < STANDARD_VENUE_CAPACITY || entry.projectedValue <= 0).length,
  };
}

function summarizeAssignmentPlan(manager, venuesForRound, assignments = {}) {
  return venuesForRound.reduce((summary, venue) => {
    const booking = normalizeVenueBooking(assignments[venue.type]);
    const bookedEntries = VENUE_BAND_SLOTS
      .map((slot) => ({
        ...slot,
        bandName: bookingBandNameForSlot(booking, slot.key),
      }))
      .filter((entry) => entry.bandName);

    if (!bookedEntries.length) {
      return summary;
    }

    const lineupRevenue = bookedEntries.reduce((sum, entry) => {
      const band = getBandByName(manager, entry.bandName);
      return sum + (band ? projectedSlotRevenue(band, venue, entry.key) : 0);
    }, 0);

    return {
      bookedVenueCount: summary.bookedVenueCount + 1,
      paidVenueCount: summary.paidVenueCount + (venue.cost > 0 ? 1 : 0),
      lowCostBookedCount: summary.lowCostBookedCount + (venue.cost <= 6 && lineupRevenue > 0 ? 1 : 0),
      bestLineupRevenue: Math.max(summary.bestLineupRevenue, lineupRevenue),
    };
  }, {
    bookedVenueCount: 0,
    paidVenueCount: 0,
    lowCostBookedCount: 0,
    bestLineupRevenue: Number.NEGATIVE_INFINITY,
  });
}

function auctionStageSnapshot(index = activeAuctionBandIndex()) {
  const totalBands = state.marketBands.length || AUCTION_BANDS_PER_ROUND;
  const normalizedIndex = index < 0 ? totalBands : index;
  return {
    totalBands,
    currentAuctionNumber: totalBands ? Math.min(totalBands, normalizedIndex + 1) : 0,
    resolvedCount: Math.min(totalBands, Math.max(0, normalizedIndex)),
    hiddenRemaining: Math.max(0, totalBands - normalizedIndex - 1),
  };
}

function auctionSequentialAdjustment(manager, band, currentRound, context = {}) {
  const stage = auctionStageSnapshot();
  const needs = managerAuctionNeedProfile(manager, currentRound);
  const qualitySignal =
    Math.max(0, context.bestCurrentVenue || 0) * 0.55 +
    Math.max(0, context.bestCurrentSlotUpgrade || 0) * 0.85 +
    Math.max(0, context.strategicBonus || 0) * 0.7 +
    Math.max(0, (context.rawPopularityAverage || 0) - 4) * 0.6;
  const patienceBase = stage.hiddenRemaining * (needs.rosterShortage > 0 || needs.emptyVenueCount > 0 ? 1.5 : 2.85);
  const benchTax = (context.projectedBenchCount || 0) > 0
    ? stage.hiddenRemaining * (1.1 + (context.projectedBenchCount || 0) * 0.65)
    : 0;
  const relief =
    needs.rosterShortage * 2.75 +
    needs.emptyVenueCount * 2.25 +
    needs.weakVenueCount * 1.15 +
    Math.max(0, context.bestCurrentSlotUpgrade || 0) * 0.2 +
    Math.max(0, context.bestCurrentVenue || 0) * 0.08;
  const waitPenalty = Math.max(0, patienceBase + benchTax - relief - qualitySignal * 0.16);
  const urgencyBonus = stage.hiddenRemaining === 0
    ? 6 + needs.rosterShortage * 3.2 + needs.emptyVenueCount * 3 + needs.weakVenueCount * 1.75
    : stage.hiddenRemaining === 1
      ? 2.75 + needs.rosterShortage * 1.8 + needs.emptyVenueCount * 1.4 + needs.weakVenueCount * 0.8
      : 0;
  const pressureDiscount = Math.max(
    0,
    stage.hiddenRemaining * (needs.rosterShortage > 0 || needs.emptyVenueCount > 0 ? 1.15 : 2.05) +
      Math.max(0, (context.projectedBenchCount || 0) - 1) * 0.9 -
      Math.min(4.5, qualitySignal * 0.06) -
      (stage.hiddenRemaining === 0 ? 3 : 0)
  );

  return {
    ...stage,
    ...needs,
    qualitySignal,
    waitPenalty,
    urgencyBonus,
    pressureDiscount,
  };
}

function managerBidCap(manager, band, currentRound, futureRounds, options = {}) {
  const { includePrivateHand = true } = options;
  const profile = aiPromoterProfile(manager);
  const bandBidMultiplier = aiBandBidMultiplier(manager, band);
  const strategicSummary = auctionStrategicSummary(manager, band, currentRound, futureRounds, { includePrivateHand });
  const needs = managerAuctionNeedProfile(manager, currentRound);
  const currentVenueValues = currentRound.venues.map((venue) => projectedVenueRevenue(band, venue));
  const currentValue = currentVenueValues.reduce((sum, value) => sum + value, 0);
  const bestCurrentVenue = Math.max(...currentVenueValues);
  const bestCurrentSlotUpgrade = bestCurrentSlotUpgradeForBand(manager, band, currentRound);
  const rawPopularityAverage = parseDiceAverageSigned(band.popularity);
  const scandalAverage = parseDiceAverageSigned(band.scandal);
  const topVenue = [...currentRound.venues].sort((a, b) => (b.venuePoints * b.revenueFactor) - (a.venuePoints * a.revenueFactor))[0];
  const topVenueWeightedImportance = (topVenue?.venuePoints || 0) * (topVenue?.revenueFactor || 0);
  const topVenueSlotValue = topVenue
    ? Math.max(
        projectedSlotRevenue(band, topVenue, HEADLINER_SLOT),
        projectedSlotRevenue(band, topVenue, OPENER_SLOT)
      )
    : 0;
  const topVenueNeutralPower =
    topVenue && genreFitScore(band, topVenue) === 0
      ? Math.max(0, rawPopularityAverage * topVenue.revenueFactor - topVenue.cost)
      : 0;
  const futureValue =
    futureRounds.reduce((sum, round) => {
      const best = round.venues.reduce((highest, venue) => Math.max(highest, projectedVenueRevenue(band, venue)), 0);
      return sum + best;
    }, 0) / Math.max(1, futureRounds.length);

  const personalityValue = promoterBandBias(manager, band);
  const activeScandalPenalty = state.persistentScandals.some(
    (entry) => entry.targetManagerId === manager.id && entry.bandName === band.name
  )
    ? Math.max(0, parseDiceAverageSigned(band.scandal) - 1) * 1.5
    : 0;
  const retentionBargain = Math.max(0, 12 - band.retention) * 0.6;
  const cheapSafeUtility =
    band.retention <= 8 && scandalAverage <= 3.5
      ? 3.5 + Math.max(0, 5 - band.retention) * 0.35
      : band.retention <= 10 && scandalAverage <= 4
        ? 1.75
        : 0;
  const cashStrained = manager.cash <= Math.max(40, contractLoad(manager) + 4);
  const rebuildBandBonus =
    cashStrained
      ? cheapDevelopmentBandScore(manager, band, futureRounds) * 0.55
      : 0;
  const projectedBenchCount = Math.max(0, manager.roster.length + 1 - currentRound.venues.length * STANDARD_VENUE_CAPACITY);
  const currentBookingPlan = bestAssignmentPlan(manager, currentRound.venues);
  const candidateBookingPlan = bestAssignmentPlan(manager, currentRound.venues, {
    roster: [...manager.roster, band],
    cashBudget: manager.cash,
  });
  const currentPlanSummary = summarizeAssignmentPlan(manager, currentRound.venues, currentBookingPlan.assignments);
  const candidatePlanSummary = summarizeAssignmentPlan(manager, currentRound.venues, candidateBookingPlan.assignments);
  const nextRound = futureRounds[0] || null;
  const nextRoundBookingPlan = nextRound
    ? bestAssignmentPlan(manager, nextRound.venues, {
        roster: [...manager.roster, band],
        cashBudget: manager.cash,
      })
    : { committedCost: 0 };
  const sequentialAdjustment = auctionSequentialAdjustment(manager, band, currentRound, {
    bestCurrentVenue,
    bestCurrentSlotUpgrade,
    strategicBonus: strategicSummary.bidBonus,
    rawPopularityAverage,
    projectedBenchCount,
  });
  const upgradePressure =
    Math.max(0, bestCurrentSlotUpgrade) * 1.4 +
    (bestCurrentSlotUpgrade > 0 ? 3 : 0);
  const currentRoundUrgency =
    Math.max(0, bestCurrentVenue) * 1.8 +
    Math.max(0, currentValue) * 0.35 +
    Math.max(0, topVenueNeutralPower) * (topVenueWeightedImportance >= 40 ? 1.4 : topVenueWeightedImportance >= 20 ? 0.75 : 0) +
    Math.max(0, rawPopularityAverage - 4) * (topVenueWeightedImportance >= 40 ? 2.25 : topVenueWeightedImportance >= 20 ? 0.85 : 0.2);
  const longTermValue = Math.max(0, futureValue) * 0.65;
  const benchPenalty = projectedBenchCount * (band.retention * 0.9 + 6);
  const cheapAnchorReady =
    currentPlanSummary.lowCostBookedCount > 0 &&
    currentPlanSummary.bestLineupRevenue >= 4;
  const coverageGain = candidatePlanSummary.bookedVenueCount - currentPlanSummary.bookedVenueCount;
  const paidCoverageGain = candidatePlanSummary.paidVenueCount - currentPlanSummary.paidVenueCount;
  const marqueeMismatchTax =
    state.round <= 2 && topVenueWeightedImportance >= 16 && topVenueSlotValue <= 0
      ? (state.round === 1 ? 8 : 4.5) + Math.max(0, 6 - bestCurrentVenue) * 0.35
      : 0;
  const patientOpeningTax =
    state.round === 1 && cheapAnchorReady && coverageGain <= 0 && paidCoverageGain <= 0 && bestCurrentSlotUpgrade < 5
      ? 6 + Math.max(0, currentPlanSummary.bestLineupRevenue - 4) * 0.35
      : 0;
  const topHeavyRoundTax =
    state.round <= 2 && topVenueWeightedImportance >= 30 && paidCoverageGain > 0 && topVenueSlotValue <= 2
      ? 5
      : 0;
  const economyDisciplineTax = marqueeMismatchTax + patientOpeningTax + topHeavyRoundTax;
  const totalValue =
    currentRoundUrgency +
    longTermValue +
    strategicSummary.bidBonus +
    retentionBargain +
    cheapSafeUtility +
    rebuildBandBonus +
    upgradePressure +
    sequentialAdjustment.urgencyBonus -
    sequentialAdjustment.waitPenalty +
    personalityValue -
    benchPenalty -
    economyDisciplineTax -
    activeScandalPenalty;
  const disciplinedValue =
    totalValue * 0.42 +
    Math.max(0, bestCurrentVenue) * 0.2 +
    Math.max(0, bestCurrentSlotUpgrade) * 0.15;
  const estimateDiscount = includePrivateHand ? 1 : 0.94;
  const likelyBookingReserve = Math.max(currentBookingPlan.committedCost, candidateBookingPlan.committedCost);
  const nextRoundReserve = Math.round(nextRoundBookingPlan.committedCost * 0.35);
  const existingRetentionExposure = manager.roster.reduce((sum, rosterBand) => sum + rosterBand.retention, 0);
  const candidateRetentionExposure = existingRetentionExposure + band.retention;
  const earlyRoundCaution = Math.max(0, 4 - state.round);
  const retentionReserve =
    Math.min(20, candidateRetentionExposure * (state.round <= 2 ? 0.24 : 0.16)) +
    earlyRoundCaution * 4;
  const premiumVenueReserve =
    topVenueWeightedImportance >= 40
      ? 4
      : topVenueWeightedImportance >= 18
        ? 2
        : 0;
  const futureSafetyReserve = Math.min(
    4,
    Math.max(0, sequentialAdjustment.hiddenRemaining - 1) +
      Math.max(0, projectedBenchCount - 1)
  );
  const liquidityReserve =
    likelyBookingReserve +
    nextRoundReserve +
    retentionReserve +
    premiumVenueReserve +
    futureSafetyReserve;
  const liquidityAwareCap = Math.max(0, manager.cash - 1 - Math.round(liquidityReserve * profile.reserveMultiplier));
  const earlyRoundValuationScale =
    state.round <= 1
      ? 0.72
      : state.round === 2
        ? 0.8
        : state.round === 3
          ? 0.9
          : 1;
  const expensiveBandTax =
    state.round <= 2
      ? Math.max(0, band.retention - 12) * 0.45 * profile.expensiveBandTaxMultiplier
      : state.round === 3
        ? Math.max(0, band.retention - 14) * 0.2 * ((profile.expensiveBandTaxMultiplier + 1) / 2)
        : 0;
  const cashStrainedLuxuryTax =
    cashStrained
      ? Math.max(0, band.retention - 9) * 0.75 + Math.max(0, scandalAverage - 2.5) * 2.5
      : 0;
  const valuationCap = Math.max(
    0,
    Math.round(
      disciplinedValue * estimateDiscount * earlyRoundValuationScale * profile.auctionValueScale * profile.earlyAuctionScale * bandBidMultiplier -
      expensiveBandTax -
      cashStrainedLuxuryTax
    )
  );
  const baseCap = Math.max(0, Math.min(liquidityAwareCap, valuationCap));
  const desperateCoverageNeed =
    manager.roster.length <= 1 ||
    needs.rosterShortage >= Math.ceil(currentRound.venues.length * STANDARD_VENUE_CAPACITY * 0.5) ||
    needs.emptyVenueCount >= Math.ceil(currentRound.venues.length * 0.5);
  const bargainUsefulness =
    Math.max(bestCurrentVenue, bestCurrentSlotUpgrade + 1, futureValue * 0.45) +
    Math.max(0, strategicSummary.bidBonus * 0.22);
  const survivalBidFloor =
    desperateCoverageNeed && bargainUsefulness >= -0.5 && manager.cash >= 2
      ? Math.min(
          manager.cash,
          bargainUsefulness >= 7 || bestCurrentSlotUpgrade >= 4 || futureValue >= 10 ? 3 : 2
        )
      : 0;
  const cheapContestUtility =
    Math.max(0, bestCurrentVenue) * 0.75 +
    Math.max(0, bestCurrentSlotUpgrade) * 1.05 +
    Math.max(0, futureValue) * 0.35 +
    Math.max(0, strategicSummary.bidBonus) * 0.16 +
    (coverageGain > 0 ? 2.5 : 0) +
    (paidCoverageGain > 0 ? 1.5 : 0) +
    (needs.weakVenueCount > 0 ? 1.25 : 0);
  const canAffordCheapContest =
    manager.cash - Math.max(0, Math.round(liquidityReserve)) >= 8;
  const opportunisticBidFloor =
    canAffordCheapContest &&
    band.retention <= 18 &&
    cheapContestUtility >= 4
      ? Math.min(
          manager.cash,
          cheapContestUtility >= 8 || bestCurrentSlotUpgrade >= 4 || bestCurrentVenue >= 6 ? 5 : 4
        )
      : 0;
  return Math.max(baseCap, survivalBidFloor, Math.round(opportunisticBidFloor * profile.cheapContestFloorScale));
}

function managerPressureBidCap(manager, band, currentRound, futureRounds) {
  const hardCap = managerBidCap(manager, band, currentRound, futureRounds);
  if (!currentRound?.venues?.length || hardCap <= 0) {
    return hardCap;
  }
  const profile = aiPromoterProfile(manager);

  const publicSummary = auctionStrategicSummary(manager, band, currentRound, futureRounds, { includePrivateHand: false });
  const currentVenueValues = currentRound.venues.map((venue) => projectedVenueRevenue(band, venue));
  const bestCurrentVenue = Math.max(...currentVenueValues);
  const bestCurrentSlotUpgrade = bestCurrentSlotUpgradeForBand(manager, band, currentRound);
  const projectedBenchCount = Math.max(0, manager.roster.length + 1 - currentRound.venues.length * STANDARD_VENUE_CAPACITY);
  const rawPopularityAverage = parseDiceAverageSigned(band.popularity);
  const sequentialAdjustment = auctionSequentialAdjustment(manager, band, currentRound, {
    bestCurrentVenue,
    bestCurrentSlotUpgrade,
    strategicBonus: publicSummary.bidBonus,
    rawPopularityAverage,
    projectedBenchCount,
  });

  return Math.max(0, Math.min(hardCap, Math.round(hardCap - sequentialAdjustment.pressureDiscount * profile.pressureBias)));
}

function estimatedRivalAuctionCaps(observer, band, currentRound, futureRounds) {
  return state.managers
    .filter((manager) => manager.id !== observer.id)
    .map((manager) => {
      const publicCap = managerBidCap(manager, band, currentRound, futureRounds, { includePrivateHand: false });
      const estimationBias = manager.isPlayer
        ? 0.95
        : manager.name === "Dylan Collins"
          ? 1.05
          : manager.name === "Buzz Smiley"
            ? 0.9
            : 0.98;
      return {
        manager,
        cap: Math.max(0, Math.round(publicCap * estimationBias)),
      };
    })
    .sort((a, b) => b.cap - a.cap);
}

function nextLegalBid(band) {
  return Math.max(1, band.currentBid + 1);
}

function activeAuctionBandIndex() {
  return state.marketBands.findIndex((band) => !band.resolved);
}

function logNextAuctionReveal() {
  const nextIndex = activeAuctionBandIndex();
  if (nextIndex < 0) {
    return;
  }

  const nextBand = state.marketBands[nextIndex];
  const stage = auctionStageSnapshot(nextIndex);
  const hiddenLine = stage.hiddenRemaining
    ? `${stage.hiddenRemaining} hidden ${stage.hiddenRemaining === 1 ? "act remains" : "acts remain"} after this auction.`
    : "This is the final act of the round.";
  logEvent(`Auction ${stage.currentAuctionNumber} of ${stage.totalBands}: ${nextBand.name} is now on the block. ${hiddenLine}`);
}

function preparePostAuctionReview() {
  if (!state.marketBands.every((entry) => entry.resolved)) {
    return;
  }

  const roundData = currentRoundData();
  const player = state.managers[0];
  if (!roundData || !player) {
    return;
  }

  state.managers.forEach((manager) => {
    chooseBestAssignments(manager, roundData.venues);
  });
  state.reviewingAssignments = false;
  state.activeWorkspace = "auction";
  if (assignmentIsComplete(player, roundData)) {
    logEvent("Auction finished. Press Assign Bands To Venues to review the suggested bookings before the card phase.");
  } else {
    logEvent("Auction finished. Press Assign Bands To Venues and make sure every venue has a band before the card phase.");
  }
}

function resolveAuctionWinner(band, winner, winningBid) {
  const finalWinningBid = Math.max(1, winningBid);
  winner.cash -= finalWinningBid;
  winner.roster.push(cloneBand(band));
  band.resolved = true;
  band.currentBid = finalWinningBid;
  band.currentLeaderId = winner.id;
  band.currentLeaderName = winner.name;
  band.resultText = `${winner.name} wins for ${formatCash(finalWinningBid)}.`;
  autofillAssignments(winner, currentRoundData());
  logEvent(`${winner.name} signed ${band.name} for ${formatCash(finalWinningBid)}.`);
  if (!state.marketBands.every((entry) => entry.resolved)) {
    logNextAuctionReveal();
  } else {
    preparePostAuctionReview();
  }
}

function resolveNoBidAuction(band) {
  state.bandDeck.push(cloneBand(band));
  band.resolved = true;
  band.resultText = "No bids. The band goes back into the pile.";
  logEvent(`${band.name} drew no bids and returned to the pile.`);
  if (!state.marketBands.every((entry) => entry.resolved)) {
    logNextAuctionReveal();
  } else {
    preparePostAuctionReview();
  }
}

function activeAiManagers() {
  return state.managers.filter((manager) => !manager.isPlayer);
}

function aiCanBeatBid(manager, band, roundData, futureRounds) {
  return managerBidCap(manager, band, roundData, futureRounds) >= nextLegalBid(band);
}

function auctionLiveRaiseWindow(manager, minimum, stage, wantsToOwn, bestCurrentVenue, bestCurrentSlotUpgrade) {
  const profile = aiPromoterProfile(manager);
  let raiseWindow =
    minimum <= 3 ? 2
      : minimum <= 8 ? 3
        : minimum <= 15 ? 4
          : 5;

  if (stage.hiddenRemaining === 0) {
    raiseWindow += 1;
  }
  if (bestCurrentSlotUpgrade >= 8 || bestCurrentVenue >= 12) {
    raiseWindow += 1;
  }
  raiseWindow += profile.raiseWindowModifier;
  if (!wantsToOwn) {
    raiseWindow = Math.min(raiseWindow, 2);
  }

  return Math.max(1, raiseWindow);
}

function chooseAiCounterBid(manager, band, roundData, futureRounds) {
  const profile = aiPromoterProfile(manager);
  const minimum = nextLegalBid(band);
  const hardCap = managerBidCap(manager, band, roundData, futureRounds);
  if (hardCap < minimum) {
    return null;
  }

  const pressureCap = managerPressureBidCap(manager, band, roundData, futureRounds);
  const rivalCaps = estimatedRivalAuctionCaps(manager, band, roundData, futureRounds);
  const topRivalCap = rivalCaps[0]?.cap ?? minimum - 1;
  const secondRivalCap = rivalCaps[1]?.cap ?? minimum - 1;
  const bestCurrentVenue = Math.max(...roundData.venues.map((venue) => projectedVenueRevenue(band, venue)), 0);
  const bestCurrentSlotUpgrade = bestCurrentSlotUpgradeForBand(manager, band, roundData);
  const stage = auctionStageSnapshot();
  const currentLeader = state.managers.find((candidate) => candidate.id === band.currentLeaderId) || null;
  const currentLeaderCashEdge = currentLeader ? currentLeader.cash - manager.cash : 0;
  const currentLeaderRosterNeed = currentLeader
    ? Math.max(0, roundData.venues.length * STANDARD_VENUE_CAPACITY - currentLeader.roster.length)
    : 0;
  const marketSweepThreat =
    Boolean(currentLeader) &&
    currentLeader.id !== manager.id &&
    currentLeaderCashEdge >= 20 &&
    currentLeaderRosterNeed > 0 &&
    minimum <= Math.min(hardCap, 8);
  const wantsToOwn =
    minimum > pressureCap ||
    stage.hiddenRemaining === 0 ||
    bestCurrentSlotUpgrade >= 8 ||
    bestCurrentVenue >= 12 ||
    hardCap - minimum >= (profile.raiseWindowModifier > 0 ? 4 : 5) ||
    topRivalCap < minimum ||
    marketSweepThreat;
  const raiseWindow = auctionLiveRaiseWindow(
    manager,
    minimum,
    stage,
    wantsToOwn,
    bestCurrentVenue,
    bestCurrentSlotUpgrade
  );

  if (!wantsToOwn && pressureCap >= minimum) {
    const drainMargin = profile.raiseWindowModifier < 0 ? 2 : 1;
    const pressureTarget = Math.max(
      minimum,
      Math.min(pressureCap, topRivalCap - drainMargin)
    );
    const visiblePressureTarget = Math.min(pressureTarget, minimum + raiseWindow);
    const pressureWindow = Math.max(0, visiblePressureTarget - minimum);
    return minimum + Math.floor(Math.random() * (pressureWindow + 1));
  }

  const competitiveNudge =
    topRivalCap >= minimum
      ? Math.min(2, Math.max(1, Math.ceil((topRivalCap - minimum + 1) / Math.max(3, stage.hiddenRemaining + 2))))
      : 0;
  const denyPressureBonus =
    marketSweepThreat
      ? Math.min(2, Math.max(1, Math.ceil(currentLeaderCashEdge / 35)))
      : 0;
  const visibleOwnTarget = Math.min(
    hardCap,
    minimum + raiseWindow + competitiveNudge + denyPressureBonus
  );
  const visibleFloor = Math.max(
    minimum,
    Math.min(visibleOwnTarget, secondRivalCap >= minimum ? minimum + 1 : minimum)
  );
  const aggressionWindow = Math.max(0, visibleOwnTarget - visibleFloor);
  return visibleFloor + Math.floor(Math.random() * (aggressionWindow + 1));
}

function advanceAiAuction(index, autoFinish = false) {
  const band = state.marketBands[index];
  const roundData = currentRoundData();
  if (!band || band.resolved || state.phase !== "auction" || !roundData) {
    return "idle";
  }

  const futureRounds = visibleFutureRounds();
  const contenders = activeAiManagers()
    .filter((manager) => manager.id !== band.currentLeaderId && !band.aiPassed[manager.id] && aiCanBeatBid(manager, band, roundData, futureRounds))
    .map((manager) => ({
      manager,
      bid: chooseAiCounterBid(manager, band, roundData, futureRounds),
      cap: managerBidCap(manager, band, roundData, futureRounds),
    }))
    .filter((entry) => entry.bid !== null);

  if (!contenders.length) {
    if (band.currentLeaderId) {
      const winner = state.managers.find((manager) => manager.id === band.currentLeaderId);
      if (winner) {
        resolveAuctionWinner(band, winner, band.currentBid);
        return "resolved";
      }
    }

    if (autoFinish) {
      resolveNoBidAuction(band);
      return "resolved";
    }

    return "open";
  }

  contenders.sort((a, b) => b.bid - a.bid || b.cap - a.cap || Math.random() - 0.5);
  const counter = contenders[0];
  band.currentBid = counter.bid;
  band.currentLeaderId = counter.manager.id;
  band.currentLeaderName = counter.manager.name;
  band.resultText = `${counter.manager.name} raises to ${formatCash(counter.bid)}.`;
  logEvent(`${counter.manager.name} raises ${band.name} to ${formatCash(counter.bid)}.`);
  return "countered";
}

function finishAiOnlyAuction(index) {
  const band = state.marketBands[index];
  if (!band || band.resolved || !currentRoundData()) {
    return;
  }

  let guard = 0;
  while (!band.resolved && guard < 96) {
    const outcome = advanceAiAuction(index, true);
    if (outcome !== "countered") {
      break;
    }
    guard += 1;
  }

  if (!band.resolved) {
    if (band.currentLeaderId) {
      const winner = state.managers.find((manager) => manager.id === band.currentLeaderId);
      if (winner && !winner.isPlayer) {
        resolveAuctionWinner(band, winner, band.currentBid);
        return;
      }
    }
    resolveNoBidAuction(band);
  }
}

function resolveAuction(index, playerBid, didPass = false) {
  const band = state.marketBands[index];
  const roundData = currentRoundData();
  const activeIndex = activeAuctionBandIndex();
  if (!band || band.resolved || state.phase !== "auction" || !roundData || index !== activeIndex) {
    return;
  }

  const player = state.managers[0];

  if (didPass) {
    band.playerPassed = true;
    finishAiOnlyAuction(index);
    render();
    return;
  }

  if (band.playerPassed) {
    return;
  }

  const bidAmount = Number(playerBid);
  const minimum = nextLegalBid(band);
  if (!Number.isFinite(bidAmount) || Math.round(bidAmount) < minimum || Math.round(bidAmount) > player.cash) {
    band.resultText = `Your next bid must be at least ${formatCash(minimum)} and no more than ${formatCash(player.cash)}.`;
    render();
    return;
  }

  const finalPlayerBid = Math.round(bidAmount);
  band.currentBid = finalPlayerBid;
  band.currentLeaderId = player.id;
  band.currentLeaderName = player.name;
  band.resultText = `You bid ${formatCash(finalPlayerBid)}. Waiting on the other promoters.`;
  logEvent(`${player.name} bids ${formatCash(finalPlayerBid)} on ${band.name}.`);

  const aiOutcome = advanceAiAuction(index, false);
  if (aiOutcome === "open") {
    resolveAuctionWinner(band, player, band.currentBid);
  }

  render();
}

function setPlayerAssignment(venueType, slotKey, bandName) {
  const player = state.managers[0];
  if (bandName && bandIsSittingOutThisRound(player.id, bandName)) {
    render();
    return;
  }
  setManagerAssignment(player, venueType, slotKey, bandName);
  render();
}

function setSelectedPreviewRound(roundNumber) {
  state.selectedPreviewRound = roundNumber;
  render();
}

function advertisingVenueForTarget(roundNumber, venueType) {
  return state.schedule
    .find((round) => round.roundNumber === roundNumber)
    ?.venues.find((venue) => venue.type === venueType) || null;
}

function logCurrentRoundAdvertisingReveal() {
  const roundData = currentRoundData();
  if (!roundData) {
    return;
  }

  const lines = roundData.venues
    .map((venue) => {
      const placements = advertisingPlacementsForVenue(roundData.roundNumber, venue.type);
      if (!placements.length) {
        return "";
      }
      const summary = state.managers
        .map((manager) => {
          const managerPlacements = placements.filter((placement) => placement.managerId === manager.id);
          if (!managerPlacements.length) {
            return "";
          }
          return `${manager.name} ${managerPlacements.map((placement) => `+${placement.value}`).join(" + ")}`;
        })
        .filter(Boolean)
        .join(" • ");
      return `${venue.type}: ${venue.name} -> ${summary}`;
    })
    .filter(Boolean);

  if (lines.length) {
    logEvent(`Advertising flips for this week's venues: ${lines.join(" | ")}.`);
  }
}

function placeAdvertising(manager, targetKey, value, options = {}) {
  const {
    hiddenToOpponents = false,
  } = options;
  if (!canManagerPlaceAdvertising(manager, value, targetKey)) {
    return false;
  }

  const target = decodeAdvertisingTarget(targetKey);
  const venue = advertisingVenueForTarget(target.roundNumber, target.venueType);
  if (!venue) {
    return false;
  }

  const inventoryIndex = manager.advertisingInventory.indexOf(value);
  if (inventoryIndex < 0) {
    return false;
  }

  manager.advertisingInventory.splice(inventoryIndex, 1);
  manager.cash -= advertisingCost(value);
  state.advertisingPlacements.push({
    managerId: manager.id,
    managerName: manager.name,
    placedRoundNumber: state.round,
    targetRoundNumber: target.roundNumber,
    venueType: target.venueType,
    venueName: venue.name,
    value,
  });
  state.selectedAdvertisingValue = 0;
  state.selectedAdvertisingTarget = "";

  logEvent(
    hiddenToOpponents
      ? `${manager.name} placed face-down advertising at Round ${target.roundNumber} ${target.venueType}: ${venue.name}.`
      : `${manager.name} placed +${value} advertising at Round ${target.roundNumber} ${target.venueType}: ${venue.name} for ${formatCash(advertisingCost(value))}.`
  );
  return true;
}

function advertisingForecastForRound(round, viewerManagerId = "") {
  return state.managers.map((manager) => {
    const plan = bestAssignmentPlan(manager, round.venues, { cashBudget: manager.cash });
    const plannedManager = cloneManagerWithAssignments(manager, round);
    plannedManager.assignments = plan.assignments;
    return {
      manager,
      plannedManager,
      estimates: Object.fromEntries(
        round.venues.map((venue) => [
          venue.type,
          estimatedVenueStrength(plannedManager, venue, round, {
            viewerManagerId: manager.id === viewerManagerId ? viewerManagerId : "",
          }),
        ])
      ),
    };
  });
}

function totalVenuePointsForRound(round) {
  return (round?.venues || []).reduce((sum, venue) => sum + (venue.venuePoints || 0), 0);
}

function latestGuaranteedAdvertisingRoundNumber(futureRounds) {
  if (!futureRounds.length) {
    return state.round;
  }

  const guaranteedThreshold = state.managers.length * VICTORY_TARGET;
  let totalVpInSystem = state.managers.reduce((sum, manager) => sum + manager.victoryPoints, 0);
  let latestGuaranteed = state.round;

  futureRounds.forEach((round) => {
    if (totalVpInSystem >= guaranteedThreshold) {
      return;
    }
    latestGuaranteed = round.roundNumber;
    totalVpInSystem += totalVenuePointsForRound(round);
  });

  return latestGuaranteed;
}

function earliestPossibleWinningRoundNumber(futureRounds) {
  if (!futureRounds.length) {
    return null;
  }

  const currentLeaderVp = Math.max(...state.managers.map((manager) => manager.victoryPoints));
  let cumulativeAvailableVp = 0;

  for (const round of futureRounds) {
    cumulativeAvailableVp += totalVenuePointsForRound(round);
    if (currentLeaderVp + cumulativeAvailableVp >= VICTORY_TARGET) {
      return round.roundNumber;
    }
  }

  return null;
}

function earliestReachableWinningRoundNumber(manager, futureRounds) {
  if (!manager || !futureRounds.length) {
    return null;
  }

  const pointsNeeded = Math.max(0, VICTORY_TARGET - manager.victoryPoints);
  if (pointsNeeded <= 0) {
    return state.round;
  }

  let cumulativeAvailableVp = 0;
  for (const round of futureRounds) {
    cumulativeAvailableVp += totalVenuePointsForRound(round);
    if (cumulativeAvailableVp >= pointsNeeded) {
      return round.roundNumber;
    }
  }

  return null;
}

function advertisingStrategyProfile(manager) {
  if (manager.name === "Buzz Smiley") {
    return {
      nearTermBonus: 7,
      distancePenalty: 3.2,
      spendTax: 1.28,
      valueAggression: 0.94,
      bigVenueBias: 0.6,
      cheapBuyBonus: 3.5,
      cashReserveBias: 1.25,
      volatility: 0.75,
      delayedLockTax: 1.25,
      premiumNextRoundBias: 0.8,
    };
  }

  if (manager.name === "Dylan Collins") {
    return {
      nearTermBonus: 5,
      distancePenalty: 2.8,
      spendTax: 1.4,
      valueAggression: 0.9,
      bigVenueBias: 0.55,
      cheapBuyBonus: 2,
      cashReserveBias: 1.35,
      volatility: 0.45,
      delayedLockTax: 1.4,
      premiumNextRoundBias: 0.7,
    };
  }

  if (manager.name === "Romeo Tiramisu") {
    return {
      nearTermBonus: 3,
      distancePenalty: 1.8,
      spendTax: 1.02,
      valueAggression: 1.1,
      bigVenueBias: 1.05,
      cheapBuyBonus: 1,
      cashReserveBias: 0.95,
      volatility: 1.2,
      delayedLockTax: 1.05,
      premiumNextRoundBias: 1.4,
    };
  }

  return {
    nearTermBonus: 4,
    distancePenalty: 2.4,
    spendTax: 1.12,
    valueAggression: 1,
    bigVenueBias: 0.7,
    cheapBuyBonus: 2,
    cashReserveBias: 1,
    volatility: 0.7,
    delayedLockTax: 1.15,
    premiumNextRoundBias: 1,
  };
}

function aiAdvertisingLiquidityReserve(manager, futureRounds, profile = advertisingStrategyProfile(manager)) {
  const nextRound = futureRounds[0];
  if (!nextRound) {
    return 0;
  }

  const bookingPlan = bestAssignmentPlan(manager, nextRound.venues, { cashBudget: manager.cash });
  const needProfile = managerAuctionNeedProfile(manager, nextRound);
  const baseAuctionReserve =
    state.round <= 1
      ? 10
      : state.round === 2
        ? 8
        : state.round === 3
          ? 6
          : 4;
  const shortageReserve =
    needProfile.rosterShortage * 2.5 +
    needProfile.emptyVenueCount * 3 +
    needProfile.weakVenueCount * 1.25;

  return Math.max(
    aiRetentionLiquidityFloor(futureRounds),
    Math.round((bookingPlan.committedCost + baseAuctionReserve + shortageReserve) * profile.cashReserveBias)
  );
}

function chooseAiAdvertisingPlacement(manager) {
  if (advertisingPlacementsThisRound(manager.id).length >= advertisingPlacementLimit(manager)) {
    return null;
  }

  const futureRounds = visibleFutureRounds();
  const values = advertisingTilesForManager(manager).filter((value) => advertisingCost(value) <= manager.cash);
  if (!futureRounds.length || !values.length) {
    return null;
  }

  const profile = advertisingStrategyProfile(manager);
  const guaranteedLatestRoundNumber = latestGuaranteedAdvertisingRoundNumber(futureRounds);
  const earliestPossibleEndRoundNumber = earliestPossibleWinningRoundNumber(futureRounds);
  const ownWinningWindowRoundNumber = earliestReachableWinningRoundNumber(manager, futureRounds);
  const ownPointsNeededToWin = Math.max(0, VICTORY_TARGET - manager.victoryPoints);
  const liquidityReserve = aiAdvertisingLiquidityReserve(manager, futureRounds, profile);
  const retentionExposure = contractLoad(manager);
  let bestOption = null;

  futureRounds.forEach((round) => {
    if (round.roundNumber > guaranteedLatestRoundNumber) {
      return;
    }

    const forecast = advertisingForecastForRound(round, manager.id);
    const ownForecast = forecast.find((entry) => entry.manager.id === manager.id);
    if (!ownForecast) {
      return;
    }

    round.venues.forEach((venue) => {
      if (managerAdvertisingPlacementsForVenue(manager.id, round.roundNumber, venue.type).length >= MAX_ADVERTISING_PER_VENUE) {
        return;
      }

      const ownEstimate = ownForecast.estimates[venue.type];
      if (!ownEstimate?.performances?.length) {
        return;
      }

      const topRivalPopularity = forecast
        .filter((entry) => entry.manager.id !== manager.id)
        .reduce((best, entry) => Math.max(best, entry.estimates[venue.type]?.popularity || 0), 0);
      const scoreGap = topRivalPopularity - ownEstimate.popularity;

      values.forEach((value) => {
        const spend = advertisingCost(value);
        const remainingCash = manager.cash - spend;
        const turnsAway = Math.max(0, round.roundNumber - state.round - 1);
        const projectedPostRetentionCash =
          remainingCash - Math.min(retentionExposure, Math.max(0, remainingCash));
        const venueAccessBuffer =
          venue.cost +
          (turnsAway === 0 ? 4 : turnsAway === 1 ? 2 : 0);
        const valueGain = value * venue.revenueFactor * (1.5 + profile.valueAggression * 0.3);
        const takeLeadBonus = ownEstimate.popularity + value > topRivalPopularity ? venue.venuePoints * 7 : 0;
        const nearLeadBonus = ownEstimate.popularity + value >= topRivalPopularity - 2 ? venue.venuePoints * 2.2 : 0;
        const wastePenalty = scoreGap <= 0 ? value * 1.4 : Math.max(0, value - scoreGap - 2) * 1.8;
        const liquidityShortfall = Math.max(0, liquidityReserve - remainingCash);
        const cashPenalty =
          spend * ((manager.cash < 30 ? 1.8 : manager.cash < 50 ? 1.35 : 1.05) * profile.spendTax) +
          liquidityShortfall * (2.2 + profile.cashReserveBias * 0.9);
        const distancePenalty = turnsAway * profile.distancePenalty;
        const nearTermBonus = turnsAway === 0 ? profile.nearTermBonus : turnsAway === 1 ? profile.nearTermBonus * 0.35 : 0;
        const cheapBuyBonus = spend <= 4 ? profile.cheapBuyBonus : 0;
        const bigVenueBonus = venue.venuePoints * venue.revenueFactor * profile.bigVenueBias * 0.12;
        const premiumNextRoundBonus =
          turnsAway === 0 && venue.revenueFactor >= 3
            ? (
                venue.venuePoints * venue.revenueFactor * (1.4 + profile.premiumNextRoundBias * 0.55) +
                Math.max(0, ownEstimate.revenue) * 0.35 +
                (ownEstimate.popularity + value >= topRivalPopularity - 3 ? 8 : 0)
              )
            : 0;
        const venueClinchCoverage =
          ownPointsNeededToWin > 0
            ? Math.min(1, venue.venuePoints / ownPointsNeededToWin)
            : 0;
        const titleShotBonus =
          ownWinningWindowRoundNumber && round.roundNumber === ownWinningWindowRoundNumber
            ? (
                (18 + venue.venuePoints * 2 + Math.max(0, ownEstimate.revenue) * 0.35) *
                  (0.9 + profile.valueAggression * 0.25) +
                venueClinchCoverage * 18 +
                (ownPointsNeededToWin > 0 && ownPointsNeededToWin <= venue.venuePoints ? 12 : 0)
              )
            : 0;
        const earlyEndRiskPenalty =
          earliestPossibleEndRoundNumber && round.roundNumber > earliestPossibleEndRoundNumber
            ? (round.roundNumber - earliestPossibleEndRoundNumber) * (14 + (manager.cash < 40 ? 4 : 0))
            : 0;
        const delayedLockPenalty =
          turnsAway > 0
            ? (
                spend * profile.delayedLockTax * (manager.cash < 50 ? 1.6 : manager.cash < 75 ? 1.2 : 0.8) +
                Math.max(0, liquidityReserve + 10 - remainingCash) * (0.45 + turnsAway * 0.18)
              )
            : 0;
        const volatilityNoise = (Math.random() - 0.5) * 4 * profile.volatility;
        const conservativeSkip =
          turnsAway >= 2 &&
          liquidityShortfall > 0 &&
          manager.cash < 45;
        const cashStarvedFutureSkip =
          turnsAway > 0 &&
          manager.cash < Math.max(55, liquidityReserve + 8) &&
          venue.revenueFactor < 3 &&
          ownEstimate.popularity + value < topRivalPopularity;
        const cannotLikelyAffordTargetVenue =
          venue.cost > 0 &&
          (
            (turnsAway === 0 && remainingCash < venue.cost) ||
            (turnsAway <= 1 && projectedPostRetentionCash < venueAccessBuffer)
          );
        if (conservativeSkip) {
          return;
        }
        if (cashStarvedFutureSkip) {
          return;
        }
        if (cannotLikelyAffordTargetVenue) {
          return;
        }
        const optionScore =
          venueStrategicWeight(venue) * 0.9 +
          Math.max(0, ownEstimate.revenue) * 0.85 +
          valueGain +
          takeLeadBonus +
          nearLeadBonus -
          wastePenalty -
          cashPenalty -
          distancePenalty -
          delayedLockPenalty -
          earlyEndRiskPenalty +
          nearTermBonus +
          cheapBuyBonus +
          titleShotBonus +
          premiumNextRoundBonus +
          bigVenueBonus +
          volatilityNoise;

        if (!bestOption || optionScore > bestOption.score) {
          bestOption = {
            score: optionScore,
            roundNumber: round.roundNumber,
            venueType: venue.type,
            value,
          };
        }
      });
    });
  });

  if (!bestOption || bestOption.score < 12) {
    return null;
  }

  return {
    targetKey: advertisingTargetKey(bestOption.roundNumber, bestOption.venueType),
    value: bestOption.value,
  };
}

function autoPlaceAiAdvertising() {
  state.managers.slice(1).forEach((manager) => {
    while (advertisingPlacementsThisRound(manager.id).length < advertisingPlacementLimit(manager)) {
      const placement = chooseAiAdvertisingPlacement(manager);
      if (!placement) {
        break;
      }
      placeAdvertising(manager, placement.targetKey, placement.value, { hiddenToOpponents: true });
    }
  });
}

function enterAdvertisingPhase() {
  const futureRounds = visibleFutureRounds();
  if (!futureRounds.length) {
    dealRound();
    return;
  }

  logEvent("Advertising phase begins. Promoters may place face-down advertising buys on venues in the next five rounds.");
  state.phase = "advertising";
  state.activeWorkspace = "results";
  state.activeSidebarView = "results";
  state.selectedPreviewRound = futureRounds[0]?.roundNumber || state.round;
  state.selectedAdvertisingValue = 0;
  state.selectedAdvertisingTarget = "";
  autoPlaceAiAdvertising();
  render();
}

function initializeRetentionChoices() {
  state.pendingRetentions = Object.fromEntries(
    state.managers.map((manager) => [
      manager.id,
      manager.roster.map((band) => band.name),
    ])
  );
}

function projectedBandValueAcrossPreview(band, rounds) {
  if (!rounds.length) {
    return 0;
  }

  return rounds.reduce((sum, round) => {
    const bestVenueValue = round.venues.reduce((best, venue) => Math.max(best, projectedVenueRevenue(band, venue)), 0);
    return sum + bestVenueValue;
  }, 0);
}

function aiRetentionLiquidityFloor(futureRounds) {
  const nextRound = futureRounds[0];
  if (!nextRound) {
    return 0;
  }

  const paidVenueCosts = nextRound.venues
    .filter((venue) => venue.cost > 0)
    .map((venue) => venue.cost);
  const cheapestPaidVenue = paidVenueCosts.length ? Math.min(...paidVenueCosts) : 0;
  const earlyRoundReserve =
    state.round <= 1
      ? 10
      : state.round === 2
        ? 8
        : state.round === 3
          ? 6
          : 4;
  const futurePressureReserve = futureRounds.length >= 3 ? 2 : 0;

  return cheapestPaidVenue + earlyRoundReserve + futurePressureReserve;
}

function nextRoundGenreDemand(round, genreKey) {
  if (!round?.venues?.length) {
    return 0;
  }

  return round.venues.reduce((count, venue) => count + ((venue[genreKey] || 0) > 0 ? 1 : 0), 0);
}

function retentionBandDemandScore(manager, band, futureRounds) {
  const nextRound = futureRounds[0] || null;
  const nextRoundValue = nextRound ? projectedRetentionBandValue(manager, band, [nextRound]) : 0;
  const previewValue = projectedRetentionBandValue(manager, band, futureRounds.slice(0, 2));
  const scandalPressure = Math.max(0, parseDiceAverageSigned(effectiveScandalNotation(manager.id, band)) - 2);
  const retentionCost = retentionCostForBand(band);
  return (
    nextRoundValue * 1.6 +
    previewValue * 0.55 +
    Math.max(0, 12 - retentionCost) * 0.8 -
    retentionCost * 0.4 -
    scandalPressure * 4
  );
}

function cheapDevelopmentBandScore(manager, band, futureRounds) {
  const scandalAverage = parseDiceAverageSigned(effectiveScandalNotation(manager.id, band));
  const previewValue = projectedRetentionBandValue(manager, band, futureRounds.slice(0, 2));
  const popularityAverage = parseDiceAverageSigned(band.popularity);
  const retentionCost = retentionCostForBand(band);
  return (
    Math.max(0, 10 - retentionCost) * 2.2 +
    Math.max(0, 3.5 - scandalAverage) * 6 +
    Math.max(0, 5 - popularityAverage) * 0.8 +
    previewValue * 0.2
  );
}

function projectedRetentionBandValue(manager, band, rounds) {
  if (!rounds.length) {
    return 0;
  }

  const smash = persistentSmashSummary(manager.id, band);
  const badSong = persistentBadSongSummary(manager.id, band);
  const scandalAdjustment = persistentScandalAdjustmentSummary(manager.id, band);
  const persistentScandalEntries = state.persistentScandals.filter(
    (entry) => entry.targetManagerId === manager.id && entry.bandName === band.name
  );
  const persistentScandalPenalty = persistentScandalEntries.reduce(
    (sum, entry) => sum + estimatedScandalPenaltyForEffect(entry.effect, band, entry.flatPenalty, scandalAdjustment.modifier, scandalAdjustment.diceModifier),
    0
  );
  const baggagePenalty = badSong.penalty + persistentScandalPenalty;

  return rounds.reduce((sum, round) => {
    const bestVenueValue = round.venues.reduce((best, venue) => {
      const baselineRevenue = projectedVenueRevenueWithPopularityDelta(
        band,
        venue,
        smash.bonus - badSong.penalty,
        (smash.diceBonus || 0) + (badSong.diceModifier || 0)
      );
      const adjustedRevenue = baselineRevenue - baggagePenalty * venue.revenueFactor;
      return Math.max(best, adjustedRevenue);
    }, 0);
    return sum + bestVenueValue;
  }, 0);
}

function scoreAiRetentionSubset(manager, keptBands, futureRounds) {
  const profile = aiPromoterProfile(manager);
  const retentionFee = keptBands.reduce((sum, band) => sum + retentionCostForBand(band), 0);
  const remainingCash = manager.cash - retentionFee;
  if (remainingCash < 0) {
    return null;
  }

  const nextRound = futureRounds[0] || null;
  const settledRound = currentRoundData();
  const cashStrained = remainingCash <= Math.max(28, retentionFee * 0.9);
  const futureCarryValue = keptBands.reduce((sum, band) => sum + projectedRetentionBandValue(manager, band, futureRounds), 0);
  const redundancyPenaltyByBand = new Map();
  if (nextRound && keptBands.length) {
    GENRE_KEYS.forEach((genreKey) => {
      const matchingBands = keptBands
        .filter((band) => genreParts(band.genre).includes(genreKey))
        .map((band) => ({
          band,
          score: retentionBandDemandScore(manager, band, futureRounds),
          fit: genreFitScore(band, nextRound.venues.reduce((bestVenue, venue) => (
            !bestVenue || genreFitScore(band, venue) > genreFitScore(band, bestVenue) ? venue : bestVenue
          ), null)),
        }))
        .sort((left, right) => right.score - left.score || right.fit - left.fit || left.band.retention - right.band.retention);

      const demand = Math.max(1, nextRoundGenreDemand(nextRound, genreKey));
      matchingBands.slice(demand).forEach(({ band, fit }, index) => {
        const currentPenalty = redundancyPenaltyByBand.get(band.name) || 0;
        const multiGenreRelief = genreParts(band.genre).length > 1 ? 0.65 : 1;
        const excessDepth = index + 1;
        const penalty =
          (
            6 +
            Math.max(0, retentionCostForBand(band) - 8) * 0.8 +
            Math.max(0, parseDiceAverageSigned(effectiveScandalNotation(manager.id, band)) - 1) * 2.2 +
            Math.max(0, 3 - fit) * 1.8 +
            excessDepth * 4
          ) * multiGenreRelief;
        redundancyPenaltyByBand.set(band.name, Math.max(currentPenalty, penalty));
      });
    });
  }
  const redundancyTax = keptBands.reduce((sum, band) => sum + (redundancyPenaltyByBand.get(band.name) || 0), 0);
  const developmentCoreBonus = keptBands.reduce((sum, band) => (
    cashStrained && band.retention <= 8
      ? sum + cheapDevelopmentBandScore(manager, band, futureRounds) * 0.65
      : sum
  ), 0);
  const liquidityFloor = aiRetentionLiquidityFloor(futureRounds);
  const liquidityShortfall = Math.max(0, liquidityFloor - remainingCash);
  const riskTax = keptBands.reduce((sum, band) => {
    const scandalAverage = parseDiceAverageSigned(effectiveScandalNotation(manager.id, band));
    const persistentScandalCount = state.persistentScandals.filter(
      (entry) => entry.targetManagerId === manager.id && entry.bandName === band.name
    ).length;
    const persistentBadSongCount = state.persistentBadSongs.filter(
      (entry) => entry.targetManagerId === manager.id && entry.bandName === band.name
    ).length;
    const retentionSnapshot = settledRound ? bandRetentionSnapshot(manager, band, settledRound) : null;
    const currentValuePenalty =
      retentionSnapshot && retentionSnapshot.estimatedValue <= 1
        ? Math.max(8, retentionCostForBand(band) * 1.15 + (persistentScandalCount + persistentBadSongCount) * 5)
        : retentionSnapshot && retentionSnapshot.estimatedValue <= 4
          ? Math.max(3, retentionCostForBand(band) * 0.45 + (persistentScandalCount + persistentBadSongCount) * 2.5)
          : 0;
    const expensiveScandalPressure = Math.max(0, scandalAverage - 3) * Math.max(0, retentionCostForBand(band) - 8) * 0.28;
    const cashStrainedLuxuryPenalty =
      cashStrained && retentionCostForBand(band) >= 12 && (!retentionSnapshot || retentionSnapshot.estimatedValue <= retentionCostForBand(band) * 0.7)
        ? (retentionCostForBand(band) - 11) * 1.7 + Math.max(0, scandalAverage - 2) * 2.8
        : 0;
    return sum + expensiveScandalPressure + persistentScandalCount * (3 + retentionCostForBand(band) * 0.18) + persistentBadSongCount * 2.5 + currentValuePenalty + cashStrainedLuxuryPenalty;
  }, 0);

  let nextRoundScore = 0;
  let bookedVenueCount = 0;
  let paidVenueCount = 0;
  let bookedSlotCount = 0;

  if (nextRound && keptBands.length) {
    const planningManager = {
      ...manager,
      roster: keptBands,
      assignments: Object.fromEntries(nextRound.venues.map((venue) => [venue.type, emptyVenueBooking()])),
    };
    const plan = bestAssignmentPlan(planningManager, nextRound.venues, {
      roster: keptBands,
      cashBudget: remainingCash,
    });
    planningManager.assignments = plan.assignments;

    nextRound.venues.forEach((venue) => {
      const bookedEntries = getAssignedBandEntries(planningManager, venue.type);
      if (!bookedEntries.length) {
        return;
      }

      bookedVenueCount += 1;
      bookedSlotCount += bookedEntries.length;
      if (venue.cost > 0) {
        paidVenueCount += 1;
      }

      const estimate = estimatedVenueStrength(planningManager, venue, nextRound, {
        viewerManagerId: manager.id,
      });
      nextRoundScore +=
        Math.max(0, estimate.revenue) * 1.15 +
        Math.max(0, estimate.popularity) * 1.55 +
        Math.max(0, estimate.fit) * 0.75 +
        venue.venuePoints * 8;

      if (venue.cost > 0 && estimate.revenue <= 0) {
        nextRoundScore -= 5;
      }
    });
  }

  const benchCount = Math.max(0, keptBands.length - bookedSlotCount);
  const noVenuePenalty = nextRound && bookedVenueCount === 0 ? 40 : 0;
  const oneVenueOnlyPenalty = nextRound && bookedVenueCount === 1 ? 12 * profile.oneVenuePenaltyScale : 0;
  const noPaidVenuePenalty =
    nextRound && nextRound.venues.some((venue) => venue.cost > 0) && paidVenueCount === 0
      ? 22 * profile.noPaidVenuePenaltyScale
      : 0;

  const score =
    nextRoundScore * 1.7 +
    futureCarryValue * 0.18 +
    developmentCoreBonus +
    remainingCash * profile.cashWeight +
    bookedVenueCount * 15 +
    paidVenueCount * 11 -
    retentionFee * 0.48 -
    benchCount * 5 -
    redundancyTax -
    riskTax -
    liquidityShortfall * 7 -
    noVenuePenalty -
    oneVenueOnlyPenalty -
    noPaidVenuePenalty;

  return {
    score,
    remainingCash,
    bookedVenueCount,
    paidVenueCount,
    keptNames: keptBands.map((band) => band.name),
  };
}

function chooseAiRetentions(manager) {
  const futureRounds = visibleFutureRounds();
  if (!manager.roster.length) {
    return [];
  }

  let bestOption = null;

  const considerCandidate = (candidate) => {
    if (!candidate) {
      return;
    }

    if (
      !bestOption ||
      candidate.score > bestOption.score ||
      (candidate.score === bestOption.score && candidate.remainingCash > bestOption.remainingCash) ||
      (
        candidate.score === bestOption.score &&
        candidate.remainingCash === bestOption.remainingCash &&
        candidate.bookedVenueCount > bestOption.bookedVenueCount
      )
    ) {
      bestOption = candidate;
    }
  };

  const explore = (index, keptBands, runningFee) => {
    if (runningFee > manager.cash) {
      return;
    }

    if (index >= manager.roster.length) {
      considerCandidate(scoreAiRetentionSubset(manager, keptBands, futureRounds));
      return;
    }

    explore(index + 1, keptBands, runningFee);

    keptBands.push(manager.roster[index]);
    explore(index + 1, keptBands, runningFee + retentionCostForBand(manager.roster[index]));
    keptBands.pop();
  };

  explore(0, [], 0);

  return bestOption?.keptNames || [];
}

function toggleRetention(bandName, shouldKeep) {
  if (state.phase !== "retention") {
    return;
  }

  const current = new Set(state.pendingRetentions.player || []);
  if (shouldKeep) {
    current.add(bandName);
  } else {
    current.delete(bandName);
  }
  state.pendingRetentions.player = [...current];
  render();
}

function applyRetentionPhase() {
  if (state.phase !== "retention") {
    return;
  }

  const roundData = currentRoundData();

  state.managers.slice(1).forEach((manager) => {
    state.pendingRetentions[manager.id] = chooseAiRetentions(manager);
  });

  state.managers.forEach((manager) => {
    const keptNames = new Set(state.pendingRetentions[manager.id] || []);
    const keptBands = manager.roster.filter((band) => keptNames.has(band.name));
    const droppedBands = manager.roster.filter((band) => !keptNames.has(band.name));
    const fee = keptBands.reduce((sum, band) => sum + retentionCostForBand(band), 0);

    manager.cash -= fee;
    manager.roster = keptBands;

    if (keptBands.length) {
      logEvent(`${manager.name} paid ${formatCash(fee)} in retention for ${keptBands.map((band) => band.name).join(", ")}.`);
    } else {
      logEvent(`${manager.name} kept no bands and paid no retention.`);
    }

    if (droppedBands.length) {
      logEvent(`${manager.name} released ${droppedBands.map((band) => band.name).join(", ")}.`);
    }
  });

  state.persistentBadSongs = state.persistentBadSongs.filter((entry) => {
    const manager = state.managers.find((candidate) => candidate.id === entry.targetManagerId);
    if (!manager) {
      return false;
    }
    return manager.roster.some((band) => band.name === entry.bandName);
  });

  enterAdvertisingPhase();
}

function bestAssignmentPlan(manager, venuesForRound, options = {}) {
  const {
    roster = availableRosterForRound(manager),
    cashBudget = manager.cash,
  } = options;
  const profile = aiPromoterProfile(manager);
  const assignments = Object.fromEntries(venuesForRound.map((venue) => [venue.type, emptyVenueBooking()]));
  const usedBands = new Set();
  let committedCost = 0;
  const topVenueWeight = Math.max(...venuesForRound.map((venue) => venue.venuePoints * venue.revenueFactor), 0);
  const duetCardsInHand = manager.hand.filter((card) => card.effect === "duet_persistent").length;
  const duetPreviewRounds = visibleFutureRounds().slice(1);
  const preferredVenueLimit = preferredEarlyVenueCommitment(manager, roster, venuesForRound);

  const buildSlotOption = (band, venue, slotKey) => {
      const slot = VENUE_SLOT_LOOKUP[slotKey] || VENUE_SLOT_LOOKUP[HEADLINER_SLOT];
      const revenue = projectedSlotRevenue(band, venue, slot.key);
      const grossRevenue = projectedVenueGross(band, venue) * slot.multiplier;
      const ceiling = optimisticVenueRevenue(band, venue);
      const fit = genreFitScore(band, venue);
      const scandalAverage = Math.max(0, parseDiceAverageSigned(effectiveScandalNotation(manager.id, band)));
      const expectedScore = Math.max(0, parseDiceAverage(band.popularity) + fit) * slot.multiplier;
      const netExpectedScore = Math.max(0, parseDiceAverage(band.popularity) + fit - scandalAverage) * slot.multiplier;
      const ceilingScore = Math.max(0, optimisticVenueRevenue(band, { ...venue, revenueFactor: 1, cost: 0 })) * slot.multiplier;
      const venueImportance = venue.venuePoints * venue.revenueFactor;
      const isMegaVenue = venueImportance >= Math.max(20, topVenueWeight - 2);
      const scorePressure = expectedScore * (isMegaVenue ? (slot.key === HEADLINER_SLOT ? 3.1 : 2.2) : (slot.key === HEADLINER_SLOT ? 1.45 : 1.05))
        + ceilingScore * (isMegaVenue ? (slot.key === HEADLINER_SLOT ? 1.9 : 1.2) : (slot.key === HEADLINER_SLOT ? 0.8 : 0.55));
      const vpPressure = venue.venuePoints * (isMegaVenue ? (slot.key === HEADLINER_SLOT ? 3.9 : 2.25) : (slot.key === HEADLINER_SLOT ? 1.8 : 1.1));
      const neutralBigRoomBonus = isMegaVenue && fit === 0 ? expectedScore * (slot.key === HEADLINER_SLOT ? 1.7 : 0.95) : 0;
      const strategicValue =
        scorePressure +
        vpPressure +
        neutralBigRoomBonus +
        grossRevenue * (slot.key === HEADLINER_SLOT ? (isMegaVenue ? 0.18 : 0.7) : (isMegaVenue ? 0.14 : 0.52)) +
        Math.max(0, ceiling * slot.multiplier) * (slot.key === HEADLINER_SLOT ? (isMegaVenue ? 0.2 : 0.6) : (isMegaVenue ? 0.12 : 0.35)) +
        promoterBandBias(manager, band) * 0.25 -
        scandalAverage * (slot.key === HEADLINER_SLOT ? 0.2 : 0.35) * venue.revenueFactor;
      return {
        bandName: band.name,
        venueType: venue.type,
        slotKey: slot.key,
        slotLabel: slot.label,
        revenue,
        riskAdjustedRevenue: revenue - scandalAverage * venue.revenueFactor * (slot.key === HEADLINER_SLOT ? 0.25 : 0.45),
        ceiling: ceiling * slot.multiplier - (slot.key === HEADLINER_SLOT ? venue.cost : 0),
        expectedScore,
        netExpectedScore,
        ceilingScore,
        venuePoints: venue.venuePoints,
        venueImportance,
        isMegaVenue,
        strategicValue,
      };
  };

  const duetLineupStrategicBonus = (headlinerBand, openerBand, venue) => {
    if (!duetCardsInHand || !headlinerBand || !openerBand || !venue) {
      return 0;
    }

    const currentLift =
      (projectedSlotRevenueWithPopularityDelta(headlinerBand, venue, HEADLINER_SLOT, 2, 0) - projectedSlotRevenue(headlinerBand, venue, HEADLINER_SLOT)) +
      (projectedSlotRevenueWithPopularityDelta(openerBand, venue, OPENER_SLOT, 2, 0) - projectedSlotRevenue(openerBand, venue, OPENER_SLOT));
    const futureLift =
      (projectedBandValueAcrossRoundsWithPopularityDelta(headlinerBand, duetPreviewRounds, 2, 0) - projectedBandValueAcrossRoundsWithPopularityDelta(headlinerBand, duetPreviewRounds, 0, 0)) +
      (projectedBandValueAcrossRoundsWithPopularityDelta(openerBand, duetPreviewRounds, 2, 0) - projectedBandValueAcrossRoundsWithPopularityDelta(openerBand, duetPreviewRounds, 0, 0));

    return duetCardsInHand * (
      Math.max(0, currentLift) * 1.9 +
      Math.max(0, futureLift) * 0.14 +
      venue.venuePoints * 2.2 +
      venue.revenueFactor * 1.8
    );
  };

  const headlinerOptions = roster.flatMap((band) =>
    venuesForRound.map((venue) => buildSlotOption(band, venue, HEADLINER_SLOT))
  );
  headlinerOptions
    .sort((a, b) => b.strategicValue - a.strategicValue)
    .forEach((option) => {
      const assignedHeadlinerCount = venuesForRound.filter((venue) => normalizeVenueBooking(assignments[venue.type]).headliner).length;
      const expandingToNewVenue = !assignments[option.venueType].headliner;
      const exceptionalExpansion =
        option.isMegaVenue ||
        option.netExpectedScore >= 7 ||
        option.expectedScore >= 8 ||
        option.revenue >= profile.expansionThreshold ||
        option.ceiling >= profile.expansionThreshold + 2;
      const worthTrying =
        option.ceiling > 0 ||
        option.venuePoints >= 5 ||
        option.revenue > -3 ||
        (option.isMegaVenue && option.ceilingScore > 0) ||
        (option.isMegaVenue && option.expectedScore >= 4);
      const venue = venuesForRound.find((entry) => entry.type === option.venueType);
      const venueCost = venue?.cost || 0;
      if (
        usedBands.has(option.bandName) ||
        assignments[option.venueType].headliner ||
        (state.round <= 2 && expandingToNewVenue && assignedHeadlinerCount >= preferredVenueLimit && !exceptionalExpansion) ||
        !worthTrying ||
        option.strategicValue <= (option.isMegaVenue ? 4 : -2) ||
        committedCost + venueCost > cashBudget
      ) {
        return;
      }
      assignments[option.venueType].headliner = option.bandName;
      usedBands.add(option.bandName);
      committedCost += venueCost;
    });

  const openerOptions = roster.flatMap((band) =>
    venuesForRound.map((venue) => buildSlotOption(band, venue, OPENER_SLOT))
  );
  openerOptions
    .sort((a, b) => {
      const venueA = venuesForRound.find((entry) => entry.type === a.venueType);
      const venueB = venuesForRound.find((entry) => entry.type === b.venueType);
      const headlinerBandA = getBandByName(manager, assignments[a.venueType].headliner);
      const headlinerBandB = getBandByName(manager, assignments[b.venueType].headliner);
      const bandA = getBandByName(manager, a.bandName);
      const bandB = getBandByName(manager, b.bandName);
      const aScore = a.strategicValue + duetLineupStrategicBonus(headlinerBandA, bandA, venueA);
      const bScore = b.strategicValue + duetLineupStrategicBonus(headlinerBandB, bandB, venueB);
      return bScore - aScore;
    })
    .forEach((option) => {
      if (
        usedBands.has(option.bandName) ||
        !assignments[option.venueType].headliner ||
        assignments[option.venueType].opener
      ) {
        return;
      }

      const venue = venuesForRound.find((entry) => entry.type === option.venueType);
      const headlinerBand = getBandByName(manager, assignments[option.venueType].headliner);
      const openerBand = getBandByName(manager, option.bandName);
      const duetBonus = duetLineupStrategicBonus(headlinerBand, openerBand, venue);
      const stackPreferenceBonus =
        state.round <= 2 && venue
          ? profile.stackOpenerBonus * ((venue.venuePoints * venue.revenueFactor) / Math.max(1, topVenueWeight))
          : 0;
      const adjustedStrategicValue = option.strategicValue + duetBonus + stackPreferenceBonus;

      const worthTrying =
        option.revenue >= 0 &&
        option.riskAdjustedRevenue >= (duetBonus > 0 ? -1 : 0) &&
        option.netExpectedScore >= (duetBonus > 0 ? 0.5 : 1) &&
        (
          option.ceiling > 0 ||
          option.venuePoints >= 4 ||
          option.expectedScore >= 3 ||
          duetBonus > 0
        );

      if (!worthTrying || adjustedStrategicValue <= -1) {
        return;
      }

      assignments[option.venueType].opener = option.bandName;
      usedBands.add(option.bandName);
    });

  return {
    assignments,
    committedCost,
  };
}

function chooseBestAssignments(manager, venuesForRound) {
  const plan = bestAssignmentPlan(manager, venuesForRound, {
    roster: availableRosterForRound(manager),
  });
  manager.assignments = plan.assignments;
  return plan;
}

function assignmentsWithinBudget(manager, venuesForRound) {
  return bookingFeeForManager(manager, venuesForRound) <= manager.cash;
}

function trimAssignmentsToBudget(manager, venuesForRound) {
  const removedBookings = [];
  while (!assignmentsWithinBudget(manager, venuesForRound)) {
    const assignedVenueTypes = venuesForRound
      .filter((venue) => venueHasBooking(manager, venue.type))
      .map((venue) => {
        const bookedBands = getAssignedBandEntries(manager, venue.type);
        const keepValue = bookedBands.reduce((sum, entry) => {
          const band = getBandByName(manager, entry.bandName);
          return sum + (band ? projectedSlotRevenue(band, venue, entry.key) : 0);
        }, 0) + venue.venuePoints * 1.1;
        return {
          venueType: venue.type,
          keepValue,
          bandNames: bookedBands.map((entry) => entry.bandName),
        };
      })
      .sort((a, b) => a.keepValue - b.keepValue);

    const weakestBooking = assignedVenueTypes[0];
    if (!weakestBooking) {
      break;
    }
    removedBookings.push(`${weakestBooking.venueType}: ${weakestBooking.bandNames.join(" + ")}`);
    clearVenueBooking(manager, weakestBooking.venueType);
  }
  return removedBookings;
}

function isProactiveDefenseCard(card) {
  return card?.type === "defense" && (card.effect === "cancel_demands" || card.effect === "cancel_scandal");
}

function currentVenueTypeForBand(manager, bandName, roundData = currentRoundData()) {
  if (!manager || !bandName || !roundData?.venues) {
    return "roster";
  }

  const bookedVenue = roundData.venues.find((venue) =>
    getAssignedBandEntries(manager, venue.type).some((entry) => entry.bandName === bandName)
  );
  return bookedVenue?.type || "roster";
}

function getCardTargets(manager, card, roundData) {
  const activeVenueType = activeVenueTypeForCards(roundData);
  const activeVenue = activeVenueType ? roundData?.venues.find((venue) => venue.type === activeVenueType) : null;
  if (card.type === "trend") {
    if (card.effect !== "signing_bonus" && card.effect !== "communism" && card.effect !== "draw_cards" && card.effect !== "steal_cards" && card.effect !== "cash_attack" && card.effect !== "charity_case" && card.effect !== "special_guest_draw" && card.effect !== "mega_concert" && card.effect !== "televised_concert" && card.effect !== "refund_booking_fee" && card.effect !== "tax_time" && activeVenueType !== ROUND_VENUE_ORDER[0]) {
      return [];
    }
    if (card.effect === "cash_attack") {
      return state.managers
        .filter((candidate) => candidate.id !== manager.id)
        .map((candidate) => ({
          managerId: candidate.id,
          managerName: candidate.name,
          venueType: "manager",
          slotKey: "",
          slotLabel: "Promoter",
          bandName: "",
        }));
    }
    if (card.effect === "televised_concert") {
      return activeVenue
        ? [{
            managerId: manager.id,
            managerName: manager.name,
            venueType: activeVenue.type,
            slotKey: "",
            slotLabel: "Venue",
            bandName: activeVenue.name,
          }]
        : [];
    }
    if (card.effect === "refund_booking_fee") {
      return activeVenue && venueHasBooking(manager, activeVenue.type)
        ? [{
            managerId: manager.id,
            managerName: manager.name,
            venueType: activeVenue.type,
            slotKey: "",
            slotLabel: "Venue",
            bandName: activeVenue.name,
          }]
        : [];
    }
    if (card.effect === "special_guest_draw") {
      if (!state.bandDeck.length) {
        return [];
      }
      return specialGuestVenueTargetsForManager(manager, roundData);
    }
    if (card.effect === "charity_case") {
      const leader = charityCaseLeaderForManager(manager, roundData);
      return leader
        ? [{
            managerId: leader.id,
            managerName: leader.name,
            venueType: "manager",
            slotKey: "",
            slotLabel: "Promoter",
            bandName: "",
          }]
        : [];
    }
    if (card.effect === "mega_concert") {
      return state.bandDeck.length
        ? [{
            managerId: manager.id,
            managerName: manager.name,
            venueType: "all",
            slotKey: "",
            slotLabel: "Tour",
            bandName: "All Promoters",
          }]
        : [];
    }
    if (card.effect === "music_fever" || card.effect === "recession") {
      return [{
        managerId: manager.id,
        managerName: manager.name,
        venueType: "all",
        slotKey: "",
        slotLabel: "Tour",
        bandName: "All Venues",
      }];
    }
    return [{
      managerId: manager.id,
      managerName: manager.name,
      venueType: card.effect === "signing_bonus" || card.effect === "communism" || card.effect === "draw_cards" || card.effect === "steal_cards" || card.effect === "tax_time" || card.effect === "mega_concert" ? "all" : "trend",
      bandName: card.effect === "signing_bonus" || card.effect === "communism" || card.effect === "draw_cards" || card.effect === "steal_cards" || card.effect === "tax_time" || card.effect === "mega_concert" ? "All Promoters" : "Music Trend",
    }];
  }
  if (card.type === "defense") {
    if (card.effect === "cancel_demands") {
      return manager.roster
        .filter((band) => demandEntriesForBand(manager.id, band.name).length > 0)
        .map((band) => ({
          managerId: manager.id,
          managerName: manager.name,
          venueType: "roster",
          slotKey: "",
          slotLabel: "Band",
          bandName: band.name,
        }));
    }
    if (card.effect === "cancel_scandal") {
      return manager.roster
        .filter((band) => activeScandalCountForBand(manager.id, currentVenueTypeForBand(manager, band.name, roundData), band) > 0)
        .map((band) => ({
          managerId: manager.id,
          managerName: manager.name,
          venueType: currentVenueTypeForBand(manager, band.name, roundData),
          slotKey: "",
          slotLabel: "Band",
          bandName: band.name,
        }));
    }
    return [];
  }

  if (card.type === "smash") {
    if (card.effect === "persistent_ad_agency") {
      return managerHasAdvertisingAgency(manager.id)
        ? []
        : [{
            managerId: manager.id,
            managerName: manager.name,
            venueType: "agency",
            slotKey: "",
            slotLabel: "Promoter",
            bandName: "Advertising Agency",
          }];
    }
    if (card.effect === "venue_snow_tires") {
      return activeVenue && venueHasBooking(manager, activeVenue.type)
        ? [{
            managerId: manager.id,
            managerName: manager.name,
            venueType: activeVenue.type,
            slotKey: "",
            slotLabel: "Venue",
            bandName: "",
          }]
        : [];
    }
    if (card.effect === "sit_out_boost_persistent") {
      return missThisWeekTargetsForManager(manager, roundData)
        .filter((target) => !isExactCardAlreadyOnBand(manager.id, target.bandName, card));
    }
    if (card.effect === "duet_persistent") {
      return (activeVenue ? [activeVenue] : [])
        .map((venue) => getDuetTargetForVenue(manager, venue.type))
        .filter(Boolean);
    }
    return (activeVenue ? [activeVenue] : [])
      .flatMap((venue) => getBookedTargetsForVenue(manager, venue.type))
      .filter((target) => {
        if (!target.bandName) {
          return false;
        }
        if (isExactCardAlreadyOnBand(manager.id, target.bandName, card)) {
          return false;
        }
        if (!card.allowedGenres?.length) {
          return true;
        }
        const band = getBandByName(manager, target.bandName);
        if (!band) {
          return false;
        }
        if (card.requiresSmashHit && activeActualSmashHitEntriesForBand(manager.id, target.bandName).length === 0) {
          return false;
        }
        return genreParts(band.genre).some((genre) => card.allowedGenres.includes(genre));
      })
      .filter((target) => (
        card.requiresSmashHit
          ? activeActualSmashHitEntriesForBand(manager.id, target.bandName).length > 0
          : true
      ));
  }

  if (card.effect === "venue_snowstorm") {
    return activeVenue
      ? [{
          managerId: manager.id,
          managerName: "All Promoters",
          venueType: activeVenue.type,
          slotKey: "",
          slotLabel: "Venue",
          bandName: "",
        }]
      : [];
  }

  if (card.type === "bad_song" && card.targetSelf) {
    if (card.effect === "bad_promotion_idea") {
      const strongestHeadliner = roundData?.venues
        ?.flatMap((venue) => getBookedTargetsForVenue(manager, venue.type)
          .filter((target) => target.slotKey === HEADLINER_SLOT)
          .map((target) => {
            const band = getBandByName(manager, target.bandName);
            return {
              ...target,
              score: band ? projectedSlotRevenue(band, venue, HEADLINER_SLOT) : -Infinity,
            };
          }))
        ?.sort((left, right) => right.score - left.score)[0];
      return strongestHeadliner ? [strongestHeadliner] : [];
    }
    if (card.effect === "biography") {
      return roundData.venues
        .flatMap((venue) => getBookedTargetsForVenue(manager, venue.type))
        .filter((target) => target.bandName);
    }
    if (card.effect === "bad_sushi") {
      return roundData.venues
        .flatMap((venue) => getBookedTargetsForVenue(manager, venue.type))
        .filter((target) => target.bandName);
    }
    return (activeVenue ? [activeVenue] : [])
      .flatMap((venue) => getBookedTargetsForVenue(manager, venue.type))
      .filter((target) => target.bandName)
      .filter((target) => !isExactCardAlreadyOnBand(manager.id, target.bandName, card));
  }

  if (card.effect === "feud") {
    return getFeudTargetsForVenue(manager, activeVenueType)
      .filter((target) => !isExactCardAlreadyOnBand(target.managerId, target.bandName, card))
      .filter((target) => !isExactCardAlreadyOnBand(target.pairedManagerId, target.pairedBandName, card));
  }

  if (card.effect === "dance_off") {
    return getDanceOffTargetsForVenue(manager, activeVenueType)
      .filter((target) => !isExactCardAlreadyOnBand(target.managerId, target.bandName, card))
      .filter((target) => !isExactCardAlreadyOnBand(target.pairedManagerId, target.pairedBandName, card));
  }

  if (card.effect === "argument_duo") {
    return state.managers
      .filter((candidate) => candidate.id !== manager.id)
      .map((candidate) => getDuetTargetForVenue(candidate, activeVenueType))
      .filter(Boolean);
  }

  if (card.effect === "benefit_concert") {
    return state.managers
      .flatMap((candidate) =>
        (activeVenue ? [activeVenue] : []).flatMap((venue) => getBookedTargetsForVenue(candidate, venue.type))
      )
      .filter((target) => target.bandName)
      .filter((target) => !isExactCardAlreadyOnBand(target.managerId, target.bandName, card));
  }

  let targets = state.managers
    .filter((candidate) => candidate.id !== manager.id)
    .flatMap((candidate) =>
      (activeVenue ? [activeVenue] : []).flatMap((venue) => getBookedTargetsForVenue(candidate, venue.type))
    )
    .filter((target) => target.bandName)
    .filter((target) => (
      card.effect === "remove_smash_hits"
        ? activeActualSmashHitEntriesForBand(target.managerId, target.bandName).length > 0
        : true
    ))
    .filter((target) => {
      if ((card.type === "scandal" || card.type === "rumor") && hasSuperLawyerProtection(target.managerId, target.bandName)) {
        return false;
      }
      return true;
    })
    .filter((target) => !isExactCardAlreadyOnBand(target.managerId, target.bandName, card));

  if (card.effect === "contract_negotiations") {
    targets = targets.filter((target) => target.slotKey === HEADLINER_SLOT);
  }

  return targets;
}

function futureTargetsForRoundLockedSelfBadSong(manager, card, roundData) {
  if (!roundData || !isRoundLockedSelfBadSong(card)) {
    return [];
  }

  return roundData.venues
    .slice(activeVenueCardIndex() + 1)
    .flatMap((venue) => getBookedTargetsForVenue(manager, venue.type))
    .filter((target) => target.bandName)
    .filter((target) => !isExactCardAlreadyOnBand(manager.id, target.bandName, card));
}

function managerMustUseRoundLockedSelfBadSongNow(manager, roundData = currentRoundData()) {
  return false;
}

function playerHasImmediatePlayCard(roundData = currentRoundData()) {
  return false;
}

function immediateCardStatusText(manager, roundData = currentRoundData(), options = {}) {
  return "";
}

function managerHasImmediateOpeningBadLuckCard(manager, roundData = currentRoundData()) {
  return false;
}

function playerHasPlayableCard(roundData = currentRoundData()) {
  const player = state.managers[0];
  if (!roundData || !player) {
    return false;
  }

  return player.hand.some((card) => (
    (card.type !== "defense" || isProactiveDefenseCard(card)) &&
    getCardTargets(player, card, roundData).length > 0
  ));
}

function discardUnusedRoundLockedSelfBadSongs() {
  return;
}

function findGoodPr(manager) {
  return manager.hand.find((card) => card.type === "defense" && card.effect === "cancel_scandal") || null;
}

function findCommonSense(manager) {
  return manager.hand.find((card) => card.type === "defense" && card.effect === "cancel_demands") || null;
}

function findSwissBankAccount(manager) {
  return manager.hand.find((card) => card.type === "defense" && card.effect === "swiss_bank_account") || null;
}

function findSuperLawyer(manager) {
  return manager.hand.find((card) => card.type === "defense" && card.effect === "super_lawyer") || null;
}

function demandEntriesForBand(managerId, bandName) {
  return state.persistentBadSongs.filter(
    (entry) => entry.targetManagerId === managerId && entry.bandName === bandName && entry.cardName === "Demands"
  );
}

function removeOneDemandEffect(managerId, bandName) {
  const matchingIndexes = state.persistentBadSongs
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => entry.targetManagerId === managerId && entry.bandName === bandName && entry.cardName === "Demands")
    .sort((left, right) => (right.entry.flatPenalty || 0) - (left.entry.flatPenalty || 0));

  if (!matchingIndexes.length) {
    return null;
  }

  const [{ index }] = matchingIndexes;
  const [removed] = state.persistentBadSongs.splice(index, 1);
  return removed || null;
}

function resolveCommunismRedistribution(triggerManager, card) {
  const cashBefore = new Map(state.managers.map((manager) => [manager.id, manager.cash || 0]));
  const swissUsers = state.managers
    .map((manager) => ({ manager, card: findSwissBankAccount(manager) }))
    .filter((entry) => entry.card);

  swissUsers.forEach(({ manager, card: swissCard }) => {
    manager.hand = manager.hand.filter((candidate) => candidate.id !== swissCard.id);
    state.roundCardPlays.push({
      managerId: manager.id,
      managerName: manager.name,
      cardName: swissCard.name,
      cardSubtitle: swissCard.subtitle || "",
      cardType: swissCard.type,
      cardDescription: swissCard.description,
      effect: swissCard.effect,
      modifier: 0,
      popularityDice: 0,
      flatPenalty: 0,
      targetManagerId: manager.id,
      targetManagerName: manager.name,
      venueType: "all",
      bandName: "",
      footerText: `${manager.name} used Swiss Bank Account and kept personal cash outside the Communism pool.`,
    });
  });

  const protectedManagers = new Set(swissUsers.map((entry) => entry.manager.id));
  const playerCount = Math.max(1, state.managers.length);
  const protectedCashByManager = new Map(
    state.managers.map((manager) => [manager.id, protectedManagers.has(manager.id) ? manager.cash : 0])
  );
  const pooledCash = state.managers.reduce(
    (sum, manager) => sum + (protectedManagers.has(manager.id) ? 0 : manager.cash),
    0
  );
  const baseShare = Math.floor(pooledCash / playerCount);
  let remainder = pooledCash - baseShare * playerCount;

  state.managers.forEach((manager) => {
    const bonusDollar = remainder > 0 ? 1 : 0;
    if (remainder > 0) {
      remainder -= 1;
    }
    manager.cash = (protectedCashByManager.get(manager.id) || 0) + baseShare + bonusDollar;
  });

  const swissLabel = swissUsers.length
    ? ` Swiss Bank Account auto-triggered for ${swissUsers.map((entry) => entry.manager.name).join(", ")}.`
    : "";
  const swissBreakdown = swissUsers.length
    ? `\n\nSwiss Bank Account:\n${swissUsers.map(({ manager }) => `${manager.name} kept ${formatCash(cashBefore.get(manager.id) || 0)} outside the pool.`).join("\n")}`
    : "";
  const managerBreakdown = state.managers
    .map((manager) => `${manager.name}: ${formatCash(cashBefore.get(manager.id) || 0)} -> ${formatCash(manager.cash || 0)}`)
    .join("\n");
  openRevenueClimateAlert(
    "Communism",
    `${triggerManager.name} played Communism. All promoters pooled their cash and redistributed it evenly.${swissLabel}${swissBreakdown}\n\nAfter redistribution:\n${managerBreakdown}`,
    `Pool redistributed: ${formatCash(pooledCash)} across ${playerCount} promoters`
  );
  logEvent(
    `${triggerManager.name} played ${card.name}. ${formatCash(pooledCash)} from unprotected promoters was redistributed across ${playerCount} promoters.${swissLabel}`
  );
}

function venueHasSnowstorm(venueType) {
  return state.roundCardPlays.some((entry) => entry.venueType === venueType && entry.effect === "venue_snowstorm");
}

function globalRevenueClimateMultiplier() {
  if (state.globalRevenueClimate?.effect === "music_fever") {
    return 2;
  }
  if (state.globalRevenueClimate?.effect === "recession") {
    return 0.5;
  }
  return 1;
}

function televisedConcertRevenueMultiplier(venueType) {
  return state.roundCardPlays.some((entry) => entry.venueType === venueType && entry.effect === "televised_concert") ? 2 : 1;
}

function bookingFeeRefundForVenue(managerId, venueType, venueCost = 0) {
  return state.roundCardPlays.some(
    (entry) => entry.targetManagerId === managerId && entry.venueType === venueType && entry.effect === "refund_booking_fee"
  ) ? venueCost : 0;
}

function taxTimeIsActive() {
  return state.roundCardPlays.some((entry) => entry.effect === "tax_time");
}

function retentionCostForBand(band) {
  return (band?.retention || 0) * (taxTimeIsActive() ? 2 : 1);
}

function clearGlobalRevenueClimate(reason = "") {
  if (!state.globalRevenueClimate) {
    return;
  }
  if (reason) {
    logEvent(reason);
  }
  state.globalRevenueClimate = null;
}

function applyGlobalRevenueClimateCard(manager, card) {
  const oppositeEffect = card.effect === "music_fever" ? "recession" : "music_fever";
  const oppositeName = card.effect === "music_fever" ? "Recession" : "Music Fever";
  const thisName = card.effect === "music_fever" ? "Music Fever" : "Recession";

  if (state.globalRevenueClimate?.effect === oppositeEffect) {
    const cancelText = `${thisName} collided with ${oppositeName}. Both effects are discarded and revenues return to normal.`;
    clearGlobalRevenueClimate(cancelText);
    openRevenueClimateAlert(
      "Market Effects Canceled",
      `${thisName} ran straight into ${oppositeName}. Both cards are discarded immediately, so payouts return to normal for the rest of the round.`,
      "Market reset: payouts return to normal immediately."
    );
    return {
      footerText: `${manager.name} played ${cardTitleText(card)}. ${cancelText}`,
      statusText: "Canceled by opposite market effect",
    };
  }

  if (state.globalRevenueClimate?.effect === card.effect) {
    const duplicateText = `${thisName} was already active, so the extra copy was discarded with no additional effect.`;
    logEvent(`${manager.name} played ${cardTitleText(card)} but ${thisName} was already active.`);
    openRevenueClimateAlert(
      `${thisName} Already Active`,
      `${thisName} was already affecting the whole tour, so this extra copy is discarded with no additional effect.`,
      "No change: the current market effect stays active."
    );
    return {
      footerText: `${manager.name} played ${cardTitleText(card)}. ${duplicateText}`,
      statusText: "Already active",
    };
  }

  state.globalRevenueClimate = {
    effect: card.effect,
    cardName: card.name,
    startedByManagerId: manager.id,
    startedByManagerName: manager.name,
  };
  openRevenueClimateAlert(
    thisName,
    card.effect === "music_fever"
      ? "Concert season is on. All payouts are doubled this round at every venue. At round end, Music Fever will roll 2D to see whether it continues into next week."
      : "The economy has turned. All payouts are cut in half this round at every venue. At round end, Recession will roll 2D to see whether it continues into next week.",
    card.effect === "music_fever"
      ? "Live now: all venue payouts are doubled this round."
      : "Live now: all venue payouts are cut in half this round."
  );
  return null;
}

function resolveRevenueClimateContinuation() {
  if (!state.globalRevenueClimate) {
    return;
  }

  const climateName = state.globalRevenueClimate.effect === "music_fever" ? "Music Fever" : "Recession";
  const roll = rollNotation("2D");
  if (roll.total >= 7) {
    logEvent(`${climateName} roll ${roll.detail}=${roll.total}. It continues into next round.`);
    openRevenueClimateAlert(
      `${climateName} Continues`,
      `${climateName} rolled ${roll.detail} for a total of ${roll.total}, so it stays in effect next round.`,
      `Continuation roll: ${roll.detail} = ${roll.total}`
    );
  } else {
    logEvent(`${climateName} roll ${roll.detail}=${roll.total}. It ends before next round.`);
    openRevenueClimateAlert(
      `${climateName} Ends`,
      `${climateName} rolled ${roll.detail} for a total of ${roll.total}, so it ends before next round starts.`,
      `Continuation roll: ${roll.detail} = ${roll.total}`
    );
    state.globalRevenueClimate = null;
  }
}

function managerHasSnowTires(managerId, venueType) {
  return state.roundCardPlays.some(
    (entry) => entry.targetManagerId === managerId && entry.venueType === venueType && entry.effect === "venue_snow_tires"
  );
}

function hasSuperLawyerProtection(managerId, bandName) {
  return state.persistentLawyers.some((entry) => entry.targetManagerId === managerId && entry.bandName === bandName);
}

function strongestBookedTarget(manager, roundData) {
  if (!roundData) {
    return null;
  }

  return roundData.venues
    .flatMap((venue) => getBookedTargetsForVenue(manager, venue.type).map((target) => {
      const band = getBandByName(manager, target.bandName);
      return {
        managerId: manager.id,
        managerName: manager.name,
        venueType: target.venueType,
        slotKey: target.slotKey,
        bandName: target.bandName,
        score: band ? projectedSlotRevenue(band, venue, target.slotKey) : -Infinity,
      };
    }))
    .filter((entry) => entry.bandName)
    .sort((a, b) => b.score - a.score)[0] || null;
}

function hasPromoterCardEffect(targetManagerId, card) {
  if (!card || !targetManagerId) {
    return false;
  }

  if (card.effect === "persistent_ad_agency") {
    return managerHasAdvertisingAgency(targetManagerId);
  }

  return false;
}

function isExactCardAlreadyOnBand(targetManagerId, bandName, card) {
  if (!bandName) {
    return hasPromoterCardEffect(targetManagerId, card);
  }

  const matchesCard = (entry) =>
    entry.targetManagerId === targetManagerId &&
    entry.bandName === bandName &&
    entry.cardName === card.name &&
    (entry.cardSubtitle || "") === (card.subtitle || "");

  if (state.roundCardPlays.some(matchesCard)) {
    return true;
  }

  if (card.effect === "persistent_smash" || card.effect === "duet_persistent" || card.effect === "sit_out_boost_persistent") {
    return state.persistentSmashHits.some(
      (entry) =>
        entry.targetManagerId === targetManagerId &&
        entry.bandName === bandName &&
        (entry.cardName || "Smash Hit") === card.name &&
        (entry.subtitle || "") === (card.subtitle || "")
    );
  }

  if (card.effect === "persistent_scandal_adjustment") {
    return state.persistentScandalAdjustments.some(
      (entry) => entry.targetManagerId === targetManagerId && entry.bandName === bandName && entry.subtitle === (card.subtitle || "")
    );
  }

  if (card.effect === "bad_song_persistent" || card.effect === "bad_song_persistent_discard_smash") {
    return state.persistentBadSongs.some(
      (entry) => entry.targetManagerId === targetManagerId && entry.bandName === bandName && entry.subtitle === (card.subtitle || "")
    );
  }

  if (card.effect === "persistent_scandal" || card.effect === "persistent_bust" || card.effect === "persistent_scandal_double") {
    return state.persistentScandals.some(
      (entry) => entry.targetManagerId === targetManagerId && entry.bandName === bandName && entry.subtitle === (card.subtitle || "")
    );
  }

  return false;
}

function discardOneSmashCard(manager) {
  const smashIndex = manager.hand.findIndex((card) => card.type === "smash");
  if (smashIndex === -1) {
    return null;
  }

  const [discarded] = manager.hand.splice(smashIndex, 1);
  return discarded;
}

function activeActualSmashHitEntriesForBand(managerId, bandName) {
  return state.persistentSmashHits.filter(
    (entry) =>
      entry.targetManagerId === managerId &&
      entry.bandName === bandName &&
      (entry.cardName || "Smash Hit") === "Smash Hit"
  );
}

function removePersistentSmashHit(managerId, bandName) {
  const index = state.persistentSmashHits.findIndex((entry) => entry.targetManagerId === managerId && entry.bandName === bandName);
  if (index === -1) {
    return null;
  }

  const [removed] = state.persistentSmashHits.splice(index, 1);
  return removed;
}

function removeAllActualSmashHitsForBand(managerId, bandName) {
  const removed = [];
  state.persistentSmashHits = state.persistentSmashHits.filter((entry) => {
    const matches =
      entry.targetManagerId === managerId &&
      entry.bandName === bandName &&
      (entry.cardName || "Smash Hit") === "Smash Hit";
    if (matches) {
      removed.push(entry);
      return false;
    }
    return true;
  });
  return removed;
}

function removeOneActiveScandalEffect(targetManagerId, venueType, bandName) {
  if (!targetManagerId || !bandName) {
    return null;
  }

  for (let index = state.roundCardPlays.length - 1; index >= 0; index -= 1) {
    const entry = state.roundCardPlays[index];
    if (
      entry.targetManagerId === targetManagerId &&
      entry.venueType === venueType &&
      entry.bandName === bandName &&
      (entry.cardType === "scandal" || entry.cardType === "rumor")
    ) {
      const [removedPlay] = state.roundCardPlays.splice(index, 1);
      if (
        removedPlay.effect === "persistent_scandal" ||
        removedPlay.effect === "persistent_bust" ||
        removedPlay.effect === "persistent_scandal_double"
      ) {
        for (let persistentIndex = state.persistentScandals.length - 1; persistentIndex >= 0; persistentIndex -= 1) {
          const persistentEntry = state.persistentScandals[persistentIndex];
          if (
            persistentEntry.targetManagerId === targetManagerId &&
            persistentEntry.bandName === bandName &&
            persistentEntry.venueType === venueType &&
            persistentEntry.effect === removedPlay.effect &&
            (persistentEntry.subtitle || "") === (removedPlay.cardSubtitle || "")
          ) {
            state.persistentScandals.splice(persistentIndex, 1);
            break;
          }
        }
      }
      return removedPlay;
    }
  }

  for (let index = state.persistentScandals.length - 1; index >= 0; index -= 1) {
    const entry = state.persistentScandals[index];
    if (entry.targetManagerId === targetManagerId && entry.bandName === bandName) {
      const [removedPersistent] = state.persistentScandals.splice(index, 1);
      return removedPersistent;
    }
  }

  return null;
}

function ensureSuperLawyerProtection(targetManager, venueType, bandName) {
  const clearedScandal = removeOneActiveScandalEffect(targetManager.id, venueType, bandName);
  if (!hasSuperLawyerProtection(targetManager.id, bandName)) {
    state.persistentLawyers.push({
      targetManagerId: targetManager.id,
      targetManagerName: targetManager.name,
      bandName,
    });
  }
  return clearedScandal;
}

function queueCardEvent({
  managerId = "",
  managerName = "",
  cardName,
  cardSubtitle = "",
  cardType = "system",
  cardDescription = "",
  effect = "system",
  targetManagerId = "",
  targetManagerName = "",
  venueType = "",
  targetSlotKey = "",
  bandName = "",
  pairedBandName = "",
  footerText = "",
  statusText = "",
}) {
  state.roundCardPlays.push({
    managerId,
    managerName,
    cardName,
    cardSubtitle,
    cardType,
    cardDescription,
    effect,
    modifier: 0,
    flatPenalty: 0,
    targetManagerId,
    targetManagerName,
    venueType,
    targetSlotKey,
    bandName,
    pairedBandName,
    footerText,
    statusText,
  });
  if (footerText) {
    state.lastCardActionText = footerText;
  }
}

function queueStoppedAttackEvent(attacker, card, targetManager, venueType, bandName, cardDescription, resolutionText) {
  const bandLabel = bandName ? `${targetManager.name}'s ${bandName}` : `${targetManager.name}'s band`;
  queueCardEvent({
    managerId: attacker.id,
    managerName: attacker.name,
    cardName: card.name,
    cardSubtitle: card.subtitle || "",
    cardType: card.type || "system",
    cardDescription: card.description,
    effect: "display_only",
    targetManagerId: targetManager.id,
    targetManagerName: targetManager.name,
    venueType,
    bandName,
    footerText: `${attacker.name} played ${cardTitleText(card)} on ${bandLabel}. ${resolutionText}`,
    statusText: resolutionText,
  });
}

function defensePromptLabel(card) {
  return `${card.name}${card.subtitle ? `: ${card.subtitle}` : ""}`;
}

function isDemandsCard(card) {
  return card?.type === "bad_song" && card?.name === "Demands";
}

function resolvePendingDefense(action) {
  const pending = state.pendingDefenseChoice;
  if (!pending) {
    return;
  }

  const attacker = state.managers.find((candidate) => candidate.id === pending.managerId);
  const targetManager = state.managers.find((candidate) => candidate.id === pending.targetManagerId);
  if (!attacker || !targetManager) {
    state.pendingDefenseChoice = null;
    render();
    return;
  }

  const targetBandName = pending.bandName;

  if (action === "super_lawyer" && pending.superLawyerId && targetBandName) {
    targetManager.hand = targetManager.hand.filter((candidate) => candidate.id !== pending.superLawyerId);
    const clearedScandal = ensureSuperLawyerProtection(targetManager, pending.venueType, targetBandName);
    queueStoppedAttackEvent(
      attacker,
      pending.card,
      targetManager,
      pending.venueType,
      targetBandName,
      clearedScandal
        ? "This attack was blocked before it could land. One active scandal was cleared from the band."
        : "This attack was blocked before it could land.",
      `${targetManager.name} used Super Lawyer to protect ${targetBandName}.${clearedScandal ? " One active scandal was cleared." : ""}`
    );
    logEvent(`${targetManager.name} used Super Lawyer to protect ${targetBandName} from ${defensePromptLabel(pending.card)}.${clearedScandal ? " One active scandal was cleared." : ""}`);
    state.pendingDefenseChoice = null;
  } else if (action === "good_pr" && pending.goodPrId) {
    targetManager.hand = targetManager.hand.filter((candidate) => candidate.id !== pending.goodPrId);
    queueStoppedAttackEvent(
      attacker,
      pending.card,
      targetManager,
      pending.venueType,
      targetBandName,
      "This attack was canceled before it could land.",
      `${targetManager.name} used Good PR to cancel it${targetBandName ? ` on ${targetBandName}` : ""}.`
    );
    logEvent(`${targetManager.name} used Good PR to cancel ${defensePromptLabel(pending.card)} on ${pending.venueType}${targetBandName ? ` (${targetBandName})` : ""}.`);
    state.pendingDefenseChoice = null;
  } else if (action === "common_sense" && pending.commonSenseId) {
    targetManager.hand = targetManager.hand.filter((candidate) => candidate.id !== pending.commonSenseId);
    queueStoppedAttackEvent(
      attacker,
      pending.card,
      targetManager,
      pending.venueType,
      targetBandName,
      "This Demands card was canceled before it could land.",
      `${targetManager.name} used Common Sense to cancel it${targetBandName ? ` on ${targetBandName}` : ""}.`
    );
    logEvent(`${targetManager.name} used Common Sense to cancel ${defensePromptLabel(pending.card)} on ${pending.venueType}${targetBandName ? ` (${targetBandName})` : ""}.`);
    state.pendingDefenseChoice = null;
  } else {
    state.pendingDefenseChoice = null;
    state.roundCardPlays.push({
      managerId: pending.managerId,
      managerName: pending.managerName,
      cardName: pending.card.name,
      cardSubtitle: pending.card.subtitle || "",
      cardType: pending.card.type,
      cardDescription: pending.card.description,
      effect: pending.card.effect || "flat_bonus",
      modifier: pending.card.modifier,
      flatPenalty: pending.card.flatPenalty || 0,
      targetManagerId: pending.targetManagerId,
      targetManagerName: pending.targetManagerName,
      venueType: pending.venueType,
      bandName: pending.bandName,
      footerText: describeCardPlay(attacker, pending.card, targetManager, pending.venueType, pending.bandName),
    });

    if (pending.card.effect === "persistent_scandal" || pending.card.effect === "persistent_bust" || pending.card.effect === "persistent_scandal_double") {
      state.persistentScandals.push({
        effect: pending.card.effect,
        subtitle: pending.card.subtitle || "",
        targetManagerId: pending.targetManagerId,
        targetManagerName: pending.targetManagerName,
        venueType: pending.venueType,
        bandName: pending.bandName,
      });
    }
    state.lastCardActionText = describeCardPlay(attacker, pending.card, targetManager, pending.venueType, pending.bandName);
    logEvent(`${attacker.name} played ${defensePromptLabel(pending.card)} on ${targetManager.name}'s ${pending.venueType} slot${pending.bandName ? ` (${pending.bandName})` : ""}.`);
  }

  if (state.cardPassedManagers.length >= state.cardTurnOrder.length) {
    completeCardPhase();
    return;
  }

  state.activeCardManagerId = nextCardManagerId(attacker.id);
  if (!state.activeCardManagerId) {
    completeCardPhase();
    return;
  }

  // Using a defense card is not the same thing as passing. Clear the player
  // from the passed list immediately so they stay eligible to take a normal
  // card turn later in the round, even if AI turns happen first.
  if (pending.targetManagerId === "player") {
    state.cardPassedManagers = state.cardPassedManagers.filter((managerId) => managerId !== "player");
  }

  if (state.phase === "cards" && state.activeCardManagerId !== "player") {
    advanceCardTurns();
    if (state.phase !== "cards") {
      return;
    }
  }

  render();
}

function resolvePendingCharityCase(encodedTarget) {
  const pending = state.pendingCharityCaseChoice;
  if (!pending) {
    return;
  }

  const attacker = state.managers.find((candidate) => candidate.id === pending.managerId);
  const leader = state.managers.find((candidate) => candidate.id === pending.targetManagerId);
  const roundData = currentRoundData();
  if (!attacker || !leader || !roundData) {
    state.pendingCharityCaseChoice = null;
    render();
    return;
  }

  const target = decodeCardTarget(encodedTarget || "");
  const availableChoices = charityCaseBandChoices(leader, attacker, roundData);
  const chosen = availableChoices.find((choice) => choice.bandName === target.bandName) || availableChoices[0];
  if (!chosen) {
    state.pendingCharityCaseChoice = null;
    render();
    return;
  }

  state.pendingCharityCaseChoice = null;
  finalizeCharityCaseTransfer(attacker, leader, pending.card, chosen.bandName, roundData);

  if (state.cardPassedManagers.length >= state.cardTurnOrder.length) {
    completeCardPhase();
    return;
  }

  state.activeCardManagerId = nextCardManagerId(attacker.id);
  if (state.bandRevealAlert) {
    if (!state.activeCardManagerId) {
      completeCardPhase();
      return;
    }
    render();
    return;
  }
  if (!state.activeCardManagerId) {
    completeCardPhase();
    return;
  }
  if (state.phase === "cards" && state.activeCardManagerId !== "player") {
    advanceCardTurns();
    if (state.phase !== "cards") {
      return;
    }
  }

  render();
}

function applyCardPlay(manager, card, targetManagerId, venueType, options = {}) {
  if (card.type === "trend") {
    const trendTargetManager = state.managers.find((candidate) => candidate.id === targetManagerId) || manager;
    manager.hand = manager.hand.filter((candidate) => candidate.id !== card.id);
    const trendVenueType = card.effect === "cash_attack" || card.effect === "charity_case" ? "manager" : (card.effect === "televised_concert" || card.effect === "refund_booking_fee") ? venueType : "all";
    const trendVenueName = (card.effect === "televised_concert" || card.effect === "refund_booking_fee" || card.effect === "special_guest_draw")
      ? (currentRoundData()?.venues.find((entry) => entry.type === venueType)?.name || "")
      : "";
    let footerText = describeCardPlay(
      manager,
      card,
      trendTargetManager,
      trendVenueType,
      trendVenueName
    );
    let stealSummary = "";
    let climateStatus = "";
    if (card.effect === "draw_cards") {
      drawCardsToManager(manager, card.cardsToDraw || 3);
    } else if (card.effect === "cash_attack") {
      const cashLoss = Math.min(30, Math.floor((trendTargetManager.cash || 0) / 2));
      trendTargetManager.cash = Math.max(0, trendTargetManager.cash - cashLoss);
      stealSummary = `${trendTargetManager.name} lost ${formatCash(cashLoss)}`;
    } else if (card.effect === "charity_case") {
      const choices = charityCaseBandChoices(trendTargetManager, manager, currentRoundData());
      if (!choices.length) {
        logEvent(`${manager.name} tried to play Charity Case, but ${trendTargetManager.name} had no legal band to surrender.`);
        return;
      }
      if (trendTargetManager.isPlayer) {
        state.pendingCharityCaseChoice = {
          managerId: manager.id,
          managerName: manager.name,
          targetManagerId: trendTargetManager.id,
          targetManagerName: trendTargetManager.name,
          card: { ...card },
        };
        state.lastCardActionText = `${manager.name} played ${cardTitleText(card)}. Choose which band you will hand over to ${manager.name}.`;
        return;
      }
      const chosenBand = chooseCharityCaseBandForManager(trendTargetManager, manager, currentRoundData());
      if (!chosenBand || !finalizeCharityCaseTransfer(manager, trendTargetManager, card, chosenBand.bandName, currentRoundData())) {
        logEvent(`${manager.name} tried to play Charity Case, but it could not be resolved.`);
        return;
      }
      return;
    } else if (card.effect === "steal_cards") {
      const stealResult = stealRandomCardsFromOpponents(manager, card.cardsToSteal || 1);
      stealSummary = stealResult.summary;
    } else if (card.effect === "special_guest_draw") {
      const drawnBandTemplate = state.bandDeck.shift();
      if (!drawnBandTemplate) {
        logEvent(`${manager.name} tried to play Special Guest, but there were no bands left in the deck.`);
        return;
      }
      const drawnBand = cloneBand(drawnBandTemplate);
      manager.roster.push(drawnBand);
      addOverflowVenueBand(manager, venueType, drawnBand.name, {
        venueName: currentRoundData()?.venues.find((entry) => entry.type === venueType)?.name || "",
      });
      openBandRevealAlert(
        `${manager.name} Introduces SPECIAL GUEST ${drawnBand.name}`,
        `${drawnBand.name} has just signed with ${manager.name} and joins ${venueType}: ${currentRoundData()?.venues.find((entry) => entry.type === venueType)?.name || "this venue"} for a free first show this week.`,
        drawnBand,
        `Added to ${venueType} as a full-strength Special Guest`,
        currentRoundData()?.venues.find((entry) => entry.type === venueType)?.name || ""
      );
      stealSummary = `${drawnBand.name} joined ${venueType} as a Special Guest`;
    } else if (card.effect === "mega_concert") {
      startMegaConcertPlacements(manager);
    } else if (card.effect === "signing_bonus") {
      state.managers.forEach((promoter) => {
        promoter.cash += card.cashBonus || 50;
      });
    } else if (card.effect === "communism") {
      resolveCommunismRedistribution(manager, card);
    } else if (card.effect === "tax_time") {
      // Tax Time is resolved by staying active until the upcoming retention phase.
    } else if (card.effect === "music_fever" || card.effect === "recession") {
      const climateResolution = applyGlobalRevenueClimateCard(manager, card);
      if (climateResolution) {
        footerText = climateResolution.footerText || footerText;
        climateStatus = climateResolution.statusText || "";
      }
    }
    state.roundCardPlays.push({
      managerId: manager.id,
      managerName: manager.name,
      cardName: card.name,
      cardSubtitle: card.subtitle || "",
      cardType: card.type,
      cardDescription: card.description,
      effect: card.effect || "music_trend",
      modifier: card.modifier || 0,
      popularityDice: card.popularityDice || 0,
      cardsToDraw: card.cardsToDraw || 0,
      cardsToSteal: card.cardsToSteal || 0,
      flatPenalty: 0,
      cashBonus: card.cashBonus || 0,
      targetManagerId: card.effect === "cash_attack" || card.effect === "refund_booking_fee" || card.effect === "charity_case" ? trendTargetManager.id : "all",
      targetManagerName: card.effect === "cash_attack" || card.effect === "refund_booking_fee" || card.effect === "charity_case" ? trendTargetManager.name : "All Promoters",
      venueType: card.effect === "special_guest_draw" ? venueType : trendVenueType,
      bandName: card.effect === "special_guest_draw" ? trendVenueName : trendVenueName,
      footerText,
      statusText: climateStatus || stealSummary,
    });
    state.lastCardActionText = footerText;
    logEvent(stealSummary ? `${footerText} ${stealSummary}.` : footerText);
    return;
  }

  const { targetBandName: explicitTargetBandName = "", targetSlotKey = "" } = options;
  const targetManager = state.managers.find((candidate) => candidate.id === targetManagerId);
  if (!targetManager) {
    return;
  }

  const consumePlayedCard = () => {
    manager.hand = manager.hand.filter((candidate) => candidate.id !== card.id);
  };

  const targetBandName = explicitTargetBandName || getAssignedBandName(targetManager, venueType, targetSlotKey || HEADLINER_SLOT);

  if (card.type === "defense" && card.effect === "cancel_scandal") {
    const removalVenueType = venueType || currentVenueTypeForBand(targetManager, targetBandName, currentRoundData());
    const removedScandal = removeOneActiveScandalEffect(targetManager.id, removalVenueType, targetBandName);
    if (!removedScandal) {
      logEvent(`No Rumor or Scandal is currently active on ${targetBandName}.`);
      return;
    }

    const clearedLabel = removedScandal.cardSubtitle || removedScandal.subtitle || removedScandal.cardName || "Rumor/Scandal";
    const footerText = `${manager.name} played ${cardTitleText(card)} on ${targetManager.name}'s ${targetBandName}. ${clearedLabel} was cleared.`;
    state.roundCardPlays.push({
      managerId: manager.id,
      managerName: manager.name,
      cardName: card.name,
      cardSubtitle: card.subtitle || "",
      cardType: card.type,
      cardDescription: card.description,
      effect: card.effect,
      modifier: 0,
      popularityDice: 0,
      flatPenalty: 0,
      targetManagerId,
      targetManagerName: targetManager.name,
      venueType: removalVenueType,
      targetSlotKey,
      bandName: targetBandName,
      footerText,
      statusText: `${clearedLabel} was cleared.`,
    });
    consumePlayedCard();
    state.lastCardActionText = footerText;
    logEvent(`${manager.name} used Good PR to clear ${clearedLabel} from ${targetBandName}.`);
    return;
  }

  if (card.type === "defense" && card.effect === "cancel_demands") {
    const removedDemand = removeOneDemandEffect(targetManager.id, targetBandName);
    if (!removedDemand) {
      logEvent(`No Demands effect is currently active on ${targetBandName}.`);
      return;
    }

    const footerText = `${manager.name} played ${cardTitleText(card)} on ${targetManager.name}'s ${targetBandName}. ${removedDemand.subtitle || "Demands"} was cleared.`;
    state.roundCardPlays.push({
      managerId: manager.id,
      managerName: manager.name,
      cardName: card.name,
      cardSubtitle: card.subtitle || "",
      cardType: card.type,
      cardDescription: card.description,
      effect: card.effect,
      modifier: 0,
      popularityDice: 0,
      flatPenalty: 0,
      targetManagerId,
      targetManagerName: targetManager.name,
      venueType: venueType || "roster",
      targetSlotKey,
      bandName: targetBandName,
      footerText,
      statusText: `${removedDemand.subtitle || "Demands"} was cleared.`,
    });
    consumePlayedCard();
    state.lastCardActionText = footerText;
    logEvent(`${manager.name} used Common Sense to clear ${removedDemand.subtitle || "a Demands card"} from ${targetBandName}.`);
    return;
  }

  if (card.effect === "persistent_ad_agency") {
    if (managerHasAdvertisingAgency(targetManager.id)) {
      logEvent(`${targetManager.name} already has Advertising Agency active.`);
      return;
    }

    const footerText = describeCardPlay(manager, card, targetManager, "agency", "");
    state.roundCardPlays.push({
      managerId: manager.id,
      managerName: manager.name,
      cardName: card.name,
      cardSubtitle: card.subtitle || "",
      cardType: card.type,
      cardDescription: card.description,
      effect: card.effect,
      modifier: 0,
      popularityDice: 0,
      flatPenalty: 0,
      targetManagerId,
      targetManagerName: targetManager.name,
      venueType: "agency",
      targetSlotKey: "",
      bandName: "",
      footerText,
    });
    state.persistentPromoterEffects.push({
      cardName: card.name,
      effect: card.effect,
      targetManagerId,
      targetManagerName: targetManager.name,
    });
    consumePlayedCard();
    state.lastCardActionText = footerText;
    logEvent(`${manager.name} hired an Advertising Agency for ${targetManager.name}. That promoter can now place two advertising buys each round.`);
    return;
  }

  if (card.effect === "venue_snowstorm") {
    if (venueHasSnowstorm(venueType)) {
      logEvent(`A snowstorm is already active at ${venueType}.`);
      return;
    }

    const footerText = describeCardPlay(manager, card, targetManager, venueType, "");
    state.roundCardPlays.push({
      managerId: manager.id,
      managerName: manager.name,
      cardName: card.name,
      cardSubtitle: card.subtitle || "",
      cardType: card.type,
      cardDescription: card.description,
      effect: card.effect,
      modifier: 0,
      popularityDice: 0,
      flatPenalty: 0,
      targetManagerId: "all",
      targetManagerName: "All Promoters",
      venueType,
      targetSlotKey: "",
      bandName: "",
      footerText,
    });
    consumePlayedCard();
    state.lastCardActionText = footerText;
    logEvent(footerText);
    return;
  }

  if (card.effect === "venue_snow_tires") {
    if (managerHasSnowTires(targetManager.id, venueType)) {
      logEvent(`${targetManager.name} already has Snow Tires active at ${venueType}.`);
      return;
    }

    const footerText = describeCardPlay(manager, card, targetManager, venueType, "");
    state.roundCardPlays.push({
      managerId: manager.id,
      managerName: manager.name,
      cardName: card.name,
      cardSubtitle: card.subtitle || "",
      cardType: card.type,
      cardDescription: card.description,
      effect: card.effect,
      modifier: 0,
      popularityDice: 0,
      flatPenalty: 0,
      targetManagerId: targetManager.id,
      targetManagerName: targetManager.name,
      venueType,
      targetSlotKey: "",
      bandName: "",
      footerText,
    });
    consumePlayedCard();
    state.lastCardActionText = footerText;
    logEvent(footerText);
    return;
  }

  if (card.effect === "duet_persistent") {
    const duetTarget = getDuetTargetForVenue(targetManager, venueType);
    if (!duetTarget) {
      logEvent(`Duet needs both a headliner and an opener at ${venueType}.`);
      return;
    }

    const footerText = describeCardPlay(
      manager,
      card,
      targetManager,
      venueType,
      duetTarget.bandName,
      duetTarget.pairedBandName
    );

    state.roundCardPlays.push({
      managerId: manager.id,
      managerName: manager.name,
      cardName: card.name,
      cardSubtitle: card.subtitle || "",
      cardType: card.type,
      cardDescription: card.description,
      effect: card.effect,
      modifier: card.modifier || 0,
      popularityDice: 0,
      flatPenalty: 0,
      targetManagerId,
      targetManagerName: targetManager.name,
      venueType,
      targetSlotKey: duetTarget.slotKey,
      bandName: duetTarget.bandName,
      pairedBandName: duetTarget.pairedBandName,
      footerText,
    });

    [
      { bandName: duetTarget.bandName, slotKey: duetTarget.slotKey },
      { bandName: duetTarget.pairedBandName, slotKey: duetTarget.pairedSlotKey },
    ].forEach((entry) => {
      state.persistentSmashHits.push({
        cardName: card.name,
        subtitle: card.subtitle || "",
        modifier: card.modifier || 0,
        popularityDice: 0,
        targetManagerId,
        targetManagerName: targetManager.name,
        venueType,
        slotKey: entry.slotKey,
        bandName: entry.bandName,
      });
    });

    consumePlayedCard();
    state.lastCardActionText = footerText;
    logEvent(`${manager.name} played Duet on ${targetManager.name}'s ${duetTarget.bandName} and ${duetTarget.pairedBandName} at ${venueType}.`);
    return;
  }

  if (card.effect === "sit_out_boost_persistent") {
    const removedAssignment = removeBandFromRoundAssignments(targetManager, targetBandName, currentRoundData());
    markBandSittingOutThisRound(targetManager.id, targetBandName);

    const footerText = describeCardPlay(manager, card, targetManager, removedAssignment?.venueType || venueType || "week_off", targetBandName);
    state.roundCardPlays.push({
      managerId: manager.id,
      managerName: manager.name,
      cardName: card.name,
      cardSubtitle: card.subtitle || "",
      cardType: card.type,
      cardDescription: card.description,
      effect: card.effect,
      modifier: card.modifier || 0,
      popularityDice: 0,
      flatPenalty: 0,
      targetManagerId,
      targetManagerName: targetManager.name,
      venueType: removedAssignment?.venueType || venueType || "week_off",
      targetSlotKey: removedAssignment?.slotKey || targetSlotKey,
      bandName: targetBandName,
      footerText,
    });

    state.persistentSmashHits.push({
      cardName: card.name,
      subtitle: card.subtitle || "",
      modifier: card.modifier || 0,
      popularityDice: 0,
      targetManagerId,
      targetManagerName: targetManager.name,
      venueType: removedAssignment?.venueType || venueType || "week_off",
      slotKey: removedAssignment?.slotKey || targetSlotKey,
      bandName: targetBandName,
    });

    consumePlayedCard();
    state.lastCardActionText = footerText;
    logEvent(
      removedAssignment
        ? `${manager.name} played ${card.name} on ${targetBandName}, pulling that band out of ${removedAssignment.venueType} this week for a long-term popularity boost.`
        : `${manager.name} played ${card.name} on ${targetBandName} while they were already resting this week.`
    );
    return;
  }

  if (card.effect === "argument_duo") {
    const duoTarget = getDuetTargetForVenue(targetManager, venueType);
    if (!duoTarget) {
      logEvent(`Argument needs an opponent with both a headliner and an opener at ${venueType}.`);
      return;
    }

    const footerText = describeCardPlay(
      manager,
      card,
      targetManager,
      venueType,
      duoTarget.bandName,
      duoTarget.pairedBandName
    );
    state.roundCardPlays.push({
      managerId: manager.id,
      managerName: manager.name,
      cardName: card.name,
      cardSubtitle: card.subtitle || "",
      cardType: card.type,
      cardDescription: card.description,
      effect: card.effect,
      modifier: -(card.flatPenalty || 2),
      popularityDice: 0,
      flatPenalty: card.flatPenalty || 2,
      targetManagerId,
      targetManagerName: targetManager.name,
      venueType,
      targetSlotKey: duoTarget.slotKey,
      bandName: duoTarget.bandName,
      pairedBandName: duoTarget.pairedBandName,
      footerText,
    });
    consumePlayedCard();
    state.lastCardActionText = footerText;
    logEvent(`${manager.name} played Argument on ${targetManager.name}'s ${duoTarget.bandName} and ${duoTarget.pairedBandName} at ${venueType}.`);
    return;
  }

  if (card.effect === "feud") {
    const pairedTargetManager = state.managers.find((candidate) => candidate.id === options.pairedTargetManagerId);
    const pairedBandName = options.pairedBandName || "";
    if (!targetBandName || !pairedTargetManager || !pairedBandName) {
      logEvent("Feud needs two valid acts in the same venue.");
      return;
    }

    const firstRoll = 1 + Math.floor(Math.random() * 6);
    const secondRoll = 1 + Math.floor(Math.random() * 6);
    const firstModifier = firstRoll >= 5 ? 2 : -2;
    const secondModifier = secondRoll >= 5 ? 2 : -2;
    const footerText = `${manager.name} played Feud on ${targetManager.name}'s ${targetBandName} and ${pairedTargetManager.name}'s ${pairedBandName}. Rolls: ${targetBandName} ${firstRoll} (${formatCardEffectDelta(firstModifier, 0)}), ${pairedBandName} ${secondRoll} (${formatCardEffectDelta(secondModifier, 0)}).`;

    state.roundCardPlays.push({
      managerId: manager.id,
      managerName: manager.name,
      cardName: card.name,
      cardSubtitle: `${targetBandName} rolled ${firstRoll}`,
      cardType: card.type,
      cardDescription: card.description,
      effect: "flat_bonus",
      modifier: firstModifier,
      popularityDice: 0,
      flatPenalty: 0,
      targetManagerId,
      targetManagerName: targetManager.name,
      venueType,
      targetSlotKey,
      bandName: targetBandName,
      footerText,
    });
    state.roundCardPlays.push({
      managerId: manager.id,
      managerName: manager.name,
      cardName: card.name,
      cardSubtitle: `${pairedBandName} rolled ${secondRoll}`,
      cardType: card.type,
      cardDescription: card.description,
      effect: "flat_bonus",
      modifier: secondModifier,
      popularityDice: 0,
      flatPenalty: 0,
      targetManagerId: pairedTargetManager.id,
      targetManagerName: pairedTargetManager.name,
      venueType,
      targetSlotKey: options.pairedTargetSlotKey || "",
      bandName: pairedBandName,
      footerText,
    });
    queueCardEvent({
      managerId: manager.id,
      managerName: manager.name,
      cardName: card.name,
      cardSubtitle: card.subtitle || "",
      cardType: card.type,
      cardDescription: `Two acts feud over radio airplay. ${targetBandName} rolled ${firstRoll} (${formatCardEffectDelta(firstModifier, 0)} this week). ${pairedBandName} rolled ${secondRoll} (${formatCardEffectDelta(secondModifier, 0)} this week).`,
      effect: "display_only",
      targetManagerId,
      targetManagerName: targetManager.name,
      venueType,
      targetSlotKey,
      bandName: targetBandName,
      pairedBandName,
      footerText,
      statusText: "Feud resolved",
    });
    consumePlayedCard();
    state.lastCardActionText = footerText;
    logEvent(footerText);
    return;
  }

  if (card.effect === "dance_off") {
    const pairedTargetManager = state.managers.find((candidate) => candidate.id === options.pairedTargetManagerId);
    const pairedBandName = options.pairedBandName || "";
    if (!targetBandName || !pairedTargetManager || !pairedBandName) {
      logEvent("Dance Off needs one of your acts and one opponent act in the same venue.");
      return;
    }

    const firstRoll = rollNotation("2D");
    const secondRoll = rollNotation("2D");
    let winnerText = "Tie: nobody gains popularity.";
    if (firstRoll.total > secondRoll.total) {
      state.roundCardPlays.push({
        managerId: manager.id,
        managerName: manager.name,
        cardName: card.name,
        cardSubtitle: `${targetBandName} won ${firstRoll.total}-${secondRoll.total}`,
        cardType: card.type,
        cardDescription: card.description,
        effect: "flat_bonus",
        modifier: 5,
        popularityDice: 0,
        flatPenalty: 0,
        targetManagerId,
        targetManagerName: targetManager.name,
        venueType,
        targetSlotKey,
        bandName: targetBandName,
      });
      winnerText = `${targetBandName} wins and gets +5 this week.`;
    } else if (secondRoll.total > firstRoll.total) {
      state.roundCardPlays.push({
        managerId: manager.id,
        managerName: manager.name,
        cardName: card.name,
        cardSubtitle: `${pairedBandName} won ${secondRoll.total}-${firstRoll.total}`,
        cardType: card.type,
        cardDescription: card.description,
        effect: "flat_bonus",
        modifier: 5,
        popularityDice: 0,
        flatPenalty: 0,
        targetManagerId: pairedTargetManager.id,
        targetManagerName: pairedTargetManager.name,
        venueType,
        targetSlotKey: options.pairedTargetSlotKey || "",
        bandName: pairedBandName,
      });
      winnerText = `${pairedBandName} wins and gets +5 this week.`;
    }

    const footerText = `${manager.name} played Dance Off on ${targetManager.name}'s ${targetBandName} and ${pairedTargetManager.name}'s ${pairedBandName}. Rolls: ${targetBandName} ${firstRoll.detail}=${firstRoll.total}, ${pairedBandName} ${secondRoll.detail}=${secondRoll.total}. ${winnerText}`;
    queueCardEvent({
      managerId: manager.id,
      managerName: manager.name,
      cardName: card.name,
      cardSubtitle: card.subtitle || "",
      cardType: card.type,
      cardDescription: `Dance Off rolls: ${targetBandName} ${firstRoll.total}, ${pairedBandName} ${secondRoll.total}. ${winnerText}`,
      effect: "display_only",
      targetManagerId,
      targetManagerName: targetManager.name,
      venueType,
      targetSlotKey,
      bandName: targetBandName,
      pairedBandName,
      footerText,
      statusText: "Dance Off resolved",
    });
    consumePlayedCard();
    state.lastCardActionText = footerText;
    logEvent(footerText);
    return;
  }

  if (isExactCardAlreadyOnBand(targetManager.id, targetBandName, card)) {
    logEvent(`${card.name}${card.subtitle ? `: ${card.subtitle}` : ""} is already affecting ${targetBandName}.`);
    return;
  }

  if (((card.type === "scandal" || card.type === "rumor") || isDemandsCard(card)) && targetManager.id !== manager.id) {
    if (targetBandName && hasSuperLawyerProtection(targetManager.id, targetBandName)) {
      consumePlayedCard();
      queueStoppedAttackEvent(
        manager,
        card,
        targetManager,
        venueType,
        targetBandName,
        "This attack was blocked by an active Super Lawyer.",
        `${targetManager.name}'s Super Lawyer blocked it on ${targetBandName}.`
      );
      logEvent(
        `${targetManager.name}'s Super Lawyer blocked ${card.name}${card.subtitle ? `: ${card.subtitle}` : ""} on ${targetBandName}.`
      );
      return;
    }

    const superLawyer = (card.type === "scandal" || card.type === "rumor") ? findSuperLawyer(targetManager) : null;
    const goodPr = (card.type === "scandal" || card.type === "rumor") ? findGoodPr(targetManager) : null;
    const commonSense = isDemandsCard(card) ? findCommonSense(targetManager) : null;
    if (targetManager.isPlayer && targetBandName && (superLawyer || goodPr || commonSense)) {
      consumePlayedCard();
      state.pendingDefenseChoice = {
        managerId: manager.id,
        managerName: manager.name,
        targetManagerId: targetManager.id,
        targetManagerName: targetManager.name,
        venueType,
        slotKey: targetSlotKey,
        bandName: targetBandName,
        card: { ...card },
        superLawyerId: superLawyer?.id || "",
        goodPrId: goodPr?.id || "",
        commonSenseId: commonSense?.id || "",
      };
      state.lastCardActionText = `${manager.name} played ${defensePromptLabel(card)} on ${targetBandName}. Do you want to use a defense card?`;
      return;
    }

    if (superLawyer && targetBandName) {
      consumePlayedCard();
      targetManager.hand = targetManager.hand.filter((candidate) => candidate.id !== superLawyer.id);
      const clearedScandal = ensureSuperLawyerProtection(targetManager, venueType, targetBandName);
      queueStoppedAttackEvent(
        manager,
        card,
        targetManager,
        venueType,
        targetBandName,
        clearedScandal
          ? "This attack was blocked before it could land. One active scandal was cleared from the band."
          : "This attack was blocked before it could land.",
        `${targetManager.name} used Super Lawyer to protect ${targetBandName}.${clearedScandal ? " One active scandal was cleared." : ""}`
      );
      logEvent(
        `${targetManager.name} used Super Lawyer to protect ${targetBandName} from ${card.name}${card.subtitle ? `: ${card.subtitle}` : ""}.${clearedScandal ? " One active scandal was cleared." : ""}`
      );
      return;
    }

    if (commonSense) {
      consumePlayedCard();
      targetManager.hand = targetManager.hand.filter((candidate) => candidate.id !== commonSense.id);
      queueStoppedAttackEvent(
        manager,
        card,
        targetManager,
        venueType,
        targetBandName,
        "This Demands card was canceled before it could land.",
        `${targetManager.name} used Common Sense to cancel it${targetBandName ? ` on ${targetBandName}` : ""}.`
      );
      logEvent(
        `${targetManager.name} used Common Sense to cancel ${card.name}${card.subtitle ? `: ${card.subtitle}` : ""} on ${venueType}${targetBandName ? ` (${targetBandName})` : ""}.`
      );
      return;
    }

    if (goodPr) {
      consumePlayedCard();
      targetManager.hand = targetManager.hand.filter((candidate) => candidate.id !== goodPr.id);
      queueStoppedAttackEvent(
        manager,
        card,
        targetManager,
        venueType,
        targetBandName,
        "This attack was canceled before it could land.",
        `${targetManager.name} used Good PR to cancel it${targetBandName ? ` on ${targetBandName}` : ""}.`
      );
      logEvent(
        `${targetManager.name} used Good PR to cancel ${card.name}${card.subtitle ? `: ${card.subtitle}` : ""} on ${venueType}${targetBandName ? ` (${targetBandName})` : ""}.`
      );
      return;
    }
  }

  state.roundCardPlays.push({
    managerId: manager.id,
    managerName: manager.name,
    cardName: card.name,
    cardSubtitle: card.subtitle || "",
    cardType: card.type,
    cardDescription: card.description,
    effect: card.effect || "flat_bonus",
    modifier: card.modifier,
    popularityDice: card.popularityDice || 0,
    flatPenalty: card.flatPenalty || 0,
    scandalModifier: card.scandalModifier || 0,
    scandalDiceModifier: card.scandalDiceModifier || 0,
    targetManagerId,
    targetManagerName: targetManager.name,
    venueType,
    targetSlotKey,
    bandName: targetBandName,
    footerText: describeCardPlay(manager, card, targetManager, venueType, targetBandName),
  });
  state.lastCardActionText = describeCardPlay(manager, card, targetManager, venueType, targetBandName);

  if (card.effect === "biography") {
    const roll = 1 + Math.floor(Math.random() * 6);
    const positiveResult = roll >= 4;
    const biographyDescription = positiveResult
      ? `A flattering biography boosts the band's profile. Rolled ${roll}: +2 Popularity for the rest of the game.`
      : `The biography turns ugly and damages the band's image. Rolled ${roll}: -4 Popularity for the rest of the game.`;
    const biographyFooter = positiveResult
      ? `${manager.name} played ${cardTitleText(card)} on ${targetManager.name}'s ${targetBandName}. Rolled ${roll}, so that band gains +2 Popularity for the rest of the game.`
      : `${manager.name} played ${cardTitleText(card)} on ${targetManager.name}'s ${targetBandName}. Rolled ${roll}, so that band loses -4 Popularity for the rest of the game.`;

    state.roundCardPlays.pop();
    if (positiveResult) {
      state.persistentSmashHits.push({
        cardName: card.name,
        subtitle: `Rolled ${roll}`,
        modifier: 2,
        popularityDice: 0,
        targetManagerId,
        targetManagerName: targetManager.name,
        venueType,
        slotKey: targetSlotKey,
        bandName: targetBandName,
      });
    } else {
      state.persistentBadSongs.push({
        cardName: card.name,
        effect: card.effect,
        subtitle: `Rolled ${roll}`,
        flatPenalty: 4,
        popularityDice: 0,
        targetManagerId,
        targetManagerName: targetManager.name,
        venueType,
        slotKey: targetSlotKey,
        bandName: targetBandName,
      });
    }
    queueCardEvent({
      managerId: manager.id,
      managerName: manager.name,
      cardName: card.name,
      cardSubtitle: card.subtitle || "",
      cardType: card.type,
      cardDescription: biographyDescription,
      effect: "display_only",
      targetManagerId,
      targetManagerName: targetManager.name,
      venueType,
      targetSlotKey,
      bandName: targetBandName,
      footerText: biographyFooter,
      statusText: positiveResult ? "Biography hit" : "Biography flop",
    });
    logEvent(biographyFooter);
    consumePlayedCard();
    return;
  }

  if (card.effect === "persistent_scandal" || card.effect === "persistent_bust" || card.effect === "persistent_scandal_double") {
    state.persistentScandals.push({
      effect: card.effect,
      subtitle: card.subtitle || "",
      targetManagerId,
      targetManagerName: targetManager.name,
      venueType,
      slotKey: targetSlotKey,
      bandName: targetBandName,
    });
  }

  if (card.effect === "bad_song_persistent" || card.effect === "bad_song_persistent_discard_smash" || card.effect === "bad_song_until_week_off") {
    state.persistentBadSongs.push({
      cardName: card.name,
      effect: card.effect,
      subtitle: card.subtitle || "",
      flatPenalty: card.flatPenalty || 0,
      popularityDice: card.popularityDice || 0,
      targetManagerId,
      targetManagerName: targetManager.name,
      venueType,
      slotKey: targetSlotKey,
      bandName: targetBandName,
    });
  }

  if (card.effect === "persistent_smash") {
    state.persistentSmashHits.push({
      cardName: card.name,
      subtitle: card.subtitle || "",
      modifier: card.modifier || 0,
      popularityDice: card.popularityDice || 0,
      targetManagerId,
      targetManagerName: targetManager.name,
      venueType,
      slotKey: targetSlotKey,
      bandName: targetBandName,
    });
  }

  if (card.effect === "persistent_scandal_adjustment") {
    state.persistentScandalAdjustments.push({
      cardName: card.name,
      subtitle: card.subtitle || "",
      modifier: card.scandalModifier || 0,
      diceModifier: card.scandalDiceModifier || 0,
      targetManagerId,
      targetManagerName: targetManager.name,
      venueType,
      slotKey: targetSlotKey,
      bandName: targetBandName,
    });
  }

  if (card.effect === "bad_song_discard_smash" || card.effect === "bad_song_persistent_discard_smash") {
    const removedSmash = removePersistentSmashHit(targetManager.id, targetBandName);
    if (removedSmash) {
      logEvent(`${targetManager.name} lost Smash Hit: ${removedSmash.subtitle} on ${venueType} because of ${card.subtitle}.`);
    } else {
      const discarded = discardOneSmashCard(targetManager);
      if (discarded) {
        logEvent(`${targetManager.name} discarded ${discarded.name}${discarded.subtitle ? `: ${discarded.subtitle}` : ""} because of ${card.subtitle}.`);
      }
    }
  }

  if (card.effect === "remove_smash_hits") {
    const removedSmashes = removeAllActualSmashHitsForBand(targetManager.id, targetBandName);
    if (removedSmashes.length) {
      const removedLabels = removedSmashes
        .map((entry) => entry.subtitle || storedCardLabel(entry, "Smash Hit"))
        .join(", ");
      logEvent(`${targetManager.name} discarded Smash Hits on ${venueType} (${targetBandName}) because of Overplay: ${removedLabels}.`);
    }
  }

  consumePlayedCard();
  logEvent(`${manager.name} played ${card.name}${card.subtitle ? `: ${card.subtitle}` : ""} on ${targetManager.name}'s ${venueType} slot${targetBandName ? ` (${targetBandName})` : ""}.`);
}

function startCardPhase() {
  const roundData = currentRoundData();
  const player = state.managers[0];
  if (!roundData || state.phase !== "auction" || state.marketBands.some((band) => !band.resolved) || !assignmentIsComplete(player, roundData)) {
    return;
  }

  if (hasUnusedBandsAndEmptyVenues(player, roundData)) {
    const shouldProceed = window.confirm(
      "You still have open venue slots and unused bands. Do you want to continue to the card phase anyway?"
    );
    if (!shouldProceed) {
      return;
    }
  }

  if (!assignmentsWithinBudget(player, roundData.venues)) {
    window.alert("Your booking fees are higher than your current cash. Please remove a booking before moving to the card phase.");
    return;
  }

  state.managers.slice(1).forEach((manager) => chooseBestAssignments(manager, roundData.venues));
  state.currentVenueCardIndex = 0;
  state.showcase = {
    venueIndex: 0,
    viewVenueIndex: 0,
    revealPhase: 0,
    venueSettled: false,
    venueOrders: {},
    venueMessages: {},
    selectedManagerIds: {},
    message: "",
    bookingFeesPaid: false,
    roundProfitByManager: Object.fromEntries(state.managers.map((manager) => [manager.id, 0])),
    settledVenueIndices: [],
  };
  state.phase = "cards";
  state.activeWorkspace = "cards";
  state.activeSidebarView = "your_cards";
  resetVenueCardTurn(roundData);
  advanceCardTurns();
  render();
}

function nextCardManagerId(currentManagerId) {
  const order = state.cardTurnOrder;
  if (!order.length) {
    return "";
  }

  const currentIndex = order.indexOf(currentManagerId);
  for (let offset = 1; offset <= order.length; offset += 1) {
    const candidate = order[(currentIndex + offset + order.length) % order.length];
    if (!state.cardPassedManagers.includes(candidate)) {
      return candidate;
    }
  }
  return "";
}

function resetVenueCardTurn(roundData) {
  const otherManagers = state.managers
    .filter((manager) => manager.id !== "player")
    .sort((left, right) =>
      right.victoryPoints - left.victoryPoints ||
      right.cash - left.cash ||
      state.managers.indexOf(left) - state.managers.indexOf(right)
    );
  state.cardTurnOrder = ["player", ...otherManagers.map((manager) => manager.id)];
  state.cardPassedManagers = [];
  state.activeCardManagerId = state.cardTurnOrder[0] || "";
  const venue = activeVenueForCards(roundData);
  state.lastCardActionText = venue
    ? `Play cards for ${venue.name}. Any cards you use now are spent for the rest of the round.`
    : "";
}

function computeShowcaseOrderForVenue(venueIndex, roundData) {
  const venue = roundData?.venues[venueIndex];
  if (!venue) {
    return [];
  }

  return state.managers
    .map((manager) => {
      const estimate = estimatedVenueStrength(manager, venue, roundData);
      return {
        managerId: manager.id,
        estimatedRevenue: estimate.revenue,
        estimatedPopularity: estimate.popularity,
        bandName: estimate.bandLabel || "",
      };
    })
    .filter((entry) => Boolean(entry.bandName))
    .sort((a, b) => a.estimatedRevenue - b.estimatedRevenue || a.estimatedPopularity - b.estimatedPopularity || a.bandName.localeCompare(b.bandName))
    .map((entry) => entry.managerId);
}

function refreshRoundResults(roundData = currentRoundData()) {
  if (!roundData) {
    state.roundResults = [];
    return;
  }
  state.roundResults = state.managers.map((manager) => ({
    manager,
    result: computeRoundResult(manager, roundData.venues),
  }));
}

function cardPlayCountForManagerAtVenue(managerId, venueType) {
  return state.roundCardPlays.filter(
    (entry) => entry.managerId === managerId && entry.venueType === venueType && entry.cardName !== "Pass"
  ).length;
}

function aiChooseCardPlay(manager, roundData) {
  const topVictoryPoints = Math.max(...state.managers.map((entry) => entry.victoryPoints));
  const futureRounds = visibleFutureRounds();
  const venueIndex = activeVenueCardIndex();
  const currentVenue = activeVenueForCards(roundData);
  const remainingVenueSlices = currentVenue ? roundData.venues.slice(venueIndex) : [...roundData.venues];
  const venueWouldEndTourForManager = (candidate, venue) =>
    Boolean(candidate && venue && candidate.victoryPoints + venue.venuePoints >= VICTORY_TARGET);
  const nearWinLeaders = state.managers.filter(
    (entry) =>
      entry.id !== manager.id &&
      remainingVenueSlices.some(
        (venue) => venueHasBooking(entry, venue.type) && venueWouldEndTourForManager(entry, venue)
      )
  );
  const futureVenueSlices = roundData.venues.slice(venueIndex + 1);
  const futureOwnVenueSlices = futureVenueSlices.filter((venue) => venueHasBooking(manager, venue.type));
  const futureLeaderBookedVenues = futureVenueSlices.filter((venue) =>
    nearWinLeaders.some(
      (leader) => venueHasBooking(leader, venue.type) && venueWouldEndTourForManager(leader, venue)
    )
  );
  const futureLeaderContestVenues = futureVenueSlices.filter((venue) =>
    nearWinLeaders.some(
      (leader) => venueHasBooking(leader, venue.type) && venueWouldEndTourForManager(leader, venue)
    ) && venueHasBooking(manager, venue.type)
  );
  const currentVenueWeight = currentVenue ? venueStrategicWeight(currentVenue) : 0;
  const futureVenueWeight = futureVenueSlices.reduce((sum, venue) => sum + venueStrategicWeight(venue), 0);
  const futureBestVenueWeight = futureVenueSlices.length
    ? Math.max(...futureVenueSlices.map((venue) => venueStrategicWeight(venue)))
    : 0;
  const futureOwnVenueWeight = futureOwnVenueSlices.reduce((sum, venue) => sum + venueStrategicWeight(venue), 0);
  const futureOwnBestVenueWeight = futureOwnVenueSlices.length
    ? Math.max(...futureOwnVenueSlices.map((venue) => venueStrategicWeight(venue)))
    : 0;
  const higherValueFutureVenueCount = futureVenueSlices.filter(
    (venue) => venueStrategicWeight(venue) > currentVenueWeight
  ).length;
  const muchBetterFutureVenueCount = futureVenueSlices.filter(
    (venue) => venueStrategicWeight(venue) >= currentVenueWeight + 12
  ).length;
  const higherValueOwnFutureVenueCount = futureOwnVenueSlices.filter(
    (venue) => venueStrategicWeight(venue) > currentVenueWeight
  ).length;
  const muchBetterOwnFutureVenueCount = futureOwnVenueSlices.filter(
    (venue) => venueStrategicWeight(venue) >= currentVenueWeight + 12
  ).length;
  const cardsPlayedThisVenue = currentVenue
    ? cardPlayCountForManagerAtVenue(manager.id, currentVenue.type)
    : 0;
  const options = manager.hand.flatMap((card) => {
    const targets = getCardTargets(manager, card, roundData);
    return targets.map((target) => {
      const venue = roundData.venues.find((entry) => entry.type === target.venueType);
      const targetManager = state.managers.find((candidate) => candidate.id === target.managerId);
      const snowstormActiveAtVenue = venue ? venueHasSnowstorm(venue.type) : false;
      const ownSnowTiresActiveAtVenue = venue ? managerHasSnowTires(manager.id, venue.type) : false;
      const targetSnowTiresActiveAtVenue = venue && targetManager ? managerHasSnowTires(targetManager.id, venue.type) : false;
      const holdsSnowstormCard = manager.hand.some((handCard) => handCard.id !== card.id && handCard.effect === "venue_snowstorm");
      const competition = venue ? venueCompetitionSummary(roundData, venue) : null;
      const leaderIsPresentLater = futureLeaderBookedVenues.length > 0;
      const leaderContestOpportunityLater = futureLeaderContestVenues.length > 0;
      const immediateWinThreats = venue
        ? state.managers
            .map((candidate) => {
              const candidateEstimate = estimatedVenueStrength(candidate, venue, roundData);
              const candidateGapFromLeader = Math.max(0, (competition?.topScore ?? 0) - (candidateEstimate.popularity || 0));
              const threatening =
                Boolean(candidateEstimate.bandLabel) &&
                venueWouldEndTourForManager(candidate, venue) &&
                ((competition?.leaders.some((entry) => entry.managerId === candidate.id)) || candidateGapFromLeader <= 3);
              return threatening ? candidate.id : "";
            })
            .filter(Boolean)
        : [];
      const ownEstimate = venue ? estimatedVenueStrength(manager, venue, roundData) : { revenue: 0 };
      const targetEstimate = venue && targetManager ? estimatedVenueStrength(targetManager, venue, roundData) : { revenue: 0 };
      const pairedTargetManager = state.managers.find((candidate) => candidate.id === target.pairedManagerId);
      const pairedTargetEstimate = venue && pairedTargetManager ? estimatedVenueStrength(pairedTargetManager, venue, roundData) : { revenue: 0 };
      const targetBand = targetManager ? getBandByName(targetManager, target.bandName) : null;
      const pairedTargetBand = pairedTargetManager ? getBandByName(pairedTargetManager, target.pairedBandName) : null;
      const targetSlotPerformance =
        venue && targetManager && targetBand
          ? buildEstimatedVenuePerformance(targetManager, venue, targetBand, target.slotKey)
          : null;
      const currentScandalAdjustment = targetBand ? persistentScandalAdjustmentSummary(target.managerId, targetBand) : { modifier: 0, diceModifier: 0 };
      const smashStrength = (card.modifier || 0) + (card.popularityDice || 0) * 3.5;
      const badSongStrength = (card.flatPenalty || 0) + Math.max(0, -(card.popularityDice || 0)) * 3.5;
      const leaderScore = competition?.topScore ?? 0;
      const isTargetLeading = competition?.leaders.some((entry) => entry.managerId === target.managerId) ?? false;
      const venueWeight = venue ? venueStrategicWeight(venue) : 0;
      const scandalSwing = targetBand ? estimatedScandalSwing(target.managerId, targetBand) : 0;
      const ownBandBooked = venueHasBooking(manager, target.venueType);
      const catchup = Math.max(0, leaderScore - (ownEstimate.popularity || 0));
      const canStealVenue =
        ownBandBooked &&
        targetManager?.id !== manager.id &&
        (targetEstimate.popularity || 0) >= (ownEstimate.popularity || 0);
      const targetVictoryPoints = targetManager?.victoryPoints || 0;
      const vpGap = Math.max(0, targetVictoryPoints - manager.victoryPoints);
      const targetIsVpLeader = Boolean(targetManager && targetManager.id !== manager.id && targetVictoryPoints === topVictoryPoints && topVictoryPoints > manager.victoryPoints);
      const targetCanEndTourAtVenue = Boolean(
        targetManager &&
        targetManager.id !== manager.id &&
        venueWouldEndTourForManager(targetManager, venue)
      );
      const targetNearWin = Math.max(0, targetVictoryPoints - (VICTORY_TARGET - 12));
      const rankedStandings = competition?.standings.filter((entry) => entry.bandName) || [];
      const secondPlaceScore = rankedStandings.find((entry) => entry.managerId !== target.managerId)?.popularity ?? 0;
      const secondPlaceRevenue = rankedStandings.find((entry) => entry.managerId !== target.managerId)?.revenue ?? 0;
      const targetGapFromLeader = Math.max(0, leaderScore - (targetEstimate.popularity || 0));
      const targetCanWinTourHere = Boolean(
        targetManager &&
        venue &&
        targetCanEndTourAtVenue &&
        (isTargetLeading || targetGapFromLeader <= 3)
      );
      const someoneElseCanWinTourHere = immediateWinThreats.length > 0;
      const shouldStopSpecificTargetNow = targetCanWinTourHere;
      const ownLeadOnTarget = ownBandBooked ? Math.max(0, (ownEstimate.popularity || 0) - (targetEstimate.popularity || 0)) : 0;
      const targetRank = rankedStandings.findIndex((entry) => entry.managerId === target.managerId);
      const sabotageCardsAlreadyOnTarget = venue && targetBand
        ? state.roundCardPlays.filter(
            (entry) =>
              entry.targetManagerId === target.managerId &&
              entry.venueType === venue.type &&
              entry.bandName === target.bandName &&
              (entry.cardType === "bad_song" || entry.cardType === "scandal" || entry.cardType === "rumor")
          ).length
        : 0;
      const carryoverSabotage =
        card.effect === "persistent_scandal" ||
        card.effect === "persistent_bust" ||
        card.effect === "persistent_scandal_double" ||
        card.effect === "bad_song_persistent" ||
        card.effect === "bad_song_persistent_discard_smash" ||
        card.effect === "bad_song_until_week_off";
      const oneShotSabotage =
        (card.type === "bad_song" || card.type === "scandal" || card.type === "rumor") &&
        !carryoverSabotage;
      const targetVisibleInvestment =
        Math.max(0, targetSlotPerformance?.cardModifier || 0) +
        Math.max(0, targetSlotPerformance?.smashBonus || 0) +
        Math.max(0, targetEstimate.advertisingBonus || 0);
      const targetSmashHitEntries = targetBand ? activeActualSmashHitEntriesForBand(target.managerId, target.bandName) : [];
      const targetSmashHitFlat = targetSmashHitEntries.reduce((sum, entry) => sum + (entry.modifier || 0), 0);
      const targetSmashHitDice = targetSmashHitEntries.reduce((sum, entry) => sum + (entry.popularityDice || 0), 0);
      const currentSmashStripValue =
        targetSmashHitEntries.length && venue
          ? weightedVenueContribution(targetSmashHitFlat + targetSmashHitDice * 3.5, target.slotKey) * ((venue.revenueFactor || 0) + 1.6)
          : 0;
      const futureSmashStripValue =
        targetBand && targetSmashHitEntries.length
          ? projectedBandValueAcrossRoundsWithPopularityDelta(targetBand, futureRounds, targetSmashHitFlat, targetSmashHitDice) -
            projectedBandValueAcrossRoundsWithPopularityDelta(targetBand, futureRounds, 0, 0)
          : 0;
      const runawayScoreLead = Math.max(0, (targetEstimate.popularity || 0) - secondPlaceScore - 2);
      const runawayRevenueLead = Math.max(0, (targetEstimate.revenue || 0) - secondPlaceRevenue - 4);
      const futureTargetValue = targetBand ? projectedBandValueAcrossPreview(targetBand, futureRounds) : 0;
      const targetSlotScore = targetSlotPerformance?.weightedScore || 0;
      const targetSlotRevenue = targetSlotPerformance?.weightedRevenue || 0;
      const slotThreatFactor = target.slotKey === HEADLINER_SLOT ? 1 : 0.68;
      const targetStillThreateningVenue =
        isTargetLeading ||
        targetGapFromLeader <= 3 ||
        (targetSlotRevenue > 0 && ownLeadOnTarget < 3);
      const targetAlreadyNeutralized =
        Boolean(targetManager && targetManager.id !== manager.id) &&
        !targetStillThreateningVenue &&
        (
          targetSlotRevenue <= 0 ||
          targetGapFromLeader >= 5 ||
          ownLeadOnTarget >= 4 ||
          targetRank === rankedStandings.length - 1
        );
      const sabotagePressureBase =
        targetManager && targetManager.id !== manager.id
          ? vpGap * 2.4 +
            (targetIsVpLeader ? 14 : 0) +
            targetNearWin * 2 +
            (isTargetLeading ? (venue?.venuePoints || 0) * 3 : 0) +
            (canStealVenue ? 14 : 0) +
            Math.max(0, targetSlotScore - 3) * 1.8 * slotThreatFactor
          : 0;
      const venueThreatFactor =
        targetManager && targetManager.id !== manager.id
          ? isTargetLeading
            ? 1
            : targetGapFromLeader <= 2
              ? 0.85
              : targetGapFromLeader <= 4
                ? 0.45
                : 0.12
          : 0;
      const sabotagePressure = sabotagePressureBase * venueThreatFactor;
      const powerhouseTargetBonus =
        targetManager && targetManager.id !== manager.id
          ? runawayScoreLead * 2.7 +
            runawayRevenueLead * 1.5 +
            targetSlotRevenue * 0.85 +
            targetVisibleInvestment * 1.2 +
            ((targetEstimate.popularity || 0) >= 16 ? 10 : 0) +
            ((targetEstimate.revenue || 0) >= 24 ? 10 : 0)
          : 0;
      const snowstormAtCurrentVenue = Boolean(currentVenue && venue && venue.type === currentVenue.type && snowstormActiveAtVenue);
      const currentVenueSnowCancelsManager = snowstormAtCurrentVenue && !ownSnowTiresActiveAtVenue;
      const currentVenueSnowCancelsTarget = snowstormAtCurrentVenue && !targetSnowTiresActiveAtVenue;
      const snowedOutSelfDevelopmentCard =
        card.type === "smash" &&
        targetManager?.id === manager.id &&
        (
          card.effect === "persistent_smash" ||
          card.effect === "persistent_scandal_adjustment" ||
          card.effect === "duet_persistent" ||
          card.effect === "sit_out_boost_persistent"
        );

      let score = -Infinity;
      if (card.type === "smash") {
        if (card.effect === "persistent_ad_agency") {
          const agencyFutureRounds = visibleFutureRounds();
          const profile = advertisingStrategyProfile(manager);
          const affordableTiles = advertisingTilesForManager(manager).filter((value) => advertisingCost(value) <= manager.cash);
          const bestUpcomingVenue = agencyFutureRounds
            .flatMap((round) => round.venues.map((venue) => ({
              round,
              venue,
              weight: venue.venuePoints * venue.revenueFactor,
              fit: manager.roster.reduce((best, band) => Math.max(best, genreFitScore(band, venue) + parseDiceAverageSigned(band.popularity)), 0),
            })))
            .sort((left, right) => right.weight - left.weight || right.fit - left.fit)[0];
          const doubleBuyPotential = affordableTiles.slice(-2).reduce((sum, value) => sum + value, 0);
          const cashAfterReserve = manager.cash - aiAdvertisingLiquidityReserve(manager, agencyFutureRounds, profile);
          const premiumVenueBonus = bestUpcomingVenue
            ? bestUpcomingVenue.weight * (bestUpcomingVenue.round.roundNumber <= state.round + 2 ? 2.6 : 1.5)
            : 0;
          const inventoryBonus = affordableTiles.length >= 2 ? 20 + doubleBuyPotential * 3.2 : affordableTiles.length === 1 ? 6 : -10;
          const liquidityPenalty = cashAfterReserve < 0 ? Math.abs(cashAfterReserve) * 1.3 + 14 : 0;
          const lowCashPenalty = manager.cash < 20 ? 20 : manager.cash < 35 ? 10 : 0;
          score =
            premiumVenueBonus +
            inventoryBonus +
            Math.max(0, cashAfterReserve) * 0.18 +
            Math.max(0, bestUpcomingVenue?.fit || 0) * 0.9 -
            liquidityPenalty -
            lowCashPenalty;
        } else if (card.effect === "venue_snow_tires") {
          const ownVenueScore = ownEstimate.popularity || 0;
          const topRivalScore = competition?.standings
            ?.filter((entry) => entry.managerId !== manager.id)
            ?.reduce((best, entry) => Math.max(best, entry.popularity || 0), 0) || 0;
          const weatherSaveValue =
            snowstormActiveAtVenue
              ? 90 + (venue?.venuePoints || 0) * 10 + Math.max(0, ownEstimate.revenue || 0) * 2.2
              : 0;
          const ambushSetupValue =
            !snowstormActiveAtVenue && holdsSnowstormCard
              ? 36 + (venue?.venuePoints || 0) * 5 + Math.max(0, ownEstimate.revenue || 0) * 0.9
              : 0;
          const weakVenueHoldPenalty =
            !snowstormActiveAtVenue && futureOwnVenueSlices.length && futureOwnBestVenueWeight > currentVenueWeight
              ? 12 + Math.max(0, futureOwnBestVenueWeight - currentVenueWeight) * 0.35
              : 0;
          score =
            venueWeight * 0.9 +
            weatherSaveValue +
            ambushSetupValue +
            Math.max(0, ownVenueScore - topRivalScore + 2) * 4 -
            weakVenueHoldPenalty;
        } else if (card.effect === "sit_out_boost_persistent") {
          const futureBoostValue = targetBand
            ? projectedBandValueAcrossRoundsWithPopularityDelta(targetBand, futureRounds, card.modifier || 0, 0) -
              projectedBandValueAcrossRoundsWithPopularityDelta(targetBand, futureRounds, 0, 0)
            : 0;
          const scandalResilience =
            targetBand
              ? Math.max(
                  0,
                  3.5 - parseDiceAverageSignedWithModifier(
                    targetBand.scandal,
                    currentScandalAdjustment.modifier,
                    currentScandalAdjustment.diceModifier
                  )
                )
              : 0;
          const currentSacrifice = (target.venueType === "week_off" || target.venueType === "bench")
            ? 0
            : Math.max(0, targetEstimate.revenue || 0) + Math.max(0, (targetEstimate.popularity || 0) * 0.8);
          const alreadyRestingBonus = target.venueType === "week_off" || target.isSittingOut ? 18 : 0;
          const benchSetupBonus =
            target.venueType === "bench" || target.isBenched
              ? 22 +
                Math.max(0, 8 - (targetBand?.retention || 0)) * 2.4 +
                Math.max(0, projectedBandValueAcrossPreview(targetBand, futureRounds)) * 0.04
              : 0;
          const weakCurrentVenueBonus =
            target.venueType !== "week_off" && targetEstimate.revenue <= 4
              ? Math.max(0, 8 - (targetEstimate.revenue || 0)) * 4
              : 0;
          const cheapBenchDevelopmentBonus =
            target.venueType === "bench" && (targetBand?.retention || 99) <= 8
              ? 12 + Math.max(0, 10 - (targetBand?.retention || 0)) * 1.3
              : 0;
          const scandalShieldDevelopmentBonus =
            scandalResilience > 0
              ? scandalResilience * 8.5 +
                Math.max(0, 8 - (targetBand?.retention || 0)) * scandalResilience * 0.9
              : 0;
          const tinyRetentionProjectBonus =
            (targetBand?.retention || 99) <= 5
              ? 10 + scandalResilience * 3 + Math.max(0, card.modifier || 0) * 1.5
              : 0;
          const futureBandPressure = Math.max(0, projectedBandValueAcrossPreview(targetBand, futureRounds)) * 0.08;
          score =
            futureBoostValue * 0.32 +
            futureBandPressure +
            alreadyRestingBonus +
            benchSetupBonus +
            cheapBenchDevelopmentBonus +
            scandalShieldDevelopmentBonus +
            tinyRetentionProjectBonus +
            weakCurrentVenueBonus -
            currentSacrifice * 1.35;
        } else if (card.effect === "duet_persistent") {
          const openerMultiplier = VENUE_SLOT_LOOKUP[OPENER_SLOT]?.multiplier || 0.6;
          const currentDuetLift =
            (card.modifier || 0) * (venue?.revenueFactor || 0) +
            (card.modifier || 0) * openerMultiplier * (venue?.revenueFactor || 0);
          const futureHeadlinerLift = targetBand
            ? projectedBandValueAcrossRoundsWithPopularityDelta(targetBand, futureRounds, card.modifier || 0, 0) -
              projectedBandValueAcrossRoundsWithPopularityDelta(targetBand, futureRounds, 0, 0)
            : 0;
          const futurePairedLift = pairedTargetBand
            ? projectedBandValueAcrossRoundsWithPopularityDelta(pairedTargetBand, futureRounds, card.modifier || 0, 0) -
              projectedBandValueAcrossRoundsWithPopularityDelta(pairedTargetBand, futureRounds, 0, 0)
            : 0;
          const combinedBasePressure =
            Math.max(0, parseDiceAverageSigned(targetBand?.popularity || "0")) +
            Math.max(0, parseDiceAverageSigned(pairedTargetBand?.popularity || "0"));
          score =
            venueWeight * 1.2 +
            ownEstimate.revenue * 1.35 +
            (venue?.venuePoints || 0) * 5 +
            currentDuetLift * 3.4 +
            (futureHeadlinerLift + futurePairedLift) * 0.2 +
            combinedBasePressure * 0.8;
        } else if (card.effect === "persistent_scandal_adjustment") {
          const currentScandalAverage = targetBand
            ? parseDiceAverageSignedWithModifier(targetBand.scandal, currentScandalAdjustment.modifier, currentScandalAdjustment.diceModifier)
            : 0;
          const improvedScandalAverage = targetBand
            ? parseDiceAverageSignedWithModifier(
                targetBand.scandal,
                currentScandalAdjustment.modifier + (card.scandalModifier || 0),
                currentScandalAdjustment.diceModifier + (card.scandalDiceModifier || 0)
              )
            : 0;
          const scandalRelief = Math.max(0, currentScandalAverage - improvedScandalAverage);
          const currentSlotMultiplier = VENUE_SLOT_LOOKUP[target.slotKey]?.multiplier || 1;
          const activeScandalLoad = targetBand ? activeScandalCountForBand(target.managerId, venue?.type || "", targetBand) : 0;
          const ownTopVpPressure = manager.victoryPoints === topVictoryPoints && topVictoryPoints > 0 ? 1 : 0;
          const currentLineupLead =
            targetManager?.id === manager.id
              ? Math.max(0, (targetEstimate.popularity || 0) - secondPlaceScore)
              : 0;
          const visibleThreatScore =
            (isTargetLeading ? 1.2 : 0) +
            ((targetSlotRevenue || 0) >= 12 ? 1 : 0) +
            ((targetSlotScore || 0) >= 12 ? 1 : 0) +
            ((targetVisibleInvestment || 0) >= 3 ? 0.6 : 0) +
            ownTopVpPressure * 0.5 +
            ((venue?.venuePoints || 0) >= 8 ? 0.4 : 0);
          const deterrenceBonus =
            activeScandalLoad === 0 && venue && target.venueType !== "bench" && target.venueType !== "week_off"
              ? scandalRelief * (4 + visibleThreatScore * 4.2)
              : 0;
          const frontRunnerRevealPenalty =
            activeScandalLoad === 0 && currentLineupLead >= 6
              ? 8 + Math.max(0, currentLineupLead - 6) * 1.4
              : 0;
          const reserveProtectionPenalty =
            activeScandalLoad === 0 && futureOwnVenueSlices.length && futureOwnBestVenueWeight >= currentVenueWeight + 8
              ? 6 + Math.max(0, futureOwnBestVenueWeight - currentVenueWeight) * 0.35
              : 0;
          const futureReliefValue =
            scandalRelief *
            (futureRounds.length * 3.2 + Math.max(0, (targetBand?.retention || 0) - 6) * 0.18) *
            (1 + activeScandalLoad * 0.35);
          const currentReliefValue =
            scandalRelief *
            currentSlotMultiplier *
            (((venue?.revenueFactor || 0) * 5) + (venue?.venuePoints || 0) * 0.8) *
            (1 + activeScandalLoad * 0.2);
          score =
            venueWeight * 0.45 +
            ownEstimate.revenue * 0.7 +
            currentReliefValue * 1.8 +
            futureReliefValue +
            deterrenceBonus +
            Math.max(0, projectedBandValueAcrossPreview(targetBand, futureRounds)) * 0.04 -
            frontRunnerRevealPenalty -
            reserveProtectionPenalty;
        } else {
          const futureSmashValue = targetBand
            ? projectedBandValueAcrossRoundsWithPopularityDelta(targetBand, futureRounds, card.modifier || 0, card.popularityDice || 0) -
              projectedBandValueAcrossRoundsWithPopularityDelta(targetBand, futureRounds, 0, 0)
            : 0;
          const existingSmashValue = card.requiresSmashHit && targetBand
            ? activeActualSmashHitEntriesForBand(target.managerId, target.bandName)
                .reduce((sum, entry) => sum + (entry.modifier || 0) + (entry.popularityDice || 0) * 3.5, 0)
            : 0;
          const earlyWindowBonus = card.requiresSmashHit
            ? Math.max(0, 16 - venueIndex * 5)
            : 0;
          score =
            venueWeight +
            ownEstimate.revenue * 1.2 +
            catchup * 1.8 +
            (venue?.venuePoints || 0) * 4 +
            smashStrength * (((venue?.revenueFactor || 0) * 2.2) + 2) +
            futureSmashValue * 0.18 +
            existingSmashValue * 3.2 +
            earlyWindowBonus;
        }
      } else if (card.type === "defense") {
        if (card.effect === "cancel_demands") {
          const activeDemands = targetBand ? demandEntriesForBand(target.managerId, targetBand.name) : [];
          const strongestDemandPenalty = activeDemands.reduce((best, entry) => Math.max(best, entry.flatPenalty || 0), 0);
          const futureDemandRelief = targetBand
            ? projectedBandValueAcrossRoundsWithPopularityDelta(targetBand, futureRounds, strongestDemandPenalty, 0) -
              projectedBandValueAcrossRoundsWithPopularityDelta(targetBand, futureRounds, 0, 0)
            : 0;
          const currentBandValue = targetBand ? projectedBandValueAcrossPreview(targetBand, futureRounds) : 0;
          score =
            strongestDemandPenalty * 16 +
            activeDemands.length * 10 +
            futureDemandRelief * 0.2 +
            currentBandValue * 0.05;
        } else if (card.effect === "cancel_scandal") {
          const activeScandalLoad = targetBand ? activeScandalCountForBand(target.managerId, target.venueType || "roster", targetBand) : 0;
          const currentScandalAverage = targetBand
            ? parseDiceAverageSignedWithModifier(targetBand.scandal, currentScandalAdjustment.modifier, currentScandalAdjustment.diceModifier)
            : 0;
          const futureScandalRelief = targetBand
            ? projectedBandValueAcrossRoundsWithPopularityDelta(targetBand, futureRounds, Math.max(0, currentScandalAverage), 0) -
              projectedBandValueAcrossRoundsWithPopularityDelta(targetBand, futureRounds, 0, 0)
            : 0;
          const currentVenueRelief =
            targetBand && venue && target.venueType !== "roster"
              ? Math.max(0, currentScandalAverage) * ((venue.revenueFactor || 0) * 4 + (venue.venuePoints || 0) * 0.8)
              : 0;
          const currentBandValue = targetBand ? projectedBandValueAcrossPreview(targetBand, futureRounds) : 0;
          score =
            activeScandalLoad * 18 +
            Math.max(0, currentScandalAverage) * 11 +
            futureScandalRelief * 0.18 +
            currentVenueRelief +
            currentBandValue * 0.05;
        }
      } else if (card.type === "trend") {
        if (card.effect === "music_fever" || card.effect === "recession") {
          const projectedRoundRevenueFor = (candidate) => roundData.venues.reduce(
            (sum, venueEntry) => sum + Math.max(0, estimatedVenueStrength(candidate, venueEntry, roundData).revenue || 0),
            0
          );
          const ownProjectedRoundRevenue = projectedRoundRevenueFor(manager);
          const rivalProjectedRoundRevenues = state.managers
            .filter((candidate) => candidate.id !== manager.id)
            .map((candidate) => projectedRoundRevenueFor(candidate));
          const averageRivalRevenue = rivalProjectedRoundRevenues.length
            ? rivalProjectedRoundRevenues.reduce((sum, value) => sum + value, 0) / rivalProjectedRoundRevenues.length
            : 0;
          const topRivalRevenue = rivalProjectedRoundRevenues.length ? Math.max(...rivalProjectedRoundRevenues) : 0;
          const ownBookedActs = roundData.venues.reduce((sum, venueEntry) => sum + getBookedTargetsForVenue(manager, venueEntry.type).filter((target) => target.bandName).length, 0);
          const rivalBookedActs = state.managers
            .filter((candidate) => candidate.id !== manager.id)
            .reduce((sum, candidate) => sum + roundData.venues.reduce((venueSum, venueEntry) => venueSum + getBookedTargetsForVenue(candidate, venueEntry.type).filter((target) => target.bandName).length, 0), 0);
          const activeClimateEffect = state.globalRevenueClimate?.effect || "";
          const cancelingOpposite =
            (card.effect === "music_fever" && activeClimateEffect === "recession") ||
            (card.effect === "recession" && activeClimateEffect === "music_fever");
          const sameClimateWaste = activeClimateEffect === card.effect ? 40 : 0;

          if (card.effect === "music_fever") {
            const stackBonus = ownBookedActs >= 4 ? 24 : ownBookedActs >= 3 ? 14 : ownBookedActs >= 2 ? 6 : -8;
            const cashRaceBonus = Math.max(0, ownProjectedRoundRevenue - averageRivalRevenue) * 0.8;
            const premiumRoomBonus = roundData.venues.filter((venueEntry) => venueEntry.revenueFactor >= 2 && venueHasBooking(manager, venueEntry.type)).length * 8;
            const cancelBonus = cancelingOpposite ? Math.max(0, ownProjectedRoundRevenue - averageRivalRevenue) * 0.9 + 18 : 0;
            const rivalWindfallPenalty = Math.max(0, topRivalRevenue - ownProjectedRoundRevenue) * 0.28;
            score =
              18 +
              ownProjectedRoundRevenue * 0.68 +
              stackBonus +
              cashRaceBonus +
              premiumRoomBonus +
              cancelBonus -
              rivalWindfallPenalty -
              sameClimateWaste;
          } else {
            const catchupEconomyBonus = Math.max(0, averageRivalRevenue - ownProjectedRoundRevenue) * 0.9;
            const leaderClampBonus = Math.max(0, topRivalRevenue - ownProjectedRoundRevenue) * 0.65;
            const overextendedFieldBonus = Math.max(0, rivalBookedActs - ownBookedActs) * 2.8;
            const cancelBonus = cancelingOpposite ? Math.max(0, averageRivalRevenue - ownProjectedRoundRevenue) * 0.9 + 18 : 0;
            const selfPainPenalty = ownProjectedRoundRevenue * 0.45;
            score =
              12 +
              catchupEconomyBonus +
              leaderClampBonus +
              overextendedFieldBonus +
              cancelBonus -
              selfPainPenalty -
              sameClimateWaste;
          }
        } else if (card.effect === "charity_case") {
          const leader = targetManager;
          const surrenderedChoice = leader ? chooseCharityCaseBandForManager(leader, manager, roundData) : null;
          const surrenderedBand = surrenderedChoice && leader ? getBandByName(leader, surrenderedChoice.bandName) : null;
          const surrenderVenue = surrenderedChoice?.becomesSpecialGuest
            ? roundData.venues.find((entry) => entry.type === surrenderedChoice.venueType)
            : null;
          const currentVenueTransfer =
            Boolean(currentVenue && surrenderVenue && surrenderVenue.type === currentVenue.type);
          const ownSwing = surrenderVenue && surrenderedBand
            ? Math.max(0, buildEstimatedVenuePerformance(manager, surrenderVenue, surrenderedBand, SPECIAL_GUEST_SLOT)?.weightedRevenue || 0)
            : 0;
          const leaderLoss = surrenderVenue && surrenderedBand && leader
            ? Math.max(0, buildEstimatedVenuePerformance(leader, surrenderVenue, surrenderedBand, surrenderedChoice.slotKey)?.weightedRevenue || 0)
            : 0;
          const futureStealValue = surrenderedBand
            ? Math.max(0, projectedBandValueAcrossPreview(surrenderedBand, futureRounds)) * 0.1
            : 0;
          const otherVpScores = state.managers
            .filter((candidate) => candidate.id !== leader?.id)
            .map((candidate) => candidate.victoryPoints || 0);
          const secondVpScore = otherVpScores.length ? Math.max(...otherVpScores) : 0;
          const leaderMargin = Math.max(0, (leader?.victoryPoints || 0) - secondVpScore);
          const contestPressureNow =
            ownBandBooked && currentVenue
              ? Math.max(0, leaderScore - (ownEstimate.popularity || 0))
              : 0;
          const currentVenueSwing = currentVenueTransfer ? ownSwing + leaderLoss : 0;
          const weakImmediateImpactPenalty =
            ownBandBooked && currentVenue && !currentVenueTransfer
              ? 34 + Math.max(0, contestPressureNow) * 5 + (currentVenue.venuePoints || 0) * 3.5
              : 0;
          const tinyLeadEarlyPenalty =
            state.round <= 2 && !targetCanEndTourAtVenue && leaderMargin <= 2 && (leader?.victoryPoints || 0) <= 4
              ? 46 + (2 - leaderMargin) * 10
              : 0;
          const nonVenueBenchTheftPenalty =
            surrenderedChoice && !surrenderedChoice.becomesSpecialGuest
              ? 18 + Math.max(0, currentVenueWeight - 10) * 0.45
              : 0;
          const lowSwingPenalty =
            currentVenue && ownBandBooked && currentVenueSwing < 8
              ? 20 + Math.max(0, 8 - currentVenueSwing) * 3
              : 0;
          const denyLeaderBonus =
            targetIsVpLeader ? 18 : 0;
          score =
            20 +
            denyLeaderBonus +
            vpGap * 3.1 +
            targetNearWin * 2.8 +
            ownSwing * 1.4 +
            leaderLoss * 1.1 +
            futureStealValue +
            currentVenueSwing * 2.4 -
            weakImmediateImpactPenalty -
            tinyLeadEarlyPenalty -
            nonVenueBenchTheftPenalty -
            lowSwingPenalty;
        } else if (card.effect === "draw_cards") {
          const upcomingVenueCount = futureVenueSlices.length + (currentVenue ? 1 : 0);
          const playableCurrentTargets = manager.hand
            .filter((handCard) => handCard.id !== card.id)
            .reduce((sum, handCard) => sum + (getCardTargets(manager, handCard, roundData).length ? 1 : 0), 0);
          const deadCardCount = manager.hand
            .filter((handCard) => handCard.id !== card.id)
            .reduce((sum, handCard) => sum + (getCardTargets(manager, handCard, roundData).length ? 0 : 1), 0);
          const venueWindowsRemaining = ROUND_VENUE_ORDER.length - activeVenueCardIndex();
          const earlyRoundBonus =
            venueWindowsRemaining >= 3 ? 28 :
            venueWindowsRemaining === 2 ? 14 :
            venueWindowsRemaining === 1 ? -8 : -18;
          const handRefreshUrgency =
            venueWindowsRemaining >= 2
              ? playableCurrentTargets <= 1
                ? 14
                : playableCurrentTargets === 2
                  ? 6
                  : 0
              : 0;
          const shallowHandBonus = manager.hand.length <= 2 ? 22 : manager.hand.length <= 3 ? 12 : 0;
          const weakHandBonus = playableCurrentTargets <= 1 ? 20 : playableCurrentTargets === 2 ? 8 : 0;
          const deadCardBonus = deadCardCount * 7;
          const venueWindowBonus = upcomingVenueCount >= 2 ? 10 : upcomingVenueCount === 1 ? 4 : -12;
          const richHandPenalty = playableCurrentTargets >= 4 ? 18 : 0;
          score =
            earlyRoundBonus +
            handRefreshUrgency +
            shallowHandBonus +
            weakHandBonus +
            deadCardBonus +
            venueWindowBonus -
            richHandPenalty;
        } else if (card.effect === "mega_concert") {
          const rankedManagers = standingsOrderedManagers();
          const placementIndex = rankedManagers.findIndex((candidate) => candidate.id === manager.id);
          const latePlacementBonus = placementIndex >= 0 ? placementIndex * 8 : 0;
          const bestMegaPlacement = roundData.venues
            .filter((venueEntry) => unresolvedVenueTypes(roundData).includes(venueEntry.type))
            .reduce((best, venueEntry) => {
              if (!venueHasBooking(manager, venueEntry.type) || getAssignedBandName(manager, venueEntry.type, SPECIAL_GUEST_SLOT)) {
                return best;
              }
              const topBand = state.bandDeck[0] ? cloneBand(state.bandDeck[0]) : null;
              if (!topBand) {
                return best;
              }
              const projectedValue = projectedSlotRevenue(topBand, venueEntry, SPECIAL_GUEST_SLOT);
              const fit = genreFitScore(topBand, venueEntry);
              const ownScore = estimatedVenueStrength(manager, venueEntry, roundData).popularity || 0;
              const venueLeader = Math.max(...state.managers.map((candidate) => estimatedVenueStrength(candidate, venueEntry, roundData).popularity || 0));
              const closeness = Math.max(0, 8 - Math.abs(venueLeader - ownScore));
              return Math.max(best, projectedValue * 1.3 + fit * 4.5 + closeness * 2 + venueEntry.revenueFactor * 6 + venueEntry.venuePoints * 2);
            }, 0);
          score = 22 + bestMegaPlacement + latePlacementBonus;
        } else if (card.effect === "televised_concert") {
          const ownLineupCount = venue ? getBookedTargetsForVenue(manager, venue.type).filter((target) => target.bandName).length : 0;
          const opponentLineupCounts = venue
            ? state.managers
                .filter((candidate) => candidate.id !== manager.id)
                .map((candidate) => getBookedTargetsForVenue(candidate, venue.type).filter((target) => target.bandName).length)
            : [];
          const opponentsWithSingleAct = opponentLineupCounts.filter((count) => count === 1).length;
          const opponentsWithDoubleActs = opponentLineupCounts.filter((count) => count >= 2).length;
          const ownRevenueShare = Math.max(0, ownEstimate.revenue || 0);
          const topOtherRevenue = venue
            ? Math.max(
                0,
                ...state.managers
                  .filter((candidate) => candidate.id !== manager.id)
                  .map((candidate) => estimatedVenueStrength(candidate, venue, roundData).revenue || 0)
              )
            : 0;
          const winningRoomBonus =
            ownBandBooked && (canStealVenue || (ownEstimate.popularity || 0) >= leaderScore - 2)
              ? 18
              : 0;
          const stackBonus = ownLineupCount >= 2 ? 24 + ownRevenueShare * 0.55 : ownLineupCount === 1 ? 6 : -18;
          const secondaryVenueBonus =
            ownLineupCount >= 2 && opponentsWithSingleAct >= 2
              ? 12 + opponentsWithSingleAct * 4 - opponentsWithDoubleActs * 3
              : 0;
          const rivalJackpotPenalty =
            topOtherRevenue > ownRevenueShare + 10
              ? 16 + Math.max(0, topOtherRevenue - ownRevenueShare - 10) * 0.6
              : 0;
          score =
            10 +
            venueWeight * 0.45 +
            ownRevenueShare * 1.1 +
            winningRoomBonus +
            stackBonus +
            secondaryVenueBonus -
            rivalJackpotPenalty;
        } else if (card.effect === "refund_booking_fee") {
          const bookedActs = venue ? getBookedTargetsForVenue(manager, venue.type).filter((target) => target.bandName).length : 0;
          const feeValue = venue?.cost || 0;
          const currentRevenue = Math.max(0, ownEstimate.revenue || 0);
          const premiumVenueBonus =
            (venue?.revenueFactor || 0) >= 3 ? 10 :
            (venue?.revenueFactor || 0) >= 2 ? 5 : 0;
          score =
            feeValue * 4.8 +
            currentRevenue * 0.35 +
            bookedActs * 4 +
            premiumVenueBonus;
        } else if (card.effect === "tax_time") {
          const currentContractLoad = contractLoad(manager);
          const richestContractLoad = Math.max(...state.managers.map((candidate) => contractLoad(candidate)));
          const fieldContractPressure = state.managers
            .filter((candidate) => candidate.id !== manager.id)
            .reduce((sum, candidate) => sum + contractLoad(candidate), 0);
          const selfPressure = Math.max(0, currentContractLoad - 18);
          const antiHoardingBonus = Math.max(0, richestContractLoad - currentContractLoad) * 1.8;
          const fieldBonus = Math.max(0, fieldContractPressure - currentContractLoad) * 0.35;
          score =
            26 +
            antiHoardingBonus +
            fieldBonus -
            selfPressure * 1.4;
        } else if (card.effect === "benefit_concert") {
          const selfTarget = target.managerId === manager.id;
          const targetBandValue = Math.max(0, targetSlotScore || targetEstimate.popularity || 0);
          const targetBandRevenue = Math.max(0, targetSlotRevenue || targetEstimate.revenue || 0);
          const venueRevenuePressure = Math.max(1, venue?.revenueFactor || 1);
          const currentGap = ownBandBooked ? (leaderScore - (ownEstimate.popularity || 0)) : 0;
          const ownVenueRevenue = ownEstimate.revenue || 0;
          const ownVenueWouldNotPayAnywayBonus =
            selfTarget && ownBandBooked && ownVenueRevenue <= 0
              ? 28 + Math.max(0, venue?.venuePoints || 0) * 2.4 + Math.max(0, 8 - currentGap) * 1.8
              : 0;
          const decentRoomBonus =
            selfTarget && ownBandBooked && (venue?.venuePoints || 0) >= 4
              ? 8 + Math.max(0, (venue?.revenueFactor || 0) - 1) * 3
              : 0;
          const selfContestBonus =
            selfTarget && ownBandBooked && currentGap >= 0
              ? 26 + Math.max(0, 6 - currentGap) * 3
              : 0;
          const selfCashSacrificePenalty =
            selfTarget
              ? targetBandRevenue * (ownVenueRevenue <= 0 ? 0.45 : 1.25) + (ownVenueRevenue <= 0 ? 0 : venueRevenuePressure * 4)
              : 0;
          const denyRevenueBonus =
            !selfTarget && targetBandRevenue > 0
              ? targetBandRevenue * 1.15 + venueRevenuePressure * 5
              : 0;
          const dangerousGiftPenalty =
            !selfTarget
              ? targetBandValue * 1.35 + Math.max(0, targetEstimate.popularity - (ownEstimate.popularity || 0)) * 0.9
              : 0;
          score =
            12 +
            (card.modifier || 10) * (selfTarget ? 2.8 : 0.4) +
            ownVenueWouldNotPayAnywayBonus +
            decentRoomBonus +
            selfContestBonus +
            denyRevenueBonus -
            selfCashSacrificePenalty -
            dangerousGiftPenalty;
        } else if (card.effect === "steal_cards") {
          const venueWindowsRemaining = ROUND_VENUE_ORDER.length - activeVenueCardIndex();
          const opponents = state.managers.filter((candidate) => candidate.id !== manager.id);
          const stealableOpponents = opponents.filter((candidate) => candidate.hand.length > 0).length;
          const totalOpponentCards = opponents.reduce((sum, candidate) => sum + candidate.hand.length, 0);
          const averageOpponentCards = opponents.length ? totalOpponentCards / opponents.length : 0;
          const earlyRoundBonus =
            venueWindowsRemaining >= 3 ? 34 :
            venueWindowsRemaining === 2 ? 18 :
            venueWindowsRemaining === 1 ? -6 : -16;
          const densityBonus = totalOpponentCards * 2.8 + stealableOpponents * 10;
          const handSwingBonus = Math.max(0, stealableOpponents - 1) * 8;
          const dryTablePenalty = stealableOpponents === 0 ? 120 : averageOpponentCards < 1 ? 18 : 0;
          score =
            earlyRoundBonus +
            densityBonus +
            handSwingBonus -
            dryTablePenalty;
        } else if (card.effect === "cash_attack") {
          const targetCash = targetManager?.cash || 0;
          const cashHit = Math.min(30, Math.floor(targetCash / 2));
          const topOtherVp = Math.max(...state.managers.filter((candidate) => candidate.id !== manager.id).map((candidate) => candidate.victoryPoints));
          const closeToLeader = topVictoryPoints - (targetManager?.victoryPoints || 0) <= 6;
          const leaderBonus =
            targetManager && targetManager.victoryPoints === topVictoryPoints
              ? 26
              : targetManager && closeToLeader && targetManager.victoryPoints === topOtherVp
                ? 12
                : 0;
          const richThreatBonus =
            targetCash >= 120 ? 24 :
            targetCash >= 90 ? 18 :
            targetCash >= 60 ? 10 : 0;
          const brokeLeaderPenalty =
            targetManager && targetManager.victoryPoints === topVictoryPoints && targetCash < 25
              ? 26
              : targetCash < 15
                ? 16
                : 0;
          const lowImpactPenalty = cashHit <= 5 ? 20 : 0;
          score =
            cashHit * 2.6 +
            leaderBonus +
            richThreatBonus -
            brokeLeaderPenalty -
            lowImpactPenalty;
        } else if (card.effect === "biography") {
          const futureBandValue = targetBand ? projectedBandValueAcrossPreview(targetBand, futureRounds) : 0;
          const currentScandalAverage = targetBand
            ? parseDiceAverageSignedWithModifier(targetBand.scandal, currentScandalAdjustment.modifier, currentScandalAdjustment.diceModifier)
            : 0;
          const currentExposure =
            Math.max(0, targetSlotRevenue || targetEstimate.revenue || 0) * 1.9 +
            Math.max(0, targetSlotScore || targetEstimate.popularity || 0) * 0.95 +
            futureBandValue * 0.12 +
            Math.max(0, targetBand?.retention || 0) * 0.9;
          score =
            62 -
            currentExposure +
            Math.max(0, currentScandalAverage) * 3.5 +
            (target.slotKey === OPENER_SLOT ? 5 : 0);
        } else if (card.effect === "feud") {
          const pairedPerformance =
            venue && pairedTargetManager && pairedTargetBand
              ? buildEstimatedVenuePerformance(pairedTargetManager, venue, pairedTargetBand, target.pairedSlotKey)
              : null;
          const primaryOwn = target.managerId === manager.id;
          const pairedOwn = target.pairedManagerId === manager.id;
          const primaryThreat = primaryOwn
            ? -(
                Math.max(0, targetSlotRevenue || targetEstimate.revenue || 0) * 1.3 +
                Math.max(0, targetSlotScore || targetEstimate.popularity || 0) * 0.55
              )
            : (
                Math.max(0, targetSlotRevenue || targetEstimate.revenue || 0) * 1.2 +
                Math.max(0, targetSlotScore || targetEstimate.popularity || 0) * 0.5
              );
          const pairedThreat = pairedOwn
            ? -(
                Math.max(0, pairedPerformance?.weightedRevenue || pairedTargetEstimate.revenue || 0) * 1.3 +
                Math.max(0, pairedPerformance?.weightedScore || pairedTargetEstimate.popularity || 0) * 0.55
              )
            : (
                Math.max(0, pairedPerformance?.weightedRevenue || pairedTargetEstimate.revenue || 0) * 1.2 +
                Math.max(0, pairedPerformance?.weightedScore || pairedTargetEstimate.popularity || 0) * 0.5
              );
          const doubleRivalBonus = !primaryOwn && !pairedOwn ? 18 : 0;
          const stealSwingBonus =
            ownBandBooked && (!primaryOwn || !pairedOwn) && (canStealVenue || catchup > 0)
              ? 14 + Math.max(0, leaderScore - (ownEstimate.popularity || 0)) * 0.9
              : 0;
          const selfHitPenalty = (primaryOwn ? 14 : 0) + (pairedOwn ? 14 : 0);
          score =
            12 +
            primaryThreat +
            pairedThreat +
            doubleRivalBonus +
            stealSwingBonus -
            selfHitPenalty;
        } else if (card.effect === "dance_off") {
          const pairedPerformance =
            venue && pairedTargetManager && pairedTargetBand
              ? buildEstimatedVenuePerformance(pairedTargetManager, venue, pairedTargetBand, target.pairedSlotKey)
              : null;
          const ownPerformance =
            venue && targetBand
              ? buildEstimatedVenuePerformance(manager, venue, targetBand, target.slotKey)
              : null;
          const rivalRevenue = Math.max(0, pairedPerformance?.weightedRevenue || pairedTargetEstimate.revenue || 0);
          const ownRevenue = Math.max(0, ownPerformance?.weightedRevenue || targetSlotRevenue || ownEstimate.revenue || 0);
          const rivalScore = Math.max(0, pairedPerformance?.weightedScore || pairedTargetEstimate.popularity || 0);
          const ownScore = Math.max(0, ownPerformance?.weightedScore || targetSlotScore || ownEstimate.popularity || 0);
          const winChanceEdge = ownRevenue - rivalRevenue;
          const safeIfTheyHitFive = ownScore - (rivalScore + 5);
          const venueFlipRiskPenalty =
            safeIfTheyHitFive < 0
              ? 28 + Math.abs(safeIfTheyHitFive) * 4.2
              : safeIfTheyHitFive <= 2
                ? 14 - safeIfTheyHitFive * 3
                : 0;
          const safeTargetBonus =
            safeIfTheyHitFive >= 5
              ? 18 + Math.min(10, safeIfTheyHitFive - 4) * 1.4
              : safeIfTheyHitFive >= 2
                ? 8
                : 0;
          const farBehindVenueBonus =
            leaderScore - rivalScore >= 6
              ? 10 + Math.min(8, leaderScore - rivalScore - 5) * 0.8
              : 0;
          const contestBonus =
            ownBandBooked && (canStealVenue || catchup > 0 || targetGapFromLeader <= 3)
              ? 16 + Math.max(0, rivalRevenue - ownRevenue + 2) * 0.9
              : 0;
          const targetLeaderBonus =
            pairedTargetManager?.victoryPoints === topVictoryPoints
              ? 10
              : pairedTargetManager && topVictoryPoints - pairedTargetManager.victoryPoints <= 6
                ? 5
                : 0;
          score =
            14 +
            venueWeight * 0.35 +
            contestBonus +
            targetLeaderBonus +
            Math.max(0, rivalRevenue) * 0.7 +
            safeTargetBonus +
            farBehindVenueBonus -
            Math.max(0, winChanceEdge) * 0.45 -
            venueFlipRiskPenalty;
        } else if (card.effect === "contract_negotiations") {
          const demandCost = (targetBand?.retention || 0) * 2;
          const targetCash = targetManager?.cash || 0;
          const canForceMiss = targetCash < demandCost;
          const currentVenueContestBonus =
            ownBandBooked && targetManager?.id !== manager.id && (canStealVenue || targetGapFromLeader <= 3)
              ? 18 + Math.max(0, targetSlotRevenue || targetEstimate.revenue || 0) * 0.8
              : 0;
          const forcesMissBonus = canForceMiss
            ? 34 +
              Math.max(0, targetSlotRevenue || targetEstimate.revenue || 0) * 1.3 +
              currentVenueContestBonus
            : 0;
          const cashDrainBonus = targetCash >= demandCost ? Math.min(30, demandCost) * 1.9 : 0;
          const leaderBonus =
            !canForceMiss && targetManager?.victoryPoints === topVictoryPoints
              ? 20
              : !canForceMiss && targetManager && topVictoryPoints - targetManager.victoryPoints <= 6
                ? 10
                : 0;
          const midgameForcedMissBonus =
            canForceMiss && state.round <= 4 && !targetCanWinTourHere
              ? 18 + Math.max(0, (venue?.venuePoints || 0) - 2) * 1.5
              : 0;
          const richAltTargetPenalty =
            !canForceMiss &&
            state.managers.some((candidate) =>
              candidate.id !== manager.id &&
              candidate.id !== targetManager?.id &&
              candidate.cash >= Math.max(30, targetCash + 15) &&
              candidate.victoryPoints >= (targetManager?.victoryPoints || 0) - 4
            )
              ? 12
              : 0;
          const brokePenalty = targetCash < 10 ? 18 : 0;
          score =
            forcesMissBonus +
            cashDrainBonus +
            leaderBonus +
            midgameForcedMissBonus +
            Math.max(0, demandCost - 10) * 0.6 -
            brokePenalty -
            richAltTargetPenalty;
        } else if (card.effect === "technical_difficulties") {
          const halvedRollLoss = Math.max(0, (targetSlotPerformance?.baseRoll || 0) / 2);
          const weightedRollLoss = weightedVenueContribution(halvedRollLoss, target.slotKey || HEADLINER_SLOT);
          const venueRevenuePressure = Math.max(1, venue?.revenueFactor || 1);
          const currentVenueContestBonus =
            ownBandBooked && targetManager?.id !== manager.id && (canStealVenue || targetGapFromLeader <= 3)
              ? 20 + Math.max(0, targetSlotRevenue || targetEstimate.revenue || 0) * 0.85
              : 0;
          const powerhouseBonus =
            Math.max(0, targetSlotScore - 8) * 2.1 +
            Math.max(0, targetSlotRevenue - 10) * 1.2 +
            (target.slotKey === HEADLINER_SLOT ? 12 : 4);
          const premiumVenueBonus =
            venueRevenuePressure >= 3 ? 18 :
            venueRevenuePressure >= 2 ? 10 : 0;
          const leaderBonus =
            targetManager?.victoryPoints === topVictoryPoints
              ? 16
              : targetManager && topVictoryPoints - targetManager.victoryPoints <= 6
                ? 7
                : 0;
          score =
            24 +
            weightedRollLoss * (4.4 + venueRevenuePressure * 0.7) +
            currentVenueContestBonus +
            powerhouseBonus +
            premiumVenueBonus +
            leaderBonus;
        } else if (card.effect === "parking_lot_concert") {
          const halvedShowLoss = Math.max(0, (targetSlotPerformance?.rawFinalPopularity || targetSlotPerformance?.finalPopularity || 0) / 2);
          const weightedShowLoss = weightedVenueContribution(halvedShowLoss, target.slotKey || HEADLINER_SLOT);
          const venueRevenuePressure = Math.max(1, venue?.revenueFactor || 1);
          const currentVenueContestBonus =
            ownBandBooked && targetManager?.id !== manager.id && (canStealVenue || targetGapFromLeader <= 3)
              ? 24 + Math.max(0, targetSlotRevenue || targetEstimate.revenue || 0) * 0.95
              : 0;
          const powerhouseBonus =
            Math.max(0, targetSlotScore - 8) * 2.8 +
            Math.max(0, targetSlotRevenue - 10) * 1.6 +
            (target.slotKey === HEADLINER_SLOT ? 14 : 5);
          const premiumVenueBonus =
            venueRevenuePressure >= 4 ? 22 :
            venueRevenuePressure >= 3 ? 16 :
            venueRevenuePressure >= 2 ? 10 : 0;
          const leaderBonus =
            targetManager?.victoryPoints === topVictoryPoints
              ? 18
              : targetManager && topVictoryPoints - targetManager.victoryPoints <= 6
                ? 8
                : 0;
          score =
            30 +
            weightedShowLoss * (5 + venueRevenuePressure * 0.9) +
            currentVenueContestBonus +
            powerhouseBonus +
            premiumVenueBonus +
            leaderBonus;
        } else if (card.effect === "miss_this_week") {
          const currentVenueContestBonus =
            ownBandBooked && targetManager?.id !== manager.id && (canStealVenue || targetGapFromLeader <= 3)
              ? 22 + Math.max(0, targetSlotRevenue || targetEstimate.revenue || 0) * 0.9
              : 0;
          const leaderBonus =
            targetManager?.victoryPoints === topVictoryPoints
              ? 18
              : targetManager && topVictoryPoints - targetManager.victoryPoints <= 6
                ? 8
                : 0;
          const slotPriorityBonus = target.slotKey === HEADLINER_SLOT ? 12 : 0;
          score =
            28 +
            Math.max(0, targetSlotRevenue || targetEstimate.revenue || 0) * 1.7 +
            currentVenueContestBonus +
            leaderBonus +
            slotPriorityBonus;
        } else if (card.effect === "argument_duo") {
          const pairedPerformance =
            venue && targetManager && pairedTargetBand
              ? buildEstimatedVenuePerformance(targetManager, venue, pairedTargetBand, target.pairedSlotKey)
              : null;
          const combinedRevenue =
            Math.max(0, targetSlotRevenue || targetEstimate.revenue || 0) +
            Math.max(0, pairedPerformance?.weightedRevenue || 0);
          const combinedThreat =
            Math.max(0, targetSlotScore || 0) +
            Math.max(0, pairedPerformance?.weightedScore || 0);
          const stackedVenueContestBonus =
            ownBandBooked && targetManager?.id !== manager.id && (canStealVenue || targetGapFromLeader <= 3)
              ? 16 + combinedRevenue * 0.5
              : 0;
          score =
            18 +
            combinedRevenue * 1.1 +
            combinedThreat * 0.65 +
            stackedVenueContestBonus +
            (targetManager?.victoryPoints === topVictoryPoints ? 10 : 0);
        } else if (card.effect === "signing_bonus") {
          const nextRound = futureRounds[0] || null;
          const nextRoundBookingFee = nextRound ? bookingFeeForManager(manager, nextRound.venues) : 0;
          const cashNeed = Math.max(0, contractLoad(manager) + nextRoundBookingFee - manager.cash);
          const underPressureBonus =
            manager.cash < 35 ? 26 :
            manager.cash < 55 ? 18 :
            manager.cash < 75 ? 10 : 0;
          const coverageUnlockBonus =
            nextRound && manager.cash < nextRoundBookingFee && manager.cash + (card.cashBonus || 50) >= nextRoundBookingFee
              ? 22 + nextRoundBookingFee * 0.4
              : 0;
          const retentionReliefBonus = Math.min(24, cashNeed * 0.45);
          const richTablePenalty = state.managers.filter((candidate) => candidate.cash >= 120).length * 5;
          const leadingCashPenalty =
            manager.cash === Math.max(...state.managers.map((candidate) => candidate.cash))
              ? 12
              : 0;
          score =
            underPressureBonus +
            coverageUnlockBonus +
            retentionReliefBonus -
            richTablePenalty -
            leadingCashPenalty;
        } else if (card.effect === "communism") {
          const allCash = state.managers.map((candidate) => candidate.cash);
          const totalCash = allCash.reduce((sum, value) => sum + value, 0);
          const richestCash = Math.max(...allCash);
          const averageCash = allCash.reduce((sum, value) => sum + value, 0) / Math.max(1, allCash.length);
          const cashDeficit = Math.max(0, averageCash - manager.cash);
          const cashSurplus = Math.max(0, manager.cash - averageCash);
          const richOpponents = state.managers.filter((candidate) => candidate.id !== manager.id && candidate.cash > manager.cash + 20).length;
          const swissShield = Boolean(findSwissBankAccount(manager));
          const opponentsCash = Math.max(0, totalCash - manager.cash);
          const expectedPostCommunismCash = swissShield
            ? manager.cash + (opponentsCash / Math.max(1, state.managers.length))
            : averageCash;
          const selfLoss = Math.max(0, manager.cash - expectedPostCommunismCash);
          const selfGain = Math.max(0, expectedPostCommunismCash - manager.cash);
          const topCashLeader = state.managers.reduce(
            (best, candidate) => candidate.cash > best.cash ? candidate : best,
            state.managers[0]
          );
          const antiLeaderEmergencyBonus =
            topCashLeader &&
            topCashLeader.id !== manager.id &&
            topCashLeader.victoryPoints >= VICTORY_TARGET - 12 &&
            topCashLeader.cash >= manager.cash + 30
              ? 34 + Math.max(0, topCashLeader.cash - expectedPostCommunismCash) * 0.3
              : 0;
          const boardInvestmentValue =
            contractLoad(manager) * 0.4 +
            (
              advertisingForecastForRound(roundData, manager.id)
              .find((entry) => entry.manager.id === manager.id)
              ?.estimates?.[currentVenue?.type || ""]?.advertisingBonus || 0
            );
          const overspendResetBonus =
            manager.cash < averageCash && boardInvestmentValue > 18
              ? 18 + boardInvestmentValue * 0.35
              : boardInvestmentValue * 0.12;
          const swissComboBonus =
            swissShield
              ? 22 + Math.max(0, richestCash - averageCash) * 0.45 + Math.max(0, manager.cash - averageCash) * 0.7
              : 0;
          const flatTablePenalty =
            richOpponents === 0 && Math.abs(manager.cash - averageCash) <= 8
              ? 26
              : 0;
          const selfLossPenalty =
            selfLoss > 0
              ? selfLoss * (swissShield ? 0.55 : 3.2) + (selfLoss >= 10 ? 18 : 0)
              : 0;
          score =
            cashDeficit * 2.4 +
            richOpponents * 12 +
            selfGain * 1.3 +
            overspendResetBonus +
            antiLeaderEmergencyBonus +
            swissComboBonus -
            cashSurplus * (swissShield ? 0.45 : 1.85) -
            selfLossPenalty -
            flatTablePenalty;
        } else if (card.effect === "special_guest_draw") {
          const drawnBand = state.bandDeck[0] || null;
          const guestValue = drawnBand && venue
            ? Math.max(0, projectedSlotRevenue(drawnBand, venue, SPECIAL_GUEST_SLOT))
            : 0;
          const venueGap = Math.abs((ownEstimate.popularity || 0) - leaderScore);
          const closeRaceBonus =
            ownBandBooked && venueGap <= 6
              ? 22 + Math.max(0, 6 - venueGap) * 2.6
              : 0;
          const premiumVenueBonus =
            (venue?.revenueFactor || 0) >= 3 ? 22 :
            (venue?.revenueFactor || 0) >= 2 ? 12 : 0;
          const vpPressureBonus = Math.max(0, venue?.venuePoints || 0) * 2.2;
          const greatFitBonus = drawnBand && venue
            ? Math.max(0, genreFitScore(drawnBand, venue)) * 3.8
            : 0;
          const scaryScandalPenalty = drawnBand
            ? Math.max(0, parseDiceAverageSigned(drawnBand.scandal) - 2) * 2.4
            : 0;
          const alreadyPassedBonus =
            state.cardPassedManagers.filter((id) => id !== manager.id).length >= Math.max(1, state.cardTurnOrder.length - 2)
              ? 10
              : 0;
          score =
            18 +
            guestValue * 1.8 +
            closeRaceBonus +
            premiumVenueBonus +
            vpPressureBonus +
            greatFitBonus +
            alreadyPassedBonus -
            scaryScandalPenalty;
        } else {
        const trendBoost = state.managers.reduce((sum, candidate) => {
          return sum + roundData.venues.reduce((venueSum, venueEntry) => {
            const bookedBands = getAssignedBandEntries(candidate, venueEntry.type)
              .map((entry) => getBandByName(candidate, entry.bandName))
              .filter(Boolean);
            if (!bookedBands.length) {
              return venueSum;
            }
            const matchCount = bookedBands.filter((bookedBand) =>
              genreParts(bookedBand.genre).some((genre) => (card.trendGenres || []).includes(genre))
            ).length;
            if (!matchCount) {
              return venueSum;
            }
            const venueValue = venueStrategicWeight(venueEntry);
            return venueSum + matchCount * (candidate.id === manager.id ? venueValue + 12 : -(venueValue + 8));
          }, 0);
        }, 0);
        const ownCurrentMatches = roundData.venues.reduce((count, venueEntry) => {
          const matchCount = getAssignedBandEntries(manager, venueEntry.type).reduce((venueMatchCount, entry) => {
            const bookedBand = getBandByName(manager, entry.bandName);
            if (!bookedBand) {
              return venueMatchCount;
            }
            return venueMatchCount + (genreParts(bookedBand.genre).some((genre) => (card.trendGenres || []).includes(genre)) ? 1 : 0);
          }, 0);
          return count + matchCount;
        }, 0);
        const opponentCurrentMatches = state.managers
          .filter((candidate) => candidate.id !== manager.id)
          .reduce((count, candidate) => count + roundData.venues.reduce((venueCount, venueEntry) => {
            const matchCount = getAssignedBandEntries(candidate, venueEntry.type).reduce((venueMatchCount, entry) => {
              const bookedBand = getBandByName(candidate, entry.bandName);
              if (!bookedBand) {
                return venueMatchCount;
              }
              return venueMatchCount + (genreParts(bookedBand.genre).some((genre) => (card.trendGenres || []).includes(genre)) ? 1 : 0);
            }, 0);
            return venueCount + matchCount;
          }, 0), 0);
        const futureOwnPotential = manager.roster
          .filter((band) => genreParts(band.genre).some((genre) => (card.trendGenres || []).includes(genre)))
          .reduce((sum, band) => sum + projectedBandValueAcrossPreview(band, futureRounds), 0);
        const futureContestPotential = manager.roster
          .filter((band) => genreParts(band.genre).some((genre) => (card.trendGenres || []).includes(genre)))
          .reduce((sum, band) => sum + futureRounds.reduce((roundSum, round) => {
            const bigVenue = [...round.venues].sort((a, b) => (b.venuePoints * b.revenueFactor) - (a.venuePoints * a.revenueFactor))[0];
            if (!bigVenue) {
              return roundSum;
            }
            const fit = genreFitScore(band, bigVenue);
            return roundSum + Math.max(0, parseDiceAverage(band.popularity) + fit);
          }, 0), 0);
        const holdValue =
          ownCurrentMatches === 0
            ? futureOwnPotential * 0.28 + futureContestPotential * 0.45 + (card.trendGenres || []).length * 4
            : futureOwnPotential * 0.08;
        const selfHarmPenalty =
          ownCurrentMatches === 0 && opponentCurrentMatches > 0
            ? 24 + opponentCurrentMatches * 12
            : ownCurrentMatches === 0 && opponentCurrentMatches === 0
              ? 18
              : 0;
        score = trendBoost + ownCurrentMatches * 14 - opponentCurrentMatches * 6 - holdValue - selfHarmPenalty;
        if (ownCurrentMatches === 0) {
          score -= 100;
        }
        }
      } else if (card.type === "bad_song" && card.targetSelf) {
        const targetBandFutureValue = targetBand
          ? projectedBandValueAcrossPreview(targetBand, state.schedule.slice(state.round, state.round + 4))
          : 0;
        const likelyCutSoon = targetBand ? Math.max(0, targetBand.retention - 10) * 1.2 : 0;
        const weakThisWeek = Math.max(0, 6 - targetEstimate.revenue) * 3;
        const noChanceThisWeek =
          !isTargetLeading && (targetEstimate.popularity || 0) <= Math.max(0, leaderScore - 6) ? 10 : 0;
        score =
          weakThisWeek +
          noChanceThisWeek +
          likelyCutSoon -
          targetEstimate.revenue * 2.2 -
          venueWeight * 1.25 -
          targetBandFutureValue * 0.55 -
          Math.max(0, targetVictoryPoints - manager.victoryPoints) * 2;
      } else if (card.type === "bad_song" || card.type === "scandal" || card.type === "rumor") {
        if (card.effect === "venue_snowstorm") {
          const ownBookedHere = venueHasBooking(manager, target.venueType);
          const ownLineupLoss = ownBookedHere && !ownSnowTiresActiveAtVenue ? Math.max(0, ownEstimate.revenue || 0) + (venue?.venuePoints || 0) * 3 : 0;
          const rivalVenueImpact = competition?.standings
            ?.filter((entry) => entry.managerId !== manager.id && entry.bandName)
            ?.reduce((sum, entry) => sum + Math.max(0, entry.revenue || 0) * 1.2 + Math.max(0, entry.popularity || 0) * 1.1, 0) || 0;
          const rivalBookedCount = competition?.standings?.filter((entry) => entry.managerId !== manager.id && entry.bandName).length || 0;
          const stealByWeatherBonus =
            ownSnowTiresActiveAtVenue
              ? 55 + (venue?.venuePoints || 0) * 9 + Math.max(0, ownEstimate.revenue || 0) * 2
              : 0;
          const defensiveCancelBonus =
            !ownBookedHere
              ? 18 + (venue?.venuePoints || 0) * 4
              : 0;
          score =
            venueWeight * 0.7 +
            rivalVenueImpact +
            rivalBookedCount * 14 +
            stealByWeatherBonus +
            defensiveCancelBonus -
            ownLineupLoss -
            (futureOwnVenueSlices.length ? Math.max(0, futureOwnBestVenueWeight - currentVenueWeight) * 0.15 : 0);
        } else {
        const scandalValue = card.type === "bad_song"
          ? badSongStrength * (carryoverSabotage ? 4.8 : 3.6)
          : scandalSwing * 6;
        const directContestBonus =
          ownBandBooked && (canStealVenue || targetGapFromLeader <= 3)
            ? 16
            : ownBandBooked
              ? 4
              : 0;
        const offBoardFutureCommitmentPenalty =
          !ownBandBooked && futureOwnVenueSlices.length
            ? 10 +
              Math.max(0, futureOwnBestVenueWeight - currentVenueWeight) * (carryoverSabotage ? 0.24 : 0.75) +
              Math.max(0, futureOwnVenueWeight - currentVenueWeight) * (carryoverSabotage ? 0.05 : 0.12) +
              higherValueOwnFutureVenueCount * (carryoverSabotage ? 2 : 7) +
              muchBetterOwnFutureVenueCount * (carryoverSabotage ? 3 : 11)
            : 0;
        const preserveForLeaderPenalty =
          oneShotSabotage && leaderIsPresentLater && !targetCanEndTourAtVenue
            ? (leaderContestOpportunityLater ? 120 : 75) +
              futureLeaderBookedVenues.length * 16 +
              futureLeaderContestVenues.length * 26
            : 0;
        const wrongLeaderPenalty =
          targetManager &&
          nearWinLeaders.length &&
          !targetCanEndTourAtVenue &&
          !nearWinLeaders.some((leader) => leader.id === targetManager.id)
            ? 90 + futureLeaderBookedVenues.length * 10
            : 0;
        const offVenueSabotagePenalty =
          !ownBandBooked && !shouldStopSpecificTargetNow && !targetIsVpLeader && !targetCanEndTourAtVenue && targetNearWin <= 0
            ? 28 + (venue?.venuePoints || 0) * 1.5
            : !ownBandBooked
              ? 10
              : 0;
        const wrongImmediateThreatPenalty =
          someoneElseCanWinTourHere && !shouldStopSpecificTargetNow
            ? 140 + (venue?.venuePoints || 0) * 10
            : 0;
        const offBoardNoEmergencyPenalty =
          !ownBandBooked && !someoneElseCanWinTourHere
            ? 85 + (venue?.venuePoints || 0) * 4
            : 0;
        const offBoardSoftHarassPenalty =
          !ownBandBooked && !canStealVenue
            ? Math.max(0, targetSlotRevenue - (carryoverSabotage ? 0 : 2)) * (carryoverSabotage ? 0.75 : 1.8) +
              Math.max(0, targetGapFromLeader - (carryoverSabotage ? 6 : 3)) * (carryoverSabotage ? 1 : 4)
            : 0;
        const futureHarassmentValue =
          carryoverSabotage
            ? futureTargetValue * 0.14 + (targetIsVpLeader ? 10 : 0) + targetNearWin * 0.8
            : 0;
        const showdownHoldPenalty =
          oneShotSabotage && futureOwnVenueSlices.length
            ? Math.max(0, futureOwnBestVenueWeight - currentVenueWeight) * 0.7 +
              Math.max(0, futureOwnVenueWeight - currentVenueWeight) * 0.1 +
              higherValueOwnFutureVenueCount * 5 +
              muchBetterOwnFutureVenueCount * 9
            : 0;
        const dogpilePenalty =
          targetManager && targetManager.id !== manager.id
            ? Math.max(0, targetGapFromLeader - (carryoverSabotage ? 5 : 2)) * (carryoverSabotage ? 3 : 7) +
              Math.max(0, sabotageCardsAlreadyOnTarget - (carryoverSabotage ? 1 : 0)) * (carryoverSabotage ? 9 : 18) +
              (targetAlreadyNeutralized ? (carryoverSabotage ? 14 : 38) : 0) +
              (targetSlotRevenue <= 0 ? (carryoverSabotage ? 6 : 18) : 0)
            : 0;
        const futureVenueOverkillPenalty =
          futureVenueSlices.length && targetAlreadyNeutralized
            ? (carryoverSabotage ? 6 : 18) +
              Math.max(0, futureBestVenueWeight - currentVenueWeight) * (carryoverSabotage ? 0.08 : 0.2) +
              muchBetterFutureVenueCount * (carryoverSabotage ? 2 : 7)
            : 0;
        const overplayBonus =
          card.effect === "remove_smash_hits"
            ? targetSmashHitEntries.length * 12 +
              currentSmashStripValue * 2.3 +
              futureSmashStripValue * 0.24
            : 0;
        score =
          venueWeight +
          targetSlotRevenue * 1.8 +
          (isTargetLeading ? 18 : 0) +
          (venue?.revenueFactor || 0) * 8 +
          scandalValue +
          overplayBonus +
          powerhouseTargetBonus +
          directContestBonus +
          futureHarassmentValue +
          sabotagePressure -
          showdownHoldPenalty -
          preserveForLeaderPenalty -
          wrongLeaderPenalty -
          wrongImmediateThreatPenalty -
          offBoardNoEmergencyPenalty -
          offBoardFutureCommitmentPenalty -
          offBoardSoftHarassPenalty -
          offVenueSabotagePenalty -
          dogpilePenalty -
          futureVenueOverkillPenalty -
          (ownBandBooked ? 0 : Math.max(6, 18 - sabotagePressure * 0.35));
        }
      }

      if (snowstormAtCurrentVenue && card.effect !== "venue_snow_tires" && card.effect !== "venue_snowstorm") {
        if (
          (card.type === "bad_song" || card.type === "scandal" || card.type === "rumor") &&
          targetManager?.id !== manager.id &&
          currentVenueSnowCancelsTarget
        ) {
          const futureOnlySabotageValue = carryoverSabotage
            ? Math.max(0, futureTargetValue) * 0.05 + (targetIsVpLeader ? 8 : 0) + targetNearWin * 0.4
            : 0;
          score = Math.min(score, futureOnlySabotageValue - 90);
        }

        if (card.type === "smash" && targetManager?.id === manager.id && currentVenueSnowCancelsManager) {
          if (!snowedOutSelfDevelopmentCard) {
            score -= 160;
          } else {
            const futureDevelopmentValue = targetBand
              ? Math.max(0, projectedBandValueAcrossPreview(targetBand, futureRounds)) * 0.08
              : 0;
            const saveForBiggerFutureVenuePenalty =
              futureOwnVenueSlices.length && futureOwnBestVenueWeight >= currentVenueWeight + 8
                ? 22 + Math.max(0, futureOwnBestVenueWeight - currentVenueWeight) * 0.45
                : 0;
            score = score * 0.3 + futureDevelopmentValue - saveForBiggerFutureVenuePenalty;
          }
        }

        if (card.effect === "televised_concert" && currentVenueSnowCancelsManager) {
          score -= 180;
        }

        if (card.effect === "refund_booking_fee" && currentVenueSnowCancelsManager) {
          score -= 220;
        }
      }

      if (futureVenueSlices.length && card.type !== "defense") {
        const currentVenueGap =
          ownBandBooked && targetManager?.id !== manager.id
            ? (ownEstimate.popularity || 0) - (targetEstimate.popularity || 0)
            : 0;
        const comfortableLeadHoldPenalty =
          ownBandBooked &&
          currentVenueGap >= 5 &&
          futureOwnVenueSlices.length &&
          futureOwnBestVenueWeight >= currentVenueWeight + 8
            ? 16 + Math.max(0, futureOwnBestVenueWeight - currentVenueWeight) * 0.5
            : 0;
        const badChaseHoldPenalty =
          ownBandBooked &&
          currentVenueGap <= -5 &&
          futureOwnVenueSlices.length &&
          futureOwnBestVenueWeight >= currentVenueWeight + 8
            ? 14 + Math.max(0, futureOwnBestVenueWeight - currentVenueWeight) * 0.45
            : 0;
        const conservePressure =
          Math.max(0, futureBestVenueWeight - currentVenueWeight) * 0.38 +
          Math.max(0, futureVenueWeight - currentVenueWeight) * 0.08 +
          Math.max(0, manager.hand.length - 1 - futureVenueSlices.length) * 4 +
          comfortableLeadHoldPenalty +
          badChaseHoldPenalty;
        const directContestRelief =
          targetManager?.id !== manager.id && ownBandBooked
            ? 10 + (venue?.venuePoints || 0) * 0.8
            : 0;
        score -= Math.max(0, conservePressure - directContestRelief);
      }

      if (futureVenueSlices.length && card.type !== "trend") {
        const reserveVenueCount = futureOwnVenueSlices.length || futureVenueSlices.length;
        const reserveBestWeight = futureOwnVenueSlices.length ? futureOwnBestVenueWeight : futureBestVenueWeight;
        const reserveHigherCount = futureOwnVenueSlices.length ? higherValueOwnFutureVenueCount : higherValueFutureVenueCount;
        const reserveMuchBetterCount = futureOwnVenueSlices.length ? muchBetterOwnFutureVenueCount : muchBetterFutureVenueCount;
        const cardsAfterPlay = Math.max(0, manager.hand.length - 1);
        const desiredReserve = Math.min(
          manager.hand.length,
          reserveVenueCount + reserveMuchBetterCount + (oneShotSabotage && futureOwnVenueSlices.length ? 1 : 0)
        );
        const reserveShortage = Math.max(0, desiredReserve - cardsAfterPlay);
        const reservePenalty =
          reserveShortage * (
            (oneShotSabotage ? 24 : 18) +
            Math.max(0, reserveBestWeight - currentVenueWeight) * (oneShotSabotage ? 0.8 : 0.55) +
            reserveHigherCount * (oneShotSabotage ? 8 : 5)
          );
        const repeatVenuePenalty =
          cardsPlayedThisVenue * (
            (oneShotSabotage ? 18 : 14) +
            Math.max(0, reserveBestWeight - currentVenueWeight) * (oneShotSabotage ? 0.65 : 0.45) +
            reserveMuchBetterCount * (oneShotSabotage ? 11 : 8)
          );
        const lowVenuePenalty =
          reserveHigherCount
            ? Math.max(0, reserveBestWeight - currentVenueWeight) * (oneShotSabotage ? 0.34 : 0.22) +
              reserveHigherCount * (oneShotSabotage ? 6 : 4)
            : 0;
        const overridePressure =
          targetManager?.id !== manager.id && ownBandBooked && (isTargetLeading || targetIsVpLeader || targetNearWin > 0)
            ? 10 + sabotagePressure * 0.2
            : 0;
        score -= Math.max(0, reservePenalty + repeatVenuePenalty + lowVenuePenalty - overridePressure);
      }

      return { card, ...target, score };
    });
  });

  const bestOption = options.sort((a, b) => b.score - a.score)[0] || null;
  if (!bestOption) {
    return null;
  }

  const requiredCard = requiredImmediateCard(manager, roundData);
  if (requiredCard && isImmediatePlayAnytimeCard(requiredCard)) {
    const forcedImmediatePlay = options
      .filter((option) => requiredCard && option.card.id === requiredCard.id)
      .sort((a, b) => b.score - a.score)[0] || null;
    if (forcedImmediatePlay) {
      return forcedImmediatePlay;
    }
  }

  if (managerMustUseRoundLockedSelfBadSongNow(manager, roundData)) {
    const forcedOption = options
      .filter((option) => isRoundLockedSelfBadSong(option.card))
      .sort((a, b) => b.score - a.score)[0] || null;
    if (forcedOption) {
      return forcedOption;
    }
  }

  const passThreshold =
    futureVenueSlices.length
      ? 20 +
        Math.max(0, futureBestVenueWeight - currentVenueWeight) * 0.22 +
        Math.max(0, futureOwnBestVenueWeight - currentVenueWeight) * 0.26 +
        Math.max(0, futureVenueWeight - currentVenueWeight) * 0.06 +
        Math.max(0, futureOwnVenueWeight - currentVenueWeight) * 0.08 +
        higherValueFutureVenueCount * 5 +
        higherValueOwnFutureVenueCount * 5 +
        muchBetterFutureVenueCount * 7 +
        muchBetterOwnFutureVenueCount * 9 +
        cardsPlayedThisVenue * (14 + muchBetterFutureVenueCount * 6)
      : 8;

  return bestOption.score >= passThreshold ? bestOption : null;
}

function beginShowcaseForCurrentVenue() {
  const roundData = currentRoundData();
  const venueIndex = activeVenueCardIndex();
  if (!roundData || !state.showcase) {
    return;
  }
  refreshRoundResults(roundData);
  state.showcase.venueIndex = venueIndex;
  state.showcase.viewVenueIndex = venueIndex;
  state.showcase.revealPhase = 0;
  state.showcase.venueSettled = false;
  state.showcase.venueOrders[venueIndex] = computeShowcaseOrderForVenue(venueIndex, roundData);
  state.showcase.message = showcasePendingMessage(showcaseCurrentBundle());
  state.phase = "results";
  state.activeWorkspace = "results";
  state.activeSidebarView = "results";
  state.activeCardManagerId = "";
  render();
}

function completeCardPhase() {
  if (!state.showcase?.bookingFeesPaid) {
    state.phase = "booking_fees";
    state.activeWorkspace = "results";
    state.activeCardManagerId = "";
    state.lastCardActionText = "Card play for the first venue is over. Pay the booking fees before the first venue resolves.";
    logEvent("First venue card window is over. Booking fees must be paid before the show begins.");
    render();
    return;
  }

  const isFinalVenueCardWindow = activeVenueCardIndex() === ROUND_VENUE_ORDER.length - 1;
  const playerHasLeftoverCards = state.managers[0]?.hand?.length > 0;
  if (isFinalVenueCardWindow && playerHasLeftoverCards) {
    beginCardCleanupPhase();
    return;
  }

  beginShowcaseForCurrentVenue();
}

function advanceCardTurns() {
  const roundData = currentRoundData();
  if (state.phase !== "cards" || !roundData || state.pendingDefenseChoice || state.pendingCharityCaseChoice) {
    return;
  }

  if (state.pendingMegaConcert) {
    advanceMegaConcertPlacements();
    return;
  }

  if (state.bandRevealAlert) {
    render();
    return;
  }

  if (!state.activeCardManagerId) {
    completeCardPhase();
    return;
  }

  if (state.phase !== "cards" || state.activeCardManagerId === "player") {
    return;
  }

  const manager = state.managers.find((entry) => entry.id === state.activeCardManagerId);
  const activeVenue = activeVenueForCards(roundData);
  if (!manager) {
    completeCardPhase();
    return;
  }

  const choice = aiChooseCardPlay(manager, roundData);
  if (!choice) {
    if (!state.cardPassedManagers.includes(manager.id)) {
      state.cardPassedManagers.push(manager.id);
    }
    queueCardEvent({
      managerId: manager.id,
      managerName: manager.name,
      cardName: "Pass",
      cardSubtitle: "Card Phase",
      cardDescription: "This promoter passed for the rest of the current card phase.",
      footerText: `${manager.name} passed for the rest of the card phase.`,
    });
    logEvent(`${manager.name} passes for the rest of the card phase.`);
  } else {
    applyCardPlay(manager, choice.card, choice.managerId, choice.venueType, {
      targetBandName: choice.bandName,
      targetSlotKey: choice.slotKey,
      pairedTargetManagerId: choice.pairedManagerId,
      pairedTargetSlotKey: choice.pairedSlotKey,
      pairedBandName: choice.pairedBandName,
    });
    if (state.pendingDefenseChoice || state.pendingCharityCaseChoice) {
      render();
      return;
    }
    if (state.pendingMegaConcert) {
      render();
      return;
    }
    if (state.bandRevealAlert) {
      state.activeCardManagerId = nextCardManagerId(manager.id);
      if (!state.activeCardManagerId) {
        completeCardPhase();
        return;
      }
      render();
      return;
    }
  }

  if (state.cardPassedManagers.length >= state.cardTurnOrder.length) {
    completeCardPhase();
    return;
  }

  state.activeCardManagerId = nextCardManagerId(manager.id);
  if (!state.activeCardManagerId) {
    completeCardPhase();
  }
}

function passCardPhase() {
  if (state.phase !== "cards" || state.activeCardManagerId !== "player" || state.pendingDefenseChoice || state.pendingCharityCaseChoice) {
    return;
  }

  if (state.pendingMegaConcert && currentMegaConcertEntry()?.managerId === "player") {
    state.lastCardActionText = "Place your Mega Concert Special Guest before you pass or continue the card phase.";
    render();
    return;
  }

  const roundData = currentRoundData();

  const immediateStatus = immediateCardStatusText(state.managers[0], roundData, { includePassWarning: true });
  if (immediateStatus) {
    state.lastCardActionText = immediateStatus;
    render();
    return;
  }

  if (!state.cardPassedManagers.includes("player")) {
    state.cardPassedManagers.push("player");
  }
  queueCardEvent({
    managerId: "player",
    managerName: state.managers[0].name,
    cardName: "Pass",
    cardSubtitle: "Card Phase",
    cardDescription: "You passed for the rest of the current card phase.",
    footerText: `${state.managers[0].name} passed for the rest of the card phase.`,
  });
  logEvent(`${state.managers[0].name} passes for the rest of the card phase.`);

  if (state.cardPassedManagers.length >= state.cardTurnOrder.length) {
    completeCardPhase();
    return;
  }

  state.activeCardManagerId = nextCardManagerId("player");
  if (!state.activeCardManagerId) {
    completeCardPhase();
    return;
  }
  if (state.activeCardManagerId !== "player") {
    advanceCardTurns();
  }
  if (state.phase === "cards") {
    render();
  }
}

function playPlayerCard(cardId, encodedTarget) {
  const player = state.managers[0];
  const card = player.hand.find((entry) => entry.id === cardId);
  const roundData = currentRoundData();
  if (!card) {
    state.lastCardActionText = "That card is no longer in your hand.";
    render();
    return;
  }

  if (state.phase !== "cards") {
    state.lastCardActionText = "Cards can only be played during the live card phase.";
    render();
    return;
  }

  if (state.activeCardManagerId !== "player") {
    state.lastCardActionText = "It is not your turn yet. Press Continue Card Phase to advance the other promoters.";
    render();
    return;
  }

  if (state.pendingDefenseChoice) {
    state.lastCardActionText = "Resolve the defense prompt before playing another card.";
    render();
    return;
  }

  if (state.pendingCharityCaseChoice) {
    state.lastCardActionText = "Finish the Charity Case handoff before playing another card.";
    render();
    return;
  }

  if (!roundData) {
    state.lastCardActionText = "This round is not ready for card play yet.";
    render();
    return;
  }

  if (!card || state.phase !== "cards" || state.activeCardManagerId !== "player" || state.pendingDefenseChoice || state.pendingCharityCaseChoice || !roundData) {
    return;
  }

  if (state.pendingMegaConcert && currentMegaConcertEntry()?.managerId === "player") {
    state.lastCardActionText = "Place your Mega Concert Special Guest before playing another card.";
    render();
    return;
  }

  const availableTargets = getCardTargets(player, card, roundData);
  const requiredCard = requiredImmediateCard(player, roundData);
  if (requiredCard && card.id !== requiredCard.id) {
    state.lastCardActionText = immediateCardStatusText(player, roundData) || `${requiredCard.name} must be played first this round.`;
    render();
    return;
  }
  if ((card.type !== "defense" || isProactiveDefenseCard(card)) && !availableTargets.length) {
    state.lastCardActionText =
      card.type === "trend"
        ? card.effect === "signing_bonus" || card.effect === "communism" || card.effect === "draw_cards" || card.effect === "steal_cards" || card.effect === "cash_attack" || card.effect === "charity_case" || card.effect === "televised_concert" || card.effect === "special_guest_draw"
          || card.effect === "refund_booking_fee" || card.effect === "mega_concert"
          ? `That ${card.name} is not available right now.`
          : "That card is not available right now."
        : card.effect === "cancel_demands"
          ? "No bands currently have Demands active."
        : card.effect === "cancel_scandal"
          ? "No bands currently have an active Rumor or Scandal."
        : isRoundLockedSelfBadSong(card)
          ? "That Bad Move has no legal target on your current booked band. You can hold it for a later venue this round."
          : "That card has no legal target in the current venue.";
    render();
    return;
  }

  const resolvedEncodedTarget =
    !encodedTarget && availableTargets.length === 1
      ? encodeCardTarget(availableTargets[0])
      : encodedTarget;

  if (card.type !== "trend" && !resolvedEncodedTarget) {
    state.lastCardActionText = "Choose a target for that card first.";
    render();
    return;
  }

  const target = card.type === "trend"
    ? ((card.effect === "cash_attack" || card.effect === "charity_case" || card.effect === "televised_concert" || card.effect === "refund_booking_fee" || card.effect === "special_guest_draw") ? decodeCardTarget(resolvedEncodedTarget) : { managerId: "all", venueType: "all", slotKey: "", bandName: "" })
    : decodeCardTarget(resolvedEncodedTarget);
  const handSizeBefore = player.hand.length;
  const roundCardPlayCountBefore = state.roundCardPlays.length;
  const pendingDefenseBefore = Boolean(state.pendingDefenseChoice);
  const pendingCharityBefore = Boolean(state.pendingCharityCaseChoice);
  const pendingMegaConcertBefore = Boolean(state.pendingMegaConcert);
  const bandRevealBefore = Boolean(state.bandRevealAlert);
  applyCardPlay(player, card, target.managerId, target.venueType, {
    targetBandName: target.bandName,
    targetSlotKey: target.slotKey,
    pairedTargetManagerId: target.pairedManagerId,
    pairedTargetSlotKey: target.pairedSlotKey,
    pairedBandName: target.pairedBandName,
  });
  const cardConsumed = !player.hand.some((entry) => entry.id === card.id);
  const cardQueuedEffect = state.roundCardPlays.length > roundCardPlayCountBefore;
  const openedDefensePrompt = !pendingDefenseBefore && Boolean(state.pendingDefenseChoice);
  const openedCharityPrompt = !pendingCharityBefore && Boolean(state.pendingCharityCaseChoice);
  const openedMegaConcert = !pendingMegaConcertBefore && Boolean(state.pendingMegaConcert);
  const openedBandReveal = !bandRevealBefore && Boolean(state.bandRevealAlert);
  const handChanged = player.hand.length !== handSizeBefore;
  const cardResolved =
    cardConsumed ||
    cardQueuedEffect ||
    openedDefensePrompt ||
    openedCharityPrompt ||
    openedMegaConcert ||
    openedBandReveal ||
    handChanged;
  if (!cardResolved) {
    state.lastCardActionText = `Tried to play ${cardTitleText(card)}, but it did not resolve. Try a different target or card.`;
    render();
    return;
  }
  if (state.pendingDefenseChoice || state.pendingCharityCaseChoice) {
    render();
    return;
  }
  if (state.pendingMegaConcert) {
    render();
    return;
  }
  if (state.bandRevealAlert) {
    state.activeCardManagerId = nextCardManagerId("player");
    if (!state.activeCardManagerId) {
      completeCardPhase();
      return;
    }
    render();
    return;
  }
  state.activeCardManagerId = nextCardManagerId("player");
  if (!state.activeCardManagerId) {
    completeCardPhase();
    return;
  }
  render();
}

function cardModifierFor(managerId, venueType, band) {
  const flatBonus = state.roundCardPlays
    .filter((entry) =>
      entry.targetManagerId === managerId &&
      entry.venueType === venueType &&
      (entry.effect === "flat_bonus" || entry.effect === "argument_duo" || entry.effect === "benefit_concert") &&
      (entry.bandName === band?.name || entry.pairedBandName === band?.name)
    )
    .reduce((sum, entry) => sum + entry.modifier, 0);

  const roundData = currentRoundData();
  const manager = state.managers.find((entry) => entry.id === managerId);
  const venue = roundData?.venues.find((entry) => entry.type === venueType);
  if (!band || !venue) {
    return flatBonus;
  }

  const trendBonus = state.roundCardPlays
    .filter((entry) => entry.effect === "music_trend")
    .reduce((sum, entry) => {
      const card = CARD_TEMPLATES.find((template) => template.name === entry.cardName && (template.subtitle || "") === (entry.cardSubtitle || ""));
      if (!card?.trendGenres?.length) {
        return sum;
      }
      return genreParts(band.genre).some((genre) => card.trendGenres.includes(genre)) ? sum + (entry.modifier || 0) : sum;
    }, 0);

  return flatBonus + trendBonus;
}

function persistentScandalAdjustmentSummary(managerId, band) {
  const entries = state.persistentScandalAdjustments.filter(
    (entry) => entry.targetManagerId === managerId && entry.bandName === band?.name
  );

  if (!entries.length) {
    return { modifier: 0, diceModifier: 0, detail: "" };
  }

  const modifier = entries.reduce((sum, entry) => sum + (entry.modifier || 0), 0);
  const diceModifier = entries.reduce((sum, entry) => sum + (entry.diceModifier || 0), 0);
  const detail = entries
    .map((entry) => `${storedCardLabel(entry, "Adjustment")} ${formatScandalAdjustmentDelta(entry.modifier || 0, entry.diceModifier || 0)}`)
    .join(", ");

  return { modifier, diceModifier, detail };
}

function persistentSmashSummary(managerId, band) {
  const persistentEntries = state.persistentSmashHits.filter(
    (entry) => entry.targetManagerId === managerId && entry.bandName === band?.name
  );

  if (!persistentEntries.length) {
    return { bonus: 0, diceBonus: 0, detail: "" };
  }

  const bonus = persistentEntries.reduce((sum, entry) => sum + (entry.modifier || 0), 0);
  const diceBonus = persistentEntries.reduce((sum, entry) => sum + (entry.popularityDice || 0), 0);
  const detail = persistentEntries
    .map((entry) => `${storedCardLabel(entry, "Smash Hit")} ${formatCardEffectDelta(entry.modifier || 0, entry.popularityDice || 0)}`)
    .join(", ");

  return { bonus, diceBonus, detail };
}

function resolveScandalPenalty(effect, band, flatPenalty = 0, modifierDelta = 0, diceDelta = 0) {
  const scandalRoll = rollNotationSignedWithModifier(band.scandal, modifierDelta, diceDelta);
  if (effect === "scandal_roll_double" || effect === "persistent_scandal_double") {
    return { penalty: scandalRoll.total * 2, detail: `${scandalRoll.detail} x2`, chartDetail: `Roll ${scandalRoll.detail} x2` };
  }
  if (effect === "flat_penalty") {
    return { penalty: flatPenalty || 2, detail: `flat ${flatPenalty || 2}`, chartDetail: `Flat -${flatPenalty || 2}` };
  }
  return { penalty: scandalRoll.total, detail: scandalRoll.detail, chartDetail: `Roll ${scandalRoll.detail}` };
}

function roundScandalSummary(managerId, venueType, band) {
  const scandalPlays = state.roundCardPlays.filter(
    (entry) =>
      entry.targetManagerId === managerId &&
      entry.venueType === venueType &&
      entry.bandName === band?.name &&
      (entry.cardType === "scandal" || entry.cardType === "rumor")
  );

  if (!scandalPlays.length || !band) {
    return { penalty: 0, detail: "", forcedMiss: false };
  }

  let totalPenalty = 0;
  const parts = [];
  const chartParts = [];
  const scandalAdjustment = persistentScandalAdjustmentSummary(managerId, band);

  scandalPlays.forEach((play) => {
    if (play.effect === "persistent_scandal" || play.effect === "persistent_bust" || play.effect === "persistent_scandal_double") {
      return;
    }
    const resolved = resolveScandalPenalty(play.effect, band, play.flatPenalty, scandalAdjustment.modifier, scandalAdjustment.diceModifier);
    totalPenalty += resolved.penalty;
    parts.push(`${play.cardSubtitle || "Scandal"} ${resolved.detail}`);
    chartParts.push(resolved.chartDetail);
  });

  const hasDoublingHeadline = scandalPlays.some((play) => play.effect === "scandal_roll_double_if_second");
  if (hasDoublingHeadline && scandalPlays.length > 1) {
    totalPenalty *= 2;
    parts.push("all round scandals doubled");
    chartParts.push("All x2");
  }

  return {
    penalty: totalPenalty,
    detail: parts.join(", "),
    chartDetail: chartParts.join(", "),
    forcedMiss: scandalPlays.some((play) => play.effect === "persistent_bust"),
  };
}

function persistentScandalSummary(managerId, venueType, band) {
  const persistentEntries = state.persistentScandals.filter(
    (entry) => entry.targetManagerId === managerId && entry.bandName === band?.name
  );

  if (!persistentEntries.length || !band) {
    return { penalty: 0, detail: "" };
  }

  let totalPenalty = 0;
  const parts = [];
  const chartParts = [];
  const scandalAdjustment = persistentScandalAdjustmentSummary(managerId, band);

  persistentEntries.forEach((entry) => {
    const roll = rollNotationSignedWithModifier(band.scandal, scandalAdjustment.modifier, scandalAdjustment.diceModifier);
    const doubled = entry.effect === "persistent_scandal_double";
    totalPenalty += doubled ? roll.total * 2 : roll.total;
    parts.push(`${entry.subtitle} ${roll.detail}${doubled ? " x2" : ""}`);
    chartParts.push(`Carryover ${roll.detail}${doubled ? " x2" : ""}`);
  });

  return { penalty: totalPenalty, detail: parts.join(", "), chartDetail: chartParts.join(", ") };
}

function activeScandalCountForBand(managerId, venueType, band) {
  if (!band) {
    return 0;
  }

  const roundCount = state.roundCardPlays.filter(
    (entry) =>
      entry.targetManagerId === managerId &&
      entry.venueType === venueType &&
      entry.bandName === band.name &&
      (entry.cardType === "scandal" || entry.cardType === "rumor") &&
      entry.effect !== "persistent_scandal" &&
      entry.effect !== "persistent_bust" &&
      entry.effect !== "persistent_scandal_double"
  ).length;

  const persistentCount = state.persistentScandals.filter(
    (entry) => entry.targetManagerId === managerId && entry.bandName === band.name
  ).length;

  return roundCount + persistentCount;
}

function roundBadSongSummary(managerId, venueType, band, slotKey = "", availableCash = 0) {
  const badSongPlays = state.roundCardPlays.filter(
    (entry) =>
      entry.targetManagerId === managerId &&
      entry.venueType === venueType &&
      entry.bandName === band?.name &&
      entry.cardType === "bad_song"
  );

  if (!badSongPlays.length) {
    return { penalty: 0, diceModifier: 0, detail: "", forcedMiss: false, contractCost: 0, contractCanPay: false, halvedRoll: false, halvedShow: false, noRevenue: false };
  }

  const penalty = badSongPlays.reduce((sum, entry) => sum + (entry.flatPenalty || 0), 0);
  const diceModifier = badSongPlays.reduce((sum, entry) => sum + (entry.popularityDice || 0), 0);
  const contractNegotiationPlays = slotKey === HEADLINER_SLOT
    ? badSongPlays.filter((entry) => entry.effect === "contract_negotiations")
    : [];
  const halvedRoll = badSongPlays.some((entry) => entry.effect === "technical_difficulties");
  const halvedShow = badSongPlays.some((entry) => entry.effect === "parking_lot_concert");
  const noRevenue = badSongPlays.some((entry) => entry.effect === "benefit_concert");
  const contractCost = contractNegotiationPlays.length ? (band?.retention || 0) * 2 * contractNegotiationPlays.length : 0;
  const contractCanPay = contractCost > 0 && availableCash >= contractCost;
  const forcedMiss = badSongPlays.some((entry) => entry.effect === "miss_this_week" || entry.effect === "bad_promotion_idea" || entry.effect === "bad_sushi") || (contractCost > 0 && !contractCanPay);
  const detail = badSongPlays
    .map((entry) => {
      if (entry.effect === "remove_smash_hits") {
        return `${entry.cardName || "Overplay"} discarded Smash Hits`;
      }
      if (entry.effect === "contract_negotiations") {
        return `Contract Negotiations ${contractCanPay ? `paid ${formatCash(contractCost)}` : `misses show (${formatCash(contractCost)} demanded)`}`;
      }
      if (entry.effect === "bad_promotion_idea") {
        return "Bad Promotion Idea misses show";
      }
      if (entry.effect === "bad_sushi") {
        return "Bad Sushi misses show";
      }
      if (entry.effect === "technical_difficulties") {
        return "Technical Difficulties halves popularity roll";
      }
      if (entry.effect === "parking_lot_concert") {
        return "Parking Lot Concert halves this band's show";
      }
      if (entry.effect === "benefit_concert") {
        return "Hearing Aid IV Benefit Concert gives +10 Popularity but no revenue";
      }
      return `${entry.cardSubtitle || "Bad Song"} ${formatCardEffectDelta(-(entry.flatPenalty || 0), entry.popularityDice || 0)}`;
    })
    .join(", ");

  return { penalty, diceModifier, detail, forcedMiss, contractCost, contractCanPay, halvedRoll, halvedShow, noRevenue };
}

function persistentBadSongSummary(managerId, band) {
  const persistentEntries = state.persistentBadSongs.filter(
    (entry) => entry.targetManagerId === managerId && entry.bandName === band?.name
  );

  if (!persistentEntries.length) {
    return { penalty: 0, diceModifier: 0, detail: "" };
  }

  const penalty = persistentEntries.reduce((sum, entry) => sum + (entry.flatPenalty || 0), 0);
  const diceModifier = persistentEntries.reduce((sum, entry) => sum + (entry.popularityDice || 0), 0);
  const detail = persistentEntries
    .map((entry) => `${entry.subtitle} ${formatCardEffectDelta(-(entry.flatPenalty || 0), entry.popularityDice || 0)}`)
    .join(", ");

  return { penalty, diceModifier, detail };
}

function estimatedScandalPenaltyForEffect(effect, band, flatPenalty = 0, modifierDelta = 0, diceDelta = 0) {
  const scandalAverage = parseDiceAverageSignedWithModifier(band.scandal, modifierDelta, diceDelta);
  if (effect === "scandal_roll_double" || effect === "persistent_scandal_double") {
    return scandalAverage * 2;
  }
  if (effect === "flat_penalty") {
    return flatPenalty || 2;
  }
  return scandalAverage;
}

function estimatedRoundScandalSummary(managerId, venueType, band) {
  const scandalPlays = state.roundCardPlays.filter(
    (entry) =>
      entry.targetManagerId === managerId &&
      entry.venueType === venueType &&
      entry.bandName === band?.name &&
      (entry.cardType === "scandal" || entry.cardType === "rumor")
  );

  if (!scandalPlays.length || !band) {
    return { penalty: 0, forcedMiss: false };
  }

  let totalPenalty = 0;
  const scandalAdjustment = persistentScandalAdjustmentSummary(managerId, band);
  scandalPlays.forEach((play) => {
    if (play.effect === "persistent_scandal" || play.effect === "persistent_bust" || play.effect === "persistent_scandal_double") {
      return;
    }
    totalPenalty += estimatedScandalPenaltyForEffect(play.effect, band, play.flatPenalty, scandalAdjustment.modifier, scandalAdjustment.diceModifier);
  });

  const hasDoublingHeadline = scandalPlays.some((play) => play.effect === "scandal_roll_double_if_second");
  if (hasDoublingHeadline && scandalPlays.length > 1) {
    totalPenalty *= 2;
  }

  return {
    penalty: totalPenalty,
    forcedMiss: scandalPlays.some((play) => play.effect === "persistent_bust"),
  };
}

function estimatedPersistentScandalSummary(managerId, venueType, band) {
  const persistentEntries = state.persistentScandals.filter(
    (entry) => entry.targetManagerId === managerId && entry.bandName === band?.name
  );

  if (!persistentEntries.length || !band) {
    return { penalty: 0 };
  }

  const scandalAdjustment = persistentScandalAdjustmentSummary(managerId, band);
  const penalty = persistentEntries.reduce(
    (sum, entry) => sum + parseDiceAverageSignedWithModifier(band.scandal, scandalAdjustment.modifier, scandalAdjustment.diceModifier) * (entry.effect === "persistent_scandal_double" ? 2 : 1),
    0
  );
  return { penalty };
}

function weightedVenueContribution(value, slotKey) {
  const slot = VENUE_SLOT_LOOKUP[slotKey] || VENUE_SLOT_LOOKUP[HEADLINER_SLOT];
  return Math.round(value * slot.multiplier);
}

function halvedPopularityRollValue(value, halvedRoll) {
  return halvedRoll ? value / 2 : value;
}

function halvedPopularityRollDetail(detail, total, halvedRoll) {
  if (!halvedRoll) {
    return { detail, total };
  }
  return {
    detail: `${detail} / 2`,
    total: total / 2,
  };
}

function halvedShowValue(value, halvedShow) {
  return halvedShow ? value / 2 : value;
}

function slotMultiplierText(slotKey) {
  const slot = VENUE_SLOT_LOOKUP[slotKey] || VENUE_SLOT_LOOKUP[HEADLINER_SLOT];
  return slot.multiplier === 1 ? "" : ` x${slot.multiplier}`;
}

function buildEstimatedVenuePerformance(manager, venue, band, slotKey) {
  const slot = VENUE_SLOT_LOOKUP[slotKey] || VENUE_SLOT_LOOKUP[HEADLINER_SLOT];
  const fit = genreFitScore(band, venue);
  const persistentSmash = persistentSmashSummary(manager.id, band);
  const cardModifier = cardModifierFor(manager.id, venue.type, band);
  const roundBadSong = roundBadSongSummary(manager.id, venue.type, band, slot.key, manager.cash);
  const persistentBadSong = persistentBadSongSummary(manager.id, band);
  const badSongPenalty = roundBadSong.penalty + persistentBadSong.penalty;
  const badSongDiceModifier = (roundBadSong.diceModifier || 0) + (persistentBadSong.diceModifier || 0);
  const roundScandal = estimatedRoundScandalSummary(manager.id, venue.type, band);
  const persistentScandal = estimatedPersistentScandalSummary(manager.id, venue.type, band);
  const scandalPenalty = roundScandal.penalty + persistentScandal.penalty;
  const venueSnowedOut = venueHasSnowstorm(venue.type) && !managerHasSnowTires(manager.id, venue.type);
  const nonScandalModifier = fit + cardModifier + persistentSmash.bonus - badSongPenalty;
  const rawBaseRoll = Math.max(0, parseDiceAverageSignedWithModifier(band.popularity, 0, (persistentSmash.diceBonus || 0) + badSongDiceModifier));
  const baseRoll = halvedPopularityRollValue(rawBaseRoll, roundBadSong.halvedRoll);
  const forcedMiss = roundScandal.forcedMiss || venueSnowedOut || roundBadSong.forcedMiss;
  const preScandalPopularity = forcedMiss ? 0 : baseRoll + nonScandalModifier;
  const rawFinalPopularity = forcedMiss ? 0 : preScandalPopularity - scandalPenalty;
  const finalPopularity = halvedShowValue(rawFinalPopularity, roundBadSong.halvedShow);
  const weightedScore = weightedVenueContribution(finalPopularity, slot.key);

  return {
    slotKey: slot.key,
    slotLabel: slot.label,
    multiplier: slot.multiplier,
    band,
    expectedNotation: venueSnowedOut ? "Snowed out" : forcedMiss ? "Misses show" : `${formatAdjustedNotation(band.popularity, nonScandalModifier, (persistentSmash.diceBonus || 0) + badSongDiceModifier)}${roundBadSong.halvedRoll ? " (roll halved)" : ""}${roundBadSong.halvedShow ? " (show halved)" : ""}`,
    fit,
    weightedFit: weightedVenueContribution(fit, slot.key),
    cardModifier,
    weightedCardModifier: weightedVenueContribution(cardModifier, slot.key),
    smashBonus: persistentSmash.bonus,
    weightedSmashBonus: weightedVenueContribution(persistentSmash.bonus, slot.key),
    smashDiceBonus: persistentSmash.diceBonus,
    badSongDiceModifier,
    badSongPenalty,
    weightedBadSongPenalty: weightedVenueContribution(badSongPenalty, slot.key),
    scandalPenalty,
    weightedScandalPenalty: weightedVenueContribution(scandalPenalty, slot.key),
    forcedMiss,
    venueSnowedOut,
    contractCost: roundBadSong.contractCanPay ? roundBadSong.contractCost : 0,
    contractCanPay: roundBadSong.contractCanPay,
    halvedRoll: roundBadSong.halvedRoll,
    halvedShow: roundBadSong.halvedShow,
    noRevenue: roundBadSong.noRevenue,
    baseRoll,
    weightedRoll: weightedVenueContribution(baseRoll, slot.key),
    preScandalPopularity,
    weightedPreScandalPopularity: weightedVenueContribution(preScandalPopularity, slot.key),
    rawFinalPopularity,
    finalPopularity,
    weightedScore,
    weightedRevenue: roundBadSong.noRevenue ? 0 : Math.max(0, weightedScore) * venue.revenueFactor,
    cardDelta: cardModifier + persistentSmash.bonus - badSongPenalty,
    weightedCardDelta: weightedVenueContribution(cardModifier + persistentSmash.bonus - badSongPenalty, slot.key),
    activeScandals: activeScandalCountForBand(manager.id, venue.type, band),
    scandalFactorLabel: effectiveScandalNotation(manager.id, band),
  };
}

function estimatedVenueStrength(manager, venue, roundData, options = {}) {
  const advertisingBonus = visibleAdvertisingBonusForVenue(
    manager.id,
    roundData?.roundNumber || state.round,
    venue.type,
    options.viewerManagerId || ""
  );
  const performances = getAssignedBandEntries(manager, venue.type)
    .map((entry) => {
      const band = getBandByName(manager, entry.bandName);
      return band ? buildEstimatedVenuePerformance(manager, venue, band, entry.key) : null;
    })
    .filter(Boolean);

  if (!performances.length) {
    return {
      band: null,
      performances: [],
      popularity: 0,
      revenue: 0,
      expectedNotation: "-",
      staticModifier: 0,
      forcedMiss: false,
      fit: 0,
      cardModifier: 0,
      smashBonus: 0,
      smashDiceBonus: 0,
      advertisingBonus: 0,
      badSongPenalty: 0,
      scandalPenalty: 0,
      bandLabel: "",
    };
  }

  const venueSnowedOut = performances.every((performance) => performance.venueSnowedOut);
  const effectiveAdvertisingBonus = venueSnowedOut ? 0 : advertisingBonus;
  const popularity = performances.reduce((sum, performance) => sum + performance.weightedScore, 0) + effectiveAdvertisingBonus;
  const revenueMultiplier = televisedConcertRevenueMultiplier(venue.type) * globalRevenueClimateMultiplier();
  const bandRevenue = performances.reduce((sum, performance) => sum + (performance.weightedRevenue || 0), 0);
  const advertisingRevenue = Math.max(0, effectiveAdvertisingBonus) * venue.revenueFactor;
  const grossRevenue = (bandRevenue + advertisingRevenue) * revenueMultiplier;
  const refund = bookingFeeRefundForVenue(manager.id, venue.type, venue.cost);
  const revenue = grossRevenue - venue.cost + refund;
  const fit = performances.reduce((sum, performance) => sum + performance.weightedFit, 0);
  const cardModifier = performances.reduce((sum, performance) => sum + performance.weightedCardModifier, 0);
  const smashBonus = performances.reduce((sum, performance) => sum + performance.weightedSmashBonus, 0);
  const smashDiceBonus = performances.reduce((sum, performance) => sum + performance.smashDiceBonus, 0);
  const badSongPenalty = performances.reduce((sum, performance) => sum + performance.weightedBadSongPenalty, 0);
  const scandalPenalty = performances.reduce((sum, performance) => sum + performance.weightedScandalPenalty, 0);
  const staticModifier = fit + cardModifier + smashBonus - badSongPenalty - scandalPenalty;
  const band = performances[0]?.band || null;

  return {
    band,
    performances,
    popularity,
    revenue,
    expectedNotation: performances.map((performance) => `${performance.band.name}: ${performance.expectedNotation}${slotMultiplierText(performance.slotKey)}`).join(" • "),
    staticModifier,
    forcedMiss: performances.every((performance) => performance.forcedMiss),
    venueSnowedOut,
    fit,
    cardModifier,
    smashBonus,
    smashDiceBonus,
    advertisingBonus: effectiveAdvertisingBonus,
    badSongPenalty,
    scandalPenalty,
    bandLabel: performances.map((performance) => performance.band.name).join(" / "),
    revenueMultiplier,
    refund,
  };
}

function findVenuePerformance(venueSummary, bandName) {
  return venueSummary?.performances?.find((performance) => performance.band.name === bandName) || null;
}

function estimatedScandalSwing(managerId, band) {
  return effectiveScandalAverage(managerId, band);
}

function effectiveScandalNotation(managerId, band) {
  const adjustment = persistentScandalAdjustmentSummary(managerId, band);
  return formatAdjustedNotation(band.scandal, adjustment.modifier, adjustment.diceModifier);
}

function effectiveScandalAverage(managerId, band) {
  const adjustment = persistentScandalAdjustmentSummary(managerId, band);
  return parseDiceAverageSignedWithModifier(band.scandal, adjustment.modifier, adjustment.diceModifier);
}

function signedNumberLabel(value) {
  return value > 0 ? `+${value}` : `${value}`;
}

function formatCardEffectDelta(flatDelta = 0, diceDelta = 0, zeroLabel = "0") {
  const parts = [];
  if (flatDelta) {
    parts.push(signedNumberLabel(flatDelta));
  }
  if (diceDelta) {
    parts.push(`${signedNumberLabel(diceDelta)}D`);
  }
  return parts.length ? parts.join(", ") : zeroLabel;
}

function formatScandalAdjustmentDelta(modifierDelta = 0, diceDelta = 0, zeroLabel = "0") {
  const parts = [];
  if (diceDelta) {
    parts.push(`${diceDelta > 0 ? "+" : ""}${diceDelta}D`);
  }
  if (modifierDelta) {
    parts.push(signedNumberLabel(modifierDelta));
  }
  return parts.length ? parts.join("") : zeroLabel;
}

function formatModifierList(values) {
  return values
    .filter((value) => value !== 0)
    .map((value) => signedNumberLabel(value))
    .join(", ");
}

function ongoingEffectsSummary(managerId, bandName) {
  if (!bandName) {
    return "";
  }

  const hits = state.persistentSmashHits
    .filter((entry) => entry.targetManagerId === managerId && entry.bandName === bandName)
    .map((entry) => `${storedCardLabel(entry, "Smash Hit")} ${formatCardEffectDelta(entry.modifier || 0, entry.popularityDice || 0)}`);
  const scandalAdjustments = state.persistentScandalAdjustments
    .filter((entry) => entry.targetManagerId === managerId && entry.bandName === bandName)
    .map((entry) => `${storedCardLabel(entry, "Adjustment")} ${formatScandalAdjustmentDelta(entry.modifier || 0, entry.diceModifier || 0)} scandal`);
  const badSongs = state.persistentBadSongs
    .filter((entry) => entry.targetManagerId === managerId && entry.bandName === bandName)
    .map((entry) => `${entry.subtitle} ${formatCardEffectDelta(-(entry.flatPenalty || 0), entry.popularityDice || 0)}`);
  const scandals = state.persistentScandals
    .filter((entry) => entry.targetManagerId === managerId && entry.bandName === bandName)
    .map((entry) => `${entry.subtitle}${entry.effect === "persistent_scandal_double" ? " x2" : ""}`);
  const protection = state.persistentLawyers
    .filter((entry) => entry.targetManagerId === managerId && entry.bandName === bandName)
    .map(() => "Super Lawyer");

  const parts = [];
  if (hits.length) {
    parts.push(`Smash Hits: ${hits.join(", ")}`);
  }
  if (scandalAdjustments.length) {
    parts.push(`Scandal: ${scandalAdjustments.join(", ")}`);
  }
  if (badSongs.length) {
    parts.push(`Bad Songs: ${badSongs.join(", ")}`);
  }
  if (scandals.length) {
    parts.push(`Scandals: ${scandals.join(", ")}`);
  }
  if (protection.length) {
    parts.push(`Protection: ${protection.join(", ")}`);
  }

  return parts.join(" • ");
}

function bandRetentionSnapshot(manager, band, roundData) {
  const assignment = findBandAssignment(manager, band.name, roundData);
  const venue = assignment?.venueType && roundData ? roundData.venues.find((entry) => entry.type === assignment.venueType) : null;
  const hasSuperLawyer = state.persistentLawyers.some(
    (entry) => entry.targetManagerId === manager.id && entry.bandName === band.name
  );
  const protectionNote = hasSuperLawyer ? "Protected by Super Lawyer" : "";
  const combineStatus = (primary) => [primary, protectionNote].filter(Boolean).join(" • ");
  const persistentScandalEntries = state.persistentScandals.filter(
    (entry) => entry.targetManagerId === manager.id && entry.bandName === band.name
  );
  const persistentSmash = persistentSmashSummary(manager.id, band);
  const persistentBadSong = persistentBadSongSummary(manager.id, band);
  const scandalAdjustment = persistentScandalAdjustmentSummary(manager.id, band);
  const activeScandalCount = persistentScandalEntries.length;
  const popularityFlatModifier = (persistentSmash.bonus || 0) - (persistentBadSong.penalty || 0);
  const popularityDiceModifier = (persistentSmash.diceBonus || 0) + (persistentBadSong.diceModifier || 0);
  const flatModifiers = [
    persistentSmash.bonus || 0,
    persistentBadSong.penalty ? -persistentBadSong.penalty : 0,
  ].filter((value) => value !== 0);
  const modifierDetails = [];
  if (flatModifiers.length) {
    modifierDetails.push(`Modifiers ${formatModifierList(flatModifiers)}`);
  }
  if (popularityDiceModifier) {
    modifierDetails.push(`Popularity ${signedNumberLabel(popularityDiceModifier)}D`);
  }
  if (scandalAdjustment.modifier || scandalAdjustment.diceModifier) {
    modifierDetails.push(`Scandal factor ${formatScandalAdjustmentDelta(scandalAdjustment.modifier, scandalAdjustment.diceModifier)}`);
  }

  let adjustedRating = formatAdjustedNotation(band.popularity, popularityFlatModifier, popularityDiceModifier);
  if (activeScandalCount > 0) {
    adjustedRating += ` - (${effectiveScandalNotation(manager.id, band)}${activeScandalCount > 1 ? ` x ${activeScandalCount}` : ""})`;
  }

  const averagePopularityScore = parseDiceAverageSignedWithModifier(
    band.popularity,
    popularityFlatModifier,
    popularityDiceModifier
  );
  const minPopularityScore = parseDiceMinSignedWithModifier(
    band.popularity,
    popularityFlatModifier,
    popularityDiceModifier
  );
  const maxPopularityScore = parseDiceMaxSignedWithModifier(
    band.popularity,
    popularityFlatModifier,
    popularityDiceModifier
  );
  const averageScandalPenalty = activeScandalCount
    ? parseDiceAverageSignedWithModifier(band.scandal, scandalAdjustment.modifier, scandalAdjustment.diceModifier) * activeScandalCount
    : 0;
  const minScandalPenalty = activeScandalCount
    ? parseDiceMinSignedWithModifier(band.scandal, scandalAdjustment.modifier, scandalAdjustment.diceModifier) * activeScandalCount
    : 0;
  const maxScandalPenalty = activeScandalCount
    ? parseDiceMaxSignedWithModifier(band.scandal, scandalAdjustment.modifier, scandalAdjustment.diceModifier) * activeScandalCount
    : 0;
  const neutralExpectedScore = averagePopularityScore - averageScandalPenalty;
  const neutralMinScore = minPopularityScore - maxScandalPenalty;
  const neutralMaxScore = maxPopularityScore - minScandalPenalty;

  const baseLine = venue
    ? `${band.genre} • Last booked as ${slotDisplayLabel(assignment?.slotKey || HEADLINER_SLOT)} at ${venue.type}: ${venue.name} • Popularity ${band.popularity} • Scandal ${effectiveScandalNotation(manager.id, band)}`
    : `${band.genre} • Popularity ${band.popularity} • Scandal ${effectiveScandalNotation(manager.id, band)}`;

  return {
    baseLine,
    scandalStatus: combineStatus(activeScandalCount ? `Active scandals on this band (${activeScandalCount})` : "No Active Scandal"),
    modifierLine: modifierDetails.join(" • "),
    adjustedRating,
    estimatedValue: neutralExpectedScore,
    scoreRange: `${formatVictoryPoints(neutralMinScore)} to ${formatVictoryPoints(neutralMaxScore)}`,
  };
}

function venueStrategicWeight(venue) {
  return venue.venuePoints * 6 + venue.revenueFactor * 10 - venue.cost * 0.2;
}

function genreLabel(key) {
  if (key === "rnb") {
    return "R&B";
  }
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function topGenreSignalsForVenue(venue, limit = 2) {
  if (!venue) {
    return [];
  }

  return GENRE_KEYS
    .map((key) => ({ key, value: venue[key] || 0 }))
    .filter((entry) => entry.value > 0)
    .sort((left, right) => right.value - left.value || left.key.localeCompare(right.key))
    .slice(0, limit);
}

function nextRoundFitSummaryForBand(band, round) {
  if (!band || !round?.venues?.length) {
    return "";
  }

  const fits = round.venues
    .map((venue) => ({
      venue,
      fit: genreFitScore(band, venue),
    }))
    .sort((left, right) => right.fit - left.fit || right.venue.revenueFactor - left.venue.revenueFactor || right.venue.venuePoints - left.venue.venuePoints);

  const best = fits[0];
  if (!best) {
    return "";
  }

  const positiveFits = fits.filter((entry) => entry.fit > 0);
  if (positiveFits.length >= 2) {
    return `Next round fit: best at ${best.venue.type}: ${best.venue.name} (${signedNumberLabel(best.fit)}), then ${positiveFits[1].venue.type}: ${positiveFits[1].venue.name} (${signedNumberLabel(positiveFits[1].fit)}).`;
  }

  if (best.fit > 0) {
    return `Next round fit: best at ${best.venue.type}: ${best.venue.name} (${signedNumberLabel(best.fit)}).`;
  }

  return `Next round fit: no strong genre match. Best option is ${best.venue.type}: ${best.venue.name} (${signedNumberLabel(best.fit)}).`;
}

function venueCompetitionSummary(roundData, venue) {
  const standings = state.managers
    .map((manager) => {
      const estimate = estimatedVenueStrength(manager, venue, roundData);
      return {
        managerId: manager.id,
        managerName: manager.name,
        bandName: estimate.bandLabel || "",
        bandLabel: estimate.bandLabel || "",
        performances: estimate.performances || [],
        expectedNotation: estimate.expectedNotation || "-",
        popularity: estimate.popularity,
        revenue: estimate.revenue,
      };
    })
    .sort((a, b) => b.popularity - a.popularity || b.revenue - a.revenue);

  const activeStandings = standings.filter((entry) => entry.bandName);
  const topScore = activeStandings[0]?.popularity ?? 0;
  const leaders = activeStandings.filter((entry) => entry.popularity === topScore && topScore >= 0);
  return { standings, leaders, topScore };
}

function bookingFeeForManager(manager, venuesForRound) {
  return venuesForRound.reduce((sum, venue) => (venueHasBooking(manager, venue.type) ? sum + venue.cost : sum), 0);
}

function payBookingFees() {
  const roundData = currentRoundData();
  if (!roundData || state.phase !== "booking_fees") {
    return;
  }

  state.managers.forEach((manager) => {
    const removedBookings = trimAssignmentsToBudget(manager, roundData.venues);
    if (removedBookings.length) {
      logEvent(`${manager.name} could not afford every booking and left these slots empty: ${removedBookings.join(", ")}.`);
    }
    const fee = bookingFeeForManager(manager, roundData.venues);
    if (fee > 0) {
      manager.cash -= fee;
      logEvent(`${manager.name} paid ${formatCash(fee)} in booking fees before the show.`);
    } else {
      logEvent(`${manager.name} had no booking fees to pay this round.`);
    }
  });

  if (state.showcase) {
    state.showcase.bookingFeesPaid = true;
  }
  state.lastCardActionText = "Booking fees are paid. The first venue is ready to resolve.";
  beginShowcaseForCurrentVenue();
}

function computeRoundResult(manager, venuesForRound) {
  const buildVenuePerformanceResult = (venue, band, slotKey) => {
    const slot = VENUE_SLOT_LOOKUP[slotKey] || VENUE_SLOT_LOOKUP[HEADLINER_SLOT];
    const persistentSmash = persistentSmashSummary(manager.id, band);
    const fit = genreFitScore(band, venue);
    const cardModifier = cardModifierFor(manager.id, venue.type, band);
    const roundBadSong = roundBadSongSummary(manager.id, venue.type, band, slot.key, manager.cash);
    const persistentBadSong = persistentBadSongSummary(manager.id, band);
    const badSongPenalty = roundBadSong.penalty + persistentBadSong.penalty;
    const badSongDiceModifier = (roundBadSong.diceModifier || 0) + (persistentBadSong.diceModifier || 0);
    const totalPopularityDiceModifier = (persistentSmash.diceBonus || 0) + badSongDiceModifier;
    const roll = rollNotationSignedWithModifier(band.popularity, 0, totalPopularityDiceModifier);
    const halvedRoll = halvedPopularityRollDetail(roll.detail, Math.max(0, roll.total), roundBadSong.halvedRoll);
    const roundScandal = roundScandalSummary(manager.id, venue.type, band);
    const persistentScandal = persistentScandalSummary(manager.id, venue.type, band);
    const scandalPenalty = roundScandal.penalty + persistentScandal.penalty;
    const venueSnowedOut = venueHasSnowstorm(venue.type) && !managerHasSnowTires(manager.id, venue.type);
    const forcedMiss = roundScandal.forcedMiss || venueSnowedOut || roundBadSong.forcedMiss;
    const nonScandalModifier = fit + cardModifier + persistentSmash.bonus - badSongPenalty;
    const preScandalPopularity = forcedMiss ? 0 : halvedRoll.total + nonScandalModifier;
    const rawFinalPopularity = forcedMiss ? 0 : preScandalPopularity - scandalPenalty;
    const finalPopularity = halvedShowValue(rawFinalPopularity, roundBadSong.halvedShow);
    const weightedScore = weightedVenueContribution(finalPopularity, slot.key);

    return {
      slotKey: slot.key,
      slotLabel: slot.label,
      multiplier: slot.multiplier,
      band,
      formulaNotation: `${formatAdjustedNotation(band.popularity, nonScandalModifier, totalPopularityDiceModifier)}${roundBadSong.halvedRoll ? " (roll halved)" : ""}${roundBadSong.halvedShow ? " (show halved)" : ""}`,
      rollTotal: halvedRoll.total,
      rollSignedTotal: halvedRoll.total,
      rollDetail: halvedRoll.detail,
      rolls: roll.rolls,
      rollModifier: roll.modifier,
      weightedRollTotal: weightedVenueContribution(halvedRoll.total, slot.key),
      fit,
      weightedFit: weightedVenueContribution(fit, slot.key),
      cardModifier,
      weightedCardModifier: weightedVenueContribution(cardModifier, slot.key),
      smashBonus: persistentSmash.bonus,
      weightedSmashBonus: weightedVenueContribution(persistentSmash.bonus, slot.key),
      smashDiceBonus: persistentSmash.diceBonus,
      smashDetail: persistentSmash.detail,
      badSongDiceModifier,
      badSongPenalty,
      weightedBadSongPenalty: weightedVenueContribution(badSongPenalty, slot.key),
      badSongDetail: [roundBadSong.detail, persistentBadSong.detail].filter(Boolean).join(" | "),
      contractCost: roundBadSong.contractCanPay ? roundBadSong.contractCost : 0,
      contractCanPay: roundBadSong.contractCanPay,
      halvedRoll: roundBadSong.halvedRoll,
      halvedShow: roundBadSong.halvedShow,
      noRevenue: roundBadSong.noRevenue,
      scandalPenalty,
      weightedScandalPenalty: weightedVenueContribution(scandalPenalty, slot.key),
      scandalDetail: [roundScandal.detail, persistentScandal.detail].filter(Boolean).join(" | "),
      scandalRollDetail: [roundScandal.chartDetail, persistentScandal.chartDetail].filter(Boolean).join(" | "),
      activeScandals: activeScandalCountForBand(manager.id, venue.type, band),
      forcedMiss,
      venueSnowedOut,
      nonScandalModifier,
      preScandalScore: preScandalPopularity,
      weightedPreScandalScore: weightedVenueContribution(preScandalPopularity, slot.key),
      rawFinalScore: rawFinalPopularity,
      score: finalPopularity,
      weightedScore,
      revenue: roundBadSong.noRevenue ? 0 : Math.max(0, weightedScore) * venue.revenueFactor,
    };
  };

  const venueResults = venuesForRound.map((venue) => {
    const advertisingBonus = advertisingBonusForVenue(manager.id, state.round, venue.type);
    const venueSnowedOut = venueHasSnowstorm(venue.type) && !managerHasSnowTires(manager.id, venue.type);
    const performances = getAssignedBandEntries(manager, venue.type)
      .map((entry) => {
        const band = getBandByName(manager, entry.bandName);
        return band ? buildVenuePerformanceResult(venue, band, entry.key) : null;
      })
      .filter(Boolean);

    if (!performances.length) {
      return {
        venue,
        band: null,
        bandLabel: "",
        performances: [],
        formulaNotation: "-",
        rollTotal: 0,
        rollSignedTotal: 0,
        rollDetail: "-",
        rolls: [],
        rollModifier: 0,
        fit: 0,
        cardModifier: 0,
        smashBonus: 0,
        smashDiceBonus: 0,
        smashDetail: "",
        advertisingBonus: 0,
        badSongPenalty: 0,
        badSongDetail: "",
        scandalPenalty: 0,
        scandalDetail: "",
        scandalRollDetail: "",
        forcedMiss: false,
        venueSnowedOut: false,
        refund: 0,
        preScandalScore: 0,
        score: 0,
        revenue: 0,
      };
    }

    const rollTotal = performances.reduce((sum, performance) => sum + performance.weightedRollTotal, 0);
    const fit = performances.reduce((sum, performance) => sum + performance.weightedFit, 0);
    const cardModifier = performances.reduce((sum, performance) => sum + performance.weightedCardModifier, 0);
    const smashBonus = performances.reduce((sum, performance) => sum + performance.weightedSmashBonus, 0);
    const smashDiceBonus = performances.reduce((sum, performance) => sum + performance.smashDiceBonus, 0);
    const badSongPenalty = performances.reduce((sum, performance) => sum + performance.weightedBadSongPenalty, 0);
    const contractCost = performances.reduce((sum, performance) => sum + (performance.contractCost || 0), 0);
    const scandalPenalty = performances.reduce((sum, performance) => sum + performance.weightedScandalPenalty, 0);
    const preScandalScore = performances.reduce((sum, performance) => sum + performance.weightedPreScandalScore, 0);
    const effectiveAdvertisingBonus = venueSnowedOut ? 0 : advertisingBonus;
    const score = performances.reduce((sum, performance) => sum + performance.weightedScore, 0) + effectiveAdvertisingBonus;
    const revenueMultiplier = televisedConcertRevenueMultiplier(venue.type) * globalRevenueClimateMultiplier();
    const bandRevenue = performances.reduce((sum, performance) => sum + (performance.revenue || 0), 0);
    const advertisingRevenue = Math.max(0, effectiveAdvertisingBonus) * venue.revenueFactor;
    const showRevenue = (bandRevenue + advertisingRevenue) * revenueMultiplier;
    const refund = (venueSnowedOut ? venue.cost : 0) + bookingFeeRefundForVenue(manager.id, venue.type, venue.cost);
    const revenue = showRevenue + refund;

    return {
      venue,
      band: performances[0]?.band || null,
      bandLabel: bookingEntriesLabel(
        performances.map((performance) => ({ bandName: performance.band.name, key: performance.slotKey })),
        {}
      ),
      performances,
      formulaNotation: performances
        .map((performance) => `${bookingBandLabel(performance.band.name, performance.slotKey, { includeMultiplier: true })}: ${performance.formulaNotation}`)
        .join(" • "),
      rollTotal,
      rollSignedTotal: rollTotal,
      rollDetail: performances
        .map((performance) => `${bookingBandLabel(performance.band.name, performance.slotKey)}: ${performance.rollDetail}${slotMultiplierText(performance.slotKey) ? `${slotMultiplierText(performance.slotKey)}=${performance.weightedRollTotal}` : ""}`)
        .join(" | "),
      rolls: performances.flatMap((performance) => performance.rolls),
      rollModifier: performances.reduce((sum, performance) => sum + performance.rollModifier, 0),
      fit,
      cardModifier,
      smashBonus,
      smashDiceBonus,
      advertisingBonus: effectiveAdvertisingBonus,
      smashDetail: performances
        .map((performance) => (performance.smashDetail ? `${performance.band.name}: ${performance.smashDetail}` : ""))
        .filter(Boolean)
        .join(" | "),
      badSongPenalty,
      contractCost,
      badSongDetail: performances
        .map((performance) => (performance.badSongDetail ? `${performance.band.name}: ${performance.badSongDetail}` : ""))
        .filter(Boolean)
        .join(" | "),
      scandalPenalty,
      scandalDetail: performances
        .map((performance) => (performance.scandalDetail ? `${performance.band.name}: ${performance.scandalDetail}` : ""))
        .filter(Boolean)
        .join(" | "),
      scandalRollDetail: performances
        .map((performance) => (performance.scandalRollDetail ? `${performance.band.name}: ${performance.scandalRollDetail}` : ""))
        .filter(Boolean)
        .join(" | "),
      forcedMiss: performances.every((performance) => performance.forcedMiss),
      venueSnowedOut,
      nonScandalModifier: performances.reduce(
        (sum, performance) => sum + weightedVenueContribution(performance.nonScandalModifier, performance.slotKey),
        0
      ),
      preScandalScore,
      score,
      refund,
      revenue,
      revenueMultiplier,
    };
  });

  return {
    venueResults,
    profit: venueResults.reduce((sum, result) => sum + result.revenue, 0),
  };
}

function showcaseCurrentBundle() {
  if (!state.showcase) {
    return null;
  }

  const roundData = currentRoundData();
  if (!roundData) {
    return null;
  }

  const venueIndex = state.showcase.venueIndex;
  return {
    venueIndex,
    venue: roundData.venues[venueIndex],
    revealOrder: state.showcase.venueOrders[venueIndex] || [],
  };
}

function showcaseDisplayVenueIndex() {
  if (!state.showcase) {
    return 0;
  }

  const settled = state.showcase.settledVenueIndices || [];
  const currentHasRevealState = Boolean((state.showcase.venueOrders?.[state.showcase.venueIndex] || []).length) || state.phase === "results";
  const available = new Set(settled);
  if (currentHasRevealState) {
    available.add(state.showcase.venueIndex);
  }

  const requested = state.showcase.viewVenueIndex ?? state.showcase.venueIndex;
  if (available.has(requested)) {
    return requested;
  }
  if (settled.length) {
    return Math.max(...settled);
  }
  return state.showcase.venueIndex;
}

function showcaseDisplayBundle() {
  if (!state.showcase) {
    return null;
  }

  const roundData = currentRoundData();
  if (!roundData) {
    return null;
  }

  const venueIndex = showcaseDisplayVenueIndex();
  return {
    venueIndex,
    venue: roundData.venues[venueIndex],
    revealOrder: state.showcase.venueOrders[venueIndex] || [],
  };
}

function showcaseStoredMessage(venueIndex) {
  if (!state.showcase) {
    return "";
  }
  if (venueIndex === state.showcase.venueIndex && !state.showcase.venueSettled) {
    return state.showcase.message;
  }
  return state.showcase.venueMessages?.[venueIndex] || "";
}

function setShowcaseViewVenueIndex(venueIndex) {
  if (!state.showcase) {
    return;
  }

  const settled = state.showcase.settledVenueIndices || [];
  const currentHasRevealState = Boolean((state.showcase.venueOrders?.[state.showcase.venueIndex] || []).length) || state.phase === "results";
  if (venueIndex !== state.showcase.venueIndex || !currentHasRevealState) {
    if (!settled.includes(venueIndex)) {
      return;
    }
  }

  state.showcase.viewVenueIndex = venueIndex;
  render();
}

function latestSettledVenueIndex() {
  if (!state.showcase?.settledVenueIndices?.length) {
    return -1;
  }
  return Math.max(...state.showcase.settledVenueIndices);
}

function showcaseSelectedManagerId(bundle, fallbackManagerId = "") {
  if (!state.showcase || !bundle) {
    return "";
  }

  const stored = state.showcase.selectedManagerIds?.[bundle.venueIndex] || "";
  if (stored && bundle.revealOrder.includes(stored)) {
    return stored;
  }
  if (fallbackManagerId && bundle.revealOrder.includes(fallbackManagerId)) {
    return fallbackManagerId;
  }
  return bundle.revealOrder[0] || "";
}

function setShowcaseSelectedManager(venueIndex, managerId) {
  if (!state.showcase || !managerId) {
    return;
  }

  state.showcase.selectedManagerIds = {
    ...(state.showcase.selectedManagerIds || {}),
    [venueIndex]: managerId,
  };
  render();
}

function showcaseVenueHasScandalPhase(bundle = showcaseCurrentBundle()) {
  if (!bundle?.revealOrder?.length) {
    return false;
  }

  return bundle.revealOrder.some((managerId) => {
    const entry = showcaseResultEntry(bundle.venueIndex, managerId);
    return Boolean(entry?.performances?.length && (entry.scandalPenalty || entry.scandalRollDetail || entry.forcedMiss));
  });
}

function showcaseFinalRevealPhase(bundle = showcaseCurrentBundle()) {
  if (!bundle?.revealOrder?.length) {
    return 0;
  }
  return showcaseVenueHasScandalPhase(bundle) ? 2 : 1;
}

function showcasePendingMessage(bundle = showcaseCurrentBundle()) {
  if (!bundle || !state.showcase || state.showcase.venueSettled) {
    return "";
  }

  if (!bundle.revealOrder.length) {
    return `All acts at ${bundle.venue.name} are revealed. Press Continue Show to award Victory Points and payouts.`;
  }

  if (state.showcase.revealPhase === 0) {
    return "Next: Roll popularity for all lineups.";
  }
  if (state.showcase.revealPhase === 1 && showcaseVenueHasScandalPhase(bundle)) {
    return "Next: Resolve scandals for all lineups.";
  }
  return `All acts at ${bundle.venue.name} are revealed. Press Continue Show to award Victory Points and payouts.`;
}

function showcaseResultEntry(venueIndex, managerId) {
  const summary = state.roundResults.find((item) => item.manager.id === managerId);
  return summary ? summary.result.venueResults[venueIndex] : null;
}

function formatResolvedRoll(detail, signedTotal) {
  if (!detail || detail === "-") {
    return "—";
  }
  return detail === `${signedTotal}` ? detail : `${detail}=${signedTotal}`;
}

function slotAdjustedLabel(baseLabel, weightedValue, slotKey, weightedFormatter = (value) => `${value}`) {
  const slot = VENUE_SLOT_LOOKUP[slotKey] || VENUE_SLOT_LOOKUP[HEADLINER_SLOT];
  return slot.multiplier === 1 ? baseLabel : `${baseLabel} x${slot.multiplier}=${weightedFormatter(weightedValue)}`;
}

function showcaseSetupScore(entry) {
  if (!entry?.performances?.length) {
    return null;
  }

  return entry.fit + entry.cardModifier + entry.smashBonus - entry.badSongPenalty + (entry.advertisingBonus || 0);
}

function showcaseVisibleScore(entry, visiblePhase, isResolvedRow = false) {
  if (!entry?.performances?.length) {
    return null;
  }
  if (isResolvedRow || visiblePhase >= 2) {
    return entry.score;
  }
  if (visiblePhase >= 1) {
    return entry.preScandalScore + (entry.advertisingBonus || 0);
  }
  return showcaseSetupScore(entry);
}

function showcaseVisiblePayout(entry, visibleScoreValue, venue, isResolvedRow = false) {
  if (!entry || visibleScoreValue === null || visibleScoreValue === undefined || !venue) {
    return null;
  }
  if (isResolvedRow) {
    return entry.revenue;
  }
  const revenueMultiplier = televisedConcertRevenueMultiplier(venue.type) * globalRevenueClimateMultiplier();
  const refund = entry.venueSnowedOut ? venue.cost : 0;
  return Math.max(0, visibleScoreValue) * venue.revenueFactor * revenueMultiplier + refund;
}

function buildShowcaseState(roundData) {
  const venueOrders = roundData.venues.map((venue) => {
    return state.managers
      .map((manager) => {
        const estimate = estimatedVenueStrength(manager, venue, roundData);
        return {
          managerId: manager.id,
          estimatedRevenue: estimate.revenue,
          estimatedPopularity: estimate.popularity,
          bandName: estimate.bandLabel || "",
        };
      })
      .filter((entry) => Boolean(entry.bandName))
      .sort((a, b) => a.estimatedRevenue - b.estimatedRevenue || a.estimatedPopularity - b.estimatedPopularity || a.bandName.localeCompare(b.bandName))
      .map((entry) => entry.managerId);
  });

  return {
    venueIndex: 0,
    viewVenueIndex: 0,
    revealPhase: 0,
    venueSettled: false,
    venueOrders,
    venueMessages: {},
    selectedManagerIds: {},
    message: "",
    bookingFeesPaid: true,
    roundProfitByManager: Object.fromEntries(state.managers.map((manager) => [manager.id, 0])),
    settledVenueIndices: [],
  };
}

function settleShowcaseVenue() {
  const bundle = showcaseCurrentBundle();
  if (!bundle || state.showcase.venueSettled) {
    return;
  }

  const stormActive = venueHasSnowstorm(bundle.venue.type);
  const ranked = [...state.roundResults]
    .map((summary) => ({
      manager: summary.manager,
      entry: summary.result.venueResults[bundle.venueIndex],
    }))
    .sort((a, b) => b.entry.score - a.entry.score || b.entry.revenue - a.entry.revenue);
  const activeRanked = ranked.filter((item) => item.entry.performances?.length && !item.entry.venueSnowedOut);
  const bestScore = activeRanked[0]?.entry.score ?? 0;
  const winners = activeRanked.filter((item) => item.entry.score === bestScore && bestScore >= 0);
  const splitPoints = winners.length ? bundle.venue.venuePoints / winners.length : 0;

  ranked.forEach(({ manager, entry }) => {
    if (entry.contractCost) {
      manager.cash -= entry.contractCost;
      logEvent(`${manager.name} paid ${formatCash(entry.contractCost)} in contract negotiations at ${bundle.venue.type}: ${bundle.venue.name}.`);
    }
    manager.cash += entry.revenue;
    manager.totalProfit += entry.revenue;
    if (state.showcase?.roundProfitByManager) {
      state.showcase.roundProfitByManager[manager.id] = (state.showcase.roundProfitByManager[manager.id] || 0) + entry.revenue;
    }
  });

  if (winners.length) {
    winners.forEach(({ manager }) => {
      manager.victoryPoints += splitPoints;
    });
    logEvent(`${winners.map((item) => item.manager.name).join(", ")} ${winners.length === 1 ? "won" : "split"} ${formatVictoryPoints(splitPoints)} Victory Point${splitPoints === 1 ? "" : "s"} at ${bundle.venue.type}: ${bundle.venue.name}.`);
  } else if (stormActive && ranked.some(({ entry }) => entry.venueSnowedOut)) {
    logEvent(`Snowstorm disrupted ${bundle.venue.type}: ${bundle.venue.name}. Affected promoters had booking fees returned.`);
  } else {
    logEvent(`Nobody won Victory Points at ${bundle.venue.type}: ${bundle.venue.name}.`);
  }

  const settlementMessage = winners.length
    ? `${winners.map((item) => item.manager.name).join(", ")} ${winners.length === 1 ? "earns" : "earn"} ${formatVictoryPoints(splitPoints)} Victory Point${splitPoints === 1 ? "" : "s"} at ${bundle.venue.type}: ${bundle.venue.name}. ${ranked.map(({ manager, entry }) => `${manager.name} earns ${formatCash(entry.revenue)}`).join(" • ")}.`
    : stormActive && ranked.some(({ entry }) => entry.venueSnowedOut)
      ? `Snowstorm hit ${bundle.venue.type}: ${bundle.venue.name}. ${ranked.map(({ manager, entry }) => `${manager.name} earns ${formatCash(entry.revenue)}`).join(" • ")}.`
    : `Nobody takes ${bundle.venue.type}: ${bundle.venue.name}. ${ranked.map(({ manager, entry }) => `${manager.name} earns ${formatCash(entry.revenue)}`).join(" • ")}.`;
  state.showcase.venueSettled = true;
  state.showcase.settledVenueIndices = [...new Set([...(state.showcase.settledVenueIndices || []), bundle.venueIndex])];
  state.showcase.venueMessages = {
    ...(state.showcase.venueMessages || {}),
    [bundle.venueIndex]: settlementMessage,
  };
  state.showcase.message = settlementMessage;
  state.showcase.viewVenueIndex = bundle.venueIndex;
}

function finishShowcaseRound() {
  const roundProfits = state.managers
    .map((manager) => ({
      manager,
      profit: state.showcase?.roundProfitByManager?.[manager.id] || 0,
    }))
    .sort((a, b) => b.profit - a.profit);

  roundProfits.forEach((summary, index) => {
    logEvent(`${index === 0 ? "Winner" : "Show"}: ${summary.manager.name} earned ${formatCash(summary.profit)} this round.`);
  });

  snapshotLastWeekBandResults();
  updateBandCareerLedger();
  state.showcase = null;

  if (state.managers.some((manager) => manager.victoryPoints >= VICTORY_TARGET)) {
    state.phase = "complete";
    render();
    return;
  }

  resolveRevenueClimateContinuation();
  discardUnusedRoundLockedSelfBadSongs();

  state.managers.forEach((manager) => {
    const drawn = drawToHandSize(manager);
    if (drawn > 0) {
      logEvent(`${manager.name} drew ${drawn} World Tour card${drawn === 1 ? "" : "s"} and refilled to ${manager.hand.length}.`);
    }
  });

  initializeRetentionChoices();
  state.phase = "retention";
  state.activeWorkspace = "bands";
  state.activeSidebarView = "your_bands";
  render();
}

function advanceShowcase() {
  if (!state.showcase) {
    return;
  }

  const bundle = showcaseCurrentBundle();
  if (!bundle) {
    return;
  }

  if (!state.showcase.venueSettled) {
    const finalRevealPhase = showcaseFinalRevealPhase(bundle);
    if (state.showcase.revealPhase < finalRevealPhase) {
      state.showcase.revealPhase += 1;
      state.showcase.message = showcasePendingMessage(bundle);
      render();
      return;
    }

    settleShowcaseVenue();
    render();
    return;
  }

  if (state.showcase.venueIndex < ROUND_VENUE_ORDER.length - 1) {
    state.currentVenueCardIndex = state.showcase.venueIndex + 1;
    resetVenueCardTurn(currentRoundData());
    state.phase = "cards";
    state.activeWorkspace = "cards";
    state.activeSidebarView = "your_cards";
    state.showcase.venueIndex = state.currentVenueCardIndex;
    state.showcase.revealPhase = 0;
    state.showcase.venueSettled = false;
    state.showcase.message = showcasePendingMessage();
    advanceCardTurns();
    render();
    return;
  }

  finishShowcaseRound();
}

function runShow() {
  const roundData = currentRoundData();
  if (!roundData || state.phase !== "ready") {
    return;
  }

  state.phase = "results";
  state.activeWorkspace = "results";
  state.activeSidebarView = "results";
  state.roundResults = state.managers.map((manager) => {
    const result = computeRoundResult(manager, roundData.venues);
    return { manager, result };
  });
  state.showcase = buildShowcaseState(roundData);
  state.showcase.message = showcasePendingMessage(showcaseCurrentBundle());

  render();
}

function renderSchedule() {
  const roundsToShow = state.phase === "advertising" ? visibleFutureRounds() : upcomingRounds();
  els.schedulePreview.innerHTML = roundsToShow
    .map(
      (round) => `
        <button class="schedule-card ${round.roundNumber === state.round ? "current-round" : ""} ${round.roundNumber === state.selectedPreviewRound ? "selected-round" : ""}" data-preview-round="${round.roundNumber}">
          <strong>Round ${round.roundNumber}</strong>
          <p>${state.phase === "advertising" ? "Face-down advertising stays hidden to opponents until that round begins." : "Plan around the genre bonuses across A, B, and C."}</p>
          <div class="schedule-venues">
            ${round.venues
              .map((venue) => {
                const markers = advertisingMarkersForVenue(round.roundNumber, venue.type, "player");
                const genreSignals = topGenreSignalsForVenue(venue)
                  .map((entry) => `${genreLabel(entry.key)} ${signedNumberLabel(entry.value)}`)
                  .join(" • ");
                return `
                  <span class="chip schedule-venue-chip">
                    <span>${venue.type}: ${venue.name} (${venue.venuePoints} VP, x${venue.revenueFactor}, fee ${formatCash(venue.cost)})</span>
                    ${genreSignals ? `<span class="schedule-ad-line">Best genres: ${genreSignals}</span>` : ""}
                    ${markers.length ? `<span class="schedule-ad-line">Ads ${markers.join(" • ")}</span>` : ""}
                  </span>
                `;
              })
              .join("")}
          </div>
        </button>
      `
    )
    .join("");
}

function renderVenuePanel() {
  const roundData = selectedRoundData();
  if (!roundData) {
    return;
  }

  const strongestGenre = GENRE_KEYS.map((key) => ({
    key,
    total: roundData.venues.reduce((sum, venue) => sum + venue[key], 0),
  })).sort((a, b) => b.total - a.total)[0];
  const isCurrentRound = roundData.roundNumber === state.round;
  els.venueName.textContent = isCurrentRound ? `Round ${state.round} Venue Set` : `Round ${roundData.roundNumber} Preview`;
  els.venueMeta.innerHTML = [
    ["Victory Points", `${roundData.venues.reduce((sum, venue) => sum + venue.venuePoints, 0)} total VP`],
    ["Payout", roundData.venues.map((venue) => `${venue.type} x${venue.revenueFactor}`).join(" • ")],
    ["Best Genre Signal", `${strongestGenre.key === "rnb" ? "R&B" : strongestGenre.key} ${strongestGenre.total >= 0 ? "+" : ""}${strongestGenre.total}`],
  ]
    .map(([label, value]) => `<div class="mini-stat">${label}<strong>${value}</strong></div>`)
    .join("");

  els.venueCards.innerHTML = roundData.venues
    .map(
      (venue) => `
        <article class="venue-card">
          ${renderVenuePhoto(venue.name)}
          <div class="section-heading">
            <div>
              <h4>${venue.name}</h4>
            </div>
            <span class="tag">Payout x${venue.revenueFactor}</span>
          </div>
          <p><strong>${venue.venuePoints} Victory Point${venue.venuePoints === 1 ? "" : "s"}</strong> • Fee ${formatCash(venue.cost)} • Capacity ${(venue.capacity || 0).toLocaleString()}</p>
          <p class="venue-description">${venue.description || "A live room waiting for the right act."}</p>
          <div class="genre-grid genre-fit-list">
            ${GENRE_KEYS.map((key) => {
              const fit = venue[key];
              const fitClass = fit > 0 ? "positive" : fit < 0 ? "negative" : "neutral";
              const label = key === "rnb" ? "R&B" : key;
              const value = `${fit >= 0 ? "+" : ""}${fit}`;
              return `<div class="genre-cell ${fitClass}"><span>${label}</span><strong>${value}</strong></div>`;
            }).join("")}
          </div>
        </article>
      `
    )
    .join("");
}

function snapshotLastWeekBandResults() {
  const snapshot = {};

  state.roundResults.forEach(({ manager, result }) => {
    const managerSnapshot = {};
    result?.venueResults?.forEach((venueResult) => {
      venueResult.performances.forEach((performance) => {
        managerSnapshot[performance.band.name] = {
          earnings: performance.revenue,
          score: performance.weightedScore,
          venueName: venueResult.venue.name,
          venueType: venueResult.venue.type,
          slotKey: performance.slotKey,
        };
      });
    });
    snapshot[manager.id] = managerSnapshot;
  });

  state.lastWeekBandSnapshot = snapshot;
}

function updateBandCareerLedger() {
  state.roundResults.forEach(({ manager, result }) => {
    result?.venueResults?.forEach((venueResult) => {
      venueResult.performances.forEach((performance) => {
        const existing = state.bandCareerLedger[performance.band.name] || {
          bandName: performance.band.name,
          totalGross: 0,
          appearances: 0,
          bestNight: 0,
          lastGross: 0,
          lastRound: 0,
          lastVenueName: "",
          lastVenueType: "",
          lastManagerId: "",
          lastManagerName: "",
        };

        state.bandCareerLedger[performance.band.name] = {
          ...existing,
          totalGross: existing.totalGross + performance.revenue,
          appearances: existing.appearances + 1,
          bestNight: Math.max(existing.bestNight, performance.revenue),
          lastGross: performance.revenue,
          lastRound: state.round,
          lastVenueName: venueResult.venue.name,
          lastVenueType: venueResult.venue.type,
          lastManagerId: manager.id,
          lastManagerName: manager.name,
        };
      });
    });
  });
}

function currentBandOwnerByName(bandName) {
  return state.managers.find((manager) => manager.roster.some((band) => band.name === bandName)) || null;
}

function projectedWeeklyStandouts(roundData, limit = WEEKLY_STANDOUT_LIMIT) {
  if (!roundData) {
    return [];
  }

  return state.managers
    .flatMap((manager) =>
      roundData.venues.flatMap((venue) => {
        const estimate = estimatedVenueStrength(manager, venue, roundData, { viewerManagerId: "player" });
        if (!estimate.performances.length) {
          return [];
        }

        const advertisingShare = estimate.advertisingBonus && estimate.performances.length
          ? estimate.advertisingBonus / estimate.performances.length
          : 0;

        return estimate.performances.map((performance) => {
          const lastWeek = state.lastWeekBandSnapshot?.[manager.id]?.[performance.band.name] || null;
          const projectedScore = performance.weightedScore + advertisingShare;
          const projectedRevenue = Math.max(0, projectedScore) * venue.revenueFactor;

          return {
            manager,
            venue,
            performance,
            advertisingShare,
            projectedScore,
            projectedRevenue,
            lastWeek,
          };
        });
      })
    )
    .sort(
      (a, b) =>
        b.projectedScore - a.projectedScore ||
        b.projectedRevenue - a.projectedRevenue ||
        a.performance.band.name.localeCompare(b.performance.band.name)
    )
    .slice(0, limit);
}

function renderProjectedStandouts(roundData, options = {}) {
  const {
    panelClass = "stack-item standout-panel",
    limit = 5,
    emptyMessage = "",
  } = options;
  const standouts = projectedWeeklyStandouts(roundData, limit);
  if (!standouts.length) {
    return emptyMessage ? `<div class="${panelClass}"><p>${emptyMessage}</p></div>` : "";
  }

  return `
    <div class="${panelClass}">
      <div class="standout-panel-head">
        <div>
          <strong>Projected Standouts</strong>
          <p>Booked bands ranked by this week's projected show score after fit, cards, and visible ads.</p>
        </div>
      </div>
      <div class="standout-list">
        ${standouts
          .map((entry, index) => {
            const { manager, venue, performance, projectedScore, projectedRevenue, lastWeek, advertisingShare } = entry;
            return `
              <article class="standout-item">
                <div class="standout-item-top">
                  <div class="standout-rank">#${index + 1}</div>
                  <div class="standout-band-block">
                    ${renderBandPhoto(performance.band.name, "standout-band-photo")}
                    <div class="standout-copy">
                      <div class="standout-title-row">
                        <strong>${performance.band.name}</strong>
                        ${performance.slotKey !== HEADLINER_SLOT ? `<span class="standout-role">${slotDisplayLabel(performance.slotKey)}</span>` : ""}
                      </div>
                      <div class="standout-promoter">${manager.name}</div>
                    </div>
                  </div>
                  <div class="standout-score">
                    <strong>${formatVictoryPoints(projectedScore)}</strong>
                    <span>Projected</span>
                  </div>
                </div>
                <div class="standout-meta">
                  <span>${venue.type}: ${venue.name}</span>
                  <span>${slotDisplayLabel(performance.slotKey)}</span>
                  ${advertisingShare ? `<span>Ads +${formatVictoryPoints(advertisingShare)}</span>` : ""}
                </div>
                <div class="standout-stat-row">
                  <div class="standout-stat">
                    <span>Est. payout</span>
                    <strong>${formatCash(projectedRevenue)}</strong>
                  </div>
                  <div class="standout-stat">
                    <span>Last week</span>
                    <strong>${lastWeek ? formatCash(lastWeek.earnings) : "—"}</strong>
                  </div>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderStandoutsPanel() {
  if (!els.standoutsPanel) {
    return;
  }

  const roundData = currentRoundData();
  if (!roundData) {
    els.standoutsPanel.innerHTML = "";
    return;
  }

  els.standoutsPanel.innerHTML = renderProjectedStandouts(roundData, {
    panelClass: "standout-panel standout-workspace-panel",
    limit: 5,
    emptyMessage: "Set your bookings to see this week’s projected headliners.",
  });
}

function topEarnerEntries(limit = 8) {
  return Object.values(state.bandCareerLedger)
    .sort(
      (a, b) =>
        b.totalGross - a.totalGross ||
        b.bestNight - a.bestNight ||
        a.bandName.localeCompare(b.bandName)
    )
    .slice(0, limit);
}

function renderTopEarnersMarkup(options = {}) {
  const {
    panelClass = "standout-panel standout-workspace-panel",
    title = "Top Earning Bands",
    description = "Career gross tracks each act’s total show earnings before venue booking fees.",
    emptyMessage = "No tour revenue has been settled yet. Once venues finish, the top earning bands will show up here.",
    limit = 8,
  } = options;
  const entries = topEarnerEntries(limit);

  if (!entries.length) {
    return `
      <div class="${panelClass}">
        <p>${emptyMessage}</p>
      </div>
    `;
  }

  return `
    <div class="${panelClass}">
      <div class="standout-panel-head">
        <div>
          <strong>${title}</strong>
          <p>${description}</p>
        </div>
      </div>
      <div class="standout-list">
        ${entries
          .map((entry, index) => {
            const currentOwner = currentBandOwnerByName(entry.bandName);
            const promoterLabel = currentOwner ? currentOwner.name : entry.lastManagerName || "No current promoter";
            const latestShowLabel =
              entry.lastRound && entry.lastVenueName
                ? `R${entry.lastRound} ${entry.lastVenueType}: ${entry.lastVenueName}`
                : "—";

            return `
              <article class="standout-item">
                <div class="standout-item-top">
                  <div class="standout-rank">#${index + 1}</div>
                  <div class="standout-band-block">
                    ${renderBandPhoto(entry.bandName, "standout-band-photo")}
                    <div class="standout-copy">
                      <div class="standout-title-row">
                        <strong>${entry.bandName}</strong>
                      </div>
                      <div class="standout-promoter">${promoterLabel}</div>
                    </div>
                  </div>
                  <div class="standout-score">
                    <strong>${formatCash(entry.totalGross)}</strong>
                    <span>Gross</span>
                  </div>
                </div>
                <div class="standout-meta">
                  <span>${entry.appearances} ${entry.appearances === 1 ? "show" : "shows"}</span>
                  <span>Latest ${latestShowLabel}</span>
                </div>
                <div class="standout-stat-row">
                  <div class="standout-stat">
                    <span>Last show</span>
                    <strong>${formatCash(entry.lastGross)}</strong>
                  </div>
                  <div class="standout-stat">
                    <span>Best night</span>
                    <strong>${formatCash(entry.bestNight)}</strong>
                  </div>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderTopEarnersPanel() {
  if (!els.topEarnersPanel) {
    return;
  }

  els.topEarnersPanel.innerHTML = renderTopEarnersMarkup();
}

function endgameSynopsisForWinner(winner, runnerUp) {
  const reasons = [];
  const winnerContracts = contractLoad(winner);
  const runnerUpContracts = runnerUp ? contractLoad(runnerUp) : 0;
  const winnerTopEarners = topEarnerEntries(8).filter((entry) => currentBandOwnerByName(entry.bandName)?.id === winner.id);
  const winnerBestBand = winnerTopEarners[0] || null;
  const richest = [...state.managers].sort((a, b) => b.cash - a.cash || b.victoryPoints - a.victoryPoints)[0];
  const deepestRoster = [...state.managers].sort((a, b) => b.roster.length - a.roster.length || b.victoryPoints - a.victoryPoints)[0];

  if (winnerBestBand) {
    reasons.push(`${winner.name} got major mileage from ${winnerBestBand.bandName}, which finished among the tour's biggest earners at ${formatCash(winnerBestBand.totalGross)} gross.`);
  }

  if (winnerTopEarners.length >= 2) {
    reasons.push(`${winner.name} spread success across the roster, finishing with ${winnerTopEarners.length} acts in the Top Earners list instead of relying on only one star.`);
  }

  if (richest?.id === winner.id) {
    reasons.push(`${winner.name} also finished with the most cash at ${formatCash(winner.cash)}, which usually means better auction freedom and fewer late-round compromises.`);
  }

  if (deepestRoster?.id === winner.id) {
    reasons.push(`${winner.name} carried the deepest roster at ${winner.roster.length} bands, giving them more ways to cover venues and recover from bad draws or bad cards.`);
  }

  if (runnerUp && winner.victoryPoints - runnerUp.victoryPoints >= 8) {
    reasons.push(`${winner.name} won by ${formatVictoryPoints(winner.victoryPoints - runnerUp.victoryPoints)} VP over ${runnerUp.name}, which suggests a steady tour-long edge rather than one lucky finish.`);
  }

  if (runnerUp && winnerContracts <= runnerUpContracts - 15) {
    reasons.push(`${winner.name} stayed lighter on contract costs than ${runnerUp.name}, which likely helped them stay flexible while still converting good shows into points.`);
  } else if (runnerUp && winnerContracts >= runnerUpContracts + 15) {
    reasons.push(`${winner.name} was willing to carry heavier contracts than ${runnerUp.name}, and those bigger commitments paid off before the bills became a problem.`);
  }

  if (!reasons.length) {
    reasons.push(`${winner.name} put together the cleanest all-around tour: enough points, enough cash, and enough productive bands at the right times to stay ahead.`);
  }

  return reasons.slice(0, 3);
}

function renderAdvertisingWorkspacePanel() {
  if (!els.advertisingPanel) {
    return;
  }

  const rounds = visibleFutureRounds();
  const player = state.managers[0];
  if (!rounds.length) {
    els.advertisingPanel.innerHTML = `
      <div class="standout-panel standout-workspace-panel">
        <p>No future rounds are visible right now, so there is no advertising board to inspect.</p>
      </div>
    `;
    return;
  }

  const availableTiles = advertisingTilesForManager(player);

  els.advertisingPanel.innerHTML = `
    <section class="advertising-board-panel">
      <div class="standout-panel-head">
        <div>
          <strong>Advertising Outlook</strong>
          <p>Your future buys show exact values. Rival buys stay hidden until that round begins, but you can still see where they parked them.</p>
        </div>
      </div>
      <div class="advertising-outlook-meta">
        <span class="chip">Your cash ${formatCash(player.cash)}</span>
        <span class="chip">Buys left ${availableTiles.length ? availableTiles.map((value) => `+${value}`).join(" ") : "None"}</span>
      </div>
      <div class="advertising-board">
        ${rounds
          .map(
            (round) => `
              <section class="advertising-round-card">
                <div class="cards-queue-heading-row">
                  <strong>Round ${round.roundNumber}</strong>
                  <span>Face-down buys stay hidden to opponents until that round begins.</span>
                </div>
                <div class="advertising-venue-grid">
                  ${round.venues
                    .map((venue) => {
                      const markers = state.managers
                        .map((manager) => {
                          const placements = managerAdvertisingPlacementsForVenue(manager.id, round.roundNumber, venue.type);
                          if (!placements.length) {
                            return "";
                          }
                          const visibleToPlayer = placements.every((placement) => isAdvertisingRevealed(placement) || placement.managerId === player.id);
                          return `
                            <div class="advertising-marker-row">
                              <strong>${manager.name}</strong>
                              <span>${visibleToPlayer ? placements.map((placement) => `+${placement.value}`).join(" ") : `${placements.length} hidden`}</span>
                            </div>
                          `;
                        })
                        .filter(Boolean)
                        .join("");

                      return `
                        <article class="advertising-venue-card read-only">
                          <div class="advertising-venue-head">
                            <strong>${venue.type}: ${venue.name}</strong>
                            <span>${venue.venuePoints} VP • x${venue.revenueFactor}</span>
                          </div>
                          <p>Fee ${formatCash(venue.cost)} • ${venue.description || "Future venue."}</p>
                          <div class="advertising-marker-list">
                            ${markers || `<div class="advertising-marker-row empty"><span>No advertising on this venue yet.</span></div>`}
                          </div>
                        </article>
                      `;
                    })
                    .join("")}
                </div>
              </section>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderAssignments() {
  const roundData = currentRoundData();
  const player = state.managers[0];
  const availableBands = availableRosterForRound(player);
  if (!roundData) {
    els.assignmentGrid.innerHTML = "";
    return;
  }

  const formatProjectedScore = (value) => (Number.isInteger(value) ? `${value}` : value.toFixed(1));

  const assignmentIntro =
    state.phase === "auction" && state.marketBands.every((band) => band.resolved) && state.reviewingAssignments
      ? `<div class="stack-item"><strong>Assign Your Bands To Their Venues</strong><p>The game has suggested the most profitable default bookings for this round. You can switch them around before moving on to the card phase.</p></div>`
      : "";

  const venueSelectors = roundData.venues
    .map(
      (venue) => {
        const booking = getVenueBooking(player, venue.type);
        const renderSelect = (slotKey) => `
          <label class="field-label">
            <span>${slotDisplayLabel(slotKey)}</span>
            <select class="assignment-select" data-assign-venue="${venue.type}" data-assign-slot="${slotKey}" ${state.phase !== "auction" ? "disabled" : ""}>
              <option value="">${slotKey === HEADLINER_SLOT ? "No band assigned" : "No opener assigned"}</option>
              ${availableBands
                .map((band) => `<option value="${band.name}" ${booking[slotKey] === band.name ? "selected" : ""}>${band.name} (${band.genre})</option>`)
                .join("")}
            </select>
          </label>
        `;

        return `
          <div class="assignment-card">
            <strong>${venue.type}: ${venue.name}</strong>
            <p>${venue.venuePoints} VP • Fee ${formatCash(venue.cost)} once • Payout x${venue.revenueFactor}</p>
            ${renderSelect(HEADLINER_SLOT)}
            ${renderSelect(OPENER_SLOT)}
            ${booking.specialGuest ? `<div class="assignment-extra-slot"><strong>Special Guest</strong><p>${booking.specialGuest} performs here at full strength this week.</p></div>` : ""}
          </div>
        `;
      }
    )
    .join("");

  const bandValueCards = availableBands.length
    ? `
      <div class="stack-item venue-value-card venue-value-table-card">
        <strong>This Week's Band Values</strong>
        <p>Projected score shows headliner strength before venue fees and before scandal rolls. Use the Scandal column to judge downside. Openers still contribute at 60%.</p>
        <div class="venue-value-table">
          <div class="venue-value-row venue-value-head">
            <div>Band</div>
            <div>Popularity</div>
            <div>Scandal</div>
            ${roundData.venues.map((venue) => `<div>${venue.name}</div>`).join("")}
          </div>
          ${availableBands
            .map((band) => {
              const bandAssignment = findBandAssignment(player, band.name, roundData);
              const activePersistentScandals = state.persistentScandals.filter(
                (entry) => entry.targetManagerId === player.id && entry.bandName === band.name
              ).length;
              const persistentSmash = persistentSmashSummary(player.id, band);
              const persistentBadSong = persistentBadSongSummary(player.id, band);
              const popularityFlatModifier = (persistentSmash.bonus || 0) - (persistentBadSong.penalty || 0);
              const popularityDiceModifier = (persistentSmash.diceBonus || 0) + (persistentBadSong.diceModifier || 0);
              const adjustedPopularityNotation = formatAdjustedNotation(
                band.popularity,
                popularityFlatModifier,
                popularityDiceModifier
              );
              const popularityChanged = adjustedPopularityNotation !== band.popularity;
              const cells = roundData.venues
                .map((venue) => {
                  const projectedScore =
                    parseDiceAverageSignedWithModifier(band.popularity, popularityFlatModifier, popularityDiceModifier) +
                    genreFitScore(band, venue);
                  const fit = genreFitScore(band, venue);
                  const assignedHere = bandAssignment?.venueType === venue.type;
                  return `
                    <div class="venue-value-table-cell ${assignedHere ? "selected" : ""}">
                      <strong>${formatProjectedScore(projectedScore)}</strong>
                      <span>Fit ${fit >= 0 ? "+" : ""}${fit}</span>
                      ${assignedHere ? `<span>${slotDisplayLabel(bandAssignment.slotKey)}</span>` : ""}
                    </div>
                  `;
                })
                .join("");

              return `
                <div class="venue-value-row">
                  <div class="venue-value-band">
                    <strong>${band.name}</strong>
                    <span>${band.genre}</span>
                  </div>
                  <div class="venue-value-popularity">
                    <strong>${adjustedPopularityNotation}</strong>
                    ${popularityChanged ? `<span>Base ${band.popularity}</span>` : `<span>Adjusted</span>`}
                  </div>
                  <div class="venue-value-scandal">
                    <strong>${effectiveScandalNotation(player.id, band)}</strong>
                    <span>${activePersistentScandals ? `${activePersistentScandals} active` : "No active"}</span>
                  </div>
                  ${cells}
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    `
    : `<div class="stack-item"><strong>No active bands to assign</strong><p>Bands taking the week off will return next round.</p></div>`;

  els.assignmentGrid.innerHTML =
    assignmentIntro +
    venueSelectors +
    bandValueCards;
}

function placeMegaConcertFromInline() {
  const select = els.cardsPanel?.querySelector("[data-mega-concert-target]");
  resolvePlayerMegaConcertPlacement(select?.value || "");
}

function handleCardsPanelMegaConcertClick() {
  placeMegaConcertFromInline();
}

function bindCardsPanelInteractions() {
  if (!els.cardsPanel) {
    return;
  }
  els.cardsPanel.querySelectorAll("[data-place-mega-concert]").forEach((button) => {
    button.addEventListener("click", handleCardsPanelMegaConcertClick);
  });
}

function renderCardsPanel() {
  const roundData = currentRoundData();
  const player = state.managers[0];
  if (!roundData) {
    els.cardsPanel.innerHTML = "";
    return;
  }

  if (state.phase === "card_cleanup") {
    const selectedDiscards = new Set(cleanupDiscardChoicesForManager(player));
    const selectedCount = selectedDiscards.size;
    const cleanupCardsHtml = player.hand.length
      ? `
        <div class="tour-cards-grid compact-cards-grid playable-cards-grid">
          ${player.hand.map((card) => `
            <div class="tour-card compact-card">
              <strong>${cardDisplayHeading(card).heading}</strong>
              ${cardDisplayHeading(card).subtitle ? `<p class="card-subtitle">${cardDisplayHeading(card).subtitle}</p>` : ""}
              <p>${compactCardDescription(card)}</p>
              <label class="field-label">
                <input type="checkbox" data-discard-card="${card.id}" ${selectedDiscards.has(card.id) ? "checked" : ""}>
                Discard before next round
              </label>
            </div>
          `).join("")}
        </div>
      `
      : `<div class="cards-queue-empty cards-hand-empty">No cards left to discard.</div>`;

    els.cardsPanel.innerHTML = `
      <div class="cards-content-grid">
        <div class="cards-top-stack">
          <div class="stack-item">
            <strong>End Of Round Card Cleanup</strong>
            <p>Select any leftover World Tour cards you want to throw away now so you can see more fresh cards on the next refill. Selected: ${selectedCount}.</p>
          </div>
          ${cleanupCardsHtml}
        </div>
        <aside class="cards-queue-panel result-note">
          <div class="cards-queue-empty">${selectedCount ? `${selectedCount} card${selectedCount === 1 ? "" : "s"} will be discarded before the next redraw.` : "Keep your remaining hand as-is, or mark cards to throw away."}</div>
        </aside>
      </div>
    `;
    bindCardsPanelInteractions();
    return;
  }

  const pendingMegaEntry = currentMegaConcertEntry();
  if (state.pendingMegaConcert && pendingMegaEntry?.managerId === "player" && pendingMegaEntry.band) {
    const megaTargets = specialGuestVenueTargetsForManager(player, roundData);
    const targetOptions = megaTargets.map((target, index) => {
      const venue = roundData.venues.find((entry) => entry.type === target.venueType);
      const currentBooking = venue ? venueBookingLabel(player, target.venueType, { includeHeadlinerLabel: true }) : "";
      const fit = venue ? genreFitScore(pendingMegaEntry.band, venue) : 0;
      return `<option value="${encodeCardTarget(target)}" ${index === 0 ? "selected" : ""}>${target.venueType}: ${target.venueName}${currentBooking ? ` (${currentBooking})` : ""}${fit ? ` • fit ${signedNumberLabel(fit)}` : ""}</option>`;
    }).join("");
    els.cardsPanel.innerHTML = `
      <div class="cards-content-grid">
        <div class="cards-top-stack">
          <div class="stack-item">
            <strong>Mega Concert Placement</strong>
            <p>You drew <strong>${pendingMegaEntry.band.name}</strong>. As a Special Guest, place this band into one unresolved venue where you already have at least one act booked. Leaders place first, so your choice is locked in before lower-ranked promoters respond.</p>
          </div>
          <div class="tour-card compact-card">
            <strong>${pendingMegaEntry.band.name}</strong>
            <p>${pendingMegaEntry.band.genre} • Popularity ${pendingMegaEntry.band.popularity} • Scandal ${pendingMegaEntry.band.scandal} • Retention ${formatCash(pendingMegaEntry.band.retention)}</p>
            ${megaTargets.length ? `<select data-mega-concert-target>${targetOptions}</select>` : `<p>No unresolved booked venue is available, so this signing will stay on your roster for later rounds.</p>`}
            <button type="button" class="secondary-button play-card-button" data-place-mega-concert="1">${megaTargets.length ? "Place Special Guest" : "Continue"}</button>
          </div>
        </div>
        <aside class="cards-queue-panel result-note">
          <div class="cards-queue-empty">${pendingMegaEntry.band.name} performs for free this week and uses the Special Guest overflow slot.</div>
        </aside>
      </div>
    `;
    bindCardsPanelInteractions();
    return;
  }

  if (state.phase !== "cards") {
    const previewCardsHtml = player.hand.length
      ? `
        <div class="tour-cards-grid compact-cards-grid cards-stash-grid">
          ${player.hand.map((card) =>
            renderFullCard(card, {
              showControls: false,
              descriptionOverride: compactCardDescription(card),
              extraClass: "compact-card",
              footer: "Card phase has not started yet.",
            })
          ).join("")}
        </div>
      `
      : `<div class="cards-queue-empty cards-hand-empty">No cards in hand right now.</div>`;

    els.cardsPanel.innerHTML = `
      <div class="cards-content-grid">
        <div class="cards-top-stack">
          <div class="stack-item">
            <strong>World Tour Cards Locked</strong>
            <p>Your hand is visible for planning, but cards cannot be played until the live card phase begins. Press Begin Card Phase when you're ready.</p>
          </div>
          ${previewCardsHtml}
        </div>
        <aside class="cards-queue-panel result-note">
          <div class="cards-queue-empty">No card plays can happen yet.</div>
        </aside>
      </div>
    `;
    bindCardsPanelInteractions();
    return;
  }

  const activeVenue = activeVenueForCards(roundData);
  const isPlayerCardTurn = state.phase === "cards" && state.activeCardManagerId === "player";
  const renderedHandCards = player.hand.map((card) => {
    const targets = state.phase === "cards" ? getCardTargets(player, card, roundData) : [];
    const canPlayCard =
      state.phase === "cards" &&
      state.activeCardManagerId === "player" &&
      (card.type !== "defense" || isProactiveDefenseCard(card)) &&
      targets.length > 0;
    const playHint =
      !isPlayerCardTurn && state.phase === "cards"
        ? "Waiting for other promoters. Press Continue Card Phase to reveal the next play."
        : state.phase === "cards" && state.activeCardManagerId === "player"
        ? card.type === "defense"
          ? card.effect === "cancel_demands"
            ? targets.length
              ? `You can use this right now to clear Demands from ${targets.map((target) => target.bandName).join(", ")}.`
              : "No bands currently have Demands active."
            : card.effect === "cancel_scandal"
              ? targets.length
                ? `You can use this right now to clear an active Rumor or Scandal from ${targets.map((target) => target.bandName).join(", ")}. It can also still be used reactively when a Rumor or Scandal is played on you.`
                : "Good PR can cancel an incoming Rumor or Scandal, or clear one that is already active on your own band."
              : card.effect === "super_lawyer"
                ? "Super Lawyer is a reaction card. It can be used when a Rumor or Scandal is played on you, or it may trigger automatically if the AI uses it."
                : card.effect === "swiss_bank_account"
                  ? "Swiss Bank Account is a reaction card. It triggers automatically only if Communism is played."
                  : ""
            : targets.length === 0
            ? card.type === "trend"
              ? card.effect === "signing_bonus" || card.effect === "communism" || card.effect === "draw_cards" || card.effect === "steal_cards" || card.effect === "cash_attack" || card.effect === "charity_case" || card.effect === "refund_booking_fee" || card.effect === "special_guest_draw" || card.effect === "mega_concert"
                ? `${card.name} is not available right now.`
                : "That card is not available right now."
              : card.effect === "duet_persistent"
                ? `Duet needs both your headliner and opener booked together at ${activeVenue?.type ? `${activeVenue.type}: ${activeVenue.name}` : "the current venue"}.`
                : isRoundLockedSelfBadSong(card)
                  ? "No legal target on your current booked band. You can save this for a later venue this round."
                  : "No legal target in the current venue."
            : ""
        : "";
    const targetOptions = targets.map((target, index) => {
      const venue = roundData.venues.find((entry) => entry.type === target.venueType);
      const targetManager = state.managers.find((manager) => manager.id === target.managerId);
      const estimate = venue && targetManager ? estimatedVenueStrength(targetManager, venue, roundData) : { revenue: 0 };
      const targetBand = targetManager ? getBandByName(targetManager, target.bandName) : null;
      const targetPerformance = targetBand ? findVenuePerformance(estimate, target.bandName) : null;
      if (card.effect === "cash_attack") {
        const targetCash = targetManager?.cash || 0;
        const cashHit = Math.min(30, Math.floor(targetCash / 2));
        return `<option value="${encodeCardTarget(target)}" ${index === 0 ? "selected" : ""}>${target.managerName} (${formatCash(targetCash)} cash, loses ${formatCash(cashHit)})</option>`;
      }
      if (card.type === "trend") {
        if (card.effect === "charity_case") {
          const leader = state.managers.find((managerEntry) => managerEntry.id === target.managerId);
          const leaderChoices = leader ? charityCaseBandChoices(leader, player, roundData).length : 0;
          return `<option value="${encodeCardTarget(target)}" ${index === 0 ? "selected" : ""}>${target.managerName} must hand over one band (${leaderChoices} legal ${leaderChoices === 1 ? "choice" : "choices"})</option>`;
        }
        if (card.effect === "televised_concert") {
          return `<option value="${encodeCardTarget(target)}" ${index === 0 ? "selected" : ""}>Broadcast ${target.bandName}: double all payouts there this week</option>`;
        }
        if (card.effect === "refund_booking_fee") {
          return `<option value="${encodeCardTarget(target)}" ${index === 0 ? "selected" : ""}>Refund booking fee at ${target.venueType}: ${target.bandName} (${formatCash(venue?.cost || 0)}) this week</option>`;
        }
        if (card.effect === "special_guest_draw") {
          const currentBooking = venue ? venueBookingLabel(player, target.venueType, { includeHeadlinerLabel: true }) : "";
          return `<option value="${encodeCardTarget(target)}" ${index === 0 ? "selected" : ""}>Add a Special Guest to ${target.venueType}: ${target.bandName}${currentBooking ? ` (${currentBooking})` : ""}</option>`;
        }
        return `<option value="all|all" ${index === 0 ? "selected" : ""}>Play this trend for the whole tour this week</option>`;
      }
      if (card.effect === "persistent_ad_agency") {
        return `<option value="${encodeCardTarget(target)}" ${index === 0 ? "selected" : ""}>Hire an Advertising Agency for ${target.managerName} (2 ad buys each advertising phase)</option>`;
      }
      if (card.effect === "argument_duo") {
        return `<option value="${encodeCardTarget(target)}" ${index === 0 ? "selected" : ""}>${target.managerName} ${target.venueType} lineup: ${target.bandName} + ${target.pairedBandName} both take -2 at ${venue?.name || target.venueType}</option>`;
      }
      if (card.effect === "feud") {
        return `<option value="${encodeCardTarget(target)}" ${index === 0 ? "selected" : ""}>${target.venueType}: ${target.managerName}'s ${target.bandName} vs ${target.pairedManagerName}'s ${target.pairedBandName} at ${venue?.name || target.venueType} (each rolls for +2 or -2)</option>`;
      }
      if (card.effect === "dance_off") {
        return `<option value="${encodeCardTarget(target)}" ${index === 0 ? "selected" : ""}>${target.venueType}: your ${target.bandName} vs ${target.pairedManagerName}'s ${target.pairedBandName} at ${venue?.name || target.venueType} (each rolls 2D, winner gets +5)</option>`;
      }
      if (card.effect === "venue_snowstorm") {
        return `<option value="${encodeCardTarget(target)}" ${index === 0 ? "selected" : ""}>Snow out ${target.venueType}: ${venue?.name || target.venueType} for every promoter this week</option>`;
      }
      if (card.effect === "venue_snow_tires") {
        return `<option value="${encodeCardTarget(target)}" ${index === 0 ? "selected" : ""}>Protect your full lineup at ${target.venueType}: ${venue?.name || target.venueType} from Snowstorm</option>`;
      }
      if (card.effect === "duet_persistent") {
        return `<option value="${encodeCardTarget(target)}" ${index === 0 ? "selected" : ""}>${target.managerName} ${target.venueType} lineup: ${target.bandName} + ${target.pairedBandName} at ${venue?.name || target.venueType} (${venue?.venuePoints || 0} VP, x${venue?.revenueFactor || 0})</option>`;
      }
      if (card.effect === "sit_out_boost_persistent") {
        if (target.isSittingOut && target.venueType === "week_off") {
          return `<option value="${encodeCardTarget(target)}" ${index === 0 ? "selected" : ""}>${target.managerName} resting band: ${target.bandName} (already sitting out this week, scandal ${targetBand ? effectiveScandalNotation(target.managerId, targetBand) : "-"})</option>`;
        }
        if (target.isBenched && target.venueType === "bench") {
          return `<option value="${encodeCardTarget(target)}" ${index === 0 ? "selected" : ""}>${target.managerName} bench band: ${target.bandName} (not booked this week, retention ${targetBand ? formatCash(targetBand.retention) : "-"}, scandal ${targetBand ? effectiveScandalNotation(target.managerId, targetBand) : "-"})</option>`;
        }
        return `<option value="${encodeCardTarget(target)}" ${index === 0 ? "selected" : ""}>${target.managerName} ${target.venueType} ${target.slotLabel}: ${target.bandName} at ${venue?.name || target.venueType} (will leave this week's lineup, est ${formatCash(targetPerformance?.weightedRevenue || 0)}, scandal ${targetBand ? effectiveScandalNotation(target.managerId, targetBand) : "-"})</option>`;
      }
      if (card.effect === "cancel_demands") {
        const activeDemands = targetBand ? demandEntriesForBand(target.managerId, target.bandName) : [];
        const strongestDemand = activeDemands.sort((left, right) => (right.flatPenalty || 0) - (left.flatPenalty || 0))[0];
        return `<option value="${encodeCardTarget(target)}" ${index === 0 ? "selected" : ""}>Clear Demands on ${target.bandName}${strongestDemand ? ` (${strongestDemand.subtitle || "Demands"}, -${strongestDemand.flatPenalty || 0})` : ""}</option>`;
      }
      if (card.effect === "cancel_scandal") {
        const activeScandalCount = targetBand ? activeScandalCountForBand(target.managerId, target.venueType || "roster", targetBand) : 0;
        return `<option value="${encodeCardTarget(target)}" ${index === 0 ? "selected" : ""}>Clear active Rumor/Scandal on ${target.bandName}${activeScandalCount ? ` (${activeScandalCount} active)` : ""}</option>`;
      }
      return `<option value="${encodeCardTarget(target)}" ${index === 0 ? "selected" : ""}>${target.managerName} ${target.venueType} ${target.slotLabel}: ${target.bandName} at ${venue?.name || target.venueType} (${venue?.venuePoints || 0} VP, x${venue?.revenueFactor || 0}, exp ${targetPerformance ? `${targetPerformance.expectedNotation}${slotMultiplierText(targetPerformance.slotKey)}` : "-"}, est ${formatCash(targetPerformance?.weightedRevenue || 0)}, scandal ${targetBand ? effectiveScandalNotation(target.managerId, targetBand) : "-"})</option>`;
    });

    return {
      canPlayCard,
      html: renderFullCard(card, {
        targets: targetOptions,
        playable: canPlayCard,
        showControls: isPlayerCardTurn,
        fullText: true,
        extraClass: "compact-card",
        footer: playHint,
      }),
    };
  });

  const availableCardHtml = isPlayerCardTurn
    ? renderedHandCards.filter((entry) => entry.canPlayCard).map((entry) => entry.html)
    : renderedHandCards.map((entry) => entry.html);
  const unavailableCardHtml = isPlayerCardTurn
    ? renderedHandCards.filter((entry) => !entry.canPlayCard).map((entry) => entry.html)
    : [];

  const cardsHtml = availableCardHtml.length
    ? `<div class="tour-cards-grid compact-cards-grid playable-cards-grid">${availableCardHtml.join("")}</div>`
    : `<div class="cards-queue-empty cards-hand-empty">${isPlayerCardTurn ? `No playable cards for ${activeVenue?.name || "this venue"} right now.` : "Your hand is ready for the next card turn."}</div>`;

  const unavailableCardsSection = unavailableCardHtml.length
    ? `
      <details class="cards-stash-panel">
        <summary>Not usable here right now (${unavailableCardHtml.length})</summary>
        <div class="tour-cards-grid compact-cards-grid cards-stash-grid">${unavailableCardHtml.join("")}</div>
      </details>
    `
    : "";

  const visibleQueuePlays =
    state.phase === "cards" && activeVenue
      ? state.roundCardPlays.filter((play) => play.venueType === activeVenue.type || play.venueType === "all")
      : state.roundCardPlays;
  const orderedQueuePlays = [...visibleQueuePlays].reverse();
  const latestQueuePlay = orderedQueuePlays[0] || null;
  const spotlightHtml = renderJustPlayedSpotlight(
    latestQueuePlay,
    state.phase === "cards" && activeVenue
      ? `No cards played for ${activeVenue.name} yet.`
      : "The World Tour card queue will appear here once promoters start using cards."
  );

  const activeVenues = state.phase === "cards" && activeVenue ? [activeVenue] : roundData.venues;
  const venueBoardHtml = activeVenues
    .map((venue) => {
      const summary = venueCompetitionSummary(roundData, venue);
      return `
        <section class="cards-venue-summary">
          <div class="cards-venue-summary-head">
            <strong>${venue.type}: ${venue.name}</strong>
            <span>${venue.venuePoints} VP • x${venue.revenueFactor} • fee ${formatCash(venue.cost)}</span>
          </div>
          <div class="cards-venue-table">
            <div class="cards-venue-row cards-venue-head">
              <div>Promoter</div>
              <div>Lineup</div>
              <div>Scandal</div>
              <div>Expected</div>
              <div>Est.</div>
            </div>
            ${summary.standings
              .map((entry) => {
                const manager = state.managers.find((candidate) => candidate.id === entry.managerId);
                const estimate = manager ? estimatedVenueStrength(manager, venue, roundData) : { expectedNotation: "-", revenue: 0, performances: [] };
                const bandCell = entry.performances?.length
                  ? renderCellStack(
                      entry.performances.map((performance) => `<strong>${bookingBandLabel(performance.band.name, performance.slotKey)}</strong><span>${performance.band.genre}</span>`),
                      "cards-cell-stack"
                    )
                  : "No band";
                const scandalText = entry.performances?.length
                  ? renderCellStack(
                      entry.performances.map((performance) => `${effectiveScandalNotation(entry.managerId, performance.band)}${performance.activeScandals ? ` • ${performance.activeScandals} active` : ""}`),
                      "cards-cell-stack"
                    )
                  : "—";
                const expectedText = entry.performances?.length
                  ? renderCellStack(
                      entry.performances.map((performance) => `${performance.expectedNotation}${slotMultiplierText(performance.slotKey)}`),
                      "cards-cell-stack"
                    )
                  : "—";
                const promoterCell = `
                  <div class="cards-venue-promoter-block">
                    <strong>${entry.managerName}</strong>
                    ${estimate.advertisingBonus ? `<span class="cards-venue-ad-note">Ads ${signedNumberLabel(estimate.advertisingBonus)}</span>` : ""}
                  </div>
                `;
                return `
                  <div class="cards-venue-row ${summary.leaders.some((leader) => leader.managerId === entry.managerId) ? "leader" : ""}">
                    <div class="cards-venue-cell promoter">${promoterCell}</div>
                    <div class="cards-venue-cell band">${bandCell}</div>
                    <div class="cards-venue-cell">${scandalText}</div>
                    <div class="cards-venue-cell">${expectedText}</div>
                    <div class="cards-venue-cell">${entry.performances?.length ? formatCash(estimate.revenue) : formatCash(0)}</div>
                  </div>
                `;
              })
              .join("")}
          </div>
        </section>
      `;
    })
    .join("");

  const cardsLeftText =
    state.phase === "cards"
      ? state.managers.map((manager) => `${manager.name} ${manager.hand.length}`).join(" • ")
      : "";
  const passedText =
    state.phase === "cards"
      ? state.cardPassedManagers.length
        ? state.cardPassedManagers.map((id) => state.managers.find((manager) => manager.id === id)?.name || id).join(", ")
        : "Nobody yet"
      : "";

  els.cardsPanel.innerHTML = `
    <div class="cards-content-grid">
      <div class="cards-top-stack">
        ${
          state.phase === "cards"
            ? `<div class="cards-meta-strip">
                <span><strong>Cards left:</strong> ${cardsLeftText}</span>
                <span><strong>Passed for ${activeVenue?.name || "this venue"}:</strong> ${passedText}</span>
              </div>`
            : ""
        }
        ${state.phase === "cards" ? `<div class="cards-venue-board">${venueBoardHtml}</div>` : ""}
      </div>
      <aside class="cards-queue-panel result-note">
        ${spotlightHtml}
        ${
          state.phase === "cards" && activeVenue
            ? renderVenueActionBoard(roundData, activeVenue, visibleQueuePlays, {
                emptyMessage: `No actions on any booked band at ${activeVenue.name} yet.`,
              })
            : ""
        }
      </aside>
      <section class="cards-hand-panel">
        ${cardsHtml}
        ${unavailableCardsSection}
      </section>
    </div>
  `;
  bindCardsPanelInteractions();
}

function auctionStageDescription(activeBand, stage) {
  if (!activeBand) {
    return "All four acts are sold. Review your bookings, then move on to venue assignments and the card phase.";
  }

  if (!stage.hiddenRemaining) {
    return "This is the final reveal of the round, so there is no reason to save cash for another hidden act.";
  }

  return `${stage.hiddenRemaining} hidden ${stage.hiddenRemaining === 1 ? "act remains" : "acts remain"} after this one, so you have to weigh the band in front of you against the value of waiting.`;
}

function renderAuctionProgressCard(band, index, activeIndex) {
  const slotLabel = `#${index + 1}`;
  if (band.resolved) {
    const winnerLine = band.currentLeaderId
      ? `${band.currentLeaderName} • ${formatCash(Math.max(1, band.currentBid))}`
      : "Returned to pile";
    const outcomeLine = band.currentLeaderId
      ? band.resultText || `${band.currentLeaderName} wins for ${formatCash(Math.max(1, band.currentBid))}.`
      : "No bids. The act went back into the pile.";
    return `
      <article class="auction-progress-card resolved">
        <div class="auction-progress-top">
          <span class="auction-progress-index">${slotLabel}</span>
          <span class="chip">Resolved</span>
        </div>
        <div class="auction-progress-meta">
          ${renderBandPhoto(band.name, "auction-progress-photo")}
          <div>
            <strong>${band.name}</strong>
            <p>${band.genre}</p>
            <div class="auction-progress-stats">
              <span class="chip">${winnerLine}</span>
            </div>
          </div>
        </div>
        <div class="auction-progress-note">${outcomeLine}</div>
      </article>
    `;
  }

  if (index === activeIndex) {
    return `
      <article class="auction-progress-card live">
        <div class="auction-progress-top">
          <span class="auction-progress-index">${slotLabel}</span>
          <span class="chip">Now Live</span>
        </div>
        <div class="auction-progress-meta">
          ${renderBandPhoto(band.name, "auction-progress-photo")}
          <div>
            <strong>${band.name}</strong>
            <p>${band.genre}</p>
            <div class="auction-progress-stats">
              <span class="chip">Leader ${band.currentLeaderName}</span>
              <span class="chip">High Bid ${band.currentBid >= 0 ? formatCash(band.currentBid) : "None"}</span>
            </div>
          </div>
        </div>
        <div class="auction-progress-note">
          ${band.resultText || `Opening bid is ${formatCash(nextLegalBid(band))}. Later acts stay hidden until this auction resolves.`}
        </div>
      </article>
    `;
  }

  return `
    <article class="auction-progress-card hidden">
      <div class="auction-progress-top">
        <span class="auction-progress-index">${slotLabel}</span>
        <span class="chip">Hidden</span>
      </div>
      <strong>Hidden Act</strong>
      <p>Reveals only after auction ${index} resolves.</p>
      <div class="auction-progress-note">The next band stays unknown until its turn, so early bids carry real risk.</div>
    </article>
  `;
}

function renderAuction() {
  const roundData = currentRoundData();
  const player = state.managers[0];
  const futureRounds = roundData ? visibleFutureRounds() : [];
  const activeIndex = activeAuctionBandIndex();
  const activeBand = activeIndex >= 0 ? state.marketBands[activeIndex] : null;
  const stage = auctionStageSnapshot(activeIndex);
  const progressHtml = state.marketBands.map((band, index) => renderAuctionProgressCard(band, index, activeIndex)).join("");

  if (!roundData) {
    els.auctionGrid.innerHTML = "";
    return;
  }

  if (!activeBand) {
    els.auctionGrid.innerHTML = `
      <section class="auction-showcase">
        <div class="auction-feature">
          <div class="auction-stage-banner">
            <div>
              <p class="eyebrow">Auction Complete</p>
              <h3>All Four Bands Are Resolved</h3>
              <p>${auctionStageDescription(null, stage)}</p>
            </div>
            <div class="auction-banner-chips">
              <span class="chip">${stage.totalBands} of ${stage.totalBands} sold</span>
              <span class="chip">Visible cash</span>
              <span class="chip">Hidden hands</span>
            </div>
          </div>
          <div class="auction-complete-card">
            <strong>Next step</strong>
            <p>Open the venue assignment board, check the suggested lineup, and make any swaps you want before the card phase starts.</p>
          </div>
        </div>
        <aside class="auction-progress-rail">
          <div class="auction-progress-head">
            <div>
              <strong>Round Auction Track</strong>
              <p>Each act was revealed one at a time. This rail keeps the final order and outcomes together.</p>
            </div>
          </div>
          <div class="auction-progress-list">${progressHtml}</div>
        </aside>
      </section>
    `;
    return;
  }

  const currentFit = totalFitAcrossRound(activeBand, roundData.venues);
  const strategicSummary = auctionStrategicSummary(player, activeBand, roundData, futureRounds);
  const minimum = nextLegalBid(activeBand);
  const bestThisWeekRevenue = Math.max(...roundData.venues.map((venue) => projectedVenueRevenue(activeBand, venue)), 0);
  const thisWeekValue = roundData.venues
    .map((venue) => {
      const fit = genreFitScore(activeBand, venue);
      const projectedPayout = projectedVenueRevenue(activeBand, venue);
      const expectedNotation = formatAdjustedNotation(activeBand.popularity, fit);
      return `<span class="chip">${venue.type}: ${venue.name} • ${expectedNotation} • ${formatCash(projectedPayout)}</span>`;
    })
    .join("");
  const upgradeHint = auctionUpgradeSummary(player, activeBand, roundData.venues);
  const bidControlsDisabled =
    state.phase !== "auction" || activeBand.playerPassed;
  const displayedBid = Math.max(Number(activeBand.playerBid) || 0, minimum);
  const headlineText = `Band ${stage.currentAuctionNumber} of ${stage.totalBands}`;
  const statusText = activeBand.resultText || "Only one act is revealed at a time. Later auction cards stay hidden until this band resolves.";
  const hiddenActsChip = stage.hiddenRemaining
    ? `${stage.hiddenRemaining} hidden ${stage.hiddenRemaining === 1 ? "act" : "acts"} left`
    : "Final reveal";

  els.auctionGrid.innerHTML = `
    <section class="auction-showcase">
      <div class="auction-feature">
        <div class="auction-stage-banner">
          <div>
            <p class="eyebrow">Live Auction</p>
            <h3>${headlineText}: ${activeBand.name}</h3>
            <p>${auctionStageDescription(activeBand, stage)}</p>
          </div>
          <div class="auction-banner-chips">
            <span class="chip">${hiddenActsChip}</span>
            <span class="chip">Visible cash</span>
            <span class="chip">Hidden hands</span>
          </div>
        </div>
        <article class="band-card auction-band-active auction-feature-card">
          <div class="band-head">
            <div class="auction-band-header">
              ${renderBandPhoto(activeBand.name, "auction-band-photo")}
              <div class="auction-band-summary">
                <h3>${activeBand.name}</h3>
                <p>${activeBand.genre}</p>
                <div class="auction-stat-list">
                  <div><strong>Popularity</strong><span>${activeBand.popularity}</span></div>
                  <div><strong>Scandal</strong><span>${activeBand.scandal}</span></div>
                  <div><strong>Round Fit</strong><span>${currentFit >= 0 ? "+" : ""}${currentFit}</span></div>
                  <div><strong>Best Raw Venue</strong><span>${formatCash(bestThisWeekRevenue)}</span></div>
                </div>
              </div>
            </div>
            <div class="auction-head-tags">
              <span class="tag">Retention ${formatCash(activeBand.retention)}</span>
              <span class="chip">Revealed now</span>
            </div>
          </div>
          <div class="auction-state">
            <div class="mini-stat">High Bid<strong>${activeBand.currentBid >= 0 ? formatCash(activeBand.currentBid) : "None"}</strong></div>
            <div class="mini-stat">Leader<strong>${activeBand.currentLeaderName}</strong></div>
            <div class="mini-stat">Next Bid<strong>${formatCash(minimum)}</strong></div>
          </div>
          <div class="auction-notes">
            <div class="future-note compact-note"><strong>This week:</strong> ${thisWeekValue}</div>
            ${upgradeHint ? `<div class="future-note compact-note"><strong>Upgrade:</strong> ${upgradeHint}</div>` : ""}
            ${strategicSummary.bandReasons.length
              ? `<div class="future-note compact-note"><strong>Upside:</strong> ${strategicSummary.bandReasons.map((reason) => `<span class="chip">${reason}</span>`).join("")}</div>`
              : ""}
            ${strategicSummary.handReasons.length
              ? `<div class="future-note compact-note"><strong>Your hand:</strong> ${strategicSummary.handReasons.map((reason) => `<span class="chip">${reason}</span>`).join("")}</div>`
              : ""}
          </div>
          <div class="bid-row">
            <input class="bid-input" type="number" min="${minimum}" step="1" value="${displayedBid}" data-bid-input="${activeIndex}" ${bidControlsDisabled ? "disabled" : ""} />
            <button class="secondary-button" data-pass-band="${activeIndex}" ${bidControlsDisabled ? "disabled" : ""}>Pass Bid</button>
            <button class="primary-button" data-bid-band="${activeIndex}" ${bidControlsDisabled ? "disabled" : ""}>Submit Bid</button>
          </div>
          <div class="result-note">${statusText}</div>
        </article>
      </div>
      <aside class="auction-progress-rail">
        <div class="auction-progress-head">
          <div>
            <strong>Round Auction Track</strong>
            <p>The newest reveal stays in the featured slot. Earlier outcomes stay here, and later acts remain hidden.</p>
          </div>
        </div>
        <div class="auction-progress-list">${progressHtml}</div>
      </aside>
    </section>
  `;
}

function renderResults() {
  if (state.phase === "booking_fees") {
    const roundData = currentRoundData();
    const summaries = roundData
      ? state.managers
          .map((manager) => {
            const fee = bookingFeeForManager(manager, roundData.venues);
            const bookings = roundData.venues
              .filter((venue) => venueHasBooking(manager, venue.type))
              .map((venue) => `${venue.type}: ${venueBookingLabel(manager, venue.type, { includeMultiplier: true })} (${formatCash(venue.cost)})`)
              .join(" • ");
            return `
              <article class="result-card">
                <div class="result-card-head">
                  <div>
                    <strong>${manager.name}</strong>
                    <p>${bookings || "No bookings this round"}</p>
                  </div>
                  <span class="tag">${formatCash(fee)}</span>
                </div>
                <div class="result-lines">
                  <div>Cash before payment ${formatCash(manager.cash)}</div>
                  <div>Booking fees due ${formatCash(fee)}</div>
                  <div>Cash after payment ${formatCash(manager.cash - fee)}</div>
                </div>
              </article>
            `;
          })
          .join("")
      : "";

    els.resultsPanel.innerHTML = `
      <section class="result-venue-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Before The Show</p>
            <h4>Pay Booking Fees</h4>
          </div>
        </div>
        <p class="result-venue-summary">Each booked venue pays its fee once before the dice start rolling, even if you bring both a headliner and an opener.</p>
        <div class="inline-phase-action">
          <button class="primary-button" data-inline-action="pay-booking-fees">Pay Booking Fees</button>
        </div>
        <div class="result-cards-grid">${summaries}</div>
      </section>
    `;
    return;
  }

  if (state.phase === "ready") {
    els.resultsPanel.innerHTML = `
      <section class="result-venue-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Show Ready</p>
            <h4>Run The Show</h4>
          </div>
        </div>
        <p class="result-venue-summary">Booking fees are paid. The bands are ready to take the stage.</p>
        <div class="inline-phase-action">
          <button class="primary-button" data-inline-action="run-show">Run The Show</button>
        </div>
      </section>
    `;
    return;
  }

  if (state.phase === "advertising") {
    const player = state.managers[0];
    const futureRounds = visibleFutureRounds();
    const playerPlaced = advertisingPlacementsThisRound(player.id);
    const placementLimit = advertisingPlacementLimit(player);
    const hasPlacedThisRound = playerPlaced.length >= placementLimit;
    const placementsRemaining = Math.max(0, placementLimit - playerPlaced.length);
    const hasAgency = managerHasAdvertisingAgency(player.id);
    const availableTiles = advertisingTilesForManager(player);
    const targetOptions = futureAdvertisingVenueOptions(player);
    const hasAffordableTile = availableTiles.some((value) => player.cash >= advertisingCost(value));
    const selectedValue = availableTiles.includes(state.selectedAdvertisingValue) ? state.selectedAdvertisingValue : 0;
    const selectedTarget = targetOptions.some((option) => option.key === state.selectedAdvertisingTarget) ? state.selectedAdvertisingTarget : "";
    const selectedTargetMeta = targetOptions.find((option) => option.key === selectedTarget) || null;
    const placeDisabled =
      hasPlacedThisRound ||
      !selectedValue ||
      !selectedTarget ||
      player.cash < advertisingCost(selectedValue);

    els.resultsPanel.innerHTML = `
      <section class="result-venue-section advertising-phase-panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">End Of Round</p>
            <h4>Advertising Phase</h4>
          </div>
        </div>
        <p class="result-venue-summary">Place ${placementLimit === 1 ? "one" : "up to two"} face-down advertising ${placementLimit === 1 ? "buy" : "buys"} on a venue in the next ${PREVIEW_ROUNDS} rounds. The cost is paid now, rivals only see that you advertised there, and the value flips face up when that round begins.</p>
        <div class="advertising-phase-grid">
          <aside class="result-note advertising-inventory-panel">
            <div class="cards-queue-heading-row">
              <strong>Your Advertising Buys</strong>
              <span>Each point costs ${formatCash(ADVERTISING_COST_PER_POINT)}.</span>
            </div>
            ${hasAgency ? `<div class="cards-queue-empty">Advertising Agency active: you may place ${placementLimit} buys this round, including both on the same venue.</div>` : ""}
            <div class="advertising-tile-grid">
              ${availableTiles.length
                ? availableTiles
                    .map((value) => {
                      const disabled = hasPlacedThisRound || player.cash < advertisingCost(value);
                      return `
                        <button class="advertising-tile ${selectedValue === value ? "selected" : ""}" type="button" data-ad-value="${value}" ${disabled ? "disabled" : ""}>
                          <strong>+${value}</strong>
                          <span>${formatCash(advertisingCost(value))}</span>
                        </button>
                      `;
                    })
                    .join("")
                : `<div class="stack-item">No advertising buys left.</div>`}
            </div>
            <label class="field-label">
              <span>Target Venue</span>
              <select class="assignment-select" data-ad-target-select ${(hasPlacedThisRound || !hasAffordableTile) ? "disabled" : ""}>
                <option value="">Choose a future venue</option>
                ${targetOptions
                  .map(
                    (option) => `<option value="${option.key}" ${selectedTarget === option.key ? "selected" : ""}>Round ${option.roundNumber} • ${option.venue.type}: ${option.venue.name} (${option.venue.venuePoints} VP, x${option.venue.revenueFactor})</option>`
                  )
                  .join("")}
              </select>
            </label>
            <div class="advertising-selection-copy">
              ${
                hasPlacedThisRound
                  ? `Placed this round: ${playerPlaced.map((placement) => `+${placement.value} on Round ${placement.targetRoundNumber} ${placement.venueType}: ${placement.venueName}`).join(" • ")}.`
                  : !hasAffordableTile
                    ? "You do not have an affordable advertising buy available right now."
                  : selectedValue && selectedTargetMeta
                    ? `Ready to place +${selectedValue} at Round ${selectedTargetMeta.roundNumber} ${selectedTargetMeta.venue.type}: ${selectedTargetMeta.venue.name} for ${formatCash(advertisingCost(selectedValue))}.`
                    : `Choose one buy and one future venue, or skip straight to the next round.${placementsRemaining > 0 ? ` ${placementsRemaining} placement${placementsRemaining === 1 ? "" : "s"} remaining.` : ""}`
              }
            </div>
            <div class="inline-phase-action">
              <button class="primary-button" data-place-advertising ${placeDisabled ? "disabled" : ""}>Place Advertising</button>
            </div>
          </aside>
          <div class="advertising-board">
            ${futureRounds
              .map(
                (round) => `
                  <section class="advertising-round-card">
                    <div class="cards-queue-heading-row">
                      <strong>Round ${round.roundNumber}</strong>
                      <span>Face-down buys stay hidden until this round begins.</span>
                    </div>
                    <div class="advertising-venue-grid">
                      ${round.venues
                        .map((venue) => {
                          const targetKey = advertisingTargetKey(round.roundNumber, venue.type);
                          const markers = state.managers
                            .map((manager) => {
                              const placements = managerAdvertisingPlacementsForVenue(manager.id, round.roundNumber, venue.type);
                              if (!placements.length) {
                                return "";
                              }
                              const visibleToPlayer = placements.every((placement) => isAdvertisingRevealed(placement) || placement.managerId === player.id);
                              return `
                                <div class="advertising-marker-row">
                                  <strong>${manager.name}</strong>
                                  <span>${visibleToPlayer ? placements.map((placement) => `+${placement.value}`).join(" ") : `${placements.length} hidden`}</span>
                                </div>
                              `;
                            })
                            .filter(Boolean)
                            .join("");
                          const atLimit = managerAdvertisingPlacementsForVenue(player.id, round.roundNumber, venue.type).length >= MAX_ADVERTISING_PER_VENUE;
                          return `
                            <button class="advertising-venue-card ${selectedTarget === targetKey ? "selected" : ""}" type="button" data-ad-target="${targetKey}" ${(hasPlacedThisRound || atLimit || !hasAffordableTile) ? "disabled" : ""}>
                              <div class="advertising-venue-head">
                                <strong>${venue.type}: ${venue.name}</strong>
                                <span>${venue.venuePoints} VP • x${venue.revenueFactor}</span>
                              </div>
                              <p>Fee ${formatCash(venue.cost)} • ${venue.description || "Future venue."}</p>
                              <div class="advertising-marker-list">
                                ${markers || `<div class="advertising-marker-row empty"><span>No advertising on this venue yet.</span></div>`}
                              </div>
                              ${atLimit ? `<div class="advertising-limit-note">You already have ${MAX_ADVERTISING_PER_VENUE} buys parked here.</div>` : ""}
                            </button>
                          `;
                        })
                        .join("")}
                    </div>
                  </section>
                `
              )
              .join("")}
          </div>
        </div>
      </section>
    `;
    return;
  }

  if (!state.roundResults.length) {
    els.resultsPanel.innerHTML = `<div class="stack-item"><strong>No results yet</strong><p>After the card phase, the show table will appear here.</p></div>`;
    return;
  }

  if (state.showcase) {
    const roundData = currentRoundData();
    const currentBundle = showcaseCurrentBundle();
    const bundle = showcaseDisplayBundle();
    const reviewableVenueIndices = roundData
      ? roundData.venues
          .map((venue, index) => index)
          .filter(
            (index) =>
              (state.showcase.settledVenueIndices || []).includes(index) ||
              (index === state.showcase.venueIndex && (state.phase === "results" || Boolean((state.showcase.venueOrders?.[index] || []).length)))
          )
      : [];

    if (!bundle || !reviewableVenueIndices.length) {
      els.resultsPanel.innerHTML = `<div class="stack-item"><strong>No settled venue results yet</strong><p>Results for each venue will stay here after that venue finishes, so you can review the scoring before moving on.</p></div>`;
      return;
    }

    const displayLiveReveal =
      bundle.venueIndex === state.showcase.venueIndex &&
      state.phase === "results" &&
      !state.showcase.venueSettled;
    const currentPhase = displayLiveReveal ? state.showcase.revealPhase : showcaseFinalRevealPhase(bundle);
    const finalRevealPhase = showcaseFinalRevealPhase(bundle);
    const displayMessage = displayLiveReveal
      ? state.showcase.message
      : showcaseStoredMessage(bundle.venueIndex) || `Final results for ${bundle.venue.type}: ${bundle.venue.name}.`;
    const reviewNote =
      currentBundle && bundle.venueIndex !== currentBundle.venueIndex
        ? `<div class="showcase-review-note">Reviewing final results for ${bundle.venue.type}: ${bundle.venue.name}. ${roundData?.venues[state.showcase.venueIndex] ? `${state.phase === "cards" ? "Card play is currently on" : "The live showcase is at"} ${roundData.venues[state.showcase.venueIndex].type}: ${roundData.venues[state.showcase.venueIndex].name}.` : ""}</div>`
        : "";
    const venueTabs = reviewableVenueIndices.length > 1
      ? `
        <div class="showcase-venue-tabs">
          ${reviewableVenueIndices
            .map((venueIndex) => {
              const venue = roundData.venues[venueIndex];
              const isActive = venueIndex === bundle.venueIndex;
              const isCurrent = venueIndex === state.showcase.venueIndex;
              const status = isCurrent
                ? state.phase === "results" && !state.showcase.venueSettled
                  ? "Live"
                  : state.showcase.venueSettled
                    ? "Final"
                    : "Current"
                : "Final";
              return `
                <button class="showcase-venue-tab ${isActive ? "active" : ""}" type="button" data-showcase-venue="${venueIndex}">
                  <strong>${venue.type}</strong>
                  <span>${venue.name}</span>
                  <em>${status}</em>
                </button>
              `;
            })
            .join("")}
        </div>
      `
      : "";

    const rowEntries = bundle.revealOrder
      .map((managerId, revealIndex) => {
        const manager = state.managers.find((item) => item.id === managerId);
        const entry = showcaseResultEntry(bundle.venueIndex, managerId);
        if (!manager || !entry?.performances?.length) {
          return null;
        }

        const visiblePhase = displayLiveReveal ? currentPhase : finalRevealPhase;
        const rowIsResolved = !displayLiveReveal || state.showcase.venueSettled;
        const visibleScoreValue = showcaseVisibleScore(entry, visiblePhase, rowIsResolved);
        const lineupCell = `
          <div class="showcase-lineup-cell">
            ${entry.performances
              .map(
                (performance) => `
                  <div class="showcase-lineup-band">
                    <strong>${performance.band.name}</strong>
                    ${performance.slotKey !== HEADLINER_SLOT ? `<span class="showcase-lineup-role">${slotDisplayLabel(performance.slotKey)}</span>` : ""}
                  </div>
                `
              )
              .join("")}
            <div class="showcase-lineup-promoter">${manager.name}</div>
          </div>
        `;
        const baseCell = renderCellStack(
          entry.performances.map((performance) => performance.band.popularity),
          "showcase-cell-stack"
        );
        const rollCell = visiblePhase >= 1
          ? renderCellStack(
              entry.performances.map((performance) => `${performance.weightedRollTotal}`),
              "showcase-cell-stack"
            )
          : "—";
        const venueCell = renderCellStack(
          entry.performances.map((performance) => signedNumberLabel(performance.weightedFit)),
          "showcase-cell-stack"
        );
        const cardsCell = renderCellStack(
          entry.performances.map((performance) => {
            const weightedCardTotal = performance.weightedCardModifier + performance.weightedSmashBonus - performance.weightedBadSongPenalty;
            return signedNumberLabel(weightedCardTotal);
          }),
          "showcase-cell-stack"
        );
        const adsCell = entry.advertisingBonus ? signedNumberLabel(entry.advertisingBonus) : "—";
        const penaltyCell = rowIsResolved || visiblePhase >= finalRevealPhase
          ? renderCellStack(
              entry.performances.map((performance) =>
                performance.weightedScandalPenalty ? signedNumberLabel(-performance.weightedScandalPenalty) : "0"
              ),
              "showcase-cell-stack"
            )
          : "—";

        return {
          manager,
          entry,
          revealIndex,
          visiblePhase,
          rowIsResolved,
          visibleScoreValue,
          sortScore: visibleScoreValue ?? Number.NEGATIVE_INFINITY,
          lineupCell,
          baseCell,
          rollCell,
          venueCell,
          cardsCell,
          adsCell,
          penaltyCell,
        };
      })
      .filter(Boolean);

    const topScore = rowEntries.length ? Math.max(...rowEntries.map(({ entry }) => entry.score ?? Number.NEGATIVE_INFINITY)) : Number.NEGATIVE_INFINITY;
    const sortedRows = [...rowEntries]
      .sort((a, b) => {
        const aHidden = a.visibleScoreValue === null;
        const bHidden = b.visibleScoreValue === null;
        if (aHidden && bHidden) {
          return a.revealIndex - b.revealIndex;
        }
        return (
          Number(aHidden) - Number(bHidden) ||
          b.sortScore - a.sortScore ||
          b.entry.revenue - a.entry.revenue ||
          a.revealIndex - b.revealIndex
        );
      });
    const selectedManagerId = showcaseSelectedManagerId(bundle, sortedRows[0]?.manager.id || "");
    const selectedRow = sortedRows.find((row) => row.manager.id === selectedManagerId) || sortedRows[0] || null;
    const selectedShowsFinal = Boolean(selectedRow && (selectedRow.rowIsResolved || selectedRow.visiblePhase >= finalRevealPhase));
    const selectedVisiblePayout = !selectedRow || selectedRow.visibleScoreValue === null
      ? null
      : showcaseVisiblePayout(
          selectedRow.entry,
          selectedShowsFinal ? selectedRow.entry.score : selectedRow.visibleScoreValue,
          bundle.venue,
          selectedShowsFinal
        );
    const rows = sortedRows
      .map((row) => {
        const {
          manager,
          entry,
          visiblePhase,
          rowIsResolved,
          visibleScoreValue,
          lineupCell,
          baseCell,
          rollCell,
          venueCell,
          cardsCell,
          adsCell,
          penaltyCell,
        } = row;
        const isWinner = !displayLiveReveal && topScore >= 0 && entry.score === topScore;
        const isSelected = selectedRow && selectedRow.manager.id === manager.id;
        return `
          <tr class="showcase-table-row ${visiblePhase > 0 ? "revealed" : "pending"} ${isWinner ? "winner" : ""} ${isSelected ? "selected" : ""}" data-showcase-lineup="${manager.id}" data-showcase-venue="${bundle.venueIndex}">
            <td class="showcase-band-cell">${lineupCell}</td>
            <td>${baseCell}</td>
            <td>${rollCell}</td>
            <td>${venueCell}</td>
            <td>${cardsCell}</td>
            <td>${adsCell}</td>
            <td>${penaltyCell}</td>
            <td class="showcase-score-cell">${visibleScoreValue === null ? "—" : visibleScoreValue}</td>
            <td class="showcase-score-cell">${visibleScoreValue === null ? "—" : formatCash(showcaseVisiblePayout(entry, visibleScoreValue, bundle.venue, rowIsResolved) ?? 0)}</td>
          </tr>
        `;
      })
      .join("");
    const hasOpeners = rowEntries.some((row) => row.entry.performances.some((performance) => performance.slotKey === OPENER_SLOT));
    const showcaseNote = `
      <div class="showcase-helper-row">
        ${hasOpeners ? `<span class="showcase-simple-note">Openers score at 60%.</span>` : ""}
        <span class="showcase-simple-note">Click any lineup row to inspect the math.</span>
      </div>
    `;
    const selectedMath = selectedRow
      ? `
        <div class="showcase-math-panel">
          <div class="cards-queue-heading-row">
            <strong>Selected Lineup Math</strong>
            <span>${selectedRow.rowIsResolved ? "Full breakdown for the selected lineup." : "Live reveal mode: hidden steps stay hidden until they are revealed."}</span>
          </div>
          <div class="showcase-math-summary">
            <strong>${selectedRow.entry.bandLabel}</strong>
            <span>${selectedRow.manager.name}</span>
            <em>${
              selectedRow.visibleScoreValue === null
                ? "Score and payout stay hidden until the popularity rolls reveal."
                : selectedShowsFinal
                  ? `Final score ${selectedRow.entry.score} • Payout ${formatCash(selectedRow.entry.revenue)}`
                  : selectedRow.visiblePhase === 0
                    ? `Visible setup score ${selectedRow.visibleScoreValue} • Visible payout ${formatCash(selectedVisiblePayout)}`
                    : `Visible score ${selectedRow.visibleScoreValue} • Visible payout ${formatCash(selectedVisiblePayout)}`
            }</em>
          </div>
          ${
            selectedRow.entry.advertisingBonus
              ? `<p class="showcase-math-ad-note">Advertising already locked in for this show: ${signedNumberLabel(selectedRow.entry.advertisingBonus)} to the full lineup score.</p>`
              : ""
          }
          <div class="showcase-math-grid">
            ${selectedRow.entry.performances
              .map((performance) => {
                const rawCardTotal = performance.cardModifier + performance.smashBonus - performance.badSongPenalty;
                const weightedCardTotal = performance.weightedCardModifier + performance.weightedSmashBonus - performance.weightedBadSongPenalty;
                const weightedSetupScore = performance.weightedFit + weightedCardTotal;
                const roleNote =
                  performance.slotKey === OPENER_SLOT
                    ? "Opener contribution is 60% of the final act score."
                    : performance.slotKey === SPECIAL_GUEST_SLOT
                      ? "Special Guests count at full strength and do not add another booking fee."
                      : "Headliner counts at full strength.";
                const scoreLine = selectedShowsFinal
                  ? performance.slotKey === OPENER_SLOT
                    ? `Final act score ${performance.score}, opener contribution ${performance.weightedScore}`
                    : `Final act score ${performance.score}`
                  : selectedRow.visiblePhase >= 1
                    ? `Pre-scandal act score ${performance.preScandalScore}`
                    : `Setup contribution ${signedNumberLabel(weightedSetupScore)} before the popularity roll.`;
                return `
                  <article class="showcase-math-card">
                    <div class="showcase-math-card-top">
                      <strong>${bookingBandLabel(performance.band.name, performance.slotKey)}</strong>
                      <span>${performance.band.genre}</span>
                    </div>
                    <div class="showcase-math-lines">
                      <div>Base: ${performance.band.popularity}</div>
                      <div>${selectedRow.visiblePhase >= 1 || selectedRow.rowIsResolved ? `Roll: ${formatResolvedRoll(performance.rollDetail, performance.rollSignedTotal)}` : "Roll: hidden"}</div>
                      <div>Fit: ${signedNumberLabel(performance.fit)} -> ${signedNumberLabel(performance.weightedFit)}</div>
                      <div>Cards: ${signedNumberLabel(rawCardTotal)} -> ${signedNumberLabel(weightedCardTotal)}</div>
                      <div>${selectedShowsFinal ? `Scandals: ${performance.activeScandals || 0} at ${performance.activeScandals ? effectiveScandalNotation(selectedRow.manager.id, performance.band) : "—"}` : "Scandals: hidden"}</div>
                      <div>${selectedShowsFinal ? `Scandal detail: ${performance.scandalRollDetail || "—"}` : "Scandal detail: hidden"}</div>
                      <div>${selectedShowsFinal ? `Penalty: ${performance.scandalPenalty ? signedNumberLabel(-performance.scandalPenalty) : "0"} -> ${performance.weightedScandalPenalty ? signedNumberLabel(-performance.weightedScandalPenalty) : "0"}` : "Penalty: hidden"}</div>
                      <div>${scoreLine}</div>
                    </div>
                    <div class="showcase-math-foot">${roleNote}</div>
                  </article>
                `;
              })
              .join("")}
          </div>
        </div>
      `
      : "";
    const showcaseQueuePlays = state.roundCardPlays.filter(
      (play) => play.venueType === bundle.venue.type || play.venueType === "all"
    );

    els.resultsPanel.innerHTML = `
      <section class="showcase-panel compact">
        <div class="showcase-header-bar">
          <strong class="showcase-title-line">Venue ${bundle.venue.type}: ${bundle.venue.name}</strong>
          <div class="showcase-subhead-line">
            <span>Round Results</span>
            <span>Showtime</span>
            <span>Revenue Factor x${bundle.venue.revenueFactor}</span>
            ${!displayLiveReveal ? `<span>${formatVictoryPoints(bundle.venue.venuePoints)} VP</span>` : ""}
          </div>
        </div>
        ${venueTabs}
        ${reviewNote}
        ${showcaseNote}
        <div class="showcase-table-wrap">
          <table class="showcase-table">
            <thead>
              <tr>
                <th>Lineup</th>
                <th>Base</th>
                <th>Roll</th>
                <th>Fit</th>
                <th>Cards</th>
                <th>Ads</th>
                <th>Penalty</th>
                <th>Score</th>
                <th>Payout</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        ${selectedMath}
        ${renderVenueActionBoard(currentRoundData(), bundle.venue, showcaseQueuePlays, {
          title: "Card + Action Breakdown",
          subtitle: "Use this to trace the Cards column and see who affected each act.",
          emptyMessage: `No card actions affected ${bundle.venue.name}.`,
        })}
      </section>
    `;
    return;
  }

  const venues = currentRoundData().venues;
  const venueSections = venues
    .map((venue, venueIndex) => {
      const ranked = [...state.roundResults]
        .map((summary) => ({
          manager: summary.manager,
          entry: summary.result.venueResults[venueIndex],
        }))
        .sort((a, b) => b.entry.score - a.entry.score || b.entry.revenue - a.entry.revenue);
      const bestScore = ranked[0]?.entry.score ?? 0;
      const winners = ranked.filter((item) => item.entry.performances?.length && item.entry.score === bestScore && bestScore >= 0).map((item) => item.manager.name);
      const splitPoints = winners.length ? venue.venuePoints / winners.length : 0;

      const cards = ranked
        .map(({ manager, entry }) => {
          const details = entry.performances?.length
            ? [
                ...entry.performances.map((performance) => {
                  const rawCardTotal = performance.cardModifier + performance.smashBonus - performance.badSongPenalty;
                  const pieces = [
                    `${bookingBandLabel(performance.band.name, performance.slotKey, { includeMultiplier: true })}`,
                    `Roll ${formatResolvedRoll(performance.rollDetail, performance.rollSignedTotal)}`,
                    `Fit ${signedNumberLabel(performance.fit)}`,
                    `Cards ${signedNumberLabel(rawCardTotal)}`,
                    `Penalty ${performance.scandalPenalty ? signedNumberLabel(-performance.scandalPenalty) : "0"}`,
                  ];
                  return pieces.join(" • ");
                }),
                ...(entry.advertisingBonus ? [`Advertising ${signedNumberLabel(entry.advertisingBonus)}`] : []),
                `Total score ${entry.score}`,
                `Payout ${formatCash(entry.revenue)}`,
              ]
            : [`No band booked`, `Payout ${formatCash(entry.revenue)}`];

          return `
            <article class="result-card ${winners.includes(manager.name) && entry.revenue > 0 ? "result-winner" : ""}">
              <div class="result-card-head">
                <div>
                  <strong>${entry.bandLabel || "No band"}</strong>
                  <p>${manager.name}</p>
                </div>
                <span class="tag">${formatCash(entry.revenue)}</span>
              </div>
              ${winners.includes(manager.name) && entry.revenue > 0 ? `<p class="result-winner-copy">${winners.length > 1 ? `Split ${formatVictoryPoints(splitPoints)} VP` : `Won ${formatVictoryPoints(splitPoints)} VP`}</p>` : ""}
              <div class="result-lines">
                ${details.map((line) => `<div>${line}</div>`).join("")}
              </div>
            </article>
          `;
        })
        .join("");

      return `
        <section class="result-venue-section">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Venue ${venue.type}</p>
              <h4>${venue.name}</h4>
            </div>
            <span class="tag">${venue.venuePoints} VP</span>
          </div>
          <p class="result-venue-summary">Revenue factor x${venue.revenueFactor} • Booking fee already paid: ${formatCash(venue.cost)} • ${winners.length ? `${winners.length > 1 ? "Winners" : "Winner"}: ${winners.join(", ")} (${formatVictoryPoints(splitPoints)} VP each)` : "No winner"}</p>
          <div class="result-cards-grid">${cards}</div>
        </section>
      `;
    })
    .join("");

  els.resultsPanel.innerHTML = venueSections;
}

function renderStandings() {
  const ranked = [...state.managers].sort((a, b) => b.victoryPoints - a.victoryPoints || b.cash - a.cash);
  const topVictoryPoints = ranked[0]?.victoryPoints || 0;
  const leaders = ranked.filter((manager) => manager.victoryPoints === topVictoryPoints);
  const hasSingleLeader = leaders.length === 1 && topVictoryPoints > 0;
  els.standings.innerHTML = ranked
    .map(
      (manager, index) => `
        <button class="promoter-tile ${index === 0 ? "leader" : ""} ${manager.id === state.selectedPromoterId ? "selected" : ""}" data-promoter-card="${manager.id}" type="button">
          <div class="promoter-tile-head">
            ${renderPromoterPhoto(manager, "promoter-thumb-photo")}
            <div class="promoter-tile-body">
              <div class="promoter-tile-top">
                <strong>${manager.name}</strong>
                <div class="promoter-top-chips">
                  ${hasSingleLeader && manager.id === leaders[0].id ? `<span class="chip">Leader</span>` : ""}
                  <span class="chip">Victory Points ${formatVictoryPoints(manager.victoryPoints)} / ${VICTORY_TARGET}</span>
                  <span class="chip">Cash ${formatCash(manager.cash)}</span>
                </div>
              </div>
              <div class="promoter-tile-stats">
                <span>${manager.roster.length} band${manager.roster.length === 1 ? "" : "s"}</span>
                <span>Contracts ${formatCash(contractLoad(manager))}</span>
                ${!hasSingleLeader && manager.victoryPoints === topVictoryPoints ? `<span>Tied for first</span>` : ""}
              </div>
            </div>
          </div>
        </button>
      `
    )
    .join("");
}

function getPlayerRosterMarkup() {
  const player = state.managers[0];
  const futureRounds = visibleFutureRounds();
  const nextRound = futureRounds[0] || null;
  const nextRoundVenueFeeTotal = nextRound ? nextRound.venues.reduce((sum, venue) => sum + venue.cost, 0) : 0;
  const nextRoundVenueFeeLine = nextRound
    ? nextRound.venues.map((venue) => `${venue.type} ${formatCash(venue.cost)}`).join(" • ")
    : "";
  const weekOffPromptBands = weekOffPromptBandsForManager(player);
  const selectedWeekOffBands = new Set(state.pendingWeekOffChoices.player || []);
  const sittingOutBands = new Set(bandsSittingOutThisRound(player.id));

  const retainedNames = new Set(state.pendingRetentions.player || player.roster.map((band) => band.name));
  const pendingFee = player.roster
    .filter((band) => retainedNames.has(band.name))
    .reduce((sum, band) => sum + retentionCostForBand(band), 0);

  const rosterForDisplay =
    state.phase === "retention"
      ? [...player.roster].sort((leftBand, rightBand) => {
          const left = bandRetentionSnapshot(player, leftBand, currentRoundData()).estimatedValue;
          const right = bandRetentionSnapshot(player, rightBand, currentRoundData()).estimatedValue;
          return right - left || leftBand.name.localeCompare(rightBand.name);
        })
      : state.phase === "week_off"
        ? [...player.roster].sort((leftBand, rightBand) => {
            const leftPrompt = weekOffPromptBands.some(({ band }) => band.name === leftBand.name) ? 1 : 0;
            const rightPrompt = weekOffPromptBands.some(({ band }) => band.name === rightBand.name) ? 1 : 0;
            return rightPrompt - leftPrompt || leftBand.name.localeCompare(rightBand.name);
          })
      : player.roster;

  let markup = rosterForDisplay.length
    ? rosterForDisplay
        .map((band) => {
          const future = bestFutureRoundForBand(band, futureRounds);
          const retention = bandRetentionSnapshot(player, band, currentRoundData());
          const ongoingEffects = ongoingEffectsSummary(player.id, band.name);
          const weekOffEffects = weekOffEffectsForBand(player.id, band.name);
          const isWeekOffPrompt = state.phase === "week_off" && weekOffEffects.length > 0;
          const isSelectedForWeekOff = selectedWeekOffBands.has(band.name);
          const isSittingOut = sittingOutBands.has(band.name);
          const summaryLine =
            state.phase === "retention"
              ? retention.baseLine
              : `${band.genre} • Popularity ${band.popularity} • Scandal ${effectiveScandalNotation(player.id, band)} • Retention ${formatCash(band.retention)}`;
          const nextRoundFitLine = state.phase === "retention" ? nextRoundFitSummaryForBand(band, nextRound) : "";
          const detailLine =
            state.phase === "retention"
              ? `${retention.scandalStatus}${retention.modifierLine ? ` • ${retention.modifierLine}` : ""} • Adjusted rating ${retention.adjustedRating} • Expected score ${retention.estimatedValue.toFixed(1)}${retention.scoreRange ? ` • Range ${retention.scoreRange}` : ""}${nextRoundFitLine ? ` • ${nextRoundFitLine}` : ""}`
              : isWeekOffPrompt
                ? `${weekOffEffects.map((entry) => `${entry.subtitle} (-${entry.flatPenalty || 0})`).join(" • ")}. Take the week off now to clear ${weekOffEffects.length === 1 ? "this penalty" : "these penalties"} before bookings begin.`
                : isSittingOut
                  ? `Sitting out this round.${ongoingEffects ? ` • Remaining effects: ${ongoingEffects}` : ""}`
                  : `${future ? `Best future target: Round ${future.roundNumber} at ${future.strongestVenue.venue.type}: ${future.strongestVenue.venue.name}.` : "No future rounds left to target."}${ongoingEffects ? ` • Ongoing effects: ${ongoingEffects}` : ""}`;
          return `
            <div class="stack-item">
              <div class="roster-thumb-row">
                ${renderBandPhoto(band.name, "roster-thumb-photo")}
                <div class="roster-thumb-copy">
                  <strong>${band.name}</strong>
                  <p>${summaryLine}</p>
                  <p>${detailLine}</p>
                </div>
              </div>
              ${
                state.phase === "retention"
                  ? `<label class="field-label"><input type="checkbox" data-keep-band="${band.name}" ${retainedNames.has(band.name) ? "checked" : ""}> Pay retention cost of ${formatCash(retentionCostForBand(band))}?${taxTimeIsActive() ? ` <span class="card-meta">(Tax Time active: base ${formatCash(band.retention)})</span>` : ""}</label>`
                  : isWeekOffPrompt
                    ? `
                      <div class="action-row">
                        <button class="${isSelectedForWeekOff ? "primary-button" : "secondary-button"}" type="button" data-week-off-band="${band.name}" data-week-off-action="sit">
                          ${isSelectedForWeekOff ? "Taking Week Off" : "Take Week Off"}
                        </button>
                        <button class="${isSelectedForWeekOff ? "secondary-button" : "primary-button"}" type="button" data-week-off-band="${band.name}" data-week-off-action="stay">
                          ${isSelectedForWeekOff ? "Keep Active Instead" : "Keep Active"}
                        </button>
                      </div>
                    `
                  : ""
              }
            </div>
          `;
        })
        .join("")
    : `<div class="stack-item"><strong>No bands yet</strong><p>Bid to build your tour roster.</p></div>`;

  if (player.roster.length) {
    markup = `
      <div class="stack-item">
        <strong>Your Current Roster</strong>
        <p>${player.roster.length} band${player.roster.length === 1 ? "" : "s"} under contract: ${player.roster.map((band) => band.name).join(", ")}.</p>
      </div>
      ${markup}
    `;
  }

  if (state.phase === "retention" && player.roster.length) {
    markup = `
      <div class="stack-item">
        <strong>Retention Choices</strong>
        <p>Selected bands: ${retainedNames.size} • Total retention ${formatCash(pendingFee)} • Cash after retention ${formatCash(player.cash - pendingFee)}</p>
        ${taxTimeIsActive() ? `<p>Tax Time is active this round. Every retained band costs double its normal retention.</p>` : ""}
        ${nextRound
          ? `<p>Next round booking fees for all three venues: ${formatCash(nextRoundVenueFeeTotal)} total (${nextRoundVenueFeeLine}) • Cash after retention plus all three fees ${formatCash(player.cash - pendingFee - nextRoundVenueFeeTotal)}</p>`
          : `<p>No future round is visible right now.</p>`}
      </div>
      ${markup}
    `;
  }

  if (state.phase === "week_off" && weekOffPromptBands.length) {
    markup = `
      <div class="stack-item">
        <strong>Week Off Choices</strong>
        <p>${weekOffPromptBands.length} band${weekOffPromptBands.length === 1 ? "" : "s"} can sit out before this round starts. Selected to rest: ${selectedWeekOffBands.size}. Bands that rest cannot be booked this round and clear their current week-off penalties immediately.</p>
      </div>
      ${markup}
    `;
  }

  return markup;
}

function getScoutMarkupForManager(manager) {
  const roundData = currentRoundData();

  if (!manager) {
    return `<div class="stack-item"><strong>No promoter selected</strong><p>Choose a promoter to scout their roster.</p></div>`;
  }

  const rosterSummary = manager.roster.length
    ? `${manager.roster.length} band${manager.roster.length === 1 ? "" : "s"} under contract: ${manager.roster.map((band) => band.name).join(", ")}.`
    : "No bands under contract right now.";

  const managerSummary = `
    <div class="stack-item">
      <strong>${manager.name}</strong>
      <p>${formatVictoryPoints(manager.victoryPoints)} VP • Cash ${formatCash(manager.cash)} • Contracts ${formatCash(contractLoad(manager))}</p>
      <p>${rosterSummary}</p>
    </div>
  `;

  if (!manager.roster.length) {
    return `${managerSummary}<div class="stack-item"><strong>No bands yet</strong><p>This promoter has no active roster to scout.</p></div>`;
  }

  const bandCards = manager.roster
    .map((band) => {
      const bookingAssignment = roundData ? findBandAssignment(manager, band.name, roundData) : null;
      const bookedVenue = bookingAssignment?.venueType && roundData ? roundData.venues.find((entry) => entry.type === bookingAssignment.venueType) : null;
      const bookedEstimate = bookedVenue ? findVenuePerformance(estimatedVenueStrength(manager, bookedVenue, roundData), band.name) : null;
      const bestThisWeek = roundData
        ? roundData.venues
            .flatMap((venue) =>
              STANDARD_VENUE_BAND_SLOTS
                .filter((slot) => slot.key === HEADLINER_SLOT || venueHasBooking(manager, venue.type))
                .map((slot) => ({
                  venue,
                  slot,
                  revenue: projectedSlotRevenue(band, venue, slot.key),
                }))
            )
            .sort((left, right) => right.revenue - left.revenue)[0]
        : null;
      const ongoingEffects = ongoingEffectsSummary(manager.id, band.name);
      const summaryLine = `${band.genre} • Popularity ${band.popularity} • Scandal ${effectiveScandalNotation(manager.id, band)} • Retention ${formatCash(band.retention)}`;
      const detailLine =
        bookedVenue && bookedEstimate
          ? `Booked this round: ${bookedVenue.type}: ${bookedVenue.name} (${slotDisplayLabel(bookingAssignment.slotKey)}) • Current rating ${bookedEstimate.expectedNotation}${slotMultiplierText(bookedEstimate.slotKey)} • Est. value ${formatCash(bookedEstimate.weightedRevenue)}${ongoingEffects ? ` • Ongoing effects: ${ongoingEffects}` : ""}`
          : `Booked this round: Bench${bestThisWeek ? ` • Best current option ${bestThisWeek.venue.type}: ${bestThisWeek.venue.name} (${slotDisplayLabel(bestThisWeek.slot.key, { includeMultiplier: true })}, ${formatCash(bestThisWeek.revenue)})` : ""}${ongoingEffects ? ` • Ongoing effects: ${ongoingEffects}` : ""}`;

      return `
        <div class="stack-item">
          <div class="roster-thumb-row">
            ${renderBandPhoto(band.name, "roster-thumb-photo")}
            <div class="roster-thumb-copy">
              <strong>${band.name}</strong>
              <p>${summaryLine}</p>
              <p>${detailLine}</p>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  return `${managerSummary}${bandCards}`;
}

function getBandRosterMarkup() {
  const previewRounds = state.schedule.length ? upcomingRounds() : [];

  return [...bands]
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((band) => {
      const summary = bandProfileSummary(band);
      const avgPop = summary.popularityAverage.toFixed(1).replace(/\.0$/, "");
      const avgScandal = summary.scandalAverage.toFixed(1).replace(/\.0$/, "");
      const bestFuture = previewRounds.length ? bestFutureRoundForBand(band, previewRounds) : null;
      const strongestVenueText = bestFuture?.strongestVenue
        ? [
            `Best upcoming round: Round ${bestFuture.roundNumber}, especially ${bestFuture.strongestVenue.venue.type}: ${bestFuture.strongestVenue.venue.name} (${bestFuture.strongestVenue.fit >= 0 ? "+" : ""}${bestFuture.strongestVenue.fit}).`,
            `The schedule opens up most nicely in Round ${bestFuture.roundNumber}, where ${bestFuture.strongestVenue.venue.type}: ${bestFuture.strongestVenue.venue.name} looks especially promising (${bestFuture.strongestVenue.fit >= 0 ? "+" : ""}${bestFuture.strongestVenue.fit}).`,
            `Looking ahead, Round ${bestFuture.roundNumber} stands out as the clearest opportunity, especially at ${bestFuture.strongestVenue.venue.type}: ${bestFuture.strongestVenue.venue.name} (${bestFuture.strongestVenue.fit >= 0 ? "+" : ""}${bestFuture.strongestVenue.fit}).`,
          ][(slugifyBandName(band.name).charCodeAt(1) || 0) % 3]
        : [
            "Once the tour schedule is underway, this card will start highlighting the best future venue opportunities.",
            "As more rounds open up, this space will point toward the weeks where this act looks strongest.",
            "Future-round planning will matter more once the schedule is live; this section will call out the best openings.",
          ][(slugifyBandName(band.name).charCodeAt(2) || 0) % 3];

      return `
        <article class="band-roster-card">
          <h4 class="band-roster-title">${band.name}</h4>
          <div class="band-roster-head">
            ${renderBandRosterPhotoButton(band.name)}
            <div class="band-roster-heading">
              <div class="band-roster-meta-list">
                <p><strong>Genre</strong><span>${band.genre}</span></p>
                <p><strong>Popularity</strong><span>${band.popularity}</span></p>
                <p><strong>Scandal</strong><span>${band.scandal}</span></p>
                <p><strong>Retention</strong><span>${formatCash(band.retention)}</span></p>
                <p><strong>Average Popularity</strong><span>${avgPop}</span></p>
                <p><strong>Average Scandal</strong><span>${avgScandal}</span></p>
              </div>
            </div>
          </div>
          <div class="band-roster-copy">
            <p><strong>Value in the game:</strong> ${summary.valueRead}</p>
            <p><strong>Strategic read:</strong> ${summary.strategicRead}</p>
            <p><strong>Tour outlook:</strong> ${strongestVenueText}</p>
            <p><strong>More info:</strong> ${summary.infoRead}</p>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderBandRoster() {
  const markup = getBandRosterMarkup();
  if (els.bandRosterGrid) {
    els.bandRosterGrid.innerHTML = markup;
  }
  if (els.openingBandRoster) {
    els.openingBandRoster.innerHTML = markup;
  }
}

function venueCrowdSummary(venue) {
  const sortedFits = GENRE_KEYS
    .map((key) => ({ key, value: venue[key] || 0 }))
    .sort((a, b) => b.value - a.value);
  const bestFits = sortedFits.filter((entry) => entry.value > 0).slice(0, 3);
  const worstFits = [...sortedFits].reverse().filter((entry) => entry.value < 0).slice(0, 2);
  return {
    bestText: bestFits.length ? bestFits.map((entry) => `${formatGenreLabel(entry.key)} ${entry.value >= 0 ? "+" : ""}${entry.value}`).join(" • ") : "No strong genre lean",
    worstText: worstFits.length ? worstFits.map((entry) => `${formatGenreLabel(entry.key)} ${entry.value}`).join(" • ") : "No clear weak fit",
  };
}

function venueValueRead(venue) {
  if (venue.revenueFactor >= 3 || venue.venuePoints >= 12) {
    return "This is one of the headliner rooms on the tour, the kind of stop that can swing both Victory Points and bankroll in a single night.";
  }
  if (venue.venuePoints >= 8 || venue.revenueFactor >= 2) {
    return "A meaningful mid-to-upper tier stop where the right act can turn a good week into a serious move up the standings.";
  }
  return "A smaller room, but still useful for stealing points, building momentum, or finding value with the right niche act.";
}

function venueBookingRead(venue) {
  if (venue.cost >= 20) {
    return "The booking fee is a real commitment here, so a promoter should only send a band that has a believable chance to earn back the investment.";
  }
  if (venue.cost === 0) {
    return "With no booking fee, this room is forgiving. It is a good place to take a shot on an imperfect fit or a band you are still developing.";
  }
  return "This room asks for some budget discipline, but it is still accessible enough to tempt a promoter who sees the right matchup.";
}

function getVenueRosterMarkup() {
  return [...venues]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((venue) => {
      const crowd = venueCrowdSummary(venue);
      return `
        <article class="band-roster-card venue-roster-card">
          <h4 class="band-roster-title">${venue.name}</h4>
          <div class="venue-roster-head">
            ${renderVenueRosterPhotoButton(venue.name)}
            <div class="band-roster-meta-list">
              <p><strong>Victory Points</strong><span>${formatVictoryPoints(venue.venuePoints)}</span></p>
              <p><strong>Booking Fee</strong><span>${formatCash(venue.cost)}</span></p>
              <p><strong>Payout</strong><span>x${venue.revenueFactor}</span></p>
              <p><strong>Capacity</strong><span>${(venue.capacity || 0).toLocaleString()}</span></p>
              <p><strong>Best Fits</strong><span>${crowd.bestText}</span></p>
              <p><strong>Tough Crowd</strong><span>${crowd.worstText}</span></p>
            </div>
          </div>
          <div class="band-roster-copy">
            <div class="venue-roster-fit-panel">
              <strong>All Fits</strong>
              ${renderVenueFitGrid(venue, "venue-roster-fit-grid")}
            </div>
            <p><strong>Venue vibe:</strong> ${venue.description || "A live room waiting for the right act."}</p>
            <p><strong>Tour Importance:</strong> ${venueValueRead(venue)}</p>
            <p><strong>Booking read:</strong> ${venueBookingRead(venue)}</p>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderVenueRoster() {
  const markup = getVenueRosterMarkup();
  if (els.venueRosterGrid) {
    els.venueRosterGrid.innerHTML = markup;
  }
  if (els.openingVenueRoster) {
    els.openingVenueRoster.innerHTML = markup;
  }
}

function renderPlayerRoster() {
  const scoutingOpponent =
    state.activeWorkspace === "bands" &&
    state.activeSidebarView !== "your_bands" &&
    state.activeSidebarView !== "player";
  const selectedPromoter = scoutingOpponent
    ? state.managers.find((manager) => manager.id === state.activeSidebarView) || state.managers.find((manager) => manager.id === state.selectedPromoterId)
    : state.managers.find((manager) => manager.id === "player");

  if (scoutingOpponent) {
    els.bandsPanelEyebrow.textContent = "Promoter Scout";
    els.bandsPanelTitle.textContent = `${selectedPromoter.name}'s Bands`;
    els.playerRoster.innerHTML = getScoutMarkupForManager(selectedPromoter);
    return;
  }

  els.bandsPanelEyebrow.textContent = "Your Roster";
  els.bandsPanelTitle.textContent = "Bands Under Contract";
  els.playerRoster.innerHTML = getPlayerRosterMarkup();
}

function renderWorkspaceNav() {
  const navGroups = [
    {
      title: "Main Views",
      items: [
        { label: "Current Phase", action: "current_phase" },
        { label: "This Week", workspace: "this_week", sidebar: "this_week" },
        { label: "Standouts", workspace: "standouts", sidebar: "standouts" },
        { label: "Advertising", workspace: "advertising", sidebar: "advertising" },
        { label: "Top Earners", workspace: "top_earners", sidebar: "top_earners" },
        { label: "Upcoming Schedule", workspace: "upcoming", sidebar: "upcoming" },
        { label: "Your Cards", workspace: "cards", sidebar: "your_cards" },
        { label: "Auction Market", workspace: "auction", sidebar: "auction" },
        { label: "Your Bands", workspace: "bands", sidebar: "your_bands" },
        { label: "Band Roster", workspace: "band_roster", sidebar: "band_roster" },
        { label: "Venue Roster", workspace: "venue_roster", sidebar: "venue_roster" },
        { label: "Round Results", workspace: "results", sidebar: "results" },
        { label: "Tour Log", sidebar: "tour_log" },
      ],
    },
    {
      title: "Promoters",
      items: state.managers.map((manager) => ({
        label: manager.name,
        promoterId: manager.id,
      })),
    },
  ];

  els.workspaceNav.innerHTML = navGroups
    .map(
      (group) => `
        <div class="sidebar-nav-group">
          <p class="eyebrow">${group.title}</p>
          <div class="sidebar-nav-buttons">
            ${group.items
              .map((item) => {
                const isActive =
                  (item.action === "current_phase" && state.activeWorkspace === workspaceForPhase(state.phase)) ||
                  (item.workspace && item.workspace === state.activeWorkspace) ||
                  (item.sidebar && item.sidebar === state.activeSidebarView) ||
                  (item.promoterId && item.promoterId === state.activeSidebarView);
                return `<button class="sidebar-link ${isActive ? "active" : ""}" type="button"
                  ${item.action ? `data-nav-action="${item.action}"` : ""}
                  ${item.workspace ? `data-nav-workspace="${item.workspace}"` : ""}
                  ${item.sidebar ? `data-nav-sidebar="${item.sidebar}"` : ""}
                  ${item.promoterId ? `data-nav-promoter="${item.promoterId}"` : ""}>${item.label}</button>`;
              })
              .join("")}
          </div>
        </div>
      `
    )
    .join("");
}

function renderWorkspace() {
  if (state.activeWorkspace === "bands") {
    renderPlayerRoster();
  } else if (state.activeWorkspace === "band_roster") {
    renderBandRoster();
  } else if (state.activeWorkspace === "venue_roster") {
    renderVenueRoster();
  }
  const cardsFocusMode = state.phase === "cards" && state.activeWorkspace === "cards";
  const resultsFocusMode = (Boolean(state.showcase) || state.phase === "advertising") && state.activeWorkspace === "results";
  els.mainGrid?.classList.toggle("cards-focus-mode", cardsFocusMode);
  els.mainGrid?.classList.toggle("results-focus-mode", resultsFocusMode);
  els.cardsWorkspacePanel?.classList.toggle("cards-focus-panel", cardsFocusMode);
  els.workspacePanels.forEach((panel) => {
    panel.classList.toggle("hidden", panel.dataset.workspace !== state.activeWorkspace);
  });
}

function renderButtons() {
  const roundData = currentRoundData();
  const player = state.managers[0];
  const activeVenue = activeVenueForCards(roundData);
  const canConfirmWeekOffChoices = state.phase === "week_off";
  const auctionReady = roundData && assignmentIsComplete(player, roundData) && state.marketBands.every((band) => band.resolved);
  const auctionResolved = state.phase === "auction" && state.marketBands.every((band) => band.resolved);
  const canStartCards = state.phase === "auction" && auctionReady;
  const canPayBookingFees = state.phase === "booking_fees";
  const canRunShow = state.phase === "results" && Boolean(state.showcase);
  const canFinishCardCleanup = state.phase === "card_cleanup";
  const retentionFee = player.roster
    .filter((band) => (state.pendingRetentions.player || []).includes(band.name))
    .reduce((sum, band) => sum + retentionCostForBand(band), 0);
  const canConfirmRetention = state.phase === "retention" && retentionFee <= player.cash;
  const canStartNextRoundFromAdvertising = state.phase === "advertising";
  const pendingDefense = state.pendingDefenseChoice;
  const pendingCharityCase = state.pendingCharityCaseChoice;
  const pendingCharityAttacker = pendingCharityCase
    ? state.managers.find((manager) => manager.id === pendingCharityCase.managerId)
    : null;
  const pendingCharityLeader = pendingCharityCase
    ? state.managers.find((manager) => manager.id === pendingCharityCase.targetManagerId)
    : null;
  const pendingCharityChoices = pendingCharityCase && pendingCharityAttacker && pendingCharityLeader
    ? charityCaseBandChoices(pendingCharityLeader, pendingCharityAttacker)
    : [];
  const cleanupDiscardCount = cleanupDiscardChoicesForManager(player).length;
  const immediateCardStatus = state.phase === "cards" && state.activeCardManagerId === "player"
    ? immediateCardStatusText(player, roundData)
    : "";
  const roundLockedPlayPending = Boolean(immediateCardStatus);
  const noPlayableCards = state.phase === "cards" && state.activeCardManagerId === "player" && !playerHasPlayableCard();
  const viewingPastShowcaseVenue = state.phase === "results" && state.showcase && showcaseDisplayVenueIndex() !== state.showcase.venueIndex;
  const viewingSettledCurrentVenue = state.phase === "results" && state.showcase && !viewingPastShowcaseVenue && state.showcase.venueSettled;
  els.phaseActionsPanel.classList.toggle("hidden", state.phase === "booking_fees" || state.phase === "ready");

  els.runShowButton.textContent =
    state.phase === "week_off"
      ? "Confirm Week Off Plans"
      : state.phase === "card_cleanup"
      ? cleanupDiscardCount
        ? `Discard Selected (${cleanupDiscardCount})`
        : "Continue To Show"
      : state.phase === "cards"
      ? state.activeCardManagerId === "player"
        ? "Card Phase Live"
        : "Waiting On Other Promoters"
      : state.phase === "retention"
      ? "Pay Retention"
      : state.phase === "advertising"
        ? "Start Next Round"
      : auctionResolved && !state.reviewingAssignments
        ? state.activeWorkspace === "auction"
          ? "Review This Week"
          : "Auction Market"
      : state.phase === "auction" && !auctionResolved
        ? state.activeWorkspace === "auction"
          ? "Auction Market"
          : "Auction Market"
      : auctionResolved && state.reviewingAssignments
        ? "Ready For Card Phase"
      : canPayBookingFees
        ? "Pay Booking Fees"
      : state.phase === "results" && state.showcase
        ? viewingPastShowcaseVenue
          ? "Back To Live Venue"
          : viewingSettledCurrentVenue
            ? state.showcase.venueIndex < ROUND_VENUE_ORDER.length - 1
              ? "Go To Next Venue"
              : "Finish Round"
            : "Continue Show"
      : "Begin Card Phase";
  const canNavigateAuction = state.phase === "auction" && !auctionResolved;
  els.runShowButton.disabled = pendingDefense || pendingCharityCase || !(canConfirmWeekOffChoices || canFinishCardCleanup || canStartCards || canPayBookingFees || canRunShow || canConfirmRetention || canStartNextRoundFromAdvertising || canNavigateAuction || (auctionResolved && !state.reviewingAssignments));
  els.skipCardsButton.textContent =
    state.phase === "card_cleanup"
      ? "Keep Remaining Cards"
      : state.phase === "cards" && state.activeCardManagerId !== "player"
        ? "Continue Card Phase"
        : "Pass Card Play";
  els.skipCardsButton.disabled =
    pendingDefense ||
    pendingCharityCase ||
    (
      state.phase === "card_cleanup"
        ? false
        : roundLockedPlayPending || !(state.phase === "cards" && state.activeCardManagerId === "player")
    );
  if (state.phase === "cards" && state.activeCardManagerId !== "player") {
    els.skipCardsButton.disabled = Boolean(pendingDefense || pendingCharityCase);
  }
  els.skipCardsButton.classList.toggle("hidden", state.phase !== "cards" && state.phase !== "card_cleanup");
  els.nextRoundButton.classList.toggle("hidden", true);
  els.phaseActionExtra.innerHTML = pendingDefense
    ? `
      ${pendingDefense.goodPrId ? `<button class="secondary-button" data-defense-response="good_pr">Use Good PR</button>` : ""}
      ${pendingDefense.commonSenseId ? `<button class="secondary-button" data-defense-response="common_sense">Use Common Sense</button>` : ""}
      ${pendingDefense.superLawyerId ? `<button class="secondary-button" data-defense-response="super_lawyer">Use Super Lawyer</button>` : ""}
      <button class="primary-button" data-defense-response="decline">Let It Land</button>
    `
    : pendingCharityCase && pendingCharityChoices.length
      ? `
        <select class="assignment-select" data-charity-case-target>
          ${pendingCharityChoices.map((choice, index) => {
            const venueLine = choice.becomesSpecialGuest
              ? `${choice.venueType}: ${choice.venueName || "Venue"} -> becomes Special Guest`
              : choice.isSittingOut
                ? "Sitting out this week"
                : choice.venueType === "roster"
                  ? "Already performed this round"
                : "On the bench";
            return `<option value="${encodeCardTarget(choice)}" ${index === 0 ? "selected" : ""}>${choice.bandName} (${venueLine})</option>`;
          }).join("")}
        </select>
        <button class="primary-button" data-charity-case-confirm="1">Give Up This Band</button>
      `
    : "";

  const basePhaseStatus =
    pendingDefense
      ? `${pendingDefense.managerName} played ${defensePromptLabel(pendingDefense.card)} on ${pendingDefense.bandName}. Do you want to defend that band?`
      : pendingCharityCase
      ? `${pendingCharityCase.managerName} played ${cardTitleText(pendingCharityCase.card)} on you. Choose which band you must hand over.`
      : roundLockedPlayPending
      ? immediateCardStatus
      : noPlayableCards
      ? `No legal card targets remain for ${activeVenue?.name || "this venue"}. Pass when you're ready.`
      : state.phase === "cards"
      ? state.lastCardActionText || (state.activeCardManagerId === "player"
          ? `It is your turn for ${activeVenue?.name || "this venue"}. Play one card or pass for the rest of the current card phase.`
          : `Card phase is already live for ${activeVenue?.name || "this venue"}. Press Continue Card Phase to reveal the next play.`)
      : state.phase === "booking_fees"
        ? "Pay the venue booking fees before the bands take the stage."
      : state.phase === "results" && state.showcase
        ? viewingPastShowcaseVenue
          ? `Reviewing ${currentRoundData()?.venues[showcaseDisplayVenueIndex()]?.type || "an earlier venue"} while ${currentRoundData()?.venues[state.showcase.venueIndex]?.type || "the live venue"} remains current. Press Back To Live Venue when you're ready to continue.`
          : state.showcase.message
      : state.phase === "ready"
        ? "Booking fees are paid. The show is ready to run."
      : state.phase === "card_cleanup"
        ? cleanupDiscardCount
          ? "Discard the selected leftover cards now, or keep everything and go straight into the final show."
          : "You can keep the rest of your hand, or mark any unused cards to throw away before next round's redraw."
      : state.phase === "week_off"
        ? "Choose whether any week-off penalty bands should sit out before this round starts. Resting bands cannot be booked this week."
      : state.phase === "retention"
          ? "Choose which bands to keep, pay their retention, and then move into advertising for future venues."
          : state.phase === "advertising"
            ? advertisingPlacementsThisRound(player.id).length
              ? "Your advertising buy is locked in. Start the next round when you're ready."
              : "You may place one face-down advertising buy on a venue in the next five rounds, or skip straight to the next round."
          : state.phase === "auction" && !auctionResolved && state.activeWorkspace !== "auction"
            ? "Review this board, then open the auction."
          : state.phase === "auction" && !auctionResolved
            ? "Auction time. Bid on the bands that improve this week's venue lineup."
          : auctionResolved && !state.reviewingAssignments
            ? "Auction complete. Review this week's bookings."
          : auctionResolved && state.reviewingAssignments
              ? "Check the venue dropdowns, then press Ready For Card Phase."
            : "";
  const activeClimateStatus =
    state.globalRevenueClimate?.effect === "music_fever"
      ? "Active market: Music Fever is doubling all payouts this round."
      : state.globalRevenueClimate?.effect === "recession"
        ? "Active market: Recession is halving all payouts this round."
        : "";
  const activeRetentionStatus = taxTimeIsActive()
    ? "Active market: Tax Time will double all retention payments after this round."
    : "";
  const activeCardManager = state.phase === "cards"
    ? state.managers.find((manager) => manager.id === state.activeCardManagerId)
    : null;
  const activeTurnStatus =
    state.phase === "cards" && state.activeCardManagerId && state.activeCardManagerId !== "player"
      ? `${activeCardManager?.name || "Another promoter"} is currently taking the live card turn.`
      : "";
  els.phaseActionStatus.textContent =
    [basePhaseStatus, activeTurnStatus, activeClimateStatus, activeRetentionStatus]
      .filter(Boolean)
      .join(" ");
}

function renderComplete() {
  const ranked = [...state.managers].sort((a, b) => b.victoryPoints - a.victoryPoints || b.cash - a.cash);
  const winner = ranked[0];
  const runnerUp = ranked[1] || null;
  const currentRound = currentRoundData();
  const winningMargin = runnerUp ? winner.victoryPoints - runnerUp.victoryPoints : winner.victoryPoints;
  const richestManager = [...ranked].sort((a, b) => b.cash - a.cash || b.victoryPoints - a.victoryPoints)[0];
  const biggestRosterManager = [...ranked].sort((a, b) => b.roster.length - a.roster.length || b.victoryPoints - a.victoryPoints)[0];
  const heaviestContractsManager = [...ranked].sort((a, b) => contractLoad(b) - contractLoad(a) || b.victoryPoints - a.victoryPoints)[0];
  const featuredBandEntry = [...winner.roster]
    .map((band) => ({
      band,
      snapshot: bandRetentionSnapshot(winner, band, currentRound),
    }))
    .sort((left, right) => right.snapshot.estimatedValue - left.snapshot.estimatedValue || parseDiceAverage(right.band.popularity) - parseDiceAverage(left.band.popularity))[0] || null;
  const placeLabel = (place) => {
    if (place === 1) return "1st";
    if (place === 2) return "2nd";
    if (place === 3) return "3rd";
    return `${place}th`;
  };
  const title = winner.isPlayer ? "You Won The Tour" : `${winner.name} Wins The Tour`;
  const summary = winner.isPlayer
    ? `You closed out the tour with ${formatVictoryPoints(winner.victoryPoints)} Victory Points and ${formatCash(winner.cash)} still in the bank.`
    : `${winner.name} closed out the tour with ${formatVictoryPoints(winner.victoryPoints)} Victory Points and ${formatCash(winner.cash)} still in the bank.`;
  const synopsisLines = endgameSynopsisForWinner(winner, runnerUp);
  els.resultsPanel.innerHTML = `
    <section class="tour-finale">
      <article class="tour-finale-hero">
        <div class="tour-finale-champion">
          <div class="tour-finale-photo-wrap">
            ${renderPromoterPhoto(winner, "tour-finale-photo")}
          </div>
          <div class="tour-finale-copy">
            <p class="eyebrow">World Tour Champion</p>
            <h2>${title}</h2>
            <p class="tour-finale-summary">${summary}</p>
            <div class="tour-finale-chips">
              <span class="chip">Won by ${formatVictoryPoints(winningMargin)} VP</span>
              <span class="chip">After ${state.round} rounds</span>
              <span class="chip">${winner.roster.length} bands under contract</span>
              <span class="chip">Contracts ${formatCash(contractLoad(winner))}</span>
            </div>
          </div>
        </div>
        <div class="tour-finale-stat-grid">
          <div class="tour-finale-stat">
            <strong>Final VP</strong>
            <span>${formatVictoryPoints(winner.victoryPoints)}</span>
          </div>
          <div class="tour-finale-stat">
            <strong>Final Cash</strong>
            <span>${formatCash(winner.cash)}</span>
          </div>
          <div class="tour-finale-stat">
            <strong>Closest Rival</strong>
            <span>${runnerUp ? `${runnerUp.name} • ${formatVictoryPoints(runnerUp.victoryPoints)} VP` : "Nobody close"}</span>
          </div>
          <div class="tour-finale-stat">
            <strong>Tour Margin</strong>
            <span>${formatVictoryPoints(winningMargin)} VP</span>
          </div>
        </div>
      </article>

      <article class="tour-finale-panel">
        <div class="tour-finale-panel-head">
          <div>
            <p class="eyebrow">Tour Synopsis</p>
            <h3>Why ${winner.isPlayer ? "You Won" : `${winner.name} Won`}</h3>
          </div>
        </div>
        <div class="tour-finale-synopsis">
          ${synopsisLines.map((line) => `<p>${line}</p>`).join("")}
        </div>
      </article>

      <div class="tour-finale-grid">
        <article class="tour-finale-panel">
          <div class="tour-finale-panel-head">
            <div>
              <p class="eyebrow">Final Standings</p>
              <h3>Last Night Of The Tour</h3>
            </div>
          </div>
          <div class="tour-finale-standings">
            ${ranked.map((manager, index) => `
              <article class="tour-finale-standing ${index === 0 ? "winner" : ""}">
                <div class="tour-finale-standing-rank">${placeLabel(index + 1)}</div>
                <div class="tour-finale-standing-photo">
                  ${renderPromoterPhoto(manager, "tour-finale-standing-thumb")}
                </div>
                <div class="tour-finale-standing-body">
                  <h4>${manager.name}</h4>
                  <p>${manager.roster.length} bands • Contracts ${formatCash(contractLoad(manager))}</p>
                </div>
                <div class="tour-finale-standing-stats">
                  <strong>${formatVictoryPoints(manager.victoryPoints)} VP</strong>
                  <span>${formatCash(manager.cash)}</span>
                </div>
              </article>
            `).join("")}
          </div>
        </article>

        <div class="tour-finale-side">
          ${featuredBandEntry ? `
            <article class="tour-finale-panel tour-finale-featured-band">
              <p class="eyebrow">Signature Act</p>
              <div class="tour-finale-featured-band-head">
                ${renderBandPhoto(featuredBandEntry.band.name, "tour-finale-featured-photo")}
                <div>
                  <h3>${featuredBandEntry.band.name}</h3>
                  <p>${featuredBandEntry.band.genre} • Popularity ${featuredBandEntry.band.popularity}</p>
                  <p>${featuredBandEntry.snapshot.scandalStatus}</p>
                </div>
              </div>
              <div class="tour-finale-featured-stats">
                <span class="chip">Expected score ${formatVictoryPoints(featuredBandEntry.snapshot.estimatedValue)}</span>
                <span class="chip">Retention ${formatCash(featuredBandEntry.band.retention)}</span>
              </div>
            </article>
          ` : ""}

          <article class="tour-finale-panel">
            <p class="eyebrow">Tour Highlights</p>
            <div class="tour-finale-highlights">
              <div class="tour-finale-highlight">
                <strong>Richest Promoter</strong>
                <span>${richestManager.name}</span>
                <em>${formatCash(richestManager.cash)}</em>
              </div>
              <div class="tour-finale-highlight">
                <strong>Deepest Roster</strong>
                <span>${biggestRosterManager.name}</span>
                <em>${biggestRosterManager.roster.length} bands</em>
              </div>
              <div class="tour-finale-highlight">
                <strong>Highest Contract Load</strong>
                <span>${heaviestContractsManager.name}</span>
                <em>${formatCash(contractLoad(heaviestContractsManager))}</em>
              </div>
            </div>
          </article>
        </div>
      </div>

      <article class="tour-finale-panel">
        <div class="tour-finale-panel-head">
          <div>
            <p class="eyebrow">Top Earners</p>
            <h3>Biggest Moneymakers Of The Tour</h3>
          </div>
        </div>
        ${renderTopEarnersMarkup({
          panelClass: "tour-finale-top-earners",
          title: "Top Earning Bands",
          description: "These acts made the most money across the whole tour, which often helps explain who controlled the board late.",
          limit: 8,
        })}
      </article>
    </section>
  `;
  els.cardsPanel.innerHTML = "";
  els.assignmentGrid.innerHTML = "";
  els.auctionGrid.innerHTML = "";
  if (els.standoutsPanel) {
    els.standoutsPanel.innerHTML = "";
  }
  if (els.advertisingPanel) {
    els.advertisingPanel.innerHTML = "";
  }
  if (els.topEarnersPanel) {
    els.topEarnersPanel.innerHTML = renderTopEarnersMarkup();
  }
  els.runShowButton.disabled = true;
  els.skipCardsButton.classList.add("hidden");
  els.nextRoundButton.classList.add("hidden");
}

function renderRevenueClimateAlert() {
  if (!els.climateModal || !els.climateModalTitle || !els.climateModalBody || !els.climateModalDetail) {
    return;
  }

  const alert = state.revenueClimateAlert;
  if (!alert) {
    els.climateModal.classList.add("hidden");
    els.climateModal.setAttribute("aria-hidden", "true");
    return;
  }

  els.climateModalTitle.textContent = alert.title || "Market Shift";
  els.climateModalDetail.textContent = alert.detail || "";
  els.climateModalDetail.classList.toggle("hidden", !alert.detail);
  els.climateModalBody.textContent = alert.body || "";
  els.climateModal.classList.remove("hidden");
  els.climateModal.setAttribute("aria-hidden", "false");
}

function renderBandRevealAlert() {
  if (!els.bandRevealModal || !els.bandRevealTitle || !els.bandRevealBody || !els.bandRevealCard || !els.bandRevealDetail) {
    return;
  }

  const alert = state.bandRevealAlert;
  if (!alert) {
    els.bandRevealModal.classList.add("hidden");
    els.bandRevealModal.setAttribute("aria-hidden", "true");
    els.bandRevealCard.innerHTML = "";
    return;
  }

  const band = alert.band;
  els.bandRevealTitle.textContent = alert.title || "Special Guest Arrives";
  els.bandRevealDetail.textContent = alert.detail || "";
  els.bandRevealDetail.classList.toggle("hidden", !alert.detail);
  els.bandRevealBody.textContent = alert.body || "";
  els.bandRevealCard.innerHTML = band ? `
    <div class="band-reveal-grid">
      ${renderBandPhoto(band.name, "intro-band-photo")}
      <div class="band-reveal-meta">
        <p><strong>${band.name}</strong></p>
        <p>${band.genre}</p>
        <p>Popularity ${band.popularity} • Scandal ${band.scandal}</p>
        <p>Retention ${formatCash(band.retention)}</p>
        <p>${alert.venueName ? `Booked at ${alert.venueName} as a Special Guest.` : "Booked as a Special Guest this week."}</p>
      </div>
    </div>
  ` : "";
  els.bandRevealModal.classList.remove("hidden");
  els.bandRevealModal.setAttribute("aria-hidden", "false");
}

function render() {
  renderSchedule();
  renderStandings();
  renderPlayerRoster();
  renderBandRoster();
  renderVenueRoster();
  renderStandoutsPanel();
  renderAdvertisingWorkspacePanel();
  renderTopEarnersPanel();
  renderWorkspaceNav();

  if (state.phase === "complete") {
    renderComplete();
    renderWorkspace();
    return;
  }

  renderVenuePanel();
  renderAssignments();
  renderCardsPanel();
  renderAuction();
  renderResults();
  renderButtons();
  renderWorkspace();
  renderRevenueClimateAlert();
  renderBandRevealAlert();
}

els.startButton.addEventListener("click", startGame);
els.viewRosterButton.addEventListener("click", openRosterScreen);
els.viewVenueRosterButton.addEventListener("click", openVenueRosterScreen);
els.rosterBackButton.addEventListener("click", closeRosterScreen);
els.venueRosterBackButton.addEventListener("click", closeVenueRosterScreen);
els.introNextButton.addEventListener("click", advanceIntro);
els.photoModalClose.addEventListener("click", closePhotoModal);
els.photoModalImage.addEventListener("click", closePhotoModal);
els.photoModalFallback.addEventListener("click", closePhotoModal);
els.climateModalClose?.addEventListener("click", closeRevenueClimateAlert);
els.bandRevealClose?.addEventListener("click", closeBandRevealAlert);
els.photoModalImage.addEventListener("error", () => {
  els.photoModalImage.classList.add("hidden");
  els.photoModalFallback.classList.remove("hidden");
});
els.runShowButton.addEventListener("click", () => {
  if (state.phase === "week_off") {
    finalizeWeekOffChoices();
  } else if (state.phase === "card_cleanup") {
    finishCardCleanup();
  } else if (state.phase === "auction") {
    if (!state.marketBands.every((band) => band.resolved) && state.activeWorkspace !== "auction") {
      state.activeWorkspace = "auction";
      state.activeSidebarView = "auction";
      render();
      return;
    }
    if (!state.marketBands.every((band) => band.resolved) && state.activeWorkspace === "auction") {
      state.activeWorkspace = "this_week";
      state.activeSidebarView = "this_week";
      render();
      return;
    }
    if (state.marketBands.every((band) => band.resolved) && !state.reviewingAssignments) {
      state.reviewingAssignments = true;
      state.activeWorkspace = "this_week";
      state.activeSidebarView = "this_week";
      render();
      return;
    }
    startCardPhase();
  } else if (state.phase === "booking_fees") {
    payBookingFees();
  } else if (state.phase === "results" && state.showcase) {
    if (showcaseDisplayVenueIndex() !== state.showcase.venueIndex) {
      state.showcase.viewVenueIndex = state.showcase.venueIndex;
      render();
      return;
    }
    advanceShowcase();
  } else if (state.phase === "ready") {
    runShow();
  } else if (state.phase === "advertising") {
    dealRound();
  } else if (state.phase === "retention") {
    applyRetentionPhase();
  }
});
els.skipCardsButton.addEventListener("click", () => {
  if (state.phase === "card_cleanup") {
    finishCardCleanup({ keepAll: true });
    return;
  }
  if (state.phase === "cards" && state.activeCardManagerId !== "player") {
    advanceCardTurns();
    if (state.phase === "cards") {
      render();
    }
    return;
  }
  passCardPhase();
});
els.nextRoundButton.addEventListener("click", dealRound);
document.addEventListener("input", (event) => {
  const bidIndex = event.target.dataset.bidInput;
  if (bidIndex === undefined) {
    return;
  }

  const band = state.marketBands[Number(bidIndex)];
  if (band) {
    band.playerBid = Number(event.target.value);
  }
});

document.addEventListener("change", (event) => {
  const venueType = event.target.dataset.assignVenue;
  const advertisingTargetSelect = "adTargetSelect" in event.target.dataset;
  if (venueType !== undefined) {
    const slotKey = event.target.dataset.assignSlot || HEADLINER_SLOT;
    setPlayerAssignment(venueType, slotKey, event.target.value);
    return;
  }

  if (advertisingTargetSelect) {
    state.selectedAdvertisingTarget = event.target.value || "";
    render();
    return;
  }

  const keepBand = event.target.dataset.keepBand;
  if (keepBand !== undefined) {
    toggleRetention(keepBand, event.target.checked);
    return;
  }

  const discardCard = event.target.dataset.discardCard;
  if (discardCard !== undefined) {
    togglePlayerCleanupDiscard(discardCard, event.target.checked);
  }
});

document.addEventListener("click", (event) => {
  const bidButton = event.target.closest("[data-bid-band]");
  const passButton = event.target.closest("[data-pass-band]");
  const playCardButton = event.target.closest("[data-play-card]");
  const defenseButton = event.target.closest("[data-defense-response]");
  const inlineActionButton = event.target.closest("[data-inline-action]");
  const bidIndex = bidButton?.dataset.bidBand;
  const passIndex = passButton?.dataset.passBand;
  const playCardId = playCardButton?.dataset.playCard;
  const defenseResponse = defenseButton?.dataset.defenseResponse;
  const inlineAction = inlineActionButton?.dataset.inlineAction;
  const previewRound = event.target.dataset.previewRound || event.target.closest("[data-preview-round]")?.dataset.previewRound;
  const promoterId = event.target.closest("[data-promoter-card]")?.dataset.promoterCard;
  const navAction = event.target.dataset.navAction;
  const navWorkspace = event.target.dataset.navWorkspace;
  const navSidebar = event.target.dataset.navSidebar;
  const navPromoter = event.target.dataset.navPromoter;
  const showcaseLineup = event.target.closest("[data-showcase-lineup]")?.dataset.showcaseLineup;
  const showcaseVenueIndex = event.target.dataset.showcaseVenue;
  const advertisingValue = event.target.closest("[data-ad-value]")?.dataset.adValue;
  const advertisingTarget = event.target.closest("[data-ad-target]")?.dataset.adTarget;
  const placeAdvertisingAction = Boolean(event.target.closest("[data-place-advertising]"));
  const photoOpen = event.target.closest("[data-photo-open]")?.dataset.photoOpen;
  const photoSrc = event.target.closest("[data-photo-open]")?.dataset.photoSrc;
  const playerIconChoice = event.target.closest("[data-player-icon-choice]")?.dataset.playerIconChoice;
  const weekOffBand = event.target.closest("[data-week-off-band]")?.dataset.weekOffBand;
  const weekOffAction = event.target.closest("[data-week-off-action]")?.dataset.weekOffAction;
  const placeMegaConcert = Boolean(event.target.closest("[data-place-mega-concert]"));
  const confirmCharityCase = Boolean(event.target.closest("[data-charity-case-confirm]"));

  if (event.target === els.photoModal) {
    closePhotoModal();
    return;
  }

  if (playerIconChoice !== undefined) {
    if (els.playerIcon) {
      els.playerIcon.value = playerIconChoice;
      updatePlayerIconPicker();
    }
    return;
  }

  if (weekOffBand !== undefined && weekOffAction !== undefined) {
    togglePlayerWeekOffChoice(weekOffBand, weekOffAction === "sit");
    return;
  }

  if (photoOpen !== undefined) {
    openPhotoModal(photoOpen, photoSrc);
    return;
  }

  if (promoterId !== undefined) {
    state.selectedPromoterId = promoterId;
    state.activeWorkspace = "bands";
    state.activeSidebarView = promoterId;
    renderStandings();
    renderWorkspaceNav();
    renderWorkspace();
    return;
  }

  if (navAction === "current_phase") {
    state.activeWorkspace = workspaceForPhase(state.phase);
    state.activeSidebarView =
      state.phase === "retention" || state.phase === "week_off"
        ? "your_bands"
        : state.phase === "cards" || state.phase === "ready"
          ? "your_cards"
          : state.phase === "results" || state.phase === "complete"
            ? "results"
            : "this_week";
    renderWorkspaceNav();
    renderWorkspace();
    return;
  }

  if (navPromoter !== undefined) {
    state.selectedPromoterId = navPromoter;
    state.activeWorkspace = "bands";
    state.activeSidebarView = navPromoter === "player" ? "your_bands" : navPromoter;
    renderStandings();
    renderWorkspaceNav();
    renderWorkspace();
    return;
  }

  if (navWorkspace !== undefined || navSidebar !== undefined) {
    if (navWorkspace !== undefined) {
      state.activeWorkspace = navWorkspace;
    }
    if (navSidebar !== undefined) {
      state.activeSidebarView = navSidebar;
    }
    if (navWorkspace === "bands" || navSidebar === "your_bands") {
      state.selectedPromoterId = "player";
      state.activeSidebarView = "your_bands";
    }
    if (navWorkspace === "results" && state.showcase) {
      const latestSettled = latestSettledVenueIndex();
      if (latestSettled >= 0) {
        state.showcase.viewVenueIndex = latestSettled;
      }
    }
    renderWorkspaceNav();
    renderWorkspace();
    return;
  }

  if (showcaseLineup !== undefined) {
    const venueIndex = Number(event.target.closest("[data-showcase-lineup]")?.dataset.showcaseVenue || NaN);
    if (Number.isFinite(venueIndex)) {
      setShowcaseSelectedManager(venueIndex, showcaseLineup);
    }
    return;
  }

  if (showcaseVenueIndex !== undefined) {
    setShowcaseViewVenueIndex(Number(showcaseVenueIndex));
    return;
  }

  if (advertisingValue !== undefined) {
    state.selectedAdvertisingValue = Number(advertisingValue);
    render();
    return;
  }

  if (advertisingTarget !== undefined) {
    state.selectedAdvertisingTarget = advertisingTarget;
    render();
    return;
  }

  if (placeAdvertisingAction) {
    placeAdvertising(state.managers[0], state.selectedAdvertisingTarget, state.selectedAdvertisingValue);
    render();
    return;
  }

  if (placeMegaConcert) {
    const select = document.querySelector("[data-mega-concert-target]");
    resolvePlayerMegaConcertPlacement(select?.value || "");
    return;
  }

  if (confirmCharityCase) {
    const select = document.querySelector("[data-charity-case-target]");
    resolvePendingCharityCase(select?.value || "");
    return;
  }

  if (previewRound !== undefined) {
    setSelectedPreviewRound(Number(previewRound));
    return;
  }

  if (defenseResponse !== undefined) {
    resolvePendingDefense(defenseResponse);
    return;
  }

  if (inlineAction === "pay-booking-fees") {
    payBookingFees();
    return;
  }

  if (inlineAction === "run-show") {
    runShow();
    return;
  }

  if (bidIndex !== undefined) {
    const card = event.target.closest(".band-card");
    const input = card?.querySelector(`[data-bid-input="${bidIndex}"]`) || document.querySelector(`[data-bid-input="${bidIndex}"]`);
    const inputValue = input instanceof HTMLInputElement ? input.valueAsNumber : Number(input?.value);
    const currentValue = Number.isFinite(inputValue) ? inputValue : state.marketBands[Number(bidIndex)]?.playerBid ?? 0;
    if (state.marketBands[Number(bidIndex)]) {
      state.marketBands[Number(bidIndex)].playerBid = currentValue;
    }
    resolveAuction(Number(bidIndex), currentValue, false);
    return;
  }

  if (passIndex !== undefined) {
    resolveAuction(Number(passIndex), 0, true);
    return;
  }

  if (playCardId !== undefined) {
    const cardRoot = playCardButton?.closest(".tour-card");
    const select = cardRoot?.querySelector(`[data-card-target="${playCardId}"]`) || document.querySelector(`[data-card-target="${playCardId}"]`);
    playPlayerCard(playCardId, select?.value || "");
  }
});

renderBandRoster();
renderVenueRoster();
updatePlayerIconPicker();
