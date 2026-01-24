"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UnauthorizedPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Logo */}
      <div className="px-8 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 relative">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 4L10 20L18 4H6Z"
                fill="#5046e5"
                stroke="#5046e5"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-xl font-semibold text-[#5046e5]">Plateraa</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-12 max-w-md mx-auto text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-8">
          You don&apos;t have permission to access the admin dashboard.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-gray-600">
            Only <span className="font-semibold text-gray-900">owners</span> and{" "}
            <span className="font-semibold text-gray-900">managers</span> can
            access this area. If you believe this is an error, please contact
            your administrator.
          </p>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          className="w-full py-3.5 bg-[#5046e5] text-white font-medium rounded-lg hover:bg-[#4238c9] transition-colors mb-6"
        >
          Sign Out
        </button>

        {/* Back to Login Link */}
        <p className="text-center text-gray-600">
          Need a different account?{" "}
          <Link
            href="/login"
            className="text-[#5046e5] font-medium hover:underline inline-flex items-center gap-1"
          >
            Login here
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 17L17 7M17 7H7M17 7V17"
              />
            </svg>
          </Link>
        </p>
      </div>
    </div>
  );
}
