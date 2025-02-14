import { useState } from "react";
import { motion } from "framer-motion";
import { Combobox } from "@headlessui/react";

interface Course {
  id: string;
  code: string;
  name: string;
  instructor: string;
  joined: boolean;
}

const allCourses: Course[] = [
  {
    id: "1",
    code: "CS101",
    name: "Intro to Computer Science",
    instructor: "Dr. Smith",
    joined: true,
  },
  {
    id: "2",
    code: "MATH201",
    name: "Calculus II",
    instructor: "Prof. Johnson",
    joined: true,
  },
  {
    id: "3",
    code: "PHY301",
    name: "Modern Physics",
    instructor: "Dr. Williams",
    joined: true,
  },
];

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState(allCourses);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>(
    allCourses.filter((c) => c.joined)
  );
  const [showEnrollSection, setShowEnrollSection] = useState(false);

  const filteredCourses =
    searchQuery === ""
      ? courses
      : courses.filter((course) =>
          course.code.toLowerCase().includes(searchQuery.toLowerCase())
        );

  const joinCourse = (courseId: string) => {
    setCourses((prev) =>
      prev.map((course) =>
        course.id === courseId ? { ...course, joined: true } : course
      )
    );

    const courseToJoin = courses.find((course) => course.id === courseId);
    if (courseToJoin && !enrolledCourses.find((c) => c.id === courseId)) {
      setEnrolledCourses((prev) => [
        ...prev,
        { ...courseToJoin, joined: true },
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-gray-100">
      <nav className="bg-blue-600 dark:bg-blue-800 p-5 text-white shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
        </div>
      </nav>

      <main className="container mx-auto p-6">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h2 className="text-3xl font-semibold mb-4">
            Welcome back, Student!
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowEnrollSection(!showEnrollSection)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {showEnrollSection ? "Close Enrollment" : "Enroll in Course"}
          </motion.button>
        </motion.section>

        {showEnrollSection && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="max-w-2xl mx-auto">
              <Combobox
                as="div"
                onChange={(course: Course) => joinCourse(course.id)}
              >
                <Combobox.Input
                  className="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Search for courses by code..."
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Combobox.Options className="absolute mt-2 w-full max-w-2xl bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden ring-1 ring-black/5">
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                      <Combobox.Option
                        key={course.id}
                        value={course}
                        className={({ active }) =>
                          `p-4 transition-colors ${
                            active
                              ? "bg-blue-500 text-white"
                              : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`
                        }
                      >
                        <span className="font-semibold">{course.code}</span>
                        <span className="block text-sm mt-1">
                          {course.name}
                        </span>
                        <span className="block text-xs opacity-75 mt-1">
                          {course.instructor}
                        </span>
                      </Combobox.Option>
                    ))
                  ) : (
                    <div className="p-4 text-gray-600 dark:text-gray-400">
                      No courses found matching "{searchQuery}"
                    </div>
                  )}
                </Combobox.Options>
              </Combobox>
            </div>
          </motion.div>
        )}
        <section className="p-4 mx-auto">
          <h3 className="text-2xl font-semibold mb-6">Your Enrolled Courses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.length > 0 ? (
              enrolledCourses.map((course) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
                        {course.code}
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 mb-2">
                        {course.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {course.instructor}
                      </p>
                    </div>
                    <span className="px-3 py-1 text-sm bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 rounded-full">
                      Enrolled
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-600 dark:text-gray-400">
                You're not enrolled in any courses yet. Search above to get
                started!
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
