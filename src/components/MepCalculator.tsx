import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';

type Bond = {
  symbol: string;
  px_bid?: number;
  px_ask?: number;
};

export function MepCalculator() {
  const [amount, setAmount] = useState<string>('');
  const [al30Data, setAl30Data] = useState<Bond | null>(null);
  const [al30dData, setAl30dData] = useState<Bond | null>(null);

  useEffect(() => {
    const fetchBondData = async () => {
      try {
        const response = await fetch('https://data-912-proxy.ferminrp.workers.dev/live/arg_bonds');
        const data = await response.json();
        
        const al30 = data.find((bond: Bond) => bond.symbol === 'AL30');
        const al30d = data.find((bond: Bond) => bond.symbol === 'AL30D');
        
        setAl30Data(al30);
        setAl30dData(al30d);
      } catch (error) {
        console.error('Error fetching bond data:', error);
      }
    };

    fetchBondData();
    const interval = setInterval(fetchBondData, 20000);
    return () => clearInterval(interval);
  }, []);

  const calculateNominals = (amount: number, price: number) => {
    return (amount / (price / 100)).toFixed(2);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-white dark:bg-gray-900">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Calculadora MEP - AL30</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Monto a invertir (ARS)
              </label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ingrese el monto en pesos"
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>
            {al30Data && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Precio AL30 (ARS)
                  </label>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(al30Data.px_ask || 0)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nominales a recibir
                  </label>
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {amount && al30Data.px_ask 
                      ? calculateNominals(Number(amount), al30Data.px_ask)
                      : '-'}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Calculadora MEP - AL30D</h3>
          <div className="space-y-4">
            {al30dData && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Precio AL30D (USD)
                  </label>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(al30dData.px_bid || 0)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    USD MEP a recibir
                  </label>
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {amount && al30Data?.px_ask && al30dData.px_bid
                      ? (Number(calculateNominals(Number(amount), al30Data.px_ask)) * al30dData.px_bid / 100).toFixed(2)
                      : '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de cambio MEP resultante
                  </label>
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {amount && al30Data?.px_ask && al30dData.px_bid
                      ? formatCurrency(Number(amount) / (Number(calculateNominals(Number(amount), al30Data.px_ask)) * al30dData.px_bid / 100))
                      : '-'}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}