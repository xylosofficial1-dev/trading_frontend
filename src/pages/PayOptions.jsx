// admin/src/pages/PayOptions.jsx
import { useState, useEffect } from "react";
import {
  Plus,
  Copy,
  Check,
  QrCode,
  X
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
 const [cryptoList, setCryptoList] = useState([]);

 const BASE_URL = import.meta.env.VITE_API_URL;

  // Form state
  const [formData, setFormData] = useState({
    coinName: "",
    address: "",
    qrCode: ""
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
  // const res = await fetch("http://localhost:5000/api/pay-options");
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

useEffect(() => {
  loadPayOption();
}, []);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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
  // await fetch("http://localhost:5000/api/pay-options", {
    method: "POST",
    body: data
  });

  setShowAddForm(false);
  setFormData({ coinName: "", address: "", qrCode: "" });

  await loadPayOption();
};

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ backgroundColor: COLORS.bg }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: COLORS.gold }}>
            Crypto Addresses
          </h1>
          <p className="text-sm mt-1" style={{ color: COLORS.text, opacity: 0.7 }}>
            Manage cryptocurrency wallet addresses
          </p>
        </div>

        {/* Add Button */}
        <div className="mb-6">
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
            cryptoList.map((crypto) => (
              <div
                key={crypto.id}
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
                      onClick={() => copyToClipboard(crypto.address, `address-${crypto.id}`)}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
                      style={{ color: COLORS.text }}
                      title="Copy Address"
                    >
                      {copiedField === `address-${crypto.id}` ? (
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