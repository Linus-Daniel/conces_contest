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
  currentPhaseDescription: string;
  nextPhaseDescription: string;
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
  contestStartDate = new Date("2025-09-08T00:00:00"), // Entries: September 8
  contestEndDate = new Date("2025-10-07T23:59:59"), // Entries end: October 7
  votingStartDate = new Date("2025-10-08T00:00:00"), // Voting: October 8
  votingEndDate = new Date("2025-11-04T23:59:59"), // Voting ends: November 4
  finaleDate = new Date("2025-11-07T00:00:00"), // Grand Finale: November 7
}: TimerProviderProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [contestStatus, setContestStatus] = useState<ContestStatus>("register");
  const [currentPhaseDescription, setCurrentPhaseDescription] = useState("");
  const [nextPhaseDescription, setNextPhaseDescription] = useState("");

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
      let currentPhase = "";
      let nextPhase = "";

      // Determine phase and target
      if (now < contestStartTime) {
        newStatus = "register";
        targetTime = contestStartTime;
        currentPhase = "Registration will open soon";
        nextPhase = "Entry submissions will open";
      } else if (now >= contestStartTime && now <= contestEndTime) {
        newStatus = "register";
        targetTime = contestEndTime;
        currentPhase = "Contest is live! Submit your entries now.";
        nextPhase = "Entry submissions will close";
      } else if (now > contestEndTime && now < votingStartTime) {
        newStatus = "waiting";
        targetTime = votingStartTime;
        currentPhase = "Entry period has ended. Preparing for voting phase.";
        nextPhase = "Voting will begin";
      } else if (now >= votingStartTime && now <= votingEndTime) {
        newStatus = "voting";
        targetTime = votingEndTime;
        currentPhase = "Voting is now open! Cast your votes.";
        nextPhase = "Voting will close";
      } else if (now > votingEndTime && now < finaleTime) {
        newStatus = "waiting";
        targetTime = finaleTime;
        currentPhase = "Voting has ended. Results coming soon!";
        nextPhase = "Grand Finale event";
      } else {
        newStatus = "ended";
        targetTime = now;
        currentPhase = "Contest has concluded. Thank you for participating!";
        nextPhase = "";
      }

      // Update status and descriptions
      setContestStatus(newStatus);
      setCurrentPhaseDescription(currentPhase);
      setNextPhaseDescription(nextPhase);

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
  }, [
    contestStartDate,
    contestEndDate,
    votingStartDate,
    votingEndDate,
    finaleDate,
  ]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    (): TimerContextType => ({
      timeLeft,
      contestStatus,
      isContestActive: contestStatus === "register",
      isRegistrationOpen: contestStatus === "register",
      isVotingOpen: contestStatus === "voting",
      currentPhaseDescription,
      nextPhaseDescription,
    }),
    [timeLeft, contestStatus, currentPhaseDescription, nextPhaseDescription]
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

// Updated CountdownTimer Component using the Timer Context
export function CountdownTimer() {
  const {
    timeLeft,
    contestStatus,
    currentPhaseDescription,
    nextPhaseDescription,
  } = useTimer();

  // Enhanced display text with better messaging
  let displayText = {
    mobile: "Contest Info",
    tablet: "Challenge Info",
    desktop: "Logo Rebrand Challenge Info",
  };

  switch (contestStatus) {
    case "register":
      const now = Date.now();
      const contestStart = new Date("2025-09-08T00:00:00").getTime();

      if (now < contestStart) {
        displayText = {
          mobile: "Entries Open In",
          tablet: "Entry Period Starts In",
          desktop: "Logo Rebrand Challenge Opens For Entries In",
        };
      } else {
        displayText = {
          mobile: "Entry Deadline",
          tablet: "Submission Deadline",
          desktop: "Logo Rebrand Challenge Entry Deadline",
        };
      }
      break;
    case "waiting":
      const nowWaiting = Date.now();
      const votingEnd = new Date("2025-11-04T23:59:59").getTime();

      if (nowWaiting > votingEnd) {
        displayText = {
          mobile: "Finale Event In",
          tablet: "Grand Finale In",
          desktop: "Grand Finale Event Begins In",
        };
      } else {
        displayText = {
          mobile: "Voting Opens In",
          tablet: "Voting Period Begins In",
          desktop: "Community Voting Period Begins In",
        };
      }
      break;
    case "voting":
      displayText = {
        mobile: "Voting Closes In",
        tablet: "Voting Period Ends In",
        desktop: "Community Voting Period Closes In",
      };
      break;
    case "ended":
      displayText = {
        mobile: "Contest Complete",
        tablet: "Challenge Complete",
        desktop: "Logo Rebrand Challenge Complete",
      };
      break;
  }

  if (contestStatus === "ended") {
    return (
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-6 sm:py-8 md:py-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center space-y-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white text-center"
            >
              {displayText.desktop}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-white/90 text-center text-sm sm:text-base md:text-lg max-w-2xl"
            >
              {currentPhaseDescription}
            </motion.p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-r from-conces-blue to-conces-blue/90 py-4 sm:py-6 md:py-8">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col space-y-6">
          {/* Phase Information */}
          <div className="text-center">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-white/90 text-sm sm:text-base mb-2"
            >
              {currentPhaseDescription}
            </motion.p>
          </div>

          {/* Timer Display */}
          <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-white text-center md:text-left"
            >
              <span className="block sm:hidden">{displayText.mobile}</span>
              <span className="hidden sm:block md:hidden">
                {displayText.tablet}
              </span>
              <span className="hidden md:block">{displayText.desktop}</span>
            </motion.h2>

            <div className="flex justify-center space-x-3 sm:space-x-4 md:space-x-5 lg:space-x-6">
              {Object.entries(timeLeft).map(([unit, value], index) => (
                <motion.div
                  key={unit}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4 min-w-[50px] sm:min-w-[60px] md:min-w-[70px] lg:min-w-[80px]">
                    <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-yellow-400 block">
                      {String(value).padStart(2, "0")}
                    </span>
                  </div>
                  <span className="text-white/80 text-xs sm:text-sm mt-2 block capitalize font-medium">
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
