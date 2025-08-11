"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed w-full z-50 transition-all duration-300 bg-conces-blue`}
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold text-white">CONCES</span>
          <span className="ml-2 text-xs font-medium text-conces-green bg-white/20 px-2 py-1 rounded-full">
            Rebrand in Progress
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="nav-link text-white font-medium">
            Home
          </Link>
          <Link href="/#about" className="nav-link text-white font-medium">
            About
          </Link>
          <Link href="/#challenge" className="nav-link text-white font-medium">
            Challenge
          </Link>
          <Link
            href="/#universities"
            className="nav-link text-white font-medium"
          >
            Universities
          </Link>
          <Link
            href="/signup"
            className="bg-conces-green text-white px-6 py-2 rounded-lg font-semibold btn-glow"
          >
            Enter Contest
          </Link>
        </nav>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-white"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="md:hidden bg-conces-blue/95"
          >
            <nav className="flex flex-col p-4 space-y-4">
              <Link href="/" className="text-white font-medium py-2">
                Home
              </Link>
              <Link href="/#about" className="text-white font-medium py-2">
                About
              </Link>
              <Link href="/#challenge" className="text-white font-medium py-2">
                Challenge
              </Link>
              <Link
                href="/#universities"
                className="text-white font-medium py-2"
              >
                Universities
              </Link>
              <Link
                href="/signup"
                className="bg-conces-green text-white px-6 py-3 rounded-lg font-semibold text-center"
              >
                Enter Contest
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
