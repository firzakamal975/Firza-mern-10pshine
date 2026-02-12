import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import AppSettings from './pages/AppSettings'; 
import FavoriteNotes from './pages/FavoriteNotes';
// 1. Naya PublicView page import karein
import PublicView from './pages/PublicView'; 

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right" 
        reverseOrder={false} 
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#1e293b',
            border: '1px solid #e2e8f0',
            fontWeight: 'bold',
            borderRadius: '12px',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* --- PUBLIC ROUTE (No Login Required) --- */}
        {/* Isay ProtectedRoute ke bahar rakha hai taake har koi dekh sake */}
        <Route path="/view-note/:id" element={<PublicView />} />
        
        {/* Dashboard Route */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Profile Route */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />

        {/* Favorite Notes Route */}
        <Route 
          path="/favorites" 
          element={
            <ProtectedRoute>
              <FavoriteNotes />
            </ProtectedRoute>
          } 
        />

        {/* Settings Route */}
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <AppSettings />
            </ProtectedRoute>
          } 
        />

        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<div className="bg-[#f1f5f9] min-h-screen flex items-center justify-center text-slate-800 font-bold text-2xl">404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;