import React, { useEffect, useState } from "react";
import {
  Clock,
  RefreshCw,
  Search,
  CheckCircle,
  Award,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  UserCheck,
  Gift,
  Briefcase,
  ChevronDown,
  AlertCircle
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
  orange: "#F97316",
  orangeLight: "rgba(249,115,22,0.15)",
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
  });
};

export default function TaskSalaryHistory() {
  const [data, setData] = useState({ monthlySalary: [], referralRewards: [] });
  const [filteredSalary, setFilteredSalary] = useState([]);
  const [filteredRewards, setFilteredRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [stats, setStats] = useState({
    totalSalaryPaid: 0,
    totalRewardsPaid: 0,
    uniqueUsers: 0,
    avgSalary: 0,
    avgReward: 0,
    totalTransactions: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/admin-income/all-income-data`);
      const result = await res.json();
      
      if (result.success) {
        setData(result);
        setFilteredSalary(result.monthlySalary);
        setFilteredRewards(result.referralRewards);
        
        // Calculate stats
        const totalSalary = result.monthlySalary.reduce((sum, item) => 
          sum + Number(item.salary_amount), 0
        );
        
        const totalRewards = result.referralRewards.reduce((sum, item) => 
          sum + Number(item.reward_amount), 0
        );
        
        const uniqueUsersSet = new Set([
          ...result.monthlySalary.map(item => item.user_id),
          ...result.referralRewards.map(item => item.user_id)
        ]);
        
        setStats({
          totalSalaryPaid: totalSalary,
          totalRewardsPaid: totalRewards,
          uniqueUsers: uniqueUsersSet.size,
          avgSalary: result.monthlySalary.length > 0 ? totalSalary / result.monthlySalary.length : 0,
          avgReward: result.referralRewards.length > 0 ? totalRewards / result.referralRewards.length : 0,
          totalTransactions: result.monthlySalary.length + result.referralRewards.length,
        });
        
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch task & salary history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter data based on search
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      
      // Filter salary
      const filteredSal = data.monthlySalary.filter(item =>
        item.user_id.toString().includes(query) ||
        item.business_level.toString().includes(query) ||
        item.id.toString().includes(query)
      );
      setFilteredSalary(filteredSal);
      
      // Filter rewards
      const filteredRew = data.referralRewards.filter(item =>
        item.user_id.toString().includes(query) ||
        item.deposit_required.toString().includes(query) ||
        item.referral_required.toString().includes(query) ||
        item.id.toString().includes(query)
      );
      setFilteredRewards(filteredRew);
    } else {
      setFilteredSalary(data.monthlySalary);
      setFilteredRewards(data.referralRewards);
    }
  }, [searchQuery, data]);

  const getDisplayData = () => {
    switch(activeTab) {
      case "salary":
        return { type: "salary", data: filteredSalary };
      case "rewards":
        return { type: "rewards", data: filteredRewards };
      default:
        return { 
          type: "all", 
          data: {
            salary: filteredSalary,
            rewards: filteredRewards
          }
        };
    }
  };

  const displayData = getDisplayData();

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
              Task & Salary History
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: COLORS.textSecondary }}
            >
              Complete record of all salary claims and referral rewards
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
              onClick={fetchData}
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
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase tracking-wider" style={{ color: COLORS.textMuted }}>
                Total Salary Paid
              </p>
              <Briefcase size={18} style={{ color: COLORS.gold }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: COLORS.gold }}>
              ${formatNumber(stats.totalSalaryPaid)}
            </p>
            <p className="text-xs mt-1" style={{ color: COLORS.textMuted }}>
              {data.monthlySalary.length} transactions
            </p>
          </div>

          <div
            className="p-4 rounded-xl"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase tracking-wider" style={{ color: COLORS.textMuted }}>
                Total Rewards Paid
              </p>
              <Gift size={18} style={{ color: COLORS.purple }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: COLORS.purple }}>
              ${formatNumber(stats.totalRewardsPaid)}
            </p>
            <p className="text-xs mt-1" style={{ color: COLORS.textMuted }}>
              {data.referralRewards.length} transactions
            </p>
          </div>

          <div
            className="p-4 rounded-xl"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase tracking-wider" style={{ color: COLORS.textMuted }}>
                Unique Users
              </p>
              <Users size={18} style={{ color: COLORS.blue }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: COLORS.blue }}>
              {stats.uniqueUsers}
            </p>
            <p className="text-xs mt-1" style={{ color: COLORS.textMuted }}>
              Total recipients
            </p>
          </div>

          <div
            className="p-4 rounded-xl"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase tracking-wider" style={{ color: COLORS.textMuted }}>
                Total Payout
              </p>
              <DollarSign size={18} style={{ color: COLORS.positive }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: COLORS.positive }}>
              ${formatNumber(stats.totalSalaryPaid + stats.totalRewardsPaid)}
            </p>
            <p className="text-xs mt-1" style={{ color: COLORS.textMuted }}>
              Combined amount
            </p>
          </div>
        </div>

        {/* Search and Tabs */}
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
              placeholder="Search by user ID, transaction ID, or business level..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm"
              style={{
                backgroundColor: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                color: COLORS.text,
              }}
            />
          </div>

          {/* Tab Filters */}
          <div className="flex gap-2">
            {[
              { id: "all", label: "All", icon: null },
              { id: "salary", label: "Salary", icon: Briefcase },
              { id: "rewards", label: "Rewards", icon: Gift },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                style={{
                  backgroundColor: activeTab === tab.id ? COLORS.goldLight : COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                  color: activeTab === tab.id ? COLORS.gold : COLORS.textSecondary,
                }}
              >
                {tab.icon && <tab.icon size={16} />}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Cards */}
        <div className="space-y-6">
          {/* Salary Table - Show if activeTab is 'all' or 'salary' */}
          {(activeTab === "all" || activeTab === "salary") && (
            <div
              className="rounded-xl overflow-hidden"
              style={{
                backgroundColor: COLORS.card,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div className="p-4 border-b" style={{ borderColor: COLORS.border }}>
                <div className="flex items-center gap-2">
                  <Briefcase size={18} style={{ color: COLORS.gold }} />
                  <h2 className="font-semibold" style={{ color: COLORS.text }}>Monthly Salary Claims</h2>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs ml-auto"
                    style={{
                      backgroundColor: COLORS.goldLight,
                      color: COLORS.gold,
                    }}
                  >
                    {filteredSalary.length} claims
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${COLORS.border}`, backgroundColor: "rgba(0,0,0,0.3)" }}>
                      <th className="p-3 text-left" style={{ color: COLORS.textMuted }}>ID</th>
                      <th className="p-3 text-left" style={{ color: COLORS.textMuted }}>User ID</th>
                      <th className="p-3 text-left" style={{ color: COLORS.textMuted }}>Salary Amount</th>
                      <th className="p-3 text-left" style={{ color: COLORS.textMuted }}>Business Level</th>
                      <th className="p-3 text-left" style={{ color: COLORS.textMuted }}>Claimed Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && activeTab !== "rewards" && (
                      <tr>
                        <td colSpan="5" className="p-8 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <RefreshCw size={24} className="animate-spin" style={{ color: COLORS.textMuted }} />
                            <p style={{ color: COLORS.textMuted }}>Loading salary data...</p>
                          </div>
                        </td>
                      </tr>
                    )}

                    {!loading && filteredSalary.length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-8 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <AlertCircle size={24} style={{ color: COLORS.textMuted }} />
                            <p style={{ color: COLORS.textMuted }}>No salary claims found</p>
                          </div>
                        </td>
                      </tr>
                    )}

                    {filteredSalary.map((item, index) => (
                      <tr
                        key={`salary-${item.id}`}
                        style={{
                          borderBottom: index < filteredSalary.length - 1 ? `1px solid ${COLORS.border}` : "none",
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
                          <span className="font-bold" style={{ color: COLORS.gold }}>
                            ${formatNumber(item.salary_amount)}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className="px-2 py-1 rounded-lg text-xs"
                            style={{
                              backgroundColor: COLORS.purpleLight,
                              color: COLORS.purple,
                            }}
                          >
                            ${formatNumber(item.business_level)}
                          </span>
                        </td>
                        <td className="p-3 text-xs" style={{ color: COLORS.textMuted }}>
                          <div className="flex items-center gap-2">
                            <Calendar size={12} />
                            {formatDate(item.claimed_at)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Rewards Table - Show if activeTab is 'all' or 'rewards' */}
          {(activeTab === "all" || activeTab === "rewards") && (
            <div
              className="rounded-xl overflow-hidden"
              style={{
                backgroundColor: COLORS.card,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div className="p-4 border-b" style={{ borderColor: COLORS.border }}>
                <div className="flex items-center gap-2">
                  <Gift size={18} style={{ color: COLORS.purple }} />
                  <h2 className="font-semibold" style={{ color: COLORS.text }}>Referral Rewards</h2>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs ml-auto"
                    style={{
                      backgroundColor: COLORS.purpleLight,
                      color: COLORS.purple,
                    }}
                  >
                    {filteredRewards.length} rewards
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${COLORS.border}`, backgroundColor: "rgba(0,0,0,0.3)" }}>
                      <th className="p-3 text-left" style={{ color: COLORS.textMuted }}>ID</th>
                      <th className="p-3 text-left" style={{ color: COLORS.textMuted }}>User ID</th>
                      <th className="p-3 text-left" style={{ color: COLORS.textMuted }}>Reward Amount</th>
                      <th className="p-3 text-left" style={{ color: COLORS.textMuted }}>Deposit Required</th>
                      <th className="p-3 text-left" style={{ color: COLORS.textMuted }}>Referrals Required</th>
                      <th className="p-3 text-left" style={{ color: COLORS.textMuted }}>Created Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && activeTab !== "salary" && (
                      <tr>
                        <td colSpan="6" className="p-8 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <RefreshCw size={24} className="animate-spin" style={{ color: COLORS.textMuted }} />
                            <p style={{ color: COLORS.textMuted }}>Loading rewards data...</p>
                          </div>
                        </td>
                      </tr>
                    )}

                    {!loading && filteredRewards.length === 0 && (
                      <tr>
                        <td colSpan="6" className="p-8 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <AlertCircle size={24} style={{ color: COLORS.textMuted }} />
                            <p style={{ color: COLORS.textMuted }}>No referral rewards found</p>
                          </div>
                        </td>
                      </tr>
                    )}

                    {filteredRewards.map((item, index) => (
                      <tr
                        key={`reward-${item.id}`}
                        style={{
                          borderBottom: index < filteredRewards.length - 1 ? `1px solid ${COLORS.border}` : "none",
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
                          <span className="font-bold" style={{ color: COLORS.purple }}>
                            ${formatNumber(item.reward_amount)}
                          </span>
                        </td>
                        <td className="p-3">
                          <span style={{ color: COLORS.textSecondary }}>
                            ${formatNumber(item.deposit_required)}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className="px-2 py-1 rounded-lg text-xs"
                            style={{
                              backgroundColor: COLORS.orangeLight,
                              color: COLORS.orange,
                            }}
                          >
                            {item.referral_required} referrals
                          </span>
                        </td>
                        <td className="p-3 text-xs" style={{ color: COLORS.textMuted }}>
                          <div className="flex items-center gap-2">
                            <Calendar size={12} />
                            {formatDate(item.created_at)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Summary */}
        <div
          className="mt-6 px-4 py-3 rounded-lg text-sm flex flex-wrap justify-between items-center gap-2"
          style={{
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            color: COLORS.textMuted,
          }}
        >
          <span>
            Showing {activeTab === "all" 
              ? `${filteredSalary.length + filteredRewards.length} of ${data.monthlySalary.length + data.referralRewards.length} total transactions`
              : activeTab === "salary"
              ? `${filteredSalary.length} of ${data.monthlySalary.length} salary claims`
              : `${filteredRewards.length} of ${data.referralRewards.length} referral rewards`
            }
          </span>
          <div className="flex gap-4">
            <span>💰 Salary: ${formatNumber(stats.totalSalaryPaid)}</span>
            <span>🎁 Rewards: ${formatNumber(stats.totalRewardsPaid)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}