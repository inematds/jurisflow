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
  Copy,
  Download,
  FileCheck,
  FileSignature,
  FileText,
  Plus,
  Printer,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Documentos() {
  const [tab, setTab] = useState<"modelos" | "processos">("modelos");
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const utils = trpc.useUtils();
  const { data: documents, isLoading } = trpc.documents.list.useQuery({
    isTemplate: tab === "modelos",
  });

  const [formData, setFormData] = useState({
    title: "",
    category: "procuracao" as any,
    content: "",
    isTemplate: true,
  });

  const createMutation = trpc.documents.create.useMutation({
    onSuccess: () => {
      toast.success("Documento salvo com sucesso!");
      utils.documents.invalidate();
      setIsOpenModal(false);
      resetForm();
    },
    onError: (err) => {
      toast.error("Erro ao salvar documento: " + err.message);
    },
  });

  const deleteMutation = trpc.documents.delete.useMutation({
    onSuccess: () => {
      toast.success("Documento removido!");
      utils.documents.invalidate();
      setSelectedDoc(null);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      category: "procuracao",
      content: "",
      isTemplate: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error("Título e conteúdo do documento são obrigatórios");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Texto copiado para a área de transferência!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <FileSignature className="h-6 w-6 text-amber-500" />
              Documentos & Modelos de Peças Jurídicas
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Procurações 'ad judicia', contratos de honorários, declarações de hipossuficiência, petições e minutas editáveis
            </p>
          </div>

          <Button
            onClick={() => setIsOpenModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold gap-1.5 shadow-sm h-9 text-xs"
          >
            <Plus className="h-4 w-4" />
            Novo Modelo / Documento
          </Button>
        </div>

        {/* Abas */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <Button
            size="sm"
            variant={tab === "modelos" ? "default" : "ghost"}
            onClick={() => {
              setTab("modelos");
              setSelectedDoc(null);
            }}
            className="text-xs h-8 gap-1.5"
          >
            <FileText className="h-3.5 w-3.5" />
            Modelos de Peças & Contratos
          </Button>
          <Button
            size="sm"
            variant={tab === "processos" ? "default" : "ghost"}
            onClick={() => {
              setTab("processos");
              setSelectedDoc(null);
            }}
            className="text-xs h-8 gap-1.5"
          >
            <FileCheck className="h-3.5 w-3.5" />
            Documentos Vinculados a Processos
          </Button>
        </div>

        {/* Layout Grid: Lista de Documentos + Editor/Visualizador */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Lista de Documentos */}
          <div className="lg:col-span-5 space-y-3">
            {isLoading ? (
              <div className="text-center py-12 text-xs text-muted-foreground">Carregando documentos...</div>
            ) : !documents || documents.length === 0 ? (
              <Card className="p-8 text-center border-dashed border-slate-300 dark:border-slate-800">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-muted-foreground">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Nenhum documento disponível</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Crie um modelo ou carregue a base demonstrativa no menu lateral.
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsOpenModal(true)}
                    variant="outline"
                    className="text-xs h-8 gap-1.5 mt-2"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Criar Modelo
                  </Button>
                </div>
              </Card>
            ) : (
              documents.map((item) => {
                const doc = item.document;
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <Card
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`cursor-pointer transition-all border ${
                      isSelected
                        ? "border-amber-500 shadow-md bg-amber-500/5 dark:bg-amber-500/10"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                            {doc.title}
                          </h3>
                          <Badge variant="outline" className="text-[10px] uppercase font-semibold mt-1">
                            {doc.category.replace(/_/g, " ")}
                          </Badge>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMutation.mutate({ id: doc.id });
                          }}
                          className="h-7 w-7 p-0 text-destructive hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {doc.content && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                          {doc.content}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Visualizador / Editor do Documento */}
          <div className="lg:col-span-7">
            {selectedDoc ? (
              <Card className="border-slate-200 dark:border-slate-800 shadow-sm sticky top-20">
                <CardHeader className="p-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                        {selectedDoc.title}
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        Categoria: {selectedDoc.category.replace(/_/g, " ")}
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(selectedDoc.content || "")}
                        className="text-xs h-8 gap-1.5"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copiar Texto
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.print()}
                        className="text-xs h-8 gap-1.5"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        Imprimir
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 font-serif text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap min-h-[420px] max-h-[600px] overflow-y-auto shadow-inner">
                    {selectedDoc.content}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="p-12 text-center border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-muted-foreground">
                  <FileText className="h-6 w-6" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Selecione um documento ou modelo ao lado para visualizar e copiar a minuta.
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Modal: Novo Documento */}
        <Dialog open={isOpenModal} onOpenChange={setIsOpenModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <FileSignature className="h-5 w-5 text-amber-500" />
                Criar Modelo ou Documento Jurídico
              </DialogTitle>
              <DialogDescription className="text-xs">
                Salve minutas padrão para utilizar rapidamente com clientes e processos.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-3 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Título do Documento *</Label>
                  <Input
                    required
                    placeholder="Ex: Modelo - Procuração Ad Judicia Geral"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Categoria da Peça</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(val: any) => setFormData({ ...formData, category: val })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="procuracao">Procuração Ad Judicia</SelectItem>
                      <SelectItem value="contrato_honorarios">Contrato de Honorários</SelectItem>
                      <SelectItem value="declaracao_hipossuficiencia">Declaração de Hipossuficiência (Justiça Gratuita)</SelectItem>
                      <SelectItem value="peticao_inicial">Petição Inicial</SelectItem>
                      <SelectItem value="contestacao">Contestação</SelectItem>
                      <SelectItem value="recurso">Recurso / Agravo / Apelação</SelectItem>
                      <SelectItem value="termo_acordo">Termo de Acordo Extrajudicial</SelectItem>
                      <SelectItem value="notificacao_extrajudicial">Notificação Extrajudicial</SelectItem>
                      <SelectItem value="outro">Outro Documento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Conteúdo da Minuta (Texto Completo) *</Label>
                <Textarea
                  required
                  placeholder="Escreva ou cole a minuta aqui..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="text-xs min-h-[240px] font-mono leading-relaxed"
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
                  {createMutation.isPending ? "Salvando..." : "Salvar Modelo"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
