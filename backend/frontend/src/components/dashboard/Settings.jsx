import React, { useState } from 'react';
import axios from 'axios';
import { Settings as SettingsIcon, Key, User, Mail, Phone, Check } from 'lucide-react';

const Settings = () => {
  const [editingField, setEditingField] = useState(null);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    setLoading(true);
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        alert('User session not found. Please login again.');
        return;
      }
      const user = JSON.parse(userData);
      const response = await axios.post('http://localhost:8000/api/accounts/update-username/', {
        new_username: newUsername,
        user_id: user.id
      });

      // Update local storage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      alert('Username updated successfully!');
      setEditingField(null);
      setNewUsername('');
      
      // Refresh the page to reflect changes in header
      window.location.reload();
    } catch (error) {
      console.error('Update username error:', error.response?.data || error.message);
      alert(error.response?.data?.error || 'Failed to update username');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setLoading(true);
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        alert('User session not found. Please login again.');
        return;
      }
      const user = JSON.parse(userData);
      const response = await axios.post('http://localhost:8000/api/accounts/update-email/', {
        new_email: newEmail,
        user_id: user.id
      });

      // Update local storage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      alert('Email updated successfully!');
      setEditingField(null);
      setNewEmail('');
      
      // Refresh the page to reflect changes in header
      window.location.reload();
    } catch (error) {
      console.error('Update email error:', error.response?.data || error.message);
      alert(error.response?.data?.error || 'Failed to update email');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePhone = async (e) => {
    e.preventDefault();
    if (!newPhone.trim()) return;

    // Validation: only numbers and exactly 10 digits
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(newPhone)) {
      alert('Phone number must be exactly 10 digits and contain only numbers');
      return;
    }

    setLoading(true);
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        alert('User session not found. Please login again.');
        return;
      }
      const user = JSON.parse(userData);
      const response = await axios.post('http://localhost:8000/api/accounts/update-phone/', {
        new_phone: newPhone,
        user_id: user.id
      });

      // Update local storage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      alert('Phone number updated successfully!');
      setEditingField(null);
      setNewPhone('');
      
      // Refresh the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Update phone error:', error.response?.data || error.message);
      alert(error.response?.data?.error || 'Failed to update phone number');
    } finally {
      setLoading(false);
    }
  };

  const settingOptions = [
    { id: 'password', name: 'Reset Password', icon: <Key size={20} />, color: 'text-red-500', bgColor: 'bg-red-50' },
    { id: 'username', name: 'Edit Username', icon: <User size={20} />, color: 'text-blue-500', bgColor: 'bg-blue-50' },
    { id: 'email', name: 'Edit Email ID', icon: <Mail size={20} />, color: 'text-green-500', bgColor: 'bg-green-50' },
    { id: 'phone', name: 'Edit Phone Number', icon: <Phone size={20} />, color: 'text-purple-500', bgColor: 'bg-purple-50' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900">Settings</h1>
      </header>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden p-8">
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center border-b border-gray-100 pb-4">
            <SettingsIcon className="text-green-600 mr-2" size={24} />
            Account Customization
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settingOptions.map((option) => (
              <button 
                key={option.name}
                onClick={() => setEditingField(option.id === editingField ? null : option.id)}
                className={`flex items-center justify-between p-5 rounded-2xl border transition-all group ${
                  editingField === option.id 
                    ? 'bg-white border-green-500 shadow-md ring-2 ring-green-100' 
                    : 'bg-gray-50 border-gray-100 hover:bg-white hover:shadow-md'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`${option.bgColor} ${option.color} p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform`}>
                    {option.icon}
                  </div>
                  <span className="font-bold text-gray-800">{option.name}</span>
                </div>
                <div className={`${editingField === option.id ? 'text-green-600' : 'text-gray-400 group-hover:text-green-600'} transition-colors`}>
                  <SettingsIcon size={16} />
                </div>
              </button>
            ))}
          </div>

          {/* Dynamic Edit Form */}
          {editingField === 'username' && (
            <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100 animate-in zoom-in-95 duration-300">
              <h4 className="font-bold text-blue-900 mb-4 flex items-center">
                <User size={18} className="mr-2" />
                Change Your Username
              </h4>
              <form onSubmit={handleUpdateUsername} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter new username"
                  className="flex-1 px-4 py-3 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? 'Updating...' : (
                    <>
                      <Check size={18} className="mr-2" />
                      Done
                    </>
                  )}
                </button>
              </form>
              <p className="mt-3 text-xs text-blue-600 font-medium italic">
                Note: You will need to use this new username for your next login.
              </p>
            </div>
          )}

          {editingField === 'email' && (
            <div className="mt-8 p-6 bg-green-50 rounded-2xl border border-green-100 animate-in zoom-in-95 duration-300">
              <h4 className="font-bold text-green-900 mb-4 flex items-center">
                <Mail size={18} className="mr-2" />
                Change Your Email ID
              </h4>
              <form onSubmit={handleUpdateEmail} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email address"
                  className="flex-1 px-4 py-3 rounded-xl border border-green-200 focus:ring-2 focus:ring-green-500 outline-none transition-all font-medium"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-green-200 transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? 'Updating...' : (
                    <>
                      <Check size={18} className="mr-2" />
                      Done
                    </>
                  )}
                </button>
              </form>
              <p className="mt-3 text-xs text-green-600 font-medium italic">
                Note: This email will be used for all future communications.
              </p>
            </div>
           )}

          {editingField === 'phone' && (
            <div className="mt-8 p-6 bg-purple-50 rounded-2xl border border-purple-100 animate-in zoom-in-95 duration-300">
              <h4 className="font-bold text-purple-900 mb-4 flex items-center">
                <Phone size={18} className="mr-2" />
                Change Your Phone Number
              </h4>
              <form onSubmit={handleUpdatePhone} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Enter new phone number"
                  className="flex-1 px-4 py-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? 'Updating...' : (
                    <>
                      <Check size={18} className="mr-2" />
                      Done
                    </>
                  )}
                </button>
              </form>
              <p className="mt-3 text-xs text-purple-600 font-medium italic">
                Note: This will be your primary contact number.
              </p>
            </div>
          )}
 
           {editingField && editingField !== 'username' && editingField !== 'email' && editingField !== 'phone' && (
            <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
              <p className="text-gray-500 font-medium">The {editingField} update feature is coming soon!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
