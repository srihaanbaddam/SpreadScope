

import type { 
  CorrelationMetrics, 
  SpreadMetrics, 
  ZScoreMetrics, 
  StabilityMetrics 
} from './types';
import { STAT_THRESHOLDS } from './constants';

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  
  const avg = mean(values);
  const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
  const avgSquaredDiff = mean(squaredDiffs);
  
  return Math.sqrt(avgSquaredDiff);
}

export function sampleStandardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  
  const avg = mean(values);
  const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
  const sumSquaredDiffs = squaredDiffs.reduce((sum, v) => sum + v, 0);
  
  return Math.sqrt(sumSquaredDiffs / (values.length - 1));
}

export function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 2) {
    return 0;
  }
  
  const n = x.length;
  const meanX = mean(x);
  const meanY = mean(y);
  
  let numerator = 0;
  let sumSqX = 0;
  let sumSqY = 0;
  
  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerator += diffX * diffY;
    sumSqX += diffX * diffX;
    sumSqY += diffY * diffY;
  }
  
  const denominator = Math.sqrt(sumSqX * sumSqY);
  
  if (denominator === 0) return 0;
  
  return numerator / denominator;
}

export function rSquared(correlation: number): number {
  return correlation * correlation;
}

export function calculateCorrelationMetrics(
  pricesA: number[],
  pricesB: number[]
): CorrelationMetrics {
  
  const returnsA = calculatePriceReturns(pricesA);
  const returnsB = calculatePriceReturns(pricesB);
  
  const correlation = pearsonCorrelation(returnsA, returnsB);
  
  return {
    correlation,
    rSquared: rSquared(correlation),
  };
}

export function calculatePriceReturns(prices: number[]): number[] {
  if (prices.length < 2) return [];
  
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] !== 0) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    } else {
      returns.push(0);
    }
  }
  
  return returns;
}

export function calculateRatioSpread(pricesA: number[], pricesB: number[]): number[] {
  if (pricesA.length !== pricesB.length) {
    throw new Error('Price arrays must have same length');
  }
  
  const spread: number[] = [];
  for (let i = 0; i < pricesA.length; i++) {
    if (pricesB[i] !== 0) {
      spread.push(pricesA[i] / pricesB[i]);
    }
  }
  
  return spread;
}

export function calculateLogSpread(pricesA: number[], pricesB: number[]): number[] {
  if (pricesA.length !== pricesB.length) {
    throw new Error('Price arrays must have same length');
  }
  
  const spread: number[] = [];
  for (let i = 0; i < pricesA.length; i++) {
    if (pricesA[i] > 0 && pricesB[i] > 0) {
      spread.push(Math.log(pricesA[i]) - Math.log(pricesB[i]));
    }
  }
  
  return spread;
}

export function calculateSpreadMetrics(
  pricesA: number[],
  pricesB: number[],
  useLogSpread: boolean = true
): SpreadMetrics {
  const spread = useLogSpread 
    ? calculateLogSpread(pricesA, pricesB)
    : calculateRatioSpread(pricesA, pricesB);
  
  const spreadMean = mean(spread);
  const spreadStd = sampleStandardDeviation(spread);
  const currentSpread = spread[spread.length - 1] || 0;
  
  return {
    spread,
    currentSpread,
    spreadMean,
    spreadStd,
    spreadType: useLogSpread ? 'log' : 'ratio',
  };
}

export function calculateZScore(value: number, mean: number, std: number): number {
  if (std === 0) return 0;
  return (value - mean) / std;
}

export function calculateRollingZScores(spread: number[], window: number): number[] {
  if (spread.length < window) {
    
    const allMean = mean(spread);
    const allStd = sampleStandardDeviation(spread);
    return spread.map(s => calculateZScore(s, allMean, allStd));
  }
  
  const zScores: number[] = [];
  
  for (let i = window - 1; i < spread.length; i++) {
    const windowData = spread.slice(i - window + 1, i + 1);
    const windowMean = mean(windowData);
    const windowStd = sampleStandardDeviation(windowData);
    
    zScores.push(calculateZScore(spread[i], windowMean, windowStd));
  }
  
  return zScores;
}

