import { useEffect, useState } from "react";
import { getFetch } from "../utils/apiCall";

import { FiAlertTriangle } from "react-icons/fi";
import LoadingScreen from "../components/LoadingScreen";

const AboutUs = () => {
  const [aboutData, setAboutData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response: any = await getFetch(`/public/siteContent/aboutUs`);
        if (response?.data) {
          setAboutData(response.data);
        } else {
          setError("No content found");
        }
      } catch (err) {
        console.error("Error fetching about us data:", err);
        setError("Failed to load content");
      } finally {
        setLoading(false);
      }
    };
    fetchAboutData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-500">
        <FiAlertTriangle className="text-4xl mb-4" />
        <p className="text-xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {aboutData.header}
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-300 leading-7 mb-8">
            {aboutData.paragraph}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
