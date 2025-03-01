import { motion } from "framer-motion";
import { FaChevronDown, FaEdit, FaTrash } from "react-icons/fa";
import { useState } from "react";
import {
  deleteFetch,
  patchFetch,
  postFetch,
  putFetch,
} from "../../utils/apiCall";
import { useCourseActions } from "../../hooks/useCourseActions";
import { Section } from "./Section";
import { removeNullAndUndefinedFields } from "../../utils/utilsMethod/removeNullFiled";

export const Courses = ({ course }: { course: any }) => {
  const { setCourseList } = useCourseActions();
  const [isPublised, setIsPublished] = useState(course?.published);
  const [newSection, setNewSection] = useState<{
    title: string;
    description: string;
  } | null>({ title: "", description: "" });
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const editCourseName = async (
    newName: string | null = null,
    newDes: string | null = null,
) => {
    try {
        const result: any = await putFetch(
            `/user/teacher/course?courseId=${course._id}`,
            { ...(removeNullAndUndefinedFields({title:newName,description:newDes})) }
        );
        if (result.success) setCourseList();
    } catch (error) {
        console.error("Error updating section:", error);
    }
    setEditingCourseId(null);
};
const deleteCourse = async () => {
  try {
      const result: any = await deleteFetch(
          `/user/teacher/course?courseId=${course._id}`
      );
      if (result.success) setCourseList();
  } catch (error) {
      console.error("Error deleting section:", error);
  }
};


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

  const publishCourse = async (courseId: string,isPublised:boolean) => {
    setIsPublished(!isPublised)
    try {
      const result: any = await putFetch(
        `/user/teacher/course/publish?courseId=${courseId}&published=${!isPublised}`, {})
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
            <div className="flex flex-col gap-2">
                    {editingCourseId === course._id ? (
                        <input
                            type="text"
                            defaultValue={course.title}
                            onBlur={(e) =>
                                editCourseName(
                                    e.target.value
                                )
                            }
                            className="p-1 border rounded"
                        />
                    ) : (
                        <h3 className="font-medium text-xl">
                            {course.title}
                        </h3>
                    )}
                    {editingCourseId === course._id ? (
                        <input
                            type="text"
                            defaultValue={course.description}
                            onBlur={(e) =>
                              editCourseName(null,
                                    e.target.value
                                )
                            }
                            className="p-1 border rounded"
                        />
                    ) : (
                        <div className=' bg-gray-100 rounded-md'>
                        <p className="font-normal text-sm text-gray-800">
                            {course.description}
                        </p>
                        </div>
                    )}
                     <div className="flex items-center gap-2">
                                    <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingCourseId(course._id);
                                            }}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteCourse(course._Id);
                                            }}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <FaTrash />
                                        </button>
                                        <motion.div
            animate={{
              rotate: expandedCourses.has(course._id) ? 180 : 0,
            }}
          >
            <FaChevronDown />
          </motion.div>
                                    </div>
                </div>
          </div>

        </div>
        </div>

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
                  placeholder="New Post Name"
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
                  placeholder="New Post Description"
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
                  Add Post
                </button>
              </div>

              <div className="space-y-4">
                {course?.sectionIds?.map((section: any,index:number) => (
                  <Section sectionNum={index+1} section={section} courseId={course._id} />
                ))}
              </div>
                <button
                  onClick={() => publishCourse(course._id,isPublised)}
                  className={`px-6 py-2 text-xl rounded-lg transition-colors ${course.published || !course.sectionIds?.length
                    ? "bg-gray-200 cursor-not-allowed"
                    : "bg-purple-500 hover:bg-purple-600 text-white"
                    }`}
                  disabled={
                    isPublised || !course.sectionIds?.length
                  }
                >
                  {isPublised ? "Published" : "Publish"}
                </button>
            </motion.div>
          )}
      </motion.div>

    </>
  );
};
