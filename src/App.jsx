import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./frontend/header";
import Navbar from "./frontend/navbar";
import FilterBar from "./frontend/filter";
import Products from "./frontend/products";
import Footer from "./frontend/footer";
import AdminDashboard from "./frontend/Admindashboard"; // imported here

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Main Website */}
        <Route
          path="/"
          element={
            <>
              <Header />
              <Navbar />
              <FilterBar />
              <Products />
              <Footer />
            </>
          }
        />

        {/* Admin Dashboard */}
        <Route path="/admindashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}
