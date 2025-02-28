import { AnimatePresence } from "framer-motion";
import { useState } from "react";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "video" | "lecture" | "quiz" | ("zoom" & {});
  onUpload: (file: File) => void;
}

export const FileUploadModal = ({
  isOpen,
  onClose,
  type,
  onUpload,
}: FileUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (file) {
      onUpload(file);
      onClose();
    } else {
      alert("Please select a file to upload.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Upload {type}</h2>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-2 border rounded mb-4"
              accept={
                type === "video"
                  ? "video/*"
                  : type === "lecture"
                  ? "application/pdf"
                  : type === "quiz"
                  ? "application/json"
                  : "*"
              }
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
