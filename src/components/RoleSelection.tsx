import { motion } from "framer-motion";
import { FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext"; // adjust the path as needed

export const RoleSelection = ({
  setRole,
}: {
  setRole: (role: string) => void;
}) => {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Select your role",
      student: {
        title: "Student",
        description: "Join courses and learn",
      },
      teacher: {
        title: "Teacher",
        description: "Create and manage courses",
      },
    },
    ar: {
      title: "اختر دورك",
      student: {
        title: "طالب",
        description: "انضم إلى الدورات وتعلم",
      },
      teacher: {
        title: "معلم",
        description: "أنشئ الدورات وأدرها",
      },
    },
  };

  const t = translations[language];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-6"
    >
      <h2 className="text-lg text-gray-600 dark:text-gray-300">{t.title}</h2>
      <div className="flex flex-col gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="p-4 rounded-lg cursor-pointer border border-gray-200 hover:border-primary"
          onClick={() => setRole("student")}
        >
          <div className="flex items-center gap-3">
            <FaUserGraduate className="text-primary text-xl" />
            <div>
              <h3 className="font-semibold">{t.student.title}</h3>
              <p className="text-sm text-gray-500">{t.student.description}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="p-4 rounded-lg cursor-pointer border border-gray-200 hover:border-secondary"
          onClick={() => setRole("teacher")}
        >
          <div className="flex items-center gap-3">
            <FaChalkboardTeacher className="text-secondary text-xl" />
            <div>
              <h3 className="font-semibold">{t.teacher.title}</h3>
              <p className="text-sm text-gray-500">{t.teacher.description}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
