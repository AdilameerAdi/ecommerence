import React, { useState } from "react";

export default function Products() {
  // --- Static demo data with real grayscale images ---
  const allProducts = [
    {
      id: 1,
      name: "Classic Watch",
      price: 1200,
      image: "https://www.shutterstock.com/image-photo/gold-fashionable-elegant-watch-classic-600nw-2477327319.jpg",
    },
    {
      id: 2,
      name: "Leather Bag",
      price: 2500,
      image: "https://media.istockphoto.com/id/1271796113/photo/women-is-holding-handbag-near-luxury-car.jpg?s=612x612&w=0&k=20&c=-jtXLmexNgRa-eKqA1X8UJ8QYWhW7XgDiWNmzuuCHmM=",
    },
    {
      id: 3,
      name: "Headphones",
      price: 1800,
      image: "https://cdn.thewirecutter.com/wp-content/media/2023/07/bluetoothheadphones-2048px-0876.jpg",
    },
    {
      id: 4,
      name: "Sunglasses",
      price: 900,
      image: "https://images.fashiontiy.com/products/T103D2F326/main_2.jpg?x-oss-process=image/interlace,1/format,webp",
    },
    {
      id: 5,
      name: "Shoes",
      price: 2200,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9wsx_w5qb1u71Q25DnFu_PK-0RCBGp1nBxQ&s",
    },
    {
      id: 6,
      name: "Perfume",
      price: 1500,
      image: "https://t4.ftcdn.net/jpg/06/03/38/93/360_F_603389392_zrDAzdlTpoeGKLTSYXX0jbpBSLff4gq8.jpg",
    },
    {
      id: 7,
      name: "Camera",
      price: 3000,
      image: "https://via.placeholder.com/200x150.png?text=Camera&grayscale",
    },
    {
      id: 8,
      name: "Wallet",
      price: 800,
      image: "https://via.placeholder.com/200x150.png?text=Wallet&grayscale",
    },
    {
      id: 9,
      name: "Cap",
      price: 600,
      image: "https://via.placeholder.com/200x150.png?text=Cap&grayscale",
    },
    {
      id: 10,
      name: "Laptop Sleeve",
      price: 1700,
      image: "https://via.placeholder.com/200x150.png?text=Sleeve&grayscale",
    },
  ];

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
      <h2 className="text-2xl font-bold text-black mb-6">Our Products</h2>

      {/* --- Cards Grid --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-black rounded-xl shadow-sm hover:shadow-md transition p-4 flex flex-col"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-40 object-cover rounded-lg mb-3"
            />
            <h3 className="text-lg font-semibold text-black mb-1">
              {item.name}
            </h3>
            <p className="text-black font-bold text-sm mb-3">
              ${item.price}
            </p>
            <button className="mt-auto bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
              Show details
            </button>
          </div>
        ))}
      </div>

      {/* --- Pagination --- */}
      <div className="flex justify-center mt-8 space-x-2">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border border-black rounded-lg text-sm disabled:opacity-50"
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => goToPage(i + 1)}
            className={`px-3 py-1 border border-black rounded-lg text-sm ${
              currentPage === i + 1
                ? "bg-black text-white"
                : "hover:bg-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border border-black rounded-lg text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </section>
  );
}
