import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Homepage() {
  return (
    <main className="min-h-[calc(100vh-4rem)]">
      {}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Quantitative Research Tool
            </p>
            <h1 className="mb-6 text-4xl font-light tracking-tight text-foreground md:text-5xl">
              Statistical Pairs Trading Analysis
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              Pairs trading is a market-neutral relative value strategy that
              exploits temporary divergences between historically correlated
              securities. By simultaneously holding long and short positions in
              related assets, the strategy seeks to profit from mean reversion
              while minimizing directional market exposure.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="gap-2">
                <Link href="/trade-now">
                  View Trade Now Pairs
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/calculator">Analyze a Custom Pair</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-12 md:grid-cols-3">
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
                Idea Generation
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Screen for statistically significant pairs across sectors and
                asset classes. Identify divergences that exceed historical norms
                based on configurable z-score thresholds.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
                Diagnostic Analysis
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Evaluate correlation stability, spread dynamics, and
                mean-reversion characteristics. Assess the statistical validity
                of potential trades before execution.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
                Research Focus
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                This tool provides quantitative analysis for research purposes.
                It does not execute trades, provide recommendations, or
                constitute financial advice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="mb-8 text-sm font-semibold uppercase tracking-wider text-foreground">
            Core Metrics
          </h2>
          <div className="grid gap-8 md:grid-cols-4">
            <div className="border-l-2 border-foreground pl-4">
              <p className="mb-1 text-2xl font-light text-foreground">
                Correlation
              </p>
              <p className="text-sm text-muted-foreground">
                Measures linear relationship strength between two securities
              </p>
            </div>
            <div className="border-l-2 border-border pl-4">
              <p className="mb-1 text-2xl font-light text-foreground">R²</p>
              <p className="text-sm text-muted-foreground">
                Coefficient of determination indicating fit quality
              </p>
            </div>
            <div className="border-l-2 border-border pl-4">
              <p className="mb-1 text-2xl font-light text-foreground">
                Z-Score
              </p>
              <p className="text-sm text-muted-foreground">
                Standard deviations from the mean spread relationship
              </p>
            </div>
            <div className="border-l-2 border-border pl-4">
              <p className="mb-1 text-2xl font-light text-foreground">
                Lookback
              </p>
              <p className="text-sm text-muted-foreground">
                Historical window defining the baseline relationship
              </p>
            </div>
          </div>
        </div>
      </section>

      {}
      <footer className="bg-card">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-xs text-muted-foreground">
              SpreadScope is a research tool for educational purposes only. Not
              financial advice.
            </p>
            <div className="flex gap-6">
              <Link
                href="/how-to-use"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Documentation
              </Link>
              <Link
                href="/calculator"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Calculator
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
