

export interface PriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose: number;
}

export interface TickerPriceHistory {
  ticker: string;
  prices: PriceData[];
  startDate: string;
  endDate: string;
}

export interface CorrelationMetrics {
  correlation: number;      
  rSquared: number;         
}

export interface SpreadMetrics {
  spread: number[];         
  currentSpread: number;    
  spreadMean: number;       
  spreadStd: number;        
  spreadType: 'ratio' | 'log';  
}

export interface ZScoreMetrics {
  currentZScore: number;    
  zScoreHistory: number[];  
  zScoreMin: number;        
  zScoreMax: number;        
}

export interface StabilityMetrics {
  rollingCorrelations: number[];  
  consistencyScore: number;        
  confidence: 'Stable' | 'Medium' | 'Weak';
}

export interface PairCandidate {
  tickerA: string;
  tickerB: string;
  sector: string;
}

export interface PairAnalysis {
  tickerA: string;
  tickerB: string;
  sector: string;
  correlation: number;
  rSquared: number;
  zScore: number;
  direction: string;        
  confidence: 'Stable' | 'Medium' | 'Weak';
  spreadMean: number;
  spreadStd: number;
  isValid: boolean;         
}

export interface RankedPair extends PairAnalysis {
  rank: number;
  absZScore: number;        
}

export interface TradeNowRequest {
  lookbackWindow?: number;   
  zScoreWindow?: number;     
  timePeriod?: number;       
  sector?: string;           
}

export interface TradeNowResponse {
  success: boolean;
  pairs: RankedPair[];
  params: {
    lookbackWindow: number;
    zScoreWindow: number;
    timePeriod: number;
    sector?: string;
  };
  metadata: {
    totalPairsAnalyzed: number;
    validPairs: number;
    timestamp: string;
    dataRange: {
      start: string;
      end: string;
    };
  };
  error?: string;
}

export interface CorrelationRequest {
  tickerA: string;
  tickerB: string;
  lookbackWindow?: number;
  timePeriod?: number;
}

export interface CorrelationResponse {
  success: boolean;
  data?: {
    tickerA: string;
    tickerB: string;
    correlation: number;
    rSquared: number;
    currentZScore: number;
    zScoreRange: {
      min: number;
      max: number;
    };
    assessment: 'statistically-tradable' | 'high-correlation-unstable' | 'low-correlation';
    assessmentDetails: {
      label: string;
      description: string;
    };
    spread: {
      current: number;
      mean: number;
      std: number;
    };
    dataPoints: number;
  };
  error?: string;
}

export interface TickerValidationRequest {
  ticker: string;
}

export interface TickerValidationResponse {
  valid: boolean;
  ticker: string;
  isIndex: boolean;
  sector?: string;
  name?: string;
  error?: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface PriceCacheKey {
  ticker: string;
  startDate: string;
  endDate: string;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export type ErrorCode =
  | 'INVALID_TICKER'
  | 'TICKER_NOT_IN_SP500'
  | 'INSUFFICIENT_DATA'
  | 'FETCH_ERROR'
  | 'CALCULATION_ERROR'
  | 'INVALID_PARAMS'
  | 'RATE_LIMITED'
  | 'TIMEOUT';
