
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LineChart as LucideLineChart } from 'lucide-react';

const Forecast = () => {
  const [symbol, setSymbol] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!symbol) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(`http://localhost:8000/api/stocks/${symbol}/history/`);
      if (!response.ok) {
        throw new Error('Stock not found');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900">Forecast</h1>
      </header>

      <div className="flex items-center mb-8">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Enter stock symbol (e.g., AAPL)"
          className="border border-gray-300 rounded-l-md px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
        <button
          onClick={handleSearch}
          className="bg-purple-600 text-white px-6 py-2 rounded-r-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
        >
          Search
        </button>
      </div>

      <div className="bg-white p-10 rounded-3xl border border-gray-200 shadow-xl min-h-[400px]">
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {data && (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="close" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        )}
        {!data && !loading && !error && (
          <div className="flex flex-col items-center justify-center text-center h-full">
            <div className="bg-purple-50 p-6 rounded-full mb-6 text-purple-600">
              <LucideLineChart size={48} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Stock Price Forecast</h2>
            <p className="text-gray-500 max-w-md">
              Enter a stock symbol to see its historical price data and our AI-driven forecast.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Forecast;
