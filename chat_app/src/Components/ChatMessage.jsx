import React from "react";
import '../CSS/ChatMessage.css'; // Import CSS for styling the component

function ChatMessage({ text, timestamp, voice, sender, videos = [], files = [] }) {
  return (
    <div className={`chat-message ${sender === "currentUser@example.com" ? 'from-user' : 'from-other'}`}>
      <div className="attached-files">
        {files.length > 0 && files.map((file, index) => (
          <div key={index} className="image-cont">
            <img src={file} alt="Attachment" className="image-file" />
          </div>
        ))}

        {videos.length > 0 && videos.map((video, index) => (
          <div key={index} className="video-cont">
            <video src={video} alt="Video Attachment" className="video-file" controls />
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