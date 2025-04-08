import React from "react";
import {
  FaFacebook,
  FaWhatsapp,
  FaTelegram,
  FaTwitter,
  FaYoutube,
  FaTiktok,
  FaInstagram,
} from "react-icons/fa";

const socialLinks = [
  {
    name: "Instagram",
    icon: FaInstagram,
    link: "https://instagram.com/YourProfile",
  },
  {
    name: "Facebook",
    icon: FaFacebook,
    link: "https://facebook.com/YourProfile",
  },
  { name: "WhatsApp", icon: FaWhatsapp, link: "https://wa.me/YourNumber" },
  { name: "Telegram", icon: FaTelegram, link: "https://t.me/YourProfile" },
  { name: "Twitter", icon: FaTwitter, link: "https://twitter.com/YourProfile" },
  { name: "YouTube", icon: FaYoutube, link: "https://youtube.com/YourChannel" },
  { name: "TikTok", icon: FaTiktok, link: "https://tiktok.com/@YourProfile" },
];

const ContactPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto my-2 md:my-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
        Contact Us
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Connect with us on our social media platforms:
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {socialLinks.map(({ name, icon: Icon, link }) => (
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
        ))}
      </div>
    </div>
  );
};

export default ContactPage;
