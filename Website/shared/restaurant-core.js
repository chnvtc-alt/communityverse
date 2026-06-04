(() => {
  const STORAGE_KEYS = {
    profiles: "restaurant_challenge_profiles_v1",
    activeProfileId: "restaurant_challenge_active_profile_v1",
    activeSession: "restaurant_challenge_active_session_v1",
  };
  const API_BASE = "/api";
  const USE_REMOTE_SYNC = typeof window.fetch === "function";
  const profilesCacheState = {
    loaded: false,
    source: "local",
    profiles: [],
  };
  let readyResolve = () => {};
  const ready = new Promise((resolve) => {
    readyResolve = resolve;
  });

  const BLOCKED_RESTAURANT_NAMES = [
    "mcdonalds",
    "mc donalds",
    "chick fil a",
    "chickfila",
    "waffle house",
    "olive garden",
    "americana diner",
  ];

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
      heroImage: "../assets/restaurant-challenge/restaurants/americana/americana-diner-hero.jpg",
      logoSquare: "../assets/restaurant-challenge/restaurants/americana/americana-diner-logo.jpg",
      logoHorizontal: "../assets/restaurant-challenge/restaurants/americana/americana-diner-logo.jpg",
      squareImage: "../assets/restaurant-challenge/restaurants/americana/americana-diner-logo.jpg",
      active: true,
    },
  ];

  const customers = [
    {
      id: "joyce-pepper",
      name: "Mayor Joyce Pepper",
      group: "communityverse",
      rarity: "Rare",
      regularValue: 250,
      occasionalValue: 75,
      focusTag: "communityverse",
      image: "../assets/restaurant-challenge/customers/customer-placeholder.svg",
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
      image: "../assets/restaurant-challenge/customers/customer-placeholder.svg",
    },
    {
      id: "captain-zoogle",
      name: "Captain Zoogle",
      group: "communityverse",
      rarity: "Rare",
      regularValue: 500,
      occasionalValue: 150,
      focusTag: "communityverse",
      image: "../assets/restaurant-challenge/customers/customer-placeholder.svg",
    },
    {
      id: "americana-waitress",
      name: "Americana Diner Waitress",
      group: "exclusive",
      rarity: "Common",
      regularValue: 100,
      occasionalValue: 25,
      focusTag: "americana",
      image: "../assets/restaurant-challenge/customers/customer-placeholder.svg",
    },
    {
      id: "route-66-tourist",
      name: "Route 66 Tourist",
      group: "exclusive",
      rarity: "Uncommon",
      regularValue: 150,
      occasionalValue: 45,
      focusTag: "americana",
      image: "../assets/restaurant-challenge/customers/customer-placeholder.svg",
    },
    {
      id: "retired-veteran",
      name: "Retired Veteran",
      group: "exclusive",
      rarity: "Uncommon",
      regularValue: 140,
      occasionalValue: 40,
      focusTag: "americana",
      image: "../assets/restaurant-challenge/customers/customer-placeholder.svg",
    },
    {
      id: "pie-contest-judge",
      name: "Pie Contest Judge",
      group: "exclusive",
      rarity: "Rare",
      regularValue: 225,
      occasionalValue: 70,
      focusTag: "americana",
      image: "../assets/restaurant-challenge/customers/customer-placeholder.svg",
    },
    {
      id: "breakfast-regular",
      name: "Breakfast Regular",
      group: "exclusive",
      rarity: "Common",
      regularValue: 110,
      occasionalValue: 30,
      focusTag: "americana",
      image: "../assets/restaurant-challenge/customers/customer-placeholder.svg",
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

  const questions = [
    {
      id: "americana-signature-1",
      scope: "restaurant",
      restaurantSlug: "americana",
      tags: ["americana"],
      prompt: "What kind of food is Americana Diner best known for?",
      correctAnswer: "Classic comfort diner food",
      wrongAnswers: [
        "Sushi and ramen",
        "Fine-dining tasting menus",
        "Only frozen desserts",
      ],
    },
    {
      id: "americana-signature-2",
      scope: "restaurant",
      restaurantSlug: "americana",
      tags: ["americana"],
      prompt: "Which meal is Americana Diner happiest to serve all day?",
      correctAnswer: "Breakfast",
      wrongAnswers: ["Only dinner", "Only lunch", "Late-night snacks only"],
    },
    {
      id: "americana-signature-3",
      scope: "restaurant",
      restaurantSlug: "americana",
      tags: ["americana"],
      image: "../assets/restaurant-challenge/restaurants/americana/americana-mile-high-cherry-pie.jpg",
      imageAlt: "Americana Mile-High Cherry Pie",
      imagePrompt: "Which menu item is shown in this photo?",
      prompt: "Which menu item is shown in this photo?",
      correctAnswer: "Americana Mile-High Cherry Pie",
      wrongAnswers: ["Cherry cobbler à la mode", "Route 66 Burger", "All-Day Breakfast Platter"],
    },
    {
      id: "americana-signature-4",
      scope: "restaurant",
      restaurantSlug: "americana",
      tags: ["americana"],
      prompt: "What drink should you expect to see at a classic diner counter?",
      correctAnswer: "Fresh hot coffee",
      wrongAnswers: ["Bubble tea", "Champagne service", "Energy shots only"],
    },
    {
      id: "americana-signature-5",
      scope: "restaurant",
      restaurantSlug: "americana",
      tags: ["americana"],
      prompt: "Which menu item sounds like a strong Americana Diner special?",
      correctAnswer: "The Route 66 Burger",
      wrongAnswers: ["The Galaxy Roll", "The Alpine Bento", "The Ocean Tasting"],
    },
    {
      id: "americana-signature-6",
      scope: "restaurant",
      restaurantSlug: "americana",
      tags: ["americana"],
      prompt: "What kind of atmosphere does Americana Diner aim for?",
      correctAnswer: "Classic roadside comfort",
      wrongAnswers: ["Ultra-minimal silence", "Luxury nightclub energy", "All seafood luxury"],
    },
    {
      id: "americana-signature-7",
      scope: "restaurant",
      restaurantSlug: "americana",
      tags: ["americana"],
      image: "../assets/restaurant-challenge/restaurants/americana/route-66-burger.jpg",
      imageAlt: "Route 66 Burger",
      imagePrompt: "Which menu item is shown in this photo?",
      prompt: "Which menu item is shown in this photo?",
      correctAnswer: "Route 66 Burger",
      wrongAnswers: ["Smokehouse Burger", "Patty Melt Deluxe", "All-Day Breakfast Platter"],
    },
    {
      id: "americana-signature-8",
      scope: "restaurant",
      restaurantSlug: "americana",
      tags: ["americana"],
      image: "../assets/restaurant-challenge/restaurants/americana/all-day-breakfast-platter.jpg",
      imageAlt: "All-Day Breakfast Platter",
      imagePrompt: "Which menu item is shown in this photo?",
      prompt: "Which menu item is shown in this photo?",
      correctAnswer: "All-Day Breakfast Platter",
      wrongAnswers: ["Route 66 Burger", "Country Ham Breakfast", "Americana Mile-High Cherry Pie"],
    },
    {
      id: "americana-signature-9",
      scope: "restaurant",
      restaurantSlug: "americana",
      tags: ["americana"],
      prompt: "Which road is featured in Americana Diner's branding?",
      correctAnswer: "Route 66",
      wrongAnswers: ["Route 11", "Highway 14", "County Road 7"],
    },
    {
      id: "americana-signature-10",
      scope: "restaurant",
      restaurantSlug: "americana",
      tags: ["americana"],
      prompt: "What slogan appears under the Americana Diner name?",
      correctAnswer: "Classic Comfort in Pepperville",
      wrongAnswers: ["Fresh Food in the Fast Lane", "Home Cooking on the Hill", "Breakfast by the Bay"],
    },
    {
      id: "americana-signature-11",
      scope: "restaurant",
      restaurantSlug: "americana",
      tags: ["americana"],
      prompt: "Which Americana Diner menu item is built like a big roadside burger special?",
      correctAnswer: "The Route 66 Burger",
      wrongAnswers: ["Smokehouse Burger", "Patty Melt Deluxe", "All-Day Breakfast Platter"],
    },
    {
      id: "americana-signature-12",
      scope: "restaurant",
      restaurantSlug: "americana",
      tags: ["americana"],
      prompt: "Which Americana Diner dish is the best choice for a full morning plate?",
      correctAnswer: "All-Day Breakfast Platter",
      wrongAnswers: ["Route 66 Burger", "Country Ham Breakfast", "Americana Mile-High Cherry Pie"],
    },
    {
      id: "americana-signature-13",
      scope: "restaurant",
      restaurantSlug: "americana",
      tags: ["americana"],
      prompt: "Which Americana Diner item sounds most like a dessert showcase?",
      correctAnswer: "Americana Mile-High Cherry Pie",
      wrongAnswers: ["Cherry cobbler à la mode", "Route 66 Burger", "All-Day Breakfast Platter"],
    },
    {
      id: "americana-signature-14",
      scope: "restaurant",
      restaurantSlug: "americana",
      tags: ["americana"],
      prompt: "If you want a savory plate at Americana Diner, what should you order?",
      correctAnswer: "The Route 66 Burger",
      wrongAnswers: ["Smokehouse Burger", "Patty Melt Deluxe", "All-Day Breakfast Platter"],
    },
    {
      id: "global-pepperville-1",
      scope: "global",
      tags: ["communityverse"],
      prompt: "Who is Pepperville's mayor?",
      correctAnswer: "Mayor Joyce Pepper",
      wrongAnswers: ["Miss Pearl", "Captain Zoogle", "Wicked Jim DeVito"],
    },
    {
      id: "global-pepperville-2",
      scope: "global",
      tags: ["communityverse"],
      prompt: "Who serves as Pepperville's fire chief?",
      correctAnswer: "Fire Chief Hank Hatley",
      wrongAnswers: ["Mayor Joyce Pepper", "Wicked Jim DeVito", "Miss Pearl"],
    },
    {
      id: "global-food-1",
      scope: "global",
      tags: ["food"],
      prompt: "Which of these is a classic breakfast food?",
      correctAnswer: "Pancakes",
      wrongAnswers: ["French fries", "Spaghetti", "Sushi"],
    },
    {
      id: "global-food-2",
      scope: "global",
      tags: ["food"],
      prompt: "Which dessert is most likely to show up on a diner menu?",
      correctAnswer: "Apple pie",
      wrongAnswers: ["Seaweed salad", "Miso soup", "Chimichurri toast"],
    },
    {
      id: "global-food-3",
      scope: "global",
      tags: ["food"],
      prompt: "Which item usually comes with a breakfast plate?",
      correctAnswer: "Bacon",
      wrongAnswers: ["Sausage", "Hash browns", "Toast"],
    },
    {
      id: "global-food-4",
      scope: "global",
      tags: ["food"],
      prompt: "What drink is a diner classic?",
      correctAnswer: "Coffee",
      wrongAnswers: ["Orange juice", "Iced tea", "Milk"],
    },
    {
      id: "global-history-1",
      scope: "global",
      tags: ["historical"],
      prompt: "Abraham Lincoln reached a national audience in the 1858 Senate campaign debates against who?",
      correctAnswer: "Stephen A. Douglas",
      wrongAnswers: ["William H. Seward", "Salmon P. Chase", "John C. Fremont"],
    },
    {
      id: "global-history-2",
      scope: "global",
      tags: ["historical"],
      prompt: "Which inventor is most closely associated with the light bulb?",
      correctAnswer: "Thomas Edison",
      wrongAnswers: ["Neil Armstrong", "Harriet Tubman", "Babe Ruth"],
    },
    {
      id: "global-history-3",
      scope: "global",
      tags: ["historical"],
      prompt: "Which famous pilot disappeared over the Pacific in 1937?",
      correctAnswer: "Amelia Earhart",
      wrongAnswers: ["Cleopatra", "Joan of Arc", "Florence Nightingale"],
    },
    {
      id: "global-history-4",
      scope: "global",
      tags: ["historical"],
      prompt: "Which historical figure is known for a kite in a lightning storm?",
      correctAnswer: "Benjamin Franklin",
      wrongAnswers: ["Blackbeard", "Winston Churchill", "Meriwether Lewis"],
    },
    {
      id: "global-history-5",
      scope: "global",
      tags: ["historical"],
      prompt: "Which ancient ruler is famously associated with Egypt?",
      correctAnswer: "Cleopatra",
      wrongAnswers: ["Boudicca", "Queen Victoria", "Joan of Arc"],
    },
    {
      id: "global-history-6",
      scope: "global",
      tags: ["historical"],
      prompt: "Which pirate is most famous for a black beard?",
      correctAnswer: "Blackbeard",
      wrongAnswers: ["Captain Nemo", "Long John Silver", "Jack Sparrow"],
    },
    {
      id: "global-egypt-1",
      scope: "global",
      tags: ["history"],
      customerIds: ["cleopatra", "king-tut"],
      prompt: "Which North African country is famous for its pyramids, pharaohs, and the Nile River?",
      correctAnswer: "Egypt",
      wrongAnswers: ["Morocco", "Algeria", "Libya"],
    },
    {
      id: "global-egypt-2",
      scope: "global",
      tags: ["history"],
      customerIds: ["cleopatra", "king-tut"],
      prompt: "Most pyramids in ancient Egypt were built as tombs for whom?",
      correctAnswer: "Pharaohs and their families",
      wrongAnswers: ["Merchants and traders", "Army generals", "Temple musicians"],
    },
    {
      id: "global-egypt-3",
      scope: "global",
      tags: ["history"],
      customerIds: ["cleopatra", "king-tut"],
      prompt: "What process did ancient Egyptians use to preserve bodies so the soul could live on?",
      correctAnswer: "Mummification",
      wrongAnswers: ["Embalming with spices", "Stone carving", "Papyrus writing"],
    },
    {
      id: "global-egypt-4",
      scope: "global",
      tags: ["history"],
      customerIds: ["cleopatra", "king-tut"],
      prompt: "How many symbols did the Egyptian writing system use?",
      correctAnswer: "More than 700 symbols",
      wrongAnswers: ["About 70 symbols", "About 200 symbols", "More than 2,000 symbols"],
    },
    {
      id: "global-egypt-5",
      scope: "global",
      tags: ["history"],
      customerIds: ["cleopatra", "king-tut"],
      prompt: "What is the name of Egypt's lifeline river?",
      correctAnswer: "The Nile River",
      wrongAnswers: ["The Amazon River", "The Mississippi River", "The Tigris River"],
    },
    {
      id: "global-egypt-6",
      scope: "global",
      tags: ["history"],
      customerIds: ["cleopatra", "king-tut"],
      prompt: "Which city is the capital of Egypt and home to its major museum?",
      correctAnswer: "Cairo",
      wrongAnswers: ["Alexandria", "Luxor", "Giza"],
    },
    {
      id: "global-communityverse-1",
      scope: "global",
      tags: ["communityverse"],
      prompt: "Which Pepperville character is known for sharp wit and troublemaking?",
      correctAnswer: "Wicked Jim DeVito",
      wrongAnswers: ["Miss Pearl", "Mayor Joyce Pepper", "Captain Zoogle"],
    },
    {
      id: "global-communityverse-2",
      scope: "global",
      tags: ["communityverse"],
      prompt: "Which Pepperville character is usually seen as a calm helper with a kind streak?",
      correctAnswer: "Miss Pearl",
      wrongAnswers: ["Mayor Joyce Pepper", "Wicked Jim DeVito", "Captain Zoogle"],
    },
    {
      id: "global-communityverse-3",
      scope: "global",
      tags: ["communityverse"],
      prompt: "Which Pepperville character sounds like a daring adventurer?",
      correctAnswer: "Captain Zoogle",
      wrongAnswers: ["Mayor Joyce Pepper", "Miss Pearl", "Wicked Jim DeVito"],
    },
    {
      id: "global-area-1",
      scope: "area",
      areaSlug: "pepperville",
      tags: ["pepperville"],
      prompt: "What river runs through Pepperville?",
      correctAnswer: "Chattawa River",
      wrongAnswers: ["Maple Creek", "Blueberry Bay", "Oak Falls"],
    },
    {
      id: "global-area-2",
      scope: "area",
      areaSlug: "pepperville",
      tags: ["pepperville"],
      prompt: "What county is Pepperville part of?",
      correctAnswer: "Chattawa County",
      wrongAnswers: ["North Bend County", "Riverstone County", "Sunnyside County"],
    },
    {
      id: "global-area-3",
      scope: "area",
      areaSlug: "pepperville",
      tags: ["pepperville"],
      prompt: "What is Pepperville's local baseball team called?",
      correctAnswer: "The Pepperville Poblanos",
      wrongAnswers: ["The Pepperville Pickles", "The County Cougars", "The River Runners"],
    },
    {
      id: "global-area-4",
      scope: "area",
      areaSlug: "pepperville",
      tags: ["pepperville"],
      prompt: "Which annual event is Pepperville known for?",
      correctAnswer: "Taste of Pepperville",
      wrongAnswers: ["The Pepper Festival", "The Ice Castle Gala", "The Deep Sea Fair"],
    },
    {
      id: "georgia-area-1",
      scope: "area",
      areaSlug: "georgia",
      tags: ["georgia"],
      prompt: "Who founded Georgia in 1732?",
      correctAnswer: "James Oglethorpe",
      wrongAnswers: ["John Oglethorpe", "James Madison", "John Wesley"],
    },
    {
      id: "georgia-area-2",
      scope: "area",
      areaSlug: "georgia",
      tags: ["georgia"],
      prompt: "Georgia was envisioned as a refuge for which group?",
      correctAnswer: "Debtors",
      wrongAnswers: ["Gold miners", "Sailors", "Merchants"],
    },
    {
      id: "georgia-area-3",
      scope: "area",
      areaSlug: "georgia",
      tags: ["georgia"],
      prompt: "In what year was Georgia founded?",
      correctAnswer: "1732",
      wrongAnswers: ["1712", "1752", "1776"],
    },
    {
      id: "georgia-area-4",
      scope: "area",
      areaSlug: "georgia",
      tags: ["georgia"],
      prompt: "Why did Britain want Georgia as a colony?",
      correctAnswer: "As a buffer zone against Spanish Florida",
      wrongAnswers: [
        "To mine gold in the mountains",
        "To build a Pacific trading post",
        "To replace South Carolina as the capital",
      ],
    },
    {
      id: "georgia-area-5",
      scope: "area",
      areaSlug: "georgia",
      tags: ["georgia"],
      prompt: "On what date did Georgia secede from the Union?",
      correctAnswer: "January 19, 1861",
      wrongAnswers: ["April 12, 1861", "March 4, 1861", "July 4, 1861"],
    },
    {
      id: "georgia-area-6",
      scope: "area",
      areaSlug: "georgia",
      tags: ["georgia"],
      prompt: "About how many soldiers did Georgia contribute to the Confederacy?",
      correctAnswer: "Nearly 120,000",
      wrongAnswers: ["About 20,000", "About 60,000", "About 250,000"],
    },
    {
      id: "georgia-area-7",
      scope: "area",
      areaSlug: "georgia",
      tags: ["georgia"],
      prompt: "What was the first major battle fought in Georgia?",
      correctAnswer: "The Battle of Chickamauga",
      wrongAnswers: ["The Battle of Atlanta", "The Battle of Kennesaw Mountain", "The Battle of Savannah"],
    },
    {
      id: "georgia-area-8",
      scope: "area",
      areaSlug: "georgia",
      tags: ["georgia"],
      prompt: "Which Georgia city was the base of Martin Luther King Jr.?",
      correctAnswer: "Atlanta",
      wrongAnswers: ["Savannah", "Augusta", "Macon"],
    },
    {
      id: "georgia-area-9",
      scope: "area",
      areaSlug: "georgia",
      tags: ["georgia"],
      prompt: "What major sporting event did Atlanta host in 1996?",
      correctAnswer: "The Summer Olympics",
      wrongAnswers: ["The Winter Olympics", "The World Cup", "The Pan American Games"],
    },
    {
      id: "georgia-area-10",
      scope: "area",
      areaSlug: "georgia",
      tags: ["georgia"],
      prompt: "Which Spanish conquistador led the first European expedition deep into the southeastern United States?",
      correctAnswer: "Hernando de Soto",
      wrongAnswers: ["Francisco Pizarro", "Hernán Cortés", "Juan Ponce de León"],
    },
    {
      id: "georgia-area-11",
      scope: "area",
      areaSlug: "georgia",
      tags: ["georgia"],
      prompt: "Which city has been Georgia's capital since 1868?",
      correctAnswer: "Atlanta",
      wrongAnswers: ["Savannah", "Augusta", "Milledgeville"],
    },
    {
      id: "georgia-area-12",
      scope: "area",
      areaSlug: "georgia",
      tags: ["georgia"],
      prompt: "Which city was Georgia's capital during British colonial rule?",
      correctAnswer: "Savannah",
      wrongAnswers: ["Atlanta", "Louisville", "Macon"],
    },
    {
      id: "georgia-area-13",
      scope: "area",
      areaSlug: "georgia",
      tags: ["georgia"],
      prompt: "Which city was one of Georgia's former capitals after Augusta and before Atlanta?",
      correctAnswer: "Milledgeville",
      wrongAnswers: ["Savannah", "Louisville", "Athens"],
    },
    {
      id: "georgia-area-14",
      scope: "area",
      areaSlug: "georgia",
      tags: ["georgia"],
      prompt: "What university was established in Georgia in 1785 as the first U.S. university to gain a state charter?",
      correctAnswer: "University of Georgia",
      wrongAnswers: ["Georgia Tech", "University of South Carolina", "University of Virginia"],
    },
    {
      id: "georgia-area-15",
      scope: "area",
      areaSlug: "georgia",
      tags: ["georgia"],
      prompt: "When did the Atlanta Braves last win the World Series?",
      correctAnswer: "2021",
      wrongAnswers: ["2019", "2022", "1995"],
    },
    {
      id: "georgia-area-16",
      scope: "area",
      areaSlug: "georgia",
      tags: ["georgia"],
      prompt: "What year did the Atlanta Falcons begin as an NFL expansion team?",
      correctAnswer: "1966",
      wrongAnswers: ["1956", "1970", "1981"],
    },
    {
      id: "georgia-area-17",
      scope: "area",
      areaSlug: "georgia",
      tags: ["georgia"],
      prompt: "Which stadium has been the Falcons' home since 2017?",
      correctAnswer: "Mercedes-Benz Stadium",
      wrongAnswers: ["Georgia Dome", "Atlanta-Fulton County Stadium", "Turner Field"],
    },
    {
      id: "georgia-area-18",
      scope: "area",
      areaSlug: "georgia",
      tags: ["georgia"],
      prompt: "What NHL team played in Atlanta from 1972 to 1980?",
      correctAnswer: "Atlanta Flames",
      wrongAnswers: ["Atlanta Thrashers", "Calgary Flames", "Boston Bruins"],
    },
    {
      id: "georgia-area-19",
      scope: "area",
      areaSlug: "georgia",
      tags: ["georgia"],
      prompt: "Where did the Atlanta Flames play their home games?",
      correctAnswer: "Omni Coliseum",
      wrongAnswers: ["Georgia Dome", "Mercedes-Benz Stadium", "Atlanta-Fulton County Stadium"],
    },
    {
      id: "georgia-area-20",
      scope: "area",
      areaSlug: "georgia",
      tags: ["georgia"],
      prompt: "When did the Hawks move to Atlanta from St. Louis?",
      correctAnswer: "May 3, 1968",
      wrongAnswers: ["May 3, 1958", "May 3, 1978", "May 3, 1988"],
    },
    {
      id: "georgia-area-21",
      scope: "area",
      areaSlug: "georgia",
      tags: ["georgia"],
      prompt: "From what city did the Hawks move to become the Atlanta Hawks?",
      correctAnswer: "St. Louis",
      wrongAnswers: ["Milwaukee", "Kansas City", "Cincinnati"],
    },
    {
      id: "global-storybook-1",
      scope: "global",
      tags: ["storybook"],
      prompt: "Which character is known for a grin that appears and disappears?",
      correctAnswer: "Cheshire Cat",
      wrongAnswers: ["Humpty Dumpty", "Big Bad Wolf", "Queen of Hearts"],
    },
    {
      id: "global-storybook-2",
      scope: "global",
      tags: ["storybook"],
      prompt: "Which character is usually associated with a red hood and a walk through the woods?",
      correctAnswer: "Little Red Riding Hood",
      wrongAnswers: ["Alice in Wonderland", "Mad Hatter", "The Tooth Fairy"],
    },
    {
      id: "global-storybook-3",
      scope: "global",
      tags: ["storybook"],
      prompt: "Which nursery rhyme character is famous for a very bad fall?",
      correctAnswer: "Humpty Dumpty",
      wrongAnswers: ["Sasquatch", "Blackbeard the Pirate", "Benjamin Franklin"],
    },
    {
      id: "global-storybook-4",
      scope: "global",
      tags: ["storybook"],
      prompt: "Which Wonderland character is known for throwing a very strange tea party?",
      correctAnswer: "Mad Hatter",
      wrongAnswers: ["Queen of Hearts", "Alice in Wonderland", "Big Bad Wolf"],
    },
    {
      id: "global-storybook-5",
      scope: "global",
      tags: ["storybook"],
      prompt: "Which fairy tale character is best known for huffing and puffing?",
      correctAnswer: "Big Bad Wolf",
      wrongAnswers: ["Cheshire Cat", "Humpty Dumpty", "Thomas Edison"],
    },
    {
      id: "global-storybook-6",
      scope: "global",
      tags: ["storybook"],
      prompt: "Which tiny helper visits after a lost tooth?",
      correctAnswer: "The Tooth Fairy",
      wrongAnswers: ["Queen of Hearts", "George Washington", "Billy the Kid"],
    },
    {
      id: "global-storybook-7",
      scope: "global",
      tags: ["storybook"],
      prompt: "Which Wonderland ruler is famous for shouting 'Off with their heads!'?",
      correctAnswer: "Queen of Hearts",
      wrongAnswers: ["Mad Hatter", "Alice in Wonderland", "Sasquatch"],
    },
    {
      id: "global-history-7",
      scope: "global",
      tags: ["historical"],
      prompt: "Which inventor is most associated with the practical electric light bulb?",
      correctAnswer: "Thomas Edison",
      wrongAnswers: ["Benjamin Franklin", "Napoleon Bonaparte", "Blackbeard the Pirate"],
    },
    {
      id: "global-history-8",
      scope: "global",
      tags: ["historical"],
      prompt: "Which aviator became famous for pushing flight records and disappearing over the Pacific?",
      correctAnswer: "Amelia Earhart",
      wrongAnswers: ["Cleopatra", "George Washington", "Billy the Kid"],
    },
    {
      id: "global-history-9",
      scope: "global",
      tags: ["historical"],
      prompt: "Which U.S. leader is most closely linked to the Revolutionary era and Mount Vernon?",
      correctAnswer: "George Washington",
      wrongAnswers: ["Thomas Edison", "Christopher Columbus", "King Tut"],
    },
    {
      id: "global-history-18",
      scope: "global",
      tags: ["historical"],
      prompt: "Who was the first President of the United States?",
      correctAnswer: "George Washington",
      wrongAnswers: ["Thomas Jefferson", "Abraham Lincoln", "John Adams"],
    },
    {
      id: "global-history-19",
      scope: "global",
      tags: ["historical"],
      prompt: "Which Revolutionary War general led the Continental Army?",
      correctAnswer: "George Washington",
      wrongAnswers: ["Alexander Hamilton", "Andrew Jackson", "Benjamin Franklin"],
    },
    {
      id: "global-history-20",
      scope: "global",
      tags: ["historical"],
      prompt: "Which estate is strongly associated with George Washington?",
      correctAnswer: "Mount Vernon",
      wrongAnswers: ["Monticello", "Montpelier", "Valley Forge"],
    },
    {
      id: "global-history-10",
      scope: "global",
      tags: ["historical"],
      prompt: "Which ancient ruler is usually tied to a famous Egyptian tomb?",
      correctAnswer: "King Tut",
      wrongAnswers: ["Napoleon Bonaparte", "Benjamin Franklin", "Blackbeard the Pirate"],
    },
    {
      id: "global-history-11",
      scope: "global",
      tags: ["historical"],
      prompt: "Which Egyptian queen is one of history's most famous rulers?",
      correctAnswer: "Cleopatra",
      wrongAnswers: ["Amelia Earhart", "Mad Hatter", "Little Red Riding Hood"],
    },
    {
      id: "global-history-12",
      scope: "global",
      tags: ["historical"],
      prompt: "Which French leader became a powerful emperor after rising through the military?",
      correctAnswer: "Napoleon Bonaparte",
      wrongAnswers: ["George Washington", "Christopher Columbus", "Sasquatch"],
    },
    {
      id: "global-history-13",
      scope: "global",
      tags: ["historical"],
      prompt: "Which explorer is most associated with a westward Atlantic voyage in 1492?",
      correctAnswer: "Christopher Columbus",
      wrongAnswers: ["Thomas Edison", "Billy the Kid", "Queen of Hearts"],
    },
    {
      id: "global-history-15",
      scope: "global",
      tags: ["historical"],
      prompt: "In what year did Christopher Columbus first cross the Atlantic?",
      correctAnswer: "1492",
      wrongAnswers: ["1451", "1504", "1519"],
    },
    {
      id: "global-history-16",
      scope: "global",
      tags: ["historical"],
      prompt: "What holiday is observed in the United States in Columbus's honor on the second Monday in October?",
      correctAnswer: "Columbus Day",
      wrongAnswers: ["Founders Day", "Discovery Day", "Explorers Day"],
    },
    {
      id: "global-history-17",
      scope: "global",
      tags: ["historical"],
      prompt: "Which city was Christopher Columbus born in?",
      correctAnswer: "Genoa",
      wrongAnswers: ["Rome", "Madrid", "Marseille"],
    },
    {
      id: "global-egypt-7",
      scope: "global",
      tags: ["historical"],
      customerIds: ["king-tut", "cleopatra"],
      prompt: "Which ancient Egyptian tomb was discovered in 1922 by Howard Carter?",
      correctAnswer: "Tutankhamun's tomb",
      wrongAnswers: ["The Great Pyramid", "The Temple of Karnak", "The Sphinx Chamber"],
    },
    {
      id: "global-egypt-8",
      scope: "global",
      tags: ["historical"],
      customerIds: ["king-tut", "cleopatra"],
      prompt: "Which ruler was known as the boy king of ancient Egypt?",
      correctAnswer: "King Tutankhamun",
      wrongAnswers: ["Cleopatra", "Ramses the Great", "Akhenaten"],
    },
    {
      id: "global-egypt-9",
      scope: "global",
      tags: ["historical"],
      customerIds: ["king-tut", "cleopatra"],
      prompt: "What famous gold funerary mask is associated with which ruler?",
      correctAnswer: "King Tutankhamun",
      wrongAnswers: ["Cleopatra", "Amenhotep III", "Hatshepsut"],
    },
    {
      id: "global-egypt-10",
      scope: "global",
      tags: ["historical"],
      customerIds: ["king-tut", "cleopatra"],
      prompt: "Which river gave Egypt fertile land and transportation?",
      correctAnswer: "The Nile River",
      wrongAnswers: ["The Tiber", "The Euphrates", "The Danube"],
    },
    {
      id: "global-history-14",
      scope: "global",
      tags: ["historical"],
      prompt: "Which feared pirate is remembered for his dramatic black beard?",
      correctAnswer: "Blackbeard the Pirate",
      wrongAnswers: ["Big Bad Wolf", "Humpty Dumpty", "Alice in Wonderland"],
    },
    {
      id: "global-cryptid-1",
      scope: "global",
      tags: ["cryptid"],
      prompt: "What is Sasquatch also commonly called?",
      correctAnswer: "Bigfoot",
      wrongAnswers: ["Sea Serpent", "Kraken", "Thunderbird"],
    },
    {
      id: "global-cryptid-2",
      scope: "global",
      tags: ["cryptid"],
      prompt: "Which clue is most associated with Sasquatch sightings?",
      correctAnswer: "Huge footprints in the woods",
      wrongAnswers: ["A tiny crown in a tea cup", "A light bulb in a workshop", "A red hood in a basket"],
    },
    {
      id: "trivia-ukraine-sea",
      scope: "global",
      tags: ["geography"],
      prompt: "What is the name of the sea directly to the south of Ukraine?",
      correctAnswer: "Black Sea",
      wrongAnswers: ["Baltic Sea", "Red Sea", "Caspian Sea"],
    },
    {
      id: "trivia-triple-crown",
      scope: "global",
      tags: ["sports"],
      prompt: "The Triple Crown award is given to a horse that wins which three races?",
      correctAnswer: "Kentucky Derby, Preakness Stakes, and Belmont Stakes",
      wrongAnswers: [
        "Kentucky Derby, Belmont Stakes, and Breeders' Cup",
        "Preakness Stakes, Kentucky Oaks, and Belmont Stakes",
        "Belmont Stakes, Derby City, and Preakness Stakes",
      ],
    },
    {
      id: "trivia-state-letter",
      scope: "global",
      tags: ["language"],
      prompt: "What is the only letter that does not appear in any U.S. state name?",
      correctAnswer: "Q",
      wrongAnswers: ["X", "Z", "J"],
    },
    {
      id: "trivia-oldest-college",
      scope: "global",
      tags: ["history"],
      prompt: "What is the oldest college in the U.S.?",
      correctAnswer: "Harvard",
      wrongAnswers: ["Yale", "Princeton", "Columbia"],
    },
    {
      id: "trivia-interracial-kiss",
      scope: "global",
      tags: ["tv"],
      prompt: "Which TV show featured the first interracial kiss ever aired?",
      correctAnswer: "Star Trek",
      wrongAnswers: ["I Love Lucy", "The Jeffersons", "All in the Family"],
    },
    {
      id: "trivia-pythagorean",
      scope: "global",
      tags: ["math"],
      prompt: "What is the Pythagorean Theorem?",
      correctAnswer: "a^2 + b^2 = c^2",
      wrongAnswers: ["a + b = c", "a^2 - b^2 = c^2", "2a + 2b = c"],
    },
    {
      id: "trivia-glee-school",
      scope: "global",
      tags: ["tv"],
      prompt: "What president is the fictional high school in Glee named after?",
      correctAnswer: "William H. McKinley",
      wrongAnswers: ["Abraham Lincoln", "Theodore Roosevelt", "John F. Kennedy"],
    },
    {
      id: "trivia-largest-island",
      scope: "global",
      tags: ["geography"],
      prompt: "What is the largest island in the world?",
      correctAnswer: "Greenland",
      wrongAnswers: ["Australia", "Madagascar", "Borneo"],
    },
    {
      id: "trivia-pt-symbol",
      scope: "global",
      tags: ["science"],
      prompt: "Which chemical element has the symbol \"Pt\" on the periodic table?",
      correctAnswer: "Platinum",
      wrongAnswers: ["Palladium", "Polonium", "Plutonium"],
    },
    {
      id: "trivia-hufflepuff-mascot",
      scope: "global",
      tags: ["books"],
      prompt: "Which animal is the mascot for Hufflepuff house in the Harry Potter books?",
      correctAnswer: "Badger",
      wrongAnswers: ["Lion", "Eagle", "Snake"],
    },
    {
      id: "trivia-nori",
      scope: "global",
      tags: ["food"],
      prompt: "Nori, the popular sushi ingredient, is a type of what?",
      correctAnswer: "Seaweed",
      wrongAnswers: ["Rice", "Fish", "Vinegar"],
    },
    {
      id: "trivia-gdp",
      scope: "global",
      tags: ["economics"],
      prompt: "What does \"GDP\" stand for?",
      correctAnswer: "Gross Domestic Product",
      wrongAnswers: ["General Domestic Profit", "Global Demand Product", "Gross Demand Product"],
    },
    {
      id: "trivia-switzerland-currency",
      scope: "global",
      tags: ["economics"],
      prompt: "What currency does Switzerland use?",
      correctAnswer: "Swiss Franc",
      wrongAnswers: ["Euro", "Dollar", "Krona"],
    },
    {
      id: "trivia-stairway-lyrics",
      scope: "global",
      tags: ["music"],
      prompt:
        "What song are these lyrics from: \"There are two paths you can go by, but in the long run, there's still time to change the road you're on.\"",
      correctAnswer: "Stairway to Heaven",
      wrongAnswers: ["Hotel California", "Free Bird", "Dream On"],
    },
    {
      id: "trivia-piano-man-lyrics",
      scope: "global",
      tags: ["music"],
      prompt: "What song are these lyrics from: \"Son, can you play me a memory?\"",
      correctAnswer: "Piano Man",
      wrongAnswers: ["Tiny Dancer", "Rocket Man", "Take It Easy"],
    },
    {
      id: "trivia-hotel-california-lyrics",
      scope: "global",
      tags: ["music"],
      prompt: "What song are these lyrics from: \"Such a lovely place, such a lovely face.\"",
      correctAnswer: "Hotel California",
      wrongAnswers: ["Desperado", "Take It Easy", "Life in the Fast Lane"],
    },
    {
      id: "trivia-hotline-bling-lyrics",
      scope: "global",
      tags: ["music"],
      prompt: "What song are these lyrics from: \"You used to call me on my cell phone.\"",
      correctAnswer: "Hotline Bling",
      wrongAnswers: ["Sorry", "One Dance", "Work"],
    },
    {
      id: "trivia-napoleon-emperor",
      scope: "global",
      tags: ["history"],
      prompt: "In what year was Napoleon Bonaparte proclaimed Emperor of France?",
      correctAnswer: "1804",
      wrongAnswers: ["1799", "1812", "1815"],
    },
    {
      id: "trivia-tina-fey-birth",
      scope: "global",
      tags: ["entertainment"],
      prompt: "Tina Fey was born in what year?",
      correctAnswer: "1970",
      wrongAnswers: ["1964", "1978", "1982"],
    },
    {
      id: "trivia-baby-yoda",
      scope: "global",
      tags: ["tv"],
      prompt: "What is Baby Yoda's real name?",
      correctAnswer: "Grogu",
      wrongAnswers: ["Yoda Jr.", "Groku", "Minchi"],
    },
    {
      id: "trivia-simple-life",
      scope: "global",
      tags: ["tv"],
      prompt:
        "Which reality TV show featured Paris Hilton and Nicole Richie trying out various odd jobs?",
      correctAnswer: "The Simple Life",
      wrongAnswers: ["The Hills", "Laguna Beach", "Rich Girls"],
    },
    {
      id: "trivia-monopoly-after-go",
      scope: "global",
      tags: ["games"],
      prompt: "What is the property directly after GO on the Monopoly board?",
      correctAnswer: "Mediterranean Avenue",
      wrongAnswers: ["Baltic Avenue", "Boardwalk", "Park Place"],
    },
    {
      id: "trivia-swift-first-grammy",
      scope: "global",
      tags: ["music"],
      prompt: "Taylor Swift won her first Grammy for what song?",
      correctAnswer: "White Horse",
      wrongAnswers: ["Love Story", "Shake It Off", "Fearless"],
    },
    {
      id: "trivia-rock-football",
      scope: "global",
      tags: ["sports"],
      prompt: "Where did Dwayne Johnson, aka The Rock, play football?",
      correctAnswer: "University of Miami",
      wrongAnswers: ["Ohio State University", "Florida State University", "University of Texas"],
    },
    {
      id: "trivia-first-disney-princess",
      scope: "global",
      tags: ["movies"],
      prompt: "Who was the first Disney Princess?",
      correctAnswer: "Snow White",
      wrongAnswers: ["Cinderella", "Belle", "Aurora"],
    },
    {
      id: "trivia-fruit-loops-flavors",
      scope: "global",
      tags: ["food"],
      prompt: "How many flavors are in a box of Fruit Loops?",
      correctAnswer: "1",
      wrongAnswers: ["3", "4", "2"],
    },
    {
      id: "trivia-moses-commandments",
      scope: "global",
      tags: ["religion"],
      prompt: "Where did God give Moses the Ten Commandments?",
      correctAnswer: "Mt. Sinai",
      wrongAnswers: ["Mount Carmel", "Mount Ararat", "Mount Zion"],
    },
    {
      id: "trivia-marathon-distance",
      scope: "global",
      tags: ["sports"],
      prompt: "How long is a marathon?",
      correctAnswer: "26.2 miles",
      wrongAnswers: ["13.1 miles", "20 miles", "30 miles"],
    },
    {
      id: "trivia-worlds-best-boss",
      scope: "global",
      tags: ["tv"],
      prompt: "On The Office, who gave Michael the \"World's Best Boss\" mug?",
      correctAnswer: "He bought it himself",
      wrongAnswers: ["Dwight", "Jim", "Pam"],
    },
    {
      id: "trivia-lunar-larry",
      scope: "global",
      tags: ["movies"],
      prompt: "What animated character was originally going to be called Lunar Larry?",
      correctAnswer: "Buzz Lightyear",
      wrongAnswers: ["Astro Boy", "Space Ranger Sam", "Rocket Ron"],
    },
    {
      id: "trivia-home-alone-paris",
      scope: "global",
      tags: ["movies"],
      prompt: "In Home Alone, where are the McCallisters going when they leave Kevin behind?",
      correctAnswer: "Paris, France",
      wrongAnswers: ["London, England", "Rome, Italy", "Madrid, Spain"],
    },
    {
      id: "trivia-iran-border",
      scope: "global",
      tags: ["geography"],
      prompt: "Which of these countries does not share a border with Iran?",
      correctAnswer: "Yemen",
      wrongAnswers: ["Iraq", "Turkey", "Afghanistan"],
    },
    {
      id: "trivia-fenway",
      scope: "global",
      tags: ["sports"],
      prompt: "Baseball's oldest stadium opened in 1912. What is its name?",
      correctAnswer: "Fenway Park",
      wrongAnswers: ["Wrigley Field", "Yankee Stadium", "Polo Grounds"],
    },
    {
      id: "trivia-prince-lyrics",
      scope: "global",
      tags: ["music"],
      prompt:
        "Which artist has a song with these lyrics: Dream if you can a courtyard, An ocean of violets in bloom",
      correctAnswer: "Prince",
      wrongAnswers: ["Michael Jackson", "Stevie Wonder", "Lionel Richie"],
    },
    {
      id: "trivia-first-vice-president",
      scope: "global",
      tags: ["history"],
      prompt: "Who was America's first Vice President?",
      correctAnswer: "John Adams",
      wrongAnswers: ["Thomas Jefferson", "Aaron Burr", "James Madison"],
    },
    {
      id: "trivia-american-idol-judges",
      scope: "global",
      tags: ["tv"],
      prompt: "Who were the three original American Idol judges?",
      correctAnswer: "Simon Cowell, Randy Jackson, Paula Abdul",
      wrongAnswers: [
        "Simon Cowell, Mariah Carey, Ryan Seacrest",
        "Paula Abdul, Lionel Richie, Katy Perry",
        "Simon Cowell, Randy Jackson, Katy Perry",
      ],
    },
    {
      id: "trivia-monica-towels",
      scope: "global",
      tags: ["tv"],
      prompt: "In one episode of Friends, we learn that Monica has eleven sets of what?",
      correctAnswer: "Towels",
      wrongAnswers: ["Sheets", "Plates", "Mugs"],
    },
    {
      id: "trivia-pocahontas-tattoo",
      scope: "global",
      tags: ["movies"],
      prompt: "Who was the first Disney princess to have a tattoo?",
      correctAnswer: "Pocahontas",
      wrongAnswers: ["Ariel", "Belle", "Mulan"],
    },
    {
      id: "trivia-american-eagle-2025",
      scope: "global",
      tags: ["pop-culture"],
      prompt:
        "Which \"American\" clothing brand faced backlash for a denim campaign starring actress Sydney Sweeney in 2025?",
      correctAnswer: "American Eagle",
      wrongAnswers: ["American Outfitters", "American Threads", "Eagle Denim"],
    },
    {
      id: "trivia-scoops-ahoy",
      scope: "global",
      tags: ["tv"],
      prompt: "What's the name of the ice cream shop that Steve and Robin work at in Stranger Things?",
      correctAnswer: "Scoops Ahoy",
      wrongAnswers: ["Dairy Dream", "The Sweet Spot", "Sugar Shack"],
    },
    {
      id: "trivia-scrappy-doo",
      scope: "global",
      tags: ["tv"],
      prompt: "What is Scrappy-Doo's relationship to Scooby-Doo?",
      correctAnswer: "Nephew",
      wrongAnswers: ["Brother", "Cousin", "Son"],
    },
    {
      id: "trivia-hologram-2014",
      scope: "global",
      tags: ["music"],
      prompt: "Which musician appeared as a hologram at the 2014 Billboard Music Awards?",
      correctAnswer: "Michael Jackson",
      wrongAnswers: ["Elvis Presley", "Tupac Shakur", "Prince"],
    },
    {
      id: "trivia-scientologists",
      scope: "global",
      tags: ["pop-culture"],
      prompt: "What do Tom Cruise, John Travolta, and Elisabeth Moss have in common?",
      correctAnswer: "They are all Scientologists",
      wrongAnswers: ["They all won Oscars", "They all hosted SNL", "They all starred in Star Wars"],
    },
    {
      id: "trivia-three-strikes",
      scope: "global",
      tags: ["sports"],
      prompt: "What is the term for getting three strikes in a row?",
      correctAnswer: "Turkey",
      wrongAnswers: ["Hat trick", "Triple play", "Perfect game"],
    },
    {
      id: "trivia-basketball-rim",
      scope: "global",
      tags: ["sports"],
      prompt:
        "A basketball is approximately 9.5 inches in diameter. How many inches in diameter is a basketball rim?",
      correctAnswer: "18",
      wrongAnswers: ["12", "16", "20"],
    },
    {
      id: "trivia-van-gogh-ear",
      scope: "global",
      tags: ["art"],
      prompt: "Which artist cut off his left ear?",
      correctAnswer: "Vincent van Gogh",
      wrongAnswers: ["Pablo Picasso", "Claude Monet", "Salvador Dalí"],
    },
    {
      id: "trivia-only-flying-mammal",
      scope: "global",
      tags: ["science"],
      prompt: "What is the only mammal that can fly?",
      correctAnswer: "Bat",
      wrongAnswers: ["Flying squirrel", "Sugar glider", "Koala"],
    },
    {
      id: "trivia-castle-rock",
      scope: "global",
      tags: ["books"],
      prompt:
        "The fictional city of Castle Rock, which appears in various Stephen King books, is located in which state?",
      correctAnswer: "Maine",
      wrongAnswers: ["Vermont", "Massachusetts", "New Hampshire"],
    },
    {
      id: "trivia-karate-belt",
      scope: "global",
      tags: ["sports"],
      prompt: "What color is the first belt that a karate student receives?",
      correctAnswer: "White",
      wrongAnswers: ["Yellow", "Blue", "Black"],
    },
    {
      id: "trivia-fortnight",
      scope: "global",
      tags: ["language"],
      prompt: "How long is a fortnight?",
      correctAnswer: "2 weeks",
      wrongAnswers: ["7 days", "10 days", "1 month"],
    },
    {
      id: "trivia-piano-keys",
      scope: "global",
      tags: ["music"],
      prompt: "How many keys does a piano have?",
      correctAnswer: "88",
      wrongAnswers: ["76", "61", "100"],
    },
    {
      id: "trivia-first-moon-walker",
      scope: "global",
      tags: ["history"],
      prompt: "Who was the first person to walk on the moon?",
      correctAnswer: "Neil Armstrong",
      wrongAnswers: ["Buzz Aldrin", "Michael Collins", "Yuri Gagarin"],
    },
    {
      id: "trivia-achilles",
      scope: "global",
      tags: ["mythology"],
      prompt:
        "According to Greek mythology, what famed warrior died because he took an arrow to the heel?",
      correctAnswer: "Achilles",
      wrongAnswers: ["Hector", "Odysseus", "Perseus"],
    },
    {
      id: "trivia-call-me-ishmael",
      scope: "global",
      tags: ["books"],
      prompt: "Which novel begins with the line, \"Call me Ishmael\"?",
      correctAnswer: "Moby Dick",
      wrongAnswers: ["The Old Man and the Sea", "Treasure Island", "The Great Gatsby"],
    },
    {
      id: "trivia-to-be-or-not-to-be",
      scope: "global",
      tags: ["books"],
      prompt: "\"To be or not to be\" comes from which Shakespeare play?",
      correctAnswer: "Hamlet",
      wrongAnswers: ["Macbeth", "Othello", "King Lear"],
    },
    {
      id: "trivia-elizabeth-taylor-marriages",
      scope: "global",
      tags: ["entertainment"],
      prompt: "How many times was Elizabeth Taylor married?",
      correctAnswer: "8",
      wrongAnswers: ["5", "6", "7"],
    },
    {
      id: "trivia-disney-logo-i",
      scope: "global",
      tags: ["movies"],
      prompt: "Which lowercase letter appears in the word \"Disney\" in the Walt Disney logo?",
      correctAnswer: "i",
      wrongAnswers: ["d", "e", "y"],
    },
    {
      id: "trivia-brazil-flag-colors",
      scope: "global",
      tags: ["geography"],
      prompt: "What four colors make up the flag of Brazil?",
      correctAnswer: "Green, yellow, blue, white",
      wrongAnswers: ["Green, blue, white, red", "Yellow, red, black, green", "Green, yellow, blue, black"],
    },
    {
      id: "trivia-titanic-sank",
      scope: "global",
      tags: ["history"],
      prompt: "In what year did the Titanic sink?",
      correctAnswer: "1912",
      wrongAnswers: ["1908", "1915", "1918"],
    },
    {
      id: "trivia-ikea-origin",
      scope: "global",
      tags: ["business"],
      prompt: "Which country did Ikea originate in?",
      correctAnswer: "Sweden",
      wrongAnswers: ["Norway", "Denmark", "Finland"],
    },
    {
      id: "trivia-finland-capital",
      scope: "global",
      tags: ["geography"],
      prompt: "What is the capital of Finland?",
      correctAnswer: "Helsinki",
      wrongAnswers: ["Oslo", "Stockholm", "Copenhagen"],
    },
    {
      id: "trivia-one-row-state",
      scope: "global",
      tags: ["language"],
      prompt:
        "What is the only state that can be typed using only one row of letters on a standard keyboard?",
      correctAnswer: "Alaska",
      wrongAnswers: ["Maine", "Texas", "Hawaii"],
    },
    {
      id: "trivia-hallux",
      scope: "global",
      tags: ["science"],
      prompt: "On what part of the body is the hallux located?",
      correctAnswer: "Big toe",
      wrongAnswers: ["Wrist", "Elbow", "Heel"],
    },
    {
      id: "trivia-alamo-besieged",
      scope: "global",
      tags: ["history"],
      prompt: "In what year was the Alamo besieged by the Mexican Army?",
      correctAnswer: "1836",
      wrongAnswers: ["1821", "1845", "1861"],
    },
    {
      id: "trivia-polio-vaccine",
      scope: "global",
      tags: ["science"],
      prompt: "Who developed the polio vaccine in 1954?",
      correctAnswer: "Jonas Salk",
      wrongAnswers: ["Louis Pasteur", "Robert Koch", "Alexander Fleming"],
    },
    {
      id: "trivia-guantanamo-base",
      scope: "global",
      tags: ["history"],
      prompt:
        "In 1903 the U.S. and Cuba signed an agreement releasing this Cuban for which U.S. naval base?",
      correctAnswer: "Guantanamo Bay",
      wrongAnswers: ["Santiago", "Havana", "Key West"],
    },
    {
      id: "trivia-fascist-party",
      scope: "global",
      tags: ["history"],
      prompt: "In 1919, the Fascist Party was formed by which Italian leader?",
      correctAnswer: "Benito Mussolini",
      wrongAnswers: ["Victor Emmanuel III", "Giuseppe Garibaldi", "Julius Caesar"],
    },
    {
      id: "trivia-pinocchio-release",
      scope: "global",
      tags: ["movies"],
      prompt: "In what year was Pinocchio released?",
      correctAnswer: "1940",
      wrongAnswers: ["1937", "1945", "1950"],
    },
    {
      id: "trivia-dow-4000",
      scope: "global",
      tags: ["business"],
      prompt:
        "In what year did the Dow Jones Industrial Average close above 4,000 for the first time?",
      correctAnswer: "1995",
      wrongAnswers: ["1987", "1991", "2001"],
    },
    {
      id: "trivia-slim-shady-lp",
      scope: "global",
      tags: ["music"],
      prompt: "What hip hop artist released The Slim Shady LP?",
      correctAnswer: "Eminem",
      wrongAnswers: ["Dr. Dre", "Jay-Z", "Snoop Dogg"],
    },
    {
      id: "trivia-victor-fleming",
      scope: "global",
      tags: ["movies"],
      prompt: "Name one of Victor Fleming's films.",
      correctAnswer: "The Wizard of Oz",
      wrongAnswers: ["Casablanca", "Psycho", "The Godfather"],
    },
    {
      id: "trivia-darth-vader-mufasa",
      scope: "global",
      tags: ["movies"],
      prompt: "Which actor voiced Darth Vader and Mufasa?",
      correctAnswer: "James Earl Jones",
      wrongAnswers: ["Morgan Freeman", "Samuel L. Jackson", "Denzel Washington"],
    },
    {
      id: "trivia-star-wars-day",
      scope: "global",
      tags: ["pop-culture"],
      prompt: "What date is Star Wars Day?",
      correctAnswer: "May 4",
      wrongAnswers: ["May 1", "June 4", "July 4"],
    },
    {
      id: "trivia-kramer-first-name",
      scope: "global",
      tags: ["tv"],
      prompt: "What is Kramer's first name in Seinfeld?",
      correctAnswer: "Cosmo",
      wrongAnswers: ["Morty", "Larry", "Frank"],
    },
    {
      id: "trivia-oldest-kardashian",
      scope: "global",
      tags: ["pop-culture"],
      prompt: "Who is the oldest Kardashian sister?",
      correctAnswer: "Kourtney",
      wrongAnswers: ["Kim", "Khloé", "Kendall"],
    },
    {
      id: "trivia-magnolia-brand",
      scope: "global",
      tags: ["business"],
      prompt: "What is the name of Chip and Joanna Gaines' lifestyle brand?",
      correctAnswer: "Magnolia",
      wrongAnswers: ["Hearth & Hand", "Shiplap", "Barnwood"],
    },
    {
      id: "trivia-gimli",
      scope: "global",
      tags: ["movies"],
      prompt:
        "What's the name of the dwarf that accompanies Frodo on his quest in The Lord of the Rings films?",
      correctAnswer: "Gimli",
      wrongAnswers: ["Pippin", "Sam", "Boromir"],
    },
    {
      id: "trivia-rock-first-lead",
      scope: "global",
      tags: ["movies"],
      prompt: "What was Dwayne \"The Rock\" Johnson's first movie in a lead role?",
      correctAnswer: "The Scorpion King",
      wrongAnswers: ["Walking Tall", "Fast Five", "Jumanji"],
    },
    {
      id: "trivia-miracle-on-ice",
      scope: "global",
      tags: ["sports"],
      prompt: "What was the film Miracle on Ice about?",
      correctAnswer: "The 1980 hockey game between the U.S. and USSR",
      wrongAnswers: [
        "A baseball championship in 1976",
        "A basketball final in 1992",
        "A soccer upset in 2004",
      ],
    },
    {
      id: "trivia-first-survivor-winner",
      scope: "global",
      tags: ["tv"],
      prompt: "Who was the first person to win on Survivor?",
      correctAnswer: "Richard Hatch",
      wrongAnswers: ["Rudy Boesch", "Kelly Wiglesworth", "Colby Donaldson"],
    },
    {
      id: "trivia-empire-strikes-back",
      scope: "global",
      tags: ["movies"],
      prompt: "In Star Wars Episode V, what does Darth Vader reveal to Luke Skywalker?",
      correctAnswer: "That he is Luke's father",
      wrongAnswers: ["That Leia is his sister", "That the Death Star is rebuilt", "That the Emperor is alive"],
    },
    {
      id: "trivia-delorean-speed",
      scope: "global",
      tags: ["movies"],
      prompt:
        "In Back to the Future, what speed does the DeLorean need to reach to travel through time?",
      correctAnswer: "88 miles per hour",
      wrongAnswers: ["70 miles per hour", "77 miles per hour", "100 miles per hour"],
    },
    {
      id: "trivia-adele-scars",
      scope: "global",
      tags: ["music"],
      prompt: "Which artist has these lyrics: \"The scars of your love remind me of us\"?",
      correctAnswer: "Adele",
      wrongAnswers: ["Beyonce", "Rihanna", "Taylor Swift"],
    },
    {
      id: "trivia-celine-dion-lyrics",
      scope: "global",
      tags: ["music"],
      prompt: "Which artist has these lyrics: \"You have come to show you go on\"?",
      correctAnswer: "Celine Dion",
      wrongAnswers: ["Whitney Houston", "Mariah Carey", "Adele"],
    },
    {
      id: "trivia-nirvana-lyrics",
      scope: "global",
      tags: ["music"],
      prompt: "Which artist has these lyrics: \"Hello, hello, hello, how low\"?",
      correctAnswer: "Nirvana",
      wrongAnswers: ["Pearl Jam", "Soundgarden", "Green Day"],
    },
    {
      id: "trivia-michael-jackson-floor",
      scope: "global",
      tags: ["music"],
      prompt: "Which artist has these lyrics: \"I am the one who will dance on the floor\"?",
      correctAnswer: "Michael Jackson",
      wrongAnswers: ["Usher", "Prince", "Bruno Mars"],
    },
    {
      id: "trivia-eureka",
      scope: "global",
      tags: ["history"],
      prompt: "What Greek word, meaning \"I have found it,\" was supposedly shouted by Archimedes?",
      correctAnswer: "Eureka",
      wrongAnswers: ["Logos", "Agora", "Mythos"],
    },
    {
      id: "trivia-123",
      scope: "global",
      tags: ["math"],
      prompt:
        "What set of three positive integers gives the same result whether you add them all or multiply them all together?",
      correctAnswer: "1, 2, and 3",
      wrongAnswers: ["1, 3, and 5", "2, 2, and 2", "2, 3, and 4"],
    },
  ];

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

    const generated = [];

    featuredCustomers.forEach((customer) => {
      if (Array.isArray(customer.customQuestions) && customer.customQuestions.length) {
        customer.customQuestions.forEach((question) => {
          generated.push({
            id: `customer-${customer.id}-${question.id}`,
            scope: "customer",
            customerIds: [customer.id],
            tags: [customer.focusTag || customer.group || "customer"],
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
        tags: [customer.focusTag || customer.group || "customer"],
        difficulty: "hard",
        prompt: `Which place or story is ${customer.name} most associated with?`,
        correctAnswer: customer.questionPlace,
        wrongAnswers: uniqueWrongAnswers(placePool, customer.questionPlace, 3),
      });

      generated.push({
        id: `customer-${customer.id}-fact`,
        scope: "customer",
        customerIds: [customer.id],
        tags: [customer.focusTag || customer.group || "customer"],
        difficulty: "hard",
        prompt: `What is ${customer.name} best known for?`,
        correctAnswer: customer.questionFact,
        wrongAnswers: uniqueWrongAnswers(factPool, customer.questionFact, 3),
      });

      if (customer.group === "historical") {
        generated.push({
          id: `customer-${customer.id}-clue`,
          scope: "customer",
          customerIds: [customer.id],
          tags: [customer.focusTag || customer.group || "customer"],
          difficulty: "hard",
          prompt: `Which clue best matches ${customer.name}?`,
          correctAnswer: customer.questionFact,
          wrongAnswers: uniqueWrongAnswers(factPool, customer.questionFact, 3),
        });
      }
    });

    return generated;
  }

  questions.push(...buildCustomerQuestions());

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
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
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

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  async function syncProfilesToServer(profiles) {
    if (!USE_REMOTE_SYNC) {
      return;
    }

    const realProfiles = normalizeProfiles(profiles).filter((profile) => !isDemoProfile(profile));
    if (!realProfiles.length) {
      return;
    }

    await Promise.all(
      realProfiles.map((profile) =>
        requestJson(`/profiles/${encodeURIComponent(profile.id)}`, {
          method: "PUT",
          body: JSON.stringify(profile),
        }).catch(() => null)
      )
    );
  }

  async function syncSessionToServer(session) {
    if (!USE_REMOTE_SYNC || !session || !session.completed) {
      return;
    }

    await requestJson("/sessions", {
      method: "POST",
      body: JSON.stringify(session),
    }).catch(() => null);
  }

  async function refreshProfilesFromServer() {
    if (!USE_REMOTE_SYNC) {
      readyResolve();
      return;
    }

    try {
      const remoteProfiles = await requestJson("/profiles", { method: "GET" });
      if (Array.isArray(remoteProfiles) && remoteProfiles.length) {
        setProfilesCache(remoteProfiles, "remote");
        writeJson(STORAGE_KEYS.profiles, profilesCacheState.profiles);
      } else {
        setProfilesCache(getLocalProfileSeed(), "local");
        if (!readJson(STORAGE_KEYS.profiles, []).length && profilesCacheState.profiles.length) {
          writeJson(STORAGE_KEYS.profiles, profilesCacheState.profiles);
        }

        await syncProfilesToServer(profilesCacheState.profiles);
      }
    } catch {
      setProfilesCache(getLocalProfileSeed(), "local");
    } finally {
      readyResolve();
    }
  }

  void refreshProfilesFromServer();

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

  function getProfiles() {
    return getProfilesCache();
  }

  function saveProfiles(profiles) {
    const normalized = normalizeProfiles(profiles);
    setProfilesCache(normalized, profilesCacheState.source);
    writeJson(STORAGE_KEYS.profiles, normalized);
    void syncProfilesToServer(normalized);
  }

  function getActiveProfileId() {
    return window.localStorage.getItem(STORAGE_KEYS.activeProfileId) || "";
  }

  function setActiveProfileId(profileId) {
    window.localStorage.setItem(STORAGE_KEYS.activeProfileId, profileId);
  }

  function clearActiveProfileId() {
    window.localStorage.removeItem(STORAGE_KEYS.activeProfileId);
  }

  function getActiveProfile() {
    const profileId = getActiveProfileId();
    if (!profileId) {
      return null;
    }

    return getProfiles().find((profile) => profile.id === profileId) || null;
  }

  function buildEmptyStats() {
    return {
      gamesPlayed: 0,
      totalCorrectAnswers: 0,
      regularCustomers: 0,
      occasionalCustomers: 0,
      lostCustomers: 0,
      totalCustomerValue: 0,
      estimatedSales: 0,
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
    safeProfile.isGuest = Boolean(safeProfile.isGuest);
    safeProfile.customerCollection = safeProfile.customerCollection.map((entry) =>
      entry && entry.rarity === "Legendary"
        ? {
            ...entry,
            rarity: "Rare",
          }
        : entry
    );
    return rebuildCollectionDerivedStats(safeProfile);
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

      if (entry.status === "regular") {
        stats.regularCustomers += 1;
      } else if (entry.status === "occasional") {
        stats.occasionalCustomers += 1;
      } else if (entry.status === "lost") {
        stats.lostCustomers += 1;
      }

      stats.totalCustomerValue += valueForStatus;
      stats.estimatedSales = stats.totalCustomerValue;
    };

    safeProfile.customerCollection.forEach((entry) => {
      const customer = getCustomerById(entry.customerId);
      if (!customer) {
        return;
      }

      applyCollectionStats(safeProfile.stats, entry, customer);

      const restaurantStats = safeProfile.restaurantStats[entry.restaurantSlug];
      if (restaurantStats) {
        applyCollectionStats(restaurantStats, entry, customer);
      }
    });

    safeProfile.stats.estimatedSales = safeProfile.stats.totalCustomerValue;
    Object.values(safeProfile.restaurantStats).forEach((stats) => {
      stats.estimatedSales = stats.totalCustomerValue;
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
    saveProfiles(profiles);
    setActiveProfileId(profile.id);
    return ensureProfileShape(profile);
  }

  function createGuestProfile() {
    const profile = {
      id: makeId("guest"),
      playerName: "Guest Player",
      restaurantName: "Guest Restaurant",
      restaurantSlug: "guest-restaurant",
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
    saveProfiles(profiles);
    setActiveProfileId(profile.id);
    return ensureProfileShape(profile);
  }

  function updateProfile(updatedProfile) {
    const profiles = getProfiles().map((profile) =>
      profile.id === updatedProfile.id ? ensureProfileShape(updatedProfile) : profile
    );
    saveProfiles(profiles);
    return profiles.find((profile) => profile.id === updatedProfile.id) || null;
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
    if (!profile || !customerId || !restaurantSlug) {
      return null;
    }

    return ensureProfileShape(profile).customerCollection.find(
      (entry) =>
        entry.customerId === customerId &&
        entry.restaurantSlug === restaurantSlug
    ) || null;
  }

  function getOwnedCustomerIdsForRestaurant(profile, restaurantSlug) {
    if (!profile || !restaurantSlug) {
      return new Set();
    }

    const safeProfile = ensureProfileShape(profile);
    return new Set(
      safeProfile.customerCollection
        .filter((entry) => entry.restaurantSlug === restaurantSlug && entry.customerId)
        .map((entry) => entry.customerId)
    );
  }

  function getCollectionValueForStatus(customer, status) {
    if (!customer) {
      return 0;
    }

    if (status === "regular") {
      return Number(customer.regularValue) || 0;
    }

    if (status === "occasional") {
      return Number(customer.occasionalValue) || 0;
    }

    return 0;
  }

  function applyCollectionDelta(stats, previousStatus, nextStatus, previousCustomer, nextCustomer) {
    const previousValue = getCollectionValueForStatus(previousCustomer, previousStatus);
    const nextValue = getCollectionValueForStatus(nextCustomer, nextStatus);

    if (previousStatus === "regular") {
      stats.regularCustomers = Math.max(0, stats.regularCustomers - 1);
    } else if (previousStatus === "occasional") {
      stats.occasionalCustomers = Math.max(0, stats.occasionalCustomers - 1);
    } else if (previousStatus === "lost") {
      stats.lostCustomers = Math.max(0, stats.lostCustomers - 1);
    }

    if (nextStatus === "regular") {
      stats.regularCustomers += 1;
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

    if (customer.group === "historical") {
      return `${customer.name} is one of the famous historical figures in the game, and people usually recognize their place in history right away.`;
    }

    if (customer.group === "storybook") {
      return `${customer.name} is a storybook character with a memorable tale and a strong personality.`;
    }

    if (customer.group === "communityverse") {
      return `${customer.name} is one of the Pepperville regulars with plenty of local personality.`;
    }

    if (customer.group === "exclusive") {
      return `${customer.name} is a special restaurant regular who only shows up in certain games.`;
    }

    return `${customer.name} is a recurring CommunityVerse customer.`;
  }

  function getCustomersForRestaurant(slug) {
    const restaurant = getRestaurantBySlug(slug);
    if (!restaurant) {
      return [];
    }

    return customers.slice();
  }

  function isRestaurantNameBlocked(name) {
    const normalized = normalizeText(name);
    if (!normalized) {
      return false;
    }

    return BLOCKED_RESTAURANT_NAMES.some((blocked) => {
      const blockedNormalized = normalizeText(blocked);
      return normalized === blockedNormalized || normalized.includes(blockedNormalized);
    });
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

  function getQuestionPoolForSession(restaurant, customer) {
    const restaurantQuestions = questions.filter(
      (question) => question.scope === "restaurant" && question.restaurantSlug === restaurant.slug
    );
    const globalQuestions = questions.filter((question) => question.scope === "global");
    const areaQuestions = questions.filter(
      (question) => question.scope === "area" && question.areaSlug === restaurant.areaSlug
    );
    const customerQuestions = questions.filter((question) => {
      const targetedCustomerIds = Array.isArray(question.customerIds) ? question.customerIds : [];
      const isCustomerScoped = question.scope === "customer";
      const isTargetedGlobal = question.scope === "global" && targetedCustomerIds.includes(customer.id);

      return (isCustomerScoped || isTargetedGlobal) && targetedCustomerIds.includes(customer.id);
    });
    const focusedQuestions = questions.filter(
      (question) =>
        question.tags.includes(customer.focusTag) &&
        !(question.customerIds || []).includes(customer.id)
    );

    return {
      restaurantQuestions,
      globalQuestions,
      areaQuestions,
      customerQuestions,
      focusedQuestions,
    };
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
    const restaurantSlots = [0, 3, 5, 8];

    const restaurantQuestions = shuffle(pools.restaurantQuestions);
    const restaurantImageQuestions = pools.restaurantQuestions.filter(
      (question) => question.image || question.imagePrompt
    );
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
          (!restaurantImageQuestion || question.id !== restaurantImageQuestion.id)
      ),
      4 - restaurantSelection.length
    ).forEach((question) => {
      restaurantSelection.push(question);
    });

    restaurantSelection.slice(0, restaurantSlots.length).forEach((question, index) => {
      usedIds.add(question.id);
      chosen[restaurantSlots[index]] = question;
    });

    const challengingCustomer = customer.group === "historical" || customer.group === "storybook";
    const customerQuestionCount = challengingCustomer ? 3 : 1;
    const focusQuestionCount = challengingCustomer ? 0 : 1;
    const globalQuestionCount = challengingCustomer ? 2 : 3;
    const areaQuestionCount = 1;

    const buckets = [
      { count: customerQuestionCount, pool: pools.customerQuestions },
      { count: focusQuestionCount, pool: pools.focusedQuestions },
      { count: globalQuestionCount, pool: pools.globalQuestions },
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
      const fallbackPool = questions.filter((question) => !usedIds.has(question.id));
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

  function pickCustomerForRestaurant(restaurant, profile) {
    const recentCustomerIds = (profile.recentSessions || [])
      .slice(0, 3)
      .map((session) => session.customerId);

    const allCustomers = getCustomersForRestaurant(restaurant.slug);
    const ownedCustomerIds = getOwnedCustomerIdsForRestaurant(profile, restaurant.slug);
    const preferred = allCustomers.filter(
      (customer) =>
        !recentCustomerIds.includes(customer.id) && !ownedCustomerIds.has(customer.id)
    );
    const photoReady = (preferred.length ? preferred : allCustomers).filter(
      (customer) => customer.image && !customer.image.includes("customer-placeholder")
    );

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
    const featuredGuests = getFeaturedGuestLineup(workingProfile, restaurant.slug, 4);
    const selectableFeaturedGuests = candidateCustomerIds.length
      ? featuredGuests.filter((customer) => candidateCustomerIds.includes(customer.id))
      : featuredGuests;
    const customer = preferredCustomer ||
      (selectableFeaturedGuests.length
        ? weightedCustomerPick(selectableFeaturedGuests)
        : featuredGuests.length
          ? weightedCustomerPick(featuredGuests)
        : pickCustomerForRestaurant(restaurant, profile));
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
      replayCustomerId: preferredCustomer ? preferredCustomer.id : "",
      previousCustomerStatus: existingCollectionEntry ? existingCollectionEntry.status : "",
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

    writeJson(STORAGE_KEYS.activeSession, session);
    return clone(session);
  }

  function getActiveSession() {
    return readJson(STORAGE_KEYS.activeSession, null);
  }

  function clearActiveSession() {
    window.localStorage.removeItem(STORAGE_KEYS.activeSession);
  }

  function completeSession(session) {
    const profiles = getProfiles().map((profile) => {
      if (profile.id !== session.profileId) {
        return profile;
      }

      const nextProfile = ensureProfileShape(profile);

      const overallStats = nextProfile.stats;
      overallStats.gamesPlayed += 1;
      overallStats.totalCorrectAnswers += session.score;
      overallStats.regularCustomers = 0;
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
      ].slice(0, 12);

      const existingCustomerIndex = nextProfile.customerCollection.findIndex(
        (entry) =>
          entry.customerId === session.customer.id &&
          entry.restaurantSlug === session.restaurantSlug
      );
      const existingCustomer =
        existingCustomerIndex >= 0 ? nextProfile.customerCollection[existingCustomerIndex] : null;

      if (existingCustomer) {
        if (session.result === "lost") {
          nextProfile.customerCollection.splice(existingCustomerIndex, 1);
        } else {
          const updatedEntry = {
            ...existingCustomer,
            customerName: session.customer.name,
            status: session.result,
            restaurantSlug: session.restaurantSlug,
            restaurantName: session.restaurantName,
            rarity: session.customer.rarity,
            regularValue: session.customer.regularValue,
            occasionalValue: session.customer.occasionalValue,
            image: session.customer.image,
            bio: getCustomerBio(session.customer),
            dateWon: nowIso(),
          };

          nextProfile.customerCollection.splice(existingCustomerIndex, 1);
          nextProfile.customerCollection.unshift(updatedEntry);
        }
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
            image: session.customer.image,
            bio: getCustomerBio(session.customer),
            dateWon: nowIso(),
          });
        }
      }

      return rebuildCollectionDerivedStats(nextProfile);
    });

    saveProfiles(profiles);
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
      session.result =
        session.score >= 8
          ? "regular"
          : session.score >= 5
            ? "occasional"
            : "lost";
      session.outcomeText =
        session.result === "regular"
          ? "regular customer"
          : session.result === "occasional"
            ? "occasional customer"
            : "lost customer";
      completeSession(session);
    } else {
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

  function getLeaderboard(metric, restaurantSlug) {
    const profiles = getProfiles().map((profile) => {
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
        value:
          metric === "rating"
            ? accuracy / 20
            : metric === "accuracy"
              ? accuracy
            : metric === "gamesPlayed"
              ? stats.gamesPlayed
              : metric === "regularCustomers"
                ? stats.regularCustomers
                : metric === "collected"
                  ? stats.regularCustomers + stats.occasionalCustomers
                  : stats.estimatedSales,
      };
    });

    return profiles
      .filter((entry) => !entry.profile.isGuest && (entry.stats.gamesPlayed > 0 || !restaurantSlug))
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
    updateProfile,
    getRestaurantBySlug,
    getCustomerById,
    getCustomerBio,
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
    getProfileSummary,
    getCurrentTimestamp: nowIso,
    whenReady: () => ready,
  };
})();
