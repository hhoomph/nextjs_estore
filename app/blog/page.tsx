/**
 * Blog Page Component
 *
 * Displays a list of published blog posts with categories and search functionality.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { BlogCategories } from "@/components/blog/blog-categories";
import { BlogPostList } from "@/components/blog/blog-post-list";
import { BlogSearch } from "@/components/blog/blog-search";
import prisma from "@/lib/prisma";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}): Promise<Metadata> {
  const t = await getTranslations("Blog");
  const category = searchParams.category as string;
  const search = searchParams.q as string;

  let title = t("title");
  const description = t("description");

  if (category) {
    title = `${t("category")}: ${category} - ${t("title")}`;
  } else if (search) {
    title = `${t("search.title")}: ${search} - ${t("title")}`;
  }

  return {
    title,
    description,
  };
}

interface BlogPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export const dynamic = "force-dynamic";

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const t = await getTranslations("Blog");
  const categorySlug = searchParams.category as string;
  const searchQuery = searchParams.q as string;
  const page = parseInt(searchParams.page as string) || 1;
  const limit = 12;

  let posts: any[] = [];
  let categories: any[] = [];
  let totalPages = 0;

  try {
    // Build where clause for posts
    const where: any = {
      status: "published",
      publishedAt: {
        not: null,
      },
    };

    if (categorySlug) {
      const category = await prisma.blogCategory.findUnique({
        where: { slug: categorySlug },
      });
      if (!category) {
        notFound();
      }
      where.categoryId = category.id;
    }

    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery, mode: "insensitive" } },
        { excerpt: { contains: searchQuery, mode: "insensitive" } },
        { content: { contains: searchQuery, mode: "insensitive" } },
      ];
    }

    // Get posts with pagination
    const [postsData, totalPosts] = await Promise.all([
      prisma.blogPost.findMany({
        where,
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
            select: { id: true },
          },
        },
        orderBy: {
          publishedAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ]);

    posts = postsData;

    // Get all categories for sidebar
    categories = await prisma.blogCategory.findMany({
      where: { active: true },
      include: {
        posts: {
          where: {
            status: "published",
            publishedAt: { not: null },
          },
          select: { id: true },
        },
      },
      orderBy: { order: "asc" },
    });

    totalPages = Math.ceil(totalPosts / limit);
  } catch (error) {
    console.error("Error loading blog posts:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t("error.title")}</h1>
          <p className="text-muted-foreground">{t("error.description")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
        <p className="text-lg text-muted-foreground">{t("description")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search */}
          <BlogSearch />

          {/* Categories */}
          <BlogCategories
            categories={categories}
            activeCategory={categorySlug}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <BlogPostList
            posts={posts}
            totalPages={totalPages}
            currentPage={page}
            category={categorySlug}
            searchQuery={searchQuery}
          />
        </div>
      </div>
    </div>
  );
}
