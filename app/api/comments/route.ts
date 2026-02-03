import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getDb } from "@/lib/db";
import { projects, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import {
  getProjectComments,
  addComment,
  deleteComment,
  togglePinComment,
  getCommentCount,
  toggleCommentLike,
} from "@/lib/social";

// Send email notification for new comments
async function sendCommentNotification(
  projectOwnerId: string,
  projectOwnerEmail: string,
  projectTitle: string,
  commenterName: string,
  commentContent: string
) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Revlio <hello@getrevlio.com>",
        to: projectOwnerEmail,
        subject: `New comment on "${projectTitle}"`,
        html: `
          <div style="font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #0b1220; max-width: 600px;">
            <h2 style="margin: 0 0 16px; color: #1d4ed8;">New Comment on Your Project</h2>
            <p style="margin: 0 0 12px;"><strong>${commenterName}</strong> commented on your project <strong>"${projectTitle}"</strong>:</p>
            <div style="background: #f1f5f9; padding: 16px; border-radius: 12px; margin: 16px 0;">
              <p style="margin: 0; color: #334155;">"${commentContent}"</p>
            </div>
            <p style="margin: 16px 0 0;">
              <a href="${process.env.APP_URL}/dashboard/projects" style="display: inline-block; background: #1d4ed8; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Comment</a>
            </p>
            <p style="margin: 24px 0 0; font-weight: 600; color: #64748b;">— The Revlio Team</p>
          </div>
        `,
      }),
    });
  } catch (error) {
    console.error("Failed to send comment notification:", error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const user = await getSessionUser(request);

    const comments = await getProjectComments(projectId, user?.id);
    const count = await getCommentCount(projectId);

    return NextResponse.json({ comments, count });
  } catch (error) {
    console.error("Error getting comments:", error);
    return NextResponse.json(
      { error: "Failed to get comments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, projectId, content, parentId, commentId } = body;

    switch (action) {
      case "add": {
        if (!projectId || !content) {
          return NextResponse.json(
            { error: "Project ID and content are required" },
            { status: 400 }
          );
        }

        if (content.length < 2) {
          return NextResponse.json(
            { error: "Comment is too short" },
            { status: 400 }
          );
        }

        if (content.length > 2000) {
          return NextResponse.json(
            { error: "Comment is too long (max 2000 characters)" },
            { status: 400 }
          );
        }

        const comment = await addComment(user.id, projectId, content, parentId);

        // Get project owner info to send notification
        const db = getDb();
        const [projectInfo] = await db
          .select({
            project: projects,
            owner: {
              id: users.id,
              email: users.email,
              name: users.name,
            },
          })
          .from(projects)
          .innerJoin(users, eq(projects.userId, users.id))
          .where(eq(projects.id, projectId))
          .limit(1);

        // Send notification if commenter is not the project owner
        if (projectInfo && projectInfo.owner.id !== user.id) {
          // Get commenter's name
          const [commenter] = await db
            .select({ name: users.name })
            .from(users)
            .where(eq(users.id, user.id))
            .limit(1);

          sendCommentNotification(
            projectInfo.owner.id,
            projectInfo.owner.email,
            projectInfo.project.title,
            commenter?.name || "Someone",
            content.slice(0, 200) + (content.length > 200 ? "..." : "")
          );
        }

        return NextResponse.json({ success: true, comment });
      }

      case "delete": {
        if (!commentId) {
          return NextResponse.json(
            { error: "Comment ID is required" },
            { status: 400 }
          );
        }

        const deleted = await deleteComment(user.id, commentId);

        if (!deleted) {
          return NextResponse.json(
            { error: "Comment not found or unauthorized" },
            { status: 404 }
          );
        }

        return NextResponse.json({ success: true });
      }

      case "pin": {
        if (!commentId) {
          return NextResponse.json(
            { error: "Comment ID is required" },
            { status: 400 }
          );
        }

        const result = await togglePinComment(user.id, commentId);

        if (!result.success) {
          return NextResponse.json(
            { error: "Only project owner can pin comments" },
            { status: 403 }
          );
        }

        return NextResponse.json(result);
      }

      case "like": {
        if (!commentId) {
          return NextResponse.json(
            { error: "Comment ID is required" },
            { status: 400 }
          );
        }

        const result = await toggleCommentLike(user.id, commentId);
        return NextResponse.json({ commentId, ...result });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error handling comment:", error);
    return NextResponse.json(
      { error: "Failed to process comment" },
      { status: 500 }
    );
  }
}
