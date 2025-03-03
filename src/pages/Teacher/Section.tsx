import { motion, AnimatePresence } from "framer-motion";
import {
  LuVideo,
  LuText,
  LuClipboardList,
  LuChevronDown,
  LuPencil,
  LuTrash2,
  LuCheck,
  LuX,
} from "react-icons/lu";
import { deleteFetch, putFetch } from "../../utils/apiCall";
import { useCourseActions } from "../../hooks/useCourseActions";
import { Content } from "./Content";
import { removeNullAndUndefinedFields } from "../../utils/utilsMethod/removeNullFiled";
import toast from "react-hot-toast";
import { useState } from "react";
import { ContentType } from "../../types";
import ContentEditModal from "./ContentEditModal";
import { ConfirmationModal } from "../../components/Modal/ConfiramtionModal";

export const Section = ({
  section,
  courseId,
  sectionNum,
}: {
  section: any;
  courseId: any;
  sectionNum: number;
}) => {
  const { setCourseList } = useCourseActions();
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );
  const [tempSectionData, setTempSectionData] = useState({
    title: section.title,
    description: section.description,
  });
  const [addingContent, setAddingContent] = useState<{
    courseId: string;
    sectionId: string;
    type: ContentType | null;
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      newSet.has(sectionId) ? newSet.delete(sectionId) : newSet.add(sectionId);
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
  };

  const deleteSection = async () => {
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

      {showDeleteConfirm && (
        <ConfirmationModal
          message="Are you sure you want to delete this section?"
          onConfirm={() => {
            deleteSection();
            setShowDeleteConfirm(false);
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-5">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-full text-sm font-medium">
                  Section {sectionNum}
                </span>
              </div>

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
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 text-lg"
                  />
                  <textarea
                    value={tempSectionData.description}
                    onChange={(e) =>
                      setTempSectionData({
                        ...tempSectionData,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 h-32"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={editSectionName}
                      className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 text-sm"
                    >
                      <LuCheck size={20} />
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingSectionId(null)}
                      className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-5 py-2.5 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                    >
                      <LuX size={20} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    {section.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-base">
                    {section.description}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingSectionId(section._id)}
                className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-400"
              >
                <LuPencil size={22} />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl text-red-500"
              >
                <LuTrash2 size={22} />
              </button>
              <motion.div
                animate={{
                  rotate: expandedSections.has(section._id) ? 180 : 0,
                }}
                className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl cursor-pointer"
                onClick={() => toggleSection(section._id)}
              >
                <LuChevronDown size={24} />
              </motion.div>
            </div>
          </div>

          <AnimatePresence>
            {expandedSections.has(section._id) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 space-y-6"
              >
                <div className="flex flex-wrap gap-3">
                  {[
                    { type: "video", icon: <LuVideo size={20} /> },
                    { type: "lecture", icon: <LuText size={20} /> },
                    { type: "quiz", icon: <LuClipboardList size={20} /> },
                  ].map(({ type, icon }) => (
                    <button
                      key={type}
                      onClick={() => {
                        setAddingContent({
                          courseId,
                          sectionId: section._id,
                          type: type as ContentType,
                        });
                        setIsAddingContent(true);
                      }}
                      className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-indigo-500 rounded-xl text-gray-700 dark:text-gray-300 hover:text-indigo-600"
                    >
                      {icon}
                      <span className="capitalize font-medium">{type}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
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
        </div>
      </motion.div>
    </>
  );
};
