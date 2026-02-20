/**
 * Formatters — Fonte Única de Verdade para Formatação de Dados
 * Extraído de mock-data.ts durante Sprint 3 (Refatoração)
 * Usado por: Dashboard, CRM, Campaigns, Reports, Clients, Settings, etc.
 */

/**
 * Formata valor numérico como moeda BRL
 * @example formatCurrency(1500.50) => "R$ 1.500,50"
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Formata número com separador de milhares
 * @example formatNumber(1500) => "1.500"
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

/**
 * Formata número como percentual
 * @example formatPercent(85.5) => "85.50%"
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Formata data como DD/MM/YYYY
 * @example formatDate("2026-02-20") => "20/02/2026"
 */
export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateStr));
}

/**
 * Formata data e hora como DD/MM/YYYY HH:mm
 * @example formatDateTime("2026-02-20T14:30:00") => "20/02/2026 14:30"
 */
export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

/**
 * Formata data como tempo relativo (ex: "5min atrás")
 * @example relativeTime("2026-02-20T14:25:00") => "5min atrás"
 */
export function relativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}min atrás`;
  if (hours < 24) return `${hours}h atrás`;
  if (days < 7) return `${days}d atrás`;
  return formatDate(dateStr);
}

/**
 * Mapeia platform ID para nome exibível
 * @example platformName("meta") => "Meta Ads"
 */
export function platformName(platform: string): string {
  const names: Record<string, string> = {
    meta: "Meta Ads",
    google: "Google Ads",
    tiktok: "TikTok Ads",
    linkedin: "LinkedIn Ads",
    twitter: "X (Twitter)",
    whatsapp: "WhatsApp",
    zapier: "Zapier",
    sheets: "Google Sheets",
    slack: "Slack",
    n8n: "n8n",
    uazapi: "Uazapi",
    organic: "Orgânico",
    referral: "Indicação",
    direct: "Direto",
  };
  return names[platform] || platform;
}

/**
 * Mapeia status code para label em português
 * Suporta: CampaignStatus, LeadStatus, ProjectStatus, ReportStatus, UserRole
 * @example statusLabel("active") => "Ativo"
 */
export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    // CampaignStatus
    active: "Ativo",
    paused: "Pausado",
    completed: "Concluído",
    draft: "Rascunho",
    error: "Erro",
    // LeadStatus
    novo: "Novo",
    contatado: "Contatado",
    qualificado: "Qualificado",
    proposta: "Proposta",
    fechado: "Fechado",
    perdido: "Perdido",
    // ReportStatus
    ready: "Pronto",
    generating: "Gerando",
    sent: "Enviado",
    // IntegrationStatus
    connected: "Conectado",
    disconnected: "Desconectado",
    pending: "Pendente",
    // UserStatus
    invited: "Convidado",
    inactive: "Inativo",
    // ProjectStatus
    ativo: "Ativo",
    onboarding: "Onboarding",
    pausado: "Pausado",
    encerrado: "Encerrado",
    // Other
    pendente: "Pendente",
    em_andamento: "Em Andamento",
    concluido: "Concluído",
  };
  return labels[status] || status;
}

/**
 * Extrai iniciais de um nome (máx 2 caracteres)
 * @example getInitials("João Silva") => "JS"
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
