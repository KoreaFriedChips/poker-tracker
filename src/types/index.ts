export interface PokerSession {
  id: string;
  location: string;
  stakes: string;
  startTime: Date;
  endTime: Date;
  buyIn: number;
  cashOut: number;
  notes: string;
  handHistories: HandHistory[];
}

export interface HandHistory {
  id: string;
  preflop: string;
  flop?: string;
  turn?: string;
  river?: string;
  result?: string;
  notes?: string;
}

export interface SessionStats {
  totalSessions: number;
  totalHours: number;
  totalProfit: number;
  hourlyRate: number;
  winRate: number;
} 