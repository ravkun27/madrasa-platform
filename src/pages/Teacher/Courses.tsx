import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronDown,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiCheck,
  FiX,
  FiUsers,
  FiUnlock,
  FiImage,
  // FiVideo,
  FiLock,
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
import MeetingForm from "../../components/MeetingForm";
// import { format, parseISO, isBefore, isAfter } from "date-fns";
interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export const Courses = ({ course }: { course: any }) => {
  const { setCourseList } = useCourseActions();
  const [isPublished, setIsPublished] = useState(course?.published);
  const [newSection, setNewSection] = useState({ title: "", description: "" });
  const [expandedCourses, setExpandedCourses] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [tempCourseData, setTempCourseData] = useState({
    title: course.title,
    description: course.description,
  });
  const [meetingDetails, setMeetingDetails] = useState(
    course.meetingDetails || {}
  );

  const [isHoveringBanner, setIsHoveringBanner] = useState(false);
  const [newBanner, setNewBanner] = useState<File | null>(null);
  const [isEnrollable, setIsEnrollable] = useState(course?.enrollable || false);
  const [showStudents, setShowStudents] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [addSectionToggle, setAddSectionToggle] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cropping, setCropping] = useState(false);
  const [copied, setCopied] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);

  const [showMeetingForm, setShowMeetingForm] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStudentsForCourse = async (courseId: string) => {
    try {
      const response: any = await getFetch(
        `/user/teacher/course/students?courseId=${courseId}`
      );

      if (Array.isArray(response?.data?.students)) {
        setStudents(response.data.students); // list of students
      } else {
        console.error("Unexpected response format:", response);
        return [];
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      return [];
    }
  };

  const kickStudent = async (courseId: string, studentId: string) => {
    try {
      const result: any = await deleteFetch(
        `/user/teacher/course/student?courseId=${courseId}&studentId=${studentId}`
      );
      if (result.success) {
        setStudents((prev) =>
          prev.filter((student) => student._id !== studentId)
        );
      }
    } catch (error) {
      console.error("Error removing student:", error);
    }
  };

  useEffect(() => {
    fetchStudentsForCourse(course._id);
  }, [showStudents, course._id]);

  useEffect(() => {
    if (addSectionToggle && !newSection.title && !newSection.description) {
      const timer = setTimeout(() => setAddSectionToggle(false), 5000); // Hide after 5 sec
      return () => clearTimeout(timer); // Cleanup on component unmount
    }
  }, [addSectionToggle, newSection]);

  // Toggle enrollable status
  const toggleEnrollable = async () => {
    try {
      const result: any = await putFetch(
        `/user/teacher/course?courseId=${course._id}`,
        {
          enrollable: !isEnrollable,
        }
      );

      if (result.success) {
        setIsEnrollable(!isEnrollable);
        toast.success(
          `Course ${!isEnrollable ? "unlocked" : "locked"} successfully`
        );
      }
    } catch (error) {
      toast.error("Failed to update course status");
      console.error("Error updating course:", error);
    }
  };

  // Check if meeting is live
  // const isMeetingLive =
  //   !!meetingDetails?.startTime && // Ensure startTime is not undefined/null
  //   isBefore(parseISO(meetingDetails.startTime), new Date()) &&
  //   (!meetingDetails.endTime ||
  //     (typeof meetingDetails.endTime === "string" &&
  //       isAfter(parseISO(meetingDetails.endTime), new Date())));

  // Delete meeting handler
  const handleDeleteMeeting = async () => {
    try {
      const result: any = await putFetch(
        `/user/teacher/course?courseId=${course._id}`,
        { meetingDetails: null, published: course.published.value }
      );

      if (result.success) {
        setMeetingDetails(null);
        toast.success("Meeting deleted successfully");
      }
    } catch (error) {
      toast.error("Failed to delete meeting");
      console.error("Error deleting meeting:", error);
    }
  };

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
          Are you sure you want to publish this course?
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
        `/user/teacher/course?courseId=${courseId}`,
        {
          published: true,
        }
      );
      if (result.success) {
        setCourseList();
        toast.success(`Course published successfully`);
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
        {
          ...removeNullAndUndefinedFields(tempCourseData),
          published: course.published.value,
        }
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
  const copyToClipboard = () => {
    navigator.clipboard.writeText(course._id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset "Copied!" after 2s
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
                    loading="lazy"
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
        className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      >
        {/* {isMeetingLive && <LiveMeetingBadge />} */}

        {/* Banner Section */}
        <div className="relative aspect-[6/2] bg-gray-100 dark:bg-gray-900 rounded-t-xl overflow-hidden">
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
                loading="lazy"
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
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Title and Description */}
            <div className="flex-1">
              {editingCourseId === course._id ? (
                // Edit Mode
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
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 text-xl font-bold dark:text-white"
                    placeholder="Course Title"
                  />
                  <textarea
                    value={tempCourseData.description}
                    onChange={(e) =>
                      setTempCourseData({
                        ...tempCourseData,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 text-sm dark:text-gray-200 h-32"
                    placeholder="Course Description"
                  />
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={editCourseName}
                      className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 text-sm transition-colors"
                    >
                      <FiCheck size={18} />
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingCourseId(null)}
                      className="flex items-center gap-2 bg-gray-200 px-5 py-2.5 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 text-sm transition-colors"
                    >
                      <FiX size={18} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // Display Mode
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-3 text-xs">
                    {course.description}
                  </p>
                </div>
              )}
            </div>

            {/* Copy Code Button */}
            <div className="relative group">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
              >
                {copied ? "Copied!" : "Copy Joining Code"}
              </button>
              <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 mt-2 w-max bg-gray-800 text-white text-sm p-2 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                {course._id}
              </div>
            </div>
            {/* Edit and Expand Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingCourseId(editingCourseId ? null : course._id);
                }}
                className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 transition-colors"
              >
                <FiEdit size={20} />
              </button>
              <motion.div
                animate={{
                  rotate: expandedCourses ? 180 : 0,
                }}
                className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
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
              {/* Meetings Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Meetings</h3>
                  <motion.div
                    animate={{
                      rotate: showMeetingForm ? 180 : 0,
                    }}
                    className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                    onClick={() => setShowMeetingForm(!showMeetingForm)}
                  >
                    <FiChevronDown size={24} />
                  </motion.div>
                </div>
                {showMeetingForm && (
                  <MeetingForm
                    meetingDetails={meetingDetails}
                    courseId={course._id}
                    setShowMeetingForm={setShowMeetingForm}
                    setMeetingDetails={setMeetingDetails}
                    setCourseList={setCourseList}
                  />
                )}
                {meetingDetails?.title &&
                  meetingDetails?.link &&
                  !showMeetingForm && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">
                            {meetingDetails.title}
                          </h4>
                          <a
                            target="_blank"
                            href={meetingDetails.link}
                            className="text-blue-600 hover:underline"
                          >
                            Join Meeting
                          </a>
                        </div>
                        <button
                          onClick={handleDeleteMeeting}
                          className="text-red-500 hover:text-red-600 p-2"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )}
              </div>
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
                      {students.length})
                    </span>
                  </button>
                  <button
                    onClick={toggleEnrollable}
                    className="relative flex items-center justify-center w-10 h-10 rounded-lg text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white group"
                  >
                    {isEnrollable ? (
                      <FiUnlock size={20} />
                    ) : (
                      <FiLock size={20} />
                    )}

                    <span className="absolute top-full px-3 py-1 text-sm bg-gray-800 text-white rounded opacity-0 transition-opacity duration-100 group-hover:opacity-100">
                      {isEnrollable ? "Unlock Course" : "Lock Course"}
                    </span>
                  </button>
                </div>

                {showStudents && (
                  <div className="py-3 space-y-2">
                    {students.length > 0 ? (
                      students.map((student) => (
                        <div
                          key={student?._id}
                          className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm"
                        >
                          <span className="text-gray-600 dark:text-gray-300 text-sm">
                            {student?.firstName} {student?.lastName} —{" "}
                            {student?.phoneNumber}
                          </span>
                          <button
                            onClick={() =>
                              kickStudent(course._id, student?._id)
                            }
                            className="text-red-500 hover:text-red-600 p-2"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                        No students enrolled in this course yet.
                      </div>
                    )}
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
                      className="w-full p-3 border rounded-lg focus:ring-2 mb-4 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
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
                      className="w-full p-3 border rounded-lg focus:ring-2 mb-4 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 line-clamp-2 text-sm"
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

              {/* Publish Button and Delete */}
              <div className="mt-4 flex gap-4 p-2">
                <button
                  onClick={() => publishCourse(course._id, isPublished)}
                  className={`w-1/2 py-3.5 rounded-xl transition-colors text-base font-medium ${
                    course.published.value
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  {course.published.value ? "Published" : "Publish Course"}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                  className="w-1/2 py-3.5 text-red-400 hover:text-red-700 bg-white rounded-xl transition-colors border-2 border-red-500"
                >
                  Delete Course
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};
