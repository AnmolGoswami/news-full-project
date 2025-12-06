import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import images from '../../public/images';

const AboutUs = () => {
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
    <div className="min-h-screen bg-gray-900 text-gray-100 dark:bg-gray-800 dark:text-gray-200">
      {/* Hero Section */}
      <motion.section
        className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-900 to-purple-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            className="text-4xl sm:text-5xl font-extrabold tracking-tight"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            About Our Newsroom
          </motion.h1>
          <motion.p
            className="mt-4 text-lg sm:text-xl max-w-3xl mx-auto opacity-80"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            We are a passionate team dedicated to delivering truthful, impactful, and timely news to empower our readers.
          </motion.p>
        </div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
        </div>
      </motion.section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          animate={controls}
          initial="hidden"
          variants={containerVariants}
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold tracking-tight">Our Mission</h2>
            <p className="mt-4 text-gray-300 dark:text-gray-400 leading-relaxed">
              Our mission is to uncover the truth, spark meaningful conversations, and provide a platform for diverse voices. We strive to deliver journalism that informs, inspires, and challenges perspectives with integrity and innovation.
            </p>
          </motion.div>
          <motion.div variants={itemVariants} className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg transform rotate-3 scale-105" />
            <img
              src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
              alt="Newsroom"
              className="relative rounded-lg shadow-2xl"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-800 dark:bg-gray-700">
        <motion.div
          className="max-w-7xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-bold tracking-tight">
            Meet Our Team
          </motion.h2>
          <motion.p variants={itemVariants} className="mt-4 text-gray-300 dark:text-gray-400 max-w-2xl mx-auto">
            Our team is a blend of seasoned journalists, creative storytellers, and tech innovators working together to redefine news.
          </motion.p>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Manjeet Kumar',
                role: 'Editor-in-Chief',
                img: images.manjeet,
              },
              {
                name: 'Naman Kushwaha',
                role: 'Lead Reporter',
                img: images.naman,
              },
              {
                name: 'Anmol Giri',
                role: 'Tech Director',
                img: images.anmol,
              },
            ].map((member, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative group overflow-hidden rounded-lg bg-gray-900 dark:bg-gray-600 shadow-lg"
              >
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                  <div>
                    <h3 className="text-lg font-semibold">{member.name}</h3>
                    <p className="text-sm text-gray-300 dark:text-gray-400">{member.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-bold tracking-tight text-center">
            Our Core Values
          </motion.h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Integrity',
                description: 'We uphold the highest standards of journalistic ethics, ensuring accuracy and fairness.',
              },
              {
                title: 'Innovation',
                description: 'We embrace technology to deliver news in dynamic and engaging ways.',
              },
              {
                title: 'Community',
                description: 'We foster a space for diverse voices and meaningful dialogue.',
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-6 bg-gray-800 dark:bg-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <h3 className="text-xl font-semibold">{value.title}</h3>
                <p className="mt-2 text-gray-300 dark:text-gray-400">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-900 to-purple-900">
        <motion.div
          className="max-w-7xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-bold tracking-tight">
            Join Our Journey
          </motion.h2>
          <motion.p variants={itemVariants} className="mt-4 text-gray-300 dark:text-gray-400 max-w-2xl mx-auto">
            Stay informed, inspired, and connected. Subscribe to our newsletter or follow us on social media for the latest updates.
          </motion.p>
          <motion.div variants={itemVariants} className="mt-8">
            <a
              href="/contact"
              className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors"
            >
              Subscribe Now
            </a>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default AboutUs;