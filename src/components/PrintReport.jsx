import { useState, useEffect } from 'react';

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
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f3f4f6;
            padding: 40px 20px;
          }
          
          .report {
            max-width: 850px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          
          /* Header */
          .header {
            background: linear-gradient(135deg, #0f2b5c 0%, #1a3a6e 100%);
            padding: 28px 32px;
            text-align: center;
          }
          
          .header h1 {
            font-size: 24px;
            font-weight: 600;
            color: white;
            letter-spacing: -0.3px;
            margin-bottom: 6px;
          }
          
          .header .tagline {
            font-size: 12px;
            color: rgba(255,255,255,0.8);
            margin-top: 4px;
          }
          
          .header .badge {
            display: inline-block;
            background: rgba(255,255,255,0.15);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 10px;
            margin-top: 12px;
            color: rgba(255,255,255,0.9);
          }
          
          /* Info Card */
          .info-card {
            padding: 24px 32px;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .info-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
          }
          
          .info-item {
            flex: 1;
            min-width: 180px;
          }
          
          .info-label {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            margin-bottom: 4px;
          }
          
          .info-value {
            font-size: 14px;
            font-weight: 500;
            color: #0f172a;
          }
          
          /* Results Table */
          .results-section {
            padding: 24px 32px;
          }
          
          .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #0f2b5c;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e2e8f0;
          }
          
          .results-table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .results-table th {
            text-align: left;
            padding: 12px 0;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .results-table td {
            padding: 14px 0;
            font-size: 14px;
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
          }
          
          /* Remarks */
          .remarks-box {
            margin: 0 32px 24px 32px;
            padding: 16px 20px;
            background: #fffbeb;
            border-left: 3px solid #f59e0b;
            border-radius: 8px;
          }
          
          .remarks-label {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            color: #b45309;
            margin-bottom: 6px;
          }
          
          .remarks-text {
            font-size: 13px;
            color: #78350f;
            line-height: 1.5;
          }
          
          /* Footer */
          .footer {
            padding: 20px 32px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            text-align: center;
          }
          
          .footer-text {
            font-size: 10px;
            color: #94a3b8;
          }
          
          .signature-row {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
          }
          
          .signature {
            text-align: center;
            font-size: 10px;
            color: #64748b;
          }
          
          .signature .line {
            width: 160px;
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
            <h1>ZAKOM Medical Diagnostic Centre</h1>
            <div class="tagline">Accuracy • Trust • Care</div>
            <div class="badge">Laboratory Test Report</div>
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
            <div class="section-title">Test Results</div>
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
            <div className="bg-gradient-to-r from-zakom-900 to-zakom-800 text-white text-center py-4">
              <h3 className="font-semibold">ZAKOM Medical Diagnostic Centre</h3>
              <p className="text-xs opacity-80">Laboratory Test Report</p>
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