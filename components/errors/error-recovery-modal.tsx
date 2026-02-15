/**
 * Module for error-recovery-modal
 *
 * Modal for error recovery and user feedback collection
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { AlertCircle, MessageSquare, Send, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

interface ErrorRecoveryModalProps {
  errorId: string;
  error: Error;
  onClose: () => void;
  onSubmitFeedback: (feedback: string) => Promise<void>;
}

export const ErrorRecoveryModal: React.FC<ErrorRecoveryModalProps> = ({
  errorId,
  error,
  onClose,
  onSubmitFeedback,
}) => {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedback.trim()) return;

    setIsSubmitting(true);

    try {
      await onSubmitFeedback(feedback.trim());
      setHasSubmitted(true);

      // Auto-close after successful submission
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (hasSubmitted) {
    return (
      <Dialog open={true} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Send className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-center">Thank You!</DialogTitle>
            <DialogDescription className="text-center">
              Your feedback has been submitted successfully. We appreciate your
              help in improving our application.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Help Us Improve
          </DialogTitle>
          <DialogDescription>
            We encountered an error and would appreciate your feedback to help
            us fix it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error summary */}
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                  What happened
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {error.message}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    Error ID: {errorId}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {error.name}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Feedback form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback">
                Please describe what you were doing when this error occurred:
              </Label>
              <Textarea
                id="feedback"
                placeholder="e.g., I was trying to add an item to my cart, or I was navigating to the checkout page..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="resize-none"
                disabled={isSubmitting}
                required={true}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your feedback helps us understand the context and reproduce the
                issue.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Skip
              </Button>
              <Button type="submit" disabled={!feedback.trim() || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Feedback
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Privacy notice */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            <p>
              Your feedback is anonymous and will only be used to improve our
              application. We collect technical details automatically to help
              diagnose issues.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Additional helper components for error recovery

interface ErrorRetryButtonProps {
  onRetry: () => void;
  retryCount: number;
  maxRetries: number;
  isRetrying: boolean;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
}

export const ErrorRetryButton: React.FC<ErrorRetryButtonProps> = ({
  onRetry,
  retryCount,
  maxRetries,
  isRetrying,
  variant = "default",
  size = "default",
}) => {
  const canRetry = retryCount < maxRetries;

  if (!canRetry) return null;

  return (
    <Button
      onClick={onRetry}
      disabled={isRetrying}
      variant={variant}
      size={size}
    >
      {isRetrying ? (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Retrying...
        </>
      ) : (
        <>Try Again ({maxRetries - retryCount} left)</>
      )}
    </Button>
  );
};

interface ErrorReportButtonProps {
  onReport: () => void;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
}

export const ErrorReportButton: React.FC<ErrorReportButtonProps> = ({
  onReport,
  variant = "outline",
  size = "default",
}) => {
  return (
    <Button onClick={onReport} variant={variant} size={size}>
      <Send className="mr-2 h-4 w-4" />
      Report Issue
    </Button>
  );
};
