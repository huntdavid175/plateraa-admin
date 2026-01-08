"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import { BranchProvider } from "@/app/providers/BranchProvider";
import BranchSwitcher from "./components/BranchSwitcher";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BranchProvider>
      <div className="min-h-screen bg-[var(--background)]">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Mobile header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-[var(--card)] border-b border-[var(--border)]">
          <div className="h-16 flex items-center justify-between px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--foreground)]"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M6 4L10 20L18 4H6Z"
                    fill="#5046e5"
                    stroke="#5046e5"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-lg font-bold text-[var(--primary)]">Plateraa</span>
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
          <div className="px-4 pb-3">
            <BranchSwitcher />
          </div>
        </div>

        {/* Desktop header with branch switcher */}
        <div className="hidden lg:block fixed top-0 left-64 right-0 h-16 bg-[var(--card)] border-b border-[var(--border)] z-10">
          <div className="h-full flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <BranchSwitcher />
            </div>
            <div className="flex items-center gap-4">
              {/* Add other header items here if needed */}
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="lg:ml-64 min-h-screen pt-24 lg:pt-16">
          {children}
        </main>
      </div>
    </BranchProvider>
  );
}
