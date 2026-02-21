import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";

// Color constants matching your Assets component
const COLORS = {
  bg: "#000000",
  card: "#0D0D0D",
  border: "rgba(255,255,255,0.18)",
  text: "#FFFFFF",
  gold: "#FFD700",
  gradient1: "#5A4500",
  gradient2: "#000000",
  positive: "#22C55E",
  negative: "#EF4444",
  redDot: "#FF3B30",
  button: "#111111",
  inputBg: "rgba(255,255,255,0.05)",
  errorBg: "rgba(239,68,68,0.1)",
  errorBorder: "rgba(239,68,68,0.2)",
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === "admin@gmail.com" && password === "admin123") {
      login({ email });
      navigate("/");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6">
      {/* Background Gold Glow Effect */}
      <div 
        className="absolute w-64 h-64 rounded-full blur-[100px] opacity-30"
        style={{ 
          background: `radial-gradient(circle, ${COLORS.gold} 0%, transparent 70%)`,
        }}
      ></div>

      {/* Login Card */}
      <div 
        className="z-10 w-full max-w-[360px] backdrop-blur-md p-6 rounded-2xl shadow-2xl"
        style={{
          backgroundColor: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          boxShadow: `0 25px 50px -12px rgba(0,0,0,0.9), 0 0 15px rgba(255,215,0,0.1)`,
        }}
      >
        
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold tracking-tight" style={{ color: COLORS.gold }}>
            Admin Login
          </h2>
          <p className="text-xs mt-1" style={{ color: COLORS.text, opacity: 0.6 }}>
            Enter your details below
          </p>
        </div>

        {error && (
          <div 
            className="mb-4 flex items-center gap-2 p-2.5 rounded-lg animate-pulse"
            style={{
              backgroundColor: COLORS.errorBg,
              border: `1px solid ${COLORS.errorBorder}`,
              color: COLORS.negative,
            }}
          >
            <AlertCircle size={14} />
            <span className="text-[13px]">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Input */}
          <div>
            <div className="relative">
              <Mail 
                className="absolute left-3 top-1/2 -translate-y-1/2" 
                size={16} 
                style={{ color: COLORS.gold, opacity: 0.7 }}
              />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl focus:outline-none transition-all"
                style={{
                  backgroundColor: COLORS.inputBg,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = COLORS.gold;
                  e.target.style.boxShadow = `0 0 0 2px rgba(255,215,0,0.2)`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = COLORS.border;
                  e.target.style.boxShadow = `none`;
                }}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="relative">
              <Lock 
                className="absolute left-3 top-1/2 -translate-y-1/2" 
                size={16} 
                style={{ color: COLORS.gold, opacity: 0.7 }}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl focus:outline-none transition-all"
                style={{
                  backgroundColor: COLORS.inputBg,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = COLORS.gold;
                  e.target.style.boxShadow = `0 0 0 2px rgba(255,215,0,0.2)`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = COLORS.border;
                  e.target.style.boxShadow = `none`;
                }}
                required
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.97] flex items-center justify-center gap-2"
            style={{
              backgroundColor: COLORS.button,
              border: `1px solid ${COLORS.gold}`,
              color: COLORS.gold,
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = COLORS.gold;
              e.target.style.color = COLORS.bg;
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = COLORS.button;
              e.target.style.color = COLORS.gold;
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Login <LogIn size={16} />
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 pt-4 text-center" style={{ borderTop: `1px solid ${COLORS.border}` }}>
          <p className="text-[11px]" style={{ color: COLORS.text, opacity: 0.6 }}>
            Demo: 
            <span className="ml-1" style={{ color: COLORS.gold, opacity: 0.8 }}>admin@gmail.com</span> / 
            <span className="ml-1" style={{ color: COLORS.gold, opacity: 0.8 }}>admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
}