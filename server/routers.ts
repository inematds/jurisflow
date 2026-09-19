import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,

  // Autenticação
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().optional(),
          phone: z.string().optional(),
          oabNumber: z.string().optional(),
          oabUf: z.string().optional(),
          avatarUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.upsertUser({
          openId: ctx.user.openId,
          name: input.name,
          phone: input.phone,
          oabNumber: input.oabNumber,
          oabUf: input.oabUf,
          avatarUrl: input.avatarUrl,
        });
        return { success: true };
      }),
  }),

  // Métricas do Dashboard
  dashboard: router({
    metrics: protectedProcedure.query(async () => {
      return db.getDashboardMetrics();
    }),
    upcomingEvents: protectedProcedure.query(async () => {
      return db.getCalendarEvents({ completed: false });
    }),
    recentLawsuits: protectedProcedure.query(async () => {
      return db.getLawsuits();
    }),
  }),

  // Gestão de Clientes
  clients: router({
    list: protectedProcedure
      .input(z.object({ search: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return db.getClients(input?.search);
      }),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const client = await db.getClientById(input.id);
      if (!client) throw new TRPCError({ code: "NOT_FOUND", message: "Cliente não encontrado" });
      return client;
    }),
    create: protectedProcedure
      .input(
        z.object({
          type: z.enum(["PF", "PJ"]).default("PF"),
          name: z.string().min(2, "Nome é obrigatório"),
          cpfCnpj: z.string().optional(),
          rgIe: z.string().optional(),
          email: z.string().email().optional().or(z.literal("")),
          phone: z.string().optional(),
          whatsapp: z.string().optional(),
          occupation: z.string().optional(),
          maritalStatus: z.string().optional(),
          nationality: z.string().default("Brasileiro(a)"),
          addressStreet: z.string().optional(),
          addressNumber: z.string().optional(),
          addressComplement: z.string().optional(),
          addressNeighborhood: z.string().optional(),
          addressCity: z.string().optional(),
          addressState: z.string().optional(),
          addressZipCode: z.string().optional(),
          status: z.enum(["ativo", "inativo", "lead", "prospecto"]).default("ativo"),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.createClient({
          ...input,
          userId: ctx.user.id,
          email: input.email || null,
        });
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          type: z.enum(["PF", "PJ"]).optional(),
          name: z.string().optional(),
          cpfCnpj: z.string().optional(),
          rgIe: z.string().optional(),
          email: z.string().optional(),
          phone: z.string().optional(),
          whatsapp: z.string().optional(),
          occupation: z.string().optional(),
          maritalStatus: z.string().optional(),
          nationality: z.string().optional(),
          addressStreet: z.string().optional(),
          addressNumber: z.string().optional(),
          addressComplement: z.string().optional(),
          addressNeighborhood: z.string().optional(),
          addressCity: z.string().optional(),
          addressState: z.string().optional(),
          addressZipCode: z.string().optional(),
          status: z.enum(["ativo", "inativo", "lead", "prospecto"]).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateClient(id, data);
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      return db.deleteClient(input.id);
    }),
  }),

  // Gestão de Processos
  lawsuits: router({
    list: protectedProcedure
      .input(
        z
          .object({
            clientId: z.number().optional(),
            search: z.string().optional(),
            status: z.string().optional(),
            phase: z.string().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        return db.getLawsuits(input);
      }),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const lawsuit = await db.getLawsuitById(input.id);
      if (!lawsuit) throw new TRPCError({ code: "NOT_FOUND", message: "Processo não encontrado" });
      return lawsuit;
    }),
    create: protectedProcedure
      .input(
        z.object({
          clientId: z.number(),
          cnjNumber: z.string().min(5, "Número CNJ obrigatório"),
          title: z.string().min(3, "Título obrigatório"),
          area: z.string().min(2, "Área do direito obrigatória"),
          court: z.string().min(2, "Tribunal obrigatório"),
          judicialDistrict: z.string().optional(),
          courtDivision: z.string().optional(),
          phase: z.enum(["inicial", "instrucao", "decisao", "recurso", "execucao", "arquivado"]).default("inicial"),
          roleInLawsuit: z.enum(["autor", "reu", "terceiro_interessado", "assistente"]).default("autor"),
          opposingParty: z.string().optional(),
          opposingLawyer: z.string().optional(),
          estimatedValue: z.string().optional().default("0.00"),
          status: z.enum(["ativo", "suspenso", "em_acordo", "ganho", "perdido", "arquivado"]).default("ativo"),
          distributionDate: z.date().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.createLawsuit({
          ...input,
          responsibleUserId: ctx.user.id,
        });
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          cnjNumber: z.string().optional(),
          title: z.string().optional(),
          area: z.string().optional(),
          court: z.string().optional(),
          judicialDistrict: z.string().optional(),
          courtDivision: z.string().optional(),
          phase: z.enum(["inicial", "instrucao", "decisao", "recurso", "execucao", "arquivado"]).optional(),
          roleInLawsuit: z.enum(["autor", "reu", "terceiro_interessado", "assistente"]).optional(),
          opposingParty: z.string().optional(),
          opposingLawyer: z.string().optional(),
          estimatedValue: z.string().optional(),
          status: z.enum(["ativo", "suspenso", "em_acordo", "ganho", "perdido", "arquivado"]).optional(),
          distributionDate: z.date().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateLawsuit(id, data);
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      return db.deleteLawsuit(input.id);
    }),
    addMovement: protectedProcedure
      .input(
        z.object({
          lawsuitId: z.number(),
          title: z.string().min(2, "Título é obrigatório"),
          description: z.string().min(2, "Descrição é obrigatória"),
          movementDate: z.date().optional(),
          isImportant: z.boolean().default(false),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.addLawsuitMovement({
          ...input,
          createdByUserId: ctx.user.id,
          movementDate: input.movementDate || new Date(),
        });
      }),
  }),

  // Atendimentos e Consultas Iniciais
  consultations: router({
    list: protectedProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return db.getConsultations(input?.status);
      }),
    create: protectedProcedure
      .input(
        z.object({
          clientId: z.number().optional(),
          clientName: z.string().min(2, "Nome do cliente é obrigatório"),
          clientContact: z.string().optional(),
          channel: z.enum(["whatsapp", "presencial", "videoconferencia", "telefone", "email", "outro"]).default("whatsapp"),
          subject: z.string().min(3, "Assunto é obrigatório"),
          description: z.string().optional(),
          legalArea: z.string().min(2, "Área do direito obrigatória"),
          status: z.enum(["agendado", "em_andamento", "concluido", "convertido_em_processo", "cancelado"]).default("agendado"),
          scheduledAt: z.date().optional(),
          feeAmount: z.string().optional().default("0.00"),
          feePaid: z.boolean().default(false),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.createConsultation({
          ...input,
          userId: ctx.user.id,
        });
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["agendado", "em_andamento", "concluido", "convertido_em_processo", "cancelado"]).optional(),
          feePaid: z.boolean().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateConsultation(id, data);
      }),
  }),

  // Agenda e Prazos Processuais
  calendar: router({
    list: protectedProcedure
      .input(
        z
          .object({
            type: z.string().optional(),
            completed: z.boolean().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        return db.getCalendarEvents(input);
      }),
    create: protectedProcedure
      .input(
        z.object({
          lawsuitId: z.number().optional(),
          clientId: z.number().optional(),
          type: z.enum(["prazo_fatal", "audiencia", "reuniao", "pericia", "diligencia", "outro"]),
          title: z.string().min(3, "Título obrigatório"),
          description: z.string().optional(),
          startAt: z.date(),
          endAt: z.date().optional(),
          deadlineType: z.enum(["dias_uteis", "dias_corridos", "horario_especifico"]).default("dias_uteis"),
          status: z.enum(["pendente", "concluido", "cancelado", "urgente"]).default("pendente"),
          location: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.createCalendarEvent({
          ...input,
          userId: ctx.user.id,
        });
      }),
    toggleCompleted: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          isCompleted: z.boolean(),
        })
      )
      .mutation(async ({ input }) => {
        return db.updateCalendarEvent(input.id, {
          isCompleted: input.isCompleted,
          status: input.isCompleted ? "concluido" : "pendente",
          completedAt: input.isCompleted ? new Date() : null,
        });
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      return db.deleteCalendarEvent(input.id);
    }),
  }),

  // Tarefas da Equipe
  tasks: router({
    list: protectedProcedure
      .input(
        z
          .object({
            status: z.string().optional(),
            priority: z.string().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        return db.getTasks(input);
      }),
    create: protectedProcedure
      .input(
        z.object({
          lawsuitId: z.number().optional(),
          clientId: z.number().optional(),
          title: z.string().min(3, "Título é obrigatório"),
          description: z.string().optional(),
          priority: z.enum(["baixa", "media", "alta", "urgente"]).default("media"),
          status: z.enum(["a_fazer", "em_andamento", "revisao", "concluida"]).default("a_fazer"),
          dueDate: z.date().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.createTask({
          ...input,
          creatorUserId: ctx.user.id,
          assignedUserId: ctx.user.id,
        });
      }),
    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["a_fazer", "em_andamento", "revisao", "concluida"]),
        })
      )
      .mutation(async ({ input }) => {
        return db.updateTask(input.id, {
          status: input.status,
          completedAt: input.status === "concluida" ? new Date() : null,
        });
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      return db.deleteTask(input.id);
    }),
  }),

  // Gestão Financeira
  financial: router({
    list: protectedProcedure
      .input(
        z
          .object({
            type: z.string().optional(),
            status: z.string().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        return db.getFinancialTransactions(input);
      }),
    create: protectedProcedure
      .input(
        z.object({
          clientId: z.number().optional(),
          lawsuitId: z.number().optional(),
          type: z.enum(["receita", "despesa"]),
          category: z.string().min(2, "Categoria obrigatória"),
          description: z.string().min(3, "Descrição obrigatória"),
          amount: z.string().min(1, "Valor obrigatório"),
          dueDate: z.date(),
          paymentDate: z.date().optional(),
          status: z.enum(["pendente", "pago", "atrasado", "cancelado"]).default("pendente"),
          paymentMethod: z.enum(["pix", "boleto", "cartao", "transferencia", "dinheiro"]).default("pix"),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.createFinancialTransaction({
          ...input,
          userId: ctx.user.id,
        });
      }),
    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pendente", "pago", "atrasado", "cancelado"]),
          paymentDate: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.updateFinancialTransaction(input.id, {
          status: input.status,
          paymentDate: input.status === "pago" ? input.paymentDate || new Date() : null,
        });
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      return db.deleteFinancialTransaction(input.id);
    }),
  }),

  // Documentos Jurídicos e Modelos de Peças
  documents: router({
    list: protectedProcedure
      .input(
        z
          .object({
            isTemplate: z.boolean().optional(),
            category: z.string().optional(),
            clientId: z.number().optional(),
            lawsuitId: z.number().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        return db.getLegalDocuments(input);
      }),
    create: protectedProcedure
      .input(
        z.object({
          clientId: z.number().optional(),
          lawsuitId: z.number().optional(),
          title: z.string().min(3, "Título obrigatório"),
          category: z.enum([
            "peticao_inicial",
            "contestacao",
            "recurso",
            "procuracao",
            "contrato_honorarios",
            "declaracao_hipossuficiencia",
            "termo_acordo",
            "notificacao_extrajudicial",
            "documento_cliente",
            "outro",
          ]),
          content: z.string().optional(),
          fileUrl: z.string().optional(),
          fileKey: z.string().optional(),
          isTemplate: z.boolean().default(false),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.createLegalDocument({
          ...input,
          userId: ctx.user.id,
        });
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      return db.deleteLegalDocument(input.id);
    }),
  }),

  // Assistente Jurídico com IA Integrada
  aiAssistant: router({
    draftOrAnalyze: protectedProcedure
      .input(
        z.object({
          prompt: z.string().min(5, "Informe o pedido ou caso"),
          actionType: z.enum([
            "minuta_peticao",
            "analise_jurisprudencia",
            "calculo_prazo",
            "resumo_andamento",
            "notificacao_extrajudicial",
            "contrato_honorarios",
          ]),
          contextData: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const systemPrompt = `Você é o Assistente Jurídico Inteligente do JurisFlow, especializado em Direito Brasileiro (CPC, CPP, CLT, CF/88, CC, CDC e jurisprudência dos Tribunais Superiores STF/STJ/TST).
Responda com rigor técnico, fundamentação jurídica clara, artigos de lei pertinentes e modelos prontos para uso prático pelo advogado.
Formate a resposta de forma elegante em Markdown com títulos, listas e citações.`;

        const userMessage = `Ação solicitada: ${input.actionType}
Detalhes do caso/demanda: ${input.prompt}
${input.contextData ? `Contexto adicional: ${input.contextData}` : ""}`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage },
            ],
          });
          return {
            content: response.choices[0]?.message?.content || "Não foi possível gerar a resposta jurídica no momento.",
          };
        } catch (error: any) {
          return {
            content: `**Parecer Jurídico Preliminar (Modo Offline/Simulado):**\n\nCom base na solicitação sobre "${input.prompt}", recomenda-se atentar aos prazos do art. 219 do CPC (contagem em dias úteis) e juntar a procuração 'ad judicia et extra' com poderes específicos. Para elaboração da peça, estruture os Fatos, Fundamentos Jurídicos e Pedidos com valor da causa liquidado.`,
          };
        }
      }),
  }),

  // Povoamento de dados de demonstração (Seed para o advogado ter o sistema 100% pronto e preenchido)
  seedDemoData: protectedProcedure.mutation(async ({ ctx }) => {
    // 1. Criar clientes exemplo
    const c1 = await db.createClient({
      userId: ctx.user.id,
      type: "PF",
      name: "Mariana Silva Santos",
      cpfCnpj: "123.456.789-00",
      email: "mariana.santos@email.com",
      phone: "(11) 98765-4321",
      whatsapp: "(11) 98765-4321",
      occupation: "Engenheira Civil",
      maritalStatus: "Casada",
      addressCity: "São Paulo",
      addressState: "SP",
      status: "ativo",
      notes: "Cliente com ação trabalhista e de direito imobiliário.",
    });

    const c2 = await db.createClient({
      userId: ctx.user.id,
      type: "PJ",
      name: "TechSolutions Inovações Ltda",
      cpfCnpj: "12.345.678/0001-90",
      email: "contato@techsolutions.com.br",
      phone: "(11) 3344-5566",
      whatsapp: "(11) 99887-1122",
      occupation: "Tecnologia da Informação",
      addressCity: "Campinas",
      addressState: "SP",
      status: "ativo",
      notes: "Contrato de assessoria jurídica mensal (retainer).",
    });

    const c3 = await db.createClient({
      userId: ctx.user.id,
      type: "PF",
      name: "Carlos Eduardo Oliveira",
      cpfCnpj: "987.654.321-11",
      email: "carlos.oliveira@email.com",
      phone: "(21) 99123-8877",
      whatsapp: "(21) 99123-8877",
      occupation: "Empresário",
      maritalStatus: "Divorciado",
      addressCity: "Rio de Janeiro",
      addressState: "RJ",
      status: "prospecto",
      notes: "Consulta sobre partilha de bens e dissolução societária.",
    });

    // 2. Criar Processos
    const l1 = await db.createLawsuit({
      clientId: c1.id,
      responsibleUserId: ctx.user.id,
      cnjNumber: "1002345-89.2026.8.26.0100",
      title: "Mariana Santos x Construtora Horizonte S/A",
      area: "Cível / Direito Imobiliário",
      court: "TJSP",
      judicialDistrict: "Foro Central Cível - Capital",
      courtDivision: "14ª Vara Cível",
      phase: "instrucao",
      roleInLawsuit: "autor",
      opposingParty: "Construtora Horizonte S/A",
      opposingLawyer: "Dr. Roberto Macedo (OAB/SP 88.990)",
      estimatedValue: "185000.00",
      status: "ativo",
      notes: "Ação de rescisão contratual c/c restituição de valores pagos e indenização por atraso na entrega de imóvel.",
    });

    await db.addLawsuitMovement({
      lawsuitId: l1.id,
      title: "Designação de Audiência de Instrução e Julgamento",
      description: "Audiência telepresencial pautada para oitiva de testemunhas e depoimento pessoal.",
      movementDate: new Date(),
      isImportant: true,
      createdByUserId: ctx.user.id,
    });

    const l2 = await db.createLawsuit({
      clientId: c2.id,
      responsibleUserId: ctx.user.id,
      cnjNumber: "0010892-44.2025.5.02.0045",
      title: "TechSolutions Ltda x Ex-Colaborador João Pereira",
      area: "Trabalhista",
      court: "TRT-2",
      judicialDistrict: "São Paulo",
      courtDivision: "45ª Vara do Trabalho",
      phase: "recurso",
      roleInLawsuit: "reu",
      opposingParty: "João Pereira",
      opposingLawyer: "Dra. Patrícia Lima (OAB/SP 145.220)",
      estimatedValue: "42000.00",
      status: "ativo",
      notes: "Interposição de Recurso Ordinário com pedido de efeito suspensivo.",
    });

    // 3. Prazos e Eventos de Agenda
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    tomorrow.setHours(14, 0, 0, 0);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 5);
    nextWeek.setHours(10, 30, 0, 0);

    await db.createCalendarEvent({
      userId: ctx.user.id,
      lawsuitId: l1.id,
      clientId: c1.id,
      type: "prazo_fatal",
      title: "Manifestação sobre laudo pericial contábil",
      description: "Prazo de 15 dias úteis (art. 477, § 1º do CPC) para impugnação ao laudo da perícia.",
      startAt: tomorrow,
      deadlineType: "dias_uteis",
      status: "urgente",
    });

    await db.createCalendarEvent({
      userId: ctx.user.id,
      lawsuitId: l1.id,
      clientId: c1.id,
      type: "audiencia",
      title: "Audiência de Instrução e Julgamento (Virtual)",
      description: "Sala virtual Microsoft Teams do TJSP. Link nos autos.",
      startAt: nextWeek,
      deadlineType: "horario_especifico",
      status: "pendente",
      location: "https://teams.microsoft.com/l/meetup-join/tjsp-audiencia",
    });

    // 4. Atendimentos/Consultas
    await db.createConsultation({
      userId: ctx.user.id,
      clientId: c3.id,
      clientName: "Carlos Eduardo Oliveira",
      clientContact: "(21) 99123-8877",
      channel: "videoconferencia",
      subject: "Consulta inicial sobre Dissolução de Sociedade Empresária",
      description: "Sócio minoritário com divergências graves de gestão na holding familiar.",
      legalArea: "Direito Empresarial / Societário",
      status: "agendado",
      scheduledAt: tomorrow,
      feeAmount: "650.00",
      feePaid: true,
    });

    // 5. Tarefas
    await db.createTask({
      creatorUserId: ctx.user.id,
      assignedUserId: ctx.user.id,
      lawsuitId: l2.id,
      title: "Elaborar minuta das Razões do Recurso Ordinário",
      description: "Enfatizar cerceamento de defesa e juntada de novos documentos.",
      priority: "alta",
      status: "em_andamento",
      dueDate: tomorrow,
    });

    // 6. Transações Financeiras
    await db.createFinancialTransaction({
      userId: ctx.user.id,
      clientId: c1.id,
      lawsuitId: l1.id,
      type: "receita",
      category: "Honorários Iniciais",
      description: "Parcela 1/3 - Contrato de Honorários Advocatícios Mariana Santos",
      amount: "4500.00",
      dueDate: new Date(),
      paymentDate: new Date(),
      status: "pago",
      paymentMethod: "pix",
    });

    const futureDue = new Date();
    futureDue.setDate(futureDue.getDate() + 15);

    await db.createFinancialTransaction({
      userId: ctx.user.id,
      clientId: c2.id,
      type: "receita",
      category: "Honorários Mensais (Retainer)",
      description: "Mensalidade Assessoria Jurídica TechSolutions Ltda",
      amount: "6800.00",
      dueDate: futureDue,
      status: "pendente",
      paymentMethod: "boleto",
    });

    await db.createFinancialTransaction({
      userId: ctx.user.id,
      type: "despesa",
      category: "Sistemas & Softwares",
      description: "Assinatura Certificado Digital ICP-Brasil A3 e Token",
      amount: "289.90",
      dueDate: new Date(),
      paymentDate: new Date(),
      status: "pago",
      paymentMethod: "cartao",
    });

    // 7. Modelos de Documentos
    await db.createLegalDocument({
      userId: ctx.user.id,
      title: "Modelo - Procuração Ad Judicia et Extra (Geral)",
      category: "procuracao",
      isTemplate: true,
      content: `PROCURAÇÃO AD JUDICIA ET EXTRA

OUTORGANTE: [NOME DO CLIENTE], [nacionalidade], [estado civil], [profissão], portador(a) do RG nº [RG], inscrito(a) no CPF/CNPJ sob o nº [CPF/CNPJ], residente e domiciliado(a) na [endereço completo].

OUTORGADO: [NOME DO ADVOGADO], brasileiro, casado/solteiro, advogado inscrito na OAB sob o nº [NÚMERO DA OAB]/[UF], com escritório profissional localizado em [endereço do escritório], onde recebe notificações e intimações.

PODERES: Pelo presente instrumento particular de procuração, o(a) Outorgante nomeia e constitui o Outorgado seu bastante procurador, outorgando-lhe amplos poderes para o foro em geral, conferidos pela cláusula "ad judicia et extra", em qualquer Juízo, Instância ou Tribunal, podendo propor contra quem de direito as ações competentes e defendê-lo(a) nas contrárias, seguindo umas e outras até final decisão, usando dos recursos legais e acompanhando-os.

PODERES ESPECÍFICOS: Confere ainda poderes especiais para confessar, reconhecer a procedência do pedido, transigir, desistir, renunciar ao direito sobre o qual se funda a ação, receber, dar quitação, firmar compromissos e acordos, substabelecer com ou sem reserva de iguais poderes.

[CIDADE/UF], [DATA].

__________________________________________
[NOME DO CLIENTE]
Outorgante`,
    });

    await db.createLegalDocument({
      userId: ctx.user.id,
      title: "Modelo - Contrato de Prestação de Serviços Advocatícios",
      category: "contrato_honorarios",
      isTemplate: true,
      content: `CONTRATO DE HONORÁRIOS ADVOCATÍCIOS

Pelo presente instrumento particular, de um lado:
CONTRATANTE: [NOME DO CLIENTE], CPF/CNPJ: [CPF/CNPJ].
CONTRATADO: [NOME DO ADVOGADO / SOCIEDADE DE ADVOGADOS], OAB [UF] [Nº].

CLÁUSULA PRIMEIRA - DO OBJETO:
O Contratado obriga-se a prestar assistência jurídica ao Contratante para a propositura e acompanhamento de [Ação/Demanda Judicial ou Extrajudicial], até a instância final.

CLÁUSULA SEGUNDA - DOS HONORÁRIOS:
Pelos serviços pactuados, o Contratante pagará ao Contratado a quantia de:
a) Honorários Iniciais (Pró-labore): R$ [VALOR], divididos em [Nº] parcelas;
b) Honorários de Êxito (Quota Litis): o percentual de 20% (vinte por cento) sobre o proveito econômico obtido ao final da demanda.

CLÁUSULA TERCEIRA - DAS CUSTAS E DESPESAS:
Todas as custas processuais, emolumentos, perícias, certidões e despesas com diligências correrão por conta exclusiva do Contratante.

E por estarem justos e contratados, firmam o presente.
[CIDADE/UF], [DATA].`,
    });

    return { success: true, message: "Dados de demonstração gerados com sucesso!" };
  }),
});

export type AppRouter = typeof appRouter;
