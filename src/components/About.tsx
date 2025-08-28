"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  AcademicCapIcon,
  ComputerDesktopIcon,
  HeartIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

const stats = [
  {
    label: "Engineering Disciplines",
    value: [
      "Mechanical Engineering",
      "Electrical Engineering",
      "Civil Engineering",
      "Chemical Engineering",
      "Petroleum Engineering",
      "Computer Engineering",
      "Agricultural Engineering",
      "Metallurgical Engineering",
      "Aerospace Engineering",
      "Biomedical Engineering",
      "Environmental Engineering",
      "Industrial Engineering",
      "Materials Engineering",
      "Nuclear Engineering",
      "Software Engineering",
      "Systems Engineering",
      "Mechatronics Engineering",
      "Automotive Engineering",
      "Robotics Engineering",
      "Marine Engineering",
      "Mining Engineering",
      "Structural Engineering",
      "Telecommunications Engineering",
      "Geotechnical Engineering",
      "Power Engineering",
      "Data Engineering",
    ],

    icon: AcademicCapIcon,
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-50 to-cyan-50",
  },
  {
    label: "Industry Tools & Technologies",
    value: [
      // Design & CAD Software
      "MATLAB",
      "AutoCAD",
      "SolidWorks",
      "Fusion 360",
      "Inventor",
      "CATIA",
      "Creo",
      "Rhino",
      "SketchUp",
      "FreeCAD",
      "OnShape",

      // Simulation & Analysis
      "ANSYS",
      "COMSOL Multiphysics",
      "Abaqus",
      "NX Nastran",
      "LS-DYNA",
      "SIMULINK",
      "OpenFOAM",
      "STAR-CCM+",
      "FLUENT",
      "Maxwell",

      // Electrical & Electronics
      "ETAP",
      "Proteus",
      "Altium Designer",
      "Eagle PCB",
      "KiCad",
      "OrCAD",
      "PSCAD",
      "PowerWorld",
      "SPICE",
      "Multisim",
      "LTspice",
      "Cadence",

      // Architecture & Construction
      "Revit",
      "ArchiCAD",
      "Bentley MicroStation",
      "Tekla Structures",
      "Civil 3D",
      "SAP2000",
      "Robot Structural Analysis",
      "Navisworks",

      // Programming Languages
      "Python",
      "C++",
      "C",
      "Java",
      "JavaScript",
      "R",
      "SQL",
      "LabVIEW",
      "Ladder Logic",
      "VHDL",
      "Verilog",
      "Assembly",

      // Manufacturing & Production
      "Mastercam",
      "SolidCAM",
      "NX CAM",
      "HSMWorks",
      "PowerMill",
      "FeatureCAM",
      "Edgecam",
      "GibbsCAM",

      // Project Management & Collaboration
      "Microsoft Project",
      "Primavera P6",
      "Jira",
      "Trello",
      "Asana",
      "Monday.com",
      "Gantt Project",
      "Smartsheet",

      // Data Analysis & Visualization
      "Excel",
      "Tableau",
      "Power BI",
      "Minitab",
      "JMP",
      "Origin",
      "GraphPad Prism",
      "SAS",
      "SPSS",

      // Version Control & Development
      "Git",
      "GitHub",
      "GitLab",
      "Bitbucket",
      "SVN",
      "Perforce",

      // Cloud & DevOps
      "AWS",
      "Azure",
      "Google Cloud",
      "Docker",
      "Kubernetes",
      "Jenkins",
      "Terraform",
      "Ansible",

      // Specialized Engineering Tools
      "ETABS",
      "SAFE",
      "PLAXIS",
      "GeoStudio",
      "HEC-RAS",
      "EPANET",
      "HOMER",
      "PVsyst",
      "WindPRO",
      "PDMS",
      "AutoPIPE",
      "Caesar II",
    ],
    icon: ComputerDesktopIcon,
    gradient: "from-purple-500 to-indigo-500",
    bgGradient: "from-purple-50 to-indigo-50",
  },
  {
    label: "Core Values",
    value: [
      "Faith-Based Foundation",
      "Academic Excellence",
      "Community Service",
      "Innovation",
    ],
    icon: HeartIcon,
    gradient: "from-rose-500 to-pink-500",
    bgGradient: "from-rose-50 to-pink-50",
  },
];

