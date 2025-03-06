import { useEffect, useState } from "react";
import ManageCourses from "./ManageCoursesPage";
import { getFetch } from "../../utils/apiCall";
import { FiUsers, FiBookOpen, FiClock, FiCalendar } from "react-icons/fi";
import { motion } from "framer-motion";

const Dashboard = () => {
  const [teacherCourses, setTeacherCourses] = useState<any[]>([]);
  const [loadingTeacher, setLoadingTeacher] = useState(true);

  useEffect(() => {
    const fetchTeacherCourses = async () => {
      try {
        const teacherResponse: any = await getFetch("/user/teacher/course/all");

        if (!teacherResponse?.success || !teacherResponse.data?.courseList) {
          console.error("Failed to fetch courses or no courses found");
          return;
        }

        // Filter only courses where published = true
        const filteredCourses = teacherResponse.data.courseList.filter(
          (course: any) => course.published === true
        );

        setTeacherCourses(filteredCourses);
      } catch (error) {
        console.error("Error fetching teacher courses:", error);
      } finally {
        setLoadingTeacher(false);
      }
    };

    fetchTeacherCourses();
  }, []);

  const CourseCard = ({ course }: { course: any }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col"
    >
      {/* Course Banner */}
      {course.banner && (
        <img
          src={course.banner}
          alt="Course banner"
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
      )}

      {/* Course Title & Description */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
        {course.title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">
        {course.description}
      </p>

      {/* Course Metadata */}
      <div className="mt-4 space-y-2 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <FiUsers className="text-gray-500" />
          <span>
            {course.enrolledStudentIds?.length || 0} students enrolled
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FiClock className="text-gray-500" />
          <span>
            Last active: {new Date(course.lastActive).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FiCalendar className="text-gray-500" />
          <span>
            Created on: {new Date(course.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Tags */}
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
          {/* Section Title */}
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
            <FiBookOpen className="text-blue-600 dark:text-blue-400 text-3xl" />
            Your Published Courses
          </h3>

          {/* Courses Grid / Loading State */}
          {loadingTeacher ? (
            <div className="flex justify-center items-center py-16">
              <span className="text-gray-600 dark:text-gray-300 text-lg">
                Loading your courses...
              </span>
            </div>
          ) : teacherCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {teacherCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center bg-gray-100 dark:bg-gray-800 p-8 rounded-lg shadow-md">
              <FiBookOpen className="text-gray-400 text-5xl mb-4" />
              <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
                You haven't published any courses yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Manage Courses Section */}
      <div className="w-full bg-gray-50 dark:bg-gray-900 py-10">
        <div className="max-w-6xl mx-auto px-6">
          <ManageCourses />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
