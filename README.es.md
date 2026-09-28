# JurisFlow

**🇧🇷 [Português](README.md) · 🇺🇸 [English](README.en.md) · 🇪🇸 [Español](README.es.md)**

[![JurisFlow](guia/assets/banner.jpg)](https://inematds.github.io/jurisflow/guia/es/)

## 📖 Guía de uso

Guía completa (landing + paso a paso): **https://inematds.github.io/jurisflow/guia/es/**

Sistema de gestión para bufetes de abogados: ERP/CRM jurídico con asistente de IA.

## Módulos

| Módulo | Qué hace |
| --- | --- |
| Panel general | Indicadores de clientes, procesos activos, plazos, audiencias, ingresos, gastos y saldo |
| Clientes | Registro de personas físicas/jurídicas, CPF/CNPJ, contactos, dirección, profesión, estado civil, observaciones y estado |
| Procesos | Número CNJ, tribunal, juzgado, jurisdicción, área jurídica, fase, parte contraria, valor de la demanda y estado |
| Movimientos | Movimientos dentro de los procesos, con marca de movimientos importantes |
| Consultas | Evaluación inicial de nuevos clientes por WhatsApp, presencial, video, teléfono y correo electrónico |
| Agenda y plazos | Plazos fatales, audiencias, reuniones, peritajes y diligencias |
| Tareas | Gestión interna: prioridad, responsable, plazo y estado |
| Finanzas | Ingresos, gastos, honorarios, costas, vencimientos, pagos y flujo financiero |
| Documentos | Modelos jurídicos: escritos, poderes, contratos, notificaciones |
| Asistente Jurídico IA | Generación y análisis de contenido jurídico mediante LLM |

Fases del proceso: **Inicial → Instrucción → Decisión → Recurso → Ejecución → Archivado**
Estado: **Activo / Suspendido / En acuerdo / Ganado / Perdido / Archivado**

## Asistente Jurídico IA

Trabaja con el Derecho brasileño (CPC, CPP, CLT, Constitución Federal, Código Civil, CDC, STF, STJ, TST) y cubre seis operaciones: borrador de escrito, análisis de jurisprudencia, cálculo de plazos, resumen de movimientos, notificación extrajudicial y contrato de honorarios.

> ⚠️ Actualmente, no hay una fuente jurídica de verificación conectada al modelo. **Es necesario verificar** toda cita de leyes o jurisprudencia generada por la IA antes de usarla.

## Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind, Radix UI, Lucide, TanStack Query, tRPC
- **Backend:** Node.js, Express, tRPC, Zod
- **Base de datos:** MySQL + Drizzle ORM
- **Archivos:** estructura preparada para S3
- **Autenticación:** OAuth + JWT

Tablas: `users`, `clients`, `consultations`, `lawsuits`, `lawsuit_movements`, `calendar_events`, `tasks`, `financial_transactions`, `legal_documents`.

## Ejecución local

```bash
pnpm install
cp .env.example .env     # completa DATABASE_URL, JWT_SECRET y las claves del LLM
pnpm db:push             # genera y aplica las migraciones
pnpm dev                 # http://localhost:3000
```

Otros scripts: `pnpm build`, `pnpm start`, `pnpm check` (verificación de tipos), `pnpm test` (vitest), `pnpm format`.

## Modo de demostración

El botón **"Generar Datos de Ejemplo"** del menú carga el sistema con clientes, procesos, audiencias, tareas, transacciones financieras y documentos: útil para una demostración comercial sin registrar nada manualmente.

## Estado actual

MVP funcional. Aún **no** están implementados: integración con tribunales, captura automática de movimientos CNJ, publicaciones del Diario Oficial, jurisprudencia en tiempo real, RAG con documentos del bufete, firma digital, exportación DOCX/PDF, integraciones con WhatsApp/Gmail/Google Calendar, OCR, permisos avanzados para equipos, auditoría detallada, múltiples bufetes, cobros por PIX/boleto y automatización de plazos.

## Licencia

MIT
