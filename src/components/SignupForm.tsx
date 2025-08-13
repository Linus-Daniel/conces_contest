"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { UNIVERSITIES, DEPARTMENTS } from "@/lib/contants";
import api from "@/lib/axiosInstance";
import { useCandidate } from "@/context/authContext";
import ImageUpload from "./ImageUpload";
import { FaUpload, FaTimes } from "react-icons/fa";

interface SignUpFormData {
  fullName: string;
  email: string;
  phone: string;
  university: string;
  department: string;
  level: string;
  matricNumber: string;
  agreeToTerms: boolean;
}

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
  } = useForm<SignUpFormData>();

  const { candidate } = useCandidate();

  const onSubmit = async (data: SignUpFormData) => {
    setIsSubmitting(true);

    try {
      // Include avatar in the submission data
      const submissionData = {
        ...data,
        avatar: formData.avatar,
      };

      const response = await api.post("/enroll", { data: submissionData });
      console.log(response.data);

      alert("Registration successful! You can now submit your project.");
      router.push("/submit");
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      avatar: url,
    }));
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      avatar: "",
    }));
  };

  if (candidate) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-conces-blue mb-4">
          Welcome Back, {candidate.fullName}
        </h1>
        <p className="text-gray-600 mb-6">
          You are already registered for the Rebrand Challenge.
        </p>
        <Button onClick={() => router.push("/submit")}>Go to Submission</Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-xl p-8"
    >
      <h1 className="text-3xl font-bold text-conces-blue mb-2">
        Join the Rebrand Challenge
      </h1>
      <p className="text-gray-600 mb-8">
        Create your account to submit your design and compete for ₦1,000,000 in
        prizes
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Profile Photo
          </label>
          <div className="space-y-4">
            <ImageUpload
              onSuccess={(info) => handleImageUpload(info.secure_url)}
              folder="products/"
            >
              <div className="flex items-center justify-center p-4 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                <FaUpload className="mr-2" />
                Upload Images
              </div>
            </ImageUpload>

            {formData.avatar && (
              <div className="relative group">
                <img
                  src={formData.avatar}
                  alt="Profile preview"
                  className="rounded-md object-cover h-32 w-full"
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Full Name"
            {...register("fullName", { required: "Full name is required" })}
            error={errors.fullName?.message}
            placeholder="John Doe"
          />

          <Input
            label="Email Address"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            error={errors.email?.message}
            placeholder="john@example.com"
          />

          <Input
            label="Phone Number"
            type="tel"
            {...register("phone", { required: "Phone number is required" })}
            error={errors.phone?.message}
            placeholder="+234 800 000 0000"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              University *
            </label>
            <select
              {...register("university", {
                required: "University is required",
              })}
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select University</option>
              {UNIVERSITIES.map((uni) => (
                <option key={uni} value={uni}>
                  {uni}
                </option>
              ))}
            </select>
            {errors.university && (
              <p className="text-red-500 text-sm mt-1">
                {errors.university.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department *
            </label>
            <select
              {...register("department", {
                required: "Department is required",
              })}
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Department</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            {errors.department && (
              <p className="text-red-500 text-sm mt-1">
                {errors.department.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Level *
            </label>
            <select
              {...register("level", { required: "Level is required" })}
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Level</option>
              {["100", "200", "300", "400", "500"].map((level) => (
                <option key={level} value={level}>
                  {level} Level
                </option>
              ))}
            </select>
            {errors.level && (
              <p className="text-red-500 text-sm mt-1">
                {errors.level.message}
              </p>
            )}
          </div>

          <Input
            label="Matric Number"
            {...register("matricNumber", {
              required: "Matric number is required",
            })}
            error={errors.matricNumber?.message}
            placeholder="ENG/2020/001"
          />
        </div>

        <div className="bg-conces-blue/5 rounded-lg p-4">
          <h3 className="font-semibold text-conces-blue mb-2">
            Competition Rules
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              • Must be a registered engineering student in a Nigerian
              university
            </li>
            <li>• Original designs only - no plagiarism</li>
            <li>• Maximum of 3 submissions per participant</li>
            <li>• Winners will present live at the national conference</li>
          </ul>
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            {...register("agreeToTerms", {
              required: "You must agree to the terms",
            })}
            className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="text-sm text-gray-700">
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
          <p className="text-red-500 text-sm">{errors.agreeToTerms.message}</p>
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/")}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>

        <p className="text-center text-gray-600">
          Already have an account?{" "}
          <a href="#" className="text-conces-green font-medium hover:underline">
            Sign In
          </a>
        </p>
      </form>
    </motion.div>
  );
}
