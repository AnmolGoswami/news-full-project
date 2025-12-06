
import React, { useState, useEffect, useContext } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ThemeContext } from '../context/ThemeProvider';
import { toast } from 'react-toastify';
import axios from 'axios';

const slugify = (text, id) => {
  if (!text || typeof text !== 'string' || text.trim() === '' || text === 'Untitled Article') {
    return `news-story-${id}`;
  }
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100) + `-${id}`;
};

const LanguageNews = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const location = useLocation();
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [newsArticles, setNewsArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const language = params.get('language') || '';

    if (!language) {
      setError('Please select a language to view news stories.');
      toast.error('Please select a language');
      setIsLoading(false);
      return;
    }

    setSelectedLanguage(language);
    setIsLoading(true);

    axios
      .get(`https://api.anmol-goswami-resume.store/api/newsByLanguage?language=${encodeURIComponent(language)}`)
      .then((response) => {
        const articles = response.data.map((article) => ({
          id: article.id || Date.now() + Math.random(),
          title: article.title && article.title !== 'Untitled Article' ? article.title : `News Story #${article.id}`,
          slug: article.slug || slugify(article.title || 'news-story', article.id || Date.now()),
          summary: article.summary && article.summary !== 'No summary available' 
            ? article.summary 
            : 'Explore this breaking news story for the latest updates and insights.',
          content: article.content || 'The full story is coming soon. Check back for more details!',
          imageUrl: article.imageUrl || 'https://via.placeholder.com/600x400?text=News+Story',
          category: article.category || 'General News',
          date: article.date || new Date().toISOString(),
        }));

        if (articles.length === 0) {
          setError(`No news stories found for ${language}.`);
          toast.error(`No news stories found for ${language}`);
        } else {
          setNewsArticles(articles);
        }
      })
      .catch((err) => {
        setError('Unable to load news stories. Please try again later.');
        toast.error('Failed to load news stories');
        console.error('Error fetching news:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [location.search]);

  // Skeleton Loader Component
  const SkeletonCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-t-2xl" />
      <div className="p-6 space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        </div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-1/3 mx-auto" />
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <meta charset="utf-8" />
        <title>Talewire | {selectedLanguage || 'Language'} News</title>
        <meta
          name="description"
          content={`Explore the latest news in ${selectedLanguage || 'your selected language'} from Talewire. Stay updated with local and regional stories.`}
        />
        <meta name="keywords" content={`Talewire, ${selectedLanguage || 'language'} news, India news, local news, regional updates`} />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content="Talewire Team" />
        <link rel="canonical" href={`https://www.talewire.com/language-news?language=${encodeURIComponent(selectedLanguage)}`} />
        <meta property="og:title" content={`Talewire | ${selectedLanguage || 'Language'} News`} />
        <meta property="og:description" content={`Explore the latest news in ${selectedLanguage || 'your selected language'} from Talewire.`} />
        <meta property="og:image" content="/images/default-news.jpg" />
        <meta property="og:url" content={`https://www.talewire.com/language-news?language=${encodeURIComponent(selectedLanguage)}`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Talewire" />
        <meta property="og:locale" content={selectedLanguage === 'Hindi' ? 'hi_IN' : 'en_IN'} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Talewire | ${selectedLanguage || 'Language'} News`} />
        <meta name="twitter:description" content={`Explore the latest news in ${selectedLanguage || 'your selected language'} from Talewire.`} />
        <meta name="twitter:image" content="/images/default-news.jpg" />
      </Helmet>

      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} font-sans transition-colors duration-300`}>
        {/* Header Section */}
        <div className="py-12 text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {selectedLanguage ? `${selectedLanguage} News` : 'Latest News'}
            </h1>
            <p className="mt-3 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Discover trending stories and updates in {selectedLanguage || 'your language'}.
            </p>
          </div>
        </div>

        {/* Error and Loading States */}
        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-red-50/80 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-xl p-5 text-center text-base shadow-sm" role="alert">
              {error}
            </div>
          </div>
        )}
        {isLoading && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          </div>
        )}

        {/* News Articles Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {newsArticles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsArticles.map((article, index) => (
                <div
                  key={article.id}
                  className={`group bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative">
                    <img
                      src={article.imageUrl}
                      alt={`News story ${article.id}`}
                      className="w-full h-64 object-cover rounded-t-2xl transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => (e.target.src = 'https://via.placeholder.com/600x400?text=News+Story')}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="absolute top-3 left-3 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                      {article.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 leading-tight">
                      {article.title}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed">
                      {article.summary}
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <span>{article.category}</span>
                      <span>{new Date(article.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <Link
                      to={`/news/${article.id}/${article.slug}`}
                      className="inline-block px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 font-medium text-sm shadow-sm"
                      aria-label={`Read more about news story ${article.id}`}
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !isLoading && (
              <div className="text-center py-16">
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">No stories available for this language.</p>
                <Link
                  to="/"
                  className="inline-block px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 font-medium text-sm shadow-sm"
                  aria-label="Return to homepage"
                >
                  Back to Home
                </Link>
              </div>
            )
          )}
        </div>

        <style>
          {`
            @keyframes fade-in {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
              animation: fade-in 0.6s ease-out forwards;
            }
            .line-clamp-2 {
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
            .line-clamp-3 {
              display: -webkit-box;
              -webkit-line-clamp: 3;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
          `}
        </style>
      </div>
    </>
  );
};

export default LanguageNews;
