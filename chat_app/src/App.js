import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Authentication from './Components/Authentication.jsx';
import Chat from './Components/Chat.jsx'; // Your chat component

function App() {
  return (
    <Router>
      <div className="App">
        <h1 className="app-title">Chat Application</h1>
        <Routes>
          <Route path="/" element={<Authentication />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
