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
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Plus,
  Receipt,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Financeiro() {
  const [typeFilter, setTypeFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [isOpenModal, setIsOpenModal] = useState(false);

  const utils = trpc.useUtils();
  const { data: clients } = trpc.clients.list.useQuery();
  const { data: transactions, isLoading } = trpc.financial.list.useQuery({
    type: typeFilter,
    status: statusFilter,
  });

  const [formData, setFormData] = useState({
    clientId: "",
    type: "receita" as "receita" | "despesa",
    category: "Honorários Iniciais",
    description: "",
    amount: "",
    dueDate: "",
    status: "pendente" as any,
    paymentMethod: "pix" as any,
    notes: "",
  });

  const createMutation = trpc.financial.create.useMutation({
    onSuccess: () => {
      toast.success("Lançamento financeiro registrado com sucesso!");
      utils.financial.invalidate();
      utils.dashboard.invalidate();
      setIsOpenModal(false);
      resetForm();
    },
    onError: (err) => {
      toast.error("Erro ao registrar lançamento: " + err.message);
    },
  });

  const updateStatusMutation = trpc.financial.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status de pagamento atualizado!");
      utils.financial.invalidate();
      utils.dashboard.invalidate();
    },
  });

  const deleteMutation = trpc.financial.delete.useMutation({
    onSuccess: () => {
      toast.success("Lançamento excluído!");
      utils.financial.invalidate();
      utils.dashboard.invalidate();
    },
  });

  const resetForm = () => {
    setFormData({
      clientId: "",
      type: "receita",
      category: "Honorários Iniciais",
      description: "",
      amount: "",
      dueDate: "",
      status: "pendente",
      paymentMethod: "pix",
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.dueDate) {
      toast.error("Preencha descrição, valor e data de vencimento");
      return;
    }

    createMutation.mutate({
      clientId: formData.clientId ? Number(formData.clientId) : undefined,
      type: formData.type,
      category: formData.category,
      description: formData.description,
      amount: formData.amount,
      dueDate: new Date(formData.dueDate),
      status: formData.status,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
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

  // Totais calculados
  const totalReceitas = transactions
    ?.filter((t) => t.transaction.type === "receita" && t.transaction.status === "pago")
    .reduce((acc, t) => acc + Number(t.transaction.amount || 0), 0) || 0;

  const totalDespesas = transactions
    ?.filter((t) => t.transaction.type === "despesa" && t.transaction.status === "pago")
    .reduce((acc, t) => acc + Number(t.transaction.amount || 0), 0) || 0;

  const saldoLiquido = totalReceitas - totalDespesas;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-amber-500" />
              Gestão Financeira & Honorários
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Honorários pró-labore, êxito (quota litis), custas judiciais, mensalidades e fluxo de caixa do escritório
            </p>
          </div>

          <Button
            onClick={() => setIsOpenModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold gap-1.5 shadow-sm h-9 text-xs"
          >
            <Plus className="h-4 w-4" />
            Novo Lançamento
          </Button>
        </div>

        {/* Resumo Financeiro (Cards de Caixa) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Receitas Realizadas
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <ArrowDownCircle className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalReceitas)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Honorários e consultas liquidadas</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Despesas & Custas Pagas
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
                <ArrowUpCircle className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(totalDespesas)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Custas, taxas, sistemas e estrutura</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Saldo Líquido em Caixa
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Wallet className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${saldoLiquido >= 0 ? "text-slate-900 dark:text-slate-100" : "text-rose-600"}`}>
                {formatCurrency(saldoLiquido)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Resultado financeiro do período</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Tipo:</span>
          {["todos", "receita", "despesa"].map((t) => (
            <Button
              key={t}
              size="sm"
              variant={typeFilter === t ? "default" : "outline"}
              onClick={() => setTypeFilter(t)}
              className="text-xs h-7 capitalize"
            >
              {t}
            </Button>
          ))}

          <span className="text-xs text-muted-foreground font-medium ml-4">Status:</span>
          {["todos", "pendente", "pago", "atrasado"].map((st) => (
            <Button
              key={st}
              size="sm"
              variant={statusFilter === st ? "default" : "outline"}
              onClick={() => setStatusFilter(st)}
              className="text-xs h-7 capitalize"
            >
              {st}
            </Button>
          ))}
        </div>

        {/* Tabela de Lançamentos */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Tipo / Descrição</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Vencimento</th>
                  <th className="p-3">Valor</th>
                  <th className="p-3">Forma</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-muted-foreground">
                      Carregando transações financeiras...
                    </td>
                  </tr>
                ) : !transactions || transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum lançamento financeiro registrado.
                    </td>
                  </tr>
                ) : (
                  transactions.map((item) => {
                    const t = item.transaction;
                    const isReceita = t.type === "receita";
                    const isPago = t.status === "pago";
                    return (
                      <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 ${
                              isReceita ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                            }`}>
                              {isReceita ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {t.description}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{t.category}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{item.clientName || "-"}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{formatDate(t.dueDate)}</td>
                        <td className={`p-3 font-bold ${isReceita ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                          {isReceita ? "+" : "-"} {formatCurrency(t.amount)}
                        </td>
                        <td className="p-3 uppercase text-[10px] text-muted-foreground">{t.paymentMethod}</td>
                        <td className="p-3">
                          <Badge
                            variant={isPago ? "default" : "secondary"}
                            className="text-[10px] uppercase font-semibold"
                          >
                            {t.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: t.id,
                                  status: isPago ? "pendente" : "pago",
                                })
                              }
                              className={`h-7 px-2 text-[11px] ${
                                isPago ? "text-amber-600" : "text-emerald-600"
                              }`}
                            >
                              {isPago ? "Estornar" : "Quitar / Pago"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteMutation.mutate({ id: t.id })}
                              className="h-7 w-7 p-0 text-destructive hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal: Novo Lançamento Financeiro */}
        <Dialog open={isOpenModal} onOpenChange={setIsOpenModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Receipt className="h-5 w-5 text-amber-500" />
                Novo Lançamento Financeiro
              </DialogTitle>
              <DialogDescription className="text-xs">
                Lance receitas de honorários advocatícios ou despesas do escritório.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Tipo de Lançamento</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(val: any) => setFormData({ ...formData, type: val })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receita">Receita (Honorários)</SelectItem>
                      <SelectItem value="despesa">Despesa / Custa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Forma de Pagamento</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(val: any) => setFormData({ ...formData, paymentMethod: val })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Forma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="boleto">Boleto Bancário</SelectItem>
                      <SelectItem value="cartao">Cartão de Crédito</SelectItem>
                      <SelectItem value="transferencia">TED / DOC</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro em Espécie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Categoria</Label>
                <Input
                  required
                  placeholder="Ex: Honorários Iniciais, Mensalidade, Custas Judiciais"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Descrição do Lançamento *</Label>
                <Input
                  required
                  placeholder="Ex: Parcela 1/2 Contrato Honorários - Mariana Santos"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Valor (R$) *</Label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Vencimento *</Label>
                  <Input
                    required
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Cliente Vinculado (Opcional)</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(val) => setFormData({ ...formData, clientId: val })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Selecione o cliente pagador/beneficiário" />
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

              <div className="space-y-1">
                <Label className="text-xs">Status Inicial</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente de Pagamento</SelectItem>
                    <SelectItem value="pago">Já Pago / Liquidado</SelectItem>
                  </SelectContent>
                </Select>
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
                  {createMutation.isPending ? "Salvando..." : "Confirmar Lançamento"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
