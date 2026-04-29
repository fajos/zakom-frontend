import { useState, useEffect } from 'react';
import reportService from '../services/reportService';
import exportService from '../services/exportService';

export default function AdminReports() {
  const [dailySales, setDailySales] = useState(null);
  const [monthlySales, setMonthlySales] = useState(null);
  const [doctorPerformance, setDoctorPerformance] = useState([]);
  const [testVolume, setTestVolume] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());


  useEffect(() => {
    loadAllReports();
  }, [selectedMonth, selectedYear]);

  const loadAllReports = async () => {
    setLoading(true);
    try {
      const [daily, monthly, doctors, tests] = await Promise.all([
        reportService.getDailySales(),
        reportService.getMonthlySales(selectedYear, selectedMonth),
        reportService.getDoctorPerformance(),
        reportService.getTestVolume()
      ]);
      setDailySales(daily);
      setMonthlySales(monthly);
      setDoctorPerformance(Array.isArray(doctors) ? doctors : []);
      setTestVolume(Array.isArray(tests) ? tests : []);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportSales = () => {
  const salesData = exportService.formatSalesReport(dailySales, monthlySales);
  exportService.exportToExcel(salesData, `sales_report_${new Date().toLocaleDateString()}`);
};

const handleExportDoctors = () => {
  exportService.exportToExcel(doctorPerformance, `doctors_performance_${new Date().toLocaleDateString()}`);
};

const handleExportTests = () => {
  exportService.exportToExcel(testVolume, `test_volume_${new Date().toLocaleDateString()}`);
};

  const formatCurrency = (amount) => {
  // Convert to number, handle null/undefined
  const num = Number(amount) || 0;
  // Format with commas for thousands and 2 decimal places
  return `₦${num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading reports...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Date Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded"
            >
              {[2023, 2024, 2025].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded"
            >
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, idx) => (
                <option key={idx} value={idx + 1}>{month}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mb-4">
  <h2 className="text-md font-semibold text-gray-800">Reports Dashboard</h2>
  <div className="flex gap-2">
    <button
      onClick={handleExportSales}
      className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700"
    >
      📊 Export Sales Report
    </button>
  </div>
</div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-xs text-green-600 mb-1">Today's Revenue</div>
          <div className="text-2xl font-bold text-green-700">
            {formatCurrency(dailySales?.total_paid || 0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {dailySales?.total_visits || 0} tests today
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-xs text-blue-600 mb-1">Monthly Revenue</div>
          <div className="text-2xl font-bold text-blue-700">
            {formatCurrency(monthlySales?.total_paid || 0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {monthlySales?.total_visits || 0} tests this month
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="text-xs text-purple-600 mb-1">Unique Patients</div>
          <div className="text-2xl font-bold text-purple-700">
            {monthlySales?.unique_patients || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">this month</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="text-xs text-yellow-600 mb-1">Outstanding Balance</div>
          <div className="text-2xl font-bold text-yellow-700">
            {formatCurrency(monthlySales?.total_balance || 0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">pending payment</div>
        </div>
      </div>

      {/* Doctor Performance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b px-4 py-3">
          <h3 className="font-semibold text-gray-800">👨‍⚕️ Doctor Referral Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Doctor</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Referrals</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Revenue</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Discount Rate</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Discount Given</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {doctorPerformance.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No referral data available
                  </td>
                </tr>
              ) : (
                doctorPerformance.map((doctor, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{doctor.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{doctor.total_referrals || 0}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(doctor.total_revenue)}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{doctor.discount_rate}%</td>
                    <td className="px-4 py-2 text-sm text-red-600">{formatCurrency(doctor.total_discount_given)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test Volume Ranking */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b px-4 py-3">
          <h3 className="font-semibold text-gray-800">🔬 Most Requested Tests</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Test Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Category</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Times Ordered</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {testVolume.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No test data available
                  </td>
                </tr>
              ) : (
                testVolume.slice(0, 10).map((test, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{test.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{test.category || 'General'}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{test.times_ordered || 0}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(test.revenue_generated)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}