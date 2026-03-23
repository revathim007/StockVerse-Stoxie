import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminWelcome = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (!savedUser || savedUser.role !== 'admin') {
      navigate('/login');
    } else {
      setUser(savedUser);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-blue-600 flex flex-col items-center justify-center text-white">
      <h1 className="text-5xl font-bold mb-4 animate-bounce">Welcome Admin!</h1>
      {user && (
        <div className="bg-white text-blue-600 p-8 rounded-lg shadow-2xl text-center">
          <p className="text-xl mb-2">Logged in as: <span className="font-bold">{user.full_name}</span></p>
          <p className="mb-2">Admin ID: <span className="font-mono font-bold">{user.custom_id}</span></p>
          <p className="mb-6">Username: {user.username}</p>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminWelcome;
