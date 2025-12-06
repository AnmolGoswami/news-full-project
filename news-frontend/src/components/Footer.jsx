import React from 'react';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXTwitter,
  faInstagram,
  faFacebook,
} from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  return (
    <footer className="w-full bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-blue-950 text-gray-800 dark:text-gray-100 pt-16 transition-colors duration-500">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-gray-200 dark:border-gray-700">
          {/* Branding */}
          <div className="col-span-1">
            <h2 className="text-4xl font-extrabold text-blue-600 dark:text-blue-300 tracking-tight">Talewire</h2>
            <p className="mt-4 text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              Your go-to source for the latest and trending news worldwide. Trusted, fast, and unbiased.
            </p>
            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              Developed by: <span className="font-semibold">Talewire Team</span>
              <br />
              <a href="mailto:dev@talewire.com" className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-300">dev@talewire.com</a>
            </p>
          </div>

          {/* Essential Links */}
          <div>
            <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-300 mb-6">Essential Links</h3>
            <ul className="space-y-3 text-base">
              <li><Link to="/privacy-policy" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300 hover:underline">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300 hover:underline">Terms and Conditions</Link></li>
              <li><Link to="/disclaimer" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300 hover:underline">Disclaimer</Link></li>
              <li><Link to="/cookie-policy" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300 hover:underline">Cookie Policy</Link></li>
              <li><Link to="/contact" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300 hover:underline">Contact Us</Link></li>
              <li><a href="/advertise" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300 hover:underline">Advertise with Us</a></li>
              <li><a href="https://www.google.com/adsense/policies" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300 hover:underline">Google AdSense Policies</a></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-300 mb-6">Stay Connected</h3>
            <ul className="flex space-x-8 text-3xl">
              <li>
                <a href="https://x.com/talewire" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transform hover:scale-110 transition-all duration-300">
                  <FontAwesomeIcon icon={faXTwitter} />
                </a>
              </li>
              <li>
                <a href="https://instagram.com/talewire" className="text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 transform hover:scale-110 transition-all duration-300">
                  <FontAwesomeIcon icon={faInstagram} />
                </a>
              </li>
              <li>
                <a href="https://youtube.com/talewire" className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transform hover:scale-110 transition-all duration-300">
                  <FontAwesomeIcon icon={faFacebook} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 py-6 text-sm text-gray-500 dark:text-gray-400 text-center border-t border-gray-200 dark:border-gray-700">
          <p>© {new Date().getFullYear()} Talewire. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;