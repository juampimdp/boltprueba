import React, { useState, useCallback, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Input } from './ui/input';
import { RefreshCw, Search } from 'lucide-react';
import { MarketCard } from './MarketCard';
import { ComparisonView } from './ComparisonView';
import { MepCalculator } from './MepCalculator';
import { formatTimeAgo } from '../utils/format';
import type { MarketData, MepData } from '../types';

const REFRESH_COOLDOWN = 20000; // 20 seconds

export function MarketDashboard() {
  const [stocks, setStocks] = useState<MarketData[]>([]);
  const [bonds, setBonds] = useState<MarketData[]>([]);
  const [ons, setOns] = useState<MarketData[]>([]);
  const [mep, setMep] = useState<MepData[]>([]);
  const [favorites, setFavorites] = useState<(MarketData | MepData)[]>([]);
  const [selectedForComparison, setSelectedForComparison] = useState<(MarketData | MepData)[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      
      const [stocksResponse, bondsResponse, onsResponse, mepResponse] = await Promise.all([
        fetch('https://data-912-proxy.ferminrp.workers.dev/live/arg_stocks'),
        fetch('https://data-912-proxy.ferminrp.workers.dev/live/arg_bonds'),
        fetch('https://data-912-proxy.ferminrp.workers.dev/live/arg_ons'),
        fetch('https://data-912-proxy.ferminrp.workers.dev/live/arg_mep')
      ]);

      const [stocksData, bondsData, onsData, mepData] = await Promise.all([
        stocksResponse.json(),
        bondsResponse.json(),
        onsResponse.json(),
        mepResponse.json()
      ]);

      setStocks(Array.isArray(stocksData) ? stocksData : []);
      setBonds(Array.isArray(bondsData) ? bondsData : []);
      setOns(Array.isArray(onsData) ? onsData : []);
      setMep(Array.isArray(mepData) ? mepData : []);
      setLastUpdate(new Date());
      
      // Update favorites and comparison with new data
      const updateItems = (items: (MarketData | MepData)[]) => {
        return items.map(item => {
          if ('ticker' in item) {
            return mepData.find(m => m.ticker === item.ticker) || item;
          } else {
            return [...stocksData, ...bondsData, ...onsData].find(
              i => i.symbol === item.symbol
            ) || item;
          }
        });
      };

      setFavorites(prev => updateItems(prev));
      setSelectedForComparison(prev => updateItems(prev));
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setIsRefreshing(false);
      setCanRefresh(false);
      setTimeout(() => setCanRefresh(true), REFRESH_COOLDOWN);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_COOLDOWN);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleManualRefresh = () => {
    if (canRefresh && !isRefreshing) {
      fetchData();
    }
  };

  const toggleFavorite = (item: MarketData | MepData) => {
    setFavorites(prev => {
      const itemId = 'ticker' in item ? item.ticker : item.symbol;
      const exists = prev.some(fav => 
        'ticker' in fav ? fav.ticker === itemId : fav.symbol === itemId
      );
      return exists ? prev.filter(fav => 
        'ticker' in fav ? fav.ticker !== itemId : fav.symbol !== itemId
      ) : [...prev, item];
    });
  };

  const toggleComparison = (item: MarketData | MepData) => {
    setSelectedForComparison(prev => {
      const itemId = 'ticker' in item ? item.ticker : item.symbol;
      const exists = prev.some(comp => 
        'ticker' in comp ? comp.ticker === itemId : comp.symbol === itemId
      );
      if (exists) {
        return prev.filter(comp => 
          'ticker' in comp ? comp.ticker !== itemId : comp.symbol !== itemId
        );
      }
      if (prev.length < 4) {
        return [...prev, item];
      }
      return prev;
    });
  };

  const filterAndSortData = (data: MarketData[]) => {
    if (!Array.isArray(data)) return [];
    return data
      .filter(item => 
        item.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.symbol.localeCompare(b.symbol));
  };

  const isItemFavorite = (item: MarketData | MepData) => {
    const itemId = 'ticker' in item ? item.ticker : item.symbol;
    return favorites.some(fav => 
      'ticker' in fav ? fav.ticker === itemId : fav.symbol === itemId
    );
  };

  const isItemSelected = (item: MarketData | MepData) => {
    const itemId = 'ticker' in item ? item.ticker : item.symbol;
    return selectedForComparison.some(comp => 
      'ticker' in comp ? comp.ticker === itemId : comp.symbol === itemId
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto p-4">
        <Tabs defaultValue="stocks" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="bg-gray-900 p-1 rounded-lg">
              <TabsTrigger value="stocks" className="px-4 py-2">Merval</TabsTrigger>
              <TabsTrigger value="bonds" className="px-4 py-2">Bonos</TabsTrigger>
              <TabsTrigger value="ons" className="px-4 py-2">ONs</TabsTrigger>
              <TabsTrigger value="mep" className="px-4 py-2">MEP</TabsTrigger>
              <TabsTrigger value="favorites" className="px-4 py-2">Favoritos</TabsTrigger>
              <TabsTrigger value="comparison" className="px-4 py-2">Comparar</TabsTrigger>
              <TabsTrigger value="calculator" className="px-4 py-2">Calcular MEP</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar por símbolo"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400"
                />
              </div>
              <button
                onClick={handleManualRefresh}
                disabled={!canRefresh || isRefreshing}
                className={`p-2 rounded-lg bg-gray-900 hover:bg-gray-800 disabled:opacity-50 ${
                  isRefreshing ? 'animate-pulse' : ''
                }`}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-400">
            Última actualización: {formatTimeAgo(lastUpdate)}
          </div>

          <TabsContent value="stocks">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filterAndSortData(stocks).map(stock => (
                <MarketCard
                  key={stock.symbol}
                  item={stock}
                  isFavorite={isItemFavorite(stock)}
                  isSelected={isItemSelected(stock)}
                  onToggleFavorite={toggleFavorite}
                  onToggleComparison={toggleComparison}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bonds">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filterAndSortData(bonds).map(bond => (
                <MarketCard
                  key={bond.symbol}
                  item={bond}
                  isFavorite={isItemFavorite(bond)}
                  isSelected={isItemSelected(bond)}
                  onToggleFavorite={toggleFavorite}
                  onToggleComparison={toggleComparison}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ons">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filterAndSortData(ons).map(on => (
                <MarketCard
                  key={on.symbol}
                  item={on}
                  isFavorite={isItemFavorite(on)}
                  isSelected={isItemSelected(on)}
                  onToggleFavorite={toggleFavorite}
                  onToggleComparison={toggleComparison}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mep">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {mep.map(mepItem => (
                <MarketCard
                  key={mepItem.ticker}
                  item={mepItem}
                  isFavorite={isItemFavorite(mepItem)}
                  isSelected={isItemSelected(mepItem)}
                  onToggleFavorite={toggleFavorite}
                  onToggleComparison={toggleComparison}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="favorites">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {favorites.map(item => (
                <MarketCard
                  key={'ticker' in item ? item.ticker : item.symbol}
                  item={item}
                  isFavorite={true}
                  isSelected={isItemSelected(item)}
                  onToggleFavorite={toggleFavorite}
                  onToggleComparison={toggleComparison}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="comparison">
            <ComparisonView items={selectedForComparison} />
          </TabsContent>

          <TabsContent value="calculator">
            <MepCalculator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}