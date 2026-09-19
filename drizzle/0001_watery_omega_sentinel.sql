CREATE TABLE `calendar_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`lawsuitId` int,
	`clientId` int,
	`type` enum('prazo_fatal','audiencia','reuniao','pericia','diligencia','outro') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`startAt` timestamp NOT NULL,
	`endAt` timestamp,
	`deadlineType` enum('dias_uteis','dias_corridos','horario_especifico') NOT NULL DEFAULT 'dias_uteis',
	`status` enum('pendente','concluido','cancelado','urgente') NOT NULL DEFAULT 'pendente',
	`location` varchar(255),
	`isCompleted` boolean NOT NULL DEFAULT false,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `calendar_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('PF','PJ') NOT NULL DEFAULT 'PF',
	`name` varchar(255) NOT NULL,
	`cpfCnpj` varchar(30),
	`rgIe` varchar(30),
	`email` varchar(255),
	`phone` varchar(50),
	`whatsapp` varchar(50),
	`occupation` varchar(150),
	`maritalStatus` varchar(50),
	`nationality` varchar(80) DEFAULT 'Brasileiro(a)',
	`addressStreet` varchar(255),
	`addressNumber` varchar(50),
	`addressComplement` varchar(100),
	`addressNeighborhood` varchar(100),
	`addressCity` varchar(100),
	`addressState` varchar(2),
	`addressZipCode` varchar(20),
	`status` enum('ativo','inativo','lead','prospecto') NOT NULL DEFAULT 'ativo',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consultations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int,
	`userId` int NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`clientContact` varchar(100),
	`channel` enum('whatsapp','presencial','videoconferencia','telefone','email','outro') NOT NULL DEFAULT 'whatsapp',
	`subject` varchar(255) NOT NULL,
	`description` text,
	`legalArea` varchar(100) NOT NULL,
	`status` enum('agendado','em_andamento','concluido','convertido_em_processo','cancelado') NOT NULL DEFAULT 'agendado',
	`scheduledAt` timestamp,
	`feeAmount` decimal(12,2) DEFAULT '0.00',
	`feePaid` boolean NOT NULL DEFAULT false,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `consultations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financial_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clientId` int,
	`lawsuitId` int,
	`type` enum('receita','despesa') NOT NULL,
	`category` varchar(100) NOT NULL,
	`description` varchar(255) NOT NULL,
	`amount` decimal(14,2) NOT NULL,
	`dueDate` timestamp NOT NULL,
	`paymentDate` timestamp,
	`status` enum('pendente','pago','atrasado','cancelado') NOT NULL DEFAULT 'pendente',
	`paymentMethod` enum('pix','boleto','cartao','transferencia','dinheiro') NOT NULL DEFAULT 'pix',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financial_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lawsuit_movements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lawsuitId` int NOT NULL,
	`movementDate` timestamp NOT NULL DEFAULT (now()),
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`isImportant` boolean NOT NULL DEFAULT false,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lawsuit_movements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lawsuits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`responsibleUserId` int NOT NULL,
	`cnjNumber` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`area` varchar(100) NOT NULL,
	`court` varchar(150) NOT NULL,
	`judicialDistrict` varchar(150),
	`courtDivision` varchar(150),
	`phase` enum('inicial','instrucao','decisao','recurso','execucao','arquivado') NOT NULL DEFAULT 'inicial',
	`roleInLawsuit` enum('autor','reu','terceiro_interessado','assistente') NOT NULL DEFAULT 'autor',
	`opposingParty` varchar(255),
	`opposingLawyer` varchar(255),
	`estimatedValue` decimal(14,2) DEFAULT '0.00',
	`status` enum('ativo','suspenso','em_acordo','ganho','perdido','arquivado') NOT NULL DEFAULT 'ativo',
	`distributionDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lawsuits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `legal_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clientId` int,
	`lawsuitId` int,
	`title` varchar(255) NOT NULL,
	`category` enum('peticao_inicial','contestacao','recurso','procuracao','contrato_honorarios','declaracao_hipossuficiencia','termo_acordo','notificacao_extrajudicial','documento_cliente','outro') NOT NULL,
	`fileUrl` text,
	`fileKey` varchar(255),
	`content` text,
	`isTemplate` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `legal_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`creatorUserId` int NOT NULL,
	`assignedUserId` int NOT NULL,
	`lawsuitId` int,
	`clientId` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`priority` enum('baixa','media','alta','urgente') NOT NULL DEFAULT 'media',
	`status` enum('a_fazer','em_andamento','revisao','concluida') NOT NULL DEFAULT 'a_fazer',
	`dueDate` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `oabNumber` varchar(30);--> statement-breakpoint
ALTER TABLE `users` ADD `oabUf` varchar(2);--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(30);--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;