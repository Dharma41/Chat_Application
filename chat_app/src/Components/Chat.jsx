import React, { useState, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import ChatSidebar from "./ChatSidebar";
import "../CSS/Chat.css";
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_SERVER_URL);

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [textMessage, setTextMessage] = useState("");
  const [image, setImage] = useState(null);
  const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("Welcome to Chat App");


  const currentUser = localStorage.getItem("username");

  useEffect(() => {
    socket.emit("register-user", currentUser);

    socket.on("receive-message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("receive-message");
    };
  }, [currentUser]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedUser) {
        try {
          const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/messages?sender=${currentUser}&receiver=${selectedUser}`);
          const data = await response.json();
          setMessages(data);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }
    };

    fetchMessages();
  }, [selectedUser, currentUser]);

  useEffect(() => {
    if (selectedUser) {
      setFilteredMessages(
        messages.filter(
          (msg) =>
            (msg.sender === currentUser && msg.receiver === selectedUser) ||
            (msg.sender === selectedUser && msg.receiver === currentUser)
        )
      );
    }
  }, [selectedUser, messages, currentUser]);

  const handleSendMessage = async () => {
    if (!selectedUser || (!textMessage && !image)) {
      alert("Please select a user and enter a message or image.");
      return;
    }

    const formData = new FormData();
    formData.append("text", textMessage);
    formData.append("image", image);
    formData.append("receiver", selectedUser);
    formData.append("sender", currentUser);

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/send-message`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }

    setTextMessage("");
    setImage(null);
    setShowAttachmentPreview(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
      };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setShowAttachmentPreview(true);
    }
  };

  const closePreview = () => {
    setShowAttachmentPreview(false);
    setImage(null);
  };

  return (
    <div className="chat-container">
     <ChatSidebar onSelectUser={handleSelectUser} />
            <div className="chat-main">
        <div className="chat-header">
          {selectedUser && <h3>Chat with {selectedUser}</h3>}
        </div>
        
        <div className="message-container">
          {selectedUser ? (
            filteredMessages.length > 0 ? (
              filteredMessages.map((msg, index) => (
                <ChatMessage
                  key={index}
                  text={msg.text}
                  timestamp={msg.timestamp}
                  sender={msg.sender}
                  files={msg.imagePath ? [msg.imagePath] : []}
                  currentUser={currentUser}
                />
              ))
            ) : (
              <p className="no-messages">No messages with this user yet. Start the conversation!</p>
            )
          ) : (
            <p className="welcome-message">{welcomeMessage}</p>
          )}
        </div>
        
        {selectedUser && (
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
      onChange={handleImageSelect}
      style={{ display: "none" }}
    />
    <button onClick={handleSendMessage}>Send</button>
  </div>
)}
      </div>

      {showAttachmentPreview && (
        <div className="attachment-preview-modal">
          <div className="attachment-preview-content">
            <h3>Preview Attachment</h3>
            {image && (
              <div className="preview-image-container">
                <img src={URL.createObjectURL(image)} alt="Preview" className="preview-image" />
              </div>
            )}
            <button className="send-button" onClick={handleSendMessage}>
              Send
            </button>
            <button className="cancel-button" onClick={closePreview}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;