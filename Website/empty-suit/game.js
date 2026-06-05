const SAVE_KEY = "emptySuitRoadTo270Save";
const STARTING_AP = 6;
const MEDIA_BUYS_PER_TURN = 2;
const TURNS_PER_REGION = 5;
const STARTING_MONEY = 70;
const STARTING_MOMENTUM = 50;
const STARTING_FAVORABILITY = 50;
const STARTING_FATIGUE = 12;
const STAT_MIN = 2;
const STAT_MAX = 8;
const BONUS_POINTS = 12;
const BASE_STAT_VALUE = 4;
const PLAYER_STATS = [
  { key: "charisma", label: "Charisma" },
  { key: "discipline", label: "Discipline" },
  { key: "authenticity", label: "Authenticity" },
  { key: "fundraising", label: "Fundraising" },
  { key: "debateSkill", label: "Debate Skill" },
  { key: "stamina", label: "Stamina" },
];
const ISSUE_KEYS = [
  "economy",
  "healthcare",
  "immigration",
  "crime",
  "environment",
  "values",
  "corruption",
  "unity",
];
const TONES = ["Hopeful", "Angry", "Serious", "Folksy", "Inspirational", "Aggressive"];
const ACTION_DEFS = {
  rally: {
    label: "Rally",
    apCost: 2,
    moneyCost: 0,
    needsState: true,
    needsMessage: true,
    needsTone: true,
    needsDetail: false,
    needsOpponent: false,
  },
  visit: {
    label: "Local Visit",
    apCost: 1,
    moneyCost: 0,
    needsState: true,
    needsMessage: true,
    needsTone: true,
    needsDetail: false,
    needsOpponent: false,
  },
  endorsement: {
    label: "Major Endorsement Meeting",
    apCost: 1,
    moneyCost: 0,
    needsState: true,
    needsMessage: true,
    needsTone: true,
    needsDetail: true,
    detailOptions: ["union", "business", "religious", "environmental", "veterans"],
    needsOpponent: false,
  },
  ad: {
    label: "Ad Buy",
    apCost: 0,
    moneyCost: 18,
    needsState: true,
    needsMessage: true,
    needsTone: true,
    needsDetail: true,
    detailOptions: ["positive", "negative"],
    needsOpponent: true,
    mediaOnly: true,
  },
  fundraise: {
    label: "Fundraising",
    apCost: 1,
    moneyCost: 0,
    needsState: false,
    needsMessage: false,
    needsTone: false,
    needsDetail: false,
    needsOpponent: false,
  },
  rest: {
    label: "Rest / Prep",
    apCost: 1,
    moneyCost: 0,
    needsState: false,
    needsMessage: false,
    needsTone: false,
    needsDetail: false,
    needsOpponent: false,
  },
  poll: {
    label: "Paid Polling",
    apCost: 1,
    moneyCost: 10,
    needsState: true,
    needsMessage: false,
    needsTone: false,
    needsDetail: false,
    needsOpponent: false,
  },
};
const CAMPAIGN_MANUAL = {
  intro:
    "The Empty Suit is a compressed presidential primary simulator built around map reading, timing, and campaign tradeoffs. Use this manual as a living reference for choosing a candidate, reading the board, and deciding what each day is actually for.",
  candidateCards: [
    {
      name: "Joseph Pepper",
      summary: "A steadier, electability-heavy coalition keeper with a forgiving learning curve.",
      tips: ["Best for players who want a broad, stable lane.", "Usually rewards discipline more than spectacle."],
    },
    {
      name: "Wicked Jim DeVito",
      summary: "A combative insider who can pressure the board, but whose image needs more careful handling.",
      tips: ["Best for players who want a tougher, more tactical run.", "Less naturally loved in reform-heavy terrain."],
    },
    {
      name: "Curtis Coolwater",
      summary: "A reform-minded, media-friendly candidate with strong upside in fluid and diverse states.",
      tips: ["Best for players who want flexibility and narrative upside.", "Can benefit sharply from good timing and momentum."],
    },
    {
      name: "Camila Olivia Acosta",
      summary: "A movement-progressive candidate built for youth, reform, and activist-heavy terrain.",
      tips: ["Best for players comfortable with sharper ideological tradeoffs.", "Most dangerous where progressive energy is already present."],
    },
    {
      name: "Buzz Smiley",
      summary: "A media-savvy conservative outsider who can stay loud, broad, and disruptive.",
      tips: ["Best for players who want message splash and reach.", "Can be useful when the race rewards attention and contrast."],
    },
    {
      name: "Hernando \"Captain\" Zoogle",
      summary: "A celebrity outsider with volatility, youth appeal, and real boom-or-bust energy.",
      tips: ["Best for players who want a high-variance campaign.", "Works best when you can turn noise into actual state pressure."],
    },
    {
      name: "Monica Steele",
      summary: "A disciplined movement conservative with sharper ideological edges and strong activist intensity.",
      tips: ["Best for players who want a more conviction-driven conservative lane.", "Can be dangerous where values and security politics are doing real work."],
    },
    {
      name: "Cornelius St. Hilton",
      summary: "An establishment conservative built around trust, electability, and donor-friendly steadiness.",
      tips: ["Best for players who want the safest Republican governing lane.", "Usually rewards structure, targeting, and a calmer board read."],
    },
  ],
  sections: [
    {
      title: "How To Read The Map",
      paragraphs: [
        "Always separate live states from on-deck states. Live states decide today. On-deck states decide whether you are arriving prepared or already late.",
        "The best campaigns usually work one or two real battlegrounds while lightly shaping tomorrow's board.",
      ],
      bullets: [
        "A soft lead is not a safe lead.",
        "A narrow trail with lots of undecided vote can be more useful than a fake lead with no room left.",
        "Do not treat every close state as equally worth saving.",
      ],
    },
    {
      title: "Polls, Leads, And Undecideds",
      paragraphs: [
        "Polls are directional information, not promises. A state can look good on the table and still be volatile if undecideds are high or the race is inside the margin of error.",
      ],
      bullets: [
        "Small lead + high undecided = fragile.",
        "Lead inside margin of error = not settled.",
        "Low undecided + real margin = safer closing position.",
      ],
    },
    {
      title: "What Your Actions Actually Do",
      bullets: [
        "Rallies create sharper support and enthusiasm in a specific place, but cost real effort and fatigue.",
        "General campaigning is the broad daily field and media push that keeps the route alive.",
        "Endorsement work is a local-backing play that can quietly improve trust and credibility.",
        "Fundraising gives money and can also affect narrative carryover.",
        "Advertising lets you reach more places without consuming candidate time.",
      ],
    },
    {
      title: "Advertising",
      paragraphs: [
        "Ads matter more as the board gets wider. They should support a strategy, not replace one.",
      ],
      bullets: [
        "Use local buys when one state is close and worth concentrating on.",
        "Use window-wide buys when the board is too wide to cover only in person.",
        "Do not assume you need every state. You need the right mix of reachable states and delegate value.",
      ],
    },
    {
      title: "Momentum, Favorability, Fatigue, And Enthusiasm",
      bullets: [
        "Momentum is the campaign's narrative and performance temperature.",
        "Favorability is closer to the candidate's broader public image.",
        "Fatigue reflects how much value the candidate is still getting from an aggressive schedule.",
        "Enthusiasm is local energy that helps support feel stickier in a state.",
      ],
    },
    {
      title: "Super Tuesday Thinking",
      paragraphs: [
        "Super Tuesday is usually where players lose discipline. The board gets bigger, the costs go up, and you cannot do everything.",
      ],
      bullets: [
        "Decide whether the round is about protecting, expanding, surviving, or peaking.",
        "Use money and route planning together.",
        "Do not overpay just to lose more widely in expensive states.",
      ],
    },
    {
      title: "Common Mistakes",
      bullets: [
        "Leaving a soft lead too early.",
        "Ignoring on-deck states until they become expensive.",
        "Overfundraising while the live board slips away.",
        "Assuming momentum is the same thing as delegates.",
        "Spreading out just because the map is large.",
      ],
    },
  ],
};
const REGION_SEQUENCE = [
  "Southwest",
  "West",
  "Northeast",
  "Midwest",
  "South",
  "Final National Push",
];
const REGIONS = {
  Southwest: {
    traitText: "Immigration, energy, and regional identity matter. Hard-edged messaging can travel fast here.",
    states: ["TX", "AZ", "NM", "NV", "OK", "CO"],
  },
  West: {
    traitText: "Environment, innovation, celebrity, and mountain-state retail politics all collide here.",
    states: ["CA", "OR", "WA", "HI", "AK", "MT", "WY", "ID", "UT"],
  },
  Northeast: {
    traitText: "Competence, debates, and media scrutiny matter more than folksy charm alone.",
    states: ["ME", "NH", "VT", "MA", "RI", "CT", "NY", "NJ", "PA", "DE", "MD", "DC"],
  },
  Midwest: {
    traitText: "Jobs, authenticity, and union-grounded campaigning carry extra weight.",
    states: ["OH", "MI", "WI", "MN", "IN", "IL", "IA", "MO", "WV", "KS", "NE", "ND", "SD"],
  },
  South: {
    traitText: "Religion, values, charisma, and turnout-heavy rallies matter more here.",
    states: ["VA", "NC", "SC", "GA", "FL", "AL", "MS", "TN", "KY", "LA", "AR"],
  },
};
const REGION_BASES = {
  Northeast: {
    issues: { economy: 0.7, healthcare: 0.78, immigration: 0.56, crime: 0.52, environment: 0.66, values: 0.45, corruption: 0.61, unity: 0.58 },
    traits: { urban: 0.74, rural: 0.31, union: 0.46, religious: 0.32, coastal: 0.77, southern: 0.08, midwestern: 0.12, family: 0.5, diverse: 0.69 },
    mediaCost: 1.3,
    rallyEffectiveness: 0.95,
    groundGameEffectiveness: 1.02,
  },
  Midwest: {
    issues: { economy: 0.85, healthcare: 0.58, immigration: 0.43, crime: 0.46, environment: 0.44, values: 0.48, corruption: 0.53, unity: 0.55 },
    traits: { urban: 0.45, rural: 0.58, union: 0.68, religious: 0.47, coastal: 0.05, southern: 0.12, midwestern: 0.85, family: 0.54, diverse: 0.42 },
    mediaCost: 1.02,
    rallyEffectiveness: 1.02,
    groundGameEffectiveness: 1.16,
  },
  South: {
    issues: { economy: 0.71, healthcare: 0.48, immigration: 0.48, crime: 0.57, environment: 0.3, values: 0.76, corruption: 0.42, unity: 0.46 },
    traits: { urban: 0.4, rural: 0.69, union: 0.23, religious: 0.82, coastal: 0.29, southern: 0.88, midwestern: 0.08, family: 0.76, diverse: 0.55 },
    mediaCost: 0.95,
    rallyEffectiveness: 1.15,
    groundGameEffectiveness: 1.08,
  },
  Southwest: {
    issues: { economy: 0.74, healthcare: 0.42, immigration: 0.8, crime: 0.53, environment: 0.36, values: 0.41, corruption: 0.46, unity: 0.41 },
    traits: { urban: 0.46, rural: 0.57, union: 0.2, religious: 0.46, coastal: 0.15, southern: 0.38, midwestern: 0.14, family: 0.67, diverse: 0.72 },
    mediaCost: 1.0,
    rallyEffectiveness: 1.05,
    groundGameEffectiveness: 1.0,
  },
  West: {
    issues: { economy: 0.62, healthcare: 0.63, immigration: 0.49, crime: 0.38, environment: 0.83, values: 0.35, corruption: 0.54, unity: 0.61 },
    traits: { urban: 0.62, rural: 0.44, union: 0.28, religious: 0.26, coastal: 0.67, southern: 0.02, midwestern: 0.08, family: 0.49, diverse: 0.66 },
    mediaCost: 1.18,
    rallyEffectiveness: 0.97,
    groundGameEffectiveness: 0.95,
  },
};
const STATE_DATA = [
  ["AL", "Alabama", 9, "South"],
  ["AK", "Alaska", 3, "West"],
  ["AZ", "Arizona", 11, "Southwest"],
  ["AR", "Arkansas", 6, "South"],
  ["CA", "California", 54, "West"],
  ["CO", "Colorado", 10, "Southwest"],
  ["CT", "Connecticut", 7, "Northeast"],
  ["DE", "Delaware", 3, "Northeast"],
  ["DC", "Washington, DC", 3, "Northeast"],
  ["FL", "Florida", 30, "South"],
  ["GA", "Georgia", 16, "South"],
  ["HI", "Hawaii", 4, "West"],
  ["ID", "Idaho", 4, "West"],
  ["IL", "Illinois", 19, "Midwest"],
  ["IN", "Indiana", 11, "Midwest"],
  ["IA", "Iowa", 6, "Midwest"],
  ["KS", "Kansas", 6, "Midwest"],
  ["KY", "Kentucky", 8, "South"],
  ["LA", "Louisiana", 8, "South"],
  ["ME", "Maine", 4, "Northeast"],
  ["MD", "Maryland", 10, "Northeast"],
  ["MA", "Massachusetts", 11, "Northeast"],
  ["MI", "Michigan", 15, "Midwest"],
  ["MN", "Minnesota", 10, "Midwest"],
  ["MS", "Mississippi", 6, "South"],
  ["MO", "Missouri", 10, "Midwest"],
  ["MT", "Montana", 4, "West"],
  ["NE", "Nebraska", 5, "Midwest"],
  ["NV", "Nevada", 6, "Southwest"],
  ["NH", "New Hampshire", 4, "Northeast"],
  ["NJ", "New Jersey", 14, "Northeast"],
  ["NM", "New Mexico", 5, "Southwest"],
  ["NY", "New York", 28, "Northeast"],
  ["NC", "North Carolina", 16, "South"],
  ["ND", "North Dakota", 3, "Midwest"],
  ["OH", "Ohio", 17, "Midwest"],
  ["OK", "Oklahoma", 7, "Southwest"],
  ["OR", "Oregon", 8, "West"],
  ["PA", "Pennsylvania", 19, "Northeast"],
  ["RI", "Rhode Island", 4, "Northeast"],
  ["SC", "South Carolina", 9, "South"],
  ["SD", "South Dakota", 3, "Midwest"],
  ["TN", "Tennessee", 11, "South"],
  ["TX", "Texas", 40, "Southwest"],
  ["UT", "Utah", 6, "West"],
  ["VT", "Vermont", 3, "Northeast"],
  ["VA", "Virginia", 13, "South"],
  ["WA", "Washington", 12, "West"],
  ["WV", "West Virginia", 4, "Midwest"],
  ["WI", "Wisconsin", 10, "Midwest"],
  ["WY", "Wyoming", 3, "West"],
];
const PRIMARY_DELEGATE_TOTALS = {
  democrat: {
    AL: 58, AK: 20, AZ: 85, AR: 36, CA: 495, CO: 87, CT: 74, DE: 34, DC: 49, FL: 254,
    GA: 123, HI: 31, ID: 27, IL: 177, IN: 88, IA: 46, KS: 39, KY: 59, LA: 53, ME: 32,
    MD: 118, MA: 116, MI: 138, MN: 93, MS: 40, MO: 70, MT: 25, NE: 34, NV: 49, NH: 34,
    NJ: 145, NM: 45, NY: 307, NC: 134, ND: 17, OH: 144, OK: 41, OR: 78, PA: 187, RI: 35,
    SC: 65, SD: 20, TN: 72, TX: 272, UT: 34, VT: 24, VA: 119, WA: 111, WV: 25, WI: 95, WY: 17,
  },
  republican: {
    AL: 50, AK: 29, AZ: 43, AR: 40, CA: 169, CO: 37, CT: 28, DE: 16, DC: 19, FL: 125,
    GA: 59, HI: 19, ID: 32, IL: 64, IN: 58, IA: 40, KS: 39, KY: 46, LA: 47, ME: 20,
    MD: 37, MA: 40, MI: 55, MN: 39, MS: 40, MO: 54, MT: 31, NE: 36, NV: 26, NH: 22,
    NJ: 12, NM: 22, NY: 91, NC: 74, ND: 29, OH: 79, OK: 43, OR: 31, PA: 67, RI: 19,
    SC: 50, SD: 29, TN: 58, TX: 161, UT: 40, VT: 17, VA: 48, WA: 43, WV: 32, WI: 41, WY: 29,
  },
};
const STATE_OVERRIDES = {
  AK: { traits: { rural: 0.78, coastal: 0.4, environment: 0.55, diverse: 0.28 }, mediaCost: 0.92, groundGameEffectiveness: 1.08 },
  AZ: { issues: { immigration: 0.86 }, traits: { diverse: 0.76, family: 0.7 } },
  CA: { issues: { environment: 0.9, healthcare: 0.71 }, traits: { urban: 0.84, coastal: 0.9, diverse: 0.83 }, mediaCost: 1.45 },
  CO: { issues: { environment: 0.73, economy: 0.7 }, traits: { urban: 0.56, rural: 0.44 }, mediaCost: 1.08 },
  DC: { issues: { corruption: 0.8, healthcare: 0.72 }, traits: { urban: 0.92, coastal: 0.22, religious: 0.18 }, mediaCost: 1.35 },
  FL: { issues: { immigration: 0.6, economy: 0.78 }, traits: { coastal: 0.61, diverse: 0.78, family: 0.69 }, mediaCost: 1.18 },
  GA: { traits: { urban: 0.52, diverse: 0.67 } },
  HI: { issues: { environment: 0.88, unity: 0.69 }, traits: { coastal: 0.92, diverse: 0.84 }, mediaCost: 1.22 },
  ID: { traits: { rural: 0.8, family: 0.47 }, groundGameEffectiveness: 1.1 },
  IL: { traits: { urban: 0.66, union: 0.72, diverse: 0.7 }, mediaCost: 1.15 },
  KS: { traits: { rural: 0.7, midwestern: 0.78 } },
  KY: { traits: { religious: 0.7, rural: 0.72 } },
  LA: { traits: { family: 0.72, southern: 0.91, diverse: 0.62 } },
  MA: { issues: { healthcare: 0.82 }, traits: { educated: 0.82, urban: 0.72 } },
  MD: { traits: { urban: 0.64, diverse: 0.77 }, mediaCost: 1.12 },
  MI: { traits: { union: 0.83, midwestern: 0.88 }, groundGameEffectiveness: 1.18 },
  MN: { issues: { healthcare: 0.67, unity: 0.61 }, traits: { union: 0.61, midwestern: 0.84 } },
  MO: { traits: { rural: 0.62, religious: 0.55 } },
  MT: { traits: { rural: 0.84 }, groundGameEffectiveness: 1.14, rallyEffectiveness: 1.06 },
  NC: { traits: { urban: 0.48, religious: 0.73, diverse: 0.63 } },
  NV: { issues: { economy: 0.7, immigration: 0.76 }, traits: { diverse: 0.75, union: 0.34 } },
  NY: { traits: { urban: 0.87, coastal: 0.85, diverse: 0.84 }, mediaCost: 1.42 },
  OH: { traits: { union: 0.74, midwestern: 0.89 } },
  OK: { traits: { rural: 0.78, values: 0.67, family: 0.68 } },
  OR: { issues: { environment: 0.86 }, traits: { coastal: 0.82 } },
  PA: { traits: { urban: 0.58, union: 0.71, rural: 0.5 } },
  SC: { traits: { religious: 0.76, southern: 0.9, diverse: 0.58 } },
  SD: { traits: { rural: 0.82 }, groundGameEffectiveness: 1.12 },
  TN: { traits: { religious: 0.77, family: 0.73 } },
  TX: { issues: { economy: 0.8, immigration: 0.74 }, traits: { family: 0.72, diverse: 0.76 }, mediaCost: 1.15 },
  UT: { traits: { religious: 0.86, family: 0.78 }, groundGameEffectiveness: 1.06 },
  VA: { traits: { urban: 0.57, diverse: 0.63 }, mediaCost: 1.08 },
  WA: { issues: { environment: 0.87, healthcare: 0.68 }, traits: { coastal: 0.86, urban: 0.7 }, mediaCost: 1.24 },
  WI: { traits: { union: 0.74, midwestern: 0.86 }, groundGameEffectiveness: 1.18 },
  WV: { traits: { rural: 0.8, midwestern: 0.64, religious: 0.62 }, groundGameEffectiveness: 1.14 },
  WY: { traits: { rural: 0.88, family: 0.44 }, groundGameEffectiveness: 1.12 },
};
const BORDERS = {
  AL: ["FL", "GA", "MS", "TN"],
  AK: [],
  AZ: ["CA", "NV", "UT", "NM", "CO"],
  AR: ["MO", "TN", "MS", "LA", "TX", "OK"],
  CA: ["OR", "NV", "AZ"],
  CO: ["WY", "NE", "KS", "OK", "NM", "AZ", "UT"],
  CT: ["NY", "MA", "RI"],
  DC: ["MD", "VA"],
  DE: ["MD", "NJ", "PA"],
  FL: ["AL", "GA"],
  GA: ["FL", "AL", "TN", "NC", "SC"],
  HI: [],
  IA: ["MN", "SD", "NE", "MO", "IL", "WI"],
  ID: ["WA", "OR", "NV", "UT", "WY", "MT"],
  IL: ["WI", "IA", "MO", "KY", "IN"],
  IN: ["MI", "OH", "KY", "IL"],
  KS: ["NE", "MO", "OK", "CO"],
  KY: ["IL", "IN", "OH", "WV", "VA", "TN", "MO"],
  LA: ["TX", "AR", "MS"],
  MA: ["RI", "CT", "NY", "NH", "VT"],
  MD: ["VA", "WV", "PA", "DE", "DC"],
  ME: ["NH"],
  MI: ["OH", "IN", "WI"],
  MN: ["ND", "SD", "IA", "WI"],
  MO: ["IA", "IL", "KY", "TN", "AR", "OK", "KS", "NE"],
  MS: ["LA", "AR", "TN", "AL"],
  MT: ["ID", "WY", "SD", "ND"],
  NC: ["VA", "TN", "GA", "SC"],
  ND: ["MT", "SD", "MN"],
  NE: ["SD", "IA", "MO", "KS", "CO", "WY"],
  NH: ["ME", "MA", "VT"],
  NJ: ["NY", "PA", "DE"],
  NM: ["AZ", "UT", "CO", "OK", "TX"],
  NV: ["CA", "OR", "ID", "UT", "AZ"],
  NY: ["PA", "NJ", "CT", "MA", "VT"],
  OH: ["PA", "WV", "KY", "IN", "MI"],
  OK: ["CO", "KS", "MO", "AR", "TX", "NM"],
  OR: ["WA", "ID", "NV", "CA"],
  PA: ["NY", "NJ", "DE", "MD", "WV", "OH"],
  RI: ["CT", "MA"],
  SC: ["NC", "GA"],
  SD: ["ND", "MN", "IA", "NE", "WY", "MT"],
  TN: ["KY", "VA", "NC", "GA", "AL", "MS", "AR", "MO"],
  TX: ["NM", "OK", "AR", "LA"],
  UT: ["ID", "WY", "CO", "NM", "AZ", "NV"],
  VA: ["NC", "TN", "KY", "WV", "MD", "DC"],
  VT: ["NY", "NH", "MA"],
  WA: ["ID", "OR"],
  WI: ["MI", "MN", "IA", "IL"],
  WV: ["OH", "PA", "MD", "VA", "KY"],
  WY: ["MT", "SD", "NE", "CO", "UT", "ID"],
};
const AI_POOL = [
  {
    id: "jim",
    name: "Wicked Jim DeVito",
    party: "democrat",
    archetype: "Win-At-All-Costs Insider",
    homeState: "NY",
    hometown: "Little Italy, Lower Manhattan",
    regionIdentity: "Northeast",
    portrait: "./assets/candidates/wicked-jim-devito.jpg",
    poster: "./assets/candidates/wicked-jim-devito-ad.jpg",
    summary: "Furniture kingpin, city machine boss, and negative-ad natural with a smile that says the deal is already done.",
    stats: { charisma: 6, discipline: 8, authenticity: 3, fundraising: 8, debateSkill: 6, stamina: 6 },
    scandalRisk: 0.22,
    issueCredibility: { economy: 0.69, healthcare: 0.52, immigration: 0.43, crime: 0.67, environment: 0.25, values: 0.38, corruption: 0.22, unity: 0.48 },
    resonance: { urban: 0.14, family: 0.02, diverse: 0.05, working: 0.02, celebrity: -0.06 },
    preferredMessages: ["economy", "crime", "unity"],
    preferredTones: ["Serious", "Aggressive"],
    strengths: ["machine organization", "intimidation politics", "negative-ad instincts", "fundraising through power networks", "message discipline", "urban political operations"],
    weaknesses: ["suspected organized-crime aura", "high scandal risk", "poor reform credibility", "weak family appeal", "polarizing personality", "voters may see him as corrupt"],
  },
  {
    id: "zoogle",
    name: 'Hernando "Captain" Zoogle',
    party: "republican",
    archetype: "Family Celebrity Outsider",
    homeState: "CA",
    hometown: "Huntington Beach",
    regionIdentity: "West",
    portrait: "./assets/candidates/captain-zoogle.jpg",
    poster: "./assets/candidates/captain-zoogle-ad.jpg",
    summary: "Beloved pirate-host entertainer with big charisma, soft-edged family branding, and a wildly uneven grip on discipline.",
    stats: { charisma: 8, discipline: 3, authenticity: 5, fundraising: 5, debateSkill: 4, stamina: 5 },
    scandalRisk: 0.24,
    issueCredibility: { economy: 0.44, healthcare: 0.5, immigration: 0.63, crime: 0.3, environment: 0.65, values: 0.54, corruption: 0.31, unity: 0.74 },
    resonance: { urban: 0.08, family: 0.16, diverse: 0.12, working: -0.04, celebrity: 0.22 },
    preferredMessages: ["unity", "environment", "immigration"],
    preferredTones: ["Hopeful", "Inspirational", "Folksy"],
    strengths: ["children-and-family appeal", "celebrity attention", "crowd charisma", "crossover conservative appeal", "animal-brand iconography", "momentum spikes from media"],
    weaknesses: ["low discipline", "thin governing credibility", "easy to mock as unserious", "celebrity scandals travel fast", "struggles with detailed policy", "campaign can drift off message"],
  },
  {
    id: "curtis",
    name: "Curtis Coolwater",
    party: "democrat",
    archetype: "Flashy Sun Belt Reformer",
    homeState: "GA",
    hometown: "Savannah",
    regionIdentity: "South",
    portrait: "./assets/candidates/curtis-coolwater.jpg",
    poster: "./assets/candidates/curtis-coolwater-ad.jpg",
    summary: "Smooth, sharp, and media-friendly, with just enough reform talk to sound principled and just enough style to stay on camera.",
    stats: { charisma: 7, discipline: 5, authenticity: 5, fundraising: 5, debateSkill: 7, stamina: 4 },
    scandalRisk: 0.22,
    issueCredibility: { economy: 0.64, healthcare: 0.56, immigration: 0.49, crime: 0.36, environment: 0.41, values: 0.44, corruption: 0.67, unity: 0.62 },
    resonance: { urban: 0.14, family: 0.03, diverse: 0.13, working: 0.09, celebrity: 0.08 },
    preferredMessages: ["corruption", "economy", "unity"],
    preferredTones: ["Inspirational", "Serious", "Aggressive"],
    strengths: ["high charisma", "media fluency", "reform message", "debate talent", "broad coalition appeal", "strong suburban performance"],
    weaknesses: ["can seem overly polished", "thin blue-collar authenticity", "vulnerable to empty-suit attacks", "less trusted by movement activists", "may overperform on TV more than on the ground"],
  },
  {
    id: "buzz",
    name: "Buzz Smiley",
    party: "republican",
    archetype: "Finger-In-The-Wind Operator",
    homeState: "TX",
    hometown: "Austin",
    regionIdentity: "Southwest",
    portrait: "./assets/candidates/buzz-smiley.jpg",
    poster: "./assets/candidates/buzz-smiley-ad.jpg",
    summary: "A grin, a donor list, a fake accent for every diner, and no idea too slippery to borrow if the room seems to like it.",
    stats: { charisma: 4, discipline: 7, authenticity: 2, fundraising: 6, debateSkill: 6, stamina: 6 },
    scandalRisk: 0.3,
    issueCredibility: { economy: 0.58, healthcare: 0.39, immigration: 0.52, crime: 0.54, environment: 0.21, values: 0.48, corruption: 0.18, unity: 0.34 },
    resonance: { urban: -0.04, family: 0.08, diverse: -0.02, working: -0.02, celebrity: -0.08 },
    preferredMessages: ["economy", "values", "crime"],
    preferredTones: ["Folksy", "Serious", "Aggressive"],
    strengths: ["message adaptability", "retail opportunism", "donor comfort", "broad establishment survivability", "quick tactical pivots", "good at borrowing the mood of the room"],
    weaknesses: ["no ideological core", "low trust", "easy flip-flopper attacks", "weak activist loyalty", "limited authenticity", "can collapse if voters want conviction"],
  },
  {
    id: "camila",
    name: "Camila Olivia Acosta",
    party: "democrat",
    archetype: "Progressive Movement Candidate",
    homeState: "CA",
    hometown: "Riverside",
    regionIdentity: "West",
    portrait: "./assets/candidates/camila-olivia-acosta.jpg",
    poster: "./assets/candidates/camila-olivia-acosta-ad.jpg",
    summary: "COA is a Southern California organizer-turned-congresswoman whose movement-style campaign runs on viral speeches, youth energy, small donors, and the constant threat that one controversy could either supercharge or derail her.",
    stats: { charisma: 8, discipline: 6, authenticity: 7, fundraising: 6, debateSkill: 8, stamina: 6 },
    scandalRisk: 0.27,
    issueCredibility: { economy: 0.47, healthcare: 0.74, immigration: 0.61, crime: 0.25, environment: 0.82, values: 0.35, corruption: 0.77, unity: 0.63 },
    resonance: { urban: 0.19, family: 0.02, diverse: 0.2, working: -0.03, celebrity: 0.16 },
    preferredMessages: ["environment", "corruption", "healthcare"],
    preferredTones: ["Inspirational", "Aggressive", "Hopeful"],
    strengths: ["massive youth support", "social media dominance", "rally energy", "small donor fundraising", "debate charisma", "grassroots organizing"],
    weaknesses: ["weak institutional support", "polarizing with moderates", "experience concerns", "media scrutiny", "Midwest challenges", "can collapse under controversy"],
  },
  {
    id: "joseph",
    name: "Joseph Pepper",
    party: "democrat",
    archetype: "Coalition Keeper Democrat",
    homeState: "MN",
    hometown: "Minneapolis",
    regionIdentity: "Midwest",
    portrait: "./assets/candidates/joseph-pepper.jpg",
    poster: "./assets/candidates/joseph-pepper-ad.jpg",
    summary: "Upper-seventies Minnesota senator and old-school labor Democrat who hates flashy politics and keeps grinding out wins with institutional trust, blue-collar credibility, and stubborn coalition discipline.",
    stats: { charisma: 4, discipline: 8, authenticity: 7, fundraising: 4, debateSkill: 5, stamina: 6 },
    scandalRisk: 0.15,
    issueCredibility: { economy: 0.68, healthcare: 0.6, immigration: 0.34, crime: 0.4, environment: 0.31, values: 0.47, corruption: 0.45, unity: 0.54 },
    resonance: { urban: 0.01, family: 0.09, diverse: 0.01, working: 0.18, celebrity: -0.12 },
    preferredMessages: ["economy", "healthcare", "unity"],
    preferredTones: ["Serious", "Folksy", "Hopeful"],
    strengths: ["labor support", "older voters", "Midwest strength", "institutional trust", "blue-collar appeal", "organization bonuses", "steady delegate math", "resistant to scandal damage"],
    weaknesses: ["lacks huge momentum spikes", "weaker online fundraising", "struggles with younger turnout", "can lose debates to sharper personalities", "can seem from another era", "least exciting to activists"],
  },
  {
    id: "monica",
    name: "Monica Steele",
    party: "republican",
    archetype: "Movement Conservative",
    homeState: "SC",
    hometown: "Columbia",
    regionIdentity: "South",
    portrait: "./assets/candidates/monica-steele.jpg",
    poster: "./assets/candidates/monica-steele-ad.jpg",
    summary: "Former Army colonel turned attorney general, Monica Steele spent most of her military career around Fort Jackson before becoming Columbia's razor-sharp ideological warrior with elite debate discipline, conservative-media muscle, and an uncompromising style that can electrify activists while rattling everyone else.",
    stats: { charisma: 6, discipline: 9, authenticity: 6, fundraising: 5, debateSkill: 9, stamina: 7 },
    scandalRisk: 0.11,
    issueCredibility: { economy: 0.46, healthcare: 0.26, immigration: 0.61, crime: 0.83, environment: 0.13, values: 0.8, corruption: 0.49, unity: 0.21 },
    resonance: { urban: -0.03, family: 0.12, diverse: -0.02, working: 0.04, celebrity: -0.08 },
    preferredMessages: ["crime", "values", "immigration"],
    preferredTones: ["Serious", "Aggressive", "Inspirational"],
    strengths: ["dominates debates", "huge activist enthusiasm", "strong in caucus states", "excellent on conservative media", "resistant to scandals", "powerful fundraising from small donors"],
    weaknesses: ["scares moderates", "poor establishment relationships", "weaker with independents", "can sound uncompromising", "donors may fear she is too intense"],
  },
  {
    id: "cornelius",
    name: "Cornelius St. Hilton",
    party: "republican",
    archetype: "Establishment Business Conservative",
    homeState: "CT",
    hometown: "Old Greenwich",
    regionIdentity: "Northeast",
    portrait: "./assets/candidates/cornelius-st-hilton.jpg",
    poster: "./assets/candidates/cornelius-st-hilton-ad.jpg",
    summary: "Extremely wealthy CEO candidate with private-jet polish, elite backing, huge media capacity, and the permanent risk of sounding like an out-of-touch billionaire in a diner.",
    stats: { charisma: 5, discipline: 8, authenticity: 4, fundraising: 9, debateSkill: 6, stamina: 6 },
    scandalRisk: 0.14,
    issueCredibility: { economy: 0.79, healthcare: 0.4, immigration: 0.39, crime: 0.45, environment: 0.28, values: 0.5, corruption: 0.22, unity: 0.46 },
    resonance: { urban: 0.05, family: 0.05, diverse: -0.02, working: -0.03, celebrity: 0.02 },
    preferredMessages: ["economy", "unity", "values"],
    preferredTones: ["Serious", "Hopeful"],
    strengths: ["fundraising monster", "elite endorsements", "huge ad buys", "strong suburban support", "organization bonuses", "stability"],
    weaknesses: ["weak grassroots enthusiasm", "struggles in populist states", "vulnerable to out-of-touch billionaire attacks", "awkward at town halls", "can sound robotic"],
  },
];
const PRIMARY_PARTY_ROSTERS = {
  democrat: [
    {
      id: "jim",
      name: "Wicked Jim DeVito",
      archetype: "Bruising Insider-Populist",
      homeState: "NY",
      hometown: "Little Italy, Lower Manhattan",
      status: "Current Candidate",
      summary: "Hard-edged machine fighter who treats politics like a contact sport and never minds going negative.",
      placeholder: false,
      strengths: ["machine organization", "intimidation politics", "negative-ad instincts", "fundraising through power networks", "message discipline", "urban political operations"],
      weaknesses: ["suspected organized-crime aura", "high scandal risk", "poor reform credibility", "weak family appeal", "polarizing personality", "voters may see him as corrupt"],
    },
    {
      id: "curtis",
      name: "Curtis Coolwater",
      archetype: "Optimistic Reform Democrat",
      homeState: "GA",
      hometown: "Savannah",
      status: "Current Candidate",
      summary: "Smooth media performer with reform language, coalition appeal, and a cleaner generational pitch.",
      placeholder: false,
      strengths: ["high charisma", "media fluency", "reform message", "debate talent", "broad coalition appeal", "strong suburban performance"],
      weaknesses: ["can seem overly polished", "thin blue-collar authenticity", "vulnerable to empty-suit attacks", "less trusted by movement activists", "may overperform on TV more than on the ground"],
    },
    {
      id: "camila",
      name: "Camila Olivia Acosta",
      archetype: "Progressive Movement Candidate",
      homeState: "CA",
      hometown: "Riverside",
      status: "Primary Bench Candidate",
      summary: "Camila Olivia Acosta, better known as COA, is a Southern California organizer-turned-congresswoman whose movement-style campaign runs on viral speeches, youth energy, small donors, and the constant threat that one controversy could either supercharge or derail her.",
      placeholder: false,
      portrait: "./assets/candidates/camila-olivia-acosta.jpg",
      poster: "./assets/candidates/camila-olivia-acosta-ad.jpg",
      strengths: [
        "massive youth support",
        "social media dominance",
        "rally energy",
        "small donor fundraising",
        "debate charisma",
        "grassroots organizing",
      ],
      weaknesses: [
        "weak institutional support",
        "polarizing with moderates",
        "experience concerns",
        "media scrutiny",
        "Midwest challenges",
        "can collapse under controversy",
      ],
    },
    {
      id: "joseph",
      name: "Joseph Pepper",
      archetype: "Coalition Keeper Democrat",
      homeState: "MN",
      hometown: "Minneapolis",
      status: "Primary Bench Candidate",
      summary: "Upper-seventies Minnesota senator and old-school labor Democrat who knows every county chair, hates flashy politics, and keeps grinding out wins with institutional trust, blue-collar credibility, and stubborn coalition discipline.",
      placeholder: false,
      portrait: "./assets/candidates/joseph-pepper.jpg",
      poster: "./assets/candidates/joseph-pepper-ad.jpg",
      strengths: [
        "labor support",
        "older voters",
        "Midwest strength",
        "institutional trust",
        "blue-collar appeal",
        "organization bonuses",
        "steady delegate math",
        "resistant to scandal damage",
      ],
      weaknesses: [
        "lacks huge momentum spikes",
        "weaker online fundraising",
        "struggles with younger turnout",
        "can lose debates to sharper personalities",
        "can seem from another era",
        "least exciting to activists",
      ],
    },
  ],
  republican: [
    {
      id: "buzz",
      name: "Buzz Smiley",
      archetype: "Media-Savvy Conservative Operator",
      homeState: "TX",
      hometown: "Austin",
      status: "Current Candidate",
      summary: "Polished donor favorite with quick instincts, broad TV appeal, and an elastic sense of principle.",
      placeholder: false,
      strengths: ["message adaptability", "retail opportunism", "donor comfort", "broad establishment survivability", "quick tactical pivots", "good at borrowing the mood of the room"],
      weaknesses: ["no ideological core", "low trust", "easy flip-flopper attacks", "weak activist loyalty", "limited authenticity", "can collapse if voters want conviction"],
    },
    {
      id: "zoogle",
      name: 'Hernando "Captain" Zoogle',
      archetype: "Celebrity Outsider Populist",
      homeState: "CA",
      hometown: "Huntington Beach",
      status: "Current Candidate",
      summary: "Charismatic anti-establishment showman who can dominate attention without always controlling the message.",
      placeholder: false,
      strengths: ["children-and-family appeal", "celebrity attention", "crowd charisma", "crossover conservative appeal", "animal-brand iconography", "momentum spikes from media"],
      weaknesses: ["low discipline", "thin governing credibility", "easy to mock as unserious", "celebrity scandals travel fast", "struggles with detailed policy", "campaign can drift off message"],
    },
    {
      id: "monica",
      name: "Monica Steele",
      archetype: "Movement Conservative",
      homeState: "SC",
      hometown: "Columbia",
      status: "Primary Bench Candidate",
      summary: "Former Army colonel turned attorney general, Monica Steele spent most of her military career around Fort Jackson before becoming Columbia's razor-sharp ideological warrior with elite debate discipline, conservative-media muscle, and the kind of uncompromising style that can electrify activists while rattling everyone else.",
      placeholder: false,
      portrait: "./assets/candidates/monica-steele.jpg",
      poster: "./assets/candidates/monica-steele-ad.jpg",
      strengths: [
        "dominates debates",
        "huge activist enthusiasm",
        "strong in caucus states",
        "excellent on conservative media",
        "resistant to scandals",
        "powerful fundraising from small donors",
      ],
      weaknesses: [
        "scares moderates",
        "poor establishment relationships",
        "weaker with independents",
        "can sound uncompromising",
        "donors may fear she is too intense",
      ],
    },
    {
      id: "cornelius",
      name: "Cornelius St. Hilton",
      archetype: "Establishment Business Conservative",
      homeState: "CT",
      hometown: "Old Greenwich",
      status: "Primary Bench Candidate",
      summary: "Extremely wealthy CEO candidate with private-jet polish, elite backing, huge media capacity, and the permanent risk of sounding like an out-of-touch billionaire in a diner.",
      placeholder: false,
      portrait: "./assets/candidates/cornelius-st-hilton.jpg",
      poster: "./assets/candidates/cornelius-st-hilton-ad.jpg",
      strengths: [
        "fundraising monster",
        "elite endorsements",
        "huge ad buys",
        "strong suburban support",
        "organization bonuses",
        "stability",
      ],
      weaknesses: [
        "weak grassroots enthusiasm",
        "struggles in populist states",
        "vulnerable to out-of-touch billionaire attacks",
        "awkward at town halls",
        "can sound robotic",
      ],
    },
  ],
};
const PRIMARY_TURN_WINDOWS = [
  {
    turn: 1,
    label: "Opening Tests",
    dates: "Jan. 15-23",
    days: 2,
    stateAbbrs: ["IA", "NH"],
    contests: "Iowa, New Hampshire",
    note: "A compact opening week where Iowa and New Hampshire set the first real story lines.",
  },
  {
    turn: 2,
    label: "Early February",
    dates: "Feb. 3-27",
    days: 3,
    stateAbbrs: ["SC", "NV", "MI"],
    contests: "South Carolina (D), Nevada (D/R), South Carolina (R), Michigan (D/R)",
    note: "The first multi-state phase. Coalition shape starts to matter as the map widens.",
  },
  {
    turn: 3,
    label: "Super Tuesday Build",
    dates: "Mar. 2-6",
    days: 4,
    stateAbbrs: ["ID", "MO", "DC", "ND", "AL", "AK", "AR", "CA", "CO", "IA", "ME", "MA", "MN", "NC", "OK", "TN", "TX", "UT", "VT", "VA"],
    contests: "Idaho (R), Missouri (R), DC (R), North Dakota (R), Alabama, Alaska (R), Arkansas, California, Colorado, Iowa (D), Maine, Massachusetts, Minnesota, North Carolina, Oklahoma, Tennessee, Texas, Utah, Vermont, Virginia",
    note: "The biggest single turn. National identity, money, and map discipline all get tested at once.",
  },
  {
    turn: 4,
    label: "Mid-March",
    dates: "Mar. 8-19",
    days: 3,
    stateAbbrs: ["GA", "HI", "MS", "WA", "AZ", "FL", "IL", "KS", "OH"],
    contests: "American Samoa (R), Democrats Abroad, Georgia, Hawaii (R), Mississippi, Northern Mariana Islands (D), Washington, Northern Mariana Islands (R), Guam (R), Arizona, Florida, Illinois, Kansas, Ohio",
    note: "A broad-state window that rewards both regional focus and late groundwork.",
  },
  {
    turn: 5,
    label: "Late March / Early April",
    dates: "Mar. 23-Apr. 13",
    days: 3,
    stateAbbrs: ["LA", "MO", "ND", "CT", "DE", "NY", "RI", "WI", "AK", "WY"],
    contests: "Louisiana, Missouri (D), North Dakota (D), Connecticut, Delaware, New York, Rhode Island, Wisconsin, Alaska (D), Wyoming (D)",
    note: "A longer planning window where message balance matters more than constant travel.",
  },
  {
    turn: 6,
    label: "Late April / May",
    dates: "Apr. 20-May 23",
    days: 3,
    stateAbbrs: ["PA", "IN", "MD", "NE", "WV", "KY", "OR", "ID"],
    contests: "Pennsylvania, Indiana, Maryland, Nebraska, West Virginia, Kentucky, Oregon, Idaho (D)",
    note: "A broad late-spring window where big-state math and cleanup delegates both matter.",
  },
  {
    turn: 7,
    label: "Final June Window",
    dates: "June 4-8",
    days: 2,
    stateAbbrs: ["DC", "MT", "NJ", "NM", "SD"],
    contests: "DC (D), Montana, New Jersey, New Mexico, South Dakota, Guam (D), Virgin Islands (D)",
    note: "Final delegates, final narratives, and final chances to deny a clean clinch.",
  },
];
const PRIMARY_TOTAL_TURNS = PRIMARY_TURN_WINDOWS.length;
const PRIMARY_LAYOUT_DRAFT = [
  {
    title: "Top Scoreboard",
    copy: "Keep the current candidate cards, but swap in delegates, cash, momentum, and path-to-nomination instead of electoral-vote language.",
  },
  {
    title: "Main Map Surface",
    copy: "Use a real U.S. map as the central planning surface, with color-coded states for voting now, coming soon, closed, and strength of support.",
  },
  {
    title: "Sidebar Links",
    copy: "Push deeper information behind links or lightweight panels: Live Delegate Standings, Calendar, Upcoming States, Closed States, Ad Plan, Ground Game, Endorsements, and Rules.",
  },
];
const PRIMARY_CORE_TRAITS = [
  "unionStrength",
  "blackElectorate",
  "latinoElectorate",
  "youthVote",
  "progressiveActivism",
  "suburbanGrowth",
  "institutionalTrust",
  "ruralTraditionalism",
  "outsiderAppeal",
  "reformAppetite",
  "mediaDriven",
  "electabilityFocus",
];
const PRIMARY_SECONDARY_TRAITS = [
  "volatility",
  "grassrootsPower",
  "machinePolitics",
  "scandalSensitivity",
  "ideologicalPurity",
  "militaryCulture",
  "endorsementCulture",
];
const PRIMARY_TRAIT_LABELS = {
  unionStrength: "Union Strength",
  blackElectorate: "Black Electorate",
  latinoElectorate: "Latino Electorate",
  youthVote: "Youth Vote",
  progressiveActivism: "Progressive Activism",
  suburbanGrowth: "Suburban Growth",
  institutionalTrust: "Institutional Trust",
  ruralTraditionalism: "Rural Traditionalism",
  outsiderAppeal: "Outsider Appeal",
  reformAppetite: "Reform Appetite",
  mediaDriven: "Media Driven",
  electabilityFocus: "Electability Focus",
  volatility: "Volatility",
  grassrootsPower: "Grassroots Power",
  machinePolitics: "Machine Politics",
  scandalSensitivity: "Scandal Sensitivity",
  ideologicalPurity: "Ideological Purity",
  militaryCulture: "Military Culture",
  endorsementCulture: "Endorsement Culture",
};
const PRIMARY_OPENING_SUBREGIONS = {
  northeastMachine: ["CT", "DC", "DE", "MA", "MD", "NH", "NJ", "NY", "PA", "RI"],
  greatLakesLabor: ["IA", "IL", "IN", "MI", "MN", "OH", "PA", "WI"],
  pacificCoast: ["CA", "HI", "OR", "WA"],
  mountainWest: ["AK", "AZ", "CO", "ID", "MT", "NV", "NM", "UT", "WY"],
  deepSouth: ["AL", "AR", "FL", "GA", "LA", "MS", "SC", "TN"],
  sunBeltMetro: ["AZ", "FL", "GA", "NC", "NV", "TX", "VA"],
  plainsHeartland: ["IA", "KS", "MO", "NE", "ND", "OK", "SD"],
  midAtlanticSuburbs: ["CT", "DE", "MD", "NJ", "PA", "VA"],
};
const PRIMARY_OPENING_SUBREGION_BONUSES = {
  joseph: {
    greatLakesLabor: 0.38,
    plainsHeartland: 0.18,
    midAtlanticSuburbs: 0.08,
  },
  curtis: {
    sunBeltMetro: 0.4,
    deepSouth: 0.18,
    midAtlanticSuburbs: 0.12,
  },
  camila: {
    pacificCoast: 0.52,
    mountainWest: 0.16,
  },
  jim: {
    northeastMachine: 0.58,
    greatLakesLabor: 0.24,
    midAtlanticSuburbs: 0.12,
  },
  buzz: {
    deepSouth: 0.38,
    sunBeltMetro: 0.28,
    plainsHeartland: 0.2,
  },
  zoogle: {
    pacificCoast: 0.32,
    mountainWest: 0.24,
    sunBeltMetro: 0.14,
  },
  monica: {
    deepSouth: 0.42,
    plainsHeartland: 0.12,
    mountainWest: 0.1,
  },
  cornelius: {
    midAtlanticSuburbs: 0.46,
    northeastMachine: 0.34,
    sunBeltMetro: 0.16,
  },
};
const PRIMARY_EARLY_SPOTLIGHT_STATES = {
  IA: 0.16,
  NH: 0.18,
  NV: 0.12,
  SC: 0.14,
  MI: 0.1,
};
const PRIMARY_CANDIDATE_AFFINITIES = {
  joseph: {
    core: {
      unionStrength: 0.92,
      blackElectorate: 0.42,
      latinoElectorate: 0.36,
      youthVote: 0.22,
      progressiveActivism: 0.28,
      suburbanGrowth: 0.41,
      institutionalTrust: 0.93,
      ruralTraditionalism: 0.78,
      outsiderAppeal: 0.18,
      reformAppetite: 0.38,
      mediaDriven: 0.24,
      electabilityFocus: 0.9,
    },
    secondary: {
      volatility: 0.2,
      grassrootsPower: 0.56,
      machinePolitics: 0.24,
      scandalSensitivity: 0.78,
      ideologicalPurity: 0.18,
      militaryCulture: 0.28,
      endorsementCulture: 0.88,
    },
  },
  curtis: {
    core: {
      unionStrength: 0.36,
      blackElectorate: 0.86,
      latinoElectorate: 0.46,
      youthVote: 0.52,
      progressiveActivism: 0.44,
      suburbanGrowth: 0.88,
      institutionalTrust: 0.64,
      ruralTraditionalism: 0.28,
      outsiderAppeal: 0.33,
      reformAppetite: 0.82,
      mediaDriven: 0.86,
      electabilityFocus: 0.76,
    },
    secondary: {
      volatility: 0.62,
      grassrootsPower: 0.48,
      machinePolitics: 0.3,
      scandalSensitivity: 0.46,
      ideologicalPurity: 0.34,
      militaryCulture: 0.24,
      endorsementCulture: 0.52,
    },
  },
  camila: {
    core: {
      unionStrength: 0.28,
      blackElectorate: 0.46,
      latinoElectorate: 0.86,
      youthVote: 0.96,
      progressiveActivism: 0.96,
      suburbanGrowth: 0.56,
      institutionalTrust: 0.14,
      ruralTraditionalism: 0.1,
      outsiderAppeal: 0.66,
      reformAppetite: 0.84,
      mediaDriven: 0.9,
      electabilityFocus: 0.26,
    },
    secondary: {
      volatility: 0.88,
      grassrootsPower: 0.94,
      machinePolitics: 0.05,
      scandalSensitivity: 0.2,
      ideologicalPurity: 0.9,
      militaryCulture: 0.08,
      endorsementCulture: 0.16,
    },
  },
  jim: {
    core: {
      unionStrength: 0.44,
      blackElectorate: 0.38,
      latinoElectorate: 0.25,
      youthVote: 0.16,
      progressiveActivism: 0.08,
      suburbanGrowth: 0.38,
      institutionalTrust: 0.54,
      ruralTraditionalism: 0.24,
      outsiderAppeal: 0.22,
      reformAppetite: 0.1,
      mediaDriven: 0.52,
      electabilityFocus: 0.4,
    },
    secondary: {
      volatility: 0.44,
      grassrootsPower: 0.32,
      machinePolitics: 0.97,
      scandalSensitivity: 0.08,
      ideologicalPurity: 0.14,
      militaryCulture: 0.18,
      endorsementCulture: 0.76,
    },
  },
  buzz: {
    core: {
      unionStrength: 0.18,
      blackElectorate: 0.18,
      latinoElectorate: 0.32,
      youthVote: 0.2,
      progressiveActivism: 0.04,
      suburbanGrowth: 0.5,
      institutionalTrust: 0.46,
      ruralTraditionalism: 0.7,
      outsiderAppeal: 0.52,
      reformAppetite: 0.18,
      mediaDriven: 0.78,
      electabilityFocus: 0.5,
    },
    secondary: {
      volatility: 0.62,
      grassrootsPower: 0.34,
      machinePolitics: 0.3,
      scandalSensitivity: 0.22,
      ideologicalPurity: 0.28,
      militaryCulture: 0.26,
      endorsementCulture: 0.54,
    },
  },
  zoogle: {
    core: {
      unionStrength: 0.18,
      blackElectorate: 0.22,
      latinoElectorate: 0.52,
      youthVote: 0.76,
      progressiveActivism: 0.28,
      suburbanGrowth: 0.58,
      institutionalTrust: 0.12,
      ruralTraditionalism: 0.38,
      outsiderAppeal: 0.86,
      reformAppetite: 0.28,
      mediaDriven: 0.96,
      electabilityFocus: 0.24,
    },
    secondary: {
      volatility: 0.92,
      grassrootsPower: 0.42,
      machinePolitics: 0.04,
      scandalSensitivity: 0.18,
      ideologicalPurity: 0.22,
      militaryCulture: 0.14,
      endorsementCulture: 0.18,
    },
  },
  monica: {
    core: {
      unionStrength: 0.08,
      blackElectorate: 0.14,
      latinoElectorate: 0.2,
      youthVote: 0.24,
      progressiveActivism: 0.02,
      suburbanGrowth: 0.38,
      institutionalTrust: 0.46,
      ruralTraditionalism: 0.68,
      outsiderAppeal: 0.58,
      reformAppetite: 0.46,
      mediaDriven: 0.68,
      electabilityFocus: 0.52,
    },
    secondary: {
      volatility: 0.38,
      grassrootsPower: 0.82,
      machinePolitics: 0.08,
      scandalSensitivity: 0.78,
      ideologicalPurity: 0.94,
      militaryCulture: 0.9,
      endorsementCulture: 0.34,
    },
  },
  cornelius: {
    core: {
      unionStrength: 0.04,
      blackElectorate: 0.12,
      latinoElectorate: 0.16,
      youthVote: 0.08,
      progressiveActivism: 0.01,
      suburbanGrowth: 0.9,
      institutionalTrust: 0.88,
      ruralTraditionalism: 0.24,
      outsiderAppeal: 0.08,
      reformAppetite: 0.1,
      mediaDriven: 0.66,
      electabilityFocus: 0.9,
    },
    secondary: {
      volatility: 0.18,
      grassrootsPower: 0.18,
      machinePolitics: 0.22,
      scandalSensitivity: 0.34,
      ideologicalPurity: 0.24,
      militaryCulture: 0.18,
      endorsementCulture: 0.96,
    },
  },
};
const PRIMARY_STATE_PROFILES = {
  IA: {
    core: { unionStrength: 0.44, blackElectorate: 0.12, latinoElectorate: 0.16, youthVote: 0.46, progressiveActivism: 0.36, suburbanGrowth: 0.34, institutionalTrust: 0.74, ruralTraditionalism: 0.72, outsiderAppeal: 0.58, reformAppetite: 0.52, mediaDriven: 0.3, electabilityFocus: 0.84 },
    secondary: { volatility: 0.46, grassrootsPower: 0.9, machinePolitics: 0.12, scandalSensitivity: 0.56, ideologicalPurity: 0.54, militaryCulture: 0.22, endorsementCulture: 0.64 },
  },
  NH: {
    core: { unionStrength: 0.24, blackElectorate: 0.05, latinoElectorate: 0.08, youthVote: 0.42, progressiveActivism: 0.42, suburbanGrowth: 0.44, institutionalTrust: 0.48, ruralTraditionalism: 0.42, outsiderAppeal: 0.82, reformAppetite: 0.76, mediaDriven: 0.6, electabilityFocus: 0.76 },
    secondary: { volatility: 0.82, grassrootsPower: 0.62, machinePolitics: 0.01, scandalSensitivity: 0.74, ideologicalPurity: 0.4, militaryCulture: 0.16, endorsementCulture: 0.16 },
  },
  NV: {
    core: { unionStrength: 0.68, blackElectorate: 0.18, latinoElectorate: 0.72, youthVote: 0.58, progressiveActivism: 0.46, suburbanGrowth: 0.62, institutionalTrust: 0.44, ruralTraditionalism: 0.28, outsiderAppeal: 0.58, reformAppetite: 0.48, mediaDriven: 0.62, electabilityFocus: 0.6 },
    secondary: { volatility: 0.78, grassrootsPower: 0.64, machinePolitics: 0.12, scandalSensitivity: 0.46, ideologicalPurity: 0.44, militaryCulture: 0.22, endorsementCulture: 0.3 },
  },
  SC: {
    core: { unionStrength: 0.12, blackElectorate: 0.86, latinoElectorate: 0.08, youthVote: 0.32, progressiveActivism: 0.18, suburbanGrowth: 0.46, institutionalTrust: 0.72, ruralTraditionalism: 0.7, outsiderAppeal: 0.34, reformAppetite: 0.24, mediaDriven: 0.52, electabilityFocus: 0.86 },
    secondary: { volatility: 0.34, grassrootsPower: 0.54, machinePolitics: 0.18, scandalSensitivity: 0.38, ideologicalPurity: 0.44, militaryCulture: 0.72, endorsementCulture: 0.88 },
  },
  MI: {
    core: { unionStrength: 0.88, blackElectorate: 0.34, latinoElectorate: 0.12, youthVote: 0.38, progressiveActivism: 0.36, suburbanGrowth: 0.56, institutionalTrust: 0.64, ruralTraditionalism: 0.46, outsiderAppeal: 0.38, reformAppetite: 0.44, mediaDriven: 0.42, electabilityFocus: 0.84 },
    secondary: { volatility: 0.48, grassrootsPower: 0.6, machinePolitics: 0.28, scandalSensitivity: 0.52, ideologicalPurity: 0.34, militaryCulture: 0.22, endorsementCulture: 0.54 },
  },
  AL: {
    core: { unionStrength: 0.1, blackElectorate: 0.54, latinoElectorate: 0.06, youthVote: 0.22, progressiveActivism: 0.1, suburbanGrowth: 0.32, institutionalTrust: 0.58, ruralTraditionalism: 0.86, outsiderAppeal: 0.28, reformAppetite: 0.16, mediaDriven: 0.34, electabilityFocus: 0.7 },
    secondary: { volatility: 0.18, grassrootsPower: 0.42, machinePolitics: 0.16, scandalSensitivity: 0.24, ideologicalPurity: 0.58, militaryCulture: 0.34, endorsementCulture: 0.68 },
  },
  AK: {
    core: { unionStrength: 0.14, blackElectorate: 0.05, latinoElectorate: 0.06, youthVote: 0.22, progressiveActivism: 0.08, suburbanGrowth: 0.14, institutionalTrust: 0.22, ruralTraditionalism: 0.7, outsiderAppeal: 0.88, reformAppetite: 0.32, mediaDriven: 0.18, electabilityFocus: 0.38 },
    secondary: { volatility: 0.42, grassrootsPower: 0.72, machinePolitics: 0.01, scandalSensitivity: 0.24, ideologicalPurity: 0.46, militaryCulture: 0.28, endorsementCulture: 0.12 },
  },
  AR: {
    core: { unionStrength: 0.14, blackElectorate: 0.18, latinoElectorate: 0.08, youthVote: 0.2, progressiveActivism: 0.08, suburbanGrowth: 0.22, institutionalTrust: 0.34, ruralTraditionalism: 0.9, outsiderAppeal: 0.52, reformAppetite: 0.18, mediaDriven: 0.26, electabilityFocus: 0.5 },
    secondary: { volatility: 0.16, grassrootsPower: 0.38, machinePolitics: 0.14, scandalSensitivity: 0.22, ideologicalPurity: 0.5, militaryCulture: 0.26, endorsementCulture: 0.34 },
  },
  CA: {
    core: { unionStrength: 0.4, blackElectorate: 0.14, latinoElectorate: 0.86, youthVote: 0.8, progressiveActivism: 0.92, suburbanGrowth: 0.78, institutionalTrust: 0.24, ruralTraditionalism: 0.14, outsiderAppeal: 0.58, reformAppetite: 0.72, mediaDriven: 0.94, electabilityFocus: 0.28 },
    secondary: { volatility: 0.64, grassrootsPower: 0.76, machinePolitics: 0.12, scandalSensitivity: 0.44, ideologicalPurity: 0.78, militaryCulture: 0.14, endorsementCulture: 0.24 },
  },
  CO: {
    core: { unionStrength: 0.22, blackElectorate: 0.08, latinoElectorate: 0.34, youthVote: 0.62, progressiveActivism: 0.74, suburbanGrowth: 0.64, institutionalTrust: 0.28, ruralTraditionalism: 0.24, outsiderAppeal: 0.56, reformAppetite: 0.64, mediaDriven: 0.64, electabilityFocus: 0.42 },
    secondary: { volatility: 0.82, grassrootsPower: 0.66, machinePolitics: 0.04, scandalSensitivity: 0.48, ideologicalPurity: 0.66, militaryCulture: 0.2, endorsementCulture: 0.18 },
  },
  ME: {
    core: { unionStrength: 0.3, blackElectorate: 0.04, latinoElectorate: 0.05, youthVote: 0.3, progressiveActivism: 0.36, suburbanGrowth: 0.22, institutionalTrust: 0.62, ruralTraditionalism: 0.5, outsiderAppeal: 0.62, reformAppetite: 0.54, mediaDriven: 0.22, electabilityFocus: 0.66 },
    secondary: { volatility: 0.52, grassrootsPower: 0.62, machinePolitics: 0.01, scandalSensitivity: 0.66, ideologicalPurity: 0.38, militaryCulture: 0.14, endorsementCulture: 0.16 },
  },
  MA: {
    core: { unionStrength: 0.3, blackElectorate: 0.12, latinoElectorate: 0.14, youthVote: 0.72, progressiveActivism: 0.88, suburbanGrowth: 0.64, institutionalTrust: 0.58, ruralTraditionalism: 0.08, outsiderAppeal: 0.24, reformAppetite: 0.72, mediaDriven: 0.8, electabilityFocus: 0.46 },
    secondary: { volatility: 0.54, grassrootsPower: 0.6, machinePolitics: 0.02, scandalSensitivity: 0.62, ideologicalPurity: 0.7, militaryCulture: 0.12, endorsementCulture: 0.3 },
  },
  MN: {
    core: { unionStrength: 0.74, blackElectorate: 0.12, latinoElectorate: 0.07, youthVote: 0.42, progressiveActivism: 0.48, suburbanGrowth: 0.44, institutionalTrust: 0.78, ruralTraditionalism: 0.44, outsiderAppeal: 0.32, reformAppetite: 0.46, mediaDriven: 0.34, electabilityFocus: 0.72 },
    secondary: { volatility: 0.34, grassrootsPower: 0.54, machinePolitics: 0.08, scandalSensitivity: 0.56, ideologicalPurity: 0.38, militaryCulture: 0.18, endorsementCulture: 0.6 },
  },
  NC: {
    core: { unionStrength: 0.14, blackElectorate: 0.46, latinoElectorate: 0.12, youthVote: 0.44, progressiveActivism: 0.34, suburbanGrowth: 0.72, institutionalTrust: 0.46, ruralTraditionalism: 0.62, outsiderAppeal: 0.44, reformAppetite: 0.44, mediaDriven: 0.58, electabilityFocus: 0.74 },
    secondary: { volatility: 0.58, grassrootsPower: 0.52, machinePolitics: 0.14, scandalSensitivity: 0.36, ideologicalPurity: 0.42, militaryCulture: 0.3, endorsementCulture: 0.56 },
  },
  OK: {
    core: { unionStrength: 0.1, blackElectorate: 0.08, latinoElectorate: 0.12, youthVote: 0.22, progressiveActivism: 0.06, suburbanGrowth: 0.24, institutionalTrust: 0.3, ruralTraditionalism: 0.88, outsiderAppeal: 0.66, reformAppetite: 0.16, mediaDriven: 0.32, electabilityFocus: 0.44 },
    secondary: { volatility: 0.18, grassrootsPower: 0.42, machinePolitics: 0.08, scandalSensitivity: 0.18, ideologicalPurity: 0.66, militaryCulture: 0.28, endorsementCulture: 0.28 },
  },
  TN: {
    core: { unionStrength: 0.12, blackElectorate: 0.2, latinoElectorate: 0.08, youthVote: 0.24, progressiveActivism: 0.08, suburbanGrowth: 0.34, institutionalTrust: 0.36, ruralTraditionalism: 0.84, outsiderAppeal: 0.58, reformAppetite: 0.18, mediaDriven: 0.36, electabilityFocus: 0.5 },
    secondary: { volatility: 0.2, grassrootsPower: 0.44, machinePolitics: 0.12, scandalSensitivity: 0.22, ideologicalPurity: 0.64, militaryCulture: 0.34, endorsementCulture: 0.32 },
  },
  TX: {
    core: { unionStrength: 0.1, blackElectorate: 0.18, latinoElectorate: 0.74, youthVote: 0.46, progressiveActivism: 0.26, suburbanGrowth: 0.76, institutionalTrust: 0.32, ruralTraditionalism: 0.68, outsiderAppeal: 0.58, reformAppetite: 0.3, mediaDriven: 0.72, electabilityFocus: 0.62 },
    secondary: { volatility: 0.64, grassrootsPower: 0.48, machinePolitics: 0.1, scandalSensitivity: 0.26, ideologicalPurity: 0.46, militaryCulture: 0.28, endorsementCulture: 0.42 },
  },
  UT: {
    core: { unionStrength: 0.08, blackElectorate: 0.03, latinoElectorate: 0.16, youthVote: 0.24, progressiveActivism: 0.08, suburbanGrowth: 0.56, institutionalTrust: 0.62, ruralTraditionalism: 0.66, outsiderAppeal: 0.62, reformAppetite: 0.34, mediaDriven: 0.3, electabilityFocus: 0.72 },
    secondary: { volatility: 0.28, grassrootsPower: 0.48, machinePolitics: 0.02, scandalSensitivity: 0.28, ideologicalPurity: 0.42, militaryCulture: 0.16, endorsementCulture: 0.2 },
  },
  VT: {
    core: { unionStrength: 0.14, blackElectorate: 0.02, latinoElectorate: 0.03, youthVote: 0.46, progressiveActivism: 0.92, suburbanGrowth: 0.22, institutionalTrust: 0.44, ruralTraditionalism: 0.16, outsiderAppeal: 0.58, reformAppetite: 0.78, mediaDriven: 0.26, electabilityFocus: 0.28 },
    secondary: { volatility: 0.42, grassrootsPower: 0.74, machinePolitics: 0, scandalSensitivity: 0.58, ideologicalPurity: 0.72, militaryCulture: 0.08, endorsementCulture: 0.06 },
  },
  VA: {
    core: { unionStrength: 0.16, blackElectorate: 0.28, latinoElectorate: 0.12, youthVote: 0.42, progressiveActivism: 0.34, suburbanGrowth: 0.8, institutionalTrust: 0.54, ruralTraditionalism: 0.44, outsiderAppeal: 0.34, reformAppetite: 0.54, mediaDriven: 0.68, electabilityFocus: 0.76 },
    secondary: { volatility: 0.58, grassrootsPower: 0.44, machinePolitics: 0.1, scandalSensitivity: 0.38, ideologicalPurity: 0.34, militaryCulture: 0.42, endorsementCulture: 0.52 },
  },
  AZ: {
    core: { unionStrength: 0.12, blackElectorate: 0.06, latinoElectorate: 0.62, youthVote: 0.42, progressiveActivism: 0.34, suburbanGrowth: 0.74, institutionalTrust: 0.34, ruralTraditionalism: 0.44, outsiderAppeal: 0.54, reformAppetite: 0.46, mediaDriven: 0.66, electabilityFocus: 0.68 },
    secondary: { volatility: 0.68, grassrootsPower: 0.46, machinePolitics: 0.06, scandalSensitivity: 0.3, ideologicalPurity: 0.34, militaryCulture: 0.24, endorsementCulture: 0.28 },
  },
  CT: {
    core: { unionStrength: 0.28, blackElectorate: 0.12, latinoElectorate: 0.18, youthVote: 0.38, progressiveActivism: 0.46, suburbanGrowth: 0.6, institutionalTrust: 0.68, ruralTraditionalism: 0.14, outsiderAppeal: 0.18, reformAppetite: 0.42, mediaDriven: 0.58, electabilityFocus: 0.68 },
    secondary: { volatility: 0.32, grassrootsPower: 0.32, machinePolitics: 0.18, scandalSensitivity: 0.64, ideologicalPurity: 0.32, militaryCulture: 0.08, endorsementCulture: 0.54 },
  },
  DC: {
    core: { unionStrength: 0.2, blackElectorate: 0.58, latinoElectorate: 0.12, youthVote: 0.52, progressiveActivism: 0.8, suburbanGrowth: 0.2, institutionalTrust: 0.72, ruralTraditionalism: 0.02, outsiderAppeal: 0.06, reformAppetite: 0.66, mediaDriven: 0.82, electabilityFocus: 0.46 },
    secondary: { volatility: 0.34, grassrootsPower: 0.42, machinePolitics: 0.01, scandalSensitivity: 0.78, ideologicalPurity: 0.72, militaryCulture: 0.04, endorsementCulture: 0.7 },
  },
  DE: {
    core: { unionStrength: 0.24, blackElectorate: 0.26, latinoElectorate: 0.08, youthVote: 0.24, progressiveActivism: 0.16, suburbanGrowth: 0.46, institutionalTrust: 0.88, ruralTraditionalism: 0.32, outsiderAppeal: 0.14, reformAppetite: 0.2, mediaDriven: 0.28, electabilityFocus: 0.88 },
    secondary: { volatility: 0.2, grassrootsPower: 0.24, machinePolitics: 0.06, scandalSensitivity: 0.48, ideologicalPurity: 0.14, militaryCulture: 0.1, endorsementCulture: 0.84 },
  },
  FL: {
    core: { unionStrength: 0.14, blackElectorate: 0.22, latinoElectorate: 0.42, youthVote: 0.18, progressiveActivism: 0.12, suburbanGrowth: 0.64, institutionalTrust: 0.56, ruralTraditionalism: 0.56, outsiderAppeal: 0.38, reformAppetite: 0.16, mediaDriven: 0.84, electabilityFocus: 0.84 },
    secondary: { volatility: 0.32, grassrootsPower: 0.28, machinePolitics: 0.14, scandalSensitivity: 0.3, ideologicalPurity: 0.2, militaryCulture: 0.22, endorsementCulture: 0.62 },
  },
  GA: {
    core: { unionStrength: 0.12, blackElectorate: 0.48, latinoElectorate: 0.12, youthVote: 0.42, progressiveActivism: 0.3, suburbanGrowth: 0.82, institutionalTrust: 0.46, ruralTraditionalism: 0.56, outsiderAppeal: 0.34, reformAppetite: 0.46, mediaDriven: 0.66, electabilityFocus: 0.76 },
    secondary: { volatility: 0.62, grassrootsPower: 0.48, machinePolitics: 0.12, scandalSensitivity: 0.32, ideologicalPurity: 0.38, militaryCulture: 0.24, endorsementCulture: 0.52 },
  },
  HI: {
    core: { unionStrength: 0.22, blackElectorate: 0.03, latinoElectorate: 0.12, youthVote: 0.5, progressiveActivism: 0.56, suburbanGrowth: 0.22, institutionalTrust: 0.34, ruralTraditionalism: 0.08, outsiderAppeal: 0.5, reformAppetite: 0.46, mediaDriven: 0.6, electabilityFocus: 0.22 },
    secondary: { volatility: 0.46, grassrootsPower: 0.5, machinePolitics: 0.04, scandalSensitivity: 0.42, ideologicalPurity: 0.54, militaryCulture: 0.18, endorsementCulture: 0.2 },
  },
  ID: {
    core: { unionStrength: 0.08, blackElectorate: 0.02, latinoElectorate: 0.14, youthVote: 0.2, progressiveActivism: 0.04, suburbanGrowth: 0.2, institutionalTrust: 0.2, ruralTraditionalism: 0.82, outsiderAppeal: 0.82, reformAppetite: 0.2, mediaDriven: 0.18, electabilityFocus: 0.34 },
    secondary: { volatility: 0.24, grassrootsPower: 0.64, machinePolitics: 0.01, scandalSensitivity: 0.16, ideologicalPurity: 0.54, militaryCulture: 0.12, endorsementCulture: 0.1 },
  },
  IL: {
    core: { unionStrength: 0.72, blackElectorate: 0.28, latinoElectorate: 0.22, youthVote: 0.48, progressiveActivism: 0.46, suburbanGrowth: 0.62, institutionalTrust: 0.56, ruralTraditionalism: 0.28, outsiderAppeal: 0.28, reformAppetite: 0.56, mediaDriven: 0.64, electabilityFocus: 0.66 },
    secondary: { volatility: 0.46, grassrootsPower: 0.52, machinePolitics: 0.42, scandalSensitivity: 0.42, ideologicalPurity: 0.42, militaryCulture: 0.12, endorsementCulture: 0.52 },
  },
  IN: {
    core: { unionStrength: 0.36, blackElectorate: 0.12, latinoElectorate: 0.08, youthVote: 0.22, progressiveActivism: 0.12, suburbanGrowth: 0.34, institutionalTrust: 0.48, ruralTraditionalism: 0.72, outsiderAppeal: 0.46, reformAppetite: 0.22, mediaDriven: 0.24, electabilityFocus: 0.68 },
    secondary: { volatility: 0.24, grassrootsPower: 0.42, machinePolitics: 0.14, scandalSensitivity: 0.28, ideologicalPurity: 0.36, militaryCulture: 0.18, endorsementCulture: 0.44 },
  },
  KS: {
    core: { unionStrength: 0.14, blackElectorate: 0.08, latinoElectorate: 0.1, youthVote: 0.24, progressiveActivism: 0.12, suburbanGrowth: 0.34, institutionalTrust: 0.38, ruralTraditionalism: 0.74, outsiderAppeal: 0.56, reformAppetite: 0.26, mediaDriven: 0.22, electabilityFocus: 0.52 },
    secondary: { volatility: 0.24, grassrootsPower: 0.46, machinePolitics: 0.08, scandalSensitivity: 0.24, ideologicalPurity: 0.46, militaryCulture: 0.2, endorsementCulture: 0.26 },
  },
  KY: {
    core: { unionStrength: 0.28, blackElectorate: 0.08, latinoElectorate: 0.04, youthVote: 0.18, progressiveActivism: 0.06, suburbanGrowth: 0.22, institutionalTrust: 0.36, ruralTraditionalism: 0.82, outsiderAppeal: 0.46, reformAppetite: 0.14, mediaDriven: 0.18, electabilityFocus: 0.54 },
    secondary: { volatility: 0.16, grassrootsPower: 0.38, machinePolitics: 0.12, scandalSensitivity: 0.2, ideologicalPurity: 0.5, militaryCulture: 0.16, endorsementCulture: 0.3 },
  },
  LA: {
    core: { unionStrength: 0.16, blackElectorate: 0.38, latinoElectorate: 0.08, youthVote: 0.24, progressiveActivism: 0.12, suburbanGrowth: 0.26, institutionalTrust: 0.3, ruralTraditionalism: 0.74, outsiderAppeal: 0.42, reformAppetite: 0.12, mediaDriven: 0.34, electabilityFocus: 0.52 },
    secondary: { volatility: 0.22, grassrootsPower: 0.42, machinePolitics: 0.44, scandalSensitivity: 0.18, ideologicalPurity: 0.32, militaryCulture: 0.14, endorsementCulture: 0.46 },
  },
  MD: {
    core: { unionStrength: 0.22, blackElectorate: 0.42, latinoElectorate: 0.12, youthVote: 0.44, progressiveActivism: 0.56, suburbanGrowth: 0.58, institutionalTrust: 0.62, ruralTraditionalism: 0.1, outsiderAppeal: 0.14, reformAppetite: 0.42, mediaDriven: 0.68, electabilityFocus: 0.58 },
    secondary: { volatility: 0.42, grassrootsPower: 0.46, machinePolitics: 0.08, scandalSensitivity: 0.56, ideologicalPurity: 0.52, militaryCulture: 0.18, endorsementCulture: 0.56 },
  },
  MS: {
    core: { unionStrength: 0.1, blackElectorate: 0.58, latinoElectorate: 0.04, youthVote: 0.2, progressiveActivism: 0.1, suburbanGrowth: 0.18, institutionalTrust: 0.48, ruralTraditionalism: 0.82, outsiderAppeal: 0.24, reformAppetite: 0.14, mediaDriven: 0.22, electabilityFocus: 0.7 },
    secondary: { volatility: 0.14, grassrootsPower: 0.38, machinePolitics: 0.18, scandalSensitivity: 0.22, ideologicalPurity: 0.54, militaryCulture: 0.18, endorsementCulture: 0.6 },
  },
  MO: {
    core: { unionStrength: 0.32, blackElectorate: 0.12, latinoElectorate: 0.06, youthVote: 0.24, progressiveActivism: 0.12, suburbanGrowth: 0.34, institutionalTrust: 0.42, ruralTraditionalism: 0.72, outsiderAppeal: 0.46, reformAppetite: 0.22, mediaDriven: 0.28, electabilityFocus: 0.68 },
    secondary: { volatility: 0.26, grassrootsPower: 0.44, machinePolitics: 0.22, scandalSensitivity: 0.24, ideologicalPurity: 0.38, militaryCulture: 0.18, endorsementCulture: 0.4 },
  },
  MT: {
    core: { unionStrength: 0.14, blackElectorate: 0.02, latinoElectorate: 0.04, youthVote: 0.18, progressiveActivism: 0.06, suburbanGrowth: 0.12, institutionalTrust: 0.24, ruralTraditionalism: 0.84, outsiderAppeal: 0.82, reformAppetite: 0.18, mediaDriven: 0.14, electabilityFocus: 0.34 },
    secondary: { volatility: 0.22, grassrootsPower: 0.56, machinePolitics: 0.01, scandalSensitivity: 0.2, ideologicalPurity: 0.38, militaryCulture: 0.18, endorsementCulture: 0.1 },
  },
  NE: {
    core: { unionStrength: 0.14, blackElectorate: 0.06, latinoElectorate: 0.12, youthVote: 0.22, progressiveActivism: 0.1, suburbanGrowth: 0.28, institutionalTrust: 0.38, ruralTraditionalism: 0.78, outsiderAppeal: 0.52, reformAppetite: 0.2, mediaDriven: 0.22, electabilityFocus: 0.54 },
    secondary: { volatility: 0.2, grassrootsPower: 0.48, machinePolitics: 0.08, scandalSensitivity: 0.24, ideologicalPurity: 0.42, militaryCulture: 0.18, endorsementCulture: 0.26 },
  },
  NJ: {
    core: { unionStrength: 0.4, blackElectorate: 0.16, latinoElectorate: 0.22, youthVote: 0.28, progressiveActivism: 0.24, suburbanGrowth: 0.52, institutionalTrust: 0.62, ruralTraditionalism: 0.08, outsiderAppeal: 0.12, reformAppetite: 0.18, mediaDriven: 0.68, electabilityFocus: 0.62 },
    secondary: { volatility: 0.24, grassrootsPower: 0.26, machinePolitics: 0.9, scandalSensitivity: 0.22, ideologicalPurity: 0.18, militaryCulture: 0.08, endorsementCulture: 0.8 },
  },
  NM: {
    core: { unionStrength: 0.14, blackElectorate: 0.03, latinoElectorate: 0.68, youthVote: 0.36, progressiveActivism: 0.32, suburbanGrowth: 0.22, institutionalTrust: 0.32, ruralTraditionalism: 0.38, outsiderAppeal: 0.46, reformAppetite: 0.36, mediaDriven: 0.3, electabilityFocus: 0.44 },
    secondary: { volatility: 0.42, grassrootsPower: 0.46, machinePolitics: 0.08, scandalSensitivity: 0.28, ideologicalPurity: 0.28, militaryCulture: 0.16, endorsementCulture: 0.18 },
  },
  NY: {
    core: { unionStrength: 0.34, blackElectorate: 0.24, latinoElectorate: 0.28, youthVote: 0.4, progressiveActivism: 0.42, suburbanGrowth: 0.52, institutionalTrust: 0.48, ruralTraditionalism: 0.16, outsiderAppeal: 0.18, reformAppetite: 0.26, mediaDriven: 0.86, electabilityFocus: 0.54 },
    secondary: { volatility: 0.38, grassrootsPower: 0.34, machinePolitics: 0.92, scandalSensitivity: 0.28, ideologicalPurity: 0.32, militaryCulture: 0.08, endorsementCulture: 0.76 },
  },
  ND: {
    core: { unionStrength: 0.12, blackElectorate: 0.02, latinoElectorate: 0.04, youthVote: 0.18, progressiveActivism: 0.08, suburbanGrowth: 0.14, institutionalTrust: 0.28, ruralTraditionalism: 0.86, outsiderAppeal: 0.66, reformAppetite: 0.2, mediaDriven: 0.14, electabilityFocus: 0.32 },
    secondary: { volatility: 0.18, grassrootsPower: 0.6, machinePolitics: 0.02, scandalSensitivity: 0.18, ideologicalPurity: 0.46, militaryCulture: 0.18, endorsementCulture: 0.12 },
  },
  OH: {
    core: { unionStrength: 0.72, blackElectorate: 0.16, latinoElectorate: 0.06, youthVote: 0.26, progressiveActivism: 0.18, suburbanGrowth: 0.42, institutionalTrust: 0.64, ruralTraditionalism: 0.62, outsiderAppeal: 0.34, reformAppetite: 0.26, mediaDriven: 0.32, electabilityFocus: 0.84 },
    secondary: { volatility: 0.28, grassrootsPower: 0.46, machinePolitics: 0.18, scandalSensitivity: 0.32, ideologicalPurity: 0.24, militaryCulture: 0.18, endorsementCulture: 0.5 },
  },
  OR: {
    core: { unionStrength: 0.28, blackElectorate: 0.04, latinoElectorate: 0.12, youthVote: 0.56, progressiveActivism: 0.82, suburbanGrowth: 0.4, institutionalTrust: 0.22, ruralTraditionalism: 0.18, outsiderAppeal: 0.46, reformAppetite: 0.62, mediaDriven: 0.64, electabilityFocus: 0.2 },
    secondary: { volatility: 0.6, grassrootsPower: 0.7, machinePolitics: 0.04, scandalSensitivity: 0.46, ideologicalPurity: 0.76, militaryCulture: 0.08, endorsementCulture: 0.14 },
  },
  PA: {
    core: { unionStrength: 0.8, blackElectorate: 0.18, latinoElectorate: 0.08, youthVote: 0.28, progressiveActivism: 0.2, suburbanGrowth: 0.52, institutionalTrust: 0.72, ruralTraditionalism: 0.5, outsiderAppeal: 0.24, reformAppetite: 0.3, mediaDriven: 0.4, electabilityFocus: 0.92 },
    secondary: { volatility: 0.34, grassrootsPower: 0.48, machinePolitics: 0.34, scandalSensitivity: 0.34, ideologicalPurity: 0.22, militaryCulture: 0.16, endorsementCulture: 0.58 },
  },
  RI: {
    core: { unionStrength: 0.3, blackElectorate: 0.1, latinoElectorate: 0.12, youthVote: 0.34, progressiveActivism: 0.42, suburbanGrowth: 0.28, institutionalTrust: 0.46, ruralTraditionalism: 0.08, outsiderAppeal: 0.18, reformAppetite: 0.28, mediaDriven: 0.56, electabilityFocus: 0.44 },
    secondary: { volatility: 0.3, grassrootsPower: 0.36, machinePolitics: 0.56, scandalSensitivity: 0.3, ideologicalPurity: 0.28, militaryCulture: 0.08, endorsementCulture: 0.48 },
  },
  SD: {
    core: { unionStrength: 0.14, blackElectorate: 0.03, latinoElectorate: 0.05, youthVote: 0.18, progressiveActivism: 0.08, suburbanGrowth: 0.14, institutionalTrust: 0.28, ruralTraditionalism: 0.86, outsiderAppeal: 0.62, reformAppetite: 0.18, mediaDriven: 0.14, electabilityFocus: 0.34 },
    secondary: { volatility: 0.18, grassrootsPower: 0.56, machinePolitics: 0.02, scandalSensitivity: 0.18, ideologicalPurity: 0.42, militaryCulture: 0.16, endorsementCulture: 0.12 },
  },
  WA: {
    core: { unionStrength: 0.32, blackElectorate: 0.08, latinoElectorate: 0.12, youthVote: 0.62, progressiveActivism: 0.78, suburbanGrowth: 0.52, institutionalTrust: 0.24, ruralTraditionalism: 0.18, outsiderAppeal: 0.42, reformAppetite: 0.6, mediaDriven: 0.74, electabilityFocus: 0.2 },
    secondary: { volatility: 0.62, grassrootsPower: 0.66, machinePolitics: 0.06, scandalSensitivity: 0.44, ideologicalPurity: 0.72, militaryCulture: 0.12, endorsementCulture: 0.16 },
  },
  WV: {
    core: { unionStrength: 0.42, blackElectorate: 0.04, latinoElectorate: 0.02, youthVote: 0.12, progressiveActivism: 0.04, suburbanGrowth: 0.08, institutionalTrust: 0.34, ruralTraditionalism: 0.9, outsiderAppeal: 0.52, reformAppetite: 0.1, mediaDriven: 0.12, electabilityFocus: 0.44 },
    secondary: { volatility: 0.12, grassrootsPower: 0.34, machinePolitics: 0.08, scandalSensitivity: 0.16, ideologicalPurity: 0.28, militaryCulture: 0.12, endorsementCulture: 0.2 },
  },
  WI: {
    core: { unionStrength: 0.66, blackElectorate: 0.12, latinoElectorate: 0.08, youthVote: 0.34, progressiveActivism: 0.24, suburbanGrowth: 0.42, institutionalTrust: 0.62, ruralTraditionalism: 0.56, outsiderAppeal: 0.34, reformAppetite: 0.3, mediaDriven: 0.32, electabilityFocus: 0.82 },
    secondary: { volatility: 0.34, grassrootsPower: 0.5, machinePolitics: 0.14, scandalSensitivity: 0.34, ideologicalPurity: 0.26, militaryCulture: 0.16, endorsementCulture: 0.44 },
  },
  WY: {
    core: { unionStrength: 0.08, blackElectorate: 0.01, latinoElectorate: 0.06, youthVote: 0.14, progressiveActivism: 0.04, suburbanGrowth: 0.08, institutionalTrust: 0.22, ruralTraditionalism: 0.84, outsiderAppeal: 0.8, reformAppetite: 0.16, mediaDriven: 0.12, electabilityFocus: 0.3 },
    secondary: { volatility: 0.12, grassrootsPower: 0.52, machinePolitics: 0, scandalSensitivity: 0.14, ideologicalPurity: 0.4, militaryCulture: 0.14, endorsementCulture: 0.08 },
  },
};
function resolvePrimaryCandidateKey(candidateLike) {
  if (!candidateLike) {
    return "";
  }
  if (typeof candidateLike === "string") {
    return candidateLike;
  }
  return candidateLike.candidateKey || candidateLike.id || "";
}

function getPrimaryCandidateAffinity(candidateLike) {
  return PRIMARY_CANDIDATE_AFFINITIES[resolvePrimaryCandidateKey(candidateLike)] || null;
}

function getPrimaryStateProfile(abbr) {
  return PRIMARY_STATE_PROFILES[abbr] || null;
}

function computePrimaryTraitFit(candidateLike, stateAbbr) {
  const affinity = getPrimaryCandidateAffinity(candidateLike);
  const profile = getPrimaryStateProfile(stateAbbr);
  if (!affinity || !profile) {
    return 0;
  }
  const coreScore = PRIMARY_CORE_TRAITS.reduce((sum, trait) => sum + (profile.core?.[trait] || 0) * (affinity.core?.[trait] || 0), 0) / PRIMARY_CORE_TRAITS.length;
  const secondaryScore = PRIMARY_SECONDARY_TRAITS.reduce((sum, trait) => sum + (profile.secondary?.[trait] || 0) * (affinity.secondary?.[trait] || 0), 0) / PRIMARY_SECONDARY_TRAITS.length;
  return coreScore * 0.78 + secondaryScore * 0.22;
}
const EVENT_DECK = [
  { title: "Viral Speech", effect: "momentum", magnitude: 7, good: true, summary: "A clipped speech floods the feeds and gives a candidate fresh momentum." },
  { title: "Debate Gaffe", effect: "favorability", magnitude: -5, good: false, summary: "A painful sound bite keeps replaying all day." },
  { title: "Strong Endorsement", effect: "support", magnitude: 1.4, good: true, summary: "A trusted local voice quietly moves undecideds." },
  { title: "Weather Problems", effect: "fatigue", magnitude: 5, good: false, summary: "Travel snarls and empty risers slow a campaign down." },
  { title: "Leaked Recording", effect: "favorability", magnitude: -6, good: false, summary: "A hidden-mic moment damages a carefully managed image." },
  { title: "Economic Report", effect: "economy", magnitude: 0.12, good: true, summary: "Pocketbook issues jump up the priority list." },
  { title: "Celebrity Endorsement", effect: "support", magnitude: 0.9, good: true, summary: "One campaign gets a glitzy boost in media-heavy states." },
  { title: "PAC Ad Barrage", effect: "pac", magnitude: 1.1, good: false, summary: "An outside group saturates a battleground without asking anyone's permission." },
];

const DAILY_EFFORT = 100;
const RALLY_COST = 20;
const MAX_RALLIES = 3;
const MIX_STEP = 5;
const GAME_VERSION = 4;
const ISSUE_LABELS = {
  economy: "Economy",
  healthcare: "Healthcare",
  immigration: "Immigration",
  crime: "Security",
  environment: "Environment",
  values: "Values",
  corruption: "Reform",
  unity: "Unity",
};
const ISSUE_DESCRIPTORS = {
  economy: "jobs, prices, wages, and economic confidence",
  healthcare: "coverage, hospitals, and everyday care",
  immigration: "border politics, migration, and regional identity",
  crime: "public safety, law and order, and foreign-policy toughness",
  environment: "climate, conservation, and clean-energy language",
  values: "faith, family, and cultural identity",
  corruption: "clean government, ethics, and anti-machine talk",
  unity: "healing, coalition-building, and national steadiness",
};
const TRAVEL_WEIGHTS = {
  AK: 2.4,
  HI: 2.3,
  CA: 2.1,
  TX: 2.0,
  FL: 1.6,
  MT: 1.5,
  NV: 1.4,
  NM: 1.4,
  AZ: 1.4,
  CO: 1.35,
  WY: 1.3,
};
const ISSUE_EVENT_POOL = [
  {
    key: "economy",
    scope: "national",
    headline: "A jittery jobs report has the cable panels obsessing over the economy.",
    shift: "Economic anxiety is rising.",
  },
  {
    key: "immigration",
    scope: "region",
    headline: "A border flashpoint pushes immigration near the top of the regional conversation.",
    shift: "Immigration is dominating coverage in this round.",
  },
  {
    key: "crime",
    scope: "national",
    headline: "Security and public-order messaging suddenly feel more live.",
    shift: "Security language is getting more airtime.",
  },
  {
    key: "corruption",
    scope: "national",
    headline: "A corruption flare-up makes reform language more potent than usual.",
    shift: "Reform and clean-government talk are breaking through.",
  },
  {
    key: "environment",
    scope: "region",
    headline: "A climate-and-disaster story pushes environmental framing into the top tier.",
    shift: "Environment is climbing in salience around this region.",
  },
];
const PRIORITY_LEVELS = ["low", "medium", "high"];
const MANAGER_TOPICS = [
  { id: "best-opportunity", label: "Best Opportunity" },
  { id: "biggest-risk", label: "Biggest Risk" },
  { id: "protect-lead", label: "Protect A Lead" },
  { id: "upset-chance", label: "Upset Chance" },
  { id: "advertise", label: "Where Should I Advertise?" },
  { id: "rally", label: "Where Should I Rally?" },
  { id: "split-day", label: "How Should I Split Today?" },
  { id: "build-on-deck", label: "Should I Build For On Deck?" },
  { id: "state-read", label: "How Does This State Read?" },
  { id: "brand", label: "How Is My Brand Landing?" },
];
const elements = {};
let currentBuilderStats = {};
let gameState = null;
let selectedSetupParty = "democrat";
let selectedSetupCandidateId = "joseph";
let primaryCalendarExpanded = false;
const RAIL_MAP_COLORS = [
  { light: "#9bd0ff", dark: "#4ea4ff" },
  { light: "#ffd39d", dark: "#f6a04d" },
  { light: "#ffb5ad", dark: "#ff7361" },
  { light: "#aef0e7", dark: "#4fd6c3" },
];
let railMapReady = false;

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  currentBuilderStats = buildDefaultPlayerStats();
  renderCampaignManual();
  populateSetup();
  bindEvents();
  maybeShowSaveButton();
});

function cacheElements() {
  [
    "setup-screen",
    "game-screen",
    "election-screen",
    "party-choice",
    "selected-party-label",
    "setup-party-description",
    "candidate-selector",
    "selected-candidate-panel",
    "candidate-preview-list",
    "primary-turn-list",
    "setup-strategy-panel",
    "calendar-toggle-button",
    "start-game-button",
    "load-save-button",
    "open-manual-setup-button",
    "headline-region",
    "turn-indicator",
    "effort-indicator",
    "projected-value-label",
    "ev-indicator",
    "open-manual-button",
    "tutorial-panel",
    "dismiss-tutorial-button",
    "round-recap-panel",
    "recap-title",
    "recap-body",
    "continue-region-button",
    "candidate-strip",
    "polling-region-title",
    "poll-scope",
    "polling-summary",
    "state-poll-table",
    "planning-region-title",
    "priority-map",
    "on-deck-state-title",
    "on-deck-state-phase",
    "on-deck-state-panel",
    "message-mix",
    "message-total",
    "toggle-mix-definitions-button",
    "message-identity-summary",
    "itinerary-options",
    "itinerary-readout",
    "rally-count",
    "rally-slots",
    "rally-budget",
    "fundraising-effort",
    "endorsement-effort",
    "general-effort",
    "general-effort-indicator",
    "remaining-effort",
    "effort-preview",
    "ad-scope",
    "ad-units",
    "ad-state",
    "ad-state-label",
    "ad-type",
    "ad-opponent",
    "ad-opponent-label",
    "ad-opponent-heading",
    "ad-buy-count",
    "ad-cost-inline",
    "ad-preview",
    "ad-math-panel",
    "run-ad-buy-button",
    "end-turn-button",
    "save-button",
    "news-alert-badge",
    "news-spotlight",
    "news-impact-panel",
    "manager-topic",
    "manager-state",
    "analysis-state",
    "rail-map-canvas",
    "rail-map-legend",
    "rail-map-detail",
    "insights-state-title",
    "state-insights-panel",
    "live-standings-summary",
    "live-standings-grid",
    "campaign-manager-panel",
    "ask-manager-button",
    "manager-answer",
    "recent-results-panel",
    "live-standings-toggle",
    "live-standings-panel",
    "opponent-report",
    "event-log",
    "election-title",
    "election-winner-banner",
    "election-scoreboard",
    "call-next-button",
    "call-all-button",
    "call-log",
    "state-results-grid",
    "return-to-setup-button",
    "poster-modal",
    "poster-title",
    "poster-image",
    "close-poster-button",
    "manual-modal",
    "manual-body",
    "close-manual-button",
  ].forEach((id) => {
    elements[id] = document.getElementById(id);
  });
}

function bindEvents() {
  elements["party-choice"]?.addEventListener("click", handlePartyChoice);
  elements["candidate-selector"]?.addEventListener("click", handleCandidateChoice);
  elements["calendar-toggle-button"]?.addEventListener("click", togglePrimaryCalendar);
  elements["start-game-button"].addEventListener("click", startNewGame);
  elements["load-save-button"].addEventListener("click", loadSavedGame);
  elements["open-manual-setup-button"]?.addEventListener("click", openManualModal);
  elements["open-manual-button"]?.addEventListener("click", openManualModal);
  elements["dismiss-tutorial-button"].addEventListener("click", () => {
    if (!gameState) {
      return;
    }
    gameState.ui.tutorialDismissed = true;
    renderGame();
  });
  elements["continue-region-button"].addEventListener("click", continueToNextRound);
  elements["poll-scope"].addEventListener("change", () => {
    if (!gameState) {
      return;
    }
    gameState.ui.pollScope = elements["poll-scope"].value;
    renderGame();
  });
  elements["priority-map"]?.addEventListener("change", handlePriorityChange);
  elements["message-mix"].addEventListener("input", handleMixChange);
  elements["message-mix"].addEventListener("change", handleMixChange);
  elements["message-mix"].addEventListener("click", handleMessageMixClick);
  elements["toggle-mix-definitions-button"]?.addEventListener("click", handleMessageMixToggle);
  elements["itinerary-options"]?.addEventListener("change", handleItineraryChange);
  elements["rally-count"]?.addEventListener("change", handleRallyCountChange);
  elements["rally-slots"]?.addEventListener("change", handleRallyStateChange);
  elements["fundraising-effort"].addEventListener("input", () => updateEffortPlan({ syncInputs: false }));
  elements["endorsement-effort"].addEventListener("input", () => updateEffortPlan({ syncInputs: false }));
  elements["fundraising-effort"].addEventListener("change", () => updateEffortPlan());
  elements["endorsement-effort"].addEventListener("change", () => updateEffortPlan());
  elements["ad-scope"].addEventListener("change", renderAdPreview);
  elements["ad-units"].addEventListener("input", renderAdPreview);
  elements["ad-state"].addEventListener("change", renderAdPreview);
  elements["ad-type"].addEventListener("change", renderAdPreview);
  elements["ad-opponent"].addEventListener("change", renderAdPreview);
  elements["run-ad-buy-button"].addEventListener("click", lockAdBuy);
  elements["ad-preview"].addEventListener("click", handleAdPreviewClick);
  elements["end-turn-button"].addEventListener("click", handleEndTurnAction);
  elements["save-button"].addEventListener("click", saveGame);
  elements["state-poll-table"].addEventListener("click", handlePollingClick);
  elements["state-poll-table"].addEventListener("change", handlePriorityChange);
  elements["state-poll-table"].addEventListener("input", handleStateEffortChange);
  elements["state-poll-table"].addEventListener("change", handleStateEffortChange);
  elements["candidate-strip"].addEventListener("click", handlePosterLaunch);
  elements["candidate-preview-list"].addEventListener("click", handlePosterLaunch);
  elements["ask-manager-button"].addEventListener("click", answerManagerQuestion);
  elements["manager-topic"]?.addEventListener("change", handleManagerTopicChange);
  elements["manager-state"]?.addEventListener("change", handleManagerStateChange);
  elements["analysis-state"]?.addEventListener("change", handleAnalysisStateChange);
  elements["live-standings-toggle"].addEventListener("click", toggleLiveStandings);
  elements["call-next-button"].addEventListener("click", callNextState);
  elements["call-all-button"].addEventListener("click", callAllStates);
  elements["close-poster-button"].addEventListener("click", closePosterModal);
  elements["close-manual-button"]?.addEventListener("click", closeManualModal);
  document.querySelectorAll("[data-rail-tab]").forEach((button) => {
    button.addEventListener("click", handleRailTabClick);
  });
  elements["poster-modal"].addEventListener("click", (event) => {
    if (event.target.dataset.closePoster === "true") {
      closePosterModal();
    }
  });
  elements["manual-modal"]?.addEventListener("click", (event) => {
    if (event.target.dataset.closeManual === "true") {
      closeManualModal();
    }
  });
  elements["return-to-setup-button"].addEventListener("click", () => {
    showScreen("setup");
    maybeShowSaveButton();
  });
}

function populateSetup() {
  primaryCalendarExpanded = false;
  syncSetupSelection();
  renderPartyChoice();
  renderSetupCandidateSelector();
  renderSelectedCandidatePanel();
  renderCandidatePreviews();
  renderPrimaryCalendarPlan();
  renderSetupStrategyPanel();
}

function syncSetupSelection() {
  const field = getPartyCandidates(selectedSetupParty);
  if (!field.some((candidate) => candidate.id === selectedSetupCandidateId)) {
    selectedSetupCandidateId = field[0]?.id || "";
  }
}

function getPartyCandidates(party) {
  return AI_POOL.filter((candidate) => candidate.party === party);
}

function getSetupSelectedCandidate() {
  return AI_POOL.find((candidate) => candidate.id === selectedSetupCandidateId) || getPartyCandidates(selectedSetupParty)[0] || null;
}

function renderPartyChoice() {
  const parties = [
    { id: "democrat", label: "Democrat", copy: "Build a coalition across labor, reform, movement, and machine politics." },
    { id: "republican", label: "Republican", copy: "Fight through outsiders, operators, movement conservatives, and establishment money." },
  ];
  elements["party-choice"].innerHTML = parties.map((party) => `
    <button class="party-choice-button ${selectedSetupParty === party.id ? "active" : ""}" type="button" data-party-choice="${party.id}">
      <strong>${party.label}</strong>
      <span>${party.copy}</span>
    </button>
  `).join("");
  elements["selected-party-label"].textContent = selectedSetupParty === "democrat" ? "Democratic Primary" : "Republican Primary";
  elements["setup-party-description"].textContent = selectedSetupParty === "democrat"
    ? "Choose the Democrat whose coalition, message, and timing give you the clearest route through the field."
    : "Choose the Republican whose ideology, media style, and organization best fit your path to the nomination.";
}

function renderSetupCandidateSelector() {
  const selected = getSetupSelectedCandidate();
  elements["candidate-selector"].innerHTML = getPartyCandidates(selectedSetupParty).map((candidate) => `
    <button class="setup-candidate-option ${candidate.id === selected?.id ? "active" : ""}" type="button" data-candidate-choice="${candidate.id}">
      ${renderPortrait(candidate)}
      <div class="setup-candidate-copy">
        <strong>${candidate.name}</strong>
        <span>${candidate.archetype}</span>
        <small>${candidate.hometown ? `${candidate.hometown}, ` : ""}${getStateName(candidate.homeState)}</small>
      </div>
    </button>
  `).join("");
}

function renderSelectedCandidatePanel() {
  const candidate = getSetupSelectedCandidate();
  if (!candidate) {
    elements["selected-candidate-panel"].innerHTML = "";
    return;
  }
  const naturalLane = topIssuesFromMix(defaultAiIssueUsage(candidate), 3).map((issue) => ISSUE_LABELS[issue]).join(", ");
  const topStrengths = (candidate.strengths?.length ? candidate.strengths : ["Steady base", "Party fit", "A clear narrative"]).slice(0, 5);
  const topWeaknesses = (candidate.weaknesses?.length ? candidate.weaknesses : ["Limited upside", "Narrative risk", "Momentum vulnerability"]).slice(0, 5);
  const openingEdge = [candidate.regionIdentity, `${candidate.hometown ? `${candidate.hometown}, ` : ""}${getStateName(candidate.homeState)}`, naturalLane]
    .filter(Boolean)
    .join(" | ");
  elements["selected-candidate-panel"].innerHTML = `
    <div class="selected-candidate-kicker">You Are Running As ${candidate.name}</div>
    <div class="selected-candidate-head">
      ${renderPortrait(candidate)}
      <div class="selected-candidate-copy">
        <strong>${candidate.name}</strong>
        <p class="selected-candidate-meta">${candidate.archetype}</p>
        <p class="selected-candidate-path">${openingEdge}</p>
      </div>
    </div>
    <p class="selected-candidate-pitch">${candidate.summary}</p>
    <div class="candidate-tag-row">
      <span class="detail-chip">Home Base: ${candidate.hometown ? `${candidate.hometown}, ` : ""}${getStateName(candidate.homeState)}</span>
      <span class="detail-chip">Natural Lane: ${naturalLane}</span>
    </div>
    <div class="selected-candidate-strength-grid">
      <div class="selected-candidate-tray">
        <strong>What You Can Lean On</strong>
        <div class="detail-chip-row">
          ${topStrengths.map((item) => `<span class="detail-chip">${item}</span>`).join("")}
        </div>
      </div>
      <div class="selected-candidate-tray">
        <strong>What Can Go Wrong</strong>
        <div class="detail-chip-row">
          ${topWeaknesses.map((item) => `<span class="detail-chip">${item}</span>`).join("")}
        </div>
      </div>
    </div>
  `;
}

function handlePartyChoice(event) {
  const button = event.target.closest("[data-party-choice]");
  if (!button) {
    return;
  }
  selectedSetupParty = button.dataset.partyChoice;
  syncSetupSelection();
  renderPartyChoice();
  renderSetupCandidateSelector();
  renderSelectedCandidatePanel();
  renderCandidatePreviews();
  renderSetupStrategyPanel();
}

function handleCandidateChoice(event) {
  const button = event.target.closest("[data-candidate-choice]");
  if (!button) {
    return;
  }
  selectedSetupCandidateId = button.dataset.candidateChoice;
  renderSetupCandidateSelector();
  renderSelectedCandidatePanel();
  renderCandidatePreviews();
  renderSetupStrategyPanel();
}

function buildDefaultPlayerStats() {
  return Object.fromEntries(PLAYER_STATS.map((stat) => [stat.key, BASE_STAT_VALUE]));
}

function pointsLeft(stats = currentBuilderStats) {
  const spent = PLAYER_STATS.reduce((sum, stat) => sum + (stats[stat.key] - BASE_STAT_VALUE), 0);
  return BONUS_POINTS - spent;
}

function renderStateOptions() {
  const options = STATE_DATA.slice()
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([abbr, name]) => `<option value="${abbr}">${name}</option>`)
    .join("");
  elements["player-home-state"].innerHTML = options;
  elements["player-home-state"].value = "OH";
}

function renderStatBuilder() {
  elements["stat-builder"].innerHTML = PLAYER_STATS.map((stat) => {
    const value = currentBuilderStats[stat.key];
    return `
      <div class="stat-row">
        <div>
          <strong>${stat.label}</strong>
        </div>
        <div class="stat-controls">
          <button class="mini-button" type="button" data-stat-adjust="${stat.key}" data-direction="-1">-</button>
          <strong>${value}</strong>
          <button class="mini-button" type="button" data-stat-adjust="${stat.key}" data-direction="1">+</button>
        </div>
        <div class="hint">${describeStat(stat.key)}</div>
      </div>
    `;
  }).join("");

  elements["points-left"].textContent = String(pointsLeft());
  elements["stat-builder"].querySelectorAll("[data-stat-adjust]").forEach((button) => {
    button.addEventListener("click", () => adjustStat(button.dataset.statAdjust, Number(button.dataset.direction)));
  });
}

function describeStat(key) {
  const descriptions = {
    charisma: "Big public moments, rallies, and camera appeal",
    discipline: "Consistency, focus, and fewer self-inflicted wounds",
    authenticity: "Retail politics, trust, and local credibility",
    fundraising: "Donor confidence and resource generation",
    debateSkill: "Podium performance and argument-heavy moments",
    stamina: "How much punishment the road can take before slowing you down",
  };
  return descriptions[key];
}

function adjustStat(key, delta) {
  const nextValue = currentBuilderStats[key] + delta;
  if (nextValue < STAT_MIN || nextValue > STAT_MAX) {
    return;
  }
  if (delta > 0 && pointsLeft() <= 0) {
    return;
  }
  currentBuilderStats[key] = nextValue;
  renderStatBuilder();
  renderIdentityPreview();
}

function deriveIdentityFromStats(stats) {
  const ordered = [...PLAYER_STATS].sort((a, b) => stats[b.key] - stats[a.key]);
  const topKeys = ordered.slice(0, 2).map((entry) => entry.key);

  if (topKeys.includes("fundraising") && topKeys.includes("debateSkill")) {
    return {
      label: "Polished Insider",
      copy: "Camera-ready, donor-friendly, and extremely comfortable with people who call themselves stakeholders.",
    };
  }
  if (topKeys.includes("charisma") && topKeys.includes("authenticity")) {
    return {
      label: "Populist Firebrand",
      copy: "A crowd magnet with enough heat to move a room and enough risk to set one off.",
    };
  }
  if (topKeys.includes("charisma") && topKeys.includes("discipline")) {
    return {
      label: "Media-Savvy Chameleon",
      copy: "Fast on camera, sharp in the room, and a little too good at sounding inevitable.",
    };
  }
  if (topKeys.includes("authenticity") && topKeys.includes("stamina")) {
    return {
      label: "Straight Shooter",
      copy: "Built for long hauls, local diners, and voters who can smell canned lines from the county line.",
    };
  }
  return {
    label: "Balanced Unknown",
    copy: "An undefined general-election shape who can still become several different kinds of candidate.",
  };
}

function deriveCampaignStyle(stats) {
  if (stats.charisma >= 7 && stats.discipline <= 4) {
    return "Combative";
  }
  if (stats.discipline >= 7 || stats.debateSkill >= 7) {
    return "Serious";
  }
  return "Hopeful";
}

function renderIdentityPreview() {
  const identity = deriveIdentityFromStats(currentBuilderStats);
  elements["identity-label"].textContent = identity.label;
  elements["identity-copy"].textContent = identity.copy;
}

function renderCandidatePreviews() {
  const selected = getSetupSelectedCandidate();
  elements["candidate-preview-list"].innerHTML = getPartyCandidates(selectedSetupParty).map((candidate) => `
    <article class="candidate-preview-card ${candidate.id === selected?.id ? "is-selected-preview" : ""}">
      ${renderPortrait(candidate)}
      <div class="candidate-preview-copy">
        <div class="tag ${candidate.id === selected?.id ? "player-tag" : "neutral"}">${candidate.id === selected?.id ? "Your Candidate" : "Primary Rival"}</div>
        <h3>${candidate.name}</h3>
        <p class="candidate-preview-meta"><strong>Home:</strong> ${candidate.hometown ? `${candidate.hometown}, ` : ""}${getStateName(candidate.homeState)} | <strong>Style:</strong> ${candidate.archetype}</p>
        <p class="candidate-preview-summary">${truncateSetupCopy(candidate.summary, 132)}</p>
        <p class="candidate-preview-note">Best when the map rewards ${topIssuesFromMix(defaultAiIssueUsage(candidate), 2).map((issue) => ISSUE_LABELS[issue].toLowerCase()).join(" and ")}.</p>
        ${candidate.poster ? `<div class="candidate-actions"><button class="secondary-button" type="button" data-open-poster="${candidate.id}">View Poster</button></div>` : ""}
      </div>
    </article>
  `).join("");
}

function renderSetupStrategyPanel() {
  const candidate = getSetupSelectedCandidate();
  if (!candidate) {
    elements["setup-strategy-panel"].innerHTML = "";
    return;
  }
  const strengths = (candidate.strengths || []).slice(0, 3);
  const weaknesses = (candidate.weaknesses || []).slice(0, 2);
  const naturalLane = topIssuesFromMix(defaultAiIssueUsage(candidate), 2).map((issue) => ISSUE_LABELS[issue]).join(" and ");
  elements["setup-strategy-panel"].innerHTML = `
    <div class="strategy-note">
      <strong>Opening States To Watch</strong>
      <p>${candidate.hometown ? `${candidate.hometown}, ${getStateName(candidate.homeState)}` : getStateName(candidate.homeState)} should anchor your identity early while you hunt openings where ${naturalLane.toLowerCase()} can carry the story.</p>
    </div>
    <div class="strategy-note">
      <strong>What Your Campaign Needs</strong>
      <div class="strategy-chip-row">
        ${strengths.map((item) => `<span class="detail-chip">${item}</span>`).join("")}
      </div>
    </div>
    <div class="strategy-note">
      <strong>Where You Can Slip</strong>
      <div class="strategy-chip-row">
        ${(weaknesses.length ? weaknesses : ["Momentum stalls", "Narrative drift"]).map((item) => `<span class="detail-chip">${item}</span>`).join("")}
      </div>
    </div>
  `;
}

function renderPrimaryCalendarPlan() {
  const visibleTurns = primaryCalendarExpanded ? PRIMARY_TURN_WINDOWS : PRIMARY_TURN_WINDOWS.slice(0, 4);
  elements["primary-turn-list"].innerHTML = visibleTurns.map((window) => `
    <article class="primary-turn-card">
      <div class="primary-turn-head">
        <div class="turn-pill">Turn ${window.turn}</div>
        <div>
          <strong>${window.label}</strong>
          <span>${window.dates}</span>
        </div>
      </div>
      <p class="primary-turn-contests">${window.contests}</p>
      <p class="hint">${window.note}</p>
    </article>
  `).join("");
  if (elements["calendar-toggle-button"]) {
    elements["calendar-toggle-button"].textContent = primaryCalendarExpanded ? "Show Fewer Opening Turns" : "View Full 12-Turn Calendar";
  }
}

function togglePrimaryCalendar() {
  primaryCalendarExpanded = !primaryCalendarExpanded;
  renderPrimaryCalendarPlan();
}

function truncateSetupCopy(text, limit = 140) {
  if (!text || text.length <= limit) {
    return text;
  }
  const slice = text.slice(0, limit);
  const cutoff = slice.lastIndexOf(" ");
  return `${slice.slice(0, cutoff > 0 ? cutoff : limit)}...`;
}

function renderPortrait(candidate) {
  if (candidate.portrait) {
    return `<img class="portrait" src="${candidate.portrait}" alt="Candidate portrait" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'portrait-fallback',textContent:'${initials(candidate.name)}'}))" />`;
  }
  return `<div class="portrait-fallback">${initials(candidate.name)}</div>`;
}

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function maybeShowSaveButton() {
  const hasSave = Boolean(localStorage.getItem(SAVE_KEY));
  elements["load-save-button"].classList.toggle("hidden", !hasSave);
}

function startNewGame() {
  try {
    const selectedCandidate = getSetupSelectedCandidate();
    if (!selectedCandidate) {
      alert("Pick a party and candidate before starting the campaign.");
      return;
    }
    const playerCandidate = buildPlayerCandidateFromTemplate(selectedCandidate);
    const aiCandidates = pickAiCandidates(selectedCandidate.id, selectedCandidate.party);
    gameState = hydrateGameState(buildGameState(playerCandidate, aiCandidates));
    showScreen("game");
    renderGame();
    saveGame();
  } catch (error) {
    console.error("Start campaign failed", error);
    alert(`Start campaign failed: ${error.message}`);
  }
}

function buildPlayerCandidateFromTemplate(template) {
  return {
    id: "player",
    candidateKey: template.id,
    name: template.name,
    party: template.party,
    hometown: template.hometown,
    homeState: template.homeState,
    regionIdentity: template.regionIdentity,
    archetype: template.archetype,
    style: deriveAiStyle(template),
    summary: template.summary,
    portrait: template.portrait,
    poster: template.poster,
    stats: { ...template.stats },
    scandalRisk: template.scandalRisk,
    issueCredibility: { ...template.issueCredibility },
    resonance: { ...template.resonance },
    preferredMessages: [...template.preferredMessages],
    preferredTones: [...(template.preferredTones || [])],
    strengths: [...(template.strengths || [])],
    weaknesses: [...(template.weaknesses || [])],
    definedIssueUsage: defaultAiIssueUsage(template),
  };
}

function pickAiCandidates(selectedId, party) {
  return getPartyCandidates(party).filter((candidate) => candidate.id !== selectedId).map(cloneCandidate);
}

function cloneCandidate(candidate) {
  return {
    ...candidate,
    stats: { ...candidate.stats },
    issueCredibility: { ...candidate.issueCredibility },
    resonance: { ...candidate.resonance },
    preferredMessages: [...candidate.preferredMessages],
    definedIssueUsage: defaultAiIssueUsage(candidate),
    style: deriveAiStyle(candidate),
  };
}

function deriveAiStyle(candidate) {
  if (candidate.id === "jim") {
    return "Combative";
  }
  if (candidate.id === "buzz") {
    return "Serious";
  }
  if (candidate.id === "monica") {
    return "Serious";
  }
  if (candidate.id === "cornelius") {
    return "Serious";
  }
  if (candidate.id === "joseph") {
    return "Folksy";
  }
  return "Hopeful";
}

function defaultAiIssueUsage(candidate) {
  const usage = Object.fromEntries(ISSUE_KEYS.map((issue) => [issue, 5]));
  candidate.preferredMessages.forEach((issue, index) => {
    usage[issue] = 22 - index * 4;
  });
  normalizeMix(usage);
  return usage;
}

function captureRoundExpectations(state) {
  const roundStates = getCurrentRoundStatesForResolution(state);
  return {
    roundIndex: state.roundIndex,
    stateAbbrs: roundStates.map((item) => item.abbr),
    states: Object.fromEntries(
      roundStates.map((item) => [
        item.abbr,
        {
          rankings: sortSupportEntries(item.currentSupport).map(([candidateId, share], index) => ({
            candidateId,
            rank: index + 1,
            share,
          })),
        },
      ])
    ),
  };
}

function isPrimaryMode(state = gameState) {
  return state?.mode === "primary";
}

function getCurrentPrimaryWindow(state = gameState) {
  return PRIMARY_TURN_WINDOWS[state?.roundIndex || 0] || PRIMARY_TURN_WINDOWS[0];
}

function getCurrentPrimaryWindowDays(state = gameState) {
  return getCurrentPrimaryWindow(state)?.days || 1;
}

function getCurrentStageLabel(state = gameState) {
  return isPrimaryMode(state) ? getCurrentPrimaryWindow(state).label : getCurrentRegionName(state);
}

function getCurrentStageDates(state = gameState) {
  return isPrimaryMode(state) ? getCurrentPrimaryWindow(state).dates : "";
}

function getCurrentStageSummary(state = gameState) {
  if (isPrimaryMode(state)) {
    const window = getCurrentPrimaryWindow(state);
    return window?.note || "The next set of primary states is live.";
  }
  const regionName = getCurrentRegionName(state);
  return REGIONS[regionName]?.traitText || "";
}

function isLastCampaignStage(state = gameState) {
  return isPrimaryMode(state)
    ? state.roundIndex >= PRIMARY_TOTAL_TURNS - 1
    : state.roundIndex >= REGION_SEQUENCE.length - 1;
}

function buildGameState(playerCandidate, aiCandidates) {
  const candidates = [playerCandidate, ...aiCandidates].map((candidate) => ({
    ...candidate,
    money: STARTING_MONEY,
    momentum: STARTING_MOMENTUM,
    fatigue: STARTING_FATIGUE,
    favorability: STARTING_FAVORABILITY,
    delegatesWon: 0,
  }));
  const primaryParty = detectPrimaryParty(candidates);

  const states = STATE_DATA.map(([abbr, name, electoralVotes, region]) =>
    createStateModel(abbr, name, electoralVotes, region, candidates, primaryParty)
  );

  const priorities = Object.fromEntries(
    Object.keys(REGIONS).map((regionName) => [
      regionName,
      Object.fromEntries(REGIONS[regionName].states.map((abbr) => [abbr, "low"])),
    ])
  );

  const state = {
    version: GAME_VERSION,
    mode: primaryParty ? "primary" : "legacy",
    primaryParty,
    playerId: "player",
    candidates,
    states,
    roundIndex: 0,
    turnInRound: 1,
    ui: {
      selectedState: primaryParty ? PRIMARY_TURN_WINDOWS[0].stateAbbrs[0] : REGIONS[REGION_SEQUENCE[0]].states[0],
      tutorialDismissed: false,
      pollScope: "region",
      roundRecap: null,
      activeItineraryId: "",
      plannedAds: [],
      activeRailTab: "news",
      managerTopic: "best-opportunity",
      managerMemory: {},
      previousVisiblePolls: {},
      roundExpectations: null,
      momentumSummary: null,
      roundFundraisingLedger: {},
    },
    priorities,
    messageMix: defaultMessageMix(playerCandidate),
    dayPlan: {
      rallyCount: 0,
      rallies: [],
      fundraising: 20,
      endorsements: 20,
      stateEffort: {},
    },
    activeBuzz: null,
    opponentActivity: [
      { title: "Campaign Watch", text: "The field is still writing its first scripts and calling in every old favor it can find." },
    ],
    eventLog: [
      { title: "Campaign Launch", text: `${playerCandidate.name} enters the race from ${getStateName(playerCandidate.homeState)} with the cameras already rolling.` },
    ],
    electionNight: null,
  };
  resetBrandDriftState(state);
  state.ui.roundExpectations = captureRoundExpectations(state);
  return state;
}

function detectPrimaryParty(candidates) {
  const parties = [...new Set(candidates.map((candidate) => candidate.party).filter(Boolean))];
  return parties.length === 1 ? parties[0] : null;
}

function createStateModel(abbr, name, electoralVotes, region, candidates, primaryParty = null) {
  const regionBase = structuredClone(REGION_BASES[region]);
  const override = STATE_OVERRIDES[abbr] || {};
  const contestValue = primaryParty ? (PRIMARY_DELEGATE_TOTALS[primaryParty]?.[abbr] || electoralVotes) : electoralVotes;
  const issues = {};
  const traits = {};

  ISSUE_KEYS.forEach((issue) => {
    issues[issue] = Math.round(
      clamp(
        ((override.issues?.[issue] ?? regionBase.issues[issue]) + randomBetween(-0.035, 0.035)) * 100,
        20,
        90
      )
    );
  });

  Object.keys(regionBase.traits).forEach((trait) => {
    traits[trait] = Math.round(
      clamp(
        ((override.traits?.[trait] ?? regionBase.traits[trait]) + randomBetween(-0.035, 0.035)) * 100,
        10,
        95
      )
    );
  });

  const undecided = round1(randomBetween(33, 43));
  const state = {
    abbr,
    name,
    electoralVotes: contestValue,
    region,
    issues,
    traits,
    mediaCost: Math.round((override.mediaCost ?? regionBase.mediaCost) * 18),
    rallyEffectiveness: override.rallyEffectiveness ?? regionBase.rallyEffectiveness,
    groundGameEffectiveness: override.groundGameEffectiveness ?? regionBase.groundGameEffectiveness,
    travelWeight: travelWeightForState(abbr, region),
    currentSupport: {},
    enthusiasm: {},
    adPressure: {},
    undecided,
    pollingError: round1(randomBetween(1.4, 2.6)),
    visiblePolls: {},
    topConcern: topIssueKey(issues),
    primaryAwarded: false,
    primaryWinnerId: "",
    finalResult: null,
  };

  seedStateSupport(state, candidates);
  return state;
}

function seedStateSupport(state, candidates) {
  const scores = candidates.map((candidate) => scoreCandidateForState(candidate, state, true));
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const normalizedScores = scores.map((score) => clamp(1 + (score - averageScore) * 0.42, 0.72, 1.32));
  const available = 100 - state.undecided;
  const totalScore = normalizedScores.reduce((sum, value) => sum + value, 0);

  candidates.forEach((candidate, index) => {
    state.currentSupport[candidate.id] = round1((normalizedScores[index] / totalScore) * available);
    state.enthusiasm[candidate.id] = clamp(48 + randomBetween(-6, 8), 24, 82);
    state.enthusiasm[candidate.id] = clamp(
      state.enthusiasm[candidate.id] + primaryOpeningStateSpecificEnthusiasmBonus(candidate, state),
      24,
      86
    );
  });

  enforceHomeStateEdge(state, candidates);
  normalizeSupport(state);
}

function scoreCandidateForState(candidate, state, opening = false) {
  if (getPrimaryCandidateAffinity(candidate)) {
    return scoreCandidateForPrimaryState(candidate, state, opening);
  }
  return scoreCandidateForLegacyState(candidate, state, opening);
}

function scoreCandidateForPrimaryState(candidate, state, opening = false) {
  const traitFit = computePrimaryTraitFit(candidate, state.abbr);
  if (!traitFit) {
    return scoreCandidateForLegacyState(candidate, state, opening);
  }

  const issueFit = computeMessageFit(state, candidate.definedIssueUsage || defaultMessageMix(), candidate);
  const geographyBonus = primaryGeographyBonus(candidate, state, opening);
  const familiarityBonus = primaryOpeningFamiliarityBonus(candidate, state, opening);
  const spotlightBonus = primaryOpeningSpotlightBonus(candidate, state, opening);
  const stateSpecificBonus = primaryOpeningStateSpecificBonus(candidate, state, opening);
  const openingRandom = opening ? randomBetween(-0.05, 0.05) : 0;
  const electabilityBonus = (PRIMARY_CANDIDATE_AFFINITIES[resolvePrimaryCandidateKey(candidate)]?.core?.electabilityFocus || 0) * (getPrimaryStateProfile(state.abbr)?.core?.electabilityFocus || 0) * 0.28;

  return 1.68 + traitFit * 1.58 + issueFit * 0.46 + geographyBonus + familiarityBonus + spotlightBonus + stateSpecificBonus + electabilityBonus + openingRandom;
}

function scoreCandidateForLegacyState(candidate, state, opening = false) {
  const issueFit = computeMessageFit(state, candidate.definedIssueUsage || defaultMessageMix(), candidate);
  const regionFit = computeRegionFit(candidate, state);
  const resonanceFit =
    (state.traits.urban / 100) * (candidate.resonance.urban || 0) +
    (state.traits.family / 100) * (candidate.resonance.family || 0) +
    (state.traits.diverse / 100) * (candidate.resonance.diverse || 0) +
    (state.traits.union / 100) * (candidate.resonance.working || 0) +
    (state.traits.coastal / 100) * (candidate.resonance.celebrity || 0);
  const openingRandom = opening ? randomBetween(-0.18, 0.18) : 0;

  let score =
    1.55 +
    issueFit * 0.9 +
    regionFit * 0.6 +
    resonanceFit * 1.25 +
    (candidate.stats.charisma - 5) * 0.05 +
    (candidate.stats.authenticity - 5) * 0.04 +
    openingRandom;

  if (candidate.homeState === state.abbr) {
    score += candidate.id === "player" ? 1.7 : 2.05;
  } else if (BORDERS[candidate.homeState]?.includes(state.abbr)) {
    score += candidate.id === "player" ? 0.26 : 0.2;
  } else if (getRegionForState(candidate.homeState) === state.region) {
    score += candidate.id === "player" ? 0.18 : 0.14;
  }

  return score;
}

function primaryGeographyBonus(candidate, state, opening = false) {
  if (candidate.homeState === state.abbr) {
    return 1.45;
  }
  if (BORDERS[candidate.homeState]?.includes(state.abbr)) {
    return opening ? 0.38 : 0.24;
  }
  if (getRegionForState(candidate.homeState) === state.region) {
    return opening ? 0.26 : 0.12;
  }
  return 0;
}

function getPrimarySubregionsForState(abbr) {
  return Object.entries(PRIMARY_OPENING_SUBREGIONS)
    .filter(([, states]) => states.includes(abbr))
    .map(([label]) => label);
}

function primaryOpeningFamiliarityBonus(candidate, state, opening = false) {
  if (!opening) {
    return 0;
  }
  const bonusMap = PRIMARY_OPENING_SUBREGION_BONUSES[resolvePrimaryCandidateKey(candidate)];
  if (!bonusMap) {
    return 0;
  }
  return getPrimarySubregionsForState(state.abbr).reduce(
    (best, label) => Math.max(best, bonusMap[label] || 0),
    0
  );
}

function primaryOpeningSpotlightBonus(candidate, state, opening = false) {
  if (!opening) {
    return 0;
  }
  const spotlight = PRIMARY_EARLY_SPOTLIGHT_STATES[state.abbr] || 0;
  if (!spotlight) {
    return 0;
  }
  const affinity = getPrimaryCandidateAffinity(candidate);
  if (!affinity) {
    return 0;
  }
  const readiness =
    (affinity.core?.electabilityFocus || 0) * 0.4 +
    (affinity.core?.mediaDriven || 0) * 0.2 +
    (affinity.secondary?.grassrootsPower || 0) * 0.3 +
    (affinity.secondary?.volatility || 0) * 0.1;
  return readiness * spotlight;
}

function primaryOpeningStateSpecificBonus(candidate, state, opening = false) {
  if (!opening) {
    return 0;
  }
  const candidateKey = resolvePrimaryCandidateKey(candidate);
  if (state.abbr === "VT" && candidateKey === "camila") {
    return 0.46;
  }
  if (state.abbr === "NJ" && candidateKey === "jim") {
    return 0.38;
  }
  return 0;
}

function primaryOpeningStateSpecificEnthusiasmBonus(candidate, state) {
  const candidateKey = resolvePrimaryCandidateKey(candidate);
  if (state.abbr === "VT" && candidateKey === "camila") {
    return 6;
  }
  if (state.abbr === "NJ" && candidateKey === "jim") {
    return 4;
  }
  return 0;
}

function enforceHomeStateEdge(state, candidates) {
  const homeCandidate = candidates.find((candidate) => candidate.homeState === state.abbr);
  if (!homeCandidate) {
    return;
  }

  const ranking = sortSupportEntries(state.currentSupport);
  const leader = ranking[0];
  if (leader[0] === homeCandidate.id) {
    const floor = openingHomeStateSupportFloor(state);
    if (leader[1] < floor) {
      positiveShift(state, homeCandidate.id, floor - leader[1]);
    }
    return;
  }

  const homeSupport = state.currentSupport[homeCandidate.id];
  const floor = openingHomeStateSupportFloor(state);
  const needed = Math.max(floor - homeSupport, leader[1] - homeSupport + openingHomeStateLeadMargin(state));
  positiveShift(state, homeCandidate.id, needed);
}

function openingHomeStateSupportFloor(state) {
  return state.abbr === "TX" ? 24.5 : 22;
}

function openingHomeStateLeadMargin(state) {
  return state.abbr === "TX" ? 2.4 : 1.6;
}

function computeRegionFit(candidate, state) {
  let fit = 0;
  if (candidate.regionIdentity === state.region) {
    fit += 0.18;
  }
  if (candidate.regionIdentity === "Northeast") {
    fit += state.traits.urban / 100 * 0.09 + state.traits.coastal / 100 * 0.08 - state.traits.rural / 100 * 0.05;
  }
  if (candidate.regionIdentity === "West") {
    fit += state.issues.environment / 100 * 0.09 + state.traits.coastal / 100 * 0.08 + state.traits.diverse / 100 * 0.05;
  }
  if (candidate.regionIdentity === "Midwest") {
    fit += state.traits.midwestern / 100 * 0.11 + state.traits.union / 100 * 0.09 + state.traits.rural / 100 * 0.03;
  }
  if (candidate.regionIdentity === "Southwest") {
    fit += state.issues.immigration / 100 * 0.09 + state.issues.economy / 100 * 0.05 + state.traits.family / 100 * 0.05;
  }
  return fit;
}

function defaultMessageMix(candidate = null) {
  const referenceCandidate = candidate || getPlayerCandidate?.();
  if (referenceCandidate?.issueCredibility) {
    const mix = Object.fromEntries(ISSUE_KEYS.map((issue) => [
      issue,
      Math.max(4, Math.round((referenceCandidate.issueCredibility[issue] || 0.2) * 100)),
    ]));
    return normalizeMix(mix);
  }
  return {
    economy: 25,
    healthcare: 10,
    immigration: 20,
    crime: 10,
    environment: 10,
    values: 10,
    corruption: 5,
    unity: 10,
  };
}

function normalizeMix(mix) {
  const total = ISSUE_KEYS.reduce((sum, issue) => sum + mix[issue], 0);
  if (!total) {
    ISSUE_KEYS.forEach((issue) => {
      mix[issue] = issue === "economy" ? 100 : 0;
    });
    return mix;
  }
  ISSUE_KEYS.forEach((issue) => {
    mix[issue] = Math.max(0, Math.round((mix[issue] / total) * 100));
  });
  let diff = 100 - ISSUE_KEYS.reduce((sum, issue) => sum + mix[issue], 0);
  const ordered = ISSUE_KEYS.slice().sort((a, b) => mix[b] - mix[a]);
  let index = 0;
  while (diff !== 0 && index < 500) {
    const issue = ordered[index % ordered.length];
    if (diff > 0) {
      mix[issue] += 1;
      diff -= 1;
    } else if (mix[issue] > 0) {
      mix[issue] -= 1;
      diff += 1;
    }
    index += 1;
  }
  return mix;
}

function defaultBrandDriftPlan() {
  return Object.fromEntries(ISSUE_KEYS.map((issue) => [issue, "hold"]));
}

function resetBrandDriftState(state, { anchorToCurrent = true } = {}) {
  state.ui.brandDriftPlan = defaultBrandDriftPlan();
  state.ui.mixStatus = "";
  if (anchorToCurrent || !state.ui.brandAnchorMix) {
    state.ui.brandAnchorMix = { ...state.messageMix };
  }
}

function isBrandLocked(state = gameState) {
  return Boolean(state?.ui?.roundRecap) || Number(state?.turnInRound || 1) > 1;
}

function distributeBrandDiff(mix, targets, diff) {
  let remaining = diff;
  let safety = 0;
  while (remaining !== 0 && safety < 500) {
    let moved = false;
    targets.forEach((issue) => {
      if (remaining > 0 && mix[issue] < 100) {
        mix[issue] += 1;
        remaining -= 1;
        moved = true;
      } else if (remaining < 0 && mix[issue] > 0) {
        mix[issue] -= 1;
        remaining += 1;
        moved = true;
      }
    });
    if (!moved) {
      break;
    }
    safety += 1;
  }
  return remaining;
}

function computeBrandMixFromPlan(anchorMix, driftPlan) {
  const mix = { ...anchorMix };
  ISSUE_KEYS.forEach((issue) => {
    const action = driftPlan?.[issue] || "hold";
    if (action === "increase") {
      mix[issue] += MIX_STEP;
    } else if (action === "decrease") {
      mix[issue] -= MIX_STEP;
    }
    mix[issue] = clamp(mix[issue], 0, 100);
  });

  let remaining = 100 - computeMessageMixTotal(mix);
  const holdIssues = ISSUE_KEYS.filter((issue) => (driftPlan?.[issue] || "hold") === "hold");
  const increaseIssues = ISSUE_KEYS.filter((issue) => driftPlan?.[issue] === "increase");
  const decreaseIssues = ISSUE_KEYS.filter((issue) => driftPlan?.[issue] === "decrease");

  if (remaining !== 0) {
    const holdTargets = remaining > 0
      ? holdIssues.slice().sort((a, b) => mix[a] - mix[b] || anchorMix[a] - anchorMix[b])
      : holdIssues.slice().sort((a, b) => mix[b] - mix[a] || anchorMix[b] - anchorMix[a]);
    remaining = distributeBrandDiff(mix, holdTargets, remaining);
  }
  if (remaining !== 0) {
    const fallbackTargets = remaining > 0
      ? [...decreaseIssues, ...increaseIssues].sort((a, b) => mix[a] - mix[b])
      : [...increaseIssues, ...decreaseIssues].sort((a, b) => mix[b] - mix[a]);
    remaining = distributeBrandDiff(mix, fallbackTargets, remaining);
  }
  if (remaining !== 0) {
    const allTargets = remaining > 0
      ? ISSUE_KEYS.slice().sort((a, b) => mix[a] - mix[b])
      : ISSUE_KEYS.slice().sort((a, b) => mix[b] - mix[a]);
    distributeBrandDiff(mix, allTargets, remaining);
  }

  return normalizeMix(mix);
}

function brandFitLabel(fit) {
  if (fit >= 0.78) {
    return "Strong Fit";
  }
  if (fit >= 0.58) {
    return "Usable Fit";
  }
  return "Weak Fit";
}

function hydrateGameState(state) {
  state.version = GAME_VERSION;
  state.priorities ||= {};
  state.ui ||= {};
  state.candidates ||= [];
  state.candidates.forEach((candidate) => {
    candidate.delegatesWon ??= 0;
  });
  state.states ||= [];
  state.states.forEach((item) => {
    item.primaryAwarded ??= false;
    item.primaryWinnerId ||= "";
    item.finalResult ??= null;
    item.adPressure ||= {};
  });
  state.ui.selectedState ||= getCurrentRoundStateAbbrs(state)[0] || STATE_DATA[0][0];
  state.ui.tutorialDismissed ??= false;
  state.ui.pollScope ||= "region";
  state.ui.roundRecap ||= null;
  state.ui.activeItineraryId ||= "";
  state.ui.plannedAds ||= [];
  state.ui.activeRailTab ||= "news";
  state.ui.managerTopic ||= "best-opportunity";
  state.ui.plannedAds = state.ui.plannedAds.map((ad) => ({
    units: 1,
    issue: selectAutoAdIssue({
      scope: ad.scope,
      state: getStateByAbbr(ad.state),
      type: ad.type,
      targetStates: getAdTargetStates(ad, state),
      mix: state.messageMix || defaultMessageMix(),
    }),
    ...ad,
  }));
  state.ui.managerMemory ||= {};
  state.ui.previousVisiblePolls ||= {};
  state.ui.liveStandingsOpen ??= false;
  state.ui.mixStatus ||= "";
  state.ui.brandDriftPlan ||= defaultBrandDriftPlan();
  state.ui.brandAnchorMix ||= null;
  state.ui.roundExpectations ||= null;
  state.ui.momentumSummary ||= null;
  state.ui.roundFundraisingLedger ||= {};
  state.messageMix ||= defaultMessageMix(getPlayerCandidate?.());
  normalizeMix(state.messageMix);
  if (!state.ui.brandAnchorMix) {
    state.ui.brandAnchorMix = { ...state.messageMix };
  }
  state.dayPlan ||= { rallyCount: 0, rallies: [], fundraising: 20, endorsements: 20, stateEffort: {} };
  state.dayPlan.rallyCount = 0;
  state.dayPlan.rallies ||= [];
  state.dayPlan.fundraising ??= 20;
  state.dayPlan.endorsements ??= 20;
  state.dayPlan.stateEffort ||= {};
  state.eventLog ||= [];
  state.opponentActivity ||= [];
  state.activeBuzz ||= null;
  state.electionNight ||= null;

  ensurePriorityMaps(state);
  ensurePollSnapshots(state);
  ensureRoundExpectations(state);
  ensureRoundFundraisingLedger(state);
  const seededStateEffortTotal = getCurrentRoundStateAbbrs(state)
    .reduce((sum, abbr) => sum + clamp(Number(state.dayPlan.stateEffort?.[abbr] || 0), 0, 100), 0);
  normalizeStateEffortPlan(state, { preserveDraft: seededStateEffortTotal > 0 });
  normalizeEffortInputs(state);
  state.ui.itineraryOptions = buildItineraries(state);
  ensureItinerarySelection(state);
  return state;
}

function ensureRoundExpectations(state) {
  const expectedStates = getCurrentRoundStateAbbrs(state);
  const snapshot = state.ui.roundExpectations;
  const mismatch =
    !snapshot ||
    snapshot.roundIndex !== state.roundIndex ||
    !Array.isArray(snapshot.stateAbbrs) ||
    snapshot.stateAbbrs.length !== expectedStates.length ||
    snapshot.stateAbbrs.some((abbr, index) => abbr !== expectedStates[index]);
  if (mismatch) {
    state.ui.roundExpectations = captureRoundExpectations(state);
  }
}

function ensurePriorityMaps(state) {
  Object.keys(REGIONS).forEach((regionName) => {
    state.priorities[regionName] ||= {};
    REGIONS[regionName].states.forEach((abbr) => {
      state.priorities[regionName][abbr] ||= "low";
    });
  });
}

function ensureRoundFundraisingLedger(state) {
  state.ui.roundFundraisingLedger ||= {};
  state.candidates.forEach((candidate) => {
    state.ui.roundFundraisingLedger[candidate.id] ||= {
      cash: 0,
      narrative: 0,
      effort: 0,
      days: 0,
    };
  });
}

function showScreen(name) {
  elements["setup-screen"].classList.toggle("hidden", name !== "setup");
  elements["game-screen"].classList.toggle("hidden", name !== "game");
  elements["election-screen"].classList.toggle("hidden", name !== "election");
}

function renderGame() {
  if (!gameState) {
    return;
  }
  hydrateGameState(gameState);
  showScreen("game");
  maybeShowSaveButton();
  renderBroadcastBar();
  renderTutorialPanel();
  renderRoundRecap();
  renderCandidateStrip();
  renderPollingDesk();
  renderMessageMix();
  updateEffortPlan();
  populateAdControls();
  renderAdPreview();
  renderLiveStandings();
  renderRightRail();
  renderCampaignManager();
  renderStateInsights();
  renderRecentResults();
}

function renderRightRail() {
  renderRailTabs();
  renderNewsRail();
  populateRailSelectors();
  renderEventLog();
  renderMapRail();
}

function renderRailTabs() {
  const activeTab = gameState.ui.activeRailTab || "news";
  document.querySelectorAll("[data-rail-tab]").forEach((button) => {
    const isActive = button.dataset.railTab === activeTab;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
  });
  document.querySelectorAll("[data-rail-panel]").forEach((panel) => {
    const isActive = panel.dataset.railPanel === activeTab;
    panel.classList.toggle("hidden", !isActive);
    panel.classList.toggle("active", isActive);
  });
}

function renderNewsRail() {
  const activeBuzz = gameState.activeBuzz;
  const badge = elements["news-alert-badge"];
  const spotlight = elements["news-spotlight"];
  const impactPanel = elements["news-impact-panel"];
  if (!badge || !spotlight || !impactPanel) {
    return;
  }
  const impactIssue = activeBuzz ? ISSUE_LABELS[activeBuzz.key] : ISSUE_LABELS[topIssueAcrossStates(getCurrentRoundStatesForResolution(gameState))];
  const affectedScope = activeBuzz?.scope === "national"
    ? "National"
    : activeBuzz
      ? activeBuzz.region
      : getCurrentStageLabel(gameState);

  badge.textContent = activeBuzz ? "Live Story" : "Quiet";
  badge.className = `tag ${activeBuzz ? "bad" : "neutral"}`;
  spotlight.classList.toggle("is-live", Boolean(activeBuzz));
  spotlight.innerHTML = activeBuzz
    ? `
      <div class="news-spotlight-copy">
        <h4>${activeBuzz.headline}</h4>
        <p>${activeBuzz.shift}</p>
      </div>
      <div class="news-spotlight-meta">
        <span class="detail-chip">Affects: ${impactIssue}</span>
        <span class="detail-chip">Scope: ${affectedScope}</span>
        <span class="detail-chip">Window: ${activeBuzz.roundsLeft} turn${activeBuzz.roundsLeft === 1 ? "" : "s"} left</span>
      </div>
    `
    : `
      <div class="news-spotlight-copy">
        <h4>No active shock to the board</h4>
        <p>Quiet board. The map and undecideds are doing most of the work.</p>
      </div>
    `;

  impactPanel.innerHTML = `
    <div class="rail-subsection-head">
      <strong>${activeBuzz ? "What It Changes" : "What The Board Wants"}</strong>
      <span class="hint">${affectedScope}</span>
    </div>
    <p>${activeBuzz ? activeBuzz.shift : getCurrentStageSummary(gameState)}</p>
    <div class="news-spotlight-meta">
      <span class="detail-chip">${impactIssue} is the clearest issue to check first</span>
    </div>
  `;
}

function populateRailSelectors() {
  populateManagerControls();
  populateAnalysisControls();
}

function renderMapRail() {
  if (!railMapReady) {
    prepareRailMapDocument();
  }
  renderMapLegend();
  renderMapDetail();
  updateRailMapColors();
}

function renderMapLegend() {
  if (!elements["rail-map-legend"] || !gameState) {
    return;
  }
  elements["rail-map-legend"].innerHTML = gameState.candidates.map((candidate, index) => {
    const palette = RAIL_MAP_COLORS[index % RAIL_MAP_COLORS.length];
    return `
      <div class="rail-map-legend-item">
        <span class="rail-map-swatch" style="background:${palette.dark}"></span>
        <span>${pollChartName(candidate.name)}</span>
      </div>
    `;
  }).join("");
}

function renderMapDetail() {
  if (!elements["rail-map-detail"] || !gameState) {
    return;
  }
  const state = getStateByAbbr(gameState.ui.selectedState) || getCurrentRoundStates()[0] || gameState.states[0];
  if (!state) {
    elements["rail-map-detail"].innerHTML = `<p class="hint">Click a state to inspect it.</p>`;
    return;
  }
  const ranking = sortSupportEntries(state.visiblePolls);
  const resolved = Boolean(state.primaryAwarded && state.primaryWinnerId);
  const leaderId = resolved ? state.primaryWinnerId : ranking[0]?.[0];
  const leader = getCandidateById(leaderId);
  const runnerUpId = resolved
    ? sortSupportEntries(state.finalResult?.shares || state.visiblePolls)[1]?.[0]
    : ranking[1]?.[0];
  const runnerUp = getCandidateById(runnerUpId);
  const leaderShare = resolved
    ? (state.finalResult?.shares?.[leaderId] || 0)
    : (state.visiblePolls[leaderId] || 0);
  const runnerShare = resolved
    ? (state.finalResult?.shares?.[runnerUpId] || 0)
    : (state.visiblePolls[runnerUpId] || 0);
  const margin = runnerUp ? Math.max(0, leaderShare - runnerShare) : leaderShare;
  const phase = resolved ? "Called" : mapPhaseLabel(state.abbr);
  const topIssues = sortIssues(state.issues).slice(0, 3).map(([issue]) => ISSUE_LABELS[issue]).join(", ");
  const fitLabel = brandFitLabel(computeMessageFit(state, gameState.messageMix, getPlayerCandidate()));
  const pressure = buildStatePressureSummary(state);
  elements["rail-map-detail"].innerHTML = `
    <div class="rail-subsection-head">
      <strong>${state.name}</strong>
      <span class="hint">${state.electoralVotes} ${primaryUnitWord()}</span>
    </div>
    <div class="rail-map-status">
      <span class="detail-chip">${phase}</span>
      <span class="detail-chip">${fitLabel}</span>
      <span class="detail-chip">${pressure.label}</span>
    </div>
    <p>${resolved ? "Winner" : "Leader"}: ${leader?.name || "Unknown"}${runnerUp ? ` by ${margin.toFixed(1)}` : ""}.</p>
    <p>Top issues: ${topIssues}.</p>
  `;
}

function prepareRailMapDocument() {
  const svg = elements["rail-map-canvas"]?.querySelector("svg");
  if (!svg) {
    return;
  }
  railMapReady = true;
  svg.classList.add("rail-map-svg");
  if (!svg.getAttribute("viewBox")) {
    const width = Number(svg.getAttribute("width")) || 959;
    const height = Number(svg.getAttribute("height")) || 593;
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  }
  svg.removeAttribute("width");
  svg.removeAttribute("height");
  svg.querySelectorAll(".borders, .separator1, .separator2").forEach((line) => {
    line.style.pointerEvents = "none";
  });
  svg.querySelectorAll(".state path, .state circle").forEach((shape) => {
    const abbr = extractMapStateAbbr(shape);
    if (!abbr) {
      return;
    }
    shape.dataset.stateAbbr = abbr;
    shape.classList.add("us-map-state");
    shape.style.cursor = "pointer";
    shape.style.transition = "fill 150ms ease, opacity 150ms ease";
    shape.addEventListener("click", handleRailMapShapeClick);
  });
}

function extractMapStateAbbr(shape) {
  const className = [...shape.classList].find((token) => /^[a-z]{2}$/.test(token));
  return className ? className.toUpperCase() : "";
}

function handleRailMapShapeClick(event) {
  if (!gameState) {
    return;
  }
  const abbr = event.currentTarget?.dataset?.stateAbbr;
  if (!abbr) {
    return;
  }
  syncSelectedState(abbr);
}

function updateRailMapColors() {
  if (!railMapReady || !gameState) {
    return;
  }
  const svg = elements["rail-map-canvas"]?.querySelector("svg");
  if (!svg) {
    return;
  }
  svg.querySelectorAll(".us-map-state").forEach((shape) => {
    const abbr = shape.dataset.stateAbbr;
    const state = getStateByAbbr(abbr);
    const fill = state ? railMapFillForState(state) : "rgba(255,255,255,0.08)";
    const isSelected = abbr === gameState.ui.selectedState;
    shape.style.fill = fill;
    shape.style.stroke = isSelected ? "#ffffff" : "transparent";
    shape.style.strokeWidth = isSelected ? "2.4px" : "0px";
    shape.style.filter = isSelected ? "drop-shadow(0 0 6px rgba(255,255,255,0.22))" : "none";
    shape.style.opacity = state ? "1" : "0.35";
    const title = shape.querySelector("title");
    if (title && state) {
      title.textContent = railMapTitleForState(state);
    }
  });
}

function railMapFillForState(state) {
  const resolved = Boolean(state.primaryAwarded && state.primaryWinnerId);
  const leaderId = resolved ? state.primaryWinnerId : sortSupportEntries(state.visiblePolls)[0]?.[0];
  const candidate = getCandidateById(leaderId);
  if (!candidate) {
    return "rgba(255,255,255,0.08)";
  }
  const palette = railMapPaletteForCandidate(candidate.id);
  return resolved ? palette.dark : palette.light;
}

function railMapPaletteForCandidate(candidateId) {
  const index = Math.max(0, gameState.candidates.findIndex((candidate) => candidate.id === candidateId));
  return RAIL_MAP_COLORS[index % RAIL_MAP_COLORS.length];
}

function railMapTitleForState(state) {
  const resolved = Boolean(state.primaryAwarded && state.primaryWinnerId);
  const ranking = sortSupportEntries(resolved ? (state.finalResult?.shares || state.visiblePolls) : state.visiblePolls);
  const leader = getCandidateById(resolved ? state.primaryWinnerId : ranking[0]?.[0]);
  const runnerUp = getCandidateById(ranking[1]?.[0]);
  const margin = ranking[1] ? Math.max(0, ranking[0][1] - ranking[1][1]) : ranking[0]?.[1] || 0;
  if (!leader) {
    return state.name;
  }
  return resolved
    ? `${state.name}: called for ${leader.name}${runnerUp ? ` by ${margin.toFixed(1)}` : ""}`
    : `${state.name}: ${leader.name} leads${runnerUp ? ` by ${margin.toFixed(1)}` : ""}`;
}

function mapPhaseLabel(stateAbbr) {
  const phase = planningStatePhase(stateAbbr);
  if (phase === "current") {
    return "Voting Now";
  }
  if (phase === "upcoming") {
    return "On Deck";
  }
  return "Elsewhere";
}

function populateManagerControls() {
  if (!elements["manager-topic"] || !elements["manager-state"]) {
    return;
  }
  const selectedTopic = gameState.ui.managerTopic || "best-opportunity";
  elements["manager-topic"].innerHTML = MANAGER_TOPICS.map((topic) => `
    <option value="${topic.id}" ${topic.id === selectedTopic ? "selected" : ""}>${topic.label}</option>
  `).join("");
  elements["manager-state"].innerHTML = buildStateSelectOptions(gameState.ui.selectedState);
  elements["manager-state"].value = gameState.ui.selectedState;
}

function populateAnalysisControls() {
  if (!elements["analysis-state"]) {
    return;
  }
  elements["analysis-state"].innerHTML = buildStateSelectOptions(gameState.ui.selectedState);
  elements["analysis-state"].value = gameState.ui.selectedState;
}

function buildStateSelectOptions(selectedAbbr = "") {
  return gameState.states
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((state) => `<option value="${state.abbr}" ${state.abbr === selectedAbbr ? "selected" : ""}>${state.name}</option>`)
    .join("");
}

function handleRailTabClick(event) {
  if (!gameState) {
    return;
  }
  gameState.ui.activeRailTab = event.currentTarget.dataset.railTab;
  renderRailTabs();
  if (gameState.ui.activeRailTab === "map") {
    renderMapRail();
  }
}

function renderBroadcastBar() {
  const stageLabel = getCurrentStageLabel();
  const stageDates = getCurrentStageDates();
  elements["headline-region"].textContent = isPrimaryMode()
    ? `${stageLabel} Primary Window`
    : stageLabel === "Final National Push"
      ? "Final National Push"
      : `${stageLabel} Strategy Desk`;
  elements["turn-indicator"].textContent = isPrimaryMode()
    ? `${gameState.turnInRound} / ${getCurrentPrimaryWindowDays(gameState)}`
    : `${gameState.turnInRound} / ${TURNS_PER_REGION}`;
  elements["effort-indicator"].textContent = `${computeGeneralCampaignEffort(gameState)}`;
  elements["projected-value-label"].textContent = isPrimaryMode() ? "Projected Delegates" : "Projected EV";
  elements["ev-indicator"].textContent = `${computeProjectedEv(gameState.playerId)}`;
  elements["planning-region-title"].textContent = isPrimaryMode()
    ? `${stageLabel} Plan${stageDates ? ` (${stageDates})` : ""}`
    : stageLabel === "Final National Push"
      ? "National Push Planning Board"
      : `${stageLabel} Day Planner`;
}

function renderTutorialPanel() {
  elements["tutorial-panel"].classList.toggle(
    "hidden",
    gameState.ui.tutorialDismissed || !(gameState.roundIndex === 0 && gameState.turnInRound === 1)
  );
}

function renderRoundRecap() {
  const recap = gameState.ui.roundRecap;
  const wasVisible = !elements["round-recap-panel"].classList.contains("hidden");
  elements["round-recap-panel"].classList.toggle("hidden", !recap);
  if (!recap) {
    elements["end-turn-button"].textContent = "Run The Day";
    return;
  }
  elements["recap-title"].textContent = recap.title;
  const resultsTable = recap.awards?.length
    ? `
      <article class="note recap-results-block">
        <p class="eyebrow">Final Results</p>
        <div class="table-shell recap-table-shell">
          ${renderRecapResultsTable(recap.awards)}
        </div>
      </article>
    `
    : "";
  elements["recap-body"].innerHTML = `${resultsTable}${recap.cards.map((card) => `
    <article class="note">
      <p class="eyebrow">${card.heading}</p>
      <p>${card.body}</p>
    </article>
  `).join("")}`;
  elements["continue-region-button"].textContent = recap.nextAction === "election"
    ? "Continue To Election Night"
    : isPrimaryMode() ? "Continue To Next Window" : "Continue To Next Round";
  elements["end-turn-button"].disabled = false;
  elements["end-turn-button"].textContent = recap.nextAction === "election"
    ? "Continue Above To Election Night"
    : isPrimaryMode() ? "Continue Above To Next Window" : "Continue Above To Next Round";
  if (!wasVisible) {
    elements["round-recap-panel"].scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function renderRecapResultsTable(awards) {
  const candidateHeaders = gameState.candidates.map((candidate) => `<th>${pollChartName(candidate.name)}</th>`).join("");
  const rows = awards.map((award) => {
    const targetState = award.state;
    const shares = targetState.finalResult?.shares || targetState.visiblePolls;
    const ranking = sortSupportEntries(shares);
    const winnerId = ranking[0]?.[0] || award.winner?.id || "";
    const candidateCells = gameState.candidates.map((candidate) => `
      <td class="poll-value-cell ${candidate.id === winnerId ? "poll-value-leading" : ""}">
        <strong>${(shares[candidate.id] || 0).toFixed(1)}%</strong>
      </td>
    `).join("");
    return `
      <tr>
        <td class="poll-state-cell">
          <strong>${targetState.name}</strong>
          <div class="result-meta">${targetState.electoralVotes} ${primaryUnitLabel().toUpperCase()}</div>
          <div class="poll-state-pressure pressure-stable">Delegates awarded: ${award.winner.name} +${targetState.electoralVotes}</div>
        </td>
        <td class="poll-moe-cell">Final</td>
        ${candidateCells}
        <td class="poll-value-cell"><strong>0.0%</strong></td>
      </tr>
    `;
  }).join("");

  return `
    <table class="polling-table recap-results-table">
      <thead>
        <tr>
          <th>State</th>
          <th>Result</th>
          ${candidateHeaders}
          <th>Undecided</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderCandidateStrip() {
  elements["candidate-strip"].innerHTML = gameState.candidates.map((candidate) => `
    <article class="card candidate-card ${candidate.id === gameState.playerId ? "player-card" : ""}">
      <div class="candidate-card-top">
        ${renderPortrait(candidate)}
        <div class="candidate-card-main">
          <div class="candidate-card-copy">
            <h3>${candidate.name}</h3>
            <p class="candidate-card-summary">${candidate.archetype}</p>
            <p class="candidate-card-location">${candidate.hometown}, ${getStateName(candidate.homeState)}</p>
          </div>
          ${isPrimaryMode() ? `<div class="metric-pill candidate-delegate-pill"><span>Delegates</span><strong>${candidate.delegatesWon || 0}</strong></div>` : ""}
        </div>
      </div>
      <div class="candidate-metrics">
        <div class="metric-pill"><span>Funds</span><strong>$${Math.round(candidate.money)}</strong></div>
        <div class="metric-pill"><span>Momentum</span><strong>${Math.round(candidate.momentum)}</strong></div>
        <div class="metric-pill"><span>Fatigue</span><strong>${Math.round(candidate.fatigue)}<small>${fatigueBand(candidate.fatigue)}</small></strong></div>
        <div class="metric-pill"><span>Favorability</span><strong>${Math.round(candidate.favorability)}</strong></div>
      </div>
    </article>
  `).join("");
}

function renderLiveStandings() {
  const projection = buildLiveStandings(gameState);
  const projectedLeader = projection.scoreboard[0];
  const undecidedText = projection.nationalUndecided > 0.05
    ? `${projection.nationalUndecided.toFixed(1)}% of the country is still sitting in undecided space.`
    : "The current poll snapshots leave essentially no undecided vote on the board.";
  const averageMoE = averagePollingError(gameState.states);
  const summaryLead = isPrimaryMode()
    ? `If every current poll snapshot held through this primary calendar, ${projectedLeader.candidate.name} would lead the map with ${projectedLeader.electoralVotes} delegates.`
    : `If every current poll snapshot held through Election Day, ${projectedLeader.candidate.name} would lead the map with ${projectedLeader.electoralVotes} electoral votes.`;
  const unitLabel = primaryUnitLabel();
  const explainer = isPrimaryMode()
    ? "Each state below is being called from the current visible polls as a primary map snapshot using party-specific delegate totals."
    : "Each state below is being called from the current visible polls, as if those numbers were the final vote. Every card also shows that state's margin of error.";
  elements["live-standings-panel"].classList.toggle("hidden", !gameState.ui.liveStandingsOpen);
  elements["live-standings-toggle"].textContent = gameState.ui.liveStandingsOpen ? "Hide" : "Open";
  elements["live-standings-summary"].innerHTML = `
    <div class="action-preview">
      ${summaryLead} ${undecidedText} Average poll margin of error: +/-${averageMoE.toFixed(1)}.
    </div>
    <div class="projection-scoreboard">
      ${projection.scoreboard.map((entry) => `
        <article class="projection-card ${entry.candidate.id === gameState.playerId ? "player-card" : ""}">
          <div class="projection-card-top">
            <strong>${entry.candidate.name}</strong>
            <span class="tag ${entry.isWinning ? "good" : "neutral"}">${entry.electoralVotes} ${unitLabel}</span>
          </div>
          <p>${isPrimaryMode() ? `Awarded so far: ${entry.candidate.delegatesWon || 0} delegates. ` : ""}Projected national share: ${entry.nationalShare.toFixed(1)}%</p>
        </article>
      `).join("")}
    </div>
  `;
  elements["live-standings-grid"].innerHTML = `
    <article class="projection-undecided-card">
      <strong>State-By-State Projection</strong>
      <p>${explainer}</p>
    </article>
    <div class="projection-state-list">
      ${projection.states.map((item) => `
        <article class="projection-state-card">
          <div class="projection-state-top">
            <strong>${item.name}</strong>
            <span class="tag neutral">${item.electoralVotes} ${unitLabel}</span>
          </div>
          <p>${item.leader.name} leads ${item.runnerUp ? `${item.runnerUp.name} by ${item.margin.toFixed(1)}` : "the field"} with ${item.leaderShare.toFixed(1)}%. Poll margin of error: +/-${item.pollingError.toFixed(1)}.</p>
        </article>
      `).join("")}
    </div>
  `;
}

function toggleLiveStandings() {
  if (!gameState) {
    return;
  }
  gameState.ui.liveStandingsOpen = !gameState.ui.liveStandingsOpen;
  renderLiveStandings();
}

function renderPollingDesk() {
  const regionName = getCurrentRegionName();
  const stageLabel = getCurrentStageLabel();
  const stageDates = getCurrentStageDates();
  const states = getVisiblePollStates();
  elements["poll-scope"].value = gameState.ui.pollScope;
  elements["polling-region-title"].textContent = isPrimaryMode()
    ? `State Desk${stageDates ? ` (${stageDates})` : ""}`
    : regionName === "Final National Push"
      ? "National State Desk"
      : `${regionName} State Desk`;
  const totalEv = states.reduce((sum, state) => sum + state.electoralVotes, 0);
  const averageMoE = averagePollingError(states);
  const scopeLabel = gameState.ui.pollScope === "all"
    ? "states on the full map"
    : gameState.ui.pollScope === "planning"
      ? "states across the live and on-deck windows"
      : gameState.ui.roundRecap && isPrimaryMode()
        ? "settled states in this window"
      : "states voting in this window";
  const buzzCopy = gameState.activeBuzz
    ? ` Active story: ${gameState.activeBuzz.shift}`
    : isPrimaryMode()
      ? ` ${getCurrentStageSummary(gameState)}`
      : regionName === "Final National Push"
        ? " Full-map polling is on the board."
        : ` ${REGIONS[regionName].traitText}`;
  elements["polling-summary"].textContent = isPrimaryMode()
    ? `${states.length} ${scopeLabel} | ${totalEv} delegates in view | Average Margin of Error +/-${averageMoE.toFixed(1)} |${buzzCopy}`
    : `${states.length} states in view | ${totalEv} electoral votes | Average Margin of Error +/-${averageMoE.toFixed(1)} |${buzzCopy}`;
  elements["state-poll-table"].innerHTML = renderPollingTable(states);
}

function renderPollingTable(states) {
  const candidateHeaders = gameState.candidates.map((candidate) => `<th>${pollChartName(candidate.name)}</th>`).join("");
  const buildRow = (state) => {
    const snapshotEntries = sortSupportEntries(state.visiblePolls);
    const leader = snapshotEntries[0];
    const selected = gameState.ui.selectedState === state.abbr ? "is-selected" : "";
    const topIssues = sortIssues(state.issues).slice(0, 3).map(([issue]) => ISSUE_LABELS[issue]).join(", ");
    const fit = computeMessageFit(state, gameState.messageMix, getPlayerCandidate());
    const fitLabel = brandFitLabel(fit);
    const pressure = buildStatePressureSummary(state);
    const phase = planningStatePhase(state.abbr);
    const isPlanningState = phase === "current" || phase === "upcoming";
    const isCurrentWindowState = phase === "current";
    const effortShare = isCurrentWindowState ? getStateEffortValue(gameState, state.abbr) : 0;
    const candidateCells = gameState.candidates.map((candidate) => {
      const isLeader = candidate.id === leader[0];
      const delta = pollDeltaFor(state.abbr, candidate.id);
      return `
        <td class="poll-value-cell ${isLeader ? "poll-value-leading" : ""}">
          <strong>${(state.visiblePolls[candidate.id] || 0).toFixed(1)}%</strong>
          ${renderPollDelta(delta)}
        </td>
      `;
    }).join("");
    return `
      <tr class="is-clickable ${selected}" data-state-row="${state.abbr}">
        <td class="poll-state-cell">
          <div class="poll-state-head">
            <div class="poll-state-title">
              <strong>${state.name}</strong>
              <div class="result-meta">${state.electoralVotes} ${isPrimaryMode() ? "Delegates" : "Electoral Votes"}</div>
            </div>
            ${isCurrentWindowState ? `
              <label class="poll-effort-control poll-effort-inline">
                <span>Effort</span>
                <input
                  class="text-input"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  inputmode="numeric"
                  value="${effortShare}"
                  data-state-effort="${state.abbr}"
                />
              </label>
            ` : ""}
          </div>
          ${isCurrentWindowState ? `
            <div class="poll-state-allocation">Campaigning ${effortShare}</div>
          ` : ""}
          ${isPlanningState && !isCurrentWindowState ? `
            <div class="poll-state-controls">
              <div class="poll-state-upcoming-tag">On Deck</div>
            </div>
          ` : ""}
          <div class="poll-state-pressure ${pressure.className}">${pressure.label}: ${pressure.shortText}</div>
          <div class="poll-state-issues">${fitLabel} | ${topIssues}</div>
        </td>
        <td class="poll-moe-cell">+/-${state.pollingError.toFixed(1)}</td>
        ${candidateCells}
        <td class="poll-value-cell"><strong>${state.undecided.toFixed(1)}%</strong>${renderPollDelta(pollDeltaFor(state.abbr, "undecided"))}</td>
      </tr>
    `;
  };

  let rows = "";
  if (isPrimaryMode() && gameState.ui.pollScope === "planning") {
    const currentRows = states.filter((state) => planningStatePhase(state.abbr) === "current");
    const onDeckRows = states.filter((state) => planningStatePhase(state.abbr) === "upcoming");
    if (currentRows.length) {
      rows += `<tr class="poll-section-row"><td colspan="${gameState.candidates.length + 3}">Current Window</td></tr>`;
      rows += currentRows.map(buildRow).join("");
    }
    if (onDeckRows.length) {
      rows += `<tr class="poll-section-row"><td colspan="${gameState.candidates.length + 3}">On Deck</td></tr>`;
      rows += onDeckRows.map(buildRow).join("");
    }
  } else {
    rows = states.map(buildRow).join("");
  }

  return `
    <table class="polling-table">
      <thead>
        <tr>
          <th>State</th>
          <th>Margin of Error</th>
          ${candidateHeaders}
          <th>Undecided</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderPriorityMap() {
  const states = getCampaignPlanningStates();
  elements["priority-map"].innerHTML = states.map((state) => `
    <label class="priority-row">
      <div>
        <strong>${state.name}</strong>
        <div class="hint">${state.electoralVotes} ${primaryUnitLabel()} | ${planningStatePhase(state.abbr) === "current" ? "Voting now" : "On deck"} | Current leader: ${getCandidateById(sortSupportEntries(state.visiblePolls)[0][0]).name}</div>
      </div>
      <select class="text-input compact-select" data-priority-state="${state.abbr}">
        ${PRIORITY_LEVELS.map((level) => `<option value="${level}" ${gameState.priorities[getPriorityBucketName(state)][state.abbr] === level ? "selected" : ""}>${capitalize(level)}</option>`).join("")}
      </select>
    </label>
  `).join("");
}

function renderOnDeckStatePanel() {
  if (!elements["on-deck-state-panel"] || !elements["on-deck-state-title"] || !elements["on-deck-state-phase"]) {
    return;
  }
  const upcomingStates = getUpcomingRoundStateAbbrs().map(getStateByAbbr).filter(Boolean);
  if (!upcomingStates.length) {
    elements["on-deck-state-title"].textContent = "No Upcoming State";
    elements["on-deck-state-phase"].textContent = "Live Window";
    elements["on-deck-state-panel"].innerHTML = `
      <div class="insight-card">
        <strong>Everything currently in the planner is already live.</strong>
        <p class="hint">Once the next window appears, this panel will show the best early read for on-deck states.</p>
      </div>
    `;
    return;
  }

  const player = getPlayerCandidate();
  const upcoming = upcomingStates
    .map((state) => {
      const ranking = sortSupportEntries(state.visiblePolls);
      const leader = ranking[0];
      const playerPoll = state.visiblePolls[player.id] || 0;
      const gap = round1((leader[0] === player.id ? playerPoll - (ranking[1]?.[1] || 0) : leader[1] - playerPoll));
      const fit = computeMessageFit(state, gameState.messageMix, player);
      const priority = gameState.priorities[getPriorityBucketName(state)]?.[state.abbr] || "low";
      return { state, leader, gap, fit, priority };
    })
    .sort((a, b) => {
      const priorityBias = PRIORITY_LEVELS.indexOf(a.priority) - PRIORITY_LEVELS.indexOf(b.priority);
      if (priorityBias !== 0) {
        return priorityBias;
      }
      return a.gap - b.gap || b.state.undecided - a.state.undecided;
    })[0];

  const targetState = upcoming.state;
  const topIssues = sortIssues(targetState.issues).slice(0, 3).map(([issue]) => issue);
  const currentMixTop = topIssuesFromMix(gameState.messageMix, 3);
  const overlap = currentMixTop.filter((issue) => topIssues.includes(issue));
  const leadName = getCandidateById(upcoming.leader[0])?.name || "Unknown";
  const fitLabel = upcoming.fit >= 1.1 ? "Strong fit" : upcoming.fit >= 0.92 ? "Usable fit" : "Weak fit";
  const pressure = buildStatePressureSummary(targetState);
  const messageRead = overlap.length >= 2
    ? `Your current brand already overlaps well here through ${overlap.map((issue) => ISSUE_LABELS[issue]).join(" and ")}.`
    : overlap.length === 1
      ? `You have some carryover here through ${ISSUE_LABELS[overlap[0]]}, but ${targetState.name} wants more of ${ISSUE_LABELS[topIssues[0]]} and ${ISSUE_LABELS[topIssues[1]]}.`
      : `${targetState.name} is pulling more toward ${ISSUE_LABELS[topIssues[0]]}, ${ISSUE_LABELS[topIssues[1]]}, and ${ISSUE_LABELS[topIssues[2]]} than your current brand does.`;
  const adRead = overlap.length >= 2
    ? `An early local ad can mostly stay on your current brand, with extra emphasis on ${ISSUE_LABELS[topIssues[0]]}.`
    : `If you buy early local ads here, do not just clone your current lane. Tilt the ad toward ${ISSUE_LABELS[topIssues[0]]}${topIssues[1] ? ` and ${ISSUE_LABELS[topIssues[1]]}` : ""}.`;
  const standingRead = upcoming.leader[0] === player.id
    ? `You are narrowly ahead by about ${upcoming.gap.toFixed(1)}.`
    : `${leadName} leads by about ${upcoming.gap.toFixed(1)} over you.`;

  elements["on-deck-state-title"].textContent = `${targetState.name} Brief`;
  elements["on-deck-state-phase"].textContent = "On Deck";
  elements["on-deck-state-panel"].innerHTML = `
    <div class="insight-card">
      <p class="eyebrow">Polling Read</p>
      <p><strong>${targetState.name}</strong><br />${targetState.electoralVotes} ${primaryUnitLabel()} | ${standingRead} ${targetState.undecided.toFixed(1)}% undecided.</p>
      <p class="insight-note"><strong>${pressure.label}:</strong> ${pressure.summary}</p>
    </div>
    <div class="insight-card">
      <p class="eyebrow">Top Issues</p>
      <p>${topIssues.map((issue) => ISSUE_LABELS[issue]).join(", ")}</p>
    </div>
    <div class="insight-card">
      <p class="eyebrow">Brand Fit</p>
      <p><strong>${fitLabel}.</strong> ${messageRead}</p>
    </div>
    <div class="insight-card">
      <p class="eyebrow">Early Ad Read</p>
      <p>${adRead}</p>
    </div>
  `;
}

function renderMessageMix() {
  const definitionsOpen = Boolean(gameState.ui.messageDefinitionsOpen);
  const locked = isBrandLocked(gameState);
  const anchorMix = gameState.ui.brandAnchorMix || gameState.messageMix;
  const topBrandIssues = topIssuesFromMix(gameState.messageMix, 3);
  const increaseCount = ISSUE_KEYS.filter((issue) => gameState.ui.brandDriftPlan?.[issue] === "increase").length;
  const decreaseCount = ISSUE_KEYS.filter((issue) => gameState.ui.brandDriftPlan?.[issue] === "decrease").length;
  if (elements["toggle-mix-definitions-button"]) {
    elements["toggle-mix-definitions-button"].textContent = definitionsOpen ? "Hide Notes" : "Show Notes";
  }
  elements["message-mix"].innerHTML = `
    <div class="mix-board">
      <p class="brand-summary-copy">
        ${locked
          ? `Locked: ${topBrandIssues.map((issue) => ISSUE_LABELS[issue]).join(", ")}.`
          : `Adjust a few lanes.`}
      </p>
      <div class="mix-board-scroll">
        <div class="mix-horizontal-row brand-row-stack">
          ${ISSUE_KEYS.map((issue) => `
            <label class="mix-issue-chip brand-chip">
              <div class="brand-chip-main">
                <div class="brand-chip-topline">
                  <span class="mix-issue-name">${ISSUE_LABELS[issue]}</span>
                  <span class="brand-value-pill">${gameState.messageMix[issue]}%</span>
                  <span class="brand-delta ${gameState.messageMix[issue] > anchorMix[issue] ? "brand-delta-up" : gameState.messageMix[issue] < anchorMix[issue] ? "brand-delta-down" : "brand-delta-flat"}">
                    ${gameState.messageMix[issue] > anchorMix[issue] ? `+${gameState.messageMix[issue] - anchorMix[issue]}` : gameState.messageMix[issue] < anchorMix[issue] ? `${gameState.messageMix[issue] - anchorMix[issue]}` : "Hold"}
                  </span>
                </div>
                <div class="brand-chip-note">Open ${anchorMix[issue]}%</div>
              </div>
              <div class="mix-chip-input">
                <select
                  class="text-input compact-select brand-drift-select"
                  data-brand-drift-issue="${issue}"
                  ${locked ? "disabled" : ""}
                >
                  <option value="decrease" ${gameState.ui.brandDriftPlan?.[issue] === "decrease" ? "selected" : ""}>Decrease</option>
                  <option value="hold" ${!gameState.ui.brandDriftPlan?.[issue] || gameState.ui.brandDriftPlan?.[issue] === "hold" ? "selected" : ""}>Hold</option>
                  <option value="increase" ${gameState.ui.brandDriftPlan?.[issue] === "increase" ? "selected" : ""}>Increase</option>
                </select>
              </div>
            </label>
          `).join("")}
        </div>
      </div>
      ${definitionsOpen ? `
        <div class="mix-definition-grid">
          ${ISSUE_KEYS.map((issue) => `
            <div class="mix-definition-card">
              <strong>${ISSUE_LABELS[issue]}</strong>
              <span>${ISSUE_DESCRIPTORS[issue]}</span>
            </div>
          `).join("")}
        </div>
      ` : ""}
    </div>
  `;
  const total = ISSUE_KEYS.reduce((sum, issue) => sum + gameState.messageMix[issue], 0);
  elements["message-total"].textContent = `${total}%`;
  const statusCopy = locked
    ? `Locked this window.`
    : gameState.ui.mixStatus?.trim()
      ? gameState.ui.mixStatus
      : increaseCount || decreaseCount
        ? `Drift: +${increaseCount} / -${decreaseCount}.`
        : "";
  if (elements["message-identity-summary"]) {
    if (statusCopy) {
      elements["message-identity-summary"].classList.remove("hidden");
      elements["message-identity-summary"].textContent = statusCopy.trim();
    } else {
      elements["message-identity-summary"].classList.add("hidden");
      elements["message-identity-summary"].textContent = "";
    }
  }
}

function renderItineraries() {
  if (!elements["itinerary-options"]) {
    return;
  }
  gameState.ui.itineraryOptions = buildItineraries(gameState);
  ensureItinerarySelection(gameState);
  elements["itinerary-options"].innerHTML = gameState.ui.itineraryOptions.map((option) => `
    <label class="itinerary-card itinerary-row ${gameState.ui.activeItineraryId === option.id ? "active" : ""}">
      <input type="radio" name="itinerary" value="${option.id}" ${gameState.ui.activeItineraryId === option.id ? "checked" : ""} />
      <strong class="itinerary-row-title">${option.title}</strong>
      <span class="itinerary-row-states">${option.states.map(getStateName).join(", ")}</span>
      <span class="tag neutral">${option.efficiencyLabel}</span>
    </label>
  `).join("");
}

function renderRallyPlanner() {
  if (!elements["rally-count"] || !elements["rally-slots"] || !elements["rally-budget"]) {
    return;
  }
  const active = getActiveItinerary(gameState);
  const currentRoundStates = getCurrentRoundStates();
  const preferredStates = uniqueArray(currentRoundStates.map((state) => state.abbr));
  const rallyCount = Number(gameState.dayPlan.rallyCount || 0);
  elements["rally-count"].value = String(rallyCount);
  elements["rally-slots"].innerHTML = Array.from({ length: rallyCount }, (_, index) => {
    const existing = gameState.dayPlan.rallies[index] || preferredStates[index % preferredStates.length] || currentRoundStates[0].abbr;
    return `
      <label>
        <span class="field-label">Rally ${index + 1}</span>
        <select class="text-input" data-rally-slot="${index}">
          ${preferredStates.map((abbr) => `<option value="${abbr}" ${abbr === existing ? "selected" : ""}>${getStateName(abbr)}</option>`).join("")}
        </select>
      </label>
    `;
  }).join("");
  elements["rally-budget"].textContent = `${rallyCount * RALLY_COST} / ${DAILY_EFFORT}`;
}

function updateEffortPlan({ syncInputs = true, lockedStateEffortAbbr = "" } = {}) {
  if (!gameState) {
    return;
  }
  gameState.dayPlan.fundraising = parseEffortInput(elements["fundraising-effort"].value);
  gameState.dayPlan.endorsements = parseEffortInput(elements["endorsement-effort"].value);
  if (syncInputs) {
    normalizeEffortInputs(gameState);
  }
  const general = computeGeneralCampaignEffort(gameState);
  normalizeStateEffortPlan(gameState, { preserveDraft: true, lockedAbbr: lockedStateEffortAbbr });
  const splitDelta = computeRemainingEffort(gameState);
  const splitTotal = computeStateEffortTotal(gameState);
  const stateSummary = describeStateEffortPlan(gameState);
  if (elements["general-effort"]) {
    elements["general-effort"].textContent = `${general}`;
  }
  if (elements["general-effort-indicator"]) {
    elements["general-effort-indicator"].textContent = `${general}`;
  }
  elements["remaining-effort"].textContent = `${splitTotal} / ${general}`;
  if (elements["effort-preview"]) {
    if (splitDelta < 0) {
      elements["effort-preview"].classList.remove("hidden");
      elements["effort-preview"].textContent = `${Math.abs(splitDelta)} short. Bring the live-state total to ${general}.`;
    } else if (splitDelta > 0) {
      elements["effort-preview"].classList.remove("hidden");
      elements["effort-preview"].textContent = `${splitDelta} high. Bring the live-state total to ${general}.`;
    } else if (stateSummary && getCurrentRoundStateAbbrs(gameState).length > 1) {
      elements["effort-preview"].classList.remove("hidden");
      elements["effort-preview"].textContent = `${stateSummary}.`;
    } else {
      elements["effort-preview"].classList.add("hidden");
      elements["effort-preview"].textContent = "";
    }
  }
  elements["end-turn-button"].disabled = !gameState.ui.roundRecap && (
    splitDelta !== 0
    || computeMessageMixTotal(gameState.messageMix) !== 100
  );
  renderAdPreview();
}

function populateAdControls() {
  const states = getCampaignPlanningStates();
  const opponents = gameState.candidates.filter((candidate) => candidate.id !== gameState.playerId);
  const currentStateValue = elements["ad-state"].value;
  elements["ad-state"].innerHTML = states.map((state) => `<option value="${state.abbr}">${state.name}${planningStatePhase(state.abbr) === "upcoming" ? " (Upcoming)" : ""}</option>`).join("");
  if (states.find((state) => state.abbr === currentStateValue)) {
    elements["ad-state"].value = currentStateValue;
  } else if (states[0]) {
    elements["ad-state"].value = states[0].abbr;
  }
  elements["ad-opponent"].innerHTML = opponents.map((candidate) => `<option value="${candidate.id}">${candidate.name}</option>`).join("");
  const maxUnits = dailyAdUnitCapacity(gameState);
  elements["ad-units"].max = String(maxUnits);
  elements["ad-units"].value = String(clamp(Number(elements["ad-units"].value || 1), 1, maxUnits));
  syncAdControlVisibility();
}

function renderAdPreview() {
  if (!gameState) {
    return;
  }
  const scope = elements["ad-scope"].value;
  const units = clamp(Math.round(Number(elements["ad-units"].value || 1)), 1, dailyAdUnitCapacity(gameState));
  const state = getStateByAbbr(elements["ad-state"].value) || getCampaignPlanningStates()[0] || getCurrentRoundStates()[0];
  syncAdControlVisibility();
  const targetStates = getAdTargetStates({ scope, state: state?.abbr || "" }, gameState);
  if (!targetStates.length) {
    elements["ad-preview"].innerHTML = `<div class="ad-preview-line">${
      scope === "ondeck"
        ? "There are no on-deck states right now, so an On Deck buy is not available."
        : "There are no valid states for that ad scope right now."
    }</div>`;
    if (elements["ad-cost-inline"]) {
      elements["ad-cost-inline"].textContent = "—";
    }
    elements["ad-buy-count"].textContent = `${Math.max(0, dailyAdUnitCapacity(gameState) - plannedAdUnits(gameState))} units left`;
    return;
  }
  const cost = adEffortCostFor(scope, state, units);
  const type = elements["ad-type"].value;
  const issue = selectAutoAdIssue({ scope, state, type, targetStates, mix: gameState.messageMix });
  const queuedCost = plannedAdSpend(gameState);
  const queuedUnits = plannedAdUnits(gameState);
  const budget = playerAdBudget(gameState);
  const remainingBudget = budget - queuedCost - cost;
  const budgetText = remainingBudget >= 0
    ? `After: $${Math.max(0, remainingBudget)} / $${budget}`
    : `Need: $${Math.abs(remainingBudget)} more`;
  const laneText = type === "negative"
    ? `Attack lane: ${ISSUE_LABELS[issue]}`
    : `Lane: ${ISSUE_LABELS[issue]}`;
  if (elements["ad-cost-inline"]) {
    elements["ad-cost-inline"].textContent = `$${cost}`;
  }
  const bookedLines = gameState.ui.plannedAds.length
    ? `
      <div class="ad-preview-queue">
        ${gameState.ui.plannedAds.map((ad, index) => `
          <div class="ad-preview-item">
            <span class="ad-preview-item-copy">${ad.summary}</span>
            <button class="ad-preview-remove" type="button" data-remove-ad-index="${index}" aria-label="Remove ad">×</button>
          </div>
        `).join("")}
      </div>
    `
    : `<div class="ad-preview-line">Booked ads: none.</div>`;
  elements["ad-preview"].innerHTML = `
    ${bookedLines}
    <div class="ad-preview-line">${laneText}. ${budgetText}.</div>
  `;
  elements["ad-buy-count"].textContent = `${Math.max(0, dailyAdUnitCapacity(gameState) - queuedUnits)} units left`;
}

function handleAdPreviewClick(event) {
  if (!gameState) {
    return;
  }
  const removeButton = event.target.closest("[data-remove-ad-index]");
  if (!removeButton) {
    return;
  }
  const index = Number(removeButton.dataset.removeAdIndex);
  if (!Number.isInteger(index) || index < 0) {
    return;
  }
  gameState.ui.plannedAds.splice(index, 1);
  renderAdPreview();
}

function syncAdControlVisibility() {
  const scope = elements["ad-scope"].value;
  const type = elements["ad-type"].value;
  const stateDisabled = scope !== "state";
  const opponentDisabled = type !== "negative";
  elements["ad-state-label"].classList.toggle("ad-control-disabled", stateDisabled);
  elements["ad-opponent-label"].classList.toggle("ad-control-disabled", opponentDisabled);
  elements["ad-state"].disabled = stateDisabled;
  elements["ad-opponent"].disabled = opponentDisabled;
  elements["ad-opponent-heading"].textContent = type === "negative" ? "Target Opponent" : "Opponent";
}

function renderStateInsights() {
  if (!elements["state-insights-panel"]) {
    return;
  }
  const state = getStateByAbbr(gameState.ui.selectedState) || getCurrentRoundStates()[0];
  if (!state) {
    return;
  }
  gameState.ui.selectedState = state.abbr;
  if (elements["analysis-state"]) {
    elements["analysis-state"].value = state.abbr;
  }
  if (elements["manager-state"]) {
    elements["manager-state"].value = state.abbr;
  }
  const topIssues = sortIssues(state.issues).slice(0, 4);
  const traits = buildStateTraitNotes(state);
  const pressure = buildStatePressureSummary(state);
  const brandFit = brandFitLabel(computeMessageFit(state, gameState.messageMix, getPlayerCandidate()));
  const ranking = sortSupportEntries(state.visiblePolls);
  const leader = getCandidateById(ranking[0]?.[0]);
  const runnerUp = getCandidateById(ranking[1]?.[0]);
  const margin = ranking[1] ? round1(ranking[0][1] - ranking[1][1]) : ranking[0]?.[1] || 0;
  const playerShare = state.visiblePolls[gameState.playerId] || 0;
  const playerRank = ranking.findIndex(([candidateId]) => candidateId === gameState.playerId) + 1;
  const activeBuzz = appliesBuzzToState(gameState, state) && gameState.activeBuzz
    ? `
      <article class="analysis-card">
        <h4>Current Story</h4>
        <p>${gameState.activeBuzz.headline}</p>
      </article>
    `
    : "";
  elements["state-insights-panel"].innerHTML = `
    <div class="analysis-grid">
      <article class="analysis-card">
        <h4>${state.name}</h4>
        <p>${state.electoralVotes} ${primaryUnitWord()} | ${state.region} | ${state.undecided.toFixed(1)}% undecided</p>
        <div class="analysis-meta-row">
          <span class="detail-chip">${pressure.label}</span>
          <span class="detail-chip">${brandFit}</span>
        </div>
      </article>
      <article class="analysis-card">
        <h4>Standing</h4>
        <p>${leader?.name || "Unknown"} leads ${runnerUp ? `${runnerUp.name} by ${margin.toFixed(1)}` : "the field"}.</p>
        <p>You are ${ordinal(playerRank)} at ${playerShare.toFixed(1)}%.</p>
      </article>
      <div class="analysis-split">
        <article class="analysis-card">
          <h4>Top Issues</h4>
          <ul class="analysis-list">${topIssues.map(([issue]) => `<li>${ISSUE_LABELS[issue]}: ${issueBandLabel(state, issue)}</li>`).join("")}</ul>
        </article>
        <article class="analysis-card">
          <h4>Best With</h4>
          <ul class="analysis-list">${traits.slice(0, 4).map((item) => `<li>${item}</li>`).join("")}</ul>
        </article>
      </div>
      <article class="analysis-card">
        <h4>Campaign Read</h4>
        <p>${stateRead(state)}</p>
      </article>
      ${activeBuzz}
    </div>
  `;
}

function renderCampaignManager() {
  const brief = buildManagerBrief(gameState);
  elements["campaign-manager-panel"].innerHTML = brief.slice(0, 3).map((card) => `
    <article class="rail-feed-item">
      <h4>${card.heading}</h4>
      <p>${card.body}</p>
    </article>
  `).join("");
  answerManagerQuestion();
}

function renderRecentResults() {
  if (!elements["recent-results-panel"]) {
    return;
  }
  const resolvedStates = getResolvedPrimaryStates(gameState).slice(0, 5);
  if (!resolvedStates.length) {
    elements["recent-results-panel"].innerHTML = `
      <article class="report-item result-summary-card">
        <h4>No States Called Yet</h4>
        <p>The first finalized primary result will stay here after it resolves, so you can keep planning without losing the scoreboard.</p>
      </article>
    `;
    return;
  }
  elements["recent-results-panel"].classList.add("results-stack");
  elements["recent-results-panel"].innerHTML = resolvedStates.map((state) => {
    const winner = getCandidateById(state.primaryWinnerId);
    const ranking = sortSupportEntries(state.finalResult?.shares || state.visiblePolls);
    const runnerUp = ranking[1] ? getCandidateById(ranking[1][0]) : null;
    const margin = ranking[1] ? round1(ranking[0][1] - ranking[1][1]) : ranking[0]?.[1] || 0;
    return `
      <article class="report-item result-summary-card">
        <h4>${state.name}</h4>
        <p>${winner?.name || "Unknown"} won ${state.electoralVotes} delegates${runnerUp ? ` by ${margin.toFixed(1)} over ${runnerUp.name}` : ""}.</p>
        <div class="result-share-row">${formatStateResultShares(state)}</div>
      </article>
    `;
  }).join("");
}

function renderOpponentReport() {
  if (!elements["opponent-report"]) {
    return;
  }
  elements["opponent-report"].innerHTML = gameState.opponentActivity.slice(0, 8).map((item) => `
    <article class="report-item">
      <h4>${item.title}</h4>
      <p>${item.text}</p>
    </article>
  `).join("");
}

function renderEventLog() {
  if (!elements["event-log"]) {
    return;
  }
  elements["event-log"].innerHTML = gameState.eventLog.slice(0, 10).map((item) => `
    <article class="rail-feed-item log-item">
      <h4>${item.title}</h4>
      <p>${item.text}</p>
    </article>
  `).join("");
}

function handlePriorityChange(event) {
  if (!event.target.matches("[data-priority-state]") || !gameState) {
    return;
  }
  const targetState = getStateByAbbr(event.target.dataset.priorityState);
  const regionName = getPriorityBucketName(targetState);
  gameState.priorities[regionName][event.target.dataset.priorityState] = event.target.value;
  gameState.ui.activeItineraryId = "";
  renderGame();
}

function handleStateEffortChange(event) {
  if (!event.target.matches("[data-state-effort]") || !gameState) {
    return;
  }
  if (event.type === "input") {
    return;
  }
  const abbr = event.target.dataset.stateEffort;
  const nextValue = snapEffort(event.target.value);
  gameState.dayPlan.stateEffort ||= {};
  gameState.dayPlan.stateEffort[abbr] = nextValue;
  event.target.value = String(nextValue);
  updateEffortPlan({ syncInputs: false, lockedStateEffortAbbr: abbr });
  renderPollingDesk();
}

function handleMixChange(event) {
  if (!gameState) {
    return;
  }
  if (event.target.matches("[data-brand-drift-issue]")) {
    if (isBrandLocked(gameState)) {
      renderMessageMix();
      return;
    }
    const issue = event.target.dataset.brandDriftIssue;
    gameState.ui.brandDriftPlan[issue] = event.target.value;
    gameState.messageMix = computeBrandMixFromPlan(gameState.ui.brandAnchorMix || gameState.messageMix, gameState.ui.brandDriftPlan);
    const increaseCount = ISSUE_KEYS.filter((key) => gameState.ui.brandDriftPlan[key] === "increase").length;
    const decreaseCount = ISSUE_KEYS.filter((key) => gameState.ui.brandDriftPlan[key] === "decrease").length;
    gameState.ui.mixStatus = increaseCount === decreaseCount
      ? "Balanced drift. The rest of the brand stays mostly where it started."
      : "Unpaired shifts are being auto-balanced across the rest of the brand.";
    renderMessageMix();
    renderAdPreview();
    updateEffortPlan();
    return;
  }
  if (event.target.matches("[data-mix-issue]")) {
    if (isBrandLocked(gameState)) {
      renderMessageMix();
      return;
    }
    const issue = event.target.dataset.mixIssue;
    const desired = snapEffort(event.target.value);
    const current = gameState.messageMix[issue];
    const otherTotal = ISSUE_KEYS
      .filter((key) => key !== issue)
      .reduce((sum, key) => sum + gameState.messageMix[key], 0);
    if (otherTotal + desired > 100) {
      gameState.ui.mixStatus = `That would push the brand to ${otherTotal + desired}%. You cannot go over 100%.`;
      event.target.value = String(current);
      renderMessageMix();
      renderAdPreview();
      updateEffortPlan();
      return;
    }
    gameState.messageMix[issue] = desired;
    normalizeMix(gameState.messageMix);
    gameState.ui.brandAnchorMix = { ...gameState.messageMix };
    gameState.ui.brandDriftPlan = defaultBrandDriftPlan();
    gameState.ui.mixStatus = "Brand reset around the new mix.";
    renderMessageMix();
    renderAdPreview();
    updateEffortPlan();
  }
}

function handleMessageMixClick(event) {
  const toggle = event.target.closest("[data-toggle-mix-definitions]");
  if (!toggle || !gameState) {
    return;
  }
  gameState.ui.messageDefinitionsOpen = !gameState.ui.messageDefinitionsOpen;
  renderMessageMix();
}

function handleMessageMixToggle() {
  if (!gameState) {
    return;
  }
  gameState.ui.messageDefinitionsOpen = !gameState.ui.messageDefinitionsOpen;
  renderMessageMix();
}

function handleItineraryChange(event) {
  if (event.target.name !== "itinerary" || !gameState) {
    return;
  }
  gameState.ui.activeItineraryId = event.target.value;
  renderRallyPlanner();
  updateEffortPlan();
}

function handleRallyCountChange() {
  if (!gameState) {
    return;
  }
  gameState.dayPlan.rallyCount = Number(elements["rally-count"].value);
  trimRalliesToCount(gameState, true);
  renderRallyPlanner();
  updateEffortPlan();
}

function handleRallyStateChange(event) {
  if (!event.target.matches("[data-rally-slot]") || !gameState) {
    return;
  }
  const slot = Number(event.target.dataset.rallySlot);
  gameState.dayPlan.rallies[slot] = event.target.value;
}

function syncSelectedState(stateAbbr) {
  if (!gameState || !stateAbbr) {
    return;
  }
  gameState.ui.selectedState = stateAbbr;
  renderPollingDesk();
  populateRailSelectors();
  renderCampaignManager();
  renderStateInsights();
  renderMapRail();
  answerManagerQuestion();
}

function handlePollingClick(event) {
  if (event.target.closest("[data-priority-state]") || event.target.closest("[data-state-effort]")) {
    return;
  }
  const row = event.target.closest("[data-state-row]");
  if (!row || !gameState) {
    return;
  }
  syncSelectedState(row.dataset.stateRow);
}

function handleManagerTopicChange(event) {
  if (!gameState) {
    return;
  }
  gameState.ui.managerTopic = event.target.value;
  answerManagerQuestion();
}

function handleManagerStateChange(event) {
  if (!gameState) {
    return;
  }
  syncSelectedState(event.target.value);
}

function handleAnalysisStateChange(event) {
  if (!gameState) {
    return;
  }
  syncSelectedState(event.target.value);
}

function handlePosterLaunch(event) {
  const button = event.target.closest("[data-open-poster]");
  if (!button) {
    return;
  }
  openPosterModal(button.dataset.openPoster);
}

function lockAdBuy() {
  if (!gameState || gameState.ui.roundRecap) {
    return;
  }
  const state = getStateByAbbr(elements["ad-state"].value) || getCampaignPlanningStates()[0] || getCurrentRoundStates()[0];
  const scope = elements["ad-scope"].value;
  const type = elements["ad-type"].value;
  const opponent = elements["ad-opponent"].value;
  const units = clamp(Math.round(Number(elements["ad-units"].value || 1)), 1, dailyAdUnitCapacity(gameState));
  const targetStates = getAdTargetStates({ scope, state: state?.abbr || "" }, gameState);
  if (!targetStates.length) {
    alert(scope === "ondeck"
      ? "There are no on-deck states available for that buy right now."
      : "That ad scope does not have any valid states right now.");
    return;
  }
  const reservedUnits = plannedAdUnits(gameState);
  if (reservedUnits + units > dailyAdUnitCapacity(gameState)) {
    alert("That would push you over today's media capacity. Pull back the units or lock a smaller ad allocation.");
    return;
  }
  const cost = adEffortCostFor(scope, state, units);
  const issue = selectAutoAdIssue({ scope, state, type, targetStates, mix: gameState.messageMix });
  const reserved = plannedAdSpend(gameState);
  if (playerAdBudget(gameState) < reserved + cost) {
    alert("You do not have enough funds on hand to lock that ad allocation.");
    return;
  }
  const summary = scope === "region"
    ? `${units}u ${type === "negative" ? "negative" : "positive"} current-week`
    : scope === "ondeck"
      ? `${units}u ${type === "negative" ? "negative" : "positive"} on-deck`
      : scope === "window"
        ? `${units}u ${type === "negative" ? "negative" : "positive"} current+on-deck`
        : `${units}u ${type === "negative" ? "negative" : "positive"} ${getStateName(state.abbr)}`;
  gameState.ui.plannedAds.push({ scope, state: state.abbr, type, opponent, issue, units, cost, summary });
  renderAdPreview();
}

function answerManagerQuestion() {
  if (!gameState || !elements["manager-answer"]) {
    return;
  }
  const topic = elements["manager-topic"]?.value || gameState.ui.managerTopic || "best-opportunity";
  const stateAbbr = elements["manager-state"]?.value || gameState.ui.selectedState;
  gameState.ui.managerTopic = topic;
  const topicLabel = MANAGER_TOPICS.find((item) => item.id === topic)?.label || "Recommendation";
  elements["manager-answer"].classList.add("manager-answer-card");
  elements["manager-answer"].innerHTML = `
    <strong>${topicLabel}</strong>
    <span>${buildStructuredManagerAnswer(gameState, topic, stateAbbr)}</span>
  `;
}

function buildStructuredManagerAnswer(state, topic, stateAbbr) {
  const context = buildManagerContext(state, stateAbbr);
  const {
    focusState,
    player,
    bestState,
    gap,
    playerIsLeader,
    dominantIssue,
    secondaryIssue,
    safePlay,
    gamblePlay,
    longTermPlay,
    riskPlay,
    adRecommendation,
    rallyRecommendation,
    routeRecommendation,
  } = context;
  const brandIssue = strongestIssueForCandidate(player);
  const leadText = playerIsLeader
    ? `You are up about ${gap.toFixed(1)} in ${focusState.name}.`
    : `You are down about ${gap.toFixed(1)} in ${focusState.name}.`;

  switch (topic) {
    case "best-opportunity":
      return `${bestState.name} is the best immediate opening. ${routeRecommendation}`;
    case "biggest-risk":
      return riskPlay;
    case "protect-lead":
      return `${leadText} ${safePlay}`;
    case "upset-chance":
      return `${focusState.name} is still live if you can move ${ISSUE_LABELS[dominantIssue]} and keep ${ISSUE_LABELS[secondaryIssue]} behind it. ${gamblePlay}`;
    case "advertise":
      return adRecommendation;
    case "rally":
      return rallyRecommendation;
    case "split-day":
      return `Daily split: ${safePlay} Keep enough effort in general campaigning to support ${context.route.title}, and do not let fundraising or endorsements crowd out the live board.`;
    case "build-on-deck":
      return longTermPlay;
    case "state-read":
      return `${leadText} ${focusState.undecided.toFixed(1)}% is still undecided there, and ${ISSUE_LABELS[dominantIssue]} is the cleanest current fit.`;
    case "brand":
      return `${ISSUE_LABELS[brandIssue]} is closest to your natural lane right now. ${sameTopIssueRepeated(state) ? `It is landing, but you are starting to sound repetitive.` : `You still have room to repeat it without sounding stale.`}`;
    default:
      return safePlay;
  }
}

function buildManagerAnswer(state, question) {
  const lower = question.toLowerCase();
  const parsedState = extractStateFromQuestion(question) || state.ui.managerMemory.state || state.ui.selectedState;
  const context = buildManagerContext(state, parsedState);
  const {
    focusState,
    player,
    route,
    playerIsLeader,
    leader,
    runnerUp,
    gap,
    dominantIssue,
    secondaryIssue,
    hasChance,
    localAdBetter,
    safePlay,
    gamblePlay,
    longTermPlay,
    riskPlay,
    adRecommendation,
    rallyRecommendation,
    issueRecommendation,
    routeRecommendation,
    bestState,
  } = context;
  state.ui.managerMemory = { state: focusState.abbr, issue: dominantIssue, route: route.title };

  if (lower.includes("what does") && lower.includes("tone")) {
    return "Version 2 leans much less on per-stop tone picks. The bigger strategic levers now are your issue mix, your route, and whether you go local or broad with ads.";
  }
  if (lower.includes("which state") || lower.includes("where should i go") || lower.includes("where do i go") || lower.includes("what state")) {
    return `Best immediate target: ${bestState.name}. ${routeRecommendation} ${rallyRecommendation}`;
  }
  if (lower.includes("which issue") || lower.includes("what issue") || lower.includes("what should i talk about") || lower.includes("what should i message")) {
    return `Best issue line: ${issueRecommendation} If you want the safer version, follow ${safePlay}`;
  }
  if (lower.includes("how many rallies") || lower.includes("should i rally") || lower.includes("rallies")) {
    return rallyRecommendation;
  }
  if (lower.includes("what ad") || lower.includes("ad buy") || lower.includes("go local") || lower.includes("go regional") || lower.includes("positive ad")) {
    return adRecommendation;
  }
  if (lower.includes("route") || lower.includes("itinerary")) {
    return routeRecommendation;
  }
  if (lower.includes("safe") || lower.includes("safer")) {
    return `Safe play: ${safePlay}`;
  }
  if (lower.includes("gamble") || lower.includes("risky") || lower.includes("riskier")) {
    return `Higher-variance play: ${gamblePlay} Main risk: ${riskPlay}`;
  }
  if (lower.includes("later") || lower.includes("long term") || lower.includes("next region") || lower.includes("build for")) {
    return `Long-term play: ${longTermPlay} Short-term tradeoff: ${safePlay}`;
  }
  if (lower.includes("candidate") || lower.includes("fit my style") || lower.includes("my strengths")) {
    return `Candidate-fit read: ${longTermPlay} Safe regional read: ${safePlay}`;
  }
  if (lower.includes("whole region") || lower.includes("regional ad") || lower.includes("region right now")) {
    return localAdBetter
      ? `${focusState.name} is valuable enough that I would not blur the spend unless you are trying to raise your floor everywhere. A local buy there should bite harder than a broad regional wash right now.`
      : `A regional buy makes more sense when you are behind in several places at once. Your route already spreads you across ${route.states.map(getStateName).join(", ")}, so a regional push can help stop the whole map from drifting away.`;
  }
  if (lower.includes("do i even have a chance") || lower.includes("get back in the race") || lower.includes("trailing badly")) {
    return hasChance
      ? `Yes, ${focusState.name} is still live. You are down about ${gap.toFixed(1)} in the visible poll with ${focusState.undecided.toFixed(1)}% still movable, so this is not a miracle job yet. I would pair one rally there with a local positive buy and let it ride on your strongest current brand lane.`
      : `${focusState.name} is getting expensive. You can still make it respectable, but the cleaner play is probably to bank smaller states first, then come back if the board tightens.`;
  }
  if (lower.includes("negative ad")) {
    return gap > 5
      ? `A negative ad can make sense if the leader is consolidating, but I would not make that your only answer. If you go negative in ${focusState.name}, follow it with a rally or general-campaigning push so voters hear why you should replace them, not just why they should dislike them.`
      : `I would stay mostly positive there for now. The race is close enough that a clean local push on ${ISSUE_LABELS[dominantIssue]} can still move more persuadable voters than a slash-and-burn hit.`;
  }
  if (lower.includes("fatigue") || lower.includes("tired")) {
    return `Your fatigue band is ${fatigueBand(player.fatigue).toLowerCase()}. The fastest way to stop digging deeper is to cut a rally, keep the route tighter, and let ads carry more of the reach for one day.`;
  }
  if (lower.includes("money") || lower.includes("fundraise")) {
    return state.dayPlan.fundraising < 15
      ? `You are light on fundraising effort today. If you want to keep booking ads, I would push that closer to 20-30 so the media plan does not get squeezed.`
      : `Your fundraising effort is healthy enough to keep the ad desk active. I still would not zero it out unless you are intentionally going all-in on field work.`;
  }
  if (lower.includes("what should i do") || lower.includes("best move") || lower.includes("maximum impact")) {
    return `Safe play: ${safePlay} Alternative gamble: ${gamblePlay} Main risk: ${riskPlay}`;
  }
  const leadRead = playerIsLeader
    ? `In ${focusState.name}, ${player.name} is ahead by about ${gap.toFixed(1)} over ${getCandidateById(runnerUp[0]).name} in the poll snapshot`
    : `In ${focusState.name}, ${getCandidateById(leader[0]).name} is ahead by about ${gap.toFixed(1)} in the poll snapshot`;
  return `${leadRead}, with ${focusState.undecided.toFixed(1)}% undecided. Safe play: ${safePlay} Long-term play: ${longTermPlay} Main risk: ${riskPlay}`;
}

function buildManagerBrief(state) {
  const context = buildManagerContext(state);
  const { bestState, focusState, focusPressure, safePlay, gamblePlay, longTermPlay, riskPlay } = context;
  return [
    {
      heading: "Best Opening",
      body: `${bestState.name} is your clearest place to make something happen. It is the cleanest mix of winnable gap, useful electoral weight, and remaining persuadable voters.`,
    },
    {
      heading: `${focusState.name} Temperature`,
      body: `${focusPressure.label}: ${focusPressure.summary}`,
    },
    {
      heading: "Safe Play",
      body: safePlay,
    },
    {
      heading: "Alternative Gamble",
      body: gamblePlay,
    },
    {
      heading: "Long-Term Brand Play",
      body: longTermPlay,
    },
    {
      heading: "Main Risk",
      body: riskPlay,
    },
  ];
}

function buildManagerContext(state, stateAbbr = "") {
  const currentStates = getCurrentRoundStates(state);
  const player = getPlayerCandidate();
  const route = getActiveItinerary(state);
  const playerId = state.playerId;
  const closeStates = currentStates
    .map((item) => ({ state: item, gap: playerGapInState(item, playerId) }))
    .sort((a, b) => a.gap - b.gap || b.state.undecided - a.state.undecided);
  const bestState = closeStates[0]?.state || currentStates[0];
  const focusState = getStateByAbbr(stateAbbr) || state.ui.selectedState && getStateByAbbr(state.ui.selectedState) || bestState;
  const ranking = sortSupportEntries(focusState.visiblePolls);
  const leader = ranking[0];
  const runnerUp = ranking[1] || leader;
  const playerPoll = focusState.visiblePolls[player.id] || 0;
  const gap = round1((leader[0] === player.id ? leader[1] - (runnerUp?.[1] || 0) : leader[1] - playerPoll));
  const playerIsLeader = leader[0] === player.id;
  const focusPressure = buildStatePressureSummary(focusState, player.id);
  const topMix = topIssuesFromMix(state.messageMix, 3);
  const dominantIssue = topMix[0];
  const secondaryIssue = topMix[1];
  const tertiaryIssue = topMix[2];
  const currentRegion = getCurrentStageLabel(state);
  const nextRegion = isPrimaryMode(state)
    ? PRIMARY_TURN_WINDOWS[state.roundIndex + 1]?.label || "Convention Window"
    : REGION_SEQUENCE[state.roundIndex + 1] || "Final National Push";
  const nextRegionIssue = isPrimaryMode(state)
    ? nextPrimaryWindowIssue(state)
    : primaryIdentityIssueForRegion(nextRegion);
  const bestRallyState = route.states[0] || bestState?.abbr || focusState.abbr;
  const hasChance = focusState.undecided > 24 && gap < 11;
  const leadIsSoft = focusPressure.statusKey === "soft-lead";
  const localAdBetter = focusState.undecided < 34 || focusState.electoralVotes >= 15;
  const strongestIssue = strongestIssueForCandidate(player);
  const safePlay = leadIsSoft
    ? `Keep ${focusState.name} in the route, but do not treat this lead as safe yet. With ${focusState.undecided.toFixed(1)}% still movable, lead with ${ISSUE_LABELS[dominantIssue]}, keep ${ISSUE_LABELS[secondaryIssue]} as the backup lane, and let your general campaigning follow ${route.title} until the undecided pool comes down.`
    : `Keep ${focusState.name} in the route, lead with ${ISSUE_LABELS[dominantIssue]}, keep ${ISSUE_LABELS[secondaryIssue]} as the backup lane, and let your general campaigning follow ${route.title}. That is the cleanest win-now line.`;
  const gamblePlay = hasChance
    ? `If you want a bigger swing, stack one rally into ${getStateName(bestRallyState)}, then pair it with a ${localAdBetter ? "local" : (isPrimaryMode(state) ? "window-wide" : "regional")} ${ISSUE_LABELS[dominantIssue]} ad. It is a higher-variance play because it concentrates more of the day into fewer openings.`
    : `If you want a bigger swing, stop spreading the day evenly and make one harder push in ${focusState.name} or another close state. It is riskier because you may lose smaller states while trying to revive a tougher one.`;
  const longTermPlay = nextRegion === currentRegion
    ? `This round and the next are asking for similar politics, so I would only shade a little toward identity-building. A small lane for ${ISSUE_LABELS[strongestIssue]} is reasonable if it fits your candidate, but I would not weaken today's core issues too much.`
    : `If you want to start building for ${nextRegion}, keep today's lead issue intact but leave a modest lane for ${ISSUE_LABELS[nextRegionIssue]}${strongestIssue !== nextRegionIssue ? ` or ${ISSUE_LABELS[strongestIssue]}` : ""}. That is not the best immediate ${isPrimaryMode(state) ? "live-state play" : "regional play"}, but it can start shaping the kind of candidate voters see when the map shifts.`;
  const risks = [];
  if (player.fatigue >= 70) {
    risks.push("fatigue is high enough that a tight route or fewer rallies would improve efficiency tomorrow");
  }
  if (state.dayPlan.fundraising < 10) {
    risks.push("fundraising is light enough that the ad game could start closing on you");
  }
  if (leadIsSoft) {
    risks.push(`${focusState.name} still looks volatile because ${focusState.undecided.toFixed(1)}% of the vote is undecided, so your poll lead is not actually secure yet`);
  }
  if (sameTopIssueRepeated(state)) {
    risks.push(`${ISSUE_LABELS[dominantIssue]} is working, but you are getting close to sounding one-note`);
  }
  if (averagePollingError(currentStates) >= 4.5) {
    risks.push("the polling is noisy enough that the board may be a little less settled than it looks");
  }
  const riskPlay = risks.length
    ? `Main risk right now: ${risks[0]}.`
    : `Main risk right now: overfitting too hard to ${focusState.name} and forgetting that other live or on-deck states still need attention.`;
  const issueRecommendation = `${ISSUE_LABELS[dominantIssue]} should lead today, with ${ISSUE_LABELS[secondaryIssue]} as the second lane. ${ISSUE_LABELS[tertiaryIssue]} is the optional third lane if you want to stay broad without getting too cute.`;
  const rallyRecommendation = Number(state.dayPlan.rallyCount || 0) >= 2
    ? `You are already on an aggressive rally plan. I would only keep that if you are intentionally going for a concentrated swing in ${getStateName(bestRallyState)} and the nearby route.`
    : `I would usually stay at one rally here, and I would put it in ${getStateName(bestRallyState)} unless fatigue or a very light media budget is forcing a quieter day.`;
  const routeRecommendation = `Route read: ${route.title} is the current working route, but ${bestState.name} is still the best single target if you want to tighten the day around one opening.`;
  const preferredAdScope = localAdBetter ? "local" : (isPrimaryMode(state) ? "window-wide" : "regional");
  const preferredAdType = gap > 5 ? "negative" : "positive";
  const preferredAdState = getStateName(focusState.abbr);
  const preferredOpponent = getCandidateById(leader[0])?.name || "the leader";
  const adRecommendation = preferredAdScope === "local"
    ? `Ad read: I would lean ${preferredAdType} and keep it local in ${preferredAdState}. ${preferredAdType === "negative" ? `If you hit ${preferredOpponent}, follow it with a rally or general-campaigning push so the contrast lands.` : `${leadIsSoft ? `Do not treat a lead there as safe while ${focusState.undecided.toFixed(1)}% is still movable.` : `That is the cleaner persuasion play while the state is still live.`}`}`
    : `Ad read: I would lean ${preferredAdType} and go ${isPrimaryMode(state) ? "window-wide" : "regional"} if your goal is to lift or blunt several states at once. ${preferredAdType === "negative" ? `The best target is still ${preferredOpponent}.` : `Use it to raise your floor across the current ${isPrimaryMode(state) ? "window" : "region"} rather than trying to win one state with it.`}`;
  return {
    currentStates,
    player,
    route,
    bestState,
    focusState,
    focusPressure,
    playerIsLeader,
    leader,
    runnerUp,
    gap,
    dominantIssue,
    secondaryIssue,
    tertiaryIssue,
    hasChance,
    leadIsSoft,
    localAdBetter,
    safePlay,
    gamblePlay,
    longTermPlay,
    riskPlay,
    adRecommendation,
    rallyRecommendation,
    issueRecommendation,
    routeRecommendation,
  };
}

function primaryIdentityIssueForRegion(regionName) {
  if (regionName === "South") {
    return "values";
  }
  if (regionName === "West") {
    return "environment";
  }
  if (regionName === "Northeast") {
    return "healthcare";
  }
  if (regionName === "Midwest") {
    return "economy";
  }
  return "unity";
}

function nextPrimaryWindowIssue(state = gameState) {
  const nextWindow = PRIMARY_TURN_WINDOWS[(state?.roundIndex || 0) + 1];
  if (!nextWindow?.stateAbbrs?.length) {
    return "unity";
  }
  const nextStates = nextWindow.stateAbbrs
    .map((abbr) => (state?.states || gameState?.states || []).find((item) => item.abbr === abbr))
    .filter(Boolean);
  if (!nextStates.length) {
    return "unity";
  }
  return topIssueAcrossStates(nextStates);
}

function strongestIssueForCandidate(candidate) {
  return ISSUE_KEYS.slice().sort((a, b) => (candidate.issueCredibility[b] || 0) - (candidate.issueCredibility[a] || 0))[0];
}

function endTurn() {
  if (!gameState || gameState.ui.roundRecap) {
    return;
  }
  if (computeMessageMixTotal(gameState.messageMix) !== 100) {
    alert("Your campaign brand has to add up to 100% before you run the day.");
    return;
  }
  if (computeRemainingEffort(gameState) !== 0) {
    alert(`Your live-state effort split has to add up to ${computeGeneralCampaignEffort(gameState)} before you run the day.`);
    return;
  }
  gameState.ui.previousVisiblePolls = captureVisiblePolls(gameState);
  const route = getDerivedPlanningRoute(gameState);
  const playerLog = resolvePlayerDay(gameState, route);
  const opponentActivity = [];
  gameState.candidates.filter((candidate) => candidate.id !== gameState.playerId).forEach((candidate) => {
    opponentActivity.push(...resolveAiDay(gameState, candidate));
  });
  gameState.opponentActivity = opponentActivity.slice(0, 8);
  maybeTriggerNewsEvent(gameState);
  let debate = null;
  let momentumSummary = null;

  const primaryWindowEndsNow = isPrimaryMode(gameState) && gameState.turnInRound >= getCurrentPrimaryWindowDays(gameState);
  if (primaryWindowEndsNow || gameState.turnInRound === TURNS_PER_REGION) {
    let delegateSummary = null;
    if (gameState.mode === "primary") {
      delegateSummary = awardPrimaryWindowDelegates(gameState);
    }
    debate = resolveRoundDebate(gameState);
    if (gameState.mode === "primary") {
      momentumSummary = resolvePrimaryMomentumCarryover(gameState);
      gameState.ui.momentumSummary = momentumSummary;
    }
    refreshAllPolls(gameState);
    gameState.ui.roundRecap = {
      title: `${getCurrentStageLabel(gameState)} Recap`,
      cards: buildRoundRecapCards(gameState, debate, playerLog, momentumSummary, delegateSummary),
      awards: delegateSummary?.awards || [],
      nextAction: isLastCampaignStage(gameState) ? "election" : "continue",
    };
  } else {
    refreshAllPolls(gameState);
    gameState.turnInRound += 1;
  }

  gameState.ui.plannedAds = [];
  saveGame();
  renderGame();
}

function handleEndTurnAction() {
  if (!gameState) {
    return;
  }
  if (gameState.ui.roundRecap) {
    continueToNextRound();
    return;
  }
  endTurn();
}

function resolvePlayerDay(state, route) {
  const player = getPlayerCandidate();
  const mix = state.messageMix;
  const dominantIssue = topIssuesFromMix(mix, 1)[0];
  const generalEffort = computeGeneralCampaignEffort(state);
  const fundraisingEffort = Math.max(0, state.dayPlan.fundraising);
  const logEntries = [];
  const totalSupportMoves = [];
  incrementIssueUsage(player, mix);

  if (fundraisingEffort > 0) {
    const gain = computeFundraisingGain(player, fundraisingEffort);
    const narrative = computeFundraisingNarrativeValue(player, fundraisingEffort, gain);
    recordFundraisingRoundData(state, player.id, fundraisingEffort, gain, narrative);
    player.money += gain;
    const fundraisingRead = fundraisingNarrativeLabel(player, narrative);
    logEntries.push({
      title: "Fundraising Push",
      text: `The money call time pays off and brings in roughly $${Math.round(gain)}. Donors are mostly hearing a ${ISSUE_LABELS[dominantIssue]}-first pitch today, and the haul is reading as ${fundraisingRead}.`,
    });
  }

  if (Number(state.dayPlan.rallyCount) > 0) {
    state.dayPlan.rallies.slice(0, Number(state.dayPlan.rallyCount)).forEach((abbr) => {
      const targetState = getStateByAbbr(abbr);
      if (!targetState) {
        return;
      }
      const effect = resolveRally(state, player, targetState, mix, route);
      totalSupportMoves.push(effect.support);
      logEntries.push({
        title: "Rally",
        text: `You stage a major rally in ${targetState.name}. Support moved about ${effect.support.toFixed(1)} points, enthusiasm rose ${effect.enthusiasm.toFixed(1)}, and the speech landed most clearly on ${ISSUE_LABELS[effect.bestIssue]}.`,
      });
    });
  }

  if (state.dayPlan.endorsements > 0) {
    const endorsementResult = resolveEndorsementWork(state, player, route, mix);
    totalSupportMoves.push(endorsementResult.support);
    logEntries.push({ title: "Endorsement Work", text: endorsementResult.copy });
  }

  if (generalEffort > 0) {
    const generalResult = resolveGeneralCampaigning(state, player, route, mix, generalEffort);
    totalSupportMoves.push(generalResult.bestMove);
    logEntries.push({ title: "General Campaigning", text: generalResult.copy });
  }

  if (state.ui.plannedAds.length) {
    state.ui.plannedAds.forEach((ad) => {
      const adResult = resolveAdBuy(state, player, ad, route);
      totalSupportMoves.push(adResult.totalMove || adResult.bestMove);
      logEntries.push({ title: "Ad Buy", text: adResult.copy });
    });
  }

  applyDailyFatigue(state, player, route);
  const totalMoveScore = totalSupportMoves.reduce((sum, value) => sum + value, 0);
  player.momentum = clamp(player.momentum + totalMoveScore * 0.34 - 0.55, 12, 90);
  state.eventLog = [...logEntries.reverse(), ...state.eventLog].slice(0, 14);
  return logEntries;
}

function resolveRally(state, candidate, targetState, mix, route) {
  const bestIssue = topIssueForStateFromMix(targetState, mix);
  const fit = computeMessageFit(targetState, mix, candidate);
  const fatigueFactor = fatigueEfficiency(candidate.fatigue);
  const routeBonus = route.states.includes(targetState.abbr) ? route.efficiency : 0.9;
  const support = round1(clamp(
    0.4 + candidate.stats.charisma * 0.12 + fit * 0.75 + targetState.rallyEffectiveness * 0.35 + routeBonus * 0.18 - (1 - fatigueFactor) * 1.1 + randomBetween(-0.25, 0.3),
    0.2,
    2.2
  ));
  const enthusiasm = round1(clamp(
    2.2 + candidate.stats.charisma * 0.5 + fit * 2 + targetState.rallyEffectiveness * 2 - (1 - fatigueFactor) * 3.4 + randomBetween(-0.8, 1.4),
    1.1,
    9.2
  ));
  positiveShift(targetState, candidate.id, support);
  targetState.enthusiasm[candidate.id] = clamp(targetState.enthusiasm[candidate.id] + enthusiasm, 10, 100);
  return { support, enthusiasm, bestIssue };
}

function resolveEndorsementWork(state, candidate, route, mix) {
  const targetState = getStateByAbbr(route.states[0]) || getCurrentRoundStates()[0];
  const leadIssue = topIssuesFromMix(mix, 1)[0];
  const endorsement = pickEndorsementType(targetState, leadIssue);
  const successChance = clamp(0.38 + state.dayPlan.endorsements / 100 + candidate.stats.authenticity * 0.04 + candidate.stats.discipline * 0.03, 0.2, 0.88);
  const success = Math.random() < successChance;
  let support = 0.3;
  let copy = `Your team spends the day lining up endorsers in ${targetState.name}.`;
  if (success) {
    support = round1(clamp(0.55 + state.dayPlan.endorsements * 0.03 + randomBetween(0.1, 0.5), 0.4, 1.8));
    positiveShift(targetState, candidate.id, support);
    targetState.enthusiasm[candidate.id] = clamp(targetState.enthusiasm[candidate.id] + 2.6, 10, 100);
    copy = `${endorsement} in ${targetState.name} start vouching for you. It is not a thunderclap, but it gives you steadier local backing and about ${support.toFixed(1)} points of movement.`;
  } else {
    copy = `${endorsement} in ${targetState.name} give you a polite meeting but not a real breakthrough. The move mostly buys familiarity instead of a clean endorsement hit.`;
  }
  return { support, copy };
}

function resolveGeneralCampaigning(state, candidate, route, mix, generalEffort) {
  const routeStates = route.states.map(getStateByAbbr).filter(Boolean);
  const campaigning = Math.max(1, computeGeneralCampaignEffort(state));
  const explicitWeights = Array.isArray(route.weights) && route.weights.length === routeStates.length
    ? route.weights.map((value) => Math.max(0.1, Number(value) || 0.1))
    : null;
  const hasPlayerSplit = candidate.id === state.playerId && state.dayPlan?.stateEffort;
  const weights = explicitWeights
    || (hasPlayerSplit
      ? routeStates.map((item) => Math.max(0.1, getStateEffortValue(state, item.abbr) / campaigning))
      : routeStates.map((item, index) => (index === 0 ? 1.2 : index === 1 ? 0.95 : 0.78)));
  const totalWeight = weights.reduce((sum, value) => sum + value, 0);
  let bestState = routeStates[0];
  let bestMove = 0;
  routeStates.forEach((targetState, index) => {
    const fit = computeMessageFit(targetState, mix, candidate);
    const slice = generalEffort * (weights[index] / totalWeight);
    const support = round1(clamp(
      slice * 0.024 * route.efficiency * targetState.groundGameEffectiveness * fit * fatigueEfficiency(candidate.fatigue) + randomBetween(0.05, 0.32),
      0.1,
      1.6
    ));
    positiveShift(targetState, candidate.id, support);
    targetState.enthusiasm[candidate.id] = clamp(targetState.enthusiasm[candidate.id] + round1(slice * 0.04), 10, 100);
    if (support > bestMove) {
      bestMove = support;
      bestState = targetState;
    }
  });
  return {
    bestMove,
    copy: `General campaigning fans out across ${route.states.map(getStateName).join(", ")}. The day includes local radio, smaller rope lines, school stops, and camera availabilities. Best immediate lift: ${bestState.name} at about +${bestMove.toFixed(1)}.`,
  };
}

function resolveAdBuy(state, candidate, ad) {
  const issue = ad.issue;
  candidate.money -= ad.cost;
  const targetStates = getAdTargetStates(ad, state);
  let bestState = targetStates[0];
  let bestMove = 0;
  let totalMove = 0;
  const units = Math.max(1, Number(ad.units || 1));
  const stateTotals = {};
  const coverageMultiplier = ad.scope === "state"
    ? 1
    : clamp(Math.sqrt(3 / Math.max(1, targetStates.length)), ad.scope === "window" ? 0.34 : 0.42, 0.9);
  for (let unitIndex = 0; unitIndex < units; unitIndex += 1) {
    const unitDecay = Math.max(0.42, 1 - unitIndex * 0.16);
    targetStates.forEach((targetState) => {
      const fit = computeIssueFit(targetState, issue, candidate);
      const base = ad.scope === "state" ? 0.85 : ad.scope === "window" ? 0.46 : 0.55;
      const priorPressure = Math.max(0, Number(targetState.adPressure?.[candidate.id] || 0));
      const saturationMultiplier = clamp(1 - priorPressure * 0.08, 0.58, 1);
      if (ad.type === "positive") {
        const move = round1(clamp((base + fit * 0.8 + randomBetween(-0.08, 0.25)) * unitDecay * saturationMultiplier * coverageMultiplier, 0.06, ad.scope === "state" ? 1.35 : ad.scope === "window" ? 0.7 : 0.84));
        positiveShift(targetState, candidate.id, move);
        targetState.enthusiasm[candidate.id] = clamp(targetState.enthusiasm[candidate.id] + ((ad.scope === "state" ? 1.2 : ad.scope === "window" ? 0.65 : 0.8) * unitDecay), 10, 100);
        candidate.favorability = clamp(candidate.favorability + ((ad.scope === "state" ? 0.08 : ad.scope === "window" ? 0.05 : 0.06) * unitDecay), 12, 92);
        stateTotals[targetState.abbr] = (stateTotals[targetState.abbr] || 0) + move;
        totalMove += move;
      } else {
        const move = round1(clamp((base + fit * 0.65 + randomBetween(-0.05, 0.22)) * unitDecay * saturationMultiplier * coverageMultiplier, 0.06, ad.scope === "state" ? 1.12 : ad.scope === "window" ? 0.62 : 0.76));
        negativeShift(targetState, ad.opponent, move, candidate.id);
        candidate.favorability = clamp(candidate.favorability - ((ad.scope === "state" ? 0.5 : ad.scope === "window" ? 0.84 : 0.68) * unitDecay), 18, 90);
        const opponent = getCandidateById(ad.opponent);
        if (opponent) {
          opponent.favorability = clamp(opponent.favorability - ((ad.scope === "state" ? 0.18 : ad.scope === "window" ? 0.28 : 0.22) * unitDecay), 12, 92);
        }
        stateTotals[targetState.abbr] = (stateTotals[targetState.abbr] || 0) + move;
        totalMove += move;
      }
      targetState.adPressure[candidate.id] = priorPressure + 1;
    });
  }
  Object.entries(stateTotals).forEach(([abbr, total]) => {
    if (total > bestMove) {
      bestMove = round1(total);
      bestState = getStateByAbbr(abbr);
    }
  });
  const laneRead = ad.type === "negative"
    ? `The attack naturally leans on ${ISSUE_LABELS[issue]}.`
    : `The buy naturally leans on ${ISSUE_LABELS[issue]}.`;
  const copy = ad.scope === "region"
    ? `You place a ${ad.type} ${units}-unit current-week buy across the live ${isPrimaryMode(state) ? getCurrentStageLabel(state) : getCurrentRegionName(state)} map. ${laneRead} Best immediate movement: ${bestState.name} responded by about +${bestMove.toFixed(1)}.`
    : ad.scope === "ondeck"
      ? `You place a ${ad.type} ${units}-unit on-deck buy across the next primary board. ${laneRead} Best immediate movement: ${bestState.name} responded by about +${bestMove.toFixed(1)}.`
      : ad.scope === "window"
        ? `You place a ${ad.type} ${units}-unit current + on-deck buy across both primary boards. ${laneRead} Best immediate movement: ${bestState.name} responded by about +${bestMove.toFixed(1)}.`
        : `You place a ${ad.type} ${units}-unit ${bestState.name} buy. ${laneRead} It moves the state by about ${bestMove.toFixed(1)} and does not eat candidate time once it is booked.`;
  return { bestMove, totalMove: round1(totalMove), copy };
}

function resolveAiDay(state, candidate) {
  const regionStates = getCurrentRoundStates();
  const liveStateCount = regionStates.length;
  const targetCap =
    liveStateCount >= 14 ? 6
    : liveStateCount >= 10 ? 5
    : liveStateCount >= 7 ? 4
    : liveStateCount >= 4 ? 3
    : liveStateCount >= 3 ? 2
    : 1;
  const targets = regionStates
    .map((item) => ({ state: item, score: aiTargetScore(candidate, item) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, targetCap)
    .map((item) => item.state);
  const primaryTarget = targets[0] || regionStates[0];
  const mix = buildAiMix(candidate, targets.length ? targets : [primaryTarget]);
  incrementIssueUsage(candidate, mix);
  const fundraisingPressure = candidate.money < 40 ? 10 : candidate.money < 65 ? 5 : candidate.money > 115 ? -5 : 0;
  const fundraisingEffort = snapEffort(clamp(
    15 + (candidate.stats.fundraising - 5) * 3 + fundraisingPressure + (liveStateCount >= 10 ? 5 : liveStateCount >= 6 ? 0 : -5),
    10,
    35
  ));
  const endorsementsEffort = snapEffort(clamp(
    10 + Math.round((candidate.stats.discipline + candidate.stats.authenticity - 10) * 1.5) + (liveStateCount >= 10 ? -5 : 0),
    10,
    25
  ));
  const campaigningEffort = Math.max(0, DAILY_EFFORT - fundraisingEffort - endorsementsEffort);
  const targetWeights = targets.map((target, index) => {
    const delegateWeight = Math.min(2.2, target.electoralVotes / 60);
    const leadUrgency = Math.max(0.6, Math.min(1.6, 1 + Math.max(0, playerGapInState(target, candidate.id)) * 0.08));
    const rankWeight =
      index === 0 ? 1.4
      : index === 1 ? 1.08
      : index === 2 ? 0.92
      : index === 3 ? 0.78
      : index === 4 ? 0.66
      : 0.56;
    return Math.max(0.38, rankWeight * delegateWeight * leadUrgency);
  });
  const totalWeight = targetWeights.reduce((sum, value) => sum + value, 0) || 1;
  const aiStateEffort = {};
  let allocated = 0;
  targets.forEach((target, index) => {
    const raw = index === targets.length - 1
      ? campaigningEffort - allocated
      : Math.round(campaigningEffort * (targetWeights[index] / totalWeight));
    const value = Math.max(0, raw);
    aiStateEffort[target.abbr] = value;
    allocated += value;
  });
  const aiRouteState = {
    ...state,
    dayPlan: {
      ...state.dayPlan,
      rallyCount: 0,
      fundraising: fundraisingEffort,
      endorsements: endorsementsEffort,
      stateEffort: aiStateEffort,
    },
  };
  normalizeStateEffortPlan(aiRouteState, { preserveDraft: true });
  const route = getDerivedPlanningRoute(aiRouteState);
  route.weights = route.states.map((abbr) => Math.max(0.1, getStateEffortValue(aiRouteState, abbr) / Math.max(1, campaigningEffort)));
  const generalResult = resolveGeneralCampaigning(aiRouteState, candidate, route, mix, campaigningEffort);
  const endorsementResult = resolveEndorsementWork({ ...state, dayPlan: { endorsements: endorsementsEffort } }, candidate, route, mix);
  const aiCanSpendBroadly = liveStateCount >= 6;
  if (candidate.money > 30 && Math.random() < (aiCanSpendBroadly ? 0.97 : 0.88)) {
    const scope = aiCanSpendBroadly
      ? (Math.random() < 0.58 ? "region" : "state")
      : (Math.random() < 0.75 ? "state" : "region");
    const aiNegative = shouldAiGoNegative(candidate);
    const ad = {
      scope,
      state: primaryTarget.abbr,
      type: aiNegative ? "negative" : "positive",
      opponent: selectAiAdTarget(candidate),
      issue: selectAutoAdIssue({
        scope,
        state: primaryTarget,
        type: aiNegative ? "negative" : "positive",
        targetStates: getAdTargetStates({ scope, state: primaryTarget.abbr }, state),
        mix,
      }),
      units:
        candidate.money > 200 ? (aiCanSpendBroadly ? 5 : 4)
        : candidate.money > 145 ? (aiCanSpendBroadly ? 4 : 3)
        : candidate.money > 95 ? (aiCanSpendBroadly ? 3 : 2)
        : candidate.money > 60 ? 2
        : 1,
      cost: 0,
    };
    ad.cost = adCostFor(ad.scope, primaryTarget, ad.units);
    if (candidate.money >= ad.cost) {
      resolveAdBuy(state, candidate, ad);
    }
    if (candidate.money > 80 && Math.random() < (aiCanSpendBroadly ? 0.78 : 0.58)) {
      const secondaryState = targets[1] || primaryTarget;
      const followUpUnits = aiCanSpendBroadly && candidate.money > 150 ? 3 : candidate.money > 95 ? 2 : 1;
      const followUp = {
        scope: "state",
        state: secondaryState.abbr,
        type: "positive",
        opponent: selectAiAdTarget(candidate),
        issue: selectAutoAdIssue({
          scope: "state",
          state: secondaryState,
          type: "positive",
          targetStates: [secondaryState],
          mix,
        }),
        units: followUpUnits,
        cost: adCostFor("state", secondaryState, followUpUnits),
      };
      if (candidate.money >= followUp.cost) {
        resolveAdBuy(state, candidate, followUp);
      }
    }
  }
  applyDailyFatigue(aiRouteState, candidate, route);
  candidate.momentum = clamp(
    candidate.momentum + generalResult.bestMove * 0.38 + endorsementResult.support * 0.2 - 0.12,
    10,
    90
  );
  const fundraisingGain = computeFundraisingGain(candidate, fundraisingEffort);
  candidate.money += fundraisingGain;
  recordFundraisingRoundData(state, candidate.id, fundraisingEffort, fundraisingGain, computeFundraisingNarrativeValue(candidate, fundraisingEffort, fundraisingGain));
  const lines = [
    { title: "Campaign Watch", text: `${candidate.name} is leaning into ${ISSUE_LABELS[topIssuesFromMix(mix, 1)[0]]} across ${route.states.map(getStateName).join(", ")}.` },
    { title: "Campaign Watch", text: `${candidate.name} split the day between fundraising, local backing, and campaigning across ${route.states.map(getStateName).join(", ")}.` },
  ];
  if (candidate.money > 40) {
    lines.unshift({
      title: "Campaign Watch",
      text: shouldAiGoNegative(candidate)
        ? `${candidate.name} is attacking the frontrunner across the ${isPrimaryMode(state) ? getCurrentStageLabel(state) : getCurrentRegionName(state)} map.`
        : `${candidate.name} is increasing ad spending around ${getStateName(primaryTarget.abbr)}.`,
    });
  }
  return lines.slice(0, 3);
}

function maybeTriggerNewsEvent(state) {
  if (state.activeBuzz) {
    state.activeBuzz.roundsLeft -= 1;
    if (state.activeBuzz.roundsLeft <= 0) {
      state.activeBuzz = null;
    }
  }
  if (Math.random() > 0.42) {
    return;
  }
  const event = ISSUE_EVENT_POOL[Math.floor(Math.random() * ISSUE_EVENT_POOL.length)];
  state.activeBuzz = { ...event, region: getCurrentStageLabel(state), roundsLeft: 2 };
  state.eventLog = [{ title: "News Cycle", text: event.headline }, ...state.eventLog].slice(0, 14);
}

function resolveRoundDebate(state) {
  const regionStates = getCurrentRoundStatesForResolution(state);
  const regionIssue = topIssueAcrossStates(regionStates);
  const scores = state.candidates.map((candidate) => ({
    candidate,
    score:
      candidate.stats.debateSkill * 1.7 +
      candidate.stats.discipline * 0.8 +
      candidate.momentum * 0.05 +
      candidate.issueCredibility[regionIssue] * 20 -
      candidate.fatigue * 0.07,
  })).sort((a, b) => b.score - a.score);
  const winner = scores[0].candidate;
  const loser = scores[scores.length - 1].candidate;
  regionStates.forEach((targetState) => {
    positiveShift(targetState, winner.id, round1(randomBetween(0.2, 0.65)));
    negativeShift(targetState, loser.id, round1(randomBetween(0.1, 0.4)));
  });
  winner.favorability = clamp(winner.favorability + 0.8, 12, 92);
  loser.favorability = clamp(loser.favorability - 0.9, 12, 92);
  const totalScore = scores.reduce((sum, entry) => sum + entry.score, 0);
  const snap = scores.map((entry) => `${entry.candidate.name}: ${Math.round((entry.score / totalScore) * 100)}%`).join(" | ");
  const summary = `${winner.name} had the strongest debate on ${ISSUE_LABELS[regionIssue]}. ${loser.name} had the weakest debate night. Snap poll: ${snap}.`;
  state.eventLog = [{ title: `${getCurrentStageLabel(state)} Debate`, text: summary }, ...state.eventLog].slice(0, 14);
  return { winner, loser, summary, regionIssue };
}

function resolvePrimaryMomentumCarryover(state) {
  ensureRoundExpectations(state);
  ensureRoundFundraisingLedger(state);
  const snapshot = state.ui.roundExpectations;
  if (!snapshot?.states) {
    return null;
  }

  const roundStates = getCurrentRoundStatesForResolution(state);
  const currentStateSet = new Set(roundStates.map((item) => item.abbr));
  const scoreByCandidate = Object.fromEntries(state.candidates.map((candidate) => [candidate.id, 0]));
  const favorabilityByCandidate = Object.fromEntries(state.candidates.map((candidate) => [candidate.id, 0]));
  const spotlightMentions = [];

  roundStates.forEach((targetState) => {
    const expected = snapshot.states[targetState.abbr];
    if (!expected?.rankings?.length) {
      return;
    }
    const expectedMap = Object.fromEntries(
      expected.rankings.map((entry) => [entry.candidateId, entry])
    );
    const actualRankings = sortSupportEntries(targetState.currentSupport).map(([candidateId, share], index) => ({
      candidateId,
      rank: index + 1,
      share,
    }));
    const actualMap = Object.fromEntries(actualRankings.map((entry) => [entry.candidateId, entry]));
    const stateWeight =
      0.72 +
      Math.min(0.42, targetState.electoralVotes / 50) +
      (PRIMARY_EARLY_SPOTLIGHT_STATES[targetState.abbr] || 0) * 1.8;

    state.candidates.forEach((candidate) => {
      const expectedEntry = expectedMap[candidate.id] || { rank: state.candidates.length, share: 0 };
      const actualEntry = actualMap[candidate.id] || { rank: state.candidates.length, share: 0 };
      const shareDelta = actualEntry.share - expectedEntry.share;
      let performance =
        (expectedEntry.rank - actualEntry.rank) * 1.4 +
        shareDelta * 0.18;
      let favorabilityImpact = clamp(shareDelta * 0.018, -0.45, 0.45);

      if (expectedEntry.rank === 1 && actualEntry.rank > 1) {
        performance -= 1.15 * (actualEntry.rank - 1);
        favorabilityImpact -= 0.18 * Math.min(2, actualEntry.rank - 1);
      }
      if (expectedEntry.rank > 1 && actualEntry.rank === 1) {
        performance += 1.6;
        favorabilityImpact += 0.28;
      }
      if (
        actualEntry.rank === 2 &&
        expectedEntry.rank >= 3 &&
        actualEntry.share >= (actualRankings[0]?.share || 0) - 1.4
      ) {
        performance += 0.9;
        favorabilityImpact += 0.14;
      }
      if (candidate.homeState === targetState.abbr) {
        if (actualEntry.rank === 1) {
          performance += expectedEntry.rank > 1 ? 1.1 : 0.6;
          favorabilityImpact += 1 + Math.max(0, shareDelta) * 0.025;
        } else {
          const homeStatePenalty = expectedEntry.rank === 1 ? 3.2 : 2.1;
          performance -= homeStatePenalty + Math.max(0, actualEntry.rank - 1) * 0.5;
          favorabilityImpact -= expectedEntry.rank === 1 ? 2.8 : 1.7;
          if (shareDelta < -4) {
            performance -= 0.9;
            favorabilityImpact -= 0.8;
          }
          if (expectedEntry.rank <= 2) {
            spotlightMentions.unshift(`${candidate.name} stumbled in home-state ${targetState.name}`);
          }
        }
      }
      scoreByCandidate[candidate.id] += performance * stateWeight;
      favorabilityByCandidate[candidate.id] += favorabilityImpact * Math.max(0.7, stateWeight * 0.78);
    });

    const expectedLeader = expected.rankings[0];
    const actualLeader = actualRankings[0];
    const actualRunnerUp = actualRankings[1];
    const winningMargin = actualLeader && actualRunnerUp ? round1(actualLeader.share - actualRunnerUp.share) : null;
    if (expectedLeader && actualLeader && expectedLeader.candidateId !== actualLeader.candidateId) {
      if (winningMargin !== null && winningMargin <= 0.5) {
        scoreByCandidate[actualLeader.candidateId] += 1.4 * stateWeight;
        scoreByCandidate[actualRunnerUp.candidateId] -= 1.1 * stateWeight;
        spotlightMentions.push(
          `${getCandidateById(actualLeader.candidateId).name} came from behind to steal ${targetState.name} by just ${winningMargin.toFixed(1)}`
        );
      }
      spotlightMentions.push(
        `${getCandidateById(actualLeader.candidateId).name} beat the early read in ${targetState.name}`
      );
    } else if (
      expectedLeader &&
      actualLeader &&
      actualLeader.rank === 1 &&
      actualRankings[1] &&
      actualRankings[1].share >= actualLeader.share - 1.2 &&
      expectedMap[actualRankings[1].candidateId]?.rank >= 3
    ) {
      spotlightMentions.push(
        `${getCandidateById(actualRankings[1].candidateId).name} turned ${targetState.name} into a much tighter fight than expected`
      );
    }
  });

  roundStates.forEach((targetState) => {
    const rankings = sortSupportEntries(targetState.visiblePolls);
    const winnerId = rankings[0]?.[0] || "";
    const runnerUpId = rankings[1]?.[0] || "";
    const winnerShare = rankings[0]?.[1] || 0;
    const runnerUpShare = rankings[1]?.[1] || 0;
    const winningMargin = round1(winnerShare - runnerUpShare);
    const spotlightWeight = 0.9 + Math.min(1.8, targetState.electoralVotes / 22);
    if (winnerId) {
      scoreByCandidate[winnerId] += (2.4 + targetState.electoralVotes / 28 + Math.max(0, winningMargin) * 0.07) * spotlightWeight;
      favorabilityByCandidate[winnerId] += 0.35 + Math.min(0.9, targetState.electoralVotes / 65);
    }
    if (runnerUpId) {
      scoreByCandidate[runnerUpId] -= (0.8 + Math.max(0, winningMargin) * 0.03) * spotlightWeight;
    }
    rankings.slice(2).forEach(([candidateId, share], index) => {
      const finishRank = index + 3;
      const gapToLeader = Math.max(0, winnerShare - share);
      const earlyPenaltyWeight = 1 + (PRIMARY_EARLY_SPOTLIGHT_STATES[targetState.abbr] || 0) * 0.55;
      const finishPenalty =
        (finishRank === 3 ? 1.6 : 2.3) +
        gapToLeader * 0.045 +
        targetState.electoralVotes / 60;
      scoreByCandidate[candidateId] -= finishPenalty * earlyPenaltyWeight;
      if (finishRank >= 4 || gapToLeader >= 8) {
        favorabilityByCandidate[candidateId] -= 0.45 * earlyPenaltyWeight;
      }
    });
  });

  const fundraisingEntries = state.candidates.map((candidate) => {
    const ledger = state.ui.roundFundraisingLedger[candidate.id] || { cash: 0, narrative: 0, effort: 0, days: 0 };
    const expectedPerPoint = 0.95 + candidate.stats.fundraising * 0.12;
    const actualPerPoint = ledger.effort > 0 ? ledger.cash / ledger.effort : 0;
    const narrativeScore = ledger.narrative || 0;
    const fundraisingScore =
      (ledger.effort > 0 ? (actualPerPoint - expectedPerPoint) * 0.45 : 0) +
      narrativeScore * 1.15 +
      Math.max(0, ledger.cash - 35) * 0.012;
    return { candidate, ledger, fundraisingScore: round1(fundraisingScore) };
  });
  const averageFundraisingScore = fundraisingEntries.reduce((sum, entry) => sum + entry.fundraisingScore, 0) / Math.max(1, fundraisingEntries.length);
  fundraisingEntries.forEach((entry) => {
    const delta = clamp((entry.fundraisingScore - averageFundraisingScore) * 0.4, -1.4, 1.1);
    scoreByCandidate[entry.candidate.id] += delta;
    favorabilityByCandidate[entry.candidate.id] += clamp((entry.fundraisingScore - averageFundraisingScore) * 0.08, -0.22, 0.18);
  });
  const topFundraiser = [...fundraisingEntries].sort((a, b) => b.fundraisingScore - a.fundraisingScore || b.ledger.cash - a.ledger.cash)[0];
  if (topFundraiser && topFundraiser.ledger.effort > 0 && topFundraiser.fundraisingScore > averageFundraisingScore + 0.3) {
    spotlightMentions.push(
      `${topFundraiser.candidate.name} also posted the strongest fundraising read of the window`
    );
  }

  const deltas = state.candidates.map((candidate) => {
    const momentumBefore = candidate.momentum;
    const raw = scoreByCandidate[candidate.id] || 0;
    const intendedDelta = round1(clamp(raw * 0.5, -9, 9));
    candidate.momentum = clamp(candidate.momentum + intendedDelta, 10, 90);
    const momentumAfter = candidate.momentum;
    const delta = round1(momentumAfter - momentumBefore);
    const publicImageShift = round1(clamp((favorabilityByCandidate[candidate.id] || 0), -4.5, 4.5));
    candidate.favorability = clamp(candidate.favorability + publicImageShift, 12, 92);
    applyPrimaryNarrativeShift(state, candidate, intendedDelta, currentStateSet);
    return { candidate, delta, intendedDelta, publicImageShift, momentumBefore, momentumAfter };
  }).sort((a, b) => b.delta - a.delta);

  const top = deltas[0];
  const bottom = deltas[deltas.length - 1];
  const playerDelta = deltas.find((entry) => entry.candidate.id === state.playerId);
  const playerRead = playerDelta
    ? playerDelta.delta >= 1.2
      ? `You beat expectations and left the round with a real narrative push (+${playerDelta.delta.toFixed(1)} momentum).`
      : playerDelta.delta <= -1.2
        ? `You came in softer than the early read and paid for it in the chatter (${playerDelta.delta.toFixed(1)} momentum).`
        : `You performed close to the early read and left the round with only a small momentum adjustment (${playerDelta.delta >= 0 ? "+" : ""}${playerDelta.delta.toFixed(1)}).`
    : "";
  const playerFunding = fundraisingEntries.find((entry) => entry.candidate.id === state.playerId);
  const playerFundingRead = playerFunding?.ledger.effort
    ? playerFunding.fundraisingScore > averageFundraisingScore + 0.4
      ? `Your fundraising week also landed as a visible show of support, which added to the bounce.`
      : playerFunding.fundraisingScore < averageFundraisingScore - 0.4
        ? `Your fundraising never fully turned into a strength signal, which softened the carryover a bit.`
        : `Fundraising helped mostly on the margin: useful cash, but not a giant narrative shock.`
    : "";

  const cliffhangerResult = roundStates
    .map((targetState) => {
      const rankings = sortSupportEntries(targetState.visiblePolls);
      const expected = snapshot.states[targetState.abbr];
      const expectedLeaderId = expected?.rankings?.[0]?.candidateId || "";
      const margin = rankings[1] ? round1(rankings[0][1] - rankings[1][1]) : null;
      return {
        targetState,
        expectedLeaderId,
        actualLeaderId: rankings[0]?.[0] || "",
        runnerUpId: rankings[1]?.[0] || "",
        margin,
      };
    })
    .find((entry) => entry.margin !== null && entry.margin <= 0.5);
  const cliffhangerRead = cliffhangerResult
    ? `${getCandidateById(cliffhangerResult.actualLeaderId).name} closed ${cliffhangerResult.targetState.name} with only a ${cliffhangerResult.margin.toFixed(1)}-point edge, which is exactly the kind of finish the press treats like a launch pad.`
    : "";

  const body = [
    `${top.candidate.name} had the best expectation-adjusted round (${top.delta >= 0 ? "+" : ""}${top.delta.toFixed(1)} momentum), while ${bottom.candidate.name} took the sharpest narrative hit (${bottom.delta.toFixed(1)}).`,
    spotlightMentions[0] ? `${spotlightMentions[0]}.` : "",
    cliffhangerRead,
    playerRead,
    playerFundingRead,
  ].filter(Boolean).join(" ");

  state.eventLog = [{ title: "Momentum Watch", text: body }, ...state.eventLog].slice(0, 14);
  return { body, deltas, top, bottom };
}

function applyPrimaryNarrativeShift(state, candidate, delta, currentStateSet) {
  if (Math.abs(delta) < 0.8) {
    return;
  }
  const carry = Math.min(0.45, Math.abs(delta) * 0.055);
  state.states.forEach((targetState) => {
    if (currentStateSet.has(targetState.abbr)) {
      return;
    }
    const profile = getPrimaryStateProfile(targetState.abbr);
    const receptivity =
      0.78 +
      (profile?.core?.mediaDriven || 0) * 0.24 +
      (profile?.core?.electabilityFocus || 0) * 0.28 +
      (profile?.secondary?.volatility || 0) * 0.14;
    const move = round1(carry * receptivity);
    if (delta > 0) {
      positiveShift(targetState, candidate.id, move);
      targetState.enthusiasm[candidate.id] = clamp(targetState.enthusiasm[candidate.id] + delta * 0.35, 10, 100);
    } else {
      negativeShift(targetState, candidate.id, move);
      targetState.enthusiasm[candidate.id] = clamp(targetState.enthusiasm[candidate.id] + delta * 0.25, 10, 100);
    }
  });
}

function buildRoundRecapCards(state, debate, playerLog, momentumSummary = null, delegateSummary = null) {
  const player = getPlayerCandidate();
  const hottest = state.activeBuzz ? ISSUE_LABELS[state.activeBuzz.key] : ISSUE_LABELS[topIssueAcrossStates(getCurrentRoundStatesForResolution(state))];
  const cards = [
    { heading: "Debate Read", body: debate.summary },
    { heading: "What Defined The Round", body: `${hottest} did most of the agenda-setting. Your campaign spent the round building around ${ISSUE_LABELS[topIssuesFromMix(player.definedIssueUsage, 1)[0]]}, and your public style is reading as ${player.style.toLowerCase()}.` },
  ];
  if (momentumSummary?.deltas?.length) {
    cards.splice(1, 0, {
      heading: "Momentum Swing",
      body: buildMomentumRecapBody(state, momentumSummary),
    });
  }
  return cards;
}

function buildMomentumRecapBody(state, momentumSummary) {
  return momentumSummary.deltas
    .sort((a, b) => b.momentumAfter - a.momentumAfter || b.delta - a.delta)
    .map((entry) => `${entry.candidate.name}: ${entry.momentumBefore.toFixed(1)} -> ${entry.momentumAfter.toFixed(1)} (${entry.delta >= 0 ? "+" : ""}${entry.delta.toFixed(1)})`)
    .join("<br />");
}

function buildResolvedWindowRead(delegateSummary, player) {
  const playerAward = delegateSummary.awards.find((award) => award.winner.id === player.id || award.runnerUp?.id === player.id);
  if (!playerAward) {
    const firstAward = delegateSummary.awards[0];
    return `${firstAward.state.name} is settled now. ${buildPrimaryHeadline(firstAward.state, firstAward.winner, firstAward.runnerUp, firstAward.margin)}`;
  }
  if (playerAward.winner.id === player.id) {
    return `${playerAward.state.name} is settled now. You held on there by ${playerAward.margin.toFixed(1)} and banked ${playerAward.state.electoralVotes} delegates.`;
  }
  return `${playerAward.state.name} is settled now. ${playerAward.winner.name} beat you there by ${playerAward.margin.toFixed(1)} and took ${playerAward.state.electoralVotes} delegates.`;
}

function continueToNextRound() {
  if (!gameState?.ui.roundRecap) {
    return;
  }
  if (gameState.ui.roundRecap.nextAction === "election") {
    startElectionNight();
    return;
  }
  gameState.roundIndex += 1;
  gameState.turnInRound = 1;
  gameState.ui.roundRecap = null;
  gameState.ui.momentumSummary = null;
  gameState.ui.activeItineraryId = "";
  gameState.ui.plannedAds = [];
  gameState.ui.roundFundraisingLedger = {};
  gameState.states.forEach((state) => {
    state.adPressure = {};
  });
  gameState.ui.selectedState = getCurrentRoundStateAbbrs(gameState)[0] || gameState.states[0]?.abbr || "";
  gameState.ui.roundExpectations = captureRoundExpectations(gameState);
  resetBrandDriftState(gameState);
  ensureRoundFundraisingLedger(gameState);
  gameState.dayPlan.rallyCount = 0;
  gameState.dayPlan.rallies = [];
  normalizeStateEffortPlan(gameState);
  renderGame();
}

function awardPrimaryWindowDelegates(state) {
  const roundStates = getCurrentRoundStatesForResolution(state);
  const awards = [];
  roundStates.forEach((targetState) => {
    if (targetState.primaryAwarded) {
      return;
    }
    finalizePrimaryResult(state, targetState);
    const winnerId = sortSupportEntries(targetState.visiblePolls)[0]?.[0];
    const winner = getCandidateById(winnerId);
    const runnerUpId = sortSupportEntries(targetState.visiblePolls)[1]?.[0] || "";
    const runnerUp = getCandidateById(runnerUpId);
    const winnerShare = targetState.visiblePolls[winnerId] || 0;
    const runnerUpShare = runnerUpId ? (targetState.visiblePolls[runnerUpId] || 0) : 0;
    const margin = round1(winnerShare - runnerUpShare);
    if (!winner) {
      return;
    }
    winner.delegatesWon = (winner.delegatesWon || 0) + targetState.electoralVotes;
    targetState.primaryAwarded = true;
    targetState.primaryWinnerId = winnerId;
    awards.push({ state: targetState, winner, runnerUp, winnerShare, runnerUpShare, margin });
  });
  if (!awards.length) {
    return null;
  }
  awards.forEach(({ state: targetState, winner, runnerUp, margin }) => {
    state.eventLog = [{
      title: `${targetState.name} delegates`,
      text: buildPrimaryHeadline(targetState, winner, runnerUp, margin),
    }, ...state.eventLog].slice(0, 14);
  });
  const body = awards.map(({ state: targetState, winner, runnerUp, margin }) => buildPrimaryHeadline(targetState, winner, runnerUp, margin)).join(" ");
  return { body, awards };
}

function buildPrimaryHeadline(targetState, winner, runnerUp, margin) {
  if (runnerUp && Number.isFinite(margin)) {
    return `${winner.name} narrowly defeats ${runnerUp.name} in ${targetState.name} by ${margin.toFixed(1)}% and takes ${targetState.electoralVotes} delegates.`;
  }
  return `${winner.name} wins ${targetState.name} and takes ${targetState.electoralVotes} delegates.`;
}

function finalizePrimaryResult(game, targetState) {
  if (!isPrimaryMode(game) || targetState.finalResult) {
    return targetState.finalResult;
  }
  const result = {};
  const supportKeys = Object.keys(targetState.currentSupport);
  const supportSum = supportKeys.reduce((sum, key) => sum + (targetState.currentSupport[key] || 0), 0) || 1;
  const visibleRanking = sortSupportEntries(targetState.visiblePolls || {});
  const visibleLeaderId = visibleRanking[0]?.[0] || "";
  const visibleLeaderShare = visibleRanking[0]?.[1] || 0;
  const visibleRunnerUpShare = visibleRanking[1]?.[1] || 0;
  const visibleLead = round1(visibleLeaderShare - visibleRunnerUpShare);
  const undecided = targetState.undecided || 0;
  const moe = targetState.pollingError || 0;
  const lookedClosed = visibleLead >= undecided + moe * 0.65;
  const lookedVeryClosed = visibleLead >= undecided + moe * 1.15;
  let playerCloseBonus = 0;
  if (visibleLeaderId === game.playerId) {
    const stateEffort = getStateEffortValue(game, targetState.abbr);
    const adSupport = (game.ui?.plannedAds || []).some((ad) => {
      const targets = getAdTargetStates(ad, game);
      return targets.some((item) => item.abbr === targetState.abbr);
    });
    if (stateEffort >= 60) {
      playerCloseBonus += 0.7;
    } else if (stateEffort >= 35) {
      playerCloseBonus += 0.35;
    }
    if (adSupport) {
      playerCloseBonus += 0.25;
    }
  }
  supportKeys.forEach((candidateId) => {
    const baseSupport = targetState.currentSupport[candidateId] || 0;
    const shareOfUndecideds = targetState.undecided * (baseSupport / supportSum);
    const enthusiasmLift = ((targetState.enthusiasm[candidateId] || 50) - 50) * 0.012;
    const closeBonus = lookedVeryClosed
      ? candidateId === visibleLeaderId ? 1.5 + playerCloseBonus : -0.45
      : lookedClosed
        ? candidateId === visibleLeaderId ? 0.8 + playerCloseBonus : -0.22
        : 0;
    result[candidateId] = round1(Math.max(0, baseSupport + shareOfUndecideds + enthusiasmLift + closeBonus));
  });
  const ranking = Object.entries(result).sort((a, b) => b[1] - a[1]);
  if (ranking[0]) {
    result[ranking[0][0]] = round1(result[ranking[0][0]] + 100 - Object.values(result).reduce((sum, value) => sum + value, 0));
  }
  Object.keys(result).forEach((candidateId) => {
    targetState.currentSupport[candidateId] = result[candidateId];
    targetState.visiblePolls[candidateId] = result[candidateId];
  });
  targetState.undecided = 0;
  targetState.finalResult = {
    shares: { ...result },
    winnerId: ranking[0]?.[0] || "",
  };
  return targetState.finalResult;
}

function startElectionNight() {
  if (!gameState.electionNight) {
    const resolvedStates = gameState.states.map((state) => {
      const electionShares = {};
      gameState.candidates.forEach((candidate) => {
        const enthusiasmMod = (state.enthusiasm[candidate.id] - 50) * 0.02;
        electionShares[candidate.id] = clamp(
          state.currentSupport[candidate.id] + randomBetween(-2.1, 2.1) + enthusiasmMod,
          0,
          80
        );
      });
      const winnerId = sortSupportEntries(electionShares)[0][0];
      return {
        abbr: state.abbr,
        name: state.name,
        electoralVotes: state.electoralVotes,
        winnerId,
        shares: electionShares,
        called: false,
      };
    });
    const callOrder = resolvedStates.slice().sort((a, b) => b.electoralVotes - a.electoralVotes || a.name.localeCompare(b.name)).map((item) => item.abbr);
    gameState.electionNight = {
      states: resolvedStates,
      order: callOrder,
      index: 0,
      totals: Object.fromEntries(gameState.candidates.map((candidate) => [candidate.id, 0])),
      log: [],
      winnerId: "",
    };
  }
  showScreen("election");
  renderElectionNight();
}

function renderElectionNight() {
  const election = gameState.electionNight;
  const winner = election.winnerId ? getCandidateById(election.winnerId) : null;
  const primaryMode = isPrimaryMode(gameState);
  elements["election-title"].textContent = winner
    ? `${winner.name} Has The ${primaryMode ? "Nomination" : "Lead On The Map"}`
    : primaryMode
      ? "The Primary Calendar Is Closing"
      : "The States Are Closing";
  elements["election-winner-banner"].textContent = winner
    ? primaryMode
      ? `${winner.name} finishes the calendar on top and claims the nomination.`
      : `${winner.name} has cleared 270 and claims the presidency.`
    : primaryMode
      ? "No candidate has closed the calendar with a clean clinch yet. Keep calling states."
      : "No candidate has clinched 270 yet. Keep calling states.";
  elements["election-scoreboard"].innerHTML = gameState.candidates.map((candidate) => `
    <article class="card candidate-card ${candidate.id === gameState.playerId ? "player-card" : ""}">
      <div class="candidate-card-top">
        ${renderPortrait(candidate)}
        <div>
          <h3>${candidate.name}</h3>
          <p class="hint">${candidate.archetype}</p>
        </div>
      </div>
      <div class="metric-pill"><span>${primaryMode ? "Map Points" : "Electoral Votes"}</span><strong>${election.totals[candidate.id]}</strong></div>
    </article>
  `).join("");
  elements["call-log"].innerHTML = election.log.map((item) => `
    <article class="call-card">
      <h4>${item.title}</h4>
      <p>${item.text}</p>
    </article>
  `).join("");
  elements["state-results-grid"].innerHTML = election.states.map((state) => `
    <article class="note ${state.called ? "" : "pending-state"}">
      <p class="eyebrow">${state.name}</p>
      <p>${state.called ? `${getCandidateById(state.winnerId).name} wins ${state.electoralVotes} ${primaryMode ? "delegates" : "EV"}.` : "Not called yet."}</p>
    </article>
  `).join("");
  const finished = election.index >= election.order.length;
  elements["call-next-button"].disabled = finished;
  elements["call-all-button"].disabled = finished;
}

function callNextState() {
  const election = gameState.electionNight;
  if (!election || election.index >= election.order.length) {
    return;
  }
  const abbr = election.order[election.index];
  const state = election.states.find((item) => item.abbr === abbr);
  state.called = true;
  election.totals[state.winnerId] += state.electoralVotes;
  election.log.unshift({
    title: `${state.name} called`,
    text: `${getCandidateById(state.winnerId).name} takes ${state.electoralVotes} ${isPrimaryMode(gameState) ? "delegates" : "electoral votes"}.`,
  });
  election.index += 1;
  if (isPrimaryMode(gameState)) {
    if (election.index >= election.order.length) {
      election.winnerId = Object.entries(election.totals)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "";
    }
  } else {
    const winnerEntry = Object.entries(election.totals).find(([, total]) => total >= 270);
    if (winnerEntry) {
      election.winnerId = winnerEntry[0];
    }
  }
  saveGame();
  renderElectionNight();
}

function callAllStates() {
  while (gameState.electionNight && gameState.electionNight.index < gameState.electionNight.order.length) {
    callNextState();
  }
}

function saveGame() {
  if (!gameState) {
    return;
  }
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
    maybeShowSaveButton();
  } catch (error) {
    console.error("Save failed", error);
  }
}

function loadSavedGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    return;
  }
  const parsed = JSON.parse(raw);
  if (!parsed.version || parsed.version < GAME_VERSION) {
    alert("That save belongs to an older version of the game. Start a fresh campaign for the new schedule and planning system.");
    return;
  }
  gameState = hydrateGameState(parsed);
  if (gameState.electionNight) {
    showScreen("election");
    renderElectionNight();
    return;
  }
  showScreen("game");
  renderGame();
}

function openPosterModal(id) {
  const candidate = gameState?.candidates.find((item) => item.id === id) || AI_POOL.find((item) => item.id === id);
  if (!candidate?.poster) {
    return;
  }
  elements["poster-title"].textContent = candidate.name;
  elements["poster-image"].src = candidate.poster;
  elements["poster-image"].alt = `${candidate.name} campaign poster`;
  elements["poster-modal"].classList.remove("hidden");
}

function closePosterModal() {
  elements["poster-modal"].classList.add("hidden");
}

function renderCampaignManual() {
  if (!elements["manual-body"]) {
    return;
  }
  const candidateCards = CAMPAIGN_MANUAL.candidateCards.map((candidate) => `
    <article class="manual-candidate-card">
      <h5>${candidate.name}</h5>
      <p>${candidate.summary}</p>
      <ul class="manual-list">
        ${candidate.tips.map((tip) => `<li>${tip}</li>`).join("")}
      </ul>
    </article>
  `).join("");

  const sections = CAMPAIGN_MANUAL.sections.map((section) => `
    <section class="manual-section">
      <h4>${section.title}</h4>
      ${(section.paragraphs || []).map((paragraph) => `<p>${paragraph}</p>`).join("")}
      ${section.bullets?.length ? `<ul class="manual-list">${section.bullets.map((item) => `<li>${item}</li>`).join("")}</ul>` : ""}
    </section>
  `).join("");

  elements["manual-body"].innerHTML = `
    <section class="manual-intro">
      <p>${CAMPAIGN_MANUAL.intro}</p>
    </section>
    <section class="manual-section">
      <h4>Choosing A Candidate</h4>
      <p>Your first strategic choice is the candidate. Pick the lane that matches the kind of map you want to run and the kinds of mistakes you can recover from.</p>
      <div class="manual-candidate-grid">${candidateCards}</div>
    </section>
    ${sections}
  `;
}

function openManualModal() {
  renderCampaignManual();
  document.body.style.overflow = "hidden";
  elements["manual-modal"]?.classList.remove("hidden");
}

function closeManualModal() {
  document.body.style.overflow = "";
  elements["manual-modal"]?.classList.add("hidden");
}

function getCurrentRegionName(state = gameState) {
  return REGION_SEQUENCE[state?.roundIndex || 0];
}

function getPriorityRegionName(state = gameState) {
  if (isPrimaryMode(state)) {
    return "South";
  }
  return getCurrentRegionName(state) === "Final National Push" ? "South" : getCurrentRegionName(state);
}

function getPriorityBucketName(targetState) {
  if (!targetState) {
    return getPriorityRegionName();
  }
  return isPrimaryMode() ? targetState.region : getPriorityRegionName();
}

function getCurrentRoundStateAbbrs(state = gameState) {
  if (isPrimaryMode(state)) {
    const sourceStates = state?.states || gameState?.states || [];
    return (getCurrentPrimaryWindow(state)?.stateAbbrs || []).filter((abbr) => {
      const targetState = sourceStates.find((item) => item.abbr === abbr);
      return !targetState?.primaryAwarded;
    });
  }
  const regionName = getCurrentRegionName(state);
  return regionName === "Final National Push" ? STATE_DATA.map(([abbr]) => abbr) : REGIONS[regionName].states;
}

function getCurrentRoundStateAbbrsForResolution(state = gameState) {
  if (isPrimaryMode(state)) {
    return getCurrentPrimaryWindow(state)?.stateAbbrs || [];
  }
  return getCurrentRoundStateAbbrs(state);
}

function getCurrentRoundStates(state = gameState) {
  const sourceStates = state?.states || gameState?.states || [];
  return getCurrentRoundStateAbbrs(state)
    .map((abbr) => sourceStates.find((item) => item.abbr === abbr) || null)
    .filter(Boolean);
}

function getCurrentRoundStatesForResolution(state = gameState) {
  const sourceStates = state?.states || gameState?.states || [];
  return getCurrentRoundStateAbbrsForResolution(state)
    .map((abbr) => sourceStates.find((item) => item.abbr === abbr) || null)
    .filter(Boolean);
}

function getUpcomingRoundStateAbbrs(state = gameState) {
  if (isPrimaryMode(state)) {
    const sourceStates = state?.states || gameState?.states || [];
    return (PRIMARY_TURN_WINDOWS[(state?.roundIndex || 0) + 1]?.stateAbbrs || []).filter((abbr) => {
      const targetState = sourceStates.find((item) => item.abbr === abbr);
      return !targetState?.primaryAwarded;
    });
  }
  const nextRegion = REGION_SEQUENCE[(state?.roundIndex || 0) + 1];
  return nextRegion ? REGIONS[nextRegion]?.states || [] : [];
}

function getCampaignPlanningStateAbbrs(state = gameState) {
  return uniqueArray([...getCurrentRoundStateAbbrs(state), ...getUpcomingRoundStateAbbrs(state)]);
}

function getCampaignPlanningStates(state = gameState) {
  const sourceStates = state?.states || gameState?.states || [];
  return getCampaignPlanningStateAbbrs(state)
    .map((abbr) => sourceStates.find((item) => item.abbr === abbr) || null)
    .filter(Boolean);
}

function getResolvedPrimaryStates(state = gameState) {
  return (state?.states || [])
    .filter((item) => item.primaryAwarded && item.finalResult)
    .sort((a, b) => {
      const roundIndexA = PRIMARY_TURN_WINDOWS.findIndex((window) => window.stateAbbrs.includes(a.abbr));
      const roundIndexB = PRIMARY_TURN_WINDOWS.findIndex((window) => window.stateAbbrs.includes(b.abbr));
      if (roundIndexA !== roundIndexB) {
        return roundIndexB - roundIndexA;
      }
      return b.electoralVotes - a.electoralVotes || a.name.localeCompare(b.name);
    });
}

function planningStatePhase(abbr, state = gameState) {
  if (getCurrentRoundStateAbbrs(state).includes(abbr)) {
    return "current";
  }
  if (getUpcomingRoundStateAbbrs(state).includes(abbr)) {
    return "upcoming";
  }
  return "future";
}

function getVisiblePollStates() {
  if (gameState.ui.pollScope === "region" && isPrimaryMode(gameState) && gameState.ui.roundRecap) {
    return getCurrentRoundStatesForResolution(gameState);
  }
  if (gameState.ui.pollScope === "all") {
    return gameState.states;
  }
  if (gameState.ui.pollScope === "planning") {
    return getCampaignPlanningStates();
  }
  return getCurrentRoundStates();
}

function getStateByAbbr(abbr) {
  return gameState?.states.find((state) => state.abbr === abbr) || null;
}

function getCandidateById(id) {
  return gameState?.candidates.find((candidate) => candidate.id === id) || null;
}

function getPlayerCandidate() {
  return getCandidateById(gameState.playerId);
}

function primaryUnitLabel() {
  return isPrimaryMode() ? "Del" : "EV";
}

function primaryUnitWord() {
  return isPrimaryMode() ? "delegates" : "electoral votes";
}

function computeProjectedEv(candidateId) {
  return gameState.states.reduce((sum, state) => {
    const leader = sortSupportEntries(state.visiblePolls)[0];
    return sum + (leader[0] === candidateId ? state.electoralVotes : 0);
  }, 0);
}

function buildLiveStandings(state) {
  const electoralTotals = Object.fromEntries(state.candidates.map((candidate) => [candidate.id, 0]));
  const nationalTotals = Object.fromEntries(state.candidates.map((candidate) => [candidate.id, 0]));
  let nationalUndecided = 0;
  const totalWeight = state.states.reduce((sum, item) => sum + item.electoralVotes, 0) || 1;
  const states = state.states.map((item) => {
    const ranking = sortSupportEntries(item.visiblePolls);
    const leader = getCandidateById(ranking[0][0]);
    const runnerUp = ranking[1] ? getCandidateById(ranking[1][0]) : null;
    const margin = ranking[1] ? round1(ranking[0][1] - ranking[1][1]) : ranking[0][1];
    electoralTotals[leader.id] += item.electoralVotes;
    state.candidates.forEach((candidate) => {
      nationalTotals[candidate.id] += (item.visiblePolls[candidate.id] || 0) * item.electoralVotes;
    });
    nationalUndecided += item.undecided * item.electoralVotes;
    return {
      abbr: item.abbr,
      name: item.name,
      electoralVotes: item.electoralVotes,
      leader,
      runnerUp,
      leaderShare: ranking[0][1],
      margin,
      pollingError: item.pollingError,
    };
  }).sort((a, b) => b.electoralVotes - a.electoralVotes || a.name.localeCompare(b.name));
  const scoreboard = state.candidates.map((candidate) => ({
    candidate,
    electoralVotes: electoralTotals[candidate.id],
    nationalShare: nationalTotals[candidate.id] / totalWeight,
    isWinning: electoralTotals[candidate.id] === Math.max(...Object.values(electoralTotals)),
  })).sort((a, b) => b.electoralVotes - a.electoralVotes || b.nationalShare - a.nationalShare);
  return {
    scoreboard,
    states,
    nationalUndecided: nationalUndecided / totalWeight,
  };
}

function averagePollingError(states) {
  if (!states.length) {
    return 0;
  }
  return states.reduce((sum, state) => sum + state.pollingError, 0) / states.length;
}

function buildStatePressureSummary(state, candidateId = gameState?.playerId) {
  const ranking = sortSupportEntries(state.visiblePolls || {});
  const leaderId = ranking[0]?.[0] || "";
  const leaderShare = ranking[0]?.[1] || 0;
  const runnerUpId = ranking[1]?.[0] || "";
  const runnerUpShare = ranking[1]?.[1] || 0;
  const leaderName = getCandidateById(leaderId)?.name || "The leader";
  const runnerUpName = getCandidateById(runnerUpId)?.name || "the field";
  const playerName = getCandidateById(candidateId)?.name || "You";
  const playerShare = state.visiblePolls?.[candidateId] || 0;
  const leaderMargin = round1(Math.max(0, leaderShare - runnerUpShare));
  const playerGap = round1(Math.max(0, leaderId === candidateId ? leaderMargin : leaderShare - playerShare));
  const undecided = state.undecided || 0;
  const moe = state.pollingError || 0;
  const leadSoftByMoE = leaderMargin <= moe * 1.35;
  const leadSoftByUndecided = undecided >= 26;
  const leadLeanByMoE = leaderMargin <= moe * 2;
  const leadLeanByUndecided = undecided >= 16;
  const tossUpGap = Math.max(3.5, moe * 1.15);
  const reachableGap = Math.max(8, moe * 2.25);

  if (leaderId === candidateId) {
    if (leadSoftByMoE || leadSoftByUndecided) {
      return {
        statusKey: "soft-lead",
        className: "pressure-soft",
        label: "Soft Lead",
        shortText: `${playerName} leads, but ${undecided.toFixed(1)}% is still movable`,
        summary: `${playerName} is ahead, but the state is still loose. The lead is only ${leaderMargin.toFixed(1)} and ${undecided.toFixed(1)}% remains undecided, so one bad day could put ${runnerUpName} right back on top.`,
      };
    }
    if (leadLeanByMoE || leadLeanByUndecided) {
      return {
        statusKey: "lean-lead",
        className: "pressure-lean",
        label: "Lean Lead",
        shortText: `${playerName} leads by ${leaderMargin.toFixed(1)} with room left to close`,
        summary: `${playerName} has the edge, but the state still needs maintenance. The lead is real, yet ${undecided.toFixed(1)}% of the vote is still out there and the margin is not fully banked.`,
      };
    }
    return {
      statusKey: "stable-lead",
      className: "pressure-stable",
      label: "Stable Lead",
      shortText: `${playerName} leads by ${leaderMargin.toFixed(1)} with little loose vote left`,
      summary: `${playerName} has a real cushion here. The lead is ${leaderMargin.toFixed(1)} with only ${undecided.toFixed(1)}% undecided, so this is closer to a protect-it state than a rescue job.`,
    };
  }

  if (playerGap <= tossUpGap) {
    return {
      statusKey: "toss-up",
      className: "pressure-tossup",
      label: "Toss-Up",
      shortText: `${leaderName} leads ${playerName} by ${playerGap.toFixed(1)}`,
      summary: `${leaderName} is ahead, but only by ${playerGap.toFixed(1)}. Between the margin of error and ${undecided.toFixed(1)}% undecided, this state is still there to be taken.`,
    };
  }
  if (undecided >= 20 && playerGap <= reachableGap) {
    return {
      statusKey: "reachable",
      className: "pressure-reachable",
      label: "Reachable",
      shortText: `${leaderName} leads by ${playerGap.toFixed(1)}, but undecideds are still live`,
      summary: `${leaderName} has the edge, but ${undecided.toFixed(1)}% undecided keeps this from being closed. You need a more concentrated push, not a surrender.`,
    };
  }
  return {
    statusKey: "behind",
    className: "pressure-behind",
    label: "Behind",
    shortText: `${leaderName} is separating from the field`,
    summary: `${leaderName} is leading by ${playerGap.toFixed(1)} and the easy persuadable vote is thinning out. This is becoming an expensive comeback unless the broader board shifts.`,
  };
}

function buildItineraries(state) {
  const roundStates = getCampaignPlanningStates(state);
  const currentSet = new Set(getCurrentRoundStateAbbrs(state));
  const routeSpan = isPrimaryMode(state) ? 4 : getCurrentRegionName(state) === "Northeast" ? 5 : 4;
  const highs = roundStates.filter((item) => (state.priorities[getPriorityBucketName(item)] || {})[item.abbr] === "high");
  const mediums = roundStates.filter((item) => (state.priorities[getPriorityBucketName(item)] || {})[item.abbr] === "medium");
  const sortedByNeed = roundStates.slice().sort((a, b) => {
    const currentBias = Number(currentSet.has(b.abbr)) - Number(currentSet.has(a.abbr));
    if (currentBias !== 0) {
      return currentBias;
    }
    return playerGapInState(a, state.playerId) - playerGapInState(b, state.playerId) || b.electoralVotes - a.electoralVotes;
  });
  const focus = highs.find((item) => currentSet.has(item.abbr)) || highs[0] || sortedByNeed[0];
  const balancedStates = uniqueArray([focus?.abbr, ...highs.slice(1, 2).map((item) => item.abbr), ...mediums.slice(0, 2).map((item) => item.abbr)].filter(Boolean));
  const broadStates = uniqueArray([
    ...highs.map((item) => item.abbr),
    ...mediums.slice(0, isPrimaryMode(state) ? 3 : getCurrentRegionName(state) === "Northeast" ? 4 : 3).map((item) => item.abbr),
    ...sortedByNeed.slice(0, 2).map((item) => item.abbr),
  ]).slice(0, routeSpan);
  const comebackFocus = sortedByNeed.find((item) => item.electoralVotes >= 10 && item.undecided > 26) || sortedByNeed[1] || focus;
  const balancedAnchor = getStateName((balancedStates[0] || focus?.abbr));
  const broadAnchor = getStateName((broadStates[0] || focus?.abbr));
  const itineraries = [
    makeItinerary("focus", `${getStateName(focus.abbr)} Lock-In`, [focus.abbr], "Concentrated day built to squeeze the most out of one major target."),
    makeItinerary("balanced", `${balancedAnchor} Priority Arc`, balancedStates.length ? balancedStates : [focus.abbr], "A cleaner two- or three-state route that follows your stated priorities without shredding the day."),
    makeItinerary("broad", `${broadAnchor} Sweep`, broadStates.length ? broadStates : roundStates.slice(0, 3).map((item) => item.abbr), "Broader coverage for a day when you want reach more than maximum local bite."),
    makeItinerary("pivot", `${getStateName(comebackFocus.abbr)} Pivot`, uniqueArray([comebackFocus.abbr, ...adjacentInRound(comebackFocus.abbr, state).slice(0, isPrimaryMode(state) ? 2 : getCurrentRegionName(state) === "Northeast" ? 3 : 2)]), "A flexible detour plan for a state that is big enough or close enough to justify a late-day pivot."),
  ];
  if (isPrimaryMode(state)) {
    const upcomingStates = roundStates.filter((item) => !currentSet.has(item.abbr));
    if (upcomingStates.length) {
      const upcomingFocus = highs.find((item) => !currentSet.has(item.abbr)) || upcomingStates[0];
      itineraries.push(
        makeItinerary(
          "ondeck",
          `${getStateName(upcomingFocus.abbr)} Early Build`,
          uniqueArray([upcomingFocus.abbr, ...upcomingStates.slice(1, 3).map((item) => item.abbr)]),
          "A forward-looking route that starts shaping the next window before it goes fully live."
        )
      );
    }
  }
  const deduped = [];
  const seen = new Set();
  itineraries.forEach((item) => {
    const key = item.states.join("|");
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
  });
  return deduped.slice(0, 4);
}

function itineraryStageLabel(state) {
  if (!isPrimaryMode(state)) {
    return getCurrentStageLabel(state);
  }
  const liveStates = getCurrentRoundStates(state);
  const upcomingStates = getUpcomingRoundStateAbbrs(state)
    .map((abbr) => (state?.states || gameState?.states || []).find((item) => item.abbr === abbr))
    .filter(Boolean);
  const labelStates = liveStates.length ? liveStates : upcomingStates;
  if (!labelStates.length) {
    return getCurrentStageLabel(state);
  }
  if (labelStates.length === 1) {
    return labelStates[0].name;
  }
  if (labelStates.length === 2) {
    return `${labelStates[0].name} / ${labelStates[1].name}`;
  }
  return `${labelStates[0].name} Cluster`;
}

function makeItinerary(id, title, states, summary) {
  const travelLoad = states.reduce((sum, abbr) => sum + travelWeightForState(abbr, getRegionForState(abbr)), 0);
  const efficiency = clamp(1.16 - travelLoad * 0.08, 0.74, 1.08);
  let efficiencyLabel = "Efficient Route";
  if (travelLoad > 5.2) {
    efficiencyLabel = "Brutal Travel Day";
  } else if (travelLoad > 4.2) {
    efficiencyLabel = "Overextended";
  } else if (travelLoad > 3.2) {
    efficiencyLabel = "Busy Route";
  }
  return { id, title, states, summary, efficiency, efficiencyLabel, travelLoad };
}

function ensureItinerarySelection(state) {
  const valid = state.ui.itineraryOptions.some((option) => option.id === state.ui.activeItineraryId);
  if (!valid) {
    state.ui.activeItineraryId = state.ui.itineraryOptions[0]?.id || "";
  }
  trimRalliesToCount(state, true);
}

function getActiveItinerary(state) {
  return getDerivedPlanningRoute(state);
}

function trimRalliesToCount(state, forceFill = false) {
  state.dayPlan.rallies = state.dayPlan.rallies.slice(0, Number(state.dayPlan.rallyCount || 0));
  if (forceFill) {
    const route = getActiveItinerary(state);
    while (state.dayPlan.rallies.length < Number(state.dayPlan.rallyCount || 0)) {
      state.dayPlan.rallies.push(route.states[state.dayPlan.rallies.length % route.states.length] || getCurrentRoundStateAbbrs(state)[0]);
    }
  }
}

function normalizeEffortInputs(state) {
  state.dayPlan.fundraising = snapEffort(state.dayPlan.fundraising);
  state.dayPlan.endorsements = snapEffort(state.dayPlan.endorsements);
  elements["fundraising-effort"].value = String(state.dayPlan.fundraising);
  elements["endorsement-effort"].value = String(state.dayPlan.endorsements);
}

function computeGeneralCampaignEffort(state) {
  return Math.max(0, DAILY_EFFORT - state.dayPlan.fundraising - state.dayPlan.endorsements);
}

function computeRemainingEffort(state) {
  return computeStateEffortTotal(state) - computeGeneralCampaignEffort(state);
}

function buildDefaultStateEffortPlan(state) {
  const currentStates = getCurrentRoundStateAbbrs(state);
  if (!currentStates.length) {
    return {};
  }
  const campaigning = computeGeneralCampaignEffort(state);
  const equalShare = Math.floor(campaigning / currentStates.length);
  let remainder = campaigning - equalShare * currentStates.length;
  return Object.fromEntries(currentStates.map((abbr) => {
    const bonus = remainder > 0 ? 1 : 0;
    remainder -= bonus;
    return [abbr, equalShare + bonus];
  }));
}

function normalizeStateEffortPlan(state, { preserveDraft = false, lockedAbbr = "" } = {}) {
  const currentStates = getCurrentRoundStateAbbrs(state);
  const campaigning = computeGeneralCampaignEffort(state);
  state.dayPlan ||= {};
  state.dayPlan.stateEffort ||= {};
  if (!currentStates.length) {
    state.dayPlan.stateEffort = {};
    return;
  }
  const nextPlan = {};
  currentStates.forEach((abbr) => {
    const rawValue = state.dayPlan.stateEffort[abbr];
    nextPlan[abbr] = Number.isFinite(Number(rawValue)) ? clamp(Number(rawValue), 0, 100) : 0;
  });
  const activeTotal = Object.values(nextPlan).reduce((sum, value) => sum + value, 0);
  if (activeTotal <= 0) {
    state.dayPlan.stateEffort = buildDefaultStateEffortPlan(state);
    return;
  }
  if (preserveDraft && lockedAbbr && currentStates.includes(lockedAbbr)) {
    const lockedValue = clamp(nextPlan[lockedAbbr], 0, campaigning);
    const otherStates = currentStates.filter((abbr) => abbr !== lockedAbbr);
    const remaining = Math.max(0, campaigning - lockedValue);
    const otherTotal = otherStates.reduce((sum, abbr) => sum + nextPlan[abbr], 0);
    nextPlan[lockedAbbr] = lockedValue;
    if (!otherStates.length) {
      state.dayPlan.stateEffort = nextPlan;
      return;
    }
    if (otherTotal <= 0) {
      const equalShare = Math.floor(remaining / otherStates.length);
      let remainder = remaining - equalShare * otherStates.length;
      otherStates.forEach((abbr) => {
        const bonus = remainder > 0 ? 1 : 0;
        remainder -= bonus;
        nextPlan[abbr] = equalShare + bonus;
      });
    } else {
      otherStates.forEach((abbr) => {
        nextPlan[abbr] = Math.round((nextPlan[abbr] / otherTotal) * remaining);
      });
      let delta = remaining - otherStates.reduce((sum, abbr) => sum + nextPlan[abbr], 0);
      const ordered = [...otherStates].sort((a, b) => nextPlan[b] - nextPlan[a]);
      while (delta !== 0 && ordered.length) {
        for (const abbr of ordered) {
          if (delta === 0) {
            break;
          }
          if (delta > 0) {
            nextPlan[abbr] += 1;
            delta -= 1;
          } else if (nextPlan[abbr] > 0) {
            nextPlan[abbr] -= 1;
            delta += 1;
          }
        }
      }
    }
  } else if (!preserveDraft) {
    currentStates.forEach((abbr) => {
      nextPlan[abbr] = Math.round((nextPlan[abbr] / activeTotal) * campaigning);
    });
    let delta = campaigning - Object.values(nextPlan).reduce((sum, value) => sum + value, 0);
    const ordered = [...currentStates].sort((a, b) => nextPlan[b] - nextPlan[a]);
    while (delta !== 0 && ordered.length) {
      for (const abbr of ordered) {
        if (delta === 0) {
          break;
        }
        if (delta > 0) {
          nextPlan[abbr] += 1;
          delta -= 1;
        } else if (nextPlan[abbr] > 0) {
          nextPlan[abbr] -= 1;
          delta += 1;
        }
      }
    }
  } else {
    currentStates.forEach((abbr) => {
      nextPlan[abbr] = Math.round((nextPlan[abbr] / activeTotal) * campaigning);
    });
    let delta = campaigning - Object.values(nextPlan).reduce((sum, value) => sum + value, 0);
    const ordered = [...currentStates].sort((a, b) => nextPlan[b] - nextPlan[a]);
    while (delta !== 0 && ordered.length) {
      for (const abbr of ordered) {
        if (delta === 0) {
          break;
        }
        if (delta > 0) {
          nextPlan[abbr] += 1;
          delta -= 1;
        } else if (nextPlan[abbr] > 0) {
          nextPlan[abbr] -= 1;
          delta += 1;
        }
      }
    }
  }
  state.dayPlan.stateEffort = nextPlan;
}

function getStateEffortValue(state, abbr) {
  return clamp(Number(state?.dayPlan?.stateEffort?.[abbr] || 0), 0, 100);
}

function computeStateEffortTotal(state) {
  return getCurrentRoundStateAbbrs(state).reduce((sum, abbr) => sum + getStateEffortValue(state, abbr), 0);
}

function getOrderedStateEffortEntries(state) {
  return getCurrentRoundStateAbbrs(state)
    .map((abbr) => [abbr, getStateEffortValue(state, abbr)])
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1]);
}

function describeStateEffortPlan(state) {
  return getOrderedStateEffortEntries(state)
    .slice(0, 4)
    .map(([abbr, value]) => `${getStateName(abbr)} ${value}`)
    .join(" | ");
}

function getDerivedPlanningRoute(state) {
  const ordered = getOrderedStateEffortEntries(state);
  const routeEntries = ordered.length ? ordered : getCurrentRoundStateAbbrs(state).map((abbr) => [abbr, 0]);
  const states = routeEntries.map(([abbr]) => abbr);
  const topShare = routeEntries[0]?.[1] || 0;
  const campaigning = Math.max(1, computeGeneralCampaignEffort(state));
  const activeCount = Math.max(1, states.length);
  const concentration = topShare / campaigning;
  const efficiency = clamp(0.9 + concentration * 0.28 - Math.max(0, activeCount - 1) * 0.045, 0.82, 1.16);
  const travelLoad = clamp((activeCount - 1) * 1.2 + (1 - concentration) * 1.8, 0.7, 4.6);
  const efficiencyLabel = topShare >= 65
    ? "Tight State Focus"
    : activeCount <= 2
      ? "Compact Split"
      : "Spread Board";
  return {
    id: "state-allocation-route",
    title: states[0] ? `${getStateName(states[0])} Focus` : "State Allocation Route",
    states,
    efficiency,
    efficiencyLabel,
    summary: describeStateEffortPlan(state),
    travelLoad,
  };
}

function snapEffort(value) {
  return clamp(Math.round(Number(value || 0) / MIX_STEP) * MIX_STEP, 0, DAILY_EFFORT);
}

function parseEffortInput(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return clamp(parsed, 0, DAILY_EFFORT);
}

function playerGapInState(state, playerId) {
  const ranking = sortSupportEntries(state.visiblePolls);
  const playerPoll = state.visiblePolls[playerId] || 0;
  if (ranking[0][0] === playerId) {
    return 0;
  }
  return round1(ranking[0][1] - playerPoll);
}

function computeMessageFit(state, mix, candidate) {
  let total = 0;
  const rankedStateIssues = sortIssues(state.issues).map(([issue]) => issue);
  const stateTopThree = rankedStateIssues.slice(0, 3);
  const brandTopThree = topIssuesFromMix(mix, 3);
  ISSUE_KEYS.forEach((issue) => {
    const rankIndex = rankedStateIssues.indexOf(issue);
    const rankWeight = rankIndex === 0 ? 1.75 : rankIndex === 1 ? 1.35 : rankIndex === 2 ? 1.12 : 0.82;
    total += (mix[issue] / 100) * (state.issues[issue] / 100) * (candidate.issueCredibility[issue] || 0.35) * rankWeight;
  });
  if (brandTopThree[0] === stateTopThree[0]) {
    total += 0.08;
  } else if (!brandTopThree.includes(stateTopThree[0])) {
    total -= 0.05;
  }
  if (brandTopThree.includes(stateTopThree[1])) {
    total += 0.04;
  }
  if (brandTopThree.includes(stateTopThree[2])) {
    total += 0.02;
  }
  if (appliesBuzzToState(gameState, state)) {
    total += (mix[gameState.activeBuzz.key] / 100) * 0.08;
  }
  return clamp(total * 2.05, 0.22, 1.35);
}

function computeIssueFit(state, issue, candidate) {
  let fit = (state.issues[issue] / 100) * (candidate.issueCredibility[issue] || 0.35) * 1.6;
  if (appliesBuzzToState(gameState, state) && gameState.activeBuzz.key === issue) {
    fit += 0.1;
  }
  return clamp(fit, 0.18, 1.2);
}

function topIssueKey(issues) {
  return sortIssues(issues)[0][0];
}

function topIssueAcrossStates(states) {
  const totals = Object.fromEntries(ISSUE_KEYS.map((issue) => [issue, 0]));
  states.forEach((state) => {
    ISSUE_KEYS.forEach((issue) => {
      totals[issue] += state.issues[issue];
    });
  });
  return topIssueKey(totals);
}

function topIssueForStateFromMix(state, mix) {
  const scored = ISSUE_KEYS.map((issue) => [issue, (mix[issue] / 100) * state.issues[issue]]);
  return scored.sort((a, b) => b[1] - a[1])[0][0];
}

function topIssueAcrossStatesFromMix(states, mix) {
  const totals = Object.fromEntries(ISSUE_KEYS.map((issue) => [issue, 0]));
  states.forEach((state) => {
    ISSUE_KEYS.forEach((issue) => {
      totals[issue] += (mix[issue] / 100) * state.issues[issue] * Math.max(1, state.electoralVotes || 1);
    });
  });
  return topIssueKey(totals);
}

function selectAutoAdIssue({ scope, state, type, targetStates = null, mix = null }) {
  const resolvedTargetStates = targetStates || getAdTargetStates({ scope, state: state?.abbr || "" }, gameState);
  if (!resolvedTargetStates.length) {
    return topIssuesFromMix(mix || gameState.messageMix || defaultMessageMix(), 1)[0];
  }
  if (type === "negative") {
    return resolvedTargetStates.length === 1
      ? topIssueKey(resolvedTargetStates[0].issues)
      : topIssueAcrossStates(resolvedTargetStates);
  }
  const activeMix = mix || gameState.messageMix || defaultMessageMix();
  return resolvedTargetStates.length === 1
    ? topIssueForStateFromMix(resolvedTargetStates[0], activeMix)
    : topIssueAcrossStatesFromMix(resolvedTargetStates, activeMix);
}

function topIssuesFromMix(mix, count) {
  return ISSUE_KEYS.slice().sort((a, b) => mix[b] - mix[a]).slice(0, count);
}

function computeMessageMixTotal(mix) {
  return ISSUE_KEYS.reduce((sum, issue) => sum + Number(mix[issue] || 0), 0);
}

function sortIssues(issues) {
  return Object.entries(issues).sort((a, b) => b[1] - a[1]);
}

function sortSupportEntries(supportMap) {
  return Object.entries(supportMap).sort((a, b) => b[1] - a[1]);
}

function issueBandLabel(state, issue) {
  const value = state.issues[issue];
  if (value >= 75) {
    return `${ISSUE_LABELS[issue]} is Very Important`;
  }
  if (value >= 60) {
    return `${ISSUE_LABELS[issue]} is Important`;
  }
  if (value >= 45) {
    return `${ISSUE_LABELS[issue]} is Secondary`;
  }
  return `${ISSUE_LABELS[issue]} is Minor`;
}

function buildStateTraitNotes(state) {
  const notes = [];
  if (state.traits.religious >= 70) {
    notes.push("Best: Values + endorsement-heavy outreach.");
  }
  if (state.traits.union >= 65) {
    notes.push("Best: Economy + labor support.");
  }
  if (state.traits.rural >= 65) {
    notes.push("Best: Rallies + local ground work.");
  }
  if (state.traits.urban >= 65) {
    notes.push("Best: Unity + healthcare.");
  }
  if (state.traits.coastal >= 70) {
    notes.push("Best: Environment + paid media.");
  }
  if (state.traits.family >= 68) {
    notes.push("Best: Values or unity framing.");
  }
  if (state.traits.diverse >= 68) {
    notes.push("Best: Unity + community outreach.");
  }
  return notes.slice(0, 4);
}

function stateRead(state) {
  const topIssues = topIssuesFromMix(gameState.messageMix, 2).map((issue) => ISSUE_LABELS[issue]);
  const pressure = buildStatePressureSummary(state);
  return `${state.name} is reading most strongly on ${ISSUE_LABELS[state.topConcern]}, with ${topIssues.join(" and ")} getting the cleanest crossover from your current brand. ${pressure.label}: ${pressure.summary}`;
}

function fatigueBand(value) {
  if (value >= 90) {
    return "Danger Zone";
  }
  if (value >= 75) {
    return "Exhausted";
  }
  if (value >= 50) {
    return "Wearing Down";
  }
  return "Fresh";
}

function fatigueEfficiency(value) {
  if (value >= 90) {
    return 0.58;
  }
  if (value >= 75) {
    return 0.74;
  }
  if (value >= 50) {
    return 0.88;
  }
  return 1;
}

function computeFundraisingGain(candidate, effort) {
  const rate = 0.6 + candidate.stats.fundraising * 0.06 + candidate.momentum * 0.0025;
  const efficientEffort = Math.min(effort, 25);
  const softCapEffort = Math.max(0, Math.min(10, effort - 25));
  const heavyEffort = Math.max(0, effort - 35);
  const weightedEffort = efficientEffort + softCapEffort * 0.82 + heavyEffort * 0.64;
  return round1(weightedEffort * rate + randomBetween(0, 3));
}

function fundraisingGainRange(candidate, effort) {
  const rate = 0.6 + candidate.stats.fundraising * 0.06 + candidate.momentum * 0.0025;
  const efficientEffort = Math.min(effort, 25);
  const softCapEffort = Math.max(0, Math.min(10, effort - 25));
  const heavyEffort = Math.max(0, effort - 35);
  const weightedEffort = efficientEffort + softCapEffort * 0.82 + heavyEffort * 0.64;
  const base = weightedEffort * rate;
  return {
    low: round1(base),
    expected: round1(base + 1.5),
    high: round1(base + 3),
  };
}

function effortToOffsetCost(cost, fundraisingBase) {
  for (let effort = 5; effort <= 100; effort += 5) {
    const expected = effort * fundraisingBase + 6;
    if (expected >= cost) {
      return effort;
    }
  }
  return 0;
}

function buildFundraisingOffsetRow(effort, fundraisingBase, cost, targetEffort) {
  const low = round1(effort * fundraisingBase + 2);
  const expected = round1(effort * fundraisingBase + 6);
  const high = round1(effort * fundraisingBase + 10);
  return {
    label: `${effort} effort`,
    value: `$${expected.toFixed(0)} expected ($${low.toFixed(0)}-$${high.toFixed(0)})`,
    isTarget: targetEffort > 0 && effort === targetEffort && expected >= cost,
  };
}

function fundraisingNarrativeMultiplier(candidate) {
  const strengths = (candidate.strengths || []).join(" ").toLowerCase();
  let multiplier = 0.58 + candidate.stats.authenticity * 0.05 + candidate.stats.charisma * 0.035 + candidate.stats.fundraising * 0.018;
  if (strengths.includes("small donor")) {
    multiplier += 0.36;
  }
  if (strengths.includes("grassroots")) {
    multiplier += 0.14;
  }
  if (strengths.includes("power networks") || strengths.includes("fundraising monster")) {
    multiplier -= 0.08;
  }
  return clamp(multiplier, 0.45, 1.45);
}

function computeFundraisingNarrativeValue(candidate, effort, gain) {
  const multiplier = fundraisingNarrativeMultiplier(candidate);
  const efficiency = effort > 0 ? gain / effort : 0;
  return round1(clamp(effort * 0.018 + (efficiency - 1) * 0.26 + multiplier * 0.65, 0, 3.4));
}

function fundraisingNarrativeLabel(candidate, narrative) {
  if (narrative >= 2.5) {
    return "a real strength signal with donors and press chatter";
  }
  if (narrative >= 1.6) {
    return candidate.strengths?.some((item) => item.toLowerCase().includes("small donor"))
      ? "a healthy small-donor proof point"
      : "a credible show of campaign strength";
  }
  return "useful cash more than a full narrative wave";
}

function recordFundraisingRoundData(state, candidateId, effort, gain, narrative) {
  ensureRoundFundraisingLedger(state);
  const ledger = state.ui.roundFundraisingLedger[candidateId];
  ledger.cash = round1((ledger.cash || 0) + gain);
  ledger.narrative = round1((ledger.narrative || 0) + narrative);
  ledger.effort = round1((ledger.effort || 0) + effort);
  ledger.days = (ledger.days || 0) + 1;
}

function rebalanceMix(mix, issue, desired) {
  desired = snapEffort(desired);
  const current = mix[issue];
  let delta = desired - current;
  if (delta === 0) {
    return;
  }
  const others = ISSUE_KEYS.filter((key) => key !== issue);
  if (delta > 0) {
    while (delta > 0) {
      const available = others.filter((key) => mix[key] > 0);
      if (!available.length) {
        break;
      }
      available.forEach((key) => {
        if (delta > 0 && mix[key] > 0) {
          mix[key] = Math.max(0, mix[key] - MIX_STEP);
          delta -= MIX_STEP;
        }
      });
    }
    mix[issue] = desired - Math.max(0, delta);
  } else {
    mix[issue] = desired;
    delta = Math.abs(delta);
    let index = 0;
    while (delta > 0) {
      const key = others[index % others.length];
      mix[key] += MIX_STEP;
      delta -= MIX_STEP;
      index += 1;
    }
  }
  normalizeMix(mix);
}

function positiveShift(state, candidateId, amount) {
  let remaining = amount;
  const undecidedTake = Math.min(state.undecided, remaining * 0.75);
  state.undecided = round1(state.undecided - undecidedTake);
  state.currentSupport[candidateId] = round1((state.currentSupport[candidateId] || 0) + undecidedTake);
  remaining = round1(remaining - undecidedTake);
  if (remaining > 0) {
    const opponents = Object.keys(state.currentSupport).filter((id) => id !== candidateId);
    const totalOpposition = opponents.reduce((sum, id) => sum + state.currentSupport[id], 0) || 1;
    opponents.forEach((opponentId, index) => {
      const share = index === opponents.length - 1 ? remaining : round1(remaining * (state.currentSupport[opponentId] / totalOpposition));
      const taken = Math.min(share, Math.max(0, state.currentSupport[opponentId] - 2));
      state.currentSupport[opponentId] = round1(state.currentSupport[opponentId] - taken);
      state.currentSupport[candidateId] = round1(state.currentSupport[candidateId] + taken);
      remaining = round1(remaining - taken);
    });
  }
  normalizeSupport(state);
}

function negativeShift(state, targetId, amount, beneficiaryId = "") {
  const available = Math.max(0, (state.currentSupport[targetId] || 0) - 2);
  const taken = Math.min(amount, available);
  state.currentSupport[targetId] = round1((state.currentSupport[targetId] || 0) - taken);
  const toUndecided = round1(taken * 0.6);
  state.undecided = round1(state.undecided + toUndecided);
  const toTransfer = round1(taken - toUndecided);
  if (beneficiaryId) {
    state.currentSupport[beneficiaryId] = round1((state.currentSupport[beneficiaryId] || 0) + toTransfer);
  } else {
    const others = Object.keys(state.currentSupport).filter((id) => id !== targetId);
    const share = toTransfer / others.length;
    others.forEach((id) => {
      state.currentSupport[id] = round1(state.currentSupport[id] + share);
    });
  }
  normalizeSupport(state);
}

function normalizeSupport(state) {
  const keys = Object.keys(state.currentSupport);
  const supportSum = keys.reduce((sum, key) => sum + state.currentSupport[key], 0);
  let total = supportSum + state.undecided;
  if (Math.abs(total - 100) < 0.2) {
    return;
  }
  state.undecided = round1(state.undecided + (100 - total));
  if (state.undecided < 0) {
    const deficit = Math.abs(state.undecided);
    state.undecided = 0;
    const currentSupportSum = keys.reduce((sum, key) => sum + state.currentSupport[key], 0);
    keys.forEach((key, index) => {
      const cut = index === keys.length - 1 ? deficit : round1(deficit * (state.currentSupport[key] / currentSupportSum));
      state.currentSupport[key] = round1(Math.max(0, state.currentSupport[key] - cut));
    });
  }
}

function applyDailyFatigue(state, candidate, route) {
  const burden =
    Number(state.dayPlan.rallyCount || 0) * 6.2 +
    route.travelLoad * 2.55 +
    state.dayPlan.endorsements * 0.042 +
    state.dayPlan.fundraising * 0.022 +
    computeGeneralCampaignEffort(state) * 0.028;
  const lightDayRecovery =
    Number(state.dayPlan.rallyCount || 0) === 0 ? 2.4
    : Number(state.dayPlan.rallyCount || 0) === 1 ? 0.9
    : 0;
  const lowEffortRecovery =
    computeGeneralCampaignEffort(state) <= 30 ? 1.1
    : computeGeneralCampaignEffort(state) <= 45 ? 0.45
    : 0;
  const recovery = 1.4 + lightDayRecovery + lowEffortRecovery;
  candidate.fatigue = clamp(candidate.fatigue + burden - recovery - candidate.stats.stamina * 1.35, 6, 100);
}

function incrementIssueUsage(candidate, mix) {
  candidate.definedIssueUsage ||= defaultMessageMix();
  ISSUE_KEYS.forEach((issue) => {
    candidate.definedIssueUsage[issue] += mix[issue];
  });
  normalizeMix(candidate.definedIssueUsage);
}

function sameTopIssueRepeated(state) {
  const player = getPlayerCandidate();
  const topCurrent = topIssuesFromMix(state.messageMix, 1)[0];
  const topBrand = topIssuesFromMix(player.definedIssueUsage, 1)[0];
  return topCurrent === topBrand && player.definedIssueUsage[topBrand] >= 28;
}

function buildAiMix(candidate, targetStates) {
  const focusStates = Array.isArray(targetStates) ? targetStates.filter(Boolean) : [targetStates].filter(Boolean);
  const mix = Object.fromEntries(ISSUE_KEYS.map((issue) => [issue, 5]));
  candidate.preferredMessages.forEach((issue, index) => {
    mix[issue] += 18 - index * 3;
  });
  const weightedIssueScores = {};
  focusStates.forEach((targetState, stateIndex) => {
    sortIssues(targetState.issues).slice(0, 4).forEach(([issue, value], issueIndex) => {
      weightedIssueScores[issue] = (weightedIssueScores[issue] || 0) + value * (stateIndex === 0 ? 1.25 : stateIndex === 1 ? 0.95 : 0.75) * (issueIndex === 0 ? 1.2 : issueIndex === 1 ? 0.95 : issueIndex === 2 ? 0.75 : 0.55);
    });
  });
  Object.entries(weightedIssueScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .forEach(([issue], index) => {
      mix[issue] += 16 - index * 4;
    });
  return normalizeMix(mix);
}

function aiTargetScore(candidate, state) {
  const homeBoost = candidate.homeState === state.abbr ? 2.4 : 0;
  const closeBoost = Math.max(0, 10 - playerGapInState(state, candidate.id)) * 0.12;
  return state.electoralVotes * 0.08 + state.undecided * 0.04 + homeBoost + closeBoost + computeRegionFit(candidate, state);
}

function shouldAiGoNegative(candidate) {
  if (candidate.id === "jim") {
    return true;
  }
  if (candidate.id === "buzz") {
    return Math.random() < 0.55;
  }
  return Math.random() < 0.35;
}

function selectAiAdTarget(candidate) {
  const projected = gameState.states.map((item) => sortSupportEntries(item.visiblePolls)[0][0]).reduce((totals, id) => {
    totals[id] = (totals[id] || 0) + 1;
    return totals;
  }, {});
  return Object.entries(projected).filter(([id]) => id !== candidate.id).sort((a, b) => b[1] - a[1])[0]?.[0] || gameState.playerId;
}

function pickEndorsementType(state, issue) {
  if (issue === "crime") {
    return "Police and sheriffs groups";
  }
  if (issue === "environment") {
    return "Environmental and clean-energy advocates";
  }
  if (issue === "values") {
    return "Faith and family endorsers";
  }
  if (issue === "corruption") {
    return "Good-government reform voices";
  }
  if (state.traits.union >= 65 && issue === "economy") {
    return "Labor and working-class endorsers";
  }
  if (state.traits.diverse >= 68 && issue === "unity") {
    return "Community leaders and coalition organizers";
  }
  return "Local elected officials and party endorsers";
}

function refreshAllPolls(state) {
  state.states.forEach((item) => refreshPollingSnapshot(state, item));
}

function ensurePollSnapshots(state) {
  const missingSnapshots = state.states.some((item) => {
    const pollCount = Object.keys(item.visiblePolls || {}).length;
    return pollCount !== state.candidates.length;
  });
  if (missingSnapshots) {
    refreshAllPolls(state);
  }
}

function refreshPollingSnapshot(game, state) {
  if (isPrimaryMode(game) && state.primaryAwarded && state.finalResult) {
    state.undecided = 0;
    Object.keys(state.finalResult.shares || {}).forEach((candidateId) => {
      state.visiblePolls[candidateId] = state.finalResult.shares[candidateId];
    });
    return;
  }
  const hasExistingSnapshot = Object.keys(state.visiblePolls || {}).length === game.candidates.length;
  const moveCap = livePollMoveCap(game, state);
  game.candidates.forEach((candidate) => {
    const target = round1(clamp(
      state.currentSupport[candidate.id] + randomBetween(-state.pollingError * 0.35, state.pollingError * 0.35),
      0,
      85
    ));
    if (!hasExistingSnapshot) {
      state.visiblePolls[candidate.id] = target;
      return;
    }
    const previous = state.visiblePolls[candidate.id] || 0;
    const blended = previous + (target - previous) * 0.62 + randomBetween(-0.18, 0.18);
    const cappedMove = clamp(blended, previous - moveCap, previous + moveCap);
    state.visiblePolls[candidate.id] = round1(clamp(cappedMove, 0, 85));
  });
  normalizeVisiblePolls(state);
  enforceOpeningPollLead(game, state);
}

function livePollMoveCap(game, state) {
  const undecidedFlex = state.undecided * 0.08;
  const errorFlex = state.pollingError * 0.55;
  const buzzFlex = game.activeBuzz && appliesBuzzToState(game, state) ? 0.7 : 0;
  return round1(clamp(2.4 + undecidedFlex + errorFlex + buzzFlex, 2.4, 6.4));
}

function enforceOpeningPollLead(game, state) {
  if (game.turnInRound !== 1 || game.roundIndex !== 0) {
    return;
  }
  const homeCandidate = game.candidates.find((candidate) => candidate.homeState === state.abbr);
  if (!homeCandidate) {
    return;
  }
  const ranking = sortSupportEntries(state.visiblePolls);
  if (!ranking.length || ranking[0][0] === homeCandidate.id) {
    return;
  }
  const leaderId = ranking[0][0];
  const leaderValue = ranking[0][1];
  const homeValue = state.visiblePolls[homeCandidate.id] || 0;
  const targetLead = state.abbr === "TX" ? 1.4 : 0.8;
  const needed = round1(leaderValue - homeValue + targetLead);
  if (needed <= 0) {
    return;
  }
  positiveShift(state, homeCandidate.id, needed);
  game.candidates.forEach((candidate) => {
    state.visiblePolls[candidate.id] = round1(clamp(state.currentSupport[candidate.id] + randomBetween(-state.pollingError * 0.2, state.pollingError * 0.2), 0, 85));
  });
  normalizeVisiblePolls(state);
}

function normalizeVisiblePolls(state) {
  const keys = Object.keys(state.visiblePolls);
  const target = 100 - state.undecided;
  const sum = keys.reduce((total, key) => total + state.visiblePolls[key], 0);
  const diff = round1(target - sum);
  if (Math.abs(diff) < 0.1) {
    return;
  }
  const leaderId = sortSupportEntries(state.visiblePolls)[0][0];
  state.visiblePolls[leaderId] = round1(state.visiblePolls[leaderId] + diff);
}

function appliesBuzzToState(state, targetState) {
  if (!state?.activeBuzz) {
    return false;
  }
  if (state.activeBuzz.scope === "national") {
    return true;
  }
  if (isPrimaryMode(state)) {
    const activePrimaryStates = new Set(getCampaignPlanningStateAbbrs(state));
    return activePrimaryStates.has(targetState.abbr);
  }
  return targetState.region === state.activeBuzz.region;
}

function adjacentInRound(abbr, state = gameState) {
  const roundSet = new Set(getCurrentRoundStateAbbrs(state));
  return (BORDERS[abbr] || []).filter((neighbor) => roundSet.has(neighbor));
}

function dailyAdUnitCapacity(state = gameState) {
  const liveCount = getCurrentRoundStates(state).length;
  const onDeckCount = getUpcomingRoundStateAbbrs(state).length;
  if (isPrimaryMode(state)) {
    const largeWindowBonus = liveCount >= 14 ? 3 : liveCount >= 10 ? 2 : liveCount >= 7 ? 1 : 0;
    return clamp(4 + Math.ceil(liveCount * 0.45) + Math.min(3, Math.ceil(onDeckCount * 0.3)) + largeWindowBonus, 5, 14);
  }
  return clamp(3 + liveCount, 4, 7);
}

function plannedAdUnits(state = gameState) {
  return (state?.ui?.plannedAds || []).reduce((sum, ad) => sum + Math.max(1, Number(ad.units || 1)), 0);
}

function plannedAdSpend(state = gameState) {
  return (state?.ui?.plannedAds || []).reduce((sum, ad) => sum + Number(ad.cost || 0), 0);
}

function playerAdBudget(state = gameState) {
  return Math.max(0, Math.round(getPlayerCandidate()?.money || 0));
}

function adEffortCostFor(scope, state, units = 1, candidate = getPlayerCandidate()) {
  const moneyCost = adCostFor(scope, state, units);
  const referenceCandidate = candidate || getPlayerCandidate();
  const fundraisingBase = referenceCandidate
    ? 1.08 + referenceCandidate.stats.fundraising * 0.135 + referenceCandidate.momentum * 0.006
    : 1.8;
  const exactEffort = Math.ceil(Math.max(0, moneyCost - 6) / Math.max(0.5, fundraisingBase));
  return Math.max(1, exactEffort);
}

function adCostFor(scope, state, units = 1) {
  const targetStates = scope === "state"
    ? [state].filter(Boolean)
    : getAdTargetStates({ scope, state: state?.abbr || "" }, gameState);
  const targetCount = scope === "state"
    ? 1
    : targetStates.length;
  const selectedStateBase = clamp(Math.round((state?.mediaCost || 16) * 0.78), 12, 28);
  const collapsedTargetBase = targetStates[0]
    ? clamp(Math.round((targetStates[0].mediaCost || 16) * 0.78), 12, 28)
    : selectedStateBase;
  const bundledStateBase = targetStates.length
    ? targetStates.reduce((sum, targetState) => (
      sum + clamp(Math.round((targetState?.mediaCost || 16) * 0.78), 12, 28)
    ), 0)
    : selectedStateBase;
  const base = scope !== "state" && targetCount <= 1
    ? collapsedTargetBase
    : scope === "region"
    ? (isPrimaryMode() ? 24 : 22)
    : scope === "ondeck"
      ? 30
      : scope === "window"
        ? Math.max(selectedStateBase, Math.round(bundledStateBase * 0.9))
        : selectedStateBase;
  let total = 0;
  for (let unitIndex = 0; unitIndex < units; unitIndex += 1) {
    const effectiveScope = scope !== "state" && targetCount <= 1 ? "state" : scope;
    const multiplier = 1 + unitIndex * (effectiveScope === "state" ? 0.16 : effectiveScope === "window" ? 0.18 : 0.14);
    total += Math.round(base * multiplier);
  }
  return total;
}

function getAdTargetStates(ad, state = gameState) {
  if (ad.scope === "region") {
    return getCurrentRoundStates(state);
  }
  if (ad.scope === "ondeck") {
    return getUpcomingRoundStateAbbrs(state).map(getStateByAbbr).filter(Boolean);
  }
  if (ad.scope === "window") {
    return getCampaignPlanningStates(state);
  }
  return [getStateByAbbr(ad.state)].filter(Boolean);
}

function travelWeightForState(abbr, region) {
  if (region === "Northeast" && ["NY", "NJ", "CT", "RI", "MA", "DE", "MD", "DC"].includes(abbr)) {
    return 0.55;
  }
  return TRAVEL_WEIGHTS[abbr] || 1;
}

function extractStateFromQuestion(question) {
  const lower = question.toLowerCase();
  const fullNameMatch = STATE_DATA.find(([, name]) => lower.includes(name.toLowerCase()));
  if (fullNameMatch) {
    return fullNameMatch[0];
  }
  const abbrMatch = STATE_DATA.find(([abbr]) => new RegExp(`\\b${abbr.toLowerCase()}\\b`).test(lower));
  return abbrMatch?.[0] || "";
}

function getStateName(abbr) {
  return STATE_DATA.find(([stateAbbr]) => stateAbbr === abbr)?.[1] || abbr;
}

function pollChartName(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return "";
  }
  return parts[parts.length - 1];
}

function formatStateResultShares(state) {
  const shares = sortSupportEntries(state.finalResult?.shares || state.visiblePolls).slice(0, 4);
  return shares.map(([candidateId, share]) => {
    const candidate = getCandidateById(candidateId);
    const winnerClass = candidateId === state.primaryWinnerId ? "result-share-chip is-winner" : "result-share-chip";
    return `<span class="${winnerClass}">${pollChartName(candidate?.name || candidateId)} ${share.toFixed(1)}%</span>`;
  }).join("");
}

function captureVisiblePolls(state) {
  return Object.fromEntries(state.states.map((item) => [
    item.abbr,
    {
      ...item.visiblePolls,
      undecided: item.undecided,
    },
  ]));
}

function pollDeltaFor(stateAbbr, key) {
  const previous = gameState?.ui?.previousVisiblePolls?.[stateAbbr];
  const state = getStateByAbbr(stateAbbr);
  if (!previous || !state) {
    return null;
  }
  const currentValue = key === "undecided" ? state.undecided : (state.visiblePolls[key] || 0);
  const previousValue = Number(previous[key]);
  if (!Number.isFinite(previousValue)) {
    return null;
  }
  return round1(currentValue - previousValue);
}

function renderPollDelta(delta) {
  if (delta === null) {
    return `<div class="poll-delta poll-delta-empty"></div>`;
  }
  if (Math.abs(delta) < 0.05) {
    return `<div class="poll-delta poll-delta-flat">0.0</div>`;
  }
  if (delta > 0) {
    return `<div class="poll-delta poll-delta-up">+${delta.toFixed(1)}</div>`;
  }
  return `<div class="poll-delta poll-delta-down">${delta.toFixed(1)}</div>`;
}

function getRegionForState(abbr) {
  return STATE_DATA.find(([stateAbbr]) => stateAbbr === abbr)?.[3] || "Southwest";
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function ordinal(value) {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) {
    return `${value}th`;
  }
  const mod10 = value % 10;
  if (mod10 === 1) {
    return `${value}st`;
  }
  if (mod10 === 2) {
    return `${value}nd`;
  }
  if (mod10 === 3) {
    return `${value}rd`;
  }
  return `${value}th`;
}

function uniqueArray(array) {
  return [...new Set(array.filter(Boolean))];
}

function clamp01(value) {
  return Math.max(0.05, Math.min(0.95, value));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function shuffle(array) {
  for (let index = array.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[swapIndex]] = [array[swapIndex], array[index]];
  }
  return array;
}
