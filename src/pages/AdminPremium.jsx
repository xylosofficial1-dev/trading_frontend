// src/pages/AdminPremium.jsx
import { useState, useEffect } from "react";
import {
  Crown,
  Eye,
  Upload,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Calendar,
  DollarSign,
  RefreshCw,
  Image as ImageIcon,
  Info,
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

export default function AdminPremium() {
  // State for Premium Subscriptions
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingBadge, setUpdatingBadge] = useState(null);

  // State for Banner
  const [bannerUrl, setBannerUrl] = useState(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);

  // State for FAQs
  const [faqs, setFaqs] = useState([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqForm, setFaqForm] = useState({ question: "", answer: "", sort_order: 0 });
  const [savingFaq, setSavingFaq] = useState(false);

  // Filter states for table
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);

  useEffect(() => {
    loadSubscriptions();
    loadBanner();
    loadFaqs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, subscriptions]);

  const applyFilters = () => {
    let filtered = [...subscriptions];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((sub) => {
        const userName = sub.name ? String(sub.name).toLowerCase() : "";
        const userEmail = sub.email ? String(sub.email).toLowerCase() : "";
        return userName.includes(term) || userEmail.includes(term);
      });
    }
    setFilteredSubscriptions(filtered);
  };

  // Load Premium Subscriptions
  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/premium/premium-subscriptions`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSubscriptions(data);
        setFilteredSubscriptions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Blue Badge
  const toggleBadge = async (userId, currentStatus) => {
    try {
      setUpdatingBadge(userId);
      const res = await fetch(`${API_BASE_URL}/api/premium/badge/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badge_enabled: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        loadSubscriptions();
      } else {
        alert(data.error || "Failed to update badge");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    } finally {
      setUpdatingBadge(null);
    }
  };

  // Load FAQs - FIXED: Handle direct array response
  const loadFaqs = async () => {
    try {
      setFaqLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/premium/faqs`);
      const data = await res.json();
      
      console.log("FAQS loaded:", data); // Debug log
      
      // Backend returns array directly, not {success: true, data: []}
      if (Array.isArray(data)) {
        setFaqs(data);
      } else if (data.success && Array.isArray(data.data)) {
        setFaqs(data.data);
      } else {
        setFaqs([]);
      }
    } catch (err) {
      console.error("Error loading FAQs:", err);
      setFaqs([]);
    } finally {
      setFaqLoading(false);
    }
  };

  // Save FAQ (Create or Update) - FIXED: Single working function
  const saveFaq = async () => {
    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      alert("Please fill in both question and answer");
      return;
    }

    try {
      setSavingFaq(true);
      
      let url, method;
      if (editingFaq) {
        url = `${API_BASE_URL}/api/premium/faqs/${editingFaq.id}`;
        method = "PUT";
      } else {
        url = `${API_BASE_URL}/api/premium/faqs`;
        method = "POST";
      }
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: faqForm.question,
          answer: faqForm.answer
        }),
      });
      
      const data = await res.json();
      console.log("Save FAQ response:", data); // Debug log
      
      if (data.success) {
        await loadFaqs(); // Refresh the list
        closeFaqModal();
        alert(editingFaq ? "FAQ updated successfully!" : "FAQ added successfully!");
      } else {
        alert(data.message || data.error || "Failed to save FAQ");
      }
    } catch (err) {
      console.error("Error saving FAQ:", err);
      alert("Network error");
    } finally {
      setSavingFaq(false);
    }
  };

  // Delete FAQ - FIXED: Ensure refresh after delete
  const deleteFaq = async (id) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/premium/faqs/${id}`, {
        method: "DELETE",
      });
      
      const data = await res.json();
      console.log("Delete FAQ response:", data); // Debug log
      
      if (data.success) {
        await loadFaqs(); // Refresh the list
        alert("FAQ deleted successfully!");
      } else {
        alert(data.error || "Failed to delete FAQ");
      }
    } catch (err) {
      console.error("Error deleting FAQ:", err);
      alert("Network error");
    }
  };

  const openFaqModal = (faq = null) => {
    if (faq) {
      setEditingFaq(faq);
      setFaqForm({
        question: faq.question,
        answer: faq.answer,
        sort_order: faq.sort_order || 0,
      });
    } else {
      setEditingFaq(null);
      setFaqForm({ question: "", answer: "", sort_order: faqs.length });
    }
    setShowFaqModal(true);
  };

  const closeFaqModal = () => {
    setShowFaqModal(false);
    setEditingFaq(null);
    setFaqForm({ question: "", answer: "", sort_order: 0 });
  };

  // Load Banner
  const loadBanner = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/premium/banner`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setBannerUrl(url);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Upload Banner
  const uploadBanner = async (file) => {
    if (!file) return;
    
    try {
      setUploadingBanner(true);
      const formData = new FormData();
      formData.append("banner", file);
      
      const res = await fetch(`${API_BASE_URL}/api/premium/banner/upload`, {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      if (data.success) {
        await loadBanner();
        alert("Banner uploaded successfully!");
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    } finally {
      setUploadingBanner(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (subscription) => {
    if (!subscription.is_premium) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
          <XCircle size={12} /> Not Premium
        </span>
      );
    }
    
    if (subscription.expires_at && new Date(subscription.expires_at) < new Date()) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
          <XCircle size={12} /> Expired
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
        <Crown size={12} /> Premium
      </span>
    );
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6" style={{ backgroundColor: COLORS.bg }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2" style={{ color: COLORS.gold }}>
              <Crown size={24} />
              Premium Management
            </h1>
            <p className="text-xs sm:text-sm mt-1" style={{ color: COLORS.text, opacity: 0.7 }}>
              Manage premium subscriptions, badge settings, banners, and FAQs
            </p>
          </div>
          <button
            onClick={() => {
              loadSubscriptions();
              loadFaqs();
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              color: COLORS.text,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <RefreshCw size={12} />
            Refresh All
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}` }}>
            <p className="text-xs opacity-70 mb-1" style={{ color: COLORS.text }}>Total Premium Users</p>
            <p className="text-2xl font-bold" style={{ color: COLORS.gold }}>
              {subscriptions.filter(s => s.is_premium === true).length}
            </p>
          </div>
          <div className="rounded-xl p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}` }}>
            <p className="text-xs opacity-70 mb-1" style={{ color: COLORS.text }}>Active Premium</p>
            <p className="text-2xl font-bold" style={{ color: COLORS.positive }}>
              {subscriptions.filter(s => s.is_premium && s.expires_at && new Date(s.expires_at) > new Date()).length}
            </p>
          </div>
          <div className="rounded-xl p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}` }}>
            <p className="text-xs opacity-70 mb-1" style={{ color: COLORS.text }}>Badge Enabled</p>
            <p className="text-2xl font-bold" style={{ color: COLORS.blue }}>
              {subscriptions.filter(s => s.badge_enabled === true).length}
            </p>
          </div>
          <div className="rounded-xl p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}` }}>
            <p className="text-xs opacity-70 mb-1" style={{ color: COLORS.text }}>Auto-Renew Enabled</p>
            <p className="text-2xl font-bold" style={{ color: COLORS.purple }}>
              {subscriptions.filter(s => s.auto_renew === true).length}
            </p>
          </div>
        </div>

        {/* Banner Section */}
        <div className="rounded-xl mb-6 overflow-hidden" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}` }}>
          <div className="p-4 border-b flex flex-wrap items-center justify-between gap-3" style={{ borderColor: COLORS.border }}>
            <div>
              <h2 className="font-semibold flex items-center gap-2" style={{ color: COLORS.text }}>
                <ImageIcon size={18} />
                Premium Banner
              </h2>
              <p className="text-xs mt-1" style={{ color: COLORS.text, opacity: 0.6 }}>
                Banner displayed on premium page
              </p>
            </div>
            <div className="flex gap-2">
              {bannerUrl && (
                <button
                  onClick={() => setShowBannerModal(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                  style={{ backgroundColor: "rgba(59,130,246,0.15)", color: COLORS.blue, border: `1px solid ${COLORS.blue}30` }}
                >
                  <Eye size={12} />
                  View
                </button>
              )}
              <label className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1 transition-colors" style={{ backgroundColor: COLORS.gold, color: "#000" }}>
                <Upload size={12} />
                {uploadingBanner ? "Uploading..." : "Upload Banner"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadBanner(e.target.files[0])} disabled={uploadingBanner} />
              </label>
            </div>
          </div>
          {bannerUrl && (
            <div className="p-4">
              <img src={bannerUrl} alt="Premium Banner" className="w-36 h-36 object-cover rounded-lg" />
            </div>
          )}
        </div>

        {/* Premium Subscriptions Table */}
        <div className="rounded-2xl overflow-hidden mb-6" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}` }}>
          <div className="p-4 border-b flex flex-wrap items-center justify-between gap-3" style={{ borderColor: COLORS.border }}>
            <div>
              <h2 className="font-semibold flex items-center gap-2" style={{ color: COLORS.text }}>
                <Crown size={18} />
                Premium Subscriptions
              </h2>
              <p className="text-xs mt-1" style={{ color: COLORS.text, opacity: 0.6 }}>
                Showing {filteredSubscriptions.length} of {subscriptions.length} users
              </p>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-8 pr-3 py-1.5 rounded-lg text-sm focus:outline-none"
                style={{ backgroundColor: "rgba(255,255,255,0.05)", border: `1px solid ${COLORS.border}`, color: COLORS.text }}
              />
              <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: COLORS.text }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.border}`, backgroundColor: "rgba(255,255,255,0.03)" }}>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: COLORS.text }}>User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: COLORS.text }}>Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: COLORS.text }}>Blue Badge</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: COLORS.text }}>Subscribed</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: COLORS.text }}>Expires</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: COLORS.text }}>Auto-Renew</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: COLORS.text }}>Last Payment</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center">
                      <p style={{ color: COLORS.text, opacity: 0.5 }}>No subscriptions found</p>
                    </td>
                  </tr>
                ) : (
                  filteredSubscriptions.map((sub) => (
                    <tr key={sub.id} style={{ borderBottom: `1px solid ${COLORS.border}` }} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium flex items-center gap-1" style={{ color: COLORS.text }}>
                            <User size={14} />
                            {sub.name || "Unknown"}
                            {sub.badge_enabled && <CheckCircle size={12} style={{ color: COLORS.blue }} className="ml-1" />}
                          </p>
                          <p className="text-xs mt-1 flex items-center gap-1" style={{ color: COLORS.text, opacity: 0.5 }}>
                            <Mail size={10} />
                            {sub.email || "N/A"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(sub)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleBadge(sub.user_id, sub.badge_enabled)}
                          disabled={updatingBadge === sub.user_id}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${sub.badge_enabled ? "bg-blue-500/20 text-blue-400 border border-blue-400/30" : "bg-gray-500/20 text-gray-400 border border-gray-400/30"}`}
                        >
                          {updatingBadge === sub.user_id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                          ) : (
                            <CheckCircle size={10} />
                          )}
                          {sub.badge_enabled ? "Enabled" : "Disabled"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs flex items-center gap-1" style={{ color: COLORS.text, opacity: 0.7 }}>
                          <Calendar size={10} />
                          {formatDate(sub.subscribed_at)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs" style={{ color: sub.expires_at && new Date(sub.expires_at) < new Date() ? COLORS.negative : COLORS.text, opacity: 0.7 }}>
                          {formatDate(sub.expires_at)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${sub.auto_renew ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                          {sub.auto_renew ? "ON" : "OFF"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {sub.last_payment_amount > 0 ? (
                          <div>
                            <p className="text-xs font-medium" style={{ color: COLORS.gold }}>
                              ${sub.last_payment_amount}
                            </p>
                            <p className="text-xs opacity-50" style={{ color: COLORS.text }}>
                              {formatDate(sub.last_payment_date)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs opacity-50">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}` }}>
          <div className="p-4 border-b flex flex-wrap items-center justify-between gap-3" style={{ borderColor: COLORS.border }}>
            <div>
              <h2 className="font-semibold flex items-center gap-2" style={{ color: COLORS.text }}>
                <Info size={18} />
                Premium FAQs
              </h2>
              <p className="text-xs mt-1" style={{ color: COLORS.text, opacity: 0.6 }}>
                Manage frequently asked questions for premium users
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => loadFaqs()}
                className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors hover:bg-white/10"
                style={{ backgroundColor: "rgba(255,255,255,0.05)", color: COLORS.text, border: `1px solid ${COLORS.border}` }}
              >
                <RefreshCw size={12} />
                Refresh FAQs
              </button>
              <button
                onClick={() => openFaqModal()}
                className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                style={{ backgroundColor: COLORS.gold, color: "#000" }}
              >
                <Plus size={12} />
                Add FAQ
              </button>
            </div>
          </div>

          <div className="divide-y" style={{ borderColor: COLORS.border }}>
            {faqLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
              </div>
            ) : faqs.length === 0 ? (
              <div className="p-8 text-center">
                <p style={{ color: COLORS.text, opacity: 0.5 }}>No FAQs added yet</p>
              </div>
            ) : (
              faqs.map((faq) => (
                <div key={faq.id} className="p-4 flex flex-wrap items-start justify-between gap-3 hover:bg-white/5 transition-colors">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium flex items-center gap-2" style={{ color: COLORS.gold }}>
                      Q: {faq.question}
                    </h3>
                    <p className="text-sm mt-1" style={{ color: COLORS.text, opacity: 0.8 }}>
                      A: {faq.answer}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openFaqModal(faq)}
                      className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                      style={{ color: COLORS.blue }}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => deleteFaq(faq.id)}
                      className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                      style={{ color: COLORS.negative }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Banner View Modal */}
      {showBannerModal && bannerUrl && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => setShowBannerModal(false)}>
          <div className="max-w-sm w-full rounded-2xl overflow-hidden" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}` }} onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: COLORS.border }}>
              <h3 className="font-semibold" style={{ color: COLORS.text }}>Premium Banner</h3>
              <button onClick={() => setShowBannerModal(false)} className="p-1 rounded-lg hover:bg-white/10">
                <X size={18} style={{ color: COLORS.text }} />
              </button>
            </div>
            <div className="p-4">
              <img src={bannerUrl} alt="Premium Banner" className="w-full rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {showFaqModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={closeFaqModal}>
          <div className="max-w-md w-full rounded-2xl" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}` }} onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: COLORS.border }}>
              <h3 className="font-semibold" style={{ color: COLORS.text }}>
                {editingFaq ? "Edit FAQ" : "Add New FAQ"}
              </h3>
              <button onClick={closeFaqModal} className="p-1 rounded-lg hover:bg-white/10">
                <X size={18} style={{ color: COLORS.text }} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm block mb-1" style={{ color: COLORS.text }}>Question</label>
                <input
                  type="text"
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)", border: `1px solid ${COLORS.border}`, color: COLORS.text }}
                  placeholder="Enter question..."
                />
              </div>
              <div>
                <label className="text-sm block mb-1" style={{ color: COLORS.text }}>Answer</label>
                <textarea
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  rows="4"
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-none"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)", border: `1px solid ${COLORS.border}`, color: COLORS.text }}
                  placeholder="Enter answer..."
                />
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-3" style={{ borderColor: COLORS.border }}>
              <button onClick={closeFaqModal} className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: "rgba(255,255,255,0.05)", color: COLORS.text }}>
                Cancel
              </button>
              <button onClick={saveFaq} disabled={savingFaq} className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1" style={{ backgroundColor: COLORS.gold, color: "#000" }}>
                {savingFaq ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-black"></div> : <Save size={14} />}
                {editingFaq ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}