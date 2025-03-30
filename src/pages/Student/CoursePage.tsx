// CoursePage.tsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getFetch, postFetch } from "../../utils/apiCall";

interface Lesson {
  _id: string;
  title: string;
  content: any;
  files: any[];
  notes: Note[];
}

interface Note {
  _id: string;
  content: {
    title: string;
    description: string;
    url: string;
  };
}

export const CoursePage = () => {
  const { courseId } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState({
    title: "",
    description: "",
    url: "",
  });

  useEffect(() => {
    const fetchCourseLessons = async () => {
      if (!courseId) return;

      try {
        const res: any = await getFetch(
          `/user/student/course/lesson?courseId=${courseId}`
        );
        if (res.success) {
          setLessons(res.data.lessons);
          if (res.data.lessons.length > 0) {
            setSelectedLesson(res.data.lessons[0]);
            setNotes(res.data.lessons[0].notes);
          }
        }
      } catch (error) {
        console.error("Failed to fetch lessons:", error);
      }
    };

    fetchCourseLessons();
  }, [courseId]);

  const handleAddNote = async () => {
    if (!courseId || !selectedLesson) return;

    try {
      const res: any = await postFetch(
        `/user/student/course/note?courseId=${courseId}&lessonId=${selectedLesson._id}`,
        { content: newNote }
      );

      if (res.success) {
        setNotes([...notes, res.data.note]);
        setNewNote({ title: "", description: "", url: "" });
      }
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  // const handleUpdateNote = async (noteId: string) => {
  //   if (!courseId || !selectedLesson) return;

  //   try {
  //     const res = await putFetch(
  //       `/user/student/course/lesson?lessonId=${selectedLesson._id}&courseId=${courseId}`,
  //       { content: newNote }
  //     );

  //     if (res.success) {
  //       setNotes(notes.map((n) => (n._id === noteId ? res.data.note : n)));
  //     }
  //   } catch (error) {
  //     console.error("Failed to update note:", error);
  //   }
  // };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="w-80 border-r bg-white overflow-y-auto max-md:fixed max-md:z-50 max-md:h-full">
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Course Content</h2>
            <div className="space-y-4">
              {lessons.map((lesson) => (
                <button
                  key={lesson._id}
                  onClick={() => {
                    setSelectedLesson(lesson);
                    setNotes(lesson.notes);
                  }}
                  className={`w-full text-left p-3 rounded-lg ${
                    selectedLesson?._id === lesson._id
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {lesson.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {selectedLesson && (
            <>
              <h1 className="text-2xl font-bold mb-6">
                {selectedLesson.title}
              </h1>

              {/* Lesson Content */}
              <div className="mb-8">
                {selectedLesson.content.type === "video" && (
                  <video
                    controls
                    className="w-full rounded-lg"
                    src={selectedLesson.content.url}
                  />
                )}
                {selectedLesson.content.type === "text" && (
                  <p className="text-gray-600">{selectedLesson.content.text}</p>
                )}
              </div>

              {/* Notes Section */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold mb-4">
                  Notes ({notes.length}/5)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {notes.map((note) => (
                    <div key={note._id} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">{note.content.title}</h4>
                      <p className="text-gray-600 mb-2">
                        {note.content.description}
                      </p>
                      {note.content.url && (
                        <img
                          src={note.content.url}
                          alt="Note"
                          className="w-full h-32 object-cover rounded"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {notes.length < 5 && (
                  <div className="bg-white p-4 rounded-lg border">
                    <input
                      type="text"
                      placeholder="Note title"
                      className="w-full mb-2 p-2 border rounded"
                      value={newNote.title}
                      onChange={(e) =>
                        setNewNote({ ...newNote, title: e.target.value })
                      }
                    />
                    <textarea
                      placeholder="Note description"
                      className="w-full mb-2 p-2 border rounded"
                      value={newNote.description}
                      onChange={(e) =>
                        setNewNote({ ...newNote, description: e.target.value })
                      }
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file)
                          setNewNote({
                            ...newNote,
                            url: URL.createObjectURL(file),
                          });
                      }}
                    />
                    <button
                      onClick={handleAddNote}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Add Note
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed left-4 top-4 p-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50"
      >
        {isSidebarOpen ? "◀" : "▶"}
      </button>
    </div>
  );
};
