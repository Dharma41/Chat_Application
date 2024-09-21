import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/Authentication.css';
import google from '../Assets/google.png';

const Authentication = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false); // Toggle between login and register
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Function to handle email/password form submission (login or register)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? 'register' : 'login';
      const response = await fetch(`http://localhost:5001/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (data.success) {
        // Store the JWT token in localStorage
        localStorage.setItem('token', data.token);

        // Navigate to the chat page upon successful registration or login
        navigate('/chat');
      } else {
        setError(data.message || 'Error: Please check your credentials.');
      }
    } catch (error) {
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle Google login redirection
  const handleGoogleLogin = () => {
    // Redirect to the Google OAuth URL on your server
    window.location.href = 'http://localhost:5001/auth/google';
  };

  // Check if the Google OAuth redirect provides a token in the URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      // Store the token in localStorage and navigate to the chat page
      localStorage.setItem('token', token);
      navigate('/chat');
    }
  }, [navigate]);

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />

        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Loading...' : isRegister ? 'Register' : 'Login'}
        </button>

        <div className="social-login">
          <button type="button" className="google-button" onClick={handleGoogleLogin} disabled={loading}>
            <img src={google} alt="Google logo" /> Google
          </button>
        </div>

        <p className="toggle-auth">
          {isRegister ? 'Already have an account?' : 'Need an account?'}
          <span onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Login here' : 'Register here'}
          </span>
        </p>
      </form>
    </div>
  );
};

export default Authentication;