import { useState, useEffect, useCallback } from 'react';
import testService from '../services/testService';
import { useAuth } from '../contexts/AuthContext';
import exportService from '../services/exportService';

export default function TestManagement() {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    reference_range: ''
  });

  const isSuperAdmin = user?.role === 'superadmin';

  const loadTests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await testService.getAll();
      console.log('Loaded tests count:', data?.length);
      // Filter out inactive tests if needed, or show all
      const activeTests = Array.isArray(data) ? data.filter(t => t.is_active !== false) : [];
      setTests(activeTests);
    } catch (error) {
      console.error('Error loading tests:', error);
      setError('Failed to load tests. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleExportTests = () => {
  const exportData = exportService.formatTestCatalog(tests);
  exportService.exportToExcel(exportData, `test_catalog_${new Date().toLocaleDateString()}`);
};

  useEffect(() => {
    loadTests();
  }, [loadTests]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      const testData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        category: formData.category?.trim() || null,
        reference_range: formData.reference_range?.trim() || null
      };
      
      console.log('Saving test data:', testData);
      
      let result;
      if (editingTest) {
        result = await testService.update(editingTest.id, testData);
        console.log('Update result:', result);
        alert('Test updated successfully!');
      } else {
        result = await testService.create(testData);
        console.log('Create result:', result);
        alert('Test created successfully!');
      }
      
      // Close modal and reset form
      setShowModal(false);
      setEditingTest(null);
      setFormData({ name: '', price: '', category: '', reference_range: '' });
      
      // Reload tests to get fresh data
      await loadTests();
      
    } catch (error) {
      console.error('Error saving test:', error);
      const errorMsg = error.response?.data?.error || error.message;
      setError(errorMsg);
      alert(`Error saving test: ${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (test) => {
    console.log('Editing test:', test);
    setEditingTest(test);
    setFormData({
      name: test.name || '',
      price: test.price?.toString() || '',
      category: test.category || '',
      reference_range: test.reference_range || ''
    });
    setShowModal(true);
    setError(null);
  };

  const handleDelete = async (testId) => {
    if (!isSuperAdmin) {
      alert('Only Super Admin can delete tests');
      return;
    }
    if (window.confirm('Are you sure you want to delete this test? This may affect existing records.')) {
      try {
        await testService.delete(testId);
        alert('Test deleted successfully');
        await loadTests();
      } catch (error) {
        console.error('Error deleting test:', error);
        alert('Error deleting test');
      }
    }
  };

  const filteredTests = tests.filter(test =>
    test.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return `₦${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading tests...</p>
      </div>
    );
  }

  if (error && tests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={loadTests} 
          className="mt-2 px-4 py-1 text-sm bg-zakom-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
  <div>
    <h2 className="text-lg font-semibold text-gray-800">Test Catalog Management</h2>
    <p className="text-sm text-gray-500 mt-1">Manage laboratory tests and prices</p>
  </div>
  <div className="flex gap-2">
    <button
      onClick={handleExportTests}
      className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700"
    >
      📥 Export to Excel
    </button>
    <button
      onClick={() => {
        setEditingTest(null);
        setFormData({ name: '', price: '', category: '', reference_range: '' });
        setShowModal(true);
      }}
      className="bg-zakom-500 text-white px-4 py-2 rounded-lg hover:bg-zakom-600 text-sm font-medium"
    >
      + Add New Test
    </button>
  </div>
</div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by test name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-zakom-500"
        />
      </div>

      {/* Tests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference Range</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No tests found
                  </td>
                </tr>
              ) : (
                filteredTests.map((test) => (
                  <tr key={test.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{test.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{test.category || '—'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(test.price)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{test.reference_range || '—'}</td>
                    <td className="px-4 py-3 text-sm space-x-2">
                      <button
                        onClick={() => handleEdit(test)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      {isSuperAdmin && (
                        <button
                          onClick={() => handleDelete(test.id)}
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
          Showing {filteredTests.length} of {tests.length} tests
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingTest ? 'Edit Test' : 'Add New Test'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Test Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-zakom-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Price (₦) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-zakom-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-zakom-500"
                    placeholder="e.g., Hematology, Biochemistry"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Reference Range</label>
                  <textarea
                    value={formData.reference_range}
                    onChange={(e) => setFormData({...formData, reference_range: e.target.value})}
                    rows="2"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-zakom-500"
                    placeholder="Normal reference range for this test"
                  />
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
                  {saving ? 'Saving...' : (editingTest ? 'Save Changes' : 'Create Test')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}