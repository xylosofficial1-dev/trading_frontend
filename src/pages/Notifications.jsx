// admin/src/pages/Notifications.jsx
import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Bell,
  Search,
  Filter,
  Globe,
  Users,
  XCircle,
  Send,
  Menu,
  X,
  ChevronRight
} from "lucide-react";

// ================= COLORS =================
const COLORS = {
  bg: "#000000",
  card: "#0D0D0D",
  border: "rgba(255,255,255,0.18)",
  text: "#FFFFFF",
  gold: "#FFD700",
  negative: "#EF4444",
};

// ================= API =================
const API = `${import.meta.env.VITE_API_URL}/api/notifications`;

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [filterTarget, setFilterTarget] = useState("all");
  const [customTargetInput, setCustomTargetInput] = useState("");
  const [expandedNotifId, setExpandedNotifId] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    target: "all",
    customIds: "",
  });

  // ================= LOAD DATA =================
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();

      setNotifications(
        data.map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          target: n.target_type === "custom" ? n.target_users : "all",
          created: new Date(n.created_at).toLocaleString(),
        }))
      );
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  // ================= FORM HANDLERS =================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleTargetChange = (e) => {
    const value = e.target.value;
    setFormData((p) => ({
      ...p,
      target: value,
      customIds: value === "custom" ? p.customIds : "",
    }));
  };

  // ================= CREATE / UPDATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      message: formData.message,
      target: formData.target,
      customIds: formData.target === "custom" ? formData.customIds.trim() : null,
    };

    try {
      if (editingId) {
        await fetch(`${API}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      resetForm();
      loadNotifications();
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete notification?")) return;

    await fetch(`${API}/${id}`, { method: "DELETE" });
    loadNotifications();
  };

  // ================= HELPERS =================
  const resetForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({ title: "", message: "", target: "all", customIds: "" });
  };

  const getTargetIcon = (target) =>
    target === "all" ? <Globe size={14} /> : <Users size={14} />;

  const getTargetText = (target) => {
    if (target === "all") return "All Users";
    return `Custom (${target})`;
  };

  // ================= FILTER LOGIC =================
  const filteredNotifications = notifications
    .filter((n) =>
      filterTarget === "custom" ? n.target !== "all" : true
    )
    .filter(
      (n) =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.id.toString().includes(searchTerm)
    );

  const displayedNotifications = filteredNotifications;

  const toggleExpandNotif = (id) => {
    setExpandedNotifId(expandedNotifId === id ? null : id);
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6" style={{ backgroundColor: COLORS.bg }}>
      <div className="max-w-5xl mx-auto">
        {/* Header with Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: COLORS.gold }}>
              Notifications
            </h1>
            <p className="text-xs sm:text-sm mt-1" style={{ color: COLORS.text, opacity: 0.7 }}>
              Manage system notifications and user alerts
            </p>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <span className="text-sm" style={{ color: COLORS.text, opacity: 0.7 }}>
              Total: {notifications.length}
            </span>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 text-sm sm:text-base"
              style={{
                backgroundColor: COLORS.gold,
                color: "#000",
                fontWeight: "500"
              }}
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Notification</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="p-3 sm:p-4 rounded-2xl mb-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}` }}>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={16} style={{ color: COLORS.text, opacity: 0.5 }} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-sm"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.text,
                  }}
                />
              </div>
              
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="md:hidden px-3 py-2 rounded-xl flex items-center gap-2"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text,
                }}
              >
                <Filter size={16} />
              </button>

              {/* Desktop Filter Dropdown */}
              <div className="hidden md:flex items-center gap-2">
                <div className="relative">
                  <select
                    value={filterTarget}
                    onChange={(e) => setFilterTarget(e.target.value)}
                    className="appearance-none bg-black/70 flex items-center gap-2 px-4 py-2 rounded-xl pr-8 text-sm"
                    style={{  
                      border: `1px solid ${COLORS.border}`, 
                      color: COLORS.text 
                    }}
                  >
                    <option value="all">All Users</option>
                    <option value="custom">Custom Users</option>
                  </select>
                  <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" size={14} style={{ color: COLORS.text, opacity: 0.7 }} />
                </div>
              </div>
            </div>

            {/* Mobile Filters */}
            {showMobileFilters && (
              <div className="md:hidden p-3 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                <label className="text-sm block mb-2" style={{ color: COLORS.text, opacity: 0.7 }}>
                  Filter by Target:
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setFilterTarget("all");
                      setShowMobileFilters(false);
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${filterTarget === "all" ? "font-medium" : ""}`}
                    style={{
                      backgroundColor: filterTarget === "all" ? COLORS.gold : "rgba(255,255,255,0.05)",
                      color: filterTarget === "all" ? "#000" : COLORS.text,
                    }}
                  >
                    All Users
                  </button>
                  <button
                    onClick={() => {
                      setFilterTarget("custom");
                      setShowMobileFilters(false);
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${filterTarget === "custom" ? "font-medium" : ""}`}
                    style={{
                      backgroundColor: filterTarget === "custom" ? COLORS.gold : "rgba(255,255,255,0.05)",
                      color: filterTarget === "custom" ? "#000" : COLORS.text,
                    }}
                  >
                    Custom Users
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <div className="rounded-2xl overflow-hidden" style={{ 
            backgroundColor: COLORS.card, 
            border: `1px solid ${COLORS.border}`,
          }}>
            {/* Table Header */}
            <div className="grid grid-cols-12 p-4" style={{ 
              borderBottom: `1px solid ${COLORS.border}`, 
              backgroundColor: "rgba(13,13,13,0.95)",
            }}>
              <div className="col-span-1 font-medium text-sm" style={{ color: COLORS.text }}>ID</div>
              <div className="col-span-3 font-medium text-sm" style={{ color: COLORS.text }}>Title</div>
              <div className="col-span-3 font-medium text-sm" style={{ color: COLORS.text }}>Message</div>
              <div className="col-span-2 font-medium text-sm" style={{ color: COLORS.text }}>Target</div>
              <div className="col-span-3 font-medium text-sm" style={{ color: COLORS.text }}>Actions</div>
            </div>

            {/* Table Body */}
            {displayedNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={48} className="mx-auto mb-4" style={{ color: COLORS.text, opacity: 0.3 }} />
                <p style={{ color: COLORS.text, opacity: 0.7 }}>No notifications found</p>
              </div>
            ) : (
              displayedNotifications.map((notif) => (
                <div key={notif.id} className="grid grid-cols-12 p-4 hover:bg-white/5 transition-colors border-b" style={{ borderColor: COLORS.border }}>
                  {/* ID */}
                  <div className="col-span-1 flex items-center">
                    <span style={{ color: COLORS.text }} className="font-mono text-sm">#{notif.id}</span>
                  </div>

                  {/* Title */}
                  <div className="col-span-3">
                    <p className="font-medium text-sm" style={{ color: COLORS.text }}>{notif.title}</p>
                    <p className="text-xs mt-1" style={{ color: COLORS.text, opacity: 0.6 }}>{notif.created}</p>
                  </div>

                  {/* Message */}
                  <div className="col-span-3">
                    <p className="text-sm line-clamp-2" style={{ color: COLORS.text, opacity: 0.9 }}>{notif.message}</p>
                  </div>

                  {/* Target */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      {getTargetIcon(notif.target)}
                      <span className="text-sm" style={{ color: COLORS.text }}>
                        {getTargetText(notif.target)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-3 flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-sm"
                      style={{ color: COLORS.negative }}
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {displayedNotifications.length === 0 ? (
            <div className="p-8 text-center rounded-2xl" style={{ backgroundColor: COLORS.card }}>
              <Bell size={48} className="mx-auto mb-4" style={{ color: COLORS.text, opacity: 0.3 }} />
              <p style={{ color: COLORS.text, opacity: 0.7 }}>No notifications found</p>
            </div>
          ) : (
            displayedNotifications.map((notif) => (
              <div
                key={notif.id}
                className="rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                {/* Card Header */}
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => toggleExpandNotif(notif.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-xs px-2 py-1 rounded" style={{ backgroundColor: "rgba(255,255,255,0.05)", color: COLORS.gold }}>
                          #{notif.id}
                        </span>
                        <div className="flex items-center gap-1">
                          {getTargetIcon(notif.target)}
                          <span className="text-xs" style={{ color: COLORS.text, opacity: 0.7 }}>
                            {getTargetText(notif.target)}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-medium text-base mb-1" style={{ color: COLORS.text }}>
                        {notif.title}
                      </h3>
                      <p className="text-sm line-clamp-2" style={{ color: COLORS.text, opacity: 0.8 }}>
                        {notif.message}
                      </p>
                      <p className="text-xs mt-2" style={{ color: COLORS.text, opacity: 0.5 }}>
                        {notif.created}
                      </p>
                    </div>
                    <ChevronRight 
                      size={18} 
                      className={`transition-transform ${expandedNotifId === notif.id ? 'rotate-90' : ''}`}
                      style={{ color: COLORS.text, opacity: 0.6 }}
                    />
                  </div>
                </div>

                {/* Expanded Actions */}
                {expandedNotifId === notif.id && (
                  <div className="px-4 pb-4 pt-2 border-t" style={{ borderColor: COLORS.border }}>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm"
                        style={{
                          backgroundColor: "rgba(239,68,68,0.1)",
                          color: COLORS.negative,
                        }}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Tablet View (Medium screens) */}
        <div className="hidden sm:block md:hidden">
          <div className="rounded-2xl overflow-hidden" style={{ 
            backgroundColor: COLORS.card, 
            border: `1px solid ${COLORS.border}`,
          }}>
            {displayedNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={48} className="mx-auto mb-4" style={{ color: COLORS.text, opacity: 0.3 }} />
                <p style={{ color: COLORS.text, opacity: 0.7 }}>No notifications found</p>
              </div>
            ) : (
              displayedNotifications.map((notif) => (
                <div key={notif.id} className="p-4 hover:bg-white/5 transition-colors border-b" style={{ borderColor: COLORS.border }}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs px-2 py-1 rounded" style={{ backgroundColor: "rgba(255,255,255,0.05)", color: COLORS.gold }}>
                        #{notif.id}
                      </span>
                      <div className="flex items-center gap-1">
                        {getTargetIcon(notif.target)}
                        <span className="text-xs" style={{ color: COLORS.text, opacity: 0.7 }}>
                          {getTargetText(notif.target)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                      style={{ color: COLORS.negative }}
                    >
                      <Trash2 size={14} />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                  <h3 className="font-medium text-base mb-2" style={{ color: COLORS.text }}>
                    {notif.title}
                  </h3>
                  <p className="text-sm mb-2" style={{ color: COLORS.text, opacity: 0.8 }}>
                    {notif.message}
                  </p>
                  <p className="text-xs" style={{ color: COLORS.text, opacity: 0.5 }}>
                    {notif.created}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Popup Modal for Add/Edit Form - Responsive */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div
            className="w-full max-w-lg rounded-2xl my-4 sm:my-8 mx-4"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.9)",
            }}
          >
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-4 border-b flex items-center justify-between sticky top-0" style={{ 
              borderColor: COLORS.border,
              backgroundColor: COLORS.card,
            }}>
              <h2 className="text-lg sm:text-xl font-bold" style={{ color: COLORS.gold }}>
                {editingId ? 'Edit Notification' : 'Add New Notification'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                style={{ color: COLORS.text }}
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Modal Body - Form */}
            <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-4 space-y-4">
              {/* Title Field */}
              <div>
                <label className="text-sm mb-2 block font-medium" style={{ color: COLORS.text }}>
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-xl text-sm sm:text-base"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.text,
                  }}
                  placeholder="Enter notification title"
                  required
                  autoFocus
                />
              </div>

              {/* Message Field */}
              <div>
                <label className="text-sm mb-2 block font-medium" style={{ color: COLORS.text }}>
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-3 rounded-xl resize-none text-sm sm:text-base"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.text,
                  }}
                  placeholder="Enter notification message"
                  required
                />
              </div>

              {/* Target Field */}
              <div>
                <label className="text-sm mb-2 block font-medium" style={{ color: COLORS.text }}>
                  Target Users
                </label>
                <select
                  name="target"
                  value={formData.target}
                  onChange={handleTargetChange}
                  className="w-full p-3 rounded-xl mb-2 bg-black/70 text-sm sm:text-base"
                  style={{
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.text,
                  }}
                >
                  <option value="all">All Users</option>
                  <option value="custom">Custom IDs</option>
                </select>
                
                {/* Custom IDs input field */}
                {formData.target === 'custom' && (
                  <input
                    type="text"
                    name="customIds"
                    value={formData.customIds}
                    onChange={handleInputChange}
                    placeholder="Enter user IDs (comma separated, e.g., 1,2,3,4)"
                    className="w-full p-3 rounded-xl text-sm sm:text-base"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border: `1px solid ${COLORS.border}`,
                      color: COLORS.text,
                    }}
                    required={formData.target === 'custom'}
                  />
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t flex flex-col sm:flex-row gap-3" style={{ borderColor: COLORS.border }}>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 rounded-xl font-medium transition-colors text-sm sm:text-base order-2 sm:order-1"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: COLORS.text,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 hover:bg-opacity-90 text-sm sm:text-base order-1 sm:order-2"
                  style={{
                    backgroundColor: COLORS.gold,
                    color: "#000",
                  }}
                >
                  {editingId ? 'Update' : 'Add'} Notification
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}