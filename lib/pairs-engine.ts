

import { 
  SP500_CONSTITUENTS, 
  TICKER_SECTOR_MAP, 
  DEFAULT_PARAMS,
  SECTORS,
  SP500_TICKERS,
  ALLOWED_INDICES
} from './constants';
import { 
  fetchPriceData, 
  fetchMultiplePriceData, 
  alignPriceSeries,
  validateTicker 
} from './data-fetcher';
import {
  calculateCorrelationMetrics,
  calculateSpreadMetrics,
  calculateZScoreMetrics,
  calculateStabilityMetrics,
  getSpreadDirection,
  getConfidenceLabel,
  getAssessment,
  getAssessmentDetails,
  mean,
  sampleStandardDeviation,
  calculatePriceReturns,
  pearsonCorrelation,
  rSquared as calcRSquared,
} from './statistics';
import { pairsCache, getPairsCacheKey, corrCache, getCorrelationCacheKey } from './cache';
import type { 
  PairAnalysis, 
  RankedPair, 
  TradeNowRequest, 
  TradeNowResponse,
  CorrelationRequest,
  CorrelationResponse,
  PairCandidate
} from './types';

function generatePairCandidates(
  tickers: string[],
  sector?: string
): PairCandidate[] {
  const candidates: PairCandidate[] = [];
  
  
  const tickersBySector = new Map<string, string[]>();
  
  for (const ticker of tickers) {
    const tickerSector = TICKER_SECTOR_MAP.get(ticker);
    if (tickerSector) {
      if (sector && tickerSector !== sector) continue;
      
      if (!tickersBySector.has(tickerSector)) {
        tickersBySector.set(tickerSector, []);
      }
      tickersBySector.get(tickerSector)!.push(ticker);
    }
  }
  
  
  for (const [sectorName, sectorTickers] of tickersBySector) {
    for (let i = 0; i < sectorTickers.length; i++) {
      for (let j = i + 1; j < sectorTickers.length; j++) {
        candidates.push({
          tickerA: sectorTickers[i],
          tickerB: sectorTickers[j],
          sector: sectorName,
        });
      }
    }
  }
  
  return candidates;
}

function getRepresentativeTickers(): string[] {
  const selectedBySector: Record<string, string[]> = {
    'Technology': ['AAPL', 'MSFT', 'NVDA', 'AVGO', 'ORCL', 'AMD', 'QCOM', 'TXN'],
    'Financials': ['JPM', 'BAC', 'WFC', 'GS', 'MS', 'V', 'MA', 'C'],
    'Healthcare': ['UNH', 'JNJ', 'LLY', 'MRK', 'ABBV', 'PFE', 'TMO', 'ABT'],
    'Consumer Discretionary': ['AMZN', 'TSLA', 'HD', 'MCD', 'NKE', 'LOW'],
    'Consumer Staples': ['PG', 'KO', 'PEP', 'COST', 'WMT', 'PM'],
    'Energy': ['XOM', 'CVX', 'COP', 'EOG', 'SLB', 'MPC'],
    'Industrials': ['CAT', 'DE', 'GE', 'UNP', 'HON', 'BA'],
    'Communication Services': ['GOOGL', 'META', 'NFLX', 'DIS', 'VZ', 'T'],
    'Utilities': ['NEE', 'DUK', 'SO', 'D', 'SRE', 'AEP'],
    'Materials': ['LIN', 'APD', 'SHW', 'FCX', 'NEM', 'NUE'],
    'Real Estate': ['PLD', 'AMT', 'EQIX', 'CCI', 'PSA', 'O'],
  };
  
  const allTickers = new Set<string>();
  for (const tickers of Object.values(selectedBySector)) {
    for (const ticker of tickers) {
      allTickers.add(ticker);
    }
  }
  
  return Array.from(allTickers);
}

