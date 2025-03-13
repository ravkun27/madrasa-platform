import { motion } from "framer-motion";
import { FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";

export const RoleSelection = ({
  setRole,
}: {
  setRole: (role: string) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    className="space-y-6"
  >
    <h2 className="text-lg text-gray-600 dark:text-gray-300">
      Select your role
    </h2>
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
            <h3 className="font-semibold">Student</h3>
            <p className="text-sm text-gray-500">Join courses and learn</p>
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
            <h3 className="font-semibold">Teacher</h3>
            <p className="text-sm text-gray-500">Create and manage courses</p>
          </div>
        </div>
      </motion.div>
    </div>
  </motion.div>
);
