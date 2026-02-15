/**
 * Module for error
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function Error({
  title = "Something went wrong",
  message = "An error occurred while loading this content.",
  onRetry,
  className,
}: ErrorProps) {
  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="mb-4 text-muted-foreground">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function ErrorPage({
  title = "Page Not Found",
  message = "The page you're looking for doesn't exist.",
  statusCode = 404,
}: {
  title?: string;
  message?: string;
  statusCode?: number;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8 text-6xl font-bold text-muted-foreground">
          {statusCode}
        </div>
        <h1 className="mb-4 text-2xl font-bold">{title}</h1>
        <p className="mb-8 text-muted-foreground">{message}</p>
        <Button asChild={true}>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}

export function InlineError({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center space-x-2 text-sm text-destructive ${className}`}
    >
      <AlertTriangle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
}
