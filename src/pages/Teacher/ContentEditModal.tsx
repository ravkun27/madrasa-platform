import { getFetch, postFetch } from '../../utils/apiCall';
import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import { useCourseActions } from '../../hooks/useCourseActions';

const ContentEditModal = ({ addingContent, setAddingContent, setIsAddingContent }: { addingContent: any, setAddingContent: any, setIsAddingContent: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const { setCourseList } = useCourseActions();
    const [contentDetails, setContentDetails] = useState({
        name: "",
        description: "",
        file: null as File | null,
    });

    const handleAddContent = async () => {
        if (!addingContent || !contentDetails.name.trim()) return;

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
                            }
                        );

                        if (result.success) {
                            setAddingContent(null);
                            setIsAddingContent(false);
                            setContentDetails({ name: "", description: "", file: null });
                            setCourseList();
                        } else {
                            console.error("Failed to add lesson:", result.message);
                        }


                    } else {
                        throw new Error("File upload failed");
                    }
                }
            }
        } catch (er) {
            console.error("Error adding content:", er);
        }
    }

    return (
        <AnimatePresence>
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
                            onClick={() => setIsAddingContent(false)}
                            className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

export default ContentEditModal