import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bookmark, TrendingUp, TrendingDown, Trash2, ArrowUpRight, ArrowDownRight, RefreshCw, Layers } from 'lucide-react';

const MyCollections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get(`http://localhost:8000/api/stocks/collections/?user_id=${userData.id}`);
      setCollections(response.data);
      // Initialize quantities for each stock
      const initialQuantities = {};
      response.data.forEach(item => {
        initialQuantities[item.stock.id] = 1;
      });
      setQuantities(initialQuantities);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleQuantityChange = (stockId, value) => {
    const val = parseInt(value) || 1;
    setQuantities({
      ...quantities,
      [stockId]: val > 0 ? val : 1
    });
  };

  const handleBuy = async (stockId) => {
    const quantity = quantities[stockId];
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      await axios.post('http://localhost:8000/api/stocks/purchases/', {
        user_id: userData.id,
        stock_id: stockId,
        quantity: quantity
      });
      alert('Purchase successful!');
    } catch (error) {
      console.error('Error buying stock:', error);
      alert('Failed to complete purchase.');
    }
  };

  const handleRemove = async (stockId) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      await axios.delete(`http://localhost:8000/api/stocks/collections/delete/?user_id=${userData.id}&stock_id=${stockId}`);
      setCollections(collections.filter(item => item.stock.id !== stockId));
    } catch (error) {
      console.error('Error removing from collection:', error);
      alert('Failed to remove stock from collection.');
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
          <h1 className="text-4xl font-extrabold text-gray-900">My Collections</h1>
          <p className="text-gray-500 mt-2 font-medium">Your personally curated watchlist of stocks.</p>
        </div>
        <div className="bg-white px-8 py-4 rounded-3xl shadow-xl border border-gray-100 flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
            <Bookmark size={24} />
          </div>
          <div>
            <span className="text-gray-400 text-xs font-black uppercase tracking-widest">Saved Assets</span>
            <div className="text-2xl font-black text-gray-900">{collections.length}</div>
          </div>
        </div>
      </header>

      {collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((item) => (
            <div key={item.id} className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col">
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black rounded-lg uppercase tracking-widest w-fit mb-2">
                      {item.stock.symbol}
                    </span>
                    <h3 className="text-2xl font-black text-gray-900 group-hover:text-green-600 transition-colors">
                      {item.stock.name}
                    </h3>
                  </div>
                  <button 
                    onClick={() => handleRemove(item.stock.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-xl"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest block mb-1">Price</span>
                    <span className="text-xl font-black text-gray-900">
                      {item.stock.currency === 'USD' ? '$' : '₹'}{parseFloat(item.stock.current_price).toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest block mb-1">PE Ratio</span>
                    <span className="text-xl font-black text-gray-900">
                      {item.stock.pe_ratio ? parseFloat(item.stock.pe_ratio).toFixed(1) : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                  <span>{item.stock.sector}</span>
                  <span>Added {new Date(item.added_at).toLocaleDateString()}</span>
                </div>

                {/* Quantity and Buy Section */}
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Quantity</label>
                    <input 
                      type="number" 
                      min="1"
                      value={quantities[item.stock.id] || 1}
                      onChange={(e) => handleQuantityChange(item.stock.id, e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm font-black focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                  <button 
                    onClick={() => handleBuy(item.stock.id)}
                    className="flex-[2] bg-green-600 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-100 mt-4"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
              
              <div className="px-8 pb-8">
                <button className="w-full bg-gray-900 text-white p-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-lg active:scale-95">
                  View Analysis
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-20 rounded-[3rem] shadow-xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="bg-gray-50 p-8 rounded-full mb-6">
            <Bookmark size={64} className="text-gray-200" />
          </div>
          <h3 className="text-2xl font-black text-gray-300">Your collection is empty</h3>
          <p className="text-gray-400 max-w-xs mt-2 font-medium">Head to the Stocks page and click 'Add' on any stock to build your watchlist.</p>
        </div>
      )}
    </div>
  );
};

export default MyCollections;
