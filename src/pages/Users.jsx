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
  AlertTriangle,
  Menu,
  X,
  ChevronDown,
  Filter,
  DollarSign,
  Percent,
  BadgeCheck
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [showStatusConfirm, setShowStatusConfirm] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [editingAmounts, setEditingAmounts] = useState({});
  const [savingAmount, setSavingAmount] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [treeModalOpen, setTreeModalOpen] = useState(false);
  const [treeData, setTreeData] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [loadingTree, setLoadingTree] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const usersPerPage = 10;

  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/all-with-commission`);
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

  const toggleKycVerification = async (userId, currentKycStatus) => {
    try {
      const newStatus = !currentKycStatus;
      const res = await fetch(`${BASE_URL}/api/users/${userId}/kyc-verify`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kyc_verify: newStatus }),
      });
      const data = await res.json();
      if (!data.success) throw new Error("Update failed");
      setUsers((users) =>
        users.map((u) => (u.id === userId ? { ...u, kyc_verify: newStatus } : u))
      );
      alert(`KYC verification ${newStatus ? 'approved' : 'revoked'} successfully!`);
    } catch (err) {
      console.error(err);
      alert("Failed to update KYC verification status");
    }
  };

  const toggleCommissionStatus = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const response = await fetch(`${BASE_URL}/api/users/${userId}/commission`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commission_enabled: newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, commission_enabled: newStatus }
            : user
        ));
        alert(`Commission ${newStatus ? 'enabled' : 'disabled'} for user`);
      } else {
        throw new Error("Failed to update");
      }
    } catch (err) {
      console.error("Error toggling commission:", err);
      alert("Failed to update commission status");
    }
  };

  const toggleUserStatus = (userId, currentStatus) => {
    setShowStatusConfirm({ userId, currentStatus });
  };

  const confirmStatusChange = async () => {
    if (!showStatusConfirm) return;
    const { userId, currentStatus } = showStatusConfirm;
    const newStatus = currentStatus === "ok" ? "block" : "ok";
    try {
      const res = await fetch(`${BASE_URL}/api/users/${userId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!data.success) throw new Error("Update failed");
      setUsers((users) =>
        users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)),
      );
    } catch (err) {
      alert("Failed to update user status");
    } finally {
      setShowStatusConfirm(null);
    }
  };

  const updateUserAmounts = async (userId) => {
    try {
      setSavingAmount(userId);
      const currentUser = users.find((u) => u.id === userId);
      const amounts = editingAmounts[userId] || {
        wallet_amount: currentUser.wallet_amount,
        trading_wallet_amount: currentUser.trading_wallet_amount,
      };
      const walletAmount = parseFloat(amounts.wallet_amount);
      const tradingAmount = parseFloat(amounts.trading_wallet_amount);
      if (isNaN(walletAmount) || isNaN(tradingAmount)) {
        throw new Error("Invalid amount values");
      }
      const res = await fetch(`${BASE_URL}/api/users/${userId}/amounts`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_amount: walletAmount,
          trading_wallet_amount: tradingAmount,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to update amounts");
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                wallet_amount: walletAmount,
                trading_wallet_amount: tradingAmount,
              }
            : u
        )
      );
      alert("Amounts updated successfully");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update amounts");
    } finally {
      setSavingAmount(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      (user.name || "").toLowerCase().includes(search) ||
      (user.email || "").toLowerCase().includes(search) ||
      (user.phone || "").includes(search) ||
      (user.wallet_address || "").toLowerCase().includes(search);
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getGenderSymbol = (gender) => {
    if (!gender) return "";
    const g = gender.toLowerCase();
    if (g === "male") return "(m)";
    if (g === "female") return "(f)";
    return "(o)";
  };

  const fetchUserTree = async (userId) => {
    try {
      setLoadingTree(true);
      setTreeModalOpen(true);
      const response = await fetch(`${BASE_URL}/api/users/tree/${userId}`);
      const data = await response.json();
      if (data.success) {
        setTreeData(data.data);
        const allExpanded = {};
        const expandAllNodes = (node) => {
          allExpanded[node.id] = true;
          if (node.children) {
            node.children.forEach(expandAllNodes);
          }
        };
        expandAllNodes(data.data);
        setExpandedNodes(allExpanded);
      } else {
        throw new Error("Failed to fetch tree");
      }
    } catch (err) {
      console.error("Error fetching tree:", err);
      alert("Failed to load referral tree");
    } finally {
      setLoadingTree(false);
    }
  };

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const TreeNode = ({ node, level = 0 }) => {
    const isExpanded = expandedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <div className="relative">
        <div 
          className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-white/5 transition-colors"
          style={{ marginLeft: `${level * 24}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleNode(node.id)}
              className="p-1 rounded hover:bg-white/10 transition-colors flex-shrink-0"
              style={{ color: COLORS.gold }}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <div className="w-6" />
          )}
          <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS.gold }} />
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: COLORS.text }}>
              {node.name || "N/A"}
            </p>
            <p className="text-xs" style={{ color: COLORS.text, opacity: 0.6 }}>
              {node.email}
            </p>
            <p className="text-xs" style={{ color: COLORS.text, opacity: 0.4 }}>
              ID: {node.id}
            </p>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-4 border-l pl-2" style={{ borderColor: `${COLORS.gold}30` }}>
            {node.children.map((child) => (
              <TreeNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const totalWalletAmount = users.reduce(
    (sum, user) => sum + parseFloat(user.wallet_amount || 0),
    0,
  );
  const totalTradingAmount = users.reduce(
    (sum, user) => sum + parseFloat(user.trading_wallet_amount || 0),
    0,
  );
  const activeUsers = users.filter((user) => user.status === "ok").length;
  const blockedUsers = users.filter((user) => user.status === "block").length;

  const toggleExpandUser = (userId) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  if (loading) {
    return (
      <div
        className="min-h-screen p-4 sm:p-6"
        style={{ backgroundColor: COLORS.bg }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div
              className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2"
              style={{ borderColor: COLORS.gold }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8"
      style={{ backgroundColor: COLORS.bg }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section - Fully Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1
              className="text-xl sm:text-2xl md:text-3xl font-bold"
              style={{ color: COLORS.gold }}
            >
              User Management
            </h1>
            <p
              className="text-sm sm:text-base mt-1"
              style={{ color: COLORS.text, opacity: 0.7 }}
            >
              Manage all registered users and their wallet details
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 text-sm sm:text-base hover:scale-105 active:scale-95"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                border: `1px solid ${COLORS.border}`,
                color: COLORS.gold,
              }}
            >
              <RefreshCw size={18} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards - Responsive Grid with better spacing */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-6 md:mb-8">
          <div
            className="p-4 sm:p-5 rounded-2xl transition-all hover:scale-105 duration-200"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-xs sm:text-sm"
                  style={{ color: COLORS.text, opacity: 0.7 }}
                >
                  Total Users
                </p>
                <p
                  className="text-xl sm:text-2xl md:text-3xl font-bold mt-1"
                  style={{ color: COLORS.text }}
                >
                  {users.length}
                </p>
              </div>
              <div
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(59,130,246,0.15)" }}
              >
                <Users size={20} className="sm:w-6 sm:h-6" style={{ color: COLORS.blue }} />
              </div>
            </div>
          </div>

          <div
            className="p-4 sm:p-5 rounded-2xl transition-all hover:scale-105 duration-200"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-xs sm:text-sm"
                  style={{ color: COLORS.text, opacity: 0.7 }}
                >
                  Active Users
                </p>
                <p
                  className="text-xl sm:text-2xl md:text-3xl font-bold mt-1"
                  style={{ color: COLORS.positive }}
                >
                  {activeUsers}
                </p>
              </div>
              <div
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(34,197,94,0.15)" }}
              >
                <Shield size={20} className="sm:w-6 sm:h-6" style={{ color: COLORS.positive }} />
              </div>
            </div>
          </div>

          <div
            className="p-4 sm:p-5 rounded-2xl transition-all hover:scale-105 duration-200"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-xs sm:text-sm"
                  style={{ color: COLORS.text, opacity: 0.7 }}
                >
                  Blocked Users
                </p>
                <p
                  className="text-xl sm:text-2xl md:text-3xl font-bold mt-1"
                  style={{ color: COLORS.negative }}
                >
                  {blockedUsers}
                </p>
              </div>
              <div
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(239,68,68,0.15)" }}
              >
                <ShieldOff size={20} className="sm:w-6 sm:h-6" style={{ color: COLORS.negative }} />
              </div>
            </div>
          </div>

          <div
            className="p-4 sm:p-5 rounded-2xl transition-all hover:scale-105 duration-200"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-xs sm:text-sm"
                  style={{ color: COLORS.text, opacity: 0.7 }}
                >
                  Total Balance
                </p>
                <p
                  className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 truncate"
                  style={{ color: COLORS.gold }}
                >
                  ${(totalWalletAmount + totalTradingAmount).toFixed(2)}
                </p>
              </div>
              <div
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(255,215,0,0.15)" }}
              >
                <Wallet size={20} className="sm:w-6 sm:h-6" style={{ color: COLORS.gold }} />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter - Enhanced Responsive */}
        <div
          className="p-4 sm:p-5 rounded-2xl mb-6 md:mb-8"
          style={{
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                  size={18}
                  style={{ color: COLORS.text, opacity: 0.5 }}
                />
                <input
                  type="text"
                  placeholder="Search by name, email, phone or wallet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.text,
                  }}
                />
              </div>

              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text,
                }}
              >
                <Filter size={18} />
                <span className="text-sm">Filter</span>
              </button>
            </div>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-4">
              <label
                className="text-sm"
                style={{ color: COLORS.text, opacity: 0.7 }}
              >
                Filter by Status:
              </label>
              <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
                {[
                  { value: "all", label: "All", color: COLORS.gold },
                  { value: "ok", label: "Active", color: COLORS.positive },
                  { value: "block", label: "Blocked", color: COLORS.negative },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={`px-4 py-1.5 rounded-lg text-sm transition-all ${
                      statusFilter === option.value ? "font-medium shadow-lg" : ""
                    }`}
                    style={{
                      backgroundColor:
                        statusFilter === option.value ? option.color : "transparent",
                      color: statusFilter === option.value ? "#000" : COLORS.text,
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Filters Dropdown */}
            {showMobileFilters && (
              <div
                className="lg:hidden p-4 rounded-xl animate-slideDown"
                style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
              >
                <label
                  className="text-sm block mb-3"
                  style={{ color: COLORS.text, opacity: 0.7 }}
                >
                  Filter by Status:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "all", label: "All", color: COLORS.gold },
                    { value: "ok", label: "Active", color: COLORS.positive },
                    { value: "block", label: "Blocked", color: COLORS.negative },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStatusFilter(option.value);
                        setShowMobileFilters(false);
                      }}
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${
                        statusFilter === option.value ? "font-medium" : ""
                      }`}
                      style={{
                        backgroundColor:
                          statusFilter === option.value
                            ? option.color
                            : "rgba(255,255,255,0.05)",
                        color: statusFilter === option.value ? "#000" : COLORS.text,
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Table View - Enhanced */}
        <div className="hidden xl:block overflow-x-auto">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div
              className="grid grid-cols-14 p-4 text-sm font-medium"
              style={{
                borderBottom: `1px solid ${COLORS.border}`,
                backgroundColor: "rgba(255,255,255,0.03)",
              }}
            >
              <div className="col-span-3 pl-3" style={{ color: COLORS.text }}>User</div>
              <div className="col-span-3" style={{ color: COLORS.text }}>Contact</div>
              <div className="col-span-2" style={{ color: COLORS.text }}>Wallet</div>
              <div className="col-span-2" style={{ color: COLORS.text }}>Amounts</div>
              <div className="col-span-2" style={{ color: COLORS.text }}>Status</div>
              <div className="col-span-1" style={{ color: COLORS.text }}>KYC</div>
              <div className="col-span-1" style={{ color: COLORS.text }}>Commission</div>
            </div>

            {currentUsers.length === 0 ? (
              <div className="p-12 text-center">
                <Users size={64} className="mx-auto mb-4" style={{ color: COLORS.text, opacity: 0.3 }} />
                <p style={{ color: COLORS.text, opacity: 0.7 }}>No users found</p>
              </div>
            ) : (
              currentUsers.map((user) => (
                <div
                  key={user.id}
                  className="grid grid-cols-14 p-4 hover:bg-white/5 transition-all duration-200 border-b"
                  style={{ borderColor: COLORS.border }}
                >
                  <div className="col-span-3 pl-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => fetchUserTree(user.id)}
                        className="hover:scale-110 transition-transform"
                        title="View Referral Tree"
                      >
                        <Eye size={16} style={{ color: COLORS.gold }} />
                      </button>
                      <div>
                        <p style={{ color: COLORS.text }} className="font-medium">
                          {user.name || "N/A"} {getGenderSymbol(user.gender)}
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

                  <div className="col-span-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail size={12} style={{ color: COLORS.text, opacity: 0.6 }} />
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <span className="text-sm truncate" style={{ color: COLORS.text }}>
                          {user.email}
                        </span>
                        <button
                          onClick={() => copyToClipboard(user.email, `email-${user.id}`)}
                          className="p-0.5 hover:bg-white/10 rounded transition-colors"
                          style={{ color: COLORS.text, opacity: 0.6 }}
                        >
                          {copiedField === `email-${user.id}` ? (
                            <Check size={10} style={{ color: COLORS.positive }} />
                          ) : (
                            <Copy size={10} />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={12} style={{ color: COLORS.text, opacity: 0.6 }} />
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <span className="text-sm truncate" style={{ color: COLORS.text }}>
                          {user.country_code} {user.phone}
                        </span>
                        <button
                          onClick={() => copyToClipboard(`${user.country_code}${user.phone}`, `phone-${user.id}`)}
                          className="p-0.5 hover:bg-white/10 rounded transition-colors"
                          style={{ color: COLORS.text, opacity: 0.6 }}
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

                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <Globe size={12} style={{ color: COLORS.text, opacity: 0.6 }} />
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <span className="text-sm font-mono truncate" style={{ color: COLORS.text }}>
                          {user.wallet_address ? `${user.wallet_address.substring(0, 10)}...` : "N/A"}
                        </span>
                        {user.wallet_address && (
                          <button
                            onClick={() => copyToClipboard(user.wallet_address, `wallet-${user.id}`)}
                            className="p-0.5 hover:bg-white/10 rounded transition-colors"
                            style={{ color: COLORS.text, opacity: 0.6 }}
                          >
                            {copiedField === `wallet-${user.id}` ? (
                              <Check size={10} style={{ color: COLORS.positive }} />
                            ) : (
                              <Copy size={10} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs mt-1 pl-4" style={{ color: COLORS.text, opacity: 0.6 }}>
                      Joined: {formatDate(user.created_at)}
                    </p>
                  </div>

                  <div className="col-span-2 space-y-2 pl-2">
                    {editingUserId === user.id ? (
                      <>
                        <div className="flex items-center gap-2">
                          <Wallet size={12} style={{ color: COLORS.gold, opacity: 0.8 }} />
                          <input
                            type="number"
                            step="0.01"
                            value={editingAmounts[user.id]?.wallet_amount ?? (user.wallet_amount || 0)}
                            onChange={(e) => setEditingAmounts((prev) => ({
                              ...prev,
                              [user.id]: {
                                wallet_amount: e.target.value,
                                trading_wallet_amount: prev[user.id]?.trading_wallet_amount ?? (user.trading_wallet_amount || 0),
                              },
                            }))}
                            className="w-28 px-2 py-1 rounded text-sm focus:outline-none focus:ring-2"
                            style={{
                              backgroundColor: "rgba(255,255,255,0.05)",
                              border: `1px solid ${COLORS.border}`,
                              color: COLORS.text,
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp size={12} style={{ color: COLORS.purple, opacity: 0.8 }} />
                          <input
                            type="number"
                            step="0.01"
                            value={editingAmounts[user.id]?.trading_wallet_amount ?? (user.trading_wallet_amount || 0)}
                            onChange={(e) => setEditingAmounts((prev) => ({
                              ...prev,
                              [user.id]: {
                                wallet_amount: prev[user.id]?.wallet_amount ?? (user.wallet_amount || 0),
                                trading_wallet_amount: e.target.value,
                              },
                            }))}
                            className="w-28 px-2 py-1 rounded text-sm focus:outline-none focus:ring-2"
                            style={{
                              backgroundColor: "rgba(255,255,255,0.05)",
                              border: `1px solid ${COLORS.border}`,
                              color: COLORS.text,
                            }}
                          />
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={async () => {
                              await updateUserAmounts(user.id);
                              setEditingUserId(null);
                            }}
                            disabled={savingAmount === user.id}
                            className="px-3 py-1 rounded-lg text-xs font-medium transition-all hover:scale-105"
                            style={{ backgroundColor: COLORS.gold, color: "#000" }}
                          >
                            {savingAmount === user.id ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="px-3 py-1 rounded-lg text-xs transition-all hover:bg-white/10"
                            style={{ backgroundColor: "rgba(255,255,255,0.08)", color: COLORS.text }}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <Wallet size={12} style={{ color: COLORS.gold, opacity: 0.8 }} />
                          <p className="text-sm font-medium" style={{ color: COLORS.text }}>
                            ${(parseFloat(user.wallet_amount) || 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp size={12} style={{ color: COLORS.purple, opacity: 0.8 }} />
                          <p className="text-sm" style={{ color: COLORS.text }}>
                            ${(parseFloat(user.trading_wallet_amount) || 0).toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setEditingUserId(user.id);
                            setEditingAmounts((prev) => ({
                              ...prev,
                              [user.id]: {
                                wallet_amount: user.wallet_amount || 0,
                                trading_wallet_amount: user.trading_wallet_amount || 0,
                              },
                            }));
                          }}
                          className="px-3 py-1 rounded-lg text-xs font-medium transition-all hover:scale-105 mt-1"
                          style={{
                            backgroundColor: "rgba(255,215,0,0.15)",
                            color: COLORS.gold,
                            border: `1px solid ${COLORS.gold}30`,
                          }}
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </div>

                  <div className="col-span-2 flex items-center gap-2">
                    <button
                      onClick={() => toggleUserStatus(user.id, user.status)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 hover:scale-105 ${
                        user.status === "ok"
                          ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      }`}
                    >
                      {user.status === "ok" ? <Shield size={10} /> : <ShieldOff size={10} />}
                      {user.status === "ok" ? "Active" : "Blocked"}
                    </button>
                  </div>

                  <div className="col-span-1 flex items-center gap-2">
                    <button
                      onClick={() => toggleKycVerification(user.id, user.kyc_verify)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                        user.kyc_verify === true ? "bg-blue-500" : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          user.kyc_verify === true ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="col-span-1 flex items-center gap-2">
                    <button
                      onClick={() => toggleCommissionStatus(user.id, user.commission_enabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                        user.commission_enabled === true ? "bg-green-500" : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          user.commission_enabled === true ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                    <span className="text-xs font-medium" style={{ color: COLORS.text, opacity: 0.7 }}>
                      {user.commission_enabled === true ? "On" : "Off"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tablet View (lg) */}
        <div className="hidden lg:block xl:hidden">
          <div className="space-y-4">
            {currentUsers.length === 0 ? (
              <div className="p-12 text-center rounded-2xl" style={{ backgroundColor: COLORS.card }}>
                <Users size={64} className="mx-auto mb-4" style={{ color: COLORS.text, opacity: 0.3 }} />
                <p style={{ color: COLORS.text, opacity: 0.7 }}>No users found</p>
              </div>
            ) : (
              currentUsers.map((user) => (
                <div
                  key={user.id}
                  className="rounded-2xl overflow-hidden transition-all hover:scale-[1.01]"
                  style={{
                    backgroundColor: COLORS.card,
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <div
                    className="p-4 cursor-pointer flex items-center justify-between"
                    onClick={() => toggleExpandUser(user.id)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchUserTree(user.id);
                        }}
                        className="hover:scale-110 transition-transform"
                      >
                        <Eye size={18} style={{ color: COLORS.gold }} />
                      </button>
                      <div className="flex-1">
                        <p className="font-medium" style={{ color: COLORS.text }}>
                          {user.name || "N/A"} {getGenderSymbol(user.gender)}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: COLORS.text, opacity: 0.6 }}>
                          ID: {user.id}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleUserStatus(user.id, user.status);
                        }}
                        className={`px-2 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                          user.status === "ok"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {user.status === "ok" ? <Shield size={10} /> : <ShieldOff size={10} />}
                      </button>
                    </div>
                    {expandedUserId === user.id ? (
                      <ChevronRight size={18} className="transform rotate-90" style={{ color: COLORS.text }} />
                    ) : (
                      <ChevronRight size={18} style={{ color: COLORS.text }} />
                    )}
                  </div>

                  {expandedUserId === user.id && (
                    <div className="p-4 border-t space-y-3" style={{ borderColor: COLORS.border }}>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs block mb-1" style={{ color: COLORS.text, opacity: 0.6 }}>
                            Email
                          </label>
                          <div className="flex items-center gap-2">
                            <Mail size={14} style={{ color: COLORS.text, opacity: 0.6 }} />
                            <span className="text-sm flex-1 break-all" style={{ color: COLORS.text }}>
                              {user.email}
                            </span>
                            <button onClick={() => copyToClipboard(user.email, `tablet-email-${user.id}`)}>
                              {copiedField === `tablet-email-${user.id}` ? (
                                <Check size={12} style={{ color: COLORS.positive }} />
                              ) : (
                                <Copy size={12} style={{ color: COLORS.text }} />
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs block mb-1" style={{ color: COLORS.text, opacity: 0.6 }}>
                            Phone
                          </label>
                          <div className="flex items-center gap-2">
                            <Phone size={14} style={{ color: COLORS.text, opacity: 0.6 }} />
                            <span className="text-sm flex-1" style={{ color: COLORS.text }}>
                              {user.country_code} {user.phone}
                            </span>
                            <button onClick={() => copyToClipboard(`${user.country_code}${user.phone}`, `tablet-phone-${user.id}`)}>
                              {copiedField === `tablet-phone-${user.id}` ? (
                                <Check size={12} style={{ color: COLORS.positive }} />
                              ) : (
                                <Copy size={12} style={{ color: COLORS.text }} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs block mb-1" style={{ color: COLORS.text, opacity: 0.6 }}>
                          Wallet Address
                        </label>
                        <div className="flex items-center gap-2">
                          <Globe size={14} style={{ color: COLORS.text, opacity: 0.6 }} />
                          <span className="text-sm font-mono flex-1 break-all" style={{ color: COLORS.text }}>
                            {user.wallet_address || "N/A"}
                          </span>
                          {user.wallet_address && (
                            <button onClick={() => copyToClipboard(user.wallet_address, `tablet-wallet-${user.id}`)}>
                              {copiedField === `tablet-wallet-${user.id}` ? (
                                <Check size={12} style={{ color: COLORS.positive }} />
                              ) : (
                                <Copy size={12} style={{ color: COLORS.text }} />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="text-xs block mb-1" style={{ color: COLORS.text, opacity: 0.6 }}>
                            Wallet Amount
                          </label>
                          <div className="flex items-center gap-2">
                            <Wallet size={14} style={{ color: COLORS.gold }} />
                            <span className="text-sm font-medium" style={{ color: COLORS.text }}>
                              ${(parseFloat(user.wallet_amount) || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs block mb-1" style={{ color: COLORS.text, opacity: 0.6 }}>
                            Strategy Balance
                          </label>
                          <div className="flex items-center gap-2">
                            <TrendingUp size={14} style={{ color: COLORS.purple }} />
                            <span className="text-sm font-medium" style={{ color: COLORS.text }}>
                              ${(parseFloat(user.trading_wallet_amount) || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color: COLORS.text, opacity: 0.6 }}>KYC:</span>
                            <button
                              onClick={() => toggleKycVerification(user.id, user.kyc_verify)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                                user.kyc_verify === true ? "bg-blue-500" : "bg-gray-600"
                              }`}
                            >
                              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                                user.kyc_verify === true ? "translate-x-5" : "translate-x-0.5"
                              }`} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color: COLORS.text, opacity: 0.6 }}>Commission:</span>
                            <button
                              onClick={() => toggleCommissionStatus(user.id, user.commission_enabled)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                                user.commission_enabled === true ? "bg-green-500" : "bg-gray-600"
                              }`}
                            >
                              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                                user.commission_enabled === true ? "translate-x-5" : "translate-x-0.5"
                              }`} />
                            </button>
                          </div>
                        </div>
                        <div className="text-xs" style={{ color: COLORS.text, opacity: 0.6 }}>
                          Joined: {formatDate(user.created_at)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden space-y-3">
          {currentUsers.length === 0 ? (
            <div
              className="p-8 text-center rounded-2xl"
              style={{ backgroundColor: COLORS.card }}
            >
              <Users size={48} className="mx-auto mb-4" style={{ color: COLORS.text, opacity: 0.3 }} />
              <p style={{ color: COLORS.text, opacity: 0.7 }}>No users found</p>
            </div>
          ) : (
            currentUsers.map((user) => (
              <div
                key={user.id}
                className="rounded-2xl overflow-hidden transition-all"
                style={{
                  backgroundColor: COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <div
                  className="p-4 cursor-pointer flex items-center justify-between"
                  onClick={() => toggleExpandUser(user.id)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchUserTree(user.id);
                      }}
                      className="hover:scale-110 transition-transform"
                    >
                      <Eye size={18} style={{ color: COLORS.gold }} />
                    </button>
                    <div className="flex-1">
                      <p className="font-medium" style={{ color: COLORS.text }}>
                        {user.name || "N/A"} {getGenderSymbol(user.gender)}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: COLORS.text, opacity: 0.6 }}>
                        ID: {user.id}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleUserStatus(user.id, user.status);
                      }}
                      className={`px-2 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                        user.status === "ok"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {user.status === "ok" ? <Shield size={10} /> : <ShieldOff size={10} />}
                      <span className="hidden xs:inline">{user.status === "ok" ? "Active" : "Blocked"}</span>
                    </button>
                  </div>
                  {expandedUserId === user.id ? (
                    <ChevronRight size={18} className="transform rotate-90" style={{ color: COLORS.text }} />
                  ) : (
                    <ChevronRight size={18} style={{ color: COLORS.text }} />
                  )}
                </div>

                {expandedUserId === user.id && (
                  <div className="p-4 space-y-3 border-t" style={{ borderColor: COLORS.border }}>
                    <div>
                      <label className="text-xs block mb-1" style={{ color: COLORS.text, opacity: 0.6 }}>
                        Email
                      </label>
                      <div className="flex items-center gap-2">
                        <Mail size={14} style={{ color: COLORS.text, opacity: 0.6 }} />
                        <span className="text-sm flex-1 break-all" style={{ color: COLORS.text }}>
                          {user.email}
                        </span>
                        <button onClick={() => copyToClipboard(user.email, `mobile-email-${user.id}`)} className="p-1">
                          {copiedField === `mobile-email-${user.id}` ? (
                            <Check size={12} style={{ color: COLORS.positive }} />
                          ) : (
                            <Copy size={12} style={{ color: COLORS.text }} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs block mb-1" style={{ color: COLORS.text, opacity: 0.6 }}>
                        Phone
                      </label>
                      <div className="flex items-center gap-2">
                        <Phone size={14} style={{ color: COLORS.text, opacity: 0.6 }} />
                        <span className="text-sm flex-1" style={{ color: COLORS.text }}>
                          {user.country_code} {user.phone}
                        </span>
                        <button onClick={() => copyToClipboard(`${user.country_code}${user.phone}`, `mobile-phone-${user.id}`)} className="p-1">
                          {copiedField === `mobile-phone-${user.id}` ? (
                            <Check size={12} style={{ color: COLORS.positive }} />
                          ) : (
                            <Copy size={12} style={{ color: COLORS.text }} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs block mb-1" style={{ color: COLORS.text, opacity: 0.6 }}>
                        Wallet Address
                      </label>
                      <div className="flex items-center gap-2">
                        <Globe size={14} style={{ color: COLORS.text, opacity: 0.6 }} />
                        <span className="text-sm font-mono flex-1 break-all" style={{ color: COLORS.text }}>
                          {user.wallet_address || "N/A"}
                        </span>
                        {user.wallet_address && (
                          <button onClick={() => copyToClipboard(user.wallet_address, `mobile-wallet-${user.id}`)} className="p-1">
                            {copiedField === `mobile-wallet-${user.id}` ? (
                              <Check size={12} style={{ color: COLORS.positive }} />
                            ) : (
                              <Copy size={12} style={{ color: COLORS.text }} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="text-xs block mb-1" style={{ color: COLORS.text, opacity: 0.6 }}>
                          Wallet Amount
                        </label>
                        {editingUserId === user.id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editingAmounts[user.id]?.wallet_amount ?? (user.wallet_amount || 0)}
                            onChange={(e) => setEditingAmounts((prev) => ({
                              ...prev,
                              [user.id]: {
                                wallet_amount: e.target.value,
                                trading_wallet_amount: prev[user.id]?.trading_wallet_amount ?? (user.trading_wallet_amount || 0),
                              },
                            }))}
                            className="w-full px-2 py-1.5 rounded-lg text-sm"
                            style={{
                              backgroundColor: "rgba(255,255,255,0.05)",
                              border: `1px solid ${COLORS.border}`,
                              color: COLORS.text,
                            }}
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Wallet size={14} style={{ color: COLORS.gold }} />
                            <span className="text-sm font-medium" style={{ color: COLORS.text }}>
                              ${(parseFloat(user.wallet_amount) || 0).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-xs block mb-1" style={{ color: COLORS.text, opacity: 0.6 }}>
                          Strategy Balance
                        </label>
                        {editingUserId === user.id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editingAmounts[user.id]?.trading_wallet_amount ?? (user.trading_wallet_amount || 0)}
                            onChange={(e) => setEditingAmounts((prev) => ({
                              ...prev,
                              [user.id]: {
                                wallet_amount: prev[user.id]?.wallet_amount ?? (user.wallet_amount || 0),
                                trading_wallet_amount: e.target.value,
                              },
                            }))}
                            className="w-full px-2 py-1.5 rounded-lg text-sm"
                            style={{
                              backgroundColor: "rgba(255,255,255,0.05)",
                              border: `1px solid ${COLORS.border}`,
                              color: COLORS.text,
                            }}
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <TrendingUp size={14} style={{ color: COLORS.purple }} />
                            <span className="text-sm font-medium" style={{ color: COLORS.text }}>
                              ${(parseFloat(user.trading_wallet_amount) || 0).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {editingUserId === user.id ? (
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={async () => {
                            await updateUserAmounts(user.id);
                            setEditingUserId(null);
                          }}
                          disabled={savingAmount === user.id}
                          className="flex-1 py-2 rounded-xl font-medium transition-all"
                          style={{ backgroundColor: COLORS.gold, color: "#000" }}
                        >
                          {savingAmount === user.id ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          onClick={() => setEditingUserId(null)}
                          className="flex-1 py-2 rounded-xl font-medium transition-all"
                          style={{ backgroundColor: "rgba(255,255,255,0.08)", color: COLORS.text }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingUserId(user.id);
                          setEditingAmounts((prev) => ({
                            ...prev,
                            [user.id]: {
                              wallet_amount: user.wallet_amount || 0,
                              trading_wallet_amount: user.trading_wallet_amount || 0,
                            },
                          }));
                        }}
                        className="w-full py-2 rounded-xl font-medium transition-all hover:scale-105"
                        style={{
                          backgroundColor: "rgba(255,215,0,0.15)",
                          color: COLORS.gold,
                          border: `1px solid ${COLORS.gold}30`,
                        }}
                      >
                        Edit Amounts
                      </button>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{ color: COLORS.text, opacity: 0.6 }}>KYC:</span>
                          <button
                            onClick={() => toggleKycVerification(user.id, user.kyc_verify)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                              user.kyc_verify === true ? "bg-blue-500" : "bg-gray-600"
                            }`}
                          >
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                              user.kyc_verify === true ? "translate-x-5" : "translate-x-0.5"
                            }`} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{ color: COLORS.text, opacity: 0.6 }}>Commission:</span>
                          <button
                            onClick={() => toggleCommissionStatus(user.id, user.commission_enabled)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                              user.commission_enabled === true ? "bg-green-500" : "bg-gray-600"
                            }`}
                          >
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                              user.commission_enabled === true ? "translate-x-5" : "translate-x-0.5"
                            }`} />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs" style={{ color: COLORS.text, opacity: 0.6 }}>
                        Joined: {formatDate(user.created_at)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination - Responsive */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 md:mt-8">
            <p className="text-xs sm:text-sm order-2 sm:order-1" style={{ color: COLORS.text, opacity: 0.7 }}>
              Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
            </p>
            <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2 flex-wrap justify-center">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg disabled:opacity-30 transition-all hover:scale-105"
                style={{ backgroundColor: "rgba(255,255,255,0.05)", color: COLORS.text }}
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  if (totalPages <= 5) return true;
                  return Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages;
                })
                .map((page, index, array) => {
                  if (index > 0 && page - array[index - 1] > 1) {
                    return (
                      <span key={`ellipsis-${page}`} className="px-2 text-sm" style={{ color: COLORS.text }}>
                        ...
                      </span>
                    );
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-all text-sm font-medium hover:scale-105 ${
                        currentPage === page ? "shadow-lg" : ""
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
                className="p-2 rounded-lg disabled:opacity-30 transition-all hover:scale-105"
                style={{ backgroundColor: "rgba(255,255,255,0.05)", color: COLORS.text }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div
            className="p-4 rounded-2xl mt-6 flex items-center gap-3 animate-shake"
            style={{ backgroundColor: "rgba(239,68,68,0.1)", border: `1px solid ${COLORS.negative}40` }}
          >
            <div className="text-red-400 text-sm sm:text-base">⚠️</div>
            <div>
              <p className="font-medium text-sm sm:text-base" style={{ color: COLORS.negative }}>
                Error loading users
              </p>
              <p className="text-xs sm:text-sm mt-0.5" style={{ color: COLORS.text, opacity: 0.7 }}>
                {error}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Status Change Confirmation Modal */}
      {showStatusConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div
            className="w-full max-w-md rounded-2xl mx-4 transform animate-slideUp"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(245,158,11,0.2)" }}
                >
                  <AlertTriangle size={18} style={{ color: "#F59E0B" }} />
                </div>
                <h2 className="text-lg sm:text-xl font-bold" style={{ color: COLORS.text }}>
                  Confirm Status Change
                </h2>
              </div>

              <p className="text-sm sm:text-base mb-6" style={{ color: COLORS.text, opacity: 0.8 }}>
                Are you sure you want to{" "}
                {showStatusConfirm.currentStatus === "ok" ? "block" : "unblock"} this user? This action will{" "}
                {showStatusConfirm.currentStatus === "ok" ? "prevent" : "allow"} them from accessing their account.
              </p>

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => setShowStatusConfirm(null)}
                  className="px-4 py-2 rounded-xl transition-all hover:scale-105 text-sm sm:text-base"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)", color: COLORS.text }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusChange}
                  className="px-4 py-2 rounded-xl font-medium transition-all hover:scale-105 text-sm sm:text-base"
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

      {/* Referral Tree Modal */}
      {treeModalOpen && treeData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn">
          <div
            className="w-full max-w-2xl rounded-2xl my-4 max-h-[90vh] overflow-y-auto transform animate-slideUp"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div
              className="p-5 sm:p-6 border-b sticky top-0 z-10"
              style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold" style={{ color: COLORS.gold }}>
                  Referral Tree
                </h2>
                <button
                  onClick={() => {
                    setTreeModalOpen(false);
                    setTreeData(null);
                    setExpandedNodes({});
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 transition-all hover:scale-110"
                  style={{ color: COLORS.text }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {loadingTree ? (
              <div className="p-8 text-center">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 mx-auto"
                  style={{ borderColor: COLORS.gold }}
                />
                <p className="mt-3 text-sm" style={{ color: COLORS.text, opacity: 0.7 }}>
                  Loading referral tree...
                </p>
              </div>
            ) : (
              <div className="p-5 sm:p-6">
                <div
                  className="p-4 rounded-xl mb-6"
                  style={{ backgroundColor: "rgba(255,215,0,0.08)", border: `1px solid ${COLORS.gold}30` }}
                >
                  <p className="text-xs uppercase tracking-wide mb-1" style={{ color: COLORS.gold, opacity: 0.7 }}>
                    Current User
                  </p>
                  <p className="text-base font-bold" style={{ color: COLORS.text }}>
                    {treeData.name || "N/A"}
                  </p>
                  <p className="text-sm" style={{ color: COLORS.text, opacity: 0.7 }}>
                    {treeData.email}
                  </p>
                  
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: `${COLORS.gold}20` }}>
                    <p className="text-xs mb-1" style={{ color: COLORS.gold, opacity: 0.7 }}>
                      Referred By (Parent)
                    </p>
                    {treeData.parent_name ? (
                      <>
                        <p className="text-sm font-medium" style={{ color: COLORS.text }}>
                          {treeData.parent_name}
                        </p>
                        <p className="text-xs" style={{ color: COLORS.text, opacity: 0.6 }}>
                          {treeData.parent_email}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm" style={{ color: COLORS.text, opacity: 0.5 }}>
                        No parent (Top level user)
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide mb-3" style={{ color: COLORS.gold, opacity: 0.7 }}>
                    Referral Network
                  </p>
                  
                  {treeData.children && treeData.children.length > 0 ? (
                    <div className="space-y-1 max-h-96 overflow-y-auto">
                      {treeData.children.map((child) => (
                        <TreeNode key={child.id} node={child} level={0} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p style={{ color: COLORS.text, opacity: 0.5 }}>
                        No referrals yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-shake { animation: shake 0.3s ease-out; }
      `}</style>
    </div>
  );
}