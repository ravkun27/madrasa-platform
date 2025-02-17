import { useState } from "react";
import { motion } from "framer-motion";
import { FaCopy, FaYoutube, FaFileAlt, FaLink, FaImages } from "react-icons/fa"; // Icons for content types

interface Content {
  type: "youtube" | "quiz" | "lecture" | "zoom";
  data: string;
}

interface Post {
  name: string;
  content: Content[];
}

interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  banner: string | null; // URL for the course banner
  posts: Post[]; // Multiple posts for the course
}

export default function CreateCoursePage({
  onSubmit,
}: {
  onSubmit: (course: Course) => void;
}) {
  const [course, setCourse] = useState<Course>({
    id: Math.random().toString(),
    name: "",
    code: "67ab16b840f42cd525015fc4", // Generate course code automatically
    description: "",
    banner: null,
    posts: [],
  });
  const [currentPostIndex, setCurrentPostIndex] = useState<number | null>(null); // Track which post is being edited
  const [contentType, setContentType] = useState<Content["type"]>("youtube");
  const [contentData, setContentData] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle adding content to a post
  const handleAddContent = () => {
    if (!contentData.trim()) return;
    if (currentPostIndex === null) return;

    const updatedPosts = [...course.posts];
    updatedPosts[currentPostIndex].content.push({
      type: contentType,
      data: contentData,
    });

    setCourse({ ...course, posts: updatedPosts });
    setContentData("");
    setIsModalOpen(false); // Close modal after adding content
  };

  // Handle adding a new post
  const handleAddPost = () => {
    const newPost: Post = {
      name: `Post-${course.posts.length + 1}`,
      content: [],
    };
    setCourse({ ...course, posts: [...course.posts, newPost] });
  };

  // Handle submitting the course
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(course);
  };

  // Handle copying the course code
  const copyCourseCode = () => {
    navigator.clipboard.writeText(course.code).then(() => {
      alert("Course code copied to clipboard!");
    });
  };

  // Handle banner upload
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCourse({ ...course, banner: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
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
          {/* Course Banner Upload */}
          <div>
            <label className="block mb-2 text-text dark:text-text-dark">
              Course Banner
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              className="p-2 rounded-lg bg-white dark:bg-gray-800"
            />
            {course.banner && (
              <img
                src={course.banner}
                alt="Course Banner"
                className="mt-2 rounded-lg w-full h-48 object-cover"
              />
            )}
          </div>

          {/* Course Name and Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Course Name"
              className="p-2 rounded-lg bg-white dark:bg-gray-800"
              value={course.name}
              onChange={(e) => setCourse({ ...course, name: e.target.value })}
              required
            />
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

          {/* Course Description */}
          <textarea
            placeholder="Course Description"
            className="w-full p-2 rounded-lg bg-white dark:bg-gray-800"
            value={course.description}
            onChange={(e) =>
              setCourse({ ...course, description: e.target.value })
            }
            rows={3}
          />

          {/* Add New Post Button */}
          <button
            type="button"
            onClick={handleAddPost}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Add New Post
          </button>

          {/* Display Posts */}
          {course.posts.map((post, postIndex) => (
            <div key={postIndex} className="space-y-4">
              <h3 className="text-xl font-semibold text-text dark:text-text-dark">
                {post.name}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Icons for Adding Content */}
                <div
                  className="flex flex-col items-center p-4 rounded-lg bg-white dark:bg-gray-800 cursor-pointer text-text-dark"
                  onClick={() => {
                    setCurrentPostIndex(postIndex);
                    setIsModalOpen(true);
                  }}
                >
                  <FaYoutube className="text-2xl mb-2 " />
                  <span>YouTube</span>
                </div>
                <div
                  className="flex flex-col items-center p-4 rounded-lg bg-white dark:bg-gray-800 cursor-pointer text-text-dark"
                  onClick={() => {
                    setCurrentPostIndex(postIndex);
                    setIsModalOpen(true);
                  }}
                >
                  <FaFileAlt className="text-2xl mb-2" />
                  <span>Lecture</span>
                </div>
                <div
                  className="flex flex-col items-center p-4 rounded-lg bg-white dark:bg-gray-800 cursor-pointer text-text-dark"
                  onClick={() => {
                    setCurrentPostIndex(postIndex);
                    setIsModalOpen(true);
                  }}
                >
                  <FaLink className="text-2xl mb-2" />
                  <span>Zoom</span>
                </div>
                <div
                  className="flex flex-col items-center p-4 rounded-lg bg-white dark:bg-gray-800 cursor-pointer text-text-dark"
                  onClick={() => {
                    setCurrentPostIndex(postIndex);
                    setIsModalOpen(true);
                  }}
                >
                  <FaImages className="text-2xl mb-2" />
                  <span>Quiz</span>
                </div>
              </div>

              {/* Display Added Content */}
              <div className="space-y-2">
                {post.content.map((item, contentIndex) => (
                  <div
                    key={contentIndex}
                    className="p-3 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <strong className="capitalize">{item.type}:</strong>{" "}
                    {item.data}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            Create Course
          </button>
        </form>

        {/* Modal for Adding Content */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
              <h3 className="text-xl font-semibold mb-4">Add Content</h3>
              <select
                className="p-2 rounded-lg bg-white dark:bg-gray-800 text-text dark:text-text-dark w-full mb-4"
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
                className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 mb-4"
                value={contentData}
                onChange={(e) => setContentData(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddContent}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
