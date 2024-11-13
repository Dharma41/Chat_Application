import React from 'react';
import { Link } from 'react-router-dom';
import '../CSS/LandingPage.css'; // Create this CSS file for styling

const LandingPage = () => {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="logo">Chat App</div>
        <nav>
          {/* <Link to="/register" className="nav-link">Join</Link> */}
          <Link to="/login" className="nav-link">Join</Link>
        </nav>
      </header>
      
      <div className="landing-content">
        <h1>Connect Instantly with Our Chat Application</h1>
        <p>
          Join our Real Time Chat Application to communicate seamlessly with friends and colleagues.
          Sign up today to start chatting and sharing media effortlessly!
        </p>

      </div>
    </div>
  );
};

export default LandingPage;