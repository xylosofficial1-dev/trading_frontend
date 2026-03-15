import { useEffect, useState } from "react";
import {
  Clock,
  RefreshCw,
  Filter,
  ChevronDown,
  ArrowUpDown,
  Search,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL + "/api";

const COLORS = {
  bg: "#000000",
  card: "#0D0D0D",
  cardLight: "#1A1A1A",
  border: "rgba(255,255,255,0.18)",
  borderHover: "rgba(255,255,255,0.25)",
  text: "#FFFFFF",
  textSecondary: "rgba(255,255,255,0.7)",
  textMuted: "rgba(255,255,255,0.5)",
  gold: "#FFD700",
  goldLight: "rgba(255,215,0,0.15)",
  positive: "#22C55E",
  positiveLight: "rgba(34,197,94,0.15)",
  negative: "#EF4444",
  negativeLight: "rgba(239,68,68,0.15)",
  blue: "#3B82F6",
  blueLight: "rgba(59,130,246,0.15)",
  purple: "#8B5CF6",
  purpleLight: "rgba(139,92,246,0.15)",
};

const formatNumber = (num, decimals = 2) => {
  return Number(num).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function SwapHistory() {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [stats, setStats] = useState({
    totalSwaps: 0,
    totalVolume: 0,
    avgSwapValue: 0,
    uniqueUsers: 0,
  });

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/swap/history`);
      const data = await res.json();
      
      // Sort by date descending by default
      const sorted = data.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      
      setHistory(sorted);
      setFilteredHistory(sorted);
      
      // Calculate stats
      const totalSwaps = sorted.length;
      const totalVolume = sorted.reduce((sum, item) => 
        sum + Number(item.total_usd), 0
      );
      const uniqueUsers = new Set(sorted.map(item => item.user_id)).size;
      
      setStats({
        totalSwaps,
        totalVolume,
        avgSwapValue: totalSwaps > 0 ? totalVolume / totalSwaps : 0,
        uniqueUsers,
      });
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch swap history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Filter and search
  useEffect(() => {
    let filtered = [...history];

    // Apply type filter
    if (typeFilter !== "ALL") {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.coin_symbol.toLowerCase().includes(query) ||
        item.user_id.toString().includes(query) ||
        item.id.toString().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === "created_at") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (sortConfig.key === "total_usd" || sortConfig.key === "quantity" || sortConfig.key === "price_usd") {
        aVal = Number(aVal);
        bVal = Number(bVal);
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredHistory(filtered);
  }, [history, searchQuery, typeFilter, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <div
      className="p-4 md:p-6 min-h-screen"
      style={{ backgroundColor: COLORS.bg }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1
              className="text-2xl md:text-3xl font-bold"
              style={{ color: COLORS.gold }}
            >
              Swap History
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: COLORS.textSecondary }}
            >
              Complete record of all token swaps on the platform
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Last Updated */}
            <div
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
              style={{
                backgroundColor: COLORS.cardLight,
                border: `1px solid ${COLORS.border}`,
                color: COLORS.textSecondary,
              }}
            >
              <Clock size={16} />
              <span>{lastUpdated.toLocaleTimeString()}</span>
            </div>


            {/* Refresh Button */}
            <button
              onClick={fetchHistory}
              className="p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: COLORS.cardLight,
                border: `1px solid ${COLORS.border}`,
                color: COLORS.text,
              }}
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div
            className="p-4 rounded-xl"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: COLORS.textMuted }}>
              Total Swaps
            </p>
            <p className="text-2xl font-bold" style={{ color: COLORS.text }}>
              {stats.totalSwaps}
            </p>
          </div>

          <div
            className="p-4 rounded-xl"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: COLORS.textMuted }}>
              Total Volume
            </p>
            <p className="text-2xl font-bold" style={{ color: COLORS.gold }}>
              ${formatNumber(stats.totalVolume)}
            </p>
          </div>

          <div
            className="p-4 rounded-xl"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: COLORS.textMuted }}>
              Avg Swap Value
            </p>
            <p className="text-2xl font-bold" style={{ color: COLORS.blue }}>
              ${formatNumber(stats.avgSwapValue)}
            </p>
          </div>

          <div
            className="p-4 rounded-xl"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: COLORS.textMuted }}>
              Unique Users
            </p>
            <p className="text-2xl font-bold" style={{ color: COLORS.purple }}>
              {stats.uniqueUsers}
            </p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
              style={{ color: COLORS.textMuted }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by coin, user ID, or swap ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm"
              style={{
                backgroundColor: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                color: COLORS.text,
              }}
            />
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            {["ALL", "BUY", "SELL"].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: typeFilter === type ? COLORS.goldLight : COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                  color: typeFilter === type ? COLORS.gold : COLORS.textSecondary,
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Table Card */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {/* Header */}
              <thead>
                <tr
                  style={{
                    borderBottom: `1px solid ${COLORS.border}`,
                    backgroundColor: "rgba(0,0,0,0.3)",
                  }}
                >
                  <th className="p-3 text-left cursor-pointer hover:opacity-80" onClick={() => handleSort("id")}>
                    <div className="flex items-center gap-1" style={{ color: COLORS.textMuted }}>
                      ID 
                    </div>
                  </th>
                  <th className="p-3 text-left cursor-pointer hover:opacity-80" onClick={() => handleSort("user_id")}>
                    <div className="flex items-center gap-1" style={{ color: COLORS.textMuted }}>
                      User 
                    </div>
                  </th>
                  <th className="p-3 text-left cursor-pointer hover:opacity-80" onClick={() => handleSort("coin_symbol")}>
                    <div className="flex items-center gap-1" style={{ color: COLORS.textMuted }}>
                      Coin 
                    </div>
                  </th>
                  <th className="p-3 text-left cursor-pointer hover:opacity-80" onClick={() => handleSort("type")}>
                    <div className="flex items-center gap-1" style={{ color: COLORS.textMuted }}>
                      Type
                    </div>
                  </th>
                  <th className="p-3 text-left cursor-pointer hover:opacity-80" onClick={() => handleSort("quantity")}>
                    <div className="flex items-center gap-1" style={{ color: COLORS.textMuted }}>
                      Quantity 
                    </div>
                  </th>
                  <th className="p-3 text-left cursor-pointer hover:opacity-80" onClick={() => handleSort("price_usd")}>
                    <div className="flex items-center gap-1" style={{ color: COLORS.textMuted }}>
                      Price
                    </div>
                  </th>
                  <th className="p-3 text-left cursor-pointer hover:opacity-80" onClick={() => handleSort("total_usd")}>
                    <div className="flex items-center gap-1" style={{ color: COLORS.textMuted }}>
                      Total 
                    </div>
                  </th>
                  <th className="p-3 text-left cursor-pointer hover:opacity-80" onClick={() => handleSort("created_at")}>
                    <div className="flex items-center gap-1" style={{ color: COLORS.textMuted }}>
                      Date 
                    </div>
                  </th>
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="8" className="p-8 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <RefreshCw size={24} className="animate-spin" style={{ color: COLORS.textMuted }} />
                        <p style={{ color: COLORS.textMuted }}>Loading swap history...</p>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan="8" className="p-8 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle size={24} style={{ color: COLORS.textMuted }} />
                        <p style={{ color: COLORS.textMuted }}>No swap history found</p>
                        {searchQuery && (
                          <button
                            onClick={() => {
                              setSearchQuery("");
                              setTypeFilter("ALL");
                            }}
                            className="px-4 py-2 rounded-lg text-sm"
                            style={{
                              backgroundColor: COLORS.cardLight,
                              border: `1px solid ${COLORS.border}`,
                              color: COLORS.text,
                            }}
                          >
                            Clear Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}

                {filteredHistory.map((item, index) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: index < filteredHistory.length - 1 ? `1px solid ${COLORS.border}` : "none",
                    }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="p-3 font-mono text-xs" style={{ color: COLORS.textMuted }}>
                      #{item.id}
                    </td>

                    <td className="p-3">
                      <span
                        className="px-2 py-1 rounded-lg text-xs font-mono"
                        style={{
                          backgroundColor: COLORS.blueLight,
                          color: COLORS.blue,
                        }}
                      >
                        U-{item.user_id}
                      </span>
                    </td>

                    <td className="p-3">
                      <span
                        className="px-2 py-1 rounded-lg text-xs font-bold"
                        style={{
                          backgroundColor: COLORS.purpleLight,
                          color: COLORS.purple,
                        }}
                      >
                        {item.coin_symbol}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        {item.type === "BUY" ? (
                          <CheckCircle size={14} style={{ color: COLORS.positive }} />
                        ) : (
                          <XCircle size={14} style={{ color: COLORS.negative }} />
                        )}
                        <span
                          className="font-semibold"
                          style={{
                            color: item.type === "BUY" ? COLORS.positive : COLORS.negative,
                          }}
                        >
                          {item.type}
                        </span>
                      </div>
                    </td>

                    <td className="p-3 font-medium" style={{ color: COLORS.text }}>
                      {Number(item.quantity).toFixed(6)}
                    </td>

                    <td className="p-3" style={{ color: COLORS.textSecondary }}>
                      ${Number(item.price_usd).toFixed(6)}
                    </td>

                    <td className="p-3">
                      <span
                        className="font-bold"
                        style={{ color: COLORS.gold }}
                      >
                        ${Number(item.total_usd).toFixed(2)}
                      </span>
                    </td>

                    <td className="p-3 text-xs" style={{ color: COLORS.textMuted }}>
                      <div className="flex flex-col">
                        <span>{formatDate(item.created_at)}</span>
                        <span className="text-xs opacity-50">
                          {new Date(item.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer with Record Count */}
        <div
          className="mt-4 px-4 py-3 rounded-lg text-sm flex justify-between items-center"
          style={{
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            color: COLORS.textMuted,
          }}
        >
          <span>
            Showing {filteredHistory.length} of {history.length} records
          </span>
          {filteredHistory.length > 0 && (
            <span>
              Last swap: {formatDate(filteredHistory[0]?.created_at)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}