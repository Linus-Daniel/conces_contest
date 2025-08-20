"use client";

import { motion } from "framer-motion";
import {
  AcademicCapIcon,
  CodeBracketIcon,
  UserGroupIcon,
  HeartIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const stats = [
  {
    label: "Top Disciplines",
    value:
      "Mechanical Engineering • Electrical Engineering • Civil Engineering • Computer Science",
    icon: AcademicCapIcon,
  },
  {
    label: "Tools We Use",
    value: "Python • AutoCAD • Figma",
    icon: CodeBracketIcon,
  },
  {
    label: "How We Gather",
    value: "Chapters • Online • Events",
    icon: UserGroupIcon,
  },
  {
    label: "Why We're Here",
    value: "Faith • Excellence • Service",
    icon: HeartIcon,
  },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-white"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-conces-blue font-semibold text-sm uppercase tracking-wider mb-2 block">
            Who We Are
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            About <span className="text-conces-blue">CONCES</span>
          </h2>
          <div className="h-1 w-16 bg-conces-green mx-auto"></div>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-conces-green/20 to-conces-blue/20 rounded-2xl rotate-2"></div>
              <div className="relative bg-white p-8 md:p-10 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  The Unified Voice of Engineering Students
                </h3>
                <div className="space-y-5">
                  <p className="text-gray-700 leading-relaxed">
                    The Conference of Nigerian Engineering Students (CONCES) is
                    the unified voice of engineering students across Nigeria.
                    Founded on principles of innovation, excellence, and
                    national development, we bridge the gap between academic
                    learning and industry needs.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Our mission is to empower the next generation of Nigerian
                    engineers through collaborative projects, skill development
                    programs, and industry connections that prepare students for
                    the challenges of tomorrow.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                    className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start mb-4">
                      <div className="p-2 bg-conces-blue/10 rounded-lg">
                        <IconComponent className="h-6 w-6 text-conces-blue" />
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {stat.label}
                    </h4>
                    <p className="text-gray-600 text-sm">{stat.value}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
