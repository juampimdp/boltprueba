import { useMemo } from 'react';
import { Card, CardContent } from '../components/ui/card';
import type { MarketData, MepData } from '../types';

type ComparisonViewProps = {
  items: (MarketData | MepData)[];
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('es-AR').format(num);
};

const formatPercentage = (num: number) => {
  return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
};

export function ComparisonView({ items }: ComparisonViewProps) {
  const metrics = useMemo(() => {
    return items.map(item => {
      if ('ticker' in item) {
        return {
          name: item.ticker,
          metrics: [
            { label: 'MEP Implícito', value: formatNumber(item.bid) },
            { label: 'MEP Explícito', value: formatNumber(item.ask) },
            { label: 'ARS Compra', value: formatNumber(item.ars_bid) },
            { label: 'ARS Venta', value: formatNumber(item.ars_ask) },
            { label: 'USD Compra', value: formatNumber(item.usd_bid) },
            { label: 'USD Venta', value: formatNumber(item.usd_ask) },
          ],
        };
      } else {
        return {
          name: item.symbol,
          metrics: [
            { label: 'Compra', value: formatNumber(item.px_bid || 0) },
            { label: 'Venta', value: formatNumber(item.px_ask || 0) },
            { label: 'Último', value: formatNumber(item.c || 0) },
            { label: 'Variación', value: item.pct_change ? formatPercentage(item.pct_change) : 'N/A' },
            { label: 'Volumen', value: item.v ? formatNumber(item.v) : 'N/A' },
          ],
        };
      }
    });
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Selecciona hasta 4 instrumentos para comparar usando el botón de comparación en cada tarjeta.
        </p>
      </div>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-2 border-b border-gray-200 dark:border-gray-700">Métrica</th>
                {metrics.map(({ name }) => (
                  <th key={name} className="text-left p-2 border-b border-gray-200 dark:border-gray-700">
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics[0].metrics.map((_, index) => (
                <tr key={index}>
                  <td className="p-2 border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                    {metrics[0].metrics[index].label}
                  </td>
                  {metrics.map(({ name, metrics: itemMetrics }) => (
                    <td key={name} className="p-2 border-b border-gray-200 dark:border-gray-700">
                      {itemMetrics[index].value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}