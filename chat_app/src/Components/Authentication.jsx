import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/Authentication.css';
import googleLogo from '../Assets/google.png'; // Update this path

const Authentication = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false); // Toggle between login and register
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false); // Track registration success
  const navigate = useNavigate();

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
        if (isRegister) {
          // If registration is successful, show the success message
          setRegisterSuccess(true); 
          setIsRegister(false); // Switch back to login form
        } else {
          // If login is successful, navigate to the chat page
          localStorage.setItem('token', data.token);
          navigate('/chat');
        }
      } else {
        setError(data.message || 'Error: Please check your credentials.');
      }
    } catch (error) {
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5001/auth/google';
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      navigate('/chat');
    }
  }, [navigate]);

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        {/* Show success message after registration */}
        {registerSuccess && <p className="success-message">Successfully created. Please login.</p>}
        
        <h1>{isRegister ? 'Create Account' : 'Login'}</h1>
        
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

        <button type="button" className="google-button" onClick={handleGoogleLogin} disabled={loading}>
          <img src={googleLogo} alt="Google logo" /> Sign In With Google
        </button>

        <div className="or-divider">
          <span>OR</span>
        </div>

        <button type="button" className="create-account-button">
        <span onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Login Instead' : 'Create an Account'}
          </span>
        </button>
      </form>
    </div>
  );
};

export default Authentication;