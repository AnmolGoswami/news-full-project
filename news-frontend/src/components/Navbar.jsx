import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FaBars, FaTimes, FaUser, FaSearch, FaMoon, FaSun, FaFacebook, FaInstagram, FaSignOutAlt } from 'react-icons/fa';
import { SiX } from 'react-icons/si';
import { ThemeContext } from '../context/ThemeProvider';
import { useNews } from '../context/NewsContex';
import axios from 'axios';
import { toast } from 'react-toastify';
import Notifications from '../pages/Notifications';

const Navbar = () => {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const { token, setToken } = useNews();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [states, setStates] = useState([]);
  const [allDistricts, setAllDistricts] = useState([]);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]); // Fixed syntax error
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const searchModalRef = useRef(null);

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    navigate('/');
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [stateRes, districtRes, categoryRes, languageRes] = await Promise.all([
          axios.get('https://api.anmol-goswami-resume.store/api/getState'),
          axios.get('https://api.anmol-goswami-resume.store/api/getDistricts'),
          axios.get('https://api.anmol-goswami-resume.store/api/getCategories'),
          axios.get('https://api.anmol-goswami-resume.store/api/getLanguage'),
        ]);
        setStates(stateRes.data || []);
        setAllDistricts(districtRes.data || []);
        setCategories(categoryRes.data || []);
        setLanguages(languageRes.data || []); // Ensure default to empty array if no data
      } catch (err) {
        const message = err.response?.data?.message || err.message;
        setError(`Failed to load data: ${message}`);
        toast.error('Failed to load initial data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedState) {
      const state = states.find((s) => s.name === selectedState);
      if (state) {
        setFilteredDistricts(allDistricts.filter((d) => d.stateId === state.id));
        setSelectedDistrict('');
      }
    } else {
      setFilteredDistricts([]);
      setSelectedDistrict('');
    }
  }, [selectedState, states, allDistricts]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isSearchOpen && searchModalRef.current && !searchModalRef.current.contains(e.target)) {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isSearchOpen]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleSearchModal = () => {
    setIsSearchOpen(!isSearchOpen);
    setSearchQuery('');
  };
  const toggleCategoryDropdown = () => setIsCategoryOpen(!isCategoryOpen);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      toggleSearchModal();
    } else {
      toast.error('Please enter a search query');
    }
  };

  const handleStateChange = (e) => {
    setSelectedState(e.target.value);
    setSelectedDistrict('');
  };

  const handleDistrictChange = (e) => {
    const districtName = e.target.value;
    setSelectedDistrict(districtName);
    if (selectedState && districtName) {
      const params = new URLSearchParams({ state: selectedState.toLowerCase(), district: districtName.toLowerCase() });
      if (selectedCategory) params.append('category', selectedCategory.toLowerCase());
      if (selectedLanguage) params.append('language', selectedLanguage.toLowerCase());
      navigate(`/news?${params.toString()}`);
    }
  };

  const handleCategoryChange = (categoryName) => {
    setSelectedCategory(categoryName);
    setIsCategoryOpen(false);
    const params = new URLSearchParams({ category: categoryName.toLowerCase() });
    if (selectedState) params.append('state', selectedState.toLowerCase());
    if (selectedDistrict) params.append('district', selectedDistrict.toLowerCase());
    if (selectedLanguage) params.append('language', selectedLanguage.toLowerCase());
    navigate(`/news?${params.toString()}`);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  const handleLanguageChange = (e) => {
    const languageName = e.target.value;
    setSelectedLanguage(languageName);
    if (languageName) {
      navigate(`/language-news?language=${encodeURIComponent(languageName)}`);
    }
  };

  const CategoryDropdown = ({ isMobile = false }) => (
    <div
      className={`${
        isMobile
          ? 'pl-4 space-y-2'
          : 'absolute left-0 mt-2 w-48 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-xl transition-opacity duration-300 z-50'
      } ${isMobile || isCategoryOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      id={isMobile ? 'mobile-category-dropdown' : 'category-dropdown'}
    >
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategoryChange(category.name)}
          className={`block w-full text-left px-4 py-2 text-sm hover:bg-amber-100 dark:hover:bg-amber-600/50 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 ${
            selectedCategory === category.name ? 'bg-amber-100 dark:bg-amber-600/50' : ''
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>TALEWIRE | Local News, Updates & More</title>
        <meta name="description" content="TALEWIRE provides the latest local news, updates, and information from Siwan and surrounding areas. Explore state, district, and category-based news." />
        <meta name="keywords" content="TALEWIRE, local news, Siwan news, state news, district news, India news, breaking news" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://www.talewire.com" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "TALEWIRE",
            "url": "https://www.talewire.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://www.talewire.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>

      {error && (
        <div className="w-full py-2 bg-yellow-500 text-white text-center text-sm" role="alert">
          {error}
        </div>
      )}
      {isLoading && (
        <div className="w-full py-2 bg-blue-500 text-white text-center text-sm" role="status">
          Loading...
        </div>
      )}

      <aside className="hidden lg:block fixed right-2 top-1/2 -translate-y-1/2 z-50">
        <div className={`flex flex-col space-y-4 p-4 rounded-l-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer nofollow" className="text-gray-900 dark:text-white hover:text-[#1877F2]" aria-label="Follow us on Facebook">
            <FaFacebook className="text-xl" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer nofollow" className="text-gray-900 dark:text-white hover:text-[#1DA1F2]" aria-label="Follow us on X">
            <SiX className="text-xl" />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer nofollow" className="text-gray-900 dark:text-white hover:text-[#E1306C]" aria-label="Follow us on Instagram">
            <FaInstagram className="text-xl" />
          </a>
        </div>
      </aside>

      <nav className={`sticky top-0 z-50 shadow-lg transition-all duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} text-gray-900 dark:text-white font-sans`} role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <button
            className="md:hidden text-amber-500 !important dark:text-amber-400 hover:text-amber-300 dark:hover:text-amber-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <FaTimes className="text-xl fill-current" /> : <FaBars className="text-xl fill-current" />}
          </button>
          <Link to="/" className="flex items-center">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight transition-transform duration-300 hover:scale-105 hover:shadow-md">
              <span className={isDarkMode ? 'text-amber-300' : 'text-amber-500'}>TALE</span>
              <span className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>WIRE</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            <button onClick={toggleSearchModal} className="hover:text-amber-300 p-2" aria-label="Open search">
              <FaSearch className="text-base sm:text-lg" />
            </button>
            {token && <Notifications />}
            <button
              onClick={toggleDarkMode}
              className="hover:text-amber-300 p-2"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <FaSun className="text-base sm:text-lg" /> : <FaMoon className="text-base sm:text-lg" />}
            </button>
            {token ? (
              <button
                onClick={handleLogout}
                className="hover:text-amber-300 flex items-center text-sm"
                aria-label="Logout"
              >
                <FaSignOutAlt className="mr-1 text-base sm:text-lg" /> Logout
              </button>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-1.5 rounded-full text-sm transition-all duration-300"
                >
                  Register
                </Link>
                <Link to="/login" className="hover:text-amber-300 flex items-center text-sm" aria-label="Login to your account">
                  <FaUser className="mr-1 text-base sm:text-lg" /> Login
                </Link>
              </>
            )}
          </div>
          <div className="md:hidden w-10"></div>
        </div>

        <div className="border-t border-gray-600 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {!isMobileMenuOpen && (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                <select
                  value={selectedState}
                  onChange={handleStateChange}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 w-full sm:w-40"
                  aria-label="Select State"
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state.id} value={state.name}>
                      {state.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  disabled={!selectedState}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 w-full sm:w-40"
                  aria-label="Select District"
                >
                  <option value="">Select District</option>
                  {filteredDistricts.map((district) => (
                    <option key={district.id} value={district.name}>
                      {district.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedLanguage}
                  onChange={handleLanguageChange}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 w-full sm:w-40"
                  aria-label="Select Language"
                >
                  <option value="">Select Language</option>
                  {languages && languages.length > 0 ? (
                    languages.map((language) => (
                      <option key={language.id} value={language.name}>
                        {language.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>No languages available</option>
                  )}
                </select>
              </div>
            )}
            <ul className="hidden md:flex flex-wrap space-x-4 items-center" role="list">
              <li>
                <Link to="/" className="hover:text-amber-300 font-medium text-sm">
                  Home
                </Link>
              </li>
              <li className="relative group">
                <button
                  onClick={toggleCategoryDropdown}
                  className="hover:text-amber-300 font-medium text-sm flex items-center"
                  aria-expanded={isCategoryOpen}
                  aria-controls="category-dropdown"
                >
                  Categories <span className="ml-1">▼</span>
                </button>
                <CategoryDropdown />
              </li>
              <li>
                <Link to="/international" className="hover:text-amber-300 font-medium text-sm">
                  International
                </Link>
              </li>
              <li>
                <Link to="/state" className="hover:text-amber-300 font-medium text-sm">
                  State
                </Link>
              </li>
              <li>
                <Link to="/sports" className="hover:text-amber-300 font-medium text-sm">
                  Sports
                </Link>
              </li>
              <li>
                <Link to="/advertise" className="hover:text-amber-300 font-medium text-sm">
                  Advertise
                </Link>
              </li>
              <li>
                <Link to="/about-us" className="hover:text-amber-300 font-medium text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-300 font-medium text-sm">
                  Contact
                </Link>
              </li>
              
            </ul>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col space-y-4">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md">
                <select
                  value={selectedState}
                  onChange={handleStateChange}
                  className="w-full max-w-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 border border-gray-300 dark:border-gray-600"
                  aria-label="Select State"
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state.id} value={state.name}>
                      {state.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  disabled={!selectedState}
                  className="w-full max-w-xs mt-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                  aria-label="Select District"
                >
                  <option value="">Select District</option>
                  {filteredDistricts.map((district) => (
                    <option key={district.id} value={district.name}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>
              <ul className="flex flex-col space-y-2 text-gray-900 dark:text-white" role="list">
                <li>
                  <button
                    onClick={toggleSearchModal}
                    className="hover:text-amber-300 font-medium text-sm flex items-center py-2 w-full text-left"
                  >
                    <FaSearch className="mr-2 text-base" /> Search
                  </button>
                </li>
                {token && (
                  <li>
                    <Notifications />
                  </li>
                )}
                <li>
                  <button
                    onClick={toggleDarkMode}
                    className="hover:text-amber-300 font-medium text-sm flex items-center py-2 w-full text-left"
                  >
                    {isDarkMode ? <FaSun className="mr-2 text-base" /> : <FaMoon className="mr-2 text-base" />}
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  </button>
                </li>
                <li>
                  <Link to="/" className="hover:text-amber-300 font-medium text-sm py-2" onClick={toggleMobileMenu}>
                    Home
                  </Link>
                </li>
                <li>
                  <button
                    onClick={toggleCategoryDropdown}
                    className="hover:text-amber-300 font-medium text-sm flex items-center w-full text-left py-2"
                    aria-expanded={isCategoryOpen}
                    aria-controls="mobile-category-dropdown"
                  >
                    Categories <span className="ml-1">▼</span>
                  </button>
                  {isCategoryOpen && <CategoryDropdown isMobile />}
                </li>
                <li>
                  <Link to="/about-us" className="hover:text-amber-300 font-medium text-sm py-2" onClick={toggleMobileMenu}>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/state" className="hover:text-amber-300 font-medium text-sm py-2" onClick={toggleMobileMenu}>
                    State
                  </Link>
                </li>
                <li>
                  <Link to="/sports" className="hover:text-amber-300 font-medium text-sm py-2" onClick={toggleMobileMenu}>
                    Sports
                  </Link>
                </li>
                <li>
                  <Link to="/international" className="hover:text-amber-300 font-medium text-sm py-2" onClick={toggleMobileMenu}>
                    International
                  </Link>
                </li>
                <li>
                  <Link to="/sponsorship" className="hover:text-amber-300 font-medium text-sm py-2" onClick={toggleMobileMenu}>
                    Sponsorship
                  </Link>
                </li>
                <li>
                  <Link to="/newsletter" className="hover:text-amber-300 font-medium text-sm py-2" onClick={toggleMobileMenu}>
                    Newsletter
                  </Link>
                </li>
                <li>
                  <Link to="/advertise" className="hover:text-amber-300 font-medium text-sm py-2" onClick={toggleMobileMenu}>
                    Advertise
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-amber-300 font-medium text-sm py-2" onClick={toggleMobileMenu}>
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="hover:text-amber-300 font-medium text-sm py-2" onClick={toggleMobileMenu}>
                    Privacy Policy
                  </Link>
                </li>
                {token ? (
                  <li>
                    <button
                      onClick={handleLogout}
                      className="hover:text-amber-300 font-medium text-sm flex items-center py-2 w-full text-left"
                    >
                      <FaSignOutAlt className="mr-2 text-base" /> Logout
                    </button>
                  </li>
                ) : (
                  <>
                    <li>
                      <Link to="/login" className="hover:text-amber-300 font-medium text-sm flex items-center py-2" onClick={toggleMobileMenu}>
                        <FaUser className="mr-2 text-base" /> Login
                      </Link>
                    </li>
                    <li>
                      <Link to="/register" className="hover:text-amber-300 font-medium text-sm flex items-center py-2" onClick={toggleMobileMenu}>
                        <FaUser className="mr-2 text-base" /> Register
                      </Link>
                    </li>
                  </>
                )}
              </ul>
              <div className="flex space-x-4 pt-3 border-t border-gray-700 dark:border-gray-600">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer nofollow" className="hover:text-[#1877F2] text-gray-900 dark:text-white" aria-label="Follow us on Facebook">
                  <FaFacebook className="text-base" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer nofollow" className="hover:text-[#1DA1F2] text-gray-900 dark:text-white" aria-label="Follow us on X">
                  <SiX className="text-base" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer nofollow" className="hover:text-[#E1306C] text-gray-900 dark:text-white" aria-label="Follow us on Instagram">
                  <FaInstagram className="text-base" />
                </a>
              </div>
            </div>
          </div>
        )}

        {isSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 transition-opacity duration-300" role="dialog" aria-modal="true" aria-label="Search modal">
            <div
              ref={searchModalRef}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-md transform transition-all duration-300"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Search News</h2>
                <button
                  onClick={toggleSearchModal}
                  className="text-gray-500 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-300"
                  aria-label="Close search modal"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
              <div role="search">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-base" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for news..."
                    className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200"
                    autoFocus
                    aria-label="Search news"
                  />
                </div>
                <button
                  onClick={handleSearchSubmit}
                  className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 rounded-full text-sm transition-colors duration-200"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;