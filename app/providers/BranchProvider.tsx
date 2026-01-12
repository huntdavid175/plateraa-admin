"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

export type Branch = {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  status: "active" | "inactive";
};

type BranchContextType = {
  currentBranch: Branch | null;
  branches: Branch[];
  isLoading: boolean;
  setCurrentBranch: (branch: Branch) => void;
  switchBranch: (branchId: string) => void;
  refreshBranches: () => Promise<void>;
};

const BranchContext = createContext<BranchContextType | undefined>(undefined);

const SELECTED_BRANCH_KEY = "plateraa_selected_branch_id";

export function BranchProvider({ children }: { children: ReactNode }) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch branches from Supabase
  const fetchBranches = useCallback(async () => {
    const supabase = createClient();

    try {
      // Get current user's institution
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Get user's institution_id
      const { data: userData } = await supabase
        .from("users")
        .select("institution_id")
        .eq("auth_id", user.id)
        .single();

      if (!userData?.institution_id) {
        setIsLoading(false);
        return;
      }

      // Fetch branches for this institution
      const { data: branchesData, error } = await supabase
        .from("branches")
        .select("*")
        .eq("institution_id", userData.institution_id)
        .order("name");

      if (error) {
        console.error("Error fetching branches:", error);
        setIsLoading(false);
        return;
      }

      if (branchesData && branchesData.length > 0) {
        // Transform to match Branch type
        const transformedBranches: Branch[] = branchesData.map((b) => ({
          id: b.id,
          name: b.name,
          address: b.address || "",
          city: b.city || "",
          phone: b.phone || "",
          status: b.is_active ? "active" : "inactive",
        }));

        setBranches(transformedBranches);

        // Check localStorage for previously selected branch
        const savedBranchId = localStorage.getItem(SELECTED_BRANCH_KEY);
        const savedBranch = savedBranchId
          ? transformedBranches.find((b) => b.id === savedBranchId)
          : null;

        // Set current branch (saved or first one)
        setCurrentBranch(savedBranch || transformedBranches[0]);
      }
    } catch (err) {
      console.error("Error in fetchBranches:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const switchBranch = useCallback((branchId: string) => {
    const branch = branches.find((b) => b.id === branchId);
    if (branch) {
      setCurrentBranch(branch);
      // Save to localStorage
      localStorage.setItem(SELECTED_BRANCH_KEY, branchId);
    }
  }, [branches]);

  const handleSetCurrentBranch = useCallback((branch: Branch) => {
    setCurrentBranch(branch);
    localStorage.setItem(SELECTED_BRANCH_KEY, branch.id);
  }, []);

  const contextValue = useMemo(() => ({
    currentBranch,
    branches,
    isLoading,
    setCurrentBranch: handleSetCurrentBranch,
    switchBranch,
    refreshBranches: fetchBranches,
  }), [currentBranch, branches, isLoading, handleSetCurrentBranch, switchBranch, fetchBranches]);

  return (
    <BranchContext.Provider value={contextValue}>
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


