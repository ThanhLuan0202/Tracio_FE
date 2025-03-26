import React from "react";
import SearchBar from "../../components/SearchBar";
import NavBar from "../../components/NavBar";
import CategorySidebar from "../../components/CategorySidebar";
import ProductList from "../../components/ProductList";
import Footer from "../../components/Footer";

const ProductPage = () => {
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
          <div className="w-full md:w-64 flex-shrink-0 mt-6 md:mt-20">
            <CategorySidebar />
          </div>

          {/* Product Section */}
          <div className="flex-1 mt-10">
            {/* Filter Buttons */}
            <div className="flex gap-4 mb-8">
              <button className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors">
                Price Low - High
              </button>
              <button className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors">
                Price High - Low
              </button>
            </div>

            {/* Product List */}
            <ProductList />

            {/* See More Button */}
            <div className="flex justify-center my-8">
              <button className="bg-white border border-gray-300 rounded-lg px-8 sm:px-20 py-2 hover:bg-gray-100 transition-colors">
                See More
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductPage;
