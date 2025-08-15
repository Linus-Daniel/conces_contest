"use client"
import React, { useState, useEffect } from 'react';
import { MessageCircle, Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
}

interface VotingInterfaceProps {
  projectId: string;
  candidates: Candidate[];
  projectTitle?: string;
}

interface VoteResponse {
  success: boolean;
  message: string;
  voteId?: string;
  candidateName?: string;
  expiresIn?: number;
  error?: string;
  code?: string;
}

export default function VotingInterface({ 
  projectId, 
  candidates, 
  projectTitle = "Vote for Your Candidate" 
}: VotingInterfaceProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(false);
  const [voteResponse, setVoteResponse] = useState<VoteResponse | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Countdown timer for OTP expiration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timeRemaining && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev && prev <= 1) {
            setVoteResponse(null);
            return null;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeRemaining]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCandidate || !phoneNumber.trim()) {
      alert('Please select a candidate and enter your phone number');
      return;
    }

    setLoading(true);
    setVoteResponse(null);

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim(),
          candidateId: selectedCandidate.id,
          candidateName: selectedCandidate.name,
          projectId
        })
      });

      const data: VoteResponse = await response.json();
      
      setVoteResponse(data);
      
      if (data.success && data.expiresIn) {
        setTimeRemaining(data.expiresIn);
      }

    } catch (error) {
      setVoteResponse({
        success: false,
        message: 'Network error. Please check your connection and try again.',
        error: 'NETWORK_ERROR'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setVoteResponse(null);
    setTimeRemaining(null);
    setSelectedCandidate(null);
    setPhoneNumber('');
  };

  const getStatusIcon = () => {
    if (!voteResponse) return null;
    
    if (voteResponse.success) {
      return <MessageCircle className="w-8 h-8 text-green-500" />;
    } else if (voteResponse.code === 'ALREADY_VOTED') {
      return <CheckCircle className="w-8 h-8 text-blue-500" />;
    } else if (voteResponse.code === 'OTP_ALREADY_SENT') {
      return <Clock className="w-8 h-8 text-orange-500" />;
    } else {
      return <XCircle className="w-8 h-8 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    if (!voteResponse) return '';
    
    if (voteResponse.success) return 'border-green-200 bg-green-50';
    if (voteResponse.code === 'ALREADY_VOTED') return 'border-blue-200 bg-blue-50';
    if (voteResponse.code === 'OTP_ALREADY_SENT') return 'border-orange-200 bg-orange-50';
    return 'border-red-200 bg-red-50';
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{projectTitle}</h1>
        <p className="text-gray-600">Select your candidate and verify via WhatsApp</p>
      </div>

      {voteResponse ? (
        <div className={`p-6 rounded-lg border-2 ${getStatusColor()}`}>
          <div className="flex items-center mb-4">
            {getStatusIcon()}
            <h3 className="text-xl font-semibold ml-3">
              {voteResponse.success ? 'Code Sent!' : 'Notice'}
            </h3>
          </div>
          
          <p className="text-gray-700 mb-4">{voteResponse.message}</p>
          
          {voteResponse.success && selectedCandidate && (
            <div className="bg-white p-4 rounded-lg border mb-4">
              <p className="font-medium text-gray-900">Voting for: {selectedCandidate.name}</p>
              {timeRemaining && (
                <p className="text-sm text-gray-600 mt-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Code expires in: {formatTime(timeRemaining)}
                </p>
              )}
            </div>
          )}
          
          {voteResponse.success ? (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start">
                <MessageCircle className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Next Steps:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Check your WhatsApp for the verification code</li>
                    <li>Reply to our message with the 6-digit code</li>
                    <li>Your vote will be confirmed automatically</li>
                  </ol>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      ) : (
        <div onSubmit={handleSubmit} className="space-y-6">
          {/* Phone Number Input */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+234 801 234 5678"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be a Nigerian WhatsApp number. You'll receive a verification code.
            </p>
          </div>

          {/* Candidate Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Your Candidate
            </label>
            <div className="grid gap-3">
              {candidates.map((candidate) => (
                <label
                  key={candidate.id}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedCandidate?.id === candidate.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="candidate"
                    value={candidate.id}
                    checked={selectedCandidate?.id === candidate.id}
                    onChange={() => setSelectedCandidate(candidate)}
                    className="sr-only"
                    disabled={loading}
                  />
                  <div className="flex items-center flex-1">
                    {candidate.avatar && (
                      <img
                        src={candidate.avatar}
                        alt={candidate.name}
                        className="w-12 h-12 rounded-full object-cover mr-4"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                      {candidate.description && (
                        <p className="text-sm text-gray-600">{candidate.description}</p>
                      )}
                    </div>
                  </div>
                  <div className={`w-4 h-4 border-2 rounded-full ${
                    selectedCandidate?.id === candidate.id
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedCandidate?.id === candidate.id && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !selectedCandidate || !phoneNumber.trim()}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Sending Code...
              </>
            ) : (
              <>
                <MessageCircle className="w-5 h-5 mr-2" />
                Send Verification Code
              </>
            )}
          </button>
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">Security & Privacy:</p>
            <ul className="space-y-1 text-xs">
              <li>• One vote per phone number per project</li>
              <li>• Your phone number is securely hashed and not stored in plain text</li>
              <li>• Verification codes expire in 5 minutes</li>
              <li>• Only Nigerian WhatsApp numbers are supported</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}