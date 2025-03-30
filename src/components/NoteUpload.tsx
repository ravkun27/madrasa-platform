import { FiUpload } from "react-icons/fi";
import { postFetch } from "../utils/apiCall";
import { useState } from "react";

export const NoteUpload = ({ courseId, lessonId, existingNotes }: any) => {
  const [notes, setNotes] = useState(existingNotes);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (files: FileList) => {
    if (notes.length + files.length > 5) {
      alert("Maximum 5 notes allowed");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("notes", file));

    try {
      const res: any = await postFetch(
        `/user/student/course/note?courseId=${courseId}&lessonId=${lessonId}`,
        formData
      );
      if (res.success) setNotes([...notes, ...res.notes]);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="border-t pt-4 mt-4">
      <h5 className="font-medium mb-2">Your Notes</h5>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {notes.map((note: any) => (
          <div key={note._id} className="relative group">
            <img
              src={note.url}
              alt="Note"
              className="w-full h-24 object-cover rounded-lg"
            />
          </div>
        ))}
      </div>

      <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50">
        <FiUpload />
        Add Notes
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
          disabled={isUploading || notes.length >= 5}
        />
      </label>
      <span className="text-sm ml-2 text-gray-500">
        {5 - notes.length} remaining
      </span>
    </div>
  );
};
