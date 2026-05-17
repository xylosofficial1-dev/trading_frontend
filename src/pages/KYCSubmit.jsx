// src/pages/KYCSubmit.jsx

import { useState, useEffect } from "react";
import {
  Shield,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  X,
  Image,
  Send,
  User,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
} from "lucide-react";

const COLORS = {
  bg: "#000000",
  card: "#0D0D0D",
  border: "rgba(255,255,255,0.18)",
  text: "#FFFFFF",
  gold: "#FFD700",
  positive: "#22C55E",
  negative: "#EF4444",
  warning: "#F59E0B",
  blue: "#3B82F6",
  purple: "#8B5CF6",
};

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function KYCSubmit() {
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for View Documents Modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [govImageUrl, setGovImageUrl] = useState(null);
  const [faceImageUrl, setFaceImageUrl] = useState(null);
  const [loadingImages, setLoadingImages] = useState(false);
  
  // State for Reject Modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    loadKycSubmissions();
  }, []);

 const loadKycSubmissions = async () => {
  try {
    setLoading(true);

    const res = await fetch(`${API_BASE_URL}/api/kyc/admin/all`);

    const text = await res.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      console.error("Invalid JSON:", text);
      alert("Server returned invalid response");
      return;
    }

    if (data.success) {
      setUserSubmissions(data.data);
    } else {
      alert(data.error || "Failed to load KYC");
    }

  } catch (err) {
    console.error(err);
    alert("Network Error");
  } finally {
    setLoading(false);
  }
};

  const handleApprove = async (submission) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/kyc/approve/${submission.id}`, {
        method: "PUT",
      });

      const data = await res.json();

      if (!res.ok) {
        return alert(data.error);
      }

      alert("KYC Approved Successfully!");
      loadKycSubmissions();
    } catch (err) {
      console.log(err);
      alert("Failed to approve KYC");
    }
  };

  const handleReject = (submission) => {
    setSelectedSubmission(submission);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    try {
      if (!rejectReason.trim()) {
        return alert("Please provide a reason for rejection");
      }

      const res = await fetch(`${API_BASE_URL}/api/kyc/reject/${selectedSubmission.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: rejectReason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return alert(data.error);
      }

      alert("KYC Rejected Successfully!");
      setShowRejectModal(false);
      setRejectReason("");
      setSelectedSubmission(null);
      loadKycSubmissions();
    } catch (err) {
      console.log(err);
      alert("Failed to reject KYC");
    }
  };

  const viewUserDocuments = async (submission) => {
    setSelectedUser(submission);
    setShowViewModal(true);
    setLoadingImages(true);
    
    // Fetch images
    try {
      // Fetch government ID image
      const govRes = await fetch(`${API_BASE_URL}/api/kyc/gov-image/${submission.userId}`);
      if (govRes.ok) {
        const govBlob = await govRes.blob();
        const govUrl = URL.createObjectURL(govBlob);
        setGovImageUrl(govUrl);
      } else {
        setGovImageUrl(null);
      }

      // Fetch face image
      const faceRes = await fetch(`${API_BASE_URL}/api/kyc/face-image/${submission.userId}`);
      if (faceRes.ok) {
        const faceBlob = await faceRes.blob();
        const faceUrl = URL.createObjectURL(faceBlob);
        setFaceImageUrl(faceUrl);
      } else {
        setFaceImageUrl(null);
      }
    } catch (err) {
      console.error("Error loading images:", err);
      setGovImageUrl(null);
      setFaceImageUrl(null);
    } finally {
      setLoadingImages(false);
    }
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedUser(null);
    if (govImageUrl) {
      URL.revokeObjectURL(govImageUrl);
      setGovImageUrl(null);
    }
    if (faceImageUrl) {
      URL.revokeObjectURL(faceImageUrl);
      setFaceImageUrl(null);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
            <CheckCircle size={12} /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
            <Clock size={12} /> Pending
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.bg }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p style={{ color: COLORS.text }}>Loading submissions...</p>
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
              <Shield size={24} />
              KYC Document Management
            </h1>
            <p
              className="text-xs sm:text-sm mt-1"
              style={{ color: COLORS.text, opacity: 0.7 }}
            >
              Review and manage user KYC submissions (Government ID & Face Image)
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={loadKycSubmissions}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                color: COLORS.text,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <p className="text-xs opacity-70 mb-1" style={{ color: COLORS.text }}>Total Submissions</p>
            <p className="text-2xl font-bold" style={{ color: COLORS.gold }}>{userSubmissions.length}</p>
          </div>
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <p className="text-xs opacity-70 mb-1" style={{ color: COLORS.text }}>Pending Review</p>
            <p className="text-2xl font-bold" style={{ color: COLORS.warning }}>
              {userSubmissions.filter(s => s.status === "pending").length}
            </p>
          </div>
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <p className="text-xs opacity-70 mb-1" style={{ color: COLORS.text }}>Completed</p>
            <p className="text-2xl font-bold" style={{ color: COLORS.positive }}>
              {userSubmissions.filter(s => s.status === "approved").length}
            </p>
          </div>
        </div>

        {/* Submissions Table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <div
            className="p-4 border-b"
            style={{ borderColor: COLORS.border }}
          >
            <h2 className="font-semibold" style={{ color: COLORS.text }}>
              KYC Submissions
            </h2>
            <p className="text-xs mt-1" style={{ color: COLORS.text, opacity: 0.6 }}>
              View and manage user KYC document submissions
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    borderBottom: `1px solid ${COLORS.border}`,
                    backgroundColor: "rgba(255,255,255,0.03)",
                  }}
                >
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: COLORS.text }}>
                    User Details
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: COLORS.text }}>
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: COLORS.text }}>
                    Submitted
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: COLORS.text }}>
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: COLORS.text }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {userSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Shield size={48} style={{ color: COLORS.text, opacity: 0.3 }} />
                        <p style={{ color: COLORS.text, opacity: 0.5 }}>No KYC submissions found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  userSubmissions.map((submission) => (
                    <tr
                      key={submission.id}
                      style={{ borderBottom: `1px solid ${COLORS.border}` }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p
                            className="text-sm font-medium flex items-center gap-1"
                            style={{ color: COLORS.text }}
                          >
                            <User size={14} />
                            {submission.userName || "N/A"}
                          </p>
                          <p
                            className="text-xs mt-1"
                            style={{ color: COLORS.text, opacity: 0.5 }}
                          >
                            ID: {submission.userId}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <p className="text-xs flex items-center gap-1" style={{ color: COLORS.text, opacity: 0.7 }}>
                            <Mail size={12} />
                            {submission.userEmail || "N/A"}
                          </p>
                          {submission.phone && (
                            <p className="text-xs flex items-center gap-1" style={{ color: COLORS.text, opacity: 0.7 }}>
                              <Phone size={12} />
                              {submission.phone}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <p className="text-xs flex items-center gap-1" style={{ color: COLORS.text, opacity: 0.7 }}>
                          <Calendar size={12} />
                          {formatDate(submission.submittedAt)}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        {getStatusBadge(submission.status)}
                        {submission.status === "rejected" && submission.rejectionReason && (
                          <p
                            className="text-xs mt-1 max-w-[200px]"
                            style={{ color: COLORS.negative, opacity: 0.7 }}
                          >
                            <AlertTriangle size={10} className="inline mr-1" />
                            {submission.rejectionReason}
                          </p>
                        )}
                       </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewUserDocuments(submission)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                            style={{
                              backgroundColor: "rgba(59,130,246,0.15)",
                              color: COLORS.blue,
                              border: `1px solid ${COLORS.blue}30`,
                            }}
                          >
                            <Eye size={12} />
                            View Docs
                          </button>

                          {submission.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(submission)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                                style={{
                                  backgroundColor: "rgba(34,197,94,0.15)",
                                  color: COLORS.positive,
                                  border: `1px solid ${COLORS.positive}30`,
                                }}
                              >
                                <CheckCircle size={12} />
                                Approve
                              </button>

                              <button
                                onClick={() => handleReject(submission)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                                style={{
                                  backgroundColor: "rgba(239,68,68,0.15)",
                                  color: COLORS.negative,
                                  border: `1px solid ${COLORS.negative}30`,
                                }}
                              >
                                <XCircle size={12} />
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                       </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Documents Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div
            className="w-full max-w-4xl rounded-2xl max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div
              className="p-5 border-b flex items-center justify-between sticky top-0"
              style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}
            >
              <div>
                <h2 className="text-xl font-bold" style={{ color: COLORS.gold }}>
                  KYC Documents
                </h2>
                <p className="text-sm mt-1" style={{ color: COLORS.text, opacity: 0.7 }}>
                  {selectedUser.userName} • {selectedUser.userEmail}
                </p>
              </div>
              <button
                onClick={closeViewModal}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={20} style={{ color: COLORS.text }} />
              </button>
            </div>

            <div className="p-5">
              {loadingImages ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-3"></div>
                    <p style={{ color: COLORS.text }}>Loading images...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Government ID Image */}
                  <div
                    className="rounded-xl overflow-hidden"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.03)",
                      border: `1px solid ${COLORS.border}`,
                    }}
                  >
                    <div
                      className="p-3 border-b"
                      style={{ borderColor: COLORS.border }}
                    >
                      <h3 className="font-semibold flex items-center gap-2" style={{ color: COLORS.gold }}>
                        <Shield size={16} />
                        Government ID
                      </h3>
                    </div>
                    <div className="p-4">
                      {govImageUrl ? (
                        <img
                          src={govImageUrl}
                          alt="Government ID"
                          className="w-full h-auto rounded-lg"
                          style={{ maxHeight: "400px", objectFit: "contain" }}
                        />
                      ) : (
                        <div className="text-center py-8">
                          <Image size={48} style={{ color: COLORS.text, opacity: 0.3 }} className="mx-auto mb-2" />
                          <p style={{ color: COLORS.text, opacity: 0.5 }}>No image available</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Face Image */}
                  <div
                    className="rounded-xl overflow-hidden"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.03)",
                      border: `1px solid ${COLORS.border}`,
                    }}
                  >
                    <div
                      className="p-3 border-b"
                      style={{ borderColor: COLORS.border }}
                    >
                      <h3 className="font-semibold flex items-center gap-2" style={{ color: COLORS.gold }}>
                        <User size={16} />
                        Face Image
                      </h3>
                    </div>
                    <div className="p-4">
                      {faceImageUrl ? (
                        <img
                          src={faceImageUrl}
                          alt="Face"
                          className="w-full h-auto rounded-lg"
                          style={{ maxHeight: "400px", objectFit: "contain" }}
                        />
                      ) : (
                        <div className="text-center py-8">
                          <Image size={48} style={{ color: COLORS.text, opacity: 0.3 }} className="mx-auto mb-2" />
                          <p style={{ color: COLORS.text, opacity: 0.5 }}>No image available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Submission Info */}
              <div
                className="mt-6 p-4 rounded-xl"
                style={{
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs opacity-60" style={{ color: COLORS.text }}>Status</p>
                    <p className="text-sm mt-1">{getStatusBadge(selectedUser.status)}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-60" style={{ color: COLORS.text }}>Submitted On</p>
                    <p className="text-sm mt-1" style={{ color: COLORS.text }}>{formatDate(selectedUser.submittedAt)}</p>
                  </div>
                  {selectedUser.status === "rejected" && selectedUser.rejectionReason && (
                    <div className="col-span-2">
                      <p className="text-xs opacity-60" style={{ color: COLORS.text }}>Rejection Reason</p>
                      <p className="text-sm mt-1" style={{ color: COLORS.negative }}>{selectedUser.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div
            className="w-full max-w-md rounded-2xl"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div
              className="p-5 border-b flex items-center justify-between"
              style={{ borderColor: COLORS.border }}
            >
              <h2 className="text-xl font-bold" style={{ color: COLORS.negative }}>
                Reject KYC Submission
              </h2>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={20} style={{ color: COLORS.text }} />
              </button>
            </div>

            <div className="p-5">
              <p className="text-sm mb-4" style={{ color: COLORS.text }}>
                Rejecting KYC for <strong className="text-yellow-500">{selectedSubmission.userName}</strong>
              </p>
              <div>
                <label className="text-sm block mb-2" style={{ color: COLORS.text }}>
                  Rejection Reason <span style={{ color: COLORS.negative }}>*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows="4"
                  placeholder="Please provide a reason for rejection..."
                  className="w-full px-3 py-2 rounded-xl text-sm resize-none focus:outline-none"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.text,
                  }}
                />
              </div>
            </div>

            <div
              className="p-5 border-t flex justify-end gap-3"
              style={{ borderColor: COLORS.border }}
            >
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="px-4 py-2 rounded-xl transition-colors text-sm"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: COLORS.text,
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="px-4 py-2 rounded-xl font-medium transition-colors text-sm"
                style={{
                  backgroundColor: COLORS.negative,
                  color: "#000",
                }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}