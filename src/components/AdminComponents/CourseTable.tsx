import React from "react";

// Define the Course type
type Course = {
  _id: string;
  title: string;
  description?: string;
  createdAt: string;
  deletedAt?: string;
  active: boolean;
  published?: boolean;
  enrolledStudentIds?: string[];
};

// Define the props type
interface CoursesTableProps {
  courses: Course[];
}

// Function to get the course status
const getCourseStatus = (course: Course): string => {
  if (!course.active) return "Deleted";

  return course.published ? "Published" : "Draft";
};

const CoursesTable: React.FC<CoursesTableProps> = ({ courses }) => {
  // Process and filter courses
  const processedCourses = courses.sort((a, b) => {
    // Sort deleted courses first, by deletion date (newest first)
    if (!a.active && !b.active) {
      return (
        new Date(b.deletedAt || 0).getTime() -
        new Date(a.deletedAt || 0).getTime()
      );
    }
    return a.active ? 1 : -1;
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            <th className="p-3 text-left">Title</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Created</th>
            <th className="p-3 text-left">Deleted</th>
            <th className="p-3 text-left">Students</th>
          </tr>
        </thead>
        <tbody>
          {processedCourses.map((course) => (
            <tr
              key={course._id}
              className="border-t border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <td className="p-3">{course.title}</td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    getCourseStatus(course) === "Published"
                      ? "bg-green-100 text-green-800"
                      : getCourseStatus(course) === "Deleted"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100"
                  }`}
                >
                  {getCourseStatus(course)}
                </span>
              </td>
              <td className="p-3">
                {new Date(course.createdAt).toLocaleDateString()}
              </td>
              <td className="p-3 text-red-600">
                {!course.active && course.deletedAt
                  ? new Date(course.deletedAt).toLocaleDateString()
                  : "-"}
              </td>
              <td className="p-3">{course.enrolledStudentIds?.length || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CoursesTable;
