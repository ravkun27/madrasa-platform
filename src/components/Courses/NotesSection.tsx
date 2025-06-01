import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FiTrash2,
  FiX,
  FiImage,
  FiSave,
  FiLoader,
  FiRefreshCw,
} from "react-icons/fi";
import { deleteFetch, getFetch, postFetch } from "../../utils/apiCall";
import { ConfirmationModal } from "../Modal/ConfiramtionModal";

export const NotesSection = ({
  lesson,
  courseId,
}: {
  lesson: any;
  courseId: string;
  onNoteAdded?: () => void;
}) => {
  const [newNote, setNewNote] = useState<{
    title: string;
    description: string;
  }>({ title: "", description: "" });
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [noteUrls, setNoteUrls] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [localNotes, setLocalNotes] = useState<any[]>([]);
  const [deletingNoteIds, setDeletingNoteIds] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<[string, string] | null>(
    null
  );

  const currentImageCount = localNotes.filter((note) => note?.url).length;

  // Fetch fresh lesson data from API
  const fetchFreshLessonData = async () => {
    try {
      const response: any = await getFetch(
        `/user/student/course/lesson?courseId=${courseId}&lessonId=${lesson._id}`
      );

      if (response?.success && response?.lesson?.note?.content) {
        const validNotes = response.lesson.note.content.filter(
          (note: any) =>
            note && note._id && (note.title || note.description || note.url)
        );

        setLocalNotes(validNotes);
        await fetchImageUrls(validNotes);
        return validNotes;
      } else {
        setLocalNotes([]);
        setNoteUrls({});
        return [];
      }
    } catch (error) {
      console.error("Error fetching fresh lesson data:", error);
      toast.error("Failed to fetch latest notes");
      return [];
    }
  };

  // Initial load
  useEffect(() => {
    const initNotes = async () => {
      setIsLoading(true);
      await fetchFreshLessonData();
      setIsLoading(false);
    };

    if (lesson?._id) {
      initNotes();
    } else {
      setLocalNotes([]);
      setIsLoading(false);
    }
  }, [lesson?._id, courseId]);

  const fetchImageUrls = async (notes: any[]) => {
    const urls: Record<string, string> = {};

    await Promise.all(
      notes.map(async (note) => {
        if (note?._id && note.url) {
          try {
            const res: any = await getFetch(
              `/user/student/course/getViewableLink?filename=${note.url}&t=${Date.now()}`
            );
            if (res?.success && res.data?.signedUrl) {
              urls[note._id] = res.data.signedUrl;
            }
          } catch (err) {
            console.error("Error fetching image URL:", err);
          }
        }
      })
    );

    setNoteUrls(urls);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchFreshLessonData();
      toast.success("Notes refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh notes");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.title || !newNote.description || !previewImage) {
      toast.error("Title, description, and image are required");
      return;
    }

    if (currentImageCount >= 5) {
      toast.error("Maximum of 5 image notes allowed");
      return;
    }

    setIsAdding(true);

    try {
      const uploadUrlRes: any = await getFetch(
        `/user/student/course/getUpdateLink?filename=${encodeURIComponent(
          previewImage.name
        )}&contentType=${previewImage.type}&courseId=${courseId}&t=${Date.now()}`
      );
      if (!uploadUrlRes?.success) throw new Error("Upload URL failed");

      const uploadRes = await fetch(uploadUrlRes.data.signedUrl, {
        method: "PUT",
        body: previewImage,
        headers: { "Content-Type": previewImage.type },
      });
      if (!uploadRes.ok) throw new Error("Upload failed");

      const noteRes: any = await postFetch(
        `/user/student/course/note?courseId=${courseId}&lessonId=${lesson._id}&t=${Date.now()}`,
        {
          content: [
            {
              title: newNote.title,
              description: newNote.description,
              url: uploadUrlRes.data.fileKey,
            },
          ],
        }
      );

      if (!noteRes?.success) {
        throw new Error("Failed to create note");
      }

      // Clear form immediately
      setNewNote({ title: "", description: "" });
      setPreviewImage(null);

      // Fetch fresh data to get the latest state
      await fetchFreshLessonData();

      toast.success("Note added successfully");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to add note");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteClick = (noteId: string, contentId: string) => {
    if (!noteId || !contentId) {
      toast.error("Invalid note data for deletion");
      return;
    }
    setNoteToDelete([noteId, contentId]);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!noteToDelete) return;
    const [noteId, contentId] = noteToDelete;

    if (!noteId || !contentId) {
      toast.error("Invalid note data for deletion");
      setNoteToDelete(null);
      setShowDeleteConfirm(false);
      return;
    }

    setDeletingNoteIds((prev) => [...prev, contentId]);

    try {
      const res: any = await deleteFetch(
        `/user/student/course/note?courseId=${courseId}&lessonId=${lesson._id}&noteId=${noteId}&contentId=${contentId}&t=${Date.now()}`
      );

      if (!res?.success) throw new Error("Deletion failed");

      // Fetch fresh data to get the latest state
      await fetchFreshLessonData();

      toast.success("Note deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete note");
    } finally {
      setDeletingNoteIds((prev) => prev.filter((id) => id !== contentId));
      setNoteToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  if (!lesson) return null;

  return (
    <div className="bg-color-background rounded-xl p-4 md:p-6 shadow-md transition-all">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-text">Notes</h2>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          className="p-2 text-color-secondary hover:text-color-primary hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
          aria-label="Refresh notes"
        >
          <FiRefreshCw
            className={`text-lg ${isRefreshing ? "animate-spin" : ""}`}
          />
          <span className="hidden sm:inline text-sm">
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <FiLoader className="animate-spin text-2xl text-color-secondary" />
          <span className="ml-2 text-color-muted">Loading notes...</span>
        </div>
      ) : (
        <>
          {localNotes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {localNotes.map(
                (content: any) =>
                  content &&
                  content._id && (
                    <div
                      key={content._id}
                      className={`border border-color-card-border rounded-lg p-4 relative hover:shadow-md transition-all ${
                        deletingNoteIds.includes(content._id)
                          ? "opacity-50 scale-95"
                          : "opacity-100"
                      }`}
                    >
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => {
                            if (lesson?.note?._id && content?._id) {
                              handleDeleteClick(lesson.note._id, content._id);
                            } else {
                              toast.error(
                                "Unable to delete note - missing required data"
                              );
                            }
                          }}
                          className="p-1.5 bg-white rounded-full shadow-sm text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                          aria-label="Delete note"
                          disabled={deletingNoteIds.includes(content._id)}
                        >
                          {deletingNoteIds.includes(content._id) ? (
                            <FiLoader className="animate-spin" size={16} />
                          ) : (
                            <FiTrash2 size={16} />
                          )}
                        </button>
                      </div>

                      {content?.title && (
                        <h3 className="font-semibold mb-2 pr-8 text-color-text">
                          {content.title}
                        </h3>
                      )}

                      {content?.description && (
                        <p className="text-color-muted mb-3 text-sm">
                          {content.description}
                        </p>
                      )}

                      {content?.url && noteUrls[content._id] ? (
                        <div className="mt-2">
                          <img
                            src={noteUrls[content._id]}
                            alt="Note attachment"
                            className="w-full h-36 object-cover rounded-md shadow-sm"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                          <button
                            onClick={() =>
                              window.open(noteUrls[content._id], "_blank")
                            }
                            className="mt-2 text-sm text-blue-600 hover:underline"
                          >
                            View Full Image
                          </button>
                        </div>
                      ) : content?.url && !noteUrls[content._id] ? (
                        <div className="mt-2 flex justify-center items-center h-36 bg-gray-100 rounded-md">
                          <FiLoader className="animate-spin text-gray-400" />
                          <span className="ml-2 text-gray-500 text-sm">
                            Loading image...
                          </span>
                        </div>
                      ) : null}
                    </div>
                  )
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-color-muted bg-background rounded-lg mb-6">
              <p className="text-text">
                No notes yet. Add your first note below.
              </p>
            </div>
          )}

          <div className="border-t pt-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="noteTitle"
                  className="block text-sm font-medium text-color-text mb-1"
                >
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="noteTitle"
                  type="text"
                  placeholder="Note title"
                  className="w-full p-3 border border-color-card-border rounded-lg focus:ring-2 focus:ring-color-secondary focus:border-color-secondary transition-all text-black"
                  value={newNote.title}
                  onChange={(e) =>
                    setNewNote({ ...newNote, title: e.target.value })
                  }
                  disabled={isAdding}
                />
              </div>

              <div>
                <label
                  htmlFor="noteDescription"
                  className="block text-sm font-medium text-color-text mb-1"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="noteDescription"
                  placeholder="Add details about this note..."
                  className="w-full p-3 border border-card-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all text-black"
                  rows={3}
                  value={newNote.description}
                  onChange={(e) =>
                    setNewNote({ ...newNote, description: e.target.value })
                  }
                  disabled={isAdding}
                />
                <div className="flex justify-between items-center mt-2">
                  <button
                    onClick={() => document.getElementById("noteFile")?.click()}
                    className="p-4 text-text hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      !newNote.title || currentImageCount >= 5 || isAdding
                    }
                    title={
                      currentImageCount >= 5
                        ? "Maximum 5 images reached"
                        : "Add image"
                    }
                  >
                    <FiImage className="text-color-secondary" />
                    <span className="hidden sm:inline">Add Image</span>
                  </button>
                </div>
                {currentImageCount >= 5 && (
                  <p className="text-sm text-red-500 text-center mt-2">
                    You've reached the maximum of 5 image notes.
                  </p>
                )}
              </div>

              {previewImage && (
                <div className="relative bg-gray-50 p-2 rounded-lg">
                  <div className="text-sm text-color-muted mb-2">
                    Image preview:
                  </div>
                  <img
                    src={URL.createObjectURL(previewImage)}
                    alt="Preview"
                    className="w-full h-40 object-contain rounded-lg border"
                  />
                  <button
                    onClick={() => setPreviewImage(null)}
                    className="absolute top-4 right-4 bg-white p-1.5 rounded-full hover:bg-red-50 shadow transition-colors disabled:opacity-50"
                    aria-label="Remove image"
                    disabled={isAdding}
                  >
                    <FiX className="text-red-500" size={16} />
                  </button>
                </div>
              )}

              <input
                id="noteFile"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setPreviewImage(e.target.files[0]);
                  }
                }}
                disabled={isAdding}
              />

              <button
                onClick={handleAddNote}
                disabled={
                  !newNote.title ||
                  !newNote.description ||
                  !previewImage ||
                  currentImageCount >= 5 ||
                  isAdding
                }
                className={`w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  !newNote.title ||
                  !newNote.description ||
                  !previewImage ||
                  isAdding
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-secondary text-white shadow-sm hover:shadow"
                }`}
              >
                {isAdding ? (
                  <>
                    <FiLoader className="animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <FiSave />
                    <span>Add Note ({5 - currentImageCount} left)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
      {showDeleteConfirm && (
        <ConfirmationModal
          message="Are you sure you want to delete this note?"
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setNoteToDelete(null);
          }}
        />
      )}
    </div>
  );
};
