import { Navigate, Route, Routes } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import { ThemeProvider } from './context/ThemeProvider';
import { ToastContainer } from 'react-toastify';
import NewsList from './pages/NewsList';
import NewsDetails from './pages/NewsDetails';
import SearchResults from './pages/SearchResults';
import AboutUs from './pages/AboutUs';
import StateNews from './pages/StateNews';
import CountryNews from './pages/Sports';
import InternationalNews from './pages/InternationalNews';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Login from './pages/Login';
import { NewsProvider } from './context/NewsContex';
import Footer from './components/Footer';
import Advertise from './pages/Advertise';
import Register from './pages/Register';
import 'react-toastify/dist/ReactToastify.css';
import ErrorPage from './pages/ErrorPage';
import Sports from './pages/Sports';
import LanguageNews from './pages/LanguageNews';
import TermsAndConditions from './pages/TermsAndConditions';
import Disclaimer from './pages/Disclaimer';
import CookiePolicy from './pages/CookiePolicy';


export default function App() {
  return (
    <ThemeProvider>
      <Helmet>
        <title>TALEWIRE | India's Trusted News Source</title>
        <meta
          name="description"
          content="Stay updated with the latest national, state, and international news on Talewire. Trusted journalism with facts, speed, and integrity."
        />
        <meta
          name="keywords"
          content="India news, breaking news, state news, world news, hindi news, politics, business, technology, Talewire"
        />
        <meta name="author" content="Talewire Team" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://www.samaysiwan.com" />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Talewire | India's Trusted News Source" />
        <meta
          property="og:description"
          content="Get top stories from India and around the world. Live updates, reports, and headlines at your fingertips on Talewire."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.talewire.com" />
        <meta property="og:image" content="/path/to/logo.png" />
        <meta property="og:site_name" content="Talewire" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Talewire | India's Trusted News Source" />
        <meta
          name="twitter:description"
          content="Breaking news from India and the world. Latest headlines and verified updates from Talewire."
        />
        <meta name="twitter:image" content="/path/to/logo.png" />
        <meta name="twitter:site" content="@SamaySiwan" />

        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Talewire',
            url: 'https://www.samaysiwan.com',
            description:
              'Talewire provides trusted news coverage on national, state, and international events with speed and integrity.',
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
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://www.samaysiwan.com/search?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          })}
        </script>
      </Helmet>

      <ToastContainer
  icon={false}
  position="top-right"
  autoClose={3000}
  hideProgressBar={false}
  newestOnTop={false}
  closeOnClick
  rtl={false}
  pauseOnFocusLoss
  draggable
  pauseOnHover
  theme="dark" // 👈 This avoids white box issue
/>

      <NewsProvider>
        <header>
          
          <Navbar />
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/news" element={<NewsList />} />
            <Route path="/news/:id/:slug" element={<NewsDetails />} />
            <Route path="/news/:id" element={<Navigate to="/news" replace />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/state" element={<StateNews />} />
            <Route path="/sports" element={<Sports/>} />
            <Route path="/language-news" element={<LanguageNews/>} />
            <Route path="/international" element={<InternationalNews />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/login" element={<Login />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/cookie-policy" element={<CookiePolicy/>} />
            
            
            <Route path="/advertise" element={<Advertise />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </main>
        <Footer />
      </NewsProvider>
    </ThemeProvider>
  );
}