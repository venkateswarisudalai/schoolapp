import { useState, useEffect } from 'react';
import { ChevronLeft, Clock, Tag } from 'lucide-react';
import { getFeedPostsByChild, getAllFeedPosts } from '../../services/feedService';
import { useAuth } from '../../contexts/AuthContext';
import type { Child, FeedPost } from '../../types/index';
import './ActivityFeed.css';

interface ActivityFeedProps {
  onBack: () => void;
  children: Child[];
}

const categoryLabels: Record<string, { label: string; emoji: string }> = {
  learning: { label: 'Learning', emoji: '📚' },
  play: { label: 'Play', emoji: '🎮' },
  meal: { label: 'Meal', emoji: '🍽️' },
  art: { label: 'Art', emoji: '🎨' },
  milestone: { label: 'Milestone', emoji: '⭐' },
  general: { label: 'General', emoji: '📝' },
};

const getTimeAgo = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const ActivityFeed = ({ onBack, children: childrenProp }: ActivityFeedProps) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        if (user?.role === 'parent' && childrenProp.length > 0) {
          const allPosts: FeedPost[] = [];
          for (const child of childrenProp) {
            const childPosts = await getFeedPostsByChild(child.id);
            allPosts.push(...childPosts);
          }
          // Deduplicate and sort
          const unique = Array.from(new Map(allPosts.map(p => [p.id, p])).values());
          unique.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setPosts(unique);
        } else {
          const allPosts = await getAllFeedPosts();
          setPosts(allPosts);
        }
      } catch (error) {
        console.error('Error loading feed:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [user, childrenProp]);

  if (selectedPhoto) {
    return (
      <div className="content">
        <div className="photo-fullscreen" onClick={() => setSelectedPhoto(null)}>
          <button className="photo-close-btn" onClick={() => setSelectedPhoto(null)}>
            <span>✕</span>
          </button>
          <img src={selectedPhoto} alt="Full size" />
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
        <h2 className="page-title">Activity Feed</h2>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          Loading feed...
        </div>
      ) : posts.length === 0 ? (
        <div className="feed-empty">
          <div className="feed-empty-icon">📸</div>
          <h3>No posts yet</h3>
          <p>Updates from teachers will appear here</p>
        </div>
      ) : (
        <div className="feed-list">
          {posts.map(post => (
            <div className="feed-card" key={post.id}>
              {/* Header */}
              <div className="feed-card-header">
                <div className="feed-avatar">
                  {post.teacherName?.charAt(0) || 'T'}
                </div>
                <div className="feed-meta">
                  <span className="feed-teacher-name">{post.teacherName}</span>
                  <span className="feed-time">
                    <Clock size={12} />
                    {getTimeAgo(post.createdAt)}
                  </span>
                </div>
                <span className="feed-category-badge">
                  {categoryLabels[post.category]?.emoji} {categoryLabels[post.category]?.label}
                </span>
              </div>

              {/* Photos */}
              {post.photoUrls && post.photoUrls.length > 0 && (
                <div className={`feed-photos feed-photos-${Math.min(post.photoUrls.length, 3)}`}>
                  {post.photoUrls.slice(0, 4).map((url, i) => (
                    <div
                      className="feed-photo"
                      key={i}
                      onClick={() => setSelectedPhoto(url)}
                    >
                      <img src={url} alt={`Photo ${i + 1}`} />
                      {i === 3 && post.photoUrls.length > 4 && (
                        <div className="feed-photo-more">+{post.photoUrls.length - 4}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Caption */}
              {post.caption && (
                <p className="feed-caption">{post.caption}</p>
              )}

              {/* Tagged children */}
              {post.taggedChildIds && post.taggedChildIds.length > 0 && (
                <div className="feed-tags">
                  <Tag size={12} />
                  <span>
                    {post.taggedChildIds.length} student{post.taggedChildIds.length !== 1 ? 's' : ''} tagged
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
