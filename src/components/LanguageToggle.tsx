import { useLanguage } from "../context/LanguageContext";
import { Globe } from "lucide-react";

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative inline-block">
      <div className="flex items-center gap-1 text-sm cursor-pointer hover:text-primary">
        <Globe size={16} className="text-muted-foreground" />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as "en" | "ar")}
          className="appearance-none bg-transparent border-none pr-4 pl-1 py-1 focus:outline-none font-medium"
          aria-label="Select language"
        >
          <option value="en">EN</option>
          <option value="ar">عربي</option>
        </select>
        <svg
          className="h-4 w-4 text-muted-foreground absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
};

export default LanguageToggle;
