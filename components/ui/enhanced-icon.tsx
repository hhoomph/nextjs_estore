/**
 * Enhanced Icon System with Advanced Features
 * Modern icons with animations, variants, and accessibility
 *
 * @author hh.oomph@gmail.com
 * @version 2.0.0
 * @since 2025-01-01
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Battery,
  Bell,
  Bookmark,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Cloud,
  CloudRain,
  Copy,
  CreditCard,
  Download,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  Filter,
  Gift,
  Heart,
  HelpCircle,
  Home,
  Info,
  Loader2,
  Lock,
  type LucideIcon,
  Mail,
  MapPin,
  Medal,
  Menu,
  Minus,
  Moon,
  MoreHorizontal,
  MoreVertical,
  Navigation,
  Package,
  Pause,
  Phone,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Share,
  Shield,
  ShieldCheck,
  ShoppingCart,
  SkipBack,
  SkipForward,
  SortAsc,
  SortDesc,
  Star,
  Sun,
  Target,
  Trash,
  Trophy,
  Truck,
  Unlock,
  Upload,
  User,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

export type IconName =
  | "check"
  | "x"
  | "alert-triangle"
  | "info"
  | "loader"
  | "chevron-down"
  | "chevron-up"
  | "chevron-left"
  | "chevron-right"
  | "plus"
  | "minus"
  | "search"
  | "heart"
  | "star"
  | "eye"
  | "eye-off"
  | "lock"
  | "unlock"
  | "user"
  | "mail"
  | "phone"
  | "calendar"
  | "clock"
  | "map-pin"
  | "shopping-cart"
  | "credit-card"
  | "truck"
  | "package"
  | "gift"
  | "bell"
  | "settings"
  | "home"
  | "menu"
  | "more-horizontal"
  | "more-vertical"
  | "external-link"
  | "download"
  | "upload"
  | "edit"
  | "trash"
  | "copy"
  | "share"
  | "bookmark"
  | "filter"
  | "sort-asc"
  | "sort-desc"
  | "refresh"
  | "play"
  | "pause"
  | "stop"
  | "skip-back"
  | "skip-forward"
  | "volume"
  | "volume-off"
  | "wifi"
  | "wifi-off"
  | "battery"
  | "zap"
  | "sun"
  | "moon"
  | "cloud"
  | "cloud-rain"
  | "navigation"
  | "target"
  | "award"
  | "trophy"
  | "medal"
  | "shield"
  | "shield-check"
  | "alert-circle"
  | "help-circle"
  | "check-circle"
  | "x-circle";

const iconMap: Record<IconName, LucideIcon> = {
  check: Check,
  x: X,
  "alert-triangle": AlertTriangle,
  info: Info,
  loader: Loader2,
  "chevron-down": ChevronDown,
  "chevron-up": ChevronUp,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  plus: Plus,
  minus: Minus,
  search: Search,
  heart: Heart,
  star: Star,
  eye: Eye,
  "eye-off": EyeOff,
  lock: Lock,
  unlock: Unlock,
  user: User,
  mail: Mail,
  phone: Phone,
  calendar: Calendar,
  clock: Clock,
  "map-pin": MapPin,
  "shopping-cart": ShoppingCart,
  "credit-card": CreditCard,
  truck: Truck,
  package: Package,
  gift: Gift,
  bell: Bell,
  settings: Settings,
  home: Home,
  menu: Menu,
  "more-horizontal": MoreHorizontal,
  "more-vertical": MoreVertical,
  "external-link": ExternalLink,
  download: Download,
  upload: Upload,
  edit: Edit,
  trash: Trash,
  copy: Copy,
  share: Share,
  bookmark: Bookmark,
  filter: Filter,
  "sort-asc": SortAsc,
  "sort-desc": SortDesc,
  refresh: RefreshCw,
  play: Play,
  pause: Pause,
  stop: Pause,
  "skip-back": SkipBack,
  "skip-forward": SkipForward,
  volume: Volume2,
  "volume-off": VolumeX,
  wifi: Wifi,
  "wifi-off": WifiOff,
  battery: Battery,
  zap: Zap,
  sun: Sun,
  moon: Moon,
  cloud: Cloud,
  "cloud-rain": CloudRain,
  navigation: Navigation,
  target: Target,
  award: Award,
  trophy: Trophy,
  medal: Medal,
  shield: Shield,
  "shield-check": ShieldCheck,
  "alert-circle": AlertCircle,
  "help-circle": HelpCircle,
  "check-circle": CheckCircle,
  "x-circle": XCircle,
};

export interface EnhancedIconProps
  extends React.HTMLAttributes<HTMLDivElement> {
  name: IconName;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  variant?: "default" | "outline" | "filled" | "duotone" | "animated";
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "info";
  animate?: boolean;
  spin?: boolean;
  pulse?: boolean;
  bounce?: boolean;
  hover?: boolean;
  interactive?: boolean;
  badge?: string | number;
  badgeColor?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error";
  tooltip?: string;
}

const sizeMap = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
  "2xl": "h-10 w-10",
};

const colorMap = {
  default: "text-foreground",
  primary: "text-primary",
  secondary: "text-secondary-foreground",
  success: "text-green-600 dark:text-green-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  error: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400",
};

const badgeColorMap = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  warning:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const EnhancedIconComponent = React.forwardRef<
  HTMLDivElement,
  EnhancedIconProps
>(
  (
    {
      className,
      name,
      size = "md",
      variant = "default",
      color = "default",
      animate = false,
      spin = false,
      pulse = false,
      bounce = false,
      hover = false,
      interactive = false,
      badge,
      badgeColor = "default",
      tooltip,
      ...props
    },
    ref,
  ) => {
    const IconComponent = iconMap[name];
    const [isHovered, setIsHovered] = React.useState(false);

    const animationVariants = {
      spin: { rotate: 360 },
      pulse: { scale: [1, 1.1, 1] },
      bounce: { y: [0, -2, 0] },
      hover: { scale: 1.1 },
    };

    const getAnimationProps = () => {
      if (spin)
        return {
          animate: { rotate: 360 },
          transition: { duration: 1, repeat: Infinity },
        };
      if (pulse)
        return {
          animate: { scale: [1, 1.1, 1] },
          transition: { duration: 0.6, repeat: Infinity },
        };
      if (bounce)
        return {
          animate: { y: [0, -2, 0] },
          transition: { duration: 0.4, repeat: Infinity },
        };
      if (hover && isHovered) return { scale: 1.1 };
      return {};
    };

    const iconElement = (
      <motion.div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center",
          interactive && "cursor-pointer",
          className,
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={interactive ? { scale: 1.05 } : undefined}
        whileTap={interactive ? { scale: 0.95 } : undefined}
        {...(props as any)}
      >
        <motion.div
          className={cn(
            sizeMap[size],
            colorMap[color],
            variant === "outline" && "stroke-2",
            variant === "filled" && "fill-current",
            variant === "duotone" && "opacity-80",
            variant === "animated" && "drop-shadow-sm",
          )}
          {...getAnimationProps()}
        >
          <IconComponent />
        </motion.div>

        {/* Badge */}
        <AnimatePresence>
          {badge && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className={cn(
                "absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-xs font-medium",
                badgeColorMap[badgeColor],
              )}
            >
              {typeof badge === "number" && badge > 99 ? "99+" : badge}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tooltip */}
        <AnimatePresence>
          {tooltip && isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md"
            >
              {tooltip}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-popover" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );

    return iconElement;
  },
);

