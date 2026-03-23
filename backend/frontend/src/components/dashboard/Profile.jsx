import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Mail, Shield, Settings, CreditCard, Bell, Bookmark, ShoppingBag, History } from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    setUser(savedUser);
  }, []);

  if (!user) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900">User Profile</h1>
      </header>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Profile Header Background */}
        <div className="h-32 bg-gradient-to-r from-green-500 to-green-700"></div>
        
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="p-1 bg-white rounded-full shadow-lg">
              <div className="bg-green-100 p-6 rounded-full text-green-600">
                <UserIcon size={64} />
              </div>
            </div>
            <button 
              onClick={() => navigate('/customer-welcome/settings')}
              className="bg-gray-100 p-3 rounded-xl hover:bg-gray-200 transition-colors text-gray-600 shadow-sm"
            >
              <Settings size={24} />
            </button>
          </div>

          <div className="max-w-2xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                  <div className="flex items-center mt-1 space-x-3 text-gray-800">
                    <UserIcon size={20} className="text-green-600" />
                    <span className="text-xl font-bold">{user.full_name}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                  <div className="flex items-center mt-1 space-x-3 text-gray-800">
                    <Mail size={20} className="text-green-600" />
                    <span className="text-xl font-bold">{user.email}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account ID</label>
                  <div className="flex items-center mt-1 space-x-3 text-gray-800">
                    <Shield size={20} className="text-green-600" />
                    <span className="text-xl font-mono font-bold">{user.custom_id}</span>
                  </div>
                </div>
              </div>

              {/* My Activity Section */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 mb-4">My Activity</h3>
                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => navigate('/customer-welcome/collections')}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-green-50 transition-all group"
                  >
                    <div className="bg-white p-2 rounded-lg shadow-sm text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">
                      <Bookmark size={18} />
                    </div>
                    <span className="font-semibold text-sm text-gray-700">My Collections</span>
                  </button>
                  <button 
                    onClick={() => navigate('/customer-welcome/purchases')}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-green-50 transition-all group"
                  >
                    <div className="bg-white p-2 rounded-lg shadow-sm text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">
                      <ShoppingBag size={18} />
                    </div>
                    <span className="font-semibold text-sm text-gray-700">My Purchases</span>
                  </button>
                  <button 
                    onClick={() => navigate('/customer-welcome/orders')}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-green-50 transition-all group"
                  >
                    <div className="bg-white p-2 rounded-lg shadow-sm text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">
                      <History size={18} />
                    </div>
                    <span className="font-semibold text-sm text-gray-700">Order History</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
