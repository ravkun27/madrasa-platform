import { useEffect, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { getFetch, postFetch, putFetch } from "../../utils/apiCall";
import { Courses } from "./Courses";
import { Course } from "../../types";
import { useCourseActions } from "../../hooks/useCourseActions";
import { useCourses } from "../../context/CourseContext";
import { FiPlus, FiX } from "react-icons/fi";
import toast from "react-hot-toast";

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
  const [isSuspended, setIsSuspended] = useState(false);
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
  const checkSuspended = async () => {
    try {
      const response: any = await getFetch("/user");
      if (response?.success) {
        console.log("Suspended status:", response.data.suspended);

        setIsSuspended(response.data.suspended);
      }
    } catch (error) {
      console.error("Error fetching suspended status:", error);
    }
  };
  useEffect(() => {
    setCourseList();
    checkSuspended();
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

        {!isSuspended ? (
          <button
            onClick={() => setShowCourseForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition active:scale-95 font-medium shadow-md hover:shadow-lg text-sm md:text-2xl whitespace-nowrap"
          >
            Create New Course
          </button>
        ) : (
          <p className="text-red-500 text-sm md:text-xl font-medium absolute top-10 left-1/2 -translate-x-1/2">
            Your account is suspended. Please contact support.
          </p>
        )}
      </div>

      <AnimatePresence>
        {showCourseForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="z-50 fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-background rounded-2xl p-6 w-full max-w-md shadow-xl"
            >
              <h2 className="text-2xl font-bold mb-6 text-text">New Course</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Course Title"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg
                     focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black bg-input-bg"
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, title: e.target.value })
                  }
                />
                <textarea
                  placeholder="Description"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg
                     focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-32 text-black bg-input-bg"
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, description: e.target.value })
                  }
                />
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Banner Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg
                     file:border-0 file:text-sm file:font-medium file:bg-indigo-50
                     file:text-indigo-700 hover:file:bg-indigo-100"
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        banner: e.target.files?.[0],
                      })
                    }
                  />
                </div>
                {/* Category Selector */}
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black bg-input-bg"
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, category: e.target.value })
                  }
                >
                  <option value="">Select Category</option>
                  <option value="Science">Science</option>
                  <option value="Math">Math</option>
                  <option value="Technology">Technology</option>
                  <option value="Arts">Arts</option>
                  <option value="Business">Business</option>
                </select>

                {/* Tags Input */}
                <div className="space-y-2 mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Tags (Related to the topic or category)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                      placeholder="Add a tag and press Enter"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black bg-input-bg"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="p-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition"
                    >
                      <FiPlus />
                    </button>
                  </div>

                  {/* Tags Display */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full"
                      >
                        <span className="text-xs">{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-3 p-6">
                <button
                  onClick={createCourse}
                  disabled={isCreating}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isCreating && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  Create
                </button>
                <button
                  onClick={() => setShowCourseForm(false)}
                  className="px-6 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cancel
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
