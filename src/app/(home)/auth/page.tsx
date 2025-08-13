"use client"
import { Button } from "@/components/ui/button";
import { useCandidate } from "@/context/authContext";
import { useState } from "react";

function AuthPage() {
  const { authenticate, isLoading, error, authToken, candidate } =
    useCandidate();
  const [inputToken, setInputToken] = useState<string>("");

  const handleSubmit = async () => {
    if (inputToken.trim()) {
      await authenticate(inputToken);
    }
  };

  if (candidate) {
    return (
      <div className="p-4">
        <h2>Welcome, {candidate.fullName}!</h2>
        <p>Email: {candidate.email}</p>
        {/* Add more candidate information display here */}
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md flex items-center justify-center h-1/2 flex-col mx-auto">
      <h1 className="text-2xl font-bold mb-4">Candidate Authentication</h1>

      <div className="space-y-4">
        <input
          type="text"
          value={inputToken}
          onChange={(e) => setInputToken(e.target.value)}
          placeholder="Enter authentication token"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />

        <Button
          onClick={handleSubmit}
          disabled={isLoading || !inputToken.trim()}
          className="w-full"
        >
          {isLoading ? "Authenticating..." : "Submit"}
        </Button>

        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
      </div>
    </div>
  );
}

export default AuthPage;
