CREATE TABLE `activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(50),
	`entityId` int,
	`details` json,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`keyHash` varchar(255) NOT NULL,
	`keyPrefix` varchar(10) NOT NULL,
	`permissions` json,
	`lastUsedAt` timestamp,
	`expiresAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `build_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`priority` int NOT NULL DEFAULT 0,
	`status` enum('queued','processing','completed','failed') NOT NULL DEFAULT 'queued',
	`progress` int NOT NULL DEFAULT 0,
	`currentStep` varchar(255),
	`errorMessage` text,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`estimatedTime` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `build_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pricing_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tier` enum('free','single','multiple','unlimited') NOT NULL,
	`nameEn` varchar(100) NOT NULL,
	`nameHi` varchar(100),
	`descriptionEn` text,
	`descriptionHi` text,
	`priceInr` int NOT NULL DEFAULT 0,
	`priceUsd` int NOT NULL DEFAULT 0,
	`appLimit` int NOT NULL DEFAULT 1,
	`features` json,
	`isPopular` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pricing_plans_id` PRIMARY KEY(`id`),
	CONSTRAINT `pricing_plans_tier_unique` UNIQUE(`tier`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`prompt` text,
	`appType` enum('android','ios','pwa','hybrid','web','desktop') NOT NULL DEFAULT 'hybrid',
	`status` enum('pending','building','completed','failed') NOT NULL DEFAULT 'pending',
	`buildProgress` int NOT NULL DEFAULT 0,
	`templateId` int,
	`appIcon` text,
	`primaryColor` varchar(7) DEFAULT '#6366f1',
	`secondaryColor` varchar(7) DEFAULT '#8b5cf6',
	`features` json,
	`screenshots` json,
	`apkUrl` text,
	`ipaUrl` text,
	`pwaUrl` text,
	`webUrl` text,
	`sourceCodeUrl` text,
	`landingPageEnabled` boolean NOT NULL DEFAULT true,
	`landingPageViews` int NOT NULL DEFAULT 0,
	`downloadCount` int NOT NULL DEFAULT 0,
	`version` varchar(20) DEFAULT '1.0.0',
	`packageName` varchar(255),
	`buildNumber` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`),
	CONSTRAINT `projects_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tier` enum('free','single','multiple','unlimited') NOT NULL DEFAULT 'free',
	`priceInr` int NOT NULL DEFAULT 0,
	`priceUsd` int NOT NULL DEFAULT 0,
	`currency` enum('INR','USD') NOT NULL DEFAULT 'INR',
	`status` enum('active','cancelled','expired','pending') NOT NULL DEFAULT 'pending',
	`paymentMethod` varchar(50),
	`paymentId` varchar(255),
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp,
	`autoRenew` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`category` enum('food_delivery','ecommerce','social_media','booking','fitness','task_manager','chat','lms','crm','news','other') NOT NULL DEFAULT 'other',
	`icon` text,
	`previewImage` text,
	`features` json,
	`defaultPrompt` text,
	`primaryColor` varchar(7) DEFAULT '#6366f1',
	`secondaryColor` varchar(7) DEFAULT '#8b5cf6',
	`usageCount` int NOT NULL DEFAULT 0,
	`isPremium` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `templates_id` PRIMARY KEY(`id`),
	CONSTRAINT `templates_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','superadmin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` text;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionTier` enum('free','single','multiple','unlimited') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `appLimit` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `appsCreated` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;