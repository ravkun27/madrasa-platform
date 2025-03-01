import { deleteFetch, patchFetch } from '../../utils/apiCall';
import { motion, AnimatePresence } from "framer-motion";
import { FaEdit, FaTrash, FaChevronDown } from "react-icons/fa";
import { useState } from "react";
import { useCourseActions } from '../../hooks/useCourseActions';
import { ContentType } from "../../types";
import ContentEditModal from './ContentEditModal';
import { Content } from './Content';

export const Section = ({ section, courseId }: { section: any, courseId: any }) => {
    const { setCourseList } = useCourseActions();
    const [isAddingContent, setIsAddingContent] = useState(false);
    const [editingContentId, setEditingContentId] = useState<string | null>(null);
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(
        new Set()
    );

    const [addingContent, setAddingContent] = useState<{
        courseId: string;
        sectionId: string;
        type: ContentType | null;
    } | null>(null);
    const toggleSection = (sectionId: string) => {
        setExpandedSections((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(sectionId)) {
                newSet.delete(sectionId);
            } else {
                newSet.add(sectionId);
            }
            return newSet;
        });
    };
    const deleteContent = async (
        courseId: string,
        sectionId: string,
        contentId: string
    ) => {
        try {
            const result: any = await deleteFetch(
                `/user/teacher/course/content?courseId=${courseId}&sectionId=${sectionId}&contentId=${contentId}`
            );
            if (result.success) setCourseList();
        } catch (error) {
            console.error("Error deleting content:", error);
        }
    };

    const deleteSection = async (courseId: string, sectionId: string) => {
        try {
            const result: any = await deleteFetch(
                `/user/teacher/course/section?courseId=${courseId}&sectionId=${sectionId}`
            );
            if (result.success) setCourseList();
        } catch (error) {
            console.error("Error deleting section:", error);
        }
    };
    const editSectionName = async (
        courseId: string,
        sectionId: string,
        newName: string
    ) => {
        try {
            const result: any = await patchFetch(
                `/user/teacher/course/section?courseId=${courseId}&sectionId=${sectionId}`,
                { title: newName }
            );
            if (result.success) setCourseList();
        } catch (error) {
            console.error("Error updating section:", error);
        }
        setEditingSectionId(null);
    };

    return (<>

        {
            isAddingContent &&
            <ContentEditModal addingContent={addingContent} setAddingContent={setAddingContent} setIsAddingContent={setIsAddingContent} />
        }
        <div
            key={section._id}
            className="bg-gray-50 p-4 rounded-lg"
        >
            <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection(section._id)}
            >
                <div className="flex items-center gap-2">
                    {editingSectionId === section._id ? (
                        <input
                            type="text"
                            defaultValue={section.title}
                            onBlur={(e) =>
                                editSectionName(
                                    courseId,
                                    section._id,
                                    e.target.value
                                )
                            }
                            className="p-1 border rounded"
                        />
                    ) : (
                        <h3 className="font-medium">
                            {section.title}
                        </h3>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditingSectionId(section._id);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FaEdit />
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            deleteSection(courseId, section._id);
                        }}
                        className="text-red-500 hover:text-red-700"
                    >
                        <FaTrash />
                    </button>
                    <motion.div
                        animate={{
                            rotate: expandedSections.has(section._id)
                                ? 180
                                : 0,
                        }}
                    >
                        <FaChevronDown />
                    </motion.div>
                </div>
            </div>
            <AnimatePresence>
                {expandedSections.has(section._id) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{
                            duration: 0.2,
                            ease: "easeInOut",
                        }} // Adjust transition timing
                        className="mt-4 space-y-2"
                    >
                        <div className="flex gap-2 mb-4">
                            {["video", "quiz", "lecture"].map(
                                (type) => (
                                    <button
                                        key={type}
                                        onClick={() => {
                                            setAddingContent({
                                                courseId: courseId,
                                                sectionId: section._id,
                                                type: type as ContentType,
                                            })
                                            setIsAddingContent(true)
                                        }}
                                        className="bg-green-500 text-white px-3 py-1.5 rounded-md text-sm capitalize hover:bg-green-600 transition-colors"
                                    >
                                        Add {type}
                                    </button>
                                )
                            )}
                        </div>

                        <div className="space-y-2">
                            {section?.lessonIds?.map((contentId: any) => (
                            <Content contentId={contentId} sectionId={section._id} courseId={courseId}/>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </>

    )
}
