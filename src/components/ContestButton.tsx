"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

type ContestPhase =
  | "registration"
  | "contest_running"
  | "contest_ended_waiting"
  | "voting_active"
  | "contest_finished";

interface ButtonConfig {
  text: string;
  href: string;
  variant: "primary" | "secondary" | "disabled";
  showCountdown: boolean;
  countdownLabel: string;
}

export default function DynamicContestButton() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [contestPhase, setContestPhase] =
    useState<ContestPhase>("registration");

  useEffect(() => {
    // Define all the important dates
    const contestStartDate = new Date("2025-08-05T00:00:00");
    const contestEndDate = new Date("2025-08-20T23:59:59");
    const votingStartDate = new Date("2025-08-23T00:00:00"); // 3 days after contest ends
    const votingEndDate = new Date("2025-08-30T23:59:59"); // 7 days of voting

    const calculateTimeAndPhase = () => {
      const now = new Date();

      if (now < contestStartDate) {
        // Registration phase - countdown to contest start
        setContestPhase("registration");
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
        // Contest is running - countdown to contest end
        setContestPhase("contest_running");
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
      } else if (now > contestEndDate && now < votingStartDate) {
        // Contest ended, waiting for voting to start
        setContestPhase("contest_ended_waiting");
        const difference = votingStartDate.getTime() - now.getTime();

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
      } else if (now >= votingStartDate && now <= votingEndDate) {
        // Voting is active - countdown to voting end
        setContestPhase("voting_active");
        const difference = votingEndDate.getTime() - now.getTime();

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
        // Contest completely finished
        setContestPhase("contest_finished");
      }

      // Default return for ended phases
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    // Set initial time and phase
    setTimeLeft(calculateTimeAndPhase());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeAndPhase());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getButtonConfig = (): ButtonConfig => {
    switch (contestPhase) {
      case "registration":
        return {
          text: "Register Now",
          href: "/register",
          variant: "primary",
          showCountdown: true,
          countdownLabel: "Contest Starts In",
        };

      case "contest_running":
        return {
          text: "Submit Entry",
          href: "/submit",
          variant: "primary",
          showCountdown: true,
          countdownLabel: "Contest Ends In",
        };

      case "contest_ended_waiting":
        return {
          text: "Contest Ended - Voting Soon",
          href: "#",
          variant: "secondary",
          showCountdown: true,
          countdownLabel: "Voting Starts In",
        };

      case "voting_active":
        return {
          text: "Vote Now",
          href: "/vote",
          variant: "primary",
          showCountdown: true,
          countdownLabel: "Voting Ends In",
        };

      case "contest_finished":
        return {
          text: "Visit Our Page",
          href: "/results",
          variant: "secondary",
          showCountdown: false,
          countdownLabel: "Contest Finished",
        };

      default:
        return {
          text: "Learn More",
          href: "#",
          variant: "secondary",
          showCountdown: false,
          countdownLabel: "",
        };
    }
  };

  const buttonConfig = getButtonConfig();

  const getButtonStyles = () => {
    const baseStyles =
      "inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2";

    switch (buttonConfig.variant) {
      case "primary":
        return `${baseStyles} bg-conces-gold text-conces-blue hover:bg-conces-gold/90 focus:ring-conces-gold shadow-lg`;

      case "secondary":
        return `${baseStyles} bg-white/10 text-white border border-white/20 hover:bg-white/20 focus:ring-white/50`;

      case "disabled":
        return `${baseStyles} bg-gray-400 text-gray-600 cursor-not-allowed opacity-60`;

      default:
        return baseStyles;
    }
  };

  const formatTime = (time: TimeLeft): string => {
    if (time.days > 0) {
      return `${time.days}d ${time.hours}h ${time.minutes}m`;
    } else if (time.hours > 0) {
      return `${time.hours}h ${time.minutes}m ${time.seconds}s`;
    } else {
      return `${time.minutes}m ${time.seconds}s`;
    }
  };

  const ButtonComponent =
    buttonConfig.variant === "disabled" || buttonConfig.href === "#"
      ? motion.button
      : motion(Link);

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Countdown Display */}
      {buttonConfig.showCountdown &&
        (timeLeft.days > 0 ||
          timeLeft.hours > 0 ||
          timeLeft.minutes > 0 ||
          timeLeft.seconds > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="text-white/80 text-sm mb-2">
              {buttonConfig.countdownLabel}
            </p>
            <div className="flex justify-center space-x-2">
              {Object.entries(timeLeft).map(([unit, value], index) => (
                <motion.div
                  key={unit}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="bg-white/10 rounded-md px-2 py-1 w-12 sm:w-14">
                    <span className="text-conces-gold font-bold text-sm sm:text-base block">
                      {value}
                    </span>
                  </div>
                  <span className="text-white/60 text-xs mt-1 block capitalize">
                    {unit.charAt(0)}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

      {/* Dynamic Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ scale: buttonConfig.variant !== "disabled" ? 1.05 : 1 }}
        whileTap={{ scale: buttonConfig.variant !== "disabled" ? 0.95 : 1 }}
      >
        <ButtonComponent
          {...(buttonConfig.href !== "#" && { href: buttonConfig.href })}
          className={getButtonStyles()}
          disabled={buttonConfig.variant === "disabled"}
        >
          {/* Icon based on phase */}
          <span className="mr-2">
            {contestPhase === "registration" && "📝"}
            {contestPhase === "contest_running" && "🚀"}
            {contestPhase === "contest_ended_waiting" && "⏳"}
            {contestPhase === "voting_active" && "🗳️"}
            {contestPhase === "contest_finished" && "🎉"}
          </span>

          {buttonConfig.text}

          {/* Additional info for some phases */}
          {contestPhase === "contest_ended_waiting" && (
            <span className="ml-2 text-xs opacity-75">
              ({formatTime(timeLeft)})
            </span>
          )}
        </ButtonComponent>
      </motion.div>

      {/* Phase indicator */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-white/60 text-xs text-center max-w-xs"
      >
        {contestPhase === "registration" && "Join the Logo Rebrand Challenge"}
        {contestPhase === "contest_running" &&
          "Contest is live! Submit your design"}
        {contestPhase === "contest_ended_waiting" &&
          "Submissions closed. Voting opens soon"}
        {contestPhase === "voting_active" && "Vote for your favorite design"}
        {contestPhase === "contest_finished" && "Thank you for participating!"}
      </motion.p>
    </div>
  );
}
