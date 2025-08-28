"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import ImageUpload from "./ImageUpload"; // ✅ Import the modal
import {
  InformationCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
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

// ✅ New Disclaimer Modal Component
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

  // Reset agreement when modal opens
  useEffect(() => {
    if (isOpen) {
      setAgreedToTerms(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 p-2 rounded-full">
                  <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Submission Terms & Disclaimer
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-900 mb-2">
                  Important Notice
                </h3>
                <p className="text-orange-800 text-sm">
                  Please read and understand the following terms before
                  submitting your design.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Design Ownership & Usage Rights
                </h3>

                <div className="prose prose-sm max-w-none text-gray-700">
                  <p>
                    By submitting your design to the CONCES Logo Design Contest,
                    you acknowledge and agree to the following terms:
                  </p>

                  <ul className="space-y-2 mt-4">
                    <li>
                      <strong>Transfer of Ownership:</strong> All submitted
                      designs become the exclusive property of CONCES (Conference Of Nigerian Christian Enginneering Students) upon
                      submission, regardless of whether your design is selected
                      as the winner.
                    </li>
                    <li>
                      <strong>Usage Rights:</strong> CONCES reserves the right
                      to use, modify, reproduce, and distribute any submitted
                      design for any purpose deemed necessary, including but not
                      limited to:
                      <ul className="ml-4 mt-2 space-y-1">
                        <li>• Official branding and marketing materials</li>
                        <li>• Digital and print publications</li>
                        <li>• Promotional activities and campaigns</li>
                        <li>• Educational and training materials</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Originality:</strong> You confirm that your
                      submission is original work created by you and does not
                      infringe upon any third-party intellectual property
                      rights.
                    </li>
                    <li>
                      <strong>No Compensation Claims:</strong> You waive any
                      future claims to compensation beyond the contest prizes
                      for the use of your submitted design(s).
                    </li>
                    <li>
                      <strong>Attribution:</strong> While CONCES may choose to
                      credit you as the designer, there is no obligation to do
                      so in all uses of the design.
                    </li>
                  </ul>

                  <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                    <p className="text-blue-800 font-medium">
                      Contest Participation: By participating in this contest,
                      you agree to be bound by all contest rules and these
                      submission terms.
                    </p>
                  </div>
                </div>
              </div>

              {/* Agreement Checkbox */}
              <div className="border-t pt-6">
                <label className="flex items-start space-x-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="h-5 w-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <span className="text-gray-900 font-medium group-hover:text-blue-600 transition-colors">
                      I agree to the submission terms and disclaimer
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      I understand that my design will become the property of
                      CONCES and can be used as necessary for official purposes.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={onProceed}
                disabled={!agreedToTerms || isSubmitting}
                className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  "Proceed with Submission"
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
  const [isLoading, setIsLoading] = useState(true); // ✅ Loading state
  const [existingProject, setExistingProject] = useState<any>(null); // ✅ Store existing project
  const [showStatusModal, setShowStatusModal] = useState(false); // ✅ Modal state
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false); // ✅ New disclaimer modal state
  const [pendingFormData, setPendingFormData] =
    useState<ProjectFormData | null>(null); // ✅ Store form data while showing disclaimer
  const { candidate } = useCandidate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectFormData>();

  // ✅ Check if user has already submitted a project
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
        // If there's an error, we'll allow the user to proceed
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingSubmission();
  }, [candidate?._id]);

  const handlePrimaryFileUpload = (result: any) => {
    setPrimaryFileUrl(result.secure_url);
    setUploadError("");
    toast.success("Primary logo uploaded successfully!");
  };

  const handleMockupUpload = (result: any) => {
    setMockupUrl(result.secure_url);
    toast.success("Mockup uploaded successfully!");
  };

  const removePrimaryFile = () => {
    setPrimaryFileUrl("");
    toast("Primary logo removed", { icon: "🗑️" });
  };

  const removeMockup = () => {
    setMockupUrl("");
    toast("Mockup removed", { icon: "🗑️" });
  };

  // ✅ Modified to show disclaimer modal first
  const onSubmit = async (data: ProjectFormData) => {
    if (!primaryFileUrl) {
      setUploadError("Please upload a primary logo file");
      toast.error("Please upload a primary logo file");
      return;
    }

    // Store form data and show disclaimer modal
    setPendingFormData(data);
    setShowDisclaimerModal(true);
  };

  // ✅ Actual submission after disclaimer acceptance
  const proceedWithSubmission = async () => {
    if (!pendingFormData) return;

    setIsSubmitting(true);
    toast.loading("Submitting your design...");

    try {
      const response = await api.post("/projects", {
        candidate: candidate?._id || candidate?._id,
        ...pendingFormData,
        primaryFileUrl,
        mockupUrl,
      });

      const result = response.data;

      toast.dismiss();
      toast.success(<b>Design submitted successfully!</b>, {
        duration: 4000,
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

      // ✅ Handle duplicate submission error
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

  // ✅ Close disclaimer modal
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
        status: "draft", // ✅ Explicitly set status to draft
      });

      const result = response.data;

      toast.dismiss();
      toast.success(<b>Draft saved successfully!</b>, {
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Draft save error:", error);
      toast.dismiss();

      // ✅ Handle duplicate submission error for drafts too
      if (error.response?.status === 409) {
        toast.error("You have already submitted a project for this contest");
      } else {
        toast.error("Failed to save draft. Please try again.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <ArrowPathIcon className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking your submission status...</p>
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
              borderRadius: "12px",
              background: "#333",
              color: "#fff",
            },
          }}
        />
        <SubmissionStatusModal
          project={existingProject}
          onClose={() => {
            router.push("/"); // Redirect to dashboard or appropriate page
            // setShowStatusModal(false);
          }}
        />
      </>
    );
  }

  if (submissionComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <Confetti
          width={typeof window !== "undefined" ? window.innerWidth : 0}
          height={typeof window !== "undefined" ? window.innerHeight : 0}
          recycle={false}
          numberOfPieces={500}
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center"
        >
          <div className="mb-6 flex justify-center">
            <div className="bg-green-100 p-4 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Your Design is Submitted!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Thank you for your creative contribution to the CONCES rebranding
            challenge. Our judges will carefully review all submissions and
            announce the winners soon.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2">
              <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />
              <span className="text-blue-600 font-medium">
                Status: Under Review
              </span>
            </div>
          </div>
          {/* <div className="space-y-4">
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div> */}
        </motion.div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-conces-blue mb-4">
          Verify Your Token
        </h1>
        <p className="text-gray-600 mb-6">
          Please Enter the six digit code sent to your email to access the
          submission form.
        </p>
        <Button onClick={()=>router.push("/auth")}>Verify Code</Button>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: "12px",
            background: "#333",
            color: "#fff",
          },
        }}
      />

      {/* ✅ Disclaimer Modal */}
      <DisclaimerModal
        isOpen={showDisclaimerModal}
        onClose={closeDisclaimerModal}
        onProceed={proceedWithSubmission}
        isSubmitting={isSubmitting}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-conces-blue mb-2">
              Submit Your Design
            </h1>
            <p className="text-gray-600">
              Show us your vision for the new CONCES logo
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 bg-conces-green/10 rounded-lg p-4"
            >
              <div className="flex items-center">
                <InformationCircleIcon className="w-5 h-5 text-conces-green mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  Upload your logo design in high resolution (AI, SVG, PNG, or
                  PDF format). You can also add a mockup to showcase your design
                  in action.
                </span>
              </div>
            </motion.div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Project Details */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-conces-blue">
                Project Details
              </h2>

              <Input
                label="Project Title"
                {...register("projectTitle", {
                  required: "Project title is required",
                })}
                error={errors.projectTitle?.message}
                placeholder="e.g., 'Unity in Innovation' - CONCES Rebrand"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Design Concept *
                </label>
                <textarea
                  {...register("designConcept", {
                    required: "Design concept is required",
                  })}
                  rows={4}
                  className={`form-input w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-conces-blue focus:border-transparent ${
                    errors.designConcept ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Explain your design concept and what it represents..."
                />
                {errors.designConcept && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.designConcept.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Palette Explanation *
                </label>
                <textarea
                  {...register("colorPalette", {
                    required: "Color palette explanation is required",
                  })}
                  rows={3}
                  className={`form-input w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-conces-blue focus:border-transparent ${
                    errors.colorPalette ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Explain your color choices and their significance..."
                />
                {errors.colorPalette && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.colorPalette.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inspiration & Story *
                </label>
                <textarea
                  {...register("inspiration", {
                    required: "Inspiration is required",
                  })}
                  rows={4}
                  className={`form-input w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-conces-blue focus:border-transparent ${
                    errors.inspiration ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="What inspired your design? Tell us the story behind it..."
                />
                {errors.inspiration && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.inspiration.message}
                  </p>
                )}
              </div>
            </div>

            {/* File Uploads */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-conces-blue">
                File Uploads
              </h2>

              {/* Primary Logo File */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Logo File * (AI, SVG, PNG, or PDF)
                </label>

                {!primaryFileUrl ? (
                  <div>
                    <ImageUpload
                      onSuccess={handlePrimaryFileUpload}
                      folder="conces-logos"
                      className="w-full justify-center"
                    >
                      Upload Primary Logo
                    </ImageUpload>
                    {uploadError && (
                      <p className="text-red-500 text-sm mt-2">{uploadError}</p>
                    )}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-20 h-20">
                          <Image
                            src={primaryFileUrl}
                            alt="Primary logo"
                            fill
                            className="object-contain rounded"
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          Primary logo uploaded successfully
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removePrimaryFile}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mockup (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mockup (Optional - Show your logo in action)
                </label>

                {!mockupUrl ? (
                  <ImageUpload
                    onSuccess={handleMockupUpload}
                    folder="conces-mockups"
                    className="w-full justify-center"
                  >
                    Upload Mockup
                  </ImageUpload>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-20 h-20">
                          <Image
                            src={mockupUrl}
                            alt="Mockup"
                            fill
                            className="object-contain rounded"
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          Mockup uploaded successfully
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeMockup}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
              >
                Submit Final Design
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={saveDraft}
                className="flex-1"
              >
                Save as Draft
              </Button>
            </div>
          </form>
        </div>

        {/* Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 bg-white rounded-2xl shadow-xl p-6 md:p-8"
        >
          <h2 className="text-xl font-semibold text-conces-blue mb-4">
            Submission Guidelines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">
                File Requirements
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Vector format (AI or SVG) preferred</li>
                <li>• High resolution PNG (min 2000px width)</li>
                <li>• Maximum file size: 10MB per file</li>
                <li>• Clear, scalable design</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">
                Design Standards
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Original work only</li>
                <li>• Works on light and dark backgrounds</li>
                <li>• Represents Nigerian engineering excellence</li>
                <li>• Professional and timeless design</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
