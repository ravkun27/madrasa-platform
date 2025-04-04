// StudentDashboard.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFetch } from "../../utils/apiCall";
import { motion } from "framer-motion";
import { FiSearch, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import toast from "react-hot-toast";

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
  const [searchId, setSearchId] = useState("");
  const [foundCourse, setFoundCourse] = useState<Course | null>(null);
  const [searchError, setSearchError] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);

  const fetchEnrolledCourses = async () => {
    setLoading(true);
    try {
      const res: any = await getFetch("/user/student/course/all");
      if (res.success) {
        const coursesWithProgress = res.data.courseList.map((course: any) => ({
          ...course,
          progress: calculateCourseProgress(),
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

  const calculateCourseProgress = (): number => {
    return Math.floor(Math.random() * 100);
  };

  const handleSearch = async (courseId: string) => {
    setSearchId(courseId);

    if (!/^[0-9a-fA-F]{24}$/.test(courseId)) {
      setFoundCourse(null);
      setSearchError("Invalid Course ID format");
      return;
    }

    try {
      const res: any = await getFetch(
        `/user/student/course?courseId=${courseId}`
      );
      if (res.success) {
        setFoundCourse(res.data.course);
        setSearchError("");
      } else {
        setSearchError("Course not found");
        setFoundCourse(null);
      }
    } catch (error) {
      setSearchError("Error searching course");
      console.error("Search error:", error);
    }
  };

  const handleEnroll = async (courseId: string) => {
    setIsEnrolling(true);
    try {
      const res: any = await getFetch(
        `/user/student/course/enroll?courseId=${courseId}`
      );
      if (res.success) {
        toast.success(res.message);

        // ✅ Refetch the enrolled courses after successful enrollment
        await fetchEnrolledCourses();
      }
    } catch (error: any) {
      const errorMessage = error.message || "Enroll failed";
      toast.error(errorMessage);
    } finally {
      setIsEnrolling(false);
    }
  };

  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedSearch = debounce(handleSearch, 500);

  return (
    <div className="p-6 min-h-screen max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Enroll in New Course</h1>
        <div className="relative max-w-xl">
          <div className="flex items-center gap-2">
            <FiSearch className="text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Enter Course ID (e.g., 67eaa3b933d18fd8227186bf)"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent bg-neutral-200 text-black"
              value={searchId}
              onChange={(e) => {
                setSearchId(e.target.value);
                debouncedSearch(e.target.value);
              }}
              pattern="[0-9a-fA-F]{24}"
            />
          </div>

          {searchError && (
            <div className="mt-2 flex items-center gap-2 text-red-600">
              <FiAlertCircle />
              <span>{searchError}</span>
            </div>
          )}

          {foundCourse && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-white p-4 rounded-lg shadow-md border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{foundCourse.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {foundCourse.description}
                  </p>
                </div>
                <button
                  onClick={() => handleEnroll(foundCourse._id)}
                  disabled={isEnrolling}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                    disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isEnrolling ? "Enrolling..." : "Join Course"}
                </button>
              </div>
            </motion.div>
          )}
        </div>
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
