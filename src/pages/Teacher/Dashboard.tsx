import { useState } from "react";
import { CreateCourses } from "./CreateCoursePage";
import { ManageCourses } from "./ManageCoursesPage";

interface Post {
  id: string;
  type: "video" | "quiz" | "zoom" | "lecture";
  content: string;
}

interface Course {
  id: string;
  name: string;
  banner: string;
  description: string;
  posts: Post[];
}

export default function TeacherDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCreateCoursePage, setShowCreateCoursePage] = useState(false);

  const handleCreateCourse = (newCourse: Course) => {
    setCourses([...courses, newCourse]);
    setShowCreateCoursePage(false); // Navigate to EditCourses
  };

  if (showCreateCoursePage) {
    return (
      <CreateCourses
        onSubmit={handleCreateCourse}
        onCancel={() => setShowCreateCoursePage(false)}
      />
    );
  }

  return (
    <div className="min-h-screen dark:bg-gray-900 dark:text-gray-100 p-8">
      <button
        onClick={() => setShowCreateCoursePage(true)}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
      >
        Create Course
      </button>
      <ManageCourses courses={courses} setCourses={setCourses} />
    </div>
  );
}
