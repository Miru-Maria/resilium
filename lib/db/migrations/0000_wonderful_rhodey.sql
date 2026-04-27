CREATE TABLE "assessment_drafts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"session_id" text,
	"draft_data" jsonb NOT NULL,
	"current_step" integer DEFAULT 1 NOT NULL,
	"current_mr_step" integer DEFAULT 0 NOT NULL,
	"language" text DEFAULT 'en',
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checklist_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" text NOT NULL,
	"area" text NOT NULL,
	"item_id" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "progress_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"report_id" text NOT NULL,
	"snapshot_at" timestamp DEFAULT now() NOT NULL,
	"score_overall" real NOT NULL,
	"score_financial" real NOT NULL,
	"score_health" real NOT NULL,
	"score_skills" real NOT NULL,
	"score_mobility" real NOT NULL,
	"score_psychological" real NOT NULL,
	"score_resources" real NOT NULL,
	"mr_composite" real
);
--> statement-breakpoint
CREATE TABLE "resilience_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" text NOT NULL,
	"session_id" text,
	"user_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"age_bracket" text,
	"location" text NOT NULL,
	"location_country" text,
	"income_stability" text NOT NULL,
	"savings_months" real NOT NULL,
	"dependent_count" integer DEFAULT 0 NOT NULL,
	"relocation_readiness" text,
	"skills" jsonb NOT NULL,
	"health_status" text NOT NULL,
	"mobility_level" text NOT NULL,
	"housing_type" text NOT NULL,
	"has_emergency_supplies" boolean NOT NULL,
	"psychological_resilience" real NOT NULL,
	"risk_concerns" jsonb NOT NULL,
	"mr_stress_tolerance" real,
	"mr_adaptability" real,
	"mr_learning_agility" real,
	"mr_change_management" real,
	"mr_emotional_regulation" real,
	"mr_social_support" real,
	"mr_composite" real,
	"mr_pathway" text,
	"score_overall" real NOT NULL,
	"score_financial" real NOT NULL,
	"score_health" real NOT NULL,
	"score_skills" real NOT NULL,
	"score_mobility" real NOT NULL,
	"score_psychological" real NOT NULL,
	"score_resources" real NOT NULL,
	"score_social_capital" real,
	"risk_profile_summary" text NOT NULL,
	"top_vulnerabilities" jsonb NOT NULL,
	"action_plan" jsonb NOT NULL,
	"scenario_simulations" jsonb NOT NULL,
	"daily_habits" jsonb NOT NULL,
	"checklists_by_area" jsonb,
	"recommended_resources" jsonb,
	"primary_goal" text,
	"success_vision" text,
	"emergency_supply_tier" text,
	"household_mode" text,
	"household_composition" jsonb,
	CONSTRAINT "resilience_reports_report_id_unique" UNIQUE("report_id")
);
--> statement-breakpoint
CREATE TABLE "ux_test_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"run_id" text NOT NULL,
	"persona_key" text NOT NULL,
	"persona_name" text NOT NULL,
	"assessment_data" jsonb NOT NULL,
	"report_id" text,
	"scores" jsonb,
	"ai_quality_rating" integer,
	"ai_quality_notes" text,
	"observations" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"error" text,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ux_test_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"run_id" text NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"persona_count" integer NOT NULL,
	"status" text DEFAULT 'running' NOT NULL,
	"cross_persona_summary" text,
	CONSTRAINT "ux_test_runs_run_id_unique" UNIQUE("run_id")
);
--> statement-breakpoint
CREATE TABLE "admin_config" (
	"key" varchar PRIMARY KEY NOT NULL,
	"value" varchar(1024) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"push_token" varchar,
	"push_token_platform" varchar,
	"push_token_updated_at" timestamp with time zone,
	"email_opt_out" boolean DEFAULT false NOT NULL,
	"email_opt_out_at" timestamp with time zone,
	"email_welcome_sent" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "consent_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"platform" text NOT NULL,
	"consent_version" text DEFAULT '1.0' NOT NULL,
	"consented_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "consent_records_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "gdpr_admin_actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" integer NOT NULL,
	"action" text NOT NULL,
	"session_id" text NOT NULL,
	"performed_at" timestamp DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "gdpr_data_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"type" text DEFAULT 'info' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"stripe_subscription_id" text,
	"stripe_customer_id" text,
	"paddle_subscription_id" text,
	"paddle_customer_id" text,
	"status" text DEFAULT 'inactive' NOT NULL,
	"plan_name" text DEFAULT 'Pro',
	"current_period_end" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "competitor_checks" (
	"id" serial PRIMARY KEY NOT NULL,
	"checked_at" timestamp DEFAULT now() NOT NULL,
	"competitor" text NOT NULL,
	"url" text NOT NULL,
	"status_code" integer,
	"content_hash" text,
	"previous_hash" text,
	"change_detected" boolean DEFAULT false NOT NULL,
	"change_notes" text,
	"error" text
);
--> statement-breakpoint
CREATE TABLE "health_checks" (
	"id" serial PRIMARY KEY NOT NULL,
	"checked_at" timestamp DEFAULT now() NOT NULL,
	"overall_status" text NOT NULL,
	"pass_count" integer DEFAULT 0 NOT NULL,
	"fail_count" integer DEFAULT 0 NOT NULL,
	"results" jsonb NOT NULL,
	"triggered_by" text DEFAULT 'cron' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plan_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" text NOT NULL,
	"user_id" text,
	"session_id" text,
	"viewed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"title" text DEFAULT 'My Resilience Companion' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checkin_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"date" varchar(10) NOT NULL,
	"financial" integer NOT NULL,
	"health" integer NOT NULL,
	"skills" integer NOT NULL,
	"social" integer NOT NULL,
	"resources" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "checkin_entries_user_date" UNIQUE("user_id","date")
);
--> statement-breakpoint
CREATE TABLE "challenge_state" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"dimension_order" text NOT NULL,
	"completed_days" text DEFAULT '[]' NOT NULL,
	CONSTRAINT "challenge_state_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "email_drip_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"report_id" varchar(64) NOT NULL,
	"email_type" varchar(10) NOT NULL,
	"score_overall" integer NOT NULL,
	"weakest_dimension" varchar(30),
	"scheduled_for" timestamp NOT NULL,
	"sent_at" timestamp,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"details" jsonb,
	"ip" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"pillar" text NOT NULL,
	"pillar_label" text NOT NULL,
	"target_keyword" text NOT NULL,
	"reading_time_min" integer DEFAULT 5 NOT NULL,
	"body" jsonb NOT NULL,
	"og_image" text,
	"status" text DEFAULT 'published' NOT NULL,
	"published_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "assessment_drafts" ADD CONSTRAINT "assessment_drafts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resilience_reports" ADD CONSTRAINT "resilience_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_state" ADD CONSTRAINT "challenge_state_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_drip_queue" ADD CONSTRAINT "email_drip_queue_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");