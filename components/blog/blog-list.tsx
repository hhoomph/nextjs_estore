/**
 * Blog list component for displaying blog posts
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

"use client";

import { format } from "date-fns";
import { ArrowRight, Calendar, Clock, MessageCircle, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

interface BlogPost {
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
  tags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
      color: string | null;
    };
  }>;
  _count: {
    comments: number;
  };
}

interface BlogListProps {
  posts: BlogPost[];
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  locale: string;
}

export function BlogList({
  posts,
  currentPage,
  totalPages,
  totalPosts,
  locale,
}: BlogListProps) {
  const t = (useTranslations as any)("blog");

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            {t("noPostsFound")}
          </h3>
          <p className="text-muted-foreground">{t("noPostsDescription")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} locale={locale} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <BlogPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalPosts={totalPosts}
          locale={locale}
        />
      )}
    </div>
  );
}

interface BlogCardProps {
  post: BlogPost;
  locale: string;
}

function BlogCard({ post, locale }: BlogCardProps) {
  const t = (useTranslations as any)("blog");

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative">
        {post.featuredImage ? (
          <div className="aspect-video overflow-hidden">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill={true}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ) : (
          <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <Badge
            variant="secondary"
            className="text-xs"
            style={{
              backgroundColor: post.category.color || undefined,
              color: post.category.color ? "#ffffff" : undefined,
            }}
          >
            {post.category.name}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Calendar className="w-4 h-4" />
          <time dateTime={post.publishedAt?.toISOString()}>
            {post.publishedAt
              ? format(new Date(post.publishedAt), "MMM d, yyyy")
              : t("draft")}
          </time>
          {post.readingTime && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{post.readingTime} min read</span>
              </div>
            </>
          )}
        </div>

        <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          <Link href={`/${locale}/blog/${post.slug}`}>{post.title}</Link>
        </h3>

        {post.excerpt && (
          <p className="text-muted-foreground text-sm line-clamp-3">
            {post.excerpt}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.slice(0, 3).map(({ tag }) => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                {tag.name}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{post.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Author and Comments */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={post.author.image || undefined} />
              <AvatarFallback className="text-xs">
                {post.author.name?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {post.author.name || t("anonymous")}
            </span>
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MessageCircle className="w-4 h-4" />
            <span>{post._count.comments}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button asChild={true} variant="ghost" className="w-full group/btn">
          <Link
            href={`/${locale}/blog/${post.slug}`}
            className="flex items-center justify-center gap-2"
          >
            {t("readMore")}
            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  locale: string;
}

function BlogPagination({
  currentPage,
  totalPages,
  totalPosts,
  locale,
}: BlogPaginationProps) {
  const t = (useTranslations as any)("blog");

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", page.toString());
    const query = params.toString();
    return `/${locale}/blog${query ? `?${query}` : ""}`;
  };

  const showPages = [];
  const delta = 2;

  for (
    let i = Math.max(2, currentPage - delta);
    i <= Math.min(totalPages - 1, currentPage + delta);
    i++
  ) {
    showPages.push(i);
  }

  if (currentPage - delta > 2) showPages.unshift("...");
  if (currentPage + delta < totalPages - 1) showPages.push("...");

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        {t("showingResults", {
          start: (currentPage - 1) * 12 + 1,
          end: Math.min(currentPage * 12, totalPosts),
          total: totalPosts,
        })}
      </p>

      <div className="flex items-center gap-1">
        {/* Previous Button */}
        {currentPage > 1 ? (
          <Button asChild={true} variant="outline" size="sm">
            <Link href={getPageUrl(currentPage - 1)}>{t("previous")}</Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled={true}>
            {t("previous")}
          </Button>
        )}

        {/* First Page */}
        <Button
          asChild={currentPage !== 1}
          variant={currentPage === 1 ? "default" : "outline"}
          size="sm"
        >
          {currentPage === 1 ? (
            <span>1</span>
          ) : (
            <Link href={getPageUrl(1)}>1</Link>
          )}
        </Button>

        {/* Pages with ellipsis */}
        {showPages.map((page, index) => (
          <Button
            key={index}
            asChild={page !== "..."}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            disabled={page === "..."}
          >
            {page === "..." ? (
              <span>...</span>
            ) : page === currentPage ? (
              <span>{page}</span>
            ) : (
              <Link href={getPageUrl(page as number)}>{page}</Link>
            )}
          </Button>
        ))}

        {/* Last Page */}
        {totalPages > 1 && (
          <Button
            asChild={currentPage !== totalPages}
            variant={currentPage === totalPages ? "default" : "outline"}
            size="sm"
          >
            {currentPage === totalPages ? (
              <span>{totalPages}</span>
            ) : (
              <Link href={getPageUrl(totalPages)}>{totalPages}</Link>
            )}
          </Button>
        )}

        {/* Next Button */}
        {currentPage < totalPages ? (
          <Button asChild={true} variant="outline" size="sm">
            <Link href={getPageUrl(currentPage + 1)}>{t("next")}</Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled={true}>
            {t("next")}
          </Button>
        )}
      </div>
    </div>
  );
}
