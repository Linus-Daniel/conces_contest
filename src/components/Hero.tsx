"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRightIcon,
  StarIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { FaMedal, FaTrophy, FaCrown, FaRegGem, FaPray } from "react-icons/fa";
import { GiCash, GiCrownCoin, GiGoldBar } from "react-icons/gi";
import Image from "next/image";
import { ComponentType } from "react";
import CountdownTimer from "./CountDown";

interface FloatingRewardProps {
  icon: ComponentType<{ className?: string }>;
  delay?: number;
  duration?: number;
}

interface Prize {
  icon: ComponentType<{ className?: string }>;
  title: string;
  value: string;
  gradient: string;
  border: string;
  iconColor: string;
}

interface PrizeCardProps {
  prize: Prize;
  delay?: number;
}

interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

const FloatingReward: React.FC<FloatingRewardProps> = ({
  icon: Icon,
  delay = 0,
  duration = 4,
}) => {
  return (
    <motion.div
      className="absolute text-conces-gold pointer-events-none"
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
        scale: [0, 1.5, 1.2, 0],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 5 + 3,
      }}
    >
      <Icon className="w-6 h-6 sm:w-8 sm:h-8 drop-shadow-lg" />
    </motion.div>
  );
};

const PrizeCard: React.FC<PrizeCardProps> = ({ prize, delay = 0 }) => {
  const IconComponent = prize.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={`bg-gradient-to-br ${prize.gradient} rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${prize.border} relative overflow-hidden`}
    >
      <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 opacity-20">
        <IconComponent className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16" />
      </div>
      <div className="text-center relative z-10">
        <div className="flex justify-center mb-1 sm:mb-2">
          <IconComponent
            className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 ${prize.iconColor}`}
          />
        </div>
        <h3 className="text-white font-bold text-sm sm:text-base lg:text-lg mb-1">
          {prize.title}
        </h3>
        <motion.p
          className="text-lg sm:text-xl lg:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-conces-gold/90"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {prize.value}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHoveringPrize, setIsHoveringPrize] = useState(false);

  const testimonials: Testimonial[] = [
    {
      quote: "Winning this contest changed my life! The excitement was unreal!",
      name: "Sarah Johnson",
      role: "Previous Winner",
    },
    {
      quote:
        "The most professional and thrilling contest I've ever participated in!",
      name: "Michael Chen",
      role: "Creative Director",
    },
    {
      quote: "Amazing prizes and the happiest community! Worth every second!",
      name: "Emma Rodriguez",
      role: "Marketing Specialist",
    },
  ];

  const prizes: Prize[] = [
    {
      icon: FaCrown,
      title: "Grand Prize",
      value: "₦500K",
      gradient: "from-conces-blue to-conces-blue/90",
      border: "border-conces-gold",
      iconColor: "text-conces-gold",
    },
    {
      icon: FaTrophy,
      title: "Runner-up",
      value: "₦150K",
      gradient: "from-conces-green to-conces-green/90",
      border: "border-conces-green/80",
      iconColor: "text-conces-gold",
    },
    {
      icon: FaRegGem,
      title: "Third Place",
      value: "₦100K",
      gradient: "from-conces-blue/80 to-conces-blue",
      border: "border-conces-blue/70",
      iconColor: "text-conces-gold",
    },
  ];


  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-gradient-to-b from-conces-blue to-conces-blue/90">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/winner.jpg"
          alt="Happy contest participants celebrating"
          fill
          className="object-cover opacity-60"
          quality={100}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-conces-blue/30 via-conces-blue/70 to-conces-blue/90" />
      </div>

      {/* Floating rewards - hidden on small screens for performance */}
      <div className="hidden sm:block">
        <FloatingReward icon={GiCash} delay={0} />
        <FloatingReward icon={GiGoldBar} delay={1} />
        <FloatingReward icon={FaTrophy} delay={1.5} />
        <FloatingReward icon={GiCrownCoin} delay={2} />
        <FloatingReward icon={SparklesIcon} delay={2.5} />
        <FloatingReward icon={StarIcon} delay={3} />
        <FloatingReward icon={FaCrown} delay={3.5} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10 py-8 sm:py-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Left content */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="flex items-center justify-center lg:justify-start mb-4 sm:mb-6"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                <motion.span
                  className="bg-gradient-to-r from-conces-green to-conces-blue text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wide inline-flex items-center gap-1 sm:gap-2"
                  animate={{
                    boxShadow: [
                      "0 0 8px rgba(0,184,148,0.4)",
                      "0 0 16px rgba(0,43,91,0.6)",
                      "0 0 8px rgba(0,184,148,0.4)",
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <SparklesIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Exclusive Contest</span>
                  <span className="xs:hidden">Contest</span>
                  <SparklesIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                </motion.span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 sm:mb-6"
              >
                Join the <span className="text-conces-gold">CONCES</span>
                <span className="block bg-gradient-to-r from-conces-gold to-conces-green bg-clip-text text-transparent">
                  Rebrand Challenge!
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0"
              >
                Participate in our prestigious rebranding contest for a chance
                to win
                <span className="font-bold text-conces-gold">
                  {" "}
                  life-changing prizes
                </span>{" "}
                and be recognized in our global community of innovators!
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 justify-center lg:justify-start"
              >
                <motion.a
                  className="bg-gradient-to-r from-conces-green to-conces-blue hover:from-conces-green/90 hover:to-conces-blue/90 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg inline-flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl order-1"
                  whileHover={{
                    y: -2,
                    scale: 1.02,
                    boxShadow: "0 10px 25px -5px rgba(0,184,148,0.4)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  href="/signup"
                >
                  <span className="drop-shadow-md">Register Now</span>
                  <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-2 drop-shadow-md" />
                </motion.a>

                <motion.a
                  className="border-2 border-conces-gold text-conces-gold hover:bg-conces-blue/50 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-all duration-300 inline-flex items-center justify-center hover:shadow-lg hover:shadow-conces-gold/20 order-2"
                  whileHover={{ y: -2 }}
                  href="/terms"
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="drop-shadow-md">View Guidelines</span>
                </motion.a>
              </motion.div>

          
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="bg-conces-blue/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-conces-blue/70 hover:border-conces-gold/30 transition-all duration-300"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                   <CountdownTimer />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </div>

          {/* Right side - Prize showcase */}
          <motion.div
            className="w-full lg:w-1/2 max-w-md mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="relative">
              {/* Main prize display */}
              <motion.div
                className="bg-gradient-to-br from-conces-blue to-conces-blue/90 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl border-2 border-conces-gold relative overflow-hidden"
                whileHover={{ y: -5, scale: 1.02 }}
                onHoverStart={() => setIsHoveringPrize(true)}
                onHoverEnd={() => setIsHoveringPrize(false)}
                animate={{
                  boxShadow: isHoveringPrize
                    ? "0 25px 50px -12px rgba(255,195,0,0.3)"
                    : "0 20px 25px -5px rgba(0,43,91,0.3), 0 10px 10px -5px rgba(0,43,91,0.1)",
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 overflow-hidden">
                  {isHoveringPrize && (
                    <motion.div
                      className="absolute inset-0 bg-conces-gold/10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                  <motion.div
                    className="absolute -top-16 sm:-top-20 -right-16 sm:-right-20 opacity-20"
                    animate={{
                      rotate: isHoveringPrize ? 360 : 0,
                      scale: isHoveringPrize ? 1.2 : 1,
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <FaCrown className="w-32 h-32 sm:w-40 sm:h-40 text-conces-gold" />
                  </motion.div>
                </div>

                <div className="text-center relative z-10">
                  <motion.div
                    className="text-5xl sm:text-6xl lg:text-7xl mb-3 sm:mb-4"
                    animate={{
                      y: [0, -5, 0],
                      rotate: [0, 2, -2, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    👑
                  </motion.div>
                  <h2 className="text-white font-bold text-xl sm:text-2xl lg:text-3xl mb-3 sm:mb-4">
                    Grand Prize
                  </h2>
                  <motion.div
                    className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-conces-gold/90"
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    ₦500,000
                  </motion.div>
                  <div className="text-conces-gold text-sm sm:text-base lg:text-lg font-medium mb-4">
                    Plus featured recognition on all our platforms!
                  </div>
                  <motion.div
                    className="mt-4 sm:mt-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <span className="inline-block bg-conces-blue/50 text-conces-gold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold border border-conces-gold/30">
                      💰 Additional Bonus Prizes Available!
                    </span>
                  </motion.div>
                </div>
              </motion.div>

              {/* Smaller prize cards */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8">
                {prizes.slice(1).map((prize, index) => (
                  <PrizeCard
                    key={index}
                    prize={prize}
                    delay={0.5 + index * 0.2}
                  />
                ))}
              </div>

              {/* Additional prizes indicator */}
              <motion.div
                className="mt-3 sm:mt-4 bg-conces-blue/50 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-lg border-2 border-conces-blue/70 flex items-center justify-center hover:border-conces-gold/50 transition-all duration-300"
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-conces-gold">
                    +5
                  </div>
                  <div className="text-blue-200 text-xs sm:text-sm font-medium">
                    More Exciting Prizes!
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>


      {/* Confetti effect on hover over main prize - desktop only */}
      <AnimatePresence>
        {isHoveringPrize && (
          <motion.div
            className="absolute inset-0 pointer-events-none hidden lg:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-conces-gold"
                initial={{
                  y: Math.random() * 100 + 50,
                  x:
                    Math.random() *
                    (typeof window !== "undefined" ? window.innerWidth : 1200),
                  opacity: 0,
                  scale: 0,
                }}
                animate={{
                  y: [0, -100],
                  x: [0, (Math.random() - 0.5) * 100],
                  opacity: [1, 0],
                  scale: [1, 1.5],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  ease: "easeOut",
                }}
              >
                {Math.random() > 0.5 ? (
                  <GiCrownCoin className="w-4 h-4 sm:w-6 sm:h-6" />
                ) : (
                  <GiGoldBar className="w-4 h-4 sm:w-6 sm:h-6" />
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
