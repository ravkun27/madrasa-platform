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
  instagram: FaInstagram,
  facebook: FaFacebook,
  whatsapp: FaWhatsapp,
  telegram: FaTelegram,
  twitter: FaTwitter,
  youtube: FaYoutube,
  tiktok: FaTiktok,
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
      className="max-w-4xl mx-auto my-4 md:my-10 px-4 sm:px-6 py-8 bg-white dark:bg-gray-800 rounded-xl shadow-md"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white mb-4 text-start">
        {t.contact.title}
      </h1>

      <p className="text-gray-600 dark:text-gray-400 mb-8 text-start leading-relaxed">
        {t.contact.description}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {socialLinks.map(({ name, link }) => {
          const Icon = socialIconMap[name] || FaInstagram;
          return (
            <a
              key={name}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-blue-100 dark:bg-gray-700 rounded-lg hover:bg-blue-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Icon className="text-2xl text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="text-gray-800 text-2xl dark:text-white font-medium truncate capitalize">
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
