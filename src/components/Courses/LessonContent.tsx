import { MediaModal } from "../Modal/MediaModal";
import { Lesson } from "../../types";

export const LessonContent = ({ lesson }: { lesson: Lesson | null }) => {
  if (!lesson) return null;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{lesson.title}</h1>
      <p className="text-gray-600">{lesson.description}</p>
      <div className="mb-8">
        <MediaModal
          url={lesson.filePath}
          contentType={lesson.fileType}
          title={lesson.title}
        />
      </div>
      {lesson.fileType !== "video" && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Resources</h3>
          <a
            target="_blank"
            href={lesson.filePath}
            download
            className="flex items-center p-3 border rounded-lg hover:bg-gray-50"
          >
            <span className="flex-1 font-medium">Download Lesson File</span>
          </a>
        </div>
      )}
    </div>
  );
};
