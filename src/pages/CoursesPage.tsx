import { useEffect, useState } from "react";
import { getFetch } from "../utils/apiCall";
import { FiUsers, FiArrowRight, FiSearch } from "react-icons/fi";
import { motion } from "framer-motion";

const CoursesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [loadingAll, setLoadingAll] = useState(true);

  // Fetch all courses
  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        const response: any = await getFetch("/user/teacher/course/all");
        console.log("API Response:", response);

        if (response?.success && Array.isArray(response.data?.courseList)) {
          // Show all courses (remove filter) or only published ones (keep filter)
          setAllCourses(response.data.courseList);
        } else {
          console.error("Unexpected response format:", response);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoadingAll(false);
      }
    };

    fetchAllCourses();
  }, []);

  // Filter courses based on search query
  const filteredCourses = allCourses.filter((course) =>
    searchQuery.trim() === ""
      ? true
      : course._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.teacher?.name &&
          course.teacher.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        course.tags?.some((tag: string) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
  );

  return (
    <div className="p-6">
      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-6">
        <h2 className="text-2xl font-bold mb-4">Explore Courses</h2>
        <div className="relative">
          <FiSearch className="absolute left-4 top-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses by title, teacher, tags or ID..."
            className="w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
          />
        </div>
      </div>

      {/* Page Title */}
      <h3 className="text-xl font-bold mb-4">All Courses</h3>

      {/* Display Courses */}
      {loadingAll ? (
        <div className="text-center py-8">Loading courses...</div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <motion.div
              key={course._id}
              className="p-4 border rounded-lg shadow-md bg-white dark:bg-gray-900"
              whileHover={{ scale: 1.02 }}
            >
              <img
                src={course.banner}
                alt={course.title}
                className="w-full h-40 object-cover rounded-md"
              />
              <h4 className="text-lg font-semibold mt-4">{course.title}</h4>
              <p className="text-sm text-gray-500 mt-2">
                {course.description || "No description available"}
              </p>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiUsers className="text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {course.enrolledStudentIds?.length || 0} students enrolled
                  </span>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                  Join Course
                  <FiArrowRight />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl text-center">
          No courses found matching your search
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
