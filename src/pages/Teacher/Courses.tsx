import { motion, AnimatePresence } from "framer-motion";
import { FaEdit, FaTrash, FaChevronDown } from "react-icons/fa";
import { useState } from "react";
import {
  deleteFetch,
  getFetch,
  patchFetch,
  postFetch,
} from "../../utils/apiCall";
import { ContentType } from "../../types";
import { useCourseActions } from "../../hooks/useCourseActions";

const { getCourseList } = useCourseActions();

const [newSection, setNewSection] = useState<{
  title: string;
  description: string;
} | null>({ title: "", description: "" });
const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
const [expandedSections, setExpandedSections] = useState<Set<string>>(
  new Set()
);
const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
const [editingContentId, setEditingContentId] = useState<string | null>(null);
const [addingContent, setAddingContent] = useState<{
  courseId: string;
  sectionId: string;
  type: ContentType | null;
} | null>(null);
const [contentDetails, setContentDetails] = useState({
  name: "",
  description: "",
  file: null as File | null,
});
const addSection = async (courseId: string) => {
  try {
    const result: any = await postFetch(
      `/user/teacher/course/section?courseId=${courseId}`,
      { ...newSection }
    );

    if (result.success) {
      setNewSection({ title: "", description: "" });
      getCourseList();
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

const toggleSection = (sectionId: string) => {
  setExpandedSections((prev) => {
    const newSet = new Set(prev);
    if (newSet.has(sectionId)) {
      newSet.delete(sectionId);
    } else {
      newSet.add(sectionId);
    }
    return newSet;
  });
};
const deleteSection = async (courseId: string, sectionId: string) => {
  try {
    const result: any = await deleteFetch(
      `/user/teacher/course/section?courseId=${courseId}&sectionId=${sectionId}`
    );
    if (result.success) getCourseList();
  } catch (error) {
    console.error("Error deleting section:", error);
  }
};

const deleteContent = async (
  courseId: string,
  sectionId: string,
  contentId: string
) => {
  try {
    const result: any = await deleteFetch(
      `/user/teacher/course/content?courseId=${courseId}&sectionId=${sectionId}&contentId=${contentId}`
    );
    if (result.success) getCourseList();
  } catch (error) {
    console.error("Error deleting content:", error);
  }
};

const handleAddContent = async () => {
  if (!addingContent || !contentDetails.name.trim()) return;

  try {
    let filePath = null;

    // Step 1: Upload the file if it exists
    if (contentDetails.file) {
      const uploadUrlResult: any = await getFetch(
        `/user/teacher/course/getUpdateLink?filename=hello&contentType=image/jpeg&courseId=${addingContent.courseId}`
      );

      if (uploadUrlResult?.success) {
        const uploadResponse = await fetch(uploadUrlResult.data.signedUrl, {
          method: "PUT",
          body: contentDetails.file,
        });

        if (uploadResponse.ok) {
          filePath = uploadUrlResult.data.fileKey;
        } else {
          throw new Error("File upload failed");
        }
      }
    }

    // Step 2: Create the lesson
    const result: any = await postFetch(
      `/user/teacher/course/lesson?sectionId=${addingContent.sectionId}&courseId=${addingContent.courseId}`,
      {
        title: contentDetails.name,
        description: contentDetails.description,
        filePath: filePath,
      }
    );

    if (result.success) {
      getCourseList();
      setAddingContent(null);
      setContentDetails({ name: "", description: "", file: null });
    } else {
      console.error("Failed to add lesson:", result.message);
    }
  } catch (error) {
    console.error("Error adding content:", error);
  }
};

const editSectionName = async (
  courseId: string,
  sectionId: string,
  newName: string
) => {
  try {
    const result: any = await patchFetch(
      `/user/teacher/course/section?courseId=${courseId}&sectionId=${sectionId}`,
      { title: newName }
    );
    if (result.success) getCourseList();
  } catch (error) {
    console.error("Error updating section:", error);
  }
  setEditingSectionId(null);
};

const editContentName = async (
  courseId: string,
  sectionId: string,
  contentId: string,
  newName: string
) => {
  try {
    const result: any = await patchFetch(
      `/user/teacher/course/content?courseId=${courseId}&sectionId=${sectionId}&contentId=${contentId}`,
      { name: newName }
    );
    if (result.success) getCourseList();
  } catch (error) {
    console.error("Error updating content:", error);
  }
  setEditingContentId(null);
};

const publishCourse = async (courseId: string) => {
  try {
    const result: any = await patchFetch(
      `/user/teacher/course/publish?courseId=${courseId}`,
      { published: true }
    );
    if (result.success) getCourseList();
  } catch (error) {
    console.error("Error publishing course:", error);
  }
};

export const Courses = ({ courses }) => {
  return (
    <>
      <AnimatePresence>
        {addingContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <h2 className="text-lg font-semibold mb-4 text-text dark:text-text-dark">
                Add {addingContent.type}
              </h2>
              <input
                type="text"
                placeholder="Content Name"
                className="w-full mb-4 p-2 border rounded-lg"
                value={contentDetails.name}
                onChange={(e) =>
                  setContentDetails({ ...contentDetails, name: e.target.value })
                }
              />
              <textarea
                placeholder="Description"
                className="w-full mb-4 p-2 border rounded-lg"
                value={contentDetails.description}
                onChange={(e) =>
                  setContentDetails({
                    ...contentDetails,
                    description: e.target.value,
                  })
                }
              />
              <input
                type="file"
                className="w-full mb-4 p-2 border rounded-lg"
                onChange={(e) =>
                  setContentDetails({
                    ...contentDetails,
                    file: e.target.files?.[0] || null,
                  })
                }
                required // Ensure a file is selected
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleAddContent}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => setAddingContent(null)}
                  className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="space-y-6">
        <AnimatePresence>
          {Array.isArray(courses) &&
            courses.map((course: any) => (
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
                          <div
                            key={section._id}
                            className="bg-gray-50 p-4 rounded-lg"
                          >
                            <div
                              className="flex justify-between items-center cursor-pointer"
                              onClick={() => toggleSection(section._id)}
                            >
                              <div className="flex items-center gap-2">
                                {editingSectionId === section._id ? (
                                  <input
                                    type="text"
                                    defaultValue={section.title}
                                    onBlur={(e) =>
                                      editSectionName(
                                        course._id,
                                        section._id,
                                        e.target.value
                                      )
                                    }
                                    className="p-1 border rounded"
                                  />
                                ) : (
                                  <h3 className="font-medium">
                                    {section.title}
                                  </h3>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingSectionId(section._id);
                                  }}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  <FaEdit />
                                </button>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteSection(course._id, section._id);
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <FaTrash />
                                </button>
                                <motion.div
                                  animate={{
                                    rotate: expandedSections.has(section._id)
                                      ? 180
                                      : 0,
                                  }}
                                >
                                  <FaChevronDown />
                                </motion.div>
                              </div>
                            </div>
                            <AnimatePresence>
                              {expandedSections.has(section._id) && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{
                                    duration: 0.2,
                                    ease: "easeInOut",
                                  }} // Adjust transition timing
                                  className="mt-4 space-y-2"
                                >
                                  <div className="flex gap-2 mb-4">
                                    {["video", "quiz", "lecture"].map(
                                      (type) => (
                                        <button
                                          key={type}
                                          onClick={() =>
                                            setAddingContent({
                                              courseId: course._id,
                                              sectionId: section._id,
                                              type: type as ContentType,
                                            })
                                          }
                                          className="bg-green-500 text-white px-3 py-1.5 rounded-md text-sm capitalize hover:bg-green-600 transition-colors"
                                        >
                                          Add {type}
                                        </button>
                                      )
                                    )}
                                  </div>

                                  <div className="space-y-2">
                                    {section?.content?.map((content: any) => (
                                      <motion.div
                                        key={content.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{
                                          duration: 0.5,
                                          ease: "easeInOut",
                                        }}
                                        className="bg-white p-3 rounded-lg shadow-xs"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span
                                            className={`inline-block w-2 h-2 rounded-full ${
                                              content.type === "video"
                                                ? "bg-red-500"
                                                : content.type === "quiz"
                                                ? "bg-blue-500"
                                                : "bg-green-500"
                                            }`}
                                          />
                                          <div>
                                            {editingContentId === content.id ? (
                                              <input
                                                type="text"
                                                defaultValue={content.title}
                                                onBlur={(e) =>
                                                  editContentName(
                                                    course._id,
                                                    section._id,
                                                    content.id,
                                                    e.target.value
                                                  )
                                                }
                                                className="p-1 border rounded"
                                              />
                                            ) : (
                                              <p className="font-medium">
                                                {content.title}
                                              </p>
                                            )}
                                            <p className="text-sm text-gray-600">
                                              {content.description}
                                            </p>
                                            {content.filePath && (
                                              <a
                                                href={content.filePath}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:underline"
                                              >
                                                View File
                                              </a>
                                            )}
                                          </div>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingContentId(content.id);
                                            }}
                                            className="text-gray-500 hover:text-gray-700"
                                          >
                                            <FaEdit />
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              deleteContent(
                                                course._id,
                                                section._id,
                                                content.id
                                              );
                                            }}
                                            className="text-red-500 hover:text-red-700"
                                          >
                                            <FaTrash />
                                          </button>
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                        <button
                          onClick={() => publishCourse(course._id)}
                          className={`px-6 py-2 text-xl rounded-lg transition-colors ${
                            course.published || !course.sections?.length
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
            ))}
        </AnimatePresence>
      </div>
    </>
  );
};
