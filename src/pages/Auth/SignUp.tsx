import { useState, FormEvent, useEffect, useCallback } from "react";
import { FaSpinner } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { postFetch } from "../../utils/apiCall";
import { toast } from "react-hot-toast";
import { PhoneVerification } from "../../components/PhoneVerification";
import { PasswordInput } from "../../components/PasswordInput";
import { RoleSelection } from "../../components/RoleSelection";
import { CommunicationPreference } from "../../components/CommunicationPreference";
import { EmailVerification } from "../../components/EmailVerification";
import { useLanguage } from "../../context/LanguageContext";

interface SignupResponse {
  success: boolean;
  data: {
    token: string;
    role: string;
  };
  message?: string;
}

interface OtpResponse {
  success: boolean;
  message?: string;
  data?: {
    optId?: string;
  };
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  otp: string;
  phoneNumber: string;
  phoneOtp: string;
  TelegramOrWhatsapp: string;
}

interface Country {
  name: string;
  dial_code: string;
  code: string;
  flag: string;
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "",
  otp: "",
  phoneNumber: "",
  phoneOtp: "",
  TelegramOrWhatsapp: "",
};

const initialCountry: Country = {
  name: "iraq",
  dial_code: "+964",
  code: "IQ",
  flag: "🇮🇶",
};

