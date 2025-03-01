import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronDown,
  FiEdit,
  FiTrash2,
  FiVideo,
  FiFileText,
  FiCheckSquare,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { deleteFetch, putFetch } from "../../utils/apiCall";
import { useCourseActions } from "../../hooks/useCourseActions";
import { Content } from "./Content";
import { removeNullAndUndefinedFields } from "../../utils/utilsMethod/removeNullFiled";
import toast from "react-hot-toast";
import { useState } from "react";
import { ContentType } from "../../types";
import ContentEditModal from "./ContentEditModal";

export const Section = ({
  section,
  courseId,
  sectionNum,
}: {
  section: any;
  courseId: any;
  sectionNum: Number;
}) => {
  const { setCourseList } = useCourseActions();
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );
  const [tempSectionData, setTempSectionData] = useState<{
    title: string;
    description: string;
  }>({
    title: section.title,
    description: section.description,
  });

  const [addingContent, setAddingContent] = useState<{
    courseId: string;
    sectionId: string;
    type: ContentType | null;
  } | null>(null);
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
  const editSectionName = async () => {
    try {
      const result: any = await putFetch(
        `/user/teacher/course/section?courseId=${courseId}&sectionId=${section._id}`,
        { ...removeNullAndUndefinedFields(tempSectionData) }
      );
      if (result.success) {
        setCourseList();
        toast.success("Section updated successfully");
        setEditingSectionId(null);
      }
    } catch (error) {
      toast.error("Failed to update section");
      console.error("Error updating section:", error);
    }
    setEditingSectionId(null);
  };

  const deleteSection = async () => {
    if (!confirm("Are you sure you want to delete this section?")) return;
    try {
      const result: any = await deleteFetch(
        `/user/teacher/course/section?courseId=${courseId}&sectionId=${section._id}`
      );
      if (result.success) {
        setCourseList();
        toast.success("Section deleted successfully");
      }
    } catch (error) {
      toast.error("Failed to delete section");
      console.error("Error deleting section:", error);
    }
  };

  return (
    <>
      {isAddingContent && (
        <ContentEditModal
          addingContent={addingContent}
          setAddingContent={setAddingContent}
          setIsAddingContent={setIsAddingContent}
        />
      )}
      <motion.div
        className="bg-gray-50 rounded-xl p-4 border border-gray-200"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <span className="text-sm font-medium text-indigo-600">
              {`Post-${sectionNum}`}
            </span>
            {editingSectionId === section._id ? (
              <div className="space-y-2 mt-2">
                <input
                  type="text"
                  value={tempSectionData.title}
                  onChange={(e) =>
                    setTempSectionData({
                      ...tempSectionData,
                      title: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <textarea
                  value={tempSectionData.description}
                  onChange={(e) =>
                    setTempSectionData({
                      ...tempSectionData,
                      description: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={editSectionName}
                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                  >
                    <FiCheck size={18} />
                    Save
                  </button>
                  <button
                    onClick={() => setEditingSectionId(null)}
                    className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    <FiX size={18} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2">
                <h3 className="text-lg font-medium text-gray-800 line-clamp-1">
                  {section.title}
                </h3>
                <p className="text-gray-600 mt-1 line-clamp-3">
                  {section.description}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingSectionId(section._id);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
            >
              <FiEdit size={18} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteSection();
              }}
              className="p-2 hover:bg-red-50 rounded-lg text-red-500"
            >
              <FiTrash2 size={18} />
            </button>
            <motion.div
              animate={{ rotate: expandedSections.has(section._id) ? 180 : 0 }}
              className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
              onClick={() => toggleSection(section._id)}
            >
              <FiChevronDown size={20} />
            </motion.div>
          </div>
        </div>

        <AnimatePresence>
          {expandedSections.has(section._id) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-4"
            >
              <div className="flex flex-wrap gap-2">
                {[
                  { type: "video", icon: <FiVideo /> },
                  { type: "lecture", icon: <FiFileText /> },
                  { type: "quiz", icon: <FiCheckSquare /> },
                ].map(({ type, icon }) => (
                  <button
                    key={type}
                    onClick={() => {
                      setAddingContent({
                        courseId: courseId,
                        sectionId: section._id,
                        type: type as ContentType,
                      });
                      setIsAddingContent(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white border hover:border-indigo-500 rounded-lg text-gray-700 hover:text-indigo-600"
                  >
                    {icon}
                    <span className="capitalize">{type}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {section?.lessonIds?.map((contentId: any) => (
                  <Content
                    key={contentId}
                    contentId={contentId}
                    sectionId={section._id}
                    courseId={courseId}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};
