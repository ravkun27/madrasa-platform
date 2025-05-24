import { useLanguage } from "../../context/LanguageContext";
import { MediaModal } from "../Modal/MediaModal";
import {
  Download,
  FileText,
  Link as LinkIcon,
  FileAudio,
  FileVideo,
  File,
  ExternalLink as LuExternalLink,
  Copy as LuCopy,
} from "lucide-react";

export const LessonContent = ({ lesson }: { lesson: any }) => {
  const { language } = useLanguage();
  const translations = {
    en: {
      copy: "Copy",
      open: "Open",
      resources: "Resources",
      downloadMaterial: "Download lesson material",
    },
    ar: {
      copy: "نسخ",
      open: "فتح",
      resources: "الموارد",
      downloadMaterial: "تحميل المادة التعليمية",
    },
  };

  const t = translations[language];
  if (!lesson) return null;

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

  const handleCopyLink = () => {
    if (lesson.link) {
      navigator.clipboard.writeText(lesson.link);
    }
  };

  const handleDownload = async (url: string, baseFilename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      // Extract extension from MIME type
      const mimeToExt: Record<string, string> = {
        "application/pdf": "pdf",
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          "docx",
        "application/msword": "doc",
        "application/zip": "zip",
        "text/plain": "txt",
        "video/mp4": "mp4",
        "audio/mpeg": "mp3",
        "audio/wav": "wav",
        // Add more as needed
      };

      const ext = mimeToExt[blob.type] || "bin"; // fallback to .bin
      const filename = `${baseFilename}.${ext}`;

      // Trigger download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link); // Add to DOM for better browser compatibility
      link.click();
      document.body.removeChild(link); // Clean up
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Download failed", error);
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
      </div>

      <p className="text-muted">{lesson.description}</p>

      {lesson.fileType === "link" ? (
        <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 max-w-full">
              <LuExternalLink className="flex-shrink-0" size={18} />
              <p className="text-sm font-medium truncate max-w-[180px] sm:max-w-[250px] md:max-w-md lg:max-w-lg">
                {lesson.link}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-xs sm:text-sm transition-colors"
              >
                <LuCopy size={14} />
                <span className="hidden sm:inline">{t.copy}</span>
              </button>
              <a
                href={lesson.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm transition-colors"
              >
                <LuExternalLink size={14} />
                <span className="hidden sm:inline">{t.open}</span>
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-background rounded-lg overflow-hidden">
          <MediaModal
            url={lesson.filePath}
            contentType={lesson.fileType}
            title={lesson.title}
          />
        </div>
      )}

      {lesson.fileType?.startsWith("video") ||
      lesson.fileType === "link" ? null : (
        <div className="border-t border-cardBorder pt-4 mt-6">
          <h3 className="text-lg font-medium mb-3">{t.resources}</h3>
          <div className="space-y-2">
            {/* Fixed: Use button with handleDownload instead of anchor tag */}
            <button
              onClick={() => handleDownload(lesson.filePath, lesson.title)}
              className="w-full text-left flex items-center p-3 border border-cardBorder rounded-lg hover:bg-background transition-colors cursor-pointer"
            >
              <span className="p-2 bg-background rounded-md mr-3 text-primary">
                {getFileTypeIcon(lesson.fileType)}
              </span>
              <div className="flex-1">
                <div className="font-medium">{lesson.title}</div>
                <div className="text-sm text-muted">{t.downloadMaterial}</div>
              </div>
              <Download className="w-5 h-5 text-muted" />
            </button>

            {lesson?.additionalResources?.map(
              (resource: any, index: number) => (
                <button
                  key={index}
                  onClick={() => handleDownload(resource.url, resource.name)}
                  className="w-full cursor-pointer text-left flex items-center p-3 border border-cardBorder rounded-lg hover:bg-background transition-colors"
                >
                  <span className="p-2 bg-background rounded-md mr-3 text-primary">
                    <LinkIcon className="w-6 h-6" />
                  </span>
                  <div className="flex-1">
                    <div className="font-medium">{resource.name}</div>
                    <div className="text-sm text-muted">
                      {resource.description}
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-muted" />
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};
