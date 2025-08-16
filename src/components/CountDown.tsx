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
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [contestStatus, setContestStatus] = useState<
    "upcoming" | "running" | "ended"
  >("upcoming");

  useEffect(() => {
    const contestStartDate = new Date("2025-08-05T00:00:00");
    const contestEndDate = new Date("2025-08-20T23:59:59");

    const calculateTimeLeft = () => {
      const now = new Date();

      // Determine contest status
      if (now < contestStartDate) {
        // Contest hasn't started yet - countdown to start
        setContestStatus("upcoming");
        const difference = contestStartDate.getTime() - now.getTime();

        if (difference > 0) {
          return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor(
              (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            ),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000),
          };
        }
      } else if (now >= contestStartDate && now <= contestEndDate) {
        // Contest is currently running - countdown to end
        setContestStatus("running");
        const difference = contestEndDate.getTime() - now.getTime();

        if (difference > 0) {
          return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor(
              (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            ),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000),
          };
        }
      } else {
        // Contest has ended
        setContestStatus("ended");
      }

      // Default return for ended contest
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    };

    // Set initial time
    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getDisplayText = () => {
    switch (contestStatus) {
      case "upcoming":
        return {
          mobile: "Contest Starts In...",
          tablet: "Challenge Starts In...",
          desktop: "Logo Rebrand Challenge Starts In...",
        };
      case "running":
        return {
          mobile: "Contest Ends In...",
          tablet: "Challenge Ends In...",
          desktop: "Logo Rebrand Challenge Ends In...",
        };
      case "ended":
        return {
          mobile: "Contest Ended",
          tablet: "Challenge Ended",
          desktop: "Logo Rebrand Challenge Has Ended",
        };
      default:
        return {
          mobile: "Contest Info",
          tablet: "Challenge Info",
          desktop: "Logo Rebrand Challenge Info",
        };
    }
  };

  const displayText = getDisplayText();

  if (contestStatus === "ended") {
    return (
      <section className="bg-gradient-to-r from-conces-blue to-conces-blue/90 py-4 sm:py-6 md:py-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-center items-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white text-center"
            >
              {displayText.desktop}
            </motion.h2>
          </div>
        </div>
      </section>
    );
  }

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
            <span className="block sm:hidden">{displayText.mobile}</span>
            <span className="hidden sm:block md:hidden">
              {displayText.tablet}
            </span>
            <span className="hidden md:block">{displayText.desktop}</span>
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
