import { getFetch, postFetch } from "../../utils/apiCall";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useCourseActions } from "../../hooks/useCourseActions";
import { FiX, FiUploadCloud, FiLink } from "react-icons/fi";
import toast from "react-hot-toast";
import { useLanguage } from "../../context/LanguageContext"; // Import your language context

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
  const { language } = useLanguage(); // Access current language
  const [contentDetails, setContentDetails] = useState({
    name: "",
    description: "",
    file: null as File | null,
    link: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contentType, setContentType] = useState<"file" | "link">("file");
  const isQuiz = addingContent?.type?.toLowerCase() === "quiz";

  const handleAddContent = async () => {
    if (!addingContent || !contentDetails.name.trim()) {
      toast.error(
        language === "en"
          ? "Please fill all required fields"
          : "يرجى ملء جميع الحقول المطلوبة"
      );
      return;
    }

    const isLinkType = contentType === "link";
    const isFileType = contentType === "file";

    if (isLinkType && !contentDetails.link.trim()) {
      toast.error(
        language === "en"
          ? "Please provide a valid link"
          : "يرجى تقديم رابط صالح"
      );
      return;
    }

    if (isFileType && !contentDetails.file) {
      toast.error(language === "en" ? "Please upload a file" : "يرجى رفع ملف");
      return;
    }

    setIsSubmitting(true);
    try {
      let filePath: string | null = null;
      let fileType: string | null = null;
      let link: string | null = null;

      // === Handle File Uploads Only ===
      if (isFileType && contentDetails.file) {
        const uploadUrlResult: any = await getFetch(
          `/user/teacher/course/getUpdateLink?filename=${contentDetails.file.name}&contentType=${contentDetails.file.type}&courseId=${addingContent.courseId}`
        );

        if (uploadUrlResult?.success) {
          const uploadResponse = await fetch(uploadUrlResult.data.signedUrl, {
            method: "PUT",
            body: contentDetails.file,
          });

          if (!uploadResponse.ok) {
            throw new Error("File upload failed");
          }

          filePath = uploadUrlResult.data.fileKey;
          fileType = contentDetails.file.type;
        } else {
          throw new Error("Failed to get signed upload URL");
        }
      }

      // === Handle Link Type ===
      if (isLinkType) {
        link = contentDetails.link.trim();
        filePath = "empty";
        fileType = "link";
      }

      const requestData: any = {
        title: contentDetails.name,
        description: contentDetails.description,
        filePath,
        fileType,
      };

      if (isLinkType) {
        requestData.link = contentDetails.link.trim();
      }

      const result: any = await postFetch(
        `/user/teacher/course/lesson?sectionId=${addingContent.sectionId}&courseId=${addingContent.courseId}`,
        requestData
      );

      if (result.success) {
        setAddingContent(null);
        setIsAddingContent(false);
        setContentDetails({
          name: "",
          description: "",
          file: isFileType ? null : contentDetails.file,
          link: isLinkType ? "" : contentDetails.link,
        });
        setCourseList(); // refetch or refresh course
      } else {
        throw new Error(result.message || "Failed to add content");
      }
    } catch (error) {
      toast.error(
        language === "en" ? "Failed to add content" : "فشل إضافة المحتوى"
      );
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
          className="bg-card text-text rounded-xl shadow-xl w-full max-w-md"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-text">
                {language === "en"
                  ? `Add ${addingContent?.type}`
                  : `إضافة ${addingContent?.type}`}
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
                  {language === "en" ? "Content Name" : "اسم المحتوى"}
                </label>
                <input
                  type="text"
                  placeholder={
                    language === "en"
                      ? "Enter content name"
                      : "أدخل اسم المحتوى"
                  }
                  className="w-full px-4 py-2 border bg-input-bg text-text border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                  {language === "en" ? "Description" : "الوصف"}
                </label>
                <textarea
                  placeholder={
                    language === "en" ? "Enter description" : "أدخل الوصف"
                  }
                  className="w-full px-4 py-2 bg-input-bg text-text border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-24"
                  value={contentDetails.description}
                  onChange={(e) =>
                    setContentDetails({
                      ...contentDetails,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              {/* Type selection for Quiz content */}
              {isQuiz && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "en" ? "Content Type" : "نوع المحتوى"}
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setContentType("file")}
                      className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
                        contentType === "file"
                          ? "bg-indigo-100 text-indigo-700 border border-indigo-300"
                          : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      <FiUploadCloud size={18} />
                      <span>
                        {language === "en" ? "Upload File" : "رفع ملف"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentType("link")}
                      className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
                        contentType === "link"
                          ? "bg-indigo-100 text-indigo-700 border border-indigo-300"
                          : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      <FiLink size={18} />
                      <span>
                        {language === "en" ? "Add Link" : "إضافة رابط"}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Show file upload or link input based on content type */}
              {contentType === "file" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "en" ? "Upload File" : "رفع الملف"}
                  </label>
                  <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 cursor-pointer transition-colors">
                    <FiUploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 text-center">
                      {contentDetails.file
                        ? contentDetails.file.name
                        : language === "en"
                          ? `Click to upload ${addingContent?.type} file`
                          : `انقر لرفع ملف ${addingContent?.type}`}
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
              ) : isQuiz ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "en" ? "Quiz Link" : "رابط الاختبار"}
                  </label>
                  <div className="flex items-center w-full px-4 py-2 border bg-input-bg text-text border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
                    <FiLink className="text-gray-400 mr-2" size={18} />
                    <input
                      type="url"
                      placeholder="https://example.com/quiz"
                      className="w-full bg-transparent focus:outline-none"
                      value={contentDetails.link}
                      onChange={(e) =>
                        setContentDetails({
                          ...contentDetails,
                          link: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex justify-end items-center gap-3 mt-6">
              <button
                onClick={() => setIsAddingContent(false)}
                className="px-6 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {language === "en" ? "Cancel" : "إلغاء"}
              </button>
              <button
                onClick={handleAddContent}
                disabled={isSubmitting}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {language === "en" ? "Add Content" : "إضافة المحتوى"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContentEditModal;
