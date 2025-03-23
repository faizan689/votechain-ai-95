
// API response types for the VoteGuard application

// Common response structure
export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Auth response with token
export interface AuthResponse extends ApiResponse {
  token?: string;
}

// Voter information
export interface Voter {
  id: string;
  name: string;
  district: string;
  hasVoted: boolean;
}

// Voter verification response
export interface VoterVerificationResponse extends ApiResponse {
  voter?: Voter;
}

// Party type
export interface Party {
  id: string;
  name: string;
  symbol: string;
  color: string;
  logoPath: string;
}

// Parties response
export interface PartiesResponse extends ApiResponse {
  parties?: Party[];
}

// Vote cast response
export interface VoteCastResponse extends ApiResponse {
  transactionId?: string;
}

// Party vote statistics
export interface PartyVoteStats {
  partyId: string;
  partyName?: string;
  votes: number;
  percentage: number;
}

// District turnout
export interface DistrictTurnout {
  district: string;
  totalVoters?: number;
  votesCast?: number;
  turnout: number;
}

// Election statistics
export interface ElectionStats {
  totalRegisteredVoters: number;
  totalVotesCast: number;
  voterTurnoutPercentage: number;
  partywiseVotes: PartyVoteStats[];
  districtWiseTurnout: DistrictTurnout[];
}

// Admin stats response
export interface AdminStatsResponse extends ApiResponse {
  stats?: ElectionStats;
}
