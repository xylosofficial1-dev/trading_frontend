// src/pages/Users.jsx
import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Mail,
  Phone,
  Globe,
  Wallet,
  TrendingUp,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Copy,
  Check,
  Shield,
  ShieldOff,
  AlertTriangle
} from "lucide-react";

// Color constants matching your theme
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

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "ok", "block"
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [showStatusConfirm, setShowStatusConfirm] = useState(null);
  const usersPerPage = 10;

  const BASE_URL = import.meta.env.VITE_API_URL;

  // Fetch users data
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // const response = await fetch("http://localhost:5000/api/all");
      const response = await fetch(`${BASE_URL}/api/all`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
       setUsers(data.data);
      } else {
        throw new Error("Failed to fetch users");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle user status with confirmation
  const toggleUserStatus = (userId, currentStatus) => {
    setShowStatusConfirm({ userId, currentStatus });
  };

const confirmStatusChange = async () => {
  if (!showStatusConfirm) return;

  const { userId, currentStatus } = showStatusConfirm;
  const newStatus = currentStatus === "ok" ? "block" : "ok";

  try {
    const res = await fetch(
      `${BASE_URL}/api/users/${userId}/status`,
    // const res = await fetch(
    //   `http://localhost:5000/api/users/${userId}/status`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      }
    );

    const data = await res.json();
    if (!data.success) throw new Error("Update failed");

    // update UI
    setUsers(users =>
      users.map(u =>
        u.id === userId ? { ...u, status: newStatus } : u
      )
    );
  } catch (err) {
    alert("Failed to update user status");
  } finally {
    setShowStatusConfirm(null);
  }
};

  // Filter users based on search term and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm) ||
      user.wallet_address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Copy text to clipboard
  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Get gender symbol
  const getGenderSymbol = (gender) => {
    if (!gender) return "";
    const g = gender.toLowerCase();
    if (g === "male") return "(m)";
    if (g === "female") return "(f)";
    return "(o)";
  };

  // Stats calculation
  const totalWalletAmount = users.reduce((sum, user) => sum + parseFloat(user.wallet_amount || 0), 0);
  const totalTradingAmount = users.reduce((sum, user) => sum + parseFloat(user.trading_wallet_amount || 0), 0);
  const activeUsers = users.filter(user => user.status === "ok").length;
  const blockedUsers = users.filter(user => user.status === "block").length;

  if (loading) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: COLORS.bg }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: COLORS.gold }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ backgroundColor: COLORS.bg }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold" style={{ color: COLORS.gold }}>
              User Management
            </h1>
            <p className="text-sm mt-1" style={{ color: COLORS.text, opacity: 0.7 }}>
              Manage all registered users and their wallet details
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                border: `1px solid ${COLORS.border}`,
                color: COLORS.gold,
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "rgba(255,215,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "rgba(255,255,255,0.05)";
              }}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div
            className="p-5 rounded-2xl"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: COLORS.text, opacity: 0.7 }}>
                  Total Users
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: COLORS.text }}>
                  {users.length}
                </p>
              </div>
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(59,130,246,0.15)" }}
              >
                <Users size={24} style={{ color: COLORS.blue }} />
              </div>
            </div>
          </div>

          <div
            className="p-5 rounded-2xl"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: COLORS.text, opacity: 0.7 }}>
                  Active Users
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: COLORS.positive }}>
                  {activeUsers}
                </p>
              </div>
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(34,197,94,0.15)" }}
              >
                <Shield size={24} style={{ color: COLORS.positive }} />
              </div>
            </div>
          </div>

          <div
            className="p-5 rounded-2xl"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: COLORS.text, opacity: 0.7 }}>
                  Blocked Users
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: COLORS.negative }}>
                  {blockedUsers}
                </p>
              </div>
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(239,68,68,0.15)" }}
              >
                <ShieldOff size={24} style={{ color: COLORS.negative }} />
              </div>
            </div>
          </div>

          <div
            className="p-5 rounded-2xl"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: COLORS.text, opacity: 0.7 }}>
                  Total Balance
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: COLORS.gold }}>
                  ${(totalWalletAmount + totalTradingAmount).toFixed(2)}
                </p>
              </div>
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(255,215,0,0.15)" }}
              >
                <Wallet size={24} style={{ color: COLORS.gold }} />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter - Improved UI */}
        <div
          className="p-4 rounded-2xl mb-6"
          style={{
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                size={18}
                style={{ color: COLORS.text, opacity: 0.5 }}
              />
              <input
                type="text"
                placeholder="Search by name, email, phone, or wallet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text,
                }}
              />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <label className="text-sm whitespace-nowrap" style={{ color: COLORS.text, opacity: 0.7 }}>
                Status:
              </label>
              <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${statusFilter === "all" ? "font-medium" : ""}`}
                  style={{
                    backgroundColor: statusFilter === "all" ? COLORS.gold : "transparent",
                    color: statusFilter === "all" ? "#000" : COLORS.text,
                  }}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter("ok")}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${statusFilter === "ok" ? "font-medium" : ""}`}
                  style={{
                    backgroundColor: statusFilter === "ok" ? COLORS.positive : "transparent",
                    color: statusFilter === "ok" ? "#000" : COLORS.text,
                  }}
                >
                  Active
                </button>
                <button
                  onClick={() => setStatusFilter("block")}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${statusFilter === "block" ? "font-medium" : ""}`}
                  style={{
                    backgroundColor: statusFilter === "block" ? COLORS.negative : "transparent",
                    color: statusFilter === "block" ? "#000" : COLORS.text,
                  }}
                >
                  Blocked
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          {/* Table Header - Fixed alignment */}
          <div
            className="grid grid-cols-12 p-4"
            style={{
              borderBottom: `1px solid ${COLORS.border}`,
              backgroundColor: "rgba(255,255,255,0.03)",
            }}
          >
            <div className="col-span-3 font-medium pl-3" style={{ color: COLORS.text }}>User</div>
            <div className="col-span-3 font-medium" style={{ color: COLORS.text }}>Contact</div>
            <div className="col-span-2 font-medium" style={{ color: COLORS.text }}>Wallet</div>
            <div className="col-span-2 font-medium" style={{ color: COLORS.text }}>Amounts</div>
            <div className="col-span-2 font-medium" style={{ color: COLORS.text }}>Status</div>
          </div>

          {/* Table Body */}
          {currentUsers.length === 0 ? (
            <div className="p-8 text-center">
              <Users size={48} className="mx-auto mb-4" style={{ color: COLORS.text, opacity: 0.3 }} />
              <p style={{ color: COLORS.text, opacity: 0.7 }}>No users found</p>
            </div>
          ) : (
            currentUsers.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-12 p-4 hover:bg-white/5 transition-colors border-b"
                style={{ borderColor: COLORS.border }}
              >
                {/* User Info - Fixed alignment */}
                <div className="col-span-3 pl-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="hover:opacity-80 transition-opacity"
                      title="View Details"
                    >
                      <Eye size={16} style={{ color: COLORS.gold, marginRight: 8 }} />
                    </button>
                    <div>
                      <p style={{ color: COLORS.text }} className="font-medium">
                        {user.name} {getGenderSymbol(user.gender)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs" style={{ color: COLORS.text, opacity: 0.6 }}>
                          ID: {user.id}
                        </p>
                        <span className="text-xs" style={{ color: COLORS.text, opacity: 0.3 }}>•</span>
                        <p className="text-xs" style={{ color: COLORS.text, opacity: 0.6 }}>
                          {formatDate(user.dob)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Info - Improved layout with copy button next to text */}
                <div className="col-span-3 space-y-2">
                  {/* Email row */}
                  <div className="flex items-center gap-2">
                    <Mail size={12} style={{ color: COLORS.text, opacity: 0.6, flexShrink: 0 }} />
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <span className="text-sm truncate" style={{ color: COLORS.text }}>
                        {user.email.length > 12 ? `${user.email.substring(0, 12)}...` : user.email}
                      </span>
                      <button
                        onClick={() => copyToClipboard(user.email, `email-${user.id}`)}
                        className="p-0.5 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                        style={{ color: COLORS.text, opacity: 0.6 }}
                        title="Copy email"
                      >
                        {copiedField === `email-${user.id}` ? (
                          <Check size={10} style={{ color: COLORS.positive }} />
                        ) : (
                          <Copy size={10} />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Phone row */}
                  <div className="flex items-center gap-2">
                    <Phone size={12} style={{ color: COLORS.text, opacity: 0.6, flexShrink: 0 }} />
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <span className="text-sm truncate" style={{ color: COLORS.text }}>
                        {user.country_code} {user.phone}
                      </span>
                      <button
                        onClick={() => copyToClipboard(`${user.country_code}${user.phone}`, `phone-${user.id}`)}
                        className="p-0.5 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                        style={{ color: COLORS.text, opacity: 0.6 }}
                        title="Copy phone"
                      >
                        {copiedField === `phone-${user.id}` ? (
                          <Check size={10} style={{ color: COLORS.positive }} />
                        ) : (
                          <Copy size={10} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Wallet Info - Improved layout */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <Globe size={12} style={{ color: COLORS.text, opacity: 0.6, flexShrink: 0 }} />
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <span className="text-sm font-mono truncate" style={{ color: COLORS.text }}>
                        {user.wallet_address ? user.wallet_address.substring(0, 10) + "..." : "N/A"}
                      </span>
                      <button
                        onClick={() => copyToClipboard(user.wallet_address, `wallet-${user.id}`)}
                        className="p-0.5 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                        style={{ color: COLORS.text, opacity: 0.6 }}
                        title="Copy wallet address"
                      >
                        {copiedField === `wallet-${user.id}` ? (
                          <Check size={10} style={{ color: COLORS.positive }} />
                        ) : (
                          <Copy size={10} />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs mt-1 pl-4" style={{ color: COLORS.text, opacity: 0.6 }}>
                    Created: {formatDate(user.created_at)}
                  </p>
                </div>

                {/* Amounts - Improved alignment */}
                <div className="col-span-2 space-y-1 pl-2">
                  <div className="flex items-center gap-2">
                    <Wallet size={12} style={{ color: COLORS.gold, opacity: 0.8, flexShrink: 0 }} />
                    <p className="text-sm font-medium" style={{ color: COLORS.text }}>
                      ${parseFloat(user.wallet_amount).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={12} style={{ color: COLORS.purple, opacity: 0.8, flexShrink: 0 }} />
                    <p className="text-sm" style={{ color: COLORS.text }}>
                      ${parseFloat(user.trading_wallet_amount).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Status - Moved eye icon here and removed actions column */}
                <div className="col-span-2 flex items-center gap-2">
                  <button
                    onClick={() => toggleUserStatus(user.id, user.status)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                      user.status === "ok"
                        ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    }`}
                  >
                    {user.status === "ok" ? (
                      <>
                        <Shield size={10} /> Active
                      </>
                    ) : (
                      <>
                        <ShieldOff size={10} /> Blocked
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm" style={{ color: COLORS.text, opacity: 0.7 }}>
              Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg disabled:opacity-30 transition-colors"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: COLORS.text,
                }}
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  if (totalPages <= 5) return true;
                  return Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages;
                })
                .map((page, index, array) => {
                  if (index > 0 && page - array[index - 1] > 1) {
                    return (
                      <span key={`ellipsis-${page}`} className="px-2" style={{ color: COLORS.text }}>
                        ...
                      </span>
                    );
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        currentPage === page ? "font-bold" : ""
                      }`}
                      style={{
                        backgroundColor: currentPage === page ? COLORS.gold : "rgba(255,255,255,0.05)",
                        color: currentPage === page ? "#000" : COLORS.text,
                      }}
                    >
                      {page}
                    </button>
                  );
                })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg disabled:opacity-30 transition-colors"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: COLORS.text,
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div
            className="p-4 rounded-2xl mt-6 flex items-center gap-3"
            style={{
              backgroundColor: "rgba(239,68,68,0.1)",
              border: `1px solid ${COLORS.negative}40`,
            }}
          >
            <div className="text-red-400">⚠️</div>
            <div>
              <p className="font-medium" style={{ color: COLORS.negative }}>
                Error loading users
              </p>
              <p className="text-sm mt-0.5" style={{ color: COLORS.text, opacity: 0.7 }}>
                {error}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Status Change Confirmation Modal */}
      {showStatusConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div
            className="w-full max-w-md rounded-2xl"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(245,158,11,0.2)" }}>
                  <AlertTriangle size={20} style={{ color: "#F59E0B" }} />
                </div>
                <h2 className="text-xl font-bold" style={{ color: COLORS.text }}>
                  Confirm Status Change
                </h2>
              </div>
              
              <p className="mb-6" style={{ color: COLORS.text, opacity: 0.8 }}>
                Are you sure you want to {showStatusConfirm.currentStatus === "ok" ? "block" : "unblock"} this user? 
                This action will {showStatusConfirm.currentStatus === "ok" ? "prevent" : "allow"} them from accessing their account.
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowStatusConfirm(null)}
                  className="px-4 py-2 rounded-xl transition-colors"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: COLORS.text,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusChange}
                  className="px-4 py-2 rounded-xl font-medium transition-colors"
                  style={{
                    backgroundColor: showStatusConfirm.currentStatus === "ok" ? COLORS.negative : COLORS.positive,
                    color: "#000",
                  }}
                >
                  {showStatusConfirm.currentStatus === "ok" ? "Block User" : "Unblock User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div
            className="w-full max-w-2xl rounded-2xl"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            {/* Modal Header */}
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: COLORS.border }}>
              <h2 className="text-xl font-bold" style={{ color: COLORS.gold }}>
                User Details
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                style={{ color: COLORS.text }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body - Same as before but adjusted for better layout */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm" style={{ color: COLORS.text, opacity: 0.7 }}>
                      Full Name
                    </label>
                    <p className="text-lg font-medium mt-1" style={{ color: COLORS.text }}>
                      {selectedUser.name} {getGenderSymbol(selectedUser.gender)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm" style={{ color: COLORS.text, opacity: 0.7 }}>
                      User ID
                    </label>
                    <p className="text-lg font-medium mt-1 font-mono" style={{ color: COLORS.gold }}>
                      #{selectedUser.id}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm" style={{ color: COLORS.text, opacity: 0.7 }}>
                      Email Address
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-lg font-medium truncate" style={{ color: COLORS.text }}>
                        {selectedUser.email}
                      </p>
                      <button
                        onClick={() => copyToClipboard(selectedUser.email, 'modal-email')}
                        className="p-1 rounded hover:bg-white/10 flex-shrink-0"
                        style={{ color: COLORS.text }}
                      >
                        {copiedField === 'modal-email' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm" style={{ color: COLORS.text, opacity: 0.7 }}>
                      Phone Number
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-lg font-medium" style={{ color: COLORS.text }}>
                        {selectedUser.country_code} {selectedUser.phone}
                      </p>
                      <button
                        onClick={() => copyToClipboard(`${selectedUser.country_code}${selectedUser.phone}`, 'modal-phone')}
                        className="p-1 rounded hover:bg-white/10 flex-shrink-0"
                        style={{ color: COLORS.text }}
                      >
                        {copiedField === 'modal-phone' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm" style={{ color: COLORS.text, opacity: 0.7 }}>
                      Date of Birth
                    </label>
                    <p className="text-lg font-medium mt-1" style={{ color: COLORS.text }}>
                      {formatDate(selectedUser.dob)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm" style={{ color: COLORS.text, opacity: 0.7 }}>
                      Gender
                    </label>
                    <p className="text-lg font-medium mt-1" style={{ color: COLORS.text }}>
                      {selectedUser.gender} {getGenderSymbol(selectedUser.gender)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm" style={{ color: COLORS.text, opacity: 0.7 }}>
                      Wallet Address
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-lg font-medium font-mono text-sm truncate" style={{ color: COLORS.gold }}>
                        {selectedUser.wallet_address}
                      </p>
                      <button
                        onClick={() => copyToClipboard(selectedUser.wallet_address, 'modal-wallet')}
                        className="p-1 rounded hover:bg-white/10 flex-shrink-0"
                        style={{ color: COLORS.text }}
                      >
                        {copiedField === 'modal-wallet' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm" style={{ color: COLORS.text, opacity: 0.7 }}>
                        Wallet Amount
                      </label>
                      <p className="text-xl font-bold mt-1" style={{ color: COLORS.gold }}>
                        ${selectedUser.wallet_amount}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm" style={{ color: COLORS.text, opacity: 0.7 }}>
                        Strategy Allocation Balance
                      </label>
                      <p className="text-xl font-bold mt-1" style={{ color: COLORS.purple }}>
                        ${selectedUser.trading_wallet_amount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t" style={{ borderColor: COLORS.border }}>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm" style={{ color: COLORS.text, opacity: 0.7 }}>
                      Member Since
                    </label>
                    <p className="text-lg font-medium mt-1" style={{ color: COLORS.text }}>
                      {formatDate(selectedUser.created_at)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div>
                      <label className="text-sm" style={{ color: COLORS.text, opacity: 0.7 }}>
                        Account Status
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => toggleUserStatus(selectedUser.id, selectedUser.status)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                            selectedUser.status === "ok"
                              ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                              : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          }`}
                        >
                          {selectedUser.status === "ok" ? "Active Account" : "Blocked Account"}
                        </button>
                        
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedUser.is_verified
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          {selectedUser.is_verified ? "Verified" : "Unverified"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t flex justify-end gap-3" style={{ borderColor: COLORS.border }}>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl transition-colors"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: COLORS.text,
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}