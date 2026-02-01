export function HowToUse() {
  return (
    <main className="min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-4xl px-6 py-8">
        {}
        <div className="mb-12">
          <h1 className="mb-2 text-2xl font-light tracking-tight text-foreground">
            How to Use This Tool
          </h1>
          <p className="text-sm text-muted-foreground">
            A guide to statistical pairs trading analysis
          </p>
        </div>

        {}
        <div className="space-y-12">
          {}
          <section>
            <h2 className="mb-4 border-b border-border pb-2 text-sm font-semibold uppercase tracking-wider text-foreground">
              What is Pairs Trading?
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                Pairs trading is a market-neutral investment strategy that
                involves simultaneously taking a long position in one security
                and a short position in a related security. The strategy is
                predicated on the assumption that historically correlated
                securities will maintain their statistical relationship over
                time.
              </p>
              <p>
                When the spread between two correlated securities deviates
                significantly from its historical mean, a pairs trader may take
                positions expecting the spread to revert to its average level.
                This approach seeks to profit from relative price movements
                while minimizing exposure to broader market direction.
              </p>
              <p>
                The strategy originated in the 1980s at Morgan Stanley and has
                since become a fundamental technique in quantitative finance.
                It is classified as a statistical arbitrage strategy because it
                relies on quantitative analysis rather than fundamental
                valuation.
              </p>
            </div>
          </section>

          {}
          <section>
            <h2 className="mb-4 border-b border-border pb-2 text-sm font-semibold uppercase tracking-wider text-foreground">
              Understanding the Metrics
            </h2>

            <div className="space-y-8">
              {}
              <div className="border-l-2 border-foreground pl-4">
                <h3 className="mb-2 text-base font-medium text-foreground">
                  Correlation Coefficient
                </h3>
                <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    The Pearson correlation coefficient measures the linear
                    relationship between two securities returns, ranging from
                    -1 to +1.
                  </p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>
                      <span className="font-medium text-foreground">
                        +0.80 to +1.00:
                      </span>{" "}
                      Strong positive correlation; securities move together
                    </li>
                    <li>
                      <span className="font-medium text-foreground">
                        +0.50 to +0.79:
                      </span>{" "}
                      Moderate positive correlation
                    </li>
                    <li>
                      <span className="font-medium text-foreground">
                        Below +0.50:
                      </span>{" "}
                      Weak correlation; generally unsuitable for pairs trading
                    </li>
                  </ul>
                </div>
              </div>

              {}
              <div className="border-l-2 border-border pl-4">
                <h3 className="mb-2 text-base font-medium text-foreground">
                  R-Squared (R²)
                </h3>
                <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    R-squared, or the coefficient of determination, indicates
                    how much of one securitys variance is explained by the
                    other. It is the square of the correlation coefficient.
                  </p>
                  <p>
                    An R² of 0.80 means 80% of the price movement in one
                    security can be explained by movements in the other. Higher
                    R² values indicate more predictable spread behavior, which
                    is desirable for pairs trading.
                  </p>
                </div>
              </div>

              {}
              <div className="border-l-2 border-border pl-4">
                <h3 className="mb-2 text-base font-medium text-foreground">
                  Z-Score
                </h3>
                <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    The z-score measures how many standard deviations the
                    current spread is from its historical mean. It is the
                    primary signal for identifying potential trading
                    opportunities.
                  </p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>
                      <span className="font-medium text-foreground">
                        Z-Score &gt; +2.0:
                      </span>{" "}
                      Spread is significantly above mean; first security may be
                      relatively overvalued
                    </li>
                    <li>
                      <span className="font-medium text-foreground">
                        Z-Score &lt; -2.0:
                      </span>{" "}
                      Spread is significantly below mean; first security may be
                      relatively undervalued
                    </li>
                    <li>
                      <span className="font-medium text-foreground">
                        Z-Score near 0:
                      </span>{" "}
                      Spread is at or near historical equilibrium
                    </li>
                  </ul>
                </div>
              </div>

              {}
              <div className="border-l-2 border-border pl-4">
                <h3 className="mb-2 text-base font-medium text-foreground">
                  Lookback Window
                </h3>
                <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    The lookback window defines the historical period used to
                    calculate the mean and standard deviation of the spread.
                    This parameter significantly affects the stability and
                    sensitivity of signals.
                  </p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>
                      <span className="font-medium text-foreground">
                        Shorter windows (20-40 days):
                      </span>{" "}
                      More sensitive to recent changes; higher signal frequency
                    </li>
                    <li>
                      <span className="font-medium text-foreground">
                        Longer windows (60-120 days):
                      </span>{" "}
                      More stable baseline; fewer but potentially more reliable
                      signals
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {}
          <section>
            <h2 className="mb-4 border-b border-border pb-2 text-sm font-semibold uppercase tracking-wider text-foreground">
              Interpreting the Trade Now List
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                The Trade Now list displays pairs ranked by absolute z-score,
                showing which pairs currently exhibit the largest deviation from
                their historical relationship. Key considerations:
              </p>
              <ul className="ml-4 list-disc space-y-2">
                <li>
                  <span className="font-medium text-foreground">
                    Higher absolute z-scores
                  </span>{" "}
                  indicate larger divergences, but may also signal fundamental
                  changes rather than temporary dislocations
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Spread Direction
                  </span>{" "}
                  indicates which security appears relatively expensive (rich)
                  versus cheap
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Mean-Reversion Confidence
                  </span>{" "}
                  reflects historical stability of the correlation; Stable
                  pairs have shown consistent relationships
                </li>
                <li>
                  <span className="font-medium text-foreground">Sector</span>{" "}
                  context helps understand fundamental linkages between
                  securities
                </li>
              </ul>
            </div>
          </section>

          {}
          <section>
            <h2 className="mb-4 border-b border-border pb-2 text-sm font-semibold uppercase tracking-wider text-foreground">
              Common Mistakes to Avoid
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <ul className="ml-4 list-disc space-y-3">
                <li>
                  <span className="font-medium text-foreground">
                    Regime Shifts:
                  </span>{" "}
                  Correlations can break down during market stress, sector
                  rotations, or when fundamental relationships change. A highly
                  correlated pair may diverge permanently.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Earnings Risk:
                  </span>{" "}
                  Earnings announcements can cause sudden, large moves in
                  individual securities that may not revert to the mean spread.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Overfitting:
                  </span>{" "}
                  Optimizing parameters to historical data may produce signals
                  that do not persist in live trading.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Execution Costs:
                  </span>{" "}
                  The strategy requires trading two securities simultaneously;
                  slippage and commissions can erode returns.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Leverage Risk:
                  </span>{" "}
                  While pairs trading is market-neutral in theory, leveraged
                  positions can still produce significant losses if spreads
                  continue to diverge.
                </li>
              </ul>
            </div>
          </section>

          {}
          <section className="border border-border bg-secondary/30 p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Risk Disclaimer
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                This tool is provided for educational and research purposes
                only. The information and analysis presented do not constitute
                investment advice, trading recommendations, or a solicitation
                to buy or sell any securities.
              </p>
              <p>
                Statistical relationships observed in historical data may not
                persist in the future. Past performance is not indicative of
                future results. All investment strategies involve risk,
                including the potential loss of principal.
              </p>
              <p>
                Before making any investment decisions, consult with a
                qualified financial advisor who understands your specific
                financial situation and risk tolerance.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
