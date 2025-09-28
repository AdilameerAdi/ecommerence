import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoimg from "../img/logo.png"; // your logo

export default function Footer() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Check credentials
    if (form.username === "adil" && form.password === "ameer") {
      setShowModal(false);
      navigate("/admindashboard"); // redirect to dashboard
    } else {
      alert("Invalid credentials! Try again.");
    }
  };

  return (
    <footer className="bg-black text-white py-8 mt-12 relative">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img
            src={logoimg}
            alt="Logo"
            className="w-[150px] h-[100px] rounded-sm object-cover"
          />
        </div>

        {/* Small text */}
        <p className="text-gray-400 text-sm text-center sm:text-right">
          © {new Date().getFullYear()} YourBrand. All rights reserved.
        </p>

        {/* Admin Login Button */}
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-gray-200 transition"
        >
          Admin Login
        </button>
      </div>

      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Blurred Background */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          ></div>

          {/* Card Popup */}
          <div className="relative bg-white text-black rounded-xl shadow-2xl w-96 p-6 animate-fadeIn z-10">
            {/* Close (X) Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black text-lg"
            >
              ×
            </button>

            <h2 className="text-xl font-semibold mb-4 text-center">
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
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500"
                required
              />

              {/* Password */}
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500"
                required
              />

              {/* Login Button */}
              <div className="flex justify-center mt-4">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800"
                >
                  Login
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
