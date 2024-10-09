import React, { useState, useEffect } from "react";
import "../CSS/ChatSidebar.css";

const ChatSidebar = ({ onSelectUser }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentChats] = useState([
    "dchitte@okstate.edu",
    "user2@example.com",
    "user3@example.com",
  ]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchQuery === "") {
        setSearchResults([]);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5001/users?search=${searchQuery}`);
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [searchQuery]);

  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar-header">
        <img
          src="https://via.placeholder.com/50"
          alt="Profile"
          className="profile-pic"
        />
        <input
          type="text"
          placeholder="Search..."
          className="chat-search-bar"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="recent-chats">
        <h3>{searchQuery ? "Search Results" : "Recent Chats"}</h3>
        {(searchQuery ? searchResults : recentChats).map((chat, index) => (
          <div
            key={index}
            className="recent-chat"
            onClick={() => onSelectUser(chat)} // Pass selected user to parent component
          >
            {chat}
          </div>
        ))}
      </div>

      <div className="chat-sidebar-footer">
        <button className="settings-button">
          <img
            src="https://img.icons8.com/ios-glyphs/30/000000/settings.png"
            alt="Settings"
          />
        </button>
      </div>
    </div>
  );
};

export default ChatSidebar;