import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import PatientRegistrationModal from './PatientRegistrationModal';
import PatientList from './PatientList';
import TestSelectionModal from './TestSelectionModal';

export default function ReceptionDashboard() {
  const { user } = useAuth();
  const [showRegModal, setShowRegModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Debug: Log when component mounts
  useEffect(() => {
    console.log('ReceptionDashboard mounted, user:', user);
  }, [user]);

  const handlePatientRegistered = () => {
    setShowRegModal(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSelectTests = (patient) => {
    setSelectedPatient(patient);
    setShowTestModal(true);
  };

  const handleTestsCompleted = () => {
    setShowTestModal(false);
    setSelectedPatient(null);
    setRefreshTrigger(prev => prev + 1);
  };

  if (!user) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="p-6">
        {/* Header with Register Button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">👋 Welcome, {user?.name}</h1>
            <p className="text-gray-500 text-sm mt-1">Reception Dashboard</p>
          </div>
          <button
            onClick={() => setShowRegModal(true)}
            className="bg-zakom-500 text-white px-4 py-2 rounded-lg hover:bg-zakom-600 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <span>➕</span> Register New Patient
          </button>
        </div>

        {/* Patient List - Key forces remount when refreshTrigger changes */}
        <PatientList 
          key={refreshTrigger}
          refreshTrigger={refreshTrigger}
          onSelectTests={handleSelectTests}
        />
      </div>

      {/* Registration Modal */}
      {showRegModal && (
        <PatientRegistrationModal 
          onClose={() => setShowRegModal(false)}
          onRegister={handlePatientRegistered}
        />
      )}

      {/* Test Selection Modal */}
      {showTestModal && selectedPatient && (
        <TestSelectionModal 
          patient={selectedPatient}
          onClose={() => {
            setShowTestModal(false);
            setSelectedPatient(null);
          }}
          onComplete={handleTestsCompleted}
        />
      )}
    </div>
  );
}