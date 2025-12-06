import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';

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
    if (typeof document !== 'undefined') {
      const div = document.createElement('div');
      div.innerHTML = html;
      const text = div.textContent || div.innerText || '';
      return text
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
        .substring(0, 100) + (text.length > 100 ? '...' : '');
    } else {
      throw new Error('document is not defined');
    }
  } catch (error) {
    console.error('stripHtml error:', error, 'Input:', html);
    return html
      .replace(/<[^>]+>/g, '') // Fallback: Remove HTML tags using regex
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 100) + (html.length > 100 ? '...' : '');
  }
};

const StateNews = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

  // Extract query parameters
  const state = searchParams.get('state') || '';
  const district = searchParams.get('district') || '';

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Fetch states
        const statesResponse = await axios.get('https://api.anmol-goswami-resume.store/api/getState');
        const stateNames = statesResponse.data.map((s) => s.name).filter(Boolean);
        setStates(stateNames);
        console.log('Fetched states:', stateNames);

        // Fetch districts (filter by state if selected)
        const districtsResponse = await axios.get('https://api.anmol-goswami-resume.store/api/getDistricts', {
          params: state ? { stateName: state } : {}, // Pass stateName to filter districts
        });
        const filteredDistricts = districtsResponse.data
          .map((d) => d.name)
          .filter(Boolean)
          .sort(); // Sort for consistent display
        setDistricts(filteredDistricts);
        console.log('Fetched districts:', filteredDistricts);

        // Validate selected state and district
        if (state && !stateNames.includes(state)) {
          setError(`Invalid state: ${state}`);
          setNews([]);
          toast.error(`Invalid state: ${state}`);
          setIsLoading(false);
          return;
        }
        if (district && !filteredDistricts.includes(district)) {
          setError(`Invalid district: ${district}`);
          setNews([]);
          toast.error(`Invalid district: ${district}`);
          setIsLoading(false);
          return;
        }

        // Fetch news
        let newsResponse;
        if (district) {
          newsResponse = await axios.get('https://api.anmol-goswami-resume.store/api/newsByDistrict', {
            params: { district },
          });
        } else if (state) {
          newsResponse = await axios.get('https://api.anmol-goswami-resume.store/api/newsByState', {
            params: { state },
          });
        } else {
          newsResponse = await axios.get('https://api.anmol-goswami-resume.store/api/news');
        }
        console.log('News API response:', newsResponse.data);

        // Map news to handle title/tittle
        const normalizedNews = newsResponse.data.map((article) => {
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

        // Log for debugging
        if (normalizedNews.length === 0) {
          console.warn(`No news found for ${district ? `district: ${district}` : state ? `state: ${state}` : 'all states'}`);
        }
      } catch (err) {
        const message = err.response?.data?.message || err.message;
        setError(`Failed to load data: ${message}`);
        toast.error(`Failed to load data: ${message}`);
        console.error('Fetch error:', err, 'Message:', message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [state, district]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
      if (key === 'state') newParams.delete('district'); // Reset district when state changes
    } else {
      newParams.delete(key);
      if (key === 'state') newParams.delete('district');
    }
    setSearchParams(newParams);
  };

  // Dynamic metadata
  const ogNews = news[0] || {
    title: district ? `${district} News` : state ? `${state} News` : 'All State News',
    slug: 'state-news',
    summary: `Explore ${district || state || 'all state'} news on Talewire.`,
    imageUrl: '/path/to/default-image.jpg',
    publishedDate: new Date().toISOString(),
  };
  const keywords = [
    'news',
    district || state || 'state',
    'Talewire',
    'latest news',
    'headlines',
    ...new Set(news.map((article) => article.categoryName).filter(Boolean)),
  ].join(', ');

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{district ? `${district} News` : state ? `${state} News` : 'All State News'} | Talewire</title>
        <meta
          name="description"
          content={`Explore ${district || state || 'all state'} news on Talewire. Stay updated with the latest regional stories and headlines.`}
        />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="canonical"
          href={`https://www.talewire.com/state-news${state ? `?state=${encodeURIComponent(state)}${district ? `&district=${encodeURIComponent(district)}` : ''}` : ''}`}
        />
        <meta property="og:title" content={ogNews.title || `${district ? `${district} News` : state ? `${state} News` : 'All State News'} | Talewire`} />
        <meta property="og:description" content={ogNews.summary} />
        <meta property="og:image" content={ogNews.imageUrl} />
        <meta
          property="og:url"
          content={`https://www.talewire.com/state-news${state ? `?state=${encodeURIComponent(state)}${district ? `&district=${encodeURIComponent(district)}` : ''}` : ''}`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Talewire" />
        <meta property="og:locale" content="en_IN" />
        <meta property="article:published_time" content={ogNews.publishedDate} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogNews.title || `${district ? `${district} News` : state ? `${state} News` : 'All State News'} | Talewire`} />
        <meta name="twitter:description" content={ogNews.summary} />
        <meta name="twitter:image" content={ogNews.imageUrl} />
        <meta name="twitter:site" content="@SamaySiwan" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: district ? `${district} News` : state ? `${state} News` : 'All State News',
            url: `https://www.talewire.com/state-news${state ? `?state=${encodeURIComponent(state)}${district ? `&district=${encodeURIComponent(district)}` : ''}` : ''}`,
            description: `Explore ${district || state || 'all state'} news on Talewire, featuring the latest regional stories and headlines.`,
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
              id="state-news-heading"
              style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
            >
              {district ? `${district} News` : state ? `${state} News` : 'All State News'}
            </h1>
            {(state || district) && (
              <p
                className="mt-2 text-sm text-gray-500 dark:text-gray-400"
                style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
              >
                Showing news {state && `for state: ${state}`}{district && `${state ? ' and ' : ''}district: ${district}`}
              </p>
            )}
            <div className="h-0.5 w-full bg-gradient-to-r from-amber-500 to-transparent rounded-full mt-1.5" aria-hidden="true" />
          </div>

          {/* Main Layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-1/4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-20">
                <h2
                  className="text-xl font-semibold text-gray-900 dark:text-white mb-4"
                  style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                >
                  Filters
                </h2>
                {/* State Filter */}
                <div className="mb-6">
                  <label
                    className="flex items-center text-lg font-medium text-gray-900 dark:text-white mb-2"
                    style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                  >
                    <svg
                      className="w-5 h-5 mr-2 text-amber-500 dark:text-amber-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    State
                  </label>
                  <select
                    value={state}
                    onChange={(e) => handleFilterChange('state', e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                    aria-label="Select a state"
                  >
                    <option value="">All States</option>
                    {states.map((stateName, index) => (
                      <option key={index} value={stateName}>
                        {stateName}
                      </option>
                    ))}
                  </select>
                  {states.length === 0 && (
                    <p
                      className="text-sm text-gray-500 dark:text-gray-400 mt-2"
                      style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                    >
                      No states available
                    </p>
                  )}
                </div>
                {/* District Filter */}
                <div>
                  <label
                    className="flex items-center text-lg font-medium text-gray-900 dark:text-white mb-2"
                    style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                  >
                    <svg
                      className="w-5 h-5 mr-2 text-amber-500 dark:text-amber-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553-2.276A1 1 0 0021 13.382V6.618a1 1 0 00-1.447-.894L15 8"
                      />
                    </svg>
                    District
                  </label>
                  <select
                    value={district}
                    onChange={(e) => handleFilterChange('district', e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    disabled={!state}
                    style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                    aria-label="Select a district"
                  >
                    <option value="">All Districts</option>
                    {districts.map((districtName, index) => (
                      <option key={index} value={districtName}>
                        {districtName}
                      </option>
                    ))}
                  </select>
                  {districts.length === 0 && (
                    <p
                      className="text-sm text-gray-500 dark:text-gray-400 mt-2"
                      style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                    >
                      {state ? 'No districts available for this state' : 'Select a state to view districts'}
                    </p>
                  )}
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:w-3/4" role="main" aria-labelledby="state-news-heading">
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
                  No news found for {district ? `the "${district}" district` : state ? `the "${state}" state` : 'all states'}.
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
                        ) : article.videoLink ? (
                          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <a
                              href={article.videoLink}
                              className="text-amber-500 hover:text-amber-600"
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="View video"
                              style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                            >
                              View Video
                            </a>
                          </div>
                        ) : (
                          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span
                              className="text-gray-400 dark:text-gray-500"
                              style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                            >
                              No Media Available
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
                            {article.stateName && (
                              <span
                                className="bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded"
                                style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                              >
                                State: {article.stateName}
                              </span>
                            )}
                            {article.districtName && (
                              <span
                                className="bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded"
                                style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                              >
                                District: {article.districtName}
                              </span>
                            )}
                            {article.publishedDate && (
                              <time
                                className="bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded"
                                dateTime={article.publishedDate}
                                style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                              >
                                {new Date(article.publishedDate).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })}
                              </time>
                            )}
                            <span
                              className="bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded"
                              style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                            >
                              Views: {article.viewCount || 0}
                            </span>
                            <span
                              className="bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded"
                              style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                            >
                              Shares: {article.shareCount || 0}
                            </span>
                          </div>
                          <Link
                            to={`/news/${article.id}/${article.slug}`}
                            className="inline-block text-amber-500 hover:text-amber-600 font-medium text-sm transition-colors duration-200"
                            itemProp="url"
                            aria-label={`Read more about ${article.title}`}
                            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                          >
                            Read More →
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
                  className="text-lg font-semibold mb-2"
                  style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                >
                  Advertise With Us
                </h3>
                <p
                  className="text-sm mb-4"
                  style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                >
                  Reach thousands of readers with your ad!
                </p>
                <Link
                  to="/advertise"
                  className="inline-block bg-white text-amber-600 dark:bg-gray-800 dark:text-amber-400 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  aria-label="Learn more about advertising"
                  style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                >
                  Learn More
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

export default StateNews;