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
  AlertTriangle,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  ExternalLink,
  Gavel,
  MapPin,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Agenda() {
  const [typeFilter, setTypeFilter] = useState("todos");
  const [isOpenModal, setIsOpenModal] = useState(false);

  const utils = trpc.useUtils();
  const { data: lawsuits } = trpc.lawsuits.list.useQuery();
  const { data: events, isLoading } = trpc.calendar.list.useQuery({
    type: typeFilter,
  });

  const [formData, setFormData] = useState({
    lawsuitId: "",
    type: "prazo_fatal" as any,
    title: "",
    description: "",
    startAtDate: "",
    startAtTime: "18:00",
    deadlineType: "dias_uteis" as any,
    status: "pendente" as any,
    location: "",
  });

  const createMutation = trpc.calendar.create.useMutation({
    onSuccess: () => {
      toast.success("Compromisso / Prazo registrado com sucesso!");
      utils.calendar.invalidate();
      utils.dashboard.invalidate();
      setIsOpenModal(false);
      resetForm();
    },
    onError: (err) => {
      toast.error("Erro ao registrar prazo: " + err.message);
    },
  });

  const toggleCompletedMutation = trpc.calendar.toggleCompleted.useMutation({
    onSuccess: () => {
      utils.calendar.invalidate();
      utils.dashboard.invalidate();
    },
  });

  const deleteMutation = trpc.calendar.delete.useMutation({
    onSuccess: () => {
      toast.success("Compromisso removido!");
      utils.calendar.invalidate();
      utils.dashboard.invalidate();
    },
  });

  const resetForm = () => {
    setFormData({
      lawsuitId: "",
      type: "prazo_fatal",
      title: "",
      description: "",
      startAtDate: "",
      startAtTime: "18:00",
      deadlineType: "dias_uteis",
      status: "pendente",
      location: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.startAtDate) {
      toast.error("Título e data fatal são obrigatórios");
      return;
    }

    const dateTimeString = `${formData.startAtDate}T${formData.startAtTime || "00:00"}:00`;
    const targetDate = new Date(dateTimeString);

    createMutation.mutate({
      lawsuitId: formData.lawsuitId ? Number(formData.lawsuitId) : undefined,
      type: formData.type,
      title: formData.title,
      description: formData.description,
      startAt: targetDate,
      deadlineType: formData.deadlineType,
      status: formData.status,
      location: formData.location,
    });
  };

  const formatDate = (date?: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR", {
      weekday: "short",
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
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="h-6 w-6 text-amber-500" />
              Agenda Jurídica & Prazos Fatais
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Controle rigoroso de prazos em dias úteis (CPC/CLT), audiências telepresenciais e compromissos do escritório
            </p>
          </div>

          <Button
            onClick={() => setIsOpenModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold gap-1.5 shadow-sm h-9 text-xs"
          >
            <Plus className="h-4 w-4" />
            Novo Prazo / Audiência
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Filtrar por tipo:</span>
          {[
            { id: "todos", label: "Todos" },
            { id: "prazo_fatal", label: "Prazos Fatais" },
            { id: "audiencia", label: "Audiências" },
            { id: "reuniao", label: "Reuniões" },
            { id: "pericia", label: "Perícias" },
            { id: "diligencia", label: "Diligências" },
          ].map((item) => (
            <Button
              key={item.id}
              size="sm"
              variant={typeFilter === item.id ? "default" : "outline"}
              onClick={() => setTypeFilter(item.id)}
              className="text-xs h-7"
            >
              {item.label}
            </Button>
          ))}
        </div>

        {/* Lista de Compromissos */}
        {isLoading ? (
          <div className="text-center py-12 text-xs text-muted-foreground">Carregando prazos e eventos...</div>
        ) : !events || events.length === 0 ? (
          <Card className="p-8 text-center border-dashed border-slate-300 dark:border-slate-800">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-muted-foreground">
                <CalendarIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-sm">Nenhum compromisso registrado</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Cadastre um prazo fatal, audiência ou reunião com cliente.
                </p>
              </div>
              <Button
                onClick={() => setIsOpenModal(true)}
                variant="outline"
                className="text-xs h-8 gap-1.5 mt-2"
              >
                <Plus className="h-3.5 w-3.5" />
                Cadastrar Prazo
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((item) => {
              const ev = item.event;
              const isPrazo = ev.type === "prazo_fatal";
              const isAudiencia = ev.type === "audiencia";
              return (
                <Card
                  key={ev.id}
                  className={`shadow-sm transition-all border flex flex-col justify-between ${
                    ev.isCompleted
                      ? "opacity-60 bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800"
                      : isPrazo
                      ? "border-amber-300 dark:border-amber-900/60 bg-white dark:bg-slate-900"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  }`}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <button
                          onClick={() => toggleCompletedMutation.mutate({ id: ev.id, isCompleted: !ev.isCompleted })}
                          className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                            ev.isCompleted
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-slate-300 dark:border-slate-600 hover:border-amber-500"
                          }`}
                        >
                          {ev.isCompleted && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </button>

                        <div className="min-w-0">
                          <h3 className={`text-sm font-bold line-clamp-2 ${ev.isCompleted ? "line-through text-muted-foreground" : "text-slate-900 dark:text-slate-100"}`}>
                            {ev.title}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{formatDate(ev.startAt)}</span>
                          </div>
                        </div>
                      </div>

                      <Badge
                        variant={isPrazo ? "destructive" : isAudiencia ? "default" : "secondary"}
                        className="text-[10px] uppercase font-semibold shrink-0"
                      >
                        {ev.type.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-2 space-y-2.5 text-xs">
                    {ev.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg">
                        {ev.description}
                      </p>
                    )}

                    {ev.location && (
                      <div className="flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 truncate">
                        {ev.location.startsWith("http") ? (
                          <>
                            <Video className="h-3.5 w-3.5 shrink-0" />
                            <a
                              href={ev.location}
                              target="_blank"
                              rel="noreferrer"
                              className="underline truncate"
                            >
                              Acessar Sala Virtual
                            </a>
                          </>
                        ) : (
                          <>
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{ev.location}</span>
                          </>
                        )}
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-mono truncate max-w-[170px]">
                        {item.lawsuitCnj || "Sem processo vinculado"}
                      </span>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate({ id: ev.id })}
                        className="h-7 w-7 p-0 text-destructive hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Modal: Novo Prazo / Compromisso */}
        <Dialog open={isOpenModal} onOpenChange={setIsOpenModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-amber-500" />
                Cadastrar Prazo Fatal ou Audiência
              </DialogTitle>
              <DialogDescription className="text-xs">
                Defina data fatal, tribunal, tipo de prazo e link da audiência virtual se houver.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-3 py-2">
              <div className="space-y-1">
                <Label className="text-xs">Processo Vinculado (Opcional)</Label>
                <Select
                  value={formData.lawsuitId}
                  onValueChange={(val) => setFormData({ ...formData, lawsuitId: val })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Selecione o processo" />
                  </SelectTrigger>
                  <SelectContent>
                    {lawsuits?.map((l) => (
                      <SelectItem key={l.lawsuit.id} value={l.lawsuit.id.toString()}>
                        {l.lawsuit.cnjNumber} - {l.lawsuit.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Tipo de Evento</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(val: any) => setFormData({ ...formData, type: val })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prazo_fatal">Prazo Fatal (Manifestação/Recurso)</SelectItem>
                      <SelectItem value="audiencia">Audiência (Instrução/Conciliação)</SelectItem>
                      <SelectItem value="reuniao">Reunião com Cliente</SelectItem>
                      <SelectItem value="pericia">Perícia Médica / Técnica</SelectItem>
                      <SelectItem value="diligencia">Diligência / Despacho com Juiz</SelectItem>
                      <SelectItem value="outro">Outro Compromisso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Regra de Contagem</Label>
                  <Select
                    value={formData.deadlineType}
                    onValueChange={(val: any) => setFormData({ ...formData, deadlineType: val })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Contagem" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dias_uteis">Dias Úteis (CPC / CLT)</SelectItem>
                      <SelectItem value="dias_corridos">Dias Corridos (Penal / Juizados)</SelectItem>
                      <SelectItem value="horario_especifico">Horário Específico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Título do Prazo / Evento *</Label>
                <Input
                  required
                  placeholder="Ex: Contestação à Ação Revisional"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Data Fatal / Início *</Label>
                  <Input
                    type="date"
                    required
                    value={formData.startAtDate}
                    onChange={(e) => setFormData({ ...formData, startAtDate: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Horário Limite</Label>
                  <Input
                    type="time"
                    value={formData.startAtTime}
                    onChange={(e) => setFormData({ ...formData, startAtTime: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Local ou Link da Audiência Virtual (Teams / Zoom)</Label>
                <Input
                  placeholder="Ex: https://teams.microsoft.com/... ou Fórum Central - Sala 2"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Descrição e Orientações</Label>
                <Textarea
                  placeholder="Detalhes da intimação, fundamentos ou instruções para testemunhas..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  {createMutation.isPending ? "Salvando..." : "Salvar no Calendário"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
