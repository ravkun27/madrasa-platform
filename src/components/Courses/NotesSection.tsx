import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FiPlus, FiX } from "react-icons/fi";
import { getFetch, postFetch } from "../../utils/apiCall";

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

  // Get the notes array from the correct location in the lesson object
  const notes = lesson?.note?.content || [];

  // Function to fetch viewable links for note images
  const fetchNoteImageUrls = async () => {
    const urlMap: Record<string, string> = {};

    for (const note of notes) {
      if (note.url && note.url !== "content") {
        try {
          // Using the fileKey directly with the getViewableLink endpoint
          const viewLinkRes: any = await getFetch(
            `/user/student/course/getViewableLink?filename=${encodeURIComponent(note.url)}`
          );

          if (viewLinkRes.success && viewLinkRes.data?.signedUrl) {
            urlMap[note._id] = viewLinkRes.data.signedUrl;
          }
        } catch (error) {
          console.error("Error fetching image URL for note:", note._id, error);
        }
      }
    }

    setNoteUrls(urlMap);
  };

  // Fetch image URLs when notes change
  useEffect(() => {
    if (notes.length > 0) {
      fetchNoteImageUrls();
    }
  }, [lesson]);

  const handleAddNote = async () => {
    if (!lesson || !courseId || !newNote.title) {
      toast.error("Please fill in the note title");
      return;
    }

    // Check the note limit based on the correct notes array
    if (notes.length >= 5) {
      toast.error("Maximum 5 notes allowed per lesson");
      return;
    }

    setIsAdding(true);
    console.log("Starting note addition process...");

    try {
      console.log("Current note data:", newNote);
      console.log("Preview image:", previewImage);

      let fileKey = "";
      if (previewImage) {
        console.log("Getting upload URL for image...");
        const uploadUrlRes: any = await getFetch(
          `/user/student/course/getUpdateLink?filename=${encodeURIComponent(
            previewImage.name
          )}&contentType=${previewImage.type}&courseId=${courseId}`
        );

        console.log("Upload URL response:", uploadUrlRes);
        if (!uploadUrlRes.success) throw new Error("Failed to get upload URL");

        console.log("Uploading image to S3...");
        const uploadResponse = await fetch(uploadUrlRes.data.signedUrl, {
          method: "PUT",
          body: previewImage,
          headers: { "Content-Type": previewImage.type },
        });
        console.log("Upload response:", uploadResponse);

        // Store the complete fileKey that comes from the API response
        fileKey = uploadUrlRes.data.fileKey;
        console.log("File uploaded with key:", fileKey);
      }

      console.log("Saving note to database...");
      const noteRes: any = await postFetch(
        `/user/student/course/note?courseId=${courseId}&lessonId=${lesson._id}`,
        {
          content: {
            title: newNote.title,
            description: newNote.description,
            ...(fileKey && { url: fileKey }),
          },
        }
      );

      console.log("Note save response:", noteRes);
      if (!noteRes.success) throw new Error("Failed to save note");

      toast.success("Note added successfully");
      setNewNote({ title: "", description: "" });
      setPreviewImage(null);
      onNoteAdded();
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add note"
      );
    } finally {
      setIsAdding(false);
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
          disabled={notes.length >= 5}
        >
          <FiPlus className="text-lg" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {notes.map((note: any) => (
          <div
            key={note._id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold mb-2">{note.title}</h3>
            <p className="text-gray-600 mb-3">{note.description}</p>
            {note.url && note.url !== "content" && (
              <img
                src={noteUrls[note._id] || "#"}
                alt="Note attachment"
                className="w-full h-32 object-cover rounded"
                loading="lazy"
                onError={(e) => {
                  // Fallback if image fails to load
                  const imgElement = e.target as HTMLImageElement;
                  imgElement.style.display = "none";
                }}
              />
            )}
          </div>
        ))}
      </div>

      {(notes.length < 5 || previewImage) && (
        <div className="border-t pt-6">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Note title"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={newNote.title}
              onChange={(e) =>
                setNewNote({ ...newNote, title: e.target.value })
              }
            />
            <textarea
              placeholder="Note description"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={newNote.description}
              onChange={(e) =>
                setNewNote({ ...newNote, description: e.target.value })
              }
            />
            <div className="relative">
              {previewImage && (
                <>
                  <img
                    src={URL.createObjectURL(previewImage)}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                  <button
                    onClick={() => setPreviewImage(null)}
                    className="absolute top-2 right-2 bg-white/80 p-1 rounded-full hover:bg-gray-200"
                  >
                    <FiX className="text-red-500" />
                  </button>
                </>
              )}
              <input
                id="noteFile"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  e.target.files?.[0] && setPreviewImage(e.target.files[0])
                }
              />
            </div>
            <button
              onClick={handleAddNote}
              disabled={!newNote.title || isAdding}
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
      )}
    </div>
  );
};
