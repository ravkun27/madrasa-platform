// StudentDashboard.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFetch } from "../../utils/apiCall";
import { motion } from "framer-motion";

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

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const res: any = await getFetch("/user/student/course");
        if (res.success) {
          const coursesWithProgress = res.data.courseList.map(
            (course: any) => ({
              ...course,
              progress: calculateCourseProgress(), // Implement your progress calculation
            })
          );
          setCourses(coursesWithProgress);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  const calculateCourseProgress = (): number => {
    // Implement your progress calculation logic
    return Math.floor(Math.random() * 100); // Mock progress
  };

  if (loading) {
    return <div className="p-6 text-center">Loading courses...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Enrolled Courses</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <motion.div
            key={course._id}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
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
                <span className="text-sm font-medium">{course.progress}%</span>
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
              className="w-full inline-block text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              {course.progress && course.progress > 0
                ? "Continue Course"
                : "Start Course"}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;
