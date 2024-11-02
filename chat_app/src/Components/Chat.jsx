// import React, { useState, useEffect } from "react";
// import ChatMessage from "./ChatMessage";
// import ChatSidebar from "./ChatSidebar";
// import '../CSS/Chat.css';
// import {jwtDecode} from "jwt-decode";
// import { io } from "socket.io-client";

// const socket = io("http://localhost:5001");

// const Chat = () => {
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [filteredMessages, setFilteredMessages] = useState([]);
//   const [textMessage, setTextMessage] = useState("");
//   const [image, setImage] = useState(null);
  
//   const token = localStorage.getItem("token");
//   const currentUser = jwtDecode(token).username; // Make sure the JWT contains 'username'

//   useEffect(() => {
//     // Register current user with the server
//     socket.emit("register-user", currentUser);

//     // Listen for incoming messages and update messages state
//     socket.on("receive-message", (message) => {
//       setMessages((prevMessages) => [...prevMessages, message]);
//     });

//     return () => {
//       socket.off("receive-message");
//     };
//   }, [currentUser]);

//   // Filter messages when a new user is selected or when messages update
//   useEffect(() => {
//     if (selectedUser) {
//       setFilteredMessages(
//         messages.filter(
//           (msg) =>
//             (msg.sender === currentUser && msg.receiver === selectedUser) ||
//             (msg.sender === selectedUser && msg.receiver === currentUser)
//         )
//       );
//     }
//   }, [selectedUser, messages, currentUser]);

//   const handleSendMessage = async () => {
//     if (!selectedUser || (!textMessage && !image)) {
//       alert("Please select a user and enter a message or image.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("text", textMessage);
//     formData.append("image", image);
//     formData.append("receiver", selectedUser);
//     formData.append("sender", currentUser);

//     try {
//       const response = await fetch("http://localhost:5001/send-message", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await response.json();
//       if (data.success) {
//         setMessages((prevMessages) => [...prevMessages, data.message]);
//       }
//     } catch (error) {
//       console.error("Error sending message:", error);
//     }

//     setTextMessage("");
//     setImage(null);
//   };

//   const handleKeyPress = (event) => {
//     if (event.key === "Enter") {
//       event.preventDefault();
//       handleSendMessage();
//     }
//   };

//   const handleSelectUser = (user) => {
//     setSelectedUser(user);
//   };

//   return (
//     <div className="chat-container">
//       <ChatSidebar onSelectUser={handleSelectUser} />
//       <div className="chat-main">
//         <div className="chat-header">
//           {selectedUser && <h3>Chat with {selectedUser}</h3>}
//         </div>
//         <div className="message-container">
//           {filteredMessages.length > 0 ? (
//             filteredMessages.map((msg, index) => (
//               <ChatMessage
//                 key={index}
//                 text={msg.text}
//                 timestamp={msg.timestamp}
//                 sender={msg.sender}
//                 files={msg.imagePath ? [msg.imagePath] : []}
//                 currentUser={currentUser}
//               />
//             ))
//           ) : (
//             <p className="no-messages">No messages with this user yet. Start the conversation!</p>
//           )}
//         </div>
//         <div className="message-input">
//           <input
//             type="text"
//             placeholder="Type a message..."
//             value={textMessage}
//             onChange={(e) => setTextMessage(e.target.value)}
//             onKeyPress={handleKeyPress}
//           />
//           <label htmlFor="image-upload">
//             <i className="fas fa-paperclip"></i>
//           </label>
//           <input
//             type="file"
//             id="image-upload"
//             onChange={(e) => setImage(e.target.files[0])}
//           />
//           <button onClick={handleSendMessage}>Send</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Chat;

//deployment code

import React, { useState, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import ChatSidebar from "./ChatSidebar";
import '../CSS/Chat.css';
import {jwtDecode} from "jwt-decode" // Corrected import for jwt-decode
import { io } from "socket.io-client";

// Connect to the backend using an environment variable
const socket = io(process.env.REACT_APP_SERVER_URL, { transports: ["websocket", "polling"] });

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [textMessage, setTextMessage] = useState("");
  const [image, setImage] = useState(null);
  
  // Decode the current user's information from the JWT token
  const token = localStorage.getItem("token");
  const currentUser = jwtDecode(token).username;

  useEffect(() => {
    // Register the current user with the server
    socket.emit("register-user", currentUser);

    // Listen for incoming messages and update messages state
    socket.on("receive-message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Clean up the socket event listener when component unmounts
    return () => {
      socket.off("receive-message");
    };
  }, [currentUser]);

  // Filter messages whenever a new user is selected or when messages update
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

  return (
    <div className="chat-container">
      <ChatSidebar onSelectUser={handleSelectUser} />
      <div className="chat-main">
        <div className="chat-header">
          {selectedUser && <h3>Chat with {selectedUser}</h3>}
        </div>
        <div className="message-container">
          {filteredMessages.length > 0 ? (
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