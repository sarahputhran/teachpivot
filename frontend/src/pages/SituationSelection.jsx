import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getSituations } from '../api';
import {
  normalizeSituationsResponse,
  validateApiResponse
} from '../lib/normalize';

export default function SituationSelection({ context, onSituationSelect, onBack }) {
  const { t } = useTranslation();

  const [situations, setSituations] = useState([]);
  const [topicName, setTopicName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (context?.topicId && context?.subject && context?.grade) {
      loadSituations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context?.topicId]);

  const loadSituations = async () => {
    setLoading(true);
    setError(null);
    setSituations([]);

    try {
      const response = await getSituations(
        context.subject,
        context.grade,
        context.topicId
      );

      console.log('[DEBUG situations raw]', response.data);

      if (!validateApiResponse(response.data, '/prep-cards/.../situations')) {
        throw new Error('Invalid API response');
      }

      const normalized = normalizeSituationsResponse(
        response.data,
        context.topicId
      );

      console.log('[DEBUG situations normalized]', normalized);

      setSituations(normalized.situations);
      setTopicName(normalized.topicName);
    } catch (err) {
      console.error('[Situation load error]', err);
      setError('Failed to load situations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="bg-white/70 border-b shadow-sm">
        <div className="flex items-center gap-4 px-6 py-5">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl"
          >
            ←
          </button>
          <h1 className="text-xl font-bold">🎲 Select a Situation</h1>
        </div>
      </div>

      <div className="px-4 py-4 bg-amber-100">
        <div className="flex gap-2 justify-center">
          <span className="px-3 py-1 bg-white rounded-full">
            📚 {context.subject}
          </span>
          <span className="px-3 py-1 bg-white rounded-full">
            🎯 Grade {context.grade}
          </span>
          <span className="px-3 py-1 bg-white rounded-full">
            💡 {topicName || context.topicId.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        {loading && <p className="text-center">{t('common.loading')}</p>}

        {error && (
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <button onClick={loadSituations}>Try again</button>
          </div>
        )}

        {!loading && !error && situations.length === 0 && (
          <p className="text-center text-gray-500">
            No situations found for this topic.
          </p>
        )}

        {situations.map((s, i) => (
          <button
            key={s._id || i}
            onClick={() => onSituationSelect(s.situation)}
            className="w-full text-left bg-white p-5 rounded-xl shadow mb-4"
          >
            <div className="font-bold">{s.situation}</div>
            <div className="text-sm text-gray-500">
              {s.whatBreaksHere}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
