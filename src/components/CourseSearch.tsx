import { useEffect, useState } from "react";
import { getFetch } from "../utils/apiCall";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, School } from "lucide-react";

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor?: string;
  enrolledStudents?: number;
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
  const [isSearching, setIsSearching] = useState(false);
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
    if (!courseId) {
      setSearchError("Please enter a course code");
      return;
    }

    if (!/^[0-9a-fA-F]{24}$/.test(courseId)) {
      setFoundCourse(null);
      setSearchError("Invalid Course ID format");
      return;
    }

    setIsSearching(true);
    setSearchError("");

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
    } finally {
      setIsSearching(false);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 md:px-0">
      <div className="mb-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
          Find Your Course
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Enter a course code to join a class
        </p>
      </div>

      {/* Search input group */}
      <div className="relative group mb-2">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>

        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter 24-character course ID"
          className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-3 pl-10 pr-20 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
          aria-label="Course ID"
        />

        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md font-medium transition-colors disabled:bg-blue-400 shadow-sm"
        >
          {isSearching ? (
            <div className="flex items-center gap-1">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Searching</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="hidden sm:inline">Search</span>
              <Search className="h-4 w-4 sm:hidden" />
            </div>
          )}
        </button>
      </div>

      {/* Error message */}
      {searchError && (
        <div className="mt-2 text-center text-red-500 text-sm font-medium">
          {searchError}
        </div>
      )}

      {/* Found course card */}
      {foundCourse && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-xl">
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  {foundCourse.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 truncate">
                  ID: {foundCourse._id}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full flex-shrink-0 ml-2">
                <School className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 text-sm mt-3">
              {foundCourse.description}
            </p>

            {(foundCourse.instructor || foundCourse.enrolledStudents) && (
              <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                {foundCourse.instructor && (
                  <div>Instructor: {foundCourse.instructor}</div>
                )}
                {foundCourse.enrolledStudents && (
                  <div>{foundCourse.enrolledStudents} students</div>
                )}
              </div>
            )}

            <div className="mt-5">
              <button
                onClick={handleJoinClick}
                disabled={isEnrolling}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 transition-all disabled:bg-blue-400 flex items-center justify-center gap-2 shadow-sm"
              >
                {isEnrolling ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Enrolling...</span>
                  </>
                ) : user ? (
                  "Join Course"
                ) : (
                  "Sign Up to Join"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseSearch;
