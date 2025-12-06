import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ThemeContext } from '../context/ThemeProvider';

// Custom debounce function with cancel method
const debounce = (func, wait) => {
  let timeout;
  const debounced = (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
  debounced.cancel = () => {
    clearTimeout(timeout);
  };
  return debounced;
};

// Slugify function (same as NewsDetails)
const slugify = (text, id) => {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return `news-article-${id}`;
  }
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '') // Support Unicode (e.g., Hindi)
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .substring(0, 100);
};

const SearchResults = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const [newsArticles, setNewsArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();

  // Get search query from URL
  const getQuery = () => {
    return new URLSearchParams(location.search).get('q')?.trim().toLowerCase() || '';
  };

  // Fetch news articles
  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await axios.get('https://api.anmol-goswami-resume.store/api/news', {
          timeout: 10000,
        });
        // Remove duplicates based on id
        const uniqueArticles = Array.from(
          new Map(response.data.map((article) => [article.id, article])).values()
        );
        setNewsArticles(uniqueArticles);
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to connect to the server';
        setError(`Failed to fetch news: ${message}`);
        toast.error('Failed to load news articles');
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, []);

  // Debounced filtering function
  const filterArticles = useMemo(
    () =>
      debounce((query, articles) => {
        try {
          if (!query) {
            setFilteredArticles([]);
            setError('Please活力enter a search query');
            toast.warn('Please enter a search query');
            return;
          }
          if (!articles || articles.length === 0) {
            setFilteredArticles([]);
            setError('No news articles available to search');
            return;
          }
          const filtered = articles.filter((article) => {
            const title = article.title?.toLowerCase() || '';
            const content = article.content?.toLowerCase() || '';
            return title.includes(query) || content.includes(query);
          });
          setFilteredArticles(filtered);
          setError(filtered.length === 0 ? `No news articles found for "${query}"` : '');
        } catch (err) {
          setError('An error occurred while filtering news');
          toast.error('An error occurred while filtering news');
        }
      }, 300),
    []
  );

  // Filter articles when query or articles change
  useEffect(() => {
    const query = getQuery();
    filterArticles(query, newsArticles);
    return () => filterArticles.cancel(); // Cleanup debounce
  }, [location.search, newsArticles, filterArticles]);

  // Render individual article card
  const ArticleCard = ({ article }) => (
    <div
      className={`p-4 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl ${
        isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
      }`}
      role="article"
      aria-labelledby={`article-title-${article.id}`}
    >
      {article.imageUrl && (
        <img
          src={article.imageUrl}
          alt={article.title ? `${article.title} - Featured Image` : 'News Article Image'}
          className="w-full h-48 object-cover rounded-lg mb-4 transition-transform duration-300 hover:scale-105"
          loading="lazy"
          onError={(e) => (e.target.src = '/path/to/default-image.jpg')}
          itemProp="image"
        />
      )}
      <h2
        id={`article-title-${article.id}`}
        className="text-lg font-semibold mb-2 line-clamp-2"
        style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
        itemProp="headline"
      >
        {article.title || 'Untitled Article'}
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
        {article.content?.substring(0, 150) || 'No content available.'}...
      </p>
      <div className="flex justify-between items-center text-sm">
        <Link
          to={`/news/${article.id}/${slugify(article.title, article.id)}`}
          className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
          aria-label={`Read more about ${article.title || 'this article'}`}
          itemProp="url"
        >
          Read More
        </Link>
        <span className="text-gray-500 dark:text-gray-400">
          {article.categoryName} | {new Date(article.publishedDate).toLocaleDateString('en-IN')}
        </span>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Search Results | Talewire</title>
        <meta
          name="description"
          content={`Explore news articles for "${getQuery()}" on Talewire. Stay updated with the latest local and international news.`}
        />
        <meta
          name="keywords"
          content={`Talewire, search news, ${getQuery()}, local news, breaking news, AI, India`}
        />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="canonical"
          href={`https://www.talewire.com/search?q=${encodeURIComponent(getQuery())}`}
        />
        <meta property="og:title" content={`Search Results for "${getQuery()}" | Talewire`} />
        <meta
          property="og:description"
          content={`Explore news articles for "${getQuery()}" on Talewire.`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:site_name" content="Talewire" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Search Results for "${getQuery()}" | Talewire`} />
        <meta
          name="twitter:description"
          content={`Explore news articles for "${getQuery()}" on Talewire.`}
        />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SearchResultsPage',
            headline: `Search Results for "${getQuery()}"`,
            description: `Explore news articles for "${getQuery()}" on Talewire.`,
            publisher: {
              '@type': 'Organization',
              name: 'Talewire',
              logo: { '@type': 'ImageObject', url: '/path/to/logo.png', width: 300, height: 100 },
            },
            mainEntityOfPage: { '@type': 'WebPage', '@id': window.location.href },
          })}
        </script>
      </Helmet>

      <div
        className={`min-h-screen ${
          isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'
        } transition-colors duration-300 font-sans`}
        role="main"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1
            className="text-2xl sm:text-3xl font-extrabold mb-6"
            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
            id="search-results-heading"
          >
            Search Results for "{getQuery()}"
          </h1>

          {error && (
            <div
              className="w-full py-3 bg-yellow-500 text-white text-center text-sm rounded-lg mb-6"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          {isLoading && (
            <div
              className="w-full py-3 bg-blue-600 text-white text-center text-sm rounded-lg mb-6"
              role="status"
              aria-live="polite"
            >
              Loading news articles...
            </div>
          )}

          {!isLoading && !error && filteredArticles.length === 0 && (
            <div
              className="text-center text-gray-600 dark:text-gray-400 py-8"
              role="alert"
              aria-live="polite"
            >
              No news articles found for "{getQuery()}".
            </div>
          )}

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            role="list"
            aria-labelledby="search-results-heading"
          >
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchResults;