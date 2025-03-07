// ContentEditModal.tsx
import { getFetch, postFetch } from "../../utils/apiCall";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useCourseActions } from "../../hooks/useCourseActions";
import { FiX, FiUploadCloud } from "react-icons/fi";
import toast from "react-hot-toast";

const ContentEditModal = ({
  addingContent,
  setAddingContent,
  setIsAddingContent,
}: {
  addingContent: any;
  setAddingContent: any;
  setIsAddingContent: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { setCourseList } = useCourseActions();
  const [contentDetails, setContentDetails] = useState({
    name: "",
    description: "",
    file: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddContent = async () => {
    if (!addingContent || !contentDetails.name.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      let filePath = null;

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
            const result: any = await postFetch(
              `/user/teacher/course/lesson?sectionId=${addingContent.sectionId}&courseId=${addingContent.courseId}`,
              {
                title: contentDetails.name,
                description: contentDetails.description,
                filePath: filePath,
                fileType: contentDetails.file.type,
              }
            );

            if (result.success) {
              toast.success(`${addingContent.type} added successfully`);
              setAddingContent(null);
              setIsAddingContent(false);
              setContentDetails({ name: "", description: "", file: null });
              setCourseList();
            }
          }
        }
      }
    } catch (error) {
      toast.error("Failed to add content");
      console.error("Error adding content:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="z-50 fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-md"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Add {addingContent?.type}
              </h2>
              <button
                onClick={() => setIsAddingContent(false)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Name
                </label>
                <input
                  type="text"
                  placeholder="Enter content name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={contentDetails.name}
                  onChange={(e) =>
                    setContentDetails({
                      ...contentDetails,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Enter description"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-24"
                  value={contentDetails.description}
                  onChange={(e) =>
                    setContentDetails({
                      ...contentDetails,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File
                </label>
                <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 cursor-pointer transition-colors">
                  <FiUploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600 text-center">
                    {contentDetails.file
                      ? contentDetails.file.name
                      : `Click to upload ${addingContent?.type} file`}
                  </span>
                  <input
                    type="file"
                    accept={
                      addingContent?.type === "video"
                        ? "video/*"
                        : "image/*, application/pdf"
                    }
                    className="hidden"
                    onChange={(e) =>
                      setContentDetails({
                        ...contentDetails,
                        file: e.target.files?.[0] || null,
                      })
                    }
                    required
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 space-y-4">
              <button
                onClick={() => setIsAddingContent(false)}
                className="md:px-6 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddContent}
                disabled={isSubmitting}
                className="md:px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Add Content
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContentEditModal;
