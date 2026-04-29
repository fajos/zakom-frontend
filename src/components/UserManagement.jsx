import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import exportService from '../services/exportService';

export default function UserManagement() {
  const { user, users = [], createUser, updateUser, deleteUser, suspendUser, activateUser, canManageUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'reception'
  });

  const isSuperAdmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin';
  
  // Ensure users is an array
  const safeUsers = Array.isArray(users) ? users : [];

  useEffect(() => {
    // Set loading false when users are loaded or after timeout
    if (safeUsers.length > 0 || (!isSuperAdmin && !isAdmin)) {
      setLoading(false);
    } else {
      // Timeout to prevent infinite loading
      const timer = setTimeout(() => setLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [safeUsers, isSuperAdmin, isAdmin]);

  // Determine which roles this user can create
  const getCreatableRoles = () => {
    if (isSuperAdmin) return ['reception', 'lab', 'admin'];
    if (isAdmin) return ['reception', 'lab'];
    return [];
  };

  const handleExportUsers = () => {
  const exportData = exportService.formatUsersList(users);
  exportService.exportToExcel(exportData, `users_list_${new Date().toLocaleDateString()}`);
};

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!editingUser) {
      const creatableRoles = getCreatableRoles();
      if (!creatableRoles.includes(formData.role)) {
        alert('You do not have permission to create this user role');
        return;
      }
    }
    
    if (editingUser) {
      if (!canManageUser?.(editingUser)) {
        alert('You do not have permission to edit this user');
        return;
      }
      updateUser(editingUser.id, formData);
    } else {
      createUser(formData);
    }
    setShowModal(false);
    setEditingUser(null);
    setFormData({ username: '', password: '', name: '', email: '', role: 'reception' });
  };

  const handleEdit = (userToEdit) => {
    if (!canManageUser?.(userToEdit)) {
      alert('You do not have permission to edit this user');
      return;
    }
    
    setEditingUser(userToEdit);
    setFormData({
      username: userToEdit.username,
      password: '',
      name: userToEdit.name,
      email: userToEdit.email || '',
      role: userToEdit.role
    });
    setShowModal(true);
  };

  const handleDelete = (userId, userRole) => {
    const targetUser = safeUsers.find(u => u.id === userId);
    
    if (!canManageUser?.(targetUser)) {
      alert('You do not have permission to delete this user');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
    }
  };

  const handleSuspend = (userId, userRole, currentStatus) => {
    const targetUser = safeUsers.find(u => u.id === userId);
    
    if (!canManageUser?.(targetUser)) {
      alert('You do not have permission to modify this user');
      return;
    }
    
    if (currentStatus) {
      suspendUser(userId);
    } else {
      activateUser(userId);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'superadmin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'reception': return 'bg-green-100 text-green-800';
      case 'lab': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleName = (role) => {
    switch(role) {
      case 'superadmin': return 'Super Administrator';
      case 'admin': return 'Admin';
      case 'reception': return 'Receptionist';
      case 'lab': return 'Lab Scientist';
      default: return role;
    }
  };

  const canViewUserManagement = isSuperAdmin || isAdmin;
  
  if (!canViewUserManagement) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Access Denied. You don't have permission to view this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading users...</p>
      </div>
    );
  }

  const creatableRoles = getCreatableRoles();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
  <div>
    <h2 className="text-lg font-semibold text-gray-800">User Management</h2>
    <p className="text-sm text-gray-500 mt-1">
      {isSuperAdmin ? 'Manage all users (Full access)' : 'Manage receptionists and lab scientists only'}
    </p>
  </div>
  <div className="flex gap-2">
    <button
      onClick={handleExportUsers}
      className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700"
    >
      📥 Export to Excel
    </button>
    <button
      onClick={() => {
        setEditingUser(null);
        setFormData({ username: '', password: '', name: '', email: '', role: 'reception' });
        setShowModal(true);
      }}
      className="bg-zakom-500 text-white px-4 py-2 rounded-lg hover:bg-zakom-600 text-sm font-medium"
    >
      + Add New User
    </button>
  </div>
</div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {safeUsers.map((u) => {
                const canManageThisUser = canManageUser?.(u) || false;
                const isSuperAdminUser = u.role === 'superadmin';
                
                return (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{u.name}</div>
                      <div className="text-xs text-gray-500">{u.email || 'No email'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{u.username}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(u.role)}`}>
                        {getRoleName(u.role)}
                      </span>
                      {isSuperAdminUser && (
                        <span className="ml-2 text-xs text-purple-600">(Protected)</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Today'}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      {canManageThisUser && (
                        <>
                          <button
                            onClick={() => handleEdit(u)}
                            className="text-zakom-500 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleSuspend(u.id, u.role, u.isActive)}
                            className={`${u.isActive ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}`}
                          >
                            {u.isActive ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(u.id, u.role)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {!canManageThisUser && u.id !== user?.id && (
                        <span className="text-xs text-gray-400 italic">No permission</span>
                      )}
                      {u.id === user?.id && (
                        <span className="text-xs text-gray-400 italic">(You)</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {safeUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Username *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Password {!editingUser && '*'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                    required={!editingUser}
                    placeholder={editingUser ? 'Leave blank to keep same' : 'Enter password'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded bg-white"
                    disabled={editingUser && (editingUser.role === 'superadmin')}
                  >
                    {creatableRoles.includes('reception') && <option value="reception">Receptionist</option>}
                    {creatableRoles.includes('lab') && <option value="lab">Lab Scientist</option>}
                    {creatableRoles.includes('admin') && <option value="admin">Admin</option>}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-1.5 text-sm text-gray-600 bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="px-5 py-1.5 text-sm text-white bg-zakom-500 rounded hover:bg-zakom-600">
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}