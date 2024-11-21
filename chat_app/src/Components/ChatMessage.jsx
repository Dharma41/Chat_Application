import React, { useState } from "react";
import '../CSS/ChatMessage.css';
import ImageModal from "./ImageModal"; // Import the modal component

function ChatMessage({ text, timestamp, sender, currentUser, files = [] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const isSentByCurrentUser = sender === currentUser;

  const serverUrl = process.env.REACT_APP_SERVER_URL; // Retrieve the server URL from the environment variable

  const handleImageClick = (file) => {
    setSelectedImage(`${serverUrl}${file}`);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  return (
    <div className={`chat-message ${isSentByCurrentUser ? 'from-user' : 'from-other'}`}>
      <div className="attached-files">
        {files.length > 0 && files.map((file, index) => (
          <div key={index} className="image-cont" onClick={() => handleImageClick(file)}>
            <img src={`${serverUrl}${file}`} alt="Attachment" className="image-file" />
          </div>
        ))}
      </div>
      <div className="message-text">
        <p>{text}</p>
      </div>
      <div className="message-date">
        <p>{new Date(timestamp).toString().slice(16, 21)}</p>
      </div>

      {/* Modal to display the image when clicked */}
      <ImageModal isOpen={isModalOpen} imageUrl={selectedImage} onClose={closeModal} />
    </div>
  );  
}

export default ChatMessage;