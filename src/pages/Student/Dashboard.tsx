import { useState } from "react";
import { motion } from "framer-motion";
import { Combobox } from "@headlessui/react";

// Course Interface
interface Course {
  id: string;
  code: string;
  name: string;
  instructor: string;
  joined: boolean;
}

// Mock Courses
const allCourses: Course[] = [
  {
    id: "1",
    code: "CS101",
    name: "Intro to Computer Science",
    instructor: "Dr. Smith",
    joined: false,
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
    joined: false,
  },
];

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState(allCourses);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>(
    allCourses.filter((c) => c.joined)
  );

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
      {/* Navigation */}
      <nav className="bg-blue-600 dark:bg-blue-800 p-5 text-white shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {/* Welcome Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-semibold mb-2">
            Welcome back, Student!
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Find and join courses easily.
          </p>
        </motion.section>

        {/* Course Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <div className="relative w-full max-w-md mx-auto">
            <Combobox
              as="div"
              onChange={(course: Course) => joinCourse(course.id)}
            >
              <Combobox.Input
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Search course code..."
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Combobox.Options className="absolute mt-2 w-full bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <Combobox.Option
                      key={course.id}
                      value={course}
                      className={({ active }) =>
                        `p-3 cursor-pointer transition ${
                          active
                            ? "bg-blue-500 text-white"
                            : "text-gray-800 dark:text-gray-200"
                        }`
                      }
                    >
                      {course.code} - {course.name}
                    </Combobox.Option>
                  ))
                ) : (
                  <div className="p-3 text-gray-600 dark:text-gray-400">
                    No matching courses
                  </div>
                )}
              </Combobox.Options>
            </Combobox>
          </div>
        </motion.div>

        {/* Enrolled Courses */}
        <section className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">Your Courses</h3>
          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-5 rounded-lg bg-white dark:bg-gray-800 shadow-md border cursor-pointer border-gray-200 dark:border-gray-700"
                >
                  <h4 className="text-xl font-medium text-blue-600 dark:text-blue-400 mb-2">
                    {course.code}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-1">
                    {course.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {course.instructor}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              You're not enrolled in any courses yet.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