const Signup = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  // Form state
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [country, setCountry] = useState<Country>(initialCountry);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // OTP state
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isPhoneOtpVerified, setIsPhoneOtpVerified] = useState(false);
  const [phoneOtpId, setPhoneOtpId] = useState("");

  // Countdown state
  const [countdown, setCountdown] = useState(0);
  const [phoneCountdown, setPhoneCountdown] = useState(0);

  // Loading state
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Translation strings
  const translations = {
    en: {
      signup: {
        title: "Create Account",
        firstName: "First Name",
        lastName: "Last Name",
        password: "Password",
        confirmPassword: "Confirm Password",
        createAccount: "Create Account",
        creatingAccount: "Creating Account...",
        alreadyHaveAccount: "Already have an account?",
        signInNow: "Sign In Now",
        agreeToTerms: "I agree to the",
        termsAndConditions: "Terms and Conditions",
        selectRole: "Please select a role.",
        verifyPhoneOtp: "Please verify your phone OTP.",
        fixErrors: "Please fix the errors and try again.",
      },
      validation: {
        firstNameRequired: "First name is required.",
        lastNameRequired: "Last name is required.",
        emailRequired: "Email is required.",
        phoneRequired: "Phone number is required.",
        passwordRequired: "Password is required.",
        passwordsNotMatch: "Passwords do not match.",
        otpRequired: "Please enter a 4-digit OTP",
      },
      messages: {
        otpSentEmail: "OTP sent to email!",
        otpSentPhone: "OTP sent to phone!",
        otpVerified: "OTP verified successfully!",
        phoneOtpVerified: "Phone OTP verified successfully!",
        signupSuccess: "Account created successfully!",
        signupFailed: "Signup failed. Please try again.",
        otpFailed: "Failed to send OTP",
        verifyOtpFailed: "Failed to verify OTP. Please try again.",
        phoneOtpFailed: "Phone OTP verification failed",
        somethingWrong: "Something went wrong. Please try again.",
      },
    },
    ar: {
      signup: {
        title: "إنشاء حساب",
        firstName: "الاسم الأول",
        lastName: "اسم العائلة",
        password: "كلمة المرور",
        confirmPassword: "تأكيد كلمة المرور",
        createAccount: "إنشاء حساب",
        creatingAccount: "جاري إنشاء الحساب...",
        alreadyHaveAccount: "هل لديك حساب بالفعل؟",
        signInNow: "تسجيل الدخول الآن",
        agreeToTerms: "أوافق على",
        termsAndConditions: "الشروط والأحكام",
        selectRole: "يرجى اختيار دور.",
        verifyPhoneOtp: "يرجى التحقق من رمز الهاتف.",
        fixErrors: "يرجى إصلاح الأخطاء والمحاولة مرة أخرى.",
      },
      validation: {
        firstNameRequired: "الاسم الأول مطلوب.",
        lastNameRequired: "اسم العائلة مطلوب.",
        emailRequired: "البريد الإلكتروني مطلوب.",
        phoneRequired: "رقم الهاتف مطلوب.",
        passwordRequired: "كلمة المرور مطلوبة.",
        passwordsNotMatch: "كلمات المرور غير متطابقة.",
        otpRequired: "يرجى إدخال رمز مكون من 4 أرقام",
      },
      messages: {
        otpSentEmail: "تم إرسال الرمز إلى البريد الإلكتروني!",
        otpSentPhone: "تم إرسال الرمز إلى الهاتف!",
        otpVerified: "تم التحقق من الرمز بنجاح!",
        phoneOtpVerified: "تم التحقق من رمز الهاتف بنجاح!",
        signupSuccess: "تم إنشاء الحساب بنجاح!",
        signupFailed: "فشل في إنشاء الحساب. يرجى المحاولة مرة أخرى.",
        otpFailed: "فشل في إرسال الرمز",
        verifyOtpFailed: "فشل في التحقق من الرمز. يرجى المحاولة مرة أخرى.",
        phoneOtpFailed: "فشل في التحقق من رمز الهاتف",
        somethingWrong: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
      },
    },
  };

  const t = translations[language];

  // Process phone number helper
  const processPhoneNumber = useCallback((phoneNumber: string): string => {
    let rawNumber = phoneNumber.replace(/\D/g, "");
    rawNumber = rawNumber.replace(/^0+/, "");
    if (rawNumber.length > 10) {
      rawNumber = rawNumber.slice(-10);
    }
    return rawNumber;
  }, []);

  // Update form data helper
  const updateFormData = useCallback((updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  // Send OTP handler
  const handleSendOtp = useCallback(
    async (payload: {
      email?: string;
      phoneNumber?: string;
      country?: string;
    }): Promise<{ success: boolean; message?: string }> => {
      setIsSendingOtp(true);
      try {
        const postData: any = { ...payload };

        if (payload.phoneNumber && payload.country) {
          const processedNumber = processPhoneNumber(payload.phoneNumber);
          postData.phoneNumber = processedNumber;
          postData.method = "whatsapp";
        }

        const result = await postFetch<OtpResponse>(
          "/user/sendOTP?for=createUser",
          postData
        );

        if (result.success) {
          const receivedOtpId = result.data?.optId || "";

          if (payload.phoneNumber) {
            setPhoneOtpId(receivedOtpId);
            setPhoneCountdown(30);
            toast.success(t.messages.otpSentPhone);
          } else if (payload.email) {
            setCountdown(30);
            setIsOtpSent(true);
            toast.success(t.messages.otpSentEmail);
          }

          return { success: true };
        } else {
          toast.error(result.message || t.messages.otpFailed);
          return {
            success: false,
            message: result.message || t.messages.otpFailed,
          };
        }
      } catch (error: any) {
        const errorMessage = error.message || t.messages.otpFailed;
        toast.error(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setIsSendingOtp(false);
      }
    },
    [processPhoneNumber, t.messages]
  );

  // Verify email OTP handler
  const handleVerifyOtp = useCallback(async () => {
    if (formData.otp.length !== 4) {
      toast.error(t.validation.otpRequired);
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const result = await postFetch<OtpResponse>("/user/verifyOtp", {
        email: formData.email,
        otp: formData.otp,
      });

      if (result.success) {
        setIsOtpVerified(true);
        toast.success(t.messages.otpVerified);
      } else {
        throw new Error(result.message || t.messages.verifyOtpFailed);
      }
    } catch (error: any) {
      toast.error(error.message || t.messages.verifyOtpFailed);
    } finally {
      setIsVerifyingOtp(false);
    }
  }, [formData.otp, formData.email, t.validation.otpRequired, t.messages]);

  // Verify phone OTP handler
  const handleVerifyPhoneOtp = useCallback(
    async (otp: string) => {
      setIsVerifyingOtp(true);
      const processedPhoneNumber = processPhoneNumber(formData.phoneNumber);

      try {
        const result = await postFetch<OtpResponse>("/user/verifyOtp", {
          phoneNumber: processedPhoneNumber,
          otp: otp,
          optId: phoneOtpId,
          country: country.name.toLowerCase(),
        });

        if (result.success) {
          setIsPhoneOtpVerified(true);
          toast.success(t.messages.phoneOtpVerified);
        } else {
          throw new Error(result.message || t.messages.phoneOtpFailed);
        }
      } catch (error: any) {
        toast.error(error.message || t.messages.verifyOtpFailed);
      } finally {
        setIsVerifyingOtp(false);
      }
    },
    [
      formData.phoneNumber,
      phoneOtpId,
      country.name,
      processPhoneNumber,
      t.messages,
    ]
  );

  // Form validation
  const validateForm = useCallback((): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = t.validation.firstNameRequired;
    if (!formData.lastName.trim())
      newErrors.lastName = t.validation.lastNameRequired;
    if (!formData.email.trim()) newErrors.email = t.validation.emailRequired;
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = t.validation.phoneRequired;
    if (!formData.password) newErrors.password = t.validation.passwordRequired;
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t.validation.passwordsNotMatch;
    }
    if (!formData.role) newErrors.role = t.signup.selectRole;
    if (!isPhoneOtpVerified) newErrors.phoneOtp = t.signup.verifyPhoneOtp;

    return newErrors;
  }, [formData, isPhoneOtpVerified, t.validation, t.signup]);

  // Form submission handler
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      const newErrors = validateForm();
      setErrors(newErrors);

      if (Object.keys(newErrors).length > 0) {
        toast.error(t.signup.fixErrors);
        setIsSubmitting(false);
        return;
      }

      try {
        const result = await postFetch<SignupResponse>("/user/signup", {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phoneNumber,
          password: formData.password,
          role: formData.role,
          otp: formData.otp,
          TelegramOrWhatsapp: formData.TelegramOrWhatsapp,
          country: country.name.toLowerCase(),
        });

        if (result.success && result.data) {
          const { token, role } = result.data;
          localStorage.setItem("token", token);
          localStorage.setItem("role", role);
          toast.success(t.messages.signupSuccess);
          navigate(`/${role.toLowerCase()}-dashboard`);
        } else {
          toast.error(result.message || t.messages.signupFailed);
        }
      } catch (error: any) {
        toast.error(error.message || t.messages.somethingWrong);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      formData,
      country.name,
      isPhoneOtpVerified,
      validateForm,
      navigate,
      t.signup,
      t.messages,
    ]
  );

  // Countdown effects
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (phoneCountdown > 0) {
      const timer = setInterval(
        () => setPhoneCountdown((prev) => prev - 1),
        1000
      );
      return () => clearInterval(timer);
    }
  }, [phoneCountdown]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-xl p-6 md:p-8 border-2 border-accent rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-8 text-center text-primary dark:text-secondary">
          {t.signup.title}
        </h1>

        <AnimatePresence mode="wait">
          {!formData.role ? (
            <RoleSelection setRole={(role) => updateFormData({ role })} />
          ) : (
            <motion.form
              key="signup-form"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="space-y-6">
                {/* Name inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder={t.signup.firstName}
                    required
                    value={formData.firstName}
                    onChange={(e) =>
                      updateFormData({ firstName: e.target.value })
                    }
                    className={`w-full p-3 border rounded-lg focus:outline-none text-black focus:ring-2 ${
                      errors.firstName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t.signup.lastName}
                    required
                    value={formData.lastName}
                    onChange={(e) =>
                      updateFormData({ lastName: e.target.value })
                    }
                    className={`w-full p-3 border rounded-lg focus:outline-none text-black focus:ring-2 ${
                      errors.lastName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>

                {/* Email verification */}
                <EmailVerification
                  email={formData.email}
                  setEmail={(email: string) => updateFormData({ email })}
                  isOtpSent={isOtpSent}
                  isOtpVerified={isOtpVerified}
                  isSendingOtp={isSendingOtp}
                  countdown={countdown}
                  onSendOtp={() => handleSendOtp({ email: formData.email })}
                  onVerifyOtp={handleVerifyOtp}
                  otp={formData.otp}
                  setOtp={(otp: string) => updateFormData({ otp })}
                  isVerifyingOtp={isVerifyingOtp}
                />

                {/* Phone verification */}
                {isOtpVerified && (
                  <PhoneVerification
                    phoneNumber={formData.phoneNumber}
                    setPhoneNumber={(phoneNumber) =>
                      updateFormData({ phoneNumber })
                    }
                    onCommunicationChange={(method) =>
                      updateFormData({
                        TelegramOrWhatsapp: method || "whatsapp",
                      })
                    }
                    onVerify={handleVerifyPhoneOtp}
                    countdown={phoneCountdown}
                    isVerified={isPhoneOtpVerified}
                    selectedCountry={country}
                    setSelectedCountry={setCountry}
                    onSendOtp={handleSendOtp}
                  />
                )}

                {/* Password inputs */}
                {isPhoneOtpVerified && (
                  <>
                    <div className="space-y-4">
                      <PasswordInput
                        value={formData.password}
                        onChange={(value) =>
                          updateFormData({ password: value })
                        }
                        placeholder={t.signup.password}
                      />
                      <PasswordInput
                        value={formData.confirmPassword}
                        onChange={(value) =>
                          updateFormData({ confirmPassword: value })
                        }
                        placeholder={t.signup.confirmPassword}
                      />
                    </div>

                    <CommunicationPreference
                      value={formData.TelegramOrWhatsapp}
                      onChange={(method) =>
                        updateFormData({ TelegramOrWhatsapp: method })
                      }
                    />
                  </>
                )}

                {/* Terms and conditions */}
                <div className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mt-1 accent-primary"
                  />
                  <label
                    htmlFor="terms"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    {t.signup.agreeToTerms}{" "}
                    <a
                      href="https://madrasaplatform.com/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline hover:text-primary/80"
                    >
                      {t.signup.termsAndConditions}
                    </a>
                  </label>
                </div>

                {/* Submit button */}
                {isPhoneOtpVerified && (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      isSubmitting
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-primary hover:bg-primary/90 text-white"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        {t.signup.creatingAccount}
                      </>
                    ) : (
                      t.signup.createAccount
                    )}
                  </button>
                )}
              </div>

              {/* Sign in link */}
              <div className="flex flex-col sm:flex-row gap-2 justify-center items-center mt-6">
                <p className="text-gray-600 dark:text-gray-300">
                  {t.signup.alreadyHaveAccount}
                </p>
                <Link
                  to="/login"
                  className="font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  {t.signup.signInNow}
                </Link>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Signup;
