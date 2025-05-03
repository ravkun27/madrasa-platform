import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

const Footer = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const translations = {
    en: {
      platformName: "Madrasa Platform",
      slogan: "Empowering education through technology",
      about: "About",
      contact: "Contact",
      privacy: "Privacy",
      terms: "Terms & Conditions",
      copyright: "All rights reserved.",
    },
    ar: {
      platformName: "منصة المدرسة",
      slogan: "تمكين التعليم من خلال التكنولوجيا",
      about: "حول",
      contact: "اتصال",
      privacy: "الخصوصية",
      terms: "الشروط والأحكام",
      copyright: "جميع الحقوق محفوظة.",
    },
  };
  const t = translations[language];

  return (
    <motion.footer
      className={`${
        theme === "light"
          ? "bg-gray-100 text-gray-800"
          : "bg-gray-800 text-white"
      } py-8 transition-colors duration-300`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <div className="container mx-auto px-6">
        <div className="flex flex-wrap justify-between items-center">
          {/* Left Section */}
          <div className="w-full md:w-1/3 text-center md:text-left">
            <h3
              className={`text-lg font-semibold ${
                theme === "light" ? "text-primary-dark" : "text-primary-light"
              }`}
            >
              {t.platformName}
            </h3>
            <p
              className={`mt-2 text-sm ${
                theme === "light" ? "text-gray-600" : "text-gray-300"
              }`}
            >
              {t.slogan}
            </p>
          </div>

          {/* Middle Section - Links */}
          <div className="w-full md:w-1/3 mt-4 md:mt-0">
            <ul className="flex justify-center md:justify-end space-x-6">
              <li>
                <Link
                  to="/about"
                  className={`hover:${
                    theme === "light" ? "text-gray-700" : "text-gray-300"
                  } transition duration-300`}
                >
                  {t.about}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className={`hover:${
                    theme === "light" ? "text-gray-700" : "text-gray-300"
                  } transition duration-300`}
                >
                  {t.contact}
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className={`hover:${
                    theme === "light" ? "text-gray-700" : "text-gray-300"
                  } transition duration-300`}
                >
                  {t.privacy}
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className={`hover:${
                    theme === "light" ? "text-gray-700" : "text-gray-300"
                  } transition duration-300`}
                >
                  {t.terms}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section - Copyright */}
        <div
          className={`mt-8 text-center text-sm ${
            theme === "light" ? "text-gray-600" : "text-gray-300"
          }`}
        >
          &copy; {new Date().getFullYear()} {t.platformName}. {t.copyright}
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
