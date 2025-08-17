"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

const stats = [
  { label: "Universities", value: "50+" },
  { label: "Students", value: "10K+" },
  { label: "Projects", value: "100+" },
  { label: "Years", value: "15" },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="md:w-1/2"
          >
            <h2 className="text-4xl font-bold text-conces-blue mb-6">
              About CONCES
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              The Council of Nigerian Engineering Students (CONCES) is the
              unified voice of engineering students across Nigeria. Founded on
              principles of innovation, excellence, and national development, we
              bridge the gap between academic learning and industry needs.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              Our mission is to empower the next generation of Nigerian
              engineers through collaborative projects, skill development
              programs, and industry connections that prepare students for the
              challenges of tomorrow.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="md:w-1/2"
          >
            <div className="bg-gradient-to-br from-conces-green/20 to-conces-blue/20 rounded-xl p-8">
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-lg p-6 text-center"
                  >
                    <div className="text-3xl font-bold text-conces-blue">
                      {stat.value}
                    </div>
                    <div className="text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
