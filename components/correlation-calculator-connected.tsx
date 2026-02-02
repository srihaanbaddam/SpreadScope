"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AssessmentType =
  | "statistically-tradable"
  | "high-correlation-unstable"
  | "low-correlation"
  | null;

interface CalculationResult {
  tickerA: string;
  tickerB: string;
  correlation: number;
  rSquared: number;
  currentZScore: number;
  zScoreRange: { min: number; max: number };
  assessment: AssessmentType;
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
}

interface CorrelationResponse {
  success: boolean;
  data?: CalculationResult;
  error?: string;
}

export function CorrelationCalculator() {
  const [tickerA, setTickerA] = useState("");
  const [tickerB, setTickerB] = useState("");
  const [lookbackWindow, setLookbackWindow] = useState("180");
  const [timePeriod, setTimePeriod] = useState("360");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    if (!tickerA || !tickerB) return;

    setIsCalculating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/correlation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tickerA: tickerA.trim().toUpperCase(),
          tickerB: tickerB.trim().toUpperCase(),
          lookbackWindow: parseInt(lookbackWindow),
          timePeriod: parseInt(timePeriod),
        }),
      });

      const data: CorrelationResponse = await response.json();

      if (!data.success) {
        setError(data.error || "Calculation failed");
        setResult(null);
      } else if (data.data) {
        setResult(data.data);
        setError(null);
      }
    } catch (err) {
      setError("Failed to connect to server. Please try again.");
      setResult(null);
    } finally {
      setIsCalculating(false);
    }
  };

  const getAssessmentConfig = (assessment: AssessmentType) => {
    switch (assessment) {
      case "statistically-tradable":
        return {
          label: "Statistically Tradable",
          description:
            "This pair exhibits strong correlation stability and may be suitable for statistical arbitrage analysis.",
          className: "border-foreground bg-secondary text-foreground",
        };
      case "high-correlation-unstable":
        return {
          label: "High Correlation, Unstable",
          description:
            "While correlation appears high, the relationship shows instability. Exercise caution and consider shorter lookback periods.",
          className: "border-border bg-secondary/70 text-muted-foreground",
        };
      case "low-correlation":
        return {
          label: "Low Correlation – Avoid",
          description:
            "Insufficient correlation for pairs trading. The statistical relationship is too weak to support mean-reversion assumptions.",
          className: "border-border bg-secondary/40 text-muted-foreground",
        };
      default:
        return null;
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-4xl px-6 py-8">
        {}
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-light tracking-tight text-foreground">
            Correlation Calculator
          </h1>
          <p className="text-sm text-muted-foreground">
            Analyze the statistical relationship between any two securities
          </p>
        </div>

        {}
        <div className="mb-8 border border-border bg-card p-6">
          <div className="mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Security Inputs
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Enter S&P 500 stock tickers (e.g., AAPL, MSFT) or index tickers with ^ prefix
              (e.g., ^GSPC, ^NDX)
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="tickerA" className="text-xs text-muted-foreground">
                Security A
              </Label>
              <Input
                id="tickerA"
                type="text"
                placeholder="e.g., AAPL or ^GSPC"
                value={tickerA}
                onChange={(e) => setTickerA(e.target.value.toUpperCase())}
                className="h-10 font-mono"
                disabled={isCalculating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tickerB" className="text-xs text-muted-foreground">
                Security B
              </Label>
              <Input
                id="tickerB"
                type="text"
                placeholder="e.g., MSFT or ^NDX"
                value={tickerB}
                onChange={(e) => setTickerB(e.target.value.toUpperCase())}
                className="h-10 font-mono"
                disabled={isCalculating}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleCalculate}
                disabled={!tickerA || !tickerB || isCalculating}
                className="h-10 w-full"
              >
                {isCalculating ? "Calculating..." : "Calculate"}
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 border-t border-border pt-6">
            <div className="space-y-2">
              <Label htmlFor="lookback" className="text-xs text-muted-foreground">
                Lookback Window (days)
              </Label>
              <Input
                id="lookback"
                type="number"
                min="30"
                max="500"
                value={lookbackWindow}
                onChange={(e) => setLookbackWindow(e.target.value)}
                className="h-9"
                disabled={isCalculating}
              />
              <p className="text-xs text-muted-foreground">
                Historical period for calculating mean relationship
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="period" className="text-xs text-muted-foreground">
                Time Period (days)
              </Label>
              <Input
                id="period"
                type="number"
                min="60"
                max="1000"
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="h-9"
                disabled={isCalculating}
              />
              <p className="text-xs text-muted-foreground">
                Total historical data range for analysis
              </p>
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
        {result && (
          <div className="space-y-6">
            {}
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Analyzing
              </p>
              <p className="font-mono text-xl font-medium">
                {result.tickerA} / {result.tickerB}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Based on {result.dataPoints} data points
              </p>
            </div>

            {}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border border-border bg-card p-6">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Correlation Coefficient
                </p>
                <p className="font-mono text-3xl font-light text-foreground">
                  {result.correlation.toFixed(4)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Pearson correlation between price returns
                </p>
              </div>

              <div className="border border-border bg-card p-6">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  R-Squared (R²)
                </p>
                <p className="font-mono text-3xl font-light text-foreground">
                  {result.rSquared.toFixed(4)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Variance explained by the linear relationship
                </p>
              </div>

              <div className="border border-border bg-card p-6">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Current Z-Score
                </p>
                <p
                  className={cn(
                    "font-mono text-3xl font-light",
                    Math.abs(result.currentZScore) >= 2
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {result.currentZScore > 0 ? "+" : ""}
                  {result.currentZScore.toFixed(4)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Standard deviations from historical mean spread
                </p>
              </div>

              <div className="border border-border bg-card p-6">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Historical Z-Score Range
                </p>
                <p className="font-mono text-3xl font-light text-foreground">
                  {result.zScoreRange.min.toFixed(2)} /{" "}
                  {result.zScoreRange.max.toFixed(2)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Min / Max z-scores observed in lookback period
                </p>
              </div>
            </div>

            {}
            {result.assessment && (
              <div
                className={cn(
                  "border-l-4 p-6",
                  getAssessmentConfig(result.assessment)?.className
                )}
              >
                <p className="mb-2 text-sm font-semibold uppercase tracking-wider">
                  {result.assessmentDetails?.label || getAssessmentConfig(result.assessment)?.label}
                </p>
                <p className="text-sm leading-relaxed">
                  {result.assessmentDetails?.description || getAssessmentConfig(result.assessment)?.description}
                </p>
              </div>
            )}

            {}
            <div className="border-l-2 border-border pl-4">
              <p className="text-xs text-muted-foreground">
                Results are based on historical data and do not guarantee future
                performance. This analysis is for research purposes only and
                does not constitute financial advice.
              </p>
            </div>
          </div>
        )}

        {}
        {!result && !error && !isCalculating && (
          <div className="border border-dashed border-border bg-secondary/20 p-12 text-center">
            <p className="text-sm text-muted-foreground">
              Enter two securities above to analyze their statistical
              relationship
            </p>
          </div>
        )}

        {}
        {isCalculating && (
          <div className="border border-border bg-card p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">
              Fetching data and computing statistics...
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
