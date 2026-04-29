import api from './api';

const userService = {
  getAll: async () => {
    const response = await api.get('/users');
    // Transform backend fields to frontend expected format
    return response.data.map(user => ({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.is_active !== undefined ? user.is_active : true, // Convert snake_case to camelCase
      createdAt: user.created_at || user.createdAt, // Handle both field names
    }));
  },

  create: async (userData) => {
    const response = await api.post('/users', {
      username: userData.username,
      password: userData.password,
      name: userData.name,
      email: userData.email,
      role: userData.role
    });
    return response.data;
  },

  update: async (id, userData) => {
    const payload = {};
    if (userData.name) payload.name = userData.name;
    if (userData.email !== undefined) payload.email = userData.email;
    if (userData.role) payload.role = userData.role;
    if (userData.isActive !== undefined) payload.is_active = userData.isActive;
    if (userData.password && userData.password.trim()) payload.password = userData.password;
    
    const response = await api.put(`/users/${id}`, payload);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export default userService;