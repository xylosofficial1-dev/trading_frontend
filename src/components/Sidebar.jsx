import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Bell,
  CreditCard,
  Wallet,
  LogOut,
  BarChart3,
  PieChart,
  Settings,
  Shield,
  Activity
} from "lucide-react";

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
  sidebarBg: "#0A0A0A",
  activeBg: "rgba(255,215,0,0.12)",
};

export default function Sidebar({ open }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // later auth token clear here
    navigate("/login");
  };

  return (
    <aside
      className={`
        fixed md:static z-40 h-full w-64
        transform ${open ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 transition-transform duration-300
      `}
      style={{
        backgroundColor: COLORS.sidebarBg,
        borderRight: `1px solid ${COLORS.border}`,
      }}
    >
      {/* Logo / Title */}
      <div 
        className="h-16 flex items-center px-6"
        style={{
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <div>
          <p 
            className="text-2xl font-bold tracking-wide"
            style={{ color: COLORS.gold }}
          >
            Admin Panel
          </p>
          <p 
            className="text-[11px] uppercase tracking-wider mt-0.5"
            style={{ color: COLORS.text, opacity: 0.6 }}
          >
            Financial Dashboard
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1.5">
        {/* Dashboard Section */}
        <div className="px-4 mb-2">
          <p className="text-xs uppercase tracking-wider" style={{ color: COLORS.text, opacity: 0.5 }}>
            Overview
          </p>
        </div>
        
        <SidebarLink
          to="/"
          end
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
        />

        {/* Management Section */}
        <div className="px-4 mb-2 mt-6">
          <p className="text-xs uppercase tracking-wider" style={{ color: COLORS.text, opacity: 0.5 }}>
            Management
          </p>
        </div>
        
        <SidebarLink
          to="/users"
          icon={<Users size={18} />}
          label="User Management"
        />
        <SidebarLink
          to="/notifications"
          icon={<Bell size={18} />}
          label="Notifications"
        />
        <SidebarLink
          to="/payoptions"
          icon={<CreditCard size={18} />}
          label="Payment Options"
        />
        <SidebarLink
          to="/wallet-request"
          icon={<Wallet size={18} />}
          label="Wallet Requests"
        />

<SidebarLink
  to="/trade-wallet-request"
  icon={<Activity size={18} />}
  label="Trade Wallet Request"
/>

<SidebarLink
  to="/videos"
  icon={<PieChart size={18} />}
  label="Videos"
/>

<SidebarLink
  to="/markets"
  icon={<BarChart3 size={18} />}
  label="Markets"
/>

      </nav>

      {/* Logout */}
      <div 
        className="p-4 mt-28" 
        style={{
          borderTop: `1px solid ${COLORS.border}`,
        }}
      >
        <button
          onClick={handleLogout}
          className="
            flex items-center gap-3 w-full px-4 py-2.5 rounded-xl
            transition-all duration-200 active:scale-[0.98]
          "
          style={{
            color: COLORS.negative,
            border: `1px solid ${COLORS.negative}40`,
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = `${COLORS.negative}15`;
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <LogOut size={18} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

/* Sidebar Link Component */
function SidebarLink({ to, icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => {
        const baseStyles = "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200";
        return `${baseStyles} ${isActive ? '' : 'hover:scale-[1.02]'}`;
      }}
      style={({ isActive }) => ({
        backgroundColor: isActive ? COLORS.activeBg : 'transparent',
        color: isActive ? COLORS.gold : COLORS.text,
        opacity: isActive ? 1 : 0.8,
        border: isActive ? `1px solid ${COLORS.gold}40` : '1px solid transparent',
        margin: '0 8px',
      })}
      onMouseEnter={(e) => {
        if (!e.target.classList.contains('active')) {
          e.target.style.backgroundColor = `${COLORS.gold}10`;
          e.target.style.color = COLORS.gold;
          e.target.style.opacity = 1;
        }
      }}
      onMouseLeave={(e) => {
        if (!e.target.classList.contains('active')) {
          const isActive = e.target.getAttribute('data-active') === 'true';
          e.target.style.backgroundColor = isActive ? COLORS.activeBg : 'transparent';
          e.target.style.color = isActive ? COLORS.gold : COLORS.text;
          e.target.style.opacity = isActive ? 1 : 0.8;
        }
      }}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </NavLink>
  );
}