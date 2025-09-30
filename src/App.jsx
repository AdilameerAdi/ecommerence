import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./frontend/header";
import Navbar from "./frontend/navbar";
import FilterBar from "./frontend/filter";
import Products from "./frontend/products";
import Footer from "./frontend/footer";
import AdminDashboard from "./frontend/Admindashboard"; // imported here
import SaleBanner from "./frontend/Trending";
import "./responsive.css"; // Import responsive styles

function HomePage() {
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };


  return (
    <>
      <Header />
      <Navbar onSearch={handleSearch} />
      <SaleBanner />
      <FilterBar onFiltersChange={handleFiltersChange} />
      <Products filters={filters} searchQuery={searchQuery} />
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

        {/* Admin Dashboard */}
        <Route path="/admindashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}
