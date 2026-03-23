import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  TrendingUp, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard, 
  Briefcase, 
  LineChart, 
  BarChart3,
} from 'lucide-react';

const CustomerWelcome = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (!savedUser || savedUser.role !== 'customer') {
      navigate('/login');
    } else {
      setUser(savedUser);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/customer-welcome', icon: <LayoutDashboard size={20} /> },
    { name: 'Stock', path: '/customer-welcome/stock', icon: <TrendingUp size={20} /> },
    { name: 'Portfolio', path: '/customer-welcome/portfolio', icon: <Briefcase size={20} /> },
    { name: 'Built-in Portfolios', path: '/customer-welcome/builtin-portfolios', icon: <Layers size={20} /> },
    { name: 'Forecast', path: '/customer-welcome/forecast', icon: <LineChart size={20} /> },
    { name: 'Sentiment Analysis', path: '/customer-welcome/sentiment', icon: <BarChart3 size={20} /> },
  ];

  const activePath = location.pathname;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        {/* Top Left Branding & Welcome */}
        <div className="flex flex-col">
          <div className="flex items-center">
            <TrendingUp className="text-green-600 mr-2" size={28} />
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 leading-none">
              Stock<span className="text-green-600">Verse</span>
            </h1>
          </div>
          <div className="ml-9 mt-0.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
              Welcome, <span className="text-green-600">{user.username}</span>
            </p>
          </div>
        </div>

        {/* Center Navigation Links */}
        <div className="hidden lg:flex items-center bg-gray-100 p-1 rounded-full border border-gray-200">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 font-semibold text-xs ${
                activePath === item.path 
                  ? 'bg-green-600 text-white shadow-md' 
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </div>

        {/* Top Right Profile Section */}
        <div className="flex items-center space-x-6">
          <div 
            onClick={() => navigate('/customer-welcome/profile')}
            className="flex items-center space-x-3 bg-gray-100 px-4 py-2 rounded-full border border-gray-200 cursor-pointer hover:bg-gray-200 transition-all group"
          >
            <span className="text-gray-700 font-semibold group-hover:text-green-600 transition-colors">{user.username}</span>
            <div className="bg-green-600 p-1.5 rounded-full text-white group-hover:scale-110 transition-transform">
              <UserIcon size={18} />
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium border border-red-200"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default CustomerWelcome;
