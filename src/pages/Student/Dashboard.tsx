// src/App.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Combobox } from "@headlessui/react";

// Define course interface
interface Course {
  id: string;
  code: string;
  name: string;
  instructor: string;
  joined: boolean;
}

// Mock data
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
    allCourses.filter((course) => course.joined)
  );

  const filteredCourses =
    searchQuery === ""
      ? courses
      : courses.filter((course) =>
          course.code.toLowerCase().includes(searchQuery.toLowerCase())
        );

  const joinCourse = (courseId: string) => {
    setCourses(
      courses.map((course) =>
        course.id === courseId ? { ...course, joined: true } : course
      )
    );
    const courseToJoin = courses.find((course) => course.id === courseId);
    if (courseToJoin) {
      setEnrolledCourses([
        ...enrolledCourses,
        { ...courseToJoin, joined: true },
      ]);
    }
  };

  return (
    <div className={`min-h-screen`}>
      <div className="dark:bg-gray-900 dark:text-gray-100">
        {/* Navigation Bar */}
        <nav className="bg-primary-600 dark:bg-primary-800 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Student Dashboard</h1>
          </div>
        </nav>

        <main className="container mx-auto p-4">
          {/* Welcome Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-semibold mb-2">
              Welcome back, Student!
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Continue your learning journey
            </p>
          </motion.section>

          {/* Course Search */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <Combobox
              as="div"
              className="relative"
              onChange={(course: Course) => joinCourse(course.id)}
            >
              <Combobox.Input
                className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-accent-500"
                placeholder="Search course code..."
                displayValue={(course: Course) => course?.code}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Combobox.Options className="absolute mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg max-h-60 overflow-auto">
                {filteredCourses.map((course) => (
                  <Combobox.Option
                    key={course.id}
                    value={course}
                    className={({ active }) =>
                      `p-3 cursor-pointer ${
                        active ? "bg-primary-500 text-white" : ""
                      }`
                    }
                  >
                    {course.code} - {course.name}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </Combobox>
          </motion.div>

          {/* Enrolled Courses */}
          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">Your Courses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledCourses.map((course) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-xl bg-secondary-100 dark:bg-secondary-800"
                >
                  <h4 className="text-xl font-medium mb-2">{course.code}</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    {course.name}
                  </p>
                  <p className="text-sm text-accent-500 dark:text-accent-400">
                    {course.instructor}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
