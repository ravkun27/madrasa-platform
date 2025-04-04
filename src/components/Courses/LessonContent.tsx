import { useState } from "react";
import { MediaModal } from "../Modal/MediaModal";
import {
  Check,
  Download,
  FileText,
  Link,
  FileAudio,
  FileVideo,
  File,
  Circle,
} from "lucide-react";

export const LessonContent = ({ lesson }: { lesson: any }) => {
  const [isCompleted, setIsCompleted] = useState(lesson?.completed || false);

  if (!lesson) return null;

  // Helper function to determine what icon to show based on file type
  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case "video/mp4":
        return <FileVideo className="w-6 h-6" />;
      case "application/pdf":
        return <FileText className="w-6 h-6" />;
      case "audio/mpeg":
        return <FileAudio className="w-6 h-6" />;
      default:
        return <File className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="inline-block px-3 py-1 bg-accent bg-opacity-10 text-white rounded-full text-sm mb-3">
            {getFileTypeIcon(lesson.fileType)}
          </div>

          <h1 className="text-2xl font-heading font-bold">{lesson.title}</h1>
        </div>
        <button
          onClick={() => setIsCompleted(!isCompleted)}
          className={`p-2 rounded-md transition-colors ${
            isCompleted
              ? "bg-green-100 text-green-600"
              : "bg-background text-muted hover:text-text"
          }`}
        >
          {isCompleted ? (
            <Check className="w-6 h-6" />
          ) : (
            <Circle className="w-6 h-6" />
          )}
        </button>
      </div>

      <p className="text-muted">{lesson.description}</p>

      <div className="bg-background rounded-lg overflow-hidden">
        <MediaModal
          url={lesson.filePath}
          contentType={lesson.fileType}
          title={lesson.title}
        />
      </div>

      <div className="border-t border-cardBorder pt-4 mt-6">
        <h3 className="text-lg font-medium mb-3">Resources</h3>
        <div className="space-y-2">
          <a
            href={lesson.filePath}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-3 border border-cardBorder rounded-lg hover:bg-background transition-colors"
          >
            <span className="p-2 bg-background rounded-md mr-3 text-primary">
              {getFileTypeIcon(lesson.fileType)}
            </span>
            <div className="flex-1">
              <div className="font-medium">{lesson.title}</div>
              <div className="text-sm text-muted">Download lesson material</div>
            </div>
            <Download className="w-5 h-5 text-muted" />
          </a>

          {lesson?.additionalResources?.map((resource: any, index: number) => (
            <a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-3 border border-cardBorder rounded-lg hover:bg-background transition-colors"
            >
              <span className="p-2 bg-background rounded-md mr-3 text-primary">
                <Link className="w-6 h-6" />
              </span>
              <div className="flex-1">
                <div className="font-medium">{resource.name}</div>
                <div className="text-sm text-muted">{resource.description}</div>
              </div>
              <Download className="w-5 h-5 text-muted" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
