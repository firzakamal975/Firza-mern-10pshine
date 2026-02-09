import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token); // Token save kar liya
      alert('Login Successful!');
      navigate('/dashboard'); // Dashboard par bhej diya
    } catch (err) {
      alert(err.response?.data?.message || 'Login Failed');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Login to Notes App</h2>
        <input 
          type="email" placeholder="Email" 
          className="w-full p-2 mb-4 border rounded"
          onChange={(e) => setEmail(e.target.value)} required 
        />
        <input 
          type="password" placeholder="Password" 
          className="w-full p-2 mb-6 border rounded"
          onChange={(e) => setPassword(e.target.value)} required 
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;