import { useState } from "react";
import { FiClock, FiCopy, FiLink, FiVideo } from "react-icons/fi";
import { motion } from "framer-motion";
import { postFetch, getFetch } from "../utils/apiCall";
import toast from "react-hot-toast";
import { apiUrl } from "../config";

const durationOptions = [15, 30, 40, 60];

export const GoogleMeetCreator = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [meetLink, setMeetLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(30);
  const [meetingDetails, setMeetingDetails] = useState<any>(null);

  const handleGoogleAuth = () => {
    window.location.href = `${apiUrl}/meet/auth/google`;
  };
  const checkAuthStatus = async () => {
    try {
      const data: any = await getFetch(`/meet/auth/google/status`);
      setUserId(data.userId);
      setDisplayName(data.displayName);
      toast.success("Google authentication successful!");
    } catch (error: any) {
      toast.error("Authentication check failed");
      console.error("Auth Status Error:", error.data || error.message);
    }
  };

  const createMeeting = async () => {
    if (!userId) {
      toast.error("Please authenticate with Google first.");
      return;
    }

    setLoading(true);
    try {
      const data: any = await postFetch(`/meet/create-google-meeting`, {
        title,
        duration,
      });

      setMeetLink(data.meetLink);
      setMeetingDetails(data);
      toast.success("Meeting created successfully!");
    } catch (error: any) {
      toast.error("Failed to create meeting");
      console.error("Meeting Creation Error:", error?.data || error?.message);
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg max-w-2xl mx-auto mb-8"
    >
      <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
        <FiVideo className="text-blue-500" />
        Schedule Google Meet
      </h2>

      {!userId ? (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Connect your Google account to schedule meetings
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleGoogleAuth}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              Connect Google Account
            </button>
            <button
              onClick={checkAuthStatus}
              className="bg-gray-200 dark:bg-gray-700 px-6 py-3 rounded-lg flex items-center gap-2"
            >
              <FiVideo /> Connect Google Account
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="font-bold capitalize">
            Authenticated as: {displayName}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                placeholder="Meeting title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Duration</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {durationOptions.map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setDuration(mins)}
                    className={`p-3 rounded-lg border ${
                      duration === mins
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                    }`}
                  >
                    {mins} minutes
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={createMeeting}
            disabled={loading || !title}
            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? "Creating..." : "Schedule Meeting"}
          </button>

          {meetLink && (
            <div className="mt-6 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <FiLink className="text-blue-500 flex-shrink-0" />
                  <span className="font-medium">Meeting Link:</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiVideo className="text-blue-500 flex-shrink-0" />
                  <span className="font-medium">Join Meeting:</span>
                  <a
                    href={meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline truncate"
                  >
                    {meetLink}
                  </a>
                  <button
                    onClick={() => copyToClipboard(meetLink)}
                    className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg"
                  >
                    <FiCopy className="text-blue-500" />
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/20 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <FiClock className="text-gray-500 flex-shrink-0" />
                  <span className="font-medium">Scheduled Time:</span>
                </div>
                <p>
                  {new Date(meetingDetails.startTime).toLocaleString()} -{" "}
                  {new Date(meetingDetails.endTime).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
