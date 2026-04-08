// admin/src/pages/Markets.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  TrendingUp,
  TrendingDown,
  Edit,
  Save,
  X,
  ChevronUp,
  ChevronDown,
  Search,
  RefreshCw,
  Plus,
  Trash2,
  Percent,
  Package,
  DollarSign,
  AlertCircle,
} from "lucide-react";

const COLORS = {
  bg: "#000000",
  card: "#1A1A1A",
  border: "rgba(255,255,255,0.1)",
  text: "#FFFFFF",
  gold: "#FFD700",
  blue: "#3B82F6",
  green: "#10B981",
  red: "#EF4444",
  purple: "#8B5CF6",
  orange: "#F59E0B",
  pink: "#EC4899",
  teal: "#14B8A6",
  yellow: "#FBBF24",
};

const API = `${import.meta.env.VITE_API_URL}/api/admin/market`;
const TRADES_API = `${import.meta.env.VITE_API_URL}/api/trades/all`;

// Format numbers with K, M, B suffixes
const formatNumber = (num) => {
  if (num === undefined || num === null) return "0";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toFixed(2);
};

// Format price with appropriate decimals
const formatPrice = (price) => {
  const num = parseFloat(price);
  if (isNaN(num)) return "0";
  if (num < 0.01) return num.toFixed(6);
  if (num < 1) return num.toFixed(4);
  if (num < 100) return num.toFixed(2);
  return num.toFixed(2);
};

const handleResetAllRates = async () => {
  if (!window.confirm("Reset all custom rates to 0?")) return;

  await fetch(`${API}/custom-rates/reset-all`, {
    method: "POST",
  });

  loadCustomRates(); // reload UI
};

// Cache for exchange info
let exchangeInfoCache = null;
let exchangeInfoPromise = null;

const fetchExchangeInfo = async () => {
  if (exchangeInfoCache) return exchangeInfoCache;
  if (exchangeInfoPromise) return exchangeInfoPromise;

  exchangeInfoPromise = fetch("https://api.binance.com/api/v3/exchangeInfo")
    .then(res => res.json())
    .then(data => {
      exchangeInfoCache = data;
      return data;
    })
    .catch(err => {
      console.error("Failed to fetch exchange info:", err);
      exchangeInfoPromise = null;
      throw err;
    });

  return exchangeInfoPromise;
};

