import React, { useState } from "react";

export default function Products() {
  // --- Static demo data (replace later with DB data) ---
  const allProducts = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    price: Math.floor(Math.random() * 2000) + 100,
    image: "https://via.placeholder.com/200x150.png?text=Product",
  }));

  // --- Pagination logic ---
  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(allProducts.length / itemsPerPage);

  const currentItems = allProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Our Products
      </h2>

      {/* --- Cards Grid --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map((item) => (
          <div
            key={item.id}
            className="bg-white border rounded-xl shadow-sm hover:shadow-md transition p-4 flex flex-col"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-40 object-cover rounded-lg mb-3"
            />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              {item.name}
            </h3>
            <p className="text-amber-600 font-bold text-sm mb-3">
              ${item.price}
            </p>
            <button className="mt-auto bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition">
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {/* --- Pagination --- */}
      <div className="flex justify-center mt-8 space-x-2">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50"
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => goToPage(i + 1)}
            className={`px-3 py-1 border rounded-lg text-sm ${
              currentPage === i + 1
                ? "bg-amber-500 text-white border-amber-500"
                : "hover:bg-gray-100"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </section>
  );
}
