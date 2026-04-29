import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const exportService = {
  // Export any data to Excel
  exportToExcel: (data, filename, sheetName = 'Sheet1') => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${filename}.xlsx`);
  },

  // Export to CSV
  exportToCSV: (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
  },

  // Format patients for export
  formatPatientsForExport: (patients, visits) => {
    return patients.map(patient => {
      const patientVisits = visits.filter(v => v.patient_id === patient.id);
      const totalTests = patientVisits.reduce((sum, v) => sum + (v.test_names?.length || 0), 0);
      const totalSpent = patientVisits.reduce((sum, v) => sum + (v.total_amount || 0), 0);
      
      return {
        'Patient ID': patient.patient_id || `PAT-${patient.id}`,
        'Name': patient.name,
        'Phone': patient.phone,
        'Email': patient.email || '—',
        'Age': patient.age || '—',
        'Gender': patient.gender || '—',
        'Address': patient.address || '—',
        'Total Tests': totalTests,
        'Total Spent (₦)': totalSpent,
        'Registration Date': new Date(patient.registered_at || patient.createdAt).toLocaleDateString()
      };
    });
  },

  // Format sales report for export
  formatSalesReport: (dailySales, monthlySales) => {
    return [
      {
        'Report Type': 'Daily Sales',
        'Date': new Date().toLocaleDateString(),
        'Total Revenue (₦)': dailySales?.total_paid || 0,
        'Total Tests': dailySales?.total_visits || 0,
        'Outstanding Balance (₦)': dailySales?.total_balance || 0
      },
      {
        'Report Type': 'Monthly Sales',
        'Month': new Date().toLocaleString('default', { month: 'long' }),
        'Total Revenue (₦)': monthlySales?.total_paid || 0,
        'Total Tests': monthlySales?.total_visits || 0,
        'Unique Patients': monthlySales?.unique_patients || 0,
        'Outstanding Balance (₦)': monthlySales?.total_balance || 0
      }
    ];
  },

  // Format doctors performance for export
  formatDoctorsPerformance: (doctors) => {
    return doctors.map(doctor => ({
      'Doctor Name': doctor.name,
      'Total Referrals': doctor.total_referrals || 0,
      'Total Revenue (₦)': doctor.total_revenue || 0,
      'Discount Rate (%)': doctor.discount_rate,
      'Total Discount Given (₦)': doctor.total_discount_given || 0
    }));
  },

  // Format test volume for export
  formatTestVolume: (tests) => {
    return tests.map(test => ({
      'Test Name': test.name,
      'Category': test.category || 'General',
      'Times Ordered': test.times_ordered || 0,
      'Revenue Generated (₦)': test.revenue_generated || 0,
      'Price (₦)': test.price
    }));
  },

  // Format test catalog for export
  formatTestCatalog: (tests) => {
    return tests.map(test => ({
      'Test Name': test.name,
      'Category': test.category || 'General',
      'Price (₦)': test.price,
      'Reference Range': test.reference_range || '—',
      'Status': test.is_active ? 'Active' : 'Inactive'
    }));
  },

  // Format doctors list for export
  formatDoctorsList: (doctors) => {
    return doctors.map(doctor => ({
      'Doctor Name': doctor.name,
      'Phone': doctor.phone || '—',
      'Email': doctor.email || '—',
      'Discount Rate (%)': doctor.discount_rate,
      'Status': doctor.is_active ? 'Active' : 'Inactive'
    }));
  },

  // Format users for export
  formatUsersList: (users) => {
    return users.map(user => ({
      'Name': user.name,
      'Username': user.username,
      'Email': user.email || '—',
      'Role': user.role === 'superadmin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : user.role === 'reception' ? 'Receptionist' : 'Lab Scientist',
      'Status': user.isActive ? 'Active' : 'Suspended',
      'Created': new Date(user.createdAt).toLocaleDateString()
    }));
  }
};

export default exportService;