"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type Branch = {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  status: "active" | "inactive";
};

const mockBranches: Branch[] = [
  {
    id: "branch-1",
    name: "Victoria Island Branch",
    address: "123 Admiralty Way",
    city: "Lagos",
    phone: "+234 801 234 5678",
    status: "active",
  },
  {
    id: "branch-2",
    name: "Lekki Branch",
    address: "456 Lekki Phase 1",
    city: "Lagos",
    phone: "+234 802 345 6789",
    status: "active",
  },
  {
    id: "branch-3",
    name: "Ikeja Branch",
    address: "789 Allen Avenue",
    city: "Lagos",
    phone: "+234 803 456 7890",
    status: "active",
  },
  {
    id: "branch-4",
    name: "Surulere Branch",
    address: "321 Bode Thomas",
    city: "Lagos",
    phone: "+234 804 567 8901",
    status: "inactive",
  },
];

type BranchContextType = {
  currentBranch: Branch;
  branches: Branch[];
  setCurrentBranch: (branch: Branch) => void;
  switchBranch: (branchId: string) => void;
};

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
  const [currentBranch, setCurrentBranch] = useState<Branch>(mockBranches[0]);

  const switchBranch = (branchId: string) => {
    const branch = mockBranches.find((b) => b.id === branchId);
    if (branch) {
      setCurrentBranch(branch);
    }
  };

  return (
    <BranchContext.Provider
      value={{
        currentBranch,
        branches: mockBranches,
        setCurrentBranch,
        switchBranch,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error("useBranch must be used within a BranchProvider");
  }
  return context;
}


