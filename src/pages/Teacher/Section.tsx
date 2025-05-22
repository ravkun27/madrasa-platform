import { motion } from "framer-motion";
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
  const [expandedSections, setExpandedSections] = useState(false);
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

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="p-2 md:p-6">
          <div className="flex justify-between gap-5 mb-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-xl text-md font-medium">
                Section {sectionNum}
              </span>
            </div>
            <div className="flex justify-center gap-2">
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
                  rotate: expandedSections ? 180 : 0,
                }}
                className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl cursor-pointer"
                onClick={() => setExpandedSections(!expandedSections)}
              >
                <LuChevronDown size={24} />
              </motion.div>
            </div>
          </div>
          <div>
            {editingSectionId === section._id ? (
              <div className="space-y-2">
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
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 md:h-32"
                />
                <div className="flex justify-center gap-2">
                  <button
                    onClick={editSectionName}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 text-sm"
                  >
                    <LuCheck size={20} />
                    Save
                  </button>
                  <button
                    onClick={() => setEditingSectionId(null)}
                    className="flex items-center md:gap-2 bg-gray-200 dark:bg-gray-700 px-5 py-2.5 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                  >
                    <LuX size={20} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    {section.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                    {section.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          {expandedSections && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:flex gap-3 py-2">
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
                    className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-500 
                 rounded-lg text-gray-700 dark:text-gray-300 hover:text-indigo-600 
                 transition-all"
                  >
                    {icon}
                    <span className="capitalize font-medium">{type}</span>
                  </button>
                ))}
              </div>

              <div>
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
        </div>
      </div>
    </>
  );
};
