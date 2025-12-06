import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center py-12 px-4 transition-colors duration-300">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-8 md:p-12">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">Privacy Policy for Talewire</h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg mb-4 text-center">Last Updated: July 14, 2025</p>
        <p className="text-gray-700 dark:text-gray-200 mb-8 leading-relaxed">
          At Talewire, we value your privacy and are committed to transparency regarding how we collect, use, and protect your information. This Privacy Policy outlines our practices for handling data when you visit our website (<a href="https://talewire.com" className="text-blue-600 dark:text-blue-400 hover:underline">https://talewire.com</a>) and engage with our services, including advertisements.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-300 mb-4">1. Information We Collect</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            We collect information to enhance your experience and deliver relevant content and ads. The types of information include:
          </p>
          <h3 className="text-xl font-medium text-gray-800 dark:text-gray-100 mb-2">a. Personal Information</h3>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4">
            <li><span className="font-medium">Voluntarily Provided:</span> Information you provide, such as your name or email address, when subscribing to newsletters, commenting, or contacting us.</li>
            <li><span className="font-medium">Account Details:</span> If you create an account, we may collect your username, email, and other account-related information.</li>
          </ul>
          <h3 className="text-xl font-medium text-gray-800 dark:text-gray-100 mb-2">b. Non-Personal Information</h3>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4">
            <li><span className="font-medium">Automatically Collected:</span> Data like your IP address, browser type, device information, and browsing behavior collected via cookies and analytics tools.</li>
            <li><span className="font-medium">Usage Data:</span> Information about how you interact with our site, such as pages visited and links clicked.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-300 mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">We use the collected information to:</p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
            <li>Provide and improve our website’s content and functionality.</li>
            <li>Deliver personalized advertisements through partners like Google AdSense.</li>
            <li>Analyze site usage and trends to enhance user experience.</li>
            <li>Communicate with you, such as responding to inquiries or sending newsletters.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-300 mb-4">3. Cookies and Tracking Technologies</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            We use cookies and similar technologies to enhance your browsing experience, serve personalized ads, and analyze traffic. You can manage your cookie preferences through your browser settings. By using our site, you consent to our use of cookies as described in this policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-300 mb-4">4. Third-Party Services</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            We work with third-party services, such as Google AdSense and analytics providers, which may collect and process data according to their own privacy policies. These services may use cookies to serve ads based on your interests and browsing history. Please review their policies for more details:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
            <li><a href="https://policies.google.com/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Google Privacy Policy</a></li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-300 mb-4">5. Data Sharing</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            We do not sell or share your personal information with third parties except:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
            <li>With service providers who assist in operating our site (e.g., hosting or analytics providers).</li>
            <li>To comply with legal obligations or protect our rights.</li>
            <li>With your consent, such as for promotional activities.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-300 mb-4">6. Your Rights</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">You have the right to:</p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
            <li>Access, update, or delete your personal information by contacting us at <a href="mailto:privacy@talewire.com" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@talewire.com</a>.</li>
            <li>Opt out of newsletters or promotional communications by clicking the unsubscribe link in our emails.</li>
            <li>Disable cookies through your browser settings, though this may affect site functionality.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-300 mb-4">7. Data Security</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            We implement reasonable security measures to protect your information. However, no online platform can guarantee complete security, and you share information at your own risk.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-300 mb-4">8. Changes to This Privacy Policy</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            We may update this Privacy Policy periodically. Any changes will be posted on this page with an updated "Last Updated" date. Please review this policy regularly.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-300 mb-4">9. Contact Us</h2>
          <p className="text-gray-600 dark:text-gray-300">
            If you have questions or concerns about this Privacy Policy, please contact us at:
            <br />
            <a href="mailto:privacy@talewire.com" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@talewire.com</a>
          </p>
        </section>
      </div>
      <footer className="mt-8 text-gray-500 dark:text-gray-400 text-center">
        <p>© 2025 Talewire. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;