import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  calendarEvents,
  clients,
  consultations,
  financialTransactions,
  InsertCalendarEvent,
  InsertClient,
  InsertConsultation,
  InsertFinancialTransaction,
  InsertLawsuit,
  InsertLawsuitMovement,
  InsertLegalDocument,
  InsertTask,
  InsertUser,
  lawsuitMovements,
  lawsuits,
  legalDocuments,
  tasks,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Falha ao conectar:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "oabNumber", "oabUf", "phone", "avatarUrl"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized as any;
      updateSet[field] = normalized as any;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(users.name);
}

// ========================
// CLIENTES
// ========================
export async function getClients(query?: string) {
  const db = await getDb();
  if (!db) return [];
  if (query && query.trim() !== "") {
    const q = `%${query.trim()}%`;
    return db
      .select()
      .from(clients)
      .where(or(like(clients.name, q), like(clients.cpfCnpj, q), like(clients.email, q), like(clients.phone, q)))
      .orderBy(desc(clients.createdAt));
  }
  return db.select().from(clients).orderBy(desc(clients.createdAt));
}

export async function getClientById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const res = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return res[0] ?? undefined;
}

export async function createClient(data: InsertClient) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const res = await db.insert(clients).values(data);
  return { id: res[0].insertId };
}

export async function updateClient(id: number, data: Partial<InsertClient>) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.update(clients).set(data).where(eq(clients.id, id));
  return getClientById(id);
}

export async function deleteClient(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.delete(clients).where(eq(clients.id, id));
  return { success: true };
}

// ========================
// PROCESSOS JUDICIAIS
// ========================
export async function getLawsuits(filter?: { clientId?: number; search?: string; status?: string; phase?: string }) {
  const db = await getDb();
  if (!db) return [];

  let conditions: any[] = [];
  if (filter?.clientId) conditions.push(eq(lawsuits.clientId, filter.clientId));
  if (filter?.status && filter.status !== "todos") conditions.push(eq(lawsuits.status, filter.status as any));
  if (filter?.phase && filter.phase !== "todas") conditions.push(eq(lawsuits.phase, filter.phase as any));
  if (filter?.search && filter.search.trim()) {
    const q = `%${filter.search.trim()}%`;
    conditions.push(or(like(lawsuits.cnjNumber, q), like(lawsuits.title, q), like(lawsuits.opposingParty, q), like(lawsuits.court, q)));
  }

  const query = db
    .select({
      lawsuit: lawsuits,
      clientName: clients.name,
      clientCpfCnpj: clients.cpfCnpj,
    })
    .from(lawsuits)
    .leftJoin(clients, eq(lawsuits.clientId, clients.id));

  if (conditions.length > 0) {
    return query.where(and(...conditions)).orderBy(desc(lawsuits.createdAt));
  }
  return query.orderBy(desc(lawsuits.createdAt));
}

export async function getLawsuitById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const res = await db
    .select({
      lawsuit: lawsuits,
      client: clients,
    })
    .from(lawsuits)
    .leftJoin(clients, eq(lawsuits.clientId, clients.id))
    .where(eq(lawsuits.id, id))
    .limit(1);

  if (!res[0]) return undefined;

  const movements = await db
    .select()
    .from(lawsuitMovements)
    .where(eq(lawsuitMovements.lawsuitId, id))
    .orderBy(desc(lawsuitMovements.movementDate));

  const events = await db
    .select()
    .from(calendarEvents)
    .where(eq(calendarEvents.lawsuitId, id))
    .orderBy(calendarEvents.startAt);

  const docs = await db
    .select()
    .from(legalDocuments)
    .where(eq(legalDocuments.lawsuitId, id))
    .orderBy(desc(legalDocuments.createdAt));

  return {
    ...res[0].lawsuit,
    client: res[0].client,
    movements,
    events,
    documents: docs,
  };
}

export async function createLawsuit(data: InsertLawsuit) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const res = await db.insert(lawsuits).values(data);
  return { id: res[0].insertId };
}

export async function updateLawsuit(id: number, data: Partial<InsertLawsuit>) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.update(lawsuits).set(data).where(eq(lawsuits.id, id));
  return getLawsuitById(id);
}

export async function deleteLawsuit(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.delete(lawsuitMovements).where(eq(lawsuitMovements.lawsuitId, id));
  await db.delete(lawsuits).where(eq(lawsuits.id, id));
  return { success: true };
}

