import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { submitReflection, submitFeedback } from '../api';

export default function ReflectionForm({ context, situation, cardId, onBack, onSubmit }) {
    const { t } = useTranslation();
    const [outcome, setOutcome] = useState('');
    const [reason, setReason] = useState('none');
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!outcome) return;

        try {
            setSubmitting(true);

            // 1. Submit standard reflection
            await submitReflection({
                subject: context.subject,
                grade: context.grade,
                topicId: context.topicId,
                situation,
                outcome,
                reason
            });

            // 2. Submit optional feedback if present and valid (silent fail permitted for UX flow)
            if (feedback && feedback.trim().length >= 10) {
                try {
                    await submitFeedback({
                        prepCardId: cardId,
                        content: feedback,
                        clientVersion: '1.0.0'
                    });
                } catch (fbError) {
                    console.error('Feedback submission failed, but reflection saved:', fbError);
                }
            }

            setSuccess(true);
            setTimeout(() => {
                onSubmit();
            }, 2000);
        } catch (error) {
            console.error('Error submitting reflection:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const outcomeOptions = [
        { value: 'worked', label: t('reflection.worked'), icon: '🎉', gradient: 'from-emerald-400 to-teal-500', bg: 'from-emerald-50 to-teal-50' },
        { value: 'partially_worked', label: t('reflection.partiallyWorked'), icon: '🤔', gradient: 'from-amber-400 to-orange-500', bg: 'from-amber-50 to-orange-50' },
        { value: 'didnt_work', label: t('reflection.didntWork'), icon: '😅', gradient: 'from-rose-400 to-red-500', bg: 'from-rose-50 to-red-50' }
    ];

    const reasonOptions = [
        { value: 'timing_issue', label: t('reflection.timingIssue'), icon: '⏰' },
        { value: 'prerequisite_weak', label: t('reflection.prerequisiteWeak'), icon: '📚' },
        { value: 'example_didnt_land', label: t('reflection.exampleDidntLand'), icon: '💡' },
        { value: 'language_confusion', label: t('reflection.languageConfusion'), icon: '🗣️' },
        { value: 'none', label: t('reflection.none'), icon: '✓' }
    ];

    if (success) {
        return (
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-10 max-w-md text-center animate-scale-in mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-5xl shadow-lg shadow-emerald-200 animate-bounce-gentle">
                    ✨
                </div>
                <h2 className="text-3xl font-extrabold text-gradient-teal mb-4">
                    {t('reflection.thanks')}
                </h2>
                <p className="text-gray-600 text-lg">
                    Your reflection helps improve guidance for all teachers.
                </p>
                <p className="text-emerald-600 mt-4 font-medium animate-pulse">
                    Keep making a difference! 🌟
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 space-y-6 animate-scale-in">
            {/* Outcome Selection */}
            <div className="space-y-4">
                <p className="text-sm font-semibold text-gray-600 mb-4">Select an outcome:</p>
                {outcomeOptions.map((option, index) => (
                    <button
                        key={option.value}
                        onClick={() => setOutcome(option.value)}
                        className={`stagger-item w-full py-4 px-5 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-4 group ${outcome === option.value
                            ? `bg-gradient-to-r ${option.gradient} text-white shadow-lg scale-[1.02]`
                            : `bg-gradient-to-r ${option.bg} text-gray-700 hover:shadow-md hover:scale-[1.01]`
                            }`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <span className={`text-2xl ${outcome === option.value ? 'animate-bounce-gentle' : 'group-hover:scale-110 transition-transform'}`}>
                            {option.icon}
                        </span>
                        <span>{option.label}</span>
                        {outcome === option.value && (
                            <span className="ml-auto">✓</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Reason Selection */}
            {outcome && (
                <div className="animate-slide-up">
                    <label className="block text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-sm">💭</span>
                        {t('reflection.reason')} <span className="text-gray-400 font-normal text-sm">(optional)</span>
                    </label>
                    <div className="space-y-3">
                        {reasonOptions.map((option, index) => (
                            <button
                                key={option.value}
                                onClick={() => setReason(option.value)}
                                className={`stagger-item w-full py-3 px-4 rounded-xl transition-all duration-300 text-left flex items-center gap-3 ${reason === option.value
                                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg'
                                    : 'bg-gray-50 text-gray-700 hover:bg-violet-50 hover:shadow-sm'
                                    }`}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <span className="text-lg">{option.icon}</span>
                                <span>{option.label}</span>
                                {reason === option.value && (
                                    <span className="ml-auto">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Optional Feedback */}
            {outcome && (
                <div className="animate-slide-up relative z-10" style={{ animationDelay: '0.1s' }}>
                    <label className="block text-lg font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm">📝</span>
                        Feedback for Content Team <span className="text-gray-400 font-normal text-sm">(optional)</span>
                    </label>
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Share more details about what worked or didn't work..."
                        className="w-full p-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none h-32 text-gray-700 bg-white"
                        style={{ pointerEvents: 'auto' }}
                    />
                    <div className="flex justify-between items-center mt-2 px-1">
                        <span className={`text-xs font-medium ${feedback.length > 0 && feedback.length < 10 ? 'text-rose-500' :
                            feedback.length > 5000 ? 'text-rose-500' : 'text-gray-400'
                            }`}>
                            {feedback.length > 0 && feedback.length < 10 ? 'Min 10 chars' :
                                feedback.length > 5000 ? 'Too long' :
                                    `${feedback.length} chars`}
                        </span>
                        <span className="text-xs text-gray-400">
                            Visible only to content team
                        </span>
                    </div>
                </div>
            )}

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={!outcome || submitting || (feedback.length > 0 && (feedback.length < 10 || feedback.length > 5000))}
                className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-4 rounded-2xl font-bold shadow-xl shadow-purple-200 hover:shadow-2xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 group gradient-animated"
            >
                <span className="relative z-10 flex items-center justify-center gap-2">
                    {submitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            {t('common.loading')}
                        </>
                    ) : (
                        <>
                            {t('reflection.submit')}
                            <span className="group-hover:translate-x-1 transition-transform">🚀</span>
                        </>
                    )}
                </span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </button>

            {onBack && (
                <button
                    onClick={onBack}
                    className="w-full text-gray-500 hover:text-gray-700 transition-colors py-2 font-medium flex items-center justify-center gap-2 hover:-translate-x-1 transition-transform"
                >
                    <span>←</span> Cancel
                </button>
            )}
        </div>
    );
}
