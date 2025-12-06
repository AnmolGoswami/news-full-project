import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const TermsAndConditions = () => {
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
            Terms and Conditions
          </motion.h1>
          <motion.p
            className="mt-4 text-lg sm:text-xl max-w-3xl mx-auto text-gray-200 dark:text-gray-300 opacity-80"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Welcome to Talewire. Please read these Terms and Conditions carefully before using our site.
          </motion.p>
        </div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 dark:from-indigo-600/20 dark:to-purple-600/20" />
        </div>
      </motion.section>

      {/* Terms Content Section */}
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
              1. Acceptance of Terms
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              By accessing or using Talewire (the "Site"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree with any part of these Terms, you must not use the Site. We reserve the right to update or modify these Terms at any time, and such changes will be effective immediately upon posting on this page.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              2. Use of the Site
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              You agree to use the Site only for lawful purposes and in a manner that does not violate any applicable laws, regulations, or the rights of others. Talewire provides news content across various categories, and you agree to engage with this content responsibly. Prohibited activities include, but are not limited to:
            </p>
            <ul className="mt-2 list-disc list-inside text-gray-700 dark:text-gray-300">
              <li>Engaging in unauthorized access to our systems or networks.</li>
              <li>Distributing malware, viruses, or other harmful software.</li>
              <li>Using automated means (e.g., bots, scripts) to interact with the Site in violation of these Terms.</li>
              <li>Posting or sharing content that is illegal, offensive, or violates Google AdSense Program Policies.</li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              3. Third-Party Advertising
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              Talewire uses Google AdSense to serve advertisements. By using the Site, you acknowledge that third-party ads may be displayed, and these ads may use cookies to collect data for personalized advertising, as outlined in our <a href="/privacy-policy" className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300">Privacy Policy</a>. We do not encourage clicking on ads unless you have genuine interest, and we prohibit any artificial means to inflate ad impressions or clicks, in accordance with Google AdSense policies.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              4. Intellectual Property
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              All content on Talewire, including news articles, images, logos, and other materials, is owned by Talewire or its licensors and is protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or modify any content without prior written permission, except as permitted by law.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              5. User-Generated Content
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              If you submit comments, feedback, or other content to Talewire, you grant us a non-exclusive, royalty-free, worldwide license to use, reproduce, and display such content. You are responsible for ensuring that your content does not violate any laws, infringe on third-party rights, or contain prohibited material as defined by Google AdSense policies.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              6. Limitation of Liability
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              Talewire is provided "as is" without warranties of any kind, express or implied. We do not guarantee that the Site will be error-free, secure, or uninterrupted. To the fullest extent permitted by law, Talewire shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the Site.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              7. Termination
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              We reserve the right to suspend or terminate your access to Talewire at our discretion, without notice, for any reason, including violation of these Terms or Google AdSense policies. You may also discontinue using the Site at any time.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              8. Governing Law
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              These Terms are governed by the laws of [Your State/Country, e.g., California, USA], without regard to its conflict of law principles. Any disputes arising from these Terms will be resolved in the courts of [Your Jurisdiction, e.g., Santa Clara County, California, USA].
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              9. Contact Us
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              If you have any questions about these Terms, please contact us via our <a href="/contact" className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300">Contact Page</a>.
            </p>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default TermsAndConditions;