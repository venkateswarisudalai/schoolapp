import { useState, useEffect } from 'react';
import { ChevronLeft, FileText, Download } from 'lucide-react';
import { getReportsByChild } from '../../services/reportService';
import type { StudentReport as StudentReportData } from '../../services/reportService';
import type { Child } from '../../types/index';
import './StudentReport.css';

interface StudentReportProps {
  onBack: () => void;
  child: Child;
}

const StudentReport = ({ onBack, child }: StudentReportProps) => {
  const [reports, setReports] = useState<StudentReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<StudentReportData | null>(null);

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        const reportsData = await getReportsByChild(child.id);
        setReports(reportsData);
      } catch (error) {
        console.error('Error loading reports:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [child.id]);

  if (loading) {
    return (
      <div className="content">
        <div className="page-header">
          <button className="back-btn" onClick={onBack}>
            <ChevronLeft size={24} />
          </button>
          <h2 className="page-title">Progress Reports</h2>
        </div>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  if (selectedReport) {
    return (
      <div className="content">
        <div className="page-header">
          <button className="back-btn" onClick={() => setSelectedReport(null)}>
            <ChevronLeft size={24} />
          </button>
          <h2 className="page-title">{selectedReport.title}</h2>
        </div>

        <div className="report-detail">
          <div className="report-header">
            <div className="report-info">
              <h3>{selectedReport.period}</h3>
              <p className="report-type">{selectedReport.reportType}</p>
            </div>
            <button className="download-btn">
              <Download size={18} />
              Download PDF
            </button>
          </div>

          {selectedReport.academics && selectedReport.academics.length > 0 && (
            <div className="report-section">
              <h4>Academic Performance</h4>
              <div className="academics-grid">
                {selectedReport.academics.map((subject, index) => (
                  <div key={index} className="subject-card">
                    <h5>{subject.subject}</h5>
                    <div className="grade">{subject.grade}</div>
                    <p className="comments">{subject.comments}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedReport.behavior && selectedReport.behavior.length > 0 && (
            <div className="report-section">
              <h4>Behavior & Development</h4>
              {selectedReport.behavior.map((item, index) => (
                <div key={index} className="behavior-item">
                  <div className="behavior-header">
                    <span>{item.category}</span>
                    <div className="rating">
                      {'⭐'.repeat(item.rating)}
                    </div>
                  </div>
                  <p>{item.comments}</p>
                </div>
              ))}
            </div>
          )}

          {selectedReport.attendance && (
            <div className="report-section">
              <h4>Attendance</h4>
              <div className="attendance-stats">
                <div className="stat">
                  <span className="stat-label">Present</span>
                  <span className="stat-value">{selectedReport.attendance.present}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Absent</span>
                  <span className="stat-value absent">{selectedReport.attendance.absent}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Total Days</span>
                  <span className="stat-value">{selectedReport.attendance.total}</span>
                </div>
              </div>
            </div>
          )}

          {selectedReport.teacherComments && (
            <div className="report-section">
              <h4>Teacher's Comments</h4>
              <p className="teacher-comments">{selectedReport.teacherComments}</p>
            </div>
          )}

          {selectedReport.overallGrade && (
            <div className="overall-grade">
              <span>Overall Grade:</span>
              <strong>{selectedReport.overallGrade}</strong>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="page-title">Progress Reports</h2>
      </div>

      {reports.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} />
          <p>No reports available yet</p>
          <small>Reports will appear here when teachers publish them</small>
        </div>
      ) : (
        <div className="reports-list">
          {reports.map((report) => (
            <div
              key={report.id}
              className="report-card"
              onClick={() => setSelectedReport(report)}
            >
              <div className="report-icon">
                <FileText size={24} />
              </div>
              <div className="report-info">
                <h3>{report.title}</h3>
                <p>{report.period}</p>
                <span className="report-type-badge">{report.reportType}</span>
              </div>
              {report.overallGrade && (
                <div className="report-grade">
                  <span className="grade-label">Grade</span>
                  <strong>{report.overallGrade}</strong>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentReport;
