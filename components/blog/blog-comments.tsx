/**
 * Blog Comments Component
 *
 * Displays and manages comments for a blog post.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Reply, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { BlogCommentData } from "./types";

interface BlogCommentsProps {
  postId: string;
  comments: BlogCommentData[];
  commentCount: number;
}

export function BlogComments({
  postId,
  comments,
  commentCount,
}: BlogCommentsProps) {
  const t = useTranslations("Blog");
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/blog/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment.trim(),
          postId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit comment");
      }

      // Refresh the page to show the new comment (after moderation)
      window.location.reload();
    } catch (error) {
      console.error("Error submitting comment:", error);
      // TODO: Show error toast to user
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (commentId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/blog/comments/${commentId}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: replyContent.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit reply");
      }

      // Refresh the page to show the new reply (after moderation)
      window.location.reload();
    } catch (error) {
      console.error("Error submitting reply:", error);
      // TODO: Show error toast to user
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Comments Header */}
      <div className="flex items-center space-x-2">
        <MessageCircle className="h-5 w-5" />
        <h2 className="text-2xl font-bold">
          {t("comments.title")} ({commentCount})
        </h2>
      </div>

      {/* Add Comment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("comments.addComment")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <Textarea
              placeholder={t("comments.placeholder")}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>
                  {isSubmitting
                    ? t("comments.submitting")
                    : t("comments.submit")}
                </span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={(commentId) => setReplyingTo(commentId)}
              replyingTo={replyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onSubmitReply={handleSubmitReply}
              isSubmitting={isSubmitting}
              t={t}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t("comments.noComments")}
              </h3>
              <p className="text-muted-foreground">{t("comments.beFirst")}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface CommentItemProps {
  comment: BlogCommentData;
  onReply: (commentId: string | null) => void;
  replyingTo: string | null;
  replyContent: string;
  setReplyContent: (content: string) => void;
  onSubmitReply: (commentId: string, e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  t: unknown;
}

function CommentItem({
  comment,
  onReply,
  replyingTo,
  replyContent,
  setReplyContent,
  onSubmitReply,
  isSubmitting,
  t,
}: CommentItemProps) {
  const translate = t as (key: string) => string;

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Comment Content */}
        <div className="flex space-x-4">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage
              src={comment.author.image || ""}
              alt={comment.author.name || ""}
            />
            <AvatarFallback>
              {comment.author.name?.charAt(0).toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="font-semibold">
                {comment.author.name || translate("anonymous")}
              </span>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
              </span>
            </div>

            <p className="text-sm leading-relaxed">{comment.content}</p>

            {/* Reply Button */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReply(comment.id)}
                className="h-auto p-1 text-muted-foreground hover:text-foreground"
              >
                <Reply className="h-3 w-3 mr-1" />
                {translate("comments.reply")}
              </Button>
            </div>

            {/* Reply Form */}
            {replyingTo === comment.id && (
              <div className="mt-4 pl-4 border-l-2 border-muted">
                <form
                  onSubmit={(e) => onSubmitReply(comment.id, e)}
                  className="space-y-3"
                >
                  <Textarea
                    placeholder={translate("comments.replyPlaceholder")}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReplyContent("");
                        onReply(null);
                      }}
                    >
                      {translate("comments.cancel")}
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!replyContent.trim() || isSubmitting}
                    >
                      {isSubmitting
                        ? translate("comments.submitting")
                        : translate("comments.submitReply")}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Replies */}
        {comment.replies.length > 0 && (
          <div className="mt-6 space-y-4">
            {comment.replies.map((reply) => (
              <div
                key={reply.id}
                className="flex space-x-4 pl-8 border-l-2 border-muted/50"
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage
                    src={reply.author.image || ""}
                    alt={reply.author.name || ""}
                  />
                  <AvatarFallback className="text-xs">
                    {reply.author.name?.charAt(0).toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold">
                      {reply.author.name || translate("anonymous")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(reply.createdAt, {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {reply.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
