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

  const getRowColor = (index) => {
    const colors = [
      'border-l-blue-500',
      'border-l-purple-500',
      'border-l-orange-500',
      'border-l-pink-500',
      'border-l-indigo-500',
      'border-l-green-500',
    ];
    return colors[index % colors.length];
  };

  const groupCollections = () => {
    const groups = {};
    collections.forEach(item => {
      const groupName = item.portfolio_name || 'Single Stocks';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(item);
    });
    return groups;
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
        <div className="space-y-12">
          {Object.entries(groupCollections()).map(([groupName, items], groupIndex) => (
            <div key={groupName} className="animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`w-2 h-8 rounded-full ${groupName === 'Single Stocks' ? 'bg-gray-300' : 'bg-green-500'}`}></div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                  {groupName}
                  <span className="ml-3 text-sm font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full lowercase">
                    {items.length} {items.length === 1 ? 'stock' : 'stocks'}
                  </span>
                </h2>
              </div>
              
              <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Stock</th>
                        <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Price</th>
                        <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">PE Ratio</th>
                        <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Sector</th>
                        <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {items.map((item, index) => (
                        <tr key={item.id} className={`hover:bg-gray-50/50 transition-colors group border-l-4 ${getRowColor(index + groupIndex)}`}>
                          <td className="p-6">
                            <div className="flex flex-col">
                              <span className="text-lg font-black text-gray-900 group-hover:text-green-600 transition-colors">
                                {item.stock.symbol.split('.')[0]}
                              </span>
                              <span className="text-xs font-bold text-gray-500 uppercase mt-1">
                                {item.stock.name}
                              </span>
                            </div>
                          </td>
                          <td className="p-6">
                            <span className="text-lg font-black text-gray-900">
                              {item.stock.currency === 'USD' ? '$' : '₹'}{parseFloat(item.stock.current_price).toLocaleString()}
                            </span>
                          </td>
                          <td className="p-6">
                            <span className="text-sm font-black text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
                              {item.stock.pe_ratio ? parseFloat(item.stock.pe_ratio).toFixed(2) : 'N/A'}
                            </span>
                          </td>
                          <td className="p-6">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                              {item.stock.sector}
                            </span>
                          </td>
                          <td className="p-6 text-right">
                            <div className="flex items-center justify-end gap-4">
                              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                                <input 
                                  type="number" 
                                  min="1"
                                  value={quantities[item.stock.id] || 1}
                                  onChange={(e) => handleQuantityChange(item.stock.id, e.target.value)}
                                  className="w-16 bg-transparent text-center text-sm font-black focus:outline-none"
                                />
                                <button 
                                  onClick={() => handleBuy(item.stock.id)}
                                  className="bg-green-600 text-white font-black px-4 py-2 rounded-lg text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-md active:scale-95"
                                >
                                  Buy
                                </button>
                              </div>
                              <button 
                                onClick={() => handleRemove(item.stock.id)}
                                className="text-gray-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-xl"
                                title="Remove from Collection"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
