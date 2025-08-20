"use client";

import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IconType } from "react-icons";
import {
  FaUserPlus,
  FaPenSquare,
  FaTrophy,
  FaShare,
  FaStar,
  FaCrown,
  FaMedal,
  FaAward,
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
  icon: IconType;
}

const CONTEST_DATA = {
  title: "CONCES Brand Challenge",
  subtitle:
    "Join our exclusive design competition platform where you can submit your visionary rebrand concepts and compete for amazing prizes.",
  url: "brandchallenge.conces.org",
  mainCTA: {
    title: "Redesign the Future of CONCES — Win ₦400,000",
    subtitle:
      "Open to all engineering and tech students across Nigeria. Showcase your creativity. Lead the transformation.",
  },
  steps: [
    {
      icon: FaUserPlus,
      title: "Join Contest",
      description: "Get your contest package",
      color: "blue",
    },
    {
      icon: FaPenSquare,
      title: "Create",
      description: "Design your submission",
      color: "green",
    },
    {
      icon: FaTrophy,
      title: "Compete",
      description: "Become a finalist",
      color: "gold",
    },
    {
      icon: FaShare,
      title: "Promote",
      description: "Share for votes",
      color: "blue",
    },
    {
      icon: FaStar,
      title: "Win",
      description: "Present and claim prizes",
      color: "green",
    },
  ] as Step[],
  prizes: [
    {
      place: "Grand Prize",
      amount: "₦400,000",
      bonus: "National Recognition + Trophy",
      gradient: "from-conces-gold to-yellow-600",
      icon: FaCrown,
    },
    {
      place: "2nd Place",
      amount: "₦150,000",
      bonus: "Certificate of Excellence",
      gradient: "from-conces-blue/80 to-conces-blue",
      icon: FaMedal,
    },
    {
      place: "3rd Place",
      amount: "₦100,000",
      bonus: "Certificate of Excellence",
      gradient: "from-conces-green to-conces-green/90",
      icon: FaAward,
    },
  ] as Prize[],
  consolation: {
    title: "Finalist Awards",
    amount: "₦50,000",
    count: 7,
  },
};

export default function Contests() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-conces-blue/5">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
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
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
        >
          <BrowserHeader url={CONTEST_DATA.url} />

          <div className="p-8 md:p-12">
            <SplitHero />
            <CTASection {...CONTEST_DATA.mainCTA} showIntro={true} />
            <StepsSection steps={CONTEST_DATA.steps} />
            <CTASection {...CONTEST_DATA.mainCTA} showButton />

            <PrizesSection
              prizes={CONTEST_DATA.prizes}
              consolation={CONTEST_DATA.consolation}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Sub-components
function BrowserHeader({ url }: { url: string }) {
  return (
    <div className="bg-gradient-to-r from-conces-blue to-conces-blue/90 text-white p-4 flex items-center">
      <div className="flex space-x-2">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
      </div>
      <div className="ml-4 text-sm font-medium">{url}</div>
    </div>
  );
}

function SplitHero() {
  return (
    <div className="flex flex-col md:flex-row mb-12 rounded-xl overflow-hidden border border-gray-200">
      <div className="md:w-1/2 p-8 bg-conces-blue/5">
        <div className="text-center">
          <p className="mb-4 text-conces-blue font-medium">Current Brand</p>
          <div className="w-40 h-40 mx-auto bg-white p-2 rounded-xl shadow-md flex itemgs-center justify-center border-2 border-conces-blue/20">
            <Image
              src={"/images/logo.png"}
              width={250}
              height={250}
              alt="current logo"
            />
          </div>
        </div>
      </div>
      <div className="md:w-1/2 p-8 bg-gradient-to-br from-conces-blue/5 to-conces-green/10">
        <div className="text-center">
          <p className="mb-4 text-conces-blue font-medium">Your Vision Here</p>
          <motion.div
            className="w-40 h-40 mx-auto rounded-xl bg-gradient-to-br from-conces-gold/10 to-conces-green/10 flex items-center justify-center border-2 border-dashed border-conces-gold/50"
            animate={{
              scale: [1, 1.02, 1],
              borderColor: [
                "rgba(255,195,0,0.5)",
                "rgba(255,195,0,0.8)",
                "rgba(255,195,0,0.5)",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <span className="text-5xl text-conces-gold">?</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function CTASection({
  title,
  subtitle,
  showIntro,
  showButton,
}: {
  title: string;
  subtitle: string;
  showIntro?: boolean;
  showButton?: boolean;
}) {
  return (
    <div className="text-center mb-16">
      {showIntro && (
        <div>
          <h3 className="text-3xl font-bold text-conces-blue mb-4">{title}</h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </div>
      )}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-8 inline-block"
      >
        {showButton && (
          <Link
            href="/signup"
            className="bg-gradient-to-r from-conces-green to-conces-blue text-white px-8 py-3 rounded-lg font-bold text-lg inline-flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Register Now <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Link>
        )}
      </motion.div>
    </div>
  );
}

function StepsSection({ steps }: { steps: Step[] }) {
  return (
    <div id="how" className="mb-16">
      <h3 className="text-2xl font-bold text-center text-conces-blue mb-10">
        How It Works
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const colorMap = {
            blue: "conces-blue",
            green: "conces-green",
            gold: "conces-gold",
          };
          const colorClass =
            colorMap[step.color as keyof typeof colorMap] || "conces-blue";

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
              viewport={{ once: true }}
              className={`bg-white p-6 rounded-xl shadow-sm text-center border-t-4 border-${colorClass}`}
            >
              <div
                className={`w-12 h-12 rounded-full bg-${colorClass}/10 flex items-center justify-center mx-auto mb-4`}
              >
                <Icon className={`text-${colorClass}`} size={24} />
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
    <div className="mb-8">
      <h3 className="text-2xl font-bold text-center text-conces-blue mb-10">
        Prize Breakdown
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-12">
        {prizes.map((prize, index) => {
          const Icon = prize.icon;
          return (
            <motion.div
              key={prize.place}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className={`p-8 rounded-xl text-center text-white shadow-lg ${
                index === 0
                  ? "bg-gradient-to-br from-conces-gold to-yellow-600"
                  : index === 1
                  ? "bg-gradient-to-br from-conces-blue to-conces-blue/90"
                  : "bg-gradient-to-br from-conces-green to-conces-green/90"
              }`}
            >
              <div className="flex justify-center mb-4">
                <Icon className="w-10 h-10" />
              </div>
              <div className="text-2xl font-bold mb-2">{prize.place}</div>
              <motion.div
                className="text-4xl font-extrabold mb-4"
                animate={{
                  scale: [1, 1.05, 1],
                  textShadow: [
                    "0 0 8px rgba(255,255,255,0.3)",
                    "0 0 16px rgba(255,255,255,0.5)",
                    "0 0 8px rgba(255,255,255,0.3)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {prize.amount}
              </motion.div>
              <p className="text-sm font-medium">{prize.bonus}</p>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-conces-blue/5 to-conces-green/5 p-6 rounded-xl border border-conces-blue/20 text-center"
      >
        <h4 className="text-lg font-bold text-conces-blue mb-2">
          {consolation.count} {consolation.title}
        </h4>
        <p className="text-conces-blue font-medium">
          Each receiving {consolation.amount}
        </p>
      </motion.div>
    </div>
  );
}
