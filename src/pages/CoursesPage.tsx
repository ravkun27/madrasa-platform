import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFetch } from "../utils/apiCall";
import { useLanguage } from "../context/LanguageContext";
import CourseCard from "../components/CourseCard"; // Import the new reusable component

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
      noDescription: "لا يوجد وصف",
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

  const teacherCourseCounts = allCourses.reduce(
    (acc, course) => {
      const teacherId = course.teacherId?._id;
      if (teacherId) {
        acc[teacherId] = (acc[teacherId] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className={`container mx-auto px-4 py-8 ${isRTL ? "rtl" : "ltr"}`}>
      <div className="mb-8 px-4 md:px-0">
        <h1 className="text-2xl text-center md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
          {t.explore}
        </h1>
        <div className="relative max-w-xl mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out shadow-sm"
          />
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
        {t.allCourses}
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <CourseCard
              key={`loading-${index}`}
              course={{} as Course} // Empty course object for loading state
              loading={true}
            />
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              showTeacherCoursesButton={
                !!course.teacherId?._id &&
                teacherCourseCounts[course.teacherId._id] > 1
              }
              onTeacherCoursesClick={handleViewTeacherCourses}
            />
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
