import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getPrepCard } from '../api';
import { normalizePrepCard, validateApiResponse } from '../lib/normalize';

export default function PrepCard({ context, situation, onBack, onViewHistory, onHome }) {
  const { t } = useTranslation();

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* =========================
     Load Prep Card
     ========================= */

  useEffect(() => {
    if (context?.subject && context?.grade && context?.topicId && situation) {
      loadPrepCard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context?.subject, context?.grade, context?.topicId, situation]);

  const loadPrepCard = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getPrepCard(
        context.subject,
        context.grade,
        context.topicId,
        situation
      );

      if (!validateApiResponse(response.data, '/prep-cards')) {
        throw new Error('Invalid API response');
      }

      const normalized = normalizePrepCard(response.data);

      // 🔴 CRITICAL GUARD
      if (!normalized || !normalized._id) {
        throw new Error('Prep card normalization failed');
      }

      setCard(normalized);

    } catch (err) {
      console.error('[PrepCard load error]', err);
      setError('Failed to load prep card');
      setCard(null);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Save History (SAFE)
     ========================= */

  useEffect(() => {
    if (!card?._id) return;

    try {
      const historyItem = {
        id: card._id,
        context: {
          subject: context.subject,
          grade: context.grade,
          topicId: context.topicId,
        },
        situation: card.situation,
        visitedAt: new Date().toISOString(),
        reflected: false,
      };

      const existing = JSON.parse(
        localStorage.getItem('teachpivot_prep_history') || '[]'
      );

      const filtered = existing.filter(h => h.id !== card._id);
      filtered.unshift(historyItem);

      localStorage.setItem(
        'teachpivot_prep_history',
        JSON.stringify(filtered.slice(0, 50))
      );

    } catch (e) {
      console.error('Failed to save history', e);
    }
  }, [card, context, situation]);

  /* =========================
     UI STATES
     ========================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 text-center max-w-md">
          <p className="text-red-600 mb-4">
            {error || t('common.error')}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={loadPrepCard}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg"
            >
              Retry
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-200 rounded-lg"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================
     MAIN RENDER
     ========================= */

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-xl font-bold mb-2">
        {context.subject} – Grade {context.grade}
      </h1>

      <h2 className="text-lg font-semibold mb-4">
        {card.situation}
      </h2>

      <section className="mb-4">
        <h3 className="font-bold">What breaks here</h3>
        <p>{card.whatBreaksHere || t('common.noData')}</p>
      </section>

      <section className="mb-4">
        <h3 className="font-bold">Early warning signs</h3>
        <ul>
          {card.earlyWarningSigns.length
            ? card.earlyWarningSigns.map((s, i) => <li key={i}>{s}</li>)
            : <li>{t('common.noData')}</li>}
        </ul>
      </section>

      <button onClick={onHome}>🏠 Home</button>
    </div>
  );
}
