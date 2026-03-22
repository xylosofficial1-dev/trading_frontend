// admin/src/pages/PayOptions.jsx
import { useState, useEffect } from "react";
import {
  Plus,
  Copy,
  Check,
  QrCode,
  X,
  HelpCircle,
  Phone,
  Mail,
  Edit2,
  Users,
  MessageSquare
} from "lucide-react";

// Color constants
const COLORS = {
  bg: "#000000",
  card: "#0D0D0D",
  border: "rgba(255,255,255,0.18)",
  text: "#FFFFFF",
  gold: "#FFD700",
  positive: "#22C55E",
  negative: "#EF4444",
};

export default function PayOptions() {
  const [copiedField, setCopiedField] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSupportPopup, setShowSupportPopup] = useState(false);
  const [cryptoList, setCryptoList] = useState([]);
  const [supportData, setSupportData] = useState({
    phone: "+1234567890",
    email: "support@example.com",
    group_name: "Telegram Group",
    description: "Join our community for support"
  });

  const BASE_URL = import.meta.env.VITE_API_URL;

  // Form state
  const [formData, setFormData] = useState({
    coinName: "",
    address: "",
    qrCode: ""
  });

  // Support form state
  const [supportFormData, setSupportFormData] = useState({
    phone: "",
    email: "",
    group_name: "",
    description: ""
  });

  // Copy to clipboard
  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const loadPayOption = async () => {
    const res = await fetch(`${BASE_URL}/api/pay-options`);
    const item = await res.json();

    if (!item) {
      setCryptoList([]);
      return;
    }

    setCryptoList([{
      coinName: item.coin_name,
      address: item.wallet_address,
      qrCode: item.qr_image
        ? `data:image/png;base64,${item.qr_image}`
        : null
    }]);
  };

  const loadSupportData = async () => {
    try {
     const res = await fetch(`${BASE_URL}/api/support`);
const data = await res.json();

if (data) {
  setSupportData(data);
}
    } catch (err) {
      console.error('Failed to load support data:', err);
    }
  };

  useEffect(() => {
    loadPayOption();
    loadSupportData();
  }, []);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle support form input change
  const handleSupportInputChange = (e) => {
    const { name, value } = e.target;
    setSupportFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCrypto = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("coinName", formData.coinName);
    data.append("address", formData.address);
    if (formData.qrCode) data.append("qrCode", formData.qrCode);

    await fetch(`${BASE_URL}/api/pay-options`, {
      method: "POST",
      body: data
    });

    setShowAddForm(false);
    setFormData({ coinName: "", address: "", qrCode: "" });
    await loadPayOption();
  };

  const handleUpdateSupport = async (e) => {
    e.preventDefault();
    
    try {
      await fetch(`${BASE_URL}/api/support/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(supportFormData)
      });
      
      await loadSupportData();
setShowSupportPopup(false);
    } catch (err) {
      console.error('Failed to update support:', err);
    }
  };

  const openSupportPopup = () => {
    setSupportFormData(supportData);
    setShowSupportPopup(true);
  };

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ backgroundColor: COLORS.bg }}>
      <div className="max-w-6xl mx-auto">
        {/* Header with Support Button */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: COLORS.gold }}>
              Crypto Addresses
            </h1>
            <p className="text-sm mt-1" style={{ color: COLORS.text, opacity: 0.7 }}>
              Manage cryptocurrency wallet addresses
            </p>
          </div>
          
          {/* Support Button */}
          <button
            onClick={openSupportPopup}
            className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200"
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
            <HelpCircle size={18} />
            Support
          </button>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Crypto Addresses */}
          <div className="space-y-6">
            {/* Add Button */}
            <div>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200"
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
                <Plus size={18} />
                Add New Address
              </button>
            </div>

            {/* Crypto List */}
            <div className="space-y-4">
              {cryptoList.length === 0 ? (
                <div className="text-center py-12 rounded-xl" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}` }}>
                  <p style={{ color: COLORS.text, opacity: 0.7 }}>No addresses added yet</p>
                  <p className="text-sm mt-1" style={{ color: COLORS.text, opacity: 0.5 }}>
                    Click "Add New Address" to get started
                  </p>
                </div>
              ) : (
                cryptoList.map((crypto, index) => (
                  <div key={index}
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: COLORS.card,
                      border: `1px solid ${COLORS.border}`,
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg" style={{ color: COLORS.gold }}>
                          {crypto.coinName}
                        </h3>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="mb-3">
                      <label className="text-sm mb-1 block" style={{ color: COLORS.text, opacity: 0.7 }}>
                        Address
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 p-2.5 rounded-lg font-mono text-sm text-amber-50 break-all" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                          {crypto.address}
                        </div>
                        <button
                          onClick={() => copyToClipboard(crypto.address, `address-${index}`)}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
                          style={{ color: COLORS.text }}
                          title="Copy Address"
                        >
                          {copiedField === `address-${index}` ? (
                            <Check size={16} style={{ color: COLORS.positive }} />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div>
                      <label className="text-sm mb-2 block" style={{ color: COLORS.text, opacity: 0.7 }}>
                        QR Code
                      </label>
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: "#FFFFFF" }}>
                          <img
                            src={crypto.qrCode}
                            alt={`${crypto.coinName} QR Code`}
                            className="h-24 w-24"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm mb-2" style={{ color: COLORS.text, opacity: 0.8 }}>
                            Scan to send {crypto.coinName}
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => window.open(crypto.qrCode, '_blank')}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                              style={{
                                backgroundColor: "rgba(255,255,255,0.05)",
                                color: COLORS.text,
                              }}
                            >
                              <QrCode size={12} />
                              Open QR
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column - Support/Network Box */}
          <div className="space-y-4">
            <div
              className="p-6 rounded-xl"
              style={{
                backgroundColor: COLORS.card,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold" style={{ color: COLORS.gold }}>
                  Support Network
                </h2>
                <button
                  onClick={openSupportPopup}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  style={{ color: COLORS.gold }}
                >
                  <Edit2 size={18} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Phone */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: "rgba(255,215,0,0.1)" }}>
                    <Phone size={18} style={{ color: COLORS.gold }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs mb-1" style={{ color: COLORS.text, opacity: 0.5 }}>Phone</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm" style={{ color: COLORS.text }}>{supportData.phone}</p>
                      <button
                        onClick={() => copyToClipboard(supportData.phone, 'support-phone')}
                        className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        {copiedField === 'support-phone' ? (
                          <Check size={14} style={{ color: COLORS.positive }} />
                        ) : (
                          <Copy size={14} style={{ color: COLORS.text, opacity: 0.5 }} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: "rgba(255,215,0,0.1)" }}>
                    <Mail size={18} style={{ color: COLORS.gold }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs mb-1" style={{ color: COLORS.text, opacity: 0.5 }}>Email</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm" style={{ color: COLORS.text }}>{supportData.email}</p>
                      <button
                        onClick={() => copyToClipboard(supportData.email, 'support-email')}
                        className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        {copiedField === 'support-email' ? (
                          <Check size={14} style={{ color: COLORS.positive }} />
                        ) : (
                          <Copy size={14} style={{ color: COLORS.text, opacity: 0.5 }} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Group Name */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: "rgba(255,215,0,0.1)" }}>
                    <Users size={18} style={{ color: COLORS.gold }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs mb-1" style={{ color: COLORS.text, opacity: 0.5 }}>Group</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm" style={{ color: COLORS.text }}>{supportData.group_name}</p>
                      <button
                        onClick={() => copyToClipboard(supportData.group_name, 'support-group')}
                        className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        {copiedField === 'support-group' ? (
                          <Check size={14} style={{ color: COLORS.positive }} />
                        ) : (
                          <Copy size={14} style={{ color: COLORS.text, opacity: 0.5 }} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: "rgba(255,215,0,0.1)" }}>
                    <MessageSquare size={18} style={{ color: COLORS.gold }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs mb-1" style={{ color: COLORS.text, opacity: 0.5 }}>Description</p>
                    <p className="text-sm" style={{ color: COLORS.text, opacity: 0.8 }}>{supportData.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Support Edit Popup */}
        {showSupportPopup && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div
              className="w-full max-w-md rounded-2xl"
              style={{
                backgroundColor: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.9)",
              }}
            >
              {/* Modal Header */}
              <div className="px-6 py-3 border-b flex items-center justify-between" style={{ borderColor: COLORS.border }}>
                <h2 className="text-xl font-bold" style={{ color: COLORS.gold }}>
                  Edit Support Information
                </h2>
                <button
                  onClick={() => setShowSupportPopup(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  style={{ color: COLORS.text }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body - Form */}
              <form onSubmit={handleUpdateSupport}>
                <div className="px-6 py-2 space-y-3">
                  <div>
                    <label className="text-sm mb-2 block font-medium" style={{ color: COLORS.text }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={supportFormData.phone}
                      onChange={handleSupportInputChange}
                      className="w-full p-3 rounded-xl"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: `1px solid ${COLORS.border}`,
                        color: COLORS.text,
                      }}
                      placeholder="+1234567890"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm mb-2 block font-medium" style={{ color: COLORS.text }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={supportFormData.email}
                      onChange={handleSupportInputChange}
                      className="w-full p-3 rounded-xl"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: `1px solid ${COLORS.border}`,
                        color: COLORS.text,
                      }}
                      placeholder="support@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm mb-2 block font-medium" style={{ color: COLORS.text }}>
                      Group Name
                    </label>
                    <input
                      type="text"
                      name="group_name"
                      value={supportFormData.group_name}
                      onChange={handleSupportInputChange}
                      className="w-full p-3 rounded-xl"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: `1px solid ${COLORS.border}`,
                        color: COLORS.text,
                      }}
                      placeholder="Telegram Group"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm mb-2 block font-medium" style={{ color: COLORS.text }}>
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={supportFormData.description}
                      onChange={handleSupportInputChange}
                      rows="3"
                      className="w-full p-3 rounded-xl"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: `1px solid ${COLORS.border}`,
                        color: COLORS.text,
                      }}
                      placeholder="Enter support description..."
                      required
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-3 border-t flex gap-3" style={{ borderColor: COLORS.border }}>
                  <button
                    type="button"
                    onClick={() => setShowSupportPopup(false)}
                    className="flex-1 py-3 rounded-xl font-medium transition-colors"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      color: COLORS.text,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "rgba(255,255,255,0.05)";
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl font-medium transition-colors"
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
                    Update Support
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Popup Modal for Add Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div
              className="w-full max-w-md rounded-2xl"
              style={{
                backgroundColor: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.9)",
              }}
            >
              {/* Modal Header */}
              <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: COLORS.border }}>
                <h2 className="text-xl font-bold" style={{ color: COLORS.gold }}>
                  Add New Crypto Address
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ coinName: "", address: "", qrCode: "" });
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  style={{ color: COLORS.text }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body - Form */}
              <form onSubmit={handleAddCrypto}>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-sm mb-2 block font-medium" style={{ color: COLORS.text }}>
                      Coin Name
                    </label>
                    <input
                      type="text"
                      name="coinName"
                      value={formData.coinName}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-xl"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: `1px solid ${COLORS.border}`,
                        color: COLORS.text,
                      }}
                      placeholder="e.g., Bitcoin, Ethereum, USDT"
                      required
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="text-sm mb-2 block font-medium" style={{ color: COLORS.text }}>
                      Wallet Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-xl font-mono text-sm"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: `1px solid ${COLORS.border}`,
                        color: COLORS.text,
                      }}
                      placeholder="0x..."
                      required
                    />
                  </div>

                  <div>
                    <label
                      className="text-sm mb-2 block font-medium"
                      style={{ color: COLORS.text, opacity: 0.8 }}
                    >
                      QR Code
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setFormData({ ...formData, qrCode: e.target.files[0] })
                      }
                      className="w-full p-3 rounded-xl text-sm"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: `1px solid ${COLORS.border}`,
                        color: COLORS.text,
                      }}
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t flex gap-3" style={{ borderColor: COLORS.border }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({ coinName: "", address: "", qrCode: "" });
                    }}
                    className="flex-1 py-3 rounded-xl font-medium transition-colors"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      color: COLORS.text,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "rgba(255,255,255,0.05)";
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl font-medium transition-colors"
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
                    Add Address
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}