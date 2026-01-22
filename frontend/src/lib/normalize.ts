/**
 * API Response Normalization Layer
 *
 * Converts snake_case backend values to consistent frontend formats.
 * Defensive against Axios response misuse and inconsistent API shapes.
 */

const IS_DEV = import.meta.env.DEV;

/* =========================
   Internal Helpers
   ========================= */

/**
 * Safely unwrap Axios responses or raw JSON
 * Allows passing either `res` or `res.data`
 */
function unwrapApiData(raw: any): any {
    if (raw && typeof raw === 'object' && 'data' in raw) {
        return raw.data;
    }
    return raw;
}

/**
 * Log warning only in development
 */
function warnMissingField(context: string, field: string, value: any): void {
    if (IS_DEV && (value === undefined || value === null)) {
        console.warn(`[Normalize] ${context}: missing or null field "${field}"`, value);
    }
}

/* =========================
   String Helpers
   ========================= */

export function toTitleCase(str: string | null | undefined): string {
    if (!str) return '';
    return str
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}

export function toCamelCase(str: string | null | undefined): string {
    if (!str) return '';
    return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

/* =========================
   Enum Labels
   ========================= */

export const OUTCOME_LABELS: Record<string, string> = {
    worked: 'Worked',
    partially_worked: 'Partially Worked',
    didnt_work: "Didn't Work",
};

export const REASON_LABELS: Record<string, string> = {
    timing_issue: 'Timing Issue',
    prerequisite_weak: 'Prerequisite Weak',
    example_didnt_land: "Example Didn't Land",
    language_confusion: 'Language Confusion',
    none: 'None',
};

/* =========================
   Types
   ========================= */

export interface NormalizedTopic {
    id: string;
    name: string;
    description: string;
}

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

export interface NormalizedPrepCard {
    _id: string;
    subject: string;
    grade: number;
    topicId: string;
    topicName: string;
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
    isRevised?: boolean;
}

/* =========================
   PrepCard Normalizer
   ========================= */

export function normalizePrepCard(raw: any): NormalizedPrepCard | null {
    const data = unwrapApiData(raw);
    if (!data) return null;

    const card = data.card ?? data;

    warnMissingField('PrepCard', '_id', card._id);
    warnMissingField('PrepCard', 'topicId', card.topicId);

    return {
        _id: card._id ?? '',
        subject: card.subject ?? '',
        grade: card.grade ?? 0,
        topicId: card.topicId ?? '',
        topicName: toTitleCase(card.topicId),
        situation: card.situation ?? '',
        whatBreaksHere: card.whatBreaksHere ?? '',
        earlyWarningSigns: Array.isArray(card.earlyWarningSigns)
            ? card.earlyWarningSigns
            : [],
        ifStudentsLost: Array.isArray(card.ifStudentsLost)
            ? card.ifStudentsLost
            : [],
        ifStudentsBored: Array.isArray(card.ifStudentsBored)
            ? card.ifStudentsBored
            : [],
        successRate: card.successRate ?? 0.5,
        peerInsights: card.peerInsights ?? null,
        confidence: card.confidence ?? 0.5,
        isRevised: card.isRevised ?? false,
    };
}

/* =========================
   Topics Normalizer
   ========================= */

export function normalizeTopics(raw: any): NormalizedTopic[] {
    const data = unwrapApiData(raw);

    let topicsArray: any[] = [];

    if (Array.isArray(data)) {
        topicsArray = data;
    } else if (data && Array.isArray(data.topics)) {
        topicsArray = data.topics;
    } else {
        warnMissingField('normalizeTopics', 'topics', data);
        return [];
    }

    return topicsArray.map((t: any) => ({
        id: t.id ?? '',
        name: t.name ?? toTitleCase(t.id),
        description: t.description ?? '',
    }));
}

/* =========================
   Situations Normalizer
   ========================= */

export function normalizeSituationsResponse(
    raw: any,
    fallbackTopicId: string
): NormalizedSituationsResponse {
    const data = unwrapApiData(raw);

    let situationsArray: any[] = [];
    let topicName = toTitleCase(fallbackTopicId);

    if (Array.isArray(data)) {
        situationsArray = data;
    } else if (data && Array.isArray(data.situations)) {
        situationsArray = data.situations;
        topicName = data.topicName || topicName;
    } else {
        warnMissingField('normalizeSituationsResponse', 'situations', data);
    }

    return {
        topicName,
        situations: situationsArray.map((s: any) => ({
            _id: s._id ?? '',
            situation: s.situation ?? '',
            whatBreaksHere: s.whatBreaksHere ?? '',
            earlyWarningSigns: Array.isArray(s.earlyWarningSigns)
                ? s.earlyWarningSigns
                : [],
        })),
    };
}

/* =========================
   Generic Array Normalizers
   ========================= */

export function normalizeSignals(raw: any[]): any[] {
    const data = unwrapApiData(raw);
    if (!Array.isArray(data)) {
        warnMissingField('normalizeSignals', 'array', data);
        return [];
    }
    return data;
}

export function normalizeHeatmap(raw: any[]): any[] {
    const data = unwrapApiData(raw);
    if (!Array.isArray(data)) {
        warnMissingField('normalizeHeatmap', 'array', data);
        return [];
    }
    return data;
}

/* =========================
   API Response Validator
   ========================= */

export function validateApiResponse(data: any, endpoint: string): boolean {
    if (typeof data === 'string' && data.includes('<!DOCTYPE')) {
        console.error(
            `[API] ${endpoint} returned HTML instead of JSON. ` +
            'Check VITE_API_URL configuration.'
        );
        return false;
    }
    return true;
}
