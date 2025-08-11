"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function HeroSection() {
  return (
    <section className="relative h-screen flex items-center overflow-hidden bg-gradient-to-br from-conces-blue to-conces-blue/80">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-conces-blue/80 to-conces-blue/60" />
      </div>

      <div className="container mx-auto px-6 z-10 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6"
          >
            The Future of CONCES Starts Now
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-white/90 mb-8"
          >
            We're rebranding. We're relaunching. And we're inviting you to make
            history.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/signup"
              className="bg-conces-green text-white px-8 py-4 rounded-xl font-bold text-lg btn-glow inline-flex items-center justify-center"
            >
              Join the Rebrand Challenge
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/#about"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg btn-outline inline-flex items-center justify-center"
            >
              Learn About CONCES
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
    3