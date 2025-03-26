import React, { useState } from "react";
import SearchBar from "../../components/SearchBar";
import NavBar from "../../components/NavBar";

const ServicesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [priceFilter, setPriceFilter] = useState(null);

  const categories = [
    { id: "repairs", name: "Repairs" },
    { id: "maintenance", name: "Maintenance" },
    { id: "training", name: "Training" },
    { id: "group", name: "Group Activities" },
    { id: "custom", name: "Custom Services" },
  ];

  const services = [
    {
      id: 1,
      title: "Bicycle Repair & Maintenance",
      image: "https://images.unsplash.com/photo-1517649763962-0c623066013b",
      description: "Professional repair and maintenance services",
      price: "$50/hour",
      category: "repairs",
    },
    {
      id: 2,
      title: "Bike Fitting Service",
      image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
      description: "Custom bike fitting for optimal comfort",
      price: "$80/session",
      category: "maintenance",
    },
    {
      id: 3,
      title: "Bicycle Training",
      image: "https://images.unsplash.com/photo-1541625602330-2277a4c46182",
      description: "Personal training for all skill levels",
      price: "$40/hour",
      category: "training",
    },
    {
      id: 4,
      title: "Group Riding Sessions",
      image: "https://images.unsplash.com/photo-1517649763962-0c623066013b",
      description: "Join our community riding sessions",
      price: "$30/session",
      category: "group",
    },
  ];

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const handlePriceFilter = (filter) => {
    setPriceFilter(filter);
  };

  const filteredServices = services
    .filter(
      (service) => !selectedCategory || service.category === selectedCategory
    )
    .sort((a, b) => {
      if (!priceFilter) return 0;
      const priceA = parseInt(a.price.replace(/[^0-9]/g, ""));
      const priceB = parseInt(b.price.replace(/[^0-9]/g, ""));
      return priceFilter === "lowToHigh" ? priceA - priceB : priceB - priceA;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <SearchBar />
      <NavBar />

      {/* Banner Image */}
      <div className="w-full px-4 sm:px-6 lg:px-8 my-4">
        <div className="relative h-[200px] sm:h-[300px] md:h-[400px] w-full overflow-hidden rounded-lg">
          <img
            src="https://images.unsplash.com/photo-1532298229144-0ec0c57515c7"
            alt="Services Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <h1 className="text-white text-3xl md:text-4xl font-semibold">
              Our Services
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0 mt-6 md:mt-20">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Categories</h2>
              <ul className="space-y-2">
                <li
                  onClick={() => handleCategoryClick(null)}
                  className={`cursor-pointer transition-colors ${
                    selectedCategory === null
                      ? "text-black font-medium"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  All Categories
                </li>
                {categories.map((category) => (
                  <li
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`cursor-pointer transition-colors ${
                      selectedCategory === category.id
                        ? "text-black font-medium"
                        : "text-gray-600 hover:text-black"
                    }`}
                  >
                    {category.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Services Section */}
          <div className="flex-1">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3 mb-6 mt-6 md:mt-20">
              <button
                onClick={() => handlePriceFilter("lowToHigh")}
                className={`px-4 py-2 rounded transition-colors ${
                  priceFilter === "lowToHigh"
                    ? "bg-black text-white"
                    : "bg-white text-black border border-gray-300 hover:bg-gray-100"
                }`}
              >
                Price Low - High
              </button>
              <button
                onClick={() => handlePriceFilter("highToLow")}
                className={`px-4 py-2 rounded transition-colors ${
                  priceFilter === "highToLow"
                    ? "bg-black text-white"
                    : "bg-white text-black border border-gray-300 hover:bg-gray-100"
                }`}
              >
                Price High - Low
              </button>
              <button
                onClick={() => handlePriceFilter(null)}
                className={`px-4 py-2 rounded transition-colors ${
                  priceFilter === null
                    ? "bg-black text-white"
                    : "bg-white text-black border border-gray-300 hover:bg-gray-100"
                }`}
              >
                All Prices
              </button>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="h-48">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-800">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mt-2">{service.description}</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-lg font-semibold">
                        {service.price}
                      </span>
                      <button className="bg-black text-white px-4 py-1 rounded-full text-sm hover:bg-gray-800 transition-colors">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

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

export default ServicesPage;
