/**
 * Enhanced Typography System with Advanced Features
 * Modern typography with animations, variants, and accessibility
 *
 * @author hh.oomph@gmail.com
 * @version 2.0.0
 * @since 2025-01-01
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";
import { cn } from "@/lib/utils";

export type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "blockquote"
  | "code"
  | "lead"
  | "large"
  | "small"
  | "muted"
  | "display"
  | "hero";

export type TypographyWeight =
  | "thin"
  | "light"
  | "normal"
  | "medium"
  | "semibold"
  | "bold"
  | "extrabold"
  | "black";

export type TypographyAlign = "left" | "center" | "right" | "justify";

export type TypographyColor =
  | "default"
  | "primary"
  | "secondary"
  | "muted"
  | "accent"
  | "success"
  | "warning"
  | "error"
  | "info";

export interface EnhancedTypographyProps
  extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  weight?: TypographyWeight;
  align?: TypographyAlign;
  color?: TypographyColor;
  size?:
    | "xs"
    | "sm"
    | "base"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "7xl"
    | "8xl"
    | "9xl";
  spacing?: "tight" | "normal" | "relaxed" | "loose";
  animate?: boolean;
  gradient?: boolean;
  glow?: boolean;
  typewriter?: boolean;
  typewriterSpeed?: number;
  highlight?: string[];
  highlightColor?: TypographyColor;
  underline?: boolean;
  strikethrough?: boolean;
  monospace?: boolean;
  truncate?: boolean | number;
  as?: React.ElementType;
  children: React.ReactNode;
}

const variantMap: Record<TypographyVariant, string> = {
  h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
  h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
  h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
  h4: "scroll-m-20 text-xl font-semibold tracking-tight",
  h5: "text-lg font-semibold",
  h6: "text-base font-semibold",
  p: "leading-7 [&:not(:first-child)]:mt-6",
  blockquote: "mt-6 border-l-2 pl-6 italic",
  code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
  lead: "text-xl text-muted-foreground",
  large: "text-lg font-semibold",
  small: "text-sm font-medium leading-none",
  muted: "text-sm text-muted-foreground",
  display: "text-6xl font-bold tracking-tight lg:text-7xl",
  hero: "text-5xl font-extrabold tracking-tight lg:text-8xl",
};

const weightMap: Record<TypographyWeight, string> = {
  thin: "font-thin",
  light: "font-light",
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
  black: "font-black",
};

const alignMap: Record<TypographyAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
  justify: "text-justify",
};

const colorMap: Record<TypographyColor, string> = {
  default: "text-foreground",
  primary: "text-primary",
  secondary: "text-secondary-foreground",
  muted: "text-muted-foreground",
  accent: "text-accent-foreground",
  success: "text-success",
  warning: "text-warning",
  error: "text-destructive",
  info: "text-primary",
};

// Static background classes for highlighted text. Tailwind cannot see
// dynamically built class names like `bg-${color}`, so we map them explicitly.
const highlightBgMap: Record<TypographyColor, string> = {
  default: "bg-foreground/10",
  primary: "bg-primary/10",
  secondary: "bg-secondary/10",
  muted: "bg-muted/50",
  accent: "bg-accent/10",
  success: "bg-success/10",
  warning: "bg-warning/10",
  error: "bg-destructive/10",
  info: "bg-primary/10",
};

const sizeMap = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
  "5xl": "text-5xl",
  "6xl": "text-6xl",
  "7xl": "text-7xl",
  "8xl": "text-8xl",
  "9xl": "text-9xl",
};

const spacingMap = {
  tight: "leading-tight",
  normal: "leading-normal",
  relaxed: "leading-relaxed",
  loose: "leading-loose",
};

const EnhancedTypographyComponent = React.forwardRef<
  HTMLElement,
  EnhancedTypographyProps
>(
  (
    {
      className,
      variant = "p",
      weight,
      align,
      color = "default",
      size,
      spacing,
      animate = false,
      gradient = false,
      glow = false,
      typewriter = false,
      typewriterSpeed = 50,
      highlight = [],
      highlightColor = "primary",
      underline = false,
      strikethrough = false,
      monospace = false,
      truncate = false,
      as,
      children,
      ...props
    },
    ref,
  ) => {
    const [displayedText, setDisplayedText] = React.useState("");
    const [currentIndex, setCurrentIndex] = React.useState(0);

    // Typewriter effect
    React.useEffect(() => {
      if (typewriter && typeof children === "string") {
        if (currentIndex < children.length) {
          const timeout = setTimeout(() => {
            setDisplayedText(children.slice(0, currentIndex + 1));
            setCurrentIndex(currentIndex + 1);
          }, typewriterSpeed);
          return () => clearTimeout(timeout);
        }
      } else if (!typewriter) {
        setDisplayedText(typeof children === "string" ? children : "");
      }
    }, [children, currentIndex, typewriter, typewriterSpeed]);

    // Escape a string for safe use inside a RegExp (prevents regex injection / ReDoS
    // from un-escaped user-provided highlight terms).
    const escapeRegExp = (value: string) =>
      value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Escape HTML so user-provided text injected via dangerouslySetInnerHTML stays safe.
    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    // Highlight text function
    const highlightText = (text: string) => {
      if (!highlight.length) return text;

      // Escape HTML first so injected markup is safe; the regex runs on the escaped text.
      let highlightedText = escapeHtml(text);
      for (const word of highlight) {
        const escapedWord = escapeRegExp(word);
        if (!escapedWord) continue;
        const regex = new RegExp(`(${escapedWord})`, "gi");
        highlightedText = highlightedText.replace(
          regex,
          `<mark class="${colorMap[highlightColor]} ${highlightBgMap[highlightColor]} rounded px-1">$1</mark>`,
        );
      }

      return highlightedText;
    };

    // Truncate text function
    const truncateText = (text: string) => {
      if (truncate === false) return text;
      if (truncate === true)
        return text.length > 100 ? `${text.slice(0, 100)}...` : text;
      return text.length > truncate ? `${text.slice(0, truncate)}...` : text;
    };

    const Component =
      (as as React.ElementType) || (variant.startsWith("h") ? variant : "div");

    const processedText = React.useMemo(() => {
      if (typeof children === "string") {
        let text = typewriter ? displayedText : children;
        // First truncate, then highlight
        text = truncateText(text);
        text = highlightText(text);
        return text;
      }
      return children;
    }, [
      children,
      displayedText,
      typewriter,
      highlight,
      highlightColor,
      truncate,
    ]);

    const baseClasses = cn(
      variantMap[variant],
      weight && weightMap[weight],
      align && alignMap[align],
      colorMap[color],
      size && sizeMap[size],
      spacing && spacingMap[spacing],
      monospace && "font-mono",
      underline && "underline underline-offset-4",
      strikethrough && "line-through",
      typeof truncate === "boolean" && truncate && "truncate",
      typeof truncate === "number" && "truncate",
      className,
    );

    const gradientClasses = gradient
      ? cn(
          "bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent",
          glow && "drop-shadow-lg",
        )
      : "";

    const content = (
      <Component
        ref={ref}
        className={cn(baseClasses, gradientClasses)}
        dangerouslySetInnerHTML={
          typeof processedText === "string" &&
          (highlight.length > 0 || truncate)
            ? { __html: processedText }
            : undefined
        }
        {...props}
      >
        {typeof processedText === "string" && !highlight.length && !truncate
          ? processedText
          : !processedText
            ? children
            : null}
      </Component>
    );

    if (animate) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {content}
        </motion.div>
      );
    }

    return content;
  },
);

EnhancedTypographyComponent.displayName = "EnhancedTypography";

// Memoized version for performance
const EnhancedTypography = React.memo(EnhancedTypographyComponent);

// Preset typography components with memoization
const Heading1: React.FC<Omit<EnhancedTypographyProps, "variant">> = React.memo(
  (props) => <EnhancedTypography {...props} variant="h1" />,
);

const Heading2: React.FC<Omit<EnhancedTypographyProps, "variant">> = React.memo(
  (props) => <EnhancedTypography {...props} variant="h2" />,
);

const Heading3: React.FC<Omit<EnhancedTypographyProps, "variant">> = React.memo(
  (props) => <EnhancedTypography {...props} variant="h3" />,
);

const Heading4: React.FC<Omit<EnhancedTypographyProps, "variant">> = React.memo(
  (props) => <EnhancedTypography {...props} variant="h4" />,
);

const Heading5: React.FC<Omit<EnhancedTypographyProps, "variant">> = React.memo(
  (props) => <EnhancedTypography {...props} variant="h5" />,
);

const Heading6: React.FC<Omit<EnhancedTypographyProps, "variant">> = React.memo(
  (props) => <EnhancedTypography {...props} variant="h6" />,
);

const Paragraph: React.FC<Omit<EnhancedTypographyProps, "variant">> =
  React.memo((props) => <EnhancedTypography {...props} variant="p" />);

const Blockquote: React.FC<Omit<EnhancedTypographyProps, "variant">> =
  React.memo((props) => <EnhancedTypography {...props} variant="blockquote" />);

const Code: React.FC<Omit<EnhancedTypographyProps, "variant">> = React.memo(
  (props) => <EnhancedTypography {...props} variant="code" monospace={true} />,
);

const Lead: React.FC<Omit<EnhancedTypographyProps, "variant">> = React.memo(
  (props) => <EnhancedTypography {...props} variant="lead" />,
);

const Large: React.FC<Omit<EnhancedTypographyProps, "variant">> = React.memo(
  (props) => <EnhancedTypography {...props} variant="large" />,
);

const Small: React.FC<Omit<EnhancedTypographyProps, "variant">> = React.memo(
  (props) => <EnhancedTypography {...props} variant="small" />,
);

const Muted: React.FC<Omit<EnhancedTypographyProps, "variant">> = React.memo(
  (props) => <EnhancedTypography {...props} variant="muted" />,
);

const Display: React.FC<Omit<EnhancedTypographyProps, "variant">> = React.memo(
  (props) => <EnhancedTypography {...props} variant="display" />,
);

const Hero: React.FC<Omit<EnhancedTypographyProps, "variant">> = React.memo(
  (props) => <EnhancedTypography {...props} variant="hero" gradient={true} />,
);

// Special effect components with memoization
const TypewriterText: React.FC<Omit<EnhancedTypographyProps, "typewriter">> =
  React.memo((props) => <EnhancedTypography {...props} typewriter={true} />);

const GradientText: React.FC<Omit<EnhancedTypographyProps, "gradient">> =
  React.memo((props) => <EnhancedTypography {...props} gradient={true} />);

const GlowText: React.FC<Omit<EnhancedTypographyProps, "glow">> = React.memo(
  (props) => <EnhancedTypography {...props} gradient={true} glow={true} />,
);

// Accessibility helpers with memoization
const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = React.memo(
  ({ children }) => <span className="sr-only">{children}</span>,
);

const VisuallyHidden: React.FC<{ children: React.ReactNode }> = React.memo(
  ({ children }) => (
    <span className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0">
      {children}
    </span>
  ),
);

export {
  EnhancedTypography,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Paragraph,
  Blockquote,
  Code,
  Lead,
  Large,
  Small,
  Muted,
  Display,
  Hero,
  TypewriterText,
  GradientText,
  GlowText,
  ScreenReaderOnly,
  VisuallyHidden,
};
