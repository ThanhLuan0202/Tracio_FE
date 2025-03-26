import React, { useState } from "react";
import SearchBar from "../../components/SearchBar";
import NavBar from "../../components/NavBar";
import CategorySidebar from "../../components/CategorySidebar";
import ProductList from "../../components/ProductList";

const ProductPage = () => {
  const [priceFilter, setPriceFilter] = useState(null);

  const handlePriceFilter = (filter) => {
    setPriceFilter(filter);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SearchBar />
      <NavBar />

      {/* Banner Image */}
      <div className="w-full px-4 sm:px-6 lg:px-8 my-4">
        <div className="relative h-[200px] sm:h-[300px] md:h-[400px] w-full overflow-hidden rounded-lg">
          <img
            src="https://thongnhat.com.vn/wp-content/uploads/2025/02/xe-dap-thong-nhat-cover-2025.webp"
            alt="banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <h1 className="text-white text-3xl md:text-4xl font-semibold">
              Our Products
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar */}

          {/* Product Section */}
          <div className="flex-1 mt-10">
            {/* Filter Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => handlePriceFilter("lowToHigh")}
                className={`px-6 py-2 rounded-md transition-colors ${
                  priceFilter === "lowToHigh"
                    ? "bg-black text-white"
                    : "bg-white text-black border border-gray-300 hover:bg-gray-100"
                }`}
              >
                Price Low - High
              </button>
              <button
                onClick={() => handlePriceFilter("highToLow")}
                className={`px-6 py-2 rounded-md transition-colors ${
                  priceFilter === "highToLow"
                    ? "bg-black text-white"
                    : "bg-white text-black border border-gray-300 hover:bg-gray-100"
                }`}
              >
                Price High - Low
              </button>
              <button
                onClick={() => handlePriceFilter(null)}
                className={`px-6 py-2 rounded-md transition-colors ${
                  priceFilter === null
                    ? "bg-black text-white"
                    : "bg-white text-black border border-gray-300 hover:bg-gray-100"
                }`}
              >
                All Prices
              </button>
            </div>

            {/* Product List */}
            <ProductList priceFilter={priceFilter} />

            {/* See More Button */}
            <div className="flex justify-center my-8">
              <button className="bg-white border border-gray-300 rounded-lg px-8 sm:px-20 py-2 hover:bg-gray-100 transition-colors">
                See More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
