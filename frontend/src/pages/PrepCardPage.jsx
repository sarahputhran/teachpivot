import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getPrepCard } from '../api';
import { normalizePrepCard, validateApiResponse } from '../lib/normalize';

export default function PrepCard({ context, situation, onBack, onViewHistory, onHome }) {
  const { t } = useTranslation();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Log visit to history on load
  useEffect(() => {
    if (card) {
      try {
        const historyItem = {
          id: `${context.subject}-${context.grade}-${context.topicId}-${situation}-${Date.now()}`,
          context,
          situation,
          cardId: card._id,
          visitedAt: new Date().toISOString(),
          reflected: false
        };

        const existingHistory = JSON.parse(localStorage.getItem('teachpivot_history') || '[]');
        // Optional: Deduplicate recent views of same card
        localStorage.setItem('teachpivot_history', JSON.stringify([historyItem, ...existingHistory].slice(0, 50)));
      } catch (e) {
        console.error('Failed to save history', e);
      }
    }
  }, [card]);

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

      // Add to browsing history (deduplicated)
      try {
        const history = JSON.parse(localStorage.getItem('teachpivot_prep_history') || '[]');
        // Remove existing entry for this card ID to avoid duplicates
        const filtered = history.filter(h => h.id !== normalized._id);

        // Add to top
        filtered.unshift({
          id: normalized._id,
          title: normalized.situation,
          context: `${normalized.subject} • Gr ${normalized.grade}`,
          date: new Date().toISOString()
        });

        // Limit to 50 items
        localStorage.setItem('teachpivot_prep_history', JSON.stringify(filtered.slice(0, 50)));
      } catch (e) {
        console.error('History save failed', e);
      }

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



  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="blob w-72 h-72 bg-gradient-to-r from-indigo-200 to-blue-200 -top-10 -right-10 opacity-50"></div>
      <div className="blob w-64 h-64 bg-gradient-to-r from-purple-200 to-pink-200 bottom-20 -left-20 opacity-50" style={{ animationDelay: '-4s' }}></div>
      <div className="blob w-48 h-48 bg-gradient-to-r from-rose-200 to-orange-200 top-1/2 right-10 opacity-40" style={{ animationDelay: '-2s' }}></div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header Card */}
        <div className="relative mb-6 animate-slide-down">
          {/* Home Button absolute top right */}
          <button
            onClick={onHome}
            className="absolute top-0 right-0 w-10 h-10 flex items-center justify-center rounded-xl bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 text-xl transition-all duration-300 hover:scale-110 hover:shadow-md z-20 backdrop-blur-sm"
            title="Return Home"
          >
            🏠
          </button>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg mb-4">
              <span className="text-2xl">📚</span>
              <span className="font-bold text-gray-800">{context.subject} - Grade {context.grade}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-gradient mb-2">
              Your Prep Card
            </h1>
            <p className="text-gray-500">{situation}</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 space-y-6 overflow-y-auto max-h-[75vh] animate-scale-in">
          {/* Revision Indicator - shown when CRP has updated this guidance */}
          {card.isRevised && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border-l-4 border-emerald-400 animate-slide-down">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-lg shadow-lg">
                  ✨
                </div>
                <div>
                  <h3 className="font-bold text-emerald-800">
                    Updated based on classroom evidence
                  </h3>
                  <p className="text-emerald-600 text-sm">
                    This guidance was refined using feedback from teachers like you.
                  </p>
                </div>
              </div>
            </div>
          )}

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

          {/* Action Buttons - Phase D Compliant (No immediate reflection) */}
          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={onHome}
              className="w-full bg-gradient-to-r from-gray-800 to-gray-700 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
            >
              🏠 Return Home
            </button>
            <button
              onClick={onBack}
              className="w-full bg-white/80 backdrop-blur-sm text-gray-700 py-2 rounded-2xl font-medium hover:bg-white border border-gray-200"
            >
              ← Back to Situation Selection
            </button>
            <button
              onClick={onViewHistory}
              className="w-full bg-white/80 backdrop-blur-sm text-indigo-600 py-3 rounded-2xl font-bold shadow-md hover:bg-indigo-50 transition-all duration-300"
            >
              📜 My Prep History
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">
              Feedback available in History after class
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


