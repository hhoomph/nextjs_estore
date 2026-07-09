/**
 * Module for route
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/database";

// GET /api/reviews - Get reviews for a product or global approved reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const global = searchParams.get("global");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    if (global === "true") {
      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where: { status: "approved" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.review.count({ where: { status: "approved" } }),
      ]);

      const transformedReviews = reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        createdAt: review.createdAt,
        user: {
          id: review.user.id,
          name: review.user.name || "Anonymous",
          image: review.user.image,
        },
      }));

      return NextResponse.json({
        reviews: transformedReviews,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    }

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId: productId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: { productId: productId },
      }),
    ]);

    // Calculate average rating
    const ratings = reviews.map((r) => r.rating);
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0;

    // Rating distribution
    const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count: ratings.filter((r) => r === rating).length,
      percentage:
        ratings.length > 0
          ? Math.round(
              (ratings.filter((r) => r === rating).length / ratings.length) *
                100,
            )
          : 0,
    }));

    // Transform reviews for frontend
    const transformedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      createdAt: review.createdAt,
      user: {
        id: review.user.id,
        name: review.user.name || "Anonymous",
        image: review.user.image,
      },
    }));

    return NextResponse.json({
      reviews: transformedReviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        totalReviews: total,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in to leave a review" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { productId, rating, title, comment } = body;

    // Validate required fields
    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Product ID and rating (1-5) are required" },
        { status: 400 },
      );
    }

    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.status !== 1) {
      return NextResponse.json(
        { error: "Product not found or unavailable" },
        { status: 404 },
      );
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: productId,
        userId: session.user.id,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400 },
      );
    }

    // Check if user has purchased this product (optional - for review validation)
    // This is a basic check - in production you might want more sophisticated validation
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId: productId,
        order: {
          userId: session.user.id,
          payment: {
            some: {
              status: "completed",
            },
          },
        },
      },
    });

    // For now, we'll allow reviews without purchase validation
    // Uncomment the following lines to enable purchase validation:
    // if (!hasPurchased) {
    //   return NextResponse.json(
    //     { error: "You must purchase this product before leaving a review" },
    //     { status: 403 }
    //   );
    // }

    // Create the review
    const review = await prisma.review.create({
      data: {
        id: crypto.randomUUID(),
        productId: productId,
        userId: session.user.id,
        rating: parseInt(rating),
        title: title?.trim() || null,
        comment: comment?.trim() || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        user: {
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
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        createdAt: review.createdAt,
        user: {
          id: review.user.id,
          name: review.user.name || "Anonymous",
          image: review.user.image,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 },
    );
  }
}
