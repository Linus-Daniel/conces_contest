"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import ImageUpload from "./ImageUpload";
import { InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useCandidate } from "@/context/authContext";
import Image from "next/image";
import api from "@/lib/axiosInstance";

interface ProjectFormData {
  projectTitle: string;
  designConcept: string;
  colorPalette: string;
  inspiration: string;
}

export default function SubmitProjectForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [primaryFileUrl, setPrimaryFileUrl] = useState<string>("");
  const [mockupUrl, setMockupUrl] = useState<string>("");
  const [uploadError, setUploadError] = useState<string>("");
  const { candidate } = useCandidate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectFormData>();

  const handlePrimaryFileUpload = (result: any) => {
    setPrimaryFileUrl(result.secure_url);
    setUploadError("");
  };

  const handleMockupUpload = (result: any) => {
    setMockupUrl(result.secure_url);
  };

  const removePrimaryFile = () => {
    setPrimaryFileUrl("");
  };

  const removeMockup = () => {
    setMockupUrl("");
  };

  const onSubmit = async (data: ProjectFormData) => {
    if (!primaryFileUrl) {
      setUploadError("Please upload a primary logo file");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/submit", 
  {
          candidateId: candidate?._id || candidate?._id, // Handle both id formats
          ...data,
          primaryFileUrl,
          mockupUrl,
        })
      

      const result = response.data;


      // Success
      alert("Project submitted successfully! Good luck!");
      reset();
      setPrimaryFileUrl("");
      setMockupUrl("");
      router.push("/dashboard"); // Or wherever you want to redirect
    } catch (error) {
      console.error("Submission error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to submit project. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
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
      const response = await fetch("/api/projects/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidateId: candidate?._id || candidate?._id,
          ...formData,
          primaryFileUrl: primaryFileUrl || "",
          mockupUrl,
          status: "draft",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save draft");
      }

      alert("Draft saved successfully!");
    } catch (error) {
      console.error("Draft save error:", error);
      alert("Failed to save draft. Please try again.");
    }
  };

  if (!candidate) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-conces-blue mb-4">
          Please input your token to submit your design
        </h1>
        <p className="text-gray-600 mb-6">
          You need to be logged in to submit your project. Please log in or sign
          up.
        </p>
        <Button onClick={() => router.push("/auth")}>Go to Sign Up</Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-conces-blue mb-2">
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
                Upload your logo design in high resolution (AI, SVG, PNG, or PDF
                format). You can also add a mockup to showcase your design in
                action.
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
          <div className="flex gap-4 pt-6 border-t">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Submitting Project..." : "Submit Project"}
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
        className="mt-8 bg-white rounded-2xl shadow-xl p-8"
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
            <h3 className="font-medium text-gray-700 mb-2">Design Standards</h3>
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
  );
}
