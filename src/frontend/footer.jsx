import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoimg from "../img/logo.png"; // your logo
import { validateAdminLogin } from "../lib/supabase";

export default function Footer() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate credentials from database
      const result = await validateAdminLogin(form.username, form.password);

      if (result.success) {
        setShowModal(false);
        setForm({ username: "", password: "" });
        navigate("/admindashboard"); // redirect to dashboard
      } else {
        setError("Invalid username or password. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-black text-white py-6 sm:py-8 mt-8 sm:mt-12 relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
        {/* Logo */}
        <div className="flex items-center justify-center sm:justify-start">
          <img
            src={logoimg}
            alt="Logo"
            className="w-24 h-16 sm:w-32 sm:h-20 lg:w-[150px] lg:h-[100px] rounded-sm object-cover"
          />
        </div>

        {/* Small text */}
        <p className="text-gray-400 text-xs sm:text-sm text-center order-3 sm:order-2">
          © {new Date().getFullYear()} YourBrand. All rights reserved.
        </p>

        {/* Admin Login Button */}
        <button
          onClick={() => setShowModal(true)}
          className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-white text-black rounded-lg hover:bg-gray-200 transition order-2 sm:order-3"
        >
          Admin Login
        </button>
      </div>

      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-3 sm:p-4">
          {/* Blurred Background */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          ></div>

          {/* Card Popup */}
          <div className="relative bg-white text-black rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md p-4 sm:p-6 animate-fadeIn z-10">
            {/* Close (X) Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            >
              ×
            </button>

            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-center pr-8">
              Admin Login
            </h2>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username */}
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                required
              />

              {/* Password */}
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                required
              />

              {/* Error Message */}
              {error && (
                <div className="text-red-500 text-xs sm:text-sm text-center bg-red-50 p-2 rounded-lg">
                  {error}
                </div>
              )}

              {/* Login Button */}
              <div className="flex justify-center mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </footer>
  );
}