export async function addLawsuitMovement(data: InsertLawsuitMovement) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const res = await db.insert(lawsuitMovements).values(data);
  return { id: res[0].insertId };
}

// ========================
// ATENDIMENTOS E CONSULTAS
// ========================
export async function getConsultations(status?: string) {
  const db = await getDb();
  if (!db) return [];
  const query = db
    .select({
      consultation: consultations,
      clientName: clients.name,
    })
    .from(consultations)
    .leftJoin(clients, eq(consultations.clientId, clients.id));

  if (status && status !== "todos") {
    return query.where(eq(consultations.status, status as any)).orderBy(desc(consultations.scheduledAt));
  }
  return query.orderBy(desc(consultations.scheduledAt));
}

export async function createConsultation(data: InsertConsultation) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const res = await db.insert(consultations).values(data);
  return { id: res[0].insertId };
}

export async function updateConsultation(id: number, data: Partial<InsertConsultation>) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.update(consultations).set(data).where(eq(consultations.id, id));
  return { success: true };
}

// ========================
// AGENDA E PRAZOS
// ========================
export async function getCalendarEvents(filter?: { type?: string; completed?: boolean; upcomingOnly?: boolean }) {
  const db = await getDb();
  if (!db) return [];

  let conditions: any[] = [];
  if (filter?.type && filter.type !== "todos") conditions.push(eq(calendarEvents.type, filter.type as any));
  if (filter?.completed !== undefined) conditions.push(eq(calendarEvents.isCompleted, filter.completed));

  const query = db
    .select({
      event: calendarEvents,
      lawsuitCnj: lawsuits.cnjNumber,
      lawsuitTitle: lawsuits.title,
      clientName: clients.name,
    })
    .from(calendarEvents)
    .leftJoin(lawsuits, eq(calendarEvents.lawsuitId, lawsuits.id))
    .leftJoin(clients, eq(calendarEvents.clientId, clients.id));

  if (conditions.length > 0) {
    return query.where(and(...conditions)).orderBy(calendarEvents.startAt);
  }
  return query.orderBy(calendarEvents.startAt);
}

export async function createCalendarEvent(data: InsertCalendarEvent) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const res = await db.insert(calendarEvents).values(data);
  return { id: res[0].insertId };
}

export async function updateCalendarEvent(id: number, data: Partial<InsertCalendarEvent>) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.update(calendarEvents).set(data).where(eq(calendarEvents.id, id));
  return { success: true };
}

export async function deleteCalendarEvent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
  return { success: true };
}

// ========================
// TAREFAS
// ========================
export async function getTasks(filter?: { status?: string; priority?: string }) {
  const db = await getDb();
  if (!db) return [];

  let conditions: any[] = [];
  if (filter?.status && filter.status !== "todos") conditions.push(eq(tasks.status, filter.status as any));
  if (filter?.priority && filter.priority !== "todas") conditions.push(eq(tasks.priority, filter.priority as any));

  const query = db
    .select({
      task: tasks,
      lawsuitCnj: lawsuits.cnjNumber,
      clientName: clients.name,
    })
    .from(tasks)
    .leftJoin(lawsuits, eq(tasks.lawsuitId, lawsuits.id))
    .leftJoin(clients, eq(tasks.clientId, clients.id));

  if (conditions.length > 0) {
    return query.where(and(...conditions)).orderBy(desc(tasks.dueDate));
  }
  return query.orderBy(desc(tasks.dueDate));
}

export async function createTask(data: InsertTask) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const res = await db.insert(tasks).values(data);
  return { id: res[0].insertId };
}

export async function updateTask(id: number, data: Partial<InsertTask>) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.update(tasks).set(data).where(eq(tasks.id, id));
  return { success: true };
}

export async function deleteTask(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.delete(tasks).where(eq(tasks.id, id));
  return { success: true };
}

// ========================
// FINANCEIRO
// ========================
export async function getFinancialTransactions(filter?: { type?: string; status?: string }) {
  const db = await getDb();
  if (!db) return [];

  let conditions: any[] = [];
  if (filter?.type && filter.type !== "todos") conditions.push(eq(financialTransactions.type, filter.type as any));
  if (filter?.status && filter.status !== "todos") conditions.push(eq(financialTransactions.status, filter.status as any));

  const query = db
    .select({
      transaction: financialTransactions,
      clientName: clients.name,
      lawsuitCnj: lawsuits.cnjNumber,
    })
    .from(financialTransactions)
    .leftJoin(clients, eq(financialTransactions.clientId, clients.id))
    .leftJoin(lawsuits, eq(financialTransactions.lawsuitId, lawsuits.id));

  if (conditions.length > 0) {
    return query.where(and(...conditions)).orderBy(desc(financialTransactions.dueDate));
  }
  return query.orderBy(desc(financialTransactions.dueDate));
}

