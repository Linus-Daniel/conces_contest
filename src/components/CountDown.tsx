"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 30,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30);

    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        ),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-gradient-to-r from-conces-blue to-conces-blue/90 py-4 sm:py-6 md:py-8">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col space-y-4 sm:space-y-6 md:flex-row md:justify-between md:items-center md:space-y-0">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-white text-center md:text-left"
          >
            <span className="block sm:hidden">Contest Closes In...</span>
            <span className="hidden sm:block md:hidden">
              Challenge Closes In...
            </span>
            <span className="hidden md:block">
              Logo Rebrand Challenge Closes In...
            </span>
          </motion.h2>

          <div className="flex justify-center space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-6">
            {Object.entries(timeLeft).map(([unit, value], index) => (
              <motion.div
                key={unit}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-white/10 rounded-md sm:rounded-lg px-2 py-2 w-12 sm:w-14 md:w-16 lg:w-20 sm:px-3 sm:py-3 md:px-4 md:py-3">
                  <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-conces-gold block">
                    {value}
                  </span>
                </div>
                <span className="text-white/80 text-xs sm:text-sm mt-1 block capitalize">
                  {unit}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