async function analyzePair(
  tickerA: string,
  tickerB: string,
  sector: string,
  priceDataMap: Map<string, number[]>,
  params: {
    lookbackWindow: number;
    zScoreWindow: number;
  }
): Promise<PairAnalysis | null> {
  const pricesA = priceDataMap.get(tickerA);
  const pricesB = priceDataMap.get(tickerB);
  
  if (!pricesA || !pricesB) {
    return null;
  }
  
  
  const { alignedA, alignedB } = alignPriceSeries(pricesA, pricesB);
  
  
  const minDataPoints = Math.max(params.lookbackWindow, 30);
  if (alignedA.length < minDataPoints) {
    return null;
  }
  
  try {
    
    const lookbackPricesA = alignedA.slice(-params.lookbackWindow);
    const lookbackPricesB = alignedB.slice(-params.lookbackWindow);
    
    
    const correlationMetrics = calculateCorrelationMetrics(lookbackPricesA, lookbackPricesB);
    
    
    if (correlationMetrics.correlation < DEFAULT_PARAMS.minCorrelation) {
      return null;
    }
    
    
    if (correlationMetrics.rSquared < DEFAULT_PARAMS.minRSquared) {
      return null;
    }
    
    
    const spreadMetrics = calculateSpreadMetrics(lookbackPricesA, lookbackPricesB, true);
    
    
    const zScoreWindow = Math.min(params.zScoreWindow, Math.floor(params.lookbackWindow / 3));
    const zScoreMetrics = calculateZScoreMetrics(
      spreadMetrics.spread,
      params.lookbackWindow,
      zScoreWindow
    );
    
    
    const stabilityWindow = Math.min(30, Math.floor(params.lookbackWindow / 2));
    const stabilityMetrics = calculateStabilityMetrics(lookbackPricesA, lookbackPricesB, stabilityWindow);
    
    
    const direction = getSpreadDirection(tickerA, tickerB, zScoreMetrics.currentZScore);
    
    return {
      tickerA,
      tickerB,
      sector,
      correlation: correlationMetrics.correlation,
      rSquared: correlationMetrics.rSquared,
      zScore: zScoreMetrics.currentZScore,
      direction,
      confidence: stabilityMetrics.confidence,
      spreadMean: spreadMetrics.spreadMean,
      spreadStd: spreadMetrics.spreadStd,
      isValid: true,
    };
  } catch (error) {
    console.error(`Error analyzing pair ${tickerA}/${tickerB}:`, error);
    return null;
  }
}

