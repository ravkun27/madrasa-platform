import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto my-2 md:my-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
        Privacy Policy
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Last Updated: April 04, 2025
      </p>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          1. Information We Collect
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          <strong>Personal Information:</strong> Name, email, and account
          activity.
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <strong>Usage Data:</strong> Course progress, interactions, and
          uploaded content.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          2. How We Use Your Information
        </h2>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
          <li>To provide and improve our services.</li>
          <li>To enforce platform security and prevent unauthorized use.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          3. Data Sharing
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          We do not sell your data.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          4. Security
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          We implement security measures to protect user data. However, no
          system is completely secure, and we cannot guarantee absolute
          protection.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          5. Your Rights
        </h2>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
          <li>You may request access to or deletion of your personal data.</li>
          <li>Some data may be retained for legal or operational reasons.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          6. Cookies and Tracking
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          We use cookies to enhance user experience and track interactions. You
          may disable cookies in your browser settings.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          7. Changes to This Policy
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          We may update this policy periodically.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
