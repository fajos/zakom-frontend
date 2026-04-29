import { useState, useEffect } from 'react';
import visitService from '../services/visitService';

export default function ViewTestsModal({ patient, onClose, onOrderNew }) {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVisits();
  }, [patient.id]);

  const loadVisits = async () => {
    try {
      const data = await visitService.getByPatient(patient.id);
      setVisits(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading visits:', error);
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  const allTests = visits.flatMap(v => v.test_names || []);
  const totalSpent = visits.reduce((sum, v) => {
  const amount = Number(v.total_amount) || 0;
  return sum + amount;
}, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl my-8 mx-4">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Patient Test History</h2>
            <p className="text-sm text-gray-500 mt-1">
              {patient.name} • {patient.phone}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

              {/* Body */}
              <div className="p-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-zakom-50 rounded-lg p-3">
                          <div className="text-xs text-zakom-500 mb-1">Total Tests</div>
                          <div className="text-2xl font-bold text-blue-700">{allTests.length}</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                          <div className="text-xs text-green-600 mb-1">Total Spent</div>
                          <div className="text-2xl font-bold text-green-700">
                              ₦{Number(totalSpent).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                          </div>
                      </div>
                  </div>

          {/* Visits List */}
          {loading ? (
            <div className="text-center py-8">Loading test history...</div>
          ) : visits.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No tests ordered yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {visits.map((visit, idx) => (
                <div key={visit.id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-gray-500">
                      Order #{idx + 1} • {new Date(visit.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-xs font-bold text-zakom-500">₦{visit.total_amount?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(visit.test_names || []).map((test, i) => (
                      <span key={i} className="text-xs bg-white px-2 py-0.5 rounded border">
                        {test}
                      </span>
                    ))}
                  </div>
                  {visit.result && (
                    <div className="mt-2 p-2 bg-zakom-50 rounded text-xs">
                      <span className="font-medium">Result:</span> {visit.result.substring(0, 100)}...
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-2">
                    Status: {visit.status === 'completed' ? '✅ Completed' : '⏳ Pending'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Button to order new tests */}
          <div className="mt-6 pt-4 border-t">
            <button
              onClick={() => {
                onClose();
                onOrderNew();
              }}
              className="w-full bg-zakom-500 text-white py-2 rounded-lg hover:bg-zakom-600 transition-colors text-sm font-medium"
            >
              + Order New Tests
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}