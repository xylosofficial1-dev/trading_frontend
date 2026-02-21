import React, { useState, useEffect } from "react";
import { Edit, Search, Check, X, Download, Eye, Filter } from "lucide-react";

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
};

export default function TradeWalletRequest() {
  const [deductionPercent, setDeductionPercent] = useState(10);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const API_BASE = `${import.meta.env.VITE_API_URL}/api`;
  // const API_BASE = "http://localhost:5000/api";

 const [requests, setRequests] = useState([]);
const [loading, setLoading] = useState(false);

  // Fetch deduction percentage from API
  useEffect(() => {
    fetchRequests();
    fetchDeductionPercent();
  }, []);

  const fetchRequests = async () => {
  try {
    setLoading(true);
    const res = await fetch(`${API_BASE}/wallet/admin/trade-wallet/requests`);
    const data = await res.json();

    // normalize backend keys → frontend keys
    const formatted = data.map(r => ({
      id: r.id,
      userId: r.user_id,
      name: r.name,
      email: r.email,
      walletAmount: Number(r.wallet_amount),
      requestedAmount: Number(r.requested_amount),
      sentAmount: r.sent_amount ?? "-",
      status: r.status,
      date: new Date(r.created_at).toLocaleDateString(),
      rejectReason: r.reject_reason
    }));

    setRequests(formatted);
  } catch (err) {
    alert("Failed to load requests");
  } finally {
    setLoading(false);
  }
};

const fetchDeductionPercent = async () => {
  try {
    const res = await fetch(`${API_BASE}/wallet/admin/settings`);
    const data = await res.json();
    setDeductionPercent(data.tw_to_mw_deduction_percent);
  } catch {
    setDeductionPercent(10);
  }
};

const updateDeductionPercent = async () => {
  if (!editValue || isNaN(editValue) || editValue < 0 || editValue > 100) {
    alert("Enter valid percentage");
    return;
  }

  try {
    await fetch(`${API_BASE}/wallet/admin/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tw_to_mw_deduction_percent: Number(editValue),
      }),
    });

    setDeductionPercent(Number(editValue));
    setIsEditing(false);
  } catch {
    alert("Failed to update percentage");
  }
};

  // const calculateSentAmount = (requestedAmount) => {
  //   const deduction = (requestedAmount * deductionPercent) / 100;
  //   return (requestedAmount - deduction).toFixed(2);
  // };

 const handleApprove = async (id) => {
  try {
    const res = await fetch(
      `${API_BASE}/wallet/admin/trade-wallet/approve`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withdrawal_id: id }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Approval failed");
      return;
    }

    fetchRequests();
  } catch {
    alert("Approval failed");
  }
};

const handleReject = async (id) => {
  if (!rejectReason.trim()) {
    alert("Reason required");
    return;
  }

  try {
    const res = await fetch(
      `${API_BASE}/wallet/admin/trade-wallet/reject`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          withdrawal_id: id,
          reason: rejectReason,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Reject failed");
      return;
    }

    setShowRejectModal(null);
    setRejectReason("");
    fetchRequests();
  } catch {
    alert("Reject failed");
  }
};

 const filteredRequests = requests.filter(request => {
  const q = searchQuery.toLowerCase();

  const matchesSearch =
    String(request.userId).includes(q) ||
    (request.name || "").toLowerCase().includes(q) ||
    (request.email || "").toLowerCase().includes(q);

  const matchesStatus =
    statusFilter === "all" || request.status === statusFilter;

  return matchesSearch && matchesStatus;
});

  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return COLORS.green;
      case "rejected": return COLORS.red;
      case "pending": return COLORS.gold;
      default: return COLORS.text;
    }
  };

  return (
    <div
      className="min-h-screen p-4 md:p-6"
      style={{ backgroundColor: COLORS.bg }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div>
              <h1
                className="text-2xl md:text-2xl font-bold"
                style={{ color: COLORS.gold }}
              >
                Trade Wallet Request
              </h1>
              <p
                className="text-sm mt-1"
                style={{ color: COLORS.text, opacity: 0.7 }}
              >
                Manage trade wallet withdrawal requests and deduction settings
              </p>
            </div>
          </div>

          {/* Deduction Percentage Card */}
          <div
            className="rounded-2xl px-5 py-2 mb-2"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2
                  className="text-lg font-semibold mb-0"
                  style={{ color: COLORS.text }}
                >
                  Trade Wallet to Main Wallet Deduction
                </h2>
              
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
                      placeholder="0-100"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                    <button
                      onClick={updateDeductionPercent}
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
                      className="p-2 rounded-lg text-center"
                      style={{
                        backgroundColor: "rgba(139, 92, 246, 0.1)",
                        border: `1px solid ${COLORS.purple}`,
                        color: COLORS.text,
                        minWidth: "20px",
                      }}
                    >
                      <div className="text-xl font-bold" style={{ color: COLORS.purple }}>
                        {deductionPercent}%
                      </div>
                    
                    </div>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setEditValue(deductionPercent.toString());
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

  {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="text-sm" style={{ color: COLORS.text, opacity: 0.7 }}>
              Total Pending
            </div>
            <div className="text-2xl font-bold" style={{ color: COLORS.gold }}>
              {requests.filter(r => r.status === "pending").length}
            </div>
          </div>
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="text-sm mb-1" style={{ color: COLORS.text, opacity: 0.7 }}>
              Total Approved
            </div>
            <div className="text-2xl font-bold" style={{ color: COLORS.green }}>
              {requests.filter(r => r.status === "approved").length}
            </div>
          </div>
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="text-sm mb-1" style={{ color: COLORS.text, opacity: 0.7 }}>
              Total Amount Pending
            </div>
            <div className="text-2xl font-bold" style={{ color: COLORS.blue }}>
              ${requests.filter(r => r.status === "pending").reduce((sum, r) => sum + r.requestedAmount, 0).toLocaleString()}
            </div>
          </div>
        </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-3">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2"
                size={20}
                style={{ color: COLORS.text, opacity: 0.5 }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by User ID, Name, or Email..."
                className="w-full pl-12 pr-4 py-3 rounded-xl text-sm"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text,
                }}
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text,
                }}
              >
                <Filter size={16} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent outline-none text-sm"
                  style={{ color: COLORS.text }}
                >
                  <option value="all" style={{ backgroundColor: "rgba(255,255,255,0.7)", color: "#000" }}>All Status</option>
                  <option value="pending" style={{ backgroundColor: "rgba(255,255,255,0.7)", color: "#000" }}>Pending</option>
                  <option value="approved" style={{ backgroundColor: "rgba(255,255,255,0.7)", color: "#000" }}>Approved</option>
                  <option value="rejected" style={{ backgroundColor: "rgba(255,255,255,0.7)", color: "#000" }}>Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Requests Table */}
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
                    backgroundColor: "rgba(255,255,255,0.02)",
                    borderBottom: `1px solid ${COLORS.border}`,
                  }}
                >
                  <th className="text-left whitespace-nowrap py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>
                    User ID
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>
                    Name
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>
                    Email
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>
                    Requested
                  </th>
                  {/* <th className="text-left whitespace-nowrap py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>
                    Sent Amount
                  </th> */}
                  <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium" style={{ color: COLORS.text }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr 
                    key={request.id}
                    style={{ borderBottom: `1px solid ${COLORS.border}` }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-6" style={{ color: COLORS.text }}>
                      <div className="flex items-center gap-2">
                       
                        <span className="font-medium">{request.userId}</span>
                      </div>
                    </td>
                    <td className="py-4 whitespace-nowrap px-6" style={{ color: COLORS.text }}>
                      {request.name}
                    </td>
                    <td className="py-4 px-6" style={{ color: COLORS.text, opacity: 0.9 }}>
                      {request.email}
                    </td>
                    <td className="py-4 px-6" style={{ color: COLORS.blue }}>
                      ${request.requestedAmount.toLocaleString()}
                    </td>
                    {/* <td className="py-4 px-6">
                      <span style={{ 
                        color: request.sentAmount === "-" ? COLORS.text : COLORS.green,
                        opacity: request.sentAmount === "-" ? 0.7 : 1
                      }}>
                        {request.sentAmount === "-" ? "-" : `$${request.sentAmount}`}
                      </span>
                    </td> */}
                    <td className="py-4 px-6">
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${getStatusColor(request.status)}20`,
                          color: getStatusColor(request.status),
                        }}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {request.status === "pending" ? (
                          <>
                            <button
                              onClick={() => handleApprove(request.id)}
                              className="p-2 rounded-lg hover:bg-white/10 transition-colors group"
                              style={{ color: COLORS.green }}
                              title="Approve"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() => setShowRejectModal(request.id)}
                              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                              style={{ color: COLORS.red }}
                              title="Reject"
                            >
                              <X size={18} />
                            </button>
                          </>
                        ) : request.rejectReason ? (
                          <button
                            onClick={() => alert(`Rejection Reason: ${request.rejectReason}`)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
                            style={{
                              backgroundColor: "rgba(239, 68, 68, 0.1)",
                              color: COLORS.red,
                            }}
                          >
                            <Eye size={14} /> View Reason
                          </button>
                        ) : (
                          <span className="text-sm opacity-70 text-amber-50">Completed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              >
                <Search size={32} style={{ color: COLORS.text, opacity: 0.3 }} />
              </div>
              <h3
                className="text-xl font-bold mb-2"
                style={{ color: COLORS.text }}
              >
                No requests found
              </h3>
              <p
                className="text-sm mb-6"
                style={{ color: COLORS.text, opacity: 0.7 }}
              >
                {searchQuery || statusFilter !== "all" 
                  ? "Try adjusting your search or filter" 
                  : "No trade wallet requests available"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-xl font-bold"
                style={{ color: COLORS.text }}
              >
                Reject Request
              </h2>
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectReason("");
                }}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                style={{ color: COLORS.text }}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: COLORS.text }}
                >
                  Reason for Rejection
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter the reason for rejecting this request..."
                  className="w-full px-4 py-3 rounded-lg h-32 resize-none"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.text,
                  }}
                />
                <p className="text-xs mt-2" style={{ color: COLORS.text, opacity: 0.7 }}>
                  This reason will be shown to the user
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowRejectModal(null);
                    setRejectReason("");
                  }}
                  className="flex-1 py-3 rounded-lg font-medium"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: COLORS.text,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(showRejectModal)}
                  className="flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: COLORS.red,
                    color: "#FFFFFF",
                  }}
                >
                  <X size={18} /> Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}