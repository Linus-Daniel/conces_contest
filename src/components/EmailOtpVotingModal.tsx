"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Smartphone,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

interface EmailOTPVotingModalProps {
  projectId: string;
  projectTitle: string;
  candidateName?: string;
  onClose: () => void;
  onSuccess: (newVoteCount: number) => void;
}

interface OTPResponse {
  success: boolean;
  message: string;
  sessionId?: string;
  expiresIn?: number;
  error?: string;
  email?: string;
  projectTitle?: string;
  devCode?: string;
  hasExistingOTP?: boolean;
  resendAvailable?: boolean;
}

interface VoteResponse {
  success: boolean;
  message: string;
  newVoteCount?: number;
  voteId?: string;
  projectTitle?: string;
  error?: string;
  remainingAttempts?: number;
}

export default function EmailOTPVotingModal({
  projectId,
  projectTitle,
  candidateName,
  onClose,
  onSuccess,
}: EmailOTPVotingModalProps) {
  const [step, setStep] = useState<
    "details" | "otp" | "success" | "existing-otp"
  >("details");
  const [voterEmail, setVoterEmail] = useState("");
  const [voterPhone, setVoterPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [sessionData, setSessionData] = useState<OTPResponse | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hasExistingOTP, setHasExistingOTP] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timeRemaining && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev && prev <= 1) {
            setStep("details");
            setSessionData(null);
            toast.error("Verification code expired. Please try again.");
            return null;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeRemaining]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateNigerianPhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, "");
    
    if (cleanPhone.length === 13 && cleanPhone.startsWith("234")) {
      return true;
    }
    if (cleanPhone.length === 11 && cleanPhone.startsWith("0")) {
      return true;
    }
    if (cleanPhone.length === 10 && !cleanPhone.startsWith("0")) {
      return true;
    }
    
    return false;
  };

  const checkExistingOTP = async (email: string, phone: string) => {
    setCheckingExisting(true);

    try {
      const response = await fetch("/api/vote/check-otp-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          phoneNumber: phone.trim(),
        }),
      });

      const data = await response.json();

      if (data.hasActiveOTP) {
        setHasExistingOTP(true);
        setSessionData({
          success: true,
          message: "Active OTP found",
          sessionId: data.sessionId,
          expiresIn: data.expiresIn,
          email: data.email,
        });
        setTimeRemaining(data.expiresIn);
        setStep("existing-otp");
        toast.success("We found an active verification code for this email");
      } else {
        await handleRequestOTP(email, phone);
      }
    } catch (error) {
      toast.error("Error checking for existing code");
      await handleRequestOTP(email, phone);
    } finally {
      setCheckingExisting(false);
    }
  };

  const handleRequestOTP = async (email?: string, phone?: string) => {
    const emailToUse = email || voterEmail;
    const phoneToUse = phone || voterPhone;

    // Validate inputs
    if (!emailToUse.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    if (!phoneToUse.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    if (!validateEmail(emailToUse)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!validateNigerianPhone(phoneToUse)) {
      toast.error("Please enter a valid Nigerian phone number");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/vote/request-otp-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          voterEmail: emailToUse.trim(),
          voterPhone: phoneToUse.trim(),
        }),
      });

      const data: OTPResponse = await response.json();

      if (data.success) {
        setSessionData(data);
        setStep("otp");
        setTimeRemaining(data.expiresIn || 300);

        // Auto-fill OTP in development mode
        if (data.devCode) {
          setOtpCode(data.devCode);
          toast.success(`Development mode: Code is ${data.devCode}`);
        }
      } else {
        if (data.error === "unused otp exists") {
          setHasExistingOTP(true);
          setSessionData(data);
          setTimeRemaining(data.expiresIn || null);
          setStep("existing-otp");
          toast.success("Verification code already sent to your email");
        } else {
          toast.error(data.message || "Failed to send verification code");
        }
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndVote = async () => {
    if (!otpCode.trim() || otpCode.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    if (!sessionData?.sessionId) {
      toast.error("Session expired. Please start again.");
      setStep("details");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionData.sessionId,
          otpCode: otpCode.trim(),
        }),
      });

      const data: VoteResponse = await response.json();

      if (data.success) {
        setStep("success");
        toast.success("Vote confirmed successfully!");

        if (data.newVoteCount !== undefined) {
          onSuccess(data.newVoteCount);
        }

        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        if (data.remainingAttempts !== undefined) {
          setAttempts(3 - data.remainingAttempts);
          toast.error(
            `Invalid code. ${data.remainingAttempts} attempts remaining.`
          );
          setOtpCode("");
        } else {
          toast.error(data.message || "Verification failed");
          if (
            data.error?.includes("expired") ||
            data.error?.includes("attempts")
          ) {
            setStep("details");
            setSessionData(null);
            setOtpCode("");
            setAttempts(0);
          }
        }
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setStep("details");
    setSessionData(null);
    setOtpCode("");
    setTimeRemaining(null);
    setAttempts(0);
    setHasExistingOTP(false);
  };

  const handleUseExistingOTP = () => {
    setStep("otp");
    toast.success("Please enter the verification code we sent to your email");
  };

  const handleRequestNewOTP = async () => {
    if (!voterEmail.trim() || !voterPhone.trim()) {
      toast.error("Email and phone number are required");
      return;
    }

    setLoading(true);
    await handleRequestOTP(voterEmail, voterPhone);
  };

  return (
    <AnimatePresence>
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
          className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-conces-blue">
                {step === "success"
                  ? "Vote Confirmed!"
                  : step === "existing-otp"
                  ? "Code Already Sent"
                  : "Cast Your Vote"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {step === "details" && "Enter your details to get verification code"}
                {step === "existing-otp" && "We already sent you a code"}
                {step === "otp" && "Enter the verification code"}
                {step === "success" && "Your vote has been recorded"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Project Info */}
          <div className="mb-6 p-4 bg-conces-blue/5 rounded-lg">
            <p className="font-medium text-conces-blue">{projectTitle}</p>
            {candidateName && (
              <p className="text-sm text-gray-600">by {candidateName}</p>
            )}
          </div>

          {/* Step Content */}
          {step === "details" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={voterEmail}
                  onChange={(e) => setVoterEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-conces-green focus:border-conces-green transition-colors"
                  disabled={loading || checkingExisting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={voterPhone}
                  onChange={(e) => setVoterPhone(e.target.value)}
                  placeholder="+234 801 234 5678"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-conces-green focus:border-conces-green transition-colors"
                  disabled={loading || checkingExisting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be a Nigerian phone number
                </p>
              </div>

              <div className="bg-conces-blue/5 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-conces-blue mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-1">Secure Voting Process:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• We'll send a verification code to your email</li>
                      <li>• One vote per email/phone combination</li>
                      <li>• Your information is encrypted and secure</li>
                      <li>• Each person can only vote once</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={() => checkExistingOTP(voterEmail, voterPhone)}
                disabled={loading || checkingExisting || !voterEmail.trim() || !voterPhone.trim()}
                className="w-full bg-conces-green text-white py-3 px-6 rounded-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-conces-green/90 transition-colors flex items-center justify-center"
              >
                {checkingExisting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Checking...
                  </>
                ) : loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending Code...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5 mr-2" />
                    Get Verification Code
                  </>
                )}
              </button>
            </div>
          )}

          {step === "existing-otp" && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Code Already Sent!</p>
                    <p className="text-xs">
                      We've already sent a verification code to{" "}
                      {sessionData?.email}. You can use that code or
                      request a new one.
                    </p>
                  </div>
                </div>
              </div>

              {timeRemaining && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 flex items-center justify-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Code expires in: {formatTime(timeRemaining)}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleUseExistingOTP}
                  className="w-full bg-conces-green text-white py-3 px-6 rounded-lg font-semibold hover:bg-conces-green/90 transition-colors flex items-center justify-center"
                >
                  <ChevronRight className="w-5 h-5 mr-2" />I Have The Code
                </button>

                <button
                  onClick={handleRequestNewOTP}
                  disabled={loading}
                  className="w-full border border-conces-green text-conces-green py-3 px-6 rounded-lg font-semibold hover:bg-conces-green/5 transition-colors flex items-center justify-center"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {loading ? "Sending New Code..." : "Send New Code"}
                </button>

                <button
                  onClick={handleRetry}
                  className="w-full text-gray-600 py-2 px-6 rounded-lg font-medium hover:text-gray-800 transition-colors"
                >
                  Use Different Email/Phone
                </button>
              </div>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) =>
                    setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-conces-green focus:border-conces-green transition-colors text-center text-2xl font-mono tracking-widest"
                  disabled={loading}
                  maxLength={6}
                />
                {timeRemaining && (
                  <p className="text-sm text-gray-600 mt-1 flex items-center justify-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Expires in: {formatTime(timeRemaining)}
                  </p>
                )}
                {attempts > 0 && (
                  <p className="text-sm text-red-600 mt-1 text-center">
                    {3 - attempts} attempts remaining
                  </p>
                )}
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">Check your email</p>
                    <p className="text-xs">
                      Enter the 6-digit code we sent to{" "}
                      {sessionData?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleRetry}
                  className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Back
                </button>
                <button
                  onClick={handleVerifyAndVote}
                  disabled={loading || otpCode.length !== 6}
                  className="flex-1 bg-conces-green text-white py-3 px-6 rounded-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-conces-green/90 transition-colors"
                >
                  {loading ? "Confirming..." : "Confirm Vote"}
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Vote Confirmed!
                </h3>
                <p className="text-gray-600">
                  Your vote for "{projectTitle}" has been successfully recorded.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-800">
                  Thank you for participating in the CONCES design voting!
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}