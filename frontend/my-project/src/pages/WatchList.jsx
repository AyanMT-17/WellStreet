import React, { useEffect, useRef, useState } from "react";
import { Eye, Loader2, Plus, Trash2, TrendingDown, TrendingUp, Search } from "lucide-react";
import { useAppSession } from "../context/appSession";
import { useNavigate } from "react-router-dom";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

import { getDisplayName } from '../utils/tickerMappings';

export default function WatchlistPage() {
  const { watchlist, dataLoading, updateWatchlist } = useAppSession();
  const navigate = useNavigate();
  const [livePrices, setLivePrices] = useState({});
  const [symbolToAdd, setSymbolToAdd] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const wsRef = useRef(null);

  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (!watchlist?.length) {
      setLivePrices({});
      return undefined;
    }

    const symbols = watchlist.map((item) => item.symbol.toUpperCase());
    const ws = new WebSocket(import.meta.env.VITE_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ action: "subscribe", symbols }));
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.event !== "price-update" || !Array.isArray(payload.ticks)) {
          return;
        }

        setLivePrices((prev) => {
          const next = { ...prev };
          for (const tick of payload.ticks) {
            const symbol = tick.symbol.toUpperCase();
            next[symbol] = tick.price;
          }
          return next;
        });
      } catch (err) {
        console.error("Failed to parse watchlist live price update:", err);
      }
    };

    return () => {
      ws.close();
    };
  }, [watchlist]);

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!symbolToAdd.trim()) return;
    
    setActionLoading(true);
    await updateWatchlist(symbolToAdd.trim().toUpperCase(), 'add');
    setSymbolToAdd("");
    setActionLoading(false);
  };

  const handleDeleteStock = async (symbol) => {
    setActionLoading(true);
    await updateWatchlist(symbol, 'remove');
    setActionLoading(false);
  };

  if (dataLoading.watchlist && !watchlist) {
    return (
      <div className="page-shell flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-stone-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-shell pb-24 md:pb-10">
      <main className="page-container space-y-10">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="hero-kicker">Terminal Watchlist</p>
            <h1 className="hero-title">Tracked Assets</h1>
            <p className="hero-copy mt-2">Monitor real-time US equity pricing and intraday volatility across your primary research targets.</p>
          </div>

          <form onSubmit={handleAddStock} className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <input
              type="text"
              value={symbolToAdd}
              onChange={(e) => setSymbolToAdd(e.target.value)}
              placeholder="Enter Ticker (e.g. NVDA)"
              className="bg-white border border-stone-200 px-4 py-2.5 outline-none focus:border-stone-900 transition-all text-sm font-medium min-w-[240px]"
            />
            <button type="submit" className="primary-button" disabled={actionLoading || !symbolToAdd.trim()}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add Asset
            </button>
          </form>
        </section>

        {watchlist?.length > 0 ? (
          <section className="surface-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Reference Price</th>
                    <th>Current Market</th>
                    <th>Intraday Delta</th>
                    <th className="text-right">Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {watchlist.map((item, index) => {
                    const symbol = item.symbol;
                    const livePrice = livePrices[symbol] || item.openPrice;
                    const change = livePrice - item.openPrice;
                    const changePercent = item.openPrice ? (change / item.openPrice) * 100 : 0;
                    const isPositive = change >= 0;

                    return (
                      <tr key={index} className="group hover:bg-stone-50/50 transition-colors">
                        <td 
                          className="font-bold text-stone-900 cursor-pointer hover:underline"
                          onClick={() => navigate(`/Stockpage?symbol=${symbol}`)}
                        >
                          {getDisplayName(symbol)}
                        </td>
                        <td className="font-medium">{formatCurrency(item.openPrice)}</td>
                        <td className="font-bold text-stone-900">{formatCurrency(livePrice)}</td>
                        <td className={isPositive ? "text-green-600" : "text-red-600"}>
                          <div className="flex items-center gap-2 font-bold">
                            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            <span>
                              {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                            </span>
                          </div>
                        </td>
                        <td className="text-right">
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center border border-stone-200 bg-white text-stone-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 shadow-sm"
                            onClick={() => handleDeleteStock(symbol)}
                            disabled={actionLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className="surface-card flex min-h-[400px] flex-col items-center justify-center p-10 text-center border-dashed">
            <div className="mb-6 flex h-16 w-16 items-center justify-center bg-stone-50 text-stone-300">
              <Eye className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 uppercase tracking-widest">Empty Signal</h3>
            <p className="mt-3 max-w-sm text-sm font-medium text-stone-500 leading-relaxed">
              Your institutional watchlist is currently offline. Add US tickers to begin real-time surveillance.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
