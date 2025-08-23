"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useCandidate } from "./authContext";

// Timer Context Types
interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

type ContestStatus = "register" | "voting" | "ended" | "waiting";

interface TimerContextType {
  timeLeft: TimeLeft;
  contestStatus: ContestStatus;
  isContestActive: boolean;
  isRegistrationOpen: boolean;
  isVotingOpen: boolean;
}

// Create Timer Context
const TimerContext = createContext<TimerContextType | undefined>(undefined);

// Timer Provider Component
interface TimerProviderProps {
  children: ReactNode;
  contestStartDate?: Date;
  contestEndDate?: Date;
  votingStartDate?: Date;
  votingEndDate?: Date;
  finaleDate?: Date;
}

export function TimerProvider({
  children,
  // LIVE COMPETITION TIMELINE:
  contestStartDate = new Date("2025-09-07T00:00:00"), // Entries: September 7
  contestEndDate = new Date("2025-10-07T23:59:59"), // Entries end: October 7
  votingStartDate = new Date("2025-10-08T00:00:00"), // Voting: October 8
  votingEndDate = new Date("2025-11-04T23:59:59"), // Voting ends: November 4
  finaleDate = new Date("2025-11-07T00:00:00"), // Grand Finale: November 7
}: TimerProviderProps & { finaleDate?: Date }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [contestStatus, setContestStatus] = useState<ContestStatus>("register");

  useEffect(() => {
    // Convert dates to timestamps once
    const contestStartTime = contestStartDate.getTime();
    const contestEndTime = contestEndDate.getTime();
    const votingStartTime = votingStartDate.getTime();
    const votingEndTime = votingEndDate.getTime();
    const finaleTime = finaleDate.getTime();

    const updateTimer = () => {
      const now = Date.now();
      let targetTime: number;
      let newStatus: ContestStatus;

      // Determine phase and target
      if (now < contestStartTime) {
        newStatus = "register";
        targetTime = contestStartTime;
      } else if (now >= contestStartTime && now <= contestEndTime) {
        newStatus = "register";
        targetTime = contestEndTime;
      } else if (now > contestEndTime && now < votingStartTime) {
        newStatus = "waiting";
        targetTime = votingStartTime;
      } else if (now >= votingStartTime && now <= votingEndTime) {
        newStatus = "voting";
        targetTime = votingEndTime;
      } else if (now > votingEndTime && now < finaleTime) {
        newStatus = "waiting";
        targetTime = finaleTime;
      } else {
        newStatus = "ended";
        targetTime = now;
      }

      // Update status
      setContestStatus(newStatus);

      // Calculate time left
      if (newStatus === "ended") {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
      } else {
        const difference = targetTime - now;
        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (difference % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);

          setTimeLeft({ days, hours, minutes, seconds });
        } else {
          setTimeLeft({
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
          });
        }
      }
    };

    // Initial update
    updateTimer();

    // Set up interval
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []); // Empty dependency array - dates are props and won't change

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    (): TimerContextType => ({
      timeLeft,
      contestStatus,
      isContestActive: contestStatus === "register",
      isRegistrationOpen: contestStatus === "register",
      isVotingOpen: contestStatus === "voting",
    }),
    [timeLeft, contestStatus]
  );

  return (
    <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
  );
}

// Hook to use the Timer Context
export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
}

// Dynamic Button Component
interface DynamicContestButtonProps {
  className?: string;
}