export function calculateZScoreMetrics(
  spread: number[],
  lookbackWindow: number,
  zScoreWindow: number
): ZScoreMetrics {
  
  const lookbackData = spread.slice(-lookbackWindow);
  const spreadMean = mean(lookbackData);
  const spreadStd = sampleStandardDeviation(lookbackData);
  
  
  const currentSpread = spread[spread.length - 1] || 0;
  const currentZScore = calculateZScore(currentSpread, spreadMean, spreadStd);
  
  
  const rollingZScores = calculateRollingZScores(spread, zScoreWindow);
  
  return {
    currentZScore,
    zScoreHistory: rollingZScores,
    zScoreMin: Math.min(...rollingZScores),
    zScoreMax: Math.max(...rollingZScores),
  };
}

export function calculateRollingCorrelations(
  pricesA: number[],
  pricesB: number[],
  window: number
): number[] {
  if (pricesA.length !== pricesB.length || pricesA.length < window) {
    return [];
  }
  
  const correlations: number[] = [];
  
  for (let i = window - 1; i < pricesA.length; i++) {
    const windowA = pricesA.slice(i - window + 1, i + 1);
    const windowB = pricesB.slice(i - window + 1, i + 1);
    
    const returnsA = calculatePriceReturns(windowA);
    const returnsB = calculatePriceReturns(windowB);
    
    correlations.push(pearsonCorrelation(returnsA, returnsB));
  }
  
  return correlations;
}

export function calculateConsistencyScore(
  rollingCorrelations: number[],
  threshold: number = 0.5
): number {
  if (rollingCorrelations.length === 0) return 0;
  
  const aboveThreshold = rollingCorrelations.filter(c => c >= threshold).length;
  return aboveThreshold / rollingCorrelations.length;
}

export function getConfidenceLabel(
  consistencyScore: number
): 'Stable' | 'Medium' | 'Weak' {
  if (consistencyScore >= STAT_THRESHOLDS.stableMinConsistency) {
    return 'Stable';
  }
  if (consistencyScore >= STAT_THRESHOLDS.mediumMinConsistency) {
    return 'Medium';
  }
  return 'Weak';
}

export function calculateStabilityMetrics(
  pricesA: number[],
  pricesB: number[],
  rollingWindow: number = 30
): StabilityMetrics {
  const rollingCorrelations = calculateRollingCorrelations(pricesA, pricesB, rollingWindow);
  const consistencyScore = calculateConsistencyScore(rollingCorrelations);
  const confidence = getConfidenceLabel(consistencyScore);
  
  return {
    rollingCorrelations,
    consistencyScore,
    confidence,
  };
}

export function getSpreadDirection(
  tickerA: string,
  tickerB: string,
  currentZScore: number
): string {
  if (currentZScore > 0) {
    
    return `${tickerA} rich / ${tickerB} cheap`;
  } else {
    
    return `${tickerB} rich / ${tickerA} cheap`;
  }
}

export function getAssessment(
  correlation: number,
  rSquaredValue: number,
  consistencyScore: number
): 'statistically-tradable' | 'high-correlation-unstable' | 'low-correlation' {
  
  if (
    correlation >= STAT_THRESHOLDS.tradableMinCorrelation &&
    rSquaredValue >= STAT_THRESHOLDS.tradableMinRSquared
  ) {
    return 'statistically-tradable';
  }
  
  
  if (
    correlation >= STAT_THRESHOLDS.unstableMinCorrelation &&
    rSquaredValue < STAT_THRESHOLDS.unstableMaxRSquared
  ) {
    return 'high-correlation-unstable';
  }
  
  
  return 'low-correlation';
}

export function getAssessmentDetails(
  assessment: 'statistically-tradable' | 'high-correlation-unstable' | 'low-correlation'
): { label: string; description: string } {
  switch (assessment) {
    case 'statistically-tradable':
      return {
        label: 'Statistically Tradable',
        description: 'This pair exhibits strong correlation stability and may be suitable for statistical arbitrage analysis.',
      };
    case 'high-correlation-unstable':
      return {
        label: 'High Correlation, Unstable',
        description: 'While correlation appears high, the relationship shows instability. Exercise caution and consider shorter lookback periods.',
      };
    case 'low-correlation':
      return {
        label: 'Low Correlation – Avoid',
        description: 'Insufficient correlation for pairs trading. The statistical relationship is too weak to support mean-reversion assumptions.',
      };
  }
}
