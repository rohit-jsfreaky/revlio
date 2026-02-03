import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
} from "@/lib/projects";
import { autoAssignReviewers } from "@/lib/reviews";
import { canAfford, CREDIT_CONFIG } from "@/lib/credits";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      problemSolved,
      liveUrl,
      githubUrl,
      techStack,
      category,
      screenshotUrl,
    } = body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !problemSolved ||
      !liveUrl ||
      !techStack ||
      !category
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if user can afford submission
    const affordable = await canAfford(
      user.id,
      CREDIT_CONFIG.COST_PER_SUBMISSION,
    );
    if (!affordable) {
      return NextResponse.json(
        { error: "Not enough credits. Complete reviews to earn credits." },
        { status: 400 },
      );
    }

    // Create the project (this also spends credits internally)
    const result = await createProject(user.id, {
      title,
      description,
      problemSolved,
      liveUrl,
      githubUrl,
      techStack,
      category,
      screenshotUrl,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create project" },
        { status: 400 },
      );
    }

    // Auto-assign reviewers for the new project
    if (result.project) {
      try {
        await autoAssignReviewers(result.project.id, 3);
      } catch (e) {
        console.error("Failed to assign reviewers:", e);
        // Don't fail the request, reviewers can be assigned later
      }
    }

    return NextResponse.json({
      success: true,
      project: result.project,
      message: "Project submitted successfully!",
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("id");

    if (projectId) {
      // Get single project
      const project = await getProjectById(projectId);
      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 },
        );
      }
      return NextResponse.json(project);
    } else {
      // Get user's projects
      const projects = await getUserProjects(user.id);
      return NextResponse.json(projects);
    }
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getSessionUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, ...updateData } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 },
      );
    }

    // If version upgrade, check if user can afford
    if (updateData.version) {
      const project = await getProjectById(projectId);
      if (project && updateData.version !== project.version) {
        const affordable = await canAfford(
          user.id,
          CREDIT_CONFIG.COST_PER_SUBMISSION,
        );
        if (!affordable) {
          return NextResponse.json(
            {
              error:
                "Not enough credits for version upgrade. Complete reviews to earn credits.",
            },
            { status: 400 },
          );
        }
      }
    }

    const result = await updateProject(user.id, projectId, updateData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to update project" },
        { status: 400 },
      );
    }

    // If version was upgraded, auto-assign new reviewers
    if (result.versionUpgraded && result.project) {
      try {
        await autoAssignReviewers(result.project.id, 3);
      } catch (e) {
        console.error("Failed to assign reviewers:", e);
      }
    }

    return NextResponse.json({
      success: true,
      project: result.project,
      versionUpgraded: result.versionUpgraded,
      message: result.versionUpgraded
        ? "Project updated and submitted for new reviews!"
        : "Project updated successfully!",
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 },
    );
  }
}
