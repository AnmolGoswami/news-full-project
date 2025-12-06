import React, { useEffect, useState, useCallback } from 'react';
import { Newspaper, CloudRain, Truck, School, Megaphone, Cpu, ImageOff } from 'lucide-react';
import axios from 'axios';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';

const LatestNews = () => {
  const [latestNews, setLatestNews] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [failedImages, setFailedImages] = useState(new Set());

  const sanitizeAndParseHtml = (html) => {
    if (!html) return 'No content available';
    // Sanitize HTML and prevent nested <p> or block elements inside <p>
    const sanitizedHtml = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'b', 'i', 'strong', 'em', 'ul', 'li'],
      ALLOWED_ATTR: {},
      FORBID_TAGS: ['p'], // Temporarily forbid nested <p> to debug
      FORBID_CONTENTS: ['p'], // Prevent <p> from containing block elements
    });
    // Wrap in a div to allow block-level elements like <ul>
    return <div>{parse(sanitizedHtml)}</div>;
  };

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://api.anmol-goswami-resume.store/api/latest5');
      console.log('API Response:', JSON.stringify(response.data, null, 2)); // Detailed log
      setLatestNews(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch news: ' + (err.response?.data?.message || err.message));
      setLatestNews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleImageError = useCallback((url) => {
    setFailedImages((prev) => new Set(prev).add(url));
  }, []);

  const isValidUrl = (url) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const categoryStyles = {
    Weather: { icon: <CloudRain className="w-5 h-5 text-blue-500 dark:text-blue-400" />, color: 'text-blue-600 dark:text-blue-400' },
    Infrastructure: { icon: <Truck className="w-5 h-5 text-green-500 dark:text-green-400" />, color: 'text-green-600 dark:text-green-400' },
    Education: { icon: <School className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />, color: 'text-yellow-600 dark:text-yellow-400' },
    Politics: { icon: <Megaphone className="w-5 h-5 text-red-500 dark:text-red-400" />, color: 'text-red-600 dark:text-red-400' },
    Technology: { icon: <Cpu className="w-5 h-5 text-purple-500 dark:text-purple-400" />, color: 'text-purple-600 dark:text-purple-400' },
    Default: { icon: <Newspaper className="w-5 h-5 text-blue-500 dark:text-blue-400" />, color: 'text-blue-600 dark:text-blue-400' },
  };

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-900">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <Newspaper className="w-6 h-6 text-blue-500 dark:text-blue-400" />
        Latest News
      </h2>
      {error && <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-4">{error}</p>}
      {loading ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">Loading news...</p>
      ) : latestNews.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No latest news available.</p>
      ) : (
        <div className="space-y-4">
          {latestNews.map((news) => {
            const { icon, color } = categoryStyles[news.categoryName] || categoryStyles.Default;
            const imageUrl = isValidUrl(news.imageUrl) ? news.imageUrl : null;
            return (
              <div
                key={news.id}
                className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition flex flex-col sm:flex-row sm:items-center gap-4"
              >
                {imageUrl && !failedImages.has(imageUrl) ? (
                  <img
                    src={imageUrl}
                    alt={news.title || 'News image'}
                    className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                    onError={() => handleImageError(imageUrl)}
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center flex-shrink-0">
                    <ImageOff className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {icon}
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {news.title || 'Untitled'}
                    </h3>
                  </div>
                  <p className={`text-sm ${color} mt-1`}>
                    {news.categoryName || 'Unknown'} | {news.stateName || 'N/A'} - {news.districtName || 'N/A'}
                  </p>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2 news-content">
                    {sanitizeAndParseHtml(news.content)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LatestNews;