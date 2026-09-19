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
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Headphones,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  UserCheck,
  Video,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Atendimentos() {
  const [statusFilter, setStatusFilter] = useState("todos");
  const [isOpenModal, setIsOpenModal] = useState(false);

  const utils = trpc.useUtils();
  const { data: clients } = trpc.clients.list.useQuery();
  const { data: consultations, isLoading } = trpc.consultations.list.useQuery({
    status: statusFilter,
  });

  const [formData, setFormData] = useState({
    clientId: "",
    clientName: "",
    clientContact: "",
    channel: "whatsapp" as any,
    subject: "",
    description: "",
    legalArea: "Trabalhista",
    status: "agendado" as any,
    feeAmount: "0.00",
    feePaid: false,
    notes: "",
  });

  const createMutation = trpc.consultations.create.useMutation({
    onSuccess: () => {
      toast.success("Atendimento agendado com sucesso!");
      utils.consultations.invalidate();
      setIsOpenModal(false);
      resetForm();
    },
    onError: (err) => {
      toast.error("Erro ao agendar atendimento: " + err.message);
    },
  });

  const updateStatusMutation = trpc.consultations.update.useMutation({
    onSuccess: () => {
      toast.success("Status do atendimento atualizado!");
      utils.consultations.invalidate();
    },
  });

  const resetForm = () => {
    setFormData({
      clientId: "",
      clientName: "",
      clientContact: "",
      channel: "whatsapp",
      subject: "",
      description: "",
      legalArea: "Trabalhista",
      status: "agendado",
      feeAmount: "0.00",
      feePaid: false,
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.subject) {
      toast.error("Nome do cliente e assunto são obrigatórios");
      return;
    }
    createMutation.mutate({
      ...formData,
      clientId: formData.clientId ? Number(formData.clientId) : undefined,
    });
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "whatsapp":
        return <MessageSquare className="h-4 w-4 text-emerald-500" />;
      case "videoconferencia":
        return <Video className="h-4 w-4 text-blue-500" />;
      case "presencial":
        return <UserCheck className="h-4 w-4 text-amber-500" />;
      case "telefone":
        return <Phone className="h-4 w-4 text-purple-500" />;
      default:
        return <Mail className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Headphones className="h-6 w-6 text-amber-500" />
              Atendimentos & Triagem de Clientes
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Registro de consultas iniciais, triagem pelo WhatsApp, agendamentos presenciais ou virtuais e cobrança de consulta
            </p>
          </div>

          <Button
            onClick={() => setIsOpenModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold gap-1.5 shadow-sm h-9 text-xs"
          >
            <Plus className="h-4 w-4" />
            Novo Atendimento / Consulta
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Filtrar por:</span>
          {["todos", "agendado", "em_andamento", "concluido", "convertido_em_processo"].map((st) => (
            <Button
              key={st}
              size="sm"
              variant={statusFilter === st ? "default" : "outline"}
              onClick={() => setStatusFilter(st)}
              className="text-xs h-7 capitalize"
            >
              {st.replace(/_/g, " ")}
            </Button>
          ))}
        </div>

        {/* Lista de Atendimentos */}
        {isLoading ? (
          <div className="text-center py-12 text-xs text-muted-foreground">Carregando atendimentos...</div>
        ) : !consultations || consultations.length === 0 ? (
          <Card className="p-8 text-center border-dashed border-slate-300 dark:border-slate-800">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-muted-foreground">
                <Headphones className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-sm">Nenhum atendimento registrado</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Agende sua primeira consulta jurídica ou registre a triagem do cliente.
                </p>
              </div>
              <Button
                onClick={() => setIsOpenModal(true)}
                variant="outline"
                className="text-xs h-8 gap-1.5 mt-2"
              >
                <Plus className="h-3.5 w-3.5" />
                Agendar Consulta
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {consultations.map((item) => {
              const c = item.consultation;
              return (
                <Card
                  key={c.id}
                  className="shadow-sm hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800 flex flex-col justify-between"
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          {getChannelIcon(c.channel)}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                            {c.clientName}
                          </h3>
                          <span className="text-[11px] text-muted-foreground">
                            {c.clientContact || "Sem contato informado"}
                          </span>
                        </div>
                      </div>

                      <Badge
                        variant={c.status === "agendado" ? "default" : "secondary"}
                        className="text-[10px] uppercase font-semibold shrink-0"
                      >
                        {c.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-2 space-y-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase">
                        {c.legalArea}
                      </span>
                      <p className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                        {c.subject}
                      </p>
                    </div>

                    {c.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
                        {c.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                        <span>R$ {Number(c.feeAmount || 0).toFixed(2)}</span>
                        <span className="text-[10px] font-normal text-muted-foreground">
                          ({c.feePaid ? "Pago" : "Pendente"})
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: c.id,
                              status: c.status === "concluido" ? "agendado" : "concluido",
                            })
                          }
                          className="h-7 text-[11px] px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {c.status === "concluido" ? "Reabrir" : "Concluir"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Modal: Agendar Atendimento */}
        <Dialog open={isOpenModal} onOpenChange={setIsOpenModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Headphones className="h-5 w-5 text-amber-500" />
                Agendar Novo Atendimento / Consulta
              </DialogTitle>
              <DialogDescription className="text-xs">
                Registre os dados da consulta, canal de atendimento e honorários de consulta se houver.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-3 py-2">
              <div className="space-y-1">
                <Label className="text-xs">Cliente Existente (Opcional)</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(val) => {
                    const found = clients?.find((cl) => cl.id.toString() === val);
                    setFormData({
                      ...formData,
                      clientId: val,
                      clientName: found?.name || formData.clientName,
                      clientContact: found?.whatsapp || found?.phone || formData.clientContact,
                    });
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Selecione caso já seja cliente cadastrado" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map((cl) => (
                      <SelectItem key={cl.id} value={cl.id.toString()}>
                        {cl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Nome do Cliente *</Label>
                  <Input
                    required
                    placeholder="Nome completo do consulente"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Contato (Telefone / WhatsApp)</Label>
                  <Input
                    placeholder="(11) 99999-9999"
                    value={formData.clientContact}
                    onChange={(e) => setFormData({ ...formData, clientContact: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Canal de Atendimento</Label>
                  <Select
                    value={formData.channel}
                    onValueChange={(val: any) => setFormData({ ...formData, channel: val })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Canal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp / Online</SelectItem>
                      <SelectItem value="videoconferencia">Videoconferência (Meet/Teams)</SelectItem>
                      <SelectItem value="presencial">Presencial no Escritório</SelectItem>
                      <SelectItem value="telefone">Ligação Telefônica</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Área Jurídica</Label>
                  <Input
                    placeholder="Ex: Trabalhista, Família, Cível"
                    value={formData.legalArea}
                    onChange={(e) => setFormData({ ...formData, legalArea: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Assunto Principal *</Label>
                <Input
                  required
                  placeholder="Ex: Demissão sem justa causa e horas extras"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Valor da Consulta (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.feeAmount}
                    onChange={(e) => setFormData({ ...formData, feeAmount: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Status do Pagamento</Label>
                  <Select
                    value={formData.feePaid ? "pago" : "pendente"}
                    onValueChange={(val) => setFormData({ ...formData, feePaid: val === "pago" })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente / Cortesia</SelectItem>
                      <SelectItem value="pago">Pago Antecipado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Relato dos Fatos / Anotações do Atendimento</Label>
                <Textarea
                  placeholder="Resumo do que o cliente relatou durante a conversa..."
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
                  {createMutation.isPending ? "Agendando..." : "Confirmar Atendimento"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
