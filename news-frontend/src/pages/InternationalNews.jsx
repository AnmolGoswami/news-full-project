import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';

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

const International = () => {
  const [news, setNews] = useState([]);
  const [visibleNews, setVisibleNews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [showAd, setShowAd] = useState(true);
  const loaderRef = useRef(null);

  // Fetch news data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const newsResponse = await axios.get('https://api.anmol-goswami-resume.store/api/newsByCategory', {
          params: { category: 'International' },
        });
        // Normalize title/tittle
        const normalizedNews = newsResponse.data.map((article) => {
          const slug = slugify(article.title || article.tittle, article.id);
          console.log('News ID:', article.id, 'Title:', article.title || article.tittle, 'Slug:', slug, 'Raw Content:', article.content); // Debug content
          return {
            ...article,
            title: article.title || article.tittle || 'हिन्दी समाचार',
            slug,
            summary: stripHtml(article.content),
          };
        });
        setNews(normalizedNews);
        setVisibleNews(normalizedNews.slice(0, 6)); // Initial load
      } catch (err) {
        const message = err.response?.data?.message || err.message;
        setError(`Failed to load data: ${message}`);
        toast.error(`Failed to load data: ${message}`);
        console.error('Fetch error:', message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          setPage((prev) => prev + 1);
          setVisibleNews((prev) => [
            ...prev,
            ...news.slice(prev.length, prev.length + 6), // Load next 6 items
          ]);
        }
      },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [news, isLoading]);

  // Reset visibleNews when news changes
  useEffect(() => {
    setVisibleNews(news.slice(0, 6));
    setPage(1);
  }, [news]);

  // Function to hide the ad
  const handleCancelAd = () => {
    setShowAd(false);
  };

  // Dynamic metadata
  const ogNews = news[0] || {
    title: 'International News',
    slug: 'international',
    summary: 'Discover the latest international news on Talewire.',
    imageUrl: '/path/to/default-image.jpg',
    publishedDate: new Date().toISOString(),
  };
  const keywords = [
    'international news',
    'Talewire',
    'latest news',
    'headlines',
    ...new Set(news.map((article) => article.categoryName).filter(Boolean)),
  ].join(', ');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      <Helmet>
        <meta charSet="utf-8" />
        <title>International News | Talewire</title>
        <meta
          name="description"
          content="Discover the latest international news on Talewire. Stay updated with national stories and headlines."
        />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://www.talewire.com/international" />

        <meta property="og:title" content={ogNews.title || 'International News | Talewire'} />
        <meta property="og:description" content={ogNews.summary} />
        <meta property="og:image" content={ogNews.imageUrl} />
        <meta property="og:url" content="https://www.talewire.com/international" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Talewire" />
        <meta property="og:locale" content="en_IN" />
        <meta property="article:published_time" content={ogNews.publishedDate} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogNews.title || 'International News | Talewire'} />
        <meta name="twitter:description" content={ogNews.summary} />
        <meta name="twitter:image" content={ogNews.imageUrl} />
        <meta name="twitter:site" content="@SamaySiwan" />

        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'International News',
            url: 'https://www.talewire.com/international',
            description: 'Discover the latest international news on Talewire, featuring national stories and headlines.',
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
                  articleSection: 'International',
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

      <style>
        {`
          @keyframes slideIn {
            0% { transform: translateY(50px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          @keyframes hoverPulse {
            0% { transform: scale(1) rotate(0deg); }
            100% { transform: scale(1.05) rotate(3deg); }
          }
          .animate-slide-in {
            animation: slideIn 0.8s ease-out forwards;
          }
          .group:hover .animate-hover-pulse {
            animation: hoverPulse 0.3s ease-out forwards;
          }
          .professional-ad {
            font-family: 'Noto Sans Devanagari', sans-serif;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            padding: 1.5rem;
          }
          .professional-ad h3 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 0.5rem;
          }
          .professional-ad p {
            font-size: 1rem;
            color: #4b5563;
            margin-bottom: 1rem;
          }
          .professional-ad a {
            display: inline-block;
            background: #f59e0b;
            color: #ffffff;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            font-weight: 500;
            text-decoration: none;
            transition: background 0.2s ease;
          }
          .professional-ad a:hover {
            background: #d97706;
          }
          .cancel-button {
            background: #dc2626;
            color: #ffffff;
            font-family: 'Noto Sans Devanagari', sans-serif;
            border: none;
            padding: 0.5rem;
            border-radius: 50%;
            cursor: pointer;
            font-size: 0.875rem;
            position: absolute;
            top: -10px;
            right: -10px;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .cancel-button:hover {
            background: #b91c1c;
          }
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

      {/* Hero Section with Sticky Headline */}
      {news.length > 0 && (
        <section
          className="relative h-screen flex items-center justify-center text-gray-900 dark:text-white bg-gray-300 dark:bg-gray-800 bg-fixed bg-cover bg-center"
          style={{ backgroundImage: `url(${news[0].imageUrl || 'https://via.placeholder.com/1920x1080?text=Top+International+News'})` }}
          itemScope
          itemType="https://schema.org/NewsArticle"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50 dark:from-black/50 dark:to-black/70"></div>
          <div className="relative z-10 text-center px-4 max-w-3xl">
            <div className="sticky top-0 z-20 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-md pt-4 pb-3">
              <h1
                className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-700 dark:from-amber-400 dark:to-amber-600 mb-4 animate-slide-in"
                id="international-news-heading"
                style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
              >
                International News
              </h1>
              <div className="h-0.5 w-full bg-gradient-to-r from-amber-500 to-transparent rounded-full mt-1.5" aria-hidden="true" />
            </div>
            <p
              className="text-lg md:text-xl mb-6 animate-slide-in"
              style={{ animationDelay: '0.2s', fontFamily: "'Noto Sans Devanagari', sans-serif" }}
            >
              Discover the pulse of the nation
            </p>
            <div className="group relative bg-white/100 dark:bg-gray-900/60 backdrop-filter backdrop-blur-lg p-6 rounded-xl border border-amber-500/30 shadow-lg hover:shadow-amber-500/30 transition-all duration-300">
              <div className="animate-hover-pulse">
                <h2
                  className="text-2xl md:text-3xl font-bold mb-3 line-clamp-2 text-gray-900 dark:text-white"
                  itemProp="headline"
                  style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                >
                  {news[0].title}
                </h2>
                <p
                  className="text-sm md:text-base line-clamp-3 mb-4 text-gray-700 dark:text-gray-300"
                  itemProp="description"
                  style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                >
                  {news[0].summary}
                </p>
                <div className="flex flex-wrap gap-3 text-xs mb-4">
                  {news[0].stateName && (
                    <span
                      className="bg-amber-500/20 px-3 py-1 rounded-full text-gray-800 dark:text-gray-200"
                      style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                    >
                      State: {news[0].stateName}
                    </span>
                  )}
                  {news[0].districtName && (
                    <span
                      className="bg-amber-500/20 px-3 py-1 rounded-full text-gray-800 dark:text-gray-200"
                      style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                    >
                      District: {news[0].districtName}
                    </span>
                  )}
                  <time
                    className="bg-amber-500/20 px-3 py-1 rounded-full text-gray-800 dark:text-gray-200"
                    dateTime={news[0].publishedDate}
                    style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                  >
                    {new Date(news[0].publishedDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </time>
                  <span
                    className="bg-amber-500/20 px-3 py-1 rounded-full text-gray-800 dark:text-gray-200"
                    style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                  >
                    Views: {news[0].viewCount || 0}
                  </span>
                  <span
                    className="bg-amber-500/20 px-3 py-1 rounded-full text-gray-800 dark:text-gray-200"
                    style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                  >
                    Shares: {news[0].shareCount || 0}
                  </span>
                </div>
                <Link
                  to={`/news/${news[0].id}/${news[0].slug}`}
                  className="inline-block bg-amber-500 text-white px-6 py-2 rounded-full font-medium hover:bg-amber-600 transition-colors duration-300"
                  itemProp="url"
                  aria-label={`Read more about ${news[0].title}`}
                  style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                >
                  Read Story
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Curved Divider */}
      <div className="relative -mt-8 mb-12">
        <svg
          className="w-full h-16 text-gray-50 dark:text-gray-900"
          viewBox="0 0 1440 100"
          fill="currentColor"
          preserveAspectRatio="none"
        >
          <path d="M0,0 C360,100 1080,100 1440,0 L1440,100 L0,100 Z" fill="url(#gradient)" />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#F59E0B', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#D97706', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Spotlight Section */}
      {news.length > 1 && (
        <section className="relative py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-8 text-center animate-slide-in"
              style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
            >
              Featured Highlights
            </h2>
            <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-amber-500 scrollbar-track-gray-100 dark:scrollbar-track-gray-900">
              {news.slice(1, 4).map((article, index) => (
                <div
                  key={article.id}
                  className="min-w-[300px] snap-center group bg-white/90 dark:bg-gray-900/60 backdrop-filter backdrop-blur-lg rounded-xl overflow-hidden border border-amber-500/20 shadow-lg hover:shadow-amber-500/30 transition-all duration-300 animate-slide-in"
                  style={{ animationDelay: `${index * 0.2}s` }}
                  itemScope
                  itemType="https://schema.org/NewsArticle"
                >
                  <div className="relative">
                    {article.imageUrl ? (
                      <img
                        src={article.imageUrl}
                        alt={article.title ? `${article.title} - News Image` : 'News Image'}
                        className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
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
                          aria-label="Watch video"
                          style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                        >
                          Watch Video
                        </a>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span
                          className="text-gray-400 dark:text-gray-500"
                          style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                        >
                          No Media
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-6">
                    <h3
                      className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors duration-200 line-clamp-2"
                      itemProp="headline"
                      style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                    >
                      {article.title}
                    </h3>
                    <p
                      className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2"
                      itemProp="description"
                      style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                    >
                      {article.summary}
                    </p>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-4 flex flex-wrap gap-2">
                      {article.stateName && (
                        <span
                          className="bg-amber-500/20 px-2 py-1 rounded text-gray-800 dark:text-gray-200"
                          style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                        >
                          State: {article.stateName}
                        </span>
                      )}
                      {article.districtName && (
                        <span
                          className="bg-amber-500/20 px-2 py-1 rounded text-gray-800 dark:text-gray-200"
                          style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                        >
                          District: {article.districtName}
                        </span>
                      )}
                      <time
                        className="bg-amber-500/20 px-2 py-1 rounded text-gray-800 dark:text-gray-200"
                        dateTime={article.publishedDate}
                        style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                      >
                        {new Date(article.publishedDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </time>
                    </div>
                    <Link
                      to={`/news/${article.id}/${article.slug}`}
                      className="inline-block text-amber-500 hover:text-amber-600 font-medium text-sm transition-colors duration-300"
                      itemProp="url"
                      aria-label={`Read more about ${article.title}`}
                      style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                    >
                      Read More →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Staggered Grid */}
      {news.length > 4 && (
        <section className="relative py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-8 text-center animate-slide-in"
              style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
            >
              More Stories
            </h2>
            <div className="min-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-500 scrollbar-track-gray-100 dark:scrollbar-track-gray-900">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleNews.slice(4).map((article, index) => (
                  <div
                    key={article.id}
                    className="group bg-white/90 dark:bg-gray-900/60 backdrop-filter backdrop-blur-lg rounded-xl overflow-hidden border border-amber-500/20 shadow-lg hover:shadow-amber-500/30 transition-all duration-300 animate-slide-in"
                    style={{ animationDelay: `${index * 0.1}s`, transform: `translateY(${(index % 3) * 20}px)` }}
                    itemScope
                    itemType="https://schema.org/NewsArticle"
                  >
                    <div className="relative">
                      {article.imageUrl ? (
                        <img
                          src={article.imageUrl}
                          alt={article.title ? `${article.title} - News Image` : 'News Image'}
                          className="w-full h-48 object-cover transform group-hover:scale-110 group-hover:rotate-2 transition-transform duration-300"
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
                            aria-label="Watch video"
                            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                          >
                            Watch Video
                          </a>
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span
                            className="text-gray-400 dark:text-gray-500"
                            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                          >
                            No Media
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end">
                        <p
                          className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3"
                          itemProp="description"
                          style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                        >
                          {article.summary}
                        </p>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3
                        className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors duration-200 line-clamp-2"
                        itemProp="headline"
                        style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                      >
                        {article.title}
                      </h3>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-4 flex flex-wrap gap-2">
                        {article.stateName && (
                          <span
                            className="bg-amber-500/20 px-2 py-1 rounded text-gray-800 dark:text-gray-200"
                            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                          >
                            State: {article.stateName}
                          </span>
                        )}
                        {article.districtName && (
                          <span
                            className="bg-amber-500/20 px-2 py-1 rounded text-gray-800 dark:text-gray-200"
                            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                          >
                            District: {article.districtName}
                          </span>
                        )}
                        <time
                          className="bg-amber-500/20 px-2 py-1 rounded text-gray-800 dark:text-gray-200"
                          dateTime={article.publishedDate}
                          style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                        >
                          {new Date(article.publishedDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </time>
                        <span
                          className="bg-amber-500/20 px-2 py-1 rounded text-gray-800 dark:text-gray-200"
                          style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                        >
                          Views: {article.viewCount || 0}
                        </span>
                        <span
                          className="bg-amber-500/20 px-2 py-1 rounded text-gray-800 dark:text-gray-200"
                          style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                        >
                          Shares: {article.shareCount || 0}
                        </span>
                      </div>
                      <Link
                        to={`/news/${article.id}/${article.slug}`}
                        className="inline-block text-amber-500 hover:text-amber-600 font-medium text-sm transition-colors duration-300"
                        itemProp="url"
                        aria-label={`Read more about ${article.title}`}
                        style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                      >
                        Read More →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div ref={loaderRef} className="h-10"></div>
            </div>
          </div>
        </section>
      )}

      {/* Error and Loading States */}
      {error && (
        <div
          className="fixed bottom-4 left-4 right-4 p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-center z-50"
          role="alert"
          style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
        >
          {error}
        </div>
      )}
      {isLoading && (
        <div
          className="fixed bottom-4 left-4 right-4 p-4 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-center animate-pulse z-50"
          role="status"
          aria-label="Loading news"
          style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
        >
          Loading news...
        </div>
      )}
      {news.length === 0 && !isLoading && !error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div
            className="p-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg"
            role="alert"
            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
          >
            No international news found.
          </div>
        </div>
      )}

      {/* Professional Orbital Ad with Cancel Button */}
      {showAd && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative professional-ad">
            <button
              onClick={handleCancelAd}
              className="cancel-button"
              aria-label="Close advertisement"
              title="Close Ad"
            >
              X
            </button>
            <div className="relative text-center">
              <h3 style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                Advertise With Us
              </h3>
              <p style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                Reach thousands of readers with your advertisement.
              </p>
              <Link
                to="/advertise"
                className="inline-block bg-amber-500 text-white px-6 py-2 rounded-full font-medium hover:bg-amber-600 transition-colors duration-300"
                aria-label="Learn more about advertising"
                style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default International;