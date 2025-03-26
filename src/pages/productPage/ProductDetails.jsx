import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Breadcumbs from "../../components/Breadcumbs";
import axios from "axios";
import SearchBar from "../../components/SearchBar";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });

  // Static data
  const staticData = {
    images: [
      "https://contents.mediadecathlon.com/p2838941/k$422d1b326b534a55dd84533d4c378512/m%C5%A9-b%E1%BA%A3o-hi%E1%BB%83m-xe-%C4%91%E1%BA%A1p-%C4%91%E1%BB%8Ba-h%C3%ACnh-st-500-%C4%91en-rockrider-8529388.jpg?f=768x0&format=auto",
      "https://contents.mediadecathlon.com/p2838941/k$422d1b326b534a55dd84533d4c378512/m%C5%A9-b%E1%BA%A3o-hi%E1%BB%83m-xe-%C4%91%E1%BA%A1p-%C4%91%E1%BB%8Ba-h%C3%ACnh-st-500-%C4%91en-rockrider-8529388.jpg?f=768x0&format=auto",
      "https://contents.mediadecathlon.com/p2838941/k$422d1b326b534a55dd84533d4c378512/m%C5%A9-b%E1%BA%A3o-hi%E1%BB%83m-xe-%C4%91%E1%BA%A1p-%C4%91%E1%BB%8Ba-h%C3%ACnh-st-500-%C4%91en-rockrider-8529388.jpg?f=768x0&format=auto",
    ],
    color: ["Black", "White", "Red"],
    size: ["S", "M", "L", "XL"],
    stock: 50,
    rating: 4.5,
    reviews: 128,
    description:
      "Thiết kế đơn giản nhưng vẫn đảm bảo tính thẩm mỹ và an toàn cho người sử dụng. Nón bảo hiểm thể thao Fornix NFL được thiết kế với kiểu dáng thời trang, phù hợp cho các hoạt động thể thao ngoài trời.",
    specifications: [
      {
        name: "Material",
        value: "High-grade ABS plastic shell",
      },
      {
        name: "Weight",
        value: "280g ± 10g",
      },
      {
        name: "Certification",
        value: "Certified to EN 1078 standard",
      },
    ],
    reviewList: [
      {
        id: 1,
        user: "John Doe",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
        rating: 5,
        date: "2024-03-15",
        comment: "Sản phẩm rất tốt, đóng gói cẩn thận, giao hàng nhanh!",
        images: [
          "https://contents.mediadecathlon.com/p2838941/k$422d1b326b534a55dd84533d4c378512/m%C5%A9-b%E1%BA%A3o-hi%E1%BB%83m-xe-%C4%91%E1%BA%A1p-%C4%91%E1%BB%8Ba-h%C3%ACnh-st-500-%C4%91en-rockrider-8529388.jpg?f=768x0&format=auto",
          "https://contents.mediadecathlon.com/p2838941/k$422d1b326b534a55dd84533d4c378512/m%C5%A9-b%E1%BA%A3o-hi%E1%BB%83m-xe-%C4%91%E1%BA%A1p-%C4%91%E1%BB%8Ba-h%C3%ACnh-st-500-%C4%91en-rockrider-8529388.jpg?f=768x0&format=auto",
        ],
      },
      {
        id: 2,
        user: "Jane Smith",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
        rating: 4,
        date: "2024-03-14",
        comment:
          "Chất lượng tốt, đáng giá tiền. Chỉ có điều màu hơi khác một chút so với hình.",
      },
    ],
  };

  useEffect(() => {
    // Thử lấy thông tin sản phẩm từ localStorage trước
    const savedProduct = localStorage.getItem("selectedProduct");
    if (savedProduct) {
      const parsedProduct = JSON.parse(savedProduct);
      setProduct({
        ...staticData,
        id: parsedProduct.id,
        name: parsedProduct.name,
        price: parsedProduct.price,
        image: parsedProduct.image,
      });
    }

    // Sau đó gọi API để lấy thông tin mới nhất
    axios
      .get(`https://67cec251125cd5af757bdeb7.mockapi.io/product/${id}`)
      .then((response) => {
        setProduct({
          ...staticData,
          id: response.data.id,
          name: response.data.name,
          price: response.data.price,
          image: response.data.image,
        });
      })
      .catch((error) => {
        console.error("Lỗi khi lấy thông tin sản phẩm:", error);
      });
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const handleQuantityChange = (value) => {
    const newQuantity = quantity + value;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    console.log("Review submitted:", reviewForm);
    setShowReviewForm(false);
    setReviewForm({ rating: 5, comment: "" });
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setError(""); // Clear error when selection is made
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setError(""); // Clear error when selection is made
  };

  const handleAddToCart = () => {
    // Validate selections
    if (!selectedColor) {
      setError("Please select a color");
      return;
    }
    if (!selectedSize) {
      setError("Please select a size");
      return;
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.images?.[selectedImage] || product.image,
      color: selectedColor,
      size: selectedSize,
    };

    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");

    // Check if item with same id, color, and size exists
    const existingItemIndex = existingCart.findIndex(
      (item) =>
        item.id === cartItem.id &&
        item.color === cartItem.color &&
        item.size === cartItem.size
    );

    if (existingItemIndex !== -1) {
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      existingCart.push(cartItem);
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));
    navigate("/cart");
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <svg
        key={index}
        className={`w-5 h-5 ${
          index < Math.floor(rating) ? "text-yellow-400" : "text-gray-200"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="min-h-screen bg-white">
      <SearchBar />

      <Breadcumbs />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Section */}
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          {/* Product Images */}
          <div className="lg:w-2/3">
            <div className="aspect-w-3 aspect-h-2 rounded-lg overflow-hidden">
              <img
                src={product.images?.[selectedImage] || product.image}
                alt={product.name}
                className="w-full h-full object-center object-cover"
              />
            </div>
            {product.images && (
              <div className="mt-4 grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden ${
                      selectedImage === index
                        ? "ring-2 ring-red-500"
                        : "ring-1 ring-gray-200"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-center object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:w-1/3">
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <div className="mt-4">
              <p className="text-3xl text-red-600">
                {product.price.toLocaleString("vi-VN")}đ
              </p>
            </div>

            {/* Rating */}
            <div className="mt-4 flex items-center">
              <div className="flex items-center">
                {renderStars(product.rating)}
              </div>
              <p className="ml-2 text-sm text-gray-500">
                {product.rating} ({product.reviews} reviews)
              </p>
            </div>

            {/* Color Selection */}
            {product.color && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">Color</h3>
                <div className="mt-2 flex space-x-2">
                  {product.color.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className={`px-4 py-2 border rounded-md transition-all ${
                        selectedColor === color
                          ? "border-red-500 bg-red-50 text-red-600"
                          : "hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.size && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">Size</h3>
                <div className="mt-2 flex space-x-2">
                  {product.size.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeSelect(size)}
                      className={`px-4 py-2 border rounded-md transition-all ${
                        selectedSize === size
                          ? "border-red-500 bg-red-50 text-red-600"
                          : "hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Quantity</h3>
              <div className="mt-2 flex items-center space-x-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="px-3 py-1 border rounded-md hover:bg-gray-100"
                >
                  -
                </button>
                <span className="text-lg font-medium">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="px-3 py-1 border rounded-md hover:bg-gray-100"
                >
                  +
                </button>
                <span className="ml-2 text-sm text-gray-500">
                  {product.stock} available
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && <div className="mt-4 text-red-600 text-sm">{error}</div>}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="mt-8 w-full bg-red-600 text-white py-3 px-6 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Add to Cart
            </button>

            {/* Product Description */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900">Description</h3>
              <p className="mt-2 text-gray-600">{product.description}</p>
            </div>

            {/* Specifications */}
            {product.specifications && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900">
                  Specifications
                </h3>
                <div className="mt-4 border-t border-gray-200">
                  {product.specifications.map((spec, index) => (
                    <div
                      key={index}
                      className="py-3 flex justify-between border-b border-gray-200"
                    >
                      <span className="text-gray-500">{spec.name}</span>
                      <span className="text-gray-900">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="border-t border-gray-200 pt-10">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold">Reviews</h3>
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center">
                  <div className="text-4xl font-bold mb-1">
                    {product.rating}
                  </div>
                  <div className="flex items-center">
                    {renderStars(product.rating)}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Based on {product.reviews} reviews
                  </p>
                </div>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="bg-red-600 text-white px-8 py-2.5 rounded-full hover:bg-red-700 transition-colors"
                >
                  Write a Review
                </button>
              </div>
            </div>

            {/* Review List */}
            {product.reviewList && (
              <div className="space-y-6">
                {product.reviewList.map((review) => (
                  <div
                    key={review.id}
                    className="mb-8 pb-8 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-start mb-4">
                      <img
                        src={review.avatar}
                        alt={review.user}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-lg">{review.user}</h4>
                          <span className="text-gray-500 text-sm">
                            {review.date}
                          </span>
                        </div>
                        <div className="flex items-center mb-3">
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {review.comment}
                        </p>
                        {review.images && (
                          <div className="mt-4 flex gap-4">
                            {review.images.map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`Review ${index + 1}`}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Show More Reviews Button */}
            <div className="text-center mt-8">
              <button className="text-red-600 font-medium hover:text-red-700">
                Show more reviews ↓
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-medium mb-4">Write a Review</h3>
            <form onSubmit={handleReviewSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setReviewForm({ ...reviewForm, rating: star })
                      }
                      className={`${
                        star <= reviewForm.rating
                          ? "text-yellow-400"
                          : "text-gray-200"
                      } hover:text-yellow-400`}
                    >
                      <svg
                        className="w-8 h-8"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Comment
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, comment: e.target.value })
                  }
                  className="w-full border rounded-md p-2"
                  rows="4"
                  required
                ></textarea>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
