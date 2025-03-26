import React from "react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import Category from "./CategorySidebar";

const ProductList = ({ priceFilter }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("https://67cec251125cd5af757bdeb7.mockapi.io/product")
      .then((response) => {
        const formattedProducts = response.data.map((product) => ({
          ...product,
          price: parseInt(product.price),
        }));
        setProducts(formattedProducts);
        setFilteredProducts(formattedProducts);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy sản phẩm:", error);
      });
  }, []);

  useEffect(() => {
    let sortedProducts = [...products];

    if (priceFilter === "lowToHigh") {
      sortedProducts.sort((a, b) => a.price - b.price);
    } else if (priceFilter === "highToLow") {
      sortedProducts.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(sortedProducts);
  }, [priceFilter, products]);

  const handleProductClick = (productId) => {
    const selectedProduct = products.find((p) => p.id === productId);
    if (selectedProduct) {
      localStorage.setItem("selectedProduct", JSON.stringify(selectedProduct));
    }
    navigate(`/product/${productId}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProducts.map((product) => (
        <div
          key={product.id}
          onClick={() => handleProductClick(product.id)}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        >
          <div className="aspect-w-1 aspect-h-1 w-full">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-center object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">
              {product.name}
            </h3>
            <div className="mt-2 flex items-center">
              <div className="flex items-center">
                {[...Array(5)].map((_, index) => (
                  <svg
                    key={index}
                    className={`w-4 h-4 ${
                      index < Math.floor(product.rating)
                        ? "text-yellow-400"
                        : "text-gray-200"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="ml-2 text-sm text-gray-500">
                ({product.reviews} reviews)
              </p>
            </div>
            <p className="mt-2 text-lg font-medium text-red-600">
              {product.price.toLocaleString("vi-VN")}đ
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
