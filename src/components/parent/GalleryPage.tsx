import { useState, useEffect } from 'react';
import { ChevronLeft, Camera, Image as ImageIcon } from 'lucide-react';
import { getAllPhotos } from '../../services/galleryService';
import type { GalleryPhoto } from '../../services/galleryService';
import './GalleryPage.css';

interface GalleryPageProps {
  onBack: () => void;
}

const GalleryPage = ({ onBack }: GalleryPageProps) => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        setLoading(true);
        const photosData = await getAllPhotos(50);
        setPhotos(photosData);
      } catch (error) {
        console.error('Error loading photos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPhotos();
  }, []);

  if (loading) {
    return (
      <div className="content">
        <div className="page-header">
          <button className="back-btn" onClick={onBack}>
            <ChevronLeft size={24} />
          </button>
          <h2 className="page-title">Photo Gallery</h2>
        </div>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading photos...</p>
        </div>
      </div>
    );
  }

  if (selectedPhoto) {
    return (
      <div className="content">
        <div className="page-header">
          <button className="back-btn" onClick={() => setSelectedPhoto(null)}>
            <ChevronLeft size={24} />
          </button>
          <h2 className="page-title">{selectedPhoto.title}</h2>
        </div>

        <div className="photo-detail">
          <div className="photo-full">
            <img src={selectedPhoto.imageUrl} alt={selectedPhoto.title} />
          </div>
          <div className="photo-info">
            <h3>{selectedPhoto.title}</h3>
            {selectedPhoto.description && <p>{selectedPhoto.description}</p>}
            <div className="photo-meta">
              <span className="category-badge">{selectedPhoto.category}</span>
              <span className="date">{new Date(selectedPhoto.date).toLocaleDateString()}</span>
            </div>
          </div>
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
        <h2 className="page-title">Photo Gallery</h2>
      </div>

      {photos.length === 0 ? (
        <div className="empty-state">
          <Camera size={48} />
          <p>No photos yet</p>
          <small>Photos will appear here when teachers upload them</small>
        </div>
      ) : (
        <div className="gallery-grid">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="gallery-item"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="photo-thumbnail">
                {photo.thumbnailUrl || photo.imageUrl ? (
                  <img src={photo.thumbnailUrl || photo.imageUrl} alt={photo.title} />
                ) : (
                  <div className="photo-placeholder">
                    <ImageIcon size={32} />
                  </div>
                )}
              </div>
              <div className="photo-caption">
                <h4>{photo.title}</h4>
                <span className="photo-date">{new Date(photo.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
