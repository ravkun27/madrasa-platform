import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface SuspendedModalProps {
  onClose?: () => void; // optional if you want to allow closing it
}

const SuspendedModal: React.FC<SuspendedModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 overflow-hidden">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Account Suspended
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-200 mb-4">
          Your account has been <strong>suspended</strong> due to violations of
          our platform rules. Please contact our support team for further
          assistance.
        </p>
        <div className="border-t border-gray-300 dark:border-gray-700 pt-4 mt-4">
          <h3 className="text-sm font-semibold mb-2">
            ⚠️ Cautionary Guidelines:
          </h3>
          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <li>
              (Use consistent devices to access your account) pls add It's best
              to use the same device and not change devices frequently.
            </li>
            <li>Do not share your account with others.</li>
            <li>Avoid using VPNs or proxies to mask your location.</li>
            <li>Respect the platform rules and terms of service.</li>
            <li>Do not create multiple accounts for the same user.</li>
          </ul>
        </div>
        <div className="mt-6 text-right">
          <button
            onClick={() => navigate("/contact")}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors text-sm"
          >
            Contact Support
          </button>
          <button
            onClick={onClose}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuspendedModal;
