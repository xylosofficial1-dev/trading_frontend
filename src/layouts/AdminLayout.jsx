import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenu={() => setOpen(prev => !prev)} />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
