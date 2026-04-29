import { useState, useEffect, useCallback } from 'react';
import doctorService from '../services/doctorService';
import { useAuth } from '../contexts/AuthContext';
import exportService from '../services/exportService';

export default function DoctorManagement() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    discount_rate: ''
  });

  const isSuperAdmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin';

  const loadDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await doctorService.getAll();
      console.log('Loaded doctors:', data);
      setDoctors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setError('Failed to load doctors. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleExportDoctors = () => {
  const exportData = exportService.formatDoctorsList(doctors);
  exportService.exportToExcel(exportData, `doctors_list_${new Date().toLocaleDateString()}`);
};

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      const doctorData = {
        name: formData.name.trim(),
        phone: formData.phone?.trim() || null,
        email: formData.email?.trim() || null,
        discount_rate: parseFloat(formData.discount_rate) || 0
      };
      
      console.log('Saving doctor data:', doctorData);
      
      if (editingDoctor) {
        await doctorService.update(editingDoctor.id, doctorData);
        alert('Doctor updated successfully!');
      } else {
        await doctorService.create(doctorData);
        alert('Doctor added successfully!');
      }
      
      setShowModal(false);
      setEditingDoctor(null);
      setFormData({ name: '', phone: '', email: '', discount_rate: '' });
      await loadDoctors();
      
    } catch (error) {
      console.error('Error saving doctor:', error);
      const errorMsg = error.response?.data?.error || error.message;
      setError(errorMsg);
      alert(`Error saving doctor: ${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (doctor) => {
    console.log('Editing doctor:', doctor);
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name || '',
      phone: doctor.phone || '',
      email: doctor.email || '',
      discount_rate: doctor.discount_rate?.toString() || ''
    });
    setShowModal(true);
    setError(null);
  };

  const handleDelete = async (doctorId, doctorName) => {
    if (!isSuperAdmin) {
      alert('Only Super Admin can delete doctors');
      return;
    }
    if (doctorName === 'Self (Walk-in)') {
      alert('Cannot delete the default "Self (Walk-in)" option');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${doctorName}?`)) {
      try {
        await doctorService.delete(doctorId);
        alert('Doctor deleted successfully');
        await loadDoctors();
      } catch (error) {
        console.error('Error deleting doctor:', error);
        alert('Error deleting doctor');
      }
    }
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading doctors...</p>
      </div>
    );
  }

  if (!isAdmin && !isSuperAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Access Denied. Only administrators can manage doctors.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
  <div>
    <h2 className="text-lg font-semibold text-gray-800">Doctor Management</h2>
    <p className="text-sm text-gray-500 mt-1">Manage referral doctors and discount rates</p>
  </div>
  <div className="flex gap-2">
    <button
      onClick={handleExportDoctors}
      className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700"
    >
      📥 Export to Excel
    </button>
    <button
      onClick={() => {
        setEditingDoctor(null);
        setFormData({ name: '', phone: '', email: '', discount_rate: '' });
        setShowModal(true);
      }}
      className="bg-zakom-500 text-white px-4 py-2 rounded-lg hover:bg-zakom-600 text-sm font-medium"
    >
      + Add New Doctor
    </button>
  </div>
</div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by doctor name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-zakom-500"
        />
      </div>

      {/* Doctors Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount Rate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No doctors found
                   </td>
                 </tr>
              ) : (
                filteredDoctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {doctor.name}
                      {doctor.name === 'Self (Walk-in)' && (
                        <span className="ml-2 text-xs text-gray-400">(Default)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{doctor.phone || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{doctor.email || '—'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        {doctor.discount_rate}% discount
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm space-x-2">
                      <button
                        onClick={() => handleEdit(doctor)}
                        className="text-blue-600 hover:text-blue-800"
                        disabled={doctor.name === 'Self (Walk-in)'}
                      >
                        Edit
                      </button>
                      {isSuperAdmin && doctor.name !== 'Self (Walk-in)' && (
                        <button
                          onClick={() => handleDelete(doctor.id, doctor.name)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-sm text-gray-500">
          Showing {filteredDoctors.length} of {doctors.length} doctors
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Doctor Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-zakom-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-zakom-500"
                    placeholder="080XXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-zakom-500"
                    placeholder="doctor@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Discount Rate (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.discount_rate}
                    onChange={(e) => setFormData({...formData, discount_rate: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-zakom-500"
                    placeholder="e.g., 5, 10, 15"
                  />
                  <p className="text-xs text-gray-400 mt-1">Discount applied to patient's total bill</p>
                </div>
              </div>
              {error && (
                <div className="mt-4 p-2 bg-red-100 text-red-700 text-xs rounded">
                  {error}
                </div>
              )}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-4 py-1.5 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="px-5 py-1.5 text-sm text-white bg-zakom-500 rounded hover:bg-zakom-600 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : (editingDoctor ? 'Save Changes' : 'Add Doctor')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}