import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getFetch, postFetch, putFetch } from "../../utils/apiCall";
import { Courses } from "./Courses";
import { Course } from "../../types";
import { useCourseActions } from "../../hooks/useCourseActions";
import { useCourses } from "../../context/CourseContext";

const ManageCourses = () => {
  const [newCourse, setNewCourse] = useState<Partial<Course>>({});
  const [showCourseForm, setShowCourseForm] = useState(false);
  const { setCourseList } = useCourseActions();
  const { courses } = useCourses();

  useEffect(() => { setCourseList() }, [])

  const createCourse = async () => {
    if (!newCourse.title || !newCourse.description || !newCourse.banner)
      return alert("Please fill all fields");

    try {
      const result: any = await postFetch("/user/teacher/course", {
        title: newCourse.title,
        description: newCourse.description,
        category: newCourse.category,
      });

      if (result.success) {
        const uploadUrlResult: any = await getFetch(
          `/user/teacher/course/getUpdateLink?filename=banner&contentType=image/jpeg&courseId=${result.data.course._id}`
        );

        if (uploadUrlResult?.success) {
          await fetch(uploadUrlResult.data.signedUrl, {
            method: "PUT",
            body: newCourse.banner,
          });

          await putFetch(
            `/user/teacher/course?courseId=${result.data.course._id}`,
            { banner: uploadUrlResult.data.fileKey }
          );

          setCourseList();
        }
      }
    } catch (error) {
      console.error("Error creating course:", error);
    }
    setShowCourseForm(false);
    setNewCourse({});
  };

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-text">Manage Courses</h1>
        <button
          onClick={() => setShowCourseForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
        >
          Create New Course
        </button>
      </div>

      <AnimatePresence>
        {showCourseForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-gray-50 rounded-xl p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold mb-4">Create Course</h2>
              <input
                type="text"
                placeholder="Course Title"
                className="w-full mb-4 p-2 border rounded-lg"
                onChange={(e) =>
                  setNewCourse({ ...newCourse, title: e.target.value })
                }
              />
              <textarea
                placeholder="Description"
                className="w-full mb-4 p-2 border rounded-lg"
                onChange={(e) =>
                  setNewCourse({ ...newCourse, description: e.target.value })
                }
              />
              <input
                type="file"
                accept="image/*"
                placeholder="Banner Image URL"
                className="w-full mb-4 p-2 border rounded-lg"
                onChange={(e) =>
                  setNewCourse({ ...newCourse, banner: e?.target?.files?.[0] })
                }
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={createCourse}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCourseForm(false)}
                  className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      <div className="space-y-6">
        <AnimatePresence>
          {Array.isArray(courses) &&
            courses.map((course: any) => (

              <Courses course={course} />
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ManageCourses;
