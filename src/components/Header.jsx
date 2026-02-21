import { useState, useRef, useEffect } from "react";
import { Menu, ChevronDown } from "lucide-react";

// Color constants matching your theme
const COLORS = {
  bg: "#000000",
  card: "#0D0D0D",
  border: "rgba(255,255,255,0.18)",
  text: "#FFFFFF",
  gold: "#FFD700",
  gradient1: "#5A4500",
  gradient2: "#000000",
};

export default function Header({ onMenu, title = "Dashboard" }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className="
        h-16 flex items-center justify-between px-6 sticky top-0 z-40
      "
      style={{
        backgroundColor: COLORS.card,
        borderBottom: `1px solid ${COLORS.border}`,
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenu}
          className="
            md:hidden p-2 rounded-xl
            transition-all duration-200 cursor-pointer
          "
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            color: COLORS.gold,
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "rgba(255,215,0,0.1)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "rgba(255,255,255,0.05)";
          }}
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 
            className="text-2xl font-bold"
            style={{ color: COLORS.gold }}
          >
            {title}
          </h1>
        </div>
      </div>

      {/* Right - Profile Section */}
      <div className="flex items-center gap-4">
        {/* Profile with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3 p-1.5 rounded-xl transition-all duration-200"
            style={{
              backgroundColor: open ? "rgba(255,255,255,0.08)" : "transparent",
            }}
            onMouseEnter={(e) => {
              if (!open) {
                e.target.style.backgroundColor = "rgba(255,255,255,0.05)";
              }
            }}
            onMouseLeave={(e) => {
              if (!open) {
                e.target.style.backgroundColor = "transparent";
              }
            }}
          >
            <div 
              className="h-10 w-10 rounded-full overflow-hidden border-2 flex items-center justify-center"
              style={{
                backgroundColor: "rgba(255,215,0,0.15)",
                borderColor: COLORS.gold,
              }}
            >
              {/* Profile Image Placeholder */}
              <div className="h-full w-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <span 
                  className="text-lg font-bold"
                  style={{ color: COLORS.text }}
                >
                  A
                </span>
              </div>
            </div>
            
            <div className="hidden md:block text-left">
              <p 
                className="text-sm font-medium"
                style={{ color: COLORS.text }}
              >
                Admin User
              </p>
              <p 
                className="text-xs"
                style={{ color: COLORS.text, opacity: 0.6 }}
              >
                Administrator
              </p>
            </div>
            
          </button>
        </div>
      </div>
    </header>
  );
}