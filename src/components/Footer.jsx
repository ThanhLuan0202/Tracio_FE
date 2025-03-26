import React from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaTwitter, FaFacebook } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-black text-white w-full mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Logo */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold">TRACIO.COM</h2>
        </div>

        {/* Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Reach us */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Reach us</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span>+84389999999</span>
              </li>
              <li className="flex items-center">
                <span>TracioPro@gmail.com</span>
              </li>
              <li className="flex items-center flex-col items-start">
                <span>Long Thanh My, Thu Duc, Ho Chi Minh</span>
                <span>Vietnam</span>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="hover:text-gray-300">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gray-300">
                  Contact us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy-policy" className="hover:text-gray-300">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="hover:text-gray-300">
                  Terms & Services
                </Link>
              </li>
              <li>
                <Link to="/terms-of-use" className="hover:text-gray-300">
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>

          {/* Useful links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Useful links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/support" className="hover:text-gray-300">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center space-x-6 mt-8 pt-8 border-t border-gray-800">
          <a href="#" className="text-white hover:text-gray-300">
            <FaFacebook size={24} />
          </a>
          <a href="#" className="text-white hover:text-gray-300">
            <FaInstagram size={24} />
          </a>
          <a href="#" className="text-white hover:text-gray-300">
            <FaTwitter size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
