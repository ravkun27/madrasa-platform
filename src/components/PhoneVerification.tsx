import { useState, useEffect } from "react";
import { FaComment, FaSpinner, FaWhatsapp } from "react-icons/fa";
import { OtpInput } from "./OtpInput";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

const CountryOptions = [
  { code: "+91", country: "India" },
  { code: "+964", country: "Iraq" },
];

export const PhoneVerification = ({
  phoneNumber,
  setPhoneNumber,
  onVerify,
  onSendOtp,
  isVerified,
  selectedCountry,
  setSelectedCountry,
}: {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  onVerify: (otp: string) => void;
  onSendOtp: (payload: {
    phoneNumber: string;
    method: "whatsapp" | "sms";
    country: string;
  }) => void;
  onCommunicationChange: (method: "telegram" | "whatsapp") => void;
  countdown: number;
  isVerified: boolean;
  selectedCountry: { code: string; country: string };
  setSelectedCountry: (value: { code: string; country: string }) => void;
}) => {
  const [method, setMethod] = useState<"whatsapp" | "sms">("whatsapp");
  const [otp, setOtp] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [isSending, setIsSending] = useState(false);

  // Handle countdown timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpCountdown]);

  const handleSendOtp = () => {
    if (!phoneNumber) {
      toast.error("Please enter a valid phone number");
      return;
    }

    const payload = {
      phoneNumber: phoneNumber,
      method,
      country: selectedCountry.country,
    };
    onSendOtp(payload);
    setOtpCountdown(10); // Start 10-second countdown
    setIsSending(true);
  };

  return (
    <div className="space-y-6">
      {/* Verification Method (WhatsApp or SMS) */}
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
          Choose verification method:
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setMethod("whatsapp")}
            className={`w-full p-3 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${
              method === "whatsapp"
                ? "border-green-500 bg-green-500/10"
                : "border-gray-200 hover:border-green-500"
            }`}
          >
            <FaWhatsapp className="text-green-500 text-xl" />
            <span className="font-medium">WhatsApp</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setMethod("sms")}
            className={`w-full p-3 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${
              method === "sms"
                ? "border-blue-500 bg-blue-500/10"
                : "border-gray-200 hover:border-blue-500"
            }`}
          >
            <FaComment className="text-blue-500 text-xl" />
            <span className="font-medium">SMS</span>
          </motion.button>
        </div>
      </div>

      {/* Phone Number Input */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Country Code Dropdown */}
          <div className="relative">
            <select
              value={selectedCountry.code}
              onChange={(e) => {
                const newCountry = CountryOptions.find(
                  (c) => c.code === e.target.value
                );
                if (newCountry) setSelectedCountry(newCountry);
              }}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              {CountryOptions.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.country} {c.code}
                </option>
              ))}
            </select>
          </div>

          {/* Phone Number Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) =>
                setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 15))
              }
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Send OTP Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleSendOtp}
            disabled={otpCountdown > 0 || isSending}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
              otpCountdown > 0 || isSending
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90 text-white"
            }`}
          >
            {isSending ? (
              <>
                <FaSpinner className="animate-spin" />
                Sending...
              </>
            ) : otpCountdown > 0 ? (
              `Resend in ${otpCountdown}s`
            ) : (
              "Send OTP"
            )}
          </motion.button>
        </div>
      </div>

      {/* OTP Input */}
      {isSending && !isVerified && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
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
    </div>
  );
};
