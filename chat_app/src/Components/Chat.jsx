import React, { useState, useEffect } from "react";
import ChatMessage from "./ChatMessage"; // Assuming ChatMessage is in the same folder
import ChatSidebar from "./ChatSidebar"; // Sidebar for recent chats and search bar
import '../CSS/Chat.css'; // CSS for styling the chat interface
import { io } from "socket.io-client"; // Import Socket.IO client

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null); // Store the selected user for chat
  const [messages, setMessages] = useState([]); // Store the messages for the conversation
  const [textMessage, setTextMessage] = useState(""); // Input for text message
  const [image, setImage] = useState(null); // Input for image message
  const socket = io("http://localhost:5001"); // Connect to the Socket.IO server

  // Load messages and listen for incoming messages
  useEffect(() => {
    // Listen for incoming messages
    socket.on("receive-message", (message) => {
      if (message.receiver === "dchitte@okstate.edu") { // Replace with actual logged-in user
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    // Clean up Socket.IO on component unmount
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  // Function to handle sending the message
  const handleSendMessage = async () => {
    if (!selectedUser || (!textMessage && !image)) {
      alert("Please select a user and enter a message or image.");
      return;
    }

    const formData = new FormData();
    formData.append("text", textMessage);
    formData.append("image", image);
    formData.append("receiver", selectedUser);
    formData.append("sender", "dchitte@okstate.edu"); // Replace this with actual logged-in user

    try {
      // Send message to the server via Socket.IO
      socket.emit("send-message", {
        text: textMessage,
        imagePath: image ? image.name : null,
        receiver: selectedUser,
        sender: "dchitte@okstate.edu", // Replace this with actual logged-in user
      });

      // Optionally: Save the message in MongoDB via a POST request (if not using socket for persistence)
      const response = await fetch("http://localhost:5001/send-message", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prevMessages) => [...prevMessages, data.message]); // Update message list
        setTextMessage(""); // Clear text input
        setImage(null); // Clear image input
      } else {
        console.error("Error sending message:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="chat-container">
      {/* Sidebar for recent chats and search */}
      <ChatSidebar onSelectUser={setSelectedUser} />

      {/* Main chat area */}
      <div className="chat-main">
        <div className="chat-header">
          <h1>{selectedUser ? `Chat with ${selectedUser}` : "Select a user to chat"}</h1>
        </div>

        {/* Displaying messages */}
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

        {/* Input area for text and image */}
        <div className="message-input">
          <input
            type="text"
            placeholder="Type a message..."
            value={textMessage}
            onChange={(e) => setTextMessage(e.target.value)}
          />

          {/* Image upload input */}
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
          />

          {/* Send button */}
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;