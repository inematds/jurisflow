import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  AlertCircle,
  Building,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Gavel,
  History,
  Layers,
  Plus,
  Scale,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Processos() {
  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("todas");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenMovementModal, setIsOpenMovementModal] = useState(false);
  const [selectedLawsuitId, setSelectedLawsuitId] = useState<number | null>(null);

  const [location] = useLocation();

  const utils = trpc.useUtils();
  const { data: clients } = trpc.clients.list.useQuery();
  const { data: lawsuits, isLoading } = trpc.lawsuits.list.useQuery({
    search,
    phase: phaseFilter,
    status: statusFilter,
  });

  const { data: lawsuitDetail } = trpc.lawsuits.getById.useQuery(
    { id: selectedLawsuitId! },
    { enabled: !!selectedLawsuitId }
  );

  const [formData, setFormData] = useState({
    clientId: "",
    cnjNumber: "",
    title: "",
    area: "Cível",
    court: "TJSP",
    judicialDistrict: "",
    courtDivision: "",
    phase: "inicial" as any,
    roleInLawsuit: "autor" as any,
    opposingParty: "",
    opposingLawyer: "",
    estimatedValue: "0.00",
    status: "ativo" as any,
    notes: "",
  });

  const [movementData, setMovementData] = useState({
    title: "",
    description: "",
    isImportant: false,
  });

  const createMutation = trpc.lawsuits.create.useMutation({
    onSuccess: () => {
      toast.success("Processo cadastrado com sucesso!");
      utils.lawsuits.invalidate();
      utils.dashboard.invalidate();
      setIsOpenModal(false);
      resetForm();
    },
    onError: (err) => {
      toast.error("Erro ao cadastrar processo: " + err.message);
    },
  });

  const movementMutation = trpc.lawsuits.addMovement.useMutation({
    onSuccess: () => {
      toast.success("Andamento processual lançado!");
      utils.lawsuits.invalidate();
      setIsOpenMovementModal(false);
      setMovementData({ title: "", description: "", isImportant: false });
    },
    onError: (err) => {
      toast.error("Erro ao lançar andamento: " + err.message);
    },
  });

  const deleteMutation = trpc.lawsuits.delete.useMutation({
    onSuccess: () => {
      toast.success("Processo removido com sucesso!");
      utils.lawsuits.invalidate();
      setSelectedLawsuitId(null);
    },
  });

  const resetForm = () => {
    setFormData({
      clientId: "",
      cnjNumber: "",
      title: "",
      area: "Cível",
      court: "TJSP",
      judicialDistrict: "",
      courtDivision: "",
      phase: "inicial",
      roleInLawsuit: "autor",
      opposingParty: "",
      opposingLawyer: "",
      estimatedValue: "0.00",
      status: "ativo",
      notes: "",
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) {
      toast.error("Selecione o cliente vinculado ao processo");
      return;
    }
    if (!formData.cnjNumber || !formData.title) {
      toast.error("Número CNJ e Título são obrigatórios");
      return;
    }
    createMutation.mutate({
      ...formData,
      clientId: Number(formData.clientId),
    });
  };

  const handleMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLawsuitId) return;
    if (!movementData.title || !movementData.description) {
      toast.error("Preencha título e descrição do andamento");
      return;
    }
    movementMutation.mutate({
      lawsuitId: selectedLawsuitId,
      ...movementData,
    });
  };

  const formatCurrency = (val?: string | number) => {
    return Number(val || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const formatDate = (date?: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="h-6 w-6 text-amber-500" />
              Gestão de Processos Judiciais & Administrativos
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Acompanhamento de autos digitais, numeração CNJ, movimentações, tribunal e fases processuais
            </p>
          </div>

          <Button
            onClick={() => setIsOpenModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold gap-1.5 shadow-sm h-9 text-xs"
          >
            <Plus className="h-4 w-4" />
            Distribuir / Cadastrar Processo
          </Button>
        </div>

        {/* Barra de Filtros e Pesquisa */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardContent className="p-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por CNJ, Título, Tribunal ou Parte..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-xs bg-slate-50 dark:bg-slate-900/50"
                />
              </div>

              <div>
                <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Fase Processual" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as Fases</SelectItem>
                    <SelectItem value="inicial">Petição Inicial</SelectItem>
                    <SelectItem value="instrucao">Instrução / Provas</SelectItem>
                    <SelectItem value="decisao">Decisão / Sentença</SelectItem>
                    <SelectItem value="recurso">Recurso / Tribunal</SelectItem>
                    <SelectItem value="execucao">Cumprimento / Execução</SelectItem>
                    <SelectItem value="arquivado">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="suspenso">Suspenso</SelectItem>
                    <SelectItem value="em_acordo">Em Acordo</SelectItem>
                    <SelectItem value="ganho">Procedente (Ganho)</SelectItem>
                    <SelectItem value="perdido">Improcedente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Layout Master-Detail: Tabela / Cards de Processos + Painel de Detalhe */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Lista de Processos */}
          <div className={`${selectedLawsuitId ? "lg:col-span-7" : "lg:col-span-12"} space-y-3`}>
            {isLoading ? (
              <div className="text-center py-12 text-xs text-muted-foreground">Carregando processos...</div>
            ) : !lawsuits || lawsuits.length === 0 ? (
              <Card className="p-8 text-center border-dashed border-slate-300 dark:border-slate-800">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-muted-foreground">
                    <Scale className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Nenhum processo localizado</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Cadastre os autos judiciais ou carregue a base demonstrativa.
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsOpenModal(true)}
                    variant="outline"
                    className="text-xs h-8 gap-1.5 mt-2"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Novo Processo
                  </Button>
                </div>
              </Card>
            ) : (
              lawsuits.map((item) => {
                const law = item.lawsuit;
                const isSelected = selectedLawsuitId === law.id;
                return (
                  <Card
                    key={law.id}
                    onClick={() => setSelectedLawsuitId(law.id)}
                    className={`cursor-pointer transition-all border ${
                      isSelected
                        ? "border-amber-500 shadow-md bg-amber-500/5 dark:bg-amber-500/10"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                            {law.cnjNumber}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1 mt-0.5">
                            {law.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                            {law.phase}
                          </Badge>
                          <Badge
                            variant={law.status === "ativo" ? "default" : "secondary"}
                            className="text-[10px] uppercase font-semibold"
                          >
                            {law.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-muted-foreground pt-1 border-t border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="text-[10px] block text-slate-400">Cliente (Parte)</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300 truncate block">
                            {item.clientName || "Não vinculado"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] block text-slate-400">Juízo / Vara</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300 truncate block">
                            {law.court} • {law.courtDivision || law.judicialDistrict || "Comarca"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] block text-slate-400">Valor da Causa</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 block">
                            {formatCurrency(law.estimatedValue || 0)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Detalhes do Processo Selecionado */}
          {selectedLawsuitId && lawsuitDetail && (
            <div className="lg:col-span-5 space-y-4 sticky top-20">
              <Card className="shadow-md border-amber-500/30">
                <CardHeader className="p-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider">
                        Detalhes dos Autos
                      </span>
                      <CardTitle className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                        {lawsuitDetail.cnjNumber}
                      </CardTitle>
                      <CardDescription className="text-xs line-clamp-1 mt-0.5">
                        {lawsuitDetail.title}
                      </CardDescription>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedLawsuitId(null)}
                      className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4 text-xs">
                  {/* Dados Estruturados */}
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tribunal / Foro:</span>
                      <span className="font-medium">{lawsuitDetail.court} ({lawsuitDetail.courtDivision || "Vara Única"})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Área do Direito:</span>
                      <span className="font-medium">{lawsuitDetail.area}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Posição Processual:</span>
                      <span className="font-medium uppercase">{lawsuitDetail.roleInLawsuit}</span>
                    </div>
                    {lawsuitDetail.opposingParty && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Parte Adversa:</span>
                        <span className="font-medium">{lawsuitDetail.opposingParty}</span>
                      </div>
                    )}
                    {lawsuitDetail.opposingLawyer && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Advogado Contrário:</span>
                        <span className="font-medium">{lawsuitDetail.opposingLawyer}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valor Estimado:</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(lawsuitDetail.estimatedValue || 0)}</span>
                    </div>
                  </div>

                  {/* Andamentos Processuais */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
                        <History className="h-4 w-4 text-blue-500" />
                        Andamentos & Publicações ({lawsuitDetail.movements?.length || 0})
                      </h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsOpenMovementModal(true)}
                        className="text-[11px] h-6 px-2 gap-1 border-blue-500/30 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                      >
                        <Plus className="h-3 w-3" />
                        Novo Andamento
                      </Button>
                    </div>

                    {!lawsuitDetail.movements || lawsuitDetail.movements.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground italic py-2">
                        Nenhum andamento lançado ainda para este processo.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {lawsuitDetail.movements.map((m: any) => (
                          <div
                            key={m.id}
                            className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {m.title}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {formatDate(m.movementDate)}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                              {m.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ações Rápidas do Processo */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsOpenMovementModal(true)}
                      className="text-xs h-8 gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Lançar Andamento
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate({ id: lawsuitDetail.id })}
                      className="text-xs h-8 text-destructive hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Modal: Novo Processo */}
        <Dialog open={isOpenModal} onOpenChange={setIsOpenModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Scale className="h-5 w-5 text-amber-500" />
                Distribuir / Cadastrar Processo Judicial
              </DialogTitle>
              <DialogDescription className="text-xs">
                Vincule o processo a um cliente, tribunal e defina valores e partes envolvidas.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
              <div className="space-y-1">
                <Label className="text-xs">Cliente Vinculado *</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(val) => setFormData({ ...formData, clientId: val })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name} ({c.cpfCnpj || "Sem documento"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Número CNJ (Padrão Nacional) *</Label>
                  <Input
                    required
                    placeholder="0001234-56.2026.8.26.0100"
                    value={formData.cnjNumber}
                    onChange={(e) => setFormData({ ...formData, cnjNumber: e.target.value })}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Título / Ação Sumária *</Label>
                  <Input
                    required
                    placeholder="Ex: Ação de Cobrança c/c Danos Morais"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Área do Direito</Label>
                  <Select
                    value={formData.area}
                    onValueChange={(val) => setFormData({ ...formData, area: val })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Selecione a área" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cível">Cível</SelectItem>
                      <SelectItem value="Trabalhista">Trabalhista</SelectItem>
                      <SelectItem value="Família e Sucessões">Família e Sucessões</SelectItem>
                      <SelectItem value="Tributário">Tributário</SelectItem>
                      <SelectItem value="Penal / Criminal">Penal / Criminal</SelectItem>
                      <SelectItem value="Previdenciário">Previdenciário</SelectItem>
                      <SelectItem value="Empresarial">Empresarial</SelectItem>
                      <SelectItem value="Consumidor">Consumidor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Tribunal / Órgão</Label>
                  <Input
                    placeholder="Ex: TJSP, TRT-2, TRF-3"
                    value={formData.court}
                    onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Vara / Comarca</Label>
                  <Input
                    placeholder="Ex: 3ª Vara Cível - Central"
                    value={formData.courtDivision}
                    onChange={(e) => setFormData({ ...formData, courtDivision: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Fase Inicial</Label>
                  <Select
                    value={formData.phase}
                    onValueChange={(val: any) => setFormData({ ...formData, phase: val })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Fase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inicial">Inicial</SelectItem>
                      <SelectItem value="instrucao">Instrução</SelectItem>
                      <SelectItem value="decisao">Decisão / Sentença</SelectItem>
                      <SelectItem value="recurso">Recurso</SelectItem>
                      <SelectItem value="execucao">Execução</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Papel do Cliente</Label>
                  <Select
                    value={formData.roleInLawsuit}
                    onValueChange={(val: any) => setFormData({ ...formData, roleInLawsuit: val })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Papel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="autor">Autor (Requerente)</SelectItem>
                      <SelectItem value="reu">Réu (Requerido)</SelectItem>
                      <SelectItem value="terceiro_interessado">Terceiro Interessado</SelectItem>
                      <SelectItem value="assistente">Assistente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Valor da Causa (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.estimatedValue}
                    onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Parte Contrária</Label>
                  <Input
                    placeholder="Nome da empresa ou pessoa contrária"
                    value={formData.opposingParty}
                    onChange={(e) => setFormData({ ...formData, opposingParty: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Advogado da Parte Contrária</Label>
                  <Input
                    placeholder="Nome e OAB do colega ex adverso"
                    value={formData.opposingLawyer}
                    onChange={(e) => setFormData({ ...formData, opposingLawyer: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Notas e Estratégia Jurídica</Label>
                <Textarea
                  placeholder="Resumo dos fatos, fundamentos, teses principais e notas internas..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="text-xs min-h-[70px]"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpenModal(false)}
                  className="text-xs h-8"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs h-8"
                >
                  {createMutation.isPending ? "Cadastrando..." : "Cadastrar Processo"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal: Novo Andamento */}
        <Dialog open={isOpenMovementModal} onOpenChange={setIsOpenMovementModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <History className="h-5 w-5 text-blue-500" />
                Lançar Andamento Processual
              </DialogTitle>
              <DialogDescription className="text-xs">
                Registre uma publicação no Diário de Justiça, despacho judicial ou protocolo de petição.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleMovementSubmit} className="space-y-3 py-2">
              <div className="space-y-1">
                <Label className="text-xs">Título da Movimentação *</Label>
                <Input
                  required
                  placeholder="Ex: Juntada de Petição de Manifestação"
                  value={movementData.title}
                  onChange={(e) => setMovementData({ ...movementData, title: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Descrição / Texto da Publicação *</Label>
                <Textarea
                  required
                  placeholder="Cole aqui o teor da publicação do DJE ou resumo do despacho..."
                  value={movementData.description}
                  onChange={(e) => setMovementData({ ...movementData, description: e.target.value })}
                  className="text-xs min-h-[90px]"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpenMovementModal(false)}
                  className="text-xs h-8"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={movementMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-8"
                >
                  {movementMutation.isPending ? "Salvando..." : "Salvar Andamento"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
