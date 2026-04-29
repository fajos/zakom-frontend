import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import PrintReport from './PrintReport';
import UserManagement from './UserManagement';
import AdminReports from './AdminReports';
import TestManagement from './TestManagement';
import DoctorManagement from './DoctorManagement';
import RevenueChart from './RevenueChart';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [printVisit, setPrintVisit] = useState(null);

  const isSuperAdmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedPatients = localStorage.getItem('zakom_patients');
    const savedVisits = localStorage.getItem('zakom_visits');
    if (savedPatients) setPatients(JSON.parse(savedPatients));
    if (savedVisits) setVisits(JSON.parse(savedVisits));
  };

  const handlePrint = (visit) => {
    setPrintVisit(visit);
  };

  // Calculate statistics
  const getDateFiltered = () => {
    const now = new Date();
    let startDate;
    if (dateRange === 'day') startDate = new Date(now.setHours(0, 0, 0, 0));
    else if (dateRange === 'week') startDate = new Date(now.setDate(now.getDate() - 7));
    else if (dateRange === 'month') startDate = new Date(now.setMonth(now.getMonth() - 1));
    else startDate = new Date(0);

    return visits.filter(v => new Date(v.createdAt) >= startDate);
  };

  const filteredVisits = getDateFiltered();
  const totalRevenue = filteredVisits.reduce((sum, v) => sum + v.paidAmount, 0);
  const totalTests = filteredVisits.reduce((sum, v) => sum + v.tests.length, 0);
  const pendingTests = visits.filter(v => v.status === 'pending_lab').length;
  const completedTests = visits.filter(v => v.status === 'completed').length;

  // Doctor referral performance
  const doctorStats = {};
  visits.forEach(visit => {
    if (visit.referralDoctor) {
      if (!doctorStats[visit.referralDoctor]) {
        doctorStats[visit.referralDoctor] = { name: visit.referralDoctor === 'dr_john' ? 'Dr. John Smith' : 'Dr. Jane Doe', revenue: 0, tests: 0 };
      }
      doctorStats[visit.referralDoctor].revenue += visit.totalAmount;
      doctorStats[visit.referralDoctor].tests += visit.tests.length;
    }
  });

  return (
    <div>
      <Navbar />
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">👑 Admin Dashboard</h1>
            {user?.role === 'superadmin' && (
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Super Admin</span>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-1">Laboratory Management & Reports</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-zakom-500' : 'text-gray-500'}`}>Overview</button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'reports'
              ? 'border-b-2 border-zakom-500 text-zakom-500'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            📊 Reports
          </button>
          <button
  onClick={() => setActiveTab('charts')}
  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
    activeTab === 'charts'
      ? 'border-b-2 border-zakom-500 text-zakom-500'
      : 'text-gray-500 hover:text-gray-700'
  }`}
>
  📈 Charts
</button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'tests'
                ? 'border-b-2 border-zakom-500 text-zakom-500'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            🔬 Test Catalog
          </button>

            <button
    onClick={() => setActiveTab('doctors')}
    className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
      activeTab === 'doctors'
        ? 'border-b-2 border-zakom-500 text-zakom-500'
        : 'text-gray-500 hover:text-gray-700'
    }`}
  >
    👨‍⚕️ Doctors
  </button>
          <button onClick={() => setActiveTab('patients')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'patients' ? 'border-b-2 border-blue-600 text-zakom-500' : 'text-gray-500'}`}>Patients</button>
          {(isSuperAdmin || user?.role === 'admin') && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'users'
                ? 'border-b-2 border-blue-600 text-zakom-500'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              👥 User Management
            </button>
          )}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Date Filter */}
            <div className="flex gap-2 mb-6">
              <button onClick={() => setDateRange('day')} className={`px-3 py-1 text-sm rounded ${dateRange === 'day' ? 'bg-zakom-500 text-white' : 'bg-gray-200'}`}>Today</button>
              <button onClick={() => setDateRange('week')} className={`px-3 py-1 text-sm rounded ${dateRange === 'week' ? 'bg-zakom-500 text-white' : 'bg-gray-200'}`}>This Week</button>
              <button onClick={() => setDateRange('month')} className={`px-3 py-1 text-sm rounded ${dateRange === 'month' ? 'bg-zakom-500 text-white' : 'bg-gray-200'}`}>This Month</button>
              <button onClick={() => setDateRange('all')} className={`px-3 py-1 text-sm rounded ${dateRange === 'all' ? 'bg-zakom-500 text-white' : 'bg-gray-200'}`}>All Time</button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-xs text-green-600 mb-1">Total Revenue</div>
                <div className="text-2xl font-bold text-green-700">₦{totalRevenue.toLocaleString()}</div>
              </div>
              <div className="bg-zakom-50 rounded-lg p-4 border border-blue-200">
                <div className="text-xs text-zakom-500 mb-1">Tests Conducted</div>
                <div className="text-2xl font-bold text-blue-700">{totalTests}</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="text-xs text-yellow-600 mb-1">Pending Results</div>
                <div className="text-2xl font-bold text-yellow-700">{pendingTests}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="text-xs text-purple-600 mb-1">Completed</div>
                <div className="text-2xl font-bold text-purple-700">{completedTests}</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b px-4 py-3">
                <h3 className="font-semibold text-gray-800">Recent Test Orders</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Patient</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Tests</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Print</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {visits.slice(0, 10).map(visit => (
                      <tr key={visit.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-500">{new Date(visit.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{visit.patientName}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{visit.tests.length} tests</td>
                        <td className="px-4 py-2 text-sm text-gray-900">₦{visit.totalAmount.toLocaleString()}</td>
                        <td className="px-4 py-2">
                          <span className={`text-xs px-2 py-1 rounded ${visit.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {visit.status === 'completed' ? 'Completed' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          {visit.status === 'completed' && (
                            <button
                              onClick={() => handlePrint(visit)}
                              className="text-zakom-500 hover:text-blue-800 text-xs font-medium bg-zakom-50 px-2 py-1 rounded"
                            >
                              🖨️ Print
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'doctors' && <DoctorManagement />}

        {activeTab === 'patients' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b px-4 py-3">
              <h3 className="font-semibold text-gray-800">All Patients</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Phone</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Tests Done</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total Spent</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {patients.map(patient => {
                    const patientVisits = visits.filter(v => v.patientId === patient.id);
                    const totalTests = patientVisits.reduce((sum, v) => sum + v.tests.length, 0);
                    const totalSpent = patientVisits.reduce((sum, v) => sum + v.totalAmount, 0);
                    return (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{patient.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{patient.phone}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{totalTests}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">₦{totalSpent.toLocaleString()}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{new Date(patient.registeredAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'reports' && <AdminReports />}
        {activeTab === 'charts' && <RevenueChart />}
        {activeTab === 'tests' && <TestManagement />}
        {activeTab === 'users' && <UserManagement />}

      </div>
      {printVisit && (
        <PrintReport
          visit={printVisit}
          onClose={() => setPrintVisit(null)}
        />
      )}
    </div>
  );
}