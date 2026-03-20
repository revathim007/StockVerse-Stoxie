import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, Layers, TrendingUp, Calendar, Trash2, Plus, Search, X } from 'lucide-react';

const Portfolio = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [stockSearch, setStockSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedStocks, setSelectedStocks] = useState([]);

  const fetchPortfolios = async () => {
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get(`http://localhost:8000/api/stocks/portfolios/?user_id=${userData.id}`);
      setPortfolios(response.data);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

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

  const calculateTotalValue = (items) => {
    return items.reduce((sum, item) => sum + (parseFloat(item.stock.current_price || 0) * item.quantity), 0);
  };

  const handleOpenAddModal = (portfolio) => {
    setSelectedPortfolio(portfolio);
    setShowAddModal(true);
    setStockSearch('');
    setSelectedStocks([]);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setSelectedPortfolio(null);
    setStockSearch('');
    setSelectedStocks([]);
  };

  const addStockToSelected = (stock) => {
    if (!selectedStocks.find(s => s.id === stock.id)) {
      setSelectedStocks([...selectedStocks, { ...stock, quantity: 1 }]);
    }
    setStockSearch('');
  };

  const updateStockQuantity = (stockId, quantity) => {
    setSelectedStocks(selectedStocks.map(s => 
      s.id === stockId ? { ...s, quantity: parseInt(quantity) || 1 } : s
    ));
  };

  const removeStockFromSelected = (stockId) => {
    setSelectedStocks(selectedStocks.filter(s => s.id !== stockId));
  };

  const handleUpdatePortfolio = async () => {
    if (selectedStocks.length === 0) return;
    
    try {
      await axios.patch(`http://localhost:8000/api/stocks/portfolios/${selectedPortfolio.id}/`, {
        stocks_data: selectedStocks.map(s => ({
          stock_id: s.id,
          quantity: s.quantity
        }))
      });
      alert('Stocks added to portfolio successfully!');
      handleCloseAddModal();
      fetchPortfolios();
    } catch (error) {
      console.error('Error updating portfolio:', error);
      alert('Failed to update portfolio.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin text-green-600">
          <Layers size={48} />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">Your Portfolios</h1>
          <p className="text-gray-500 mt-2 font-medium">Manage and track your custom stock collections.</p>
        </div>
        <div className="bg-white px-8 py-4 rounded-3xl shadow-xl border border-gray-100 flex items-center space-x-4">
          <div className="bg-green-100 p-3 rounded-2xl text-green-600">
            <Briefcase size={24} />
          </div>
          <div>
            <span className="text-gray-400 text-xs font-black uppercase tracking-widest">Total Portfolios</span>
            <div className="text-2xl font-black text-gray-900">{portfolios.length}</div>
          </div>
        </div>
      </header>

      {portfolios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map((portfolio) => (
            <div key={portfolio.id} className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden group hover:shadow-2xl transition-all duration-300 flex flex-col">
              <div className="p-8 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-lg uppercase tracking-widest">
                    ID: {portfolio.portfolio_id}
                  </span>
                  <div className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                    <Trash2 size={18} />
                  </div>
                </div>
                
                <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  {portfolio.name}
                </h3>
                
                <div className="flex items-center text-gray-400 text-xs font-bold mb-6">
                  <Calendar size={14} className="mr-1.5" />
                  <span>Created {new Date(portfolio.created_at).toLocaleDateString()}</span>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                    <span className="text-gray-500 font-bold text-xs uppercase tracking-wider">Asset Value</span>
                    <span className="text-lg font-black text-gray-900">
                      ₹{calculateTotalValue(portfolio.items).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-bold text-xs uppercase tracking-wider">Stocks</span>
                    <span className="text-sm font-black text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      {portfolio.items.length} Items
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {portfolio.items.slice(0, 3).map((item) => (
                    <div key={item.stock.id} className="flex items-center space-x-1 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                      <span className="text-[10px] font-black text-gray-400 uppercase">
                        {item.stock.symbol.split('.')[0]}
                      </span>
                      <span className="text-[10px] font-black text-green-600">x{item.quantity}</span>
                    </div>
                  ))}
                  {portfolio.items.length > 3 && (
                    <span className="text-[10px] font-black bg-gray-50 text-gray-400 px-2.5 py-1 rounded-md uppercase border border-gray-100">
                      +{portfolio.items.length - 3} More
                    </span>
                  )}
                </div>
              </div>
              
              <div className="px-8 pb-8 space-y-3">
                <button 
                  onClick={() => handleOpenAddModal(portfolio)}
                  className="w-full bg-green-50 text-green-600 hover:bg-green-600 hover:text-white p-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center border border-green-100"
                >
                  <Plus size={16} className="mr-2" />
                  Add Stocks
                </button>
                <button className="w-full bg-gray-50 hover:bg-gray-900 hover:text-white p-3 rounded-xl text-xs font-black text-gray-400 uppercase tracking-widest transition-all border border-gray-100">
                  View Detailed Analytics
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-20 rounded-[3rem] shadow-xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="bg-gray-50 p-8 rounded-full mb-6">
            <Briefcase size={64} className="text-gray-200" />
          </div>
          <h3 className="text-2xl font-black text-gray-300">No Portfolios Found</h3>
          <p className="text-gray-400 max-w-xs mt-2 font-medium">Head over to the Dashboard to create your first investment collection.</p>
        </div>
      )}

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-gray-900 flex items-center">
                  <Plus className="text-green-600 mr-2" size={24} />
                  Add to {selectedPortfolio?.name}
                </h3>
                <button onClick={handleCloseAddModal} className="text-gray-400 hover:text-red-500 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Search Stocks</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="text-gray-400" size={18} />
                    </div>
                    <input 
                      type="text" 
                      value={stockSearch}
                      onChange={(e) => setStockSearch(e.target.value)}
                      placeholder="Search name or symbol..." 
                      className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none transition-all font-bold text-gray-700"
                    />
                  </div>

                  {/* Suggestions Dropdown */}
                  {suggestions.length > 0 && (
                    <div className="absolute z-[110] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-48 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                      {suggestions.map((stock) => (
                        <div 
                          key={stock.id}
                          onClick={() => addStockToSelected(stock)}
                          className="p-4 hover:bg-green-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0 flex justify-between items-center group"
                        >
                          <div className="flex flex-col">
                            <span className="font-black text-gray-900 group-hover:text-green-700">{stock.symbol.split('.')[0]}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">{stock.name}</span>
                          </div>
                          <Plus size={16} className="text-gray-300 group-hover:text-green-600" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Stocks tags */}
                {selectedStocks.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Stocks to Add & Quantity</label>
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
                            <button onClick={() => removeStockFromSelected(stock.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleUpdatePortfolio}
                  disabled={selectedStocks.length === 0}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-green-100 transition-all uppercase tracking-widest active:scale-95 disabled:opacity-50"
                >
                  Update Portfolio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
