import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import visitService from '../services/visitService';

export default function LabDashboard() {
  const { user } = useAuth();
  const [pendingVisits, setPendingVisits] = useState([]);
  const [completedVisits, setCompletedVisits] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadVisits();
  }, []);

  const loadVisits = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pending, completed] = await Promise.all([
        visitService.getPending(),
        visitService.getCompleted()
      ]);
      setPendingVisits(Array.isArray(pending) ? pending : []);
      setCompletedVisits(Array.isArray(completed) ? completed : []);
    } catch (err) {
      console.error('Error loading visits:', err);
      setError('Failed to load tests. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadResult = (visit) => {
    setSelectedVisit(visit);
    setShowResultModal(true);
  };

  const handleSaveResults = async (visitId, resultText) => {
    try {
      await visitService.uploadResults(visitId, { result: resultText });
      setShowResultModal(false);
      setSelectedVisit(null);
      await loadVisits();
      alert('✓ Results uploaded successfully!');
    } catch (err) {
      console.error('Error uploading results:', err);
      alert('Error uploading results. Please try again.');
    }
  };

  // Filter pending visits
  const filteredPending = pendingVisits.filter(visit =>
    visit.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (visit.test_names || []).some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading laboratory tests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">🔬 Welcome, {user?.name}</h1>
          <p className="text-gray-500 text-sm mt-1">Laboratory Dashboard</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by patient name or test..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-zakom-500"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="text-xs text-yellow-600 mb-1">Pending Tests</div>
            <div className="text-2xl font-bold text-yellow-700">{pendingVisits.length}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-xs text-green-600 mb-1">Completed Tests</div>
            <div className="text-2xl font-bold text-green-700">{completedVisits.length}</div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Pending Tests */}
        <div className="mb-8">
          <h2 className="text-md font-semibold text-gray-800 mb-3">Pending Tests ({pendingVisits.length})</h2>
          
          {filteredPending.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">No pending tests</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Patient</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Tests</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Order Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPending.map((visit) => (
                    <tr key={visit.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{visit.patient_name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(visit.test_names || []).map((test, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                              {test}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(visit.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleUploadResult(visit)}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs"
                        >
                          Upload Result
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Completed Tests */}
        {completedVisits.length > 0 && (
          <div>
            <h2 className="text-md font-semibold text-gray-800 mb-3">Completed Tests ({completedVisits.length})</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Patient</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Tests</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {completedVisits.slice(0, 10).map((visit) => (
                    <tr key={visit.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{visit.patient_name}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(visit.test_names || []).slice(0, 2).map((test, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                              {test}
                            </span>
                          ))}
                          {(visit.test_names?.length || 0) > 2 && (
                            <span className="text-xs text-gray-400">+{visit.test_names.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {visit.completed_at ? new Date(visit.completed_at).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Result Modal */}
      {showResultModal && selectedVisit && (
        <ResultUploadModal
          visit={selectedVisit}
          onClose={() => setShowResultModal(false)}
          onSave={handleSaveResults}
        />
      )}
    </div>
  );
}

// Result Upload Modal
function ResultUploadModal({ visit, onClose, onSave }) {
  const [resultText, setResultText] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resultText.trim()) {
      alert('Please enter result');
      return;
    }
    setSaving(true);
    await onSave(visit.id, resultText);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center border-b px-4 py-3">
          <h2 className="font-semibold">Upload Result</h2>
          <button onClick={onClose} className="text-gray-400">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <p className="text-sm text-gray-600 mb-2">Patient: {visit.patient_name}</p>
          <div className="mb-3">
            <label className="block text-xs font-medium mb-1">Tests:</label>
            <div className="flex flex-wrap gap-1">
              {(visit.test_names || []).map((t, i) => (
                <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{t}</span>
              ))}
            </div>
          </div>
          <textarea
            value={resultText}
            onChange={(e) => setResultText(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 text-sm border rounded"
            placeholder="Enter result..."
            required
          />
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-3 py-1 text-sm bg-gray-200 rounded">Cancel</button>
            <button type="submit" disabled={saving} className="px-3 py-1 text-sm bg-green-600 text-white rounded">
              {saving ? 'Saving...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}