import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, TrendingUp, Calendar, Layers, DollarSign, IndianRupee } from 'lucide-react';

const MyPurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get(`http://localhost:8000/api/stocks/purchases/?user_id=${userData.id}`);
      setPurchases(response.data);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin text-blue-600">
          <Layers size={48} />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">My Purchases</h1>
          <p className="text-gray-500 mt-2 font-medium">Track your investment history and stock acquisitions.</p>
        </div>
        <div className="bg-white px-8 py-4 rounded-3xl shadow-xl border border-gray-100 flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
            <ShoppingBag size={24} />
          </div>
          <div>
            <span className="text-gray-400 text-xs font-black uppercase tracking-widest">Total Orders</span>
            <div className="text-2xl font-black text-gray-900">{purchases.length}</div>
          </div>
        </div>
      </header>

      {purchases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchases.map((purchase) => (
            <div key={purchase.id} className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg uppercase tracking-widest w-fit mb-2">
                      {purchase.stock.symbol}
                    </span>
                    <h3 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                      {purchase.stock.name}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest block mb-1">Quantity</span>
                    <span className="text-xl font-black text-gray-900">{purchase.quantity} Shares</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest block mb-1">Total Paid</span>
                    <span className="text-xl font-black text-gray-900">
                      {purchase.stock.currency === 'USD' ? '$' : '₹'}{parseFloat(purchase.total_amount).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                  <div className="flex items-center">
                    <Calendar size={12} className="mr-1" />
                    <span>{new Date(purchase.purchased_at).toLocaleDateString()}</span>
                  </div>
                  <span className="text-blue-600">Avg Price: {purchase.stock.currency === 'USD' ? '$' : '₹'}{parseFloat(purchase.purchase_price).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="px-8 pb-8">
                <button className="w-full bg-blue-600 text-white p-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-gray-900 transition-all shadow-lg active:scale-95">
                  Order Receipt
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-20 rounded-[3rem] shadow-xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="bg-gray-50 p-8 rounded-full mb-6 text-gray-300">
            <ShoppingBag size={64} />
          </div>
          <h3 className="text-2xl font-black text-gray-300">No Purchases Yet</h3>
          <p className="text-gray-400 max-w-xs mt-2 font-medium">Head to your Collections to start investing in stocks.</p>
        </div>
      )}
    </div>
  );
};

export default MyPurchases;
