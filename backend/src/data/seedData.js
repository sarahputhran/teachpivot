// Grade 3 Math and EVS Prep Cards - Complete 90 Cards (9 per chapter × 10 chapters)
// Run with: node src/data/seedDataNew.js

require('dotenv').config();
const mongoose = require('mongoose');
const Curriculum = require('../models/Curriculum');
const PrepCard = require('../models/PrepCard');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teachpivot');
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('Connection error:', error);
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

    // ===== PREP CARDS SETUP =====

    const prepCards = [];

    // ===== EVS CHAPTER 1: Family and Friends (9 cards) =====
    prepCards.push(new PrepCard({
      subject: 'EVS', grade: 3, topicId: 'family_friends',
      situation: 'Prerequisite Gap – "Family = Only Parents"',
      whatBreaksHere: 'Students have a narrow idea of family and miss the concept of different family members and structures.',
      earlyWarningSigns: ['Children name only parents when asked about family', 'Silence when asked about grandparents or relatives'],
      ifStudentsLost: ['Ask students to name who lives with them and who visits them often', 'Draw two circles on the board: "Lives with me" and "Visits us"'],
      ifStudentsBored: ['Ask them to compare Bela\'s family with their own', 'Let them explain one "different" family they know nearby'],
      successRate: 0.68, peerInsights: { count: 6, insight: 'Students understand better when given real examples from their neighborhood.' }, confidence: 0.75
    }));

    prepCards.push(new PrepCard({
      subject: 'EVS', grade: 3, topicId: 'family_friends',
      situation: 'Conceptual Gap – Worked Earlier, Failed Later',
      whatBreaksHere: 'Children remember names but don\'t connect family with care and responsibility.',
      earlyWarningSigns: ['One-word answers like "mother cooks" repeated by many', 'Copying from classmates during table work'],
      ifStudentsLost: ['Act out one task (e.g., watering plants) and ask who does this at home', 'Write one shared task and ask students to add who helps'],
      ifStudentsBored: ['Ask them to list work they do at home', 'Let them rank which task helps the family most'],
      successRate: 0.71, peerInsights: { count: 7, insight: 'Acting out tasks made responsibility connections clearer.' }, confidence: 0.74
    }));

    prepCards.push(new PrepCard({
      subject: 'EVS', grade: 3, topicId: 'family_friends',
      situation: 'Can\'t Visualize – Family Activities',
      whatBreaksHere: 'Learning remains abstract because students don\'t connect text with real life.',
      earlyWarningSigns: ['Blank stares during reading', 'Random answers not linked to the story'],
      ifStudentsLost: ['Ask students to close eyes and recall one evening at home', 'Let 2–3 students describe what everyone was doing'],
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
      situation: 'Activity Chaos – Drawing and Rangoli',
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
      situation: 'cant_visualize',
      whatBreaksHere: 'The lesson assumes real-life exposure that some children don\'t have.',
      earlyWarningSigns: ['Silence during discussion', 'Very empty or random drawings'],
      ifStudentsLost: ['Describe the mela step-by-step like a story', 'Act out sounds and movements (calling, selling, crowds)'],
      ifStudentsBored: ['Let them add one "new stall" to the mela', 'Ask them to explain why people would visit it'],
      successRate: 0.63, peerInsights: { count: 5, insight: 'Story-telling and acting made melas tangible.' }, confidence: 0.68
    }));

    prepCards.push(new PrepCard({
      subject: 'EVS', grade: 3, topicId: 'going_mela',
      situation: 'mixed_pace',
      whatBreaksHere: 'One task level doesn\'t suit all learning speeds.',
      earlyWarningSigns: ['Early finishers talking loudly', 'Slow learners stopping midway'],
      ifStudentsLost: ['Pair a fast learner with a slow learner', 'Break the task into smaller steps'],
      ifStudentsBored: ['Ask them to write 3 rules for a safe mela', 'Let them help check classmates\' work'],
      successRate: 0.66, peerInsights: { count: 6, insight: 'Paired learning supported varied speeds.' }, confidence: 0.70
    }));

    prepCards.push(new PrepCard({
      subject: 'EVS', grade: 3, topicId: 'going_mela',
      situation: 'language_not_landing',
      whatBreaksHere: 'New vocabulary blocks concept understanding.',
      earlyWarningSigns: ['Students repeat words without meaning', 'Wrong answers to simple questions'],
      ifStudentsLost: ['Explain words using local language', 'Match words with actions or objects'],
      ifStudentsBored: ['Ask them to make a mela word list', 'Use words in short oral sentences'],
      successRate: 0.60, peerInsights: { count: 4, insight: 'Action-based vocabulary teaching clarified terms.' }, confidence: 0.65
    }));

    prepCards.push(new PrepCard({
      subject: 'EVS', grade: 3, topicId: 'going_mela',
      situation: 'activity_chaos',
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
      situation: 'prerequisite_gap',
      whatBreaksHere: 'Students lack the basic idea that festivals are special days linked to culture, beliefs, seasons, or events.',
      earlyWarningSigns: ['Students only list names like Diwali or Eid', 'Silence when asked "why do we celebrate?"'],
      ifStudentsLost: ['Ask children to recall birthdays or weddings and compare them to festivals', 'Write a simple sentence frame: "A festival is celebrated because ___"'],
      ifStudentsBored: ['Ask students to invent a "new festival" and explain why it exists', 'Let them name who celebrates it and how'],
      successRate: 0.66, peerInsights: { count: 6, insight: 'Comparing to familiar events clarified festival meaning.' }, confidence: 0.70
    }));

    prepCards.push(new PrepCard({
      subject: 'EVS', grade: 3, topicId: 'celebrating_festivals',
      situation: 'worked_once_failed_later',
      whatBreaksHere: 'The idea of festivals as social, cultural, or religious practices is missing.',
      earlyWarningSigns: ['All answers revolve around sweets and crackers', 'No mention of prayers, customs, or family gatherings'],
      ifStudentsLost: ['Draw a four-part circle: food, prayer, people, purpose', 'Fill one festival together using student responses'],
      ifStudentsBored: ['Challenge them to find a festival with less food but more meaning', 'Ask them to explain why it still matters'],
      successRate: 0.64, peerInsights: { count: 5, insight: 'Four-part framework revealed deeper dimensions.' }, confidence: 0.69
    }));

    prepCards.push(new PrepCard({
      subject: 'EVS', grade: 3, topicId: 'celebrating_festivals',
      situation: 'cant_visualize',
      whatBreaksHere: 'Children assume everyone celebrates festivals the same way.',
      earlyWarningSigns: ['"This is how everyone does it" statements', 'Confusion when examples differ from their experience'],
      ifStudentsLost: ['Share two contrasting celebration examples of the same festival', 'Ask students to compare using "same" and "different"'],
      ifStudentsBored: ['Ask them to interview someone at home about celebrations', 'Share one surprising difference in class'],
      successRate: 0.63, peerInsights: { count: 5, insight: 'Contrast examples showed diversity within festivals.' }, confidence: 0.68
    }));

    prepCards.push(new PrepCard({
      subject: 'EVS', grade: 3, topicId: 'celebrating_festivals',
      situation: 'mixed_pace',
      whatBreaksHere: 'Uneven exposure to festivals and language confidence.',
      earlyWarningSigns: ['Same students answering repeatedly', 'Others copying answers or avoiding eye contact'],
      ifStudentsLost: ['Pair a talkative student with a quiet one', 'Give each pair one festival to discuss together'],
      ifStudentsBored: ['Ask fast learners to add one fact about another community\'s festival', 'Let them help present pair answers'],
      successRate: 0.65, peerInsights: { count: 6, insight: 'Paired discussion leveled participation.' }, confidence: 0.70
    }));

    prepCards.push(new PrepCard({
      subject: 'EVS', grade: 3, topicId: 'celebrating_festivals',
      situation: 'language_not_landing',
      whatBreaksHere: 'Key EVS vocabulary is blocking understanding of ideas.',
      earlyWarningSigns: ['Students repeat words incorrectly', 'Blank looks during explanations'],
      ifStudentsLost: ['Act out words like prayer, sharing, gathering', 'Ask students to explain words in their home language'],
      ifStudentsBored: ['Ask them to use the word in a sentence', 'Let them teach the word to the class'],
      successRate: 0.60, peerInsights: { count: 4, insight: 'Acting out vocabulary made abstract terms concrete.' }, confidence: 0.65
    }));

    prepCards.push(new PrepCard({
      subject: 'EVS', grade: 3, topicId: 'celebrating_festivals',
      situation: 'activity_chaos',
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
      situation: 'prerequisite_gap',
      whatBreaksHere: 'Students lack a basic mental map of plant parts, so new ideas like functions don\'t stick.',
      earlyWarningSigns: ['Students point to wrong parts in pictures', 'Blank responses when asked simple recall questions'],
      ifStudentsLost: ['Draw a simple plant on the board and label it slowly with the class', 'Ask students to touch the same parts on a real plant nearby or in their book'],
      ifStudentsBored: ['Ask them to explain what would happen if one part was missing', 'Let them quiz a partner by pointing to parts silently'],
      successRate: 0.67, peerInsights: { count: 6, insight: 'Real plant labeling made parts tangible.' }, confidence: 0.71
    }));

    prepCards.push(new PrepCard({
      subject: 'EVS', grade: 3, topicId: 'plants',
      situation: 'worked_once_failed_later',
      whatBreaksHere: 'Learning is memorised, not connected to real-life meaning.',
      earlyWarningSigns: ['Correct answers only when question is repeated', 'Wrong answers in worksheets with same concept'],
      ifStudentsLost: ['Use "why" questions instead of "what" questions', 'Link each function to daily life (e.g., roots = holding tight like shoes)'],
      ifStudentsBored: ['Ask them to make funny comparisons (stem as lift, leaf as kitchen)', 'Let them explain functions using actions or gestures'],
      successRate: 0.64, peerInsights: { count: 5, insight: 'Why-questions and analogies deepened understanding.' }, confidence: 0.69
    }));

    prepCards.push(new PrepCard({
      subject: 'EVS', grade: 3, topicId: 'plants',
      situation: 'cant_visualize',
      whatBreaksHere: 'The concept stays abstract because students never "see" roots.',
      earlyWarningSigns: ['Students draw roots above ground', 'Confusion between roots and branches'],
      ifStudentsLost: ['Show a pulled-out weed or picture of an uprooted plant', 'Draw underground roots using dotted lines on the board'],
      ifStudentsBored: ['Ask them to guess how long roots could be', 'Let them draw "secret underground roots" creatively'],
      successRate: 0.62, peerInsights: { count: 5, insight: 'Real uprooted plants made roots visible.' }, confidence: 0.67
    }));

    prepCards.push(new PrepCard({
      subject: 'EVS', grade: 3, topicId: 'plants',
      situation: 'mixed_pace',
      whatBreaksHere: 'One pace doesn\'t fit all; slower students disengage, faster ones get restless.',
      earlyWarningSigns: ['Same students answering repeatedly', 'Others copying answers quietly'],
      ifStudentsLost: ['Pair fast learners with slower ones for quick explanations', 'Repeat key ideas using simpler words and examples'],
      ifStudentsBored: ['Ask them to classify plants around the school/home', 'Give them a challenge: "Find a plant that breaks the rule"'],
      successRate: 0.66, peerInsights: { count: 6, insight: 'Peer tutoring and challenges engaged both groups.' }, confidence: 0.70
    }));

    prepCards.push(new PrepCard({
      subject: 'EVS', grade: 3, topicId: 'plants',
      situation: 'language_not_landing',
      whatBreaksHere: 'Vocabulary is new and not anchored to familiar examples.',
      earlyWarningSigns: ['Students describe but avoid naming', 'Mixing up herb/shrub/tree labels'],
      ifStudentsLost: ['Use local plant examples students already know', 'Repeat terms using comparison (small–medium–tall)'],
      ifStudentsBored: ['Ask them to name plants from their home area', 'Let them invent their own categories and explain why'],
      successRate: 0.60, peerInsights: { count: 4, insight: 'Local examples anchored new vocabulary.' }, confidence: 0.65
    }));

    prepCards.push(new PrepCard({
      subject: 'EVS', grade: 3, topicId: 'plants',
      situation: 'activity_chaos',
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
      situation: 'prerequisite_gap',
      whatBreaksHere: 'Students don\'t understand that plants are the starting point of food for animals and humans; they see plants and animals as separate topics, not connected.',
      earlyWarningSigns: ['Children say animals eat "food" but can\'t name plants or plant parts', 'Confusion when asked who eats first in nature'],
      ifStudentsLost: ['Draw a simple chain on the board: plant → goat → human. Say it aloud together', 'Ask students to name one animal and what plant it eats'],
      ifStudentsBored: ['Ask them to make a new food chain using animals they know', 'Let them challenge wrong chains and correct each other'],
      successRate: 0.66, peerInsights: { count: 6, insight: 'Simple chains made connections visible.' }, confidence: 0.70
    }));

    prepCards.push(new PrepCard({
      subject: 'EVS', grade: 3, topicId: 'plants_animals',
      situation: 'worked_once_failed_later',
      whatBreaksHere: 'Learning was memorised, not understood; students didn\'t internalise why plants are important for animals.',
      earlyWarningSigns: ['Correct answers suddenly disappear', 'Children repeat textbook lines without meaning'],
      ifStudentsLost: ['Ask "What happens if there are no plants?" Pause and let silence work', 'Use a simple story: forest without trees, animals leaving'],
      ifStudentsBored: ['Ask them to predict what happens 5 years later in the story', 'Let them explain in their own words, not book language'],
      successRate: 0.64, peerInsights: { count: 5, insight: 'Story-based scenarios made dependencies clear.' }, confidence: 0.69
    }));

    prepCards.push(new PrepCard({
      subject: 'EVS', grade: 3, topicId: 'plants_animals',
      situation: 'cant_visualize',
      whatBreaksHere: 'Lack of mental images of habitats; learning stays abstract instead of real.',
      earlyWarningSigns: ['Students mix farm, forest, water animals randomly', 'Blank looks when asked "Where does it live?"'],
      ifStudentsLost: ['Ask students to close their eyes and imagine a forest or pond', 'Draw a simple scene and place animals inside it together'],
      ifStudentsBored: ['Let them add one new animal to the scene and justify placement', 'Ask "What will happen if this animal is removed?"'],
      successRate: 0.62, peerInsights: { count: 5, insight: 'Scene-drawing made habitats concrete.' }, confidence: 0.67
    }));

    prepCards.push(new PrepCard({
      subject: 'EVS', grade: 3, topicId: 'plants_animals',
      situation: 'mixed_pace',
      whatBreaksHere: 'Same explanation doesn\'t work for all learners; faster students dominate discussion.',
      earlyWarningSigns: ['Same hands raised every time', 'Some students are copying answers'],
      ifStudentsLost: ['Pair a fast learner with a quiet student for one question', 'Ask pairs to explain, not write'],
      ifStudentsBored: ['Give fast learners a "why" question instead of "what"', 'Ask them to help create examples, not answers'],
      successRate: 0.67, peerInsights: { count: 6, insight: 'Why-questions challenged faster learners.' }, confidence: 0.71
    }));

    prepCards.push(new PrepCard({
      subject: 'EVS', grade: 3, topicId: 'plants_animals',
      situation: 'language_not_landing',
      whatBreaksHere: 'Language barrier blocks concept understanding; children know ideas but not the words.',
      earlyWarningSigns: ['Students avoid answering verbally', 'Repeating the teacher\'s words without clarity'],
      ifStudentsLost: ['Replace words with daily language (home, food, help)', 'Ask students to explain in their home language first'],
      ifStudentsBored: ['Ask them to rephrase concepts using only simple words', 'Turn it into a "no textbook words" challenge'],
      successRate: 0.60, peerInsights: { count: 4, insight: 'Simple language removed barriers.' }, confidence: 0.65
    }));

    prepCards.push(new PrepCard({
      subject: 'EVS', grade: 3, topicId: 'plants_animals',
      situation: 'activity_chaos',
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
      situation: 'prerequisite_gap',
      whatBreaksHere: 'Students lack strong place value understanding from earlier grades; they treat numbers as single blocks instead of grouped values.',
      earlyWarningSigns: ['Writes 345 as "three four five" without meaning', 'Gets confused when asked "How many tens?"'],
      ifStudentsLost: ['Rebuild using bundles of sticks or chalk marks (10 = one bundle)', 'Repeatedly ask "How many groups of 10?" before naming the number'],
      ifStudentsBored: ['Ask them to show the same number in two different ways', 'Let them challenge peers with "Guess my number" using place clues'],
      successRate: 0.68, peerInsights: { count: 9, insight: 'Concrete materials made place value tangible and memorable.' }, confidence: 0.72
    }));

    prepCards.push(new PrepCard({
      subject: 'Maths', grade: 3, topicId: 'whats_name',
      situation: 'worked_once_failed_later',
      whatBreaksHere: 'Students memorized patterns but didn\'t internalize place expansion; thousands place is introduced but not conceptually anchored.',
      earlyWarningSigns: ['Reads 1,234 as "one hundred two three four"', 'Skips the word "thousand" completely'],
      ifStudentsLost: ['Write the number in a place-value table and fill it slowly', 'Say the number aloud together while pointing to each column'],
      ifStudentsBored: ['Give them mixed numbers and ask which sounds bigger without calculating', 'Ask them to invent a "wrong reading" and explain why it\'s wrong'],
      successRate: 0.65, peerInsights: { count: 7, insight: 'Structured place-value tables and repeated modeling improved accuracy.' }, confidence: 0.69
    }));

    prepCards.push(new PrepCard({
      subject: 'Maths', grade: 3, topicId: 'whats_name',
      situation: 'cant_visualize',
      whatBreaksHere: 'Numbers are abstract symbols without real-world anchoring; students can\'t connect digits to actual size or amount.',
      earlyWarningSigns: ['Says "5,000 is small"', 'Can\'t compare two large numbers meaningfully'],
      ifStudentsLost: ['Connect numbers to familiar things (students, grains, steps)', 'Draw number bars showing relative size'],
      ifStudentsBored: ['Ask them to estimate numbers in the classroom or school', 'Give a number and ask where it fits between two others'],
      successRate: 0.62, peerInsights: { count: 6, insight: 'Real-world anchors and visual comparisons helped abstraction.' }, confidence: 0.66
    }));

    prepCards.push(new PrepCard({
      subject: 'Maths', grade: 3, topicId: 'whats_name',
      situation: 'mixed_pace',
      whatBreaksHere: 'One-speed teaching doesn\'t match varied number sense levels; faster students disengage, slower students panic.',
      earlyWarningSigns: ['Early finishers start chatting', 'Some students stop writing altogether'],
      ifStudentsLost: ['Pair slow learners with supportive peers for place-value tasks', 'Reduce numbers to 2–3 digits temporarily'],
      ifStudentsBored: ['Give them comparison puzzles with close numbers', 'Ask them to explain why one number is larger, not just which'],
      successRate: 0.70, peerInsights: { count: 8, insight: 'Differentiation and peer support maintained engagement for all.' }, confidence: 0.73
    }));

    prepCards.push(new PrepCard({
      subject: 'Maths', grade: 3, topicId: 'whats_name',
      situation: 'language_not_landing',
      whatBreaksHere: 'Language becomes a barrier, not the math; students know the number but not the words.',
      earlyWarningSigns: ['Can write digits but not number names', 'Mixes up "hundred" and "thousand"'],
      ifStudentsLost: ['Say number names slowly in home language first, then English', 'Display a number-name word wall'],
      ifStudentsBored: ['Ask them to translate number names into home language', 'Play "fix the mistake" with wrong spellings or names'],
      successRate: 0.61, peerInsights: { count: 5, insight: 'L1 support and word walls provided necessary scaffolding.' }, confidence: 0.64
    }));

    prepCards.push(new PrepCard({
      subject: 'Maths', grade: 3, topicId: 'whats_name',
      situation: 'activity_chaos',
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
      situation: 'prerequisite_gap',
      whatBreaksHere: 'Students lack fluency with skip counting and basic number sequences, which the chapter assumes.',
      earlyWarningSigns: ['Students guess randomly while extending patterns', 'Repeatedly ask "What comes next?" without trying'],
      ifStudentsLost: ['Pause and revise skip counting orally using claps or steps (2s, 5s, 10s)', 'Build a simple pattern together on the board using chalk symbols before toys'],
      ifStudentsBored: ['Ask them to invent a new counting rule and challenge peers', 'Let them explain why their pattern works'],
      successRate: 0.66, peerInsights: { count: 6, insight: 'Skip counting practice made patterns accessible.' }, confidence: 0.70
    }));

    prepCards.push(new PrepCard({
      subject: 'Maths', grade: 3, topicId: 'toy_joy',
      situation: 'worked_once_failed_later',
      whatBreaksHere: 'Students focus on copying instead of identifying the rule behind the pattern.',
      earlyWarningSigns: ['Correct first few answers, then sudden mistakes', 'Copying neighbor\'s work without explanation'],
      ifStudentsLost: ['Ask, "What is repeating?" instead of "What is next?"', 'Circle the repeating unit using chalk on the board'],
      ifStudentsBored: ['Give a broken pattern and ask them to fix it', 'Ask them to create a pattern with two rules'],
      successRate: 0.65, peerInsights: { count: 6, insight: 'Rule-identification prevented copying.' }, confidence: 0.70
    }));

    prepCards.push(new PrepCard({
      subject: 'Maths', grade: 3, topicId: 'toy_joy',
      situation: 'cant_visualize',
      whatBreaksHere: 'Pattern understanding is too abstract without physical manipulation.',
      earlyWarningSigns: ['Blank stares at the textbook', 'Counting aloud repeatedly but unsure'],
      ifStudentsLost: ['Use locally available items (stones, chalk pieces, erasers) as toys', 'Let students physically arrange and rearrange the pattern'],
      ifStudentsBored: ['Ask them to show the same pattern in two different ways', 'Challenge them to convert a physical pattern into numbers'],
      successRate: 0.62, peerInsights: { count: 5, insight: 'Physical manipulation made patterns concrete.' }, confidence: 0.67
    }));

    prepCards.push(new PrepCard({
      subject: 'Maths', grade: 3, topicId: 'toy_joy',
      situation: 'mixed_pace',
      whatBreaksHere: 'One-level task does not suit all learners.',
      earlyWarningSigns: ['Fast finishers start talking', 'Slow learners stop attempting'],
      ifStudentsLost: ['Pair slow learners with patient peers for pattern-building', 'Reduce the pattern length and rebuild gradually'],
      ifStudentsBored: ['Ask fast learners to design a trick pattern', 'Let them act as "pattern checkers" for others'],
      successRate: 0.68, peerInsights: { count: 6, insight: 'Tiered patterns kept all students engaged.' }, confidence: 0.72
    }));

    prepCards.push(new PrepCard({
      subject: 'Maths', grade: 3, topicId: 'toy_joy',
      situation: 'language_not_landing',
      whatBreaksHere: 'Mathematical language is blocking understanding, not the concept.',
      earlyWarningSigns: ['Students follow instructions incorrectly', 'Asking meanings of common words repeatedly'],
      ifStudentsLost: ['Explain instructions in home language with examples', 'Demonstrate once instead of re-explaining verbally'],
      ifStudentsBored: ['Ask them to explain the rule in their own words', 'Let them translate instructions for the class'],
      successRate: 0.60, peerInsights: { count: 4, insight: 'Demonstration beat verbal explanations.' }, confidence: 0.65
    }));

    prepCards.push(new PrepCard({
      subject: 'Maths', grade: 3, topicId: 'toy_joy',
      situation: 'activity_chaos',
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
      ifStudentsLost: ['Model sentence frames like "The rule is…"', 'Ask students to say the rule before writing'],
      ifStudentsBored: ['Ask them to write the rule as a sentence', 'Let peers check if the rule matches the pattern'],
      successRate: 0.63, peerInsights: { count: 5, insight: 'Verbalization made reasoning visible.' }, confidence: 0.67
    }));

    // ===== MATH CHAPTER 3: Double Century (9 cards) =====
    prepCards.push(new PrepCard({
      subject: 'Maths', grade: 3, topicId: 'double_century',
      situation: 'prerequisite_gap',
      whatBreaksHere: 'Place value understanding (ones–tens–hundreds) is weak, so numbers feel like random digits.',
      earlyWarningSigns: ['Students read 132 as "one three two"', 'Confusion while grouping objects into tens'],
      ifStudentsLost: ['Group chalk pieces or sticks into bundles of 10 in front of the class', 'Write the number only after showing the bundles physically'],
      ifStudentsBored: ['Ask them to show the same number in two different ways (e.g., 1 hundred + 10 tens)', 'Challenge them to make the "biggest number" using fixed digits'],
      successRate: 0.67, peerInsights: { count: 6, insight: 'Physical bundling anchored place value.' }, confidence: 0.71
    }));

    prepCards.push(new PrepCard({
      subject: 'Maths', grade: 3, topicId: 'double_century',
      situation: 'worked_once_failed_later',
      whatBreaksHere: 'Transfer of understanding from two-digit to three-digit numbers is not happening.',
      earlyWarningSigns: ['Correct answers till 99, sudden mistakes after', 'Students start guessing instead of explaining'],
      ifStudentsLost: ['Rebuild numbers using place-value columns drawn on the board', 'Move back briefly to 2-digit examples and then extend to 3-digit'],
      ifStudentsBored: ['Ask them to predict the next number before writing it', 'Let them "teach" a smaller number example to the class'],
      successRate: 0.64, peerInsights: { count: 5, insight: 'Bridging 2-digit to 3-digit aided transfer.' }, confidence: 0.69
    }));

    prepCards.push(new PrepCard({
      subject: 'Maths', grade: 3, topicId: 'double_century',
      situation: 'cant_visualize',
      whatBreaksHere: 'Mental visualization of large quantities is missing.',
      earlyWarningSigns: ['Blank stares when asked "How big is 150?"', 'Students rely only on memorization'],
      ifStudentsLost: ['Use number lines on the floor or wall up to 200', 'Mark familiar points like 100 and build forward step by step'],
      ifStudentsBored: ['Ask them to place mystery numbers on the number line', 'Let them design their own number line challenges'],
      successRate: 0.61, peerInsights: { count: 5, insight: 'Floor number lines made magnitude tangible.' }, confidence: 0.66
    }));

    prepCards.push(new PrepCard({
      subject: 'Maths', grade: 3, topicId: 'double_century',
      situation: 'mixed_pace',
      whatBreaksHere: 'One-speed teaching doesn\'t match varied number sense levels.',
      earlyWarningSigns: ['Fast finishers distracting others', 'Slow learners copying answers'],
      ifStudentsLost: ['Pair strong and struggling students for number-building tasks', 'Give concrete objects to slower learners instead of more questions'],
      ifStudentsBored: ['Give extension tasks like "How many numbers between 120 and 150?"', 'Ask them to create tricky numbers for peers to read'],
      successRate: 0.68, peerInsights: { count: 6, insight: 'Pairing and extensions engaged both ends.' }, confidence: 0.72
    }));

    prepCards.push(new PrepCard({
      subject: 'Maths', grade: 3, topicId: 'double_century',
      situation: 'language_not_landing',
      whatBreaksHere: 'Language barrier interferes with mathematical understanding.',
      earlyWarningSigns: ['Correct digits but wrong number names', 'Hesitation while reading aloud'],
      ifStudentsLost: ['Read numbers aloud together in chorus', 'Break number names into parts (hundred + forty + five)'],
      ifStudentsBored: ['Ask them to quiz the class with number names', 'Let them match number cards with names quickly'],
      successRate: 0.60, peerInsights: { count: 4, insight: 'Choral reading built confidence.' }, confidence: 0.65
    }));

    prepCards.push(new PrepCard({
      subject: 'Maths', grade: 3, topicId: 'double_century',
      situation: 'activity_chaos',
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
      ifStudentsLost: ['Always write H–T–O columns before expanding', 'Use spoken explanations alongside writing'],
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
      situation: 'prerequisite_gap',
      whatBreaksHere: 'Children do not see numbers as groups of tens and ones; they rely on counting one-by-one instead of jumps.',
      earlyWarningSigns: ['Fingers used for all calculations', 'Long pauses even for small additions'],
      ifStudentsLost: ['Build numbers using bundles of sticks or chalk dots (tens + ones)', 'Say numbers aloud as "two tens and five ones"'],
      ifStudentsBored: ['Ask them to explain a number in two ways (e.g., 37)', 'Challenge them to guess answers before solving'],
      successRate: 0.67, peerInsights: { count: 7, insight: 'Bundling reduced finger-counting dependence.' }, confidence: 0.71
    }));

    prepCards.push(new PrepCard({
      subject: 'Maths', grade: 3, topicId: 'vacation_nani',
      situation: 'worked_once_failed_later',
      whatBreaksHere: 'They memorized steps instead of understanding jumps; transfer of learning is missing.',
      earlyWarningSigns: ['Correct answers earlier, wrong answers now', 'Copying peers instead of thinking'],
      ifStudentsLost: ['Redo one solved example slowly using a number line', 'Ask "Where did we start? Where did we land?"'],
      ifStudentsBored: ['Let them create a new problem using the same method', 'Ask them to show a shortcut jump'],
      successRate: 0.64, peerInsights: { count: 6, insight: 'Revisiting with number lines reinforced concepts.' }, confidence: 0.69
    }));

    prepCards.push(new PrepCard({
      subject: 'Maths', grade: 3, topicId: 'vacation_nani',
      situation: 'cant_visualize',
      whatBreaksHere: 'Numbers feel abstract, not like movement; direction (+ / –) is unclear.',
      earlyWarningSigns: ['Random answers', 'Jumps drawn without spacing logic'],
      ifStudentsLost: ['Make children physically step forward/backward while counting', 'Draw a large floor number line'],
      ifStudentsBored: ['Ask them to predict landing numbers mentally', 'Introduce "one big jump vs many small jumps"'],
      successRate: 0.62, peerInsights: { count: 5, insight: 'Physical movement made operations tangible.' }, confidence: 0.67
    }));

    prepCards.push(new PrepCard({
      subject: 'Maths', grade: 3, topicId: 'vacation_nani',
      situation: 'mixed_pace',
      whatBreaksHere: 'Same task given to all despite different speeds.',
      earlyWarningSigns: ['Fast finishers chatting', 'Slow learners freezing'],
      ifStudentsLost: ['Pair slow learners with verbal thinkers', 'Reduce numbers (e.g., 23 + 7 instead of 23 + 17)'],
      ifStudentsBored: ['Ask them to solve using two different methods', 'Let them act as "method explainers"'],
      successRate: 0.65, peerInsights: { count: 6, insight: 'Simplified numbers and pairing leveled pace.' }, confidence: 0.70
    }));

    prepCards.push(new PrepCard({
      subject: 'Maths', grade: 3, topicId: 'vacation_nani',
      situation: 'language_not_landing',
      whatBreaksHere: 'Words like "more", "left", "total" are unclear.',
      earlyWarningSigns: ['Wrong operation chosen', 'Blank answers'],
      ifStudentsLost: ['Act the story using objects', 'Circle keywords together on the board'],
      ifStudentsBored: ['Ask them to reframe the problem orally', 'Let them write a new story for the same numbers'],
      successRate: 0.61, peerInsights: { count: 5, insight: 'Acting stories clarified word problems.' }, confidence: 0.65
    }));

    prepCards.push(new PrepCard({
      subject: 'Maths', grade: 3, topicId: 'vacation_nani',
      situation: 'activity_chaos',
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
      ifStudentsLost: ['Use arrows with + and – labels', 'Ask "Are we getting more or less?"'],
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
      situation: 'prerequisite_gap',
      whatBreaksHere: 'Students don\'t clearly remember basic 2D shapes (square, rectangle, triangle, circle), so new ideas build on shaky ground.',
      earlyWarningSigns: ['Students point to wrong shapes when asked', 'Answers like "box" instead of "square"'],
      ifStudentsLost: ['Draw 4 basic shapes on the board and name them aloud together', 'Ask students to find the same shapes in the classroom'],
      ifStudentsBored: ['Ask them to sort classroom objects by shape', 'Challenge them to find objects with more than one shape'],
      successRate: 0.66, peerInsights: { count: 6, insight: 'Classroom shape-hunt made learning concrete.' }, confidence: 0.70
    }));

    prepCards.push(new PrepCard({
      subject: 'Maths', grade: 3, topicId: 'shapes',
      situation: 'worked_once_failed_later',
      whatBreaksHere: 'Children memorized shapes earlier but didn\'t understand their properties.',
      earlyWarningSigns: ['Counting sides incorrectly', 'Guessing corners randomly'],
      ifStudentsLost: ['Trace one shape on the board and count sides together', 'Ask students to trace shapes in the air using fingers'],
      ifStudentsBored: ['Ask them to compare two shapes and say one difference', 'Let them quiz classmates on sides and corners'],
      successRate: 0.64, peerInsights: { count: 5, insight: 'Tracing and counting made properties explicit.' }, confidence: 0.69
    }));

    prepCards.push(new PrepCard({
      subject: 'Maths', grade: 3, topicId: 'shapes',
      situation: 'cant_visualize',
      whatBreaksHere: 'Students confuse drawings (2D) with real objects (3D).',
      earlyWarningSigns: ['Calling a ball a circle', 'Saying a book is a rectangle only'],
      ifStudentsLost: ['Hold a book and draw its face on the board', 'Say clearly: "This face is flat; the object is solid"'],
      ifStudentsBored: ['Ask them to list flat shapes on a solid object', 'Let them explain the difference in their own words'],
      successRate: 0.62, peerInsights: { count: 5, insight: 'Comparing flat faces to solid objects clarified 2D/3D.' }, confidence: 0.67
    }));

    prepCards.push(new PrepCard({
      subject: 'Maths', grade: 3, topicId: 'shapes',
      situation: 'mixed_pace',
      whatBreaksHere: 'Same task doesn\'t suit all learning speeds.',
      earlyWarningSigns: ['Fast finishers start chatting', 'Slow learners stop trying'],
      ifStudentsLost: ['Pair a confident student with a struggling one', 'Reduce task to just one shape at a time'],
      ifStudentsBored: ['Ask them to draw a shape-based picture', 'Challenge them to create a new shape using lines'],
      successRate: 0.68, peerInsights: { count: 6, insight: 'Pairing and creative tasks engaged both ends.' }, confidence: 0.72
    }));

    prepCards.push(new PrepCard({
      subject: 'Maths', grade: 3, topicId: 'shapes',
      situation: 'language_not_landing',
      whatBreaksHere: 'Math language is unfamiliar and abstract.',
      earlyWarningSigns: ['Blank looks when terms are used', 'Students copy answers without speaking'],
      ifStudentsLost: ['Use local language equivalents briefly', 'Point and touch corners and edges on real objects'],
      ifStudentsBored: ['Ask them to explain terms in their own language', 'Let them teach one word to the class'],
      successRate: 0.60, peerInsights: { count: 4, insight: 'Touching real shapes clarified terminology.' }, confidence: 0.65
    }));

    prepCards.push(new PrepCard({
      subject: 'Maths', grade: 3, topicId: 'shapes',
      situation: 'activity_chaos',
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

    // Save all prep cards to database
    await PrepCard.insertMany(prepCards);

    console.log('✅ Successfully seeded Grade 3 curriculum');
    console.log('📚 Added:');
    console.log('   - EVS Grade 3 (5 chapters × 9 situations = 45 cards)');
    console.log('   - Maths Grade 3 (5 chapters × 9 situations = 45 cards)');
    console.log('📊 Total prep cards added: 90');
    console.log('\n💡 All chapters now have exactly 9 situations each!');
    console.log('   Test the frontend by:');
    console.log('   1. Select Grade 3');
    console.log('   2. Select Maths or EVS');
    console.log('   3. Pick any topic');
    console.log('   4. View all 9 situations for that chapter');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
