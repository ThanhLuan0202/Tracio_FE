import React, { useState } from "react";
import SearchBar from "../../components/SearchBar";
import NavBar from "../../components/NavBar";

const ServicesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [priceFilter, setPriceFilter] = useState(null);

  const categories = [
    { 
      id: "repairs", 
      name: "Repairs",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
      )
    },
    { 
      id: "maintenance", 
      name: "Maintenance",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )
    },
    { 
      id: "training", 
      name: "Training",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    { 
      id: "group", 
      name: "Group Activities",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    { 
      id: "custom", 
      name: "Custom Services",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      )
    },
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
      <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1532298229144-0ec0c57515c7"
          alt="Services Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50">
          <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center">
            <h1 className="text-white text-4xl md:text-5xl font-bold mb-4">
              Our Services
            </h1>
            <p className="text-gray-200 text-lg md:text-xl max-w-2xl">
              Discover our high-quality bicycle services
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0">
            {/* Categories */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">
                Categories
              </h2>
              <ul className="space-y-2">
                <li
                  onClick={() => handleCategoryClick(null)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedCategory === null
                      ? "bg-black text-white shadow-md transform scale-[1.02]"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <span className="font-medium">All Categories</span>
                </li>
                {categories.map((category) => (
                  <li
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedCategory === category.id
                        ? "bg-black text-white shadow-md transform scale-[1.02]"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {category.icon}
                    <span className="font-medium">{category.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Range */}
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">
                Price Range
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => handlePriceFilter("lowToHigh")}
                  className={`w-full p-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                    priceFilter === "lowToHigh"
                      ? "bg-black text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  <span>Price Low - High</span>
                </button>
                <button
                  onClick={() => handlePriceFilter("highToLow")}
                  className={`w-full p-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                    priceFilter === "highToLow"
                      ? "bg-black text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                  <span>Price High - Low</span>
                </button>
                <button
                  onClick={() => handlePriceFilter(null)}
                  className={`w-full p-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                    priceFilter === null
                      ? "bg-black text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>All Prices</span>
                </button>
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-800">
                        {service.price}
                      </span>
                      <button className="bg-black text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredServices.length > 0 && (
              <div className="flex justify-center mt-12">
                <button className="bg-white border-2 border-black rounded-xl px-12 py-3 font-bold hover:bg-black hover:text-white transition-all duration-200">
                  See More
                </button>
              </div>
            )}

            {filteredServices.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg">
                  No services found matching your criteria
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
