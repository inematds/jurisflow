import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import {
  AlertCircle,
  Bot,
  Briefcase,
  Calendar,
  CheckSquare,
  DollarSign,
  FileText,
  FolderLock,
  Gavel,
  Headphones,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  Scale,
  Sparkles,
  Users,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export const menuItems = [
  { icon: LayoutDashboard, label: "Painel Geral", path: "/" },
  { icon: Users, label: "Clientes", path: "/clientes" },
  { icon: Scale, label: "Processos", path: "/processos" },
  { icon: Headphones, label: "Atendimentos", path: "/atendimentos" },
  { icon: Calendar, label: "Agenda & Prazos", path: "/agenda" },
  { icon: CheckSquare, label: "Tarefas", path: "/tarefas" },
  { icon: DollarSign, label: "Financeiro", path: "/financeiro" },
  { icon: FileText, label: "Documentos & Modelos", path: "/documentos" },
  { icon: Bot, label: "Assistente Jurídico IA", path: "/assistente-ia" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 270;
const MIN_WIDTH = 220;
const MAX_WIDTH = 400;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-4">
        <div className="flex flex-col items-center gap-6 p-8 max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-center">
          <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-inner">
            <Scale className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              JurisFlow <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-normal">Advocacia</span>
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              Plataforma Completa de Gestão Jurídica, Atendimento e Processos. Conecte-se para acessar o escritório digital.
            </p>
          </div>
          <Button
            onClick={() => startLogin()}
            size="lg"
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold shadow-lg hover:shadow-xl transition-all h-12"
          >
            Entrar no JurisFlow
          </Button>
          <p className="text-xs text-slate-500">
            Acesso seguro em conformidade com sigilo profissional e LGPD.
          </p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({ children, setSidebarWidth }: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find((item) => item.path === location);
  const isMobile = useIsMobile();

  const utils = trpc.useUtils();
  const seedMutation = trpc.seedDemoData.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "Dados de exemplo carregados com sucesso!");
      utils.dashboard.invalidate();
      utils.clients.invalidate();
      utils.lawsuits.invalidate();
      utils.calendar.invalidate();
      utils.tasks.invalidate();
      utils.financial.invalidate();
      utils.documents.invalidate();
    },
    onError: (err) => {
      toast.error("Erro ao gerar dados de demonstração: " + err.message);
    },
  });

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar collapsible="icon" className="border-r border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100" disableTransition={isResizing}>
          <SidebarHeader className="h-16 justify-center border-b border-slate-800/80 px-3">
            <div className="flex items-center gap-3 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0 text-slate-400 hover:text-white"
                aria-label="Alternar navegação"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
              {!isCollapsed && (
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-7 w-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Scale className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm tracking-tight text-white leading-tight">
                      JurisFlow
                    </span>
                    <span className="text-[10px] text-amber-400/90 font-medium leading-tight">
                      Gestão Jurídica
                    </span>
                  </div>
                </div>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 py-3">
            <SidebarMenu className="px-2 space-y-1">
              {menuItems.map((item) => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-10 px-3 rounded-lg transition-all font-medium text-sm flex items-center gap-3 ${
                        isActive
                          ? "bg-amber-500 text-slate-950 font-semibold shadow-sm hover:bg-amber-400"
                          : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                      }`}
                    >
                      <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-slate-950" : "text-slate-400"}`} />
                      <span className="truncate">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>

            {!isCollapsed && (
              <div className="mt-6 px-3">
                <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-amber-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Ambiente Demonstrativo</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Carregue processos, clientes, audiências e contratos modelo com 1 clique.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs h-7 border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-200"
                    disabled={seedMutation.isPending}
                    onClick={() => seedMutation.mutate()}
                  >
                    {seedMutation.isPending ? "Carregando..." : "Gerar Dados Exemplo"}
                  </Button>
                </div>
              </div>
            )}
          </SidebarContent>

          <SidebarFooter className="p-3 border-t border-slate-800/80">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-800 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none">
                  <Avatar className="h-9 w-9 border border-slate-700 shrink-0">
                    <AvatarFallback className="text-xs font-semibold bg-amber-500/20 text-amber-300">
                      {user?.name?.charAt(0).toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate text-white leading-none">
                      {user?.name || "Advogado(a)"}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-1">
                      {user?.email || "OAB Ativa"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800 text-slate-200">
                <DropdownMenuLabel className="font-semibold text-white">Minha Conta</DropdownMenuLabel>
                <div className="px-2 py-1.5 text-xs text-slate-400">
                  Função: {user?.role === "admin" ? "Sócio / Administrador" : "Advogado"}
                </div>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem
                  onClick={() => seedMutation.mutate()}
                  className="cursor-pointer text-xs text-amber-400 focus:bg-slate-800 focus:text-amber-300"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  <span>Popular Dados Exemplo</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="cursor-pointer text-destructive focus:bg-rose-950/40 focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair do JurisFlow</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-amber-500/40 transition-colors ${
            isCollapsed ? "hidden" : ""
          }`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset className="bg-slate-50 dark:bg-slate-950 min-h-screen flex flex-col">
        {/* Barra superior com contexto */}
        <header className="flex h-14 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 backdrop-blur sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="h-8 w-8 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {activeMenuItem?.label ?? "JurisFlow"}
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline-block">| Advocacia & Consultoria Jurídica</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/assistente-ia")}
              className="text-xs gap-1.5 h-8 border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
            >
              <Bot className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Assistente IA</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setLocation("/clientes")}
              className="text-xs gap-1.5 h-8 bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-950 font-medium"
            >
              <Users className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Novo Atendimento</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">{children}</main>
      </SidebarInset>
    </>
  );
}
