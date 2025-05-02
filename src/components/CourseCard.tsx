import { motion } from "framer-motion";
import { useState } from "react";

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

interface CourseCardProps {
  course: Course;
  loading?: boolean;
  onTeacherCoursesClick?: (teacherId: string) => void;
  showTeacherCoursesButton?: boolean;
  className?: string;
}

/**
 * A reusable course card component that supports English and Arabic translations
 */
const CourseCard = ({
  course,
  loading = false,
  onTeacherCoursesClick,
  showTeacherCoursesButton = false,
  className = "",
}: CourseCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Change this to "ar" to use Arabic translations
  const language = "en";

  const translations = {
    en: {
      contact: "Contact unavailable",
      viewCourses: "View Courses",
      noDescription: "No description available.",
    },
    ar: {
      contact: "لا توجد وسيلة تواصل",
      viewCourses: "عرض الدورات",
      noDescription: "لا يوجد وصف.",
    },
  }[language];

  if (loading) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md h-96 flex flex-col ${className}`}
      >
        <div className="h-48 w-full relative overflow-hidden">
          <div className="absolute inset-0 shimmer-effect"></div>
        </div>
        <div className="p-5 space-y-4 flex-grow flex flex-col">
          <div className="h-6 w-3/4 shimmer-effect rounded"></div>
          <div className="h-4 w-full shimmer-effect rounded"></div>
          <div className="h-4 w-5/6 shimmer-effect rounded"></div>
          <div className="flex items-center gap-3 mt-auto">
            <div className="w-10 h-10 rounded-full shimmer-effect"></div>
            <div className="space-y-2">
              <div className="h-3 w-24 shimmer-effect rounded"></div>
              <div className="h-2 w-32 shimmer-effect rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow h-96 flex flex-col ${className}`}
    >
      <div className="h-48 overflow-hidden relative">
        {course.banner ? (
          <img
            src={course.banner}
            alt={course.title}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
            <span className="text-white text-lg font-medium truncate max-w-xs px-4">
              {course.title}
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex-grow flex flex-col">
        <h3
          className="font-bold text-lg mb-2 text-gray-800 dark:text-white truncate"
          title={course.title}
        >
          {course.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4 flex-grow">
          {course.description || translations.noDescription}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-300">
                {course.teacherId?.firstName?.[0] || "T"}
              </span>
            </div>
            <div className="max-w-32 overflow-hidden">
              <p
                className="font-medium text-sm dark:text-white truncate"
                title={`${course.teacherId?.firstName || ""} ${course.teacherId?.lastName || ""}`}
              >
                {course.teacherId?.firstName} {course.teacherId?.lastName}
              </p>
              <p
                className="text-xs text-gray-500 dark:text-gray-400 truncate"
                title={
                  course.teacherId?.TelegramOrWhatsapp || translations.contact
                }
              >
                {course.teacherId?.TelegramOrWhatsapp || translations.contact}
              </p>
            </div>
          </div>

          {showTeacherCoursesButton &&
            course.teacherId?._id &&
            onTeacherCoursesClick && (
              <button
                onClick={() => onTeacherCoursesClick(course.teacherId!._id)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium whitespace-nowrap"
              >
                {translations.viewCourses}
              </button>
            )}
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
