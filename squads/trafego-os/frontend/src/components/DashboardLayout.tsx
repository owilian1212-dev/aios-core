// ============================================================================
// Trafego OS — Dashboard Layout (Multi-Tenant)
// Swiss Precision: Sidebar + Header + Client Selector + Content
// ============================================================================

import { Link, useLocation } from "wouter";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarProvider, SidebarSeparator, SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3, FileText, Users, Settings, ChevronUp, Bell, Search,
  Zap, LogOut, User, Building2, Megaphone, ClipboardList, UserCog,
  ChevronRight, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useEmpresa } from "@/contexts/EmpresaContext";
import { notifications as mockNotifications } from "@/lib/mock-data";
import { getInitials, relativeTime, statusLabel } from "@/lib/formatters";
import type { UserRole } from "@/lib/types";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItemDef {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  roles?: UserRole[];
}

interface NavGroup {
  group: string;
  items: NavItemDef[];
}

const navGroups: NavGroup[] = [
  {
    group: "Principal",
    items: [
      { title: "Dashboard", href: "/", icon: BarChart3 },
      { title: "Campanhas", href: "/campaigns", icon: Megaphone },
      { title: "Relatórios", href: "/reports", icon: FileText, badge: "2" },
      { title: "CRM", href: "/crm", icon: Users },
    ],
  },
  {
    group: "Gestão",
    items: [
      { title: "Clientes", href: "/clients", icon: Building2, roles: ["admin", "gestor"] },
      { title: "Equipe", href: "/users", icon: UserCog, roles: ["admin"] },
    ],
  },
  {
    group: "Sistema",
    items: [
      { title: "Configurações", href: "/settings", icon: Settings, roles: ["admin", "gestor"] },
    ],
  },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location, navigate] = useLocation();
  const { user, logout, isAdmin, isGestor, isCliente, hasRole } = useAuth();
  const { selectedEmpresa, allEmpresas, selectEmpresa, clearSelection, isAllSelected } = useEmpresa();

  if (!user) return null;

  const filteredNavGroups = navGroups.map(g => ({
    ...g,
    items: g.items.filter(item => !item.roles || hasRole(item.roles)),
  })).filter(g => g.items.length > 0);

  const unreadNotifications = mockNotifications.filter(n => !n.read).length;

  const statusColors: Record<string, string> = {
    ativo: "bg-emerald-500",
    onboarding: "bg-amber-500",
    pausado: "bg-gray-400",
    encerrado: "bg-red-400",
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" variant="sidebar">
        {/* Logo / Brand */}
        <SidebarHeader className="px-4 py-4">
          <Link href="/" className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center">
            <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground font-bold text-sm shrink-0">
              T
            </div>
            <span className="text-base font-bold tracking-tight text-foreground group-data-[collapsible=icon]:hidden">
              Trafego OS
            </span>
          </Link>
        </SidebarHeader>

        <SidebarSeparator />

        {/* Client Selector (Admin/Gestor only) */}
        {(isAdmin || isGestor) && (
          <>
            <div className="px-3 py-3 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2">
              <div className="group-data-[collapsible=icon]:hidden">
                <Select
                  value={selectedEmpresa?.id || "all"}
                  onValueChange={(val) => {
                    if (val === "all") clearSelection();
                    else selectEmpresa(val);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs bg-muted/50 border-dashed">
                    <div className="flex items-center gap-2 truncate">
                      <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
                      <SelectValue placeholder="Todos os clientes" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Todos os clientes</span>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1">
                          {allEmpresas.length}
                        </Badge>
                      </div>
                    </SelectItem>
                    {allEmpresas.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        <div className="flex items-center gap-2">
                          <span className={`size-2 rounded-full ${statusColors[emp.status] || "bg-gray-400"}`} />
                          <span>{emp.nome}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Collapsed state: icon only */}
              <div className="hidden group-data-[collapsible=icon]:flex justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" className="size-8">
                      <Building2 className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="start" className="w-52">
                    <DropdownMenuLabel className="text-xs">Selecionar Cliente</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => clearSelection()}>
                      {isAllSelected && <Check className="size-3 mr-2" />}
                      Todos os clientes
                    </DropdownMenuItem>
                    {allEmpresas.map(emp => (
                      <DropdownMenuItem key={emp.id} onClick={() => selectEmpresa(emp.id)}>
                        {selectedEmpresa?.id === emp.id && <Check className="size-3 mr-2" />}
                        {emp.nome}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <SidebarSeparator />
          </>
        )}

        {/* Client info for cliente role */}
        {isCliente && selectedEmpresa && (
          <>
            <div className="px-4 py-3 group-data-[collapsible=icon]:hidden">
              <div className="flex items-center gap-2">
                <div className={`size-2 rounded-full ${statusColors[selectedEmpresa.status] || "bg-gray-400"}`} />
                <span className="text-xs font-medium text-foreground truncate">{selectedEmpresa.nome}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{selectedEmpresa.segmento}</span>
            </div>
            <SidebarSeparator />
          </>
        )}

        {/* Navigation */}
        <SidebarContent>
          {filteredNavGroups.map((group) => (
            <SidebarGroup key={group.group}>
              <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/70">
                {group.group}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                          <Link href={item.href}>
                            <item.icon className="size-4" />
                            <span>{item.title}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="ml-auto text-[10px] h-5 px-1.5 font-semibold">
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarSeparator />

        {/* User Footer */}
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" className="w-full">
                    <Avatar className="size-7">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-[11px] text-muted-foreground capitalize">{user.role}</span>
                    </div>
                    <ChevronUp className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="size-4 mr-2" />
                    Meu Perfil
                  </DropdownMenuItem>
                  {(isAdmin || isGestor) && (
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <Settings className="size-4 mr-2" />
                      Configurações
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { logout(); navigate("/login"); }}>
                    <LogOut className="size-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <SidebarInset>
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/95 backdrop-blur-sm px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-5" />

          {/* Selected empresa indicator */}
          {selectedEmpresa && (
            <>
              <div className="flex items-center gap-2 text-sm">
                <span className={`size-2 rounded-full ${statusColors[selectedEmpresa.status] || "bg-gray-400"}`} />
                <span className="font-medium text-foreground hidden sm:inline">{selectedEmpresa.nome}</span>
                <Badge variant="outline" className="text-[10px] h-5 hidden md:inline-flex">
                  {statusLabel(selectedEmpresa.status)}
                </Badge>
              </div>
              <Separator orientation="vertical" className="h-5" />
            </>
          )}

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              placeholder="Buscar campanhas, leads, relatórios..."
              className="pl-9 h-8 bg-muted/50 border-transparent focus-visible:border-input text-sm"
              aria-label="Buscar campanhas, leads, relatórios"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Sync */}
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground"
              onClick={() => toast.success("Dados sincronizados com sucesso")}
              aria-label="Sincronizar dados"
            >
              <Zap className="size-4" aria-hidden="true" />
            </Button>

            {/* Notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="relative text-muted-foreground"
                  aria-label={`Notificações${unreadNotifications > 0 ? ` (${unreadNotifications} não lidas)` : ""}`}
                  aria-expanded="false"
                >
                  <Bell className="size-4" aria-hidden="true" />
                  {unreadNotifications > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center"
                      aria-label={`${unreadNotifications} notificações não lidas`}
                    >
                      {unreadNotifications}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="p-3 border-b">
                  <h4 className="text-sm font-semibold">Notificações</h4>
                </div>
                <ScrollArea className="h-64">
                  {mockNotifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-3 border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors ${!n.read ? "bg-primary/5" : ""}`}
                      onClick={() => n.link && navigate(n.link)}
                    >
                      <div className="flex items-start gap-2">
                        {!n.read && <span className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{n.title}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{n.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{relativeTime(n.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