export function DynamicContestButton({
  className = "",
}: DynamicContestButtonProps) {
  const { contestStatus } = useTimer();
  const { candidate, isLoading } = useCandidate();

  // Simple state calculation without useMemo to avoid dependency issues
  let buttonState = {
    text: "Loading...",
    link: "#",
    disabled: true,
  };

  if (!isLoading) {
    switch (contestStatus) {
      case "register":
        if (candidate) {
          buttonState = {
            text: "Submit Entry",
            link: "/submit",
            disabled: false,
          };
        } else {
          buttonState = {
            text: "Register Now",
            link: "/signup",
            disabled: false,
          };
        }
        break;
      case "waiting":
        // Check if waiting for voting or finale
        const waitingNow = Date.now();
        const waitingVotingEnd = new Date("2025-11-04T23:59:59").getTime();

        if (waitingNow > waitingVotingEnd) {
          buttonState = {
            text: "Grand Finale Soon!",
            link: "/finale",
            disabled: false,
          };
        } else {
          buttonState = {
            text: "Contest Ended - Waiting for Voting",
            link: "#",
            disabled: true,
          };
        }
        break;
      case "voting":
        buttonState = {
          text: "Vote Now",
          link: "/voting",
          disabled: false,
        };
        break;
      case "ended":
        buttonState = {
          text: "Contest Finished - Visit Our Page",
          link: "/results",
          disabled: false,
        };
        break;
      default:
        buttonState = {
          text: "Learn More",
          link: "/about",
          disabled: false,
        };
    }
  }

  return (
    <motion.a
      href={buttonState.link}
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
      whileHover={{ scale: buttonState.disabled ? 1 : 1.05 }}
      whileTap={{ scale: buttonState.disabled ? 1 : 0.95 }}
      className={`bg-gradient-to-r from-conces-green to-conces-blue hover:from-conces-green/90 hover:to-conces-blue/90 text-white px-6 sm:px-6 py-3 sm:py-3 rounded-lg font-bold text-base sm:text-lg inline-flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl order-1 ${className} ${
        buttonState.disabled
          ? "bg-gray-400 cursor-not-allowed text-gray-700"
          : "bg-conces-yellow hover:bg-conces-yellow/90 text-conces-blue"
      }`}
      onClick={(e) => buttonState.disabled && e.preventDefault()}
    >
      {buttonState.text}
    </motion.a>
  );
}

// Updated CountdownTimer Component using the Timer Context
export function CountdownTimer() {
  const { timeLeft, contestStatus } = useTimer();

  // Simple display text calculation without useMemo
  let displayText = {
    mobile: "Contest Info",
    tablet: "Challenge Info",
    desktop: "Logo Rebrand Challenge Info",
  };

  switch (contestStatus) {
    case "register":
      // Check if we're before contest start or during contest
      const now = Date.now();
      const contestStart = new Date("2025-09-07T00:00:00").getTime();

      if (now < contestStart) {
        displayText = {
          mobile: "Entries Open In...",
          tablet: "Entry Period Starts In...",
          desktop: "Logo Rebrand Challenge Entries Open In...",
        };
      } else {
        displayText = {
          mobile: "Entry Deadline In...",
          tablet: "Submission Deadline In...",
          desktop: "Logo Rebrand Challenge Entry Deadline In...",
        };
      }
      break;
    case "waiting":
      const nowWaiting = Date.now();
      const votingEnd = new Date("2025-11-04T23:59:59").getTime();

      if (nowWaiting > votingEnd) {
        displayText = {
          mobile: "Grand Finale In...",
          tablet: "Grand Finale In...",
          desktop: "Grand Finale Event In...",
        };
      } else {
        displayText = {
          mobile: "Voting Starts In...",
          tablet: "Voting Begins In...",
          desktop: "Voting Period Begins In...",
        };
      }
      break;
    case "voting":
      displayText = {
        mobile: "Voting Ends In...",
        tablet: "Voting Ends In...",
        desktop: "Voting Period Ends In...",
      };
      break;
    case "ended":
      displayText = {
        mobile: "Contest Ended",
        tablet: "Challenge Ended",
        desktop: "Logo Rebrand Challenge Has Ended",
      };
      break;
  }

  if (contestStatus === "ended") {
    return (
      <section className="bg-gradient-to-r from-conces-blue to-conces-blue/90 py-4 sm:py-6 md:py-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center space-y-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-white text-center md:text-left"
          >
            <span className="block sm:hidden">{displayText.mobile}</span>
            <span className="hidden sm:block md:hidden">
              {displayText.tablet}
            </span>
            <span className="hidden md:block">{displayText.desktop}</span>
          </motion.h2>

          <div className="flex flex-col items-center space-y-4 sm:space-y-6 md:space-y-0 md:flex-row md:space-x-4">
            <div className="flex justify-center space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-6">
              {Object.entries(timeLeft).map(([unit, value], index) => (
                <motion.div
                  key={unit}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
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
      </div>
    </section>
  );
}
