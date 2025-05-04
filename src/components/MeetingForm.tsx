import { useState } from "react";
import toast from "react-hot-toast";
import { putFetch } from "../utils/apiCall";
import { useLanguage } from "../context/LanguageContext";

type MeetingFormProps = {
  meetingDetails: any;
  courseId: string;
  setShowMeetingForm: (show: boolean) => void;
  setMeetingDetails: (details: any) => void;
  setCourseList?: () => void;
};

const translations = {
  en: {
    editMeeting: "Edit Meeting",
    createMeeting: "Create Meeting",
    title: "Meeting Title",
    description: "Meeting Description",
    link: "Meeting Link",
    cancel: "Cancel",
    save: "Save Meeting",
    success: "Meeting details updated successfully",
    error: "Failed to update meeting details",
  },
  ar: {
    editMeeting: "تعديل الاجتماع",
    createMeeting: "إنشاء اجتماع",
    title: "عنوان الاجتماع",
    description: "وصف الاجتماع",
    link: "رابط الاجتماع",
    cancel: "إلغاء",
    save: "حفظ الاجتماع",
    success: "تم تحديث تفاصيل الاجتماع بنجاح",
    error: "فشل في تحديث تفاصيل الاجتماع",
  },
};

const MeetingForm = ({
  meetingDetails,
  courseId,
  setShowMeetingForm,
  setMeetingDetails,
  setCourseList,
}: MeetingFormProps) => {
  const [localMeeting, setLocalMeeting] = useState(meetingDetails || {});
  const [loading, setLoading] = useState(false);
  const { language } = useLanguage();
  const t = translations[language];

  const handleMeetingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result: any = await putFetch(
        `/user/teacher/course?courseId=${courseId}`,
        { meetingDetails: localMeeting }
      );

      if (result.success) {
        setShowMeetingForm(false);
        setMeetingDetails(localMeeting);
        toast.success(t.success);
        setCourseList?.();
      }
    } catch (error) {
      toast.error(t.error);
      console.error("Error updating meeting:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6 mt-4">
      <h3 className="text-xl font-semibold mb-6">
        {meetingDetails?.title ? t.editMeeting : t.createMeeting}
      </h3>

      <form onSubmit={handleMeetingSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t.title}
          </label>
          <input
            type="text"
            placeholder={t.title}
            value={localMeeting.title || ""}
            onChange={(e) =>
              setLocalMeeting((prev: any) => ({
                ...prev,
                title: e.target.value,
              }))
            }
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-black dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t.description}
          </label>
          <textarea
            placeholder={t.description}
            value={localMeeting.description || ""}
            onChange={(e) =>
              setLocalMeeting((prev: any) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-black dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t.link}
          </label>
          <input
            type="url"
            placeholder={t.link}
            value={localMeeting.link || ""}
            onChange={(e) =>
              setLocalMeeting((prev: any) => ({
                ...prev,
                link: e.target.value,
              }))
            }
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-black dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div className="flex gap-4 justify-end mt-6">
          <button
            type="button"
            onClick={() => setShowMeetingForm(false)}
            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-5 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary/90 transition"
          >
            {loading ? `${t.save}...` : t.save}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MeetingForm;
