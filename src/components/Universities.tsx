"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const universities = [
  "University of Lagos",
  "University of Ibadan",
  "Ahmadu Bello University",
  "University of Nigeria, Nsukka",
  "Obafemi Awolowo University",
  "University of Benin",
  "Federal University of Technology, Akure",
  "Federal University of Technology, Minna",
];

export default function UniversitiesSection() {
  return (
    <section id="universities" className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center text-conces-blue mb-12"
        >
          Participating Institutions
        </motion.h2>

        <div className="overflow-hidden">
          <motion.div
            animate={{
              x: [0, -1920],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 20,
                ease: "linear",
              },
            }}
            className="flex space-x-12"
          >
            {[...universities, ...universities].map((uni, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-40 h-20 bg-white rounded-lg shadow-sm flex items-center justify-center p-4"
              >
                <p className="text-center text-sm text-gray-700 font-medium">
                  {uni}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
