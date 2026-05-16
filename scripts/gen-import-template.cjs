/* eslint-disable */
// One-off script: regenerates student_import_template.xlsx at the repo root.
// Run with: node scripts/gen-import-template.cjs
const XLSX = require('xlsx');
const path = require('path');

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
  ['Diya Sharma', '', '', 'Sunita Sharma', 'sunita.sharma@gmail.com', '+91 9876543240', 'Parent@123', 'lkg',   '2021-07-20', 'female', '456 Garden Road, Bangalore', '+91 9876543241', '', '2026-06-01'],
  ['Rohan Patel', '', '', 'Amit Patel', 'amit.patel@gmail.com', '+91 9876543230', 'Parent@123', 'ukg',   '2020-05-10', 'male',   '789 Lake View, Bangalore', '+91 9876543231', 'Asthma — uses inhaler', '2026-06-01'],
];

const aoa = [headers, ...exampleRows];
const ws = XLSX.utils.aoa_to_sheet(aoa);

// Column widths to keep the file readable when opened in Excel
ws['!cols'] = [
  { wch: 22 }, { wch: 30 }, { wch: 30 }, { wch: 22 }, { wch: 28 },
  { wch: 18 }, { wch: 16 }, { wch: 22 }, { wch: 26 }, { wch: 18 },
  { wch: 36 }, { wch: 20 }, { wch: 32 }, { wch: 26 },
];

// Freeze the header row so it stays visible while scrolling
ws['!freeze'] = { xSplit: '0', ySplit: '1', topLeftCell: 'A2', activePane: 'bottomLeft', state: 'frozen' };

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Students');

const out = path.join(__dirname, '..', 'student_import_template.xlsx');
XLSX.writeFile(wb, out);
console.log('Wrote', out);
