import { useState, useEffect } from 'react';
import patientService from '../services/patientService';
import visitService from '../services/visitService';
import ViewTestsModal from './ViewTestsModal';
import exportService from '../services/exportService';

export default function PatientList({ refreshTrigger, onSelectTests }) {
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingPatient, setEditingPatient] = useState(null);

  const [viewingTests, setViewingTests] = useState(null);

 useEffect(() => {
  loadData();
}, [refreshTrigger]);

const handleViewTests = (patient) => {
  setViewingTests(patient);
};

  const loadData = async () => {
  setLoading(true);
  try {
    const patientsData = await patientService.getAll();
    console.log('Loaded patients:', patientsData); // Debug log
    setPatients(patientsData || []);
    
    // Load visits for each patient
    if (patientsData && patientsData.length > 0) {
      const visitsPromises = patientsData.map(p => visitService.getByPatient(p.id));
      const visitsResults = await Promise.all(visitsPromises);
      const allVisits = visitsResults.flat();
      setVisits(allVisits);
    }
  } catch (error) {
    console.error('Error loading patients:', error);
    setPatients([]);
  } finally {
    setLoading(false);
  }
};

const handleExportPatients = () => {
  const exportData = exportService.formatPatientsForExport(patients, visits);
  exportService.exportToExcel(exportData, `patients_list_${new Date().toLocaleDateString()}`);
};

  const getPatientTests = (patientId) => {
    const patientVisits = visits.filter(v => v.patient_id === patientId);
    return patientVisits.flatMap(v => v.test_names || []);
  };

  const getTotalSpent = (patientId) => {
    const patientVisits = visits.filter(v => v.patient_id === patientId);
    return patientVisits.reduce((sum, v) => {
  const amount = Number(v.total_amount) || 0;
  return sum + amount;
}, 0);
  };

  const handleDelete = async (patientId) => {
    if (window.confirm('Are you sure? This will also delete all test records for this patient.')) {
      try {
        await patientService.delete(patientId);
        await loadData();
      } catch (error) {
        console.error('Error deleting patient:', error);
        alert('Error deleting patient');
      }
    }
  };

  const handleEdit = (patient) => {
    setEditingPatient({ ...patient });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await patientService.update(editingPatient.id, {
        name: editingPatient.name,
        phone: editingPatient.phone,
        email: editingPatient.email,
        age: editingPatient.age,
        gender: editingPatient.gender,
        address: editingPatient.address
      });
      setEditingPatient(null);
      await loadData();
    } catch (error) {
      console.error('Error updating patient:', error);
      alert('Error updating patient');
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">Loading patients...</p>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No patients registered yet</p>
        <p className="text-sm text-gray-400 mt-1">Click "Register New Patient" to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
       <div className="flex justify-between items-center mb-4">
  <input
    type="text"
    placeholder="Search by name or phone..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full max-w-md px-3 py-1.5 text-sm border border-gray-300 rounded"
  />
  <button
    onClick={handleExportPatients}
    className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 ml-2"
  >
    📥 Export to Excel
  </button>
</div>

        {/* Patient Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Info</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact & Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tests & Spending</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => {
                const patientTests = getPatientTests(patient.id);
                const totalSpent = getTotalSpent(patient.id);
                return (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {patient.name}
                      <div className="text-xs text-gray-400">
                        {patient.age || '?'} yrs • {patient.gender || 'Not specified'}
                      </div>
                     </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <div>{patient.phone}</div>
                      {patient.email && <div className="text-xs text-gray-400">{patient.email}</div>}
                      {patient.address && <div className="text-xs text-gray-400 mt-1">📍 {patient.address}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {patientTests.length > 0 ? (
                        <div>
                          <span className="font-medium text-gray-700">{patientTests.length} test(s)</span>
                          <div className="text-xs text-gray-400 mt-1">
                            ₦{totalSpent.toLocaleString()} total spent
                          </div>
                          <div className="text-xs text-gray-400 truncate max-w-xs">
                            {patientTests.slice(0, 2).join(', ')}
                            {patientTests.length > 2 && ` +${patientTests.length - 2}`}
                          </div>
                        </div>
                      ) : (
                        <span className="text-yellow-600 text-xs">No tests ordered</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {new Date(patient.registered_at || patient.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewTests(patient)}
                          className="text-zakom-500 hover:text-blue-800 text-xs font-medium px-2 py-1 rounded bg-zakom-50"
                        >
                          🔬 View Tests
                        </button>
                        <button
                          onClick={() => handleEdit(patient)}
                          className="text-green-600 hover:text-green-800 text-xs font-medium px-2 py-1 rounded bg-green-50"
                          title="Edit patient"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(patient.id)}
                          className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 rounded bg-red-50"
                          title="Delete patient"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-sm text-gray-500">
          Showing {filteredPatients.length} of {patients.length} patients
        </div>
      </div>

      {/* Edit Modal */}
      {editingPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-800">Edit Patient</h2>
              <button onClick={() => setEditingPatient(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleUpdate} className="p-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editingPatient.name}
                    onChange={(e) => setEditingPatient({...editingPatient, name: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editingPatient.phone}
                    onChange={(e) => setEditingPatient({...editingPatient, phone: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingPatient.email || ''}
                    onChange={(e) => setEditingPatient({...editingPatient, email: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={editingPatient.address || ''}
                    onChange={(e) => setEditingPatient({...editingPatient, address: e.target.value})}
                    rows="2"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Age</label>
                    <input
                      type="number"
                      value={editingPatient.age || ''}
                      onChange={(e) => setEditingPatient({...editingPatient, age: e.target.value})}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      value={editingPatient.gender || ''}
                      onChange={(e) => setEditingPatient({...editingPatient, gender: e.target.value})}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded bg-white"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setEditingPatient(null)} className="px-4 py-1.5 text-sm text-gray-600 bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="px-5 py-1.5 text-sm text-white bg-zakom-500 rounded hover:bg-zakom-600">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingTests && (
        <ViewTestsModal
          patient={viewingTests}
          onClose={() => setViewingTests(null)}
          onOrderNew={() => {
            setViewingTests(null);
            onSelectTests(viewingTests);
          }}
        />
      )}

    </>
  );
}