import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Disclaimer = () => {
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
            Disclaimer
          </motion.h1>
          <motion.p
            className="mt-4 text-lg sm:text-xl max-w-3xl mx-auto text-gray-200 dark:text-gray-300 opacity-80"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Please read this Disclaimer carefully to understand the limitations and scope of Talewire’s content and services.
          </motion.p>
        </div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 dark:from-indigo-600/20 dark:to-purple-600/20" />
        </div>
      </motion.section>

      {/* Disclaimer Content Section */}
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
              1. General Information
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              The content provided on Talewire is for general informational purposes only. While we strive to deliver accurate and up-to-date news across various categories, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of the information, services, or related graphics on the Site.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              2. News Content
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              Talewire publishes news articles covering a wide range of topics. The information in these articles is based on sources we believe to be reliable, but we do not guarantee its accuracy or timeliness. Opinions expressed in articles are those of the authors and do not necessarily reflect the views of Talewire. You should independently verify any information before relying on it.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              3. Third-Party Advertisements
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              Talewire uses third-party advertising services, including Google AdSense, to display advertisements. These ads are provided by third parties, and Talewire does not endorse or take responsibility for the content, products, or services offered in these advertisements. For more details on how ads use cookies and data, please refer to our <a href="/privacy-policy" className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300">Privacy Policy</a>.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              4. External Links
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              Talewire may contain links to external websites or resources for your convenience. We do not control or endorse these external sites and are not responsible for their content, accuracy, or availability. Accessing these links is at your own risk, and we encourage you to review the terms and privacy policies of any third-party sites.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              5. Limitation of Liability
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              To the fullest extent permitted by law, Talewire, its affiliates, and its contributors shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from your use of the Site or reliance on its content. This includes, but is not limited to, damages for loss of profits, data, or other intangible losses.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              6. User Responsibility
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              You are responsible for verifying the accuracy of any information obtained from Talewire before acting on it. Talewire is not responsible for any decisions or actions you take based on the content provided on the Site.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              7. Changes to the Disclaimer
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              Talewire reserves the right to update or modify this Disclaimer at any time without prior notice. Any changes will be effective immediately upon posting on this page. We encourage you to review this Disclaimer periodically.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              8. Contact Us
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              If you have any questions about this Disclaimer, please contact us via our <a href="/contact" className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300">Contact Page</a>.
            </p>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default Disclaimer;