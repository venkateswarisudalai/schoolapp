import { useState } from 'react';
import * as XLSX from 'xlsx';
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
      'Student Username (unused, leave blank)',
      'Student Password (unused, leave blank)',
      'Parent Name',
      'Parent Email',
      'Parent Phone',
      'Parent Password',
      'Class (prekg/lkg/ukg)',
      'Date of Birth (YYYY-MM-DD)',
      'Gender (male/female)',
      'Address',
      'Emergency Contact',
      'Medical Info (optional)',
      'Admission Date (YYYY-MM-DD)'
    ];

    const exampleRows = [
      ['Aarav Kumar', '', '', 'Priya Kumar', 'priya.kumar@gmail.com', '+91 9876543210', 'Parent@123', 'prekg', '2022-03-15', 'male', '123 Main Street, Bangalore', '+91 9876543211', 'No known allergies', '2026-06-01'],
      ['Diya Sharma', '', '', 'Sunita Sharma', 'sunita.sharma@gmail.com', '+91 9876543240', 'Parent@123', 'lkg', '2021-07-20', 'female', '456 Garden Road, Bangalore', '+91 9876543241', '', '2026-06-01'],
      ['Rohan Patel', '', '', 'Amit Patel', 'amit.patel@gmail.com', '+91 9876543230', 'Parent@123', 'ukg', '2020-05-10', 'male', '789 Lake View, Bangalore', '+91 9876543231', 'Asthma — uses inhaler', '2026-06-01'],
    ];

    const csvContent = [
      headers.join(','),
      ...exampleRows.map(row => row.map(field => `"${field}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadXlsxTemplate = () => {
    const headers = [
      'Student Name',
      'Student Username (leave blank)',
      'Student Password (leave blank)',
      'Parent Name',
      'Parent Email',
      'Parent Phone',
      'Parent Password',
      'Class (prekg/lkg/ukg)',
      'Date of Birth (YYYY-MM-DD)',
      'Gender (male/female)',
      'Address',
      'Emergency Contact',
      'Medical Info (optional)',
      'Admission Date (YYYY-MM-DD)',
    ];

    const exampleRows = [
      ['Aarav Kumar', '', '', 'Priya Kumar', 'priya.kumar@gmail.com', '+91 9876543210', 'Parent@123', 'prekg', '2022-03-15', 'male', '123 Main Street, Bangalore', '+91 9876543211', 'No known allergies', '2026-06-01'],
      ['Diya Sharma', '', '', 'Sunita Sharma', 'sunita.sharma@gmail.com', '+91 9876543240', 'Parent@123', 'lkg', '2021-07-20', 'female', '456 Garden Road, Bangalore', '+91 9876543241', '', '2026-06-01'],
      ['Rohan Patel', '', '', 'Amit Patel', 'amit.patel@gmail.com', '+91 9876543230', 'Parent@123', 'ukg', '2020-05-10', 'male', '789 Lake View, Bangalore', '+91 9876543231', 'Asthma — uses inhaler', '2026-06-01'],
    ];

    const aoa: (string | number)[][] = [headers, ...exampleRows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    // Reasonable column widths so the file is readable when opened in Excel
    ws['!cols'] = [
      { wch: 22 }, { wch: 18 }, { wch: 18 }, { wch: 22 }, { wch: 28 },
      { wch: 18 }, { wch: 16 }, { wch: 22 }, { wch: 22 }, { wch: 16 },
      { wch: 32 }, { wch: 18 }, { wch: 28 }, { wch: 22 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, 'student_import_template.xlsx');
  };

  // Parse a CSV string into a 2D array of cells (rows of trimmed strings).
  const csvToRows = (text: string): string[][] => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const fields: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
          fields.push(cur.trim());
          cur = '';
        } else {
          cur += ch;
        }
      }
      fields.push(cur.trim());
      return fields;
    });
  };

  // Map a 2D cell grid (with header row at index 0) into StudentRow records.
  const rowsToStudents = (grid: string[][]): StudentRow[] => {
    if (grid.length < 2) return [];
    const dataRows = grid.slice(1);

    const classMap: Record<string, string> = {
      prekg: 'class-1',
      'pre-kg': 'class-1',
      'pre kg': 'class-1',
      nursery: 'class-1',
      lkg: 'class-2',
      ukg: 'class-3',
      'class-1': 'class-1',
      'class-2': 'class-2',
      'class-3': 'class-3',
    };

    return dataRows.map(fields => ({
      studentName: (fields[0] || '').trim(),
      parentName: (fields[3] || fields[1] || '').trim(),
      parentEmail: (fields[4] || '').trim(),
      parentPhone: (fields[5] || '').trim(),
      parentPassword: (fields[6] || '').trim() || 'Parent@123',
      classId: classMap[(fields[7] || '').toLowerCase().trim()] || 'class-2',
      dateOfBirth: (fields[8] || '').trim(),
      gender: ((fields[9] || '').toLowerCase().trim() === 'female' ? 'female' : 'male') as 'male' | 'female',
      address: (fields[10] || '').trim(),
      admissionDate: (fields[13] || '').trim() || new Date().toISOString().split('T')[0],
      bloodGroup: '',
      allergies: [],
      medications: [],
      medicalConditions: [],
      doctorName: '',
      doctorPhone: '',
      emergencyContacts: [],
      authorizedPickups: [],
    }));
  };

  // Parse an .xlsx ArrayBuffer into a 2D string grid using SheetJS.
  const xlsxToRows = (buffer: ArrayBuffer): string[][] => {
    const wb = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = wb.SheetNames[0];
    if (!firstSheetName) return [];
    const sheet = wb.Sheets[firstSheetName];
    const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: false, defval: '' });
    return raw.map(row => (row as unknown[]).map(c => String(c ?? '')));
  };

  const processStudents = async (students: StudentRow[]) => {
    if (students.length === 0) {
      alert('No valid student data found in the file.');
      return;
    }

    setImporting(true);
    const importResults: ImportResult[] = [];

    for (const student of students) {
      try {
        if (!student.studentName || !student.parentName || !student.parentPhone) {
          importResults.push({
            success: false,
            studentName: student.studentName || 'Unknown',
            error: 'Missing required fields (name / parent name / parent phone)',
          });
          continue;
        }
        await adminCreateStudent(student);
        importResults.push({ success: true, studentName: student.studentName });
      } catch (error) {
        importResults.push({
          success: false,
          studentName: student.studentName,
          error: error instanceof Error ? error.message : 'Failed to create student',
        });
      }
    }

    setResults(importResults);
    setShowResults(true);
    setImporting(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isXlsx = /\.xlsx$/i.test(file.name);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        let students: StudentRow[];
        if (isXlsx) {
          const buffer = e.target?.result as ArrayBuffer;
          students = rowsToStudents(xlsxToRows(buffer));
        } else {
          const text = e.target?.result as string;
          students = rowsToStudents(csvToRows(text));
        }
        await processStudents(students);
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Error reading file. Please upload a valid .csv or .xlsx file with the expected columns.');
        setImporting(false);
      }
    };

    if (isXlsx) reader.readAsArrayBuffer(file);
    else reader.readAsText(file);
    event.target.value = ''; // Reset input so the same file can be re-uploaded
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
            <li><strong>Admission Number:</strong> Auto-generated by the app (mkp-prekg-01, mkp-lkg-25, etc.) — do NOT fill in</li>
            <li><strong>Parent Email:</strong> Must be unique for each family — they will log in with this</li>
            <li><strong>Class:</strong> Must be "prekg", "lkg", or "ukg" (lowercase)</li>
            <li><strong>Gender:</strong> Must be "male" or "female"</li>
            <li><strong>Dates:</strong> Format as YYYY-MM-DD (e.g., 2022-03-15)</li>
            <li><strong>Parent Password:</strong> Default is Parent@123 if left blank</li>
            <li><strong>Required:</strong> Student Name, Parent Name, Parent Phone, Class, Date of Birth</li>
          </ul>
        </div>
      </div>

      <div className="import-actions">
        <button className="btn-download" onClick={downloadXlsxTemplate}>
          <Download size={20} />
          Download Excel Template (.xlsx)
        </button>
        <button className="btn-download" onClick={downloadTemplate} style={{ background: '#9e9e9e' }}>
          <Download size={20} />
          Download CSV Template
        </button>

        <div className="upload-section">
          <label htmlFor="file-upload" className="btn-upload">
            <Upload size={20} />
            {importing ? 'Importing...' : 'Upload Excel or CSV File'}
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
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
