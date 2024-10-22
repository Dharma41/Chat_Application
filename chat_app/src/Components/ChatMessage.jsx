import React from "react";
import '../CSS/ChatMessage.css';

function ChatMessage({ text, timestamp, sender, currentUser, files = [] }) {
  const isSentByCurrentUser = sender === currentUser;

  return (
    <div className={`chat-message ${isSentByCurrentUser ? 'from-user' : 'from-other'}`}>
      <div className="attached-files">
        {files.length > 0 && files.map((file, index) => (
          <div key={index} className="image-cont">
            <img src={file} alt="Attachment" className="image-file" />
          </div>
        ))}
      </div>
      <div className="message-text">
        <p>{text}</p>
      </div>
      <div className="message-date">
        <p>{new Date(timestamp).toString().slice(16, 21)}</p>
      </div>
    </div>
  );
}

export default ChatMessage;
