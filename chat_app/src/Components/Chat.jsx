import React, { useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatSidebar from "./ChatSidebar";
import '../CSS/Chat.css';

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null); // Selected user to chat with
  const [messages, setMessages] = useState([]); // Messages for the current conversation
  const [textMessage, setTextMessage] = useState(""); // Text input for message
  const [image, setImage] = useState(null); // Image input for message

  const handleSendMessage = async () => {
    if (!selectedUser || (!textMessage && !image)) {
      alert("Please select a user and enter a message or image.");
      return;
    }

    const formData = new FormData();
    formData.append("text", textMessage);
    formData.append("image", image);
    formData.append("receiver", selectedUser);

    try {
      const response = await fetch("http://localhost:5001/send-message", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prevMessages) => [...prevMessages, data.message]);
        setTextMessage(""); // Clear the input after sending
        setImage(null); // Clear the image input
      } else {
        console.error("Error sending message:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="chat-container">
      <ChatSidebar onSelectUser={(user) => setSelectedUser(user)} />

      <div className="chat-main">
        <div className="chat-header">
          <h1>{selectedUser ? `Chat with ${selectedUser}` : "Select a user to chat"}</h1>
        </div>

        <div className="message-container">
          {messages.map((msg, index) => (
            <ChatMessage
              key={index}
              text={msg.text}
              timestamp={msg.timestamp}
              sender={msg.sender}
              files={msg.files}
            />
          ))}
        </div>

        {/* Input for text message */}
        <div className="message-input">
          <input
            type="text"
            placeholder="Type a message..."
            value={textMessage}
            onChange={(e) => setTextMessage(e.target.value)}
          />

          {/* Input for image upload */}
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
          />

          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;