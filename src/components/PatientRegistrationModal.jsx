import { useState, useEffect } from 'react';
import patientService from '../services/patientService';
import visitService from '../services/visitService';
import testService from '../services/testService';
import doctorService from '../services/doctorService';
import { showSuccess, showError, showLoading } from '../utils/toast';

export default function PatientRegistrationModal({ onClose, onRegister }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    age: '',
    gender: '',
    address: '',
  });
  const [availableTests, setAvailableTests] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [referralDoctorId, setReferralDoctorId] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Load tests and doctors on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [testsData, doctorsData] = await Promise.all([
          testService.getAll(),
          doctorService.getAll()
        ]);
        setAvailableTests(testsData);
        setDoctors(doctorsData);
      } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading tests and doctors');
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  // Calculate totals with discount
  const calculateTotals = () => {
    // Make sure selectedTests is an array of IDs and availableTests is loaded
    const subtotal = selectedTests.reduce((sum, testId) => {
      const test = availableTests.find(t => t.id === testId);
      const price = test?.price || 0;
      // Ensure price is a number
      return sum + Number(price);
    }, 0);

    let discountRate = 0;
    let discount = 0;

    if (referralDoctorId) {
      const selectedDoctor = doctors.find(d => d.id === parseInt(referralDoctorId));
      if (selectedDoctor && selectedDoctor.discount_rate) {
        discountRate = Number(selectedDoctor.discount_rate);
        discount = subtotal * (discountRate / 100);
      }
    }

    const total = subtotal - discount;

    return {
      subtotal: Number(subtotal),
      discount: Number(discount),
      discountRate: Number(discountRate),
      total: Number(total)
    };
  };

  const { subtotal, discount, discountRate, total: totalAmount } = calculateTotals();
  const balance = totalAmount - (parseFloat(paidAmount) || 0);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Patient name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (selectedTests.length === 0) newErrors.tests = 'At least one test is required';
    if (!paidAmount || parseFloat(paidAmount) < totalAmount) {
      newErrors.payment = `Full payment of ₦${totalAmount.toLocaleString()} is required`;
    }
    return newErrors;
  };

  const handleTestToggle = (testId) => {
    setSelectedTests(prev => {
      const newSelection = prev.includes(testId)
        ? prev.filter(id => id !== testId)
        : [...prev, testId];
      console.log('Selected tests:', newSelection); // Debug
      return newSelection;
    });
    if (errors.tests) setErrors({ ...errors, tests: null });
  };

  const handlePaymentChange = (e) => {
    const amount = e.target.value;
    setPaidAmount(amount);
    if (errors.payment && parseFloat(amount) >= totalAmount) {
      setErrors({ ...errors, payment: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const loadingToast = showLoading('Registering patient...');

    try {
      // Step 1: Create patient
      const newPatient = await patientService.create({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender || null,
        address: formData.address || null,
      });

      // Step 2: Prepare test objects for the visit
      const selectedTestObjects = selectedTests.map(id => ({
        id: id,
        name: availableTests.find(t => t.id === id)?.name,
        price: availableTests.find(t => t.id === id)?.price
      }));

      // Step 3: Create visit (test order)
      const visitData = {
        patientId: newPatient.id,
        doctorId: referralDoctorId ? parseInt(referralDoctorId) : null,
        tests: selectedTestObjects,
        subtotal: subtotal,
        discount: discount,
        discountRate: discountRate,
        totalAmount: totalAmount,
        paidAmount: parseFloat(paidAmount),
      };

      await visitService.create(visitData);

      toast.dismiss(loadingToast);
      showSuccess(`Patient ${newPatient.name} registered successfully!\nTests: ${selectedTests.length}\nTotal: ₦${totalAmount.toLocaleString()}`);
      onRegister(newPatient);
    } catch (error) {
      toast.dismiss(loadingToast);
      showError('Error registering patient. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  if (loadingData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <p className="text-gray-600">Loading tests and doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8 mx-4">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Register New Patient & Order Tests</h2>
            <p className="text-sm text-red-500 mt-1">⚠️ Tests are required for registration</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" disabled={loading}>✕</button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Patient Information */}
            <div>
              <h3 className="text-md font-semibold text-gray-800 mb-3">Patient Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-zakom-500"
                    placeholder="Enter full name"
                    disabled={loading}
                    autoFocus
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-0.5">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-zakom-500"
                    placeholder="080XXXXXXXX"
                    disabled={loading}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-0.5">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                    placeholder="patient@example.com"
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                      placeholder="Years"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded bg-white"
                      disabled={loading}
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                    placeholder="Residential address"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Tests Selection */}
            <div>
              <h3 className="text-md font-semibold text-gray-800 mb-3">
                Select Tests <span className="text-red-500">*</span>
              </h3>

              {/* Tests Grid */}
              <div className="border rounded-lg p-3 bg-gray-50 max-h-64 overflow-y-auto mb-3">
                {availableTests.map(test => (
                  <label
                    key={test.id}
                    className={`flex items-center justify-between p-2 rounded border cursor-pointer mb-1 ${selectedTests.includes(test.id)
                        ? 'border-zakom-500 bg-zakom-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedTests.includes(test.id)}
                        onChange={() => handleTestToggle(test.id)}
                        className="w-3.5 h-3.5 text-zakom-500 rounded"
                        disabled={loading}
                      />
                      <div>
                        <span className="text-sm text-gray-700">{test.name}</span>
                        <span className="text-xs text-gray-400 ml-2">({test.category || 'General'})</span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      ₦{test.price.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </span>
                  </label>
                ))}
              </div>
              {errors.tests && <p className="text-red-500 text-xs mt-1">{errors.tests}</p>}

              {/* Referral Doctor */}
              <div className="mt-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Referral Doctor (Optional)</label>
                <select
                  value={referralDoctorId}
                  onChange={(e) => setReferralDoctorId(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded bg-white"
                  disabled={loading}
                >
                  <option value="">Self (Walk-in) - No discount</option>
                  {doctors.filter(d => d.name !== 'Self (Walk-in)').map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.discount_rate}% discount
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Summary with Discount */}
              <div className="mt-4 bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center pb-2">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm text-gray-900">₦{subtotal.toLocaleString()}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between items-center pb-2 text-green-600">
                    <span className="text-sm">Discount ({discountRate}%):</span>
                    <span className="text-sm font-medium">- ₦{discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm font-semibold text-gray-700">Total Amount:</span>
                  <span className="text-lg font-bold text-blue-600">
                    ₦{totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Amount Paid <span className="text-red-500">* (Full payment required)</span>
                  </label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={handlePaymentChange}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-zakom-500"
                    placeholder={`Enter ₦${totalAmount.toLocaleString()}`}
                    disabled={loading}
                  />
                  {errors.payment && <p className="text-red-500 text-xs mt-0.5">{errors.payment}</p>}
                </div>

                <div className="flex justify-between items-center pt-2 mt-2 border-t">
                  <span className="text-sm font-medium">Balance:</span>
                  <span className={`text-sm font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₦{balance.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-1.5 text-sm text-white bg-green-600 rounded hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Register & Order Tests →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}