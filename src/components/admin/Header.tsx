"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  BellIcon,
  CogIcon,
  ChevronDownIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface HeaderProps {
  onSidebarToggle: () => void;
}

export default function Header({ onSidebarToggle }: HeaderProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [notificationCount] = useState(3);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileDropdownOpen(false);
        setSearchOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
    if (searchOpen) {
      setSearchValue("");
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple logout attempts

    try {
      setIsLoggingOut(true);
      setProfileDropdownOpen(false);

      // Call the logout API
      const response = await fetch("/api/auth/admin/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Successfully logged out
        router.push("/admin/auth");
        router.refresh(); // Force a refresh to clear any cached data
      } else {
        // Handle logout error
        console.error("Logout failed");
        // You might want to show a toast notification here
        alert("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Something went wrong during logout. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Main Header */}
      <header className="relative bg-white/95 backdrop-blur-md border-b border-gray-200/70 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={onSidebarToggle}
                className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle sidebar"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>

              {/* Logo/Title */}
              <div className="flex items-center space-x-3">
                <div className="hidden lg:flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    ContestPro
                  </h1>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    Admin Dashboard
                  </p>
                </div>
              </div>
            </div>

            {/* Center Section - Desktop Search */}
            <div className="hidden md:flex items-center flex-1 max-w-2xl mx-8">
              <div className="relative w-full group">
                <input
                  type="text"
                  placeholder="Search contestants, institutions, or anything..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 group-hover:bg-white"
                />
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                {searchValue && (
                  <button
                    onClick={() => setSearchValue("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Mobile Search Button */}
              <button
                onClick={handleSearchToggle}
                className="md:hidden p-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Search"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>

              {/* Notifications */}
              <button className="relative p-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 group">
                <BellIcon className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-xs text-white flex items-center justify-center font-medium shadow-lg animate-pulse">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
                <span className="absolute inset-0 rounded-xl bg-gray-100 scale-0 group-hover:scale-100 transition-transform duration-200 -z-10"></span>
              </button>

              {/* Settings */}
              <button className="relative p-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 group">
                <CogIcon className="w-5 h-5" />
                <span className="absolute inset-0 rounded-xl bg-gray-100 scale-0 group-hover:scale-100 transition-transform duration-200 -z-10"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 group"
                  aria-expanded={profileDropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="relative">
                    <Image
                      src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg"
                      alt="Admin User"
                      width={40}
                      height={40}
                      className="rounded-xl object-cover border-2 border-gray-200 group-hover:border-gray-300 transition-colors"
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>

                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-900">
                      Admin User
                    </p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>

                  <ChevronDownIcon
                    className={`w-4 h-4 text-gray-500 hidden sm:block transition-transform duration-200 ${
                      profileDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <Image
                          src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg"
                          alt="Admin User"
                          width={48}
                          height={48}
                          className="rounded-xl object-cover"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            Admin User
                          </p>
                          <p className="text-xs text-gray-500">
                            admin@contestpro.com
                          </p>
                          <div className="flex items-center mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-xs text-green-600 font-medium">
                              Online
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors group">
                        <UserCircleIcon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-600" />
                        <span>Your Profile</span>
                      </button>

                      <button className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors group">
                        <CogIcon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-600" />
                        <span>Settings</span>
                      </button>
                    </div>

                    <div className="border-t border-gray-100 pt-2">
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoggingOut ? (
                          <>
                            <div className="w-5 h-5 mr-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>Signing out...</span>
                          </>
                        ) : (
                          <>
                            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3 text-red-500" />
                            <span>Sign out</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {searchOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex-1 mr-4">
              <div className="relative">
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search anything..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>
            <button
              onClick={handleSearchToggle}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Search Results/Suggestions */}
          <div className="p-4">
            {searchValue ? (
              <div className="text-center py-8">
                <MagnifyingGlassIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Search results for "{searchValue}"
                </p>
                <p className="text-sm text-gray-400 mt-1">No results found</p>
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Recent Searches
                </h3>
                <div className="space-y-2">
                  <button className="flex items-center w-full p-3 text-left rounded-xl hover:bg-gray-50 transition-colors">
                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-700">John Doe</span>
                  </button>
                  <button className="flex items-center w-full p-3 text-left rounded-xl hover:bg-gray-50 transition-colors">
                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-700">
                      University of Lagos
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
