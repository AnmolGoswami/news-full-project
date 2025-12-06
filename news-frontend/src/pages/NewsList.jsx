import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';
import { FaNewspaper, FaTag, FaMapMarkerAlt, FaCalendarAlt, FaEye, FaShareAlt, FaArrowRight, FaBullhorn } from 'react-icons/fa';

// Utility function to generate slug from title
const slugify = (text, id) => {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return `news-article-${id}`;
  }
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single
    .substring(0, 100); // Limit length
};

// Utility function to strip HTML tags for summary
const stripHtml = (html) => {
  if (!html || typeof html !== 'string') {
    console.log('stripHtml: Invalid or empty content:', html);
    return 'No description available.';
  }
  try {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    return text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 100) + (text.length > 100 ? '...' : '');
  } catch (error) {
    console.error('stripHtml error:', error, 'Input:', html);
    return html
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 100) + (html.length > 100 ? '...' : '');
  }
};

const NewsList = () => {
  const [searchParams] = useSearchParams();
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);

  // Extract and normalize query parameters
  const category = searchParams.get('category')?.toLowerCase() || '';
  const state = searchParams.get('state')?.toLowerCase() || '';
  const district = searchParams.get('district')?.toLowerCase() || '';
  const language = searchParams.get('language')?.toLowerCase() || '';

  // Fetch news based on query parameters
  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      setError('');
      try {
        let endpoint = 'https://api.anmol-goswami-resume.store/api/news';
        const params = {};

        // Prioritize based on query parameters
        if (category) {
          endpoint = 'https://api.anmol-goswami-resume.store/api/newsByCategory';
          params.category = category;
          if (language) params.language = language;
          if (state) params.state = state;
          if (district) params.district = district;
        } else if (district) {
          endpoint = 'https://api.anmol-goswami-resume.store/api/newsByDistrict';
          params.district = district;
          if (language) params.language = language;
          if (state) params.state = state; // Include state for context
        } else if (state) {
          endpoint = 'https://api.anmol-goswami-resume.store/api/newsByState';
          params.state = state;
          if (language) params.language = language;
        } else if (language) {
          endpoint = 'https://api.anmol-goswami-resume.store/api/news';
          params.language = language;
        }

        console.log('Fetching from:', endpoint, 'with params:', params);
        const response = await axios.get(endpoint, { params });
        console.log('API response:', response.data);

        if (!Array.isArray(response.data)) {
          throw new Error('Invalid response format: Expected an array');
        }

        const normalizedNews = response.data.map((article) => {
          const slug = slugify(article.title || article.tittle, article.id);
          console.log('News ID:', article.id, 'Title:', article.title || article.tittle, 'Slug:', slug, 'Raw Content:', article.content);
          return {
            ...article,
            title: article.title || article.tittle || 'हिन्दी समाचार',
            slug,
            summary: stripHtml(article.content),
          };
        });
        setNews(normalizedNews);
        const uniqueCategories = [...new Set(normalizedNews.map((article) => article.categoryName))].filter(Boolean);
        setCategories(uniqueCategories);
      } catch (err) {
        const message = err.response?.data?.message || err.message;
        setError(`Failed to load news: ${message}`);
        toast.error(`Failed to load news: ${message}`);
        console.error('Fetch error:', message, err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, [category, state, district, language]);

  // Dynamic metadata
  const ogNews = news[0] || {
    title: district ? `${district} News` : state ? `${state} News` : category ? `${category} News` : 'All News',
    slug: 'news',
    summary: `Explore ${district || state || category || 'all'} news on Talewire.`,
    imageUrl: '/path/to/default-image.jpg',
    publishedDate: new Date().toISOString(),
  };
  const keywords = [
    'news',
    district || state || category || 'all',
    'Talewire',
    'latest news',
    'headlines',
    ...new Set(categories),
  ].join(', ');

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>
          {district ? `${district} News` : state ? `${state} News` : category ? `${category} News` : 'All News'} | Talewire
        </title>
        <meta
          name="description"
          content={`Explore ${district || state || category || 'all'} news on Talewire. Stay updated with the latest stories and headlines.`}
        />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="canonical"
          href={`https://www.talewire.com/news${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
        />
        <meta
          property="og:title"
          content={ogNews.title || `${district || state || category || 'All'} News | Talewire`}
        />
        <meta property="og:description" content={ogNews.summary} />
        <meta property="og:image" content={ogNews.imageUrl} />
        <meta
          property="og:url"
          content={`https://www.talewire.com/news${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Talewire" />
        <meta property="og:locale" content="en_IN" />
        <meta property="article:published_time" content={ogNews.publishedDate} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={ogNews.title || `${district || state || category || 'All'} News | Talewire`}
        />
        <meta name="twitter:description" content={ogNews.summary} />
        <meta name="twitter:image" content={ogNews.imageUrl} />
        <meta name="twitter:site" content="@SamaySiwan" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: district ? `${district} News` : state ? `${state} News` : category ? `${category} News` : 'All News',
            url: `https://www.talewire.com/news${searchParams.toString() ? `?${searchParams.toString()}` : ''}`,
            description: `Explore ${district || state || category || 'all'} news on Talewire, featuring the latest stories and headlines.`,
            publisher: {
              '@type': 'Organization',
              name: 'Talewire',
              logo: {
                '@type': 'ImageObject',
                url: '/path/to/logo.png',
                width: 300,
                height: 100,
              },
            },
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: news.map((article, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                  '@type': 'NewsArticle',
                  headline: article.title,
                  url: `https://www.talewire.com/news/${article.id}/${article.slug}`,
                  image: article.imageUrl || 'https://via.placeholder.com/400x200?text=Image+Not+Found',
                  datePublished: article.publishedDate || new Date().toISOString(),
                  description: article.summary,
                  articleSection: article.categoryName || 'General',
                  publisher: {
                    '@type': 'Organization',
                    name: 'Talewire',
                    logo: {
                      '@type': 'ImageObject',
                      url: '/path/to/logo.png',
                      width: 300,
                      height: 100,
                    },
                  },
                },
              })),
            },
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 pt-4 pb-3">
            <h1
              className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight"
              id="news-list-heading"
              style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
            >
              {district ? `${district} News` : state ? `${state} News` : category ? `${category} News` : 'All News'}
            </h1>
            {(category || state || district) && (
              <p
                className="mt-2 text-sm text-gray-500 dark:text-gray-400"
                style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
              >
                Showing news for{' '}
                {district ? `district: ${district}` : state ? `state: ${state}` : `category: ${category}`}
              </p>
            )}
            <div className="h-0.5 w-full bg-gradient-to-r from-amber-500 to-transparent rounded-full mt-1.5" aria-hidden="true" />
          </div>

          {/* Main Layout with Sidebar */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar for Categories */}
            <aside className="lg:w-1/4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-20">
                <h2
                  className="text-xl font-semibold text-gray-900 dark:text-white mb-4"
                  style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                >
                  Categories
                </h2>
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="/news"
                      className={`block text-sm font-medium ${
                        !category && !state && !district
                          ? 'text-amber-500 dark:text-amber-400'
                          : 'text-gray-600 dark:text-gray-300'
                      } hover:text-amber-500 dark:hover:text-amber-400 transition-colors duration-200`}
                      aria-current={!category && !state && !district ? 'page' : undefined}
                      style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                    >
                      <span className="flex items-center">
                        <FaNewspaper className="mr-2" /> All News
                      </span>
                    </Link>
                  </li>
                  {categories.map((cat, index) => (
                    <li key={index}>
                      <Link
                        to={`/news?category=${encodeURIComponent(cat)}`}
                        className={`block text-sm font-medium ${
                          cat === category ? 'text-amber-500 dark:text-amber-400' : 'text-gray-600 dark:text-gray-300'
                        } hover:text-amber-500 dark:hover:text-amber-400 transition-colors duration-200`}
                        aria-current={cat === category ? 'page' : undefined}
                        style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                      >
                        <span className="flex items-center">
                          <FaTag className="mr-2" /> {cat}
                        </span>
                      </Link>
                    </li>
                  ))}
                  {categories.length === 0 && (
                    <p
                      className="text-sm text-gray-500 dark:text-gray-400"
                      style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                    >
                      No categories available
                    </p>
                  )}
                </ul>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:w-3/4" role="main" aria-labelledby="news-list-heading">
              {/* Error and Loading States */}
              {error && (
                <div
                  className="mb-6 p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-center"
                  role="alert"
                  style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                >
                  {error}
                </div>
              )}
              {isLoading && (
                <div
                  className="mb-6 p-4 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-center animate-pulse"
                  role="status"
                  aria-label="Loading news"
                  style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                >
                  Loading news...
                </div>
              )}
              {news.length === 0 && !isLoading && !error && (
                <div
                  className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg text-center"
                  role="alert"
                  style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                >
                  No news found for{' '}
                  {district
                    ? `district: ${district}`
                    : state
                    ? `state: ${state}`
                    : category
                    ? `category: ${category}`
                    : 'the selected filters'}
                </div>
              )}

              {/* News Grid */}
              <div className="min-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-500 scrollbar-track-gray-100 dark:scrollbar-track-gray-900">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {news.map((article, index) => (
                    <div
                      key={article.id}
                      className={`group bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                        index === 0 && news.length > 1 ? 'md:col-span-2' : ''
                      }`}
                      itemScope
                      itemType="https://schema.org/NewsArticle"
                    >
                      <div className="relative">
                        {article.imageUrl ? (
                          <img
                            src={article.imageUrl}
                            alt={article.title ? `${article.title} - News Image` : 'News Image'}
                            className="w-full h-48 object-cover"
                            onError={(e) => (e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found')}
                            itemProp="image"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span
                              className="text-gray-400 dark:text-gray-500"
                              style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                            >
                              No Image Available
                            </span>
                          </div>
                        )}
                        <div className="p-6">
                          <h2
                            className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors duration-200 line-clamp-2"
                            itemProp="headline"
                            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                          >
                            {article.title}
                          </h2>
                          <p
                            className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3"
                            itemProp="description"
                            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                          >
                            {article.summary}
                          </p>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex flex-wrap gap-2">
                            {article.categoryName && (
                              <span
                                className="bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded flex items-center"
                                style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                              >
                                <FaTag className="mr-1" /> Category: {article.categoryName}
                              </span>
                            )}
                            {article.stateName && article.stateName !== 'All' && (
                              <span
                                className="bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded flex items-center"
                                style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                              >
                                <FaMapMarkerAlt className="mr-1" /> State: {article.stateName}
                              </span>
                            )}
                            {article.districtName && article.districtName !== 'All' && (
                              <span
                                className="bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded flex items-center"
                                style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                              >
                                <FaMapMarkerAlt className="mr-1" /> District: {article.districtName}
                              </span>
                            )}
                            {article.publishedDate && (
                              <span
                                className="bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded flex items-center"
                                style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                              >
                                <FaCalendarAlt className="mr-1" />
                                {new Date(article.publishedDate).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })}
                              </span>
                            )}
                            <span
                              className="bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded flex items-center"
                              style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                            >
                              <FaEye className="mr-1" /> Views: {article.viewCount || 0}
                            </span>
                            <span
                              className="bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded flex items-center"
                              style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                            >
                              <FaShareAlt className="mr-1" /> Shares: {article.shareCount || 0}
                            </span>
                          </div>
                          <Link
                            to={`/news/${article.id}/${article.slug}`}
                            className="inline-flex items-center text-amber-500 hover:text-amber-600 font-medium text-sm transition-colors duration-200"
                            itemProp="url"
                            aria-label={`Read more about ${article.title}`}
                          >
                            <FaArrowRight className="mr-1" /> Read More
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advertisement */}
              <div className="mt-8 bg-gradient-to-r from-amber-400 to-amber-600 dark:from-amber-600 dark:to-amber-800 rounded-xl p-6 text-center text-white">
                <h3
                  className="text-lg font-semibold mb-2 flex items-center justify-center"
                  style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                >
                  <FaBullhorn className="mr-2" /> Advertise With Us
                </h3>
                <p
                  className="text-sm mb-4"
                  style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                >
                  Reach thousands of readers with your ad!
                </p>
                <Link
                  to="/advertise"
                  className="inline-flex items-center text-white hover:text-amber-200 font-medium text-sm transition-colors duration-200"
                  aria-label="Learn more about advertising"
                  style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                >
                  <FaBullhorn className="mr-2" /> Learn More
                </Link>
              </div>
            </main>
          </div>
        </div>

        <style>
          {`
            /* Custom scrollbar for better cross-browser support */
            .scrollbar-thin::-webkit-scrollbar {
              width: 8px;
            }
            .scrollbar-thin::-webkit-scrollbar-thumb {
              background-color: #f59e0b; /* amber-500 */
              border-radius: 4px;
            }
            .scrollbar-thin::-webkit-scrollbar-track {
              background-color: #f3f4f6; /* gray-100 */
            }
            .dark .scrollbar-thin::-webkit-scrollbar-track {
              background-color: #1f2937; /* gray-900 */
            }
          `}
        </style>
      </div>
    </>
  );
};

export default NewsList;