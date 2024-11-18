export type MarketData = {
  symbol: string;
  px_bid?: number;
  px_ask?: number;
  c?: number;
  pct_change?: number;
  q_bid?: number;
  q_ask?: number;
  q_op?: number;
  v?: number;
  type: 'stock' | 'bond' | 'on' | 'mep';
};

export type MepData = {
  ticker: string;
  bid: number;
  ask: number;
  close: number;
  tmark: number;
  v_ars: number;
  v_usd: number;
  q_ars: number;
  q_usd: number;
  ars_bid: number;
  ars_ask: number;
  usd_bid: number;
  usd_ask: number;
  panel: string;
  type: 'mep';
};