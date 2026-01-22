import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTopics } from '../api';
import { normalizeTopics, validateApiResponse } from '../lib/normalize';

export default function ContextSelection({ onContextSelect, onBack, onHome }) {
  const { t } = useTranslation();

  const [step, setStep] = useState('subject');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const subjects = [
    { name: 'Maths', icon: '🧮' },
    { name: 'EVS', icon: '🌍' },
  ];

  const grades = [3, 4];

  useEffect(() => {
    if (subject && grade && step === 'topic') {
      loadTopics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, grade, step]);

  const loadTopics = async () => {
    try {
      setLoading(true);
      setError(null);
      setTopics([]);

      const cleanSubject = subject.trim();
      const cleanGrade = Number(grade);

      console.log('[DEBUG loadTopics]', {
        subject: cleanSubject,
        grade: cleanGrade,
      });

      const response = await getTopics(cleanSubject, cleanGrade);
      const data = response.data;

      if (!validateApiResponse(data, '/curriculum/:subject/:grade/topics')) {
        setError('API configuration error');
        return;
      }

      const normalized = normalizeTopics(data);
      setTopics(normalized);

    } catch (err) {
      console.error('[ContextSelection] Error loading topics:', err);
      setError('Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSelect = (s) => {
    setSubject(s);
    setStep('grade');
  };

  const handleGradeSelect = (g) => {
    setGrade(g);
    setStep('topic');
  };

  const handleTopicSelect = (topicId) => {
    onContextSelect({
      subject,
      grade,
      topicId,
    });
  };

  const handleBack = () => {
    if (step === 'grade') {
      setStep('subject');
      setSubject('');
    } else if (step === 'topic') {
      setStep('grade');
      setGrade('');
    } else {
      onBack && onBack();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b p-4 flex items-center gap-4">
        <button onClick={handleBack}>←</button>
        <h1 className="font-bold text-lg">
          {step === 'subject' && 'Select Subject'}
          {step === 'grade' && 'Select Grade'}
          {step === 'topic' && 'Select Topic'}
        </h1>
        <button onClick={onHome} className="ml-auto">🏠</button>
      </div>

      <div className="p-6 max-w-md mx-auto">
        {step === 'subject' && subjects.map(s => (
          <button
            key={s.name}
            onClick={() => handleSubjectSelect(s.name)}
            className="w-full bg-white p-4 rounded mb-3 shadow"
          >
            {s.icon} {s.name}
          </button>
        ))}

        {step === 'grade' && grades.map(g => (
          <button
            key={g}
            onClick={() => handleGradeSelect(g)}
            className="w-full bg-white p-4 rounded mb-3 shadow"
          >
            Grade {g}
          </button>
        ))}

        {step === 'topic' && (
          <>
            {loading && <p>Loading topics…</p>}

            {error && (
              <div className="text-red-600">
                {error}
                <button onClick={loadTopics} className="block mt-2">
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && topics.length === 0 && (
              <p className="text-gray-400">No topics available</p>
            )}

            {topics.map(topic => (
              <button
                key={topic.id}
                onClick={() => handleTopicSelect(topic.id)}
                className="w-full bg-white p-4 rounded mb-3 shadow"
              >
                <div className="font-bold">{topic.name}</div>
                <div className="text-sm text-gray-500">{topic.description}</div>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
