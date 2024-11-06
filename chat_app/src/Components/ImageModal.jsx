// ImageModal.jsx
import React from 'react';
import '../CSS/ImageModal.css';

function ImageModal({ isOpen, imageUrl, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt="Enlarged view" className="modal-image" />
        
        <div className="modal-buttons">
          <button onClick={onClose} className="close-button">Close</button>
          <a href={imageUrl} download className="download-button">
            Download
          </a>
        </div>
      </div>
    </div>
  );
}

export default ImageModal;
