/**
 * Skeleton Components
 *
 * Loading state components with skeleton animations
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 * @performance Critical for better perceived performance
 */

import { cn } from '@/lib/utils';

/**
 * Base skeleton component
 */
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Skeleton text
 */
interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({
  lines = 3,
  className,
}: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}

/**
 * Skeleton card
 */
interface SkeletonCardProps {
  className?: string;
  showImage?: boolean;
  imageHeight?: string;
  children?: React.ReactNode;
}

export function SkeletonCard({
  className,
  showImage = true,
  imageHeight = 'aspect-video',
  children,
}: SkeletonCardProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-4', className)}>
      {showImage && (
        <Skeleton className={cn(imageHeight, 'w-full rounded-md')} />
      )}
      <div className="mt-4 space-y-2">
        {children ?? (
          <>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Skeleton product card
 */
interface SkeletonProductCardProps {
  className?: string;
}

export function SkeletonProductCard({ className }: SkeletonProductCardProps) {
  return (
    <SkeletonCard className={cn('overflow-hidden', className)}>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <div className="mt-3 flex items-center justify-between">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </SkeletonCard>
  );
}

/**
 * Skeleton grid
 */
interface SkeletonGridProps {
  count?: number;
  columns?: number;
  className?: string;
}

export function SkeletonGrid({
  count = 4,
  columns = 1,
  className,
}: SkeletonGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns as keyof typeof gridCols], className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton product grid
 */
interface SkeletonProductGridProps {
  count?: number;
  className?: string;
}

export function SkeletonProductGrid({
  count = 8,
  className,
}: SkeletonProductGridProps) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProductCard key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton category grid
 */
interface SkeletonCategoryGridProps {
  count?: number;
  className?: string;
}

export function SkeletonCategoryGrid({
  count = 8,
  className,
}: SkeletonCategoryGridProps) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} showImage={false}>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </SkeletonCard>
      ))}
    </div>
  );
}

/**
 * Skeleton table
 */
interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
}: SkeletonTableProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full rounded-md" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-12 w-full rounded-md" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton avatar
 */
interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SkeletonAvatar({ size = 'md', className }: SkeletonAvatarProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return <Skeleton className={cn(sizes[size], 'rounded-full', className)} />;
}

/**
 * Skeleton button
 */
interface SkeletonButtonProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export function SkeletonButton({ size = 'md', variant = 'default', className }: SkeletonButtonProps) {
  const sizes = {
    sm: 'h-8 px-3',
    md: 'h-10 px-4',
    lg: 'h-12 px-6',
  };

  const variants = {
    default: 'bg-primary',
    outline: 'border border-input bg-transparent',
    ghost: 'bg-transparent',
  };

  return (
    <Skeleton
      className={cn('rounded-md', sizes[size], variants[variant], className)}
    />
  );
}

/**
 * Skeleton navbar
 */
interface SkeletonNavbarProps {
  className?: string;
}

export function SkeletonNavbar({ className }: SkeletonNavbarProps) {
  return (
    <nav className={cn('border-b', className)}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Skeleton className="h-6 w-48" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>
        </div>
      </div>
    </nav>
  );
}

/**
 * Skeleton hero section
 */
interface SkeletonHeroProps {
  className?: string;
}

export function SkeletonHero({ className }: SkeletonHeroProps) {
  return (
    <section className={cn('bg-muted py-20', className)}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-3/4" />
            <div className="flex gap-4">
              <SkeletonButton size="md" />
              <SkeletonButton size="md" variant="outline" />
            </div>
          </div>
          <div className="flex-1">
            <Skeleton className="aspect-video w-full rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Skeleton form
 */
interface SkeletonFormProps {
  fields?: number;
  className?: string;
}

export function SkeletonForm({ fields = 6, className }: SkeletonFormProps) {
  return (
    <form className={cn('space-y-4', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
    </form>
  );
}

/**
 * Skeleton search
 */
interface SkeletonSearchProps {
  className?: string;
}

export function SkeletonSearch({ className }: SkeletonSearchProps) {
  return (
    <div className={cn('relative', className)}>
      <Skeleton className="h-12 w-full rounded-full" />
      <Skeleton className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full" />
    </div>
  );
}

/**
 * Skeleton footer
 */
interface SkeletonFooterProps {
  className?: string;
}

export function SkeletonFooter({ className }: SkeletonFooterProps) {
  return (
    <footer className={cn('bg-muted py-12', className)}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-6 w-32 mb-4" />
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-full mb-2" />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-8 pt-8 border-t">
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    </footer>
  );
}

/**
 * Skeleton notification
 */
interface SkeletonNotificationProps {
  className?: string;
}

export function SkeletonNotification({ className }: SkeletonNotificationProps) {
  return (
    <div className={cn('flex gap-3 p-4', className)}>
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
