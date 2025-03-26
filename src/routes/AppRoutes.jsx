import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "../pages/homePage/HomePage";
import ProductPage from "../pages/productPage/ProductPage";
import ProductDetails from "../pages/productPage/ProductDetails";
import GroupPage from "../pages/groupPage/GroupPage";
import GroupRules from "../pages/groupPage/GroupRules";
import GroupChat from "../pages/groupPage/GroupChat";
import GroupRequestsAdmin from "../pages/groupPage/GroupRequestsAdmin";
import MyRequests from "../pages/groupPage/MyRequests";
import ServicesPage from "../pages/servicesPage/ServicesPage";
import Cart from "../pages/cartPage/Cart";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/group" element={<GroupPage />} />
        <Route path="/group-rules/:groupId" element={<GroupRules />} />
        <Route path="/group-chat/:groupId" element={<GroupChat />} />
        <Route
          path="/group-requests/:groupId"
          element={<GroupRequestsAdmin />}
        />
        <Route path="/my-requests" element={<MyRequests />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
