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
// const API = "https://trading-backend-1rq6.onrender.com/api/notifications";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [filterTarget, setFilterTarget] = useState("all");
  const [customTargetInput, setCustomTargetInput] = useState(""); // Fixed: Added missing state

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
  target: formData.target,              // "all" OR "custom"
  customIds:
    formData.target === "custom"
      ? formData.customIds.trim()
      : null,
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

  // Use filteredNotifications for display (fixed the variable name)
  const displayedNotifications = filteredNotifications;

  return (
    <div className="min-h-[33em] p-4 md:px-6 py-2" style={{ backgroundColor: COLORS.bg }}>
      
      <div className="max-w-5xl mx-auto">
        {/* Header with Add Button on right */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-2xl font-bold" style={{ color: COLORS.gold }}>
              Notifications
            </h1>
            <p className="text-sm" style={{ color: COLORS.text, opacity: 0.7 }}>
              Manage system notifications and user alerts
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <span style={{ color: COLORS.text, fontSize: '14px' }}>
              Total: {notifications.length}
            </span>
            
            {/* Add Button */}
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 hover:bg-opacity-90"
              style={{
                backgroundColor: COLORS.gold,
                color: "#000",
                fontWeight: "500"
              }}
            >
              <Plus size={16} />
              Add Notification
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="p-2 rounded-2xl mb-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}` }}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={18} style={{ color: COLORS.text, opacity: 0.5 }} />
              <input
                type="text"
                placeholder="Search notifications..."
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
            
            {/* Filter Dropdown */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={filterTarget}
                  onChange={(e) => setFilterTarget(e.target.value)}
                  className="appearance-none bg-black/70 flex items-center gap-2 px-4 py-2.5 rounded-xl pr-8"
                  style={{  
                    border: `1px solid ${COLORS.border}`, 
                    color: COLORS.text 
                  }}
                >
                  <option value="all">All Users</option>
                  <option value="custom">Custom Users</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" size={16} style={{ color: COLORS.text, opacity: 0.7 }} />
              </div>
              
            </div>
          </div>
        </div>

        {/* Notifications Table */}
        <div className="rounded-2xl overflow-hidden no-scrollbar" style={{ 
          backgroundColor: COLORS.card, 
          border: `1px solid ${COLORS.border}`,
          maxHeight: "calc(100vh - 280px)",
          overflowY: "auto"
        }}>
          {/* Table Header */}
          <div className="grid grid-cols-12 p-4 sticky top-0" style={{ 
            borderBottom: `1px solid ${COLORS.border}`, 
            backgroundColor: "rgba(13,13,13,0.95)",
            backdropFilter: "blur(8px)",
            zIndex: 10
          }}>
            <div className="col-span-1 font-medium" style={{ color: COLORS.text }}>ID</div>
            <div className="col-span-3 font-medium" style={{ color: COLORS.text }}>Title</div>
            <div className="col-span-3 font-medium" style={{ color: COLORS.text }}>Message</div>
            <div className="col-span-2 font-medium" style={{ color: COLORS.text }}>Target</div>
            <div className="col-span-2 font-medium" style={{ color: COLORS.text }}>Actions</div>
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
                  <span style={{ color: COLORS.text }} className="font-mono">#{notif.id}</span>
                </div>

                {/* Title */}
                <div className="col-span-3">
                  <p className="font-medium" style={{ color: COLORS.text }}>{notif.title}</p>
                  <p className="text-xs mt-1" style={{ color: COLORS.text, opacity: 0.6 }}>{notif.created}</p>
                </div>

                {/* Message */}
                <div className="col-span-3">
                  <p className="text-sm" style={{ color: COLORS.text, opacity: 0.9 }}>{notif.message}</p>
                </div>

                {/* Target */}
                <div className="col-span-2">
                  <div className="flex items-center text-amber-50 gap-2">
                    {getTargetIcon(notif.target)}
                    <span className="text-sm" style={{ color: COLORS.text }}>
                      {notif.target === 'all' ? 'All Users' : `Users: ${notif.target}`}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center gap-2">
                 
                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    style={{ color: COLORS.negative }}
                  >
                    <Trash2 size={14} />
                    <span className="text-sm">Delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Popup Modal for Add/Edit Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto no-scrollbar">
          <div
            className="w-full max-w-lg rounded-2xl my-8 modal-scrollbar"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.9)",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0" style={{ 
              borderColor: COLORS.border,
              backgroundColor: COLORS.card,
              zIndex: 1
            }}>
              <h2 className="text-xl font-bold" style={{ color: COLORS.gold }}>
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
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-2">
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
                  className="w-full p-3 rounded-xl"
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
                  className="w-full p-3 rounded-xl resize-none"
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
              <div className="mb-4">
                <label className="text-sm mb-2 block font-medium" style={{ color: COLORS.text }}>
                  Target Users
                </label>
                <select
                  name="target"
                  value={formData.target}
                  onChange={handleTargetChange}
                  className="w-full p-3 rounded-xl mb-2 bg-black/70"
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
                    className="w-full p-3 rounded-xl"
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
              <div className="pt-4 border-t flex gap-3" style={{ borderColor: COLORS.border }}>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 rounded-xl font-medium transition-colors"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: COLORS.text,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 hover:bg-opacity-90"
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