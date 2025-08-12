"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { UNIVERSITIES, DEPARTMENTS } from "@/lib/contants";
import api from "@/lib/axiosInstance";

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

export default function SignUpForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>();


  const onSubmit = async (data: SignUpFormData) => {
    setIsSubmitting(true);

    // Simulate API call
    const response = await api.post("/enroll", {data})
    console.log(response.data);
    setIsSubmitting(false);

    alert("Registration successful! You can now submit your project.");
    router.push("/submit");
  };

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
              className="form-input w-full"
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
              className="form-input w-full"
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
              className="form-input w-full"
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
            className="mt-1 mr-3"
          />
          <label className="text-sm text-gray-700">
            I agree to the{" "}
            <a href="#" className="text-conces-green font-medium">
              Terms and Conditions
            </a>{" "}
            and{" "}
            <a href="#" className="text-conces-green font-medium">
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
            variant="outline"
            onClick={() => router.push("/")}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>

        <p className="text-center text-gray-600">
          Already have an account?{" "}
          <a href="#" className="text-conces-green font-medium">
            Sign In
          </a>
        </p>
      </form>
    </motion.div>
  );
}
