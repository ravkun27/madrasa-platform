import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import CountryList from "country-list-with-dial-code-and-flag";
import OtpInput from "./OtpInput";
import { CheckCircle, Loader, AlertCircle } from "lucide-react";
import Flag from "react-world-flags";

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
  const [otp, setOtp] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 5) {
      toast.error("Please enter a valid phone number");
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

  console.log(CountryOptions.map((c) => c.code)); // Log the country codes

  return (
    <div className="max-w-lg mx-auto">
      {/* Info Message */}
      <div className="mb-4 flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-700 dark:text-blue-300 text-sm">
        <AlertCircle size={16} className="flex-shrink-0" />
        <p>Phone number must have WhatsApp installed to receive OTP.</p>
      </div>

      {/* Phone Input Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Country Code Dropdown */}
          <div className="sm:col-span-1">
            <div className="relative flex items-center">
              <Flag
                code={selectedCountry.code.toLowerCase()}
                style={{ width: 20, height: 20 }}
                className="absolute left-3"
              />
              <select
                value={selectedCountry.dial_code}
                onChange={(e) => {
                  const newCountry = CountryOptions.find(
                    (c) => c.dial_code === e.target.value
                  );
                  if (newCountry) setSelectedCountry(newCountry);
                }}
                disabled={isVerified}
                className="w-full pl-10 pr-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white text-sm text-black appearance-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed truncate"
                aria-label="Select country code"
              >
                {CountryOptions.map((c) => (
                  <option
                    key={`${c.dial_code}-${c.code}-${c.name}`}
                    value={c.dial_code}
                  >
                    {c.name} ({c.dial_code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Phone Number Input */}
          <div className="relative sm:col-span-3">
            <div className="flex">
              <input
                type="tel"
                placeholder="Phone Number"
                value={phoneNumber}
                disabled={isVerified}
                onChange={(e) =>
                  setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 15))
                }
                className="w-full p-2.5 rounded-l-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                aria-label="Enter your phone number"
              />

              {/* Send OTP Button */}
              {!isVerified && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleSendOtp}
                  disabled={countdown > 0 || isSending}
                  className={`px-4 rounded-r-lg font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
                    countdown > 0 || isSending
                      ? "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "bg-primary text-white hover:opacity-90"
                  }`}
                >
                  {isSending ? (
                    <Loader size={16} className="animate-spin" />
                  ) : countdown > 0 ? (
                    `${countdown}s`
                  ) : (
                    <>
                      <span className="hidden sm:inline">Send OTP</span>
                    </>
                  )}
                </motion.button>
              )}

              {/* Verified Check */}
              {isVerified && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <CheckCircle size={18} className="text-green-500" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* OTP Input */}
      <AnimatePresence>
        {countdown > 0 && !isVerified && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-5"
          >
            <div className="text-center text-sm text-gray-600 dark:text-gray-300 mb-3">
              Enter the 4-digit code sent to your phone
            </div>
            <OtpInput
              value={otp}
              onChange={setOtp}
              onVerify={() => {
                if (otp.length === 4) {
                  onVerify(otp);
                } else {
                  toast.error("Please enter a valid 4-digit OTP");
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
          className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4"
        >
          Didn't receive a code? Check your WhatsApp or tap Send OTP again.
        </motion.p>
      )}
    </div>
  );
};
