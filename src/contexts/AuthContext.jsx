import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const initAuth = async () => {
    const savedUser = authService.getCurrentUser();
    if (savedUser && authService.isAuthenticated()) {
      setUser(savedUser);
      // Load users if admin/superadmin on page refresh
      if (savedUser.role === 'admin' || savedUser.role === 'superadmin') {
        await loadUsers();
      }
    }
    setLoading(false);
  };
  initAuth();
}, []);

  const loadUsers = async () => {
  try {
    const usersData = await userService.getAll();
    // Ensure each user has proper fields
    const transformedUsers = usersData.map(u => ({
      ...u,
      isActive: u.isActive !== undefined ? u.isActive : true,
      createdAt: u.createdAt || new Date().toISOString()
    }));
    setUsers(transformedUsers);
  } catch (error) {
    console.error('Error loading users:', error);
  }
};

  const login = async (username, password) => {
  try {
    const response = await authService.login(username, password);
    setUser(response.user);
    
    // Load users immediately if admin or superadmin
    if (response.user.role === 'admin' || response.user.role === 'superadmin') {
      await loadUsers(); // Make sure this is called and awaited
    }
    
    return true;
  } catch (error) {
    console.error('Login error:', error.response?.data?.error || error.message);
    return false;
  }
};

  const logout = () => {
    authService.logout();
    setUser(null);
    setUsers([]);
  };

  const hasPermission = (permission) => {
  // Role-based permissions mapping
  const rolePermissions = {
    superadmin: [
      'canManageAllUsers',  // Can manage EVERYONE including admins
      'canManageUsers',
      'canManageAdmins',
      'canViewReports', 
      'canManageTests', 
      'canManageDoctors'
    ],
    admin: [
      'canManageStaff',      // Can manage receptionists and lab scientists only
      'canViewReports', 
      'canManageTests', 
      'canManageDoctors',
      'canViewPatients', 
      'canRegisterPatients'
      // NOTE: NO permission to manage admins or superadmin
    ],
    reception: [
      'canRegisterPatients', 
      'canOrderTests', 
      'canViewPatients', 
      'canEditPatients'
    ],
    lab: [
      'canViewPendingTests', 
      'canUploadResults', 
      'canViewCompletedTests', 
      'canViewPatients'
    ]
  };
  
  return rolePermissions[user?.role]?.includes(permission) || false;
};

// Add helper function to check if user can manage target user
const canManageUser = (targetUser) => {
  if (!user) return false;
  
  // Superadmin can manage anyone
  if (user.role === 'superadmin') return true;
  
  // Admin can manage receptionists and lab scientists only
  if (user.role === 'admin') {
    return targetUser.role === 'reception' || targetUser.role === 'lab';
  }
  
  return false;
};

  const createUser = async (userData) => {
    try {
      const newUser = await userService.create(userData);
      await loadUsers();
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      alert(error.response?.data?.error || 'Error creating user');
      throw error;
    }
  };

  const updateUser = async (userId, userData) => {
  try {
    const updatedUser = await userService.update(userId, userData);
    await loadUsers(); // Refresh the list
    // Update current user if it's the same
    if (user && user.id === userId) {
      const refreshedUser = { ...user, ...userData };
      setUser(refreshedUser);
      localStorage.setItem('zakom_user', JSON.stringify(refreshedUser));
    }
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    alert(error.response?.data?.error || 'Error updating user');
    throw error;
  }
};

  const deleteUser = async (userId) => {
    try {
      await userService.delete(userId);
      await loadUsers();
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.error || 'Error deleting user');
      return false;
    }
  };

  const suspendUser = async (userId) => {
    try {
      await userService.update(userId, { is_active: false });
      await loadUsers();
      return true;
    } catch (error) {
      console.error('Error suspending user:', error);
      alert(error.response?.data?.error || 'Error suspending user');
      return false;
    }
  };

  const activateUser = async (userId) => {
    try {
      await userService.update(userId, { is_active: true });
      await loadUsers();
      return true;
    } catch (error) {
      console.error('Error activating user:', error);
      alert(error.response?.data?.error || 'Error activating user');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      users,
      login,
      logout,
      hasPermission,
      canManageUser,
      createUser,
      updateUser,
      deleteUser,
      suspendUser,
      activateUser,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);