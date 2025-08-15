"use client";
import { Button } from "@/components/ui/button";
import { useCandidate } from "@/context/authContext";
import { useState } from "react";
import { AlertCircle, CheckCircle2, Key, User, Mail } from "lucide-react";

function AuthPage() {
  const { authenticate, isLoading, error, authToken, candidate } =
    useCandidate();
  const [inputToken, setInputToken] = useState<string>("");

  const handleSubmit = async () => {
    if (inputToken.trim()) {
      await authenticate(inputToken);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputToken.trim() && !isLoading) {
      handleSubmit();
    }
  };

  if (candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-green-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Welcome Back!
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Authentication successful
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 border">
                <div className="flex items-center mb-2">
                  <User className="w-5 h-5 text-gray-500 mr-3" />
                  <span className="text-sm font-medium text-gray-700">
                    Full Name
                  </span>
                </div>
                <p className="text-gray-900 font-semibold text-base sm:text-lg pl-8">
                  {candidate.fullName}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border">
                <div className="flex items-center mb-2">
                  <Mail className="w-5 h-5 text-gray-500 mr-3" />
                  <span className="text-sm font-medium text-gray-700">
                    Email
                  </span>
                </div>
                <p className="text-gray-900 font-semibold text-sm sm:text-base pl-8 break-all">
                  {candidate.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-blue-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Candidate Portal
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Enter your authentication token to continue
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="token"
                className="block text-sm font-medium text-gray-700"
              >
                Authentication Token
              </label>
              <div className="relative">
                <input
                  id="token"
                  type="password"
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your token here..."
                  className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all duration-200 text-sm sm:text-base
                           placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                  autoComplete="off"
                />
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isLoading || !inputToken.trim()}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 
                       disabled:bg-gray-300 disabled:cursor-not-allowed
                       text-white font-semibold rounded-xl transition-all duration-200
                       transform hover:scale-[1.02] active:scale-[0.98]
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       text-sm sm:text-base"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Authenticating...
                </div>
              ) : (
                "Access Portal"
              )}
            </Button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium text-sm">
                    Authentication Failed
                  </p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-center text-xs text-gray-500">
              Need help? Contact support for assistance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
