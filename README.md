# JurisFlow

[![JurisFlow](guia/assets/banner.jpg)](https://inematds.github.io/jurisflow/guia/)

## 📖 Guia de uso

Guia completo (landing + passo a passo): **https://inematds.github.io/jurisflow/guia/**

Sistema de gestão para escritório de advocacia — ERP/CRM jurídico com assistente de IA.

## Módulos

| Módulo | O que faz |
| --- | --- |
| Painel Geral | Indicadores de clientes, processos ativos, prazos, audiências, receitas, despesas e saldo |
| Clientes | Cadastro PF/PJ, CPF/CNPJ, contatos, endereço, profissão, estado civil, observações e status |
| Processos | Número CNJ, tribunal, vara, comarca, área jurídica, fase, parte contrária, valor da causa e status |
| Andamentos | Movimentações dentro dos processos, com marcação de movimentações importantes |
| Atendimentos | Triagem de novos clientes por WhatsApp, presencial, vídeo, telefone, e-mail |
| Agenda & Prazos | Prazos fatais, audiências, reuniões, perícias e diligências |
| Tarefas | Gestão interna: prioridade, responsável, prazo e status |
| Financeiro | Receitas, despesas, honorários, custas, vencimentos, pagamentos e fluxo financeiro |
| Documentos | Modelos jurídicos: petições, procurações, contratos, notificações |
| Assistente Jurídico IA | Geração e análise de conteúdo jurídico via LLM |

Fases do processo: **Inicial → Instrução → Decisão → Recurso → Execução → Arquivado**
Status: **Ativo / Suspenso / Em acordo / Ganho / Perdido / Arquivado**

## Assistente Jurídico IA

Trabalha com Direito Brasileiro (CPC, CPP, CLT, Constituição Federal, Código Civil, CDC, STF, STJ, TST) e cobre seis operações: minuta de petição, análise de jurisprudência, cálculo de prazo, resumo de andamento, notificação extrajudicial e contrato de honorários.

> ⚠️ Não há, hoje, fonte jurídica verificadora conectada ao modelo. Toda citação de lei ou jurisprudência produzida pela IA **precisa ser conferida** antes do uso.

## Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind, Radix UI, Lucide, TanStack Query, tRPC
- **Backend:** Node.js, Express, tRPC, Zod
- **Banco:** MySQL + Drizzle ORM
- **Arquivos:** estrutura preparada para S3
- **Auth:** OAuth + JWT

Tabelas: `users`, `clients`, `consultations`, `lawsuits`, `lawsuit_movements`, `calendar_events`, `tasks`, `financial_transactions`, `legal_documents`.

## Rodando local

```bash
pnpm install
cp .env.example .env     # preencha DATABASE_URL, JWT_SECRET e as chaves do LLM
pnpm db:push             # gera e aplica as migrations
pnpm dev                 # http://localhost:3000
```

Outros scripts: `pnpm build`, `pnpm start`, `pnpm check` (typecheck), `pnpm test` (vitest), `pnpm format`.

## Modo demonstração

O botão **"Gerar Dados Exemplo"** no menu popula o sistema com clientes, processos, audiências, tarefas, lançamentos financeiros e documentos — útil para demo comercial sem cadastrar nada à mão.

## Estágio atual

MVP funcional. Ainda **não** implementados: integração com tribunais, captura automática de movimentações CNJ, publicações do Diário Oficial, jurisprudência em tempo real, RAG com documentos do escritório, assinatura digital, export DOCX/PDF, integrações WhatsApp/Gmail/Google Calendar, OCR, permissões avançadas de equipe, auditoria detalhada, multiescritório, cobrança PIX/boleto e automação de prazos.

## Licença

MIT
