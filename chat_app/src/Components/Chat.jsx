import React, { useState, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import ChatSidebar from "./ChatSidebar";
import '../CSS/Chat.css';
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";

const socket = io("http://localhost:5001");

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [messages, setMessages] = useState([]);
  const [textMessage, setTextMessage] = useState("");
  const [image, setImage] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Get the current logged-in user from JWT token
  const token = localStorage.getItem("token");
  const currentUser = jwtDecode(token).email; // Use this as the current logged-in user

  useEffect(() => {
    // Listen for messages from the server
    socket.on("receive-message", (message) => {
      if (message.receiver === currentUser || message.sender === currentUser) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    return () => {
      socket.off("receive-message");
    };
  }, [currentUser]);

  const handleSendMessage = async () => {
    if (!selectedUser || (!textMessage && !image)) {
      alert("Please select a user and enter a message or image.");
      return;
    }

    // Send message to the server via Socket.IO
    socket.emit("send-message", {
      text: textMessage,
      imagePath: image ? image.name : null,
      receiver: selectedUser,
      sender: currentUser,
    });

    // Clear input fields
    setTextMessage("");
    setImage(null);

    try {
      const formData = new FormData();
      formData.append("text", textMessage);
      formData.append("image", image);
      formData.append("receiver", selectedUser);
      formData.append("sender", currentUser);

      await fetch("http://localhost:5001/send-message", {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSelectedUserName(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/'; // Redirect to login
  };

  return (
    <div className="chat-container">
      <ChatSidebar onSelectUser={handleSelectUser} />

      <div className="chat-main">
        <div className="chat-header">
          <div className="left-header">
            {selectedUser && (
              <>
                <img
                  src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${selectedUser}`}
                  alt="User"
                  className="chat-user-avatar"
                />
                <div>
                  <h3>{selectedUserName}</h3>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="message-container">
          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <ChatMessage
                key={index}
                text={msg.text}
                timestamp={msg.timestamp}
                sender={msg.sender}
                files={msg.files}
              />
            ))
          ) : (
            <p className="no-messages">No messages yet. Start the conversation!</p>
          )}
        </div>

        <div className="message-input">
          <input
            type="text"
            placeholder="Type a message..."
            value={textMessage}
            onChange={(e) => setTextMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />

          <label htmlFor="image-upload">
            <i className="fas fa-paperclip"></i>
          </label>
          <input
            type="file"
            id="image-upload"
            onChange={(e) => setImage(e.target.files[0])}
          />

          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
