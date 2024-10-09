import React from "react";
import '../CSS/ChatMessage.css'; // Import CSS for styling the component

const ChatMessage = ({ text, timestamp, voice, sender, videos, files }) => {
  return (
    <div className={`chat-message ${sender === "user1@example.com" ? "sent" : "received"}`}>
      <AttachFiles filesLength={files.length || videos.length}>
        {files &&
          files.map((file, index) => (
            <div
              key={index}
              className="image-cont"
              style={{
                width: "200px",
                height: "200px",
                display: "flex",
                alignItems: "stretch",
              }}
            >
              <img
                src={file}
                alt="File preview"
                style={{
                  width: "100%",
                  imageRendering: "pixelated",
                }}
              />
            </div>
          ))}

        {videos &&
          videos.map((video, index) => (
            <div
              key={index}
              className="video-cont"
              style={{
                width: "200px",
                height: "200px",
                border: "1px solid green",
                display: "flex",
                alignItems: "center",
              }}
            >
              <video src={video} alt="Video" width="100%" height="100%" controls />
            </div>
          ))}
      </AttachFiles>

      <Text>
        <p>{text}</p>
      </Text>

      <DateMessage>
        <p>{new Date(timestamp).toString().slice(16, 21)}</p>
      </DateMessage>
    </div>
  );
};

export default ChatMessage;

const AttachFiles = ({ children, filesLength }) => {
  return (
    <div
      className="attach-files"
      style={{
        display: filesLength > 0 ? "grid" : "none",
        gridGap: "10px",
        padding: "10px 0 0 10px",
        gridTemplateColumns: filesLength > 1 ? "repeat(2, 200px)" : "200px",
      }}
    >
      {children}
    </div>
  );
};

const Text = ({ children }) => (
  <div className="text">
    {children}
  </div>
);

const DateMessage = ({ children }) => (
  <div className="date-message">
    {children}
  </div>
);
