// Grade 3 and Grade 4 Math and EVS Prep Cards - 180 cards total (9 per chapter across 20 chapters)

// Run with: node src/data/seedData.js

require('dotenv').config();

const mongoose = require('mongoose');

const Curriculum = require('../models/Curriculum');

const PrepCard = require('../models/PrepCard');

// =============================================================
// TEXT FORMATTING HELPERS
// Final polish pass – ensures all human-facing text is clean.
// =============================================================

/**
 * Converts a string to Title Case.
 * E.g., "hello world" → "Hello World"
 */
const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Converts snake_case or hyphenated tokens to human-friendly Title Case.
 * E.g., "prerequisite_gap" → "Prerequisite Gap"
 * E.g., "cant_visualize" → "Can't Visualize"
 * E.g., "worked_once_failed_later" → "Worked Once, Failed Later"
 */
const tokenToTitleCase = (token) => {
  if (!token) return '';
  // Handle common contractions
  const contractionMap = {
    'cant': "Can't",
    'dont': "Don't",
    'wont': "Won't",
    'isnt': "Isn't",
    'arent': "Aren't",
    'doesnt': "Doesn't"
  };

  return token
    .replace(/[_-]/g, ' ')  // Replace underscores/hyphens with spaces
    .split(' ')
    .map(word => {
      const lower = word.toLowerCase();
      if (contractionMap[lower]) return contractionMap[lower];
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

/**
 * Normalizes a situation string for display.
 * Ensures Title Case, replaces underscores, and formats as
 * "<Concept Label> – <Clear Phrase>" when possible.
 */
const normalizeSituation = (situation) => {
  if (!situation) return '';
  let result = situation.trim();

  // Replace underscores with spaces
  result = result.replace(/_/g, ' ');

  // Remove duplicate spaces
  result = result.replace(/\s+/g, ' ');

  // Remove trailing spaces
  result = result.trim();

  return result;
};

/**
 * Ensures a sentence ends with a period and is grammatically complete.
 * Removes underscores and normalizes spacing.
 */
const normalizeSentence = (text) => {
  if (!text) return '';
  let result = text.trim();

  // Replace underscores with spaces
  result = result.replace(/_/g, ' ');

  // Remove duplicate spaces
  result = result.replace(/\s+/g, ' ');

  // Ensure ends with period
  if (result && !/[.!?]$/.test(result)) {
    result += '.';
  }

  // Remove duplicate punctuation
  result = result.replace(/([.!?])\1+/g, '$1');

  return result;
};

/**
 * Normalizes array items (earlyWarningSigns, ifStudentsLost, etc.).
 * Each item: sentence fragment, no trailing punctuation, no underscores.
 */
const normalizeListItem = (text) => {
  if (!text) return '';
  let result = text.trim();

  // Replace underscores with spaces
  result = result.replace(/_/g, ' ');

  // Remove duplicate spaces
  result = result.replace(/\s+/g, ' ');

  // Remove trailing punctuation for list items
  result = result.replace(/[.,;:!?]+$/, '');

  // Remove trailing spaces
  result = result.trim();

  return result;
};

/**
 * Normalizes an array of list items.
 */
const normalizeList = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr.map(item => normalizeListItem(item));
};

/**
 * Applies all text normalization to a PrepCard object before insertion.
 * Does NOT modify topicId (kept as snake_case for machine use).
 */
const normalizeCardText = (cardData) => {
  return {
    ...cardData,
    situation: normalizeSituation(cardData.situation),
    whatBreaksHere: normalizeSentence(cardData.whatBreaksHere),
    earlyWarningSigns: normalizeList(cardData.earlyWarningSigns),
    ifStudentsLost: normalizeList(cardData.ifStudentsLost),
    ifStudentsBored: normalizeList(cardData.ifStudentsBored)
  };
};

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  console.log('>>> SEED SCRIPT USING MONGO_URI:', mongoURI);

  if (!mongoURI) {
    console.error('MONGO_URI is not defined. Aborting seed.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB Atlas connected for seeding');
  } catch (error) {
    console.error('Failed to connect to MongoDB Atlas:', error.message);
    process.exit(1);
  }
};

const seedData = async () => {

  try {

    await connectDB();

    // Clear existing data

    await Curriculum.deleteMany({});

    await PrepCard.deleteMany({});

    console.log('Cleared existing data');

    // ===== CURRICULUM SETUP =====



    const evsCurriculum = new Curriculum({

      subject: 'EVS',

      grade: 3,

      topics: [

        { id: 'family_friends', name: 'Family and Friends', description: 'Understanding family structures and relationships' },

        { id: 'going_mela', name: 'Going to the Mela', description: 'Learning about mela, work, and economy' },

        { id: 'celebrating_festivals', name: 'Celebrating Festivals', description: 'Understanding festivals and their significance' },

        { id: 'plants', name: 'Getting to Know Plants', description: 'Learning about plant parts and functions' },

        { id: 'plants_animals', name: 'Plants and Animals Live Together', description: 'Understanding food chains and habitats' }

      ]

    });

    await evsCurriculum.save();



    const mathsCurriculum = new Curriculum({

      subject: 'Maths',

      grade: 3,

      topics: [

        { id: 'whats_name', name: "What's in a Name?", description: 'Understanding place value and number names' },

        { id: 'toy_joy', name: 'Toy Joy', description: 'Learning about patterns' },

        { id: 'double_century', name: 'Double Century', description: 'Understanding numbers up to 200' },

        { id: 'vacation_nani', name: 'Vacation with My Nani Maa', description: 'Addition and subtraction' },

        { id: 'shapes', name: 'Fun with Shapes', description: 'Learning about 2D and 3D shapes' }

      ]

    });

    await mathsCurriculum.save();



    const grade4EvsCurriculum = new Curriculum({

      subject: 'EVS',

      grade: 4,

      topics: [

        { id: 'living_together', name: 'Living Together', description: 'Community roles, cooperation, and shared spaces' },

        { id: 'exploring_neighbourhood', name: 'Exploring Our Neighbourhood', description: 'Places, services, and directions in the neighbourhood' },

        { id: 'nature_trail', name: 'Nature Trail', description: 'Observing plants, animals, and interdependence' },

        { id: 'growing_up_with_nature', name: 'Growing Up with Nature', description: 'Traditional practices that use natural resources wisely' },

        { id: 'food_for_health', name: 'Food for Health', description: 'Healthy food choices, food groups, and balanced meals' }

      ]

    });

    await grade4EvsCurriculum.save();



    const grade4MathsCurriculum = new Curriculum({

      subject: 'Maths',

      grade: 4,

      topics: [

        { id: 'shapes_around_us', name: 'Shapes Around Us', description: '2D/3D shapes, nets, angles, and circle parts' },

        { id: 'hide_and_seek', name: 'Hide and Seek', description: 'Views, positions, directions, and grid paths' },

        { id: 'patterns_around_us', name: 'Patterns Around Us', description: 'Counting patterns, even/odd reasoning, and money patterns' },

        { id: 'thousands_around_us', name: 'Thousands Around Us', description: 'Place value to thousands, number lines, and comparisons' },

        { id: 'how_heavy_how_light', name: 'How Heavy? How Light?', description: 'Weight comparison, balance, and indirect comparisons' }

      ]

    });

    await grade4MathsCurriculum.save();



    // ===== PREP CARDS SETUP =====

    // Helper to create a PrepCard with normalized text.
    // Applies formatting rules to all human-facing text fields.

    const makeCard = (subject, grade, topicId, situation, whatBreaksHere, earlyWarningSigns, ifStudentsLost, ifStudentsBored, peerInsight = 'Based on peer classroom trials.') => {
      const rawCard = {
        subject,
        grade,
        topicId, // Kept as snake_case for machine use
        situation,
        whatBreaksHere,
        earlyWarningSigns,
        ifStudentsLost,
        ifStudentsBored,
        successRate: 0.65,
        peerInsights: { count: 5, insight: normalizeListItem(peerInsight) },
        confidence: 0.7
      };
      // Apply text normalization before creating the model instance
      return new PrepCard(normalizeCardText(rawCard));
    };



    const prepCards = [];



    // ===== EVS CHAPTER 1: Family and Friends (9 cards) =====

    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'family_friends',

      situation: 'Prerequisite Gap - "Family = Only Parents"',

      whatBreaksHere: 'Students have a narrow idea of family and miss the concept of different family members and structures.',

      earlyWarningSigns: ['Children name only parents when asked about family', 'Silence when asked about grandparents or relatives'],

      ifStudentsLost: ['Ask students to name who lives with them and who visits them often', 'Draw two circles on the board: "Lives with me" and "Visits us"'],

      ifStudentsBored: ['Ask them to compare Bela\'s family with their own', 'Let them explain one "different" family they know nearby'],

      successRate: 0.68, peerInsights: { count: 6, insight: 'Students understand better when given real examples from their neighborhood.' }, confidence: 0.75

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'family_friends',

      situation: 'Conceptual Gap - Worked Earlier, Failed Later',

      whatBreaksHere: 'Children remember names but don\'t connect family with care and responsibility.',

      earlyWarningSigns: ['One-word answers like "mother cooks" repeated by many', 'Copying from classmates during table work'],

      ifStudentsLost: ['Act out one task (e.g., watering plants) and ask who does this at home', 'Write one shared task and ask students to add who helps'],

      ifStudentsBored: ['Ask them to list work they do at home', 'Let them rank which task helps the family most'],

      successRate: 0.71, peerInsights: { count: 7, insight: 'Acting out tasks made responsibility connections clearer.' }, confidence: 0.74

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'family_friends',

      situation: 'Can\'t Visualize - Family Activities',

      whatBreaksHere: 'Learning remains abstract because students don\'t connect text with real life.',

      earlyWarningSigns: ['Blank stares during reading', 'Random answers not linked to the story'],

      ifStudentsLost: ['Ask students to close eyes and recall one evening at home', 'Let 2-3 students describe what everyone was doing'],

      ifStudentsBored: ['Ask them to dramatize one family scene', 'Let classmates guess what activity is being shown'],

      successRate: 0.66, peerInsights: { count: 5, insight: 'Visualization exercises brought text to life.' }, confidence: 0.73

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'family_friends',

      situation: 'Mixed Pace Classroom',

      whatBreaksHere: 'One-speed teaching doesn\'t work for varied literacy levels.',

      earlyWarningSigns: ['Early finishers talking loudly', 'Slow writers copying blindly'],

      ifStudentsLost: ['Allow oral responses instead of writing', 'Pair slow writers with a supportive peer'],

      ifStudentsBored: ['Ask them to add one extra family member or pet', 'Let them explain differences between two families'],

      successRate: 0.63, peerInsights: { count: 7, insight: 'Flexible response modes helped all pace levels.' }, confidence: 0.70

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'family_friends',

      situation: 'Language Not Understood',

      whatBreaksHere: 'Vocabulary blocks understanding of relationships.',

      earlyWarningSigns: ['Students ask "What is this word?" repeatedly', 'Wrong matching in relationship activities'],

      ifStudentsLost: ['Use local words for relationships first', 'Ask students to translate terms into home language'],

      ifStudentsBored: ['Ask them to teach one word to the class', 'Let them create a sentence using the word'],

      successRate: 0.65, peerInsights: { count: 6, insight: 'Home language bridging clarified relationship terms.' }, confidence: 0.69

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'family_friends',

      situation: 'Activity Chaos - Drawing and Rangoli',

      whatBreaksHere: 'Activity lacks structure, leading to loss of learning focus.',

      earlyWarningSigns: ['Children roaming around', 'Materials being misused'],

      ifStudentsLost: ['Demonstrate one simple example first', 'Set a clear time limit and task goal'],

      ifStudentsBored: ['Ask them to explain the meaning behind their design', 'Let them link it to family help or festivals'],

      successRate: 0.64, peerInsights: { count: 6, insight: 'Clear demonstrations and time limits reduced chaos.' }, confidence: 0.71

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'family_friends',

      situation: '"Only Humans Are Family"',

      whatBreaksHere: 'Emotional connection with animals is missing.',

      earlyWarningSigns: ['Laughing at pet-related examples', 'Saying "animals don\'t belong in family"'],

      ifStudentsLost: ['Ask who feeds or cares for animals at home', 'Relate care of animals to care of people'],

      ifStudentsBored: ['Ask them to name an animal they feel close to', 'Let them explain how they would care for it'],

      successRate: 0.66, peerInsights: { count: 5, insight: 'Linking animal care to human relationships changed perspectives.' }, confidence: 0.73

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'family_friends',

      situation: 'Family Size Confusion',

      whatBreaksHere: 'Value judgment replaces understanding of diversity.',

      earlyWarningSigns: ['Teasing comments', 'Comparing families competitively'],

      ifStudentsLost: ['Show examples of both big and small families', 'Emphasize care, not number'],

      ifStudentsBored: ['Ask them to find one strength of each type', 'Let them share real-life examples'],

      successRate: 0.63, peerInsights: { count: 7, insight: 'Explicit discussion of diversity helped normalize all family types.' }, confidence: 0.70

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'family_friends',

      situation: 'Helping = Adult\'s Job',

      whatBreaksHere: 'Children don\'t see themselves as contributors.',

      earlyWarningSigns: ['Saying "I don\'t do anything"', 'Laughing at helping tasks'],

      ifStudentsLost: ['Ask simple questions about daily routines', 'List even small tasks on the board'],

      ifStudentsBored: ['Ask them to plan one new way they can help', 'Let them predict how it helps the family'],

      successRate: 0.67, peerInsights: { count: 6, insight: 'Recognizing small contributions boosted student engagement.' }, confidence: 0.72

    }));



    // ===== EVS CHAPTER 2: Going to the Mela (9 cards) =====

    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'going_mela',

      situation: 'Missing the Basic Idea of a Mela',

      whatBreaksHere: 'Students see the mela only as fun rides, not as a place with work, people, money, and culture.',

      earlyWarningSigns: ['Students only mention swings and toys', 'Blank looks when asked about shopkeepers or workers'],

      ifStudentsLost: ['Ask, "Who all work in a mela?" and list answers on the board', 'Group items into people, work, and fun'],

      ifStudentsBored: ['Ask them to compare a mela with a market', 'Let them draw a mela showing people doing different jobs'],

      successRate: 0.67, peerInsights: { count: 6, insight: 'Role sorting revealed unseen work behind melas.' }, confidence: 0.71

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'going_mela',

      situation: 'Concept Understood Initially, Forgotten Later',

      whatBreaksHere: 'Learning stayed verbal and didn\'t turn into understanding they can recall later.',

      earlyWarningSigns: ['Correct oral answers, wrong written ones', 'Copying from the board without thinking'],

      ifStudentsLost: ['Revisit using a quick recap game (name one mela worker)', 'Let students explain answers to a partner before writing'],

      ifStudentsBored: ['Ask them to make their own question from the chapter', 'Exchange notebooks and answer each other\'s questions'],

      successRate: 0.65, peerInsights: { count: 5, insight: 'Peer explanation before writing improved retention.' }, confidence: 0.69

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'going_mela',

      situation: "Can't Visualize",

      whatBreaksHere: 'The lesson assumes real-life exposure that some children don\'t have.',

      earlyWarningSigns: ['Silence during discussion', 'Very empty or random drawings'],

      ifStudentsLost: ['Describe the mela step-by-step like a story', 'Act out sounds and movements (calling, selling, crowds)'],

      ifStudentsBored: ['Let them add one "new stall" to the mela', 'Ask them to explain why people would visit it'],

      successRate: 0.63, peerInsights: { count: 5, insight: 'Story-telling and acting made melas tangible.' }, confidence: 0.68

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'going_mela',

      situation: 'Mixed Pace Classroom',

      whatBreaksHere: 'One task level doesn\'t suit all learning speeds.',

      earlyWarningSigns: ['Early finishers talking loudly', 'Slow learners stopping midway'],

      ifStudentsLost: ['Pair a fast learner with a slow learner', 'Break the task into smaller steps'],

      ifStudentsBored: ['Ask them to write 3 rules for a safe mela', 'Let them help check classmates\' work'],

      successRate: 0.66, peerInsights: { count: 6, insight: 'Paired learning supported varied speeds.' }, confidence: 0.70

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'going_mela',

      situation: 'Language Not Understood',

      whatBreaksHere: 'New vocabulary blocks concept understanding.',

      earlyWarningSigns: ['Students repeat words without meaning', 'Wrong answers to simple questions'],

      ifStudentsLost: ['Explain words using local language', 'Match words with actions or objects'],

      ifStudentsBored: ['Ask them to make a mela word list', 'Use words in short oral sentences'],

      successRate: 0.60, peerInsights: { count: 4, insight: 'Action-based vocabulary teaching clarified terms.' }, confidence: 0.65

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'going_mela',

      situation: 'Activity Chaos',

      whatBreaksHere: 'Excitement overtakes learning purpose.',

      earlyWarningSigns: ['Too much shouting', 'Students leaving seats'],

      ifStudentsLost: ['Pause the activity and restate roles clearly', 'Limit movement to fixed spaces'],

      ifStudentsBored: ['Add a challenge like "sell without speaking"', 'Rotate roles after 5 minutes'],

      successRate: 0.62, peerInsights: { count: 5, insight: 'Role rotation and constraints organized the play.' }, confidence: 0.67

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'going_mela',

      situation: 'Mela = Only Fun, Not Work',

      whatBreaksHere: 'Partial understanding of mela features.',

      earlyWarningSigns: ['Only ride-related answers', 'Ignoring sellers and buyers'],

      ifStudentsLost: ['Make two columns: ride / work', 'Fill together with examples'],

      ifStudentsBored: ['Ask which mela part earns money', 'Let them redesign a mela with more shops'],

      successRate: 0.64, peerInsights: { count: 5, insight: 'Two-column sorting clarified mela components.' }, confidence: 0.68

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'going_mela',

      situation: 'Money Concepts Are Too Abstract',

      whatBreaksHere: 'Economic ideas are too abstract.',

      earlyWarningSigns: ['Random answers about money', 'Confusion between free and paid items'],

      ifStudentsLost: ['Do a pretend buying activity with paper money', 'Talk aloud through each step'],

      ifStudentsBored: ['Ask them to set prices for stalls', 'Compare cheap vs costly items'],

      successRate: 0.61, peerInsights: { count: 4, insight: 'Pretend money exchanges made economics concrete.' }, confidence: 0.66

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'going_mela',

      situation: 'Safety and Responsibility Missing',

      whatBreaksHere: 'Life-skill learning is getting skipped.',

      earlyWarningSigns: ['No mention of dustbins or crowd safety', 'Unsafe ideas during role-play'],

      ifStudentsLost: ['Ask "What can go wrong at a mela?"', 'List problems and solutions together'],

      ifStudentsBored: ['Make them "mela safety officers"', 'Create 3 mela safety rules'],

      successRate: 0.63, peerInsights: { count: 5, insight: 'Problem-solution listing highlighted safety.' }, confidence: 0.67

    }));



    // ===== EVS CHAPTER 3: Celebrating Festivals (9 cards) =====

    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'celebrating_festivals',

      situation: 'Prerequisite Gap',

      whatBreaksHere: 'Students lack the basic idea that festivals are special days linked to culture, beliefs, seasons, or events.',

      earlyWarningSigns: ['Students only list names like Diwali or Eid', 'Silence when asked "why do we celebrate?"'],

      ifStudentsLost: ['Ask children to recall birthdays or weddings and compare them to festivals', 'Write a simple sentence frame: "A festival is celebrated because ___"'],

      ifStudentsBored: ['Ask students to invent a "new festival" and explain why it exists', 'Let them name who celebrates it and how'],

      successRate: 0.66, peerInsights: { count: 6, insight: 'Comparing to familiar events clarified festival meaning.' }, confidence: 0.70

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'celebrating_festivals',

      situation: 'Worked Once, Failed Later',

      whatBreaksHere: 'The idea of festivals as social, cultural, or religious practices is missing.',

      earlyWarningSigns: ['All answers revolve around sweets and crackers', 'No mention of prayers, customs, or family gatherings'],

      ifStudentsLost: ['Draw a four-part circle: food, prayer, people, purpose', 'Fill one festival together using student responses'],

      ifStudentsBored: ['Challenge them to find a festival with less food but more meaning', 'Ask them to explain why it still matters'],

      successRate: 0.64, peerInsights: { count: 5, insight: 'Four-part framework revealed deeper dimensions.' }, confidence: 0.69

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'celebrating_festivals',

      situation: "Can't Visualize",

      whatBreaksHere: 'Children assume everyone celebrates festivals the same way.',

      earlyWarningSigns: ['"This is how everyone does it" statements', 'Confusion when examples differ from their experience'],

      ifStudentsLost: ['Share two contrasting celebration examples of the same festival', 'Ask students to compare using "same" and "different"'],

      ifStudentsBored: ['Ask them to interview someone at home about celebrations', 'Share one surprising difference in class'],

      successRate: 0.63, peerInsights: { count: 5, insight: 'Contrast examples showed diversity within festivals.' }, confidence: 0.68

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'celebrating_festivals',

      situation: 'Mixed Pace Classroom',

      whatBreaksHere: 'Uneven exposure to festivals and language confidence.',

      earlyWarningSigns: ['Same students answering repeatedly', 'Others copying answers or avoiding eye contact'],

      ifStudentsLost: ['Pair a talkative student with a quiet one', 'Give each pair one festival to discuss together'],

      ifStudentsBored: ['Ask fast learners to add one fact about another community\'s festival', 'Let them help present pair answers'],

      successRate: 0.65, peerInsights: { count: 6, insight: 'Paired discussion leveled participation.' }, confidence: 0.70

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'celebrating_festivals',

      situation: 'Language Not Understood',

      whatBreaksHere: 'Key EVS vocabulary is blocking understanding of ideas.',

      earlyWarningSigns: ['Students repeat words incorrectly', 'Blank looks during explanations'],

      ifStudentsLost: ['Act out words like prayer, sharing, gathering', 'Ask students to explain words in their home language'],

      ifStudentsBored: ['Ask them to use the word in a sentence', 'Let them teach the word to the class'],

      successRate: 0.60, peerInsights: { count: 4, insight: 'Acting out vocabulary made abstract terms concrete.' }, confidence: 0.65

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'celebrating_festivals',

      situation: 'Activity Chaos',

      whatBreaksHere: 'Clear roles and discussion structure are missing.',

      earlyWarningSigns: ['Multiple students talking at once', 'Off-topic conversations'],

      ifStudentsLost: ['Assign roles: speaker, listener, writer', 'Give one clear question per group'],

      ifStudentsBored: ['Ask groups to present one "rule of good celebration"', 'Compare answers across groups'],

      successRate: 0.62, peerInsights: { count: 5, insight: 'Role assignment organized group discussions.' }, confidence: 0.67

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'celebrating_festivals',

      situation: 'Religious vs Cultural Festivals',

      whatBreaksHere: 'Understanding that festivals can be religious, seasonal, or cultural.',

      earlyWarningSigns: ['"This festival is only for them" statements', 'Hesitation to discuss unfamiliar festivals'],

      ifStudentsLost: ['Classify festivals into religious, seasonal, national', 'Discuss one example from each category'],

      ifStudentsBored: ['Ask them to find a festival everyone in India shares', 'Explain why it brings people together'],

      successRate: 0.64, peerInsights: { count: 5, insight: 'Classification showed festival diversity.' }, confidence: 0.68

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'celebrating_festivals',

      situation: 'Festival vs Holiday Confusion',

      whatBreaksHere: 'Difference between a festival and a general holiday is unclear.',

      earlyWarningSigns: ['Calling Sunday or summer vacation a festival', 'Incorrect examples in answers'],

      ifStudentsLost: ['Make a two-column chart: festival vs holiday', 'Fill examples together'],

      ifStudentsBored: ['Ask them to argue why a holiday is NOT a festival', 'Encourage clear reasoning'],

      successRate: 0.61, peerInsights: { count: 4, insight: 'Comparison chart clarified the distinction.' }, confidence: 0.66

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'celebrating_festivals',

      situation: 'Celebrations and Responsibility',

      whatBreaksHere: 'Connection between celebrations and responsibility is missing.',

      earlyWarningSigns: ['Excitement about crackers without reflection', 'No mention of cleanliness or safety'],

      ifStudentsLost: ['Ask "What problems can happen during festivals?"', 'List solutions next to each problem'],

      ifStudentsBored: ['Ask them to design an "eco-friendly celebration"', 'Present one rule they would follow'],

      successRate: 0.63, peerInsights: { count: 5, insight: 'Problem-solution pairs introduced responsibility.' }, confidence: 0.67

    }));



    // ===== EVS CHAPTER 4: Getting to Know Plants (9 cards) =====

    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'plants',

      situation: 'Prerequisite Gap',

      whatBreaksHere: 'Students lack a basic mental map of plant parts, so new ideas like functions don\'t stick.',

      earlyWarningSigns: ['Students point to wrong parts in pictures', 'Blank responses when asked simple recall questions'],

      ifStudentsLost: ['Draw a simple plant on the board and label it slowly with the class', 'Ask students to touch the same parts on a real plant nearby or in their book'],

      ifStudentsBored: ['Ask them to explain what would happen if one part was missing', 'Let them quiz a partner by pointing to parts silently'],

      successRate: 0.67, peerInsights: { count: 6, insight: 'Real plant labeling made parts tangible.' }, confidence: 0.71

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'plants',

      situation: 'Worked Once, Failed Later',

      whatBreaksHere: 'Learning is memorised, not connected to real-life meaning.',

      earlyWarningSigns: ['Correct answers only when question is repeated', 'Wrong answers in worksheets with same concept'],

      ifStudentsLost: ['Use "why" questions instead of "what" questions', 'Link each function to daily life (e.g., roots = holding tight like shoes)'],

      ifStudentsBored: ['Ask them to make funny comparisons (stem as lift, leaf as kitchen)', 'Let them explain functions using actions or gestures'],

      successRate: 0.64, peerInsights: { count: 5, insight: 'Why-questions and analogies deepened understanding.' }, confidence: 0.69

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'plants',

      situation: "Can't Visualize",

      whatBreaksHere: 'The concept stays abstract because students never "see" roots.',

      earlyWarningSigns: ['Students draw roots above ground', 'Confusion between roots and branches'],

      ifStudentsLost: ['Show a pulled-out weed or picture of an uprooted plant', 'Draw underground roots using dotted lines on the board'],

      ifStudentsBored: ['Ask them to guess how long roots could be', 'Let them draw "secret underground roots" creatively'],

      successRate: 0.62, peerInsights: { count: 5, insight: 'Real uprooted plants made roots visible.' }, confidence: 0.67

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'plants',

      situation: 'Mixed Pace Classroom',

      whatBreaksHere: 'One pace doesn\'t fit all; slower students disengage, faster ones get restless.',

      earlyWarningSigns: ['Same students answering repeatedly', 'Others copying answers quietly'],

      ifStudentsLost: ['Pair fast learners with slower ones for quick explanations', 'Repeat key ideas using simpler words and examples'],

      ifStudentsBored: ['Ask them to classify plants around the school/home', 'Give them a challenge: "Find a plant that breaks the rule"'],

      successRate: 0.66, peerInsights: { count: 6, insight: 'Peer tutoring and challenges engaged both groups.' }, confidence: 0.70

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'plants',

      situation: 'Language Not Understood',

      whatBreaksHere: 'Vocabulary is new and not anchored to familiar examples.',

      earlyWarningSigns: ['Students describe but avoid naming', 'Mixing up herb/shrub/tree labels'],

      ifStudentsLost: ['Use local plant examples students already know', 'Repeat terms using comparison (small-medium-tall)'],

      ifStudentsBored: ['Ask them to name plants from their home area', 'Let them invent their own categories and explain why'],

      successRate: 0.60, peerInsights: { count: 4, insight: 'Local examples anchored new vocabulary.' }, confidence: 0.65

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'plants',

      situation: 'Activity Chaos',

      whatBreaksHere: 'Clear task boundaries are missing during activity time.',

      earlyWarningSigns: ['Students roaming without purpose', 'Talking unrelated to task'],

      ifStudentsLost: ['Pause activity and restate one clear observation goal', 'Assign roles (look, note, report)'],

      ifStudentsBored: ['Add a time-bound challenge ("3 things in 2 minutes")', 'Ask groups to share one surprising observation'],

      successRate: 0.63, peerInsights: { count: 5, insight: 'Clear goals and roles structured observations.' }, confidence: 0.68

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'plants',

      situation: 'Plant Comparison Skills Missing',

      whatBreaksHere: 'Lack of comparison thinking; differences aren\'t highlighted.',

      earlyWarningSigns: ['Same description used for all plants', 'No mention of size or stem type'],

      ifStudentsLost: ['Line up examples by size on the board', 'Ask "what is different?" instead of "what is this?"'],

      ifStudentsBored: ['Ask them to find the odd one out', 'Let them defend their choice'],

      successRate: 0.64, peerInsights: { count: 5, insight: 'Comparison questions revealed plant diversity.' }, confidence: 0.68

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'plants',

      situation: 'Leaves Are Just for Looks',

      whatBreaksHere: 'The function of leaves (food-making) is not internalised.',

      earlyWarningSigns: ['Students say leaves are "for looks"', 'No link between leaves and plant survival'],

      ifStudentsLost: ['Ask what would happen if all leaves fell off', 'Connect leaves to eating and energy in humans'],

      ifStudentsBored: ['Ask them to design the "best leaf" for a plant', 'Let them explain why their leaf helps more'],

      successRate: 0.61, peerInsights: { count: 4, insight: 'Survival questions linked leaves to function.' }, confidence: 0.66

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'plants',

      situation: 'Plants Don\'t Need Care',

      whatBreaksHere: 'The connection between plants and life processes is weak.',

      earlyWarningSigns: ['Students say plants don\'t need care', 'No mention of water, air, or sunlight'],

      ifStudentsLost: ['Compare plants to pets needing care', 'List what happens if plants are ignored'],

      ifStudentsBored: ['Ask them to plan a "plant care routine"', 'Let them track a plant\'s changes over time'],

      successRate: 0.63, peerInsights: { count: 5, insight: 'Pet comparison humanized plant needs.' }, confidence: 0.67

    }));



    // ===== EVS CHAPTER 5: Plants and Animals Live Together (9 cards) =====

    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'plants_animals',

      situation: 'Prerequisite Gap',

      whatBreaksHere: 'Students don\'t understand that plants are the starting point of food for animals and humans; they see plants and animals as separate topics, not connected.',

      earlyWarningSigns: ['Children say animals eat "food" but can\'t name plants or plant parts', 'Confusion when asked who eats first in nature'],

      ifStudentsLost: ['Draw a simple chain on the board: plant -> goat -> human. Say it aloud together', 'Ask students to name one animal and what plant it eats'],

      ifStudentsBored: ['Ask them to make a new food chain using animals they know', 'Let them challenge wrong chains and correct each other'],

      successRate: 0.66, peerInsights: { count: 6, insight: 'Simple chains made connections visible.' }, confidence: 0.70

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'plants_animals',

      situation: 'Worked Once, Failed Later',

      whatBreaksHere: 'Learning was memorised, not understood; students didn\'t internalise why plants are important for animals.',

      earlyWarningSigns: ['Correct answers suddenly disappear', 'Children repeat textbook lines without meaning'],

      ifStudentsLost: ['Ask "What happens if there are no plants?" Pause and let silence work', 'Use a simple story: forest without trees, animals leaving'],

      ifStudentsBored: ['Ask them to predict what happens 5 years later in the story', 'Let them explain in their own words, not book language'],

      successRate: 0.64, peerInsights: { count: 5, insight: 'Story-based scenarios made dependencies clear.' }, confidence: 0.69

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'plants_animals',

      situation: "Can't Visualize",

      whatBreaksHere: 'Lack of mental images of habitats; learning stays abstract instead of real.',

      earlyWarningSigns: ['Students mix farm, forest, water animals randomly', 'Blank looks when asked "Where does it live?"'],

      ifStudentsLost: ['Ask students to close their eyes and imagine a forest or pond', 'Draw a simple scene and place animals inside it together'],

      ifStudentsBored: ['Let them add one new animal to the scene and justify placement', 'Ask "What will happen if this animal is removed?"'],

      successRate: 0.62, peerInsights: { count: 5, insight: 'Scene-drawing made habitats concrete.' }, confidence: 0.67

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'plants_animals',

      situation: 'Mixed Pace Classroom',

      whatBreaksHere: 'Same explanation doesn\'t work for all learners; faster students dominate discussion.',

      earlyWarningSigns: ['Same hands raised every time', 'Some students are copying answers'],

      ifStudentsLost: ['Pair a fast learner with a quiet student for one question', 'Ask pairs to explain, not write'],

      ifStudentsBored: ['Give fast learners a "why" question instead of "what"', 'Ask them to help create examples, not answers'],

      successRate: 0.67, peerInsights: { count: 6, insight: 'Why-questions challenged faster learners.' }, confidence: 0.71

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'plants_animals',

      situation: 'Language Not Understood',

      whatBreaksHere: 'Language barrier blocks concept understanding; children know ideas but not the words.',

      earlyWarningSigns: ['Students avoid answering verbally', 'Repeating the teacher\'s words without clarity'],

      ifStudentsLost: ['Replace words with daily language (home, food, help)', 'Ask students to explain in their home language first'],

      ifStudentsBored: ['Ask them to rephrase concepts using only simple words', 'Turn it into a "no textbook words" challenge'],

      successRate: 0.60, peerInsights: { count: 4, insight: 'Simple language removed barriers.' }, confidence: 0.65

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'plants_animals',

      situation: 'Activity Chaos',

      whatBreaksHere: 'Activity goal is unclear; too much freedom, not enough structure.',

      earlyWarningSigns: ['Loud talking without task focus', 'Groups copying from one student'],

      ifStudentsLost: ['Stop activity and restate the goal in one line', 'Assign one role per child (speaker, thinker, writer)'],

      ifStudentsBored: ['Add a constraint (only 3 animals allowed)', 'Ask groups to compare answers and defend them'],

      successRate: 0.62, peerInsights: { count: 5, insight: 'Clear goals and constraints focused activity.' }, confidence: 0.67

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'plants_animals',

      situation: 'Animals Only Take, Plants Only Give',

      whatBreaksHere: 'One-way understanding of dependence; missed idea of mutual support.',

      earlyWarningSigns: ['Students say animals only take from plants', 'No mention of seeds, manure, or pollination'],

      ifStudentsLost: ['Use examples: cow dung for plants, birds spreading seeds', 'Draw arrows both ways between plant and animal'],

      ifStudentsBored: ['Ask them to find one example of animals helping plants', 'Let them explain with drawings instead of words'],

      successRate: 0.64, peerInsights: { count: 5, insight: 'Two-way arrows showed mutual dependence.' }, confidence: 0.68

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'plants_animals',

      situation: 'Wild, Pet, Farm Animal Confusion',

      whatBreaksHere: 'Classification skills are weak; real-life context not connected.',

      earlyWarningSigns: ['Calling a lion a pet or a dog a wild animal', 'Confusion during sorting activities'],

      ifStudentsLost: ['Use "Where do you see it daily?" as the rule', 'Make three columns and place animals together'],

      ifStudentsBored: ['Ask tricky cases (cow in forest, dog on street)', 'Let them argue and justify their choice'],

      successRate: 0.61, peerInsights: { count: 4, insight: 'Daily-life rule simplified classification.' }, confidence: 0.66

    }));



    prepCards.push(new PrepCard({

      subject: 'EVS', grade: 3, topicId: 'plants_animals',

      situation: 'Humans Are Separate from Nature',

      whatBreaksHere: 'Humans are seen as separate from nature; missed idea of shared dependence.',

      earlyWarningSigns: ['Food chains without humans', 'Statements like "nature is for animals"'],

      ifStudentsLost: ['Ask "What did you eat today?" Trace it back to plants', 'Add humans into existing food chains'],

      ifStudentsBored: ['Ask how humans harm or help plants and animals', 'Let them suggest one good habit for humans'],

      successRate: 0.63, peerInsights: { count: 5, insight: 'Tracing meals connected humans to nature.' }, confidence: 0.67

    }));



    // ===== MATH CHAPTER 1: What's in a Name? (9 cards) =====

    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'whats_name',

      situation: 'Prerequisite Gap',

      whatBreaksHere: 'Students lack strong place value understanding from earlier grades; they treat numbers as single blocks instead of grouped values.',

      earlyWarningSigns: ['Writes 345 as "three four five" without meaning', 'Gets confused when asked "How many tens?"'],

      ifStudentsLost: ['Rebuild using bundles of sticks or chalk marks (10 = one bundle)', 'Repeatedly ask "How many groups of 10?" before naming the number'],

      ifStudentsBored: ['Ask them to show the same number in two different ways', 'Let them challenge peers with "Guess my number" using place clues'],

      successRate: 0.68, peerInsights: { count: 9, insight: 'Concrete materials made place value tangible and memorable.' }, confidence: 0.72

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'whats_name',

      situation: 'Worked Once, Failed Later',

      whatBreaksHere: 'Students memorized patterns but didn\'t internalize place expansion; thousands place is introduced but not conceptually anchored.',

      earlyWarningSigns: ['Reads 1,234 as "one hundred two three four"', 'Skips the word "thousand" completely'],

      ifStudentsLost: ['Write the number in a place-value table and fill it slowly', 'Say the number aloud together while pointing to each column'],

      ifStudentsBored: ['Give them mixed numbers and ask which sounds bigger without calculating', 'Ask them to invent a "wrong reading" and explain why it\'s wrong'],

      successRate: 0.65, peerInsights: { count: 7, insight: 'Structured place-value tables and repeated modeling improved accuracy.' }, confidence: 0.69

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'whats_name',

      situation: "Can't Visualize",

      whatBreaksHere: 'Numbers are abstract symbols without real-world anchoring; students can\'t connect digits to actual size or amount.',

      earlyWarningSigns: ['Says "5,000 is small"', 'Can\'t compare two large numbers meaningfully'],

      ifStudentsLost: ['Connect numbers to familiar things (students, grains, steps)', 'Draw number bars showing relative size'],

      ifStudentsBored: ['Ask them to estimate numbers in the classroom or school', 'Give a number and ask where it fits between two others'],

      successRate: 0.62, peerInsights: { count: 6, insight: 'Real-world anchors and visual comparisons helped abstraction.' }, confidence: 0.66

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'whats_name',

      situation: 'Mixed Pace Classroom',

      whatBreaksHere: 'One-speed teaching doesn\'t match varied number sense levels; faster students disengage, slower students panic.',

      earlyWarningSigns: ['Early finishers start chatting', 'Some students stop writing altogether'],

      ifStudentsLost: ['Pair slow learners with supportive peers for place-value tasks', 'Reduce numbers to 2-3 digits temporarily'],

      ifStudentsBored: ['Give them comparison puzzles with close numbers', 'Ask them to explain why one number is larger, not just which'],

      successRate: 0.70, peerInsights: { count: 8, insight: 'Differentiation and peer support maintained engagement for all.' }, confidence: 0.73

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'whats_name',

      situation: 'Language Not Understood',

      whatBreaksHere: 'Language becomes a barrier, not the math; students know the number but not the words.',

      earlyWarningSigns: ['Can write digits but not number names', 'Mixes up "hundred" and "thousand"'],

      ifStudentsLost: ['Say number names slowly in home language first, then English', 'Display a number-name word wall'],

      ifStudentsBored: ['Ask them to translate number names into home language', 'Play "fix the mistake" with wrong spellings or names'],

      successRate: 0.61, peerInsights: { count: 5, insight: 'L1 support and word walls provided necessary scaffolding.' }, confidence: 0.64

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'whats_name',

      situation: 'Activity Chaos',

      whatBreaksHere: 'Students don\'t know the learning goal of the activity; too many materials without structure.',

      earlyWarningSigns: ['Talking unrelated to the task', 'Materials used like toys'],

      ifStudentsLost: ['Stop and restate the task in one clear sentence', 'Demonstrate one example before restarting'],

      ifStudentsBored: ['Assign them as "checkers" for other groups', 'Ask them to create a new number challenge using the materials'],

      successRate: 0.67, peerInsights: { count: 7, insight: 'Clear task boundaries and structured roles reduced chaos.' }, confidence: 0.70

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'whats_name',

      situation: 'Place Value Not Understood',

      whatBreaksHere: 'Students don\'t grasp that place changes value; "5" is always treated as just five.',

      earlyWarningSigns: ['Says 5 in 50 equals 5 in 500', 'Can\'t explain why numbers change when digits move'],

      ifStudentsLost: ['Write the same digit in different places and compare', 'Use "How much?" instead of "Which digit?"'],

      ifStudentsBored: ['Ask them to make the biggest number using the same digits', 'Let them rearrange digits and justify value change'],

      successRate: 0.64, peerInsights: { count: 6, insight: 'Comparative analysis of digit placement deepened understanding.' }, confidence: 0.68

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'whats_name',

      situation: 'Number Names = Spelling Only',

      whatBreaksHere: 'Writing is treated as spelling, not meaning; no link between spoken number and written form.',

      earlyWarningSigns: ['Correct spelling but wrong number', 'Writes long names for small numbers'],

      ifStudentsLost: ['Break number names into parts (two thousand + three)', 'Match number cards with name cards'],

      ifStudentsBored: ['Ask them to read names and write digits quickly', 'Let them invent number riddles using names'],

      successRate: 0.63, peerInsights: { count: 5, insight: 'Breaking names into components made them less abstract.' }, confidence: 0.66

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'whats_name',

      situation: 'More Digits = Bigger Number',

      whatBreaksHere: 'Comparison is based on digit count, not place value; thousands concept is shaky.',

      earlyWarningSigns: ['Says 999 is bigger than 1,200', 'Looks only at number of digits'],

      ifStudentsLost: ['Compare starting from the leftmost digit together', 'Use place value charts side by side'],

      ifStudentsBored: ['Give tricky comparisons with the same digit length', 'Ask them to explain comparisons verbally, not just answer'],

      successRate: 0.65, peerInsights: { count: 7, insight: 'Systematic comparison from left to right resolved the misconception.' }, confidence: 0.69

    }));



    // ===== MATH CHAPTER 2: Toy Joy (9 cards) =====

    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'toy_joy',

      situation: 'Prerequisite Gap',

      whatBreaksHere: 'Students lack fluency with skip counting and basic number sequences, which the chapter assumes.',

      earlyWarningSigns: ['Students guess randomly while extending patterns', 'Repeatedly ask "What comes next?" without trying'],

      ifStudentsLost: ['Pause and revise skip counting orally using claps or steps (2s, 5s, 10s)', 'Build a simple pattern together on the board using chalk symbols before toys'],

      ifStudentsBored: ['Ask them to invent a new counting rule and challenge peers', 'Let them explain why their pattern works'],

      successRate: 0.66, peerInsights: { count: 6, insight: 'Skip counting practice made patterns accessible.' }, confidence: 0.70

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'toy_joy',

      situation: 'Worked Once, Failed Later',

      whatBreaksHere: 'Students focus on copying instead of identifying the rule behind the pattern.',

      earlyWarningSigns: ['Correct first few answers, then sudden mistakes', 'Copying neighbor\'s work without explanation'],

      ifStudentsLost: ['Ask, "What is repeating?" instead of "What is next?"', 'Circle the repeating unit using chalk on the board'],

      ifStudentsBored: ['Give a broken pattern and ask them to fix it', 'Ask them to create a pattern with two rules'],

      successRate: 0.65, peerInsights: { count: 6, insight: 'Rule-identification prevented copying.' }, confidence: 0.70

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'toy_joy',

      situation: "Can't Visualize",

      whatBreaksHere: 'Pattern understanding is too abstract without physical manipulation.',

      earlyWarningSigns: ['Blank stares at the textbook', 'Counting aloud repeatedly but unsure'],

      ifStudentsLost: ['Use locally available items (stones, chalk pieces, erasers) as toys', 'Let students physically arrange and rearrange the pattern'],

      ifStudentsBored: ['Ask them to show the same pattern in two different ways', 'Challenge them to convert a physical pattern into numbers'],

      successRate: 0.62, peerInsights: { count: 5, insight: 'Physical manipulation made patterns concrete.' }, confidence: 0.67

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'toy_joy',

      situation: 'Mixed Pace Classroom',

      whatBreaksHere: 'One-level task does not suit all learners.',

      earlyWarningSigns: ['Fast finishers start talking', 'Slow learners stop attempting'],

      ifStudentsLost: ['Pair slow learners with patient peers for pattern-building', 'Reduce the pattern length and rebuild gradually'],

      ifStudentsBored: ['Ask fast learners to design a trick pattern', 'Let them act as "pattern checkers" for others'],

      successRate: 0.68, peerInsights: { count: 6, insight: 'Tiered patterns kept all students engaged.' }, confidence: 0.72

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'toy_joy',

      situation: 'Language Not Understood',

      whatBreaksHere: 'Mathematical language is blocking understanding, not the concept.',

      earlyWarningSigns: ['Students follow instructions incorrectly', 'Asking meanings of common words repeatedly'],

      ifStudentsLost: ['Explain instructions in home language with examples', 'Demonstrate once instead of re-explaining verbally'],

      ifStudentsBored: ['Ask them to explain the rule in their own words', 'Let them translate instructions for the class'],

      successRate: 0.60, peerInsights: { count: 4, insight: 'Demonstration beat verbal explanations.' }, confidence: 0.65

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'toy_joy',

      situation: 'Activity Chaos',

      whatBreaksHere: 'Clear structure and expectations are missing during hands-on work.',

      earlyWarningSigns: ['Toys used for play, not math', 'Groups arguing or distracted'],

      ifStudentsLost: ['Stop activity and restate one clear task', 'Assign one role per child (arranger, counter, checker)'],

      ifStudentsBored: ['Set a time-bound challenge', 'Add a condition like "no talking while arranging"'],

      successRate: 0.63, peerInsights: { count: 5, insight: 'Roles and constraints organized activities.' }, confidence: 0.68

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'toy_joy',

      situation: 'Patterns Must Repeat Logically',

      whatBreaksHere: 'Students don\'t understand that patterns must repeat logically.',

      earlyWarningSigns: ['Random arrangements labelled as patterns', 'No explanation when asked "why"'],

      ifStudentsLost: ['Show one repeating and one random example side by side', 'Ask students to clap when repetition occurs'],

      ifStudentsBored: ['Give tricky examples and ask "pattern or not?"', 'Let them justify their answers'],

      successRate: 0.64, peerInsights: { count: 5, insight: 'Contrast examples clarified pattern definition.' }, confidence: 0.68

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'toy_joy',

      situation: 'Lost Track of Position',

      whatBreaksHere: 'Poor tracking of position and sequence.',

      earlyWarningSigns: ['Skipping items while counting', 'Different answers from same pattern'],

      ifStudentsLost: ['Mark every 5th or 10th item visibly', 'Encourage finger-point counting'],

      ifStudentsBored: ['Ask them to predict the 20th or 30th item', 'Let them explain a shortcut'],

      successRate: 0.61, peerInsights: { count: 4, insight: 'Visual markers improved tracking.' }, confidence: 0.66

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'toy_joy',

      situation: 'Silent Reasoning, No Explanation',

      whatBreaksHere: 'Reasoning is happening silently, not explicitly.',

      earlyWarningSigns: ['Correct answers with no explanation', '"I just know" responses'],

      ifStudentsLost: ['Model sentence frames like "The rule is..."', 'Ask students to say the rule before writing'],

      ifStudentsBored: ['Ask them to write the rule as a sentence', 'Let peers check if the rule matches the pattern'],

      successRate: 0.63, peerInsights: { count: 5, insight: 'Verbalization made reasoning visible.' }, confidence: 0.67

    }));



    // ===== MATH CHAPTER 3: Double Century (9 cards) =====

    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'double_century',

      situation: 'Prerequisite Gap',

      whatBreaksHere: 'Place value understanding (ones-tens-hundreds) is weak, so numbers feel like random digits.',

      earlyWarningSigns: ['Students read 132 as "one three two"', 'Confusion while grouping objects into tens'],

      ifStudentsLost: ['Group chalk pieces or sticks into bundles of 10 in front of the class', 'Write the number only after showing the bundles physically'],

      ifStudentsBored: ['Ask them to show the same number in two different ways (e.g., 1 hundred + 10 tens)', 'Challenge them to make the "biggest number" using fixed digits'],

      successRate: 0.67, peerInsights: { count: 6, insight: 'Physical bundling anchored place value.' }, confidence: 0.71

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'double_century',

      situation: 'Worked Once, Failed Later',

      whatBreaksHere: 'Transfer of understanding from two-digit to three-digit numbers is not happening.',

      earlyWarningSigns: ['Correct answers till 99, sudden mistakes after', 'Students start guessing instead of explaining'],

      ifStudentsLost: ['Rebuild numbers using place-value columns drawn on the board', 'Move back briefly to 2-digit examples and then extend to 3-digit'],

      ifStudentsBored: ['Ask them to predict the next number before writing it', 'Let them "teach" a smaller number example to the class'],

      successRate: 0.64, peerInsights: { count: 5, insight: 'Bridging 2-digit to 3-digit aided transfer.' }, confidence: 0.69

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'double_century',

      situation: "Can't Visualize",

      whatBreaksHere: 'Mental visualization of large quantities is missing.',

      earlyWarningSigns: ['Blank stares when asked "How big is 150?"', 'Students rely only on memorization'],

      ifStudentsLost: ['Use number lines on the floor or wall up to 200', 'Mark familiar points like 100 and build forward step by step'],

      ifStudentsBored: ['Ask them to place mystery numbers on the number line', 'Let them design their own number line challenges'],

      successRate: 0.61, peerInsights: { count: 5, insight: 'Floor number lines made magnitude tangible.' }, confidence: 0.66

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'double_century',

      situation: 'Mixed Pace Classroom',

      whatBreaksHere: 'One-speed teaching doesn\'t match varied number sense levels.',

      earlyWarningSigns: ['Fast finishers distracting others', 'Slow learners copying answers'],

      ifStudentsLost: ['Pair strong and struggling students for number-building tasks', 'Give concrete objects to slower learners instead of more questions'],

      ifStudentsBored: ['Give extension tasks like "How many numbers between 120 and 150?"', 'Ask them to create tricky numbers for peers to read'],

      successRate: 0.68, peerInsights: { count: 6, insight: 'Pairing and extensions engaged both ends.' }, confidence: 0.72

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'double_century',

      situation: 'Language Not Understood',

      whatBreaksHere: 'Language barrier interferes with mathematical understanding.',

      earlyWarningSigns: ['Correct digits but wrong number names', 'Hesitation while reading aloud'],

      ifStudentsLost: ['Read numbers aloud together in chorus', 'Break number names into parts (hundred + forty + five)'],

      ifStudentsBored: ['Ask them to quiz the class with number names', 'Let them match number cards with names quickly'],

      successRate: 0.60, peerInsights: { count: 4, insight: 'Choral reading built confidence.' }, confidence: 0.65

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'double_century',

      situation: 'Activity Chaos',

      whatBreaksHere: 'Clear task structure is missing during activity-based learning.',

      earlyWarningSigns: ['Students playing with materials instead of counting', 'Noise without math talk'],

      ifStudentsLost: ['Demonstrate the activity once before distributing materials', 'Set a clear rule: "count first, talk later"'],

      ifStudentsBored: ['Add a time challenge to the same activity', 'Ask them to check another group\'s counting'],

      successRate: 0.62, peerInsights: { count: 5, insight: 'Demonstration and rules organized chaos.' }, confidence: 0.67

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'double_century',

      situation: 'Hundred Means Big',

      whatBreaksHere: 'The idea of 100 as a unit is unclear.',

      earlyWarningSigns: ['Students say "hundred means big"', 'Inaccurate grouping into hundreds'],

      ifStudentsLost: ['Build exactly 100 using 10 bundles of 10', 'Count aloud together to reach 100 once'],

      ifStudentsBored: ['Ask how many tens make different hundreds', 'Let them challenge others with "true or false" statements'],

      successRate: 0.64, peerInsights: { count: 5, insight: 'Building 100 made it a concrete unit.' }, confidence: 0.68

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'double_century',

      situation: 'Expanded Form Errors',

      whatBreaksHere: 'Link between digit position and value is weak.',

      earlyWarningSigns: ['Writing incorrect expanded forms', 'Skipping place value labels'],

      ifStudentsLost: ['Always write H-T-O columns before expanding', 'Use spoken explanations alongside writing'],

      ifStudentsBored: ['Give wrong expanded forms and ask them to correct', 'Ask them to invent numbers with a fixed expanded form'],

      successRate: 0.61, peerInsights: { count: 4, insight: 'Column labels prevented expansion errors.' }, confidence: 0.66

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'double_century',

      situation: 'Counting Is Just Memorized',

      whatBreaksHere: 'Counting sequence is memorized, not understood.',

      earlyWarningSigns: ['Can\'t say the number before or after', 'Freeze when counting starts mid-way'],

      ifStudentsLost: ['Practice counting forward and backward from random numbers', 'Use jump counting on a number line'],

      ifStudentsBored: ['Play "continue the count" games from odd points', 'Ask them to design counting challenges for classmates'],

      successRate: 0.63, peerInsights: { count: 5, insight: 'Random-start counting broke memorization.' }, confidence: 0.67

    }));



    // ===== MATH CHAPTER 4: Vacation with My Nani Maa (9 cards) =====

    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'vacation_nani',

      situation: 'Prerequisite Gap',

      whatBreaksHere: 'Children do not see numbers as groups of tens and ones; they rely on counting one-by-one instead of jumps.',

      earlyWarningSigns: ['Fingers used for all calculations', 'Long pauses even for small additions'],

      ifStudentsLost: ['Build numbers using bundles of sticks or chalk dots (tens + ones)', 'Say numbers aloud as "two tens and five ones"'],

      ifStudentsBored: ['Ask them to explain a number in two ways (e.g., 37)', 'Challenge them to guess answers before solving'],

      successRate: 0.67, peerInsights: { count: 7, insight: 'Bundling reduced finger-counting dependence.' }, confidence: 0.71

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'vacation_nani',

      situation: 'Worked Once, Failed Later',

      whatBreaksHere: 'They memorized steps instead of understanding jumps; transfer of learning is missing.',

      earlyWarningSigns: ['Correct answers earlier, wrong answers now', 'Copying peers instead of thinking'],

      ifStudentsLost: ['Redo one solved example slowly using a number line', 'Ask "Where did we start? Where did we land?"'],

      ifStudentsBored: ['Let them create a new problem using the same method', 'Ask them to show a shortcut jump'],

      successRate: 0.64, peerInsights: { count: 6, insight: 'Revisiting with number lines reinforced concepts.' }, confidence: 0.69

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'vacation_nani',

      situation: "Can't Visualize",

      whatBreaksHere: 'Numbers feel abstract, not like movement; direction (+ / -) is unclear.',

      earlyWarningSigns: ['Random answers', 'Jumps drawn without spacing logic'],

      ifStudentsLost: ['Make children physically step forward/backward while counting', 'Draw a large floor number line'],

      ifStudentsBored: ['Ask them to predict landing numbers mentally', 'Introduce "one big jump vs many small jumps"'],

      successRate: 0.62, peerInsights: { count: 5, insight: 'Physical movement made operations tangible.' }, confidence: 0.67

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'vacation_nani',

      situation: 'Mixed Pace Classroom',

      whatBreaksHere: 'Same task given to all despite different speeds.',

      earlyWarningSigns: ['Fast finishers chatting', 'Slow learners freezing'],

      ifStudentsLost: ['Pair slow learners with verbal thinkers', 'Reduce numbers (e.g., 23 + 7 instead of 23 + 17)'],

      ifStudentsBored: ['Ask them to solve using two different methods', 'Let them act as "method explainers"'],

      successRate: 0.65, peerInsights: { count: 6, insight: 'Simplified numbers and pairing leveled pace.' }, confidence: 0.70

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'vacation_nani',

      situation: 'Language Not Understood',

      whatBreaksHere: 'Words like "more", "left", "total" are unclear.',

      earlyWarningSigns: ['Wrong operation chosen', 'Blank answers'],

      ifStudentsLost: ['Act the story using objects', 'Circle keywords together on the board'],

      ifStudentsBored: ['Ask them to reframe the problem orally', 'Let them write a new story for the same numbers'],

      successRate: 0.61, peerInsights: { count: 5, insight: 'Acting stories clarified word problems.' }, confidence: 0.65

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'vacation_nani',

      situation: 'Activity Chaos',

      whatBreaksHere: 'Rules not internalized; focus shifts from math to play.',

      earlyWarningSigns: ['Arguments', 'Random card picking'],

      ifStudentsLost: ['Demonstrate one full round slowly', 'Pause and restate rules mid-game'],

      ifStudentsBored: ['Add a rule like "explain before keeping cards"', 'Introduce time-bound rounds'],

      successRate: 0.63, peerInsights: { count: 5, insight: 'Slow demonstration prevented rule confusion.' }, confidence: 0.68

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'vacation_nani',

      situation: 'Addition vs Subtraction Direction',

      whatBreaksHere: 'Poor understanding of addition vs subtraction movement.',

      earlyWarningSigns: ['Subtraction shown as forward jumps', 'Answers larger than start number'],

      ifStudentsLost: ['Use arrows with + and - labels', 'Ask "Are we getting more or less?"'],

      ifStudentsBored: ['Give wrong examples and ask them to fix it', 'Ask them to justify direction choices'],

      successRate: 0.64, peerInsights: { count: 5, insight: 'Labeled arrows clarified direction.' }, confidence: 0.68

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'vacation_nani',

      situation: 'Estimation = Wild Guessing',

      whatBreaksHere: 'Estimation is seen as guessing, not reasoning.',

      earlyWarningSigns: ['Wild guesses', 'No explanation offered'],

      ifStudentsLost: ['Anchor to nearest tens', 'Ask "Will it be more or less than 100?"'],

      ifStudentsBored: ['Ask for the closest possible estimate', 'Compare two students\' estimates and discuss'],

      successRate: 0.61, peerInsights: { count: 4, insight: 'Anchoring made estimation reasonable.' }, confidence: 0.66

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'vacation_nani',

      situation: 'Only One Method Is Right',

      whatBreaksHere: 'Flexibility in thinking is missing.',

      earlyWarningSigns: ['Rejecting peer solutions', 'Saying "this is wrong" without listening'],

      ifStudentsLost: ['Show two methods side-by-side', 'Ask which feels easier and why'],

      ifStudentsBored: ['Challenge them to find a new method', 'Ask them to teach one method to the class'],

      successRate: 0.63, peerInsights: { count: 5, insight: 'Multiple methods promoted flexibility.' }, confidence: 0.67

    }));



    // ===== MATH CHAPTER 5: Fun with Shapes (9 cards) =====

    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'shapes',

      situation: 'Prerequisite Gap',

      whatBreaksHere: 'Students don\'t clearly remember basic 2D shapes (square, rectangle, triangle, circle), so new ideas build on shaky ground.',

      earlyWarningSigns: ['Students point to wrong shapes when asked', 'Answers like "box" instead of "square"'],

      ifStudentsLost: ['Draw 4 basic shapes on the board and name them aloud together', 'Ask students to find the same shapes in the classroom'],

      ifStudentsBored: ['Ask them to sort classroom objects by shape', 'Challenge them to find objects with more than one shape'],

      successRate: 0.66, peerInsights: { count: 6, insight: 'Classroom shape-hunt made learning concrete.' }, confidence: 0.70

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'shapes',

      situation: 'Worked Once, Failed Later',

      whatBreaksHere: 'Children memorized shapes earlier but didn\'t understand their properties.',

      earlyWarningSigns: ['Counting sides incorrectly', 'Guessing corners randomly'],

      ifStudentsLost: ['Trace one shape on the board and count sides together', 'Ask students to trace shapes in the air using fingers'],

      ifStudentsBored: ['Ask them to compare two shapes and say one difference', 'Let them quiz classmates on sides and corners'],

      successRate: 0.64, peerInsights: { count: 5, insight: 'Tracing and counting made properties explicit.' }, confidence: 0.69

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'shapes',

      situation: "Can't Visualize",

      whatBreaksHere: 'Students confuse drawings (2D) with real objects (3D).',

      earlyWarningSigns: ['Calling a ball a circle', 'Saying a book is a rectangle only'],

      ifStudentsLost: ['Hold a book and draw its face on the board', 'Say clearly: "This face is flat; the object is solid"'],

      ifStudentsBored: ['Ask them to list flat shapes on a solid object', 'Let them explain the difference in their own words'],

      successRate: 0.62, peerInsights: { count: 5, insight: 'Comparing flat faces to solid objects clarified 2D/3D.' }, confidence: 0.67

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'shapes',

      situation: 'Mixed Pace Classroom',

      whatBreaksHere: 'Same task doesn\'t suit all learning speeds.',

      earlyWarningSigns: ['Fast finishers start chatting', 'Slow learners stop trying'],

      ifStudentsLost: ['Pair a confident student with a struggling one', 'Reduce task to just one shape at a time'],

      ifStudentsBored: ['Ask them to draw a shape-based picture', 'Challenge them to create a new shape using lines'],

      successRate: 0.68, peerInsights: { count: 6, insight: 'Pairing and creative tasks engaged both ends.' }, confidence: 0.72

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'shapes',

      situation: 'Language Not Understood',

      whatBreaksHere: 'Math language is unfamiliar and abstract.',

      earlyWarningSigns: ['Blank looks when terms are used', 'Students copy answers without speaking'],

      ifStudentsLost: ['Use local language equivalents briefly', 'Point and touch corners and edges on real objects'],

      ifStudentsBored: ['Ask them to explain terms in their own language', 'Let them teach one word to the class'],

      successRate: 0.60, peerInsights: { count: 4, insight: 'Touching real shapes clarified terminology.' }, confidence: 0.65

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'shapes',

      situation: 'Activity Chaos',

      whatBreaksHere: 'Students enjoy materials but forget the math goal.',

      earlyWarningSigns: ['Noise increases', 'Objects used as toys, not learning tools'],

      ifStudentsLost: ['Pause activity and restate the goal clearly', 'Demonstrate one correct example'],

      ifStudentsBored: ['Assign them as "shape checkers"', 'Ask them to record findings on the board'],

      successRate: 0.63, peerInsights: { count: 5, insight: 'Clear goals and roles reduced chaos.' }, confidence: 0.68

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'shapes',

      situation: '2D vs 3D Properties Confusion',

      whatBreaksHere: 'Students don\'t separate 2D properties from 3D properties.',

      earlyWarningSigns: ['Saying a cube has 6 sides', 'Counting faces as corners'],

      ifStudentsLost: ['Write "Flat Shape" and "Solid Shape" headings', 'Sort properties together on the board'],

      ifStudentsBored: ['Ask them to correct wrong statements', 'Let them create one tricky question'],

      successRate: 0.64, peerInsights: { count: 5, insight: 'Explicit sorting clarified 2D vs 3D terms.' }, confidence: 0.68

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'shapes',

      situation: 'Drawing Skills Are Poor',

      whatBreaksHere: 'Motor control and shape properties aren\'t linked.',

      earlyWarningSigns: ['Crooked squares', 'Triangles with curved sides'],

      ifStudentsLost: ['Draw slowly step-by-step on the board', 'Ask students to draw along in the air'],

      ifStudentsBored: ['Challenge them to draw without lifting pencil', 'Ask them to improve one incorrect drawing'],

      successRate: 0.61, peerInsights: { count: 4, insight: 'Air-drawing practice improved motor skills.' }, confidence: 0.66

    }));



    prepCards.push(new PrepCard({

      subject: 'Maths', grade: 3, topicId: 'shapes',

      situation: 'Shapes Only Exist in Textbooks',

      whatBreaksHere: 'Learning stays abstract and textbook-bound.',

      earlyWarningSigns: ['"We only see shapes in maths" comments', 'Difficulty giving real examples'],

      ifStudentsLost: ['Walk around class pointing to shape examples', 'Ask students to name objects from home'],

      ifStudentsBored: ['Ask them to design a "shape room"', 'Let them draw a house using only shapes'],

      successRate: 0.63, peerInsights: { count: 5, insight: 'Real-world connections made shapes meaningful.' }, confidence: 0.67

    }));



    // ===== Grade 4 Maths (5 chapters x 9 cards) =====

    const grade4MathChapters = [

      {

        topicId: 'shapes_around_us',

        cards: [

          {

            situation: 'Prerequisite Gap - Basic Shapes Missing',

            whatBreaksHere: 'Students struggle to name or recognize basic 2D shapes while discussing buildings and models.',

            earlyWarningSigns: ['Students point randomly instead of naming shapes', 'Copying answers from the board without answering orally'],

            ifStudentsLost: ['Hold up classroom objects and ask only shape names', 'Draw four basic shapes on the board and do a quick oral revision'],

            ifStudentsBored: ['Ask them to find one object at home or school for each shape', 'Let them challenge peers by showing an object and asking its shape'],

            peerInsight: 'Quick concrete revision stabilizes shape recall.'

          },

          {

            situation: 'Conceptual Gap - 3D Properties Forgotten',

            whatBreaksHere: 'Students could name shapes earlier but get confused when sorting 3D shapes by faces, edges, or corners.',

            earlyWarningSigns: ['Wrong counts of faces or edges', 'Students change answers after seeing peers'],

            ifStudentsLost: ['Use one cube and physically count faces, edges, and corners together', 'Ask students to touch and count using fingers, not notebooks'],

            ifStudentsBored: ['Ask them to compare two shapes and say one difference', 'Let them check classmates\' counts and explain mistakes'],

            peerInsight: 'Hands-on counting rebuilt understanding of 3D properties.'

          },

          {

            situation: 'Cannot Visualize Nets',

            whatBreaksHere: 'Students cannot imagine how nets fold into solid shapes.',

            earlyWarningSigns: ['Students rotate notebooks repeatedly', 'They guess answers without folding or explaining'],

            ifStudentsLost: ['Tear a simple paper box and refold it slowly in front of class', 'Ask students to trace one face and predict what touches it'],

            ifStudentsBored: ['Ask them to design a new net for a cube', 'Let them test if classmates\' nets will fold correctly'],

            peerInsight: 'Live folding demonstrations clarified net-to-solid links.'

          },

          {

            situation: 'Mixed Pace Classroom - Shape Sorting',

            whatBreaksHere: 'Some students quickly finish shape-sorting tasks while others are still counting.',

            earlyWarningSigns: ['Early finishers start talking loudly', 'Slower students stop working and look around'],

            ifStudentsLost: ['Pair a fast student with a slow one for counting together', 'Reduce the task to one shape instead of all shapes'],

            ifStudentsBored: ['Give them a "spot the mistake" task on the board', 'Ask them to create a new sorting rule'],

            peerInsight: 'Peer pairing kept both fast and slow learners engaged.'

          },

          {

            situation: 'Language Not Understood - Faces and Edges',

            whatBreaksHere: 'Students do not understand words like face, edge, corner, curved, or flat.',

            earlyWarningSigns: ['Blank looks after instructions', 'Students repeat terms without pointing or showing'],

            ifStudentsLost: ['Use local language words with gestures', 'Relate terms to body parts like elbow for corners and ruler side for edges'],

            ifStudentsBored: ['Ask them to explain terms in their own words', 'Let them quiz others using classroom objects'],

            peerInsight: 'Gestures plus local language unlocked key vocabulary.'

          },

          {

            situation: 'Activity Chaos with Materials',

            whatBreaksHere: 'Hands-on activities with straws, clay, or boxes become noisy and disorganized.',

            earlyWarningSigns: ['Materials fall on the floor', 'Students argue over who uses what'],

            ifStudentsLost: ['Stop activity and demonstrate one shape step by step', 'Assign roles such as holder, counter, and checker'],

            ifStudentsBored: ['Ask them to build the same shape using fewer materials', 'Challenge them to find a stronger or more stable shape'],

            peerInsight: 'Clear roles calmed material-heavy activities.'

          },

          {

            situation: 'Confusing Prism and Pyramid',

            whatBreaksHere: 'Students mix up prisms and pyramids while naming or sorting.',

            earlyWarningSigns: ['Calling pyramids triangular prisms', 'Ignoring the top point of pyramids'],

            ifStudentsLost: ['Show that pyramids meet at one top point using fingers', 'Compare bases side by side on the board'],

            ifStudentsBored: ['Ask them to invent a quick rule to identify pyramids', 'Let them check classmates\' sorting'],

            peerInsight: 'Highlighting the single apex separated pyramids from prisms.'

          },

          {

            situation: 'Angle Type Confusion',

            whatBreaksHere: 'Students cannot correctly identify right, acute, and obtuse angles.',

            earlyWarningSigns: ['All angles marked as right angles', 'Frequent erasing and redrawing'],

            ifStudentsLost: ['Use a folded paper corner as a right-angle checker', 'Compare one angle directly with the paper corner'],

            ifStudentsBored: ['Ask them to find angles in classroom objects', 'Let them draw tricky angles for others to classify'],

            peerInsight: 'Concrete right-angle checkers anchored angle types.'

          },

          {

            situation: 'Circle Parts Misunderstood',

            whatBreaksHere: 'Students mix up radius, diameter, and centre of a circle.',

            earlyWarningSigns: ['Diameter drawn not passing through centre', 'Radius drawn longer than diameter'],

            ifStudentsLost: ['Fold a paper circle to show centre and diameter', 'Trace one fold and measure together'],

            ifStudentsBored: ['Ask them to compare wheels and rank by radius', 'Let them design a circle pattern marking all parts'],

            peerInsight: 'Paper folding made circle parts visible and accurate.'

          }

        ]

      },

      {

        topicId: 'hide_and_seek',

        cards: [

          {

            situation: 'Prerequisite Gap - Position Words',

            whatBreaksHere: 'Students struggle to understand basic position words like left, right, top, bottom, row, and column.',

            earlyWarningSigns: ['Students place objects in wrong grid boxes', 'They ask repeatedly "Which side?" or copy neighbours'],

            ifStudentsLost: ['Use classroom positions to revise left-right and front-back', 'Draw a simple 2x2 grid and label rows and columns aloud'],

            ifStudentsBored: ['Ask them to give position clues for objects in the class', 'Let them correct wrong clues given by others'],

            peerInsight: 'Anchoring words to classroom landmarks fixed position sense.'

          },

          {

            situation: 'Conceptual Gap - Views Not Linked to Objects',

            whatBreaksHere: 'Students identify views correctly in pictures but fail when drawing or matching views themselves.',

            earlyWarningSigns: ['Correct answers in discussion, wrong answers in written work', 'Random guessing in matching questions'],

            ifStudentsLost: ['Turn one object and show top, front, and side views physically', 'Ask students to stand and show the view with their hands'],

            ifStudentsBored: ['Ask them to draw two different views of the same object', 'Let peers guess which view it is'],

            peerInsight: 'Physical rotation connected drawings to real views.'

          },

          {

            situation: 'Cannot Visualize Different Views',

            whatBreaksHere: 'Students cannot imagine how the same object looks from different positions.',

            earlyWarningSigns: ['Students tilt their heads or books repeatedly', 'Confusion between top view and front view'],

            ifStudentsLost: ['Ask students to stand at different spots and describe what they see', 'Use a box on the table, then lift it to eye level'],

            ifStudentsBored: ['Ask them to describe how the classroom looks from the roof', 'Let them challenge others with "guess the view" questions'],

            peerInsight: 'Changing physical positions improved mental rotation.'

          },

          {

            situation: 'Mixed Pace Classroom - Grid Paths',

            whatBreaksHere: 'Some students quickly solve grid paths while others struggle to move step by step.',

            earlyWarningSigns: ['Fast students finish early and talk', 'Slow students freeze after the first move'],

            ifStudentsLost: ['Reduce task to fewer steps or a smaller grid', 'Pair students to say moves aloud together'],

            ifStudentsBored: ['Ask them to find the shortest path', 'Challenge them to find two different paths'],

            peerInsight: 'Paired verbal steps balanced speed differences.'

          },

          {

            situation: 'Language Not Understood - Clues and Views',

            whatBreaksHere: 'Students do not follow clues because words like view, scene, row, and column confuse them.',

            earlyWarningSigns: ['Students wait instead of starting', 'They repeat the clue without acting'],

            ifStudentsLost: ['Translate key words into local language with gestures', 'Use arrows and labels while explaining'],

            ifStudentsBored: ['Ask them to explain clues in simpler words', 'Let them create clues for classmates'],

            peerInsight: 'Gestures and arrows clarified grid language quickly.'

          },

          {

            situation: 'Activity Chaos - Grid Games',

            whatBreaksHere: 'Grid games and movement activities become noisy and unstructured.',

            earlyWarningSigns: ['Multiple students shout directions', 'Objects are moved randomly'],

            ifStudentsLost: ['Pause the game and restate rules clearly', 'Assign roles such as speaker, mover, and checker'],

            ifStudentsBored: ['Add a rule like "exact number of steps only"', 'Let them design a fair rule for the game'],

            peerInsight: 'Role clarity kept grid activities orderly.'

          },

          {

            situation: 'Top View vs Front View Confusion',

            whatBreaksHere: 'Students mix up top view and front view of objects like bricks or chairs.',

            earlyWarningSigns: ['Same drawing given for different views', 'Top view drawn with height details'],

            ifStudentsLost: ['Ask students to imagine a bird and a standing person', 'Place an object on the floor and look at it from above together'],

            ifStudentsBored: ['Ask them to draw the view from "ant level"', 'Let them judge which drawing matches which view'],

            peerInsight: 'Perspective cues (bird vs person) clarified views.'

          },

          {

            situation: 'Grid Direction Errors',

            whatBreaksHere: 'Students move diagonally or miscount steps in grid games.',

            earlyWarningSigns: ['Diagonal arrows drawn', 'Final position off by one square'],

            ifStudentsLost: ['Physically walk a grid drawn on the floor', 'Say each step aloud while moving'],

            ifStudentsBored: ['Ask them to spot illegal moves', 'Challenge them to reach the target in exact steps'],

            peerInsight: 'Floor grids made step counting concrete.'

          },

          {

            situation: 'Map Reading Confusion',

            whatBreaksHere: 'Students struggle to trace routes on the school sight map.',

            earlyWarningSigns: ['Random lines drawn across buildings', 'Shortest route chosen without explanation'],

            ifStudentsLost: ['Start from a familiar place and trace slowly', 'Name each turn aloud: left, right, straight'],

            ifStudentsBored: ['Ask them to find two different routes', 'Let them explain why one route is shorter'],

            peerInsight: 'Anchoring maps to known locations improved tracing.'

          }

        ]

      },

      {

        topicId: 'patterns_around_us',

        cards: [

          {

            situation: 'Prerequisite Gap - Counting and Grouping',

            whatBreaksHere: 'Students struggle with basic counting beyond 20 and lose track while counting many objects.',

            earlyWarningSigns: ['Students count one by one even in clear groups', 'Different answers for the same picture'],

            ifStudentsLost: ['Ask students to circle groups of 5 or 10 before counting', 'Count aloud together using claps or finger taps'],

            ifStudentsBored: ['Ask them to suggest a faster counting method', 'Let them explain their grouping to the class'],

            peerInsight: 'Grouping into fives or tens stabilized large counts.'

          },

          {

            situation: 'Conceptual Gap - Repeated Arrangements Missed',

            whatBreaksHere: 'Students count correctly at first but make mistakes when trays or layers are stacked.',

            earlyWarningSigns: ['Forgetting to multiply by number of trays', 'Counting the same tray multiple times'],

            ifStudentsLost: ['Focus on one tray and count items clearly', 'Ask "How many such trays are there?" before total counting'],

            ifStudentsBored: ['Ask them to predict the total before counting', 'Challenge them to check if prediction was correct'],

            peerInsight: 'Separating one unit then multiplying reduced recounting errors.'

          },

          {

            situation: 'Cannot Visualize Pattern Units',

            whatBreaksHere: 'Students cannot imagine the top view or repeated arrangement in patterns.',

            earlyWarningSigns: ['Students rotate the book to understand the picture', 'Confusion between single item count and pattern count'],

            ifStudentsLost: ['Draw one small pattern unit on the board', 'Repeat the unit side by side and count together'],

            ifStudentsBored: ['Ask them to draw the next pattern themselves', 'Let them explain what stays the same in the pattern'],

            peerInsight: 'Highlighting the repeating unit improved visualization.'

          },

          {

            situation: 'Mixed Pace Classroom - Pattern Work',

            whatBreaksHere: 'Some students quickly identify patterns while others are stuck on counting.',

            earlyWarningSigns: ['Fast students finish and distract others', 'Slow students stop attempting'],

            ifStudentsLost: ['Reduce the task to fewer objects first', 'Pair students to count and discuss together'],

            ifStudentsBored: ['Ask them to create a similar pattern with a different number', 'Let them challenge peers with a new pattern'],

            peerInsight: 'Pair counting and creation tasks balanced pace gaps.'

          },

          {

            situation: 'Language Not Understood - Pattern Words',

            whatBreaksHere: 'Students do not understand words like pattern, arrangement, pair, even, or odd.',

            earlyWarningSigns: ['Students repeat terms without explanation', 'Silence during "why" questions'],

            ifStudentsLost: ['Use real objects to show pairs and leftovers', 'Say terms in local language along with English'],

            ifStudentsBored: ['Ask them to explain even-odd in their own words', 'Let them teach one example to the class'],

            peerInsight: 'Concrete pairing fixed even-odd confusion.'

          },

          {

            situation: 'Activity Chaos - Counting Materials',

            whatBreaksHere: 'Hands-on counting with coins or objects becomes noisy and disordered.',

            earlyWarningSigns: ['Objects scattered on desks', 'Arguments over counting order'],

            ifStudentsLost: ['Stop activity and demonstrate one clear method', 'Assign roles: arranger, counter, checker'],

            ifStudentsBored: ['Ask them to find a neater arrangement', 'Challenge them to count without touching objects'],

            peerInsight: 'Simple roles kept counting tasks tidy.'

          },

          {

            situation: 'Even/Odd Rule Confusion',

            whatBreaksHere: 'Students misclassify numbers as even or odd without checking pairs.',

            earlyWarningSigns: ['Random guessing of even or odd', 'Wrong answers for larger numbers like 154 or 300'],

            ifStudentsLost: ['Make pairs using counters or fingers', 'Ask "Is anyone left without a pair?"'],

            ifStudentsBored: ['Ask them to test very big numbers quickly', 'Let them explain shortcuts they notice'],

            peerInsight: 'Pairing objects grounded even/odd decisions.'

          },

          {

            situation: 'Money Pattern Counting Errors',

            whatBreaksHere: 'Students miscount money when coins and notes are arranged in patterns.',

            earlyWarningSigns: ['Counting coins but ignoring denominations', 'Adding wrong totals'],

            ifStudentsLost: ['Count value of one group first', 'Repeat the value for each similar group'],

            ifStudentsBored: ['Ask them to create a new money pattern', 'Let peers calculate its value'],

            peerInsight: 'Separating value from number fixed money totals.'

          },

          {

            situation: 'Pattern Generalisation Difficulty',

            whatBreaksHere: 'Students struggle to state rules like "before and after an odd number".',

            earlyWarningSigns: ['Answers based only on one example', 'Inability to explain "why"'],

            ifStudentsLost: ['Write five consecutive numbers and mark even and odd', 'Ask guiding questions instead of giving rules'],

            ifStudentsBored: ['Ask them to test the rule with new numbers', 'Let them invent a number pattern and rule'],

            peerInsight: 'Guided questioning helped students form rules.'

          }

        ]

      },

      {

        topicId: 'thousands_around_us',

        cards: [

          {

            situation: 'Prerequisite Gap - Place Value Up to Hundreds',

            whatBreaksHere: 'Students are unsure about place value beyond hundreds and mix up tens, hundreds, and thousands.',

            earlyWarningSigns: ['Writing 724 for "7 thousand 2 tens 4 ones"', 'Counting thousands as single units'],

            ifStudentsLost: ['Revise H-T-O using simple two or three digit examples orally', 'Build 1000 using groups of 100 on the board'],

            ifStudentsBored: ['Ask them to correct a wrong number written on the board', 'Let them explain place value using their own example'],

            peerInsight: 'Quick HTO revision stabilised four-digit numbers.'

          },

          {

            situation: 'Conceptual Gap - Expanding Four-Digit Numbers',

            whatBreaksHere: 'Students can read 4-digit numbers but fail when breaking them into thousands, hundreds, tens, and ones.',

            earlyWarningSigns: ['Correct reading, wrong expanded form', 'Errors while regrouping such as 12 hundreds confusion'],

            ifStudentsLost: ['Write one number and expand it step by step together', 'Use "What does this digit stand for?" questioning'],

            ifStudentsBored: ['Ask them to give two different expanded forms for the same number', 'Challenge them with tricky numbers having zeros'],

            peerInsight: 'Stepwise expansion anchored digit meaning.'

          },

          {

            situation: 'Cannot Visualize 1000 as Quantity',

            whatBreaksHere: 'Students cannot imagine 1000 as a quantity and treat it as just a big number.',

            earlyWarningSigns: ['Guessing answers for "how many more to make 1000"', 'Confusion in regrouping tasks'],

            ifStudentsLost: ['Draw blocks showing 10 hundreds equal 1000', 'Use number line jumps to reach 1000'],

            ifStudentsBored: ['Ask them to estimate real-life quantities near 1000', 'Let them design a picture showing 1000 objects grouped'],

            peerInsight: 'Visual blocks and number lines made 1000 tangible.'

          },

          {

            situation: 'Mixed Pace Classroom - Four-Digit Numbers',

            whatBreaksHere: 'Some students finish number tasks quickly while others struggle with basic formation.',

            earlyWarningSigns: ['Early finishers get restless', 'Slow learners stop writing midway'],

            ifStudentsLost: ['Reduce the task to one digit change at a time', 'Pair strong and weak students for oral checking'],

            ifStudentsBored: ['Ask them to form the biggest or smallest number with conditions', 'Let them verify classmates\' work'],

            peerInsight: 'Small-step changes and peer checks balanced the class.'

          },

          {

            situation: 'Language Not Understood - Place Value Terms',

            whatBreaksHere: 'Students get confused by terms like expanded form, regrouping, increase, or decrease.',

            earlyWarningSigns: ['Students ask what the question means', 'Wrong operation chosen'],

            ifStudentsLost: ['Rephrase questions in simple spoken language', 'Act out increase and decrease with number jumps'],

            ifStudentsBored: ['Ask them to reframe the question in their own words', 'Let them give oral instructions to peers'],

            peerInsight: 'Simpler language reduced place-value errors.'

          },

          {

            situation: 'Activity Chaos - Place Value Materials',

            whatBreaksHere: 'Hands-on activities with tokens or sliders become messy and noisy.',

            earlyWarningSigns: ['Tokens mixed up', 'Students argue over turns'],

            ifStudentsLost: ['Demonstrate once before distributing materials', 'Assign roles such as builder, reader, and checker'],

            ifStudentsBored: ['Add a time limit challenge', 'Ask them to create a number others must build'],

            peerInsight: 'Clear demonstration kept manipulatives purposeful.'

          },

          {

            situation: 'Zero as Placeholder Confusion',

            whatBreaksHere: 'Students ignore zeros while reading or writing 4-digit numbers.',

            earlyWarningSigns: ['Writing 563 instead of 5063', 'Skipping zeros in expanded form'],

            ifStudentsLost: ['Show how zero keeps the place empty, not removed', 'Compare numbers with and without zero side by side'],

            ifStudentsBored: ['Ask them to create numbers where zero changes value greatly', 'Let them spot zero mistakes on the board'],

            peerInsight: 'Side-by-side comparisons clarified the role of zero.'

          },

          {

            situation: 'Number Line Misplacement',

            whatBreaksHere: 'Students mark 4-digit numbers incorrectly on number lines.',

            earlyWarningSigns: ['Numbers bunched together randomly', 'Ignoring hundreds or thousands gaps'],

            ifStudentsLost: ['Mark start and end points clearly first', 'Count jumps aloud before placing the number'],

            ifStudentsBored: ['Ask them to check others\' placements', 'Challenge them with closer numbers to place'],

            peerInsight: 'Counting jumps aloud fixed spacing errors.'

          },

          {

            situation: 'Comparing Large Numbers Error',

            whatBreaksHere: 'Students compare numbers using last digits instead of place value.',

            earlyWarningSigns: ['Saying 3012 > 3102 because 12 > 02', 'Comparing from ones place first'],

            ifStudentsLost: ['Force comparison starting from thousands place', 'Use Th-H-T-O table for each number'],

            ifStudentsBored: ['Ask them to invent a comparison trick', 'Let them explain why a comparison is wrong'],

            peerInsight: 'Table-based comparison enforced place value order.'

          }

        ]

      },

      {

        topicId: 'how_heavy_how_light',

        cards: [

          {

            situation: 'Prerequisite Gap - Heavier or Lighter',

            whatBreaksHere: 'Students cannot compare objects correctly using terms like heavier and lighter.',

            earlyWarningSigns: ['Saying a big empty box is heavier than a small stone', 'Random answers without lifting or reasoning'],

            ifStudentsLost: ['Ask students to lift two classroom objects and compare', 'Use simple oral questions such as "Which needs more effort to lift?"'],

            ifStudentsBored: ['Ask them to predict weight before lifting', 'Let them justify their prediction'],

            peerInsight: 'Concrete lifting anchored heavy-light language.'

          },

          {

            situation: 'Conceptual Gap - Ordering Three Objects',

            whatBreaksHere: 'Students compare two objects correctly but fail when three or more objects are involved.',

            earlyWarningSigns: ['Correct pair comparison, wrong full ordering', 'Changing answers after seeing others'],

            ifStudentsLost: ['Compare objects two at a time first', 'Place them in order step by step on a desk'],

            ifStudentsBored: ['Ask them to explain why one object comes in the middle', 'Let them check and correct classmates\' order'],

            peerInsight: 'Stepwise ordering clarified multi-object comparisons.'

          },

          {

            situation: 'Cannot Visualize Balance',

            whatBreaksHere: 'Students cannot imagine balance situations without seeing a scale.',

            earlyWarningSigns: ['Guessing answers in balance pictures', 'Ignoring one side of the scale'],

            ifStudentsLost: ['Act like a balance using both hands', 'Draw a simple balance and add objects one by one'],

            ifStudentsBored: ['Ask them to invent a balance puzzle', 'Let them predict outcomes before drawing'],

            peerInsight: 'Acting as a balance made equality concrete.'

          },

          {

            situation: 'Mixed Pace Classroom - Weight Tasks',

            whatBreaksHere: 'Some students finish weight comparison quickly while others are confused.',

            earlyWarningSigns: ['Early finishers talk or distract', 'Slow learners stop attempting'],

            ifStudentsLost: ['Reduce task to two objects only', 'Pair students for discussion before answering'],

            ifStudentsBored: ['Ask them to create a tricky comparison', 'Let them verify others\' answers'],

            peerInsight: 'Pair-checking kept everyone working.'

          },

          {

            situation: 'Language Not Understood - Heavier, Lighter, Equal',

            whatBreaksHere: 'Students confuse terms like heavier, lighter, equal, and balance.',

            earlyWarningSigns: ['Students misuse terms interchangeably', 'Silence during explanation questions'],

            ifStudentsLost: ['Use gestures and local language words', 'Link words to actions like lifting and balancing repeatedly'],

            ifStudentsBored: ['Ask them to explain terms using examples', 'Let them quiz classmates'],

            peerInsight: 'Gestures plus examples fixed weight vocabulary.'

          },

          {

            situation: 'Activity Chaos - Weighing',

            whatBreaksHere: 'Hands-on weighing activities become noisy and unstructured.',

            earlyWarningSigns: ['Objects passed around randomly', 'Arguments during comparison'],

            ifStudentsLost: ['Demonstrate one comparison clearly', 'Assign roles such as holder, comparer, and reporter'],

            ifStudentsBored: ['Add a rule like "no lifting twice"', 'Challenge them to solve silently'],

            peerInsight: 'Roles and one demo kept weighing tasks orderly.'

          },

          {

            situation: 'Size vs Weight Confusion',

            whatBreaksHere: 'Students assume bigger objects are always heavier.',

            earlyWarningSigns: ['Wrong answers for hollow versus solid objects', 'Justifications based only on size'],

            ifStudentsLost: ['Compare a large empty box and a small stone', 'Ask students to explain the surprise'],

            ifStudentsBored: ['Ask them to find more such examples', 'Let them design a trick question'],

            peerInsight: 'Contrasting hollow and solid objects broke the size rule.'

          },

          {

            situation: 'Balance Equality Misunderstood',

            whatBreaksHere: 'Students think balanced scales mean one side is heavier.',

            earlyWarningSigns: ['Saying "both sides are heavy" instead of equal', 'Marking wrong option in balance pictures'],

            ifStudentsLost: ['Show balance with hands staying level', 'Use the simple statement "same weight on both sides"'],

            ifStudentsBored: ['Ask them to draw a balanced scale', 'Let them explain equality in their own words'],

            peerInsight: 'Simple language reinforced the idea of equality.'

          },

          {

            situation: 'Indirect Comparison Difficulty',

            whatBreaksHere: 'Students struggle when comparing weights using a third object.',

            earlyWarningSigns: ['Random answers in indirect comparison questions', 'Ignoring given clues'],

            ifStudentsLost: ['Compare A with C, then B with C aloud', 'Guide students to conclude A vs B'],

            ifStudentsBored: ['Ask them to create an indirect comparison puzzle', 'Let peers solve and explain reasoning'],

            peerInsight: 'Explicit A-C-B steps clarified indirect comparisons.'

          }

        ]

      }

    ];



    grade4MathChapters.forEach(({ topicId, cards }) => {

      cards.forEach(card => {

        prepCards.push(makeCard('Maths', 4, topicId, card.situation, card.whatBreaksHere, card.earlyWarningSigns, card.ifStudentsLost, card.ifStudentsBored, card.peerInsight));

      });

    });



    // ===== Grade 4 EVS (5 chapters x 9 cards) =====

    const grade4EvsChapters = [

      {

        topicId: 'living_together',

        cards: [

          {

            situation: 'Prerequisite Gap - Community Meaning',

            whatBreaksHere: 'Students do not understand what a community means beyond family.',

            earlyWarningSigns: ['Students name only family members', 'Blank responses for public places'],

            ifStudentsLost: ['Ask students to name places they visit daily such as school, shop, or park', 'Link each place to people who work there'],

            ifStudentsBored: ['Ask them to compare family versus community roles', 'Let them explain who helps them outside home'],

            peerInsight: 'Connecting places to people clarified community.'

          },

          {

            situation: 'Conceptual Gap - Interdependence Missing',

            whatBreaksHere: 'Students list people correctly but fail to explain connections between them.',

            earlyWarningSigns: ['One-word answers', 'Repeating textbook lines without examples'],

            ifStudentsLost: ['Ask "What happens if this person is not there?"', 'Use daily examples like shopkeeper and customer'],

            ifStudentsBored: ['Ask them to create a chain of helpers', 'Let them find missing links in a chain'],

            peerInsight: 'Problem questions revealed interdependence quickly.'

          },

          {

            situation: 'Cannot Visualize Locality Connections',

            whatBreaksHere: 'Students cannot imagine how people and places are connected in a locality.',

            earlyWarningSigns: ['Confusion during picture-based questions', 'Random listing of places'],

            ifStudentsLost: ['Use the village picture and point place by place', 'Draw a simple map of school surroundings'],

            ifStudentsBored: ['Ask them to add one missing place to the map', 'Let them explain its role'],

            peerInsight: 'Simple maps helped students see locality links.'

          },

          {

            situation: 'Mixed Pace Classroom - Sharing Examples',

            whatBreaksHere: 'Some students share many examples while others remain silent.',

            earlyWarningSigns: ['Same few students answering', 'Others avoiding eye contact'],

            ifStudentsLost: ['Use pair discussion before answering', 'Allow oral responses instead of written first'],

            ifStudentsBored: ['Ask them to compare village and city communities', 'Let them help slower peers'],

            peerInsight: 'Pair talk lifted quieter students into the discussion.'

          },

          {

            situation: 'Language Not Understood - Locality Words',

            whatBreaksHere: 'Students do not understand words like locality, cooperation, or contribution.',

            earlyWarningSigns: ['Students copy answers without understanding', 'Asking what the word means repeatedly'],

            ifStudentsLost: ['Replace words with simple daily language', 'Use actions or role-play to explain'],

            ifStudentsBored: ['Ask them to explain terms in their own words', 'Let them make a sentence using the word'],

            peerInsight: 'Role-play plus simpler words fixed vocabulary gaps.'

          },

          {

            situation: 'Activity Chaos - Posters and Discussions',

            whatBreaksHere: 'Poster making or group discussions become noisy and unfocused.',

            earlyWarningSigns: ['Too many students crowding one chart', 'Arguments over materials'],

            ifStudentsLost: ['Assign clear roles such as drawer, writer, and speaker', 'Give one instruction at a time'],

            ifStudentsBored: ['Add a challenge like "one idea per person"', 'Let them evaluate another group\'s work'],

            peerInsight: 'Roles and single instructions kept group work calm.'

          },

          {

            situation: 'Public Place Ownership Confusion',

            whatBreaksHere: 'Students think public places belong to the government, not people.',

            earlyWarningSigns: ['Saying "not our work" for cleanliness', 'Ignoring damage to public property'],

            ifStudentsLost: ['Ask who uses the park or school daily', 'Connect use with responsibility'],

            ifStudentsBored: ['Ask them to list ways children can help', 'Let them design a care rule'],

            peerInsight: 'Linking use to care built shared ownership.'

          },

          {

            situation: 'Festival Seen Only as Celebration',

            whatBreaksHere: 'Students miss the idea of cooperation in festivals like Van Mahotsav.',

            earlyWarningSigns: ['Only food and celebration mentioned', 'Ignoring planning and roles'],

            ifStudentsLost: ['List tasks done before celebration', 'Match each task to a person'],

            ifStudentsBored: ['Ask them to plan a small event', 'Let them assign roles'],

            peerInsight: 'Planning tasks revealed teamwork in festivals.'

          },

          {

            situation: 'Help as Charity Only',

            whatBreaksHere: 'Students think helping others is optional kindness, not mutual support.',

            earlyWarningSigns: ['Saying "only poor people need help"', 'No examples of giving and receiving'],

            ifStudentsLost: ['Use examples where everyone benefits such as bridges or parks', 'Ask who gains from cooperation'],

            ifStudentsBored: ['Ask them to find examples from school', 'Let them explain how teamwork helped them'],

            peerInsight: 'Mutual-benefit examples reframed helping as shared need.'

          }

        ]

      },

      {

        topicId: 'exploring_neighbourhood',

        cards: [

          {

            situation: 'Prerequisite Gap - Places and Purposes',

            whatBreaksHere: 'Students cannot clearly identify common neighbourhood places and their purposes.',

            earlyWarningSigns: ['Mixing up hospital, bank, and post office roles', 'Giving one-word answers without explanation'],

            ifStudentsLost: ['Name one place and ask "Why do people go here?"', 'Match place cards with service cards on the board'],

            ifStudentsBored: ['Ask them to name places not shown in the book', 'Let them explain how they use these places'],

            peerInsight: 'Place-to-purpose matching anchored understanding.'

          },

          {

            situation: 'Conceptual Gap - Role of Services',

            whatBreaksHere: 'Students list neighbourhood places but fail to explain how they help the community.',

            earlyWarningSigns: ['Copying answers from the book', 'Silence when asked "how does it help?"'],

            ifStudentsLost: ['Ask "What problem will happen if this place is closed?"', 'Use daily-life examples such as no hospital or no bank'],

            ifStudentsBored: ['Ask them to compare two places and their roles', 'Let them explain which is more important and why'],

            peerInsight: 'Problem scenarios showed why services matter.'

          },

          {

            situation: 'Cannot Visualize the Neighbourhood as a Whole',

            whatBreaksHere: 'Students cannot imagine the neighbourhood as a connected area.',

            earlyWarningSigns: ['Random placement in maps', 'Confusion in picture-based questions'],

            ifStudentsLost: ['Draw a simple neighbourhood map starting from school', 'Add places one by one with direction words'],

            ifStudentsBored: ['Ask them to add one missing place to the map', 'Let them explain its location'],

            peerInsight: 'Building the map together clarified connected places.'

          },

          {

            situation: 'Mixed Pace Classroom - Sharing Experiences',

            whatBreaksHere: 'Some students share many experiences while others remain silent.',

            earlyWarningSigns: ['Same students answering repeatedly', 'Others avoiding participation'],

            ifStudentsLost: ['Use think-pair-share before open discussion', 'Accept oral answers instead of written first'],

            ifStudentsBored: ['Ask them to help quieter students respond', 'Give comparison tasks such as village versus city'],

            peerInsight: 'Structured sharing brought quieter voices in.'

          },

          {

            situation: 'Language Not Understood - Neighbourhood Terms',

            whatBreaksHere: 'Students do not understand words like neighbourhood, services, facilities, or connectivity.',

            earlyWarningSigns: ['Asking meanings repeatedly', 'Correct copying but wrong explanations'],

            ifStudentsLost: ['Replace words with simple spoken language', 'Explain using examples from their street'],

            ifStudentsBored: ['Ask them to explain words in their own language', 'Let them make one sentence per word'],

            peerInsight: 'Local examples clarified new terms quickly.'

          },

          {

            situation: 'Activity Chaos - Map Drawing',

            whatBreaksHere: 'Map drawing and group discussions become noisy and unfocused.',

            earlyWarningSigns: ['Overcrowding one chart', 'Students arguing about directions'],

            ifStudentsLost: ['Demonstrate one full example first', 'Assign clear roles such as drawer, guide, and checker'],

            ifStudentsBored: ['Add a challenge like "use only landmarks"', 'Let them review another group\'s map'],

            peerInsight: 'One demo and roles kept mapping sessions calm.'

          },

          {

            situation: 'Communication Past vs Present Confusion',

            whatBreaksHere: 'Students mix up older and modern ways of communication.',

            earlyWarningSigns: ['Saying internet existed earlier', 'Wrong examples in comparison table'],

            ifStudentsLost: ['Draw two columns: earlier and now', 'Place examples like letters, phone, and internet correctly'],

            ifStudentsBored: ['Ask them to predict future communication methods', 'Let them justify changes'],

            peerInsight: 'Timelines clarified old versus new communication.'

          },

          {

            situation: 'Direction Sense Confusion',

            whatBreaksHere: 'Students confuse north, south, east, and west while reading maps.',

            earlyWarningSigns: ['Random direction answers', 'Inverted maps'],

            ifStudentsLost: ['Use classroom directions such as board equals north', 'Practice with simple "what is on your left or right?" questions'],

            ifStudentsBored: ['Ask them to give directions to a friend verbally', 'Let them correct wrong direction statements'],

            peerInsight: 'Real classroom compass points fixed direction sense.'

          },

          {

            situation: 'Development vs Environment Misunderstanding',

            whatBreaksHere: 'Students think development always harms nature.',

            earlyWarningSigns: ['Saying "metros are bad"', 'Ignoring tree-planting solutions'],

            ifStudentsLost: ['Discuss one good and one bad effect together', 'Ask how damage can be reduced'],

            ifStudentsBored: ['Ask them to suggest eco-friendly changes', 'Let them design a "green neighbourhood" idea'],

            peerInsight: 'Balancing pros and cons reframed development discussions.'

          }

        ]

      },

      {

        topicId: 'nature_trail',

        cards: [

          {

            situation: 'Prerequisite Gap - Identifying Nearby Living Things',

            whatBreaksHere: 'Students cannot identify common animals, birds, or plants around them.',

            earlyWarningSigns: ['Naming only textbook examples', 'Confusing birds with animals'],

            ifStudentsLost: ['Ask students to name animals they see near home or school', 'Show one picture and identify features together'],

            ifStudentsBored: ['Ask them to name rare or less-seen animals', 'Let them share one interesting fact they know'],

            peerInsight: 'Local naming warmed up observation skills.'

          },

          {

            situation: 'Conceptual Gap - Features Not Explained',

            whatBreaksHere: 'Students list animals but fail to explain their features or uses.',

            earlyWarningSigns: ['Same feature written for many animals', 'Copying from examples without change'],

            ifStudentsLost: ['Ask "How does this body part help the animal?"', 'Compare two animals side by side'],

            ifStudentsBored: ['Ask them to guess the animal from a feature', 'Let them quiz classmates'],

            peerInsight: 'Feature-to-function questions deepened thinking.'

          },

          {

            situation: 'Cannot Visualize Forest Life',

            whatBreaksHere: 'Students cannot imagine forest life, food habits, or movement of animals.',

            earlyWarningSigns: ['Random answers in picture-based questions', 'Confusion during classification tasks'],

            ifStudentsLost: ['Describe one scene slowly such as pond, trees, and birds', 'Act out movements like flying, hopping, or swimming'],

            ifStudentsBored: ['Ask them to draw one forest scene', 'Let them explain what is happening in it'],

            peerInsight: 'Story scenes plus actions built mental pictures.'

          },

          {

            situation: 'Mixed Pace Classroom - Nature Observations',

            whatBreaksHere: 'Some students eagerly share observations while others stay silent.',

            earlyWarningSigns: ['Same students answering repeatedly', 'Others avoiding participation'],

            ifStudentsLost: ['Use pair discussion before whole-class answers', 'Accept oral answers without writing first'],

            ifStudentsBored: ['Ask them to help frame questions', 'Let them guide group discussions'],

            peerInsight: 'Peer question-making engaged quieter students.'

          },

          {

            situation: 'Language Not Understood - Habitat and Features',

            whatBreaksHere: 'Students do not understand words like habitat, features, or interdependence.',

            earlyWarningSigns: ['Repeating words without explanation', 'Wrong answers despite reading'],

            ifStudentsLost: ['Replace words with simple daily language', 'Explain using gestures and real examples'],

            ifStudentsBored: ['Ask them to explain terms in their own words', 'Let them make a sentence using the word'],

            peerInsight: 'Simpler wording plus gestures unlocked concepts.'

          },

          {

            situation: 'Activity Chaos - Nature Walk Tasks',

            whatBreaksHere: 'Nature walk discussions, drawing, or role-play become noisy and unfocused.',

            earlyWarningSigns: ['Students crowding one activity', 'Arguments over turns or materials'],

            ifStudentsLost: ['Demonstrate one activity step by step', 'Assign clear roles such as observer, writer, and speaker'],

            ifStudentsBored: ['Add a challenge like "observe quietly for one minute"', 'Let them evaluate another group\'s work'],

            peerInsight: 'Role clarity kept nature activities purposeful.'

          },

          {

            situation: 'Forest Rules Seen as Restrictions',

            whatBreaksHere: 'Students see safety rules as unnecessary restrictions.',

            earlyWarningSigns: ['Saying "rules are too many"', 'Joking about teasing animals'],

            ifStudentsLost: ['Ask what could go wrong without rules', 'Link rules to safety of animals and people'],

            ifStudentsBored: ['Ask them to create one new forest rule', 'Let them explain why it is needed'],

            peerInsight: 'Discussing consequences built respect for rules.'

          },

          {

            situation: 'Footprint Guessing Without Evidence',

            whatBreaksHere: 'Students guess animals from footprints without observing clues.',

            earlyWarningSigns: ['Random animal names given', 'No explanation for guesses'],

            ifStudentsLost: ['Compare size and shape of footprints together', 'Match footprints with animal size'],

            ifStudentsBored: ['Ask them to design a footprint clue', 'Let peers guess using reasoning'],

            peerInsight: 'Size and shape matching improved footprint inference.'

          },

          {

            situation: 'Web of Life Treated as Game Only',

            whatBreaksHere: 'Students enjoy the game but miss the idea of interdependence.',

            earlyWarningSigns: ['Laughing when web breaks', 'Unable to explain what it shows'],

            ifStudentsLost: ['Pause game and ask what happens when one is removed', 'Relate example to real animals and plants'],

            ifStudentsBored: ['Ask them to create a new web connection', 'Let them explain what will happen if it breaks'],

            peerInsight: 'Reflecting after the game made interdependence clear.'

          }

        ]

      },

      {

        topicId: 'growing_up_with_nature',

        cards: [

          {

            situation: 'Prerequisite Gap - Nature in Daily Life',

            whatBreaksHere: 'Students cannot relate natural materials and practices to daily village life.',

            earlyWarningSigns: ['Students name modern materials only like plastic or cement', 'Confusion about why clay, hay, or leaves are used'],

            ifStudentsLost: ['Ask what houses or items elders used earlier', 'Show pictures and identify material and use together'],

            ifStudentsBored: ['Ask them to compare natural versus factory-made items', 'Let them explain one advantage of natural materials'],

            peerInsight: 'Linking to elders\' practices grounded the topic.'

          },

          {

            situation: 'Conceptual Gap - Stories Without Reasoning',

            whatBreaksHere: 'Students enjoy stories but fail to explain why traditional practices are useful.',

            earlyWarningSigns: ['Repeating story lines without explanation', 'Silence when asked "why is this done?"'],

            ifStudentsLost: ['Ask "What problem does this practice solve?"', 'Link practice to benefit like cool house or pest control'],

            ifStudentsBored: ['Ask them to find hidden benefits in one practice', 'Let them challenge others with "why" questions'],

            peerInsight: 'Problem-benefit links turned stories into reasoning.'

          },

          {

            situation: 'Cannot Visualize Village Settings',

            whatBreaksHere: 'Students cannot imagine village settings, forest paths, or traditional homes.',

            earlyWarningSigns: ['Random drawings not matching description', 'Confusion in picture-based questions'],

            ifStudentsLost: ['Describe the scene slowly such as trees, huts, and animals', 'Draw a simple village sketch step by step'],

            ifStudentsBored: ['Ask them to add one missing natural element', 'Let them explain its role'],

            peerInsight: 'Stepwise sketches made rural scenes vivid.'

          },

          {

            situation: 'Mixed Pace Classroom - Sharing Traditions',

            whatBreaksHere: 'Some students share many examples from elders while others have none.',

            earlyWarningSigns: ['Same students answering repeatedly', 'Others saying "I do not know"'],

            ifStudentsLost: ['Allow examples from stories or neighbours, not only family', 'Use pair discussion before sharing'],

            ifStudentsBored: ['Ask them to help collect examples from peers', 'Let them organise answers on the board'],

            peerInsight: 'Pair collection spread traditional examples evenly.'

          },

          {

            situation: 'Language Not Understood - Traditional Terms',

            whatBreaksHere: 'Students do not understand words like extract, preserve, ritual, or sacred.',

            earlyWarningSigns: ['Students copy terms without explanation', 'Wrong usage in sentences'],

            ifStudentsLost: ['Replace words with simple phrases such as save food or respect place', 'Use actions or examples while explaining'],

            ifStudentsBored: ['Ask them to explain words in their own language', 'Let them make a short example for each word'],

            peerInsight: 'Simpler phrases plus examples fixed vocabulary.'

          },

          {

            situation: 'Activity Chaos - Material Tasks',

            whatBreaksHere: 'Model-making, dye preparation, or group tasks become messy and noisy.',

            earlyWarningSigns: ['Materials wasted or mixed', 'Students crowding one group'],

            ifStudentsLost: ['Demonstrate one full step before starting', 'Assign roles such as collector, maker, and cleaner'],

            ifStudentsBored: ['Add a condition like "use only three materials"', 'Let them judge which model uses nature best'],

            peerInsight: 'Clear steps and roles reduced mess in material work.'

          },

          {

            situation: 'Traditional Knowledge Seen as Old-Fashioned',

            whatBreaksHere: 'Students think modern products are always better than traditional ones.',

            earlyWarningSigns: ['Laughing at clay houses or neem oil', 'Rejecting traditional methods quickly'],

            ifStudentsLost: ['Compare cost, availability, and usefulness side by side', 'Ask when modern items may fail such as no electricity'],

            ifStudentsBored: ['Ask them to find a modern plus traditional combination', 'Let them justify balanced use'],

            peerInsight: 'Side-by-side comparisons reduced modern-only bias.'

          },

          {

            situation: 'Sacred Groves Treated as Just Forests',

            whatBreaksHere: 'Students miss the cultural and protective role of sacred groves.',

            earlyWarningSigns: ['Saying "just a forest area"', 'Ignoring worship and protection aspect'],

            ifStudentsLost: ['Ask why people protect these places for generations', 'Link belief with conservation'],

            ifStudentsBored: ['Ask them to find similar protected places nearby', 'Let them explain how respect helps protection'],

            peerInsight: 'Belief plus protection examples highlighted sacred groves.'

          },

          {

            situation: 'Nature Care Limited to Planting Trees',

            whatBreaksHere: 'Students think caring for nature only means planting trees.',

            earlyWarningSigns: ['Repeating "plant more trees" only', 'No mention of waste, water, or animals'],

            ifStudentsLost: ['List daily actions that harm or help nature', 'Categorise actions into water, waste, animals, and plants'],

            ifStudentsBored: ['Ask them to design one small daily action plan', 'Let them explain how it helps nature'],

            peerInsight: 'Daily-action lists broadened nature-care ideas.'

          }

        ]

      },

      {

        topicId: 'food_for_health',

        cards: [

          {

            situation: 'Prerequisite Gap - Healthy vs Junk',

            whatBreaksHere: 'Students cannot clearly tell which foods are healthy and which are junk.',

            earlyWarningSigns: ['Calling chips and pizza healthy', 'Giving reasons like "I like it" instead of body-related reasons'],

            ifStudentsLost: ['Ask "What does this food do to our body?" for each item', 'Sort foods on the board into "helps body" or "does not help"'],

            ifStudentsBored: ['Ask them to justify one junk food they like and why it is unhealthy', 'Let them redesign a junk food into a healthier option'],

            peerInsight: 'Body-effect questions reframed food choices.'

          },

          {

            situation: 'Conceptual Gap - Food Groups vs Functions',

            whatBreaksHere: 'Students name food groups correctly but fail to link them to body functions.',

            earlyWarningSigns: ['Mixing energy-giving and body-building foods', 'Correct examples but wrong explanations'],

            ifStudentsLost: ['Use body actions: energy equals running, body-building equals growing', 'Match each food with one body function aloud'],

            ifStudentsBored: ['Ask them to find one food that fits two groups and explain', 'Let them correct a wrong food-function pair'],

            peerInsight: 'Body-action matching clarified food group roles.'

          },

          {

            situation: 'Cannot Visualize a Balanced Plate',

            whatBreaksHere: 'Students cannot imagine a balanced food plate in daily meals.',

            earlyWarningSigns: ['Plates filled with only rice or roti', 'Vegetables and fruits missing in drawings'],

            ifStudentsLost: ['Draw a plate and divide it into three parts on the board', 'Fill parts together using common home foods'],

            ifStudentsBored: ['Ask them to redesign yesterday\'s meal into a balanced plate', 'Let them compare two plates and judge which is healthier'],

            peerInsight: 'Simple plate drawings made balance visible.'

          },

          {

            situation: 'Mixed Pace Classroom - Sharing Food Habits',

            whatBreaksHere: 'Some students actively share food habits while others hesitate or stay silent.',

            earlyWarningSigns: ['Same few students answering', 'Others saying "I eat whatever is made"'],

            ifStudentsLost: ['Use pair discussion before whole-class sharing', 'Allow drawing or pointing instead of speaking first'],

            ifStudentsBored: ['Ask them to help quieter students list foods', 'Give a comparison task such as home food versus packaged food'],

            peerInsight: 'Pair-and-draw options engaged hesitant students.'

          },

          {

            situation: 'Language Not Understood - Nutrient Terms',

            whatBreaksHere: 'Students do not understand terms like nutrients, balanced food, or protective food.',

            earlyWarningSigns: ['Copying definitions without meaning', 'Wrong usage of terms in answers'],

            ifStudentsLost: ['Replace terms with simple phrases such as gives strength or saves from illness', 'Use food pictures while explaining words'],

            ifStudentsBored: ['Ask them to explain terms using home examples', 'Let them frame one simple sentence per term'],

            peerInsight: 'Plain phrases plus pictures unlocked nutrient terms.'

          },

          {

            situation: 'Activity Chaos - Food Collage and Diaries',

            whatBreaksHere: 'Food collage, food diary, or food festival discussions become noisy and messy.',

            earlyWarningSigns: ['Pictures pasted randomly', 'Students arguing over materials'],

            ifStudentsLost: ['Demonstrate one correct example clearly', 'Assign roles such as collector, sorter, and pasting helper'],

            ifStudentsBored: ['Add a rule like "one food per group"', 'Let them review another group\'s collage'],

            peerInsight: 'Role clarity kept food activities organized.'

          },

          {

            situation: 'Six Tastes Treated as Just Flavours',

            whatBreaksHere: 'Students see the six tastes only as taste fun, not health-related.',

            earlyWarningSigns: ['Listing tastes without food examples', 'Treating activity as guessing game only'],

            ifStudentsLost: ['Match each taste with one common food item', 'Ask why eating only one taste may be harmful'],

            ifStudentsBored: ['Ask them to identify three tastes in one dish', 'Let them design a "balanced taste" dish'],

            peerInsight: 'Taste-to-food matching linked flavours to health.'

          },

          {

            situation: 'Junk Food Seen as Daily Food',

            whatBreaksHere: 'Students accept packaged and fast food as regular meals.',

            earlyWarningSigns: ['Writing junk food in daily food diary', 'Saying "everyone eats this daily"'],

            ifStudentsLost: ['Compare home food versus junk food on oil, salt, and sugar', 'Ask how body feels after eating too much junk'],

            ifStudentsBored: ['Ask them to design a "junk-free day" menu', 'Let them explain benefits of the change'],

            peerInsight: 'Comparing ingredients reset daily versus occasional food.'

          },

          {

            situation: 'Water for Health Underestimated',

            whatBreaksHere: 'Students do not see water as part of healthy food habits.',

            earlyWarningSigns: ['Forgetting to mention water in healthy habits', 'Unrealistic ideas about water intake'],

            ifStudentsLost: ['Link water to digestion, sweating, and cleanliness', 'Count glasses of water with daily routine'],

            ifStudentsBored: ['Ask them to track water intake for one day', 'Let them suggest ways to drink more water daily'],

            peerInsight: 'Daily tracking showed water\'s role in health.'

          }

        ]

      }

    ];



    grade4EvsChapters.forEach(({ topicId, cards }) => {

      cards.forEach(card => {

        prepCards.push(makeCard('EVS', 4, topicId, card.situation, card.whatBreaksHere, card.earlyWarningSigns, card.ifStudentsLost, card.ifStudentsBored, card.peerInsight));

      });

    });

    // ===== FINAL TEXT NORMALIZATION PASS =====
    // Apply text formatting to ALL PrepCards before insertion.
    // This ensures all human-facing text is clean and readable.
    const normalizedPrepCards = prepCards.map(card => {
      const cardObj = card.toObject ? card.toObject() : card;
      delete cardObj._id; // Remove _id before reinserting
      return new PrepCard(normalizeCardText(cardObj));
    });

    // Save all prep cards to database

    await PrepCard.insertMany(normalizedPrepCards);



    console.log('[ok] Successfully seeded Grade 3 and Grade 4 curriculum');

    console.log('[info] Added:');

    console.log('   - EVS Grade 3 (5 chapters x 9 situations = 45 cards)');

    console.log('   - Maths Grade 3 (5 chapters x 9 situations = 45 cards)');

    console.log('   - EVS Grade 4 (5 chapters x 9 situations = 45 cards)');

    console.log('   - Maths Grade 4 (5 chapters x 9 situations = 45 cards)');

    console.log('[count] Total prep cards added: 180');

    console.log('\n[note] All chapters now have exactly 9 situations each for Grades 3 and 4!');

    console.log('   Test the frontend by:');

    console.log('   1. Select Grade 3 or Grade 4');

    console.log('   2. Select Maths or EVS');

    console.log('   3. Pick any topic');

    console.log('   4. View all 9 situations for that chapter');



    await mongoose.disconnect();

  } catch (error) {

    console.error('Seeding error:', error);

    process.exit(1);

  }

};



seedData().then(() => {

  console.log('[ok] Seeding done, exiting...');

  process.exit(0);

}).catch(err => {

  console.error('Fatal error:', err);

  process.exit(1);

});
