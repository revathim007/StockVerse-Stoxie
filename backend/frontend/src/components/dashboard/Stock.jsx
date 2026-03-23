import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ArrowUpRight, TrendingUp, RefreshCw, BarChart3, Percent, DollarSign, IndianRupee, Plus, Check } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Stock = () => {
  const [loading, setLoading] = useState(false);
  const [addingToCollection, setAddingToCollection] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isInCollection, setIsInCollection] = useState(false);

  const checkIfInCollection = async (stockId) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get(`http://localhost:8000/api/stocks/collections/?user_id=${userData.id}`);
      const alreadyAdded = response.data.some(item => item.stock.id === stockId);
      setIsInCollection(alreadyAdded);
    } catch (error) {
      console.error('Error checking collection:', error);
    }
  };

  const handleAddToCollection = async () => {
    if (!selectedStock || isInCollection) return;
    
    setAddingToCollection(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      await axios.post('http://localhost:8000/api/stocks/collections/', {
        user_id: userData.id,
        stock_id: selectedStock.id
      });
      setIsInCollection(true);
      alert(`${selectedStock.symbol} added to your collections!`);
    } catch (error) {
      console.error('Error adding to collection:', error);
      alert('Failed to add stock to collection.');
    } finally {
      setAddingToCollection(false);
    }
  };

  const fetchStockDetails = async (stock) => {
    setHistoryLoading(true);
    try {
      const historyRes = await axios.get(`http://localhost:8000/api/stocks/history/${stock.symbol}/`);
      setHistoryData(historyRes.data);
      await checkIfInCollection(stock.id);
    } catch (error) {
      console.error('Error fetching stock history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await axios.get(`http://localhost:8000/api/stocks/?search=${searchQuery}`);
        setSuggestions(response.data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    const timer = setTimeout(() => {
      if (showSuggestions) {
        fetchSuggestions();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, showSuggestions]);

  const executeSearch = async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    setShowSuggestions(false);
    setHistoryData([]); // Reset history for new search
    try {
      const response = await axios.get(`http://localhost:8000/api/stocks/?search=${query}`);
      if (response.data.length > 0) {
        const stock = response.data[0];
        setSelectedStock(stock);
        fetchStockDetails(stock);
      } else {
        setSelectedStock(null);
        setIsInCollection(false);
        alert('Stock not found in our database');
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const handleSuggestionClick = (stock) => {
    setSearchQuery(stock.name); // Update input to reflect selection
    executeSearch(stock.symbol); // Search by symbol for accuracy
  };

  const getCurrencyIcon = (currency) => {
    if (currency === 'USD') return <DollarSign size={20} className="mr-1" />;
    return <IndianRupee size={20} className="mr-1" />;
  };

  const formatCurrency = (value, currency) => {
    const symbol = currency === 'USD' ? '$' : '₹';
    return `${symbol}${parseFloat(value).toLocaleString(currency === 'USD' ? 'en-US' : 'en-IN')}`;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900">Market Insights</h1>
        <p className="text-gray-500 mt-2 font-medium">Search for any stock to view its 30-day moving average and key metrics.</p>
      </header>

      <div className="flex flex-col space-y-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="w-full flex gap-3 relative">
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="text-gray-400 group-focus-within:text-green-600 transition-colors" size={22} />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search by Symbol (e.g. RELIANCE, AAPL) or Company Name..." 
              className="w-full pl-14 pr-4 py-5 bg-white border-2 border-gray-100 rounded-3xl shadow-sm focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none transition-all text-gray-700 font-semibold text-lg"
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-3xl shadow-2xl max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                {suggestions.map((stock) => (
                  <div 
                    key={stock.id}
                    onClick={() => handleSuggestionClick(stock)}
                    className="p-5 hover:bg-green-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0 flex justify-between items-center group"
                  >
                    <div className="flex flex-col">
                      <span className="font-black text-gray-900 group-hover:text-green-700 text-lg">{stock.symbol.split('.')[0]}</span>
                      <span className="text-sm text-gray-500 font-bold uppercase">{stock.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-black text-gray-900">
                        {formatCurrency(stock.current_price, stock.currency)}
                      </span>
                      <ArrowUpRight size={20} className="text-gray-300 group-hover:text-green-600 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white font-black px-10 py-5 rounded-3xl shadow-xl shadow-green-200 transition-all flex items-center disabled:opacity-50 active:scale-95"
          >
            {loading ? <RefreshCw className="animate-spin" /> : 'SEARCH'}
          </button>
        </form>

        {selectedStock ? (
          <div className="grid grid-cols-1 gap-8 animate-in zoom-in-95 duration-500">
            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Stock Identity & Price */}
              <div className="md:col-span-2 bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-black rounded-lg uppercase tracking-widest">{selectedStock.symbol}</span>
                    <span className="text-gray-400 font-bold text-sm">{selectedStock.exchange}</span>
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 leading-tight">{selectedStock.name}</h2>
                  <p className="text-gray-500 font-bold mt-1 uppercase tracking-tighter">{selectedStock.sector}</p>
                </div>
                <div className="mt-8 flex justify-between items-end">
                  <div>
                    <div className="flex items-baseline">
                      <span className="text-5xl font-black text-gray-900 tracking-tighter">
                        {formatCurrency(selectedStock.current_price, selectedStock.currency)}
                      </span>
                    </div>
                    <div className="flex items-center text-green-600 font-bold mt-2">
                      <TrendingUp size={20} className="mr-2" />
                      <span>Live Market Price</span>
                    </div>
                  </div>
                  
                  {/* Add to Collection Button */}
                  <button
                    onClick={handleAddToCollection}
                    disabled={addingToCollection || isInCollection}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                      isInCollection 
                        ? 'bg-green-50 text-green-600 cursor-default' 
                        : 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg active:scale-95 disabled:opacity-50'
                    }`}
                  >
                    {addingToCollection ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : isInCollection ? (
                      <>
                        <Check size={16} />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* PE Ratio */}
              <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl mb-4">
                  <BarChart3 size={32} />
                </div>
                <h4 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">PE Ratio</h4>
                <div className="text-4xl font-black text-gray-900">
                  {selectedStock.pe_ratio ? parseFloat(selectedStock.pe_ratio).toFixed(2) : 'N/A'}
                </div>
                <p className="text-[10px] text-gray-400 mt-2 font-bold px-4">Price-to-Earnings Multiplier</p>
              </div>

              {/* Discount Ratio */}
              <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                <div className="bg-purple-50 text-purple-600 p-4 rounded-2xl mb-4">
                  <Percent size={32} />
                </div>
                <h4 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Discount Ratio</h4>
                <div className={`text-4xl font-black ${selectedStock.discount_ratio > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedStock.discount_ratio ? `${parseFloat(selectedStock.discount_ratio).toFixed(2)}%` : 'N/A'}
                </div>
                <p className="text-[10px] text-gray-400 mt-2 font-bold px-4">Difference from Target Price</p>
              </div>
            </div>

            {/* Closing Price Chart */}
            <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-gray-100">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-2xl font-black text-gray-900">Price History</h3>
                  <p className="text-gray-500 font-medium text-sm">Last 60 days closing price for {selectedStock.symbol}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-200"></div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Close Price</span>
                </div>
              </div>
              
              <div className="h-96 w-full">
                {historyLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 font-bold space-y-4">
                    <RefreshCw className="animate-spin text-green-500" size={40} />
                    <span className="animate-pulse">Analyzing Market Trends...</span>
                  </div>
                ) : historyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historyData}>
                      <defs>
                        <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 700}} 
                        dy={15}
                        interval={Math.ceil(historyData.length / 7)}
                      />
                      <YAxis 
                        hide={true} 
                        domain={['dataMin * 0.98', 'dataMax * 1.02']} 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '24px', 
                          border: 'none', 
                          boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                          padding: '16px',
                          fontWeight: '800'
                        }}
                        formatter={(value) => [
                          `${selectedStock.currency === 'USD' ? '$' : '₹'}${value.toFixed(2)}`, 
                          'Close Price'
                        ]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="close" 
                        stroke="#16a34a" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorClose)"
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 font-bold space-y-2">
                    <BarChart3 size={48} className="text-gray-200" />
                    <span>No historical data available for this period.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-20 rounded-[3rem] shadow-xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="bg-gray-50 p-8 rounded-full mb-6">
              <Search size={64} className="text-gray-200" />
            </div>
            <h3 className="text-2xl font-black text-gray-300">Start Your Analysis</h3>
            <p className="text-gray-400 max-w-xs mt-2 font-medium">Enter a stock ticker or name above to see detailed insights and moving average trends.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stock;

