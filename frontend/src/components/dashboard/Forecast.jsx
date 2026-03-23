
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LineChart as LucideLineChart, Briefcase, Search } from 'lucide-react';
import axios from 'axios';

const Forecast = () => {
  const [symbol, setSymbol] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);

  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/stocks/');
        const result = await response.json();
        setStocks(result);
      } catch (err) {
        console.error('Failed to fetch stocks:', err);
      }
    };

    const fetchPortfolios = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData && userData.id) {
          const response = await axios.get(`http://localhost:8000/api/stocks/portfolios/?user_id=${userData.id}`);
          setPortfolios(response.data);
        }
      } catch (error) {
        console.error('Error fetching portfolios:', error);
      }
    };

    fetchStocks();
    fetchPortfolios();
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSymbol(value);
    setSelectedStock(null);
    setData(null);
    setSelectedPortfolio(null);
    if (value) {
      const filtered = stocks.filter(stock =>
        stock.name.toLowerCase().includes(value.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handlePortfolioChange = (e) => {
    const portfolioId = e.target.value;
    const portfolio = portfolios.find(p => p.id.toString() === portfolioId);
    setSelectedPortfolio(portfolio);
    setSymbol('');
    setSelectedStock(null);
    setData(null);
    setSuggestions([]);
  };

  const handleSuggestionClick = (stock) => {
    setSymbol(stock.name);
    setSelectedStock(stock);
    setSuggestions([]);
    setSelectedPortfolio(null);
    handleSearch(stock.symbol);
  };

  const handleSearch = async (searchSymbol) => {
    if (!searchSymbol) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(`http://localhost:8000/api/stocks/${searchSymbol}/history/`);
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

      <div className="flex justify-between gap-8 mb-8">
        {/* Left Column */}
        <div className="w-1/2">
          <div className="relative mb-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Stock Search</h2>
            <input
              type="text"
              value={symbol}
              onChange={handleInputChange}
              placeholder="Enter stock name or symbol..."
              className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1">
                {suggestions.map(stock => (
                  <li
                    key={stock.id}
                    onClick={() => handleSuggestionClick(stock)}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                  >
                    {stock.name} ({stock.symbol})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="w-1/2">
          <div className="relative mb-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Portfolios</h2>
            <select
              value={selectedPortfolio ? selectedPortfolio.id : ''}
              onChange={handlePortfolioChange}
              className="border border-gray-300 rounded-md px-4 py-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="" disabled>Select a portfolio</option>
              {portfolios.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Unified Display Area */}
      <div className="mb-8">
        {selectedPortfolio && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{selectedPortfolio.name}</h3>
            <ul>
              {selectedPortfolio.items.map(item => (
                <li key={item.stock.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-semibold">{item.stock.name} ({item.stock.symbol})</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: item.stock.currency || 'USD' }).format(item.stock.current_price)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
        {selectedStock && !selectedPortfolio && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xl font-semibold text-gray-800">{selectedStock.name} ({selectedStock.symbol})</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: selectedStock.currency || 'USD' }).format(selectedStock.current_price)}
            </p>
          </div>
        )}
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
              Enter a stock name or symbol to see its historical price data and our AI-driven forecast.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Forecast;
