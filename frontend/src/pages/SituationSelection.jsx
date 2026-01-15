import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getSituations } from '../api';

export default function SituationSelection({ context, onSituationSelect, onBack }) {
  const { t } = useTranslation();
  const [situations, setSituations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSituations();
  }, [context]);

  const loadSituations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSituations(context.subject, context.grade, context.topicId);
      setSituations(response.data || []);
    } catch (err) {
      console.error('Error loading situations:', err);
      setError('Failed to load situations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 text-2xl hover:opacity-70 transition"
        >
          ←
        </button>
        <h1 className="text-lg font-bold text-gray-900">
          Select a Situation
        </h1>
      </div>

      {/* Context Info */}
      <div className="px-6 py-3 bg-teal-50 border-b border-teal-100">
        <p className="text-sm text-teal-800">
          <span className="font-semibold">{context.subject}</span> • Grade {context.grade} • {context.topicId.replace(/_/g, ' ')}
        </p>
      </div>

      {/* Content */}
      <div className="p-6 max-w-2xl mx-auto">
        {loading ? (
          <p className="text-center text-gray-600 py-12">{t('common.loading')}</p>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={loadSituations} className="text-teal-600 underline">Try again</button>
          </div>
        ) : situations.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No situations found for this topic.</p>
        ) : (
          <div className="space-y-3">
            {situations.map((situation, index) => (
              <button
                key={situation._id}
                onClick={() => onSituationSelect(situation.situation)}
                className="w-full text-left p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-teal-300 transition"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-sm font-bold text-teal-700">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {situation.situation}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
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
