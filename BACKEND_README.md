# Pairs Trading Dashboard - Backend Architecture

## Overview

This backend serves as a **quantitative research engine** for statistical pairs trading analysis. It is designed to be fully deployable on **Vercel** using serverless functions.

## Architecture

```
lib/
├── constants.ts      # S&P 500 constituents, sectors, thresholds
├── types.ts          # TypeScript type definitions
├── cache.ts          # In-memory caching layer
├── data-fetcher.ts   # Yahoo Finance data fetching
├── statistics.ts     # Statistical computation engine
└── pairs-engine.ts   # Main pairs trading logic

app/api/
├── pairs/route.ts       # Trade Now endpoint
├── correlation/route.ts # Correlation Calculator endpoint
├── validate/route.ts    # Ticker validation endpoint
├── sectors/route.ts     # Available sectors endpoint
└── health/route.ts      # Health check endpoint
```

## API Endpoints

### 1. Trade Now Pairs
**GET** `/api/pairs`

Returns top 20 pairs ranked by absolute z-score divergence.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| lookbackWindow | number | 60 | Days for mean calculation (10-252) |
| zScoreWindow | number | 20 | Days for z-score calculation (5-60) |
| timePeriod | number | 252 | Total historical period (60-756) |
| sector | string | - | Optional sector filter |

**Response:**
```json
{
  "success": true,
  "pairs": [
    {
      "rank": 1,
      "tickerA": "XOM",
      "tickerB": "CVX",
      "sector": "Energy",
      "correlation": 0.94,
      "rSquared": 0.88,
      "zScore": 2.41,
      "direction": "XOM rich / CVX cheap",
      "confidence": "Stable",
      "absZScore": 2.41
    }
  ],
  "params": { ... },
  "metadata": {
    "totalPairsAnalyzed": 150,
    "validPairs": 45,
    "timestamp": "2026-02-01T...",
    "dataRange": { "start": "2025-02-01", "end": "2026-02-01" }
  }
}
```

### 2. Correlation Calculator
**POST** `/api/correlation`

Analyzes the statistical relationship between two specific securities.

**Request Body:**
```json
{
  "tickerA": "AAPL",
  "tickerB": "MSFT",
  "lookbackWindow": 60,
  "timePeriod": 252
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tickerA": "AAPL",
    "tickerB": "MSFT",
    "correlation": 0.87,
    "rSquared": 0.76,
    "currentZScore": 1.45,
    "zScoreRange": { "min": -2.5, "max": 2.8 },
    "assessment": "statistically-tradable",
    "assessmentDetails": {
      "label": "Statistically Tradable",
      "description": "This pair exhibits strong correlation stability..."
    },
    "spread": { "current": 0.45, "mean": 0.42, "std": 0.03 },
    "dataPoints": 252
  }
}
```

### 3. Ticker Validation
**GET** `/api/validate?ticker=AAPL`

Validates if a ticker is in S&P 500 or is an allowed index.

### 4. Available Sectors
**GET** `/api/sectors`

Returns list of available sectors for filtering.

### 5. Health Check
**GET** `/api/health`

Returns API status and cache statistics.

## Statistical Methodology

### Correlation Calculation
- Uses **Pearson correlation coefficient** on daily **price returns** (not prices)
- Returns are more stationary than prices, providing better correlation estimates
- Formula: `r = Σ((xi - x̄)(yi - ȳ)) / (n × σx × σy)`

### R² (Coefficient of Determination)
- Simply the square of correlation: `R² = r²`
- Represents variance explained by the linear relationship
- Threshold for tradable pairs: ≥ 0.5

### Spread Calculation
- Uses **log spread**: `spread = ln(Price_A) - ln(Price_B)`
- Log spreads are more normally distributed
- Better handles large price differences between assets

### Z-Score Calculation
- Formula: `Z = (current_spread - mean_spread) / std_spread`
- Uses lookback window for mean/std calculation
- Positive Z: Asset A is relatively expensive
- Negative Z: Asset A is relatively cheap

### Stability Assessment
- Measures rolling correlation consistency over 30-day windows
- **Stable**: ≥85% of windows above correlation threshold
- **Medium**: ≥65% of windows above threshold
- **Weak**: <65% of windows above threshold

### Assessment Classification
1. **Statistically Tradable**: Correlation ≥ 0.8, R² ≥ 0.6
2. **High Correlation, Unstable**: Correlation ≥ 0.7, R² < 0.6
3. **Low Correlation – Avoid**: Correlation < 0.7

## Asset Universe

### S&P 500 Stocks Only
- ~250 representative stocks from all 11 GICS sectors
- Non-S&P 500 stocks are **rejected**
- Sector-based pair formation for better cointegration

### Allowed Indices
- `^GSPC` / `^SPX` - S&P 500
- `^NDX` - Nasdaq 100
- `^IXIC` - Nasdaq Composite
- `^DJI` - Dow Jones
- `^RUT` - Russell 2000
- `^VIX` - VIX Volatility Index

## Caching Strategy

| Cache Type | TTL | Purpose |
|------------|-----|---------|
| Price Data | 1 hour | Market data doesn't change after close |
| Pairs Results | 15 min | Allow reasonable refresh rate |
| Correlation | 5 min | Quick lookups for same pair |

## Performance Optimizations

1. **Batch Processing**: Price data fetched in parallel batches of 10
2. **Rate Limiting**: 5 requests/second to Yahoo Finance
3. **Serverless-Friendly**: No long-running operations
4. **Edge Caching**: Response Cache-Control headers for CDN caching
5. **Representative Subset**: Uses ~80 liquid stocks vs full S&P 500

## Error Handling

| Error Code | Description |
|------------|-------------|
| INVALID_TICKER | Ticker format is invalid |
| TICKER_NOT_IN_SP500 | Stock not in S&P 500 |
| INSUFFICIENT_DATA | Not enough historical data |
| FETCH_ERROR | Failed to fetch from Yahoo Finance |
| INVALID_PARAMS | Invalid parameter values |
| RATE_LIMITED | Too many requests |

## Deployment (Vercel)

### Configuration
```json
// vercel.json (optional)
{
  "functions": {
    "app/api/pairs/route.ts": {
      "maxDuration": 60
    }
  }
}
```

### Environment Variables
No environment variables required. All configuration is in `lib/constants.ts`.

### Limits
- Trade Now endpoint: 60s max duration (Vercel Pro)
- Correlation endpoint: 30s max duration
- Memory: Standard Node.js runtime

## Disclaimer

This system is designed for **quantitative research purposes only**. It does not:
- Execute trades automatically
- Connect to any brokerage
- Provide financial advice
- Guarantee future performance

Z-scores and correlation metrics are statistical measures based on historical data. Past relationships do not guarantee future behavior.
