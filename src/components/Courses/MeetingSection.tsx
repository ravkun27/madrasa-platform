import { MeetingDetails } from "../../types";

export const MeetingSection = ({
  meeting,
}: {
  meeting: MeetingDetails | null;
}) => {
  if (!meeting) return null;

  return (
    <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-blue-800">
            {meeting.title}
            {/* {meeting.isLive && (
              <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full animate-pulse">
                LIVE
              </span>
            )} */}
          </h3>
          <p className="text-blue-600">{meeting.description}</p>
        </div>
        <a
          href={meeting?.link}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Join Now
        </a>
      </div>
      {/* {meeting.scheduledTime && (
        <div className="mt-2 text-sm text-blue-500">
          Scheduled: {new Date(meeting.scheduledTime).toLocaleString()}
        </div>
      )} */}
    </div>
  );
};
