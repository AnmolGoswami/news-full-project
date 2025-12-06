import React, { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import DarkModeToggle from '../components/DarkModeToggle';
import { Menu } from 'lucide-react';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden relative">
      {/* Sidebar - fixed */}
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Backdrop (for mobile) */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Main content area */}
      <div className="flex flex-col min-h-screen pl-0 md:pl-72">
        {/* Header */}
        <header className="flex items-center justify-between h-20 px-4 md:px-6 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700/50 shadow-lg w-full">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 rounded-full hover:bg-gray-700/50"
          >
            <Menu className="h-6 w-6 text-gray-300" />
          </button>

          <div className="flex-1 flex justify-center items-center">
            <div className="text-center">
              <h2 className="text-lg md:text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                Welcome, Admin
              </h2>
              <p className="text-xs md:text-sm text-gray-400 mt-1">Manage your news from the panel.</p>
            </div>
          </div>

          <DarkModeToggle />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto w-full px-4 md:px-6 py-6">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
