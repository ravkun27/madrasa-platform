// CourseSearch.tsx
import { useEffect, useState } from "react";
import { getFetch } from "../utils/apiCall";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

interface Course {
  _id: string;
  title: string;
  description: string;
}

interface Props {
  onEnrollSuccess: () => void;
  user: any; // pass user prop from parent
}

const CourseSearch = ({ onEnrollSuccess, user }: Props) => {
  const [searchValue, setSearchValue] = useState("");
  const [foundCourse, setFoundCourse] = useState<Course | null>(null);
  const [searchError, setSearchError] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);
  const navigate = useNavigate();

  // Check if redirected with saved courseId
  useEffect(() => {
    const savedCourseId = localStorage.getItem("pendingCourseJoin");
    if (savedCourseId && user) {
      handleEnroll(savedCourseId);
      localStorage.removeItem("pendingCourseJoin");
    }
  }, [user]);

  const handleSearch = async () => {
    const courseId = searchValue.trim();
    if (!/^[0-9a-fA-F]{24}$/.test(courseId)) {
      setFoundCourse(null);
      setSearchError("Invalid Course ID format");
      return;
    }

    try {
      const res: any = await getFetch(
        `/user/student/course?courseId=${courseId}`
      );
      if (res.success) {
        setFoundCourse(res.data.course);
        setSearchError("");
      } else {
        setSearchError("Course not found");
        setFoundCourse(null);
      }
    } catch (error) {
      setSearchError("Error searching course");
      console.error("Search error:", error);
    }
  };

  const handleJoinClick = () => {
    if (!foundCourse) return;

    if (!user) {
      // Save course ID and redirect
      localStorage.setItem("pendingCourseJoin", foundCourse._id);
      navigate("/signup");
    } else {
      handleEnroll(foundCourse._id);
    }
  };

  const handleEnroll = async (courseId: string) => {
    setIsEnrolling(true);
    try {
      const res: any = await getFetch(
        `/user/student/course/enroll?courseId=${courseId}`
      );
      if (res.success) {
        toast.success(res.message);
        onEnrollSuccess();
        setFoundCourse(null);
        setSearchValue("");
      }
    } catch (error: any) {
      const errorMessage = error.message || "Enroll failed";
      toast.error(errorMessage);
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mb-12">
      {/* Search box */}
      <motion.div
        className="flex items-center gap-3 bg-card rounded-xl shadow-lg p-2 md:p-4 border border-card-border"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <FaSearch className="text-primary text-xl" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Enter course code to join..."
          className="flex-1 outline-none bg-transparent text-text placeholder-muted"
          aria-label="Course code"
        />
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSearch}
          className="bg-gradient-to-r from-primary to-secondary text-button-text px-2 md:px-5 py- md:py-2.5 rounded-lg shadow-md transition-all whitespace-nowrap font-medium flex items-center gap-2"
        >
          Search
        </motion.button>
      </motion.div>

      {searchError && (
        <div className="mt-2 text-center text-red-600 font-medium">
          {searchError}
        </div>
      )}

      {foundCourse && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-card p-4 rounded-lg shadow-md border border-card-border"
        >
          <h3 className="font-semibold text-lg">{foundCourse.title}</h3>
          <p className="text-gray-600 text-sm mt-1 mb-4">
            {foundCourse.description}
          </p>
          <button
            onClick={handleJoinClick}
            disabled={isEnrolling}
            className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 disabled:bg-gray-400 transition-all"
          >
            {isEnrolling ? "Joining..." : "Join Now"}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default CourseSearch;
