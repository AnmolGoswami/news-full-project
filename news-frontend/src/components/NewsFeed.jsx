import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useNews } from '../context/NewsContex';

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

const NewsFeed = () => {
  const { allNews } = useNews();
  const [newsData, setNewsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const itemsPerPage = 8;
  const location = useLocation();

  useEffect(() => {
    const mappedNews = allNews.map((news) => {
      const slug = slugify(news.title, news.id);
      console.log('News ID:', news.id, 'Title:', news.title, 'Slug:', slug, 'Raw Content:', news.content); // Debug content
      return {
        id: news.id,
        title: news.title || 'हिन्दी समाचार',
        slug,
        summary: stripHtml(news.content),
        imageUrl: news.imageUrl || 'https://via.placeholder.com/1200x600?text=No+Image',
        date: news.publishedDate,
        category: news.categoryName || 'General',
      };
    });

    const sorted = [...mappedNews].sort((a, b) => new Date(b.date) - new Date(a.date));
    setNewsData(sorted);
    console.log('Processed News Data:', sorted); // Debug processed news
  }, [allNews]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % Math.min(3, newsData.length));
    }, 5000);
    return () => clearInterval(interval);
  }, [newsData]);

  const totalPages = Math.ceil(newsData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentNews = newsData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
    }),
    exit: { opacity: 0, x: 50, transition: { duration: 0.3 } },
  };

  const carouselVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeInOut' } },
    exit: { opacity: 0, x: -100, transition: { duration: 0.8 } },
  };

  // Dynamic metadata for the current page
  const baseUrl = 'https://www.talewire.com/news-feed';
  const canonicalUrl = currentPage === 1 ? baseUrl : `${baseUrl}?page=${currentPage}`;
  const ogNews = newsData[carouselIndex] || {
    title: 'News Feed',
    slug: 'news-feed',
    summary: 'Discover the latest news updates from Talewire.',
    imageUrl: '/path/to/default-image.jpg',
    date: new Date().toISOString(),
    category: 'General',
  };
  const keywords = [
    'news feed',
    'Talewire',
    'latest news',
    'breaking news',
    'India news',
    ...new Set(newsData.slice(0, 3).map((news) => news.category).filter(Boolean)),
  ].join(', ');

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>News Feed {currentPage > 1 ? `Page ${currentPage} |` : '|'} Talewire</title>
        <meta
          name="description"
          content={`Browse the latest news on Talewire's News Feed${currentPage > 1 ? `, page ${currentPage}` : ''}. Stay updated with breaking stories and top headlines.`}
        />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href={canonicalUrl} />
        {currentPage > 1 && <meta name="robots" content="noindex" />}
        <link rel="prev" href={currentPage > 1 ? `${baseUrl}?page=${currentPage - 1}` : null} />
        <link rel="next" href={currentPage < totalPages ? `${baseUrl}?page=${currentPage + 1}` : null} />

        <meta property="og:title" content={ogNews.title || `News Feed${currentPage > 1 ? ` Page ${currentPage}` : ''} | Talewire`} />
        <meta property="og:description" content={ogNews.summary} />
        <meta property="og:image" content={ogNews.imageUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Talewire" />
        <meta property="og:locale" content="en_IN" />
        <meta property="article:published_time" content={ogNews.date} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogNews.title || `News Feed${currentPage > 1 ? ` Page ${currentPage}` : ''} | Talewire`} />
        <meta name="twitter:description" content={ogNews.summary} />
        <meta name="twitter:image" content={ogNews.imageUrl} />
        <meta name="twitter:site" content="@SamaySiwan" />

        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `News Feed${currentPage > 1 ? ` Page ${currentPage}` : ''}`,
            url: canonicalUrl,
            description: `Talewire's News Feed${currentPage > 1 ? `, page ${currentPage}` : ''} showcases the latest news articles, including breaking stories and top headlines.`,
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
              itemListElement: currentNews.map((news, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                  '@type': 'NewsArticle',
                  headline: news.title,
                  url: `https://www.talewire.com/news/${news.id}/${news.slug}`,
                  image: news.imageUrl,
                  datePublished: news.date || new Date().toISOString(),
                  description: news.summary,
                  articleSection: news.category,
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

      <section
        className="bg-gray-50 dark:bg-gray-900 min-h-screen px-4 sm:px-8 lg:px-16 py-12 transition-colors duration-500"
        aria-label="News Feed"
        role="main"
      >
        <div className="max-w-7xl mx-auto">
          <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 px-4 sm:px-0 pt-4 pb-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white" id="news-feed-heading" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
              News Feed
            </h2>
            <div className="h-0.5 w-full bg-gradient-to-r from-pink-500 to-transparent rounded-full mt-1.5" aria-hidden="true" />
          </div>

          {newsData.length > 0 && (
            <motion.article
              className="relative mb-12 h-[50vh] rounded-2xl overflow-hidden shadow-xl"
              itemScope
              itemType="https://schema.org/NewsArticle"
            >
              <AnimatePresence initial={false}>
                <motion.div
                  key={carouselIndex}
                  variants={carouselVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute inset-0"
                >
                  <Link
                    to={`/news/${newsData[carouselIndex].id}/${newsData[carouselIndex].slug}`}
                    itemProp="url"
                    aria-label={`Read more about ${newsData[carouselIndex].title}`}
                  >
                    <img
                      src={newsData[carouselIndex].imageUrl}
                      alt={newsData[carouselIndex].title ? `${newsData[carouselIndex].title} - Featured News` : 'Featured News Image'}
                      className="w-full h-full object-cover brightness-75"
                      loading="eager"
                      itemProp="image"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" aria-hidden="true" />
                    <div className="absolute bottom-0 p-8 text-white w-full sm:w-2/3">
                      <motion.span
                        className="inline-block bg-pink-600 text-sm font-semibold px-3 py-1 rounded-full mb-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        itemProp="articleSection"
                        style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                      >
                        {newsData[carouselIndex].category}
                      </motion.span>
                      <h2
                        className="text-2xl sm:text-3xl font-bold mb-4 line-clamp-2"
                        itemProp="headline"
                        style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                      >
                        {newsData[carouselIndex].title}
                      </h2>
                      <p
                        className="text-sm mb-4 line-clamp-2"
                        itemProp="description"
                        style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                      >
                        {newsData[carouselIndex].summary}
                      </p>
                      <time
                        className="text-xs opacity-75"
                        itemProp="datePublished"
                        dateTime={newsData[carouselIndex].date}
                        style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                      >
                        {newsData[carouselIndex].date
                          ? new Date(newsData[carouselIndex].date).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'Unknown Date'}
                      </time>
                    </div>
                  </Link>
                </motion.div>
              </AnimatePresence>
              <div className="absolute bottom-4 right-4 flex space-x-2" role="tablist" aria-label="Carousel navigation">
                {newsData.slice(0, 3).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCarouselIndex(i)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      carouselIndex === i ? 'bg-white scale-125' : 'bg-white/50'
                    }`}
                    aria-selected={carouselIndex === i}
                    role="tab"
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </motion.article>
          )}

          <div
            className="min-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-pink-500 scrollbar-track-gray-100 dark:scrollbar-track-gray-900"
            role="region"
            aria-labelledby="news-feed-heading"
          >
            <motion.ul
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              layout
              role="list"
              aria-label="News articles"
            >
              <AnimatePresence>
                {currentNews.length === 0 ? (
                  <li className="col-span-full text-center text-gray-600 dark:text-gray-300 text-sm sm:text-base py-6" role="alert">
                    No news available
                  </li>
                ) : (
                  currentNews.map((news, index) => (
                    <motion.li
                      key={news.id}
                      custom={index}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      whileHover={{ y: -5, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
                      whileFocus={{ y: -5, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
                      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md group"
                      itemScope
                      itemType="https://schema.org/NewsArticle"
                    >
                      <Link
                        to={`/news/${news.id}/${news.slug}`}
                        itemProp="url"
                        aria-label={`Read more about ${news.title}`}
                      >
                        <div className="relative h-44 overflow-hidden">
                          <img
                            src={news.imageUrl}
                            alt={news.title ? `${news.title} - News Image` : 'News Image'}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-focus:scale-110"
                            loading="lazy"
                            itemProp="image"
                          />
                          <motion.div
                            className="absolute top-2 right-2 bg-pink-600 text-white text-xs font-semibold px-2 py-1 rounded-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            itemProp="articleSection"
                            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                          >
                            {news.category}
                          </motion.div>
                        </div>
                        <div className="p-4">
                          <h3
                            className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2"
                            itemProp="headline"
                            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                          >
                            {news.title}
                          </h3>
                          <p
                            className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2"
                            itemProp="description"
                            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                          >
                            {news.summary}
                          </p>
                          <div className="flex justify-between items-center">
                            <time
                              className="text-xs text-gray-500 dark:text-gray-400"
                              itemProp="datePublished"
                              dateTime={news.date}
                              style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                            >
                              {news.date
                                ? new Date(news.date).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })
                                : 'Unknown Date'}
                            </time>
                            <motion.span
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-pink-600 dark:text-pink-400 text-sm font-medium"
                              style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                            >
                              Read Now
                            </motion.span>
                          </div>
                        </div>
                      </Link>
                    </motion.li>
                  ))
                )}
              </AnimatePresence>
            </motion.ul>
          </div>

          {totalPages > 1 && (
            <nav
              className="mt-12 flex flex-col items-center"
              aria-label="Pagination"
              role="navigation"
            >
              <div className="w-full max-w-xs h-1 bg-gray-200 dark:bg-gray-700 rounded-full mb-4">
                <motion.div
                  className="h-full bg-pink-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentPage / totalPages) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  aria-hidden="true"
                />
              </div>
              <div className="flex justify-center items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-600 hover:text-white transition-all duration-300"
                  aria-label="Previous page"
                >
                  ←
                </motion.button>

                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <motion.button
                        key={page}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${
                          currentPage === page
                            ? 'bg-pink-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-pink-600 hover:text-white'
                        }`}
                        aria-current={currentPage === page ? 'page' : null}
                        aria-label={`Page ${page}`}
                      >
                        {page}
                      </motion.button>
                    );
                  }
                  if (
                    (page === currentPage - 2 || page === currentPage + 2) &&
                    page > 1 &&
                    page < totalPages
                  ) {
                    return (
                      <span
                        key={page}
                        className="w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-600 hover:text-white transition-all duration-300"
                  aria-label="Next page"
                >
                  →
                </motion.button>
              </div>
            </nav>
          )}

          <style>{`
            /* Custom scrollbar for better cross-browser support */
            .scrollbar-thin::-webkit-scrollbar {
              width: 8px;
            }
            .scrollbar-thin::-webkit-scrollbar-thumb {
              background-color: #db2777; /* pink-600 */
              border-radius: 4px;
            }
            .scrollbar-thin::-webkit-scrollbar-track {
              background-color: #f3f4f6; /* gray-100 */
            }
            .dark .scrollbar-thin::-webkit-scrollbar-track {
              background-color: #1f2937; /* gray-900 */
            }
            /* Optimize animations for performance */
            .motion-optimize {
              will-change: transform, opacity;
            }
          `}</style>
        </div>
      </section>
    </>
  );
};

export default NewsFeed;