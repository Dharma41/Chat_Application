// import React, { useState, useEffect } from "react";
// import "../CSS/ChatSidebar.css"; // Ensure you are importing the correct CSS file

// const ChatSidebar = ({ onSelectUser }) => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [recentChats, setRecentChats] = useState([]);
//   // "dchitte@okstate.edu"
//   const [loading, setLoading] = useState(false);
//   const [noResults, setNoResults] = useState(false);
//   const [showDropdown, setShowDropdown] = useState(false); // State for showing dropdown menu

//   useEffect(() => {
//     const fetchUsers = async () => {
//       if (searchQuery === "") {
//         setSearchResults([]);
//         setNoResults(false);
//         return;
//       }

//       setLoading(true);
//       try {
//         const response = await fetch(`http://localhost:5001/users?search=${searchQuery}`);
//         const data = await response.json();
//         if (data.length === 0) {
//           setNoResults(true);
//         } else {
//           setNoResults(false);
//         }
//         setSearchResults(data);
//       } catch (error) {
//         console.error("Error fetching users:", error);
//         setNoResults(true);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUsers();
//   }, [searchQuery]);

//   const handleSelectUser = (user) => {
//     onSelectUser(user);

//     if (!recentChats.includes(user)) {
//       setRecentChats((prevChats) => [user, ...prevChats]);
//     }
//   };

//   const generateAvatar = (seed) => {
//     return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${seed}`;
//   };

//   // Function to handle logout
//   const handleLogout = () => {
//     localStorage.removeItem("token"); // Clear token
//     window.location.href = "/"; // Redirect to login page
//   };

//   // Toggle dropdown visibility
//   const toggleDropdown = () => {
//     setShowDropdown(!showDropdown);
//   };

//   return (
//     <div className="chat-sidebar">
//       <div className="chat-sidebar-header">
//         <img
//           src={generateAvatar("loggedInUser")}
//           alt="Profile"
//           className="profile-pic"
//         />
//         <input
//           type="text"
//           placeholder="Search..."
//           className="chat-search-bar"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />
        
//         {/* Three dots dropdown */}
//         <div className="three-dots" onClick={toggleDropdown}>
//           <span>⋮</span>
//           {showDropdown && (
//             <div className="dropdown-menu">
//               <p onClick={handleLogout}>Sign Out</p>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="recent-chats">
//         <h3>{searchQuery ? "Search Results" : "Recent Chats"}</h3>

//         {loading && <p>Loading...</p>}

//         {!loading && noResults && <p>No users found</p>}

//         {!loading &&
//           searchQuery &&
//           searchResults.map((chat, index) => (
//             <div
//               key={index}
//               className="recent-chat"
//               onClick={() => handleSelectUser(chat)}
//             >
//               <img
//                 src={generateAvatar(chat)}
//                 alt="Avatar"
//                 className="recent-chat-avatar"
//               />
//               <p>{chat}</p>
//             </div>
//           ))}

//         {!searchQuery &&
//           recentChats.map((chat, index) => (
//             <div
//               key={index}
//               className="recent-chat"
//               onClick={() => handleSelectUser(chat)}
//             >
//               <img
//                 src={generateAvatar(chat)}
//                 alt="Avatar"
//                 className="recent-chat-avatar"
//               />
//               <p>{chat}</p>
//             </div>
//           ))}
//       </div>
//     </div>
//   );
// };

// export default ChatSidebar;



//Deployment code

import React, { useState, useEffect } from "react";
import "../CSS/ChatSidebar.css";

const ChatSidebar = ({ onSelectUser }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentChats, setRecentChats] = useState(
    JSON.parse(localStorage.getItem("recentChats")) || []
  );
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!searchQuery) {
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

        setNoResults(data.length === 0);
        setSearchResults(data);
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

    if (!recentChats.includes(user)) {
      const updatedChats = [user, ...recentChats];
      setRecentChats(updatedChats);
      localStorage.setItem("recentChats", JSON.stringify(updatedChats));
    }
  };

  const generateAvatar = (seed) =>
    `https://api.dicebear.com/9.x/pixel-art/svg?seed=${seed}`;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("recentChats");
    window.location.href = "/"; // Redirect to login
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar-header">
        <img
          src={generateAvatar("loggedInUser")}
          alt="Profile"
          className="profile-pic"
          onError={(e) => (e.target.src = "/path/to/fallback-image.png")}
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
              <p onClick={handleLogout}>Sign Out</p>
            </div>
          )}
        </div>
      </div>

      <div className="recent-chats">
        <h3>{searchQuery ? "Search Results" : "Recent Chats"}</h3>

        {loading && <p>Loading...</p>}

        {!loading && noResults && <p>No users found</p>}

        {!loading &&
          searchQuery &&
          searchResults.map((chat, index) => (
            <div
              key={index}
              className="recent-chat"
              onClick={() => handleSelectUser(chat)}
            >
              <img
                src={generateAvatar(chat)}
                alt="Avatar"
                className="recent-chat-avatar"
                onError={(e) => (e.target.src = "/path/to/fallback-image.png")}
              />
              <p>{chat}</p>
            </div>
          ))}

        {!searchQuery &&
          recentChats.map((chat, index) => (
            <div
              key={index}
              className="recent-chat"
              onClick={() => handleSelectUser(chat)}
            >
              <img
                src={generateAvatar(chat)}
                alt="Avatar"
                className="recent-chat-avatar"
                onError={(e) => (e.target.src = "/path/to/fallback-image.png")}
              />
              <p>{chat}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ChatSidebar;
