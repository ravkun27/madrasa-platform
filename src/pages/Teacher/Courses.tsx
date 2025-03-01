import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";
import { useState } from "react";
import {
  patchFetch,
  postFetch,
} from "../../utils/apiCall";
import { useCourseActions } from "../../hooks/useCourseActions";
import { Section } from "./Section";

export const Courses = ({ course }: { course: any }) => {
  const { setCourseList } = useCourseActions();

  const [newSection, setNewSection] = useState<{
    title: string;
    description: string;
  } | null>({ title: "", description: "" });
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());


  const addSection = async (courseId: string) => {
    try {
      const result: any = await postFetch(
        `/user/teacher/course/section?courseId=${courseId}`,
        { ...newSection }
      );

      if (result.success) {
        setNewSection({ title: "", description: "" });
        setCourseList();
      }
    } catch (error) {
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

  const publishCourse = async (courseId: string) => {
    try {
      const result: any = await patchFetch(
        `/user/teacher/course/publish?courseId=${courseId}`,
        { published: true }
      );
      if (result.success) setCourseList();
    } catch (error) {
      console.error("Error publishing course:", error);
    }
  };

  return (
    <>
      <motion.div
        key={course._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeInOut" }} // Adjust transition timing
        className="bg-white rounded-xl shadow-sm p-4 duration-700 dark:border-accent-dark"
      >
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleCourse(course._id)}
        >
          <div className="flex gap-4 w-full justify-between">
            <div className="flex gap-4">
              {course.banner && (
                <img
                  src={course.banner}
                  alt="Course banner"
                  className="mt-2 h-12 w-12 rounded-full object-cover"
                />
              )}
              <div>
                <h2 className="text-2xl font-semibold">
                  {course.title}
                </h2>
                <p>{course.description}</p>
              </div>
            </div>
            {!expandedCourses.has(course._id) && (
              <div className="group opacity-0 hover:opacity-100 flex gap-4 items-center justify-center pr-5 transition-opacity duration-300">
                <p>Add Video</p>
                <p>Add Quiz</p>
                <p>Add Lecture</p>
              </div>
            )}
          </div>
          <motion.div
            animate={{
              rotate: expandedCourses.has(course._id) ? 180 : 0,
            }}
          >
            <FaChevronDown />
          </motion.div>
        </div>

        <AnimatePresence>
          {expandedCourses.has(course._id) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.1, ease: "easeInOut" }} // Adjust transition timing
              className="mt-4 space-y-4"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New Section Name"
                  className="flex-1 p-2 border rounded-lg"
                  value={newSection?.title ?? ""}
                  onChange={(e) =>
                    setNewSection((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
                <input
                  type="text"
                  placeholder="New Section Description"
                  className="flex-1 p-2 border rounded-lg"
                  value={newSection?.description ?? ""}
                  onChange={(e) =>
                    setNewSection((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />

                <button
                  onClick={() => addSection(course._id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Section
                </button>
              </div>

              <div className="space-y-4">
                {course?.sectionIds?.map((section: any) => (
                  <Section section={section} courseId={course._id} />
                ))}
                <button
                  onClick={() => publishCourse(course._id)}
                  className={`px-6 py-2 text-xl rounded-lg transition-colors ${course.published || !course.sections?.length
                    ? "bg-gray-200 cursor-not-allowed"
                    : "bg-purple-500 hover:bg-purple-600 text-white"
                    }`}
                  disabled={
                    course.published || !course.sections?.length
                  }
                >
                  {course.published ? "Published" : "Publish"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

    </>
  );
};
