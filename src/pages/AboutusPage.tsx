import { useEffect, useState } from "react";
import { getFetch } from "../utils/apiCall";
import { FiAlertTriangle } from "react-icons/fi";
import LoadingScreen from "../components/LoadingScreen";

interface Section {
  _id: string;
  subheader: string;
  paragraph: string;
}

interface AboutData {
  date: string;
  header: string;
  content: Section[];
}

const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

const AboutUs = () => {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response: any = await getFetch(`/public/siteContent/aboutUs`);
        if (response?.success && response?.data) {
          setAboutData(response.data);
          const textToCheck =
            response.data.header +
            response.data.content
              ?.map((s: Section) => s.subheader + s.paragraph)
              .join(" ");
          setIsRTL(isArabic(textToCheck));
        } else {
          setError(response?.message || "No content found");
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
      <div
        className={`min-h-screen flex flex-col items-center justify-center text-red-500 ${
          isRTL ? "rtl" : "ltr"
        }`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <FiAlertTriangle className="text-4xl mb-4" />
        <p className="text-xl">{error}</p>
      </div>
    );
  }

  if (!aboutData) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center ${
          isRTL ? "rtl" : "ltr"
        }`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <FiAlertTriangle className="text-4xl mb-4 text-yellow-500" />
        <p className="text-xl text-gray-600 dark:text-gray-300">
          {isRTL ? "لا تتوفر بيانات" : "No data available"}
        </p>
      </div>
    );
  }

  const formattedDate = new Date(aboutData.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });

  return (
    <div
      className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 ${
        isRTL ? "rtl" : "ltr"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-4xl mx-auto">
        <div
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 space-y-6 ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {aboutData.header}
          </h1>

          {aboutData.date && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {isRTL ? "آخر تحديث: " : "Last Updated: "}
              {formattedDate}
            </p>
          )}

          {aboutData.content?.map((section: Section) => (
            <div key={section._id} className="mb-8">
              <h2 className="text-2xl font-semibold text-primary dark:text-primary-300 mb-4">
                {section.subheader}
              </h2>
              <div
                className="text-md sm:text-lg text-gray-700 dark:text-gray-300 leading-8 whitespace-pre-line"
                dangerouslySetInnerHTML={{
                  __html: section.paragraph.replace(/\n/g, "<br />"),
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
