-- Comment Likes
CREATE TABLE "project_comment_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comment_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_comment_likes" ADD CONSTRAINT "project_comment_likes_comment_id_project_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."project_comments"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "project_comment_likes" ADD CONSTRAINT "project_comment_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "project_comment_likes_unique" ON "project_comment_likes" ("comment_id", "user_id");
