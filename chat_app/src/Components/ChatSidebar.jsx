import React, { useState, useEffect } from "react";
import "../CSS/ChatSidebar.css";

const ChatSidebar = ({ onSelectUser }) => {
  const [searchQuery, setSearchQuery] = useState(""); // Search query input state
  const [searchResults, setSearchResults] = useState([]); // Users search result
  const [recentChats, setRecentChats] = useState([
    "dchitte@okstate.edu",
  ]); // Initial mock recent chats
  const [loading, setLoading] = useState(false); // Loading indicator state
  const [noResults, setNoResults] = useState(false); // State for handling no results found

  // Fetch users based on search query
  useEffect(() => {
    const fetchUsers = async () => {
      if (searchQuery === "") {
        setSearchResults([]);
        setNoResults(false); // Reset no results state
        return;
      }

      setLoading(true); // Set loading to true before fetching
      try {
        const response = await fetch(`http://localhost:5001/users?search=${searchQuery}`);
        const data = await response.json();
        if (data.length === 0) {
          setNoResults(true);
        } else {
          setNoResults(false);
        }
        setSearchResults(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setNoResults(true); // Display no results if there's an error
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchUsers();
  }, [searchQuery]);

  // Handle user selection from search results or recent chats
  const handleSelectUser = (user) => {
    onSelectUser(user); // Pass the selected user to parent component

    // Add user to recent chats if not already in the list
    if (!recentChats.includes(user)) {
      setRecentChats((prevChats) => [user, ...prevChats]); // Add user to the top of recent chats
    }
  };

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
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Recent chats or search results */}
      <div className="recent-chats">
        <h3>{searchQuery ? "Search Results" : "Recent Chats"}</h3>

        {/* Loading Spinner */}
        {loading && <p>Loading...</p>}

        {/* No Results Found */}
        {!loading && noResults && <p>No users found</p>}

        {/* Show Search Results */}
        {!loading &&
          searchQuery &&
          searchResults.map((chat, index) => (
            <div
              key={index}
              className="recent-chat"
              onClick={() => handleSelectUser(chat)} // Select user on click and add to recent chats
            >
              {chat}
            </div>
          ))}

        {/* Show Recent Chats if no search query */}
        {!searchQuery &&
          recentChats.map((chat, index) => (
            <div
              key={index}
              className="recent-chat"
              onClick={() => handleSelectUser(chat)} // Select recent chat on click
            >
              {chat}
            </div>
          ))}
      </div>

      {/* Settings button at the bottom */}
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