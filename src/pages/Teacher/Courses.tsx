import { AnimatePresence, motion } from "framer-motion";
import {
  FiChevronDown,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiCheck,
  FiX,
  FiUsers,
} from "react-icons/fi";
import { useState } from "react";
import { deleteFetch, postFetch, putFetch } from "../../utils/apiCall";
import { useCourseActions } from "../../hooks/useCourseActions";
import { Section } from "./Section";
import { removeNullAndUndefinedFields } from "../../utils/utilsMethod/removeNullFiled";
import toast, { Toaster } from "react-hot-toast";

export const Courses = ({ course }: { course: any }) => {
  const { setCourseList } = useCourseActions();
  const [isPublished, setIsPublished] = useState(course?.published);
  const [newSection, setNewSection] = useState<{
    title: string;
    description: string;
  } | null>({ title: "", description: "" });
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(
    new Set()
  );
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [tempCourseData, setTempCourseData] = useState<{
    title: string;
    description: string;
  }>({
    title: course.title,
    description: course.description,
  });
  const [showStudents, setShowStudents] = useState(false);
  const dummyStudents = [
    "John Doe",
    "Jane Smith",
    "Alice Johnson",
    "Bob Brown",
    "Charlie Davis",
  ];

  const addSection = async (courseId: string) => {
    try {
      const result: any = await postFetch(
        `/user/teacher/course/section?courseId=${courseId}`,
        { ...newSection }
      );

      if (result.success) {
        setNewSection({ title: "", description: "" });
        setCourseList();
        toast.success("Section added successfully");
      }
    } catch (error) {
      toast.error("Failed to add section");
      console.error("Error adding section:", error);
    }
  };

  const toggleCourse = (courseId: string) => {
    setExpandedCourses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const publishCourse = async (courseId: string, isPublished: boolean) => {
    toast.custom((t) => (
      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col gap-4">
        <p className="text-lg font-medium text-gray-800">
          Are you sure you want to {isPublished ? "unpublish" : "publish"} this
          course?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              handlePublish(courseId, isPublished);
            }}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Confirm
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  };

  const handlePublish = async (courseId: string, isPublished: boolean) => {
    setIsPublished(!isPublished);
    try {
      const result: any = await putFetch(
        `/user/teacher/course/publish?courseId=${courseId}&published=${!isPublished}`,
        {}
      );
      if (result.success) {
        setCourseList();
        toast.success(
          `Course ${!isPublished ? "published" : "unpublished"} successfully`
        );
      }
    } catch (error) {
      toast.error("Failed to publish course");
      console.error("Error publishing course:", error);
    }
  };

  const editCourseName = async () => {
    try {
      const result: any = await putFetch(
        `/user/teacher/course?courseId=${course._id}`,
        { ...removeNullAndUndefinedFields(tempCourseData) }
      );
      if (result.success) {
        setCourseList();
        toast.success("Course updated successfully");
        setEditingCourseId(null);
      }
    } catch (error) {
      toast.error("Failed to update course");
      console.error("Error updating course:", error);
    }
  };

  const deleteCourse = async () => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      const result: any = await deleteFetch(
        `/user/teacher/course?courseId=${course._id}`
      );
      if (result.success) {
        setCourseList();
        toast.success("Course deleted successfully");
      }
    } catch (error) {
      toast.error("Failed to delete course");
      console.error("Error deleting course:", error);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <motion.div
        key={course._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="bg-gray-100 dark:bg-white/70 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
      >
        <div className="flex items-start gap-4 p-2">
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              {course.banner && (
                <img
                  src={course.banner}
                  alt="Course banner"
                  className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 ml-2">
                {editingCourseId === course._id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={tempCourseData.title}
                      onChange={(e) =>
                        setTempCourseData({
                          ...tempCourseData,
                          title: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <textarea
                      value={tempCourseData.description}
                      onChange={(e) =>
                        setTempCourseData({
                          ...tempCourseData,
                          description: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={editCourseName}
                        className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                      >
                        <FiCheck size={18} />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingCourseId(null)}
                        className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
                      >
                        <FiX size={18} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {course.title}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-400 text-sm line-clamp-2">
                      {course.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCourseId(course._id);
                    setTempCourseData({
                      title: course.title,
                      description: course.description,
                    });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-800"
                >
                  <FiEdit size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCourse();
                  }}
                  className="p-2 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-600"
                >
                  <FiTrash2 size={18} />
                </button>
                <motion.div
                  animate={{
                    rotate: expandedCourses.has(course._id) ? 180 : 0,
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                  onClick={() => toggleCourse(course._id)}
                >
                  <FiChevronDown size={20} />
                </motion.div>
              </div>
            </div>

            <AnimatePresence>
              {expandedCourses.has(course._id) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 space-y-6 p-2"
                >
                  {/* Student List */}
                  <div
                    className="bg-gray-100 p-4 rounded-lg cursor-pointer"
                    onClick={() => setShowStudents(!showStudents)}
                  >
                    <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
                      <FiUsers size={18} />
                      <span>
                        {showStudents ? "Hide Students" : "Show Students"}
                      </span>
                    </button>
                    {showStudents && (
                      <div className="mt-2 space-y-2">
                        {dummyStudents.map((student, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            {student}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add Section Form */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Section title"
                      className="p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      value={newSection?.title}
                      onChange={(e) =>
                        setNewSection((prev) => ({
                          ...prev,
                          title: e.target.value,
                          description: prev?.description ?? "", // Ensure description is always a string
                        }))
                      }
                    />
                    <input
                      type="text"
                      placeholder="Section description"
                      className="p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      value={newSection?.description}
                      onChange={(e) =>
                        setNewSection((prev) => ({
                          ...prev,
                          title: prev?.title ?? "", // Ensure description is always a string
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <button
                    onClick={() => addSection(course._id)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <FiPlus size={18} />
                    Add Section
                  </button>

                  {/* Sections List */}
                  <div className="space-y-4">
                    {course?.sectionIds?.map((section: any, index: number) => (
                      <Section
                        key={section._id}
                        section={section}
                        courseId={course._id}
                        sectionNum={index + 1}
                      />
                    ))}
                  </div>

                  {/* Publish Button */}
                  <button
                    onClick={() => publishCourse(course._id, isPublished)}
                    className={`w-full py-3 rounded-lg transition-colors ${
                      isPublished || !course.sectionIds?.length
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    {isPublished ? "Published ✓" : "Publish Course"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </>
  );
};
