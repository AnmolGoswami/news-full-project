import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-6xl sm:text-8xl font-bold text-gray-800 mb-4">404</h1>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-700 mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved. Let's get you back to the news.
          </p>
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}