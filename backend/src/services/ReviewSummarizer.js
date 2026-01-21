/**
 * TF-IDF Review Summarizer Service
 * 
 * Extracts key themes from multiple reviews to create a consensus summary.
 */

const STOP_WORDS = new Set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
    'can', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during',
    'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s',
    'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself',
    'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my', 'myself',
    'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
    'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such',
    'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too',
    'under', 'until', 'up', 'very',
    'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t',
    'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves',
    // Domain specific fillers
    'student', 'students', 'teacher', 'teachers', 'class', 'classroom', 'grade', 'subject', 'lesson', 'topic',
    'need', 'needs', 'needed', 'review', 'make', 'add', 'change', 'issue', 'problem'
]);

class ReviewSummarizer {
    constructor() {
        this.documents = []; // { id, tokens: [] }
        this.idfCache = {}; // { word: score }
    }

    tokenize(text) {
        if (!text) return [];
        return text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 2 && !STOP_WORDS.has(w));
    }

    /**
     * Builds the corpus (all documents) to calculate global IDF
     * @param {Array} reviewGroups - Array of { id, reviews: [{ notes }] }
     */
    buildCorpus(reviewGroups) {
        this.documents = reviewGroups.map(group => {
            // Concatenate all review notes for this signal/group
            const allText = group.reviews
                .map(r => r.notes || '')
                .filter(t => t.trim().length > 0)
                .join(' ');

            return {
                id: group.id,
                tokens: this.tokenize(allText)
            };
        });

        // Calculate IDF
        this.idfCache = {};
        const N = this.documents.length;
        if (N === 0) return;

        // Count document frequency for each term
        const df = {};
        this.documents.forEach(doc => {
            const uniqueTokens = new Set(doc.tokens);
            uniqueTokens.forEach(token => {
                df[token] = (df[token] || 0) + 1;
            });
        });

        // Calculate IDF = log(N / (df + 1))
        Object.keys(df).forEach(token => {
            this.idfCache[token] = Math.log(N / (df[token] + 1));
        });
    }

    /**
     * Generates a summary for a specific review group
     * @param {string} groupId - ID of the group/signal
     * @param {Array} reviews - Reviews for this group
     */
    generateSummary(groupId, reviews) {
        if (!reviews || reviews.length === 0) return null;
        if (reviews.length === 1) return reviews[0].notes; // If only 1 review, just show it

        const doc = this.documents.find(d => d.id === groupId.toString());
        // If not in corpus (e.g. new update), tokenize on fly
        const tokens = doc ? doc.tokens : this.tokenize(reviews.map(r => r.notes || '').join(' '));

        if (tokens.length === 0) return "Multiple reviews submitted without notes.";

        // Calculate TF-IDF for this document
        const tf = {};
        tokens.forEach(t => tf[t] = (tf[t] || 0) + 1);

        // Normalize TF? Raw count is fine for short texts
        const scores = [];
        Object.keys(tf).forEach(token => {
            const idf = this.idfCache[token] || 1.5; // Default high IDF for new terms
            scores.push({
                term: token,
                score: tf[token] * idf
            });
        });

        // Sort by score desc
        scores.sort((a, b) => b.score - a.score);

        // Pick top 3-5 terms
        const topTerms = scores.slice(0, 5).map(s => s.term);

        if (topTerms.length === 0) return "Multiple reviews present.";

        // Construct sentence
        const termString = topTerms.join(', ');
        return `${reviews.length} CRPs agree. Key themes: ${termString}.`;
    }
}

module.exports = new ReviewSummarizer();
