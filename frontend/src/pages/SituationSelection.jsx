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
    setError(null);               // 🔴 CRITICAL: reset stale error
    setSituations([]);            // 🔴 clear stale data

    try {
      const response = await getSituations(
        context.subject,
        context.grade,
        context.topicId
      );

      console.log('[DEBUG situations raw]', response.data);

      // Guard against SPA HTML fallback
      if (!validateApiResponse(response.data, '/prep-cards/.../situations')) {
        throw new Error('Invalid API response');
      }

      // 🔥 IMPORTANT: normalize response.data (not response)
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

  const getIconForIndex = (index) => {
    const icons = ['🎯', '💡', '⚡', '🔥', '✨', '🌟', '💫', '🚀'];
    return icons[index % icons.length];
  };

  const getGradientForIndex = (index) => {
    const gradients = [
      'from-rose-400 to-pink-500',
      'from-amber-400 to-orange-500',
      'from-emerald-400 to-teal-500',
      'from-blue-400 to-indigo-500',
      'from-violet-400 to-purple-500',
      'from-cyan-400 to-sky-500',
      'from-fuchsia-400 to-pink-500',
      'from-lime-400 to-green-500',
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 relative overflow-hidden">
      {/* Header */}
      <div className="relative z-10 bg-white/70 backdrop-blur-lg border-b border-white/50 shadow-sm">
        <div className="flex items-center gap-4 px-6 py-5">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 text-xl transition-all"
          >
            ←
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            🎲 Select a Situation
          </h1>
        </div>
      </div>

      {/* Context */}
      <div className="relative z-10 px-4 py-4 bg-gradient-to-r from-amber-100/80 to-orange-100/80">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-white/80 text-amber-800 font-semibold">
            📚 {context.subject}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-white/80 text-orange-800 font-semibold">
            🎯 Grade {context.grade}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-white/80 text-rose-800 font-semibold">
            💡 {topicName || context.topicId.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 max-w-2xl mx-auto">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-6">{t('common.loading')}</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 mb-4 text-lg">{error}</p>
            <button
              onClick={loadSituations}
              className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl"
            >
              Try again ↻
            </button>
          </div>
        ) : situations.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No situations found for this topic.
            </p>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {situations.map((situation, index) => (
              <button
                key={situation._id || index}
                onClick={() => onSituationSelect(situation.situation)}
                className="w-full text-left rounded-2xl bg-white shadow-lg p-5 transition hover:shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getGradientForIndex(index)} flex items-center justify-center text-xl`}
                  >
                    {getIconForIndex(index)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-lg">
                      {situation.situation}
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      {situation.whatBreaksHere}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
