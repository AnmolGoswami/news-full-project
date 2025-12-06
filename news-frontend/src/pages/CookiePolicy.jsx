import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const CookiePolicy = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.2 });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Hero Section */}
      <motion.section
        className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white dark:text-gray-100"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            Cookie Policy
          </motion.h1>
          <motion.p
            className="mt-4 text-lg sm:text-xl max-w-3xl mx-auto text-gray-200 dark:text-gray-300 opacity-80"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Learn how Talewire uses cookies to enhance your browsing experience and provide personalized services.
          </motion.p>
        </div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 dark:from-indigo-600/20 dark:to-purple-600/20" />
        </div>
      </motion.section>

      {/* Cookie Policy Content Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-100 dark:bg-gray-900">
        <motion.div
          ref={ref}
          animate={controls}
          initial="hidden"
          variants={containerVariants}
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              1. Introduction
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              Talewire ("we," "us," or "our") uses cookies and similar technologies to provide, improve, and personalize your experience on our website (the "Site"). This Cookie Policy explains what cookies are, how we use them, and how you can manage your cookie preferences. By using Talewire, you consent to our use of cookies as described in this policy.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              2. What Are Cookies?
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              Cookies are small text files stored on your device (computer, tablet, or mobile) when you visit a website. They help websites remember your preferences, enhance functionality, and collect data about your interactions with the Site. Cookies may be set by Talewire ("first-party cookies") or by third-party services we use, such as Google AdSense ("third-party cookies").
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              3. Types of Cookies We Use
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              Talewire uses the following types of cookies:
            </p>
            <ul className="mt-2 list-disc list-inside text-gray-700 dark:text-gray-300">
              <li>
                <strong>Essential Cookies</strong>: These cookies are necessary for the Site to function properly, such as enabling navigation and access to secure areas. They cannot be disabled.
              </li>
              <li>
                <strong>Functional Cookies</strong>: These cookies enhance your experience by remembering your preferences (e.g., language or theme settings).
              </li>
              <li>
                <strong>Analytics Cookies</strong>: These cookies help us understand how visitors interact with Talewire by collecting anonymized data, such as page views and time spent on the Site.
              </li>
              <li>
                <strong>Advertising Cookies</strong>: These cookies, including those set by Google AdSense, deliver personalized advertisements based on your interests and browsing behavior. They may track your activity across other sites to serve relevant ads.
              </li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              4. Third-Party Cookies
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              Talewire uses third-party services, such as Google AdSense, to serve advertisements. These services may set cookies to track your browsing behavior and deliver personalized ads. We do not control these third-party cookies, and their use is governed by the respective third-party privacy policies. For more information, please visit <a href="https://policies.google.com/technologies/ads" className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300">Google’s Ad Policies</a>.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              5. How We Use Cookies
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              Cookies on Talewire are used for the following purposes:
            </p>
            <ul className="mt-2 list-disc list-inside text-gray-700 dark:text-gray-300">
              <li>To ensure the Site functions correctly and provides a seamless user experience.</li>
              <li>To personalize content and ads, including through Google AdSense.</li>
              <li>To analyze site performance and visitor behavior using tools like Google Analytics.</li>
              <li>To remember your preferences, such as light or dark mode settings.</li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              6. Managing Your Cookie Preferences
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              You can manage your cookie preferences through your browser settings or by opting out of certain cookies. Note that disabling cookies may affect the Site’s functionality. To opt out of personalized ads from Google AdSense, visit <a href="https://adssettings.google.com" className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300">Google’s Ad Settings</a>. For more information on managing cookies, refer to your browser’s help section or visit <a href="https://www.allaboutcookies.org" className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300">AllAboutCookies.org</a>.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              7. Consent and Privacy
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              By continuing to use Talewire, you consent to the use of cookies as described in this policy. For more details on how we collect, use, and protect your personal data, please review our <a href="/privacy-policy" className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300">Privacy Policy</a>. If you are in the EU or California, you have additional rights under GDPR or CCPA, respectively, to manage your data.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              8. Changes to This Cookie Policy
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              Talewire reserves the right to update this Cookie Policy at any time. Changes will be effective immediately upon posting on this page. We encourage you to review this policy periodically to stay informed.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              9. Contact Us
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              If you have any questions about this Cookie Policy, please contact us via our <a href="/contact" className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300">Contact Page</a>.
            </p>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default CookiePolicy;