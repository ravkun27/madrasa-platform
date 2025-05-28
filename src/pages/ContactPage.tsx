import React, { useEffect, useState } from "react";
import {
  FaFacebook,
  FaWhatsapp,
  FaTelegram,
  FaTwitter,
  FaYoutube,
  FaTiktok,
  FaInstagram,
} from "react-icons/fa";
import { getFetch } from "../utils/apiCall"; // adjust path if needed
import { useLanguage } from "../context/LanguageContext"; // import language context

const socialIconMap: Record<string, React.ElementType> = {
  Instagram: FaInstagram,
  Facebook: FaFacebook,
  WhatsApp: FaWhatsapp,
  Telegram: FaTelegram,
  Twitter: FaTwitter,
  YouTube: FaYoutube,
  TikTok: FaTiktok,
};

const ContactPage: React.FC = () => {
  const [socialLinks, setSocialLinks] = useState<
    { name: string; link: string }[]
  >([]);

  const { language } = useLanguage(); // Get selected language

  const translations = {
    en: {
      contact: {
        title: "Contact Us",
        description: "Connect with us on our social media platforms:",
      },
    },
    ar: {
      contact: {
        title: "اتصل بنا",
        description: "تواصل معنا على منصات التواصل الاجتماعي:",
      },
    },
  };

  const t = translations[language]; // Current language translations

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const response: any = await getFetch("/public/siteContent/socialLinks");
        if (Array.isArray(response?.data)) {
          setSocialLinks(response.data);
        }
      } catch (error) {
        console.error("Failed to load social links", error);
      }
    };

    fetchLinks();
  }, []);

  return (
    <div
      className="max-w-4xl mx-auto my-2 md:my-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow space-y-6"
      dir={language === "ar" ? "rtl" : "ltr"} // set direction dynamically
    >
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 text-start">
        {t.contact.title}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-start">
        {t.contact.description}
      </p>

      <div
        className={`grid grid-cols-2 sm:grid-cols-3 gap-6 ${
          language === "ar" ? "text-right" : "text-left"
        }`}
      >
        {socialLinks.map(({ name, link }) => {
          const Icon = socialIconMap[name] || FaInstagram; // fallback icon
          return (
            <a
              key={name}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-4 bg-blue-100 dark:bg-gray-700 rounded-lg hover:bg-blue-200 dark:hover:bg-gray-600 transition-colors space-x-2"
            >
              <Icon className="text-2xl text-blue-600 dark:text-blue-400" />
              <span className="text-gray-800 dark:text-white font-medium">
                {name}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default ContactPage;
