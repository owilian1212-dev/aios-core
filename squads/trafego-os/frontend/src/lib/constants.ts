/**
 * Constants — Fonte Única de Verdade para Configurações de UI
 * Status colors, labels, roles, configurations centralizadas
 * Consolidado de múltiplas páginas durante Sprint 3 (Refatoração)
 */

import {
  Pencil, Loader2, CheckCircle2, Send, AlertCircle,
  Clock, XCircle,
} from "lucide-react";
import type {
  CampaignStatus, ProjectStatus, LeadStatus, ReportStatus,
  UserRole, IntegrationStatus,
} from "./types";

// ============================================================================
// Campaign Status Configuration
// ============================================================================
export const CAMPAIGN_STATUS_CONFIG: Record<CampaignStatus, { color: string; bg: string }> = {
  active: { color: "text-emerald-700", bg: "bg-emerald-50" },
  paused: { color: "text-amber-700", bg: "bg-amber-50" },
  completed: { color: "text-blue-700", bg: "bg-blue-50" },
  draft: { color: "text-gray-600", bg: "bg-gray-100" },
  error: { color: "text-red-700", bg: "bg-red-50" },
};

// ============================================================================
// Project Status Configuration (Clients/Empresas)
// ============================================================================
export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  ativo: { label: "Ativo", color: "text-emerald-700", bg: "bg-emerald-50" },
  onboarding: { label: "Onboarding", color: "text-blue-700", bg: "bg-blue-50" },
  pausado: { label: "Pausado", color: "text-gray-600", bg: "bg-gray-100" },
  encerrado: { label: "Encerrado", color: "text-red-700", bg: "bg-red-50" },
};

// ============================================================================
// Lead Status Configuration (CRM)
// ============================================================================
export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  novo: "bg-blue-500",
  contatado: "bg-amber-500",
  qualificado: "bg-violet-500",
  proposta: "bg-purple-500",
  fechado: "bg-emerald-500",
  perdido: "bg-red-400",
};

export const LEAD_STATUS_BADGE_COLORS: Record<LeadStatus, string> = {
  novo: "bg-blue-50 text-blue-700 border-blue-200",
  contatado: "bg-amber-50 text-amber-700 border-amber-200",
  qualificado: "bg-violet-50 text-violet-700 border-violet-200",
  proposta: "bg-purple-50 text-purple-700 border-purple-200",
  fechado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  perdido: "bg-red-50 text-red-700 border-red-200",
};

// ============================================================================
// Report Status Configuration
// ============================================================================
export const REPORT_STATUS_CONFIG: Record<ReportStatus, { icon: React.ElementType; color: string; bg: string }> = {
  draft: { icon: Pencil, color: "text-muted-foreground", bg: "bg-muted" },
  generating: { icon: Loader2, color: "text-blue-600", bg: "bg-blue-50" },
  ready: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  sent: { icon: Send, color: "text-primary", bg: "bg-primary/10" },
  error: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
};

// ============================================================================
// User Role Configuration
// ============================================================================
export const USER_ROLE_CONFIG: Record<UserRole, { label: string; color: string; bg: string; description: string }> = {
  admin: { label: "Administrador", color: "text-red-700", bg: "bg-red-50", description: "Acesso total ao sistema" },
  gestor: { label: "Gestor", color: "text-violet-700", bg: "bg-violet-50", description: "Gerencia clientes e equipe" },
  analista: { label: "Analista", color: "text-blue-700", bg: "bg-blue-50", description: "Acesso a dashboards e relatórios" },
  cliente: { label: "Cliente", color: "text-emerald-700", bg: "bg-emerald-50", description: "Visualiza seus próprios dados" },
};

export const USER_STATUS_CONFIG = {
  active: { label: "Ativo", icon: CheckCircle2, color: "text-emerald-600" },
  invited: { label: "Convidado", icon: Clock, color: "text-amber-600" },
  inactive: { label: "Inativo", icon: XCircle, color: "text-gray-500" },
};

// ============================================================================
// Integration Status Configuration
// ============================================================================
export const INTEGRATION_STATUS_CONFIG: Record<IntegrationStatus, { icon: React.ElementType; color: string; bg: string }> = {
  connected: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  disconnected: { icon: XCircle, color: "text-gray-500", bg: "bg-gray-100" },
  error: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
  pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
};
