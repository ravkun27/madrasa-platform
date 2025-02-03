import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaChalkboardTeacher,
  FaUserGraduate,
  FaSearch,
  FaKey,
  FaUsers,
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext"; // Import useTheme hook

interface StepCardProps {
  icon: React.ElementType;
  title: string;
  steps: string[];
  color: "primary" | "secondary" | "primary-dark" | "secondary-dark";
}

const LandingPage = () => {
  const [searchValue, setSearchValue] = useState("");
  const { theme } = useTheme(); // Get current theme

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${
        theme === "light"
          ? "from-white to-light-teal"
          : "from-background-dark to-background-dark/90"
      }`}
    >
      {/* Hero Section */}
      <motion.section
        className={`relative pt-24 pb-24 px-4 overflow-hidden ${
          theme === "light"
            ? "bg-gradient-to-br from-white to-gray-50"
            : "bg-gradient-to-br from-gray-900 to-gray-800"
        }`}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Animated Background Blob */}
        <motion.div
          className={`absolute top-0 right-0 w-1/2 h-1/2 rounded-full blur-[100px] ${
            theme === "light"
              ? "bg-gradient-to-r from-[#6E45E2] via-[#FF6B6B] to-[#FFE66D]"
              : "bg-gradient-to-r from-[#8B5CF6] via-[#FF6B6B] to-[#FFE66D]"
          }`}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180, 270, 360],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Optional: Add a second blob for more depth */}
        <motion.div
          className={`absolute bottom-0 left-0 w-1/3 h-1/3 rounded-full blur-[80px] ${
            theme === "light"
              ? "bg-gradient-to-r from-[#4f77e6] via-[#770cca] to-[#6E45E2]"
              : "bg-gradient-to-r from-[#00C9A7] via-[#B8F2E6] to-[#8B5CF6]"
          }`}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, -90, -180, -270, -360],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="md:max-w-6xl mx-auto relative z-10">
          <motion.h1
            className="text-4xl md:text-8xl font-extrabold text-center mb-6"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span
              className={`bg-gradient-to-r ${
                theme === "light"
                  ? "from-[#5A2D91] via-[#57A3A2] to-[#1ABF9F]"
                  : "from-[#6E45E2] via-[#88D3CE] to-[#B8F2E6]"
              } animate-gradient bg-300% bg-clip-text text-transparent text-3xl md:text-5xl`}
            >
              Learning is Easier with
            </span>
            <br />
            <span className="relative inline-block">
              <span
                className={`absolute inset-0 ${
                  theme === "light" ? "bg-[#6E45E2]/20" : "bg-[#6E45E2]/10"
                } blur-3xl rounded-full animate-pulse`}
              />
              <motion.span
                className={`relative bg-gradient-to-r ${
                  theme === "light"
                    ? "from-[#FF6B6B] to-[#FFE66D]"
                    : "from-[#FF6B6B] to-[#FFE66D]"
                } bg-clip-text text-transparent`}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Madrasa Platform
              </motion.span>
            </span>
          </motion.h1>

          <motion.div className="max-w-lg mx-auto mb-12" variants={fadeInUp}>
            <div
              className={`flex items-center gap-2 sm:gap-3 ${
                theme === "light" ? "bg-white" : "bg-background-dark"
              } rounded-xl shadow-lg p-3 sm:p-4 border ${
                theme === "light" ? "border-light-teal" : "border-primary-dark"
              }`}
            >
              {/* Search Icon with proper spacing */}
              <div className="relative flex-shrink-0">
                <FaSearch
                  className={`${
                    theme === "light" ? "text-primary" : "text-primary-dark"
                  } text-lg sm:text-xl`}
                />
              </div>

              {/* Input Field */}
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Enter course code to join..."
                className={`flex-1 min-w-[120px] outline-none bg-transparent text-sm sm:text-base ${
                  theme === "light"
                    ? "text-accent placeholder-primary/50"
                    : "text-text-dark placeholder-primary-dark/50"
                }`}
              />

              {/* Join Button with responsive sizing */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`bg-primary-gradient text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:shadow-lg transition-all
        whitespace-nowrap min-w-[90px] sm:min-w-[100px] text-xs sm:text-sm
        inline-flex items-center justify-center flex-shrink-0`}
              >
                Join Now
              </motion.button>
            </div>
          </motion.div>
          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6"
            variants={fadeInUp}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/auth?role=teacher"
                className={`block text-center ${
                  theme === "light" ? "bg-secondary" : "bg-secondary-dark"
                } text-white px-8 py-3 rounded-lg text-lg hover:shadow-xl transition-all`}
              >
                Create Course
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/auth?role=student"
                className={`block text-center ${
                  theme === "light" ? "bg-primary" : "bg-primary-dark"
                } text-white px-8 py-3 rounded-lg text-lg hover:shadow-xl transition-all`}
              >
                Join as Student
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className={`py-24 ${
          theme === "light" ? "bg-white" : "bg-background-dark"
        }`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2
            className={`text-3xl md:text-4xl font-bold text-center ${
              theme === "light" ? "text-accent" : "text-text-dark"
            } mb-16`}
            variants={fadeInUp}
          >
            Platform Features
          </motion.h2>

          <motion.div
            className="grid md:grid-cols-2 gap-8"
            variants={containerVariants}
          >
            {[
              {
                icon: FaChalkboardTeacher,
                title: "For Teachers",
                description:
                  "Create and manage courses effortlessly with our intuitive tools",
                colorClass:
                  theme === "light" ? "text-primary" : "text-primary-dark",
                bgColorClass:
                  theme === "light" ? "bg-light-teal" : "bg-background-dark/50",
              },
              {
                icon: FaUserGraduate,
                title: "For Students",
                description:
                  "Access course materials and track your progress seamlessly",
                colorClass:
                  theme === "light" ? "text-secondary" : "text-secondary-dark",
                bgColorClass:
                  theme === "light" ? "bg-amber-50" : "bg-background-dark/50",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className={`${
                  feature.bgColorClass
                } rounded-xl p-8 shadow-lg border ${
                  theme === "light"
                    ? "border-light-teal"
                    : "border-primary-dark"
                }`}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <feature.icon
                  className={`${feature.colorClass} text-4xl mb-6`}
                />
                <h3
                  className={`text-xl font-bold ${
                    theme === "light" ? "text-accent" : "text-text-dark"
                  } mb-4`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`${
                    theme === "light" ? "text-slate" : "text-text-dark/80"
                  }`}
                >
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <section
        className={`py-24 ${
          theme === "light" ? "bg-cream" : "bg-background-dark/90"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2
            className={`text-3xl md:text-4xl font-bold text-center ${
              theme === "light" ? "text-accent" : "text-text-dark"
            } mb-16`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            <StepCard
              icon={FaKey}
              title="For Teachers"
              steps={[
                "Create your course",
                "Get unique course code",
                "Share with students",
              ]}
              color={theme === "light" ? "primary" : "primary-dark"}
            />
            <StepCard
              icon={FaUsers}
              title="For Students"
              steps={[
                "Sign up for free",
                "Enter course code",
                "Start learning",
              ]}
              color={theme === "light" ? "secondary" : "secondary-dark"}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        className={`py-24 ${
          theme === "light" ? "bg-primary-gradient" : "bg-primary-dark-gradient"
        }`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="max-w-xl mx-auto px-4 text-center">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-white mb-8"
            variants={fadeInUp}
          >
            Ready to Transform Your Education?
          </motion.h2>

          <motion.p className="text-xl text-white/90 mb-12" variants={fadeInUp}>
            Join thousands of educators and students already using our platform
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            variants={fadeInUp}
          >
            <Link
              to="/auth?role=teacher"
              className={`block text-center px-8 py-3 rounded-lg text-lg font-semibold transition-all shadow-lg ${
                theme === "light"
                  ? "bg-primary text-white hover:bg-primary-dark"
                  : "bg-primary-dark text-white hover:bg-primary"
              }`}
            >
              Start Teaching
            </Link>

            {/* Start Learning Button */}
            <Link
              to="/auth?role=student"
              className={`block text-center px-8 py-3 rounded-lg text-lg font-semibold transition-colors shadow-md ${
                theme === "light"
                  ? "bg-white border border-primary text-primary hover:bg-white/60"
                  : " border border-primary-dark text-primary-dark hover:bg-primary-dark/10"
              }`}
            >
              Start Learning
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

const StepCard = ({ icon: Icon, title, steps, color }: StepCardProps) => {
  const { theme } = useTheme(); // Get current theme

  return (
    <motion.div
      className={`${
        theme === "light" ? "bg-white" : "bg-background-dark"
      } rounded-xl p-8 shadow-lg border ${
        theme === "light" ? "border-light-teal" : "border-primary-dark"
      }`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
    >
      <div className="flex items-center mb-8">
        <Icon className={`text-${color} mr-4`} size={28} />
        <h3
          className={`text-xl font-bold ${
            theme === "light" ? "text-accent" : "text-text-dark"
          }`}
        >
          {title}
        </h3>
      </div>
      <ul className="list-disc list-inside space-y-2">
        {steps.map((step, index) => (
          <li
            key={index}
            className={`${
              theme === "light" ? "text-slate" : "text-text-dark/80"
            }`}
          >
            {step}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default LandingPage;
