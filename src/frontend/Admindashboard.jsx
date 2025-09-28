import React, { useState } from "react";

export default function AdminDashboard() {
  const [activePage, setActivePage] = useState("home");

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/5 bg-black text-white p-6 flex flex-col space-y-4">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <button
          onClick={() => setActivePage("users")}
          className="px-4 py-2 rounded-lg text-left hover:bg-gray-800"
        >
          Manage Users
        </button>
        <button
          onClick={() => setActivePage("reports")}
          className="px-4 py-2 rounded-lg text-left hover:bg-gray-800"
        >
          View Reports
        </button>
        <button
          onClick={() => setActivePage("settings")}
          className="px-4 py-2 rounded-lg text-left hover:bg-gray-800"
        >
          Settings
        </button>
        <button
          onClick={() => setActivePage("logout")}
          className="px-4 py-2 rounded-lg text-left hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="w-4/5 p-8">
        {activePage === "home" && (
          <div>
            <h1 className="text-3xl font-bold mb-4">Welcome, Admin</h1>
            <p className="text-gray-700">
              Select an option from the left menu to manage your dashboard.
            </p>
          </div>
        )}

        {activePage === "users" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
            <p className="text-gray-600">Here you can view and manage users.</p>
          </div>
        )}

        {activePage === "reports" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Reports</h1>
            <p className="text-gray-600">Here you can view reports and logs.</p>
          </div>
        )}

        {activePage === "settings" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            <form className="space-y-4 max-w-md">
              <div>
                <label className="block text-left text-gray-700 mb-1">
                  Change Username
                </label>
                <input
                  type="text"
                  placeholder="Enter new username"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-left text-gray-700 mb-1">
                  Change Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                Save Changes
              </button>
            </form>
          </div>
        )}

        {activePage === "logout" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">You have logged out</h1>
            <p className="text-gray-600">Redirecting to login...</p>
          </div>
        )}
      </div>
    </div>
  );
}
