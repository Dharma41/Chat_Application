import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the URL contains a token (after Google login)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      // Store the token in localStorage
      localStorage.setItem('token', token);

      // Navigate to the chat page (or remove the token from the URL)
      navigate('/chat');
    }
  }, [navigate]);

  return (
    <div>
      <h1>Welcome to Chat</h1>
      {/* Your chat component content */}
    </div>
  );
};

export default Chat;