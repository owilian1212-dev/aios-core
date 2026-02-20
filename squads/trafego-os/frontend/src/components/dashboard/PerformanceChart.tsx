// ============================================================================
// Performance Chart — Swiss Precision
// Area chart with spend vs revenue over time
// ============================================================================

import { useMemo, useState, useId } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import type { ChartDataPoint } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PerformanceChartProps {
  data: ChartDataPoint[];
}

type MetricKey = "spend_revenue" | "conversions" | "cpa_roas";

const metricTabs: { key: MetricKey; label: string }[] = [
  { key: "spend_revenue", label: "Investimento vs Receita" },
  { key: "conversions", label: "Conversões" },
  { key: "cpa_roas", label: "CPA / ROAS" },
];

const chartConfigs: Record<MetricKey, ChartConfig> = {
  spend_revenue: {
    spend: { label: "Investimento", color: "oklch(0.55 0.22 260)" },
    revenue: { label: "Receita", color: "oklch(0.55 0.17 160)" },
  },
  conversions: {
    conversions: { label: "Conversões", color: "oklch(0.6 0.18 300)" },
  },
  cpa_roas: {
    cpa: { label: "CPA (R$)", color: "oklch(0.7 0.15 70)" },
    roas: { label: "ROAS", color: "oklch(0.7 0.15 200)" },
  },
};

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const uid = useId();
  const [activeMetric, setActiveMetric] = useState<MetricKey>("spend_revenue");

  const formattedData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      dateLabel: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(d.date)),
    }));
  }, [data]);

  const config = chartConfigs[activeMetric];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-semibold">Performance ao Longo do Tempo</CardTitle>
          <div className="flex gap-1">
            {metricTabs.map((tab) => (
              <Button
                key={tab.key}
                variant={activeMetric === tab.key ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "text-xs h-7",
                  activeMetric === tab.key && "font-semibold"
                )}
                onClick={() => setActiveMetric(tab.key)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={config} className="h-[300px] w-full">
          <AreaChart data={formattedData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.91 0.005 260)" />
            <XAxis
              dataKey="dateLabel"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tickMargin={8}
              interval="preserveStartEnd"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tickMargin={4}
              width={60}
              tickFormatter={(v) =>
                activeMetric === "cpa_roas"
                  ? v.toFixed(1)
                  : v >= 1000
                    ? `${(v / 1000).toFixed(0)}k`
                    : v.toString()
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => String(value)}
                  formatter={(value, name) => {
                    const numVal = Number(value);
                    if (name === "spend" || name === "revenue" || name === "cpa") {
                      return [
                        new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(numVal),
                        config[name as keyof typeof config]?.label || name,
                      ];
                    }
                    if (name === "roas") return [`${numVal.toFixed(2)}x`, "ROAS"];
                    return [numVal.toLocaleString("pt-BR"), config[name as keyof typeof config]?.label || name];
                  }}
                />
              }
            />
            {activeMetric === "spend_revenue" && (
              <>
                <defs>
                  <linearGradient id={`${uid}-gradSpend`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.22 260)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="oklch(0.55 0.22 260)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id={`${uid}-gradRevenue`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.17 160)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="oklch(0.55 0.17 160)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="spend" stroke="oklch(0.55 0.22 260)" fill={`url(#${uid}-gradSpend)`} strokeWidth={2} />
                <Area type="monotone" dataKey="revenue" stroke="oklch(0.55 0.17 160)" fill={`url(#${uid}-gradRevenue)`} strokeWidth={2} />
              </>
            )}
            {activeMetric === "conversions" && (
              <>
                <defs>
                  <linearGradient id={`${uid}-gradConv`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.6 0.18 300)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="oklch(0.6 0.18 300)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="conversions" stroke="oklch(0.6 0.18 300)" fill={`url(#${uid}-gradConv)`} strokeWidth={2} />
              </>
            )}
            {activeMetric === "cpa_roas" && (
              <>
                <defs>
                  <linearGradient id={`${uid}-gradCpa`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.7 0.15 70)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="oklch(0.7 0.15 70)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id={`${uid}-gradRoas`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.7 0.15 200)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="oklch(0.7 0.15 200)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="cpa" stroke="oklch(0.7 0.15 70)" fill={`url(#${uid}-gradCpa)`} strokeWidth={2} />
                <Area type="monotone" dataKey="roas" stroke="oklch(0.7 0.15 200)" fill={`url(#${uid}-gradRoas)`} strokeWidth={2} />
              </>
            )}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
