import { useEffect, useState } from "react";
import ManageCourses from "./ManageCoursesPage";
import { getFetch } from "../../utils/apiCall";
import {
  FiUsers,
  FiBookOpen,
  FiClock,
  FiCalendar,
  FiRefreshCw,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";

const Dashboard = () => {
  const [teacherCourses, setTeacherCourses] = useState<any[]>([]);
  const [isApproved, setIsApproved] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [loading, setLoading] = useState(true);

  const { language } = useLanguage();

  // Static translations object
  const translations = {
    en: {
      loading_courses: "Loading your courses...",
      account_pending_approval: "Account Pending Approval",
      account_under_review:
        "Your account is currently under review. Please wait for admin approval.",
      contact_team:
        "You will be contacted by our team via email, Telegram, or WhatsApp once a decision has been made.",
      account_suspended: "Account Suspended",
      account_suspended_message:
        "Your account has been suspended. Please contact support for more information.",
      course_banner: "Course banner",
      students_enrolled: "students enrolled",
      last_active: "Last active",
      created_on: "Created on",
      uncategorized: "Uncategorized",
      refresh: "Refresh",
      your_published_courses: "Your Published Courses",
      no_published_courses: "You haven't published any courses yet.",
    },
    ar: {
      loading_courses: "جاري تحميل دوراتك...",
      account_pending_approval: "الحساب قيد الموافقة",
      account_under_review:
        "حسابك قيد المراجعة. يرجى الانتظار للموافقة من قبل المسؤول.",
      contact_team:
        "سيتصل بك فريقنا عبر البريد الإلكتروني أو تليجرام أو واتساب بمجرد اتخاذ قرار.",
      account_suspended: "تم تعليق الحساب",
      account_suspended_message:
        "تم تعليق حسابك. يرجى الاتصال بالدعم للحصول على المزيد من المعلومات.",
      course_banner: "لافتة الدورة",
      students_enrolled: "طلاب مسجلون",
      last_active: "آخر نشاط",
      created_on: "تم إنشاؤه في",
      uncategorized: "غير مصنف",
      refresh: "تحديث",
      your_published_courses: "دوراتك المنشورة",
      no_published_courses: "لم تنشر أي دورات بعد.",
    },
  };

  // Access translation values based on language
  const t = translations[language];

  const checkSuspended = async () => {
    try {
      const response: any = await getFetch("/user");
      if (response?.success) {
        setIsSuspended(response.data.suspended);
      }
    } catch (error) {
      console.error("Error fetching suspended status:", error);
    }
  };

  const fetchTeacherStatus = async () => {
    try {
      const response: any = await getFetch("/user");
      if (response?.success) {
        setIsApproved(response.data.approved);
        if (response.data.approved) {
          const coursesResponse: any = await getFetch(
            "/user/teacher/course/all"
          );
          const publishedCourses =
            coursesResponse.data?.courseList.filter(
              (course: any) => course.published.value
            ) || [];
          setTeacherCourses(publishedCourses);
        }
      }
    } catch (error) {
      console.error("Error fetching teacher status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSuspended();
    fetchTeacherStatus();
  }, []);

  if (loading)
    return (
      <div className="w-full px-6 py-8 flex flex-col items-center">
        <div className="max-w-6xl w-full">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
            <FiBookOpen className="text-blue-600 dark:text-blue-400 text-3xl" />
            {t.loading_courses}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-200 dark:bg-gray-700 h-72 rounded-lg"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );

  if (!isApproved)
    return (
      <div className="min-h-screen text-center flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold mb-4">
          {t.account_pending_approval}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          {t.account_under_review}
        </p>
        <p className="text-gray-600 dark:text-gray-400">{t.contact_team}</p>
      </div>
    );

  if (isSuspended) {
    return (
      <div className="min-h-screen text-center flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold mb-4">{t.account_suspended}</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t.account_suspended_message}
        </p>
      </div>
    );
  }

  const CourseCard = ({ course }: { course: any }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col"
    >
      {course.banner && (
        <img
          src={course.banner}
          alt={t.course_banner}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
      )}
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
        {course.title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mt-2 line-clamp-1 text-sm">
        {course.description}
      </p>

      <div className="mt-4 space-y-2 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <FiUsers className="text-gray-500" />
          <span>
            {course.enrolledStudentIds?.length || 0} {t.students_enrolled}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FiClock className="text-gray-500" />
          <span>
            {t.last_active}: {new Date(course.lastActive).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FiCalendar className="text-gray-500" />
          <span>
            {t.created_on}: {new Date(course.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div>
        <span className="text-text font-bold text-sm mt-2">
          {course.category || t.uncategorized}
        </span>
      </div>
      {course.tags?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {course.tags.map((tag: string) => (
            <span
              key={tag}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full text-xs font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );

  return (
    <>
      <div className="w-full px-6 py-8 flex flex-col items-center">
        <div className="max-w-6xl w-full">
          {/* Header with Refresh Button */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm md:text-2xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
              <FiBookOpen className="text-blue-600 dark:text-blue-400 text-3xl" />
              {t.your_published_courses}
            </h3>
            <button
              onClick={fetchTeacherStatus}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              disabled={loading}
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
              {t.refresh}
            </button>
          </div>

          {teacherCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {teacherCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center bg-gray-100 dark:bg-gray-800 p-8 rounded-lg shadow-md">
              <FiBookOpen className="text-gray-400 text-5xl mb-4" />
              <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
                {t.no_published_courses}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl w-full px-6 py-8">
        <ManageCourses />
      </div>
    </>
  );
};

export default Dashboard;
