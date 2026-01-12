import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTopics } from '../api';

export default function ContextSelection({ onContextSelect, onBack }) {
  const { t } = useTranslation();
  const [step, setStep] = useState('subject');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);

  const subjects = [
    { name: 'Mathematics', icon: '🧮', color: 'bg-blue-100', colorHover: 'hover:bg-blue-50', borderColor: 'hover:border-blue-300' },
    { name: 'Science', icon: '🧪', color: 'bg-green-100', colorHover: 'hover:bg-green-50', borderColor: 'hover:border-green-300' }
  ];
  const grades = [9, 10];

  useEffect(() => {
    if (subject && grade && step === 'topic') {
      loadTopics();
    }
  }, [subject, grade, step]);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const response = await getTopics(subject, grade);
      setTopics(response.data);
    } catch (error) {
      console.error('Error loading topics:', error);
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
    onContextSelect({ subject, grade, topicId });
  };

  const handleBack = () => {
    if (step === 'grade') {
      setStep('subject');
      setSubject('');
    } else if (step === 'topic') {
      setStep('grade');
      setGrade('');
    }
  };

  const getHeaderTitle = () => {
    if (step === 'subject') return 'Select Subject';
    if (step === 'grade') return 'Select Grade';
    return 'Select Topic';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <button
          onClick={handleBack}
          className="text-gray-600 hover:text-gray-900 text-2xl hover:opacity-70 transition"
        >
          ←
        </button>
        <h1 className="text-lg font-bold text-gray-900">
          {getHeaderTitle()}
        </h1>
      </div>

      {/* Content */}
      <div className="p-6 max-w-lg mx-auto">
        {/* Subject Selection */}
        {step === 'subject' && (
          <div className="space-y-4 mt-6">
            {subjects.map((s) => (
              <button
                key={s.name}
                onClick={() => handleSubjectSelect(s.name)}
                className={`w-full text-left p-5 rounded-xl border-2 border-gray-200 transition flex items-center gap-4 ${s.colorHover} ${s.borderColor}`}
              >
                <div className={`flex-shrink-0 w-14 h-14 ${s.color} rounded-xl flex items-center justify-center text-2xl`}>
                  {s.icon}
                </div>
                <span className="text-lg font-bold text-gray-900">{s.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Grade Selection */}
        {step === 'grade' && (
          <div className="space-y-3 mt-6">
            {grades.map((g) => (
              <button
                key={g}
                onClick={() => handleGradeSelect(g)}
                className="w-full text-left p-5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-teal-300 transition flex items-center gap-4"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-lg font-bold text-teal-700">
                  {g}
                </div>
                <span className="text-lg font-bold text-gray-900">Grade {g}</span>
              </button>
            ))}
          </div>
        )}

        {/* Topic Selection */}
        {step === 'topic' && (
          <div className="space-y-3 mt-6">
            {loading ? (
              <p className="text-gray-500 text-center py-12">{t('common.loading')}</p>
            ) : (
              topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleTopicSelect(topic.id)}
                  className="w-full text-left p-5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-teal-300 transition"
                >
                  <div className="font-bold text-gray-900">{topic.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{topic.description}</div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
