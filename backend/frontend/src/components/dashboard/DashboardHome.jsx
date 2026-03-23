import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, Search, Plus, X } from 'lucide-react';

const DashboardHome = () => {
  const [portfolioName, setPortfolioName] = useState('');
  const [portfolioDescription, setPortfolioDescription] = useState('');
  const [stats, setStats] = useState({ totalNetWorth: 0, activePortfolios: 0 });

  const fetchStats = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData) return;
      
      const response = await axios.get(`http://localhost:8000/api/stocks/portfolios/?user_id=${userData.id}`);
      const portfolios = response.data;
      
      let totalWorth = 0;
      portfolios.forEach(portfolio => {
        portfolio.items.forEach(item => {
          totalWorth += parseFloat(item.stock.current_price || 0) * item.quantity;
        });
      });
      
      setStats({
        totalNetWorth: totalWorth,
        activePortfolios: portfolios.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!portfolioName.trim()) {
      alert('Please enter a portfolio name.');
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const payload = {
        name: portfolioName,
        description: portfolioDescription,
        user_id: userData.id
      };
      
      await axios.post('http://localhost:8000/api/stocks/portfolios/', payload);
      alert(`Portfolio "${portfolioName}" created successfully!`);
      
      // Reset form
      setPortfolioName('');
      setPortfolioDescription('');
      fetchStats(); // Update dashboard stats immediately
    } catch (error) {
      console.error('Error creating portfolio:', error);
      alert('Failed to create portfolio. Please try again.');
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-10 border-b border-gray-200 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h1 className="text-4xl font-extrabold text-gray-900">Dashboard</h1>
        
        <div className="flex flex-wrap gap-4">
          <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Net worth</span>
            <span className="text-2xl font-black text-gray-900">
              ₹{stats.totalNetWorth.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Active Portfolios</span>
            <span className="text-2xl font-black text-gray-900">{stats.activePortfolios}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Briefcase className="text-green-600 mr-2" size={24} />
              Create Portfolio
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Portfolio Name</label>
                <input 
                  type="text" 
                  value={portfolioName}
                  onChange={(e) => setPortfolioName(e.target.value)}
                  placeholder="e.g. Retirement Fund" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Portfolio Description</label>
                <textarea 
                  value={portfolioDescription}
                  onChange={(e) => setPortfolioDescription(e.target.value)}
                  placeholder="e.g. This portfolio focuses on long-term growth stocks and high-dividend yields." 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-medium min-h-[120px] resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-xl shadow-xl shadow-green-100 transition-all mt-4 uppercase tracking-wider active:scale-95"
              >
                Create Portfolio
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-10 rounded-3xl border border-gray-200 shadow-xl min-h-[400px] flex flex-col items-center justify-center text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Welcome to your Dashboard</h3>
            <p className="text-gray-500 max-w-md">
              Here you can see an overview of all your financial activities. Start by creating a portfolio on the left!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
