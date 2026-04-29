import { useState } from 'react';

export default function PatientRegistration({ onPatientRegistered }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    age: '',
    gender: '',
    address: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const newPatient = {
      id: Date.now(),
      ...formData,
      registeredAt: new Date().toISOString(),
      status: 'pending_tests',
    };

    const existing = localStorage.getItem('zakom_patients');
    const patients = existing ? JSON.parse(existing) : [];
    patients.push(newPatient);
    localStorage.setItem('zakom_patients', JSON.stringify(patients));

    onPatientRegistered(newPatient);
    
    setFormData({
      name: '',
      phone: '',
      email: '',
      age: '',
      gender: '',
      address: '',
    });
    setErrors({});

    alert(`✓ Patient ${newPatient.name} registered successfully!`);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-800">New Patient Registration</h2>
        <p className="text-sm text-gray-500 mt-1">Enter patient details to begin</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-zakom-500 focus:border-zakom-500"
              placeholder="Enter full name"
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
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-zakom-500 focus:border-zakom-500"
              placeholder="080XXXXXXXX"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-0.5">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email (Optional)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-zakom-500 focus:border-zakom-500"
              placeholder="patient@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-zakom-500 focus:border-zakom-500"
              placeholder="Years"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-zakom-500 focus:border-zakom-500 bg-white"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-zakom-500 focus:border-zakom-500"
              placeholder="Residential address"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setFormData({
              name: '', phone: '', email: '', age: '', gender: '', address: ''
            })}
            className="px-4 py-1.5 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          >
            Clear
          </button>
          <button
            type="submit"
            className="px-5 py-1.5 text-sm text-white bg-zakom-500 rounded hover:bg-zakom-600 transition-colors font-medium"
          >
            Register Patient →
          </button>
        </div>
      </form>
    </div>
  );
}