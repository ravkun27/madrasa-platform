import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronDown,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiCheck,
  FiX,
  FiUsers,
  FiLock,
  FiUnlock,
  FiImage,
} from "react-icons/fi";
import "react-image-crop/dist/ReactCrop.css";
import { useState, useRef, useEffect } from "react";
import {
  deleteFetch,
  postFetch,
  putFetch,
  getFetch,
} from "../../utils/apiCall";
import { useCourseActions } from "../../hooks/useCourseActions";
import { Section } from "./Section";
import { removeNullAndUndefinedFields } from "../../utils/utilsMethod/removeNullFiled";
import toast from "react-hot-toast";
import { ConfirmationModal } from "../../components/Modal/ConfiramtionModal";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Crop } from "react-image-crop";

export const Courses = ({ course }: { course: any }) => {
  const { setCourseList } = useCourseActions();
  const [isPublished, setIsPublished] = useState(course?.published);
  const [isLocked, setIsLocked] = useState(course?.locked || false);
  const [newSection, setNewSection] = useState({ title: "", description: "" });
  const [expandedCourses, setExpandedCourses] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [tempCourseData, setTempCourseData] = useState({
    title: course.title,
    description: course.description,
  });
  const [isHoveringBanner, setIsHoveringBanner] = useState(false);
  const [newBanner, setNewBanner] = useState<File | null>(null);
  const [showStudents, setShowStudents] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showKickConfirm, setShowKickConfirm] = useState(false);
  const [studentToKick, setStudentToKick] = useState<string | null>(null);
  const [addSectionToggle, setAddSectionToggle] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cropping, setCropping] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const dummyStudents = [
    "John Doe",
    "Jane Smith",
    "Alice Johnson",
    "Bob Brown",
    "Charlie Davis",
  ];

  useEffect(() => {
    if (addSectionToggle && !newSection.title && !newSection.description) {
      const timer = setTimeout(() => setAddSectionToggle(false), 5000); // Hide after 5 sec
      return () => clearTimeout(timer); // Cleanup on component unmount
    }
  }, [addSectionToggle, newSection]);
  const toggleLock = async () => {
    // try {
    //   const result: any = await putFetch(
    //     `/user/teacher/course/lock?courseId=${course._id}&locked=${!isLocked}`,
    //     {}
    //   );
    //   if (result.success) {
    setIsLocked(!isLocked);
    toast.success(`Course ${!isLocked ? "locked" : "unlocked"} successfully`);
    //   }
    // } catch (error) {
    //   toast.error("Failed to update lock status");
    //   console.error("Error updating lock status:", error);
    // }
  };

  // const kickStudent = async () => {
    // setShowKickConfirm(true);
    // try {
    //   const result: any = await deleteFetch(
    //     `/user/teacher/course/student?courseId=${course._id}&studentId=${studentId}`
    //   );
    //   if (result.success) {
    // setCourseList();
    // toast.success("Student removed successfully");
    //   }
    // } catch (error) {
    //   toast.error("Failed to remove student");
    //   console.error("Error removing student:", error);
    // }
  // };

  const handleBannerChange = async () => {
    if (!newBanner) return;

    try {
      // Get signed URL
      const uploadUrlResult: any = await getFetch(
        `/user/teacher/course/getUpdateLink?filename=banner&contentType=${newBanner.type}&courseId=${course._id}`
      );

      if (uploadUrlResult?.success) {
        // Upload file
        await fetch(uploadUrlResult.data.signedUrl, {
          method: "PUT",
          body: newBanner,
          headers: { "Content-Type": newBanner.type },
        });

        // Update course with new banner URL
        await putFetch(`/user/teacher/course?courseId=${course._id}`, {
          banner: uploadUrlResult.data.fileKey,
        });

        setCourseList();
        toast.success("Banner updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update banner");
      console.error("Error updating banner:", error);
    } finally {
      setNewBanner(null);
    }
  };

  const addSection = async (courseId: string) => {
    try {
      const result: any = await postFetch(
        `/user/teacher/course/section?courseId=${courseId}`,
        { ...newSection }
      );

      if (result.success) {
        setNewSection({ title: "", description: "" });
        setCourseList();
        toast.success("Section added successfully");
      }
    } catch (error) {
      toast.error("Failed to add section");
      console.error("Error adding section:", error);
    }
  };

  const publishCourse = async (courseId: string, isPublished: boolean) => {
    toast.custom((t) => (
      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col gap-4">
        <p className="text-lg font-medium text-gray-800">
          Are you sure you want to {isPublished ? "unpublish" : "publish"} this
          course?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              handlePublish(courseId, isPublished);
            }}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Confirm
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  };

  const handlePublish = async (courseId: string, isPublished: boolean) => {
    setIsPublished(!isPublished);
    try {
      const result: any = await putFetch(
        `/user/teacher/course/publish?courseId=${courseId}&published=${!isPublished}`,
        {}
      );
      if (result.success) {
        setCourseList();
        toast.success(
          `Course ${!isPublished ? "published" : "unpublished"} successfully`
        );
      }
    } catch (error) {
      toast.error("Failed to publish course");
      console.error("Error publishing course:", error);
    }
  };

  const editCourseName = async () => {
    try {
      const result: any = await putFetch(
        `/user/teacher/course?courseId=${course._id}`,
        { ...removeNullAndUndefinedFields(tempCourseData) }
      );
      if (result.success) {
        setCourseList();
        toast.success("Course updated successfully");
        setEditingCourseId(null);
      }
    } catch (error) {
      toast.error("Failed to update course");
      console.error("Error updating course:", error);
    }
  };

  const deleteCourse = async () => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      const result: any = await deleteFetch(
        `/user/teacher/course?courseId=${course._id}`
      );
      if (result.success) {
        setCourseList();
        toast.success("Course deleted successfully");
      }
    } catch (error) {
      toast.error("Failed to delete course");
      console.error("Error deleting course:", error);
    }
  };

  const BannerEditButton = () => (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg transition-opacity">
      <button
        className="p-2.5 text-white bg-gray-800/50 rounded-xl hover:bg-gray-800/80 transition-colors flex items-center gap-2"
        onClick={() => fileInputRef.current?.click()}
      >
        <FiImage size={20} />
        <span className="text-sm font-medium">Change Banner</span>
      </button>
    </div>
  );

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setSelectedImage(reader.result as string);
        setCropping(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCropComplete = async () => {
    if (!imgRef.current || !crop) return;

    const croppedImage = await getCroppedImg(imgRef.current, crop);
    setNewBanner(croppedImage);
    setCropping(false);
    setSelectedImage(null);
  };

  const getCroppedImg = (
    image: HTMLImageElement,
    crop: Crop
  ): Promise<File> => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(new File([blob], "banner.jpg", { type: "image/jpeg" }));
        }
      }, "image/jpeg");
    });
  };

  return (
    <>
      {showDeleteConfirm && (
        <ConfirmationModal
          message="Are you sure you want to delete this course?"
          onConfirm={() => {
            deleteCourse();
            setShowDeleteConfirm(false);
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {showKickConfirm && studentToKick && (
        <ConfirmationModal
          message="Are you sure you want to remove this student?"
          onConfirm={() => {
            // kickStudent(studentToKick);
            setShowKickConfirm(false);
          }}
          onCancel={() => setShowKickConfirm(false)}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmationModal
          message="Are you sure you want to delete this course?"
          onConfirm={() => {
            deleteCourse();
            setShowDeleteConfirm(false);
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {newBanner && (
        <ConfirmationModal
          message="Are you sure you want to update the course banner?"
          onConfirm={handleBannerChange}
          onCancel={() => setNewBanner(null)}
        />
      )}

      {/* Crop Modal */}
      <AnimatePresence>
        {cropping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-3xl w-full"
            >
              <div className="mb-4">
                <h3 className="text-xl font-semibold">Crop Banner</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Select area for your course banner
                </p>
              </div>

              {selectedImage && (
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  aspect={6 / 1}
                  className="max-h-[70vh] w-full"
                >
                  <img
                    ref={imgRef}
                    src={selectedImage}
                    alt="Crop preview"
                    className="w-full h-auto"
                  />
                </ReactCrop>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setCropping(false)}
                  className="px-5 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropComplete}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                >
                  Save Crop
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key={course._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      >
        {/* Banner Section */}
        <div className="relative aspect-[6/1] bg-gray-100 dark:bg-gray-900">
          {course.banner && (
            <div
              className="relative h-full w-full"
              onMouseEnter={() => setIsHoveringBanner(true)}
              onMouseLeave={() => setIsHoveringBanner(false)}
            >
              <img
                src={course.banner}
                alt="Course banner"
                className="w-full h-full object-cover"
              />
              {isHoveringBanner && <BannerEditButton />}
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
        </div>

        {/* Content Section */}
        <div className="p-6">
          {/* Header Row */}
          <div className="flex-1 space-y-2">
            {editingCourseId === course._id ? (
              // Edit Mode Content
              <div className="space-y-4">
                <input
                  type="text"
                  value={tempCourseData.title}
                  onChange={(e) =>
                    setTempCourseData({
                      ...tempCourseData,
                      title: e.target.value,
                    })
                  }
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 text-lg font-semibold"
                />
                <textarea
                  value={tempCourseData.description}
                  onChange={(e) =>
                    setTempCourseData({
                      ...tempCourseData,
                      description: e.target.value,
                    })
                  }
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 text-sm h-32"
                />
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={editCourseName}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 text-sm"
                  >
                    <FiCheck size={18} />
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingCourseId(null)}
                    className="flex items-center gap-2 bg-gray-200 px-5 py-2.5 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 text-sm"
                  >
                    <FiX size={18} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Display Mode Content
              <div className="flex-1 space-y-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {course.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {course.description}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingCourseId(editingCourseId ? null : course._id);
                }}
                className=" p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
              >
                <FiEdit size={20} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                className="p-2.5 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg text-red-500"
              >
                <FiTrash2 size={20} />
              </button>
              <motion.div
                animate={{
                  rotate: expandedCourses ? 180 : 0,
                }}
                className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                onClick={() => setExpandedCourses(!expandedCourses)}
              >
                <FiChevronDown size={24} />
              </motion.div>
            </div>
          </div>
        </div>
        {/* Expandable Content */}
        <AnimatePresence>
          {expandedCourses && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-2 md:p-6"
            >
              {/* Students Section */}
              <div className="bg-gray-50 dark:bg-gray-700/30 p-1 md:p-4 rounded-xl">
                <div className="flex items-center justify-between mb-1 md:mb-3">
                  <button
                    onClick={() => setShowStudents(!showStudents)}
                    className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    <FiUsers size={20} />
                    <span className="font-medium">
                      {showStudents ? "Hide Students" : "Show Students"} (
                      {dummyStudents.length})
                    </span>
                  </button>
                  <button
                    onClick={toggleLock}
                    className="relative flex items-center justify-center w-10 h-10 rounded-lg text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white group"
                  >
                    {isLocked ? (
                      <FiLock size={24} className="text-red-600" />
                    ) : (
                      <FiUnlock size={24} className="text-green-600" />
                    )}
                    <span className="absolute top-full mt-2 px-3 py-1 text-sm bg-gray-800 text-white rounded opacity-0 transition-opacity duration-100 group-hover:opacity-100">
                      {isLocked ? "Unlock Course" : "Lock Course"}
                    </span>
                  </button>
                </div>

                {showStudents && (
                  <div className="py-3">
                    {dummyStudents.map((student) => (
                      <div
                        key={student}
                        className="flex items-center justify-between p-3"
                      >
                        <span className="text-gray-600 dark:text-gray-300">
                          {student}
                        </span>
                        <button
                          onClick={() => {
                            setStudentToKick(student);
                            setShowKickConfirm(true);
                          }}
                          className="text-red-500 hover:text-red-600 text-sm flex items-center gap-2"
                        >
                          <FiTrash2 size={16} />
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Section Form */}
              <div className="py-4">
                {addSectionToggle && (
                  <div className="grid gap-4 md:grid-cols-2 duration-100">
                    <input
                      type="text"
                      placeholder="Section Title"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                      value={newSection.title}
                      onChange={(e) =>
                        setNewSection({
                          ...newSection,
                          title: e.target.value,
                        })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Section Description"
                      className="w-full p-3 border rounded-lg focus:ring-2 mb-4 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                      value={newSection.description}
                      onChange={(e) =>
                        setNewSection({
                          ...newSection,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
                <button
                  onClick={() => {
                    if (
                      newSection.title.trim() &&
                      newSection.description.trim()
                    ) {
                      addSection(course._id);
                    } else {
                      setAddSectionToggle(true); // Show inputs if they're not filled
                    }
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 text-base"
                >
                  <FiPlus size={20} />
                  Add New Section
                </button>
              </div>

              {/* Sections List */}
              <div className="space-y-4">
                {course?.sectionIds?.map((section: any, index: number) => (
                  <Section
                    key={section._id}
                    section={section}
                    courseId={course._id}
                    sectionNum={index + 1}
                  />
                ))}
              </div>

              {/* Publish Button */}
              <div className="py-4">
                <button
                  onClick={() => publishCourse(course._id, isPublished)}
                  className={`w-full py-3.5 rounded-xl transition-colors text-base font-medium ${
                    isPublished || !course.sectionIds?.length
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  {isPublished ? "Published ✓" : "Publish Course"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};
