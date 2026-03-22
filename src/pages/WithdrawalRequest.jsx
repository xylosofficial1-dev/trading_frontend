// pages/WithdrawalRequest.jsx
import React, { useEffect, useState } from "react";
import {
  Clock,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  User,
  Wallet,
  FileText,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Send
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
  pending: "#F59E0B",
  pendingLight: "rgba(245,158,11,0.15)",
  completed: "#22C55E",
  completedLight: "rgba(34,197,94,0.15)",
  rejected: "#EF4444",
  rejectedLight: "rgba(239,68,68,0.15)",
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
  });
};

const formatFullDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch(status?.toLowerCase()) {
      case 'pending':
        return { icon: Clock, color: COLORS.pending, bg: COLORS.pendingLight, label: 'Pending' };
      case 'completed':
        return { icon: CheckCircle, color: COLORS.completed, bg: COLORS.completedLight, label: 'Completed' };
      case 'rejected':
        return { icon: XCircle, color: COLORS.rejected, bg: COLORS.rejectedLight, label: 'Rejected' };
      default:
        return { icon: AlertCircle, color: COLORS.textMuted, bg: COLORS.cardLight, label: 'Unknown' };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
      style={{
        backgroundColor: config.bg,
        color: config.color,
      }}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
};

export default function WithdrawalRequest() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [filteredWithdrawals, setFilteredWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [copiedAddress, setCopiedAddress] = useState(null);
  const [stats, setStats] = useState({
    totalWithdrawn: 0,
    totalRequests: 0,
    pendingCount: 0,
    completedCount: 0,
    rejectedCount: 0,
    avgAmount: 0,
    uniqueUsers: 0,
  });

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/withdrawal/all`);
      const data = await res.json();
      
      setWithdrawals(data);
      setFilteredWithdrawals(data);
      
      // Calculate stats
      const totalAmount = data.reduce((sum, item) => sum + Number(item.amount), 0);
      const pending = data.filter(item => item.status === 'pending').length;
      const completed = data.filter(item => item.status === 'completed').length;
      const rejected = data.filter(item => item.status === 'rejected').length;
      const uniqueUsers = new Set(data.map(item => item.user_id)).size;
      
      setStats({
        totalWithdrawn: totalAmount,
        totalRequests: data.length,
        pendingCount: pending,
        completedCount: completed,
        rejectedCount: rejected,
        avgAmount: data.length > 0 ? totalAmount / data.length : 0,
        uniqueUsers: uniqueUsers,
      });
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch withdrawal requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  // Filter data
  useEffect(() => {
    let filtered = [...withdrawals];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.id.toString().includes(query) ||
        item.user_id.toString().includes(query) ||
        (item.name && item.name.toLowerCase().includes(query)) ||
        (item.email && item.email.toLowerCase().includes(query)) ||
        (item.wallet_address && item.wallet_address.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    
    // Sort by created date (newest first)
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    setFilteredWithdrawals(filtered);
  }, [searchQuery, statusFilter, withdrawals]);

  const copyToClipboard = async (address, id) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(id);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this withdrawal request?")) {
      return;
    }

    try {
      setProcessingId(id);
      const res = await fetch(`${API}/withdrawal/approve/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (res.ok) {
        alert("Withdrawal approved successfully!");
        fetchWithdrawals();
      } else {
        alert(data.error || "Failed to approve withdrawal");
      }
    } catch (err) {
      console.error("Approve error:", err);
      alert("Error approving withdrawal");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      setProcessingId(selectedWithdrawal?.id);
      const res = await fetch(`${API}/withdrawal/reject/${selectedWithdrawal.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: rejectReason }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Withdrawal rejected successfully!");
        setShowRejectModal(false);
        setRejectReason("");
        setSelectedWithdrawal(null);
        fetchWithdrawals();
      } else {
        alert(data.error || "Failed to reject withdrawal");
      }
    } catch (err) {
      console.error("Reject error:", err);
      alert("Error rejecting withdrawal");
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowRejectModal(true);
  };

  const viewDetails = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return COLORS.pending;
      case 'completed': return COLORS.completed;
      case 'rejected': return COLORS.rejected;
      default: return COLORS.textMuted;
    }
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
              Withdrawal Requests
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: COLORS.textSecondary }}
            >
              Manage and track all withdrawal requests from users
            </p>
          </div>

          <div className="flex items-center gap-3">
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

            <button
              onClick={fetchWithdrawals}
              className="p-2 rounded-lg transition-colors cursor-pointer hover:opacity-80"
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
                Total Withdrawn
              </p>
              <DollarSign size={18} style={{ color: COLORS.gold }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: COLORS.gold }}>
              ${formatNumber(stats.totalWithdrawn)}
            </p>
            <p className="text-xs mt-1" style={{ color: COLORS.textMuted }}>
              {stats.totalRequests} total requests
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
                Pending
              </p>
              <Clock size={18} style={{ color: COLORS.pending }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: COLORS.pending }}>
              {stats.pendingCount}
            </p>
            <p className="text-xs mt-1" style={{ color: COLORS.textMuted }}>
              Awaiting approval
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
                Completed
              </p>
              <CheckCircle size={18} style={{ color: COLORS.completed }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: COLORS.completed }}>
              {stats.completedCount}
            </p>
            <p className="text-xs mt-1" style={{ color: COLORS.textMuted }}>
              Successfully processed
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
              <User size={18} style={{ color: COLORS.blue }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: COLORS.blue }}>
              {stats.uniqueUsers}
            </p>
            <p className="text-xs mt-1" style={{ color: COLORS.textMuted }}>
              Total requesters
            </p>
          </div>
        </div>

        {/* Search and Filters */}
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
              placeholder="Search by ID, user ID, name, email, or wallet address..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm"
              style={{
                backgroundColor: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                color: COLORS.text,
              }}
            />
          </div>

          {/* Status Filter - Radio Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                statusFilter === "all" ? "bg-opacity-100" : "bg-opacity-50"
              }`}
              style={{
                backgroundColor: statusFilter === "all" ? COLORS.goldLight : COLORS.card,
                border: `1px solid ${COLORS.border}`,
                color: statusFilter === "all" ? COLORS.gold : COLORS.textSecondary,
              }}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                statusFilter === "pending" ? "bg-opacity-100" : "bg-opacity-50"
              }`}
              style={{
                backgroundColor: statusFilter === "pending" ? COLORS.pendingLight : COLORS.card,
                border: `1px solid ${COLORS.border}`,
                color: statusFilter === "pending" ? COLORS.pending : COLORS.textSecondary,
              }}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                statusFilter === "completed" ? "bg-opacity-100" : "bg-opacity-50"
              }`}
              style={{
                backgroundColor: statusFilter === "completed" ? COLORS.completedLight : COLORS.card,
                border: `1px solid ${COLORS.border}`,
                color: statusFilter === "completed" ? COLORS.completed : COLORS.textSecondary,
              }}
            >
              Completed
            </button>
            <button
              onClick={() => setStatusFilter("rejected")}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                statusFilter === "rejected" ? "bg-opacity-100" : "bg-opacity-50"
              }`}
              style={{
                backgroundColor: statusFilter === "rejected" ? COLORS.rejectedLight : COLORS.card,
                border: `1px solid ${COLORS.border}`,
                color: statusFilter === "rejected" ? COLORS.rejected : COLORS.textSecondary,
              }}
            >
              Rejected
            </button>
          </div>
        </div>

        {/* Withdrawals Table */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.border}`, backgroundColor: "rgba(0,0,0,0.3)" }}>
                  <th className="p-3 text-left" style={{ color: COLORS.textMuted }}>ID</th>
                  <th className="p-3 text-left" style={{ color: COLORS.textMuted }}>User</th>
                  <th className="p-3 text-left" style={{ color: COLORS.textMuted }}>Amount</th>
                  <th className="p-3 text-left" style={{ color: COLORS.textMuted }}>Wallet Address</th>
                  <th className="p-3 text-left" style={{ color: COLORS.textMuted }}>Status</th>
                  <th className="p-3 text-left" style={{ color: COLORS.textMuted }}>Created</th>
                  <th className="p-3 text-center" style={{ color: COLORS.textMuted }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="7" className="p-8 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <RefreshCw size={24} className="animate-spin" style={{ color: COLORS.textMuted }} />
                        <p style={{ color: COLORS.textMuted }}>Loading withdrawal requests...</p>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && filteredWithdrawals.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-8 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle size={24} style={{ color: COLORS.textMuted }} />
                        <p style={{ color: COLORS.textMuted }}>No withdrawal requests found</p>
                      </div>
                    </td>
                  </tr>
                )}

                {filteredWithdrawals.map((item, index) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: index < filteredWithdrawals.length - 1 ? `1px solid ${COLORS.border}` : "none",
                    }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="p-3 font-mono text-xs" style={{ color: COLORS.textMuted }}>
                      #{item.id}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs" style={{ color: COLORS.blue }}>
                          U-{item.user_id}
                        </span>
                        {item.name && (
                          <span className="text-xs" style={{ color: COLORS.textMuted }}>
                            {item.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-bold" style={{ color: getStatusColor(item.status) }}>
                        ${formatNumber(item.amount)}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 flex-1">
                          <Wallet size={12} style={{ color: COLORS.textMuted }} />
                          <span className="text-xs font-mono" style={{ color: COLORS.textSecondary }}>
                            {item.wallet_address?.slice(0, 8)}...{item.wallet_address?.slice(-6)}
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(item.wallet_address, item.id)}
                          className="p-1 rounded transition-colors cursor-pointer hover:opacity-80"
                          style={{ color: COLORS.gold }}
                          title="Copy full address"
                        >
                          {copiedAddress === item.id ? (
                            <Check size={14} style={{ color: COLORS.completed }} />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="p-3 text-xs" style={{ color: COLORS.textMuted }}>
                      <div className="flex items-center gap-2">
                        <Calendar size={12} />
                        {formatDate(item.created_at)}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => viewDetails(item)}
                          className="p-1.5 rounded-lg transition-colors cursor-pointer hover:opacity-80"
                          style={{
                            backgroundColor: COLORS.cardLight,
                            color: COLORS.gold,
                          }}
                          title="View Details"
                        >
                          <FileText size={16} />
                        </button>
                        {item.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(item.id)}
                              disabled={processingId === item.id}
                              className="p-1.5 rounded-lg transition-colors cursor-pointer hover:opacity-80 disabled:opacity-50"
                              style={{
                                backgroundColor: COLORS.completedLight,
                                color: COLORS.completed,
                              }}
                              title="Approve"
                            >
                              {processingId === item.id ? (
                                <RefreshCw size={16} className="animate-spin" />
                              ) : (
                                <ThumbsUp size={16} />
                              )}
                            </button>
                            <button
                              onClick={() => openRejectModal(item)}
                              disabled={processingId === item.id}
                              className="p-1.5 rounded-lg transition-colors cursor-pointer hover:opacity-80 disabled:opacity-50"
                              style={{
                                backgroundColor: COLORS.rejectedLight,
                                color: COLORS.rejected,
                              }}
                              title="Reject"
                            >
                              <ThumbsDown size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
            Showing {filteredWithdrawals.length} of {withdrawals.length} withdrawal requests
          </span>
          <div className="flex gap-4">
            <span>💰 Total: ${formatNumber(stats.totalWithdrawn)}</span>
            <span>📊 Avg: ${formatNumber(stats.avgAmount)}</span>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedWithdrawal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="max-w-2xl w-full rounded-xl overflow-hidden"
            style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold" style={{ color: COLORS.gold }}>
                  Withdrawal Details
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-1 rounded-lg cursor-pointer hover:opacity-80"
                  style={{ color: COLORS.textMuted }}
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs" style={{ color: COLORS.textMuted }}>Request ID</p>
                    <p className="font-mono text-sm" style={{ color: COLORS.text }}>#{selectedWithdrawal.id}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: COLORS.textMuted }}>Status</p>
                    <StatusBadge status={selectedWithdrawal.status} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: COLORS.textMuted }}>User ID</p>
                    <p className="font-mono text-sm" style={{ color: COLORS.blue }}>U-{selectedWithdrawal.user_id}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: COLORS.textMuted }}>Amount</p>
                    <p className="text-lg font-bold" style={{ color: getStatusColor(selectedWithdrawal.status) }}>
                      ${formatNumber(selectedWithdrawal.amount)}
                    </p>
                  </div>
                  {selectedWithdrawal.name && (
                    <div>
                      <p className="text-xs" style={{ color: COLORS.textMuted }}>Name</p>
                      <p className="text-sm" style={{ color: COLORS.text }}>{selectedWithdrawal.name}</p>
                    </div>
                  )}
                  {selectedWithdrawal.email && (
                    <div>
                      <p className="text-xs" style={{ color: COLORS.textMuted }}>Email</p>
                      <p className="text-sm" style={{ color: COLORS.text }}>{selectedWithdrawal.email}</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-xs" style={{ color: COLORS.textMuted }}>Wallet Address</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Wallet size={14} style={{ color: COLORS.gold }} />
                      <p className="text-sm font-mono break-all flex-1" style={{ color: COLORS.text }}>
                        {selectedWithdrawal.wallet_address}
                      </p>
                      <button
                        onClick={() => copyToClipboard(selectedWithdrawal.wallet_address, 'modal')}
                        className="p-1 rounded transition-colors cursor-pointer hover:opacity-80"
                        style={{ color: COLORS.gold }}
                      >
                        {copiedAddress === 'modal' ? (
                          <Check size={16} style={{ color: COLORS.completed }} />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                  {selectedWithdrawal.description && (
                    <div className="col-span-2">
                      <p className="text-xs" style={{ color: COLORS.textMuted }}>Description</p>
                      <div className="flex items-start gap-2 mt-1">
                        <FileText size={14} style={{ color: COLORS.gold }} />
                        <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                          {selectedWithdrawal.description}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedWithdrawal.reject_reason && (
                    <div className="col-span-2">
                      <p className="text-xs" style={{ color: COLORS.textMuted }}>Rejection Reason</p>
                      <div className="flex items-start gap-2 mt-1">
                        <AlertCircle size={14} style={{ color: COLORS.rejected }} />
                        <p className="text-sm" style={{ color: COLORS.rejected }}>
                          {selectedWithdrawal.reject_reason}
                        </p>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-xs" style={{ color: COLORS.textMuted }}>Created At</p>
                    <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                      {formatFullDateTime(selectedWithdrawal.created_at)}
                    </p>
                  </div>
                  {selectedWithdrawal.updated_at && (
                    <div>
                      <p className="text-xs" style={{ color: COLORS.textMuted }}>Updated At</p>
                      <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                        {formatFullDateTime(selectedWithdrawal.updated_at)}
                      </p>
                    </div>
                  )}
                </div>

                {selectedWithdrawal.status === 'pending' && (
                  <div className="flex gap-3 mt-4 pt-4 border-t" style={{ borderColor: COLORS.border }}>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleApprove(selectedWithdrawal.id);
                      }}
                      disabled={processingId === selectedWithdrawal.id}
                      className="flex-1 py-2 rounded-lg font-medium transition-colors cursor-pointer hover:opacity-80 disabled:opacity-50"
                      style={{
                        backgroundColor: COLORS.completedLight,
                        color: COLORS.completed,
                      }}
                    >
                      {processingId === selectedWithdrawal.id ? "Processing..." : "Approve"}
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        openRejectModal(selectedWithdrawal);
                      }}
                      className="flex-1 py-2 rounded-lg font-medium transition-colors cursor-pointer hover:opacity-80"
                      style={{
                        backgroundColor: COLORS.rejectedLight,
                        color: COLORS.rejected,
                      }}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedWithdrawal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          onClick={() => {
            setShowRejectModal(false);
            setRejectReason("");
          }}
        >
          <div
            className="max-w-md w-full rounded-xl overflow-hidden"
            style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold" style={{ color: COLORS.rejected }}>
                  Reject Withdrawal
                </h2>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason("");
                  }}
                  className="p-1 rounded-lg cursor-pointer hover:opacity-80"
                  style={{ color: COLORS.textMuted }}
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm mb-2" style={{ color: COLORS.text }}>
                    Request ID: <span className="font-mono" style={{ color: COLORS.gold }}>#{selectedWithdrawal.id}</span>
                  </p>
                  <p className="text-sm mb-2" style={{ color: COLORS.text }}>
                    Amount: <span className="font-bold" style={{ color: COLORS.rejected }}>${formatNumber(selectedWithdrawal.amount)}</span>
                  </p>
                  <label className="block text-xs mb-2" style={{ color: COLORS.textMuted }}>
                    Rejection Reason *
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Please provide a reason for rejecting this withdrawal request..."
                    rows="4"
                    className="w-full p-3 rounded-lg text-sm resize-none"
                    style={{
                      backgroundColor: COLORS.cardLight,
                      border: `1px solid ${COLORS.border}`,
                      color: COLORS.text,
                    }}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectReason("");
                    }}
                    className="flex-1 py-2 rounded-lg font-medium transition-colors cursor-pointer hover:opacity-80"
                    style={{
                      backgroundColor: COLORS.cardLight,
                      color: COLORS.textSecondary,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={processingId === selectedWithdrawal.id}
                    className="flex-1 py-2 rounded-lg font-medium transition-colors cursor-pointer hover:opacity-80 disabled:opacity-50"
                    style={{
                      backgroundColor: COLORS.rejectedLight,
                      color: COLORS.rejected,
                    }}
                  >
                    {processingId === selectedWithdrawal.id ? "Processing..." : "Confirm Reject"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}