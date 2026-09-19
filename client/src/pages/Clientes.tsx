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
  Building2,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Clientes() {
  const [search, setSearch] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const [formData, setFormData] = useState({
    type: "PF" as "PF" | "PJ",
    name: "",
    cpfCnpj: "",
    rgIe: "",
    email: "",
    phone: "",
    whatsapp: "",
    occupation: "",
    maritalStatus: "Casado(a)",
    nationality: "Brasileiro(a)",
    addressStreet: "",
    addressNumber: "",
    addressComplement: "",
    addressNeighborhood: "",
    addressCity: "",
    addressState: "SP",
    addressZipCode: "",
    status: "ativo" as "ativo" | "inativo" | "lead" | "prospecto",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: clients, isLoading } = trpc.clients.list.useQuery({ search });

  const createMutation = trpc.clients.create.useMutation({
    onSuccess: () => {
      toast.success("Cliente cadastrado com sucesso!");
      utils.clients.invalidate();
      setIsOpenModal(false);
      resetForm();
    },
    onError: (err) => {
      toast.error("Erro ao cadastrar cliente: " + err.message);
    },
  });

  const deleteMutation = trpc.clients.delete.useMutation({
    onSuccess: () => {
      toast.success("Cliente removido com sucesso!");
      utils.clients.invalidate();
    },
    onError: (err) => {
      toast.error("Erro ao remover cliente: " + err.message);
    },
  });

  const resetForm = () => {
    setFormData({
      type: "PF",
      name: "",
      cpfCnpj: "",
      rgIe: "",
      email: "",
      phone: "",
      whatsapp: "",
      occupation: "",
      maritalStatus: "Casado(a)",
      nationality: "Brasileiro(a)",
      addressStreet: "",
      addressNumber: "",
      addressComplement: "",
      addressNeighborhood: "",
      addressCity: "",
      addressState: "SP",
      addressZipCode: "",
      status: "ativo",
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Informe o nome completo ou razão social");
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Cabeçalho da Página */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-6 w-6 text-amber-500" />
              Gestão de Clientes & Partes
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Cadastro de pessoas físicas e jurídicas, qualificação completa e histórico de relacionamento
            </p>
          </div>

          <Button
            onClick={() => setIsOpenModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold gap-1.5 shadow-sm h-9 text-xs"
          >
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        {/* Barra de Pesquisa e Filtros */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardContent className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, CPF/CNPJ, e-mail ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs bg-slate-50 dark:bg-slate-900/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Clientes */}
        {isLoading ? (
          <div className="text-center py-12 text-xs text-muted-foreground">Carregando lista de clientes...</div>
        ) : !clients || clients.length === 0 ? (
          <Card className="p-8 text-center border-dashed border-slate-300 dark:border-slate-800">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-muted-foreground">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-sm">Nenhum cliente cadastrado</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Comece cadastrando seu primeiro cliente ou carregue os dados de demonstração.
                </p>
              </div>
              <Button
                onClick={() => setIsOpenModal(true)}
                variant="outline"
                className="text-xs h-8 gap-1.5 mt-2"
              >
                <Plus className="h-3.5 w-3.5" />
                Cadastrar Cliente
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => {
              const isPF = client.type === "PF";
              return (
                <Card
                  key={client.id}
                  className="shadow-sm hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800 flex flex-col justify-between"
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isPF ? "bg-blue-500/10 text-blue-600" : "bg-purple-500/10 text-purple-600"
                          }`}
                        >
                          {isPF ? <User className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                            {client.name}
                          </h3>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {client.cpfCnpj || (isPF ? "CPF não informado" : "CNPJ não informado")}
                          </span>
                        </div>
                      </div>

                      <Badge
                        variant={client.status === "ativo" ? "default" : "secondary"}
                        className="text-[10px] uppercase font-semibold shrink-0"
                      >
                        {client.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-2 space-y-2 text-xs">
                    <div className="space-y-1.5 text-muted-foreground pt-1 border-t border-slate-100 dark:border-slate-800">
                      {client.email && (
                        <div className="flex items-center gap-2 truncate">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">{client.email}</span>
                        </div>
                      )}
                      {(client.phone || client.whatsapp) && (
                        <div className="flex items-center gap-2 truncate">
                          <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span>{client.whatsapp || client.phone}</span>
                        </div>
                      )}
                      {client.addressCity && (
                        <div className="flex items-center gap-2 truncate">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span>{client.addressCity} - {client.addressState}</span>
                        </div>
                      )}
                    </div>

                    {client.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-2 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg">
                        "{client.notes}"
                      </p>
                    )}

                    <div className="flex items-center justify-end gap-1.5 pt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate({ id: client.id })}
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

        {/* Modal de Cadastro de Cliente */}
        <Dialog open={isOpenModal} onOpenChange={setIsOpenModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-500" />
                Cadastrar Novo Cliente
              </DialogTitle>
              <DialogDescription className="text-xs">
                Preencha os dados de qualificação para procurações, contratos de honorários e petições.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Tipo de Pessoa</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(val: any) => setFormData({ ...formData, type: val })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PF">Pessoa Física (PF)</SelectItem>
                      <SelectItem value="PJ">Pessoa Jurídica (PJ)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs">Nome Completo / Razão Social *</Label>
                  <Input
                    required
                    placeholder="Ex: Maria Pereira da Silva"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{formData.type === "PF" ? "CPF" : "CNPJ"}</Label>
                  <Input
                    placeholder={formData.type === "PF" ? "000.000.000-00" : "00.000.000/0001-00"}
                    value={formData.cpfCnpj}
                    onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{formData.type === "PF" ? "RG / Órgão Emissor" : "Inscrição Estadual"}</Label>
                  <Input
                    placeholder="Ex: 12.345.678-9 SSP/SP"
                    value={formData.rgIe}
                    onChange={(e) => setFormData({ ...formData, rgIe: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">E-mail</Label>
                  <Input
                    type="email"
                    placeholder="cliente@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">WhatsApp</Label>
                  <Input
                    placeholder="(11) 99999-9999"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Telefone Fixo</Label>
                  <Input
                    placeholder="(11) 3333-3333"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              {formData.type === "PF" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Profissão</Label>
                    <Input
                      placeholder="Ex: Engenheiro(a)"
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Estado Civil</Label>
                    <Input
                      placeholder="Ex: Casado(a), Solteiro(a)"
                      value={formData.maritalStatus}
                      onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Nacionalidade</Label>
                    <Input
                      placeholder="Brasileiro(a)"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs">Endereço (Rua/Avenida)</Label>
                  <Input
                    placeholder="Av. Paulista, nº 1000"
                    value={formData.addressStreet}
                    onChange={(e) => setFormData({ ...formData, addressStreet: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Cidade</Label>
                  <Input
                    placeholder="São Paulo"
                    value={formData.addressCity}
                    onChange={(e) => setFormData({ ...formData, addressCity: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Observações e Informações Confidenciais</Label>
                <Textarea
                  placeholder="Informações do atendimento, histórico, indicações etc."
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
                  {createMutation.isPending ? "Salvando..." : "Salvar Cliente"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
