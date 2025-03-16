import { motion } from "framer-motion";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          aria-label="Main content"
        >
          <Outlet />
        </motion.main>
      </div>{" "}
    </div>
  );
};

export default AdminLayout;
