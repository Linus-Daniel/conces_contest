"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  ChevronUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { IEnroll } from "@/models/Enroll";

interface UserManagementProps {
  contestants: IEnroll[] | undefined;
}

export default function UserManagement({ contestants }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedContestants, setSelectedContestants] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Filter contestants based on search and status
  const filteredContestants = useMemo(() => {
    if (!contestants) return [];

    return contestants.filter((contestant) => {
      const matchesSearch =
        contestant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contestant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contestant.institution
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        contestant.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === "All Status" ||
        (selectedStatus === "Qualified" && contestant.isQualified) ||
        (selectedStatus === "Disqualified" && !contestant.isQualified);

      return matchesSearch && matchesStatus;
    });
  }, [contestants, searchTerm, selectedStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredContestants.length / itemsPerPage);
  const paginatedContestants = filteredContestants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContestants(
        paginatedContestants.map(
          (contestant) => contestant._id?.toString() || ""
        )
      );
    } else {
      setSelectedContestants([]);
    }
  };

  const handleSelectContestant = (contestantId: string, checked: boolean) => {
    if (checked) {
      setSelectedContestants([...selectedContestants, contestantId]);
    } else {
      setSelectedContestants(
        selectedContestants.filter((id) => id !== contestantId)
      );
    }
  };

  const handleQualificationToggle = async (
    contestantId: string,
    currentStatus: boolean
  ) => {
    setIsUpdating(contestantId);

    try {
      // TODO: Replace with actual API call
      const response = await fetch(
        `/api/contestants/${contestantId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isQualified: !currentStatus }),
        }
      );

      if (response.ok) {
        // Update local state or refetch data
        window.location.reload(); // Temporary solution - ideally use state management
      } else {
        console.error("Failed to update qualification status");
      }
    } catch (error) {
      console.error("Error updating qualification status:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  const getQualificationColor = (isQualified: boolean) => {
    return isQualified
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const exportData = () => {
    if (!contestants) return;

    const csvContent = [
      [
        "Name",
        "Email",
        "Phone",
        "Institution",
        "Department",
        "Matric Number",
        "Qualified",
        "Enrolled Date",
      ].join(","),
      ...contestants.map((contestant) =>
        [
          contestant.fullName,
          contestant.email,
          contestant.phone,
          contestant.institution,
          contestant.department,
          contestant.matricNumber,
          contestant.isQualified ? "Yes" : "No",
          formatDate(contestant.createdAt),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contestants.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!contestants) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          <UserIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        </div>
        <p className="text-gray-500 text-lg">No contestant data available</p>
      </div>
    );
  }

  return (
    <div>
      {/* Page Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contestants</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all enrolled contestants ({contestants.length} total)
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <button
            onClick={exportData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Contestants Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Filters & Search */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search contestants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            <div className="flex gap-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option>All Status</option>
                <option>Qualified</option>
                <option>Disqualified</option>
              </select>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <FunnelIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={
                      selectedContestants.length ===
                        paginatedContestants.length &&
                      paginatedContestants.length > 0
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center cursor-pointer">
                    <span>Contestant</span>
                    <ChevronUpDownIcon className="w-4 h-4 ml-1" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center cursor-pointer">
                    <span>Contact</span>
                    <ChevronUpDownIcon className="w-4 h-4 ml-1 text-gray-400" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center cursor-pointer">
                    <span>Institution</span>
                    <ChevronUpDownIcon className="w-4 h-4 ml-1 text-gray-400" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center cursor-pointer">
                    <span>Qualification</span>
                    <ChevronUpDownIcon className="w-4 h-4 ml-1 text-gray-400" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center cursor-pointer">
                    <span>Enrolled Date</span>
                    <ChevronUpDownIcon className="w-4 h-4 ml-1 text-gray-400" />
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedContestants.map((contestant) => (
                <tr
                  key={contestant._id?.toString()}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedContestants.includes(
                        contestant._id?.toString() || ""
                      )}
                      onChange={(e) =>
                        handleSelectContestant(
                          contestant._id?.toString() || "",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <Image
                          className="h-10 w-10 rounded-full object-cover"
                          src={contestant.avatar || "/default-avatar.png"}
                          alt={contestant.fullName}
                          width={40}
                          height={40}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {contestant.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {contestant.matricNumber}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {contestant.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {contestant.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {contestant.institution}
                    </div>
                    <div className="text-sm text-gray-500">
                      {contestant.department}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getQualificationColor(
                        contestant.isQualified
                      )}`}
                    >
                      {contestant.isQualified ? "Qualified" : "Disqualified"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(contestant.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() =>
                        handleQualificationToggle(
                          contestant._id?.toString() || "",
                          contestant.isQualified
                        )
                      }
                      disabled={isUpdating === contestant._id?.toString()}
                      className={`${
                        contestant.isQualified
                          ? "text-red-600 hover:text-red-900"
                          : "text-green-600 hover:text-green-900"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isUpdating === contestant._id?.toString() ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
                          Updating...
                        </div>
                      ) : contestant.isQualified ? (
                        "Disqualify"
                      ) : (
                        "Qualify"
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredContestants.length
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {filteredContestants.length}
                  </span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? "border-blue-500 bg-blue-50 text-blue-600"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
