import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Utensils, Moon, Activity, Heart, Camera } from 'lucide-react';
import { getDailyReport } from '../../services/dailyReportService';
import type { DailyReport as DailyReportType } from '../../services/dailyReportService';
import type { Child } from '../../types/index';
import './DailyReport.css';

interface DailyReportProps {
  onBack: () => void;
  children: Child[];
}

const moodEmojis: Record<string, string> = {
  happy: '😊',
  energetic: '⚡',
  tired: '😴',
  sad: '😢',
  sick: '🤒',
};

const consumptionColors: Record<string, string> = {
  all: '#4CAF50',
  most: '#8BC34A',
  some: '#ff9800',
  none: '#f44336',
};

const DailyReportPage = ({ onBack, children: childrenProp }: DailyReportProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState<DailyReportType | null>(null);
  const [loading, setLoading] = useState(true);
  const child = childrenProp[0];

  useEffect(() => {
    if (!child) return;
    const loadReport = async () => {
      setLoading(true);
      try {
        const data = await getDailyReport(child, selectedDate);
        setReport(data);
      } catch (error) {
        console.error('Error loading report:', error);
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [child, selectedDate]);

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    if (d <= new Date()) {
      setSelectedDate(d.toISOString().split('T')[0]);
    }
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const dateDisplay = new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric'
  });

  if (!child) {
    return (
      <div className="content">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>No student records found.</p>
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
        <h2 className="page-title">Daily Report</h2>
      </div>

      {/* Date Navigator */}
      <div className="report-date-nav">
        <button className="report-date-btn" onClick={() => changeDate(-1)}>
          <ChevronLeft size={20} />
        </button>
        <span className="report-date-label">
          {isToday ? 'Today' : dateDisplay}
        </span>
        <button className="report-date-btn" onClick={() => changeDate(1)} disabled={isToday}>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Child Info */}
      <div className="report-child-badge">
        <span>{child.gender === 'male' ? '👦' : '👧'}</span>
        <span>{child.name}</span>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading report...</div>
      ) : (
        <div className="report-sections">
          {/* Attendance */}
          <div className="report-card">
            <div className="report-card-header">
              <Clock size={18} />
              <h3>Attendance</h3>
            </div>
            {report?.attendance ? (
              <div className="report-card-body">
                <div className="report-attendance-row">
                  <span className={`attendance-badge ${report.attendance.status}`}>
                    {report.attendance.status}
                  </span>
                </div>
                <div className="report-times">
                  {report.attendance.checkInTime && (
                    <div className="report-time-item">
                      <span className="report-time-label">Check In</span>
                      <span className="report-time-value">{report.attendance.checkInTime}</span>
                    </div>
                  )}
                  {report.attendance.checkOutTime && (
                    <div className="report-time-item">
                      <span className="report-time-label">Check Out</span>
                      <span className="report-time-value">{report.attendance.checkOutTime}</span>
                    </div>
                  )}
                </div>
                {report.checkIns.length > 0 && (
                  <div className="report-checkins">
                    {report.checkIns.map((rec, i) => (
                      <div className="report-checkin-item" key={i}>
                        <span>{rec.type === 'check-in' ? '🟢' : '🔴'}</span>
                        <span>{rec.type === 'check-in' ? 'In' : 'Out'}</span>
                        <span className="report-checkin-time">
                          {new Date(rec.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="report-empty">No attendance recorded</div>
            )}
          </div>

          {/* Meals */}
          <div className="report-card">
            <div className="report-card-header">
              <Utensils size={18} />
              <h3>Meals</h3>
            </div>
            {report?.activities?.meals && report.activities.meals.length > 0 ? (
              <div className="report-card-body">
                {report.activities.meals.map((meal, i) => (
                  <div className="report-meal-item" key={i}>
                    <div className="report-meal-info">
                      <span className="report-meal-type">{meal.type}</span>
                      <span className="report-meal-time">{meal.time}</span>
                    </div>
                    <div className="report-meal-details">
                      <span>{meal.items}</span>
                      <span
                        className="report-consumption"
                        style={{ color: consumptionColors[meal.consumption] }}
                      >
                        {meal.consumption}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="report-empty">No meal data</div>
            )}
          </div>

          {/* Naps */}
          <div className="report-card">
            <div className="report-card-header">
              <Moon size={18} />
              <h3>Nap Time</h3>
            </div>
            {report?.activities?.napTime && report.activities.napTime.length > 0 ? (
              <div className="report-card-body">
                {report.activities.napTime.map((nap, i) => (
                  <div className="report-nap-item" key={i}>
                    <span>{nap.startTime} - {nap.endTime}</span>
                    <span className={`report-nap-quality ${nap.quality}`}>{nap.quality}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="report-empty">No nap data</div>
            )}
          </div>

          {/* Activities */}
          <div className="report-card">
            <div className="report-card-header">
              <Activity size={18} />
              <h3>Activities</h3>
            </div>
            {report?.activities?.activities && report.activities.activities.length > 0 ? (
              <div className="report-card-body">
                {report.activities.activities.map((act, i) => (
                  <div className="report-activity-item" key={i}>
                    <div className="report-activity-header">
                      <span className="report-activity-name">{act.activity}</span>
                      <span className={`report-participation ${act.participation}`}>{act.participation}</span>
                    </div>
                    {act.description && <p className="report-activity-desc">{act.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="report-empty">No activities recorded</div>
            )}
          </div>

          {/* Mood & Health */}
          <div className="report-card">
            <div className="report-card-header">
              <Heart size={18} />
              <h3>Mood & Health</h3>
            </div>
            {report?.activities ? (
              <div className="report-card-body">
                <div className="report-mood">
                  <span className="report-mood-emoji">{moodEmojis[report.activities.mood] || '😊'}</span>
                  <span className="report-mood-label">{report.activities.mood}</span>
                </div>
                {report.activities.healthNotes && (
                  <div className="report-health-notes">
                    <p>{report.activities.healthNotes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="report-empty">No mood data</div>
            )}
          </div>

          {/* Photos */}
          {report?.feedPosts && report.feedPosts.length > 0 && (
            <div className="report-card">
              <div className="report-card-header">
                <Camera size={18} />
                <h3>Photos</h3>
              </div>
              <div className="report-card-body">
                <div className="report-photo-grid">
                  {report.feedPosts.flatMap(post => post.photoUrls).map((url, i) => (
                    <div className="report-photo" key={i}>
                      <img src={url} alt={`Photo ${i + 1}`} />
                    </div>
                  ))}
                </div>
                {report.feedPosts.map((post, i) => (
                  post.caption && (
                    <p className="report-photo-caption" key={i}>{post.caption}</p>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyReportPage;
