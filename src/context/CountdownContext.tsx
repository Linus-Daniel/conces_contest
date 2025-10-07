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

type ContestStatus = "register" | "grace" | "voting" | "ended" | "waiting";

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

// Define dates as constants - Updated with grace period and new voting start
const DEFAULT_DATES = {
  contestStart: "2025-09-08T00:00:00",
  contestEnd: "2025-10-07T23:59:59",
  graceEnd: "2025-10-14T23:59:59", // 2 weeks grace period (no new registrations)
  votingStart: "2025-10-29T00:00:00", // Voting starts October 29th (1 week waiting period)
  votingEnd: "2025-10-22T23:59:59", // Voting ends November 4th (1 week voting period)
  finale: "2025-11-07T00:00:00",
};

// Timer Provider Component
interface TimerProviderProps {
  children: ReactNode;
  contestStartDate?: string;
  contestEndDate?: string;
  graceEndDate?: string;
  votingStartDate?: string;
  votingEndDate?: string;
  finaleDate?: string;
}

export function TimerProvider({
  children,
  contestStartDate = DEFAULT_DATES.contestStart,
  contestEndDate = DEFAULT_DATES.contestEnd,
  graceEndDate = DEFAULT_DATES.graceEnd,
  votingStartDate = DEFAULT_DATES.votingStart,
  votingEndDate = DEFAULT_DATES.votingEnd,
  finaleDate = DEFAULT_DATES.finale,
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

  // Convert date strings to timestamps once
  const timestamps = useMemo(
    () => ({
      contestStart: new Date(contestStartDate).getTime(),
      contestEnd: new Date(contestEndDate).getTime(),
      graceEnd: new Date(graceEndDate).getTime(),
      votingStart: new Date(votingStartDate).getTime(),
      votingEnd: new Date(votingEndDate).getTime(),
      finale: new Date(finaleDate).getTime(),
    }),
    [
      contestStartDate,
      contestEndDate,
      graceEndDate,
      votingStartDate,
      votingEndDate,
      finaleDate,
    ]
  );

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      let targetTime: number;
      let newStatus: ContestStatus;
      let currentPhase = "";
      let nextPhase = "";

      // Determine phase and target
      if (now < timestamps.contestStart) {
        newStatus = "register";
        targetTime = timestamps.contestStart;
        currentPhase = "Registration will open soon";
        nextPhase = "Entry submissions will open";
      } else if (
        now >= timestamps.contestStart &&
        now <= timestamps.contestEnd
      ) {
        newStatus = "register";
        targetTime = timestamps.contestEnd;
        currentPhase = "Contest is live! Register and Submit your Logos now.";
        nextPhase = "Entry submissions will close";
      } else if (now > timestamps.contestEnd && now <= timestamps.graceEnd) {
        newStatus = "grace";
        targetTime = timestamps.graceEnd;
        currentPhase =
          "Grace Period: Existing participants can still submit entries. No new registrations.";
        nextPhase = "Grace period ends";
      } else if (now > timestamps.graceEnd && now < timestamps.votingStart) {
        newStatus = "waiting";
        targetTime = timestamps.votingStart;
        currentPhase = "Entry period has ended. Preparing for voting phase.";
        nextPhase = "Voting will begin";
      } else if (now >= timestamps.votingStart && now <= timestamps.votingEnd) {
        newStatus = "voting";
        targetTime = timestamps.votingEnd;
        currentPhase = "Voting is now open! Cast your votes.";
        nextPhase = "Voting will close";
      } else if (now > timestamps.votingEnd && now < timestamps.finale) {
        newStatus = "waiting";
        targetTime = timestamps.finale;
        currentPhase = "Voting has ended. Results coming soon!";
        nextPhase = "Grand Finale event";
      } else {
        newStatus = "ended";
        targetTime = now;
        currentPhase = "Contest has concluded. Thank you for participating!";
        nextPhase = "";
      }

      // Calculate time left
      let newTimeLeft: TimeLeft;
      if (newStatus === "ended") {
        newTimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      } else {
        const difference = targetTime - now;
        if (difference > 0) {
          newTimeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor(
              (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            ),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000),
          };
        } else {
          newTimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
      }

      // Update all state at once to prevent multiple re-renders
      setTimeLeft(newTimeLeft);
      setContestStatus(newStatus);
      setCurrentPhaseDescription(currentPhase);
      setNextPhaseDescription(nextPhase);
    };

    // Initial update
    updateTimer();

    // Set up interval
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [timestamps]); // Only depend on the memoized timestamps

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    (): TimerContextType => ({
      timeLeft,
      contestStatus,
      isContestActive:
        contestStatus === "register" || contestStatus === "grace",
      isRegistrationOpen:
        contestStatus === "register" || contestStatus === "grace",
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
  const { timeLeft, contestStatus, currentPhaseDescription } = useTimer();

  // Enhanced display text with better messaging
  const getDisplayText = useMemo(() => {
    let displayText = {
      mobile: "Contest Info",
      tablet: "Challenge Info",
      desktop: "Logo Rebrand Challenge Info",
    };

    switch (contestStatus) {
      case "register":
        const now = Date.now();
        const contestStart = new Date(DEFAULT_DATES.contestStart).getTime();

        if (now < contestStart) {
          displayText = {
            mobile: "Entries Open In",
            tablet: "Entry Period Starts In",
            desktop: "Logo Rebrand Challenge Opens For Entries In",
          };
        } else {
          displayText = {
            mobile: "Challenge Closes in",
            tablet: "Challenge Ends In",
            desktop: "Challenge Ends in",
          };
        }
        break;
      case "grace":
        displayText = {
          mobile: "Grace Period Ends In",
          tablet: "Grace Period Closes In",
          desktop: "Final Submission Grace Period Ends In",
        };
        break;
      case "waiting":
        const nowWaiting = Date.now();
        const votingEnd = new Date(DEFAULT_DATES.votingEnd).getTime();

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

    return displayText;
  }, [contestStatus]);

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
              {getDisplayText.desktop}
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
              <span className="block sm:hidden">{getDisplayText.mobile}</span>
              <span className="hidden sm:block md:hidden">
                {getDisplayText.tablet}
              </span>
              <span className="hidden md:block">{getDisplayText.desktop}</span>
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

  // Memoize button state to prevent unnecessary recalculations
  const buttonState = useMemo(() => {
    if (isLoading) {
      return {
        text: "Loading...",
        link: "#",
        disabled: true,
      };
    }

    switch (contestStatus) {
      case "register":
        return candidate
          ? { text: "Submit Entry", link: "/submit", disabled: false }
          : { text: "Register Now", link: "/signup", disabled: false };
      case "grace":
        return candidate
          ? {
              text: "Submit Entry - Grace Period",
              link: "/submit",
              disabled: false,
            }
          : { text: "Registration Closed", link: "#", disabled: true };
      case "waiting":
        const waitingNow = Date.now();
        const waitingVotingEnd = new Date(DEFAULT_DATES.votingEnd).getTime();

        return waitingNow > waitingVotingEnd
          ? { text: "Grand Finale Soon!", link: "/finale", disabled: false }
          : {
              text: "Submissions Closed - Voting Soon",
              link: "#",
              disabled: true,
            };
      case "voting":
        return { text: "Vote Now", link: "/voting", disabled: false };
      case "ended":
        return {
          text: "Contest Finished - Visit Our Page",
          link: "/results",
          disabled: false,
        };
      default:
        return { text: "Learn More", link: "/about", disabled: false };
    }
  }, [contestStatus, candidate, isLoading]);

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
