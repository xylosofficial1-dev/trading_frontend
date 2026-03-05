import { useState, useEffect } from "react";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [message, setMessage] = useState("");

  const API = `${import.meta.env.VITE_API_URL}/api/system`;

  useEffect(() => {
    checkCommissionStatus();
  }, []);

  const checkCommissionStatus = async () => {
    try {
      const res = await fetch(`${API}/commission-status`);
      const data = await res.json();

      if (data.locked) {
        setLocked(true);
        setMessage(`Available after ${data.remaining} hour(s)`);
      }
    } catch (err) {
      console.error("Status check failed", err);
    }
  };

  const handleCommission = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(`${API}/distribute-commission`, {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert(
          `Commission Distributed Successfully!\nUsers Processed: ${data.users}`
        );

        setLocked(true);
        setMessage("Available after 24 hours");
      } else {
        if (res.status === 400) {
          setLocked(true);
          setMessage(data.message);
        } else {
          alert(data.message || "Something went wrong");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* 🔒 Hide button if locked */}
      {!locked && (
        <button
          onClick={handleCommission}
          disabled={loading}
          className="px-6 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition"
        >
          {loading
            ? "Processing..."
            : "Distribute Commission (All Users)"}
        </button>
      )}

      {locked && (
        <p className="mt-3 text-red-500 font-medium">
          {message || "Commission Locked for 24 hours"}
        </p>
      )}
    </div>
  );
}