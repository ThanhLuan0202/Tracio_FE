import React from "react";

const CategorySidebar = () => {
  return (
    <div className="bg-white p-6 rounded-lg">
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3">Category</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <input type="checkbox" className="mr-2" id="helmet" />
            <label htmlFor="helmet" className="text-sm text-gray-600">
              Helmet
            </label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" className="mr-2" id="gloves" />
            <label htmlFor="gloves" className="text-sm text-gray-600">
              Gloves
            </label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" className="mr-2" id="shoes" />
            <label htmlFor="shoes" className="text-sm text-gray-600">
              Shoes
            </label>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3">Size</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <input type="checkbox" className="mr-2" id="s" />
            <label htmlFor="s" className="text-sm text-gray-600">
              S (42 - 54 cm)
            </label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" className="mr-2" id="m" />
            <label htmlFor="m" className="text-sm text-gray-600">
              M (55 - 58 cm)
            </label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" className="mr-2" id="l" />
            <label htmlFor="l" className="text-sm text-gray-600">
              L (59 cm+)
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Brand</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <input type="checkbox" className="mr-2" id="nike" />
            <label htmlFor="nike" className="text-sm text-gray-600">
              Nike
            </label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" className="mr-2" id="adidas" />
            <label htmlFor="adidas" className="text-sm text-gray-600">
              Adidas
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySidebar;
