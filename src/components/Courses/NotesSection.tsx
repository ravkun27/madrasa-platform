import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FiTrash2, FiX, FiImage, FiSave, FiLoader } from "react-icons/fi";
import { getFetch, postFetch, putFetch } from "../../utils/apiCall";

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
  const [localNotes, setLocalNotes] = useState<any[]>([]);
  const [deletingNoteIds, setDeletingNoteIds] = useState<string[]>([]);

  // Use effect to set local notes when lesson changes
  useEffect(() => {
    if (lesson?.note?.content) {
      const filteredNotes = Array.isArray(lesson.note.content)
        ? lesson.note.content.filter((item: any) => item !== null)
        : [];
      setLocalNotes(filteredNotes);
    } else {
      setLocalNotes([]);
    }
  }, [lesson]);

  const currentImageCount = localNotes.filter((note: any) => note?.url).length;

  const fetchNoteImageUrls = async () => {
    if (!localNotes.length) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const urlMap: Record<string, string> = {};

    for (const note of localNotes) {
      if (note?._id && note?.url) {
        try {
          const viewLinkRes: any = await getFetch(
            `/user/student/course/getViewableLink?filename=${note.url}`
          );

          if (viewLinkRes?.success && viewLinkRes?.data?.signedUrl) {
            urlMap[note._id] = viewLinkRes.data.signedUrl;
          }
        } catch (error) {
          console.error("Error fetching image URL:", error);
        }
      }
    }

    setNoteUrls(urlMap);
    setIsLoading(false);
  };

  useEffect(() => {
    if (lesson) {
      fetchNoteImageUrls();
    }
  }, [lesson, localNotes]);

  const handleAddNote = async () => {
    if (!newNote || !newNote.title) {
      // Check if newNote exists and has a title
      toast.error("Title is required");
      return;
    }

    if (previewImage && currentImageCount >= 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setIsAdding(true);

    try {
      // Create a temporary note object to show immediately in the UI
      const tempNote = {
        _id: `temp-${Date.now()}`,
        title: newNote.title,
        description: newNote.description,
        isNew: true,
      };

      // Add to UI immediately for a smooth appearance
      setLocalNotes((prev) => [...prev, tempNote]);

      // If there's an image, upload it and update the note
      if (previewImage) {
        // Get upload URL
        const uploadUrlRes: any = await getFetch(
          `/user/student/course/getUpdateLink?filename=${encodeURIComponent(
            previewImage.name
          )}&contentType=${previewImage.type}&courseId=${courseId}`
        );

        if (!uploadUrlRes?.success) throw new Error("Failed to get upload URL");

        // Upload the image
        const uploadResponse = await fetch(uploadUrlRes.data.signedUrl, {
          method: "PUT",
          body: previewImage,
          headers: { "Content-Type": previewImage.type },
        });

        if (!uploadResponse.ok) throw new Error("Image upload failed");

        const noteRes: any = await postFetch(
          `/user/student/course/note?courseId=${courseId}&lessonId=${lesson._id}`,
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

        if (!noteRes?.success)
          throw new Error("Failed to update note with image");

        // Replace temporary note with actual data
        if (noteRes?.data?.note?.content) {
          const newNoteContent = noteRes.data.note.content.find(
            (n: any) =>
              n?.title === newNote?.title &&
              n?.description === newNote.description
          );

          if (newNoteContent) {
            setLocalNotes((prev) =>
              prev.map((note) =>
                note._id === tempNote._id
                  ? { ...newNoteContent, url: uploadUrlRes.data.fileKey }
                  : note
              )
            );

            // Fetch the image URL for the new note
            const viewLinkRes: any = await getFetch(
              `/user/student/course/getViewableLink?filename=${uploadUrlRes.data.fileKey}`
            );

            if (viewLinkRes?.success && viewLinkRes?.data?.signedUrl) {
              setNoteUrls((prev) => ({
                ...prev,
                [newNoteContent._id]: viewLinkRes.data.signedUrl,
              }));
            }
          }
        }
      } else {
        // Just create a text note
        const noteRes: any = await postFetch(
          `/user/student/course/note?courseId=${courseId}&lessonId=${lesson._id}`,
          {
            content: [
              {
                title: newNote.title,
                description: newNote.description,
              },
            ],
          }
        );

        if (!noteRes?.success) throw new Error("Failed to create note");

        // Replace temporary note with actual data
        if (noteRes?.data?.note?.content) {
          const newNoteContent = noteRes.data.note.content.find(
            (n: any) =>
              n.title === newNote.title && n.description === newNote.description
          );

          if (newNoteContent) {
            setLocalNotes((prev) =>
              prev.map((note) =>
                note._id === tempNote._id ? newNoteContent : note
              )
            );
          }
        }
      }

      toast.success("Note added successfully");
      setNewNote({ title: "", description: "" });
      setPreviewImage(null);
    } catch (error) {
      console.error("Error in note addition process:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add note"
      );

      // Remove the temporary note on failure
      setLocalNotes((prev) =>
        prev.filter((note) => note._id !== `temp-${Date.now()}`)
      );
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteNote = async (noteId: string, contentId: string) => {
    // Mark note as deleting for visual feedback
    setDeletingNoteIds((prev) => [...prev, contentId]);

    try {
      const updateRes: any = await putFetch(
        `/user/student/course/note?courseId=${courseId}&lessonId=${lesson._id}&noteId=${noteId}&contentId=${contentId}`,
        { content: null }
      );

      if (updateRes?.success) {
        toast.success("Note deleted successfully");

        // Remove the note from local state
        setLocalNotes((prev) => prev.filter((note) => note._id !== contentId));
      } else {
        throw new Error("Failed to delete note");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");

      // Remove from deleting list on failure
      setDeletingNoteIds((prev) => prev.filter((id) => id !== contentId));
    }
  };

  if (!lesson) return null;

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-md transition-all">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Notes</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <FiLoader className="animate-spin text-2xl text-blue-600" />
        </div>
      ) : (
        <>
          {localNotes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {localNotes.map(
                (content: any) =>
                  content && (
                    <div
                      key={content._id}
                      className={`border border-gray-200 rounded-lg p-4 relative hover:shadow-md transition-all ${
                        content.isNew ? "animate-fade-in" : ""
                      } ${
                        deletingNoteIds.includes(content._id)
                          ? "opacity-50 scale-95"
                          : "opacity-100"
                      }`}
                      style={{
                        animation: content.isNew
                          ? "fadeIn 0.5s ease-in"
                          : deletingNoteIds.includes(content._id)
                            ? "fadeOut 0.3s ease-out"
                            : "",
                      }}
                    >
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() =>
                            handleDeleteNote(lesson.note._id, content._id)
                          }
                          className="p-1.5 bg-white rounded-full shadow-sm text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                          aria-label="Delete note"
                          disabled={deletingNoteIds.includes(content._id)}
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>

                      {content?.title && (
                        <h3 className="font-semibold mb-2 pr-8 text-gray-800">
                          {content.title}
                        </h3>
                      )}

                      {content?.description && (
                        <p className="text-gray-600 mb-3 text-sm">
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
                        </div>
                      ) : null}
                    </div>
                  )
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg mb-6">
              <p>No notes yet. Add your first note below.</p>
            </div>
          )}

          <div className="border-t pt-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="noteTitle"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="noteTitle"
                  type="text"
                  placeholder="Note title"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={newNote.title}
                  onChange={(e) =>
                    setNewNote({ ...newNote, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="noteDescription"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description (optional)
                </label>
                <textarea
                  id="noteDescription"
                  placeholder="Add details about this note..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  rows={3}
                  value={newNote.description}
                  onChange={(e) =>
                    setNewNote({ ...newNote, description: e.target.value })
                  }
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => document.getElementById("noteFile")?.click()}
                    className="p-4 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-lg"
                    disabled={currentImageCount >= 5 || isAdding}
                    title={
                      currentImageCount >= 5
                        ? "Maximum 5 images reached"
                        : "Add image"
                    }
                  >
                    <FiImage className="text-blue-600" />
                    <span className="hidden sm:inline">Add Image</span>
                  </button>
                </div>
              </div>

              {previewImage && (
                <div className="relative bg-gray-50 p-2 rounded-lg">
                  <div className="text-sm text-gray-500 mb-2">
                    Image preview:
                  </div>
                  <img
                    src={URL.createObjectURL(previewImage)}
                    alt="Preview"
                    className="w-full h-40 object-contain rounded-lg border"
                  />
                  <button
                    onClick={() => setPreviewImage(null)}
                    className="absolute top-4 right-4 bg-white p-1.5 rounded-full hover:bg-red-50 shadow transition-colors"
                    aria-label="Remove image"
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
              />

              <button
                onClick={handleAddNote}
                disabled={
                  !newNote.title ||
                  (previewImage && currentImageCount >= 5) ||
                  isAdding
                }
                className={`w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  !newNote.title || isAdding
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow"
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
                    <span>Add Note</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
