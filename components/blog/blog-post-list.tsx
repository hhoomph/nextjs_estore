/**
 * Blog Post List Component
 *
 * Displays a grid of blog posts with pagination.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Pagination } from "@/components/ui/pagination";
import { BlogPostCard } from "./blog-post-card";

interface BlogPostWithRelations {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: Date | null;
  readingTime: number | null;
  viewCount: number;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
  };
  tags: {
    tag: {
      id: string;
      name: string;
      slug: string;
      color: string | null;
    };
  }[];
  comments: { id: string }[];
}

interface BlogPostListProps {
  posts: BlogPostWithRelations[];
  totalPages: number;
  currentPage: number;
  category?: string;
  searchQuery?: string;
}

export function BlogPostList({
  posts,
  totalPages,
  currentPage,
  category,
  searchQuery,
}: BlogPostListProps) {
  const t = useTranslations("Blog");
  const pathname = usePathname();

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold mb-2">
          {searchQuery
            ? t("noSearchResults.title")
            : category
              ? t("noCategoryPosts.title")
              : t("noPostsFound.title")}
        </h3>
        <p className="text-muted-foreground">
          {searchQuery
            ? t("noSearchResults.description")
            : category
              ? t("noCategoryPosts.description")
              : t("noPostsFound.description")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t("showingResults", {
            count: posts.length,
            total: posts.length, // This should be the actual total count
          })}
        </p>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, i) => {
              const page = i + 1;
              const isActive = page === currentPage;

              // Build URL with current search params
              const params = new URLSearchParams();
              if (category) params.set("category", category);
              if (searchQuery) params.set("q", searchQuery);
              if (page > 1) params.set("page", page.toString());

              const href = `${pathname}?${params.toString()}`;

              return (
                <Link
                  key={page}
                  href={href}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {page}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
