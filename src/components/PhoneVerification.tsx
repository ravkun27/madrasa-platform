import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import CountryList from "country-list-with-dial-code-and-flag";
import OtpInput from "./OtpInput";
import { CheckCircle, Loader, AlertCircle, ChevronDown } from "lucide-react";
import Flag from "react-world-flags";
import { useLanguage } from "../context/LanguageContext";

const CountryOptions = CountryList.getAll();

export const PhoneVerification = ({
  phoneNumber,
  setPhoneNumber,
  onVerify,
  onSendOtp,
  isVerified,
  selectedCountry,
  setSelectedCountry,
  countdown,
}: {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  onVerify: (otp: string) => void;
  onSendOtp: (payload: {
    phoneNumber: string;
    country: string;
  }) => Promise<boolean | { success: boolean; message?: string }>;
  isVerified: boolean;
  selectedCountry: {
    name: string;
    dial_code: string;
    code: string;
    flag: string;
  };
  setSelectedCountry: (value: {
    name: string;
    dial_code: string;
    code: string;
    flag: string;
  }) => void;
  onCommunicationChange?: (method: "telegram" | "whatsapp") => void;
  countdown: number;
}) => {
  const { language } = useLanguage();
  const [otp, setOtp] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  const translations = {
    info: {
      en: "Phone number must have WhatsApp installed to receive OTP.",
      ar: "يجب أن يكون تطبيق واتساب مثبتًا لتلقي رمز التحقق.",
    },
    phonePlaceholder: {
      en: "Phone Number",
      ar: "رقم الهاتف",
    },
    sendOtp: {
      en: "Send OTP",
      ar: "إرسال رمز التحقق",
    },
    otpPrompt: {
      en: "Enter the 4-digit code sent to your phone",
      ar: "أدخل رمز التحقق المكون من 4 أرقام المُرسل إلى هاتفك",
    },
    noCodeHint: {
      en: "Didn't receive a code? Check your WhatsApp or tap Send OTP again.",
      ar: "لم يصلك الرمز؟ تحقق من واتساب أو اضغط على 'إرسال رمز التحقق' مرة أخرى.",
    },
    invalidPhone: {
      en: "Please enter a valid phone number",
      ar: "يرجى إدخال رقم هاتف صحيح",
    },
    invalidOtp: {
      en: "Please enter a valid 4-digit OTP",
      ar: "يرجى إدخال رمز تحقق مكون من 4 أرقام",
    },
  };

  const filteredCountries = CountryOptions.filter((c) =>
    c.name.toLowerCase().includes(countrySearch)
  );

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 5) {
      toast.error(translations.invalidPhone[language]);
      return;
    }

    setIsSending(true);
    try {
      await onSendOtp({
        phoneNumber,
        country: selectedCountry.name,
      });
    } catch (error) {
      console.error("Error sending OTP:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Info Message */}
      <div className="mb-6 flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-700 dark:text-blue-300 text-sm">
        <AlertCircle size={18} className="flex-shrink-0" />
        <p>{translations.info[language]}</p>
      </div>

      {/* Phone Input Section */}
      <div className="space-y-4">
        <div className="relative">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Country Code Dropdown */}
            <div className="relative w-full md:w-1/3">
              <div
                className={`relative flex items-center justify-between px-3 py-3 rounded-lg border ${isVerified ? "border-green-300 bg-green-50 dark:bg-green-900/10 dark:border-green-700" : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"} focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all cursor-pointer ${isVerified ? "cursor-not-allowed" : ""}`}
                onClick={() =>
                  !isVerified &&
                  setIsCountryDropdownOpen(!isCountryDropdownOpen)
                }
              >
                <div className="flex items-center gap-2">
                  <Flag
                    code={selectedCountry.code.toLowerCase()}
                    style={{ width: 24, height: 16 }}
                    className="rounded-sm"
                  />
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {selectedCountry.dial_code}
                  </span>
                </div>
                {!isVerified && (
                  <ChevronDown
                    size={18}
                    className={`text-gray-500 transition-transform duration-200 ${isCountryDropdownOpen ? "rotate-180" : ""}`}
                  />
                )}
              </div>

              {/* Country Dropdown */}
              {isCountryDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                  <div className="p-2 sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <input
                      type="text"
                      placeholder={
                        language === "ar" ? "ابحث عن الدولة" : "Search country"
                      }
                      value={countrySearch}
                      onChange={(e) =>
                        setCountrySearch(e.target.value.toLowerCase())
                      }
                      className="w-full mt-2 mb-4 p-2 border rounded-md text-sm text-black"
                    />
                  </div>
                  <div className="py-1">
                    {filteredCountries.map((c) => (
                      <div
                        key={`${c.dial_code}-${c.code}`}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => {
                          setSelectedCountry({
                            name: c.name.toLowerCase(),
                            dial_code: c.dial_code,
                            code: c.code,
                            flag: c.flag,
                          });
                          setIsCountryDropdownOpen(false);
                        }}
                      >
                        <Flag
                          code={c.code.toLowerCase()}
                          style={{ width: 24, height: 16 }}
                          className="rounded-sm"
                        />
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {c.name}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                          {c.dial_code}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Phone Number Input */}
            <div className="relative flex-grow flex">
              <div
                className={`flex-grow relative ${isVerified ? "has-verified" : ""}`}
              >
                <input
                  type="tel"
                  placeholder={translations.phonePlaceholder[language]}
                  value={phoneNumber}
                  disabled={isVerified}
                  onChange={(e) =>
                    setPhoneNumber(
                      e.target.value.replace(/\D/g, "").slice(0, 15)
                    )
                  }
                  className={`w-full p-3 rounded-lg border ${
                    isVerified
                      ? "border-green-300 bg-green-50 dark:bg-green-900/10 dark:border-green-700"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600"
                  } text-gray-900 text-base transition-colors disabled:opacity-90 disabled:cursor-not-allowed pr-10`}
                  aria-label="Enter your phone number"
                />

                {/* Verified Check */}
                {isVerified && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle size={20} className="text-green-500" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Send OTP Button */}
          {!isVerified && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleSendOtp}
              disabled={countdown > 0 || isSending}
              className={`mt-3 w-full px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                countdown > 0 || isSending
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 shadow-sm hover:shadow"
              }`}
            >
              {isSending ? (
                <Loader size={18} className="animate-spin" />
              ) : countdown > 0 ? (
                <span className="flex items-center gap-2">
                  <Loader size={16} className="animate-spin" />
                  <span>{`${countdown}s`}</span>
                </span>
              ) : (
                <span>{translations.sendOtp[language]}</span>
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* OTP Input */}
      <AnimatePresence>
        {countdown > 0 && !isVerified && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-8"
          >
            <div className="text-center text-sm text-gray-700 dark:text-gray-300 mb-4 font-medium">
              {translations.otpPrompt[language]}
            </div>
            <OtpInput
              value={otp}
              onChange={setOtp}
              onVerify={() => {
                if (otp.length === 4) {
                  onVerify(otp);
                } else {
                  toast.error(translations.invalidOtp[language]);
                }
              }}
              isVerified={isVerified}
              isVerifying={false}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resend Hint */}
      {countdown === 0 && !isVerified && phoneNumber.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6"
        >
          {translations.noCodeHint[language]}
        </motion.p>
      )}
    </div>
  );
};
