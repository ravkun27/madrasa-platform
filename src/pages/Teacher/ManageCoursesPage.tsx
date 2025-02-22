import { useState } from "react";
import {
  FiLock,
  FiUnlock,
  FiVideo,
  FiFileText,
  FiFile,
  FiUsers,
  FiX,
} from "react-icons/fi";

interface Student {
  id: string;
  name: string;
  email: string;
}

interface CourseFile {
  id: string;
  name: string;
  type: "video" | "quiz" | "lecture" | "file";
  url: string;
}

interface Post {
  id: string;
  type: "video" | "quiz" | "zoom" | "lecture";
  content: string;
  files: CourseFile[];
}

interface Course {
  id: string;
  name: string;
  banner: string;
  description: string;
  isLocked: boolean;
  posts: Post[];
  enrolledStudents: Student[];
}

export function ManageCourses({
  courses,
  setCourses,
}: {
  courses: Course[];
  setCourses: (courses: Course[]) => void;
}) {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [newPost, setNewPost] = useState<{
    type: Post["type"];
    content: string;
  }>({
    type: "video",
    content: "",
  });

  // Toggle course lock
  const toggleCourseLock = (courseId: string) => {
    setCourses(
      courses.map((course) =>
        course.id === courseId
          ? { ...course, isLocked: !course.isLocked }
          : course
      )
    );
  };

  // Handle file upload
  const handleFileUpload = async (
    courseId: string,
    postId: string,
    type: CourseFile["type"]
  ) => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const newFile: CourseFile = {
          id: Math.random().toString(),
          name: file.name,
          type,
          url: URL.createObjectURL(file),
        };

        setCourses(
          courses.map((course) =>
            course.id === courseId
              ? {
                  ...course,
                  posts: course.posts.map((post) =>
                    post.id === postId
                      ? {
                          ...post,
                          files: [...post.files, newFile],
                        }
                      : post
                  ),
                }
              : course
          )
        );
      }
    };
    input.click();
  };

  // Handle file delete
  const handleFileDelete = (
    courseId: string,
    postId: string,
    fileId: string
  ) => {
    setCourses(
      courses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              posts: course.posts.map((post) =>
                post.id === postId
                  ? {
                      ...post,
                      files: post.files.filter((file) => file.id !== fileId),
                    }
                  : post
              ),
            }
          : course
      )
    );
  };

  // Course accordion content
  const renderCourseContent = (course: Course) => (
    <div className="p-4 space-y-6">
      {/* Course Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => toggleCourseLock(course.id)}
            className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {course.isLocked ? (
              <FiLock className="text-red-500" />
            ) : (
              <FiUnlock className="text-green-500" />
            )}
            {course.isLocked ? "Locked" : "Unlocked"}
          </button>
        </div>
      </div>

      {/* Enrolled Students */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <FiUsers /> Enrolled Students ({course.enrolledStudents?.length ?? 0})
        </h3>
        <div className="space-y-2">
          {course.enrolledStudents?.map((student) => (
            <div
              key={student.id}
              className="flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <span>{student.name}</span>
              <span className="text-gray-500 text-sm">{student.email}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Posts Section */}
      <div className="space-y-4">
        {course.posts?.map((post) => (
          <div
            key={post.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm"
          >
            <button
              onClick={() =>
                setSelectedPost(selectedPost === post.id ? null : post.id)
              }
              className="w-full p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex items-center gap-3">
                <span className="text-blue-500">
                  {post.type === "video" && <FiVideo />}
                  {post.type === "quiz" && <FiFileText />}
                  {post.type === "lecture" && <FiFile />}
                </span>
                <h3 className="font-medium capitalize">{post.type}</h3>
              </div>
              <span>{selectedPost === post.id ? "▲" : "▼"}</span>
            </button>

            {selectedPost === post.id && (
              <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                {/* Post Content */}
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  {post.content}
                </p>

                {/* Files Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {post.files?.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <span className="text-gray-500">
                        {file.type === "video" && <FiVideo />}
                        {file.type === "quiz" && <FiFileText />}
                        {file.type === "lecture" && <FiFile />}
                      </span>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-500 truncate"
                      >
                        {file.name}
                      </a>
                      <button
                        onClick={() =>
                          handleFileDelete(course.id, post.id, file.id)
                        }
                        className="ml-auto text-red-500 hover:text-red-600"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Quick Upload Buttons */}
                <div className="flex gap-3 mt-4">
                  {post.type !== "zoom" && (
                    <>
                      <button
                        onClick={() =>
                          handleFileUpload(course.id, post.id, "video")
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <FiVideo /> Upload Video
                      </button>
                      <button
                        onClick={() =>
                          handleFileUpload(course.id, post.id, "lecture")
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <FiFile /> Upload Notes
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Post Section */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Add New Post</h3>
        <div className="space-y-4">
          <select
            value={newPost.type}
            onChange={(e) =>
              setNewPost({ ...newPost, type: e.target.value as Post["type"] })
            }
            className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700"
          >
            <option value="video">Video</option>
            <option value="quiz">Quiz</option>
            <option value="zoom">Zoom</option>
            <option value="lecture">Lecture</option>
          </select>
          <textarea
            placeholder="Post Content"
            className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 h-32"
            value={newPost.content}
            onChange={(e) =>
              setNewPost({ ...newPost, content: e.target.value })
            }
          />
          <button
            onClick={() => {
              const newPostData: Post = {
                id: Math.random().toString(),
                type: newPost.type,
                content: newPost.content,
                files: [],
              };
              setCourses(
                courses.map((course) =>
                  course.id === selectedCourse
                    ? { ...course, posts: [...course.posts, newPostData] }
                    : course
                )
              );
              setNewPost({ type: "video", content: "" }); // Reset form
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Post
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen dark:bg-gray-900 dark:text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Course Management</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={course.banner}
                      alt={course.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <h2 className="text-xl font-semibold">{course.name}</h2>
                  </div>
                  <button
                    onClick={() =>
                      setSelectedCourse(
                        selectedCourse === course.id ? null : course.id
                      )
                    }
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    {selectedCourse === course.id ? "▲" : "▼"}
                  </button>
                </div>
              </div>

              {selectedCourse === course.id && renderCourseContent(course)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
