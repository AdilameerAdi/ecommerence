import React, { useState } from "react";

export default function Products() {
  // --- Static demo data with multiple images for each product ---
  const allProducts = [
    {
      id: 1,
      name: "Classic Watch",
      price: 1200,
      code: "P-001",
      description: "Elegant classic watch with stainless steel design.",
      images: [
        "https://www.shutterstock.com/image-photo/gold-fashionable-elegant-watch-classic-600nw-2477327319.jpg",
      
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJl3b-S1cWsP-KOnDEmO4wD89VNAMhqnBt0VqywlfNpu7zI-7anh3FVkqMSY8L2h__X-w&usqp=CAU",
        "https://usercontent.one/wp/www.reuvenwatches.com/wp-content/uploads/2023/02/KD13789-845x562-1.jpg",
      ],
    },
    {
      id: 2,
      name: "Leather Bag",
      price: 2500,
      code: "P-002",
      description: "Premium quality leather bag for casual and formal use.",
      images: [
        "https://media.istockphoto.com/id/1271796113/photo/women-is-holding-handbag-near-luxury-car.jpg?s=612x612&w=0&k=20&c=-jtXLmexNgRa-eKqA1X8UJ8QYWhW7XgDiWNmzuuCHmM=",
        "https://img.drz.lazcdn.com/static/pk/p/b3d6d98af28fb1e015362b1d7f0484ed.jpg_720x720q80.jpg",
        "https://milanoleathers.com/cdn/shop/files/421509684_18409301293001835_2836428067153985979_n.png?v=1716032361",
        "https://image.made-in-china.com/318f0j00SEbUVOTZghqY/%E8%A7%86%E9%A2%91-1100128642440.mp4.webp",
      ],
    },
    // ... add other products similarly
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

  // --- Modal state ---
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");

  const openModal = (product) => {
    setSelectedProduct(product);
    setMainImage(product.images[0]);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setMainImage("");
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-bold text-black mb-6">Our Products</h2>

      {/* --- Cards Grid --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map((item) => (
          <div
            key={item.id}
            onClick={() => openModal(item)}
            className="bg-white border border-black rounded-xl shadow-sm hover:shadow-md transition p-4 flex flex-col cursor-pointer"
          >
            <img
              src={item.images[0]}
              alt={item.name}
              className="w-full h-40 object-cover rounded-lg mb-3"
            />
            <h3 className="text-lg font-semibold text-black mb-1">
              {item.name}
            </h3>
            <p className="text-black font-bold text-sm mb-3">${item.price}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openModal(item);
              }}
              className="mt-auto bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
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

      {/* --- Modal --- */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-lg p-6 relative flex flex-col lg:flex-row">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-black text-xl font-bold"
            >
              ✕
            </button>

            {/* Left - Images */}
            <div className="lg:w-1/2 flex flex-col items-center">
              <img
                src={mainImage}
                alt="Main"
                className="w-72 h-72 object-cover rounded-lg border border-black mb-4"
              />
              <div className="flex space-x-2">
                {selectedProduct.images.slice(0, 3).map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`thumb-${index}`}
                    onClick={() => setMainImage(img)}
                    className={`w-20 h-20 object-cover rounded-lg border cursor-pointer ${
                      mainImage === img ? "border-2 border-black" : ""
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Right - Details */}
            <div className="lg:w-1/2 mt-6 lg:mt-0 lg:ml-6 flex flex-col">
              <h2 className="text-2xl font-bold text-black mb-2">
                {selectedProduct.name}
              </h2>
              <p className="text-lg font-semibold text-black mb-2">
                ${selectedProduct.price}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                {selectedProduct.description}
              </p>
              <p className="text-xs text-gray-600 mb-4">
                Product Code: {selectedProduct.code}
              </p>
              <button className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition mt-auto">
                Send DM
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
