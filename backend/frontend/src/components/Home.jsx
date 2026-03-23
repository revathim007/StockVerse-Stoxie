import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-black flex flex-col items-center justify-center text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-700 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Branding */}
      <div className="z-10 text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <TrendingUp size={64} className="text-blue-400 mr-4" />
          <h1 className="text-7xl font-extrabold tracking-tighter">
            Stock<span className="text-blue-500">Verse</span>
          </h1>
        </div>
        <p className="text-xl text-gray-400 max-w-lg mx-auto">
          Navigate the financial universe with precision. Real-time insights, advanced tracking, and professional tools for everyone.
        </p>
      </div>

      {/* Get Started Button */}
      <button
        onClick={() => navigate('/register')}
        className="z-10 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-12 rounded-full text-2xl transition-all transform hover:scale-105 shadow-lg shadow-blue-500/50"
      >
        Get Started
      </button>

      {/* Footer Branding */}
      <div className="absolute bottom-8 text-gray-500 text-sm">
        © 2026 StockVerse. All rights reserved.
      </div>
    </div>
  );
};

export default Home;
