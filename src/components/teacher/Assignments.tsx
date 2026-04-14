import { useState, useEffect } from 'react';
import { ChevronLeft, Plus, BookOpen, Calendar, Clock, Trash2, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createAssignment, getAssignmentsByTeacher, getAllAssignments, deleteAssignment, getSubmissionsByAssignment } from '../../services/assignmentService';
import { mockClasses } from '../../data/mockData';
import type { Assignment, AssignmentSubmission } from '../../types/index';
import './Assignments.css';

interface AssignmentsProps {
  onBack: () => void;
}

const Assignments = ({ onBack }: AssignmentsProps) => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [viewAssignment, setViewAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classId, setClassId] = useState(mockClasses[0]?.id || '');
  const [dueDate, setDueDate] = useState('');
  const [type, setType] = useState<Assignment['type']>('homework');
  const [subject, setSubject] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAssignments();
  }, [user]);

  const loadAssignments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = user.role === 'admin'
        ? await getAllAssignments()
        : await getAssignmentsByTeacher(user.id);
      setAssignments(data);
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title || !classId || !dueDate || !subject) return;

    setSaving(true);
    try {
      await createAssignment({
        title,
        description,
        classId,
        teacherId: user.id,
        teacherName: user.name,
        dueDate,
        createdAt: new Date().toISOString(),
        type,
        subject,
        status: 'active',
      });
      // Reset form
      setTitle('');
      setDescription('');
      setDueDate('');
      setSubject('');
      setType('homework');
      setShowCreate(false);
      await loadAssignments();
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Failed to create assignment');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assignment?')) return;
    try {
      await deleteAssignment(id);
      await loadAssignments();
    } catch (error) {
      alert('Failed to delete assignment');
    }
  };

  const handleViewDetails = async (assignment: Assignment) => {
    setViewAssignment(assignment);
    const subs = await getSubmissionsByAssignment(assignment.id);
    setSubmissions(subs);
  };

  const getTypeColor = (t: string) => {
    switch (t) {
      case 'homework': return '#00897B';
      case 'classwork': return '#3b82f6';
      case 'project': return '#f59e0b';
      case 'worksheet': return '#10b981';
      default: return '#64748b';
    }
  };

  const isOverdue = (date: string) => new Date(date) < new Date();

  // Assignment detail view
  if (viewAssignment) {
    const cls = mockClasses.find(c => c.id === viewAssignment.classId);
    return (
      <div className="content">
        <div className="page-header">
          <button className="back-btn" onClick={() => setViewAssignment(null)}>
            <ChevronLeft size={24} />
          </button>
          <h2 className="page-title">Assignment Details</h2>
        </div>

        <div className="assignment-detail-card">
          <div className="assignment-detail-badge" style={{ background: getTypeColor(viewAssignment.type) }}>
            {viewAssignment.type}
          </div>
          <h3>{viewAssignment.title}</h3>
          <p className="assignment-detail-subject">{viewAssignment.subject}</p>
          <p className="assignment-detail-desc">{viewAssignment.description}</p>
          <div className="assignment-detail-meta">
            <span><Calendar size={14} /> Due: {new Date(viewAssignment.dueDate).toLocaleDateString()}</span>
            <span><BookOpen size={14} /> {cls?.name || 'Unknown Class'}</span>
          </div>
        </div>

        <div className="card" style={{ margin: '16px' }}>
          <div className="card-header">
            <h3 className="card-title">Submissions ({submissions.length})</h3>
          </div>
          {submissions.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
              No submissions yet
            </div>
          ) : (
            submissions.map(sub => (
              <div className="list-item" key={sub.id}>
                <div className="list-avatar">
                  {sub.status === 'graded' ? '✅' : sub.status === 'submitted' ? '📝' : '⏳'}
                </div>
                <div className="list-info">
                  <div className="list-name">{sub.childName}</div>
                  <div className="list-detail">
                    {sub.status === 'graded' ? `Grade: ${sub.grade}` : sub.status}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Create form
  if (showCreate) {
    return (
      <div className="content">
        <div className="page-header">
          <button className="back-btn" onClick={() => setShowCreate(false)}>
            <ChevronLeft size={24} />
          </button>
          <h2 className="page-title">Create Assignment</h2>
        </div>

        <form onSubmit={handleCreate} className="assignment-form">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Color the shapes worksheet"
              required
            />
          </div>

          <div className="form-group">
            <label>Subject *</label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g., Mathematics, English, Art"
              required
            />
          </div>

          <div className="form-group">
            <label>Type</label>
            <select value={type} onChange={e => setType(e.target.value as Assignment['type'])}>
              <option value="homework">Homework</option>
              <option value="classwork">Classwork</option>
              <option value="project">Project</option>
              <option value="worksheet">Worksheet</option>
            </select>
          </div>

          <div className="form-group">
            <label>Class *</label>
            <select value={classId} onChange={e => setClassId(e.target.value)} required>
              {mockClasses.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Due Date *</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Instructions for the assignment..."
              rows={4}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
            {saving ? 'Creating...' : 'Create Assignment'}
          </button>
        </form>
      </div>
    );
  }

  // Assignment list
  return (
    <div className="content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="page-title">Assignments</h2>
      </div>

      <div style={{ padding: '0 16px 12px' }}>
        <button className="btn btn-primary btn-block" onClick={() => setShowCreate(true)}>
          <Plus size={18} style={{ marginRight: 8 }} />
          Create New Assignment
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          Loading assignments...
        </div>
      ) : assignments.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={48} />
          <h3>No Assignments Yet</h3>
          <p>Create your first assignment for students</p>
        </div>
      ) : (
        <div className="assignment-list">
          {assignments.map(assignment => {
            const cls = mockClasses.find(c => c.id === assignment.classId);
            const overdue = isOverdue(assignment.dueDate) && assignment.status === 'active';
            return (
              <div className="assignment-card" key={assignment.id} onClick={() => handleViewDetails(assignment)}>
                <div className="assignment-card-header">
                  <span className="assignment-type-badge" style={{ background: getTypeColor(assignment.type) }}>
                    {assignment.type}
                  </span>
                  <div className="assignment-actions">
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(assignment.id); }} className="icon-btn-sm">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h4 className="assignment-card-title">{assignment.title}</h4>
                <p className="assignment-card-subject">{assignment.subject}</p>
                <div className="assignment-card-meta">
                  <span className="assignment-class"><BookOpen size={12} /> {cls?.name}</span>
                  <span className={`assignment-due ${overdue ? 'overdue' : ''}`}>
                    <Clock size={12} /> {overdue ? 'Overdue' : 'Due'}: {new Date(assignment.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="assignment-card-footer">
                  <span>View Details</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Assignments;
