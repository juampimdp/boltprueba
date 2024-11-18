import React from 'react';
import { Card, CardContent } from './ui/card';
import { Heart, BarChart2 } from 'lucide-react';
import type { MarketData, MepData } from '../types';
import { formatNumber, formatPercentage } from '../utils/format';

type MarketCardProps = {
  item: MarketData | MepData;
  isFavorite: boolean;
  isSelected: boolean;
  onToggleFavorite: (item: MarketData | MepData) => void;
  onToggleComparison: (item: MarketData | MepData) => void;
};

export function MarketCard({ 
  item, 
  isFavorite, 
  isSelected,
  onToggleFavorite, 
  onToggleComparison 
}: MarketCardProps) {
  const isMep = 'ticker' in item;

  return (
    <Card className="bg-gray-900 text-white hover:bg-gray-800 transition-colors">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold">
              {isMep ? item.ticker : item.symbol}
            </h3>
            <div className={`text-sm mt-1 ${
              (item.pct_change || 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {!isMep && item.pct_change ? formatPercentage(item.pct_change) : ''}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onToggleComparison(item)}
              className={`p-1 rounded-full ${
                isSelected ? 'text-blue-500' : 'text-gray-400'
              } hover:bg-gray-700`}
              title={isSelected ? 'Quitar de comparación' : 'Agregar a comparación'}
            >
              <BarChart2 className={`h-5 w-5 ${isSelected ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => onToggleFavorite(item)}
              className={`p-1 rounded-full ${
                isFavorite ? 'text-red-500' : 'text-gray-400'
              } hover:bg-gray-700`}
              title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-gray-400 text-sm">Compra</div>
            <div className="text-lg font-semibold">
              {isMep ? formatNumber(item.bid) : formatNumber(item.px_bid || 0)}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Venta</div>
            <div className="text-lg font-semibold">
              {isMep ? formatNumber(item.ask) : formatNumber(item.px_ask || 0)}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">
              {isMep ? 'Volumen ARS' : 'Cantidad Compra'}
            </div>
            <div className="text-lg font-semibold">
              {isMep ? formatNumber(item.v_ars) : formatNumber(item.q_bid || 0)}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">
              {isMep ? 'Volumen USD' : 'Cantidad Venta'}
            </div>
            <div className="text-lg font-semibold">
              {isMep ? formatNumber(item.v_usd) : formatNumber(item.q_ask || 0)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}