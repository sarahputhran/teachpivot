import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getSituations } from '../api';

export default function SituationSelection({ context, onSituationSelect, onBack }) {
  const { t } = useTranslation();
  const [situations, setSituations] = useState([]);
  const [topicName, setTopicName] = useState(''); // Title Case topic name from API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  if (context?.topicId) {
    loadSituations();
  }
}, [context.topicId]);


  const loadSituations = async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await getSituations(
      context.subject,
      context.grade,
      context.topicId
    );

    // ✅ Normalize response into an array safely
    let situationsArray = [];

    if (Array.isArray(response.data)) {
      // backend returns array directly
      situationsArray = response.data;
    } else if (Array.isArray(response.data?.situations)) {
      // backend returns { topicName, situations }
      situationsArray = response.data.situations;
    }

    setSituations(situationsArray);

    // ✅ Safe topic name
    setTopicName(
      response.data?.topicName ||
      context.topicId.replace(/_/g, ' ')
    );

  } catch (err) {
    console.error('Error loading situations:', err);
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
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="blob w-80 h-80 bg-gradient-to-r from-amber-200 to-orange-200 -top-20 right-10 opacity-50"></div>
        <div className="blob w-72 h-72 bg-gradient-to-r from-rose-200 to-pink-200 bottom-20 -left-20 opacity-50" style={{ animationDelay: '-3s' }}></div>
        <div className="blob w-48 h-48 bg-gradient-to-r from-yellow-200 to-amber-200 top-1/2 right-0 opacity-40" style={{ animationDelay: '-5s' }}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/70 backdrop-blur-lg border-b border-white/50 shadow-sm">
        <div className="flex items-center gap-4 px-6 py-5">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 text-xl transition-all duration-300 hover:scale-110 hover:-translate-x-1"
          >
            ←
          </button>
          <h1 className="text-xl font-bold text-gray-800 animate-fade-in">
            🎲 Select a Situation
          </h1>
        </div>
      </div>

      {/* Context Info */}
      <div className="relative z-10 px-6 py-4 bg-gradient-to-r from-amber-100/80 to-orange-100/80 backdrop-blur-sm border-b border-amber-200/50">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 text-amber-800 font-semibold text-sm shadow-sm">
            📚 {context.subject}
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 text-orange-800 font-semibold text-sm shadow-sm">
            🎯 Grade {context.grade}
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 text-rose-800 font-semibold text-sm shadow-sm">
            💡 {topicName || context.topicId.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 max-w-2xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-orange-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
            </div>
            <p className="text-gray-500 mt-6">{t('common.loading')}</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center text-4xl">
              😕
            </div>
            <p className="text-red-600 mb-4 text-lg">{error}</p>
            <button
              onClick={loadSituations}
              className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Try again ↻
            </button>
          </div>
        ) : situations.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center text-4xl">
              🔍
            </div>
            <p className="text-gray-500 text-lg">No situations found for this topic.</p>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            <p className="text-center text-gray-500 mb-6">Choose a classroom scenario to prepare for</p>
            {situations.map((situation, index) => (
              <button
                key={situation._id}
                onClick={() => onSituationSelect(situation.situation)}
                className="stagger-item w-full text-left rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-transparent hover:border-amber-300 shadow-lg hover:shadow-xl hover:shadow-amber-100 transition-all duration-500 card-hover overflow-hidden group"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-start gap-4 p-5">
                  <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${getGradientForIndex(index)} rounded-xl flex items-center justify-center text-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    {getIconForIndex(index)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-800 group-hover:text-amber-700 transition-colors text-lg">
                      {situation.situation}
                    </div>
                    <div className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {situation.whatBreaksHere}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-amber-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all duration-300 text-2xl self-center">
                    →
                  </div>
                </div>
                {/* Progress bar effect on hover */}
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-amber-400 to-orange-500 group-hover:w-full transition-all duration-700"></div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
