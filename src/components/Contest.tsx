"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { PRIZES } from "@/lib/contants";

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

        {/* Prize Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {PRIZES.map((prize, index) => (
            <motion.div
              key={prize.place}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className={`p-6 rounded-xl text-center text-white ${
                index === 0
                  ? "bg-gradient-to-br from-conces-gold to-yellow-600"
                  : index === 1
                  ? "bg-gradient-to-br from-gray-300 to-gray-500"
                  : "bg-gradient-to-br from-amber-700 to-amber-900"
              }`}
            >
              <div className="text-2xl font-bold mb-2">{prize.place}</div>
              <div className="text-3xl font-bold mb-4">{prize.amount}</div>
              <p className="text-sm">{prize.bonus}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
