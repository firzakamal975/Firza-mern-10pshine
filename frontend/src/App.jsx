import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup'; // Import karein

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/dashboard" element={<div className="p-10 text-2xl">Notes Dashboard Coming Soon!</div>} />
      </Routes>
    </Router>
  );
}

export default App;