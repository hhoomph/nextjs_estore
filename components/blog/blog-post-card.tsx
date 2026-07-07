/**
 * Blog Post Card Component
 *
 * Displays a single blog post in card format.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { formatDistanceToNow } from "date-fns";
import { Clock, Eye, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { BlogPostListData } from "./types";

interface BlogPostCardProps {
  post: BlogPostListData;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  const t = useTranslations("Blog");

  const postUrl = `/blog/${post.slug}`;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Featured Image */}
      {post.featuredImage && (
        <div className="aspect-video overflow-hidden">
          <Link href={postUrl}>
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </Link>
        </div>
      )}

      <CardContent className="p-6">
        {/* Category Badge */}
        <div className="mb-3">
          <Badge
            variant="secondary"
            className="text-xs font-medium"
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
        <h3 className="text-xl font-semibold mb-3 line-clamp-2">
          <Link href={postUrl} className="hover:text-primary transition-colors">
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
            {post.excerpt}
          </p>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.slice(0, 3).map(({ tag }) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="text-xs"
                style={{
                  borderColor: tag.color || undefined,
                  color: tag.color || undefined,
                }}
              >
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
      </CardContent>

      <CardFooter className="px-6 pb-6 pt-0">
        <div className="flex items-center justify-between w-full">
          {/* Author */}
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={post.author.image || ""}
                alt={post.author.name || ""}
              />
              <AvatarFallback className="text-xs">
                {post.author.name?.charAt(0).toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {post.author.name || t("anonymous")}
            </span>
          </div>

          {/* Meta Info */}
          <div className="flex items-center space-x-3 text-xs text-muted-foreground">
            {/* Reading Time */}
            {post.readingTime && (
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{post.readingTime} min</span>
              </div>
            )}

            {/* View Count */}
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{post.viewCount}</span>
            </div>

            {/* Comment Count */}
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-3 w-3" />
              <span>{post.comments.length}</span>
            </div>

            {/* Published Date */}
            {post.publishedAt && (
              <span>
                {formatDistanceToNow(post.publishedAt, { addSuffix: true })}
              </span>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
