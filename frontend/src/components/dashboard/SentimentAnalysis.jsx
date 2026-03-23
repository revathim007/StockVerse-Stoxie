
import React, { useState, useEffect } from 'react';
import { BarChart3, Briefcase, Search } from 'lucide-react';
import axios from 'axios';

const SentimentAnalysis = () => {
  const [symbol, setSymbol] = useState('');
  const [sentimentData, setSentimentData] = useState(null);
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
    setSentimentData(null);
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
    setSentimentData(null);
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
    setSentimentData(null);

    try {
      const response = await fetch(`http://localhost:8000/api/stocks/sentiment/${searchSymbol}/`);
      if (!response.ok) {
        throw new Error('Could not fetch sentiment data.');
      }
      const result = await response.json();
      setSentimentData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment === 'Positive') return 'text-green-600';
    if (sentiment === 'Negative') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900">Sentiment Analysis</h1>
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
        {selectedStock && !selectedPortfolio && sentimentData && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xl font-semibold text-gray-800">{selectedStock.name} ({selectedStock.symbol})</p>
            <p className={`text-3xl font-bold mt-2 ${getSentimentColor(sentimentData.sentiment)}`}>
              {sentimentData.sentiment}
            </p>
          </div>
        )}
      </div>

      <div className="bg-white p-10 rounded-3xl border border-gray-200 shadow-xl min-h-[400px]">
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {sentimentData && sentimentData.articles && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Recent News</h3>
            <ul>
              {sentimentData.articles.map((article, index) => (
                <li key={index} className="mb-4 pb-4 border-b last:border-b-0">
                  <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-purple-600 hover:underline">
                    {article.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {!sentimentData && !loading && !error && (
          <div className="flex flex-col items-center justify-center text-center h-full">
            <div className="bg-orange-50 p-6 rounded-full mb-6 text-orange-600">
              <BarChart3 size={48} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sentiment Analysis</h2>
            <p className="text-gray-500 max-w-md">
              Enter a stock name or symbol to see the latest news and sentiment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SentimentAnalysis;
