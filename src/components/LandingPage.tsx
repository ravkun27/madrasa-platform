import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaChalkboardTeacher,
  FaUserGraduate,
  FaSearch,
  FaKey,
  FaUsers,
} from "react-icons/fa";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <motion.div
        className="text-center py-20 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6">
            Transform Learning with{" "}
            <span className="text-blue-600">CourseCodes</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Educators: Create courses and share unique codes. Students: Join
            instantly with your code.
          </p>

          {/* Course Code Search */}
          <motion.div
            className="max-w-md mx-auto mb-12"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center bg-white rounded-lg shadow-lg p-4">
              <FaSearch className="text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Enter Course Code"
                className="flex-1 outline-none"
              />
              <button className="ml-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                Join Now
              </button>
            </div>
          </motion.div>

          <div className="space-x-4">
            <Link
              to="/auth?role=teacher"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700 transition duration-300"
            >
              Create Course (Teachers)
            </Link>
            <Link
              to="/auth?role=student"
              className="bg-purple-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-purple-700 transition duration-300"
            >
              Sign Up (Students)
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <div className="px-6 py-16 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-16">
            Platform Features
          </h2>
          <div className="flex justify-center gap-8">
            {[
              {
                icon: FaChalkboardTeacher,
                title: "For Teachers",
                desc: "Create courses, generate unique codes, and manage student access effortlessly.",
                color: "text-blue-600",
              },
              {
                icon: FaUserGraduate,
                title: "For Students",
                desc: "Join courses instantly with provided codes, track progress, and access materials.",
                color: "text-purple-600",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 w-1/3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                <feature.icon className={`text-4xl mb-6 ${feature.color}`} />
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <motion.div
        className="py-16 bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-16">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Teacher Flow */}
            <motion.div
              className="bg-white p-8 rounded-xl shadow-lg"
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center mb-6">
                <FaKey className="text-3xl text-blue-600 mr-4" />
                <h3 className="text-2xl font-bold text-gray-800">
                  For Teachers
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4">
                    1
                  </div>
                  <p>Create your course in dashboard</p>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4">
                    2
                  </div>
                  <p>Get unique course code</p>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4">
                    3
                  </div>
                  <p>Share code with students</p>
                </div>
              </div>
            </motion.div>

            {/* Student Flow */}
            <motion.div
              className="bg-white p-8 rounded-xl shadow-lg"
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center mb-6">
                <FaUsers className="text-3xl text-purple-600 mr-4" />
                <h3 className="text-2xl font-bold text-gray-800">
                  For Students
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-4">
                    1
                  </div>
                  <p>Sign up for free account</p>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-4">
                    2
                  </div>
                  <p>Enter course code from teacher</p>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-4">
                    3
                  </div>
                  <p>Start learning immediately</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto text-center">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Ready to Transform Your Classroom?
          </motion.h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of educators and students already using CourseCodes
            for seamless learning experiences.
          </p>
          <div className="space-x-4">
            <Link
              to="/auth?role=teacher"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg hover:bg-blue-50 hover:scale-105 transition duration-300"
            >
              Start Teaching
            </Link>
            <Link
              to="/auth?role=student"
              className="border-2 border-white text-white px-8 py-3 rounded-lg text-lg hover:bg-white hover:text-blue-600 transition duration-300"
            >
              Join as Student
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
