import React, { useState } from "react";
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
      <div className="w-full px-4 sm:px-6 lg:px-8 my-4 ">
        <div className="relative h-[200px] sm:h-[300px] md:h-[400px] w-full overflow-hidden rounded-lg">
          <img
            src="https://images.ctfassets.net/7ajcefednbt4/6FCarGhz0aZe9PzTS50DRr/b3dc4642f78be8f40c91c68ea7bae67b/Cyclist_patrckyl_strava.jpg?fm=webp&w=2560"
            alt="Banner"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      {/* <img
        src="https://images.ctfassets.net/7ajcefednbt4/6FCarGhz0aZe9PzTS50DRr/b3dc4642f78be8f40c91c68ea7bae67b/Cyclist_patrckyl_strava.jpg?fm=webp&w=2560"
        alt="banner"
        className="w-full h-auto object-cover "
      /> */}
      <div className="flex flex-col items-center mt-20">
        <h1 className="text-5xl font-extrabold bg-black w-[90%] py-10 text-white text-center ">
          Welcome to TRACIO
        </h1>

        <div className="flex flex-col items-center w-full px-20 mt-10">
          <h1 className="text-lg font-extrabold mt-4 mb-10 text-black ">
            Suggest Product
          </h1>
          {/* Danh sách sản phẩm */}
          <ProductList />
          <button className="bg-white border rounded-lg px-20 py-1 hover:bg-gray-100 transition mt-8 mb-10">
            See More
          </button>
        </div>
        <BlogSection />
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
