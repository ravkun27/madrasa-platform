import { useEffect, useState } from "react";
import { getFetch } from "../utils/apiCall";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaGlobe,
} from "react-icons/fa";
import { FiAlertTriangle } from "react-icons/fi";
import LoadingScreen from "../components/LoadingScreen";

const socialIcons = {
  facebook: FaFacebook,
  twitter: FaTwitter,
  instagram: FaInstagram,
  linkedin: FaLinkedin,
  youtube: FaYoutube,
  website: FaGlobe,
};

const AboutUs = () => {
  const [aboutData, setAboutData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response: any = await getFetch(`/public/siteContent/aboutUs`);
        if (response?.data) {
          console.log(response);
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

        {aboutData.socialLinks?.length > 0 && (
          <div className="mt-8 border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Connect With Us
            </h2>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              {aboutData.socialLinks.map((link: any) => {
                const Icon =
                  socialIcons[link.name as keyof typeof socialIcons] || FaGlobe;
                return (
                  <a
                    key={link._id}
                    href={link.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Icon className="text-xl text-blue-600 dark:text-blue-400" />
                    <span className="text-gray-700 dark:text-gray-300 capitalize">
                      {link.name}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutUs;
