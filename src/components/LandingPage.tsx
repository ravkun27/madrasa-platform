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

interface StepCardProps {
  icon: React.ElementType;
  title: string;
  steps: string[];
  color: "primary" | "secondary";
}

const LandingPage = () => {
  const [searchValue, setSearchValue] = useState("");

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
    <div className="min-h-screen bg-gradient-to-br from-white to-light-teal">
      {/* Hero Section */}
      <motion.section
        className="relative pt-20 pb-24 px-4 overflow-hidden bg-gradient-landing"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-accent text-center mb-6"
            variants={fadeInUp}
          >
            Transform Learning with{" "}
            <span className="text-primary">Madarasa</span>
          </motion.h1>

          <motion.p
            className="text-xl text-slate text-center mb-12"
            variants={fadeInUp}
          >
            Join the future of education with our innovative learning platform
          </motion.p>

          {/* Search Bar */}
          <motion.div className="max-w-lg mx-auto mb-12" variants={fadeInUp}>
            <div className="flex items-center bg-white rounded-xl shadow-lg p-4 border border-light-teal">
              <FaSearch className="text-primary" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Enter course code to join..."
                className="flex-1 ml-3 outline-none bg-transparent text-accent placeholder-primary/50"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="ml-4 bg-primary-gradient text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
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
                className="block text-center bg-secondary-gradient text-white px-8 py-3 rounded-lg text-lg hover:shadow-xl transition-all"
              >
                Create Course
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/auth?role=student"
                className="block text-center bg-primary-gradient text-white px-8 py-3 rounded-lg text-lg hover:shadow-xl transition-all"
              >
                Join as Student
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="py-24 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center text-accent mb-16"
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
                colorClass: "text-primary",
                bgColorClass: "bg-light-teal",
              },
              {
                icon: FaUserGraduate,
                title: "For Students",
                description:
                  "Access course materials and track your progress seamlessly",
                colorClass: "text-secondary",
                bgColorClass: "bg-amber-50",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className={`${feature.bgColorClass} rounded-xl p-8 shadow-lg border border-light-teal`}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <feature.icon
                  className={`${feature.colorClass} text-4xl mb-6`}
                />
                <h3 className="text-xl font-bold text-accent mb-4">
                  {feature.title}
                </h3>
                <p className="text-slate">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <section className="py-24 bg-cream">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center text-accent mb-16"
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
              color="primary"
            />
            <StepCard
              icon={FaUsers}
              title="For Students"
              steps={[
                "Sign up for free",
                "Enter course code",
                "Start learning",
              ]}
              color="secondary"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        className="py-24 bg-primary-gradient"
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
            Ready to Transform Your Teaching?
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
              className="block text-center bg-white text-primary px-8 py-3 rounded-lg text-lg hover:bg-amber-dark hover:text-white transition-all shadow-lg"
            >
              Start Teaching
            </Link>

            <Link
              to="/auth?role=student"
              className="block text-center border border-white text-white px-8 py-3 rounded-lg text-lg hover:bg-white/10 transition-colors shadow-md"
            >
              Start Learning
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

const StepCard = ({ icon: Icon, title, steps, color }: StepCardProps) => (
  <motion.div
    className="bg-white rounded-xl p-8 shadow-lg border border-light-teal"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ y: -5 }}
  >
    <div className="flex items-center mb-8">
      <Icon className={`text-${color} mr-4`} size={28} />
      <h3 className="text-xl font-bold text-accent">{title}</h3>
    </div>
    <ul className="list-disc list-inside space-y-2">
      {steps.map((step, index) => (
        <li key={index} className="text-slate">
          {step}
        </li>
      ))}
    </ul>
  </motion.div>
);

export default LandingPage;
