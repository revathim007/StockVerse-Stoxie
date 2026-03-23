import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [role, setRole] = useState('customer'); // 'customer' or 'admin'
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    mpin: '',
    phoneNumber: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        full_name: formData.fullName,
        username: formData.username,
        password: formData.password,
        role: role,
      };
      if (role === 'customer') {
        payload.email = formData.email;
        payload.mpin = formData.mpin;
        payload.phone_number = formData.phoneNumber;

        // Phone Validation
        const phoneRegex = /^[0-9]{10}$/;
        if (payload.phone_number && !phoneRegex.test(payload.phone_number)) {
          alert('Phone number must be exactly 10 digits and contain only numbers');
          return;
        }
      }
      
      await axios.post('http://localhost:8000/api/accounts/register/', payload);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      const errorMsg = error.response?.data 
        ? Object.entries(error.response.data).map(([key, value]) => `${key}: ${value}`).join('\n')
        : error.message;
      alert(`Registration failed:\n${errorMsg}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 relative">
        <div className="absolute top-4 left-4">
          <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-500 text-sm flex items-center">
            ← Home
          </button>
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600 pt-4">StockVerse Registration</h2>
        
        <div className="flex mb-6 bg-gray-200 rounded-full p-1">
          <button
            className={`flex-1 py-2 rounded-full transition-all ${role === 'customer' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
            onClick={() => setRole('customer')}
          >
            Customer
          </button>
          <button
            className={`flex-1 py-2 rounded-full transition-all ${role === 'admin' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
            onClick={() => setRole('admin')}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
            <input
              type="text"
              name="fullName"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter Full Name"
              required
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
            <input
              type="text"
              name="username"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter Username"
              required
              onChange={handleChange}
            />
          </div>
          
          {role === 'customer' && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                name="email"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter Email"
                required
                onChange={handleChange}
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              name="password"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter Password"
              required
              onChange={handleChange}
            />
          </div>

          {role === 'customer' && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                maxLength="10"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter 10-digit Phone Number"
                required
                onChange={handleChange}
              />
            </div>
          )}

          {role === 'customer' && (
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">MPIN</label>
              <input
                type="text"
                name="mpin"
                maxLength="6"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter 6-digit MPIN"
                required
                onChange={handleChange}
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Register as {role === 'customer' ? 'Customer' : 'Admin'}
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <span className="text-blue-600 cursor-pointer" onClick={() => navigate('/login')}>Login</span>
        </p>
      </div>
    </div>
  );
};

export default Register;
