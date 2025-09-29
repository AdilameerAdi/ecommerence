import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [activePage, setActivePage] = useState("home");
   const navigate = useNavigate();
  const handleLogout = () => {
    // here you can also clear auth tokens or state if needed
    navigate("/"); // redirects to homepage or login
  };
  const [categories, setCategories] = useState([
  { id: 1, name: "Electronics" },
  { id: 2, name: "Fashion" },
]);
const [newCategory, setNewCategory] = useState("");

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/5 bg-black text-white p-6 flex flex-col space-y-4">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

        <button
          onClick={() => setActivePage("addCategory")}
          className="px-4 py-2 rounded-lg text-left hover:bg-gray-800"
        >
          Add Category
        </button>

        <button
          onClick={() => setActivePage("addProduct")}
          className="px-4 py-2 rounded-lg text-left hover:bg-gray-800"
        >
          Add Product
        </button>

        <button
          onClick={() => setActivePage("trending")}
          className="px-4 py-2 rounded-lg text-left hover:bg-gray-800"
        >
          Trending Products
        </button>

        <button
          onClick={() => setActivePage("settings")}
          className="px-4 py-2 rounded-lg text-left hover:bg-gray-800"
        >
          Manage Settings
        </button>

        <button
            onClick={handleLogout}
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

    {activePage === "addCategory" && (
  <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-10">
    <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center border-b-2 border-gray-200 pb-4">
      Category Management
    </h1>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {/* Left Side: Add Category Form */}
      <div>
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Add Category</h2>
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (newCategory.trim() === "") return;

            setCategories([...categories, { id: Date.now(), name: newCategory }]);
            setNewCategory("");
          }}
        >
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Category Name
            </label>
            <input
              type="text"
              placeholder="Enter category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 shadow-md transition duration-300"
          >
            Add Category
          </button>
        </form>
      </div>

      {/* Right Side: Category List */}
      <div>
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Existing Categories</h2>
        {categories.length === 0 ? (
          <p className="text-gray-500">No categories added yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="flex justify-between items-center px-5 py-3 hover:bg-gray-50 transition duration-200"
              >
                <span className="text-gray-800 font-medium">{cat.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const newName = prompt("Edit category name", cat.name);
                      if (newName) {
                        setCategories(
                          categories.map((c) =>
                            c.id === cat.id ? { ...c, name: newName } : c
                          )
                        );
                      }
                    }}
                    className="px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-800 text-sm transition duration-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      setCategories(categories.filter((c) => c.id !== cat.id))
                    }
                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition duration-300"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </div>
)}





{activePage === "addProduct" && (
  <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-10">
    <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center border-b-2 border-gray-200 pb-4">
      Product Management
    </h1>

    {/* Add Product Form (Static) */}
    <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Product Name */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Product Name</label>
        <input
          type="text"
          placeholder="Enter product name"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Product Code */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Product Code</label>
        <input
          type="text"
          placeholder="Enter product code"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Product Price */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Price</label>
        <input
          type="number"
          placeholder="Enter price"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Category Dropdown */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Category</label>
        <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
          <option>Select Category</option>
          <option>Electronics</option>
          <option>Clothing</option>
          <option>Watches</option>
          <option>Bags</option>
        </select>
      </div>

      {/* Description */}
      <div className="md:col-span-2">
        <label className="block text-gray-700 font-medium mb-2">Description</label>
        <textarea
          placeholder="Enter product description"
          rows="3"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Upload Images */}
      <div className="md:col-span-2">
        <label className="block text-gray-700 font-medium mb-2">Upload Images (max 4)</label>
        <input
          type="file"
          multiple
          accept="image/*"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Submit Button */}
      <div className="md:col-span-2">
        <button
          type="button"
          className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 shadow-md transition duration-300"
        >
          Add Product
        </button>
      </div>
    </form>

    {/* Static Product List */}
    <div className="mt-12">
      <h2 className="text-xl font-bold mb-6 text-gray-900">Product List</h2>
      <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
        <li className="flex justify-between items-center px-5 py-4 hover:bg-gray-50 transition duration-200">
          <div>
            <p className="font-semibold text-gray-800">Apple iPhone 15</p>
            <p className="text-sm text-gray-600">
              Code: IP15 | Price: $1200 | Category: Electronics
            </p>
            <p className="text-sm text-gray-500">
              Latest Apple iPhone 15 with A17 Bionic chip.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-800 text-sm">
              Edit
            </button>
            <button className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
              Delete
            </button>
          </div>
        </li>

        <li className="flex justify-between items-center px-5 py-4 hover:bg-gray-50 transition duration-200">
          <div>
            <p className="font-semibold text-gray-800">Nike Air Max</p>
            <p className="text-sm text-gray-600">
              Code: NAMX | Price: $180 | Category: Clothing
            </p>
            <p className="text-sm text-gray-500">
              Comfortable sneakers for running and casual wear.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-800 text-sm">
              Edit
            </button>
            <button className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
              Delete
            </button>
          </div>
        </li>

        <li className="flex justify-between items-center px-5 py-4 hover:bg-gray-50 transition duration-200">
          <div>
            <p className="font-semibold text-gray-800">Rolex Submariner</p>
            <p className="text-sm text-gray-600">
              Code: RLX01 | Price: $8500 | Category: Watches
            </p>
            <p className="text-sm text-gray-500">
              Luxury Rolex watch with automatic movement.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-800 text-sm">
              Edit
            </button>
            <button className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
              Delete
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
)}

        {activePage === "trending" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Trending Products</h1>
            <p className="text-gray-600">
              Here you can manage and view trending products.
            </p>
          </div>
        )}
{activePage === "settings" && (
  <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-10">
    <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center border-b border-gray-300 pb-4">
      Manage Settings
    </h1>

    {/* Change Username */}
    <div className="mb-12 p-6 border border-gray-200 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Username</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          alert("Username updated!");
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-left text-gray-700 mb-2">New Username</label>
          <input
            type="text"
            placeholder="Enter new username"
            className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
        >
          Update Username
        </button>
      </form>
    </div>

    {/* Change Password */}
    <div className="p-6 border border-gray-200 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          alert("Password updated!");
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-left text-gray-700 mb-2">New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
        >
          Update Password
        </button>
      </form>
    </div>
  </div>
)}


      
      </div>
    </div>
  );
}
