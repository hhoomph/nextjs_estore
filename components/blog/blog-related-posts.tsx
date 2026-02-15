/**
 * Blog Related Posts Component
 *
 * Displays related blog posts at the bottom of a post.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Clock, Eye } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface RelatedPost {
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
}

interface BlogRelatedPostsProps {
  posts: RelatedPost[];
}

export function BlogRelatedPosts({ posts }: BlogRelatedPostsProps) {
  const t = useTranslations("Blog");

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("relatedPosts.title")}</h2>
        <Link
          href="/blog"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
        >
          <span>{t("relatedPosts.viewAll")}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {posts.map((post) => (
          <Card
            key={post.id}
            className="group overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            {/* Featured Image */}
            {post.featuredImage && (
              <div className="aspect-video overflow-hidden">
                <Link href={`/blog/${post.slug}`}>
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </Link>
              </div>
            )}

            <CardContent className="p-4">
              {/* Category Badge */}
              <div className="mb-2">
                <Badge
                  variant="secondary"
                  className="text-xs"
                  style={{
                    backgroundColor: post.category.color
                      ? `${post.category.color}20`
                      : undefined,
                    borderColor: post.category.color
                      ? post.category.color
                      : undefined,
                    color: post.category.color || undefined,
                  }}
                >
                  {post.category.name}
                </Badge>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                <Link
                  href={`/blog/${post.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {post.title}
                </Link>
              </h3>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {post.excerpt}
                </p>
              )}

              {/* Meta Information */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage
                      src={post.author.image || ""}
                      alt={post.author.name || ""}
                    />
                    <AvatarFallback className="text-xs">
                      {post.author.name?.charAt(0).toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">
                    {post.author.name || t("anonymous")}
                  </span>
                </div>

                {/* Reading Time & Views */}
                <div className="flex items-center space-x-2">
                  {post.readingTime && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.readingTime}m</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>{post.viewCount}</span>
                  </div>
                </div>
              </div>

              {/* Published Date */}
              {post.publishedAt && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {formatDistanceToNow(post.publishedAt, { addSuffix: true })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
