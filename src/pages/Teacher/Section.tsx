import { deleteFetch, putFetch } from '../../utils/apiCall';
import { motion, AnimatePresence } from "framer-motion";
import { FaEdit, FaTrash, FaChevronDown } from "react-icons/fa";
import { useState } from "react";
import { useCourseActions } from '../../hooks/useCourseActions';
import { ContentType } from "../../types";
import ContentEditModal from './ContentEditModal';
import { Content } from './Content';
import  {removeNullAndUndefinedFields}  from '../../utils/utilsMethod/removeNullFiled';

export const Section = ({ section, courseId ,sectionNum}: { section: any, courseId: any,sectionNum:Number }) => {
    const { setCourseList } = useCourseActions();
    const [isAddingContent, setIsAddingContent] = useState(false);
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
        newName: string | null = null,
        newDes: string | null = null,
    ) => {
        try {
            const result: any = await putFetch(
                `/user/teacher/course/section?courseId=${courseId}&sectionId=${section._id}`,
                { ...(removeNullAndUndefinedFields({title:newName,description:newDes})) }
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
            className="bg-gray-100 border-2 hover:border-black/30 p-4 rounded-lg"
        >
            <span className='p-1 text-2xl font-bold'>
               {`Post-${sectionNum}`}
            </span> 
            <div
                className="flex justify-between items-center cursor-pointer w-full"
            >
                <div className="flex flex-col gap-2">
                    {editingSectionId === section._id ? (
                        <input
                            type="text"
                            defaultValue={section.title}
                            onBlur={(e) =>
                                editSectionName(
                                    e.target.value
                                )
                            }
                            className="p-1 border rounded"
                        />
                    ) : (
                        <h3 className="font-medium text-xl">
                            {section.title}
                        </h3>
                    )}
                    {editingSectionId === section._id ? (
                        <input
                            type="text"
                            defaultValue={section.description}
                            onBlur={(e) =>
                                editSectionName(null,
                                    e.target.value
                                )
                            }
                            className="p-1 border rounded"
                        />
                    ) : (
                        <div className=' bg-gray-100 rounded-md'>
                        <p className="font-normal text-sm text-gray-800">
                            {section.description}
                        </p>
                        </div>
                    )}
                    
                </div>
                <div className="flex items-center gap-2">
                <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditingSectionId(section._id);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FaEdit />
                    </button>
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
                        onClick={() => toggleSection(section._id)}

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
                        <div className="flex gap-2">
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
