import { useEffect, useState } from "react";
import { getFetch } from "../utils/apiCall";
import { FiAlertTriangle } from "react-icons/fi";
import LoadingScreen from "../components/LoadingScreen";

// Utility function to check if text contains Arabic
const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

const AboutUs = () => {
  const [aboutData, setAboutData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response: any = await getFetch(`/public/siteContent/aboutUs`);
        if (response?.data) {
          setAboutData(response.data);

          // Check if content is in Arabic (same logic as TermsOfUse)
          const textToCheck =
            response.data.header +
              response.data.content
                ?.map((s: any) => s.subheader + s.paragraph)
                .join(" ") || "";
          setIsRTL(isArabic(textToCheck));
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <div
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 space-y-6 ${
            isRTL ? "rtl text-right" : "ltr text-left"
          }`}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {aboutData.header}
          </h1>

          {aboutData.content?.map((section: any) => (
            <div key={section._id} className="mb-8">
              <h2 className="text-2xl font-semibold text-primary dark:text-primary-300 mb-4">
                {section.subheader}
              </h2>
              <p className="text-md sm:text-lg text-gray-700 dark:text-gray-300 leading-8 whitespace-pre-line">
                {section.paragraph}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
