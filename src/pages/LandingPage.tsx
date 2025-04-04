import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaChalkboardTeacher,
  FaUserGraduate,
  FaSearch,
  FaKey,
  FaUsers,
  FaArrowRight,
} from "react-icons/fa";

interface StepCardProps {
  icon: React.ElementType;
  title: string;
  steps: string[];
  color: "primary" | "secondary" | "primary-dark" | "secondary-dark";
}

const LandingPage = () => {
  const [searchValue, setSearchValue] = useState("");

  // Animation variants
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
    <div className={`min-h-screen bg-background`}>
      {/* Hero Section */}
      <motion.section
        className="relative pt-16 md:pt-24 pb-20 md:pb-32 px-4 overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Animated Background Blobs - more subtle animation */}
        <motion.div
          className="absolute top-0 right-0 w-1/2 h-1/2 rounded-full blur-[100px] bg-gradient-to-r from-primary via-secondary to-accent opacity-20"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 45, 0],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute bottom-0 left-0 w-1/3 h-1/3 rounded-full blur-[80px] bg-gradient-to-r from-secondary via-accent to-primary opacity-15"
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, -30, 0],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="md:max-w-6xl mx-auto relative z-10">
          {/* Hero content with improved typography hierarchy */}
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <span className="text-lg md:text-xl font-medium text-secondary mb-3 block">
              Revolutionize Your Learning Experience
            </span>

            <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Learning is Easier with
              </span>
              <br />
              <span className="relative inline-block">
                <span className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
                <motion.span
                  className="relative text-text font-black"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  Madrasa Platform
                </motion.span>
              </span>
            </h1>

            <p className="text-muted max-w-2xl mx-auto text-lg">
              Join thousands of educators and students to create, share and
              access interactive learning materials all in one place.
            </p>
          </motion.div>

          {/* Search box with improved layout */}
          <motion.div className="max-w-lg mx-auto mb-12" variants={fadeInUp}>
            <div className="flex items-center gap-3 bg-card rounded-xl shadow-lg p-2 md:p-4 border border-card-border">
              <div className="relative flex-shrink-0">
                <FaSearch className="text-primary text-xl" />
              </div>

              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Enter course code to join..."
                className="flex-1 outline-none bg-transparent text-text placeholder-muted"
                aria-label="Course code"
              />

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-gradient-to-r from-primary to-secondary text-button-text px-2 md:px-5 py- md:py-2.5 rounded-lg shadow-md transition-all
                whitespace-nowrap font-medium flex items-center gap-2"
                aria-label="Join now"
              >
                Join Now
                <FaArrowRight className="text-sm" />
              </motion.button>
            </div>
          </motion.div>

          {/* CTA Buttons with consistent styling */}
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6"
            variants={fadeInUp}
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto"
            >
              <Link
                to="/signup?role=teacher"
                className="block w-full text-center bg-secondary text-white px-8 py-3.5 rounded-xl text-lg font-semibold hover:shadow-xl transition-all"
              >
                Create Courses
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto"
            >
              <Link
                to="/signup?role=student"
                className="block w-full text-center bg-primary text-white px-8 py-3.5 rounded-xl text-lg font-semibold hover:shadow-xl transition-all"
              >
                Join as Student
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section with improved card layout */}
      <motion.section
        className="py-20 md:py-28 bg-background"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto px-4">
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <span className="text-primary font-semibold block mb-2">
              FEATURES
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-text">
              Platform Features
            </h2>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            variants={containerVariants}
          >
            {[
              {
                icon: FaChalkboardTeacher,
                title: "For Teachers",
                description:
                  "Create interactive courses, track student progress, and manage assignments with our intuitive tools.",
                colorClass: "text-primary",
              },
              {
                icon: FaUserGraduate,
                title: "For Students",
                description:
                  "Access course materials, submit assignments, and track your progress seamlessly from any device.",
                colorClass: "text-secondary",
              },
              {
                icon: FaUsers,
                title: "Collaborative Learning",
                description:
                  "Engage in discussions, participate in group activities, and learn together in real-time.",
                colorClass: "text-accent",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-card rounded-xl p-6 md:p-8 shadow-lg border border-card-border flex flex-col h-full"
                variants={fadeInUp}
                whileHover={{
                  y: -5,
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
              >
                <div
                  className={`${feature.colorClass} bg-card-border/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6`}
                >
                  <feature.icon className="text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-text mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted flex-grow">{feature.description}</p>
                <Link
                  to={`/learn-more/${feature.title.toLowerCase()}`}
                  className={`${feature.colorClass} mt-4 flex items-center font-medium`}
                >
                  Learn more <FaArrowRight className="ml-2 text-xs" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works Section with improved visual flow */}
      <section className="py-20 md:py-28 bg-background/50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-secondary font-semibold block mb-2">
              PROCESS
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-text">
              How It Works
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <StepCard
              icon={FaKey}
              title="For Teachers"
              steps={[
                "Create your personalized course with our easy-to-use tools",
                "Receive a unique course code to share with your students",
                "Monitor student progress and engagement in real-time",
              ]}
              color="primary"
            />
            <StepCard
              icon={FaUsers}
              title="For Students"
              steps={[
                "Sign up for free with just a few simple steps",
                "Enter the course code shared by your teacher",
                "Access materials and start learning at your own pace",
              ]}
              color="secondary"
            />
          </div>
        </div>
      </section>

      {/* CTA Section with improved layout and accessibility */}
      <motion.section
        className="py-20 md:py-28 bg-gradient-to-r from-primary to-secondary"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h2
            className="text-3xl md:text-5xl font-bold text-white mb-6"
            variants={fadeInUp}
          >
            Ready to Transform Your Education?
          </motion.h2>

          <motion.p
            className="text-xl text-white/90 mb-10 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            Join thousands of educators and students already using our platform
            to enhance learning experiences
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-5"
            variants={fadeInUp}
          >
            <Link
              to="/signup?role=teacher"
              className="block text-center px-8 py-4 rounded-xl text-lg font-semibold transition-all bg-white text-primary hover:bg-white/90 shadow-lg"
            >
              Start Teaching
            </Link>

            <Link
              to="/signup?role=student"
              className="block text-center px-8 py-4 rounded-xl text-lg font-semibold transition-all bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 shadow-lg"
            >
              Start Learning
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Testimonials Section (New) */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-accent font-semibold block mb-2">
              TESTIMONIALS
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-text">
              What Our Users Say
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "Madrasa Platform has completely transformed how I teach. My students are more engaged than ever!",
                name: "Sarah Johnson",
                role: "High School Teacher",
                color: "primary",
              },
              {
                quote:
                  "The interactive lessons make learning fun and accessible. I can study at my own pace and track my progress.",
                name: "Ahmed Ali",
                role: "University Student",
                color: "secondary",
              },
              {
                quote:
                  "As a school administrator, I've seen tremendous improvements in both teaching quality and student outcomes.",
                name: "Michael Chen",
                role: "School Principal",
                color: "accent",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-card rounded-xl p-6 shadow-lg border border-card-border"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: index * 0.1 },
                }}
                viewport={{ once: true }}
              >
                <div className={`text-${testimonial.color} mb-4`}>
                  {"★".repeat(5)}
                </div>
                <p className="text-text mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-text">{testimonial.name}</p>
                  <p className="text-muted text-sm">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const StepCard = ({ icon: Icon, title, steps, color }: StepCardProps) => {
  return (
    <motion.div
      className="bg-card rounded-xl p-8 shadow-lg border border-card-border"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
    >
      <div className="flex items-center mb-6">
        <div className={`bg-${color}/10 p-3 rounded-lg mr-4`}>
          <Icon className={`text-${color}`} size={28} />
        </div>
        <h3 className="text-2xl font-bold text-text">{title}</h3>
      </div>
      <ul className="space-y-4">
        {steps.map((step, index) => (
          <li key={index} className="flex items-start">
            <span
              className={`bg-${color} text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0 mt-0.5`}
            >
              {index + 1}
            </span>
            <span className="text-muted">{step}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default LandingPage;