export default function AboutSection() {
  const [showAllDisciplines, setShowAllDisciplines] = useState(false);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: ["easeOut"] },
    },
  };

  return (
    <section id="about" className="relative py-20 md:py-32 overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/40"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.05),transparent_50%)]"></div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20"
        >
          <motion.div>
            <span className="inline-flex items-center gap-2 text-conces-blue font-semibold text-sm uppercase tracking-wider mb-4 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
              <SparklesIcon className="h-4 w-4" />
              Who We Are
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              About{" "}
              <span className="bg-gradient-to-r from-conces-blue to-blue-600 bg-clip-text text-transparent">
                CONCES
              </span>
            </h2>
            <div className="flex justify-center">
              <div className="h-1.5 w-24 bg-gradient-to-r from-conces-blue to-conces-green rounded-full"></div>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center mb-20">
          {/* Left Side - Mission Statement */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Decorative Elements */}
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl rotate-12"></div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl -rotate-12"></div>

            <div className="relative bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-3xl shadow-xl border border-white/20">
              <div className="mb-8">
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  The Unified Voice of{" "}
                  <span className="bg-gradient-to-r from-conces-blue to-blue-600 bg-clip-text text-transparent">
                    Christian Engineering
                  </span>{" "}
                  Students
                </h3>
                <div className="h-1 w-16 bg-gradient-to-r from-conces-green to-emerald-500 rounded-full"></div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-2 h-2 bg-conces-blue rounded-full mt-3"></div>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    The Conference of Nigerian Christian Engineering Students
                    (CONCES) is the unified voice of Christian engineering and
                    technology students across Nigeria.
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-2 h-2 bg-conces-green rounded-full mt-3"></div>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    Our mission is to empower the next generation of Nigerian
                    engineers through collaborative projects, comprehensive
                    skill development programs, and strategic industry
                    connections that prepare students for the dynamic challenges
                    of tomorrow's technological landscape.
                  </p>
                </div>
              </div>

              {/* Call to Action */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <RocketLaunchIcon className="h-5 w-5 text-conces-blue" />
                  <span className="font-medium">
                    Building Nigeria's Engineering Future
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Achievement Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Feature Cards */}
            <div className="grid gap-5">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;

                // For Engineering Disciplines, show only 10 items initially
                const displayItems =
                  stat.label === "Engineering Disciplines"
                    ? showAllDisciplines
                      ? stat.value
                      : stat.value.slice(0, 10)
                    : stat.value;

                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className={`group relative bg-gradient-to-br ${stat.bgGradient} p-6 rounded-2xl shadow-lg border border-white/30 hover:shadow-2xl transition-all duration-500 overflow-hidden`}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative">
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className={`p-3 bg-gradient-to-r ${stat.gradient} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg">
                          {stat.label}
                        </h4>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {displayItems.map((item, itemIndex) => (
                          <span
                            key={itemIndex}
                            className="inline-block px-3 py-1 bg-white/60 text-gray-700 text-sm font-medium rounded-full border border-white/40 hover:bg-white/80 transition-colors"
                          >
                            {item}
                          </span>
                        ))}
                      </div>

                      {/* Show More/Less button for Engineering Disciplines */}
                      {stat.label === "Engineering Disciplines" &&
                        stat.value.length > 10 && (
                          <div className="mt-4 text-center">
                            <button
                              onClick={() =>
                                setShowAllDisciplines(!showAllDisciplines)
                              }
                              className="inline-flex items-center gap-1 text-conces-blue text-sm font-medium hover:text-blue-700 transition-colors"
                            >
                              {showAllDisciplines ? (
                                <>
                                  <ChevronUpIcon className="h-4 w-4" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDownIcon className="h-4 w-4" />
                                  See More ({stat.value.length - 10} more)
                                </>
                              )}
                            </button>
                          </div>
                        )}
                    </div>
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
