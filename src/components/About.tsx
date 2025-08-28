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
  CheckCircleIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { JSX, useState } from "react";

// Type definitions
interface StatItem {
  id: string;
  label: string;
  value: string[];
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  gradient: string;
  bgGradient: string;
  borderGradient: string;
  initialShow: number;
}

interface Achievement {
  number: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface ExpandedSections {
  [key: string]: boolean;
}

const stats: StatItem[] = [
  {
    id: "disciplines",
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
    borderGradient: "from-blue-200 to-cyan-200",
    initialShow: 8,
  },
  {
    id: "tools",
    label: "Industry Tools & Technologies",
    value: [
      "MATLAB",
      "AutoCAD",
      "SolidWorks",
      "Fusion 360",
      "ANSYS",
      "Python",
      "C++",
      "Java",
      "JavaScript",
      "R",
      "SQL",
      "LabVIEW",
      "Revit",
      "ArchiCAD",
      "Civil 3D",
      "SAP2000",
      "ETAP",
      "Proteus",
      "Altium Designer",
      "KiCad",
      "COMSOL Multiphysics",
      "Abaqus",
      "NX Nastran",
      "LS-DYNA",
      "SIMULINK",
      "OpenFOAM",
      "STAR-CCM+",
      "FLUENT",
      "Maxwell",
      "Eagle PCB",
      "OrCAD",
      "PSCAD",
      "PowerWorld",
      "SPICE",
      "Multisim",
      "LTspice",
      "Cadence",
      "Bentley MicroStation",
      "Tekla Structures",
      "Robot Structural Analysis",
      "Navisworks",
      "Ladder Logic",
      "VHDL",
      "Verilog",
      "Assembly",
      "Mastercam",
      "SolidCAM",
      "NX CAM",
      "HSMWorks",
      "PowerMill",
      "FeatureCAM",
      "Edgecam",
      "GibbsCAM",
      "Microsoft Project",
      "Primavera P6",
      "Jira",
      "Trello",
      "Asana",
      "Monday.com",
      "Excel",
      "Tableau",
      "Power BI",
      "Minitab",
      "JMP",
      "Origin",
      "GraphPad Prism",
      "SAS",
      "SPSS",
      "Git",
      "GitHub",
      "GitLab",
      "Bitbucket",
      "AWS",
      "Azure",
      "Google Cloud",
      "Docker",
      "Kubernetes",
      "Jenkins",
      "Terraform",
      "Ansible",
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
      "Inventor",
      "CATIA",
      "Creo",
      "Rhino",
      "SketchUp",
      "FreeCAD",
      "OnShape",
    ],
    icon: ComputerDesktopIcon,
    gradient: "from-purple-500 to-indigo-500",
    bgGradient: "from-purple-50 to-indigo-50",
    borderGradient: "from-purple-200 to-indigo-200",
    initialShow: 12,
  },
  {
    id: "values",
    label: "Core Values",
    value: [
      "Faith-Based Foundation",
      "Academic Excellence",
      "Community Service",
      "Innovation & Creativity",
      "Integrity & Ethics",
      "Collaboration",
      "Leadership Development",
      "Social Impact",
    ],
    icon: HeartIcon,
    gradient: "from-rose-500 to-pink-500",
    bgGradient: "from-rose-50 to-pink-50",
    borderGradient: "from-rose-200 to-pink-200",
    initialShow: 8,
  },
];

const achievements: Achievement[] = [
  { number: "50+", label: "Partner Institutions", icon: UserGroupIcon },
  { number: "10,000+", label: "Active Members", icon: UserGroupIcon },
  { number: "100+", label: "Annual Events", icon: SparklesIcon },
  { number: "500+", label: "Industry Partners", icon: RocketLaunchIcon },
];

export default function AboutSection(): JSX.Element {
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>(
    {}
  );

  const toggleSection = (sectionId: string): void => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section
      id="about"
      className="relative py-16 sm:py-20 md:py-32 overflow-hidden"
    >
      {/* Enhanced Background with Animated Gradients */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/40"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.08),transparent_50%)]"></div>

        {/* Animated Orbs */}
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <motion.div>
            <span className="inline-flex items-center gap-2 text-conces-blue font-semibold text-xs sm:text-sm uppercase tracking-wider mb-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 rounded-full border border-blue-100">
              <SparklesIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              Who We Are
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              About{" "}
              <span className="bg-gradient-to-r from-conces-blue to-blue-600 bg-clip-text text-transparent">
                CONCES
              </span>
            </h2>
            <div className="flex justify-center">
              <div className="h-1 sm:h-1.5 w-20 sm:w-24 bg-gradient-to-r from-conces-blue to-conces-green rounded-full"></div>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-start mb-16 sm:mb-20">
          {/* Left Side - Mission Statement */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="relative lg:sticky lg:top-8"
          >
            {/* Decorative Elements */}
            <div className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl rotate-12 hidden sm:block"></div>
            <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl -rotate-12 hidden sm:block"></div>

            <div className="relative bg-white/90 backdrop-blur-sm p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl shadow-xl border border-white/50">
              <div className="mb-6 sm:mb-8">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
                  The Unified Voice of{" "}
                  <span className="bg-gradient-to-r from-conces-blue to-blue-600 bg-clip-text text-transparent">
                    Christian Engineering
                  </span>{" "}
                  Students
                </h3>
                <div className="h-1 w-12 sm:w-16 bg-gradient-to-r from-conces-green to-emerald-500 rounded-full"></div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <CheckCircleIcon className="flex-shrink-0 h-5 w-5 sm:h-6 sm:w-6 text-conces-blue mt-0.5" />
                  <p className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed">
                    The Conference of Nigerian Christian Engineering Students
                    (CONCES) serves as the unified platform for Christian
                    engineering and technology students across Nigeria's higher
                    institutions.
                  </p>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <CheckCircleIcon className="flex-shrink-0 h-5 w-5 sm:h-6 sm:w-6 text-conces-green mt-0.5" />
                  <p className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed">
                    We empower the next generation through collaborative
                    projects, comprehensive skill development, and strategic
                    industry connections that prepare students for tomorrow's
                    technological challenges.
                  </p>
                </div>
              </div>

              {/* Call to Action */}
              <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                  <RocketLaunchIcon className="h-4 w-4 sm:h-5 sm:w-5 text-conces-blue" />
                  <span className="font-medium">
                    Building Nigeria's Engineering Future Together
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Feature Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-6 sm:space-y-8"
          >
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              const isExpanded = expandedSections[stat.id];
              const displayItems = isExpanded
                ? stat.value
                : stat.value.slice(0, stat.initialShow);
              const hasMore = stat.value.length > stat.initialShow;

              return (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`group relative bg-gradient-to-br ${stat.bgGradient} p-5 sm:p-6 rounded-2xl shadow-lg border border-gradient-to-r ${stat.borderGradient} hover:shadow-2xl transition-all duration-500`}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 rounded-2xl bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-center gap-3 sm:gap-4 mb-4">
                      <div
                        className={`p-2.5 sm:p-3 bg-gradient-to-r ${stat.gradient} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-base sm:text-lg">
                          {stat.label}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {stat.value.length}{" "}
                          {stat.id === "values" ? "principles" : "options"}
                        </p>
                      </div>
                    </div>

                    {/* Tags Grid */}
                    <AnimatePresence mode="sync">
                      <motion.div
                        className="flex flex-wrap gap-1.5 sm:gap-2"
                        layout
                      >
                        {displayItems.map((item, itemIndex) => (
                          <motion.span
                            key={item}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{
                              duration: 0.2,
                              delay: itemIndex * 0.02,
                            }}
                            className="inline-block px-2 sm:px-3 py-1 sm:py-1.5 bg-white/70 backdrop-blur-sm text-gray-700 text-xs sm:text-sm font-medium rounded-full border border-white/60 hover:bg-white/90 hover:shadow-md transition-all duration-200 cursor-default"
                          >
                            {item}
                          </motion.span>
                        ))}
                      </motion.div>
                    </AnimatePresence>

                    {/* Show More/Less Button */}
                    {hasMore && (
                      <motion.div
                        className="mt-4 flex justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <button
                          onClick={() => toggleSection(stat.id)}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-full transition-all duration-300 transform hover:scale-105 ${
                            isExpanded
                              ? "bg-white/80 text-gray-700 hover:bg-white/90"
                              : "bg-gradient-to-r " +
                                stat.gradient +
                                " text-white hover:shadow-lg"
                          }`}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUpIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                              Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDownIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                              View All ({stat.value.length - stat.initialShow}{" "}
                              more)
                            </>
                          )}
                        </button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
