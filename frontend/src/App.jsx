import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/dashboard" element={<div className="text-center mt-10 text-2xl">Dashboard Coming Soon!</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;