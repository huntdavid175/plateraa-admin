"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [touched, setTouched] = useState(false);

  const validateEmail = (value: string) => {
    if (touched && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError("Invalid email address");
    } else {
      setEmailError("");
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const handleEmailBlur = () => {
    setTouched(true);
    validateEmail(email);
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

      {/* Form Content */}
      <div className="px-8 py-12 max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Login</h1>
        <p className="text-gray-600 mb-8">Hi, Welcome back 👋</p>

        {/* Email Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
              emailError
                ? "border-red-400 focus:border-red-500"
                : "border-gray-200 focus:border-[#5046e5]"
            }`}
            placeholder="Enter your email"
          />
          {emailError && (
            <p className="mt-1.5 text-sm text-red-500">{emailError}</p>
          )}
        </div>

        {/* Password Input */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-[#5046e5] transition-colors pr-12"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#5046e5] focus:ring-[#5046e5]"
            />
            <span className="text-sm text-gray-600">Remember Me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-[#5046e5] hover:underline font-medium"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Login Button */}
        <button className="w-full py-3.5 bg-[#5046e5] text-white font-medium rounded-lg hover:bg-[#4238c9] transition-colors mb-6">
          Login
        </button>

        {/* Sign Up Link */}
        <p className="text-center text-gray-600">
          Not registered yet?{" "}
          <Link
            href="/signup"
            className="text-[#5046e5] font-medium hover:underline inline-flex items-center gap-1"
          >
            Create an account
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
