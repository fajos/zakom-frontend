import { useState } from 'react';

const AVAILABLE_TESTS = [
  { id: 1, name: 'Complete Blood Count (CBC)', price: 5000, category: 'Hematology' },
  { id: 2, name: 'Malaria Test', price: 2000, category: 'Parasitology' },
  { id: 3, name: 'Blood Sugar (Fasting)', price: 3000, category: 'Biochemistry' },
  { id: 4, name: 'Blood Sugar (Random)', price: 3000, category: 'Biochemistry' },
  { id: 5, name: 'Lipid Profile', price: 8000, category: 'Biochemistry' },
  { id: 6, name: 'Liver Function Test', price: 7000, category: 'Biochemistry' },
  { id: 7, name: 'Kidney Function Test', price: 7000, category: 'Biochemistry' },
  { id: 8, name: 'Urinalysis', price: 2500, category: 'Urinalysis' },
  { id: 9, name: 'COVID-19 Test', price: 15000, category: 'Molecular' },
  { id: 10, name: 'Typhoid Test', price: 3500, category: 'Serology' },
];

export default function TestSelection({ patient, onComplete }) {
  const [selectedTests, setSelectedTests] = useState([]);
  const [referralDoctor, setReferralDoctor] = useState('self');
  const [paidAmount, setPaidAmount] = useState('');

  const totalAmount = selectedTests.reduce((sum, testId) => {
    const test = AVAILABLE_TESTS.find(t => t.id === testId);
    return sum + (test?.price || 0);
  }, 0);

  const balance = totalAmount - (parseFloat(paidAmount) || 0);

  const handleTestToggle = (testId) => {
    setSelectedTests(prev =>
      prev.includes(testId)
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedTests.length === 0) {
      alert('Please select at least one test');
      return;
    }
    if ((parseFloat(paidAmount) || 0) < totalAmount) {
      alert(`Payment required: ₦${totalAmount.toLocaleString()}`);
      return;
    }

        const visit = {
            id: Date.now(),
            patientId: patient.id,
            patientName: patient.name,
            tests: selectedTests.map(id => AVAILABLE_TESTS.find(t => t.id === id)),
            totalAmount,
            paidAmount: parseFloat(paidAmount),
            balance: balance,
            referralDoctor: referralDoctor === 'self' ? null : referralDoctor,
            status: 'pending_lab',
            createdAt: new Date().toISOString(),
        };

        const existing = localStorage.getItem('zakom_visits');
        const visits = existing ? JSON.parse(existing) : [];
        visits.push(visit);
        localStorage.setItem('zakom_visits', JSON.stringify(visits));

        alert(`✓ Visit completed for ${patient.name}\n✓ Tests: ${selectedTests.length}\n✓ Total: ₦${totalAmount.toLocaleString()}`);

        // Reset selections
        setSelectedTests([]);
        setPaidAmount('');

        // Call the onComplete callback to go back to patient list
        if (onComplete) {
            onComplete();
        }
    };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Patient Info Bar */}
      <div className="bg-zakom-50 border-l-4 border-zakom-500 px-4 py-2 text-sm">
        <span className="font-medium">Current Patient:</span> {patient.name} 
        <span className="mx-2 text-gray-300">|</span>
        <span className="font-medium">Phone:</span> {patient.phone}
      </div>

      {/* Tests Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-4 py-3">
          <h3 className="text-md font-semibold text-gray-800">Select Laboratory Tests</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {AVAILABLE_TESTS.map(test => (
              <label 
                key={test.id} 
                className={`flex items-center justify-between p-2 rounded border transition-colors cursor-pointer ${
                  selectedTests.includes(test.id) 
                    ? 'border-zakom-500 bg-zakom-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedTests.includes(test.id)}
                    onChange={() => handleTestToggle(test.id)}
                    className="w-3.5 h-3.5 text-zakom-500 rounded"
                  />
                  <div>
                    <span className="text-sm text-gray-700">{test.name}</span>
                    <span className="text-xs text-gray-400 ml-2">({test.category})</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900">₦{test.price.toLocaleString()}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Two-column layout for Referral & Payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Referral Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-4 py-3">
            <h3 className="text-md font-semibold text-gray-800">Referral Doctor</h3>
          </div>
          <div className="p-4 space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                value="self"
                checked={referralDoctor === 'self'}
                onChange={(e) => setReferralDoctor(e.target.value)}
                className="w-3.5 h-3.5"
              />
              <span>🚶 Self (Walk-in)</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                value="dr_john"
                checked={referralDoctor === 'dr_john'}
                onChange={(e) => setReferralDoctor(e.target.value)}
                className="w-3.5 h-3.5"
              />
              <span>👨‍⚕️ Dr. John Smith (5% discount)</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                value="dr_jane"
                checked={referralDoctor === 'dr_jane'}
                onChange={(e) => setReferralDoctor(e.target.value)}
                className="w-3.5 h-3.5"
              />
              <span>👩‍⚕️ Dr. Jane Doe (10% discount)</span>
            </label>
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-4 py-3">
            <h3 className="text-md font-semibold text-gray-800">Payment Summary</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-gray-600">Total Amount:</span>
              <span className="text-lg font-bold text-zakom-500">₦{totalAmount.toLocaleString()}</span>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Amount Paid (₦)
              </label>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-zakom-500"
                placeholder="Enter amount"
              />
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-medium">Balance:</span>
              <span className={`text-sm font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ₦{balance.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
      >
        Complete Visit & Send to Lab →
      </button>
    </form>
  );
}