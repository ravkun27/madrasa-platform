// components/Courses/MeetingBadge.tsx
import { FiVideo } from "react-icons/fi";

export const MeetingBadge = ({
  meetingDetails,
}: {
  meetingDetails?: {
    title: string;
    link: string;
    startTime?: Date;
  };
}) => {
  if (!meetingDetails) return null;

  const isLive =
    meetingDetails.startTime && new Date(meetingDetails.startTime) < new Date();

  return (
    <div className="absolute top-4 right-4 flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
      <FiVideo />
      {isLive ? "Live Now" : "Upcoming Meeting"}
    </div>
  );
};
