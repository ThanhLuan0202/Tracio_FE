import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <nav className="w-full bg-white shadow-md">
        <div className="flex justify-center items-center px-6 py-4">
          {/* Menu items - Ẩn khi màn hình nhỏ, hiện khi màn hình lớn */}
          <div className="hidden md:flex gap-8">
            {["HOME", "PRODUCT", "GROUP", "SERVICES"].map((item) => {
              const path = item === "HOME" ? "/" : `/${item.toLowerCase()}`;
              const isActive = location.pathname === path; // Kiểm tra trang hiện tại

              return (
                <p
                  key={item}
                  onClick={() => !isActive && navigate(path)} // Chỉ navigate nếu không phải trang hiện tại
                  className={`relative cursor-pointer transition-all duration-300 
              ${
                isActive
                  ? "text-black-800 cursor-default"
                  : " hover:text-bla-500 hover:scale-105"
              } 
              after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 after:h-[2px] 
              after:bg-orange-500 after:transition-all after:duration-300 hover:after:w-full`}
                >
                  {item}
                </p>
              );
            })}
          </div>

          {/* Button mở menu trên mobile */}
          <button
            className="md:hidden text-2xl absolute right-6"
            onClick={() => {
              setIsOpen(!isOpen);
              console.log("Menu state:", !isOpen); // Kiểm tra trạng thái
            }}
          >
            ☰
          </button>
        </div>

        {/* Menu dropdown trên mobile */}
        {isOpen && (
          <div className="md:hidden flex flex-col gap-4 p-4 bg-gray-100">
            {["HOME", "PRODUCT", "GROUP", "SERVICES"].map((item) => {
              const path = `/${item.toLowerCase()}`;
              const isActive = location.pathname === path; // Kiểm tra trang hiện tại

              return (
                <p
                  key={item}
                  onClick={() => !isActive && navigate(path)} // Chỉ navigate nếu không phải trang hiện tại
                  className={`relative cursor-pointer transition-all duration-300 
              ${
                isActive
                  ? "text-gray-400 cursor-default"
                  : "text-gray-700 hover:text-bla-500 hover:scale-105"
              } 
              after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 after:h-[2px] 
              after:bg-orange-500 after:transition-all after:duration-300 hover:after:w-full`}
                >
                  {item}
                </p>
              );
            })}
          </div>
        )}
      </nav>
    </div>
  );
};

export default NavBar;
