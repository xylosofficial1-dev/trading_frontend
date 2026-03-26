import { useState, useEffect } from "react";
import { 
  Users, 
  Wallet, 
  DollarSign, 
  TrendingUp,  
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  BarChart3,
  Activity,
  Video,
  CreditCard,
  Award,
  AlertCircle,
  Lock,
  Unlock,
  Gift
} from "lucide-react";
import { Link } from "react-router-dom";

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
  pink: "#EC4899"
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Commission states
  const [commissionLoading, setCommissionLoading] = useState(false);
  const [commissionLocked, setCommissionLocked] = useState(false);
  const [commissionMessage, setCommissionMessage] = useState("");
  
  // Stats state
  const [userStats, setUserStats] = useState({
    total: 0,
    verified: 0,
    online: 0,
    blocked: 0
  });
  
  const [walletStats, setWalletStats] = useState({
    totalMainWallet: 0,
    totalTradingWallet: 0,
    pendingWithdrawals: 0,
    pendingWithdrawalAmount: 0
  });
  
  const [tradeRequests, setTradeRequests] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [p2pStats, setP2pStats] = useState({
    activeListings: 0,
    pendingRequests: 0,
    completedTrades: 0
  });
  const [penaltyAmount, setPenaltyAmount] = useState(0);
  const [deductionPercent, setDeductionPercent] = useState(0);

  const API = `${import.meta.env.VITE_API_URL}/api`;

  useEffect(() => {
    fetchAllDashboardData();
    checkCommissionStatus();
  }, []);

  const checkCommissionStatus = async () => {
    try {
      const res = await fetch(`${API}/system/commission-status`);
      const data = await res.json();

      if (data.locked) {
        setCommissionLocked(true);
        setCommissionMessage(`Available after ${data.remaining} hour(s)`);
      }
    } catch (err) {
      console.error("Status check failed", err);
    }
  };

  const handleCommission = async () => {
    try {
      setCommissionLoading(true);
      setCommissionMessage("");

      const res = await fetch(`${API}/system/distribute-commission`, {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert(
          `Commission Distributed Successfully!\nUsers Processed: ${data.users}`
        );

        setCommissionLocked(true);
        setCommissionMessage("Available after 24 hours");
      } else {
        if (res.status === 400) {
          setCommissionLocked(true);
          setCommissionMessage(data.message);
        } else {
          alert(data.message || "Something went wrong");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setCommissionLoading(false);
    }
  };

  const fetchAllDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUserStats(),
        fetchWalletStats(),
        fetchTradeRequests(),
        fetchPendingPayments(),
        fetchP2PStats(),
        fetchPenaltyAmount(),
        fetchDeductionPercent()
      ]);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const res = await fetch(`${API}/admin/users/stats`);
      const data = await res.json();
      setUserStats({
        total: data.total || 0,
        verified: data.verified || 0,
        online: data.online || 0,
        blocked: data.blocked || 0
      });
    } catch (err) {
      console.error("Failed to fetch user stats", err);
      // Fallback to count from users table if endpoint doesn't exist
      try {
        const usersRes = await fetch(`${API}/admin/users`);
        const users = await usersRes.json();
        setUserStats({
          total: users.length || 0,
          verified: users.filter(u => u.is_verified).length || 0,
          online: users.filter(u => u.is_online).length || 0,
          blocked: users.filter(u => u.status === 'block').length || 0
        });
      } catch (e) {
        console.error("Fallback failed", e);
      }
    }
  };

  const fetchWalletStats = async () => {
    try {
      const res = await fetch(`${API}/wallet/admin/stats`);
      const data = await res.json();
      setWalletStats({
        totalMainWallet: data.totalMainWallet || 0,
        totalTradingWallet: data.totalTradingWallet || 0,
        pendingWithdrawals: data.pendingWithdrawals || 0,
        pendingWithdrawalAmount: data.pendingWithdrawalAmount || 0
      });
    } catch (err) {
      console.error("Failed to fetch wallet stats", err);
    }
  };

  const fetchTradeRequests = async () => {
    try {
      const res = await fetch(`${API}/wallet/admin/trade-wallet/requests`);
      const data = await res.json();
      setTradeRequests(data || []);
    } catch (err) {
      console.error("Failed to fetch trade requests", err);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const res = await fetch(`${API}/admin/payment-requests/pending`);
      const data = await res.json();
      setPendingPayments(data || []);
    } catch (err) {
      console.error("Failed to fetch pending payments", err);
    }
  };

  const fetchP2PStats = async () => {
    try {
      const res = await fetch(`${API}/p2p/admin/stats`);
      const data = await res.json();
      setP2pStats({
        activeListings: data.activeListings || 0,
        pendingRequests: data.pendingRequests || 0,
        completedTrades: data.completedTrades || 0
      });
    } catch (err) {
      console.error("Failed to fetch P2P stats", err);
    }
  };

  const fetchPenaltyAmount = async () => {
    try {
      const res = await fetch(`${API}/p2p/get-penalty`);
      const data = await res.json();
      setPenaltyAmount(data.penalty_amount || 0);
    } catch (err) {
      console.error("Failed to fetch penalty", err);
    }
  };

  const fetchDeductionPercent = async () => {
    try {
      const res = await fetch(`${API}/admin/settings`);
      const data = await res.json();
      setDeductionPercent(data.tw_to_mw_deduction_percent || 0);
    } catch (err) {
      console.error("Failed to fetch deduction percent", err);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAllDashboardData();
    await checkCommissionStatus();
    setIsRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  // Calculate trade request stats
  const pendingRequests = tradeRequests.filter(r => r.status === "pending").length;
  const approvedRequests = tradeRequests.filter(r => r.status === "approved").length;
  const rejectedRequests = tradeRequests.filter(r => r.status === "rejected").length;
  const totalPendingAmount = tradeRequests
    .filter(r => r.status === "pending")
    .reduce((sum, r) => sum + (Number(r.requested_amount) || 0), 0);

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div
      className="rounded-xl p-6 transition-all duration-300 hover:scale-[1.02]"
      style={{
        backgroundColor: COLORS.card,
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm mb-1" style={{ color: COLORS.text, opacity: 0.7 }}>
            {title}
          </p>
          <h3 className="text-2xl font-bold" style={{ color }}>
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs mt-1" style={{ color: COLORS.text, opacity: 0.5 }}>
              {subtitle}
            </p>
          )}
        </div>
        <div
          className="p-3 rounded-lg"
          style={{
            backgroundColor: `${color}20`,
          }}
        >
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-4 md:p-6 min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.bg }}>
        <div className="text-center">
          <RefreshCw size={40} className="animate-spin mx-auto mb-4" style={{ color: COLORS.gold }} />
          <p style={{ color: COLORS.text }}>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 min-h-screen" style={{ backgroundColor: COLORS.bg }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: COLORS.gold }}>
              Admin Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: COLORS.text, opacity: 0.7 }}>
              Real-time overview from your database
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-white/10 disabled:opacity-50"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                border: `1px solid ${COLORS.border}`,
                color: COLORS.text,
              }}
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>
        </div>

        {/* Commission Card */}
        <div
          className="rounded-xl p-6 mb-6"
          style={{
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            background: `linear-gradient(145deg, ${COLORS.card} 0%, rgba(0,0,0,0.8) 100%)`,
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className="p-3 rounded-xl"
                style={{
                  backgroundColor: `${COLORS.purple}20`,
                }}
              >
                <Award size={24} style={{ color: COLORS.purple }} />
              </div>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: COLORS.text }}>
                  Commission Distribution
                </h2>
                <p className="text-sm opacity-70" style={{ color: COLORS.text }}>
                  Distribute earnings to all users based on their activity
                </p>
                {commissionMessage && (
                  <p className="text-xs mt-1" style={{ color: commissionLocked ? COLORS.red : COLORS.green }}>
                    {commissionMessage}
                  </p>
                )}
              </div>
            </div>

            {!commissionLocked ? (
              <button
                onClick={handleCommission}
                disabled={commissionLoading}
                className="px-6 py-3 cursor-pointer rounded-lg font-medium flex items-center gap-2 whitespace-nowrap transition-all duration-200 hover:scale-[1.02]"
                style={{
                  backgroundColor: COLORS.green,
                  color: "#FFFFFF",
                  opacity: commissionLoading ? 0.7 : 1,
                }}
              >
                {commissionLoading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Gift size={18} />
                    Distribute Commission
                  </>
                )}
              </button>
            ) : (
              <div
                className="flex items-center gap-3 px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: `${COLORS.red}20`,
                  border: `1px solid ${COLORS.red}`,
                }}
              >
                <Lock size={18} style={{ color: COLORS.red }} />
                <span style={{ color: COLORS.red }}>Locked</span>
              </div>
            )}
          </div>
        </div>

        {/* Settings Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div
            className="rounded-xl p-6"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: COLORS.text }}>
              System Settings
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span style={{ color: COLORS.text, opacity: 0.7 }}>P2P Penalty Amount:</span>
                <span className="font-bold" style={{ color: COLORS.purple }}>{penaltyAmount}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: COLORS.text, opacity: 0.7 }}>TW to MW Deduction:</span>
                <span className="font-bold" style={{ color: COLORS.orange }}>{deductionPercent}%</span>
              </div>
            </div>
          </div>

          <div
            className="rounded-xl p-6"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: COLORS.text }}>
              Quick Stats
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span style={{ color: COLORS.text, opacity: 0.7 }}>Videos:</span>
                <Link to="/videos" className="font-bold hover:underline" style={{ color: COLORS.blue }}>Manage →</Link>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: COLORS.text, opacity: 0.7 }}>Markets:</span>
                <Link to="/markets" className="font-bold hover:underline" style={{ color: COLORS.green }}>Manage →</Link>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: COLORS.text, opacity: 0.7 }}>P2P:</span>
                <Link to="/p2p" className="font-bold hover:underline" style={{ color: COLORS.purple }}>Manage →</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <h2 className="text-lg font-semibold mb-4" style={{ color: COLORS.text }}>
          Quick Navigation
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Users", icon: Users, color: COLORS.blue, path: "/users", count: userStats.total },
            { label: "Wallet Requests", icon: Wallet, color: COLORS.green, path: "/wallet-request", count: pendingPayments.length },
            { label: "Trade Requests", icon: TrendingUp, color: COLORS.purple, path: "/trade-wallet-request", count: pendingRequests },
            { label: "P2P", icon: BarChart3, color: COLORS.orange, path: "/p2p", count: p2pStats.pendingRequests },
            { label: "Videos", icon: Video, color: COLORS.pink, path: "/videos" },
            { label: "Markets", icon: Activity, color: COLORS.gold, path: "/markets" },
            { label: "Notifications", icon: Activity, color: COLORS.red, path: "/notifications" },
            { label: "Pay Options", icon: CreditCard, color: COLORS.blue, path: "/payoptions" },
          ].map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className="flex flex-col items-center gap-2 p-4 rounded-lg transition-all duration-200 hover:scale-[1.02] relative"
              style={{
                backgroundColor: "rgba(255,255,255,0.02)",
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div
                className="p-2 rounded-lg"
                style={{
                  backgroundColor: `${action.color}20`,
                }}
              >
                <action.icon size={20} style={{ color: action.color }} />
              </div>
              <span className="text-sm font-medium" style={{ color: COLORS.text }}>
                {action.label}
              </span>
              {action.count !== undefined && action.count > 0 && (
                <span
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs flex items-center justify-center"
                  style={{
                    backgroundColor: action.color,
                    color: '#000',
                  }}
                >
                  {action.count > 99 ? '99+' : action.count}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}