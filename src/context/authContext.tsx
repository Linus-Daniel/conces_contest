"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import api from "@/lib/axiosInstance";
import { useRouter } from "next/navigation";

// Define the candidate data type
interface Candidate {
  _id: string;
  fullName: string;
  avatar:string;
  email: string;
  university: string;
  profilePicture?: string; // Optional property for profile picture
  phone?: string; // Optional property for phone number
  // Add other candidate properties as needed
}

// Define the context value type
interface CandidateContextType {
  candidate: Candidate | null;
  authToken: string | null;
  isLoading: boolean;
  error: string | null;
  authenticate: (token: string) => Promise<void>;
  logout: () => void;
  setCandidate: (candidate: Candidate | null) => void;
}

// Create the context
const CandidateContext = createContext<CandidateContextType | undefined>(
  undefined
);

// Provider component
export function CandidateProvider({ children }: { children: ReactNode }) {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check localStorage on first load
  useEffect(() => {
    const storedToken = localStorage.getItem("candidateAuthToken");
    const storedCandidate = localStorage.getItem("candidate");

    if (storedToken && storedCandidate) {
      try {
        const parsedCandidate: Candidate = JSON.parse(storedCandidate);
        setCandidate(parsedCandidate);
        setAuthToken(storedToken);
      } catch {
        console.error("Error parsing stored candidate data.");
        localStorage.removeItem("candidateAuthToken");
        localStorage.removeItem("candidate");
      }
    }
  }, []);

  const authenticate = async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post("/auth", { authToken: token });
      const data = response.data;

      if (data.candidate) {
        setCandidate(data.candidate);
      }

      setAuthToken(token);
      router.push("/submit");

      // Store in localStorage
      localStorage.setItem("candidateAuthToken", token);
      localStorage.setItem("candidate", JSON.stringify(data.candidate));
    } catch (error) {
      console.error("Error submitting authToken:", error);
      setError("Authentication failed. Please try again.");
      setAuthToken(null);
      setCandidate(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCandidate(null);
    setAuthToken(null);
    setError(null);
    localStorage.removeItem("candidateAuthToken");
    localStorage.removeItem("candidate");
    router.push("/"); // Optional: send back to homepage/login
  };

  const value: CandidateContextType = {
    candidate,
    authToken,
    isLoading,
    error,
    authenticate,
    logout,
    setCandidate,
  };

  return (
    <CandidateContext.Provider value={value}>
      {children}
    </CandidateContext.Provider>
  );
}

// Custom hook to use the context
export function useCandidate() {
  const context = useContext(CandidateContext);
  if (context === undefined) {
    throw new Error("useCandidate must be used within a CandidateProvider");
  }
  return context;
}
