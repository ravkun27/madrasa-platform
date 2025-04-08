import React from "react";

const TermsOfUse: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto my-2 md:my-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
        Terms of Use
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Last Updated: [Date]
      </p>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          1. Acceptance of Terms
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          By accessing and using the Madrasa platform, you agree to comply with
          these Terms of Use. If you do not agree, please do not use the
          platform.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          2. User Accounts
        </h2>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
          <li>You must create an account to access courses.</li>
          <li>
            You are responsible for maintaining the confidentiality of your
            account.
          </li>
          <li>
            Misuse of the platform, including sharing login credentials, may
            result in account suspension.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          3. Teacher Registration and Approval
        </h2>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
          <li>Teachers must register and submit their profile for review.</li>
          <li>
            An admin must approve the teacher’s account before they can create
            and share courses.
          </li>
          <li>
            The platform reserves the right to reject or revoke teacher access
            if guidelines are not met.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          4. Course Content
        </h2>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
          <li>Teachers own the rights to the courses they create.</li>
          <li>
            Students may access and interact with course content, but they may
            not distribute, sell, or reproduce it without permission.
          </li>
          <li>
            Downloading or screen recording videos is strictly prohibited.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          5. Payments and Refunds
        </h2>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
          <li>Course payments are processed securely.</li>
          <li>
            Refund policies vary based on the course provider and platform
            policies.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          6. User-Generated Content
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          Students may create and upload notes related to lessons, quizzes, or
          lectures. The platform reserves the right to remove inappropriate
          content.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          7. Intellectual Property
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          All trademarks, logos, and platform content are the property of
          Madrasa platform. Unauthorized use of any materials is prohibited.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          8. Google Calendar Integration
        </h2>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
          <li>
            If you choose to connect your Google Calendar, the platform will
            request access to create and manage meeting links on your behalf.
          </li>
          <li>
            This access is used solely for scheduling meetings related to
            courses and educational activities.
          </li>
          <li>
            You can revoke Google Calendar access at any time through your
            Google account settings.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          9. Limitation of Liability
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          The platform is not responsible for any damages arising from the use
          of its services.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          10. Changes to Terms
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          We may update these terms at any time. Continued use of the platform
          constitutes acceptance of the new terms.
        </p>
      </section>
    </div>
  );
};

export default TermsOfUse;
