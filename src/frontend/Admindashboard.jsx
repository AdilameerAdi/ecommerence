import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getBrands,
  addBrand,
  updateBrand,
  deleteBrand,
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getAdminUser,
  logoutAdmin,
  changeAdminPassword,
  updateAdminUsername,
  uploadProductImage,
} from "../lib/supabase";

export default function AdminDashboard() {
  const [activePage, setActivePage] = useState("home");
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);

  // Check if admin is logged in
  useEffect(() => {
    const user = getAdminUser();
    // Admin user from session
    if (!user) {
      // No admin user found, redirecting to home
      navigate("/"); // Redirect to home if not logged in
    } else {
      // Setting admin user
      setAdminUser(user);
    }
  }, [navigate]);

  const handleLogout = () => {
    logoutAdmin(); // Clear session
    navigate("/"); // redirects to homepage
  };
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [brands, setBrands] = useState([]);
  const [newBrand, setNewBrand] = useState({ name: "", description: "" });
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Image upload states
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);

  // Mobile menu state
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Fetch categories from database
  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  // Fetch products when switching to products page
  useEffect(() => {
    if (activePage === "addProduct") {
      fetchProducts();
    }
  }, [activePage]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const data = await getBrands();
      setBrands(data);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { products: productData } = await getProducts(1, 100); // Get first 100 products
      setProducts(productData);
      setFilteredProducts(productData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Image upload helpers
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + uploadedImages.length > 4) {
      alert('Maximum 4 images allowed');
      return;
    }
    setImageFiles(prev => [...prev, ...files]);
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];

    setImageUploading(true);
    const uploadedUrls = [];

    try {
      for (const file of imageFiles) {
        const result = await uploadProductImage(file);
        if (result.success) {
          uploadedUrls.push(result.url);
        } else {
          alert(`Failed to upload ${file.name}: ${result.error}`);
        }
      }
      setUploadedImages(prev => [...prev, ...uploadedUrls]);
      setImageFiles([]);
      return uploadedUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images');
      return [];
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = (index, isUploaded = true) => {
    if (isUploaded) {
      setUploadedImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setImageFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const resetImageStates = () => {
    setUploadedImages([]);
    setImageFiles([]);
    setImageUploading(false);
  };

  // Search functionality
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.code.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  // Update filtered products when products change
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [products, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-black text-white p-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Admin Panel</h2>
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="text-white p-1"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${showMobileMenu ? 'block' : 'hidden'} lg:block w-full lg:w-1/5 xl:w-1/6 bg-black text-white p-4 lg:p-6 flex flex-col space-y-3 lg:space-y-4 min-h-screen lg:min-h-full`}>
        <h2 className="hidden lg:block text-xl xl:text-2xl font-bold mb-6 lg:mb-8">Admin Panel</h2>

        <div className="flex flex-col space-y-2 lg:space-y-3">
          <button
            onClick={() => {
              setActivePage("addCategory");
              setShowMobileMenu(false);
            }}
            className="w-full px-3 lg:px-4 py-3 lg:py-4 rounded-lg text-left hover:bg-gray-800 text-sm lg:text-base xl:text-lg transition-colors font-medium"
          >
            Add Category
          </button>

          <button
            onClick={() => {
              setActivePage("addBrand");
              setShowMobileMenu(false);
            }}
            className="w-full px-3 lg:px-4 py-3 lg:py-4 rounded-lg text-left hover:bg-gray-800 text-sm lg:text-base xl:text-lg transition-colors font-medium"
          >
            Add Brand
          </button>

          <button
            onClick={() => {
              setActivePage("addProduct");
              setShowMobileMenu(false);
            }}
            className="w-full px-3 lg:px-4 py-3 lg:py-4 rounded-lg text-left hover:bg-gray-800 text-sm lg:text-base xl:text-lg transition-colors font-medium"
          >
            Add Product
          </button>

          <button
            onClick={() => {
              setActivePage("trending");
              setShowMobileMenu(false);
            }}
            className="w-full px-3 lg:px-4 py-3 lg:py-4 rounded-lg text-left hover:bg-gray-800 text-sm lg:text-base xl:text-lg transition-colors font-medium"
          >
            Trending Products
          </button>

          <button
            onClick={() => {
              setActivePage("settings");
              setShowMobileMenu(false);
            }}
            className="w-full px-3 lg:px-4 py-3 lg:py-4 rounded-lg text-left hover:bg-gray-800 text-sm lg:text-base xl:text-lg transition-colors font-medium"
          >
            Manage Settings
          </button>

          <button
            onClick={() => {
              setActivePage("slidingContent");
              setShowMobileMenu(false);
            }}
            className="w-full px-3 lg:px-4 py-3 lg:py-4 rounded-lg text-left hover:bg-gray-800 text-sm lg:text-base xl:text-lg transition-colors font-medium"
          >
            Sliding Content
          </button>
        </div>

        <button
          onClick={() => {
            handleLogout();
            setShowMobileMenu(false);
          }}
          className="w-full px-3 lg:px-4 py-3 lg:py-4 rounded-lg text-left hover:bg-red-600 mt-auto text-sm lg:text-base xl:text-lg transition-colors font-medium"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:w-4/5 xl:w-5/6 p-4 sm:p-6 lg:p-8">
        {activePage === "home" && (
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-4">Welcome, Admin</h1>
            <p className="text-gray-700 text-sm sm:text-base">
              Select an option from the menu to manage your dashboard.
            </p>
          </div>
        )}

    {activePage === "addCategory" && (
  <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg sm:rounded-2xl p-4 sm:p-6 lg:p-10">
    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center border-b-2 border-gray-200 pb-4">
      Category Management
    </h1>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
      {/* Left Side: Add Category Form */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800">Add Category</h2>
        <form
          className="space-y-4 sm:space-y-6"
          onSubmit={async (e) => {
            e.preventDefault();
            if (newCategory.trim() === "") return;

            setLoading(true);
            const result = await addCategory(newCategory);
            if (result.success) {
              await fetchCategories();
              setNewCategory("");
              alert('Category added successfully!');
            } else {
              alert('Error adding category: ' + result.error);
            }
            setLoading(false);
          }}
        >
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
              Category Name
            </label>
            <input
              type="text"
              placeholder="Enter category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 sm:py-3 text-sm sm:text-base bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 shadow-md transition duration-300"
          >
            Add Category
          </button>
        </form>
      </div>

      {/* Right Side: Category List */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800">Existing Categories</h2>
        {categories.length === 0 ? (
          <p className="text-gray-500 text-sm sm:text-base">No categories added yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-3 sm:px-4 lg:px-5 py-3 hover:bg-gray-50 transition duration-200 gap-2 sm:gap-0"
              >
                <span className="text-gray-800 font-medium text-sm sm:text-base">{cat.name}</span>
                <div className="flex gap-2 self-end sm:self-auto">
                  <button
                    onClick={async () => {
                      const newName = prompt("Edit category name", cat.name);
                      if (newName && newName !== cat.name) {
                        setLoading(true);
                        const result = await updateCategory(cat.id, newName);
                        if (result.success) {
                          await fetchCategories();
                          alert('Category updated successfully!');
                        } else {
                          alert('Error updating category: ' + result.error);
                        }
                        setLoading(false);
                      }
                    }}
                    className="px-2 sm:px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-800 text-xs sm:text-sm transition duration-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm(`Are you sure you want to delete "${cat.name}"?`)) {
                        setLoading(true);
                        const result = await deleteCategory(cat.id);
                        if (result.success) {
                          await fetchCategories();
                          alert('Category deleted successfully!');
                        } else {
                          alert('Error deleting category: ' + result.error);
                        }
                        setLoading(false);
                      }
                    }}
                    className="px-2 sm:px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs sm:text-sm transition duration-300"
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

{activePage === "addBrand" && (
  <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg sm:rounded-2xl p-4 sm:p-6 lg:p-10">
    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center border-b-2 border-gray-200 pb-4">
      Brand Management
    </h1>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
      {/* Left Side: Add Brand Form */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800">Add Brand</h2>
        <form
          className="space-y-4 sm:space-y-6"
          onSubmit={async (e) => {
            e.preventDefault();
            if (newBrand.name.trim() === "") return;
            setLoading(true);
            const result = await addBrand(newBrand);
            if (result.success) {
              await fetchBrands();
              setNewBrand({ name: "", description: "" });
              alert('Brand added successfully!');
            } else {
              alert('Error adding brand: ' + result.error);
            }
            setLoading(false);
          }}
        >
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
              Brand Name
            </label>
            <input
              type="text"
              placeholder="Enter brand name"
              value={newBrand.name}
              onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
              className="w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
              Description (Optional)
            </label>
            <textarea
              placeholder="Enter brand description"
              value={newBrand.description}
              onChange={(e) => setNewBrand({ ...newBrand, description: e.target.value })}
              className="w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300"
              rows="3"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 sm:py-3 text-sm sm:text-base bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 shadow-md transition duration-300"
          >
            Add Brand
          </button>
        </form>
      </div>

      {/* Right Side: Brand List */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800">Brands</h2>
        {brands.length === 0 ? (
          <p className="text-gray-500 italic text-sm sm:text-base">No brands available.</p>
        ) : (
          <ul className="space-y-2 sm:space-y-3">
            {brands.map((brand) => (
              <li key={brand.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{brand.name}</h3>
                  {brand.description && (
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">{brand.description}</p>
                  )}
                </div>
                <div className="flex space-x-1 sm:space-x-2">
                  <button
                    onClick={async () => {
                      const newName = prompt("Edit brand name:", brand.name);
                      const newDescription = prompt("Edit brand description (optional):", brand.description || "");
                      if (newName) {
                        setLoading(true);
                        const result = await updateBrand(brand.id, { name: newName, description: newDescription });
                        if (result.success) {
                          await fetchBrands();
                          alert('Brand updated successfully!');
                        } else {
                          alert('Error updating brand: ' + result.error);
                        }
                        setLoading(false);
                      }
                    }}
                    className="px-2 sm:px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-800 text-xs sm:text-sm transition duration-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm(`Are you sure you want to delete "${brand.name}"?`)) {
                        setLoading(true);
                        const result = await deleteBrand(brand.id);
                        if (result.success) {
                          await fetchBrands();
                          alert('Brand deleted successfully!');
                        } else {
                          alert('Error deleting brand: ' + result.error);
                        }
                        setLoading(false);
                      }
                    }}
                    className="px-2 sm:px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs sm:text-sm transition duration-300"
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
  <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg sm:rounded-2xl p-4 sm:p-6 lg:p-10">
    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center border-b-2 border-gray-200 pb-4">
      Product Management
    </h1>

    {/* Add Product Form */}
    <form
      className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        // Upload any remaining images first
        const newImageUrls = await uploadImages();
        const allImages = [...uploadedImages, ...newImageUrls];

        const productData = {
          name: formData.get('name'),
          code: formData.get('code'),
          retail_price: formData.get('retail_price') ? parseFloat(formData.get('retail_price')) : null,
          price: parseFloat(formData.get('price')),
          ending_price: formData.get('ending_price') ? parseFloat(formData.get('ending_price')) : null,
          description: formData.get('description'),
          category_id: parseInt(formData.get('category_id')),
          reseller_name: formData.get('reseller_name'),
          brand_id: formData.get('brand_id') ? parseInt(formData.get('brand_id')) : null,
          is_trending: formData.get('is_trending') === 'on',
          images: allImages
        };

        setLoading(true);
        const result = await addProduct(productData);
        if (result.success) {
          await fetchProducts();
          e.target.reset();
          resetImageStates(); // Reset image upload states
          alert('Product added successfully!');
        } else {
          alert('Error adding product: ' + result.error);
        }
        setLoading(false);
      }}
    >
      {/* Product Name */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Product Name</label>
        <input
          type="text"
          name="name"
          placeholder="Enter product name"
          required
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Product Code */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Product Code</label>
        <input
          type="text"
          name="code"
          placeholder="Enter product code"
          required
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Retail Price */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Retail Price</label>
        <input
          type="number"
          name="retail_price"
          step="0.01"
          placeholder="Enter retail price (optional)"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Starting Price */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Starting Price</label>
        <input
          type="number"
          name="price"
          step="0.01"
          placeholder="Enter starting price"
          required
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Ending Price */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Ending Price</label>
        <input
          type="number"
          name="ending_price"
          step="0.01"
          placeholder="Enter ending price (optional)"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Category Dropdown */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Category</label>
        <select
          name="category_id"
          required
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      {/* Reseller Name */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Reseller Name *</label>
        <input
          type="text"
          name="reseller_name"
          placeholder="Enter reseller name"
          required
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      {/* Brand */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Brand</label>
        <select
          name="brand_id"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select Brand (Optional)</option>
          {brands.map(brand => (
            <option key={brand.id} value={brand.id}>{brand.name}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="md:col-span-2">
        <label className="block text-gray-700 font-medium mb-2">Description</label>
        <textarea
          name="description"
          placeholder="Enter product description"
          rows="3"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Product Images */}
      <div className="md:col-span-2">
        <label className="block text-gray-700 font-medium mb-2">Product Images (max 4)</label>

        {/* File Upload Input */}
        <div className="mb-4">
          <label htmlFor="product-images" className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 hover:border-indigo-400 transition-colors cursor-pointer block text-center bg-gray-50 hover:bg-gray-100">
            <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-gray-600">Click to upload images or drag and drop</span>
            <span className="block text-sm text-gray-400 mt-1">Up to 4 images (JPG, PNG, WebP)</span>
          </label>
          <input
            type="file"
            id="product-images"
            multiple
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            disabled={uploadedImages.length + imageFiles.length >= 4}
          />
          <p className="text-sm text-gray-500 mt-1">
            Select up to 4 images. Supported formats: JPG, PNG, WebP
          </p>
        </div>

        {/* Selected Files Preview */}
        {imageFiles.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {imageFiles.map((file, index) => (
                <div key={index} className="relative border rounded-lg p-2">
                  <div className="text-xs text-gray-600 truncate">{file.name}</div>
                  <button
                    type="button"
                    onClick={() => removeImage(index, false)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={uploadImages}
              disabled={imageUploading}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {imageUploading ? 'Uploading...' : 'Upload Images'}
            </button>
          </div>
        )}

        {/* Uploaded Images Preview */}
        {uploadedImages.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Images:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {uploadedImages.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index, true)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Trending Checkbox */}
      <div className="md:col-span-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="is_trending"
            className="mr-2"
          />
          <span className="text-gray-700 font-medium">Mark as Trending Product</span>
        </label>
      </div>

      {/* Submit Button */}
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 shadow-md transition duration-300 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Add Product'}
        </button>
      </div>
    </form>

    {/* Product List from Database */}
    <div className="mt-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-900">Product List</h2>
        
        {/* Search Bar */}
        <div className="w-full sm:w-80">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-4">Loading products...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          {searchQuery ? `No products found matching "${searchQuery}"` : "No products found. Add your first product above!"}
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
          {filteredProducts.map((product) => (
            <li key={product.id} className="flex justify-between items-center px-5 py-4 hover:bg-gray-50 transition duration-200">
              <div>
                <p className="font-semibold text-gray-800">{product.name}</p>
                <p className="text-sm text-gray-600">
                  Code: {product.code} | Price: ${product.price} | Category: {product.categories?.name || 'N/A'}
                  {product.is_trending && ' | 🔥 Trending'}
                </p>
                <p className="text-sm text-gray-500">
                  {product.description || 'No description'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingProduct(product);
                    setShowEditModal(true);
                  }}
                  className="px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-800 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={async () => {
                    if (confirm(`Delete product "${product.name}"?`)) {
                      setLoading(true);
                      const result = await deleteProduct(product.id);
                      if (result.success) {
                        await fetchProducts();
                        alert('Product deleted!');
                      } else {
                        alert('Error: ' + result.error);
                      }
                      setLoading(false);
                    }
                  }}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>

    {/* Edit Product Modal */}
    {showEditModal && editingProduct && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-4xl p-4 sm:p-6 lg:p-8 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Edit Product</h2>
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditingProduct(null);
                resetImageStates();
              }}
              className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            >
              ×
            </button>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);

              // Upload any remaining images first
              const newImageUrls = await uploadImages();
              const allImages = [...uploadedImages, ...newImageUrls];

              const productData = {
                name: formData.get('name'),
                code: formData.get('code'),
                retail_price: formData.get('retail_price') ? parseFloat(formData.get('retail_price')) : null,
                price: parseFloat(formData.get('price')),
                ending_price: formData.get('ending_price') ? parseFloat(formData.get('ending_price')) : null,
                description: formData.get('description'),
                category_id: parseInt(formData.get('category_id')),
                reseller_name: formData.get('reseller_name'),
                brand_id: formData.get('brand_id') ? parseInt(formData.get('brand_id')) : null,
                is_trending: formData.get('is_trending') === 'on',
                // Only update images if new ones were uploaded
                images: allImages.length > 0 ? allImages : undefined
              };

              setLoading(true);
              const result = await updateProduct(editingProduct.id, productData);
              if (result.success) {
                await fetchProducts();
                setShowEditModal(false);
                setEditingProduct(null);
                resetImageStates(); // Reset image upload states
                alert('Product updated successfully!');
              } else {
                alert('Error updating product: ' + result.error);
              }
              setLoading(false);
            }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
          >
            {/* Product Name */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Product Name</label>
              <input
                type="text"
                name="name"
                defaultValue={editingProduct.name}
                placeholder="Enter product name"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Product Code */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Product Code</label>
              <input
                type="text"
                name="code"
                defaultValue={editingProduct.code}
                placeholder="Enter product code"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Retail Price */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Retail Price</label>
              <input
                type="number"
                name="retail_price"
                step="0.01"
                defaultValue={editingProduct.retail_price}
                placeholder="Enter retail price (optional)"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Starting Price */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Starting Price</label>
              <input
                type="number"
                name="price"
                step="0.01"
                defaultValue={editingProduct.price}
                placeholder="Enter starting price"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Ending Price */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Ending Price</label>
              <input
                type="number"
                name="ending_price"
                step="0.01"
                defaultValue={editingProduct.ending_price}
                placeholder="Enter ending price (optional)"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Category</label>
              <select
                name="category_id"
                defaultValue={editingProduct.category_id}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            {/* Reseller Name */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Reseller Name *</label>
              <input
                type="text"
                name="reseller_name"
                defaultValue={editingProduct.reseller_name || ''}
                placeholder="Enter reseller name"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {/* Brand */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Brand</label>
              <select
                name="brand_id"
                defaultValue={editingProduct.brand_id}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Brand (Optional)</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2">Description</label>
              <textarea
                name="description"
                defaultValue={editingProduct.description || ''}
                placeholder="Enter product description"
                rows="3"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Product Images */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2">Product Images (max 4)</label>

              {/* Current Images */}
              {editingProduct.product_images && editingProduct.product_images.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Current Images:</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {editingProduct.product_images.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img.image_url}
                          alt={`Current ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    To change images, upload new ones below. This will replace all current images.
                  </p>
                </div>
              )}

              {/* File Upload Input */}
              <div className="mb-4">
                <label htmlFor="edit-product-images" className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 hover:border-indigo-400 transition-colors cursor-pointer block text-center bg-gray-50 hover:bg-gray-100">
                  <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-gray-600">Click to upload new images</span>
                  <span className="block text-sm text-gray-400 mt-1">Up to 4 images (JPG, PNG, WebP)</span>
                </label>
                <input
                  type="file"
                  id="edit-product-images"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={uploadedImages.length + imageFiles.length >= 4}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Select up to 4 new images to replace current ones. Supported formats: JPG, PNG, WebP
                </p>
              </div>

              {/* Selected Files Preview */}
              {imageFiles.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {imageFiles.map((file, index) => (
                      <div key={index} className="relative border rounded-lg p-2">
                        <div className="text-xs text-gray-600 truncate">{file.name}</div>
                        <button
                          type="button"
                          onClick={() => removeImage(index, false)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={uploadImages}
                    disabled={imageUploading}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {imageUploading ? 'Uploading...' : 'Upload Images'}
                  </button>
                </div>
              )}

              {/* New Uploaded Images Preview */}
              {uploadedImages.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">New Images to Use:</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {uploadedImages.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`New ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index, true)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Trending Checkbox */}
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_trending"
                  defaultChecked={editingProduct.is_trending}
                  className="mr-2"
                />
                <span className="text-gray-700 font-medium">Mark as Trending Product</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-2 flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 shadow-md transition duration-300 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Product'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProduct(null);
                  resetImageStates();
                }}
                className="flex-1 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 shadow-md transition duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
)}

        {activePage === "trending" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Trending Products Management</h1>
            <p className="text-gray-600 mb-6">
              Here you can view and manage trending products. Products marked as trending will display with a 🔥 TRENDING badge.
            </p>

            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="text-lg">Loading trending products...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products
                  .filter(product => product.is_trending)
                  .map((product) => (
                    <div key={product.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 relative">
                      {/* Trending Badge */}
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        🔥 TRENDING
                      </div>

                      {/* Product Image */}
                      <img
                        src={product.product_images?.[0]?.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />

                      {/* Product Info */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                      <p className="text-green-600 font-bold text-sm mb-2">${product.price}</p>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setShowEditModal(true);
                          }}
                          className="flex-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Remove "${product.name}" from trending?`)) {
                              setLoading(true);
                              const result = await updateProduct(product.id, { ...product, is_trending: false });
                              if (result.success) {
                                await fetchProducts();
                                alert('Product removed from trending!');
                              } else {
                                alert('Error: ' + result.error);
                              }
                              setLoading(false);
                            }
                          }}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* No trending products message */}
            {!loading && products.filter(product => product.is_trending).length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">No trending products found</div>
                <p className="text-gray-400">Mark products as trending when adding/editing them to see them here.</p>
              </div>
            )}
          </div>
        )}
{activePage === "settings" && (
  <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg sm:rounded-2xl p-4 sm:p-6 lg:p-10">
    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center border-b border-gray-300 pb-4">
      Manage Settings
    </h1>

    {/* Current User Info */}
    <div className="mb-6 sm:mb-8 p-4 bg-gray-100 rounded-lg">
      <p className="text-gray-700 text-sm sm:text-base lg:text-lg">
        <strong>Current Username:</strong> {adminUser?.username || 'Unknown'}
      </p>
    </div>

    {/* Change Username */}
    <div className="mb-12 p-6 border border-gray-200 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Username</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const newUsername = formData.get('username');

          if (!newUsername || newUsername === adminUser?.username) {
            alert('Please enter a different username');
            return;
          }

          setLoading(true);
          try {
            // Check if we have valid admin user data
            // Current adminUser state and session storage check

            if (!adminUser || !adminUser.id) {
              alert('Session expired. Please login again.');
              handleLogout();
              return;
            }

            const result = await updateAdminUsername(adminUser.id, newUsername);

            if (result.success) {
              alert('Username updated successfully! Please login again with your new username.');
              handleLogout(); // Force re-login with new credentials
            } else {
              alert('Error updating username: ' + (result.error || 'Username may already exist'));
            }
          } catch (error) {
            alert('Error updating username: ' + error.message);
          }
          setLoading(false);
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-left text-gray-700 mb-2">New Username</label>
          <input
            type="text"
            name="username"
            placeholder="Enter new username"
            required
            className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Username'}
        </button>
      </form>
    </div>

    {/* Change Password */}
    <div className="p-6 border border-gray-200 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const oldPassword = formData.get('oldPassword');
          const newPassword = formData.get('newPassword');
          const confirmPassword = formData.get('confirmPassword');

          if (newPassword !== confirmPassword) {
            alert('New passwords do not match!');
            return;
          }

          if (newPassword.length < 6) {
            alert('Password must be at least 6 characters long!');
            return;
          }

          setLoading(true);
          try {
            // Check if we have valid admin user data
            // Current adminUser state for password and session storage check

            if (!adminUser || !adminUser.username) {
              alert('Session expired. Please login again.');
              handleLogout();
              return;
            }

            const result = await changeAdminPassword(adminUser.username, oldPassword, newPassword);

            if (result.success) {
              alert('Password updated successfully! Please login again with your new password.');
              e.target.reset();
              handleLogout(); // Force re-login with new password
            } else {
              alert('Error: ' + (result.error || 'Current password is incorrect. Please try again.'));
            }
          } catch (error) {
            alert('Error changing password: ' + error.message);
          }
          setLoading(false);
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-left text-gray-700 mb-2">Current Password</label>
          <input
            type="password"
            name="oldPassword"
            placeholder="Enter current password"
            required
            className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div>
          <label className="block text-left text-gray-700 mb-2">New Password</label>
          <input
            type="password"
            name="newPassword"
            placeholder="Enter new password (min 6 characters)"
            required
            minLength="6"
            className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div>
          <label className="block text-left text-gray-700 mb-2">Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm new password"
            required
            minLength="6"
            className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>

    {/* Important Notes */}
    <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="font-semibold text-blue-800 mb-2">Important Notes:</h3>
      <ul className="text-sm text-blue-700 space-y-1">
        <li>• After changing your username, login with the new username</li>
        <li>• After changing your password, login with the new password</li>
        <li>• You will be automatically logged out after making changes</li>
        <li>• All credentials are stored securely in the database</li>
      </ul>
    </div>
  </div>
)}

