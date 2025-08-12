"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function ContestSection() {
  return (
    <section
      id="challenge"
      className="py-20 bg-gradient-to-r from-conces-blue to-conces-blue/90 text-white"
    >
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="md:w-2/3 mb-8 md:mb-0"
          >
            <h2 className="text-4xl font-bold mb-6">
              Over ₦1,000,000 in Prizes. 1 National Stage.
            </h2>
            <p className="text-xl mb-8">
              The CONCES Logo Rebrand Challenge is your opportunity to make
              history. Design the new face of engineering students in Nigeria
              and win big!
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/signup"
                className="bg-conces-green text-white px-8 py-4 rounded-xl font-bold text-lg btn-glow inline-flex items-center justify-center"
              >
                Enter the Challenge
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="md:w-1/3 flex justify-center"
          >
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
                className="w-64 h-64 bg-conces-gold/20 rounded-full flex items-center justify-center"
              >
                <div className="w-56 h-56 bg-conces-gold/30 rounded-full flex items-center justify-center">
                  <div className="w-48 h-48 bg-conces-gold/50 rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl font-bold">₦500K</div>
                      <div className="text-xl mt-2">First Prize</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

      
      </div>
    </section>
  );
}
