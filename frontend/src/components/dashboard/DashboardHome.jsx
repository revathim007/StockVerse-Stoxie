import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, Search, Plus, X } from 'lucide-react';

const DashboardHome = () => {
  const [portfolioName, setPortfolioName] = useState('');
  const [stockSearch, setStockSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (stockSearch.length < 1) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await axios.get(`http://localhost:8000/api/stocks/?search=${stockSearch}`);
        setSuggestions(response.data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(timer);
  }, [stockSearch]);

  const addStock = (stock) => {
    if (!selectedStocks.find(s => s.id === stock.id)) {
      setSelectedStocks([...selectedStocks, { ...stock, quantity: 1 }]);
    }
    setStockSearch('');
    setShowSuggestions(false);
  };

  const updateStockQuantity = (stockId, quantity) => {
    setSelectedStocks(selectedStocks.map(s => 
      s.id === stockId ? { ...s, quantity: parseInt(quantity) || 1 } : s
    ));
  };

  const removeStock = (stockId) => {
    setSelectedStocks(selectedStocks.filter(s => s.id !== stockId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!portfolioName.trim() || selectedStocks.length === 0) {
      alert('Please enter a portfolio name and add at least one stock.');
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const payload = {
        name: portfolioName,
        stocks_data: selectedStocks.map(s => ({
          stock_id: s.id,
          quantity: s.quantity
        })),
        user_id: userData.id
      };
      
      await axios.post('http://localhost:8000/api/stocks/portfolios/', payload);
      alert(`Portfolio "${portfolioName}" created successfully!`);
      
      // Reset form
      setPortfolioName('');
      setSelectedStocks([]);
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
            <span className="text-2xl font-black text-gray-900">₹1,24,500.00</span>
          </div>
          <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Active Portfolios</span>
            <span className="text-2xl font-black text-gray-900">12</span>
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

              <div className="relative">
                <label className="block text-sm font-bold text-gray-700 mb-2">Add Stocks</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400" size={18} />
                  </div>
                  <input 
                    type="text" 
                    value={stockSearch}
                    onChange={(e) => {
                      setStockSearch(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Search stock name or symbol..." 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-medium"
                  />
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-60 overflow-y-auto overflow-x-hidden animate-in fade-in zoom-in-95 duration-200">
                    {suggestions.map((stock) => (
                      <div 
                        key={stock.id}
                        onClick={() => addStock(stock)}
                        className="p-4 hover:bg-green-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0 flex justify-between items-center group"
                      >
                        <div className="flex flex-col">
                          <span className="font-black text-gray-900 group-hover:text-green-700">{stock.symbol.split('.')[0]}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase truncate max-w-[150px]">{stock.name}</span>
                        </div>
                        <Plus size={18} className="text-gray-300 group-hover:text-green-600 transition-colors" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Stocks List */}
              {selectedStocks.length > 0 && (
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected Assets & Quantity</label>
                  <div className="flex flex-col gap-2">
                    {selectedStocks.map((stock) => (
                      <div key={stock.id} className="bg-green-50 border border-green-100 p-3 rounded-xl flex items-center justify-between animate-in zoom-in duration-200">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-gray-900">{stock.symbol.split('.')[0]}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase truncate max-w-[100px]">{stock.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center bg-white border border-green-200 rounded-lg px-2 py-1">
                            <label className="text-[10px] font-black text-green-600 mr-2 uppercase">Qty:</label>
                            <input 
                              type="number" 
                              min="1"
                              value={stock.quantity}
                              onChange={(e) => updateStockQuantity(stock.id, e.target.value)}
                              className="w-12 text-xs font-black text-gray-900 outline-none"
                            />
                          </div>
                          <button onClick={() => removeStock(stock.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
