import { deleteFetch, getFetch, putFetch } from "../../utils/apiCall";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuPencil,
  LuCheck,
  LuTrash2,
  LuX,
  LuExternalLink,
  LuCopy,
} from "react-icons/lu";

import { useEffect, useState } from "react";
import { useCourseActions } from "../../hooks/useCourseActions";
import { removeNullAndUndefinedFields } from "../../utils/utilsMethod/removeNullFiled";
import { useCourses } from "../../context/CourseContext";
import { MediaModal } from "../../components/Modal/MediaModal";
import toast from "react-hot-toast";
import { ConfirmationModal } from "../../components/Modal/ConfiramtionModal";

export const Content = ({
  sectionId,
  courseId,
  contentId,
}: {
  sectionId: any;
  courseId: any;
  contentId: any;
}) => {
  const { setCourseList } = useCourseActions();
  const { courses } = useCourses();
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [content, setContent] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tempContentData, setTempContentData] = useState({
    title: "",
    description: "",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (content) {
      setTempContentData({
        title: content.title || "",
        description: content.description || "",
      });
    }
  }, [content]);

  const deleteContent = async () => {
    try {
      const result: any = await deleteFetch(
        `/user/teacher/course/lesson?lessonId=${contentId}&courseId=${courseId}&sectionId=${sectionId}`
      );
      if (result.success) {
        setCourseList();
        toast.success("Content deleted successfully");
      }
    } catch (error) {
      toast.error("Failed to delete content");
      console.error("Error deleting content:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const editContentName = async () => {
    try {
      const result: any = await putFetch(
        `/user/teacher/course/lesson?lessonId=${contentId}&courseId=${courseId}`,
        { ...removeNullAndUndefinedFields(tempContentData) }
      );
      if (result.success) {
        setCourseList();
        toast.success("Content updated successfully");
        setEditingContentId(null);
      }
    } catch (error) {
      toast.error("Failed to update content");
      console.error("Error updating content:", error);
    }
  };

  const getContent = async () => {
    try {
      const content: any = await getFetch(
        `/user/teacher/course/lesson?lessonId=${contentId}&courseId=${courseId}`
      );
      setContent(content?.lesson);
    } catch (error) {
      toast.error("Failed to load content");
      console.error("Error fetching content:", error);
    }
  };

  useEffect(() => {
    getContent();
  }, [courses]);

  const handleCopyLink = () => {
    if (content?.filePath) {
      navigator.clipboard.writeText(content.filePath);
      toast.success("Link copied to clipboard!");
    }
  };

  // Check if the content is a link type
  const isLink = content?.fileType === "link";
  console.log(content);

  return (
    <>
      {showDeleteConfirm && (
        <ConfirmationModal
          message="Are you sure you want to delete this content?"
          onConfirm={() => {
            deleteContent();
            setShowDeleteConfirm(false);
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      <AnimatePresence>
        {!content ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-12 bg-gray-100 rounded-lg animate-pulse"
          />
        ) : (
          <motion.div
            key={content._id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.1 }}
            className="group bg-white dark:bg-gray-800 md:p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all mt-2"
          >
            {/* Top Section: Content Preview */}
            {isLink ? (
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 max-w-full">
                    <LuExternalLink size={20} />
                    <p className="text-sm md:text-base font-medium truncate max-w-xs md:max-w-md lg:max-w-lg">
                      {content.link}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm transition-colors"
                    >
                      <LuCopy size={16} />
                      Copy
                    </button>
                    <a
                      href={content.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors"
                    >
                      <LuExternalLink size={16} />
                      Open
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <MediaModal
                url={content?.filePath}
                contentType={content?.fileType}
                title={content?.title}
              />
            )}

            {/* Content Details Section */}
            <div className="flex flex-wrap items-start justify-between gap-4 p-2">
              {/* Left: Title & Description */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Editable Mode */}
                <div className="flex-1">
                  {editingContentId === content._id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={tempContentData.title}
                        onChange={(e) =>
                          setTempContentData({
                            ...tempContentData,
                            title: e.target.value,
                          })
                        }
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <textarea
                        value={tempContentData.description}
                        onChange={(e) =>
                          setTempContentData({
                            ...tempContentData,
                            description: e.target.value,
                          })
                        }
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={editContentName}
                          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 text-sm"
                        >
                          <LuCheck size={20} />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingContentId(null)}
                          className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                        >
                          <LuX size={20} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div className="flex flex-col">
                      <div className="mb-2 md:mb-4">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 line-clamp-1 md:line-clamp-2">
                          {content.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">
                          {content.description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Action Buttons */}
              {editingContentId !== content._id && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingContentId(content._id)}
                    className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
                  >
                    <LuPencil size={20} />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeleting}
                    className="p-2.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-500"
                  >
                    <LuTrash2 size={20} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