export async function analyzeTradeNowPairs(
  request: TradeNowRequest
): Promise<TradeNowResponse> {
  const params = {
    lookbackWindow: request.lookbackWindow || DEFAULT_PARAMS.lookbackWindow,
    zScoreWindow: request.zScoreWindow || DEFAULT_PARAMS.zScoreWindow,
    timePeriod: request.timePeriod || DEFAULT_PARAMS.timePeriod,
    sector: request.sector,
  };
  
  
  if (params.lookbackWindow < 10 || params.lookbackWindow > 252) {
    return {
      success: false,
      pairs: [],
      params,
      metadata: {
        totalPairsAnalyzed: 0,
        validPairs: 0,
        timestamp: new Date().toISOString(),
        dataRange: { start: '', end: '' },
      },
      error: 'Lookback window must be between 10 and 252 days',
    };
  }
  
  if (params.zScoreWindow < 5 || params.zScoreWindow > params.lookbackWindow) {
    return {
      success: false,
      pairs: [],
      params,
      metadata: {
        totalPairsAnalyzed: 0,
        validPairs: 0,
        timestamp: new Date().toISOString(),
        dataRange: { start: '', end: '' },
      },
      error: 'Z-score window must be between 5 days and the lookback window',
    };
  }
  
  
  const cacheKey = getPairsCacheKey(
    params.lookbackWindow,
    params.zScoreWindow,
    params.timePeriod,
    params.sector
  );
  
  const cachedResult = pairsCache.get<TradeNowResponse>(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }
  
  try {
    
    const tickers = getRepresentativeTickers();
    
    
    let filteredTickers = tickers;
    if (params.sector) {
      filteredTickers = tickers.filter(t => TICKER_SECTOR_MAP.get(t) === params.sector);
    }
    
    
    const priceDataMap = await fetchMultiplePriceData(filteredTickers, params.timePeriod);
    
    
    const candidates = generatePairCandidates(
      Array.from(priceDataMap.keys()),
      params.sector
    );
    
    
    const analysisPromises = candidates.map(candidate =>
      analyzePair(
        candidate.tickerA,
        candidate.tickerB,
        candidate.sector,
        priceDataMap,
        { lookbackWindow: params.lookbackWindow, zScoreWindow: params.zScoreWindow }
      )
    );
    
    const analysisResults = await Promise.all(analysisPromises);
    
    
    const validPairs = analysisResults.filter(
      (result): result is PairAnalysis => result !== null && result.isValid
    );
    
    
    const tradablePairs = validPairs.filter(pair => 
      pair.correlation >= DEFAULT_PARAMS.minCorrelation &&
      pair.rSquared >= DEFAULT_PARAMS.minRSquared
    );
    
    
    const rankedPairs: RankedPair[] = tradablePairs
      .map(pair => ({
        ...pair,
        absZScore: Math.abs(pair.zScore),
        rank: 0, 
      }))
      .sort((a, b) => b.absZScore - a.absZScore)
      .slice(0, DEFAULT_PARAMS.topPairsCount)
      .map((pair, index) => ({
        ...pair,
        rank: index + 1,
      }));
    
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - params.timePeriod);
    
    const response: TradeNowResponse = {
      success: true,
      pairs: rankedPairs,
      params,
      metadata: {
        totalPairsAnalyzed: candidates.length,
        validPairs: validPairs.length,
        timestamp: new Date().toISOString(),
        dataRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
        },
      },
    };
    
    
    pairsCache.set(cacheKey, response);
    
    return response;
    
  } catch (error) {
    console.error('Error in Trade Now analysis:', error);
    return {
      success: false,
      pairs: [],
      params,
      metadata: {
        totalPairsAnalyzed: 0,
        validPairs: 0,
        timestamp: new Date().toISOString(),
        dataRange: { start: '', end: '' },
      },
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function analyzeCorrelation(
  request: CorrelationRequest
): Promise<CorrelationResponse> {
  const params = {
    tickerA: request.tickerA.toUpperCase().trim(),
    tickerB: request.tickerB.toUpperCase().trim(),
    lookbackWindow: request.lookbackWindow || DEFAULT_PARAMS.lookbackWindow,
    timePeriod: request.timePeriod || DEFAULT_PARAMS.timePeriod,
  };
  
  
  const validationA = validateTicker(params.tickerA);
  const validationB = validateTicker(params.tickerB);
  
  if (!validationA.valid) {
    return {
      success: false,
      error: validationA.error,
    };
  }
  
  if (!validationB.valid) {
    return {
      success: false,
      error: validationB.error,
    };
  }
  
  
  if (params.tickerA === params.tickerB) {
    return {
      success: false,
      error: 'Please enter two different tickers',
    };
  }
  
  
  const cacheKey = getCorrelationCacheKey(
    params.tickerA,
    params.tickerB,
    params.lookbackWindow,
    params.timePeriod
  );
  
  const cachedResult = corrCache.get<CorrelationResponse>(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }
  
  try {
    
    const [dataA, dataB] = await Promise.all([
      fetchPriceData(params.tickerA, params.timePeriod),
      fetchPriceData(params.tickerB, params.timePeriod),
    ]);
    
    if (!dataA || dataA.prices.length === 0) {
      return {
        success: false,
        error: `Unable to fetch price data for ${params.tickerA}`,
      };
    }
    
    if (!dataB || dataB.prices.length === 0) {
      return {
        success: false,
        error: `Unable to fetch price data for ${params.tickerB}`,
      };
    }
    
    
    const { alignedA, alignedB } = alignPriceSeries(dataA.prices, dataB.prices);
    
    
    const minDataPoints = Math.max(params.lookbackWindow, 30);
    if (alignedA.length < minDataPoints) {
      return {
        success: false,
        error: `Insufficient data: only ${alignedA.length} data points available, need at least ${minDataPoints}`,
      };
    }
    
    
    const lookbackPricesA = alignedA.slice(-params.lookbackWindow);
    const lookbackPricesB = alignedB.slice(-params.lookbackWindow);
    
    
    const returnsA = calculatePriceReturns(lookbackPricesA);
    const returnsB = calculatePriceReturns(lookbackPricesB);
    const correlation = pearsonCorrelation(returnsA, returnsB);
    const rSquaredValue = calcRSquared(correlation);
    
    
    const spreadMetrics = calculateSpreadMetrics(lookbackPricesA, lookbackPricesB, true);
    
    
    const zScoreWindow = Math.min(20, Math.floor(params.lookbackWindow / 3));
    const zScoreMetrics = calculateZScoreMetrics(
      spreadMetrics.spread,
      params.lookbackWindow,
      zScoreWindow
    );
    
    
    const stabilityWindow = Math.min(30, Math.floor(params.lookbackWindow / 2));
    const stabilityMetrics = calculateStabilityMetrics(lookbackPricesA, lookbackPricesB, stabilityWindow);
    
    
    const assessment = getAssessment(
      correlation,
      rSquaredValue,
      stabilityMetrics.consistencyScore
    );
    const assessmentDetails = getAssessmentDetails(assessment);
    
    const response: CorrelationResponse = {
      success: true,
      data: {
        tickerA: params.tickerA,
        tickerB: params.tickerB,
        correlation,
        rSquared: rSquaredValue,
        currentZScore: zScoreMetrics.currentZScore,
        zScoreRange: {
          min: zScoreMetrics.zScoreMin,
          max: zScoreMetrics.zScoreMax,
        },
        assessment,
        assessmentDetails,
        spread: {
          current: spreadMetrics.currentSpread,
          mean: spreadMetrics.spreadMean,
          std: spreadMetrics.spreadStd,
        },
        dataPoints: lookbackPricesA.length,
      },
    };
    
    
    corrCache.set(cacheKey, response);
    
    return response;
    
  } catch (error) {
    console.error('Error in correlation analysis:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export function isValidTicker(ticker: string): boolean {
  const normalized = ticker.toUpperCase().trim();
  
  
  if (normalized.startsWith('^')) {
    return ALLOWED_INDICES.has(normalized);
  }
  
  
  return SP500_TICKERS.has(normalized);
}

export function getAvailableSectors(): string[] {
  return [...SECTORS];
}
