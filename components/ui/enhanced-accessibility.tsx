/**
 * Enhanced Accessibility Components
 * Advanced accessibility features for modern web applications
 *
 * @author hh.oomph@gmail.com
 * @version 2.0.0
 * @since 2025-01-01
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Info,
  Settings,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

interface AccessibilityConfig {
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  largeText: boolean;
  colorBlind: boolean;
}

// Skip link component for keyboard navigation
interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const SkipLink: React.FC<SkipLinkProps> = ({ href, children, className }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        setIsVisible(true);
      }
    };

    const handleFocus = () => setIsVisible(true);
    const handleBlur = () => setIsVisible(false);

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <a
      href={href}
      className={cn(
        "fixed top-4 left-4 z-[100] -translate-y-full transform rounded-md bg-primary px-4 py-2 text-primary-foreground shadow-lg transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        isVisible && "translate-y-0",
        className,
      )}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
    </a>
  );
};

// Enhanced focus trap for modals and dialogs
interface FocusTrapProps {
  children: React.ReactNode;
  className?: string;
  autoFocus?: boolean;
  restoreFocus?: boolean;
  onEscape?: () => void;
}

const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  className,
  autoFocus = true,
  restoreFocus = true,
  onEscape,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;

    // Store the previously focused element
    if (restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    // Find all focusable elements
    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    // Auto-focus the first element
    if (autoFocus && firstElement) {
      firstElement.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      } else if (e.key === "Escape" && onEscape) {
        onEscape();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      // Restore focus to the previously focused element
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [autoFocus, restoreFocus, onEscape]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

// Screen reader only text
const ScreenReaderOnly: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <span
    className={cn(
      "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0",
      className,
    )}
  >
    {children}
  </span>
);

// Live region for dynamic content announcements
interface LiveRegionProps {
  children: React.ReactNode;
  priority?: "polite" | "assertive";
  className?: string;
  announce?: boolean;
}

const LiveRegion: React.FC<LiveRegionProps> = ({
  children,
  priority = "polite",
  className,
  announce = true,
}) => {
  const [content, setContent] = React.useState(children);
  const [key, setKey] = React.useState(0);

  React.useEffect(() => {
    if (announce && children !== content) {
      setContent(children);
      setKey((prev) => prev + 1);
    }
  }, [children, content, announce]);

  return (
    <div
      key={key}
      aria-live={priority}
      aria-atomic="true"
      className={cn("sr-only", className)}
    >
      {children}
    </div>
  );
};

// Enhanced button with accessibility features
interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  success?: boolean;
  successText?: string;
  error?: boolean;
  errorText?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "outline" | "ghost";
}

const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  loading = false,
  loadingText = "Loading...",
  success = false,
  successText = "Success",
  error = false,
  errorText = "Error",
  size = "md",
  variant = "primary",
  className,
  disabled,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const sizeClasses = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4",
    lg: "h-12 px-6 text-lg",
  };

  const variantClasses = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:bg-secondary/80",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
    ghost:
      "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      {...props}
    >
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mr-2"
          >
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </motion.div>
        )}
        {success && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mr-2"
          >
            <CheckCircle className="h-4 w-4" />
          </motion.div>
        )}
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mr-2"
          >
            <AlertTriangle className="h-4 w-4" />
          </motion.div>
        )}
      </AnimatePresence>

      <span className={cn((loading || success || error) && "sr-only")}>
        {loading
          ? loadingText
          : success
            ? successText
            : error
              ? errorText
              : children}
      </span>
    </button>
  );
};

// Progress announcement component
interface ProgressAnnouncerProps {
  value: number;
  max: number;
  label?: string;
  className?: string;
}

const ProgressAnnouncer: React.FC<ProgressAnnouncerProps> = ({
  value,
  max,
  label = "Progress",
  className,
}) => {
  const percentage = Math.round((value / max) * 100);
  const [previousPercentage, setPreviousPercentage] =
    React.useState(percentage);

  React.useEffect(() => {
    if (percentage !== previousPercentage) {
      setPreviousPercentage(percentage);
    }
  }, [percentage, previousPercentage]);

  return (
    <LiveRegion className={className} priority="polite">
      {label}: {percentage}% complete, {value} of {max}
    </LiveRegion>
  );
};

// Keyboard shortcut helper
interface KeyboardShortcutProps {
  keys: string[];
  description: string;
  className?: string;
}

const KeyboardShortcut: React.FC<KeyboardShortcutProps> = ({
  keys,
  description,
  className,
}) => (
  <div className={cn("flex items-center gap-2 text-sm", className)}>
    <span className="sr-only">{description} keyboard shortcut:</span>
    <kbd className="inline-flex items-center rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-mono">
      {keys.map((key, index) => (
        <React.Fragment key={key}>
          {index > 0 && <span className="mx-0.5">+</span>}
          {key}
        </React.Fragment>
      ))}
    </kbd>
    <span className="text-muted-foreground">{description}</span>
  </div>
);

interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: AccessibilityConfig;
  onConfigChange: (config: Partial<AccessibilityConfig>) => void;
}

const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  if (!isOpen) return null;

  return (
    <FocusTrap onEscape={onClose}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md rounded-lg bg-card p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Accessibility Settings</h2>
            <button
              onClick={onClose}
              className="rounded-md p-1 hover:bg-accent focus:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Close accessibility settings"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="high-contrast" className="text-sm font-medium">
                High Contrast
              </label>
              <input
                id="high-contrast"
                type="checkbox"
                checked={config.highContrast}
                onChange={(e) =>
                  onConfigChange({ highContrast: e.target.checked })
                }
                className="rounded border border-input"
              />
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="reduced-motion" className="text-sm font-medium">
                Reduced Motion
              </label>
              <input
                id="reduced-motion"
                type="checkbox"
                checked={config.reducedMotion}
                onChange={(e) =>
                  onConfigChange({ reducedMotion: e.target.checked })
                }
                className="rounded border border-input"
              />
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="focus-indicators" className="text-sm font-medium">
                Focus Indicators
              </label>
              <input
                id="focus-indicators"
                type="checkbox"
                checked={config.focusIndicators}
                onChange={(e) =>
                  onConfigChange({ focusIndicators: e.target.checked })
                }
                className="rounded border border-input"
              />
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="large-text" className="text-sm font-medium">
                Large Text
              </label>
              <input
                id="large-text"
                type="checkbox"
                checked={config.largeText}
                onChange={(e) =>
                  onConfigChange({ largeText: e.target.checked })
                }
                className="rounded border border-input"
              />
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="color-blind" className="text-sm font-medium">
                Color Blind Mode
              </label>
              <input
                id="color-blind"
                type="checkbox"
                checked={config.colorBlind}
                onChange={(e) =>
                  onConfigChange({ colorBlind: e.target.checked })
                }
                className="rounded border border-input"
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </FocusTrap>
  );
};

// Accessibility toolbar component
interface AccessibilityToolbarProps {
  config: AccessibilityConfig;
  onConfigChange: (config: Partial<AccessibilityConfig>) => void;
  className?: string;
}

const AccessibilityToolbar: React.FC<AccessibilityToolbarProps> = ({
  config,
  onConfigChange,
  className,
}) => {
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);

  return (
    <>
      <div className={cn("fixed bottom-4 right-4 z-40", className)}>
        <button
          onClick={() => setIsPanelOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Open accessibility settings"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      <AccessibilityPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        config={config}
        onConfigChange={onConfigChange}
      />
    </>
  );
};

// Error announcement component
interface ErrorAnnouncementProps {
  error: string | Error;
  level?: "error" | "warning" | "info";
  className?: string;
}

const ErrorAnnouncement: React.FC<ErrorAnnouncementProps> = ({
  error,
  level = "error",
  className,
}) => {
  const errorMessage = error instanceof Error ? error.message : error;
  const [announced, setAnnounced] = React.useState(false);

  React.useEffect(() => {
    if (!announced) {
      setAnnounced(true);
      const timer = setTimeout(() => setAnnounced(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, announced]);

  const priority = level === "error" ? "assertive" : "polite";

  return (
    <LiveRegion priority={priority} className={className}>
      {level === "error" && "Error: "}
      {level === "warning" && "Warning: "}
      {level === "info" && "Information: "}
      {errorMessage}
    </LiveRegion>
  );
};

export {
  SkipLink,
  FocusTrap,
  ScreenReaderOnly,
  LiveRegion,
  AccessibleButton,
  ProgressAnnouncer,
  KeyboardShortcut,
  AccessibilityPanel,
  AccessibilityToolbar,
  ErrorAnnouncement,
};

export type { AccessibilityConfig };
