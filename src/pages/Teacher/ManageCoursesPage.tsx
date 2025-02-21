import { useState } from "react";

interface Course {
  id: string;
  name: string;
  banner: string;
  description: string;
  posts: Post[];
}

interface Post {
  id: string;
  type: "video" | "quiz" | "zoom" | "lecture";
  content: string;
}

export function ManageCourses({
  courses,
  setCourses,
}: {
  courses: Course[];
  setCourses: (courses: Course[]) => void;
}) {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [newPost, setNewPost] = useState<{
    type: Post["type"];
    content: string;
  }>({
    type: "video",
    content: "",
  });

  // Tuple of valid post types
  const postTypes = ["video", "quiz", "zoom", "lecture"] as const;

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value as Post["type"];
    setNewPost({ ...newPost, type: selectedType });
  };

  const toggleCourse = (courseId: string) => {
    setSelectedCourse(selectedCourse === courseId ? null : courseId);
  };

  const addPost = (courseId: string) => {
    const post: Post = {
      id: Math.random().toString(),
      type: newPost.type,
      content: newPost.content,
    };

    setCourses(
      courses.map((course) =>
        course.id === courseId
          ? { ...course, posts: [...course.posts, post] }
          : course
      )
    );

    setNewPost({ type: "video", content: "" }); // Reset form
  };

  const deletePost = (courseId: string, postId: string) => {
    setCourses(
      courses.map((course) =>
        course.id === courseId
          ? { ...course, posts: course.posts.filter((p) => p.id !== postId) }
          : course
      )
    );
  };

  return (
    <div className="min-h-screen dark:bg-gray-900 dark:text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Edit Courses</h1>

        {/* Course List */}
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-secondary-100 dark:bg-secondary-800 rounded-lg overflow-hidden"
            >
              {/* Course Header */}
              <button
                onClick={() => toggleCourse(course.id)}
                className="w-full p-4 flex justify-between items-center"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={course.banner}
                    alt={course.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <h2 className="text-xl font-semibold">{course.name}</h2>
                </div>
                <span>{selectedCourse === course.id ? "▲" : "▼"}</span>
              </button>

              {/* Course Content (Accordion) */}
              {selectedCourse === course.id && (
                <div className="p-4 space-y-6">
                  {/* Add Post Form */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Add New Post</h3>
                    <select
                      value={newPost.type}
                      onChange={handleTypeChange}
                      className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700"
                    >
                      {postTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
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
                      onClick={() => addPost(course.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Add Post
                    </button>
                  </div>

                  {/* Posts List */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Posts</h3>
                    {course.posts.map((post) => (
                      <div
                        key={post.id}
                        className="bg-gray-100 dark:bg-gray-700 p-4 rounded"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium capitalize">
                            {post.type}
                          </h4>
                          <button
                            onClick={() => deletePost(course.id, post.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">
                          {post.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