EnhancedIconComponent.displayName = "EnhancedIcon";

// Memoized version for performance
const EnhancedIcon = React.memo(EnhancedIconComponent);

// Preset icon components for common use cases
const LoadingIcon: React.FC<Omit<EnhancedIconProps, "name">> = React.memo(
  (props) => <EnhancedIcon {...props} name="loader" spin={true} />,
);

const SuccessIcon: React.FC<Omit<EnhancedIconProps, "name">> = React.memo(
  (props) => <EnhancedIcon {...props} name="check-circle" color="success" />,
);

const ErrorIcon: React.FC<Omit<EnhancedIconProps, "name">> = React.memo(
  (props) => <EnhancedIcon {...props} name="x-circle" color="error" />,
);

const WarningIcon: React.FC<Omit<EnhancedIconProps, "name">> = React.memo(
  (props) => <EnhancedIcon {...props} name="alert-triangle" color="warning" />,
);

const InfoIcon: React.FC<Omit<EnhancedIconProps, "name">> = React.memo(
  (props) => <EnhancedIcon {...props} name="info" color="info" />,
);

const HeartIcon: React.FC<
  Omit<EnhancedIconProps, "name"> & { filled?: boolean }
> = React.memo(({ filled = false, ...props }) => (
  <EnhancedIcon
    {...props}
    name="heart"
    variant={filled ? "filled" : "default"}
  />
));

const StarIcon: React.FC<
  Omit<EnhancedIconProps, "name"> & { filled?: boolean }
> = React.memo(({ filled = false, ...props }) => (
  <EnhancedIcon
    {...props}
    name="star"
    variant={filled ? "filled" : "default"}
  />
));

// Icon Button Component
interface IconButtonProps extends Omit<EnhancedIconProps, "variant"> {
  onClick?: () => void;
  disabled?: boolean;
  buttonVariant?: "ghost" | "outline" | "solid";
}

const IconButton: React.FC<IconButtonProps> = React.memo(
  ({
    onClick,
    disabled = false,
    buttonVariant = "ghost",
    className,
    ...iconProps
  }) => {
    const variantClasses = {
      ghost: "hover:bg-accent hover:text-accent-foreground",
      outline:
        "border border-input hover:bg-accent hover:text-accent-foreground",
      solid: "bg-primary text-primary-foreground hover:bg-primary/90",
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variantClasses[buttonVariant],
          className,
        )}
      >
        <EnhancedIcon {...iconProps} />
      </button>
    );
  },
);

export {
  EnhancedIcon,
  LoadingIcon,
  SuccessIcon,
  ErrorIcon,
  WarningIcon,
  InfoIcon,
  HeartIcon,
  StarIcon,
  IconButton,
};
