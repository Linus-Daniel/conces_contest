"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import api from "@/lib/axiosInstance";
import { useCandidate } from "@/context/authContext";
import ImageUpload from "./ImageUpload";
import { FaUpload, FaTimes } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AxiosError } from "axios";

// Define validation schema with Zod
const formSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  institution: z.string().min(3, "Institution name is required"),
  department: z.string().min(2, "Department is required"),
  level: z.string().min(1, "Level is required"),
  matricNumber: z.string().min(5, "Matric number is required"),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms",
  }),
});

type SignUpFormData = z.infer<typeof formSchema>;

interface FormData {
  avatar: string;
}

export default function SignUpForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({ avatar: "" });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(formSchema),
  });

  const { candidate } = useCandidate();

  const onSubmit = async (data: SignUpFormData) => {
    // Validate avatar upload
    if (!formData.avatar) {
      toast.error("Please upload a profile photo");
      return;
    }

    setIsSubmitting(true);

    try {
      // Include avatar in the submission data
      const submissionData = {
        ...data,
        avatar: formData.avatar,
      };

      const response = await api.post("/enroll", { data: submissionData });

      toast.success(
        "Registration successful! You can now submit your project.",
        {
          duration: 5000,
        }
      );

      // Redirect after a short delay to allow user to see the success message
      setTimeout(() => router.push("/submit"), 2000);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Registration failed:", error);

        // Safely access response data
        const message =
          error.response?.data?.error ||
          error.message ||
          "Something went wrong";

        toast.error(message, { duration: 5000 });
      } else {
        // Non-Axios error (e.g., runtime error)
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred", { duration: 5000 });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      avatar: url,
    }));
    toast.success("Profile photo uploaded successfully!");
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      avatar: "",
    }));
    toast("Profile photo removed", {
      icon: "🗑️",
    });
  };

  if (candidate) {
    return (
      <div className="text-center p-4 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-bold text-conces-blue mb-4">
          Welcome Back, {candidate.fullName}
        </h1>
        <p className="text-gray-600 mb-6">
          You are already registered for the Rebrand Challenge.
        </p>
        <Button
          onClick={() => router.push("/submit")}
          className="w-full sm:w-auto"
        >
          Go to Submission
        </Button>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 4000,
            iconTheme: {
              primary: "#4BB543",
              secondary: "#fff",
            },
          },
          error: {
            duration: 5000,
          },
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg sm:rounded-2xl shadow-md sm:shadow-xl p-4 sm:p-6 md:p-8 w-full max-w-4xl mx-auto"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-conces-blue mb-2">
          Join the Rebrand Challenge
        </h1>
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          Create your account to submit your design and compete for ₦1,000,000
          in prizes
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 sm:space-y-6"
          noValidate
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              Profile Photo <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3 sm:space-y-4">
              <ImageUpload
                onSuccess={(info) => handleImageUpload(info.secure_url)}
                // onError={() => toast.error("Failed to upload image")}
                folder="products/"
              >
                <div className="flex items-center justify-center p-1 sm:p-2 rounded-md cursor-pointer transition-colors text-sm sm:text-base">
                  <FaUpload className="mr-2" />
                  Upload Images
                </div>
              </ImageUpload>

              {formData.avatar && (
                <div className="relative group">
                  <img
                    src={formData.avatar}
                    alt="Profile preview"
                    className="rounded-md object-cover h-24 sm:h-32 w-full"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FaTimes className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
            {!formData.avatar && (
              <p className="mt-1 text-xs text-red-500">
                Profile photo is required
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
            <Input
              label="Full Name"
              {...register("fullName")}
              error={errors.fullName?.message}
              placeholder="John Doe"
              required
            />

            <Input
              label="Email Address"
              type="email"
              {...register("email")}
              error={errors.email?.message}
              placeholder="john@example.com"
              required
            />

            <Input
              label="Phone Number"
              type="tel"
              {...register("phone")}
              error={errors.phone?.message}
              placeholder="+234 800 000 0000"
              required
            />

            <Input
              label="Institution"
              {...register("institution")}
              error={errors.institution?.message}
              placeholder="Enter your institution name"
              required
            />

            <Input
              label="Department"
              {...register("department")}
              error={errors.department?.message}
              placeholder="Enter your department"
              required
            />

          

            <Input
              label="Matric Number"
              {...register("matricNumber")}
              error={errors.matricNumber?.message}
              placeholder="ENG/2020/001"
              required
            />
          </div>

          <div className="bg-conces-blue/5 rounded-lg p-3 sm:p-4">
            <h3 className="font-semibold text-conces-blue mb-2 text-sm sm:text-base">
              Competition Rules
            </h3>
            <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
              <li>
                • Must be a registered engineering student in a Nigerian
                institution
              </li>
              <li>• Original designs only - no plagiarism</li>
              <li>• Maximum of 1 submissions per participant</li>
              <li>• Winning entries will be viewed live at Grand Finale</li>
            </ul>
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              {...register("agreeToTerms")}
              className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-xs sm:text-sm text-gray-700">
              I agree to the{" "}
              <a
                href="#"
                className="text-conces-green font-medium hover:underline"
              >
                Terms and Conditions
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="text-conces-green font-medium hover:underline"
              >
                Competition Rules
              </a>
            </label>
          </div>
          {errors.agreeToTerms && (
            <p className="text-red-500 text-xs sm:text-sm">
              {errors.agreeToTerms.message}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1"
            >
              {isSubmitting ? "Joining contest..." : "Join the contest"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/")}
              className="w-full sm:flex-1"
            >
              Cancel
            </Button>
          </div>

          <p className="text-center text-gray-600 text-xs sm:text-sm">
            Already have an account?{" "}
            <a
              href="#"
              className="text-conces-green font-medium hover:underline"
            >
              Sign In
            </a>
          </p>
        </form>
      </motion.div>
    </>
  );
}
