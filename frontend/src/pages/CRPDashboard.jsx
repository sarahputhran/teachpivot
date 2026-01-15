import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getCRPDashboard, getCRPHeatmap } from '../api';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          {t('crp.title')}
        </h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <select
              value={filters.subject}
              onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">All Subjects</option>
              <option value="Maths">Maths</option>
              <option value="EVS">EVS</option>
            </select>
            <select
              value={filters.grade}
              onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">All Grades</option>
              <option value="3">Grade 3</option>
              <option value="4">Grade 4</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-600">{t('common.loading')}</p>
        ) : (
          <>
            {/* Heatmap */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {t('crp.topicHeatmap')}
              </h2>
              <div className="space-y-3">
                {heatmap.map((item) => (
                  <div key={item.topicId} className="flex items-center gap-4">
                    <div className="w-24 text-sm font-semibold text-gray-700">
                      {item.topicId}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-8 flex items-center overflow-hidden">
                      <div
                        className="bg-red-500 h-full flex items-center justify-end pr-2 text-white text-xs font-semibold"
                        style={{ width: `${(item.difficulty || 0) * 100}%` }}
                      >
                        {item.difficulty ? (item.difficulty * 100).toFixed(0) + '%' : ''}
                      </div>
                    </div>
                    <div className="w-20 text-sm text-gray-600">
                      {item.totalReflections} reflections
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Situation Clusters */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {t('crp.situationClusters')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {signals.map((signal) => (
                  <div key={signal._id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="font-semibold text-gray-800">
                      {signal.topicId} - {signal.situation}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      Success Rate: {(signal.successRate * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {signal.totalReflections} reflections
                    </div>
                    {signal.commonReasons?.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs font-semibold text-gray-700 mb-1">Common reasons:</p>
                        {signal.commonReasons.map((reason, idx) => (
                          <div key={idx} className="text-xs text-gray-600">
                            • {reason.reason} ({reason.count})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 text-center text-sm text-gray-600 bg-white rounded-lg p-4">
              <p>{t('crp.noTeacherIds')}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
