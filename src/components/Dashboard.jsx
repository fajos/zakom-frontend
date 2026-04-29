import { useAuth } from '../contexts/AuthContext';
import ReceptionDashboard from './ReceptionDashboard';
import LabDashboard from './LabDashboard';
import AdminDashboard from './AdminDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return <div>Redirecting...</div>;

  switch (user.role) {
    case 'reception':
      return <ReceptionDashboard />;
    case 'lab':
      return <LabDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'superadmin':
      return <AdminDashboard />;  // Superadmin uses same dashboard with extra permissions
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Unknown Role</h2>
            <p className="text-gray-600">Role: {user.role}</p>
            <p className="text-sm text-gray-500 mt-4">Please contact your administrator.</p>
          </div>
        </div>
      );
  }
}