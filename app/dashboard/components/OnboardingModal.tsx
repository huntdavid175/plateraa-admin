"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Institution fields
  const [institutionName, setInstitutionName] = useState("");
  const [institutionEmail, setInstitutionEmail] = useState("");
  const [institutionPhone, setInstitutionPhone] = useState("");
  const [institutionAddress, setInstitutionAddress] = useState("");
  const [institutionCity, setInstitutionCity] = useState("");

  // Branch fields
  const [branchName, setBranchName] = useState("Main Branch");
  const [branchAddress, setBranchAddress] = useState("");
  const [branchPhone, setBranchPhone] = useState("");

  const handleSubmit = async () => {
    if (!institutionName.trim()) {
      setError("Institution name is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const supabase = createClient();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Not authenticated");
        setIsLoading(false);
        return;
      }

      // Generate slug from institution name
      const slug = institutionName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      // Create institution
      const { data: institution, error: instError } = await supabase
        .from("institutions")
        .insert({
          name: institutionName,
          slug: slug + "-" + Date.now(),
          email: institutionEmail || user.email,
          phone: institutionPhone,
          address: institutionAddress,
          city: institutionCity,
        })
        .select()
        .single();

      if (instError) {
        setError(instError.message);
        setIsLoading(false);
        return;
      }

      // Create branch
      const { data: branch, error: branchError } = await supabase
        .from("branches")
        .insert({
          institution_id: institution.id,
          name: branchName || "Main Branch",
          address: branchAddress || institutionAddress,
          city: institutionCity,
          phone: branchPhone || institutionPhone,
          is_main_branch: true,
        })
        .select()
        .single();

      if (branchError) {
        setError(branchError.message);
        setIsLoading(false);
        return;
      }

      // Update user with institution and branch
      const { error: userError } = await supabase
        .from("users")
        .update({
          institution_id: institution.id,
          branch_id: branch.id,
          role: "owner",
        })
        .eq("auth_id", user.id);

      if (userError) {
        setError(userError.message);
        setIsLoading(false);
        return;
      }

      onComplete();
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-[#5046e5] px-6 py-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">Welcome to Plateraa!</h2>
              <p className="text-white/80 text-sm">Let&apos;s set up your restaurant</p>
            </div>
          </div>
          
          {/* Progress */}
          <div className="flex gap-2 mt-4">
            <div className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-white" : "bg-white/30"}`} />
            <div className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-white" : "bg-white/30"}`} />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Restaurant Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-[#5046e5] outline-none"
                  placeholder="e.g., Mama's Kitchen"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={institutionEmail}
                    onChange={(e) => setInstitutionEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-[#5046e5] outline-none"
                    placeholder="contact@restaurant.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={institutionPhone}
                    onChange={(e) => setInstitutionPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-[#5046e5] outline-none"
                    placeholder="+233 XX XXX XXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={institutionAddress}
                  onChange={(e) => setInstitutionAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-[#5046e5] outline-none"
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={institutionCity}
                  onChange={(e) => setInstitutionCity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-[#5046e5] outline-none"
                  placeholder="Accra"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">First Branch Details</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Set up your main branch location</p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Branch Name
                </label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-[#5046e5] outline-none"
                  placeholder="Main Branch"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Branch Address
                </label>
                <input
                  type="text"
                  value={branchAddress}
                  onChange={(e) => setBranchAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-[#5046e5] outline-none"
                  placeholder={institutionAddress || "Same as restaurant address"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Branch Phone
                </label>
                <input
                  type="tel"
                  value={branchPhone}
                  onChange={(e) => setBranchPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-[#5046e5] outline-none"
                  placeholder={institutionPhone || "+233 XX XXX XXXX"}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 flex justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 2 ? (
            <button
              onClick={() => {
                if (!institutionName.trim()) {
                  setError("Restaurant name is required");
                  return;
                }
                setError("");
                setStep(2);
              }}
              className="px-6 py-2.5 bg-[#5046e5] text-white font-medium rounded-lg hover:bg-[#4238c9] transition-colors"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-2.5 bg-[#5046e5] text-white font-medium rounded-lg hover:bg-[#4238c9] transition-colors disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Complete Setup"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
