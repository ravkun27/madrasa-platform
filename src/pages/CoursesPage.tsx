import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getFetch } from "../utils/apiCall";
import { useLanguage } from "../context/LanguageContext";

// TypeScript interfaces
interface Teacher {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  TelegramOrWhatsapp?: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  banner?: string;
  tags?: string[];
  teacherId?: Teacher;
}

const CoursesPage = () => {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Translations object
  const translations = {
    en: {
      explore: "Explore Courses",
      searchPlaceholder: "Search courses...",
      allCourses: "All Courses",
      loading: "Loading courses...",
      contact: "Contact",
      viewCourses: "View Courses",
      noCourses: "No courses found matching your search",
      noDescription: "No Description",
    },
    ar: {
      explore: "استكشاف الدورات",
      searchPlaceholder: "ابحث عن دورات...",
      allCourses: "جميع الدورات",
      loading: "جاري تحميل الدورات...",
      contact: "اتصل",
      viewCourses: "عرض الدورات",
      noCourses: "لم يتم العثور على دورات تطابق بحثك",
      noDescription: "",
    },
  };

  const t = translations[language === "ar" ? "ar" : "en"];

  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        const response: any = await getFetch("/public/course/all");
        if (response?.success && Array.isArray(response.data)) {
          setAllCourses(response.data);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCourses();
  }, []);

  const filteredCourses = allCourses.filter((course) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    const teacherName = `${course.teacherId?.firstName || ""} ${
      course.teacherId?.lastName || ""
    }`.toLowerCase();

    return (
      course.title?.toLowerCase().includes(query) ||
      teacherName.includes(query) ||
      course.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const handleViewTeacherCourses = (teacherId: string) => {
    navigate(`/teachers/${teacherId}`);
  };

  // Shimmer effect for loading
  const ShimmerCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md h-96">
      <div className="h-48 w-full relative overflow-hidden">
        <div className="absolute inset-0 shimmer-effect"></div>
      </div>
      <div className="p-5 space-y-4">
        <div className="h-6 w-3/4 shimmer-effect rounded"></div>
        <div className="h-4 w-full shimmer-effect rounded"></div>
        <div className="h-4 w-5/6 shimmer-effect rounded"></div>
        <div className="flex items-center gap-3 mt-6">
          <div className="w-10 h-10 rounded-full shimmer-effect"></div>
          <div className="space-y-2">
            <div className="h-3 w-24 shimmer-effect rounded"></div>
            <div className="h-2 w-32 shimmer-effect rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`py-8 px-4 max-w-6xl mx-auto ${isRTL ? "rtl" : ""}`}
      dir={language}
    >
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">
          {t.explore}
        </h1>
        <div className="w-full max-w-xl mx-auto mt-6 relative">
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            className="w-full px-5 py-3 rounded-full border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className={`w-5 h-5 absolute ${isRTL ? "left-4" : "right-4"} top-1/2 transform -translate-y-1/2 text-gray-400`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </motion.div>

      {/* Courses Grid */}
      <h2 className="text-xl font-bold mb-6 text-gray-700 dark:text-gray-200">
        {t.allCourses}
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <motion.div
              key={`shimmer-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <ShimmerCard />
            </motion.div>
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="h-48 overflow-hidden relative">
                {course.banner ? (
                  <img
                    src={course.banner}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-lg font-medium">
                      {course.title}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                  {course.description || t.noDescription}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-300">
                        {course.teacherId?.firstName?.[0] || "T"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm dark:text-white">
                        {course.teacherId?.firstName}{" "}
                        {course.teacherId?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {course.teacherId?.TelegramOrWhatsapp || t.contact}
                      </p>
                    </div>
                  </div>

                  {course.teacherId?._id && (
                    <button
                      onClick={() =>
                        handleViewTeacherCourses(course.teacherId!._id)
                      }
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      {t.viewCourses}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
          <p className="text-gray-600 dark:text-gray-300">{t.noCourses}</p>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
