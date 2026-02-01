

import type { CacheEntry } from './types';

const CACHE_CONFIG = {
  
  PRICE_DATA_TTL: 60 * 60 * 1000,
  
  
  PAIRS_RESULT_TTL: 15 * 60 * 1000,
  
  
  CORRELATION_TTL: 5 * 60 * 1000,
  
  
  MAX_PRICE_ENTRIES: 100,
  MAX_RESULT_ENTRIES: 10,
};

const priceCache = new Map<string, CacheEntry<number[]>>();
const pairsResultCache = new Map<string, CacheEntry<unknown>>();
const correlationCache = new Map<string, CacheEntry<unknown>>();

export function getPriceCacheKey(ticker: string, period: number): string {
  return `price:${ticker}:${period}`;
}

export function getPairsCacheKey(
  lookback: number,
  zScoreWindow: number,
  period: number,
  sector?: string
): string {
  return `pairs:${lookback}:${zScoreWindow}:${period}:${sector || 'all'}`;
}

export function getCorrelationCacheKey(
  tickerA: string,
  tickerB: string,
  lookback: number,
  period: number
): string {
  
  const [first, second] = [tickerA, tickerB].sort();
  return `corr:${first}:${second}:${lookback}:${period}`;
}

function getCacheItem<T>(
  cache: Map<string, CacheEntry<T>>,
  key: string
): T | null {
  const entry = cache.get(key);
  
  if (!entry) {
    return null;
  }
  
  const now = Date.now();
  if (now > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

function setCacheItem<T>(
  cache: Map<string, CacheEntry<T>>,
  key: string,
  data: T,
  ttl: number,
  maxEntries: number
): void {
  
  if (cache.size >= maxEntries) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) {
      cache.delete(oldestKey);
    }
  }
  
  const now = Date.now();
  cache.set(key, {
    data,
    timestamp: now,
    expiresAt: now + ttl,
  });
}

export const priceDataCache = {
  get(key: string): number[] | null {
    return getCacheItem(priceCache, key);
  },
  
  set(key: string, data: number[]): void {
    setCacheItem(
      priceCache,
      key,
      data,
      CACHE_CONFIG.PRICE_DATA_TTL,
      CACHE_CONFIG.MAX_PRICE_ENTRIES
    );
  },
  
  clear(): void {
    priceCache.clear();
  },
  
  size(): number {
    return priceCache.size;
  },
};

export const pairsCache = {
  get<T>(key: string): T | null {
    return getCacheItem(pairsResultCache, key) as T | null;
  },
  
  set<T>(key: string, data: T): void {
    setCacheItem(
      pairsResultCache,
      key,
      data,
      CACHE_CONFIG.PAIRS_RESULT_TTL,
      CACHE_CONFIG.MAX_RESULT_ENTRIES
    );
  },
  
  clear(): void {
    pairsResultCache.clear();
  },
};

export const corrCache = {
  get<T>(key: string): T | null {
    return getCacheItem(correlationCache, key) as T | null;
  },
  
  set<T>(key: string, data: T): void {
    setCacheItem(
      correlationCache,
      key,
      data,
      CACHE_CONFIG.CORRELATION_TTL,
      CACHE_CONFIG.MAX_RESULT_ENTRIES
    );
  },
  
  clear(): void {
    correlationCache.clear();
  },
};

export function clearAllCaches(): void {
  priceDataCache.clear();
  pairsCache.clear();
  corrCache.clear();
}

export function getCacheStats(): {
  priceEntries: number;
  pairsEntries: number;
  correlationEntries: number;
} {
  return {
    priceEntries: priceCache.size,
    pairsEntries: pairsResultCache.size,
    correlationEntries: correlationCache.size,
  };
}
