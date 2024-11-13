import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './Components/LandingPage.jsx';
import Authentication from './Components/Authentication.jsx';
import Chat from './Components/Chat.jsx'; // Your chat component

function App() {
  return (
    <Router>
      <div className="App">
        {/* <div>
        <h1 className="app-title">Chat Application</h1>
        </div> */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/chat" element={<Chat />} />
          {/* <Route path="/register" element={<Authentication isRegister={true} />} /> */}
        <Route path="/login" element={<Authentication />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
