CREATE TABLE `zalo_webhooks` (
	`project_id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`callback_url` text NOT NULL,
	`secret_ciphertext` text NOT NULL,
	`secret_iv` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `zalo_webhooks_session_unique` ON `zalo_webhooks` (`session_id`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`number` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`subtotal` integer DEFAULT 0 NOT NULL,
	`tax` integer DEFAULT 0 NOT NULL,
	`total` integer DEFAULT 0 NOT NULL,
	`issued_at` integer,
	`due_at` integer,
	`paid_at` integer,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_invoices`("id", "organization_id", "number", "status", "currency", "subtotal", "tax", "total", "issued_at", "due_at", "paid_at", "notes", "created_at", "updated_at") SELECT "id", "organization_id", "number", "status", "currency", "subtotal", "tax", "total", "issued_at", "due_at", "paid_at", "notes", "created_at", "updated_at" FROM `invoices`;--> statement-breakpoint
DROP TABLE `invoices`;--> statement-breakpoint
ALTER TABLE `__new_invoices` RENAME TO `invoices`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `invoices_number_unique` ON `invoices` (`number`);--> statement-breakpoint
CREATE INDEX `invoices_org_idx` ON `invoices` (`organization_id`);--> statement-breakpoint
CREATE INDEX `invoices_status_idx` ON `invoices` (`status`);--> statement-breakpoint
CREATE TABLE `__new_notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`sender_name` text NOT NULL,
	`body` text NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`dedupe_key` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_notifications`("id", "organization_id", "user_id", "sender_name", "body", "is_read", "dedupe_key", "created_at") SELECT "id", "organization_id", "user_id", "sender_name", "body", "is_read", "dedupe_key", "created_at" FROM `notifications`;--> statement-breakpoint
DROP TABLE `notifications`;--> statement-breakpoint
ALTER TABLE `__new_notifications` RENAME TO `notifications`;--> statement-breakpoint
CREATE INDEX `notifications_user_org_idx` ON `notifications` (`user_id`,`organization_id`);--> statement-breakpoint
CREATE INDEX `notifications_created_idx` ON `notifications` (`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `notifications_dedupe_idx` ON `notifications` (`user_id`,`organization_id`,`dedupe_key`);--> statement-breakpoint
CREATE TABLE `__new_organization_billing_settings` (
	`organization_id` text PRIMARY KEY NOT NULL,
	`company_name` text,
	`tax_id` text,
	`address` text,
	`city` text,
	`country` text DEFAULT 'US',
	`currency` text DEFAULT 'USD' NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_organization_billing_settings`("organization_id", "company_name", "tax_id", "address", "city", "country", "currency", "updated_at") SELECT "organization_id", "company_name", "tax_id", "address", "city", "country", "currency", "updated_at" FROM `organization_billing_settings`;--> statement-breakpoint
DROP TABLE `organization_billing_settings`;--> statement-breakpoint
ALTER TABLE `__new_organization_billing_settings` RENAME TO `organization_billing_settings`;--> statement-breakpoint
CREATE TABLE `__new_organization_credits` (
	`organization_id` text PRIMARY KEY NOT NULL,
	`balance` integer DEFAULT 0 NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_organization_credits`("organization_id", "balance", "updated_at") SELECT "organization_id", "balance", "updated_at" FROM `organization_credits`;--> statement-breakpoint
DROP TABLE `organization_credits`;--> statement-breakpoint
ALTER TABLE `__new_organization_credits` RENAME TO `organization_credits`;--> statement-breakpoint
CREATE TABLE `__new_project_members` (
	`project_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`added_at` integer NOT NULL,
	PRIMARY KEY(`project_id`, `user_id`),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_project_members`("project_id", "user_id", "role", "added_at") SELECT "project_id", "user_id", "role", "added_at" FROM `project_members`;--> statement-breakpoint
DROP TABLE `project_members`;--> statement-breakpoint
ALTER TABLE `__new_project_members` RENAME TO `project_members`;--> statement-breakpoint
CREATE INDEX `project_members_user_idx` ON `project_members` (`user_id`);--> statement-breakpoint
CREATE TABLE `__new_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_projects`("id", "organization_id", "name", "description", "status", "created_by", "created_at", "updated_at") SELECT "id", "organization_id", "name", "description", "status", "created_by", "created_at", "updated_at" FROM `projects`;--> statement-breakpoint
DROP TABLE `projects`;--> statement-breakpoint
ALTER TABLE `__new_projects` RENAME TO `projects`;--> statement-breakpoint
CREATE INDEX `projects_org_idx` ON `projects` (`organization_id`);--> statement-breakpoint
CREATE INDEX `projects_status_idx` ON `projects` (`status`);--> statement-breakpoint
CREATE TABLE `__new_referrals` (
	`id` text PRIMARY KEY NOT NULL,
	`referrer_id` text NOT NULL,
	`referee_id` text NOT NULL,
	`source` text DEFAULT 'link' NOT NULL,
	`reward_paid` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_referrals`("id", "referrer_id", "referee_id", "source", "reward_paid", "created_at") SELECT "id", "referrer_id", "referee_id", "source", "reward_paid", "created_at" FROM `referrals`;--> statement-breakpoint
DROP TABLE `referrals`;--> statement-breakpoint
ALTER TABLE `__new_referrals` RENAME TO `referrals`;--> statement-breakpoint
CREATE UNIQUE INDEX `referrals_referee_unique` ON `referrals` (`referee_id`);--> statement-breakpoint
CREATE INDEX `referrals_referrer_idx` ON `referrals` (`referrer_id`);--> statement-breakpoint
CREATE TABLE `__new_selfhost_audit` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`actor_user_id` text,
	`action` text NOT NULL,
	`success` integer NOT NULL,
	`cf_account_id` text,
	`error_message` text,
	`started_at` integer NOT NULL,
	`finished_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_selfhost_audit`("id", "organization_id", "actor_user_id", "action", "success", "cf_account_id", "error_message", "started_at", "finished_at") SELECT "id", "organization_id", "actor_user_id", "action", "success", "cf_account_id", "error_message", "started_at", "finished_at" FROM `selfhost_audit`;--> statement-breakpoint
DROP TABLE `selfhost_audit`;--> statement-breakpoint
ALTER TABLE `__new_selfhost_audit` RENAME TO `selfhost_audit`;--> statement-breakpoint
CREATE INDEX `selfhost_audit_org_idx` ON `selfhost_audit` (`organization_id`);--> statement-breakpoint
CREATE INDEX `selfhost_audit_started_idx` ON `selfhost_audit` (`started_at`);--> statement-breakpoint
CREATE TABLE `__new_selfhost_deployment_secrets` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`key` text NOT NULL,
	`ciphertext` text NOT NULL,
	`iv` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_selfhost_deployment_secrets`("id", "organization_id", "key", "ciphertext", "iv", "created_at", "updated_at") SELECT "id", "organization_id", "key", "ciphertext", "iv", "created_at", "updated_at" FROM `selfhost_deployment_secrets`;--> statement-breakpoint
DROP TABLE `selfhost_deployment_secrets`;--> statement-breakpoint
ALTER TABLE `__new_selfhost_deployment_secrets` RENAME TO `selfhost_deployment_secrets`;--> statement-breakpoint
CREATE UNIQUE INDEX `selfhost_secrets_org_key_unique` ON `selfhost_deployment_secrets` (`organization_id`,`key`);--> statement-breakpoint
CREATE TABLE `__new_selfhost_deployments` (
	`organization_id` text PRIMARY KEY NOT NULL,
	`cf_account_id` text,
	`cf_script_name` text,
	`workers_dev_url` text,
	`deployed_version` text,
	`deployed_at` integer,
	`cf_token_ciphertext` text,
	`cf_token_iv` text,
	`cf_token_expires_at` integer,
	`status` text DEFAULT 'idle' NOT NULL,
	`last_error` text
);
--> statement-breakpoint
INSERT INTO `__new_selfhost_deployments`("organization_id", "cf_account_id", "cf_script_name", "workers_dev_url", "deployed_version", "deployed_at", "cf_token_ciphertext", "cf_token_iv", "cf_token_expires_at", "status", "last_error") SELECT "organization_id", "cf_account_id", "cf_script_name", "workers_dev_url", "deployed_version", "deployed_at", "cf_token_ciphertext", "cf_token_iv", "cf_token_expires_at", "status", "last_error" FROM `selfhost_deployments`;--> statement-breakpoint
DROP TABLE `selfhost_deployments`;--> statement-breakpoint
ALTER TABLE `__new_selfhost_deployments` RENAME TO `selfhost_deployments`;--> statement-breakpoint
CREATE TABLE `__new_support_ticket_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`ticket_id` text NOT NULL,
	`author_id` text,
	`author_role` text NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_support_ticket_messages`("id", "ticket_id", "author_id", "author_role", "body", "created_at") SELECT "id", "ticket_id", "author_id", "author_role", "body", "created_at" FROM `support_ticket_messages`;--> statement-breakpoint
DROP TABLE `support_ticket_messages`;--> statement-breakpoint
ALTER TABLE `__new_support_ticket_messages` RENAME TO `support_ticket_messages`;--> statement-breakpoint
CREATE INDEX `support_ticket_messages_ticket_idx` ON `support_ticket_messages` (`ticket_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `__new_support_tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`kind` text NOT NULL,
	`category` text,
	`subject` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`assigned_to` text,
	`last_message_at` integer NOT NULL,
	`last_message_role` text DEFAULT 'user' NOT NULL,
	`reminder_sent_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_support_tickets`("id", "user_id", "organization_id", "kind", "category", "subject", "status", "assigned_to", "last_message_at", "last_message_role", "reminder_sent_at", "created_at", "updated_at") SELECT "id", "user_id", "organization_id", "kind", "category", "subject", "status", "assigned_to", "last_message_at", "last_message_role", "reminder_sent_at", "created_at", "updated_at" FROM `support_tickets`;--> statement-breakpoint
DROP TABLE `support_tickets`;--> statement-breakpoint
ALTER TABLE `__new_support_tickets` RENAME TO `support_tickets`;--> statement-breakpoint
CREATE INDEX `support_tickets_user_idx` ON `support_tickets` (`user_id`);--> statement-breakpoint
CREATE INDEX `support_tickets_status_idx` ON `support_tickets` (`status`);--> statement-breakpoint
CREATE INDEX `support_tickets_assigned_idx` ON `support_tickets` (`assigned_to`);--> statement-breakpoint
CREATE INDEX `support_tickets_reminder_idx` ON `support_tickets` (`last_message_role`,`last_message_at`);--> statement-breakpoint
CREATE TABLE `__new_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text,
	`type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`amount` integer NOT NULL,
	`gateway_ref` text,
	`sepay_event_id` text,
	`metadata` text DEFAULT '{}',
	`expires_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_transactions`("id", "organization_id", "user_id", "type", "status", "amount", "gateway_ref", "sepay_event_id", "metadata", "expires_at", "created_at", "updated_at") SELECT "id", "organization_id", "user_id", "type", "status", "amount", "gateway_ref", "sepay_event_id", "metadata", "expires_at", "created_at", "updated_at" FROM `transactions`;--> statement-breakpoint
DROP TABLE `transactions`;--> statement-breakpoint
ALTER TABLE `__new_transactions` RENAME TO `transactions`;--> statement-breakpoint
CREATE UNIQUE INDEX `transactions_gateway_ref_unique` ON `transactions` (`gateway_ref`);--> statement-breakpoint
CREATE UNIQUE INDEX `transactions_sepay_event_id_unique` ON `transactions` (`sepay_event_id`);--> statement-breakpoint
CREATE INDEX `transactions_org_idx` ON `transactions` (`organization_id`);--> statement-breakpoint
CREATE INDEX `transactions_status_idx` ON `transactions` (`status`);--> statement-breakpoint
CREATE TABLE `__new_user_referrals` (
	`user_id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_user_referrals`("user_id", "code", "created_at") SELECT "user_id", "code", "created_at" FROM `user_referrals`;--> statement-breakpoint
DROP TABLE `user_referrals`;--> statement-breakpoint
ALTER TABLE `__new_user_referrals` RENAME TO `user_referrals`;--> statement-breakpoint
CREATE UNIQUE INDEX `user_referrals_code_unique` ON `user_referrals` (`code`);