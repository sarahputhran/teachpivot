import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getPrepCard, submitReflection } from '../api';

export default function PrepCard({ context, situation, onBack }) {
  const { t } = useTranslation();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReflection, setShowReflection] = useState(false);

  useEffect(() => {
    loadPrepCard();
  }, [context, situation]);

  const loadPrepCard = async () => {
    try {
      setLoading(true);
      const response = await getPrepCard(context.subject, context.grade, context.topicId, situation);
      setCard(response.data);
    } catch (error) {
      console.error('Error loading prep card:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-gray-600">{t('common.loading')}</p>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <p className="text-gray-600">{t('common.error')}</p>
          <button
            onClick={onBack}
            className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg"
          >
            {t('common.tryAgain')}
          </button>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {context.subject} - Grade {context.grade}
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* What Breaks Here */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              {t('prepCard.whatBreaksHere')}
            </h2>
            <p className="text-gray-700">{card.whatBreaksHere}</p>
          </div>

          {/* Early Warning Signs */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              {t('prepCard.earlyWarnings')}
            </h2>
            <ul className="space-y-1">
              {card.earlyWarningSigns?.map((sign, idx) => (
                <li key={idx} className="text-gray-700 flex items-start">
                  <span className="mr-2">•</span>
                  <span>{sign}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* If Students Are Lost */}
          <div className="bg-red-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              {t('prepCard.ifLost')}
            </h2>
            <ul className="space-y-1">
              {card.ifStudentsLost?.map((tip, idx) => (
                <li key={idx} className="text-red-700 flex items-start">
                  <span className="mr-2">→</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* If Students Are Bored */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-green-800 mb-2">
              {t('prepCard.ifBored')}
            </h2>
            <ul className="space-y-1">
              {card.ifStudentsBored?.map((tip, idx) => (
                <li key={idx} className="text-green-700 flex items-start">
                  <span className="mr-2">→</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Peer Insights */}
          {card.peerInsights?.insight && (
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-300">
              <p className="text-sm text-blue-800">
                <strong>{t('prepCard.peerInsights')}</strong>
              </p>
              <p className="text-blue-700 mt-2">{card.peerInsights.insight}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowReflection(true)}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              {t('prepCard.done')} →
            </button>
            <button
              onClick={onBack}
              className="px-6 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
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

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-4xl mb-4">✨</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {t('reflection.thanks')}
          </h2>
          <p className="text-gray-600">
            Your reflection helps improve guidance for all teachers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {t('reflection.outcome')}
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* Outcome Selection */}
          <div className="space-y-3">
            {[
              { value: 'worked', label: t('reflection.worked') },
              { value: 'partially_worked', label: t('reflection.partiallyWorked') },
              { value: 'didnt_work', label: t('reflection.didntWork') }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setOutcome(option.value)}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
                  outcome === option.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Reason Selection */}
          {outcome && (
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                {t('reflection.reason')} (optional)
              </label>
              <div className="space-y-2">
                {[
                  { value: 'timing_issue', label: t('reflection.timingIssue') },
                  { value: 'prerequisite_weak', label: t('reflection.prerequisiteWeak') },
                  { value: 'example_didnt_land', label: t('reflection.exampleDidntLand') },
                  { value: 'language_confusion', label: t('reflection.languageConfusion') },
                  { value: 'none', label: t('reflection.none') }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setReason(option.value)}
                    className={`w-full py-2 px-4 rounded-lg transition text-left ${
                      reason === option.value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!outcome || submitting}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {submitting ? t('common.loading') : t('reflection.submit')}
          </button>

          <button
            onClick={onBack}
            className="w-full text-gray-600 hover:text-gray-800 transition"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
