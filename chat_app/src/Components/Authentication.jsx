import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/Authentication.css';
import googleLogo from '../Assets/google.png';

const Authentication = () => {
  const [username, setUsername] = useState('');
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
      const payload = isRegister 
        ? { username, email, password }
        : { username, password };
  
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
      if (data.success) {
        if (isRegister) {
          setRegisterSuccess(true); 
          setIsRegister(false); // Switch back to login form
          localStorage.setItem('email', email); // Set email during registration
        } else {
          localStorage.setItem('token', data.token);
          localStorage.setItem('username', username);
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
    if (!username) {
      setError('Please enter a username to continue with Google.');
      return;
    }
    localStorage.setItem('username', username); // Set only the username here
    window.location.href = `${process.env.REACT_APP_SERVER_URL}/auth/google`;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email'); // Retrieve the email if set previously
    if (token && username) {
      localStorage.setItem('token', token);
      navigate('/chat');
    }
  }, [navigate]);

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        {registerSuccess && <p className="success-message">Successfully created. Please login.</p>}
        
        <h1>{isRegister ? 'Create Account' : 'Login'}</h1>

        <label htmlFor="username"></label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          required
        />

        {isRegister && (
          <>
            <label htmlFor="email"></label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </>
        )}

        <label htmlFor="password"></label>
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

        <button type="button" className="create-account-button" onClick={() => setIsRegister(!isRegister)}>
          <span >
            {isRegister ? 'Login Instead' : 'Create an Account'}
          </span>
        </button>
      </form>
    </div>
  );
};

export default Authentication;
