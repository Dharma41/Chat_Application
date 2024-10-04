import React from "react";
import "../CSS/ChatSidebar.css"; // Sidebar-specific styling

const ChatSidebar = () => {
  const recentChats = [
    "dchitte@okstate.edu",
    "user2@example.com",
    "user3@example.com",
  ];

  return (
    <div className="chat-sidebar">
      {/* Profile picture and search */}
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
        />
      </div>

      {/* Recent chats */}
      <div className="recent-chats">
        <h3>Recent Chats</h3>
        {recentChats.map((chat, index) => (
          <div key={index} className="recent-chat">
            {chat}
          </div>
        ))}
      </div>

      {/* Settings icon */}
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
