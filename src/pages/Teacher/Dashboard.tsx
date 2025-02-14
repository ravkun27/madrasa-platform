import { useState } from "react";
import CreateCourse from "./CreateCourses"; // Import the new component
import { motion } from "framer-motion";

// Define the Course interface
interface Content {
  type: "youtube" | "quiz" | "lecture" | "zoom";
  data: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  content: Content[];
}

export default function TeacherDashboard() {
  const [isApproved, setIsApproved] = useState(true); // Assuming the teacher is approved
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCreateCoursePage, setShowCreateCoursePage] = useState(false);

  const handleCreateCourse = (newCourse: Course) => {
    setCourses([...courses, newCourse]);
    setShowCreateCoursePage(false); // Return to dashboard after creating the course
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

  if (showCreateCoursePage) {
    return <CreateCourse onSubmit={handleCreateCourse} />;
  }

  return (
    <div className="min-h-screen dark:bg-gray-900 dark:text-gray-100">
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
          <button
            onClick={() => setShowCreateCoursePage(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Create Course
          </button>
        </motion.section>

        {/* Display Existing Courses */}
        <section className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">Your Courses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="p-6 rounded-xl bg-secondary-100 dark:bg-secondary-800"
              >
                <h4 className="text-xl font-medium mb-2">
                  {course.code} - {course.name}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {course.description}
                </p>
                <div className="space-y-2">
                  {course.content.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg bg-white dark:bg-gray-800"
                    >
                      <strong className="capitalize">{item.type}:</strong>{" "}
                      {item.data}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
