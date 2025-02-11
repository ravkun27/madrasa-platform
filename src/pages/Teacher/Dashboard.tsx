// src/TeacherDashboard.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Combobox } from "@headlessui/react";

interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  students: Student[];
}

interface Student {
  id: string;
  name: string;
  email: string;
}

export default function TeacherDashboard() {
  const [isApproved, setIsApproved] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [newCourse, setNewCourse] = useState({
    name: "",
    code: "",
    description: "",
  });
  const [searchStudent, setSearchStudent] = useState("");

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const course: Course = {
      id: Math.random().toString(),
      ...newCourse,
      students: [],
    };
    setCourses([...courses, course]);
    setNewCourse({ name: "", code: "", description: "" });
  };

  const addStudentToCourse = (courseId: string, student: Student) => {
    setCourses(
      courses.map((course) =>
        course.id === courseId
          ? { ...course, students: [...course.students, student] }
          : course
      )
    );
  };

  if (!isApproved) {
    return (
      <div className={`min-h-screen `}>
        <div className="dark:bg-gray-900 dark:text-gray-100 p-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto mt-20"
          >
            <h2 className="text-3xl font-semibold mb-4">Approval Pending</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Your account is awaiting administrator approval. You'll gain
              access to the dashboard features once approved.
            </p>
            <motion.div
              animate={{ rotate: [0, 180, 360] }} // Rotate animation
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} // Smooth looping
            >
              <div className="text-4xl">⏳</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen`}>
      <div className="dark:bg-gray-900 dark:text-gray-100">
        <nav className="bg-primary-600 dark:bg-primary-800 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
          </div>
        </nav>

        <main className="container mx-auto p-4">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-semibold mb-4">Welcome, Professor!</h2>
          </motion.section>

          {/* Create Course Form */}
          <section className="mb-8 p-6 bg-secondary-100 dark:bg-secondary-800 rounded-xl">
            <h3 className="text-2xl font-semibold mb-4">Create New Course</h3>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Course Name"
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
                  value={newCourse.name}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, name: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Course Code"
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
                  value={newCourse.code}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, code: e.target.value })
                  }
                  required
                />
              </div>
              <textarea
                placeholder="Course Description"
                className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
                value={newCourse.description}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, description: e.target.value })
                }
                rows={3}
              />
              <button
                type="submit"
                className="bg-accent-500 hover:bg-accent-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Create Course
              </button>
            </form>
          </section>

          {/* Teacher's Courses */}
          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">Your Courses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-xl bg-secondary-100 dark:bg-secondary-800"
                >
                  <h4 className="text-xl font-medium mb-2">
                    {course.code} - {course.name}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {course.description}
                  </p>
                  <div className="mb-4">
                    <h5 className="font-semibold mb-2">
                      Students ({course.students.length})
                    </h5>
                    <Combobox
                      as="div"
                      className="relative"
                      onChange={(student: Student) =>
                        addStudentToCourse(course.id, student)
                      }
                    >
                      <Combobox.Input
                        className="w-full p-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700"
                        placeholder="Add student by email"
                        onChange={(e) => setSearchStudent(e.target.value)}
                      />
                      <Combobox.Options className="absolute mt-1 w-full bg-white dark:bg-gray-700 rounded-lg shadow-lg">
                        {students
                          .filter((student) =>
                            student.email
                              .toLowerCase()
                              .includes(searchStudent.toLowerCase())
                          )
                          .map((student) => (
                            <Combobox.Option
                              key={student.id}
                              value={student}
                              className={({ active }) =>
                                `p-2 cursor-pointer text-sm ${
                                  active ? "bg-primary-500 text-white" : ""
                                }`
                              }
                            >
                              {student.name} ({student.email})
                            </Combobox.Option>
                          ))}
                      </Combobox.Options>
                    </Combobox>
                  </div>
                  <div className="space-y-2">
                    {course.students.map((student) => (
                      <div
                        key={student.id}
                        className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded"
                      >
                        <span>{student.name}</span>
                        <button className="text-red-500 hover:text-red-600">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
