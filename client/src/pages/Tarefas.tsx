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
  CheckCircle2,
  CheckSquare,
  Clock,
  ListTodo,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Tarefas() {
  const [statusFilter, setStatusFilter] = useState("todos");
  const [priorityFilter, setPriorityFilter] = useState("todas");
  const [isOpenModal, setIsOpenModal] = useState(false);

  const utils = trpc.useUtils();
  const { data: lawsuits } = trpc.lawsuits.list.useQuery();
  const { data: tasks, isLoading } = trpc.tasks.list.useQuery({
    status: statusFilter,
    priority: priorityFilter,
  });

  const [formData, setFormData] = useState({
    lawsuitId: "",
    title: "",
    description: "",
    priority: "media" as any,
    status: "a_fazer" as any,
    dueDate: "",
  });

  const createMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      toast.success("Tarefa criada com sucesso!");
      utils.tasks.invalidate();
      setIsOpenModal(false);
      resetForm();
    },
    onError: (err) => {
      toast.error("Erro ao criar tarefa: " + err.message);
    },
  });

  const updateStatusMutation = trpc.tasks.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status da tarefa atualizado!");
      utils.tasks.invalidate();
    },
  });

  const deleteMutation = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      toast.success("Tarefa removida!");
      utils.tasks.invalidate();
    },
  });

  const resetForm = () => {
    setFormData({
      lawsuitId: "",
      title: "",
      description: "",
      priority: "media",
      status: "a_fazer",
      dueDate: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("Título da tarefa é obrigatório");
      return;
    }
    createMutation.mutate({
      lawsuitId: formData.lawsuitId ? Number(formData.lawsuitId) : undefined,
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: formData.status,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
    });
  };

  const formatDate = (date?: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const columns = [
    { id: "a_fazer", label: "A Fazer" },
    { id: "em_andamento", label: "Em Andamento" },
    { id: "revisao", label: "Revisão / Conferência" },
    { id: "concluida", label: "Concluída" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="h-6 w-6 text-amber-500" />
              Quadro de Tarefas & Delegação Jurídica
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Organização Kanban de peças a redigir, protocolos pendentes, pesquisas jurisprudenciais e rotinas do escritório
            </p>
          </div>

          <Button
            onClick={() => setIsOpenModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold gap-1.5 shadow-sm h-9 text-xs"
          >
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>

        {/* Quadro Kanban de Tarefas */}
        {isLoading ? (
          <div className="text-center py-12 text-xs text-muted-foreground">Carregando tarefas...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {columns.map((col) => {
              const colTasks = tasks?.filter((t) => t.task.status === col.id) || [];
              return (
                <div
                  key={col.id}
                  className="bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col gap-3 min-h-[450px]"
                >
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                      {col.label}
                    </span>
                    <Badge variant="secondary" className="text-[10px] font-semibold">
                      {colTasks.length}
                    </Badge>
                  </div>

                  <div className="space-y-2.5">
                    {colTasks.length === 0 ? (
                      <div className="text-center py-8 text-[11px] text-muted-foreground italic border border-dashed rounded-lg">
                        Nenhuma tarefa nesta etapa
                      </div>
                    ) : (
                      colTasks.map((item) => {
                        const t = item.task;
                        const isUrgente = t.priority === "urgente" || t.priority === "alta";
                        return (
                          <Card
                            key={t.id}
                            className="p-3 shadow-xs border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-sm transition-shadow space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                                {t.title}
                              </h4>
                              <Badge
                                variant={isUrgente ? "destructive" : "outline"}
                                className="text-[9px] uppercase px-1.5 py-0"
                              >
                                {t.priority}
                              </Badge>
                            </div>

                            {t.description && (
                              <p className="text-[11px] text-muted-foreground line-clamp-2">
                                {t.description}
                              </p>
                            )}

                            {item.lawsuitCnj && (
                              <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-500/10 px-1.5 py-0.5 rounded truncate">
                                {item.lawsuitCnj}
                              </div>
                            )}

                            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-slate-100 dark:border-slate-800">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(t.dueDate)}
                              </span>

                              <div className="flex items-center gap-1">
                                {col.id !== "concluida" ? (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      updateStatusMutation.mutate({
                                        id: t.id,
                                        status: col.id === "a_fazer" ? "em_andamento" : "concluida",
                                      })
                                    }
                                    className="h-6 text-[10px] px-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                  >
                                    Avançar →
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      updateStatusMutation.mutate({
                                        id: t.id,
                                        status: "a_fazer",
                                      })
                                    }
                                    className="h-6 text-[10px] px-1.5 text-muted-foreground hover:bg-slate-100"
                                  >
                                    Reabrir
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteMutation.mutate({ id: t.id })}
                                  className="h-6 w-6 p-0 text-destructive hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Nova Tarefa */}
        <Dialog open={isOpenModal} onOpenChange={setIsOpenModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-amber-500" />
                Criar Nova Tarefa Jurídica
              </DialogTitle>
              <DialogDescription className="text-xs">
                Defina a tarefa, prioridade, prazo limite e vincule a um processo.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-3 py-2">
              <div className="space-y-1">
                <Label className="text-xs">Processo Relacionado (Opcional)</Label>
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

              <div className="space-y-1">
                <Label className="text-xs">Título da Tarefa *</Label>
                <Input
                  required
                  placeholder="Ex: Redigir razões de apelação e juntar guia de preparo"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Prioridade</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(val: any) => setFormData({ ...formData, priority: val })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente (Prazo Curto)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Data Limite</Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Descrição / Instruções</Label>
                <Textarea
                  placeholder="Orientações detalhadas para a elaboração ou execução da tarefa..."
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
                  {createMutation.isPending ? "Criando..." : "Criar Tarefa"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
