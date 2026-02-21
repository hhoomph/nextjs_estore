/**
 * Individual Blog Post Page Component
 *
 * Displays a single blog post with full content, comments, and related posts.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { BlogComments } from "@/components/blog/blog-comments";
import { BlogPostContent } from "@/components/blog/blog-post-content";
import { BlogRelatedPosts } from "@/components/blog/blog-related-posts";
import { prisma } from "@/lib/database";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const t = await getTranslations("Blog");

  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: params.slug, status: "published" },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });

    if (!post) {
      return {
        title: t("post.notFound"),
      };
    }

    return {
      title: post.title,
      description: post.excerpt || post.title,
      openGraph: {
        title: post.title,
        description: post.excerpt || post.title,
        images: post.featuredImage ? [{ url: post.featuredImage }] : [],
      },
      twitter: {
        title: post.title,
        description: post.excerpt || post.title,
        images: post.featuredImage ? [post.featuredImage] : [],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: t("post.error"),
    };
  }
}

interface BlogPostPageProps {
  params: { slug: string };
}

export const dynamic = "force-dynamic";

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const t = await getTranslations("Blog");

  let post: any = null;
  let relatedPosts: any[] = [];

  try {
    // Get the blog post with all relations
    post = await prisma.blogPost.findUnique({
      where: { slug: params.slug, status: "published" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              },
            },
          },
        },
        comments: {
          where: { status: "approved" },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            replies: {
              where: { status: "approved" },
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!post) {
      notFound();
    }

    // Increment view count (in a real app, this should be done via API)
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    // Get related posts (same category, different tags, etc.)
    relatedPosts = await prisma.blogPost.findMany({
      where: {
        id: { not: post.id },
        status: "published",
        publishedAt: { not: null },
        categoryId: post.categoryId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
      },
      orderBy: { publishedAt: "desc" },
      take: 4,
    });
  } catch (error) {
    console.error("Error loading blog post:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">{t("post.error")}</h1>
          <p className="text-muted-foreground">{t("post.errorDescription")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Main Content */}
        <article className="mb-12">
          <BlogPostContent post={post} />
        </article>

        {/* Comments Section */}
        <section className="mb-12">
          <BlogComments
            postId={post.id}
            comments={post.comments}
            commentCount={post.comments.length}
          />
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section>
            <BlogRelatedPosts posts={relatedPosts} />
          </section>
        )}
      </div>
    </div>
  );
}
