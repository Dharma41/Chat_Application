import React, { useState, useEffect } from "react";
import "../CSS/ChatSidebar.css";
import ProfileModal from "./ProfileModal";

const ChatSidebar = ({ onSelectUser }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const currentUser = {
    username: localStorage.getItem("username"),
    email: localStorage.getItem("email"),
  };

  useEffect(() => {
    // Fetch recent chats for the current user
    const fetchRecentChats = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/recent-chats?user=${encodeURIComponent(currentUser.username)}`
        );
        const data = await response.json();
        setRecentChats(data);
      } catch (error) {
        console.error("Error fetching recent chats:", error);
      }
    };

    fetchRecentChats();
  }, [currentUser.username]);

  // Search users based on the search query
  useEffect(() => {
    const fetchUsers = async () => {
      if (searchQuery === "") {
        setSearchResults([]);
        setNoResults(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/users?search=${searchQuery}`
        );
        const data = await response.json();
        setSearchResults(data);
        setNoResults(data.length === 0);
      } catch (error) {
        console.error("Error fetching users:", error);
        setNoResults(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchQuery]);

  const handleSelectUser = (user) => {
    onSelectUser(user);

    // Add to recent chats if not already included
    if (!recentChats.includes(user)) {
      setRecentChats((prevChats) => [user, ...prevChats]);
    }
  };

  const generateAvatar = (seed) => {
    return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${seed}`;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    window.location.href = "/";
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const openProfileModal = () => {
    setShowProfileModal(true);
    setShowDropdown(false);
  };

  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar-header">
        <img
          src={generateAvatar(currentUser.username)}
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
        
        <div className="three-dots" onClick={toggleDropdown}>
          <span>⋮</span>
          {showDropdown && (
            <div className="dropdown-menu">
              <p onClick={openProfileModal}>My Profile</p>
              <p onClick={handleLogout}>Sign Out</p>
            </div>
          )}
        </div>
      </div>

      <div className="recent-chats">
        {loading && <p>Loading...</p>}
        {!loading && noResults && <p>No users found</p>}
        {!loading &&
          (searchQuery ? searchResults : recentChats).map((chat, index) => (
            <div
              key={index}
              className="recent-chat"
              onClick={() => handleSelectUser(chat)}
            >
              <img
                src={generateAvatar(chat)}
                alt="Avatar"
                className="recent-chat-avatar"
              />
              <p>{chat}</p>
            </div>
          ))}
      </div>

      {showProfileModal && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          profile={{
            username: currentUser.username,
            email: currentUser.email,
            avatar: generateAvatar(currentUser.username),
          }}
        />
      )}
    </div>
  );
};

export default ChatSidebar;
