import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./frontend/header";
import Navbar from "./frontend/navbar";
import FilterBar from "./frontend/filter";
import Products from "./frontend/products";
import Footer from "./frontend/footer";
import AdminDashboard from "./frontend/Admindashboard"; // imported here
import SaleBanner from "./frontend/Trending";
import ProductCodeSearch from "./frontend/ProductCodeSearch";
import AdvertisementPopup from "./frontend/AdvertisementPopup";
import ProductDetail from "./frontend/ProductDetail";
import CategoryCards from "./frontend/CategoryCards";
import BrandSelection from "./frontend/BrandSelection";
import "./responsive.css"; // Import responsive styles

function HomePage() {
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [codeSearchQuery, setCodeSearchQuery] = useState("");
  
  // Navigation state
  const [currentView, setCurrentView] = useState('categories'); // 'categories', 'brands', 'products'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Clear code search when using main search
    setCodeSearchQuery("");
    // If there's a search query, show products
    if (query.trim()) {
      setCurrentView('products');
    }
  };

  const handleCodeSearch = (codeQuery) => {
    setCodeSearchQuery(codeQuery);
    // Clear main search when using code search
    setSearchQuery("");
    // If there's a code search query, show products
    if (codeQuery.trim()) {
      setCurrentView('products');
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentView('brands');
    // Clear any existing filters and search
    setFilters({});
    setSearchQuery("");
    setCodeSearchQuery("");
  };

  const handleBrandSelect = (brand, category) => {
    setSelectedBrand(brand);
    setSelectedCategory(category);
    setCurrentView('products');
    // Set filters for the selected category and brand
    setFilters({
      category: category.id.toString(),
      brandIds: [brand.id],
      price: [0, 200000],
      sort: "",
      trending: ""
    });
    // Clear search queries
    setSearchQuery("");
    setCodeSearchQuery("");
  };

  const handleBackToCategories = () => {
    setCurrentView('categories');
    setSelectedCategory(null);
    setSelectedBrand(null);
    setFilters({});
    setSearchQuery("");
    setCodeSearchQuery("");
  };

  const handleBackToBrands = () => {
    setCurrentView('brands');
    setSelectedBrand(null);
    // Keep category filter but remove brand filter
    setFilters({
      category: selectedCategory?.id.toString(),
      brandIds: [],
      price: [0, 200000],
      sort: "",
      trending: ""
    });
  };

  // Show products if there's an active search or if we're in products view
  const showProducts = currentView === 'products' || searchQuery || codeSearchQuery;

  return (
    <>
      <AdvertisementPopup 
        delay={2500} // 2.5 seconds delay
        showOnEveryVisit={true} // Show popup on every visit/refresh
      />
      <Header />
      <Navbar onSearch={handleSearch} />
      <SaleBanner />
      <ProductCodeSearch onCodeSearch={handleCodeSearch} />
      
      {/* Show filter bar only when viewing products */}
      {showProducts && (
        <FilterBar 
          onFiltersChange={handleFiltersChange}
          hideCategoryFilter={selectedCategory !== null}
          hideBrandFilter={selectedBrand !== null}
        />
      )}
      
      {/* Conditional rendering based on current view */}
      {currentView === 'categories' && !searchQuery && !codeSearchQuery && (
        <CategoryCards onCategorySelect={handleCategorySelect} />
      )}
      
      {currentView === 'brands' && selectedCategory && !searchQuery && !codeSearchQuery && (
        <BrandSelection 
          selectedCategory={selectedCategory}
          onBrandSelect={handleBrandSelect}
          onBackToCategories={handleBackToCategories}
        />
      )}
      
      {showProducts && (
        <Products 
          filters={filters} 
          searchQuery={searchQuery} 
          codeSearchQuery={codeSearchQuery}
          selectedCategory={selectedCategory}
          selectedBrand={selectedBrand}
          onBackToBrands={selectedBrand ? handleBackToBrands : null}
          onBackToCategories={handleBackToCategories}
        />
      )}
      
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Main Website */}
        <Route path="/" element={<HomePage />} />

        {/* Product Detail Page */}
        <Route path="/product/:productId" element={<ProductDetail />} />

        {/* Admin Dashboard */}
        <Route path="/admindashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}
