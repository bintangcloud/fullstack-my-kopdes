import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useState } from "react";
import { useAuth } from "../utils/AuthContext";
import NotificationDropdown from "../components/NotificationDropdown";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans">
      
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar for mobile and quick info */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition"
              aria-label="Buka Menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-gray-800 text-sm sm:text-base">
                My<span className="text-[#8B0000]">KopDes</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationDropdown isAdmin={true} />
            <span className="text-xs text-gray-500 hidden sm:inline">
              <strong className="text-gray-800">{user?.name}</strong>
            </span>
            <div className="w-8 h-8 rounded-full bg-[#8B0000] text-white font-bold flex items-center justify-center text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-3 px-6 text-center text-xs text-gray-400">
          © 2026 My-KopDes App | Version 1.0
        </footer>
      </div>
    </div>
  );
}