export async function createFinancialTransaction(data: InsertFinancialTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const res = await db.insert(financialTransactions).values(data);
  return { id: res[0].insertId };
}

export async function updateFinancialTransaction(id: number, data: Partial<InsertFinancialTransaction>) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.update(financialTransactions).set(data).where(eq(financialTransactions.id, id));
  return { success: true };
}

export async function deleteFinancialTransaction(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.delete(financialTransactions).where(eq(financialTransactions.id, id));
  return { success: true };
}

// ========================
// DOCUMENTOS E MODELOS
// ========================
export async function getLegalDocuments(filter?: { isTemplate?: boolean; category?: string; clientId?: number; lawsuitId?: number }) {
  const db = await getDb();
  if (!db) return [];

  let conditions: any[] = [];
  if (filter?.isTemplate !== undefined) conditions.push(eq(legalDocuments.isTemplate, filter.isTemplate));
  if (filter?.category && filter.category !== "todas") conditions.push(eq(legalDocuments.category, filter.category as any));
  if (filter?.clientId) conditions.push(eq(legalDocuments.clientId, filter.clientId));
  if (filter?.lawsuitId) conditions.push(eq(legalDocuments.lawsuitId, filter.lawsuitId));

  const query = db
    .select({
      document: legalDocuments,
      clientName: clients.name,
      lawsuitCnj: lawsuits.cnjNumber,
    })
    .from(legalDocuments)
    .leftJoin(clients, eq(legalDocuments.clientId, clients.id))
    .leftJoin(lawsuits, eq(legalDocuments.lawsuitId, lawsuits.id));

  if (conditions.length > 0) {
    return query.where(and(...conditions)).orderBy(desc(legalDocuments.createdAt));
  }
  return query.orderBy(desc(legalDocuments.createdAt));
}

export async function createLegalDocument(data: InsertLegalDocument) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const res = await db.insert(legalDocuments).values(data);
  return { id: res[0].insertId };
}

export async function updateLegalDocument(id: number, data: Partial<InsertLegalDocument>) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.update(legalDocuments).set(data).where(eq(legalDocuments.id, id));
  return { success: true };
}

export async function deleteLegalDocument(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.delete(legalDocuments).where(eq(legalDocuments.id, id));
  return { success: true };
}

// ========================
// MÉTRICAS GERAIS (DASHBOARD)
// ========================
export async function getDashboardMetrics() {
  const db = await getDb();
  if (!db) {
    return {
      totalClients: 0,
      activeLawsuits: 0,
      pendingDeadlines: 0,
      upcomingHearings: 0,
      revenueThisMonth: 0,
      expensesThisMonth: 0,
      balanceThisMonth: 0,
    };
  }

  const [clientsCount] = await db.select({ count: sql<number>`count(*)` }).from(clients);
  const [lawsuitsCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(lawsuits)
    .where(eq(lawsuits.status, "ativo"));

  const [deadlinesCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(calendarEvents)
    .where(and(eq(calendarEvents.isCompleted, false), eq(calendarEvents.type, "prazo_fatal")));

  const [hearingsCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(calendarEvents)
    .where(and(eq(calendarEvents.isCompleted, false), eq(calendarEvents.type, "audiencia")));

  const transactions = await db.select().from(financialTransactions);
  let revenue = 0;
  let expense = 0;

  for (const t of transactions) {
    const val = Number(t.amount || 0);
    if (t.type === "receita" && t.status === "pago") {
      revenue += val;
    } else if (t.type === "despesa" && t.status === "pago") {
      expense += val;
    }
  }

  return {
    totalClients: Number(clientsCount?.count || 0),
    activeLawsuits: Number(lawsuitsCount?.count || 0),
    pendingDeadlines: Number(deadlinesCount?.count || 0),
    upcomingHearings: Number(hearingsCount?.count || 0),
    revenueThisMonth: revenue,
    expensesThisMonth: expense,
    balanceThisMonth: revenue - expense,
  };
}
