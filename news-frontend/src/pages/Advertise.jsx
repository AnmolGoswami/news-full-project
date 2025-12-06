
import axios from 'axios';
import React, { useState, useEffect } from 'react';

const Advertise = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: '' });
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!formData.message.trim()) errors.message = 'Message is required';
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await axios.post('https://api.anmol-goswami-resume.store/admin/contact', formData, {
        headers: {
          
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setSubmitMessage(response.data || 'Thank you for your inquiry! We’ll respond within 24 hours.');
      setFormData({ name: '', email: '', company: '', message: '' });
      setFormErrors({});
    } catch (error) {
      console.error('Submission error:', error);
      if (error.response) {
        // Server responded with a status code outside 2xx
        if (error.response.status === 401) {
          setSubmitMessage('Authentication failed. Please log in again.');
        } else if (error.response.status === 403) {
          setSubmitMessage('You do not have permission to perform this action.');
        } else {
          setSubmitMessage(error.response.data || 'Failed to submit. Please try again.');
        }
      } else if (error.request) {
        // No response received (e.g., CORS or network issue)
        setSubmitMessage('Failed to connect to the server. Please check your network or server settings.');
      } else {
        // Other errors (e.g., request setup issues)
        setSubmitMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Optimized background animation
  useEffect(() => {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
      });
    }

    let animationFrameId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 relative overflow-hidden font-sans">
      {/* Background Canvas */}
      <canvas id="bg-canvas" className="absolute inset-0 z-0 opacity-10"></canvas>

      {/* Hero Section with Ad Mockup */}
      <section className="relative py-32 text-center bg-gradient-to-b from-teal-600/20 to-teal-900/10 dark:from-teal-800/20 dark:to-teal-900/20">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold text-teal-700 dark:text-teal-300 mb-6 animate-slide-in">
            Amplify Your Brand
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-8 animate-slide-in delay-100">
            Reach a passionate audience with premium ad placements on our cutting-edge news platform.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="#contact"
              className="inline-block bg-teal-600 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 transform hover:scale-105 transition duration-300 animate-slide-in delay-200"
            >
              Start Your Campaign
            </a>
            <a
              href="#ad-types"
              className="inline-block bg-transparent border-2 border-teal-600 text-teal-600 dark:text-teal-300 font-semibold px-8 py-4 rounded-full shadow-lg hover:bg-teal-600 hover:text-white dark:hover:bg-teal-500 dark:hover:text-white transform hover:scale-105 transition duration-300 animate-slide-in delay-300"
            >
              Explore Ad Types
            </a>
          </div>
          {/* Ad Mockup in Hero */}
          <div className="mt-12 animate-slide-in delay-400">
            <img
              src="https://images.pexels.com/photos/210126/pexels-photo-210126.jpeg"
              alt="Sample banner ad on website"
              className="w-full max-w-4xl mx-auto rounded-lg shadow-xl transform hover:scale-105 transition duration-300"
              loading="lazy"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Example of a banner ad placement</p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-semibold text-center text-teal-700 dark:text-teal-300 mb-16 animate-slide-in">
            Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition duration-300 animate-slide-in delay-100">
              <h3 className="text-2xl font-semibold text-teal-600 dark:text-teal-400 mb-4">Engaged Audience</h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Connect with a growing community of readers passionate about [Your Niche], ensuring your ads resonate.
              </p>
            </div>
            <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition duration-300 animate-slide-in delay-200">
              <h3 className="text-2xl font-semibold text-teal-600 dark:text-teal-400 mb-4">Premium Ad Spaces</h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                High-visibility placements like banners and native ads, designed for maximum clicks and conversions.
              </p>
            </div>
            <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition duration-300 animate-slide-in delay-300">
              <h3 className="text-2xl font-semibold text-teal-600 dark:text-teal-400 mb-4">Actionable Analytics</h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Gain insights with detailed performance metrics to optimize your campaign’s success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Types Section with Enhanced Visuals */}
      <section id="ad-types" className="py-24 bg-gray-100 dark:bg-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-semibold text-center text-teal-700 dark:text-teal-300 mb-16 animate-slide-in">
            Our Ad Opportunities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 animate-slide-in delay-100">
              <h3 className="text-2xl font-semibold text-teal-600 dark:text-teal-400 mb-4">Banner Ads</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                High-impact banners in prime locations for maximum brand visibility.
              </p>
              <img
                src="https://images.pexels.com/photos/11536631/pexels-photo-11536631.jpeg"
                alt="Banner Ad Mockup"
                className="w-full h-64 object-cover rounded-lg shadow-md transform hover:scale-105 transition duration-300"
                loading="lazy"
              />
            </div>
            <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 animate-slide-in delay-200">
              <h3 className="text-2xl font-semibold text-teal-600 dark:text-teal-400 mb-4">Native Ads</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                Seamlessly integrated ads that blend naturally with our content for higher engagement.
              </p>
              <img
                src="https://images.unsplash.com/photo-1542744173-05336fcc7ad4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Native Ad Mockup"
                className="w-full h-64 object-cover rounded-lg shadow-md transform hover:scale-105 transition duration-300"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-semibold text-center text-teal-700 dark:text-teal-300 mb-16 animate-slide-in">
            Launch Your Campaign
          </h2>
          <form
            onSubmit={handleSubmit}
            className="max-w-lg mx-auto space-y-6 bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl shadow-lg animate-slide-in delay-100"
            aria-label="Advertising Inquiry Form"
          >
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${formErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-900 dark:text-gray-100 transition duration-200`}
                placeholder="Your Name"
                aria-required="true"
              />
              {formErrors.name && <p className="text-red-500 text-sm mt-1 animate-slide-in">{formErrors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${formErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-900 dark:text-gray-100 transition duration-200`}
                placeholder="Your Email"
                aria-required="true"
              />
              {formErrors.email && <p className="text-red-500 text-sm mt-1 animate-slide-in">{formErrors.email}</p>}
            </div>
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company (Optional)
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-900 dark:text-gray-100 transition duration-200"
                placeholder="Your Company"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                className={`w-full px-4 py-3 border ${formErrors.message ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-900 dark:text-gray-100 transition duration-200`}
                placeholder="Tell us about your ad goals"
                aria-required="true"
              ></textarea>
              {formErrors.message && <p className="text-red-500 text-sm mt-1 animate-slide-in">{formErrors.message}</p>}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-teal-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 transform hover:scale-105 transition duration-300 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Submit advertising inquiry"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
            </button>
            {submitMessage && (
              <p
                className={`text-center animate-slide-in font-medium ${submitMessage.includes('Failed') || submitMessage.includes('Authentication') || submitMessage.includes('permission') ? 'text-red-500' : 'text-green-500'}`}
                role="alert"
              >
                {submitMessage}
              </p>
            )}
          </form>
        </div>
      </section>

      {/* CSS for Enhanced Styling and Animations */}
      <style>
        {`
          /* Font and Base Styles */
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
          }

          /* Animations */
          .animate-slide-in {
            animation: slideIn 0.8s ease-out forwards;
          }
          .delay-100 { animation-delay: 0.1s; }
          .delay-200 { animation-delay: 0.2s; }
          .delay-300 { animation-delay: 0.3s; }
          .delay-400 { animation-delay: 0.4s; }
          .delay-500 { animation-delay: 0.5s; }
          .delay-600 { animation-delay: 0.6s; }
          @keyframes slideIn {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }

          /* Responsive Adjustments */
          @media (max-width: 640px) {
            h1 {
              font-size: 2.5rem;
            }
            h2 {
              font-size: 2rem;
            }
            .text-xl {
              font-size: 1rem;
            }
          }

          /* Focus States for Accessibility */
          input:focus, textarea:focus, button:focus {
            outline: 2px solid #14b8a6;
            outline-offset: 2px;
          }

          /* High Contrast for Dark Mode */
          .dark .bg-gray-900 {
            background-color: #1f2937;
          }
          .dark .text-gray-300 {
            color: #d1d5db;
          }
        `}
      </style>
    </div>
  );
};

export default Advertise;

