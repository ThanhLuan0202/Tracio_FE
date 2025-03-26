import React from "react";
import SearchBar from "../../components/SearchBar";
import ProductList from "../../components/ProductList";
import BlogSection from "../../components/BlogSection";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";

const HomePage = () => {
  return (
    <div>
      <SearchBar />
      <NavBar />
      
      {/* Hero Section */}
      <div className="relative h-[600px] mb-8">
        <div className="absolute inset-0">
          <img
            src="https://images.ctfassets.net/7ajcefednbt4/6FCarGhz0aZe9PzTS50DRr/b3dc4642f78be8f40c91c68ea7bae67b/Cyclist_patrckyl_strava.jpg?fm=webp&w=2560"
            alt="Banner"
            className="w-full h-full object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Welcome Text */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-wider">
            Welcome to TRACIO
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-2xl">
          Explore and share your amazing journeys
          </p>
        </div>
      </div>

      {/* Products Section */}
      <div className="flex flex-col items-center w-full px-20 mt-10">
        <h1 className="text-lg font-extrabold mt-4 mb-10 text-black">
          Suggest Product
        </h1>
        {/* Danh sách sản phẩm */}
        <ProductList />
        <button className="bg-white border rounded-lg px-20 py-1 hover:bg-gray-100 transition mt-8 mb-10">
          See More
        </button>
      </div>

      {/* Blog Section */}
      <BlogSection />
      <Footer />
    </div>
  );
};

export default HomePage;
