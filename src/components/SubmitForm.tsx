"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import FileUpload from "./FileUpload";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

interface ProjectFormData {
  projectTitle: string;
  designConcept: string;
  colorPalette: string;
  inspiration: string;
}

export default function SubmitProjectForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [primaryFile, setPrimaryFile] = useState<File[]>([]);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [mockups, setMockups] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>();

  const onSubmit = async (data: ProjectFormData) => {
    if (!primaryFile.length) {
      alert("Please upload a primary logo file");
      return;
    }

    setIsSubmitting(true);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            alert("Project submitted successfully! Good luck!");
            router.push("/");
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

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
                You can submit up to 3 different designs. Make sure your files
                are in high resolution (AI, SVG, PNG, or PDF format).
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
                className={`form-input w-full ${
                  errors.designConcept ? "border-red-500" : ""
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
                className={`form-input w-full ${
                  errors.colorPalette ? "border-red-500" : ""
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
                className={`form-input w-full ${
                  errors.inspiration ? "border-red-500" : ""
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

            <FileUpload
              label="Primary Logo File (AI, SVG, PNG, or PDF)"
              accept=".ai,.svg,.png,.pdf"
              required
              onFilesSelected={setPrimaryFile}
              error={
                primaryFile.length === 0 && isSubmitting
                  ? "Primary file is required"
                  : undefined
              }
            />

            <FileUpload
              label="Additional Files (Variations, Black & White versions, etc.)"
              accept=".ai,.svg,.png,.pdf,.jpg,.jpeg"
              multiple
              onFilesSelected={setAdditionalFiles}
            />

            <FileUpload
              label="Mockups (Show your logo in action)"
              accept="image/*"
              multiple
              onFilesSelected={setMockups}
            />
          </div>

          {/* Upload Progress */}
          {isSubmitting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-50 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Uploading project...
                </span>
                <span className="text-sm text-conces-green">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  className="bg-conces-green h-2 rounded-full"
                />
              </div>
            </motion.div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Submitting Project..." : "Submit Project"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
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
              <li>• Vector format (AI or SVG) required</li>
              <li>• Include PNG version (min 2000px width)</li>
              <li>• Black & white version</li>
              <li>• Maximum file size: 50MB per file</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Design Standards</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Original work only</li>
              <li>• Scalable design</li>
              <li>• Works on light and dark backgrounds</li>
              <li>• Represents Nigerian engineering excellence</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
