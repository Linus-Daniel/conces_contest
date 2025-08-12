"use client";

import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import Link from "next/link";
import { IconType } from "react-icons";
import {
  FaUserPlus,
  FaPenSquare,
  FaTrophy,
  FaShare,
  FaStar,
} from "react-icons/fa";

interface Step {
  icon: IconType;
  title: string;
  description: string;
  color: string;
}

interface Prize {
  place: string;
  amount: string;
  bonus: string;
  gradient: string;
  icon?: string;
}

const CONTEST_DATA = {
  title: "Brand Challenge Platform",
  subtitle:
    "Take a peek at our dedicated contest platform where you can submit your designs and compete for the grand prize.",
  url: "brandchallenge.conces.org",
  mainCTA: {
    title: "Redesign the Face of CONCES — and Win ₦500,000",
    subtitle:
      "Open to every engineering and tech student in Nigeria. Submit your vision. Inspire a movement.",
  },
  steps: [
    {
      icon: FaUserPlus,
      title: "Sign Up",
      description: "Get your contest pack",
      color: "blue",
    },
    {
      icon: FaPenSquare,
      title: "Design & Submit",
      description: "Show us your vision",
      color: "green",
    },
    {
      icon: FaTrophy,
      title: "Get Selected",
      description: "Be one of the finalists",
      color: "yellow",
    },
    {
      icon: FaShare,
      title: "Go Viral",
      description: "Share and get votes",
      color: "purple",
    },
    {
      icon: FaStar,
      title: "Win Big",
      description: "Present live and win",
      color: "red",
    },
  ] as Step[],
  prizes: [
    {
      place: "1st Place",
      amount: "₦500,000",
      bonus: "+ National Recognition",
      gradient: "from-conces-gold to-yellow-600",
      icon: "🥇",
    },
    {
      place: "2nd Place",
      amount: "₦150,000",
      bonus: "+ Certificate of Excellence",
      gradient: "from-gray-300 to-gray-500",
      icon: "🥈",
    },
    {
      place: "3rd Place",
      amount: "₦100,000",
      bonus: "+ Certificate of Excellence",
      gradient: "from-amber-700 to-amber-900",
      icon: "🥉",
    },
  ] as Prize[],
  consolation: {
    title: "Finalist Consolations",
    amount: "₦50,000",
    count: 7,
  },
};

export default function Contests() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-conces-blue mb-4">
            {CONTEST_DATA.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {CONTEST_DATA.subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="bg-gray-50 rounded-2xl shadow-xl overflow-hidden"
        >
          <BrowserHeader url={CONTEST_DATA.url} />

          <div className="p-10">
            <SplitHero />
            <CTASection {...CONTEST_DATA.mainCTA} />
            <StepsSection steps={CONTEST_DATA.steps} />
            <PrizesSection
              prizes={CONTEST_DATA.prizes}
              consolation={CONTEST_DATA.consolation}
            />
            <CTAButton />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Sub-components
function BrowserHeader({ url }: { url: string }) {
  return (
    <div className="bg-conces-blue text-white p-4 flex items-center">
      <div className="flex space-x-2">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
      </div>
      <div className="ml-4 text-sm">{url}</div>
    </div>
  );
}

function SplitHero() {
  return (
    <div className="flex flex-col md:flex-row mb-10 rounded-xl overflow-hidden">
      <div className="md:w-1/2 p-8 bg-gray-100">
        <div className="text-center">
          <p className="mb-4 text-gray-700 font-medium">Current Logo</p>
          <div className="w-32 h-32 mx-auto bg-white rounded-lg shadow-md flex items-center justify-center">
            <span className="text-2xl font-bold text-conces-blue">CONCES</span>
          </div>
        </div>
      </div>
      <div className="md:w-1/2 p-8 bg-gradient-to-br from-conces-blue/10 to-conces-green/10">
        <div className="text-center">
          <p className="mb-4 text-gray-700 font-medium">Your Design Here</p>
          <div className="w-32 h-32 mx-auto rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-5xl">?</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CTASection({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center mb-16">
      <h3 className="text-3xl font-bold text-conces-blue mb-4">{title}</h3>
      <p className="text-lg text-gray-600">{subtitle}</p>
    </div>
  );
}

function StepsSection({ steps }: { steps: Step[] }) {
  return (
    <div className="mb-16">
      <h3 className="text-2xl font-bold text-center text-conces-blue mb-10">
        How It Works
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white p-6 rounded-xl shadow-sm text-center"
            >
              <div className="w-12 h-12 rounded-full bg-conces-blue/10 flex items-center justify-center mx-auto mb-4">
                <Icon className="text-conces-blue" size={24} />
              </div>
              <div className="font-bold text-lg mb-2">
                {index + 1}. {step.title}
              </div>
              <p className="text-sm text-gray-600">{step.description}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function PrizesSection({
  prizes,
  consolation,
}: {
  prizes: Prize[];
  consolation: { title: string; amount: string; count: number };
}) {
  return (
    <div className="mb-16 ">
      <h3 className="text-2xl font-bold text-center text-conces-blue mb-10">
        Prize Breakdown
      </h3>

      {/* Prize Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
        className="mt-16  bg-gradient-to-r from-conces-blue to-conces-blue/90 p-5 rounded-md grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {prizes.map((prize, index) => (
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
  );
}

function CTAButton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <Link
        href="/signup"
        className="bg-conces-green text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl inline-flex items-center group"
      >
        Visit Contest Platform
        <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
      </Link>
    </motion.div>
  );
}






















 