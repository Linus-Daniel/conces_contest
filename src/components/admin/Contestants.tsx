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
  EllipsisVerticalIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
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
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const itemsPerPage = 8;

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

  // Statistics
  const stats = useMemo(() => {
    if (!contestants) return { total: 0, qualified: 0, disqualified: 0 };

    const qualified = contestants.filter((c) => c.isQualified).length;
    return {
      total: contestants.length,
      qualified,
      disqualified: contestants.length - qualified,
    };
  }, [contestants]);

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
      const response = await fetch(`/api/contestants/${contestantId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isQualified: !currentStatus }),
      });

      if (response.ok) {
        window.location.reload();
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
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-rose-50 text-rose-700 border-rose-200";
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-2">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <UserGroupIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No contestants yet
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              When contestants enroll, they'll appear here for you to manage.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="  px-4 sm:px-6 lg:px-3 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                <UserGroupIcon className="w-8 h-8 mr-3 text-blue-600" />
                Contestants
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                Manage all enrolled contestants and their qualification status
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={exportData}
                className="inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <UserGroupIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Qualified</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {stats.qualified}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-rose-50 rounded-xl">
                  <XCircleIcon className="w-6 h-6 text-rose-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Disqualified
                  </p>
                  <p className="text-2xl font-bold text-rose-600">
                    {stats.disqualified}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search contestants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              <div className="flex gap-3">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="pl-4 pr-10 py-3 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl bg-white"
                >
                  <option>All Status</option>
                  <option>Qualified</option>
                  <option>Disqualified</option>
                </select>
                <button className="inline-flex items-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all">
                  <FunnelIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {paginatedContestants.map((contestant) => (
            <div
              key={contestant._id?.toString()}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-start space-x-4">
                <div className="relative">
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
                    className="absolute top-0 left-0 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Image
                    className="h-14 w-14 rounded-xl object-cover ml-6"
                    src={contestant.avatar || "/default-avatar.png"}
                    alt={contestant.fullName}
                    width={56}
                    height={56}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {contestant.fullName}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {contestant.matricNumber}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full border ${getQualificationColor(
                        contestant.isQualified
                      )}`}
                    >
                      {contestant.isQualified ? "Qualified" : "Disqualified"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="truncate">{contestant.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{contestant.phone}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <BuildingOfficeIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="truncate">{contestant.institution}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarDaysIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Enrolled {formatDate(contestant.createdAt)}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() =>
                        handleQualificationToggle(
                          contestant._id?.toString() || "",
                          contestant.isQualified
                        )
                      }
                      disabled={isUpdating === contestant._id?.toString()}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        contestant.isQualified
                          ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isUpdating === contestant._id?.toString() ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Updating...
                        </div>
                      ) : contestant.isQualified ? (
                        "Disqualify"
                      ) : (
                        "Qualify"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer hover:text-gray-700">
                      <span>Contestant</span>
                      <ChevronUpDownIcon className="w-4 h-4 ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer hover:text-gray-700">
                      <span>Contact</span>
                      <ChevronUpDownIcon className="w-4 h-4 ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer hover:text-gray-700">
                      <span>Institution</span>
                      <ChevronUpDownIcon className="w-4 h-4 ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer hover:text-gray-700">
                      <span>Status</span>
                      <ChevronUpDownIcon className="w-4 h-4 ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer hover:text-gray-700">
                      <span>Enrolled</span>
                      <ChevronUpDownIcon className="w-4 h-4 ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedContestants.map((contestant) => (
                  <tr
                    key={contestant._id?.toString()}
                    className="hover:bg-gray-50 transition-colors"
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
                        <div className="flex-shrink-0 h-12 w-12">
                          <Image
                            className="h-12 w-12 rounded-xl object-cover"
                            src={contestant.avatar || "/default-avatar.png"}
                            alt={contestant.fullName}
                            width={48}
                            height={48}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">
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
                      <div className="text-sm text-gray-900 font-medium">
                        {contestant.institution}
                      </div>
                      <div className="text-sm text-gray-500">
                        {contestant.department}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full border ${getQualificationColor(
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
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                          contestant.isQualified
                            ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isUpdating === contestant._id?.toString() ? (
                          <div className="flex items-center">
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
                            Updating
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
        </div>

        {/* Pagination */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 px-4 py-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-700 text-center sm:text-left">
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
              <span className="font-medium">{filteredContestants.length}</span>{" "}
              results
            </div>

            <nav className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeftIcon className="w-4 h-4 mr-1" />
                Previous
              </button>

              {/* Page numbers */}
              <div className="hidden sm:flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
