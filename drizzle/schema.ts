import { boolean, decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Tabela de usuários (advogados, sócios, assistentes e administradores)
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  oabNumber: varchar("oabNumber", { length: 30 }),
  oabUf: varchar("oabUf", { length: 2 }),
  phone: varchar("phone", { length: 30 }),
  avatarUrl: text("avatarUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Clientes do escritório (Pessoas Físicas e Jurídicas)
 */
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Responsável interno
  type: mysqlEnum("type", ["PF", "PJ"]).default("PF").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  cpfCnpj: varchar("cpfCnpj", { length: 30 }),
  rgIe: varchar("rgIe", { length: 30 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  occupation: varchar("occupation", { length: 150 }), // Profissão ou Ramo de Atividade
  maritalStatus: varchar("maritalStatus", { length: 50 }), // Estado civil
  nationality: varchar("nationality", { length: 80 }).default("Brasileiro(a)"),
  addressStreet: varchar("addressStreet", { length: 255 }),
  addressNumber: varchar("addressNumber", { length: 50 }),
  addressComplement: varchar("addressComplement", { length: 100 }),
  addressNeighborhood: varchar("addressNeighborhood", { length: 100 }),
  addressCity: varchar("addressCity", { length: 100 }),
  addressState: varchar("addressState", { length: 2 }),
  addressZipCode: varchar("addressZipCode", { length: 20 }),
  status: mysqlEnum("status", ["ativo", "inativo", "lead", "prospecto"]).default("ativo").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

/**
 * Atendimentos e Consultas Iniciais (Triagem, WhatsApp, Reuniões)
 */
export const consultations = mysqlTable("consultations", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId"),
  userId: int("userId").notNull(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientContact: varchar("clientContact", { length: 100 }),
  channel: mysqlEnum("channel", ["whatsapp", "presencial", "videoconferencia", "telefone", "email", "outro"]).default("whatsapp").notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description"),
  legalArea: varchar("legalArea", { length: 100 }).notNull(), // Trabalhista, Cível, Família, Criminal, Tributário, Previdenciário etc.
  status: mysqlEnum("status", ["agendado", "em_andamento", "concluido", "convertido_em_processo", "cancelado"]).default("agendado").notNull(),
  scheduledAt: timestamp("scheduledAt"),
  feeAmount: decimal("feeAmount", { precision: 12, scale: 2 }).default("0.00"),
  feePaid: boolean("feePaid").default(false).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Consultation = typeof consultations.$inferSelect;
export type InsertConsultation = typeof consultations.$inferInsert;

/**
 * Processos Judiciais e Administrativos
 */
export const lawsuits = mysqlTable("lawsuits", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  responsibleUserId: int("responsibleUserId").notNull(),
  cnjNumber: varchar("cnjNumber", { length: 50 }).notNull(), // Ex: 0001234-56.2026.8.26.0100
  title: varchar("title", { length: 255 }).notNull(),
  area: varchar("area", { length: 100 }).notNull(), // Cível, Trabalhista, Família, etc.
  court: varchar("court", { length: 150 }).notNull(), // Tribunal/Órgão (ex: TJSP, TRT-2, TRF-3, STJ)
  judicialDistrict: varchar("judicialDistrict", { length: 150 }), // Comarca / Foro
  courtDivision: varchar("courtDivision", { length: 150 }), // Vara (ex: 2ª Vara Cível)
  phase: mysqlEnum("phase", ["inicial", "instrucao", "decisao", "recurso", "execucao", "arquivado"]).default("inicial").notNull(),
  roleInLawsuit: mysqlEnum("roleInLawsuit", ["autor", "reu", "terceiro_interessado", "assistente"]).default("autor").notNull(),
  opposingParty: varchar("opposingParty", { length: 255 }), // Parte contrária
  opposingLawyer: varchar("opposingLawyer", { length: 255 }), // Advogado adverso
  estimatedValue: decimal("estimatedValue", { precision: 14, scale: 2 }).default("0.00"), // Valor da causa
  status: mysqlEnum("status", ["ativo", "suspenso", "em_acordo", "ganho", "perdido", "arquivado"]).default("ativo").notNull(),
  distributionDate: timestamp("distributionDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lawsuit = typeof lawsuits.$inferSelect;
export type InsertLawsuit = typeof lawsuits.$inferInsert;

/**
 * Andamentos e Movimentações Processuais
 */
export const lawsuitMovements = mysqlTable("lawsuit_movements", {
  id: int("id").autoincrement().primaryKey(),
  lawsuitId: int("lawsuitId").notNull(),
  movementDate: timestamp("movementDate").defaultNow().notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  isImportant: boolean("isImportant").default(false).notNull(),
  createdByUserId: int("createdByUserId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LawsuitMovement = typeof lawsuitMovements.$inferSelect;
export type InsertLawsuitMovement = typeof lawsuitMovements.$inferInsert;

/**
 * Prazos Processuais e Audiências / Compromissos da Agenda
 */
export const calendarEvents = mysqlTable("calendar_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  lawsuitId: int("lawsuitId"),
  clientId: int("clientId"),
  type: mysqlEnum("type", ["prazo_fatal", "audiencia", "reuniao", "pericia", "diligencia", "outro"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startAt: timestamp("startAt").notNull(),
  endAt: timestamp("endAt"),
  deadlineType: mysqlEnum("deadlineType", ["dias_uteis", "dias_corridos", "horario_especifico"]).default("dias_uteis").notNull(),
  status: mysqlEnum("status", ["pendente", "concluido", "cancelado", "urgente"]).default("pendente").notNull(),
  location: varchar("location", { length: 255 }), // Presencial ou Link da Audiência Virtual (Teams, Zoom, Google Meet)
  isCompleted: boolean("isCompleted").default(false).notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = typeof calendarEvents.$inferInsert;

/**
 * Tarefas Internas e Delegações da Equipe
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  creatorUserId: int("creatorUserId").notNull(),
  assignedUserId: int("assignedUserId").notNull(),
  lawsuitId: int("lawsuitId"),
  clientId: int("clientId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  priority: mysqlEnum("priority", ["baixa", "media", "alta", "urgente"]).default("media").notNull(),
  status: mysqlEnum("status", ["a_fazer", "em_andamento", "revisao", "concluida"]).default("a_fazer").notNull(),
  dueDate: timestamp("dueDate"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * Gestão Financeira (Honorários, Despesas, Custas Processuais e Fluxo de Caixa)
 */
export const financialTransactions = mysqlTable("financial_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  clientId: int("clientId"),
  lawsuitId: int("lawsuitId"),
  type: mysqlEnum("type", ["receita", "despesa"]).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // Honorários Iniciais, Honorários Sucumbenciais, Custas Judiciais, Perícia, Aluguel, Sistema, etc.
  description: varchar("description", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  dueDate: timestamp("dueDate").notNull(),
  paymentDate: timestamp("paymentDate"),
  status: mysqlEnum("status", ["pendente", "pago", "atrasado", "cancelado"]).default("pendente").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["pix", "boleto", "cartao", "transferencia", "dinheiro"]).default("pix").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type InsertFinancialTransaction = typeof financialTransactions.$inferInsert;

/**
 * Documentos, Peças Jurídicas, Contratos e Procurações
 */
export const legalDocuments = mysqlTable("legal_documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  clientId: int("clientId"),
  lawsuitId: int("lawsuitId"),
  title: varchar("title", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["peticao_inicial", "contestacao", "recurso", "procuracao", "contrato_honorarios", "declaracao_hipossuficiencia", "termo_acordo", "notificacao_extrajudicial", "documento_cliente", "outro"]).notNull(),
  fileUrl: text("fileUrl"), // URL segura S3 se houver upload
  fileKey: varchar("fileKey", { length: 255 }),
  content: text("content"), // Conteúdo formatado ou minuta
  isTemplate: boolean("isTemplate").default(false).notNull(), // Modelo reutilizável
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LegalDocument = typeof legalDocuments.$inferSelect;
export type InsertLegalDocument = typeof legalDocuments.$inferInsert;
