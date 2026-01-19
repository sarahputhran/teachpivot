import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getCRPDashboard, getCRPHeatmap } from '../api';


/**
 * Convert snake_case to Title Case
 * e.g., "family_friends" -> "Family Friends"
 */
const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export default function CRPDashboard() {
  const { t } = useTranslation();
  const [signals, setSignals] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ subject: '', grade: '' });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [signalsRes, heatmapRes] = await Promise.all([
        getCRPDashboard(filters),
        getCRPHeatmap(filters)
      ]);
      setSignals(signalsRes.data);
      setHeatmap(heatmapRes.data);
    } catch (error) {
      console.error('Error loading CRP data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHeatColor = (difficulty) => {
    if (difficulty > 0.7) return 'from-red-400 to-rose-500';
    if (difficulty > 0.4) return 'from-amber-400 to-orange-500';
    return 'from-emerald-400 to-teal-500';
  };

  const getSuccessColor = (rate) => {
    if (rate > 0.7) return 'text-emerald-600';
    if (rate > 0.4) return 'text-amber-600';
    return 'text-rose-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="blob w-96 h-96 bg-gradient-to-r from-emerald-200 to-teal-200 -top-20 -left-20 opacity-50"></div>
      <div className="blob w-80 h-80 bg-gradient-to-r from-cyan-200 to-blue-200 bottom-20 -right-20 opacity-50" style={{ animationDelay: '-3s' }}></div>
      <div className="blob w-64 h-64 bg-gradient-to-r from-teal-200 to-emerald-200 top-1/2 left-1/4 opacity-40" style={{ animationDelay: '-5s' }}></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10 animate-slide-down">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg mb-6">
            <span className="text-3xl">📊</span>
            <h1 className="text-3xl font-extrabold text-gradient-teal">
              {t('crp.title')}
            </h1>
          </div>
          <p className="text-gray-600">Monitor teaching patterns and help teachers improve</p>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 mb-8 animate-scale-in">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white shadow-lg">
              🔍
            </span>
            <h2 className="text-lg font-bold text-gray-800">Filters</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <select
                value={filters.subject}
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent rounded-xl appearance-none cursor-pointer hover:border-violet-300 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all duration-300 font-medium"
              >
                <option value="">📚 All Subjects</option>
                <option value="Maths">🧮 Maths</option>
                <option value="EVS">🌍 EVS</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
            </div>
            <div className="relative">
              <select
                value={filters.grade}
                onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
                className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent rounded-xl appearance-none cursor-pointer hover:border-violet-300 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all duration-300 font-medium"
              >
                <option value="">🎯 All Grades</option>
                <option value="3">Grade 3</option>
                <option value="4">Grade 4</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
              <div className="absolute inset-2 w-16 h-16 border-4 border-transparent border-b-teal-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
              <div className="absolute inset-4 w-12 h-12 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin" style={{ animationDuration: '0.6s' }}></div>
            </div>
            <p className="text-gray-500 mt-6 animate-pulse">{t('common.loading')}</p>
          </div>
        ) : (
          <>
            {/* Heatmap */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 mb-8 animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
                  🔥
                </span>
                <h2 className="text-xl font-bold text-gray-800">
                  {t('crp.topicHeatmap')}
                </h2>
              </div>
              <div className="space-y-4">
                {heatmap.map((item, index) => (
                  <div
                    key={item.topicId}
                    className="stagger-item flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                    style={{ animationDelay: `${index * 0.08}s` }}
                  >
                    <div className="w-28 text-sm font-bold text-gray-700 truncate" title={toTitleCase(item.topicId)}>
                      {toTitleCase(item.topicId)}
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-10 flex items-center overflow-hidden relative">
                      <div
                        className={`bg-gradient-to-r ${getHeatColor(item.difficulty)} h-full flex items-center justify-end pr-4 text-white text-sm font-bold transition-all duration-700 ease-out rounded-full relative overflow-hidden`}
                        style={{ width: `${Math.max((item.difficulty || 0) * 100, 10)}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 shimmer"></div>
                        <span className="relative z-10">
                          {item.difficulty ? (item.difficulty * 100).toFixed(0) + '%' : '0%'}
                        </span>
                      </div>
                    </div>
                    <div className="w-28 text-sm text-gray-500 flex items-center gap-1">
                      <span className="text-lg">📝</span>
                      {item.totalReflections}
                    </div>
                  </div>
                ))}
                {heatmap.length === 0 && (
                  <div className="text-center py-10 text-gray-400">
                    <span className="text-4xl block mb-3">📭</span>
                    No data available yet
                  </div>
                )}
              </div>
            </div>

            {/* Situation Clusters */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white shadow-lg">
                  📈
                </span>
                <h2 className="text-xl font-bold text-gray-800">
                  {t('crp.situationClusters')}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {signals.map((signal, index) => (
                  <div
                    key={signal._id}
                    className="stagger-item bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-300 card-hover group"
                    style={{ animationDelay: `${index * 0.08}s` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">
                        {toTitleCase(signal.topicId)}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${getSuccessColor(signal.successRate)} bg-gray-100`}>
                        {(signal.successRate * 100).toFixed(0)}% ✓
                      </div>
                    </div>
                    <div className="text-gray-600 mb-3">
                      {signal.situation}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                      <span>📝</span>
                      {signal.totalReflections} reflections
                    </div>
                    {signal.commonReasons?.length > 0 && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1">
                          <span>💡</span> Common reasons:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {signal.commonReasons.map((reason, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 text-xs font-medium"
                            >
                              {toTitleCase(reason.reason)}
                              <span className="bg-violet-200 px-1.5 rounded-full">{reason.count}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {signals.length === 0 && (
                  <div className="col-span-2 text-center py-10 text-gray-400">
                    <span className="text-4xl block mb-3">📭</span>
                    No signals available yet
                  </div>
                )}
              </div>
            </div>

            {/* Privacy note */}
            <div className="mt-8 text-center animate-fade-in">
              <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg text-gray-600">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-lg">
                  🔒
                </span>
                <p className="text-sm">{t('crp.noTeacherIds')}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
