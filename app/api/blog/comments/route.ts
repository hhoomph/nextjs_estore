import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import prisma from "@/lib/prisma";

// Validation schema for creating comments
const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment content is required")
    .max(1000, "Comment too long"),
  postId: z.string().min(1, "Post ID is required"),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await authClient.getSession();
    if (!session?.data?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const validatedData = createCommentSchema.parse(body);

    // Verify the blog post exists and is published
    const blogPost = await prisma.blogPost.findUnique({
      where: { id: validatedData.postId },
      select: { id: true, status: true },
    });

    if (!blogPost) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 },
      );
    }

    if (blogPost.status !== "published") {
      return NextResponse.json(
        { error: "Cannot comment on unpublished posts" },
        { status: 403 },
      );
    }

    // Create the comment
    const comment = await prisma.blogComment.create({
      data: {
        content: validatedData.content,
        postId: validatedData.postId,
        authorId: session.data.user.id,
        status: "pending", // Comments start as pending for moderation
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
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating blog comment:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 },
    );
  }
}
