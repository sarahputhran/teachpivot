/**
 * API Response Normalization Layer
 * 
 * Converts snake_case backend values to consistent frontend formats.
 * All transformations happen at the API boundary, so components receive clean data.
 * 
 * WHY THIS EXISTS:
 * - Backend uses snake_case for enum values (timing_issue, partially_worked)
 * - Backend uses snake_case for topic IDs (family_friends)
 * - API response shapes vary ({ card: {...} } vs direct object)
 * - Missing fields cause silent UI failures on Vercel but work locally
 */

const IS_DEV = import.meta.env.DEV;

/**
 * Log warning only in development to help debug data issues
 */
function warnMissingField(context: string, field: string, value: any): void {
    if (IS_DEV && (value === undefined || value === null)) {
        console.warn(`[Normalize] ${context}: missing or null field "${field}"`);
    }
}

// ============ String Transformations ============

/**
 * Convert snake_case to Title Case
 * e.g., "family_friends" -> "Family Friends"
 */
export function toTitleCase(str: string | null | undefined): string {
    if (!str) return '';
    return str
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Convert snake_case to camelCase
 * e.g., "timing_issue" -> "timingIssue"
 */
export function toCamelCase(str: string | null | undefined): string {
    if (!str) return '';
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// ============ Enum Mappings ============

export const OUTCOME_LABELS: Record<string, string> = {
    'worked': 'Worked',
    'partially_worked': 'Partially Worked',
    'didnt_work': "Didn't Work",
};

export const REASON_LABELS: Record<string, string> = {
    'timing_issue': 'Timing Issue',
    'prerequisite_weak': 'Prerequisite Weak',
    'example_didnt_land': "Example Didn't Land",
    'language_confusion': 'Language Confusion',
    'none': 'None',
};

// ============ Type Definitions ============

export interface NormalizedPrepCard {
    _id: string; // Needed for feedback submission
    subject: string;
    grade: number;
    topicId: string;
    topicName: string;  // Derived from topicId
    situation: string;
    whatBreaksHere: string;
    earlyWarningSigns: string[];
    ifStudentsLost: string[];
    ifStudentsBored: string[];
    successRate: number;
    peerInsights: {
        count: number;
        insight: string;
    } | null;
    confidence: number;
}

export interface NormalizedSignal {
    _id: string;
    subject: string;
    grade: number;
    topicId: string;
    topicName: string;  // Derived from topicId
    situation: string;
    totalReflections: number;
    successRate: number;
    failureRate: number;
    commonReasons: Array<{
        reason: string;       // Original snake_case for API
        reasonLabel: string;  // Human-readable label
        count: number;
    }>;
}

export interface NormalizedHeatmapItem {
    topicId: string;
    topicName: string;  // Derived from topicId
    difficulty: number;
    totalReflections: number;
}

// ============ Normalizers ============

/**
 * Normalize PrepCard API response
 * Handles: { card: {...} } wrapper OR direct object
 */
export function normalizePrepCard(raw: any): NormalizedPrepCard | null {
    if (!raw) {
        warnMissingField('normalizePrepCard', 'raw', raw);
        return null;
    }

    // Handle wrapped response { card: {...} } or direct response
    const card = raw.card ?? raw;

    warnMissingField('PrepCard', 'whatBreaksHere', card.whatBreaksHere);
    warnMissingField('PrepCard', 'earlyWarningSigns', card.earlyWarningSigns);

    return {
        _id: card._id ?? '',
        subject: card.subject ?? '',
        grade: card.grade ?? 0,
        topicId: card.topicId ?? '',
        topicName: toTitleCase(card.topicId),
        situation: card.situation ?? '',
        whatBreaksHere: card.whatBreaksHere ?? '',
        earlyWarningSigns: Array.isArray(card.earlyWarningSigns) ? card.earlyWarningSigns : [],
        ifStudentsLost: Array.isArray(card.ifStudentsLost) ? card.ifStudentsLost : [],
        ifStudentsBored: Array.isArray(card.ifStudentsBored) ? card.ifStudentsBored : [],
        successRate: card.successRate ?? 0.5,
        peerInsights: card.peerInsights ?? null,
        confidence: card.confidence ?? 0.5,
    };
}

/**
 * Normalize CRP Signal API response
 */
export function normalizeSignal(raw: any): NormalizedSignal {
    warnMissingField('Signal', 'topicId', raw.topicId);
    warnMissingField('Signal', 'situation', raw.situation);

    return {
        _id: raw._id ?? '',
        subject: raw.subject ?? '',
        grade: raw.grade ?? 0,
        topicId: raw.topicId ?? '',
        topicName: toTitleCase(raw.topicId),
        situation: raw.situation ?? '',
        totalReflections: raw.totalReflections ?? 0,
        successRate: raw.successRate ?? 0,
        failureRate: raw.failureRate ?? 0,
        commonReasons: (raw.commonReasons ?? []).map((r: any) => ({
            reason: r.reason,
            reasonLabel: REASON_LABELS[r.reason] ?? toTitleCase(r.reason),
            count: r.count ?? 0,
        })),
    };
}

/**
 * Normalize Heatmap item API response
 */
export function normalizeHeatmapItem(raw: any): NormalizedHeatmapItem {
    const topicId = raw.topicId ?? raw._id ?? '';
    warnMissingField('HeatmapItem', 'topicId', raw.topicId);

    return {
        topicId,
        topicName: toTitleCase(topicId),
        difficulty: raw.difficulty ?? 0,
        totalReflections: raw.totalReflections ?? 0,
    };
}

// ============ Situation Normalizers ============

export interface NormalizedSituation {
    _id: string;
    situation: string;
    whatBreaksHere: string;
    earlyWarningSigns: string[];
}

export interface NormalizedSituationsResponse {
    topicName: string;
    situations: NormalizedSituation[];
}

/**
 * Normalize situations API response
 * Handles: array directly OR { topicName, situations } wrapper
 */
export function normalizeSituationsResponse(raw: any, fallbackTopicId: string): NormalizedSituationsResponse {
    let situationsArray: any[] = [];
    let topicName = '';

    if (Array.isArray(raw)) {
        // Backend returned array directly
        situationsArray = raw;
        topicName = toTitleCase(fallbackTopicId);
    } else if (raw && Array.isArray(raw.situations)) {
        // Backend returned { topicName, situations }
        situationsArray = raw.situations;
        topicName = raw.topicName || toTitleCase(fallbackTopicId);
    } else {
        warnMissingField('SituationsResponse', 'situations', raw?.situations);
        topicName = toTitleCase(fallbackTopicId);
    }

    return {
        topicName,
        situations: situationsArray.map((s: any) => ({
            _id: s._id ?? '',
            situation: s.situation ?? '',
            whatBreaksHere: s.whatBreaksHere ?? '',
            earlyWarningSigns: Array.isArray(s.earlyWarningSigns) ? s.earlyWarningSigns : [],
        })),
    };
}

/**
 * Normalize array of signals
 */
export function normalizeSignals(rawList: any[]): NormalizedSignal[] {
    if (!Array.isArray(rawList)) {
        warnMissingField('normalizeSignals', 'rawList', rawList);
        return [];
    }
    return rawList.map(normalizeSignal);
}

/**
 * Normalize heatmap array
 */
export function normalizeHeatmap(rawList: any[]): NormalizedHeatmapItem[] {
    if (!Array.isArray(rawList)) {
        warnMissingField('normalizeHeatmap', 'rawList', rawList);
        return [];
    }
    return rawList.map(normalizeHeatmapItem);
}

// ============ Topics Normalizers ============

export interface NormalizedTopic {
    id: string;
    name: string;
    description: string;
}

/**
 * Normalize topics API response
 * Handles: array directly OR { topics: [...] } wrapper
 */
export function normalizeTopics(raw: any): NormalizedTopic[] {
    let topicsArray: any[] = [];

    if (Array.isArray(raw)) {
        topicsArray = raw;
    } else if (raw && Array.isArray(raw.topics)) {
        topicsArray = raw.topics;
    } else {
        warnMissingField('normalizeTopics', 'topics', raw);
        return [];
    }

    return topicsArray.map((t: any) => ({
        id: t.id ?? '',
        name: t.name ?? toTitleCase(t.id),
        description: t.description ?? '',
    }));
}

/**
 * Validate that critical API response is not HTML (common Vercel SPA fallback issue)
 * Returns true if response appears to be valid JSON data
 */
export function validateApiResponse(data: any, endpoint: string): boolean {
    if (typeof data === 'string' && data.includes('<!DOCTYPE')) {
        console.error(
            `[API] ${endpoint} returned HTML instead of JSON. ` +
            'This usually means VITE_API_URL is not set correctly for production.'
        );
        return false;
    }
    return true;
}
