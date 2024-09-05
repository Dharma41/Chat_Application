import React from 'react';
import '../CSS/Authentication.css'

const Authentication = () => {
  return (
    <div className="auth-container">
      <div className="auth-form">
        <label htmlFor="username">Username:</label>
        <input type="email" id="username" placeholder="Enter your email" />
        
        <label htmlFor="password">Password:</label>
        <input type="password" id="password" placeholder="Enter your password" />
        
        <button className="auth-button">Login</button>
      </div>
    </div>
  );
};

export default Authentication;
