import { deleteFetch, getFetch, putFetch } from "../../utils/apiCall";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuPencil,
  LuCheck,
  LuTrash2,
  LuX,
  LuExternalLink,
  LuCopy,
  LuEllipsis,
} from "react-icons/lu";

import { useEffect, useState, useRef } from "react";
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
  const [showMobileActions, setShowMobileActions] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (content) {
      setTempContentData({
        title: content.title || "",
        description: content.description || "",
      });
    }
  }, [content]);

  // Handle clicks outside of mobile menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setShowMobileActions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const deleteContent = async () => {
    try {
      setIsDeleting(true);
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
    } else if (content?.link) {
      navigator.clipboard.writeText(content.link);
      toast.success("Link copied to clipboard!");
    }
  };

  // Check if the content is a link type
  const isLink = content?.fileType === "link";

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
            className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
          />
        ) : (
          <motion.div
            key={content._id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all mt-2 overflow-hidden"
          >
            {/* Top Section: Content Preview */}
            {isLink ? (
              <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50">
                <div className="flex flex-wrap items-center gap-3 justify-between">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 max-w-full">
                    <LuExternalLink className="flex-shrink-0" size={18} />
                    <p className="text-sm font-medium truncate max-w-[180px] sm:max-w-[250px] md:max-w-md lg:max-w-lg">
                      {content.link}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-xs sm:text-sm transition-colors"
                    >
                      <LuCopy size={14} />
                      <span className="hidden sm:inline">Copy</span>
                    </button>
                    <a
                      href={content.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm transition-colors"
                    >
                      <LuExternalLink size={14} />
                      <span className="hidden sm:inline">Open</span>
                    </a>
                  </div>
                </div>
              </div>
            ) : content?.filePath ? (
              <div className="w-full">
                <MediaModal
                  url={content?.filePath}
                  contentType={content?.fileType}
                  title={content?.title}
                />
              </div>
            ) : null}

            {/* Content Details Section */}
            <div className="p-3 sm:p-4">
              {/* Editable Mode */}
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
                    className="w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Content title"
                  />
                  <textarea
                    value={tempContentData.description}
                    onChange={(e) =>
                      setTempContentData({
                        ...tempContentData,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Content description"
                  />
                  <div className="flex gap-2 sm:gap-3">
                    <button
                      onClick={editContentName}
                      className="flex items-center gap-1 sm:gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <LuCheck size={16} />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => setEditingContentId(null)}
                      className="flex items-center gap-1 sm:gap-2 bg-gray-200 dark:bg-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                    >
                      <LuX size={16} />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base sm:text-lg font-medium text-gray-800 dark:text-gray-100 mb-1">
                      {content.title}
                    </h4>
                    {content.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                        {content.description}
                      </p>
                    )}
                  </div>

                  {/* Desktop Actions */}
                  <div className="hidden sm:flex items-center gap-1">
                    <button
                      onClick={() => setEditingContentId(content._id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
                      aria-label="Edit content"
                    >
                      <LuPencil size={18} />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isDeleting}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-500"
                      aria-label="Delete content"
                    >
                      <LuTrash2 size={18} />
                    </button>
                  </div>

                  {/* Mobile Actions */}
                  <div className="relative sm:hidden" ref={mobileMenuRef}>
                    <button
                      onClick={() => setShowMobileActions(!showMobileActions)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
                      aria-label="Show more actions"
                    >
                      <LuEllipsis size={18} />
                    </button>

                    {showMobileActions && (
                      <div className="absolute right-10 bottom-0 mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => {
                            setEditingContentId(content._id);
                            setShowMobileActions(false);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                        >
                          <LuPencil size={16} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteConfirm(true);
                            setShowMobileActions(false);
                          }}
                          disabled={isDeleting}
                          className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 text-sm"
                        >
                          <LuTrash2 size={16} />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
