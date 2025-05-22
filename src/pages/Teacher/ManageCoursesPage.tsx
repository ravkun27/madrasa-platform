import { useEffect, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { getFetch, postFetch, putFetch } from "../../utils/apiCall";
import { Courses } from "./Courses";
import { Course } from "../../types";
import { useCourseActions } from "../../hooks/useCourseActions";
import { useCourses } from "../../context/CourseContext";
import toast from "react-hot-toast";
import { Loader2, Plus, X } from "lucide-react";

const shimmerAnimation = {
  initial: { opacity: 0.5 },
  animate: { opacity: 1 },
  exit: { opacity: 0.5 },
  transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
};

const ShimmerLoader = () => (
  <motion.div
    {...shimmerAnimation}
    className="h-32 w-full rounded-xl bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100"
  />
);

const ManageCoursesPage = () => {
  const [newCourse, setNewCourse] = useState<Partial<Course>>({});
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { setCourseList } = useCourseActions();
  const { courses, isLoading } = useCourses();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const createCourse = async () => {
    setIsCreating(true);
    if (!newCourse.title || !newCourse.description || !newCourse.banner) {
      toast.error("Please fill all fields");
      setIsCreating(false);
      return;
    }
    try {
      const result: any = await postFetch("/user/teacher/course", {
        title: newCourse.title,
        description: newCourse.description,
        category: newCourse.category,
        tags: newCourse.tags,
      });

      if (result.success) {
        const uploadUrlResult: any = await getFetch(
          `/user/teacher/course/getUpdateLink?filename=banner&contentType=image/jpeg&courseId=${result.data.course._id}`
        );

        if (uploadUrlResult?.success) {
          await fetch(uploadUrlResult.data.signedUrl, {
            method: "PUT",
            body: newCourse.banner,
          });

          await putFetch(
            `/user/teacher/course?courseId=${result.data.course._id}`,
            { banner: uploadUrlResult.data.fileKey }
          );

          setCourseList();
        }
        toast.success("Course created successfully");
      }
    } catch (error) {
      console.error("Error creating course:", error);
    }
    setIsCreating(false);
    setShowCourseForm(false);
    setNewCourse({});
  };

  useEffect(() => {
    setCourseList();
  }, []);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      if (tags.length < 5) {
        // Limit to 5 tags
        setTags([...tags, tagInput.trim()]);
      } else {
        toast.error("You can only add up to 5 tags.");
      }
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };
  return (
    <div className="min-h-screen p-4">
      <div className="flex items-center justify-center gap-4 md:gap-20 mb-8 flex-nowrap relative">
        <h1 className="md:text-2xl font-bold text-gray-500">Manage Courses</h1>

        <button
          onClick={() => setShowCourseForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition active:scale-95 font-medium shadow-md hover:shadow-lg text-sm md:text-2xl whitespace-nowrap"
        >
          Create New Course
        </button>
      </div>

      <AnimatePresence>
        {showCourseForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Create New Course
                </h2>
                <button
                  onClick={() => setShowCourseForm(false)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Course Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter a descriptive title"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none transition"
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, title: e.target.value })
                    }
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="What will students learn in this course?"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-24 outline-none resize-none transition"
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Course Category
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none transition"
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, category: e.target.value })
                    }
                  >
                    <option value="">Select Subject</option>

                    <optgroup label="Math">
                      <option value="Math">Math</option>
                    </optgroup>

                    <optgroup label="Science">
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="Science">Science</option>
                    </optgroup>

                    <optgroup label="Languages">
                      <option value="English">English</option>
                      <option value="French">French</option>
                      <option value="Arabic">Arabic</option>
                      <option value="German">German</option>
                    </optgroup>

                    <optgroup label="Business & Economics">
                      <option value="Economy">Economy</option>
                      <option value="Business">Business</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Accounting">Accounting</option>
                    </optgroup>

                    <optgroup label="Technology">
                      <option value="Coding">Coding</option>
                      <option value="Technology">Technology</option>
                      <option value="Engineering">Engineering</option>
                    </optgroup>

                    <optgroup label="Medical">
                      <option value="Medicine">Medicine</option>
                      <option value="Pharmacy">Pharmacy</option>
                      <option value="Dentistry">Dentistry</option>
                    </optgroup>

                    <optgroup label="Arts & Personal Growth">
                      <option value="Arts">Arts</option>
                      <option value="Personal development">
                        Personal development
                      </option>
                    </optgroup>

                    <optgroup label="Others">
                      <option value="Others">Others</option>
                    </optgroup>
                  </select>
                </div>

                {/* Banner Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Banner Image
                  </label>
                  <div className="flex justify-center items-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          ></path>
                        </svg>
                        <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                          Click to upload
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          SVG, PNG, JPG (MAX. 800x400px)
                        </p>
                        {newCourse.banner && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            Selected: {newCourse.banner.name}
                          </p>
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) =>
                          setNewCourse({
                            ...newCourse,
                            banner: e.target.files?.[0],
                          })
                        }
                      />
                    </label>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tags
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleAddTag())
                      }
                      placeholder="Add a tag and press Enter"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Tags Display */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-sm"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer/Buttons */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowCourseForm(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createCourse}
                  disabled={isCreating}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Course</span>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <LayoutGroup>
        <div className="flex flex-col gap-4 items-center justify-center">
          <div className="max-w-3xl">
            {isLoading ? (
              Array(3)
                .fill(0)
                .map((_, idx) => (
                  <motion.div key={idx} layout>
                    <ShimmerLoader />
                  </motion.div>
                ))
            ) : (
              <AnimatePresence>
                {courses.map((course) => (
                  <motion.div
                    key={course._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="mb-4 md:mb-8 max-w-3xl"
                  >
                    <Courses course={course} />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </LayoutGroup>
    </div>
  );
};
export default ManageCoursesPage;
