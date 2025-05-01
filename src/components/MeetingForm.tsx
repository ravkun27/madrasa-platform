import { useState } from "react";
import toast from "react-hot-toast";
import { putFetch } from "../utils/apiCall";

type MeetingFormProps = {
  meetingDetails: any;
  courseId: string;
  setShowMeetingForm: (show: boolean) => void;
  setMeetingDetails: (details: any) => void;
  setCourseList?: () => void; // optional if you may not always pass it
};

const MeetingForm = ({
  meetingDetails,
  courseId,
  setShowMeetingForm,
  setMeetingDetails,
  setCourseList,
}: MeetingFormProps) => {
  const [localMeeting, setLocalMeeting] = useState(meetingDetails || {});

  const handleMeetingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const result: any = await putFetch(
        `/user/teacher/course?courseId=${courseId}`,
        { meetingDetails: localMeeting }
      );

      if (result.success) {
        setShowMeetingForm(false);
        setMeetingDetails(localMeeting);
        toast.success("Meeting details updated successfully");
        setCourseList?.(); // optional chaining
      }
    } catch (error) {
      toast.error("Failed to update meeting details");
      console.error("Error updating meeting:", error);
    }
  };

  return (
    <div className="bg-card rounded-lg mt-4">
      <h3 className="text-lg font-semibold mb-4">
        {meetingDetails?.title ? "Edit" : "Create"} Meeting
      </h3>

      <form onSubmit={handleMeetingSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Meeting Title"
          value={localMeeting.title || ""}
          onChange={(e) =>
            setLocalMeeting((prev: any) => ({
              ...prev,
              title: e.target.value,
            }))
          }
          className="w-full p-2 border rounded text-text bg-input-bg"
          required
        />
        <textarea
          placeholder="Meeting Description"
          value={localMeeting.description || ""}
          onChange={(e) =>
            setLocalMeeting((prev: any) => ({
              ...prev,
              description: e.target.value,
            }))
          }
          className="w-full p-2 border rounded text-text bg-input-bg"
          required
        />
        <input
          type="url"
          placeholder="Meeting Link"
          value={localMeeting.link || ""}
          onChange={(e) =>
            setLocalMeeting((prev: any) => ({
              ...prev,
              link: e.target.value,
            }))
          }
          className="w-full p-2 border rounded text-text bg-input-bg"
          required
        />
        <div className="flex gap-6 justify-end">
          <button
            type="button"
            onClick={() => setShowMeetingForm(false)}
            className="bg-gray-200 text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-primary rounded-xl"
          >
            Save Meeting
          </button>
        </div>
      </form>
    </div>
  );
};

export default MeetingForm;
