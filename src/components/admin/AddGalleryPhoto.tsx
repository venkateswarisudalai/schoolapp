import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createGalleryPhoto } from '../../services/galleryService';
import { ChevronLeft, Image as ImageIcon } from 'lucide-react';
import './AddGalleryPhoto.css';

interface AddGalleryPhotoProps {
  onBack: () => void;
}

const AddGalleryPhoto = ({ onBack }: AddGalleryPhotoProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState<'activity' | 'event' | 'classroom' | 'outdoor' | 'celebration'>('activity');
  const [classId, setClassId] = useState('');
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('You must be logged in to add photos');
      return;
    }

    if (!imageUrl.startsWith('http')) {
      alert('Please enter a valid image URL starting with http:// or https://');
      return;
    }

    setAdding(true);

    try {
      const photoData = {
        title,
        description,
        imageUrl,
        date: new Date().toISOString(),
        category,
        classId: classId || undefined,
        uploadedBy: user.id,
      };

      await createGalleryPhoto(photoData);

      setSuccess(true);
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (error) {
      console.error('Error adding photo:', error);
      alert('Failed to add photo. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  if (success) {
    return (
      <div className="content">
        <div className="success-screen">
          <div className="success-icon">✓</div>
          <h2>Photo Added!</h2>
          <p>Photo has been added to the gallery successfully.</p>
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
        <h2 className="page-title">Add Gallery Photo</h2>
      </div>

      <div className="add-photo-container">
        <form onSubmit={handleSubmit} className="photo-form">
          <div className="form-group">
            <label htmlFor="imageUrl">Image URL *</label>
            <input
              type="url"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              required
            />
            <small>Enter a direct link to an image (e.g., from Google Photos, Imgur, etc.)</small>
          </div>

          {imageUrl && (
            <div className="image-preview">
              <img src={imageUrl} alt="Preview" onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }} />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter photo title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description (optional)"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              required
            >
              <option value="activity">Activity</option>
              <option value="event">Event</option>
              <option value="classroom">Classroom</option>
              <option value="outdoor">Outdoor</option>
              <option value="celebration">Celebration</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="classId">Class (Optional)</label>
            <select
              id="classId"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
            >
              <option value="">All Classes</option>
              <option value="class-1">Sunshine Nursery</option>
              <option value="class-2">Rainbow LKG</option>
              <option value="class-3">Star UKG</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block add-btn"
            disabled={adding}
          >
            {adding ? (
              'Adding Photo...'
            ) : (
              <>
                <ImageIcon size={20} />
                <span>Add Photo to Gallery</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddGalleryPhoto;
