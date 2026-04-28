// admin/src/pages/WalletRequests.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  Eye,
  Search,
  Filter,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Download,
  ExternalLink,
} from "lucide-react";

// Color constants matching PayOptions
const COLORS = {
  bg: "#000000",
  card: "#0D0D0D",
  border: "rgba(255,255,255,0.18)",
  text: "#FFFFFF",
  gold: "#FFD700",
  positive: "#22C55E",
  negative: "#EF4444",
};

// const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

export default function WalletRequests() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [copied, setCopied] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    let filtered = requests;

    if (searchTerm) {
      filtered = filtered.filter(
        (request) =>
          request.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.tx_hash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.user_id?.toString().includes(searchTerm),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }

    filtered = filtered.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
    setFilteredRequests(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [requests, searchTerm, statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${API_BASE_URL}/payments/admin/all`);
      setRequests(response.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to load payment requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!window.confirm("Are you sure you want to approve this payment?"))
      return;

    try {
      setActionLoadingId(requestId);
      await axios.put(`${API_BASE_URL}/payments/${requestId}/approve`);
      await fetchRequests();
      alert("Payment approved successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve payment");
    } finally {
      setActionLoadingId(null);
    }
  };

  const isMobile = window.innerWidth < 768;

  const truncateAddress = (text) => {
    if (!text) return "";
    return isMobile && text.length > 10
      ? text.slice(0, 6) + "..." + text.slice(-4) // 🔥 better format
      : text;
  };

  const copyToClipboard = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  const openImagePreview = async (request) => {
  const res = await axios.get(
    `${API_BASE_URL}/payments/${request.id}/screenshot`
  );

  setPreviewImage({
    ...request,
    screenshot: res.data.screenshot,
  });

  setShowImageModal(true);
};

  const handleReject = async (requestId) => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason");
      return;
    }

    try {
      setActionLoadingId(requestId);
      await axios.put(`${API_BASE_URL}/payments/${requestId}/reject`, {
        reason: rejectReason,
      });
      await fetchRequests();
      setShowModal(false);
      setRejectReason("");
      setSelectedRequest(null);
      alert("Payment rejected successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject payment");
    } finally {
      setActionLoadingId(null);
    }
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setRejectReason("");
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span
            className="px-3 py-1 cursor-pointer text-xs font-semibold rounded-full flex items-center gap-1.5"
            style={{
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              color: COLORS.positive,
            }}
          >
            <CheckCircle size={12} /> Approved
          </span>
        );
      case "rejected":
        return (
          <span
            className="px-3 py-1 cursor-pointer text-xs font-semibold rounded-full flex items-center gap-1.5"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              color: COLORS.negative,
            }}
          >
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return (
          <span
            className="px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5"
            style={{
              backgroundColor: "rgba(255, 215, 0, 0.1)",
              color: COLORS.gold,
            }}
          >
            <Clock size={12} /> Pending
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return COLORS.positive;
      case "rejected":
        return COLORS.negative;
      default:
        return COLORS.gold;
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredRequests.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: COLORS.bg }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mx-auto mb-4"
            style={{ borderColor: COLORS.gold }}
          ></div>
          <p className="text-sm" style={{ color: COLORS.text, opacity: 0.7 }}>
            Loading payment requests...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 md:p-6"
      style={{ backgroundColor: COLORS.bg }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-2xl md:text-3xl font-bold"
            style={{ color: COLORS.gold }}
          >
            Wallet Payment Requests
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: COLORS.text, opacity: 0.7 }}
          >
            Manage and verify user deposit requests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div
            className="p-4 rounded-xl"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm"
                  style={{ color: COLORS.text, opacity: 0.7 }}
                >
                  Total Requests
                </p>
                <p
                  className="text-2xl font-bold mt-1"
                  style={{ color: COLORS.text }}
                >
                  {requests.length}
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              >
                <Clock size={24} style={{ color: COLORS.gold }} />
              </div>
            </div>
          </div>

          <div
            className="p-4 rounded-xl"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm"
                  style={{ color: COLORS.text, opacity: 0.7 }}
                >
                  Pending
                </p>
                <p
                  className="text-2xl font-bold mt-1"
                  style={{ color: COLORS.gold }}
                >
                  {requests.filter((r) => r.status === "pending").length}
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: "rgba(255,215,0,0.1)" }}
              >
                <Clock size={24} style={{ color: COLORS.gold }} />
              </div>
            </div>
          </div>

          <div
            className="p-4 rounded-xl"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm"
                  style={{ color: COLORS.text, opacity: 0.7 }}
                >
                  Approved
                </p>
                <p
                  className="text-2xl font-bold mt-1"
                  style={{ color: COLORS.positive }}
                >
                  {requests.filter((r) => r.status === "approved").length}
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}
              >
                <CheckCircle size={24} style={{ color: COLORS.positive }} />
              </div>
            </div>
          </div>

          <div
            className="p-4 rounded-xl"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm"
                  style={{ color: COLORS.text, opacity: 0.7 }}
                >
                  Rejected
                </p>
                <p
                  className="text-2xl font-bold mt-1"
                  style={{ color: COLORS.negative }}
                >
                  {requests.filter((r) => r.status === "rejected").length}
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
              >
                <XCircle size={24} style={{ color: COLORS.negative }} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div
          className="p-4 rounded-xl mb-6"
          style={{
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                  size={20}
                  style={{ color: COLORS.text, opacity: 0.5 }}
                />
                <input
                  type="text"
                  placeholder="Search by email, transaction hash, or user ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.text,
                  }}
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <div className="relative">
                <Filter
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                  size={20}
                  style={{ color: COLORS.text, opacity: 0.5 }}
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm appearance-none bg-gray-500"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.text,
                  }}
                >
                  <option
                    value="all"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.7)",
                      color: "#000",
                    }}
                  >
                    All Status
                  </option>
                  <option
                    value="pending"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.7)",
                      color: "#000",
                    }}
                  >
                    Pending
                  </option>
                  <option
                    value="approved"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.7)",
                      color: "#000",
                    }}
                  >
                    Approved
                  </option>
                  <option
                    value="rejected"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.7)",
                      color: "#000",
                    }}
                  >
                    Rejected
                  </option>
                </select>
              </div>
            </div>
            <button
              onClick={fetchRequests}
              className="px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition-all duration-200"
              style={{
                backgroundColor: COLORS.gold,
                color: "#000",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#FFC107";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = COLORS.gold;
              }}
            >
              <RefreshCw size={18} /> Refresh
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="p-4 rounded-xl mb-6 flex items-center gap-3"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: `1px solid rgba(239, 68, 68, 0.3)`,
            }}
          >
            <AlertCircle size={20} style={{ color: COLORS.negative }} />
            <p className="text-sm" style={{ color: COLORS.negative }}>
              {error}
            </p>
          </div>
        )}

        {/* Requests Table */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          {currentItems.length === 0 ? (
            <div className="p-8 text-center">
              <Clock
                className="mx-auto mb-4"
                size={48}
                style={{ color: COLORS.text, opacity: 0.3 }}
              />
              <p style={{ color: COLORS.text, opacity: 0.7 }}>
                No payment requests found
              </p>
              <p
                className="text-sm mt-1"
                style={{ color: COLORS.text, opacity: 0.5 }}
              >
                {searchTerm || statusFilter !== "all"
                  ? "Try changing your search criteria"
                  : "All payment requests will appear here"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
                      <th
                        className="py-4 px-6 text-left text-sm font-medium tracking-wider"
                        style={{ color: COLORS.text, opacity: 0.7 }}
                      >
                        ID
                      </th>
                      <th
                        className="py-4 px-6 text-left text-sm font-medium tracking-wider"
                        style={{ color: COLORS.text, opacity: 0.7 }}
                      >
                        User
                      </th>
                      <th
                        className="py-4 px-6 text-left text-sm font-medium tracking-wider"
                        style={{ color: COLORS.text, opacity: 0.7 }}
                      >
                        Amount
                      </th>
                      <th
                        className="py-4 px-6 text-left text-sm font-medium tracking-wider"
                        style={{ color: COLORS.text, opacity: 0.7 }}
                      >
                        #Address
                      </th>
                      <th
                        className="py-4 px-6 text-left text-sm font-medium tracking-wider"
                        style={{ color: COLORS.text, opacity: 0.7 }}
                      >
                        Status
                      </th>
                      <th
                        className="py-4 px-6 text-left text-sm font-medium tracking-wider"
                        style={{ color: COLORS.text, opacity: 0.7 }}
                      >
                        Date
                      </th>
                      <th
                        className="py-4 px-6 text-left text-sm font-medium tracking-wider"
                        style={{ color: COLORS.text, opacity: 0.7 }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className="divide-y"
                    style={{ borderColor: COLORS.border }}
                  >
                    {currentItems.map((request) => (
                      <tr
                        key={request.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div
                            className="text-sm mt-1 whitespace-nowrap"
                            style={{ color: COLORS.text, opacity: 0.5 }}
                          >
                            User: {request.user_id}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div style={{ color: COLORS.text }}>
                            {request.email}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div
                            className="text-lg font-bold"
                            style={{ color: COLORS.text }}
                          >
                            ${request.amount_usd}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span
                              className="font-mono text-sm"
                              style={{ color: COLORS.text, opacity: 0.9 }}
                            >
                              {truncateAddress(request.tx_hash)}
                            </span>

                            {/* Show Button */}
                            <button
                              onClick={() => {
                                setSelectedAddress(request.tx_hash);
                                setShowAddressModal(true);
                              }}
                              className="p-1.5 rounded-md hover:bg-white/10"
                              title="View Full"
                            >
                              <Eye className="text-white cursor-pointer" size={14} />
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {getStatusBadge(request.status)}
                          {request.admin_reason &&
                            request.status === "rejected" && (
                              <div
                                className="text-xs mt-2 max-w-xs"
                                style={{ color: COLORS.text, opacity: 0.6 }}
                              >
                                Reason: {request.admin_reason}
                              </div>
                            )}
                        </td>
                        <td className="py-4 px-6">
                          <div
                            className="text-sm whitespace-nowrap"
                            style={{ color: COLORS.text, opacity: 0.8 }}
                          >
                            {formatDate(request.created_at)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => openImagePreview(request)}
                            className="mb-2 whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
                            style={{
                              backgroundColor: "rgba(255,255,255,0.08)",
                              color: COLORS.text,
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor =
                                "rgba(255,255,255,0.15)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor =
                                "rgba(255,255,255,0.08)";
                            }}
                          >
                            <Eye size={14} /> View Proof
                          </button>
                          {request.status === "pending" ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(request.id)}
                                disabled={actionLoading}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all duration-200 disabled:opacity-50"
                                style={{
                                  backgroundColor: "rgba(34, 197, 94, 0.1)",
                                  color: COLORS.positive,
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor =
                                    "rgba(34, 197, 94, 0.2)";
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor =
                                    "rgba(34, 197, 94, 0.1)";
                                }}
                              >
                                <CheckCircle size={12} /> Approve
                              </button>
                              <button
                                onClick={() => openRejectModal(request)}
                                disabled={actionLoading}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all duration-200 disabled:opacity-50"
                                style={{
                                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                                  color: COLORS.negative,
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor =
                                    "rgba(239, 68, 68, 0.2)";
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor =
                                    "rgba(239, 68, 68, 0.1)";
                                }}
                              >
                                <XCircle size={12} /> Reject
                              </button>
                            </div>
                          ) : (
                            <span
                              className="text-xs"
                              style={{ color: COLORS.text, opacity: 0.5 }}
                            >
                              Completed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  className="p-4 border-t flex items-center justify-between"
                  style={{ borderColor: COLORS.border }}
                >
                  <div
                    className="text-sm"
                    style={{ color: COLORS.text, opacity: 0.7 }}
                  >
                    Showing {startIndex + 1}-
                    {Math.min(endIndex, filteredRequests.length)} of{" "}
                    {filteredRequests.length} requests
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        color: COLORS.text,
                      }}
                      onMouseEnter={(e) => {
                        if (!e.target.disabled) {
                          e.target.style.backgroundColor =
                            "rgba(255,255,255,0.1)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!e.target.disabled) {
                          e.target.style.backgroundColor =
                            "rgba(255,255,255,0.05)";
                        }
                      }}
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === pageNum ? "" : "hover:bg-white/10"}`}
                              style={{
                                backgroundColor:
                                  currentPage === pageNum
                                    ? COLORS.gold
                                    : "transparent",
                                color:
                                  currentPage === pageNum
                                    ? "#000"
                                    : COLORS.text,
                              }}
                            >
                              {pageNum}
                            </button>
                          );
                        },
                      )}
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        color: COLORS.text,
                      }}
                      onMouseEnter={(e) => {
                        if (!e.target.disabled) {
                          e.target.style.backgroundColor =
                            "rgba(255,255,255,0.1)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!e.target.disabled) {
                          e.target.style.backgroundColor =
                            "rgba(255,255,255,0.05)";
                        }
                      }}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showImageModal && previewImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div
            className="w-80 max-w-xl rounded-xl overflow-hidden"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.9)",
            }}
          >
            {/* Header */}
            <div
              className="p-4 border-b flex items-center justify-between"
              style={{ borderColor: COLORS.border }}
            >
              <div>
                <h2
                  className="text-lg font-bold"
                  style={{ color: COLORS.gold }}
                >
                  Payment Screenshot
                </h2>
                <p
                  className="text-xs"
                  style={{ color: COLORS.text, opacity: 0.6 }}
                >
                  User: {previewImage.email} • ${previewImage.amount_usd}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowImageModal(false);
                  setPreviewImage(null);
                }}
                className="p-2 rounded-lg hover:bg-white/10"
                style={{ color: COLORS.text }}
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Image */}
            <div className="p-3 flex justify-center">
              <img
                src={`data:image/*;base64,${previewImage.screenshot}`}
                alt="Payment Proof"
                className="max-h-[60vh] rounded-xl border"
                style={{ borderColor: COLORS.border }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div
            className="w-full max-w-md rounded-2xl"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.9)",
            }}
          >
            {/* Modal Header */}
            <div
              className="p-6 border-b flex items-center justify-between"
              style={{ borderColor: COLORS.border }}
            >
              <h2 className="text-xl font-bold" style={{ color: COLORS.gold }}>
                Reject Payment Request
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedRequest(null);
                }}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                style={{ color: COLORS.text }}
                disabled={actionLoading}
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div
                className="mb-6 p-4 rounded-xl"
                style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
              >
                <p className="font-medium mb-1" style={{ color: COLORS.text }}>
                  Request #{selectedRequest.id}
                </p>
                <p
                  className="text-sm mb-2"
                  style={{ color: COLORS.text, opacity: 0.7 }}
                >
                  User: {selectedRequest.email}
                </p>
                <p
                  className="text-sm"
                  style={{ color: COLORS.text, opacity: 0.7 }}
                >
                  Amount: ${selectedRequest.amount_usd}
                </p>
              </div>

              <div className="mb-6">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: COLORS.text }}
                >
                  Reason for rejection
                  <span style={{ color: COLORS.negative }}> *</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter the reason for rejecting this payment..."
                  className="w-full h-32 px-4 py-3 rounded-xl text-sm resize-none"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.text,
                  }}
                  disabled={actionLoading}
                />
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedRequest(null);
                  }}
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-xl font-medium transition-all duration-200"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: COLORS.text,
                  }}
                  onMouseEnter={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.backgroundColor = "rgba(255,255,255,0.05)";
                    }
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedRequest.id)}
                  disabled={actionLoading || !rejectReason.trim()}
                  className="flex-1 py-3 rounded-xl font-medium transition-all duration-200"
                  style={{
                    backgroundColor:
                      actionLoading || !rejectReason.trim()
                        ? "rgba(239, 68, 68, 0.3)"
                        : COLORS.negative,
                    color: "#FFFFFF",
                  }}
                  onMouseEnter={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.backgroundColor = "#DC2626";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.backgroundColor = COLORS.negative;
                    }
                  }}
                >
                  {actionLoading ? "Processing..." : "Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddressModal && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
    <div
      className="w-full max-w-md rounded-xl p-5"
      style={{
        backgroundColor: COLORS.card,
        border: `1px solid ${COLORS.border}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ color: COLORS.gold }} className="font-semibold">
          Full Address
        </h2>

        <button
          onClick={() => setShowAddressModal(false)}
          className="p-1 hover:bg-white/10 rounded"
        >
          <XCircle size={18} />
        </button>
      </div>

      {/* Address */}
      <div
        className="p-3 rounded-lg break-all font-mono text-sm mb-4"
        style={{
          backgroundColor: "rgba(255,255,255,0.05)",
          color: COLORS.text,
        }}
      >
        {selectedAddress}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => copyToClipboard(selectedAddress)}
          className="flex cursor-pointer items-center gap-2 px-3 py-2 rounded-lg"
          style={{
            backgroundColor: "rgba(255,255,255,0.08)",
            color: COLORS.text,
          }}
        >
          <Copy size={16} />
          {copied ? "Copied" : "Copy"} 
        </button>

        <button
          onClick={() => setShowAddressModal(false)}
          className="px-3 py-2 rounded-lg cursor-pointer"
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
)}
    </div>
  );
}
