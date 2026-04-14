import { useState, useEffect } from 'react';
import { ChevronLeft, Calendar as CalendarIcon } from 'lucide-react';
import { getUpcomingEvents } from '../../services/calendarService';
import type { CalendarEvent } from '../../services/calendarService';
import './CalendarPage.css';

interface CalendarPageProps {
  onBack: () => void;
}

const CalendarPage = ({ onBack }: CalendarPageProps) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const eventsData = await getUpcomingEvents(20);
        setEvents(eventsData);
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'holiday': return '🏖️';
      case 'exam': return '📝';
      case 'meeting': return '👥';
      case 'birthday': return '🎂';
      default: return '📅';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'holiday': return '#10b981';
      case 'exam': return '#ef4444';
      case 'meeting': return '#3b82f6';
      case 'birthday': return '#f59e0b';
      default: return '#8b5cf6';
    }
  };

  if (loading) {
    return (
      <div className="content">
        <div className="page-header">
          <button className="back-btn" onClick={onBack}>
            <ChevronLeft size={24} />
          </button>
          <h2 className="page-title">Calendar & Events</h2>
        </div>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading events...</p>
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
        <h2 className="page-title">Calendar & Events</h2>
      </div>

      {events.length === 0 ? (
        <div className="empty-state">
          <CalendarIcon size={48} />
          <p>No upcoming events</p>
          <small>School events and holidays will appear here</small>
        </div>
      ) : (
        <div className="events-list">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-date" style={{ background: getEventColor(event.type) }}>
                <span className="day">{new Date(event.date).getDate()}</span>
                <span className="month">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
              </div>
              <div className="event-details">
                <div className="event-icon">{getEventIcon(event.type)}</div>
                <div className="event-info">
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  {event.time && <span className="event-time">⏰ {event.time}</span>}
                  <span className="event-type-badge" style={{ background: `${getEventColor(event.type)}20`, color: getEventColor(event.type) }}>
                    {event.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
