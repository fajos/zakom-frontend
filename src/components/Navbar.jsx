import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-zakom-500 text-white shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Company Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-xl font-bold">ZAKOM</span>
              <span className="text-zakom-gold-500 text-xl font-bold"> Medical</span>
            </div>
            <div className="ml-3 hidden sm:block">
              <span className="text-xs text-zakom-100">Diagnostic Centre</span>
            </div>
          </div>

          {/* Right side - User Info & Logout */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium">{user?.name}</div>
              <div className="text-xs text-zakom-100">
                {user?.role === 'superadmin' ? 'Super Admin' : 
                 user?.role === 'admin' ? 'Admin' : 
                 user?.role === 'reception' ? 'Receptionist' : 'Lab Scientist'}
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}