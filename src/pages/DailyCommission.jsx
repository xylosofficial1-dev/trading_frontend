// src/pages/DailyCommission.jsx

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Wallet, 
  ArrowUpRight,
  Calendar,
  DollarSign,
  Users,
  RefreshCw,
  AlertCircle
} from "lucide-react";

const COLORS = {
  bg: "#000000",
  card: "#0D0D0D",
  border: "rgba(255,255,255,0.18)",
  text: "#FFFFFF",
  gold: "#FFD700",
  positive: "#22C55E",
  negative: "#EF4444",
  blue: "#3B82F6",
  purple: "#8B5CF6",
};

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function DailyCommission() {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total_commission: 0,
    total_trading_wallet: 0,
    total_main_wallet: 0,
    unique_users: 0
  });

  useEffect(() => {
    fetchCommissionHistory();
  }, []);

  const fetchCommissionHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      
      console.log("Fetching from:", `${API_BASE_URL}/api/system/commission-history/all`);
      
      const response = await fetch(`${API_BASE_URL}/api/system/commission-history/all`, {
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
          "Content-Type": "application/json"
        }
      });
      
      // Check if response is OK
      if (!response.ok) {
        const text = await response.text();
        console.error("Response error:", text);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Check content type
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 200));
        throw new Error("Server returned non-JSON response");
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCommissions(data.history || []);
        calculateStats(data.history || []);
      } else {
        setError(data.error || "Failed to fetch commissions");
      }
    } catch (error) {
      console.error("Error fetching commission history:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (history) => {
    let totalCommission = 0;
    let totalTradingWallet = 0;
    let totalMainWallet = 0;
    const uniqueUsersSet = new Set();

    history.forEach(record => {
      totalCommission += parseFloat(record.commission_amount || 0);
      uniqueUsersSet.add(record.user_id);
      
      if (record.wallet_type === 'trading_wallet') {
        totalTradingWallet += parseFloat(record.commission_amount || 0);
      } else if (record.wallet_type === 'main_wallet') {
        totalMainWallet += parseFloat(record.commission_amount || 0);
      }
    });

    setStats({
      total_commission: totalCommission,
      total_trading_wallet: totalTradingWallet,
      total_main_wallet: totalMainWallet,
      unique_users: uniqueUsersSet.size
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString()}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString()}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getWalletIcon = (walletType) => {
    return walletType === 'trading_wallet' ? '📈' : '💰';
  };

  const getWalletColor = (walletType) => {
    return walletType === 'trading_wallet' ? COLORS.blue : COLORS.purple;
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: COLORS.bg }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p style={{ color: COLORS.text }}>Loading commission history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ backgroundColor: COLORS.bg }}
      >
        <div
          className="max-w-md w-full rounded-2xl p-6 text-center"
          style={{
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <AlertCircle size={48} style={{ color: COLORS.negative, margin: "0 auto 16px" }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: COLORS.text }}>
            Error Loading Commission History
          </h2>
          <p className="text-sm mb-4" style={{ color: COLORS.text, opacity: 0.7 }}>
            {error}
          </p>
          <button
            onClick={fetchCommissionHistory}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: COLORS.gold,
              color: "#000",
              fontWeight: "600",
            }}
          >
            Try Again
          </button>
          <p className="text-xs mt-4" style={{ color: COLORS.text, opacity: 0.5 }}>
            API URL: {API_BASE_URL}/api/system/commission-history/all
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-3 sm:p-4 md:p-6"
      style={{ backgroundColor: COLORS.bg }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1
              className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2"
              style={{ color: COLORS.gold }}
            >
              <TrendingUp size={24} />
              Commission Distribution History
            </h1>
            <p
              className="text-xs sm:text-sm mt-1"
              style={{ color: COLORS.text, opacity: 0.7 }}
            >
              Track all commission distributions across the platform
            </p>
          </div>
          
          <button
            onClick={fetchCommissionHistory}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:bg-white/10"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              color: COLORS.gold
            }}
          >
            <RefreshCw size={16} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <DollarSign size={20} style={{ color: COLORS.gold }} />
              <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: "rgba(255,215,0,0.1)", color: COLORS.gold }}>
                Total
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: COLORS.text }}>
              ${stats.total_commission.toFixed(2)}
            </p>
            <p className="text-xs mt-1" style={{ color: COLORS.text, opacity: 0.6 }}>
              Total Commission Distributed
            </p>
          </div>

          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <Wallet size={20} style={{ color: COLORS.blue }} />
              <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: "rgba(59,130,246,0.1)", color: COLORS.blue }}>
                Strategy
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: COLORS.text }}>
              ${stats.total_trading_wallet.toFixed(2)}
            </p>
            <p className="text-xs mt-1" style={{ color: COLORS.text, opacity: 0.6 }}>
              To Strategy Allocation Balance
            </p>
          </div>

          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <Wallet size={20} style={{ color: COLORS.purple }} />
              <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: "rgba(139,92,246,0.1)", color: COLORS.purple }}>
                Primary
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: COLORS.text }}>
              ${stats.total_main_wallet.toFixed(2)}
            </p>
            <p className="text-xs mt-1" style={{ color: COLORS.text, opacity: 0.6 }}>
              To Primary Credit Balance
            </p>
          </div>

          <div
            className="rounded-xl p-4" 
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <Users size={20} style={{ color: COLORS.positive }} />
              <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: "rgba(34,197,94,0.1)", color: COLORS.positive }}>
                Users
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: COLORS.text }}>
              {stats.unique_users}
            </p>
            <p className="text-xs mt-1" style={{ color: COLORS.text, opacity: 0.6 }}>
              Unique Users Received Commission
            </p>
          </div>
        </div>

        {/* Commission History Table */}
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
                    borderBottom: `1px solid ${COLORS.border}`,
                    backgroundColor: "rgba(255,255,255,0.03)",
                  }}
                >
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.text }}>
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.text }}>
                    Commission
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.text }}>
                    Wallet Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.text }}>
                    Balance Change
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.text }}>
                    Date & Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {commissions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <TrendingUp size={48} style={{ color: COLORS.text, opacity: 0.3 }} />
                        <p style={{ color: COLORS.text, opacity: 0.6 }}>No commission records found</p>
                        <p className="text-xs" style={{ color: COLORS.text, opacity: 0.4 }}>
                          Commissions will appear here after distribution
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  commissions.map((commission, index) => (
                    <tr
                      key={commission.id || index}
                      style={{
                        borderBottom: index === commissions.length - 1 ? "none" : `1px solid ${COLORS.border}`,
                      }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium" style={{ color: COLORS.text }}>
                            {commission.user_name || `User #${commission.user_id}`}
                          </p>
                          {commission.user_email && (
                            <p className="text-xs mt-0.5" style={{ color: COLORS.text, opacity: 0.6 }}>
                              {commission.user_email}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold" style={{ color: COLORS.positive }}>
                            +${parseFloat(commission.commission_amount).toFixed(2)}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(34,197,94,0.1)", color: COLORS.positive }}>
                            {commission.commission_percent}%
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getWalletIcon(commission.wallet_type)}</span>
                          <span className="text-sm" style={{ color: getWalletColor(commission.wallet_type) }}>
                            {commission.wallet_type === 'trading_wallet' ? 'Strategy Allocation' : 'Primary Credit'}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-xs">
                          <span style={{ color: COLORS.text, opacity: 0.6 }}>
                            ${parseFloat(commission.before_balance).toFixed(2)}
                          </span>
                          <ArrowUpRight size={12} style={{ color: COLORS.gold }} />
                          <span style={{ color: COLORS.positive }}>
                            ${parseFloat(commission.after_balance).toFixed(2)}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Clock size={12} style={{ color: COLORS.text, opacity: 0.5 }} />
                          <span className="text-xs" style={{ color: COLORS.text, opacity: 0.7 }}>
                            {formatDate(commission.created_at)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer with total count */}
          {commissions.length > 0 && (
            <div
              className="px-4 py-3 border-t"
              style={{
                borderColor: COLORS.border,
                backgroundColor: "rgba(255,255,255,0.02)",
              }}
            >
              <p className="text-xs" style={{ color: COLORS.text, opacity: 0.6 }}>
                Showing {commissions.length} commission {commissions.length === 1 ? 'record' : 'records'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}