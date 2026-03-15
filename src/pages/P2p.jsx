import React, { useState, useEffect } from "react";
import { 
  Edit, Search, Check, X, Eye, Filter, 
  ChevronDown, ChevronUp, Clock, Users, 
  DollarSign, ShoppingBag, RefreshCw,
  ChevronLeft, ChevronRight
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
};

export default function P2PAdmin() {
  const [penaltyAmount, setPenaltyAmount] = useState(10);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("listings");
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const API_BASE = "http://localhost:5000/api";

  const [allData, setAllData] = useState({
    p2p_sell_listings: [],
    p2p_buy_requests: [],
    p2p_trade_history: [],
    users: [],
    notifications: [],
  });
  const [loading, setLoading] = useState(false);

  // Fetch all data
  useEffect(() => {
    fetchAllData();
    fetchPenaltyAmount();
    fetchBuyRequests();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/admin/all-data`);
      const response = await res.json();
      
      if (response.success) {
        setAllData(prev => ({
          ...prev,
          ...response.data,
          p2p_sell_listings: response.data.p2p_sell_listings || []
        }));
      }
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBuyRequests = async () => {
    try {
      const res = await fetch(`${API_BASE}/p2p/admin/buy-requests`);
      const data = await res.json();
      if (data.success) {
        setAllData(prev => ({
          ...prev,
          p2p_buy_requests: data.requests || []
        }));
      }
    } catch (err) {
      console.error("Failed to load buy requests", err);
    }
  };

  const fetchPenaltyAmount = async () => {
    try {
      const res = await fetch(`${API_BASE}/p2p/get-penalty`);
      const data = await res.json();
      setPenaltyAmount(data.penalty_amount || 10);
    } catch {
      setPenaltyAmount(10);
    }
  };

  const updatePenaltyAmount = async () => {
    if (!editValue || isNaN(editValue) || editValue <= 0) {
      alert("Enter valid amount");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/p2p/set-penalty`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          penalty_amount: Number(editValue),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to update");
        return;
      }

      setPenaltyAmount(Number(editValue));
      setIsEditing(false);
    } catch {
      alert("Failed to update penalty");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "completed":
        return COLORS.green;
      case "pending":
        return COLORS.gold;
      case "cancelled":
      case "rejected":
        return COLORS.red;
      case "paid":
        return COLORS.blue;
      case "expired":
        return COLORS.orange;
      default:
        return COLORS.text;
    }
  };

  const formatNumber = (value) => {
    if (!value && value !== 0) return "0.00";
    const num = parseFloat(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case "bank":
        return "🏦";
      case "upi":
        return "📱";
      case "address":
        return "📍";
      default:
        return "💳";
    }
  };

  // Filter listings with search and status
  const getFilteredListings = () => {
    if (!allData.p2p_sell_listings) return [];
    
    return allData.p2p_sell_listings.filter((listing) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        String(listing.id).includes(q) ||
        String(listing.user_id).includes(q) ||
        (listing.coin_name || "").toLowerCase().includes(q) ||
        (listing.payment_method || "").toLowerCase().includes(q) ||
        (listing.description || "").toLowerCase().includes(q);
      
      const matchesStatus = statusFilter === "all" || 
        (listing.status || "active").toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });
  };

  // Filter buy requests
  const getFilteredBuyRequests = () => {
    if (!allData.p2p_buy_requests) return [];
    
    return allData.p2p_buy_requests.filter((request) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        String(request.id).includes(q) ||
        String(request.listing_id || "").includes(q) ||
        String(request.buyer_id || "").includes(q) ||
        String(request.seller_id || "").includes(q);
      
      const matchesStatus = statusFilter === "all" || 
        (request.status || "").toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });
  };

  // Filter trade history
  const getFilteredTradeHistory = () => {
    if (!allData.p2p_trade_history) return [];
    
    return allData.p2p_trade_history.filter((trade) => {
      const q = searchQuery.toLowerCase();
      return (
        String(trade.id).includes(q) ||
        String(trade.listing_id || "").includes(q) ||
        String(trade.buyer_id || "").includes(q) ||
        String(trade.seller_id || "").includes(q)
      );
    });
  };

  // Get current page items
  const getCurrentPageItems = (items) => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return items.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Calculate stats
  const filteredListings = getFilteredListings();
  const filteredBuyRequests = getFilteredBuyRequests();
  const filteredTradeHistory = getFilteredTradeHistory();
  
  const currentListings = getCurrentPageItems(filteredListings);
  const currentBuyRequests = getCurrentPageItems(filteredBuyRequests);
  const currentTradeHistory = getCurrentPageItems(filteredTradeHistory);

  const totalPages = Math.ceil(
    (activeTab === "listings" ? filteredListings.length :
     activeTab === "requests" ? filteredBuyRequests.length :
     filteredTradeHistory.length) / itemsPerPage
  );

  const stats = {
    totalListings: allData.p2p_sell_listings?.length || 0,
    activeListings: allData.p2p_sell_listings?.filter(l => l.status === "active").length || 0,
    completedListings: allData.p2p_sell_listings?.filter(l => l.status === "completed").length || 0,
    totalRequests: allData.p2p_buy_requests?.length || 0,
    pendingRequests: allData.p2p_buy_requests?.filter(r => r.status === "pending").length || 0,
    totalVolume: allData.p2p_trade_history?.reduce((sum, t) => {
      const total = parseFloat(t.total);
      return sum + (isNaN(total) ? 0 : total);
    }, 0) || 0,
  };

  // Payment Details Modal
  const PaymentDetailsModal = ({ details, onClose }) => {
    if (!details) return null;

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <div
          className="w-full max-w-md rounded-2xl p-6"
          style={{
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold" style={{ color: COLORS.text }}>
              Payment Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              style={{ color: COLORS.text }}
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm opacity-70 mb-1" style={{ color: COLORS.text }}>
                Payment Method
              </div>
              <div className="text-lg font-medium flex items-center gap-2" style={{ color: COLORS.blue }}>
                {getPaymentMethodIcon(details.payment_method)}
                {(details.payment_method || "N/A").toUpperCase()}
              </div>
            </div>

            {details.bank_details && (
              <div>
                <div className="text-sm opacity-70 mb-1" style={{ color: COLORS.text }}>
                  Bank Details
                </div>
                <div className="text-sm p-3 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  {details.bank_details}
                </div>
              </div>
            )}

            {details.upi_id && (
              <div>
                <div className="text-sm opacity-70 mb-1" style={{ color: COLORS.text }}>
                  UPI ID
                </div>
                <div className="text-sm text-amber-50 p-3 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  {details.upi_id}
                </div>
              </div>
            )}

            {details.wallet_address && (
              <div>
                <div className="text-sm opacity-70 mb-1" style={{ color: COLORS.text }}>
                  Wallet Address
                </div>
                <div className="text-sm p-3 text-amber-50 rounded-lg font-mono break-all" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  {details.wallet_address}
                </div>
              </div>
            )}

            {details.description && (
              <div>
                <div className="text-sm opacity-70 mb-1" style={{ color: COLORS.text }}>
                  Description
                </div>
                <div className="text-sm text-amber-50 p-3 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  {details.description}
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full mt-4 py-3 rounded-lg font-medium"
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
    );
  };

  // Pagination Component
  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 py-4 border-t" style={{ borderColor: COLORS.border }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          style={{ color: COLORS.text }}
        >
          <ChevronLeft size={20} />
        </button>
        
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => onPageChange(i + 1)}
            className="w-10 h-10 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: currentPage === i + 1 ? COLORS.gold : "transparent",
              color: currentPage === i + 1 ? "#000" : COLORS.text,
              border: currentPage === i + 1 ? "none" : `1px solid ${COLORS.border}`,
            }}
          >
            {i + 1}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          style={{ color: COLORS.text }}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen p-4 md:p-6"
      style={{ backgroundColor: COLORS.bg }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1
                className="text-2xl md:text-3xl font-bold"
                style={{ color: COLORS.gold }}
              >
                P2P Trading Management
              </h1>
              <p
                className="text-sm mt-1"
                style={{ color: COLORS.text, opacity: 0.7 }}
              >
                Manage P2P listings, buy requests, and penalty settings
              </p>
            </div>
            
            <button
              onClick={fetchAllData}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
              style={{ color: COLORS.text, border: `1px solid ${COLORS.border}` }}
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Penalty Settings Card */}
          <div
            className="rounded-2xl p-5 mb-4"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2
                  className="text-lg font-semibold"
                  style={{ color: COLORS.text }}
                >
                  P2P Trading Penalty Deduction
                </h2>
                <p className="text-sm opacity-70" style={{ color: COLORS.text }}>
                  Amount deducted from users for failed/cancelled trades
                </p>
              </div>

              <div className="flex items-center gap-3">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="px-3 py-2 rounded-lg w-24"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: `1px solid ${COLORS.border}`,
                        color: COLORS.text,
                      }}
                      placeholder="Amount"
                      min="1"
                      step="1"
                    />
                    <button
                      onClick={updatePenaltyAmount}
                      className="px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
                      style={{
                        backgroundColor: COLORS.green,
                        color: "#FFFFFF",
                      }}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditValue("");
                      }}
                      className="px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        color: COLORS.text,
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      className="p-3 rounded-lg text-center"
                      style={{
                        backgroundColor: "rgba(139, 92, 246, 0.1)",
                        border: `1px solid ${COLORS.purple}`,
                        minWidth: "80px",
                      }}
                    >
                      <div
                        className="text-sm opacity-70"
                        style={{ color: COLORS.text }}
                      >
                        Penalty
                      </div>
                      <div
                        className="text-xl font-bold"
                        style={{ color: COLORS.purple }}
                      >
                        ${penaltyAmount}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setEditValue(penaltyAmount.toString());
                      }}
                      className="p-2.5 rounded-lg hover:bg-white/10 transition-colors"
                      style={{ color: COLORS.text }}
                    >
                      <Edit size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div
              className="rounded-xl p-4"
              style={{
                backgroundColor: COLORS.card,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <ShoppingBag size={20} style={{ color: COLORS.blue }} />
                <div className="text-sm opacity-70" style={{ color: COLORS.text }}>
                  Total Listings
                </div>
              </div>
              <div className="text-2xl font-bold" style={{ color: COLORS.blue }}>
                {stats.totalListings}
              </div>
              <div className="text-xs mt-1" style={{ color: COLORS.text, opacity: 0.6 }}>
                {stats.activeListings} active · {stats.completedListings} completed
              </div>
            </div>

            <div
              className="rounded-xl p-4"
              style={{
                backgroundColor: COLORS.card,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <Users size={20} style={{ color: COLORS.green }} />
                <div className="text-sm opacity-70" style={{ color: COLORS.text }}>
                  Buy Requests
                </div>
              </div>
              <div className="text-2xl font-bold" style={{ color: COLORS.green }}>
                {stats.totalRequests}
              </div>
              <div className="text-xs mt-1" style={{ color: COLORS.text, opacity: 0.6 }}>
                {stats.pendingRequests} pending
              </div>
            </div>

            <div
              className="rounded-xl p-4"
              style={{
                backgroundColor: COLORS.card,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <DollarSign size={20} style={{ color: COLORS.gold }} />
                <div className="text-sm opacity-70" style={{ color: COLORS.text }}>
                  Trading Volume
                </div>
              </div>
              <div className="text-2xl font-bold" style={{ color: COLORS.gold }}>
                ${stats.totalVolume.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </div>
              <div className="text-xs mt-1" style={{ color: COLORS.text, opacity: 0.6 }}>
                Total completed trades
              </div>
            </div>

            <div
              className="rounded-xl p-4"
              style={{
                backgroundColor: COLORS.card,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <Clock size={20} style={{ color: COLORS.purple }} />
                <div className="text-sm opacity-70" style={{ color: COLORS.text }}>
                  Active Now
                </div>
              </div>
              <div className="text-2xl font-bold" style={{ color: COLORS.purple }}>
                {stats.activeListings}
              </div>
              <div className="text-xs mt-1" style={{ color: COLORS.text, opacity: 0.6 }}>
                Open listings
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b" style={{ borderColor: COLORS.border }}>
          {[
            { id: "listings", label: "Sell Listings", icon: ShoppingBag },
            { id: "requests", label: "Buy Requests", icon: Users },
            { id: "history", label: "Trade History", icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
              }}
              className="px-4 py-2 text-sm font-medium flex items-center gap-2 relative"
              style={{
                color: activeTab === tab.id ? COLORS.gold : COLORS.text,
                opacity: activeTab === tab.id ? 1 : 0.7,
              }}
            >
              <tab.icon size={16} />
              {tab.label}
              {activeTab === tab.id && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: COLORS.gold }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2"
                size={20}
                style={{ color: COLORS.text, opacity: 0.5 }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={`Search in ${activeTab}...`}
                className="w-full pl-12 pr-4 py-3 rounded-xl text-sm"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text,
                }}
              />
            </div>

            <div className="flex gap-2">
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text,
                }}
              >
                <Filter size={16} />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent outline-none text-sm"
                  style={{ color: COLORS.text }}
                >
                  <option value="all" style={{ backgroundColor: COLORS.card, color: COLORS.text }}>All Status</option>
                  <option value="active" style={{ backgroundColor: COLORS.card, color: COLORS.text }}>Active</option>
                  <option value="pending" style={{ backgroundColor: COLORS.card, color: COLORS.text }}>Pending</option>
                  <option value="completed" style={{ backgroundColor: COLORS.card, color: COLORS.text }}>Completed</option>
                  <option value="cancelled" style={{ backgroundColor: COLORS.card, color: COLORS.text }}>Cancelled</option>
                  <option value="paid" style={{ backgroundColor: COLORS.card, color: COLORS.text }}>Paid</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tables */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw size={40} className="animate-spin mx-auto mb-4" style={{ color: COLORS.gold }} />
              <p style={{ color: COLORS.text }}>Loading data...</p>
            </div>
          ) : (
            <>
              {/* Sell Listings Table */}
              {activeTab === "listings" && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: "rgba(255,255,255,0.02)", borderBottom: `1px solid ${COLORS.border}` }}>
                        <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>ID</th>
                        <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>User ID</th>
                        <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>Coin</th>
                        <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>Price</th>
                        <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>Quantity</th>
                        <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>Payment</th>
                        <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>Status</th>
                        <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>Created</th>
                        <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentListings.length > 0 ? (
                        currentListings.map((listing) => (
                          <tr
                            key={listing.id}
                            style={{ borderBottom: `1px solid ${COLORS.border}` }}
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="py-4 px-6" style={{ color: COLORS.text }}>#{listing.id}</td>
                            <td className="py-4 px-6" style={{ color: COLORS.text }}>{listing.user_id}</td>
                            <td className="py-4 px-6">
                              <span className="font-medium" style={{ color: COLORS.blue }}>
                                {listing.coin_name || "USDT"}
                              </span>
                            </td>
                            <td className="py-4 px-6" style={{ color: COLORS.green }}>
                              ${formatNumber(listing.price)}
                            </td>
                            <td className="py-4 px-6" style={{ color: COLORS.text }}>
                              {formatNumber(listing.quantity)}
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs"
                                style={{
                                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                                  color: COLORS.blue,
                                }}
                              >
                                {getPaymentMethodIcon(listing.payment_method)}
                                {listing.payment_method?.toUpperCase() || "N/A"}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: `${getStatusColor(listing.status)}20`,
                                  color: getStatusColor(listing.status),
                                }}
                              >
                                {listing.status || "active"}
                              </span>
                            </td>
                            <td className="py-4 px-6" style={{ color: COLORS.text, opacity: 0.7 }}>
                              {new Date(listing.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-6">
                              <button
                                onClick={() => setSelectedPaymentDetails(listing)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                style={{ color: COLORS.blue }}
                                title="View Payment Details"
                              >
                                <Eye size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="text-center py-8" style={{ color: COLORS.text, opacity: 0.7 }}>
                            No listings found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Buy Requests Table */}
              {activeTab === "requests" && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: "rgba(255,255,255,0.02)", borderBottom: `1px solid ${COLORS.border}` }}>
                        <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>ID</th>
                        <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>Listing ID</th>
                        <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>Buyer</th>
                        <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>Seller</th>
                        <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>Coin</th>
                        <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>Price</th>
                        <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>Quantity</th>
                        <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>Total</th>
                        <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>Status</th>
                        <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentBuyRequests.length > 0 ? (
                        currentBuyRequests.map((request) => (
                          <tr
                            key={request.id}
                            style={{ borderBottom: `1px solid ${COLORS.border}` }}
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="py-4 px-6" style={{ color: COLORS.text }}>#{request.id}</td>
                            <td className="py-4 px-6" style={{ color: COLORS.text }}>#{request.listing_id || "N/A"}</td>
                            <td className="py-4 px-6" style={{ color: COLORS.text }}>{request.buyer_id || "N/A"}</td>
                            <td className="py-4 px-6" style={{ color: COLORS.text }}>{request.seller_id || "N/A"}</td>
                            <td className="py-4 px-6" style={{ color: COLORS.blue }}>{request.coin_name || "USDT"}</td>
                            <td className="py-4 px-6" style={{ color: COLORS.green }}>${formatNumber(request.price)}</td>
                            <td className="py-4 px-6" style={{ color: COLORS.text }}>{formatNumber(request.quantity)}</td>
                            <td className="py-4 px-6" style={{ color: COLORS.gold }}>${formatNumber(request.total)}</td>
                            <td className="py-4 px-6">
                              <span
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: `${getStatusColor(request.status)}20`,
                                  color: getStatusColor(request.status),
                                }}
                              >
                                {request.status || "pending"}
                              </span>
                            </td>
                            <td className="py-4 px-6" style={{ color: COLORS.text, opacity: 0.7 }}>
                              {request.created_at ? new Date(request.created_at).toLocaleDateString() : "N/A"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="10" className="text-center py-8" style={{ color: COLORS.text, opacity: 0.7 }}>
                            No buy requests found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Trade History Table */}
              {activeTab === "history" && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: "rgba(255,255,255,0.02)", borderBottom: `1px solid ${COLORS.border}` }}>
                        <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>ID</th>
                        <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>Listing ID</th>
                        <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>Buyer</th>
                        <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>Seller</th>
                        <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>Quantity</th>
                        <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>Price</th>
                        <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>Total</th>
                        <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>Completed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTradeHistory.length > 0 ? (
                        currentTradeHistory.map((trade) => (
                          <tr
                            key={trade.id}
                            style={{ borderBottom: `1px solid ${COLORS.border}` }}
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="py-4 px-6" style={{ color: COLORS.text }}>#{trade.id}</td>
                            <td className="py-4 px-6" style={{ color: COLORS.text }}>#{trade.listing_id || "N/A"}</td>
                            <td className="py-4 px-6" style={{ color: COLORS.text }}>{trade.buyer_id || "N/A"}</td>
                            <td className="py-4 px-6" style={{ color: COLORS.text }}>{trade.seller_id || "N/A"}</td>
                            <td className="py-4 px-6" style={{ color: COLORS.text }}>{formatNumber(trade.quantity)}</td>
                            <td className="py-4 px-6" style={{ color: COLORS.green }}>${formatNumber(trade.price)}</td>
                            <td className="py-4 px-6" style={{ color: COLORS.gold }}>${formatNumber(trade.total)}</td>
                            <td className="py-4 px-6" style={{ color: COLORS.text, opacity: 0.7 }}>
                              {trade.completed_at ? new Date(trade.completed_at).toLocaleString() : "N/A"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center py-8" style={{ color: COLORS.text, opacity: 0.7 }}>
                            No trade history found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />

              {/* Items info */}
              <div className="text-center py-2 text-sm opacity-60" style={{ color: COLORS.text }}>
                Showing {currentPage * itemsPerPage - itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, 
                  activeTab === "listings" ? filteredListings.length :
                  activeTab === "requests" ? filteredBuyRequests.length :
                  filteredTradeHistory.length
                )} of {' '}
                {activeTab === "listings" ? filteredListings.length :
                 activeTab === "requests" ? filteredBuyRequests.length :
                 filteredTradeHistory.length} entries
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payment Details Modal */}
      {selectedPaymentDetails && (
        <PaymentDetailsModal
          details={selectedPaymentDetails}
          onClose={() => setSelectedPaymentDetails(null)}
        />
      )}
    </div>
  );
}