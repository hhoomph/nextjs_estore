import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { prisma } from "@/lib/database";

// Validation schema for creating replies
const createReplySchema = z.object({
  content: z
    .string()
    .min(1, "Reply content is required")
    .max(1000, "Reply too long"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication
    const session = await authClient.getSession();
    if (!session?.data?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { id: commentId } = await params;
    const body = await request.json();
    const validatedData = createReplySchema.parse(body);

    // Verify the parent comment exists and is approved
    const parentComment = await prisma.blogComment.findUnique({
      where: { id: commentId },
      select: { id: true, status: true, postId: true },
    });

    if (!parentComment) {
      return NextResponse.json(
        { error: "Parent comment not found" },
        { status: 404 },
      );
    }

    if (parentComment.status !== "approved") {
      return NextResponse.json(
        { error: "Cannot reply to unapproved comments" },
        { status: 403 },
      );
    }

    // Create the reply
    const reply = await prisma.blogComment.create({
      data: {
        content: validatedData.content,
        postId: parentComment.postId,
        authorId: session.data.user.id,
        parentId: commentId,
        status: "pending", // Replies start as pending for moderation
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        ...reply,
        createdAt: reply.createdAt.toISOString(),
        updatedAt: reply.updatedAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating blog comment reply:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create reply" },
      { status: 500 },
    );
  }
}
