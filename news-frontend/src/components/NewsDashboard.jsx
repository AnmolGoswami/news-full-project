import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import TrendingNews from "./TrendingNews";
import LatestNews from "./LatestNews";

const NewsDashboard = () => {
  return (
    <>
      <Helmet>
        <title>News Dashboard | Talewire</title>
        <meta
          name="description"
          content="Explore the latest and trending news on Talewire's News Dashboard. Stay updated with breaking stories, local updates, and top headlines across India."
        />
        <meta
          name="keywords"
          content="news dashboard, Talewire, latest news, trending news, breaking news, local news, India news"
        />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://www.talewire.com/dashboard" />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="News Dashboard | Talewire" />
        <meta
          property="og:description"
          content="Discover the latest and trending news on Talewire's News Dashboard. Stay informed with breaking stories and top headlines."
        />
        <meta property="og:image" content="/path/to/default-dashboard-image.jpg" />
        <meta property="og:url" content="https://www.talewire.com/dashboard" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Talewire" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="News Dashboard | Talewire" />
        <meta
          name="twitter:description"
          content="Discover the latest and trending news on Talewire's News Dashboard. Stay informed with breaking stories and top headlines."
        />
        <meta name="twitter:image" content="/path/to/default-dashboard-image.jpg" />
        <meta name="twitter:site" content="@SamaySiwan" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "News Dashboard",
            url: "https://www.talewire.com/dashboard",
            description:
              "Talewire's News Dashboard provides the latest and trending news, including breaking stories, local updates, and top headlines across various categories.",
            publisher: {
              "@type": "Organization",
              name: "Talewire",
              logo: {
                "@type": "ImageObject",
                url: "/path/to/logo.png",
                width: 300,
                height: 100,
              },
            },
            mainEntity: [
              {
                "@type": "ItemList",
                name: "Trending News",
                itemListElement: [], // Populated by TrendingNews component
              },
              {
                "@type": "ItemList",
                name: "Latest News",
                itemListElement: [], // Populated by LatestNews component
              },
            ],
          })}
        </script>
      </Helmet>

      <section
        className="small-h-screen bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-800 transition-colors duration-500 pt-8 sm:pt-10"
        aria-label="News Dashboard"
        role="main"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8"
            role="region"
            aria-label="News Sections"
          >
            <TrendingNews />
            <LatestNews />
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default NewsDashboard;