import { Helmet } from 'react-helmet';
import HeroNewsCarousel from '../components/HeroNewsCarousel';
import NewsDashboard from '../components/NewsDashboard';
import NewsFeed from '../components/NewsFeed';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Breaking News & Top Headlines | Your Trusted News Source</title>
        <meta
          name="description"
          content="Stay updated with the latest breaking news, top headlines, and trending stories from India and around the world."
        />
        <meta
          name="keywords"
          content="breaking news, India news, top headlines, hindi news, political news, business news, international news"
        />
        <meta name="author" content="Your News Team" />
        <meta property="og:title" content="Breaking News & Top Headlines" />
        <meta
          property="og:description"
          content="Trusted coverage of national and international news. Get the facts, fast."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/" />
        <meta property="og:image" content="https://yourdomain.com/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Breaking News & Top Headlines" />
        <meta
          name="twitter:description"
          content="Top news and trending stories delivered straight from our newsroom."
        />
        <meta name="twitter:image" content="https://yourdomain.com/logo.png" />
        <link rel="canonical" href="https://yourdomain.com/" />
      </Helmet>

      <HeroNewsCarousel />
      <NewsDashboard />
      <NewsFeed />
    </>
  );
};

export default Home;
