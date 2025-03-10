import React, { useState } from "react";
import SearchBar from "../../components/SearchBar";
import ProductCard from "../../components/ProductCard";
import ProductList from "../../components/ProductList";
import BlogSection from "../../components/BlogSection";

const HomePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <SearchBar />
      <nav className="w-full bg-white shadow-md">
        <div className="flex justify-center items-center px-6 py-4">
          {/* Menu items - Ẩn khi màn hình nhỏ, hiện khi màn hình lớn */}
          <div className="hidden md:flex gap-8">
            {["HOME", "PRODUCT", "GROUP", "SERVICES"].map((item) => (
              <p
                key={item}
                className="relative cursor-pointer text-gray-700 transition-all duration-300 hover:text-gray-500 hover:scale-105 
              after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 after:h-[2px] 
              after:bg-orange-500 after:transition-all after:duration-300 hover:after:w-full"
              >
                {item}
              </p>
            ))}
          </div>

          {/* Button mở menu trên mobile */}
          <button
            className="md:hidden text-2xl absolute right-6"
            onClick={() => setIsOpen(!isOpen)}
          >
            ☰
          </button>
        </div>

        {/* Menu dropdown trên mobile */}
        {isOpen && (
          <div className="md:hidden flex flex-col gap-4 p-4 bg-gray-100">
            {["HOME", "PRODUCT", "GROUP", "SERVICES"].map((item) => (
              <p
                key={item}
                className="cursor-pointer text-gray-700 hover:text-gray-500"
              >
                { }
              </p>
            ))}
          </div>
        )}
      </nav>
      <img
        src="https://images.ctfassets.net/7ajcefednbt4/6FCarGhz0aZe9PzTS50DRr/b3dc4642f78be8f40c91c68ea7bae67b/Cyclist_patrckyl_strava.jpg?fm=webp&w=2560"
        alt="banner"
        className="w-full h-auto object-cover "
      />
      <div className="flex flex-col items-center mt-20">
        <h1 className="text-5xl font-extrabold bg-black w-full py-10 text-white text-center ">
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
    </div>
  );
};

export default HomePage;







