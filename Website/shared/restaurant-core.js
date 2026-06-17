(() => {
  const STORAGE_KEYS = {
    profiles: "restaurant_challenge_profiles_v1",
    activeProfileId: "restaurant_challenge_active_profile_v1",
    activeSession: "restaurant_challenge_active_session_v1",
    profileAccessTokens: "restaurant_challenge_profile_access_tokens_v1",
  };
  const API_BASE = "/api";
  const USE_REMOTE_SYNC = typeof window.fetch === "function";
  const FAVORITE_VISIT_GOAL = 10;
  const FAVORITE_VALUE_MULTIPLIER = 1.2;
  const CUSTOMER_STATUS_RANK = {
    lost: 0,
    occasional: 1,
    regular: 2,
    favorite: 3,
  };
  const profilesCacheState = {
    loaded: false,
    source: "local",
    profiles: [],
  };
  const activeProfileState = {
    profileId: "",
    profile: null,
  };
  const activeSessionState = {
    session: null,
  };
  let readyResolve = () => {};
  const ready = new Promise((resolve) => {
    readyResolve = resolve;
  });

  const BLOCKED_RESTAURANT_NAMES = [
    "applebees",
    "arbys",
    "burger king",
    "buffalo wild wings",
    "cheesecake factory",
    "chick fil a",
    "chickfila",
    "chipotle",
    "cracker barrel",
    "dairy queen",
    "dennys",
    "dominos",
    "five guys",
    "ihop",
    "in n out",
    "kfc",
    "little caesars",
    "mcdonalds",
    "mc donalds",
    "olive garden",
    "outback steakhouse",
    "panera",
    "panda express",
    "pizza hut",
    "popeyes",
    "red lobster",
    "sonic",
    "starbucks",
    "subway",
    "taco bell",
    "texas roadhouse",
    "wendys",
    "waffle house",
    "americana diner",
    "waffle master",
  ];

  const BLOCKED_RESTAURANT_NAME_WORDS = [
    "asshole",
    "bastard",
    "bitch",
    "crap",
    "damn",
    "dick",
    "fart",
    "fuck",
    "hell",
    "piss",
    "porn",
    "shit",
    "slut",
    "whore",
  ];

  const GUEST_RESTAURANT_NAME_PARTS = {
    adjectives: [
      "Wandering",
      "Golden",
      "Lucky",
      "Friendly",
      "Harvest",
      "Cedar",
      "Bluebird",
      "Sunset",
      "Maple",
      "Hearth",
      "Silver",
      "Pepper",
      "Juniper",
      "Riverbend",
      "Copper",
      "Crimson",
      "Honey",
      "Neon",
      "Prairie",
      "Willow",
      "Velvet",
      "Merry",
      "Rusty",
      "Starlight",
      "Main Street",
      "Moonlit",
      "Wildflower",
      "Hickory",
      "Sunnyside",
      "Cozy",
      "Bayside",
      "Brickhouse",
      "Bright",
      "Canary",
      "Cinnamon",
      "Clover",
      "Cottonwood",
      "Elm Street",
      "Firefly",
      "Foxglove",
      "Front Porch",
      "Gingham",
      "Greenhouse",
      "High Noon",
      "Jubilee",
      "Kindred",
      "Little Lantern",
      "Marigold",
      "North Star",
      "Oak Barrel",
      "Patchwork",
      "Pinecone",
      "Porchlight",
      "Redbud",
      "Rolling",
      "Rosemary",
      "Saffron",
      "Shady Grove",
      "Sweetwater",
      "Tin Roof",
      "Two Spoon",
      "Whistlestop",
    ],
    nouns: [
      "Spoon",
      "Fork",
      "Lantern",
      "Table",
      "Porch",
      "Kitchen",
      "Cafe",
      "Diner",
      "Grill",
      "Bistro",
      "Skillet",
      "Kettle",
      "Pantry",
      "Counter",
      "Supper Club",
      "Roadhouse",
      "Smokehouse",
      "Wagon",
      "Plate",
      "Booth",
      "Garden",
      "Parlor",
      "Station",
      "Market",
      "Nook",
      "Hearthstone",
      "Sizzle",
      "Hideaway",
      "Pickle",
      "Pie Shop",
      "Tea Room",
      "Burger Stand",
      "Noodle Bar",
      "Taco Stop",
      "Waffle Cart",
      "Bakehouse",
      "Beanery",
      "Breakfast Bar",
      "Butterhouse",
      "Cantina",
      "Carvery",
      "Chow Hall",
      "Cookhouse",
      "Cupboard",
      "Delicatessen",
      "Eatery",
      "Flapjack House",
      "Fry House",
      "Lunch Counter",
      "Malt Shop",
      "Noodle House",
      "Pie Counter",
      "Pizzeria",
      "Sandwich Shop",
      "Snack Shack",
      "Soup Kitchen",
      "Steakhouse",
      "Taqueria",
      "Toast House",
      "Waffle Works",
    ],
  };

  const restaurants = [
    {
      id: "americana",
      slug: "americana",
      name: "Americana Diner",
      publicGameName: "The Americana Diner Game",
      description:
        "Classic comfort food in Pepperville. Answer 10 questions to win a customer for your own restaurant.",
      areaSlug: "pepperville",
      primaryColor: "#b84c38",
      secondaryColor: "#1f4e44",
      accentColor: "#f2c06b",
      heroImage: "/assets/restaurant-challenge/restaurants/americana/americana-diner-hero.jpg",
      logoSquare: "/assets/restaurant-challenge/restaurants/americana/americana-diner-logo.jpg",
      logoHorizontal: "/assets/restaurant-challenge/restaurants/americana/americana-diner-logo.jpg",
      squareImage: "/assets/restaurant-challenge/restaurants/americana/americana-diner-logo.jpg",
      active: true,
      playable: true,
      visibleInList: true,
    },
  ];

  const seedCustomers = [
    {
      id: "joyce-pepper",
      name: "Mayor Joyce Pepper",
      group: "communityverse",
      rarity: "Rare",
      regularValue: 250,
      occasionalValue: 75,
      focusTag: "communityverse",
      image: "/assets/cm-pepperville/people/mayor-joyce-pepper.jpg",
    },
    {
      id: "hank-hatley",
      name: "Fire Chief Hank Hatley",
      group: "communityverse",
      rarity: "Rare",
      regularValue: 250,
      occasionalValue: 75,
      focusTag: "communityverse",
      image: "../assets/restaurant-challenge/customers/customer-placeholder.svg",
    },
    {
      id: "savannah-pierce",
      name: "Savannah Pierce",
      group: "communityverse",
      rarity: "Uncommon",
      regularValue: 180,
      occasionalValue: 50,
      focusTag: "communityverse",
      image: "../assets/restaurant-challenge/customers/savannah-pierce.jpg",
    },
    {
      id: "curtis-coolwater",
      name: "Curtis Coolwater",
      group: "communityverse",
      rarity: "Uncommon",
      regularValue: 180,
      occasionalValue: 50,
      focusTag: "communityverse",
      image: "../assets/restaurant-challenge/customers/curtis-coolwater.jpg",
    },
    {
      id: "pastor-caleb-brooks",
      name: "Pastor Caleb Brooks",
      group: "communityverse",
      rarity: "Uncommon",
      regularValue: 170,
      occasionalValue: 45,
      focusTag: "communityverse",
      image: "../assets/restaurant-challenge/customers/pastor-caleb-brooks.jpg",
    },
    {
      id: "ming-wu",
      name: "Ming Wu",
      group: "communityverse",
      rarity: "Rare",
      regularValue: 220,
      occasionalValue: 60,
      focusTag: "communityverse",
      image: "../assets/restaurant-challenge/customers/ming-wu.jpg",
      bio: "Ming Wu is a talented artist and entrepreneur who owns the popular Rent-A-Elf service in Noel. Known for her creativity and cheerful personality, she also works at the Pepperville Zoo's Panda Exhibit, where she creates custom portraits of children alongside the zoo's famous pandas. The daughter of Dr. Chen Wu, Ming has become one of Chattawa County's most recognizable artists, especially during the Christmas season.",
    },
    {
      id: "wicked-jim-devito",
      name: "Wicked Jim DeVito",
      group: "communityverse",
      rarity: "Rare",
      regularValue: 225,
      occasionalValue: 70,
      focusTag: "communityverse",
      image: "../assets/restaurant-challenge/customers/customer-placeholder.svg",
    },
    {
      id: "miss-pearl",
      name: "Miss Pearl",
      group: "communityverse",
      rarity: "Uncommon",
      regularValue: 175,
      occasionalValue: 45,
      focusTag: "communityverse",
      image: "/assets/restaurant-challenge/customers/miss-pearl.jpg",
    },
    {
      id: "captain-zoogle",
      name: "Captain Zoogle",
      group: "communityverse",
      rarity: "Rare",
      regularValue: 500,
      occasionalValue: 150,
      focusTag: "communityverse",
      image: "/assets/restaurant-challenge/customers/captain-zoogle.jpg",
    },
    {
      id: "americana-waitress",
      name: "Americana Diner Waitress",
      group: "exclusive",
      rarity: "Common",
      regularValue: 100,
      occasionalValue: 25,
      focusTag: "americana",
      image: "/assets/restaurant-challenge/customers/americana-diner-waitress.jpg",
    },
    {
      id: "route-66-tourist",
      name: "Route 66 Tourist",
      group: "exclusive",
      rarity: "Uncommon",
      regularValue: 150,
      occasionalValue: 45,
      focusTag: "americana",
      image: "/assets/restaurant-challenge/customers/route-66-tourist.jpg",
    },
    {
      id: "retired-veteran",
      name: "Retired Veteran",
      group: "exclusive",
      rarity: "Uncommon",
      regularValue: 140,
      occasionalValue: 40,
      focusTag: "americana",
      image: "/assets/restaurant-challenge/customers/retired-veteran.jpg",
    },
    {
      id: "pie-contest-judge",
      name: "Pie Contest Judge",
      group: "exclusive",
      rarity: "Rare",
      regularValue: 225,
      occasionalValue: 70,
      focusTag: "americana",
      image: "/assets/restaurant-challenge/customers/pie-contest-judge.jpg",
    },
    {
      id: "breakfast-regular",
      name: "Breakfast Regular",
      group: "exclusive",
      rarity: "Common",
      regularValue: 110,
      occasionalValue: 30,
      focusTag: "americana",
      image: "/assets/restaurant-challenge/customers/breakfast-regular.jpg",
    },
    {
      id: "abraham-lincoln",
      name: "Abraham Lincoln",
      group: "historical",
      rarity: "Rare",
      regularValue: 500,
      occasionalValue: 150,
      focusTag: "historical",
      image: "../assets/restaurant-challenge/customers/abraham-lincoln.jpg",
      questionPlace: "the Civil War era",
      questionFact: "leading the United States through one of its most important moments",
      customQuestions: [
        {
          id: "national-audience",
          prompt: "Abraham Lincoln reached a national audience in the 1858 Senate campaign debates against who?",
          correctAnswer: "Stephen A. Douglas",
          wrongAnswers: ["William H. Seward", "Salmon P. Chase", "John C. Fremont"],
        },
        {
          id: "assassinated-by",
          prompt: "Abraham Lincoln was fatally shot by who?",
          correctAnswer: "John Wilkes Booth",
          wrongAnswers: ["David Herold", "George Atzerodt", "Lewis Powell"],
        },
        {
          id: "assassination-site",
          prompt: "Where was Abraham Lincoln assassinated?",
          correctAnswer: "Ford's Theatre",
          wrongAnswers: ["Petersen House", "The White House", "The Capitol"],
        },
        {
          id: "vice-president",
          prompt: "Who was Abraham Lincoln's Vice President?",
          correctAnswer: "Andrew Johnson",
          wrongAnswers: ["Hannibal Hamlin", "Salmon P. Chase", "Schuyler Colfax"],
        },
        {
          id: "parents",
          prompt: "What were Abraham Lincoln's parents' names?",
          correctAnswer: "Thomas Lincoln and Nancy Hanks Lincoln",
          wrongAnswers: [
            "George and Martha Washington",
            "John and Abigail Adams",
            "Robert and Mary Lincoln",
          ],
        },
        {
          id: "wife-name",
          prompt: "What was Abraham Lincoln's wife's name?",
          correctAnswer: "Mary",
          wrongAnswers: ["Sarah", "Eleanor", "Julia"],
        },
        {
          id: "party",
          prompt: "Which political party was Abraham Lincoln the first president of?",
          correctAnswer: "Republican Party",
          wrongAnswers: ["Democratic Party", "Whig Party", "Free Soil Party"],
        },
        {
          id: "quote",
          prompt: 'Complete Abraham Lincoln\'s quote: "A house divided against itself cannot _______."',
          correctAnswer: "Stand",
          wrongAnswers: ["Endure", "Survive", "Prevail"],
        },
        {
          id: "rail-candidate",
          prompt: 'What nickname did Lincoln supporters promote him with because of his frontier rail-splitting legend?',
          correctAnswer: "The Rail Candidate",
          wrongAnswers: ["The Rail Splitter", "The Log Cabin Candidate", "The Prairie Lawyer"],
        },
        {
          id: "first-republican-president",
          prompt: "Abraham Lincoln was elected as the first what?",
          correctAnswer: "Republican president",
          wrongAnswers: ["Democratic president", "Whig president", "Independent president"],
        },
        {
          id: "gettysburg-address-year",
          prompt: "In what year did Abraham Lincoln deliver the Gettysburg Address?",
          correctAnswer: "1863",
          wrongAnswers: ["1861", "1862", "1864"],
        },
        {
          id: "land-of-lincoln",
          prompt: 'Which state uses "Land of Lincoln" to recognize Lincoln\'s contributions and legacy?',
          correctAnswer: "Illinois",
          wrongAnswers: ["Indiana", "Kentucky", "Missouri"],
        },
      ],
    },
    {
      id: "alice-in-wonderland",
      name: "Alice in Wonderland",
      group: "storybook",
      rarity: "Rare",
      regularValue: 160,
      occasionalValue: 50,
      focusTag: "storybook",
      image: "../assets/restaurant-challenge/customers/alice-in-wonderland.jpg",
      questionPlace: "Wonderland",
      questionFact: "following the White Rabbit down the rabbit hole",
      customQuestions: [
        {
          id: "alt-title",
          prompt: "What is Alice's Adventures in Wonderland also known as?",
          correctAnswer: "Alice in Wonderland",
          wrongAnswers: [
            "Through the Looking-Glass",
            "The Hunting of the Snark",
            "Sylvie and Bruno",
          ],
        },
        {
          id: "author",
          prompt: "Who wrote Alice's Adventures in Wonderland?",
          correctAnswer: "Lewis Carroll",
          wrongAnswers: ["John Tenniel", "George MacDonald", "J. M. Barrie"],
        },
        {
          id: "publication-year",
          prompt: "In what year was Alice's Adventures in Wonderland published?",
          correctAnswer: "1865",
          wrongAnswers: ["1861", "1867", "1871"],
        },
        {
          id: "genre",
          prompt: "Alice's Adventures in Wonderland is seen as an example of what literary genre?",
          correctAnswer: "Literary nonsense",
          wrongAnswers: ["Children's fantasy", "Adventure fiction", "Victorian realism"],
        },
        {
          id: "illustrations",
          prompt: "How many wood-engraved illustrations did John Tenniel provide for the original edition?",
          correctAnswer: "42",
          wrongAnswers: ["36", "48", "60"],
        },
        {
          id: "languages",
          prompt: "Into how many languages has Alice's Adventures in Wonderland been translated?",
          correctAnswer: "174",
          wrongAnswers: ["124", "154", "204"],
        },
        {
          id: "sequel",
          prompt: "What sequel did Lewis Carroll publish in 1871?",
          correctAnswer: "Through the Looking-Glass",
          wrongAnswers: ["The Hunting of the Snark", "Sylvie and Bruno", "Alice's Adventures Under Ground"],
        },
        {
          id: "nursery-alice",
          prompt: "What shortened version for young children did Lewis Carroll publish in 1890?",
          correctAnswer: 'The Nursery "Alice"',
          wrongAnswers: ["Alice's Adventures Under Ground", "Through the Looking-Glass", "The Hunting of the Snark"],
        },
        {
          id: "manuscript-illustrator",
          prompt: "Who illustrated the manuscript of Alice's Adventures in Wonderland?",
          correctAnswer: "Lewis Carroll",
          wrongAnswers: ["John Tenniel", "Walt Disney", "J. M. Barrie"],
        },
        {
          id: "disney-quote",
          prompt: 'Who said, "No story in English literature has intrigued me more than Lewis Carroll\'s Alice in Wonderland. It fascinated me the first time I read it as a schoolboy."?',
          correctAnswer: "Walt Disney",
          wrongAnswers: ["Lewis Carroll", "John Tenniel", "J. M. Barrie"],
        },
      ],
    },
    {
      id: "amelia-earhart",
      name: "Amelia Earhart",
      group: "historical",
      rarity: "Rare",
      regularValue: 235,
      occasionalValue: 70,
      focusTag: "historical",
      image: "../assets/restaurant-challenge/customers/amelia-earhart.jpg",
      questionPlace: "early aviation",
      questionFact: "breaking flying records and pushing aviation forward",
    },
    {
      id: "benjamin-franklin",
      name: "Benjamin Franklin",
      group: "historical",
      rarity: "Rare",
      regularValue: 285,
      occasionalValue: 85,
      focusTag: "historical",
      image: "../assets/restaurant-challenge/customers/benjamin-franklin.jpg",
      questionPlace: "colonial Philadelphia",
      questionFact: "experimenting with electricity and the lightning kite",
    },
    {
      id: "big-bad-wolf",
      name: "Big Bad Wolf",
      group: "storybook",
      rarity: "Rare",
      regularValue: 260,
      occasionalValue: 80,
      focusTag: "storybook",
      image: "../assets/restaurant-challenge/customers/big-bad-wolf.jpg",
      questionPlace: "storybook forests",
      questionFact: "huffing and puffing and chasing fairy tale heroes",
    },
    {
      id: "billy-the-kid",
      name: "Billy the Kid",
      group: "historical",
      rarity: "Uncommon",
      regularValue: 185,
      occasionalValue: 55,
      focusTag: "historical",
      image: "../assets/restaurant-challenge/customers/billy-the-kid.jpg",
      questionPlace: "the American frontier",
      questionFact: "becoming a notorious outlaw of the Old West",
    },
    {
      id: "blackbeard-the-pirate",
      name: "Blackbeard the Pirate",
      group: "historical",
      rarity: "Rare",
      regularValue: 250,
      occasionalValue: 75,
      focusTag: "historical",
      image: "../assets/restaurant-challenge/customers/blackbeard-the-pirate.jpg",
      questionPlace: "the high seas",
      questionFact: "becoming one of history's most feared pirates",
    },
    {
      id: "cheshire-cat",
      name: "Cheshire Cat",
      group: "storybook",
      rarity: "Rare",
      regularValue: 175,
      occasionalValue: 55,
      focusTag: "storybook",
      image: "../assets/restaurant-challenge/customers/cheshire-cat.jpg",
      questionPlace: "Wonderland",
      questionFact: "the disappearing grin and mysterious advice",
    },
    {
      id: "christopher-columbus",
      name: "Christopher Columbus",
      group: "historical",
      rarity: "Rare",
      regularValue: 220,
      occasionalValue: 65,
      focusTag: "historical",
      image: "../assets/restaurant-challenge/customers/christopher-columbus.jpg",
      questionPlace: "the Atlantic crossing",
      questionFact: "sailing west across the Atlantic in 1492",
      customQuestions: [
        {
          id: "birthplace",
          prompt: "Where was Christopher Columbus born?",
          correctAnswer: "Genoa, Italy",
          wrongAnswers: ["Seville, Spain", "Lisbon, Portugal", "Venice, Italy"],
        },
        {
          id: "goal",
          prompt: "What was Christopher Columbus trying to find by sailing west?",
          correctAnswer: "A faster route to Asia",
          wrongAnswers: ["The North Pole", "The source of the Nile", "A passage to Australia"],
        },
        {
          id: "first-voyage-ships",
          prompt: "Which three ships sailed on Columbus's first voyage?",
          correctAnswer: "The Niña, Pinta, and Santa Maria",
          wrongAnswers: [
            "The Mayflower, Endeavour, and Beagle",
            "The Nina, Nina, and Nina",
            "The Victory, Constitution, and Enterprise",
          ],
        },
        {
          id: "first-landfall",
          prompt: "Where did Columbus first land in 1492?",
          correctAnswer: "San Salvador in the Bahamas",
          wrongAnswers: ["Hispaniola", "Jamaica", "Cuba"],
        },
        {
          id: "death",
          prompt: "In what year did Christopher Columbus die?",
          correctAnswer: "1506",
          wrongAnswers: ["1498", "1512", "1520"],
        },
        {
          id: "cuba-thought-asia",
          prompt: "What did Columbus think he had reached when he landed in the Bahamas?",
          correctAnswer: "Asia",
          wrongAnswers: ["Africa", "Europe", "Australia"],
        },
      ],
    },
    {
      id: "cleopatra",
      name: "Cleopatra",
      group: "historical",
      rarity: "Rare",
      regularValue: 320,
      occasionalValue: 100,
      focusTag: "historical",
      image: "../assets/restaurant-challenge/customers/cleopatra.jpg",
      questionPlace: "ancient Egypt",
      questionFact: "ruling Egypt as a famous queen",
      customQuestions: [
        {
          id: "last-active-ruler",
          prompt: "Cleopatra was the last active ruler of which kingdom?",
          correctAnswer: "The Ptolemaic Kingdom of Egypt",
          wrongAnswers: ["The Roman Empire", "The Byzantine Empire", "The Macedonian Empire"],
        },
        {
          id: "birthplace",
          prompt: "In what city was Cleopatra born?",
          correctAnswer: "Alexandria, Egypt",
          wrongAnswers: ["Thebes, Egypt", "Memphis, Egypt", "Athens, Greece"],
        },
        {
          id: "queen-age",
          prompt: "At what age did Cleopatra become queen?",
          correctAnswer: "18",
          wrongAnswers: ["14", "21", "25"],
        },
        {
          id: "alliances",
          prompt: "Which two Roman leaders was Cleopatra allied with?",
          correctAnswer: "Julius Caesar and Mark Antony",
          wrongAnswers: [
            "Pompey and Crassus",
            "Brutus and Cassius",
            "Nero and Caligula",
          ],
        },
        {
          id: "death-year",
          prompt: "In what year did Cleopatra die?",
          correctAnswer: "30 BC",
          wrongAnswers: ["44 BC", "12 BC", "1 AD"],
        },
        {
          id: "film",
          prompt: "Who starred as Cleopatra in the famous 1963 film Cleopatra?",
          correctAnswer: "Elizabeth Taylor",
          wrongAnswers: ["Vivien Leigh", "Audrey Hepburn", "Sophia Loren"],
        },
      ],
    },
    {
      id: "george-washington",
      name: "George Washington",
      group: "historical",
      rarity: "Rare",
      regularValue: 295,
      occasionalValue: 90,
      focusTag: "historical",
      image: "../assets/restaurant-challenge/customers/george-washington.jpg",
      questionPlace: "the Revolutionary era",
      questionFact: "leading the Continental Army and becoming the first U.S. president",
      customQuestions: [
        {
          id: "born-where",
          prompt: "Where was George Washington born?",
          correctAnswer: "Westmoreland County, Virginia",
          wrongAnswers: ["Boston, Massachusetts", "Philadelphia, Pennsylvania", "Annapolis, Maryland"],
        },
        {
          id: "born-when",
          prompt: "When was George Washington born?",
          correctAnswer: "February 22, 1732",
          wrongAnswers: ["July 4, 1776", "March 15, 1765", "December 14, 1799"],
        },
        {
          id: "parents",
          prompt: "What were George Washington's parents' names?",
          correctAnswer: "Augustine and Mary Ball Washington",
          wrongAnswers: [
            "Thomas and Nancy Washington",
            "John and Abigail Washington",
            "George and Martha Washington",
          ],
        },
        {
          id: "first-president",
          prompt: "What important office did George Washington hold after the Revolution?",
          correctAnswer: "The first President of the United States",
          wrongAnswers: ["The first Vice President of the United States", "Commander of the Royal Navy", "Chief Justice of the Supreme Court"],
        },
        {
          id: "wife",
          prompt: "What was George Washington's wife's name?",
          correctAnswer: "Martha Custis",
          wrongAnswers: ["Mary Ball", "Dolley Madison", "Abigail Adams"],
        },
        {
          id: "death",
          prompt: "Where did George Washington die?",
          correctAnswer: "Mount Vernon, Virginia",
          wrongAnswers: ["Valley Forge, Pennsylvania", "Yorktown, Virginia", "West Point, New York"],
        },
      ],
    },
    {
      id: "humpty-dumpty",
      name: "Humpty Dumpty",
      group: "storybook",
      rarity: "Common",
      regularValue: 120,
      occasionalValue: 30,
      focusTag: "storybook",
      image: "../assets/restaurant-challenge/customers/humpty-dumpty.jpg",
      questionPlace: "a wall in nursery rhymes",
      questionFact: "having a great fall that could not be put back together",
      customQuestions: [
        {
          id: "egg",
          prompt: "What is Humpty Dumpty traditionally depicted as?",
          correctAnswer: "An anthropomorphic egg",
          wrongAnswers: ["A tin soldier", "A toy monkey", "A talking hat"],
        },
        {
          id: "wall-fall",
          prompt: "What happened to Humpty Dumpty in the rhyme?",
          correctAnswer: "He had a great fall from a wall",
          wrongAnswers: [
            "He sailed across the sea",
            "He disappeared into a forest",
            "He climbed a mountain and won",
          ],
        },
        {
          id: "original-riddle",
          prompt: "What was the nursery rhyme originally likely meant to be?",
          correctAnswer: "A riddle about something that could sit on a wall and not be put back together",
          wrongAnswers: [
            "A song about a pirate ship",
            "A poem about a royal wedding",
            "A joke about a circus clown",
          ],
        },
        {
          id: "looking-glass",
          prompt: "In which Lewis Carroll book did Humpty Dumpty become widely recognized as an egg?",
          correctAnswer: "Through the Looking-Glass",
          wrongAnswers: ["Alice's Adventures in Wonderland", "The Hunting of the Snark", "Sylvie and Bruno"],
        },
        {
          id: "first-recorded-year",
          prompt: "In what year did the earliest recorded version of the Humpty Dumpty rhyme appear?",
          correctAnswer: "1797",
          wrongAnswers: ["1687", "1812", "1870"],
        },
        {
          id: "symbol",
          prompt: "What does Humpty Dumpty often symbolize?",
          correctAnswer: "Fragility and irreversibility",
          wrongAnswers: ["Speed and adventure", "Wisdom and patience", "Luck and fortune"],
        },
      ],
    },
    {
      id: "king-tut",
      name: "King Tut",
      group: "historical",
      rarity: "Rare",
      regularValue: 315,
      occasionalValue: 95,
      focusTag: "historical",
      image: "../assets/restaurant-challenge/customers/king-tut.jpg",
      questionPlace: "ancient Egypt",
      questionFact: "being the boy pharaoh of a famous tomb",
      customQuestions: [
        {
          id: "full-name",
          prompt: "What was King Tut's full name?",
          correctAnswer: "Tutankhamun",
          wrongAnswers: ["Tutankhaten", "Ramses II", "Amenhotep III"],
        },
        {
          id: "birth-name",
          prompt: "What was King Tut originally named before his religious reforms?",
          correctAnswer: "Tutankhaten",
          wrongAnswers: ["Tutmosis", "Akhenaten", "Khafre"],
        },
        {
          id: "age-at-pharaoh",
          prompt: "About how old was King Tut when he became pharaoh?",
          correctAnswer: "Eight or nine",
          wrongAnswers: ["Five or six", "Twelve or thirteen", "Sixteen or seventeen"],
        },
        {
          id: "religion",
          prompt: "What did King Tut restore during his reign?",
          correctAnswer: "Egypt's polytheistic religion and the cult of Amun-Ra",
          wrongAnswers: [
            "A Roman republic",
            "Greek democracy",
            "A monotheistic solar cult",
          ],
        },
        {
          id: "death-age",
          prompt: "About how old was King Tut when he died?",
          correctAnswer: "17 or 18",
          wrongAnswers: ["12 or 13", "25 or 26", "30 or 31"],
        },
        {
          id: "valley-of-kings",
          prompt: "Where are the tombs of pharaohs, including Tutankhamun, located?",
          correctAnswer: "The Valley of the Kings",
          wrongAnswers: ["The Giza Plateau", "The Nile Delta", "The Sinai Peninsula"],
        },
        {
          id: "cairo-museum",
          prompt: "Which city is home to the Egyptian Museum that houses treasures from Tutankhamun's tomb?",
          correctAnswer: "Cairo",
          wrongAnswers: ["Alexandria", "Luxor", "Aswan"],
        },
        {
          id: "pyramid-khufu",
          prompt: "Which pyramid at Giza is the largest?",
          correctAnswer: "The Pyramid of Khufu",
          wrongAnswers: ["The Pyramid of Menkaure", "The Pyramid of Djoser", "The Bent Pyramid"],
        },
        {
          id: "mummification",
          prompt: "What process did ancient Egyptians use to preserve bodies for the afterlife?",
          correctAnswer: "Mummification",
          wrongAnswers: ["Embroidery", "Carpentry", "Calligraphy"],
        },
        {
          id: "discovery-year",
          prompt: "In what year was Tutankhamun's tomb discovered by Howard Carter?",
          correctAnswer: "1922",
          wrongAnswers: ["1905", "1918", "1931"],
        },
      ],
    },
    {
      id: "little-red-riding-hood",
      name: "Little Red Riding Hood",
      group: "storybook",
      rarity: "Common",
      regularValue: 130,
      occasionalValue: 35,
      focusTag: "storybook",
      image: "../assets/restaurant-challenge/customers/little-red-riding-hood.jpg",
      questionPlace: "the woods",
      questionFact: "wearing a red hood while visiting her grandmother",
    },
    {
      id: "mad-hatter",
      name: "Mad Hatter",
      group: "storybook",
      rarity: "Uncommon",
      regularValue: 160,
      occasionalValue: 50,
      focusTag: "storybook",
      image: "../assets/restaurant-challenge/customers/mad-hatter.jpg",
      questionPlace: "the Wonderland tea party",
      questionFact: "throwing a very strange tea party",
    },
    {
      id: "napoleon-bonaparte",
      name: "Napoleon Bonaparte",
      group: "historical",
      rarity: "Rare",
      regularValue: 240,
      occasionalValue: 70,
      focusTag: "historical",
      image: "../assets/restaurant-challenge/customers/napoleon-bonaparte.jpg",
      questionPlace: "France",
      questionFact: "becoming a powerful French emperor and military leader",
    },
    {
      id: "queen-of-hearts",
      name: "Queen of Hearts",
      group: "storybook",
      rarity: "Rare",
      regularValue: 190,
      occasionalValue: 60,
      focusTag: "storybook",
      image: "../assets/restaurant-challenge/customers/queen-of-hearts.jpg",
      questionPlace: "Wonderland",
      questionFact: "ordering everyone around with 'Off with their heads!'",
    },
    {
      id: "sasquatch",
      name: "Sasquatch",
      group: "cryptid",
      rarity: "Rare",
      regularValue: 210,
      occasionalValue: 65,
      focusTag: "cryptid",
      image: "../assets/restaurant-challenge/customers/sasquatch.jpg",
      questionPlace: "the deep woods",
      questionFact: "being the giant mystery creature known as Bigfoot",
    },
    {
      id: "the-tooth-fairy",
      name: "The Tooth Fairy",
      group: "storybook",
      rarity: "Uncommon",
      regularValue: 105,
      occasionalValue: 30,
      focusTag: "storybook",
      image: "../assets/restaurant-challenge/customers/the-tooth-fairy.jpg",
      questionPlace: "under children's pillows",
      questionFact: "swapping lost teeth for a little money",
    },
    {
      id: "thomas-edison",
      name: "Thomas Edison",
      group: "historical",
      rarity: "Rare",
      regularValue: 245,
      occasionalValue: 75,
      focusTag: "historical",
      image: "../assets/restaurant-challenge/customers/thomas-edison.jpg",
      questionPlace: "the invention lab",
      questionFact: "perfecting the practical electric light bulb",
    },
    {
      id: "lady-liberty",
      name: "Lady Liberty",
      group: "historical",
      rarity: "Rare",
      regularValue: 350,
      occasionalValue: 110,
      focusTag: "historical",
      image: "../assets/restaurant-challenge/customers/lady-liberty.jpg",
      questionPlace: "New York Harbor",
      questionFact: "standing as a symbol of freedom and welcome",
    },
  ];

  let customers = [];

  function normalizeRestaurant(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw || raw === "shared") {
      return "shared";
    }

    if (raw === "americana" || raw === "americana-diner" || raw === "americana diner") {
      return "americana";
    }

    if (["communityverse", "historical", "storybook", "cryptid", "exclusive"].includes(raw)) {
      return "shared";
    }

    return raw.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "shared";
  }

  function normalizeCharacterType(value) {
    return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function restaurantLabel(value) {
    const restaurant = String(value || "").trim().toLowerCase();
    if (!restaurant || restaurant === "shared") {
      return "all restaurants";
    }

    if (restaurant === "americana") {
      return "Americana Diner";
    }

    return restaurant
      .split("-")
      .filter(Boolean)
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(" ");
  }

  function normalizeAssetPath(value) {
    const path = String(value || "").trim();
    return path.replace(/^(?:\.\.\/)+assets\//, "/assets/").replace(/^\.\/assets\//, "/assets/");
  }

  function normalizeRestaurantRecord(restaurant) {
    const safeRestaurant = typeof restaurant === "object" && restaurant ? structuredClone(restaurant) : {};
    const slug = slugify(safeRestaurant.slug || safeRestaurant.name);
    safeRestaurant.id = String(safeRestaurant.id || slug).trim();
    safeRestaurant.slug = slug;
    safeRestaurant.name = String(safeRestaurant.name || "").trim();
    safeRestaurant.publicGameName = String(safeRestaurant.publicGameName || "").trim();
    safeRestaurant.description = String(safeRestaurant.description || "").trim();
    safeRestaurant.location = String(safeRestaurant.location || "").trim();
    safeRestaurant.areaSlug = slugify(safeRestaurant.areaSlug || "");
    safeRestaurant.primaryColor = String(safeRestaurant.primaryColor || "").trim();
    safeRestaurant.secondaryColor = String(safeRestaurant.secondaryColor || "").trim();
    safeRestaurant.accentColor = String(safeRestaurant.accentColor || "").trim();
    safeRestaurant.heroImage = normalizeAssetPath(safeRestaurant.heroImage);
    safeRestaurant.logoSquare = normalizeAssetPath(safeRestaurant.logoSquare);
    safeRestaurant.logoHorizontal = normalizeAssetPath(safeRestaurant.logoHorizontal || safeRestaurant.logoSquare);
    safeRestaurant.squareImage = normalizeAssetPath(safeRestaurant.squareImage || safeRestaurant.logoSquare);
    safeRestaurant.openingCopy = String(safeRestaurant.openingCopy || "").trim();
    safeRestaurant.active = safeRestaurant.active !== false;
    safeRestaurant.playable = safeRestaurant.playable !== false;
    safeRestaurant.visibleInList = safeRestaurant.visibleInList !== false;
    safeRestaurant.includeAreaQuestions =
      safeRestaurant.includeAreaQuestions ??
      safeRestaurant.include_area_questions ??
      !["americana", "wafflemaster"].includes(safeRestaurant.slug);
    safeRestaurant.includeAreaQuestions = safeRestaurant.includeAreaQuestions !== false;
    safeRestaurant.sortOrder = Number(safeRestaurant.sortOrder) || 0;
    return safeRestaurant;
  }

  function setRestaurantBank(entries) {
    const normalizedRestaurants = (Array.isArray(entries) ? entries : [])
      .map(normalizeRestaurantRecord)
      .filter((restaurant) => restaurant.slug && restaurant.name);
    if (!normalizedRestaurants.length) {
      return;
    }

    restaurants.splice(0, restaurants.length, ...normalizedRestaurants);
  }

  async function refreshRestaurantBankFromServer() {
    if (!USE_REMOTE_SYNC) {
      return;
    }

    try {
      const remoteRestaurants = await requestJson("/restaurants", { method: "GET" });
      if (Array.isArray(remoteRestaurants) && remoteRestaurants.length) {
        setRestaurantBank(remoteRestaurants);
      }
    } catch {
      // Keep the built-in Americana restaurant if the remote restaurant list is unavailable.
    }
  }

  function normalizeCustomer(customer) {
    const safeCustomer = typeof customer === "object" && customer ? structuredClone(customer) : {};
    safeCustomer.id = String(safeCustomer.id || "").trim();
    safeCustomer.name = String(safeCustomer.name || "").trim();
    safeCustomer.characterType = normalizeCharacterType(
      safeCustomer.characterType || safeCustomer.group || safeCustomer.groupName || ""
    );
    safeCustomer.group = safeCustomer.characterType;
    safeCustomer.groupName = safeCustomer.characterType;
    safeCustomer.rarity = String(safeCustomer.rarity || "").trim();
    safeCustomer.regularValue = Number(safeCustomer.regularValue) || 0;
    safeCustomer.occasionalValue = Number(safeCustomer.occasionalValue) || 0;
    safeCustomer.restaurant = normalizeRestaurant(
      safeCustomer.restaurant || safeCustomer.focusTag || safeCustomer.focus_tag || ""
    );
    safeCustomer.focusTag = safeCustomer.restaurant;
    safeCustomer.image = normalizeAssetPath(safeCustomer.image);
    safeCustomer.bio = String(safeCustomer.bio || "").trim();
    safeCustomer.areaSlug = slugify(safeCustomer.areaSlug || safeCustomer.area_slug || "");
    safeCustomer.areaSlugs = Array.isArray(safeCustomer.areaSlugs)
      ? safeCustomer.areaSlugs.map((areaSlug) => slugify(areaSlug)).filter(Boolean)
      : String(safeCustomer.areaSlugs || safeCustomer.area_slugs || "")
        .split(",")
        .map((areaSlug) => slugify(areaSlug))
        .filter(Boolean);
    safeCustomer.location = String(safeCustomer.location || "").trim();
    safeCustomer.tags = Array.isArray(safeCustomer.tags)
      ? safeCustomer.tags.map((tag) => String(tag || "").trim()).filter(Boolean)
      : [];
    safeCustomer.questionPlace = String(safeCustomer.questionPlace || "").trim();
    safeCustomer.questionFact = String(safeCustomer.questionFact || "").trim();
    safeCustomer.active = safeCustomer.active !== false;
    safeCustomer.sortOrder = Number(safeCustomer.sortOrder) || 0;
    safeCustomer.customQuestions = Array.isArray(safeCustomer.customQuestions)
      ? safeCustomer.customQuestions.map((question) => ({
          id: String(question?.id || "").trim(),
          prompt: String(question?.prompt || "").trim(),
          correctAnswer: String(question?.correctAnswer || "").trim(),
          wrongAnswers: Array.isArray(question?.wrongAnswers)
            ? question.wrongAnswers.map((answer) => String(answer || "").trim()).filter(Boolean)
            : [],
          difficulty: String(question?.difficulty || "medium").trim() || "medium",
        })).filter((question) => question.id || question.prompt)
      : [];
    return safeCustomer;
  }

  function normalizeCustomerBank(entries) {
    return (Array.isArray(entries) ? entries : [])
      .map(normalizeCustomer)
      .filter((customer) => customer.id && customer.name);
  }

  function setCustomerBank(entries, source = "local") {
    customers.splice(0, customers.length, ...normalizeCustomerBank(entries));
    if (baseQuestions.length || questions.length) {
      questions.splice(0, questions.length, ...baseQuestions, ...buildCustomerQuestions());
    }
  }

  async function fetchCustomerBankFallback() {
    const response = await window.fetch("/shared/customer-bank.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Customer bank fallback request failed with status " + response.status);
    }

    const data = await response.json();
    return normalizeCustomerBank(data);
  }

  async function refreshCustomerBankFromServer() {
    if (!USE_REMOTE_SYNC) {
      return;
    }

    try {
      const remoteCustomers = await requestJson("/customers", { method: "GET" });
      if (Array.isArray(remoteCustomers) && remoteCustomers.length) {
        setCustomerBank(remoteCustomers, "remote");
        return;
      }
    } catch {
      // Fall back to the seed file below.
    }

    try {
      const fallbackCustomers = await fetchCustomerBankFallback();
      if (fallbackCustomers.length) {
        setCustomerBank(fallbackCustomers, "fallback");
      } else {
        setCustomerBank([], "local");
      }
    } catch {
      setCustomerBank([], "local");
    }
  }

  const QUESTION_BANK_FALLBACK_URL = "/shared/restaurant-question-bank.json";
  let baseQuestions = [];
  const questions = [];

  setCustomerBank(seedCustomers, "local");

  function normalizeQuestion(question) {
    const safeQuestion = typeof question === "object" && question ? structuredClone(question) : {};
    safeQuestion.id = String(safeQuestion.id || "").trim();
    safeQuestion.scope = String(safeQuestion.scope || "").trim();
    safeQuestion.restaurantSlug = String(safeQuestion.restaurantSlug || "").trim();
    safeQuestion.areaSlug = String(safeQuestion.areaSlug || "").trim();
    safeQuestion.prompt = String(safeQuestion.prompt || "").trim();
    safeQuestion.correctAnswer = String(safeQuestion.correctAnswer || "").trim();
    safeQuestion.wrongAnswers = Array.isArray(safeQuestion.wrongAnswers)
      ? safeQuestion.wrongAnswers.map((answer) => String(answer || "").trim()).filter(Boolean)
      : [];
    safeQuestion.tags = Array.isArray(safeQuestion.tags)
      ? safeQuestion.tags.map((tag) => String(tag || "").trim()).filter(Boolean)
      : [];
    safeQuestion.customerIds = Array.isArray(safeQuestion.customerIds)
      ? safeQuestion.customerIds.map((customerId) => String(customerId || "").trim()).filter(Boolean)
      : [];
    safeQuestion.difficulty = String(safeQuestion.difficulty || "medium").trim() || "medium";
    safeQuestion.image = normalizeAssetPath(safeQuestion.image);
    safeQuestion.imageAlt = String(safeQuestion.imageAlt || "").trim();
    safeQuestion.imagePrompt = String(safeQuestion.imagePrompt || "").trim();
    safeQuestion.active = safeQuestion.active !== false;
    safeQuestion.sortOrder = Number(safeQuestion.sortOrder) || 0;
    return safeQuestion;
  }

  function normalizeQuestionBank(entries) {
    return (Array.isArray(entries) ? entries : [])
      .map(normalizeQuestion)
      .filter((question) => question.id && question.prompt && question.correctAnswer);
  }

  function setQuestionBank(entries, source = "local") {
    baseQuestions = normalizeQuestionBank(entries);
    questions.splice(0, questions.length, ...baseQuestions, ...buildCustomerQuestions());
  }

  async function fetchQuestionBankFallback() {
    const response = await window.fetch(QUESTION_BANK_FALLBACK_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Question bank fallback request failed with status " + response.status);
    }

    const data = await response.json();
    return normalizeQuestionBank(data);
  }

  async function refreshQuestionBankFromServer() {
    if (!USE_REMOTE_SYNC) {
      return;
    }

    try {
      const remoteQuestions = await requestJson("/questions", { method: "GET" });
      if (Array.isArray(remoteQuestions) && remoteQuestions.length) {
        setQuestionBank(remoteQuestions, "remote");
        return;
      }
    } catch {
      // Fall back to the seed file below.
    }

    try {
      const fallbackQuestions = await fetchQuestionBankFallback();
      if (fallbackQuestions.length) {
        setQuestionBank(fallbackQuestions, "fallback");
      } else {
        setQuestionBank([], "local");
      }
    } catch {
      setQuestionBank([], "local");
    }
  }

  function uniqueWrongAnswers(pool, correctAnswer, count = 3) {
    const normalizedCorrect = normalizeText(correctAnswer);
    const seen = new Set([normalizedCorrect]);
    const answers = [];

    shuffle(pool).forEach((candidate) => {
      const normalizedCandidate = normalizeText(candidate);
      if (!normalizedCandidate || seen.has(normalizedCandidate)) {
        return;
      }

      seen.add(normalizedCandidate);
      answers.push(candidate);
    });

    return answers.slice(0, count);
  }

  function orderedWrongAnswers(pool, correctAnswer, count = 3) {
    const normalizedCorrect = normalizeText(correctAnswer);
    const seen = new Set([normalizedCorrect]);
    const answers = [];

    pool.forEach((candidate) => {
      const normalizedCandidate = normalizeText(candidate);
      if (!normalizedCandidate || seen.has(normalizedCandidate)) {
        return;
      }

      seen.add(normalizedCandidate);
      answers.push(candidate);
    });

    return answers.slice(0, count);
  }

  function customerQuestionGroup(customer) {
    const type = normalizeCharacterType(customer.characterType || customer.group || customer.groupName || "");
    const searchable = normalizeText(
      [
        customer.name,
        customer.questionPlace,
        customer.questionFact,
        customer.bio,
        customer.restaurant,
      ].filter(Boolean).join(" ")
    );
    if (
      /douglasville|douglas county|commissioner|postmaster|mayor|county|courthouse|founder|pioneer|historic|history/.test(searchable)
    ) {
      return "local-history";
    }
    if (/waitress|diner|restaurant|menu|breakfast|burger|pie|dessert|food|server|cook|chef/.test(searchable)) {
      return "restaurant";
    }
    if (type === "historical") {
      return "historical";
    }
    if (type === "storybook" || type === "cryptid") {
      return "storybook";
    }
    if (type === "communityverse" || type === "exclusive") {
      return "local";
    }
    return type || "customer";
  }

  function topicWrongAnswerBank(group, kind) {
    const factBanks = {
      "local-history": [
        "serving as an early mayor of Douglasville",
        "publishing one of Douglas County's first newspapers",
        "helping bring the railroad through early Douglasville",
        "operating an early general store in Douglas County",
        "donating land for one of Douglasville's first public buildings",
        "serving as an early judge in Douglas County",
      ],
      historical: [
        "serving as a famous Civil War general",
        "signing an important early American treaty",
        "leading a major expedition across the American frontier",
        "serving as an early governor during a time of expansion",
        "writing a famous speech remembered in American history",
        "commanding troops in a major national conflict",
      ],
      storybook: [
        "following a mysterious path through an enchanted forest",
        "solving a riddle in a magical kingdom",
        "meeting strange characters on a fairy-tale journey",
        "protecting a hidden treasure in an old story",
        "escaping trouble with a clever trick",
        "making a famous wish that changed the story",
      ],
      restaurant: [
        "creating a signature dish that regulars still order",
        "running the busiest breakfast shift in town",
        "winning a local dessert contest",
        "welcoming guests at a favorite neighborhood restaurant",
        "serving a famous house special",
        "helping make the restaurant a local gathering place",
      ],
    };
    const placeBanks = {
      "local-history": [
        "early Douglasville",
        "the old Douglas County courthouse square",
        "historic downtown Douglasville",
        "an early Douglas County post office",
        "the railroad-era center of Douglasville",
        "a pioneer community in west Georgia",
      ],
      historical: [
        "the American frontier",
        "the Civil War era",
        "colonial America",
        "the Revolutionary era",
        "a nineteenth-century battlefield",
        "early American public life",
      ],
      storybook: [
        "an enchanted forest",
        "a fairy-tale village",
        "a mysterious castle",
        "a magical garden",
        "a storybook road",
        "a hidden kingdom",
      ],
      restaurant: [
        "a busy diner counter",
        "a neighborhood restaurant kitchen",
        "a local breakfast spot",
        "a family dining room",
        "a dessert display case",
        "a hometown cafe",
      ],
    };
    const banks = kind === "place" ? placeBanks : factBanks;
    return banks[group] || [];
  }

  function addToQuestionPool(pools, group, value) {
    const answer = String(value || "").trim();
    if (!answer) {
      return;
    }

    if (!pools.has(group)) {
      pools.set(group, []);
    }

    pools.get(group).push(answer);
  }

  function groupedWrongAnswers(groupedPool, fallbackPool, group, correctAnswer, count = 3, kind = "fact") {
    const topicBank = topicWrongAnswerBank(group, kind);
    const primary = groupedPool.get(group) || [];
    const relatedGroups = group === "local-history" ? ["historical"] : group === "historical" ? ["local-history"] : [];
    const related = relatedGroups.flatMap((relatedGroup) => groupedPool.get(relatedGroup) || []);
    const combined = [...shuffle(topicBank), ...shuffle(primary), ...shuffle(related), ...shuffle(fallbackPool)];
    return orderedWrongAnswers(combined, correctAnswer, count);
  }

  function buildCustomerQuestions() {
    const featuredCustomers = customers.filter(
      (customer) => customer.questionPlace && customer.questionFact
    );

    const placePool = Array.from(
      new Set(featuredCustomers.map((customer) => customer.questionPlace).filter(Boolean))
    );
    const factPool = Array.from(
      new Set(featuredCustomers.map((customer) => customer.questionFact).filter(Boolean))
    );
    const placePoolsByGroup = new Map();
    const factPoolsByGroup = new Map();

    featuredCustomers.forEach((customer) => {
      const group = customerQuestionGroup(customer);
      addToQuestionPool(placePoolsByGroup, group, customer.questionPlace);
      addToQuestionPool(factPoolsByGroup, group, customer.questionFact);
    });

    const generated = [];

    featuredCustomers.forEach((customer) => {
      const questionGroup = customerQuestionGroup(customer);
      if (Array.isArray(customer.customQuestions) && customer.customQuestions.length) {
        customer.customQuestions.forEach((question) => {
          generated.push({
            id: `customer-${customer.id}-${question.id}`,
            scope: "customer",
            customerIds: [customer.id],
            tags: [
              customer.characterType || customer.group || "customer",
              customer.restaurant && customer.restaurant !== "shared" ? customer.restaurant : "",
            ].filter(Boolean),
            difficulty: question.difficulty || "hard",
            prompt: question.prompt,
            correctAnswer: question.correctAnswer,
            wrongAnswers: question.wrongAnswers || [],
          });
        });
        return;
      }

      generated.push({
        id: `customer-${customer.id}-place`,
        scope: "customer",
        customerIds: [customer.id],
        tags: [
          customer.characterType || customer.group || "customer",
          customer.restaurant && customer.restaurant !== "shared" ? customer.restaurant : "",
        ].filter(Boolean),
        difficulty: "hard",
        prompt: `Which place or story is ${customer.name} most associated with?`,
        correctAnswer: customer.questionPlace,
        wrongAnswers: groupedWrongAnswers(placePoolsByGroup, placePool, questionGroup, customer.questionPlace, 3, "place"),
      });

      generated.push({
        id: `customer-${customer.id}-fact`,
        scope: "customer",
        customerIds: [customer.id],
        tags: [
          customer.characterType || customer.group || "customer",
          customer.restaurant && customer.restaurant !== "shared" ? customer.restaurant : "",
        ].filter(Boolean),
        difficulty: "hard",
        prompt: `What is ${customer.name} best known for?`,
        correctAnswer: customer.questionFact,
        wrongAnswers: groupedWrongAnswers(factPoolsByGroup, factPool, questionGroup, customer.questionFact, 3),
      });

      if (customer.characterType === "historical") {
        generated.push({
          id: `customer-${customer.id}-clue`,
          scope: "customer",
          customerIds: [customer.id],
          tags: [
            customer.characterType || customer.group || "customer",
            customer.restaurant && customer.restaurant !== "shared" ? customer.restaurant : "",
          ].filter(Boolean),
          difficulty: "hard",
          prompt: `Which clue best matches ${customer.name}?`,
          correctAnswer: customer.questionFact,
          wrongAnswers: groupedWrongAnswers(factPoolsByGroup, factPool, questionGroup, customer.questionFact, 3),
        });
      }
    });

    return generated;
  }

  setQuestionBank([], "local");

  function buildDemoCollection(entries) {
    return entries.map((entry, index) => {
      const customer = customers.find((candidate) => candidate.id === entry.customerId);
      const dateWon = entry.dateWon || `2026-05-${String(31 - index).padStart(2, "0")}T12:00:00.000Z`;

      return {
        customerId: entry.customerId,
        customerName: customer ? customer.name : entry.customerId,
        status: entry.status,
        restaurantSlug: "americana",
        restaurantName: "Americana Diner",
        dateWon,
      };
    });
  }

  const demoProfiles = [
    {
      id: "demo-tims-roadhouse",
      playerName: "Demo Player 1",
      restaurantName: "Tim's Roadhouse",
      restaurantSlug: "tims-roadhouse",
      createdAt: "2026-05-18T12:00:00.000Z",
      lastPlayedAt: "2026-05-31T14:15:00.000Z",
      stats: {
        gamesPlayed: 14,
        totalCorrectAnswers: 108,
        regularCustomers: 0,
        occasionalCustomers: 0,
        lostCustomers: 0,
        totalCustomerValue: 0,
        estimatedSales: 0,
      },
      restaurantStats: {
        americana: {
          gamesPlayed: 14,
          totalCorrectAnswers: 108,
          regularCustomers: 0,
          occasionalCustomers: 0,
          lostCustomers: 0,
          totalCustomerValue: 0,
          estimatedSales: 0,
        },
      },
      customerCollection: buildDemoCollection([
        { customerId: "savannah-pierce", status: "regular", dateWon: "2026-05-31T14:15:00.000Z" },
        { customerId: "curtis-coolwater", status: "regular", dateWon: "2026-05-30T14:15:00.000Z" },
        { customerId: "pastor-caleb-brooks", status: "regular", dateWon: "2026-05-29T14:15:00.000Z" },
        { customerId: "ming-wu", status: "occasional", dateWon: "2026-05-28T14:15:00.000Z" },
        { customerId: "abraham-lincoln", status: "regular", dateWon: "2026-05-27T14:15:00.000Z" },
        { customerId: "mad-hatter", status: "regular", dateWon: "2026-05-26T14:15:00.000Z" },
        { customerId: "cleopatra", status: "regular", dateWon: "2026-05-25T14:15:00.000Z" },
        { customerId: "george-washington", status: "occasional", dateWon: "2026-05-24T14:15:00.000Z" },
        { customerId: "humpty-dumpty", status: "regular", dateWon: "2026-05-23T14:15:00.000Z" },
        { customerId: "alice-in-wonderland", status: "regular", dateWon: "2026-05-22T14:15:00.000Z" },
        { customerId: "benjamin-franklin", status: "regular", dateWon: "2026-05-21T14:15:00.000Z" },
        { customerId: "sasquatch", status: "lost", dateWon: "2026-05-20T14:15:00.000Z" },
      ]),
      recentSessions: [],
    },
    {
      id: "demo-pepper-creek",
      playerName: "Demo Player 2",
      restaurantName: "Pepper Creek Cafe",
      restaurantSlug: "pepper-creek-cafe",
      createdAt: "2026-05-20T12:00:00.000Z",
      lastPlayedAt: "2026-05-31T16:40:00.000Z",
      stats: {
        gamesPlayed: 11,
        totalCorrectAnswers: 86,
        regularCustomers: 0,
        occasionalCustomers: 0,
        lostCustomers: 0,
        totalCustomerValue: 0,
        estimatedSales: 0,
      },
      restaurantStats: {
        americana: {
          gamesPlayed: 11,
          totalCorrectAnswers: 86,
          regularCustomers: 0,
          occasionalCustomers: 0,
          lostCustomers: 0,
          totalCustomerValue: 0,
          estimatedSales: 0,
        },
      },
      customerCollection: buildDemoCollection([
        { customerId: "queen-of-hearts", status: "regular", dateWon: "2026-05-31T16:40:00.000Z" },
        { customerId: "little-red-riding-hood", status: "regular", dateWon: "2026-05-30T16:40:00.000Z" },
        { customerId: "blackbeard-the-pirate", status: "regular", dateWon: "2026-05-29T16:40:00.000Z" },
        { customerId: "amelia-earhart", status: "regular", dateWon: "2026-05-28T16:40:00.000Z" },
        { customerId: "billy-the-kid", status: "occasional", dateWon: "2026-05-27T16:40:00.000Z" },
        { customerId: "thomas-edison", status: "regular", dateWon: "2026-05-26T16:40:00.000Z" },
        { customerId: "christopher-columbus", status: "regular", dateWon: "2026-05-25T16:40:00.000Z" },
        { customerId: "cheshire-cat", status: "occasional", dateWon: "2026-05-24T16:40:00.000Z" },
        { customerId: "napoleon-bonaparte", status: "regular", dateWon: "2026-05-23T16:40:00.000Z" },
        { customerId: "the-tooth-fairy", status: "lost", dateWon: "2026-05-22T16:40:00.000Z" },
      ]),
      recentSessions: [],
    },
    {
      id: "demo-riverside-diner",
      playerName: "Demo Player 3",
      restaurantName: "Riverside Diner",
      restaurantSlug: "riverside-diner",
      createdAt: "2026-05-22T12:00:00.000Z",
      lastPlayedAt: "2026-05-30T10:20:00.000Z",
      stats: {
        gamesPlayed: 9,
        totalCorrectAnswers: 72,
        regularCustomers: 0,
        occasionalCustomers: 0,
        lostCustomers: 0,
        totalCustomerValue: 0,
        estimatedSales: 0,
      },
      restaurantStats: {
        americana: {
          gamesPlayed: 9,
          totalCorrectAnswers: 72,
          regularCustomers: 0,
          occasionalCustomers: 0,
          lostCustomers: 0,
          totalCustomerValue: 0,
          estimatedSales: 0,
        },
      },
      customerCollection: buildDemoCollection([
        { customerId: "king-tut", status: "regular", dateWon: "2026-05-30T10:20:00.000Z" },
        { customerId: "big-bad-wolf", status: "regular", dateWon: "2026-05-29T10:20:00.000Z" },
        { customerId: "lady-liberty", status: "regular", dateWon: "2026-05-28T10:20:00.000Z" },
        { customerId: "captain-zoogle", status: "occasional", dateWon: "2026-05-27T10:20:00.000Z" },
        { customerId: "joyce-pepper", status: "regular", dateWon: "2026-05-26T10:20:00.000Z" },
        { customerId: "hank-hatley", status: "regular", dateWon: "2026-05-25T10:20:00.000Z" },
        { customerId: "miss-pearl", status: "occasional", dateWon: "2026-05-24T10:20:00.000Z" },
        { customerId: "wicked-jim-devito", status: "regular", dateWon: "2026-05-23T10:20:00.000Z" },
        { customerId: "pie-contest-judge", status: "lost", dateWon: "2026-05-22T10:20:00.000Z" },
      ]),
      recentSessions: [],
    },
    {
      id: "demo-lantern-grill",
      playerName: "Demo Player 4",
      restaurantName: "The Lantern Grill",
      restaurantSlug: "lantern-grill",
      createdAt: "2026-05-24T12:00:00.000Z",
      lastPlayedAt: "2026-05-29T09:05:00.000Z",
      stats: {
        gamesPlayed: 8,
        totalCorrectAnswers: 58,
        regularCustomers: 0,
        occasionalCustomers: 0,
        lostCustomers: 0,
        totalCustomerValue: 0,
        estimatedSales: 0,
      },
      restaurantStats: {
        americana: {
          gamesPlayed: 8,
          totalCorrectAnswers: 58,
          regularCustomers: 0,
          occasionalCustomers: 0,
          lostCustomers: 0,
          totalCustomerValue: 0,
          estimatedSales: 0,
        },
      },
      customerCollection: buildDemoCollection([
        { customerId: "breakfast-regular", status: "regular", dateWon: "2026-05-29T09:05:00.000Z" },
        { customerId: "retired-veteran", status: "regular", dateWon: "2026-05-28T09:05:00.000Z" },
        { customerId: "route-66-tourist", status: "occasional", dateWon: "2026-05-27T09:05:00.000Z" },
        { customerId: "americana-waitress", status: "regular", dateWon: "2026-05-26T09:05:00.000Z" },
        { customerId: "chen-wu-md", status: "occasional", dateWon: "2026-05-25T09:05:00.000Z" },
        { customerId: "cornelius-st-hilton", status: "regular", dateWon: "2026-05-24T09:05:00.000Z" },
        { customerId: "buzz-smiley", status: "lost", dateWon: "2026-05-23T09:05:00.000Z" },
      ]),
      recentSessions: [],
    },
    {
      id: "demo-harbor-grill",
      playerName: "Demo Player 5",
      restaurantName: "Harbor Grill",
      restaurantSlug: "harbor-grill",
      createdAt: "2026-05-25T12:00:00.000Z",
      lastPlayedAt: "2026-05-28T18:10:00.000Z",
      stats: {
        gamesPlayed: 7,
        totalCorrectAnswers: 55,
        regularCustomers: 0,
        occasionalCustomers: 0,
        lostCustomers: 0,
        totalCustomerValue: 0,
        estimatedSales: 0,
      },
      restaurantStats: {
        americana: {
          gamesPlayed: 7,
          totalCorrectAnswers: 55,
          regularCustomers: 0,
          occasionalCustomers: 0,
          lostCustomers: 0,
          totalCustomerValue: 0,
          estimatedSales: 0,
        },
      },
      customerCollection: buildDemoCollection([
        { customerId: "george-washington", status: "regular", dateWon: "2026-05-28T18:10:00.000Z" },
        { customerId: "benjamin-franklin", status: "regular", dateWon: "2026-05-27T18:10:00.000Z" },
        { customerId: "amelia-earhart", status: "occasional", dateWon: "2026-05-26T18:10:00.000Z" },
        { customerId: "pastor-caleb-brooks", status: "regular", dateWon: "2026-05-25T18:10:00.000Z" },
        { customerId: "savannah-pierce", status: "regular", dateWon: "2026-05-24T18:10:00.000Z" },
        { customerId: "curtis-coolwater", status: "lost", dateWon: "2026-05-23T18:10:00.000Z" },
      ]),
      recentSessions: [],
    },
    {
      id: "demo-bluebird-bistro",
      playerName: "Demo Player 6",
      restaurantName: "Bluebird Bistro",
      restaurantSlug: "bluebird-bistro",
      createdAt: "2026-05-26T12:00:00.000Z",
      lastPlayedAt: "2026-05-27T13:40:00.000Z",
      stats: {
        gamesPlayed: 6,
        totalCorrectAnswers: 44,
        regularCustomers: 0,
        occasionalCustomers: 0,
        lostCustomers: 0,
        totalCustomerValue: 0,
        estimatedSales: 0,
      },
      restaurantStats: {
        americana: {
          gamesPlayed: 6,
          totalCorrectAnswers: 44,
          regularCustomers: 0,
          occasionalCustomers: 0,
          lostCustomers: 0,
          totalCustomerValue: 0,
          estimatedSales: 0,
        },
      },
      customerCollection: buildDemoCollection([
        { customerId: "alice-in-wonderland", status: "regular", dateWon: "2026-05-27T13:40:00.000Z" },
        { customerId: "mad-hatter", status: "regular", dateWon: "2026-05-26T13:40:00.000Z" },
        { customerId: "cheshire-cat", status: "regular", dateWon: "2026-05-25T13:40:00.000Z" },
        { customerId: "queen-of-hearts", status: "occasional", dateWon: "2026-05-24T13:40:00.000Z" },
        { customerId: "little-red-riding-hood", status: "lost", dateWon: "2026-05-23T13:40:00.000Z" },
      ]),
      recentSessions: [],
    },
    {
      id: "demo-copper-kettle",
      playerName: "Demo Player 7",
      restaurantName: "Copper Kettle",
      restaurantSlug: "copper-kettle",
      createdAt: "2026-05-27T12:00:00.000Z",
      lastPlayedAt: "2026-05-26T11:25:00.000Z",
      stats: {
        gamesPlayed: 5,
        totalCorrectAnswers: 37,
        regularCustomers: 0,
        occasionalCustomers: 0,
        lostCustomers: 0,
        totalCustomerValue: 0,
        estimatedSales: 0,
      },
      restaurantStats: {
        americana: {
          gamesPlayed: 5,
          totalCorrectAnswers: 37,
          regularCustomers: 0,
          occasionalCustomers: 0,
          lostCustomers: 0,
          totalCustomerValue: 0,
          estimatedSales: 0,
        },
      },
      customerCollection: buildDemoCollection([
        { customerId: "christopher-columbus", status: "regular", dateWon: "2026-05-26T11:25:00.000Z" },
        { customerId: "napoleon-bonaparte", status: "regular", dateWon: "2026-05-25T11:25:00.000Z" },
        { customerId: "cleopatra", status: "occasional", dateWon: "2026-05-24T11:25:00.000Z" },
        { customerId: "abraham-lincoln", status: "lost", dateWon: "2026-05-23T11:25:00.000Z" },
      ]),
      recentSessions: [],
    },
    {
      id: "demo-sunrise-spoon",
      playerName: "Demo Player 8",
      restaurantName: "Sunrise Spoon",
      restaurantSlug: "sunrise-spoon",
      createdAt: "2026-05-28T12:00:00.000Z",
      lastPlayedAt: "2026-05-25T08:45:00.000Z",
      stats: {
        gamesPlayed: 4,
        totalCorrectAnswers: 31,
        regularCustomers: 0,
        occasionalCustomers: 0,
        lostCustomers: 0,
        totalCustomerValue: 0,
        estimatedSales: 0,
      },
      restaurantStats: {
        americana: {
          gamesPlayed: 4,
          totalCorrectAnswers: 31,
          regularCustomers: 0,
          occasionalCustomers: 0,
          lostCustomers: 0,
          totalCustomerValue: 0,
          estimatedSales: 0,
        },
      },
      customerCollection: buildDemoCollection([
        { customerId: "breakfast-regular", status: "regular", dateWon: "2026-05-25T08:45:00.000Z" },
        { customerId: "route-66-tourist", status: "regular", dateWon: "2026-05-24T08:45:00.000Z" },
        { customerId: "pie-contest-judge", status: "occasional", dateWon: "2026-05-23T08:45:00.000Z" },
      ]),
      recentSessions: [],
    },
  ];

  function buildGeneratedDemoProfiles(targetCount = 100) {
    const existingSlugs = new Set(demoProfiles.map((profile) => profile.restaurantSlug));
    const existingIds = new Set(demoProfiles.map((profile) => profile.id));
    const adjectivePool = [
      "Golden", "Maple", "Silver", "Cedar", "Bluebird", "Harvest", "Copper", "Sunset", "Willow", "Sage",
      "River", "Prairie", "Canyon", "Lighthouse", "Juniper", "Magnolia", "Beacon", "Meadow", "Driftwood", "Hearth"
    ];
    const nounPool = [
      "Kitchen", "Cafe", "Grill", "Diner", "Bistro", "Supper Club", "Smokehouse", "Table", "Tavern", "Roost",
      "Pantry", "Kettle", "Fork", "Lantern", "Spice House", "Skillet", "Corner", "Station", "Garden", "Parlor"
    ];
    const allCustomerIds = customers
      .filter((customer) => customer.image && !customer.image.includes("customer-placeholder"))
      .map((customer) => customer.id);
    const generated = [];
    let candidateIndex = 0;

    while (demoProfiles.length + generated.length < targetCount) {
      const adjective = adjectivePool[candidateIndex % adjectivePool.length];
      const noun = nounPool[Math.floor(candidateIndex / adjectivePool.length) % nounPool.length];
      const restaurantName = `${adjective} ${noun}`;
      const restaurantSlug = slugify(restaurantName);
      const profileId = `demo-generated-${restaurantSlug}`;
      candidateIndex += 1;

      if (existingSlugs.has(restaurantSlug) || existingIds.has(profileId)) {
        continue;
      }

      const gamesPlayed = Math.max(3, 26 - ((generated.length % 24) + 1));
      const totalCorrectAnswers = Math.max(gamesPlayed * 6, gamesPlayed * 8 + (generated.length % 5));
      const collectionSize = Math.max(3, Math.min(14, 14 - (generated.length % 9)));
      const collectionEntries = [];

      for (let index = 0; index < collectionSize; index += 1) {
        const customerId = allCustomerIds[(generated.length * 5 + index) % allCustomerIds.length];
        const mod = (generated.length + index) % 7;
        const status = mod === 0 ? "lost" : mod === 1 || mod === 2 ? "occasional" : "regular";
        const day = ((generated.length + index) % 27) + 1;
        collectionEntries.push({
          customerId,
          status,
          dateWon: `2026-04-${String(day).padStart(2, "0")}T12:00:00.000Z`,
        });
      }

      generated.push({
        id: profileId,
        playerName: `Demo Player ${demoProfiles.length + generated.length + 1}`,
        restaurantName,
        restaurantSlug,
        createdAt: "2026-05-01T12:00:00.000Z",
        lastPlayedAt: `2026-05-${String(((generated.length + 3) % 28) + 1).padStart(2, "0")}T12:00:00.000Z`,
        stats: {
          gamesPlayed,
          totalCorrectAnswers,
          regularCustomers: 0,
          occasionalCustomers: 0,
          lostCustomers: 0,
          totalCustomerValue: 0,
          estimatedSales: 0,
        },
        restaurantStats: {
          americana: {
            gamesPlayed,
            totalCorrectAnswers,
            regularCustomers: 0,
            occasionalCustomers: 0,
            lostCustomers: 0,
            totalCustomerValue: 0,
            estimatedSales: 0,
          },
        },
        customerCollection: buildDemoCollection(collectionEntries),
        recentSessions: [],
      });

      existingSlugs.add(restaurantSlug);
      existingIds.add(profileId);
    }

    return generated;
  }

  demoProfiles.push(...buildGeneratedDemoProfiles(100));

  const DEMO_PROFILE_IDS = new Set(demoProfiles.map((profile) => profile.id));
  const DEMO_PROFILE_SET = new Set(demoProfiles.map((profile) => profile.id));

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  function nowIso() {
    return new Date().toISOString();
  }

  function makeId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return `${prefix}-${window.crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function normalizeText(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function slugify(value) {
    return normalizeText(value).replace(/\s/g, "-");
  }

  function readJson(key, fallback) {
    try {
      const raw = window.localStorage?.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      window.localStorage?.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Some browsers block persistent storage; keep using the in-memory cache.
    }
  }

  function isDemoProfile(profile) {
    return Boolean(profile && DEMO_PROFILE_SET.has(profile.id));
  }

  function normalizeProfiles(profiles) {
    return (Array.isArray(profiles) ? profiles : []).map((profile) => ensureProfileShape(profile));
  }

  function getLocalProfileSeed() {
    const stored = readJson(STORAGE_KEYS.profiles, []);
    if (Array.isArray(stored) && stored.length) {
      return normalizeProfiles(stored);
    }

    return normalizeProfiles(clone(demoProfiles));
  }

  function setProfilesCache(profiles, source = "local") {
    profilesCacheState.loaded = true;
    profilesCacheState.source = source;
    profilesCacheState.profiles = normalizeProfiles(profiles);
  }

  function getProfilesCache() {
    if (!profilesCacheState.loaded) {
      setProfilesCache(getLocalProfileSeed(), "local");
    }

    return profilesCacheState.profiles;
  }

  async function requestJson(path, options = {}) {
    if (!USE_REMOTE_SYNC) {
      return null;
    }

    const response = await window.fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.error || `Request failed with status ${response.status}`);
    }

    return data;
  }

  function generateProfileAccessToken() {
    const bytes = new Uint8Array(32);
    if (window.crypto?.getRandomValues) {
      window.crypto.getRandomValues(bytes);
      return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
    }
    return `${makeId("token")}-${Math.random().toString(36).slice(2)}`;
  }

  function getProfileAccessToken(profileId) {
    const tokens = readJson(STORAGE_KEYS.profileAccessTokens, {});
    return String(tokens?.[profileId] || "");
  }

  function setProfileAccessToken(profileId, token) {
    const safeProfileId = String(profileId || "");
    const safeToken = String(token || "");
    if (!safeProfileId || !safeToken) {
      return;
    }
    const tokens = readJson(STORAGE_KEYS.profileAccessTokens, {});
    writeJson(STORAGE_KEYS.profileAccessTokens, {
      ...(tokens && typeof tokens === "object" ? tokens : {}),
      [safeProfileId]: safeToken,
    });
  }

  function ensureProfileAccessToken(profileId) {
    const existing = getProfileAccessToken(profileId);
    if (existing) {
      return existing;
    }
    const token = generateProfileAccessToken();
    setProfileAccessToken(profileId, token);
    return token;
  }

  async function syncProfilesToServer(profiles) {
    if (!USE_REMOTE_SYNC) {
      return;
    }

    const activeProfileId = getActiveProfileId();
    const activeProfile = normalizeProfiles(profiles).find(
      (profile) => profile.id === activeProfileId && !isDemoProfile(profile)
    );
    if (!activeProfile) {
      return;
    }

    const token = ensureProfileAccessToken(activeProfile.id);
    await requestJson(`/profiles/${encodeURIComponent(activeProfile.id)}`, {
      method: "PUT",
      headers: {
        "X-Profile-Token": token,
      },
      body: JSON.stringify(activeProfile),
    });
  }

  async function syncSessionToServer(session) {
    if (!USE_REMOTE_SYNC || !session || !session.completed) {
      return;
    }

    await syncActiveProfile();
    const token = getProfileAccessToken(session.profileId);
    if (!token) {
      return;
    }
    await requestJson("/sessions", {
      method: "POST",
      headers: {
        "X-Profile-Token": token,
      },
      body: JSON.stringify(session),
    }).catch(() => null);
  }

  async function refreshProfilesFromServer() {
    if (!USE_REMOTE_SYNC) {
      return;
    }

    try {
      const remoteProfiles = await requestJson("/profiles", { method: "GET" });
      if (Array.isArray(remoteProfiles) && remoteProfiles.length) {
        setProfilesCache(remoteProfiles, "remote");
        try {
          writeJson(STORAGE_KEYS.profiles, profilesCacheState.profiles);
        } catch (error) {
          // Keep the remote profiles even if browser storage is unavailable.
        }
        void syncProfilesToServer(profilesCacheState.profiles).catch(() => null);
      } else {
        setProfilesCache(getLocalProfileSeed(), "local");
        if (!readJson(STORAGE_KEYS.profiles, []).length && profilesCacheState.profiles.length) {
          try {
            writeJson(STORAGE_KEYS.profiles, profilesCacheState.profiles);
          } catch (error) {
            // Keep the local seed in memory even if browser storage is unavailable.
          }
        }

        await syncProfilesToServer(profilesCacheState.profiles);
      }
    } catch {
      setProfilesCache(getLocalProfileSeed(), "local");
    }
  }

  void Promise.allSettled([
    refreshRestaurantBankFromServer(),
    refreshProfilesFromServer(),
    refreshQuestionBankFromServer(),
    refreshCustomerBankFromServer(),
  ]).then(() => {
    readyResolve();
  });

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function shuffle(items) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  function pickMany(items, count) {
    return shuffle(items).slice(0, count);
  }

  function pickOne(items) {
    if (!items.length) {
      return null;
    }
    return items[Math.floor(Math.random() * items.length)];
  }

  function formatCurrency(value) {
    return currencyFormatter.format(Math.round(Number(value) || 0));
  }

  function formatPercent(value) {
    return `${Math.round(Number(value) || 0)}%`;
  }

  function formatRating(value) {
    return `${(Number(value) || 0).toFixed(1)}/5`;
  }

  const EXPANSION_LEVELS = [
    {
      id: "food-truck",
      label: "Food Truck",
      cost: 0,
      value: 500,
    },
    {
      id: "counter-service",
      label: "Counter Service",
      cost: 500,
      value: 1500,
    },
    {
      id: "small-diner",
      label: "Small Diner",
      cost: 1500,
      value: 4500,
    },
    {
      id: "family-restaurant",
      label: "Family Restaurant",
      cost: 3000,
      value: 10500,
    },
    {
      id: "regional-favorite",
      label: "Regional Favorite",
      cost: 7500,
      value: 25500,
    },
    {
      id: "local-landmark",
      label: "Local Landmark",
      cost: 15000,
      value: 55500,
    },
  ];

  const DEFAULT_EXPANSION_LEVEL = EXPANSION_LEVELS[0].id;
  const RECENT_PERFORMANCE_DAYS = 30;
  const RECENT_PERFORMANCE_VALUE_RATE = 0.25;
  const RECENT_SESSION_LIMIT = 250;
  const RESTAURANT_UPGRADES = [
    {
      id: "better-chairs",
      label: "Better Chairs",
      cost: 250,
      value: 250,
      salesBoostPercent: 1,
    },
    {
      id: "sound-system",
      label: "Sound System",
      cost: 400,
      value: 400,
      salesBoostPercent: 1,
    },
    {
      id: "new-sign",
      label: "New Sign",
      cost: 600,
      value: 600,
      salesBoostPercent: 1,
    },
    {
      id: "kitchen-equipment",
      label: "Kitchen Equipment",
      cost: 750,
      value: 750,
      salesBoostPercent: 1,
    },
    {
      id: "online-ordering-system",
      label: "Online Ordering System",
      cost: 1000,
      value: 1000,
      salesBoostPercent: 1,
    },
    {
      id: "patio-seating",
      label: "Patio Seating",
      cost: 1200,
      value: 1200,
      salesBoostPercent: 1,
    },
    {
      id: "loyalty-rewards-program",
      label: "Loyalty Rewards Program",
      cost: 2000,
      value: 2000,
      salesBoostPercent: 1,
    },
    {
      id: "catering-service",
      label: "Catering Service",
      cost: 3000,
      value: 3000,
      salesBoostPercent: 1,
    },
    {
      id: "stage",
      label: "Stage",
      cost: 4000,
      value: 4000,
      salesBoostPercent: 1,
    },
    {
      id: "mobile-app",
      label: "Mobile App",
      cost: 5000,
      value: 5000,
      salesBoostPercent: 1,
    },
  ];

  function normalizeRestaurantEconomy(economy) {
    const safeEconomy = economy && typeof economy === "object" ? { ...economy } : {};
    const expansionLevel = EXPANSION_LEVELS.some((level) => level.id === safeEconomy.expansionLevel)
      ? safeEconomy.expansionLevel
      : DEFAULT_EXPANSION_LEVEL;

    return {
      cashOnHand: Math.max(0, Number(safeEconomy.cashOnHand) || 0),
      lifetimeCashEarned: Math.max(0, Number(safeEconomy.lifetimeCashEarned) || 0),
      expansionLevel,
      upgrades:
        safeEconomy.upgrades && typeof safeEconomy.upgrades === "object" && !Array.isArray(safeEconomy.upgrades)
          ? { ...safeEconomy.upgrades }
          : {},
    };
  }

  function getExpansionValue(economy) {
    const expansion = EXPANSION_LEVELS.find((level) => level.id === economy.expansionLevel) || EXPANSION_LEVELS[0];
    return Number(expansion.value) || 0;
  }

  function getUpgradeValue(economy) {
    return Object.values(economy.upgrades || {}).reduce((total, upgrade) => {
      if (!upgrade || typeof upgrade !== "object") {
        return total;
      }
      return total + Math.max(0, Number(upgrade.value ?? upgrade.cost) || 0);
    }, 0);
  }

  function hasTrackedRestaurantEconomy(economy) {
    const safeEconomy = normalizeRestaurantEconomy(economy);
    return Boolean(
      safeEconomy.cashOnHand ||
        safeEconomy.lifetimeCashEarned ||
        safeEconomy.expansionLevel !== DEFAULT_EXPANSION_LEVEL ||
        Object.keys(safeEconomy.upgrades || {}).length
    );
  }

  function getRestaurantCashOnHand(profile, stats = null) {
    const safeStats = stats || profile?.stats || {};
    const economy = normalizeRestaurantEconomy(profile?.restaurantEconomy);
    return hasTrackedRestaurantEconomy(economy)
      ? economy.cashOnHand
      : Math.max(0, Number(safeStats.estimatedSales) || 0);
  }

  function getCustomerLoyaltyValue(stats) {
    const favoriteCustomers = Math.max(0, Number(stats.favoriteCustomers) || 0);
    const regularOnlyCustomers = Math.max(0, (Number(stats.regularCustomers) || 0) - favoriteCustomers);
    return regularOnlyCustomers * 100 + favoriteCustomers * 300;
  }

  function getRatingMultiplier(stats) {
    if (!stats.gamesPlayed) {
      return 0;
    }
    const accuracy = (stats.totalCorrectAnswers / (stats.gamesPlayed * 10)) * 100;
    const rating = accuracy / 20;
    return rating / 200;
  }

  function getRatingValue(stats, baseValue = 0) {
    return Math.round(Math.max(0, Number(baseValue) || 0) * getRatingMultiplier(stats));
  }

  function getRecentPerformanceValue(profile, restaurantSlug = "") {
    const cutoff = Date.now() - RECENT_PERFORMANCE_DAYS * 24 * 60 * 60 * 1000;
    const sessions = Array.isArray(profile?.recentSessions) ? profile.recentSessions : [];

    return sessions.reduce((total, session) => {
      const playedAt = Date.parse(session?.playedAt || "");
      const sessionRestaurantSlug = String(session?.restaurantSlug || "").trim();
      if (!playedAt || playedAt < cutoff) {
        return total;
      }
      if (restaurantSlug && sessionRestaurantSlug !== restaurantSlug) {
        return total;
      }
      if (!restaurantSlug && sessionRestaurantSlug && !isPublicLeaderboardRestaurant(sessionRestaurantSlug)) {
        return total;
      }

      const customer = getCustomerById(session.customerId);
      const status = ["regular", "occasional", "favorite"].includes(session.result)
        ? session.result
        : "";
      return customer && status
        ? total + getCollectionValueForStatus(customer, status)
        : total;
    }, 0);
  }

  function getRestaurantValue(profile, stats, restaurantSlug = "") {
    const economy = normalizeRestaurantEconomy(profile?.restaurantEconomy);
    const expansionValue = getExpansionValue(economy);
    const upgradeValue = getUpgradeValue(economy);
    const loyaltyValue = getCustomerLoyaltyValue(stats);
    const recentPerformanceValue = Math.round(getRecentPerformanceValue(profile, restaurantSlug) * RECENT_PERFORMANCE_VALUE_RATE);
    const valueBeforeRating = expansionValue + upgradeValue + loyaltyValue + recentPerformanceValue;
    const ratingValue = getRatingValue(stats, valueBeforeRating);
    return Math.round(valueBeforeRating + ratingValue);
  }

  function getRestaurantValueBreakdown(profile, stats, restaurantSlug = "") {
    const economy = normalizeRestaurantEconomy(profile?.restaurantEconomy);
    const expansion = EXPANSION_LEVELS.find((level) => level.id === economy.expansionLevel) || EXPANSION_LEVELS[0];
    const expansionValue = getExpansionValue(economy);
    const upgradeValue = getUpgradeValue(economy);
    const loyaltyValue = getCustomerLoyaltyValue(stats);
    const recentPerformanceSales = getRecentPerformanceValue(profile, restaurantSlug);
    const recentPerformanceValue = Math.round(recentPerformanceSales * RECENT_PERFORMANCE_VALUE_RATE);
    const valueBeforeRating = expansionValue + upgradeValue + loyaltyValue + recentPerformanceValue;
    const ratingValue = getRatingValue(stats, valueBeforeRating);

    return {
      total: Math.round(valueBeforeRating + ratingValue),
      expansionLabel: expansion.label,
      expansionValue,
      upgradeValue,
      loyaltyValue,
      recentPerformanceSales,
      recentPerformanceValue,
      recentPerformanceRate: RECENT_PERFORMANCE_VALUE_RATE,
      ratingRate: getRatingMultiplier(stats),
      ratingValue,
    };
  }

  function getRestaurantExpansionPreview(profile) {
    const economy = normalizeRestaurantEconomy(profile?.restaurantEconomy);
    const currentIndex = Math.max(
      0,
      EXPANSION_LEVELS.findIndex((level) => level.id === economy.expansionLevel)
    );
    const current = EXPANSION_LEVELS[currentIndex] || EXPANSION_LEVELS[0];
    const next = EXPANSION_LEVELS[currentIndex + 1] || null;

    return {
      current,
      next,
      valueAdded: next ? Math.max(0, (Number(next.value) || 0) - (Number(current.value) || 0)) : 0,
      isMaxLevel: !next,
    };
  }

  function getRestaurantUpgradePreview(profile, limit = 3) {
    const economy = normalizeRestaurantEconomy(profile?.restaurantEconomy);
    const ownedUpgradeIds = new Set(Object.keys(economy.upgrades || {}));
    return RESTAURANT_UPGRADES.filter((upgrade) => !ownedUpgradeIds.has(upgrade.id)).slice(
      0,
      Math.max(0, Number(limit) || 0)
    );
  }

  function buyNextRestaurantExpansion(profileId = "") {
    const targetProfileId = String(profileId || getActiveProfileId() || "").trim();
    const profile = getProfiles().find((entry) => entry.id === targetProfileId) || null;
    if (!profile) {
      return { ok: false, message: "No restaurant profile was found." };
    }

    const safeProfile = ensureProfileShape(profile);
    const preview = getRestaurantExpansionPreview(safeProfile);
    if (!preview.next) {
      return { ok: false, message: "This restaurant is already fully expanded.", profile: safeProfile };
    }

    const cost = Math.max(0, Number(preview.next.cost) || 0);
    const cashOnHand = getRestaurantCashOnHand(safeProfile, safeProfile.stats);
    if (cashOnHand < cost) {
      return {
        ok: false,
        message: `You need ${formatCurrency(cost - cashOnHand)} more cash for this expansion.`,
        profile: safeProfile,
      };
    }

    const economy = normalizeRestaurantEconomy(safeProfile.restaurantEconomy);
    const lifetimeCashEarned = Math.max(
      Number(economy.lifetimeCashEarned) || 0,
      Number(safeProfile.stats?.estimatedSales) || 0,
      cashOnHand
    );
    const updatedProfile = {
      ...safeProfile,
      restaurantEconomy: {
        ...economy,
        cashOnHand: Math.max(0, cashOnHand - cost),
        lifetimeCashEarned,
        expansionLevel: preview.next.id,
      },
    };

    return {
      ok: true,
      message: `${preview.next.label} purchased.`,
      profile: updateProfile(updatedProfile),
      expansion: preview.next,
      cost,
      valueAdded: preview.valueAdded,
    };
  }

  function getProfiles() {
    return getProfilesCache();
  }

  function saveProfiles(profiles) {
    const normalized = normalizeProfiles(profiles);
    setProfilesCache(normalized, profilesCacheState.source);
    try {
      writeJson(STORAGE_KEYS.profiles, normalized);
    } catch (error) {
      // Keep the updated profiles in memory even if browser storage is unavailable.
    }
    void syncProfilesToServer(normalized).catch(() => null);
  }

  async function syncActiveProfile() {
    await syncProfilesToServer(getProfiles());
    return getActiveProfile();
  }

  async function sendEmailSignInLink(email, options = {}) {
    const profileId = String(options.profileId || "");
    const headers = {};
    if (profileId) {
      await syncActiveProfile();
      headers["X-Profile-Token"] = ensureProfileAccessToken(profileId);
    }

    return requestJson("/profiles", {
      method: "POST",
      headers,
      body: JSON.stringify({
        action: "send",
        email: String(email || "").trim(),
        profileId,
      }),
    });
  }

  function mergeRecoveredProfile(profile, profileAccessToken) {
    if (!profile?.id) {
      return null;
    }
    const safeProfile = ensureProfileShape(profile);
    const profiles = getProfiles();
    const index = profiles.findIndex((entry) => entry.id === safeProfile.id);
    if (index >= 0) {
      profiles[index] = safeProfile;
    } else {
      profiles.push(safeProfile);
    }
    setProfileAccessToken(safeProfile.id, profileAccessToken);
    setActiveProfileId(safeProfile.id);
    activeProfileState.profile = safeProfile;
    saveProfiles(profiles);
    return safeProfile;
  }

  async function completeEmailSignInFromUrl() {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = String(hash.get("access_token") || "");
    const query = new URLSearchParams(window.location.search);
    const isAuthCallback = query.get("auth") === "callback" || Boolean(accessToken || hash.get("error"));
    if (!isAuthCallback) {
      return null;
    }
    const authError = String(hash.get("error_description") || hash.get("error") || "");
    if (authError) {
      throw new Error(authError.replace(/\+/g, " "));
    }
    if (!accessToken) {
      throw new Error("This sign-in link is incomplete or has expired. Please request another.");
    }

    const result = await requestJson("/profiles", {
      method: "POST",
      body: JSON.stringify({
        action: "complete",
        accessToken,
        claimState: query.get("claim_state") || "",
      }),
    });

    const profile = mergeRecoveredProfile(result?.profile, result?.profileAccessToken);
    const cleanUrl = new URL(window.location.href);
    cleanUrl.hash = "";
    cleanUrl.searchParams.delete("auth");
    cleanUrl.searchParams.delete("claim_state");
    window.history.replaceState({}, "", `${cleanUrl.pathname}${cleanUrl.search}`);
    return profile;
  }

  function getActiveProfileId() {
    try {
      return activeProfileState.profileId || window.localStorage?.getItem(STORAGE_KEYS.activeProfileId) || "";
    } catch (error) {
      return activeProfileState.profileId || "";
    }
  }

  function setActiveProfileId(profileId) {
    activeProfileState.profileId = String(profileId || "");
    try {
      window.localStorage?.setItem(STORAGE_KEYS.activeProfileId, activeProfileState.profileId);
    } catch (error) {
      // Ignore storage blocks and continue using the active profile cache.
    }
  }

  function clearActiveProfileId() {
    activeProfileState.profileId = "";
    activeProfileState.profile = null;
    try {
      window.localStorage?.removeItem(STORAGE_KEYS.activeProfileId);
    } catch (error) {
      // Ignore storage blocks and continue using the active profile cache.
    }
  }

  function getActiveProfile() {
    const profileId = getActiveProfileId();
    if (profileId) {
      const profile = getProfiles().find((entry) => entry.id === profileId) || null;
      if (profile) {
        activeProfileState.profile = profile;
        return profile;
      }
    }

    if (
      activeProfileState.profile &&
      activeProfileState.profile.id &&
      activeProfileState.profile.id === activeProfileState.profileId
    ) {
      return activeProfileState.profile;
    }

    return null;
  }

  function buildEmptyStats() {
    return {
      gamesPlayed: 0,
      totalCorrectAnswers: 0,
      regularCustomers: 0,
      favoriteCustomers: 0,
      occasionalCustomers: 0,
      lostCustomers: 0,
      totalCustomerValue: 0,
      estimatedSales: 0,
      restaurantValue: 0,
    };
  }

  function buildEmptyRestaurantStats() {
    return Object.assign(buildEmptyStats(), {
      lastImageQuestionId: "",
      featuredGuestStartIndex: 0,
    });
  }

  function ensureProfileShape(profile) {
    const safeProfile = clone(profile);
    safeProfile.stats = Object.assign(buildEmptyStats(), safeProfile.stats || {});
    safeProfile.restaurantStats = safeProfile.restaurantStats || {};
    Object.keys(safeProfile.restaurantStats).forEach((restaurantSlug) => {
      safeProfile.restaurantStats[restaurantSlug] = Object.assign(
        buildEmptyRestaurantStats(),
        safeProfile.restaurantStats[restaurantSlug] || {}
      );
    });
    safeProfile.customerCollection = Array.isArray(safeProfile.customerCollection)
      ? safeProfile.customerCollection
      : [];
    safeProfile.recentSessions = Array.isArray(safeProfile.recentSessions)
      ? safeProfile.recentSessions
      : [];
    safeProfile.restaurantEconomy = normalizeRestaurantEconomy(safeProfile.restaurantEconomy);
    safeProfile.isGuest = Boolean(safeProfile.isGuest);
    safeProfile.customerCollection = dedupeCustomerCollection(
      safeProfile.customerCollection.map(normalizeCollectionEntry)
    );
    return rebuildCollectionDerivedStats(safeProfile);
  }

  function normalizeCollectionEntry(entry) {
    const safeEntry = entry && typeof entry === "object" ? { ...entry } : {};
    if (safeEntry.rarity === "Legendary") {
      safeEntry.rarity = "Rare";
    }

    if (!["regular", "occasional", "lost", "favorite"].includes(safeEntry.status)) {
      safeEntry.status = safeEntry.status || "occasional";
    }

    safeEntry.favoriteVisits = Math.max(0, Math.min(FAVORITE_VISIT_GOAL, Number(safeEntry.favoriteVisits) || 0));
    if (safeEntry.status === "favorite") {
      safeEntry.favoriteVisits = FAVORITE_VISIT_GOAL;
    }

    safeEntry.restaurantCredits = normalizeRestaurantCredits(safeEntry);

    return safeEntry;
  }

  function normalizeRestaurantCredit(credit, fallback = {}) {
    const safeCredit = credit && typeof credit === "object" ? { ...credit } : {};
    const status = ["regular", "occasional", "favorite"].includes(safeCredit.status)
      ? safeCredit.status
      : ["regular", "occasional", "favorite"].includes(fallback.status)
        ? fallback.status
        : "";

    return {
      restaurantSlug: String(safeCredit.restaurantSlug || fallback.restaurantSlug || "").trim(),
      restaurantName: String(safeCredit.restaurantName || fallback.restaurantName || "").trim(),
      status,
      dateWon: safeCredit.dateWon || fallback.dateWon || "",
    };
  }

  function normalizeRestaurantCredits(entry) {
    const credits = {};
    const rawCredits = entry?.restaurantCredits;

    if (rawCredits && typeof rawCredits === "object" && !Array.isArray(rawCredits)) {
      Object.entries(rawCredits).forEach(([restaurantSlug, credit]) => {
        const normalized = normalizeRestaurantCredit(credit, {
          restaurantSlug,
          restaurantName: entry.restaurantName,
          status: entry.status,
          dateWon: entry.dateWon,
        });

        if (normalized.restaurantSlug && normalized.status) {
          credits[normalized.restaurantSlug] = normalized;
        }
      });
    }

    if (
      !Object.keys(credits).length &&
      entry?.restaurantSlug &&
      ["regular", "occasional", "favorite"].includes(entry.status)
    ) {
      const normalized = normalizeRestaurantCredit(null, {
        restaurantSlug: entry.restaurantSlug,
        restaurantName: entry.restaurantName,
        status: entry.status,
        dateWon: entry.dateWon,
      });

      if (normalized.restaurantSlug && normalized.status) {
        credits[normalized.restaurantSlug] = normalized;
      }
    }

    return credits;
  }

  function mergeRestaurantCredit(existingCredit, incomingCredit) {
    if (!existingCredit) {
      return incomingCredit;
    }

    const existingRank = getCustomerStatusRank(existingCredit.status);
    const incomingRank = getCustomerStatusRank(incomingCredit.status);
    const strongerCredit =
      incomingRank > existingRank
        ? incomingCredit
        : incomingRank < existingRank
          ? existingCredit
          : getNewerCollectionEntry(existingCredit, incomingCredit);

    return normalizeRestaurantCredit({
      ...existingCredit,
      ...strongerCredit,
      restaurantSlug: existingCredit.restaurantSlug || incomingCredit.restaurantSlug,
      restaurantName: incomingCredit.restaurantName || existingCredit.restaurantName,
    });
  }

  function mergeRestaurantCredits(existingCredits, incomingCredits) {
    const mergedCredits = {};

    [existingCredits, incomingCredits].forEach((credits) => {
      Object.values(credits || {}).forEach((credit) => {
        const normalized = normalizeRestaurantCredit(credit);
        if (!normalized.restaurantSlug || !normalized.status) {
          return;
        }

        mergedCredits[normalized.restaurantSlug] = mergeRestaurantCredit(
          mergedCredits[normalized.restaurantSlug],
          normalized
        );
      });
    });

    return mergedCredits;
  }

  function buildRestaurantCreditForSession(session) {
    if (!session || !["regular", "occasional", "favorite"].includes(session.result)) {
      return null;
    }

    return normalizeRestaurantCredit(null, {
      restaurantSlug: session.restaurantSlug,
      restaurantName: session.restaurantName,
      status: session.result,
      dateWon: session.completedAt || nowIso(),
    });
  }

  function addRestaurantCreditToEntry(entry, session) {
    const credit = buildRestaurantCreditForSession(session);
    const restaurantCredits = normalizeRestaurantCredits(entry);

    if (credit) {
      restaurantCredits[credit.restaurantSlug] = mergeRestaurantCredit(
        restaurantCredits[credit.restaurantSlug],
        credit
      );
    }

    return restaurantCredits;
  }

  function getCustomerStatusRank(status) {
    return CUSTOMER_STATUS_RANK[status] ?? 0;
  }

  function getNewerCollectionEntry(left, right) {
    const leftTime = Date.parse(left?.dateWon || "") || 0;
    const rightTime = Date.parse(right?.dateWon || "") || 0;
    return rightTime >= leftTime ? right : left;
  }

  function mergeCollectionEntries(existingEntry, incomingEntry) {
    if (!existingEntry) {
      return incomingEntry;
    }

    const existingRank = getCustomerStatusRank(existingEntry.status);
    const incomingRank = getCustomerStatusRank(incomingEntry.status);
    const strongerEntry =
      incomingRank > existingRank
        ? incomingEntry
        : incomingRank < existingRank
          ? existingEntry
          : getNewerCollectionEntry(existingEntry, incomingEntry);
    const newerEntry = getNewerCollectionEntry(existingEntry, incomingEntry);
    const favoriteVisits = Math.max(
      Number(existingEntry.favoriteVisits) || 0,
      Number(incomingEntry.favoriteVisits) || 0
    );
    const status = strongerEntry.status === "favorite" || favoriteVisits >= FAVORITE_VISIT_GOAL
      ? "favorite"
      : strongerEntry.status;

    return normalizeCollectionEntry({
      ...existingEntry,
      ...strongerEntry,
      id: existingEntry.id || incomingEntry.id,
      restaurantSlug: newerEntry.restaurantSlug || strongerEntry.restaurantSlug || existingEntry.restaurantSlug,
      restaurantName: newerEntry.restaurantName || strongerEntry.restaurantName || existingEntry.restaurantName,
      dateWon: newerEntry.dateWon || strongerEntry.dateWon || existingEntry.dateWon,
      status,
      favoriteVisits: status === "favorite" ? FAVORITE_VISIT_GOAL : favoriteVisits,
      restaurantCredits: mergeRestaurantCredits(
        existingEntry.restaurantCredits,
        incomingEntry.restaurantCredits
      ),
    });
  }

  function dedupeCustomerCollection(collection) {
    const mergedByCustomerId = new Map();
    const entriesWithoutCustomerId = [];

    collection.forEach((entry) => {
      if (!entry?.customerId) {
        entriesWithoutCustomerId.push(entry);
        return;
      }

      mergedByCustomerId.set(
        entry.customerId,
        mergeCollectionEntries(mergedByCustomerId.get(entry.customerId), entry)
      );
    });

    return [...mergedByCustomerId.values(), ...entriesWithoutCustomerId].sort((left, right) =>
      String(right.dateWon || "").localeCompare(String(left.dateWon || ""))
    );
  }

  function rebuildCollectionDerivedStats(profile) {
    const safeProfile = profile;
    const overallGamesPlayed = Number(safeProfile.stats.gamesPlayed) || 0;
    const overallCorrectAnswers = Number(safeProfile.stats.totalCorrectAnswers) || 0;
    const baseRestaurantStats = safeProfile.restaurantStats || {};
    const restaurantSlugs = new Set(Object.keys(baseRestaurantStats));

    safeProfile.stats = Object.assign(buildEmptyStats(), {
      gamesPlayed: overallGamesPlayed,
      totalCorrectAnswers: overallCorrectAnswers,
    });

    safeProfile.restaurantStats = {};
    safeProfile.customerCollection.forEach((entry) => {
      if (entry && entry.restaurantSlug) {
        restaurantSlugs.add(entry.restaurantSlug);
      }
    });

    restaurantSlugs.forEach((restaurantSlug) => {
      const existingStats = baseRestaurantStats[restaurantSlug] || buildEmptyRestaurantStats();
      safeProfile.restaurantStats[restaurantSlug] = Object.assign(buildEmptyRestaurantStats(), {
        gamesPlayed: Number(existingStats.gamesPlayed) || 0,
        totalCorrectAnswers: Number(existingStats.totalCorrectAnswers) || 0,
        lastImageQuestionId: String(existingStats.lastImageQuestionId || ""),
        featuredGuestStartIndex: Number(existingStats.featuredGuestStartIndex) || 0,
      });
    });

    const applyCollectionStats = (stats, entry, customer) => {
      const valueForStatus = getCollectionValueForStatus(customer, entry.status);

      if (entry.status === "regular" || entry.status === "favorite") {
        stats.regularCustomers += 1;
        if (entry.status === "favorite") {
          stats.favoriteCustomers += 1;
        }
      } else if (entry.status === "occasional") {
        stats.occasionalCustomers += 1;
      } else if (entry.status === "lost") {
        stats.lostCustomers += 1;
      }

      stats.totalCustomerValue += valueForStatus;
      stats.estimatedSales = stats.totalCustomerValue;
    };

    const applyRestaurantCreditStats = (stats, entry, credit, customer) => {
      const creditStatus =
        entry.status === "favorite" && credit.status === "regular"
          ? "favorite"
          : credit.status;
      applyCollectionStats(stats, { ...entry, status: creditStatus }, customer);
    };

    safeProfile.customerCollection.forEach((entry) => {
      const customer = getCustomerById(entry.customerId);
      if (!customer) {
        return;
      }

      applyCollectionStats(safeProfile.stats, entry, customer);

      Object.values(normalizeRestaurantCredits(entry)).forEach((credit) => {
        if (!safeProfile.restaurantStats[credit.restaurantSlug]) {
          safeProfile.restaurantStats[credit.restaurantSlug] = Object.assign(buildEmptyRestaurantStats(), {
            gamesPlayed: 0,
            totalCorrectAnswers: 0,
          });
        }

        applyRestaurantCreditStats(safeProfile.restaurantStats[credit.restaurantSlug], entry, credit, customer);
      });
    });

    safeProfile.stats.estimatedSales = safeProfile.stats.totalCustomerValue;
    safeProfile.stats.restaurantValue = getRestaurantValue(safeProfile, safeProfile.stats);
    Object.values(safeProfile.restaurantStats).forEach((stats) => {
      stats.estimatedSales = stats.totalCustomerValue;
    });
    Object.entries(safeProfile.restaurantStats).forEach(([restaurantSlug, stats]) => {
      stats.restaurantValue = getRestaurantValue(safeProfile, stats, restaurantSlug);
    });

    return safeProfile;
  }

  function createProfile(playerName, restaurantName) {
    const profile = {
      id: makeId("player"),
      playerName: String(playerName || "").trim(),
      restaurantName: String(restaurantName || "").trim(),
      restaurantSlug: slugify(restaurantName || ""),
      createdAt: nowIso(),
      lastPlayedAt: null,
      isGuest: false,
      stats: buildEmptyStats(),
      restaurantStats: {},
      customerCollection: [],
      recentSessions: [],
    };

    const profiles = getProfiles();
    profiles.push(profile);
    setActiveProfileId(profile.id);
    ensureProfileAccessToken(profile.id);
    saveProfiles(profiles);
    activeProfileState.profile = ensureProfileShape(profile);
    return ensureProfileShape(profile);
  }

  function createGuestProfile() {
    const restaurantName = generateGuestRestaurantName();
    const profile = {
      id: makeId("guest"),
      playerName: "Guest Player",
      restaurantName,
      restaurantSlug: slugify(restaurantName),
      createdAt: nowIso(),
      lastPlayedAt: null,
      isGuest: true,
      stats: buildEmptyStats(),
      restaurantStats: {},
      customerCollection: [],
      recentSessions: [],
    };

    const profiles = getProfiles();
    profiles.push(profile);
    setActiveProfileId(profile.id);
    ensureProfileAccessToken(profile.id);
    saveProfiles(profiles);
    activeProfileState.profile = ensureProfileShape(profile);
    return ensureProfileShape(profile);
  }

  function generateGuestRestaurantName() {
    const existingWords = new Set(
      getProfiles()
        .map((profile) => normalizeText(profile.restaurantName).split(" "))
        .flat()
        .filter((word) => word && word !== "the")
    );
    let bestName = "";
    let bestScore = Number.POSITIVE_INFINITY;

    for (let attempt = 0; attempt < 30; attempt += 1) {
      const adjective = pickOne(GUEST_RESTAURANT_NAME_PARTS.adjectives);
      const noun = pickOne(GUEST_RESTAURANT_NAME_PARTS.nouns);
      const candidate = `The ${adjective} ${noun}`;
      const candidateWords = normalizeText(candidate)
        .split(" ")
        .filter((word) => word && word !== "the");
      const overlapScore = candidateWords.filter((word) => existingWords.has(word)).length;
      const blockedScore = isRestaurantNameBlocked(candidate) ? 100 : 0;
      const score = overlapScore + blockedScore;

      if (!bestName || score < bestScore) {
        bestName = candidate;
        bestScore = score;
      }

      if (score === 0) {
        return candidate;
      }
    }

    return bestName || "The Friendly Table";
  }

  function updateProfile(updatedProfile) {
    const profiles = getProfiles().map((profile) =>
      profile.id === updatedProfile.id ? ensureProfileShape(updatedProfile) : profile
    );
    saveProfiles(profiles);
    const savedProfile = profiles.find((profile) => profile.id === updatedProfile.id) || null;
    if (savedProfile) {
      activeProfileState.profile = savedProfile;
    }
    return savedProfile;
  }

  function getRestaurantQuestionMemory(profile, restaurantSlug) {
    if (!profile || !restaurantSlug) {
      return buildEmptyRestaurantStats();
    }

    const safeProfile = ensureProfileShape(profile);
    return safeProfile.restaurantStats[restaurantSlug] || buildEmptyRestaurantStats();
  }

  function selectNextImageQuestion(imageQuestions, lastImageQuestionId) {
    if (!imageQuestions.length) {
      return null;
    }

    if (!lastImageQuestionId) {
      return imageQuestions[0];
    }

    const lastIndex = imageQuestions.findIndex((question) => question.id === lastImageQuestionId);
    if (lastIndex < 0) {
      return imageQuestions[0];
    }

    return imageQuestions[(lastIndex + 1) % imageQuestions.length];
  }

  function getRestaurantBySlug(slug) {
    return restaurants.find((restaurant) => restaurant.slug === slug) || null;
  }

  function getCustomerById(id) {
    return customers.find((customer) => customer.id === id) || null;
  }

  function getCustomerCollectionEntry(profile, customerId, restaurantSlug) {
    if (!profile || !customerId) {
      return null;
    }

    return ensureProfileShape(profile).customerCollection.find(
      (entry) => entry.customerId === customerId
    ) || null;
  }

  function getOwnedCustomerIdsForRestaurant(profile, restaurantSlug) {
    if (!profile) {
      return new Set();
    }

    const safeProfile = ensureProfileShape(profile);
    return new Set(
      safeProfile.customerCollection
        .filter((entry) => entry.customerId && normalizeRestaurantCredits(entry)[restaurantSlug])
        .map((entry) => entry.customerId)
    );
  }

  function getCollectionValueForStatus(customer, status) {
    if (!customer) {
      return 0;
    }

    if (status === "favorite") {
      return getFavoriteCustomerValue(customer);
    }

    if (status === "regular") {
      return Number(customer.regularValue) || 0;
    }

    if (status === "occasional") {
      return Number(customer.occasionalValue) || 0;
    }

    return 0;
  }

  function getFavoriteCustomerValue(customerOrValue) {
    const baseValue =
      typeof customerOrValue === "number"
        ? customerOrValue
        : Number(customerOrValue?.regularValue) || 0;
    return Math.round(baseValue * FAVORITE_VALUE_MULTIPLIER);
  }

  function getCollectionEntryValue(entry) {
    if (!entry) {
      return 0;
    }

    if (entry.status === "favorite") {
      return getFavoriteCustomerValue(Number(entry.regularValue) || 0);
    }

    if (entry.status === "regular") {
      return Number(entry.regularValue) || 0;
    }

    if (entry.status === "occasional") {
      return Number(entry.occasionalValue) || 0;
    }

    return 0;
  }

  function getCustomerStatusLabel(status) {
    if (status === "favorite") {
      return "Favorite Customer";
    }

    if (status === "regular") {
      return "Regular Customer";
    }

    if (status === "occasional") {
      return "Occasional Customer";
    }

    return "Lost Customer";
  }

  function getFavoriteVisitGoal() {
    return FAVORITE_VISIT_GOAL;
  }

  function getCustomerWinThresholds(customer) {
    const rarity = String(customer?.rarity || "").toLowerCase();

    if (rarity === "common") {
      return { regular: 6, occasional: 3 };
    }

    if (rarity === "uncommon") {
      return { regular: 7, occasional: 4 };
    }

    return { regular: 8, occasional: 5 };
  }

  function getCustomerResultForScore(customer, score) {
    const thresholds = getCustomerWinThresholds(customer);

    if (score >= thresholds.regular) {
      return "regular";
    }

    if (score >= thresholds.occasional) {
      return "occasional";
    }

    return "lost";
  }

  function applyCollectionDelta(stats, previousStatus, nextStatus, previousCustomer, nextCustomer) {
    const previousValue = getCollectionValueForStatus(previousCustomer, previousStatus);
    const nextValue = getCollectionValueForStatus(nextCustomer, nextStatus);

    if (previousStatus === "regular" || previousStatus === "favorite") {
      stats.regularCustomers = Math.max(0, stats.regularCustomers - 1);
      if (previousStatus === "favorite") {
        stats.favoriteCustomers = Math.max(0, (stats.favoriteCustomers || 0) - 1);
      }
    } else if (previousStatus === "occasional") {
      stats.occasionalCustomers = Math.max(0, stats.occasionalCustomers - 1);
    } else if (previousStatus === "lost") {
      stats.lostCustomers = Math.max(0, stats.lostCustomers - 1);
    }

    if (nextStatus === "regular" || nextStatus === "favorite") {
      stats.regularCustomers += 1;
      if (nextStatus === "favorite") {
        stats.favoriteCustomers = (stats.favoriteCustomers || 0) + 1;
      }
    } else if (nextStatus === "occasional") {
      stats.occasionalCustomers += 1;
    } else if (nextStatus === "lost") {
      stats.lostCustomers += 1;
    }

    stats.totalCustomerValue += nextValue - previousValue;
    stats.estimatedSales = stats.totalCustomerValue;
  }

  function getPhotoReadyCustomersForRestaurant(slug, profile = null) {
    const ownedCustomerIds = getOwnedCustomerIdsForRestaurant(profile, slug);
    return getCustomersForRestaurant(slug).filter(
      (customer) =>
        customer.image &&
        !customer.image.includes("customer-placeholder") &&
        !ownedCustomerIds.has(customer.id)
    );
  }

  function getFeaturedGuestLineup(profile, restaurantSlug, count = 4) {
    const guests = getPhotoReadyCustomersForRestaurant(restaurantSlug, profile);
    if (!guests.length) {
      return [];
    }

    const memory = getRestaurantQuestionMemory(profile, restaurantSlug);
    const startIndex = Number(memory.featuredGuestStartIndex) || 0;
    const lineup = [];
    const limit = Math.min(count, guests.length);

    for (let index = 0; index < limit; index += 1) {
      lineup.push(guests[(startIndex + index) % guests.length]);
    }

    return lineup;
  }

  function advanceFeaturedGuestRotation(profile, restaurantSlug, step = 1) {
    const safeProfile = ensureProfileShape(profile);
    const guests = getPhotoReadyCustomersForRestaurant(restaurantSlug, safeProfile);
    if (!guests.length) {
      return safeProfile;
    }

    const restaurantStats =
      safeProfile.restaurantStats[restaurantSlug] || buildEmptyRestaurantStats();
    const currentIndex = Number(restaurantStats.featuredGuestStartIndex) || 0;
    restaurantStats.featuredGuestStartIndex = (currentIndex + step) % guests.length;
    safeProfile.restaurantStats[restaurantSlug] = restaurantStats;
    return updateProfile(safeProfile) || safeProfile;
  }

  function getCustomerBio(customer) {
    if (!customer) {
      return "";
    }

    if (customer.bio) {
      return customer.bio;
    }

    const namedBio = {
      "joyce-pepper": "Pepperville's mayor, always trying to keep the town moving smoothly.",
      "hank-hatley": "Pepperville's fire chief, steady in an emergency and trusted by the whole town.",
      "abraham-lincoln": "A legendary president remembered for leadership, honesty, and the Gettysburg Address.",
      "savannah-pierce": "A familiar local reporter and storyteller who always seems to be covering the next big thing.",
      "curtis-coolwater": "A cheerful Pepperville regular who seems to know everyone in town.",
      "pastor-caleb-brooks": "A calm, encouraging pastor who brings people together wherever he goes.",
      "wicked-jim-devito": "A sly Pepperville troublemaker who always seems to have a plan.",
      "miss-pearl": "A kind, wise Pepperville helper people trust when they need a steady hand.",
      "captain-zoogle": "A dramatic local adventurer who talks like every day could turn into a legend.",
      "americana-waitress": "A hardworking diner favorite who knows the menu, the regulars, and the shortcuts.",
      "route-66-tourist": "A road-tripper chasing the classic Americana experience one landmark at a time.",
      "retired-veteran": "A respectful regular who appreciates a good meal, good company, and a familiar seat.",
      "pie-contest-judge": "A sharp dessert judge who notices every crumb and every detail.",
      "breakfast-regular": "A loyal diner fan who knows exactly what to order before the menu even opens.",
      "lady-liberty": "A human version of the Statue of Liberty, proud, iconic, and full of symbolic energy.",
      "alice-in-wonderland": "A curious dreamer who follows rabbits, asks questions, and never quite fits the ordinary world.",
      "amelia-earhart": "A fearless aviator who made history by pushing flight farther than most people thought possible.",
      "benjamin-franklin": "A clever inventor and statesman who loved experiments, lightning, and practical ideas.",
      "big-bad-wolf": "A classic fairy-tale villain with a big appetite and an even bigger reputation.",
      "billy-the-kid": "A legendary Old West outlaw whose name still pops up in stories about the frontier.",
      "blackbeard-the-pirate": "One of the most famous pirates in history, known for fearsome style and high-seas drama.",
      "cheshire-cat": "A Wonderland character famous for a mysterious grin and a habit of disappearing at the perfect moment.",
      "christopher-columbus": "A famous explorer whose Atlantic voyage became one of the most discussed trips in history.",
      "cleopatra": "The iconic queen of Egypt, remembered for power, intelligence, and lasting legend.",
      "george-washington": "The first U.S. president and a key leader from the Revolutionary era.",
      "humpty-dumpty": "A nursery-rhyme character best known for a great fall and a puzzle no one could easily fix.",
      "king-tut": "The boy pharaoh whose tomb and treasures made ancient Egypt unforgettable.",
      "little-red-riding-hood": "A brave little traveler in a red hood who made a very memorable trip through the woods.",
      "mad-hatter": "A delightfully odd Wonderland host whose tea parties never follow normal rules.",
      "napoleon-bonaparte": "A powerful French emperor and military leader who left a huge mark on Europe.",
      "queen-of-hearts": "A Wonderland royal with a dramatic temper and a very memorable sense of authority.",
      "sasquatch": "A legendary forest giant and mystery creature better known to many as Bigfoot.",
      "the-tooth-fairy": "A tiny magical visitor who turns lost teeth into a little surprise.",
      "thomas-edison": "A famous inventor whose practical inventions helped light up modern life.",
    };

    if (namedBio[customer.id]) {
      return namedBio[customer.id];
    }

    if (customer.questionPlace && customer.questionFact) {
      return `${customer.name} is closely associated with ${customer.questionPlace} and is best known for ${customer.questionFact}.`;
    }

    if (customer.characterType === "historical") {
      return `${customer.name} is one of the famous historical figures in the game, and people usually recognize their place in history right away.`;
    }

    if (customer.characterType === "storybook") {
      return `${customer.name} is a storybook character with a memorable tale and a strong personality.`;
    }

    if (customer.characterType === "communityverse") {
      return `${customer.name} is one of the Pepperville regulars with plenty of local personality.`;
    }

    if (customer.restaurant && customer.restaurant !== "shared") {
      return `${customer.name} is a special restaurant regular who only shows up at ${restaurantLabel(customer.restaurant)}.`;
    }

    return `${customer.name} is a recurring CommunityVerse customer.`;
  }

  function getCustomersForRestaurant(slug) {
    const restaurant = getRestaurantBySlug(slug);
    if (!restaurant) {
      return [];
    }
    const restaurantAreaSlugs = getCustomerAreaMatchSlugs(restaurant);

    return customers.filter(
      (customer) =>
        customer.restaurant === restaurant.slug ||
        (customer.restaurant === "shared" &&
          customerAreaSlugsMatchRestaurant(customer, restaurantAreaSlugs))
    );
  }

  function isRestaurantNameBlocked(name) {
    const normalized = normalizeText(name);
    const compact = compactRestaurantText(name);
    if (!normalized) {
      return false;
    }

    return (
      BLOCKED_RESTAURANT_NAMES.some((blocked) => {
        const blockedNormalized = normalizeText(blocked);
        const blockedCompact = compactRestaurantText(blocked);
        return (
          normalized === blockedNormalized ||
          normalized.includes(blockedNormalized) ||
          compact === blockedCompact ||
          compact.includes(blockedCompact)
        );
      }) ||
      BLOCKED_RESTAURANT_NAME_WORDS.some((blocked) => {
        const blockedNormalized = normalizeText(blocked);
        return normalized.split(" ").includes(blockedNormalized);
      })
    );
  }

  function validateProfileInput(playerName, restaurantName) {
    if (!String(playerName || "").trim()) {
      return {
        ok: false,
        message: "Please enter a player name.",
      };
    }

    if (!String(restaurantName || "").trim()) {
      return {
        ok: false,
        message: "Please enter a fictional restaurant name.",
      };
    }

    if (isRestaurantNameBlocked(restaurantName)) {
      return {
        ok: false,
        message:
          "That restaurant name is blocked. Please choose a fictional name instead.",
      };
    }

    return {
      ok: true,
      message: "",
    };
  }

  function compactRestaurantText(value) {
    return normalizeText(value).replace(/[^a-z0-9]+/g, "");
  }

  function getRestaurantQuestionSlug(question) {
    if (question.restaurantSlug) {
      return question.restaurantSlug;
    }

    const searchable = [
      question.prompt,
      question.correctAnswer,
      question.imageAlt,
      question.imagePrompt,
      ...(question.tags || []),
    ]
      .map(normalizeText)
      .filter(Boolean)
      .join(" ");
    const compactSearchable = compactRestaurantText(searchable);

    const matchingRestaurants = restaurants.filter((candidate) => {
      const aliases = [
        candidate.slug,
        candidate.name,
        candidate.publicGameName,
      ]
        .map((alias) => String(alias || "").trim())
        .filter(Boolean);

      return aliases.some((alias) => {
        const normalizedAlias = normalizeText(alias);
        const compactAlias = compactRestaurantText(alias);
        return (
          (normalizedAlias && searchable.includes(normalizedAlias)) ||
          (compactAlias && compactSearchable.includes(compactAlias))
        );
      });
    });

    return matchingRestaurants.length === 1 ? matchingRestaurants[0].slug : "";
  }

  function isQuestionAllowedForRestaurant(question, restaurant) {
    const questionRestaurantSlug = getRestaurantQuestionSlug(question);
    return !questionRestaurantSlug || questionRestaurantSlug === restaurant.slug;
  }

  function isSharedQuestion(question) {
    return !getRestaurantQuestionSlug(question);
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
    ].filter(Boolean);
    const areaSlugs = new Set();

    sourceValues.forEach((value) => {
      const text = String(value || "");
      const parts = [text, ...text.split(/[,/|]+|\s+-\s+|\s+and\s+/i)];

      parts.forEach((part) => {
        const slug = slugify(part);
        if (slug) {
          areaSlugs.add(slug);
        }
        if (areaAliases[slug]) {
          areaSlugs.add(areaAliases[slug]);
        }
      });
    });

    return areaSlugs;
  }

  function isAreaQuestionForRestaurant(question, restaurant, restaurantAreaSlugs) {
    const questionAreaSlug = slugify(question.areaSlug || "");
    const questionTags = Array.isArray(question.tags) ? question.tags.map(slugify) : [];

    return (
      restaurantAreaSlugs.has(questionAreaSlug) ||
      questionTags.some((tag) => restaurantAreaSlugs.has(tag))
    );
  }

  function getCustomerAreaMatchSlugs(restaurant) {
    const areaSlugs = getRestaurantAreaSlugs(restaurant);
    [...areaSlugs].forEach((areaSlug) => {
      String(areaSlug || "").split("-").forEach((piece) => {
        if (piece.length >= 4) {
          areaSlugs.add(piece);
        }
      });
    });
    return areaSlugs;
  }

  function customerMatchesRestaurantArea(customer, restaurantAreaSlugs) {
    if (!restaurantAreaSlugs.size) {
      return false;
    }

    if (Array.isArray(customer.areaSlugs) && customer.areaSlugs.length) {
      return customerAreaSlugsMatchRestaurant(customer, restaurantAreaSlugs);
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
        const slug = slugify(part);
        if (!slug) {
          return false;
        }
        if (restaurantAreaSlugs.has(slug)) {
          return true;
        }
        const slugPieces = slug.split("-");
        return [...restaurantAreaSlugs].some(
          (areaSlug) =>
            areaSlug.length >= 4 &&
            (slugPieces.includes(areaSlug) ||
              areaSlug.split("-").some((piece) => piece.length >= 4 && slugPieces.includes(piece)))
        );
      });
    });
  }

  function customerAreaSlugsMatchRestaurant(customer, restaurantAreaSlugs) {
    const customerAreaSlugs = Array.isArray(customer.areaSlugs)
      ? customer.areaSlugs.map((areaSlug) => slugify(areaSlug)).filter(Boolean)
      : [];
    if (!customerAreaSlugs.length) {
      return true;
    }
    if (!restaurantAreaSlugs.size) {
      return false;
    }

    return customerAreaSlugs.some((customerAreaSlug) => {
      if (restaurantAreaSlugs.has(customerAreaSlug)) {
        return true;
      }
      const customerPieces = customerAreaSlug.split("-");
      return [...restaurantAreaSlugs].some(
        (restaurantAreaSlug) =>
          restaurantAreaSlug.length >= 4 &&
          (customerPieces.includes(restaurantAreaSlug) ||
            restaurantAreaSlug.split("-").some(
              (piece) => piece.length >= 4 && customerPieces.includes(piece)
            ))
      );
    });
  }

  function getQuestionPoolForSession(restaurant, customer) {
    const restaurantAreaSlugs = getRestaurantAreaSlugs(restaurant);
    const restaurantQuestions = questions.filter(
      (question) => getRestaurantQuestionSlug(question) === restaurant.slug
    );
    const globalQuestions = questions.filter(
      (question) => question.scope === "global" && isSharedQuestion(question)
    );
    const areaQuestions =
      restaurant.includeAreaQuestions === false
        ? []
        : questions.filter(
            (question) =>
              question.scope === "area" &&
              isAreaQuestionForRestaurant(question, restaurant, restaurantAreaSlugs) &&
              isSharedQuestion(question)
          );
    const customerQuestions = questions.filter((question) => {
      const targetedCustomerIds = Array.isArray(question.customerIds) ? question.customerIds : [];
      const isCustomerScoped = question.scope === "customer";
      const isTargetedGlobal = question.scope === "global" && targetedCustomerIds.includes(customer.id);

      return (
        (isCustomerScoped || isTargetedGlobal) &&
        targetedCustomerIds.includes(customer.id) &&
        isQuestionAllowedForRestaurant(question, restaurant)
      );
    });
    const customerTags = new Set(
      [customer.characterType, customer.group, customer.restaurant !== "shared" ? customer.restaurant : ""].filter(Boolean)
    );
    const focusedQuestions = questions.filter(
      (question) =>
        question.tags.some((tag) => customerTags.has(tag)) &&
        !(question.customerIds || []).includes(customer.id) &&
        isSharedQuestion(question)
    );

    return {
      restaurantQuestions,
      globalQuestions,
      areaQuestions,
      customerQuestions,
      focusedQuestions,
    };
  }

  function isGeneralTriviaQuestion(question) {
    const tags = Array.isArray(question.tags) ? question.tags : [];
    const blockedTags = new Set(["americana", "pepperville", "communityverse", "storybook", "cryptid", "food"]);
    return tags.every((tag) => !blockedTags.has(tag));
  }

  function isFoodPhotoQuestion(question) {
    if (!(question.image || question.imagePrompt)) {
      return false;
    }

    const tags = Array.isArray(question.tags) ? question.tags.map(slugify) : [];
    if (tags.some((tag) => ["food", "menu", "menu-item", "dish", "drink", "dessert"].includes(tag))) {
      return true;
    }

    const searchable = normalizeText(
      [
        question.prompt,
        question.imageAlt,
        question.imagePrompt,
        question.correctAnswer,
        ...(question.wrongAnswers || []),
      ].filter(Boolean).join(" ")
    );
    return /menu|food|dish|drink|dessert|breakfast|burger|pizza|pie|platter|sandwich|steak|cobbler|coffee|meal/.test(searchable);
  }

  function prepareQuestion(question) {
    const options = shuffle([
      question.correctAnswer,
      ...(question.wrongAnswers || []),
    ]);

    return {
      id: question.id,
      prompt: question.prompt,
      image: question.image || "",
      imageAlt: question.imageAlt || "",
      options,
      correctAnswer: question.correctAnswer,
      correctIndex: options.indexOf(question.correctAnswer),
      scope: question.scope,
      restaurantSlug: question.restaurantSlug || "",
      tags: question.tags || [],
      difficulty: question.difficulty || "medium",
      customerIds: question.customerIds || [],
    };
  }

  function buildSessionQuestions(restaurant, customer, profile) {
    const pools = getQuestionPoolForSession(restaurant, customer);
    const chosen = Array(10).fill(null);
    const usedIds = new Set();
    const isAmericanaDemo = restaurant.slug === "americana";
    const restaurantSlots = isAmericanaDemo ? [3] : [0, 5];
    const openerSlots = [0];

    const restaurantQuestions = shuffle(pools.restaurantQuestions);
    const restaurantImageQuestions = pools.restaurantQuestions.filter(isFoodPhotoQuestion);
    const restaurantImageQuestion = selectNextImageQuestion(
      restaurantImageQuestions,
      getRestaurantQuestionMemory(profile, restaurant.slug).lastImageQuestionId
    );

    const restaurantSelection = [];
    if (restaurantImageQuestion) {
      restaurantSelection.push(restaurantImageQuestion);
    }

    pickMany(
      restaurantQuestions.filter(
        (question) =>
          !usedIds.has(question.id) &&
          (!restaurantImageQuestion || question.id !== restaurantImageQuestion.id) &&
          !(question.image || question.imagePrompt)
      ),
      restaurantSlots.length - restaurantSelection.length
    ).forEach((question) => {
      restaurantSelection.push(question);
    });

    restaurantSelection.slice(0, restaurantSlots.length).forEach((question, index) => {
      usedIds.add(question.id);
      chosen[restaurantSlots[index]] = question;
    });

    if (isAmericanaDemo) {
      const openerQuestion = pickMany(
        pools.globalQuestions.filter(
          (question) => isGeneralTriviaQuestion(question) && !usedIds.has(question.id)
        ),
        1
      )[0];

      if (openerQuestion) {
        usedIds.add(openerQuestion.id);
        chosen[openerSlots[0]] = openerQuestion;
      }
    }

    const challengingCustomer = customer.characterType === "historical" || customer.characterType === "storybook";
    const customerQuestionCount = isAmericanaDemo ? 0 : challengingCustomer ? 3 : 1;
    const focusQuestionCount = isAmericanaDemo ? 0 : challengingCustomer ? 0 : 1;
    const areaQuestionCount = isAmericanaDemo ? 1 : Math.min(2, pools.areaQuestions.length);
    const globalQuestionCount = isAmericanaDemo ? 8 : challengingCustomer ? 3 - areaQuestionCount : 4 - areaQuestionCount;
    const globalQuestionPool = isAmericanaDemo
      ? pools.globalQuestions.filter(isGeneralTriviaQuestion)
      : pools.globalQuestions;

    const buckets = [
      { count: customerQuestionCount, pool: pools.customerQuestions },
      { count: focusQuestionCount, pool: pools.focusedQuestions },
      { count: globalQuestionCount, pool: globalQuestionPool },
      { count: areaQuestionCount, pool: pools.areaQuestions },
    ];

    const remainingSlots = chosen
      .map((question, index) => (question ? null : index))
      .filter((index) => index !== null);
    let remainingIndex = 0;

    buckets.forEach((bucket) => {
      const available = bucket.pool.filter((question) => !usedIds.has(question.id));
      pickMany(available, bucket.count).forEach((question) => {
        if (remainingIndex >= remainingSlots.length) {
          return;
        }
        usedIds.add(question.id);
        chosen[remainingSlots[remainingIndex]] = question;
        remainingIndex += 1;
      });
    });

    if (remainingIndex < remainingSlots.length) {
      const fallbackPool = questions.filter(
        (question) =>
          !usedIds.has(question.id) &&
          isQuestionAllowedForRestaurant(question, restaurant)
      );
      pickMany(fallbackPool, remainingSlots.length - remainingIndex).forEach((question) => {
        if (remainingIndex >= remainingSlots.length) {
          return;
        }
        usedIds.add(question.id);
        chosen[remainingSlots[remainingIndex]] = question;
        remainingIndex += 1;
      });
    }

    return chosen.filter(Boolean).map(prepareQuestion);
  }

  function weightedCustomerPick(list) {
    if (!list.length) {
      return null;
    }

    const sorted = shuffle(list);
    const weighted = [];

    sorted.forEach((customer) => {
      let weight = 1;
      if (customer.rarity === "Common") {
        weight = 4;
      } else if (customer.rarity === "Uncommon") {
        weight = 3;
      } else if (customer.rarity === "Rare") {
        weight = 2;
      }

      for (let index = 0; index < weight; index += 1) {
        weighted.push(customer);
      }
    });

    return pickOne(weighted);
  }

  function pickCustomerForRestaurant(restaurant, profile, candidateCustomerIds = []) {
    const recentCustomerIds = (profile.recentSessions || [])
      .slice(0, 3)
      .map((session) => session.customerId);

    const candidateSet = new Set(candidateCustomerIds);
    const allCustomers = getCustomersForRestaurant(restaurant.slug)
      .filter((customer) => !candidateSet.size || candidateSet.has(customer.id));
    const ownedCustomerIds = getOwnedCustomerIdsForRestaurant(profile, restaurant.slug);
    const areaSlugs = getCustomerAreaMatchSlugs(restaurant);
    const collection = ensureProfileShape(profile).customerCollection;
    const isPhotoReady = (customer) =>
      customer.image && !customer.image.includes("customer-placeholder");
    const unownedRecentSafe = (customer) =>
      !recentCustomerIds.includes(customer.id) && !ownedCustomerIds.has(customer.id);
    const pickFrom = (customers) => {
      const photoReady = customers.filter(isPhotoReady);
      return weightedCustomerPick(photoReady.length ? photoReady : customers);
    };
    const restaurantSpecific = allCustomers.filter(
      (customer) =>
        customer.restaurant === restaurant.slug &&
        unownedRecentSafe(customer)
    );

    if (restaurantSpecific.length) {
      return pickFrom(restaurantSpecific);
    }

    const areaSpecific = allCustomers.filter(
      (customer) =>
        customer.restaurant === "shared" &&
        unownedRecentSafe(customer) &&
        customerMatchesRestaurantArea(customer, areaSlugs)
    );

    if (areaSpecific.length) {
      return pickFrom(areaSpecific);
    }

    const sharedSpecific = allCustomers.filter(
      (customer) =>
        customer.restaurant === "shared" &&
        unownedRecentSafe(customer)
    );

    if (sharedSpecific.length) {
      return pickFrom(sharedSpecific);
    }

    const favoriteReplayIds = new Set(
      collection
        .filter(
          (entry) =>
            entry.status === "regular" &&
            (Number(entry.favoriteVisits) || 0) < FAVORITE_VISIT_GOAL
        )
        .map((entry) => entry.customerId)
    );
    const favoriteReplayCandidates = allCustomers.filter(
      (customer) =>
        favoriteReplayIds.has(customer.id) &&
        !recentCustomerIds.includes(customer.id) &&
        isPhotoReady(customer)
    );

    if (favoriteReplayCandidates.length && Math.random() < 0.25) {
      return weightedCustomerPick(favoriteReplayCandidates);
    }

    const preferred = allCustomers.filter(
      (customer) =>
        !recentCustomerIds.includes(customer.id) && !ownedCustomerIds.has(customer.id)
    );
    const photoReady = (preferred.length ? preferred : allCustomers).filter(isPhotoReady);

    const selectable = photoReady.length
      ? photoReady
      : preferred.length
        ? preferred
        : allCustomers.filter((customer) => !ownedCustomerIds.has(customer.id));

    return weightedCustomerPick(selectable);
  }

  function buildSession(restaurantSlug, options = {}) {
    const profile = getActiveProfile();
    if (!profile) {
      return null;
    }

    let workingProfile = ensureProfileShape(profile);

    const restaurant = getRestaurantBySlug(restaurantSlug);
    if (!restaurant) {
      return null;
    }

    const allCustomers = getCustomersForRestaurant(restaurant.slug);
    const preferredCustomerId = String(options.customerId || "").trim();
    const candidateCustomerIds = Array.isArray(options.customerPoolIds)
      ? options.customerPoolIds
        .map((value) => String(value || "").trim())
        .filter(Boolean)
      : [];
    const preferredCustomer = preferredCustomerId
      ? allCustomers.find((customer) => customer.id === preferredCustomerId) || null
      : null;
    const featuredGuests = candidateCustomerIds.length
      ? getFeaturedGuestLineup(workingProfile, restaurant.slug, 4)
      : [];
    const selectableFeaturedGuests = candidateCustomerIds.length
      ? featuredGuests.filter((customer) => candidateCustomerIds.includes(customer.id))
      : featuredGuests;
    const customer = preferredCustomer ||
      (selectableFeaturedGuests.length
        ? weightedCustomerPick(selectableFeaturedGuests)
        : featuredGuests.length
          ? weightedCustomerPick(featuredGuests)
        : pickCustomerForRestaurant(restaurant, profile, candidateCustomerIds));
    if (!customer) {
      return null;
    }

    const existingCollectionEntry = getCustomerCollectionEntry(profile, customer.id, restaurant.slug);

    const session = {
      id: makeId("session"),
      profileId: profile.id,
      restaurantSlug: restaurant.slug,
      restaurantName: restaurant.name,
      customer,
      isRepeatCustomer: Boolean(existingCollectionEntry),
      isRegularCustomerReplay: existingCollectionEntry
        ? existingCollectionEntry.status === "regular" || existingCollectionEntry.status === "favorite"
        : false,
      replayCustomerId: preferredCustomer ? preferredCustomer.id : "",
      previousCustomerStatus: existingCollectionEntry ? existingCollectionEntry.status : "",
      previousFavoriteVisits: existingCollectionEntry ? Number(existingCollectionEntry.favoriteVisits) || 0 : 0,
      improvingExistingCustomer: Boolean(preferredCustomer),
      questions: buildSessionQuestions(restaurant, customer, profile),
      currentIndex: 0,
      score: 0,
      answers: [],
      startedAt: nowIso(),
      updatedAt: nowIso(),
      completed: false,
      result: "",
      outcomeText: "",
      favoriteProgress: null,
    };

    if (featuredGuests.length && !preferredCustomer) {
      workingProfile = advanceFeaturedGuestRotation(workingProfile, restaurant.slug, 1);
    }

    const sessionImageQuestion = session.questions.find(
      (question) =>
        question.scope === "restaurant" &&
        question.restaurantSlug === restaurant.slug &&
        (question.image || question.imagePrompt)
    );

    if (sessionImageQuestion) {
      const nextProfile = ensureProfileShape(workingProfile);
      const restaurantStats =
        nextProfile.restaurantStats[restaurant.slug] || buildEmptyRestaurantStats();
      restaurantStats.lastImageQuestionId = sessionImageQuestion.id;
      nextProfile.restaurantStats[restaurant.slug] = restaurantStats;
      workingProfile = updateProfile(nextProfile) || nextProfile;
    }

    activeSessionState.session = clone(session);
    writeJson(STORAGE_KEYS.activeSession, session);
    return clone(session);
  }

  function getActiveSession() {
    if (activeSessionState.session) {
      return clone(activeSessionState.session);
    }

    const storedSession = readJson(STORAGE_KEYS.activeSession, null);
    if (storedSession) {
      activeSessionState.session = storedSession;
      return clone(activeSessionState.session);
    }

    return null;
  }

  function clearActiveSession() {
    activeSessionState.session = null;
    try {
      window.localStorage?.removeItem(STORAGE_KEYS.activeSession);
    } catch (error) {
      // Ignore storage blocks and rely on the in-memory cache.
    }
  }

  function completeSession(session) {
    const profiles = getProfiles().map((profile) => {
      if (profile.id !== session.profileId) {
        return profile;
      }

      const nextProfile = ensureProfileShape(profile);
      const previousEstimatedSales = Math.max(0, Number(nextProfile.stats?.estimatedSales) || 0);

      const overallStats = nextProfile.stats;
      overallStats.gamesPlayed += 1;
      overallStats.totalCorrectAnswers += session.score;
      overallStats.regularCustomers = 0;
      overallStats.favoriteCustomers = 0;
      overallStats.occasionalCustomers = 0;
      overallStats.lostCustomers = 0;
      overallStats.totalCustomerValue = 0;
      overallStats.estimatedSales = 0;

      nextProfile.lastPlayedAt = nowIso();

      const restaurantStats =
        nextProfile.restaurantStats[session.restaurantSlug] ||
        buildEmptyRestaurantStats();
      restaurantStats.gamesPlayed += 1;
      restaurantStats.totalCorrectAnswers += session.score;
      restaurantStats.regularCustomers = 0;
      restaurantStats.favoriteCustomers = 0;
      restaurantStats.occasionalCustomers = 0;
      restaurantStats.lostCustomers = 0;
      restaurantStats.totalCustomerValue = 0;
      restaurantStats.estimatedSales = 0;

      nextProfile.recentSessions = [
        {
          id: session.id,
          restaurantSlug: session.restaurantSlug,
          restaurantName: session.restaurantName,
          customerId: session.customer.id,
          customerName: session.customer.name,
          customerImage: session.customer.image,
          customerBio: getCustomerBio(session.customer),
          score: session.score,
          totalQuestions: session.questions.length,
          result: session.result,
          playedAt: session.completedAt || nowIso(),
        },
        ...nextProfile.recentSessions,
      ].slice(0, RECENT_SESSION_LIMIT);

      const existingCustomerIndex = nextProfile.customerCollection.findIndex(
        (entry) => entry.customerId === session.customer.id
      );
      const existingCustomer =
        existingCustomerIndex >= 0 ? nextProfile.customerCollection[existingCustomerIndex] : null;

      if (existingCustomer) {
        const existingWasRegular =
          existingCustomer.status === "regular" || existingCustomer.status === "favorite";
        const nextFavoriteVisits =
          session.favoriteProgress && session.favoriteProgress.wasEligible
            ? session.favoriteProgress.visits
            : Number(existingCustomer.favoriteVisits) || 0;
        const bestStatus =
          existingWasRegular
            ? nextFavoriteVisits >= FAVORITE_VISIT_GOAL
              ? "favorite"
              : "regular"
            : getCustomerStatusRank(session.result) > getCustomerStatusRank(existingCustomer.status)
              ? session.result
              : existingCustomer.status;
        const updatedEntry = {
          ...existingCustomer,
          customerName: session.customer.name,
          status: bestStatus,
          restaurantSlug: session.restaurantSlug,
          restaurantName: session.restaurantName,
          rarity: session.customer.rarity,
          regularValue: session.customer.regularValue,
          occasionalValue: session.customer.occasionalValue,
          favoriteVisits: bestStatus === "favorite" ? FAVORITE_VISIT_GOAL : nextFavoriteVisits,
          restaurantCredits: addRestaurantCreditToEntry(existingCustomer, session),
          image: session.customer.image,
          bio: getCustomerBio(session.customer),
          dateWon: nowIso(),
        };

        nextProfile.customerCollection = nextProfile.customerCollection.filter(
          (entry) => entry.customerId !== session.customer.id
        );
        nextProfile.customerCollection.unshift(updatedEntry);
      } else {
        if (session.result !== "lost") {
          nextProfile.customerCollection.unshift({
            id: makeId("collection"),
            customerId: session.customer.id,
            customerName: session.customer.name,
            status: session.result,
            restaurantSlug: session.restaurantSlug,
            restaurantName: session.restaurantName,
            rarity: session.customer.rarity,
            regularValue: session.customer.regularValue,
            occasionalValue: session.customer.occasionalValue,
            favoriteVisits: 0,
            restaurantCredits: addRestaurantCreditToEntry({
              restaurantSlug: session.restaurantSlug,
              restaurantName: session.restaurantName,
              status: session.result,
              dateWon: session.completedAt || nowIso(),
            }, session),
            image: session.customer.image,
            bio: getCustomerBio(session.customer),
            dateWon: nowIso(),
          });
        }
      }

      const rebuiltProfile = rebuildCollectionDerivedStats(nextProfile);
      const cashEarned = Math.max(
        0,
        (Number(rebuiltProfile.stats?.estimatedSales) || 0) - previousEstimatedSales
      );
      const economy = normalizeRestaurantEconomy(rebuiltProfile.restaurantEconomy);
      if (cashEarned > 0 && hasTrackedRestaurantEconomy(economy)) {
        rebuiltProfile.restaurantEconomy = {
          ...economy,
          cashOnHand: economy.cashOnHand + cashEarned,
          lifetimeCashEarned: Math.max(economy.lifetimeCashEarned, previousEstimatedSales) + cashEarned,
        };
      }

      return rebuiltProfile;
    });

    saveProfiles(profiles);
    activeSessionState.session = clone(session);
    writeJson(STORAGE_KEYS.activeSession, session);
    void syncSessionToServer(session);
  }

  function answerActiveSession(selectedIndex) {
    const session = getActiveSession();
    if (!session || session.completed) {
      return {
        session,
        isCorrect: false,
        completed: true,
        correctAnswer: "",
      };
    }

    const question = session.questions[session.currentIndex];
    if (!question) {
      return {
        session,
        isCorrect: false,
        completed: true,
        correctAnswer: "",
      };
    }

    const isCorrect = Number(selectedIndex) === question.correctIndex;
    session.answers.push({
      questionId: question.id,
      selectedIndex,
      correctIndex: question.correctIndex,
      isCorrect,
    });

    if (isCorrect) {
      session.score += 1;
    }

    session.currentIndex += 1;
    session.updatedAt = nowIso();

    const hasMoreQuestions = session.currentIndex < session.questions.length;
    if (!hasMoreQuestions) {
      session.completed = true;
      session.completedAt = nowIso();
      const scoreResult = getCustomerResultForScore(session.customer, session.score);
      const thresholds = getCustomerWinThresholds(session.customer);
      const isRegularReplay =
        session.previousCustomerStatus === "regular" || session.previousCustomerStatus === "favorite";
      const favoriteWasAlreadyComplete = session.previousCustomerStatus === "favorite";
      const successfulFavoriteVisit = isRegularReplay && session.score >= thresholds.regular;
      const previousFavoriteVisits = Math.max(0, Math.min(FAVORITE_VISIT_GOAL, Number(session.previousFavoriteVisits) || 0));
      const nextFavoriteVisits = favoriteWasAlreadyComplete
        ? FAVORITE_VISIT_GOAL
        : successfulFavoriteVisit
          ? Math.min(FAVORITE_VISIT_GOAL, previousFavoriteVisits + 1)
          : previousFavoriteVisits;
      const becameFavorite =
        !favoriteWasAlreadyComplete &&
        previousFavoriteVisits < FAVORITE_VISIT_GOAL &&
        nextFavoriteVisits >= FAVORITE_VISIT_GOAL;

      session.favoriteProgress = isRegularReplay
        ? {
            wasEligible: true,
            successful: successfulFavoriteVisit,
            previousVisits: previousFavoriteVisits,
            visits: nextFavoriteVisits,
            goal: FAVORITE_VISIT_GOAL,
            becameFavorite,
            regularValue: Number(session.customer.regularValue) || 0,
            favoriteValue: getFavoriteCustomerValue(session.customer),
            threshold: thresholds.regular,
          }
        : null;
      session.result = isRegularReplay
        ? (becameFavorite || favoriteWasAlreadyComplete ? "favorite" : "regular")
        : scoreResult;
      session.outcomeText =
        session.result === "favorite"
          ? "favorite customer"
          : session.result === "regular"
          ? "regular customer"
          : session.result === "occasional"
            ? "occasional customer"
            : "lost customer";
      completeSession(session);
    } else {
      activeSessionState.session = clone(session);
      writeJson(STORAGE_KEYS.activeSession, session);
    }

    return {
      session: clone(session),
      isCorrect,
      completed: session.completed,
      correctAnswer: question.correctAnswer,
      correctIndex: question.correctIndex,
      question,
    };
  }

  function startNewSession(restaurantSlug, options = {}) {
    return buildSession(restaurantSlug, options);
  }

  function isPublicLeaderboardRestaurant(restaurantSlug) {
    const restaurant = getRestaurantBySlug(restaurantSlug);
    return Boolean(
      restaurant &&
        restaurant.active !== false &&
        restaurant.playable !== false &&
        restaurant.visibleInList !== false
    );
  }

  function addStats(target, source) {
    target.gamesPlayed += Number(source.gamesPlayed) || 0;
    target.totalCorrectAnswers += Number(source.totalCorrectAnswers) || 0;
    target.regularCustomers += Number(source.regularCustomers) || 0;
    target.favoriteCustomers += Number(source.favoriteCustomers) || 0;
    target.occasionalCustomers += Number(source.occasionalCustomers) || 0;
    target.lostCustomers += Number(source.lostCustomers) || 0;
    target.totalCustomerValue += Number(source.totalCustomerValue) || 0;
    target.estimatedSales += Number(source.estimatedSales) || 0;
  }

  function getPublicLeaderboardStats(profile) {
    const safeProfile = ensureProfileShape(profile);
    const entries = Object.entries(safeProfile.restaurantStats || {});

    if (!entries.length) {
      return safeProfile.stats;
    }

    const stats = entries.reduce((combinedStats, [restaurantSlug, restaurantStats]) => {
      if (isPublicLeaderboardRestaurant(restaurantSlug)) {
        addStats(combinedStats, restaurantStats);
      }

      return combinedStats;
    }, buildEmptyStats());

    stats.restaurantValue = getRestaurantValue(safeProfile, stats);
    return stats;
  }

  function getLeaderboard(metric, restaurantSlug) {
    const profiles = getProfiles().map((profile) => {
      const safeProfile = ensureProfileShape(profile);
      const stats = restaurantSlug
        ? isPublicLeaderboardRestaurant(restaurantSlug)
          ? safeProfile.restaurantStats[restaurantSlug] || buildEmptyStats()
          : buildEmptyStats()
        : getPublicLeaderboardStats(safeProfile);
      const accuracy = stats.gamesPlayed
        ? (stats.totalCorrectAnswers / (stats.gamesPlayed * 10)) * 100
        : 0;
      const restaurantValueStats =
        metric === "restaurantValue" ? getPublicLeaderboardStats(safeProfile) : stats;

      return {
        profile: safeProfile,
        stats,
        accuracy,
        rating: accuracy / 20,
        value:
          metric === "rating"
            ? accuracy / 20
            : metric === "accuracy"
              ? accuracy
            : metric === "gamesPlayed"
              ? stats.gamesPlayed
              : metric === "restaurantValue"
                ? restaurantValueStats.restaurantValue || getRestaurantValue(safeProfile, restaurantValueStats)
              : metric === "regularCustomers"
                ? stats.regularCustomers
                : metric === "favoriteCustomers"
                  ? stats.favoriteCustomers || 0
                  : metric === "collected"
                    ? stats.regularCustomers + stats.occasionalCustomers
                    : stats.estimatedSales,
      };
    });

    return profiles
      .filter((entry) => entry.stats.gamesPlayed > 0)
      .sort((left, right) => {
        if (right.value !== left.value) {
          return right.value - left.value;
        }

        return left.profile.playerName.localeCompare(right.profile.playerName);
      })
      .map((entry, index) => ({
        rank: index + 1,
        profileId: entry.profile.id,
        playerName: entry.profile.playerName,
        restaurantName: entry.profile.restaurantName,
        stats: entry.stats,
        accuracy: entry.accuracy,
        rating: entry.rating,
        value: entry.value,
      }));
  }

  function getPlayerRank(profileId, metric, restaurantSlug) {
    const leaderboard = getLeaderboard(metric, restaurantSlug);
    const match = leaderboard.find((entry) => entry.profileId === profileId);
    return match ? match.rank : null;
  }

  function getProfileSummary(profile, restaurantSlug) {
    const safeProfile = ensureProfileShape(profile);
    const stats = restaurantSlug
      ? safeProfile.restaurantStats[restaurantSlug] || buildEmptyStats()
      : safeProfile.stats;
    const accuracy = stats.gamesPlayed
      ? (stats.totalCorrectAnswers / (stats.gamesPlayed * 10)) * 100
      : 0;

    return {
      profile: safeProfile,
      stats,
      accuracy,
      rating: accuracy / 20,
      regularAndOccasional: stats.regularCustomers + stats.occasionalCustomers,
    };
  }

  function isHexColor(value) {
    return /^#[0-9a-f]{6}$/i.test(String(value || "").trim());
  }

  function applyRestaurantTheme(restaurant) {
    if (!restaurant || typeof document === "undefined" || !document.documentElement) {
      return;
    }

    const mainColor = String(restaurant.primaryColor || "").trim();
    const secondColor = String(restaurant.secondaryColor || "").trim();
    const accentColor = String(restaurant.accentColor || "").trim();
    const rootStyle = document.documentElement.style;

    if (isHexColor(mainColor)) {
      rootStyle.setProperty("--accent", mainColor);
      rootStyle.setProperty("--gold-deep", mainColor);
    }

    if (isHexColor(secondColor)) {
      rootStyle.setProperty("--green", secondColor);
      rootStyle.setProperty("--teal", secondColor);
      rootStyle.setProperty("--panel-strong", secondColor);
    }

    if (isHexColor(accentColor)) {
      rootStyle.setProperty("--gold", accentColor);
    }
  }

  window.RestaurantChallengeCore = {
    restaurants,
    customers,
    questions,
    formatCurrency,
    formatPercent,
    formatRating,
    slugify,
    normalizeText,
    validateProfileInput,
    getProfiles,
    saveProfiles,
    getActiveProfile,
    setActiveProfileId,
    clearActiveProfileId,
    createProfile,
    createGuestProfile,
    generateGuestRestaurantName,
    updateProfile,
    sendEmailSignInLink,
    completeEmailSignInFromUrl,
    getRestaurantBySlug,
    getCustomerById,
    getCustomerBio,
    getCustomerWinThresholds,
    getFavoriteCustomerValue,
    getFavoriteVisitGoal,
    getCollectionEntryValue,
    getCustomerStatusLabel,
    getRestaurantValue,
    getRestaurantValueBreakdown,
    getRestaurantCashOnHand,
    getRestaurantExpansionPreview,
    getRestaurantUpgradePreview,
    buyNextRestaurantExpansion,
    getCustomersForRestaurant,
    getPhotoReadyCustomersForRestaurant,
    getFeaturedGuestLineup,
    getQuestionPoolForSession,
    buildSessionQuestions,
    getActiveSession,
    clearActiveSession,
    startNewSession,
    answerActiveSession,
    getLeaderboard,
    getPlayerRank,
    getPublicLeaderboardStats,
    getProfileSummary,
    applyRestaurantTheme,
    getCurrentTimestamp: nowIso,
    whenReady: () => ready,
  };
})();
