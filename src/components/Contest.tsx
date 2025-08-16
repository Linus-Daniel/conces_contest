"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRightIcon,
  TrophyIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { FaMedal, FaTrophy, FaCrown } from "react-icons/fa";
import { GiCash, GiCrownCoin, GiGoldBar } from "react-icons/gi";
import { ComponentType } from "react";

interface FloatingRewardProps {
  icon: ComponentType<{ className?: string }>;
  delay?: number;
  duration?: number;
}

export default function ContestSection() {
  return (
    <section
      id="challenge"
      className="relative py-24 overflow-hidden bg-gradient-to-br from-conces-blue to-conces-blue/90 text-white"
    >
      {/* Floating elements */}
      <FloatingReward icon={GiCash} delay={0} />
      <FloatingReward icon={FaCrown} delay={1} />
      <FloatingReward icon={GiGoldBar} delay={1.5} />
      <FloatingReward icon={FaTrophy} delay={2} />
      <FloatingReward icon={SparklesIcon} delay={2.5} />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="lg:w-2/3"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-flex items-center mb-6 px-4 py-2 bg-conces-gold/20 rounded-full border border-conces-gold/30"
            >
              <SparklesIcon className="w-5 h-5 mr-2 text-conces-gold" />
              <span className="font-medium text-conces-gold">
                National Competition
              </span>
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Over <span className="text-conces-gold">₦1,000,000</span> in
              Prizes.
              <br />
              <span className="bg-gradient-to-r from-conces-gold to-conces-green bg-clip-text text-transparent">
                1 National Stage.
              </span>
            </h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
              className="text-xl md:text-2xl mb-8 max-w-2xl"
            >
              The CONCES Logo Rebrand Challenge is your opportunity to make
              history. Design the new face of Christain Engineering and
              Technology students in Nigeria and win life-changing prizes!
            </motion.p>

            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                viewport={{ once: true }}
              >
                <Link
                  href="/signup"
                  className="bg-gradient-to-r from-conces-green to-conces-blue hover:from-conces-green/90 hover:to-conces-blue/90 text-white px-8 py-4 rounded-xl font-bold text-lg inline-flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Enter the Challenge
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                viewport={{ once: true }}
              ></motion.div>
            </div>

            {/* Prize highlights */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              viewport={{ once: true }}
              className="mt-12 flex flex-wrap gap-4"
            >
              {[
                { icon: FaCrown, text: "₦500K Grand Prize" },
                { icon: FaMedal, text: "₦150K Runner-up" },
                { icon: FaTrophy, text: "₦100K 3rd Place" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center bg-conces-blue/50 px-4 py-2 rounded-lg border border-conces-blue/70"
                >
                  <item.icon className="w-5 h-5 mr-2 text-conces-gold" />
                  <span>{item.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Prize visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="lg:w-1/3 flex justify-center relative"
          >
            <div className="relative w-72 h-72">
              {/* Pulsing circles */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-conces-gold/10 rounded-full"
              />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 0.9, 0.6],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="absolute inset-4 bg-conces-gold/20 rounded-full"
              />

              {/* Main prize display */}
              <div className="absolute inset-8 bg-gradient-to-br from-conces-gold to-yellow-600 rounded-full flex flex-col items-center justify-center shadow-xl">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="text-center"
                >
                  <div className="text-5xl font-bold mb-2">₦500K</div>
                  <div className="text-xl font-medium">Grand Prize</div>
                  <FaCrown className="w-10 h-10 mx-auto mt-4 text-white" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const FloatingReward: React.FC<FloatingRewardProps> = ({
  icon: Icon,
  delay = 0,
  duration = 4,
}) => {
  return (
    <motion.div
      className="absolute text-conces-gold"
      initial={{
        y: Math.random() * 200 + 100,
        x: Math.random() * 300 + 50,
        opacity: 0,
        scale: 0,
      }}
      animate={{
        y: Math.random() * 150 + 50,
        x: Math.random() * 400 + 100,
        opacity: [0, 1, 1, 0],
        scale: [0, 1.2, 1, 0],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 5 + 3,
      }}
    >
      <Icon className="w-8 h-8" />
    </motion.div>
  );
};
