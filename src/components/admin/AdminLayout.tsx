import React from 'react';
import Sidebar from './Sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Sidebar - Hidden on mobile, fixed on desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <main className="md:ml-[240px] p-6 lg:p-10">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Sidebar Trigger/Overlay could be added here if needed */}
    </div>
  );
};

export default AdminLayout;
