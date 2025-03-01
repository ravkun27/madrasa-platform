import { deleteFetch, getFetch, putFetch } from '../../utils/apiCall';
import { motion, AnimatePresence } from "framer-motion";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useCourseActions } from '../../hooks/useCourseActions';
import { removeNullAndUndefinedFields } from '../../utils/utilsMethod/removeNullFiled';
import { useCourses } from '../../context/CourseContext';
import { MediaModal } from '../../components/MediaModal';

export const Content = ({ sectionId, courseId, contentId }: { sectionId: any, courseId: any, contentId: any }) => {
    const { setCourseList } = useCourseActions();
    const { courses } = useCourses()
    const [editingContentId, setEditingContentId] = useState<string | null>(null);


    const [isOpen, setIsOpen] = useState(false);




    const deleteContent = async () => {
        try {
            const result: any = await deleteFetch(
                `/user/teacher/course/lesson?lessonId=${contentId}&courseId=${courseId}&sectionId=${sectionId}`
            );
            if (result.success) setCourseList();
        } catch (error) {
            console.error("Error deleting content:", error);
        }
    };

    const [content, setContent] = useState<any>(null)


    const editContentName = async (
        newName: string | null = null,
        newDes: string | null = null,
    ) => {
        try {
            const result: any = await putFetch(
                `/user/teacher/course/lesson?lessonId=${contentId}&courseId=${courseId}`,
                { ...(removeNullAndUndefinedFields({ title: newName, description: newDes })) }
            );
            if (result.success) setCourseList();
        } catch (error) {
            console.error("Error updating content:", error);
        }
        setEditingContentId(null);
    };

    const getContent = async () => {
        const content: any = await getFetch(`/user/teacher/course/lesson?lessonId=${contentId}&courseId=${courseId}`) ?? null
        setContent(content?.lesson)
    }

    useEffect(() => {
        getContent()
    }, [courses])

    return (<>
        <MediaModal
            url={content?.filePath}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
        />

        {
            !content ? <div>loading...</div> : <AnimatePresence>
                <div className="space-y-2">
                    <motion.div
                        key={content._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: 0.5,
                            ease: "easeInOut",
                        }}
                        className="bg-white p-3 rounded-lg shadow-xs"
                    >
                        <div className="flex items-center gap-2">
                            <span
                                className={`inline-block w-2 h-2 rounded-full ${content.type === "video"
                                    ? "bg-red-500"
                                    : content.type === "quiz"
                                        ? "bg-blue-500"
                                        : "bg-green-500"
                                    }`}
                            />
                            <div>
                                {editingContentId === content._id ? (
                                    <input
                                        type="text"
                                        defaultValue={content.title}
                                        onBlur={(e) =>
                                            editContentName(
                                                e.target.value
                                            )
                                        }
                                        className="p-1 border rounded"
                                    />
                                ) : (
                                    <p className="font-medium">
                                        {content.title}
                                    </p>
                                )}
                                {editingContentId === content._id ? (
                                    <input
                                        type="text"
                                        defaultValue={content.description}
                                        onBlur={(e) =>
                                            editContentName(null,
                                                e.target.value
                                            )
                                        }
                                        className="p-1 border rounded"
                                    />
                                ) : (
                                    <p className="font-medium">
                                        {content.description}
                                    </p>
                                )}
                                {content.filePath && (
                                    <a
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline"
                                        onClick={() => {
                                            getContent()
                                            setIsOpen(true)
                                        }}
                                    >
                                        View File
                                    </a>


                                )}
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingContentId(content._id);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FaEdit />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteContent();
                                }}
                                className="text-red-500 hover:text-red-700"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </AnimatePresence>
        }

    </>

    )
}
