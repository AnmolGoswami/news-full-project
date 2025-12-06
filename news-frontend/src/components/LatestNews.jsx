import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .substring(0, 100);
};

// Utility function to strip HTML tags for summary
const stripHtml = (html) => {
  if (!html || typeof html !== 'string') {
    console.log('stripHtml: Invalid or empty content:', html);
    return 'Read the latest news updates on TALEWIRE.';
  }
  try {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    return text
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 160) + (text.length > 160 ? '...' : '');
  } catch (error) {
    console.error('stripHtml error:', error, 'Input:', html);
    return html
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 160) + (html.length > 160 ? '...' : '');
  }
};

// Utility function to truncate title
const truncateTitle = (title) => {
  if (!title || typeof title !== 'string') {
    return 'Latest News on TALEWIRE';
  }
  return title.length > 60 ? title.substring(0, 60) + '...' : title;
};

const LatestNews = () => {
  const { newsList } = useNews();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('News List:', newsList);
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [newsList]);

  const latestNews = newsList
    .sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate))
    .slice(0, 4)
    .map((news) => {
      const slug = slugify(news.title, news.id);
      console.log('News ID:', news.id, 'Title:', news.title, 'Slug:', slug, 'Raw Content:', news.content);
      return {
        id: news.id,
        title: news.title || 'Latest News on TALEWIRE',
        displayTitle: truncateTitle(news.title),
        slug,
        summary: stripHtml(news.content),
        image: news.imageUrl || 'https://via.placeholder.com/300x200?text=TALEWIRE+News',
        date: news.publishedDate,
        category: news.categoryName || 'General',
      };
    });

  console.log('Latest News:', latestNews);

  const keywords = [
    'latest news',
    'TALEWIRE',
    'breaking news',
    'India news',
    'current events',
    'news updates',
    ...new Set(latestNews.map((news) => news.category).filter(Boolean)),
  ].join(', ');

  const ogNews = latestNews[0] || {
    title: 'Latest News on TALEWIRE',
    displayTitle: 'Latest News on TALEWIRE',
    slug: 'latest-news',
    summary: 'Stay updated with the latest news, breaking stories, and in-depth coverage from TALEWIRE.',
    image: '/assets/talewire-default.jpg',
    date: new Date().toISOString(),
    category: 'General',
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

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{ogNews.title ? `${ogNews.title} | TALEWIRE` : 'Latest News | TALEWIRE'}</title>
        <meta name="description" content={ogNews.summary} />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://www.talewire.com/latest" />
        <meta property="og:title" content={ogNews.title || 'Latest News | TALEWIRE'} />
        <meta property="og:description" content={ogNews.summary} />
        <meta property="og:image" content={ogNews.image} />
        <meta property="og:image:alt" content="TALEWIRE News Image" />
        <meta property="og:url" content="https://www.talewire.com/latest" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="TALEWIRE" />
        <meta property="og:locale" content="en_IN" />
        <meta property="article:published_time" content={ogNews.date || new Date().toISOString()} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogNews.title || 'Latest News | TALEWIRE'} />
        <meta name="twitter:description" content={ogNews.summary} />
        <meta name="twitter:image" content={ogNews.image} />
        <meta name="twitter:image:alt" content="TALEWIRE News Image" />
        <meta name="twitter:site" content="@TALEWIRE" />
        <meta name="twitter:creator" content="@TALEWIRE" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Latest News | TALEWIRE',
            description: 'Stay updated with the latest news, breaking stories, and in-depth coverage from TALEWIRE.',
            url: 'https://www.talewire.com/latest',
            publisher: {
              '@type': 'Organization',
              name: 'TALEWIRE',
              logo: {
                '@type': 'ImageObject',
                url: '/assets/talewire-logo.png',
                width: 300,
                height: 100,
              },
            },
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: latestNews.map((news, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                  '@type': 'NewsArticle',
                  headline: news.title,
                  url: `https://www.talewire.com/news/${news.id}/${news.slug}`,
                  image: news.image,
                  datePublished: news.date || new Date().toISOString(),
                  description: news.summary,
                  articleSection: news.category,
                  publisher: {
                    '@type': 'Organization',
                    name: 'TALEWIRE',
                    logo: {
                      '@type': 'ImageObject',
                      url: '/assets/talewire-logo.png',
                      width: 300,
                      height: 100,
                    },
                  },
                  author: {
                    '@type': 'Organization',
                    name: 'TALEWIRE',
                  },
                },
              })),
            },
          })}
        </script>
      </Helmet>

      <section
        className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
        aria-label="Latest News Section"
        role="region"
      >
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 px-4 sm:px-5 pt-4 pb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white" id="latest-news-heading">
            Latest News
          </h2>
          <div className="h-0.5 w-full bg-gradient-to-r from-green-500 to-transparent rounded-full mt-1.5" aria-hidden="true" />
        </div>
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="px-4 sm:px-5 pb-4 sm:pb-5"
        >
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[350px] sm:min-h-[400px]" role="status" aria-label="Loading news">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-12 h-12 bg-green-600 rounded-full animate-pulse"
                aria-hidden="true"
              />
            </div>
          ) : (
            <ul
              className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-gray-100 dark:scrollbar-track-gray-900 snap-x snap-mandatory"
              role="list"
              aria-labelledby="latest-news-heading"
              style={{ scrollBehavior: 'smooth' }}
            >
              {latestNews.length === 0 ? (
                <li className="text-center text-gray-600 dark:text-gray-300 text-sm sm:text-base py-6 w-full" role="alert">
                  No news available at the moment. Check back later for updates from TALEWIRE.
                </li>
              ) : (
                latestNews.map((news, index) => (
                  <motion.li
                    key={news.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    whileFocus="hover"
                    transition={{ delay: index * 0.1 }}
                    className="flex-shrink-0 w-[90%] sm:w-[33.33%] snap-start mx-2 first:ml-0 last:mr-0 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 transition-all duration-300 hover:shadow-md hover:dark:shadow-green-500/10 focus:shadow-md focus:dark:shadow-green-500/10"
                    itemScope
                    itemType="https://schema.org/NewsArticle"
                  >
                    <img
                      src={news.image}
                      alt={news.title ? `${news.title} - TALEWIRE News Image` : 'TALEWIRE News Image'}
                      className="w-full h-24 sm:h-32 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105 group-focus:scale-105 border border-gray-200 dark:border-gray-600"
                      loading="lazy"
                      itemProp="image"
                    />
                    <div className="mt-2">
                      <motion.span
                        className={`inline-block px-2.5 py-1 text-xs font-semibold text-white ${categoryColors[news.category] || categoryColors.Default} rounded-full mb-1.5 hover:scale-105 transition-transform duration-200`}
                        whileHover={{ scale: 1.05 }}
                        itemProp="articleSection"
                        style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                      >
                        {news.category}
                      </motion.span>
                      <h3
                        className="text-base sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 group-focus:text-green-600 dark:group-focus:text-green-400 transition-colors duration-200 leading-tight"
                        itemProp="headline"
                        style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                      >
                        <Link
                          to={`/news/${news.id}/${news.slug}`}
                          className="focus:outline-none focus:underline"
                          itemProp="url"
                          aria-label={`Read more about ${news.title} on TALEWIRE`}
                        >
                          {news.displayTitle}
                        </Link>
                      </h3>
                      <p
                        className="text-sm sm:text-base text-gray-600 dark:text-gray-300 line-clamp-2 mt-1"
                        itemProp="description"
                        style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                      >
                        {news.summary}
                      </p>
                      <time
                        className="text-xs text-gray-500 dark:text-gray-400 mt-1"
                        itemProp="datePublished"
                        dateTime={news.date || new Date().toISOString()}
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
                    </div>
                  </motion.li>
                ))
              )}
            </ul>
          )}
        </motion.div>

        <style>{`
          .scrollbar-thin::-webkit-scrollbar {
            height: 8px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb {
            background-color: #10b981;
            border-radius: 4px;
          }
          .scrollbar-thin::-webkit-scrollbar-track {
            background-color: #f3f4f6;
          }
          .dark .scrollbar-thin::-webkit-scrollbar-track {
            background-color: #1f2937;
          }
          .snap-x {
            scroll-snap-type: x mandatory;
          }
          .snap-start {
            scroll-snap-align: start;
          }
          .motion-optimize {
            will-change: transform, opacity;
          }
          @media (min-width: 640px) {
            .w-[33.33%] {
              width: calc(33.33% - 1rem);
            }
          }
        `}</style>
      </section>
    </>
  );
};

export default LatestNews;