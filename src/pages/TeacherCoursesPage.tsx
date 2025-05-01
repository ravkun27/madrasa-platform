import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getFetch } from "../utils/apiCall";
import { useLanguage } from "../context/LanguageContext";

const TeacherCoursesPage = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const [courses, setCourses] = useState<any[]>([]);
  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Translations
  const translations = {
    en: {
      coursesBy: "Courses by",
      back: "Back to Courses",
      noCourses: "No courses found for this teacher",
    },
    ar: {
      coursesBy: "دورات من قبل",
      back: "العودة إلى الدورات",
      noCourses: "لا توجد دورات لهذا المعلم",
    },
  };
  const t = translations[language === "ar" ? "ar" : "en"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teacherRes: any = await getFetch(
          `/public/course/byTeacher/${teacherId}`
        );
        console.log(teacherRes);

        if (teacherRes?.success) {
          setTeacher(teacherRes.data[0].teacherId); // Assuming teacher info is in the first course
          setCourses(teacherRes.data); // Set courses to the response data
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teacherId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className={`py-12 px-4 max-w-6xl mx-auto ${isRTL ? "rtl" : ""}`}
      dir={language}
    >
      <button
        onClick={() => navigate(-1)}
        className="mb-8 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-2"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isRTL ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
          />
        </svg>
        {t.back}
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl">
          {teacher?.firstName?.[0]}
        </div>
        <div>
          <h1 className="text-3xl font-bold dark:text-white">
            {t.coursesBy} {teacher?.firstName} {teacher?.lastName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {teacher?.TelegramOrWhatsapp || teacher?.phoneNumber}
          </p>
        </div>
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="h-48 bg-gray-100 dark:bg-gray-700 relative">
                {course.banner && (
                  <img
                    src={course.banner}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-2 dark:text-white">
                  {course.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                  {course.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-300">{t.noCourses}</p>
        </div>
      )}
    </div>
  );
};

export default TeacherCoursesPage;