{activePage === "slidingContent" && (
  <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg sm:rounded-2xl p-4 sm:p-6 lg:p-10">
    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center border-b border-gray-300 pb-4">
      Manage Sliding Content
    </h1>

    <div className="p-6 border border-gray-200 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Update Marquee Text</h2>
      <p className="text-sm text-gray-600 mb-4">
        This content will appear as a scrolling text on the top of the landing page.
      </p>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const content = formData.get('content');

          if (!content || content.trim() === '') {
            alert('Please enter some content');
            return;
          }

          setLoading(true);
          try {
            const { updateSlidingContent } = await import('../lib/supabase');
            const result = await updateSlidingContent(content);

            if (result.success) {
              alert('Sliding content updated successfully!');
            } else {
              alert('Error updating content: ' + result.error);
            }
          } catch (error) {
            alert('Error: ' + error.message);
          }
          setLoading(false);
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Enter Message (2-3 lines)
          </label>
          <textarea
            name="content"
            rows="3"
            placeholder="Enter your announcement or message here. It will scroll continuously on the landing page..."
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Tip: Keep it short and engaging. This will be displayed as scrolling text.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 font-medium"
        >
          {loading ? 'Updating...' : 'Update Sliding Content'}
        </button>
      </form>
    </div>
  </div>
)}



      </div>
    </div>
  );
}
