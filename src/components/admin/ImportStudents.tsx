import { useState } from 'react';
import { adminCreateStudent, type CreateStudentData } from '../../services/adminService';
import { ChevronLeft, Upload, Download, CheckCircle, AlertCircle } from 'lucide-react';
import './ImportStudents.css';

interface ImportStudentsProps {
  onBack: () => void;
}

type StudentRow = CreateStudentData;

interface ImportResult {
  success: boolean;
  studentName: string;
  error?: string;
}

const ImportStudents = ({ onBack }: ImportStudentsProps) => {
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const downloadTemplate = () => {
    // Create CSV template
    const headers = [
      'Student Name',
      'Student Username',
      'Student Password',
      'Parent Name',
      'Parent Email',
      'Parent Phone',
      'Parent Password',
      'Class (nursery/lkg/ukg)',
      'Date of Birth (YYYY-MM-DD)',
      'Gender (male/female)',
      'Address',
      'Emergency Contact',
      'Medical Info (optional)',
      'Admission Date (YYYY-MM-DD)'
    ];

    const exampleRow = [
      'Aarav Kumar',
      'aarav',
      'Student@123',
      'Priya Kumar',
      'priya@example.com',
      '+91 9876543210',
      'Parent@123',
      'nursery',
      '2021-03-15',
      'male',
      '123 Main Street, Mumbai',
      '+91 9876543211',
      'No known allergies',
      '2024-01-01'
    ];

    const csvContent = [
      headers.join(','),
      exampleRow.map(field => `"${field}"`).join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): StudentRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    // Skip header row
    const dataLines = lines.slice(1);

    return dataLines.map(line => {
      // Handle CSV with quoted fields
      const fields: string[] = [];
      let currentField = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          fields.push(currentField.trim());
          currentField = '';
        } else {
          currentField += char;
        }
      }
      fields.push(currentField.trim());

      // Map class name to ID
      const classMap: Record<string, string> = { nursery: 'class-1', lkg: 'class-2', ukg: 'class-3', 'class-1': 'class-1', 'class-2': 'class-2', 'class-3': 'class-3' };

      return {
        studentName: fields[0] || '',
        parentName: fields[3] || fields[1] || '',
        parentEmail: fields[4] || '',
        parentPhone: fields[5] || '',
        parentPassword: fields[6] || 'Mayuri@123',
        classId: classMap[fields[7]?.toLowerCase()] || 'class-2',
        dateOfBirth: fields[8] || '',
        gender: (fields[9]?.toLowerCase() === 'female' ? 'female' : 'male') as 'male' | 'female',
        address: fields[10] || '',
        admissionDate: fields[13] || new Date().toISOString().split('T')[0],
        bloodGroup: '',
        allergies: [],
        medications: [],
        medicalConditions: [],
        doctorName: '',
        doctorPhone: '',
        emergencyContacts: [],
        authorizedPickups: [],
      };
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const students = parseCSV(text);

        if (students.length === 0) {
          alert('No valid student data found in the file.');
          return;
        }

        setImporting(true);
        const importResults: ImportResult[] = [];

        for (const student of students) {
          try {
            // Validate required fields
            if (!student.studentName || !student.parentName || !student.parentPhone) {
              importResults.push({
                success: false,
                studentName: student.studentName || 'Unknown',
                error: 'Missing required fields'
              });
              continue;
            }

            await adminCreateStudent(student);
            importResults.push({
              success: true,
              studentName: student.studentName
            });
          } catch (error) {
            importResults.push({
              success: false,
              studentName: student.studentName,
              error: error instanceof Error ? error.message : 'Failed to create student'
            });
          }
        }

        setResults(importResults);
        setShowResults(true);
        setImporting(false);
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Error reading file. Please make sure it\'s a valid CSV file.');
        setImporting(false);
      }
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  if (showResults) {
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return (
      <div className="import-students-container">
        <div className="page-header">
          <button className="back-btn" onClick={onBack}>
            <ChevronLeft size={24} />
          </button>
          <h2 className="page-title">Import Results</h2>
        </div>

        <div className="import-summary">
          <div className="summary-card success">
            <CheckCircle size={32} />
            <div className="summary-number">{successCount}</div>
            <div className="summary-label">Successfully Imported</div>
          </div>
          {failCount > 0 && (
            <div className="summary-card error">
              <AlertCircle size={32} />
              <div className="summary-number">{failCount}</div>
              <div className="summary-label">Failed</div>
            </div>
          )}
        </div>

        <div className="import-results">
          <h3>Detailed Results</h3>
          {results.map((result, index) => (
            <div key={index} className={`result-item ${result.success ? 'success' : 'error'}`}>
              <div className="result-icon">
                {result.success ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              </div>
              <div className="result-info">
                <strong>{result.studentName}</strong>
                {result.error && <span className="error-text">{result.error}</span>}
              </div>
            </div>
          ))}
        </div>

        <button className="btn-primary" onClick={onBack} style={{ marginTop: '20px' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="import-students-container">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="page-title">Import Students</h2>
      </div>

      <div className="import-instructions">
        <h3>📋 Instructions</h3>
        <ol>
          <li>Download the CSV template file</li>
          <li>Fill in student and parent information in Excel/Google Sheets</li>
          <li>Save as CSV file</li>
          <li>Upload the CSV file below</li>
        </ol>

        <div className="important-notes">
          <h4>⚠️ Important Notes:</h4>
          <ul>
            <li><strong>Student Username:</strong> Must be unique (e.g., "aarav", "priya")</li>
            <li><strong>Parent Email:</strong> Must be unique for each family</li>
            <li><strong>Class:</strong> Must be "nursery", "lkg", or "ukg"</li>
            <li><strong>Gender:</strong> Must be "male" or "female"</li>
            <li><strong>Dates:</strong> Format as YYYY-MM-DD (e.g., 2021-03-15)</li>
            <li><strong>Passwords:</strong> Default is Student@123 and Parent@123 if not specified</li>
          </ul>
        </div>
      </div>

      <div className="import-actions">
        <button className="btn-download" onClick={downloadTemplate}>
          <Download size={20} />
          Download CSV Template
        </button>

        <div className="upload-section">
          <label htmlFor="file-upload" className="btn-upload">
            <Upload size={20} />
            {importing ? 'Importing...' : 'Upload CSV File'}
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={importing}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {importing && (
        <div className="import-progress">
          <div className="spinner"></div>
          <p>Importing students... Please wait.</p>
        </div>
      )}
    </div>
  );
};

export default ImportStudents;
