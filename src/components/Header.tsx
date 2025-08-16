"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bars3Icon, XMarkIcon, UserIcon } from "@heroicons/react/24/outline";
import { useCandidate } from "@/context/authContext";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { candidate } = useCandidate();

  // Close mobile menu when clicking outside or on link
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        
        className="sticky top-0 w-full z-50 transition-all duration-300 bg-conces-blue shadow-lg"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <span className="text-xl sm:text-2xl font-bold text-white">
                CONCES
              </span>
              <span className="ml-2 text-xs font-medium text-conces-green bg-white/20 px-2 py-1 rounded-full hidden sm:block">
                Rebrand in Progress
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <Link
                href="/"
                className="nav-link text-white font-medium hover:text-conces-green transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                href="/#about"
                className="nav-link text-white font-medium hover:text-conces-green transition-colors duration-200"
              >
                About
              </Link>
              <Link
                href="/#challenge"
                className="nav-link text-white font-medium hover:text-conces-green transition-colors duration-200"
              >
                Challenge
              </Link>
              <Link
                href="/#universities"
                className="nav-link text-white font-medium hover:text-conces-green transition-colors duration-200"
              >
                Universities
              </Link>

              {candidate ? (
                <div className="flex items-center space-x-3">
                  {/* User Avatar and Name */}
                  <Link
                    href="/submit"
                    className="flex items-center space-x-2 bg-conces-green text-white px-4 py-2 rounded-lg font-semibold btn-glow hover:bg-conces-green/90 transition-all duration-200"
                  >
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                      {candidate.avatar ? (
                        <img
                          src={candidate.avatar}
                          alt={candidate.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="hidden xl:block">
                      {candidate.fullName.split(" ")[0]}
                    </span>
                  </Link>
                </div>
              ) : (
                <Link
                  href="/signup"
                  className="bg-conces-green text-white px-6 py-2 rounded-lg font-semibold btn-glow hover:bg-conces-green/90 transition-all duration-200"
                >
                  Enter Contest
                </Link>
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-white p-2 -mr-2 hover:bg-white/10 rounded-md transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={closeMobileMenu}
            />

            {/* Mobile Menu */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 left-0 bottom-0 z-50 w-80 max-w-[85vw] bg-conces-blue shadow-2xl lg:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <span className="text-xl font-bold text-white">CONCES</span>
                  <button
                    onClick={closeMobileMenu}
                    className="text-white p-2 -mr-2 hover:bg-white/10 rounded-md transition-colors duration-200"
                    aria-label="Close mobile menu"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* User Info (if logged in) */}
                {candidate && (
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                        {candidate.avatar ? (
                          <img
                            src={candidate.avatar}
                            alt={candidate.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserIcon className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">
                          {candidate.fullName}
                        </p>
                        <p className="text-white/70 text-xs">
                          {candidate.university}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-6">
                  <div className="space-y-2">
                    <Link
                      href="/"
                      onClick={closeMobileMenu}
                      className="block text-white font-medium py-3 px-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
                    >
                      Home
                    </Link>
                    <Link
                      href="/#about"
                      onClick={closeMobileMenu}
                      className="block text-white font-medium py-3 px-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
                    >
                      About
                    </Link>
                    <Link
                      href="/#challenge"
                      onClick={closeMobileMenu}
                      className="block text-white font-medium py-3 px-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
                    >
                      Challenge
                    </Link>
                    <Link
                      href="/#universities"
                      onClick={closeMobileMenu}
                      className="block text-white font-medium py-3 px-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
                    >
                      Universities
                    </Link>
                  </div>
                </nav>

                {/* CTA Button */}
                <div className="p-4 border-t border-white/10">
                  {candidate ? (
                    <Link
                      href="/submit"
                      onClick={closeMobileMenu}
                      className="block w-full bg-conces-green text-white py-3 px-6 rounded-lg font-semibold text-center hover:bg-conces-green/90 transition-colors duration-200"
                    >
                      Go to Submissions
                    </Link>
                  ) : (
                    <Link
                      href="/signup"
                      onClick={closeMobileMenu}
                      className="block w-full bg-conces-green text-white py-3 px-6 rounded-lg font-semibold text-center hover:bg-conces-green/90 transition-colors duration-200"
                    >
                      Enter Contest
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
