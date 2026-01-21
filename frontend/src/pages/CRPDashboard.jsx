import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getCRPDashboard, getCRPHeatmap, submitCRPReview, getPrepCard, createRevision, getRevisions, activateRevision, deleteRevision, updateRevision } from '../api';
import { normalizeSignals, normalizeHeatmap, validateApiResponse } from '../lib/normalize';

// Lightweight modal for CRP review intake
function ReviewModal({ signal, onClose, onSuccess }) {
  const [action, setAction] = useState('');
  const [reasons, setReasons] = useState([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const reasonOptions = [
    'Content unclear',
    'Missing examples',
    'Pacing issue',
    'Language barrier',
    'Prerequisite gap',
    'Other'
  ];

  const handleReasonToggle = (reason) => {
    setReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!action) {
      setError('Please select an action');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await submitCRPReview({
        subject: signal.subject,
        grade: signal.grade,
        topicId: signal.topicId,
        situation: signal.situation,
        aggregatedSignalId: signal._id,
        action,
        reasons,
        notes: notes || null
      });
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Add Review</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            disabled={submitting}
          >
            ×
          </button>
        </div>

        <div className="text-sm text-gray-500 mb-4">
          <span className="font-medium">{signal.topicName}</span> — {signal.situation}
        </div>

        {success ? (
          <div className="text-center py-8">
            <span className="text-4xl block mb-3">✅</span>
            <p className="text-emerald-600 font-medium">Review submitted successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Action dropdown (required) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action <span className="text-red-500">*</span>
              </label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                required
              >
                <option value="">Select action...</option>
                <option value="needs_modification">Needs Modification</option>
                <option value="add_alternate">Add Alternate</option>
                <option value="no_change">No Change</option>
              </select>
            </div>

            {/* Reasons (optional checkboxes) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reasons (optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {reasonOptions.map((reason) => (
                  <label
                    key={reason}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all ${reasons.includes(reason)
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                      : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={reasons.includes(reason)}
                      onChange={() => handleReasonToggle(reason)}
                      className="sr-only"
                    />
                    {reason}
                  </label>
                ))}
              </div>
            </div>

            {/* Notes (optional textarea) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Modal for creating/viewing PrepCard revisions (CRP only)
function RevisionModal({ signal, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [prepCard, setPrepCard] = useState(null);
  const [revisions, setRevisions] = useState([]);
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'history'
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Editing state
  const [editingId, setEditingId] = useState(null);

  // Form state for new revision
  const [guidance, setGuidance] = useState({
    whatBreaksHere: '',
    earlyWarningSigns: [''],
    ifStudentsLost: [''],
    ifStudentsBored: ['']
  });
  const [crpNotes, setCrpNotes] = useState('');

  useEffect(() => {
    loadData();
  }, [signal]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load PrepCard first to get the correct ID
      const prepCardRes = await getPrepCard(signal.subject, signal.grade, signal.topicId, signal.situation);
      const card = prepCardRes.data;
      setPrepCard(card);

      // Then load revisions using the verified PrepCard ID
      try {
        const revisionsRes = await getRevisions(card._id);
        setRevisions(revisionsRes.data?.revisions || []);
      } catch (e) {
        console.warn('Failed to load revisions or none exist', e);
        setRevisions([]);
      }

      // Only reset form if not editing
      if (!editingId) {
        setGuidance({
          whatBreaksHere: card.whatBreaksHere || '',
          earlyWarningSigns: card.earlyWarningSigns?.length > 0 ? card.earlyWarningSigns : [''],
          ifStudentsLost: card.ifStudentsLost?.length > 0 ? card.ifStudentsLost : [''],
          ifStudentsBored: card.ifStudentsBored?.length > 0 ? card.ifStudentsBored : ['']
        });
        setCrpNotes('');
      }
    } catch (err) {
      setError('Failed to load PrepCard data - Ensure Context matches');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleArrayChange = (field, index, value) => {
    setGuidance(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setGuidance(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setGuidance(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleEdit = (rev) => {
    setEditingId(rev._id);
    setGuidance({
      whatBreaksHere: rev.revisedGuidance?.whatBreaksHere || '',
      earlyWarningSigns: rev.revisedGuidance?.earlyWarningSigns?.length > 0 ? rev.revisedGuidance.earlyWarningSigns : [''],
      ifStudentsLost: rev.revisedGuidance?.ifStudentsLost?.length > 0 ? rev.revisedGuidance.ifStudentsLost : [''],
      ifStudentsBored: rev.revisedGuidance?.ifStudentsBored?.length > 0 ? rev.revisedGuidance.ifStudentsBored : ['']
    });
    setCrpNotes(rev.evidenceSummary?.crpNotes || '');
    setActiveTab('create');
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setCrpNotes('');
    // Reset to base card
    setGuidance({
      whatBreaksHere: prepCard.whatBreaksHere || '',
      earlyWarningSigns: prepCard.earlyWarningSigns?.length > 0 ? prepCard.earlyWarningSigns : [''],
      ifStudentsLost: prepCard.ifStudentsLost?.length > 0 ? prepCard.ifStudentsLost : [''],
      ifStudentsBored: prepCard.ifStudentsBored?.length > 0 ? prepCard.ifStudentsBored : ['']
    });
  };

  const handleDelete = async (revId) => {
    if (!confirm('Are you sure you want to delete this draft?')) return;
    try {
      await deleteRevision(revId);
      loadData(); // Reload list
    } catch (err) {
      setError('Failed to delete revision');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Filter out empty array items
      const revisedGuidance = {
        whatBreaksHere: guidance.whatBreaksHere,
        earlyWarningSigns: guidance.earlyWarningSigns.filter(s => s.trim()),
        ifStudentsLost: guidance.ifStudentsLost.filter(s => s.trim()),
        ifStudentsBored: guidance.ifStudentsBored.filter(s => s.trim())
      };

      if (editingId) {
        // Update existing draft
        await updateRevision(editingId, {
          revisedGuidance,
          crpNotes
        });
      } else {
        // Create new draft
        // Check Limit: Max 5 drafts
        const draftCount = revisions.filter(r => r.status === 'draft').length;
        if (draftCount >= 5) {
          throw new Error('Draft limit reached (5). Please delete or activate existing drafts.');
        }

        await createRevision({
          basePrepCardId: prepCard._id,
          revisedGuidance,
          crpNotes,
          triggeringReasons: signal.flagReason ? [signal.flagReason.dominantThemeCriteria?.themeName].filter(Boolean) : []
        });
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save revision');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivate = async (revisionId) => {
    try {
      await activateRevision(revisionId);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to activate revision');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-8 animate-scale-in">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between rounded-t-2xl z-20">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{editingId ? 'Edit Draft Revision' : 'Create Revision'}</h3>
            <p className="text-sm text-gray-500">{signal.topicId} — {signal.situation}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        {success ? (
          <div className="text-center py-12">
            <span className="text-5xl block mb-4">✨</span>
            <p className="text-emerald-600 font-bold text-lg">Revision {editingId ? 'updated' : 'created'} successfully!</p>
            <p className="text-gray-500 mt-2">Teachers will see this as a draft until you activate it.</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-100 sticky top-[73px] bg-white z-10">
              <button
                onClick={() => setActiveTab('create')}
                className={`flex-1 py-3 text-sm font-medium transition-all ${activeTab === 'create'
                  ? 'text-emerald-600 border-b-2 border-emerald-500'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                ✏️ {editingId ? 'Edit Draft' : 'Create Revision'}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-3 text-sm font-medium transition-all ${activeTab === 'history'
                  ? 'text-emerald-600 border-b-2 border-emerald-500'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                📜 History ({revisions.length})
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'create' ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Evidence Summary (read-only) */}
                  {!editingId && signal.interpretedSignals?.topTerms?.length > 0 && (
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <p className="text-xs font-bold text-blue-700 mb-2">📊 Evidence from Teacher Feedback</p>
                      <div className="flex flex-wrap gap-2">
                        {signal.interpretedSignals.topTerms.slice(0, 8).map((term, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {term.term}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* What Breaks Here */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">What Breaks Here</label>
                    <textarea
                      value={guidance.whatBreaksHere}
                      onChange={(e) => setGuidance({ ...guidance, whatBreaksHere: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 resize-none"
                      required
                    />
                  </div>

                  {/* Early Warning Signs */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Early Warning Signs</label>
                    {guidance.earlyWarningSigns.map((sign, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={sign}
                          onChange={(e) => handleArrayChange('earlyWarningSigns', i, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:border-emerald-400"
                          placeholder={`Sign ${i + 1}`}
                        />
                        {guidance.earlyWarningSigns.length > 1 && (
                          <button type="button" onClick={() => removeArrayItem('earlyWarningSigns', i)} className="text-red-400 hover:text-red-600">✕</button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => addArrayItem('earlyWarningSigns')} className="text-sm text-emerald-600 hover:text-emerald-700">+ Add sign</button>
                  </div>

                  {/* If Students Lost */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">If Students Are Lost</label>
                    {guidance.ifStudentsLost.map((tip, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={tip}
                          onChange={(e) => handleArrayChange('ifStudentsLost', i, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:border-emerald-400"
                          placeholder={`Tip ${i + 1}`}
                        />
                        {guidance.ifStudentsLost.length > 1 && (
                          <button type="button" onClick={() => removeArrayItem('ifStudentsLost', i)} className="text-red-400 hover:text-red-600">✕</button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => addArrayItem('ifStudentsLost')} className="text-sm text-emerald-600 hover:text-emerald-700">+ Add tip</button>
                  </div>

                  {/* If Students Bored */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">If Students Are Bored</label>
                    {guidance.ifStudentsBored.map((tip, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={tip}
                          onChange={(e) => handleArrayChange('ifStudentsBored', i, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:border-emerald-400"
                          placeholder={`Tip ${i + 1}`}
                        />
                        {guidance.ifStudentsBored.length > 1 && (
                          <button type="button" onClick={() => removeArrayItem('ifStudentsBored', i)} className="text-red-400 hover:text-red-600">✕</button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => addArrayItem('ifStudentsBored')} className="text-sm text-emerald-600 hover:text-emerald-700">+ Add tip</button>
                  </div>

                  {/* CRP Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CRP Notes <span className="text-gray-400">(internal, not visible to teachers)</span>
                    </label>
                    <textarea
                      value={crpNotes}
                      onChange={(e) => setCrpNotes(e.target.value)}
                      rows={2}
                      placeholder="Why are you making this change?"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-emerald-400 resize-none"
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>
                  )}

                  <div className="flex gap-3 pt-2">
                    {editingId && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200"
                      >
                        Cancel Edit
                      </button>
                    )}
                    <button
                      type={editingId ? "button" : "button"} // Actually wait, cancel button above is correct. Submit button is separate.
                      onClick={onClose}
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200"
                      hidden={!!editingId} // Hide close/cancel if editing? No.
                    >
                      {editingId ? 'Cancel' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl hover:shadow-lg disabled:opacity-50"
                    >
                      {submitting ? 'Saving...' : (editingId ? 'Update Draft' : 'Create Draft Revision')}
                    </button>
                  </div>
                </form>
              ) : (
                /* Revision History Tab */
                <div className="space-y-4">
                  {revisions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <span className="text-4xl block mb-3">📭</span>
                      No revisions yet
                    </div>
                  ) : (
                    revisions.map((rev) => (
                      <div key={rev._id} className={`p-4 rounded-xl border ${rev.status === 'active'
                        ? 'bg-emerald-50 border-emerald-200'
                        : rev.status === 'draft'
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-gray-50 border-gray-200'
                        }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-800">Revision #{rev.revisionNumber}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${rev.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : rev.status === 'draft'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-600'
                            }`}>
                            {rev.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{rev.revisedGuidance?.whatBreaksHere?.slice(0, 100)}...</p>
                        <div className="text-xs text-gray-400 flex justify-between items-center mt-2">
                          <span>
                            Created: {new Date(rev.createdAt).toLocaleDateString()}
                            {rev.activatedAt && ` • Activated: ${new Date(rev.activatedAt).toLocaleDateString()}`}
                          </span>

                          {/* Actions for drafts */}
                          {rev.status === 'draft' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(rev)}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(rev._id)}
                                className="text-red-500 hover:text-red-700 font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>

                        {rev.status === 'draft' && (
                          <button
                            onClick={() => handleActivate(rev._id)}
                            className="mt-3 w-full px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-all shadow-sm"
                          >
                            ✨ Activate (Publish)
                          </button>
                        )}
                        {rev.status === 'active' && (
                          <div className="mt-2 text-xs text-emerald-600 font-bold flex items-center gap-1">
                            <span>👁️</span> Visible to Teachers
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CRPDashboard({ onHome }) {
  const { t } = useTranslation();
  const [signals, setSignals] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ subject: '', grade: '' });
  const [reviewModal, setReviewModal] = useState(null); // Local state for review modal
  const [revisionModal, setRevisionModal] = useState(null); // State for revision modal

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [signalsRes, heatmapRes] = await Promise.all([
        getCRPDashboard(filters),
        getCRPHeatmap(filters)
      ]);

      // Validate responses aren't HTML (Vercel SPA fallback issue)
      if (!validateApiResponse(signalsRes.data, '/crp/dashboard') ||
        !validateApiResponse(heatmapRes.data, '/crp/heatmap')) {
        setError('API configuration error');
        return;
      }

      // Normalize data at the boundary, preserving flag fields from raw response
      const rawSignals = signalsRes.data;
      const normalized = normalizeSignals(rawSignals);
      const signalsWithFlags = normalized.map((signal, index) => ({
        ...signal,
        isFlagged: rawSignals[index]?.isFlagged ?? false,
        flaggedAt: rawSignals[index]?.flaggedAt ?? null,
        flagReason: rawSignals[index]?.flagReason ?? null,
        interpretedSignals: rawSignals[index]?.interpretedSignals, // Explicitly pass through
        reviews: rawSignals[index]?.reviews || [], // Pass through reviews
        latestReview: rawSignals[index]?.latestReview || null
      }));
      setSignals(signalsWithFlags);
      setHeatmap(normalizeHeatmap(heatmapRes.data));
    } catch (error) {
      console.error('Error loading CRP data:', error);
      setError('Failed to load dashboard data');
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
        <div className="relative mb-10 animate-slide-down">
          {/* Home Button absolute top right */}
          <button
            onClick={onHome}
            className="absolute top-0 right-0 w-10 h-10 flex items-center justify-center rounded-xl bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-900 text-xl transition-all duration-300 hover:scale-110 hover:shadow-md z-20"
            title="Return Home"
          >
            🏠
          </button>

          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg mb-6">
              <span className="text-3xl">📊</span>
              <h1 className="text-3xl font-extrabold text-gradient-teal">
                {t('crp.title')}
              </h1>
            </div>
            <p className="text-gray-600">Monitor teaching patterns and help teachers improve</p>
          </div>
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

        {error ? (
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-10 text-center animate-scale-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center text-3xl">
              ⚠️
            </div>
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button
              onClick={loadData}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Try Again ↻
            </button>
          </div>
        ) : loading ? (
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
                    <div className="w-28 text-sm font-bold text-gray-700 truncate" title={item.topicName}>
                      {item.topicName}
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
                        {signal.topicName}
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
                              {reason.reasonLabel}
                              <span className="bg-violet-200 px-1.5 rounded-full">{reason.count}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* NEW: Interpreted Text Signals */}
                    {signal.interpretedSignals?.topTerms?.length > 0 && (
                      <div className="pt-3 mt-3 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1">
                          <span>🗣️</span> Feedback Patterns:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {signal.interpretedSignals.topTerms.slice(0, 5).map((termObj, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100 shadow-sm"
                              title={`Mentioned ${termObj.frequency} time${termObj.frequency > 1 ? 's' : ''}`}
                            >
                              {termObj.term}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* NEW: Reviews Indicator */}
                    {signal.reviews?.length > 0 && (
                      <div className="pt-3 mt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">📋</span>
                          <span className="text-sm font-bold text-gray-700">CRP Reviews ({signal.reviews.length})</span>
                        </div>
                        {signal.latestReview && (
                          <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-sm">
                            <div className="flex justify-between items-center mb-1">
                              <span className={`font-bold uppercase text-xs px-2 py-0.5 rounded-full ${signal.latestReview.action === 'needs_modification' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                                {signal.latestReview.action.replace('_', ' ')}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(signal.latestReview.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {signal.latestReview.notes && (
                              <p className="text-violet-800 italic">"{signal.latestReview.notes}"</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TF-IDF Review Consensus */}
                    {signal.reviewSummary && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 rounded-xl relative overflow-hidden group/summary">
                        <div className="absolute top-0 right-0 p-1 opacity-10 group-hover/summary:opacity-20">
                          <span className="text-4xl">🤖</span>
                        </div>
                        <p className="text-xs font-bold text-violet-700 mb-1 flex items-center gap-1 relative z-10">
                          <span>✨</span> Consensus Summary (AI-Powered)
                        </p>
                        <p className="text-sm text-gray-700 font-medium relative z-10">
                          "{signal.reviewSummary}"
                        </p>
                      </div>
                    )}

                    {signal.isFlagged && (
                      <div className="pt-3 mt-3 border-t border-gray-100 flex gap-2">
                        <button
                          onClick={() => setReviewModal(signal)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:scale-105 transition-all"
                        >
                          <span>📝</span> Add Review
                        </button>
                        <button
                          onClick={() => setRevisionModal(signal)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:scale-105 transition-all"
                        >
                          <span>✏️</span> Create Revision
                        </button>
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

      {/* CRP Review Modal */}
      {reviewModal && (
        <ReviewModal
          signal={reviewModal}
          onClose={() => setReviewModal(null)}
          onSuccess={() => { }}
        />
      )}

      {/* CRP Revision Modal */}
      {revisionModal && (
        <RevisionModal
          signal={revisionModal}
          onClose={() => setRevisionModal(null)}
          onSuccess={() => loadData()}
        />
      )}
    </div>
  );
}
