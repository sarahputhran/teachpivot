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
    { name: 'Maths', icon: '🧮', gradient: 'from-blue-400 to-indigo-500', bgGradient: 'from-blue-50 to-indigo-50', shadow: 'shadow-blue-200', hoverShadow: 'hover:shadow-blue-300' },
    { name: 'EVS', icon: '🌍', gradient: 'from-emerald-400 to-teal-500', bgGradient: 'from-emerald-50 to-teal-50', shadow: 'shadow-emerald-200', hoverShadow: 'hover:shadow-emerald-300' }
  ];
  const grades = [3, 4];

  useEffect(() => {
    if (subject && grade && step === 'topic') {
      loadTopics();
    }
  }, [subject, grade, step]);

  const loadTopics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getTopics(subject, grade);
      const data = response.data;

      // Validate response isn't HTML (Vercel SPA fallback issue)
      if (!validateApiResponse(data, '/curriculum/topics')) {
        setError('API configuration error');
        setTopics([]);
        return;
      }

      // Normalize at the API boundary
      const normalized = normalizeTopics(data);
      setTopics(normalized);

    } catch (err) {
      console.error('Error loading topics:', err);
      setError('Failed to load topics');
      setTopics([]);
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
    } else if (step === 'subject') {
      onBack && onBack();
    }
  };

  const getHeaderTitle = () => {
    if (step === 'subject') return '📚 Select Subject';
    if (step === 'grade') return '🎯 Select Grade';
    return '💡 Select Topic';
  };

  const getStepNumber = () => {
    if (step === 'subject') return 1;
    if (step === 'grade') return 2;
    return 3;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="blob w-72 h-72 bg-gradient-to-r from-blue-200 to-cyan-200 -top-20 -right-20 opacity-50"></div>
        <div className="blob w-64 h-64 bg-gradient-to-r from-violet-200 to-purple-200 bottom-10 -left-20 opacity-50" style={{ animationDelay: '-4s' }}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/70 backdrop-blur-lg border-b border-white/50 shadow-sm">
        <div className="flex items-center gap-4 px-6 py-5">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 font-bold border border-gray-200 hover:border-violet-300 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <span>←</span> Back
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-800 animate-fade-in">
              {getHeaderTitle()}
            </h1>
            {/* Progress indicator */}
            <div className="flex items-center gap-2 mt-2">
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className={`h-1.5 rounded-full transition-all duration-500 ${num <= getStepNumber()
                    ? 'bg-gradient-to-r from-violet-500 to-purple-500 w-12'
                    : 'bg-gray-200 w-8'
                    }`}
                />
              ))}
            </div>
          </div>
          <button
            onClick={onHome}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 text-xl transition-all duration-300 hover:scale-110 hover:shadow-md"
            title="Return Home"
          >
            🏠
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 max-w-lg mx-auto">
        {/* Subject Selection */}
        {
          step === 'subject' && (
            <div className="space-y-5 mt-8 animate-slide-up">
              <p className="text-black text-center text-2xl font-bold mb-8">What would you like to teach today?</p>
              {subjects.map((s, index) => (
                <button
                  key={s.name}
                  onClick={() => handleSubjectSelect(s.name)}
                  className={`stagger-item w-full text-left rounded-3xl bg-white/80 backdrop-blur-sm border-2 border-transparent hover:border-violet-300 shadow-xl ${s.hoverShadow} transition-all duration-500 card-hover overflow-hidden group`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${s.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  <div className="relative flex items-center gap-5 p-6">
                    <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${s.gradient} rounded-2xl flex items-center justify-center text-3xl shadow-lg ${s.shadow} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                      {s.icon}
                    </div>
                    <span className="text-xl font-bold text-gray-800">{s.name}</span>
                    <div className="ml-auto text-violet-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all duration-300 text-2xl">
                      →
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )
        }

        {/* Grade Selection */}
        {
          step === 'grade' && (
            <div className="space-y-4 mt-8 animate-slide-up">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 font-semibold text-sm">
                  📚 {subject}
                </span>
              </div>
              <p className="text-black text-center text-2xl font-bold mb-6">Which grade are you teaching?</p>
              {grades.map((g, index) => (
                <button
                  key={g}
                  onClick={() => handleGradeSelect(g)}
                  className="stagger-item w-full text-left rounded-3xl bg-white/80 backdrop-blur-sm border-2 border-transparent hover:border-teal-400 shadow-xl hover:shadow-teal-200 transition-all duration-500 card-hover overflow-hidden group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative flex items-center gap-5 p-6">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white shadow-lg shadow-teal-200 group-hover:scale-110 transition-all duration-500">
                      {g}
                    </div>
                    <span className="text-xl font-bold text-gray-800">Grade {g}</span>
                    <div className="ml-auto text-teal-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all duration-300 text-2xl">
                      →
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )
        }

        {/* Topic Selection */}
        {
          step === 'topic' && (
            <div className="space-y-4 mt-6 animate-slide-up">
              <div className="text-center mb-6 flex flex-wrap justify-center gap-2">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 font-semibold text-sm">
                  📚 {subject}
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-700 font-semibold text-sm">
                  🎯 Grade {grade}
                </span>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-500">{t('common.loading')}</p>
                </div>
              ) : error ? (
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 text-center animate-scale-in">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center text-2xl">
                    ⚠️
                  </div>
                  <p className="text-red-600 font-medium mb-4">{error}</p>
                  <button
                    onClick={loadTopics}
                    className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    Try Again ↻
                  </button>
                </div>
              ) : topics.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <span className="text-4xl block mb-3">📭</span>
                  No topics available
                </div>
              ) : (
                topics.map((topic, index) => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicSelect(topic.id)}
                    className="stagger-item w-full text-left rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-transparent hover:border-purple-300 shadow-lg hover:shadow-xl hover:shadow-purple-100 transition-all duration-500 card-hover overflow-hidden group p-5"
                    style={{ animationDelay: `${index * 0.08}s` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center text-sm font-bold text-white shadow group-hover:scale-110 transition-transform duration-300">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-800 group-hover:text-purple-700 transition-colors">{topic.name}</div>
                          <div className="text-sm text-gray-500 mt-1">{topic.description}</div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )
        }
      </div >
    </div >
  );
}
