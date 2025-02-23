import { useState } from "react";
import { NewCourse } from "../../types";
import { useCourseContext } from "../../context/CourseContext";

interface CreateCoursesProps {
  onSubmit: (newCourse: NewCourse) => void;
  onCancel: () => void;
}

export function CreateCourses({ onCancel }: CreateCoursesProps) {
  const { addCourse } = useCourseContext();
  const [newCourse, setNewCourse] = useState<Omit<NewCourse, "id">>({
    name: "",
    banner: "",
    description: "",
    posts: [],
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
    addCourse({
      ...newCourse,
      id: Math.random().toString(), // Generate ID here or in context
    });
    onCancel();
  };

  return (
    <div className="min-h-screen dark:bg-gray-900 dark:text-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
          Create New Course
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Banner Upload */}
          <div className="space-y-2">
            <label className="block text-sm md:text-base font-medium">
              Course Banner/Icon
            </label>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                className="w-full md:w-auto p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
              />
              {newCourse.banner && (
                <img
                  src={newCourse.banner}
                  alt="Course Banner"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              )}
            </div>
          </div>

          {/* Course Name */}
          <div className="space-y-2">
            <label className="block text-sm md:text-base font-medium">
              Course Name
            </label>
            <input
              type="text"
              className="w-full p-2 md:p-3 rounded-lg bg-gray-100 dark:bg-gray-800"
              value={newCourse.name}
              onChange={(e) =>
                setNewCourse({ ...newCourse, name: e.target.value })
              }
              required
            />
          </div>

          {/* Course Description */}
          <div className="space-y-2">
            <label className="block text-sm md:text-base font-medium">
              Description
            </label>
            <textarea
              className="w-full p-2 md:p-3 rounded-lg bg-gray-100 dark:bg-gray-800 h-32"
              value={newCourse.description}
              onChange={(e) =>
                setNewCourse({ ...newCourse, description: e.target.value })
              }
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 md:px-6 md:py-3 rounded-lg bg-gray-500 hover:bg-gray-600 text-white text-sm md:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 md:px-6 md:py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm md:text-base"
            >
              Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
