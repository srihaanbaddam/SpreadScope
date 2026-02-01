

import { priceDataCache, getPriceCacheKey } from './cache';
import { SP500_TICKERS, ALLOWED_INDICES, TICKER_SECTOR_MAP } from './constants';
import type { PriceData, TickerValidationResponse } from './types';

const YAHOO_FINANCE_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

const RATE_LIMIT = {
  requestsPerSecond: 5,
  retryDelayMs: 1000,
  maxRetries: 3,
};

let lastRequestTime = 0;
const minRequestInterval = 1000 / RATE_LIMIT.requestsPerSecond;

async function rateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < minRequestInterval) {
    await new Promise(resolve => 
      setTimeout(resolve, minRequestInterval - timeSinceLastRequest)
    );
  }
  
  lastRequestTime = Date.now();
}

export function validateTicker(ticker: string): TickerValidationResponse {
  const normalizedTicker = ticker.toUpperCase().trim();
  
  
  if (normalizedTicker.startsWith('^')) {
    if (ALLOWED_INDICES.has(normalizedTicker)) {
      return {
        valid: true,
        ticker: normalizedTicker,
        isIndex: true,
      };
    }
    return {
      valid: false,
      ticker: normalizedTicker,
      isIndex: true,
      error: `Index ${normalizedTicker} is not supported. Allowed indices: ${Array.from(ALLOWED_INDICES).join(', ')}`,
    };
  }
  
  
  if (SP500_TICKERS.has(normalizedTicker)) {
    return {
      valid: true,
      ticker: normalizedTicker,
      isIndex: false,
      sector: TICKER_SECTOR_MAP.get(normalizedTicker),
    };
  }
  
  return {
    valid: false,
    ticker: normalizedTicker,
    isIndex: false,
    error: `Ticker ${normalizedTicker} is not in the S&P 500. Only S&P 500 constituents are supported.`,
  };
}

export function getDateRange(periodDays: number): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();
  
  
  const calendarDays = Math.ceil(periodDays * 1.5);
  startDate.setDate(startDate.getDate() - calendarDays);
  
  return { startDate, endDate };
}

export async function fetchPriceData(
  ticker: string,
  periodDays: number
): Promise<{ prices: number[]; dates: string[] } | null> {
  
  const cacheKey = getPriceCacheKey(ticker, periodDays);
  const cachedData = priceDataCache.get(cacheKey);
  
  if (cachedData) {
    
    return { prices: cachedData, dates: [] };
  }
  
  const { startDate, endDate } = getDateRange(periodDays);
  
  
  const period1 = Math.floor(startDate.getTime() / 1000);
  const period2 = Math.floor(endDate.getTime() / 1000);
  
  const url = `${YAHOO_FINANCE_BASE_URL}/${ticker}?period1=${period1}&period2=${period2}&interval=1d&includePrePost=false`;
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < RATE_LIMIT.maxRetries; attempt++) {
    try {
      await rateLimit();
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        
        signal: AbortSignal.timeout(10000),
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          
          await new Promise(resolve => 
            setTimeout(resolve, RATE_LIMIT.retryDelayMs * (attempt + 1))
          );
          continue;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      
      const result = data.chart?.result?.[0];
      if (!result) {
        throw new Error('No data returned from Yahoo Finance');
      }
      
      const timestamps = result.timestamp || [];
      const quotes = result.indicators?.adjclose?.[0]?.adjclose || 
                     result.indicators?.quote?.[0]?.close || [];
      
      if (quotes.length === 0) {
        throw new Error('No price data available');
      }
      
      
      const validPrices: number[] = [];
      const validDates: string[] = [];
      
      for (let i = 0; i < quotes.length; i++) {
        if (quotes[i] !== null && quotes[i] !== undefined) {
          validPrices.push(quotes[i]);
          if (timestamps[i]) {
            validDates.push(new Date(timestamps[i] * 1000).toISOString().split('T')[0]);
          }
        }
      }
      
      
      const trimmedPrices = validPrices.slice(-periodDays);
      priceDataCache.set(cacheKey, trimmedPrices);
      
      return { 
        prices: trimmedPrices, 
        dates: validDates.slice(-periodDays) 
      };
      
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < RATE_LIMIT.maxRetries - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, RATE_LIMIT.retryDelayMs * (attempt + 1))
        );
      }
    }
  }
  
  console.error(`Failed to fetch data for ${ticker}:`, lastError?.message);
  return null;
}

export async function fetchMultiplePriceData(
  tickers: string[],
  periodDays: number,
  batchSize: number = 10
): Promise<Map<string, number[]>> {
  const results = new Map<string, number[]>();
  
  
  for (let i = 0; i < tickers.length; i += batchSize) {
    const batch = tickers.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (ticker) => {
      const data = await fetchPriceData(ticker, periodDays);
      if (data && data.prices.length > 0) {
        results.set(ticker, data.prices);
      }
    });
    
    await Promise.all(batchPromises);
    
    
    if (i + batchSize < tickers.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  return results;
}

export function calculateReturns(prices: number[]): number[] {
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

export function alignPriceSeries(
  pricesA: number[],
  pricesB: number[]
): { alignedA: number[]; alignedB: number[] } {
  const minLength = Math.min(pricesA.length, pricesB.length);
  
  return {
    alignedA: pricesA.slice(-minLength),
    alignedB: pricesB.slice(-minLength),
  };
}
