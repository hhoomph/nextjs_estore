/**
 * Blog Post Content Component
 *
 * Displays the full content of a blog post.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { format } from "date-fns";
import { ArrowLeft, Calendar, Clock, Eye, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface BlogPostWithContent {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: Date | null;
  readingTime: number | null;
  viewCount: number;
  seoTitle: string | null;
  seoDescription: string | null;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    bio?: string | null;
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
}

interface BlogPostContentProps {
  post: BlogPostWithContent;
}

export function BlogPostContent({ post }: BlogPostContentProps) {
  const t = useTranslations("Blog");

  const blogUrl = "/blog";

  return (
    <div className="space-y-8">
      {/* Back to Blog Link */}
      <div className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
        <Link href={blogUrl} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>{t("post.backToBlog")}</span>
        </Link>
      </div>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="aspect-video overflow-hidden rounded-lg">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Header */}
      <header className="space-y-4">
        {/* Category Badge */}
        <div>
          <Badge
            variant="secondary"
            className="text-sm font-medium"
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
            <Link href={`${blogUrl}?category=${post.category.slug}`}>
              {post.category.name}
            </Link>
          </Badge>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold leading-tight">
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-xl text-muted-foreground leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {/* Author */}
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={post.author.image || ""}
                alt={post.author.name || ""}
              />
              <AvatarFallback>
                {post.author.name?.charAt(0).toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">
              {post.author.name || t("anonymous")}
            </span>
          </div>

          {/* Separator */}
          <Separator orientation="vertical" className="h-4" />

          {/* Published Date */}
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>
              {post.publishedAt
                ? format(post.publishedAt, "MMM dd, yyyy")
                : t("unpublished")}
            </span>
          </div>

          {/* Reading Time */}
          {post.readingTime && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{post.readingTime} min read</span>
              </div>
            </>
          )}

          {/* View Count */}
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center space-x-1">
            <Eye className="h-4 w-4" />
            <span>{post.viewCount} views</span>
          </div>
        </div>
      </header>

      <Separator />

      {/* Article Content */}
      <div
        className="prose prose-lg max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="space-y-4">
          <Separator />
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{t("post.tags")}</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map(({ tag }) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="hover:bg-accent hover:text-accent-foreground transition-colors"
                  style={{
                    borderColor: tag.color || undefined,
                    color: tag.color || undefined,
                  }}
                >
                  <Link href={`${blogUrl}?tag=${tag.slug}`}>{tag.name}</Link>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Author Bio */}
      {post.author.bio && (
        <div className="space-y-4">
          <Separator />
          <div className="bg-muted/50 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={post.author.image || ""}
                  alt={post.author.name || ""}
                />
                <AvatarFallback className="text-lg">
                  {post.author.name?.charAt(0).toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">
                  {post.author.name || t("anonymous")}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {post.author.bio}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
