// src/types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "Admin" | "User" | "Contestant" | "Judge";
  status: "Active" | "Suspended";
  signupDate: string;
}

export interface Contest {
  id: string;
  title: string;
  category: string;
  description: string;
  submitter: {
    name: string;
    avatar: string;
  };
  submissionDate: string;
  status: "Active" | "Pending" | "Completed";
}

export interface VoteData {
  contestant: string;
  contest: string;
  votes: number;
  lastVote: string;
  avatar: string;
  id: string;
}
