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
            const stored = localStorage.getItem('teachpivot_prep_history'); // Fixed key name (was inconsistent before?)
            // Note: PrepCardPage uses 'teachpivot_prep_history'
            // I should double check if I used two different keys!

            if (stored) {
                let parsed = JSON.parse(stored);

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

                // Clean up storage if duplicates were found
                if (uniqueHistory.length < parsed.length) {
                    localStorage.setItem('teachpivot_prep_history', JSON.stringify(uniqueHistory));
                }
            } else {
                // Fallback check for old key?
                const oldStored = localStorage.getItem('teachpivot_history');
                if (oldStored) {
                    // Migrate old history if needed
                    // ... for now just ignore to avoid confusion
                }
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
            localStorage.setItem('teachpivot_history', JSON.stringify(updatedHistory));
            setSelectedCard(null);
        }
    };

    if (selectedCard) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 relative overflow-hidden">
                <div className="max-w-2xl mx-auto relative z-10 pt-10">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                        Reflection: {selectedCard.situation}
                    </h2>
                    <ReflectionForm
                        context={selectedCard.context}
                        situation={selectedCard.situation}
                        cardId={selectedCard.cardId}
                        onBack={() => setSelectedCard(null)}
                        onSubmit={handleReflectionComplete}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 relative overflow-hidden">
            {/* Animated background blobs */}
            <div className="blob w-72 h-72 bg-gradient-to-r from-blue-200 to-indigo-200 -top-10 -right-10 opacity-50"></div>
            <div className="blob w-64 h-64 bg-gradient-to-r from-purple-200 to-pink-200 bottom-20 -left-20 opacity-50" style={{ animationDelay: '-4s' }}></div>

            <div className="max-w-2xl mx-auto relative z-10">
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
                                            {item.context.subject} • Gr {item.context.grade}
                                        </span>
                                        <h3 className="font-bold text-gray-800 text-lg leading-tight">
                                            {item.situation}
                                        </h3>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Viewed {new Date(item.visitedAt).toLocaleDateString()}
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
                                    onClick={() => onNavigateToCard(item.context, item.situation)}
                                    className="w-full py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-600 text-sm font-medium transition-colors flex items-center justify-center gap-2 group-hover:bg-indigo-50 group-hover:text-indigo-600"
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
