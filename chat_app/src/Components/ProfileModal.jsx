// ProfileModal.jsx
import React from 'react';
import '../CSS/ProfileModal.css';

function ProfileModal({ isOpen, onClose, profile }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <img src={profile.avatar} alt="Profile" className="profile-modal-avatar" />
        <h2 className='profile-name'>{profile.username}</h2>
        <p className='profile-email'>{profile.email}</p>
        
        <button onClick={onClose} className="close-button">Close</button>
      </div>
    </div>
  );
}

export default ProfileModal;
