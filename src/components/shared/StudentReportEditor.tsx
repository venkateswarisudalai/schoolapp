import { useState, useEffect } from 'react';
import { ChevronLeft, FileText, Plus, Save, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getAllChildren } from '../../services/childrenService';
import { createStudentReport, getReportsByChild } from '../../services/reportService';
import type { StudentReport as StudentReportData } from '../../services/reportService';
import type { Child } from '../../types/index';
import './StudentReportEditor.css';

interface StudentReportEditorProps {
  onBack: () => void;
  // 'all' = admin sees every student, 'class' = teacher sees only their class
  scope: 'all' | 'class';
}

const REPORT_TYPES: StudentReportData['reportType'][] = ['monthly', 'term', 'annual', 'progress'];

const StudentReportEditor = ({ onBack, scope }: StudentReportEditorProps) => {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [existingReports, setExistingReports] = useState<StudentReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [reportType, setReportType] = useState<StudentReportData['reportType']>('monthly');
  const [period, setPeriod] = useState('');
  const [overallGrade, setOverallGrade] = useState('');
  const [teacherComments, setTeacherComments] = useState('');
  const [academics, setAcademics] = useState<{ subject: string; grade: string; comments: string }[]>([
    { subject: '', grade: '', comments: '' }
  ]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const all = await getAllChildren();
        // TODO (class scope): filter to children in classes this teacher owns
        // once a teacher->classes mapping exists. For now both scopes see all.
        setChildren(all);
      } catch (e) {
        console.error('Error loading children:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [scope]);

  const loadReports = async (child: Child) => {
    setSelectedChild(child);
    try {
      const reports = await getReportsByChild(child.id);
      setExistingReports(reports);
    } catch (e) {
      console.error('Error loading reports:', e);
      setExistingReports([]);
    }
  };

  const resetForm = () => {
    setTitle('');
    setReportType('monthly');
    setPeriod('');
    setOverallGrade('');
    setTeacherComments('');
    setAcademics([{ subject: '', grade: '', comments: '' }]);
    setShowForm(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedChild || !title || !period) return;

    setSaving(true);
    try {
      await createStudentReport({
        childId: selectedChild.id,
        title,
        reportType,
        period,
        academics: academics.filter(a => a.subject.trim()),
        teacherComments: teacherComments || undefined,
        overallGrade: overallGrade || undefined,
        createdBy: user.name || user.id,
        date: new Date().toISOString(),
      });
      resetForm();
      await loadReports(selectedChild);
    } catch (err) {
      console.error('Error saving report:', err);
      alert('Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  const addAcademicRow = () => {
    setAcademics([...academics, { subject: '', grade: '', comments: '' }]);
  };

  const updateAcademic = (idx: number, field: 'subject' | 'grade' | 'comments', val: string) => {
    setAcademics(academics.map((a, i) => i === idx ? { ...a, [field]: val } : a));
  };

  const removeAcademic = (idx: number) => {
    setAcademics(academics.filter((_, i) => i !== idx));
  };

  if (loading) {
    return (
      <div className="content">
        <div className="page-header">
          <button className="back-btn" onClick={onBack}><ChevronLeft size={24} /></button>
          <h2 className="page-title">Student Report</h2>
        </div>
        <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  if (selectedChild && showForm) {
    return (
      <div className="content student-report-editor">
        <div className="page-header">
          <button className="back-btn" onClick={resetForm}><ChevronLeft size={24} /></button>
          <h2 className="page-title">New Report · {selectedChild.name}</h2>
        </div>

        <form onSubmit={handleSave} className="report-form">
          <label>
            Title
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., April Monthly Report" required />
          </label>

          <div className="form-row">
            <label>
              Type
              <select value={reportType} onChange={e => setReportType(e.target.value as StudentReportData['reportType'])}>
                {REPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label>
              Period
              <input value={period} onChange={e => setPeriod(e.target.value)} placeholder="e.g., April 2026" required />
            </label>
          </div>

          <label>
            Overall Grade
            <input value={overallGrade} onChange={e => setOverallGrade(e.target.value)} placeholder="e.g., A" />
          </label>

          <fieldset className="academics-fieldset">
            <legend>Academic Performance</legend>
            {academics.map((a, idx) => (
              <div key={idx} className="academic-row">
                <input placeholder="Subject" value={a.subject} onChange={e => updateAcademic(idx, 'subject', e.target.value)} />
                <input placeholder="Grade" value={a.grade} onChange={e => updateAcademic(idx, 'grade', e.target.value)} />
                <input placeholder="Comments" value={a.comments} onChange={e => updateAcademic(idx, 'comments', e.target.value)} />
                {academics.length > 1 && (
                  <button type="button" className="remove-btn" onClick={() => removeAcademic(idx)}><X size={16} /></button>
                )}
              </div>
            ))}
            <button type="button" className="add-row-btn" onClick={addAcademicRow}>
              <Plus size={14} /> Add subject
            </button>
          </fieldset>

          <label>
            Teacher's Comments
            <textarea value={teacherComments} onChange={e => setTeacherComments(e.target.value)} rows={4} />
          </label>

          <button type="submit" className="save-btn" disabled={saving}>
            <Save size={16} /> {saving ? 'Saving…' : 'Save Report'}
          </button>
        </form>
      </div>
    );
  }

  if (selectedChild) {
    return (
      <div className="content">
        <div className="page-header">
          <button className="back-btn" onClick={() => setSelectedChild(null)}><ChevronLeft size={24} /></button>
          <h2 className="page-title">{selectedChild.name}</h2>
          <button className="primary-btn" onClick={() => setShowForm(true)}>
            <Plus size={16} /> New Report
          </button>
        </div>

        {existingReports.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <p>No reports yet</p>
          </div>
        ) : (
          <div className="reports-list">
            {existingReports.map(r => (
              <div key={r.id} className="report-card">
                <FileText size={20} />
                <div>
                  <h4>{r.title}</h4>
                  <p>{r.period} · {r.reportType}</p>
                </div>
                {r.overallGrade && <strong>{r.overallGrade}</strong>}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}><ChevronLeft size={24} /></button>
        <h2 className="page-title">Student Reports</h2>
      </div>

      {children.length === 0 ? (
        <div className="empty-state">
          <p>No students found</p>
        </div>
      ) : (
        <div className="students-list">
          {children.map(c => (
            <button key={c.id} className="student-row" onClick={() => loadReports(c)}>
              <span>{c.name}</span>
              <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentReportEditor;
