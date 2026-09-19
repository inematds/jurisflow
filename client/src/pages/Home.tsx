import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Gavel,
  Headphones,
  Plus,
  Scale,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  const { data: metrics, isLoading: loadingMetrics } = trpc.dashboard.metrics.useQuery();
  const { data: events, isLoading: loadingEvents } = trpc.dashboard.upcomingEvents.useQuery();
  const { data: lawsuits, isLoading: loadingLawsuits } = trpc.dashboard.recentLawsuits.useQuery();
  const utils = trpc.useUtils();

  const toggleEventMutation = trpc.calendar.toggleCompleted.useMutation({
    onSuccess: () => {
      utils.dashboard.invalidate();
      utils.calendar.invalidate();
    },
  });

  const formatCurrency = (val?: number) => {
    return (val || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const formatDate = (date?: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Banner de Boas-Vindas */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white rounded-2xl p-6 shadow-md border border-slate-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                Escritório Jurídico Digital
              </span>
              <span className="text-xs text-slate-400">JurisFlow 2026</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Painel de Controle & Atendimentos
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Monitore prazos fatais, audiências agendadas, fluxo financeiro e o andamento processual de todos os clientes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={() => setLocation("/clientes")}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold shadow-sm text-xs h-9 gap-1.5"
            >
              <Users className="h-4 w-4" />
              Novo Cliente
            </Button>
            <Button
              onClick={() => setLocation("/processos")}
              variant="outline"
              className="border-slate-600 bg-slate-800/80 hover:bg-slate-700 text-white text-xs h-9 gap-1.5"
            >
              <Scale className="h-4 w-4" />
              Distribuir Processo
            </Button>
          </div>
        </div>

        {/* Métricas Principais em Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Processos Ativos */}
          <Card className="shadow-sm border-slate-200 dark:border-slate-800 hover:border-slate-300 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Processos em Andamento
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Scale className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {loadingMetrics ? "..." : metrics?.activeLawsuits || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span className="text-emerald-600 font-medium">Acompanhados</span> no TJ, TRT e TRF
              </p>
            </CardContent>
          </Card>

          {/* Prazos Fatais */}
          <Card className="shadow-sm border-slate-200 dark:border-slate-800 hover:border-amber-400/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Prazos Fatais Pendentes
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {loadingMetrics ? "..." : metrics?.pendingDeadlines || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                Contagem em dias úteis (CPC/CLT)
              </p>
            </CardContent>
          </Card>

          {/* Audiências Próximas */}
          <Card className="shadow-sm border-slate-200 dark:border-slate-800 hover:border-purple-400/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Audiências Pautadas
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Gavel className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {loadingMetrics ? "..." : metrics?.upcomingHearings || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Conciliação, Instrução e Julgamento
              </p>
            </CardContent>
          </Card>

          {/* Saldo / Honorários */}
          <Card className="shadow-sm border-slate-200 dark:border-slate-800 hover:border-emerald-400/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Receita em Honorários
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <DollarSign className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {loadingMetrics ? "..." : formatCurrency(metrics?.revenueThisMonth)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Líquido recebido este período
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Linha dupla: Prazos e Audiências Próximas & Processos Recentes */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {/* Prazos e Audiências (4 colunas) */}
          <Card className="lg:col-span-4 shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  Próximos Prazos & Audiências
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Itens prioritários que demandam ação do escritório
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/agenda")}
                className="text-xs gap-1 text-amber-600 hover:text-amber-700 dark:text-amber-400"
              >
                Ver Agenda
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingEvents ? (
                <div className="text-center py-6 text-xs text-muted-foreground">Carregando compromissos...</div>
              ) : !events || events.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-xl p-4 text-xs text-muted-foreground">
                  Nenhum prazo urgente ou audiência agendada no momento.
                </div>
              ) : (
                events.slice(0, 5).map((item) => {
                  const ev = item.event;
                  const isPrazo = ev.type === "prazo_fatal";
                  return (
                    <div
                      key={ev.id}
                      className="flex items-start justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          onClick={() => toggleEventMutation.mutate({ id: ev.id, isCompleted: !ev.isCompleted })}
                          className={`mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                            ev.isCompleted
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-slate-300 dark:border-slate-600 hover:border-amber-500"
                          }`}
                        >
                          {ev.isCompleted && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </button>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold truncate ${ev.isCompleted ? "line-through text-muted-foreground" : "text-slate-900 dark:text-slate-100"}`}>
                            {ev.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {formatDate(ev.startAt)}
                            </span>
                            {item.lawsuitCnj && (
                              <span className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px] font-mono">
                                {item.lawsuitCnj}
                              </span>
                            )}
                            {item.clientName && (
                              <span className="truncate max-w-[140px] text-[11px]">
                                Cliente: {item.clientName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Badge
                        variant={isPrazo ? "destructive" : "default"}
                        className="text-[10px] shrink-0 uppercase tracking-wide font-medium"
                      >
                        {ev.type.replace("_", " ")}
                      </Badge>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Processos Ativos Recentes (3 colunas) */}
          <Card className="lg:col-span-3 shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Scale className="h-4 w-4 text-blue-500" />
                  Processos Ativos
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Últimos autos movimentados
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/processos")}
                className="text-xs gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Ver Todos
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingLawsuits ? (
                <div className="text-center py-6 text-xs text-muted-foreground">Carregando processos...</div>
              ) : !lawsuits || lawsuits.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-xl p-4 text-xs text-muted-foreground">
                  Nenhum processo cadastrado ainda.
                </div>
              ) : (
                lawsuits.slice(0, 4).map((item) => {
                  const law = item.lawsuit;
                  return (
                    <div
                      key={law.id}
                      onClick={() => setLocation(`/processos?id=${law.id}`)}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 cursor-pointer transition-colors space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {law.cnjNumber}
                        </span>
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {law.phase}
                        </Badge>
                      </div>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-1">
                        {law.title}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{law.court} • {law.area}</span>
                        <span>{item.clientName || "Cliente"}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Acesso Rápido às Funcionalidades Principais do Advogado */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Módulos Rápidos do Escritório
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { title: "Clientes", desc: "Cadastros & LGPD", icon: Users, path: "/clientes", color: "text-blue-500 bg-blue-500/10" },
              { title: "Processos", desc: "Autos & Andamentos", icon: Scale, path: "/processos", color: "text-amber-500 bg-amber-500/10" },
              { title: "Atendimentos", desc: "Triagem & WhatsApp", icon: Headphones, path: "/atendimentos", color: "text-emerald-500 bg-emerald-500/10" },
              { title: "Prazos & Agenda", desc: "Controle Fatal", icon: Calendar, path: "/agenda", color: "text-rose-500 bg-rose-500/10" },
              { title: "Financeiro", desc: "Honorários & Custas", icon: DollarSign, path: "/financeiro", color: "text-emerald-500 bg-emerald-500/10" },
              { title: "Peças & IA", desc: "Modelos & Minutas", icon: Bot, path: "/assistente-ia", color: "text-purple-500 bg-purple-500/10" },
            ].map((module) => (
              <button
                key={module.title}
                onClick={() => setLocation(module.path)}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all text-center gap-2 group"
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${module.color}`}>
                  <module.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{module.title}</p>
                  <p className="text-[10px] text-muted-foreground">{module.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
