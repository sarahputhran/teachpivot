import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getSituations } from '../api';

const situationKeys = [
  { key: 'prerequisite_gap', tKey: 'situation.prerequisiteGap' },
  { key: 'cant_visualize', tKey: 'situation.cantVisualize' },
  { key: 'mixed_pace', tKey: 'situation.mixedPace' },
  { key: 'language_not_landing', tKey: 'situation.languageNotLanding' },
  { key: 'activity_chaos', tKey: 'situation.activityChaos' },
  { key: 'worked_once_failed_later', tKey: 'situation.workedOnceFailed' }
];

export default function SituationSelection({ context, onSituationSelect }) {
  const { t } = useTranslation();
  const [situations, setSituations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSituations();
  }, [context]);

  const loadSituations = async () => {
    try {
      setLoading(true);
      const response = await getSituations(context.subject, context.grade, context.topicId);
      setSituations(response.data);
    } catch (error) {
      console.error('Error loading situations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-8 text-center">
          {t('situation.title')}
        </h1>

        {loading ? (
          <p className="text-center text-gray-600">{t('common.loading')}</p>
        ) : (
          <div className="space-y-3">
            {situations.map((situation) => {
              const situationDisplay = situationKeys.find(
                (s) => s.key === situation.situation
              );
              return (
                <button
                  key={situation._id}
                  onClick={() => onSituationSelect(situation.situation)}
                  className="w-full text-left bg-white rounded-lg shadow p-4 hover:shadow-lg hover:bg-indigo-50 transition"
                >
                  <div className="font-semibold text-gray-800">
                    {t(situationDisplay?.tKey || situation.situation)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {situation.whatBreaksHere}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
