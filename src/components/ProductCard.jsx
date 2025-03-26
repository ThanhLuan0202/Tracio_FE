import { IoCartOutline } from "react-icons/io5";

const ProductCard = ({ image, name, category, price }) => {
  return (
    <div className="border rounded-lg shadow-md p-4 w-full max-w-xs">
      <img
        src={image}
        alt={name}
        className="w-full h-100 object-cover rounded-lg"
      />

      {/* Nội dung */}
      <div className="flex flex-col items-center text-center mt-2">
        <h2 className="text-sm font-semibold">{name}</h2>
        <p className="text-xs text-gray-500 mt-1">{category}</p>
        <p className="text-lg font-bold text-red-600">${price}</p>
      </div>

      {/* Icon giỏ hàng */}
      <div className="flex justify-end mt-2">
        <button className="text-gray-500 hover:text-black">
          <IoCartOutline />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
