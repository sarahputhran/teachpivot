import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReflectionForm from '../components/ReflectionForm';

export default function PrepHistoryPage({ onBack, onNavigateToCard, onHome }) {
    const { t } = useTranslation();
    const [history, setHistory] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);

    useEffect(() => {
        // Load history from localStorage with self-healing deduplication
        try {
            const stored = localStorage.getItem('teachpivot_prep_history');

            if (stored) {
                let parsed = JSON.parse(stored);

                // =================================================================
                // SELF-HEALING: Recover missing data from 'teachpivot_history'
                // This parallel storage key has always contained full context objects
                // but wasn't being used for the display list. We use it to fix legacy broken cards.
                // =================================================================
                try {
                    const fallbackStored = localStorage.getItem('teachpivot_history');
                    if (fallbackStored) {
                        const fallbackHistory = JSON.parse(fallbackStored);

                        // Map situations to their full context for quick lookup
                        const recoveryMap = new Map();
                        fallbackHistory.forEach(item => {
                            if (item.situation && item.context && typeof item.context === 'object') {
                                recoveryMap.set(item.situation, item.context);
                            }
                        });

                        // Heal broken items
                        parsed = parsed.map(item => {
                            // If context is a string (legacy broken format)
                            if (typeof item.context === 'string') {
                                // Try to find full context for this situation
                                const recoveredContext = recoveryMap.get(item.situation || item.title);
                                if (recoveredContext) {
                                    // Successfully healed!
                                    return {
                                        ...item,
                                        context: recoveredContext, // Replace string with object
                                        situation: item.situation || item.title // Ensure situation is set
                                    };
                                }
                            }
                            return item;
                        });
                    }
                } catch (recoveryError) {
                    console.warn("History recovery failed:", recoveryError);
                }
                // =================================================================

                // Deduplicate by ID
                const seenIds = new Set();
                const uniqueHistory = [];

                // Sort by date desc (newest first)
                parsed.sort((a, b) => new Date(b.date || b.visitedAt) - new Date(a.date || a.visitedAt));

                for (const item of parsed) {
                    // Normalize ID access (handle potential structure diffs)
                    const id = item.id || item.cardId;
                    if (id && !seenIds.has(id)) {
                        seenIds.add(id);
                        uniqueHistory.push(item);
                    }
                }

                setHistory(uniqueHistory);

                // Save healed/deduplicated history back to storage
                localStorage.setItem('teachpivot_prep_history', JSON.stringify(uniqueHistory));
            }
        } catch (e) {
            console.error('Failed to load history', e);
        }
    }, []);

    const handleReflect = (item) => {
        setSelectedCard(item);
    };

    const handleReflectionComplete = () => {
        // Update local history status
        if (selectedCard) {
            const updatedHistory = history.map(h =>
                h.id === selectedCard.id ? { ...h, reflected: true } : h
            );
            setHistory(updatedHistory);
            // Update both storage keys to keep them in sync
            localStorage.setItem('teachpivot_prep_history', JSON.stringify(updatedHistory));

            // Also update the fallback storage if possible
            try {
                const fallbackStored = localStorage.getItem('teachpivot_history');
                if (fallbackStored) {
                    const fallbackHistory = JSON.parse(fallbackStored).map(h =>
                        (h.id === selectedCard.id || h.cardId === selectedCard.cardId) ? { ...h, reflected: true } : h
                    );
                    localStorage.setItem('teachpivot_history', JSON.stringify(fallbackHistory));
                }
            } catch (e) {
                // Ignore fallback update errors
            }

            setSelectedCard(null);
        }
    };

    if (selectedCard) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-3 sm:p-4 md:p-6 relative overflow-hidden">
                <div className="w-full max-w-2xl mx-auto relative z-10 pt-6 sm:pt-10">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                        Reflection: {selectedCard.situation}
                    </h2>
                    <ReflectionForm
                        context={selectedCard.context}
                        situation={selectedCard.situation}
                        cardId={selectedCard.id || selectedCard.cardId}
                        onBack={() => setSelectedCard(null)}
                        onSubmit={handleReflectionComplete}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-3 sm:p-4 md:p-6 relative overflow-hidden">
            {/* Animated background blobs */}
            <div className="blob w-48 sm:w-64 md:w-72 h-48 sm:h-64 md:h-72 bg-gradient-to-r from-blue-200 to-indigo-200 -top-10 -right-10 opacity-50"></div>
            <div className="blob w-40 sm:w-56 md:w-64 h-40 sm:h-56 md:h-64 bg-gradient-to-r from-purple-200 to-pink-200 bottom-20 -left-20 opacity-50\" style={{ animationDelay: '-4s' }}></div>

            <div className="w-full max-w-2xl mx-auto relative z-10\">
                <div className="flex items-center gap-4 mb-8 pt-4">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all text-gray-700"
                    >
                        ←
                    </button>
                    <h1 className="text-2xl font-extrabold text-gray-800">
                        My Prep History
                    </h1>
                    <button
                        onClick={onHome}
                        className="w-10 h-10 ml-auto rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all text-gray-700 text-xl"
                        title="Return Home"
                    >
                        🏠
                    </button>
                </div>

                {history.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-10 text-center animate-scale-in">
                        <div className="text-6xl mb-4">🕰️</div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No history yet</h3>
                        <p className="text-gray-500">Your viewed prep cards will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {history.map((item, idx) => (
                            <div
                                key={`${item.id}-${idx}`}
                                className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all animate-slide-up border-l-4 border-indigo-400 group"
                                style={{ animationDelay: `${idx * 0.1}s` }}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <span className="inline-block px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold mb-1">
                                            {/* Handle both object context (new) and string context (legacy) safely */}
                                            {typeof item.context === 'object'
                                                ? `${item.context.subject} • Gr ${item.context.grade}`
                                                : (typeof item.context === 'string' ? item.context : 'Prep Card')}
                                        </span>
                                        <h3 className="font-bold text-gray-800 text-lg leading-tight">
                                            {item.situation || item.title || 'Unknown Situation'}
                                        </h3>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Viewed {new Date(item.visitedAt || item.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {item.reflected ? (
                                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                            ✓ Reflected
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleReflect(item)}
                                            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all"
                                        >
                                            Add Feedback ✨
                                        </button>
                                    )}
                                </div>

                                <button
                                    onClick={() => {
                                        // Only navigate if we have the necessary context
                                        if (item.context && typeof item.context === 'object' && item.situation) {
                                            onNavigateToCard(item.context, item.situation);
                                        } else {
                                            // Fallback for broken/legacy cards - user might need to recreate them
                                            alert("This older history card cannot be opened directly. Please create a new card.");
                                        }
                                    }}
                                    className={`w-full py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 
                                        ${(item.context && typeof item.context === 'object')
                                            ? 'bg-gray-50 hover:bg-gray-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 text-gray-600'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                >
                                    View Card Again →
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
