import { useState, FormEvent, useEffect } from "react";
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

const Signup = ({ setIsLogin }: { setIsLogin: (isLogin: boolean) => void }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
  });
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isPhoneOtpVerified, setIsPhoneOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [phoneCountdown, setPhoneCountdown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneOtpId, setPhoneOtpId] = useState("");
  const [country, setCountry] = useState({
    name: "iraq",
    dial_code: "+964",
    code: "IQ",
    flag: "🇮🇶",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSendOtp = async (payload: {
    email?: string;
    phoneNumber?: string;
    country?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    setIsSendingOtp(true);
    try {
      const postData: any = { ...payload };

      if (payload.phoneNumber && payload.country) {
        let rawNumber = payload.phoneNumber.replace(/\D/g, ""); // Remove all non-digit characters

        // Remove leading zeros
        rawNumber = rawNumber.replace(/^0+/, "");

        // Trim to the last 10 digits if it's longer than 10
        if (rawNumber.length > 10) {
          rawNumber = rawNumber.slice(-10);
        }

        postData.phoneNumber = rawNumber;
        postData.method = "whatsapp"; // force method to whatsapp
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
        } else if (payload.email) {
          setCountdown(30);
          setIsOtpSent(true);
        }

        toast.success(`OTP sent to ${payload.email ? "email" : "phone"}!`);
        return { success: true };
      } else {
        toast.error(result.message || "Failed to send OTP");
        return {
          success: false,
          message: result.message || "Failed to send OTP",
        };
      }
    } catch (error: any) {
      const errorMessage =
        error.message || "Failed to send OTP. Please try again.";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (formData.otp.length !== 4) {
      toast.error("Please enter a 4-digit OTP");
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
        toast.success("OTP verified successfully!");
      } else {
        throw new Error(result.message || "OTP verification failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to verify OTP. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleVerifyPhoneOtp = async (otp: string) => {
    setIsVerifyingOtp(true);

    // Remove leading zeros and ensure the phone number is exactly 10 digits
    let processedPhoneNumber = formData.phoneNumber.replace(/^0+/, "");

    if (processedPhoneNumber.length > 10) {
      processedPhoneNumber = processedPhoneNumber.slice(-10); // Keep only the last 10 digits
    }

    try {
      const result = await postFetch<OtpResponse>("/user/verifyOtp", {
        phoneNumber: processedPhoneNumber,
        otp: otp,
        optId: phoneOtpId,
        country: country.name.toLowerCase(), // Always convert country name to lowercase
      });

      if (result.success) {
        setIsPhoneOtpVerified(true);
        toast.success("Phone OTP verified successfully!");
      } else {
        throw new Error(result.message || "Phone OTP verification failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to verify OTP. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // const handleResendOtp = async (type: "email" | "phone") => {
  //   if (type === "email") {
  //     await handleSendEmailOtp();
  //   } else {
  //     await handleSendPhoneOtp();
  //   }
  // }

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);
  // Update countdown effects
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim())
      newErrors.lastName = "Last name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required.";
    if (!formData.password) newErrors.password = "Password is required.";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    if (!formData.role) newErrors.role = "Please select a role.";
    if (!isPhoneOtpVerified)
      newErrors.phoneOtp = "Please verify your phone OTP.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors and try again.");
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
        country: country.name.toLowerCase(), // Always convert country name to lowercase
      });

      if (result.success && result.data) {
        const { token, role } = result.data;
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        navigate(`/${role.toLowerCase()}-dashboard`);
      } else {
        toast.error(result.message || "Signup failed. Please try again.");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-xl p-6 md:p-8 border-2 border-accent rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-8 text-center text-primary dark:text-secondary">
          Create Account
        </h1>

        <AnimatePresence mode="wait">
          {!formData.role ? (
            <RoleSelection
              setRole={(role) => setFormData((prev) => ({ ...prev, role }))}
            />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    required
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className={`w-full p-3 border rounded-lg focus:outline-none text-black focus:ring-2 ${
                      errors.firstName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    required
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className={`w-full p-3 border rounded-lg focus:outline-none text-black focus:ring-2 ${
                      errors.firstName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>

                <EmailVerification
                  email={formData.email}
                  setEmail={(email: string) =>
                    setFormData({ ...formData, email })
                  }
                  isOtpSent={isOtpSent}
                  isOtpVerified={isOtpVerified}
                  isSendingOtp={isSendingOtp}
                  countdown={countdown}
                  onSendOtp={() => handleSendOtp({ email: formData.email })}
                  onVerifyOtp={handleVerifyOtp}
                  otp={formData.otp}
                  setOtp={(otp: string) => setFormData({ ...formData, otp })}
                  isVerifyingOtp={isVerifyingOtp}
                />
                {/* {isOtpVerified && ( */}
                  <PhoneVerification
                    phoneNumber={formData.phoneNumber}
                    setPhoneNumber={(phoneNumber) =>
                      setFormData({ ...formData, phoneNumber })
                    }
                    onCommunicationChange={(method) =>
                      setFormData({
                        ...formData,
                        TelegramOrWhatsapp: method || "whatsapp",
                      })
                    }
                    onVerify={handleVerifyPhoneOtp}
                    countdown={phoneCountdown}
                    isVerified={isPhoneOtpVerified}
                    selectedCountry={country}
                    setSelectedCountry={setCountry}
                    onSendOtp={async (payload) => {
                      return await handleSendOtp(payload);
                    }}
                  />
                {/* )} */}
                {isPhoneOtpVerified && (
                  <>
                    <div className="space-y-4">
                      <PasswordInput
                        value={formData.password}
                        onChange={(value) =>
                          setFormData({ ...formData, password: value })
                        }
                        placeholder="Password"
                      />
                      <PasswordInput
                        value={formData.confirmPassword}
                        onChange={(value) =>
                          setFormData({ ...formData, confirmPassword: value })
                        }
                        placeholder="Confirm Password"
                      />
                    </div>

                    <CommunicationPreference
                      value={formData.TelegramOrWhatsapp}
                      onChange={(method) =>
                        setFormData({
                          ...formData,
                          TelegramOrWhatsapp: method,
                        })
                      }
                    />
                  </>
                )}

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
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-center items-center mt-6">
                <p className="text-gray-600 dark:text-gray-300">
                  Already have an account?
                </p>
                <Link
                  to="/login"
                  onClick={() => setIsLogin(false)}
                  className="font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Sign In Now
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
