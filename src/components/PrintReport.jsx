import { useState, useEffect } from 'react';
import logo from '../assets/zakom-logo.JPG'; // Add this line

export default function PrintReport({ visit, onClose }) {
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const savedPatients = localStorage.getItem('zakom_patients');
    if (savedPatients) {
      const patients = JSON.parse(savedPatients);
      const foundPatient = patients.find(p => p.id === visit.patientId);
      setPatient(foundPatient);
    }
  }, [visit]);

  const parseResultForTest = (testName, fullResult) => {
    if (!fullResult) return '—';
    
    const lines = fullResult.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(testName) || (lines[i].includes('Test:') && lines[i+1]?.includes(testName))) {
        for (let j = i; j < Math.min(i + 5, lines.length); j++) {
          if (lines[j].includes('Result:')) {
            return lines[j].replace('Result:', '').trim();
          }
        }
      }
    }
    
    if (fullResult.length < 100) return fullResult;
    return 'Result recorded';
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>ZAKOM Lab Report - ${visit.patientName}</title>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
            background: #e5e7eb;
            padding: 40px 20px;
          }
          
          .report {
            max-width: 850px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.15);
            overflow: hidden;
          }
          
          /* Header with Logo */
          .header {
            background: linear-gradient(135deg, #0d98ba 0%, #0a7a96 100%);
            padding: 20px 30px;
          }
          
          .logo-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          
          .logo-img {
            height: 60px;
            width: auto;
            background: white;
            border-radius: 8px;
            padding: 5px 15px;
          }
          
          .logo-text {
            text-align: right;
          }
          
          .logo-text h1 {
            font-size: 24px;
            font-weight: 700;
            color: white;
            margin: 0;
          }
          
          .logo-text .subtitle {
            font-size: 11px;
            color: rgba(255,255,255,0.85);
            margin-top: 4px;
          }
          
          .header .tagline {
            font-size: 11px;
            color: rgba(255,255,255,0.7);
            margin-top: 12px;
            padding-top: 8px;
            border-top: 1px solid rgba(255,255,255,0.2);
            text-align: center;
          }
          
          /* Info Card */
          .info-card {
            padding: 20px 25px;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .info-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
          }
          
          .info-item {
            flex: 1;
            min-width: 180px;
          }
          
          .info-label {
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            margin-bottom: 3px;
          }
          
          .info-value {
            font-size: 13px;
            font-weight: 500;
            color: #0f172a;
          }
          
          /* Results Table */
          .results-section {
            padding: 20px 25px;
          }
          
          .section-title {
            font-size: 14px;
            font-weight: 600;
            color: #0d98ba;
            margin-bottom: 12px;
            padding-bottom: 6px;
            border-bottom: 2px solid #e2e8f0;
            display: inline-block;
          }
          
          .results-table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .results-table th {
            text-align: left;
            padding: 10px 0;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .results-table td {
            padding: 12px 0;
            font-size: 13px;
            color: #1e293b;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: top;
          }
          
          .results-table tr:last-child td {
            border-bottom: none;
          }
          
          .test-col {
            width: 45%;
            font-weight: 500;
          }
          
          .result-col {
            width: 55%;
            color: #334155;
            white-space: pre-wrap;
          }
          
          /* Remarks */
          .remarks-box {
            margin: 0 25px 20px 25px;
            padding: 12px 16px;
            background: #fffbeb;
            border-left: 3px solid #f59e0b;
            border-radius: 6px;
          }
          
          .remarks-label {
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            color: #b45309;
            margin-bottom: 4px;
          }
          
          .remarks-text {
            font-size: 12px;
            color: #78350f;
            line-height: 1.4;
          }
          
          /* Footer */
          .footer {
            padding: 15px 25px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            text-align: center;
          }
          
          .footer-text {
            font-size: 9px;
            color: #94a3b8;
            margin-bottom: 8px;
          }
          
          .signature-row {
            display: flex;
            justify-content: space-between;
            margin-top: 12px;
            padding-top: 10px;
            border-top: 1px solid #e2e8f0;
          }
          
          .signature {
            text-align: center;
            font-size: 9px;
            color: #64748b;
          }
          
          .signature .line {
            width: 140px;
            border-top: 1px solid #cbd5e1;
            margin: 6px 0 4px 0;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            .report {
              box-shadow: none;
              border-radius: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="report">
          <div class="header">
            <div class="logo-container">
              <img src="${logo}" alt="ZAKOM Medical" class="logo-img" />
              <div class="logo-text">
                <h1>ZAKOM Medical</h1>
                <div class="subtitle">Diagnostic Centre</div>
              </div>
            </div>
            <div class="tagline">Excellence in Diagnostic Services | Lab ID: ZAK-${visit.id}</div>
          </div>
          
          <div class="info-card">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Patient ID</div>
                <div class="info-value">${patient?.patientId || 'ZAK-' + patient?.id || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Patient Name</div>
                <div class="info-value">${patient?.name || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Age / Gender</div>
                <div class="info-value">${patient?.age || '?'} yrs / ${patient?.gender === 'male' ? 'Male' : patient?.gender === 'female' ? 'Female' : '—'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Order Date</div>
                <div class="info-value">${new Date(visit.createdAt).toLocaleDateString('en-GB')}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Report Date</div>
                <div class="info-value">${new Date().toLocaleDateString('en-GB')}</div>
              </div>
            </div>
          </div>
          
          <div class="results-section">
            <div class="section-title">LABORATORY RESULTS</div>
            <table class="results-table">
              <thead>
                <tr>
                  <th class="test-col">Investigation</th>
                  <th class="result-col">Result / Finding</th>
                </tr>
              </thead>
              <tbody>
                ${visit.tests.map(test => {
                  const result = parseResultForTest(test.name, visit.result);
                  return `
                    <tr>
                      <td class="test-col">${test.name}</td>
                      <td class="result-col">${result}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
          
          ${visit.result && visit.result.includes('Remarks:') ? `
            <div class="remarks-box">
              <div class="remarks-label">Clinical Remarks</div>
              <div class="remarks-text">${visit.result.split('Remarks:')[1].trim()}</div>
            </div>
          ` : ''}
          
          <div class="footer">
            <div class="footer-text">This is a computer-generated report. Valid without signature.</div>
            <div class="signature-row">
              <div class="signature">
                <div class="line"></div>
                <div>Lab Scientist</div>
              </div>
              <div class="signature">
                <div class="line"></div>
                <div>Quality Manager</div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (!patient) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl my-8 mx-4">
        <div className="flex justify-between items-center border-b px-5 py-3 bg-gray-50 rounded-t-xl">
          <div>
            <h2 className="text-md font-semibold text-gray-800">Print Lab Report</h2>
            <p className="text-xs text-gray-500">{patient.name} • {visit.tests.length} test(s)</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handlePrint} 
              className="bg-zakom-500 text-white px-4 py-1.5 rounded-md hover:bg-zakom-600 text-sm font-medium transition-colors"
            >
              🖨️ Print Report
            </button>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 px-2 text-xl leading-5"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-5 bg-gray-100 max-h-[70vh] overflow-y-auto">
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-zakom-500 to-zakom-600 text-white text-center py-4">
              <h3 className="font-semibold text-lg">ZAKOM Medical Diagnostic Centre</h3>
              <p className="text-xs opacity-90">Excellence in Diagnostic Services</p>
            </div>
            <div className="p-4 text-sm space-y-2 bg-gray-50 border-b">
              <p><span className="font-medium text-gray-600">Patient:</span> <span className="text-gray-800">{patient.name}</span></p>
              <p><span className="font-medium text-gray-600">ID:</span> <span className="text-gray-800">{patient.patientId || `ZAK-${patient.id}`}</span></p>
              <p><span className="font-medium text-gray-600">Tests:</span> <span className="text-gray-800">{visit.tests.map(t => t.name).join(', ')}</span></p>
            </div>
            <div className="p-6 text-center text-gray-400 text-sm">
              Click "Print Report" to generate official laboratory report
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}