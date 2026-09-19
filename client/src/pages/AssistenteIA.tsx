import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  BookOpen,
  Bot,
  Copy,
  FileCheck,
  FileText,
  Gavel,
  Loader2,
  Scale,
  Send,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function AssistenteIA() {
  const [prompt, setPrompt] = useState("");
  const [actionType, setActionType] = useState<any>("minuta_peticao");
  const [contextData, setContextData] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const aiMutation = trpc.aiAssistant.draftOrAnalyze.useMutation({
    onSuccess: (data) => {
      setResult(typeof data.content === "string" ? data.content : JSON.stringify(data.content, null, 2));
      toast.success("Resposta jurídica gerada com sucesso!");
    },
    onError: (err) => {
      toast.error("Erro ao gerar resposta com IA: " + err.message);
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Informe os fatos ou o pedido da peça");
      return;
    }
    aiMutation.mutate({
      prompt,
      actionType,
      contextData,
    });
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    toast.success("Texto copiado para a área de transferência!");
  };

  const templates = [
    {
      title: "Petição Inicial Trabalhista",
      type: "minuta_peticao",
      prompt: "Cliente trabalhou como analista de logística de 2022 a 2025, cumpria 2 horas extras diárias sem remuneração e foi demitido sem justa causa sem receber o aviso prévio indenizado. Redigir minuta de Reclamação Trabalhista.",
    },
    {
      title: "Impugnação à Contestação (Cível)",
      type: "minuta_peticao",
      prompt: "Ação de indenização por atraso na entrega de imóvel. Construtora alegou caso fortuito e força maior devido a chuvas e falta de mão de obra. Rebater os argumentos com base na súmula 161 do TJSP e CDC.",
    },
    {
      title: "Notificação Extrajudicial por Inadimplemento",
      type: "notificacao_extrajudicial",
      prompt: "Locatário comercial em atraso com os alugueres dos últimos 3 meses no valor total de R$ 18.000,00. Conceder prazo de 15 dias para purga da mora sob pena de despejo c/c cobrança.",
    },
    {
      title: "Análise de Jurisprudência (Dano Moral Bancário)",
      type: "analise_jurisprudencia",
      prompt: "Quais os entendimentos consolidados do STJ sobre descontos indevidos de empréstimo consignado não contratado na aposentadoria de consumidor idoso (Tema 1061)?",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Bot className="h-6 w-6 text-amber-500" />
              Assistente Jurídico Inteligente (IA Especializada)
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Redação de minutas de petições, recursos, notificações, contratos, cálculo de prazos e pareceres em Direito Brasileiro
            </p>
          </div>
        </div>

        {/* Sugestões Rápidas de Casos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {templates.map((tpl) => (
            <button
              key={tpl.title}
              onClick={() => {
                setActionType(tpl.type);
                setPrompt(tpl.prompt);
              }}
              className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-400 hover:shadow-xs transition-all flex flex-col justify-between gap-2"
            >
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{tpl.title}</span>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2">
                {tpl.prompt}
              </p>
            </button>
          ))}
        </div>

        {/* Formulário de Requisição + Área de Resultado */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Parâmetros do Pedido */}
          <Card className="lg:col-span-5 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                Configurar Demanda Jurídica
              </CardTitle>
              <CardDescription className="text-xs">
                Selecione o tipo de peça ou análise e descreva os fatos do caso.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <form onSubmit={handleGenerate} className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Tipo de Ação da IA</Label>
                  <Select value={actionType} onValueChange={(val: any) => setActionType(val)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minuta_peticao">Minuta de Petição / Peça Processual</SelectItem>
                      <SelectItem value="notificacao_extrajudicial">Notificação Extrajudicial</SelectItem>
                      <SelectItem value="contrato_honorarios">Contrato de Honorários Personalizado</SelectItem>
                      <SelectItem value="analise_jurisprudencia">Pesquisa & Análise de Jurisprudência</SelectItem>
                      <SelectItem value="calculo_prazo">Cálculo & Contagem de Prazo Fatal</SelectItem>
                      <SelectItem value="resumo_andamento">Resumo Descomplicado para o Cliente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Fatos do Caso / Solicitação *</Label>
                  <Textarea
                    required
                    placeholder="Descreva quem é o cliente, o que aconteceu, datas relevantes, valores e o que se pretende pedir..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="text-xs min-h-[140px] leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Legislação ou Contexto Adicional (Opcional)</Label>
                  <Input
                    placeholder="Ex: Art. 186 do CC, Tema 971 do STJ, CLT etc."
                    value={contextData}
                    onChange={(e) => setContextData(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={aiMutation.isPending}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs h-9 gap-2 shadow-sm"
                >
                  {aiMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Elaborando Fundamentação Jurídica...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Gerar com IA Jurídica
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Resultado Gerado */}
          <div className="lg:col-span-7">
            {result ? (
              <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="p-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                      <FileCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                        Minuta / Parecer Gerado
                      </CardTitle>
                      <CardDescription className="text-[11px]">
                        Revisado conforme o ordenamento jurídico brasileiro
                      </CardDescription>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                    className="text-xs h-8 gap-1.5"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copiar Minuta
                  </Button>
                </CardHeader>

                <CardContent className="p-5">
                  <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 max-h-[620px] overflow-y-auto">
                    <Streamdown>{result}</Streamdown>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="p-16 text-center border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <Bot className="h-7 w-7" />
                </div>
                <div className="max-w-md">
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    Pronto para redigir peças e analisar casos
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Preencha o formulário ao lado ou selecione um caso de exemplo para que o assistente gere a fundamentação, súmulas e pedidos pertinentes.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
