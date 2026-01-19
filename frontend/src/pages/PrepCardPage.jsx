import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getPrepCard, submitReflection } from '../api';
import { normalizePrepCard, validateApiResponse } from '../lib/normalize';

export default function PrepCard({ context, situation, onBack }) {
  const { t } = useTranslation();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReflection, setShowReflection] = useState(false);

  useEffect(() => {
    if (context?.subject && context?.grade && context?.topicId && situation) {
      loadPrepCard();
    }
  }, [context.subject, context.grade, context.topicId, situation]);

  const loadPrepCard = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getPrepCard(
        context.subject,
        context.grade,
        context.topicId,
        situation
      );

      const data = response.data;

      // Validate response isn't HTML (Vercel SPA fallback issue)
      if (!validateApiResponse(data, '/prep-cards')) {
        setError('API configuration error');
        setCard(null);
        return;
      }

      // Normalize at the API boundary - components receive clean data
      const normalized = normalizePrepCard(data);
      setCard(normalized);

    } catch (error) {
      console.error('Error loading prep card:', error);
      setError('Failed to load prep card');
      setCard(null);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center relative overflow-hidden">
        <div className="blob w-96 h-96 bg-gradient-to-r from-indigo-300 to-purple-300 -top-20 -left-20 opacity-40"></div>
        <div className="blob w-80 h-80 bg-gradient-to-r from-pink-300 to-rose-300 bottom-0 right-0 opacity-40" style={{ animationDelay: '-3s' }}></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 w-16 h-16 border-4 border-transparent border-b-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
            <div className="absolute inset-4 w-12 h-12 border-4 border-transparent border-t-pink-400 rounded-full animate-spin" style={{ animationDuration: '0.6s' }}></div>
          </div>
          <p className="text-indigo-600 mt-6 font-medium animate-pulse">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!card || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-10 text-center max-w-md animate-scale-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center text-4xl animate-bounce-gentle">
            😕
          </div>
          <p className="text-gray-600 text-lg mb-4">{t('common.error')}</p>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex gap-3 justify-center">
            <button
              onClick={loadPrepCard}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Retry ↻
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showReflection) {
    return (
      <ReflectionForm
        context={context}
        situation={situation}
        onBack={() => setShowReflection(false)}
        onSubmit={() => {
          setShowReflection(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="blob w-72 h-72 bg-gradient-to-r from-indigo-200 to-blue-200 -top-10 -right-10 opacity-50"></div>
      <div className="blob w-64 h-64 bg-gradient-to-r from-purple-200 to-pink-200 bottom-20 -left-20 opacity-50" style={{ animationDelay: '-4s' }}></div>
      <div className="blob w-48 h-48 bg-gradient-to-r from-rose-200 to-orange-200 top-1/2 right-10 opacity-40" style={{ animationDelay: '-2s' }}></div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header Card */}
        <div className="text-center mb-6 animate-slide-down">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg mb-4">
            <span className="text-2xl">📚</span>
            <span className="font-bold text-gray-800">{context.subject} - Grade {context.grade}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gradient mb-2">
            Your Prep Card
          </h1>
          <p className="text-gray-500">{situation}</p>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 space-y-6 overflow-y-auto max-h-[75vh] animate-scale-in">
          {/* What Breaks Here */}
          <div className="stagger-item bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border-l-4 border-amber-400">
            <h2 className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm">⚠️</span>
              {t('prepCard.whatBreaksHere')}
            </h2>
            <p className="text-amber-900">
              {typeof card?.whatBreaksHere === 'string' && card.whatBreaksHere.trim()
                ? card.whatBreaksHere
                : t('common.noData')}
            </p>
          </div>

          {/* Early Warning Signs */}
          <div className="stagger-item bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border-l-4 border-blue-400">
            <h2 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm">👀</span>
              {t('prepCard.earlyWarnings')}
            </h2>
            <ul className="space-y-2">
              {Array.isArray(card?.earlyWarningSigns) && card.earlyWarningSigns.length > 0 ? (
                card.earlyWarningSigns.map((sign, idx) => (
                  <li
                    key={idx}
                    className="text-blue-900 flex items-start gap-3 group"
                  >
                    <span className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0 group-hover:scale-110 transition-transform">
                      {idx + 1}
                    </span>
                    <span>{sign}</span>
                  </li>
                ))
              ) : (
                <li className="text-blue-400 italic">
                  {t('common.noData')}
                </li>
              )}
            </ul>

          </div>

          {/* If Students Are Lost */}
          <div className="stagger-item bg-gradient-to-r from-rose-50 to-red-50 rounded-2xl p-5 border-l-4 border-rose-400 card-shine">
            <h2 className="text-lg font-bold text-rose-800 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center text-white text-sm">🆘</span>
              {t('prepCard.ifLost')}
            </h2>
            <ul className="space-y-2">
              {Array.isArray(card?.ifStudentsLost) && card.ifStudentsLost.length > 0 ? (
                card.ifStudentsLost.map((tip, idx) => (
                  <li
                    key={idx}
                    className="text-rose-900 flex items-start gap-3 group"
                  >
                    <span className="text-rose-500 group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                    <span>{tip}</span>
                  </li>
                ))
              ) : (
                <li className="text-rose-400 italic">
                  {t('common.noData')}
                </li>
              )}
            </ul>

          </div>

          {/* If Students Are Bored */}
          <div className="stagger-item bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border-l-4 border-emerald-400 card-shine">
            <h2 className="text-lg font-bold text-emerald-800 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm">🚀</span>
              {t('prepCard.ifBored')}
            </h2>
            <ul className="space-y-2">
              {Array.isArray(card?.ifStudentsBored) && card.ifStudentsBored.length > 0 ? (
                card.ifStudentsBored.map((tip, idx) => (
                  <li
                    key={idx}
                    className="text-emerald-900 flex items-start gap-3 group"
                  >
                    <span className="text-emerald-500 group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                    <span>{tip}</span>
                  </li>
                ))
              ) : (
                <li className="text-emerald-400 italic">
                  {t('common.noData')}
                </li>
              )}
            </ul>

          </div>

          {/* Peer Insights */}
          {card.peerInsights?.insight && (
            <div className="stagger-item bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-5 border-l-4 border-violet-400 relative overflow-hidden">
              <div className="absolute top-2 right-2 text-4xl opacity-20">💬</div>
              <h2 className="text-sm font-bold text-violet-700 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs">✨</span>
                {t('prepCard.peerInsights')}
              </h2>
              <p className="text-violet-900 italic">
                &ldquo;
                {typeof card?.peerInsights?.insight === 'string' && card.peerInsights.insight.trim()
                  ? card.peerInsights.insight
                  : t('common.noData')}
                &rdquo;
              </p>

            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => setShowReflection(true)}
              className="flex-1 relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-4 rounded-2xl font-bold shadow-xl shadow-purple-200 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group gradient-animated"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {t('prepCard.done')}
                <span className="group-hover:translate-x-1 transition-transform">✨</span>
              </span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </button>
            <button
              onClick={onBack}
              className="px-6 bg-white/80 backdrop-blur-sm text-gray-700 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 hover:-translate-x-1"
            >
              ←
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReflectionForm({ context, situation, onBack, onSubmit }) {
  const { t } = useTranslation();
  const [outcome, setOutcome] = useState('');
  const [reason, setReason] = useState('none');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!outcome) return;

    try {
      setSubmitting(true);
      await submitReflection({
        subject: context.subject,
        grade: context.grade,
        topicId: context.topicId,
        situation,
        outcome,
        reason
      });
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="blob w-80 h-80 bg-gradient-to-r from-emerald-200 to-teal-200 -top-20 -right-20 opacity-50"></div>
        <div className="blob w-72 h-72 bg-gradient-to-r from-cyan-200 to-blue-200 bottom-10 -left-20 opacity-50" style={{ animationDelay: '-3s' }}></div>

        {/* Confetti effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full animate-bounce"
              style={{
                backgroundColor: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899'][i % 5],
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-10 max-w-md text-center animate-scale-in">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="blob w-72 h-72 bg-gradient-to-r from-indigo-200 to-purple-200 -top-10 -right-10 opacity-50"></div>
      <div className="blob w-64 h-64 bg-gradient-to-r from-pink-200 to-rose-200 bottom-10 -left-10 opacity-50" style={{ animationDelay: '-4s' }}></div>

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="text-center mb-6 animate-slide-down">
          <h1 className="text-2xl font-extrabold text-gradient mb-2">
            {t('reflection.outcome')}
          </h1>
          <p className="text-gray-500">How did your lesson go?</p>
        </div>

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

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!outcome || submitting}
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

          <button
            onClick={onBack}
            className="w-full text-gray-500 hover:text-gray-700 transition-colors py-2 font-medium flex items-center justify-center gap-2 hover:-translate-x-1 transition-transform"
          >
            <span>←</span> Back to Prep Card
          </button>
        </div>
      </div>
    </div>
  );
}
