import { useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createGalleryPhoto, uploadGalleryPhotoFile } from '../../services/galleryService';
import { ChevronLeft, Image as ImageIcon, Upload, X } from 'lucide-react';
import './AddGalleryPhoto.css';

interface AddGalleryPhotoProps {
  onBack: () => void;
}

const AddGalleryPhoto = ({ onBack }: AddGalleryPhotoProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [category, setCategory] = useState<'activity' | 'event' | 'classroom' | 'outdoor' | 'celebration'>('activity');
  const [classId, setClassId] = useState('');
  const [adding, setAdding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setFilePreview(f ? URL.createObjectURL(f) : null);
    if (f) setImageUrl('');
  };

  const clearFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('You must be logged in to add photos');
      return;
    }

    const trimmedUrl = imageUrl.trim();
    if (!file && !/^https?:\/\//i.test(trimmedUrl)) {
      alert('Select a photo to upload or paste an image URL starting with http:// or https://.');
      return;
    }

    setAdding(true);

    try {
      let finalUrl = trimmedUrl;
      if (file) {
        setProgress(0);
        finalUrl = await uploadGalleryPhotoFile(file, p => setProgress(p));
      }

      const photoData: Parameters<typeof createGalleryPhoto>[0] = {
        title,
        description,
        imageUrl: finalUrl,
        date: new Date().toISOString(),
        category,
        uploadedBy: user.id,
      };
      if (classId) photoData.classId = classId;

      await createGalleryPhoto(photoData);

      setSuccess(true);
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (error: unknown) {
      console.error('Error adding photo:', error);
      const err = error as { code?: string; message?: string };
      let msg = err.message || 'Failed to add photo.';
      if (err.code === 'storage/unauthorized') {
        msg = 'Upload denied. Make sure you are logged in as admin/teacher and storage rules are deployed.';
      } else if (err.code === 'storage/object-not-found' || err.code === 'storage/unknown') {
        msg = 'Storage is not set up for this Firebase project yet. Open Firebase console → Storage → Get Started.';
      }
      alert(msg);
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
            <label htmlFor="photoFile">Upload Photo</label>
            <input
              type="file"
              id="photoFile"
              accept="image/*"
              ref={fileInputRef}
              onChange={onFileChange}
            />
            {file ? (
              <button
                type="button"
                onClick={clearFile}
                style={{
                  marginTop: 6, background: '#fef2f2', color: '#b91c1c',
                  border: '1px solid #fecaca', padding: '4px 8px',
                  borderRadius: 6, fontSize: 12, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}
              >
                <X size={12} /> Clear file ({file.name})
              </button>
            ) : (
              <small>Pick a photo from your device. Max 5MB.</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">…or paste Image URL</label>
            <input
              type="text"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => { setImageUrl(e.target.value); if (e.target.value && file) clearFile(); }}
              placeholder="https://example.com/image.jpg"
              disabled={!!file}
            />
          </div>

          {(filePreview || imageUrl) && (
            <div className="image-preview">
              <img src={filePreview || imageUrl} alt="Preview" onError={(e) => {
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

          {adding && file && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: '#2563eb', transition: 'width 0.2s' }} />
              </div>
              <small style={{ color: '#64748b' }}>Uploading… {progress}%</small>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block add-btn"
            disabled={adding}
          >
            {adding ? (
              file ? `Uploading… ${progress}%` : 'Adding Photo...'
            ) : (
              <>
                {file ? <Upload size={20} /> : <ImageIcon size={20} />}
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
