"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface PairData {
  rank: number;
  tickerA: string;
  tickerB: string;
  sector: string;
  correlation: number;
  rSquared: number;
  zScore: number;
  direction: string;
  confidence: "Stable" | "Medium" | "Weak";
  absZScore: number;
}

interface TradeNowResponse {
  success: boolean;
  pairs: PairData[];
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

const sectorDisplayNames: Record<string, string> = {
  "Technology": "Technology",
  "Financials": "Financials",
  "Healthcare": "Healthcare",
  "Consumer Discretionary": "Consumer Disc.",
  "Consumer Staples": "Consumer Staples",
  "Energy": "Energy",
  "Industrials": "Industrials",
  "Communication Services": "Communication",
  "Utilities": "Utilities",
  "Materials": "Materials",
  "Real Estate": "Real Estate",
};

export function TradeNow() {
  
  
  const [lookbackWindow, setLookbackWindow] = useState("35");
  const [zScoreWindow, setZScoreWindow] = useState("10");
  const [timePeriod, setTimePeriod] = useState("252");
  const [pairs, setPairs] = useState<PairData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<TradeNowResponse["metadata"] | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchPairs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        lookbackWindow,
        zScoreWindow,
        timePeriod,
      });

      const response = await fetch(`/api/pairs?${params.toString()}`);
      const data: TradeNowResponse = await response.json();

      if (!data.success) {
        setError(data.error || "Failed to fetch pairs");
        setPairs([]);
      } else {
        setPairs(data.pairs);
        setMetadata(data.metadata);
      }
    } catch (err) {
      setError("Failed to connect to server. Please try again.");
      setPairs([]);
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, [lookbackWindow, zScoreWindow, timePeriod]);

  
  useEffect(() => {
    fetchPairs();
  }, []); 

  const handleUpdateResults = () => {
    fetchPairs();
  };

  return (
    <main className="min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {}
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-light tracking-tight text-foreground">
            Trade Now Pairs
          </h1>
          <p className="text-sm text-muted-foreground">
            Top 20 pairs ranked by absolute z-score divergence from historical
            mean
          </p>
        </div>

        {}
        <div className="mb-8 border border-border bg-card p-6">
          <div className="mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Parameters
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="lookback" className="text-xs text-muted-foreground">
                Lookback Window (days)
              </Label>
              <Input
                id="lookback"
                type="number"
                value={lookbackWindow}
                onChange={(e) => setLookbackWindow(e.target.value)}
                className="h-9"
              />
              <p className="text-xs text-muted-foreground">
                Defines historical period for calculating mean relationship
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zscore" className="text-xs text-muted-foreground">
                Z-Score Window (days)
              </Label>
              <Input
                id="zscore"
                type="number"
                value={zScoreWindow}
                onChange={(e) => setZScoreWindow(e.target.value)}
                className="h-9"
              />
              <p className="text-xs text-muted-foreground">
                Rolling window for computing current spread deviation
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="period" className="text-xs text-muted-foreground">
                Time Period (days)
              </Label>
              <Input
                id="period"
                type="number"
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="h-9"
              />
              <p className="text-xs text-muted-foreground">
                Total historical data range for analysis
              </p>
            </div>
            <div className="flex items-end">
              <Button
                className="h-9 w-full"
                onClick={handleUpdateResults}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Update Results"}
              </Button>
            </div>
          </div>
        </div>

        {}
        {error && (
          <div className="mb-8 border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {}
        {isLoading && !hasLoaded && (
          <div className="border border-border bg-card p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">
              Analyzing pairs across S&P 500 stocks...
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              This may take up to 30 seconds on first load
            </p>
          </div>
        )}

        {}
        {pairs.length > 0 && (
        <div className="border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Rank
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Pair
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Sector
                </TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-foreground">
                  Correlation
                </TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-foreground">
                  R²
                </TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-foreground">
                  Z-Score
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Spread Direction
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Mean-Reversion
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pairs.map((pair) => (
                <TableRow
                  key={`${pair.tickerA}-${pair.tickerB}`}
                  className={cn(
                    "hover:bg-secondary/30",
                    isLoading && "opacity-50"
                  )}
                >
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {pair.rank}
                  </TableCell>
                  <TableCell className="font-mono text-sm font-medium text-foreground">
                    {pair.tickerA} / {pair.tickerB}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {sectorDisplayNames[pair.sector] || pair.sector}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-foreground">
                    {pair.correlation.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-muted-foreground">
                    {pair.rSquared.toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-mono text-sm font-semibold",
                      Math.abs(pair.zScore) >= 2
                        ? "text-foreground"
                        : Math.abs(pair.zScore) >= 1.5
                          ? "text-foreground/80"
                          : "text-muted-foreground"
                    )}
                  >
                    {pair.zScore > 0 ? "+" : ""}
                    {pair.zScore.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {pair.direction}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-block rounded px-2 py-0.5 text-xs font-medium",
                        pair.confidence === "Stable"
                          ? "bg-secondary text-foreground"
                          : pair.confidence === "Medium"
                            ? "bg-secondary/70 text-muted-foreground"
                            : "bg-secondary/40 text-muted-foreground"
                      )}
                    >
                      {pair.confidence}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        )}

        {}
        {!isLoading && hasLoaded && pairs.length === 0 && !error && (
          <div className="border border-dashed border-border bg-secondary/20 p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No pairs found matching the criteria. Try adjusting the parameters.
            </p>
          </div>
        )}

        {}
        {metadata && pairs.length > 0 && (
          <div className="mt-4 text-xs text-muted-foreground">
            <p>
              Analyzed {metadata.totalPairsAnalyzed} pairs, {metadata.validPairs} met criteria.
              Data range: {metadata.dataRange.start} to {metadata.dataRange.end}.
            </p>
          </div>
        )}

        {}
        <div className="mt-6 border-l-2 border-border pl-4">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold">Disclaimer:</span> The data
            presented above is for informational and research purposes only.
            Z-scores and correlation metrics do not constitute trading signals,
            recommendations, or financial advice. Past statistical relationships
            do not guarantee future performance. Always conduct independent
            analysis and consult qualified professionals before making
            investment decisions.
          </p>
        </div>
      </div>
    </main>
  );
}
