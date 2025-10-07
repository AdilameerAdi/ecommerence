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
import "./responsive.css"; // Import responsive styles

function HomePage() {
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [codeSearchQuery, setCodeSearchQuery] = useState("");

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Clear code search when using main search
    setCodeSearchQuery("");
  };

  const handleCodeSearch = (codeQuery) => {
    setCodeSearchQuery(codeQuery);
    // Clear main search when using code search
    setSearchQuery("");
  };

  return (
    <>
      <AdvertisementPopup 
        delay={2500} // 2.5 seconds delay
        showOnEveryVisit={false} // Set to true if you want to show on every visit
      />
      <Header />
      <Navbar onSearch={handleSearch} />
      <SaleBanner />
      <ProductCodeSearch onCodeSearch={handleCodeSearch} />
      <FilterBar onFiltersChange={handleFiltersChange} />
      <Products filters={filters} searchQuery={searchQuery} codeSearchQuery={codeSearchQuery} />
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
