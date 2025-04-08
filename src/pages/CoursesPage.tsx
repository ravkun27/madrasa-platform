import { useEffect, useState } from "react";
import { getFetch } from "../utils/apiCall";
import { FiArrowRight, FiSearch, FiMail } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [teacherCourses, setTeacherCourses] = useState<Course[]>([]);
  const [expandedTeacherId, setExpandedTeacherId] = useState<string | null>(
    null
  );
  const [loadingAll, setLoadingAll] = useState(true);
  const [loadingTeacherCourses, setLoadingTeacherCourses] = useState(false);

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
        setLoadingAll(false);
      }
    };

    fetchAllCourses();
  }, []);

  const handleTeacherExpand = async (teacherId: any) => {
    if (expandedTeacherId === teacherId) {
      setExpandedTeacherId(null); // Close if already expanded
      return;
    }

    setExpandedTeacherId(teacherId); // Set expanded teacher ID

    try {
      setLoadingTeacherCourses(true);
      const response: any = await getFetch(
        `/public/course/byTeacher/${teacherId}`
      );
      if (response?.success) {
        setTeacherCourses(response.data);
      }
    } catch (error) {
      console.error("Error fetching teacher courses:", error);
    } finally {
      setLoadingTeacherCourses(false);
    }
  };

  const filteredCourses = allCourses.filter((course) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    const teacherName: any = `${course.teacherId?.firstName || ""} ${
      course.teacherId?.lastName || ""
    }`.toLowerCase();

    return (
      course?._id?.toString().includes(query) ||
      course.title?.toLowerCase().includes(query) ||
      teacherName.includes(query) ||
      course.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  return (
    <div className="p-3 md:p-6 max-w-5xl mx-auto">
      {/* Search Section */}
      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-sm mb-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4">Explore Courses</h2>
        <div className="relative">
          <FiSearch className="absolute left-3 md:left-4 top-3 md:top-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses by title, teacher, tags or ID..."
            className="w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Courses Grid */}
      <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6">All Courses</h3>

      {loadingAll ? (
        <div className="text-center py-8">Loading courses...</div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          {filteredCourses.map((course) => (
            <motion.div
              key={course._id}
              layout
              className="p-3 md:p-4 border rounded-lg shadow-md bg-white dark:bg-gray-900 relative overflow-hidden"
            >
              <motion.div layout>
                {course.banner && (
                  <img
                    src={course.banner}
                    alt={course.title}
                    className="w-full h-32 md:h-40 object-cover rounded-md mb-3 md:mb-4"
                  />
                )}

                <h4 className="text-base md:text-lg font-semibold">
                  {course.title}
                </h4>
                <p className="text-xs md:text-sm text-gray-500 mt-2 line-clamp-2">
                  {course.description || "No description available"}
                </p>

                {/* Teacher Info */}
                <div className="mt-3 md:mt-4 space-y-1">
                  <div className="flex items-center gap-2 text-xs md:text-sm">
                    <FiMail className="text-gray-500" />
                    <span>
                      {course.teacherId?.firstName} {course.teacherId?.lastName}
                    </span>
                  </div>

                  <div className="text-xs md:text-sm text-gray-500">
                    Contact: {course.teacherId?.phoneNumber} (
                    {course.teacherId?.TelegramOrWhatsapp})
                  </div>
                </div>

                {/* Expand Button */}
                <div className="mt-3 md:mt-4 flex justify-end">
                  <motion.div
                    animate={{
                      rotate:
                        expandedTeacherId === course.teacherId?._id ? 90 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="cursor-pointer p-1"
                    onClick={() => handleTeacherExpand(course.teacherId?._id)}
                  >
                    <FiArrowRight className="text-gray-500 hover:text-indigo-500" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Expanded Courses */}
              <AnimatePresence>
                {expandedTeacherId === course.teacherId?._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200"
                  >
                    <h5 className="text-sm md:text-base font-medium mb-2">
                      More courses by {course.teacherId?.firstName}{" "}
                      {course.teacherId?.lastName}:
                    </h5>
                    {loadingTeacherCourses ? (
                      <div className="text-xs md:text-sm text-gray-500 py-2">
                        Loading...
                      </div>
                    ) : teacherCourses.length > 0 ? (
                      <div className="space-y-3">
                        {teacherCourses.map((teacherCourse) => (
                          <div
                            key={teacherCourse?._id}
                            className="flex items-start gap-3"
                          >
                            {teacherCourse.banner && (
                              <img
                                src={teacherCourse.banner}
                                alt={teacherCourse.title}
                                className="w-14 md:w-16 h-10 md:h-12 object-cover rounded flex-shrink-0"
                              />
                            )}
                            <div>
                              <p className="text-xs md:text-sm font-medium">
                                {teacherCourse.title}
                              </p>
                              <p className="text-xs text-gray-500 line-clamp-2">
                                {teacherCourse.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs md:text-sm text-gray-500 py-2">
                        No other courses found
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
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
