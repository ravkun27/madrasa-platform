import { useEffect, useState } from "react";
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
import { useLanguage } from "../context/LanguageContext";

interface StepCardProps {
  icon: React.ElementType;
  title: string;
  steps: string[];
  color: "primary" | "secondary" | "primary-dark" | "secondary-dark";
}

const LandingPage = () => {
  const [searchValue, setSearchValue] = useState("");
  const [course, setCourse] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { language } = useLanguage();

  // Content translations
  const translations = {
    en: {
      heroTagline: "Revolutionize Your Learning Experience",
      heroTitle1: "Learning is Easier with",
      heroTitle2: "Madrasa Platform",
      heroDescription:
        "Join thousands of educators and students to create, share and access interactive learning materials all in one place.",
      searchPlaceholder: "Enter course code to join...",
      searching: "Searching...",
      joinCourse: "Join this Course",
      createCourses: "Create Courses",
      joinAsStudent: "Join as Student",
      features: "FEATURES",
      platformFeatures: "Platform Features",
      forTeachers: {
        title: "For Teachers",
        description:
          "Create interactive courses, track student progress, and manage assignments with our intuitive tools.",
      },
      forStudents: {
        title: "For Students",
        description:
          "Access course materials, submit assignments, and track your progress seamlessly from any device.",
      },
      collaborativeLearning: {
        title: "Collaborative Learning",
        description:
          "Engage in discussions, participate in group activities, and learn together in real-time.",
      },
      learnMore: "Learn more",
      process: "PROCESS",
      howItWorks: "How It Works",
      teacherSteps: [
        "Create your personalized course with our easy-to-use tools",
        "Receive a unique course code to share with your students",
        "Monitor student progress and engagement in real-time",
      ],
      studentSteps: [
        "Sign up for free with just a few simple steps",
        "Enter the course code shared by your teacher",
        "Access materials and start learning at your own pace",
      ],
      ctaTitle: "Ready to Transform Your Education?",
      ctaDescription:
        "Join thousands of educators and students already using our platform to enhance learning experiences",
      startTeaching: "Start Teaching",
      startLearning: "Start Learning",
      testimonials: "TESTIMONIALS",
      whatUsersSay: "What Our Users Say",
      testimonialData: [
        {
          quote:
            "Madrasa Platform has completely transformed how I teach. My students are more engaged than ever!",
          name: "Sarah Johnson",
          role: "High School Teacher",
        },
        {
          quote:
            "The interactive lessons make learning fun and accessible. I can study at my own pace and track my progress.",
          name: "Ahmed Ali",
          role: "University Student",
        },
        {
          quote:
            "As a school administrator, I've seen tremendous improvements in both teaching quality and student outcomes.",
          name: "Michael Chen",
          role: "School Principal",
        },
      ],
    },
    ar: {
      heroTagline: "ثورة في تجربة التعلم الخاصة بك",
      heroTitle1: "التعلم أسهل مع",
      heroTitle2: "منصة مدرسة",
      heroDescription:
        "انضم إلى آلاف المعلمين والطلاب لإنشاء ومشاركة والوصول إلى مواد تعليمية تفاعلية في مكان واحد.",
      searchPlaceholder: "أدخل رمز الدورة للانضمام...",
      searching: "جاري البحث...",
      joinCourse: "انضم إلى هذه الدورة",
      createCourses: "إنشاء دورات",
      joinAsStudent: "انضم كطالب",
      features: "المميزات",
      platformFeatures: "ميزات المنصة",
      forTeachers: {
        title: "للمعلمين",
        description:
          "إنشاء دورات تفاعلية، تتبع تقدم الطلاب، وإدارة الواجبات باستخدام أدواتنا البديهية.",
      },
      forStudents: {
        title: "للطلاب",
        description:
          "الوصول إلى مواد الدورة، تقديم الواجبات، وتتبع تقدمك بسلاسة من أي جهاز.",
      },
      collaborativeLearning: {
        title: "التعلم التعاوني",
        description:
          "المشاركة في المناقشات، والمشاركة في الأنشطة الجماعية، والتعلم معًا في الوقت الفعلي.",
      },
      learnMore: "تعلم المزيد",
      process: "العملية",
      howItWorks: "كيف تعمل",
      teacherSteps: [
        "أنشئ دورتك الشخصية باستخدام أدواتنا سهلة الاستخدام",
        "احصل على رمز دورة فريد لمشاركته مع طلابك",
        "مراقبة تقدم الطلاب والمشاركة في الوقت الفعلي",
      ],
      studentSteps: [
        "سجل مجانًا بخطوات بسيطة",
        "أدخل رمز الدورة الذي شاركه معلمك",
        "الوصول إلى المواد وبدء التعلم بالوتيرة الخاصة بك",
      ],
      ctaTitle: "هل أنت مستعد لتحويل تعليمك؟",
      ctaDescription:
        "انضم إلى آلاف المعلمين والطلاب الذين يستخدمون منصتنا بالفعل لتعزيز تجارب التعلم",
      startTeaching: "ابدأ التدريس",
      startLearning: "ابدأ التعلم",
      testimonials: "الشهادات",
      whatUsersSay: "ماذا يقول مستخدمونا",
      testimonialData: [
        {
          quote:
            "لقد غيرت منصة مدرسة تمامًا طريقة تدريسي. طلابي أكثر تفاعلاً من أي وقت مضى!",
          name: "سارة جونسون",
          role: "معلمة مدرسة ثانوية",
        },
        {
          quote:
            "الدروس التفاعلية تجعل التعلم ممتعًا وسهل الوصول. يمكنني الدراسة بالوتيرة الخاصة بي وتتبع تقدمي.",
          name: "أحمد علي",
          role: "طالب جامعي",
        },
        {
          quote:
            "كمدير مدرسة، شهدت تحسينات هائلة في كل من جودة التدريس ونتائج الطلاب.",
          name: "مايكل تشن",
          role: "مدير مدرسة",
        },
      ],
    },
  };

  // Current language content
  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    const fetchCourse = async () => {
      if (searchValue.trim().length === 0) {
        setCourse(null);
        return;
      }

      setLoading(true);
      setError("");
      try {
        // Consider adding language parameter to API request if needed
        const res = await fetch(
          `/api/courses/${searchValue.trim()}?lang=${language}`
        );
        if (!res.ok) throw new Error("Course not found");
        const data = await res.json();
        setCourse(data);
      } catch (err) {
        setCourse(null);
        setError(language === "en" ? "Course not found" : "الدورة غير موجودة");
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchCourse();
    }, 600); // debounce

    return () => clearTimeout(delayDebounce);
  }, [searchValue, language]);

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

  // Set text direction based on language
  const textDirection = language === "ar" ? "rtl" : "ltr";

  return (
    <div className={`min-h-screen bg-background`} dir={textDirection}>
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
              {t.heroTagline}
            </span>

            <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t.heroTitle1}
              </span>
              <br />
              <span className="relative inline-block">
                <span className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
                <motion.span
                  className="relative text-text font-black"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {t.heroTitle2}
                </motion.span>
              </span>
            </h1>

            <p className="text-muted max-w-2xl mx-auto text-lg">
              {t.heroDescription}
            </p>
          </motion.div>

          {/* Search box */}
          <motion.div
            className="w-full max-w-xl px-4 mx-auto mb-10"
            variants={fadeInUp}
          >
            <div className="flex flex-col sm:flex-row items-stretch gap-3 bg-card rounded-xl shadow-lg p-4 border border-card-border">
              <div className="flex items-center gap-2 w-full">
                <FaSearch className="text-primary text-xl" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full outline-none bg-transparent text-text placeholder-muted"
                  aria-label="Course code"
                />
              </div>
            </div>
          </motion.div>

          {/* Status */}
          {loading && (
            <p className="text-center text-muted mt-4">{t.searching}</p>
          )}
          {error && <p className="text-center text-red-500 mt-2">{error}</p>}

          {/* Course card */}
          {course && (
            <motion.div
              className="bg-card p-6 rounded-xl shadow-md border border-card-border mt-6 w-full max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="text-xl md:text-2xl font-bold text-text mb-2">
                {course.title}
              </h3>
              <p className="text-muted mb-6 text-sm md:text-base">
                {course.description}
              </p>
              <Link
                to={`/signup?role=student&courseCode=${course.code}`}
                className="inline-block bg-primary hover:bg-secondary text-white px-5 py-2 rounded-lg font-medium transition-all"
              >
                {t.joinCourse}
              </Link>
            </motion.div>
          )}

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
                {t.createCourses}
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
                {t.joinAsStudent}
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
              {t.features}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-text">
              {t.platformFeatures}
            </h2>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            variants={containerVariants}
          >
            {[
              {
                icon: FaChalkboardTeacher,
                title: t.forTeachers.title,
                description: t.forTeachers.description,
                colorClass: "text-primary",
              },
              {
                icon: FaUserGraduate,
                title: t.forStudents.title,
                description: t.forStudents.description,
                colorClass: "text-secondary",
              },
              {
                icon: FaUsers,
                title: t.collaborativeLearning.title,
                description: t.collaborativeLearning.description,
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
                  to={`/learn-more/${encodeURIComponent(feature.title.toLowerCase())}`}
                  className={`${feature.colorClass} mt-4 flex items-center font-medium ${language === "ar" ? "flex-row-reverse" : ""}`}
                >
                  {t.learnMore}
                  <FaArrowRight
                    className={`${language === "ar" ? "mr-2 rotate-180" : "ml-2"} text-xs`}
                  />
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
              {t.process}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-text">
              {t.howItWorks}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <StepCard
              icon={FaKey}
              title={t.forTeachers.title}
              steps={t.teacherSteps}
              color="primary"
            />
            <StepCard
              icon={FaUsers}
              title={t.forStudents.title}
              steps={t.studentSteps}
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
            {t.ctaTitle}
          </motion.h2>

          <motion.p
            className="text-xl text-white/90 mb-10 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            {t.ctaDescription}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-5"
            variants={fadeInUp}
          >
            <Link
              to="/signup?role=teacher"
              className="block text-center px-8 py-4 rounded-xl text-lg font-semibold transition-all bg-white text-primary hover:bg-white/90 shadow-lg"
            >
              {t.startTeaching}
            </Link>

            <Link
              to="/signup?role=student"
              className="block text-center px-8 py-4 rounded-xl text-lg font-semibold transition-all bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 shadow-lg"
            >
              {t.startLearning}
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
              {t.testimonials}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-text">
              {t.whatUsersSay}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.testimonialData.map((testimonial, index) => (
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
                <div className="text-primary mb-4">{"★".repeat(5)}</div>
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
  const { language } = useLanguage();
  const isRTL = language === "ar";

  return (
    <motion.div
      className="bg-card rounded-xl p-8 shadow-lg border border-card-border"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
    >
      <div
        className={`flex items-center mb-6 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <div
          className={`bg-${color}/10 p-3 rounded-lg ${isRTL ? "ml-4" : "mr-4"}`}
        >
          <Icon className={`text-${color}`} size={28} />
        </div>
        <h3 className="text-2xl font-bold text-text">{title}</h3>
      </div>
      <ul className="space-y-4">
        {steps.map((step, index) => (
          <li
            key={index}
            className={`flex items-start ${isRTL ? "flex-row-reverse text-right" : ""}`}
          >
            <span
              className={`bg-${color} text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${isRTL ? "ml-3" : "mr-3"} flex-shrink-0 mt-0.5`}
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
