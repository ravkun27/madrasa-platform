// StudentDashboard.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFetch } from "../../utils/apiCall";
import { motion } from "framer-motion";
import CourseSearch from "../../components/CourseSearch";
import { FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

interface Course {
  _id: string;
  title: string;
  description: string;
  banner?: string;
  progress?: number;
}

const StudentDashboard = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const fetchEnrolledCourses = async () => {
    setLoading(true);
    try {
      const res: any = await getFetch("/user/student/course/all");
      if (res.success) {
        const coursesWithProgress = res.data.courseList.map((course: any) => ({
          ...course,
          progress: calculateCourseProgress(course),
        }));
        setCourses(coursesWithProgress);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const calculateCourseProgress = (course: any): number => {
    if (!course.totalLessons || course.totalLessons === 0) return 0;
    return Math.floor((course.completedLessons / course.totalLessons) * 100);
  };

  return (
    <div className="p-6 min-h-screen max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Enroll in New Course</h1>
        <CourseSearch user={user} onEnrollSuccess={fetchEnrolledCourses} />
      </div>

      <h2 className="text-3xl font-bold mb-6">My Courses</h2>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-100 rounded-xl p-6 h-64"
            />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <FiCheckCircle className="mx-auto text-gray-400 text-4xl mb-4" />
          <p className="text-gray-500 text-lg">
            No enrolled courses yet. Search above to join a course!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-background">
          {courses.map((course) => (
            <motion.div
              key={course._id}
              whileHover={{ scale: 1.02 }}
              className="bg-card rounded-xl shadow-lg p-6 border border-cardBorder"
            >
              {course.banner && (
                <img
                  src={course.banner}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <h2 className="text-xl font-semibold mb-4">{course.title}</h2>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-medium">
                    {course.progress}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
              <Link
                to={`/course/${course._id}`}
                className="w-full inline-block text-center bg-blue-600 hover:bg-blue-700 
                  text-white px-4 py-2 rounded-lg transition-colors"
              >
                {course.progress && course.progress > 0
                  ? "Continue Course"
                  : "Start Course"}
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
