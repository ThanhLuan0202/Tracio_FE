import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("https://67cec251125cd5af757bdeb7.mockapi.io/product") // Thay bằng API thực tế
      .then((response) => {
        setProducts(response.data); // Giả sử API trả về danh sách sản phẩm
      })
      .catch((error) => {
        console.error("Lỗi khi lấy sản phẩm:", error);
      });
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.length > 0 ? (
        products.map((product) => (
          <ProductCard
            key={product.id}
            image={product.image}
            name={product.name}
            category={product.category}
            price={product.price}
          />
        ))
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ProductList;
