import { useState } from "react";
import { CreateCourses } from "./CreateCoursePage";
import { ManageCourses } from "./ManageCoursesPage";
import { useCourseContext } from "../../context/CourseContext"; // Import the context
import { Course, NewCourse } from "../../types";

export default function TeacherDashboard() {
  const [showCreateCoursePage, setShowCreateCoursePage] = useState(false);
  const { addCourse } = useCourseContext(); // Get addCourse from context

  const handleCreateCourse = (newCourse: NewCourse) => {
    // Create a complete course object with default values
    const fullCourse: Course = {
      ...newCourse,
      isLocked: false,
      enrolledStudents: [],
    };
    addCourse(fullCourse);
    setShowCreateCoursePage(false);
  };

  return (
    <div className="min-h-screen dark:bg-gray-900 dark:text-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {showCreateCoursePage ? (
          <CreateCourses
            onSubmit={handleCreateCourse} // Pass the submit handler
            onCancel={() => setShowCreateCoursePage(false)}
          />
        ) : (
          <>
            <div className="mb-8 flex justify-between items-center">
              <h1 className="text-2xl md:text-3xl font-bold">My Courses</h1>
              <button
                onClick={() => setShowCreateCoursePage(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg text-sm md:text-base"
              >
                Create New Course
              </button>
            </div>
            <ManageCourses />
          </>
        )}
      </div>
    </div>
  );
}
