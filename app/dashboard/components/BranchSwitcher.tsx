"use client";

import { useState } from "react";
import { useBranch } from "@/app/providers/BranchProvider";

export default function BranchSwitcher() {
  const { currentBranch, branches, switchBranch, isLoading } = useBranch();
  const [isOpen, setIsOpen] = useState(false);

  const activeBranches = branches.filter((b) => b.status === "active");

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--muted)] text-sm">
        <div className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        <span className="text-[var(--muted-foreground)]">Loading...</span>
      </div>
    );
  }

  // Show message if no branches
  if (!currentBranch || branches.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--muted)] text-sm">
        <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21a3 3 0 003-3V9a3 3 0 00-3-3h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0013.172 4H10.828a2 2 0 00-1.414.586L8.293 5.707A1 1 0 017.586 6H6a3 3 0 00-3 3v9a3 3 0 003 3h13.5z" />
        </svg>
        <span className="text-[var(--muted-foreground)]">No branches</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] transition-colors text-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21a3 3 0 003-3V9a3 3 0 00-3-3h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0013.172 4H10.828a2 2 0 00-1.414.586L8.293 5.707A1 1 0 017.586 6H6a3 3 0 00-3 3v9a3 3 0 003 3h13.5z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.75a3 3 0 106 0m-6 0a3 3 0 116 0m-6 0v1.5m6-1.5v1.5m-6 0h6m-6 0H9m6 0h.75" />
        </svg>
        <span className="font-medium text-[var(--foreground)]">{currentBranch.name}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-72 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-20 overflow-hidden">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                Switch Branch
              </div>
              {activeBranches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => {
                    switchBranch(branch.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    currentBranch?.id === branch.id
                      ? "bg-[var(--primary)] text-white"
                      : "hover:bg-[var(--muted)] text-[var(--foreground)]"
                  }`}
                >
                  <div className="font-medium">{branch.name}</div>
                  <div className={`text-xs mt-0.5 ${currentBranch?.id === branch.id ? "text-white/80" : "text-[var(--muted-foreground)]"}`}>
                    {branch.address}, {branch.city}
                  </div>
                </button>
              ))}
              {branches.filter((b) => b.status === "inactive").length > 0 && (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mt-2">
                    Inactive Branches
                  </div>
                  {branches
                    .filter((b) => b.status === "inactive")
                    .map((branch) => (
                      <button
                        key={branch.id}
                        onClick={() => {
                          switchBranch(branch.id);
                          setIsOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-[var(--muted)] text-[var(--muted-foreground)] opacity-60"
                        disabled
                      >
                        <div className="font-medium">{branch.name}</div>
                        <div className="text-xs mt-0.5">{branch.address}, {branch.city}</div>
                      </button>
                    ))}
                </>
              )}
            </div>
            <div className="border-t border-[var(--border)] p-2">
              <button className="w-full px-3 py-2 text-sm text-[var(--primary)] hover:bg-[var(--muted)] rounded-lg font-medium">
                + Add New Branch
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


