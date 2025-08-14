"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  DevicePhoneMobileIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface OTPVotingModalProps {
  projectId: string;
  projectTitle: string;
  onClose: () => void;
  onSuccess: (newVoteCount: number) => void;
}

type StepType = "phone" | "otp" | "success";

export default function OTPVotingModal({
  projectId,
  projectTitle,
  onClose,
  onSuccess,
}: OTPVotingModalProps) {
  const [step, setStep] = useState<StepType>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && step === "otp") {
      setCanResend(true);
    }
  }, [countdown, step]);

  // Handle phone number submission
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate phone number
    const phoneRegex = /^(0[789]\d{9}|(\+234|234)[789]\d{9})$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
      setError("Please enter a valid Nigerian phone number");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/vote/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/\s/g, ""),
          projectId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep("otp");
        setCountdown(300); // 5 minutes
        toast.success("Verification code sent to your phone");

        // Show dev code in development
        if (data.devCode) {
          console.log("Dev OTP:", data.devCode);
          toast(`Dev mode - Your code: ${data.devCode}`, {
            duration: 10000,
            icon: "🔧",
          });
        }
      } else {
        setError(data.error || "Failed to send verification code");

        if (response.status === 409) {
          // Already voted
          setTimeout(() => {
            onClose();
          }, 3000);
        }
      }
    } catch (error) {
      setError("Network error. Please try again");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (newOtp.every((digit) => digit) && newOtp.join("").length === 6) {
      handleOtpSubmit(newOtp.join(""));
    }
  };

  // Handle OTP keyboard navigation
  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0 &&
      otpRefs.current[index - 1]
    ) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const digits = pastedData.split("");

    const newOtp = [...otp];
    digits.forEach((digit, index) => {
      if (index < 6 && /\d/.test(digit)) {
        newOtp[index] = digit;
      }
    });

    setOtp(newOtp);

    if (newOtp.every((digit) => digit)) {
      handleOtpSubmit(newOtp.join(""));
    }
  };

  // Handle OTP submission
  const handleOtpSubmit = async (code?: string) => {
    const otpCode = code || otp.join("");

    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/vote/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/\s/g, ""),
          code: otpCode,
          projectId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep("success");
        onSuccess(data.newVoteCount);
        toast.success("Vote recorded successfully!");

        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setError(data.error || "Invalid verification code");

        if (response.status === 409) {
          // Already voted
          setTimeout(() => {
            onClose();
          }, 3000);
        }
      }
    } catch (error) {
      setError("Network error. Please try again");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    setCanResend(false);
    setError("");
    setOtp(["", "", "", "", "", ""]);

    try {
      const response = await fetch("/api/vote/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/\s/g, ""),
          projectId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCountdown(300);
        toast.success("New verification code sent");

        if (data.devCode) {
          console.log("Dev OTP:", data.devCode);
          toast(`Dev mode - Your code: ${data.devCode}`, {
            duration: 10000,
            icon: "🔧",
          });
        }
      } else {
        setError(data.error || "Failed to resend code");
        setCanResend(true);
      }
    } catch (error) {
      setError("Network error. Please try again");
      setCanResend(true);
    }
  };

  // Format countdown
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-conces-blue">
            {step === "success" ? "Vote Successful!" : "Cast Your Vote"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Phone Number */}
          {step === "phone" && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-conces-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DevicePhoneMobileIcon className="w-8 h-8 text-conces-blue" />
                </div>
                <p className="text-gray-600">
                  Enter your phone number to vote for
                </p>
                <p className="font-semibold text-conces-blue">
                  "{projectTitle}"
                </p>
              </div>

              <form onSubmit={handlePhoneSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nigerian Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      +234
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-conces-green"
                      placeholder="803 456 7890"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm flex items-center">
                      <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    loading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-conces-green text-white hover:bg-conces-green/90"
                  }`}
                >
                  {loading ? "Sending Code..." : "Send Verification Code"}
                </button>
              </form>

              <p className="text-xs text-gray-500 text-center mt-4">
                We'll send a 6-digit code to verify your vote. One vote per
                phone number.
              </p>
            </motion.div>
          )}

          {/* Step 2: OTP Verification */}
          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-conces-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LockClosedIcon className="w-8 h-8 text-conces-green" />
                </div>
                <p className="text-gray-600">Enter the 6-digit code sent to</p>
                <p className="font-semibold text-conces-blue">{phoneNumber}</p>
              </div>

              <div className="mb-6">
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpRefs.current[index] = el;
                      }}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-conces-green"
                      autoFocus={index === 0}
                      maxLength={1}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm flex items-center">
                    <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                    {error}
                  </p>
                </div>
              )}

              <button
                onClick={() => handleOtpSubmit()}
                disabled={loading || !otp.every((d) => d)}
                className={`w-full py-3 rounded-lg font-semibold transition-colors mb-4 ${
                  loading || !otp.every((d) => d)
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-conces-green text-white hover:bg-conces-green/90"
                }`}
              >
                {loading ? "Verifying..." : "Verify & Vote"}
              </button>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-gray-500">
                    Code expires in {formatTime(countdown)}
                  </p>
                ) : null}

                {canResend ? (
                  <button
                    onClick={handleResend}
                    className="text-conces-green font-medium hover:underline"
                  >
                    Resend Code
                  </button>
                ) : countdown > 0 ? (
                  <p className="text-sm text-gray-500">
                    Didn't receive? Resend in{" "}
                    {formatTime(120 - (300 - countdown))}
                  </p>
                ) : null}
              </div>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircleIcon className="w-12 h-12 text-green-500" />
              </motion.div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Vote Recorded!
              </h3>
              <p className="text-gray-600 mb-6">
                Thank you for participating in the CONCES Logo Challenge
              </p>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  Your vote for{" "}
                  <span className="font-semibold">"{projectTitle}"</span> has
                  been successfully recorded.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
