import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import reportService from '../services/reportService';
import { ChartSkeleton } from './LoadingSkeleton';
import toast from 'react-hot-toast';

const COLORS = ['#0d98ba', '#c9a03d', '#10b981', '#f59e0b', '#ef4444'];

export default function RevenueChart() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [doctorData, setDoctorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);

  // Generate available years (current year and previous 3 years)
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 3; i--) {
      years.push(i);
    }
    setAvailableYears(years);
  }, []);

  useEffect(() => {
    loadChartData();
  }, [selectedYear]);

  const loadChartData = async () => {
    setLoading(true);
    try {
      // Load monthly data for all months of selected year
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyPromises = months.map((_, index) => 
        reportService.getMonthlySales(selectedYear, index + 1)
      );
      const monthlyResults = await Promise.all(monthlyPromises);
      
      const formattedMonthly = monthlyResults.map((data, index) => ({
        month: months[index],
        revenue: data?.total_paid || 0,
        tests: data?.total_visits || 0,
        patients: data?.unique_patients || 0
      }));
      setMonthlyData(formattedMonthly);

      // Load doctor performance for pie chart
      const doctors = await reportService.getDoctorPerformance();
      const topDoctors = (doctors || [])
        .filter(d => d.total_referrals > 0)
        .slice(0, 5);
      setDoctorData(topDoctors);
    } catch (error) {
      console.error('Error loading chart data:', error);
      toast.error('Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ChartSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Year Selector - Dynamic */}
      <div className="flex justify-end">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-zakom-500"
        >
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-md font-semibold text-gray-800 mb-4">Monthly Revenue Trend - {selectedYear}</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`} />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip formatter={(value, name) => [`₦${value?.toLocaleString() || 0}`, name === 'revenue' ? 'Revenue' : name]} />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#0d98ba" name="Revenue (₦)" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="tests" stroke="#c9a03d" name="Tests Conducted" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Tests Bar Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-md font-semibold text-gray-800 mb-4">Monthly Test Volume - {selectedYear}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="tests" fill="#0d98ba" name="Tests" />
            <Bar dataKey="patients" fill="#c9a03d" name="Patients" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Doctor Performance Pie Chart */}
      {doctorData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-md font-semibold text-gray-800 mb-4">Top Referring Doctors</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={doctorData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="total_referrals"
                nameKey="name"
              >
                {doctorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} referrals`, 'Count']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Show message if no data */}
      {monthlyData.every(m => m.revenue === 0 && m.tests === 0) && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No data available for {selectedYear}</p>
        </div>
      )}
    </div>
  );
}