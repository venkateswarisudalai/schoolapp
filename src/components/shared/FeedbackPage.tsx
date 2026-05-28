import { useState } from 'react';
import { ChevronLeft, Bug, Lightbulb, Heart, MessageCircle, Star, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { submitFeedback } from '../../services/feedbackService';
import type { FeedbackCategory } from '../../types/index';
import './FeedbackPage.css';

interface FeedbackPageProps {
  onBack: () => void;
}

const CATEGORIES: { value: FeedbackCategory; label: string; icon: typeof Bug }[] = [
  { value: 'suggestion', label: 'Suggestion', icon: Lightbulb },
  { value: 'bug', label: 'Problem', icon: Bug },
  { value: 'praise', label: 'Praise', icon: Heart },
  { value: 'other', label: 'Other', icon: MessageCircle },
];

const FeedbackPage = ({ onBack }: FeedbackPageProps) => {
  const { user } = useAuth();
  const [category, setCategory] = useState<FeedbackCategory>('suggestion');
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError('Please write a little something before sending.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await submitFeedback({
        category,
        message: message.trim(),
        rating: rating || undefined,
        userId: user?.id,
        userName: user?.name,
        userEmail: user?.email,
        userRole: user?.role,
      });
      setSubmitted(true);
    } catch {
      setError('Something went wrong sending your feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="content">
        <div className="feedback-thankyou">
          <div className="feedback-thankyou-icon">💛</div>
          <h2>Thank you!</h2>
          <p>Your feedback has been sent. We really appreciate you helping us make the app better.</p>
          <button className="btn btn-primary btn-block" onClick={onBack}>Done</button>
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
        <h2 className="page-title">Send Feedback</h2>
      </div>

      <div className="feedback-intro">
        Tell us what's working, what's not, or what you'd love to see. Your note goes straight to the team.
      </div>

      {/* Category */}
      <div className="feedback-section">
        <label className="feedback-label">What's this about?</label>
        <div className="feedback-categories">
          {CATEGORIES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              className={`feedback-category ${category === value ? 'active' : ''}`}
              onClick={() => setCategory(value)}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="feedback-section">
        <label className="feedback-label">How would you rate the app? <span className="feedback-optional">(optional)</span></label>
        <div className="feedback-stars">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={`feedback-star ${n <= rating ? 'filled' : ''}`}
              onClick={() => setRating(n === rating ? 0 : n)}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
            >
              <Star size={28} fill={n <= rating ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div className="feedback-section">
        <label className="feedback-label">Your message</label>
        <textarea
          className="feedback-textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share your thoughts…"
          rows={6}
          maxLength={2000}
        />
        <div className="feedback-counter">{message.length}/2000</div>
      </div>

      {error && <p className="feedback-error">{error}</p>}

      <div className="feedback-submit-wrap">
        <button
          className="btn btn-primary btn-block"
          onClick={handleSubmit}
          disabled={submitting}
        >
          <Send size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          {submitting ? 'Sending…' : 'Send Feedback'}
        </button>
      </div>
    </div>
  );
};

export default FeedbackPage;
