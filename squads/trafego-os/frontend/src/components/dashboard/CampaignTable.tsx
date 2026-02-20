// ============================================================================
// Campaign Table — Swiss Precision
// Sortable table with platform icons and status badges
// ============================================================================

import { useState, useMemo } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown, ArrowUp, ArrowDown, ExternalLink,
} from "lucide-react";
import type { CampaignMetric } from "@/lib/types";
import { formatCurrency, formatNumber, formatPercent, platformName, statusLabel } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import PlatformIcon from "@/components/shared/PlatformIcon";

interface CampaignTableProps {
  data: CampaignMetric[];
}

type SortKey = keyof CampaignMetric;
type SortDir = "asc" | "desc";

const statusVariant: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  paused: "bg-warning/10 text-warning border-warning/20",
  completed: "bg-muted text-muted-foreground border-border",
  draft: "bg-muted text-muted-foreground border-border",
  error: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function CampaignTable({ data }: CampaignTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [data, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function SortHeader({ label, field }: { label: string; field: SortKey }) {
    const isActive = sortKey === field;
    const sortState = isActive ? (sortDir === "asc" ? "crescente" : "decrescente") : "não ordenado";
    return (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 gap-1 text-xs font-semibold"
        onClick={() => toggleSort(field)}
        aria-sort={isActive ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
        aria-label={`${label} - ${sortState} - Clique para ordenar`}
      >
        {label}
        {isActive ? (
          sortDir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />
        ) : (
          <ArrowUpDown className="size-3 opacity-40" />
        )}
      </Button>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[280px]" scope="col">
              <SortHeader label="Campanha" field="campaignName" />
            </TableHead>
            <TableHead scope="col"><SortHeader label="Plataforma" field="platform" /></TableHead>
            <TableHead scope="col"><SortHeader label="Status" field="status" /></TableHead>
            <TableHead className="text-right" scope="col"><SortHeader label="Investimento" field="spend" /></TableHead>
            <TableHead className="text-right" scope="col"><SortHeader label="Cliques" field="clicks" /></TableHead>
            <TableHead className="text-right" scope="col"><SortHeader label="CTR" field="ctr" /></TableHead>
            <TableHead className="text-right" scope="col"><SortHeader label="Conv." field="conversions" /></TableHead>
            <TableHead className="text-right" scope="col"><SortHeader label="CPA" field="cpa" /></TableHead>
            <TableHead className="text-right" scope="col"><SortHeader label="ROAS" field="roas" /></TableHead>
            <TableHead className="text-right" scope="col"><SortHeader label="Receita" field="revenue" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((row) => (
            <TableRow key={row.id} className="group">
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <span className="truncate max-w-[240px]">{row.campaignName}</span>
                  <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <PlatformIcon platform={row.platform} className="size-4" />
                  <span className="text-xs text-muted-foreground">{platformName(row.platform)}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={cn("text-[10px] font-medium", statusVariant[row.status])}>
                  {statusLabel(row.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-right tabular-nums font-medium">{formatCurrency(row.spend)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatNumber(row.clicks)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatPercent(row.ctr)}</TableCell>
              <TableCell className="text-right tabular-nums font-medium">{formatNumber(row.conversions)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(row.cpa)}</TableCell>
              <TableCell className="text-right tabular-nums">
                <span className={cn(
                  "font-medium",
                  row.roas >= 4 ? "text-success" : row.roas >= 2 ? "text-foreground" : "text-destructive"
                )}>
                  {row.roas.toFixed(2)}x
                </span>
              </TableCell>
              <TableCell className="text-right tabular-nums font-medium">{formatCurrency(row.revenue)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
