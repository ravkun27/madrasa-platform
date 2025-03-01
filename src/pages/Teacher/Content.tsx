import { deleteFetch, getFetch } from '../../utils/apiCall';
import { motion, AnimatePresence } from "framer-motion";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useCourseActions } from '../../hooks/useCourseActions';
import { useNavigate } from 'react-router-dom';

export const Content = ({ sectionId, courseId, contentId }: { sectionId: any, courseId: any, contentId: any }) => {
    const { setCourseList } = useCourseActions();

    // const [editingContentId, setEditingContentId] = useState<string | null>(null);

    const deleteContent = async () => {
        try {
            const result: any = await deleteFetch(
                `/user/teacher/course/content?courseId=${courseId}&sectionId=${sectionId}&contentId=${contentId}`
            );
            if (result.success) setCourseList();
        } catch (error) {
            console.error("Error deleting content:", error);
        }
    };

    const [content, setContent] = useState<any>(null)
    const navigate = useNavigate()


    // const editContentName = async (
    //     newName: string
    // ) => {
    //     try {
    //         const result: any = await patchFetch(
    //             `/user/teacher/course/content?courseId=${courseId}&sectionId=${sectionId}&contentId=${contentId}`,
    //             { name: newName }
    //         );
    //         if (result.success) setCourseList();
    //     } catch (error) {
    //         console.error("Error updating content:", error);
    //     }
    //     setEditingContentId(null);
    // };

    // return(<div>hello world   lorem1000</div>)
    const getContent = async () => {
        const content = await getFetch(`/user/teacher/course/lesson?lessonId=${contentId}&courseId=${courseId}`) ?? null
        setContent(content?.lesson)
    }
    useEffect(() => {
        getContent()
    }, [])

    return (<>

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
                                {/* {editingContentId === content._id ? (
                                    <input
                                        type="text"
                                        defaultValue={content.title}
                                        onBlur={(e) =>
                                            editContentName(
                                                courseId,
                                                sectionId,
                                                content._id,
                                                e.target.value
                                            )
                                        }
                                        className="p-1 border rounded"
                                    />
                                ) : ( */}
                                <p className="font-medium">
                                    {content.title}
                                </p>
                                {/* // )} */}
                                <p className="text-sm text-gray-600">
                                    {content.description}
                                </p>
                                {content.filePath && (
                                    <a

                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline"
                                        onClick={() => {
                                            getContent()

                                            window.location.href =
                                                content.filePathF
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
