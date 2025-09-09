"use client";

import ContestManagement from "@/components/admin/Contest";
import UserManagement from "@/components/admin/Contestants";
import api from "@/lib/axiosInstance";
import { IEnroll } from "@/models/Enroll";
import React, { useEffect, useState } from "react";

const Page = () => {
  const [contestants, setContestants] = useState<IEnroll[] | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(true);

  const getContestants = async () => {
    try {
      const response = await api.get("/contestants");
      setContestants(response.data.data as IEnroll[]);
    } catch (error) {
      console.error("Error fetching contestants:", error);
      setContestants(undefined);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getContestants();
  }, []);
  console.log(contestants?.length);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 sm:px-2 lg:px-2">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage contestants and contests
          </p>
        </div>

        <div className="space-y-8">
          {/* Contestants Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Contestant Management
              </h2>
            </div>
            <div className="p-2">
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  Loading contestants...
                </div>
              ) : contestants ? (
                <UserManagement contestants={contestants} />
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-2">
                    <svg
                      className="w-12 h-12 mx-auto mb-4 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm sm:text-base">
                    Failed to load contestants. Please try again.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Future Contest Management Section */}
          {/* <ContestManagement /> */}
        </div>
      </div>
    </div>
  );
};

export default Page;