// Fetch all USDT pairs
const fetchAllUSDTickers = async () => {
  try {
    // First, get exchange info to filter USDT pairs
    const exchangeInfo = await fetchExchangeInfo();
    const usdtSymbols = exchangeInfo.symbols
      .filter(s => s.quoteAsset === "USDT" && s.status === "TRADING")
      .map(s => s.symbol);
    
    console.log(`Found ${usdtSymbols.length} USDT trading pairs`);
    
    // Fetch tickers in batches (max 100 symbols per request)
    const batchSize = 100;
    const allTickers = [];
    
    for (let i = 0; i < usdtSymbols.length; i += batchSize) {
      const batch = usdtSymbols.slice(i, i + batchSize);
      const symbolsParam = JSON.stringify(batch);
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbolsParam)}`
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          allTickers.push(...data);
        }
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (err) {
        console.error(`Failed to fetch batch ${i}:`, err);
      }
    }
    
    return allTickers;
  } catch (err) {
    console.error("Failed to fetch all USDT tickers:", err);
    throw err;
  }
};

export default function Markets() {
  const [marketCoins, setMarketCoins] = useState([]);
  const [allCoins, setAllCoins] = useState([]);
  const [adminCoins, setAdminCoins] = useState([]);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(true);
  const [tradesLoading, setTradesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [customRates, setCustomRates] = useState({});
  const [editingCustom, setEditingCustom] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editingAdminCoin, setEditingAdminCoin] = useState(null);
  const [adminEditValue, setAdminEditValue] = useState({
    rate: "",
    quantity: "",
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdminCoin, setNewAdminCoin] = useState({
    name: "",
    symbol: "",
    rate: "",
    quantity: "",
    total_value: "",
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState(null);
  const [totalCoins, setTotalCoins] = useState(0);
  const [searchType, setSearchType] = useState("all"); // 'all', 'admin', or 'manual'
  
  const loadCustomRatesRef = useRef();

  // Load custom rates function
  const loadCustomRates = useCallback(async () => {
    try {
      const rateRes = await fetch(`${API}/custom-rates`);
      const savedRates = await rateRes.json();

      const rateMap = {};
      savedRates.forEach((r) => (rateMap[r.symbol] = Number(r.rate)));

      setCustomRates(rateMap);
    } catch (e) {
      console.error("Failed loading custom rates");
    }
  }, []);

  // Fetch all market data from Binance
  const fetchMarketData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const tickers = await fetchAllUSDTickers();
      
      const formatted = tickers.map((coin) => ({
        id: coin.symbol,
        symbol: coin.symbol.replace("USDT", ""),
        name: coin.symbol.replace("USDT", ""),
        // Raw Binance Data
        lastPrice: coin.lastPrice,
        priceChange: coin.priceChange,
        priceChangePercent: coin.priceChangePercent,
        highPrice: coin.highPrice,
        lowPrice: coin.lowPrice,
        openPrice: coin.openPrice,
        volumeRaw: coin.volume,
        quoteVolume: coin.quoteVolume,
        // UI Formatted Values
        price: formatPrice(coin.lastPrice),
        change: `${Number(coin.priceChangePercent) >= 0 ? "+" : ""}${Number(coin.priceChangePercent).toFixed(2)}%`,
        volume: formatNumber(Number(coin.quoteVolume)),
        isPositive: Number(coin.priceChangePercent) >= 0,
        color: Number(coin.priceChangePercent) >= 0 ? COLORS.green : COLORS.red,
      }));
      
      // Sort by volume (highest first) for better visibility
      const sorted = formatted.sort((a, b) => 
        parseFloat(b.quoteVolume || 0) - parseFloat(a.quoteVolume || 0)
      );
      
      setAllCoins(sorted);
      setMarketCoins(sorted); // Show ALL coins, no limit
      setTotalCoins(sorted.length);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch market data:", err);
      setError("Failed to fetch market data. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch trades data
  const fetchTrades = useCallback(async () => {
    try {
      setTradesLoading(true);
      const response = await fetch(TRADES_API);
      const data = await response.json();
      setTrades(data);
    } catch (err) {
      console.error("Failed to fetch trades:", err);
    } finally {
      setTradesLoading(false);
    }
  }, []);

  // Save custom rate
  const saveCustomRate = useCallback(async (symbol, value) => {
    setCustomRates((prev) => ({ ...prev, [symbol]: value }));

    await fetch(`${API}/custom-rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, rate: value }),
    });
  }, []);

  // Fetch admin coins
  const fetchAdminCoins = useCallback(async () => {
    setAdminLoading(true);
    const res = await fetch(`${API}/admin-coins`);
    const data = await res.json();
    setAdminCoins(data);
    setAdminLoading(false);
  }, []);

  // Initial load
  useEffect(() => {
    loadCustomRatesRef.current = loadCustomRates;
    loadCustomRatesRef.current();
    fetchMarketData();
    fetchAdminCoins();
    fetchTrades();

    const interval = setInterval(() => {
      fetchMarketData();
    }, 30000); // Update every 30 seconds

    const tradesInterval = setInterval(() => {
      fetchTrades();
    }, 10000); // Update trades every 10 seconds

    return () => {
      clearInterval(interval);
      clearInterval(tradesInterval);
    };
  }, [fetchMarketData, fetchAdminCoins, fetchTrades]);

  const handleCustomEditStart = (symbol, currentRate) => {
    setEditingCustom(symbol);
    setEditValue((currentRate || 0).toString());
  };

  const handleCustomEditSave = (symbol) => {
    const value = parseFloat(editValue);
    if (!isNaN(value)) {
      saveCustomRate(symbol, Number(value.toFixed(1)));
    }
    setEditingCustom(null);
  };

  // Admin coin management
  const handleAdminEditStart = (coin) => {
    setEditingAdminCoin(coin.id);
    setAdminEditValue({
      rate: coin.rate.toString(),
      quantity: coin.quantity.toString(),
      total_value: coin.total_value.toString(),
    });
  };

  const handleAdminEditSave = async (coinId) => {
    await fetch(`${API}/admin-coins/${coinId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adminEditValue),
    });

    setEditingAdminCoin(null);
    fetchAdminCoins();
  };

  const handleAddAdminCoin = async () => {
    await fetch(`${API}/admin-coins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newAdminCoin,
        symbol: newAdminCoin.symbol.toUpperCase(),
      }),
    });

    setShowAddModal(false);
    setNewAdminCoin({
      name: "",
      symbol: "",
      rate: "",
      quantity: "",
      total_value: "",
    });
    fetchAdminCoins();
  };

  const handleDeleteAdminCoin = async (coinId) => {
    if (!window.confirm("Delete coin?")) return;

    await fetch(`${API}/admin-coins/${coinId}`, {
      method: "DELETE",
    });

    fetchAdminCoins();
  };

  const handleCustomIncrement = (symbol) => {
    const current = Number(customRates[symbol] ?? 0);
    const newValue = Number((current + 0.5).toFixed(1));
    saveCustomRate(symbol, newValue);
  };

  const handleCustomDecrement = (symbol) => {
    const current = Number(customRates[symbol] ?? 0);
    const newValue = Number((current - 0.5).toFixed(1));
    saveCustomRate(symbol, newValue);
  };

  // Filter coins based on search
  const filteredMarketCoins = marketCoins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAdminCoins = adminCoins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTrades = trades.filter(
    (trade) =>
      trade.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trade.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trade.coin?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    if (status === "open") {
      return {
        bg: `${COLORS.green}20`,
        color: COLORS.green,
        label: "Open",
      };
    } else if (status === "closed") {
      return {
        bg: `${COLORS.red}20`,
        color: COLORS.red,
        label: "Closed",
      };
    }
    return {
      bg: "rgba(255,255,255,0.05)",
      color: COLORS.text,
      label: status || "—",
    };
  };

  // Get result type badge
  const getResultTypeBadge = (resultType) => {
    if (resultType === "profit") {
      return {
        bg: `${COLORS.green}20`,
        color: COLORS.green,
        label: "Profit",
      };
    } else if (resultType === "loss") {
      return {
        bg: `${COLORS.red}20`,
        color: COLORS.red,
        label: "Loss",
      };
    }
    return {
      bg: "rgba(255,255,255,0.05)",
      color: COLORS.text,
      label: "—",
    };
  };

  return (
    <div
      className="min-h-screen p-4 md:p-6"
      style={{ backgroundColor: COLORS.bg }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1
              className="text-2xl md:text-3xl font-bold"
              style={{ color: COLORS.gold }}
            >
              Markets
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: COLORS.text, opacity: 0.7 }}
            >
              Live cryptocurrency data from Binance • {totalCoins}+ coins available
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="text-sm px-3 py-2 rounded-lg"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                border: `1px solid ${COLORS.border}`,
                color: COLORS.text,
              }}
            >
              <div className="flex gap-4">
                <button
                  onClick={handleResetAllRates}
                  className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-red-500/20 transition-colors"
                  style={{ color: COLORS.red }}
                >
                  <RefreshCw size={14} />
                  Reset All Rates
                </button>
              </div>
              <div className="mt-1">
                <span className="opacity-70">Last updated:</span>{" "}
                <span className="font-medium">
                  {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
            </div>
            <button
              onClick={fetchMarketData}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              style={{
                color: COLORS.text,
                border: `1px solid ${COLORS.border}`,
              }}
              disabled={loading}
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="mb-6 p-4 rounded-xl flex items-center gap-3"
            style={{
              backgroundColor: `${COLORS.red}20`,
              border: `1px solid ${COLORS.red}`,
              color: COLORS.red,
            }}
          >
            <AlertCircle size={20} />
            <span>{error}</span>
            <button
              onClick={fetchMarketData}
              className="ml-auto px-3 py-1 rounded-lg text-sm"
              style={{
                backgroundColor: COLORS.red,
                color: "#fff",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2"
              size={20}
              style={{ color: COLORS.text, opacity: 0.5 }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, symbol, email..."
              className="w-full pl-12 pr-4 py-3 rounded-xl text-sm"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                border: `1px solid ${COLORS.border}`,
                color: COLORS.text,
              }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b" style={{ borderColor: COLORS.border }}>
          <button
            onClick={() => setSearchType("all")}
            className={`px-4 py-2 font-medium transition-colors ${
              searchType === "all"
                ? "border-b-2"
                : "opacity-60 hover:opacity-100"
            }`}
            style={{
              borderColor: searchType === "all" ? COLORS.gold : "transparent",
              color: COLORS.text,
            }}
          >
            All Coins ({totalCoins})
          </button>
          <button
            onClick={() => setSearchType("admin")}
            className={`px-4 py-2 font-medium transition-colors ${
              searchType === "admin"
                ? "border-b-2"
                : "opacity-60 hover:opacity-100"
            }`}
            style={{
              borderColor: searchType === "admin" ? COLORS.gold : "transparent",
              color: COLORS.text,
            }}
          >
            Admin Coins ({adminCoins.length})
          </button>
          <button
            onClick={() => setSearchType("manual")}
            className={`px-4 py-2 font-medium transition-colors ${
              searchType === "manual"
                ? "border-b-2"
                : "opacity-60 hover:opacity-100"
            }`}
            style={{
              borderColor: searchType === "manual" ? COLORS.gold : "transparent",
              color: COLORS.text,
            }}
          >
            Manual Trade ({trades.length})
          </button>
        </div>

        {/* Market Coins Section - Shows ALL coins, no pagination */}
        {searchType === "all" && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2
                className="text-xl font-semibold"
                style={{ color: COLORS.text }}
              >
                Live Market Data (Binance)
              </h2>
            </div>

            <div
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: COLORS.card,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "rgba(255,255,255,0.02)",
                        borderBottom: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <th
                        className="text-left py-4 px-6 text-sm font-medium"
                        style={{ color: COLORS.text }}
                      >
                        #
                      </th>
                      <th
                        className="text-left py-4 px-6 text-sm font-medium"
                        style={{ color: COLORS.text }}
                      >
                        Coin
                      </th>
                      <th
                        className="text-left py-4 px-6 text-sm font-medium"
                        style={{ color: COLORS.text }}
                      >
                        Price (USD)
                      </th>
                      <th
                        className="text-left py-4 px-6 text-sm font-medium"
                        style={{ color: COLORS.text }}
                      >
                        24h Change
                      </th>
                      <th
                        className="text-left py-4 px-6 text-sm font-medium"
                        style={{ color: COLORS.text }}
                      >
                        24h Volume
                      </th>
                      <th
                        className="text-left py-4 px-6 text-sm font-medium"
                        style={{ color: COLORS.text }}
                      >
                        Custom Rate
                      </th>
                      <th
                        className="text-left py-4 px-6 text-sm font-medium"
                        style={{ color: COLORS.text }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && filteredMarketCoins.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center">
                          <div className="flex justify-center">
                            <RefreshCw
                              size={24}
                              className="animate-spin"
                              style={{ color: COLORS.text, opacity: 0.5 }}
                            />
                          </div>
                          <p
                            className="mt-2 text-sm"
                            style={{ color: COLORS.text, opacity: 0.7 }}
                          >
                            Loading {totalCoins}+ coins from Binance...
                          </p>
                        </td>
                      </tr>
                    ) : filteredMarketCoins.length > 0 ? (
                      filteredMarketCoins.map((coin, index) => (
                        <tr
                          key={coin.id}
                          style={{ borderBottom: `1px solid ${COLORS.border}` }}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <span
                              className="text-sm"
                              style={{ color: COLORS.text, opacity: 0.6 }}
                            >
                              {index + 1}
                            </span>
                           </td>
                          <td className="py-4 px-6">
                            <div>
                              <div
                                className="font-bold"
                                style={{ color: COLORS.text }}
                              >
                                {coin.symbol}
                              </div>
                              <div
                                className="text-xs"
                                style={{ color: COLORS.text, opacity: 0.7 }}
                              >
                                {coin.name}
                              </div>
                            </div>
                           </td>
                          <td className="py-4 px-6">
                            <div
                              className="font-medium"
                              style={{ color: COLORS.blue }}
                            >
                              ${coin.price}
                            </div>
                           </td>
                          <td className="py-4 px-6">
                            <span
                              className="px-2 py-1 rounded-lg text-xs font-medium"
                              style={{
                                backgroundColor: coin.isPositive
                                  ? `${COLORS.green}20`
                                  : `${COLORS.red}20`,
                                color: coin.isPositive
                                  ? COLORS.green
                                  : COLORS.red,
                              }}
                            >
                              {coin.change}
                            </span>
                           </td>
                          <td className="py-4 px-6">
                            <span style={{ color: COLORS.text }}>
                              ${coin.volume}
                            </span>
                           </td>
                          <td className="py-4 px-6">
                            {editingCustom === coin.symbol ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="px-2 py-1 rounded-lg w-20 text-sm"
                                  style={{
                                    backgroundColor: "rgba(255,255,255,0.05)",
                                    border: `1px solid ${COLORS.border}`,
                                    color: COLORS.text,
                                  }}
                                  step="0.1"
                                />
                                <span style={{ color: COLORS.text }}>%</span>
                                <button
                                  onClick={() =>
                                    handleCustomEditSave(coin.symbol)
                                  }
                                  className="p-1 rounded-lg hover:bg-white/10"
                                  style={{ color: COLORS.green }}
                                >
                                  <Save size={16} />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingCustom(null);
                                    setEditValue("");
                                  }}
                                  className="p-1 rounded-lg hover:bg-white/10"
                                  style={{ color: COLORS.red }}
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <span
                                  className="px-2 py-1 rounded-lg text-sm font-medium min-w-[60px] text-center"
                                  style={{
                                    backgroundColor:
                                      (customRates[coin.symbol] ?? 0) >= 0
                                        ? `${COLORS.green}20`
                                        : `${COLORS.red}20`,
                                    color:
                                      (customRates[coin.symbol] ?? 0) >= 0
                                        ? COLORS.green
                                        : COLORS.red,
                                  }}
                                >
                                  {(customRates[coin.symbol] ?? 0) >= 0
                                    ? "+"
                                    : ""}
                                  {customRates[coin.symbol] ?? 0}%
                                </span>
                              </div>
                            )}
                           </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleCustomIncrement(coin.symbol)}
                                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                style={{ color: COLORS.green }}
                                title="Increase by 0.5%"
                              >
                                <ChevronUp size={18} />
                              </button>
                              <button
                                onClick={() => handleCustomDecrement(coin.symbol)}
                                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                style={{ color: COLORS.red }}
                                title="Decrease by 0.5%"
                              >
                                <ChevronDown size={18} />
                              </button>
                              <button
                                onClick={() =>
                                  handleCustomEditStart(
                                    coin.symbol,
                                    customRates[coin.symbol] ?? 0,
                                  )
                                }
                                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                style={{ color: COLORS.blue }}
                                title="Edit custom rate"
                              >
                                <Edit size={16} />
                              </button>
                            </div>
                           </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-8 text-center">
                          <p
                            className="text-sm"
                            style={{ color: COLORS.text, opacity: 0.7 }}
                          >
                            No coins found matching "{searchQuery}"
                          </p>
                         </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Loading indicator for background fetching */}
            {loading && filteredMarketCoins.length > 0 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <RefreshCw
                  size={16}
                  className="animate-spin"
                  style={{ color: COLORS.text, opacity: 0.5 }}
                />
                <span
                  className="text-xs"
                  style={{ color: COLORS.text, opacity: 0.7 }}
                >
                  Refreshing data...
                </span>
              </div>
            )}
          </div>
        )}

        {/* Admin Coins Section */}
        {searchType === "admin" && (
          <div className="mt-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h2
                  className="text-xl font-semibold"
                  style={{ color: COLORS.text }}
                >
                  Admin Managed Coins
                </h2>
                <p
                  className="text-xs mt-1"
                  style={{ color: COLORS.text, opacity: 0.7 }}
                >
                  Custom rates and quantities for platform management
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all hover:scale-105"
                style={{
                  backgroundColor: COLORS.gold,
                  color: "#000000",
                }}
              >
                <Plus size={18} />
                Add New Coin
              </button>
            </div>

            <div
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: COLORS.card,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "rgba(255,255,255,0.02)",
                        borderBottom: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <th
                        className="text-left py-4 px-6 text-sm font-medium"
                        style={{ color: COLORS.text }}
                      >
                        Coin Name
                      </th>
                      <th
                        className="text-left py-4 px-6 text-sm font-medium"
                        style={{ color: COLORS.text }}
                      >
                        Symbol
                      </th>
                      <th
                        className="text-left py-4 px-6 text-sm font-medium"
                        style={{ color: COLORS.text }}
                      >
                        Profit (%)
                      </th>
                      <th
                        className="text-left py-4 px-6 text-sm font-medium"
                        style={{ color: COLORS.text }}
                      >
                        Quantity
                      </th>
                      <th
                        className="text-left py-4 px-6 text-sm font-medium"
                        style={{ color: COLORS.text }}
                      >
                        Total Value
                      </th>
                      <th
                        className="text-left py-4 px-6 text-sm font-medium"
                        style={{ color: COLORS.text }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminLoading ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center">
                          <div className="flex justify-center">
                            <RefreshCw
                              size={24}
                              className="animate-spin"
                              style={{ color: COLORS.text, opacity: 0.5 }}
                            />
                          </div>
                          <p
                            className="mt-2 text-sm"
                            style={{ color: COLORS.text, opacity: 0.7 }}
                          >
                            Loading admin coins...
                          </p>
                        </td>
                      </tr>
                    ) : filteredAdminCoins.length > 0 ? (
                      filteredAdminCoins.map((coin) => (
                        <tr
                          key={coin.id}
                          style={{ borderBottom: `1px solid ${COLORS.border}` }}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <span style={{ color: COLORS.text, fontWeight: 500 }}>
                              {coin.name}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span style={{ color: COLORS.text }}>
                              {coin.symbol}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            {editingAdminCoin === coin.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={adminEditValue.rate}
                                  onChange={(e) =>
                                    setAdminEditValue((prev) => ({
                                      ...prev,
                                      rate: e.target.value,
                                    }))
                                  }
                                  className="px-2 py-1 rounded-lg w-20 text-sm"
                                  style={{
                                    backgroundColor: "rgba(255,255,255,0.05)",
                                    border: `1px solid ${COLORS.border}`,
                                    color: COLORS.text,
                                  }}
                                  step="0.1"
                                />
                                <span style={{ color: COLORS.text }}>%</span>
                              </div>
                            ) : (
                              <span
                                className="px-2 py-1 rounded-lg text-sm font-medium"
                                style={{
                                  backgroundColor:
                                    coin.rate >= 0
                                      ? `${COLORS.green}20`
                                      : `${COLORS.red}20`,
                                  color:
                                    coin.rate >= 0 ? COLORS.green : COLORS.red,
                                }}
                              >
                                {coin.rate >= 0 ? "+" : ""}
                                {coin.rate}%
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            {editingAdminCoin === coin.id ? (
                              <input
                                type="number"
                                value={adminEditValue.quantity}
                                onChange={(e) =>
                                  setAdminEditValue((prev) => ({
                                    ...prev,
                                    quantity: e.target.value,
                                  }))
                                }
                                className="px-2 py-1 rounded-lg w-24 text-sm"
                                style={{
                                  backgroundColor: "rgba(255,255,255,0.05)",
                                  border: `1px solid ${COLORS.border}`,
                                  color: COLORS.text,
                                }}
                                step="0.01"
                              />
                            ) : (
                              <span style={{ color: COLORS.text }}>
                                {coin.quantity.toLocaleString(undefined, {
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            {editingAdminCoin === coin.id ? (
                              <input
                                type="number"
                                value={adminEditValue.total_value}
                                onChange={(e) =>
                                  setAdminEditValue((prev) => ({
                                    ...prev,
                                    total_value: e.target.value,
                                  }))
                                }
                                className="px-2 py-1 rounded-lg w-28 text-sm"
                                style={{
                                  backgroundColor: "rgba(255,255,255,0.05)",
                                  border: `1px solid ${COLORS.border}`,
                                  color: COLORS.text,
                                }}
                                step="0.01"
                              />
                            ) : (
                              <span
                                style={{ color: COLORS.blue, fontWeight: 500 }}
                              >
                                $
                                {(coin.total_value || 0).toLocaleString(
                                  undefined,
                                  {
                                    maximumFractionDigits: 2,
                                  },
                                )}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              {editingAdminCoin === coin.id ? (
                                <>
                                  <button
                                    onClick={() => handleAdminEditSave(coin.id)}
                                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                    style={{ color: COLORS.green }}
                                    title="Save"
                                  >
                                    <Save size={16} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingAdminCoin(null);
                                      setAdminEditValue({
                                        rate: "",
                                        quantity: "",
                                        total_value: "",
                                      });
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                    style={{ color: COLORS.red }}
                                    title="Cancel"
                                  >
                                    <X size={16} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleAdminEditStart(coin)}
                                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                    style={{ color: COLORS.blue }}
                                    title="Edit coin"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAdminCoin(coin.id)}
                                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                    style={{ color: COLORS.red }}
                                    title="Delete coin"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-8 text-center">
                          <div className="flex flex-col items-center">
                            <Package
                              size={40}
                              style={{ color: COLORS.text, opacity: 0.3 }}
                            />
                            <p
                              className="mt-2 text-sm"
                              style={{ color: COLORS.text, opacity: 0.7 }}
                            >
                              {searchQuery
                                ? `No admin coins found matching "${searchQuery}"`
                                : "No admin coins added yet"}
                            </p>
                            <button
                              onClick={() => setShowAddModal(true)}
                              className="mt-3 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                              style={{
                                backgroundColor: "rgba(255,255,255,0.05)",
                                color: COLORS.text,
                                border: `1px solid ${COLORS.border}`,
                              }}
                            >
                              <Plus size={16} />
                              Add Your First Coin
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Manual Trade Section */}
        {searchType === "manual" && (
          <div className="mt-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h2
                  className="text-xl font-semibold"
                  style={{ color: COLORS.text }}
                >
                  Manual Trade History
                </h2>
                <p
                  className="text-xs mt-1"
                  style={{ color: COLORS.text, opacity: 0.7 }}
                >
                  All user trades from the trading system
                </p>
              </div>
              <button
                onClick={fetchTrades}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
                style={{
                  color: COLORS.text,
                  border: `1px solid ${COLORS.border}`,
                }}
                disabled={tradesLoading}
              >
                <RefreshCw size={16} className={tradesLoading ? "animate-spin" : ""} />
                <span className="text-sm">Refresh</span>
              </button>
            </div>

            <div
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: COLORS.card,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "rgba(255,255,255,0.02)",
                        borderBottom: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <th
                        className="text-left py-4 px-6 text-sm font-medium"
                        style={{ color: COLORS.text }}
                      >
                        ID
                      </th>
                      <th
                        className="text-left py-4 px-6 text-sm font-medium"
                        style={{ color: COLORS.text }}
                      >
                        User
                      </th>
                      <th
                        className="text-left py-4 px-6 text-sm font-medium"
                        style={{ color: COLORS.text }}
                      >
                        Email
                      </th>
                      <th
                        className="text-left py-4 px-6 text-sm font-medium"
                        style={{ color: COLORS.text }}
                      >
                        Coin
                      </th>
                      <th
                        className="text-left py-4 px-6 text-sm font-medium"
                        style={{ color: COLORS.text }}
                      >
                        Type
                      </th>
                      <th
                        className="text-left py-4 px-6 text-sm font-medium"
                        style={{ color: COLORS.text }}
                      >
                        Price
                      </th>
                      <th
                        className="text-left py-4 px-6 text-sm font-medium"
                        style={{ color: COLORS.text }}
                      >
                        Quantity
                      </th>
                      <th
                        className="text-left py-4 px-6 text-sm font-medium"
                        style={{ color: COLORS.text }}
                      >
                        Total
                      </th>
                      <th
                        className="text-left py-4 px-6 text-sm font-medium"
                        style={{ color: COLORS.text }}
                      >
                        Status
                      </th>
                      <th
                        className="text-left py-4 px-6 text-sm font-medium"
                        style={{ color: COLORS.text }}
                      >
                        Result
                      </th>
                      <th
                        className="text-left py-4 px-6 text-sm font-medium"
                        style={{ color: COLORS.text }}
                      >
                        Created_At
                      </th>
                      <th
                        className="text-left py-4 px-6 text-sm font-medium"
                        style={{ color: COLORS.text }}
                      >
                        Closed_At
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tradesLoading ? (
                      <tr>
                        <td colSpan="12" className="py-8 text-center">
                          <div className="flex justify-center">
                            <RefreshCw
                              size={24}
                              className="animate-spin"
                              style={{ color: COLORS.text, opacity: 0.5 }}
                            />
                          </div>
                          <p
                            className="mt-2 text-sm"
                            style={{ color: COLORS.text, opacity: 0.7 }}
                          >
                            Loading trade history...
                          </p>
                        </td>
                      </tr>
                    ) : filteredTrades.length > 0 ? (
                      filteredTrades.map((trade) => {
                        const statusBadge = getStatusBadge(trade.status);
                        const resultBadge = getResultTypeBadge(trade.result_type);
                        return (
                          <tr
                            key={trade.id}
                            style={{ borderBottom: `1px solid ${COLORS.border}` }}
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="py-4 px-6">
                              <span
                                className="text-sm"
                                style={{ color: COLORS.text, opacity: 0.6 }}
                              >
                                {trade.id}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div>
                                <div
                                  className="font-medium"
                                  style={{ color: COLORS.text }}
                                >
                                  {trade.name || "—"}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className="text-sm"
                                style={{ color: COLORS.text, opacity: 0.8 }}
                              >
                                {trade.email || "—"}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className="font-medium"
                                style={{ color: COLORS.blue }}
                              >
                                {trade.coin || "—"}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className="px-2 py-1 rounded-lg text-xs font-medium"
                                style={{
                                  backgroundColor:
                                    trade.trade_type === "buy"
                                      ? `${COLORS.green}20`
                                      : `${COLORS.red}20`,
                                  color:
                                    trade.trade_type === "buy"
                                      ? COLORS.green
                                      : COLORS.red,
                                }}
                              >
                                {trade.trade_type?.toUpperCase() || "—"}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span style={{ color: COLORS.text }}>
                                ${parseFloat(trade.price || 0).toFixed(6)}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span style={{ color: COLORS.text }}>
                                {parseFloat(trade.quantity || 0).toFixed(6)}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span style={{ color: COLORS.gold }}>
                                ${parseFloat(trade.total || 0).toFixed(6)}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className="px-2 py-1 rounded-lg text-xs font-medium"
                                style={{
                                  backgroundColor: statusBadge.bg,
                                  color: statusBadge.color,
                                }}
                              >
                                {statusBadge.label}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className="px-2 py-1 rounded-lg text-xs font-medium"
                                style={{
                                  backgroundColor: resultBadge.bg,
                                  color: resultBadge.color,
                                }}
                              >
                                {resultBadge.label}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className="text-xs"
                                style={{ color: COLORS.text, opacity: 0.7 }}
                              >
                                {formatDate(trade.created_at)}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className="text-xs"
                                style={{ color: COLORS.text, opacity: 0.7 }}
                              >
                                {formatDate(trade.closed_at)}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="12" className="py-8 text-center">
                          <div className="flex flex-col items-center">
                            <DollarSign
                              size={40}
                              style={{ color: COLORS.text, opacity: 0.3 }}
                            />
                            <p
                              className="mt-2 text-sm"
                              style={{ color: COLORS.text, opacity: 0.7 }}
                            >
                              {searchQuery
                                ? `No trades found matching "${searchQuery}"`
                                : "No trade history available"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Add Admin Coin Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div
              className="w-full max-w-md rounded-2xl p-6"
              style={{
                backgroundColor: COLORS.card,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="text-xl font-bold"
                  style={{ color: COLORS.text }}
                >
                  Add New Admin Coin
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewAdminCoin({
                      name: "",
                      symbol: "",
                      rate: "",
                      quantity: "",
                      total_value: "",
                    });
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  style={{ color: COLORS.text }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: COLORS.text }}
                  >
                    Coin Name
                  </label>
                  <input
                    type="text"
                    value={newAdminCoin.name}
                    onChange={(e) =>
                      setNewAdminCoin((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g. Bitcoin"
                    className="w-full px-4 py-3 rounded-lg text-sm"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border: `1px solid ${COLORS.border}`,
                      color: COLORS.text,
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: COLORS.text }}
                  >
                    Symbol
                  </label>
                  <input
                    type="text"
                    value={newAdminCoin.symbol}
                    onChange={(e) =>
                      setNewAdminCoin((prev) => ({
                        ...prev,
                        symbol: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="e.g. BTC"
                    className="w-full px-4 py-3 rounded-lg text-sm"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border: `1px solid ${COLORS.border}`,
                      color: COLORS.text,
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: COLORS.text }}
                  >
                    Profit (%)
                  </label>
                  <div className="flex items-center gap-2">
                    <Percent
                      size={18}
                      style={{ color: COLORS.text, opacity: 0.5 }}
                    />
                    <input
                      type="number"
                      value={newAdminCoin.rate}
                      onChange={(e) =>
                        setNewAdminCoin((prev) => ({
                          ...prev,
                          rate: e.target.value,
                        }))
                      }
                      placeholder="2.5"
                      className="flex-1 px-4 py-3 rounded-lg text-sm"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: `1px solid ${COLORS.border}`,
                        color: COLORS.text,
                      }}
                      step="0.1"
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: COLORS.text }}
                  >
                    Quantity
                  </label>
                  <div className="flex items-center gap-2">
                    <Package
                      size={18}
                      style={{ color: COLORS.text, opacity: 0.5 }}
                    />
                    <input
                      type="number"
                      value={newAdminCoin.quantity}
                      onChange={(e) =>
                        setNewAdminCoin((prev) => ({
                          ...prev,
                          quantity: e.target.value,
                        }))
                      }
                      placeholder="100.00"
                      className="flex-1 px-4 py-3 rounded-lg text-sm"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: `1px solid ${COLORS.border}`,
                        color: COLORS.text,
                      }}
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: COLORS.text }}
                  >
                    Total Value (USD)
                  </label>
                  <input
                    type="number"
                    value={newAdminCoin.total_value}
                    onChange={(e) =>
                      setNewAdminCoin((prev) => ({
                        ...prev,
                        total_value: e.target.value,
                      }))
                    }
                    placeholder="10000"
                    className="w-full px-4 py-3 rounded-lg text-sm"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border: `1px solid ${COLORS.border}`,
                      color: COLORS.text,
                    }}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setNewAdminCoin({
                        name: "",
                        symbol: "",
                        rate: "",
                        quantity: "",
                        total_value: "",
                      });
                    }}
                    className="flex-1 py-3 rounded-lg font-medium"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      color: COLORS.text,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddAdminCoin}
                    className="flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: COLORS.gold,
                      color: "#000000",
                    }}
                  >
                    <Plus size={18} />
                    Add Coin
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div
          className="mt-8 text-center text-xs"
          style={{ color: COLORS.text, opacity: 0.5 }}
        >
          <p>
            Market data from Binance API • {totalCoins}+ coins available • Updates every 30 seconds • Custom rates are for admin use only and don't affect API data
          </p>
        </div>
      </div>
    </div>
  );
}