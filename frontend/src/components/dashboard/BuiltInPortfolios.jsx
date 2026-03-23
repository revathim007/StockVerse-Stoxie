import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layers, Search, RefreshCw, Briefcase } from 'lucide-react';

const BuiltInPortfolios = () => {
  const [allStocks, setAllStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [portfolioSearch, setPortfolioSearch] = useState('');
  const [addingToCollection, setAddingToCollection] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/stocks/');
      setAllStocks(response.data);
    } catch (error) {
      console.error('Error fetching stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getBuiltInPortfolios = () => {
    const sectors = {};
    allStocks.forEach(stock => {
      const sector = stock.sector || 'Others';
      if (!sectors[sector]) {
        sectors[sector] = [];
      }
      sectors[sector].push({ stock, quantity: 1 });
    });

    return Object.entries(sectors).map(([sector, items], index) => ({
      id: `builtin-${index}`,
      portfolio_id: `BI-${index}`,
      name: `${sector} Portfolio`,
      description: `Automatically generated portfolio for the ${sector} sector.`,
      items,
      isBuiltIn: true,
      created_at: new Date().toISOString()
    }));
  };

  const handleBulkAddToCollection = async (portfolio) => {
    setAddingToCollection(prev => ({ ...prev, [portfolio.id]: true }));
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const promises = portfolio.items.map(item => 
        axios.post('http://localhost:8000/api/stocks/collections/', {
          user_id: userData.id,
          stock_id: item.stock.id,
          portfolio_name: portfolio.name
        })
      );
      
      await Promise.all(promises);
      alert(`All stocks from "${portfolio.name}" added to your collection!`);
    } catch (error) {
      console.error('Error adding stocks to collection:', error);
      alert('Some stocks might already be in your collection or failed to add.');
    } finally {
      setAddingToCollection(prev => ({ ...prev, [portfolio.id]: false }));
    }
  };

  const getPortfolioColor = (index) => {
    const colors = [
      { border: 'border-blue-100', bg: 'bg-blue-50', text: 'text-blue-600' },
      { border: 'border-purple-100', bg: 'bg-purple-50', text: 'text-purple-600' },
      { border: 'border-orange-100', bg: 'bg-orange-50', text: 'text-orange-600' },
      { border: 'border-pink-100', bg: 'bg-pink-50', text: 'text-pink-600' },
      { border: 'border-indigo-100', bg: 'bg-indigo-50', text: 'text-indigo-600' },
      { border: 'border-green-100', bg: 'bg-green-50', text: 'text-green-600' },
    ];
    return colors[index % colors.length];
  };

  const builtInPortfolios = getBuiltInPortfolios().filter(p => 
    p.name.toLowerCase().includes(portfolioSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin text-green-600">
          <RefreshCw size={48} />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">System Portfolios</h1>
          <p className="text-gray-500 mt-2 font-medium">Explore pre-built portfolios based on stock categories.</p>
        </div>
        <div className="relative">
          <input
            type="text"
            value={portfolioSearch}
            onChange={(e) => setPortfolioSearch(e.target.value)}
            placeholder="Search system portfolios..."
            className="border border-gray-300 rounded-md px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={18} />
          </div>
        </div>
      </header>

      {builtInPortfolios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {builtInPortfolios.map((portfolio, index) => {
            const cardColor = getPortfolioColor(index + 3);
            return (
              <div key={portfolio.id} className={`bg-white rounded-[2rem] shadow-xl border ${cardColor.border} overflow-hidden group hover:shadow-2xl transition-all duration-300 flex flex-col`}>
                <div className="p-8 flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <span className={`px-3 py-1 ${cardColor.bg} ${cardColor.text} text-[10px] font-black rounded-lg uppercase tracking-widest`}>
                      BUILT-IN
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                    {portfolio.name}
                  </h3>
                  
                  <p className="text-gray-500 text-xs font-medium mb-4 line-clamp-2">
                    {portfolio.description}
                  </p>

                  <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {portfolio.items.map((item) => (
                          <div key={item.stock.id} className="flex items-center space-x-1 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                            <span className="text-[10px] font-black text-gray-900 uppercase">
                              {item.stock.symbol.split('.')[0]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="px-8 pb-8">
                  <button 
                    onClick={() => handleBulkAddToCollection(portfolio)}
                    disabled={addingToCollection[portfolio.id]}
                    className="w-full bg-gray-900 text-white hover:bg-green-600 p-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center"
                  >
                    {addingToCollection[portfolio.id] ? (
                      <span className="flex items-center">
                        <RefreshCw size={14} className="animate-spin mr-2" />
                        Adding...
                      </span>
                    ) : (
                      'Add Entire Sector to Collection'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-20 rounded-[3rem] shadow-xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="bg-gray-50 p-8 rounded-full mb-6">
            <Briefcase size={64} className="text-gray-200" />
          </div>
          <h3 className="text-2xl font-black text-gray-300">No System Portfolios Found</h3>
          <p className="text-gray-400 max-w-xs mt-2 font-medium">Wait for the stock data to be categorized or try searching for a different term.</p>
        </div>
      )}
    </div>
  );
};

export default BuiltInPortfolios;
