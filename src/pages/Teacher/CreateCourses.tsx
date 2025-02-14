import { useState } from "react";
import { motion } from "framer-motion";
import { FaCopy } from "react-icons/fa"; // Copy icon from react-icons

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

export default function CreateCoursePage({
  onSubmit,
}: {
  onSubmit: (course: Course) => void;
}) {
  const [course, setCourse] = useState({
    name: "",
    code: "67ab16b840f42cd525015fc4", // Generate course code automatically
    description: "",
    content: [] as Content[],
  });
  const [contentType, setContentType] = useState<Content["type"]>("youtube");
  const [contentData, setContentData] = useState("");

  const handleAddContent = () => {
    if (!contentData.trim()) return;
    setCourse({
      ...course,
      content: [...course.content, { type: contentType, data: contentData }],
    });
    setContentData("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCourse: Course = {
      id: Math.random().toString(),
      ...course,
    };
    onSubmit(newCourse);
  };

  const copyCourseCode = () => {
    navigator.clipboard.writeText(course.code).then(() => {
      alert("Course code copied to clipboard!");
    });
  };
  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h2 className="text-3xl font-semibold mb-6 text-text dark:text-text-dark">
          Create New Course
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Course Name"
              className="p-2 rounded-lg bg-white dark:bg-gray-800"
              value={course.name}
              onChange={(e) => setCourse({ ...course, name: e.target.value })}
              required
            />
            {/* Course Code Tag with Copy Icon */}
            <div className="flex items-center gap-2 p-2 border-2 rounded-lg w-fit">
              <p className="text-orange-400">{course.code}</p>
              <button
                type="button"
                onClick={copyCourseCode}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                aria-label="Copy course code"
              >
                <FaCopy />
              </button>
            </div>
          </div>
          <textarea
            placeholder="Course Description"
            className="w-full p-2 rounded-lg bg-white dark:bg-gray-800"
            value={course.description}
            onChange={(e) =>
              setCourse({ ...course, description: e.target.value })
            }
            rows={3}
          />

          {/* Content Type Selection */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text dark:text-text-dark">
              Add Course Content
            </h3>
            <select
              className="p-2 rounded-lg bg-white dark:bg-gray-800 text-text dark:text-text-dark"
              value={contentType}
              onChange={(e) =>
                setContentType(e.target.value as Content["type"])
              }
            >
              <option value="youtube">YouTube Video</option>
              <option value="quiz">Quiz</option>
              <option value="lecture">Lecture File</option>
              <option value="zoom">Zoom Link</option>
            </select>

            {/* Content Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={
                  contentType === "youtube"
                    ? "Enter YouTube Video URL"
                    : contentType === "quiz"
                    ? "Upload Quiz File or Google Form Link"
                    : contentType === "lecture"
                    ? "Upload Lecture File"
                    : contentType === "zoom"
                    ? "Enter Zoom Meeting Link"
                    : "Add Notes (Text or Image)"
                }
                className="flex-1 p-2 rounded-lg bg-white dark:bg-gray-800"
                value={contentData}
                onChange={(e) => setContentData(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAddContent}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Add
              </button>
            </div>

            {/* Display Added Content */}
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

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            Create Course
          </button>
        </form>
      </motion.div>
    </div>
  );
}
