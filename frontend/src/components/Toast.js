import React, { useEffect } from "react";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa";

const Toast = ({ message, type = "success", onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const styles = {
    success: {
      bg: "bg-green-50 border-green-400",
      icon: <FaCheckCircle className="text-green-600" />,
      text: "text-green-800",
    },
    error: {
      bg: "bg-red-50 border-red-400",
      icon: <FaExclamationCircle className="text-red-600" />,
      text: "text-red-800",
    },
    warning: {
      bg: "bg-yellow-50 border-yellow-400",
      icon: <FaExclamationCircle className="text-yellow-600" />,
      text: "text-yellow-800",
    },
    info: {
      bg: "bg-blue-50 border-blue-400",
      icon: <FaInfoCircle className="text-blue-600" />,
      text: "text-blue-800",
    },
  };

  const style = styles[type] || styles.info;

  return (
    <div
      className={`fixed top-4 right-4 z-50 min-w-[300px] max-w-md border-l-4 ${style.bg} p-4 rounded-lg shadow-lg animate-slide-in-right`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-xl mt-0.5">{style.icon}</div>
        <div className={`flex-1 ${style.text} text-sm font-medium`}>
          {message}
        </div>
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${style.text} hover:opacity-70 transition`}
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default Toast;
