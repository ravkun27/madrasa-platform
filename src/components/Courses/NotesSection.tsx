import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { getFetch, postFetch, putFetch } from "../../utils/apiCall";

export const NotesSection = ({
  lesson,
  courseId,
  onNoteAdded,
}: {
  lesson: any;
  courseId: string;
  onNoteAdded: () => void;
}) => {
  const [newNote, setNewNote] = useState({ title: "", description: "" });
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [noteUrls, setNoteUrls] = useState<Record<string, string>>({});

  const notes = (lesson?.note?.content || []).filter(
    (note: any) => note !== null
  );
  const currentImageCount = notes.filter((note: any) => note?.url).length;

  const fetchNoteImageUrls = async () => {
    console.log("Fetching image URLs for notes:", notes);
    const urlMap: Record<string, string> = {};

    for (const note of notes) {
      if (note?._id && note?.url) {
        try {
          console.log(
            `Fetching URL for note ${note._id} with fileKey:`,
            note.url
          );
          const viewLinkRes: any = await getFetch(
            `/user/student/course/getViewableLink?filename=${note.url}`
          );

          console.log("View link response:", viewLinkRes);
          if (viewLinkRes?.success && viewLinkRes?.data?.signedUrl) {
            urlMap[note._id] = viewLinkRes.data.signedUrl;
          } else {
            console.warn("No signed URL received for note:", note._id);
          }
        } catch (error) {
          console.error("Error fetching image URL:", error);
        }
      }
    }

    console.log("Generated URL map:", urlMap);
    setNoteUrls(urlMap);
  };

  useEffect(() => {
    fetchNoteImageUrls();
  }, [lesson]);

  const handleAddNote = async () => {
    if (!newNote.title) {
      toast.error("Title is required");
      return;
    }

    if (previewImage && currentImageCount >= 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setIsAdding(true);

    try {
      // Step 1: First create the note with text content
      console.log("Creating note with text content...");

      // Step 2: If there's an image, upload it and update the note
      if (previewImage) {
        console.log("Uploading image...");
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

        console.log(
          "Image uploaded successfully. File key:",
          uploadUrlRes.data.fileKey
        );

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

        console.log("Note update response:", noteRes);
        if (!noteRes?.success)
          throw new Error("Failed to update note with image");
      }

      toast.success("Note added successfully");
      setNewNote({ title: "", description: "" });
      setPreviewImage(null);
      onNoteAdded();
    } catch (error) {
      console.error("Error in note addition process:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add note"
      );
    } finally {
      setIsAdding(false);
    }
  };
  const handleDeleteNote = async (noteId: string, contentId: string) => {
    try {
      const updateRes: any = await putFetch(
        `/user/student/course/note?courseId=${courseId}&lessonId=${lesson._id}&noteId=${noteId}&contentId=${contentId}`,
        {
          content: null,
        }
      );

      if (updateRes?.success) {
        toast.success("Note deleted successfully");
        onNoteAdded();
      } else {
        throw new Error("Failed to delete note");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    }
  };
  if (!lesson) return null;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Notes</h2>
        <button
          onClick={() => document.getElementById("noteFile")?.click()}
          className="p-2 hover:bg-gray-100 rounded-lg"
          disabled={currentImageCount >= 5}
          title={
            currentImageCount >= 5 ? "Maximum 5 images reached" : "Add image"
          }
        >
          <FiPlus className="text-lg" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {notes.map((note: any) => (
          <div key={note?._id} className="border rounded-lg p-4">
            <button
              onClick={() => handleDeleteNote(note._id, note._id)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              <FiTrash2 />
            </button>
            {note?.title && (
              <h3 className="font-semibold mb-2">{note.title}</h3>
            )}
            {note?.description && (
              <p className="text-gray-600 mb-3">{note.description}</p>
            )}
            {note?.url ? (
              noteUrls[note._id] ? (
                <img
                  src={noteUrls[note._id]}
                  alt="Note attachment"
                  className="w-full h-32 object-cover rounded"
                  onError={(e) => {
                    console.error("Image failed to load:", noteUrls[note._id]);
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded">
                  <span className="text-gray-500">Loading image...</span>
                </div>
              )
            ) : null}
          </div>
        ))}
      </div>

      <div className="border-t pt-6">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Note title*"
            className="w-full p-2 border rounded-lg"
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
          />
          <textarea
            placeholder="Note description"
            className="w-full p-2 border rounded-lg"
            rows={3}
            value={newNote.description}
            onChange={(e) =>
              setNewNote({ ...newNote, description: e.target.value })
            }
          />

          {previewImage && (
            <div className="relative">
              <img
                src={URL.createObjectURL(previewImage)}
                alt="Preview"
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-2 right-2 bg-white/80 p-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                <FiX className="text-red-500" />
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
                console.log("Selected file:", e.target.files[0]);
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
            className={`w-full py-2 rounded-lg transition-colors ${
              !newNote.title || isAdding
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isAdding ? "Adding..." : "Add Note"}
          </button>
        </div>
      </div>
    </div>
  );
};
