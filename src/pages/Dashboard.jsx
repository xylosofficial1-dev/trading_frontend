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
  Gift,
  Shield,
  Bell,
  Calendar
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
  const [maintenance, setMaintenance] = useState(false);
  const [subscriptionLocked, setSubscriptionLocked] = useState(false);
const [subscriptionMessage, setSubscriptionMessage] = useState("");
  // Commission states
  const [commissionLoading, setCommissionLoading] = useState(false);
  const [commissionLocked, setCommissionLocked] = useState(false);
  const [commissionMessage, setCommissionMessage] = useState("");
const [unlockTime, setUnlockTime] = useState(null);
const [countdown, setCountdown] = useState("");
  // Premium Subscription states
  const [subscriptionProcessing, setSubscriptionProcessing] = useState(false);
  const [subscriptionResult, setSubscriptionResult] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  
  // Stats state
  const [userStats, setUserStats] = useState({
    total: 0,
    verified: 0,
    online: 0,
    blocked: 0
  });

  const fetchMaintenance = async () => {
    try {
      const res = await fetch(`${API}/system/maintenance`);
      const data = await res.json();
      setMaintenance(data.maintenance);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMaintenance();
  }, []);
  
  const checkSubscriptionStatus = async () => {
  try {
    const res = await fetch(
      `${API}/premium/process-subscriptions-status`
    );

    const data = await res.json();

    setSubscriptionLocked(data.locked);

    if (data.locked) {
      setUnlockTime(data.unlockTime);
    } else {
      setUnlockTime(null);
      setCountdown("");
    }
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  if (!unlockTime) return;

  const interval = setInterval(() => {
    const diff = unlockTime - Date.now();

    if (diff <= 0) {
      setSubscriptionLocked(false);
      setCountdown("");
      clearInterval(interval);
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(
      (diff % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor(
      (diff % (1000 * 60)) / 1000
    );

    setCountdown(
      `${hours}h ${minutes}m ${seconds}s`
    );
  }, 1000);

  return () => clearInterval(interval);
}, [unlockTime]);

  const toggleMaintenance = async () => {
    try {
      const res = await fetch(`${API}/system/maintenance/toggle`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setMaintenance(data.maintenance);
      }
    } catch (err) {
      console.error(err);
    }
  };
  
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
  checkSubscriptionStatus();
}, []);

  const checkCommissionStatus = async () => {
    try {
      const res = await fetch(`${API}/system/commission-status`);
      const data = await res.json();
      if (data.locked) {
        setCommissionLocked(true);
        setCommissionMessage(`Available after ${data.remaining} hour(s)`);
      } else {
        setCommissionLocked(false);
        setCommissionMessage("");
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
        setCommissionMessage("Available after 16 hours");
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

  // Process Premium Subscriptions
  const handleProcessSubscriptions = async () => {
    setSubscriptionProcessing(true);
    setSubscriptionResult(null);
    
    try {
      const res = await fetch(`${API}/premium/process-subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await res.json();
      
      if (data.success) {
  setSubscriptionResult(data);
  setShowSubscriptionModal(true);

  await fetchAllDashboardData();

  // reload lock state from DB
  await checkSubscriptionStatus();
} else {
        alert(`Failed: ${data.message}`);
      }
    } catch (err) {
      console.error("Error processing subscriptions:", err);
      alert("Failed to process subscriptions. Please try again.");
    } finally {
      setSubscriptionProcessing(false);
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
  await checkSubscriptionStatus();

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

  // Result Modal Component
  const ResultModal = () => {
    if (!showSubscriptionModal || !subscriptionResult) return null;
    
    const { summary } = subscriptionResult;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div 
          className="rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          style={{
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <div className="sticky top-0 p-6 border-b" style={{ borderColor: COLORS.border }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield size={28} style={{ color: COLORS.gold }} />
                <h2 className="text-xl font-bold" style={{ color: COLORS.gold }}>
                  Subscription Processing Results
                </h2>
              </div>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition"
              >
                <XCircle size={24} style={{ color: COLORS.text }} />
              </button>
            </div>
            <p className="text-sm mt-2" style={{ color: COLORS.text, opacity: 0.7 }}>
              Processed at: {new Date(subscriptionResult.timestamp).toLocaleString()}
            </p>
          </div>
          
          <div className="p-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "rgba(59,130,246,0.1)" }}>
                <p className="text-xs opacity-70" style={{ color: COLORS.text }}>Total</p>
                <p className="text-xl font-bold" style={{ color: COLORS.blue }}>{summary.total_processed}</p>
              </div>
              <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "rgba(16,185,129,0.1)" }}>
                <p className="text-xs opacity-70" style={{ color: COLORS.text }}>Auto-Renewed</p>
                <p className="text-xl font-bold" style={{ color: COLORS.green }}>{summary.auto_renewed}</p>
              </div>
              <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "rgba(239,68,68,0.1)" }}>
                <p className="text-xs opacity-70" style={{ color: COLORS.text }}>Failed</p>
                <p className="text-xl font-bold" style={{ color: COLORS.red }}>{summary.renewal_failed}</p>
              </div>
              <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "rgba(245,158,11,0.1)" }}>
                <p className="text-xs opacity-70" style={{ color: COLORS.text }}>Expired</p>
                <p className="text-xl font-bold" style={{ color: COLORS.orange }}>{summary.expired}</p>
              </div>
              <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "rgba(139,92,246,0.1)" }}>
                <p className="text-xs opacity-70" style={{ color: COLORS.text }}>Reminders</p>
                <p className="text-xl font-bold" style={{ color: COLORS.purple }}>{summary.reminders_sent}</p>
              </div>
            </div>
            
            {/* Details Table */}
            {subscriptionResult.details && subscriptionResult.details.length > 0 && (
              <>
                <h3 className="font-semibold mb-3" style={{ color: COLORS.text }}>Processing Details</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                        <th className="text-left py-2 px-3" style={{ color: COLORS.text }}>User ID</th>
                        <th className="text-left py-2 px-3" style={{ color: COLORS.text }}>Action</th>
                        <th className="text-left py-2 px-3" style={{ color: COLORS.text }}>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptionResult.details.slice(0, 10).map((detail, idx) => (
                        <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                          <td className="py-2 px-3" style={{ color: COLORS.text }}>{detail.user_id}</td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-1 rounded text-xs" style={{
                              backgroundColor: detail.action === 'auto_renewed' ? 'rgba(16,185,129,0.2)' :
                                              detail.action === 'renewal_failed' ? 'rgba(239,68,68,0.2)' :
                                              detail.action === 'expired' ? 'rgba(245,158,11,0.2)' :
                                              'rgba(59,130,246,0.2)',
                              color: detail.action === 'auto_renewed' ? COLORS.green :
                                     detail.action === 'renewal_failed' ? COLORS.red :
                                     detail.action === 'expired' ? COLORS.orange :
                                     COLORS.blue
                            }}>
                              {detail.action}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-xs" style={{ color: COLORS.text, opacity: 0.7 }}>{detail.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {subscriptionResult.details.length > 10 && (
                    <p className="text-xs text-center mt-2" style={{ color: COLORS.text, opacity: 0.5 }}>
                      + {subscriptionResult.details.length - 10} more entries
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
          
          <div className="sticky bottom-0 p-6 border-t" style={{ borderColor: COLORS.border }}>
            <button
              onClick={() => setShowSubscriptionModal(false)}
              className="w-full py-2 rounded-lg font-medium transition hover:opacity-80"
              style={{
                backgroundColor: COLORS.gold,
                color: "#000",
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

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

        {/* Premium Subscription Processing Card */}
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
                  backgroundColor: `${COLORS.gold}20`,
                }}
              >
                <Shield size={24} style={{ color: COLORS.gold }} />
              </div>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: COLORS.text }}>
                  Premium Subscription Manager
                </h2>
                <p className="text-sm opacity-70" style={{ color: COLORS.text }}>
                  Check expiring subscriptions, process auto-renewals, and send reminders
                </p>
                <div className="flex gap-4 mt-2">
                  <span className="text-xs flex items-center gap-1" style={{ color: COLORS.orange }}>
                    <Clock size={12} /> Checks expiry dates
                  </span>
                  <span className="text-xs flex items-center gap-1" style={{ color: COLORS.green }}>
                    <CheckCircle size={12} /> Auto-renewal
                  </span>
                  <span className="text-xs flex items-center gap-1" style={{ color: COLORS.blue }}>
                    <Bell size={12} /> Sends reminders
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleProcessSubscriptions}
              disabled={subscriptionProcessing || subscriptionLocked}
              className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 whitespace-nowrap transition-all duration-200 hover:scale-[1.02]"
              style={{
                backgroundColor: COLORS.gold,
                color: "#000000",
                opacity:
  subscriptionProcessing || subscriptionLocked
    ? 0.7
    : 1,
              }}
            >
             {subscriptionLocked ? (
  <>
    <Lock size={18} />
    {countdown || "Locked"}
  </>
) : subscriptionProcessing ? (
  <>
    <RefreshCw size={18} className="animate-spin" />
    Processing...
  </>
) : (
  <>
    <Calendar size={18} />
    Process Subscriptions
  </>
)}
            </button>
            {subscriptionLocked && (
  <div
    className="mt-2 text-sm"
    style={{ color: COLORS.red }}
  >
    Next run available in {countdown}
  </div>
)}
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

        <div className="mb-6">
          <button
            onClick={toggleMaintenance}
            className="px-6 py-3 rounded-lg font-semibold cursor-pointer"
            style={{
              backgroundColor: maintenance ? COLORS.red : COLORS.green,
              color: "#fff",
            }}
          >
            {maintenance ? "Disable Maintenance ❌" : "Enable Maintenance 🚧"}
          </button>
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
            { label: "Notifications", icon: Bell, color: COLORS.red, path: "/notifications" },
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
      
      {/* Result Modal */}
      <ResultModal />
    </div>
  );
}