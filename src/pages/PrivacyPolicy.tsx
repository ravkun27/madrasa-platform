import React, { useEffect, useState } from "react";
import { getFetch } from "../utils/apiCall"; // adjust path as needed

interface Section {
  _id: string;
  subheader: string;
  paragraph: string;
}

interface PolicyData {
  date: string;
  header: string;
  content: Section[];
}

const PrivacyPolicy: React.FC = () => {
  const [policy, setPolicy] = useState<PolicyData | null>(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response: any = await getFetch(
          "/public/siteContent/privacyPolicy"
        );
        if (response?.success && response?.data) {
          setPolicy(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch privacy policy", err);
      }
    };

    fetchPolicy();
  }, []);

  if (!policy) {
    return (
      <div className="text-center mt-20 text-gray-600 dark:text-gray-300">
        Loading privacy policy...
      </div>
    );
  }
  const formattedDate = new Date(policy.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });

  return (
    <div className="max-w-4xl mx-auto my-2 md:my-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
        {policy.header || "Privacy Policy"}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Last Updated: {formattedDate || "N/A"}
      </p>

      {policy.content.map(({ _id, subheader, paragraph }, index) => (
        <section key={_id || index}>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            {index + 1}. {subheader}
          </h2>
          <p className="text-gray-700 dark:text-gray-300">{paragraph}</p>
        </section>
      ))}
    </div>
  );
};

export default PrivacyPolicy;
