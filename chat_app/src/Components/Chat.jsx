import React, { useState } from "react";
import ChatMessage from "./ChatMessage"; // Assuming ChatMessage is in the same folder
import ChatSidebar from "./ChatSidebar.jsx"; // Sidebar for recent chats and search bar
import '../CSS/Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([
    // {
    //   text: "Hello, this is a test message",
    //   timestamp: new Date(),
    //   voice: null,
    //   sender: "user1@example.com",
    //   videos: ["https://www.w3schools.com/html/mov_bbb.mp4"],
    //   files: ["https://via.placeholder.com/150"],
    // },
    // {
    //   text: "Another message",
    //   timestamp: new Date(),
    //   voice: null,
    //   sender: "user2@example.com",
    //   videos: [],
    //   files: [],
    // },
  ]);

  return (
    <div className="chat-container">
      {/* Sidebar for recent chats, search, settings, profile */}
      <ChatSidebar />

      {/* Main chat area */}
      <div className="chat-main">
        <div className="chat-header">
          <h1>Welcome to Chat</h1>
        </div>
        <div className="message-container">
          {messages.map((msg, index) => (
            <ChatMessage
              key={index}
              text={msg.text}
              timestamp={msg.timestamp}
              voice={msg.voice}
              sender={msg.sender}
              videos={msg.videos}
              files={msg.files}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Chat;
