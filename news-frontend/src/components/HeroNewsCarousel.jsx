
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
import { useNews } from '../context/NewsContex';

// Utility function to generate slug from title
const slugify = (text, id, timestamp) => {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return `news-article-${id}-${timestamp || Date.now()}`;
  }
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .substring(0, 100) + `-${id}`;
};

// Utility function to extract plain text from HTML for descriptions
const getPlainText = (html) => {
  if (!html) return 'No description available.';
  const div = document.createElement('div');
  div.innerHTML = DOMPurify.sanitize(html);
  return div.textContent.trim().substring(0, 160) + '...';
};

const HeroNews = () => {
  const { allNews, error: newsError } = useNews();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const selectedState = searchParams.get('state') || '';
  const selectedDistrict = searchParams.get('district') || '';

  useEffect(() => {
    console.log('All News:', allNews);
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [allNews]);

  const getEmbeddedYouTube = (url) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleVideoClick = (videoId, event) => {
    event.preventDefault();
    event.stopPropagation();
    if (videoId) setSelectedVideo(videoId);
  };

  const closeModal = () => {
    setSelectedVideo(null);
  };

  const filteredNews = allNews
    .filter((news) => {
      if (!selectedState || !selectedDistrict) return true;
      return news.stateName === selectedState && news.districtName === selectedDistrict;
    })
    .slice(0, 8);

  console.log('Filtered News:', filteredNews);

  const handleShare = async (title, id, slug) => {
    const shareData = {
      title: title || 'News Article',
      url: `https://www.talewire.com/news/${id}/${slug}`,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard!');
      } catch (error) {
        console.error('Error copying link:', error);
        toast.error('Failed to copy link.');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const categoryColors = {
    Cricket: 'bg-pink-600',
    Technology: 'bg-cyan-600',
    Environment: 'bg-emerald-600',
    Space: 'bg-indigo-600',
    Economy: 'bg-amber-600',
    Health: 'bg-red-600',
    Business: 'bg-blue-600',
    Energy: 'bg-teal-600',
    Education: 'bg-orange-600',
    Default: 'bg-gray-600',
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
    hover: { scale: 1.03, boxShadow: '0 10px 30px rgba(0,0,0,0.2)', transition: { duration: 0.3 } },
  };

  const particleVariants = {
    animate: {
      y: [0, -15, 0],
      opacity: [0, 0.5, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const baseUrl = 'https://www.talewire.com';
  const canonicalUrl = `${baseUrl}${location.pathname}${location.search}`;
  const ogNews = filteredNews[0] || {
    title: 'Latest News',
    content: 'Discover the latest news updates from Talewire.',
    imageUrl: '/images/default-news.jpg',
    publishedDate: new Date().toISOString(),
    categoryName: 'General',
  };
  const keywords = [
    'news',
    'Talewire',
    selectedState || 'India',
    selectedDistrict || 'local news',
    'breaking news',
    ogNews.categoryName || 'general news',
    ...new Set(filteredNews.slice(0, 3).map((news) => news.categoryName).filter(Boolean)),
    ...(ogNews.title ? ogNews.title.split(' ').slice(0, 3) : []),
  ].join(', ');

  return (
    <>
      <Helmet>
        <meta charset="utf-8" />
        <title>
          {selectedState && selectedDistrict
            ? `Latest ${ogNews.categoryName || 'News'} in ${selectedDistrict}, ${selectedState} | Talewire`
            : `Latest ${ogNews.categoryName || 'News'} Updates | Talewire`}
        </title>
        <meta
          name="description"
          content={
            selectedState && selectedDistrict
              ? `Read the latest ${ogNews.categoryName || 'news'} from ${selectedDistrict}, ${selectedState}. Stay updated with Talewire's breaking stories!`
              : `Discover breaking ${ogNews.categoryName || 'news'} and updates across India. Stay informed with Talewire!`
          }
        />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" href={canonicalUrl} hrefLang="en-IN" />
        <link
          rel="alternate"
          href={`${baseUrl}/hi${location.pathname}${location.search}`}
          hrefLang="hi-IN"
        />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={ogNews.title || 'Latest News | Talewire'} />
        <meta property="og:description" content={getPlainText(ogNews.content)} />
        <meta property="og:image" content={ogNews.imageUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Talewire" />
        <meta property="og:locale" content="en_IN" />
        {ogNews.publishedDate && (
          <meta property="article:published_time" content={ogNews.publishedDate} />
        )}

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogNews.title || 'Latest News | Talewire'} />
        <meta name="twitter:description" content={getPlainText(ogNews.content)} />
        <meta name="twitter:image" content={ogNews.imageUrl} />
        <meta name="twitter:site" content="@Talewire" />

        <script type="application/ld+json">
          {JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: selectedState && selectedDistrict
                ? `News from ${selectedDistrict}, ${selectedState}`
                : 'Latest News',
              url: canonicalUrl,
              description: selectedState && selectedDistrict
                ? `Latest news articles from ${selectedDistrict}, ${selectedState} on Talewire.`
                : 'Breaking news and updates from Talewire.',
              publisher: {
                '@type': 'Organization',
                name: 'Talewire',
                logo: {
                  '@type': 'ImageObject',
                  url: `${baseUrl}/images/logo.png`,
                  width: 300,
                  height: 100,
                },
                sameAs: [
                  'https://twitter.com/Talewire',
                  'https://facebook.com/Talewire',
                  'https://instagram.com/Talewire',
                ],
              },
              mainEntity: {
                '@type': 'ItemList',
                itemListElement: filteredNews.map((news, index) => ({
                  '@type': 'ListItem',
                  position: index + 1,
                  item: {
                    '@type': 'NewsArticle',
                    headline: news.title || 'Untitled',
                    url: `${baseUrl}/news/${news.id}/${slugify(news.title || 'news-article', news.id, news.publishedDate)}`,
                    image: news.imageUrl || `${baseUrl}/images/default-news.jpg`,
                    datePublished: news.publishedDate || new Date().toISOString(),
                    description: getPlainText(news.content),
                    articleSection: news.categoryName || 'General',
                    author: {
                      '@type': 'Organization',
                      name: 'Talewire',
                    },
                    publisher: {
                      '@type': 'Organization',
                      name: 'Talewire',
                      logo: {
                        '@type': 'ImageObject',
                        url: `${baseUrl}/images/logo.png`,
                        width: 300,
                        height: 100,
                      },
                    },
                    ...(getEmbeddedYouTube(news.videoLink) && {
                      associatedMedia: {
                        '@type': 'VideoObject',
                        embedUrl: `https://www.youtube.com/embed/${getEmbeddedYouTube(news.videoLink)}`,
                        name: news.title || 'News Video',
                        thumbnailUrl: news.imageUrl || `${baseUrl}/images/default-news.jpg`,
                      },
                    }),
                  },
                })),
              },
            },
            {
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: baseUrl,
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: selectedState || 'News',
                  item: selectedState ? `${baseUrl}/news?state=${selectedState}` : `${baseUrl}/news`,
                },
                ...(selectedDistrict
                  ? [
                      {
                        '@type': 'ListItem',
                        position: 3,
                        name: selectedDistrict,
                        item: `${baseUrl}/news?state=${selectedState}&district=${selectedDistrict}`,
                      },
                    ]
                  : []),
              ],
            },
          ])}
        </script>
      </Helmet>

      <section
        className="relative w-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500 py-6 overflow-hidden"
        aria-label="Latest News Section"
        role="region"
      >
        <h1 className="sr-only">
          {selectedState && selectedDistrict
            ? `Latest News from ${selectedDistrict}, ${selectedState}`
            : 'Latest News Updates'}
        </h1>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {newsError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-red-600 dark:text-red-400 py-20"
              role="alert"
            >
              <p className="text-lg font-medium">Error loading news: {newsError}</p>
            </motion.div>
          )}

          {filteredNews.length > 0 && (
            <>
              <motion.div
                className="absolute w-2 h-2 bg-red-500 rounded-full top-10 left-10 opacity-30"
                variants={particleVariants}
                animate="animate"
                style={{ transform: 'translateZ(0)' }}
                aria-hidden="true"
                alt=""
              />
              <motion.div
                className="absolute w-3 h-3 bg-pink-600 rounded-full bottom-20 right-10 opacity-40"
                variants={particleVariants}
                animate="animate"
                transition={{ delay: 0.6 }}
                style={{ transform: 'translateZ(0)' }}
                aria-hidden="true"
                alt=""
              />
              <motion.div
                className="absolute w-2 h-2 bg-red-400 rounded-full top-24 right-16 opacity-20"
                variants={particleVariants}
                animate="animate"
                transition={{ delay: 1 }}
                style={{ transform: 'translateZ(0)' }}
                aria-hidden="true"
                alt=""
              />
            </>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-[70vh]" role="status" aria-label="Loading news">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-12 h-12 bg-pink-600 rounded-full animate-pulse"
                aria-hidden="true"
              />
            </div>
          ) : allNews.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-600 dark:text-gray-300 py-20"
              role="alert"
            >
              <p className="text-lg font-medium">No news available at the moment.</p>
            </motion.div>
          ) : filteredNews.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-600 dark:text-gray-300 py-20"
              role="alert"
            >
              <p className="text-lg font-medium">
                {selectedState && selectedDistrict
                  ? `No news for ${selectedDistrict}, ${selectedState}.`
                  : 'Please select a state and district.'}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6" role="list">
              <motion.article
                className="lg:col-span-3 relative h-[450px] sm:h-[500px] rounded-xl overflow-hidden shadow-xl"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileFocus="hover"
                itemScope
                itemType="https://schema.org/NewsArticle"
              >
                <Link
                  to={`/news/${filteredNews[0].id}/${slugify(filteredNews[0].title || 'news-article', filteredNews[0].id, filteredNews[0].publishedDate)}`}
                  itemProp="url"
                  className="block w-full h-full"
                >
                  <motion.img
                    src={filteredNews[0].imageUrl || '/images/default-news.jpg'}
                    alt={`${filteredNews[0].title || 'News'} - ${filteredNews[0].categoryName || 'General'} News Image from ${filteredNews[0].districtName || 'India'}`}
                    className="w-full h-full object-cover"
                    loading="eager"
                    itemProp="image"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-red-900/70 via-transparent to-transparent"
                    aria-hidden="true"
                  />
                  <div className="absolute bottom-0 p-4 sm:p-6 text-white w-full flex flex-col justify-end h-full">
                    <motion.span
                      className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
                        categoryColors[filteredNews[0].categoryName] || categoryColors.Default
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      itemProp="articleSection"
                    >
                      {filteredNews[0].categoryName || 'General'}
                    </motion.span>
                    <h2
                      className="text-xl sm:text-2xl font-bold mt-2 mb-2 line-clamp-2 leading-tight"
                      itemProp="headline"
                      style={{ fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif" }}
                    >
                      {filteredNews[0].title || 'हिन्दी समाचार'}
                    </h2>
                    <div
                      className="text-sm sm:text-base line-clamp-2 mb-3 prose prose-sm dark:prose-invert"
                      itemProp="description"
                      style={{ fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif" }}
                    >
                      {parse(DOMPurify.sanitize(filteredNews[0].content || 'No description available.'))}
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span
                        itemProp="datePublished"
                        content={filteredNews[0].publishedDate}
                      >
                        {formatDate(filteredNews[0].publishedDate)} •{' '}
                        {filteredNews[0].districtName || 'Unknown'}, {filteredNews[0].stateName || 'Unknown'}
                      </span>
                      <div className="flex gap-3">
                        {getEmbeddedYouTube(filteredNews[0].videoLink) && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => handleVideoClick(getEmbeddedYouTube(filteredNews[0].videoLink), e)}
                            className="text-red-500 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full p-1"
                            aria-label={`Watch video for ${filteredNews[0].title || 'this news'}`}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M14.752 11.168l-6.336-3.664A1 1 0 007 8.464v7.072a1 1 0 001.416.896l6.336-3.664a1 1 0 000-1.792z"
                              />
                            </svg>
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleShare(
                              filteredNews[0].title,
                              filteredNews[0].id,
                              slugify(filteredNews[0].title || 'news-article', filteredNews[0].id, filteredNews[0].publishedDate)
                            );
                          }}
                          className="text-gray-200 hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-full p-1"
                          aria-label={`Share ${filteredNews[0].title || 'this news'}`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                            />
                          </svg>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>

              <div className="lg:col-span-2 h-[500px]">
                <ul
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 overflow-y-auto h-full pb-4 scrollbar-thin scrollbar-thumb-pink-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-700"
                  role="list"
                  aria-label="Additional News Articles"
                >
                  {filteredNews.slice(1).map((news) => (
                    <motion.li
                      key={news.id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      whileFocus="hover"
                      className="relative h-[180px] bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md flex flex-row min-w-[300px]"
                      itemScope
                      itemType="https://schema.org/NewsArticle"
                    >
                      <Link
                        to={`/news/${news.id}/${slugify(news.title || 'news-article', news.id, news.publishedDate)}`}
                        className="flex w-full"
                        itemProp="url"
                      >
                        <div className="w-1/3 relative overflow-hidden">
                          <motion.img
                            src={news.imageUrl || '/images/default-news.jpg'}
                            alt={`${news.title || 'News'} - ${news.categoryName || 'General'} News Image from ${news.districtName || 'India'}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            itemProp="image"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.4 }}
                          />
                          <span
                            className={`absolute top-2 left-2 px-2 py-0.5 text-xs font-semibold text-white rounded-full ${
                              categoryColors[news.categoryName] || categoryColors.Default
                            }`}
                            itemProp="articleSection"
                          >
                            {news.categoryName || 'General'}
                          </span>
                        </div>
                        <div className="w-2/3 p-3 flex flex-col justify-between">
                          <div>
                            <h3
                              className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1"
                              itemProp="headline"
                              style={{ fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif" }}
                            >
                              {news.title || 'हिन्दी समाचार'}
                            </h3>
                            <div
                              className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 prose prose-xs dark:prose-invert"
                              itemProp="description"
                              style={{ fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif" }}
                            >
                              {parse(DOMPurify.sanitize(news.content || 'No description available.'))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                            <time
                              itemProp="datePublished"
                              content={news.publishedDate}
                            >
                              {formatDate(news.publishedDate)}
                            </time>
                            <div className="flex gap-2">
                              {getEmbeddedYouTube(news.videoLink) && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={(e) => handleVideoClick(getEmbeddedYouTube(news.videoLink), e)}
                                  className="text-red-500 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full p-1"
                                  aria-label={`Watch video for ${news.title || 'this news'}`}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M14.752 11.168l-6.336-3.664A1 1 0 007 8.464v7.072a1 1 0 001.416.896l6.336-3.664a1 1 0 000-1.792z"
                                    />
                                  </svg>
                                </motion.button>
                              )}
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleShare(news.title, news.id, slugify(news.title || 'news-article', news.id, news.publishedDate));
                                }}
                                className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-full p-1"
                                aria-label={`Share ${news.title || 'this news'}`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                  />
                                </svg>
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <AnimatePresence>
            {selectedVideo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                onClick={closeModal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="video-modal-title"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-2xl w-full mx-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h4 id="video-modal-title" className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    News Video
                  </h4>
                  <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                    <iframe
                      className="absolute inset-0 w-full h-full rounded"
                      src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                      title="News Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                  <button
                    onClick={closeModal}
                    className="mt-4 w-full px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-full hover:bg-pink-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    aria-label="Close video modal"
                  >
                    Close
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
};

export default HeroNews;
