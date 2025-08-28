"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import ImageUpload from "./ImageUpload";
import {
  InformationCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  DocumentIcon,
  SparklesIcon,
  PaintBrushIcon,
  LightBulbIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { useCandidate } from "@/context/authContext";
import Image from "next/image";
import api from "@/lib/axiosInstance";
import Confetti from "react-confetti";
import SubmissionStatusModal from "./SubmissionModal";
import Link from "next/link";

interface ProjectFormData {
  projectTitle: string;
  designConcept: string;
  colorPalette: string;
  inspiration: string;
}

// Enhanced Disclaimer Modal Component
const DisclaimerModal = ({
  isOpen,
  onClose,
  onProceed,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  isSubmitting: boolean;
}) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAgreedToTerms(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Enhanced Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Enhanced Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-100"
          >
            {/* Gradient Header */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl -m-2" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-orange-500 rounded-xl blur-lg opacity-20" />
                    <div className="relative bg-gradient-to-br from-orange-400 to-red-500 p-3 rounded-xl">
                      <ExclamationTriangleIcon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      Submission Terms
                    </h2>
                    <p className="text-gray-500 mt-1">Please review before submitting</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-all duration-200 hover:rotate-90 p-2 rounded-full hover:bg-gray-100"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Enhanced Content */}
            <div className="space-y-8">
              {/* Alert Banner */}
              <div className="relative overflow-hidden bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-500" />
                <h3 className="font-bold text-orange-900 mb-3 text-lg">
                  Important Notice
                </h3>
                <p className="text-orange-800">
                  Please read and understand the following terms before submitting your design.
                </p>
              </div>

              {/* Terms Content */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <DocumentIcon className="w-6 h-6 mr-3 text-blue-500" />
                  Design Ownership & Usage Rights
                </h3>

                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 text-lg leading-relaxed">
                    By submitting your design to the CONCES Logo Design Contest,
                    you acknowledge and agree to the following terms:
                  </p>

                  <div className="grid gap-6 mt-6">
                    {[
                      {
                        title: "Transfer of Ownership",
                        content: "All submitted designs become the exclusive property of CONCES (Conference Of Nigerian Christian Engineering Students) upon submission, regardless of whether your design is selected as the winner.",
                      },
                      {
                        title: "Usage Rights",
                        content: "CONCES reserves the right to use, modify, reproduce, and distribute any submitted design for official branding, marketing materials, publications, and promotional activities.",
                      },
                      {
                        title: "Originality",
                        content: "You confirm that your submission is original work created by you and does not infringe upon any third-party intellectual property rights.",
                      },
                      {
                        title: "No Compensation Claims",
                        content: "You waive any future claims to compensation beyond the contest prizes for the use of your submitted design(s).",
                      }
                    ].map((item, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{item.content}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 rounded-xl">
                    <div className="flex items-start">
                      <InformationCircleIcon className="w-6 h-6 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-2">Contest Participation</h4>
                        <p className="text-blue-800">
                          By participating in this contest, you agree to be bound by all contest rules and these submission terms.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Agreement Checkbox */}
              <div className="border-t border-gray-200 pt-8">
                <motion.label 
                  className="flex items-start space-x-4 cursor-pointer group p-4 rounded-xl hover:bg-gray-50 transition-colors"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="relative flex items-center mt-1">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="h-5 w-5 text-blue-600 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                    {agreedToTerms && (
                      <CheckCircleIcon className="absolute -right-1 -top-1 w-3 h-3 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="text-gray-900 font-semibold group-hover:text-blue-600 transition-colors text-lg">
                      I agree to the submission terms and disclaimer
                    </span>
                    <p className="text-gray-600 mt-2 leading-relaxed">
                      I understand that my design will become the property of CONCES and can be used as necessary for official purposes.
                    </p>
                  </div>
                </motion.label>
              </div>
            </div>

            {/* Enhanced Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-10 pt-8 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 h-12 border-2 hover:border-gray-400 transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={onProceed}
                disabled={!agreedToTerms || isSubmitting}
                className="flex-1 h-12 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Proceed with Submission
                  </span>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default function SubmitProjectForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [primaryFileUrl, setPrimaryFileUrl] = useState<string>("");
  const [mockupUrl, setMockupUrl] = useState<string>("");
  const [uploadError, setUploadError] = useState<string>("");
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingProject, setExistingProject] = useState<any>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<ProjectFormData | null>(null);
  const { candidate } = useCandidate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectFormData>();

  // Check existing submission
  useEffect(() => {
    const checkExistingSubmission = async () => {
      if (!candidate?._id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get(
          `/projects?candidate=${candidate._id}&checkSubmission=true`
        );
        const result = response.data;

        if (result.hasSubmitted && result.project) {
          setExistingProject(result.project);
          setShowStatusModal(true);
        }
      } catch (error) {
        console.error("Error checking existing submission:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingSubmission();
  }, [candidate?._id]);

  const handlePrimaryFileUpload = (url:string) => {
    setPrimaryFileUrl(url);
    setUploadError("");
    toast.success("Primary logo uploaded successfully!", {
      icon: "🎨",
      style: {
        borderRadius: "12px",
        background: "#10B981",
        color: "#fff",
      },
    });
  };

  const handleMockupUpload = (url:string) => {
    setMockupUrl(url);
    toast.success("Mockup uploaded successfully!", {
      icon: "📸",
      style: {
        borderRadius: "12px",
        background: "#10B981",
        color: "#fff",
      },
    });
  };

  const removePrimaryFile = () => {
    setPrimaryFileUrl("");
    toast("Primary logo removed", { icon: "🗑️" });
  };

  const removeMockup = () => {
    setMockupUrl("");
    toast("Mockup removed", { icon: "🗑️" });
  };

  const onSubmit = async (data: ProjectFormData) => {
    if (!primaryFileUrl) {
      setUploadError("Please upload a primary logo file");
      toast.error("Please upload a primary logo file");
      return;
    }

    setPendingFormData(data);
    setShowDisclaimerModal(true);
  };

  const proceedWithSubmission = async () => {
    if (!pendingFormData) return;

    setIsSubmitting(true);
    toast.loading("Submitting your design...", {
      style: {
        borderRadius: "12px",
        background: "#3B82F6",
        color: "#fff",
      },
    });

    try {
      const response = await api.post("/projects", {
        candidate: candidate?._id || candidate?._id,
        ...pendingFormData,
        primaryFileUrl,
        mockupUrl,
      });

      const result = response.data;

      toast.dismiss();
      toast.success("Design submitted successfully!", {
        icon: "🎉",
        duration: 4000,
        style: {
          borderRadius: "12px",
          background: "#10B981",
          color: "#fff",
        },
      });

      setSubmissionComplete(true);
      setShowDisclaimerModal(false);
      setPendingFormData(null);
      reset();
      setPrimaryFileUrl("");
      setMockupUrl("");
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.dismiss();

      if (error.response?.status === 409) {
        const errorData = error.response.data;
        if (errorData.existingProject) {
          setExistingProject(errorData.existingProject);
          setShowStatusModal(true);
        }
        toast.error("You have already submitted a project for this contest");
        setShowDisclaimerModal(false);
      } else {
        toast.error(
          error.response?.data?.error ||
            "Failed to submit project. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeDisclaimerModal = () => {
    setShowDisclaimerModal(false);
    setPendingFormData(null);
  };

  const saveDraft = async () => {
    const formData = {
      projectTitle: (
        document.querySelector('[name="projectTitle"]') as HTMLInputElement
      )?.value,
      designConcept: (
        document.querySelector('[name="designConcept"]') as HTMLTextAreaElement
      )?.value,
      colorPalette: (
        document.querySelector('[name="colorPalette"]') as HTMLTextAreaElement
      )?.value,
      inspiration: (
        document.querySelector('[name="inspiration"]') as HTMLTextAreaElement
      )?.value,
    };

    try {
      toast.loading("Saving draft...");
      const response = await api.post("/projects", {
        candidate: candidate?._id || candidate?._id,
        ...formData,
        primaryFileUrl: primaryFileUrl || "",
        mockupUrl,
        status: "draft",
      });

      toast.dismiss();
      toast.success("Draft saved successfully!", {
        icon: "💾",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Draft save error:", error);
      toast.dismiss();

      if (error.response?.status === 409) {
        toast.error("You have already submitted a project for this contest");
      } else {
        toast.error("Failed to save draft. Please try again.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 w-full max-w-md"
        >
          <div className="relative mb-4 sm:mb-6">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-20 animate-pulse" />
            <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-3 sm:p-4 rounded-full inline-block">
              <ArrowPathIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white animate-spin" />
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Checking Status</h3>
          <p className="text-sm sm:text-base text-gray-600">Verifying your submission status...</p>
        </motion.div>
      </div>
    );
  }

  if (showStatusModal && existingProject) {
    return (
      <>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: "16px",
              background: "#1F2937",
              color: "#fff",
              border: "1px solid #374151",
              fontSize: "14px",
            },
          }}
        />
        <SubmissionStatusModal
          project={existingProject}
          onClose={() => {
            router.push("/");
          }}
        />
      </>
    );
  }

  if (submissionComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-teal-50 p-3 sm:p-4">
        <Confetti
          width={typeof window !== "undefined" ? window.innerWidth : 0}
          height={typeof window !== "undefined" ? window.innerHeight : 0}
          recycle={false}
          numberOfPieces={500}
          colors={['#10B981', '#06B6D4', '#8B5CF6', '#F59E0B', '#EF4444']}
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 max-w-2xl w-full text-center border border-gray-100"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", damping: 15 }}
            className="mb-6 sm:mb-8 flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-30 animate-pulse" />
              <div className="relative bg-gradient-to-br from-green-400 to-emerald-500 p-4 sm:p-6 rounded-full">
                <CheckCircleIcon className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 text-white" />
              </div>
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight"
          >
            Submission Complete! 🎉
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed px-2"
          >
            Thank you for your creative contribution to the CONCES rebranding challenge. 
            Our judges will carefully review all submissions and announce the winners soon.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-blue-200"
          >
            <div className="flex items-center justify-center space-x-3">
              <div className="relative">
                <ArrowPathIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 animate-spin" />
              </div>
              <span className="text-blue-700 font-semibold text-base sm:text-lg">
                Status: Under Review
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            <Button
              onClick={() => router.push("/")}
              className="flex-1 h-12 sm:h-14 text-base sm:text-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Return to Dashboard
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-3 sm:p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 max-w-md w-full text-center border border-gray-100"
        >
          <div className="mb-6 sm:mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-20" />
              <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-3 sm:p-4 rounded-full inline-block">
                <ExclamationTriangleIcon className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            Verification Required
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed">
            Please enter the six-digit code sent to your email to access the submission form.
          </p>
          <Button 
            onClick={() => router.push("/auth")}
            className="w-full h-12 sm:h-14 text-base sm:text-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            Verify Code
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: "16px",
            background: "#1F2937",
            color: "#fff",
            border: "1px solid #374151",
          },
        }}
      />

      <DisclaimerModal
        isOpen={showDisclaimerModal}
        onClose={closeDisclaimerModal}
        onProceed={proceedWithSubmission}
        isSubmitting={isSubmitting}
      />

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-5xl mx-auto"
        >
          {/* Main Form Container */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl overflow-hidden border border-gray-100">
            {/* Header Section */}
            <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                    Submit Your Design ✨
                  </h1>
                  <p className="text-base sm:text-lg lg:text-xl text-indigo-100 mb-4 sm:mb-6 leading-relaxed">
                    Share your vision for the new CONCES logo
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20"
                >
                  <div className="flex items-start">
                    <div className="mr-3 sm:mr-4 mt-1 flex-shrink-0">
                      <div className="bg-white/20 rounded-full p-2">
                        <InformationCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Submission Guidelines</h3>
                      <p className="text-indigo-100 leading-relaxed text-sm sm:text-base">
                        Upload your logo design in high resolution (AI, SVG, PNG, or PDF format). 
                        You can also add a mockup to showcase your design in action.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8 xl:p-12">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8 lg:space-y-10">
                {/* Project Details Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-6 sm:space-y-8"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6">
                    <div className="flex items-center mb-3 sm:mb-0 sm:mr-4">
                      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl sm:rounded-2xl p-2 sm:p-3 mr-3">
                        <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Project Details</h2>
                      </div>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 sm:ml-0">Tell us about your creative vision</p>
                  </div>

                  <div className="space-y-6 sm:space-y-8">
                    <div className="group">
                      <Input
                        label="Project Title"
                        {...register("projectTitle", {
                          required: "Project title is required",
                        })}
                        error={errors.projectTitle?.message}
                        placeholder="e.g., 'Unity in Innovation' - CONCES Rebrand"
                        className="h-12 sm:h-14 text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all duration-200"
                      />
                    </div>

                    {[
                      {
                        name: "designConcept",
                        label: "Design Concept",
                        placeholder: "Explain your design concept and what it represents...",
                        icon: PaintBrushIcon,
                        rows: 4,
                      },
                      {
                        name: "colorPalette",
                        label: "Color Palette Explanation",
                        placeholder: "Explain your color choices and their significance...",
                        icon: EyeIcon,
                        rows: 3,
                      },
                      {
                        name: "inspiration",
                        label: "Inspiration & Story",
                        placeholder: "What inspired your design? Tell us the story behind it...",
                        icon: LightBulbIcon,
                        rows: 4,
                      },
                    ].map((field, index) => (
                      <motion.div
                        key={field.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="group"
                      >
                        <label className="flex items-center text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                          <field.icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-indigo-600 flex-shrink-0" />
                          <span>{field.label} *</span>
                        </label>
                        <div className="relative">
                          <textarea
                            {...register(field.name as keyof ProjectFormData, {
                              required: `${field.label} is required`,
                            })}
                            rows={field.rows}
                            className={`w-full px-3 sm:px-4 py-3 sm:py-4 border-2 rounded-xl text-base sm:text-lg placeholder-gray-400 
                              focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 
                              transition-all duration-200 resize-none leading-relaxed
                              ${errors[field.name as keyof ProjectFormData] 
                                ? "border-red-300 bg-red-50" 
                                : "border-gray-200 hover:border-gray-300"
                              }`}
                            placeholder={field.placeholder}
                          />
                          {errors[field.name as keyof ProjectFormData] && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-sm mt-2 sm:mt-3 flex items-center"
                            >
                              <ExclamationTriangleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                              <span>{errors[field.name as keyof ProjectFormData]?.message}</span>
                            </motion.p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* File Uploads Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-6 sm:space-y-8"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center mb-6 sm:mb-8">
                    <div className="flex items-center mb-3 sm:mb-0 sm:mr-4">
                      <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-xl sm:rounded-2xl p-2 sm:p-3 mr-3">
                        <CloudArrowUpIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">File Uploads</h2>
                      </div>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 sm:ml-0">Share your design files with us</p>
                  </div>

                  <div className="space-y-6 sm:space-y-8">
                    {/* Primary Logo Upload */}
                    <div className="group">
                      <label className="flex flex-col sm:flex-row sm:items-center text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                        <div className="flex items-center mb-2 sm:mb-0">
                          <DocumentIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-green-600 flex-shrink-0" />
                          <span>Primary Logo File *</span>
                        </div>
                        <span className="text-sm font-normal text-gray-500 sm:ml-2">(AI, SVG, PNG, or PDF)</span>
                      </label>

                      {!primaryFileUrl ? (
                        <div className="relative">
                          <div className="border-2 border-dashed border-gray-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 hover:border-green-400 hover:bg-green-50/50 transition-all duration-300 group-hover:scale-[1.01]">
                            <div className="text-center">
                              <div className="mb-4 sm:mb-6">
                                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-100 to-teal-100 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                  <CloudArrowUpIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                                </div>
                              </div>
                              <ImageUpload
                                onSuccess={(info)=>handlePrimaryFileUpload(info.secure_url)}
                                folder="conces-logos/"
                                className="w-full justify-center bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-3 sm:py-4 px-4 sm:px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 text-sm sm:text-base"
                              >
                                <span className="flex items-center justify-center">
                                  <CloudArrowUpIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                  Upload Primary Logo
                                </span>
                              </ImageUpload>
                              <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
                                Drag and drop or click to upload • Max 10MB
                              </p>
                            </div>
                          </div>
                          {uploadError && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-3 sm:mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl"
                            >
                              <p className="text-red-600 text-sm flex items-center">
                                <ExclamationTriangleIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span>{uploadError}</span>
                              </p>
                            </motion.div>
                          )}
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200 rounded-xl sm:rounded-2xl p-4 sm:p-6"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-0">
                              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden bg-white shadow-md flex-shrink-0">
                                <Image
                                  src={primaryFileUrl}
                                  alt="Primary logo"
                                  fill
                                  className="object-contain p-2"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-green-800 text-sm sm:text-base">Primary Logo Uploaded</p>
                                <p className="text-sm text-green-600">Ready for submission</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={removePrimaryFile}
                              className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-all duration-200 self-end sm:self-center"
                            >
                              <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Mockup Upload */}
                    <div className="group">
                      <label className="flex flex-col sm:flex-row sm:items-center text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                        <div className="flex items-center mb-2 sm:mb-0">
                          <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                          <span>Mockup</span>
                        </div>
                        <span className="text-sm font-normal text-gray-500 sm:ml-2">(Optional - Show your logo in action)</span>
                      </label>

                      {!mockupUrl ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 group-hover:scale-[1.01]">
                          <div className="text-center">
                            <div className="mb-4 sm:mb-6">
                              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                <EyeIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                              </div>
                            </div>
                            <ImageUpload
                              onSuccess={(info)=>handleMockupUpload(info.secure_url)}
                              folder="conces-mockups/"
                              className="w-full justify-center bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 sm:py-4 px-4 sm:px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 text-sm sm:text-base"
                            >
                              <span className="flex items-center justify-center">
                                <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                Upload Mockup
                              </span>
                            </ImageUpload>
                            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
                              Show your logo in real-world contexts • Optional
                            </p>
                          </div>
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl sm:rounded-2xl p-4 sm:p-6"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-0">
                              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden bg-white shadow-md flex-shrink-0">
                                <Image
                                  src={mockupUrl}
                                  alt="Mockup"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-blue-800 text-sm sm:text-base">Mockup Uploaded</p>
                                <p className="text-sm text-blue-600">Great addition to your submission!</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={removeMockup}
                              className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-all duration-200 self-end sm:self-center"
                            >
                              <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Submit Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-col gap-3 sm:flex-row sm:gap-4 pt-6 sm:pt-8 border-t-2 border-gray-100"
                >
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:flex-1 h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 disabled:transform-none disabled:shadow-lg order-1"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <ArrowPathIcon className="h-4 h-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <CheckCircleIcon className="h-4 h-4 sm:h-5 sm:w-5 mr-2" />
                        Submit Final Design
                      </span>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={saveDraft}
                    className="w-full sm:flex-1 h-12 sm:h-14 text-base sm:text-lg font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 order-2 sm:order-2"
                  >
                    <span className="flex items-center justify-center">
                      <DocumentIcon className="h-4 h-4 sm:h-5 sm:w-5 mr-2" />
                      Save as Draft
                    </span>
                  </Button>
                </motion.div>
              </form>
            </div>
          </div>

          {/* Guidelines Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-12 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
          >
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <InformationCircleIcon className="w-7 h-7 mr-3 text-blue-600" />
                Submission Guidelines
              </h2>
              <p className="text-gray-600 mt-2">Make sure your submission meets our requirements</p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* File Requirements */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-500 rounded-xl p-2 mr-3">
                      <DocumentIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-blue-900">File Requirements</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      "Vector format (AI or SVG) preferred",
                      "High resolution PNG (min 2000px width)",
                      "Maximum file size: 10MB per file",
                      "Clear, scalable design that works at any size"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start text-blue-800">
                        <CheckCircleIcon className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Design Standards */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <div className="flex items-center mb-4">
                    <div className="bg-purple-500 rounded-xl p-2 mr-3">
                      <PaintBrushIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-purple-900">Design Standards</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      "Original work only - no plagiarism",
                      "Works on light and dark backgrounds",
                      "Represents Nigerian engineering excellence",
                      "Professional and timeless design approach"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start text-purple-800">
                        <SparklesIcon className="w-5 h-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Additional Tips */}
              <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                <div className="flex items-start">
                  <div className="bg-yellow-500 rounded-xl p-2 mr-4 mt-1">
                    <LightBulbIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-yellow-900 mb-3">Pro Tips for Success</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-yellow-800 mb-2">Design Approach</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• Keep it simple and memorable</li>
                          <li>• Consider cultural significance</li>
                          <li>• Test at different sizes</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-yellow-800 mb-2">Submission Tips</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• Write compelling descriptions</li>
                          <li>• Explain your color choices</li>
                          <li>• Show practical applications</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}