// CreateCoursePage.tsx
import { useState } from "react";

interface CreateCoursesProps {
  onSubmit: (newCourse: Course) => void;
  onCancel: () => void;
}

interface Course {
  id: string;
  name: string;
  banner: string; // Added banner field
  description: string;
  posts: Post[]; // Changed content to posts
}

interface Post {
  id: string;
  type: "video" | "quiz" | "zoom" | "lecture";
  content: string;
}

export function CreateCourses({ onSubmit, onCancel }: CreateCoursesProps) {
  const [newCourse, setNewCourse] = useState({
    name: "",
    banner: "", // Added banner state
    description: "",
    posts: [], // Initialize empty posts array
  });

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setNewCourse({ ...newCourse, banner: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...newCourse, id: Math.random().toString() }); // Generate a random ID for the course
  };

  return (
    <div className="min-h-screen dark:bg-gray-900 dark:text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Course</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Banner Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Course Banner/Icon
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-800"
            />
            {newCourse.banner && (
              <img
                src={newCourse.banner}
                alt="Course Banner"
                className="mt-4 w-32 h-32 object-cover rounded-lg"
              />
            )}
          </div>

          {/* Course Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Course Name
            </label>
            <input
              type="text"
              className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-800"
              value={newCourse.name}
              onChange={(e) =>
                setNewCourse({ ...newCourse, name: e.target.value })
              }
              required
            />
          </div>

          {/* Course Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-800 h-32"
              value={newCourse.description}
              onChange={(e) =>
                setNewCourse({ ...newCourse, description: e.target.value })
              }
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
            >
              Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
