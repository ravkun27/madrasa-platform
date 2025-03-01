// Content.tsx
import { deleteFetch, getFetch, putFetch } from "../../utils/apiCall";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiEdit,
  FiTrash2,
  FiFile,
  FiVideo,
  FiBook,
  FiCheckSquare,
} from "react-icons/fi";
import { useEffect, useState } from "react";
import { useCourseActions } from "../../hooks/useCourseActions";
import { removeNullAndUndefinedFields } from "../../utils/utilsMethod/removeNullFiled";
import { useCourses } from "../../context/CourseContext";
import { MediaModal } from "../../components/MediaModal";
import toast from "react-hot-toast";
import { ContentType } from "../../types";

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

  const [isOpen, setIsOpen] = useState(false);

  const deleteContent = async () => {
    if (!confirm("Are you sure you want to delete this content?")) return;
    setIsDeleting(true);
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

  const editContentName = async (
    newName: string | null = null,
    newDes: string | null = null
  ) => {
    try {
      const result: any = await putFetch(
        `/user/teacher/course/lesson?lessonId=${contentId}&courseId=${courseId}`,
        {
          ...removeNullAndUndefinedFields({
            title: newName,
            description: newDes,
          }),
        }
      );
      if (result.success) {
        setCourseList();
        toast.success("Content updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update content");
      console.error("Error updating content:", error);
    }
    setEditingContentId(null);
  };

  const getContent = async () => {
    try {
      const content: any =
        (await getFetch(
          `/user/teacher/course/lesson?lessonId=${contentId}&courseId=${courseId}`
        )) ?? null;
      setContent(content?.lesson);
    } catch (error) {
      toast.error("Failed to load content");
      console.error("Error fetching content:", error);
    }
  };

  useEffect(() => {
    getContent();
  }, [courses]);

  return (
    <>
      <MediaModal
        url={content?.filePath}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
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
            transition={{ duration: 0.2 }}
            className="group bg-white p-4 rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={`p-2 rounded-lg ${
                    {
                      video: "bg-red-100 text-red-600",
                      quiz: "bg-blue-100 text-blue-600",
                      lecture: "bg-green-100 text-green-600",
                    }[content.type as ContentType] || null
                  }`}
                >
                  {{
                    video: <FiVideo size={18} />,
                    quiz: <FiCheckSquare size={18} />,
                    lecture: <FiBook size={18} />,
                  }[content.type as ContentType] || null}
                </div>

                <div className="flex-1 min-w-0">
                  {editingContentId === content._id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        defaultValue={content.title}
                        onBlur={(e) => editContentName(e.target.value)}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                      <textarea
                        defaultValue={content.description}
                        onBlur={(e) => editContentName(null, e.target.value)}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-medium text-gray-800 truncate">
                        {content.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {content.description}
                      </p>
                      {content.filePath && (
                        <button
                          onClick={() => setIsOpen(true)}
                          className="mt-2 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm"
                        >
                          <FiFile size={14} />
                          <span>View File</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingContentId(content._id);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                >
                  <FiEdit size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteContent();
                  }}
                  disabled={isDeleting}
                  className="p-2 hover:bg-red-50 rounded-lg text-red-500 disabled:opacity-50"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
