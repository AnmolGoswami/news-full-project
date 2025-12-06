import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import { toast } from 'react-toastify';

const Contact = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.2 });

  // State for contact form inputs
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  // State for newsletter signup
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false); // New state for newsletter submission

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (!formData.message.trim()) {
      toast.error('Message is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await axios.post('https://api.anmol-goswami-resume.store/admin/contact', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.status === 200) {
        toast.success('Message sent successfully!');
        setFormData({ name: '', email: '', message: '' });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // New function to handle newsletter submission with Web3Forms
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsNewsletterSubmitting(true);
    try {
      const response = await axios.post('https://api.web3forms.com/submit', {
        access_key: '20a8e715-242c-4f61-9d17-19c89bdc4a09', // Replace with your Web3Forms access key
        email: newsletterEmail,
        subject: 'Newsletter Subscription Request',
        // Optional: Add additional fields if needed
        source: 'Website Newsletter -  Connect with us for exclusive offers, updates, and more!',
      });

      if (response.status === 200) {
        toast.success('Subscribed successfully!');
        setNewsletterEmail('');
      } else {
        toast.error('Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      toast.error('Failed to subscribe. Please try again later.');
    } finally {
      setIsNewsletterSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 dark:bg-gray-800 dark:text-gray-200">
      {/* Hero Section */}
      <motion.section
        className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900 to-indigo-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            Get in Touch
          </motion.h1>
          <motion.p
            className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl max-w-3xl mx-auto opacity-80"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Have a question, tip, or just want to say hello? Reach out to us, and let’s start a conversation.
          </motion.p>
        </div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20" />
        </div>
      </motion.section>

      {/* Contact Form Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          animate={controls}
          initial="hidden"
          variants={containerVariants}
          className="max-w-3xl mx-auto"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center">
              Send Us a Message
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-gray-300 dark:text-gray-400 leading-relaxed text-center max-w-xl mx-auto">
              We value your feedback and inquiries. Fill out the form below, and our team will respond promptly.
            </p>
            <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm sm:text-base font-medium">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-3 sm:px-4 py-2 bg-gray-800 dark:bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm sm:text-base font-medium">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-3 sm:px-4 py-2 bg-gray-800 dark:bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                  placeholder="Your Email"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm sm:text-base font-medium">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="4"
                  className="mt-1 w-full px-3 sm:px-4 py-2 bg-gray-800 dark:bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                  placeholder="Your Message"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full px-6 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors text-sm sm:text-base ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Join Our Community Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl font-bold tracking-tight">
            Join Our Community
          </motion.h2>
          <motion.p variants={itemVariants} className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-gray-300 dark:text-gray-400 max-w-xl mx-auto">
            Become part of our vibrant news community. Subscribe to our newsletter for exclusive stories, insights, and updates.
          </motion.p>
          <motion.div variants={itemVariants} className="mt-6 sm:mt-8">
            <form onSubmit={handleNewsletterSubmit}>
              <div className="flex flex-col sm:flex-row items-center bg-gray-700 dark:bg-gray-600 rounded-full p-1 max-w-sm mx-auto">
                <input
                  type="email"
                  name="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 px-3 sm:px-4 py-2 bg-transparent text-gray-100 placeholder-gray-400 focus:outline-none text-sm sm:text-base"
                  placeholder="Enter your email"
                />
                <input
                  type="hidden"
                  name="access_key"
                  value="YOUR_ACCESS_KEY_HERE" // Replace with your Web3Forms access key
                />
                <button
                  type="submit"
                  disabled={isNewsletterSubmitting}
                  className={`mt-2 sm:mt-0 sm:ml-2 px-5 sm:px-6 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors text-sm sm:text-base ${
                    isNewsletterSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isNewsletterSubmitting ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
            </form>
          </motion.div>
          {/* Impact Stats */}
          <motion.div variants={itemVariants} className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { value: '1M+', label: 'Readers Monthly' },
              { value: '500+', label: 'Stories Published' },
              { value: '50+', label: 'Awards Won' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="relative p-4 sm:p-6 bg-gray-900 dark:bg-gray-600 rounded-lg shadow-xl"
                whileHover={{ scale: 1.05 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg" />
                <h3 className="text-xl sm:text-2xl font-bold text-indigo-400">{stat.value}</h3>
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-300 dark:text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default Contact;